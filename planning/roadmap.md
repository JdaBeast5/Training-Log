# Roadmap

The app shows **Liftnext** as its display name (`APP_NAME`, v3.515). The public name is **open**: the owner decides, with `planning/naming.md` as input. This file says "the app's name" wherever the answer matters.

## Unified build sequence (agent summit, revised by the pre-D1 alignment round, 2026-11-07)

This is the one order every build run follows. It supersedes the "Requested build order" under Business priorities below, and the order sections in `design-vision.md` §7, `marketing.md` §6 and `program-audit.md` §6.
- The summit's reasons are in `planning/summit.md` §2 (R1–R11).
- The alignment round's changes, and why, are in `planning/alignment/consensus.md` (d).

**Ground rules:**
- One item is one version, and one PR is open at a time (`automation.md` §1).
- A run takes the first slot, in this order, whose item is `ready` and not `done` (`automation.md` §4 step 5).
- Slots marked **†** are `needs-owner`. The loop skips them until the owner approves, then builds them in the slot where they sit. That's why approved safety and program items sit early.
- The pace equals the owner's merge rate. There are **69 ready builds**. At one merge a day (an assumption, not a promise), that's about ten weeks.
- **Spec refresh (2026-11-08):** net +3 to that count (BL-01 done; BL-36, UX-02, BL-65 and BL-66 ready). Slots 2–16 were re-specified against v3.518 in `backlog.md`. The owner's third-round answers (D3, D5, D6, D8, 2026-11-08) are applied in the bullet "Third round applied" below.
- **Audit fold-in (2026-11-08):** the exercise-auditor's 18 items (PR #68) are slotted below, with no existing slot renumbered or moved. Net **+11 ready** (BL-43, BL-48, BL-53, BL-54, BL-55, BL-57, BL-58, BL-60, BL-62, BL-63, BL-64), so there are now **83 ready builds**. Seven more are † (BL-46, BL-47, BL-51, BL-52, BL-56, BL-59, BL-61). Specs are in `backlog.md` → "Added from the exercise-consistency audit".
  - **Date risk:** 24 ready builds now sit before MKT-06a (slot 19), counting slot 8 as ready per the backlog. To merge it by **30 November** takes about 1.1 merges a day from 8 November; at one a day it lands around 3 December. Summit R5 says nothing else moves if it slips. The owner can accept that, or move BL-55 and BL-63 (13c, 13d) to just after slot 19.
  - **Accepted (owner, 2026-11-08):** MKT-06a landing **around 3 December** is fine. Nothing is re-ordered for it: BL-55 and BL-63 stay at 13c and 13d. The 30 November date stays as the stretch target, and MKT-06's Priorities row still runs 1 December to 15 January, so a 3 December merge loses only the first two days of the window.
- **Third round applied (2026-11-08, "1-6 yes, clinician"; `pitch.md` → "Owner's answers", third round):**
  - **D3:** BL-33 (slot 57) and BL-31 (slot 58) are ready. BL-34 (slot 81) is ready, re-scoped to RPE-mode load targets only, so PR history and e1RM charts don't move. BL-32 (slot 82) is ready as a one-tap "make today easier", never automatic. BL-30 is parked (owner no).
  - **D5:** BL-28 (slot 76) is ready. BL-27 (slot 83) is ready after BL-17, and no sooner than 21 days after BL-17's merge (three weeks of its data).
  - **D6:** BL-29 (slot 77) is ready, as a separate "Imported" archive that feeds PRs and e1RM. MKT-12 is now one build, a dated and sourced `compare.html` (slot 97, after BL-29 and MKT-14). The owner may send a Strong or Hevy export to test against.
  - **D8 and D9 (a)–(e):** Phase 5's builds now have numbered slots (89–98). BIZ-15, BIZ-16, MKT-14, BIZ-18 and BIZ-08 are ready **behind the Phase 3 gate**; BIZ-15's copy review is done by a paid clinician (D9(e)), outside the loop, before any listing. BIZ-12, MKT-13, BIZ-20, BIZ-21 and BIZ-22 are decisions with no code; they're marked `answered` and recorded in `business.md` §3.4–3.6 and §6 and `marketing.md` §4.3–4.4.
  - **D10:** approved: paper-lookup now, Playwright WebKit and axe-core before Phase 2, the `Skill` tool kept for its three agents, and `Edit` for the market-researcher and exercise-auditor. Noted only: the owner changes the `.claude/` files himself. Until he does, the slot-37 and slot-78 citation checks and the slot-39 WebKit check still wait on the tools being present.
  - **Count:** net **+7 ready** in Phases 2–4 (slots 57, 58, 76, 77, 81, 82, 83) on top of the 83 above, plus 6 Phase 5 builds that are ready but gated.
