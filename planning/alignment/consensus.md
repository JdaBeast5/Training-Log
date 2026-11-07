# Pre-D1 alignment: the reconciled position

Chaired by the project-manager, 2026-11-07, against live **v3.516** (`APP_VERSION` `index.html:7618`, `sw.js` `VERSION` matches). Inputs are the brief and the seven reviews in this folder: market-researcher (MR), exercise-auditor (EA), skills-orchestrator (SO), marketing-manager (MM), business-manager (BM), build-automator (BA) and design-engineer (DE). I also read `pitch.md`, `roadmap.md`, `backlog.md` and `program-audit.md` (Alignment addendum).

**The name is open.** The owner chose Liftnext, and it ships as the display name (`APP_NAME`, `index.html:7622`). MR and MM then found four "NextLift" fitness apps, three of them launched in 2026. A naming specialist is writing `planning/naming.md`. This document doesn't pick a name: it says "the app's name" wherever the answer matters, and the plan works whichever name the owner chooses.

**Sign-offs:** all seven say **Agree with conditions**. Nobody disagrees with the direction. Every condition is listed in (b).

---

## (a) The direction everyone agrees on

1. **The product:** the best free lifting tracker on the phone. Proven programs tell you what to lift next, and you log it in one tap. Food and recovery are joined to training. There are no ads, no account and no paywall on anything that runs on the phone. A subscription comes later, and only for features that run on a server.
2. **The order:** make the engine **safe**, then **truthful**, then rebuild it in Plate & Press one tested PR at a time. Strangers only see it after the first-week fixes and the launch gates have shipped.
3. **Growth** comes from share cards made on the phone (the bib, Year in Lifting, "Your number") and sent through the person's own share sheet. There's no feed, no tracking, and no number that rewards junk volume.
4. **The loop:** one item per version per PR, with three runs a day. **Only the owner merges**, and nothing goes live without his yes.

---

## (b) Blocking concerns, deduplicated

Classes:
- **FIX** means fix before D1: a planning or spec change the team makes now.
- **OWNER** means owner action before D1.
- **GATE** means it's tied to a specific build or phase.

"Done here" means the change was applied in this round to `roadmap.md`, `backlog.md` or `pitch.md`.

### Fix before D1 (planning and spec)

