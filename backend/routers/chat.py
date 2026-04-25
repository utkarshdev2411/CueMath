from fastapi import APIRouter

from models.schemas import ChatRequest, ChatResponse
from services.groq_client import get_chat_response

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    return await get_chat_response(payload.messages, payload.turn_count)
