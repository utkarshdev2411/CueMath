from fastapi import FastAPI

from routers.assess import router as assess_router
from routers.chat import router as chat_router


app = FastAPI(title="CueMath Backend")

app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(assess_router, prefix="/assess", tags=["assess"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
