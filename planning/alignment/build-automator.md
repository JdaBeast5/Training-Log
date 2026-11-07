# Alignment: build-automator (2026-11-07)

## 1. Sign-off: Agree with conditions
Ship the Plate & Press redesign, the safety fixes and the Year in Lifting lane as one tested version per PR, in the roadmap's unified order, with the owner merging every PR. The loop can run safely once the five conditions in §2 are met.

**Dry run (nothing built or committed).** The baseline is green: v3.516 on `origin/Branch-1` and `claude/taste-skill-v2` (the app code is byte-identical on both), `check.sh` passed, 199/199 suites, 0 `FAIL:` lines, about 100 s. The first pick is BL-01, which would ship as v3.517. Every function it names exists, about 6 lines below the cited line numbers (expected drift). `content-exercises.js`, `testHelpers.js` and the two guard tests exist. `test-volume-modifier-gate.js` doesn't exist yet, which is correct because it is the new test. A merge of `claude/taste-skill-v2` into `Branch-1` is clean (`git merge-tree` exit 0): the PR #55 cherry-picks produced identical content, so there is nothing to conflict.

## 2. Blocking concerns before D1
1. **BL-01 changes more than it says.** The gate allows 4 programs. I measured with the real functions: today, goal volume and accumulation also change sets on oly (26 rows), climbing (31), bodyweight (25), calisthenics (25), boxingsc (20), jumprope (16), hyrox (13), grappling (10), running (7) and swimming (5). BL-01 would silently stop all of that. Acceptance criterion 1 doesn't list these 10 programs, and the line "changes nothing outside the four built-ins" says the opposite of what happens. *Fix (project-manager with exercise-auditor):* say explicitly which of the 25 built-in programs keep the modifiers. Criterion 1 should then cover every built-in program outside the set. The What's New entry must also say it.
2. **A run cut off mid-way can rebuild an item that already shipped.** The `done` status is written only by step 13's record commit. If a run stops between opening the PR and that commit, the PR merges without it, and the next run builds BL-01 again. *Fix (mine, after D1 approval):* step 5 also skips any item with a merged `claude/auto-<id>*` PR. A "waiting" run checks that the open PR has its record commit and adds it if missing. I'll also say what happens to a pushed branch that has no PR.
3. **The builder's checkout must be its own.** Step 1 stashes any dirty tree as an "abandoned run". This checkout is on `claude/taste-skill-v2` and currently holds the untracked `planning/alignment/` files, so a run here would stash other agents' work. *Fix:* the builder session gets a dedicated checkout or `git worktree` that no planning agent writes to. Step 1 discards work only on a `claude/auto-*` branch; on any other branch it stops and reports.
4. **The agent file and the manual disagree.** `.claude/agents/build-automator.md` says to branch `claude/auto-<date>-<item-id>`, to pick "the top ready item in backlog.md" (file order), and to log a red baseline in build-log.md. `automation.md` says `claude/auto-<item-id>`, the roadmap's unified sequence, and a blocker PR. The run prompt cites both. From BL-07 onward the two pick orders diverge (file order gives BL-07, the sequence gives BL-08, then UX-01). *Fix (owner, since agent files are configuration):* align the agent file, or let the run prompt say that `automation.md` wins.
5. **Neither `planning/` nor `.claude/agents/` is on `origin/Branch-1`.** Runs read both from there. D1's merge must bring both (fixed in my §1 Prerequisite note). The merge also deploys `tools/design/` (renders and fonts) and `PRODUCT.md` to the public Pages site. *The owner should know that before saying yes.*

## 3. Non-blocking (fix during the build)
- BL-02 criterion 5 ("`RPE_BY_CYCLE_WEEK[` is read only in `rpeTargetFor`/`targetRpeForWeek`") fails as written: there is a 4th read in `renderLoadModeNote` (about line 32899), which the Change and Files don't name. Either add that read to the item or exclude it from the count.
- BL-05/06 add 5 cues, but `test-concise-cues.js` pins the total at exactly 964 cues and 321 exercises. The item should say to update the pin to 969; otherwise an unattended run is editing a guard test without permission. BL-05's Files line says "sw.js (version and precache)", but `content-exercises.js`'s own header says never to precache it. It should be the version bump only; the versioned cache name already refreshes the file.
- BL-03 and BL-04 are well specified: every exercise name, region label and both lookup sites check out (14541, 29029). BL-13 checks out (`CYCLE_PHASES` at 39056; `test-cycle-phase.js` exists).
- A PR that sits unreviewed costs only the gate check, three times a day. However, a waiting PR is never rebased if `Branch-1` moves under it, for example after a planning PR or a hand-made hotfix. Waiting runs should check mergeability and the version, then rebase and re-bump on the same branch, with the full suite run again.
- The cron is `CRON_TZ=America/New_York 17 7,13,20 * * *`. Whether the trigger tool accepts `CRON_TZ` and `subscribe_pr_activity` hasn't been verified from this session. If it doesn't, use UTC (`17 12,18,1`) and accept a one-hour drift at DST.

## 4. Conflicts with other agents' plans
- `roadmap.md`, "Before build 1", item 2 asks for step 5 to be changed to the sequence order. That is already done in `automation.md` §4 step 5, so the project-manager can strike it.
- After D1, two writers would edit `backlog.md`: auto-PRs set statuses, and planning agents edit on `claude/taste-skill-v2`. *Want:* retire `claude/taste-skill-v2` for planning at D1. Later planning changes go as `claude/planning-*` PRs into `Branch-1`, and they never edit item `Status:` lines (only runs and owner answers do).
- `HANDOFF-v59.md` has no addendum for v3.515/v3.516, and its last line still reads "revisit the original mission before more features". The first run reads that file. Whoever shipped v3.516 should add the addendum.
- CLAUDE.md says "no assets ship now", but the `content-*.js` files and `fonts/` do ship. This is for the owner to word; I flag it and don't edit it.

## 5. Stale items in my own files (fixed)
- `automation.md`: the baseline line said v3.514 and 198 suites. The examples said v3.515 and 198→199; they now say v3.517 and 199→200. The Prerequisite now includes `.claude/agents/`. The step 9 version grep had no `| head -1` and returned 2 matches; it now has one.
- `build-log.md`: the starting point said v3.514/198; it is now v3.516/199, with the first build at v3.517.
- No Chalklog mentions in either file.

## 6. Questions only the owner can answer
1. Go-ahead to create the 3-a-day trigger once D1 merges, and is the builder session a fresh, dedicated checkout (my recommendation)?
2. Which of the 25 built-in programs keep goal volume and block accumulation (BL-01)?
3. Is it OK that D1 publishes `tools/design/`, `.claude/` and `PRODUCT.md` on the Pages site, or should they be left out of the merge?
