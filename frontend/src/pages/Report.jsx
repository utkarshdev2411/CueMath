import { useLocation, useNavigate } from "react-router-dom";
import RubricCard from "../components/RubricCard";
import "./Report.css";

const VERDICT_INFO = {
  pass: { label: "PASS", className: "verdict-pass" },
  review: { label: "REVIEW", className: "verdict-review" },
  reject: { label: "REJECT", className: "verdict-reject" },
  fail: { label: "REJECT", className: "verdict-reject" },
};

function verdictMeta(overall) {
  const key = (overall || "").toLowerCase();
  return VERDICT_INFO[key] || { label: (overall || "N/A").toUpperCase(), className: "verdict-review" };
}

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { report, candidateName } = location.state || {};

  if (!report) {
    return (
      <main className="report-empty">
        <h2>No report available</h2>
        <p>Please complete an interview first.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to start
        </button>
      </main>
    );
  }

  const { overall, weighted_score, summary, dimensions, red_flags, recommendation } = report;
  const verdict = verdictMeta(overall);
  const name = candidateName || "Candidate";
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="report">
      <header className="report-header">
        <div>
          <div className="report-title-eyebrow">Interview Assessment</div>
          <h1>{name}</h1>
          <div className="report-date">{today}</div>
        </div>
        <button type="button" className="report-print" onClick={() => window.print()}>
          Print
        </button>
      </header>

      <section className="report-verdict">
        <div className={`verdict-badge ${verdict.className}`}>{verdict.label}</div>
        <div className="verdict-score">
          <span className="verdict-score-num">{Number(weighted_score).toFixed(1)}</span>
          <span className="verdict-score-den">/ 5.0</span>
        </div>
      </section>

      <section className="report-summary">
        <h2>Summary</h2>
        <p>{summary}</p>
      </section>

      <section className="report-rubrics">
        <h2>Dimensions</h2>
        <div className="rubric-grid">
          {dimensions &&
            Object.entries(dimensions).map(([dim, data]) => (
              <RubricCard
                key={dim}
                dimension={dim}
                score={data?.score}
                evidence={data?.evidence}
              />
            ))}
        </div>
      </section>

      {Array.isArray(red_flags) && red_flags.length > 0 && (
        <section className="report-flags">
          <h2>Red flags</h2>
          <ul>
            {red_flags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="report-recommendation">
        <h2>Recommendation</h2>
        <p>{recommendation}</p>
      </section>
    </main>
  );
}
