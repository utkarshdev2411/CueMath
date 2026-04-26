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
  const [step, setStep] = useState("intro");
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBrowserOk(isChromeDesktop());
  }, []);

  const handleNext = () => {
    setError(null);
    if (!browserOk) {
      setError("Please use Google Chrome on a laptop or desktop.");
      return;
    }
    setStep("consent");
  };

  const handleBack = () => {
    setError(null);
    setStep("intro");
  };

  const handleStart = async () => {
    setError(null);
    if (!browserOk) {
      setError("Please use Google Chrome on a laptop or desktop.");
      return;
    }
    if (!consented) {
      setError("Please check the consent box to continue.");
      return;
    }

    setStep("preparing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
      }

      await new Promise((r) => setTimeout(r, 800));

      navigate("/interview");
    } catch {
      setError("Please allow microphone access and refresh the page.");
      setStep("consent");
    }
  };

  if (step === "consent") {
    return (
      <ConsentOverlay
        consented={consented}
        setConsented={(v) => {
          setConsented(v);
          if (v) setError(null);
        }}
        error={error}
        browserOk={browserOk}
        onBack={handleBack}
        onStart={handleStart}
      />
    );
  }

  if (step === "preparing") {
    return <PreparingOverlay />;
  }

  return <IntroLanding browserOk={browserOk} onNext={handleNext} />;
}

/* ---------------- Intro (marketing landing) ---------------- */

