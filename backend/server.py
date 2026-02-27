import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ScreenMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    screenshot_b64: str
    user_message: str | None = None


class QueryRequest(BaseModel):
    message: str
    screenshot_b64: str | None = None


class AgentResponse(BaseModel):
    response: str
    proactive: bool = False
    sources: list[str] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AgentResponse)
async def analyze(req: AnalyzeRequest):
    """Placeholder — will be wired to agent brain in Phase 4."""
    return AgentResponse(response="Analysis placeholder — agent brain not connected yet.")


@app.post("/query", response_model=AgentResponse)
async def query(req: QueryRequest):
    """Placeholder — will be wired to agent brain in Phase 4."""
    return AgentResponse(response="Query placeholder — agent brain not connected yet.")


@app.get("/context")
async def get_context():
    """Placeholder — will be wired to Neo4j in Phase 4."""
    return {"topics": [], "relationships": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
