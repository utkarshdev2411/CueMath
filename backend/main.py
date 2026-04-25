import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import assess, chat

load_dotenv()

app = FastAPI(title="Cuemath AI Tutor Screener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ["ALLOWED_ORIGINS"].split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(assess.router, prefix="/api/assess", tags=["assess"])


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
