# API Specification

## Base URL
Development: http://localhost:8000
Production: https://your-app.up.railway.app

## Endpoints

---

### GET /health
Health check. Used by Railway to verify the service is up.

Response 200:
{ "status": "ok" }

---

### POST /api/chat
Sends candidate's latest message and conversation history.
Returns AI's next response and whether the interview should end.

Request body:
{
  "messages": [
    { "role": "user", "content": "Hi, I'm really excited about this opportunity." },
    { "role": "assistant", "content": "That's great to hear! Tell me a little about yourself." },
    { "role": "user", "content": "I'm a final year student and I love teaching kids." }
  ],
  "turn_count": 2
}

Notes:
- messages: last 4 messages ONLY (2 candidate, 2 AI). Not the full history.
- turn_count: number of AI turns so far (starts at 0, max 7).
- System prompt is added server-side — never sent from frontend.

Response 200:
{
  "reply": "That passion really comes through. I'd love to understand your approach — imagine a 9-year-old who keeps saying fractions just don't make sense to them. How would you explain what a fraction actually is?",
  "should_end": false
}

Response 200 (final turn):
{
  "reply": "That's everything from my side — thank you so much for sharing that. Do you have any questions about what working at Cuemath is like?",
  "should_end": true
}

Response 429:
{ "detail": "Rate limit reached. Please wait a moment." }

Response 500:
{ "detail": "Something went wrong. Please try again." }

---

### POST /api/assess
Sends the complete interview transcript.
Returns structured JSON assessment report.

Request body:
{
  "transcript": [
    { "role": "assistant", "content": "Hi! I'm Priya from Cuemath..." },
    { "role": "user", "content": "Hi, I'm Ankit. I've always loved teaching..." },
    { "role": "assistant", "content": "Great to meet you Ankit! Tell me about yourself." },
    { "role": "user", "content": "..." },
    ...all turns...
  ],
  "candidate_name": "Ankit"
}

Notes:
- transcript: the FULL conversation (all turns, both roles)
- candidate_name: extracted from first candidate turn if possible, else "Candidate"
- This endpoint is called ONCE at the end of the interview only

Response 200:
{
  "overall": "pass",
  "weighted_score": 3.9,
  "summary": "Ankit demonstrated strong ability to simplify and genuine warmth throughout the interview. His patience strategy showed maturity. Fluency is excellent.",
  "dimensions": {
    "clarity":        { "score": 4, "evidence": "I'd break it into three steps — first show them a circle, then cut it in half, then ask what each part is called" },
    "simplification": { "score": 5, "evidence": "Imagine you have a pizza and four friends. If you split it equally, each person gets one out of four pieces — that's one quarter, or one-fourth" },
    "warmth":         { "score": 4, "evidence": "I always tell them that being confused means your brain is working hard, and that's a good sign" },
    "patience":       { "score": 4, "evidence": "First I'd ask them to tell me what they understand so far, because sometimes the gap is smaller than it seems" },
    "fluency":        { "score": 5, "evidence": "No notable errors across all responses" }
  },
  "red_flags": [],
  "recommendation": "Recommend advancing to round 2. Strong pedagogical instinct and natural warmth. Ask in next round about experience with younger students specifically."
}

Response 500:
{ "detail": "Assessment generation failed. Please contact support." }

---

## FastAPI CORS configuration (main.py)

from fastapi.middleware.cors import CORSMiddleware
import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ["ALLOWED_ORIGINS"].split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)