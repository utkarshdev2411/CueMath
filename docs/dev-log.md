# Dev Log — Living Document

Update this every session. Your AI tools will read it to understand where you are.

## Current status
**Phases 1, 2, and 3 are fully complete and working on Chrome desktop.**
- Backend: live, all endpoints verified via curl
- Frontend: full voice loop working end-to-end locally on Chrome
- Interview flow: Priya speaks → mic opens → candidate speaks → 4s silence → submit → Priya responds
- Edge cases handled: empty transcript, network errors, Groq 429, recognition errors, mic cycling
- Report page: renders dimensional scores, verdict badge, evidence quotes
- **Remaining: Phase 4 (deployment)**

---

## Build order (follow this sequence)

Phase 1 — Backend skeleton
[x] FastAPI app with CORS, /health, empty /api/chat, empty /api/assess
[x] groq_client.py with Groq connection test
[x] Pydantic schemas for all request/response models
[x] System prompts in prompts.py (empty placeholders)
[x] /api/chat working with real Groq response
[x] /api/assess working with real Groq response + JSON parsing

Phase 2 — Frontend skeleton
[x] React + Vite scaffold, react-router-dom routes
[x] axios client pointed at backend
[x] Landing page with browser check, mic permission, AI disclosure, consent checkbox
[x] useSpeech hook — SpeechRecognition (continuous mode) + SpeechSynthesis wired together
[x] useInterview hook — full state machine (IDLE → INTRO → LISTENING → PROCESSING → SPEAKING → COMPLETE → ASSESSING → DONE)
[x] Interview page rendering transcript with speaker labels and current-question banner

Phase 3 — Integration
[x] Full voice loop working end-to-end locally (Chrome desktop confirmed working)
[x] Edge cases: empty transcript (onSilence restart), recognition errors (global retry with backoff), Groq 429 (handled in groq_client.py)
[x] Assessment call + report JSON display (verdict badge, weighted score, rubric cards, evidence quotes)

Phase 4 — Deploy
[ ] Railway deploy (backend), test /health
[ ] Vercel deploy (frontend), set VITE_API_URL
[ ] Update ALLOWED_ORIGINS on Railway with Vercel URL
[ ] Full end-to-end test on deployed URLs

Phase 5 — Polish (only after live URL works)
[x] Fix pass/review/reject thresholds (done 2026-04-26)
[x] Embed BARS anchors in assessment prompt (done 2026-04-26)
[x] Turn-aware interviewer prompt (done 2026-04-26)
[x] STAR follow-up nudging (done 2026-04-26)
[x] Consent + AI disclosure on landing (done 2026-04-26)
[x] SpeechSynthesis watchdog timer (done 2026-04-26)
[x] Better voice selection for Priya (done 2026-04-26)
[x] Cuemath neo-brutalist design system applied to Landing (done 2026-04-26)
[x] Cuemath neo-brutalist design system applied to Interview + Report (done 2026-04-26)
[x] Audio visualizer — Web Audio API, 24-bar canvas during LISTENING (done 2026-04-26)
[x] Radar chart on report — pure SVG, 5-axis spider chart (done 2026-04-26)
[x] Transcript download — .txt export on Report page (done 2026-04-26)
[x] Elapsed interview timer — m:ss in navbar + footer (done 2026-04-26)
[ ] Design Decisions in README (20 min)

---

