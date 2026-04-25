# Backend Run and API Checks

## How to run the server

1. Move to backend folder.

cd backend

2. Copy env template.

cp .env.example .env

3. Edit .env and set GROQ_API_KEY to your real key.

Example:
GROQ_API_KEY=gsk_your_real_key

4. Start FastAPI server.

uvicorn main:app --reload --port 8000

## Curl commands

### 1) Health check

curl -s http://localhost:8000/health

Expected response:
{"status":"ok"}

### 2) POST /api/chat - first turn (candidate just said hi)

curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hi, I am Ankit. I am really excited about this opportunity."}
    ],
    "turn_count": 0
  }' | python -m json.tool

Expected:
{"reply": "...natural question from Priya...", "should_end": false}

### 3) POST /api/chat - mid interview (last 4 messages)

curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "assistant", "content": "Tell me about yourself."},
      {"role": "user", "content": "I am a final-year student who loves teaching kids."},
      {"role": "assistant", "content": "Lovely! How would you explain fractions to a confused 9-year-old?"},
      {"role": "user", "content": "I would use pizza slices and ask them what half looks like."}
    ],
    "turn_count": 3
  }' | python -m json.tool

Expected:
should_end: false

### 4) POST /api/chat - forced end (turn_count >= 6)

curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "assistant", "content": "What would you say to a student who feels stuck?"},
      {"role": "user", "content": "I would tell them that being confused means their brain is working."}
    ],
    "turn_count": 6
  }' | python -m json.tool

Expected:
should_end: true

### 5) POST /api/chat - validation error (turn_count > 7)

curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "turn_count": 8}' | python -m json.tool

Expected:
{"detail": "Interview has already ended (turn_count > 7)."}
HTTP status: 400

### 6) POST /api/assess - full transcript

curl -s -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_name": "Ankit",
    "transcript": [
      {"role": "assistant", "content": "Hi! I am Priya from Cuemath. Tell me a bit about yourself."},
      {"role": "user", "content": "Hi, I am Ankit, a final-year engineering student. I have tutored my younger cousins in math for three years and I love it."},
      {"role": "assistant", "content": "That is lovely. How would you explain what a fraction is to a 9-year-old who says it makes no sense?"},
      {"role": "user", "content": "I would say - imagine you have a pizza and four friends. If you split it equally, each person gets one out of four slices. That one slice is one-fourth."},
      {"role": "assistant", "content": "Beautiful. What if a student keeps getting the same problem wrong even after three attempts?"},
      {"role": "user", "content": "I would ask them to tell me what they understand so far, because sometimes the gap is smaller than it seems. Then I would break the problem into tiny steps."},
      {"role": "assistant", "content": "How do you handle a student who says they are just bad at math?"},
      {"role": "user", "content": "I always tell them that being confused means the brain is working hard, and that is a good sign. Then I find one small thing they got right and build from there."},
      {"role": "assistant", "content": "Describe a time a student surprised you."},
      {"role": "user", "content": "One of my cousins once solved a geometry problem using a method I had not taught him. He made a drawing with folded paper. It was amazing."},
      {"role": "assistant", "content": "What is one thing you would improve about how math is taught today?"},
      {"role": "user", "content": "Less memorizing formulas, more real-world examples. Kids learn faster when they can see why the math matters."},
      {"role": "assistant", "content": "That is everything from my side - thank you for sharing. Do you have any questions for me?"},
      {"role": "user", "content": "Yes - what does a typical week look like for a Cuemath tutor?"}
    ]
  }' | python -m json.tool

Expected:
A full JSON object with overall, weighted_score, summary, dimensions (5), red_flags, recommendation.

### 7) POST /api/assess - malformed body (should surface pydantic 422)

curl -s -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d '{"transcript": "not a list"}' | python -m json.tool

Expected:
FastAPI validation error with HTTP status 422.
