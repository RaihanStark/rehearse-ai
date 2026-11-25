from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="rehearse-ai", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "app": "rehearse-ai"}


@app.websocket("/ws/interview/{session_id}")
async def interview_ws(ws: WebSocket, session_id: str) -> None:
    await ws.accept()
    # TODO: Implement real-time interview loop
    await ws.send_json({"type": "ready", "session_id": session_id})
    await ws.close()
