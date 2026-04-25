from fastapi import APIRouter

from models.schemas import AssessRequest, AssessResponse

router = APIRouter()


@router.post("", response_model=AssessResponse)
async def assess(payload: AssessRequest) -> AssessResponse:
    return {"status": "not implemented"}
