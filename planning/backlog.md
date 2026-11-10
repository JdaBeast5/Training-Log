# Backlog

**Alignment round (2026-11-07, live v3.516).** Re-checked after the seven pre-D1 reviews; the reconciled position is `planning/alignment/consensus.md`. Changes in this file are marked "Alignment note (2026-11-07)". The app's display name is Liftnext (`APP_NAME`, v3.515). The **public name is open** (the owner decides; `planning/naming.md` is input), so items say "the app's name" and read `APP_NAME`, never a literal. New IDs this round:
- BL-05b, BL-50, the BL-41–49 placeholder;
- UX-01b;
- MKT-03b, MKT-20;
- BIZ-18a, BIZ-25, BIZ-26;
- TOOL-01, DOC-01.


**Audit fold-in (2026-11-08, against v3.518).** The exercise-auditor's 18 items from `planning/backlog-additions-2026-11-08.md` (PR #68) now live here, in the section "Added from the exercise-consistency audit": BL-43, BL-46 to BL-48, and BL-51 to BL-64. Their line numbers are re-grepped at v3.518, and their `Files:` lines name the suites to re-pin. BL-51 became `needs-owner`, because it adds a stored field. Their slots are in `roadmap.md`'s Unified build sequence.

**Spec refresh (2026-11-08, against v3.518, after PR #63).** The next 15 slots of the Unified build sequence after BL-01 (roadmap slots 2–16: BL-02, BL-03, BL-04, BL-05 with BL-06, BL-05b, BL-13, BL-35, BL-36, BL-08, UX-01, UX-01b, BL-07, MKT-02, MKT-09, UX-02) were re-grepped against `index.html` at **v3.518**. In those items, line numbers are v3.518's, each criterion is written to be checked by a real invocation (or, where `renderWorkout` can't be driven in jsdom, by a real-call count), and `Files:` names every existing test that needs re-pinning, found by reading the suites that extract the touched functions. Each changed item ends with a "Spec refresh (2026-11-08)" line. Owner decisions already given in `pitch.md` (D2, D4, D11–D13) are applied to statuses. The builder's PR #63 flags became BL-65 to BL-67 (and BL-02 criterion 9). Items further down still carry v3.514 numbers: re-grep them.

**Spec refresh (2026-11-08, against v3.524, after PR #83).** The project manager flagged BL-37 to BL-40 as too thin for the unattended builder. They are now written to the full format (Why, Change, real-invocation Acceptance criteria, Test plan, Files with re-pins and guards, Risk, Tools), with every line number re-grepped at **v3.524**, and their approved scope (D4) kept. BL-37 and BL-38 stay `ready (after BL-52)` in the Phase 3 gate. Their migration attributes entries only by BL-51's `n` stamp under BL-52's variant-scoped keys, and never moves an unstamped entry. Three things found in the refresh apply beyond these items:
- appending to a day moves the history of the custom, body-goal and bonus exercises after it, because `renderWorkout` keys them by render index (28778, 28857);
- a stored substitute selection applies to whatever exercise now sits at its index (`applyExerciseSubs`, 27085);
- new exercises in an overridden category need `EXERCISE_REGION_OVERRIDE`, or a resting region isn't flagged.

BL-39 and BL-40 each carry one non-blocking owner option; the default is the approved scope.

**Owner's answers on PR #86 (2026-11-08, "1 yes, 2b, 3b"), applied:**
- **New items:** BL-72 (stable history keys for custom, body-goal and bonus exercises, with a migration) and BL-73 (a stored substitute applies only if it's listed for that exercise), at roadmap slots 8a and 8b. BL-36 to BL-40 are now `ready (after BL-72)`.
- **BL-39 and BL-40:** each gains a relocation migration step (option (b)).
- **BL-40:** the wall squat runs on d2, d5 and d6 (option (b)).
- **Found while specifying BL-72:** built-in rows are keyed by render index too, so overrides that remove or reorder exercises, and trimmed warm-up units, shift history. That's BL-74, `needs-owner`.
- **BL-52's line reference** is fixed (7625 → 7632).

**Spec refresh 2 (2026-11-09, against v3.527, after PR #91).** The next stretch of the Unified build sequence after the safety block was re-grepped against `index.html` **v3.527** (`origin/Branch-1` 99b01bf): roadmap slots 8a–8c (BL-72, BL-73, BL-74) and 11–30 (UX-01, UX-01b, BL-07, BL-65, BL-66, BL-55, BL-63, MKT-02, UX-02, MKT-03, MKT-03b, MKT-06a, BL-54, BL-10, BL-15, BL-24, BL-58, BL-09, BL-23, BL-48, BL-14, BL-57, BL-26, BL-56, BL-11, MKT-01, MKT-06b, BL-12; MKT-09 is done). The baseline was green: `check.sh` passed and 204/204 `test-*.js` suites passed. In those items every line number is v3.527's, each criterion is a real invocation or a real-call count, and `Files:` names the suites that extract or stub what the item touches (found by grepping all 204 suites for each function and reading the matches). Each changed item ends with a "Spec refresh 2 (2026-11-09…)" line. Order and scope are unchanged, with these findings:
- **BL-24 is now `needs-owner`:** its criterion 2 (+5 lb on a 135 lb squat) can't hold with the 10 lb floor its Change keeps. One question, with a recommendation.
- **MKT-03** carries a non-blocking owner option: since v3.517 cards already print the confirmed name, which MKT-03 as written removes for one version.
- **Re-pins found that the old specs missed:** BL-72 (seven `wireSetsBlock` sandboxes and `test-open-screen-2-0.js` need `slotIdOf`), BL-66 (`test-mesocycle-phase-tag.js`'s own two-argument fixtures), BL-15 (`test-program-fit-trend.js`'s one-session decrease case), BL-54 (four suites need the canonical-name map in their chunks), MKT-01 (`test-header-refresh.js`'s streak text), MKT-03 (`test-app-rename.js`, twice), and BL-23 and MKT-06a (two suites that hand-stub every Priorities getter).
- **Spec gaps closed:** BL-72 missed the render-index read in `applyExerciseSubs`; BL-74 needs `?? i` for lists without `__srcIndex`; BL-55's name pattern needs the cardio gate (it matched Barbell Row); BL-09 now reads BL-02's `rpeTargetFor`; BL-11 can't use `buildPastSessions` (it drops weightless sets); BL-58's technique flag needs its own check (BL-02 has no flag); MKT-06's criteria are split between 06a and 06b.

**Spec refresh 3 (2026-11-09, against v3.528, `origin/Branch-1` 84539fa).** The redesign stretch of the Unified build sequence was re-grepped against `index.html` **v3.528**: roadmap slots 31–62 (BL-25, BL-60, BIZ-18a, MKT-20; the food lane BIZ-03, BL-18, BL-19, BL-16, BL-17; BL-43; Phase 2: BIZ-05, UX-03, UX-04, UX-05, UX-13, UX-12, UX-06a/06b, UX-07, UX-08, MKT-04, UX-09a/09b, MKT-16, MKT-17, MKT-18, BIZ-06, BL-59, BL-20, BL-33, BL-31, UX-10, UX-14, UX-11, UX-16; BL-46 and BL-47 are parked). The baseline was green: `check.sh` passed and 204/204 suites passed. Each changed item ends with a "Spec refresh 3" line. Line numbers are v3.528's; every build still re-greps, because slots 6a–30 land first. The design items were checked against `design-vision.md`, `design-directions.md` §5 and the corrected mock-ups (`tools/design/`, PR #67). No slot moved. Findings:
- **One item becomes `needs-owner`:** BL-43 (slot 38a). Its 400 m rule needs a time per rep, which the app never stores. Net **−1 ready**.
- **Items that rebuilt something the app already has, now narrowed to extend it** (CLAUDE.md, "Consolidate duplication"): UX-12 (History already has a month calendar with tap-to-jump), UX-14 (the v3.499 open-screen pane already is the two-pane Today), UX-10 (an e1RM sparkline already exists in the exercise sheet; one chart function now serves both), UX-11 (a Monday recap line already sits in Priorities; the sheet replaces it), UX-08 (the set sheet's weight step is reused), MKT-20 (v3.517 already renamed the files; what's left is the `appSlug()` consolidation and the wider guard).
- **Specs that contradicted another item or the code:** BL-60 criterion 3 vs BL-73; UX-06 criterion 4 vs (v) (the yellow night cover); UX-05's re-pointing of every `--plate-*` token (about 190 accent uses, and light-mode text contrast); UX-13 and BL-19 routing rows through `buildFoodResultRow(s)` (the review row, with no add or delete); UX-09's "volume" in the totals vs D15; BIZ-03's "never saved", which a weigh-in breaks; BL-16 and BL-17 fixtures an EMA can't meet; BL-59's Change missing three moves its Why names.
- **Things only `renderWorkout` knew, which jsdom can't drive** (BIZ-05, UX-05, MKT-04, UX-09a, BL-31): each now goes through a small helper the test drives, plus a one-site call count.
- **Re-pins found:** UX-03 (about ten suites pin glass, gradients and the aura), UX-04 (`test-header-refresh.js:98`, `test-nav-pill-visual-weight.js`, `test-tab-bar.js:37–43`), UX-16 (`test-coach-fab-drag.js` retires; seven more), BL-60 (`test-safety-cues.js`'s 321-exercise snapshot as well as `test-concise-cues.js`), BIZ-18a (an exact allowlist: 5 buttons carry the class `usda-key-upgrade-toggle`), UX-07 (names a removed-feature guard forbids).
- **Tooling:** WebKit isn't installed and the harness has no browser option; the harness also has no finish or recap state (UX-09a and UX-11 add them).

**Program extensions written (2026-11-09, against v3.528, `origin/Branch-1` cf8985b).** The exercise-auditor replaced the BL-41–45 placeholder with four full items, in the section "Program extensions" (before "Parked or later"): BL-41 (the Powerlifting top single and meet peak), BL-42 (Olympic % bands and a miss counter), BL-44 (bodyweight progression ladders) and BL-45 (athletic jump and sprint metrics). The baseline was green: `check.sh` passed and 204/204 suites passed. They sit at roadmap slots 88a–88d. Findings:
- **BL-44 is `ready (after Phase 3)`.** BL-41, BL-42 and BL-45 were `needs-owner`. **Owner, 2026-11-09 (PR #99): "pull the PR fix forward, 41a, 42a, 45a"**, so all four are now ready after Phase 3.
- **Found in the code:** a set logged with 0 reps counts as a made lift today (`topSetOf`, `saveExSet`'s PR check, `reconstructAllPRs`, `maxWeightEver`), so a missed lift at a new weight shows as a PR. That fix is now its own item, **BL-77** (`ready`, slot 9c), and it ships before BL-42.
- **Audit correction:** H-8's push-up ladder put the incline before the knee push-up. The measured loads (Ebben et al. 2011) put the knee push-up lower, and BL-44 follows them.
- **Dependency:** BL-41's top single needs BL-34 (slot 81). Without it, a single at RPE 8 is read as a 1-rep max and the suggested single ratchets down each week.

Owner: project-manager. Written 2026-11-07 against **v3.514**. The baseline was green: `check.sh` passed and 198/198 `test-*.js` suites passed. Line numbers are `index.html` at v3.514 unless a file is named. **Every build run re-greps them before editing:** each shipped item shifts the lines below it.

**Rules for every item** (CLAUDE.md, `planning/toolchain.md` §5–6):
- One item = one version. `APP_VERSION` (7618 at v3.518) and `sw.js` `VERSION` (195) are bumped together, plus a `WHATS_NEW` entry (7636, appended at the end of the object).
- One new or extended `test-*.js`, using the real functions extracted from `index.html` through `testHelpers.js`.
- A sabotage check: revert the change and watch the test fail.
- Count real invocations, not text matches.
- Run `check.sh` plus every suite before the change **and again after the version bump**.
- No drive-by fixes. Anything else you notice goes in the build log.

**Default `Tools:` for every item:**
- `code-review` (medium, no `--fix`);
- `verification-before-completion` (by hand, until it's approved);
- Playwright Chromium at 402×874 and 904×678 for anything visible.

Item lines add only extra tools.

**Order:** ready items first, in build order (BL-01 to BL-26), then `needs-owner` items in priority order (BL-27 to BL-40). A needs-owner item, once approved, slots in after whatever ready item is in flight.

**Summit note (summit 2026-11-07):** the build order is now the **Unified build sequence** at the top of `planning/roadmap.md` (revised in the alignment round), not file order. Items outside that sequence, such as TOOL-01 and DOC-01, are never picked by the loop. The reasons are in `planning/summit.md`. Items below carry "Summit note:" lines where the summit merged, split, re-ordered or constrained them. No item was renumbered, deleted or rewritten.

Audit keys ([ACSM26], [PEL], [ROB24], etc.) link to sources in `planning/program-audit.md` → "Source keys". Research links are in `planning/research.md`.

---

## Ready: safety (audit SAF-1 to SAF-6)

### BL-01: Program gate on goal volume and block accumulation (SAF-1)
- **Why:**
  - Running the real functions (audit SAF-1) with goal "gain" in cycle week 3 gives:
    - ACL rehab d4 Leg Curl 3→5 sets;
    - hypertension d2 2→4 sets;
    - prenatal d1 2→4 sets;
    - Athletic Depth Jump 4→5.
  - Clinical plans are prescribed by tolerance, not by a hypertrophy set target [AHA23][PREG19].
  - The three modifiers run with no program check in `renderWorkout`: `applyGoalVolume` at 28610; `applyAccumulation` and `applyAccumulationAccessory` at 28634–28635.
- **Change:**
  - Add a `VOLUME_MODIFIER_PROGRAMS = new Set(['strength','bodybuilding','powerbuilding','powerlifting'])` constant next to `COMPOUND_CATEGORIES` (26721).
  - Add a `program` argument to `applyGoalVolume` (26659) and `applyAccumulation` (26747). Gate inside each, so tests can call the real functions. `applyAccumulationAccessory` (26834) already takes `program`; gate it too.
  - Custom programs (`isCustomProgramKey`, 14735) **keep today's behaviour**.
  - **This changes 21 built-in programs, not only the clinical ones.** At v3.516 goal volume and accumulation also add sets on `oly`, `climbing`, `bodyweight`, `calisthenics`, `boxingsc`, `jumprope`, `hyrox`, `grappling`, `running` and `swimming` (build-automator, measured with the real functions). All of that stops. The allowlist is the audit's SAF-1 list; the owner confirms it before this item merges (consensus decision 6). If he adds a program, add it to the Set and to criterion 2.
  - The What's New entry says so plainly: "Goal-based extra sets now apply only to Strength & Size, Bodybuilding, Powerbuilding and Powerlifting. Other programs keep their written set counts."
  - In `applyGoalVolume`, exercises in the `jump` category are never changed.
  - `applyDeloadVolumeReduction` (26842) is untouched: deload still applies everywhere.
- **Acceptance criteria:**
  1. For every built-in program key **not** in `VOLUME_MODIFIER_PROGRAMS` (21 of the 25 `programs` keys: iterate `Object.keys(programs)`, don't hard-code), every style of every `*_STYLES` program (all `MEDICAL_STYLES` keys, 11352, plus the combat, cycling, watersports and yoga styles), **and every `PROGRAM_DAY_COUNT_VARIANTS` day (16196)** × goals {gain, leanbulk, performance} × weeks 1–4: the `sets` string after all three modifiers equals the authored string. The test asserts the program count it iterated (21) so that a new program can't slip past.
  2. `strength` d1 with goal gain, week 3 still gains sets exactly as it does today. Assert one known exercise's `sets` before and after.
  3. Athletic d4 Depth Jump stays `4×5` under goal gain.
  4. A custom program key gets the same output as today.
  5. `renderWorkout` passes `activeProgram` to all three call sites. Count 3 real call expressions carrying `activeProgram`, ignoring comments.
- **Test plan:** new `test-volume-modifier-gate.js`. Extract the real `applyGoalVolume`, `goalVolumeAdjustment`, `applyAccumulation`, `applyAccumulationAccessory`, `cycleWeekOf`, set-string helpers, `programs`, `MEDICAL_STYLES` and the other `*_STYLES`, plus `exerciseInfo` from `content-exercises.js`. Sabotage: remove the gate, and criterion 1 must fail.
- **Files:** `index.html` (26659, 26747, 26834, 28610, 28634–28635), `sw.js`, the new test.
- **Alignment note (2026-11-07):** spec gap fixed (build-automator B1, exercise-auditor N6). The old line "changes nothing outside the four built-ins" was wrong; see Change. Criterion 1 now covers every other built-in and its variants.
- **Risk:**
  - Sport and skill programs (Olympic, Climbing, Calisthenics, ...) stop gaining goal and accumulation sets. That's intended, but visible to anyone on them, so the What's New line names it.
  - Accumulation behaviour on the four lifting programs. Guarded by `test-accumulation-accessory-add.js` and `test-mesocycle-phase-tag.js`.
  - `applyGoalVolume` has no prior test; this item adds the first.
  - The phase tag will still read "Accumulation" on gated programs. Flag it; don't fix it here.
- **Build note (v3.518, PR #63):** `applyAccumulationAccessory` is gated by a tested invariant (every `ACCUMULATION_ACCESSORY_POOL` key is in `VOLUME_MODIFIER_PROGRAMS`) rather than an in-function check, which would have broken `test-accumulation-accessory-add.js`. The builder's other flags are BL-02 criterion 9, BL-65, BL-66 and BL-67. Line numbers above are v3.514's: `applyGoalVolume` is at 26673 and `VOLUME_MODIFIER_PROGRAMS` at 26750 in v3.518.
- **Status:** done (v3.518, PR #63)

### BL-02: RPE caps for clinical programs; RPE mode off for technique lifts (SAF-2)
- **Why:** `RPE_BY_CYCLE_WEEK` (27446) reaches RPE 9 in week 4 for any exercise with an e1RM.
  - The hypertension plan says to avoid near-maximal lifts [AHA23].
  - A 5×2 snatch at RPE 9 is about 91% of an Epley e1RM, which isn't valid for technical lifts [ACSM26][PRAC].
  - The target is read in three places, separately: `buildProgressBadge` (27783), `computeSuggestedSet` (27862) and `renderLoadModeNote` (32930), plus `targetRpeForWeek` (27448).
  - **Builder flag, PR #63 (folded in here):** after BL-01 the week ramp (7.5 → 9) still runs on the clinical and prenatal plans in RPE mode, although they no longer gain block sets. This item is the fix; criterion 9 covers every clinical style by iteration.
- **Change:**
  - One helper, `rpeTargetFor(week, inDeload, program, category)`, beside `targetRpeForWeek` (27448), used by all three sites (consolidation). It returns:
    - `null` for categories `oly`, `jump` and `throw`. The RPE path is then skipped, falling back to double progression, and the badge shows "Technique lift: stop each set with 2–3 clean reps left."
    - the deload value (`RPE_BY_CYCLE_WEEK[DELOAD_CYCLE_WEEKS]`, 6) when `inDeload`;
    - `min(weekTarget, 7)` (RIR ≥ 3) when `program === 'medical'` or `'senior'`. Prenatal and postpartum are `MEDICAL_STYLES` keys (11366), so they're covered;
    - otherwise `targetRpeForWeek(week)`.
  - `rpeCtx` (28803) gains `program: activeProgram` and `category: exCategory`, so `buildProgressBadge` and `computeSuggestedSet` can pass both.
  - `renderLoadModeNote` (32923) reads its target through `rpeTargetFor(week, false, activeProgram, null)`, so the Settings note never shows a week target the cap overrides.
  - **The clinical load gate (SAF-8, folded in by the alignment round; owner decision D12).** `analyzeProgressionSignal` (27514) gains a fourth argument, `program`, passed at **all three** call sites: `getSessionHeadsUpInsight` (14555), `computeProgramFitTrend` (27614) and `renderWorkout` (28804), so the heads-up, the fit check and the badge agree. For `medical` (every `MEDICAL_STYLES` key) and `senior`, signal 3 (27548–27561):
    - signals an increase only when logged RPE is ≤ 7 in **both** qualifying sessions;
    - uses the smallest loadable jump instead of `getLoadIncrement(category)`: for a barbell, `2 × smallest plate` (the step `snapToLoadable`, 32777, uses); for dumbbells, `getEquipment().dbIncrement`; for machines, cables and everything else `snapToLoadable` has no model for: **no number** (owner, 2026-11-08, option (a) on PR #65). The suggestion reads "try the smallest step your machine allows" and shows no target weight. `snapToLoadable` returns machine and cable weights unchanged, so the app has no step it could honestly show there. Compute it inside the clinical branch only, so the nine suites that extract `analyzeProgressionSignal` without a program never reach it;
    - with no RPE logged in either session, returns `{type:'increase', clinicalNoRpe:true, message:'If both sessions felt comfortable, try the smallest jump.'}`. `computeSuggestedSet` returns `null` for that signal (no number in the field).
- **Acceptance criteria** (all real invocations of the extracted functions; the sandbox defines `activeProgram`, `loadSuggestionMode`, `weightUnit` and the equipment state):
  1. `loadSuggestionMode='rpe'`, program `medical`, hypertension style, week 4, `rpeCtx={e1rm:200, week:4, program:'medical', category:'pull'}`: `buildProgressBadge(...).html` contains `RPE 7`, and `computeSuggestedSet(...).weight` equals `snapToLoadable(toDisplayWeight(loadForRpeTarget(200, reps, 7)), name, 'down')`.
  2. Program `oly`, Snatch (category `oly`), week 4, RPE mode: a counting stub of `loadForRpeTarget` records **0** calls across `buildProgressBadge` and `computeSuggestedSet`. `computeSuggestedSet` returns the double-progression result (`reason !== 'rpe'`), and the badge contains "Technique lift".
  3. Program `strength`, Back Squat (`squat`), week 4: `rpeTargetFor` returns 9 and the badge shows `RPE 9`.
  4. Deload week: `rpeTargetFor` returns 6 for strength, medical, senior and any category except the three technique ones (which stay `null`).
  5. `RPE_BY_CYCLE_WEEK[` is read only inside `rpeTargetFor` and `targetRpeForWeek`: count real read expressions in the extracted source with comments stripped (today: 4 reads, in `targetRpeForWeek`, `buildProgressBadge`, `computeSuggestedSet`, `renderLoadModeNote`).
  6. `renderLoadModeNote(4)` in jsdom (real `#loadModeSelect`/`#loadModeNote` markup, `loadSuggestionMode='rpe'`, `activeProgram='medical'`): the note reads "targets RPE 7". With `activeProgram='strength'`: "targets RPE 9".
  7. Hypertension Seated Cable Row `2×12` (`MEDICAL_STYLES.hypertension` d1; category `pull`, a cable), two past sessions `{weight:60, reps:12, avgRpe:8}`: `analyzeProgressionSignal(sessions, ex, 'pull', 'medical')` is not an increase. The same at `avgRpe:7`: an increase. On this cable the increase carries **no target weight**, and the badge or suggestion text contains "smallest step your machine allows" (owner answer (a), 2026-11-08). A barbell name passed with program `medical` (synthetic: no clinical or senior day has a barbell lift at v3.518; use `Back Squat`) increases by `2 × getEquipment().plates.at(-1)`.
  8. The same Seated Cable Row with `avgRpe:null` in both sessions: the signal has `clinicalNoRpe:true`, its message contains "felt comfortable" and no digit, and `computeSuggestedSet` returns `null`.
  9. *(Builder flag, PR #63.)* For every key of `MEDICAL_STYLES` (iterate; assert the count, 13 at v3.518) and for `senior`, weeks 1–4: `rpeTargetFor(week, false, program, 'push') <= 7`.
  10. Strength program Back Squat with the same two sessions at RPE 8.5 and `program='strength'`: still increases by `getLoadIncrement('squat')` (unchanged).
  11. The three `analyzeProgressionSignal(` call sites pass a fourth argument (count 3 real call expressions in the source with comments stripped).
- **Test plan:** new `test-rpe-safety-caps.js`. Extract the real `rpeTargetFor`, `targetRpeForWeek`, `cycleWeekOf`, `RPE_BY_CYCLE_WEEK`, `DELOAD_CYCLE_WEEKS`, `loadForRpeTarget`, `rirFromRpe`, `buildProgressBadge`, `computeSuggestedSet`, `analyzeProgressionSignal`, `getLoadIncrement`, `CATEGORY_LOAD_INCREMENT`, `snapToLoadable`, `getEquipment`, `BARBELL_STANDARDS`, `DUMBBELL_DEFAULTS`, `BARBELL_EXERCISES`, `isBarbellExercise`, `isDumbbellExercise`, `parseTopRep`, `parseBottomRep`, `renderLoadModeNote`, plus `MEDICAL_STYLES`. Sabotage: drop the cap, and criteria 1 and 9 must fail; drop the clinical load branch, and criterion 7 must fail.
- **Files:**
  - `index.html`: `RPE_BY_CYCLE_WEEK`/`targetRpeForWeek` 27446–27450 (new helper beside them); `analyzeProgressionSignal` 27514–27564; `buildProgressBadge` 27779–27832; `computeSuggestedSet` 27849–27936; `rpeCtx` 28803; call sites 14555, 27614, 28804; `renderLoadModeNote` 32923–32939.
  - `sw.js` (version), `test-rpe-safety-caps.js` (new).
  - **Re-pins (existing tests that extract `buildProgressBadge`):** `test-today-workout-emoji.js` (its RPE-badge case stubs `targetRpeForWeek`; add an `rpeTargetFor` stub returning 8) and `test-deload-signal-week-awareness.js` (its deload-week cases pass `inDeloadWeek:true`; add the real `rpeTargetFor`, `targetRpeForWeek` and `cycleWeekOf` to its chunks). Name both in the PR as re-pins, not drive-bys.
- **Alignment note (2026-11-07):** SAF-8 folded in (exercise-auditor B2; owner decision 7 confirms "smallest step after two sessions at RPE ≤ 7" rather than no load suggestions). The promise becomes "never adds sets; load rises only in the smallest steps when sets felt easy". BL-08 and BL-24 must keep criteria 7, 8 and 10 passing.
- **Risk:**
  - RPE badge rendering. Guarded by `test-progress-badge-rpe-teal.js`, `test-today-workout-emoji.js` and `test-deload-signal-week-awareness.js`.
  - The progression signal. Guarded by `test-program-fit-trend.js` (calls `analyzeProgressionSignal` with three arguments: it must keep passing unchanged) and the eight suites that stub it.
- **Spec refresh (2026-11-08):** line numbers re-grepped at v3.518; the third and fourth `analyzeProgressionSignal` call sites, the `renderLoadModeNote` criterion, the PR #63 ramp flag (criterion 9) and the two re-pins were added. Scope unchanged.
- **Status:** done (v3.519, PR #72)

### BL-68: Backups leave out saved API keys
- **Why:** "Export data" copies every stored key, including `ai-api-key` (the user's Anthropic key) and `usda-api-key`, into the JSON in plain text (export handler, `exportDataBtn`, about 34196 at v3.518). A backup that lands in a cloud folder, an email or a shared drive leaks a key billed to the user. This was found while drafting the privacy page (PR #66); the owner chose to exclude the keys on 2026-11-08.
- **Change:**
  - The export skips `ai-api-key` and `usda-api-key`, plus any future key whose name ends in `-api-key`.
  - The import leaves any keys already on the device untouched; a backup can't carry one in.
  - Settings' export row adds one line: "API keys aren't included; enter them again after restoring."
  - What's New says so.
- **Acceptance criteria:**
  1. A real export run over a fixture `window.storage` holding both keys plus normal data gives JSON with neither key name, and every other key still present (anchor: the count of exported keys equals stored keys minus 2).
  2. A real import of a backup that contains a key (an older export) doesn't overwrite a key already on the device, and doesn't add one either. State it plainly in the What's New entry.
  3. The privacy page draft (planning/launch-copy/privacy.md) no longer needs the "backup includes your keys" disclosure. Note it in the PR.
- **Test plan:** new `test-backup-excludes-keys.js` (real handler, stubbed storage and Blob); sabotage by removing the filter.
- **Files:** `index.html` (export and import handlers, the Settings hint), `sw.js` (`VERSION`), the new test, `test-import-backup-full-replace.js` (check and re-pin if the import change touches its fixture).
- **Risk:** someone restoring onto a new phone has to paste their keys again. That's intended.
- **Status:** done (v3.520, PR #74)

### BL-69: Clinical RPE-mode loads rise at most one smallest step per session (PR #72 follow-up)
- **Why:** on the clinical plans and Senior in RPE mode, `computeSuggestedSet` and `buildProgressBadge` suggest `loadForRpeTarget(e1rm, reps, 7)` from `recentBestE1RM`. One strong session lifts the e1RM, so the suggested load can jump by several plates, past the "smallest steps only" rule (D12) that progression mode now follows (v3.519). Flagged on PR #72; the owner chose option (c) on 2026-11-08.
- **Change:**
  - One helper, `smallestLoadStep(exName)`: `2 × smallest plate` for a barbell, `getEquipment().dbIncrement` for dumbbells, `null` for everything `snapToLoadable` has no model for. The clinical branch of `analyzeProgressionSignal` uses it in place of its inline step (consolidation; still called only inside that branch).
  - On `medical` and `senior` in RPE mode, the RPE-7 load is capped at last session's top-set weight plus `smallestLoadStep`. With no step (cables, machines), it's capped at last session's weight, and the badge adds "try the smallest step your machine allows" when the RPE-7 load is higher. Loads below the cap, the RPE 7 target and the deload are unchanged. With no prior weight, it behaves as today.
  - Other programs are unchanged.
- **Acceptance criteria:**
  1. Medical, RPE mode, Back Squat, last top set 135 lb, an e1RM whose RPE-7 load is about 175: the suggestion and the badge both show `135 + 2 × smallest plate`, not 175.
  2. The same with an RPE-7 load below 135: the RPE-7 load, snapped down as today.
  3. Seated Cable Row, last top set 60, RPE-7 load 75: the suggestion is 60, and the badge contains "smallest step your machine allows".
  4. A dumbbell lift (`DB Bench Press`) caps at last weight + `dbIncrement`.
  5. Strength and the other programs: uncapped (same numbers as v3.519).
  6. `smallestLoadStep(` has exactly 2 real call sites with comments stripped: the clinical branch and the cap.
- **Test plan:** extend `test-rpe-safety-caps.js`. Sabotage: remove the cap, and criteria 1 and 3 must fail.
- **Files:** `index.html` (`analyzeProgressionSignal` clinical branch, `buildProgressBadge`, `computeSuggestedSet`), `sw.js`, `test-rpe-safety-caps.js`.
- **Risk:** the RPE badge on clinical plans. Guarded by `test-rpe-safety-caps.js` and `test-progress-badge-rpe-teal.js`.
- **Status:** done (v3.521, PR #76)

### BL-03: Per-exercise body-region override for resting-region flags (SAF-3, part 1)
- **Why:** `CATEGORY_TO_REGIONS` (43931) misses several loads:
  - Neck Bridges (`core`) never flag Neck.
  - Hangboard (`pull`) never flags Hands/Fingers.
  - Calf Raise and Eccentric Heel Drop (`arms`) flag Elbow/Wrist instead of Ankle/Foot.
  - Leg Curl and Nordic Curl (`hinge`) never flag Knee.
- **Change:**
  - Add `EXERCISE_REGION_OVERRIDE` beside `CATEGORY_TO_REGIONS`, with exactly the audit's map (every name below is an `exerciseInfo` key in `content-exercises.js` at v3.518; the region labels are the Care labels, ~45961):
    - Neck Bridges → Neck, Upper Back.
    - Hangboard Max Hang, Hangboard Repeaters, Lock-off Hold → Hands/Fingers, Elbow/Wrist, Shoulder.
    - Calf Raise, Standing Calf Raise, Eccentric Heel Drop, Tibialis Raise → Ankle/Foot, Shins.
    - Leg Curl, Nordic Curl → Knee, Hip.
    - Wall Balls, Sled Push → Knee, Lower Back.
  - One helper, `regionsForExercise(name, category)`: the override when the name has one, else `CATEGORY_TO_REGIONS[category] || []`. It replaces both direct lookups: the session heads-up in `getSessionHeadsUpInsight` (14549) and the row caution in `renderWorkout` (29060).
  - Both sites already run after `applyExerciseSubs`, so a substituted exercise is looked up by its own name.
  - Categories are unchanged (M-8 is BL-40).
- **Acceptance criteria** (real invocations of the extracted helper with the real maps and the real `exerciseInfo`):
  1. `regionsForExercise('Hangboard Max Hang', exerciseInfo['Hangboard Max Hang'].category)` includes `Hands/Fingers`.
  2. Eccentric Heel Drop's regions include `Ankle/Foot` and do **not** include `Elbow/Wrist`.
  3. Leg Curl's regions include `Knee`; Neck Bridges' include `Neck`.
  4. Bench Press returns exactly `CATEGORY_TO_REGIONS.push` (unchanged), and an unknown category returns `[]`.
  5. Every key of `EXERCISE_REGION_OVERRIDE` is an `exerciseInfo` key (no typo can silently disable an override).
  6. There is exactly 1 real `CATEGORY_TO_REGIONS[` read in the source (inside the helper) and exactly 2 real `regionsForExercise(` call sites, one in `getSessionHeadsUpInsight` and one in `renderWorkout` (comments stripped, definition excluded).
- **Test plan:** new `test-region-override.js`. Sabotage: empty the override map, and criteria 1–3 must fail. *(`renderWorkout` is too entangled to drive whole in jsdom, as `test-today-workout-emoji.js` notes; criterion 6 pins the wiring.)*
- **Files:** `index.html` (43931–43939 plus the new map and helper; 14549; 29060), `sw.js`, `test-region-override.js` (new). No existing test reads `CATEGORY_TO_REGIONS` (checked at v3.518), so no re-pins are expected; the full suite run confirms it.
- **Risk:** `CATEGORY_TO_REGIONS` has no test today. Care flows are guarded by `test-care-2-0.js` and `test-resting-region-since-tracking.js`. More rows will show a caution for people with a resting region; that's the point, and the What's New line says so.
- **Spec refresh (2026-11-08):** line numbers re-grepped at v3.518; criteria moved from a rendered row (not drivable in jsdom) to the real helper plus a wiring count; criterion 5 added. Scope unchanged.
- **Status:** done (v3.522, PR #77)

### BL-70: Region fixes after BL-03: wider overrides, more twins, relief-aware cautions (SAF-3, part 1b)
- **Why:** follow-ups from PR #77, answered by the owner on 2026-11-08 on the exercise auditor's recommendation ("Q1 yes / Q2 c / Q3 yes / heel drop yes").
  - `EXERCISE_REGION_OVERRIDE` replaces the category regions instead of adding to them. So Sled Push and Wall Balls (category `cardio`) stopped warning for Ankle/Foot and Shins.
  - Sled Pull and other grip- or hang-limited moves are still filed as `core`, which flags only Lower Back.
  - Several Care relief moves warn on the very region they relieve. Tibialis Raise warns on Shins; Pelvic Tilt, Cat-Cow Mobility, Bird Dog and Child's Pose Breathing warn on Lower Back; Glute Bridge warns on Hip. The Achilles plan's Eccentric Heel Drop gets "consider skipping" when Ankle/Foot is resting.
- **Change:**
  - **Q1, override widened.** `'Sled Push': ['Knee','Hip','Ankle/Foot','Shins','Lower Back']`; `'Wall Balls': ['Knee','Hip','Lower Back','Shoulder','Elbow/Wrist','Ankle/Foot']` [PRAC].
  - **Q3, new overrides.**
    - `'Sled Pull': ['Knee','Hip','Ankle/Foot','Shins','Lower Back','Hands/Fingers','Elbow/Wrist']`.
    - `"Farmer's Carry"`, `'Farmers Carry (Heavy)'`, `'Suitcase Carry'`, `'Hanging Leg Raise'`, `'Toes-to-Bar'`: `['Hands/Fingers','Elbow/Wrist','Shoulder','Lower Back']`.
    - That makes 18 keys in total.
  - **Q2 (c), relief-aware wording.**
    - One helper, `isReliefForAllHits(name, hitRegions)`: true when every hit region `r` has `REGION_RELIEF[r]` including `name`.
    - When it's true, the row caution reads: "You marked <regions> as resting. This is also one of its gentle relief moves: keep it light and pain-free (mild discomfort at most, about 3/10, settled by next morning), and stop if it hurts." There's no swap and no "consider skipping".
    - Otherwise today's wording applies.
    - The session heads-up doesn't count relief-matched rows as flagged.
    - Region arrays are unchanged; Tibialis Raise keeps `['Ankle/Foot','Shins']` ([ACH15]; Silbernagel 2007 pain-monitoring model).
  - **Heel drop, data.** Add `'Eccentric Heel Drop'` to `REGION_RELIEF['Ankle/Foot']`.
  - No stored data and no migration.
- **Acceptance criteria** (real `regionsForExercise`, `isReliefForAllHits`, maps and `exerciseInfo`):
  1. Sled Push's regions include Ankle/Foot and Shins; Wall Balls' include Shoulder, Elbow/Wrist and Ankle/Foot.
  2. Sled Pull and the 5 carries and hangs include Hands/Fingers; every override key is an `exerciseInfo` key; the override has 18 keys.
  3. `isReliefForAllHits('Tibialis Raise', ['Shins'])` is true; `('Tibialis Raise', ['Shins','Ankle/Foot'])` is false (Ankle/Foot's list doesn't include it); `('Bird Dog', ['Lower Back'])` is true; `('Back Squat', ['Knee'])` is false.
  4. `isReliefForAllHits('Eccentric Heel Drop', ['Ankle/Foot'])` is true.
  5. Wiring: the row caution and the heads-up each call `isReliefForAllHits(` once (2 real calls, comments stripped), and the relief text is in the caution branch.
  6. `test-region-override.js` criterion 5 (keys and regions valid) still passes with 18 keys.
- **Test plan:** extend `test-region-override.js`. Live check: Playwright on a day with Bird Dog or Tibialis Raise and the matching region resting shows the relief wording and no swap. Sabotage: restore the old Sled Push array and criterion 1 fails; make `isReliefForAllHits` return false and criteria 3–4 fail.
- **Files:** `index.html` (`EXERCISE_REGION_OVERRIDE`, `REGION_RELIEF`, the new helper, the row caution in `renderWorkout`, `getSessionHeadsUpInsight`), `sw.js`, `test-region-override.js`.
- **Risk:**
  - **More cautions:** carries and hanging raises appear in about 100 program slots and will now warn on grip, elbow and shoulder. The What's New line says so.
  - **Fewer swaps:** overridden exercises show no category swap (v3.522 guard). That removes the current Bird Dog suggestion on carries and hangs and "Walking" on Sled Pull, until BL-04 adds theirs.
- **Status:** done (v3.523, PR #79)

### BL-04: Exercise-specific substitutes for the overridden exercises (SAF-3, part 2)
- **Why:** `suggestSubstitute` (43965) picks by category from `SUBSTITUTION_MAP` (43948). That means a resting Achilles gets "Wrist Flexor Stretch" for a heel drop (the `arms` alts), and a hangboard gets "Chest-Supported Row".
- **Change:** an `EXERCISE_SUBSTITUTE_OVERRIDE` beside `SUBSTITUTION_MAP`, consulted first in `suggestSubstitute(category, currentExName)` (the signature already takes the name; both callers, the row caution at 29064 and the AI "Tailor" prompt at 29345, already pass `ex.name`):
  - Eccentric Heel Drop, Calf Raise, Standing Calf Raise → "Isometric Calf Hold (wall-supported)", why: "keeps the tendon loaded without movement";
  - Hangboard Max Hang, Hangboard Repeaters, Lock-off Hold → "Feet-on Hang (open hand)";
  - Neck Bridges → "Neck Isometric (hand resistance)".
- **Acceptance criteria** (real `suggestSubstitute` with the real maps):
  1. `suggestSubstitute('arms','Eccentric Heel Drop').name === 'Isometric Calf Hold (wall-supported)'`, and its `why` is the override's.
  2. `suggestSubstitute('pull','Hangboard Repeaters').name === 'Feet-on Hang (open hand)'`; `suggestSubstitute('core','Neck Bridges').name === 'Neck Isometric (hand resistance)'`.
  3. `suggestSubstitute('arms','DB Curl')` deep-equals today's result (`{name:'Wrist Flexor Stretch', why:'lighter loading for a sensitive elbow or wrist'}`).
  4. Every override key is an `exerciseInfo` key.
  5. Both `suggestSubstitute(` call sites pass `ex.name` as the second argument (count 2 real calls, comments stripped).
- **Test plan:** extend `test-region-override.js` (created by BL-03; same feature). *Spec refresh: the old plan named `test-exercise-substitution.js`, but that file covers `EXERCISE_SUBS` swap keys, a different system, and nothing tests `suggestSubstitute` today.* Sabotage: remove the override lookup, and criteria 1–2 must fail.
- **Files:** `index.html` (43948–43970), `sw.js`, `test-region-override.js`. `test-superset-field-chaining.js` stubs `suggestSubstitute` and needs no change.
- **Risk:** existing category suggestions (criterion 3 pins them). The AI tailor prompt (29345) now names the specific substitute; its payload shape is unchanged.
- **Spec refresh (2026-11-08):** line numbers re-grepped at v3.518; test file corrected; criteria 2, 4, 5 added; the calf raises were named explicitly (the old text said "heel drop and calf raises"). Scope unchanged.
- **Owner addition (2026-11-08, with BL-70's Q3):**
  - Two more substitute overrides: `"Farmer's Carry"`, `'Farmers Carry (Heavy)'` and `'Suitcase Carry'` → "Goblet March (light, close grip)"; `'Hanging Leg Raise'` and `'Toes-to-Bar'` → "Lying Leg Raise (floor)". Sled Push, Sled Pull and Wall Balls get none, since they load too many regions for one swap.
  - Since v3.522 (BL-03), both call sites set `sub = null` for any name in `EXERCISE_REGION_OVERRIDE`. Replace that guard with "the exercise's own substitute if it has one, else none". Never use the category swap for an overridden exercise.
  - Relief-matched rows (BL-70) still show no swap.
  - Add criterion 6: with Hangboard Repeaters' region resting, the real caution path offers "Feet-on Hang (open hand)". With Sled Push's, it offers no swap.
- **Status:** done (v3.524, PR #81)

### BL-71: Carry swaps by resting area (BL-04 follow-up)
- **Why:** since v3.524, carries ("Farmer's Carry", 'Farmers Carry (Heavy)', 'Suitcase Carry') offer `SUB_GOBLET_MARCH` only when Shoulder is the resting area. A goblet hold still grips a load and loads the spine, so a resting grip, elbow or lower back gets no swap. The owner asked the exercise auditor on 2026-11-08.
- **Change (auditor's option a):**
  - `EXERCISE_SUBSTITUTE_OVERRIDE` values may be an **ordered list** of `SUB_*`. `suggestSubstitute` takes the first whose `for` covers every hit area; none fits → `null`. Single-SUB entries behave exactly as today.
  - `SUB_VEST_CARRY = {name:'Vest or Backpack Walk (hands free)', why:'keeps the braced walk under load with nothing in your hands', for:['Hands/Fingers','Elbow/Wrist','Shoulder']}`.
  - `SUB_BIRD_DOG = {name:'Bird Dog', why:"keeps the bracing with no load on your spine, and it's one of Care's own lower-back moves", for:['Lower Back']}`.
  - All three carries: `[SUB_VEST_CARRY, SUB_BIRD_DOG]`. `SUB_GOBLET_MARCH` is retired.
  - Swap names stay free of `&` and `<` (they're inserted as HTML in the caution).
- **Acceptance criteria** (real `suggestSubstitute` with the real maps):
  1. Farmer's Carry with Hands/Fingers, with Elbow/Wrist, and with Shoulder resting → "Vest or Backpack Walk (hands free)".
  2. Farmer's Carry with Lower Back → "Bird Dog".
  3. Hands/Fingers + Lower Back → `null` (Bird Dog loads the hands; a vest loads the spine).
  4. Every other override entry returns exactly what v3.524 returns (snapshot over the 18 exercises × each single resting area).
  5. Sabotage anchor: with the list path removed (only the first entry considered), criterion 2 fails.
- **Test plan:** extend `test-region-override.js`; replace its three Goblet March references (constants list, criterion 2, the area-fit case). Live check: Core d4 with each area resting.
- **Files:** `index.html` (`SUB_*`, `EXERCISE_SUBSTITUTE_OVERRIDE`, `suggestSubstitute`, `WHATS_NEW`, `APP_VERSION`), `sw.js`, `test-region-override.js`.
- **Risk:** the suitcase carry's anti-lean intent has no hands-free equivalent (accepted: swaps are temporary). A heavy vest loads the traps, so the name says light-ish and offers a backpack. [PRAC]
- **Status:** done (v3.525, PR #89)

### BL-72: Stable history keys for custom, body-goal and bonus exercises
- **Why:**
  - `renderWorkout` (28710) builds `[...day.exercises, ...focus, ...custom]` (28788–28789), and `applyAccumulationAccessory` (26905) appends the bonus exercise after them on peak weeks. Every row's history key is `exKey(program, dayId, <render index>)` (27064).
    - Reads: `getExLog`, 28870.
    - Fallback lookup: 28894.
    - Writes: `saveExSet` 28456 and the set-row handlers at 32039, 32072, 32087, 32126, 32171 and 32222.
    - The substitute picker (`openExerciseSubModal`, 27269): 27284, 27310–27312.
    - The stored substitute read: `applyExerciseSubs` (27095) reads `subSelectionKey(program, dayId, i)` at 27101 by render index too. It skips custom and focus rows (27097) but **not** the bonus exercise, so a bonus exercise's swap is positional as well.
  - So a custom, body-goal or bonus exercise's history key depends on how many exercises come before it. It moves, and its earlier sets stop showing on its row, whenever:
    - a built-in exercise is added to the day (BL-36 to BL-40 all do this);
    - the body goal changes, so the number of focus exercises changes;
    - a custom exercise is added or removed ahead of the bonus exercise.
  - The data isn't lost; it is no longer read by its own row. Worse, the slot it sits in may later belong to a new built-in exercise, which then reads it.
  - Owner, 2026-11-08: "1 yes": protect this history before any exercise is added to a day.
- **Change:**
  - **One resolver** beside `exKey` (27064): `slotIdOf(ex, i)`.
    - `ex.isCustom` → `'c-' + slugifyExerciseName(ex.name)` (27051).
    - `ex.isBodyGoalFocus` → `'f-' + slug`.
    - `ex.accumulatedAccessory` → `'a-' + slug`.
    - Otherwise `i`, unchanged.
    - The prefixes keep a custom "Cable Fly" and the bonus Cable Fly apart. `exKey` and `subSelectionKey` (27076) already template `idx` as a string, so they take the result unchanged, giving keys like `ex:strength:d1:c-dips` and `ex:strength:d1:a-cable-fly:sub:<slug>`.
  - **Every call site that passes a row's render index passes `slotIdOf(ex, i)` instead.** Classify each `exKey`, `getExLog`, `saveExSet` and `subSelectionKey` call by reading it (v3.527): 14590 (`getSessionHeadsUpInsight`), 27101 (`applyExerciseSubs`), 27284 and 27310–27312 (`openExerciseSubModal`), 27716 (`computeProgramFitTrend`), 28870, 28894, 31631 (`buildExerciseHistoryHtml`), 31909 (`refreshSessionSummary`), and in `wireSetsBlock` (32019) 32039, 32072, 32087, 32126, 32138, 32171, 32222, 32347, 32351.
    - 14590 and 27716 walk the authored `day.exercises` (built-in rows only), so `slotIdOf` returns `i` there; route them through it anyway so there is one rule.
    - Inside `saveExSet` and the record helpers (28380–28507), `idx` arrives already resolved, so they don't change.
    - The rows carry `data-ex-idx` (29158, 29192, 29271, 29308, 29316). Keep that as the render index for DOM lookup, and resolve the slot id from `renderExercises[exIdx]` at the call. `wireSetsBlock(row, exIdx, ex, …)` already has `ex`, so it calls `slotIdOf(ex, exIdx)`.
  - **Migration:** `SCHEMA_VERSION` (7632) 8 → **9**. A new `if(version < 9)` block after the v8 comment (9419–9424), before the final `if(version < SCHEMA_VERSION)` block (9426), in its own `try{}catch(e){}`, with a backup export prompted first (as BL-52).
    - **Days covered:** every day that can have trailing rows:
      - each stored `custom-ex:` key (`customExStorageKey`, 32562; it carries the style for combat, cycling, watersports and medical);
      - every day of a program in `FOCUS_ELIGIBLE_PROGRAMS` (32549);
      - every day in `ACCUMULATION_ACCESSORY_POOL` (26878).
    - **Day length `L`:** the number of authored exercises the day has **under the layout active at migration time**: the stored `'days-per-week-pref'` (26005) via `PROGRAM_DAY_COUNT_VARIANTS`, and the stored style for container programs. Use the current day length, so nothing is lost (owner).
    - **Trailing order:** `[...focus, ...custom, accessory]` at `L, L+1, …`, the order `renderWorkout` uses.
      - Focus: the real `getBodyGoalFocusExercises` (32580), with the profile read from `'user-profile'` in its own `try` (as 9326–9330).
      - Custom: that key's stored list.
      - Accessory: the pool entry, if any.
    - **Move:** for each trailing name `k` at position `L+k`:
      - move the log at the positional key to `slotIdOf`'s stable key;
      - move its `:sub:<slug>` siblings to the stable key with the same suffix;
      - move its `exercise-sub:` selection.
    - **Mechanics (idempotent, crash-safe):**
      - Read the source. If it's empty, skip.
      - Merge into the target, adding only entries whose date isn't already there, and sort by date. Write the target, **then** delete the source.
      - A re-run after a crash between the two writes merges nothing new and finishes the delete. A clean re-run finds no sources.
      - Positions below `L` (built-in rows) are never read or written.
    - **Not moved, by design:**
      - positional logs from a day count or style that isn't active at migration time (they can't be attributed; they stay, unread by these rows, as today);
      - weekly check-box state;
      - overrides (`ex-override:`, `exOverrideKey` 46908; already name-guarded by `applyExOverrides`, 46934).
  - **Not in scope (flagged):** `parseExKey` (41149) returns `null` for any index past the authored day, so custom and bonus logs never reached `readExCorpus` (41223), History or PRs. That's true today, before this item, and stays true here. A follow-up could teach `parseExKey` the `c-`, `f-` and `a-` ids.
  - `WHATS_NEW`: 'Your own exercises keep their history'. Bullets:
    - 'Custom exercises, goal-focus extras and bonus exercises now keep their logged sets even when a day's built-in exercises change.'
    - 'Existing sets are moved to the new storage once, on this update.'
- **Acceptance criteria:**
  1. **Real `slotIdOf`:** a custom 'Dips' → `'c-dips'`, a focus exercise → `'f-…'`, the bonus Cable Fly → `'a-cable-fly'`, and a built-in at render index 3 → `3`.
  2. **Real-call count** (`renderWorkout` can't be driven in jsdom): in the extracted `renderWorkout`, `wireSetsBlock`, `applyExerciseSubs`, `openExerciseSubModal`, `buildExerciseHistoryHtml`, `refreshSessionSummary`, `getSessionHeadsUpInsight` and `computeProgramFitTrend` sources, with line comments stripped, every `exKey(`, `getExLog(`, `saveExSet(` and `subSelectionKey(` call takes its index from `slotIdOf(` (or a variable assigned from it in the same function). Assert the exact call count per function, so a new unresolved call fails.
  2b. **Swap read:** the real `applyExerciseSubs` over `[...6 built-ins, bonus Cable Fly]` with a stored selection at `exercise-sub:strength:d1:a-cable-fly` applies it; one stored only at `…:d1:6` does not.
  3. **Reads:** the real `getExLog` for a custom 'Dips' row on strength d1 reads `ex:strength:d1:c-dips`.
  4. **Migration** (real `runMigrations` over a fixture store; strength, pref unset, d1 `L = 6`, profile body goal giving one focus exercise, custom `[Dips]`):
     - (a) logs at `d1:6`, `d1:7` and `d1:8` move to the `f-`, `c-dips` and `a-cable-fly` keys, and a `d1:8:sub:<slug>` log and its selection move with them;
     - (b) `d1:0`–`d1:5` are byte-identical;
     - (c) a second run is a no-op;
     - (d) crash simulation (target written, source still present): the run merges without duplicates and deletes the source;
     - (e) with `'days-per-week-pref'` = 3, `L` comes from the 3-day variant;
     - (f) a `custom-ex:medical:hypertension:d5` list uses that style's d5 length.
  5. **The point of it:** after migration, with a 7th built-in exercise added to the fixture's strength d1, the real `getExLog` for the Dips row still returns its moved history.
- **Test plan:** new `test-stable-trailing-keys.js`, with the migration run as `test-custom-exercise-style-scoping.js` does (its sandbox at lines 95–115 stubs `SCHEMA_VERSION: 7`; the new test stubs 9).
  - Sabotage 1: make `slotIdOf` return `i` for custom rows → criteria 3 and 5 fail.
  - Sabotage 2: delete the source before writing the target → 4(d) loses entries.
- **Files:**
  - `index.html`: 7632, 9121–9435, 14565–14596, 27051–27108, 27212, 27269–27315, 27700–27725, 28710–28910, 31630–31640, 31908–31915, 32019–32351, `APP_VERSION` (7625), `WHATS_NEW` (7643).
  - `sw.js`, the new test.
  - **Re-pin (these break when `wireSetsBlock` and `buildExerciseHistoryHtml` call `slotIdOf`, because their sandboxes stub the key functions and have no `slotIdOf`):**
    - the seven `wireSetsBlock` suites: `test-auto-check-sets.js` (171), `test-set-next-button.js` (61), `test-partial-set-reactions.js` (51), `test-fallback-entry-consolidation.js` (42), `test-backdating-rest-timer-suppression.js` (60), `test-superset-rest-timer-suppression.js` (50), `test-superset-shared-sets-block-wiring.js` (54). Each stubs `window.exKey` at the line shown; add `window.slotIdOf = (ex, i)=> i;` beside it. That keeps every existing expectation (built-in rows resolve to `i`).
    - `test-open-screen-2-0.js`: add `'slotIdOf'` and `'slugifyExerciseName'` to `HIST_FNS` (line 96), since it runs the real `buildExerciseHistoryHtml`.
    - Name every re-pin in the PR.
  - **Guards (run; re-pin only if one breaks):**
    - `test-exercise-substitution.js` and `test-watersports-program.js` (they call the key functions);
    - `test-superset-chips.js` (64–65) and `test-tap-target-hit-areas.js` (110) pin the `data-ex-idx` markup, which stays the render index;
    - `test-region-override.js` (85, 121: call counts inside `getSessionHeadsUpInsight` and `renderWorkout`);
    - `test-accumulation-accessory-add.js`, `test-custom-exercise-style-scoping.js` (its v7 migration sandbox stubs `SCHEMA_VERSION: 7`, so the v9 block runs there too; it must stay inside its own `try`), `test-import-backup-full-replace.js`, `test-backup-excludes-keys.js` (stubs `SCHEMA_VERSION = 8`), `test-cross-program-history.js`, `test-next-set-recommendation.js`, `test-set-chips.js`.
- **Risk:**
  - A stored-data migration on the history store.
  - If the body goal or the custom list changed after a set was logged, that set sits at a position the current order doesn't predict, and may move to a neighbour's stable key. Rare; it's the same position the app reads today.
  - Every later item that bumps `SCHEMA_VERSION` moves up one (expected: BL-52 10, BL-37 11, BL-38 12, BL-39 13, BL-40 14).
- **Tools:** `code-review` at high (history keys and migration).
- **Spec refresh 2 (2026-11-09, against v3.527):** every line re-grepped at v3.527. Added the missed render-index read in `applyExerciseSubs` (27101; criterion 2b), the four enclosing functions to criterion 2's count, and the re-pins found by reading the suites: the seven `wireSetsBlock` sandboxes and `test-open-screen-2-0.js` need a `slotIdOf` stub or extract. Scope unchanged.
- **Status:** ready (owner yes 2026-11-08: "1 yes"; this changes stored data, and the owner approved it explicitly). Roadmap slot 8a, before BL-36.

### BL-73: A stored substitute only applies if it's a listed substitute for that exercise
- **Why:** `applyExerciseSubs` (27095) applies any name stored at a slot's selection key (27101) whenever the slot's current exercise is in `EXERCISE_SUBS`. It never checks that the stored name is one of that exercise's alternatives. If a slot's exercise changes (BL-35's rename, BL-37 and BL-38's rebuilds, or any future edit), an old choice, such as 'DB Shoulder Press' picked for Overhead Press, silently replaces the new exercise. The picker (`openExerciseSubModal`, 27269–27315) only ever stores `EXERCISE_SUBS` alternatives, so a valid choice always passes the check. Owner, 2026-11-08: cover this ("1 yes").
- **Change:** at 27104 (the `if(subName && subName !== ex.name)` test), apply only when `(EXERCISE_SUBS[ex.name] || []).includes(subName)`. This is read-time only; nothing stored is deleted, so if the exercise ever returns, the old choice applies again.
- **Acceptance criteria** (real `applyExerciseSubs` with the real `EXERCISE_SUBS`):
  1. A stored 'Front Squat' at a slot whose exercise is 'Bench Press' is **not** applied (the name stays 'Bench Press', with no `__isSubbed`).
  2. A stored 'Incline DB Press' for 'Bench Press' **is** applied, exactly as at v3.524.
  3. The existing cases in `test-exercise-substitution.js` (custom and focus rows skipped; not-in-map skipped) are unchanged.
- **Test plan:** extend `test-exercise-substitution.js`. Sabotage: remove the `includes` check → criterion 1 fails.
- **Files:** `index.html` (27095–27108, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-exercise-substitution.js` (it already extracts `applyExerciseSubs`, `subSelectionKey` and `EXERCISE_SUBS`; at v3.527 `'Bench Press'` lists `['Incline DB Press', 'Push-up']`, 13768). Guards: `test-exercise-swap-tap-target.js`, `test-superset-field-chaining.js` (both stub `openExerciseSubModal`; unaffected).
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; BL-72 changes 27101's key to `slotIdOf`, so build this on top of BL-72's version of the function. Scope unchanged.
- **Risk:** if a later item edits `EXERCISE_SUBS` (BL-60), a previously chosen substitute that's no longer listed stops applying. The row shows the default exercise, and the substitute's history stays under its `:sub:` key. That's intended: the list was changed for a reason.
- **Status:** ready (owner yes 2026-11-08: "1 yes", problem 2). Roadmap slot 8b, right after BL-72.

### BL-74: History keys follow the authored position, not the rendered one (found while specifying BL-72)
- **Why:**
  - Built-in rows are keyed by **render** index too (28870).
  - The program builder's overrides can **remove** or **reorder** a day's exercises (`applyExOverrides`, 46934–46967). Session-length trimming can drop a whole warm-up or cool-down unit from anywhere in the day (`applySessionLengthLimit`, 26926; pass 2).
  - Either way, every later exercise reads and writes the next exercise's history. For example, removing exercise 1 makes exercise 2 log onto exercise 1's key.
  - `__srcIndex` (28789) already records each row's authored position. Only the exercise editor uses it (29539).
- **Change:** `slotIdOf` (BL-72) returns `ex.__srcIndex ?? i` for built-in rows instead of `i`. That's one line.
  - The `?? i` matters: `getSessionHeadsUpInsight` (14576) and `computeProgramFitTrend` (27709) copy the authored `day.exercises` without `__srcIndex`, and there the loop index already is the authored position. Without the fallback their keys become `…:undefined`.
  - Because BL-72 routes `applyExerciseSubs` (27101) and `openExerciseSubModal` (27310–27312) through `slotIdOf`, the stored swap follows the authored position too, so a row's swap and its history stay together.
  - **Flagged, not in scope:** the weekly check-box state (`completed[i]`, `data-idx`, 28777) stays render-indexed. It resets weekly, so the harm is at most one week's ticks after an override.
- **Why needs-owner:** anyone who has already removed or reordered an exercise, or trains with a shortened session, has sets stored under the shifted keys. Switching makes the right history show from now on, but past sets logged while shifted stay under the wrong exercise's key. A migration can't tell them apart before BL-51's name stamps exist.
- **Options:**
  - (a) Switch now; past shifted sets stay where they are (BL-51's name filter later hides them from suggestions).
  - (b) Switch after BL-51 has stamped names for a few weeks, and add a relocation step (BL-37's helper) for stamped entries.
  - The auditor recommends (a): the bug writes new wrong data every session until it's fixed.
- **Acceptance criteria** (real `slotIdOf`, `exKey`, `getExLog`, `applyExOverrides`, `applySessionLengthLimit`):
  1. With a real `applyExOverrides` removing strength d1's exercise 1, `slotIdOf` for the row now at render index 1 is `2`, and the real `getExLog` reads `ex:strength:d1:2`, not `…:d1:1`.
  2. With a reorder override (exercise 3 given `order: 0`), the row rendered first resolves to `3`.
  3. With a real `applySessionLengthLimit(…, 30)` that drops a leading warm-up unit, the main exercise keeps its authored key.
  4. A row with no `__srcIndex` (the `getSessionHeadsUpInsight` copy) resolves to `i`.
  5. BL-72's custom, focus and bonus prefixes still win over `__srcIndex`.
- **Test plan:** extend `test-stable-trailing-keys.js` (BL-72's). Sabotage: drop `__srcIndex` (return `i`), and criteria 1–3 fail; drop `?? i`, and criterion 4 fails.
- **Files:** `index.html` (`slotIdOf`, beside `exKey` 27064; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-stable-trailing-keys.js`. Guards: everything BL-72 names, with its re-pinned `slotIdOf = (ex, i)=> i` stubs (they don't exercise this line).
- **Risk:** the owner's past shifted sets stay under the shifted keys (option (a)). The What's New line says history now follows each exercise even after you remove or reorder one.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the `?? i` fallback, the swap-follows-history note, the check-box flag, and per-criterion real invocations added. Scope unchanged.
- **Status:** ready (after BL-72; owner chose **(a)** on 2026-11-08: switch now, past shifted sets stay where they are). Build as soon as BL-72 has merged.

### BL-75: No carry swap for a resting shoulder (BL-71 follow-up)
- **Why:** since v3.525, carries with only Shoulder resting suggest "Vest or Backpack Walk (hands free)", but a loaded vest or backpack presses on the shoulders and traps through its straps. Flagged on PR #89. The owner left it to the builder's recommendation on 2026-11-08 ("I'll let you recommend it and go"). The recommendation is no swap: the caution still shows, and nothing suggested loads the resting area. Bird Dog doesn't fit either, since it bears weight on the shoulders.
- **Change:** `SUB_VEST_CARRY.for` becomes `['Hands/Fingers','Elbow/Wrist']`. A carry with Shoulder among the resting areas it hits gets no swap. Everything else is unchanged.
- **Acceptance criteria** (real `suggestSubstitute`):
  1. All three carries with `['Shoulder']` → `null`; with `['Hands/Fingers','Shoulder']` → `null`.
  2. Hands/Fingers alone, Elbow/Wrist alone, or both → the vest walk. Lower Back → Bird Dog. Hands + Lower Back → `null` (as v3.525).
  3. Non-carry swaps match the frozen v3.524 snapshot (existing test).
- **Test plan:** update `test-region-override.js` (the shoulder expectations from BL-04's area-fit case and BL-71's criteria). Sabotage: put Shoulder back, and criterion 1 fails.
- **Files:** `index.html` (`SUB_VEST_CARRY`, `WHATS_NEW`, `APP_VERSION`), `sw.js`, `test-region-override.js`.
- **Risk:** carries with a resting shoulder now show a caution with no swap. That's intended.
- **Status:** done (v3.526, PR #90)

### BL-05: Depth Jump prerequisite and box height in the cue (SAF-5, part 1)
- **Why:** Depth Jump appears with no box height or landing prerequisite, in **20 slots** at v3.518 (counted by walking `programs`, every `*_STYLES` style and every `PROGRAM_DAY_COUNT_VARIANTS` day):
  - Athletic d4 (`index.html` 9994) and its 4-, 6- and 7-day variants;
  - skimboarding d6 (12618), wakeboarding d1 (12634), a sport whose own `basis` cites a 42% ACL-tear rate, and kite d2 (12701), plus their day-count variants.

  Day-level `note` renders only on rest days, so the audit's "first 4 weeks note" has no render path. The cue is the reliable place.
- **Change:** in `content-exercises.js:237` (`'Depth Jump'` cues), add:
  - "Box 30–45 cm (12–18 in), no higher.";
  - "Prerequisite: land a 30 cm drop 3×5 with knees over toes and no inward collapse first."
  - "First 4 weeks: do Drop Landing 3×5 instead." (Alignment round, exercise-auditor N5: the prerequisite belongs before the jumps, so it goes in the cue rather than an appended drill.)

  Set counts are unchanged.
- **Acceptance criteria:**
  1. The real `buildDetailsHtml({name:'Depth Jump'})` (`index.html` 28393; the cue renderer `test-exercise-demos-removed.js` already drives, with `getExerciseIcon` stubbed) renders `li` text containing "30–45 cm", "Prerequisite" and "Drop Landing".
  2. **Every occurrence** is covered: the test walks `programs`, every `*_STYLES` style and every `PROGRAM_DAY_COUNT_VARIANTS` day (the walker in `test-volume-modifier-gate.js` is the pattern), collects each Depth Jump slot, asserts the count it found is ≥ 20, and checks that each resolves to the updated `exerciseInfo` entry.
  3. Every Depth Jump `sets` string is unchanged (`4×5` on Athletic and its variants, `3×5` on the watersports days).
  4. Every new cue is ≤ 24 words (the `test-concise-cues.js` rule).
- **Test plan:** add `test-safety-cues.js`, shared with BL-06. **Update the pin in `test-concise-cues.js`** (`321 exercises, 964 cues` at v3.518, line 42–45) to 321 and 970 (+3 here, +3 from BL-06). That change is part of this item, not a drive-by, so name it in the PR. Sabotage: revert the cue.
- **Files:** `content-exercises.js` (237, plus 9, 346, 347 for BL-06), `sw.js` (**version bump only**: `content-exercises.js`'s own header says never to precache it; the versioned cache name refreshes it), `index.html` (`APP_VERSION` and `WHATS_NEW` only), `test-safety-cues.js` (new), `test-concise-cues.js` (pin only).
- **Risk:** cue-length rules. Guarded by `test-concise-cues.js` (no cue over 24 words, and its `MUST_KEEP` phrases).
- **Summit note (summit 2026-11-07):** Ship BL-05 and BL-06 as **one version**: same file, same new `test-safety-cues.js`, both safety cue text. Mark both done together.
- **Spec refresh (2026-11-08):** the slot count is exact (20, not "about 21"); the renderer is named (`buildDetailsHtml`); `index.html` added to `Files:` for the version bump; the cue-count pin's target computed. Scope unchanged.
- **Status:** done (v3.527, PR #91)

### BL-06: Release rule on partner submission and clinch drills (SAF-6)
- **Why:** these cues describe applying a choke or armbar with no release rule:
  - Rear Naked Choke Drill (`content-exercises.js:346`; 4 slots: grappling d5 and its 4-, 6- and 7-day variants);
  - Armbar from Guard Drill (347; the same 4 slots);
  - Clinch Knee Drills (9; 12 slots across Muay Thai and MMA and their variants), which don't say to use pads.
- **Change:** add one cue to each:
  - Rear Naked Choke Drill and Armbar from Guard Drill: "Drill at 30–50% pressure; your partner taps or says tap, you release instantly.";
  - Clinch Knee Drills: "Knees go into a pad your partner holds, at controlled speed."
- **Acceptance criteria:**
  1. Each of the three cue lists, rendered through the real `buildDetailsHtml`, contains its new line.
  2. The cue counts of every other exercise are unchanged (snapshot all `exerciseInfo` cue counts before; compare after, excluding the four entries BL-05 and BL-06 edit).
- **Test plan:** `test-safety-cues.js` (with BL-05). Sabotage: drop one cue, and criterion 1 must fail.
- **Files:** as BL-05 (one version).
- **Risk:** cue-length caps. Guarded by `test-concise-cues.js`.
- **Summit note (summit 2026-11-07):** Merged into BL-05's version (see BL-05).
- **Spec refresh (2026-11-08):** slot counts added (walked at v3.518). Scope unchanged.
- **Status:** done (v3.527, PR #91)

### BL-05b: The Neck Bridges cue says coach-only, otherwise isometrics (SAF-4, cue part)
- **Why:** Neck Bridges ("bridge onto the top of your head") are prescribed unsupervised at grappling d6 (`index.html` 11056) and in five grappling day-count variants (21282, 21320, 21363, 21413, 21464; the 2-, 3-, 4-, 6- and 7-day variants, at d3, d4, d5, d6, d6): **6 occurrences**. No trial supports either option for injury prevention [PRAC]. Replacing the slot (BL-35) needs a migration; the cue can change today with no slot or history change (exercise-auditor B1).
- **Change:** in `content-exercises.js:350` (`'Neck Bridges'`), add a new first cue: "Only with a coach; otherwise do 4-way neck isometrics, 15 s each way at 50% effort." **Keep the second cue as it is:** it carries the `MUST_KEEP` phrase "only as far as feels stable and pain-free" that `test-concise-cues.js` pins. No per-entry cue cap exists, so nothing else needs dropping. No slot, name, category or set change.
- **Acceptance criteria:**
  1. The real `buildDetailsHtml({name:'Neck Bridges'})` renders a cue list whose first `li` is the new line.
  2. The test walks `programs.grappling` and every grappling `PROGRAM_DAY_COUNT_VARIANTS` day, finds exactly **6** Neck Bridges slots, and checks that each resolves to that entry.
  3. Every Neck Bridges `sets` string (`3×8`) and every slot's index is unchanged.
- **Test plan:** extend `test-safety-cues.js` (created by BL-05). Update `test-concise-cues.js`'s cue-count pin from 970 to 971, and name it in the PR. Sabotage: revert the cue, and criterion 1 must fail.
- **Files:** `content-exercises.js` (350), `sw.js` (version bump only), `index.html` (`APP_VERSION` and `WHATS_NEW` only), `test-safety-cues.js`, `test-concise-cues.js` (pin only).
- **Risk:** cue-length caps and the `MUST_KEEP` phrase (`test-concise-cues.js`). BL-04's substitute for Neck Bridges stays as it is.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; the `MUST_KEEP` trap named; the pin target computed (assumes BL-05 merged first, as the sequence says). Scope unchanged.
- **Status:** done (v3.528, PR #92)

## Ready: correctness of what exists (audit High, then Medium)

### BL-07: The performance goal no longer cuts strength-tier work (H-1)
- **Why:** `applyGoalVolume` caps compounds at 3 sets for `performance`:
  - Powerlifting Squat 5×5 → 3×5;
  - Strength & Size Bench Press 4×4–6 → 3×4–6.

  Yet `PROGRAM_FIT_SCORES.performance` (33739) ranks powerlifting 70. The stand's 2–3 sets is a minimum, not a sport ceiling [ACSM26]; accumulated heavy volume drives strength [PEL].
- **Change:** in the `strength` branch of `applyGoalVolume` (26743–26750, inside 26710–26751), skip when `getRepRangeTier(ex.sets) === 'strength'` (27821) **or** the program is `powerlifting` or `powerbuilding`.
  - *Spec refresh (2026-11-08):* the old text also listed `oly`. Since BL-01 (v3.518), `applyGoalVolume` returns early for every program outside `VOLUME_MODIFIER_PROGRAMS`, `oly` included, so Olympic Snatch already keeps 5×2 and an `oly` clause would be dead code. Dropped; no behaviour change.
- **Acceptance criteria** (the real `applyGoalVolume` with the real program tables, as `test-volume-modifier-gate.js` runs it):
  1. Goal performance, powerlifting d1 (`index.html` 10507): Squat stays `5×5`. (At v3.518 it becomes `3×5`, so this criterion fails before the change.)
  2. Goal performance, Strength & Size d1: Bench Press `4×4-6` (strength tier) stays `4×4-6`; Barbell Row `4×6-8` (hypertrophy tier) still becomes `3×6-8`.
  3. Goal performance, every powerbuilding day: no exercise's set count falls.
  4. Goal gain is unchanged on all four lifting programs (snapshot every day before and after).
- **Test plan:** extend `test-volume-modifier-gate.js` (add `getRepRangeTier` to its chunks). Sabotage: remove the skip, and criteria 1–3 must fail.
- **Files:** `index.html` (26710–26751), `sw.js`, `test-volume-modifier-gate.js`. No other suite extracts `applyGoalVolume` (re-checked at v3.527). `test-lb-per-kg-consolidation.js` extracts `getRepRangeTier` but isn't affected.
- **Risk:** depends on BL-01 (done, v3.518). Strength & Size users on goal performance keep more sets on their heavy lifts; the What's New line says so.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped. Scope unchanged.
- **Status:** ready

### BL-08: Double progression requires every working set at the top of the range (H-2)
- **Why:**
  - `buildPastSessions` (`index.html` 27567) keeps only `topSetOf` (27187). A 4×4–6 with sets of 6, 5, 4, 4 therefore says "add 10 lb".
  - The app's own tip (33142) says "on all sets".
  - Coached double progression (GZCLP, Helms) needs all sets at the top of the range [PRAC]. Hevy Trainer does the same (research §3).
- **Change:**
  - `buildPastSessions` adds `minRepsAtTop`: the minimum reps across the sets logged at the top weight. Compute it inline (no new helper), so the seven suites that stub or extract `buildPastSessions` keep their sandboxes.
  - `analyzeProgressionSignal` (27514), signal 3 (27548–27561): increase when `minRepsAtTop >= topRep` at the same load, either:
    - in the most recent session alone with average RPE ≤ 8; or
    - in 2 consecutive sessions when RPE wasn't logged.

    The `pastSessions.length < 2` early return (27515) must let the one-session RPE path through. A session without `minRepsAtTop` (a hand-built fixture, or an entry with no weighted sets) never counts as "all sets at the top".
  - `computeSuggestedSet` branch 4 (27929–27933) and the matching `buildProgressBadge` branch ("Hit N reps last time … try adding weight today", 27819–27821) both require all sets at the top. They need the prior entry's sets as well as `priorTop`: pass `prior` (in scope at 28782) from the two `computeSuggestedSet` calls (28890, 28985) and the `buildProgressBadge` call (28813).
  - `recommendNextSet` (30777) is set-to-set and stays as it is.
  - **Inherits BL-02's clinical gate** (BL-02 ships first): for `medical` and `senior`, the all-set rule applies **and** RPE ≤ 7 in both sessions, with the smallest jump.
- **Acceptance criteria** (real `buildPastSessions`, `analyzeProgressionSignal`, `computeSuggestedSet` and `buildProgressBadge` with fixture logs):
  1. Pyramid case, prior session sets {6, 5, 4, 4} at 185 on `4×4-6`: `buildPastSessions` gives `minRepsAtTop: 4`; the signal isn't an increase; `computeSuggestedSet` returns `null` or the same weight; and the badge html doesn't contain "add" or "try adding".
  2. All sets {6, 6, 6, 6} at RPE 8, one past session: increase.
  3. Two sessions of {6, 6, 6, 6} with no RPE: increase.
  4. One session of {6, 6, 6, 6} with no RPE: no increase.
  5. *(Alignment round.)* Hypertension Seated Cable Row `2×12`, all sets at 12 at RPE 8 in two sessions, program `medical`: no increase. BL-02's criteria 7, 8 and 10 still pass.
- **Test plan:** new `test-all-set-double-progression.js`. Sabotage: revert to the top-set rule, and criterion 1 must fail. Re-run the nine suites that extract or stub `analyzeProgressionSignal` (under Risk).
- **Files:**
  - `index.html`: 27514–27564, 27567–27580, 27779–27832, 27849–27936, 28782–28813, 28890, 28985.
  - `sw.js`, `test-all-set-double-progression.js` (new).
  - **Re-pin:** `test-program-fit-trend.js` lines 36–46 ("increase: top-of-range hit for 2 sessions straight") builds sessions without `minRepsAtTop`, so it stops being an increase under the new rule. Add `minRepsAtTop` to its two fixtures (equal to `reps`) and name it in the PR. Its "fewer than 2 past sessions" case (one session, RPE 8, reps 10 on `3x8-10`, no `minRepsAtTop`) must stay `null`, which the "never counts" rule above guarantees.
- **Risk:** progression is the most-tested area. Guards:
  - `test-program-fit-trend.js`, `test-deload-signal-week-awareness.js`;
  - `test-auto-check-sets.js`, `test-set-next-button.js`, `test-partial-set-reactions.js`;
  - `test-fallback-entry-consolidation.js`;
  - `test-backdating-rest-timer-suppression.js`, `test-superset-rest-timer-suppression.js`, `test-superset-shared-sets-block-wiring.js` (these seven stub `analyzeProgressionSignal` and `buildPastSessions`, so they only fail if a call signature they stub is removed).

  The cross-program fallback (`priorSetForSlot`, 27836) must keep its single-basis behaviour.
- **Summit note (summit 2026-11-07):** UX-06, UX-09, UX-10 and UX-11 print this rule in large type, and the mock-ups already depict it (Barbell Row 8, 8, 7, 7 holds at 135). It must merge before any of them (summit R1).
- **Alignment note (2026-11-07):** inherits BL-02's clinical load gate (SAF-8); criterion 5.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; the one-session early return, the missing-field rule, the three call sites that need `prior`, and the `test-program-fit-trend.js` re-pin were added. Scope unchanged.
- **Status:** ready (after BL-02)

### BL-09: Readiness compares weekly RPE to the week's own target (H-7)
- **Why:** `READINESS_RPE_HIGH = 8.5` (47129), but RPE mode prescribes 8.5 in week 3 and 9 in week 4 (`RPE_BY_CYCLE_WEEK`, 27483). Doing exactly what's prescribed gets flagged as fatigue.
- **Change:**
  - `computeReadiness` (47137) takes `rpeTarget`. It flags when `weeklyRpe >= rpeTarget + 1.0` or `weeklyRpe >= 9.5`.
  - `getReadinessInsight` (14611; the `computeReadiness` call is at 14623) passes `rpeTargetFor(await getMesocycleWeek(), await isDeloadWeek(), activeProgram)` (27524).
  - *Spec refresh 2:* the old text said `targetRpeForWeek(…)`, "or 6 in a deload week". Since BL-02 (v3.519), `rpeTargetFor` is "the ONE place a target RPE is decided" (its comment, 27489): it already returns 6 in a deload week (manual deloads included, via `isDeloadWeek`, 14966) and caps the clinical plans and Senior at 7. Calling it keeps one effort vocabulary (summit R7). With no category argument it never returns `null`, so the technique-lift branch doesn't apply.
- **Acceptance criteria:**
  1. Real `computeReadiness`: week 4 (target 9) with weekly RPE 9.0: no `rpe` flag.
  2. Week 2 (target 8) with 9.2: flag.
  3. 9.6 in any week: flag.
  4. Without `rpeTarget`, falls back to today's 8.5 rule. The pure-function contract is kept.
  5. Real `getReadinessInsight` with stubbed data sources, `getMesocycleWeek` → 4, `isDeloadWeek` → false and `activeProgram = 'medical'`: a weekly RPE of 8.0 is flagged (target 7), and with `'strength'` it isn't.
- **Test plan:** new `test-readiness-rpe-target.js`, with the real `computeReadiness`, `getReadinessInsight`, `rpeTargetFor`, `targetRpeForWeek`, `cycleWeekOf`, `RPE_BY_CYCLE_WEEK` and `DELOAD_CYCLE_WEEKS`. (`test-today-priorities.js` mounts `getReadinessInsight` as a stub, so it can't host criterion 5.) Sabotage: revert the threshold, and criterion 1 fails.
- **Files:** `index.html` (47125–47175, 14611–14640), `sw.js`, `test-readiness-rpe-target.js` (new). Guards: `test-today-priorities.js` (48–49 pin `computeReadiness`'s sleep rule and `READINESS_SLEEP_LOW = 6`; keep both), `test-cycle-phase-nutrition-insight.js` (132) and `test-supplement-condition-cycle-nudge.js` (243) stub `getReadinessInsight`, so they're unaffected.
- **Risk:** Today priorities. Guarded by `test-today-priorities.js`.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the target now comes from BL-02's `rpeTargetFor`; criterion 5 and the test file decided. Scope unchanged: the flag still compares the week's RPE with the week's own target.
- **Status:** ready

### BL-10: A target RIR on every prescription (H-5)
- **Why:** in default mode "3×10–12" carries no effort target. Hypertrophy improves closer to failure while strength is flat across RIR [ROB24]; failure isn't required [REF23].
- **Change:** a pure function, `targetRirLabel(ex, program)`. It reuses `getRepRangeTier` (27821), `COMPOUND_CATEGORIES` (26777) and BL-02's program classes (`medical` and `senior`, as `rpeTargetFor` reads them, 27524):
  - strength tier: "2–3 RIR (last set 1–2)";
  - hypertrophy compound: "1–3 RIR";
  - isolation: "0–2 RIR";
  - `oly`, `jump`, `throw`, `punch`, `kick`: "Stop with 3+ in reserve; speed over grind";
  - medical or senior: "3–4 RIR";
  - no parseable reps: no label.

  It renders as a small label beside the sets string in the exercise row: the `.ex-sets` cell of `headerInnerHtml` in `renderWorkout` (29238). RPE mode keeps its own badge.
  - *Spec refresh 2:* `renderWorkout` can't be driven in jsdom, so the markup comes from one small pure helper beside `targetRirLabel`, `rirLabelHtml(ex, program)`, which returns `''` or the label span. `renderWorkout` calls it once, inside `.ex-sets`.
- **Acceptance criteria:**
  1. Real `targetRirLabel` returns the exact `short` and `words` per class: Back Squat `5×5` (strength tier), Barbell Row `4×6-8` (hypertrophy compound), Lateral Raise `3×12-15` (isolation), Power Clean `5×3` (oly), Box Jump (jump), Bench Press on `'medical'` and on `'senior'`.
  2. Cardio (`Easy Run 25-30 min`), timed (`Plank 3×45s`) and AMRAP rows return no label (`null` or empty `short`).
  3. Real `rirLabelHtml`, parsed with jsdom, gives one element whose text is `short` and whose `aria-label` is `words` (the accessible equivalent says "reps", not "RIR").
  4. Real-call count: the extracted `renderWorkout` (comments stripped) makes exactly 1 `rirLabelHtml(` call, inside the `.ex-sets` template.
- **Test plan:** new `test-rir-target-label.js`: the pure function, plus the real row markup in jsdom. Sabotage: return `''`.
- **Files:** `index.html` (helpers beside `getRepRangeTier` 27821; the `.ex-sets` cell at 29238), `sw.js`, `test-rir-target-label.js` (new). Guards: `test-workout-card-type-scale.js`, `test-label-floor.js`, `test-tap-target-hit-areas.js`; and the suites that pin `renderWorkout` source (`test-region-override.js`, `test-today-priorities.js`, `test-volume-modifier-gate.js`, `test-up-next.js`, `test-set-chips.js`), which must still pass.
- **Risk:** row layout at 402 px. Guarded by `test-workout-card-type-scale.js`, `test-label-floor.js` and `test-tap-target-hit-areas.js`.
- **Tools:** `impeccable clarify`, `apple-hig` (type floor).
- **Alignment note (2026-11-07, design-engineer):** "2–3 RIR (last set 1–2)" is jargon on a 150 px cover read from a metre away. `targetRirLabel` returns `{short, words}`: `short` is the label above, and `words` is plain English ("Stop 2–3 reps short; last set 1–2"; "Stop 3+ reps short; speed over grind"). The row shows `short` with `words` as its accessible name, and the cover (UX-06a) shows `words`. Add one criterion per class for `words`.
- **Summit note (summit 2026-11-07):** This is the **single effort vocabulary** (summit R7). The cover, the row, the rest steppers (UX-08), the first-set hint (BIZ-05) and the badge all read `targetRirLabel` / `rpeTargetFor`. Note that week 3 is RPE 8.5 (`RPE_BY_CYCLE_WEEK`, 27409), so RPE-mode wording follows `rpeTargetFor`, not a hard-coded "RIR 2".
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; criteria rewritten as real invocations of two pure helpers plus a real-call count, since the row itself can't be rendered in jsdom. The alignment note's `{short, words}` shape is folded into criteria 1 and 3. Scope unchanged.
- **Status:** ready

### BL-11: Rep and time progression for bodyweight and timed work (H-8, part 1)
- **Why:** `computeSuggestedSet` (27980) returns `null` when `weight == null` (27981). Bodyweight, Calisthenics, Core and Pilates therefore never progress. Progressive overload is the core recommendation [ACSM26].
- **Change:** a weightless branch, `suggestRepProgression(log, ex, program)` (*spec refresh 2:* takes the raw log, not `pastSessions`; see the note under Files). When every set reached the top of the range, or the hold time, in 2 consecutive sessions:
  - suggest +1 rep per set, or +5 s for holds;
  - above 15 reps or 60 s, suggest a harder variant in words ("Ready for a harder variation"), without swapping anything.

  It is excluded for `medical` and `senior` (SAF-1 principle).
- **Acceptance criteria:**
  1. Real `suggestRepProgression(log, ex, program)` over a raw log: Push-up `4×8-12`, two past sessions with every set at 12 reps and no weight: suggests 13.
  2. Plank `3×45s`, two sessions at 45 s: suggests 50 s.
  3. Push-up at 16 reps in both sessions: no number, the words "Ready for a harder variation".
  4. Medical and Senior: no suggestion.
  5. One qualifying session only: no suggestion.
  6. Weighted exercises: real `computeSuggestedSet` output is unchanged (snapshot over fixtures).
  7. Real-call count: the reps placeholder expression in `renderWorkout` (29139) takes the suggestion when there is one, with exactly 1 `suggestRepProgression(` call in `renderWorkout` (comments stripped).
- **Test plan:** new `test-bodyweight-progression.js`. Sabotage: remove the 2-session rule.
- **Files:** `index.html` (a pure helper beside `computeSuggestedSet` 27980; the reps placeholder at 29139 in `renderWorkout`), `sw.js`, `test-bodyweight-progression.js` (new).
- **Note:** `buildPastSessions` (27673) drops any session whose `topSetOf` (27224) finds no set, and `topSetOf` skips every set with `weight == null` (27227). So weightless sessions never reach it: the helper must read the log entries' `sets` directly (most recent two dates other than `selectedLogDate`, the same filter `buildPastSessions` uses), not through `buildPastSessions`. Don't change `buildPastSessions`: seven suites stub it.
- **Risk:** set chips for bodyweight rows. Guarded by `test-set-chips.js` and `test-gym-set-chips.js`. BL-56 (slot 26a) marks more moves `noWeight` first, so more rows get this.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; criteria split into real invocations of the helper plus one real-call count (the row can't be rendered in jsdom); the `topSetOf` caveat added. Scope unchanged.
- **Status:** ready

### BL-12: Copy that matches the code (H-4 copy, L-2, L-1 for in-app tips)
- **Why:**
  - The Bodybuilding overview (`programs.bodybuilding.overview`, 9840) says "Every muscle is trained at least twice a week". The computed dose is chest, quads and lats 1×/wk (H-4).
  - The bodybuilding tip "Deload every 6-8 weeks" (`TIPS_BY_PROGRAM.bodybuilding`, 33314) contradicts the 5-week engine (`DELOAD_CYCLE_WEEKS`, 14954) [BELL23].
  - The sleep tip "Growth hormone release peaks in deep sleep, directly supporting repair" (33312, same list) is unsupported (L-1).
  - The bodybuilding insight (`DEFAULT_INSIGHTS_BY_PROGRAM.bodybuilding`, 28606) says to "slow the eccentric down… for more growth stimulus", but 0.5–8 s reps grow similarly [DUR15].
- **Change:** text only:
  - overview → "…Most muscles get one hard session a week plus indirect work; pick Strength & Size if you want each muscle twice.";
  - tip → "Deload every 4–6 weeks (the app schedules every 5th)";
  - sleep → "Sleep 7–9 hrs: short sleep lowers training performance and recovery.";
  - insight → the audit's §4 rewrite (`program-audit.md` line 359): keep the first sentence; replace the eccentric sentence with "Rep speed from about 0.5-8 s grows muscle similarly; control the weight and take sets close to failure."
- **Acceptance criteria:**
  1. The real `programs.bodybuilding.overview`, `TIPS_BY_PROGRAM.bodybuilding` and `DEFAULT_INSIGHTS_BY_PROGRAM.bodybuilding` (extracted consts) contain the new text exactly.
  2. The real `renderDayInsight` (28609) on a bodybuilding day with no matching `DAY_INSIGHT_RULES` pattern renders the new insight into `#dayInsight`, without "slow the eccentric".
  3. "Every muscle is trained at least twice", "6-8 weeks" and "Growth hormone" appear nowhere in `index.html` outside comments (count real occurrences).
- **Test plan:** new `test-copy-truth.js`. Sabotage: restore one old string.
- **Files:** `index.html` (9840, 28606, 33312, 33314), `sw.js`, `test-copy-truth.js` (new).
- **Flagged, not in scope:** the `bodyweight` insight (28600) also says "slow the eccentric", but as an intensity lever without load, not a growth claim. Left alone.
- **Risk:** overview length caps. Guarded by `test-concise-overviews.js` and `test-program-overview.js`.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; each string's container named; the audit rewrite quoted; criteria made real reads and one real render. Scope unchanged.
- **Status:** ready

### BL-13: The menstrual-cycle card stops prescribing phase-based training (SAF-7)
- **Why:** `CYCLE_PHASES[*].training` (`index.html` 39093, 39101, 39109, 39117) presents the follicular phase as "a strong window" and suggests testing heavy lifts at ovulation. An umbrella review finds no consistent phase effect [MC23].
- **Change:** each `training` line becomes "Research shows no reliable phase effect on strength or muscle gain. Train to your plan and adjust to how you feel on the day." The symptom, hormone, mental and nutrition text is kept. The line shows in two places, both reading `phase.training`: the phase cards (`buildPhaseCardHtml`, 39139) and the Today cycle row (`getCycleInsight`, 14115).
- **Acceptance criteria:**
  1. For each of the four phases, the real `buildPhaseCardHtml(phase, false)` renders a "Training:" section with the new line, and no card contains "strong window" or "test a heavy lift".
  2. `hormones`, `physical`, `mental` and `nutrition` are byte-identical to v3.518 for all four phases (snapshot).
  3. The real `getCycleInsight()` (as `test-today-priorities.js` already drives it) returns a row containing the new line and still containing its `<b>Food:</b>` advice.
- **Test plan:** extend `test-cycle-phase.js` (it already extracts `CYCLE_PHASES`). Sabotage: restore one line, and criterion 1 must fail.
- **Files:** `index.html` (39087–39122), `sw.js`, `test-cycle-phase.js`. **Re-pin:** `test-today-priorities.js` line 80 asserts the luteal row contains "technique work and moderate intensity", the text this item removes; change it to the new line and name it in the PR.
- **Risk:** cycle-phase insights. Guarded by `test-cycle-phase.js`, `test-cycle-phase-nutrition-insight.js`, `test-supplement-condition-cycle-nudge.js` and `test-today-priorities.js`.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; both render paths named; the `test-today-priorities.js` re-pin found. Scope unchanged.
- **Status:** ready

### BL-14: Unit-aware rest times (M-1)
- **Why:** `getRepRangeTier` (27821) reads the first number after "×" as reps:
  - Heavy Bag 6×2min → 240 s;
  - Sprint 6×40yd → 60 s;
  - max holds → 60 s.

  Rest above 60 s helps hypertrophy slightly, with no added benefit beyond about 90 s [SING24]. Sprints and max holds need near-full recovery [PRAC]. The app's own plyometrics tip (`TIPS_BY_PROGRAM`, 33328: "Full recovery between reps") says so.
- **Change:**
  - (a) `getRepRangeTier` returns `null` when the number is followed by `s|sec|min|m|yd|rounds|breaths|steps`.
  - (b) `getDefaultRestSeconds` (27832) gets a unit branch:
    - rounds → 60 s (jump rope 45 s);
    - sprints ≤ 20 s or ≤ 40 yd → 120 s;
    - `pull`/`push`/`shoulder` holds in seconds → 120 s;
    - erg or run intervals → 90 s.
  - (c) Endurance tier: compound 60 → 120 s, isolation 60 → 75 s.
  - `getRestReasonLabel` (27846) mirrors every branch.
- **Acceptance criteria:** the real function returns:
  - Heavy Bag `6×2min` → 60;
  - Sprint Intervals `6×40yd` → 120;
  - Front Lever Hold `5×10s` → 120;
  - Rowing `6×500m` → 90;
  - Leg Press `3×12-15` → 120;
  - Lateral Raise `3×15-20` → 75;
  - Back Squat `5×5` → 240, unchanged.

  The label agrees with the number for each case (real `getRestReasonLabel`, one distinct label per branch).
- **Test plan:** new `test-rest-units.js`. Sabotage: drop the unit guard.
- **Files:** `index.html` (27821–27853), `sw.js`, `test-rest-units.js` (new).
- **Risk:** the rest timer, and the session time estimate (`parseEstimatedMinutes`, 26501, reads `getDefaultRestSeconds`). Guards: the seven suites that extract the real `getDefaultRestSeconds` and `getRestReasonLabel` (`test-auto-check-sets.js`, `test-backdating-rest-timer-suppression.js`, `test-fallback-entry-consolidation.js`, `test-partial-set-reactions.js`, `test-set-next-button.js`, `test-superset-rest-timer-suppression.js`, `test-superset-shared-sets-block-wiring.js`) and `test-lb-per-kg-consolidation.js` (Back Squat 3×5 = 109 kcal through the rest time: strength tier, unchanged at 240 s, so it should hold). If the unit branch reads `exerciseInfo` categories it already has them in those sandboxes; if it reads anything new (a sprint name list), guard it with `typeof` as BL-57 does.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the tip reference corrected (the old 33132 line is the plyometrics tip at 33328); the seven extracting suites named. Scope unchanged.
- **Status:** ready

### BL-15: The decrease signal waits for two short sessions (M-2)
- **Why:** signal 2 in `analyzeProgressionSignal` (27616–27626) drops the load 7.5% after one session below the rep floor. Coached rules wait for repeated failure: Starting Strength resets after 3 stalls, and GZCLP changes the scheme first [PRAC].
- **Change:**
  - Decrease only when `s0` **and** `s1` are both below the floor at the same or heavier load, or `s0.avgRpe >= 10`.
  - The drop is 5% for upper-body categories (`push`, `pull`, `shoulder`, `arms`) and 7.5% for lower body.
  - `computeSuggestedSet` (its decrease branch, 28060–28066) uses the same figure. Today both compute it separately (27621 and 28064, the same formula); after this item they must still agree.
- **Acceptance criteria:**
  1. Real `analyzeProgressionSignal`: one short session (s0 below the floor, s1 in range): no decrease.
  2. Two short sessions on Bench at 200: decrease, and the real `computeSuggestedSet` returns `snapToLoadable(190, 'Bench Press', 'down')` or below.
  3. One short session at RPE 10: decrease.
  4. The badge figure equals the field figure: the weight named in the real `buildProgressBadge` html equals `computeSuggestedSet`'s weight for the same fixture, for one upper-body and one lower-body lift.
  5. Clinical plans keep their own gate: on `'medical'` the decrease rule is unchanged from v3.527 (BL-02's criteria in `test-rpe-safety-caps.js` still pass).
- **Test plan:** extend `test-all-set-double-progression.js` (BL-08 creates it; if BL-08 hasn't merged, create `test-decrease-two-sessions.js` instead). Sabotage: revert to the 1-session rule, and criterion 1 fails.
- **Files:** `index.html` (27616–27626, 28060–28066), `sw.js`, the test. **Re-pin:** `test-program-fit-trend.js` lines 59–68 ("decrease: reps fell below the rep floor…") feeds one short session (105×6 at RPE 9 after 100×9 at RPE 8, `3x8-10`) and expects `'decrease'`. Under this item that's no longer a decrease. Make the fixture two short sessions (for example s1 `{weight:105, reps:7, avgRpe:9}`), keep the expectation, and name it in the PR.
- **Risk:** same guards as BL-08, plus `test-rpe-safety-caps.js` (extracts the real `analyzeProgressionSignal`, `computeSuggestedSet` and `buildProgressBadge`).
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; criteria made real invocations; the `test-program-fit-trend.js` re-pin found by running the logic against its fixture. Scope unchanged.
- **Status:** ready

## Ready: first step of each bar-raiser

### BL-16: Smoothed trend weight, with pace from the trend
- **Why:**
  - `renderSparkline` (41007) computes pace first-to-last on raw weigh-ins (41039–41045), so one water-heavy morning moves pace and goal date (`describeGoalPace` 40992).
  - MacroFactor's most-praised trait is a trended weight (research §8.1).
  - Hacker's Diet EMA, 10% smoothing ([fourmilab](https://www.fourmilab.ch/hackdiet/); checked from memory, unverified this session).
- **Change:**
  - A pure function, `computeWeightTrend(sortedEntries)`, with gap-aware smoothing: α = 1 − 0.9^days since the previous weigh-in. The first trend value is the first weigh-in.
  - The trend is computed over **all** entries, then cut to the chart's range (`getAnalysisTrendRangeDays`, 40708), so changing the range never changes a trend value.
  - `renderSparkline` draws a second polyline, `.weight-trend-line`, over the raw points, at the same x positions (one point per weigh-in in range). The raw line, its gradient fill and the goal line are unchanged here (flat charts are UX-03's and UX-10's job).
  - Pace (`perWeek`, 41044) becomes (trend now − trend at the first weigh-in at least 14 days before it) / days × 7 when the range spans ≥ 14 days. Otherwise it stays first-to-last. `describeGoalPace` gets that pace and the latest **trend** value, so the goal date stops moving with one morning.
- **Acceptance criteria** (real `computeWeightTrend` and `renderSparkline` in jsdom, with `#weightChart`, a fixed `getTodayKey` and the range stub `test-goal-weight.js` already uses):
  1. Daily 180.0 for 20 days, then one 184.0: the last trend value is ≤ 180.4 (exactly 180.4 with α = 0.1).
  2. A two-day gap gives α = 0.19 (1 − 0.9²) for the next point (±0.001).
  3. The chart contains exactly one `.weight-trend-line` polyline with as many points as weigh-ins in range.
  4. A linear −0.5 lb/wk series of **60** daily weigh-ins (long enough for the trend to settle: 0.9³⁰ ≈ 0.04), range "all": the pace text reads "About 0.5 lb a week loss" (0.45–0.55).
  5. Fewer than 2 weigh-ins: the empty note is unchanged. Under 4: no pace sentence, as today.
  6. With a goal set, `describeGoalPace` is called with the trend's last value (stub-count the call and record its first argument).
- **Test plan:** new `test-weight-trend.js`. Sabotage: α = 1 (the trend equals the raw series), and criteria 1 and 4 fail.
- **Files:** `index.html` (`describeGoalPace` 40992, `renderSparkline` 41007–41073, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-weight-trend.js` (new). **Suites that extract `renderSparkline` and must pass unchanged:** `test-analysis-trend-range.js`, `test-goal-weight.js`, `test-metric-trend-cards.js`. Read their pace and goal-date assertions before editing: any fixture under 14 days keeps the first-to-last pace, so they should hold; if one asserts a raw-pace goal date over ≥ 14 days, re-pin it with a dated note and name it in the PR.
- **Risk:** range filter and goal line. Guarded by the three suites above.
- **Tools:** `dataviz`.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Criterion 3's old fixture couldn't pass: an EMA lags a linear series, so a short series under-reads the slope; the fixture is now 60 days. Added: trend over all entries then cut to the range, the gap-aware α case, and the goal date reading the trend. The Hacker's Diet citation stays marked unverified until D10's paper-lookup is present (roadmap slot 37). Scope unchanged.
- **Status:** ready

### BL-17: Estimated expenditure from your own logs (read-only)
- **Why:**
  - `computeTargets` (33172) is static Mifflin–St Jeor × activity; it already returns `tdee` (33291).
  - MacroFactor estimates expenditure from intake plus the trended weight change, and needs 2–3 weeks ([help 109](https://help.macrofactorapp.com/en/articles/109-how-frequently-do-i-need-to-log-my-weight-for-the-expenditure-algorithm-and-weekly-coaching-updates)).
  - Both inputs already exist and are already fetched together: `refreshBodyHealthTrends` (47680) loads `fetchAllWeightEntries()` and `fetchFoodDays()` (40662) in one `Promise.all` before calling `renderSparkline`.
- **Change:**
  - A pure function, `estimateExpenditure(foodDays, weightEntries, todayKey)`, over the last 28 days, or at least 14:
    - average intake on logged days, minus (Δ trend lb × 3500) / days;
    - 3500 kcal/lb is the standard approximation, labelled as one in the UI.
  - It needs ≥ 14-day span, ≥ 80% of days with food logged, and ≥ 2 weigh-ins in each half of the window. Otherwise it returns `{reason}`.
  - The trend is BL-16's `computeWeightTrend`, not a second smoother.
  - It shows one line under the weight trend, in a new `#expenditureLine` after `#weightChart`, rendered from `refreshBodyHealthTrends` (47680): "From your logs: about 2,600 cal/day (formula: 2,450). Intake 2,410 avg, trend −0.4 lb/wk." The formula figure is `computeTargets(userProfile).tdee`. Or the reason it can't say yet.
  - If BIZ-03's placeholder line is showing (profile defaults), the formula figure is labelled "formula, on placeholder details".
  - No target changes. That's BL-27.
- **Acceptance criteria** (real `estimateExpenditure` and `computeWeightTrend`; the line through the real render path with stubbed fetches):
  1. 2,400 cal logged every day, and a linear −0.5 lb/wk weight series that starts **60 days before** the 21-day window (so BL-16's trend has settled): the estimate is 2,650 (±10).
  2. 9 of 14 days logged gives reason "Log food on more days…".
  3. Only 1 weigh-in in the window's first half gives a weigh-in reason, not a number.
  4. The rendered line contains both the estimate and `computeTargets(userProfile).tdee`, formatted with thousands separators.
  5. Nothing is written to storage (stub-count `window.storage.set`: 0).
- **Test plan:** new `test-expenditure-estimate.js`. Sabotage: drop the logging-coverage rule, and criterion 2 fails.
- **Files:** `index.html` (a new function near `renderSparkline` 41007; `refreshBodyHealthTrends` 47680–47700; the `#weightChart` card markup; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-expenditure-estimate.js` (new). Guards: `test-analysis-trend-range.js` (drives `refreshBodyHealthTrends`' range re-render), `test-goal-weight.js`, `test-metric-trend-cards.js`, `test-weekly-recap.js` (extracts `fetchFoodDays`), `test-analysis-export.js` (reads the rendered cards).
- **Risk:** the Analysis weight card layout. Same guards as BL-16.
- **Tools:** `dataviz`.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Criterion 1's fixture now pre-settles the trend (otherwise BL-16's EMA lag under-reads the slope and the estimate misses by about 100 cal); the render site is `refreshBodyHealthTrends`, which already has both inputs; `tdee` already exists on `computeTargets`. Scope unchanged.
- **Status:** ready (after BL-16)

### BL-18: One-tap recent foods
- **Why:**
  - Food logging happens several times a day. Today every repeat food costs search → select → add.
  - MacroFactor competes on tap counts (research §2, FLSI, self-reported).
  - No recents exist. Re-checked at v3.528: `food-usage-counts` (`usageCounts`, 37565; `sortByUsage`, 37580) only re-orders library and search results; nothing offers a one-tap repeat.
- **Change:**
  - `buildRecentFoods(days)` reads `foodlog:*` for the 14 days before `selectedLogDate` (13898).
  - It ranks by the number of **days** the food appears, then by recency, de-duplicates on `baseName || name` (logged multiples carry `baseName`, set by `scaleFoodItem` 37621), and keeps the top 8. Each chip represents the **most recent** logged entry of that food, so it repeats the portion you last had.
  - **One re-add path, shared with BL-19:** `relogFoodEntry(entry)` calls the existing `addFoodToLog(base, entry.qty || 1)` (37625), where `base` is the entry's single portion (name `baseName || name`, each macro divided by `qty`) and the logged `time` is dropped (`addFoodToLog` stamps its own). Passing the logged entry straight in would bump the usage count under "Bagel ×3", which `addFoodToLog`'s own comment (37636) says must never happen.
  - It renders as a chip row `#foodRecents` between `#foodSearchInput` (6321) and the quick-add row (6324), inside `#nutritionExpandWrap` (an `expand-wrap`), while the search box is empty. The existing `input` handler (37556) already hides `#foodCats` when there's a term; it hides `#foodRecents` the same way.
  - No new storage.
- **Acceptance criteria** (real `buildRecentFoods`, `relogFoodEntry`, `addFoodToLog`, `scaleFoodItem`, `saveFoodLog` and `renderFoodLog`, stub `window.storage`):
  1. With fixtures where "Greek Yogurt" was logged on 5 of the 14 days and "Banana" on 3 (Banana more recently), Greek Yogurt is the first chip.
  2. **One** click on a chip adds exactly one entry to `todaysFoodLog`, with that item's macros (tap-count assertion).
  3. A chip for a logged "Bagel ×3" (qty 3, 840 cal) adds one entry of 840 cal (±1), named "Bagel ×3", and `usageCounts` rises under "Bagel", not "Bagel ×3".
  4. Typing in `#foodSearchInput` (a real `input` event) hides `#foodRecents`; clearing it shows it again.
  5. Each chip has an `aria-label` of "Add <name>", and its CSSOM `min-height` is ≥ 44 px (TOOL-01's harness confirms the rendered height at 402×874).
  6. Food logged **on** `selectedLogDate` itself isn't counted (the window is the 14 days before it).
- **Test plan:** new `test-food-recents.js`. Sabotage: rank by recency only, and criterion 1 fails; pass the logged entry to `addFoodToLog` directly, and criterion 3 fails.
- **Files:** `index.html` (markup 6321–6324, `addFoodToLog` 37625, the search `input` handler 37556, `renderFoodLog` 37931, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-food-recents.js` (new).
- **Risk:** the food log. Guarded by `test-food-log-portions.js`, `test-food-log-macro-expand.js`, `test-log-2-0.js`, `test-food-add-confirmation-pop.js`, `test-barcode-my-foods-cache.js` (also extracts `addFoodToLog`) and `test-visual-polish-audit-fixes.js` (66–104: the quick-add row's computed layout, which sits right below the chips).
- **Tools:** `impeccable harden`, `apple-hig`.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: re-adding a logged multiple through `addFoodToLog(item, 1)` would count usage under "Bagel ×3", which the function's own comment forbids, so the item adds `relogFoodEntry` (BL-19 reuses it); "count" is now days, so one big day can't dominate; criteria are real events. Scope unchanged.
- **Status:** ready

### BL-19: "Repeat yesterday" adds single items, even after you've started the day
- **Why:** Repeat yesterday exists (button `#repeatYesterdayBtn` 6316, `updateRepeatYesterdayVisibility` 37880, handler 37898). It hides once anything is logged and copies all or nothing. The research's "missing" verdict missed it. Extending it beats a parallel feature (CLAUDE.md, "Consolidate duplication").
- **Change:**
  - On an empty day, the button keeps its whole-day behaviour.
  - On a non-empty day, the same button reads "Add from yesterday" (or "Add from <date>" when backdating, as the existing label does at 37890) and is shown whenever the prior day has entries.
  - Tapping it expands (`expand-wrap`) a list of the prior day's items. Each row has one add button that calls **BL-18's `relogFoodEntry`**, so a multiple re-adds as the same portion and counts usage under its base name.
  - *(Spec refresh 3)* Not `buildFoodResultRows` (36574), as first written: that's the review row for Describe, Snap a Meal and Recipe Finder, with a portion stepper and "Save to My Foods" but no add control; adding happens through those flows' own confirm buttons. Using it here would mean a second confirm step.
- **Acceptance criteria** (real `updateRepeatYesterdayVisibility`, the real click handler, `relogFoodEntry`, `addFoodToLog`, stub `window.storage`):
  1. On an empty day, a click copies every item, as today (`todaysFoodLog` equals the prior day's list, as copies).
  2. On a day with 1 item and a prior day with 3, the button reads "Add from yesterday" and is visible.
  3. A click shows 3 rows, one per prior-day item, and doesn't change `todaysFoodLog`.
  4. One click on one row's add button appends exactly one entry, and the stored `foodlog:<prior day>` string is byte-identical before and after.
  5. Backdated (`selectedLogDate` two days ago), the label names the prior date, as `formatLogDateLabel` does today.
- **Test plan:** new `test-repeat-yesterday-items.js`. Sabotage: hide the button when the day isn't empty, and criterion 2 fails.
- **Files:** `index.html` (6316, 37880–37914, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, the test. **Suites that extract these and must stay green:** `test-log-2-0.js`, `test-food-log-portions.js`, `test-food-log-macro-expand.js` (all three extract `updateRepeatYesterdayVisibility`; the empty-day path they test is unchanged).
- **Risk:** the food log and the backdating label (37890). Guarded by `test-backdating.js` and `test-log-2-0.js`.
- **Tools:** `impeccable clarify`.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. The row renderer changed from `buildFoodResultRows` (no add control) to BL-18's shared `relogFoodEntry`; criteria now name the three suites that extract the visibility function. Scope unchanged.
- **Status:** ready (after BL-18)

### BL-20: Per-muscle weekly set ledger in Analysis (fractional counting)
- **Why:**
  - Volume is counted by category group (`MUSCLE_GROUP_MAP` 45530), so chest and side delts share a number, and landmarks are coarse (`VOLUME_LANDMARKS` 45550).
  - About 10+ sets per muscle per week for hypertrophy [ACSM26]. Fractional counting (primary 1, synergist 0.5) fits best [PEL].
  - This is the audit's single biggest bar-raiser (§5) and research #1.
- **Change:**
  - An `EXERCISE_MUSCLES` map (`{p:[...], s:[...]}`) for every exercise in `strength`, `bodybuilding`, `powerbuilding` and `powerlifting`, across all day-count variants. Muscles: chest, lats, upper back, front/side/rear delts, biceps, triceps, quads, hamstrings, glutes, calves.
  - A pure function, `computeWeeklyMuscleSets(corpus, weekStartKey)`, built on `readExCorpus` (41226); a set counts when it has reps (the same "real set" test the group rows use).
  - Rendered inside the existing Weekly Volume card (`#volumeTrend`), below the group rows, in `renderVolumeTrend` (45779): one row per muscle, "Chest 7.5 / 10+". *(Spec refresh 3)* Not the `vol-landmark` statuses: their colours are state colours (`.vol-landmark-below` is `--plate-yellow`, 2531), and the summit note asks for grey under the floor and the day's ink at or above it, with no state colour on the numbers (`design-vision.md` §3.6, `progress.html`).
  - The existing group rows are unchanged.
- **Acceptance criteria** (real `computeWeeklyMuscleSets`, `EXERCISE_MUSCLES` and `renderVolumeTrend` with `readExCorpus` over stub storage):
  1. A fixture week of Bench 4 sets plus Incline DB Press 3 sets gives chest 7, triceps 3.5 and front delts 3.5.
  2. The rendered card has one `.muscle-ledger-row` per muscle with sets > 0, each showing one decimal ("3.5") and "/ 10+".
  3. Every exercise named in those four programs, across their day-count variants, has an `EXERCISE_MUSCLES` entry (coverage sweep with the real tables).
  4. *(Alignment note)* Fixtures at 10 and at 25 sets render equal fill widths, and only the 25 case shows "More isn't needed; returns get smaller [PEL]."
  5. Under the floor the fill uses `--text-3` (grey); at or above it, the day's ink (`var(--spot)` once UX-05 has shipped, which it has at this slot). No `.muscle-ledger-row` descendant has a `--positive`, `--negative`, `--warning` or `.vol-landmark-*` colour (CSSOM).
  6. The existing group rows render unchanged for the same fixture (snapshot of their text before and after).
- **Test plan:** new `test-muscle-ledger.js`. Sabotage: count synergists as 1, and criterion 1 fails; drop the floor cap, and criterion 4 fails.
- **Files:** `index.html` (`EXERCISE_MUSCLES` and the function beside `MUSCLE_GROUP_MAP` 45530; `renderVolumeTrend` 45779 onward; ledger CSS beside `.vol-landmark` 2529; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-muscle-ledger.js` (new). `renderVolumeTrend` has no suite that extracts it at v3.528.
- **Risk:** the Analysis card. Guarded by `test-analysis-2-0.js`, `test-analysis-collapse.js` and `test-analysis-export.js` (which reads the rendered cards). Criterion 3 means BL-37, BL-38 and BL-39 (Phase 3–4), which add exercises to these programs, must add `EXERCISE_MUSCLES` entries in the same version; their builders will see this test fail if they don't.
- **Tools:** `dataviz`.
- **Summit note (summit 2026-11-07):** Build it **once**, to `design-vision.md` §3.6 (summit R8): fractional figures shown with decimals, a "10+" floor [ACSM26] with no ceiling drawn, grey under the floor, the day's ink inside it. UX-10 then *moves* this renderer rather than redrawing it. No "add sets" advice here; that's BL-31 or BL-39.
- **Alignment note (2026-11-07, exercise-auditor N3):** the ink fill **stops growing at the floor**: a muscle at 10 and a muscle at 25 show the same full bar. Above about 20 fractional sets, show one neutral line: "More isn't needed; returns get smaller [PEL]." Add a criterion: fixtures at 10 and at 25 sets render equal fill widths, and the 25 case shows the line.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. The alignment note's criterion and the summit's colour rule are now numbered criteria (4, 5); "reusing `vol-landmark` statuses" was dropped because those are state colours, which the vision and `progress.html` keep off the ledger. Ships after BL-59 (slot 55a), so categories are already corrected. Scope unchanged.
- **Status:** ready (after BL-59)

### BL-21: HRV joins readiness, against your own baseline
- **Why:** HRV is imported (`hrv-log`, 46960) but `computeReadiness` (46843) never reads it (research §7). Lifters complain that wearables ignore training load (research §4). Personal-baseline ln rMSSD comparison follows Plews et al. 2013, Sports Med 43:773, doi 10.1007/s40279-013-0071-8 (cited from memory, unverified).
- **Change:**
  - `hrvBaselineFrom(entries, todayKey)`, mirroring `rhrBaselineFrom` (46903). It needs ≥ 14 readings in days 8–60 before today. It works on ln(value) and returns `{mean, sd}`.
  - `computeReadiness` gets `hrv7` (the ln mean of the last 7 days, needing ≥ 3 readings) and the baseline. It flags `{kind:'hrv'}` when `hrv7 < mean − 0.5×sd`.
  - `getReadinessInsight` (14560) fetches `fetchHealthLog('hrv')` (47101).
- **Acceptance criteria:**
  1. A flat 60 ms baseline with a 7-day mean of 48 gives an `hrv` flag with the text "HRV has run below your usual this week".
  2. 59 ms: no flag.
  3. Under 14 baseline readings: no flag, and `known` stays as today.
  4. HRV plus a sleep flag gives level `caution`.
- **Test plan:** new `test-readiness-hrv.js`. Sabotage: drop the 0.5×SD term.
- **Files:** `index.html` (46843–46915, 14560–14590), `sw.js`, the test.
- **Risk:**
  - Today priorities. Guarded by `test-today-priorities.js`.
  - **Flag, don't fix:** the importer aliases both `rmssd` and `sdnn` to one series (46962). Mixing sources would distort the baseline. Note it in the build log for a separate item.
- **Status:** ready

### BL-22: Export workout history as CSV
- **Why:** history can leave only as JSON (`exportDataBtn` 6248, handler 34159). People switching apps care about CSV fidelity (research §4, second-hand). An easy exit builds trust.
- **Change:**
  - A pure function, `buildWorkoutCsv(corpus, unit)`, over `readExCorpus` (41014). One row per set, with columns: `Date, Program, Day, Exercise Name, Set Order, Weight (<unit>), Reps, Distance, Seconds, RPE, Notes`.
  - RFC 4180 quoting.
  - Warm-ups are excluded; drop sets become their own rows with `Notes=drop`.
  - A second button under the JSON one: "Export workouts as CSV".
  - Strong's exact header isn't verified; the column order is ours, and the header row names the units.
- **Acceptance criteria:**
  1. A fixture with 2 exercises × 3 sets gives 1 header row + 6 data rows.
  2. A name containing a comma or quote is quoted and escaped.
  3. kg mode converts weights.
  4. The button triggers a download whose `a.download` ends in `.csv`.
- **Test plan:** new `test-workout-csv-export.js`. Sabotage: drop quoting.
- **Files:** `index.html` (6248, near 34159, 41014), `sw.js`, the test.
- **Risk:** the settings layout. Guarded by `test-settings-grouped.js` and `test-import-backup-full-replace.js`.
- **Tools:** `security-review` (export path).
- **Status:** ready

### BL-23: One-tap early deload when the fit check says overreaching (M-6, part 2)
- **Why:** consensus supports deloading early on fatigue signals [BELL23]. `buildProgramFitInsight` (27733) already detects `overreaching` (27741), `getCurrentTrendStatus` (27776) already returns that status, and `manualDeloadEnabled` (30375) already exists in Settings, two taps deep.
- **Change:** when `getCurrentTrendStatus()` is `overreaching`, and `isDeloadWeek()` (14966) is false, and manual deload is off, Today's priorities (`renderTodayInsights`, 14667) shows "Your logs suggest a deload. [Take it this week]". The button sets the same flag and storage key as `#manualDeloadToggle` (`manual-deload-pref`, written at 30392 by the delegated handler 30389–30396) and re-renders. Reuse that handler's body (one small shared function both call), not a second copy of it.
- **Acceptance criteria:**
  1. The real insight function with `getCurrentTrendStatus` stubbed to `'overreaching'`: the row shows; one real click on its button makes `manualDeloadEnabled === true`, stores `'1'` under `manual-deload-pref`, and calls `renderWorkout` once (stub).
  2. `'thriving'` or `null`: no row.
  3. `isDeloadWeek` → true: no row. `manualDeloadEnabled` already true: no row.
  4. After the click, `#manualDeloadToggle` (if mounted) reads checked, via the real `applyManualDeloadPrefToUI`.
- **Test plan:** extend `test-manual-deload-override.js`. Sabotage: skip the deload-week check.
- **Files:** `index.html` (Today's priorities near 14646–14735; 27733–27782 read only; 30375–30396), `sw.js`, `test-manual-deload-override.js`. **Re-pins if the row is a new getter in `renderTodayInsights` (14672–14676):** `test-cycle-phase-nutrition-insight.js` (its hand-written stubs, 125–140) and `test-supplement-condition-cycle-nudge.js` (230–245) define every other getter by name and run the real renderer, so each needs one `async function get…Insight(){ return null; }` line; name both in the PR. Guards: `test-today-priorities.js` (it builds its stubs from the real renderer's getter calls, line 30, so a new getter is stubbed automatically; the row also needs a place in the `order` list, 14704), `test-mesocycle-phase-tag.js` (reads `manualDeloadEnabled`), `test-today-emoji-free.js` (its getter list, 25–26, is a subset; optional to extend).
- **Risk:** Today priorities ordering. Guarded by `test-today-priorities.js` and `test-manual-deload-override.js`.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; `getCurrentTrendStatus` named as the source, the shared toggle body asked for (no duplicate), criteria made real invocations, and the priority-getter suites that list every getter found. Scope unchanged.
- **Status:** ready

### BL-24: Increments scale with strength (M-3)
- **Why:** `CATEGORY_LOAD_INCREMENT` (27580) gives a fixed 10 lb on squat, hinge and oly. That's +7.4% on a 135 lb squat and +2.2% on a 455 lb one. Olympic lifts on a 10 lb Epley-based double progression scored **F** (audit scorecard) [PRAC].
- **Change:**
  - `getLoadIncrement(category, e1rm)` (27585) returns `max(table floor, e1rm × p)`, with p = 2.5% for lower body and 2% for upper compounds, snapped by `snapToLoadable` (32934).
  - Isolation stays at the floor.
  - The `oly` floor becomes 5 lb.
  - **Owner question (spec refresh 2): the `squat` and `hinge` floors.** The spec contradicts itself. Criterion 2 wants a squat with e1RM 135 to get +5 lb, but with the table's 10 lb kept as the floor (the audit's M-3 text says "keep the current table as the floor"), max(10, 135 × 2.5%) = 10. With a 10 lb floor, no squat or deadlift step changes until e1RM passes about 600 lb (455 × 2.5% = 11.4 snaps to 10), so the item would change nothing for those lifts.
    - (a) **Recommended:** the `squat` and `hinge` floors drop to 5 lb (the smallest two-plate jump with 2.5 lb plates). Lighter lifters get +5 lb steps, heavy lifters +10–15. Matches criterion 2 and the audit's complaint (+7.4% on a 135 lb squat).
    - (b) Keep the 10 lb floor; drop criterion 2. Only `oly` changes in practice.
    - Build with (a)'s criteria if the owner picks (a); with (b), criterion 2 becomes "+10 lb" and the What's New line says only Olympic steps changed.
  - The three callers pass the e1RM: signal 2 (27621) and signal 3 (27661) pass `recentBestE1RM(pastSessions)` (27538); `computeSuggestedSet` (28012) passes `rpeCtx && rpeCtx.e1rm`, which `renderWorkout` builds from the same `recentBestE1RM(pastSessions)` (28951), so the badge and the field agree. With no e1RM, the floor applies.
- **Acceptance criteria:**
  1. Real `getLoadIncrement('squat', 455)` gives +10 lb (≈11.4, snapped).
  2. `getLoadIncrement('squat', 135)` gives +5 lb.
  3. `getLoadIncrement('oly', <any>)` gives +5 lb.
  4. Lateral Raise (`shoulder`) stays at its table value with any e1RM.
  5. `getLoadIncrement('squat')` with no e1RM returns the floor (5 under (a), 10 under (b)).
  6. Real `analyzeProgressionSignal` and `computeSuggestedSet` for a squat with e1RM ≈ 455 name the same step (badge figure = field figure).
- **Test plan:** extend `test-all-set-double-progression.js` (BL-08's; create `test-load-increment-scaling.js` if it doesn't exist yet). Sabotage: ignore the e1RM, and criterion 1 fails.
- **Files:** `index.html` (27580–27587, 27616–27667, 28012), `sw.js`, the test. Two suites extract the real `getLoadIncrement` and `CATEGORY_LOAD_INCREMENT`: `test-rpe-safety-caps.js` (criterion 10 at 229–240 reads `getLoadIncrement('squat')` for its expectation, so it follows the new floor and should pass; if it fails, re-pin and name it) and `test-program-fit-trend.js` (21–22). If `getLoadIncrement` now calls `snapToLoadable`, both sandboxes need it: `test-rpe-safety-caps.js` already has it; `test-program-fit-trend.js` doesn't, so add it (and its equipment helpers) to that suite's chunks, or snap at the callers instead.
- **Risk:** same guards as BL-08, plus `test-warmup-ramp-and-plates.js` for snapping. Under (a) the What's New line must say squat and deadlift steps drop to 5 lb for lighter lifters.
- **Alignment note (2026-11-07):** the strength-scaled increment never applies to `medical` or `senior`: they keep BL-02's smallest loadable jump. Add a criterion asserting it (an e1RM of 200 on hypertension Seated Cable Row still gets the smallest jump).
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the e1RM source for each caller named; the two extracting suites found; the floor contradiction between criterion 2 and the kept table found and put to the owner. Scope otherwise unchanged.
- **Status:** ready (owner 2026-11-09: option **(a)**, the `squat` and `hinge` floors drop to 5 lb; build with (a)'s criteria).

### BL-25: Exercise cue corrections (L-1, audit §4)
- **Why:** these cues contradict the evidence:
  - Hip Thrust's EMG claim (`content-exercises.js:251`) [PLOT23];
  - DB Curl "lowering is where most growth happens" (234) [DUR15];
  - Leg Press "about 90°" (260) [LEN];
  - Deadlift "legs first, then extend the hips" (236).

  Filler cues on Lateral Raise (257), Dragon Flag (173), Front Lever (171), Dip (168) and L-sit have no instruction. Muscle-up (170) lacks its prerequisite.
- **Change:** text only, in `content-exercises.js`. Each is a **rewrite of one existing cue in place**, so every exercise keeps its cue count (`test-concise-cues.js` "cue COUNT per exercise never changes"; `test-safety-cues.js`'s v3.526 snapshot). The strings are audit §4's (`program-audit.md` 355–376), copied exactly:
  - Hip Thrust (251), cue 3 → "Lock out and pause 1 s; squats and hip thrusts grow glutes about equally, so use whichever you can load and feel." [PLOT23]
  - DB Curl (234), cue 3 → "Lower under control in about 2 s; full stretch at the bottom with arms straight." [DUR15]
  - Leg Press (260), cue 2 → "Lower as deep as your lower back stays flat on the pad." [LEN]
  - Deadlift (236), cue 2 → "Push the floor away; hips and shoulders rise together until the bar passes the knees."
  - Lateral Raise (257), cue 3 → "Raise in the plane of the shoulder blade, slightly forward; stop at shoulder height."
  - Dragon Flag (173), cue 3 → "Start with tuck or single-leg negatives; stop if your lower back arches off the bench."
  - Front Lever Hold (171), cue 3 → "Progress tuck → advanced tuck → one leg → straddle; hold 10-15 s with straight arms." (Cue 2 belongs to BL-64, slot 6b; leave it as BL-64 left it.)
  - Dip (Bar/Ring) (168), cue 3 → "Lower until your shoulder is level with your elbow, not deeper, unless that's comfortable."
  - L-sit Hold (172), cue 3 → "Press the shoulders down hard; tuck sit first."
  - Muscle-up (170), cue 3 (the "If you're not there yet…" line) → "Prerequisite: 10 strict pull-ups and 10 dips first; until then, practise the transition with a band." This keeps the band progression and adds audit §4's missing prerequisite without adding a cue.
  - **Not in this item:** the bodybuilding insight "Slow the eccentric…" (`index.html` 28609) and "Growth hormone release peaks…" (33315) are in-app tips, owned by BL-12 (slot 30, "L-1 for in-app tips"). If BL-12 didn't change them, flag it in the build log; don't fold them in here.
- **Acceptance criteria** (real `exerciseInfo` loaded through `extractConst`, and the real `buildDetailsHtml` (28544) parsed with jsdom, as `test-safety-cues.js` already does with its `renderCues` helper):
  1. For each of the 10 exercises, the rendered cue list contains its new line exactly once.
  2. None of "EMG research ranks", "most of the growth", "about 90°" (in Leg Press; Triceps Dip's own "about 90°" at 184 stays), "legs first", "V-taper", "Bruce Lee", "Christopher Sommer", "one of the most effective" (Dip), "one of the best pure ab" or "If you're not there yet" appears in any cue.
  3. Cue counts: every exercise's count equals the base commit's (the snapshot test in `test-safety-cues.js` and the totals in `test-concise-cues.js` pass **unchanged**).
  4. No new cue is over 24 words (the existing `test-concise-cues.js` cap).
- **Test plan:** extend `test-safety-cues.js` (it already has `renderCues` over the real `buildDetailsHtml`). Sabotage: restore the Hip Thrust line, and criteria 1 and 2 fail.
- **Files:** `content-exercises.js`, `index.html` (`APP_VERSION` 7625 and the `WHATS_NEW` entry only, appended to the object at 7643), `sw.js`, `test-safety-cues.js`. Guards: `test-concise-cues.js` (counts, 24-word cap, `MUST_KEEP`), `test-masterclass-technique-render-consolidation.js`, `test-exercise-demos-removed.js` (also extracts `buildDetailsHtml`).
- **Risk:** cue caps and counts. Guarded by `test-concise-cues.js` and `test-safety-cues.js`. If BL-35 (slot 8) has already replaced Neck Bridges, the totals in those two suites will already differ from v3.528's 321/971; this item changes neither total.
- **Spec refresh 3 (2026-11-09, against v3.528):** line numbers re-checked in `content-exercises.js` (unchanged since v3.514; Front Lever Hold is 171, L-sit Hold 172). The audit's exact strings are now in the item, the Muscle-up prerequisite is a rewrite (so no cue count moves and no snapshot re-pin is needed), the BL-64 overlap on Front Lever is split by cue, and the two in-app tips are left to BL-12. Scope unchanged.
- **Status:** ready

### BL-26: Plateau message names the stall and offers choices
- **Why:** long-term progression is Fitbod's top complaint (research §4). Today a stall is silent until the RPE-9 deload signal fires (signal 1 in `analyzeProgressionSignal`, 27602–27614). GZCLP changes the rep scheme before cutting load [PRAC].
- **Change:** a new signal, `stall`, in `analyzeProgressionSignal`: 3 sessions at the same weight with `minRepsAtTop` not rising, and not RPE ≥ 9 (that's still `deload`). The badge offers three named options, as text:
  - "drop to the bottom of the range and add a set";
  - "swap variation (see substitutes)";
  - "micro-load +2.5 lb".

  Nothing changes automatically.
- **Acceptance criteria:**
  1. Real `analyzeProgressionSignal` over 3 flat sessions (same weight, `minRepsAtTop` 6, 6, 6 on `4×6-8`, RPE 8) gives `type 'stall'`, and the real `buildProgressBadge` html contains all three options.
  2. 3 flat sessions at RPE 9+ still give `deload`.
  3. Real `computeSuggestedSet` on a stall returns the same weight as last time (nothing changes automatically).
  4. `computeProgramFitTrend` counts a stall as `hold` (its `else` branch, 27724), so the fit check's ratios are unchanged: assert with a real `buildProgramFitInsight` over the same counts.
  5. Clinical plans: on `'medical'`, the same fixture gives `null`, as v3.527 (BL-02's gate returns before any new signal).
- **Test plan:** extend `test-all-set-double-progression.js`. Sabotage: remove the RPE exclusion.
- **Files:** `index.html` (27594–27669, 27885–27978, 27980–28085), `sw.js`, the test. Guards: `test-rpe-safety-caps.js`, `test-deload-signal-week-awareness.js` and `test-today-workout-emoji.js` (they extract the real `buildProgressBadge`), `test-program-fit-trend.js`.
- **Risk:** same as BL-08. Depends on BL-08's `minRepsAtTop`. The stall branch must sit after the clinical gate (27636–27654), so the clinical plans never see it.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; criteria 3–5 added as real invocations (the old two left the suggestion, the fit check and the clinical gate untested). Scope unchanged: still text only, no automatic change.
- **Status:** ready (after BL-08)

---

## Needs owner (in priority order)

**Owner's third round applied (2026-11-08, "1-6 yes, clinician"; `pitch.md` → "Owner's answers", third round, and its decision table).** BL-27, BL-28, BL-29, BL-31, BL-32, BL-33 and BL-34 below are now `ready` or `ready (after …)`, and BL-30 is `parked`. BL-32 and BL-34 were re-scoped to the answers. The section keeps its name so no link breaks; each item's own `Status:` line is what the loop reads. Their slots are in `roadmap.md`'s Unified build sequence.

### BL-27: Weekly calorie check-in that can update your target
- **Why:** this turns BL-17's estimate into MacroFactor's core loop (research #2).
- **Change:**
  - On the first day of each week, if `estimateExpenditure` is valid and differs from `computeTargets().tdee` by ≥ 100 cal, Today shows "Update your calorie target to X?"
  - Accepting stores an override under a new key, `nutrition-target-override`, which `computeTargets` (32973) respects.
  - `computeDeficitGuardrail` (14446) still applies.
  - **Owner condition (D5, 2026-11-08): three weeks of BL-17 data.** The prompt is offered only when `estimateExpenditure` is valid **and** its window spans at least 21 days. And the build itself waits until BL-17 has been merged on `origin/Branch-1` for at least 21 days, so the owner has three weeks of the read-only estimate to judge before it can move a target.
- **Acceptance criteria:**
  1. Accepting writes the key, and `computeTargets` returns the new calories.
  2. Declining writes nothing.
  3. The guardrail still fires below 70% of the estimate.
  4. A valid estimate whose window spans 14–20 days shows no prompt (DOM count 0); the same fixture extended to 21 days shows it (count 1).
- **Test plan:** new `test-calorie-checkin.js`. Sabotage: drop the 21-day span check, and criterion 4 must fail. **Risk:** a new stored key (approved, D5), and targets everywhere change. **Files:** `index.html`, `sw.js`, the test.
- **Status:** ready (after BL-17, and no sooner than 21 days after BL-17's merge) (owner yes 2026-11-08, D5). A run that picks it first checks BL-17's merge date on `origin/Branch-1`; if it's under 21 days, skip it as if it weren't ready.

### BL-28: Saved meals
- **Why:** MacroFactor and Cronometer offer saved meals (research §5). There's no equivalent here. "My Foods" (`custom-foods`, 35002) holds single items only.
- **Change:**
  - "Save as meal" on the current day's log, storing `{name, items[]}` under a new key, `saved-meals`.
  - Saved meals list inside My Foods. Tapping one adds all its items through `addFoodToLog` (37413).
- **Acceptance criteria:**
  1. Saving 3 items and re-adding the meal adds 3 entries with the same macros.
  2. Deleting a meal leaves the logged days untouched.
  3. *(Owner yes, 2026-11-08)* A JSON backup made with one saved meal, restored into an empty store, gives back the same `saved-meals` value.
- **Test plan:** new `test-saved-meals.js`. **Risk:** a new stored shape, and the backup/restore round-trip. **Files:** `index.html`, `sw.js`, the test.
- **Status:** ready (owner yes 2026-11-08, D5). The new `saved-meals` key is approved; criterion 3 checks it survives backup and restore.

### BL-29: Import history from Strong or Hevy CSV
- **Why:** this is what lets someone with years of history switch (research #5).
- **Constraint:** history is keyed by program slot position (`exKey` 26990), so imported sets have no natural slot.
- **Change** (re-scoped to the owner's answer, D6, 2026-11-08: a **separate "Imported" archive** that feeds PRs and e1RM, never the program slots):
  - A parser for the CSV.
  - A review screen mapping names to `exerciseInfo`, with unmatched names listed.
  - Matched sets are written to a separate, namespaced archive (for example `imported:<exercise-slug>`), in the same `{date, sets}` entry shape the `ex:` logs use. **Nothing is written to any `ex:` slot key**, so progression, suggestions and the deload clock (which read slot logs) never see imported sets.
  - `readExCorpus` (41211 at v3.523) also reads the archive, labelled "Imported (Strong)" or "Imported (Hevy)", so `groupCorpusByExercise` (41684), `reconstructAllPRs` (41838) and the e1RM charts pick it up through the existing path. No parallel PR or chart code.
  - The archive is included in the JSON backup, and one "Remove imported history" action deletes every `imported:` key and nothing else.
- **Acceptance criteria:**
  1. A sample file maps known names, and lists unknown names without writing them.
  2. After an import, the count of `ex:` keys and their values are byte-identical to before.
  3. An imported set heavier than any logged set for the same exercise appears as a PR event from `reconstructAllPRs`, with the "Imported" label.
  4. "Remove imported history" leaves 0 `imported:` keys, and `reconstructAllPRs` returns the pre-import events.
- **Test plan:** `test-strong-hevy-import.js`. The fixture is a few rows cut from a real export if the owner has sent one (trimmed, with nothing personal beyond exercise names, dates and sets, since the repo is public). If none has arrived, the fixture follows the column headers documented by Strong's and Hevy's own help pages, cited in the test, and the PR says "not yet checked against a real export". Sabotage: write the matched sets to the slot key, and criterion 2 must fail.
- **Risk:** a new stored archive (approved, D6) and a new reader in `readExCorpus`, so every corpus consumer sees more entries. Guarded by `test-pr-timeline.js` and the corpus suites that extract `readExCorpus`; re-grep them. Strong's and Hevy's exact CSV formats are unverified.
- **Status:** ready (owner yes 2026-11-08, D6: a separate "Imported" archive). The owner may send one Strong or Hevy export file to test against.

### BL-30: The per-muscle ledger on Today
- **Why:** seeing "Chest 6 / 10" before leaving the gym is the audit's §5 differentiator against Fitbod. It builds on BL-20.
- **Change:** a compact ledger strip on Today for the active program's trained muscles this week.
- **Acceptance criteria:** after logging 3 bench sets today, the strip updates without a reload.
- **Test plan:** extend `test-muscle-ledger.js`.
- **Risk:** Today is the owner's most-seen screen.
- **Tools:** `impeccable layout`, `dataviz`.
- **Summit note (summit 2026-11-07):** The summit recommends **no**: keep the ledger in Progress. Today keeps one answer per screen (design-vision §9; summit R8).
- **Status:** parked (owner no 2026-11-08, D3). The ledger stays in Progress (BL-20); Today keeps one answer per screen.

### BL-31: Weekly ±1-set rule per muscle, from your own performance
- **Why:** this is RP's core feature, at $34.99 a month (research §1). Here it's free and performance-driven [PEL][ROB24].
- **Change:** at week end, per muscle:
  - if every set hit its target reps at or below its RIR target, add 1 set next week, capped at +4 over the block;
  - if reps fell at the same load, remove 1 set.

  The state lives in `window.storage` under `muscle-volume-adj`. It applies render-time after `applyAccumulation`, only on the BL-01 allowlist.
- **Spec refresh 3 (written to the full format; the item had two criteria and no Files line):**
  - **Definitions.** Per muscle, from BL-20's `computeWeeklyMuscleSets` and its `EXERCISE_MUSCLES` primaries only (synergist credit never triggers a change):
    - *met:* every working set of the muscle's primary exercises last week reached the bottom of its rep range, and every set with a logged RPE was ≤ `10 − bottom of BL-10's RIR band` (strength tier: RPE ≤ 8). If no set had an RPE logged, the week **doesn't** count as met (no add on reps alone).
    - *fell:* for any primary exercise, the top set's reps at the same weight were lower than the week before.
    - Fell wins over met. Neither: no change.
  - **Applying.** `computeMuscleSetAdjust(corpus, weekStartKey, prevAdj, program)` (pure) returns the new map `{muscle: n}` with n clamped to −1…+4 over the block; the map resets to `{}` at the start of each block and in the deload week (`isDeloadWeek`, 14969). `applyMuscleSetAdjust(exercises, adj, program)` (pure) adds or removes n sets on that muscle's **first** primary exercise of the day, using `replaceSetCount` as `applyAccumulation` (26820) does, never below 1 set, and marks the row `muscleAdjusted: {n, reason}`. It returns the list unchanged when `volumeModifiersApply(program)` (26792, BL-01) is false.
  - **Showing the reason** (owner's condition): the row's sets text gets the same kind of suffix `accumulated: true` produces, e.g. "+1 set: every chest set hit its target at RPE 8 or less last week".
  - `renderWorkout` calls `applyMuscleSetAdjust` once, right after `applyAccumulation`; it can't be driven in jsdom, so that's a one-site call count.
- **Acceptance criteria** (real `computeMuscleSetAdjust`, `applyMuscleSetAdjust`, `applyAccumulation`, BL-20's tables, stub `window.storage`):
  1. A fixture week where every chest primary set met target with RPE ≤ 8 gives `{chest: 1}`, and the next week's strength d1 shows Bench Press with one more set than after `applyAccumulation` alone, with the reason text.
  2. A week where Bench's top set fell from 6 to 4 reps at 160 lb gives `{chest: −1}` (or one lower than before), never below 1 set on the row.
  3. Five met weeks in a block cap at +4; the deload week returns `{}` and the row is unchanged.
  4. A week with no RPE logged gives no add.
  5. `applyMuscleSetAdjust` on a `MEDICAL_STYLES` program, and on any program where `volumeModifiersApply` is false, returns the list byte-identical.
  6. Real-call count: `renderWorkout` (comments stripped) calls `applyMuscleSetAdjust(` exactly once, after `applyAccumulation(`.
- **Test plan:** new `test-muscle-set-autoreg.js`. Sabotage: drop the RPE condition, and criterion 4 fails; drop the clamp, and criterion 3 fails.
- **Files:** `index.html` (the two functions beside `applyAccumulation` 26820; the call in `renderWorkout`; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-muscle-set-autoreg.js` (new). Guards: `test-accumulation-accessory-add.js` and `test-volume-modifier-gate.js` (both extract `applyAccumulation`), `test-muscle-ledger.js` (BL-20), `test-program-cycle-start-backfill.js` (BL-33's block clock), and the suites that pin `renderWorkout` source (BL-10's list).
- **Risk:** this stacks with accumulation, deload and session-length trimming (`applySessionLengthLimit` may drop the adjusted row on a short day; that's acceptable and the test notes it). Adding a set changes no history key (sets are within one row).
- **Status:** ready (after BL-20 and BL-33) (owner yes 2026-11-08, D3). Each added or removed set is shown with its reason, as the owner was asked. Slot 58, after the ledger (BL-20) and BL-33.

### BL-32: Readiness changes the session, not just the note
- **Why:** research #3: "the suggestion lands in the set chips". This builds on BL-09 and BL-21.
- **Change** (re-scoped to the owner's answer, D3, 2026-11-08: **a one-tap option, never automatic**):
  - When `computeReadiness` (47085 at v3.523) returns `caution` for today, the readiness note (`formatReadiness`, 47126) carries one "Make today easier" button. Nothing about the session changes until it's tapped.
  - Tapping stores today's date key in `window.storage` (for example `easier-day`). While that equals today, the day's RPE target from `rpeTargetFor` (27511) is capped at 8 at render time, so RPE-mode loads (`computeSuggestedSet`, 27967) follow it, and the badge says why: "Capped at RPE 8: you chose an easier day (<the readiness flags>)". Lower targets, such as BL-02's clinical caps and the deload week, stay as they are.
  - The choice lapses on its own the next day. An "Undo" on the same note clears it for today.
- **Acceptance criteria:**
  1. With `caution`, RPE mode, week 4 (RPE 9) and no tap: the badge shows RPE 9 and the note shows the button (count 1).
  2. After a real click on the button: the badge shows RPE 8 and the reason, and `window.storage` holds today's date key.
  3. With the stored key set to yesterday: RPE 9 again.
  4. With readiness `good` or `note`: no button (count 0).
  5. A clinical day already capped at 7 stays at 7 after the tap.
- **Test plan:** extend `test-readiness-hrv.js` (BL-21's suite), with the real `computeReadiness`, `formatReadiness`, `rpeTargetFor` and a stub `window.storage`. Sabotage: apply the cap whenever readiness is `caution`, without the stored key, and criterion 1 must fail.
- **Risk:** the readiness note's layout and Today's Priorities. Suggested loads change only on a day the owner taps the button. Guarded by `test-rpe-safety-caps.js` (clinical caps) and BL-21's suite.
- **Status:** ready (after BL-21) (owner yes 2026-11-08, D3: one-tap "make today easier", not automatic).

### BL-33: Deload clock counts only weeks you actually trained (M-6, part 1)
- **Why:** `getMesocycleWeek` (14958) counts calendar weeks from `program-cycle-start` (14966: `Math.floor(daysSince/7) + 1`). A week off still advances the block toward the deload [BELL23].
- **Change:**
  - The week number is (the number of **completed** 7-day blocks since `program-cycle-start` that hold ≥ 2 session dates) + 1. The block in progress always counts as the current week, however many sessions it has so far.
  - A session date is a date in `activity-dates` (13972; "any day a set was logged", pruned at 730 days, which is far longer than any block). No new storage.
  - `isDeloadWeek` (14969) and the manual override (`manualDeloadEnabled`) are unchanged; they read the new number.
- **Acceptance criteria** (real `getMesocycleWeek` and `isDeloadWeek`, stub `window.storage`, fixed `getTodayKey`):
  1. Start Monday; blocks 1 and 2 have 3 session dates each; block 3 has none; block 4 has 2; today is in block 5 → week 4 (the old rule gives 5, a deload week), and `isDeloadWeek()` is false.
  2. A block with 1 session doesn't count.
  3. No `activity-dates` key: the result equals the old calendar rule for the first block (week 1) and never throws.
  4. With `manualDeloadEnabled` true, `isDeloadWeek()` is true regardless.
- **Test plan:** extend `test-program-cycle-start-backfill.js` (it extracts `getMesocycleWeek`). Sabotage: count every calendar block, and criterion 1 fails.
- **Files:** `index.html` (`getMesocycleWeek` 14958–14968, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-program-cycle-start-backfill.js`. Guards: `test-manual-deload-override.js` (extracts `getMesocycleWeek`; its fixtures have no `activity-dates`, so re-read them: if one expects week 5 from calendar days alone, it now needs session dates in its fixture, re-pinned with a dated note), and the nine suites that read `DELOAD_CYCLE_WEEKS` (BL-43's list plus `test-mesocycle-phase-tag.js`, `test-today-priorities.js`), which stub the week.
- **Risk:** the owner's current week number may jump on the day it ships (accepted).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. The rule is now defined precisely (completed blocks with ≥ 2 session dates, plus the block in progress; read from `activity-dates`), with real-invocation criteria; `test-manual-deload-override.js` is named as a likely re-pin. Scope unchanged.
- **Status:** ready (owner yes 2026-11-08, D3). The owner accepted that the current week number may change the day this ships; the What's New line says so. Slot 57, right after the ledger.

### BL-34: e1RM uses logged RPE (M-4)
- **Why:** `estimated1RM` (27431) treats every set as taken to failure. 100×8 @ RPE 7 is about 10% under.
- **Change** (re-scoped to the owner's answer, D3, 2026-11-08: **RPE-mode load targets only; PR history and e1RM charts stay put**):
  - `buildPastSessions` (27660 at v3.523) also returns the top set's own logged `rpe` (an added field; nothing else changes shape).
  - `recentBestE1RM` (27525), which only feeds RPE mode's `rpeCtx.e1rm` (28938), uses e1RM = w × (1 + (reps + 10 − RPE)/30) when that RPE is logged (6–10), with the same 15-rep ceiling `loadForRpeTarget` (27456) enforces. Without a logged RPE it falls back to `estimated1RM`.
  - `estimated1RM` (27535) itself is **unchanged**, so `reconstructAllPRs`, the e1RM charts and every other caller (29171, 31634, 31901, 41603, 41765, 41857 at v3.523) give the same numbers as before.
- **Acceptance criteria:**
  1. `recentBestE1RM` over one session with a top set of 100×8 @ RPE 7 returns 137; the same set with no RPE returns 127.
  2. `estimated1RM(100, 8)` still returns 127.
  3. `reconstructAllPRs` over a fixture whose sets carry RPE returns the same events (dates, types and `e1rm` values) as before the change.
  4. In RPE mode, week 2 (RPE 8), a prior top set of 100×8 @ RPE 7 gives a suggested 8-rep load from the adjusted e1RM (137), not from 127.
- **Test plan:** new `test-rpe-adjusted-e1rm.js`, with the real `buildPastSessions`, `recentBestE1RM`, `estimated1RM`, `loadForRpeTarget` and `reconstructAllPRs`. Sabotage: put the RPE adjustment inside `estimated1RM`, and criterion 3 must fail.
- **Risk:** RPE-mode load targets rise for anyone who logs RPE below 10. Guarded by `test-rpe-safety-caps.js` (clinical caps still bound the target), `test-progress-badge-rpe-teal.js`, `test-pr-timeline.js` and `test-performance-delta-colours.js`.
- **Status:** ready (owner yes 2026-11-08, D3: RPE-mode targets only; PR history stays put).

### BL-35: Replace Neck Bridges with a 4-way neck isometric (SAF-4)
- **Why:** Neck Bridges, "bridge onto the top of your head", unsupervised. They appear **6 times**: grappling d6 (`index.html` 11056) and five grappling day-count variants (21282, 21320, 21363, 21413, 21464). No trial supports either option for injury prevention [PRAC]. BL-05b fixes the cue in Phase 0; this item replaces the exercise.
- **Change:** rename every one of the 6 slots to "4-Way Neck Isometric (hand or band)", 4 directions × 15 s each at about 50% effort, with a new `exerciseInfo` entry in `content-exercises.js`. Old neck-bridge sets are **not moved** (owner, 2026-11-08, option (b)): the isometric logs under its own `:sub:<slug>` key with fresh history, and the old sets stay at the plain key, reachable through the substitute picker.
- **Spec gap found in the 2026-11-08 refresh (why this is `needs-owner` again):** the archive can't be done as written.
  - Exercise logs carry no exercise name: an entry is `{date, sets}` (`index.html` 28234), and the dated `workout:` record holds only check-box booleans (29237).
  - The slot key is `ex:grappling:<day>:<idx>` (`exKey`, 27027), with **no day-count segment**. The same key means different exercises in different variants: `d5` is Neck Bridges in the 4-day variant but the Rear Naked Choke / Armbar day in the base program.
  - So a `runMigrations()` step (`SCHEMA_VERSION` 8 at 7625) can't tell which stored logs were neck bridges. Moving every key at those positions would archive other exercises' history; moving none leaves the old sets under the new name (`readExCorpus` names history by the current slot).
- **Options for the owner:**
  - (a) Archive only the logs at the Neck Bridges position **of the day count selected at migration time**. Logs made under a different day count stay where they are and may show under the new name.
  - (b) Move nothing. The new isometric logs to its own variant key (the `:sub:<slug>` suffix `exKey` already uses for substitutes), so it starts with a fresh history and the old sets stay at the plain key, reachable by switching the slot back through the existing substitute picker (Neck Bridges stays in `EXERCISE_SUBS` as the alternative). No migration, no data-shape change.
- **Acceptance criteria (for either option):**
  1. All 6 slots (counted by walking `programs.grappling` and its `PROGRAM_DAY_COUNT_VARIANTS`) render the new name, and the real `buildDetailsHtml` renders its cues; no slot still names Neck Bridges.
  2. Each slot's index and `sets`-string shape (`4×15s`-style time prescription, `noWeight:true`) is fixed by the test.
  3. (a) A real `runMigrations()` run over a fixture with logs at the 4-day `d5` neck position **and** at the base `d5` RNC position archives only the one matching the stored day count. (b) The real `exKey` for the new slot differs from the old plain key, and a fixture log at the old key is still returned for Neck Bridges through the substitute path.
  4. `test-concise-cues.js`'s pin moves to 322 exercises (+1) and the matching cue total.
- **Test plan:** new `test-neck-isometric-swap.js`; for (a), a migration test in the same file.
- **Files:** `content-exercises.js` (new entry; 350 stays for history), `index.html` (11056, 21282, 21320, 21363, 21413, 21464; for (a) also `SCHEMA_VERSION` 7625 and `runMigrations` 9084; for (b) `EXERCISE_SUBS` 13709), `sw.js`, the test, `test-concise-cues.js` (pin), `test-configurable-training-days.js` (line 820 checks that Neck Bridges is **absent** from the grappling 6-day d7; it passes either way, but it should name the new exercise so the guard keeps its meaning).
- **Risk:** history is keyed by position, so the old neck-bridge log could show under the new name (option (a)'s residue). BL-04's Neck Bridges substitute becomes moot.
- **Alignment note (2026-11-07):** sequenced directly after Phase 0 (roadmap slot 8) once approved, not at the tail of Phase 4 (exercise-auditor B1).
- **Status:** ready. Owner chose **(b)** on 2026-11-08: move nothing; fresh history for the isometric. Build only the (b) parts below; ignore everything marked (a).

### BL-36: Add a "Drop Landing" progression to the ACL-risk watersports days (SAF-5, part 2)
- **Why:** landing prerequisites come before depth jumps [PRAC]. Wakeboarding's own basis cites a 42% ACL-tear rate.
- **Change:**
  - Append `{name:'Drop Landing (stick it)', sets:'3×5', noWeight:true}` to the end of `WATERSPORTS_STYLES.wakeboarding.days.d1` (Depth Jump at `index.html` 12634) and `WATERSPORTS_STYLES.kiteAssisted.days.d2` (12701). Appending is safe for history on those day sets.
  - Add a `'Drop Landing (stick it)'` entry to `content-exercises.js` (category `jump`, so BL-01's jump rule never adds goal sets to it), with ≤ 24-word cues. `test-watersports-program.js` requires every exercise to resolve to a real library entry.
  - Optionally add it to `EXERCISE_MOVE` (13603) for its icon; without an entry it falls back like any unlisted exercise.
- **Acceptance criteria:**
  1. The last exercise of those two base days is Drop Landing; every earlier exercise's name, `sets` and index is unchanged.
  2. The real `buildDetailsHtml({name:'Drop Landing (stick it)'})` renders its cues.
  3. The 10 day-count variant days that also carry Depth Jump (wakeboarding 2/3/4/6/7-day d1; kite 2-day d3 and 3/4/6/7-day d2) are **unchanged** in this version (asserted, so the scope is explicit).
- **Test plan:** extend `test-watersports-program.js`. Update `test-concise-cues.js`'s pin (+1 exercise, + its cue count) and name it in the PR. Sabotage: drop the append, and criterion 1 must fail.
- **Files:** `index.html` (12634 area, 12701 area), `content-exercises.js` (new entry), `sw.js`, `test-watersports-program.js`, `test-concise-cues.js` (pin).
- **Risk:**
  - Sessions get about 4 minutes longer.
  - Appended slot indexes are not unique across day-count variants (`exKey` has no day-count segment), so a person who later switches day count may see another exercise's history at that index. That's existing behaviour for every appended slot, not new here.
- **Alignment note (2026-11-07):** the prerequisite *rule* now lives in BL-05's Depth Jump cue ("first 4 weeks: do Drop Landing 3×5 instead"), because an appended drill comes **after** the depth jumps, the wrong order for a prerequisite (exercise-auditor N5). This item only makes the drill loggable.
- **Spec refresh (2026-11-08):** owner decision D4 (2026-11-07) approved this item, so it's `ready` at roadmap slot 9. Added: the library entry, the `jump` category, the `Files:` re-pin and criterion 3. **Open for the owner, not blocking:** the item names only the base days, so people on another day count get the cue but no loggable drill. Covering the 10 variant days would be a follow-up item.
- **Status:** ready (after BL-72) (owner 2026-11-08: BL-72 protects custom, body-goal and bonus history before any exercise is added to a day).

### BL-37: Rebuild the low day-count variants (H-3)
- **Why:**
  - Measured on the real `PROGRAM_DAY_COUNT_VARIANTS` (16231) at v3.524, direct sets per week:
    - **Bodybuilding 3-day** (16586) is Push/Pull/Legs once through: chest 3, lats 3, hamstrings 2, glutes 0. Every muscle is trained 1×/wk.
    - **Bodybuilding 2-day** (16553): hamstrings 0, side delts 2.
    - **Bodybuilding 4-day** (16624): lats 3, upper back 3, rear delts 0.
    - **Powerlifting 3-day** (17116): squat, bench and deadlift each 1×/wk.
  - Hypertrophy needs about 10 or more sets per muscle per week [ACSM26]. The dose-response is steepest from low to moderate volume [PEL]. With few sessions, spreading volume across them adds volume [FREQ19]. Strength gains track frequency even after volume is accounted for [PEL].
  - The file's own comment above `PROGRAM_DAY_COUNT_VARIANTS` (16207–16230) says "every LOW day count below is full-body"; Bodybuilding 3-day isn't.
- **Change** (four variants; every other variant and every base program is untouched):
  - **Bodybuilding 3-day → Full Body A/B/C.** Training days stay `d1`, `d3` and `d5`; the rest days, plates and notes are unchanged. No supersets.

    | Day | `sub`, `duration` | Exercises (name, `sets`) |
    |---|---|---|
    | d1 | 'Full Body A', '~60 min' | Flat Bench Press 3×8-12; Squat 3×8-12; Lat Pulldown 4×10-12; Seated Leg Curl 3×10-12; Lateral Raise 3×12-20; DB Curl 3×10-15 |
    | d3 | 'Full Body B', '~65 min' | Romanian Deadlift 3×8-12; Incline DB Press 3×8-12; Cable Row 4×10-12; Bulgarian Split Squat 3×8-12/leg; Overhead Triceps Extension 3×10-15; DB Curl 3×10-15 |
    | d5 | 'Full Body C', '~60 min' | Leg Press 3×10-15; Pull-ups (or assisted) 4×6-12; Cable Fly 3×12-15; Lateral Raise 3×12-20; Triceps Pushdown 3×12-15; Calf Raise 3×10-15 |

    - Week: chest 9 (3×/wk), back 12 (lats and upper back, 3×), quads 9 (3×), hamstrings 6 (2×), side delts 6 (2×), biceps 6 (2×), triceps 6 (2×), calves 3. That meets H-3's targets.
    - Bulgarian Split Squat sits on d3, not d5, because `ACCUMULATION_ACCESSORY_POOL.bodybuilding.d5` (26868) appends Bulgarian Split Squat on peak weeks. The pool is keyed by `dayId`, so it applies to variant days too, and a day must not carry it twice. `d1`'s pool pick (Skull Crushers) doesn't duplicate anything on Full Body A.
    - `short`: 'Three full-body sessions, every muscle two or three times a week'.
    - `overview` (36 words): 'Three full-body sessions, A, B and C, so every major muscle is trained two or three times a week with 6 to 12 hard sets each. Still bodybuilding style: moderate-high reps and plenty of isolation work.'
  - **Bodybuilding 4-day (append only):**
    - d4 'Upper B' gains Lat Pulldown 3×10-12, then Face Pull 2×15-20. Duration '~65 min'.
    - d5 'Lower B' gains Seated Leg Curl 3×10-12. Duration '~60 min'.
    - Week: lats 6 (2×), rear delts 2, hamstrings 8 (2×).
  - **Bodybuilding 2-day (append only):** the audit gave no layout for 2-day, so this is the auditor's design within D4's approved scope. The owner can see it in the PR.
    - d1 'Full Body A' gains Seated Leg Curl 3×10-12. Duration '~65 min'.
    - d3 'Full Body B' gains Romanian Deadlift 3×8-12, then Lateral Raise 2×12-20. Duration '~70 min'.
    - Week: hamstrings 6 (2×), side delts 4 (2×).
  - **Powerlifting 3-day → one heavy lift plus one volume lift each day.** Slot 1 of each day is replaced; slots 0, 2 and 3 keep their name and `sets`.
    - d1 `sub` 'Squat Heavy + Bench Volume', '~60 min': Squat 5×5; **Bench Press 3×6** (was Pause Squat 3×3); Leg Press 3×8-10; Weighted Sit-up 3×12.
    - d3 `sub` 'Bench Heavy + Deadlift Volume', '~60 min': Bench Press 5×5; **Deadlift 3×3** (was Close-Grip Bench Press 3×5); Barbell Row 4×6-8; Triceps Pushdown 3×10-12.
    - d5 `sub` 'Deadlift Heavy + Squat Volume', '~65 min': Deadlift 5×3; **Squat 3×5** (was Deficit Deadlift 3×3); Romanian Deadlift 3×8; Hanging Leg Raise 3×10-12.
    - Each volume slot has its own history key, so it calibrates its own load rather than inheriting the heavy day's.
    - `short`: 'Three days: one lift heavy, one for volume, each lift twice a week'.
    - `overview` (41 words): 'Three days, each with one lift heavy and a second lift for volume, so squat, bench and deadlift each get two sessions a week. Keep the volume lift at about 70-75% of your heavy weight: fast reps, never a grind.'
  - **New library entry: `Seated Leg Curl`** (BL-38 and BL-39 reuse it; if one of them builds first, that item adds it and the others assert it exists):
    - In `content-exercises.js`, beside `'Leg Curl'` (line 258). Use the same `category` that `'Leg Curl'` has at build time (BL-59 may have moved it from `hinge` to `isolation-leg`). Three cues, each 24 words or fewer:
      - 'Line your knees up with the machine's pivot and lock the thigh pad down firmly.'
      - 'Curl to full bend, then lower slowly all the way to straight legs; the stretched position is what this version adds.'
      - 'Lean your chest slightly forward for a deeper hamstring stretch, keeping your hips on the seat.'
    - `EXERCISE_MOVE` (13630): `'Seated Leg Curl':'squat'`, the same icon as `'Leg Curl'` (13692).
    - `EXERCISE_SUBS` (13736): `'Seated Leg Curl': ['Leg Curl', 'Nordic Curl']`.
    - **Safety:** add `EXERCISE_REGION_OVERRIDE` (44107) `'Seated Leg Curl'` with the same regions as `'Leg Curl'` (`['Knee','Hip']`), and `EXERCISE_SUBSTITUTE_OVERRIDE` (44184) `'Seated Leg Curl': null`, as `'Leg Curl'` has. Without them, a resting knee isn't flagged.
    - `EXERCISE_MUSCLES` (BL-20): `p:['hamstrings']`.
    - Why a new name rather than a second "Leg Curl": seated beats lying for hamstring growth because of the stretched hip position [LEN], and the base Bodybuilding d5 (BL-38) already has a "Leg Curl".
  - **Migration** (owner D4: one migration per version). `SCHEMA_VERSION` (7632) goes up by one from whatever BL-52 shipped; expected 11 (BL-72 9, BL-52 10). The new `if(version < N)` block goes after the v8 comment (9409–9414) and before the final write (9416–9424), wrapped in `try{}catch(e){}` like its siblings.
    - **Scope:** only BL-52's variant-scoped keys for the four changed variants: Bodybuilding v2, v3 and v4 and Powerlifting v3. Build every key with BL-52's real key function (`exKeyForLocation`, 27144, with BL-52's variant field), never a hand-written string, so the block follows whatever shape BL-52 shipped. Base-program keys, legacy (pre-BL-52) keys and every other variant are never read or written.
    - **Expected names per day:** the new built-ins by index, plus the day's body-goal focus, custom and bonus exercises at their BL-72 stable keys (`slotIdOf`: `f-`, `c-` and `a-<slug>`).
      - Focus: the real `getBodyGoalFocusExercises` (32570) with the new day object. Read the profile from `'user-profile'` in its own `try`, as the v5 block does (9316–9320).
      - Custom: `getCustomExercises` (32559).
      - Accessory: `ACCUMULATION_ACCESSORY_POOL[program][dayId]` (26868).
    - **Rule per stored entry**, applied to plain and `:sub:` keys alike. Read the whole scope first, then write.
      1. No `n` (BL-51's name stamp) → stays. It can't be attributed.
      2. `n` equals the expected name at its own index → stays.
      3. Else, if a slot in the same variant expects `n` → move it there. Prefer the same day, then the first match in d1…d7 order. Move to the target's plain key, or to its stable key for a custom, focus or bonus name.
      4. Else → stays. BL-51's `entriesForExercise` ignores it for suggestions, and History lists it under `n`.
      - **Move mechanics:** append to the target, sort by date, then remove from the source.
        - If the target already holds an entry with the same date and the same `n`, the move already happened (a re-run after a crash): just remove it from the source.
        - Same date, different `n` → the entry stays, so `saveExSet`'s date lookup never sees two entries for one date.
      - After BL-72, nothing new lands at positions past the built-ins. Rule 3's stable-key targets only sweep strays: name-stamped custom, focus or bonus entries that BL-72 couldn't attribute (logged under another day count).
      - The block is idempotent: every moved entry lands where rule 2 keeps it.
    - **Substitute selections:** on each changed day, delete the `subSelectionKey` (27066, BL-52 shape) at every index whose authored name changed, using the frozen old layout below. A stale selection would otherwise swap the new exercise: `applyExerciseSubs` (27085) applies any stored name without checking it against `EXERCISE_SUBS`. The `:sub:` logs themselves are kept by the rule above.
    - **Frozen old layouts** (a literal in the block, because by then `PROGRAM_DAY_COUNT_VARIANTS` already holds the new ones):
      - BB v2: d1 [Flat Bench Press, Squat, Lat Pulldown, Lateral Raise]; d3 [Incline DB Press, Leg Press, Cable Row, DB Curl, Triceps Pushdown].
      - BB v3: d1 [Flat Bench Press, Overhead Press, Lateral Raise, Triceps Pushdown]; d3 [Lat Pulldown, Cable Row, DB Curl, Face Pull]; d5 [Squat, Leg Press, Leg Curl, Calf Raise].
      - BB v4: d4 [Incline DB Press, Cable Row, Lateral Raise, Triceps Pushdown]; d5 [Leg Press, Hip Thrust, Leg Extension, Calf Raise].
      - PL v3: d1 [Squat, Pause Squat, Leg Press, Weighted Sit-up]; d3 [Bench Press, Close-Grip Bench Press, Barbell Row, Triceps Pushdown]; d5 [Deadlift, Deficit Deadlift, Romanian Deadlift, Hanging Leg Raise].
    - **Not migrated, by design:**
      - Exercise overrides: `exOverrideKey` (46888) has no variant segment, and `applyExOverrides` (46914) already drops an override whose stored name no longer matches.
      - `workout:` check-box records and the current week's `weekCheckedKey` (26163): dated or weekly, not history.
    - **Prompt a backup export first,** as BL-52 does.
  - `WHATS_NEW` (7643, appended last): 'Stronger 2-, 3- and 4-day Bodybuilding plans, and a new 3-day Powerlifting week'. Bullets:
    - 'Bodybuilding 3-day is now three full-body sessions, so every muscle gets two or three workouts a week instead of one.'
    - 'Bodybuilding 2- and 4-day add hamstring, back and shoulder work at the end of some days.'
    - 'Powerlifting 3-day trains squat, bench and deadlift twice a week each: one heavy day, one lighter volume day.'
    - 'Your logged sets move with their exercise wherever the app can tell which exercise they were.'
- **Acceptance criteria** (real data and real functions via `testHelpers.js`):
  1. **Layouts:** for the four variants, each day's `(name, sets)` list deep-equals the tables above. Bodybuilding 1-, 6- and 7-day, Powerlifting 1-, 2-, 4-, 6- and 7-day, and every base program are byte-identical to a v3.524 JSON snapshot taken in the test.
  2. **Ledger:** using the real `EXERCISE_MUSCLES` (BL-20) and `parseSetCount` (26451) over the real variant days, direct primary sets and training days per week are at least:
     - BB 3-day: chest 9/3, back (lats ∪ upper back, each set counted once) 12/3, quads 9/3, hamstrings 6/2, side delts 6/2, biceps 6/2, triceps 6/2;
     - BB 4-day: lats 6/2, rear delts 2, hamstrings 8/2;
     - BB 2-day: hamstrings 6/2, side delts 4/2.
  3. **Frequency:** in PL 3-day, Squat, Bench Press and Deadlift each appear on exactly 2 training days.
  4. **Library:** the real `buildDetailsHtml({name:'Seated Leg Curl'})` (28531) renders its 3 cues. With Knee resting, `regionsForExercise('Seated Leg Curl', …)` contains `Knee`, and `suggestSubstitute` returns `null`, matching `Leg Curl`.
  5. **Migration** (real `runMigrations` over a fixture store using BL-52's key shapes and BL-51's `n`):
     - (a) an `n:'Squat'` entry at BB v3 d5 idx 0 moves to v3 d1 idx 1;
     - (b) an `n:'Overhead Press'` entry at v3 d1 idx 1 stays;
     - (c) an entry without `n` anywhere in scope is byte-identical afterwards;
     - (d) base keys (`ex:bodybuilding:d1:0`) and v6 keys are byte-identical;
     - (e) with `custom-ex:bodybuilding:d1 = [{name:'Dips'}]`, a stray `n:'Dips'` entry at v3 d1 idx 4 moves to the BL-72 stable key `…:d1:c-dips`;
     - (f) a selection `'DB Shoulder Press'` at v3 d1 idx 1 is deleted, while `'Incline DB Press'` at v3 d1 idx 0 (unchanged Flat Bench Press) is kept;
     - (g) a same-date, different-`n` collision leaves the entry in place;
     - (h) running the block twice (with `meta:schemaVersion` reset between runs) leaves an identical store;
     - (i) PL v3 `n:'Pause Squat'` entries stay at d1 idx 1, and `n:'Squat'` entries at d1 idx 0 stay.
  6. **End to end:** after migration, BL-51's real `entriesForExercise` on the v3 d1 idx 1 log returns only the moved Squat entries, so the real `computeSuggestedSet` (27970) bases the Squat row on Squat, never on Overhead Press.
- **Test plan:** new `test-low-day-variants.js`.
  - Criteria 1–4 run on the extracted constants. Criteria 5–6 run the real `runMigrations` in a vm sandbox with stubbed `window.storage`, the pattern `test-custom-exercise-style-scoping.js` uses (lines 32 and 104–110).
  - Sabotage 1: drop the `n` check (move unstamped entries too) → 5(c) fails.
  - Sabotage 2: skip rule 3 → 5(a) and 6 fail.
- **Files:**
  - `index.html`: 16553–16668 (BB 2-, 3- and 4-day), 17116–17153 (PL 3-day), 7632 (`SCHEMA_VERSION`), 9111–9425 (`runMigrations`), 13630 (`EXERCISE_MOVE`), 13736 (`EXERCISE_SUBS`), 44107 and 44184 (region and substitute overrides), `EXERCISE_MUSCLES` (BL-20), 7625 (`APP_VERSION`), 7643 (`WHATS_NEW`).
  - `content-exercises.js` (new entry), `sw.js` (`VERSION`), the new test.
  - **Re-pins:**
    - `test-concise-cues.js`: +1 exercise and +3 cues on whatever the pin is at build time (321/964 at v3.524);
    - `test-region-override.js`: the override key count (18 at v3.524) +1, and its sub/region key-equality case (line 154) gains the name;
    - BL-20's `test-muscle-ledger.js` coverage assertion (the new name needs an `EXERCISE_MUSCLES` entry);
    - BL-52's `test-variant-history-keys.js`, if it pins `SCHEMA_VERSION`.
  - **Guards (run them; expected unchanged):**
    - `test-configurable-training-days.js` (training-day counts, distinct overviews);
    - `test-concise-overviews.js` (222 variants, at most 45 words);
    - `test-exercise-substitution.js` (2 distinct alternates per `EXERCISE_SUBS` entry);
    - `test-accumulation-accessory-add.js`, `test-volume-modifier-gate.js`, `test-superset-all-programs-coverage.js`;
    - `test-custom-exercise-style-scoping.js`: it runs the real `runMigrations` without these globals, so the new block's `try` must swallow the missing references;
    - `test-import-backup-full-replace.js`.
- **Risk:**
  - A stored-data migration on the history store, limited to four variants' keys and to entries BL-51 stamped. Unstamped entries never move.
  - Sessions get longer on the 2-day (+10 min) and 4-day (+5–10 min) plans.
  - PL 3-day d5 is a heavy hinge day (Deadlift 5×3, then Romanian Deadlift 3×8, with Squat between them); the cues already cover bracing.
  - Exercise overrides on a changed index are dropped (existing name-guard), so the user re-applies them.
- **Tools:** `code-review` at high (migration on the history store).
- **Summit note (summit 2026-11-07):** Priority rises: BIZ-01's quick start may route a 3-day "gain" stranger to Bodybuilding 3-day, which the audit scores F (summit F5, R9).
- **Alignment note (2026-11-07, exercise-auditor B3):** summit R9's guard only covers quick-start "gain" with 3 days or fewer, so a stranger who picks the program by hand still lands on an F. BL-37 and BL-38 are now part of the **Phase 3 hard gate** before any public step (roadmap slots 74–75), unless the owner records an alternative, such as hiding the 2–4 day bodybuilding variants.
- **Spec refresh (2026-11-08, against v3.524):**
  - Re-grepped; written out in full: exact layouts, the library entry and its region safety, and the migration designed on BL-52's variant keys.
  - Found in the refresh:
    - `renderWorkout` keys custom, body-goal and bonus exercises by render index after the built-ins (28778, 28857), so a longer day moved their history. The owner approved BL-72 (2026-11-08) to fix that first.
    - A stored substitute selection applies to whatever now sits at its index (`applyExerciseSubs` 27085), so changed indexes clear theirs.
    - The audit's "Seated Leg Curl" didn't exist in the library.
- **Status:** ready (after BL-72, BL-52) (owner yes 2026-11-07, D4: before going public; one migration per version). Stays in the **Phase 3 hard gate**. It waits for BL-72 (stable keys for the custom, focus and bonus rows) and for BL-52's variant-scoped keys, because `exKey` (27054) has no day-count segment and its migration can't otherwise tell which stored logs belong to these variants (the same gap that sent BL-35 back to the owner). Re-grep every line number before building. *Original question:* "Rewrite the 2-, 3- and 4-day Bodybuilding and 3-day Powerlifting variants (slot changes; past logs on those variants need a migration)?"

### BL-38: Bodybuilding d6 becomes "Upper Detail", plus appends (H-4)
- **Why:**
  - The base Bodybuilding overview (9830) says "Every muscle is trained at least twice a week". By direct sets, chest (10 sets), quads (10), lats (4) and side delts (4) are each trained 1×/wk, and calves get 4 sets [FREQ19][PEL][ACSM26].
  - BL-12 fixes the copy first (slot 30). This item fixes the program.
- **Change** (base `programs.bodybuilding` only, 9829; the day-count variants are untouched):
  - **d6 rebuilt** (9895–9904). `label`, `plate` and `plateNum` unchanged; `sub` 'Upper Detail'; `duration` '~65 min'. Exercises in this order:
    - Incline DB Press 3×8-12
    - Lat Pulldown 3×10-12
    - Lateral Raise 4×12-20
    - Overhead Triceps Extension 3×10-12
    - Incline DB Curl 3×10-12
    - Standing Calf Raise 3×10-15
    - Incline Walk 20 min (`noWeight:true`)
  - **d4 append** (9856): a second 'Lateral Raise' entry, 2×15-20. Duration '~55 min'.
  - **d5 append** (9866): Seated Leg Curl 3×10-12, a lengthened-position curl [LEN]. Duration '~65 min'. It replaces the hamstring work d6 loses. The library entry comes from BL-37; if BL-38 builds first, add it exactly as BL-37 specifies.
  - **New library entry `Incline DB Curl`** (`content-exercises.js`, beside `'DB Curl'` at 234; `category:'arms'`):
    - Cues, each 24 words or fewer:
      - 'Set the bench at 45-60° and let your arms hang straight down behind your body.'
      - 'Curl without letting your elbows drift forward, then lower all the way to a full stretch every rep.'
      - 'Go lighter than your standing curl; the stretched start makes the bottom of each rep much harder.'
    - `EXERCISE_MOVE` `'Incline DB Curl':'curl'` (as `'DB Curl'`, 13696).
    - `EXERCISE_SUBS` `'Incline DB Curl': ['DB Curl', 'Cable Curl']`.
    - `EXERCISE_MUSCLES` `p:['biceps']`.
  - **Rewrite the code comment above d6** (9877–9894): it argues for d6's Cable Row and Romanian Deadlift, which this removes. The new comment gives the H-4 reasoning and this item's measured result.
  - **Overview** (9830, on top of BL-12's text): 'an arms-and-detail day' → 'an upper-body detail day'. BL-12's frequency sentence → 'Chest, back, shoulders and arms are trained twice a week; legs get one big session.' It stays at most 70 words and 3–5 sentences.
  - **Migration** (one version, one `SCHEMA_VERSION` step, expected 12 after BL-37's 11). Reuse BL-37's relocation helper and rules unchanged, with this scope and frozen old layout:
    - **Scope:** base Bodybuilding plain keys for d4, d5 and d6 only (`exKeyForLocation` with no variant).
    - **Old layout:**
      - d4 [Overhead Press, Lateral Raise, Rear Delt Fly, Cable Crunch, Hanging Leg Raise];
      - d5 [Squat, Romanian Deadlift, Leg Press, Leg Extension, Leg Curl, Calf Raise];
      - d6 [Cable Row, Romanian Deadlift, EZ Bar Curl, Rope Pushdown, Incline Walk].
    - **Results:**
      - `n:'Incline Walk'` at d6 idx 4 → d6 idx 6;
      - `n:'Romanian Deadlift'` at d6 idx 1 → d5 idx 1;
      - `n` Cable Row, EZ Bar Curl or Rope Pushdown → stay;
      - stray name-stamped custom, focus or bonus entries at the newly built-in indexes move to their BL-72 stable keys;
      - selections at d6 idx 0–6 are cleared where the name changed.
    - **Legacy (unstamped) entries never move.** They're the one case BL-37 doesn't have. Today BL-51 keeps unstamped entries for suggestions under the program's own day count, so legacy Cable Row sets at `ex:bodybuilding:d6:0` would feed the new Incline DB Press.
      - Fix it at read time, with no stored change: a constant `LEGACY_SLOT_NAMES` beside BL-51's `entriesForExercise`, mapping a plain slot key to the name its legacy entries belong to:
        - `ex:bodybuilding:d6:0`–`4` → the five old d6 names;
        - `ex:bodybuilding:d4:5`, `d5:6`, `d6:5` and `d6:6` → `null`. These were trailing custom, focus or bonus slots, so the owner of the entry is unknown.
      - Wherever BL-51 reads `e.n` (filtering and History labels), read `e.n ?? LEGACY_SLOT_NAMES[key]`. `undefined` keeps today's behaviour. `null` never matches a suggestion, and the entry is labelled by the slot as today.
      - BL-39 and BL-40 extend the same constant.
  - `WHATS_NEW`: 'Bodybuilding Day 6 is now an upper-body detail day'. Bullets:
    - 'Chest, back, shoulders and arms now get a second session each week.'
    - 'Extra side-delt sets on Day 4 and a seated leg curl on Day 5.'
    - 'Your old Day 6 sets stay in History under their own names.'
- **Acceptance criteria:**
  1. **Layout:** d6 deep-equals the list above. d4 and d5 equal their v3.524 lists plus the one appended entry each (every earlier `(name, sets)` and index unchanged). d1 and d2, and every Bodybuilding variant, are byte-identical to v3.524.
  2. **Ledger** (real `EXERCISE_MUSCLES` and `parseSetCount`, base week), direct sets/training days:
     - chest ≥10/2, lats ≥7/2, side delts ≥10/2, biceps ≥9/2, triceps ≥9/2, calves ≥7/2;
     - quads and hamstrings each on exactly 1 training day (d5), asserted so the copy below stays true.
     - **Correction to the old criterion:** H-4's layout doesn't train quads twice (d6 has no leg work), and hamstrings and upper back move from 2× to 1× because d6 loses its Romanian Deadlift and Cable Row. Frequency matters little once weekly volume is equal [FREQ19], so the layout is kept as approved and the copy says it honestly.
  3. **Overview:** the rendered overview contains 'twice a week' and 'legs get one big session', and no longer contains 'Every muscle is trained at least twice a week'.
  4. **Library:** the real `buildDetailsHtml` renders 3 cues for Incline DB Curl (and for Seated Leg Curl, if this item added it).
  5. **Migration** (real `runMigrations`, fixture store):
     - (a) and (b): the Incline Walk and Romanian Deadlift moves above;
     - (c) an unstamped entry at `ex:bodybuilding:d6:0` is byte-identical afterwards;
     - (d) variant keys are byte-identical;
     - (e) idempotent on a second run.
  6. **Read-time legacy rule:** with the default day count, an unstamped `ex:bodybuilding:d6:0` log gives the Incline DB Press row no "try adding weight" badge and no ghost load (real `buildProgressBadge` and `computeSuggestedSet` through `entriesForExercise`). An unstamped entry at `d4:5` gives the second Lateral Raise row nothing either.
- **Test plan:** new `test-bodybuilding-upper-detail.js`. Sabotage: remove `LEGACY_SLOT_NAMES['ex:bodybuilding:d6:0']` → criterion 6 fails.
- **Files:**
  - `index.html`: 9829–9910, 7632, the `runMigrations` block (after BL-37's), BL-51's `entriesForExercise` and its label reads, `EXERCISE_MOVE`, `EXERCISE_SUBS`, `EXERCISE_MUSCLES`, `APP_VERSION`, `WHATS_NEW`.
  - `content-exercises.js`, `sw.js`, the new test.
  - **Re-pins:**
    - `test-concise-cues.js` (+1 exercise, +3 cues; +2/+6 if Seated Leg Curl is added here);
    - `test-superset-all-programs-coverage.js` (line 77's anchor; it should stay identical, because no superTag is added, but confirm);
    - `test-concise-overviews.js` (`MUST_KEEP['programs.bodybuilding']`, whatever BL-12 left it as: keep /five-day/ and pin /legs get one big session/);
    - `test-muscle-ledger.js` (coverage);
    - BL-12's `test-copy-truth.js` (it pins the overview sentence this item replaces).
  - **Guards:**
    - `test-configurable-training-days.js` (line 90: `DAYS_PER_WEEK_ORIGINAL.bodybuilding` equals `programs.bodybuilding`);
    - `test-accumulation-accessory-add.js` (line 105: no pool pick duplicates its day: d4 DB Shoulder Press, d5 Bulgarian Split Squat, d6 Hammer Curl);
    - `test-program-overview.js`;
    - BL-51's `test-history-name-stamp.js`.
- **Risk:**
  - d6 goes from ~40 to ~65 min.
  - Hamstrings and upper back drop to 1×/wk, and quads stay at 1× (criterion 2).
  - A migration on base-program keys, limited to stamped entries.
  - The read-time map assumes unstamped base-key entries were logged on the 5-day default, the same assumption BL-51 makes.
- **Tools:** `code-review` at high (history and progression path).
- **Spec refresh (2026-11-08, against v3.524):**
  - Re-grepped and written out in full.
  - The "quads 2×/wk" criterion was wrong for H-4's own layout and is corrected (criterion 2).
  - Found in the refresh: "Incline DB Curl" wasn't in the library, and unstamped legacy entries on the replaced slots would feed the new exercises' suggestions under the default day count. That's fixed at read time, with no stored change.
- **Status:** ready (after BL-72, BL-52) (owner yes 2026-11-07, D4: before going public; one migration per version). Stays in the **Phase 3 hard gate**. Waits for BL-72 and BL-52 for the same reasons as BL-37, and builds after BL-37, whose relocation helper it reuses. *Original question:* "Replace Bodybuilding Day 6 with the 'Upper Detail' day (slot changes, needs a migration)?"

### BL-39: Append-only accessory volume: Strength & Size, Powerbuilding, Powerlifting (H-6, M-9)
- **Why:**
  - **Strength & Size** (9753), direct sets per week: chest 8, side delts 3, triceps 3, hamstrings 6 at 1×/wk.
  - **Powerbuilding** (10568): lats 3, side delts 3.
  - **Powerlifting** (10494): no rear-delt or upper-back isolation.
  - About 10+ sets per muscle for hypertrophy [ACSM26]. Lengthened-position choices (overhead triceps, seated leg curl) grow more [LEN].
- **Change** (append only, base programs only; every day-count variant is untouched):
  - **Strength & Size:**
    - d1 (9759–9764) + Lateral Raise 3×12-20; '~60 min'.
    - d4 (9784–9789) + Cable Fly 2×12-15, then Overhead Triceps Extension 3×10-12; '~65 min'.
    - d5 (9806–9810) + Seated Leg Curl 3×10-12; '~60 min'.
  - **Powerbuilding:**
    - d4 (10598–10602) + Pull-ups (or assisted) 3×6-10 (the library name; the audit wrote "Pull-ups"); '~60 min'.
    - d6 (10629–10634) + Incline DB Press 3×8-12, then Lateral Raise 3×15-20; '~55 min'.
  - **Powerlifting:** d5 (10531–10534) + Face Pull 3×15; '~55 min'.
  - Seated Leg Curl comes from BL-37. If this builds first, add it exactly as BL-37 specifies.
  - **Read-time guard (no stored change):** extend BL-38's `LEGACY_SLOT_NAMES` with `null` for each newly built-in index:
    - `ex:strength:d1:6`, `ex:strength:d4:6`, `ex:strength:d4:7`, `ex:strength:d5:5`;
    - `ex:powerbuilding:d4:5`, `ex:powerbuilding:d6:6`, `ex:powerbuilding:d6:7`;
    - `ex:powerlifting:d5:4`.
    - Until now those indexes held custom, body-goal or bonus exercises. `ex:strength:d1:6` is also the Strength 1-day variant's Triceps Pushdown, and the bonus Cable Fly on peak weeks (`ACCUMULATION_ACCESSORY_POOL.strength.d1`, 26868). Unstamped entries there must not feed the new exercises.
  - `WHATS_NEW`: 'More shoulder, chest, back and hamstring work in Strength & Size, Powerbuilding and Powerlifting'. Bullets:
    - 'A few exercises are added at the end of some days, about 5 minutes each.'
    - 'Nothing before them changes.'
- **Acceptance criteria:**
  1. **Layout:** on each of the 6 affected days, the appended entries are last, in the order above, with exactly those `sets`. Every earlier `(name, sets)` and its index is unchanged (snapshot), and so are the unaffected days and all variants. Counted by walking `programs`: 8 appended entries in total.
  2. **Ledger deltas** (real `EXERCISE_MUSCLES` and `parseSetCount`, before vs after; robust to BL-20's mapping):
     - Strength & Size: chest +2, side delts +3, triceps +3, hamstrings +3, with hamstrings on at least 2 training days; absolute chest ≥10 and hamstrings ≥9.
     - Powerbuilding: lats +3, chest +3, side delts +3.
     - Powerlifting: rear delts +3.
  3. **Suggestions:** with the default day count, the real `computeSuggestedSet` and `buildProgressBadge` (through `entriesForExercise`) give the new Strength d1 Lateral Raise row nothing from:
     - an unstamped Cable Fly log at `ex:strength:d1:6`;
     - an `n:'Cable Fly'` entry there.
  4. **No duplicates:** no `ACCUMULATION_ACCESSORY_POOL` pick duplicates an exercise now on its day.
- **Test plan:** new `test-accessory-appends.js`. Sabotage: drop `LEGACY_SLOT_NAMES['ex:strength:d1:6']` → criterion 3 (unstamped case) fails.
- **Files:**
  - `index.html`: 9753–9827, 10494–10552, 10568–10640, BL-38's `LEGACY_SLOT_NAMES`, `APP_VERSION` (7625), `WHATS_NEW` (7643).
  - `sw.js`, the new test.
  - **Re-pins:**
    - `test-superset-all-programs-coverage.js` (line 77): unchanged, since no superTag is added. Strength d4's Lateral Raise + Face Pull pair stays adjacent because the appends come after Face Pull.
    - `test-concise-cues.js`, only if Seated Leg Curl is added here.
  - **Guards:**
    - `test-accumulation-accessory-add.js` (line 105);
    - `test-configurable-training-days.js` (byte-identical `DAYS_PER_WEEK_ORIGINAL`);
    - `test-volume-modifier-gate.js` (these programs are in `VOLUME_MODIFIER_PROGRAMS`, so goal and accumulation sets apply to the appends too);
    - `test-lb-per-kg-consolidation.js` (it pins `parseEstimatedMinutes` on Back Squat only);
    - `test-muscle-ledger.js`.
- **Risk:**
  - About +5 min on each of the 6 days.
  - **History of custom, body-goal and bonus exercises:** BL-72 (built first) gives them stable keys, so these appends no longer move them.
  - Accumulation (+1–2 sets) also applies to the appends on peak weeks.
- **Migration (owner 2026-11-08: option (b)):** one `SCHEMA_VERSION` step (expected 13) runs BL-37's relocation helper, unchanged, over these 6 base days, so name-stamped sets move with their exercise. Unstamped sets never move.
  - **Scope:** the plain keys of strength d1, d4, d5; powerbuilding d4, d6; powerlifting d5.
  - **What it moves in practice:** name-stamped entries sitting at the newly built-in indexes (listed under the read-time guard) whose `n` isn't the appended exercise. Each goes to the slot or BL-72 stable key that expects its `n`.
  - **Dependency:** this needs BL-51's name stamps (`n`), and BL-37's helper.
  - **Added criterion 5:** with a fixture of an `n:'Cable Fly'` entry at `ex:strength:d1:6` and an unstamped one, the real `runMigrations` moves the first to `ex:strength:d1:a-cable-fly`, leaves the second byte-identical, and is a no-op on a second run.
- **Spec refresh (2026-11-08, against v3.524):**
  - Re-grepped.
  - Exact sets, durations and names (Pull-ups (or assisted), Seated Leg Curl).
  - Found in the refresh: appending is **not** fully history-safe here. The audit's rule missed the custom, body-goal and bonus slots that sit after the built-ins. Hence the read-time guard; the owner chose BL-72 plus option (b) on 2026-11-08.
- **Status:** ready (after BL-72; its migration step needs BL-51's name stamps and BL-37's helper) (owner yes 2026-11-07, D4: the appends; 2026-11-08: option (b)). Slot 84. *Original question:* "Append these accessories to your lifting programs (about +6 min on the affected days)?"

### BL-40: Hypertension isometrics and medical progression notes (M-7)
- **Why:**
  - **Hypertension:** isometric training ranked first for lowering resting blood pressure (about −8/−4 mmHg), and the wall squat was the top single exercise, in a network meta-analysis of 270 RCTs [BP23] (Edwards et al. 2023, BJSM 57:1317, doi 10.1136/bjsports-2022-106503).
  - **Osteoporosis:** supervised heavy resistance and impact training (5×5 at over 80–85% 1RM, twice a week for 8 months) was safe and raised spine and hip bone density in postmenopausal women with low bone mass [LIFT18] (Watson et al. 2018, JBMR 33:211, doi 10.1002/jbmr.3284).
  - **Achilles:** heavy slow resistance matched eccentric training for mid-portion Achilles tendinopathy at 12 and 52 weeks, with better compliance: 92% vs 78% [ACH15] (Beyer et al. 2015, AJSM 43:1704, doi 10.1177/0363546515584760).
  - The app's osteoporosis plan stays on bodyweight work and never names a path to load. Its own `editorNote` (`content-citations.js` 338) says so.
- **Change:**
  - **Hypertension d2, d5 and d6** (`MEDICAL_STYLES.hypertension`, 11454; d2 11465–11473, d5 11485–11493, d6 11494–11500): append `{name:'Wall Squat (isometric)', sets:'4×2 min (rest 1-2 min)', noWeight:true}` as the last exercise of each, so it runs three times a week, the trials' dose (owner 2026-11-08, option (b); Edwards et al. 2023). Durations: d2 and d5 '~30 min' → '~40 min'; d6 '~20 min' → '~30 min'.
  - **New library entry** `'Wall Squat (isometric)'` in `content-exercises.js`:
    - `category:'core'`: a static hold. It isn't a warm-up or compound pattern, so it gets no ramp and no accumulation, matching BL-59's rule for holds.
    - Cues, each 24 words or fewer:
      - 'Back flat on the wall, slide down until your knees bend about 90°, or stay higher if that is too hard.'
      - 'Breathe throughout; no breath-holding. The last 30 seconds should feel hard, never strained.'
      - 'Stop for chest pain, dizziness or a headache. If you can't hold 2 minutes, slide higher rather than stopping early.'
    - `EXERCISE_MOVE` `'Wall Squat (isometric)':'squat'`.
    - **Safety:** `EXERCISE_REGION_OVERRIDE` `['Knee','Hip']` and `EXERCISE_SUBSTITUTE_OVERRIDE` `null`. With `core` alone, a resting knee wouldn't be flagged.
  - **Text** (`USER_TEXT`, 11217; rendered by `buildBasisHtml`, 11360):
    - hypertension `basis` (11298) + ' Isometric holds such as the wall squat lowered resting blood pressure the most in a 2023 analysis of 270 trials. This plan uses them three times a week, as those trials did.'
    - osteoporosis `basis` (11302) + ' A 2018 trial (LIFTMOR) found closely supervised heavy lifting, 5 sets of 5 at about 80-85% of maximum, was safe and raised spine and hip bone density in women with low bone mass.'
    - osteoporosis `limits` (11303) + ' Heavier lifting can come later, but only with a physio or trained coach supervising; don't add load on your own.'
    - rehabAchilles `basis` (11318) + ' A 2015 trial found heavy slow calf raises (3 seconds up, 3 down, 3 times a week, building from 15 reps toward 6 as the weight rises) worked as well as heel drops, and people stuck with them better. Ask your PT whether that suits you.'
    - Update the comment at 11355–11356 that names the longest `limits` strings: osteoporosis becomes the longest.
  - **Sources** (`content-citations.js` `STYLE_SOURCES`; each `cites` stays at most 3, the rule `test-learn-rework.js` checks at line 31):
    - hypertension (324) + `{text:'Edwards et al. · Br J Sports Med, 2023', doi:'10.1136/bjsports-2022-106503'}`;
    - osteoporosis (338) + `{text:'Watson et al. · J Bone Miner Res, 2018', doi:'10.1002/jbmr.3284'}`;
    - rehabAchilles (394) + `{text:'Beyer et al. · Am J Sports Med, 2015', doi:'10.1177/0363546515584760'}`.
  - **No auto-progression:** BL-01's gate (`VOLUME_MODIFIER_PROGRAMS`) and BL-02's clinical caps already exclude medical styles. Nothing here adds load.
  - **Read-time guard:** extend `LEGACY_SLOT_NAMES` with `null` for `'ex:medical:hypertension:d2:3'`, `'…:d5:3'` and `'…:d6:2'`. Those indexes held only custom exercises until now.
  - **Migration (owner 2026-11-08: option (b)):** one `SCHEMA_VERSION` step (expected 14) runs BL-37's relocation helper over hypertension d2, d5 and d6 (plain medical-style keys), so name-stamped sets at those three indexes move to their custom exercise's BL-72 stable key. Unstamped sets never move. It needs BL-51's name stamps.
  - `WHATS_NEW`: 'Hypertension plan: a wall-squat hold, and clearer next steps for bone and Achilles plans'. Bullets:
    - 'A 4 × 2-minute wall squat ends Days 2, 5 and 6. Breathe throughout.'
    - 'The osteoporosis and Achilles plans now explain the supervised next step and what it's based on.'
- **Acceptance criteria:**
  1. **Layout:** the wall squat is the last exercise on hypertension d2, d5 and d6 (3 occurrences, counted by walking the style). Every earlier `(name, sets)` and index on those days is unchanged, and every other `MEDICAL_STYLES` day is byte-identical to v3.524.
  2. **Real render:**
     - `renderProgramSource()` (11341), with `activeProgram='medical'` and each of the three styles, renders the new sentences.
     - The osteoporosis limits text sits in the never-collapsed `.program-limits`; the basis sentences sit inside the collapsed `.program-basis`.
     - The rendered text contains no "cure" or "treat" wording.
  3. **Library:**
     - The real `buildDetailsHtml({name:'Wall Squat (isometric)'})` renders 3 cues, one containing 'no breath-holding'.
     - With Knee resting, the real region lookup flags it and `suggestSubstitute` returns `null`.
  4. **Gates:** for every goal and weeks 1–4, the real `applyGoalVolume`, `applyAccumulation` and `applyAccumulationAccessory` leave the wall squat at '4×2 min (rest 1-2 min)'. Only deload changes it.
  5. **Sources:** the research-sources view lists the three new cites with their DOIs.
- **Test plan:**
  - New `test-medical-progression-notes.js` (jsdom for criterion 2; extracted constants for the rest).
  - Sabotage 1: remove the region override → criterion 3 fails.
  - Sabotage 2: drop the limits sentence → criterion 2 fails.
- **Files:**
  - `index.html`: 11298–11319, 11355–11356, 11465–11500, `EXERCISE_MOVE` (13630), 44107, 44184, `LEGACY_SLOT_NAMES`, `APP_VERSION`, `WHATS_NEW`.
  - `content-exercises.js`, `content-citations.js` (324, 338, 394), `sw.js`, the new test.
  - **Re-pins:**
    - `test-concise-cues.js` (+1 exercise, +3 cues; add /no breath-holding/ to its `MUST_KEEP`);
    - `test-region-override.js` (key count +1, plus the key-equality case);
    - `test-research-sources-view.js` and `test-learn-rework.js`, if either pins cite counts.
  - **Guards:**
    - `test-volume-modifier-gate.js` (walks every `MEDICAL_STYLES` day × goal × week);
    - `test-rpe-safety-caps.js` (hypertension);
    - `test-concise-day-notes.js` (d5's note is unchanged);
    - `test-concise-overviews.js` (the hypertension overview is unchanged);
    - `test-citation-audit.js`.
- **Risk:**
  - A clinical plan's content and clinical copy change. **The cue, the three `USER_TEXT` sentences and the wall squat itself are on the clinician's review list before listing** (BIZ-15, D9(e)).
  - Isometric holds raise blood pressure during the hold. The trial populations were mostly unmedicated or controlled hypertension, so the existing clearance text in `limits` ("Get clearance before starting") stays first.
  - Rest timer: before BL-14 (slot 25), '4×2 min' reads as a 2-rep strength set (`getRepRangeTier`, 27811) and gets 240 s. After BL-14 it falls to the `core` default of 90 s, inside the 1–2 min the text gives.
  - Three sessions a week of isometric holds is the trial dose; the existing clearance text still comes first.
- **Owner (2026-11-08):** dose option (b), three times a week on d2, d5 and d6; history option (b), the relocation step above.
- **Spec refresh (2026-11-08, against v3.524):**
  - Re-grepped.
  - Exact text, the library entry and its region safety, sources with checked DOIs, and the gate criterion.
  - Found in the refresh: no "Wall Squat" existed in the library, and a `core` hold would not flag a resting knee.
- **Status:** ready (after BL-72; its migration step needs BL-51's name stamps and BL-37's helper) (owner yes 2026-11-07, D4: the appends; 2026-11-08: dose (b), history (b)). Slot 85. Its clinical text is also in scope for the clinician's review before listing (BIZ-15, D9(e)). *Original question:* "Add an isometric wall-squat block to the hypertension plan, and supervised-progression notes to the osteoporosis and Achilles plans?"

---

## Added in the alignment round (2026-11-07)

### BL-50: The AI prompts know the clinical style (SAF-9)
- **Why:** Cross-Metric Insights must answer PUSH, MAINTAIN or DELOAD (`index.html` ~42583). Both that prompt and the coach chat (~42670) receive only "Active program: Medically Modified", never the style (prenatal, ACL, hypertension) or its tolerance rule. So it can tell a prenatal or ACL user to PUSH (program-audit.md, Alignment addendum, SAF-9).
- **Change (prompt text only):**
  - Both prompts include `MEDICAL_STYLES[activeMedicalStyle].label` when `activeProgram === 'medical'`.
  - For medical styles, the insights prompt limits the verdict to MAINTAIN or DELOAD and adds "check with your care team". The coach chat's system text says the same.
  - **Leave `output_config.effort`, `max_tokens` and the rest of the payload untouched** (CLAUDE.md fragile area).
- **Acceptance criteria:**
  1. With `activeProgram='medical'` and the hypertension style, the real `generateCrossMetricInsights` call (with `fetch` stubbed at the network boundary) sends a prompt containing the hypertension style's label and "MAINTAIN or DELOAD", and doesn't offer PUSH.
  2. With the strength program, the prompt text is byte-identical to today's (a before/after snapshot).
  3. The coach chat payload for a medical style contains the style label and "care team".
  4. `test-ai-cross-metric-effort-fix.js` passes unchanged: `effort:'medium'`, `max_tokens:5000`, one `fetch` per call.
- **Test plan:** new `test-ai-clinical-context.js`, with `fetch` stubbed as in `test-ai-cross-metric-effort-fix.js`. Sabotage: drop the style label, and criterion 1 must fail.
- **Files:** `index.html` (~42536–42680), `sw.js`, the test.
- **Risk:** the AI path is a CLAUDE.md fragile area ("fixed, unverified against the live API"). Only the prompt strings change. Must land before any public step and before hosted AI (BIZ-14).
- **Tools:** `Skill: claude-api` (prompt wording only); `security-review` (it touches `fetch`).
- **Status:** ready

## Added in the spec refresh (2026-11-08): the builder's PR #63 flags

The builder's "Flagged, not fixed" notes on PR #63 (BL-01, v3.518), as small items. The RPE-ramp flag folded into BL-02 (its criterion 9) rather than becoming an item. Roadmap slots: BL-65 at 13a and BL-66 at 13b (after BL-07, so the coach's wording covers both BL-01 and BL-07); BL-67 runs outside the loop.

### BL-65: The coach's volume line matches the program gate (BL-01 follow-up)
- **Why:** builder flag, PR #63 (v3.518). `buildCoachChatContext` (`index.html` 42873) builds its volume line (43030–43040; the three literals at 43034, 43036 and 43038) from the goal alone. With goal "gain" on any of the 21 gated programs it tells Claude "the app is adding one set per exercise to their sessions", which has been false since BL-01; with goal "performance" it says compounds are capped at 3 sets, also false there. A coach told the app adds volume may advise against extra work the person actually needs, or explain a set count they don't see.
- **Change:**
  - Move the line into one pure helper, `goalVolumeContextLine(goal, program)`, beside `goalVolumeAdjustment` (26698). `buildCoachChatContext` calls it once.
  - When `!volumeModifiersApply(program)` (26789) and the goal is gain, lean bulk or performance: "Training volume: this program keeps its written set counts; the app doesn't add or cap sets by goal here. Don't assume extra goal volume."
  - On the four lifting programs and custom programs the text is unchanged, except that the performance line says what BL-07 made true: compounds in the hypertrophy rep range are capped at 3 working sets; heavy (≤ 5-rep) work and powerlifting and powerbuilding keep their sets.
  - The lose/recomp line is unchanged. Nothing else in the payload changes (CLAUDE.md fragile area: no `fetch`, `max_tokens` or `effort` change).
- **Acceptance criteria** (real invocations of the helper):
  1. `goalVolumeContextLine('gain','oly')`, `('gain','medical')` and `('performance','climbing')` contain "keeps its written set counts" and not "adding one set".
  2. `goalVolumeContextLine('gain','strength')` is byte-identical to v3.518's hypertrophy line (copied into the test as the snapshot), and so is a custom program key's.
  3. `('performance','strength')` mentions the hypertrophy-range cap and that heavy work keeps its sets.
  4. `('lose', <any program>)` equals v3.518's lose/recomp line; `('maintain','strength')` is `''`.
  5. `buildCoachChatContext` makes exactly 1 real `goalVolumeContextLine(` call, passing `activeProgram`, and contains no "adding one set" literal of its own (comments stripped).
- **Test plan:** extend `test-coach-chat-context.js`. It extracts `coachChatApiMessages` and `sendCoachChatMessage` today, not `buildCoachChatContext`, so add `extractFunction(src, 'buildCoachChatContext')` for criterion 5 and run the helper with `goalVolumeAdjustment`, `volumeModifiersApply`, `VOLUME_MODIFIER_PROGRAMS` and `isCustomProgramKey` (14786) in its chunks. Sabotage: drop the gate check, and criterion 1 must fail.
- **Files:** `index.html` (26698 area for the helper; 43030–43040), `sw.js`, `test-coach-chat-context.js`. No suite extracts `buildCoachChatContext` at v3.527, so nothing needs re-pinning.
- **Risk:** the AI path is a CLAUDE.md fragile area; only the prompt string changes. Guarded by `test-ai-cross-metric-effort-fix.js` and `test-coach-chat-context.js`.
- **Tools:** `Skill: claude-api` (prompt wording only).
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the test's missing extract named. Scope unchanged.
- **Status:** ready (after BL-07)

### BL-66: The phase tag stops saying "Accumulation" where no block sets are added (BL-01 follow-up)
- **Why:** builder flag, PR #63 (v3.518), foreseen in BL-01's Risk line. `mesocyclePhaseTag` (`index.html` 26811) labels weeks 1–4 "Week N of 5 · Accumulation" on every program. Its own comment says it names a phase only when `applyAccumulation` really implements it (26797–26810), and since BL-01 `applyAccumulation` does nothing on the 21 gated programs. The tag now makes the claim the comment forbids.
- **Change:**
  - `mesocyclePhaseTag(cyclePos, inDeloadWeek, program)`: outside a deload week, when `!volumeModifiersApply(program)`, the text is "Week N of 5" with no phase word. Deload weeks keep "· Deload" everywhere (deload still runs on every program).
  - The one call site, `renderWorkout` (28858), passes `activeProgram`.
- **Acceptance criteria** (real `mesocyclePhaseTag` with the real `volumeModifiersApply`, `VOLUME_MODIFIER_PROGRAMS`, `isCustomProgramKey`, `DELOAD_CYCLE_WEEKS`):
  1. `(3, false, 'medical')` → text `Week 3 of 5`, class `mesocycle-phase-tag`.
  2. `(3, false, 'strength')` and a custom program key → `Week 3 of 5 · Accumulation` (unchanged).
  3. `(5, true, 'medical')` → `Week 5 of 5 · Deload`, class `mesocycle-phase-tag deload` (unchanged).
  4. Every program in `Object.keys(programs)` outside the allowlist gets no "Accumulation" in weeks 1–4 (iterate; assert 21).
  5. `renderWorkout` makes exactly 1 real `mesocyclePhaseTag(` call, and it passes `activeProgram`.
- **Test plan:** extend `test-mesocycle-phase-tag.js`. Sabotage: drop the program check, and criteria 1 and 4 must fail.
- **Files:** `index.html` (26797–26815, 28858), `sw.js`, `test-mesocycle-phase-tag.js`. **Re-pins:**
  - `test-mesocycle-phase-tag.js` itself: its `tagFor` helper (line 21) calls `mesocyclePhaseTag(cyclePos, inDeloadWeek)` with two arguments, and its chunks (13–16) hold only `DELOAD_CYCLE_WEEKS` and the function. With a missing program the new rule drops "Accumulation", so its week-1 and week-3 cases (24–34) fail. Pass `'strength'` from `tagFor`, and add `VOLUME_MODIFIER_PROGRAMS`, `volumeModifiersApply` and `isCustomProgramKey` to the chunks.
  - `test-today-priorities.js` line 66 asserts the literal call `mesocyclePhaseTag(cyclePos, inDeloadWeek)`, which the new third argument breaks; update it to the three-argument form. Its line 63 pins the Deload template literal, so keep `Week ${cyclePos} of ${DELOAD_CYCLE_WEEKS} · Deload` written as is.
  - Name both in the PR.
- **Risk:** the day header. Guarded by `test-mesocycle-phase-tag.js`, `test-session-actions.js`, `test-up-next.js` and `test-today-priorities.js`.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the `test-mesocycle-phase-tag.js` re-pin found (its own fixtures call with two arguments). Scope unchanged.
- **Status:** ready

### BL-67: Guard: no exercise substitute crosses the jump category (BL-01 follow-up)
- **Why:** builder flag, PR #63 (v3.518). BL-01's jump rule in `applyGoalVolume` (`index.html` 26682–26684) reads `exerciseInfo[ex.name]` for the **authored** name, because goal volume runs (28647) before `applyExerciseSubs` (28720). If a slot's substitute had a different category, a jump substituted into a squat slot could take a goal set, and a squat substituted into a jump slot would lose one. At v3.518 **no `EXERCISE_SUBS` pair crosses the jump boundary** (checked with the real tables: 0 pairs), so nothing is wrong today. This item makes sure it stays that way, rather than moving the modifiers after substitution (a wider change with no current benefit).
- **Change:** test only. One data-integrity case in `test-exercise-substitution.js`, which already checks `EXERCISE_SUBS`: for every original and each of its alternatives, `(category === 'jump')` must be equal on both sides, using the real `exerciseInfo`. The failure message says what to do: either drop the pair, or move the jump check after substitution (`ex.__originalName` tells the two apart).
- **Acceptance criteria:**
  1. The new case passes at the current tables, and asserts that it compared at least 1 pair (so an empty table can't pass it).
  2. Sabotage: add a temporary `'Box Jump': ['Back Squat']` entry to the extracted table in the test, and the case fails naming that pair.
- **Test plan:** as above.
- **Files:** `test-exercise-substitution.js` only. No `index.html` or `sw.js` change and no version bump, so it runs **outside the build loop** (like TOOL-01): any planning or tooling PR may carry it.
- **Risk:** none to the app.
- **Status:** ready (outside the loop)

## Added from the exercise-consistency audit (2026-11-08)

The exercise-auditor's 18 items (PR #68), folded in by the project-manager on 2026-11-08. The evidence for each is in `planning/exercise-consistency-audit.md` (finding IDs S-x, D-x, C-x); source keys are there and in `planning/program-audit.md`. The auditor wrote them against v3.517. **Here every line number is re-grepped against `index.html` v3.518** (`origin/Branch-1` a502c29; BL-02 not yet merged), and every `Files:` line names the existing suites that extract or pin what the item touches. Those suites were found by grepping the 200 `test-*.js` files for each touched function or literal and reading their assertions. All 200 passed, and `check.sh` passed, at v3.518 before this fold-in.

**Fold-in changes to the auditor's text** (each also noted in its item as "Fold-in (2026-11-08)"):
- **BL-51** is marked `needs-owner`. It adds a field (`n`) to every new log entry, and this file's rule is that anything changing the owner's stored data shape asks first. It's additive like `distance` and `note` (no migration, no `SCHEMA_VERSION` bump), and the recommendation is yes. Its slot (9a) is right after Phase 0, so it builds the moment it's approved.
- **BL-48:** there's no `deloaded` marker to add. The "(deload)" suffix on the duration line (28704) already keys off `inDeloadWeek`.
- **BL-55:** the Analysis distance card (45650) also calls `isDistanceExercise`, so it must pass the sets string too.
- **BL-62:** the prenatal position fix rewrites the existing first cue instead of adding a fourth, so `test-concise-cues.js`'s exact cue count (964) holds. The Sandbag Lunges change covers all 7 occurrences, including the Hyrox day-count variants.
- **BL-63:** no existing suite tests `applySessionLengthLimit` (`test-session-actions.js` is CSS and layout only). Criterion 4 becomes a new real-function case. `test-lb-per-kg-consolidation.js` pins Back Squat 3×5 at 109 kcal through `parseEstimatedMinutes`, so it needs re-pinning.
- **BL-64** stays its own version rather than merging into BL-25 (one item, one version). Both edit Front Lever Hold (cx:171), so whichever builds second re-reads that entry.
- **BL-57:** `getDefaultRestSeconds` gains a dependency on `EXERCISE_MOVE`. Seven suites extract the real function, so each needs the constant in its chunks, or the read must be guarded with `typeof`.

### BL-51: New log entries record the exercise name, and suggestions ignore another exercise's entries (S-1, D-2, part 1)
- **Why:**
  - History keys are positional (`exKey`, `index.html` 27027). Day-count variants reuse `d1…d7` and the slot indexes, and yoga styles share `ex:yoga:` keys (`getExerciseLocationIndex` 27112 says so).
  - Measured by the auditor: strength 54/120, bodybuilding 81/94 and powerbuilding 47/112 variant slots read a different exercise's log at the same key. Yoga has 40/72 cross-style collisions.
  - Example: bodybuilding 6-day d5 slot 0 Incline DB Press reads Squat history, and suggests "try adding weight" from the squat load.
  - Entries store only `{date, sets}` (`normalizeExEntry` 27170, `saveExSet` 28308), so nothing can tell them apart today.
- **Change** (no migration, no key change):
  - `saveExSet` (28308) adds `n: <exercise name>` to each **new** entry: the slot's current `ex.name`, or the substitute's name for `:sub:` keys. The same additive rule as `distance` and `note` (28333–28340).
  - `normalizeExEntry` (27170) keeps `n` when present.
  - One helper, `entriesForExercise(log, name)`. It keeps entries with `n === name`. It keeps legacy entries (no `n`) **only when** `daysPerWeekPref == null` (25964, the program's own default) and, for yoga, `activeYogaStyle === 'flow'` (15810). Legacy entries anywhere else are ambiguous, so suggestions leave them out.
  - Callers: the `getExLog` (27175) reads that feed `buildPastSessions` (27567), `priorSetForSlot` (27836), `computeSuggestedSet` (27849), `buildProgressBadge` (27779), the heads-up (14553), the fit check (27610), `renderWorkout` (28722), and the `priorMax` PR check inside `saveExSet` (28316–28322).
  - History and Analysis still show every entry (no data hidden), labelled by `n` when present.
- **Acceptance criteria:**
  1. With a stored `ex:bodybuilding:d5:0` log of Squat entries (no `n`) and day count 6 active, the Incline DB Press row shows no "try adding weight" badge and no ghost load.
  2. With the default day count, the same legacy log feeds the Squat row exactly as today.
  3. A new set logged on that row writes an entry with `n:'Incline DB Press'`, and the next render uses it.
  4. A pre-existing entry with `n:'Squat'` at that key is ignored on the Incline row under any day count.
  5. The History view still lists every entry (count unchanged).
  6. A new set's stored `sets[i]` object is byte-identical to v3.518's (only the entry gains `n`).
- **Test plan:** new `test-history-name-stamp.js`. Use the real `saveExSet`, `normalizeExEntry`, `getExLog`, `entriesForExercise`, `buildPastSessions`, `buildProgressBadge` and `computeSuggestedSet`, with stubbed storage. No existing suite extracts the real `saveExSet`, so this is its first test. Sabotage: make `entriesForExercise` return the whole log, and criterion 1 must fail.
- **Files:**
  - `index.html`: 27170, 27175, 27567, 27779–27936, 28308–28345, the call sites 14553, 27610 and 28722.
  - `sw.js`, the new test.
  - **Guards (expected unchanged; run them and re-pin only if one breaks):**
    - `test-cross-program-history.js` and `test-cross-program-sets.js` (`priorSetForSlot`);
    - `test-next-set-recommendation.js` and `test-set-chips.js`;
    - `test-exercise-substitution.js`;
    - `test-import-backup-full-replace.js` (must round-trip `n`);
    - `test-configurable-training-days.js` (`daysPerWeekPref`);
    - the seven `wireSetsBlock` suites that stub `saveExSet` (`test-auto-check-sets.js`, `test-set-next-button.js`, `test-partial-set-reactions.js`, `test-fallback-entry-consolidation.js`, `test-backdating-rest-timer-suppression.js`, `test-superset-rest-timer-suppression.js`, `test-superset-shared-sets-block-wiring.js`).
- **Risk:** the progression path everywhere. The suites above guard it.
- **Tools:** `code-review` at high (progression path).
- **Fold-in (2026-11-08):** line numbers moved to v3.518. Status changed from ready to needs-owner, because a stored data shape changes. The `saveExSet` PR check and the byte-identical set criterion (6) were added.
- **Status:** ready (owner yes 2026-11-08: "51 a"). Slot 9a, before BL-08.

### BL-52: Variant- and style-scoped history keys, with a migration (S-1, D-2, part 2)
- **Why:**
  - BL-51 stops the wrong suggestions, but legacy logs under a variant stay ambiguous.
  - `parseExKey` (40977) resolves combat, cycling and watersports keys against the default style days, not the active variant.
  - Only a key change fixes the labels for good.
- **Change:**
  - Variant days write `ex:<program>[:<style>]:v<N>:<dayId>:<idx>` when `daysPerWeekPref` selects a variant. Yoga gains a style segment (`ex:yoga:<style>:…`).
  - `exKey` (27027), `subSelectionKey` (27040), `parseExKey` and `exKeyForLocation` (27117) learn both shapes.
  - A `SCHEMA_VERSION` (7632; 8 at v3.524, 9 after BL-72, so expected 10) bump, with a `runMigrations()` (9084) step that **copies nothing it can't attribute**:
    - entries with `n` move to the key whose slot holds that name;
    - legacy entries stay where they are.
- **Acceptance criteria:**
  1. Migrating a store with `n`-stamped entries for two day counts produces two keys, each matching its slot's name.
  2. Legacy entries are byte-identical after migration.
  3. `parseExKey` labels a v6 combat key with the v6 day's exercise.
- **Test plan:** new `test-variant-history-keys.js`, with the real `runMigrations` over a fixture store. Sabotage: drop the `n` check, and criterion 2 must fail.
- **Files:** `index.html` (7632, 9084, 27027–27045, 27117, 40977), `sw.js`, the test. **Re-pins:** `test-custom-exercise-style-scoping.js`, `test-import-backup-full-replace.js` and `test-whats-new.js` read `SCHEMA_VERSION` or `runMigrations`. `test-cross-program-history.js` and `test-watersports-program.js` call the key functions.
- **Risk:** a stored-data migration on the history store. A backup export is prompted first. Needs BL-51 shipped and some weeks of `n`-stamped data to be worth it.
- **Fold-in (2026-11-08):** placed before BL-37 (slot 73a), so the variant rebuild's own migration can attribute entries by name.
- **Status:** ready (after BL-51) (owner yes 2026-11-08: "52 a"; build only once BL-51 has stamped names for a few weeks, and before BL-37). Slot 73a.

### BL-53: Medical history reaches History, PRs and volume; the watersports fallback key (D-1, D-12)
- **Why:**
  - `parseExKey('ex:medical:hypertension:d2:0')` returns `null`. At v3.518, `parseExKey` (40977) has combat, cycling and watersports branches but no medical one. So every medical, prenatal, postpartum and rehab log is missing from PRs, `groupCorpusByExercise` (41524), weekly volume and the weekly-RPE readiness input, including the signals BL-02's clinical gate relies on.
  - `exKeyForLocation` (27117) has combat, cycling and medical branches but no watersports one. The cross-program warm-up fallback therefore builds `ex:watersports:d1:0`, which is never written.
- **Change:**
  - Add a `medical` branch to `parseExKey` that mirrors the combat one, using `MEDICAL_STYLES[style].days` (11366), with the label `${programs.medical.label} (${styleDef.label}) · ${dayDef.label}`.
  - Add a `watersports` branch to `exKeyForLocation`.
- **Acceptance criteria:**
  1. `parseExKey('ex:medical:hypertension:d2:0').exDef.name === 'Seated Cable Row'`.
  2. `readExCorpus` (41051) with one medical key returns 1 entry.
  3. `exKeyForLocation({program:'watersports', style:'surfing', dayId:'d1', idx:0}) === 'ex:watersports:surfing:d1:0'`.
  4. Combat, cycling, watersports and plain keys parse exactly as before (table test).
- **Test plan:** new `test-parse-ex-key-styles.js`, with real functions. Sabotage: remove the medical branch, and criterion 1 fails.
- **Files:** `index.html` (40977–41050, 27117–27122), `sw.js`, the test. **Guards (no re-pin expected):** `test-pr-timeline.js`, `test-pr-timeline-class-naming.js`, `test-fetch-day-statuses.js`, `test-watersports-program.js` (its line 336 parses a watersports key) and `test-cross-program-history.js` (the only suite that extracts `exKeyForLocation`).
- **Risk:** medical users will now see their logs in the PR and volume views. That's intended, and the What's New line says so.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. Both gaps re-confirmed in the source.
- **Status:** ready

### BL-77: A set logged with 0 reps is a miss, not a made lift (pulled forward from BL-42)
- **Why:**
  - Found while specifying BL-42, at v3.528. A set saved with a weight and 0 reps is treated as a made lift, so a missed lift at a new weight shows up as a PR. The set sheet allows 0 reps (`stepSetSheet` 31320, `Math.max(0, …)`). The readers that count it are:
    - `topSetOf` (27227): it takes the heaviest set whatever its reps. It feeds `buildPastSessions` (27682), the badge's `priorTop` (28937), today's top set (29186, 31915), the exercise sheet's e1RM line (31649, 31691), the Analysis first/latest comparison (41773–41775), `reconstructAllPRs` (41869) and the progress-delta reader (45087–45091).
    - `saveExSet` (28459): its `priorMax` loop (28468–28474) counts the set, and `isPR` (28529) is `w > priorMax` with no reps check.
    - `maxWeightEver` (27557; read at 41778, "best ever").
  - `estimated1RM` already returns `null` for `reps <= 0` (27552), so the e1RM is safe. Everything else in the list above isn't.
  - Owner, 2026-11-09, on PR #99: "pull the PR fix forward". It ships early, independent of BL-42.
- **Change** (read-time only; nothing stored changes):
  1. `topSetOf` skips sets with `reps === 0`. A set with `reps == null` (weight-only logging) keeps today's behaviour.
  2. `saveExSet`: the `priorMax` loop skips `reps === 0` sets, and `isPR` also requires `r !== 0`.
  3. `maxWeightEver` skips `reps === 0` sets.
  4. `reconstructAllPRs` and every other `topSetOf` caller follow through the helper, with no edits of their own.
  5. The What's New line: "A set logged with 0 reps now counts as a miss: it no longer shows as a PR or your best lift."
- **Acceptance criteria** (real invocations of the extracted functions):
  1. `topSetOf({sets:[{weight:210,reps:0},{weight:200,reps:2}]})` returns the 200×2 set.
  2. `topSetOf({sets:[{weight:210,reps:null}]})` still returns the 210 set, and `topSetOf({sets:[{weight:210,reps:0}]})` returns `null`.
  3. Real `reconstructAllPRs` (stubbed `readExCorpus`) over one exercise with 200×2 and then a newer 210×0 records no event for the 210. With the newer entry at 210×1, it records a weight PR.
  4. Real `saveExSet` (stubbed storage, not backdating) over a stored 200×2: logging 210×0 returns `isPR:false`, and logging 205×1 returns `isPR:true`. The stored 210×0 set is byte-identical to what v3.528 writes.
  5. Real `maxWeightEver` over [200×2, 210×0] returns 200.
  6. Real `buildPastSessions` over an entry [210×0, 200×2] gives a top set of 200×2. That means `analyzeProgressionSignal` reads the made lift, not the miss.
- **Test plan:** new `test-zero-rep-miss.js`, with the real `topSetOf`, `maxWeightEver`, `saveExSet`, `reconstructAllPRs`, `groupCorpusByExercise`, `estimated1RM`, `buildPastSessions` and `normalizeExEntry`. Sabotage:
  - remove the skip in `topSetOf`, and criteria 1, 3 and 6 fail;
  - remove the `isPR` check, and criterion 4 fails.
- **Files:**
  - `index.html`: `topSetOf` 27227–27233, `maxWeightEver` 27557–27563, `saveExSet` 28468–28474 and 28529, `APP_VERSION` 7625, `WHATS_NEW` 7643.
  - `sw.js` and the test.
  - **Guards** (grep at v3.528 found no fixture with a 0-rep set, so no re-pin is expected; re-pin only if one breaks, and name it in the PR):
    - the five `topSetOf` suites: `test-app-2-0.js`, `test-open-screen-2-0.js`, `test-performance-delta-colours.js`, `test-pr-timeline-class-naming.js`, `test-pr-timeline.js`;
    - the six `reconstructAllPRs` suites (those, plus `test-audit-fixes.js` and `test-history-2-0.js`);
    - `maxWeightEver`: `test-app-2-0.js` and `test-performance-delta-colours.js`;
    - the nine `saveExSet` suites (seven stub it; `test-accumulation-accessory-add.js` and `test-fetch-day-statuses.js` reference it);
    - the seven `wireSetsBlock` suites that stub `buildPastSessions`.
- **Risk:** any 0-rep set already logged stops counting in History, PRs and Analysis. A PR built on a miss disappears. Stored data is untouched, and the What's New line says so. Placed at slot 9c, after BL-53, so that BL-08's all-set rule (slot 10) never reads a miss as a top set.
- **Tools:** `code-review` at high (PR history).
- **Status:** ready (owner yes 2026-11-09). Slot 9c.

### BL-54: One exercise, one name in History, PRs and the warm-up fallback (D-3)
- **Why:** the same lift under two names splits grouping:

  | Name | Other name |
  |---|---|
  | Squat (68 slots) | Back Squat (17) |
  | Bench Press (58) | Flat Bench Press (7) |
  | Seated Cable Row (49) | Cable Row (19); bodybuilding uses both (d2 9857, d6 9908) |
  | Farmer's Carry (51) | Farmers Carry (Heavy) (9) |
  | Standing Calf Raise (17) | Calf Raise (40) |

  Switching between the Olympic or Hyrox program and Strength & Size loses "last time", the warm-up basis and a single PR line.
- **Change:**
  - `EXERCISE_CANONICAL = {'Back Squat':'Squat', 'Flat Bench Press':'Bench Press', 'Cable Row':'Seated Cable Row', 'Farmers Carry (Heavy)':"Farmer's Carry", 'Calf Raise':'Standing Calf Raise'}` and `canonicalExName(n)`.
  - Used **only** in `groupCorpusByExercise` (41696) and `getExerciseLocationIndex` (27127).
  - Slot names, cues, `EXERCISE_SUBS` (13746), keys and logs are unchanged.
- **Acceptance criteria:**
  1. A corpus with one Back Squat entry (oly) and one Squat entry (strength) gives one group named "Squat", with 2 entries and both day labels.
  2. The cross-program warm-up fallback for strength d2 Squat finds an oly Back Squat log.
  3. Without aliased names, the output is identical to today.
- **Test plan:** extend `test-cross-program-history.js` and `test-pr-timeline.js` with real functions. Sabotage: empty the map.
- **Files:** `index.html` (41696, 27127, the new const beside `EXERCISE_SUBS` 13746), `sw.js`, `test-cross-program-history.js`, `test-pr-timeline.js`, `test-pr-timeline-class-naming.js` (re-pin below). **Re-pin likely:** `test-pr-timeline-class-naming.js:87` asserts `/Back Squat/` in the rendered PR row, and its fixture's only exercise is Back Squat, so the row will now read "Squat". `test-pr-timeline.js` uses Back Squat in two programs; it asserts dates and weights, not names, so it's expected to pass. **Re-pin (chunks):** four suites run the real functions and will throw on the new names unless `EXERCISE_CANONICAL` and `canonicalExName` join their chunks: `test-cross-program-history.js` (`buildChunks`, line 27), `test-watersports-program.js` (362), `test-pr-timeline.js` (33) and `test-pr-timeline-class-naming.js` (67). Name each in the PR. `test-app-2-0.js` (200) and `test-performance-delta-colours.js` (21) stub `groupCorpusByExercise`, so they're unaffected; run them anyway.
- **Risk:** PR timelines merge. A heavier Back Squat PR from the Olympic program now counts for Squat, which is right for the same bar.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; the re-pin was found. Placed after MKT-06a (slot 19a), so the Year in Lifting deadline isn't pushed back; MKT-06b gets the merged names.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines and slot counts re-grepped; `test-watersports-program.js` added to the suites to run. Scope unchanged.
- **Status:** ready

### BL-55: Cardio rows show a distance field only when distance is the measure, and it never blocks a finished set (D-5)
- **Why:**
  - `isDistanceExercise` (32741) is "category is cardio". The real-set check inside `wireSetsBlock` (`hasRequiredDistance`, 32201; `isRealSet`, 32202) requires a distance. So the rest timer and the gym-mode offer never fire on Burpees (29 slots), Battle Ropes (39), Wall Balls (13), Burpee Broad Jumps (9), Agility Ladder, every Jump Rope drill (82) and the jump-rope warm-up (105) until a distance is typed.
  - At least 147 cardio slots prescribe no distance at all.
- **Change:**
  - `isDistanceExercise(exName, setsStr)` is true when the exercise's category is `cardio` (today's rule, kept as a gate) **and** either the prescription contains a distance unit (`\d\s*(m|yd|km|mi)\b`) or the name matches `/Run|Jog|Ride|Spin|Swim|Walk|Row|SkiErg|Sled|Strides|Repeats/`.
  - *Spec refresh 2:* the cardio gate is spelled out because the name pattern alone matches Barbell Row, Seated Cable Row, Upright Row and Farmer's Walk, which would grow a distance field. The title ("Cardio rows…") already scoped it to cardio.
  - All three callers pass the sets string: `renderWorkout` 28915, `wireSetsBlock` 32028, and the Analysis weekly-distance card (`computeWeeklyCardio`, 45907; `exDef.sets`).
  - `hasRequiredDistance` is dropped from `isRealSet` (32200–32202): reps or minutes alone complete a cardio set. The distance stays optional and is still saved.
  - **Not changed, by design:** `checkAllSetsCompleteAndAutoCheck` (31993; the rule at 32006) still asks for a distance before it ticks the whole exercise off, whenever the row renders a distance field. With the new predicate that's only rows where distance is the measure (`400m Repeats`, runs), so a run logged with time only rests and counts as a set, but isn't ticked done until a distance is typed. Burpees and ropes lose the field, so they tick off on reps. Changing the tick rule is a separate item if the owner wants it.
- **Acceptance criteria:**
  1. Burpees `4×10`: no distance input renders. Logging reps starts the rest timer (`startRestTimer` stub called once).
  2. `400m Repeats`: the distance input renders, and logging the time alone starts the timer.
  3. `Easy Run 25-30 min` keeps its distance field and pace display.
  4. The real `computeWeeklyCardio` (stubbed `readExCorpus`) gives the same metres as v3.527 for a corpus of Easy Run, 400m Repeats and Rowing entries with distances.
  5. Real `isDistanceExercise` over every slot of `programs`: no non-cardio exercise returns true (sweep; asserts Barbell Row false), and every slot whose sets contain a distance unit returns true.
- **Test plan:** new `test-cardio-distance-gate.js`, with the real `wireSetsBlock` and `isDistanceExercise` in jsdom. Sabotage: restore the old predicate, and criterion 1 fails.
- **Files:** `index.html` (32741–32744, 28915, 32028, 32196–32203, 45907), `sw.js`, the test. **Guards:** `test-partial-set-reactions.js` (lines 147–170: distance alone must still not fire, and distance plus reps must fire; both stay true) and the six other `wireSetsBlock` suites (they stub `isDistanceExercise = ()=> false`, so the new argument is harmless). `test-exercise-logger.js` asserts the Up Next logger hides distance on a lift, so run it.
- **Risk:** the pace and distance display and the cardio Analysis card. The suites above guard it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The third caller (45650) was added.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the cardio gate made explicit; the auto-tick rule noted as unchanged; criteria 4–5 made real invocations. `test-partial-set-reactions.js` 147–170 re-read: both cases still hold. Scope unchanged.
- **Status:** ready

### BL-56: `noWeight` on moves that never take load, and load on the ones that do (D-4)
- **Why:**
  - At least 98 slots of pure bodyweight moves show a weight field. Examples:
    - Core d1 (`index.html` 10077–10080): Bird Dog, Dead Bug, Side Plank and McGill Curl-up;
    - the Bodyweight program (10132): Glute Bridge, Bodyweight Squat, Jump Squat, Push-up to Plank and Bicycle Crunch;
    - Jump Rope Bodyweight Squat (15 slots) and Single-Leg Bound (12).
  - The Bodyweight program's push, pull and leg moves show one too, against its "no equipment" overview.
  - A weight is required before the set counts (`hasRequiredWeight`, 32200), so the rest timer doesn't start.
  - 17 exercises are `noWeight` in some slots and not in others.
  - Wall Balls (a loaded ball) and Sled Pull are `noWeight`, while Sled Push isn't.
- **Change** (slot field only; keys and logs unchanged):
  - Add `noWeight:true` to every slot of Bird Dog, Dead Bug, Side Plank, McGill Curl-up, Glute Bridge (Bodyweight program), Bodyweight Squat, Jump Squat, Push-up to Plank, Bicycle Crunch and Single-Leg Bound.
  - In the **Bodyweight** program and its variants, add it to Push-up, Pike, Decline Push-up, Triceps Dip, Inverted Row, Chin-up, Pull-ups (or assisted), Nordic Curl, Bulgarian Split Squat and Calf Raise.
  - Remove `noWeight` from Wall Balls and Sled Pull.
  - **Calisthenics** keeps load fields on Dip, Pull-up and Muscle-up (weighted calisthenics is normal).
- **Acceptance criteria:**
  1. A real walk of every slot: none of the listed exercises in the listed programs lacks `noWeight`.
  2. The real `wireSetsBlock` on a row built from the real Bodyweight d1 Push-up slot (its `noWeight` read from `programs`, not hand-written) with no `.ex-weight` input: reps alone start the rest timer (`startRestTimer` stub called once).
  3. The real `buildExerciseHistoryHtml` over a stubbed log with an old weighted Push-up entry still prints the weight.
  4. Sled Push, Sled Pull and Wall Balls agree: none is `noWeight` in any slot (sweep).
- **Test plan:** new `test-noweight-consistency.js` (a slot sweep over `programs` plus the variant tables, and one real `wireSetsBlock` case). Sabotage: drop one slot's flag.
- **Files:** `index.html` (program data: `core` 10071, `bodyweight` 10132, and every other program carrying the listed names; the day-count variants from 16241, notably `bodyweight` 17861 and `core` 18389; the `*_STYLES` tables), `sw.js`, the test. **Guards:** `test-partial-set-reactions.js:136` (reps alone finish a `noWeight` set), `test-configurable-training-days.js` and `test-volume-modifier-gate.js` (both walk the program data).
- **Risk:** an owner who logs weighted push-ups in the Bodyweight program loses the field there. That's the owner's call. Placed before BL-11 (slot 26a), because BL-11's rep progression applies to rows without a weight.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; criteria 2–4 made real invocations (criterion 4 makes the Sled/Wall Balls change checkable). `test-partial-set-reactions.js:136` is still the reps-alone `noWeight` case. Scope unchanged.
- **Status:** ready (owner yes 2026-11-08: "56 a"). Slot 26a, before BL-11.

### BL-57: The rest parser reads trailing multipliers, per-side mobility and swim repeats correctly (D-6, D-11; after BL-14)
- **Why:**
  - `getRepRangeTier` (27821) reads the first number after `×`, while `parseSetCount` (26461) already understands "N reps ×M". With the real `getDefaultRestSeconds` (27832):
    - 61 slots (`5 breaths ×3`, `6 reps ×3`, `3-5 min ×3`: yoga Flow and Hot, and all Tai Chi) get **240 s**;
    - about 100 slots of `2×5/side` mobility and technique drills (Hip CARs ×31, Shoulder CARs, World's Greatest Stretch, Pilates Saw, grappling passes, takedowns and submission drills) get 240 s;
    - Single-Leg Bound gets 90 s at `3×6/leg` but 240 s at `3×5/leg`;
    - `8×100m` swim gets 60 s, against its own cue's 15–30 s.
  - BL-14 (slot 25) fixes unit suffixes (`6×2min`, `6×40yd`). It doesn't fix trailing multipliers, per-side drills or swim repeats.
- **Change** (inside `getRepRangeTier` / `getDefaultRestSeconds`, on top of BL-14's unit branch):
  1. A trailing multiplier (`/^\d+(-\d+)?\s*(reps?|breaths?|min)[^×]*×\s*\d+\s*$/`) → tier `null`; rest 30 s for breaths and forms, 60 s otherwise.
  2. Category `core` or `shoulder` with `noWeight`, or a name in the mobility set (`EXERCISE_MOVE[name] === 'mobility'`, 13640; 27 names map to `'mobility'` at v3.527) → never the strength tier; rest 45 s.
  3. Category `jump` → 90 s fixed (120 s for Depth Jump and Trap Bar Jump Squat).
  4. Swim repeats (`\d+×(\d+)m` with a swim name): ≤ 200 m → 20 s; 201–400 m → 30 s.
  5. `getRestReasonLabel` (27846) mirrors every branch.
- **Acceptance criteria:** `getDefaultRestSeconds` returns:
  - Downward Dog `5 breaths ×3` → 30;
  - Hip CARs `2×5/side` → 45;
  - Single-Leg Bound `3×5/leg` and `3×6/leg` → 90, both;
  - Swim Intervals `8×100m` → 20;
  - Bench Press `4×4-6` → 240 (unchanged);
  - Lateral Raise `3×12-15` → BL-14's value (unchanged by this item).

  The label agrees with the number in each case.
- **Test plan:** new `test-rest-tier-parsing.js`, with real functions over a table, plus a full-slot sweep asserting that no `core` or `shoulder` `noWeight` slot gets 240. Sabotage: remove branch 1.
- **Files:** `index.html` (27821–27853), `sw.js`, the test. **Re-pins:** the seven suites that extract the real `getDefaultRestSeconds` and `getRestReasonLabel` must also load `EXERCISE_MOVE`, or the new read must be guarded with `typeof EXERCISE_MOVE !== 'undefined'` (prefer the guard; then no suite changes). The suites are `test-auto-check-sets.js`, `test-backdating-rest-timer-suppression.js`, `test-fallback-entry-consolidation.js`, `test-partial-set-reactions.js`, `test-set-next-button.js`, `test-superset-rest-timer-suppression.js` and `test-superset-shared-sets-block-wiring.js`. `test-lb-per-kg-consolidation.js` extracts `getDefaultRestSeconds` for the calorie estimate; its Back Squat 3×5 case is unchanged.
- **Risk:** the rest timer for every program, and the time estimate (rest feeds `parseEstimatedMinutes`). The superset and backdating rest-suppression suites guard it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The `EXERCISE_MOVE` dependency and the seven suites were found. Placed straight after BL-14 (slot 25a).
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped. The seven suites are unchanged (each still extracts the real `getDefaultRestSeconds` and `getRestReasonLabel`); none extracts `EXERCISE_MOVE`, so the `typeof` guard stays the recommendation. Scope unchanged.
- **Status:** ready (after BL-14)

### BL-58: Library entries for the Light and Speed variants; prune orphans (D-7, C-1, C-2; closes L-3)
- **Why:**
  - 7 names in 14 slots have no `exerciseInfo`: Squat (Speed) (e.g. 17258), Bench Press (Speed), Deadlift (Light/Technique), Snatch (Light), Clean & Jerk (Light), Sprint Intervals (Sub-Max) and Handstand Hold (wall) (Light). They get no cues, no category, no ledger counting, and a 5 lb default increment that pushes load on speed work.
  - 6 orphan cycling entries are referenced nowhere (`content-exercises.js`, in the cycling run at 148–158; identify them by the sweep, not by line).
  - `EXERCISE_MOVE` (13640–13720) has 3 duplicate keys, and 85 slot names have no icon key.
- **Change:**
  - Add entries with the base lift's category and three cues each, plus `technique:true`, which BL-02's technique rule reads (no load-increase signal):
    - Speed lifts: "50–60% of your working max; move it as fast as you can; stop if bar speed drops".
    - Light Olympic lifts: "about 70%; technique only; no misses".
  - Delete the 6 orphan entries.
  - Remove the duplicate `EXERCISE_MOVE` keys.
  - Add move keys for the 85 names, using existing `MOVEMENT_ICONS` (13124) keys only.
- **Acceptance criteria:**
  1. Every slot name has an `exerciseInfo` entry (full-slot sweep).
  2. `Squat (Speed)` maps to Legs (Quads) in the ledger.
  3. The real `analyzeProgressionSignal` (27594) never returns `increase` for a `technique:true` entry (two sessions at the top of the range, RPE 7).
  4. No `exerciseInfo` key is unreferenced by slots, `EXERCISE_SUBS`, `SUBSTITUTION_MAP` (44166) or `REGION_RELIEF` (44253).
- **Test plan:** new `test-exercise-library-coverage.js` (the sweeps), plus a real-function progression case. Sabotage: delete one new entry.
- **Files:** `content-exercises.js`, `index.html` (13640–13720, `analyzeProgressionSignal` 27594), `sw.js`, the test. **Re-pin:** `test-concise-cues.js:43–47` pins exactly 321 exercises and **970** cues at v3.527 (BL-05 + BL-06 added 6). BL-62, BL-64 and BL-25 may move it again before this builds: read the number at build time. This item adds 7 entries (21 cues) and deletes 6 (count their cues at build time), so update both numbers and say why in the PR. Its 24-word cap applies to the new cues. Also run `test-accumulation-accessory-add.js` and `test-volume-modifier-gate.js` (both read `exerciseInfo` categories).
- **Risk:** content only, apart from the technique flag. BL-02 (v3.519) has landed, but it has no `technique` flag: its rule is by category (`rpeTargetFor`, 27524, returns `null` for `oly`, `jump` and `throw`). So add the flag check here: at the top of signal 3 in `analyzeProgressionSignal` (27628), `exerciseInfo[ex.name]?.technique` returns `null` instead of an increase. Speed Squat and Speed Bench keep their `squat`/`push` categories, so the category rule alone wouldn't cover them.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; the `test-concise-cues.js` re-pin was found. Placed after BL-24 (slot 22a), because both touch the load increment.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the cue-count pin is now 970; BL-02's landed rule read, so the flag check's place is named. Scope unchanged.
- **Status:** ready (BL-02 done, v3.519)

### BL-59: Category corrections that feed the muscle ledger (D-8, with M-8)
- **Why:**
  - Band External Rotation (50 slots), Scapular Retraction (40) and Band Pull-Apart (7) count as **Core**.
  - Deep Squat Hold (27), Chair Pose, Horse Stance Hold and Bow Stance Transitions count as **Quads** sets, and they're eligible for accumulation.
  - Chaturanga (yoga) counts as **Chest & Shoulders**, with a +5 lb increment.
  - Wall Slides, Shoulder CARs and Band Dislocates count as Chest & Shoulders hypertrophy work.
  - Sprawl Drills count as Posterior Chain compound work.
  - The per-muscle ledger (BL-20) inherits all of this.
- **Change:** recategorise, by name (the audit's D-8 table, `exercise-consistency-audit.md` 186–205; `content-exercises.js` line in brackets):
  - → `shoulder`: Band External Rotation (68), Scapular Retraction (69), Band Pull-Apart (110);
  - → `core`: Deep Squat Hold (96), Chair Pose (21), Horse Stance Hold (Mabu), Bow Stance Transitions (Gong Bu) (310), Chaturanga, Wall Slides (90), Shoulder CARs (88), Band Dislocates (91). *(Spec refresh 3: Wall Slides, CARs and Dislocates are already `shoulder`; the Why line complains they count as Chest & Shoulders, and the audit table says `core`, so they're named here. The old "mobility holds → core" didn't reach them.)*
  - → `kick`: Sprawl Drills (11).
  - M-8, same version: `calf` for Calf Raise (231), Standing Calf Raise (287), Eccentric Heel Drop (286) and BL-60's Single-Leg Calf Raise; `isolation-leg` for Leg Extension. Increment 5 lb (`CATEGORY_LOAD_INCREMENT`, 27583: `calf:5`, `isolation-leg:5`; BL-24 may have changed this table, so read it first), not in `WARMUP_ELIGIBLE_CATEGORIES` (27799) or `COMPOUND_CATEGORIES` (26780). M-8 says "mapped to Legs": default `calf` → `'Calves'` (a new group, with no landmark) and `isolation-leg` → `'Legs (Quads)'`. Leg Curl stays `hinge` (its regions are already fixed by `EXERCISE_REGION_OVERRIDE`).
  - **Every category-keyed table gets the two new keys** (spec refresh 3; a missing key silently falls back): `CAT_TO_ICON` (13120), `MOVEMENT_ICONS` (13127), `CATEGORY_MET` (26488), `CATEGORY_LOAD_INCREMENT` (27583), `CATEGORY_TO_REGIONS` (44106: `calf` → Ankle/Foot, Shins; `isolation-leg` → Knee), `SUBSTITUTION_MAP` (44169), `MUSCLE_GROUP_MAP` (45530). One version, so `MUSCLE_GROUP_MAP` changes once.
- **Acceptance criteria** (real `exerciseInfo`, `MUSCLE_GROUP_MAP`, `applyAccumulation` (26820), `regionsForExercise`, `getLoadIncrement` and the tables above):
  1. Group totals (BL-20 ships after this, so this is the group view): a week of Deep Squat Holds maps to `'Core'`, not `'Legs (Quads)'`; Calf Raise maps to `'Calves'`, not `'Arms'`.
  2. Real `applyAccumulation` on a week-3 strength day containing each recategorised exercise never adds a set to one of them.
  3. Region flags: Band External Rotation flags Shoulder; Leg Extension flags Knee.
  4. Every category used in `exerciseInfo` has an entry in each of the seven tables (sweep; prints the gaps).
  5. `getLoadIncrement('calf')` is 5, and Chaturanga's increment is `core`'s.
- **Test plan:** new `test-category-corrections.js`. Sabotage: restore Deep Squat Hold to `squat`, and criteria 1–2 fail; drop `calf` from `CATEGORY_MET`, and criterion 4 fails.
- **Files:** `content-exercises.js`, `index.html` (the seven tables above, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, the test. **Guards:** `test-accumulation-accessory-add.js`, `test-volume-modifier-gate.js` (the jump-category rule; Sprawl Drills becomes `kick`, not `jump`), `test-region-override.js` (override names win over categories), `test-superset-all-programs-coverage.js` (83: bodybuilding d5 Leg Extension + Leg Curl), `test-configurable-training-days.js` (652, 759, 935–938 name Chaturanga and the calf moves), the three search suites that read `MUSCLE_GROUP_MAP` (`test-global-search-techniques.js`, `test-search-2-0.js`, `test-search-index-freshness.js`) and `test-exercise-substitution.js` (BL-60's same-group sweep: its allowlist must still hold, since the calf moves and their substitutes move together).
- **Risk:** past weeks' Analysis group totals change (read-time; no stored data changes). Placed before BL-20 (slot 55a), so the ledger ships on the corrected categories.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: the Change missed three exercises its own Why names (they're `shoulder` already, and the audit says `core`); the two new M-8 categories need entries in seven category tables, or lookups fall back silently; the criteria are now real invocations, and criterion 1 uses the group view because BL-20 isn't built yet at this slot. The `'Calves'` group name is the builder's default (M-8 says only "Legs"). Scope unchanged.
- **Status:** ready (owner yes 2026-11-08: "59 a", with M-8). Slot 55a, before BL-20.

### BL-60: Substitutes that keep the same muscle and joint (D-9)
- **Why:**
  - In `EXERCISE_SUBS` (13749), Tibialis Raise → Standing Calf Raise / Calf Raise is the antagonist (13854).
  - Calf Raise and Standing Calf Raise → Leg Press puts a knee-and-hip compound in a calf slot (13812, 13820).
  - Farmers Carry (Heavy) → Sandbag Lunges goes from a carry to a lunge (13844).
  - `SUBSTITUTION_MAP` (44169) names **9** alternatives without `exerciseInfo` (measured at v3.528 with the real tables: Push-up (partial range), Machine Chest Press, Landmine Press, Chest-Supported Row, Wall Sit, Leg Press (light, partial depth), Step-Up (low box), Grip Strengthening (light), Shadowboxing (no resistance)), so they show no cues when swapped in.
- **Change:**
  - Tibialis Raise → ['Heel Walk', 'Banded Dorsiflexion'].
  - Calf Raise → ['Standing Calf Raise', 'Single-Leg Calf Raise'].
  - Standing Calf Raise → ['Calf Raise', 'Single-Leg Calf Raise'].
  - Farmers Carry (Heavy) → ['Suitcase Carry', "Farmer's Carry"].
  - Add `exerciseInfo` entries (category plus 3 cues, each ≤ 24 words) for the 3 new names and the 9 `SUBSTITUTION_MAP` alternatives. Categories match the exercise they stand in for, as the categories are **at this slot** (BL-59, slot 55a, moves the calf moves to `calf` later): Single-Leg Calf Raise `arms` (like Calf Raise and Standing Calf Raise today), Heel Walk and Banded Dorsiflexion `core` (like Tibialis Raise).
  - Add the three new names to `EXERCISE_REGION_OVERRIDE` (44120) as `['Ankle/Foot','Shins']`, like their originals. Otherwise a resting ankle isn't flagged on them (an `arms` move flags Elbow/Wrist; a `core` move flags Lower Back).
  - **Stored selections (corrected; BL-73, slot 8b, ships first):** `applyExerciseSubs` (27098) now applies a stored name **only if it's listed** for that exercise. So a stored "Leg Press" on a Calf Raise or Standing Calf Raise slot, and a stored "Sandbag Lunges" on Farmers Carry (Heavy), stop applying when this item removes them. The row shows its default exercise; the substitute's history stays under its `:sub:` key, untouched. BL-73's Risk line already accepted this ("the list was changed for a reason"). The What's New line says so: "If you'd swapped Calf Raise for Leg Press, the swap is gone; your Leg Press history is kept."

- **Acceptance criteria** (real `EXERCISE_SUBS`, `SUBSTITUTION_MAP`, `MUSCLE_GROUP_MAP`, `exerciseInfo`, `EXERCISE_REGION_OVERRIDE`, `regionsForExercise` and `applyExerciseSubs`):
  1. Every `EXERCISE_SUBS` target shares the original's `MUSCLE_GROUP_MAP` group (sweep), except this **named** allowlist, which is every cross-group pair left at v3.528 after this item's three fixes (measured): Close-Grip Bench Press ↔ Dip (Bar/Ring); Skull Crushers → Close-Grip Bench Press; and the Olympic lifts to their strength parents (Clean & Jerk → Push Press; Clean Pull → Deadlift; Snatch Pull → Deadlift; Jerk Dip Squat → Push Press and Front Squat; Overhead Squat → Front Squat; Power Clean → Front Squat). The sweep prints any pair outside the list.
  2. Every `SUBSTITUTION_MAP` alternative and every `EXERCISE_SUBS` target has an `exerciseInfo` entry with 3 cues.
  3. `regionsForExercise` returns `['Ankle/Foot','Shins']` for Single-Leg Calf Raise, Heel Walk and Banded Dorsiflexion.
  4. *(Corrected for BL-73)* A stored "Leg Press" selection on a Calf Raise slot is **not** applied: the real `applyExerciseSubs` returns the row as 'Calf Raise' with no `__isSubbed`. The stored value itself is not deleted (the stub storage still holds it).
  5. A stored "Single-Leg Calf Raise" on a Calf Raise slot **is** applied.
- **Test plan:** extend `test-exercise-substitution.js`. Sabotage: restore the Tibialis pair, and criterion 1 fails; drop the region-override lines, and criterion 3 fails.
- **Files:** `index.html` (`EXERCISE_SUBS` 13749–13858, `EXERCISE_REGION_OVERRIDE` 44120–44141, `APP_VERSION` 7625, `WHATS_NEW` 7643), `content-exercises.js`, `sw.js`, `test-exercise-substitution.js`. **Re-pins** (both count exercises and fail when 12 are added):
  - `test-concise-cues.js:45–48`: 321 → 333 exercises and +36 cues (from whatever the base commit holds: 971 at v3.528, more if BL-05/BL-35-era items added cues), with a dated note;
  - `test-safety-cues.js:99–109` (the v3.526 snapshot): its `Object.keys(now).length === 321` and "no other cue count changed" check. Add the 12 new names to its `edited`/new-key handling (each has 3 cues, which its `before()` default already assumes) and move 321 → 333, with a dated note.
  - **Guards:** `test-region-override.js` (64: every `EXERCISE_REGION_OVERRIDE` key has an `exerciseInfo` entry, so the three new override keys need theirs; 155: the same for the own-swap table), BL-67's no-jump-crossing case in `test-exercise-substitution.js`, `test-warmup-ramp-and-plates.js` (Leg Press ramps, unaffected), and the search suites that index `exerciseInfo` (`test-search-index-freshness.js`, `test-global-search-techniques.js`, `test-search-2-0.js`).
- **Risk:** the existing substitution and swap tests guard it. Placed after BL-25 (slot 31a), with the other content fixes.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; the cue-count re-pin was found.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: (1) the old criterion 3 contradicts BL-73 (slot 8b, already ahead in the sequence), which stops applying a stored substitute that's no longer listed; the criterion and the Change line now follow BL-73. (2) The sweep's allowlist missed seven Olympic and triceps pairs that are cross-group today; they're named. (3) 9 alternatives lack entries, not 10. (4) The new calf and shin moves need `EXERCISE_REGION_OVERRIDE` lines, or a resting ankle isn't flagged on them. (5) `test-safety-cues.js`'s 321-exercise snapshot needs re-pinning too. Scope unchanged.
- **Status:** ready

### BL-61: Plyometric prescriptions match their cues (S-2, S-3)
- **Why:**
  - "Single-Leg Bound" is cued as an alternate-leg bound (`content-exercises.js` 277). It's prescribed `/leg`, `/side` or bare (running d6 10373, running variants 19296 and 19344: `3×6`), across 45 slots, and shows a weight field in 12 of them.
  - Jump Squat `3×12-15` (bodyweight d5 10151, calisthenics d5 10422, and 7 variant slots 17961–18325) contradicts its "reset each rep for max power" cue, and gets 60 s rest.
  - Fatigued plyometric landings are the injury mechanism the program's own SAF-5 work guards against [PRAC].
- **Change:**
  - Single-Leg Bound cue 1: "Hop forward off one leg and land on the **same** leg; stick each landing for a beat, knee over toes, no cave-in."
  - All its prescriptions become `/leg` (bare `3×6` → `3×6/leg`; `/side` → `/leg`). `noWeight` comes from BL-56.
  - Jump Squat `3×12-15` → `3×6-8` in all 9 slots, plus the cue line "Stop the set when landings get loud or knees cave."
  - Names and slot positions are unchanged (safe for history).
- **Acceptance criteria:**
  1. A sweep: every Single-Leg Bound prescription matches `/\/leg$/`.
  2. No `jump`-category prescription has a top rep above 8.
  3. The rest from BL-57 is 90 s for both (if BL-57 has shipped; otherwise assert BL-57's case is unaffected).
- **Test plan:** new `test-plyo-prescriptions.js` (the sweeps over `programs` and the variant tables, with real `parseTopRep`). Sabotage: restore one `3×12-15`.
- **Files:** `index.html` (the slots above), `content-exercises.js` (277; Jump Squat's entry), `sw.js`, the test. **Re-pin:** `test-concise-cues.js` only if the Jump Squat line is added as a fourth cue. Rewrite an existing cue instead, and the 964 count holds. **Guards:** `test-configurable-training-days.js:489–510` (Single-Leg Bound stays off the surfing and skimboarding extra days).
- **Risk:** prescriptions change in 2 programs plus their variants. That's visible, so the What's New line names it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; counted 45 Single-Leg Bound slots and 9 Jump Squat `3×12-15` slots.
- **Status:** ready (owner yes 2026-11-08: "61 a", as written). Slot 6c.

### BL-76: Rep targets survive a per-limb or bracketed note (parser fix before BL-62)
- **Why:** `parseTopRep` and `parseBottomRep` (`index.html`, near `getSetFieldUnit`) read a fixed rep count only when it's the last thing in the string. `3×8/leg`, `3×10/side`, `4×20 (10/leg)` and `3×15 (straight-knee, 3s eccentric lower)` all return `null`. At v3.528, **167 weighted slots** in the built-in programs have no rep target for this reason (e.g. Bulgarian Split Squat `3×8/leg`, Pallof Press `3×10/side`, Cable Woodchopper `3×12/side`). With no rep target there are no progression badges, no next-set rep target and no RPE-mode load for them. Found while building BL-62 (blocker PR #98); the owner chose to fix it first on 2026-11-09 ("BL-62 a").
- **Change:** in `parseTopRep` (and so `parseBottomRep`, which falls back to it), before the fixed-count patterns, strip one trailing bracketed note and then one trailing per-limb suffix: `/leg`, `/side`, `/arm`, `/hand`, `/direction`, optionally with spaces. Range strings already parse and are unaffected. Nothing else changes: units such as `20yd/side` or `30s/side` still have no rep target, because the count isn't a bare number.
- **Acceptance criteria** (real `parseTopRep` / `parseBottomRep`):
  1. Table: `3×8/leg` → 8; `3×10/side` → 10; `4×20 (10/leg)` → 20; `3×15 (straight-knee, 3s eccentric lower)` → 15; `3×10-12/leg` → 12/10 (unchanged); `3×10` → 10; `3×20yd/side` → null; `3×30s/side` → null; `Max 5` → null; `20 min` → null.
  2. **No regressions:** for every `sets` string in `programs`, every `*_STYLES` style and every `PROGRAM_DAY_COUNT_VARIANTS` day, wherever v3.528's parser returned a number, the new one returns the same number (a frozen snapshot from v3.528).
  3. Weighted slots (not `noWeight`) with a per-limb or bracketed note and a null top rep: 167 at v3.528, now only those whose count isn't a bare number (listed in the test).
  4. The real `analyzeProgressionSignal` for Bulgarian Split Squat `3×8/leg`, with two sessions at 8 reps on the same weight, signals an increase. At v3.528 it returned `null`.
- **Test plan:** new `test-rep-parse-qualifiers.js`. Sabotage: remove the suffix stripping, and criteria 1, 3 and 4 fail.
- **Files:** `index.html` (`parseTopRep`, `WHATS_NEW`, `APP_VERSION`), `sw.js`, `test-rep-parse-qualifiers.js` (new).
- **Risk:** about 167 exercises start showing progression suggestions they never showed. That's intended, and the What's New line says so. Guards: `test-program-fit-trend.js`, `test-rpe-safety-caps.js`, and the suites that read rep targets.
- **Status:** done (v3.529, PR #100)

### BL-62: Clinical dose and position wording (S-4, S-5, C-3)
- **Why:**
  - Achilles heel drops are `3×15 (straight-knee, 3s eccentric lower)`, with no per-leg dose (`index.html` 12017, 12037, 12045, and the bent-knee twins).
  - ACL `Straight Leg Raise 3×12` (11985) has the same gap.
  - Prenatal `Diaphragmatic Breathing` is cued "Lie down…" (`content-exercises.js` 79), while the plan's own Standing Pelvic Tilt cue says to avoid prolonged lying on your back in pregnancy [PREG19].
  - Hyrox `Sandbag Lunges 4×20` and `3×20` don't say whether that's total or per leg (11001, 11014, and the variants 21110, 21156, 21171, 21210, 21225).
- **Change** (text only):
  - `3×15/leg (straight-knee, 3s eccentric lower)`, and the bent-knee twin.
  - `Straight Leg Raise 3×12/leg` in ACL and rehabGeneral.
  - Diaphragmatic Breathing cue 1 is rewritten (count unchanged): "Sit tall or lie down (on your side if pregnant), one hand on your chest, one on your belly; let the belly rise more than the chest."
  - `Sandbag Lunges 4×20 (10/leg)` and `3×20 (10/leg)`, all 7 occurrences.
  - The Achilles day note (12015) is unchanged; `test-concise-day-notes.js:21` pins its wording.
- **Acceptance criteria:**
  1. Real `parseSetCount` and `getRepRangeTier` results are unchanged for each edited string (table test).
  2. BL-01's authored-equals-rendered test (`test-volume-modifier-gate.js`) still passes, using the new authored strings.
  3. No prenatal day's cues contain "Lie down" without a side-lying option (sweep over the prenatal style's exercises).
- **Test plan:** extend `test-concise-cues.js` with a table test (the cue stays ≤ 24 words, per its existing cap).
- **Files:** `index.html` (11985, 12017–12047, 11001, 11014, 21110–21225), `content-exercises.js` (79), `sw.js`, the test. **Re-pin (owner 2026-11-09):** `test-rep-parse-qualifiers.js` criterion 3's count of noted weighted slots, 255 → 262 (the 7 Sandbag Lunges gain `(10/leg)`; the 7 still-unparsed carries are unchanged). **Guards:** `test-concise-day-notes.js`, `test-configurable-training-days.js:807` (Sandbag Lunges by name; unaffected).
- **Risk:** clinical-content wording. BIZ-15's clinician review should see it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The Hyrox variant rows were added. The prenatal fix is a rewrite, not a fourth cue, so the cue count holds.
- **Status:** done (v3.530, PR #103). Earlier: ready (owner 2026-11-09: "Yes this is my recommendation", option (a): BL-62 also re-pins `test-rep-parse-qualifiers.js`'s 255 → 262; see Files). Use the 24-word breathing cue: "Sit tall or lie down (on your side if pregnant), one hand on chest, one on belly; the belly rises more than the chest." Builder notes for the exercise auditor stand: heel drops `3×15/leg` vs the affected-leg protocol, the two per-leg conventions; Senior's `2×10-12` is out of scope.

### BL-63: The time shown on Today counts the work, not just the rest (D-10, C-5)
- **Why:**
  - Today's `~N min` (28856) comes from `parseEstimatedMinutes` (26501) through `unitMinutes` (26622). It counts a distance interval as `count × rest`: `8×100m` swim = 8 min (confirmed: no `min` or `s` match, so it's 8 × 60 s), `4×200m` = 4 min, `6×400m` = 6 min, `6×500m` row = 6 min. Lifting sets count rest only.
  - The auditor measured 251 of 1,065 days showing under 0.6× their authored duration (Hyrox d6 is about 18 vs ~45).
  - The 30/45-minute session length (`SESSION_LENGTH_OPTIONS` 26579, `applySessionLengthLimit` 26926) trims against this number, so capped sessions overrun.
  - The authored `duration` is shown only on rest days (28733).
- **Change** (inside `parseEstimatedMinutes`, plus one day-level allowance in `totalMinutesForUnits` 26626):
  1. Distance sets: work time from a per-activity pace (run 6 min/km; row 2:05/500 m; ski 2:10/500 m; swim 2:00/100 m; sled and carry 0.5 min per 20 m), plus rest.
  2. Rep sets: add 3 s per rep (top of the range; ×2 for `/side` or `/leg`).
  3. One warm-up ramp allowance of 4 min per day, for the first `WARMUP_ELIGIBLE_CATEGORIES` (27796) compound.

  The authored `duration` is left alone (no data change). It's documented as a reference only.
- **Acceptance criteria:**
  1. `parseEstimatedMinutes({sets:'8×100m', name:'Swim Intervals (100s)'})` is 18 ± 2.
  2. The Strength d1 total is within ±15% of its authored ~55.
  3. The share of days under 0.6× authored drops below 5% (a full sweep in the test).
  4. A real `applySessionLengthLimit(exercises, 30)` on Strength d1 still keeps the protected main unit, and its `estimatedMinutes` ≤ 30 + one unit. That's a new case: no suite covers the cap today.
- **Test plan:** new `test-session-time-estimate.js`, with the real `parseEstimatedMinutes`, `parseSetCount`, `getDefaultRestSeconds`, `unitMinutes`, `totalMinutesForUnits`, `groupIntoUnits` and `applySessionLengthLimit`, plus the sweep. Sabotage: remove the distance branch, and criterion 1 fails.
- **Files:** `index.html` (26501–26553, 26620–26635, 26926 onward), `sw.js`, the test. **Re-pin:** `test-lb-per-kg-consolidation.js:32–36` asserts `estimateExerciseCalories` (26554) for Back Squat 3×5 at 200 lb = 109 kcal, and that runs through `parseEstimatedMinutes`. `test-today-workout-emoji.js` stubs `estimateExerciseCalories` (line 81), so it's unaffected. The rep-time branch raises it, so re-capture the value from the real function and name it in the PR. The session calorie total on Today moves too; say so in What's New.
- **Risk:** how much the session-length cap trims changes for every program. Placed with BL-55 early in Phase 1 (slot 13d).
- **Fold-in (2026-11-08):** line numbers moved to v3.518. Criterion 4 was rewritten, because the suite it named tests layout, not the cap. The calorie re-pin was found.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; still no suite extracts `applySessionLengthLimit`, `unitMinutes` or `totalMinutesForUnits`. Scope unchanged.
- **Status:** ready

### BL-64: Cue contradictions (C-4)
- **Why:** these cues contradict the app's own squat cues, or the evidence:
  - Chair Pose (`content-exercises.js` 21) and Partner Chair Pose (50) say knees must not pass the toes [FRY03];
  - Good Morning (180) says "keep the bar path close to your body";
  - Front Lever Hold (171) says "hips slightly tucked";
  - Hammer Curl (241) puts the forearm emphasis on tempo;
  - Hanging Leg Raise (242) says the eccentric is "where the core works hardest".
- **Change** (text only, each a rewrite of the existing cue, so counts hold):
  - Chair and Partner Chair: "Let the knees travel forward as far as your heels stay down."
  - Good Morning: "Hinge until your torso nears parallel or your back starts to round, whichever comes first."
  - Front Lever: "Too hard? Tuck the knees to the chest and extend one leg as you progress."
  - Hammer Curl: "The neutral grip shifts work to the brachioradialis; keep the tempo you use for other curls."
  - Hanging Leg Raise: "Lower under control to a full hang."
- **Acceptance criteria:** the new strings render in `buildDetailsHtml` (28393). The phrase "not past" is absent from every squat-pattern cue (sweep).
- **Test plan:** extend `test-concise-cues.js` (its 321/964 counts and 24-word cap must still pass unchanged). Sabotage: restore the Chair Pose cue.
- **Files:** `content-exercises.js`, `sw.js` (version), the test. **Guards:** `test-concise-cues.js` (`MUST_KEEP` safety phrases), `test-masterclass-technique-render-consolidation.js`.
- **Risk:** none beyond copy. BL-25 also edits Front Lever Hold (filler cues): whichever ships second re-reads entry 171.
- **Fold-in (2026-11-08):** kept as its own version, not merged into BL-25 (one item, one version). Slot 6b, with the Phase 0 cue work.
- **Status:** ready

### BL-43: Running progression from your own logged distance
- **Why:**
  - Running scores **F** for progression (program-audit scorecard). `Easy Run 25-30 min`, `Long Run 45-60 min` and `400m Repeats 6×400m` never change.
  - The deload week doesn't touch duration-only rows (BL-48).
  - Current evidence points at the *single-session spike*, not the weekly 10% rule. A run more than 10% longer than the longest run of the previous 30 days raised overuse-injury rates (about +64% for 10–30%), while week-to-week change didn't [FRA25].
  - An easy-dominant (about 80/20) distribution is the supported default [SS14].
- **Change** (render-time suggestions only; the block clock is `DELOAD_CYCLE_WEEKS` 14957 and `cycleWeekOf` 26796):
  1. **`longestRunLast30Days()`**, read from the existing cardio corpus. Running-category names: Easy Run, Long Run, Tempo Run, Recovery Jog, Warm-up Jog, Cool-down Jog, Strides, 400m Repeats. Reuse `readExCorpus` (41226) and `groupCorpusByExercise` (41699); don't add a new reader. A run's distance is `distanceOf(entry)` (31585), in metres.
  2. **Long Run badge**, weeks 1–4: "Today's cap: X km (10% over your longest run in 30 days)". X = 1.10 × that longest run, snapped to 0.5 km or 0.25 mi. With no logged run, show the authored minutes only.
  3. **400m Repeats**, double progression on count before pace. 4 → 5 → 6 → 8 reps across build weeks, when every rep in the last session was within 3 s of the session's first rep. Above 8, suggest "move to 800s or 1 km reps" (text only). Coaching basis [PRAC].
  4. **Tempo Run**: +2 min per build week from the authored 20, capped at 30 min. Week 5 (deload) uses the authored value.
  5. **Weekly intensity check** on the Running Analysis card (`renderCardioTrend` 45945; weekly data from `computeWeeklyCardio` 45905): minutes logged at Tempo or Repeats vs the total. Show "Hard share this week: N%" with the target "about 20%" [SS14]. Display only.
  - **Spec gap found (spec refresh 3), needs the owner:** step 3's rule ("every rep within 3 s of the first") needs a time for each 400 m rep, and the app doesn't store one. `400m Repeats` is prescribed `6×400m`, so `getSetFieldUnit` (26454) gives it a **reps** field, not a time field; each set stores `{distance, reps}`, and `durationMinutesOf` (31593) refuses to read reps as time ("would produce a confident, completely fictional pace"). Minutes of the hard-share check (step 5) have the same gap for Repeats. See the question in Status.
- **Acceptance criteria:**
  1. With logs whose longest run in the last 30 days is 10.0 km, the Long Run badge on a week-2 render reads 11.0 km. With the longest on day 31 only, the badge falls back to the authored text.
  2. *(Under option (a), below.)* 400m Repeats whose last session logged every prescribed set (6 of 6, each with 400 m) suggests 8. With 5 of 6 logged, it suggests 6 (hold). Under option (b) the original timing rule applies instead.
  3. In a deload week, no cap or increase is shown, and BL-48's reduction applies.
  4. Nothing here writes an `ex:` key or a log entry. Snapshot the storage keys before and after a render.
  5. Non-running programs render byte-identical.
- **Test plan:** new `test-running-progression.js`. Use the real `readExCorpus` with a stubbed `window.storage`, the real badge builder, and a fake clock. Sabotage: drop the 30-day window, and criterion 1's day-31 case must fail.
- **Files:** `index.html` (badge builder near `buildProgressBadge` 27888; `computeWeeklyCardio` 45905 and `renderCardioTrend` 45945; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, the test. **Guards:** the suites that extract `readExCorpus` (`test-app-2-0.js`, `test-fetch-day-statuses.js`, `test-history-date-range-filter.js`, `test-performance-delta-colours.js`, `test-pr-timeline.js`, `test-pr-timeline-class-naming.js`); the three that extract `buildProgressBadge` (`test-deload-signal-week-awareness.js`, `test-today-workout-emoji.js`, and `test-rpe-safety-caps.js`, added by BL-02); and `test-emoji-check-icon-migration.js` (extracts `renderCardioTrend`). `renderWorkout` can't be driven in jsdom, so the badge's call site is pinned as one real call (comments stripped), as BL-10 does.
- **Risk:** the cardio corpus shape (distance in metres, minutes in reps). Don't touch `isDistanceExercise` here (that's BL-55). Ship after BL-48 and BL-55 (slot 38a).
- **Tools:** none extra.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped; `test-rpe-safety-caps.js` and `test-emoji-check-icon-migration.js` added as guards. Found: the 400 m consistency rule reads per-rep times the app never records (see Change). Criteria 1, 3, 4 and 5 are buildable as written.
- **Status:** ready (after BL-48) (owner 2026-11-09: option **(a)**, add reps once every prescribed rep is logged; no per-rep time stored. Build only (a)'s criteria.)

### BL-46: Cycling FTP anchor, retest, and interval progression
- **Why:**
  - Cycling scores **F** for progression. `FTP Intervals 3×10 min`, `Hill Repeats 6×5 min` and `Long Ride 90-120 min` are fixed, and the FTP cue (`content-exercises.js` 143) tells the rider to ride "at your FTP", while the app never stores one.
  - Power zones as a % of FTP, with FTP estimated as 95% of a 20-min test, are standard practice [AC].
  - A polarised distribution is the evidence-supported default [SS14].
- **Change:**
  1. **FTP preference** in `window.storage` (`cycling-ftp-w`), with an optional value in watts and an optional `ftp-tested` date. It's set from a small field on the Cycling program card (an existing `expand-wrap` pattern; `renderCyclingSelector` 15704).
  2. **Targets.** With an FTP set, interval rows show watt targets:
     - FTP Intervals 95–105%;
     - Hill Repeats 88–94% (sweet spot);
     - Sprint Intervals (Bike) "max";
     - Endurance and Long Ride ≤ 75%.

     Without one, keep the RPE text.
  3. **Retest prompt** in week 1 of a block when `ftp-tested` is older than 6 weeks: "20-min test today: FTP = 95% of average power" [AC]. The rider enters a number; nothing is automatic.
  4. **Time-in-zone progression** across build weeks 1–4:
     - FTP Intervals 3×10 → 3×12 → 2×20 → 3×15 min;
     - Hill Repeats 6×5 → 7×5 → 8×5 → 6×6;
     - Long Ride +15 min per week, capped at the authored upper bound + 30 min.

     Week 5 uses the BL-48 deload.
  5. Mountain style: Standing Climb Repeats 6×3 → 7×3 → 8×3 → 6×4. Technical Trail Ride is unchanged (a skill session).
- **Acceptance criteria:**
  1. FTP 250 W: the FTP Intervals row shows "238–263 W", and Hill Repeats shows "220–235 W".
  2. A week-3 render: FTP Intervals reads "2×20 min". Week 5 reads the deload value.
  3. `ftp-tested` 43 days old in week 1 shows the retest prompt; 41 days old doesn't.
  4. Without an FTP, the rows render the authored text exactly.
  5. The progression is a render-time string transform like `applyAccumulation` (26780). It never writes an exercise slot, so the `exKey`s are unchanged.
- **Test plan:** new `test-cycling-ftp.js`, with the real render-time transforms and a stubbed storage. Sabotage: remove the week mapping, and criterion 2 fails.
- **Files:** `index.html` (`CYCLING_STYLES` 12419, `renderCyclingSelector` 15704, a render-time transform beside `applyAccumulation` 26780), `sw.js`, the test. **Guards:** `test-volume-modifier-gate.js` and `test-accumulation-accessory-add.js` (extract `applyAccumulation`), `test-lb-per-kg-consolidation.js` (extracts `parseEstimatedMinutes`).
- **Risk:**
  - `CYCLING_STYLES` and their day-count variants are swapped at runtime (`applyDaysPerWeekProgramData` 26002), so the transform must key on the exercise name, not the day.
  - The interval-string parse must not break `parseEstimatedMinutes`. Assert that the estimate for "2×20 min" is 41 (confirmed against the round-count branch at 26474).
- **Tools:** none extra.
- **Status:** parked (owner no 2026-11-08: "46 b"; the RPE text stays).

### BL-47: Swimming CSS anchor and set progression
- **Why:**
  - Swimming scores **F** for progression: Threshold Swim Set 4×200m and Swim Intervals 8×100m never change.
  - The timer gives 60 s of rest where the cue says 15–30 s (audit D-11; fixed in BL-57).
  - Critical swim speed (CSS), from a 400 m and a 200 m time trial, is a validated threshold index [WAK92]. It's the swimming equivalent of FTP.
- **Change:**
  1. **CSS preference** in `window.storage`: T400 and T200 in seconds, plus the test date. CSS pace per 100 m = (T400 − T200) / 2.
  2. **Targets:**
     - Threshold Swim Set: "at CSS pace (m:ss/100m), 20 s rest";
     - Swim Intervals: "CSS − 3–5 s/100m, 15–20 s rest";
     - Easy and Long Swim: "CSS + 10–15 s/100m".
  3. **Progression** across build weeks 1–4:
     - Threshold 4×200 → 5×200 → 6×200 → 4×300;
     - Intervals 8×100 → 10×100 → 12×100 → 8×100 on 5 s less rest.

     Week 5: the BL-48 deload.
  4. **Retest prompt** in week 1 when the CSS test is older than 6 weeks: "Swim 400 m, then 200 m, all-out, with 5–10 min easy between".
  5. **Rest timer:** delivered by BL-57, which owns the rest parser. This item only depends on it.
- **Acceptance criteria:**
  1. T400 = 6:00 and T200 = 2:50 gives CSS 1:35/100m, and the Threshold row shows "1:35/100m".
  2. Week 2: Threshold reads "5×200m".
  3. Without CSS stored, the authored text is unchanged.
  4. No slot or key changes (the same snapshot check as BL-43).
- **Test plan:** new `test-swimming-css.js`. Sabotage: swap T400 and T200, and criterion 1 must fail.
- **Files:** `index.html` (the Swimming card; the same render-time transform as BL-46, shared rather than duplicated), `sw.js`, the test.
- **Risk:** as BL-46. Ship BL-46 first so the transform exists, then extend it.
- **Tools:** none extra.
- **Status:** parked (owner no 2026-11-08: "47 b").

### BL-48: The deload week also shortens duration-only cardio
- **Why:**
  - `applyDeloadVolumeReduction` (26916) changes only strings with a leading set count (`hasNumericSetPrefix` 26587). In week 5, `6×400m` becomes 3×400m, but `Long Run 45-60 min`, `Long Ride (Zone 2) 90-120 min`, `Endurance Ride 45-60 min` and `Long Swim 30-45 min` stay full length.
  - So the deload cuts the intervals and keeps the biggest aerobic load. A deload typically cuts volume by about 30–50% [BELL23].
- **Change:**
  - In the deload branch only, rows whose `sets` is a pure duration (`/^\d+(\s*-\s*\d+)?\s*min\b/`) and whose category is `cardio` get their minutes × 0.7, rounded to 5. Warm-up and cool-down rows are excluded (`isWarmupOrCooldownUnit` 26637 defines them for units; for a single row use the same name test it applies).
  - `applyDeloadVolumeReduction(exercises, program)` gains the program, passed from its one call site (`renderWorkout` 28813), so `medical` days keep their authored durations.
  - The duration line's "(deload)" suffix (28852) already keys off `inDeloadWeek`, so no marker is needed.
- **Acceptance criteria:**
  1. The real `applyDeloadVolumeReduction` over the real running day holding `Long Run 45-60 min` (10390) returns `30-40 min`, and over road d6's `Long Ride (Zone 2) 90-120 min` (12489) returns `65-85 min`.
  2. Warm-up Jog `10 min` is unchanged.
  3. Weeks 1–4 are byte-identical to today.
  4. Lifting rows reduce exactly as v3.527 does (Squat `4×4-6` → `2×4-6`, the existing ×0.55 rule).
  5. A medical `Walking 20-30 min` row is unchanged in week 5 (program `'medical'`).
  6. `renderWorkout` makes exactly 1 real `applyDeloadVolumeReduction(` call and passes `activeProgram` (comments stripped).
- **Test plan:** new `test-deload-duration-cardio.js`, with the real `applyDeloadVolumeReduction`, `hasNumericSetPrefix`, `parseSetCount` and `replaceSetCount`. No suite extracts `applyDeloadVolumeReduction` today. Sabotage: remove the duration branch.
- **Files:** `index.html` (26916–26924, 28813), `sw.js`, the test. No suite extracts `applyDeloadVolumeReduction` at v3.527. **Guards:** `test-deload-signal-week-awareness.js`, `test-manual-deload-override.js`, `test-mesocycle-phase-tag.js`.
- **Risk:** medical styles have walking rows; the program argument excludes them, in keeping with BL-01's clinical stance. Placed after BL-23 (slot 24a), with the other deload work.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The `deloaded` marker was dropped (the suffix already exists). The medical exclusion became a program argument and criterion 5.
- **Tools:** none extra.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; criteria 1, 4 and 6 made real invocations (criterion 4 pointed at another suite's expectations). Scope unchanged.
- **Status:** ready

## Program extensions: BL-41, BL-42, BL-44 and BL-45 (exercise-auditor, 2026-11-09, against v3.528)

Written against `index.html` and `content-exercises.js` at **v3.528** (`origin/Branch-1` cf8985b). The baseline was green: `check.sh` passed and 204/204 `test-*.js` suites passed. Line numbers are v3.528's. These sit at roadmap slot 88 (88a–88d), after Phase 3, so slots 1–87 land first and **every build re-greps**. They replace the slot-88 placeholder.

What these items keep, from decisions already made:
- **BL-01's program gate.** Nothing here adds sets through goal volume or accumulation. BL-41's taper only removes sets, on Powerlifting only.
- **BL-02 and BL-69's clinical rules.** `rpeTargetFor` (27527) is untouched: `oly`, `jump` and `throw` stay `null`, and `medical` and `senior` stay capped at RPE 7. BL-44 is off on `medical` and `senior`, as BL-11 is. No item reaches a clinical style.
- **BL-24's 5 lb floors.** All loads snap through `snapToLoadable` (32937). BL-42's miss drop is never smaller than the smallest loadable step.
- **The history-key work (BL-51, BL-52, BL-72, BL-74).** No item changes an `ex:` key, a slot index or `__srcIndex`. BL-41 and BL-42 put their rules in code, not in the program data. BL-44's rungs use the existing `:sub:` keys (`exKey` 27067). BL-45's fields are additive on the set, like `distance`, `note` and `rest`.
- **RPE mode.** BL-41 is RPE mode only. BL-42 works in both modes, because `oly` has no RPE target.
- **D15 (cards lead with sets, not tonnage).** Taper copy says "sets", never "volume load". Jump and sprint numbers stay off share cards and out of any total.

All four are now ready after Phase 3. The owner answered "41a, 42a, 45a" on PR #99 (2026-11-09), and BL-42's 0-rep fix was pulled forward as **BL-77** (slot 9c).

**Source keys for this section.** Several hosts couldn't be fetched this session: `www.ncbi.nlm.nih.gov`, `www.mdpi.com` and `www.frontiersin.org` don't resolve here. Figures marked "abstract" or "secondary" were read from search summaries, not full texts. The keys below are new; [ACSM26], [BELL23] and [PRAC] are `program-audit.md`'s.

| Key | Source | Checked |
|---|---|---|
| [TRA20] | Travis, Mujika, Gentles, Stone & Bazyler 2020, "Tapering and peaking maximal strength for powerlifting performance: a review", Sports 8(9):125, doi 10.3390/sports8090125. Tapers cut volume and keep intensity; the evidence is mostly observational and qualitative. | abstract only |
| [TRA21] | Travis et al. 2021, "Characterizing the tapering practices of United States and Canadian raw powerlifters", JSCR (364 lifters). Most often a 7–10-day step taper with volume-load cut by 41–50%; highest intensity about 2 weeks out; highest volume 5–8 weeks out. | abstract plus secondary |
| [PRI16] | Pritchard, Tod, Barnes, Keogh & McGuigan 2016, "Tapering practices of New Zealand's elite raw powerlifters", JSCR 30(7):1796–1804. Volume cut 58.9 ± 8.4% with intensity kept or slightly lowered (interviews, n = 11). | secondary; taper length not confirmed |
| [PRI18] | Pritchard et al. 2018, "Short-term training cessation as a method of tapering to improve maximal strength", JSCR 32(2):458–465. After 4 weeks of training, 3.5 or 5.5 days off didn't lower strength; CMJ height and isometric bench force rose versus baseline. | abstract |
| [ZOU16] | Zourdos et al. 2016, "Novel resistance training-specific RPE scale measuring repetitions in reserve", JSCR 30(1):267–275. | not re-fetched |
| [HEL18] | Helms et al. 2018, "RPE vs. percentage 1RM loading in periodized programs matched for sets and repetitions", Front Physiol 9:247. | not re-fetched |
| [LAR21] | Larsen, Kristiansen & van den Tillaar 2021, PeerJ 9:e10663, systematic review (14 studies, 356 participants). RPE/RIR, flexible and velocity-based autoregulation all raised 1RM. | abstract |
| [PRIL] | Prilepin's table (Soviet weightlifting logs, 1960s–70s): 70–80% → 3–6 reps per set, 12–24 total; 80–90% → 2–4, 10–20; 90%+ → 1–2, 4–10. | secondary only; no primary located |
| [SUC15] | Suchomel, Comfort & Stone 2015, "Weightlifting pulling derivatives: rationale for implementation and application", Sports Med 45(6):823–839. Pulls without a catch can be loaded above the catch lift's 1RM; related work used up to 120% (floor clean pull) and 140% (mid-thigh pull). | secondary; the review's exact % not confirmed |
| [MISS] | Missed-lift rules in weightlifting (Catalyst Athletics articles on minimising misses). No published "2 misses → drop 5%" or "3 misses → stop" rule was found. | practice only |
| [EBB11] | Ebben et al. 2011, "Kinetic analysis of several variations of push-ups", JSCR 25:2891–2894. Peak force as a share of body mass: knee push-up 0.49, hands on a 30 cm box 0.55, standard 0.64, feet on a 30 cm box 0.70, feet on a 61 cm box 0.74. | secondary |
| [KOT18] | Kotarsky et al. 2018, "Effect of progressive calisthenic push-up training on muscle strength and thickness", JSCR. Push-up variations progressed over 4 weeks raised bench 1RM like bench training did (n = 23). | abstract and thesis |
| [SCH21] | Schoenfeld, Grgic, Van Every & Plotkin 2021, "Loading recommendations for muscle strength, hypertrophy, and local endurance: a re-examination of the repetition continuum", Sports 9(2):32. Hypertrophy is similar across a wide load range near failure; strength favours heavier loads. | not re-fetched |
| [CLA17] | Claudino et al. 2017, "The countermovement jump to monitor neuromuscular status: a meta-analysis", J Sci Med Sport 20(4):397–402. The average jump was more sensitive than the best jump for detecting fatigue and supercompensation. | abstract |
| [SMG11] | Sánchez-Medina & González-Badillo 2011, MSSE 43(9):1725–1734. Velocity loss within a set tracks fatigue; it correlates with CMJ height loss. | not re-fetched; indirect for jumps |
| [NSCA-PLY] | NSCA plyometric volume guide: about 80–100 ground contacts per session for beginners, 100–120 for intermediates, 120–140 for advanced. | secondary study guides; primary text not located |
| [MAY10] | Mayhew et al. 2010, JSCR. Hand-timed 40 yd dashes were 0.22 s (about 4%) faster than electronic timing. | abstract via secondary |
| [HAU19] | Haugen, Seiler, Sandbakk & Tønnessen 2019, "The training and development of elite sprint performance", Sports Med Open 5:44. Sprint work is done near-fresh, with long recoveries. | not re-fetched |

### BL-41: Powerlifting top single at RPE 8 with −10% back-offs, plus an optional meet peak
- **Why:**
  - Powerlifting scores **W** for progression in the audit: "no top sets, peaking or %1RM". Its competition lifts (`programs.powerlifting` 10507) are Squat `5×5` (d1), Bench Press `5×5` (d2) and Deadlift `5×3` (d4). They run on the same double progression, or in RPE mode the same weekly ramp (`RPE_BY_CYCLE_WEEK` 27486, 7.5 → 9), as every accessory. Nothing sets the day's load from a heavy single, and nothing tapers for a meet.
  - **Top single.** A daily top single rated on the RIR-based RPE scale is the standard autoregulated way to set a strength day's load (RTS/Tuchscherer practice [PRAC]). The scale is valid in trained lifters [ZOU16]. RPE loading matched or beat %1RM loading at equal sets and reps [HEL18]. A 14-study review found every autoregulation method raised 1RM [LAR21].
  - **The −10% back-off** is practice [PRAC]. It fits the app's own maths: a single at RPE 8 is 1/1.1 ≈ 91% of e1RM (`loadForRpeTarget` 27472). Fives at 90% of that (≈ 82% of e1RM) land near RPE 8.3, the same effort zone as the weekly ramp they replace.
  - **Peaking.** Tapers cut volume and keep intensity [TRA20]. North American lifters most often used a 7–10-day step taper, cutting volume-load by 41–50%, with their heaviest work about 2 weeks out [TRA21]. Elite lifters cut volume by about 59% [PRI16]. 3.5 or 5.5 days off didn't cost strength [PRI18]. The deload consensus also cuts volume rather than intensity [BELL23]. Audit §5 asks for "taper volume about 40–60% over the final 2 weeks".
  - **Not repeated here:** the audit's stall rule (3 sessions without a gain → change the variation) is BL-26's text option. The per-lift e1RM line is UX-10's.
- **Change.** Ships as **two versions**: part 1, then part 2, each with its own test, sabotage and What's New line.

  **Part 1: the top single (RPE mode only; no program data changes).**
  1. **`isTopSingleRow(ex, program)`**, a pure helper beside `rpeTargetFor` (27527). It's true only when all of these hold:
     - `program === 'powerlifting'` and `loadSuggestionMode === 'rpe'` (32660);
     - the name is Squat, Bench Press or Deadlift;
     - the row isn't custom, body-goal focus or a swapped substitute (`__isSubbed`);
     - `parseSetCount(ex.sets) >= 3` and `parseTopRep(ex.sets) <= 5`.

     At v3.528 that's d1 Squat, d2 Bench Press and d4 Deadlift, plus their twins in `PROGRAM_DAY_COUNT_VARIANTS.powerlifting` (17072). Bench `4×8` (d5) and the 1-day variant's Deadlift `1×5` are excluded. The rule lives in code, so no `ex:` key, slot or `__srcIndex` moves.
  2. **`singleRpeFor(peakPhase, inDeload)`** returns:
     - 8 normally;
     - 9 in part 2's `'peak'` phase and 7 in `'openers'`;
     - `null` in a deload week or the `'rest'` phase. With `null` there's no single, and set 1 is an ordinary set under the existing rule.
  3. **`topSingleSuggestion(setIdx, {e1rmLb, exName, bottomRep, singleRpe, lastSingleLb, todaySingleLb})`** returns display units:
     - **Set index 0:** `snapToLoadable(toDisplayWeight(loadForRpeTarget(e1rmLb, 1, singleRpe)), exName, 'down')`, 1 rep, reason `'top-single'`. When a previous single exists, it's capped at last single × 1.05, snapped down. One mis-rated set can't inflate next week's single by more than 5%.
     - **Index 1 or more:** base = today's logged single if there is one, else the index-0 suggestion. The weight is base × 0.90 snapped down, at `bottomRep` reps, reason `'backoff'`.
     - `null` when `e1rmLb` is `null`. The badge then gives words only: "Work up to a single that feels like RPE 8 (about 2 reps left), then the other sets 10% lighter."
  4. **`renderWorkout` (28713).** For a top-single row:
     - The set-row loop (29136) and the first-set call (29041) take `topSingleSuggestion` instead of `computeSuggestedSet`. The warm-up ramp then builds to the single, through the existing `chooseRampBasis` (28121).
     - The badge (28964) reads: "Top single at RPE 8 (about 2 reps left): around 360 lb. Then 4×5 at about 320 lb (10% lighter)."
     - The `.exercise` header gets `data-top-single="1"`.
  5. **Set to set.** `recommendNextSet` (30937) gains an optional fifth argument, `topSingle = {backoffPct: 0.9, prevWasSingle}`:
     - After the single (`prevWasSingle`), it returns `dir:'down'`, a weight of `floor(w × 0.9 / step) × step`, and `bottomRep` reps. The `why` text is "Back-offs: 10% under today's single".
     - After a back-off, it returns `same`: back-offs don't climb from set to set.

     `renderSetChips` (30973; the call is at 31000) passes it when `presc.dataset.topSingle` is set, with `prevWasSingle = Number(row.dataset.setIdx) === 1`. The other three callers keep four arguments and today's results.
  6. **Signals stay honest.** A top-single row feeds `analyzeProgressionSignal` from the back-offs: before `buildPastSessions`, each entry drops set index 0 when that set has `reps === 1` and the entry has 2 or more sets. The copy is fresh; nothing stored changes. This applies at all three signal sites: the heads-up (14594), the fit check (27720) and `renderWorkout` (28950).
     - Without this, the single becomes `topSetOf`'s top set (27227). The first session then reads as a `decrease` (1 rep under the 5-rep floor), and signal 3 never fires again.
     - `rpeCtx.e1rm` (28954) keeps the unstripped sessions, so the single feeds the e1RM through BL-34's RPE adjustment.

  **Part 2: the meet peak.**
  7. **A meet date**, stored in `window.storage` as `pl-meet-date` (an ISO date). It's set or cleared from a date field on the Powerlifting card in `renderProgramSelector` (15542), using the existing `expand-wrap` pattern, and shows only while Powerlifting is active. It's exported in backups like any other key; BL-68 only excludes `*-api-key`.
  8. **`peakPhaseFor(meetIso, dayIso)`.** Days out = the meet date minus `selectedLogDate`, so backdating reads the right day:
     - 8–14 days → `'peak'`;
     - 4–7 → `'openers'`;
     - 0–3 → `'rest'`;
     - anything else, including after the meet → `null`. Nothing is written when the peak ends.
  9. **`applyPeakVolume(exercises, phase)`**, beside `applyDeloadVolumeReduction` (26919), using the same `hasNumericSetPrefix`, `parseSetCount` and `replaceSetCount`:
     - `'peak'`: `max(1, round(n × 0.6))`;
     - `'openers'`: `max(1, floor(n × 0.5))`;
     - custom rows are untouched.

     On powerlifting d1, that's 14 sets → 9 in `'peak'` (−36%) and 14 → 5 in `'openers'` (−64%), about −50% across the two weeks [TRA21][PRI16].
  10. **In `renderWorkout` (28813–28824)**, when `activeProgram === 'powerlifting'` and the phase isn't `null`, `applyPeakVolume` replaces the whole deload/accumulation branch. A deload week inside the window doesn't cut a second time, and accumulation doesn't add sets.
  11. **Copy:**
      - `'peak'` single: "Heaviest single of the prep: RPE 9, no grinders."
      - `'openers'` single: "Your opener should feel like this: RPE 7."
      - `'rest'`: every lifting row's badge reads "Meet in N days: rest from lifting." with no ghost load (no suggestion is computed).
      - Counts are always given in sets (D15).
- **Acceptance criteria** (real invocations of the extracted helpers; `renderWorkout` can't be driven in jsdom, so its call sites are pinned as real-call counts with comments stripped):
  1. `isTopSingleRow` is true for powerlifting d1 Squat, d2 Bench Press and d4 Deadlift in RPE mode. It's false for:
     - d5 Bench `4×8`;
     - any row in progression mode;
     - `strength` d1 Squat;
     - a custom row, and a row with `__isSubbed`.

     A sweep over `PROGRAM_DAY_COUNT_VARIANTS.powerlifting` lists every true row; the 1-day Deadlift `1×5` is false.
  2. In lb with the default plates:
     - `topSingleSuggestion(0, {e1rmLb:400, exName:'Squat', bottomRep:5, singleRpe:8})` gives `{weight:360, reps:1}`;
     - index 2 with no single logged today gives `{weight:320, reps:5}`;
     - with `todaySingleLb:370`, index 1 gives 330.
  3. With `lastSingleLb:340` and e1RM 400, index 0 gives 355 (340 × 1.05 = 357, snapped down), not 360.
  4. `recommendNextSet({weight:'360', reps:'1', rpe:'8'}, '5×5', 5, false, {backoffPct:0.9, prevWasSingle:true})` gives weight `'320'`, reps `'5'`. With `prevWasSingle:false` and a back-off of 320×5 at RPE 7, it gives `dir:'same'`. Called with four arguments, both inputs give exactly v3.528's results.
  5. A Squat log, newest first:
     - today−7: `[{360,1,rpe 8}, {320,5}, {320,5}, {320,5}, {320,5}]`;
     - today−14: five sets of `{315,5}`.

     After the strip, `analyzeProgressionSignal(..., 'squat', 'powerlifting')` gives no `decrease`. Without the strip, the same log gives `decrease`, which proves the strip is doing the work.
  6. `singleRpeFor(null,false)` = 8, `('peak',false)` = 9, `('openers',false)` = 7, `('rest',false)` = `null`, `(null,true)` = `null`.
  7. `peakPhaseFor('2026-12-20', d)`:
     - 2026-12-06 (14 days out) and 12-12 (8) → `'peak'`;
     - 12-13 (7) and 12-16 (4) → `'openers'`;
     - 12-17 (3) and 12-20 (0) → `'rest'`;
     - 12-05 (15) and 12-21 → `null`.
  8. `applyPeakVolume` on the real powerlifting d1, `'peak'`: Squat `5×5` → `3×5`, Pause Squat `3×3` → `2×3`, Leg Press `3×8-10` → `2×8-10`, Weighted Sit-up `3×12` → `2×12`. In `'openers'`: `2×5`, `1×3`, `1×8-10`, `1×12`. A custom row is unchanged.
  9. Every other program is unaffected. Over every key of `programs` (iterate, and assert the count) and every `PROGRAM_DAY_COUNT_VARIANTS` day, `isTopSingleRow` is true only on Powerlifting rows.
  10. Real-call counts in `renderWorkout`: 1 `isTopSingleRow(`, 2 `topSingleSuggestion(` (the first-set and set-row sites), 1 `peakPhaseFor(`, 1 `applyPeakVolume(`. In `renderSetChips`: 1 `recommendNextSet(` call, which now passes a fifth argument.
  11. Part 2 only: `test-import-backup-full-replace.js` round-trips `pl-meet-date`. Snapshot the storage keys before and after calling the pure helpers: they write nothing.
- **Test plan:** new `test-powerlifting-top-single.js` (part 1) and `test-powerlifting-peak.js` (part 2).
  - They use the real `isTopSingleRow`, `singleRpeFor`, `topSingleSuggestion`, `loadForRpeTarget`, `rirFromRpe`, `snapToLoadable`, `getEquipment`, `BARBELL_STANDARDS`, `BARBELL_EXERCISES`, `isBarbellExercise`, `toDisplayWeight`, `parseSetCount`, `parseTopRep`, `parseBottomRep`, `recommendNextSet`, `buildPastSessions`, `topSetOf`, `analyzeProgressionSignal`, `peakPhaseFor`, `applyPeakVolume`, `hasNumericSetPrefix`, `replaceSetCount`, `programs` and `PROGRAM_DAY_COUNT_VARIANTS`.
  - Sabotage:
    - drop the strip, and criterion 5 fails;
    - drop the 1.05 cap, and criterion 3 fails;
    - swap the `'peak'` and `'openers'` factors, and criterion 8 fails.
- **Files:**
  - `index.html`:
    - new helpers beside `rpeTargetFor` 27527;
    - `applyPeakVolume` beside 26919;
    - `renderWorkout` 28813–28824, 28950–28964, 29041, 29136, plus the header markup;
    - `getSessionHeadsUpInsight` 14594 and `computeProgramFitTrend` 27720;
    - `recommendNextSet` 30937, and `renderSetChips` 30973–31000;
    - `renderProgramSelector` 15542 (part 2);
    - `APP_VERSION` 7625 and `WHATS_NEW` 7643.
  - `sw.js` and the two tests.
  - **Guards (expected unchanged; re-pin only if one breaks, and name it in the PR):**
    - `test-next-set-recommendation.js`, `test-set-chips.js` and `test-exercise-logger.js`: four-argument `recommendNextSet`;
    - `test-gym-set-chips.js` and `test-gym-warmup-chips.js`: `renderSetChips`, whose blocks have no `data-top-single`;
    - `test-rpe-safety-caps.js`, `test-deload-signal-week-awareness.js` and `test-today-workout-emoji.js`: `buildProgressBadge`;
    - `test-program-fit-trend.js`, and the four `getSessionHeadsUpInsight` suites (`test-cycle-phase-nutrition-insight.js`, `test-region-override.js`, `test-supplement-condition-cycle-nudge.js`, `test-today-emoji-free.js`);
    - the seven `wireSetsBlock` suites that stub `buildPastSessions`;
    - `test-volume-modifier-gate.js` and `test-accumulation-accessory-add.js`: the deload/accumulation branch;
    - `test-program-overview.js`, `test-cycle-tracking-opt-out.js` and `test-profile-save-zero-value.js`: `renderProgramSelector`, part 2;
    - `test-import-backup-full-replace.js`: part 2.
- **Risk:**
  - **Needs BL-34 (slot 81).** Without BL-34's RPE-adjusted e1RM, a single is read as a 1-rep max (Epley). Then 360×1 gives e1RM 372, and the next single comes out at 335: the single ratchets down every week. Also after BL-08 (slot 10), BL-26 (26) and BL-72/BL-74.
  - Back-off sets show more weight in set 1 than the 5×5 lifter is used to. The What's New line says so, and it's RPE mode only.
  - The three signal call sites must agree, or the fit check will call Powerlifting under-progressing.
- **Tools:** `code-review` at high (progression path).
- **Owner answer (2026-11-09, PR #99, "41a"):** (a), both: the top single in RPE mode, plus the stored meet date (`pl-meet-date`) and the two-week taper. Build both parts as written, as two versions.
- **Status:** ready (after Phase 3, after BL-34). Slot 88a.

### BL-42: Olympic % bands per lift, with a miss counter
- **Why:**
  - Olympic scores **F** for progression in the audit: "+10 lb Epley-based DP on snatch". Since v3.519 (BL-02), `oly` has no RPE target, so Snatch `5×2`, Clean & Jerk `5×2`, the pulls and the power variants (`programs.oly` 9925) run on plain double progression. That's +10 lb today, and +5 lb after BL-24. Nothing ties a weight to the lifter's best lift, and nothing reacts to a missed lift.
  - Weightlifting is coached by percentage zones of the competition lifts. Prilepin's table pairs 70–80% with 3–6 reps per set, 80–90% with 2–4, and 90%+ with 1–2 [PRIL]. The program's own comment calls its doubles "coaching-school consensus" (9931–9941), and this item stays inside that.
  - Pulls without a catch can be loaded above the lift's own max [SUC15].
  - Coaches limit misses, because a missed lift rehearses a failed pattern. The rule thresholds here are practice; no published numbers were found [MISS].
  - **Precondition, done first: BL-77 (slot 9c).** Since BL-77, a 0-rep set is a miss and never a made lift (`topSetOf`, `saveExSet`'s PR check, `maxWeightEver`, and so `reconstructAllPRs`). BL-42's reference max and miss counter rely on that. The owner pulled it forward on 2026-11-09.
- **Change:**
  1. *(Moved to BL-77, slot 9c, which ships first.)* The steps below assume a 0-rep set is already a miss.
  2. **`OLY_BAND_LIFTS`**, beside `rpeTargetFor` (27527): Snatch → ref Snatch, `comp`; Clean & Jerk → ref Clean & Jerk, `comp`; Power Snatch → ref Snatch, `power`; Power Clean → ref Clean & Jerk, `power`; Snatch Pull → ref Snatch, `pull`; Clean Pull → ref Clean & Jerk, `pull`.
     - Clean pulls are set against the clean & jerk, which most lifters jerk less than they clean, so the band errs light.
     - Snatch Balance, Overhead Squat, Jerk Dip Squat, Push Press and the squats keep today's progression.
  3. **`OLY_BANDS`**, as % of the reference, by kind and cycle week (`cycleWeekOf` 26796; the deload is the existing `isDeloadWeek` flag):

     | kind | wk 1 | wk 2 | wk 3 | wk 4 | deload |
     |---|---|---|---|---|---|
     | `comp` | 70–75 | 75–80 | 80–85 | 85–90 | 60–70 |
     | `power` | 55–60 | 60–65 | 65–70 | 70–75 | 50–60 |
     | `pull` | 90–95 | 95–100 | 100–105 | 105–110 | 80–90 |

     - `comp` doubles sit inside Prilepin's 70–90% zones [PRIL].
     - `power` triples are set against the full lift: a power max is commonly about 80–85% of the full lift [PRAC], so this is about 65–90% of a power max.
     - `pull` follows [SUC15], staying below its 120% figure.
  4. **`olyReferenceMax(entries, todayIso)`**: the heaviest weight with `reps >= 1` in the 84 days before today. It reads the reference lift by name through `readExCorpus` (41226) and `groupCorpusByExercise` (41699), so Snatch Pull reads the snatch, and through BL-51's `entriesForExercise` where it applies. It's `null` when there's no such set.
  5. **`olyBandFor(name, week, inDeload, refLb)`** returns `{lo, hi}` in display units. `lo` snaps up and `hi` snaps down (`snapToLoadable`). If they cross, both become the snapped midpoint. It returns `null` when the lift isn't listed or there's no reference.
  6. **Render.** Only when `activeProgram === 'oly'` (default days and variants, 16810):
     - `renderWorkout` reads the corpus once and sets `rpeCtx.band` (28954).
     - `computeSuggestedSet` (27983) returns `{weight: lo, reps: bottomRep, reason: 'band'}` for working sets when `rpeCtx.band` exists, in both load modes. The RPE path stays unreachable, because `rpeTargetFor` is `null` for `oly`.
     - The badge (`buildProgressBadge` 27888, through its technique-lift branch, which keeps the "Technique lift:" prefix) reads: "Technique lift: week 2, 75–80% of your best snatch (200 lb): 150–160 lb. Every rep fast; a slow or pressed-out rep counts as a miss."
     - With no reference, today's double progression applies (BL-24's 5 lb `oly` floor), plus "Week 4's heavy singles set your reference."
     - The header gets `data-oly-band="1"`.
  7. **Week 4, `comp` lifts only.** After the prescribed doubles, with no miss so far today, the lifter may add up to 3 singles at 90–95%, stopping at the first miss. That's 13 reps in total, 3 of them at 90%+, inside [PRIL]. A set with an index beyond `parseSetCount(ex.sets)` is a single (target 1 rep). The best made single becomes the new reference, which is how the bands rise.
  8. **`olyMissAdvice(doneSets, setsStr)`**, over today's logged sets for the row, in order (`{weight, reps, setIdx}`):
     - the target is `parseTopRep` below `parseSetCount`, and 1 beyond it;
     - misses per set = `max(0, target − reps)`.

     It returns:
     - 3 or more misses today → `{type:'stop'}`: "Three misses today: finish this lift and move on."
     - 2 or more misses at the last set's weight → `{type:'drop', weight}`: "Two misses at 170 lb: drop to 160 lb and make clean reps before going back up." The weight is last − max(5% of last, smallest loadable step), snapped down.
     - otherwise `null`.

     `renderSetChips` (30973) calls it before `recommendNextSet` when the header has `data-oly-band`, and its result wins.
  9. **The badge adds last session's misses** when there were any, counted the same way: "Last session: 2 misses at 170 lb."
- **Acceptance criteria** (real invocations; `renderWorkout` call sites are pinned as real-call counts with comments stripped):
  1. *(BL-77's criteria; they must still pass. `test-zero-rep-miss.js` runs unchanged.)*
  2. `olyReferenceMax` over entries 200×2 (80 days ago), 210×0 (10 days ago) and 190×2 (5 days ago) returns 200. With only an entry 85 days old, it returns `null`.
  3. In lb with the default plates:
     - `olyBandFor('Snatch', 2, false, 200)` = 150–160;
     - `('Snatch Pull', 1, false, 200)` = 180–190;
     - `('Power Snatch', 4, false, 200)` = 140–150;
     - `('Snatch', 1, true, 200)` = 120–140.

     In kg, `('Snatch', 1, false, 100)` = 70–75.
  4. Real `computeSuggestedSet` with `rpeCtx.band = {lo:150, hi:160}` returns weight 150 with reason `'band'`, in both load modes. A counting stub of `loadForRpeTarget` records 0 calls. BL-02's criterion 2 in `test-rpe-safety-caps.js` (no band) passes unchanged.
  5. `olyMissAdvice` on `5×2`:
     - [170×2, 170×1, 170×1] → drop to 160;
     - [170×2, 170×1] → `null`;
     - [170×1, 165×1, 160×1] → stop (3 misses, no two at one weight);
     - a set at index 5 with 1 rep → 0 misses (a week-4 single).
  6. Every other program is unaffected: real `computeSuggestedSet` without `band` returns v3.528's outputs over a fixture snapshot that includes Power Clean on a non-oly row.
  7. Real-call counts: 1 `readExCorpus(` and 1 `olyBandFor(` in `renderWorkout`, both behind the program check; 1 `olyMissAdvice(` in `renderSetChips`.
  8. No render writes anything (snapshot the storage keys).
- **Test plan:** new `test-oly-bands-and-misses.js`.
  - It uses the real `topSetOf` (as BL-77 left it), `groupCorpusByExercise`, `olyReferenceMax`, `olyBandFor`, `OLY_BANDS`, `OLY_BAND_LIFTS`, `cycleWeekOf`, `snapToLoadable`, `getEquipment`, `computeSuggestedSet`, `olyMissAdvice`, `parseSetCount`, `parseTopRep` and `parseBottomRep`.
  - Sabotage:
    - make `olyReferenceMax` accept `reps >= 0`, and criterion 2 fails (the 210×0 miss becomes the reference);
    - drop the 84-day window, and criterion 2 fails;
    - count misses per session instead of per weight, and criterion 5's second case fails.
- **Files:**
  - `index.html`:
    - the new consts and helpers beside 27527;
    - `computeSuggestedSet` 27983, `buildProgressBadge` 27888;
    - `renderWorkout` 28954 plus the header markup;
    - `renderSetChips` 30973–31000;
    - `APP_VERSION` 7625 and `WHATS_NEW` 7643.
  - `sw.js` and the test.
  - **Guards:**
    - `test-zero-rep-miss.js` (BL-77);
    - `test-rpe-safety-caps.js`, `test-deload-signal-week-awareness.js` and `test-today-workout-emoji.js`;
    - the four `renderSetChips` suites;
    - the six `readExCorpus` suites;
    - BL-24's increment test.
- **Risk:**
  - **The reference only rises through made heavy lifts.** That's why week 4 has its singles. A lifter who never takes them keeps their bands.
  - **Order:** after BL-77 (slot 9c), BL-24 (slot 22), BL-51 (9a) and BL-54 (one name per exercise, so the corpus groups Snatch once).
- **Tools:** `code-review` at high (the progression path).
- **Owner answer (2026-11-09, PR #99, "42a"):** (a). A miss is logged as fewer reps than prescribed (0 means the first rep was missed), with no new field. The week-4 optional singles are approved. The 0-rep fix is pulled forward as BL-77.
- **Status:** ready (after Phase 3, after BL-77). Slot 88b.

### BL-44: Bodyweight progression ladders (H-8, part 2)
- **Why:**
  - Calisthenics and Bodyweight score **F** for progression (audit H-8). BL-11 (slot 27) adds +1 rep or +5 s, and above 15 reps or 60 s says "Ready for a harder variation" without naming one. Front Lever Hold `4×10-15s` (calisthenics d2) is the full skill, with no easier rung to train on. Pull-ups `4×AMRAP` (bodyweight d2) offers nothing to someone who can't do one.
  - Progressive overload is the core recommendation [ACSM26]. Push-up variations progressed by leverage raised bench 1RM like bench training did [KOT18]. The load of each variation is measured [EBB11]: knee 49% of body mass, hands on a 30 cm box 55%, floor 64%, feet on a 30 cm box 70%.
  - Hypertrophy is similar across a wide rep range near failure, but strength favours heavier loads [SCH21]. Past about 15 reps, a harder variation serves strength better than more reps.
  - Lever and L-sit progressions are coaching practice [PRAC].
  - **Audit correction:** H-8 orders the push-up ladder "wall → incline → knee → floor → decline". [EBB11] puts the knee push-up (49%) below a 30 cm incline (55%). This ladder follows the measurements, and the Incline Push-up cue names the 30 cm height.
- **Change:**
  1. **`PROGRESSION_LADDERS`**, beside `SUBSTITUTION_MAP` (44169), as audit H-8 placed it. Easiest to hardest; * marks a new library entry:
     - push-up: Wall Push-up → Knee Push-up* → Incline Push-up* → Push-up → Decline Push-up;
     - pike: Pike Push-up → Elevated Pike Push-up*;
     - pull-up: Negative Pull-up* → Pull-ups (or assisted);
     - front lever: Tuck Front Lever* → Advanced Tuck Front Lever* → Straddle Front Lever* → Front Lever Hold;
     - L-sit: Tuck L-sit Hold* → L-sit Hold;
     - pistol: Box Pistol Squat* → Pistol Squat.

     **Deliberately left out:** bench dip → bar dip. A bench dip loads the shoulder at end-range extension, so it isn't a safe regression [PRAC]. Both stay as `EXERCISE_SUBS` alternatives, as today.
  2. **`listedSubsFor(name)`** is the one list of what a slot may be swapped to: `EXERCISE_SUBS[name]` first, then the rungs of `name`'s ladder not already listed, easiest first. It's used at all three `EXERCISE_SUBS` reads:
     - `applyExerciseSubs` (27101), including BL-73's "only if listed" check;
     - `openExerciseSubModal` (27274): options are the default, the existing alternatives, then rungs tagged "Easier" or "Harder";
     - the swap control's `hasSubs` (29231).

     `EXERCISE_SUBS` itself is unchanged, so its "exactly 2 alternates" invariant (`test-exercise-substitution.js` 133–139) holds.
  3. **`ladderStep(ex, log, program)`** returns `{dir:'up'|'down', to}` or `null`. It reads the row's own history: the rung's `:sub:` key when the row is swapped.
     - **Up:** BL-11's `suggestRepProgression` verdict is "harder variation" (every set above 15 reps or 60 s in 2 consecutive sessions). Or, for a hold prescription whose top is 30 s or less (levers, L-sits), every set reached that top in 2 consecutive sessions.
     - **Down:** every set fell below the prescription's bottom in 2 consecutive sessions. On an AMRAP, the first set was under 5 reps in both.
     - `to` is the neighbouring rung. At the top of a ladder, "up" gives words only: "Add load or a 3-second lowering", and only if the row has a weight field.
     - Returns `null` on `medical` and `senior` (as BL-11), on custom and body-goal rows, and on rows with no ladder.
  4. **Copy.** BL-11's words become "Ready for Decline Push-up: tap Swap and pick it." or "Too hard today? Knee Push-up is one step easier: tap Swap."
     - Nothing swaps by itself. The picker's existing write (`subSelectionKey`, through BL-72's `slotIdOf`) does it on the user's tap.
     - Each rung keeps its own `:sub:` history, so no history moves.
  5. **Library.** Nine `content-exercises.js` entries, each with the category of its ladder's base (so `regionsForExercise` and the resting-region flags match the base, and no `EXERCISE_REGION_OVERRIDE` line is needed), a `videoQuery`, and these 3 cues (each 24 words or fewer):
     - **Knee Push-up** (`push`): "Knees on a mat; hips in line with shoulders and knees, no bend at the waist." / "Lower your chest to a fist's height off the floor, elbows about 45° from your body." / "Press the floor away; at 15 clean reps, move to the incline push-up."
     - **Incline Push-up** (`push`): "Hands on a sturdy box or step about 30 cm (12 in) high, shoulder-width apart." / "Body straight from head to heels; lower your chest to the edge, elbows about 45°." / "A lower box is harder; at 15 clean reps, move to floor push-ups."
     - **Elevated Pike Push-up** (`shoulder`): "Feet on a box, hands on the floor, hips stacked high over your shoulders." / "Lower the top of your head toward a spot just ahead of your hands, elbows tracking back." / "Press back to straight arms; end the set when your hips start to drop."
     - **Negative Pull-up** (`pull`): "Jump or step up so your chin is over the bar." / "Lower yourself slowly, over 3–5 seconds, to a full hang with straight arms." / "Step back up rather than pulling; once you can do 3 strict pull-ups, switch over."
     - **Tuck Front Lever** (`pull`): "Hang with straight arms, shoulder blades pulled down and back, knees tucked to your chest." / "Lift until your back is horizontal and your hips are level with your shoulders." / "Hold 10-15 s; stop when your back rounds or your elbows bend."
     - **Advanced Tuck Front Lever** (`pull`): "From the tuck lever, open your hips until your back is flat; knees stay bent." / "Arms locked straight and shoulders pressed down; hips level with your shoulders." / "Hold 10-15 s; go back to the tuck when your back won't stay flat."
     - **Straddle Front Lever** (`pull`): "Legs straight and spread wide; the wider the straddle, the easier the hold." / "One horizontal line from shoulders to feet, arms locked straight." / "Hold 10-15 s; narrow the straddle as you get stronger, then close the legs."
     - **Tuck L-sit Hold** (`core`): "Hands on parallettes or the floor beside your hips, arms locked straight." / "Press your shoulders down hard and lift your hips, knees tucked to your chest." / "Hold 10-20 s; extend one leg at a time when it gets easy."
     - **Box Pistol Squat** (`lunge`): "Stand on one leg in front of a box, the other leg reaching forward." / "Sit back slowly to touch the box without dropping; heel down, knee over toes." / "Stand without rocking; lower the box as you get stronger."
- **Acceptance criteria** (real `listedSubsFor`, `applyExerciseSubs`, `EXERCISE_SUBS`, `PROGRESSION_LADDERS`, `exerciseInfo` and `regionsForExercise`; the real `openExerciseSubModal` in jsdom with the real modal markup):
  1. `listedSubsFor` gives:
     - `'Push-up'` → `['Bench Press','Decline Push-up','Wall Push-up','Knee Push-up','Incline Push-up']`;
     - `'Front Lever Hold'` → the three lever rungs;
     - `'Bench Press'` → exactly `EXERCISE_SUBS['Bench Press']`.

     A sweep: for every name not in a ladder, `listedSubsFor` equals `EXERCISE_SUBS` (or `undefined` when absent).
  2. Real `applyExerciseSubs`:
     - a stored 'Knee Push-up' on bodyweight d1 slot 0 applies (`__isSubbed`);
     - a stored 'Front Squat' there doesn't (BL-73 still holds);
     - a stored 'Tuck Front Lever' on calisthenics d2 slot 1 applies. At v3.528 this fails at the early return: Front Lever Hold isn't in `EXERCISE_SUBS`.
  3. `ladderStep`:
     - Push-up `4×AMRAP`, two sessions with every set at 16 → up to Decline Push-up;
     - first sets of 4 in both sessions → down to Incline Push-up;
     - one session → `null`;
     - a Tuck Front Lever row on `4×10-15s`, two sessions of 15 s on every set → up to Advanced Tuck Front Lever;
     - Front Lever Hold at its top → `null`;
     - Pistol Squat `3×5-8/leg`, two sessions of 3 reps on every set → down to Box Pistol Squat (needs BL-76's per-limb parse).
  4. Medical, Senior, custom and body-goal rows → `null`.
  5. Real `openExerciseSubModal` for bodyweight d1 Push-up lists 6 options: Default on Push-up, "Easier" on Wall, Knee and Incline, "Harder" on Decline. Tapping Knee Push-up writes the slot's selection key with the value 'Knee Push-up'.
  6. Each of the 9 new names has an `exerciseInfo` entry, with its base's category and 3 cues of 24 words or fewer. `regionsForExercise` equals the base's.
  7. Real-call counts: 3 `listedSubsFor(` call sites, and 1 `ladderStep(` in `renderWorkout`. A render writes nothing (snapshot the storage keys).
- **Test plan:** new `test-bodyweight-ladders.js`. Sabotage:
  - point `applyExerciseSubs` back at `EXERCISE_SUBS`, and criterion 2's lever case fails;
  - drop the 2-session rule, and criterion 3's one-session case fails.
- **Files:**
  - `index.html`:
    - `PROGRESSION_LADDERS` and `listedSubsFor` beside 44169;
    - 27101, 27274, 29231;
    - `ladderStep` beside BL-11's helper, near `computeSuggestedSet` 27983;
    - `APP_VERSION` 7625 and `WHATS_NEW` 7643.
  - `content-exercises.js` (9 entries), `sw.js`, the test.
  - **Re-pins** (both count exercises):
    - `test-concise-cues.js` 45–48: +9 exercises and +27 cues on whatever the base commit holds (321/971 at v3.528; BL-60 alone adds 12/36), with a dated note;
    - `test-safety-cues.js` 99–109: the exercise count, plus the 9 names in its new-key handling.
  - **Guards:**
    - `test-exercise-substitution.js` (its 2-alternate invariant; BL-67's no-jump-crossing case);
    - `test-exercise-swap-tap-target.js` and `test-superset-field-chaining.js` (stub the picker);
    - `test-region-override.js`;
    - the search suites that index `exerciseInfo` (`test-search-index-freshness.js`, `test-global-search-techniques.js`, `test-search-2-0.js`);
    - BL-11's `test-bodyweight-progression.js`.
- **Risk:**
  - **The picker gets longer** on six exercises.
  - **A rung swapped on a calisthenics weighted slot keeps the slot's weight field.** That's intended: weighted calisthenics is normal (BL-56).
  - **Order:** after BL-11 (27), BL-56 (26a), BL-60 (31a), BL-73 (8b), BL-72 (8a) and BL-76.
- **Tools:** none extra.
- **Status:** ready (after Phase 3) (slot 88c). No new stored data and no program-shape change: the rungs use the existing selection key and `:sub:` history.

### BL-45: Athletic jump and sprint metrics
- **Why:**
  - Athletic scores **W** for progression: "jumps don't progress; no tracking metric". Audit §5 asks for jump distance and sprint times as performance metrics, and for stopping sets on quality.
  - Today a Broad Jump set stores only reps. `jump` is a non-distance category (`isDistanceExercise` 32744 is "category is cardio"). Sprint Intervals `6×40yd` (athletic d6) gets a reps field and a distance in metres, but no time.
  - **Evidence:**
    - Jump performance is a validated monitoring signal. The **average** of a session's jumps was more sensitive than the **best** jump for detecting fatigue and supercompensation [CLA17].
    - Loss of velocity, or of jump height, within a session tracks fatigue [SMG11].
    - Sprint work is done near-fresh, with long rests [HAU19].
    - Hand timing reads about 0.22 s (about 4%) faster than electronic over 40 yd [MAY10], so a hand time is only ever compared with hand times.
    - Contact guides: about 80–100 ground contacts per session for beginners, 100–120 for intermediates, 120–140 for advanced [NSCA-PLY].
- **Change:**
  1. **Broad Jump distance.** An optional "Best jump" input on Broad Jump rows, wherever it's prescribed (28 slots at v3.528), in cm for km users and in for mi users.
     - It's stored as `jump` (whole centimetres) on the set, written only when present: the same additive rule as `distance` and `note` (`saveExSet` 28459).
     - It isn't `distance`: that field is metres, and every cardio reader would count a jump as a run (`distanceOf` 31585, `computeWeeklyCardio`, the chip's `setChipLabel`).
  2. **Sprint time.** An optional "Time (s, hand-timed)" input on `Sprint Intervals` rows, stored as `secs` (2 decimals), under the same rule.
  3. **Saving.**
     - `saveExSet` gains one optional trailing argument, `extra = {jump, secs}`. The row's save (`wireSetRow`, 32160–32174) passes it when either input exists, so a set-sheet edit, which re-saves through the row, keeps both values.
     - "Same as last" (32075) doesn't copy them: they're measurements of the day.
     - Every other caller is unchanged.
  4. **`qualityCutoff(kind, todayValues)`** (text only, never automatic):
     - **jump:** a set whose best is more than 10% under today's best set → "That jump was 11% short of today's best: stop jumps for today." [PRAC, SMG11 indirect].
     - **sprint:** a rep more than 5% slower than today's fastest → "Speed has dropped 6%: stop sprints for today." [PRAC]. Both thresholds are practice; no trial sets them.
  5. **`jumpSessionStats(log)`** gives the badge line "Session average 248 cm (last time 240 cm)", using the mean of each session's logged set bests [CLA17]. Sprints are the same, with mean time.
     - No PR event and no share-card figure (D15; `reconstructAllPRs` stays weight-only).
  6. **`countGroundContacts(rows)`**: logged reps on `jump`-category rows, ×2 for `/leg` prescriptions. On Athletic days only (`programs.athletic` 10006 and its variants, 17613), the first jump row's badge adds "Ground contacts so far today: 47 (guide: about 100 per session)". Display only.
- **Acceptance criteria** (real invocations; the `renderWorkout` call site is pinned as a real-call count):
  1. Real `saveExSet` with `extra = {jump:245}` on a Broad Jump row stores `{weight:null, reps:5, rpe:null, jump:245}`. Without `extra`, the stored set is byte-identical to v3.528's (no `jump` or `secs` key).
  2. `qualityCutoff`:
     - `('jump', [245, 240, 218])` → stop (218 < 220.5);
     - `('jump', [245, 240, 222])` → `null`;
     - `('sprint', [5.10, 5.20, 5.40])` → stop (5.40 > 5.355);
     - `('sprint', [5.10, 5.20, 5.30])` → `null`.
  3. `jumpSessionStats` over sessions with set bests [240, 236, 244] then [246, 250, 248] reads 248 now and 240 last time.
  4. `countGroundContacts`:
     - athletic d1 with reps logged as prescribed (Box Jump 4×5, Broad Jump 3×5, Trap Bar Jump Squat 4×3) → 47;
     - athletic d4 (Depth Jump 4×5 and Single-Leg Bound 3×6/leg) → 56.
  5. Real `distanceOf` and `computeWeeklyCardio` give v3.528's values for a corpus that includes Broad Jump sets carrying `jump` (proves no cardio reader picks it up).
  6. 96 in entered by a mi user stores 244 (cm).
  7. Real-call count: 1 `countGroundContacts(` in `renderWorkout`, behind the Athletic check.
  8. `test-import-backup-full-replace.js` round-trips `jump` and `secs`.
- **Test plan:** new `test-athletic-metrics.js`, with the real `saveExSet` (stubbed storage), `qualityCutoff`, `jumpSessionStats`, `countGroundContacts`, `distanceOf`, `computeWeeklyCardio` (stubbed `readExCorpus`) and the real `wireSetsBlock` for the save path. Sabotage:
  - read jumps through `distance`, and criterion 5 fails;
  - drop the `/leg` doubling, and criterion 4's d4 case fails.
- **Files:**
  - `index.html`:
    - `saveExSet` 28459;
    - the set-row markup in `renderWorkout` (near 29170) and `wireSetRow` 32160–32174;
    - the new helpers beside `computeSuggestedSet` 27983;
    - `APP_VERSION` 7625 and `WHATS_NEW` 7643.
  - `sw.js` and the test.
  - **Guards:**
    - the eleven `wireSetsBlock` suites (they stub `saveExSet` and `isDistanceExercise`; a new optional argument is harmless);
    - `test-partial-set-reactions.js` (what counts as a real set: a jump value alone doesn't make one, reps still do);
    - `test-open-screen-2-0.js` (`distanceOf`);
    - `test-import-backup-full-replace.js`;
    - `test-configurable-training-days.js` 489–527 (the watersports days that must not contain Broad Jump or Sprint Intervals: unaffected, no slot moves);
    - BL-55's `test-cardio-distance-gate.js`.
- **Risk:**
  - **Two new stored fields.** They're additive and optional, so no migration is needed.
  - **Hand timing is noisy.** The label says "hand-timed", and times are only compared with the same person's own hand times.
  - **Order:** after BL-55 (13c), BL-56 (26a), BL-61 (6c) and BL-14/57 (sprint rest).
- **Tools:** none extra.
- **Owner answer (2026-11-09, PR #99, "45a"):** (a), both optional fields: `jump` (cm) on Broad Jump sets and `secs` (hand-timed) on sprint reps. They're additive like `distance` and `note`, so no migration is needed.
- **Status:** ready (after Phase 3; after BL-55 and BL-61). Slot 88d.

## Parked or later (not yet itemised)
- **M-8:** `calf` and `isolation-leg` categories. These shift `MUSCLE_GROUP_MAP` history groupings, so they need the owner. They now ship with BL-59 (needs-owner). BL-03 and BL-04 cover the safety half.
- **L-3:** closed into BL-58. At v3.518, "Squat (Speed)", "Bench Press (Speed)" and "Deadlift (Light/Technique)" have no `exerciseInfo` entries.
- **Program extensions:** BL-41, BL-42, BL-44 and BL-45 are now written in full (2026-11-09), in the section "Program extensions" above, at roadmap slots 88a–88d. BL-49 is still unassigned. **BL-43, BL-46, BL-47 and BL-48 are also written** (running, cycling, swimming and the endurance deload); see the audit section above.
- **Health importer:** keep SDNN and rMSSD apart (found in BL-21's check).
- **Out of scope:** lock-screen or watch logging, which belongs to the Capacitor track (CLAUDE.md); exercise demos (parked by the owner).

---

## Business (BIZ): added by business-manager, 2026-11-07

Written against **v3.514**. Evidence for every item is in `planning/business.md` §5, from a Playwright first-launch walk (Chromium, 402×874, fresh context) and the code. Line numbers are `index.html` at v3.514. **Re-grep them before editing.** The same rules and default `Tools:` apply as for every BL item above. Ready items are listed first, in suggested build order, then needs-owner items in priority order.

### BIZ-01: A three-question quick start before the first workout
- **Why:**
  - A fresh profile opens on "Upper · Strength, Week 1 of 5 · Accumulation, ~63 min, 0/26 sets", with Bench Press 4×4-6 first. No goal, days or experience has been asked (`activeProgram = 'strength'`, 13053).
  - `recommendProgram` (33662) and `PROGRAM_DAY_COUNT_VARIANTS` (via `daysPerWeekPref`, 25950) already exist, but only after the long profile form is filled in.
  - Activation (the first set logged) multiplies every later metric (business.md §4).
- **Change:**
  - After `createNewUser` (9629) on a device with no prior profile, the picker shows three single-tap steps, using fields that already exist:
    1. Goal: the existing `goal` options;
    2. Training days per week: 2–6, saved with `saveDaysPerWeekPref` (25963);
    3. "Where do you train": gym or home/bodyweight, mapped to the existing equipment and program keys.
  - On finish, apply `recommendProgram(userProfile)` through the existing program-switch path (`saveActiveProgram`, 14888) and save the profile with `saveProfile` (32412).
  - "Skip" keeps today's behaviour exactly.
  - No new storage keys and no new abstraction: extend the picker overlay (5701).
- **Acceptance criteria:**
  1. With an empty user list, creating a profile shows quick-start step 1. With an existing user list, switching users shows no quick start.
  2. Choosing goal "lose", 3 days and "home" sets `userProfile.goal === 'lose'` and `daysPerWeekPref === 3`, and sets `activeProgram` to exactly what `recommendProgram` returns for that profile. Assert against the real function's return, not a hard-coded key.
  3. "Skip" leaves `activeProgram === 'strength'` and `daysPerWeekPref === null`, as today.
  4. The quick start writes only the existing keys (`profile`, `days-per-week-pref`, the active-program key). Snapshot the storage keys before and after.
- **Test plan:** new `test-quick-start.js`, run in jsdom with the real `createNewUser`, `showUserPicker`, `recommendProgram`, `scoreAllPrograms` and `saveDaysPerWeekPref`. Sabotage: skip the `recommendProgram` call, and criterion 2 must fail.
- **Files:** `index.html` (5701–5712, 9629–9665, 14888, 25963, 32412, 33662), `sw.js`, the test.
- **Risk:**
  - First-launch flow. Guarded by `test-first-launch.js`, `test-program-recommendation.js` and `test-configurable-training-days.js`.
  - `location.reload()` in `switchToUser` (9626): the quick start must run after the reload. Use the empty profile name as the trigger, not in-memory state.
- **Summit note (summit 2026-11-07):** Routing guard (summit R9). The "gym" answer filters to lifting programs. A "gain" answer with 3 days or fewer must not land on Bodybuilding 3-day until BL-37 ships. The PR attaches the real `recommendProgram` table (goal × days × location). With today's scores, gain → bodybuilding 95 and lose → jumprope 95 (33544–33545). If this can't be done with existing keys, stop and mark needs-owner. Units (lb/kg) aren't asked here; that's flagged, not in scope.
- **Status:** ready

### BIZ-02: The name typed at "Who's training?" fills the profile name
- **Why:** after creating "Alex", the header still says "Set up your profile below to personalize this" (`renderHeader`, 33790), and Getting Started's "Set up your profile" stays unticked (33895). The picker name goes into the user list (`createNewUser` 9629), never into `userProfile.name`. So the app asks for the name twice.
- **Change:** when a profile loads with an empty `userProfile.name` and the active user-list entry has a name, use that name. Write it once through the existing `saveProfile` path. Nothing else changes.
- **Acceptance criteria:**
  1. After creating "Alex", `userProfile.name === 'Alex'` and `#headerEyebrow` contains "Alex".
  2. A profile whose name was already set to something else keeps it.
  3. The Getting Started row "Set up your profile" renders `.done`.
- **Test plan:** extend `test-first-launch.js`. Sabotage: remove the fill, and criterion 1 must fail.
- **Files:** `index.html` (9629, 32405–32412, 33783–33792, 33895), `sw.js`, the test.
- **Risk:** low. Multi-user devices are guarded by `test-first-launch.js`. If BIZ-01 ships first, this is its natural first step; don't merge the two into one version.
- **Summit note (summit 2026-11-07):** UX-06 must keep `#headerEyebrow`, or update `test-first-launch.js` deliberately with a dated note.
- **Status:** ready

### BIZ-03: Placeholder calorie targets say they are placeholders
- **Why:** before any height, weight or age is entered, the Log tab shows "2169 cal left of 2169" as if it were the user's own target. It's `computeTargets` (33172) run on the defaults (30 years, 5'8", 160 lb; `userProfile` 32594). A number that looks personal but isn't is a trust problem for the people who log food (business.md §5.2).
- **Change:**
  - **"Never saved" can't be read from `user-profile` (spec refresh 3).** Three paths write that key besides the profile form: a weigh-in that's the newest entry saves the whole `userProfile` with the default age and height (38572); the conditions migration writes a conditions-only profile (9331–9337); and `saveProfile` (32609) always writes every field. So the rule is:
    - the line shows while `age`, `heightFt` and `heightIn` all still equal the defaults (30, 5, 8) **and** the `window.storage` flag `profile-body-saved` is absent;
    - the profile form's Save handler (`#pfSave`, 34259) sets that flag. Nothing else does.
    - The owner, and anyone whose age or height differs from the defaults, never sees the line, so no one with a saved profile gets it back. A real 30-year-old at 5'8" sees it until they press Save once.
  - The line sits under the calorie hero, in `renderCalHero` (38025; it sets `#calHeroUnit`, 6287), as a new `<div id="calHeroEstimate">`: "Estimate for a 30-year-old, 5'8", 160 lb. Add yours in Profile." Age, height and weight are read from `userProfile` (weight through `fmtWeight`, so kg users see kg, and a weigh-in's weight shows), so the line can't drift from what `computeTargets` used.
  - The targets themselves don't change.
- **Acceptance criteria** (real `computeTargets`, `renderCalHero` and the `#pfSave` handler, with the real `#calHero` markup and stub `window.storage`):
  1. Default `userProfile`, no flag: `#calHeroEstimate` is visible and contains "Estimate" and "30-year-old".
  2. After a real click on `#pfSave` with age 41 filled in: the flag is set and the line is hidden. With age left at 30 and height at 5'8" but Save clicked: also hidden (the flag alone hides it).
  3. Default age and height, no flag, `userProfile.weight` 182 (a weigh-in): the line shows and names 182 lb.
  4. A stored profile with age 37 and no flag (an existing user): no line.
  5. `#calHeroNum` is unchanged in every case: it equals `computeTargets(userProfile).cal` minus the eaten total.
- **Test plan:** new `test-placeholder-targets.js`. Sabotage: drop the flag check, and criterion 2's second half fails; always hide the line, and criterion 1 fails.
- **Files:** `index.html` (6284–6290 hero markup, `userProfile` 32594, `renderCalHero` 38025, the `#pfSave` handler 34259–34296, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, the test. Guards: `test-nutrition-default-open.js`, `test-nutrition-macro-bar-colors.js`, `test-log-2-0.js` (reads `#calHero`), `test-profile-save-zero-value.js` and `test-cycle-tracking-opt-out.js` (both drive `#pfSave`), `test-visual-polish-audit-fixes.js` (119–146, the macro row's computed layout).
- **Risk:** nutrition hero layout. Guarded by `test-nutrition-default-open.js` and `test-nutrition-macro-bar-colors.js`.
- **Summit note (summit 2026-11-07):** UX-13's Food summary must keep this line (add it to UX-13's checks).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: "the profile has never been saved" isn't observable (a weigh-in and a migration both write `user-profile`), so the rule is now the defaults plus a `window.storage` flag set only by the profile form. That's a namespaced preference, not a data-shape change, and it can't make the line reappear for an existing user. Criteria are real clicks on `#pfSave`. Scope unchanged.
- **Status:** ready

### BIZ-04: First backup reminder after 3 sessions, not 10
- **Why:**
  - All data lives in one browser with no second copy (comment at 14310).
  - The first reminder waits for `BACKUP_NUDGE_FIRST = 10` sessions (14320).
  - `navigator.storage.persist()` is a no-op on Safari (14295), and Playwright saw `persisted() === false` on first launch.
  - Three sessions is the first point where a new user has a program week worth losing.
- **Change:** `BACKUP_NUDGE_FIRST` goes from 10 to 3. `BACKUP_NUDGE_REPEAT` and the copy are unchanged.
- **Acceptance criteria:**
  1. With `activity-dates` holding 3 dates and no `last-backup`, `getBackupReminderInsight()` returns text containing "Nothing here is backed up yet".
  2. With 2 dates, it returns `null`.
  3. With a `last-backup` and 19 later dates, it returns `null`; with 20, it returns the repeat text (unchanged behaviour).
- **Test plan:** new `test-backup-reminder.js`, with a real invocation against a stub `window.storage`. Sabotage: set it back to 10, and criterion 1 must fail.
- **Files:** `index.html` (14320), `sw.js`, the test.
- **Risk:** one more Today's Priorities row for new users. Guarded by `test-today-priorities.js`.
- **Status:** ready

### BIZ-05: A starting-load hint on an exercise's very first set
- **Why:** on a first-ever set the sheet opens with empty lb and reps fields, and nothing says how to choose a weight (Playwright, Bench Press set 1). After one entry the app suggests well (95×6 led to 100×4 with Undo). Only the very first set lacks guidance.
- **Change** (spec refresh 3: written against BL-10's `targetRirLabel`, which ships at slot 20, and against the real sheet):
  - One helper beside BL-10's `targetRirLabel`: `firstSetHint(ex, program)` returns `'First time: pick a weight where you’d ' + words` with `words` being `targetRirLabel(ex, program).words`, lower-cased at the start ("…where you’d stop 2–3 reps short; last set 1–2"). It returns `''` when `targetRirLabel` gives no label (cardio, timed and AMRAP rows) or the exercise has `noWeight`. This is the **one** string; UX-06a's cover reads the same helper (summit R7).
  - **"No history" is decided where the history is known.** `openSetSheet` (31237) only sees DOM rows, and `setChipValues` (30906) can't tell "no history" from "no suggestion". `renderWorkout` already knows: `prior` (28935) is null when there's no own-slot entry and no cross-program fallback. It stamps `data-first-time="1"` on the exercise's `.exercise-block` in that case.
  - `openSetSheet` shows a new `<p id="setSheetHint">` under `#setSheetSub` when the holder block has `data-first-time` **and** no set row in that block has reps logged yet. Otherwise the element is hidden. The hint text comes from `firstSetHint`.
  - Gym mode uses the same `#setSheet` (`test-gym-set-chips.js` opens it through `openSetSheet`), so it follows with no extra code.
  - Copy only: no load number, no new logic in the engine.
- **Acceptance criteria:**
  1. Real `openSetSheet` on a jsdom block with `data-first-time="1"` and no logged rows (Bench Press `4×4-6` on `strength`): `#setSheetHint` is visible and its text equals the real `firstSetHint(ex, 'strength')`.
  2. The same block after one row has reps: the hint is hidden.
  3. A block without `data-first-time`: hidden.
  4. Real `firstSetHint` returns `''` for `Easy Run 25-30 min`, `Plank 3×45s` and a `noWeight` row, and a non-empty string containing BL-10's `words` for Bench Press.
  5. Real-call count: the extracted `renderWorkout` (comments stripped) sets `data-first-time` at exactly one site, guarded by `!prior`.
- **Test plan:** extend `test-set-sheet.js` (it mounts the real sheet and drives `openSetSheet`). Sabotage: drop the "no logged rows" check, and criterion 2 fails.
- **Files:** `index.html` (the `#setSheet` markup, grep `id="setSheetSub"`; `openSetSheet` 31237; `firstSetHint` beside BL-10's helpers near `getRepRangeTier` 27824; the stamp in `renderWorkout` near 28935; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-set-sheet.js`. Guards: the other suites that drive `openSetSheet` (`test-gym-set-chips.js`, `test-set-chips.js`, `test-next-set-recommendation.js`, `test-dialog-focus-ring.js`) and the five that pin `renderWorkout` source (BL-10's list).
- **Risk:** low. The string is BL-10's; don't write a second effort vocabulary.
- **Summit note (summit 2026-11-07):** Pulled into Phase 2, before UX-06a. One string, shown in two places: the set sheet **and** the cover's empty state on a first-ever exercise. It reuses BL-10's wording (summit §1.2, R7).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: `openSetSheet` can't know "no history" from the row it gets, so the history check moves to `renderWorkout` (a one-site `data-first-time` stamp) and the sheet reads it; the hard-coded "about 3 more reps" string is replaced by `firstSetHint` over BL-10's `words`, so the two never disagree (strength-tier words say 2–3, not 3). Scope unchanged.
- **Status:** ready (after BL-10)

### BIZ-06: AI entry points say they need a key before the tap
- **Why:**
  - Several prominent entry points all need the user's own Anthropic key, which strangers won't have:
    - the coach button on every screen (`#coachFab`, 7461; its panel `#coachFabModal`, opened at 43944);
    - the first Analysis card, "Generate insights" (`#genCrossInsightsBtn`, 6670, inside the `insights` group that opens at 6661);
    - Photo and Describe among the first five food buttons (`#photoLogBtn` 6325, `#describeFoodBtn` 6327).
  - Today, each one says so only after the tap (`aiKeySetupPrompt`).
  - The core value (programs, progression) is what should lead.
- **Change:** when `getApiKey()` (41945, async) resolves empty:
  - the "Generate insights" button reads "Add an AI key to use this";
  - the AI card sorts below Training Trends in Analysis. *(Spec refresh 3, made exact)* The card is the `data-autohide` card holding `#genCrossInsightsBtn`. Analysis groups are decided by the nearest preceding `.analysis-group-header` (45467–45492), and `training` (6756) is the last group, so the card moves (the same element, IDs kept) to the end of the `training` group and so collapses with it (collapsed by default). With a key it's moved back to its place in `insights`. The move happens in one function, `placeAiInsightsCard(hasKey)`, called from `renderAnalysis` (47712), so the jump rail (`renderAnalysisIndex`, 47598) is built after it;
  - the Coach panel's empty state (`renderCoachChatLog`, 43132, `.coach-chat-empty`) starts with "Needs your Anthropic key (Settings)."
  - With a key, nothing changes. No feature is removed.
- **Acceptance criteria:**
  1. With no key, the insights button text contains "key", and the Training Trends group precedes the AI card in DOM order.
  2. With a stub key, the button reads "Generate insights" and the order is as today.
  3. `generateCrossMetricInsights`'s request payload is untouched. Count one real `fetch` per call with a key, as in `test-ai-cross-metric-effort-fix.js`.
- **Test plan:** new `test-ai-entry-honesty.js`, with the real `#analysisView` markup (`extractElementById`), `placeAiInsightsCard`, `renderCoachChatLog`, `aiKeySetupPrompt` and a stubbed `getApiKey`. Sabotage: ignore the key state, and criterion 1 must fail.
- **Files:** `index.html` (6325–6327, 6661–6680, 6756, 7461, `getApiKey` 41945, `renderCoachChatLog` 43132, `aiKeySetupPrompt` 46453, `renderAnalysis` 47712, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, the test.
  - **Keep the phrase "Add your Anthropic API key"** in `aiKeySetupPrompt`: `test-my-supplements-tracker.js` (1036, 1163) and `test-supplement-recommendations.js` (208) match it in the rendered prompt. Add the disclosure as a second sentence.
  - Guards: `test-ai-cross-metric-effort-fix.js` (criterion 3's payload, and it mounts `#genCrossInsightsBtn`), `test-ai-key-prompt-navigation.js` (the prompt's "Take me there"), `test-coach-2-0.js`, `test-coach-chat-context.js`, `test-analysis-collapse.js` (group membership and default states), `test-analysis-2-0.js`, `test-analysis-export.js`, `test-analysis-index-visual-weight.js`.
- **Risk:**
  - Analysis order and group membership. Guarded by the suites above.
  - Don't touch the "fixed, unverified live" AI internals (CLAUDE.md).
- **Summit note (summit 2026-11-07):** This item owns "the AI card sorts below the evidence". UX-10 relies on it and doesn't repeat it (summit §1.4). Ships before UX-10.
- **Alignment note (2026-11-07, business-manager B1):** "your logs stay on your phone" is false for AI users unless it's disclosed. `generateCrossMetricInsights` (~42536) sends body weight, nutrition, sleep, water, RPE, pain check-ins and PRs to Anthropic with the user's key. So this item also adds, **at each AI entry point and in the key prompt (`aiKeySetupPrompt`)**, one line saying what that feature sends and to whom. For example, insights: "Sends your recent weight, food, sleep, effort, pain check-ins and PRs to Anthropic using your key." Photo and Describe: "Sends the photo or text to Anthropic using your key." Coach: "Sends your message and a summary of your training to Anthropic using your key."
  - **Extra criterion:** one jsdom assertion per entry point (insights button area, Photo, Describe, Coach intro, key prompt) that its disclosure line is present and names "Anthropic".
  - The payload stays untouched (criterion 3).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped (the key and button lines had moved). The "sorts below" move is now exact (which element, which group, which function, and why it collapses with Training Trends); the coach line goes in `renderCoachChatLog`'s empty state; three suites pin the prompt's first sentence, so the disclosure is added, not swapped in. Scope unchanged.
- **Status:** ready

### BIZ-07: Truthful page metadata, manifest description and README
- **Why:**
  - `manifest.json` says "22 training programs … and AI coaching". The live page has 25 `programs` keys, and AI coaching needs the user's own paid key.
  - `index.html` has no `<meta name="description">` and no Open Graph tags (lines 4–27), so shared links preview blank.
  - `README.md` is one line, and the public repo is the only landing page.
- **Change:**
  - Add a meta description and `og:title`, `og:description` and `og:image` (the existing `icon-512.png`).
  - Use the business.md §1 promise: "Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone."
  - The manifest description drops the hard-coded count and the AI headline.
  - The README gets that promise, how to install to the home screen, and the privacy facts (logs on device; food search goes to USDA and Open Food Facts; AI only with your own key).
  - Coordinate wording with `planning/marketing.md` if it exists by build time. Its copy wins on tone; this item owns only the factual accuracy.
- **Acceptance criteria:**
  1. `meta[name=description]` and `meta[property="og:title"]` exist in the parsed document.
  2. The manifest description contains no digit-count of programs, or a count that equals `Object.keys(programs).length` from the real `programs` object.
  3. No metadata string contains "AI coaching" without "your own key".
- **Test plan:** new `test-metadata-truth.js`, which parses the real `index.html` head and `manifest.json` and counts real `programs` keys. Sabotage: put "22" back, and criterion 2 must fail.
- **Files:** `index.html` (head 4–27), `manifest.json`, `README.md`, `sw.js` (version), the test.
- **Risk:** `test-icon-manifest-paths.js` reads the manifest; keep the icons untouched.
- **Business note (2026-11-07, revised model):** the owner chose "free at launch, subscription later". "Free, no ads" stays true and stays in the copy. The README must not say "free forever" about everything, and must not mention a future subscription, until BIZ-18 is approved. BIZ-18 then adds the exact line from business.md §3.3.
- **Status:** ready

### BIZ-09: First-month summary in Diagnostics, on device only
- **Why:** there's no way to know whether the app activates and retains anyone, and adding analytics would break the privacy promise (business.md §4). The data needed is already stored: the `has-logged-first-set` milestone, `activity-dates` and `last-backup`. A tester or the owner can read the result off the screen and report it by hand.
- **Change:**
  - Add one row to the existing diagnostics output (`runDiagnostics`, 46529): "First set: <date> · sessions in first 7 days: n · first 30 days: n · last backup: <date or never>".
  - Computed from existing keys. Nothing is sent anywhere, and no new key is written.
- **Acceptance criteria:**
  1. With `activity-dates` = 5 dates within 7 days of the first, the row reads "first 7 days: 5".
  2. With no activity, the row reads "No sessions yet".
  3. No `fetch`, `sendBeacon` or `XMLHttpRequest` is called during diagnostics (stub-counted: 0).
- **Test plan:** extend the diagnostics coverage in a new `test-diagnostics-first-month.js`, with the real `runDiagnostics` and a stub storage. Sabotage: count from the wrong start date, and criterion 1 must fail.
- **Files:** `index.html` (46529 and its helpers), `sw.js`, the test.
- **Risk:** low; read-only.
- **Status:** ready

### BIZ-10: A one-time "Add to Home Screen" hint for browser-tab users
- **Why:**
  - Someone using the app in a Safari tab gets no install prompt. That's the case most exposed to Safari's 7-day storage cap: home-screen apps reportedly keep their own counter ([Search Engine Land](https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519); secondary).
  - Installing also gives the full-screen app the owner designed for.
  - No `beforeinstallprompt` or home-screen copy exists (grep: 0 matches).
- **Change:**
  - When `matchMedia('(display-mode: standalone)')` is false and `navigator.standalone !== true`, Today's Priorities shows one row: "Install it: Share → Add to Home Screen. It keeps your log safer and opens full screen."
  - It shows after the first logged set, once. "Hide" is stored with `window.storage` (an existing pattern, like `onboarding-dismissed`).
- **Acceptance criteria:**
  1. Not standalone, with a first set logged and not dismissed: the row renders.
  2. Standalone: no row.
  3. After Hide, no row on the next render.
  4. Before the first set: no row.
- **Test plan:** new `test-install-hint.js`, with the real insight function and stubbed `matchMedia`. Sabotage: drop the standalone check, and criterion 2 must fail.
- **Files:** `index.html` (`renderTodayInsights` 14615 and a new `get…Insight` beside `getBackupReminderInsight` 14323), `sw.js`, the test.
- **Risk:**
  - Today's Priorities ordering. Guarded by `test-today-priorities.js`.
  - Don't show it inside the Capacitor build. Standalone detection covers that; verify in the test.
- **Status:** ready

### BIZ-08: Share cards carry the app's address
- **Why:** PR, streak and weekly share cards end with the text "TRAINING LOG" (`buildShareCardBlob`, 29510) and share text with no URL (~29620). Every share is a referral that can't be followed. The marketing-manager owns share moments; this item only adds the link.
- **Change:** a `PUBLIC_APP_URL` constant beside `APP_VERSION` (7622). It's drawn under "TRAINING LOG" on the card and appended to `shareText`.
- **Acceptance criteria:** the share text passed to a stubbed `navigator.share` ends with `PUBLIC_APP_URL`, and the card canvas receives a `fillText` call with it (stub-counted: 1).
- **Test plan:** new `test-share-card-url.js`, with the real `buildShareCardBlob` and share handler, a stub canvas and a stub `navigator.share`. Sabotage: drop the append, and the share-text assertion must fail.
- **Files:** `index.html` (7622, 29510, ~29620), `sw.js`, the test.
- **Risk:** it advertises the app's public address on every share, before the owner has decided to go public (BIZ-12).
- **Alignment note (2026-11-07, marketing-manager B2):**
  - The printed address must be permanent: the app's own domain (for example the `.app` for the chosen name), forwarded by the registrar with an HTTPS 301 to the current app. **Never `jdabeast5.github.io/Training-Log`**, which prints the old name and a personal handle on images nobody can edit later.
  - **Don't** attach the domain to the app's repo as a GitHub Pages custom domain. That changes the app's origin, and localStorage and IndexedDB (every log and photo) don't follow an origin change. Moving the origin is its own item, BIZ-25.
  - The card text is drawn under the mark and the name (`APP_NAME`), not under "TRAINING LOG".
- **Status:** ready (after the Phase 3 gate, and once the owner confirms the forwarded domain) (owner yes 2026-11-08, D8). The name is settled (Platestep). `PUBLIC_APP_URL` is the owner's forwarded domain (for example `platestep.app`); until the owner records that it is bought and forwards with an HTTPS 301, a run skips this item. Roadmap slot 93.

### BIZ-12: Go public: where, and under what name
- **Why:** with no store listing, a generic name and an empty README, nobody can find the app (business.md §5.1). The Capacitor track creates the store build; the business needs the owner's decision to list it.
- **Change:** none in code until answered. The answer unlocks BIZ-08 and BIZ-16 and the marketing launch plan.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §6.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:** going public turns the clinical programs into a health-claim question (BIZ-15) and requires a privacy policy (BIZ-16). Neither should lag the listing.
- **Status:** answered (owner yes 2026-11-08, D8: public after Phase 3 and its gates; web first, then Play, then the App Store, in that order). No code; the answer is recorded in `business.md` §6. *Original question:* "Do you want the app public after Phase 3 and its gates (web first, then Google Play via the Capacitor build, then the App Store), under the name you settle from `planning/naming.md`?" **Recommendation:** yes, in that order. The name decision itself is MKT-09 / consensus decision 10. Personal Play account, with founding members as the 12 testers for 14 days (business.md §6).

### BIZ-16: A privacy policy page
- **Why:** store listings for apps handling health data require a privacy policy (business.md §6). Ours would be unusually short and strong: logs stay on device; food queries go to USDA and Open Food Facts; AI calls go to Anthropic only with your own key; no analytics.
- **Change:** a static `privacy.html` beside `index.html`. Text only, linked from Settings and the README.
- **Acceptance criteria:**
  1. Every `https://` host literal in `index.html` (comments excluded) is classified in the test as either **"the app contacts"** or **"links you open"** (for example youtube.com, google.com and doi.org). Every "the app contacts" host is named in `privacy.html`, with what is sent to it. The hosts reached through constants (`USDA_API_BASE` ~35042, `DSLD_API_BASE` ~35792) and by `<script src>` (the barcode library from `cdn.jsdelivr.net` and `unpkg.com`, ~35227) are included. The Anthropic row names the health categories that Cross-Metric Insights sends (BIZ-06). *(Alignment round, business-manager B2: a `fetch(`-only parse finds just `api.anthropic.com` at v3.516.)*
  2. `privacy.html` contains no analytics or tracking script tag (count 0).
  3. Settings has one link whose `href` is `privacy.html`.
- **Test plan:** new `test-privacy-policy-hosts.js`: collect every `https://` host literal from `index.html` (comments excluded), require each to be in the test's classification table (an unclassified host fails), then load `privacy.html` in jsdom and assert each "the app contacts" host appears in its text. Sabotage: add a fake `'https://example.org/api'` constant to the extracted source, and the test must fail.
- **Files:** `privacy.html` (new), `index.html` (Settings link), `README.md`, `sw.js` (version; precache the page), the test.
- **Risk:**
  - Legal text. The owner must approve the wording.
  - A second HTML file beside `index.html` is a new file, which CLAUDE.md asks the owner to confirm.
  - The page drifts when a new host is added; criterion 1 catches that.
- **Status:** ready (after the Phase 3 gate) (owner yes 2026-11-08, D8). The new `privacy.html` file is approved with it; the owner approves the exact wording in the PR review. Roadmap slot 90.

### BIZ-15: Clinical-content review and disclaimer before any public listing
- **Why:**
  - Medical, prenatal, postpartum and hypertension plans make health-related prescriptions. SAF-1 and SAF-2 showed automatic volume and RPE reaching them (BL-01, BL-02 fix that).
  - Cycle advice cites a named author (6575).
  - In a public store, these are health-claim and liability questions.
- **Change:**
  - BL-01 to BL-06 ship first.
  - Then a single-screen acknowledgement the first time a clinical program is chosen: "Use this with your care team's clearance."
  - Plus a review of every `basis` string for claims that read as medical advice.
  - **Widened in the alignment round (business-manager):** the review covers every user-facing string in clinical programs, tips and nutrient notes. Examples: "reduces fall risk" (~33229), "lower blood pressure" (~11468), "reduces neural tube defect risk" (~34530).
  - The "Watch form video" link, which opens an unfiltered YouTube search (~44136, 44161), is dropped or replaced on care and rehab items.
- **Acceptance criteria:**
  1. Choosing any `MEDICAL_STYLES` key (11352) for the first time shows the acknowledgement.
  2. After it's acknowledged, choosing the same or another clinical program doesn't show it again (stored with `window.storage`).
  3. Choosing a non-clinical program never shows it.
  4. *(Alignment round)* No "Watch form video" link renders on a `MEDICAL_STYLES` exercise or a Care item (DOM count 0).
- **Test plan:** new `test-clinical-ack.js`, with the real program-switch path (`saveActiveProgram`, 14888) and a stub `window.storage`. Sabotage: skip the stored flag, and criterion 2 must fail.
- **Files:** `index.html` (11352, 14888, program picker), `sw.js`, the test. The `basis` review touches `content-citations.js` and program `basis` strings only after the owner decides who reviews them.
- **Risk:**
  - Health-claim and legal wording; the owner (or a clinician) must approve it.
  - One extra tap on clinical programs, once. Guarded by `test-program-recommendation.js`.
- **Status:** ready (after the Phase 3 gate) (owner yes 2026-11-08, D8 and D9(e): **a paid clinician reviews the clinical copy** before any listing). The build ships the acknowledgement and criterion 4. The clinician's review is the owner's step, outside the loop; any wording changes it asks for become their own item, and BIZ-12's store step waits for it. Roadmap slot 89. *Original question:* "Before going public, add a one-time care-team acknowledgement to clinical programs and have their claims, tips and nutrient notes reviewed, by a clinician?" **Recommendation:** yes, a paid clinician before listing. Keep the programs, because they're a differentiator no competitor has.

### BIZ-11: Business model
- **Why:**
  - **Owner's answer (2026-11-07):** "income will eventually be the goal, but we can start with free and then go to subscription down the line" (`pitch.md`, "Owner's answers").
  - The reworked model is in business.md §3.
  - **The risk to manage** is taking back or paywalling what free users already have. MyFitnessPal's barcode scanner (2022) and Strava's leaderboards and routes (2020) are the cases (business.md §3.2, with sources).
- **Change:** none in code. This item now records the model; the public wording is BIZ-18. The rule:
  - Everything that runs on the phone is free forever, with no ads and no quotas.
  - Only new, server-run things (hosted AI, cloud sync) can ever be in a subscription.
  - A founding price goes to everyone who trained before it's announced (BIZ-20).
  - Switch-on is by metrics, not a date (BIZ-21), and Play billing comes first (BIZ-22).
- **Acceptance criteria:** the owner's answer to the question below is recorded in business.md §3. BIZ-07's README copy and BIZ-18's in-app copy match it word for word.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`, `planning/pitch.md` (D9).
- **Risk:**
  - Once published, the free list can't shrink without breaking a promise. That's the point.
  - Coach features, if they ever exist, must stay additive (the coach pays; the client stays free).
- **Status:** needs-owner. **Question:** "Adopt business.md §3.3 as the rule: everything on the phone free forever with no ads, and only new server-run extras (hosted AI, cloud sync) ever in a subscription; and keep on-device 'advanced analytics' free?" **Recommendation:** yes to all three. On-device charts cost nothing to run, and the paid apps' history limits are the complaint we win on.

### BIZ-13: Off-device backup or sync
- **Why:**
  - One lost phone loses everything (business.md §5.3).
  - BIZ-04 and BL-22 reduce the risk, but they're manual.
  - A real fix moves data off the device: an export to the user's own iCloud or Drive through the share sheet, or encrypted sync on a server.
- **Change:** none until answered. If the own-cloud option is chosen, a follow-up item extends the existing JSON export (`exportDataBtn` 6248, handler 34159) to hand the file to the share sheet (`navigator.share` with a `File`), so the user can save it to iCloud Drive or Google Drive.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §5.3. The follow-up item writes its own jsdom criteria.
- **Test plan:** none until answered.
- **Files:** `planning/business.md`; later `index.html` (34159).
- **Risk:** any server option changes where user data goes and breaks the "your logs stay on your phone" promise.
- **Business note (2026-11-07, revised model):** own-cloud backup through the share sheet runs on the phone, so it's on the free-forever list (business.md §3.3) and pricing doesn't block it. A sync service on our server is a subscription candidate and waits for BIZ-21's triggers.
- **Status:** answered (owner yes 2026-11-08, "plus-items yes"): own-cloud file export through the share sheet first, free forever; a sync service only as part of the future subscription (BIZ-21, BIZ-22). The follow-up build item is still to be written (project-manager) and recorded in business.md §5.3.

### BIZ-14: Hosted AI for people without a key
- **Why:** the AI features need the user's own Anthropic key (6630), which blocks almost every new user (business.md §5.4). Hosting them needs a server, a key we pay for, and abuse limits.
- **Change:** none until answered. BIZ-06 makes the current state honest in the meantime.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §3.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:** recurring API cost, abuse limits, and user prompts (food photos, health data) going to a server we run. That breaks the privacy promise unless it's clearly opt-in.
- **Business note (2026-11-07, revised model):**
  - Hosted AI is the **first subscription candidate** (business.md §3.3).
  - It's also the only feature where a "lifetime" plan would be an open-ended cost, so it never gets one (§3.2).
  - Bring-your-own-key AI stays free forever, after hosted AI exists too. Removing it would be the clawback §3.2 warns against.
- **Status:** parked (owner 2026-11-08, "plus-items yes": not yet). Build only when BIZ-21's T1–T3 hold; beta it free with founding members to measure T4.

### BIZ-17: The first screen says what the app is
- **Why:** a stranger's first screen is "Training Log · Who's training? · Create a new profile" (`userPickerOverlay`, 5701–5712), with no line on what the app does or why it's worth a name (Playwright first-launch walk, business.md §5.2). The promise in business.md §1 is true at v3.514 and costs one line.
- **Change:**
  - Add one line under `#userPickerTitle`: "Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone."
  - `showUserPicker` (9637) shows it only when `getUserList()` is empty, the same condition that already hides the divider (v3.467). Switching between existing profiles is unchanged.
  - Copy only. If `planning/marketing.md` has settled wording by build time, its copy wins on tone; the line must stay factually true.
- **Acceptance criteria:**
  1. With an empty user list, `showUserPicker()` leaves the promise line visible and its text contains "your logs stay on your phone".
  2. With one or more users, the line is hidden.
  3. The divider's existing behaviour is unchanged in both states.
- **Test plan:** extend `test-first-launch.js`, with the real overlay markup and the real `showUserPicker`. Sabotage: drop the empty-list condition, and criterion 2 must fail.
- **Files:** `index.html` (5701–5712, 9637–9652), `sw.js`, the test.
- **Risk:** low. Picker layout at 402×874; check it in Playwright. Ship after BIZ-07 so the page metadata and the first screen say the same thing.
- **Alignment note (2026-11-07, business-manager B1):** the clause "your logs stay on your phone" is only true because BIZ-06 discloses what each AI feature sends. BIZ-06 is sequenced first (roadmap slot 55 vs 68). If BIZ-06's disclosure criterion hasn't merged, the line ends "…and your logs stay on your phone unless you use AI with your own key."
- **Status:** ready


### BIZ-19: "Training since" date from the log, on the device
- **Why:**
  - The founding-member promise (BIZ-20, business.md §3.4) needs proof of when someone started, and there are no accounts.
  - The log already holds that proof: the earliest dated set in the `ex:` keys.
  - `activity-dates` can't be used, because it prunes after 730 days (`ACTIVITY_DATES_RETENTION_DAYS`, 13913 at v3.515).
  - Showing the date now makes eligibility visible long before it matters, and it's a quiet, true line about the lifter's own history. It's a date, not a badge, and nothing is sent anywhere.
- **Change:**
  - Add a pure helper, `earliestTrainingDate(corpus)`, that returns the smallest `date` among entries with at least one set, from `readExCorpus` (41021 at v3.515).
  - Show one line beside the backup controls (`exportDataBtn`, 6248): "Training since <Month YYYY>. This date travels with your backup."
  - With no logged sets, show nothing.
  - No new storage key, and no write.
  - If MKT-17 has shipped, reuse its corpus pass rather than writing a second walk.
- **Acceptance criteria:**
  1. A corpus with sets dated 2024-03-05, 2025-01-02 and 2026-11-01 renders "Training since March 2024".
  2. An `activity-dates` fixture whose earliest date is later (pruned) doesn't change the result. The line reads from the log only.
  3. With an empty corpus, the line isn't in the DOM.
  4. Restoring a JSON backup that holds the 2024 entries into an empty profile renders the same line. Use the real import handler.
  5. No `fetch`, `sendBeacon` or `XMLHttpRequest` call happens during the render (stub-counted: 0), and no new storage key is written (snapshot the keys before and after).
- **Test plan:** new `test-training-since.js`, with the real `readExCorpus`, `normalizeExEntry`, the new helper and the real render path over stub `window.storage`. Sabotage: read `activity-dates` instead, and criterion 2 must fail.
- **Files:** `index.html` (6248 area, 41021, the settings render path; re-grep), `sw.js`, the test.
- **Risk:**
  - `readExCorpus` drops keys whose program day no longer exists (`parseExKey`), so a deleted custom program can make the date later than the truth. Say "on your log" in the What's New line, as MKT-17 does.
  - Settings layout at 402×874; check it in Playwright.
- **Status:** ready

### BIZ-18: "What's free" in writing: README, landing page and one in-app note
- **Why:**
  - The free/paid line (business.md §3.3) only protects users and the brand if it's public **before** anyone could be affected, so it can never look retroactive (§3.4).
  - Today nothing in the app or the README says what is free or why.
- **Change:**
  - One short "What's free" note in Settings (near the privacy link from BIZ-16), with the same text in the README and in MKT-14's landing page. The text is business.md §3.4's revised wording, with `{name}` filled from `APP_NAME` once the owner settles the public name: "Everything {name} does on your phone is free, forever, with no ads, including every program that comes with the app. We may fix or retire a feature for safety, but we will never put it behind a payment. If we ever add a paid plan, it will only cover things that run on our servers, like AI without your own key or cloud sync, and anyone who trained with {name} before then gets a founding price for as long as they stay subscribed. Coaches may one day pay to manage clients or sell programs they wrote; their clients and everyone else keep everything above for free."
  - *(Alignment round:* the older "if it runs on your phone, it's free" line is dropped, because it would make a paid coach program a broken promise; business.md §3.4.)
  - Copy only; nothing is gated.
  - Marketing owns tone (marketing.md §2). This item owns the facts.
- **Acceptance criteria:**
  1. The Settings note exists in the parsed `index.html` and contains "free, forever" and "no ads".
  2. The note's text equals the README's "What's free" paragraph (normalised whitespace), so the two can't drift.
  3. The note contains no price, no currency symbol and no date (regex count 0) until BIZ-21 sets them.
  4. *(Split out to BIZ-18a, which ships early as its own ready version.)* This item keeps BIZ-18a's test passing.
- **Test plan:** new `test-whats-free.js`, which parses the real `index.html` and `README.md`. Sabotage: change one word in the README paragraph, and criterion 2 must fail.
- **Files:** `index.html` (Settings), `README.md`, `sw.js`, the test; later `about.html` (MKT-14).
- **Risk:**
  - It's a public commitment with consumer-promise implications, so the owner must approve the exact words.
  - Ship it after BIZ-07 and BIZ-16 so all three say the same thing.
- **Status:** ready (after BIZ-16 and MKT-14) (owner yes 2026-11-08, D9(a)). At public launch (Phase 5) and not before; `{name}` is filled from `APP_NAME` (Platestep). Roadmap slot 92.

### BIZ-18a: The free-list guard test
- **Why:** BIZ-18's criterion 4 (no lock, upgrade or "Pro" label in free areas) only protects the free list if it runs on **every** later build. Inside a needs-owner Phase 5 item it would run on none (business-manager, non-blocking; roadmap "Business priorities" asked for it).
- **Change:** test only. No copy, no markup, and nothing the person sees. The version still bumps (`automation.md` §4 step 9). The What's New entry says honestly that nothing visible changed: "Behind the scenes: a check that keeps everything you use today free."
- **Acceptance criteria** (the regex is `/\b(pro|premium|upgrade|unlock|locked)\b/i` plus the lock glyph 🔒, applied to each element's own text, `aria-label`, `class` and `data-*` values):
  1. **The whole static app:** the real `index.html` parsed with jsdom, `<script>` and `<style>` removed, every element under `<body>` (1,766 at v3.528; this covers the set sheet, the program picker, Settings and its export and backup controls, the tab bar, More and every view's static markup) has 0 matches, apart from the named allowlist below.
  2. **The rendered views that jsdom can drive,** each with the real function and the fixture pattern of its existing suite: `renderFoodLog` (37931; as in `test-log-2-0.js`), `renderHistory` (45181; as in `test-history-date-range-filter.js`), `renderUpNext` (30742; as in `test-up-next.js`) and `openSetSheet` (31237; as in `test-set-sheet.js`). 0 matches in their output.
  3. **Today's exercise rows:** `renderWorkout` can't be driven in jsdom (`test-today-workout-emoji.js` 118 says why), so the test scans the string literals and template text of the real extracted `renderWorkout` (comments stripped) with the same regex: 0 matches. The test says in a comment that this is a source check, not a render.
  4. 0 elements in criteria 1–2 carry `disabled` together with text or an `aria-label` mentioning pay, price, subscribe or purchase.
  5. **Allowlist, exact:** the class `usda-key-upgrade-toggle` (a USDA-key panel style reused on 5 buttons at v3.528: `#onboardingDismiss`, `#waterTipsToggle`, `#sleepTipsToggle`, `#careCancelEdit`, `#coachChatClear`; "upgrade" is a hyphen-bounded word in it). Nothing else. The test prints every match it finds, allowed or not.
- **Test plan:** new `test-free-list-guard.js`. Sabotage: inject `<span class="pro-badge">Pro</span>` into the program-picker markup, and criterion 1 must fail; remove the allowlist, and criterion 1 must fail on the 5 USDA-toggle buttons (proving the scan reaches them).
- **Files:** `sw.js` (version), `index.html` (`APP_VERSION` 7625 and the `WHATS_NEW` entry only, 7643), `test-free-list-guard.js` (new).
- **Risk:** false positives on words like "progress" or "protein". The word-boundary regex and the named allowlist handle them; the test prints any match.
- **Spec refresh 3 (2026-11-09, against v3.528):** ran the regex over the real v3.528 markup: 5 false positives, all the class `usda-key-upgrade-toggle`, so the allowlist is now exact instead of "for example". "Rendering the real Today" can't be done in jsdom (`renderWorkout`), so the criteria now name the four renderers that can be driven, plus a stated source scan of `renderWorkout`. Scope unchanged.
- **Status:** ready

### BIZ-20: The founding-member promise
- **Why:**
  - Early users carry the risk of a new app, and grandfathering is the pattern that keeps them on side when pricing starts. Fitbod's 2026 price rise reportedly spared legacy subscribers (business.md §3.2; competitor-sourced, unverified).
  - The opposite, new terms for people already there, is what drew complaints for Oura in 2021 (§3.2).
- **Change:** none in code until a subscription exists. The promise:
  - Everyone who logs a training session before the subscription is announced gets a **founding price, recommended at half the list price, locked for as long as they stay subscribed.**
  - They keep everything on the free list, like everyone else.
  - There's no lifetime plan on hosted AI.
  - Eligibility is read on the device from the earliest logged set (BIZ-19). At switch-on it's applied through the store's own offer mechanism (BIZ-22).
  - Announced in general terms at launch (BIZ-18). The price and date are announced at least 30 days before billing starts.
- **Acceptance criteria:** the owner's answer is recorded in business.md §3.4. When billing is built, its item adds jsdom criteria for eligibility from `earliestTrainingDate` against the announcement cutoff.
- **Test plan:** none until billing exists.
- **Files:** `planning/business.md`.
- **Risk:**
  - It's a money promise that has to be honoured for years.
  - On-device proof can be faked by editing data. That's accepted as a small cost.
  - The store offer mechanics (Apple offer codes, Google Play offers) aren't verified here.
- **Status:** answered (owner yes 2026-11-08, D9(b): half the list price, locked while subscribed, on the server-run subscription only; no lifetime plan on hosted AI). No code until billing exists; the answer is recorded in `business.md` §3.4. *Original question:* "Promise a founding price (half of list, locked while subscribed, on the server-run subscription only) to everyone who trains with the app before the subscription is announced, and announce the promise at public launch?" **Recommendation:** yes. Offer no lifetime plan on hosted AI. Coach programs and the coach plan are priced separately (business.md §3.4, §3.8).

### BIZ-21: Switch the subscription on by metrics, not by a date
- **Why:**
  - Charging before retention is proven, or before the paid thing is good, risks the clawback and the review damage in business.md §3.2.
  - The earlier rule ("no billing code until 90 days of retention data", summit R3) said when to look, not what the data has to show.
- **Change:** none in code. The owner checks business.md §3.5 monthly, and the subscription switches on only when **all** of these hold:
  - **T1:** day-30 retention of at least 16% for 3 monthly cohorts in a row. That's twice the category's upper published figure.
  - **T2:** active users are enough to cover the measured running cost at a conservative paying share.
  - **T3:** people ask for sync or no-key AI unprompted, month after month.
  - **T4:** the paid feature is built and beta-tested, its cost per user is measured, and the privacy page is updated.
  - **T5:** roadmap Phases 0–2 are shipped, and nothing on the free list had to move.
  - **T6:** the payment path works in the store sandbox.
- **Acceptance criteria:** the owner's answer is recorded in business.md §3.5, along with a monthly check line (date, T1–T6 yes or no, with the numbers).
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`, `planning/roadmap.md`.
- **Risk:**
  - T1 and T2 depend on the store consoles. With no analytics, a PWA-only audience is invisible.
  - The 16% threshold is our proposal, not an industry benchmark.
- **Status:** answered (owner yes 2026-11-08, D9(c)): the six triggers replace "90 days of data", and no billing code is written until they all hold. Recorded in `business.md` §3.5; the monthly check line starts once a store console has data.

### BIZ-22: The payment path
- **Why:**
  - The app has no server and no accounts. Any paid feature (hosted AI, sync) needs a server anyway, and that's where the purchase check has to live (business.md §3.6).
  - Store billing comes through the native build, which the Capacitor effort owns. This item only records the dependency.
- **Change:** none in code. The options, with fee levels and sources, are in business.md §3.6:
  - **A:** store billing (Play first);
  - **B:** web payments with our own licence check;
  - **C:** both;
  - **D:** a voluntary support link now, with nothing locked.
- **Acceptance criteria:** the owner's answer is recorded in business.md §3.6.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:**
  - Accounts, money, contracts, tax, and a server that user data goes to (for opt-in users).
  - Web purchases unlocking an iOS store app risk App Review rejection (guideline 3.1.1, from developer reports).
  - The 2026 Play fee changes are reported but unverified here.
- **Status:** answered (owner yes 2026-11-08, D9(d): Play billing first; web payments only if iPhone PWA demand is large; no billing or server code before BIZ-21's triggers). Recorded in `business.md` §3.6. The optional "support us" link (path D) was not separately answered and stays off. *Original question:* "Plan on Play billing first, once the Capacitor build supports it, with web payments only if many users are on the iPhone PWA and there's no iOS build; and do you also want a 'support us' link now, with nothing locked?" **Recommendation:** yes to Play first, and no billing or server code before BIZ-21's triggers. The support link is optional; it's honest only if it says it pays for nothing extra.

### BIZ-23: The coach plan: the coach pays, the clients are free
- **Why:**
  - The owner approved the three-layer model on 2026-11-07 ("Love it"): free on the phone, Liftnext Pro for server features, and revenue that never touches the free app (business.md §0, §3.8).
  - Coaches already pay for this job: Hevy Coach is listed from about $25/mo with clients free, and TrueCoach is reported at $29.98–164.98/mo by client count (third-party sources, business.md §3.8; they conflict and are unverified on the vendors' pages).
  - It's the one paid product where the payer (the coach) is never the ordinary user, so it can't erode the free list.
- **Change:** none in code until answered and until Liftnext Pro's server exists (BIZ-21 T4). When built, it's a server-backed feature that ordinary users never see: a coach invites a client; the client opts in and chooses what to share; the coach writes and adjusts the client's program.
- **Acceptance criteria:**
  1. Now: the owner's answer is recorded in business.md §3.8.
  2. When built, a jsdom test (stubbed `fetch`, stub `window.storage`) proves:
     - with no coach link, rendering Today, the set sheet, the program picker, History and export makes no network call (stub-counted: 0) and shows no coach or upgrade element (DOM query count 0);
     - a client's sharing defaults to training logs only: body weight, food, sleep, BP, glucose, cycle and care data are excluded from the outgoing payload until each is switched on;
     - after the coach link ends, every `ex:` key and the last program version are still present (storage-key snapshot before and after) and the program still renders.
- **Test plan:** none until approved. Then a new `test-coach-link.js` over the real render paths, with the sabotage "include body weight in the default payload" failing criterion 2.
- **Files:** `planning/business.md` now. Later a server outside `index.html` (owner decision) plus `index.html` and `sw.js`, and the privacy page (BIZ-16).
- **Risk:**
  - Accounts, a server, money and a contract with each coach.
  - Client health data on our server brings the FTC Health Breach Notification Rule (amended 2024, names fitness apps) and Washington's My Health My Data Act into play (business.md §3.8; law-firm summaries, needs counsel).
  - Store rules on how a coach's subscription is bought (Apple 3.1.3(d) covers one-to-one services; a software plan may still need in-app purchase).
  - It would break the "no account" claim for clients who opt in, so the privacy page must say so.
- **Status:** plan of record (owner yes 2026-11-08, "plus-items yes"). No work before BIZ-21's T4; a privacy-law review before any client data reaches a server.

### BIZ-24: Coach programs: paid programs from real coaches, with a revenue share
- **Why:**
  - The third layer of the owner-approved model (business.md §3.8). Coaches earn from their work, and users get more choice, without anything we built becoming paid.
  - Precedent: Boostcamp keeps a free coach-program library and puts about 32 of 132 coach programs behind Pro, some sold one-time (Boostcamp's own pages; revenue-share terms not public).
  - The earlier free-list wording ("every program … and any added later", "if it runs on your phone, it's free") would have made this a broken promise. business.md §3.3 and §3.4 now say "everything we build", and it isn't published yet.
- **Change:** none in code until answered. When built: a coach program is imported like a custom program and labelled with its author; it runs on the free engine (progression, deloads, substitutions); purchase goes through store billing in store builds.
- **Acceptance criteria:**
  1. Now: the owner's answer is recorded in business.md §3.8.
  2. When built, a jsdom test proves:
     - every built-in key in `programs` renders in the picker with no price, lock or "Pro" element (DOM query count 0), with or without any coach program installed;
     - a bought coach program is still present and renders after the purchase record is removed (it's kept once bought), and it's included in the JSON export;
     - a coach program whose `basis` or notes contain a listed health-claim term ("treats", "cures", "prevents injury", "rehab", "safe for") is rejected on import, and a coach program in a clinical style (`MEDICAL_STYLES`) is rejected;
     - BL-01's goal-volume gate and BL-02's RPE caps apply to a coach program exactly as to a built-in one (same real functions).
- **Test plan:** none until approved. Then a new `test-coach-programs.js` with the real picker render, the real program-switch path (`saveActiveProgram`) and the real export; sabotage: label one built-in program "Pro", and the first check must fail.
- **Files:** `planning/business.md` now. Later `index.html`, `sw.js`, the test; the purchase check lives on the Pro server.
- **Risk:**
  - Money, contracts and revenue-share terms with each coach; tax reporting on payouts (not researched here).
  - Store fees come off the top (Apple 3.1.1 for digital content, Play Billing).
  - Liability for third-party programming: we publish it, so it must meet our safety bar and make no health claims (BIZ-15).
  - A bought program lives in the user's own data and can be copied. That's accepted.
- **Status:** plan of record (owner yes 2026-11-08, "plus-items yes"). After public launch and BIZ-21's triggers; the last of the three layers.

---

### BIZ-25: Move the app to its own origin, with export and import
- **Why:** the app lives at `jdabeast5.github.io/Training-Log`. Pointing a custom domain at it (or moving hosts) changes the origin, and localStorage and IndexedDB, which hold every log and progress photo, don't follow. Installed copies would open empty (marketing-manager B2).
- **Change:** none until answered. If yes, the follow-up item writes its own criteria. The outline:
  - the old origin shows a one-time "We've moved" sheet with a full backup export (the existing JSON backup already includes photos, ~34215);
  - the new origin offers import on first launch;
  - nothing is deleted at the old origin.
- **Acceptance criteria:** the owner's answer is recorded here.
- **Test plan:** none until answered.
- **Files:** later `index.html`, `sw.js`.
- **Risk:** data loss if done wrong. Never set a Pages custom domain on the app's repo as a side effect of BIZ-08.
- **Status:** parked (owner 2026-11-08: "25 forward". The domains only forward to the app; the origin doesn't move. Revisit at the store launch.)

### BIZ-26: The barcode library loads with an integrity hash
- **Why:** the barcode library runs from `cdn.jsdelivr.net` and `unpkg.com` by `<script src>` (~35227) with no Subresource Integrity, in a page that holds health data. A compromised CDN file would run with full access to every log (business-manager, non-blocking).
- **Change:** pin the exact version URL on both CDNs and add `integrity="sha384-…"` plus `crossorigin="anonymous"` to the loader. First check that both CDNs serve byte-identical files for that version; if they don't, each URL gets its own hash. No other loading change.
- **Acceptance criteria:**
  1. Every `<script>` element the barcode loader creates (the real loader, run in jsdom with `document.createElement` observed) has a non-empty `integrity` attribute starting `sha384-` and `crossorigin="anonymous"`.
  2. Each pinned URL contains an exact version (no `@latest`, no bare major).
  3. The fallback order between the two CDNs is unchanged.
- **Test plan:** new `test-barcode-sri.js`. Sabotage: drop the `integrity` attribute, and criterion 1 must fail. The PR records the hash computation (command and output) and a Playwright check that a real barcode scan still loads the library.
- **Files:** `index.html` (~35227), `sw.js`, the test.
- **Risk:** a wrong hash silently disables barcode scanning. Guarded by the Playwright load check and the existing barcode tests.
- **Tools:** `security-review`.
- **Status:** ready

## Marketing (MKT): added by marketing-manager, 2026-11-07

Written against **v3.514**. Evidence and the share-moment design for every item are in `planning/marketing.md` (§0, §1 and §3), from a Playwright walk (Chromium, 402×874, a fresh context plus `/.taste-skill/seed3.html`) and cards rendered with the real `buildShareCardBlob`. Line numbers are `index.html` at v3.514. **Re-grep them before editing.** The same rules and default `Tools:` apply as for every BL item. BIZ-08 (the address on cards) and BIZ-17 (the first-screen promise) are business items; nothing here duplicates them. Ready items are listed first, in suggested build order, then needs-owner items in priority order.

**Rules every MKT share item keeps:** cards are drawn on the device by the existing `buildShareCardBlob` (29510) and leave only through `shareCelebrationCard` (29609), so through the system share sheet the person taps. No new storage keys unless an item says so. Nothing is sent anywhere. No body weight, intake, sleep, heart rate, cycle, pain or condition data on a card by default. Clinical programs (`MEDICAL_STYLES`, 11352) never get a share button.

### MKT-01: Consistency counts training weeks, not consecutive days
- **Why:**
  - `computeStreak` (14040) counts consecutive calendar days in `activity-dates` (written by `recordActivity`, 13961, from set saves at 28521 and session ticks at 28760). The first celebration and share card fire at 7 in a row (`STREAK_MILESTONES`, 14059).
  - Readiness warns "6 days without a rest day" one day earlier (`READINESS_DAYS_NO_REST = 6`, 47130). So the app tells you to rest, then throws confetti for not resting.
  - Anyone following a 3–5 day program can never reach the first milestone, so the main consistency share moment never happens for them.
  - Weekly consistency matches the north star: weekly active trainers, at least 2 sessions a week (business.md §4).
- **Change:**
  - Add `computeWeekStreak()` beside `computeStreak`, reading the same `activity-dates`. A week (Monday to Sunday, local) counts when it has at least `max(2, daysPerWeekPref − 1)` training dates, or 2 when the preference is unset. One missed planned day doesn't break it. The current week counts as alive until it ends (the same "still alive until midnight" rule `computeStreak` documents).
  - Milestones become weeks: `[4, 8, 12, 26, 52]`. The celebration reads "8 weeks in a row" with the sub "Rest days included." The card headline is "8 WEEKS IN A ROW".
  - The streak badge (`renderStreak`, 14108) shows weeks ("8 wk").
  - **Celebration key (spec refresh 2: the summit note below decides it):** a new namespaced key, `week-streak-last-celebrated`, through `window.storage`. The old `streak-last-celebrated` is left alone. No `SCHEMA_VERSION` bump: BL-72 takes 9, and later items have numbers planned.
  - `computeStreak` stays: its other caller is `buildCoachChatContext` (42889). It just no longer drives milestones or the badge.
  - The days-per-week preference is read from `'days-per-week-pref'` (26005).
- **Acceptance criteria:**
  1. Training dates on Mon/Wed/Fri for 4 consecutive weeks, with `daysPerWeekPref = 3`: `computeWeekStreak()` returns 4, and the 4-week celebration fires once.
  2. 7 consecutive training days and nothing before: no celebration (the old 7-day milestone is gone).
  3. A week with 1 training date, with the preference unset: the streak resets to 0 at the end of that week, not during it.
  4. A rest day never breaks the streak inside a qualifying week.
  5. A second render after a milestone doesn't celebrate it again.
- **Test plan:** extend `test-streak.js` with the real `computeStreak`, the new `computeWeekStreak`, `checkStreakMilestone` and a stub storage with fixed dates (stub `getTodayKey`, 13880). Sabotage: count consecutive days again, and criteria 1 and 2 must fail.
- **Files:** `index.html` (14030–14130, 26005 read only), `sw.js`, `test-streak.js`. **Re-pin:** `test-header-refresh.js` lines 56–70 run the real `renderStreak` with only `computeStreak` and `checkStreakMilestone` stubbed and expect `'5 days streak'`. Once `renderStreak` reads `computeWeekStreak`, add that stub and change the expected text to the week form; name it in the PR. `test-up-next.js` (154) stubs `renderStreak` and `test-app-2-0.js` (66) checks only CSS, so both are unaffected.
- **Risk:**
  - Changes a visible number people may be attached to. The What's New line must say why: "Your streak now counts training weeks, so rest days never break it."
  - Today's Priorities and the weekly recap may read the streak. Guarded by `test-streak.js`, `test-weekly-recap.js` and `test-today-priorities.js`.
- **Summit note (summit 2026-11-07):** Preferred implementation: a new namespaced key, `week-streak-last-celebrated`, through `window.storage`, with the old key left alone. That avoids a `SCHEMA_VERSION` bump just to reset a celebration counter (summit §1.7). The streak number lives in UX-11's strip; no confetti.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; the summit's key choice made the spec (it was a note beside a contradicting Change line); the `test-header-refresh.js` re-pin found. Scope unchanged.
- **Status:** ready

### MKT-02: Share cards carry no body data by default
- **Why:** the week card's third row falls back from average sleep to **average body weight**, then **average intake** (`archiveCurrentWeek`, `index.html` 45708; the rows at 45756–45758). Body weight is the most sensitive number in the app, and it lands on a public image without the person choosing it. Sleep is also health data.
- **Change:**
  - The week card's third row becomes training-only: "PRs THIS WEEK" when there was at least one, else "SETS" (total logged sets that week). Sleep, weight and intake rows are removed from the card. (Owner decision D15: sets lead the cards.)
  - **Where the numbers come from (no second implementation):** PRs are the events from the existing `reconstructAllPRs()` (41850) dated inside the week; sets are the logged sets of `readExCorpus()` (41223) entries dated inside the week. Put both in one small async helper, `weekShareTrainingStats(weekStartKey)`, beside `computeWeekStats` (45674). Don't add them to `computeWeekStats` itself: `test-weekly-recap.js` runs `computeWeekStats` without the exercise corpus in its sandbox.
  - `archiveCurrentWeek` must stay free of inline `reduce(`: `test-weekly-recap.js` (line 46) pins that, so the summing lives in the helper.
  - Share text follows the card (it's built from `stats` in `shareCelebrationCard`, 29803; the line is 29814).
  - The archived `weekStats` record (with `avgWeight`, `avgSleep`) is unchanged; only the share card changes.
  - No setting is added in this item. If people ask for body stats on cards, that's a later opt-in item.
- **Acceptance criteria:**
  1. With weight, intake and sleep all logged that week, the `stats` passed to a stubbed `shareCelebrationCard` (captured by clicking the real `#weekShareBtn` after the real `archiveCurrentWeek` runs with stub storage and stubbed AI digests) contain no label in {AVG WEIGHT, AVG INTAKE, AVG SLEEP}.
  2. With 2 PR events dated in the week (stubbed `reconstructAllPRs`), the third row is `{value:'2', label:'PRs THIS WEEK'}`; with none, it's `{value:'<n>', label:'SETS'}` where n is the fixture's set count (a real `weekShareTrainingStats` over a stubbed `readExCorpus`).
  3. With no logged sets and no PRs, the card has its two rows only (WORKOUTS, PROGRAM).
  4. `archiveCurrentWeek` still calls `computeWeekStats(todayMonday)` and contains no `reduce(` (the existing `test-weekly-recap.js` pin keeps passing).
- **Test plan:** new `test-share-card-privacy.js`. Sabotage: restore the weight fallback, and criterion 1 must fail.
- **Files:** `index.html` (45674 area for the helper; 45708–45766; `#weekShareBtn` is at 5940 and rewired at 45761–45765), `sw.js`, `test-share-card-privacy.js` (new).
- **Risk:**
  - Low. Guarded by `test-archive-week-visibility.js`, `test-week-progress.js` and `test-weekly-recap.js`.
  - `reconstructAllPRs` counts an exercise's first logged session as a record (its running max starts empty), so a week that starts a new program can show several "PRs". That's the PR timeline's own definition; the card reuses it rather than inventing a second one. Flag it to MKT-07, which names the record's kind.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; the data sources (`reconstructAllPRs`, `readExCorpus`) named, the `test-weekly-recap.js` constraints found, criterion 3 added. Scope unchanged.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped; `test-weekly-recap.js` line 46 still pins "no `reduce(`" in `archiveCurrentWeek`, and `archiveCurrentWeek` still calls `computeWeekStats(todayMonday)` (45715). Scope unchanged.
- **Status:** ready

### MKT-03: Story-format share cards with the app's mark
- **Why:**
  - Cards are 1080×1080 (`buildShareCardBlob`, 29704). Instagram and WhatsApp stories, where achievement shares mostly go, are 9:16, so a square gets letterboxed.
  - The footer is the app's name in capitals as plain text (`ctx.fillText(APP_NAME.toUpperCase(), …)`, 29796, since v3.517; it said "TRAINING LOG" before). The icon's mark, the most recognisable brand asset, appears nowhere on a card.
- **Change:**
  - `buildShareCardBlob(cardData, format)`: `format` is `'story'` (1080×1920, the new default) or `'square'` (today's layout, unchanged).
  - In story format, keep the icon, headline, detail and stats between y = 250 and y = 1620 (clear of the story UI at the top and bottom).
  - Draw the **Sash mark** (the shipped v3.516 icon: the five plate inks as one band on a `--ground` tile) as canvas rectangles, not an image file, at the bottom. **The wordmark stays (owner, 2026-11-09: "keep the name").** MKT-03b is folded into this item: draw `APP_NAME.toUpperCase()` beside the mark in one row, which replaces the plain footer text (29796) so the name never disappears from cards. A reserved line stays under it for BIZ-08's address.
  - The file name is `${appSlug()}-<kind>-<YYYY-MM-DD>.png` (`platestep-pr-2026-11-30.png`; today it's `${APP_NAME.toLowerCase()}.png`, 29811). This item adds the one helper `appSlug()` beside `APP_NAME` (7631): `APP_NAME` lower-cased, with spaces as hyphens. MKT-20 reuses it for the backup file.
  - Colour and type follow `planning/design-vision.md` §3: a flat ink ground with no gradient or glow, the session day's spot ink as the one colour, Archivo for the big figure if UX-02 is approved, else Geist. If the vision's own card items land first, this item only adds the format and the mark to them.
- **Acceptance criteria:**
  1. With a stub canvas, `buildShareCardBlob(card)` sets `canvas.width === 1080` and `canvas.height === 1920`; with `'square'`, 1080×1080.
  2. In story format, every `fillText` call's y is between 250 and 1700 (stub-recorded).
  3. The Sash mark is drawn in both formats: exactly five `fillRect` calls inside the mark's box, whose `fillStyle`s equal the five target `--spot-*` inks from UX-01 (stub-recorded, in order).
  4. The square format's `fillText` calls equal today's for the same `cardData`, except the footer (record before and after; sabotage-anchored).
  5. No `fillText` string contains "TRAINING LOG" or "Training Log". Exactly one `fillText` call carries `APP_NAME.toUpperCase()`, its x and y are inside the mark's row (stub-recorded), and changing `APP_NAME` in the extracted source changes the drawn text (a real-code count of the literal name in the card code is 0). These are MKT-03b's criteria, folded in.
  6. The card's ground and spot ink come from the real `dayInk` (UX-01b): `dayInk(cardData.dayId ?? activeDay, activeProgram)`. A card with `dayId` for a `p-blue` day draws the blue spot ink (stub-recorded `fillStyle`).
  7. The icon is still drawn with `ctx.stroke(new Path2D(iconPath))` and never as `fillText(cardData.icon…)` (the existing `test-glyphs.js` pin, 241–243).
- **Test plan:** new `test-share-card-format.js`, with the real `buildShareCardBlob`, `wrapCanvasText` and `celebrationIconPath`, and a recording stub 2D context. Then render real PNGs in Playwright for the PR, streak and week cards in both formats and attach them to the PR. Sabotage: drop the format switch, and criterion 1 must fail.
- **Files:** `index.html` (7631 for `appSlug`; 29632–29830: `triggerCelebration`, `wrapCanvasText`, `celebrationIconPath`, `buildShareCardBlob`, `shareCelebrationCard`), `sw.js`, `test-share-card-format.js` (new). **Re-pins** (`test-app-rename.js` runs the real `buildShareCardBlob` with a recording canvas):
  - its case at 85–90 asserts the card draws `'PLATESTEP'` ("the footer is the app name"). Criterion 5 removes that; change the case to assert the name is **not** drawn in this version (MKT-03b brings it back), keeping its "no old name" half.
  - its case at 92–99 asserts the shared file is `` `${APP_NAME.toLowerCase()}.png` ``; change it to the `appSlug()` form. Its anchor (exactly 3 `new File([blob]` / `a.download =` lines) still holds.
  - Name both in the PR. Guard: `test-glyphs.js` (241–243, the icon stroke pin).
- **Owner option (non-blocking; default is the scope as written):** since v3.517 the card already prints "PLATESTEP", and the owner confirmed the name on 2026-11-08 (MKT-03b is ready). As written, MKT-03 removes the name and MKT-03b puts it back one version later, so cards go without the name for at least one day. Option: MKT-03 keeps the name, moved into the reserved line beside the mark (MKT-03b's criterion 1), and MKT-03b keeps only the event band. Then criterion 5 and the first re-pin above drop. The loop builds the default unless the owner picks the option first.
- **Risk:** visual. The design-engineer reviews the rendered PNGs. The name never appears in this version, so a rename can't strand printed cards.
- **Tools:** `Skill: impeccable` (`polish`, Markdown fallback only until the owner approves the engine) on the rendered cards.
- **Alignment note (2026-11-07):** the ring mark is replaced by the Sash mark (MKT-19 shipped as the icon in v3.516). **No wordmark until the public name is confirmed** (market-researcher B1, marketing-manager B1). The wordmark is MKT-03b. Builds the story frame (safe zones, mark tile, sponsor strip) so the bib (MKT-16) reuses it. Ships after UX-01b and, if approved, UX-02. Year in Lifting 2026 carries no address (consensus decision 16).
- **Summit note (summit 2026-11-07):** Draw it in the Plate & Press world from day one (flat ink ground, the day's spot ink, no gold glow), so cards are never redone (summit §1.4). It's on the Year in Lifting lane (roadmap slot 17).
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped. Found: the footer has drawn `APP_NAME` since v3.517 (the spec still described "TRAINING LOG"), so criterion 5 now breaks `test-app-rename.js`; both of its re-pins named. Criterion 6 says where the day comes from; criterion 7 keeps the `test-glyphs.js` pin. Scope unchanged; the name question is a non-blocking owner option.
- **Status:** ready (after UX-01b; owner 2026-11-09: keep the name, MKT-03b folded in)

### MKT-03b: The wordmark on cards, once the name is confirmed
- **Why:** MKT-03 ships the mark alone so the Year in Lifting lane never waits on the name (consensus G1). Once the owner confirms the public name (after the USPTO knockout and buying its domain; marketing.md §2.1, §4.3), cards add it.
- **Change:** draw `APP_NAME` beside the Sash mark in the reserved line. Per marketing.md §3.4: one word, in capitals only beside the mark; on story cards the event band reads `[mark] NAME · PROGRAM · WK n`. Never a figure that reads as an instruction (no "NAME: 160").
- **Acceptance criteria:**
  1. Exactly one `fillText` call carries `APP_NAME.toUpperCase()`, and its x and y are inside the mark's row (stub-recorded).
  2. Changing `APP_NAME` in the extracted source changes the drawn text (no literal name in the card code: a real-code count of the literal is 0).
  3. All MKT-03 criteria, except 5, still pass.
  4. `test-app-rename.js`'s card case goes back to asserting the name is drawn (`'PLATESTEP'`), undoing MKT-03's re-pin; name it in the PR.
- **Test plan:** extend `test-share-card-format.js`. Sabotage: hard-code "LIFTNEXT", and criterion 2 must fail.
- **Files:** `index.html` (`buildShareCardBlob`, 29704 at v3.527), `sw.js`, `test-share-card-format.js`, `test-app-rename.js` (re-pin back).
- **Risk:** prints the name on images nobody can recall. That's why it waits for the owner.
- **Spec refresh 2 (2026-11-09, against v3.527):** the card builder's line and the `test-app-rename.js` re-pin named. If the owner takes MKT-03's option, this item shrinks to the event band. Scope unchanged.
- **Status:** done-by MKT-03 (owner 2026-11-09: keep the name beside the mark from MKT-03 on; nothing left to build here).

### MKT-04: Share a finished session
- **Why:** finishing a session is the most frequent earned moment (every training day), and its celebration (`triggerCelebration('flag', 'Session complete!', …)`, 29460, inside `renderWorkout`'s checkbox `change` handler) has no share button. PR and streak celebrations already pass `shareData` (32185, 14082).
- **Change:**
  - Pass `shareData` to that call: `{icon:'flag', headline:'SESSION COMPLETE', stats:[…]}`, with the day label ("Upper · Strength"), sets logged today on that day, the number of lifts, minutes when known (`workout-time:{date}` or the Gym clock; left out when unknown), and "PRs: n" when there was at least one.
  - **No total load by default** (alignment round: exercise-auditor N1, marketing-manager). Tonnage rewards extra easy sets [ROB24][PEL]. The pure builder may still return `load` for a later opt-in, but it isn't in `stats`.
  - No share data when `activeProgram` is a `MEDICAL_STYLES` key.
- **Spec refresh 3, how it's tested:** the completing click lives inside `renderWorkout` (28713–29559), which can't be driven in jsdom. So the stats come from a pure, async builder that reads what's on the page and in storage: `sessionShareStats(listEl, dateKey, program)`. It counts set rows in `listEl` whose `.ex-reps` has a value (SETS), exercise blocks with at least one (LIFTS), minutes from `workout-time:{dateKey}` (`recordWorkoutTime`, 13997; `{first,last}` clock times) or `gymElapsedMs()` (30509) when Gym mode ran, and PRs dated `dateKey` from `reconstructAllPRs` (41853). It returns `undefined` for a `MEDICAL_STYLES` key (11406).
- **Acceptance criteria:**
  1. Real `sessionShareStats` over a jsdom list with 18 rows with reps (across 5 exercises) returns `stats` containing `{value:'18', label:'SETS'}` and `{value:'5', label:'LIFTS'}`.
  2. The `stats` labels are exactly {SETS, LIFTS, MIN} (MIN only when the stub storage has `workout-time:<date>`), plus PRS when the stubbed PR list has one dated today. No label matches /LOAD|VOLUME|LB|KG/.
  3. With a `MEDICAL_STYLES` program, it returns `undefined`.
  4. Real-call count: the extracted `renderWorkout` (comments stripped) has exactly one `'Session complete!'` `triggerCelebration(` call, and it passes the awaited `sessionShareStats(` result as its fifth argument.
- **Test plan:** new `test-session-share.js` with the real builder, `reconstructAllPRs` stubbed at its boundary, stub storage. Sabotage: drop `shareData` from the call, and criterion 4 fails; count rows without reps, and criterion 1 fails.
- **Files:** `index.html` (the builder near `triggerCelebration` 29635; the call at 29460; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-session-share.js` (new). Guards: the ten suites that extract `triggerCelebration` (`test-auto-check-sets.js`, `test-backdating-rest-timer-suppression.js`, `test-emoji-check-icon-migration.js`, `test-fallback-entry-consolidation.js`, `test-glyphs.js`, `test-partial-set-reactions.js`, `test-set-next-button.js`, `test-superset-field-chaining.js`, `test-superset-rest-timer-suppression.js`, `test-superset-shared-sets-block-wiring.js`), unchanged.
- **Risk:** the 5-second banner hold applies whenever there's share data (`holdMs`, 29662), so the session banner stays up longer. That's intended; check it doesn't cover Gym mode's exit control in the harness's `gym-*` state.
- **Summit note (summit 2026-11-07):** Put the stats in a named pure builder (e.g. `sessionShareStats`) that UX-09's Share calls. Ship directly before UX-09a, so only the banner wiring is temporary (summit §1.4).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. The old test plan drove a handler that lives inside `renderWorkout`; the builder now reads the rendered list and storage, so it's driven for real, and the wiring is a one-site call count. Scope unchanged.
- **Status:** ready

### MKT-05: Share a finished training block
- **Why:** finishing a 4–6 week block is the moment lifters actually post ("finished my first block of…"). The app knows when a block ends (`cycleWeekOf`, 26723, and `isDeloadWeek`, 14915) but marks it with nothing. Graduation celebrations exist only for rehab and postpartum programs (15590, 15921), which must not get a share button.
- **Change:**
  - When `archiveCurrentWeek` (45414) archives the last week of a cycle, show a celebration ("Block complete") with share data: program name, "5 weeks", sessions done out of planned, and the top 3 e1RM gains across the block (from `reconstructAllPRs`, 41641, or the existing e1RM helpers).
  - Never for `MEDICAL_STYLES` keys or custom programs with no cycle.
  - The existing graduation celebrations stay as they are, without share data.
- **Acceptance criteria:**
  1. Archiving week 5 of a 5-week Strength cycle triggers one celebration with `shareData.headline === 'BLOCK COMPLETE'`.
  2. Archiving week 3 of 5 triggers none.
  3. The top-gain rows are sorted by gain, at most 3, and computed from the fixture's sets.
  4. A `MEDICAL_STYLES` program's last week triggers no share data.
- **Test plan:** new `test-block-complete-share.js` with the real `archiveCurrentWeek` path, `cycleWeekOf` and stub storage. Sabotage: fire on every week, and criterion 2 must fail.
- **Files:** `index.html` (26723, 41641, 45414–45480), `sw.js`, the test.
- **Risk:** the end-of-week flow already shows a status line and a week share button. Keep one share button visible at a time; check in Playwright.
- **Summit note (summit 2026-11-07):** Render it as the **last-week variant of UX-11's recap sheet**, not a separate celebration, so there aren't two interruptions on one Monday (summit §1.4). Record wording follows summit R6.
- **Status:** ready (after UX-11)

### MKT-06: Year in Lifting (an annual recap, on device)
- **Why:** annual recaps are the largest share event in consumer apps: Spotify reports 500 million Wrapped shares in about 24 hours (company-reported, marketing.md §3.1). Strava's "Year in Sport" is the fitness version, but it's for subscribers only. A free, private, on-device version is on-brand and recurs every December.
- **Change:**
  - From 1 December to 15 January, with at least 8 training dates in the year: one row in Today's Priorities ("Your 2026 in lifting is ready") and an entry in History.
  - It opens a short sequence of 4–5 story cards (MKT-03's format), each with its own share button: sessions and weeks trained; total sets (total load lifted only as a small secondary line, never the headline figure; alignment round, exercise-auditor N1); the biggest e1RM gain (lift and amount); the most-trained muscle group (from the existing muscle mapping); the longest weekly streak (MKT-01).
  - All computed on the device from `activity-dates`, `week-archive` and the set history. No body weight, food or health data on any card.
  - Rendered as a view section using existing patterns (`VIEW_RENDERERS`/`showView`, `expand-wrap`); no new view framework.
  - "Hide" is stored with `window.storage` (`recap-<year>-dismissed`).
- **Acceptance criteria:**
  1. With a fixture year of 120 training dates, the computed recap's `sessions === 120`, and the total sets and load equal sums over the fixture. No card's largest `fillText` (by font size) is the load figure.
  2. On 30 November: no Priorities row. On 1 December: the row. On 16 January: none.
  3. With 7 training dates in the year: no row.
  4. No card's `fillText` text contains a body-weight, calorie or sleep value (stub-recorded).
  5. Computing the recap calls no `fetch` (stub-counted: 0).
- **Test plan:** new `test-year-recap.js`, with the real recap builder and the real Priorities insight function, a stub storage and a fixed date. Sabotage: count calendar days instead of training dates, and criterion 1 must fail.
- **Files:** `index.html` (Today's Priorities near `getWeeklyRecapInsight` 14646 and `renderTodayInsights` 14667, its `order` list 14704; History; `reconstructAllPRs` 41850; `readExCorpus` 41223), `sw.js`, the test.
- **Risk:**
  - Larger than one usual increment. If it can't ship as one tested version, split it: (a) the computation and one summary card, (b) the remaining cards. Each its own version.
  - Depends on MKT-03 for the format. Ship MKT-03 first.
  - Time-critical: to land in December 2026 it needs to ship by 30 November.
- **Tools:** `Skill: dataviz` for any chart on the cards.
- **Summit note (summit 2026-11-07):** Ship as two versions. **06a** is the computation, the Priorities row and one summary card; target merged by 30 November (roadmap build 12). **06b** is the remaining cards, after MKT-01. Constraints: "biggest e1RM gain" excludes `oly`/`jump`/`throw` (Epley isn't valid there, SAF-2). No share buttons while a `MEDICAL_STYLES` program is active. Record wording per summit R6. If 06a slips, nothing else moves (summit R5).
- **Alignment note (2026-11-07):** 06a is roadmap slot 19. The 2026 cards carry the mark, the name only if it's confirmed by then (MKT-03b), and **no address** (the Phase 3 gate stays; December 2026 is a dogfood run, and December 2027 is the public moment). **06b has no "wall of bibs":** that moves to the 2027 recap, because MKT-16 ships after 06b.
- **Spec refresh 2 (2026-11-09, against v3.527): the split, made buildable.** The summit split this item into two versions, but the criteria were written for the whole. Each version's criteria:
  - **MKT-06a (slot 19):** a pure `computeYearRecap(year)` (training dates from `activity-dates`, total sets from `readExCorpus()`, total load as a secondary figure), `getYearRecapInsight()` (the Priorities row, between 1 December and 15 January, with ≥ 8 training dates, hidden by `recap-<year>-dismissed` through `window.storage`), and **one** summary story card through `buildShareCardBlob(…, 'story')` (MKT-03). Criteria 1, 2, 3, 5 above, plus criterion 4 for that one card, plus:
    - 6a. The real `renderTodayInsights` with the new getter returning a row shows it in its `order` slot (state the slot in the PR); with `recap-2026-dismissed` stored, the real getter returns `null`.
    - 7a. No share button while a `MEDICAL_STYLES` program is active (summit note).
    - Test: new `test-year-recap.js`. **Re-pins:** `test-cycle-phase-nutrition-insight.js` (stubs at 125–140) and `test-supplement-condition-cycle-nudge.js` (230–245) hand-stub every Priorities getter and run the real renderer; add the new getter to both and name them in the PR. `test-today-priorities.js` stubs getters from the renderer's own calls (line 30), so it needs nothing.
  - **MKT-06b (slot 29):** the remaining cards (weeks trained; biggest e1RM gain, excluding `oly`, `jump` and `throw`; most-trained muscle group; longest weekly streak from MKT-01's `computeWeekStreak`) and the History entry. Criterion 4 for every card, plus: 6b. the e1RM card never names an `oly`, `jump` or `throw` exercise (fixture with a big Snatch gain); 7b. the streak card's number equals the real `computeWeekStreak`'s longest run over the fixture year. Extends `test-year-recap.js`.
  - The History entry moved to 06b because the summit's 06a list ("the computation, the Priorities row and one summary card") doesn't include it. Nothing else moved.
- **Status:** ready (after MKT-03). MKT-06a at slot 19; MKT-06b at slot 29, after MKT-01.

### MKT-07: PR and progress cards show the gain
- **Why:** "Bench Press — 225 lb" (the PR card, 31988) is a number. "+10 lb on bench, was 215" is a story, and it's less identifying. There's also no way to share long-term progress on a lift, the "before and after" that lifters actually post.
- **Change:**
  - The PR card's detail adds the previous best: "Bench Press — 225 lb · +10 lb (was 215 lb)". When there's no previous best, it stays as today.
  - On a lift's history, a "Share progress" button builds a card: "Squat e1RM 225 → 275 lb in 12 weeks", with a sparkline drawn on the canvas. It spans the first logged e1RM in the selected range to the current best.
- **Acceptance criteria:**
  1. With a previous best of 215 and a new 225 PR, the `shareData.detail` contains "+10" and "215".
  2. A first-ever PR (no previous best) produces today's text exactly.
  3. The progress card's numbers equal the first and best e1RM from the fixture, using the app's real e1RM function.
- **Test plan:** new `test-pr-gain-card.js` with the real `saveExSet` PR path and the e1RM helpers. Sabotage: drop the previous best lookup, and criterion 1 must fail.
- **Files:** `index.html` (31980–31990, the lift-history view, 29510), `sw.js`, the test.
- **Risk:** the PR path is hot. Guarded by the existing PR tests; run them all.
- **Summit note (summit 2026-11-07):** Name the kind of record (summit R6): "Heaviest weight yet: +10 lb over 215" for a weight record; "best" or "strongest" only for an e1RM record. No share for `MEDICAL_STYLES` programs.
- **Status:** ready

### MKT-08: Side-by-side progress photos, made on the device
- **Why:** Progress Photos (6543) can only be compared by sending both photos to an AI with your own key ("Compare with AI", 6561). People mostly want the simple thing: two dated photos side by side, saved or sent by them. That needs no network at all.
- **Change:**
  - Next to "Compare with AI", a "Side by side" button builds a 1080×1350 image from the two selected photos, each labelled with its date, plus the small mark. Nothing else: no weight, no numbers.
  - It opens the share sheet through the same path as the cards.
  - Never suggested anywhere else (no Priorities row, no celebration). Body images are opt-in only.
- **Acceptance criteria:**
  1. With two photos selected, the stub canvas receives two `drawImage` calls and two date `fillText` calls.
  2. No `fetch` is called (stub-counted: 0).
  3. With fewer than two photos, the button is disabled.
- **Test plan:** new `test-photo-side-by-side.js` with the real Progress Photos markup and handler, stub images and canvas. Sabotage: draw one image, and criterion 1 must fail.
- **Files:** `index.html` (6543–6565 and the Progress Photos handlers), `sw.js`, the test.
- **Risk:** body images. Keep the privacy note at 6556 accurate: the side-by-side image is made on the device and shared only by the person.
- **Summit note (summit 2026-11-07):** Deferred to Phase 5. Body images have the lowest mission value of the share moments, and the item stays as written.
- **Status:** parked (summit 2026-11-07): deferred to Phase 5; return to ready when Phase 4 is done

### MKT-09: The public name
- **Why:** "Training Log" is a category description. The App Store already lists Training Tracker, TrainLog, LiftLog, StrengthLog, Workout Log and Lift Notes (marketing.md §2.1). It can't be owned in search or as a trademark.
- **Change:** the display rename **shipped as v3.515** (Training Log → Liftnext). The owner then chose **Platestep** (second round of answers, 2026-11-07, `pitch.md`), which **shipped as v3.517**: `APP_NAME = 'Platestep'` (`index.html` 7624), manifest, `<title>` and `apple-mobile-web-app-title`, with storage keys and the `training-log-v` cache names unchanged (guarded by `test-app-rename.js`). That was this item's roadmap slot 15 ("only if the owner picks a name other than Liftnext").
- **What remains, outside the build loop:**
  - Record the answer in `planning/marketing.md` §2.1 (it still reads as open at 2026-11-08). Planning-only.
  - The USPTO knockout search (owner to do, per `pitch.md`). CLAUDE.md (2026-11-08) records that the owner holds `platestep.app` and `platestep.com`; never set either as a Pages custom domain (BIZ-25).
  - MKT-03b (the wordmark) stays `needs-owner` until the owner confirms the knockout is clear.
- **Acceptance criteria:** met for the rename by v3.517 (`APP_NAME` equals the manifest `name`; no localStorage key changed: `test-app-rename.js`).
- **Test plan:** none further.
- **Files:** `planning/marketing.md` (record only).
- **Risk:** none further in the loop. Home-screen installs keep their old label until re-added; the v3.517 What's New told the owner to export a backup first (CLAUDE.md, "Home-screen installs").
- **Spec refresh (2026-11-08):** status brought up to date with the owner's second-round answer and v3.517. The loop skips slot 15.
- **Status:** done (v3.517). The trademark check is the owner's; MKT-03b carries the remaining question.

### MKT-10: Share a program as a link
- **Why:** people pass programs to training partners. A link that opens the app with the program ready to import is a referral that carries real value, and it needs no server: the program goes in the URL fragment (`#p=…`), which browsers never send to the server.
- **Change (if approved):** "Share this program" on custom programs builds `PUBLIC_APP_URL + '#p=' + base64url(JSON)`. On load, the app reads the fragment (following the `launchViewFromUrl` pattern, 40172), validates it against the custom-program shape, shows a preview and imports only after a tap. The fragment is stripped after reading.
- **Acceptance criteria:** a round trip reproduces the program exactly; a malformed or oversized payload is rejected with a message and writes nothing; nothing is imported without the confirm tap.
- **Test plan:** new `test-program-link.js` with the real encode, decode and validate functions. Sabotage: skip validation, and the malformed case must fail.
- **Files:** `index.html` (custom programs near 14735 and 15471; 40172), `sw.js`, the test.
- **Risk:** the URL is untrusted input (`Skill: security-review`). It depends on the public address (BIZ-08, BIZ-12).
- **Status:** ready (after BIZ-08) (owner yes 2026-11-08, "plus-items yes").

### MKT-11: Friend challenges by link, with no server
- **Why:** in a randomized trial, social comparison raised exercise-class attendance about 90% over arms without comparison, while support alone did not beat control ([Zhang et al. 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5008041/)). A challenge can work with no server: the link carries the rule, each person tracks it on their own phone, and the comparison happens in the chat they already use, with each person's result card.
- **Change (if approved):** from the consistency card, "Challenge a friend" builds a fragment link: `#c=` with a start date, length in weeks, and target sessions per week. Opening it shows the challenge and an "I'm in" button, stored with `window.storage`. At the end, a result card ("Challenge done: 4/4 weeks") with a share button. No leaderboard and no names in the link.
- **Acceptance criteria:** the link round-trips; progress is computed from `activity-dates` within the challenge window; a malformed link is rejected and writes nothing.
- **Test plan:** new `test-challenge-link.js`. Sabotage: count dates outside the window.
- **Files:** `index.html`, `sw.js`, the test.
- **Risk:** depends on BIZ-08 and MKT-01. Keep it opt-in and guilt-free: no reminders that shame a missed week.
- **Status:** ready (after BIZ-08) (owner yes 2026-11-08, "plus-items yes"; also after MKT-01).

### MKT-12: Competitor names in store copy and search pages
- **Why:** the highest-intent searches are switching searches ("Strong alternative", "Hevy free alternative"; business.md §6). Writing pages or keywords around them uses other companies' trademarks.
- **Change** (owner yes 2026-11-08, D6: **one** dated, sourced comparison page):
  - One static `compare.html` beside `about.html` (MKT-14), linked from it. Same rules as MKT-14: no framework, no analytics, no third-party requests, not precached by `sw.js`.
  - A table of factual rows (price, free tier, progression, per-muscle volume, CSV import and export, account required). Each row about another app carries the date it was checked and a link to its source (the app's own pricing or help page where possible). Our own rows cite the feature in the app.
  - A "Checked on" date at the top. Competitor names appear only on this page: never in store keywords or store copy (stores restrict competitor names in metadata).
  - It leads with the switcher's question, how to bring your history (BL-29), so it ships only after the import exists.
- **Acceptance criteria:**
  1. `compare.html` parses in jsdom and has one comparison table. Every `<tr>` in its body that names another app has a `<time datetime>` and at least one `<a href="https://…">`.
  2. The page has 0 `<script src>` and 0 `<link href>` pointing at another host.
  3. `about.html` has one link whose `href` is `compare.html`.
  4. The `manifest.json` description and `index.html`'s `<meta name="description">` and `og:` tags contain none of the compared apps' names (count 0). (The store-listing fields themselves belong to the Capacitor track; `planning/store/app-store.md` already rules competitor names out.)
- **Test plan:** new `test-compare-page.js`. Sabotage: drop one row's `<time>`, and criterion 1 must fail.
- **Files:** `compare.html` (new, approved with D6), `about.html` (link), `sw.js` (version), `index.html` (`APP_VERSION` and `WHATS_NEW` only), the test; the answer is noted in `planning/marketing.md` §4.4.
- **Risk:** trademark and comparative-advertising claims. Every claim must be checkable on the date it's published.
- **Status:** ready (after BL-29 and MKT-14) (owner yes 2026-11-08, D6: one dated, sourced comparison page). Roadmap slot 97. *Original question:* "May we publish factual comparison pages that name Strong, Hevy and others (never in store keywords)?" **Recommendation:** yes, for one page with dated, sourced facts, and only after the CSV import (BL-29) exists, because that's what a switcher needs.

### MKT-13: Public launch posts and creator outreach
- **Why:** nobody can find the app (business.md §5.1). The launch plan (marketing.md §4.3) uses Product Hunt, the self-promotion threads of r/Fitness, r/weightlifting and r/xxfitness, r/PWA and r/SideProject, and evidence-based strength creators.
- **Change:** none in code. The posts go out under the owner's name.
- **Acceptance criteria:** the owner's answer is recorded in `planning/marketing.md` §4.3.
- **Test plan:** none; a decision.
- **Files:** `planning/marketing.md`.
- **Risk:** community rules (each sub's sidebar on the day), and the first impression: don't launch before BIZ-01 to BIZ-03 and BIZ-17 ship.
- **Status:** answered (owner yes 2026-11-08, D8). No code: the posts go out under the owner's name, after BIZ-12's web step, BIZ-16 and MKT-14, and under marketing.md §4.3's sequencing rule. Recorded in `marketing.md` §4.3. *Original question:* "After the first-launch fixes ship, may we launch publicly (Product Hunt plus the designated self-promotion threads) and contact creators, with no paid placements?" **Recommendation:** yes, after BIZ-12 and BIZ-16.

### MKT-14: A landing page file
- **Why:** the README is the only landing page, and a GitHub repo page converts badly for people who don't use GitHub. The app itself is the Pages root.
- **Change** (owner yes 2026-11-08, D8): one static `about.html` beside `index.html` (no framework, no analytics, no third-party fonts), with the promise, screenshots, install steps and privacy facts. Not precached by `sw.js`. BIZ-18 later adds its "What's free" paragraph here, and MKT-12 its comparison link.
- **Acceptance criteria:**
  1. `about.html` parses in jsdom, and its `<title>` and first heading contain `APP_NAME`'s value read from `index.html`.
  2. 0 `<script src>`, `<link href>` or `<img src>` pointing at another host, and 0 analytics or tracking script tags.
  3. It links to `index.html` (the app) and `privacy.html` (BIZ-16), one each.
  4. `sw.js`'s precache list doesn't include `about.html`.
- **Test plan:** new `test-landing-page.js`. Sabotage: add a Google Fonts `<link>`, and criterion 2 must fail.
- **Files:** `about.html` (new), `README.md` (link), `sw.js` (version), `index.html` (`APP_VERSION` and `WHATS_NEW` only), the test.
- **Risk:** a new file beside `index.html`, which CLAUDE.md restricts. That's why it needs the owner.
- **Status:** ready (after BIZ-16) (owner yes 2026-11-08, D8). The new `about.html` file is approved with it. Roadmap slot 91.

### MKT-15: Any referral attribution
- **Why:** to learn which share moments bring people in, the share link would need to say where it came from (`?ref=pr`, `?ref=week`). That's attribution, which is tracking in kind even if nothing is stored.
- **Change:** none until answered. If yes: the share URL carries `ref`; the app strips it on load and stores nothing; only the store consoles' aggregate referrer reports see it.
- **Acceptance criteria:** the owner's answer is recorded in `planning/marketing.md` §5.
- **Test plan:** the follow-up item tests that `ref` is stripped and never written to storage (snapshot the keys).
- **Files:** `planning/marketing.md`.
- **Risk:** it weakens "no tracking" as a claim, even if only slightly.
- **Status:** parked (owner no 2026-11-08, "plus-items yes": no attribution for now).

### MKT-16: The session bib card (the story layout for finished sessions)
- **Why:** the design review (`planning/design-directions.md` §5 and §6) picked the race bib as the story-card format, because it's the only one of the three directions that stops a thumb in a feed, and it works from session 1 with no record needed. The rendered bib (`tools/design/directions/renders/c-card.png`) has three gaps that this item closes:
  - nothing on it says lifting, so a stranger reads it as a running race;
  - "Finished 58:12" is a race-style claim, and outside Gym mode there's no seconds data behind it (`gymElapsedMs`, 30509; `recordWorkoutTime` is minute-resolution, 13997);
  - its number came from `activity-dates`, which is pruned to 730 days (`ACTIVITY_DATES_RETENTION_DAYS`, 13960), so the number would stop rising after two years.
- **Change:**
  - A `'bib'` story layout inside `buildShareCardBlob` (MKT-03's `format` argument), used by MKT-04's session share. The square format keeps A's grid. Drawn on `<canvas>`: no new asset beyond UX-02's Archivo file (fallback: Geist).
  - **Ground:** the session day's plate ink, from `dayInk` (UX-01b). **Bib:** white, rotated 2.5°, four pin holes, and **one** event band in ink (marketing.md §3.4): `[Sash tile] NAME · PROGRAM · WK n` and the date. NAME is `APP_NAME` (owner 2026-11-09: keep the name; MKT-03b is folded into MKT-03, so there's no "tile alone" case any more).
  - **The number:** the training-day number from MKT-17's builder, captioned "your 47th training day on the log". MKT-17 ships after this item, so this item adds the pure counter itself, `trainingDayNumber(corpus, dateKey)` (distinct dates with a logged set in `readExCorpus`, 41226), and MKT-17 reuses it rather than writing a second one.
  - **The loaded bar,** drawn under the number from the lead lift's top set, using UX-07's plate maths in the day's inks, heaviest plate against the collar.
  - **The lead lift line:** the lift, its sets ("160 lb × 6, 6, 5, 5") and the honest progression line from the real progression note (BL-08). No "→ 165" unless the engine says so.
  - **Tear-off tabs:** sets (the default, first tab), lifts, and "58 min". **No total load** (exercise-auditor N1). Minutes come from `workout-time:{date}` (first to last set) or the Gym clock if it ran, and are left out when unknown. **No "Finished", no mm:ss.**
  - **The big figure is "No. 47"**, never a load, so nothing reads as "lift next: 160".
  - **The loaded bar is mandatory on barbell days.** With "chalk" gone, it's the bib's only lifting signal (marketing.md §3.4).
  - **The sponsor strip** at the bib's foot carries only BIZ-08's address, once approved; until then it's empty.
  - All text between y = 250 and 1620. No body data. No card for `MEDICAL_STYLES` programs.
- **Acceptance criteria:**
  1. With a fixture of 3 years of sets on 4 dates a week, the bib number equals the number of distinct set dates in the fixture (about 624), not the `activity-dates` length (at most 731).
  2. Every `fillText` y in the bib layout is between 250 and 1620 (stub-recorded).
  3. No `fillText` string matches `/Finished|\d+:\d\d/`. With no `workout-time` key and no Gym clock, no "min" tab is drawn.
  4. The bar's plate rectangles, read from the stub context, run heaviest to lightest from the collar outward, for 160 lb on a 45 lb bar (45, 10, 2.5).
  5. With a `MEDICAL_STYLES` program active, no share data is built.
  6. No `fillText` string contains a body-weight, calorie or sleep value.
  7. *(Alignment round)* No tab label matches /LOAD|VOLUME/; the first tab is SETS. On a barbell day, the bar's plate rectangles are drawn (count > 0).
- **Test plan:** new `test-bib-card.js` with the real `buildShareCardBlob`, `readExCorpus`, the progression-note function and a recording stub 2D context. Then Playwright PNGs on red, blue, yellow, green and white days, attached to the PR. Sabotage: count from `activity-dates`, and criterion 1 must fail; draw "Finished 58:12", and criterion 3 must fail.
- **Files:** `index.html` (`buildShareCardBlob` 29707 and `shareCelebrationCard` 29806, with MKT-03's `format` argument; `readExCorpus` 41226; UX-07's `platesPerSide`; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-bib-card.js` (new). Guards: `test-share-card-format.js` (MKT-03's; the square and story layouts stay as they are), `test-app-rename.js` (85–99: the card draws the name; the file name), `test-glyphs.js` (241–243, the icon stroke pin), and the six `readExCorpus` suites (BL-43's list). Card PNGs come from Playwright as MKT-03's did (TOOL-01's harness doesn't render canvas cards); `tools/design/directions/c-card.html` is the reference.
- **Risk:** visual, and the white bib on a white-plate day. Give the bib an ink hairline on white grounds; the design-engineer reviews the PNGs.
- **Tools:** `Skill: impeccable` (`polish`, Markdown fallback) on the rendered PNGs; TOOL-01's harness for the PNGs; `Skill: review-animations` isn't needed (static).
- **Alignment note (2026-11-07):** placed at roadmap slot 51, directly after MKT-04 and UX-09a (market-researcher, marketing-manager B3). There's no market evidence yet that lifters read a bib as lifting (market-researcher), so it's labelled a bet; marketing.md §5's E7 tests it.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: the "tile alone until MKT-03b" branch is moot (the owner kept the name, MKT-03b folded into MKT-03); MKT-17 comes after this item, so the counter is written here once and MKT-17 reuses it. Checked against the corrected `c-card.html` (sets · lifts · minutes tabs, "No. 47", no finish time, no load). Scope unchanged.
- **Status:** ready (after MKT-03, MKT-04 and UX-07)

### MKT-17: "Your number": a lifetime training-day number, with milestone bibs
- **Why:**
  - A PR fires rarely, and mostly for beginners. A streak can break. Viral apps own a recurring ritual (Duolingo's streak, Wrapped's December; `design-directions.md` §6.1).
  - A number that only goes up gives every lifter, at any strength, a true posting moment at 10, 25, 50, 100, 250, 500 and 1,000, and a sentence lifters can say ("I'm on No. 212").
  - It's honest by construction: it counts days with a logged set, and nothing else.
- **Change:**
  - A pure builder, `trainingDayNumber(corpus, dateKey)`, returns the count of distinct set dates up to and including `dateKey`, from `readExCorpus`. **MKT-16 adds it first; this item reuses it** (spec refresh 3). It's never stored as a free-standing counter, so deleting a session corrects it.
  - The finish screen (UX-09; until then, the session-complete banner) shows "No. 47".
  - On a milestone date, the bib card gets a stamp ("No. 100") and the banner offers share. Celebrated once per milestone, through `window.storage` key `number-last-celebrated` (namespaced, no schema bump).
  - "The wall of your bibs" (the year's first and last numbers and a grid of small bibs) goes to the **2027** Year in Lifting, not MKT-06b, which ships months before this item (alignment round).
  - No confetti (F9). No reminders, and nothing that mentions a gap.
  - *(Alignment round, exercise-auditor N2)* No "N days to your next number" countdown anywhere. No milestone prompt while readiness shows the no-rest-day warning (`READINESS_DAYS_NO_REST`). The What's New line says "it counts days on the log, not how hard you went".
- **Acceptance criteria:**
  1. With sets on 99 distinct dates, logging a set on a new date returns 100 and fires exactly one milestone celebration; a second set the same day fires none.
  2. Two sessions on one date count once.
  3. Deleting every set from one date lowers the number by one on the next render.
  4. Number 101 fires no celebration.
  5. With a `MEDICAL_STYLES` program active, the number shows in the app but no share data is built.
  6. With the readiness no-rest warning active on a milestone date, no milestone prompt or share offer appears. No rendered string matches /\bto (your )?next\b|\d+ (days|sessions) to\b/i.
- **Test plan:** new `test-training-day-number.js` with the real `readExCorpus` over stub storage and a fixed `getTodayKey`. Sabotage: read `activity-dates` with a 730-day prune, and criterion 1 must fail for a three-year fixture.
- **Files:** `index.html` (`trainingDayNumber` from MKT-16; `readExCorpus` 41226; the finish sheet from UX-09a, whose session-complete site is 29460; `READINESS_DAYS_NO_REST` 47133 and `computeReadiness` 47140 for criterion 6; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-training-day-number.js` (new). Guards: `test-bib-card.js`, `test-finish-sheet.js`, `test-today-priorities.js` (readiness).
  - *(Spec refresh 3)* "The finish screen (UX-09; until then, the banner)": UX-09a (slot 50) ships before this item (52), so the number goes on the finish sheet; the banner case no longer exists. The milestone "share" is the finish sheet's Share with the stamped bib.
- **Risk:** `readExCorpus` drops keys whose program day no longer exists (`parseExKey`, 40940), so a deleted custom program lowers the number. That's truthful ("days on the log"), but the What's New line should say the number counts what's on the log.
- **Tools:** default; TOOL-01's harness for the banner and the stamp.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped; the counter is MKT-16's (one builder); the target surface is UX-09a's sheet, which precedes this slot. Criteria unchanged; each is a real invocation over stub storage with a fixed `getTodayKey`. Scope unchanged.
- **Status:** ready (after MKT-16)

### MKT-18: Pin the bib on your own photo, made on the device
- **Why:** in strength training, the dominant story format is stats over your own gym photo: Strava's transparent Stats Sticker and Hevy's transparent shareables (`design-directions.md` §6.1). A tilted bib pinned onto a gym photo is the format a stranger can learn to name with the logo covered, and it's how people wear a real bib.
- **Change:**
  - On the bib card, a "Pin on a photo" button opens `<input type="file" accept="image/*">` (the phone's own picker).
  - The photo is drawn to a 1080×1920 canvas (cover-fit), then the bib at 70% scale, tilted, with four pins.
  - It shares through `shareCelebrationCard`.
  - The photo is never written to storage, never sent, and never analysed. The object URL is revoked after drawing.
  - It's only offered from a card the person has already opened. Never suggested, never in Priorities.
- **Acceptance criteria:**
  1. With a stub file, the canvas receives exactly one `drawImage` for the photo, then the bib draw calls.
  2. `fetch` is called 0 times, and `window.storage.set` is called 0 times during the flow (stub-counted).
  3. `URL.revokeObjectURL` is called once for the created URL.
  4. Cancelling the picker leaves the card unchanged and shares nothing.
- **Test plan:** new `test-bib-photo.js` with the real handler, a stub `File`/`Image` and a recording canvas. Sabotage: persist the photo to storage, and criterion 2 must fail.
- **Files:** `index.html` (`shareCelebrationCard` 29806, `buildShareCardBlob` 29707 with MKT-16's `'bib'` layout, the finish sheet's Share; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-bib-photo.js` (new). Guards: `test-bib-card.js`, `test-glyphs.js` (extracts `shareCelebrationCard`).
- **Risk:** body images. The photo is the person's own choice, made and shared on the device, the same stance as MKT-08. A transparent-PNG option (clipboard or share) is untested on iOS Safari, so the flattened composite is the default; test the other on a real iPhone before offering it.
- **Tools:** `security-review` (a file input), plus TOOL-01's harness for the composite.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Criteria 1–4 already use a stub `File`, `Image`, `URL` and a recording canvas, so they're real invocations of the handler. Criterion 2 also counts `localStorage.setItem` and IndexedDB `open` (0 each), since `window.storage` isn't the only way to persist. Scope unchanged.
- **Status:** ready (after MKT-16)

### MKT-19: The mark: a plate stripe in place of the ring
- **Why:**
  - Recall comes from a constant (Strava's orange, Oura's ring; `design-directions.md` §6.1). Plate & Press changes colour every day.
  - The current ring-with-one-segment mark (from `icon-512.png`) reads as a spinner or a target at 16 px, and it says nothing about lifting.
  - The five plate inks side by side, as a bar end seen edge-on, would be a mark no competitor has. It ties every coloured day back to one shape.
- **Change:** none until answered. If yes: a new icon set (an asset, so it needs the owner, as in summit R4), and the card mark drawn as canvas rectangles in MKT-03, MKT-16 and the sponsor strip. Decided with the name (D7, MKT-09).
- **Acceptance criteria:** the owner's answer is recorded in `planning/marketing.md` §2.4. The follow-up item writes its own criteria (canvas draw calls, the manifest icon sizes).
- **Test plan:** none until answered.
- **Files:** later `icon-*.png`, the manifest, `index.html` (the card mark).
- **Risk:** the colour code differs between kg and lb plates (the app already maps both). The mark uses the five ink colours only, not plate weights, so it stays true in either unit.
- **Tools:** none further (shipped).
- **Alignment note (2026-11-07):** the owner chose option B, **"Sash"** (`tools/design/icon/`), shipped in **v3.516** as the home-screen icon, the header mark and the launch. The mark doesn't depend on the name. The card mark folds into MKT-03, which draws it as five canvas rectangles in the target `--spot-*` inks. UX-01 adds a test that the mark's literal hexes equal those inks.
- **Status:** done (v3.516)

### MKT-20: Card and backup file names follow the app's name
- **Why:** at v3.516, saved cards were named `training-log.png` and backups `training-log-backup-<name>-<date>.json`: the old name, on files people keep (marketing-manager).
  - *Spec refresh 3:* **v3.517 already fixed the visible part.** Cards are `${APP_NAME.toLowerCase()}.png` (29811), the backup is `${APP_NAME.toLowerCase()}-backup-…json` (34425), the footer draws `APP_NAME` (29799), and `test-app-rename.js` 92–99 fails on any `training-log` in the two file-name lines. What's left is the consolidation (one `appSlug()` for every file name, so a name with a space can't produce `my app-backup-…`) and the broader literal sweep in criterion 4.
- **Change:**
  - Reuse MKT-03's `appSlug()` (consolidation: one place, so a future rename changes every file name at once). The backup file becomes `${appSlug()}-backup-<name>-<YYYY-MM-DD>.json`.
  - MKT-03 (slot 17, earlier) moves the card file to `${appSlug()}-<kind>-<date>.png` and adds `appSlug()` beside `APP_NAME` (7631). If MKT-03 hasn't merged when this is built, this item adds `appSlug()` and moves the card file (29811) to it too.
  - For the current name (Platestep) the file names people see don't change; only a future name with a space or capitals would.
  - The `training-log-v` cache names, the `trainingLog_` storage keys and the backup's JSON contents are unchanged.
- **Acceptance criteria:**
  1. The real backup handler (stubbed `URL.createObjectURL` and anchor click) sets `download` to a name starting with `appSlug() + '-backup-'` and ending `.json`. With `APP_NAME` replaced by `'My App'` in the extracted source, it starts `my-app-backup-` (proves the slug is used, not `toLowerCase()` alone).
  2. The real share path, with `File` stubbed, names the file starting with `appSlug() + '-'`, with the same `'My App'` check.
  3. Importing a backup file named the **old** way still works (the real import handler, with a fixture called `training-log-backup-me-2026-11-01.json`): import never reads the filename.
  4. `test-app-rename.js` is extended to fail on any non-comment string literal containing `Training Log`, `TRAINING LOG` or `training-log` in `index.html`, apart from an explicit allowlist, measured at v3.528: the `training-log-v` cache-name reads in Diagnostics (46521–46530), the What's New history, and the AI prompt's lower-case "training-log data" (42789). The prompt line stays as it is: it's inside the "fixed, unverified live" AI internals (CLAUDE.md), so it's allowlisted with a dated comment, not reworded.
- **Test plan:** extend `test-app-rename.js` (criterion 4), plus new `test-app-file-names.js` (criteria 1–3). Sabotage: restore the `training-log-backup-` literal, and criteria 1 and 4 must fail.
- **Files:** `index.html` (34425; 29811 and `appSlug` at 7631 only if MKT-03 hasn't merged; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-app-rename.js` (its 92–99 case moves from `APP_NAME.toLowerCase()` to the `appSlug()` form, unless MKT-03 already did it), `test-app-file-names.js` (new).
- **Risk:** low. For Platestep the names don't change, so the What's New line says what is true: "Behind the scenes: every saved file takes its name from one place; old backups still restore."
- **Spec refresh 3 (2026-11-09, against v3.528):** most of the original problem was fixed in v3.517 (see Why). The item stays as the `appSlug()` consolidation plus the wider literal guard; criteria 1–2 gained a "name with a space" check so they prove something, and criterion 4's allowlist is measured (it would otherwise fail on the AI prompt). Order kept; the PR body suggests the owner may drop it. Scope otherwise unchanged.
- **Status:** ready

---

## Design (UX): added by design-engineer, 2026-11-07

Written against **v3.514**. The vision, the world (*Plate & Press*) and the reasons are in `planning/design-vision.md`. Mock-ups: `tools/design/*.html` with `tools/design/world.css`. Renders at 402×874 (2×), dark and light: `tools/design/renders/`. Line numbers are `index.html` at v3.514. **Re-grep them before editing.**

**Rules every UX item keeps**, on top of the BL rules and default `Tools:`:
- Same data, same behaviour. No storage key, schema or routing key changes (`VIEW_RENDERERS` keys stay `today`, `log`, `analysis`, `history`). Element IDs that tests or code read keep their IDs, even when the element moves.
- Each screen switches whole in one version. Tokens land first as aliases, so no version leaves a screen half old, half new.
- Tap counts never rise. Logging the ready set stays one tap, asserted in a test.
- Accessibility is kept or improved: 4.5:1 text contrast (3:1 for 24 px and up) in light and dark, 44 pt targets, a VoiceOver name on every control, and Reduce Motion turning every animation into an instant state change.
- **Visual check per item (revised in the alignment round):**
  - Run TOOL-01's harness (`tools/visual/`): a seeded fixture, a frozen `Date`, the launch preset as played, fonts awaited, and a Reduce Motion pass, over its fixed state matrix (4 views × light/dark × 402/904, plus Gym mode, the rest state and the first-run sheet).
  - Chromium always, plus WebKit once D10 approves it (required from UX-03 on).
  - Compare with the item's mock-up render **and with the parent commit**.
  - One contact-sheet PNG goes in the PR (committed under `tools/visual/sheets/` if the owner approves decision 12; otherwise attached as a description).
  - Contrast: UX-01's WCAG test, plus axe-core once D10 approves it. `impeccable detect` runs only if the owner approves the downloaded engine (consensus decision 4).
- **Tap parity (alignment round, market-researcher):** "log the ready set" and "log a recent food" are counted in `test-tap-counts.js` (created by UX-06a, extended by UX-13). No UX item may raise either count. UX-17 waits until parity holds on the owner's phone.
- **Extra tools for every UX item:** `Skill: impeccable` (`polish`, and `audit` for contrast; Markdown fallback only in build runs until the owner approves the engine), `Skill: apple-hig` (targets, tab bar, sheets), and `Skill: review-animations` for anything that moves. Each item's `Tools:` line names what it adds.
- **Mock-ups:** re-rendered 2026-11-08 (PR #67, commit 24eb429; `design-vision.md` §5 lists every correction): `tools/design/{today,today-yellow,log-set,pr,progress,recap}.html` and `directions/{a-today,c-card}.html`, with renders in `tools/design/renders/` and `directions/renders/`. The cover CSS shared by `today.html` and `today-yellow.html` is in `world.css` (the "Today cover" block), and it is the reference for the five `design-directions.md` §5 rules: no state colour on a spot field; a yellow day's cover in the deep ink at night (`--cover` swaps to `--deep-yellow`, the numeral to the spot ink); 15 px meta text on the field (`--meta-on-spot`); a 16 px gap between Log and adjust (`.cover .log` grid gap); and the loaded bar full width with the heaviest plate against the inner collar. Where a render and an item still disagree, **the item wins**. *(Spec refresh 3: this bullet replaced the pre-render "known wrong" list.)*
- **WebKit (spec refresh 3):** D10 approved Playwright WebKit, but at v3.528 no WebKit binary is installed (`/opt/pw-browsers` holds Chromium only) and `tools/visual/harness.js` has no browser option. Until both exist, an item tagged "WebKit" runs the harness in Chromium and says in its PR that WebKit wasn't run; the owner's on-device look after UX-03 (roadmap, before slot 41) is the Safari check. See the owner question in the spec-refresh-3 PR.

Ready items are listed in build order, then needs-owner items.

### UX-01: Design tokens v2, introduced as aliases (no visual change)
- **Why:** every later UX item needs one vocabulary: ground, surfaces, rules, text, spot inks and their on-colours, deep inks, type scale, radii and motion. Introducing them as aliases of today's values first means the switch can happen screen by screen without a broken middle state.
- **Change:**
  - Add the token set from `tools/design/world.css` (`--ground`, `--surface-1/2`, `--rule`, `--rule-strong`, `--text-2/3`, `--spot-*`, `--on-*`, `--deep-*`, `--fs-*`, `--r-control`, `--r-sheet`, `--dur-*`, `--ease-out`/`--ease-in-out`/`--ease-drawer`) to the dark `:root` (`index.html` 59) **and** to the light block, which at v3.518 is the rule `body:not(.gym-mode)` inside `@media (prefers-color-scheme: light)` (309–313), not a `:root` rule.
  - In this version each new token **points at the existing value** (`--ground: var(--bg)` and so on). The new values are recorded in a comment beside each, for the later items.
  - **Why both blocks need every alias:** a custom property holding `var(--bg)` is resolved where it's declared and then inherited as a value. An alias declared only on `:root` would carry the dark `--bg` into light mode on `body`. Redeclaring each alias in the light rule makes it re-resolve there.
  - None of the new names exists in `index.html` at v3.518 (grepped), so nothing collides. `--text` already exists and is not redefined.
  - Nothing reads the new tokens yet.
- **Acceptance criteria:**
  1. Every new token is defined in both the dark `:root` rule and the light `body:not(.gym-mode)` rule. The test parses the real `<style>` with jsdom's CSSOM, the way `test-light-mode.js` finds both rules, not by string match.
  2. For every spot ink, the **target** values (from the comment) give `--on-*` against `--spot-*` ≥ 4.5:1, white against `--deep-*` ≥ 4.5:1, and `--text`, `--text-2` and `--text-3` against `--ground` ≥ 4.5:1 in both themes. Computed with a real WCAG luminance function in the test (`test-light-mode.js` has one to copy).
  3. TOOL-01's harness (`node tools/visual/harness.js --base <parent commit>`): every state in its matrix is pixel-identical to the **parent commit**. PR evidence, not a `check.sh` suite.
  4. *(Alignment round, design-engineer)* The Sash mark's literal hexes equal the five target `--spot-*` values recorded in the comments: the header mark (`#brandHome` svg, 5724) and the five launch layers (`.launch-b25` … `.launch-b5`, 5673–5677), parsed from the real markup with jsdom, plus `tools/design/icon/option-b.svg`.
  5. `test-light-mode.js`'s rule that every light token also exists in the dark `:root` still passes (it will, if criterion 1 does).
- **Test plan:** new `test-design-tokens-v2.js`. Sabotage: delete one token from the light rule, and criterion 1 must fail; set `--spot-red`'s target to `#E0352B` (4.4:1), and criterion 2 must fail.
- **Files:** `index.html` (59 onward, 309–313 onward), `sw.js`, `test-design-tokens-v2.js` (new). PR artefact: the harness contact sheet (D14).
- **Risk:** low. Guarded by `test-css-mechanical-token-dedup.js` and `test-light-mode.js` (one light rule; every light token exists in the dark root).
- **Summit note (summit 2026-11-07):** Moved to the front of Phase 1 (now roadmap slot 11). It changes nothing visible, and every later piece of BL/BIZ/MKT markup is then written once in the new vocabulary (summit R1). Pixel-identity criterion 3 is harness PR evidence, not a `check.sh` suite.
- **Tools:** TOOL-01's harness.
- **Spec refresh (2026-11-08):** the light block is a `body:not(.gym-mode)` rule (since v3.480), and the alias-inheritance trap is spelled out; mark lines re-grepped at v3.518; TOOL-01 is merged (`tools/visual/`), so the "after TOOL-01" condition is met. Scope unchanged.
- **Spec refresh 2 (2026-11-09, against v3.527):** the mark lines moved (5724, 5673–5677); `:root` (59), the light rule (309–313) and the `--font-sans` line (68) haven't moved. Guards re-checked: `test-light-mode.js`, `test-css-mechanical-token-dedup.js`, `test-app-icon.js` (reads the same mark hexes). Scope unchanged.
- **Status:** ready

### UX-01b: `dayInk(id)`: one day-to-ink rule, with no visible change
- **Why:**
  - `getDayPlateClass` (`index.html` 26264) ignores each day's `plate` field and colours days by **position** from seven hues (`VIVID_PLATE_CLASSES`, 26263: red, blue, yellow, green, purple, orange, teal). For example, Strength & Size Day 5 "Lower · Hypertrophy" is purple today, while its data says `p-green`.
  - Plate & Press, the icon, the bib and the plate stack all mean the five plate inks.
  - MKT-03 (slot 17), MKT-06a and MKT-16 print "the day's ink" long before UX-05 (slot 42), and no test covers the current rule (design-engineer B1).
- **Change:**
  - Add one pure helper beside `getDayPlateClass`, `dayInk(dayOrId, program)`. It returns one of `'red' | 'blue' | 'yellow' | 'green' | 'white' | 'off'`:
    - from the day's own `plate` field (`p-red` → `red`, …, `p-white` → `white`, `p-off` → `off`);
    - rest days → `off`;
    - a missing or unknown plate (custom programs) → the ink at `index % 4` over red, blue, yellow, green, so inks **repeat** in programs of 5+ days rather than turning grey.
  - At v3.518 every one of the 1,904 built-in day entries (programs, styles and day-count variants) has a `plate`, using only `p-red`, `p-blue`, `p-yellow`, `p-green`, `p-white` and `p-off` (walked with the real tables). The fallback is for custom programs only.
  - Nothing calls it yet apart from its test. `getDayPlateClass` and `--day-hue` are unchanged in this version.
  - The rule is the owner's: decision D13 (2026-11-07) chose the plate code.
- **Acceptance criteria:**
  1. For every day of every built-in program, its `PROGRAM_DAY_COUNT_VARIANTS` days (16241) and every `*_STYLES` style, the real `dayInk` returns one of the six values and equals the mapping of the day's `plate` field. The test asserts it visited ≥ 1,900 days.
  2. Strength & Size Day 5 returns `green`, while the real `getDayPlateClass` (it reads the globals `dayDefs` and `dayOrder`; set them to `programs.strength.days` and its keys) returns `p-purple` for it; the test records both, so the difference is documented.
  3. A rest day returns `off`. A custom program day with no `plate` returns an ink by its index, and never throws.
  4. No rendered DOM changes: the real `getDayPlateClass` outputs for all strength days are identical before and after (snapshot), and `getDayPlateClass`'s source is byte-identical to the parent commit.
- **Test plan:** new `test-day-ink.js` (UX-05 extends it later). Sabotage: return `'red'` for everything, and criterion 1 must fail on Day 2.
- **Files:** `index.html` (a new helper beside 26263–26271), `sw.js`, `test-day-ink.js` (new). `test-a11y-keyboard-focus.js` and `test-header-refresh.js` extract `getDayPlateClass` and are unaffected.
- **Risk:** none visible. The What's New line says so honestly.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; the plate inventory measured; D13 recorded. Scope unchanged.
- **Spec refresh 2 (2026-11-09, against v3.527):** lines re-grepped. `getDayPlateClass` callers at v3.527: 26353 (day tabs), 28718, 28722, 28727 (`renderWorkout`); none changes here. The 1,904-day count was measured at v3.518; v3.519–v3.527 added no days, but the test asserts ≥ 1,900 rather than the exact figure. Scope unchanged.
- **Status:** ready

### UX-02: Ship the Archivo display face beside index.html
- **Why:** the cover numeral, the screen headlines and the share cards (MKT-03) are drawn in Archivo, condensed through its width axis. Its width axis is also the "press" move when a set is logged. Geist at 800 is the fallback and works, but it's wider, so the cover numeral would have to shrink to about 120 px.
- **Change:**
  - Copy `tools/design/fonts/archivo-latin-wdth-wght.woff2` (90 KB, OFL; licence `tools/design/fonts/OFL-Archivo.txt`) to `fonts/archivo-latin-wdth-wght-v1.woff2`, with the licence beside it as `fonts/OFL-Archivo.txt` (as `fonts/OFL-Geist.txt` is).
  - Add one `@font-face` for `'Archivo'` (variable `font-weight` and `font-stretch` ranges, `font-display: swap`) beside the two Geist ones (`index.html` 29–38; the Geist preload link is at 27), and `--font-display: 'Archivo', 'Geist', ...` beside `--font-sans`.
  - **Caching follows the Geist precedent, not a cache of its own** *(spec refresh, 2026-11-08)*: add the URL to `sw.js` `PRECACHE_OPTIONAL` (222–233), where the Geist files are. CLAUDE.md (updated 2026-11-08) lists the self-hosted fonts as files that ship and are "precached as optional entries"; its "cache of their own" rule is for media assets. The old spec's separate cache would also fail the existing `test-self-hosted-fonts.js` case "every @font-face file is in PRECACHE_OPTIONAL" (line 126).
  - **No `<link rel="preload">`** for it: `test-self-hosted-fonts.js` (line 120) pins exactly one font preload (Geist), and nothing visible uses the face until UX-03 and MKT-03.
- **Acceptance criteria:**
  1. The real CSSOM has exactly one `@font-face` with family `Archivo`; its `src` is under `./fonts/`, resolves to a file on disk whose first four bytes are `wOF2`; its weight range covers 800 and its stretch range covers 68%–100%.
  2. `sw.js`'s `PRECACHE_OPTIONAL` contains the URL and `PRECACHE_ESSENTIAL` doesn't (the existing test's rule, extended to every face).
  3. The real `sw.js` install handler (run with a stubbed `caches` and `fetch`) requests the Archivo URL.
  4. `--font-display` resolves on `:root` and names `'Archivo'` first.
  5. PR evidence, not a suite: offline in Playwright, after one online load with the network blocked, `document.fonts.check('800 64px Archivo')` is true.
- **Test plan:** extend `test-self-hosted-fonts.js` (it already parses the real CSSOM and `PRECACHE_OPTIONAL`; it replaces the old plan's new `test-display-font.js`). Sabotage: misspell the file name, and criterion 1 must fail.
- **Files:** `fonts/archivo-latin-wdth-wght-v1.woff2` and `fonts/OFL-Archivo.txt` (new), `index.html` (29–38; `--font-sans` at 68), `sw.js` (`PRECACHE_OPTIONAL` and version), `test-self-hosted-fonts.js`.
- **Risk:** first load is 90 KB heavier, once. `font-display: swap` keeps the text visible. The existing font guards (`test-self-hosted-fonts.js`, `test-icon-manifest-paths.js`, which also parses `PRECACHE_OPTIONAL`) must stay green.
- **Tools:** default; TOOL-01's harness (fonts awaited).
- **Alignment note (2026-11-07):** sequenced at roadmap slot 16, **before MKT-03**, so the Year in Lifting cards and the app share one typeface from the start (design-engineer).
- **Spec refresh (2026-11-08):** approved by the owner (D2, 2026-11-07: "Archivo before cards"), and CLAUDE.md's "no new runtime files without the owner's OK" is satisfied by that answer. Caching and test file changed to match the Geist precedent and the existing font test; no change to what ships or what the owner sees.
- **Spec refresh 2 (2026-11-09, against v3.527):** nothing moved: the preload (27), the `@font-face` rules (29–38), `--font-sans` (68) and `sw.js` `PRECACHE_OPTIONAL` (222–233) are where this item says, and `tools/design/fonts/archivo-latin-wdth-wght.woff2` (90,104 bytes) and `OFL-Archivo.txt` exist. `test-self-hosted-fonts.js` lines 73, 120 and 126 are as cited.
- **Status:** ready

### UX-03: Flat ground everywhere: retire the halos, glass and gradient buttons
- **Why:** the most "generated" parts of today's look are the blurred plate halos behind the header, the glass card fills with `backdrop-filter` (37 uses) and the gradient call-to-action buttons (`--cta-gradient-*`, 18 uses; the violet "Generate insights" and "Log set" buttons). Removing them app-wide in one version makes every screen coherent before any screen is rebuilt.
- **Change:**
  - Switch the UX-01 aliases for ground, surfaces, rules and text to their target values.
  - Cards become `--surface-1` with a 1 px `--rule` and no blur. Gradient buttons become flat: the primary is ink (`--text` on `--ground`), and the day-coloured one is `--spot` on `--on-spot`.
  - Gym mode's hand-tuned `.exercise-block.open` literal shadow stays untouched (CLAUDE.md). **Gym mode is out of scope** until UX-17.
  - *(Alignment round, design-engineer B2)* Also in scope:
    - the 14 `radial-gradient` occurrences, including `--aura` (dark 78, light 316; painted on `body::before` at 388);
    - the launch's aura (dark: `.launch{background:var(--aura), var(--bg)}`, 5305) and its literal halos on `#F3F0EA` (light): the launch ground becomes `--ground`;
    - the violet gradient on "Create my profile" (`#newUserCreateBtn`, 5711, a `.save-btn`);
    - `manifest.json` `background_color` (`#121417`) and `theme_color` (`#14171A`, not `#121417` as first written), and the `theme-color` metas (`index.html:18–19`, `#050507` / `#F2F2F5`), which must all match the target `--ground` (`#0C0C0D` dark; the manifest has one colour, so it takes the dark ground, as today).
  - Counts at v3.528 (re-measured): `backdrop-filter` 37 lines, `--cta-gradient-*` 18, `radial-gradient` 14.
- **Acceptance criteria:**
  1. In jsdom on the real markup, no element's inline or stylesheet `background` uses `--cta-gradient-*`. Count real rules in the CSSOM.
  2. `backdrop-filter` remains only on the sheet scrim and the tab bar's under-layer, if any: the CSSOM count is 2 or fewer, and the test names the rules allowed.
  3. The UX-01 contrast test passes against the live values now.
  4. ~~`impeccable detect`~~ *(replaced in the alignment round)*: the harness's contrast pass (axe-core once D10 approves it; until then UX-01's WCAG function over the computed colours of every text node in the matrix) reports no new contrast failure compared with the parent commit.
  5. No CSSOM rule outside Gym mode's allowlisted selectors has a `background` or `background-image` containing `radial-gradient` (real CSSOM count, comments excluded).
  6. The launch overlay's computed background equals `--ground` in both themes, and the "Create my profile" button has no gradient.
  7. `manifest.json`'s `theme_color` and `background_color`, and both `theme-color` metas, equal the target `--ground` of their theme.
- **Test plan:** extend `test-design-tokens-v2.js`. Sabotage: restore one gradient button rule, and criterion 1 must fail; restore one halo, and criterion 5 must fail.
- **Files:** `index.html` (CSS from `:root` 59 to the end of `<style>`, the launch rules 5305 onward, the `theme-color` metas 18–19, `APP_VERSION` 7625, `WHATS_NEW` 7643), `manifest.json`, `sw.js`, `test-design-tokens-v2.js`. (`automation.md` §4 step 11 must stage `manifest.json`: consensus F12.)
  - **Re-pins, found at v3.528** (each suite pins today's glass, gradient, aura or chrome colour, which this item retires on purpose; change each with a dated note "UX-03, flat ground", and name every one in the PR):
    - `test-light-mode.js:55–58` (the two `theme-color` values);
    - `test-glass-cards.js` (48–90: `.card` is a glass panel, the glass tokens and `--aura` exist, the aura layer);
    - `test-glass-controls.js` (50–72: the `.save-btn` gradient pill and its stop contrast);
    - `test-launch.js:92–93` (`.launch` paints `var(--aura), var(--bg)`);
    - `test-rgba-blue-yellow-consolidation.js:151–160` (`--aura` built from plate tokens);
    - `test-cta-blue-unification.js` (45–81: four sites reference `--cta-gradient-blue`);
    - `test-css-mechanical-token-dedup.js:180–190` (`.vol-bar-fill` uses `--cta-gradient-blue`);
    - `test-app-2-0.js:126–170` (`.weight-input-row button` and `.fi-plus` use `--cta-gradient-blue`);
    - `test-analysis-index-visual-weight.js:77–80, 112–115` (the jump rail and status strip keep their blur; criterion 2 allows blur only on the sheet scrim and the tab bar);
    - and, by grep, the other suites naming glass, gradient or glow tokens, which may or may not fail: `test-fields-translucent.js`, `test-gym-mode-audit-fixes.js`, `test-learn-rework.js`, `test-neutral-rgba-consolidation.js`, `test-rgba-background-border-consolidation.js`, `test-session-actions.js`, `test-today-fab-glow-color.js`, `test-today-hero-glow-flat-buttons.js`, `test-nav-pill-visual-weight.js`. Gym-mode rules they pin stay (Gym mode is out of scope).
  - **Not re-pinned here:** `test-tab-bar.js:37–43` (the bar may keep its blur under criterion 2; UX-04 owns the bar).
- **Tools:** TOOL-01's harness with **WebKit** (D10); `Skill: impeccable` (`audit`, Markdown fallback). After it merges, **the owner looks on his phone before the next UX item builds on it.**
- **Risk:** visual, everywhere at once. That's why it's one version on its own and easy to revert. Guarded by `test-css-mechanical-token-dedup.js` and the `--rim` notes in CLAUDE.md. About ten suites need deliberate re-pins (listed above); a re-pin that isn't on that list is a sign something outside scope moved.
- **Spec refresh 3 (2026-11-09, against v3.528):** counts re-measured; the manifest's `theme_color` is `#14171A`; the launch, aura and button lines located. The re-pin list was found by grepping all 204 suites for the retired tokens. Checked against `design-vision.md` §3.2 and §3.5a and `world.css`: target grounds `#0C0C0D` / `#F3F3F1`. WebKit: see the UX rules above. Scope unchanged.
- **Status:** ready

### UX-04: The tab bar: opaque, labelled, Today · Food · Progress · History · More
- **Why:**
  - The floating glass pill bar (5760–5774) has no icons, and on light it's a white pill on glass.
  - "Log" and "Analysis" don't say what's in them. Log is the food diary; Analysis answers "am I progressing?".
  - Apple HIG: a bottom tab bar with an icon and a label per destination, opaque, with the selected tab marked by colour and a filled icon.
- **Change:**
  - Same five buttons, same IDs (`navToday`, `navLog`, `navAnalysis`, `navHistory`, `navMore`) and the same `showView` wiring. Each gets an authored 24 px outline icon (from the mock-ups) and a label. The labels become Today, Food, Progress, History, More.
  - The bar is `--surface-1` with a 1 px top rule, 84 px tall including the home-indicator area. Selected: ink label and filled icon, `aria-current="page"`.
  - **The names follow everywhere they're shown** (spec refresh 3; otherwise the header says "Analysis" under a tab that says "Progress"): `switchView`'s header titles (39531: `log:'Food'`, `analysis:'Progress'`), `SEARCH_TAB_LABELS` (48158; the search hit's tab tag), the Today hint "…Program Fit on Analysis." and the tip "Use the Analysis tab's trend…" (33399). Found by sweeping non-comment strings outside What's New at v3.528. What's New history keeps the old names (it's history).
  - Gym mode still hides the bar (`test-tab-bar.js:72`).
- **Acceptance criteria:**
  1. `test-tab-bar.js`'s ID order assertion (52) is unchanged and passes.
  2. Each button's accessible name (`textContent` trimmed) is exactly one of the five new labels, and each has `aria-current="page"` only while its view is active. Drive the real `switchView` (39525; `showView`, 40512, calls it) for all five.
  3. The real `switchView` sets `#viewTitle` to Today, Food, Progress, History for those four views.
  4. No non-comment string outside `WHATS_NEW` names "the Log tab", "the Analysis tab" or "on Analysis" (real-source sweep, printed on failure).
  5. Every tab button's CSSOM `min-height` is ≥ 44 px; TOOL-01's harness confirms the rendered height at 402×874.
- **Test plan:** extend `test-tab-bar.js`, with a dated note that the labels changed on purpose: Log to Food, Analysis to Progress. Sabotage: leave `aria-current` on the previous tab, and criterion 2 must fail.
- **Files:** `index.html` (5760–5774 and the nav CSS; `switchView` 39525–39535; `SEARCH_TAB_LABELS` 48158; the hint and tip strings; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-tab-bar.js`. **Re-pins:** `test-tab-bar.js:37–43` (the bar stops being a floating glass pill; with a dated note), `test-header-refresh.js:98` (expects titles `'Log','Analysis'`), `test-nav-pill-visual-weight.js` (pins `.nav-pill` padding, shadow and the white active pill, all of which this item restyles). Read and keep green: `test-nav-more-panel.js`, `test-view-switch-crossfade.js`, `test-search-2-0.js` (its tab label comes from its own fixture), `test-open-screen-2-0.js:62` (the bar spans the left pane when unfolded).
- **Risk:** muscle memory for the two renamed labels. The positions don't change. Guarded by `test-gym-offer-tab-leak.js` and `test-coach-tab-order.js`.
- **Tools:** `Skill: apple-hig` (tab bar); TOOL-01's harness.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: the header title and the search tag still said "Log" and "Analysis", plus two in-app strings; they're now in scope (criteria 3–4). Three suites need re-pinning. Checked against `world.css` (`.tabbar`, `.tab`: 11 px labels, 48 px rows). Scope unchanged.
- **Status:** ready

### UX-05: The day sets the ink
- **Why:** each program day already carries a plate (`plate:'p-red'`, 9716 onward), and `renderWorkout` already publishes `--day-hue` on `#workoutCard` (28725). The new world needs three values per day: `--spot`, `--on-spot` and `--spot-deep`. It also needs them on `<body>`, because the cover, the rest field, the finish screen and the charts all use them.
- **Change (rewritten in the alignment round against `dayInk`, design-engineer B1; made testable and narrowed in spec refresh 3):**
  - **A class, not inline properties,** as `world.css` does: `body.day-<ink>` with rules `.day-red{--spot:var(--spot-red); --on-spot:var(--on-red); --spot-deep:var(--deep-red)}` and so on. UX-06a's night rule for a yellow day (`body.day-yellow` inside the dark theme, `world.css` "Today cover" block) needs a selector to hang on; an inline `style` can't carry it.
  - **White and off days:** `world.css` has no `--deep-white` or `--deep-off`. Default: `.day-white{--spot:var(--spot-white); --on-spot:var(--on-white); --spot-deep:var(--rule-strong)}` and `.day-off{--spot:var(--spot-off); --on-spot:var(--on-off); --spot-deep:var(--surface-2)}`. The design-engineer confirms or changes these two values in the PR (they only show in UX-08's rest drain).
  - One small helper, `applyDayInk(dayId, program)`, sets the class from **`dayInk(dayId, program)`** (UX-01b), removing any other `day-*` class. `renderWorkout` calls it once, beside the `--day-hue` line (28725). `renderWorkout` can't be driven in jsdom, so the helper is what the test drives.
  - **The day discs follow the ink; the accent tokens don't.** The day picker's `.p-red` … `.p-white` rules (615–622) read `--spot-*` instead of `--plate-*`, and `--day-hue` (28725) is published as `var(--spot-<ink>)`, so the cover's red and the disc's red are one red. The `--plate-*` tokens themselves (dark 104–111, light 346–352) are **not** re-pointed: they're the app's general accent colours, used about 190 times (`var(--plate-red)` 36, `-yellow` 37, `-blue` 68, `-green` 46 at v3.528: macro bars, badges, care tags, state text), and the light theme darkens them for text contrast (`--plate-yellow:#8F6200`), which `--spot-yellow` (`#F2C200`) can't replace as text on chalk. Retiring unused `--plate-*` is UX-15's sweep.
  - `getDayPlateClass` (26267) becomes a thin wrapper over `dayInk` (consolidation), so there's one rule. `VIVID_PLATE_CLASSES` (26266) goes, and with it the purple, orange and teal day discs.
- **Acceptance criteria:**
  1. For every day of every built-in program, its day-count variants and every `*_STYLES` style, the real `applyDayInk(id, program)` leaves `document.body` with exactly one `day-*` class, `day-<dayInk(id, program)>`.
  2. CSSOM: each of the six `.day-*` rules declares `--spot`, `--on-spot` and `--spot-deep`, and the four colour inks' values name `--spot-<ink>`, `--on-<ink>` and `--deep-<ink>`.
  3. `getDayPlateClass(id)` equals `'p-' + dayInk(id, activeProgram)` for every day (one rule; set the globals `dayDefs` and `dayOrder` as `test-day-ink.js` does).
  4. CSSOM: `.p-red` … `.p-white` backgrounds read `var(--spot-…)`; every `--plate-*` token keeps its v3.528 value in both themes (snapshot), so no accent moves.
  5. Real-call count: the extracted `renderWorkout` (comments stripped) calls `applyDayInk(` exactly once, and its `--day-hue` line reads the ink, not `getDayPlateClass(…).slice(2)`.
- **Test plan:** extend `test-day-ink.js` (from UX-01b). Sabotage: set the class from the day's position instead of `dayInk`, and criterion 1 must fail on Strength & Size Day 5.
- **Files:** `index.html` (`.p-*` rules 615–623, new `.day-*` rules beside them, `VIVID_PLATE_CLASSES`/`getDayPlateClass` 26266–26274, the `--day-hue` line 28725, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-day-ink.js`. **Re-pins:** `test-header-refresh.js` and `test-a11y-keyboard-focus.js` both extract `getDayPlateClass`; any assertion of a `p-purple`, `p-orange` or `p-teal` class, or of position-based colours, changes with a dated note. `test-day-ink.js`'s UX-01b criterion 4 ("`getDayPlateClass`'s source is byte-identical to the parent commit") is retired by this item on purpose.
- **Risk:** the day-picker discs change colour on days 5–7, which now repeat inks. It's visible, and that's intended (consensus decision 9). No accent colour elsewhere changes (criterion 4).
- **Tools:** TOOL-01's harness.
- **Owner or design option (non-blocking; default above):** the item as first written re-pointed every `--plate-*` token to the spot inks. That would recolour about 190 accent uses at once and break light-mode text contrast for yellow. The default keeps the accents and moves only the day discs and `--day-hue`; the alternative is a separate item after UX-15 that maps each accent use to a state or ink token.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: (1) `renderWorkout` can't be driven in jsdom, so the publish goes through a one-call helper; (2) a body class, as in `world.css`, so UX-06a's night rule has a selector; (3) white and off days have no deep ink, so defaults are named; (4) re-pointing `--plate-*` would recolour the whole app's accents and fail light contrast, so the default narrows it to the discs and `--day-hue` (see the option). Checked against `design-vision.md` §3.2 and `world.css`. 
- **Status:** ready

### UX-06: Today's cover: the next set, huge, in the day's ink
- **Why:** on a training day the next set is the sixth block down today (see `renders/today-dark.png` against the incumbent). The mission's first job, "what do I lift now", should be answered in the first glance from a metre away.
- **Change:**
  - The Up next card (`#upNext`, 5875–5897) becomes the cover. It's a full-bleed field at the top of Today, painted `var(--cover)` (which is `--spot`, except a yellow day at night: see (v)), holding:
    - the program, week and phase line;
    - the day headline;
    - the lift name and "Set n of N";
    - the prescription with its RIR words;
    - the load as the cover numeral (150 px, display face) and "× reps";
    - one Log button;
    - the set chips for that exercise.
  - The data comes from `renderUpNext` (30742) and `findNextSetRow` (30722), unchanged. The Log button keeps the ID `upNextLog` and its existing handler (`logUpNext`, 30808, wired at 31382; it logs through `commitSet` 31177). The weight, reps and RPE fields (`#upNextFields`, 5890–5895) move behind the adjust button, which opens them in place (`expand-wrap`), keeping their IDs.
  - *(Spec refresh 3)* The cover's chips are drawn for the cover; they must not be `.set-row`s or live inside `#exerciseList`, so `findNextSetRow` still reads only the real rows. If they reuse `.set-chip` with the same `data-ex-idx`/`data-set-idx`, `closeSetSheet`'s twin lookup (`document.querySelector`, ~31283) will find the cover's chip first, since the cover comes first in the document. That's acceptable (focus returns to the chip the person sees first); the test asserts which one gets focus.
  - The day picker of seven discs collapses into the cover's day headline. Tapping it opens the existing day picker as a sheet; day selection logic is unchanged.
  - Rest days get a white or off-grey field with the day's note.
- **Acceptance criteria:**
  1. **One tap:** on seeded data, one `click()` on `#upNextLog` calls `commitSet` exactly once, with the same values the ready chip would log (stub-count `commitSet`; compare against `chip._values`). The fixture follows `test-up-next.js`, which already drives the real `renderUpNext` and `logUpNext`.
  2. The cover's numeral text equals the ready set's weight and its "×" figure the reps, for 3 seeded exercises including a dumbbell and a bodyweight one (bodyweight shows reps only).
  3. `#upNextWeight`, `#upNextReps` and `#upNextRpe` still exist and still feed the logged values when edited.
  4. *(Corrected so it doesn't contradict (v))* CSSOM: the cover's background is `var(--cover)`, its text colour `var(--on-cover)`, and the rules that set `--cover` resolve to `--spot` and `--on-spot` for every ink except `body.day-yellow` in the dark theme.
  5. TOOL-01's harness (PR evidence): at 402×874 the Log button's top edge is above y = 480, and the numeral is at least 120 px tall.
- **Test plan:** new `test-today-cover.js` and new `test-tap-counts.js` (criterion (viii)), plus `test-set-chips.js` unchanged and passing. Sabotage: make the button log the first chip instead of the ready chip, and criterion 1 must fail.
- **Files:** `index.html` (markup 5870–5897, `renderUpNext` 30742–30806, `logUpNext` 30808, the up-next CSS 726–773, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-today-cover.js` (new), `test-tap-counts.js` (new). **Suites that drive `renderUpNext` or the up-next markup, to read before editing and re-pin only with a dated note:** `test-up-next.js`, `test-set-chips.js`, `test-next-set-recommendation.js`, `test-open-screen-2-0.js`, `test-exercise-logger.js` (shares `.up-next-field` markup through `fillSetLogger`), `test-light-mode.js:110` (the Up next wells read their fill from tokens).
- **Risk:** Today's layout is the most-used screen. Guarded by `test-set-chips.js`, `test-today-priorities.js`, `test-gym-set-chips.js` and `test-superset-chips.js`.
- **Summit note (summit 2026-11-07):** Ship as **two versions**. **06a:** the cover, numeral, Log button, chips, and fields behind "adjust". **06b:** the day picker collapsing into the headline sheet. 06a adds three criteria: (i) a first-ever exercise shows BIZ-05's hint and the target reps, not an empty numeral; (ii) with a resting region that flags the cover lift (e.g. Shoulder → Bench Press, `CATEGORY_TO_REGIONS` 43895), the cover shows the existing caution and substitute; (iii) effort words come from BL-10 (summit R7). No numeric readiness score (summit F2). Keep `#headerEyebrow` (BIZ-02).
- **Alignment note (2026-11-07):** `design-directions.md` §5's additions, copied in as 06a criteria:
  - (iv) **no state colour sits on a spot field**: no rule matching the cover or any descendant sets `color`, `background`, `border-color` or `fill` to `--positive`, `--negative`, `--warning` (or today's `--plate-green`/`--plate-red`/`--plate-yellow` used as state, e.g. `.vol-landmark-*`, the caution box). CSSOM walk over the real markup. The resting-region caution of (ii) shows as an icon and a word in `--on-cover`, as `world.css` notes ("state is an icon and a word");
  - (v) **in dark mode, a yellow day's cover uses the deep ink**: the dark-theme rule for `body.day-yellow` sets `--cover:var(--deep-yellow)`, `--on-cover:#fff` and `--cover-figure:var(--spot-yellow)`, as `world.css` does. White on `--deep-yellow` (`#6B5600`) is ≥ 4.5:1 and the yellow numeral on it ≥ 3:1 (large text), computed with UX-01's WCAG function. In light mode the yellow cover is the plain spot field;
  - (vi) **meta text on spot fields is at least 15 px**: every cover rule except the numeral and the day headline has `font-size` ≥ 15 px (CSSOM; `world.css` uses `--meta-on-spot:15px`);
  - (vii) **a 16 px or larger gap between Log and adjust**: CSSOM `gap` (or margin) between them ≥ 16 px, and the harness confirms it with `getBoundingClientRect`;
  - (viii) **tap parity**: create `test-tap-counts.js`, counting the real clicks to log the ready set from a fresh Today. The count is ≤ the parent commit's count (1 today).
  - The cover's effort line shows BL-10's `words` form, not the `short` label. The first-ever case (i) shows BIZ-05's `firstSetHint` (the same helper, not a copy).
- **Tools:** TOOL-01's harness (WebKit when installed; see the UX rules); `Skill: apple-hig`; `Skill: review-animations` for the "adjust" expand.
- **06b (day picker into the headline sheet):** the day rail is `#tabs`, built by `renderTabs` (26312), with keyboard focus restore and reorder mode. 06b moves that rail into a sheet opened from the cover's day headline; `renderTabs`, its focus restore and reorder mode are unchanged and render into the sheet. Criteria: (1) one click on the headline opens the sheet (`role="dialog"`, labelled) holding the real `renderTabs` output; (2) choosing a day there runs the existing day-switch path and closes the sheet; (3) `test-a11y-keyboard-focus.js` (it extracts `renderTabs`) passes unchanged; (4) Escape and the scrim close it and focus returns to the headline. New `test-day-sheet.js`. Re-read `test-superset-field-chaining.js`, which also extracts `renderTabs`.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped against v3.528 (`renderUpNext` 30742, `logUpNext` 30808, markup 5875–5897). Checked against `world.css` and `today.html`/`today-yellow.html`: criterion 4 contradicted (v) (a yellow night cover isn't `--spot`), so it now reads `--cover`; (iv), (vi) and (vii) are CSSOM checks with the harness as evidence; the cover chips can't be real rows. 06b got its own criteria (it had none). The full-width bar is UX-07's criterion 6. Scope unchanged.
- **Status:** ready (after BL-08, BL-10 and BIZ-05)

### UX-07: The plate stack beside the load
- **Why:** the signature move. A lifter reads the bar's load as plates before reading the number, then loads the bar without doing sums. The old plate calculator is gone (only its comment remains at 31949; flagged, not fixed).
- **Change:**
  - New pure `platesPerSide(weight, eq)`: a greedy fill from `eq.plates` (`getEquipment`, 32919; `BARBELL_STANDARDS` 32896) after subtracting `eq.bar`. Weights are in the display unit, as `getEquipment` returns them. It returns `{plates:[...], remainder}`.
  - Drawn in the cover for `isBarbellExercise` lifts only (31966): an SVG of plates scaled by size and coloured by the plate code (45 lb blue, 35 yellow, 25 green, 10 white, 55 red; change plates steel; kg sets by their own colours: 25 red, 20 blue, 15 yellow, 10 green, 5 white). `aria-hidden`, with a text caption "45 · 10 · 2.5 each side" that VoiceOver reads. `today.html` (the `.bar` SVG, 362 px wide, viewBox `0 0 362 80`) is the drawing to match.
  - **Names to avoid** (spec refresh 3): don't call the function `calcPlatesPerSide` and don't use the classes `.plate-btn` or `.plate-result`: `test-plate-voice-removed.js:52–58` asserts those are gone for good. Don't reuse `.plate` for the rects either: it's the day disc's class (`renderTabs`, 26356), and its CSS would apply. Use `.bar-plate`, as the mock-up's `data-lb` rects suggest.
- **Acceptance criteria:**
  1. `platesPerSide(160, lbEq)` → `[45, 10, 2.5]`, remainder 0. `platesPerSide(45, lbEq)` → `[]`. `platesPerSide(142, lbEq)` → `[45, 2.5]` with remainder 1.5 (unloadable; the caption says "about").
  2. With a custom equipment profile without 2.5 lb plates, 160 → `[45, 10]` with remainder 2.5.
  3. No plate stack renders for a dumbbell, cable or bodyweight lift (Lat Pulldown, DB Curl).
  4. The caption text equals the plates joined with " · ", followed by " each side".
  5. *(Alignment round, `design-directions.md` §5)* In the rendered SVG (the real builder's output parsed with jsdom), plates run **heaviest against the inner collar**, lightest outward: for 160 lb, the left side's `.bar-plate` rects ordered by descending `x` read 45, 10, 2.5 (`data-lb`), and the right side's ascending `x` read the same.
  6. On the cover, the bar is drawn full width: CSSOM gives the bar element `width:100%` of the cover's content box, and the harness confirms the rendered width equals the content width (±1 px; 362 of 362 at 402×874 in the mock-up).
  7. kg: with `weightUnit = 'kg'` and the kg standard, `platesPerSide(100, kgEq)` → `[25, 15]` (bar 20), and the 25 is drawn in the red ink.
- **Test plan:** new `test-plate-stack.js`, with the real `platesPerSide`, `getEquipment`, `BARBELL_STANDARDS` and `isBarbellExercise`. Sabotage: drop the bar subtraction, and criterion 1 must fail; sort plates ascending, and criterion 5 must fail.
- **Files:** `index.html` (new function beside `isBarbellExercise` 31966, cover markup from UX-06a, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-plate-stack.js` (new). Guards: `test-plate-voice-removed.js` (the names above), `test-warmup-ramp-and-plates.js` (`getEquipment` and `snapToLoadable`, unchanged).
- **Risk:** a kg user's colour mapping (criterion 7). White plates vanish on chalk in light mode: give them the `--rule-strong` rim (`design-vision.md` §9).
- **Tools:** TOOL-01's harness; `Skill: dataviz` isn't needed (a diagram, not a chart).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped (`getEquipment` 32919, `BARBELL_STANDARDS` 32896, `isBarbellExercise` 31966). Found: three names the new code must not use (a removed-feature guard and the day disc's `.plate` class); criteria 5 and 6 are now jsdom/CSSOM checks with the harness as evidence; a kg case added (the old spec named one but didn't write it). Checked against `today.html`'s bar. Scope unchanged.
- **Status:** ready (after UX-06a)

### UX-08: Rest takes over the cover, with the next set's adjusters
- **Why:** the rest timer today is a separate bar. During rest the eye is on the cover, so the countdown should be there, with the next set ready to adjust and log beneath it (`renders/log-set-dark.png`).
- **Change:**
  - While `startRestTimer` (30173) runs, the cover shows "Rest", the remaining time as the cover numeral, "of m:ss" and the logged chips. The bright `--spot` layer shrinks with `transform: scaleX()` over the rest length (linear) to reveal `--spot-deep`, draining right to left as `tools/design/log-set.html` draws it. (`design-vision.md` §3.8 says `scaleY`; the item and the mock-up say `scaleX`, and the item wins.) `+30 s` and `Skip` call the existing timer controls.
  - Beneath it: the next set's steppers. **Reuse the set sheet's step** (consolidation): weight steps by `setSheetWeightStep(row)` (31229), which already gives 2 × the smallest plate on a barbell and the dumbbell increment on dumbbells (`test-set-sheet.js:74`); reps step by 1, floor 0, as `stepSetSheet` (31320) does. A "Reps left" segmented control (3+, 2, 1, 0), captioned with BL-10's words, writes RPE as 10 − RIR (stored data unchanged: it is still RPE). The Log button is in `--spot`.
  - Reduce Motion: no `scaleX` animation; the field shows a static split at the current fraction and the number updates.
- **Acceptance criteria:**
  1. After a logged set, `startRestTimer` is called once with the same seconds as today (stubbed clock; the existing `getDefaultRestSeconds` path, 27835).
  2. The weight "+" button on Bench at 160 lb gives 160 + the real `setSheetWeightStep(row)` (165 with the default lb plates), and on DB Curl at 30 gives 30 + the dumbbell increment. The expected values come from the real function, not literals.
  3. Choosing "Reps left: 2" logs RPE 8. With RPE mode off, the control is still shown and logs RPE, as the RPE field does today.
  4. With `matchMedia('(prefers-reduced-motion: reduce)')` stubbed to true, the fill element has no transition or animation in its computed style.
  5. Superset and backdated-set rest suppression still hold (existing tests pass unchanged).
- **Test plan:** new `test-rest-cover.js`, plus `test-superset-rest-timer-suppression.js` and `test-backdating-rest-timer-suppression.js` unchanged. Sabotage: make "Reps left: 2" write 2 as RPE, and criterion 3 must fail.
- **Files:** `index.html` (`startRestTimer` 30173 onward, the rest-timer CSS from 1511, the cover markup and CSS, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-rest-cover.js` (new). **Suites that extract `startRestTimer` and must pass unchanged** (they stub it and count calls): `test-auto-check-sets.js`, `test-backdating-rest-timer-suppression.js`, `test-fallback-entry-consolidation.js`, `test-partial-set-reactions.js`, `test-set-next-button.js`, `test-superset-rest-timer-suppression.js`, `test-superset-shared-sets-block-wiring.js`. Also `test-light-mode.js:110` (the rest timer reads its fill from tokens) and `test-set-sheet.js` (the shared step).
- **Risk:** the timer is load-bearing mid-session. Wake lock and notifications are untouched.
- **Tools:** `Skill: review-animations` (the `scaleX` drain); `Skill: animation-performance` (composite-only); TOOL-01's harness (rest state, Reduce Motion pass: `rest-*` and `rest-dark-402-rm` are already in its matrix).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. The weight step now reuses `setSheetWeightStep` instead of a third copy of the plate logic; criterion 2 takes its expected values from it. The `scaleX`/`scaleY` disagreement with `design-vision.md` §3.8 is noted (`log-set.html` uses `scaleX`). Checked against `log-set.html` (15 px meta on the rest field). Scope unchanged.
- **Status:** ready (after UX-06a)

### UX-09: Finish screen, with the PR moment
- **Why:** a session ends in a toast today. The finish should close the session with the true numbers and say what changes next time and why (`renders/pr-dark.png`).
- **Change:**
  - When the last prescribed set of the day is logged, a full-screen sheet opens. It has:
    - a flood in `--spot` if the session holds a weight or strength best, using the same rule as `reconstructAllPRs` (41853): heaviest top set or best e1RM;
    - the best set as the cover numeral with its plate stack, and "+x lb on your best, w × r on date";
    - sets done of planned, minutes and volume in one ruled row;
    - "Next time" rows from the existing progression signal (`analyzeProgressionSignal` 27597, then `computeSuggestedSet` 27983), each with its one-line reason;
    - Share (the existing `shareCelebrationCard` 29806, with MKT-04's `sessionShareStats`; the card itself is MKT-03, MKT-16 and MKT-07) and Done.
  - *(Spec refresh 3)* "volume" in the totals row is retired: D15 and MKT-04 lead with sets, and `pr.html` shows Sets, Lifts, Time. The row is sets done of planned, lifts and minutes.
  - *(Spec refresh 3)* The sheet opens from the same one site as MKT-04's celebration (29460, in `renderWorkout`), replacing the toast there. The sheet's content comes from one pure async builder, `finishSheetModel(listEl, dateKey, program)`, which the test drives; `renderWorkout` only calls it and `openFinishSheet(model)`.
  - With no best, the flood is replaced by the day headline on `--surface-1`.
  - Motion: the flood enters once as a `clip-path` circle from the Log button (700 ms, `--ease-out`). Reduce Motion: a cut. It never replays on reopen.
- **Acceptance criteria:**
  1. On seeded data where the last set beats the prior heaviest top set, the sheet shows that set and the prior best's weight, reps and date. Assert against `reconstructAllPRs()`'s newest event, not hard-coded numbers.
  2. With no best, no element with the flood class is rendered.
  3. Each "Next time" row's load equals what `computeSuggestedSet` returns for that exercise next session.
  4. `triggerCelebration` (29438) is still called for PRs, exactly once per PR (no double celebration).
  5. Closing the sheet returns focus to Today, and the sheet has `role="dialog"`, `aria-modal="true"` and a labelled close button.
  6. *(Spec refresh 3)* With a `MEDICAL_STYLES` program: no flood element, no trophy, no Share button (summit note).
  7. Real-call count: `renderWorkout` (comments stripped) calls `openFinishSheet(` at exactly one site, the completing click, and that site no longer calls the `'Session complete!'` toast.
- **Test plan:** new `test-finish-sheet.js` with the real `finishSheetModel`, `openFinishSheet`, `computeSuggestedSet` and `analyzeProgressionSignal`, and `reconstructAllPRs` over stub storage. Sabotage: compare against the first set instead of the top set, and criterion 1 must fail.
- **Files:** `index.html` (the new sheet markup beside `#setSheet`; builders near `triggerCelebration` 29635; the call at 29460; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-finish-sheet.js` (new); `tools/visual/harness.js` gains a `finish-dark-402`/`finish-light-402` state (tooling, same PR) since the matrix has no finish state. Guards: the ten `triggerCelebration` suites (MKT-04's list), `test-rpe-safety-caps.js` (the only suite that extracts `computeSuggestedSet`), `test-session-share.js`.
- **Risk:** an extra sheet at the end of every session. It's dismissed with one tap, and it replaces the toast instead of adding to it.
- **Summit note (summit 2026-11-07):** Ship as **two versions**. **09a:** the sheet, totals, "Next time" rows, Share (calling MKT-04's builder) and Done. **09b:** the flood and its motion. The Next-time rows print `computeSuggestedSet`, so BL-08 must have merged. Fix the mock-up first: Bench 4×4–6 at 5, 5, 5, 5 **holds** at 160 (summit F7). Record copy per summit R6: 160×5 over 155×8 is "Heaviest weight yet", not "your best" (e1RM 186.7 vs 196.3). On `MEDICAL_STYLES` programs: no flood, no trophy, no Share.
- **Tools:** 09a: TOOL-01's harness, `Skill: apple-hig` (sheets). 09b: `Skill: animate` and `Skill: review-animations` (the `clip-path` flood), `Skill: animation-performance`.
- **Split of criteria (spec refresh 3):** 09a owns 1, 3, 5, 6 (no Share, no trophy part) and 7; 09b owns 2, 4, the flood half of 6, and the motion (Reduce Motion: a cut, never replays on reopen; assert with `matchMedia` stubbed, no `animation`/`transition` on the flood element).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: "volume" in the totals contradicted D15 and the corrected `pr.html`; the sheet's trigger is inside `renderWorkout`, so content moves to a driven builder plus a one-site call count; the harness has no finish state, so 09a adds one; criteria split between 09a and 09b. Checked against `pr.html` ("Heaviest weight yet", hold at 160). Scope unchanged.
- **Status:** ready (after BL-08 and MKT-04)

### UX-10: Progress leads with the answer
- **Why:** Analysis opens on an AI button that needs a key (BIZ-06) and 13 collapsible cards. "Am I getting stronger?" should be answered first (`renders/progress-dark.png`).
- **Change:**
  - The top of the view gets a lift selector (the person's top 4 lifts by sessions) and the selected lift's estimated max as the answer figure, with its change over the window in words. Below it, one line chart of the e1RM per session in the lift's day ink: 2.5 px line, no fill, 4 gridlines, end label. Then one sentence: rate per week and the next prescribed set.
  - Then the per-muscle ledger (when BL-20 has shipped; until then this slot is omitted).
  - The existing groups follow, unchanged, with the jump rail and collapse state intact. AI insights moves below the evidence.
- **Acceptance criteria:**
  1. The answer figure equals the max of `estimated1RM` over the selected lift's sessions (real functions), and the change equals last minus first in the window.
  2. The chart's polyline has exactly one point per session.
  3. `test-analysis-collapse.js` and the jump-rail tests pass unchanged. Group IDs and default collapsed states are untouched.
  4. The selector buttons are 44 px tall and use `aria-pressed`.
- **Test plan:** new `test-progress-lead.js`. Sabotage: chart the top set's weight instead of the e1RM, and criterion 1 or 2 must fail.
- **Files:** `index.html` (the analysis view markup from 6655; `renderAnalysis` 47712, reached through `VIEW_RENDERERS` 40469; the e1RM sparkline in `buildExerciseHistoryHtml` 31633–31680; BL-20's ledger renderer in `renderVolumeTrend` 45779; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-progress-lead.js` (new).
  - **Consolidation (spec refresh 3):** an e1RM line already exists: `buildExerciseHistoryHtml` (31633) draws "Estimated 1RM" as a `.sparkline` polyline from `topSetOf` + `estimated1RM` per session (31642–31670), shown in the exercise sheet and the open-screen pane. Extract it into one `e1rmChartSvg(sessions, ink)` that both this block and that sheet call, restyled to §3.6 (2.5 px line, no fill, 4 gridlines, end label, the lift's day ink instead of `--plate-green`). Don't draw a second chart. UX-14 reuses the same function.
  - **Moving the ledger:** "the ledger slot moves BL-20's renderer" means the ledger rows render into the new block; `renderVolumeTrend`'s group rows stay in the Weekly Volume card.
  - Suites to read and keep green: `test-analysis-collapse.js` (group IDs, default states), `test-analysis-2-0.js`, `test-analysis-export.js` (reads the rendered cards; a new block may need adding to its expected list, with a dated note), `test-analysis-index-visual-weight.js` and `test-app-2-0.js:173` (the jump rail), `test-open-screen-2-0.js:115` (the pane's "estimated 1RM trend"), `test-muscle-ledger.js` (BL-20, where its rows now render), `test-ai-entry-honesty.js` (BIZ-06's card order).
- **Tools:** `Skill: dataviz`.
- **Risk:** Analysis has many guarded behaviours. This item only adds a block above them and shares one chart function with the exercise sheet.
- **Summit note (summit 2026-11-07):** The "AI insights moves below the evidence" clause is owned by BIZ-06; don't re-implement it. The ledger slot moves BL-20's renderer (summit R8). It ships after BL-20 and BIZ-06.
- **Added criteria (spec refresh 3):** (5) the exercise sheet's e1RM chart and the lead chart come from the same real `e1rmChartSvg` (one definition; `buildExerciseHistoryHtml` calls it once), and its polyline has no `fill` and stroke-width 2.5; (6) the lead's sentence "Next session …" prints the real `computeSuggestedSet` result for the selected lift, so it says "held at 160 until all 4 sets reach 6" when BL-08 holds (as `progress.html` does), never a made-up increase.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped (`VIEW_RENDERERS` 40469, `renderAnalysis` 47712). Found an existing e1RM sparkline in the exercise sheet, so the chart is consolidated rather than drawn twice; the suites that pin Analysis are listed. Checked against `progress.html` (ledger fractional, "10+" floor, no state colour, "held there until all 4 sets reach 6"). Scope unchanged.
- **Status:** ready (after BL-20 and BIZ-06)

### UX-11: The weekly recap as a sheet, with the week strip
- **Why:** the week is the unit of training. The recap is currently an Analysis card and a share card. It should be a Monday moment people keep (`renders/recap-dark.png`).
- **Change:**
  - On the first open of a new week, a sheet shows:
    - the week strip: seven blocks in each scheduled day's plate ink, filled when trained, hatched and outlined when missed, the off ink for rest; labelled with the day's `plateNum`;
    - one sentence naming any missed day;
    - sessions done of planned, hard sets and time;
    - new bests;
    - the next week's phase line.
  - Data comes from `computeWeekStats` (45677), unchanged. Share uses `archiveCurrentWeek`'s card (45711; its share call is 45768) as MKT-02 left it. The sheet is shown once per week (a `window.storage` flag like the other one-time states).
  - *(Spec refresh 3)* A Monday recap already exists: `getWeeklyRecapInsight` (14649, v3.476) puts last week in one line in Today's Priorities (`renderTodayInsights`, 14670). The sheet **replaces** that line on the day it opens (one recap, not two): once the sheet has been shown for a week, the Priorities line for that week isn't rendered. Both read `computeWeekStats`.
  - The week strip's per-day ink comes from `dayInk` (UX-01b) and the trained/missed state from the same corpus `fetchDayStatuses` (39997) reads.
- **Acceptance criteria:**
  1. For a seeded week with Days 1, 2, 4 and 5 trained, Day 3 cardio logged and Day 6 missed, the strip's seven blocks carry the states trained, trained, trained, trained, trained, missed, rest in order, each with its day's plate class.
  2. The sessions figure equals `computeWeekStats(...).sessions`. No figure on the sheet repeats another figure on it.
  3. The sheet opens once per week: a second `showView('today')` the same week doesn't reopen it.
  4. The strip has an accessible name listing each day and its state.
  5. *(Spec refresh 3)* After the sheet has opened for a week, the real `getWeeklyRecapInsight` returns nothing for that week; before, it returns its line as today.
  6. With a `MEDICAL_STYLES` program, no Share button (summit note). In the program's first week, the first-week variant shows (no "0 weeks").
- **Test plan:** extend `test-weekly-recap.js`, with a dated note (its v3.476 cases at 67–84 change only for criterion 5). Sabotage: mark rest days as missed, and criterion 1 must fail.
- **Files:** `index.html` (`getWeeklyRecapInsight` 14649, `renderTodayInsights` 14670, `computeWeekStats` 45677, `archiveCurrentWeek` 45711–45770, the Today view init in `VIEW_RENDERERS.today` 40470, the new sheet markup, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-weekly-recap.js`; `tools/visual/harness.js` gains a `recap-dark-402`/`recap-light-402` state (no recap state in the matrix). Guards: `test-archive-week-visibility.js` (extracts `archiveCurrentWeek`), `test-today-priorities.js` (the Priorities order includes `weeklyRecap`).
- **Risk:** a new interruption once a week. It's dismissible, and MKT-02's privacy rules apply to the share.
- **Summit note (summit 2026-11-07):** Share is hidden while a `MEDICAL_STYLES` program is active. "New bests" uses summit R6 wording. Define a **first-week variant**: done against planned, and what week 2 brings, never "0 weeks" (summit §1.2). MKT-05 later adds the block-complete variant to this sheet.
- **Tools:** TOOL-01's harness; `Skill: dataviz` (the week strip); `Skill: apple-hig` (sheets).
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found the v3.476 Monday recap line in Priorities; the sheet now replaces it for that week instead of saying the same thing twice. The summit's medical and first-week rules are numbered criteria; the harness needs a recap state. Checked against `recap.html` (strip in plate inks, hatched missed, "Bench holds at 160", "Heaviest weight yet"). Scope unchanged.
- **Status:** ready

### UX-12: History as a month of plate blocks
- **Why:** History is a calendar plus a long list. The week-strip grammar scales to a month: you can scan a month's consistency by colour.
- **What exists (spec refresh 3):** History already has a one-month calendar with tap-to-jump: `renderHistoryHeatmap` (40071) and `renderHistoryHeatmapMonth` (40095) draw the month with prev/next arrows and a dot per day from `fetchDayStatuses` (39997: trained, rest, off), and a tap calls `jumpToHistoryDay` (40148), which opens the month, fills it and scrolls to that day's card. `test-history-heatmap.js` (13 cases) covers it. The list is `renderHistory` (45181).
- **Change (consolidated onto the existing calendar):**
  - The heatmap's day cells become plate blocks: a trained date's cell is filled with that session's day ink; rest and off keep their own looks; empty dates stay plain, non-interactive cells. The month navigation, the tap and `jumpToHistoryDay` stay exactly as they are. No second grid.
  - The ink per date: `fetchDayStatuses` keeps returning `Map<date, status>` (its callers and `test-fetch-day-statuses.js` unchanged); a small pure `inkForDate(workoutCorpus, exCorpus, date)` picks the trained day with the most logged sets that date (ties: earliest in `dayOrder`) and returns `dayInk(dayId, program)`.
  - Sessions below become two-line ruled rows: day, date and duration on line 1; top lifts on line 2. Same data and the same edit and delete paths.
- **Acceptance criteria:**
  1. Each trained date in the viewed month renders exactly one block whose ink class is `dayInk` of that date's main session (for a strength d1 date, red). Dates without a session render the plain cell (`test-history-heatmap.js:103` still holds).
  2. Tapping a block calls the real `jumpToHistoryDay` with that date, which scrolls the matching day card into view (`scrollIntoView` stub-counted: 1).
  3. A date with two sessions (d1 with 12 sets, d3 with 4) takes d1's ink.
  4. `test-history-heatmap.js`'s navigation and jump cases (137–247) and the History edit and delete tests pass unchanged; its dot-class cases (87, 117) are re-pinned to the block classes with a dated note.
- **Test plan:** extend `test-history-heatmap.js` (it loads the real `#historyView` and functions). Sabotage: key blocks by the weekday instead of the date, and criterion 1 must fail.
- **Files:** `index.html` (`fetchDayStatuses` 39997 left as is; `renderHistoryHeatmapMonth` 40095; `renderHistory` 45181; the calendar CSS around 1701–1703 and 3159–3170; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-history-heatmap.js`. Guards: `test-fetch-day-statuses.js`, `test-history-date-range-filter.js`, `test-open-screen-2-0.js` (174–203: the unfolded History day pane, which marks the tapped day on the calendar), `test-history-2-0.js`.
- **Tools:** TOOL-01's harness; `Skill: dataviz` (the month grid).
- **Alignment note (2026-11-07):** moved from slot 58 to slot 44, before the cover, so History is in the new materials before Today's cover lands (design-engineer B2). Block inks come from `dayInk`.
- **Spec refresh 3 (2026-11-09, against v3.528):** found that History already has a month calendar with tap-to-jump (`renderHistoryHeatmap`, v3.4xx). The item now restyles that calendar's cells as plate blocks instead of building a second month grid; the test extends `test-history-heatmap.js`. Scope unchanged (same screen, same result).
- **Status:** ready

### UX-13: Food in the world's ink
- **Why:** Food is the most frequent touch in the app, and after UX-03 it would otherwise sit in the old layout beside a rebuilt Today. Its flows are good and stay; only the surface changes. *(Alignment round:* moved to slot 43, before the cover. The food lane (BIZ-03, BL-18, BL-19, BL-16, BL-17) ships at the end of Phase 1, so recents and the placeholder line already exist when this is built.)
- **Change:** the calorie hero (`#calHero`, `renderCalHero` 38025) and the four macro bars (`.macro-row`, `#barCal`… 6290–6312; there are no rings at v3.528) become one ruled row of four figures (calories, protein, carbs, fat), with the remaining figure as the lead. Search, barcode, Snap a Meal and Describe It become one row of standard buttons (the quick-add row, 6324). Logged food rows (`renderFoodLog` 37931: `.food-log-item`, its macro expand `#flDetail<i>`, its portion stepper and swipe-to-delete) become two-line ruled rows **in the same function**. No flow, storage or API changes.
  - *(Spec refresh 3)* Not "using `buildFoodResultRow`", as first written: that's the review row for Describe, Snap a Meal and Recipe Finder (a stepper and "Save to My Foods", no delete, no expand). Logged rows have their own behaviour (swipe delete, macro expand), which `test-food-log-macro-expand.js` and `test-food-log-portions.js` pin.
- **Acceptance criteria:**
  1. The remaining-calorie figure equals `computeTargets(userProfile).cal` minus the logged sum for the seeded day (real `computeTargets`, `computeTodaysFoodTotals` and `renderFoodLog`).
  2. Every logged entry renders as exactly one `.food-log-item` row with two lines (name; calories and macros), and its expand and portion stepper still work (real clicks, as `test-food-log-macro-expand.js` does).
  3. BIZ-03's `#calHeroEstimate` line and BL-18's `#foodRecents` row are present and behave as their own tests say (asserted unconditionally).
  4. Tap parity: `test-tap-counts.js` gains "log a recent food" (one tap on a BL-18 chip adds one entry), and the count is ≤ the parent commit's.
  5. Existing food logging tests (search, barcode, repeat yesterday, portions, macro expand) pass, re-pinned only where they pin the old markup, with dated notes.
- **Test plan:** new `test-food-view-summary.js`, plus `test-tap-counts.js` extended. Sabotage: drop one entry from the sum, and criterion 1 must fail.
- **Files:** `index.html` (Log view markup 6280–6330 and its CSS; `renderCalHero` 38025; `updateBars` 38035; `renderFoodLog` 37931; `APP_VERSION` 7625; `WHATS_NEW` 7643), `sw.js`, `test-food-view-summary.js` (new), `test-tap-counts.js`. **Suites that pin this markup** (read, re-pin with dated notes where the layout changes on purpose): `test-nutrition-macro-bar-colors.js` (the bar colours), `test-visual-polish-audit-fixes.js` (66–146: the quick-add row and `#valCal`'s computed layout), `test-nutrition-default-open.js`, `test-log-2-0.js`, `test-food-log-macro-expand.js`, `test-food-log-portions.js`, `test-app-2-0.js:126–134` (quick actions are "glass tiles"; UX-03 will already have touched it), `test-list-row-enter-animation.js` (food rows' arrival animation), `test-placeholder-targets.js` (BIZ-03), `test-food-recents.js` (BL-18).
- **Summit note (summit 2026-11-07):** Keep BIZ-03's placeholder line and BL-18's recents row, each asserted in this item's test.
- **Alignment note (2026-11-07):** both are now asserted **unconditionally**, not "if present", because they merge before this item. Extra criterion: extend `test-tap-counts.js` (from UX-06a; if UX-06a hasn't shipped, this item creates it) with "log a recent food". The count is ≤ the parent commit's.
- **Tools:** TOOL-01's harness; `Skill: apple-hig`; `Skill: dataviz` for the macro row.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. Found: the old criterion 2 would have routed logged food through the review row (`buildFoodResultRow`), which has no delete or expand; the summary is bars plus a hero, not rings. The pinned-markup suites are listed. Scope unchanged.
- **Status:** ready (after BL-18, BIZ-03 and UX-06a's `test-tap-counts.js`; if UX-06a hasn't shipped, this item creates that file, as the alignment note says)

### UX-14: The unfolded screen: session and lift side by side
- **Why:** unfolded (904×678), Today already puts the lift's history on the right (`renders` of the incumbent). In the new world the left pane is the cover and session, and the right pane is the selected lift: its plate stack, e1RM line and last five sessions. Tapping a session row switches the right pane, with no navigation.
- **What exists (spec refresh 3):** most of this shipped in v3.499–v3.501. `isOpenPosture()` (28635) reads `OPEN_POSTURE_QUERY` (28634: ≥ 760 × 560 px, or two horizontal viewport segments) through `matchMedia`; opening an exercise calls `focusExerciseDetail` (28646), and `renderExerciseDetail` (31756) fills the right pane with `buildExerciseHistoryHtml` (31633): stats, last five sessions, the e1RM trend, cues. `test-open-screen-2-0.js` (115–145) covers it, and `test-duo-*.js` cover the layout. So there's no new container query and no 720 px breakpoint: that would fork the open-screen rule the app already uses everywhere.
- **Change (narrowed to what's missing):** the right pane, through `renderExerciseDetail`, gains UX-07's plate stack for the focused barbell lift and UX-10's `e1rmChartSvg` in place of the old sparkline (it's the same builder, so this comes almost for free after UX-10). The left column is the cover and session list as UX-06a left them. `OPEN_POSTURE_QUERY` and `isOpenPosture` are unchanged.
- **Acceptance criteria:**
  1. With `matchMedia` stubbed to match `OPEN_POSTURE_QUERY`, focusing an exercise (the real `focusExerciseDetail` → `renderExerciseDetail`) sets the pane's title to that exercise, and `e1rmChartSvg` is called exactly once per focus (stub-counted).
  2. For a barbell lift the pane holds one plate stack whose caption equals `platesPerSide` for the next set's load; for DB Curl, none.
  3. With `matchMedia` not matching, nothing renders in the pane (the existing v3.499 behaviour).
  4. `test-open-screen-2-0.js`, `test-foldable-tabletop.js` and the `test-duo-*.js` suites pass unchanged.
- **Test plan:** extend `test-open-screen-2-0.js` (it already drives `renderExerciseDetail` open and closed), plus TOOL-01's harness at 904×678 light and dark (`today-*-904`, already in the matrix). Sabotage: render the chart for the first exercise always, and criterion 1 must fail.
- **Files:** `index.html` (`renderExerciseDetail` 31756, `buildExerciseHistoryHtml` 31633, the pane markup at 6263, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-open-screen-2-0.js`.
- **Summit note (summit 2026-11-07):** Moved up to follow UX-10 (roadmap build 40): the owner uses a Duo daily, so the unfolded Today can't wait for Phase 4. For testability, drive the two panes from a `matchMedia` listener that sets a class, because jsdom can't evaluate container queries (summit §1.7).
- **Tools:** TOOL-01's harness at 904×678 (WebKit when installed); `Skill: dataviz`.
- **Spec refresh 3 (2026-11-09, against v3.528):** found that v3.499's open-screen pane already does the two-pane Today with the lift's history and e1RM trend, keyed to `OPEN_POSTURE_QUERY`. The item is narrowed to what's missing (the plate stack and the shared chart in that pane) and drops the new 720 px container query, which would have been a parallel layout system (CLAUDE.md, "Consolidate duplication"). The summit's "drive it from a `matchMedia` listener" is exactly what exists. The owner may want to know the Duo work is smaller than planned; no question needed.
- **Status:** ready (after UX-07 and UX-10)

### UX-15: Retire the legacy look's leftovers
- **Why:** after UX-03 to UX-14, unused rules remain: halo and glass tokens, `--cta-gradient-*`, the Geist Mono UI labels and the old pill styles. Dead CSS hides real behaviour (CLAUDE.md precedent).
- **Change:** delete only rules and tokens with zero matching elements across all views in all states. The gym mode literal shadow stays.
- **Acceptance criteria:**
  1. A jsdom sweep renders every view (and gym mode, the sheets and the rest state) and lists the selectors that match nothing. Every deleted rule is in that list, and no rule in that list remains.
  2. Playwright screenshots of all views, light and dark, are pixel-identical before and after.
- **Test plan:** new `test-dead-css-sweep.js`. Sabotage: delete a rule that does match (the rest timer's), and criterion 2 must fail.
- **Files:** `index.html` (CSS only), `sw.js`, the test.
- **Risk:** CSS that only applies in a rare state. The sweep must cover each state, and the PR lists which states it rendered.
- **Summit note (summit 2026-11-07):** Always last among the UX items. It includes `.confetti-piece` once UX-09 has replaced the toast (summit F9). The PR lists every state rendered; the pixel-identity criterion is Playwright PR evidence.
- **Tools:** TOOL-01's harness (its full state matrix is the sweep's state list).
- **Alignment note (2026-11-07):** runs after UX-17 if the owner approves that. Must ship before any Phase 5 step, so the retired confetti isn't a post-launch removal (business-manager B3).
- **Status:** ready

### UX-16: The coach button moves into the header
- **Why:** the floating chat button (`#coachFab`, 7461; tuck 48616; drag and stored position 48644–48720) covers content on every view at 402 px (see the incumbent screenshots). In the new world it's a plain 44 pt icon button in the header, beside Settings (as `today.html`'s header draws it).
- **Change:** the button keeps its ID `coachFab` and its open handler (43944; it toggles `#coachFabModal` and focuses `#floatingChatInput`). Removed: the floating position CSS, `wireCoachFabTuck` (48616), `COACH_FAB_POSITION_KEY`, `clampCoachFabTop`, `applyCoachFabPosition`, `restoreCoachFabPosition` (48644–48690), `wireCoachFabDrag` (48690 onward) and the `coachFabJustDragged` check in the click handler (43945). The stored `coach-fab-position` key is ignored and removed once on load (one `window.storage` delete; no schema bump).
- **Acceptance criteria:**
  1. One click on the header button opens the coach exactly as the FAB did (the real handler: `#coachFabModal` gains `active`; a second click closes it).
  2. No element is `position: fixed` over the content area apart from the tab bar, the toast, the rest timer and sheets (a CSSOM check over the real markup, naming the allowed selectors).
  3. The button's CSSOM size is ≥ 44 × 44 px and it has an accessible name ("Ask your coach", as today).
  4. None of the removed functions or the key name appears in the real source (comments stripped).
  5. With `coach-fab-position` stored from an older version, load doesn't throw and the key is gone afterwards.
- **Test plan:** new `test-coach-header-button.js`. Sabotage: re-add the fixed position, and criterion 2 must fail.
- **Files:** `index.html` (the header markup, the `.coach-fab` CSS, 7461, 43944–43990, 48616–48720, `APP_VERSION` 7625, `WHATS_NEW` 7643), `sw.js`, `test-coach-header-button.js` (new). **Retire** `test-coach-fab-drag.js` (every case tests the drag this item removes; delete it with a note in the new suite naming it, the way removed features were handled in `test-plate-voice-removed.js`). **Re-pin with dated notes:** `test-tab-bar.js` (bottom-floating elements clear the bar; the FAB is no longer one), `test-side-safe-area-gutters.js`, `test-tap-target-hit-areas.js`, `test-today-fab-glow-color.js`, `test-today-no-glow.js`, `test-cta-blue-unification.js:58` (`.coach-fab` background; UX-03 may already have changed it), `test-css-mechanical-token-dedup.js`. Read and keep green: `test-my-supplements-tracker.js` and `test-glyphs.js` (they click `#coachFab` to open the chat; the ID stays), `test-today-emoji-free.js`, the code at 36076–36089 that opens the coach by clicking `#coachFab`.
- **Risk:** it drops a feature: the draggable button and its remembered side (owner accepted, D2).
- **Tools:** `Skill: apple-hig` (header controls); TOOL-01's harness.
- **Spec refresh 3 (2026-11-09, against v3.528):** lines re-grepped. The removal list is now explicit, a whole suite (`test-coach-fab-drag.js`) retires with the drag, and seven suites that pin the floating button are named for re-pinning. Criteria 3–5 added (target size, the removed code is really gone, an old stored position is cleaned up). Scope unchanged.
- **Status:** ready (owner yes 2026-11-07, D2). The owner accepted losing the drag and its remembered side. *Original question:* "Move the floating chat button into the header (it stops covering content, but you can no longer drag it)?"

### UX-17: Retire Gym mode once Today is the session
- **Why:** after UX-06 to UX-08, Today is gym mode: the next set huge, one tap, rest on the cover. Keeping both doubles the surface to maintain, and gym mode's tests guard a second implementation.
- **Change** (owner yes 2026-11-07, D2): one version removes the Gym mode toggle and the gym-only rendering. Its tests move to the shared Today paths, with dated notes.
- **Acceptance criteria:**
  1. The rendered Settings and Today markup contain no Gym mode toggle (DOM count 0).
  2. `test-tap-counts.js` passes unchanged, so Today logs the ready set in no more taps than Gym mode did.
  3. A stored Gym mode preference from an older version is ignored without error, and Today renders normally.
- **Tools:** TOOL-01's harness; `test-tap-counts.js` must pass unchanged.
- **Alignment note (2026-11-07):** waits for **tap parity** (market-researcher): Today must log the ready set in no more taps than Gym mode, confirmed in `test-tap-counts.js` and on the owner's phone. It must **ship or be dropped before any Phase 5 public step**, so retiring Gym mode never lands as a post-launch take-away (business-manager B3).
- **Status:** ready (after UX-06a, no sooner than 14 days after UX-06a's merge, and once the owner records that tap parity holds on his phone) (owner yes 2026-11-07, D2). It ships or is dropped before any Phase 5 public step. *Original question:* "Once the new Today ships and matches Gym mode's tap counts, remove the separate Gym mode?"

---

## Tooling and docs outside the build loop (alignment round, 2026-11-07)

The loop never picks these: they aren't in the roadmap's numbered sequence, and they change neither `index.html` nor `sw.js`, so they bump no version and can't collide with the open auto-PR (consensus C3). Each is its own PR into `Branch-1`, merged by the owner.

### TOOL-01: The visual harness
- **Why:** UX-01's pixel-identity criterion isn't deterministic today: there's a cold-launch animation, clock-dependent copy (the "Hydration check … behind pace for this time of day" line), the empty-profile first-run sheet, and no committed seed. Screenshots also go to the scratchpad, so the owner approves a redesign he never sees (design-engineer B3).
- **Change:** `tools/visual/`, a Playwright script with:
  - a committed seeded fixture (Jordan, Strength & Size, Bench history);
  - a frozen `Date`;
  - the launch-played preset;
  - `document.fonts.ready` awaited;
  - a Reduce Motion pass;
  - a fixed state matrix: Today, Food, Progress and History × light/dark × 402×874 and 904×678, plus Gym mode, the rest state and the first-run sheet.

  Output: one contact-sheet PNG (about 0.3 MB), plus a per-state diff against a given base commit. Chromium now; WebKit once D10 approves it. No change to the app.
- **Acceptance criteria:**
  1. Two runs on the same commit produce byte-identical PNGs for every state (determinism).
  2. A run against a commit that changes one CSS colour reports a diff in exactly the states that show it.
  3. The script makes no network request outside `localhost` (route-blocked and counted).
- **Test plan:** the PR shows criteria 1–3 run for real; `tools/visual/README.md` gives the one command.
- **Files:** `tools/visual/` only.
- **Risk:** none to the app. It's a dev tool, published on Pages with the rest of `tools/` (consensus O5).
- **Owner:** design-engineer builds it; the owner merges it **before roadmap slot 11 (UX-01)**.
- **Status:** done (merged into `Branch-1`: commits 5581084 and b5055c7, `tools/visual/`; noted in the 2026-11-08 spec refresh)

### DOC-01: PRODUCT.md takes the chosen name
- **Why:** `PRODUCT.md:36` still says "Name: 'Training Log' (an open question for a public launch, BIZ-12)". Design skills read it as context.
- **Change:** one line, once the owner settles the public name (consensus decision 10): the name, plus "display name since v3.515; storage keys unchanged". Also correct "no assets" if the owner rewords CLAUDE.md's asset note (`fonts/` ships).
- **Acceptance criteria:** `PRODUCT.md` names the same string as `APP_NAME` in `index.html`.
- **Files:** `PRODUCT.md`.
- **Status:** needs-owner (waits for the name). Done by the design-engineer in a docs PR, not by the loop.
