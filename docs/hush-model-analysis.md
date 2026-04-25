# Hush Model — Feasibility Analysis

**Model:** [weya-ai/hush](https://huggingface.co/weya-ai/hush)  
**Date reviewed:** 2026-04-26  
**Verdict:** ⚠️ Not integrable into current MVP architecture. Viable for Phase 5 enhancement.

---

## What is Hush?

Hush is an open-source, real-time **background speaker suppression** model by Weya AI.
It is designed for one specific problem: a candidate on a voice call who has other people
talking in the background (family, colleagues, café chatter). Standard noise suppression
removes static noise (fans, traffic). Hush removes competing human voices specifically.

**Specs:**
- Architecture: DeepFilterNet3 with auxiliary speaker-separation head
- Input / Output: 16 kHz mono audio waveform
- Frame size: 10 ms (320-sample FFT, 160-sample hop)
- Model size: ~8 MB, ~1.8M parameters
- Inference time: < 1 ms per 10 ms frame on modern CPU (real-time capable)
- Latency: Fully causal (0 lookahead) — no algorithmic delay
- License: Apache 2.0 (commercial use allowed)
- Formats: PyTorch (`DeepFilterLib`) + ONNX (`weya_nc` standalone library)
- Free hosted API: None — must run on your own infrastructure

---

## Why it cannot be integrated into the current architecture

Our current speech pipeline is:

```
Microphone → Chrome Web Speech API → Google speech servers → transcript text
```

Chrome's `SpeechRecognition` / `webkitSpeechRecognition` is a **closed, opaque pipeline**.
The browser captures audio from the mic internally and sends it directly to Google's
transcription servers. There is no API to:

- Intercept the raw audio before it enters the recognizer
- Feed pre-processed audio into the recognizer from a custom source
- Replace the audio stream mid-pipeline

Hush would need to process audio **before** it reaches the speech recognizer.
That injection point does not exist in the Web Speech API.

---

## What would be required to use Hush

Integrating Hush would require replacing the entire speech pipeline:

### Option A — Browser-side ONNX (no backend changes needed)

```
Mic → Web Audio API (MediaStreamSource)
    → ONNX Runtime Web (Hush) — runs in browser
    → Cleaned PCM audio
    → ??? → Can't feed back into SpeechRecognition
```

**Problem:** Still can't feed the cleaned audio into Chrome's SpeechRecognition.
ONNX Runtime Web is available (`onnxruntime-web` npm package, ~3MB extra bundle),
but there's no bridge from a Web Audio `AudioNode` output back into `SpeechRecognition`.

### Option B — Server-side ASR (Groq Whisper) [the viable path]

```
Mic → Web Audio API (MediaRecorder, opus/webm)
    → WebSocket / HTTP chunk upload to backend
    → Backend: Hush ONNX (Python weya_nc) → enhanced audio
    → Backend: Groq Whisper API → transcript text
    → WebSocket response to frontend → interview continues
```

This is **architecturally sound** but requires:
1. Replacing `useSpeech.js` entirely — ditch Web Speech API, use `MediaRecorder`
2. Adding a WebSocket or chunked HTTP endpoint on the FastAPI backend
3. Integrating `weya_nc` Python library on the backend
4. Integrating Groq's Whisper endpoint (`/openai/v1/audio/transcriptions`)
5. Handling streaming transcription and voice-activity detection manually

**Groq Whisper free tier:** `whisper-large-v3` at Groq — 7,200 seconds of audio per day
on the free tier, which covers ~100+ interviews/day at 5 minutes each.
This is within budget for a prototype.

---

## Honest trade-off analysis

| Dimension | Current (Web Speech API) | Hush + Groq Whisper |
|-----------|--------------------------|----------------------|
| Noise isolation | None | Background speaker removal |
| Accent handling | Google ASR (decent) | Whisper large-v3 (best available) |
| Cost | Free (0 API calls) | Free (Groq free tier) |
| Latency | ~300ms (Google cloud) | ~500–800ms (encode + upload + whisper) |
| Reliability | Chrome only, network dependent | Works in any browser |
| Dev effort | Done | ~2–3 days of new work |
| MVP risk | Low | High — full pipeline rewrite |

---

## Recommendation

**Do not implement for the current MVP (hiring task).**

The current Web Speech API approach is working on Chrome and the interviewer product
is functionally complete. Replacing the speech pipeline adds significant risk and
implementation time for a marginal improvement in the MVP context (the demo will
be shown in a quiet room, not a café).

**Consider for Phase 5 (post-hiring, production hardening):**

If Cuemath actually deploys this at scale, tutors will interview from noisy homes
and cafés. The Hush + Groq Whisper pipeline would:
1. Improve transcription accuracy in real-world noisy conditions
2. Remove the Chrome-only constraint (Firefox, Safari, Edge would all work)
3. Give us control over the full audio pipeline for future features
   (e.g., voice quality scoring, turn detection, diarization)

---

## Quick-start code (for future reference)

### Backend — Python

```bash
pip install weya_nc
# Download hush.onnx from https://huggingface.co/weya-ai/hush/tree/main/onnx
```

```python
from weya_nc import NoiseCanceller

nc = NoiseCanceller(model_path="hush.onnx")

def enhance_audio(raw_pcm_16k_mono: bytes) -> bytes:
    """Takes raw 16kHz mono PCM, returns enhanced PCM."""
    enhanced = nc.process(raw_pcm_16k_mono)
    return enhanced
```

### Backend — Groq Whisper transcription

```python
import os
from openai import AsyncOpenAI

_whisper_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)

async def transcribe(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    response = await _whisper_client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=(filename, audio_bytes, "audio/webm"),
        language="en",
    )
    return response.text
```

### Frontend — MediaRecorder capture

```javascript
// Replace startListening() in useSpeech.js with:
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
const chunks = [];

recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = async () => {
  const blob = new Blob(chunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("audio", blob, "answer.webm");
  const res = await fetch("/api/transcribe", { method: "POST", body: formData });
  const { text } = await res.json();
  onTranscriptReady(text);
};

// Stop recording after 4s of silence (use Web Audio AnalyserNode for VAD)
recorder.start();
```

---

## Files to create if implementing

```
backend/
  services/
    hush.py          ← NoiseCanceller wrapper
    whisper.py       ← Groq transcription wrapper
  routers/
    transcribe.py    ← POST /api/transcribe endpoint

frontend/
  src/hooks/
    useMediaRecorder.js  ← replaces useSpeech.js recognition logic
    useVAD.js            ← Web Audio silence/voice detection
```
