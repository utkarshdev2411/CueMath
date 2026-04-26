import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StatusIndicator from "../components/StatusIndicator";
import { useInterview } from "../hooks/useInterview";
import "./Interview.css";

const MAX_TURNS = 7;

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialName = location.state?.candidateName || null;

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
  } = useInterview(initialName);

  const transcriptRef = useRef(null);
  const hasStartedRef = useRef(false);
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

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

  // Elapsed timer — starts when Priya begins her first utterance (phase leaves
  // IDLE) and stops when we reach ASSESSING/DONE. Intentionally elapsed-only,
  // never a countdown, per ux-flow.md ("No time pressure visible").
  useEffect(() => {
    const isRunning = phase && phase !== "IDLE" && phase !== "ASSESSING" && phase !== "DONE";
    if (isRunning && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    if (!isRunning) return undefined;
    const id = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  // Navigate to /report/:id once the assessment is ready. Persist the record to
  // localStorage so the Admin panel can list it and the URL remains shareable.
  useEffect(() => {
    if (phase === "DONE" && report) {
      const id = crypto.randomUUID();
      const record = {
        id,
        name: candidateName || "Candidate",
        date: new Date().toISOString(),
        duration: formatElapsed(elapsed).replace(":", "m ") + "s",
        messages: messages.length,
        transcript: messages,
        elapsedSeconds: elapsed,
        report,
      };
      try {
        const existing = JSON.parse(localStorage.getItem("interviews") || "[]");
        localStorage.setItem("interviews", JSON.stringify([record, ...existing]));
      } catch {
        // localStorage unavailable — proceed without persisting
      }

      navigate(`/report/${id}`, {
        state: {
          report,
          candidateName,
          transcript: messages,
          elapsedSeconds: elapsed,
        },
      });
    }
  }, [phase, report, candidateName, messages, elapsed, navigate]);

  // Turn counter shown in the UI reflects the current question being asked.
  // turnCount increments after each AI reply, so displayed = min(turnCount, MAX_TURNS).
  const displayedTurn = Math.min(Math.max(turnCount, 1), MAX_TURNS);
  const progressPct = Math.min(100, Math.round((displayedTurn / MAX_TURNS) * 100));
  const elapsedLabel = formatElapsed(elapsed);

  // The last AI message — shown as the pinned "Current Question" card.
  const lastAiMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  );
  const showCurrentQ = ["LISTENING", "PROCESSING"].includes(phase) && lastAiMessage;

  return (
    <main className="interview grid-bg">
      <InterviewNav
        turn={displayedTurn}
        total={MAX_TURNS}
        progressPct={progressPct}
        elapsed={elapsedLabel}
        candidateName={candidateName}
      />

      <div className="interview-layout">
        {/* ---- Left Sidebar ---- */}
        <aside className="sidebar sidebar-left">
          <StatusIndicator phase={phase} />
        </aside>

        {/* ---- Center: Transcript ---- */}
        <section className="transcript-col">
          {showCurrentQ && (
            <div className="current-question" aria-live="polite">
              <p className="current-question-text">{lastAiMessage.content}</p>
              <span className="current-question-turn">
                Q{displayedTurn} <span className="of">of {MAX_TURNS}</span>
              </span>
            </div>
          )}

          <div className="transcript-card" aria-label="Conversation transcript">
            <div className="transcript-head">
              <span className="transcript-eyebrow">Live transcript</span>
              <span className="transcript-count">
                {messages.length} message{messages.length === 1 ? "" : "s"}
              </span>
            </div>

            <div ref={transcriptRef} className="transcript-panel">
              {messages.length === 0 && (
                <div className="transcript-empty">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.4, marginBottom:8}}>
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                  </svg>
                  <div>Priya will speak first — listen through your speakers.</div>
                </div>
              )}

              {messages.map((m, idx) => (
                <Message key={idx} role={m.role} content={m.content} />
              ))}

              {isListening && interimTranscript && (
                <Message role="user" content={interimTranscript} interim />
              )}
            </div>
          </div>

          <div className="interview-footer">
            <div className="footer-meta">
              <span className={`status-pill pill-${footerPillVariant(phase)}`}>
                {footerPillLabel(phase)}
              </span>
            </div>
            {error && (
              <div className="interview-error" role="alert">
                {error}
              </div>
            )}
            <div className="footer-hint">
              Pauses are OK. Priya waits until you're done.
            </div>
          </div>
        </section>

        {/* ---- Right Sidebar ---- */}
        <aside className="sidebar sidebar-right">
          <div className="sidebar-card sidebar-ai-note">
            <div className="sidebar-card-head">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span>AI disclosure</span>
            </div>
            <p className="sidebar-note-text">
              You're speaking with <strong>Priya</strong>, an AI interviewer. A human recruiter reviews every assessment.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ---------------- Sub-components ---------------- */

function InterviewNav({ turn, total, progressPct, elapsed, candidateName }) {
  return (
    <header className="interview-nav">
      <div className="interview-nav-inner">
        <div className="interview-nav-left">
          <a href="/" className="nav-logo">Cuemath</a>
          <span className="nav-divider" aria-hidden="true" />
          <div className="nav-session">
            <span className="nav-session-label">Tutor interview</span>
            {candidateName && (
              <span className="nav-session-name">· {candidateName}</span>
            )}
          </div>
        </div>

        <div className="interview-nav-right">
          <div className="nav-progress" aria-label={`Question ${turn} of ${total}`}>
            <div className="nav-progress-label">
              <span className="nav-progress-turn">Q{turn}</span>
              <span className="nav-progress-total">/ {total}</span>
            </div>
            <div className="nav-progress-track">
              <div
                className="nav-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="nav-timer" aria-label={`Elapsed time ${elapsed}`}>
            <ClockIcon />
            <span>{elapsed}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Message({ role, content, interim }) {
  const isUser = role === "user";
  return (
    <div className={`msg msg-${isUser ? "user" : "ai"} ${interim ? "msg-interim" : ""}`}>
      <div className="msg-row">
        <div className={`msg-avatar ${isUser ? "msg-avatar-user" : "msg-avatar-ai"}`}>
          {isUser ? "Y" : "P"}
        </div>
        <div className="msg-content">
          <div className="msg-speaker">{isUser ? "You" : "Priya"}</div>
          <div className="msg-bubble">{content}</div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

/* ---------------- Helpers ---------------- */

function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function footerPillLabel(phase) {
  switch (phase) {
    case "IDLE": return "Getting ready";
    case "INTRO": return "Introduction";
    case "LISTENING": return "Your turn";
    case "PROCESSING": return "Priya thinking";
    case "SPEAKING": return "Priya speaking";
    case "COMPLETE": return "Wrapping up";
    case "ASSESSING": return "Generating report";
    case "DONE": return "Complete";
    default: return phase || "";
  }
}

function footerPillVariant(phase) {
  switch (phase) {
    case "LISTENING": return "mint";
    case "SPEAKING":
    case "INTRO": return "cream";
    case "PROCESSING":
    case "ASSESSING": return "lavender";
    case "COMPLETE":
    case "DONE": return "sky";
    default: return "cream";
  }
}
