import { useEffect, useRef, useState } from "react";

// Number of frequency bins exposed to the UI. Must be a power of 2 / 2 since
// AnalyserNode returns fftSize/2 bins — we down-sample into this many bars.
const BAR_COUNT = 24;
// FFT size — 128 gives 64 raw bins, plenty of resolution for voice (~85-3000 Hz)
// and cheap enough to run at 60fps on a cold laptop.
const FFT_SIZE = 128;

/**
 * useAudioVisualizer — live mic amplitude data for a waveform bar display.
 *
 * Returns:
 *   - bars: Uint8Array of length BAR_COUNT (0-255 per bar), updated ~60fps
 *   - level: overall 0-1 loudness (RMS-ish), useful for pulsing effects
 *   - ready: true once the mic stream + analyser are wired up
 *
 * Pass `active=false` to tear everything down (stops the mic light).
 * Pass `active=true` again to re-acquire. This lets the Interview page
 * only hold the mic while LISTENING.
 */
export function useAudioVisualizer(active) {
  const [bars, setBars] = useState(() => new Uint8Array(BAR_COUNT));
  const [level, setLevel] = useState(0);
  const [ready, setReady] = useState(false);

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);

        streamRef.current = stream;
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setReady(true);

        const binCount = analyser.frequencyBinCount;
        const raw = new Uint8Array(binCount);
        const binsPerBar = Math.max(1, Math.floor(binCount / BAR_COUNT));

        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(raw);

          const out = new Uint8Array(BAR_COUNT);
          let total = 0;
          for (let i = 0; i < BAR_COUNT; i += 1) {
            let sum = 0;
            const start = i * binsPerBar;
            const end = Math.min(start + binsPerBar, binCount);
            for (let j = start; j < end; j += 1) sum += raw[j];
            const avg = sum / Math.max(1, end - start);
            out[i] = avg;
            total += avg;
          }
          setBars(out);
          setLevel(total / (BAR_COUNT * 255));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // Mic permission denied or device busy — silently fall back to a static
        // indicator. The interview itself still works via SpeechRecognition.
      }
    }
    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        sourceRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      sourceRef.current = null;
      analyserRef.current = null;
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setReady(false);
      setLevel(0);
      setBars(new Uint8Array(BAR_COUNT));
    };
  }, [active]);

  return { bars, level, ready, barCount: BAR_COUNT };
}
