# Automation: the scheduled build loop

Owner: build-automator. Written 2026-11-07 against v3.514. Re-baselined 2026-11-07 (pre-D1 alignment) against **v3.516** on `origin/Branch-1` and `claude/taste-skill-v2` (identical app code): `check.sh` passed, 199/199 `test-*.js` suites, about 100 s.

This is the operating manual for the scheduled runs. Each run takes **one** `ready` item from `planning/backlog.md` and ships it as **one** tested version in **one** pull request into `Branch-1`. The owner decides what goes live.

`CLAUDE.md` is still the source of truth for how code is written and tested. This file covers only the loop around it: when runs happen, what each run does in what order, when it stops, and how the owner and the runs talk to each other. Where they seem to disagree, CLAUDE.md wins. Log the disagreement.

**This file is the single rulebook for the loop.** The pick order (the roadmap's Unified build sequence, §4 step 5), the branch name (`claude/auto-<item-id>`), the handling of a red baseline (§5.1) and every other loop rule live here. `.claude/agents/build-automator.md` gives the role. Where it says anything different about the loop (for example "top `ready` item in file order" or `claude/auto-<date>-<item-id>`), **this file wins**. (Updated 2026-11-07 for the pre-D1 fixes F12–F14 and owner decisions 2–4, `alignment/consensus.md`.)

---

## 1. Ground rules

1. **One builder session, with its own checkout.** Every scheduled run fires as a message into one dedicated, persistent Claude Code cloud session (the "builder"). It has its **own** checkout of `github.com/JdaBeast5/Training-Log`, tracking `Branch-1`. That checkout belongs to the loop alone: no planning agent or other session writes to it (owner decision 2, O2), and planning changes reach `Branch-1` as `claude/planning-*` PRs instead. A fresh session per run would not have the repo. The builder's context compacts over time, so **a run never relies on memory from an earlier run.** Each run re-reads this file, the backlog, and GitHub's PR state.
2. **Never touch work the run didn't make.** A run never stashes, commits, resets or deletes changes that aren't its own. The only leftovers it may discard are those of an earlier, cut-off run, on a local `claude/auto-*` branch, in that item's files (§4 step 1). Anything else in the tree means someone else is using the checkout: the run stops and touches nothing.
3. **No rebases, no force pushes.** A branch that has been pushed is only ever added to. When `Branch-1` moves under a `claude/auto-*` PR, the run merges `origin/Branch-1` into the PR branch (§4 step 2).
4. **One item per run.** Usage limits are real. A run that finishes early does not start a second item.
5. **One open auto-PR at a time.** Every PR bumps `APP_VERSION`, sw.js `VERSION` and `WHATS_NEW`, so two open PRs would collide. A run first checks for an open `claude/auto-*` PR. If one exists, it stops politely (§4, step 2).
6. **Never live.** Runs push only to their own branch, `claude/auto-<item-id>` (for example `claude/auto-bl-01`), and open a PR into `Branch-1`. Runs never merge, never push to `Branch-1`, never deploy, and never enable auto-merge. `Branch-1` deploys to GitHub Pages, so going live needs the owner's explicit yes every time.
7. **Out of scope for runs:** `android/`, `capacitor.config.json`, `stage-www.sh` and the `@capacitor/*` deps (CLAUDE.md). Runs also never add a dependency, never change a scheduled task, never change environment settings, and never install a skill. Each of those is a question for the owner.
8. **"Done" means merged.** An item counts as done only once its PR is merged into `Branch-1`. A `ready (after BL-xx)` item waits until BL-xx is marked done **on `origin/Branch-1`**.

### Prerequisite before the first scheduled run

The `planning/` files, including this one, and `.claude/agents/` (the run prompt names `.claude/agents/build-automator.md`) must be merged into `Branch-1`; as of 2026-11-07 neither is on `origin/Branch-1`. Runs read their instructions from `origin/Branch-1`, not from whatever branch the builder happens to have checked out. Until that merge, the run prompt has nothing to read and the run stops at step 1.

---

## 2. Cadence (set by the owner, from 2026-11-09)

**Five runs a day, at 7:17 AM, 10:17 AM, 1:17 PM, 4:17 PM and 8:17 PM America/New_York, starting 2026-11-09.** The owner moved the loop from three runs to five. Before 2026-11-09 it was three (7:17 AM, 1:17 PM and 8:17 PM).

| Run | Eastern | Pacific | Why this hour |
|---|---|---|---|
| Morning | 7:17 AM | 4:17 AM | A PR is usually waiting by the time the owner is up. |
| Late morning | 10:17 AM | 7:17 AM | Picks up anything merged first thing. |
| Midday | 1:17 PM | 10:17 AM | Picks up anything merged in the morning. |
| Afternoon | 4:17 PM | 1:17 PM | Picks up anything merged over lunch. |
| Evening | 8:17 PM | 5:17 PM | Picks up anything merged during the day. A PR is ready for an evening review. |

- The minute is `:17`, not `:00` or `:30`, to avoid the top-of-hour rush.
- The 10:17 AM run falls inside the 6–9 AM Pacific busy window (9 AM–noon Eastern) that the three-run schedule avoided. The owner chose the times; a run that hits a busy service retries at the next slot.
- In practice the loop still moves at the owner's review speed. A run that finds a PR waiting costs a few tool calls and stops. With five slots, a merged PR waits at most about 11 hours overnight (8:17 PM to 7:17 AM) and at most 4 hours during the day.

**Scheduled task, once the owner says yes** (build-automator creates it; nothing is created yet):

- `create_trigger`, from inside the builder session, so it fires back into that session (mode 1). From any other session, pass `persistent_session_id` set to the builder's id (mode 2). Never `create_new_session_on_fire`: a fresh session would not have the repo.
- `name`: `Training Log build run`
- `cron_expression`: `CRON_TZ=America/New_York 17 7,10,13,16,20 * * *` (was `17 7,13,20 * * *` before 2026-11-09)
- `initiation`: `human_request`
- `prompt`: the text in §3, exactly.
- Notifications can't be set on a task that fires into an existing session. §6 covers how the owner hears about a PR instead.

**Pausing:** the owner says "pause the build runs". Build-automator then calls `update_trigger` with `enabled: false`, and `enabled: true` to resume. The owner can also do this from the claude.ai list of scheduled tasks.

---

## 3. The prompt each scheduled run receives

This is the exact text. It stays short on purpose: the procedure lives in this file, which every run re-reads, so a change to the procedure never needs a change to the scheduled task.

```
Scheduled build run (Training Log). You are the dedicated builder session. Act as the build-automator defined in .claude/agents/build-automator.md, but planning/automation.md on origin/Branch-1 is the single rulebook for this loop: where the two differ (pick order, branch name, baseline handling, anything else), automation.md wins.
1. cd into your own dedicated checkout of github.com/JdaBeast5/Training-Log (Branch-1) and run: git fetch origin --prune
2. Read the operating manual from Branch-1, not from your working tree: git show origin/Branch-1:planning/automation.md
3. Follow its section 4 checklist exactly, from step 1. Do not rely on memory of earlier runs; your context may have been compacted.
Hard limits: ONE backlog item at most, picked in the roadmap's Unified build sequence order, on branch claude/auto-<item-id>. If any claude/auto-* PR is open, do only steps 1-3 of the checklist, then stop. Never stash, commit, reset or delete work you didn't make: if the tree is dirty with anything step 1 doesn't allow you to discard, stop and report. Never rebase and never force-push; to catch a PR up, merge origin/Branch-1 into it. Use impeccable only through its SKILL.md text; never run its downloaded impeccable binary. Never merge, never push to Branch-1, never deploy, never enable auto-merge, never create or change scheduled tasks. A red baseline or a criterion you cannot honestly test is a stop, not something to work around.
End your turn with the run report from section 6 of the manual.
```

---

## 4. Per-run checklist

Work in the builder's own dedicated checkout (§1.1), never in a checkout another session uses. Keep scratch output (baseline logs, screenshots, sabotage patches) in the session's scratchpad, never in the repo.

### Step 1: Sync, read, and check the tree is the loop's own
- `git fetch origin --prune`.
- Read, from `origin/Branch-1`: this file, `CLAUDE.md`, `.claude/agents/build-automator.md` (the role; this file wins on loop rules), `planning/backlog.md`, and the newest `HANDOFF-v*.md` (its last addendum at least).
- Run `git status --porcelain` and `git branch --show-current`. Then:
  - **Clean tree:** carry on.
  - **Leftovers of a cut-off run.** All of these must hold: the current branch is a local `claude/auto-<item-id>` branch, and every modified or untracked path is in that item's `Files:` line (paths only), its Test plan's test file, or the step-13 record files (`planning/backlog.md`, `planning/build-log.md`, the newest `HANDOFF-v*.md`). Then a previous run was cut off (for example by a usage limit). Discard exactly those paths (`git restore --staged --worktree -- <paths>`; remove only the untracked paths on that list). If the branch has commits not on origin, `git switch --detach origin/Branch-1` and `git branch -D` that local branch. Count it as one failed attempt at that item in this run's log row. Don't try to resume it: half-finished, unverified work is exactly what this loop must not ship.
  - **Anything else** (another branch, or any path outside that list): someone else's work is in the checkout. **Stop.** Don't stash, commit, restore, clean or switch branches. End with `BLOCKED: builder checkout has changes this loop didn't make (<branch>, <first few paths>)`. No branch, no PR, no log row: the fix is the owner's (§1.1).
- Never use `git stash` in a run, for any reason. A stash in a shared stack is where other people's work gets lost.

### Step 2: Gate on open PRs (stop politely)
- List open PRs on `JdaBeast5/Training-Log` with `list_pull_requests` (`state: open`, `base: Branch-1`). Look for any head branch that starts with `claude/auto-`.
- **If one is open,** the run does only these upkeep checks on that PR, plus step 3 (the inbox), then ends with the "waiting" report from §6, for example `PR #61 (v3.517, BL-01) is still waiting for your review. No new work started.` It starts no item. Work on the PR branch in the builder's checkout: `git switch claude/auto-<item-id>` and `git pull --ff-only`. (If the tree isn't clean, step 1 has already stopped the run.)
  1. **The record commit exists.** Look for a `planning: record v<new> (<BL-id>, PR #<n>)` commit on the PR branch (`git log origin/Branch-1..HEAD --oneline`). If it's missing (the run that opened the PR was cut off after step 12), write it now as in step 13, push, and mention it in the report. A blocker PR needs its planning commit instead; add that if it's missing.
  2. **The base hasn't moved under it.** If `git merge-base --is-ancestor origin/Branch-1 HEAD` fails, `Branch-1` has moved. **Merge, never rebase:** `git merge --no-ff origin/Branch-1 -m "Merge Branch-1 into claude/auto-<item-id>"`. Never rebase, never `push --force`, never `--force-with-lease`.
     - **Clean merge:** run the full `bash check.sh`. Green: push (a normal push) and say so in the report. Red: `git reset --hard ORIG_HEAD` (this undoes only the run's own unpushed merge), push nothing, comment on the PR with the failing output, and report `WAITING (needs attention): …`.
     - **Conflicts only in `APP_VERSION`, sw.js `VERSION` or `WHATS_NEW`** (another version reached `Branch-1`): resolve by taking `Branch-1`'s side, then redo step 9 with the next free version, keeping this item's `WHATS_NEW` entry last. Run step 10 in full, commit the merge, push, update the PR title and body to the new version, and comment on the PR.
     - **Any other conflict:** `git merge --abort`. Push nothing. Comment on the PR naming the conflicting files, and report `WAITING (needs attention): PR #<n> conflicts with Branch-1 in <files>`. The owner decides: resolve it, or close the PR (§7.3).
- Also look at auto-PRs **closed without merging** since the last merged one. For each one, the item goes back to the owner (§7.3); it is not retried.

### Step 3: Inbox (owner answers)
- Collect any owner answers to `needs-owner` questions that aren't yet in the backlog. They can come from the builder session's own conversation, from comments on any `claude/auto-*` PR (`pull_request_read`, comments and reviews), or from the owner editing `backlog.md` directly.
- Apply them as described in §7. If no PR is open, they go into this run's PR as their own commit. If a PR is waiting, they go onto that PR's branch as a planning-only commit.

### Step 4: Baseline
- If `node_modules/jsdom` is missing, run `npm ci`.
- `git switch --detach origin/Branch-1`, so the baseline is exactly what's live.
- Run `bash check.sh > <scratchpad>/baseline.txt 2>&1; echo exit=$?`. `check.sh` runs version parity and every `test-*.js`.
- Record the counts: total suites (`ls test-*.js | wc -l`), the number of `FAIL: test-` lines, and the exit code.
- **Red baseline means stop.** Don't fix anything. Open a blocker PR (§5.1).

### Step 5: Pick
- Take the next item in the **Unified build sequence** at the top of `planning/roadmap.md` (as on `origin/Branch-1`): the first one, in sequence order, whose entry in `planning/backlog.md` is `ready` and not yet `done`. (Changed after the 2026-11-07 summit; file order no longer decides. Where an item ships as two versions, take its next unshipped part.) Skip:
  - `needs-owner`, `blocked`, `parked` and `done`;
  - `ready (after BL-xx)` items whose BL-xx isn't `done` on `origin/Branch-1`;
  - any item whose status carries a condition that isn't met yet (for example `ready (after the Phase 3 gate)` or `no sooner than 21 days after …`), reading the condition literally; when unsure, treat it as not met;
  - items whose last auto-PR was closed without merging (§7.3);
  - **items that already have a merged auto-PR,** whatever `backlog.md` says. List closed PRs into `Branch-1` (`list_pull_requests`, `state: closed`) and treat an item as shipped if any PR with head `claude/auto-<item-id>` or `claude/auto-<item-id>-<n>` has `merged_at` set. (The `done` status only arrives with the step-13 record commit, which a cut-off run may never have written.) If `backlog.md` on `origin/Branch-1` doesn't yet say `done` for it, note `<BL-id> shipped in PR #<n> but not marked done` in the run report's Flagged line; the next PR's record commit marks it.
- If none is ready, stop and report `Nothing ready`. Don't invent work, and don't promote a `needs-owner` item on your own.
- Re-read the whole item: Why, Change, Acceptance criteria, Test plan, Files, Risk, Tools.
- **Line numbers in the backlog are stale after each merge.** Re-grep every function the item names before editing.
- Create the branch: `git switch -c claude/auto-<item-id>`, with a lowercase id such as `bl-01`. If that branch already exists on origin (an earlier PR was closed), add `-2`, `-3`, and so on.

### Step 6: Implement
- Follow the item's `Tools:` line and toolchain.md §2: design with the named skill, then implement with `Edit` on the files in the item's `Files:` line (usually `index.html` and `sw.js`; some items edit `content-exercises.js` or `manifest.json`).
- **Impeccable: written guidance only** (owner decision 4, O4). Use the impeccable skill through its `SKILL.md` text and reference files alone. Never run its downloaded engine: not `scripts/impeccable`, not an `impeccable` binary or `impeccable detect`, and not any download or install step the skill describes. Where `SKILL.md` says to run the engine, take its Markdown fallback. If an item's acceptance criterion can only be met by running the engine, that's a criterion the run can't honestly test: stop with a blocker PR (§5.1), and the item becomes `needs-owner`.
- Implement exactly the item and nothing else. Extend existing patterns: `VIEW_RENDERERS`/`showView()`, `window.storage`, `expand-wrap`, `makeSwipeable`, `SCHEMA_VERSION`/`runMigrations()`, namespaced keys.
- Anything unrelated that you notice goes into the build-log "Flagged" column, not into the diff. That includes a stale backlog line number, dead CSS, or a wrong comment.
- If the item turns out to need something the backlog didn't foresee (a new stored key, a dependency, a data-shape change, a migration), stop. Mark the item `needs-owner` with a one-sentence question and open a blocker PR (§5.1).

### Step 7: Test
- Add or extend the `test-*.js` named in the item's Test plan. Load the real source from `index.html` through `testHelpers.js` into jsdom, call the real functions, and assert on the real result. Cover every acceptance criterion. Count real invocations, not text matches; a comment that quotes a call must not satisfy a count.
- Add a sabotage anchor where the item has a patch site (`count === 1`, say).
- Run the new test until it passes.

### Step 8: Sabotage check
- Undo the item's change (keep the test), without `git stash` (§4 step 1). For example, save the change with `git diff -- <the item's app files> > <scratchpad>/item.patch`, then `git restore -- <those files>`; or make a targeted revert of the key line the test plan names.
- Run the new test. **It must fail, for the reason the criterion describes.** Note which assertions failed.
- Restore the change (`git apply <scratchpad>/item.patch`, or undo the targeted revert) and confirm the test passes again.
- If the test passes with the change removed, it is proving itself, not the code. Rewrite it. This counts toward the two-attempt limit (§5).

### Step 9: Bump the version (by hand; the bump helper isn't in the repo)
1. Next version = current `origin/Branch-1` version + 0.001 (for example `3.516` → `3.517`). Read it with `grep -o "const APP_VERSION = '[^']*'" index.html | head -1`, as `check.sh` does: a second, regex match of that text exists further down `index.html`.
2. `index.html`: `const APP_VERSION = '<new>';`
3. `sw.js`: `const VERSION = '<new>';`. Edit the real file directly, never as pasted inline text.
4. `index.html` `WHATS_NEW`: append one entry **at the end** of the object, in the existing shape:
   ```js
     '<new>': { headline: '<plain-language outcome, ≤ 8 words>', points: [
       '<one or two sentences, written for the user, about what changed for them>',
     ]},
   ```
   This is required even for a mostly invisible change: say so honestly (see the comment above `WHATS_NEW`). Follow the owner's copy style in the latest entries: short, plain, no jargon, no internal ids.
5. `bash check.sh` must report `OK: both at <new>`.

### Step 10: Full suite, after the bump
- Run `bash check.sh` again, all of it, **after** the bump. A pre-bump pass doesn't count, because line drift from the edit has given false confidence before.
- Pass means exit 0, with suites = baseline + any new files, and 0 `FAIL:` lines. Record the counts.
- Visible items: run Playwright Chromium (`/opt/pw-browsers`) at 402×874 and 904×678, with screenshots to the scratchpad. Describe what was checked in the PR body.
- Review: run `Skill: code-review` at medium, without `--fix`, on the diff. Add `security-review` when the item touches `fetch`, keys, storage, import/export or `sw.js`. Fix only findings in this item's own diff; flag the rest. Re-run `check.sh` if anything changed.

### Step 11: Commit
- Commit 1, the increment, stages **exactly the paths on the item's `Files:` line** (ignore the line numbers in brackets), by name: `git add -- <path> <path> …`. Never `git add -A` or `git add .`. That line can include files other than `index.html` and `sw.js`, and they must be committed too: `content-exercises.js` (BL-05, BL-05b, BL-06, BL-25), `manifest.json` (BIZ-07, UX-03), `README.md` (BIZ-07), icon images, an existing test the item only re-pins (`test-concise-cues.js`), and a UX item's contact-sheet image if its `Files:` line names one. "The new test" / "the test" on that line means the test file(s) named in the item's Test plan.
  - Message: `v<new>: <item title> (<BL-id>)`, a 2–5 line body (what changed, the test, the sabotage result), then the attribution lines the session supplies.
- Then check with `git status --porcelain`: nothing should be left modified or untracked. If the run changed a path that isn't on the `Files:` line, it went outside the item: restore that path (it's the run's own change; step 1 guaranteed a clean start) and flag it. If the item genuinely can't be done without that file, the `Files:` line was wrong: stop with a blocker PR, and the item becomes `needs-owner` (§5.1). Never stage scratch files, `node_modules` or anything under `android/`.

### Step 12: Push and open the PR
- `git push -u origin claude/auto-<item-id>`.
- Use `create_pull_request` (GitHub MCP) with head `claude/auto-<item-id>` and base `Branch-1`, as a **ready** PR (not a draft), titled `v<new>: <item title> (<BL-id>)`. The body has:
  - **What changed**, for the owner, in 2–4 bullets;
  - **Acceptance criteria**, each with ✅ and the test that covers it;
  - **Tests**: baseline `N/N` suites, after the bump `M/M` suites, the new test's name and assertion count;
  - **Sabotage**: what was reverted and which assertions failed;
  - **Browser check**: sizes and what was looked at, or "not visible";
  - **Unverified**: for example "not tried on an iPhone";
  - **Flagged, not fixed**: anything noticed along the way;
  - **To ship**: "Merging this into Branch-1 makes v<new> live. Review and merge only if you're happy; reply on the PR for changes."
  - the PR attribution footer the session supplies.
- Then call `subscribe_pr_activity` for the PR, so the owner's comments wake the builder (§6.2).

### Step 13: Record
- Commit 2, `planning: record v<new> (<BL-id>, PR #<n>)`, on the same branch, containing:
  - `planning/backlog.md`: the item's status becomes `done (v<new>, PR #<n>)`, plus any inbox changes not already committed;
  - `planning/build-log.md`: one new row (§5.2);
  - the newest `HANDOFF-v*.md`: a short addendum (version, item, test, sabotage, unverified, flagged).
- Push. The PR now carries its own records, so they land on `Branch-1` with the merge.
- End the turn with the run report (§6.1).

---

## 5. Stop conditions and the build log

### 5.1 When a run stops

| Condition | What the run does | Owner sees |
|---|---|---|
| An open `claude/auto-*` PR | Inbox only (step 3), then stop. No branch, no log row. | A "waiting" run report naming the PR |
| Nothing `ready` | Stop. No branch. | A "nothing ready" run report listing the top 3 `needs-owner` questions |
| Red baseline (before any change) | **Blocker PR** (below). Nothing is fixed. | Blocker PR titled `BLOCKED: baseline red at v<cur>` |
| Two failed attempts at the item | **Blocker PR.** The item becomes `blocked`, with the reason. | Blocker PR titled `BLOCKED: <BL-id> after 2 attempts` |
| A criterion can't be honestly tested, or the item needs an unforeseen key, dependency, migration or data change | **Blocker PR.** The item becomes `needs-owner`, with the question. | Blocker PR with the question |
| The item would touch the Capacitor/Android files or anything §1.7 forbids | **Blocker PR.** The item becomes `needs-owner`. | Same |
| `origin/Branch-1` moved during the run and the version or `WHATS_NEW` now conflicts | **Before the first push:** nothing is published yet, so `git merge origin/Branch-1` into the branch (no rebase) and redo steps 9–10 with the next free version. If the merge conflicts in app code: `git merge --abort`, discard the run's own branch (`git switch --detach origin/Branch-1`, `git branch -D`), count an attempt, and retry once from step 4. **After the push:** handled by the next run's step 2 (merge, never rebase or force-push). | Nothing extra, or a PR comment from step 2 |
| The builder checkout has changes the loop didn't make (§4 step 1) | **Stop.** Touch nothing: no stash, commit, restore or branch switch. No branch, no PR. | `BLOCKED: builder checkout has changes this loop didn't make …` |
| Usage limit or the run is cut off | Nothing can be done in that run. The next run discards the leftovers at step 1 (only if they're on its `claude/auto-*` branch, in that item's files) and counts an attempt. A missing record commit on a pushed PR is added by step 2. | The next run's report mentions it |

- **An attempt** is one pass through steps 6–10 that ends with the full suite green and the sabotage check failing the way it should. An attempt **fails** if, after an honest effort, the new test can't be made to pass, the sabotage check doesn't fail, or the post-bump suite is red. Up to two attempts happen **inside one run**, so the limit never needs counting across runs.
- **A blocker PR** is the durable stop. It's a **draft** PR from `claude/auto-blocked-<yyyymmdd>` (red baseline) or `claude/auto-<item-id>` (item-specific) into `Branch-1`. It contains **only planning changes**: the build-log row, plus the item's new status in `backlog.md`. No app code and no version bump. The body has the failing output (trimmed), what was tried, and the question for the owner.
  - Because it's an open `claude/auto-*` PR, it pauses all later runs until the owner deals with it. They can close it (for example after fixing the baseline themselves) or merge it (accepting the status change).
- Nothing about a blocker is fixed "while we're here". A pre-existing failure is information for the owner (CLAUDE.md).

### 5.2 What `planning/build-log.md` records

One row per run that made a branch: each shipped PR and each blocker PR. "Waiting" and "nothing ready" runs add no row; their record is the run report in the builder session. Rows reach `Branch-1` only when their PR merges, which keeps the log on the PR branch consistent with the code.

| Column | Contents |
|---|---|
| Date (ET) | `2026-11-08 07:17` |
| Item | `BL-01` plus a short title |
| Outcome | `shipped`, `blocked`, or `needs-owner` |
| Version | `3.517`, or `—` for a blocker |
| PR | `#61` |
| Suites before → after | `199/199 → 200/200` |
| New/extended test | `test-volume-modifier-gate.js` (assertion count) |
| Sabotage | What was reverted → which assertions failed, or `n/a` |
| Attempts | `1`, or `2` (plus `+1 abandoned` if step 1 discarded leftovers) |
| Flagged, not fixed | Anything unrelated noticed (stale line refs, dead code, copy). `—` if none. |

---

## 6. How the owner hears about a PR

GitHub won't reliably notify the owner. The PRs are opened with the owner's own GitHub identity, and GitHub doesn't notify you of your own actions. A scheduled task that fires into an existing session can't send push or email notifications either. So the signal is built from what the owner does see:

1. **The run report.** It's always the last message of the run's turn, so it's what the builder session shows in the claude.ai/code session list and the Claude app. The first line is always one of:
   - `PR READY: #<n> v<new> <BL-id> <title> — <link>`
   - `WAITING: PR #<n> (v<x>, <BL-id>) still needs your review — <link>`
   - `BLOCKED: <reason> — draft PR #<n> — <link>`
   - `NOTHING READY: <k> items need your answer (top: <BL-id> <question>)`

   Then 1–4 more lines: test counts, what to try on the iPhone, and the question if there is one. Nothing else.
2. **The PR itself.** A ready PR (draft for blockers) into `Branch-1`, with a predictable `v<new>: …` or `BLOCKED: …` title. Two places show it: the repo's PR list and the GitHub app's "Created" filter. The owner can also add `claude/auto-*` PRs to a watched GitHub saved search.
3. **Optional, needs the owner's yes:** if the owner wants a phone push for each new PR, build-automator can propose a separate, fresh-session-per-fire scheduled task with `notifications: {push: true}`. It would run once a day, check for an open `claude/auto-*` PR, and report it, without touching the repo. This isn't set up by default.

### 6.1 Run report (every run ends with this)

```
<status line from the list above>
Tests: baseline <N>/<N> → after bump <M>/<M> suites; new <test-file> (<k> assertions), sabotage-checked.
Try on iPhone: <what to look at, or "nothing visible">.
Question for you: <only if something needs-owner>.
```

### 6.2 When the owner comments on a PR

`subscribe_pr_activity` delivers PR comments, reviews and merges into the builder session as their own turns. On such a wake:
- **Merged or closed:** unsubscribe. No other action; the next scheduled run picks up from GitHub's state.
- **Change requested on the open PR:** make that change only, on the same branch, at the **same version**. Nothing has gone live, so no new bump is needed, but update the `WHATS_NEW` text if the change alters it. Re-run the test, the sabotage check if the logic changed, and the full suite. Push, then reply on the PR with the new counts. Don't start a backlog item in this turn.
- **An answer to a `needs-owner` question:** apply it per §7.
- **Anything asking to merge, deploy or push to `Branch-1`:** reply that the owner merges, and do nothing else.

---

## 7. How needs-owner answers flow back into backlog.md

### 7.1 Where answers come from
- In the builder session's chat. For example "BL-28: yes", "BL-30: Analysis only", "BL-34: only for RPE mode".
- As a comment on any `claude/auto-*` PR.
- By the owner editing `backlog.md` on `Branch-1` themselves. That's already applied, so nothing needs doing.

When an answer arrives as a chat message or PR comment outside a scheduled run, the builder records it in that same turn (§7.2). It doesn't wait for the next run, because compaction could lose it. It starts no implementation in that turn.

### 7.2 How an answer is written down
Edit the item in `planning/backlog.md` only:

| Answer | New status line |
|---|---|
| Yes, as written | `- **Status:** ready (owner yes <yyyy-mm-dd>: "<their words, short>")` |
| Yes, with a change | `ready (owner <yyyy-mm-dd>: "<their words>")`, and rewrite **Change** and **Acceptance criteria** to match. If the change is big enough that the criteria aren't obvious, mark it `needs-owner` again and ask the project-manager to re-split it. Don't guess. |
| No | `parked (owner no <yyyy-mm-dd>: "<reason if given>")`. Move it under "Parked or later". |
| Not yet / unclear | Leave it `needs-owner` and add `Owner said <date>: "…"` under the question. |

- **Ordering:** per the backlog's own rule, an approved item moves to the `Ready` sections, **directly after whatever ready item is next in line** (or in flight). It doesn't jump ahead of an item that's already building.
- **Durability:** the backlog edit goes in a commit titled `planning: owner answers <BL-ids>`.
  - If no auto-PR is open, it goes on this run's branch as its own commit, before the increment commit.
  - If an auto-PR is open, it goes onto that PR's branch as a planning-only commit (no app code, no version change), with a PR comment saying so.
  - Either way it reaches `Branch-1` with the next merge, and the next run reads it from there.
- **Until it merges**, the item is still `needs-owner` on `Branch-1`, so no run builds it early. The owner's yes arrives on `Branch-1` in the same merge that ships the item before it.

### 7.3 A PR closed without merging
- The next run doesn't retry that item. It sets the item to `needs-owner` with the question: `PR #<n> was closed without merging — retry as is, change it (how?), or drop it?` It records this in a planning commit, as in §7.2.
- If the owner said why in a closing comment, quote it and apply §7.2 directly instead.
- A retry after the owner says "retry" uses `claude/auto-<item-id>-2`.

---

## 8. Open questions for the owner

1. **Cadence:** are 7:17 AM, 1:17 PM and 8:17 PM Eastern OK, or should it be fewer runs?
2. **Go-ahead to create the scheduled task** (§2), once the `planning/` files are on `Branch-1`. (Owner decision 2, 2026-11-07, approved the dedicated builder checkout and the 3-a-day trigger; the task still waits for D1.)
3. **Optional daily push reminder** for a waiting PR (§6, item 3)?
4. **Resolved 2026-11-07 (decisions 3 and 4):** this file is the single rulebook for the loop and wins over the agent file on loop rules (stated in the run prompt, §3, and at the top of this file); impeccable's engine is never run in unattended builds (§4 step 6).
5. The `ship-increment` project skill (toolchain.md §3, item 8) would hold §4's steps 4–13 as a skill. Until it's approved, this file is the recipe.