function IntroLanding({ browserOk, onNext }) {
  return (
    <div className="landing grid-bg">
      <Navbar onCta={onNext} browserOk={browserOk} />

      <section className="hero">
        <div className="section-inner hero-inner">
          <span className="eyebrow">Cuemath AI Screening</span>
          <h1 className="hero-title">
            Meet <span className="hl">Priya</span>, your AI interviewer.
          </h1>
          <p className="hero-subtitle">
            A 5-minute voice conversation to showcase how you explain, encourage, and teach.
            Speak naturally — there are no trick questions.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={onNext}
              disabled={!browserOk}
            >
              Begin interview →
            </button>
            <a href="#how-it-works" className="btn-ghost">
              How it works
            </a>
          </div>

          {!browserOk && (
            <div className="alert alert-warn" role="alert">
              Your browser isn't supported. Please open this page in Google Chrome on a laptop
              or desktop to continue.
            </div>
          )}

          <div className="trust-row">
            <TrustBadge>⏱ 5 minutes</TrustBadge>
            <TrustBadge>🎙 Voice-first</TrustBadge>
            <TrustBadge>🧑‍🏫 Human reviewed</TrustBadge>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="section-inner">
          <div className="stats-row">
            <StatItem number="10,000+" label="Tutors Screened" />
            <StatItem number="4.9/5" label="Candidate Rating" />
            <StatItem number="5 min" label="Average Duration" />
            <StatItem number="100%" label="Unbiased AI" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section section-white">
        <div className="section-inner">
          <span className="eyebrow eyebrow-muted">How it works</span>
          <h2 className="section-title">Three simple steps</h2>
          <p className="section-sub">
            You and Priya have a natural conversation. That's it.
          </p>

          <div className="grid-3">
            <FeatureCard
              variant="mint"
              step="01"
              title="Priya speaks first"
              body="She greets you and asks a warm opening question out loud. Listen through your speakers or headphones."
            />
            <FeatureCard
              variant="lavender"
              step="02"
              title="You reply with your voice"
              body="The microphone turns on automatically after Priya finishes. Speak naturally — pauses are fine."
            />
            <FeatureCard
              variant="sky"
              step="03"
              title="Get your report"
              body="After 7 questions (about 5 minutes), a scored assessment is shared with our recruiting team."
            />
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="section-inner">
          <span className="eyebrow eyebrow-muted">What we're looking for</span>
          <h2 className="section-title">Five dimensions we score</h2>
          <p className="section-sub">
            These reflect what makes a great Cuemath tutor. You don't need to be perfect in
            every one — be yourself.
          </p>

          <div className="rubric-grid">
            <RubricPill color="mint" label="Clarity" desc="How clearly you explain your thinking" />
            <RubricPill color="lavender" label="Simplification" desc="Breaking ideas into child-friendly terms" />
            <RubricPill color="salmon" label="Warmth" desc="Tone of encouragement and care" />
            <RubricPill color="sky" label="Patience" desc="How you handle a student who is stuck" />
            <RubricPill color="pink" label="Fluency" desc="Natural, confident spoken English" />
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="section-inner">
          <div className="split">
            <div>
              <span className="eyebrow eyebrow-muted">Tips</span>
              <h2 className="section-title">Set yourself up to shine</h2>
              <ul className="tips-list">
                <li>Find a quiet space and use headphones if you can.</li>
                <li>Speak at a normal pace — there's no time pressure per answer.</li>
                <li>Use concrete examples and stories wherever possible.</li>
                <li>If you need to think, pause — Priya will wait.</li>
              </ul>
            </div>

            <DisclosureCard />
          </div>
        </div>
      </section>

      <section className="section section-yellow">
        <div className="section-inner cta-band">
          <div>
            <h2 className="cta-title">Ready when you are.</h2>
            <p className="cta-sub">About 5 minutes. One browser tab. Priya's waiting.</p>
          </div>
          <button
            type="button"
            className="btn-primary btn-on-yellow"
            onClick={onNext}
            disabled={!browserOk}
          >
            Begin interview →
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="section-inner footer-inner">
          <div className="footer-brand">Cuemath</div>
          <div className="footer-meta">
            Built for the Cuemath tutor screening team · Works best on Google Chrome (desktop)
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function Navbar({ onCta, browserOk }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-logo">Cuemath</div>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <button
            type="button"
            className="btn-primary btn-compact"
            onClick={onCta}
            disabled={!browserOk}
          >
            Start interview
          </button>
        </div>
      </div>
    </nav>
  );
}

function TrustBadge({ children }) {
  return <span className="trust-badge">{children}</span>;
}

function FeatureCard({ variant, step, title, body }) {
  return (
    <article className={`feature-card feature-card-${variant}`}>
      <div className="feature-step">{step}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-body">{body}</p>
    </article>
  );
}

function RubricPill({ color, label, desc }) {
  return (
    <div className={`rubric-pill rubric-${color}`}>
      <div className="rubric-label">{label}</div>
      <div className="rubric-desc">{desc}</div>
    </div>
  );
}

function DisclosureCard() {
  return (
    <aside className="disclosure-card" aria-labelledby="disclosure-heading">
      <div className="disclosure-head">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 id="disclosure-heading" className="disclosure-title">About this interview</h3>
      </div>
      <p className="disclosure-body">
        You'll be speaking with <strong>Priya</strong>, our AI interviewer. Your responses are
        analysed to assess communication and teaching skills. A <strong>human recruiter</strong>
        {" "}reviews every result — this is not the final hiring decision.
      </p>
      <ul className="disclosure-list">
        <li>Audio is processed in your browser; no recording is stored.</li>
        <li>Transcripts are shared only with Cuemath recruiting.</li>
        <li>You can stop the interview at any time.</li>
      </ul>
    </aside>
  );
}

/* ---------------- Consent overlay (step 2) ---------------- */

function ConsentOverlay({ consented, setConsented, error, browserOk, onBack, onStart }) {
  return (
    <main className="overlay grid-bg">
      <div className="overlay-card">
        <span className="eyebrow">Step 2 of 2</span>
        <h1 className="overlay-title">One last thing</h1>
        <p className="overlay-sub">Please review this before we begin.</p>

        <div className="disclosure-card disclosure-card-inset">
          <div className="disclosure-head">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="disclosure-title">About this interview</h2>
          </div>
          <p className="disclosure-body">
            You'll be speaking with <strong>Priya</strong>, our AI interviewer. Your responses
            will be analysed to assess communication and teaching skills. A human recruiter
            reviews all results — this is not the final hiring decision.
          </p>
        </div>

        <label className="consent-row">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="consent-checkbox"
          />
          <span className="consent-text">
            I understand this interview is conducted by AI and consent to proceed.
          </span>
        </label>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <div className="overlay-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={!browserOk || !consented}
            className="btn-primary"
          >
            Start interview →
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Preparing overlay (step 3) ---------------- */

function PreparingOverlay() {
  return (
    <main className="overlay grid-bg">
      <div className="overlay-card overlay-card-sm">
        <div className="preparing-spinner" aria-hidden="true" />
        <h2 className="preparing-title">Preparing your interview…</h2>
        <p className="preparing-desc">
          Setting up the microphone and briefing Priya. This should only take a moment.
        </p>
      </div>
    </main>
  );
}
