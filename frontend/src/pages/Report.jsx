import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RadarChart from "../components/RadarChart";
import RubricCard from "../components/RubricCard";
import { candidates as seedCandidates } from "../data/candidates";
import "./Report.css";

function loadFromStorage(id) {
  if (!id) return null;
  // Check seed candidates first (no localStorage needed)
  const seed = seedCandidates.find((c) => c.id === id);
  if (seed) {
    return {
      report: {
        overall: seed.verdict,
        weighted_score: seed.weighted_score,
        summary: seed.summary,
        dimensions: seed.dimensions,
        red_flags: seed.red_flags,
        recommendation: seed.recommendation,
      },
      candidateName: seed.name,
      transcript: [],
      elapsedSeconds: 0,
    };
  }
  // Check real interviews in localStorage
  try {
    const list = JSON.parse(localStorage.getItem("interviews") || "[]");
    const record = list.find((r) => r.id === id);
    if (record) {
      return {
        report: record.report,
        candidateName: record.name || record.candidateName,
        transcript: record.transcript || [],
        elapsedSeconds: record.elapsedSeconds || 0,
      };
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

const VERDICT_INFO = {
  pass: {
    label: "Pass",
    blurb: "Advance this candidate to the next round.",
    className: "verdict-pass",
  },
  review: {
    label: "Review",
    blurb: "Strong signal in some areas — recommend a human follow-up.",
    className: "verdict-review",
  },
  reject: {
    label: "Do not advance",
    blurb: "Not a match for this role at this time.",
    className: "verdict-reject",
  },
  fail: {
    label: "Do not advance",
    blurb: "Not a match for this role at this time.",
    className: "verdict-reject",
  },
};

function verdictMeta(overall) {
  const key = (overall || "").toLowerCase();
  return (
    VERDICT_INFO[key] || {
      label: (overall || "N/A").toUpperCase(),
      blurb: "",
      className: "verdict-review",
    }
  );
}

function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r.toString().padStart(2, "0")}s`;
}

// Serialise the conversation into a human-readable .txt that a recruiter can
// spot-check against the AI's evidence quotes (future-improvements.md #10).
function transcriptToText({ candidateName, transcript, today, overall, weightedScore }) {
  const header = [
    `Cuemath — AI Tutor Screener`,
    `Candidate: ${candidateName || "Candidate"}`,
    `Date:      ${today}`,
    `Verdict:   ${(overall || "n/a").toUpperCase()}`,
    `Score:     ${Number(weightedScore).toFixed(1)} / 5.0`,
    `${"=".repeat(60)}`,
    ``,
  ].join("\n");

  const body = (transcript || [])
    .map((m) => {
      const speaker = m.role === "user" ? candidateName || "Candidate" : "Priya (AI)";
      return `${speaker}:\n${m.content}\n`;
    })
    .join("\n");

  return `${header}${body}`;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Prefer in-memory state (just-completed interview or admin nav).
  // Fall back to localStorage / seed data when opened via direct URL.
  const stateData = location.state || loadFromStorage(id);
  const { report, candidateName, transcript, elapsedSeconds } = stateData || {};

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/admin");
    }
  };

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  if (!report) {
    return (
      <main className="report-empty grid-bg">
        <div className="report-empty-card">
          <span className="eyebrow">{id ? "Report not found" : "No report yet"}</span>
          <h2>{id ? "This report link has expired" : "No report available"}</h2>
          <p>
            {id
              ? "Reports are stored in the browser. This link may have been opened in a different browser or device."
              : "Please complete an interview first."}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="btn-secondary" onClick={() => navigate("/admin")}>
              View all candidates
            </button>
            <button type="button" className="btn-primary" onClick={() => navigate("/")}>
              Start an interview
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { overall, weighted_score, summary, dimensions, red_flags, recommendation } = report;
  const verdict = verdictMeta(overall);
  const name = candidateName || "Candidate";
  const hasTranscript = Array.isArray(transcript) && transcript.length > 0;
  const shareUrl = id ? window.location.href : null;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    if (!hasTranscript) return;
    const text = transcriptToText({
      candidateName: name,
      transcript,
      today,
      overall,
      weightedScore: weighted_score,
    });
    const safeName = (name || "candidate").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadText(`cuemath-interview-${safeName}.txt`, text);
  };

  const dimensionEntries = dimensions ? Object.entries(dimensions) : [];

  return (
    <main className="report grid-bg">
      <ReportNav candidateName={name} onBack={handleBack} />

      <div className="report-shell">
        <section className="report-hero">
          <div className="report-hero-titles">
            <span className="eyebrow">Interview assessment</span>
            <h1 className="report-title">{name}</h1>
            <div className="report-meta">
              <span>{today}</span>
              {elapsedSeconds ? (
                <>
                  <span className="meta-sep">·</span>
                  <span>{formatElapsed(elapsedSeconds)} interview</span>
                </>
              ) : null}
              {transcript?.length ? (
                <>
                  <span className="meta-sep">·</span>
                  <span>{transcript.length} messages</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="report-hero-actions">
            {shareUrl && (
              <button
                type="button"
                className={`btn-secondary btn-compact btn-copy ${copied ? "btn-copy-done" : ""}`}
                onClick={handleCopyLink}
                title="Copy shareable link"
              >
                {copied ? <CheckIcon /> : <LinkIcon />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            )}
            <button
              type="button"
              className="btn-secondary btn-compact"
              onClick={handleDownloadTranscript}
              disabled={!hasTranscript}
              title={hasTranscript ? "Download full conversation" : "Transcript not available"}
            >
              <DownloadIcon /> Transcript
            </button>
            <button
              type="button"
              className="btn-primary btn-compact"
              onClick={() => window.print()}
            >
              <PrintIcon /> Print
            </button>
          </div>
        </section>

        <section className={`verdict-card ${verdict.className}`}>
          <div className="verdict-left">
            <span className={`verdict-badge ${verdict.className}`}>{verdict.label}</span>
            <div className="verdict-score">
              <span className="verdict-score-num">{Number(weighted_score).toFixed(1)}</span>
              <span className="verdict-score-den">/ 5.0</span>
            </div>
            <p className="verdict-blurb">{verdict.blurb}</p>
          </div>
          <div className="verdict-right">
            {dimensions && <RadarChart dimensions={dimensions} size={320} />}
          </div>
        </section>

        <section className="report-section">
          <h2 className="section-title">Summary</h2>
          <div className="summary-card">
            <p>{summary}</p>
          </div>
        </section>

        <section className="report-section">
          <h2 className="section-title">Dimensions</h2>
          <p className="section-sub">Scored against the 5-point Cuemath tutor rubric.</p>
          <div className="rubric-grid">
            {dimensionEntries.map(([dim, data]) => (
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
          <section className="report-section">
            <h2 className="section-title">Red flags</h2>
            <div className="flags-card">
              <ul>
                {red_flags.map((flag, idx) => (
                  <li key={idx}>
                    <WarnIcon /> <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="report-section">
          <h2 className="section-title">Recommendation</h2>
          <div className="recommendation-card">
            <p>{recommendation}</p>
          </div>
        </section>

        <section className="report-footer-cta">
          <div>
            <h3 className="cta-title">Need a deeper look?</h3>
            <p className="cta-sub">
              Download the full transcript to spot-check the AI's evidence quotes.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownloadTranscript}
            disabled={!hasTranscript}
          >
            <DownloadIcon /> Download transcript
          </button>
        </section>
      </div>
    </main>
  );
}

/* ---------------- Sub-components ---------------- */

function ReportNav({ candidateName, onBack }) {
  return (
    <header className="report-nav">
      <div className="report-nav-inner">
        <button type="button" className="report-nav-back" onClick={onBack} aria-label="Go back">
          <BackIcon /> Back
        </button>
        <span className="nav-divider" aria-hidden="true" />
        <div className="nav-logo">Cuemath</div>
        <span className="nav-divider" aria-hidden="true" />
        <div className="report-nav-session">
          <span className="report-nav-label">Interview assessment</span>
          {candidateName && <span className="report-nav-name">· {candidateName}</span>}
        </div>
      </div>
    </header>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8b1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
