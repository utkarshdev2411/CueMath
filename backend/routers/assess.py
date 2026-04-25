from fastapi import APIRouter

from models.schemas import AssessRequest, AssessResponse
from services.groq_client import get_assessment

router = APIRouter()


@router.post("", response_model=AssessResponse)
async def assess(payload: AssessRequest) -> AssessResponse:
    result = await get_assessment(payload.transcript)
    return AssessResponse(**result)
