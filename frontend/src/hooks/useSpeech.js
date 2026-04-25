import { useCallback, useEffect, useRef, useState } from "react";

const WELCOME_VOICE_LANG = "en-US";
const NETWORK_RETRY_DELAY_MS = 1000;

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
  const networkRetryAttemptedRef = useRef(false);
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
    // Only reset the retry flag when this is a fresh listen cycle, not when
    // startListening is called recursively from the network-error retry handler.
    if (!networkRetryAttemptedRef.current) {
      networkRetryAttemptedRef.current = false;
    }

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
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        const trimmed = final.trim();
        setTranscript(trimmed);
        if (onTranscriptReadyRef.current) {
          onTranscriptReadyRef.current(trimmed);
        }
      } else if (interim) {
        setTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      const code = event.error;
      if (code === "network") {
        // Chrome fired a transient Google-server error. The current instance is
        // now dead — calling .start() on it throws InvalidStateError. We must
        // create a completely fresh instance for the retry (per known-gotchas.md).
        if (!networkRetryAttemptedRef.current) {
          networkRetryAttemptedRef.current = true;
          setTimeout(() => {
            // Only retry if the hook is still mounted and listening is expected.
            startListening({
              onTranscriptReady: onTranscriptReadyRef.current,
              onSilence: onSilenceRef.current,
            });
          }, NETWORK_RETRY_DELAY_MS);
          return;
        }
        setError("Network error while listening. Please try again.");
        setIsListening(false);
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

    recognition.onend = () => {
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
