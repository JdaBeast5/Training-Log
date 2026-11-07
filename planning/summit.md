# Agent summit: cross-review and resolutions

Chaired by the project-manager on **2026-11-07**, against **v3.514**. All eight agents had finished their first pass.

**Baseline.** Taken before any planning edit: `bash check.sh` passed, with 0 `FAIL` lines across 198 `test-*.js` suites, and the working tree was clean.

**Inputs read:**
- the eight role files in `.claude/agents/`;
- `planning/` in full: research, program-audit, toolchain, automation, roadmap, backlog (BL, BIZ, MKT and UX), business, marketing and design-vision;
- `PRODUCT.md`;
- the five mock-ups in `tools/design/*.html` and all ten renders in `tools/design/renders/`;
- `HANDOFF-v59.md` Addendum 41.

**Outputs:**
- this file;
- a "Unified build sequence" at the top of `roadmap.md`;
- Status and "Summit note:" lines in `backlog.md`, with no item renumbered, deleted or rewritten;
- `planning/pitch.md`.

**Scope.** Owner context that frames every judgement below: on 2026-11-07 he pulled the 3D demos, saying "I think I've lost sight of the original mission of this app" (HANDOFF-v59 Add. 41). Any feature that can't show it serves "the best tracking app and the best workout plans" loses its place in the queue.

---

## 0. Facts the chair re-checked in the code

The critiques below rest on these facts, so each was checked rather than taken from a planning doc.

| # | Fact | Where | Who it affects |
|---|---|---|---|
| F1 | **There is no plate calculator.** Only its comment survives, plus `BARBELL_EXERCISES` and `isBarbellExercise`. No per-side maths exists anywhere. | `index.html:31752–31769` | research.md §5 ("Plate calculator ✔ ~31753") and §7 ("Has it") are **wrong**. design-vision §3.7 is right. |
| F2 | **Readiness has no numeric score.** `computeReadiness` returns flags and a level. | `46843` | `today-*.png` shows "Readiness 72", which has no source and no backlog item. |
| F3 | **The phase tag has only two values,** "Accumulation" and "Deload". | `mesocyclePhaseTag` `26741–26745` | `today-*.png` shows "Week 3 of 5 · Intensification", new copy with no item. |
| F4 | **`push` exercises flag the Shoulder region,** so a resting shoulder flags Bench Press today. | `CATEGORY_TO_REGIONS` `43895` | `today-*.png` puts a heavy bench on the cover beside "Shoulder still resting", with no caution and no substitute. |
| F5 | **The default recommendations aren't lifting-first.** Goal `gain` → bodybuilding (95); goal `lose` → jumprope (95). The first 30 lines of `scoreAllPrograms` adjust for body goal and age, not for days per week or location. | `33544–33545`, `33564–33594` | BIZ-01's quick start could send a 3-day "gain" stranger to the Bodybuilding 3-day variant, which the audit scores **F** on volume and frequency (H-3). A "lose" stranger could get Jump Rope. **Verify with a real invocation.** |
| F6 | **The mock-up's PR isn't a strength best.** Epley gives 155×8 → e1RM **196.3** and 160×5 → **186.7**. | node arithmetic | `pr-dark.png`'s "+5 lb on your best, 155 × 8" is a weight PR with a *lower* e1RM. `progress-dark.png`'s line would dip on the same day. |
| F7 | **One "Next time" line breaks the mock-up's own rule.** Bench is 4×4–6, so the top of the range is 6. `pr-dark.png` says "All 4 sets hit 5 at 2 reps left" → 165 lb. | `pr.html` head comment ("all sets at the top of the range → add") | The line contradicts BL-08 and the mock-up's own stated rule. `progress-dark.png` and `recap-dark.png` repeat "165 × 5". |
| F8 | **Week 3's prescribed effort is 8.5, not 8.** `RPE_BY_CYCLE_WEEK = {1:7.5, 2:8, 3:8.5, 4:9, 5:6}`, so week 3 means about 1.5 reps left. | `27409` | `today-*.png` says "RIR 2", and BL-10's strength-tier label says "2–3 RIR (last set 1–2)". That's three versions of one fact. |
| F9 | **Confetti exists** (`.confetti-piece`). | `1501` | design-vision §1 says "no confetti". Nothing in the backlog removes it. |
| F10 | **The streak fights the rest-day rule.** Daily milestones start at 7 (`STREAK_MILESTONES`), and `READINESS_DAYS_NO_REST = 6`. | `14008`, `46836` | Confirms MKT-01's diagnosis. |

