# Next Steps — Prioritised Task List

## 🔴 High Impact — Do These First (~2–3 hrs total)

### 1. Admin / HR Dashboard (`/admin` route)
**Est. time:** ~1.5 hrs | Tags: `product-thinking`, `smart-choices`

Right now reports only appear after an interview in the same browser session. Build a `/admin` page that:
- Lists all completed interviews stored in `localStorage` (keyed by a UUID)
- Columns: candidate name, date, overall score, verdict (Hire / No Hire / Maybe)
- Each row links to the full report at `/report/:id`

This is what makes it a product, not a demo.

**Files to touch:**
- `frontend/src/pages/Admin.jsx` (new)
- `frontend/src/App.jsx` — add `/admin` route
- `frontend/src/api/interview.js` — add `saveReport(id, data)` / `listReports()` helpers that wrap `localStorage`

---

### 2. Shareable Report URL (`/report/:id`)
**Est. time:** ~45 min | Tags: `critical-for-real-use`, `smart-choices`

After the interview, generate a UUID and store the report JSON in `localStorage` keyed by that ID. The URL becomes `/report/abc123`. HR can be sent this link directly.

Right now reports vanish on refresh — that's a dealbreaker for a real hiring tool.

**Files to touch:**
- `frontend/src/pages/Report.jsx` — read ID from URL params, load from `localStorage`
- `frontend/src/App.jsx` — change route from `/report` to `/report/:id`
- `frontend/src/hooks/useInterview.js` — generate UUID and persist on assessment complete

---

### 3. README — Design Decisions Section
**Est. time:** ~30 min | Tags: `process-thinking`, `highest-ROI`

The judging criteria explicitly include "process thinking." Add a **Design Decisions** section (~400 words) to `README.md` covering:
- Why Web Speech API over Whisper
- Why stateless backend (no DB)
- Why exactly 7 turns
- Why BARS-anchored rubric
- How token limits were handled (last 4 messages, ~800 TPM budget)
- What you would do differently with more time

Most candidates submit code. You submit thinking.

---

## 🟡 Strong Differentiators — Pick 1–2

### 4. Retry / Resume Broken Interview
**Est. time:** ~1 hr | Tags: `edge-cases`, `candidate-experience`

If audio fails or the tab closes mid-interview, show a **"Resume interview"** option on the landing page. Save transcript progress to `localStorage` after each turn. Clears on completion.

**Files to touch:**
- `frontend/src/hooks/useInterview.js` — persist `messages` + `turnCount` to `localStorage` after each turn
- `frontend/src/pages/Landing.jsx` — detect stale session, show resume banner
- `frontend/src/pages/Interview.jsx` — hydrate state from `localStorage` on mount if resuming

---

### 5. Comparative Scoring — "Better than X% of candidates"
**Est. time:** ~30 min | Tags: `wow-factor`, `product-thinking`

After generating a report, compare the score against all previous interview scores stored in `localStorage`. Show on the report:

> "This candidate scored in the top 30% of all screened applicants."

No backend changes needed.

**Files to touch:**
- `frontend/src/pages/Report.jsx` — add percentile calculation helper, render the stat
- `frontend/src/api/interview.js` — add `getPercentile(score)` that reads all stored reports

---

### 6. Candidate Feedback After Report
**Est. time:** ~30 min | Tags: `delight`, `brand-fit`

Add a `feedback_for_candidate` field to the assessment JSON response. Render a personalised message on the report page:

> "Your explanation of fractions was strong. Your answers were sometimes brief — try adding examples."

Cuemath's brand is learning. This makes the screener feel educational, not just evaluative.

**Files to touch:**
- `backend/services/prompts.py` — extend assessment prompt to include `feedback_for_candidate`
- `backend/models/schemas.py` — add field to `AssessmentResponse`
- `frontend/src/pages/Report.jsx` — render the feedback card

---

### 7. Interview Calibration Mode (`/calibrate`)
**Est. time:** ~1 hr | Tags: `smart-choices`, `nobody-else-will-build-this`

Hidden route where HR can adjust rubric dimension weights (e.g. "warmth matters more than fluency"). Stores weights in `localStorage`. Report scores recalculate automatically using the custom weights.

**Files to touch:**
- `frontend/src/pages/Calibrate.jsx` (new)
- `frontend/src/App.jsx` — add `/calibrate` route
- `frontend/src/pages/Report.jsx` — read weights from `localStorage`, apply to score display

---

## 🟢 Polish Details (~30 min total)

### 8. Specific Browser Compatibility Warning
**Est. time:** ~10 min | Tags: `delight`

Instead of a generic "use Chrome" banner, detect the actual browser and say:

> "You're on Firefox — please switch to Chrome on a laptop to continue."

**Files to touch:**
- `frontend/src/pages/Landing.jsx` — use `navigator.userAgent` to identify browser by name

---

### 9. Mic Test Before Interview Starts
**Est. time:** ~20 min | Tags: `candidate-experience`, `thoughtful`

Add a 5-second mic check on the landing page — "Say anything to test your mic." Show a simple amplitude bar, confirm audio is working before the interview begins. Reduces the #1 candidate failure mode.

**Files to touch:**
- `frontend/src/pages/Landing.jsx` — add mic-test state, use `AudioContext` / `getUserMedia` for amplitude visualisation
- `frontend/src/components/MicTest.jsx` (new, optional extraction)

---

## Suggested Build Order

| # | Task | Time | Do it? |
|---|------|------|--------|
| 1 | Shareable report URL | 45 min | ✅ Must |
| 2 | Admin / HR Dashboard | 1.5 hrs | ✅ Must |
| 3 | README design decisions | 30 min | ✅ Must |
| 4 | Retry / Resume | 1 hr | Recommended |
| 5 | Comparative scoring | 30 min | Recommended |
| 6 | Candidate feedback | 30 min | Recommended |
| 7 | Specific browser warning | 10 min | Quick win |
| 8 | Mic test | 20 min | Quick win |
| 9 | Calibration mode | 1 hr | If time permits |
