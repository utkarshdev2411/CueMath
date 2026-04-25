# Tech Stack & Setup

## Dependencies

### Backend (requirements.txt)
fastapi==0.115.0
uvicorn[standard]==0.30.0
groq==0.9.0
python-dotenv==1.0.1
pydantic==2.8.0
httpx==0.27.0

### Frontend (package.json)
react: ^18.3.0
react-dom: ^18.3.0
react-router-dom: ^6.26.0
axios: ^1.7.0
vite: ^5.4.0
@vitejs/plugin-react: ^4.3.0

## Environment variables

### backend/.env (never commit)
GROQ_API_KEY=gsk_your_key_here
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
PORT=8000

### frontend/.env (only this one var, safe to keep)
VITE_API_URL=http://localhost:8000

## Initial scaffold commands
# Backend
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn groq python-dotenv pydantic httpx
pip freeze > requirements.txt

# Frontend
npm create vite@latest frontend -- --template react
cd frontend && npm install
npm install react-router-dom axios

## Groq API facts
- Endpoint: https://api.groq.com/openai/v1
- Compatible with openai Python SDK (set base_url and api_key)
- Free tier limits: 30 RPM, 6,000 TPM, 1,000 RPD (requests per day)
- Model to use: llama-3.3-70b-versatile
- Tokens/second: 200-500 (very fast — no streaming needed for short turns)
- 429 response: retry after x-ratelimit-reset-requests header value

## Using openai SDK with Groq (preferred pattern)
from openai import OpenAI
import os

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"]
)

## Web Speech API constraints
- Works: Chrome Desktop (Windows, Mac, Linux)
- Broken: Firefox (not implemented), Safari (partial), Edge (unstable)
- Broken: Chrome Mobile (unreliable mic behavior)
- Uses Google's servers for transcription — requires internet connection
- Must use non-continuous mode (continuous=true causes compounding bugs)
- Each recognition session: instantiate → start → get result → destroy → repeat
- Microphone permission: request on user gesture (button click), not on page load

## Deployment

### Backend → Railway
1. Create Railway account at railway.app
2. New project → Deploy from GitHub repo → select /backend folder
3. Add env var: GROQ_API_KEY
4. Add env var: ALLOWED_ORIGINS with your Vercel URL
5. Railway auto-detects Python + requirements.txt
6. Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
7. Note your Railway URL (e.g. https://your-app.up.railway.app)

### Frontend → Vercel
1. Push to GitHub
2. Import to Vercel, set root directory to /frontend
3. Add env var: VITE_API_URL = your Railway URL
4. Deploy
5. Copy Vercel URL → add to Railway ALLOWED_ORIGINS → redeploy Railway