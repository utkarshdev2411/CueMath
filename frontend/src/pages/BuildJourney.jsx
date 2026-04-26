import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CHANGELOG } from "../data/build-story/changelog";
import { COMMITS } from "../data/build-story/commits";
import "./BuildStory.css";
import "./BuildJourney.css";

const TYPE_META = {
  built: { label: "Built", className: "type-built" },
  bug: { label: "Bug", className: "type-bug" },
  fix: { label: "Fix", className: "type-fix" },
  decision: { label: "Decision", className: "type-decision" },
  research: { label: "Research", className: "type-research" },
  pivot: { label: "Pivot", className: "type-pivot" },
};

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "bug", label: "Bugs" },
  { id: "fix", label: "Fixes" },
  { id: "decision", label: "Decisions" },
  { id: "built", label: "Built" },
  { id: "research", label: "Research" },
  { id: "pivot", label: "Pivots" },
];

export default function BuildJourney() {
  const stats = useMemo(
    () => ({
      total: CHANGELOG.length,
      bugs: CHANGELOG.filter((e) => e.type === "bug").length,
      fixes: CHANGELOG.filter((e) => e.type === "fix").length,
      commits: COMMITS.length,
    }),
    [],
  );

  return (
    <div className="bs grid-bg">
      <BuildJourneyNavbar />
      <Hero stats={stats} />
      <PhasesSection />
      <CommitTimelineSection />
      <FooterCTA />
    </div>
  );
}

/* ---------------- Navbar ---------------- */