| # | Concern | Raised by | Evidence | Agreed fix | Owner | State |
|---|---|---|---|---|---|---|
| F1 | **BL-01 under-specifies what it changes.** Besides the four lifting programs, goal volume and accumulation also change sets on oly, climbing, bodyweight, calisthenics, boxingsc, jumprope, hyrox, grappling, running and swimming. BL-01 would silently stop all of that. Its criterion 1 doesn't list those programs or iterate the day-count variants, and its line "changes nothing outside the four built-ins" says the opposite of what happens. | BA B1, EA N6 | BA measured this with the real functions. `PROGRAM_DAY_COUNT_VARIANTS` is at `index.html:16196`. | Name the allowlist explicitly: the audit's four, `strength`, `bodybuilding`, `powerbuilding` and `powerlifting`. Criterion 1 covers **every other built-in key** (21 of 25) and their variant days. The What's New entry names the programs whose sets stop rising. The owner confirms the list (decision 6). | PM + EA | Done here (BL-01) |
| F2 | **"This plan never auto-increases" is false after BL-01.** Load is never gated: `analyzeProgressionSignal` suggests "+increment" at RPE ≤8.5 on 13 medical slots. That contradicts BL-02's cap of RPE 7. | EA B2 (SAF-8) | `program-audit.md`, Alignment addendum, SAF-8 | Fold SAF-8 into BL-02. On clinical, senior and prenatal plans, the increase signal needs logged RPE ≤7 in both sessions, the increment is the smallest loadable jump, and with no RPE logged the copy says "if both sessions felt comfortable". The promise is reworded to: "never adds sets; load rises only in the smallest steps when sets felt easy". BL-08 and BL-24 inherit this, with test assertions. | PM | Done here (BL-02, roadmap theme 1, pitch) |
| F3 | **Neck Bridges and Depth Jump safety waits about 55 builds, and the scope is under-counted.** Neck Bridges appear 6 times and Depth Jump about 21 times; BL-35 names 2 sites. | EA B1, N5 | `grep` at v3.516: `'Depth Jump'` ×21, `Neck Bridge` ×6 in `index.html`. The cue is `content-exercises.js:350`. | (i) A new **ready, cue-only Phase 0 item, BL-05b**: "Only with a coach; otherwise 4-way neck isometrics, 15 s each way at 50% effort". (ii) BL-05's Depth Jump cue gains "first 4 weeks: do Drop Landing 3×5 instead". (iii) Both tests count every occurrence. (iv) BL-35 and BL-36 move to directly after Phase 0, if D4 is approved. | PM | Done here |
| F4 | **The day-to-ink rule doesn't exist.** `getDayPlateClass` (`index.html:26219`) colours days by position from seven hues (`VIVID_PLATE_CLASSES`, 26218) and ignores each day's `plate` field. MKT-03, MKT-06a and MKT-16 print "the day's ink" long before UX-05. | DE B1 | Live code, plus UX-05's self-contradiction (its Change uses `getDayPlateClass`, its criterion 1 uses `plate`) | A new item, **UX-01b `dayInk(id)`**: a pure helper returning one of the five inks or off, with no visible change. It ships before MKT-03. UX-05 is rewritten against `dayInk`, and `--plate-*` is re-pointed to the spot inks there. The rule itself is decision 9. | PM + DE | Done here |
| F5 | **Phase 2 leaves the app half-redesigned for about four weeks.** UX-12 and UX-13 sat at builds 58–59. UX-03's criteria miss 14 `radial-gradient` halos, the launch aura, the violet "Create my profile" button, the manifest colour and `theme-color` (`index.html:18–19`). | DE B2 | `roadmap.md` (old Phase 2) | Phase 2 now runs BIZ-05 → UX-03 → UX-04 → UX-05 → **UX-13 → UX-12** → UX-06a…, so every tab is in the new materials before the cover. UX-03 gains the missing criteria and puts Gym mode out of scope until UX-17. | PM | Done here |
| F6 | **The `design-directions.md` §5 additions never reached the backlog.** These are: no state colour on a spot field; a deep-ink cover for yellow in the dark; meta text ≥15 px on spot fields; a 16 px gap between Log and adjust; the heaviest plate against the collar; a full-width bar. | DE B4 | `design-directions.md` §5 | Copied into UX-06 and UX-07. | PM | Done here |
| F7 | **UX-01's pixel-identity baseline is stale and not deterministic.** It compares against "the v3.514 baseline" and has no seed, no frozen clock, a cold-launch animation and clock-dependent copy. The owner never sees the screenshots, which go to the scratchpad. | DE B3 | UX-01 criterion 3; `automation.md` §4, steps 10–11 | A new **TOOL-01, the visual harness** (`tools/visual/`), built by DE as a tooling PR with no app change and no version bump. UX-01 waits for it, and its baseline becomes the parent commit. | DE (build), PM (item) | Item added; build pending |
| F8 | **The bib edge isn't in the sequence.** MKT-16 to MKT-18 are unscheduled, and MKT-17 depends on 06b, which ships months before MKT-04. | MR, MM B3 | Old `roadmap.md` | Place MKT-16 → MKT-17 → MKT-18 directly after MKT-04 and UX-09a. The wall of bibs moves to the 2027 recap. | PM | Done here |
| F9 | **Stale items.** The rename (MKT-09) is still scheduled in Phase 5 although it shipped in v3.515. MKT-19 is still `needs-owner` although it shipped in v3.516. Chalklog text remains in MKT-09, MKT-16, BIZ-18, BIZ-20 and BIZ-12, and pitch D7 still recommends Chalklog. | all | `backlog.md`, `pitch.md` | MKT-19 is marked done (v3.516). MKT-09's display rename is done (v3.515); what remains is the public-name decision. The Chalklog text is removed, and D7 is replaced. | PM | Done here |
| F10 | **The old name is live on outputs.** Cards print `'TRAINING LOG'` (`index.html:29608`) and save as `training-log.png` (29623). The backup saves as `training-log-backup-…json` (34223). `test-app-rename.js` only catches the mixed-case form. | MM | Live code | A new item, **MKT-20**: the file names come from `APP_NAME`, and the rename test also catches the upper-case form. The card footer text goes in MKT-03, which draws the Sash mark instead. | PM | Done here |
| F11 | **The food lane arrives after build 50.** That means recents, single items from yesterday, trend weight and expenditure, the most frequent touch in the app. Every week BL-17 slips also delays BL-27 by a week. | MR B2 | Old roadmap #51–54 | The lane (BIZ-03 → BL-18 → BL-19 → BL-16 → BL-17) moves to the **end of Phase 1** (slots 34–38), before the redesign starts. That also lets UX-13 assert recents unconditionally (see (c), C2). | PM | Done here |
| F12 | **The run checklist can't commit what the items change.** Step 11 stages only `index.html`, `sw.js` and tests, but BL-05 edits `content-exercises.js` (build 5), BIZ-07 and UX-03 edit `manifest.json`, and UX PRs need the contact sheet. BL-05's Files line also says "precache" for a file whose own header says never to precache it. | DE, BA, plus a PM finding | `automation.md` §4 step 11; BL-05 | Step 11 stages exactly the item's `Files:` line. BL-05's Files line is fixed (version bump only) and its test may update the cue-count pin from 964 to the new total. | BA (`automation.md`), PM (BL-05) | BL-05 done here; `automation.md` pending BA |
| F13 | **Runs can rebuild a shipped item or stash other agents' work.** `done` is only written in the step-13 commit, and step 1 stashes any dirty tree. | BA B2, B3 | `automation.md` §4 steps 1, 5, 13 | Step 5 skips any item that has a merged `claude/auto-<id>*` PR. Waiting runs add a missing record commit. Step 1 discards work only on a `claude/auto-*` branch, and otherwise stops. | BA | Pending BA |
| F14 | **Build runs would execute an unvetted binary.** `impeccable/SKILL.md` step 1 runs `scripts/impeccable` (a roughly 21 MB download). UX-03 criterion 4 needs `impeccable detect`. | SO B2, DE B3 | `toolchain.md` §1–2 | Until decision 4, build runs use the Markdown fallback only. `automation.md` §4 step 6 must say so. UX-03's `impeccable detect` criterion is replaced by the UX-01 WCAG test plus axe-core (if D10 approves it). | SO (done), BA (`automation.md`), PM (UX-03, done here) | Partly done |
| F15 | **BL-02 criterion 5 fails as written.** There's a fourth read of `RPE_BY_CYCLE_WEEK[` in `renderLoadModeNote` (`index.html:32899`). | BA | Live code | Route that read through `rpeTargetFor` too, or exclude it explicitly. The spec now routes it. | PM | Done here |
| F16 | **BIZ-16's host test can't see the app's hosts.** It parses only literal `fetch(` targets. USDA and DSLD go through constants, and the barcode library loads by `<script src>` from two CDNs. | BM B2 | `index.html` ~35042, 35792, 35227 | Enumerate every `https://` host literal, split into "the app contacts" and "links you open", and list per host what is sent. | PM | Done here |
| F17 | **BIZ-18 and BIZ-20 still carry the Chalklog draft.** BIZ-18's "if it runs on your phone, it's free" would break a paid coach program. | BM | `business.md` §3.4 | Use the §3.4 wording, with the name as a placeholder until the owner decides. | PM | Done here |
| F18 | **New items the agents asked for are missing.** These are: SAF-9 (the AI prompts know the clinical style); the BL-41+ program-extension placeholder; the free-list guard (BIZ-18a); the origin move (BIZ-25); barcode SRI (BIZ-26); the PRODUCT.md name (DOC-01); and missing `Tools:` lines. | EA N4, N7; BM; MM; SO; DE | Reviews | Added: BL-50 (SAF-9), BL-41–49 reserved, BIZ-18a, BIZ-25, BIZ-26, DOC-01, and `Tools:` lines on UX-03 to UX-17 and MKT-16 to MKT-19. | PM | Done here |

