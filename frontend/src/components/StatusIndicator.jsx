import AudioVisualizer from "./AudioVisualizer";
import "./StatusIndicator.css";

const LABELS = {
  IDLE: "Ready",
  INTRO: "Priya is speaking",
  LISTENING: "Your turn — speak now",
  PROCESSING: "Priya is thinking",
  SPEAKING: "Priya is speaking",
  COMPLETE: "Wrapping up",
  ASSESSING: "Generating your report",
  DONE: "Done",
};

const SUBLABELS = {
  IDLE: "Waiting to begin",
  INTRO: "Listen carefully",
  LISTENING: "Take your time — pauses are fine",
  PROCESSING: "Thinking about your answer…",
  SPEAKING: "Priya is responding",
  COMPLETE: "Finalising your interview",
  ASSESSING: "This takes a few seconds",
  DONE: "Report is ready",
};

export default function StatusIndicator({ phase }) {
  const label = LABELS[phase] || "";
  const sub = SUBLABELS[phase] || "";
  const isListening = phase === "LISTENING";

  return (
    <div className={`status-indicator phase-${(phase || "idle").toLowerCase()}`}>
      <div className="status-left">
        <div className="status-avatar" aria-hidden="true">
          <span className="status-avatar-initial">P</span>
          <span className={`status-avatar-dot ${isListening ? "dot-live" : ""}`} />
        </div>
        <div className="status-copy">
          <div className="status-label">{label}</div>
          <div className="status-sub">{sub}</div>
        </div>
      </div>

      <div className="status-visual">
        {isListening && <AudioVisualizer active width={130} height={48} />}
        {(phase === "PROCESSING" || phase === "ASSESSING") && (
          <div className="status-spinner" aria-hidden="true" />
        )}
        {(phase === "SPEAKING" || phase === "INTRO") && (
          <div className="status-bars" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
        )}
        {(phase === "IDLE" || phase === "COMPLETE" || phase === "DONE") && (
          <div className="status-mic" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
