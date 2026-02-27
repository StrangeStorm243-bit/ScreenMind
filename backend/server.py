import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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


@app.on_event("startup")
async def startup():
    from screenmind.graph import init_graph
    init_graph()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AgentResponse)
async def analyze(req: AnalyzeRequest):
    """Analyze a screenshot, optionally with a user message."""
    try:
        if req.user_message:
            # User asked a question with screenshot — full pipeline
            from backend.agent import run_agent
            result = run_agent(screenshot_b64=req.screenshot_b64, user_message=req.user_message)
            return AgentResponse(
                response=result["response"],
                proactive=result.get("proactive", False),
            )
        else:
            # Background capture — fast path: Reka + GLiNER2 only, skip LLM
            from backend.agent import update_screen_context
            update_screen_context(req.screenshot_b64)
            return AgentResponse(response="", proactive=False)
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


@app.post("/query/stream")
async def query_stream(req: QueryRequest):
    """Stream LLM response as Server-Sent Events."""
    from backend.agent import run_agent_stream

    def event_generator():
        try:
            for chunk in run_agent_stream(user_message=req.message):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {e}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/analyze_quick")
async def analyze_quick(req: AnalyzeRequest):
    """Fast context update: Reka + GLiNER2 only, no LLM."""
    try:
        from backend.agent import update_screen_context
        update_screen_context(req.screenshot_b64)
        return {"status": "ok"}
    except Exception:
        return {"status": "error"}


@app.get("/context")
async def get_context():
    """Return recent knowledge graph context."""
    try:
        from screenmind.graph import get_recent_context

        return {"topics": get_recent_context()}
    except Exception:
        return {"topics": []}


@app.post("/cleanup")
async def cleanup_captures():
    """Remove old screen captures to prevent unbounded Neo4j growth."""
    try:
        from screenmind.graph import cleanup_old_captures
        deleted = cleanup_old_captures(max_age_hours=24)
        return {"deleted": deleted}
    except Exception:
        return {"deleted": 0}


if __name__ == "__main__":
    import sys
    from pathlib import Path

    # Ensure project root is on sys.path so "backend" and "screenmind" are importable
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
