import "./RubricCard.css";

const LABELS = {
  clarity: "Clarity",
  simplification: "Simplification",
  warmth: "Warmth",
  patience: "Patience",
  fluency: "Fluency",
};

// Stable colour-per-dimension mapping (avoids the "nth-child shifts when the
// order changes" fragility). Uses the Cuemath accent palette.
const VARIANT = {
  clarity: "mint",
  simplification: "lavender",
  warmth: "salmon",
  patience: "sky",
  fluency: "pink",
};

const ONE_LINERS = {
  clarity: "How clearly you explained your thinking",
  simplification: "Breaking ideas into child-friendly terms",
  warmth: "Tone of encouragement and care",
  patience: "How you handled a student who is stuck",
  fluency: "Natural, confident spoken English",
};

export default function RubricCard({ dimension, score, evidence }) {
  const numeric = Number(score);
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(5, numeric)) : 0;
  const pct = Math.round((safe / 5) * 100);
  const variant = VARIANT[dimension] || "cream";

  return (
    <article className={`rubric-card rubric-${variant}`}>
      <header className="rubric-card-head">
        <div className="rubric-card-titles">
          <span className="rubric-card-eyebrow">Dimension</span>
          <h3 className="rubric-card-name">{LABELS[dimension] || dimension}</h3>
          <p className="rubric-card-hint">{ONE_LINERS[dimension] || ""}</p>
        </div>
        <div className="rubric-card-score">
          <span className="rubric-card-score-num">{safe.toFixed(1)}</span>
          <span className="rubric-card-score-den">/5</span>
        </div>
      </header>

      <div
        className="rubric-bar-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="5"
        aria-valuenow={safe}
        aria-label={`${LABELS[dimension] || dimension} score`}
      >
        <div className="rubric-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {evidence && (
        <blockquote className="rubric-evidence">
          <span className="rubric-evidence-quote" aria-hidden="true">"</span>
          {evidence}
        </blockquote>
      )}
    </article>
  );
}
