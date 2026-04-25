# Project Brief — Cuemath AI Tutor Screener

## Problem being solved
Cuemath hires hundreds of tutors every month across India and 70+ countries.
Each candidate currently requires a 10-minute human phone screen to assess
communication quality, patience, warmth, and ability to explain clearly.
At scale this is slow, expensive, and inconsistent — different interviewers
weight dimensions differently, and scheduling creates a 3-5 day bottleneck
before a candidate hears back.

This project replaces round 1 screening with a 5-minute AI voice interview.
The AI assesses what human interviewers actually look for: not math depth,
but the soft qualities that predict teaching effectiveness.

## User personas

### Tutor Candidate (primary user)
- School/college graduate, mostly Indian, applying part-time or full-time
- Comfortable with smartphones, may not have used voice AI before
- Anxious about the interview — this may be their first interaction with Cuemath
- May have varying English fluency — the system must handle Indian English accents
- Uses Chrome on laptop or desktop (required for Web Speech API)

### Cuemath Hiring Manager (report consumer)
- Reviews assessment reports after the fact, does not watch the interview live
- Needs: structured rubric with specific quotes, clear pass/review/reject signal
- Cares about: can this person explain clearly? are they warm? will students like them?
- Does not care about: math knowledge at this stage

## What the product does
1. Candidate visits the link, reads a brief about the interview format
2. Clicks Start — microphone permission requested
3. AI interviewer (named Priya) greets them and begins the interview
4. 7 conversational turns: candidate speaks, AI listens, AI responds via voice
5. Questions probe: motivation, pedagogical approach, patience under stress
6. After the final turn, interview ends automatically
7. Assessment report generated: 5-dimension rubric, quotes, pass/review/reject

## Definition of done
- [ ] Candidate can complete a full 5-minute interview in Chrome
- [ ] Voice loop works reliably: speak → transcribe → API → synthesize → speak
- [ ] Assessment report renders correctly with all 5 dimensions and quotes
- [ ] Deployed to public URLs (Railway + Vercel)
- [ ] GROQ_API_KEY not exposed anywhere in frontend or public repo
- [ ] Works on a first-time visitor without any instructions beyond the landing page

## Out of scope (do not build)
- Authentication or login
- Saving interviews to a database
- Admin dashboard
- Support for non-Chrome browsers (document the requirement, show a warning)
- Mobile support (Web Speech API unreliable on mobile)
- Multiple languages (English only)
- Video recording