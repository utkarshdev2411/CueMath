# Dev Log — Living Document

Update this every session. Your AI tools will read it to understand where you are.

## Current status
[ ] Not started

## Build order (follow this sequence)
Phase 1 — Backend skeleton
[ ] FastAPI app with CORS, /health, empty /api/chat, empty /api/assess
[ ] groq_client.py with Groq connection test
[ ] Pydantic schemas for all request/response models
[ ] System prompts in prompts.py
[ ] /api/chat working with real Groq response
[ ] /api/assess working with real Groq response + JSON parsing

Phase 2 — Frontend skeleton
[ ] React + Vite scaffold, react-router-dom routes
[ ] axios client pointed at backend
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
| | | |

## Bugs hit and fixed
| Bug | Fix |
|-----|-----|
| | |

## What to tell your AI at the start of each session
"Read dev-log.md. Here is my current status: [paste relevant checkbox section].
Today I want to complete: [specific phase/task]. My last blocker was: [if any]."