## Decisions log
| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-25 | Use `openai` Python SDK (not `groq` SDK) for Groq calls | openai SDK + base_url override is the documented preferred pattern; avoids extra dependency |
| 2026-04-25 | Route stubs return `{"status": "not implemented"}` | Keeps FastAPI app bootable before logic is written |
| 2026-04-25 | `ALLOWED_ORIGINS` split on `,` at startup | Matches api-spec.md CORS config exactly |
| 2026-04-25 | `/api/chat` enforces `turn_count > 7` with HTTP 400 | Prevents runaway interviews; matches api-spec.md contract |
| 2026-04-25 | `/api/assess` uses Pydantic `list` validation on `transcript` field | FastAPI auto-returns 422 with `list_type` detail on bad input — no custom error handling needed |
| 2026-04-25 | Turn-aware interviewer prompt with `TURN_GUIDANCE` dict | Each turn has a specific diagnostic purpose (opener → pedagogy → patience → values → failure → confidence → close). Consistent structured interviews across all candidates |
| 2026-04-25 | BARS-anchored assessment with 3-tier verdict (pass/review/reject) | Embeds behavioral anchors (level 1/3/5) per dimension so LLM scores against concrete behaviors, not vibes. Thresholds: pass ≥ 3.5, review 2.5–3.4, reject < 2.5 |
| 2026-04-25 | STAR follow-up nudging in interviewer prompt | If candidate gives vague/one-word answer, AI probes for specific example (Situation, Action, Result) |
| 2026-04-25 | AI disclosure + consent checkbox on Landing page | DPDP Act compliance; builds candidate trust by disclosing AI nature upfront; Start button disabled until consent given |
| 2026-04-25 | `recognition.continuous = true` with `SUBMIT_SILENCE_MS = 4000` | `continuous = false` auto-stops after ~2s of Chrome-detected silence — too short for natural speech pauses. With `continuous = true` we control submission: 4s of silence after last word fires submission |
| 2026-04-25 | Separate `promptTimerRef` for no-speech detection (8s) | Detects when candidate says nothing at all. After 8s, Priya speaks a TTS nudge ("I'm listening — go ahead") before restarting the mic |
| 2026-04-25 | `silenceStreakRef` in useInterview for progressive nudge | Counts consecutive no-speech events. Streak 1 → gentle TTS prompt; Streak 2 → patient TTS prompt; Streak 3+ → silent restart (no nagging) |
| 2026-04-25 | `globalNetworkFailuresRef` (not per-call) for network error recovery | Per-call counter was reset on every `listenForCandidate()` call → infinite mic cycling on Ubuntu. Global counter accumulates across all calls, stops at 5 failures |
| 2026-04-25 | "Current Question" banner on Interview page | Shows Priya's latest question as readable text while mic is open. Makes MVP testing easier and helps candidates who miss audio |
| 2026-04-25 | Speaker labels ("Priya" / "You") on transcript bubbles | Clarity for tester and candidate about who said what in the conversation |
| 2026-04-26 | Fixed assessment verdict thresholds and tiers in `ASSESSMENT_SYSTEM_PROMPT` | Was: `pass ≥ 3.0, else "fail"`. Now: `pass ≥ 3.5`, `review 2.5–3.4`, `reject < 2.5` — matches `assessment-rubric.md`. `Report.jsx` already handled all three strings but LLM never emitted "review" or "reject" until this fix |
| 2026-04-26 | Embedded BARS anchors (levels 1, 3, 5) for all 5 dimensions in `ASSESSMENT_SYSTEM_PROMPT` | LLM was scoring on vague one-line descriptions. Anchors give concrete behavioral examples per score level so scoring is calibrated, not vibes-based. Adds ~60 tokens; still within budget |
| 2026-04-26 | `build_interviewer_prompt(turn_count)` replaces static `INTERVIEWER_SYSTEM_PROMPT` | Each of the 7 turns now has a specific diagnostic focus (warm opener → simplification → stuck-student → tutor mistakes → failure story → Cuemath fit → close). Prevents LLM from repeating question types or missing a dimension |
| 2026-04-26 | STAR follow-up rules added to `_INTERVIEWER_BASE` + per-turn follow-up triggers | Global STAR rule (ask for situation/action/result on vague answers) + turn-specific triggers from `interview-design.md` (e.g., turn 1: "if no example, ask them to walk through exactly what they'd say step by step"). Per `assessment-rubric.md` evidence rules, structured answers produce quotable evidence; STAR probes make those quotes more diagnostic. All 7 turns still <350 tokens |
| 2026-04-26 | AI disclosure card + consent checkbox on Landing page, Start button gated on `consented` | DPDP Act compliance and candidate trust: discloses Priya is AI, explains responses are analyzed for communication/teaching skills, notes a human recruiter reviews results. Checkbox must be ticked to enable Start. Disclosure existed in earlier plan but was not yet implemented — Landing had only browser/mic checks |
| 2026-04-26 | SpeechSynthesis watchdog + keepalive in `useSpeech.speak()` | Chrome has two known bugs: (1) after ~15s of continuous speech `onend` silently never fires, freezing the state machine in SPEAKING; (2) long utterances can self-pause. Fixed with a 500ms watchdog `setInterval` that force-calls onDone when `speaking` + `pending` go false after synthesis had started, plus a 10s keepalive that calls `resume()` only when `paused` is actually true (aggressive pause/resume caused duplicate audio on some Chrome builds). A shared `finished` flag prevents double-firing between watchdog / onend / onerror |
| 2026-04-26 | `pickPriyaVoice()` voice-selection ladder in `useSpeech` | Default behaviour (first `en-US` voice) produced a generic American male voice on most Chrome installs, breaking the "Priya" character. New ladder: (1) `en-IN` with "female" in the name, (2) any `en-IN`, (3) any `en-*` female, (4) named-voice hints (Google UK Female, Samantha, Zira, Karen, Victoria), (5) first `en-US`, (6) first available. Falls through gracefully on any platform |
| 2026-04-26 | Landing page split into 3-step flow (intro → consent → preparing) | Single-page Landing was dense and mixed "what this is" with legal consent. New stepper: Step 1 "How it works" + 5 metrics + tips + Next button; Step 2 disclosure + consent checkbox + Back/Start; Step 3 full-screen loader "Preparing your interview…" that runs mic+synth priming then navigates. Preserves user-gesture requirement for SpeechSynthesis (priming happens inside the Start button handler before nav) |
| 2026-04-26 | Adopted Cuemath neo-brutalist design system globally (Landing + Interview + Report) | `docs/design-guidelines/` defines the visual language (yellow #FAC02E, ink-black 2px borders, 4/6/8px hard-offset shadows with no blur, pastel section backgrounds, Poppins 800 for headings, Inter for body, JetBrains Mono for numbers, 24px graph-paper grid bg). Replaced soft-shadow SaaS look to match cuemath.com. Scoped palette lives in `index.css` `:root` tokens so all pages inherit consistently. Landing gained a full marketing hero + 3-column pastel feature cards + rubric pills + CTA band + footer. Interview gained a sticky nav with live progress track and dot row, pastel status card that reflects phase (mint=listening, cream=speaking, lavender=thinking), bordered transcript card with yellow user bubbles and cream AI bubbles, and a footer with phase pill + elapsed timer. Report gained pastel verdict card, radar chart, dimension cards with stable colour-per-dimension, and a yellow CTA footer band |
| 2026-04-26 | Audio visualizer during LISTENING phase (Web Audio API) | Static pulsing circle replaced with a live 24-bar FFT visualizer on a `<canvas>`. New `useAudioVisualizer` hook acquires its own mic stream via `getUserMedia`, creates `AudioContext + AnalyserNode` with `fftSize=128` and `smoothingTimeConstant=0.75`, reads `getByteFrequencyData` in a requestAnimationFrame loop, down-samples 64 bins into 24 bars. `AudioVisualizer` component renders DPR-aware yellow-gradient bars with an idle sine-wave shimmer so the viz never looks frozen. Mic is only held while `active=true` and released on cleanup — coexists with `SpeechRecognition` because browsers allow multiple consumers of the same mic stream. Zero cost, pure browser API |
| 2026-04-26 | SVG radar chart on Report page (no library) | Replaced 5 dot rows (●●●●○) with a 5-axis radar/spider chart. Pure SVG, ~120 lines, zero dependencies. Axes at 72° starting at 12 o'clock, grid rings at scores 1–5 (innermost faint, outermost bold 2px), candidate polygon filled in translucent yellow with a 2.5px black stroke and a hard offset shadow copy to match neo-brutalist aesthetic. Per-axis labels in Poppins with a numeric sub-label in JetBrains Mono (e.g. "Clarity / 4.2/5"). `radarDraw` keyframe scales the polygon in on mount. Inspired by HireVue/Talview assessment dashboards |
| 2026-04-26 | Transcript download on Report page | Interview page now forwards `messages` array via `navigate("/report", { state: { transcript, ... } })`. Report page has two download entry points (compact button in hero + full CTA in footer band). `transcriptToText()` serialises with a metadata header (candidate, date, verdict, score) and `Speaker:\nmessage\n` bodies. `downloadText()` creates a `Blob`, `URL.createObjectURL`, triggers download via a temp `<a>`, and revokes the URL. Filename is slugified to `cuemath-interview-<name>.txt`. Enables recruiters to spot-check the AI's evidence quotes against the full conversation |
| 2026-04-26 | Elapsed interview timer in Interview navbar + footer | `useState(0)` + `setInterval` that starts when phase leaves IDLE and stops on ASSESSING/DONE. Formatted as `m:ss` in the nav timer pill and footer meta, and forwarded to Report as `elapsedSeconds` where it's shown as "5m 23s interview" in the meta row. Intentionally elapsed-only (not a countdown) per `ux-flow.md` "No time pressure visible" — elapsed time reduces anxiety by showing progress, a countdown would induce it |
| 2026-04-26 | Redesigned `RubricCard` with stable colour-per-dimension (not nth-child) | Previous version was a plain white card with dot rows. New version rotates through the Cuemath pastel palette but keyed to dimension name (clarity→mint, simplification→lavender, warmth→salmon, patience→sky, fluency→pink) — stable if dimension ordering changes. Adds a bold Poppins heading, a one-liner hint, a big JetBrains Mono score pill ("4.2 / 5"), an animated yellow score bar, and a styled evidence blockquote with a giant Poppins `"` glyph. Hover lift effect with increased hard shadow |
| 2026-04-26 | Phase-tinted `StatusIndicator` with integrated audio visualizer | Previous version was a centered `88px` circle showing one of four mini-indicators. New version is a horizontal card with a bordered "Priya" avatar (yellow with a live-status dot that pulses green during LISTENING), a Poppins label + Inter sublabel, and a right-slot visual that changes per phase: audio visualizer during LISTENING, spinning ring during PROCESSING/ASSESSING, 5 animated bars during SPEAKING/INTRO, static bordered mic during IDLE/COMPLETE/DONE. Background colour shifts per phase (mint/cream/lavender) so the candidate knows what's expected without reading the label |

---

## Bugs hit and fixed
| Bug | Fix |
|-----|-----|
| Pasting `Expected:` comment lines into terminal caused `command not found` errors | Run `curl` command alone without inline comment annotations |
| `network` SpeechRecognition error retry called `.start()` on dead instance → `InvalidStateError` → immediately showed "Network error while listening" | Retry now calls `startListening()` with a fresh `SpeechRecognition` instance; `_isRetry: true` flag prevents reset of `networkRetryAttemptedRef` so a second consecutive failure surfaces the error instead of looping forever |
| "Network error while listening" banner after Priya speaks | `networkRetryAttemptedRef` was reset on every fresh `startListening()` call → infinite mic cycling. Fixed with `globalNetworkFailuresRef` that persists across calls. Retries with backoff (1s, 2s), hard stop at 5 failures |
| Mic activating and deactivating rapidly on Ubuntu (Brave browser) | Web Speech API not supported on Brave — only Chrome. Detection added on Landing page. Fixed by testing on Chrome |
| Mic cycling even on Chrome | Same `globalNetworkFailuresRef` fix above |
| Candidate answer submitted after 2s pause (breathing / thinking) | `continuous = false` lets Chrome auto-stop after ~2s. Switched to `continuous = true` + 4s silence timer. Buffer accumulates all `isFinal` chunks; submits only after 4s of complete silence |
| ESLint `react-hooks/refs` in `AudioVisualizer` — "Cannot update ref during render" | React 19's stricter rules disallow `barsRef.current = bars` directly in the component body. Moved the ref sync into a dedicated `useEffect(() => { barsRef.current = bars }, [bars])`. The rAF draw loop still reads from the ref, so it always sees the freshest frequency data without re-running the expensive canvas-setup effect each frame |

---

## Known environment issues
| Environment | Issue | Workaround |
|-------------|-------|------------|
| Brave / Firefox / Safari | Web Speech API not supported | Use Google Chrome on desktop only |
| Ubuntu + Chrome (snap) | Chrome audio sandbox can't reach `speech.googleapis.com` → instant "network" error | Try `sudo snap connect chromium:audio-record`, restart Chrome |
| Ubuntu + Chrome (any) | PulseAudio/PipeWire may not route mic to Chrome | Open `pavucontrol` → Recording tab → confirm Chrome is capturing the correct input |
| Ubuntu + Chrome (any) | Mic permission blocked in Chrome settings | Go to `chrome://settings/content/microphone`, remove block rules, refresh |

---

## What to tell your AI at the start of each session
"Read dev-log.md. Here is my current status: [paste relevant checkbox section].
Today I want to complete: [specific phase/task]. My last blocker was: [if any]."