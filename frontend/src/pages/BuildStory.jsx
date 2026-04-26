import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CHANGELOG } from "../data/build-story/changelog";
import { DECISIONS } from "../data/build-story/decisions";
import { FEATURES } from "../data/build-story/features";
import { PRINCIPLES } from "../data/build-story/principles";
import "./BuildStory.css";

const FEATURE_CATEGORIES = ["All", "Core", "Assessment", "UX", "Product", "Engineering", "Security"];

export default function BuildStory() {
  const stats = useMemo(
    () => ({
      features: FEATURES.length,
      decisions: DECISIONS.length,
      bugs: CHANGELOG.filter((e) => e.type === "bug").length,
    }),
    [],
  );

  return (
    <div className="bs grid-bg">
      <BuildStoryNavbar />

      <Hero stats={stats} />
      <ProblemSection />
      <PrinciplesSection />
      <DecisionsSection />
      <FeaturesSection />
      <BuildJourneyTeaser />
      <WhatsNextSection />
      <RetrospectiveSection />
      <FooterCTA />
    </div>
  );
}

/* ---------------- Navbar ---------------- */

function BuildStoryNavbar() {
  return (
    <nav className="navbar bs-navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">Cuemath</Link>
        <div className="nav-links">
          <a href="#problem" className="nav-link">Problem</a>
          <a href="#principles" className="nav-link">Principles</a>
          <a href="#decisions" className="nav-link">Decisions</a>
          <a href="#features" className="nav-link">Features</a>
          <Link to="/build-journey" className="nav-link">Build log</Link>
          <Link to="/" className="btn-primary btn-compact">← Back to Priya</Link>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ stats }) {
  return (
    <section className="bs-hero">
      <div className="section-inner bs-hero-inner">
        <span className="eyebrow">Product Case Study</span>
        <h1 className="bs-hero-title">
          How I built <span className="hl">Priya</span> — and every decision I made building her.
        </h1>
        <p className="bs-hero-sub">
          A complete breakdown of the thinking, research, tradeoffs and principles behind the
          Cuemath AI Tutor Screener. Roughly <strong>8 hours of focused build time</strong>,
          zero infrastructure cost, every decision documented.
        </p>
        <div className="bs-author">
          Utkarsh Sharma · AI Builder Candidate · April 2026
        </div>

        <div className="bs-stats-row">
          <StatChip number={stats.features} label="Features shipped" />
          <StatChip number={stats.decisions} label="Decisions documented" />
          <StatChip number={stats.bugs} label="Bugs hit and fixed" />
          <StatChip number="₹0" label="Infrastructure cost" />
        </div>
      </div>
    </section>
  );
}

function StatChip({ number, label }) {
  return (
    <div className="bs-stat-chip">
      <div className="bs-stat-num">{number}</div>
      <div className="bs-stat-label">{label}</div>
    </div>
  );
}

/* ---------------- Problem ---------------- */