function BuildJourneyNavbar() {
  return (
    <nav className="navbar bs-navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">Cuemath</Link>
        <div className="nav-links">
          <Link to="/build-story" className="nav-link">← Back to case study</Link>
          <a href="#phases" className="nav-link">Phases</a>
          <a href="#commits" className="nav-link">Git history</a>
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
        <span className="eyebrow">The full build journey</span>
        <h1 className="bs-hero-title">
          Every <span className="hl">phase, bug and commit</span> behind Priya.
        </h1>
        <p className="bs-hero-sub">
          This is the unedited build log. Four phases of development, every bug I hit,
          every fix I shipped, and the complete Git commit history. Bugs aren't hidden here —
          they're the point. A candidate who shows the bugs they fixed is more credible than
          one who pretends nothing went wrong.
        </p>

        <div className="bs-stats-row">
          <StatChip number={stats.total} label="Changelog entries" />
          <StatChip number={stats.bugs} label="Bugs hit" />
          <StatChip number={stats.fixes} label="Fixes shipped" />
          <StatChip number={stats.commits} label="Git commits" />
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

/* ---------------- Phases (the changelog) ---------------- */

function PhasesSection() {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return CHANGELOG;
    return CHANGELOG.filter((e) => e.type === filter);
  }, [filter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((entry) => {
      if (!map.has(entry.phase)) {
        map.set(entry.phase, { title: entry.phase_title, entries: [] });
      }
      map.get(entry.phase).entries.push(entry);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <section id="phases" className="section section-cream">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">How it was built</span>
        <h2 className="section-title">
          Four phases. Every decision, bug, fix and pivot.
        </h2>
        <p className="section-sub">
          Phase 1 stood up the backend. Phase 2 the frontend. Phase 3 wired the voice loop
          end-to-end. Phase 4 was where every interesting bug lived.
        </p>

        <div className="bs-tabs">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.id === "all"
                ? CHANGELOG.length
                : CHANGELOG.filter((e) => e.type === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                className={`bs-tab ${filter === tab.id ? "bs-tab-active" : ""}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
                <span className="bs-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="bs-journey">
          {grouped.length === 0 ? (
            <p className="bj-empty">No entries match this filter.</p>
          ) : (
            grouped.map(([phase, { title, entries }], idx) => (
              <PhaseBlock
                key={phase}
                index={idx + 1}
                phase={phase}
                title={title}
                entries={entries}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function PhaseBlock({ index, phase, title, entries }) {
  return (
    <div className="bs-phase">
      <div className="bs-phase-header">
        <div className="bs-phase-num">{String(index).padStart(2, "0")}</div>
        <div>
          <div className="bs-phase-label">{phase}</div>
          <div className="bs-phase-title">{title}</div>
        </div>
      </div>
      <div className="bs-phase-entries">
        {entries.map((entry) => (
          <ChangelogCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function ChangelogCard({ entry }) {
  const meta = TYPE_META[entry.type] || TYPE_META.built;
  return (
    <article className={`bs-change-card ${meta.className}`}>
      <div className="bs-change-head">
        <span className={`bs-type-badge ${meta.className}`}>{meta.label}</span>
        <span className="bs-change-date">{entry.date}</span>
      </div>
      <h3 className="bs-change-title">{entry.title}</h3>
      <p className="bs-change-detail">{entry.detail}</p>
      <p className="bs-change-lesson"><em>Lesson: {entry.lesson}</em></p>
    </article>
  );
}

/* ---------------- Git commit timeline ---------------- */

function CommitTimelineSection() {
  const grouped = useMemo(() => {
    const map = new Map();
    COMMITS.forEach((c) => {
      if (!map.has(c.date)) map.set(c.date, []);
      map.get(c.date).push(c);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <section id="commits" className="section section-white">
      <div className="section-inner">
        <span className="eyebrow eyebrow-muted">The commit log</span>
        <h2 className="section-title">
          Every commit. In order. Unedited.
        </h2>
        <p className="section-sub">
          Direct from the GitHub history. The full project shipped across two days of focused
          work — {COMMITS.length} commits in total.
        </p>

        <div className="bj-timeline">
          {grouped.map(([date, commits]) => (
            <div key={date} className="bj-day">
              <div className="bj-day-header">
                <span className="bj-day-dot" aria-hidden="true" />
                <h3 className="bj-day-title">{date}</h3>
                <span className="bj-day-count">
                  {commits.length} {commits.length === 1 ? "commit" : "commits"}
                </span>
              </div>
              <ol className="bj-commit-list">
                {commits.map((c) => (
                  <CommitRow key={c.id} commit={c} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommitRow({ commit }) {
  const tag = inferTag(commit.message);
  return (
    <li className="bj-commit">
      <span className={`bj-commit-tag bj-tag-${tag.kind}`}>{tag.label}</span>
      <div className="bj-commit-body">
        <p className="bj-commit-msg">{stripPrefix(commit.message)}</p>
        <div className="bj-commit-meta">
          <span className="bj-commit-author">{commit.author}</span>
          <span className="bj-commit-dot">•</span>
          <span className="bj-commit-time">{commit.relative}</span>
        </div>
      </div>
    </li>
  );
}

function inferTag(message) {
  const m = message.toLowerCase();
  if (m.startsWith("feat:") || m.startsWith("feat(")) return { kind: "feat", label: "feat" };
  if (m.startsWith("fix:") || m.startsWith("fix(")) return { kind: "fix", label: "fix" };
  if (m.startsWith("refactor:") || m.startsWith("refactor("))
    return { kind: "refactor", label: "refactor" };
  if (m.startsWith("docs:") || m.startsWith("docs(")) return { kind: "docs", label: "docs" };
  if (m.startsWith("chore:") || m.startsWith("chore(")) return { kind: "chore", label: "chore" };
  return { kind: "other", label: "other" };
}

function stripPrefix(message) {
  return message.replace(/^(feat|fix|refactor|docs|chore)(\([^)]*\))?:\s*/i, "");
}

/* ---------------- Footer ---------------- */

function FooterCTA() {
  return (
    <section className="section section-yellow bs-footer-cta">
      <div className="section-inner">
        <h2 className="bs-footer-title">That's the full log.</h2>
        <p className="bs-footer-sub">
          Want the higher-level story — features, decisions, principles, retrospective?
          Head back to the case study.
        </p>
        <div className="bs-footer-actions">
          <Link to="/build-story" className="btn-primary bs-footer-btn">
            ← Back to case study
          </Link>
          <a
            href="https://github.com/utkarshdev2411"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary bs-footer-btn"
          >
            View GitHub repo →
          </a>
          <Link to="/" className="btn-secondary bs-footer-btn">
            ← Back to Priya
          </Link>
        </div>
      </div>
    </section>
  );
}
