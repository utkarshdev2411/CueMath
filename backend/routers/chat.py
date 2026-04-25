from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest, ChatResponse
from services.groq_client import get_chat_response

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    if payload.turn_count > 7:
        raise HTTPException(status_code=400, detail="Interview has already ended (turn_count > 7).")

    try:
        result = await get_chat_response(payload.messages, payload.turn_count)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    if payload.turn_count >= 6:
        result.should_end = True

    return result
