# rehearse-ai

Interactive, multi-stage AI voice mock interviewer powered by local STT/TTS, FastAPI, Svelte 5, SQLite, and the Antigravity (`agy`) CLI.

## Quick Start

```bash
./dev.sh
```

Then open **http://localhost:5173** in your browser.

### Manual Start
```bash
# Terminal 1 — Backend
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```
