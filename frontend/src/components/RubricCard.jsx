import "./RubricCard.css";

const LABELS = {
  clarity: "Clarity",
  simplification: "Simplification",
  warmth: "Warmth",
  patience: "Patience",
  fluency: "Fluency",
};

export default function RubricCard({ dimension, score, evidence }) {
  const safeScore = Math.max(0, Math.min(5, Math.round(score || 0)));
  const dots = "●".repeat(safeScore) + "○".repeat(5 - safeScore);

  return (
    <div className="rubric-card">
      <div className="rubric-header">
        <span className="rubric-name">{LABELS[dimension] || dimension}</span>
        <span className="rubric-dots" aria-label={`${safeScore} out of 5`}>
          {dots}
        </span>
      </div>
      <p className="rubric-evidence">"{evidence}"</p>
    </div>
  );
}
