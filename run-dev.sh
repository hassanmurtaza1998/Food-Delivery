#!/usr/bin/env bash
# Runs backend, admin, and frontend together for local development.
# Usage: ./run-dev.sh   (Ctrl+C stops all three)

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ADMIN_DIR="$ROOT_DIR/admin"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT=4000
FRONTEND_PORT=5173
ADMIN_PORT=5174

PIDS=()

cleanup() {
  echo ""
  echo "Stopping all servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  wait 2>/dev/null
  exit 0
}
trap cleanup INT TERM

ensure_installed() {
  local dir="$1"
  local name="$2"
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing dependencies for $name..."
    (cd "$dir" && npm install) || { echo "npm install failed in $dir"; exit 1; }
  fi
}

run_with_prefix() {
  local name="$1"
  local color="$2"
  shift 2
  ( "$@" 2>&1 | sed -e "s/^/${color}[${name}]$(printf '\033[0m') /" ) &
  PIDS+=($!)
}

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "Warning: backend/.env not found."
  echo "Copy backend/.env.example to backend/.env and fill in real values first."
  echo ""
fi

ensure_installed "$BACKEND_DIR" "backend"
ensure_installed "$ADMIN_DIR" "admin"
ensure_installed "$FRONTEND_DIR" "frontend"

echo "Starting backend, frontend, and admin..."
echo ""

run_with_prefix "backend"  "\033[36m" bash -c "cd '$BACKEND_DIR' && PORT=$BACKEND_PORT npm run dev"
run_with_prefix "frontend" "\033[32m" bash -c "cd '$FRONTEND_DIR' && npm run dev -- --port $FRONTEND_PORT"
run_with_prefix "admin"    "\033[35m" bash -c "cd '$ADMIN_DIR' && npm run dev -- --port $ADMIN_PORT"

echo "backend:  http://localhost:$BACKEND_PORT"
echo "frontend: http://localhost:$FRONTEND_PORT"
echo "admin:    http://localhost:$ADMIN_PORT"
echo ""
echo "Press Ctrl+C to stop all."
echo ""

wait
