import { useRef, useCallback } from "react";

/**
 * useAudioOutput – Manages audio playback (TTS output).
 *
 * Handles:
 * - Decoding base64-encoded WAV audio
 * - Creating and playing BufferSource through speakers
 * - Tracking active playback
 * - Cleanup of active sources
 *
 * Usage:
 *   const audioOutput = useAudioOutput(audioCtx);
 *   const source = await audioOutput.playBase64Audio(base64String);
 *   audioOutput.stopAllPlayback();
 *   audioOutput.cleanup();
 */

export function useAudioOutput() {
  const activeSourceRef = useRef(null);
  const playQueueRef = useRef([]); // Queue of { audioBuffer, onComplete } objects
  const isPlayingRef = useRef(false); // Playback state flag

  /**
   * Play the next audio buffer in the queue
   */
  const playNextInQueue = useCallback((audioCtx) => {
    if (playQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const { audioBuffer, onComplete } = playQueueRef.current.shift();

    try {
      // Create and connect source
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      // Track active source
      activeSourceRef.current = source;

      // When done, call completion callback and play next in queue
      source.onended = () => {
        if (activeSourceRef.current === source) {
          activeSourceRef.current = null;
        }
        // Fire completion callback
        if (typeof onComplete === "function") {
          onComplete();
        }
        playNextInQueue(audioCtx);
      };

      // Play
      source.start(0);
      console.log(
        `[useAudioOutput] 🔊 Playing audio (${audioBuffer.duration.toFixed(2)}s) — ${playQueueRef.current.length} left in queue`
      );
    } catch (err) {
      console.warn("[useAudioOutput] ❌ Error playing queued audio:", err);
      playNextInQueue(audioCtx); // Skip and try next
    }
  }, []);

  /**
   * Decode base64 WAV and add to queue
   * @param {AudioContext} audioCtx - The audio context
   * @param {string} base64 - Base64-encoded WAV audio
   * @param {Function} onComplete - Optional callback when audio finishes playing
   */
  const playBase64Audio = useCallback(
    (audioCtx, base64, onComplete) => {
      if (!audioCtx) {
        console.warn(
          "[useAudioOutput] ⚠️ AudioContext not provided or not initialized"
        );
        return Promise.resolve(null);
      }

      return (async () => {
        try {
          // 1. Decode base64 to bytes
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          // 2. Decode WAV into AudioBuffer
          const audioBuffer = await audioCtx.decodeAudioData(
            bytes.buffer.slice(0)
          );

          // 3. Add to queue with completion callback
          playQueueRef.current.push({ audioBuffer, onComplete });
          console.log(`[useAudioOutput] 📥 Added audio to queue (Length: ${playQueueRef.current.length})`);

          // 4. Start playback if not already playing
          if (!isPlayingRef.current) {
            playNextInQueue(audioCtx);
          }
        } catch (err) {
          console.warn("[useAudioOutput] ❌ Could not decode audio:", err);
        }
      })();
    },
    [playNextInQueue]
  );

  /**
   * Stop currently playing audio
   */
  const stopAllPlayback = useCallback(() => {
    // Clear queue
    playQueueRef.current = [];
    isPlayingRef.current = false;

    // Stop active audio
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.onended = null; // Prevent onended from firing
        activeSourceRef.current.stop();
        console.log("[useAudioOutput] ⏸️ Playback stopped and queue cleared");
      } catch (err) {
        console.warn("[useAudioOutput] ⚠️ Error stopping playback:", err);
      }
      activeSourceRef.current = null;
    }
  }, []);

  /**
   * Check if audio is currently playing
   */
  const isPlaying = useCallback(() => {
    return isPlayingRef.current || activeSourceRef.current !== null;
  }, []);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    stopAllPlayback();
    console.log("[useAudioOutput] 🧹 Cleaned up");
  }, [stopAllPlayback]);

  return {
    playBase64Audio,
    stopAllPlayback,
    isPlaying,
    cleanup,
  };
}
