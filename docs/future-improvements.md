# Future Improvements — After Phase 4 Is Complete

Do these AFTER your current ux-flow and dev-log build order (Phases 1–4) are done and deployed.
These are the things that will take your submission from "solid working prototype" to "this person thinks like a product engineer."

All items below are zero-cost (Groq free tier + browser APIs only).

---

## 🔴 Critical Fixes (do first — they affect correctness)

### 1. Fix pass/review/reject threshold mismatch in prompts.py

Your `assessment-rubric.md` defines three tiers:
- Pass: weighted_score >= 3.5
- Review: 2.5 – 3.4
- Reject: < 2.5

But your `ASSESSMENT_SYSTEM_PROMPT` in `prompts.py` currently says:
```
Set overall to "pass" if weighted_score >= 3.0, otherwise "fail".
```

Problems:
- Threshold is 3.0 instead of 3.5
- Says "fail" instead of "reject"
- Missing "review" tier entirely
- Your Report.jsx already handles all three tiers — but the LLM will never generate "review" or "reject"

Fix: Update the assessment prompt to use three tiers with the correct thresholds from your rubric doc.

### 2. Embed BARS anchors in the assessment prompt

Your `assessment-rubric.md` has detailed behavioral anchors for each score level (e.g., score 5 for patience = "Explicitly diagnoses why the student is stuck before re-explaining. Tries a different angle. Normalizes struggle.").

But the actual assessment prompt only has one-line descriptions like `"patience: Approach when a student struggles or doesn't understand"`.

Without the anchors, the LLM scores on vibes. With them, it scores against concrete behavioral descriptions — which is exactly what the Perplexity research calls Behaviorally Anchored Rating Scales (BARS).

Fix: Embed at least the level-1, level-3, and level-5 anchors for each dimension into the prompt. You have plenty of token budget for the assessment call (~2,150 tokens per known-gotchas.md), so adding ~150 tokens of anchors is fine.

---

## 🟡 High-Impact Polish (these show product thinking)

### 3. Turn-aware interviewer prompt

Your `interview-design.md` has a brilliant 7-turn architecture where each turn has a specific purpose (Turn 1 = warm opener, Turn 2 = core pedagogy, Turn 3 = patience under stress, etc.).

But the actual interviewer system prompt just says "Cover all five qualities across the 7 turns" — so the LLM picks topics randomly and sometimes repeats the same question type.

Fix: Create a `TURN_GUIDANCE` dictionary keyed by `turn_count` (0–6), where each entry describes what that turn should focus on. Then build a `build_interviewer_prompt(turn_count)` function that appends the relevant guidance to the base prompt. Pass `turn_count` into it from `groq_client.py`.

Example turn guidance:
- Turn 0: "Greet warmly, ask about themselves and why tutoring interests them."
- Turn 1: "Ask how they'd explain fractions to a 9-year-old."
- Turn 2: "Present the stuck-student scenario — 5 minutes, says 'I just don't get it.'"
- Turn 3: "Ask what they think is the biggest mistake tutors make."
- Turn 4: "Ask about a time they tried to explain something and it didn't work."
- Turn 5: "Ask why they'd be a good fit for Cuemath specifically."
- Turn 6: "Thank them warmly, ask if they have questions, close."

### 4. STAR method follow-up nudging

The Perplexity research heavily emphasizes STAR (Situation, Task, Action, Result) as the best way to get assessment-worthy signal from candidates.

Fix: Add to the interviewer system prompt:
- "If a candidate gives a vague or generic answer, probe for a specific example: ask about the situation, what they did, and the result."
- "If they say 'I would explain it differently' without details, ask them to walk through exactly what they'd say step by step."

### 5. Consent & AI disclosure on Landing page

Your Landing page currently has no mention that Priya is an AI. The problem statement says "The candidate experience. This might be someone's first interaction with Cuemath. Professional, welcoming, fair." The research shows transparency is the #1 trust factor, and India's DPDP Act requires clear consent.

Fix: Add a small disclosure card to the landing page:
- An icon and "About this interview" heading
- Text: "You'll be speaking with Priya, our AI interviewer. Your responses will be analyzed to assess communication and teaching skills. A human recruiter reviews all results — this is not the final hiring decision."
- A consent checkbox: "I understand this interview is conducted by AI and consent to proceed."
- Disable the Start button until the checkbox is checked

### 6. SpeechSynthesis 15-second Chrome bug

Chrome has a well-known bug where `SpeechSynthesis` silently stops after ~15 seconds of continuous speech. The `onend` event never fires, which would freeze your interview state machine (stuck in SPEAKING, never transitions to LISTENING).

Fix: After calling `speechSynthesis.speak(utterance)`, start a watchdog interval that polls every 500ms. If `speechSynthesis.speaking` becomes false but `onend` hasn't fired yet, force the callback. Use a `finished` flag to prevent double-firing between the watchdog and the real `onend`.

### 7. Better voice selection for Priya

The current `useSpeech.js` picks the first `en-US` voice. On most Chrome installs this is a generic American male voice — which breaks the "Priya" character.

Fix: Try voices in this preference order:
1. `en-IN` with "female" in the name
2. Any `en-IN` voice
3. Any `en-*` voice with "female" in the name
4. Named voices like "Google Female", "Samantha", "Zira"
5. Fall back to first `en-US` voice

---

## 🟢 Wow-Factor Differentiators (these are what separate you from other candidates)

