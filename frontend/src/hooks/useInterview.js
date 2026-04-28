import { useCallback, useEffect, useReducer, useRef } from "react";
import { postAssess, postChat } from "../api/interview";
import { useSpeech } from "./useSpeech";

const WELCOME_MESSAGE =
  "Hi! I'm Priya from Cuemath. Thanks so much for taking the time to chat with me today. " +
  "This will be a short, friendly conversation — just speak naturally. Whenever you're ready, " +
  "tell me a little bit about yourself.";

const MAX_WINDOW = 4;

const initialState = {
  phase: "IDLE",
  messages: [],
  windowMessages: [],
  turnCount: 0,
  error: null,
  candidateName: null,
  report: null,
};

function windowOf(messages) {
  return messages.slice(-MAX_WINDOW);
}

function extractName(text) {
  // Very light heuristic — "I'm X" / "I am X" / "My name is X" / "This is X".
  if (!text) return null;
  const patterns = [
    /\bmy name is\s+([A-Z][a-zA-Z'-]+)/i,
    /\bi[' ]?a?m\s+([A-Z][a-zA-Z'-]+)/i,
    /\bthis is\s+([A-Z][a-zA-Z'-]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_ERROR":
      return { ...state, phase: "IDLE", error: action.error };
    case "SET_TRANSIENT_ERROR":
      return { ...state, error: action.error };
    case "APPEND_ASSISTANT": {
      const messages = [...state.messages, { role: "assistant", content: action.content }];
      return { ...state, messages, windowMessages: windowOf(messages) };
    }
    case "APPEND_USER": {
      const messages = [...state.messages, { role: "user", content: action.content }];
      const candidateName = state.candidateName || extractName(action.content);
      return {
        ...state,
        messages,
        windowMessages: windowOf(messages),
        candidateName,
      };
    }
    case "INCREMENT_TURN":
      return { ...state, turnCount: state.turnCount + 1 };
    case "SET_REPORT":
      return { ...state, report: action.report, phase: "DONE" };
    default:
      return state;
  }
}

export function useInterview(initialCandidateName = null) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    candidateName: initialCandidateName,
  });
  const speech = useSpeech();

  // Keep the latest state in a ref so callbacks used inside recognition/synth
  // events read fresh values (not a stale closure from when they were created).
  const stateRef = useRef(state);
  stateRef.current = state;

  // Counts consecutive "no speech" silence callbacks without a real answer.
  // Drives the TTS nudge prompt so Priya asks the candidate to speak.
  const silenceStreakRef = useRef(0);

  // Surface speech-layer errors to the interview state.
  useEffect(() => {
    if (speech.error) {
      dispatch({ type: "SET_ERROR", error: speech.error });
    }
  }, [speech.error]);

  // Forward-declared so the intro callback can reference it.
  const listenForCandidate = useCallback(() => {
    console.log("[useInterview] listenForCandidate called");
    dispatch({ type: "SET_PHASE", phase: "LISTENING" });

    speech.startListening({
      onTranscriptReady: (finalText) => {
        console.log("[useInterview] onTranscriptReady:", finalText);
        if (!finalText) return;
        silenceStreakRef.current = 0; // Candidate spoke — reset the streak.
        handleCandidateUtterance(finalText);
      },
      onSilence: () => {
        console.log("[useInterview] onSilence trigger. Streak:", silenceStreakRef.current);
        // The candidate said nothing for PROMPT_SILENCE_MS.
        // Speak a gentle nudge before restarting the mic so Priya
        // prompts them verbally. mic is already stopped at this point
        // (recognition was aborted), so no feedback risk.
        silenceStreakRef.current += 1;
        const streak = silenceStreakRef.current;

        const nudge =
          streak === 1
            ? "I'm listening — go ahead whenever you're ready."
            : streak === 2
            ? "Take your time. I'm still here whenever you'd like to answer."
            : null; // 3+ — silent restart, don't keep nagging

        if (nudge) {
          speech.speak(nudge, () => listenForCandidate());
        } else {
          listenForCandidate();
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.startListening]);

  const handleCandidateUtterance = useCallback(
    async (finalText) => {
      console.log("[useInterview] handleCandidateUtterance:", finalText);
      dispatch({ type: "APPEND_USER", content: finalText });
      dispatch({ type: "SET_PHASE", phase: "PROCESSING" });

      // Build the window from the post-append messages. We read stateRef which
      // hasn't updated yet (reducer is async w.r.t. useRef), so reconstruct:
      const nextMessages = [
        ...stateRef.current.messages,
        { role: "user", content: finalText },
      ];
      const windowMessages = windowOf(nextMessages);
      const turnCount = stateRef.current.turnCount;

      let response;
      try {
        console.log("[useInterview] calling postChat with turnCount:", turnCount);
        response = await postChat(windowMessages, turnCount);
        console.log("[useInterview] postChat success");
      } catch (err) {
        console.error("[useInterview] postChat failed:", err);
        const detail = err?.response?.data?.detail || "Something went wrong. Please try again.";
        dispatch({ type: "SET_TRANSIENT_ERROR", error: detail });
        dispatch({ type: "SET_PHASE", phase: "SPEAKING" });
        
        console.log("[useInterview] Recovering from error: prompting candidate to repeat");
        speech.speak("I'm sorry, I had a brief connection drop. Could you please repeat your answer?", () => {
          listenForCandidate();
        });
        return;
      }

      const { reply, should_end } = response;
      dispatch({ type: "APPEND_ASSISTANT", content: reply });
      dispatch({ type: "INCREMENT_TURN" });
      dispatch({ type: "SET_PHASE", phase: "SPEAKING" });

      speech.speak(reply, () => {
        if (should_end) {
          dispatch({ type: "SET_PHASE", phase: "COMPLETE" });
        } else {
          listenForCandidate();
        }
      });
    },
    [speech, listenForCandidate],
  );

  // Once we hit COMPLETE, we transition to ASSESSING and fire the assessment call.
  useEffect(() => {
    if (state.phase === "COMPLETE") {
      dispatch({ type: "SET_PHASE", phase: "ASSESSING" });
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "ASSESSING") return;

    let cancelled = false;
    (async () => {
      try {
        const report = await postAssess(
          stateRef.current.messages,
          stateRef.current.candidateName || "Candidate",
        );
        if (!cancelled) {
          dispatch({ type: "SET_REPORT", report });
        }
      } catch (err) {
        if (cancelled) return;
        const detail =
          err?.response?.data?.detail || "Assessment generation failed. Please contact support.";
        dispatch({ type: "SET_ERROR", error: detail });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.phase]);

  const startInterview = useCallback(() => {
    console.log("[useInterview] startInterview called, current phase:", stateRef.current.phase);
    if (stateRef.current.phase !== "IDLE") return;

    dispatch({ type: "SET_PHASE", phase: "INTRO" });
    dispatch({ type: "APPEND_ASSISTANT", content: WELCOME_MESSAGE });
    dispatch({ type: "INCREMENT_TURN" });

    speech.speak(WELCOME_MESSAGE, () => {
      listenForCandidate();
    });
  }, [speech, listenForCandidate]);

  return {
    phase: state.phase,
    messages: state.messages,
    turnCount: state.turnCount,
    report: state.report,
    error: state.error,
    candidateName: state.candidateName,
    // Expose the live interim transcript and speech flags so the UI can render
    // the StatusIndicator and show what the candidate is saying in real time.
    interimTranscript: speech.transcript,
    isListening: speech.isListening,
    isSpeaking: speech.isSpeaking,
    startInterview,
  };
}
