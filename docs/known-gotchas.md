# Known Gotchas — Read Before You Build

## Web Speech API

### Continuous mode is broken — never use it
Setting recognition.continuous = true causes Chrome to accumulate all results
in a growing array. After turn 3, your transcripts will include text from all
previous turns. Use non-continuous mode: each candidate turn gets a fresh
SpeechRecognition instance, call .start(), get the onresult, then discard the object.

### SpeechSynthesis blocked on first call
Browsers require a user gesture (click) before allowing audio playback.
If you call speechSynthesis.speak() before any click has happened, it will
silently fail. Fix: in the Landing page's "Start Interview" button handler,
fire a dummy utterance: speechSynthesis.speak(new SpeechSynthesisUtterance("")).
This opens the audio context. All subsequent calls will work.

### Recognition restarts after SpeechSynthesis ends
You MUST wait for SpeechSynthesis onend before starting SpeechRecognition.
If you start recognition while the AI is still speaking, it will transcribe
the AI's voice as candidate input. Always chain: synth.onend → rec.start().

### "network" error on recognition
This is Chrome sending audio to Google's servers and getting a connection error.
Usually transient. Strategy: on network error, wait 1 second and call .start() again.
After 3 consecutive network errors, show the user an error message.

### "no-speech" error
Chrome stops recognition after ~7 seconds of silence and fires this error.
This is normal — the candidate paused. Simply restart recognition and show
"Still listening..." text. Do not treat this as a failure.

## Groq API

### 6,000 TPM is the real bottleneck, not RPM
You only get 6,000 tokens per minute. An interview turn with a 350-token system
prompt + 4 messages + 150-token response = ~650 tokens. At 30 RPM you theoretically
have headroom, but if multiple users hit the system simultaneously, TPM runs out fast.
Mitigation: keep system prompt lean, send only last 4 messages per request.

### Assessment call can exceed 800 tokens
The full transcript of 7 turns (7 AI + 7 candidate responses) is ~1,200 tokens input.
Adding the assessment system prompt (~350 tokens) and expecting ~600 tokens output
puts you at ~2,150 tokens for this single call. This is fine as a one-off call — it
won't exceed TPM as long as it's the only call in that minute. Do NOT call /api/chat
and /api/assess simultaneously.

### Response is not always valid JSON
Even with strict prompting, Groq (like any LLM) sometimes wraps JSON in markdown
code fences (```json ... ```) or adds a preamble sentence.
Fix: strip everything before the first `{` and after the last `}`, then JSON.parse.
If parse still fails, retry once with an even stricter prompt that says
"Return ONLY the JSON object. No markdown, no explanation, no text before or after."

### Model name
Use: llama-3.3-70b-versatile
Do NOT use: llama-3.1-70b-versatile (older), llama-3.3-70b (not the right identifier)

## FastAPI

### CORS will block your frontend on deploy
The most common deployment failure. ALLOWED_ORIGINS must be set on Railway
BEFORE you deploy the frontend. The value must exactly match the Vercel URL
including protocol: https://your-app.vercel.app (no trailing slash).
If you get "CORS error" in the browser console, this is the culprit 99% of the time.

### Pydantic v2 breaking changes
If you find legacy FastAPI tutorials using validator, orm_mode, or schema_extra,
those are Pydantic v1 patterns. In v2 the equivalents are:
field_validator, model_config = ConfigDict(from_attributes=True), and model_config = ConfigDict(json_schema_extra={...})

## React / Vite

### VITE_API_URL must be set in Vercel environment, not just .env
Vercel does not read your .env file. You must add VITE_API_URL manually in
Vercel's Project Settings → Environment Variables. If you forget this, all API
calls in production will go to undefined and silently fail.

### SpeechRecognition is not globally available in all contexts
Always check: const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
If both are undefined, the browser is not Chrome. Show the browser warning immediately
rather than letting the user get deep into the flow before failing.

## Railway deployment

### The PORT environment variable
Railway injects PORT automatically. Your uvicorn start command must use $PORT:
  uvicorn main:app --host 0.0.0.0 --port $PORT
If you hardcode 8000, Railway will run on 8000 but expose a different port,
and all requests from Vercel will time out.