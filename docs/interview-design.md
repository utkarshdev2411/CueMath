# Interview Design — Conversation Architecture

## Philosophy
This is not a Q&A test. It's a conversation that reveals character.
The AI listens carefully, follows up on vague answers, and closes naturally.
The candidate should feel heard, not interrogated.

## Interview structure (7 AI turns)

### Turn 1 — Warm welcome + opener
Purpose: Reduce anxiety, collect name, get candidate talking.
Prompt intent: "Tell me about yourself and why tutoring interests you."
What to look for: fluency, enthusiasm, self-awareness.
Follow-up trigger: if answer is under 3 sentences, ask what specifically drew them to teaching children.

### Turn 2 — Core pedagogical question
Purpose: The single most revealing question for tutor quality.
Prompt intent: "Imagine a 9-year-old who keeps saying fractions don't make sense.
How would you actually explain what a fraction is?"
What to look for: use of concrete examples (pizza, pie, sharing), age-appropriate language,
avoidance of jargon, patience implicit in the explanation style.
Follow-up trigger: if they give a definition without an example, ask "can you walk me
through what you'd actually say to the child, step by step?"

### Turn 3 — Scenario / patience under stress
Purpose: Reveals patience and problem-solving instinct.
Prompt intent: "A student has been staring at a problem for 5 minutes. They say
'I just don't get it.' What do you do next, specifically?"
What to look for: do they ask questions (diagnose before fixing)? do they show empathy?
do they break the problem down smaller? or do they just re-explain the same way?
Follow-up trigger: if they say "I'd explain it differently" — ask how specifically.

### Turn 4 — Values probe
Purpose: Tests for genuine care vs scripted answers.
Prompt intent: "What do you think is the biggest mistake tutors make with struggling students?"
What to look for: insight, self-awareness, student-centric thinking.
Follow-up trigger: if the answer is generic ("being impatient"), ask for a specific example.

### Turn 5 — Handling failure
Purpose: Growth mindset and reflection.
Prompt intent: "Think of a time you tried to explain something and the other person
still didn't understand. What did you do?"
What to look for: self-awareness, adaptability, non-defensiveness.
No mandatory follow-up — let them finish.

### Turn 6 — Confidence check
Purpose: English fluency + composure under open-ended question.
Prompt intent: "Why do you think you'd be a good fit for teaching at Cuemath specifically,
compared to other teaching roles?"
What to look for: research into Cuemath, coherent argument, confidence without arrogance.

### Turn 7 — Warm close
Purpose: Professional close, leave a good impression.
Prompt intent: "That's everything from my side. Do you have any questions about
what working with Cuemath is like?"
Note: AI should answer one question if asked (keep answer to 2 sentences), then close.

## Turn management rules
- Maximum 7 AI turns. Hard limit in backend (turn_count field in request).
- If turn_count >= 7, backend sets should_end: true regardless of conversation state.
- If candidate gives a one-word or empty response: AI should ask one gentle follow-up.
  Do not advance to the next question on a non-answer.
- If candidate goes off-topic: redirect with "That's interesting — coming back to..."
- If candidate's audio fails (empty transcript from SpeechRecognition):
  Frontend should show "I didn't catch that — please try again" without calling backend.
- Total interview time: approximately 5 minutes. No hard timer — turn limit enforces this.

## State machine
IDLE
  ↓ user clicks Start, mic permission granted
INTRO (AI speaks welcome message, no user input yet)
  ↓ welcome speech ends (SpeechSynthesis onend)
LISTENING (SpeechRecognition starts, candidate speaks)
  ↓ SpeechRecognition onresult (isFinal = true)
PROCESSING (transcript sent to /api/chat, waiting for response)
  ↓ response received
SPEAKING (AI response fed to SpeechSynthesis)
  ↓ SpeechSynthesis onend
LISTENING (if turn_count < 7)
COMPLETE (if should_end = true or turn_count = 7)
  ↓ POST /api/assess with full transcript
ASSESSING (spinner shown while report generates)
  ↓ report JSON received
REPORT (navigate to /report with report data)

## Edge cases and handling

| Situation | Detection | Handling |
|-----------|-----------|----------|
| Microphone denied | getUserMedia rejection | Show clear error: "Please allow microphone access in Chrome and refresh" |
| Empty transcript | transcript === "" after onresult | Show "I didn't catch that" — do NOT call backend. Restart recognition. |
| Recognition error: network | onerror event.error === "network" | Restart recognition once. If fails again, show "Connection issue — please check your internet" |
| Recognition error: no-speech | onerror event.error === "no-speech" | Prompt: "Take your time — I'm still listening." Restart recognition. |
| Groq 429 rate limit | HTTP 429 from backend | Retry after 2 seconds once. Show "One moment..." to candidate. |
| Groq non-JSON response on assess | JSON.parse fails | Retry /api/assess once with stricter prompt. If fails again, show partial report with error note. |
| SpeechSynthesis not speaking | onend fires immediately | Some browsers need a dummy utterance first. Call speechSynthesis.speak(new SpeechSynthesisUtterance("")) on first user interaction. |
| Browser is not Chrome | !('webkitSpeechRecognition' in window) | Show banner: "This interview requires Google Chrome on a laptop or desktop." |

## Token budget management
Groq free tier: 6,000 TPM. Each /api/chat call must stay under 800 tokens total.
Strategy: send only the last 4 messages (2 candidate + 2 AI) plus system prompt.
System prompt target: under 350 tokens.
AI response target: under 150 tokens per turn (short conversational replies).
Assessment call: single call, full transcript, ~500 tokens in, ~600 tokens out. Fine.