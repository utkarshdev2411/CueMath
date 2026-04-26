import { useEffect, useRef } from "react";
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";
import "./AudioVisualizer.css";

/**
 * AudioVisualizer — live waveform bars driven by mic input.
 *
 * Props:
 *   - active (bool): when true we acquire the mic; when false we tear down.
 *   - width/height: canvas pixel dimensions (we handle devicePixelRatio).
 *
 * Uses <canvas> for rendering (React re-renders 24 bars at 60fps would be
 * wasteful). The bars are drawn in the Cuemath yellow against a bordered
 * black frame — matching the neo-brutalist design system.
 */
export default function AudioVisualizer({ active, width = 320, height = 96 }) {
  const canvasRef = useRef(null);
  const { bars, level, ready, barCount } = useAudioVisualizer(active);
  const barsRef = useRef(bars);

  // Sync the latest bars into the ref outside of render — the rAF loop reads
  // from the ref so it always sees the freshest frequency data without
  // needing to re-run the draw effect every frame.
  useEffect(() => {
    barsRef.current = bars;
  }, [bars]);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    let raf;
    // A gentle idle shimmer used when the analyser isn't ready yet (or the
    // candidate is totally silent) — prevents a dead-looking box.
    let idlePhase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const data = barsRef.current;
      const count = data.length || barCount;
      const gap = 4;
      const barWidth = (width - gap * (count + 1)) / count;
      const maxH = height - 16;

      idlePhase += 0.08;

      for (let i = 0; i < count; i += 1) {
        const raw = data[i] / 255; // 0..1
        // If we have real data use it; otherwise fake a soft sine wave so the
        // viz never looks frozen (the candidate is supposed to see it's alive).
        const idle = (Math.sin(idlePhase + i * 0.35) + 1) * 0.12 + 0.08;
        const v = Math.max(raw, idle);

        const barH = Math.max(4, v * maxH);
        const x = gap + i * (barWidth + gap);
        const y = (height - barH) / 2;

        // Outer black outline (neo-brutalist look)
        ctx.fillStyle = "#1A1A1A";
        roundRect(ctx, x - 1, y - 1, barWidth + 2, barH + 2, 4);
        ctx.fill();

        // Inner fill — yellow, with a subtle gradient so loud bars glow a touch
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, "#FFD75A");
        grad.addColorStop(1, "#FAC02E");
        ctx.fillStyle = grad;
        roundRect(ctx, x, y, barWidth, barH, 3);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, width, height, barCount]);

  return (
    <div className={`audio-viz ${active ? "is-active" : ""}`}>
      <canvas ref={canvasRef} className="audio-viz-canvas" aria-hidden="true" />
      <div className="audio-viz-level" aria-hidden="true">
        <div
          className="audio-viz-level-fill"
          style={{ width: `${Math.min(100, Math.round(level * 220))}%` }}
        />
      </div>
      <div className="sr-only" role="status">
        {ready ? "Microphone active, listening" : "Listening"}
      </div>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
