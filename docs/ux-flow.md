# UX Flow — Screens and States

## Screen 1: Landing (/landing)
Purpose: Set expectations, build trust, get mic permission.

What it shows:
- Cuemath logo / name
- "AI Tutor Interview" title
- 3-line description: "This is a 5-minute voice interview. An AI interviewer will ask you
  a few questions. Speak naturally — there are no trick questions."
- System requirements note: "Please use Google Chrome on a laptop or desktop."
- Single CTA button: "Start Interview"
- On button click: request microphone permission via getUserMedia
  → if granted: navigate to /interview
  → if denied: show inline error "Please allow microphone access and refresh the page"

What it does NOT show: a form, login, or any data collection beyond the interview itself.

## Screen 2: Interview (/interview)
Purpose: The main voice interaction loop.

Layout: Full screen, centered. Minimal UI so nothing distracts from the voice experience.

Components:
- StatusIndicator (top center): shows current state visually
  - LISTENING: pulsing microphone circle, label "Listening..."
  - PROCESSING: spinner, label "Thinking..."
  - SPEAKING: waveform animation, label "Priya is speaking"
  - IDLE: static mic icon (before interview starts)

- TranscriptPanel (scrollable, below indicator):
  - Shows conversation in real-time as it happens
  - User turns: right-aligned, blue background
  - AI turns: left-aligned, gray background
  - Grows downward, auto-scrolls to latest message

- TurnCounter (small, bottom left):
  - Shows "Question 3 of 7" — gives candidate sense of progress

- No "Submit" or "Next" buttons. The voice loop is automatic.

State management in useInterview.js:
const [state, dispatch] = useReducer(interviewReducer, {
  phase: 'IDLE',           // IDLE | INTRO | LISTENING | PROCESSING | SPEAKING | COMPLETE | ASSESSING
  messages: [],            // full transcript for /api/assess
  windowMessages: [],      // last 4 messages for /api/chat
  turnCount: 0,
  error: null,
  candidateName: null,
})

Phase transitions:
IDLE → INTRO: triggered by navigation to /interview (auto-start welcome)
INTRO → LISTENING: SpeechSynthesis onend (welcome message finished)
LISTENING → PROCESSING: SpeechRecognition onresult with isFinal=true
PROCESSING → SPEAKING: /api/chat response received, SpeechSynthesis.speak() called
SPEAKING → LISTENING: SpeechSynthesis onend (if should_end=false)
SPEAKING → COMPLETE: SpeechSynthesis onend (if should_end=true)
COMPLETE → ASSESSING: /api/assess called automatically
ASSESSING → (navigate to /report): report JSON received

## Screen 3: Report (/report)
Purpose: Show assessment. This is what the hiring manager sees.

Layout: Clean document-style. Printable.

Sections:
1. Header: "Interview Assessment — [candidate name] — [date]"
2. Overall verdict: large badge (PASS / REVIEW / REJECT) + weighted score (e.g. 3.9/5.0)
3. Summary paragraph (from report.summary)
4. 5 RubricCards in a 2-column grid:
   Each card shows: dimension name, score (visual stars or number/5),
   evidence quote in italics
5. Red flags section (if array non-empty): bullet list of concerns
6. Recommendation box: HR action statement
7. Print button (window.print())

RubricCard component:
- Props: { dimension: string, score: number, evidence: string }
- Score visual: filled circles out of 5 (●●●●○ for 4/5)
- Evidence: italic, muted text, quotation marks

## Candidate experience principles
1. The AI speaks first — candidate never stares at a blank screen
2. Visual feedback at every state — candidate always knows if we're listening or processing
3. No time pressure visible — no countdown timers
4. If something breaks — clear, specific error message (not "Something went wrong")
5. Report page should feel like a real HR document — professional, not toy-like