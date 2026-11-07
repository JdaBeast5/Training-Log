# Build log

Owner: build-automator. One row per scheduled run that made a branch (each shipped PR and each blocker PR). Columns, stop conditions and the run procedure are defined in `planning/automation.md` §5. "Waiting" and "nothing ready" runs add no row; their record is the run report in the builder session.

Starting point: **v3.516** (live; v3.515 and v3.516 reached `Branch-1` through PR #55). Baseline on 2026-11-07, pre-D1 dry run on both `origin/Branch-1` and `claude/taste-skill-v2`: `check.sh` passed, 199/199 `test-*.js` suites, 0 `FAIL:` lines. The first build will be v3.517.

Pre-D1 update, 2026-11-07 (no run, no branch, so no row):
- `automation.md` now has the consensus fixes F12–F14 and owner decisions 2–4:
  - it's the single rulebook;
  - step 1 never stashes or touches work it didn't make, and stops on a foreign dirty tree;
  - step 2 adds a missing record commit and merges a moved base in (never a rebase or force-push);
  - step 5 skips items with a merged auto-PR;
  - step 6 uses impeccable's written guidance only, never its binary;
  - step 11 stages the item's `Files:` line.
- Baseline re-run on `claude/taste-skill-v2`: `check.sh` exit 0, 199/199 suites, 0 `FAIL:`.
- Dry pick (step 5) against the revised roadmap: **slot 1, BL-01** (program gate on goal volume and block accumulation). It's `ready`, there are no `claude/auto-*` PRs or branches on GitHub, and the only open PR (#32, `claude/iphone-duo-form-factor`) isn't an auto-PR. It would build as v3.517 on `claude/auto-bl-01`. Not built.
- Flagged: `.claude/agents/build-automator.md` still carries the old pick order and branch name. It wasn't edited in this session (it's configuration). The run prompt's "automation.md wins" line covers the gap until the owner applies the change.

| Date (ET) | Item | Outcome | Version | PR | Suites before → after | New/extended test | Sabotage | Attempts | Flagged, not fixed |
|---|---|---|---|---|---|---|---|---|---|