---

## 1. Cross-review, one perspective at a time

### 1.1 The exercise auditor (`program-audit.md`)

**Do the mock-ups respect the safety findings?** Not yet. Four problems:
1. **The resting shoulder (F4).** `today-dark.png` puts Bench Press 160 lb ×5 on the cover as the heaviest bench the user has ever done, two lines above "Shoulder still resting".
   - The current app flags that row with `.ex-caution` and a substitute (SAF-3 extends this logic; it doesn't remove it).
   - The cover must carry the caution and the substitute. A resting region can't be overridden by the biggest number on the screen.
   - "Pressing stays at RIR 2" also implies that readiness changes the session. That's **BL-32, needs-owner**, drawn as if it already ships.
2. **A readiness score with no basis (F2).** "Readiness 72" is a composite with no validated basis. It breaks the product principle "show the reason" (PRODUCT.md #3). Drop the number and keep the flags in words.
3. **Clinical caps don't carry into the growth surfaces.**
   - MKT's rule that clinical programs never get a share button is stated only in the MKT preamble.
   - **UX-09** (PR flood and Share), **UX-11** (Share), **MKT-06** (Year in Lifting) and **MKT-07** (the PR gain card) don't restate it.
   - Worse, the PR *flood itself* on a `MEDICAL_STYLES` program invites load-chasing in a plan that's prescribed by tolerance [AHA23][PREG19]. Picture "Heaviest leg curl yet" on ACL rehab d4, the same day SAF-1 found sets going 3→5.
   - **Rule:** clinical programs keep PR detection in history, but get no flood, no trophy and no share.
4. **Technical lifts in the year recap.** MKT-06's "biggest e1RM gain" must exclude `oly`, `jump` and `throw`. Epley isn't valid for technical lifts (SAF-2).

**Do the mock-ups show correct progression logic?** Partly. Of the three "Next time" lines in `pr-dark.png`:
- **Overhead Press** "3 × 10 reached" → 105: **correct** under all-set double progression (BL-08).
- **Barbell Row** "Set 4 stopped at 7: same weight" (`today-*.png`: last 135 × 8, 8, 7, 7): **correct under BL-08, wrong under today's code.** `topSetOf` would say "add weight" (H-2). So the redesign is truthful only *after* BL-08 merges.
- **Bench** "All 4 sets hit 5 at 2 reps left" → 165: **wrong under any rule the app has** (F7). Under double progression it holds until all four sets reach 6. Under RPE mode the reason text is the wrong mechanism.

**More errors in the mock-ups:**
- **The PR claim (F6).** "Heaviest bench yet" is true as a *weight* PR. "+5 lb on your best" is not: 155×8 was the stronger set by e1RM. The finish screen must name the kind of record: "Heaviest weight yet: +5 lb over 155". "Best" is reserved for an e1RM record.
- **The effort label (F8).** There must be one source, BL-02's `rpeTargetFor` plus BL-10's `targetRirLabel`, read by the cover, the row and the first-set hint (BIZ-05).
- **The ledger (`progress-dark.png`).**
  - **The band.** "10–20 band" has a floor in the audit (≈10+ sets/week [ACSM26]) but no 20-set ceiling: Pelland shows diminishing returns, not a cap [PEL]. Show "10+".
  - **The counting.** The mock-up counts *direct* sets, but BL-20 counts *fractional* sets (primary 1, synergist 0.5), as the audit specifies.
  - **The colours.** Under-target numbers are drawn in `--warning` (`progress.html:46`), which contradicts design-vision §3.6 ("under target in grey").
  - **"Add 2 sets each."** This is an unapproved BL-31 prescription, and it breaks BL-31's own ±1 set per week rule. The real fix for Strength & Size's side delts at 3 sets is **BL-39** (append to the program), not a nag aimed at the user.
- **The phase name (F3).** "Intensification" may be the more accurate name for weeks 3–4 at RPE 8.5–9, but it's new copy. Fold it into the phase-tag wording question the roadmap already flagged: medical programs will still say "Accumulation" after BL-01.

**The growth features:**
- **MKT-01 (weekly streak) is endorsed.** It fixes F10. Its floor of `max(2, days − 1)` sessions matches ACSM's ≥2 sessions a week.
- **MKT-02** removes body weight from cards. Endorsed, and it should ship before any other card work.
- **The plate stack is correct.** 160 lb = bar + 57.5 lb a side = 45 + 10 + 2.5 (the `today.html` comment). The rest of 240 s matches `getDefaultRestSeconds` for the strength tier.

**Verdict.** The mock-ups are a safe basis for building once the five corrections in R1 below are made.

### 1.2 The business manager (`business.md`)

**Does the design move activation and retention, or just look good?**
- **Retention: yes.**
  - UX-09's "Next time" rows tell you why to come back.
  - UX-11's Monday recap and MKT-01's weekly streak both count the north-star unit: weekly active trainers, people with ≥2 sessions a week (business §4).
  - These are the strongest retention ideas in the plan.
- **Activation: there's a hole at the exact moment that counts.** Activation is the first set logged (business §4).
  - UX-06's cover numeral is "the ready set's weight". A first-ever exercise has no weight, so a stranger's first look at the redesigned Today is an empty hero.
  - BIZ-05's "first time" hint targets the set sheet, and UX-06 hides the fields behind "adjust".
  - **Fix:** one hint string with two render sites, plus an empty-state criterion on UX-06.
- **Acquisition: zero until the app is public.** Every share card (MKT-03 to MKT-08) has no acquisition value until a public address exists (BIZ-08, BIZ-12). Until then they're dogfood and launch assets, so they mustn't crowd out the engine.

**What a stranger's first week is still missing:**
1. **The cover's empty state** (above).
2. **The quick start's routing (F5).** BIZ-01 must not send our primary segment, the self-coached lifter (business §1), to the audit's worst-dosed variant or to a non-lifting program.
3. **Units.** The quick start never asks lb or kg. The unit lives in the profile form (`weightUnitSelect`, `6106`). UX-07's plate colours depend on it, so a kg lifter's first plate stack would be wrong.
4. **A reason to come back on day 2.** There's no server, so there's no push reminder. Proposal, not itemised: a serverless **"Add my training days to Calendar"** (`.ics` download). Unverified on iOS.
5. **A first-week recap.** UX-11 should define it: what was done against the plan, and what week 2 brings. There's no streak yet at that point, so it must not show "0 weeks".

**Mock-up items with no backlog item behind them:** "Readiness 72" and "Add 2 sets each". They look like product, but they aren't planned.

### 1.3 The marketing manager (`marketing.md`)

**Which roadmap items are worth sharing**, ranked:
1. **UX-07, the plate stack.** It's the screenshot nobody else has, and it replaces Strong's most-praised tool (research §4) with zero taps. Note F1: we don't even have that tool today.
2. **UX-11, the week strip.** The card is the screen ("what you share looks like what you saw", `recap.html` head comment).
3. **UX-09 plus MKT-07, the PR.** Only with an honest label for the kind of record (F6). A "best" a stranger can fact-check against our own chart is a brand risk.
4. **BL-17, "From your logs: about 2,600 cal/day".** MacroFactor's core idea, free, with the maths shown. It's a content post on its own.
5. **BL-20, the per-muscle ledger.** "Sets per muscle" is how evidence-based lifters already talk.
6. **MKT-01, "Rest days included".** A streak that disagrees with Duolingo is a story in itself.
7. **BL-22, export: "leave any time".**

BL-01's "this plan never auto-increases" is a great *in-app* trust line, but it's off-limits in public copy (a health claim, BIZ-15). BL-08 and BL-14 are content (weeks 2 and 6 of the calendar in marketing §4.5), not cards.

**Is "Chalklog" coherent with "Plate & Press"?** Yes, on one condition: Plate & Press is the *design system's* name and never appears in front of users.
- Both are the gym's own materials: the plates set the colour, and chalk sets the light ground ("chalk paper", design-vision §3.2) and the coach's whiteboard (the concept roll).
- In-session dark is spot ink on black, which is the plate world. At home in light mode it's chalk paper, which is the name.

**Gap.** The icon is a navy-to-maroon gradient (marketing §1), which the vision retires. No item redraws it, and MKT-03 draws the ring on cards. The icon decision goes with the name decision (owner decision D7 in R4).

**The Year in Lifting in 2026 is the owner's own year.** With one user and no public address, it's launch *content* (the December row of marketing §4.5), not growth. The growth version of it is December 2027.

### 1.4 The design engineer (`design-vision.md`)

**Will the BL and BIZ items be built twice?**

| Pair | Risk | Resolution |
|---|---|---|
| **MKT-04** (session share on the toast) vs **UX-09** (finish sheet replaces the toast) | The banner wiring gets thrown away | MKT-04 ships just before UX-09. Its stats live in a named pure builder that UX-09's Share calls. Only one line of wiring is lost. |
| **MKT-05** (block-complete celebration) vs **UX-11** (Monday recap sheet) | Two interruptions on the same Monday | MKT-05 waits for UX-11 and becomes the recap sheet's last-week variant. |
| **BIZ-06** (AI card sorts below Trends) vs **UX-10** ("AI insights moves below the evidence") | The same reorder is specified twice | BIZ-06 owns it. UX-10 relies on it. |
| **BL-20** (ledger in the old `vol-landmark` style) vs **UX-10** (ledger at the top of Progress) | The ledger is rendered twice | BL-20 is built once to the §3.6 spec (fractional figures, decimals, grey for under target, "10+"), and UX-10 *moves* it. |
| **BIZ-05** (set-sheet hint) vs **UX-06** (cover) | The hint vanishes from the place the eye goes | One string, two render sites. |
| **BIZ-03** (placeholder line under the calorie hero) vs **UX-13** (new Food summary) | The line is lost in the rebuild | UX-13 must keep it (Summit note). |
| **BIZ-02** (`#headerEyebrow` shows the name) vs **UX-06** (the cover replaces the header) | `test-first-launch.js` breaks | Keep the ID, or update the test deliberately with a dated note. |
| **BL-16** (trend line in `renderSparkline`) | Restyled later | Built to §3.6's line rules from the start. |
| **BIZ-01, BIZ-17** (picker markup) | Built in the glass look | Written against **UX-01** tokens with no new gradients, so UX-03's value flip restyles them for free. |
| **MKT-03** (story cards) | Built in the old gold-glow look, then redone | Drawn in the Plate & Press world from day one: the cards are the redesign's first public surface. |
| **MKT-01** (streak badge "8 wk") vs the vision's "no badges" | — | The number lives in the recap strip. The badge is plain text, with no confetti (F9). |

**The single move that prevents rebuilding.** Pull **UX-01** (tokens as aliases, *zero* visual change) to the front of Phase 1. Every later markup change, whether BL, BIZ or MKT, is then written in the new vocabulary, and UX-03 flips the values.

**A gap in my own plan.** UX-14 (the unfolded two-pane Today) sat at step 14. The owner uses a Duo daily, so after UX-06 the unfolded Today would be half-redesigned for weeks. It moves up to follow UX-10 directly.

**Accepted.** The auditor's five corrections to the mock-ups (R1).

### 1.5 The market researcher (`research.md`)

**Are we beating Strong, Hevy, MacroFactor and RP on the things users rate highest?** Hevy and Strong are 4.9★ (about 94K and 108,477 ratings, research §1). They're praised for logging with no extra taps, the plate calculator, the rest timer and the watch app (research §4).

| What users rate | Today | After the plan | Honest verdict |
|---|---|---|---|
| One-tap set logging | Tie (✔ `renderSetChips`) | Tie, but **asserted in tests** (UX-06 criterion 1, BL-18 criterion 2) | We win only if we *publish* measured tap counts. Nobody has measured ours yet (toolchain §2 asked for Playwright counts). |
| Plate calculator | **Loss** (F1; my table was wrong) | **Win**: UX-07 needs zero taps | The biggest swing in the plan |
| Rest timer | Tie | Tie, plus the rest shown on the cover (UX-08) | — |
| Watch / lock screen | Loss | Loss | Belongs to the Capacitor track |
| Free tier | **Win**: no ads, no paywall | Win | Research §5, last row |
| Progression (Hevy Trainer Pro, Alpha Pro) | **Loss on correctness**: top set only (H-2) | Win after BL-08, BL-15 and BL-24 | Free *and* correct |
| MacroFactor's "no TDEE guesswork" | Loss | Partial: BL-17 is a read-only estimate; the loop needs BL-27 (owner) | **We don't beat MacroFactor on food in this plan.** We match its idea for free. Don't claim food speed until it's measured. |
| RP's per-muscle volume | Loss | Partial: BL-20 shows the dose; adjusting it needs BL-31 (owner) | Without BL-31 we're RP's ledger without RP's engine |
| Switching from Strong or Hevy | Loss | Export (BL-22); import needs BL-29 (owner) | Research opportunity #5 is still blocked on the owner |

**Corrections to my own work:**
- the plate calculator (F1);
- "Repeat yesterday" (already corrected in roadmap.md).

Two of the five biggest opportunities need the owner before they win: BL-27/BL-31 and BL-29.

### 1.6 The skills orchestrator (`toolchain.md`)

| Phase | Tools | Missing or blocking |
|---|---|---|
| 0 Safety | jsdom via `testHelpers.js`, sabotage check, `code-review` (no `--fix`) | — |
| 1 Engine truth | Same as Phase 0. **`paper-lookup`** to verify the three citations still marked unverified ([PEL]'s date conflict, Plews 2013 for BL-21, the Hacker's Diet for BL-16) *before* they're cited in the app | paper-lookup needs approval (D10) |
| 2 Redesign core | `impeccable` (polish, audit, typeset, layout), `taste-skill` app-screens, `apple-hig`, `review-animations` plus `animation-performance` (the `scaleX` rest drain and the `clip-path` flood), `dataviz` (UX-10, UX-11, BL-20), Playwright Chromium at 402×874 and 904×678 | **Playwright WebKit** (the redesign drops `backdrop-filter` and leans on Archivo's width axis, which are Safari-engine risks) and the **axe-core** devDependency: both need approval (D10) |
| 3 First week | A scripted Playwright first-launch walk. The business walk lived only in a scratchpad, so commit one under `tools/` as a reusable check. `apple-hig` for onboarding; `impeccable clarify` for copy | — |
| 4 Bar-raisers | `dataviz` (BL-16, BL-17, BL-21); `security-review` (BL-29 import) | — |
| 5 Launch | `taste-skill` for `about.html` (it is the landing-page skill); `security-review` (MKT-10 and MKT-11 fragment payloads; BIZ-16's host test); a **paper-lookup Crossref sweep** of the 84 DOIs in `content-citations.js` before BIZ-15's claims review. `app-store-screenshots` is recommended by marketing but **not vetted**; vet it before use | Vetting |

**Process gaps:**
- three agents still have no `Skill` tool;
- the `ship-increment` skill isn't approved;
- several UX criteria are Playwright-only, and `check.sh` can't run them:
  - UX-01 #3 and UX-15 #2 (pixel identity);
  - UX-02 #3 (offline font).

  They're PR evidence, not regression tests, and the PR body must say so.

### 1.7 The build automator (`automation.md`)

**Is every item truly one version?** Not quite.
- **UX-06 is two changes.**
  - (a) The cover: numeral, Log button, chips, and fields behind "adjust".
  - (b) The seven-disc day picker collapsing into the headline sheet.

  It touches four guarded suites. **Split it.**
- **UX-09 is two changes.**
  - (a) The finish sheet: totals, "Next time", Share and Done.
  - (b) The PR flood, with the `clip-path` motion and the clinical exclusion.

  **Split it.**
- **MKT-06 splits into 06a and 06b,** as its own Risk line anticipates. Only 06a is on the 30 November path.
- **BL-05 and BL-06 merge into one version.** Same file, same new test (`test-safety-cues.js`), both cue text. That saves a build on the Year in Lifting path.

**Is every item testable?**
- **UX-14:** jsdom has no layout, so a CSS container query can't be tested there. Drive the two panes from a `matchMedia` listener that sets a class, and test the class.
- **UX-15:** a jsdom selector sweep can't see `:hover`, `:focus-visible` or the rest state unless each state is rendered. The PR must list every state rendered, as the item says.
- **MKT-01:** a `SCHEMA_VERSION` migration just to reset one celebration counter is out of proportion. **Preferred:** a new namespaced key (`week-streak-last-celebrated`) through `window.storage`, named in the item, with the old key left alone.

**Which items touch the same code** (the build order inside each cluster is fixed):

| Cluster | Code | Order |
|---|---|---|
| A. Progression | `analyzeProgressionSignal` 27477, `computeSuggestedSet` 27812, `buildProgressBadge` 27742 | BL-02 → BL-08 → BL-15 → BL-24 → BL-26 → BL-11 → (BL-34, BL-32 if approved). UX-06, UX-09 and UX-10 *display* it, so they come after. |
| B. Volume modifiers | `applyGoalVolume` 26659, `applyAccumulation` 26747 | BL-01 → BL-07 → (BL-31) |
| C. Readiness | `computeReadiness` 46843, `getReadinessInsight` 14560 | BL-09 → BL-21 → (BL-32) |
| D. Share pipeline | `buildShareCardBlob` 29510, `shareCelebrationCard` 29609, `archiveCurrentWeek` 45414 | MKT-02 → MKT-03 → MKT-06a → MKT-06b → MKT-04 → UX-09 → UX-11 → MKT-07 → MKT-05 → BIZ-08 |
| E. Today / Up next | `#upNext` 5873, `renderUpNext` 30545, set sheet | BL-10 → BIZ-05 → UX-05 → UX-06a → UX-06b → UX-07 → UX-08 → UX-09a/b → UX-14 → (UX-17) |
| F. Today's Priorities | `renderTodayInsights` 14615 | BL-23, MKT-06a's row, BIZ-04 and BIZ-10 all add rows through the shared renderer, which UX-06 collapses but keeps |
| G. Analysis | `renderVolumeTrend` 45482, AI card | BIZ-06 → BL-20 → UX-10 → UX-14 |
| H. First launch | `userPickerOverlay` 5701, `createNewUser` 9629, `showUserPicker` 9637 | BIZ-02 → BIZ-01 → BIZ-07 → BIZ-17 → (BIZ-15's acknowledgement at `saveActiveProgram` 14888) |
| I. Food | 6313–6318, `addFoodToLog` 37413, calorie hero ~37820, `renderSparkline` 40795 | BIZ-03 → BL-18 → BL-19 → BL-16 → BL-17 → UX-13 → (BL-28, BL-27) |
| J. Streak | `computeStreak` 13989, `STREAK_MILESTONES` 14008 | MKT-01 → MKT-06b → UX-11 → (MKT-11) |

**Two blockers before the loop can follow any of this:**
1. **`planning/` must be merged into `Branch-1`.** Runs read their instructions from there (automation §1, Prerequisite).
2. **Automation §4 step 5 picks items in file order,** "the first `ready` item … in file order". File order isn't the unified sequence, so the step has to say "the first `ready` item in the roadmap's Unified build sequence". That's a one-line, planning-only change in the build-automator's own file; it's listed in the first two weeks.

**Pace.** There's one open auto-PR at a time (automation §1.3), so throughput equals the owner's merge rate. The sequence holds 60 ready builds. At one merge a day that's about two months, an assumption about pace, not a promise.

### 1.8 The project manager (`roadmap.md`, `backlog.md`)

**The mission test.** UX-06, UX-07, UX-08, UX-09, UX-10 and UX-11 pass it on their own terms: one tap kept, plate maths at zero taps, rest shown where the eye already is, "what changes next time and why". UX-03, UX-04, UX-12, UX-13 and UX-15 are mostly visual. That's fine because each is cheap and revertable, but they come *after* engine truth, not before.

**The inventory:** 89 items (40 BL, 17 BIZ, 15 MKT, 17 UX), of which 58 are ready and 31 are needs-owner. Nobody priced the owner's review bandwidth: 58 ready items at one PR at a time is the real constraint, so the sequence below is the plan.

**Features in pictures, not in the backlog:**
- the numeric readiness score;
- "Intensification";
- "Add 2 sets each";
- the header chat icon, which is UX-16 (needs-owner) but drawn on every mock-up.

A picture can't create a feature: each one is either itemised or removed from the mock-up (R1).

**Research overclaim:** the plate calculator (F1). The roadmap's correction table gets a row (done).

**Business routing:** BIZ-01 needs a guard (F5, R9).

---

## 2. Resolutions

One decision per tension. Each is reflected in `roadmap.md`'s Unified build sequence and in `backlog.md` Summit notes.

### R1. The redesign versus the safety and correctness fixes
**Decision: safety first, then engine truth, then the screens that display it. Nothing gets built twice.**
1. **Phase 0 (safety) has no exceptions.** BL-01 to BL-06 and BL-13 come before anything else. This is also the legal prerequisite for going public (business §5.6).
2. **Engine truth before the redesign.** BL-08, BL-10, BL-15 and BL-24 merge **before** UX-06, UX-09, UX-10 and UX-11, because those screens print the engine's output in 150 px type. UX-09's criterion 3 (rows equal `computeSuggestedSet`) would otherwise faithfully print H-2's error.
3. **UX-01 moves to the front of Phase 1.** It changes nothing visible, and it means every new piece of markup is written once in the new vocabulary.
4. **Merges (§1.4):**
   - MKT-04's stats builder is reused by UX-09;
   - MKT-05 becomes a variant of UX-11;
   - UX-10's AI clause belongs to BIZ-06;
   - BIZ-05's string is shared with UX-06;
   - BL-05 and BL-06 ship as one version.
5. **Five mock-up corrections before UX-06 starts** (design-engineer, planning-only):
   1. the Bench "Next time" line holds at 160 until all four sets reach 6 (F7);
   2. the PR is labelled "Heaviest weight yet: +5 lb over 155" (F6);
   3. the effort labels come from one source (F8);
   4. no "Readiness 72"; a resting shoulder shows the caution and substitute on the cover (F2, F4);
   5. the ledger: fractional, "10+", grey for under target, no "Add 2 sets each" (§1.1).
6. **Clinical exclusions** (no flood, no trophy, no share) are written into UX-09, UX-11, MKT-06 and MKT-07 (Summit notes).

### R2. Virality versus on-device privacy
**Decision: share outward, never upward.**
- Every card is drawn on the phone (`<canvas>`) and leaves only through the system share sheet that the person taps (MKT rules).
- MKT-02 ships before any other card work.
- No body data on any card by default. Clinical programs never share.
- Links carry their payload in the URL **fragment**, which browsers never send to a server (MKT-10, MKT-11).
- **No attribution:** MKT-15 is "no". The referral loop is only the address on the card (BIZ-08).
- Measurement uses store-console totals plus the on-device first-month row (BIZ-09) read out by testers. No analytics.
- The privacy claim stays exactly as precise as business §1: "your **logs** stay on your phone". Food search goes to USDA and Open Food Facts, and AI calls go to Anthropic with your own key.

### R3. The business model versus a single file with no server
**Decision: the PWA is free, forever, and complete. Money only ever pays for running costs, through store billing, later.**
- "Free core, no ads" (BIZ-11) covers logging, programs, progression, food logging and backups to the user's own cloud (BIZ-13 via the share sheet: no server).
- Anything that costs money to run lives *outside* `index.html`'s core and is sold only through the Capacitor store builds: hosted AI (BIZ-14, not yet) and encrypted sync.
- No billing code until the store build has 90 days of retention data (business §3).
- Bring-your-own-key AI stays, honestly labelled (BIZ-06).
- This keeps the single file, the zero build step, and the claim of no server and no account all true.

### R4. The name
**Decision (recommended to the owner, D7): "Chalklog" publicly, store title "Chalklog: Training Log". "Plate & Press" is internal only.**
- Before spending anything: buy `chalklog.app` and run a USPTO clearance in classes 9 and 41. The fallback is "Liftnext" (marketing §2.1).
- The rename ships as **one version in Phase 5**: manifest, `<title>`, home-screen label, card wordmark, What's New. Storage keys stay `trainingLog_*`.
- The icon redraw (flat ink, the ring mark kept) is decided at the same time. It's an asset, so it needs the owner.

### R5. The Year in Lifting deadline (30 November)
**Decision: a narrow lane, never ahead of safety.**
- **The lane is MKT-02 → MKT-03 → MKT-06a.** MKT-06a is the recap computation plus one summary card. The lane runs inside Phase 1, right after BL-08, UX-01 and BL-07.
- **It needs 12 merged builds from today:** 6 for Phase 0 and 6 in Phase 1. With 23 days to 30 November, that's about one merge every two days.
- **MKT-06b** (the remaining cards, including the longest weekly streak, which needs MKT-01) lands by mid-December. The display window runs from 1 December to 15 January (MKT-06), so a late 06b still shows.
- **If 06a slips past 30 November, nothing else moves.** It ships when it's ready. In 2026 it's the owner's own year and launch content; the growth version is December 2027.
- **Why the lane may sit ahead of the remaining engine fixes:** two of its pieces are trust fixes in themselves. MKT-02 stops body weight landing on public images, and MKT-01 resolves the contradiction between the streak and the rest-day rule.

### R6. The definition of a PR, everywhere
**Decision: one rule, the existing one in `reconstructAllPRs` (heaviest top set *or* best e1RM). The copy names which kind it is.**
- "Heaviest weight yet" for a weight record.
- "Strongest yet (estimated max)" for an e1RM record.
- "Your best" never describes a weight PR whose e1RM is lower.

This applies to UX-09, MKT-07, MKT-06 and UX-11's "New bests".

### R7. One effort vocabulary
**Decision:** BL-02's `rpeTargetFor` and BL-10's `targetRirLabel` are the only sources of effort words. The cover (UX-06), the row, the rest steppers ("Reps left", UX-08), the first-set hint (BIZ-05) and the badge all read them.

### R8. The per-muscle ledger
**Decision:**
- Fractional counting [PEL], with decimals shown.
- A floor of "10+" sets a week [ACSM26]; no ceiling is drawn.
- Grey under the floor, the day's ink inside it.
- "Add sets" advice appears only through BL-31 (owner) or as program appends (BL-39, owner).
- It stays in **Progress**, not on Today. The vision's own rule is one answer per screen (design-vision §9), so BL-30 is recommended "no".

### R9. Quick-start routing
**Decision:** BIZ-01 ships with its "where do you train" answer filtering to lifting programs for "gym", our primary segment (business §1). It never routes to a variant the audit scores F for that goal.
- Until BL-37 (owner) rebuilds the low day-count variants, a "gain" answer with ≤3 days must not land on Bodybuilding 3-day.
- The PR attaches the real `recommendProgram` output table (goal × days × location).
- If this can't be done with existing keys, the build stops and marks BIZ-01 needs-owner.

### R10. The redesign before the first-week fixes
**Decision:** the redesign core (Phase 2) comes before the stranger-facing first-week items (Phase 3).
- **Why:**
  - there are no strangers until Phase 5;
  - the owner trains every day on the screens Phase 2 rebuilds;
  - UX-01 means the Phase 3 markup is born in the new world, so nothing gets rebuilt.
- **Pulled forward because Phase 2 needs them:**
  - BIZ-05, the cover's empty state;
  - BIZ-06, so UX-10 can rely on the AI card already sorting below Trends.
- **Hard gate:** every Phase 3 item must be merged before any Phase 5 public step.

### R11. Dropped, deferred, merged and split

**Dropped from the mock-ups** (no item, no evidence):
- the numeric readiness score;
- "Add 2 sets each";
- the "10–20" ceiling;
- confetti in the new world. UX-09 replaces the toast; removing `.confetti-piece` falls to UX-15's sweep once nothing uses it.

**Deferred:**
- MKT-08 (side-by-side progress photos: body images, low mission value) → Phase 5;
- MKT-11 (challenges) → after BIZ-08;
- BL-30 → recommend "no";
- BIZ-14 (hosted AI) → not yet;
- a sync server → no;
- MKT-15 → no;
- program extensions (powerlifting peak, Olympic % bands, running and cycling progression, bodyweight ladders) → after Phase 2;
- the phase-tag wording ("Intensification", and "Accumulation" on medical programs) → one copy item, to be written by the PM after Phase 1.

**Merged:**
- BL-06 into BL-05 (one version);
- MKT-04 into UX-09 (shared builder; MKT-04 ships first);
- MKT-05 into UX-11 (as a variant);
- UX-10's AI clause into BIZ-06.

**Split:**
- UX-06 → 06a / 06b;
- UX-09 → 09a / 09b;
- MKT-06 → 06a / 06b.

**Still parked:** exercise demos (the owner, Add. 41), a social feed, generated workouts, watch and lock-screen logging (the Capacitor track), and anything in `android/`.

**Proposed, not itemised** (the PM itemises these after Phase 1):
- a unit question in the quick start, or a default unit from the locale;
- the `.ics` "training days" calendar export;
- a committed Playwright first-launch walk under `tools/`;
- a published tap-count test (log the ready set, add a recent food).
