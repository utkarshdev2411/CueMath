import "./StatusIndicator.css";

const LABELS = {
  IDLE: "Ready",
  INTRO: "Priya is speaking",
  LISTENING: "Listening...",
  PROCESSING: "Thinking...",
  SPEAKING: "Priya is speaking",
  COMPLETE: "Wrapping up",
  ASSESSING: "Generating your report...",
  DONE: "Done",
};

export default function StatusIndicator({ phase }) {
  const label = LABELS[phase] || "";

  return (
    <div className="status-indicator">
      <div className={`status-visual status-${phase?.toLowerCase() || "idle"}`}>
        {phase === "LISTENING" && <div className="pulse-circle" aria-hidden="true" />}
        {phase === "PROCESSING" || phase === "ASSESSING" ? (
          <div className="spinner-ring" aria-hidden="true" />
        ) : null}
        {(phase === "SPEAKING" || phase === "INTRO") && (
          <div className="speak-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        {(phase === "IDLE" || phase === "COMPLETE" || phase === "DONE") && (
          <div className="static-mic" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 0 1 2 0 7 7 0 0 1-6 6.92V21a1 1 0 0 1-2 0v-3.08A7 7 0 0 1 5 11a1 1 0 0 1 2 0 5 5 0 0 0 10 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="status-label">{label}</div>
    </div>
  );
}
