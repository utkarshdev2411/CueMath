from typing import Optional
from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    turn_count: int


class ChatResponse(BaseModel):
    reply: str
    should_end: bool


class DimensionScore(BaseModel):
    score: int
    evidence: str


class AssessRequest(BaseModel):
    transcript: list[Message]
    candidate_name: Optional[str] = "Candidate"


class AssessResponse(BaseModel):
    overall: str
    weighted_score: float
    summary: str
    dimensions: dict[str, DimensionScore]
    red_flags: list[str]
    recommendation: str
