import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function isChromeDesktop() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const hasSpeech =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  return isChrome && !isMobile && !!hasSpeech;
}

export default function Landing() {
  const navigate = useNavigate();
  const [browserOk, setBrowserOk] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setBrowserOk(isChromeDesktop());
  }, []);

  const handleStart = async () => {
    setError(null);

    if (!browserOk) {
      setError("Please use Google Chrome on a laptop or desktop.");
      return;
    }

    setRequesting(true);
    try {
      // Request mic permission up-front (mandatory per ux-flow).
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately — SpeechRecognition manages its own mic session.
      stream.getTracks().forEach((t) => t.stop());

      // Prime SpeechSynthesis inside the user gesture so the welcome message
      // on the Interview page can play. (See known-gotchas.md.)
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
      }

      navigate("/interview");
    } catch (err) {
      setError("Please allow microphone access and refresh the page.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="landing">
      <div className="landing-card">
        <div className="landing-brand">Cuemath</div>
        <h1>AI Tutor Interview</h1>
        <p className="landing-desc">
          This is a 5-minute voice interview. An AI interviewer will ask you a few questions.
          Speak naturally — there are no trick questions.
        </p>
        <p className="landing-note">Please use Google Chrome on a laptop or desktop.</p>

        {!browserOk && (
          <div className="landing-warn">
            Your browser isn't supported. Please open this page in Google Chrome on a laptop or
            desktop to continue.
          </div>
        )}

        {error && <div className="landing-error">{error}</div>}

        <button
          type="button"
          onClick={handleStart}
          disabled={!browserOk || requesting}
          className="landing-cta"
        >
          {requesting ? "Requesting mic..." : "Start Interview"}
        </button>
      </div>
    </main>
  );
}