function ProblemSection() {
  return (
    <section id="problem" className="section section-cream">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">Why this exists</span>
        <h2 className="section-title">
          Cuemath screens hundreds of tutors every month. That's a scaling problem.
        </h2>
        <div className="bs-problem-grid">
          <p className="bs-prose">
            Cuemath hires hundreds of tutors every month across India and 70+ countries. Each
            candidate currently goes through a 10-minute human phone screen to test communication,
            patience, warmth, and the ability to explain a concept clearly. At scale this is slow,
            expensive, and inconsistent — different interviewers weight dimensions differently,
            and scheduling typically creates a 3–5 day bottleneck before a candidate even hears
            back.
          </p>
          <p className="bs-prose">
            This product replaces round 1 of screening with a 5-minute AI voice interview that
            assesses what human interviewers actually look for. <strong>It is explicitly not a
            math test</strong> — it's a soft-skills screener. The AI evaluates how the candidate
            explains, encourages and adapts, not whether they can solve calculus problems. Math
            depth gets tested in round 2 by a human, where it belongs.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Principles ---------------- */

function PrinciplesSection() {
  return (
    <section id="principles" className="section section-white">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">What guided every decision</span>
        <h2 className="section-title">
          Eight principles. Applied consistently. Visible in the product.
        </h2>
        <p className="section-sub">
          These weren't written after the fact. They guided each tradeoff while it was being made.
        </p>

        <div className="bs-principle-list">
          {PRINCIPLES.map((p, idx) => (
            <PrincipleCard key={p.id} index={idx + 1} principle={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrincipleCard({ index, principle }) {
  return (
    <article className="bs-principle-card">
      <div className="bs-principle-num">{String(index).padStart(2, "0")}</div>
      <div className="bs-principle-content">
        <h3 className="bs-principle-title">{principle.title}</h3>
        <p className="bs-principle-desc">{principle.description}</p>
        <div className="bs-shown-in">
          <span className="bs-shown-label">Shown in:</span>
          <div className="bs-shown-chips">
            {principle.shown_in.map((s) => (
              <span key={s} className="bs-chip">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Decisions ---------------- */

function DecisionsSection() {
  return (
    <section id="decisions" className="section section-cream">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">The thinking behind the choices</span>
        <h2 className="section-title">
          Every project has infinite directions. Here's exactly why I went the way I did.
        </h2>
        <p className="section-sub">
          These are not obvious choices. Each one had real alternatives and real tradeoffs.
        </p>

        <div className="bs-decision-list">
          {DECISIONS.map((d) => (
            <DecisionCard key={d.id} decision={d} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DecisionCard({ decision }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`bs-decision-card ${open ? "bs-decision-open" : ""}`}>
      <button
        type="button"
        className="bs-decision-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="bs-decision-head-left">
          <span className="bs-decision-tag">Decision</span>
          <h3 className="bs-decision-title">{decision.decision}</h3>
        </div>
        <span className="bs-feature-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="bs-decision-body">
          <div className="bs-def-row">
            <div className="bs-def-label">Context</div>
            <div className="bs-def-body">{decision.context}</div>
          </div>

          <div className="bs-def-row">
            <div className="bs-def-label">Options</div>
            <div className="bs-options">
              {decision.options_considered.map((opt) => {
                const chosen = opt === decision.chosen;
                return (
                  <span
                    key={opt}
                    className={`bs-option-pill ${chosen ? "bs-option-chosen" : ""}`}
                  >
                    {chosen ? "✓ " : ""}{opt}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bs-def-row">
            <div className="bs-def-label">Reasoning</div>
            <div className="bs-def-body">{decision.reasoning}</div>
          </div>

          <div className="bs-callout bs-callout-tradeoff">
            <div className="bs-callout-label">Tradeoff accepted</div>
            <div className="bs-callout-body">{decision.tradeoff}</div>
          </div>

          <div className="bs-callout bs-callout-prod">
            <div className="bs-callout-label">If this were a real funded product</div>
            <div className="bs-callout-body">{decision.production_path}</div>
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------------- Features ---------------- */

function FeaturesSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = useMemo(() => {
    if (activeCategory === "All") return FEATURES;
    return FEATURES.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="features" className="section section-white">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">What was shipped</span>
        <h2 className="section-title">
          Every feature — what it does, how it works, and why it exists.
        </h2>
        <p className="section-sub">
          Tap any card to expand. Every feature lists its principle tags so you can trace it
          back to the belief that made it ship.
        </p>

        <div className="bs-tabs">
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`bs-tab ${activeCategory === cat ? "bs-tab-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              <span className="bs-tab-count">
                {cat === "All"
                  ? FEATURES.length
                  : FEATURES.filter((f) => f.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        <div className="bs-feature-list">
          {filtered.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`bs-feature-card ${open ? "bs-feature-open" : ""}`}>
      <button
        type="button"
        className="bs-feature-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="bs-feature-head-left">
          <span className={`bs-cat bs-cat-${feature.category.toLowerCase()}`}>
            {feature.category}
          </span>
          <h3 className="bs-feature-title">{feature.title}</h3>
        </div>
        <span className="bs-feature-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="bs-feature-body">
          <DefRow label="What" body={feature.what} />
          <DefRow label="How" body={feature.how} />
          <DefRow label="Why" body={feature.why} />
          <div className="bs-principle-chips">
            {feature.principles.map((p) => (
              <span key={p} className="bs-chip">{prettyPrincipleLabel(p)}</span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function DefRow({ label, body }) {
  return (
    <div className="bs-def-row">
      <div className="bs-def-label">{label}</div>
      <div className="bs-def-body">{body}</div>
    </div>
  );
}

function prettyPrincipleLabel(id) {
  const found = PRINCIPLES.find((p) => p.id === id);
  return found ? found.title : id;
}

/* ---------------- Build Journey teaser ---------------- */

function BuildJourneyTeaser() {
  const bugs = CHANGELOG.filter((e) => e.type === "bug").length;
  const fixes = CHANGELOG.filter((e) => e.type === "fix").length;

  return (
    <section className="section section-cream">
      <div className="section-inner">
        <Link to="/build-journey" className="bs-journey-teaser">
          <div className="bs-journey-teaser-left">
            <span className="eyebrow eyebrow-muted">For the engineering-minded</span>
            <h2 className="bs-journey-teaser-title">
              Want the unedited build log?
            </h2>
            <p className="bs-journey-teaser-sub">
              Four phases of development, {bugs} bugs hit, {fixes} fixes shipped, plus the
              full Git commit history. The honest, line-by-line story of how Priya got built.
            </p>
          </div>
          <div className="bs-journey-teaser-right">
            <span className="bs-journey-teaser-cta">
              Read the build log <span className="bs-journey-teaser-arrow" aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ---------------- What's Next ---------------- */

function WhatsNextSection() {
  return (
    <section className="section section-white">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">If I had more time</span>
        <h2 className="section-title">The product is shipped. Here's the roadmap I'd pursue.</h2>
        <p className="section-sub">
          These aren't afterthoughts — they're in <code>future-improvements.md</code>, written
          before the deadline.
        </p>

        <div className="bs-next-grid">
          <NextCard
            title="Hush + Groq Whisper audio pipeline"
            effort="2–3 days"
            impact="High"
            body="Replace Web Speech API with MediaRecorder + Groq Whisper + Hush noise suppression. Unlocks Firefox/Safari/Edge, removes the Chrome-only constraint, and gives us a clean audio pipeline for future features (voice-quality scoring, diarization). Full implementation specced in docs/hush-model-analysis.md."
          />
          <NextCard
            title="Backend-persisted reports + Supabase auth"
            effort="2 days"
            impact="High"
            body="Move report storage from localStorage to Postgres (via Supabase). Add magic-link auth scoped to @cuemath.com domains. Recruiters can finally forward URLs to actual colleagues. Same UUID URL pattern, real persistence."
          />
          <NextCard
            title="Feedback analytics dashboard"
            effort="1 day"
            impact="Medium"
            body="Aggregate the candidate feedback already being collected. Average-rating card on the admin dashboard, ⚠️ flag on rows where rating < 3, CSV export, and a 'turn quality' heatmap correlating low ratings with specific question turns. Spec already in future-improvements.md."
          />
          <NextCard
            title="Calibration mode (/calibrate)"
            effort="1 day"
            impact="Medium"
            body="Hidden HR-only route to adjust dimension weights (warmth more important than fluency, etc.). Stored in localStorage. Report scores recalculate live. Lets different teams tune the rubric for their specific role mix."
          />
          <NextCard
            title="Resume-broken-interview flow"
            effort="1 day"
            impact="Medium"
            body="Persist messages and turnCount to localStorage after each turn. If the candidate's tab closes mid-interview, the landing page detects the stale session and offers to resume. Edge-case-handling that real candidates will absolutely need."
          />
          <NextCard
            title="Comparative scoring (percentile)"
            effort="0.5 day"
            impact="Low"
            body="Compare each candidate's weighted score against all previous interviews. Show 'Top 30% of all screened applicants' on the report. Pure client-side calculation against the existing localStorage records. No backend changes."
          />
        </div>
      </div>
    </section>
  );
}

function NextCard({ title, effort, impact, body }) {
  return (
    <article className="bs-next-card">
      <div className="bs-next-head">
        <h3 className="bs-next-title">{title}</h3>
        <div className="bs-next-meta">
          <span className="bs-next-effort">{effort}</span>
          <span className={`bs-next-impact bs-impact-${impact.toLowerCase()}`}>{impact} impact</span>
        </div>
      </div>
      <p className="bs-next-body">{body}</p>
    </article>
  );
}

/* ---------------- Retrospective ---------------- */

function RetrospectiveSection() {
  return (
    <section className="section section-cream">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">Looking back</span>
        <h2 className="section-title">
          What I'd do differently. What surprised me. What I'm proud of.
        </h2>

        <div className="bs-retro-grid">
          <article className="bs-retro-card bs-retro-wrong">
            <div className="bs-retro-tag">What I got wrong first</div>
            <h3 className="bs-retro-title">I trusted the textbook patterns too long.</h3>
            <p className="bs-retro-body">
              My first attempt at the speech loop set <code>recognition.continuous = false</code>
              {" "}because that's what every guide and the .cursorrules file says. Chrome
              auto-stopped recognition after ~2 seconds of silence — which submitted half-thought
              answers any time a candidate paused to think. I watched myself get cut off mid-sentence
              while testing.
            </p>
            <p className="bs-retro-body">
              The other early wrong direction was sending the full conversation history to Groq
              on every turn. By turn 4 the request was over the 800-token target. Token-limit
              errors hit before I'd even noticed the pattern. Switching to 'last 4 messages only'
              took 5 minutes — the lesson is that I should have read the rate-limit docs before
              writing the first integration.
            </p>
          </article>

          <article className="bs-retro-card bs-retro-surprise">
            <div className="bs-retro-tag">What genuinely surprised me</div>
            <h3 className="bs-retro-title">Two browser bugs nearly killed the demo.</h3>
            <p className="bs-retro-body">
              Chrome's <code>SpeechSynthesis</code> silently stops after about 15 seconds of
              continuous speech. The <code>onend</code> event simply never fires. I watched
              the state machine freeze in SPEAKING and could not work out why for an hour. The
              fix is a 500ms watchdog interval that force-fires onDone when speaking + pending
              both go false. Defensive code that exists only because the platform itself is buggy.
            </p>
            <p className="bs-retro-body">
              The other surprise was that Groq's <strong>6,000 TPM</strong> is the real
              constraint, not the 30 RPM I'd been planning around. RPM is generous; TPM is
              what actually clamps you when interviews stack up. Once I understood that, the
              'last 4 messages' window stopped being an optimisation and became a survival
              requirement.
            </p>
          </article>

          <article className="bs-retro-card bs-retro-proud">
            <div className="bs-retro-tag">What I'm most proud of</div>
            <h3 className="bs-retro-title">The Hush rejection. And the dummy-data dashboard.</h3>
            <p className="bs-retro-body">
              I found a real open-source model (Weya AI's Hush) that would solve a real problem
              — background-speaker noise in candidate audio. I read the model card, the
              architecture, the deployment story. I worked out two integration paths and
              built a tradeoff table. Then I wrote up the entire analysis as
              <code> docs/hush-model-analysis.md</code> and decided NOT to ship it because it
              would have meant a 2–3 day pipeline rewrite inside the deadline. That's
              engineering judgement, not just coding.
            </p>
            <p className="bs-retro-body">
              I'm equally proud of the admin-dashboard dummy-data strategy. The brief said
              admin was out of scope — I built it anyway because the recruiter persona is the
              second user. Then I hand-seeded five story-telling candidates (3 pass, 1 review,
              1 reject) so the very first time an evaluator opens <code>/admin</code> they see
              a working system with edge cases, not an empty list. The product tells its own
              story to the person who matters.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function FooterCTA() {
  return (
    <section className="section section-yellow bs-footer-cta">
      <div className="section-inner">
        <h2 className="bs-footer-title">That's the build. Thanks for reading.</h2>
        <p className="bs-footer-sub">
          Built end-to-end in roughly 8 hours of focused work. Zero infrastructure cost,
          every decision documented. Now let's talk.
        </p>
        <div className="bs-footer-actions">
          <Link to="/build-journey" className="btn-secondary bs-footer-btn">
            Read the build log →
          </Link>
          <a
            href="https://github.com/utkarshdev2411"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bs-footer-btn"
          >
            View GitHub repo →
          </a>
          <a
            href="https://www.linkedin.com/in/utkarsh-sharma-83755a24a/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary bs-footer-btn"
          >
            Connect on LinkedIn →
          </a>
          <Link to="/" className="btn-secondary bs-footer-btn">
            ← Back to Priya
          </Link>
        </div>
      </div>
    </section>
  );
}
