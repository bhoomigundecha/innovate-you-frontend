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
 *   const { status, error, isSpeaking, start, stop } = useVoiceChat({
 *     voiceId: "alloy",
 *     id: 42,
 *     wsUrl: "http://localhost:3000",
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

export function useVoiceChat({ voiceId, id, wsUrl } = {}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expression, setExpression] = useState(null);

  // Stable refs
  const socketRef = useRef(null);
  const audioCtxRef = useRef(null);
  const genRef = useRef(0);

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

  // ── Cleanup ─────────────────────────────────
  const cleanup = useCallback(() => {
    genRef.current += 1;

    cleanupAudioInput();
    cleanupAudioOutput();

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { });
      audioCtxRef.current = null;
    }

    setStatus("idle");
    setIsSpeaking(false);
    setExpression(null);
  }, [cleanupAudioInput, cleanupAudioOutput]);

  // ── Push-to-talk keyboard handlers ──────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      e.preventDefault();

      if (!isRecording()) {
        startRecording();
        setIsSpeaking(true);
        setExpression(null); // Clear expression when user starts speaking
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
        console.log("[useVoiceChat] 🛑 Space released — sending complete WAV + flush");

        // Send all buffered audio as one complete WAV, then flush
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
    cleanup();
    const gen = genRef.current;

    setStatus("connecting");
    setError(null);

    // 1. Initialize audio input
    const audioInputResult = await initAudioInput();
    if (!audioInputResult.success) {
      if (gen !== genRef.current) return;
      console.error("[useVoiceChat] Audio input init failed:", audioInputResult.error);
      setError(audioInputResult.error);
      setStatus("error");
      return;
    }

    // Store AudioContext ref for output
    if (inputAudioCtxRef.current) {
      audioCtxRef.current = inputAudioCtxRef.current;
    }

    // 2. Socket.IO
    const url = wsUrl || DEFAULT_URL;
    console.log("[useVoiceChat] 🔌 Connecting to", url);

    const socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (gen !== genRef.current) {
        socket.disconnect();
        return;
      }
      console.log("[useVoiceChat] ✅ Connected (id:", socket.id, ") — sending init");
      socket.emit("init", { chat_id: String(id), voice_id: String(voiceId) });
    });

    socket.on("ready", () => {
      if (gen !== genRef.current) return;
      console.log("[useVoiceChat] 🟢 Backend ready — hold Space to talk");
      setStatus("streaming");
    });

    socket.on("tts_audio", (data) => {
      if (gen !== genRef.current || !data?.audio) return;
      if (audioCtxRef.current) {
        playBase64Audio(audioCtxRef.current, data.audio);
      }
    });

    socket.on("tts_complete", () => {
      if (gen !== genRef.current) return;
      console.log("[useVoiceChat] ✅ TTS complete");
    });

    socket.on("expression", (data) => {
      if (gen !== genRef.current) return;
      const expr = typeof data === "string" ? data : data?.expression;
      console.log("[useVoiceChat] 🎭 Expression received:", expr);
      if (expr) setExpression(expr);
    });

    socket.on("connect_error", (err) => {
      if (gen !== genRef.current) return;
      console.error("[useVoiceChat] ❌ Connection error:", err.message);
      setError(new Error(`Socket.IO error: ${err.message}`));
      setStatus("error");
    });

    socket.on("disconnect", (reason) => {
      if (gen !== genRef.current) return;
      console.log("[useVoiceChat] 🔒 Disconnected:", reason);
      setStatus("idle");
    });
  }, [voiceId, id, wsUrl, cleanup, initAudioInput, inputAudioCtxRef, playBase64Audio]);

  // ── Auto-start on mount ─────────────────────
  useEffect(() => {
    start();
    return cleanup;
  }, [start, cleanup]);

  return { status, error, isSpeaking, expression, start, stop: cleanup };
}
