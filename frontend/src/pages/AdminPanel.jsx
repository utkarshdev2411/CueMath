import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminBanner from "../components/AdminBanner";
import { candidates as seedCandidates } from "../data/candidates";
import "./AdminPanel.css";

const FILTERS = ["All", "Pass", "Review", "Reject"];
const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc",  label: "Oldest first" },
  { value: "score_desc", label: "Score: high → low" },
  { value: "score_asc",  label: "Score: low → high" },
];

function loadRealInterviews() {
  try {
    return JSON.parse(localStorage.getItem("interviews") || "[]");
  } catch {
    return [];
  }
}

function normalise(record) {
  // Real interviews come from localStorage with the raw report shape.
  // Seed candidates already match the expected shape.
  if (record.report) {
    return {
      id: record.id,
      name: record.name || record.candidateName || "Candidate",
      date: record.date ? record.date.slice(0, 10) : "",
      duration: record.duration || "—",
      messages: record.messages ?? record.transcript?.length ?? 0,
      verdict: (record.report.overall || "").toLowerCase(),
      weighted_score: record.report.weighted_score ?? 0,
      summary: record.report.summary || "",
      dimensions: record.report.dimensions || {},
      red_flags: record.report.red_flags || [],
      recommendation: record.report.recommendation || "",
      _raw: record,
    };
  }
  return { ...record, _raw: record };
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function calcStats(list) {
  const total = list.length;
  const avgScore = total
    ? list.reduce((s, c) => s + (Number(c.weighted_score) || 0), 0) / total
    : 0;
  const passes = list.filter((c) => c.verdict === "pass").length;
  const passRate = total ? Math.round((passes / total) * 100) : 0;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = list.filter((c) => c.date && new Date(c.date) >= oneWeekAgo).length;
  return { total, avgScore, passRate, thisWeek };
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortKey, setSortKey] = useState("date_desc");
  const [search, setSearch] = useState("");

  const allCandidates = useMemo(() => {
    const real = loadRealInterviews().map(normalise);
    const seed = seedCandidates.map(normalise);
    return [...real, ...seed];
  }, []);

  const filtered = useMemo(() => {
    let list = activeFilter === "All"
      ? allCandidates
      : allCandidates.filter((c) => c.verdict === activeFilter.toLowerCase());

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "date_asc":   return (a.date || "").localeCompare(b.date || "");
        case "score_desc": return (Number(b.weighted_score) || 0) - (Number(a.weighted_score) || 0);
        case "score_asc":  return (Number(a.weighted_score) || 0) - (Number(b.weighted_score) || 0);
        default:           return (b.date || "").localeCompare(a.date || ""); // date_desc
      }
    });

    return list;
  }, [allCandidates, activeFilter, sortKey, search]);

  const stats = useMemo(() => calcStats(allCandidates), [allCandidates]);

  const handleView = (candidate) => {
    const reportPayload = candidate._raw?.report
      ? {
          report: candidate._raw.report,
          candidateName: candidate.name,
          transcript: candidate._raw.transcript || [],
          elapsedSeconds: candidate._raw.elapsedSeconds || 0,
        }
      : {
          report: {
            overall: candidate.verdict,
            weighted_score: candidate.weighted_score,
            summary: candidate.summary,
            dimensions: candidate.dimensions,
            red_flags: candidate.red_flags,
            recommendation: candidate.recommendation,
          },
          candidateName: candidate.name,
          transcript: [],
          elapsedSeconds: 0,
        };

    navigate(`/report/${candidate.id}`, { state: reportPayload });
  };

  return (
    <main className="admin grid-bg">
      <AdminBanner />
      <AdminNav />

      <div className="admin-shell">
        <div className="admin-header">
          <div>
            <span className="eyebrow">HR Dashboard</span>
            <h1 className="admin-title">Tutor Screening</h1>
            <p className="admin-subtitle">
              All screened candidates — sorted newest first.
            </p>
          </div>
        </div>

        <div className="stats-bar">
          <StatCard label="Total screened" value={stats.total} />
          <StatCard label="Avg score" value={`${stats.avgScore.toFixed(1)} / 5`} />
          <StatCard label="Pass rate" value={`${stats.passRate}%`} accent />
          <StatCard label="This week" value={stats.thisWeek} />
        </div>

        <div className="filter-tabs" role="tablist" aria-label="Filter by verdict">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={activeFilter === f}
              className={`filter-tab ${activeFilter === f ? "filter-tab-active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
              <span className="filter-count">
                {f === "All"
                  ? allCandidates.length
                  : allCandidates.filter((c) => c.verdict === f.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div className="admin-toolbar">
          <div className="search-wrap">
            <SearchIcon />
            <input
              type="search"
              className="search-input"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search candidates by name"
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="sort-wrap">
            <SortIcon />
            <select
              className="sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              aria-label="Sort candidates"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <p>No candidates match this filter yet.</p>
          </div>
        ) : (
          <div className="candidate-list">
            {filtered.map((c) => (
              <CandidateRow key={c.id} candidate={c} onView={handleView} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card ${accent ? "stat-card-accent" : ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function CandidateRow({ candidate, onView }) {
  const score = Number(candidate.weighted_score);
  const scoreStr = Number.isNaN(score) ? "—" : score.toFixed(1);
  const verdict = (candidate.verdict || "").toLowerCase();

  return (
    <div className="candidate-row">
      <div className="candidate-info">
        <div className="candidate-name">{candidate.name}</div>
        <div className="candidate-meta">
          <span>{formatDate(candidate.date)}</span>
          {candidate.duration && candidate.duration !== "—" && (
            <>
              <span className="meta-dot">·</span>
              <span>{candidate.duration}</span>
            </>
          )}
          {candidate.messages > 0 && (
            <>
              <span className="meta-dot">·</span>
              <span>{candidate.messages} messages</span>
            </>
          )}
        </div>
      </div>

      <div className="candidate-score-wrap">
        <span className="candidate-score">{scoreStr}</span>
        <span className="candidate-score-den">/ 5</span>
      </div>

      <VerdictBadge verdict={verdict} />

      <button
        type="button"
        className="btn-view"
        onClick={() => onView(candidate)}
        aria-label={`View report for ${candidate.name}`}
      >
        View Report
        <ArrowIcon />
      </button>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const map = {
    pass: { label: "Pass", cls: "badge-pass" },
    review: { label: "Review", cls: "badge-review" },
    reject: { label: "Reject", cls: "badge-reject" },
  };
  const { label, cls } = map[verdict] || { label: verdict || "Unknown", cls: "badge-review" };
  return <span className={`verdict-badge-small ${cls}`}>{label}</span>;
}

function AdminNav() {
  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <a href="/" className="admin-nav-back">
          <BackNavIcon /> Back
        </a>
        <span className="nav-divider" aria-hidden="true" />
        <a href="/" className="nav-logo">Cuemath</a>
        <span className="nav-divider" aria-hidden="true" />
        <span className="admin-nav-label">HR Dashboard</span>
      </div>
    </header>
  );
}

function BackNavIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
}
