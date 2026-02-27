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
    """Analyze a screenshot, optionally with a user message."""
    from backend.agent import run_agent

    try:
        result = run_agent(screenshot_b64=req.screenshot_b64, user_message=req.user_message)
        return AgentResponse(
            response=result["response"],
            proactive=result.get("proactive", False),
        )
    except Exception as e:
        return AgentResponse(response=f"Error: {e}")


@app.post("/query", response_model=AgentResponse)
async def query(req: QueryRequest):
    """Answer a user question with optional screenshot context."""
    from backend.agent import run_agent

    try:
        result = run_agent(screenshot_b64=req.screenshot_b64, user_message=req.message)
        return AgentResponse(response=result["response"])
    except Exception as e:
        return AgentResponse(response=f"Error: {e}")


@app.get("/context")
async def get_context():
    """Return recent knowledge graph context."""
    try:
        from screenmind.graph import get_recent_context

        return {"topics": get_recent_context()}
    except Exception:
        return {"topics": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
