#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

trap 'kill 0' EXIT

echo "Starting rehearse-ai backend on http://127.0.0.1:8000 ..."
(cd "$ROOT/backend" && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &

echo "Starting rehearse-ai frontend on http://localhost:5173 ..."
(cd "$ROOT/frontend" && npm run dev) &

wait
