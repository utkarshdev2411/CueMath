// The eight overarching beliefs that guided every decision in this project.
// IDs match the principles[] tags used inside features.js so the BuildStory page
// can cross-reference principles ↔ features.

export const PRINCIPLES = [
  {
    id: "candidate-first-experience",
    title: "Candidate-first experience",
    description:
      "Every UX decision started with the same question: how does this feel to someone who is anxious, has never spoken to an AI before, and just wants a fair shot at a job? That's why the AI speaks first (no blank-screen anxiety), why the timer counts up not down, why a 24-bar audio visualizer reacts to their voice, why empty transcripts produce a gentle 'I'm listening' nudge instead of an error, why we collect their name explicitly instead of guessing it, and why elapsed-time shows progress rather than urgency. The candidate is the user; the recruiter is just the second user.",
    shown_in: [
      "Voice interview loop (AI speaks first)",
      "24-bar live audio visualizer during LISTENING",
      "Elapsed-only timer (not a countdown)",
      "Empty-transcript silent retry with progressive nudges",
      "Explicit candidate-name input (replaced fragile heuristic)",
      "Specific browser-compat warning ('You're on Firefox — switch to Chrome')",
      "Pulse / phase-tinted status indicator (always knows what's expected)",
    ],
  },
  {
    id: "zero-cost-architecture",
    title: "Zero-cost architecture",
    description:
      "The whole product runs on free tiers and browser primitives. Groq free tier for the LLM, Web Speech API for STT and TTS, Web Audio API for the visualizer, pure SVG for the radar chart, localStorage for persistence. Total infrastructure cost: ₹0. This isn't a constraint I worked around, it's a constraint I leaned into — it forces me to think about which capabilities actually matter and which are just spend on someone else's roadmap. The product would feel almost identical if I had a budget; the stack just happens to also be the cheapest version.",
    shown_in: [
      "Groq free tier (vs paid OpenAI)",
      "Web Speech API (vs Whisper $)",
      "Web Audio API audio visualizer (vs library)",
      "Pure-SVG radar chart (vs chart.js)",
      "localStorage interview + feedback persistence (vs Supabase)",
      "Hand-seeded dummy candidates (vs database fixtures)",
    ],
  },
  {
    id: "research-before-building",
    title: "Research before building",
    description:
      "I did real homework before writing real code. The BARS rubric pattern came from industrial-organisational psychology research on calibrated assessment. The 7-turn structure came from interview design research that mapped one diagnostic purpose per turn. The Hush model evaluation came from actively looking for a way to make the audio pipeline better and writing up a 6-page feasibility analysis before deciding not to ship it. Perplexity research on AI interview trust factors directly informed the AI-disclosure card and DPDP-aligned consent. Research isn't procrastination — it's the difference between building something that looks like a product and building something that holds up.",
    shown_in: [
      "BARS-anchored rubric (from I/O psychology research)",
      "Turn-aware 7-turn diagnostic structure",
      "Hush model evaluation + written feasibility doc",
      "AI disclosure card (informed by AI-trust research)",
      "Radar chart pattern (HireVue/Talview reference)",
    ],
  },
  {
    id: "stateless-by-design",
    title: "Stateless by design",
    description:
      "The backend has no memory of any conversation, candidate or session. Every /api/chat request carries its own 4-message window and turn_count. /api/assess takes the full transcript in one shot. No DB, no Redis, no session middleware. Statelessness is simpler (no schema migrations), cheaper (no DB cost), more scalable (horizontal by default), and philosophically correct (transcripts belong to the candidate, not to my random demo backend). The frontend is the source of truth — which is also the only way for the admin dashboard to merge real interviews with seeded fixtures cleanly.",
    shown_in: [
      "Stateless FastAPI backend",
      "Last-4-messages window in every /api/chat call",
      "localStorage as the source of truth for reports",
      "Frontend-driven UUIDs for /report/:id URLs",
    ],
  },
  {
    id: "transparent-ai",
    title: "Transparent AI",
    description:
      "Hiding that this is AI would be both illegal under India's DPDP Act and unethical. The AI disclosure card on the landing page tells the candidate Priya is AI, that responses will be analysed, and that a human recruiter reviews every result. The consent checkbox is explicit. The transcript is downloadable so recruiters can verify every quote the AI cited as evidence. The build-story page itself is part of this principle — showing every decision, every bug, every tradeoff is the same instinct as showing the candidate the rules of the game. AI screening only works when both sides trust the system.",
    shown_in: [
      "AI disclosure card on landing page",
      "Explicit DPDP-aligned consent checkbox",
      "'A human recruiter reviews every result' messaging",
      "Downloadable transcript on the report",
      "This build-story page itself",
      "Post-interview feedback modal (the AI asks how it did)",
    ],
  },
  {
    id: "security-by-default",
    title: "Security by default",
    description:
      "GROQ_API_KEY lives only in the backend .env, never in any frontend bundle, never in a JS file, never in the repo. CORS is locked to the exact frontend origin — no wildcards, ever. allow_credentials=False, allow_methods restricted to GET/POST. .env is gitignored; backend/.env.example documents the variables without real values. None of this is hard, all of it is non-negotiable. A leaked API key is the most expensive bug in any LLM product, and a wide-open CORS is just inviting random sites to spend your quota.",
    shown_in: [
      "GROQ_API_KEY server-side only (never in frontend)",
      "CORS locked to a specific origin (no wildcards)",
      ".env gitignored, .env.example documented",
      "allow_credentials=False, methods restricted",
      "No auth on /admin — but explicitly documented as a demo-only choice",
    ],
  },
  {
    id: "honest-tradeoffs",
    title: "Honest tradeoffs",
    description:
      "Every choice in this product was a tradeoff. Chrome-desktop only is a real cost — and it's documented at the top of known-gotchas.md, warned about on the landing page with a specific browser detection message, and explained in the build-story decisions section. The Hush rejection is documented. The 4s-silence-submit pattern goes against the .cursorrules file's 'never set continuous=true' rule, deliberately, with the reason written down. The non-existence of admin auth is signposted with a sticky banner. Real engineers document constraints — they don't hide them. A candidate who acknowledges what's limited is more trustworthy than one who pretends everything is universal.",
    shown_in: [
      "Chrome-desktop-only constraint documented + warned about explicitly",
      "Hush model written-up rejection (docs/hush-model-analysis.md)",
      "Deliberate continuous=true override of the .cursorrules rule",
      "AdminBanner ('login skipped for demo')",
      "known-gotchas.md as a first-class doc",
      "future-improvements.md written before the deadline",
    ],
  },
  {
    id: "ship-then-improve",
    title: "Ship then improve",
    description:
      "I built the core voice loop end-to-end on Phase 3 before adding a single nice-to-have. The radar chart, audio visualizer, transcript download, elapsed timer, BARS anchors, turn-aware prompting, admin dashboard, feedback modal — none of those existed when the demo first worked. The discipline was: get the spine working, then layer polish in priority order, with future-improvements.md documenting what's deferred. That doc was written before the deadline, not after — it's evidence that I knew what I wasn't building and why. The next iteration (feedback analytics) is already specced. Hush is already specced. The roadmap is real, not retrofitted.",
    shown_in: [
      "Phase order: backend → frontend → integration → polish",
      "future-improvements.md written before the deadline",
      "Feedback analytics already specced for next iteration",
      "Hush deferred with full implementation notes",
      "Admin dashboard added after core loop worked",
      "BARS anchors / turn-aware prompting added in the polish phase",
    ],
  },
];
