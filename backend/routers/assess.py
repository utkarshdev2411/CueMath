from fastapi import APIRouter

from models.schemas import AssessRequest, AssessResponse


router = APIRouter()


@router.post("", response_model=AssessResponse)
def assess(payload: AssessRequest) -> AssessResponse:
    score = 1.0 if payload.answer.strip() else 0.0
    feedback = "Good attempt." if score > 0 else "Please provide an answer."
    return AssessResponse(score=score, feedback=feedback)
