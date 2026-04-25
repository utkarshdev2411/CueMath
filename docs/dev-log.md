# Dev Log — Living Document

Update this every session. Your AI tools will read it to understand where you are.

## Current status
Phase 1 and Phase 2 skeleton complete. No logic implemented yet.

## Build order (follow this sequence)
Phase 1 — Backend skeleton
[x] FastAPI app with CORS, /health, empty /api/chat, empty /api/assess
[x] groq_client.py with Groq connection test
[x] Pydantic schemas for all request/response models
[x] System prompts in prompts.py (empty placeholders)
[ ] /api/chat working with real Groq response
[ ] /api/assess working with real Groq response + JSON parsing

Phase 2 — Frontend skeleton
[x] React + Vite scaffold, react-router-dom routes
[x] axios client pointed at backend
[ ] Landing page with browser check and mic permission request
[ ] useSpeech hook — SpeechRecognition + SpeechSynthesis wired together
[ ] useInterview hook — state machine, all phases
[ ] Interview page rendering transcript

Phase 3 — Integration
[ ] Full voice loop working end-to-end locally
[ ] Edge cases: empty transcript, recognition errors, Groq 429
[ ] Assessment call + report JSON display

Phase 4 — Deploy
[ ] Railway deploy (backend), test /health
[ ] Vercel deploy (frontend), set VITE_API_URL
[ ] Update ALLOWED_ORIGINS on Railway with Vercel URL
[ ] Full end-to-end test on deployed URLs

## Decisions log
| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-25 | Use `openai` Python SDK (not `groq` SDK) for Groq calls | openai SDK + base_url override is the documented preferred pattern; avoids extra dependency |
| 2026-04-25 | Route stubs return `{"status": "not implemented"}` | Keeps FastAPI app bootable before logic is written |
| 2026-04-25 | `ALLOWED_ORIGINS` split on `,` at startup | Matches api-spec.md CORS config exactly |

## Bugs hit and fixed
| Bug | Fix |
|-----|-----|
| | |

## What to tell your AI at the start of each session
"Read dev-log.md. Here is my current status: [paste relevant checkbox section].
Today I want to complete: [specific phase/task]. My last blocker was: [if any]."