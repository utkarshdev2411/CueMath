import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";
import "./Landing.css";

/**
 * Detect the visitor's browser/device specifically enough to give them a useful
 * warning. Web Speech API only works on Chrome desktop — every other case needs
 * a precise message rather than a generic "browser not supported".
 */
function detectBrowser() {
  if (typeof navigator === "undefined") {
    return { ok: false, name: "unknown", message: "Browser detection failed. Please use Google Chrome on a laptop or desktop." };
  }
  const ua = navigator.userAgent;
  const hasSpeech =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (isMobile) {
    return {
      ok: false,
      name: "mobile",
      message: "You're on a mobile device — please open this page in Google Chrome on a laptop or desktop to continue.",
    };
  }

  // Order matters: Edge and Opera include "Chrome/" in their UA, so check them first.
  if (/Edg\//.test(ua)) {
    return {
      ok: false,
      name: "edge",
      message: "You're on Microsoft Edge — please switch to Google Chrome on a laptop to continue. Web Speech API is Chrome-only.",
    };
  }
  if (/OPR\//.test(ua) || /Opera/i.test(ua)) {
    return {
      ok: false,
      name: "opera",
      message: "You're on Opera — please switch to Google Chrome on a laptop to continue. Web Speech API is Chrome-only.",
    };
  }
  if (/Firefox\//.test(ua)) {
    return {
      ok: false,
      name: "firefox",
      message: "You're on Firefox — please switch to Google Chrome on a laptop to continue. Web Speech API is Chrome-only.",
    };
  }
  if (/Brave\//.test(ua) || (navigator.brave && navigator.brave.isBrave)) {
    return {
      ok: false,
      name: "brave",
      message: "You're on Brave — please switch to Google Chrome on a laptop. Brave is Chromium-based but blocks the Web Speech API used here.",
    };
  }
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    return {
      ok: false,
      name: "safari",
      message: "You're on Safari — please switch to Google Chrome on a laptop to continue. Web Speech API is Chrome-only.",
    };
  }

  const isChrome = /Chrome\//.test(ua);
  if (!isChrome) {
    return {
      ok: false,
      name: "unknown",
      message: "Your browser isn't supported. Please open this page in Google Chrome on a laptop or desktop to continue.",
    };
  }
  if (!hasSpeech) {
    return {
      ok: false,
      name: "chrome-no-speech",
      message: "Your version of Chrome doesn't expose the Web Speech API. Please update Chrome to the latest version.",
    };
  }

  return { ok: true, name: "chrome", message: null };
}

export default function Landing() {
  const navigate = useNavigate();
  // Lazy-init so detection runs once on mount without an effect — keeps the
  // assistant out of cascading renders and is correct because navigator.userAgent
  // is stable for the lifetime of the page.
  const [browserInfo] = useState(() => detectBrowser());
  const [step, setStep] = useState("intro");
  const [candidateName, setCandidateName] = useState("");
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState(null);

  const browserOk = browserInfo.ok;

  const handleNext = () => {
    setError(null);
    if (!browserOk) {
      setError(browserInfo.message);
      return;
    }
    setStep("consent");
  };

  const handleBackToIntro = () => {
    setError(null);
    setStep("intro");
  };

  const handleConsentNext = () => {
    setError(null);
    if (!browserOk) {
      setError(browserInfo.message);
      return;
    }
    if (!candidateName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!consented) {
      setError("Please check the consent box to continue.");
      return;
    }
    setStep("mic-test");
  };

  const handleBackToConsent = () => {
    setError(null);
    setStep("consent");
  };

  const handleMicTestComplete = async () => {
    setError(null);
    setStep("preparing");
    try {
      // Tickle SpeechSynthesis with an empty utterance inside the user-gesture
      // handler so Chrome doesn't silently block the first real speak() call.
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
      }
      await new Promise((r) => setTimeout(r, 800));
      navigate("/interview", { state: { candidateName: candidateName.trim() } });
    } catch {
      setError("Something went wrong while starting. Please refresh and try again.");
      setStep("mic-test");
    }
  };

  if (step === "consent") {
    return (
      <ConsentOverlay
        candidateName={candidateName}
        setCandidateName={setCandidateName}
        consented={consented}
        setConsented={(v) => {
          setConsented(v);
          if (v) setError(null);
        }}
        error={error}
        browserOk={browserOk}
        onBack={handleBackToIntro}
        onNext={handleConsentNext}
      />
    );
  }

  if (step === "mic-test") {
    return (
      <MicTestOverlay
        candidateName={candidateName}
        onBack={handleBackToConsent}
        onContinue={handleMicTestComplete}
      />
    );
  }

  if (step === "preparing") {
    return <PreparingOverlay />;
  }

  return <IntroLanding browserInfo={browserInfo} onNext={handleNext} />;
}

