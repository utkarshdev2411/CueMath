import json

from fastapi import APIRouter, HTTPException

from models.schemas import AssessRequest
from services.groq_client import get_assessment

router = APIRouter()

_STRICT_RETRY_INSTRUCTION = "Return ONLY the raw JSON object, nothing else."


@router.post("")
async def assess(payload: AssessRequest) -> dict:
    try:
        return await get_assessment(payload.transcript)
    except json.JSONDecodeError:
        try:
            return await get_assessment(
                payload.transcript, extra_instruction=_STRICT_RETRY_INSTRUCTION
            )
        except Exception:
            raise HTTPException(
                status_code=500, detail="Assessment generation failed. Please contact support."
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500, detail="Assessment generation failed. Please contact support."
        )
