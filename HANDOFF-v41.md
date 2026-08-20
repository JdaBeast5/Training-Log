# HANDOFF v41 — Training Log

Branch: `claude/shared-app-testing-workflow-7uj072`. No code changes this session — this handoff exists solely to record a process change the user requested directly, so it carries forward even if context resets before any actual fix lands.

## 1. What changed

Nothing in `index.html` or `sw.js`. `APP_VERSION`/`VERSION` remain at **3.232**, matching `Branch-1` (the default branch / live GitHub Pages deploy) as of this session's start.

## 2. Process change requested by the user — binding going forward

**The app now has a second real user, not just the maintainer.** The user's explicit instruction: from here on, every fix or alteration must be checked and tested before it gets pushed to the live branch (`Branch-1`, what GitHub Pages deploys from). Nothing should risk breaking the app or introducing behavior changes that affect the other user.

This isn't a new rule — CLAUDE.md already mandates baseline-then-test-then-verify discipline for every change — but the stakes just changed from "don't break my own tracking data" to "don't break someone else's app," so treat it as non-negotiable, not a nice-to-have:

1. **Baseline before touching anything**: run `check.sh` and every `test-*.js` suite, confirm green, before any edit.
2. **One change at a time**, its own commit, its own test — never batch several fixes/features together.
3. **Every functional change gets a real jsdom behavioral test** (extract real markup/functions from `index.html`, load into jsdom, assert on real DOM state — not string-matching), sabotage-verified.
4. **Re-run the full suite after the change, including after the version bump** — line-number drift from edits has caused false-pass confidence before.
5. **No drive-by fixes** — unrelated issues noticed mid-task get flagged to the user, not silently patched in the same change.
6. **Confirm with the user before pushing to `Branch-1`** — show what changed and that tests pass; don't push to the live/default branch on autopilot. This is the new part: previously a "launch into the live app" push happened same-session on direct request (see HANDOFF-v40 §3); going forward, treat every push to `Branch-1` as needing an explicit go-ahead on that specific change, given a second person is now depending on it.

## 3. What's still open

Everything carried forward unchanged from HANDOFF-v40 §4 (Gym Mode's ~32 literal `rgba()` sites left deliberately untouched, jump-rail scroll-timing unconfirmed on a real device, Cross-Metric Insights/video-frame-extraction unconfirmed against live API/device, road-cycling/boxing citation gaps). Nothing here was investigated this session.