/* ---------------- Intro (marketing landing) ---------------- */

function IntroLanding({ browserInfo, onNext }) {
  const browserOk = browserInfo.ok;
  return (
    <div className="landing grid-bg">
      <Link to="/build-story" className="case-study-banner" aria-label="Read the build-story case study">
        <div className="case-study-banner-inner">
          <span className="case-study-banner-text">
            <span className="case-study-banner-spark" aria-hidden="true">✦</span>
            How I built this — decisions, bugs, tradeoffs, and principles
          </span>
          <span className="case-study-banner-cta">
            Read the case study
            <span className="case-study-banner-arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
      <div className="top-banner">
        <div className="top-banner-inner">
          <div className="top-banner-text">
            <span className="top-banner-label">Portfolio Demo</span>
            <span className="top-banner-name">Utkarsh Sharma</span>
            <span className="top-banner-desc">AI Builder · Not Cuemath's official website</span>
          </div>
          <div className="top-banner-links">
            <a href="https://github.com/utkarshdev2411" className="top-banner-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/utkarsh-sharma-83755a24a/" className="top-banner-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
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
            <div className={`alert alert-warn alert-browser alert-browser-${browserInfo.name}`} role="alert">
              <span className="alert-browser-icon" aria-hidden="true">⚠</span>
              <span className="alert-browser-text">{browserInfo.message}</span>
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
              <span className="eyebrow eyebrow-muted">Why Cuemath</span>
              <h2 className="section-title">Join a community of passionate educators</h2>
              <ul className="benefits-list">
                <li><strong>Earn from home</strong> — set your own schedule and teach from anywhere.</li>
                <li><strong>World-class curriculum</strong> — we provide the lesson plans, you bring the magic.</li>
                <li><strong>Real impact</strong> — help children across 40+ countries fall in love with math.</li>
                <li><strong>Grow professionally</strong> — training, mentorship, and a supportive tutor community.</li>
              </ul>
            </div>
            <div className="why-visual">
              <div className="why-card why-card-1">
                <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span className="why-stat">40+</span>
                <span className="why-label">Countries</span>
              </div>
              <div className="why-card why-card-2">
                <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span className="why-stat">10K+</span>
                <span className="why-label">Active Tutors</span>
              </div>
              <div className="why-card why-card-3">
                <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span className="why-stat">200K+</span>
                <span className="why-label">Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="section-inner">
          <span className="eyebrow eyebrow-muted">What tutors say</span>
          <h2 className="section-title">Hear from the community</h2>
          <p className="section-sub">Real experiences from Cuemath tutors.</p>
          <div className="testimonials-grid">
            <TestimonialCard
              quote="The AI screening was so natural! It felt like a real conversation and I wasn't stressed at all."
              author="Anjali S."
              role="Math Tutor, Delhi"
              variant="cream"
            />
            <TestimonialCard
              quote="I loved that I could take the interview at 10 PM. No scheduling conflicts!"
              author="Rahul M."
              role="Cuemath Teacher, Bangalore"
              variant="mint"
            />
            <TestimonialCard
              quote="After joining Cuemath, I earn what I want, I spend time with my family — everything is in my hands!"
              author="Preethi K."
              role="Math Tutor, Chennai"
              variant="lavender"
            />
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

      <section className="section section-cream">
        <div className="section-inner">
          <span className="eyebrow eyebrow-muted">FAQs</span>
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-sub">
            Everything you need to know before your AI screening.
          </p>
          <div className="faq-list">
            <FaqItem
              q="What if my internet disconnects mid-interview?"
              a="No worries — you can restart the screening from the beginning. Your previous attempt won't count against you."
            />
            <FaqItem
              q="Does the AI judge my accent?"
              a="Not at all. Priya evaluates clarity of explanation, warmth, and teaching approach — never regional accents or pronunciation."
            />
            <FaqItem
              q="Can I prepare for this?"
              a="There's nothing to memorise. Just think about how you'd explain math to a child. Be natural and yourself."
            />
            <FaqItem
              q="When will I hear back?"
              a="The recruiting team reviews Priya's report and will contact you within 48 hours with next steps."
            />
            <FaqItem
              q="Is my data safe?"
              a="Audio is processed in real-time in your browser and never stored. Only the text transcript is shared with Cuemath's recruiting team."
            />
          </div>
        </div>
      </section>

      <section id="hr-tools" className="section section-white">
        <div className="section-inner">
          <span className="eyebrow eyebrow-muted">For Recruiters</span>
          <h2 className="section-title">HR tools, ready to use</h2>
          <p className="section-sub">
            Every interview automatically generates a structured report. Review all candidates in one place — no login required for this demo.
          </p>
          <div className="hr-tools-grid">
            <HrToolCard
              variant="mint"
              icon={
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              }
              title="Admin Dashboard"
              desc="See all screened candidates in one table — scores, verdicts, interview duration — sorted and filterable."
              cta="Open Dashboard →"
              href="/admin"
            />
            <HrToolCard
              variant="lavender"
              icon={
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              }
              title="Shareable Reports"
              desc="Each report has a unique URL. Forward /report/abc123 to any team member — no account needed."
              cta="See a sample report →"
              href="/report/c003"
            />
            <HrToolCard
              variant="sky"
              icon={
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              }
              title="5-Dimension Scoring"
              desc="Every candidate is rated on Clarity, Simplification, Warmth, Patience and Fluency with evidence quotes."
              cta="View rubric →"
              href="#how-it-works"
            />
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
        <div className="section-inner footer-grid">
          <div className="footer-col">
            <div className="footer-brand">Cuemath</div>
            <p className="footer-tagline">The math expert. Making every child a math champion.</p>
            <div className="footer-badges">
              <span className="footer-badge">🔒 DPDP Compliant</span>
              <span className="footer-badge">🤖 AI-Powered</span>
              <span className="footer-badge">🔐 End-to-End Encrypted</span>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-heading">Company</div>
            <a href="https://www.cuemath.com/about-us/" className="footer-link" target="_blank" rel="noopener noreferrer">About Us</a>
            <a href="https://www.cuemath.com/our-tutors/" className="footer-link" target="_blank" rel="noopener noreferrer">Our Tutors</a>
            <a href="https://www.cuemath.com/en-in/our-impact/" className="footer-link" target="_blank" rel="noopener noreferrer">Our Impact</a>
            <a href="https://www.cuemath.com/our-reviews/" className="footer-link" target="_blank" rel="noopener noreferrer">Reviews</a>
          </div>
          <div className="footer-col">
            <div className="footer-heading">Legal</div>
            <a href="https://www.cuemath.com/terms" className="footer-link" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
            <a href="https://www.cuemath.com/privacy" className="footer-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <a href="https://www.cuemath.com/refund-policy/" className="footer-link" target="_blank" rel="noopener noreferrer">Refund Policy</a>
          </div>
        </div>
        <div className="section-inner footer-bottom">
          <div className="footer-meta">
            © 2026 Cuemath. Built for the tutor screening team · Best on Google Chrome (desktop)
          </div>
        </div>
      </footer>

      <section className="dev-credit">
        <div className="section-inner dev-credit-inner">
          <div className="dev-credit-text">
            <span className="dev-credit-label">Built by</span>
            <span className="dev-credit-name">Utkarsh Sharma</span>
            <span className="dev-credit-desc">AI Builder · Full-Stack Developer</span>
          </div>
          <div className="dev-credit-links">
            <a href="https://github.com/utkarshdev2411" className="dev-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/utkarsh-sharma-83755a24a/" className="dev-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function Navbar({ onCta, browserOk }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="/" className="nav-logo">Cuemath</a>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#hr-tools" className="nav-link">HR Tools</a>
          <a href="/admin" className="nav-link nav-link-admin">Admin Panel</a>
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

function StatItem({ number, label }) {
  return (
    <div className="stat-item">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function TestimonialCard({ quote, author, role, variant }) {
  return (
    <blockquote className={`testimonial-card testimonial-${variant}`}>
      <p className="testimonial-quote">"{quote}"</p>
      <footer className="testimonial-footer">
        <div className="testimonial-author">{author}</div>
        <div className="testimonial-role">{role}</div>
      </footer>
    </blockquote>
  );
}

function HrToolCard({ variant, icon, title, desc, cta, href }) {
  return (
    <a
      href={href}
      className={`hr-tool-card hr-tool-card-${variant}`}
    >
      <div className="hr-tool-icon">{icon}</div>
      <h3 className="hr-tool-title">{title}</h3>
      <p className="hr-tool-desc">{desc}</p>
      <span className="hr-tool-cta">{cta}</span>
    </a>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-open" : ""}`}>
      <button
        type="button"
        className="faq-question"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="faq-icon" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

/* ---------------- Consent overlay (step 2) ---------------- */

function ConsentOverlay({ candidateName, setCandidateName, consented, setConsented, error, browserOk, onBack, onNext }) {
  return (
    <main className="overlay grid-bg">
      <div className="overlay-card">
        <span className="eyebrow">Step 2 of 3</span>
        <h1 className="overlay-title">One last thing</h1>
        <p className="overlay-sub">Quick consent, then a 5-second mic check, then we begin.</p>

        <div className="candidate-details">
          <label className="input-label" htmlFor="candidateName">Your Name</label>
          <input 
            id="candidateName"
            className="text-input" 
            type="text" 
            placeholder="e.g. John Doe"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
        </div>

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
            onClick={onNext}
            disabled={!browserOk || !consented}
            className="btn-primary"
          >
            Continue → mic check
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Mic test overlay (step 3) ---------------- */

const MIC_LEVEL_THRESHOLD = 0.04;
const MIC_SUSTAINED_FRAMES = 6;
const MIC_TEST_DURATION_MS = 5000;

function MicTestOverlay({ candidateName, onBack, onContinue }) {
  const { bars, level, ready } = useAudioVisualizer(true);
  const [heardYou, setHeardYou] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(MIC_TEST_DURATION_MS / 1000));

  // Counter for "level above threshold for N consecutive frames". Lives in a
  // ref because (a) it doesn't drive any UI directly and (b) doing it in state
  // would mean calling setState inside an effect, which React 19 flags.
  const sustainedFramesRef = useRef(0);

  // Once mic is ready, give the candidate ~600ms before we even start expecting
  // them to speak — gives them a chance to read the instructions.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!ready) return undefined;
    const t = setTimeout(() => setArmed(true), 600);
    return () => clearTimeout(t);
  }, [ready]);

  // Track sustained speech: needs to cross the threshold for several consecutive
  // frames so a single click/tap doesn't unlock the button.
  useEffect(() => {
    if (!armed || heardYou) return;
    if (level >= MIC_LEVEL_THRESHOLD) {
      sustainedFramesRef.current += 1;
      if (sustainedFramesRef.current >= MIC_SUSTAINED_FRAMES) {
        setHeardYou(true);
      }
    } else {
      sustainedFramesRef.current = 0;
    }
  }, [level, armed, heardYou]);

  // Visible countdown — purely reassurance for the candidate.
  useEffect(() => {
    if (!armed || heardYou) return undefined;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, Math.round((MIC_TEST_DURATION_MS - elapsed) / 1000));
      setSecondsLeft(left);
      if (elapsed >= MIC_TEST_DURATION_MS) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [armed, heardYou]);

  // If permission is silently denied, the hook's `ready` never flips to true.
  // After 2.5s of waiting, surface a permission alert so the user can recover.
  useEffect(() => {
    if (ready) return undefined;
    const t = setTimeout(() => {
      if (!ready) setPermissionDenied(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [ready]);

  const barArray = Array.from(bars);

  return (
    <main className="overlay grid-bg">
      <div className="overlay-card">
        <span className="eyebrow">Step 3 of 3</span>
        <h1 className="overlay-title">
          {heardYou ? `Great, I can hear you, ${candidateName.split(" ")[0] || "there"}.` : "Quick mic check"}
        </h1>
        <p className="overlay-sub">
          {heardYou
            ? "You're all set. Click below and Priya will begin."
            : "Say anything — your name, what you ate today, anything. I just want to confirm the mic is picking you up before we start."}
        </p>

        <div className="mic-test">
          <div className={`mic-test-status mic-test-status-${heardYou ? "ok" : armed ? "listening" : "init"}`}>
            <span className="mic-test-status-dot" aria-hidden="true" />
            <span className="mic-test-status-text">
              {permissionDenied
                ? "Microphone blocked"
                : !ready
                  ? "Requesting microphone…"
                  : heardYou
                    ? "Mic working perfectly"
                    : `Listening… ${secondsLeft}s`}
            </span>
          </div>

          <div className="mic-test-bars" aria-hidden="true">
            {barArray.map((b, i) => {
              const pct = Math.max(6, Math.min(100, (b / 255) * 100));
              return (
                <span
                  key={i}
                  className="mic-test-bar"
                  style={{ height: `${pct}%`, opacity: heardYou ? 0.9 : armed ? 1 : 0.5 }}
                />
              );
            })}
          </div>

          <div className="mic-test-meter">
            <div
              className={`mic-test-meter-fill ${heardYou ? "mic-test-meter-fill-ok" : ""}`}
              style={{ width: `${Math.min(100, level * 220)}%` }}
            />
          </div>

          {permissionDenied && (
            <div className="alert alert-error" role="alert">
              We can't hear your microphone. Please allow microphone access in the address bar
              and click Retry, or use the Back button to try again.
            </div>
          )}

          {!permissionDenied && !heardYou && armed && secondsLeft === 0 && (
            <div className="mic-test-hint">
              Still not picking anything up. Try speaking louder, or check your input device in
              browser settings — then click Continue once you see the bars react.
            </div>
          )}
        </div>

        <div className="overlay-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={!heardYou && !permissionDenied}
            className="btn-primary"
          >
            {heardYou ? "Start interview →" : "Continue →"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Preparing overlay (step 4) ---------------- */

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