### Owner action before D1

| # | Action | Raised by | Why it blocks D1 | Recommended |
|---|---|---|---|---|
| O1 | **Turn on branch protection for `Branch-1`** (require a PR, no force push, no auto-merge), and add deny rules for `mcp__github__merge_pull_request`, `gh pr merge` and `git push … Branch-1`. | SO B1 | "Never merge" is only prose today. The main session has the MCP merge tool, and a direct push wasn't tested. | Yes (`toolchain.md` §8) |
| O2 | **Give the builder its own checkout** (a fresh clone or `git worktree`) that no planning agent writes to, and retire `claude/taste-skill-v2` for planning at D1. Later planning changes go as `claude/planning-*` PRs, which never edit `Status:` lines. | BA B3, §4 | Step 1 would stash the other agents' untracked work. | Yes |
| O3 | **Resolve the two builder instruction sets.** The agent file says file order and `claude/auto-<date>-<id>`; `automation.md` says sequence order and `claude/auto-<id>`. Either approve editing `.claude/agents/build-automator.md` steps 1 and 3, or add "where they differ, `automation.md` wins" to the run prompt. | SO B3, BA B4 | From BL-07 onward the two pick different items. | Edit the agent file (it's configuration, so it's the owner's call) |
| O4 | **Impeccable's engine:** Markdown fallback only in unattended runs. | SO B2 | An unattended download-and-execute | Fallback only |
| O5 | **D1's merge scope:** `planning/` **and** `.claude/agents/` must be on `Branch-1`. The merge also publishes `tools/design/`, `PRODUCT.md` and `.claude/` on the Pages site. | BA B5 | Runs read from `origin/Branch-1`. | Merge both. Publishing is acceptable, because the repo is already public (Pages on this plan requires it) and nothing secret is in those folders. Check `.claude/` for anything private first. |
| O6 | **Add the v3.515/v3.516 addendum to `HANDOFF-v59.md`.** Its last line, "revisit the original mission before more features", is the first thing a run reads. | BA | It's a stale instruction to the first run. | Whoever shipped v3.516 writes it. Not a PM edit. |
| O7 | **Confirm the BL-01 allowlist** and the clinical load rule (decisions 6–7). | BA, EA | Build 1 and build 2 | See (e) |

### Gate later (tied to a build or phase)

| # | Gate | Raised by | Blocks | Fix |
|---|---|---|---|---|
| G1 | **The name.** Either confirm it after a free USPTO knockout (LIFTNEXT, LIFT NEXT, NEXTLIFT and live LIFT- marks in classes 9, 41 and 42) and buy the `.app` domain, or adopt the `naming.md` pick. | MR B1, MM B1 | **MKT-03 (slot 17)** and any wordmark | MKT-03 ships the Sash mark with **no wordmark**. The wordmark is its own version (MKT-03b, needs-owner). If the name changes, the rename (MKT-09) ships before MKT-03b. |
| G2 | **The printed address** must be a permanent domain forwarded with a 301, never `github.io`, and never attached to the app's repo as a Pages custom domain. That would change the origin and strand every log. | MM B2 | BIZ-08 (Phase 5) | BIZ-08 recommends the domain. Moving the origin is a separate needs-owner item with an export-and-import path (BIZ-25). |
| G3 | **TOOL-01 merged**, plus Playwright WebKit (D10) | DE B3 | UX-01 (slot 11) and UX-03 (slot 40) | A tooling PR; D10 |
| G4 | **The mock-ups re-rendered** with the F1–F8 corrections (`today.html:79`, `:112`; `pr.html:67`, `:82`; `progress.html:78–90`; `recap.html:78`; `directions/a-today.html:69`). | DE B4 | Phase 2 (slot 39) | DE, in a follow-up run. Until then the backlog text beats the pictures. |
| G5 | **The AI privacy disclosure.** "Your logs stay on your phone" is false for AI users unless it's disclosed. | BM B1 | BIZ-06 (slot 55) and BIZ-17 (slot 68) | BIZ-06 says, at each AI entry point and before the key prompt, what that feature sends and to whom. Without that, BIZ-17's line ends "…unless you use AI with your own key". |
| G6 | **Program dose before strangers.** Bodybuilding 3-day gives chest 3 sets a week (audit H-3, scored F). | EA B3 | Phase 5 | BL-37 and BL-38 are part of the Phase 3 hard gate, or the owner records an alternative (for example, hiding the 2–4 day bodybuilding variants). |
| G7 | **Removals before launch.** UX-17 (retire Gym mode), BL-35 and UX-15 must not become take-aways after launch. | BM B3 | Phase 5 | UX-17 ships or is dropped before any Phase 5 step. The free list says "fixed or retired for safety, never moved behind a payment". |
| G8 | **The AI prompts know the clinical style** (SAF-9): on medical styles the verdict is limited to MAINTAIN or DELOAD. | EA N4 | Phase 5 and BIZ-14 | BL-50, in the Phase 3 gate |
| G9 | **D10 tools:** paper-lookup before the three unverified citations reach the app; WebKit and axe-core before Phase 2. | SO §4, DE | Slot 37 (BL-16 cites the Hacker's Diet) and slot 39 | Settle D10 before slot 34, not before D1. |
| G10 | **Tap parity.** "Log the ready set" and "log a recent food" may not take more taps after the redesign. | MR §3 | UX-06a, UX-13 and UX-17 | These are now acceptance criteria. UX-17 waits for parity on device. |

---

## (c) Disagreements that remain

| # | Topic | Position A | Position B | Recommendation |
|---|---|---|---|---|
| C1 | **When the name must be settled** | MM: "this week". Re-pick now while it costs one version. | MR: before build 11 (now slot 17). SO and BA: not a D1 blocker. | **Not a D1 blocker, but decide before MKT-03 merges.** MKT-03 ships mark-only either way, so the YIL lane doesn't wait. A rename gets more expensive with every card shared, so decide in the first week anyway. |
| C2 | **Where the food lane goes** | MR: the start of Phase 2 (builds 25–29), with UX-13 restyling it later. | DE: Phase 2 must restyle every tab before the cover, with nothing in between. | **The end of Phase 1** (slots 34–38). That gives MR's timing (about one build later than asked) and keeps DE's Phase 2 unbroken. UX-13 then asserts recents and BIZ-03's line unconditionally. |
| C3 | **The design-engineer building outside the loop** | DE: build TOOL-01 and the mock-up re-renders as their own PRs. | SO: all implementation goes through the loop, or `APP_VERSION` PRs collide. | **Allow it for tooling only.** TOOL-01 and the re-renders touch neither `index.html` nor `sw.js` and bump no version, so they can't collide. Anything in the app goes through the loop. |
| C4 | **The headline number on share cards** | EA and MM: sets by default; tonnage rewards junk volume [ROB24][PEL]. | DE §5 and the old MKT-04, MKT-06 and MKT-16 text: three tabs including total load. | **Sets (plus lifts and minutes) by default**, with total load off by default. Applied to MKT-04, MKT-06 and MKT-16 (the two owning agents agree). Decision 15 lets the owner reverse it. |
| C5 | **What `impeccable detect` is for** | DE: UX-03 criterion 4 uses it. | SO: the engine is an unvetted download, so use the Markdown fallback. | **SO wins until the owner approves the engine.** The criterion becomes the WCAG test plus axe-core. |
| C6 | **BL-36's drop landing** | Old BL-36: append Drop Landing after the depth jumps. | EA N5: a prerequisite can't come after the thing it prepares for, so it belongs in the cue. | **The cue carries the rule** (BL-05, Phase 0). BL-36 stays under D4 only as a loggable drill, with its order caveat. |
| C7 | **Year in Lifting 2026 carrying a name** | MM: name and mark, no address. | MR: no wordmark until the name is cleared. | **Mark always; wordmark only if the name is confirmed by then; no address either way** (decision 16). |
| C8 | **The free-list guard as its own version** | BM: a ready, test-only guard early in Phase 1. | The loop's rule: every item bumps the version with a What's New entry. | **BIZ-18a ships as a version** with an honest "nothing you'll see" What's New line, which the `WHATS_NEW` comment already allows. |

No agent disagrees with Phase 0 coming first, BL-08 coming before the redesign, the Phase 3 hard gate, or the money line.

---

## (d) The revised build order: the first 19 slots

† marks a needs-owner slot: the loop skips it until the owner approves (`automation.md` §4 step 5). The full sequence is in `roadmap.md`.

| New # | Item | Was | Change and reason |
|---|---|---|---|
| 1 | BL-01: program gate on goal volume and accumulation | 1 | **Spec fixed:** the allowlist is named, all 21 other built-ins and their variants are covered, and the What's New entry lists the changes (F1) |
| 2 | BL-02: RPE caps, plus the **clinical load gate** (SAF-8) | 2 | The load gate is folded in, and criterion 5 now covers `renderLoadModeNote` (F2, F15) |
| 3 | BL-03: per-exercise region override | 3 | — |
| 4 | BL-04: exercise-specific substitutes | 4 | — |
| 5 | BL-05 + BL-06: safety cues, plus the **Drop Landing rule** in the Depth Jump cue | 5 | The cue rule is added, every occurrence is counted, the cue pin is updated, and the Files line is fixed (F3, F12) |
| 6 | **BL-05b: Neck Bridges cue: coach-only, else isometrics** | new | A cue-only safety move covering all 6 occurrences (F3) |
| 7 | BL-13: the cycle card | 6 | — |
| 8† | **BL-35: replace Neck Bridges** (D4) | Phase 4 tail | Moved up about 55 slots; all 6 occurrences; old sets archived (EA B1) |
| 9† | **BL-36: Drop Landing drill** (D4) | Phase 4 tail | Moved up; the rule itself is already in the cue (C6) |
| 10 | BL-08: all-set double progression | 7 | Now asserts the clinical load rule (F2) |
| 11 | UX-01: tokens as aliases, after TOOL-01 | 8 | Baseline = parent commit; adds a test that the Sash hexes equal `--spot-*` (F7) |
| 12 | **UX-01b: `dayInk(id)`, no visible change** | new | The ink rule exists before any card prints it (F4) |
| 13 | BL-07: the performance goal | 9 | — |
| 14 | MKT-02: no body data on cards | 10 | — |
| 15† | MKT-09: the rename, **only if the owner picks a new name** | Phase 5 | So no card ever prints a name that's about to change (G1) |
| 16† | UX-02: Archivo (D2) | 26 | Moved before the cards, so Year in Lifting doesn't change typeface later (DE) |
| 17 | MKT-03: story cards with the **Sash mark, no wordmark** | 11 | The wordmark waits for the name; footer text out (F10, G1) |
| 18† | **MKT-03b: the wordmark**, once the name is confirmed | new | Split from MKT-03 so the lane never waits on the name (G1, C7) |
| 19 | MKT-06a: Year in Lifting computation and summary card, **target 30 Nov** | 12 | Sets lead, not tonnage (C4). With no optional slots approved it's the 14th merge; with all of them, the 19th. |

**What else moved:**
- **BIZ-18a** (the free-list guard) and **MKT-20** (file names) go at the end of Phase 1.
- **The food lane:** BIZ-03 → BL-18 → BL-19 → BL-16 → BL-17 moves from #44 and #51–54 to the **end of Phase 1** (C2).
- **Phase 2's order:** BIZ-05 → UX-03 → UX-04 → UX-05 → **UX-13 → UX-12** → UX-06a/b → UX-07 → UX-08 → MKT-04 → UX-09a → **MKT-16 → MKT-17 → MKT-18** → UX-09b → BIZ-06 → BL-20 → **BL-33† → BL-31†** → UX-10 → UX-14 → UX-11.
- **Phase 3** gains BIZ-19, BL-50 (SAF-9), BIZ-26 (SRI), plus BL-37† and BL-38† as part of the gate.

**Removed:**
- MKT-09 "the rename" as a Phase 5 build (shipped as v3.515).
- MKT-19 (shipped as v3.516).
- The "Before build 1" step-5 change (already in `automation.md`).
- MKT-06b's wall of bibs (moved to the 2027 recap).

**YIL timing:** 06a is now the 14th to 19th merge, against the 12th before. At one merge a day from about 9 November, that's 22 to 27 November. Summit R5 still applies: if 06a slips, nothing else moves.

---

## (e) Owner decisions, in the order they unblock D1

The labels in `pitch.md`'s table are: 1–4 = O1–O4; 5 = D1; 6 = D11; 7 = D12; 8 = D4; 9 = D13; 10 = D7 (replaced); 11 = D2; 12 = D14; 13 = D10; 14 = D3; 15 = D15; 16 = D16; 17 = D5 and D6; 18 = D8; 19–20 = D9's follow-ups.

Each has a recommended answer.

**Before D1 (the loop can't safely start without these):**
1. **Branch protection and deny rules on `Branch-1`?** Yes (O1).
2. **The builder in its own checkout; planning on `claude/planning-*` PRs after D1; go-ahead for the 3-a-day trigger?** Yes (O2, BA Q1).
3. **Make the builder agent file follow `automation.md`** (or add the run-prompt line)? Yes, edit the agent file (O3).
4. **Impeccable's downloaded engine in unattended runs?** No: Markdown fallback only (O4).
5. **D1: merge `planning/` and `.claude/agents/` to `Branch-1` and start the loop,** accepting that `tools/design/`, `PRODUCT.md` and `.claude/` appear on the Pages site? Yes, after checking `.claude/` for anything private (O5).
6. **BL-01: keep goal volume and accumulation only on Strength, Bodybuilding, Powerbuilding and Powerlifting** (custom programs unchanged), so the 21 other programs, including Olympic, Climbing and Calisthenics, stop gaining sets? Yes (the audit's list).
7. **Clinical plans: load rises only in the smallest step after two sessions at RPE ≤7,** rather than no load suggestions at all? Yes.

**In the first week (before slots 8–19):**
8. **D4: approve BL-35 and BL-36 now so they ship right after Phase 0** (archive old neck-bridge sets), and BL-37 to BL-40 one migration per version, with BL-37 and BL-38 before going public? Yes.
9. **Day colours: each day takes its program's plate ink** (red, blue, yellow, green; white for cardio; grey for rest; inks repeat in programs of 5+ days), instead of 7 distinct hues? Yes, plate code.
10. **The name:** adopt `naming.md`'s pick, or keep Liftnext after a free USPTO knockout (classes 9, 41 and 42) and buying its `.app` domain (forwarded, never a Pages custom domain)? Decide before MKT-03 merges. Until then, cards carry the mark only.
11. **D2: Archivo (before the cards), coach button into the header, retire Gym mode once Today matches its tap counts and you've used it for two weeks, and update PRODUCT.md to the chosen name?** Yes to all.
12. **Visual review: a contact-sheet image (about 0.3 MB) committed with each UX PR?** Yes.

**Before the food lane and Phase 2 (slot 34):**
13. **D10:** keep the `Skill` tool already given to three agents (a retroactive yes), approve paper-lookup now and WebKit and axe-core before Phase 2, drop `ship-increment`, and give market-researcher and exercise-auditor the `Edit` tool? Yes.
14. **D3:** BL-31 and BL-33 yes (placed right after the ledger); BL-34 for RPE-mode targets only; BL-32 as a one-tap "make today easier"; BL-30 no.
15. **Share cards lead with sets, lifts and minutes; total load off by default?** Yes.
16. **Year in Lifting 2026: the mark (and the name only if it's confirmed), no web address?** Yes.
17. **D5** (calorie check-in after 3 weeks of BL-17 data; saved meals): yes. **D6** (Strong/Hevy import into an "Imported" archive; one dated comparison page): yes, and send one export file.

**Before going public (Phase 5):**
18. **D8:** go public after Phase 3 and its gates (BL-37 and BL-38, BL-50, UX-17 shipped or dropped, the AI disclosure), web first, then Play, then the App Store? Yes, in that order.
19. **D9 follow-ups:** adopt `business.md` §3.4's "What's free" wording for BIZ-18 (yes); have a clinician review the clinical copy before listing and counsel review before any server (yes); use a personal Play account with founding members as the 12 testers (yes, unless you have a business entity).
20. **Later, and not urgent:** BIZ-23 and BIZ-24 (the coach plan and coach programs) stay as the plan of record, with no work before BIZ-21's T4.

D7 (Chalklog) is withdrawn and replaced by decision 10.

---

## (f) Ready for D1 when…

- [ ] Branch protection is on for `Branch-1`, and the merge and push deny rules are in project settings (owner; O1).
- [ ] The builder session has its own checkout or worktree (owner; O2).
- [ ] The builder agent file and `automation.md` agree, or the run prompt says `automation.md` wins (owner; O3).
- [ ] `automation.md` has been updated by the build-automator:
  - [ ] §4 step 11 stages the item's `Files:` line (F12);
  - [ ] step 5 skips items with a merged auto-PR, and waiting runs add a missing record commit (F13);
  - [ ] step 1 stops on a non-`claude/auto-*` branch (F13);
  - [ ] step 6 says Markdown fallback only for impeccable (F14);
  - [ ] waiting runs check mergeability and rebase (BA §3).
- [ ] `HANDOFF-v59.md` has the v3.515/v3.516 addendum (O6).
- [ ] The owner has answered decisions 1–7 above. Decision 6 can default to the audit's list if he says "go".
- [ ] `roadmap.md`, `backlog.md` and `pitch.md` reflect this document (done this round, PM).
- [ ] The baseline is green on the D1 merge commit: `check.sh` plus all 199 suites (BA's dry run at v3.516: 199/199, 0 FAIL).
- [ ] `planning/` and `.claude/agents/` are both included in the D1 merge (O5).

Not required for D1: the name (G1, before MKT-03), TOOL-01 (before UX-01, slot 11), D10 (before slot 34), and the mock-up re-renders (before Phase 2).
