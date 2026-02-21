import { useRef, useCallback } from "react";

/**
 * useAudioInput – Manages microphone input capture and PCM buffering.
 *
 * Handles:
 * - getUserMedia() permission and stream setup
 * - AudioContext and ScriptProcessor for PCM capture
 * - Buffering PCM chunks while recording gate is open
 * - Cleanup of all audio resources
 *
 * Usage:
 *   const audioInput = useAudioInput();
 *   await audioInput.initialize();  // Get mic permission, setup capture
 *   audioInput.startRecording();    // Open gate, start buffering PCM
 *   const chunks = audioInput.getBufferedChunks();
 *   audioInput.cleanup();
 */

const TARGET_SAMPLE_RATE = 16000;

export function useAudioInput() {
  const mediaStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const processorRef = useRef(null);
  const micSourceRef = useRef(null);
  const gateOpenRef = useRef(false);
  const pcmChunksRef = useRef([]);

  /**
   * Initialize: Request mic permission, create AudioContext, setup ScriptProcessor
   */
  const initialize = useCallback(async () => {
    try {
      // 1. Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      console.log("[useAudioInput] 🎙 Mic granted");

      // 2. Create AudioContext at 16 kHz
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: TARGET_SAMPLE_RATE,
      });
      audioCtxRef.current = audioCtx;
      console.log(
        `[useAudioInput] 🔊 AudioContext initialized (${audioCtx.sampleRate} Hz)`
      );

      // 3. Setup mic source and processor
      const micSource = audioCtx.createMediaStreamSource(stream);
      micSourceRef.current = micSource;

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        // Only buffer PCM while gate is open
        if (!gateOpenRef.current) return;

        const pcm = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(pcm));
      };

      // Connect: mic → processor → silent gain → destination.
      // (ScriptProcessor MUST be connected to destination or it won't fire events,
      // but we use a gain of 0 so the user doesn't hear their own mic echo).
      micSource.connect(processor);
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      console.log(
        `[useAudioInput] 🎤 PCM capture ready (push-to-talk mode)`
      );

      return { success: true, sampleRate: audioCtx.sampleRate };
    } catch (err) {
      console.error("[useAudioInput] ❌ Initialization failed:", err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Open gate and start recording (clear previous chunks)
   */
  const startRecording = useCallback(() => {
    if (!audioCtxRef.current) {
      console.warn("[useAudioInput] ⚠️ AudioContext not initialized");
      return;
    }
    gateOpenRef.current = true;
    pcmChunksRef.current = [];
    console.log("[useAudioInput] 🎙 Recording started (gate open)");
  }, []);

  /**
   * Close gate and stop recording
   */
  const stopRecording = useCallback(() => {
    gateOpenRef.current = false;
    console.log("[useAudioInput] 🛑 Recording stopped (gate closed)");
  }, []);

  /**
   * Get and clear buffered PCM chunks
   */
  const getBufferedChunks = useCallback(() => {
    const chunks = pcmChunksRef.current;
    pcmChunksRef.current = [];
    return chunks;
  }, []);

  /**
   * Get current buffered chunks without clearing
   */
  const peekBufferedChunks = useCallback(() => {
    return pcmChunksRef.current;
  }, []);

  /**
   * Check if recording gate is currently open
   */
  const isRecording = useCallback(() => {
    return gateOpenRef.current;
  }, []);

  /**
   * Cleanup all audio resources
   */
  const cleanup = useCallback(() => {
    gateOpenRef.current = false;
    pcmChunksRef.current = [];

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch { }
      processorRef.current = null;
    }

    if (micSourceRef.current) {
      try {
        micSourceRef.current.disconnect();
      } catch { }
      micSourceRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { });
      audioCtxRef.current = null;
    }

    console.log("[useAudioInput] 🧹 Cleaned up all audio resources");
  }, []);

  return {
    initialize,
    startRecording,
    stopRecording,
    getBufferedChunks,
    peekBufferedChunks,
    isRecording,
    cleanup,
    // Expose refs if needed for advanced use
    audioCtxRef,
    mediaStreamRef,
  };
}
