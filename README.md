# Cuemath AI Tutor Screener

This project is an AI-powered voice interviewer designed for Cuemath's tutor screening process. It uses a custom-tuned LLM and browser-native speech APIs to conduct an automated, 5-minute initial voice screening, producing a quantitative assessment report against a behavioral rubric.

## Design Decisions

Building this prototype required balancing user experience, latency, and system complexity. Here is the rationale behind the major architectural decisions:

### 1. Web Speech API over Whisper
Relying on the browser-native `Web Speech API` (via `SpeechRecognition` and `SpeechSynthesis`) instead of an external STT/TTS service like OpenAI's Whisper or ElevenLabs was a conscious choice for the MVP.
- **Latency**: Audio processing happens locally in real-time, removing network roundtrips for audio chunks. The time-to-first-byte (TTFB) for the AI's spoken response is simply the duration of the LLM text completion.
- **Cost & Complexity**: It removes the need for WebSocket streaming, audio chunking logic, and heavy backend infrastructure.
- **Privacy (DPDP Act)**: Audio never leaves the candidate's browser. Only the generated text transcript is sent to the backend for analysis, strictly adhering to data protection laws by minimizing PII exposure.

### 2. Stateless Backend (No DB)
The FastApi backend operates entirely without a database.
- **Simplicity**: By persisting the session state (transcript and report JSON) entirely on the client side (`localStorage`) during the MVP phase, we avoid the overhead of PostgreSQL/Redis setups, user authentication, and state synchronization.
- **Shareability**: Reports are keyed to a generated UUID and hydrated locally, keeping the focus entirely on validating the core interaction loop rather than building generic CRUD boilerplate.

### 3. Exactly 7 Turns
The interview flow is strictly capped at 7 conversation turns (Priya speaks → Candidate replies).
- **Structure over vibes**: A fixed progression guarantees that Priya covers the required diagnostic surface area (Opener → Simplification → Patience with mistakes → Values alignment → Closing). It ensures no candidate is unfairly evaluated due to an unstructured AI wandering off-topic.
- **Duration Control**: 7 turns naturally equate to a ~5-minute interview, which hits the sweet spot for a low-friction top-of-funnel screening process.

### 4. BARS-Anchored Rubric (Behaviorally Anchored Rating Scale)
Instead of asking the LLM to simply "score warmth from 1 to 5," the `ASSESSMENT_SYSTEM_PROMPT` embeds highly specific, behavioral examples for levels 1, 3, and 5 for each of the 5 core dimensions (Clarity, Simplification, Warmth, Patience, Fluency).
- **Calibration**: Large Language Models tend to default to a "nice" median (e.g., scoring everyone a 4/5). Grounding the prompt in concrete behaviors forces the LLM to evaluate actual evidence from the transcript rather than outputting "vibes-based" scores.
- **Explainability**: This ensures the AI can cite specific quotes as evidence to justify its verdict to the human recruiter.

### 5. Managing Token Limits
We used a strict TPM (Tokens Per Minute) budget, specifically designing the prompt to work within tight context windows.
- **Rolling Window**: For the conversational `/api/chat` endpoint, we only send the last 4 messages (the sliding window) plus the turn-aware system prompt. This keeps latency lightning-fast and API costs near zero, while still providing enough context for Priya to sound coherent and follow up on the immediate previous answer.
- **Full Context for Assessment**: The full transcript is only sent once, at the very end of the interview, to the `/api/assess` endpoint for the final 5-dimension evaluation.

### 6. What I Would Do Differently with More Time
- **Server-Side Audio (WebSockets + WebRTC)**: The Web Speech API is heavily Chrome-dependent and struggles with thick accents compared to Whisper. I would migrate to a WebSocket-based streaming architecture using a custom STT model to ensure cross-browser compatibility (Firefox/Safari).
- **Dynamic Turn Limits**: Instead of a hard stop at 7 turns, allow Priya to end the interview early if she detects the candidate has definitively failed (e.g., using inappropriate language) or successfully demonstrated all competencies.
- **Vector DB for RAG Calibration**: Connect the assessment LLM to a vector database containing historical, human-graded interview transcripts to dynamically calibrate the AI's scoring strictness against the human recruiting team's real-world preferences.
