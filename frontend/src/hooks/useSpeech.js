import { useCallback, useEffect, useRef, useState } from "react";

const WELCOME_VOICE_LANG = "en-US";
const NETWORK_RETRY_DELAY_MS = 1000;
// How long (ms) of silence AFTER speech before submitting the answer.
const SUBMIT_SILENCE_MS = 4000;
// How long (ms) of total silence at the START before prompting the user to speak.
const PROMPT_SILENCE_MS = 8000;

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeech() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);

  // Refs for the current recognition instance and the caller-supplied callbacks.
  // We use refs (not state) so each .start() call gets a fresh instance without
  // re-triggering React renders, and callbacks stay in sync without remounting.
  const recognitionRef = useRef(null);
  const onTranscriptReadyRef = useRef(null);
  const onSilenceRef = useRef(null);
  // Counts consecutive network errors across ALL startListening() calls.
  const globalNetworkFailuresRef = useRef(0);
  // Silence timer — fires SUBMIT_SILENCE_MS after the last speech to submit.
  const silenceTimerRef = useRef(null);
  // Prompt timer — fires PROMPT_SILENCE_MS if the user says nothing at all.
  const promptTimerRef = useRef(null);
  const voicesRef = useRef([]);

  // Detect browser support once on mount.
  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("Please use Google Chrome on a desktop");
    }
  }, []);

  // Pre-load available voices. Chrome populates asynchronously via voiceschanged.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Cleanup: cancel any in-flight recognition / speech on unmount.
  useEffect(() => {
    return () => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(promptTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = useCallback(({ onTranscriptReady, onSilence } = {}) => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("Please use Google Chrome on a desktop");
      return;
    }

    onTranscriptReadyRef.current = onTranscriptReady || null;
    onSilenceRef.current = onSilence || null;
    // NOTE: do NOT reset globalNetworkFailuresRef here — it must survive
    // across calls to detect the infinite-cycling scenario on Ubuntu/Linux.
    // It is only reset when a successful transcript is received.

    // Always destroy any previous instance — non-continuous mode requires fresh.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    const recognition = new SR();
    // continuous=true: Chrome will NOT auto-stop on short pauses.
    // We control submission ourselves via a silence timer (SUBMIT_SILENCE_MS).
    // This prevents premature submission when the candidate pauses to breathe
    // or think mid-answer.
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Accumulates all isFinal chunks within one listening session.
    let finalBuffer = "";
    // Flag to prevent double-submission if both timer and onend fire.
    let submitted = false;

    const submitBuffer = (recognition) => {
      if (submitted) return;
      submitted = true;
      clearTimeout(silenceTimerRef.current);
      const text = finalBuffer.trim();
      recognition.abort(); // Stop the continuous session cleanly.
      if (text) {
        globalNetworkFailuresRef.current = 0;
        setTranscript(text);
        if (onTranscriptReadyRef.current) onTranscriptReadyRef.current(text);
      } else {
        // Nothing was said — treat as silence.
        if (onSilenceRef.current) onSilenceRef.current();
      }
    };

    const scheduleSilenceSubmit = () => {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => submitBuffer(recognition), SUBMIT_SILENCE_MS);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setError(null);
      finalBuffer = "";
      submitted = false;
      // Start the prompt timer. If the candidate says nothing within
      // PROMPT_SILENCE_MS we abort and surface onSilence so useInterview
      // can speak a nudge ("I'm listening — go ahead whenever you're ready.").
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = setTimeout(() => {
        if (!submitted) {
          submitted = true;
          clearTimeout(silenceTimerRef.current);
          recognition.abort();
          if (onSilenceRef.current) onSilenceRef.current();
        }
      }, PROMPT_SILENCE_MS);
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalBuffer += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      // Show the live running transcript (committed + current interim).
      setTranscript((finalBuffer + interim).trim());
      // User has started speaking — cancel the "please speak" prompt timer.
      clearTimeout(promptTimerRef.current);
      // Reset the silence countdown — candidate is still speaking.
      scheduleSilenceSubmit();
    };

    recognition.onerror = (event) => {
      const code = event.error;
      if (code === "network") {
        // Chrome's speech recognition requires a live connection to
        // speech.googleapis.com. On Ubuntu/Linux this frequently fails due to
        // Chrome audio sandbox or network routing issues.
        //
        // Strategy: allow up to 2 silent retries (fresh recognition instance
        // each time). After 4 total consecutive failures across ALL calls we
        // stop cycling and surface an actionable error — otherwise the mic
        // flicks on/off in an infinite loop.
        globalNetworkFailuresRef.current += 1;
        const failures = globalNetworkFailuresRef.current;

        if (failures <= 2) {
          // Silent retry with a fresh recognition instance after a short delay.
          setTimeout(() => {
            startListening({
              onTranscriptReady: onTranscriptReadyRef.current,
              onSilence: onSilenceRef.current,
            });
          }, NETWORK_RETRY_DELAY_MS * failures); // backoff: 1s, 2s
          return;
        }
        if (failures <= 4) {
          // Still failing — give the onSilence loop one more chance but with
          // a longer cooldown so the user at least sees a pause.
          setIsListening(false);
          setTimeout(() => {
            if (onSilenceRef.current) onSilenceRef.current();
          }, 2000);
          return;
        }
        // 5+ consecutive failures — this is a structural problem (Ubuntu audio
        // sandbox, no access to speech.googleapis.com, etc). Stop cycling.
        setIsListening(false);
        setError(
          "Speech recognition can't connect. On Linux: open chrome://settings/content/microphone and ensure Chrome has mic access, then refresh. You can also try: Settings → Sound → check input device."
        );
        return;
      }
      if (code === "no-speech") {
        setIsListening(false);
        if (onSilenceRef.current) {
          onSilenceRef.current();
        }
        return;
      }
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone access denied");
        setIsListening(false);
        return;
      }
      if (code === "aborted") {
        setIsListening(false);
        return;
      }
      setError(`Speech recognition error: ${code}`);
      setIsListening(false);
    };

    // With continuous=true, onend only fires when we call abort().
    // It just cleans up the isListening flag.
    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(promptTimerRef.current);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      // InvalidStateError if start() is called while already started.
      setError("Could not start microphone. Please try again.");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text, onDone) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Text-to-speech not supported in this browser");
      if (onDone) onDone();
      return;
    }
    if (!text || !text.trim()) {
      if (onDone) onDone();
      return;
    }

    // Cancel any utterance still in the queue.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = WELCOME_VOICE_LANG;

    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const enUsVoice = voices.find((v) => v.lang === WELCOME_VOICE_LANG);
    if (enUsVoice) {
      utterance.voice = enUsVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onDone) onDone();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      // onDone is still called so the caller's state machine doesn't hang.
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    startListening,
    stopListening,
    speak,
    transcript,
    isListening,
    isSpeaking,
    error,
  };
}
