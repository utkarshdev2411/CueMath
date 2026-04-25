import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusIndicator from "../components/StatusIndicator";
import { useInterview } from "../hooks/useInterview";
import "./Interview.css";

const MAX_TURNS = 7;

export default function Interview() {
  const navigate = useNavigate();
  const {
    phase,
    messages,
    turnCount,
    report,
    error,
    candidateName,
    interimTranscript,
    isListening,
    startInterview,
  } = useInterview();

  const transcriptRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Auto-start the interview exactly once when the page mounts.
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startInterview();
  }, [startInterview]);

  // Auto-scroll transcript to the bottom on every new message.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, interimTranscript]);

  // Navigate to /report once the assessment is ready.
  useEffect(() => {
    if (phase === "DONE" && report) {
      navigate("/report", { state: { report, candidateName } });
    }
  }, [phase, report, candidateName, navigate]);

  // Turn counter shown in the UI reflects the current question being asked.
  // turnCount increments after each AI reply, so displayed = min(turnCount, MAX_TURNS).
  const displayedTurn = Math.min(Math.max(turnCount, 1), MAX_TURNS);

  // The last AI message — shown as the pinned "Current Question" card.
  const lastAiMessage = [...messages].reverse().find((m) => m.role === "assistant");
  // Show the current question card whenever the candidate is expected to speak.
  const showCurrentQ = ["LISTENING", "PROCESSING"].includes(phase) && lastAiMessage;

  return (
    <main className="interview">
      <div className="interview-top">
        <StatusIndicator phase={phase} />
      </div>

      {showCurrentQ && (
        <div className="current-question">
          <div className="current-question-label">💬 Priya asked</div>
          <p className="current-question-text">{lastAiMessage.content}</p>
        </div>
      )}

      <div ref={transcriptRef} className="transcript-panel">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`msg msg-${m.role === "user" ? "user" : "ai"}`}
          >
            <div className="msg-speaker">
              {m.role === "user" ? "You" : "Priya"}
            </div>
            <div className="msg-bubble">{m.content}</div>
          </div>
        ))}
        {isListening && interimTranscript && (
          <div className="msg msg-user msg-interim">
            <div className="msg-bubble">{interimTranscript}</div>
          </div>
        )}
      </div>

      <div className="interview-footer">
        <div className="turn-counter">
          {phase === "ASSESSING" || phase === "COMPLETE"
            ? "Generating your report..."
            : `Question ${displayedTurn} of ${MAX_TURNS}`}
        </div>
        {error && <div className="interview-error">{error}</div>}
      </div>
    </main>
  );
}
