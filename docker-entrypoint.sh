#!/bin/sh
set -e

# If YOUR_AUTHTOKEN or NGROK_AUTHTOKEN is provided (e.g. from Render environment variables), configure ngrok
AUTHTOKEN="${YOUR_AUTHTOKEN:-$NGROK_AUTHTOKEN}"
if [ -n "$AUTHTOKEN" ]; then
  echo "Configuring ngrok authtoken..."
  ngrok config add-authtoken "$AUTHTOKEN" || true
fi

# If arguments were provided to docker run, execute them instead
if [ "$#" -gt 0 ]; then
  exec "$@"
fi

# Port configuration (support Render's dynamic $PORT for public web routing)
UI_PORT="${PORT:-3002}"
BACKEND_PORT="${LATCH_PORT:-3001}"

echo "Starting Latch Backend on port ${BACKEND_PORT}..."
node backend/server.js --port "${BACKEND_PORT}" &
BACKEND_PID=$!

echo "Starting Latch Mission Control UI on port ${UI_PORT}..."
npx next start mission-control -H 0.0.0.0 -p "${UI_PORT}" &
UI_PID=$!

# Graceful shutdown handler
cleanup() {
  echo "Shutting down Latch..."
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  kill -TERM "$UI_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$UI_PID" 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
