import { useRef, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";

/**
 * useVoiceChat – plug-and-play voice streaming over Socket.IO.
 *
 * Push-to-talk: hold Space to record, release to send + flush.
 *
 * Audio is captured at 16 kHz via AudioContext, buffered while Space is held,
 * then sent as ONE complete WAV (base64) on release — matching the backend's
 * expected format (single audio_data + audio_flush).
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

async function playBase64Audio(audioCtx, base64) {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    try {
        const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
        return source;
    } catch (err) {
        console.warn("[useVoiceChat] Could not decode received audio:", err);
        return null;
    }
}

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

    const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
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

    // Stable refs
    const socketRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const processorRef = useRef(null);
    const micSourceRef = useRef(null);
    const activeSourceRef = useRef(null);
    const gateOpenRef = useRef(false);       // spacebar controls this
    const pcmChunksRef = useRef([]);          // buffered PCM chunks while recording

    // Generation counter
    const genRef = useRef(0);

    // ── Send buffered audio as one complete WAV ──
    const flushAudio = useCallback(() => {
        const socket = socketRef.current;
        const chunks = pcmChunksRef.current;

        if (!socket?.connected || chunks.length === 0) {
            pcmChunksRef.current = [];
            return;
        }

        // Merge all buffered chunks into one complete Float32Array
        const allSamples = mergeFloat32Arrays(chunks);
        pcmChunksRef.current = [];

        // Build one complete WAV — exactly like the working test sends a full .wav file
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

        // Flush after a short delay to match the working test pattern
        setTimeout(() => {
            if (socket.connected) {
                socket.emit("audio_flush");
                console.log("[useVoiceChat] � audio_flush sent");
            }
        }, 200);
    }, []);

    // ── Cleanup ─────────────────────────────────
    const cleanup = useCallback(() => {
        genRef.current += 1;

        if (processorRef.current) {
            try { processorRef.current.disconnect(); } catch { /* */ }
            processorRef.current = null;
        }
        if (micSourceRef.current) {
            try { micSourceRef.current.disconnect(); } catch { /* */ }
            micSourceRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => { });
            audioCtxRef.current = null;
        }

        if (activeSourceRef.current) {
            try { activeSourceRef.current.stop(); } catch { /* */ }
            activeSourceRef.current = null;
        }

        pcmChunksRef.current = [];
        gateOpenRef.current = false;
        setStatus("idle");
        setIsSpeaking(false);
    }, []);

    // ── Push-to-talk keyboard handlers ──────────
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code !== "Space" || e.repeat) return;
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
            e.preventDefault();

            if (!gateOpenRef.current) {
                gateOpenRef.current = true;
                pcmChunksRef.current = [];  // clear buffer for new recording
                setIsSpeaking(true);
                console.log("[useVoiceChat] 🎙 Space held — recording");
            }
        };

        const onKeyUp = (e) => {
            if (e.code !== "Space") return;
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
            e.preventDefault();

            if (gateOpenRef.current) {
                gateOpenRef.current = false;
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
    }, [flushAudio]);

    // ── Start ───────────────────────────────────
    const start = useCallback(async () => {
        cleanup();
        const gen = genRef.current;

        setStatus("connecting");
        setError(null);

        // 1. Mic — request mono with noise/echo cancellation
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            if (gen !== genRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
            mediaStreamRef.current = stream;
            console.log("[useVoiceChat] 🎙 Mic granted");
        } catch (err) {
            if (gen !== genRef.current) return;
            console.error("[useVoiceChat] Mic denied:", err);
            setError(err);
            setStatus("error");
            return;
        }

        // 2. AudioContext at 16 kHz — the browser resamples from mic's native rate
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: TARGET_SAMPLE_RATE,
        });
        audioCtxRef.current = audioCtx;
        console.log(`[useVoiceChat] 🔊 AudioContext sampleRate: ${audioCtx.sampleRate}`);

        // 3. Socket.IO
        const url = wsUrl || DEFAULT_URL;
        console.log("[useVoiceChat] 🔌 Connecting to", url);

        const socket = io(url, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            if (gen !== genRef.current) { socket.disconnect(); return; }
            console.log("[useVoiceChat] ✅ Connected (id:", socket.id, ") — sending init");
            socket.emit("init", { voice_id: String(voiceId), id: Number(id) });
        });

        socket.on("ready", () => {
            if (gen !== genRef.current) return;
            console.log("[useVoiceChat] 🟢 Backend ready — hold Space to talk");
            setStatus("streaming");

            // Mic → ScriptProcessor → buffer PCM chunks (sent on Space release)
            const micSource = audioCtx.createMediaStreamSource(stream);
            micSourceRef.current = micSource;

            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (gen !== genRef.current) return;
                // Only buffer while Space is held
                if (!gateOpenRef.current) return;

                // Copy the PCM data (getChannelData returns a live view, must copy)
                const pcm = e.inputBuffer.getChannelData(0);
                pcmChunksRef.current.push(new Float32Array(pcm));
            };

            micSource.connect(processor);
            processor.connect(audioCtx.destination);

            console.log(`[useVoiceChat] 🎤 PCM capture ready (${audioCtx.sampleRate} Hz, buffered WAV, push-to-talk)`);
        });

        socket.on("tts_audio", (data) => {
            if (gen !== genRef.current || !data?.audio) return;
            playBase64Audio(audioCtx, data.audio).then((src) => {
                activeSourceRef.current = src;
            });
        });

        socket.on("tts_complete", () => {
            if (gen !== genRef.current) return;
            console.log("[useVoiceChat] 🔊 TTS complete");
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
    }, [voiceId, id, wsUrl, cleanup]);

    // ── Auto-start on mount ─────────────────────
    useEffect(() => {
        start();
        return cleanup;
    }, [start, cleanup]);

    return { status, error, isSpeaking, start, stop: cleanup };
}
