import { useRef, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";

/**
 * useVoiceChat – plug-and-play voice streaming over Socket.IO.
 *
 * Usage:
 *   const { status, error, isSpeaking, start, stop } = useVoiceChat({
 *     voiceId: "alloy",
 *     id: 42,
 *     wsUrl: "http://localhost:3000",   // optional, falls back to env
 *   });
 */

const DEFAULT_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_WS_BACKEND_URL) ||
    "http://localhost:3000";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Convert a Blob to a base64 string (data-url prefix stripped). */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/** Decode a base64 audio string and play it through an AudioContext. */
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

const SAMPLE_RATE = 16000;

/** Encode a Float32Array of PCM samples into a base64 WAV string. */
function float32ToWavBase64(samples, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = samples.length * (bitsPerSample / 8);
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeStr(36, "data");
    view.setUint32(40, dataSize, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
    }

    // To base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
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
    const speakingRafRef = useRef(null);
    const activeSourceRef = useRef(null);
    const wasSpeakingRef = useRef(false);

    // Generation counter — prevents stale async callbacks from acting
    const genRef = useRef(0);

    // ── Cleanup ─────────────────────────────────
    const cleanup = useCallback(() => {
        // Bump generation so any in-flight callbacks from old session become stale
        genRef.current += 1;

        if (speakingRafRef.current) {
            cancelAnimationFrame(speakingRafRef.current);
            speakingRafRef.current = null;
        }

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

        setStatus("idle");
        setIsSpeaking(false);
    }, []);

    // ── Speaking detection ──────────────────────
    const startSpeakingDetection = useCallback((analyser, gen) => {
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const THRESHOLD = 30;

        const tick = () => {
            if (gen !== genRef.current) return;
            analyser.getByteFrequencyData(buf);
            const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
            const speaking = avg > THRESHOLD;
            setIsSpeaking(speaking);

            // Emit audio_flush when user stops speaking
            if (wasSpeakingRef.current && !speaking && socketRef.current?.connected) {
                console.log("[useVoiceChat] 🛑 Speech ended — flushing");
                socketRef.current.emit("audio_flush");
            }
            wasSpeakingRef.current = speaking;

            speakingRafRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, []);

    // ── Start ───────────────────────────────────
    const start = useCallback(async () => {
        cleanup(); // kill any previous session
        const gen = genRef.current; // capture current generation

        setStatus("connecting");
        setError(null);

        // 1. Mic
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

        // 2. AudioContext at 16 kHz for mic capture
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
        audioCtxRef.current = audioCtx;

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
            console.log("[useVoiceChat] 🟢 Backend ready — starting audio stream");
            setStatus("streaming");

            // Mic → ScriptProcessor → PCM WAV base64 → socket
            const micSource = audioCtx.createMediaStreamSource(stream);
            micSourceRef.current = micSource;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;

            // 4096 samples per buffer at 16 kHz ≈ 256ms chunks
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (gen !== genRef.current || !socket.connected) return;
                const pcm = e.inputBuffer.getChannelData(0);
                const base64 = float32ToWavBase64(pcm, SAMPLE_RATE);
                socket.emit("audio_data", {
                    audio: base64,
                    sample_rate: SAMPLE_RATE,
                    encoding: "audio/wav",
                });
            };

            micSource.connect(analyser);
            analyser.connect(processor);
            processor.connect(audioCtx.destination);

            console.log("[useVoiceChat] 🎤 PCM capture started (16 kHz, WAV)");
            startSpeakingDetection(analyser, gen);
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
    }, [voiceId, id, wsUrl, cleanup, startSpeakingDetection]);

    // ── Auto-start on mount ─────────────────────
    useEffect(() => {
        start();
        return cleanup;
    }, [start, cleanup]);

    return { status, error, isSpeaking, start, stop: cleanup };
}
