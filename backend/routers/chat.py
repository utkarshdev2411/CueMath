from fastapi import APIRouter

from models.schemas import ChatRequest, ChatResponse


router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    # Placeholder implementation until Groq integration is added.
    return ChatResponse(reply=f"Echo: {payload.message}")
