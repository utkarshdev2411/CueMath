import { useCallback, useEffect, useRef, useState } from "react";

const WELCOME_VOICE_LANG = "en-US";
const NETWORK_RETRY_DELAY_MS = 1000;
// How long (ms) of silence AFTER speech before submitting the answer.
const SUBMIT_SILENCE_MS = 4000;
// How long (ms) of total silence at the START before prompting the user to speak.
const PROMPT_SILENCE_MS = 8000;
// Watchdog poll interval — if synthesis stops but onend never fires, we force it.
const SYNTH_WATCHDOG_MS = 500;
// Chrome pauses synthesis after ~15s; calling resume() every 10s keeps it going.
const SYNTH_KEEPALIVE_MS = 10000;

// Named voices that are decent "Priya" fallbacks if no en-IN female is present.
// Order reflects likelihood of being female-sounding and clear.
const NAMED_VOICE_HINTS = [
  "Google UK English Female",
  "Google Female",
  "Samantha",
  "Zira",
  "Microsoft Zira",
  "Karen",
  "Victoria",
];

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// Pick the best available voice for "Priya" per the preference ladder in
// future-improvements.md:
//   1. en-IN with "female" in the name
//   2. Any en-IN voice
//   3. Any en-* voice with "female" in the name
//   4. Named voices like "Google Female", "Samantha", "Zira"
//   5. First en-US voice
// Returns the SpeechSynthesisVoice object (or null if none available).
function pickPriyaVoice(voices) {
  if (!voices || !voices.length) return null;
  const hasFemale = (v) => /female/i.test(v.name);

  const enIn = voices.filter((v) => /^en-IN\b/i.test(v.lang));
  const enInFemale = enIn.find(hasFemale);
  if (enInFemale) return enInFemale;
  if (enIn.length) return enIn[0];

  const enFemale = voices.find((v) => /^en\b/i.test(v.lang) && hasFemale(v));
  if (enFemale) return enFemale;

  for (const hint of NAMED_VOICE_HINTS) {
    const v = voices.find((x) => x.name === hint || x.name.includes(hint));
    if (v) return v;
  }

  const enUs = voices.find((v) => /^en-US\b/i.test(v.lang));
  if (enUs) return enUs;

  return voices[0];
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
  // Synthesis watchdog + keepalive intervals (for Chrome's 15s silent-stop bug).
  const synthWatchdogRef = useRef(null);
  const synthKeepaliveRef = useRef(null);
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
      clearInterval(synthWatchdogRef.current);
      clearInterval(synthKeepaliveRef.current);
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
      console.log("[useSpeech] Destroying previous recognition instance");
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (err) {
        console.error("[useSpeech] Error aborting previous recognition:", err);
      }
      recognitionRef.current = null;
    }

    console.log("[useSpeech] Creating new SpeechRecognition instance");
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
    // Tracks the most recent interim text so we don't lose it if aborted.
    let interimBuffer = "";
    // Flag to prevent double-submission if both timer and onend fire.
    let submitted = false;

    const submitBuffer = (recognition) => {
      console.log("[useSpeech] submitBuffer called. submitted:", submitted, "final:", finalBuffer.length, "interim:", interimBuffer.length);
      if (submitted) return;
      submitted = true;
      clearTimeout(silenceTimerRef.current);
      clearTimeout(promptTimerRef.current);
      // If we abort before Chrome marks the last phrase as final, we MUST
      // include the interimBuffer or we lose their last 4 seconds of speech!
      const text = (finalBuffer + " " + interimBuffer).trim();
      console.log("[useSpeech] submitBuffer text:", text);
      recognition.abort(); // Stop the continuous session cleanly.
      if (text) {
        globalNetworkFailuresRef.current = 0;
        setTranscript(text);
        if (onTranscriptReadyRef.current) onTranscriptReadyRef.current(text);
      } else {
        console.log("[useSpeech] submitBuffer empty text, treating as silence");
        // Nothing was said — treat as silence.
        if (onSilenceRef.current) onSilenceRef.current();
      }
    };

    const scheduleSilenceSubmit = () => {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => submitBuffer(recognition), SUBMIT_SILENCE_MS);
    };

    recognition.onstart = () => {
      console.log("[useSpeech] recognition.onstart");
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
      console.log(`[useSpeech] onresult. index: ${event.resultIndex} length: ${event.results.length}`);
      
      let final = "";
      let interim = "";
      
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        
        console.log(`  -> result[${i}] final=${isFinal}: "${transcript}"`);
        
        if (isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      
      finalBuffer = final;
      interimBuffer = interim;
      
      // Show the live running transcript (committed + current interim).
      setTranscript((finalBuffer + interim).trim());
      // User has started speaking — cancel the "please speak" prompt timer.
      clearTimeout(promptTimerRef.current);
      // Reset the silence countdown — candidate is still speaking.
      scheduleSilenceSubmit();
    };

    recognition.onerror = (event) => {
      const code = event.error;
      console.error("[useSpeech] recognition.onerror. code:", code);
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
      console.log("[useSpeech] recognition.onend. submitted:", submitted);
      clearTimeout(silenceTimerRef.current);
      clearTimeout(promptTimerRef.current);
      setIsListening(false);
      
      if (!submitted) {
        console.log("[useSpeech] onend fired without submission. Recovering race condition...");
        submitBuffer(recognition);
      }
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

    // Cancel any utterance still in the queue and tear down any prior watchdog.
    window.speechSynthesis.cancel();
    clearInterval(synthWatchdogRef.current);
    clearInterval(synthKeepaliveRef.current);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = WELCOME_VOICE_LANG;

    // Per future-improvements.md #7 — pick the best available voice for Priya
    // so she doesn't sound like a generic American male.
    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const priyaVoice = pickPriyaVoice(voices);
    if (priyaVoice) {
      utterance.voice = priyaVoice;
      if (priyaVoice.lang) utterance.lang = priyaVoice.lang;
    }

    // Chrome has two well-known SpeechSynthesis bugs (future-improvements.md #6):
    //   - After ~15s it silently stops and never fires `onend`.
    //   - Long utterances can self-pause mid-stream; resume() unsticks them.
    // We defend against both with a watchdog that force-fires onDone once,
    // and a keepalive that periodically calls resume() while speaking.
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(synthWatchdogRef.current);
      clearInterval(synthKeepaliveRef.current);
      setIsSpeaking(false);
      if (onDone) onDone();
    };

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => finish();
    utterance.onerror = () => finish();

    window.speechSynthesis.speak(utterance);

    // Keepalive — if Chrome self-pauses a long utterance (known bug), calling
    // resume() gets it going again. We intentionally do NOT call pause()
    // preemptively: on some Chrome versions that duplicates already-spoken
    // audio. Only unstick when we detect the paused state.
    synthKeepaliveRef.current = setInterval(() => {
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (synth.paused) synth.resume();
    }, SYNTH_KEEPALIVE_MS);

    // Watchdog — if the engine stops reporting `speaking` but onend never
    // arrived, force-complete so the state machine never stalls in SPEAKING.
    // We also bail if the engine never starts at all (Chrome occasionally
    // swallows utterances without firing any event).
    let started = false;
    let idleTicks = 0;
    const watchdogStartedAt = Date.now();
    synthWatchdogRef.current = setInterval(() => {
      if (finished) return;
      const synth = window.speechSynthesis;
      if (!synth) {
        finish();
        return;
      }
      if (synth.speaking || synth.pending) {
        started = true;
        idleTicks = 0;
        return;
      }
      if (started) {
        // Engine reported speaking, then stopped reporting it, but onend never
        // fired. Classic Chrome 15s bug — force-complete.
        finish();
        return;
      }
      // Never started — wait up to ~3s before giving up entirely.
      idleTicks += 1;
      if (Date.now() - watchdogStartedAt > 3000 || idleTicks > 6) {
        finish();
      }
    }, SYNTH_WATCHDOG_MS);
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
