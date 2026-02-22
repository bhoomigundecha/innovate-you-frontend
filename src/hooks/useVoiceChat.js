import { useRef, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { useAudioInput } from "./useAudioInput";
import { useAudioOutput } from "./useAudioOutput";

/**
 * useVoiceChat (Refactored) – Orchestrates voice communication over Socket.IO.
 *
 * Now uses separate hooks:
 * - useAudioInput for microphone capture
 * - useAudioOutput for speaker playback
 * - useVoiceChat for Socket.IO coordination
 *
 * Push-to-talk: hold Space to record, release to send + flush.
 *
 * Usage:
 *   const { status, error, isSpeaking, start, stop, requestReport, report } = useVoiceChat({
 *     voiceId: "alloy",
 *     id: 42,
 *     wsUrl: "http://localhost:3000",
 *     onReport: (report) => { ... } // optional
 *   });
 */

const DEFAULT_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WS_BACKEND_URL) ||
  "http://localhost:3000";

const TARGET_SAMPLE_RATE = 16000;

// ──────────────────────────────────────────────
// Audio Utilities
// ──────────────────────────────────────────────

function mergeFloat32Arrays(chunks) {
  let totalLength = 0;
  for (const chunk of chunks) totalLength += chunk.length;
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Convert a Float32Array of PCM samples into a base64-encoded WAV (16-bit, mono).
 */
function float32ToWavBase64(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const CHUNK = 8192;
  for (let off = 0; off < bytes.length; off += CHUNK) {
    const slice = bytes.subarray(off, Math.min(off + CHUNK, bytes.length));
    for (let j = 0; j < slice.length; j++) {
      binary += String.fromCharCode(slice[j]);
    }
  }
  return btoa(binary);
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useVoiceChat({ voiceId, id, wsUrl, onReport } = {}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [report, setReport] = useState(null);
  const [expression, setExpression] = useState(null);

  // Stable refs
  const socketRef = useRef(null);
  const audioCtxRef = useRef(null);
  const genRef = useRef(0);
  const paramsRef = useRef({ voiceId: null, id: null, wsUrl: null });

  // Initialize audio input/output hooks
  const {
    initialize: initAudioInput,
    startRecording,
    stopRecording,
    getBufferedChunks,
    peekBufferedChunks,
    isRecording,
    cleanup: cleanupAudioInput,
    audioCtxRef: inputAudioCtxRef,
  } = useAudioInput();

  const {
    playBase64Audio,
    cleanup: cleanupAudioOutput,
  } = useAudioOutput();

  // ── Send buffered audio as one complete WAV ──
  const flushAudio = useCallback(() => {
    const socket = socketRef.current;
    const chunks = peekBufferedChunks();

    if (!socket?.connected || chunks.length === 0) {
      return;
    }

    // Merge all buffered chunks into one complete Float32Array
    const allSamples = mergeFloat32Arrays(chunks);

    // Build one complete WAV
    const base64 = float32ToWavBase64(allSamples, TARGET_SAMPLE_RATE);

    console.log(
      `[useVoiceChat] 📤 Sending complete WAV: ${allSamples.length} samples ` +
      `(${(allSamples.length / TARGET_SAMPLE_RATE).toFixed(2)}s), ` +
      `${base64.length} chars base64`
    );

    socket.emit("audio_data", {
      audio: base64,
      sample_rate: TARGET_SAMPLE_RATE,
      encoding: "audio/wav",
    });

    // Clear chunks after sending
    getBufferedChunks();

    // Flush after a short delay to match the working test pattern
    setTimeout(() => {
      if (socket.connected) {
        socket.emit("audio_flush");
        console.log("[useVoiceChat] 📨 audio_flush sent");
      }
    }, 200);
  }, [peekBufferedChunks, getBufferedChunks]);

  // ── Request end-of-conversation report ──
  const requestReport = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.connected) {
      console.log("[useVoiceChat] 📣 end_conversation requested on socket:", socket.id);
      socket.emit("end_conversation");
    } else {
      console.warn("[useVoiceChat] ⚠️ socket not connected - cannot request report. Present?", !!socket);
    }
  }, []);

  // ── Cleanup ─────────────────────────────────
  const cleanup = useCallback((reason = "manual") => {
    console.log(`[useVoiceChat] 🧹 Full cleanup starting (Reason: ${reason})...`);
    genRef.current += 1;

    cleanupAudioInput();
    cleanupAudioOutput();

    if (socketRef.current) {
      console.log(`[useVoiceChat] 🔌 Disconnecting socket: ${socketRef.current.id} (gen: ${genRef.current})`);
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { });
      audioCtxRef.current = null;
    }

    // Reset params ref on cleanup so we can re-connect if needed
    paramsRef.current = { voiceId: null, id: null, wsUrl: null };

    setStatus("idle");
    setIsSpeaking(false);
    setExpression(null);
    setReport(null);
  }, [cleanupAudioInput, cleanupAudioOutput]);

  // ── Push-to-talk keyboard handlers ──────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      e.preventDefault();

      if (!isRecording()) {
        if (!audioCtxRef.current) {
          console.warn("[useVoiceChat] ⚠️ AudioContext not ready. Recording skipped.");
          return;
        }
        startRecording();
        setIsSpeaking(true);
        setExpression(null);
        console.log("[useVoiceChat] 🎙 Space held — recording");
      }
    };

    const onKeyUp = (e) => {
      if (e.code !== "Space") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      e.preventDefault();

      if (isRecording()) {
        stopRecording();
        setIsSpeaking(false);
        console.log("[useVoiceChat] 🛑 Space released — sending WAV");
        flushAudio();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isRecording, startRecording, stopRecording, flushAudio]);

  // ── Start ───────────────────────────────────
  const start = useCallback(async () => {
    const currentUrl = wsUrl || DEFAULT_URL;

    // Optimization: Skip if already connected with same params
    if (
      socketRef.current &&
      paramsRef.current.id === id &&
      paramsRef.current.voiceId === voiceId &&
      paramsRef.current.wsUrl === currentUrl
    ) {
      console.log("[useVoiceChat] ⏭ Skip start: Already connected (Stable)");
      return;
    }

    console.log("[useVoiceChat] 🚀 Start connection request. Params:", { id, voiceId, wsUrl: currentUrl });

    // Cleanup previous instance before starting new one
    cleanup("reconnect");

    const gen = genRef.current;
    setStatus("connecting");
    setError(null);
    setReport(null);

    // Update params ref immediately to prevent race conditions
    paramsRef.current = { id, voiceId, wsUrl: currentUrl };

    // 1. Initialize audio input
    const audioInputResult = await initAudioInput();
    if (!audioInputResult.success) {
      if (gen !== genRef.current) return;
      console.error("[useVoiceChat] ❌ Audio input init failed:", audioInputResult.error);
      setError(audioInputResult.error);
      setStatus("error");
      return;
    }

    // Store AudioContext ref
    if (inputAudioCtxRef.current) {
      audioCtxRef.current = inputAudioCtxRef.current;
    }

    // 2. Socket.IO
    console.log("[useVoiceChat] 🔌 Connecting to", currentUrl, "(gen:", gen, ")");
    const socket = io(currentUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (gen !== genRef.current) {
        console.warn("[useVoiceChat] ⚠️ stale connect (gen mismatch), disconnecting socket:", socket.id);
        socket.disconnect();
        return;
      }
      console.log("[useVoiceChat] ✅ Connected (id:", socket.id, ") — sending init");
      socket.emit("init", { chat_id: String(id), voice_id: String(voiceId) });
    });

    socket.on("ready", () => {
      if (gen !== genRef.current) return;
      console.log("[useVoiceChat] 🟢 Backend ready");
      setStatus("streaming");
    });

    socket.on("tts_audio", (data) => {
      if (gen !== genRef.current || !data?.audio) return;
      if (audioCtxRef.current) {
        playBase64Audio(audioCtxRef.current, data.audio);
      }
    });

    socket.on("end_conversation_summary", (payload) => {
      console.log("[useVoiceChat] 📄 end_conversation_summary (gen:", gen, "current:", genRef.current, "):", payload);

      if (gen !== genRef.current || !payload) {
        if (gen !== genRef.current) console.warn("[useVoiceChat] 🛑 Stale event ignored (gen mismatch)");
        return;
      }

      if (payload?.json) {
        console.log("[useVoiceChat] ✅ setting report from json:", payload.json);
        setReport(payload.json);
        if (typeof onReport === "function") onReport(payload.json);
      } else if (payload?.text) {
        try {
          const parsed = JSON.parse(payload.text);
          console.log("[useVoiceChat] ✅ setting report from parsed text:", parsed);
          setReport(parsed);
          if (typeof onReport === "function") onReport(parsed);
        } catch (err) {
          console.warn("[useVoiceChat] Non-JSON payload.passing raw text");
          const fallback = { raw: payload.text, metadata: { error: "raw" } };
          setReport(fallback);
          if (typeof onReport === "function") onReport(fallback);
        }
      }
    });

    socket.on("expression", (data) => {
      if (gen !== genRef.current) return;
      const expr = typeof data === "string" ? data : data?.expression;
      if (expr) setExpression(expr);
    });

    socket.on("disconnect", (reason) => {
      if (gen !== genRef.current) return;
      console.log("[useVoiceChat] 🔒 Disconnected (gen:", gen, "):", reason);
      setStatus("idle");
    });
  }, [voiceId, id, wsUrl, cleanup, initAudioInput, inputAudioCtxRef, playBase64Audio, onReport]);

  // ── Auto-start on mount / Param Change ──────
  // Effect 1: Start/Reconnect on parameter change
  useEffect(() => {
    console.log("[useVoiceChat] 🔄 Triggering start() due to param change or mount");
    start();
  }, [id, voiceId, wsUrl, start]);

  // Effect 2: Final cleanup on unmount ONLY
  useEffect(() => {
    return () => {
      console.log("[useVoiceChat] Final unmount cleanup triggered");
      cleanup("unmount");
    };
  }, [cleanup]);

  return { status, error, isSpeaking, expression, start, stop: cleanup, requestReport, report };
}