- **Second-round approvals applied (2026-11-08, from the owner's 2026-11-07 "1-13 yes"):** D4's BL-37 and BL-38 (slots 74–75, after BL-52, still in the Phase 3 gate), BL-39 and BL-40 (slots 84–85), and D2's UX-16 (slot 62) and UX-17 (slot 86, with its two-week and on-device conditions) are now ready. Slot 8's stale † is cleared (BL-35 is ready, option (b)). Net **+7 ready** more.

**Before slot 1** (see `consensus.md` (f)):
- The owner's actions:
  - branch protection and deny rules;
  - a dedicated builder checkout;
  - the agent file aligned with `automation.md`;
  - decisions 1–7.
- The build-automator's `automation.md` fixes:
  - step 11 stages the item's `Files:`;
  - the merged-PR skip;
  - the step-1 guard;
  - the impeccable fallback.
- `planning/` and `.claude/agents/` are merged into `Branch-1` (D1).

**Outside the loop** (tooling or docs only: no `index.html` or `sw.js` change, no version bump, so no collision with the open auto-PR):
- **TOOL-01, the visual harness.** Built by the design-engineer and merged by the owner **before slot 11**. **Done** (`tools/visual/` is on `Branch-1`).
- **The mock-up re-renders** (summit R1, design-engineer B4), before slot 39.
- **DOC-01:** PRODUCT.md takes the chosen name, once the owner decides it.
- **BL-67:** a test-only guard that no exercise substitute crosses the jump category (PR #63 flag; added 2026-11-08). Any planning or tooling PR may carry it.

### Phase 0: Safety (9 builds, plus 2 if D4 is approved, plus 1 if approved)
1. BL-01: program gate on goal volume and block accumulation. The allowlist is named, and the test covers every other built-in program and variant. **Done (v3.518, PR #63).**
2. BL-02: RPE caps on clinical programs; RPE mode off for technique lifts; **the clinical load gate (SAF-8)**
   - 2a. **BL-68: backups leave out saved API keys** (owner, 2026-11-08)
   - 2b. **BL-69: clinical RPE-mode loads rise at most one smallest step per session** (owner "rpe c", 2026-11-08; PR #72 follow-up)
3. BL-03: per-exercise region override
   - 3a. **BL-70: region fixes after BL-03:** wider Sled Push and Wall Balls, Sled Pull plus 5 carries and hangs, relief-aware cautions, heel drop as Ankle/Foot relief (owner 2026-11-08, auditor recommendation; before BL-04)
4. BL-04: exercise-specific substitutes
5. **BL-05 + BL-06, one version:** the safety cues, including the Depth Jump **Drop Landing rule**, across all 20 occurrences (counted at v3.518)
6. **BL-05b:** the Neck Bridges cue says coach-only, otherwise isometrics (all 6 occurrences)
   - 6a. **BL-62:** clinical dose and position wording: per-leg Achilles and ACL doses, side-lying breathing in pregnancy, Sandbag Lunges per leg *(audit fold-in, 2026-11-08)*
   - 6b. **BL-64:** cue contradictions: Chair Pose knees, Good Morning, Front Lever, Hammer Curl, Hanging Leg Raise *(audit fold-in)*
   - 6c. **BL-61:** plyometric prescriptions match their cues: Jump Squat 6-8, Single-Leg Bound per leg *(audit fold-in; owner yes 2026-11-08)*
7. BL-13: the cycle card stops prescribing phase-based training
8. BL-35: replace Neck Bridges with a 4-way neck isometric (D4 approved; archive method settled 2026-11-08: option (b), move nothing, fresh history for the isometric)
9. BL-36: Drop Landing as a loggable drill on the ACL-risk watersports days (D4 approved 2026-11-07; ready)

### Phase 1: Engine truth, foundation, the Year in Lifting lane, and the food lane (33 builds, plus 7 if approved)
- **History truth, first** *(audit fold-in, 2026-11-08)*:
  - 9a. **BL-51:** new log entries record the exercise name; suggestions ignore another exercise's entries. This fixes wrong-weight suggestions across lifts, and must ship before BL-08 *(needs-owner: adds a stored field)*
  - 9b. **BL-53:** medical history reaches History, PRs and volume; the watersports fallback key
10. BL-08: all-set double progression (inherits the clinical load rule)
11. UX-01: design tokens as aliases (no visual change). After TOOL-01; the baseline is the parent commit.
12. **UX-01b:** `dayInk(id)`, the one day-to-ink rule (no visual change)
13. BL-07: the performance goal no longer cuts strength-tier work
13a. **BL-65:** the coach's volume line matches the program gate *(PR #63 flag; added 2026-11-08)*
13b. **BL-66:** the phase tag drops "Accumulation" where no block sets are added *(PR #63 flag; added 2026-11-08)*
13c. **BL-55:** cardio rows ask for a distance only when distance is the measure, and it never blocks a finished set *(audit fold-in)*
13d. **BL-63:** the time shown on Today counts the work, not just the rest *(audit fold-in)*
14. MKT-02: no body data on share cards *(Year in Lifting lane)*
15. MKT-09: the rename, **only if the owner picks a name other than Liftnext** *(lane)*. **Done (v3.517, Platestep).** The loop skips it.
16. UX-02: the Archivo display face (D2 approved 2026-11-07; ready), so the cards never change typeface *(lane)*
17. MKT-03: story-format cards with the **Sash mark and no wordmark** *(lane)*
18. MKT-03b: the wordmark *(lane; owner 2026-11-08: Platestep confirmed)*
19. **MKT-06a: the Year in Lifting computation plus one summary card.** Target: merged by **30 November** *(lane; summit R5: if it slips, nothing else moves)*
19a. **BL-54:** one exercise, one name in History, PRs and the warm-up fallback (Back Squat = Squat, and so on) *(audit fold-in; after MKT-06a so its date holds, before MKT-06b)*
20. BL-10: a target RIR on every prescription, with a short form and a words form
21. BL-15: the decrease signal waits for two short sessions
22. BL-24: increments scale with strength (inherits the clinical load rule)
22a. **BL-58:** library entries for the Light and Speed variants (technique flag, no load push); prune orphans *(audit fold-in)*
23. BL-09: readiness compared with the week's own RPE target
24. BL-23: one-tap early deload when overreaching
24a. **BL-48:** the deload week also shortens duration-only cardio *(audit fold-in)*
25. BL-14: unit-aware rest times
25a. **BL-57:** the rest parser reads trailing multipliers, per-side mobility and swim repeats *(audit fold-in; on top of BL-14)*
26. BL-26: the plateau message names the stall
26a. **BL-56:** `noWeight` on moves that never take load, load on the ones that do *(audit fold-in; owner yes 2026-11-08; before BL-11)*
27. BL-11: rep and time progression for bodyweight work
28. MKT-01: consistency counts training weeks
29. **MKT-06b: the remaining Year in Lifting cards** (no wall of bibs). Target: mid-December; the window runs to 15 January.
30. BL-12: copy that matches the code
31. BL-25: exercise cue corrections
31a. **BL-60:** substitutes that keep the same muscle and joint *(audit fold-in)*
32. **BIZ-18a:** the free-list guard test (no lock, upgrade or "Pro" label in free areas)
33. **MKT-20:** card and backup file names follow `APP_NAME`
- **The food lane (moved up from #44 and #51–54; market-researcher B2):**
34. BIZ-03: placeholder calorie targets are labelled
35. BL-18: one-tap recent foods
36. BL-19: "Add from yesterday"
37. BL-16: trend weight (needs D10's paper-lookup for the Hacker's Diet citation, or ships with it marked unverified in the plan only)
38. BL-17: expenditure estimated from your logs (starts BL-27's three-week data clock)
- **Endurance progression** *(audit fold-in; the running, cycling and swimming F grades)*:
  - 38a. **BL-43:** running progression from your own logged distance (the 30-day single-run cap)
  - 38b. ~~**BL-46:** cycling FTP anchor, retest and interval progression~~ *(parked: owner no, 2026-11-08)*
  - 38c. ~~**BL-47:** swimming CSS anchor and set progression~~ *(parked: owner no, 2026-11-08)*

### Phase 2: Redesign core. Every tab in the new materials before the cover (21 builds, plus 4 if approved)
**Before slot 39:** the mock-ups are re-rendered, and Playwright WebKit is approved (D10). **After slot 40 (UX-03), the owner looks on device before the next UX item builds on it.**

39. BIZ-05: the first-set hint (also the cover's empty state)
40. UX-03: flat ground everywhere, including the halos, the launch, "Create my profile", the manifest and `theme-color`. Gym mode is out of scope.
41. UX-04: the tab bar
42. UX-05: the day sets the ink (reads `dayInk`; re-points `--plate-*`)
43. **UX-13: Food in the world's ink** (moved from #59; asserts recents and BIZ-03's line, and tap parity)
44. **UX-12: History as a month of plate blocks** (moved from #58)
45. **UX-06a:** the cover: numeral, Log button, chips, and fields behind "adjust" (tap parity)
46. **UX-06b:** the day picker collapses into the headline sheet
47. UX-07: the plate stack
48. UX-08: rest takes over the cover
49. MKT-04: session share data (sets, lifts, minutes; no total load by default), as a named builder that UX-09 reuses
50. **UX-09a:** the finish sheet: totals, "Next time", Share, Done
51. **MKT-16:** the session bib card *(moved in; the owner's chosen edge)*
52. **MKT-17:** "Your number"
53. **MKT-18:** pin the bib on your own photo
54. **UX-09b:** the PR flood and its motion; none on clinical programs
55. BIZ-06: AI entry points say they need a key, **and what each sends and to whom**; the AI card sorts below Trends
55a. **BL-59:** category corrections that feed the muscle ledger, with M-8 *(audit fold-in; owner yes 2026-11-08; before BL-20)*
56. BL-20: the per-muscle ledger, fractional; the ink fill stops at the floor
57. BL-33: deloads count only weeks you trained *(owner yes 2026-11-08, D3)*
58. BL-31: weekly ±1 set per muscle from your performance *(owner yes 2026-11-08, D3; after BL-20)*
59. UX-10: Progress leads with the answer
60. UX-14: the unfolded two-pane Today
61. UX-11: the weekly recap sheet with the week strip
62. UX-16: the coach button into the header *(owner yes 2026-11-07, D2)*

### Phase 3: The first week, data trust, and the launch gates (11 builds, plus 5 if approved)
**Hard gate:** before any Phase 5 public step:
- all of Phase 3 is merged, **including BL-37 and BL-38** (or an alternative the owner records for the 2–4-day bodybuilding variants);
- **UX-17 has shipped or been dropped.**

63. BIZ-02: one name, asked once
64. BIZ-01: the three-question quick start, with summit R9's routing guard
65. BIZ-04: the first backup reminder after 3 sessions
66. BIZ-10: the Add to Home Screen hint
67. BIZ-07: truthful metadata, manifest and README
68. BIZ-17: the first screen says what the app is (its privacy clause matches BIZ-06's disclosure)
69. BL-22: export workouts as CSV
70. BIZ-09: the first-month summary in Diagnostics
71. BIZ-19: "Training since" (reuses MKT-17's corpus pass)
72. **BL-50:** AI prompts know the clinical style (SAF-9)
73. **BIZ-26:** the barcode library loads with an integrity hash
73a. **BL-52:** variant- and style-scoped history keys, with a migration *(audit fold-in; owner yes 2026-11-08; after BL-51 has stamped names for some weeks, and before BL-37 so its migration can attribute entries)*
74. BL-37: rebuild the low day-count variants *(owner yes 2026-11-07, D4; migration; after BL-52)*
75. BL-38: Bodybuilding d6 "Upper Detail" *(owner yes 2026-11-07, D4; migration; after BL-52)*
76. BL-28: saved meals *(owner yes 2026-11-08, D5)*
77. BL-29: import from Strong or Hevy into a separate "Imported" archive *(owner yes 2026-11-08, D6)*

### Phase 4: Bar-raisers and growth moments (4 builds, plus approved owner items)
78. BL-21: HRV against your own baseline (needs D10's paper-lookup for Plews 2013)
79. MKT-07: PR and progress cards show the gain, with the record's kind named (summit R6)
80. MKT-05: block complete, as a variant of UX-11's recap sheet
81. BL-34: RPE-adjusted e1RM for RPE-mode targets only; PR history stays put *(owner yes 2026-11-08, D3)*
82. BL-32: one-tap "make today easier", never automatic *(owner yes 2026-11-08, D3; after BL-21)*
83. BL-27: weekly calorie check-in, applied only on Accept *(owner yes 2026-11-08, D5; no sooner than 21 days after BL-17's merge)*
84. BL-39: append-only accessory volume *(owner yes 2026-11-07, D4)*
85. BL-40: hypertension isometrics and medical notes *(owner yes 2026-11-07, D4)*
86. UX-17: retire Gym mode *(owner yes 2026-11-07, D2)*. Two weeks after UX-06a, once the owner records tap parity on device; it ships or is dropped before Phase 5.
87. UX-15: the dead-CSS sweep (always the last UX item; it runs after UX-17 if that's approved)
88. BL-41, BL-42, BL-44 and BL-45: program extensions, itemised by the exercise-auditor before Phase 2 ends. These are the powerlifting top single plus peak, Olympic % bands and a miss counter, bodyweight ladders, and athletic metrics. They're placeholders, not buildable yet. (BL-43, BL-46, BL-47 and BL-48 are written and slotted at 24a and 38a–c; BL-49 is unassigned.)

### Phase 5: Public launch (owner yes 2026-11-08, D8: after Phase 3 and its gates; web first, then Play, then the App Store)
**Every slot below waits for the Phase 3 hard gate** (all of Phase 3 merged, including BL-37 and BL-38, and UX-17 shipped or dropped). Until it holds, a run skips slots 89–98 as if they weren't ready. Slots 89–98 are new numbers (2026-11-08); nothing above was renumbered.
- **Decisions (no code), answered 2026-11-08:**
  - BIZ-12: go public, web first, then Play, then the App Store (D8);
  - BIZ-11 (the model);
  - the public name: Platestep (`naming.md`; MKT-09 done);
  - MKT-13: launch posts and creator outreach, no paid placements (D8);
  - BIZ-20, BIZ-21, BIZ-22: the founding price, the six switch-on triggers, Play billing first (D9 (b)–(d)).
- **Builds:**

89. BIZ-15: the clinical acknowledgement and no form-video links on clinical items. A paid clinician reviews all clinical, tip and nutrient copy (D9(e)), outside the loop and before any listing.
90. BIZ-16: `privacy.html`, listing every host
91. MKT-14: `about.html` *(after BIZ-16)*
92. BIZ-18: "What's free" (`business.md` §3.4 wording) *(after BIZ-16 and MKT-14)*
93. BIZ-08: the address on cards (a forwarded domain, never `github.io`) *(also waits for the owner to confirm the domain forwards)*
94. MKT-10: program links *(after BIZ-08)*
95. MKT-11: friend challenges *(after BIZ-08 and MKT-01)*
96. MKT-08: side-by-side progress photos *(parked until Phase 4 is done, then ready)*
97. MKT-12: one dated, sourced comparison page, `compare.html` *(owner yes 2026-11-08, D6; after BL-29 and MKT-14)*

- ~~BIZ-25: move the app's origin~~ (parked: owner chose forward only, 2026-11-08);
- the BIZ-13 follow-up: own-cloud backup through the share sheet (no item written yet; it gets slot 98 when it is).
- **Not code here:** the store listing itself belongs to the Capacitor track.
- **Last owner decisions:** BIZ-23 and BIZ-24 (the coach plan and coach programs) are plan of record; no work before BIZ-21's T4.

### Merged, split, dropped
- **Merged:**
  - BL-06 into BL-05;
  - SAF-8 into BL-02;
  - MKT-04's stats builder into UX-09;
  - MKT-05 into UX-11 (as a variant);
  - UX-10's "AI insights moves below the evidence" clause into BIZ-06;
  - MKT-19's card mark into MKT-03.
- **Split:**
  - UX-06 into 06a and 06b;
  - UX-09 into 09a and 09b;
  - MKT-06 into 06a and 06b;
  - UX-01 into 01 and 01b;
  - MKT-03 into 03 and 03b;
  - BIZ-18's criterion 4 into BIZ-18a.
- **Shipped before D1:**
  - MKT-09's display rename (v3.515);
  - MKT-19's Sash icon (v3.516).
- **Dropped from the mock-ups** (no item, no evidence):
  - the numeric "Readiness 72";
  - "Add 2 sets each";
  - the 20-set ceiling on the ledger band.
- **Deferred or recommended "no":**
  - BL-30 (the ledger stays in Progress; parked, owner no 2026-11-08, D3);
  - MKT-15 (no attribution);
  - BIZ-14 (no hosted AI yet);
  - a sync server;
  - the wall of bibs (to the 2027 recap);
  - total load as a card's default number.

---

Owner: project-manager. Written 2026-11-07 against **v3.514** (`index.html:7622`, `sw.js` `VERSION` matches). Line numbers below are `index.html` at v3.514 unless a file is named.

Inputs:
- `planning/research.md` (market-researcher, 2026-11-07);
- `planning/program-audit.md` (exercise-auditor, 2026-11-07);
- `planning/toolchain.md` (skills-orchestrator, 2026-11-07);
- `HANDOFF-v59.md` through Addendum 41.

All three planning inputs were written against v3.514. **Alignment round (2026-11-07, v3.516):** v3.515 and v3.516 changed only the display name and the icon, with no program logic, so the themes below still hold. The line numbers have drifted by a few lines; re-grep them. The sequence above was revised per `planning/alignment/consensus.md`.

**Mission (owner, 2026-11-07):** "the best tracking app and the best workout plans according to the most up to date studies and proven workouts." Every theme below either makes tracking faster or more trustworthy, or makes the programming measurably better. Exercise demos stay parked (HANDOFF-v59 Addendum 41).

## Baseline at planning time
`bash check.sh` passed. All **198** `test-*.js` suites passed, with **0** failing (run 2026-11-07, v3.514). Every build run diffs against this.

## Corrections to the research's "missing" verdicts (re-checked by grep)
| Research said | What the code has | Effect on the plan |
|---|---|---|
| Food: "No recents list, copy-yesterday or saved-meal shortcut" | A whole-day **"Repeat yesterday"** exists: button `index.html:6313`, `updateRepeatYesterdayVisibility` 37668, click handler 37686. It only appears while the viewed day is still empty, and it copies the whole day. **Recents** and **saved meals** really are missing. Food entries carry no meal slot (breakfast/lunch), so "copy yesterday's breakfast" has nothing to key on. | The backlog extends Repeat yesterday (BL-19) instead of building a second copy feature. Recents (BL-18) is new. |
| Volume: "no set targets per muscle" | Targets exist, but they're coarse: `VOLUME_LANDMARKS` (45253) gives ranges per **category group** ("Chest & Shoulders", "Back", ...), and `volumeLandmarkLabel` (45262) labels them in `renderVolumeTrend` (45537). Counting is direct sets by exercise category (`MUSCLE_GROUP_MAP` 45233), so chest and side delts share one number. There are no per-muscle targets, no fractional counting and no feedback. | BL-20 adds a per-muscle ledger to the existing card. Nothing is built beside it. |
| Readiness: HRV imported but unused | Confirmed. `computeReadiness` (46843) takes no HRV input. HRV lands in `hrv-log` (46960). **New finding:** the importer maps both `rmssd` and `sdnn` to the same `hrv` series (46962). These are different metrics. A personal-baseline comparison is safe only while one source is used consistently. | BL-21 compares against the person's own baseline. The SDNN/rMSSD mix is flagged in BL-21's risk and is **not** fixed there. |
| CSV export / import: missing | Confirmed. Only a JSON backup exists (`exportDataBtn` 6248, handler 34159). The only CSV handling is the health importer (`parseHealthCsv` 47037). | BL-22 adds export; BL-29 adds import (needs-owner). |
| Trend weight and adaptive TDEE: missing | Confirmed. `renderSparkline` (40795) computes pace first-to-last; `computeTargets` (32973) is static Mifflin–St Jeor × activity. | BL-16 and BL-17 are ready; BL-27 needs the owner. |
| Plate calculator: "Has it" (~31753) | Found at the summit (2026-11-07): **gone.** Only its comment and `BARBELL_EXERCISES` / `isBarbellExercise` survive (31752–31769). There is no per-side maths. | UX-07's plate stack (`platesPerSide`) restores it, with zero taps. |
| RIR targets | Confirmed missing in the default mode. RIR appears only inside RPE mode (`rirFromRpe` 27393, badge 27756). | BL-12 |

Other facts found while checking, recorded as flags rather than fixed:
- `applyGoalVolume` (26659) and `computeSuggestedSet` (27812) have **no direct test coverage**. Neither does `CATEGORY_TO_REGIONS` (43894). BL-01, BL-02 and BL-03 will be their first tests.
- The mesocycle tag (`mesocyclePhaseTag`, 26741) will still say "Accumulation" on medical programs after BL-01 gates the modifier. That's a wording question for later, not part of BL-01.
- Day-level `note` renders only on rest days (`renderWorkout` 28566). The audit's SAF-5 suggestion, "a note on the first 4 weeks of wakeboarding/kite days", has no render path. BL-05 puts the prerequisite in the exercise cue instead.

---

## Themes, ranked

Scores run 1–5. Impact is impact on the owner's daily use; confidence is in the evidence and in the fix; effort is reversed, so 5 means smallest. **Rank = I × C × E.** Safety is ranked first regardless of score, by owner rule.

| Rank | Theme | I | C | E | Score | Backlog |
|---|---|---|---|---|---|---|
| 1 | **Program safety gates** | 4 | 5 | 5 | 100 (forced first) | BL-01 to BL-06, BL-05b, BL-13, BL-35, BL-36, BL-50, BL-51, BL-61, BL-62 |
| 2 | **Progression engine correctness** | 5 | 4 | 4 | 80 | BL-07 to BL-11, BL-15, BL-24, BL-34, BL-58 |
| 3 | **Effort and volume programming** (RIR, per-muscle ledger, set autoregulation) | 5 | 4 | 3 | 60 | BL-12, BL-20, BL-30, BL-31 |
| 4 | **Nutrition you can trust** (trend weight, adaptive expenditure) | 4 | 4 | 3 | 48 | BL-16, BL-17, BL-27 |
| 5 | **Logging speed** (food) | 4 | 4 | 3 | 48 | BL-18, BL-19, BL-28 |
| 6 | **Program quality** (dose, frequency, selection, copy truth) | 4 | 4 | 2 | 32 | BL-14, BL-26, BL-37 to BL-40, BL-43, BL-46 to BL-48, BL-56, BL-57, BL-59, BL-60, BL-64 |
| 7 | **Recovery that understands lifting** | 3 | 3 | 3 | 27 | BL-21, BL-23, BL-32, BL-33 |
| 8 | **Portability and reliability** (including history truth) | 2 | 5 | 3 | 30 | BL-22, BL-29, BL-52 to BL-55, BL-63 |

Theme 7 sits above theme 8 despite the lower score. Readiness is seen every training day; import and export are one-off.

### 1. Program safety gates
- **Problem:**
  - Goal volume and block accumulation add sets to ACL rehab, prenatal, hypertension and senior plans. ACL d4 goes from 3 sets per exercise to 5, and hypertension volume doubles (audit SAF-1).
  - RPE mode can prescribe RPE 9 to hypertension clients and on snatches (SAF-2).
  - Resting-region flags miss fingers, neck, calves and the knee on leg curls (SAF-3).
- **Benchmark:** no competitor programs clinical populations, so there is no best app to copy. The closest is Juggernaut AI's autoregulation, which has no clinical gating ([SensAI compare](https://www.sensai.fit/blog/juggernaut-ai-vs-rp-hypertrophy-vs-alpha-progression-2026)).
- **How we go one better:** a visible, test-enforced promise: "this plan never adds sets; load rises only in the smallest steps when sets felt easy". (Revised in the alignment round: BL-01 gates sets only, so SAF-8's load gate is folded into BL-02.) It's backed by a jsdom test over every `MEDICAL_STYLES` day (11352) × goal × week, plus BL-02's load-signal test. Clinical plans then follow their own tolerance-based `basis` text [AHA23][PREG19] (audit source keys).

### 2. Progression engine correctness
- **Problem:**
  - Double progression reads only the top set (`topSetOf` 27150, `buildPastSessions` 27530). A pyramid where only set 1 hits the top still says "add weight". This contradicts the app's own tip at 33105 (H-2).
  - The "performance" goal cuts Powerlifting 5×5 to 3×5 (H-1).
  - Readiness calls the prescribed week-4 RPE "fatigue" (H-7).
  - One bad session drops the load 7.5% (M-2).
  - Rest parsing reads "6×2min" as 2 reps and gives 240 s (M-1).
- **Benchmark:**
  - Hevy Trainer uses all-sets double progression ([Hevy help](https://help.hevyapp.com/hc/en-us/articles/38385724273047-Hevy-Trainer-Explained-How-It-Builds-Your-Workout-Program)).
  - Alpha Progression's per-set recommendations are its most-praised feature, but Pro-only ([hotelgyms](https://www.hotelgyms.com/blog/alpha-progression-the-gym-logger-app-from-germany)).
- **How we go one better:**
  - All-set double progression, free, with the reason shown in one line (the badge already explains itself).
  - Increments that scale with strength (BL-24), instead of Hevy's fixed jumps.
  - Every rule unit-tested against the coached rule it cites (GZCLP, Helms [PRAC]).

### 3. Effort and volume programming
- **Problem:** in default mode no set has an effort target (H-5). Weekly volume is counted by coarse category with no per-muscle dose (`renderVolumeTrend` 45482).
- **Benchmark:** RP Hypertrophy adjusts weekly sets per muscle from pump, soreness and workload. It costs $34.99 a month ([rpstrength](https://rpstrength.com/rphypeapp)), and critics say beginners can't judge "pump" ([Dr. Muscle](https://dr-muscle.com/rp-hypertrophy-app-beginners/)).
- **How we go one better:**
  - An RIR target on every set [ROB24][REF23].
  - A per-muscle ledger with fractional counting [PEL] against roughly 10 or more sets per week [ACSM26].
  - Then a ±1-set weekly rule driven by **performance** (reps at load), with soreness only as a tiebreak.
  - Free, offline, with the reason shown. It stays out of clinical programs (theme 1).

### 4. Nutrition you can trust
- **Problem:** calories are set once from a formula (`computeTargets` 32973). Pace is computed first-to-last on raw weigh-ins (`renderSparkline` 40795), so one water-heavy morning swings the pace and the goal date (`describeGoalPace` 40780).
- **Benchmark:** MacroFactor estimates expenditure from intake plus trended weight, re-checked weekly. It needs 2–3 weeks of data ([help 109](https://help.macrofactorapp.com/en/articles/109-how-frequently-do-i-need-to-log-my-weight-for-the-expenditure-algorithm-and-weekly-coaching-updates), [V3](https://macrofactor.com/expenditure-v3/)). It has no free tier ([gainframe](https://gainframe.app/blog/macrofactor-review/)).
- **How we go one better:**
  - Free.
  - Shows the arithmetic ("intake 2,410 avg, trend −0.4 lb/wk → about 2,600").
  - Falls back to the formula until there's enough data, and says why.
  - Keeps `computeDeficitGuardrail` (14446) as the floor.
  - Trend smoothing follows the published Hacker's Diet exponential moving average ([fourmilab](https://www.fourmilab.ch/hackdiet/), the 10% smoothing constant; checked from memory, unverified this session).

### 5. Logging speed (food)
- **Problem:** every food after the first needs search → select → add. Repeat yesterday works only on an empty day and copies the whole day (37668–37702). There are no recents and no saved meals.
- **Benchmark:** MacroFactor competes on tap counts with its "Food Logging Speed Index" (self-reported, [FLSI](https://macrofactorapp.com/fastest-food-logger-2025/)). MyFitnessPal paywalls the barcode scanner ([unstar](https://unstar.app/blog/is-myfitnesspal-premium-worth-it-paywall-app-reviews-2026)).
- **How we go one better:**
  - One-tap recents, alongside our existing free barcode (`lookupBarcode` 35155) and photo logging.
  - **Tap counts asserted in tests,** so speed can't regress unnoticed. MacroFactor publishes its counts; we enforce ours.
- **Set logging is already 1 tap** (`renderSetChips` 30776), so no set-logging work is planned.

### 6. Program quality
- **Problem:**
  - Low day-count bodybuilding variants dose chest at 3 sets a week (H-3).
  - Bodybuilding claims twice-a-week frequency that it doesn't deliver (H-4, overview at 9789).
  - Strength & Size has arms, side delts and hamstrings below the minimum (H-6).
  - Some cue copy contradicts the evidence (L-1, audit §4).
- **Benchmark:** Boostcamp's program library and RP's 45+ premade plans ([GarageGymReviews](https://www.garagegymreviews.com/boostcamp-review), [rpstrength](https://rpstrength.com/rphypeapp)).
- **How we go one better:** every program is computed against fractional per-muscle dose [PEL] and cited in-app (`content-citations.js`, `PROGRAM_SOURCES`). Copy is fixed now (ready). Slot rewrites wait for the owner, because history is keyed by position (`exKey` 26990).
- **Later, not yet in the backlog:**
  - Powerlifting top single at RPE 8 with −10% back-offs, plus a meet-peak block;
  - Olympic % bands and a miss counter;
  - athletic jump/sprint metrics;
  - running, cycling and swimming progression (now itemised as BL-43, BL-46, BL-47 and BL-48; audit fold-in, 2026-11-08);
  - bodyweight progression ladders (H-8 second half);
  - a plateau playbook (research #6).

  Each will be planned after the first 15 items ship.

### 7. Recovery that understands lifting
- **Problem:** `computeReadiness` (46843) ignores imported HRV. Readiness only flags; it never changes the session.
- **Benchmark:** Athlytic is called "a better Whoop" on an Apple Watch people already own, but its targets "do not take into account muscle fatigue" ([appshunter](https://appshunter.io/ios/app/1543571755/reviews)). WHOOP's Strength Trainer gets UX complaints ([the5krunner](https://the5krunner.com/2026/02/28/new-whoop-strength-trainer-update/)).
- **How we go one better:** readiness that knows the actual sets, RPE, pain regions **and** HRV against a personal baseline. The baseline method is a 7-day rolling ln rMSSD vs baseline, after Plews et al. 2013, Sports Med 43:773 (doi 10.1007/s40279-013-0071-8; cited from memory, **unverified this session**). Its advice lands in the set chips, not as a separate score.

### 8. Portability and reliability
- **Problem:** history can leave only as JSON and arrive only from our own backup.
- **Benchmark:** Hevy reportedly imports Strong CSVs (second-hand, [setgraph](https://setgraph.app/ai-blog/hevy-vs-strong)).
- **How we go one better:**
  - A Strong-style CSV export, so leaving is easy too. That builds trust.
  - Import with a review step for unmatched exercise names.
  - PRs rebuilt through the existing `reconstructAllPRs` (41641).

---

## Release shape
- **Now (ready, BL-01 to BL-26):** safety, then correctness, then the first step of each bar-raiser. All are render-time or read-only, with no stored-data change.
- **Owner decisions (BL-27 to BL-40):** each is one version once approved. Each has a one-line question in `backlog.md`.
- **Process:** one item per build run, as a PR into `Branch-1`, following `planning/toolchain.md` §6. Nothing goes live without the owner's yes.

---

## Business priorities
Added by the business-manager, 2026-11-07, against v3.514. Reasoning and evidence are in `planning/business.md` §5–7; items are in `planning/backlog.md` → "Business (BIZ)". These are re-rank requests for the project-manager, not edits to the table above.

**North star:** weekly active trainers, meaning people who log at least 2 training sessions in a calendar week (business.md §4). Today the scores above weight "impact on the owner's daily use". For a public product, activation and data trust matter as much, because a stranger who never logs a first set, or loses a month of logs, never reaches any of the bar-raisers.

**Requested build order:**
1. **Safety stays first** (BL-01 to BL-06). It's also the prerequisite for any public listing (BIZ-15).
2. **First launch next, ahead of the bar-raisers (BL-16 onward):** BIZ-02 (one name, asked once), BIZ-01 (3-question quick start), BIZ-03 (placeholder calorie target labelled), BIZ-05 (first-set load hint). Each is small and render-time; BIZ-01 is the largest.
3. **Data trust:** BIZ-04 (first backup nudge after 3 sessions) and BL-22 (CSV export) move up. BIZ-10 (install hint) sits with them, because a Safari-tab user is the most at risk of losing data.
4. **Honesty and presentation, slotted between larger items:** BIZ-06 (AI entry points say they need a key), BIZ-07 (truthful metadata and README), then BIZ-17 (the first screen says what the app is; ship it after BIZ-07 so they match), and BIZ-09 (on-device first-month summary).
5. **Theme 8 (portability) should rank above its score.** For switchers from Strong and Hevy, import (BL-29) is the door in and export (BL-22) is the trust signal. Recommend the owner approves BL-29.
6. **Hold new verticals.** Lifting first, food second; nothing new beyond the backlog until weekly active trainers can be measured (business.md §5.7).

**Owner decisions, in priority order** (each has its question and a recommendation in the backlog):
1. BIZ-12: go public (Play first via the Capacitor build) and under what name. Unlocks BIZ-08 and BIZ-16.
2. BIZ-16: a plain-language privacy policy page.
3. BIZ-15: clinical acknowledgement and claims review before any listing.
4. BIZ-11: the free/paid line (the owner has chosen "free at launch, subscription later"; business.md §3).
5. BIZ-08: the app's address on share cards.
6. BIZ-13: off-device backup (own iCloud or Drive first).
7. BIZ-18, BIZ-20: the "What's free" note and the founding promise, published together at launch.
8. BIZ-21, BIZ-22: the switch-on triggers and the payment path.
9. BIZ-14: hosted AI (recommend not yet; it's the first subscription candidate).

**Revised money model (business-manager, 2026-11-07, after the owner chose "free at launch, subscription later").** Re-rank requests for the project-manager:
- **Nothing in the build sequence moves for money.** There's no billing or server code until BIZ-21's six triggers hold (business.md §3.5). This replaces summit R3's "90 days of retention data" rule; please note it in R3.
- **Add BIZ-19 (ready, small) to Phase 2 or 3,** after MKT-17 if possible so they share one corpus pass. It's the on-device "Training since" date that makes founding-member eligibility provable without accounts.
- **Phase 5 gains BIZ-18 once approved:** the "What's free" note ships with BIZ-16 and MKT-14, so the promise is public before any paid plan exists.
- **Guard the free list in every later item:** no quotas, locks or "Pro" labels on logging, programs, progression, history, charts, food, backups or BYO-key AI. BIZ-18 criterion 4 tests for it.
- **The Capacitor dependency:** store billing (BIZ-22, path A) needs the native build to support it. That effort is owned elsewhere; this is recorded only so nothing here waits on it by mistake.