### 8. Real-time audio visualizer (Web Audio API)

During LISTENING, replace the static pulsing circle with a live audio waveform/bar visualizer. This makes the app feel alive and professional — like a real voice AI product.

How: Use `AudioContext` + `createAnalyserNode` from the mic stream (you already have getUserMedia permission from Landing). Read `getByteFrequencyData()` in a `requestAnimationFrame` loop and draw ~20-24 bars on a `<canvas>` element. About 50-60 lines of code in a `useAudioVisualizer` hook.

Cost: Zero — pure browser API.

### 9. SVG radar chart on Report page

Replace the `●●●●○` dot display with a radar/spider chart showing all 5 dimensions at a glance. This is what real assessment tools (HireVue, Talview) use.

How: Pure SVG component, no library needed (~80 lines of JSX). 5 axes at 72° intervals, grid rings at levels 1–5, a filled polygon for the candidate's scores, and labels at each vertex. Use your existing CSS variables for colors.

### 10. Transcript download on Report page

Add a "Download Transcript" button next to the Print button. Export the full conversation as a `.txt` file using `URL.createObjectURL(new Blob(...))`.

Why: The problem statement's hiring manager persona wants to spot-check the AI's evidence quotes against the full conversation. This shows you understand both user personas (candidate AND recruiter).

How: Pass the `messages` array through to the Report page via `navigate("/report", { state: { report, candidateName, transcript: messages } })`. Then generate a Blob with formatted lines and trigger a download.

### 11. Elapsed interview timer (subtle, non-pressuring)

Show elapsed time in the interview footer (e.g., "2:34"). NOT a countdown — just elapsed. Your `ux-flow.md` says "No time pressure visible" — elapsed time is different from a countdown. It actually reduces anxiety because the candidate can see the interview is progressing normally.

How: `useState(0)` + `setInterval` that starts when phase leaves IDLE and stops on ASSESSING/DONE. Format as `m:ss`.

### 12. Design Decisions section in your README

This is meta, but it's what gets you hired. Most candidates submit code. You should also submit thinking. Add a section to your root README explaining WHY you made certain choices:

Suggested content:
- **Why Web Speech API instead of Whisper**: Zero latency, zero cost, Chrome-only tradeoff mitigated by browser detection.
- **Why BARS-anchored assessment**: Research shows behaviorally anchored rating scales reduce evaluator subjectivity. Concrete behavioral descriptions embedded in the prompt.
- **Why 7 turns with turn-aware prompting**: Each turn has a specific diagnostic purpose. Consistent structured interviews are critical for assessment fairness.
- **Why stateless backend**: Client sends last 4 messages per request. Server stays under 800 tokens/call. Scales horizontally.
- **Bias considerations**: Assessment is purely content-based. No scoring based on accent, speaking rate, or prosody. Fluency dimension assesses comprehension barriers, not nativeness. Aligns with Cuemath's global hiring across 70+ countries.
- **DPDP compliance**: AI disclosure and consent before interview. No voice recordings stored. Transcript processing only.

---

## Priority order

| #  | Item | Effort | Impact |
|----|------|--------|--------|
| 1  | Fix pass/review/reject thresholds | 5 min | 🔴 Critical |
| 2  | Embed BARS anchors in assessment prompt | 15 min | 🔴 Critical |
| 3  | Turn-aware interviewer prompt | 30 min | 🟡 High |
| 4  | STAR follow-up nudging in prompt | 10 min | 🟡 High |
| 5  | Consent & AI disclosure on landing | 20 min | 🟡 High |
| 6  | SpeechSynthesis watchdog timer | 10 min | 🟡 High |
| 7  | Better voice selection for Priya | 10 min | 🟡 Medium |
| 8  | Audio visualizer | 1 hr | 🟢 Wow |
| 9  | Radar chart on report | 1 hr | 🟢 Wow |
| 10 | Transcript download | 15 min | 🟢 Nice |
| 11 | Elapsed timer | 15 min | 🟢 Nice |
| 12 | Design Decisions in README | 20 min | 🟢 Wow |

Total estimated effort: ~4-5 hours to go from "solid" to "impressive."

---

## Phase 6 — Feedback Analytics

These items build on the post-interview feedback modal (implemented 2026-04-26) that collects candidate star ratings and optional comments into `localStorage["candidate_feedback"]`.

- **Admin dashboard shows average candidate experience rating** — aggregate all entries in `candidate_feedback`, display as a stat card alongside total screened / pass rate. Gives HR a real-time NPS-style pulse on interview quality.
- **Flag interviews where rating < 3 for human review of Priya's behaviour** — in the Admin candidate list, show a ⚠️ indicator next to any row whose feedback rating is below 3. Helps identify sessions where the AI may have behaved poorly, been confusing, or caused candidate drop-off.
- **Export feedback CSV for quarterly UX review** — add an "Export CSV" button on the Admin dashboard that serialises all feedback entries (id, name, date, rating, comment) as a downloadable `.csv`. Zero backend needed — pure `Blob` + `URL.createObjectURL`.
- **Correlate low feedback scores with specific question turns** — join `candidate_feedback` entries with the matching interview record (same `id`) from `localStorage["interviews"]`. For each low-rated interview, inspect the transcript to identify which turns had the shortest candidate replies (a proxy for discomfort or confusion). Surface this as a "turn quality" heatmap in the Admin dashboard.
