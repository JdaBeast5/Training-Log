#!/usr/bin/env bash
# check.sh — Training Log project checks
#
# Currently enforces the one non-negotiable rule from CLAUDE.md:
# APP_VERSION in index.html must always equal VERSION in sw.js.
#
# Extend this over time as test-*.js suites are added/recovered —
# run them all from here so "run check.sh" stays the single command
# that verifies a change is actually done.

set -euo pipefail
cd "$(dirname "$0")"

FAIL=0

echo "== Version parity =="
APP_VERSION=$(grep -o "const APP_VERSION = '[^']*'" index.html | head -1 | sed "s/.*'\(.*\)'.*/\1/")
SW_VERSION=$(grep -o "const VERSION = '[^']*'" sw.js | head -1 | sed "s/.*'\(.*\)'.*/\1/")

if [ -z "$APP_VERSION" ]; then
  echo "  FAIL: could not find APP_VERSION in index.html"
  FAIL=1
elif [ -z "$SW_VERSION" ]; then
  echo "  FAIL: could not find VERSION in sw.js"
  FAIL=1
elif [ "$APP_VERSION" != "$SW_VERSION" ]; then
  echo "  FAIL: index.html APP_VERSION ('$APP_VERSION') != sw.js VERSION ('$SW_VERSION')"
  FAIL=1
else
  echo "  OK: both at $APP_VERSION"
fi

echo ""
echo "== jsdom behavioral tests (test-*.js) =="
shopt -s nullglob
TEST_FILES=(test-*.js)
if [ ${#TEST_FILES[@]} -eq 0 ]; then
  echo "  No test-*.js files found in this directory."
  echo "  (Past sessions built these — e.g. test-analysis-collapse.js — but they"
  echo "   were never committed to this repo, so none currently exist here.)"
else
  # Each test-*.js independently re-parses the same 2.5MB index.html and pays
  # its own `node` process-startup cost. That work is I/O/startup-bound, not
  # CPU-bound, so running several `node` invocations concurrently (capped at
  # MAX_JOBS) instead of strictly one-at-a-time cuts wall-clock time a lot
  # without changing what runs. Each file's real stdout/exit code is still
  # captured individually and replayed in ORIGINAL file order below, so the
  # "Running $f...", "ok - ...", per-file summary, and "FAIL: $f" lines are
  # byte-for-byte identical to the old sequential output — only the timing
  # changes, not what a developer reads.
  RUN_TMPDIR=$(mktemp -d)
  trap 'rm -rf "$RUN_TMPDIR"' EXIT
  MAX_JOBS=8
  running=0
  for f in "${TEST_FILES[@]}"; do
    (
      if node "$f" > "$RUN_TMPDIR/$f.out" 2>&1; then
        echo 0 > "$RUN_TMPDIR/$f.exit"
      else
        echo "$?" > "$RUN_TMPDIR/$f.exit"
      fi
    ) &
    running=$((running + 1))
    if [ "$running" -ge "$MAX_JOBS" ]; then
      wait -n
      running=$((running - 1))
    fi
  done
  wait

  for f in "${TEST_FILES[@]}"; do
    echo "  Running $f..."
    cat "$RUN_TMPDIR/$f.out"
    ec=$(cat "$RUN_TMPDIR/$f.exit")
    if [ "$ec" -ne 0 ]; then
      echo "  FAIL: $f"
      FAIL=1
    fi
  done
fi

echo ""
if [ "$FAIL" -ne 0 ]; then
  echo "check.sh: FAILED"
  exit 1
else
  echo "check.sh: all checks passed"
fi
