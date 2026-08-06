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
  for f in "${TEST_FILES[@]}"; do
    echo "  Running $f..."
    if ! node "$f"; then
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
