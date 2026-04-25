from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class AssessRequest(BaseModel):
    question: str
    answer: str


class AssessResponse(BaseModel):
    score: float
    feedback: str
