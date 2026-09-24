#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run Retzetar." >&2
  exit 1
fi

pids=()

cleanup() {
  trap - EXIT INT TERM

  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  wait "${pids[@]}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Starting Retzetar API and web app..."
npm run dev:api &
pids+=("$!")

npm run dev:web &
pids+=("$!")

echo "API: http://localhost:3000"
echo "Web: http://localhost:5173"
echo "Press Ctrl+C to stop both processes."

wait -n "${pids[@]}"
