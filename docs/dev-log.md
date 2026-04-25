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

---

## Bugs hit and fixed
| Bug | Fix |
|-----|-----|
| Pasting `Expected:` comment lines into terminal caused `command not found` errors | Run `curl` command alone without inline comment annotations |
| "Network error while listening" banner after Priya speaks | `networkRetryAttemptedRef` was reset on every fresh `startListening()` call → infinite mic cycling. Fixed with `globalNetworkFailuresRef` that persists across calls. Retries with backoff (1s, 2s), hard stop at 5 failures |
| Mic activating and deactivating rapidly on Ubuntu (Brave browser) | Web Speech API not supported on Brave — only Chrome. Detection added on Landing page. Fixed by testing on Chrome |
| Mic cycling even on Chrome | Same `globalNetworkFailuresRef` fix above |
| Candidate answer submitted after 2s pause (breathing / thinking) | `continuous = false` lets Chrome auto-stop after ~2s. Switched to `continuous = true` + 4s silence timer. Buffer accumulates all `isFinal` chunks; submits only after 4s of complete silence |

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