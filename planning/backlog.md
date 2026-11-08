# Backlog

**Alignment round (2026-11-07, live v3.516).** Re-checked after the seven pre-D1 reviews; the reconciled position is `planning/alignment/consensus.md`. Changes in this file are marked "Alignment note (2026-11-07)". The app's display name is Liftnext (`APP_NAME`, v3.515). The **public name is open** (the owner decides; `planning/naming.md` is input), so items say "the app's name" and read `APP_NAME`, never a literal. New IDs this round:
- BL-05b, BL-50, the BL-41–49 placeholder;
- UX-01b;
- MKT-03b, MKT-20;
- BIZ-18a, BIZ-25, BIZ-26;
- TOOL-01, DOC-01.


**Audit fold-in (2026-11-08, against v3.518).** The exercise-auditor's 18 items from `planning/backlog-additions-2026-11-08.md` (PR #68) now live here, in the section "Added from the exercise-consistency audit": BL-43, BL-46 to BL-48, and BL-51 to BL-64. Their line numbers are re-grepped at v3.518, and their `Files:` lines name the suites to re-pin. BL-51 became `needs-owner`, because it adds a stored field. Their slots are in `roadmap.md`'s Unified build sequence.

**Spec refresh (2026-11-08, against v3.518, after PR #63).** The next 15 slots of the Unified build sequence after BL-01 (roadmap slots 2–16: BL-02, BL-03, BL-04, BL-05 with BL-06, BL-05b, BL-13, BL-35, BL-36, BL-08, UX-01, UX-01b, BL-07, MKT-02, MKT-09, UX-02) were re-grepped against `index.html` at **v3.518**. In those items, line numbers are v3.518's, each criterion is written to be checked by a real invocation (or, where `renderWorkout` can't be driven in jsdom, by a real-call count), and `Files:` names every existing test that needs re-pinning, found by reading the suites that extract the touched functions. Each changed item ends with a "Spec refresh (2026-11-08)" line. Owner decisions already given in `pitch.md` (D2, D4, D11–D13) are applied to statuses. The builder's PR #63 flags became BL-65 to BL-67 (and BL-02 criterion 9). Items further down still carry v3.514 numbers: re-grep them.

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
- **Status:** ready

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
- **Status:** ready (after BL-03)

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
- **Status:** ready

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
- **Status:** merged into BL-05 (summit 2026-11-07): ships in BL-05's version; mark done with it

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
- **Status:** ready (after BL-05)

## Ready: correctness of what exists (audit High, then Medium)

### BL-07: The performance goal no longer cuts strength-tier work (H-1)
- **Why:** `applyGoalVolume` caps compounds at 3 sets for `performance`:
  - Powerlifting Squat 5×5 → 3×5;
  - Strength & Size Bench Press 4×4–6 → 3×4–6.

  Yet `PROGRAM_FIT_SCORES.performance` (33586) ranks powerlifting 70. The stand's 2–3 sets is a minimum, not a sport ceiling [ACSM26]; accumulated heavy volume drives strength [PEL].
- **Change:** in the `strength` branch of `applyGoalVolume` (26699–26708), skip when `getRepRangeTier(ex.sets) === 'strength'` (27715) **or** the program is `powerlifting` or `powerbuilding`.
  - *Spec refresh (2026-11-08):* the old text also listed `oly`. Since BL-01 (v3.518), `applyGoalVolume` returns early for every program outside `VOLUME_MODIFIER_PROGRAMS`, `oly` included, so Olympic Snatch already keeps 5×2 and an `oly` clause would be dead code. Dropped; no behaviour change.
- **Acceptance criteria** (the real `applyGoalVolume` with the real program tables, as `test-volume-modifier-gate.js` runs it):
  1. Goal performance, powerlifting d1 (`index.html` 10470): Squat stays `5×5`. (At v3.518 it becomes `3×5`, so this criterion fails before the change.)
  2. Goal performance, Strength & Size d1: Bench Press `4×4-6` (strength tier) stays `4×4-6`; Barbell Row `4×6-8` (hypertrophy tier) still becomes `3×6-8`.
  3. Goal performance, every powerbuilding day: no exercise's set count falls.
  4. Goal gain is unchanged on all four lifting programs (snapshot every day before and after).
- **Test plan:** extend `test-volume-modifier-gate.js` (add `getRepRangeTier` to its chunks). Sabotage: remove the skip, and criteria 1–3 must fail.
- **Files:** `index.html` (26673–26712), `sw.js`, `test-volume-modifier-gate.js`. No other suite extracts `applyGoalVolume` (checked at v3.518).
- **Risk:** depends on BL-01 (done, v3.518). Strength & Size users on goal performance keep more sets on their heavy lifts; the What's New line says so.
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
- **Why:** `READINESS_RPE_HIGH = 8.5` (46835), but RPE mode prescribes 8.5 in week 3 and 9 in week 4. Doing exactly what's prescribed gets flagged as fatigue.
- **Change:**
  - `computeReadiness` (46843) takes `rpeTarget`. It flags when `weeklyRpe >= rpeTarget + 1.0` or `weeklyRpe >= 9.5`.
  - `getReadinessInsight` (14560) passes `targetRpeForWeek(await getMesocycleWeek())`, or 6 in a deload week.
- **Acceptance criteria:**
  1. Week 4 (target 9) with weekly RPE 9.0: no `rpe` flag.
  2. Week 2 (target 8) with 9.2: flag.
  3. 9.6 in any week: flag.
  4. Without `rpeTarget`, falls back to today's 8.5 rule. The pure-function contract is kept.
- **Test plan:** extend `test-today-priorities.js`, or add `test-readiness-rpe-target.js`, with a real `computeReadiness`. Sabotage: revert the threshold.
- **Files:** `index.html` (46835–46860, 14560–14590), `sw.js`, the test.
- **Risk:** Today priorities. Guarded by `test-today-priorities.js`.
- **Status:** ready

### BL-10: A target RIR on every prescription (H-5)
- **Why:** in default mode "3×10–12" carries no effort target. Hypertrophy improves closer to failure while strength is flat across RIR [ROB24]; failure isn't required [REF23].
- **Change:** a pure function, `targetRirLabel(ex, program)`. It reuses `getRepRangeTier` (27678), `COMPOUND_CATEGORIES` and the BL-02 program classes:
  - strength tier: "2–3 RIR (last set 1–2)";
  - hypertrophy compound: "1–3 RIR";
  - isolation: "0–2 RIR";
  - `oly`, `jump`, `throw`, `punch`, `kick`: "Stop with 3+ in reserve; speed over grind";
  - medical or senior: "3–4 RIR";
  - no parseable reps: no label.

  It renders as a small label beside the sets string in the exercise row. RPE mode keeps its own badge.
- **Acceptance criteria:** one rendered row per class shows the exact label. Cardio and time-based rows show none. The label element has an accessible text equivalent ("reps in reserve").
- **Test plan:** new `test-rir-target-label.js`: the pure function, plus the real row markup in jsdom. Sabotage: return `''`.
- **Files:** `index.html` (row render near 28750–29030), `sw.js`, the test.
- **Risk:** row layout at 402 px. Guarded by `test-workout-card-type-scale.js`, `test-label-floor.js` and `test-tap-target-hit-areas.js`.
- **Tools:** `impeccable clarify`, `apple-hig` (type floor).
- **Alignment note (2026-11-07, design-engineer):** "2–3 RIR (last set 1–2)" is jargon on a 150 px cover read from a metre away. `targetRirLabel` returns `{short, words}`: `short` is the label above, and `words` is plain English ("Stop 2–3 reps short; last set 1–2"; "Stop 3+ reps short; speed over grind"). The row shows `short` with `words` as its accessible name, and the cover (UX-06a) shows `words`. Add one criterion per class for `words`.
- **Summit note (summit 2026-11-07):** This is the **single effort vocabulary** (summit R7). The cover, the row, the rest steppers (UX-08), the first-set hint (BIZ-05) and the badge all read `targetRirLabel` / `rpeTargetFor`. Note that week 3 is RPE 8.5 (`RPE_BY_CYCLE_WEEK`, 27409), so RPE-mode wording follows `rpeTargetFor`, not a hard-coded "RIR 2".
- **Status:** ready

### BL-11: Rep and time progression for bodyweight and timed work (H-8, part 1)
- **Why:** `computeSuggestedSet` returns `null` when `weight == null` (27813). Bodyweight, Calisthenics, Core and Pilates therefore never progress. Progressive overload is the core recommendation [ACSM26].
- **Change:** a weightless branch, `suggestRepProgression(pastSessions, ex)`. When every set reached the top of the range, or the hold time, in 2 consecutive sessions:
  - suggest +1 rep per set, or +5 s for holds;
  - above 15 reps or 60 s, suggest a harder variant in words ("Ready for a harder variation"), without swapping anything.

  It is excluded for `medical` and `senior` (SAF-1 principle).
- **Acceptance criteria:**
  1. Push-up `4×8-12`, two sessions all at 12 reps: the reps placeholder suggests 13.
  2. Plank `3×45s`, two sessions at 45 s: suggests 50 s.
  3. Medical program: no suggestion.
  4. Weighted exercises: `computeSuggestedSet` output is unchanged.
- **Test plan:** new `test-bodyweight-progression.js`. Sabotage: remove the 2-session rule.
- **Files:** `index.html` (27530, 27812, render near 28766), `sw.js`, the test.
- **Risk:** set chips for bodyweight rows. Guarded by `test-set-chips.js` and `test-gym-set-chips.js`.
- **Status:** ready

### BL-12: Copy that matches the code (H-4 copy, L-2, L-1 for in-app tips)
- **Why:**
  - The Bodybuilding overview (9789) says "Every muscle is trained at least twice a week". The computed dose is chest, quads and lats 1×/wk (H-4).
  - The bodybuilding tip "Deload every 6-8 weeks" (33118) contradicts the 5-week engine (`DELOAD_CYCLE_WEEKS`, 14903) [BELL23].
  - The sleep tip "Growth hormone release peaks in deep sleep, directly supporting repair" (33116) is unsupported (L-1).
  - The bodybuilding insight (28421) says to "slow the eccentric", but 0.5–8 s reps grow similarly [DUR15].
- **Change:** text only:
  - overview → "…Most muscles get one hard session a week plus indirect work; pick Strength & Size if you want each muscle twice.";
  - tip → "Deload every 4–6 weeks (the app schedules every 5th)";
  - sleep → "Sleep 7–9 hrs: short sleep lowers training performance and recovery.";
  - insight → the audit's §4 rewrite.
- **Acceptance criteria:** each of the four rendered strings matches its new text exactly, and the old phrases are absent from the real rendered DOM.
- **Test plan:** new `test-copy-truth.js`. Sabotage: restore one old string.
- **Files:** `index.html` (9789, 28421, 33116, 33118), `sw.js`, the test.
- **Risk:** overview length caps. Guarded by `test-concise-overviews.js` and `test-program-overview.js`.
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
- **Why:** `getRepRangeTier` (27678) reads the first number after "×" as reps:
  - Heavy Bag 6×2min → 240 s;
  - Sprint 6×40yd → 60 s;
  - max holds → 60 s.

  Rest above 60 s helps hypertrophy slightly, with no added benefit beyond about 90 s [SING24]. Sprints and max holds need near-full recovery [PRAC]. The app's own Athletic tip (33132) says so.
- **Change:**
  - (a) `getRepRangeTier` returns `null` when the number is followed by `s|sec|min|m|yd|rounds|breaths|steps`.
  - (b) `getDefaultRestSeconds` (27689) gets a unit branch:
    - rounds → 60 s (jump rope 45 s);
    - sprints ≤ 20 s or ≤ 40 yd → 120 s;
    - `pull`/`push`/`shoulder` holds in seconds → 120 s;
    - erg or run intervals → 90 s.
  - (c) Endurance tier: compound 60 → 120 s, isolation 60 → 75 s.
  - `getRestReasonLabel` (27703) mirrors every branch.
- **Acceptance criteria:** the real function returns:
  - Heavy Bag `6×2min` → 60;
  - Sprint Intervals `6×40yd` → 120;
  - Front Lever Hold `5×10s` → 120;
  - Rowing `6×500m` → 90;
  - Leg Press `3×12-15` → 120;
  - Lateral Raise `3×15-20` → 75;
  - Back Squat `5×5` → 240, unchanged.

  The label agrees with the number for each case.
- **Test plan:** new `test-rest-units.js`. Sabotage: drop the unit guard.
- **Files:** `index.html` (27678–27712), `sw.js`, the test.
- **Risk:** the rest timer. Guarded by `test-lb-per-kg-consolidation.js`, `test-set-next-button.js` and the superset rest-suppression suites.
- **Status:** ready

### BL-15: The decrease signal waits for two short sessions (M-2)
- **Why:** signal 2 in `analyzeProgressionSignal` (27500–27510) drops the load 7.5% after one session below the rep floor. Coached rules wait for repeated failure: Starting Strength resets after 3 stalls, and GZCLP changes the scheme first [PRAC].
- **Change:**
  - Decrease only when `s0` **and** `s1` are both below the floor at the same or heavier load, or `s0.avgRpe >= 10`.
  - The drop is 5% for upper-body categories (`push`, `pull`, `shoulder`, `arms`) and 7.5% for lower body.
  - `computeSuggestedSet` (27877–27882) uses the same figure.
- **Acceptance criteria:**
  1. One short session: no decrease.
  2. Two short sessions on Bench at 200: decrease to `snapToLoadable(190)` or below.
  3. One short session at RPE 10: decrease.
  4. The badge figure equals the field figure.
- **Test plan:** extend `test-all-set-double-progression.js`. Sabotage: revert to the 1-session rule.
- **Files:** `index.html` (27500–27510, 27877–27882), `sw.js`, the test.
- **Risk:** same guards as BL-08.
- **Status:** ready

## Ready: first step of each bar-raiser

### BL-16: Smoothed trend weight, with pace from the trend
- **Why:**
  - `renderSparkline` (40795) computes pace first-to-last on raw weigh-ins (40826–40830), so one water-heavy morning moves pace and goal date (`describeGoalPace` 40780).
  - MacroFactor's most-praised trait is a trended weight (research §8.1).
  - Hacker's Diet EMA, 10% smoothing ([fourmilab](https://www.fourmilab.ch/hackdiet/); checked from memory, unverified this session).
- **Change:**
  - A pure function, `computeWeightTrend(sortedEntries)`, with gap-aware smoothing: α = 1 − 0.9^days since the previous weigh-in.
  - `renderSparkline` draws a second polyline, `.weight-trend-line`, over the raw points.
  - Pace becomes (trend now − trend at least 14 days ago) / days × 7 when the range spans ≥ 14 days. Otherwise it stays first-to-last.
- **Acceptance criteria:**
  1. Daily 180.0 for 20 days, then one 184.0: the last trend value is ≤ 180.4.
  2. The chart contains exactly one `.weight-trend-line` polyline with as many points as weigh-ins.
  3. The pace text for a linear −0.5 lb/wk series reads 0.5 (±0.05).
  4. Fewer than 2 weigh-ins: the empty note is unchanged.
- **Test plan:** extend `test-goal-weight.js`, or new `test-weight-trend.js`, with the real `renderSparkline`. Sabotage: α = 1.
- **Files:** `index.html` (40780–40860), `sw.js`, the test.
- **Risk:** range filter and goal line. Guarded by `test-analysis-trend-range.js`, `test-goal-weight.js` and `test-metric-trend-cards.js`.
- **Tools:** `dataviz`.
- **Status:** ready

### BL-17: Estimated expenditure from your own logs (read-only)
- **Why:**
  - `computeTargets` (32973) is static Mifflin–St Jeor × activity.
  - MacroFactor estimates expenditure from intake plus the trended weight change, and needs 2–3 weeks ([help 109](https://help.macrofactorapp.com/en/articles/109-how-frequently-do-i-need-to-log-my-weight-for-the-expenditure-algorithm-and-weekly-coaching-updates)).
  - Both inputs already exist: `fetchFoodDays` (40450) and `weight-log` (38296).
- **Change:**
  - A pure function, `estimateExpenditure(foodDays, weightEntries, todayKey)`, over the last 28 days, or at least 14:
    - average intake on logged days, minus (Δ trend lb × 3500) / days;
    - 3500 kcal/lb is the standard approximation, labelled as one in the UI.
  - It needs ≥ 14-day span, ≥ 80% of days with food logged, and ≥ 2 weigh-ins in each half of the window. Otherwise it returns `{reason}`.
  - It shows one line under the weight trend: "From your logs: about 2,600 cal/day (formula: 2,450). Intake 2,410 avg, trend −0.4 lb/wk." Or the reason it can't say yet.
  - No target changes. That's BL-27.
- **Acceptance criteria:**
  1. A fixture with 2,400 cal/day and trend −0.5 lb/wk over 21 days gives 2,650 (±10).
  2. 9 of 14 days logged gives reason "Log food on more days…".
  3. The rendered line contains both numbers.
- **Test plan:** new `test-expenditure-estimate.js`. Sabotage: drop the logging-coverage rule.
- **Files:** `index.html` (near 40795, 40450), `sw.js`, the test.
- **Risk:** the Analysis weight card layout. Same guards as BL-16.
- **Tools:** `dataviz`.
- **Status:** ready (after BL-16)

### BL-18: One-tap recent foods
- **Why:**
  - Food logging happens several times a day. Today every repeat food costs search → select → add.
  - MacroFactor competes on tap counts (research §2, FLSI, self-reported).
  - No recents exist. Re-checked: "recent" only appears in AI-prompt averages (42462, 42721).
- **Change:**
  - `buildRecentFoods(days)` reads `foodlog:*` for the 14 days before `selectedLogDate`.
  - It ranks by count, then by recency, de-duplicates on `baseName || name`, and keeps the top 8.
  - It renders as a chip row under `#foodSearchInput` (6318) while the search box is empty.
  - Tapping a chip calls the existing `addFoodToLog(item, 1)` (37413). There's no new storage.
- **Acceptance criteria:**
  1. With fixtures where "Greek Yogurt" was logged on 5 days, it is the first chip.
  2. **One** click on a chip adds exactly one entry to `todaysFoodLog`, with that item's macros (tap-count assertion).
  3. Chips are hidden while the search input has text.
  4. Each chip is ≥ 44 px tall and has an `aria-label` of "Add <name>".
- **Test plan:** new `test-food-recents.js`, with the real `addFoodToLog`, `saveFoodLog` and `renderFoodLog`. Sabotage: rank by recency only, and criterion 1 fails.
- **Files:** `index.html` (6318, 37413, 37719), `sw.js`, the test.
- **Risk:** the food log. Guarded by `test-food-log-portions.js`, `test-food-log-macro-expand.js`, `test-log-2-0.js` and `test-food-add-confirmation-pop.js`.
- **Tools:** `impeccable harden`, `apple-hig`.
- **Status:** ready

### BL-19: "Repeat yesterday" adds single items, even after you've started the day
- **Why:** Repeat yesterday exists (button 6313, `updateRepeatYesterdayVisibility` 37668, handler 37686). It hides once anything is logged and copies all or nothing. The research's "missing" verdict missed it. Extending it beats a parallel feature (CLAUDE.md, "Consolidate duplication").
- **Change:**
  - On an empty day, the button keeps its whole-day behaviour.
  - On a non-empty day, the same button reads "Add from yesterday" and is shown whenever the prior day has entries.
  - Tapping it expands a list of the prior day's items, rendered through the existing `buildFoodResultRows` (36362), so adding uses the same path as search.
- **Acceptance criteria:**
  1. On an empty day, a click copies every item, as today.
  2. On a day with 1 item, the button reads "Add from yesterday" and is visible.
  3. A click shows N rows, one per prior-day item.
  4. Adding one row appends exactly one entry, and the prior day's stored log is unchanged.
- **Test plan:** extend `test-log-2-0.js`, or new `test-repeat-yesterday-items.js`. Sabotage: hide the button when non-empty.
- **Files:** `index.html` (6313, 37668–37702, 36362), `sw.js`, the test.
- **Risk:** the food log and the backdating label (37679). Guarded by `test-backdating.js` and `test-log-2-0.js`.
- **Tools:** `impeccable clarify`.
- **Status:** ready

### BL-20: Per-muscle weekly set ledger in Analysis (fractional counting)
- **Why:**
  - Volume is counted by category group (`MUSCLE_GROUP_MAP` 45233), so chest and side delts share a number, and landmarks are coarse (45253).
  - About 10+ sets per muscle per week for hypertrophy [ACSM26]. Fractional counting (primary 1, synergist 0.5) fits best [PEL].
  - This is the audit's single biggest bar-raiser (§5) and research #1.
- **Change:**
  - An `EXERCISE_MUSCLES` map (`{p:[...], s:[...]}`) for every exercise in `strength`, `bodybuilding`, `powerbuilding` and `powerlifting`, across all day-count variants. Muscles: chest, lats, upper back, front/side/rear delts, biceps, triceps, quads, hamstrings, glutes, calves.
  - A pure function, `computeWeeklyMuscleSets(corpus, weekStartKey)`, built on `readExCorpus` (41014).
  - Rendered inside the existing Weekly Volume card, below the group rows, in `renderVolumeTrend` (45482): one row per muscle, "Chest 7.5 / 10+", reusing `vol-landmark` statuses.
  - The existing group rows are unchanged.
- **Acceptance criteria:**
  1. A fixture week of Bench 4 sets plus Incline DB Press 3 sets gives chest 7, triceps 3.5 and front delts 3.5.
  2. The rendered card has one `.muscle-ledger-row` per muscle with sets > 0.
  3. Every exercise named in those four programs has an `EXERCISE_MUSCLES` entry, as a coverage assertion.
- **Test plan:** new `test-muscle-ledger.js`. Sabotage: count synergists as 1.
- **Files:** `index.html` (45233–45270, 45482–45550), `sw.js`, the test.
- **Risk:** the Analysis card. Guarded by `test-analysis-2-0.js`, `test-analysis-collapse.js` and `test-analysis-export.js` (which reads the rendered cards).
- **Tools:** `dataviz`.
- **Summit note (summit 2026-11-07):** Build it **once**, to `design-vision.md` §3.6 (summit R8): fractional figures shown with decimals, a "10+" floor [ACSM26] with no ceiling drawn, grey under the floor, the day's ink inside it. UX-10 then *moves* this renderer rather than redrawing it. No "add sets" advice here; that's BL-31 or BL-39.
- **Alignment note (2026-11-07, exercise-auditor N3):** the ink fill **stops growing at the floor**: a muscle at 10 and a muscle at 25 show the same full bar. Above about 20 fractional sets, show one neutral line: "More isn't needed; returns get smaller [PEL]." Add a criterion: fixtures at 10 and at 25 sets render equal fill widths, and the 25 case shows the line.
- **Status:** ready

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
- **Why:** consensus supports deloading early on fatigue signals [BELL23]. `buildProgramFitInsight` (27590) already detects `overreaching`, and `manualDeloadEnabled` (30181) already exists in Settings, two taps deep.
- **Change:** when the program fit status is `overreaching` (27637), and this isn't a deload week, and manual deload is off, Today's priorities shows "Your logs suggest a deload. [Take it this week]". The button sets the same flag and storage key as `#manualDeloadToggle` (`manual-deload-pref`, 30198) and re-renders.
- **Acceptance criteria:**
  1. Overreaching fixture: the row shows, and one click makes `manualDeloadEnabled === true` and stores `'1'`.
  2. Thriving: no row.
  3. Already a deload week: no row.
- **Test plan:** extend `test-manual-deload-override.js`. Sabotage: skip the deload-week check.
- **Files:** `index.html` (14616, 27590–27640, 30181–30200), `sw.js`, the test.
- **Risk:** Today priorities ordering. Guarded by `test-today-priorities.js` and `test-manual-deload-override.js`.
- **Status:** ready

### BL-24: Increments scale with strength (M-3)
- **Why:** `CATEGORY_LOAD_INCREMENT` (27463) gives a fixed 10 lb on squat, hinge and oly. That's +7.4% on a 135 lb squat and +2.2% on a 455 lb one. Olympic lifts on a 10 lb Epley-based double progression scored **F** (audit scorecard) [PRAC].
- **Change:**
  - `getLoadIncrement(category, e1rm)` returns `max(table floor, e1rm × p)`, with p = 2.5% for lower body and 2% for upper compounds, snapped by `snapToLoadable` (32740).
  - Isolation stays at the floor.
  - The `oly` floor becomes 5 lb.
  - Callers at 27504, 27518 and 27836 pass `recentBestE1RM`.
- **Acceptance criteria:**
  1. Squat with e1RM 455 gets a +10 lb step (≈11.4, snapped).
  2. Squat with e1RM 135 gets +5 lb.
  3. Snatch gets +5 lb.
  4. Lateral Raise stays at its table value.
- **Test plan:** extend `test-all-set-double-progression.js`. Sabotage: ignore the e1RM.
- **Files:** `index.html` (27463–27470, 27500–27530, 27836), `sw.js`, the test.
- **Risk:** same guards as BL-08, plus `test-warmup-ramp-and-plates.js` for snapping.
- **Alignment note (2026-11-07):** the strength-scaled increment never applies to `medical` or `senior`: they keep BL-02's smallest loadable jump. Add a criterion asserting it (an e1RM of 200 on hypertension Seated Cable Row still gets the smallest jump).
- **Status:** ready

### BL-25: Exercise cue corrections (L-1, audit §4)
- **Why:** these cues contradict the evidence:
  - Hip Thrust's EMG claim (`content-exercises.js:251`) [PLOT23];
  - DB Curl "lowering is where most growth happens" (234) [DUR15];
  - Leg Press "about 90°" (260) [LEN];
  - Deadlift "legs first, then extend the hips" (236).

  Filler cues on Lateral Raise (257), Dragon Flag (173), Front Lever (171), Dip (168) and L-sit have no instruction. Muscle-up (170) lacks its prerequisite.
- **Change:** text only, with exactly the rewrites listed in audit §4.
- **Acceptance criteria:** each rendered cue list contains its new line, and the old phrases ("EMG research ranks", "most of the growth", "about 90°", "legs first") are absent from `exerciseInfo`.
- **Test plan:** extend `test-safety-cues.js`, or new `test-cue-corrections.js`. Sabotage: restore one.
- **Files:** `content-exercises.js`, `sw.js`, the test.
- **Risk:** cue caps. Guarded by `test-concise-cues.js` and `test-masterclass-technique-render-consolidation.js`.
- **Status:** ready

### BL-26: Plateau message names the stall and offers choices
- **Why:** long-term progression is Fitbod's top complaint (research §4). Today a stall is silent until the RPE-9 deload signal fires (27485–27497). GZCLP changes the rep scheme before cutting load [PRAC].
- **Change:** a new signal, `stall`, in `analyzeProgressionSignal`: 3 sessions at the same weight with `minRepsAtTop` not rising, and not RPE ≥ 9 (that's still `deload`). The badge offers three named options, as text:
  - "drop to the bottom of the range and add a set";
  - "swap variation (see substitutes)";
  - "micro-load +2.5 lb".

  Nothing changes automatically.
- **Acceptance criteria:**
  1. A fixture with 3 flat sessions gives `type 'stall'`, and the badge contains all three options.
  2. 3 flat sessions at RPE 9+ still give `deload`.
- **Test plan:** extend `test-all-set-double-progression.js`. Sabotage: remove the RPE exclusion.
- **Files:** `index.html` (27477–27545, 27742–27800), `sw.js`, the test.
- **Risk:** same as BL-08. Depends on BL-08's `minRepsAtTop`.
- **Status:** ready (after BL-08)

---

## Needs owner (in priority order)

### BL-27: Weekly calorie check-in that can update your target
- **Why:** this turns BL-17's estimate into MacroFactor's core loop (research #2).
- **Change:**
  - On the first day of each week, if `estimateExpenditure` is valid and differs from `computeTargets().tdee` by ≥ 100 cal, Today shows "Update your calorie target to X?"
  - Accepting stores an override under a new key, `nutrition-target-override`, which `computeTargets` (32973) respects.
  - `computeDeficitGuardrail` (14446) still applies.
- **Acceptance criteria:**
  1. Accepting writes the key, and `computeTargets` returns the new calories.
  2. Declining writes nothing.
  3. The guardrail still fires below 70% of the estimate.
- **Test plan:** new `test-calorie-checkin.js`. **Risk:** a new stored key, and targets everywhere change. **Files:** `index.html`, `sw.js`, the test.
- **Status:** needs-owner. **Question:** "May the app store a calorie-target override from your logged intake and trend weight, offered once a week and only applied when you tap Accept?"

### BL-28: Saved meals
- **Why:** MacroFactor and Cronometer offer saved meals (research §5). There's no equivalent here. "My Foods" (`custom-foods`, 35002) holds single items only.
- **Change:**
  - "Save as meal" on the current day's log, storing `{name, items[]}` under a new key, `saved-meals`.
  - Saved meals list inside My Foods. Tapping one adds all its items through `addFoodToLog` (37413).
- **Acceptance criteria:**
  1. Saving 3 items and re-adding the meal adds 3 entries with the same macros.
  2. Deleting a meal leaves the logged days untouched.
- **Test plan:** new `test-saved-meals.js`. **Risk:** a new stored shape, and the backup/restore round-trip. **Files:** `index.html`, `sw.js`, the test.
- **Status:** needs-owner. **Question:** "OK to add a new saved-meals list (new stored data, included in backups), shown inside My Foods?"

### BL-29: Import history from Strong or Hevy CSV
- **Why:** this is what lets someone with years of history switch (research #5).
- **Constraint:** history is keyed by program slot position (`exKey` 26990), so imported sets have no natural slot.
- **Change:**
  - A parser for the CSV.
  - A review screen mapping names to `exerciseInfo`, with unmatched names listed.
  - Writes go to the slots the owner chooses.
  - PRs are rebuilt with `reconstructAllPRs` (41641).
- **Acceptance criteria:** a sample file maps known names, and lists unknown names without writing them.
- **Test plan:** `test-strong-hevy-import.js` against a real exported sample.
- **Risk:** this writes into existing logs, which is data shape and migration territory. Strong's and Hevy's exact CSV formats are unverified.
- **Status:** needs-owner. **Question:** "Should imported history attach to matching exercises in your current program's slots, or live in a separate 'Imported' archive that only feeds PRs and e1RM charts? Can you share one real export file to test against?"

### BL-30: The per-muscle ledger on Today
- **Why:** seeing "Chest 6 / 10" before leaving the gym is the audit's §5 differentiator against Fitbod. It builds on BL-20.
- **Change:** a compact ledger strip on Today for the active program's trained muscles this week.
- **Acceptance criteria:** after logging 3 bench sets today, the strip updates without a reload.
- **Test plan:** extend `test-muscle-ledger.js`.
- **Risk:** Today is the owner's most-seen screen.
- **Tools:** `impeccable layout`, `dataviz`.
- **Summit note (summit 2026-11-07):** The summit recommends **no**: keep the ledger in Progress. Today keeps one answer per screen (design-vision §9; summit R8).
- **Status:** needs-owner. **Question:** "Do you want a per-muscle sets-this-week strip on Today, or keep it in Analysis only?"

### BL-31: Weekly ±1-set rule per muscle, from your own performance
- **Why:** this is RP's core feature, at $34.99 a month (research §1). Here it's free and performance-driven [PEL][ROB24].
- **Change:** at week end, per muscle:
  - if every set hit its target reps at or below its RIR target, add 1 set next week, capped at +4 over the block;
  - if reps fell at the same load, remove 1 set.

  The state lives in `window.storage` under `muscle-volume-adj`. It applies render-time after `applyAccumulation`, only on the BL-01 allowlist.
- **Acceptance criteria:**
  1. A fixture week that meets targets adds 1 set to that muscle's first exercise next week.
  2. Medical programs are untouched.
- **Test plan:** new `test-muscle-set-autoreg.js`.
- **Risk:** this stacks with accumulation, deload and session-length trimming.
- **Status:** needs-owner. **Question:** "May the app add or remove one set per muscle each week based on how your logged sets went, capped at +4 per block and shown with its reason?"

### BL-32: Readiness changes the session, not just the note
- **Why:** research #3: "the suggestion lands in the set chips". This builds on BL-09 and BL-21.
- **Change:** when readiness is `caution`, today's RPE target is capped at 8 and the badge says why.
- **Acceptance criteria:** with caution, RPE mode week 4 shows RPE 8 and the reason.
- **Test plan:** extend `test-readiness-hrv.js`.
- **Risk:** suggested loads change on bad-sleep days.
- **Status:** needs-owner. **Question:** "On a 'caution' readiness day, should suggested loads drop automatically (cap at RPE 8), or only show a one-tap 'make today easier' option?"

### BL-33: Deload clock counts only weeks you actually trained (M-6, part 1)
- **Why:** `getMesocycleWeek` (14904) counts calendar weeks from `program-cycle-start`. A week off still advances the block toward the deload [BELL23].
- **Change:** a week counts only when it has ≥ 2 logged sessions.
- **Acceptance criteria:** with a fixture of 2 trained weeks, 1 empty week and 1 trained week, it is week 4, not week 5.
- **Test plan:** extend `test-program-cycle-start-backfill.js`.
- **Risk:** the owner's current week number may jump on the day it ships.
- **Status:** needs-owner. **Question:** "Should weeks with fewer than 2 workouts stop counting toward your 5-week block? Your current week number may change the day this ships."

### BL-34: e1RM uses logged RPE (M-4)
- **Why:** `estimated1RM` (27431) treats every set as taken to failure. 100×8 @ RPE 7 is about 10% under.
- **Change:** e1RM = w × (1 + (reps + 10 − RPE)/30) when RPE is logged.
- **Acceptance criteria:** 100×8 @ RPE 7 gives 137 (vs 127 today).
- **Test plan:** extend `test-pr-timeline.js`.
- **Risk:** every e1RM chart and PR shifts. Guarded by `test-pr-timeline.js` and `test-performance-delta-colours.js`.
- **Status:** needs-owner. **Question:** "Use RPE-adjusted e1RM everywhere (your e1RM charts and PRs will shift up), or only for RPE-mode load targets?"

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
- **Status:** ready

### BL-37: Rebuild the low day-count variants (H-3)
- **Why:** Bodybuilding 3-day doses chest at 3 sets a week and glutes at 0. Powerlifting 3-day trains each lift 1×/wk [ACSM26][PEL][FREQ19].
- **Change:** the audit's H-3 layouts: Bodybuilding 3-day becomes Full Body A/B/C, Bodybuilding 4-day gets appends, and Powerlifting 3-day gets a heavy main lift plus a volume lift each day.
- **Acceptance criteria:** computed weekly sets meet the H-3 targets (chest 9, back 12, ...) in a test using BL-20's ledger.
- **Risk:** this rewrites variant slots, so it needs `SCHEMA_VERSION` (7623) / `runMigrations()` (9070) for any history on those variants.
- **Summit note (summit 2026-11-07):** Priority rises: BIZ-01's quick start may route a 3-day "gain" stranger to Bodybuilding 3-day, which the audit scores F (summit F5, R9).
- **Alignment note (2026-11-07, exercise-auditor B3):** summit R9's guard only covers quick-start "gain" with 3 days or fewer, so a stranger who picks the program by hand still lands on an F. BL-37 and BL-38 are now part of the **Phase 3 hard gate** before any public step (roadmap slots 74–75), unless the owner records an alternative, such as hiding the 2–4 day bodybuilding variants.
- **Status:** needs-owner. **Question:** "Rewrite the 2-, 3- and 4-day Bodybuilding and 3-day Powerlifting variants (slot changes; past logs on those variants need a migration)?"

### BL-38: Bodybuilding d6 becomes "Upper Detail", plus appends (H-4)
- **Why:** chest, quads and lats get 1×/wk despite the program's claim. Side delts get about 4 sets [FREQ19][PEL].
- **Change:** the audit's H-4 rebuild of d6, plus the appends to d4 and d5.
- **Acceptance criteria:** chest, quads, lats and delts each 2×/wk, measured by the ledger.
- **Risk:** d6 slots are replaced, so a migration is needed. BL-12 fixes the copy in the meantime.
- **Status:** needs-owner. **Question:** "Replace Bodybuilding Day 6 with the 'Upper Detail' day (slot changes, needs a migration)?"

### BL-39: Append-only accessory volume: Strength & Size, Powerbuilding, Powerlifting (H-6, M-9)
- **Why:** Strength & Size runs chest 8, side delts 3 and hamstrings 6 at 1×/wk. Powerbuilding runs lats 3 and side delts 3 [ACSM26][LEN].
- **Change:** the audit's appends:
  - Strength & Size: d1 Lateral Raise; d4 Cable Fly and Overhead Triceps Extension; d5 Seated Leg Curl.
  - Powerbuilding: d4 Pull-ups; d6 Incline DB Press and Lateral Raise.
  - Powerlifting: d5 Face Pull.
- **Acceptance criteria:** the appended exercises are last on their days, all earlier `exKey`s are unchanged, and the ledger totals match the audit.
- **Risk:** about +6 minutes per affected session.
- **Status:** needs-owner. **Question:** "Append these accessories to your lifting programs (about +6 min on the affected days)?"

### BL-40: Hypertension isometrics and medical progression notes (M-7)
- **Why:** isometric wall squats ranked first for lowering resting BP [BP23]. LIFTMOR found supervised heavy loading safe in low bone mass [LIFT18]. Heavy slow resistance matches eccentric training for Achilles, with better adherence [ACH15].
- **Change:**
  - Append "Wall Squat (isometric) 4×2 min" to hypertension d5, with the cue "Breathe throughout; no breath-holding".
  - Add text notes to the osteoporosis and Achilles `basis`/`limits`.
- **Acceptance criteria:** the appended exercise is last on d5, earlier keys are unchanged, and the new text renders.
- **Risk:** a clinical plan's content changes.
- **Status:** needs-owner. **Question:** "Add an isometric wall-squat block to the hypertension plan, and supervised-progression notes to the osteoporosis and Achilles plans?"

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
- **Why:** builder flag, PR #63 (v3.518). `buildCoachChatContext` (`index.html` 42701) builds its volume line (42858–42868) from the goal alone. With goal "gain" on any of the 21 gated programs it tells Claude "the app is adding one set per exercise to their sessions", which has been false since BL-01; with goal "performance" it says compounds are capped at 3 sets, also false there. A coach told the app adds volume may advise against extra work the person actually needs, or explain a set count they don't see.
- **Change:**
  - Move the line into one pure helper, `goalVolumeContextLine(goal, program)`, beside `goalVolumeAdjustment` (26661). `buildCoachChatContext` calls it once.
  - When `!volumeModifiersApply(program)` (26752) and the goal is gain, lean bulk or performance: "Training volume: this program keeps its written set counts; the app doesn't add or cap sets by goal here. Don't assume extra goal volume."
  - On the four lifting programs and custom programs the text is unchanged, except that the performance line says what BL-07 made true: compounds in the hypertrophy rep range are capped at 3 working sets; heavy (≤ 5-rep) work and powerlifting and powerbuilding keep their sets.
  - The lose/recomp line is unchanged. Nothing else in the payload changes (CLAUDE.md fragile area: no `fetch`, `max_tokens` or `effort` change).
- **Acceptance criteria** (real invocations of the helper):
  1. `goalVolumeContextLine('gain','oly')`, `('gain','medical')` and `('performance','climbing')` contain "keeps its written set counts" and not "adding one set".
  2. `goalVolumeContextLine('gain','strength')` is byte-identical to v3.518's hypertrophy line (copied into the test as the snapshot), and so is a custom program key's.
  3. `('performance','strength')` mentions the hypertrophy-range cap and that heavy work keeps its sets.
  4. `('lose', <any program>)` equals v3.518's lose/recomp line; `('maintain','strength')` is `''`.
  5. `buildCoachChatContext` makes exactly 1 real `goalVolumeContextLine(` call, passing `activeProgram`, and contains no "adding one set" literal of its own (comments stripped).
- **Test plan:** extend `test-coach-chat-context.js`. Sabotage: drop the gate check, and criterion 1 must fail.
- **Files:** `index.html` (26661 area for the helper; 42858–42868), `sw.js`, `test-coach-chat-context.js`.
- **Risk:** the AI path is a CLAUDE.md fragile area; only the prompt string changes. Guarded by `test-ai-cross-metric-effort-fix.js` and `test-coach-chat-context.js`.
- **Tools:** `Skill: claude-api` (prompt wording only).
- **Status:** ready (after BL-07)

### BL-66: The phase tag stops saying "Accumulation" where no block sets are added (BL-01 follow-up)
- **Why:** builder flag, PR #63 (v3.518), foreseen in BL-01's Risk line. `mesocyclePhaseTag` (`index.html` 26774) labels weeks 1–4 "Week N of 5 · Accumulation" on every program. Its own comment says it names a phase only when `applyAccumulation` really implements it (26768–26773), and since BL-01 `applyAccumulation` does nothing on the 21 gated programs. The tag now makes the claim the comment forbids.
- **Change:**
  - `mesocyclePhaseTag(cyclePos, inDeloadWeek, program)`: outside a deload week, when `!volumeModifiersApply(program)`, the text is "Week N of 5" with no phase word. Deload weeks keep "· Deload" everywhere (deload still runs on every program).
  - The one call site, `renderWorkout` (28710), passes `activeProgram`.
- **Acceptance criteria** (real `mesocyclePhaseTag` with the real `volumeModifiersApply`, `VOLUME_MODIFIER_PROGRAMS`, `isCustomProgramKey`, `DELOAD_CYCLE_WEEKS`):
  1. `(3, false, 'medical')` → text `Week 3 of 5`, class `mesocycle-phase-tag`.
  2. `(3, false, 'strength')` and a custom program key → `Week 3 of 5 · Accumulation` (unchanged).
  3. `(5, true, 'medical')` → `Week 5 of 5 · Deload`, class `mesocycle-phase-tag deload` (unchanged).
  4. Every program in `Object.keys(programs)` outside the allowlist gets no "Accumulation" in weeks 1–4 (iterate; assert 21).
  5. `renderWorkout` makes exactly 1 real `mesocyclePhaseTag(` call, and it passes `activeProgram`.
- **Test plan:** extend `test-mesocycle-phase-tag.js`. Sabotage: drop the program check, and criteria 1 and 4 must fail.
- **Files:** `index.html` (26774–26777, 28710), `sw.js`, `test-mesocycle-phase-tag.js`. **Re-pin:** `test-today-priorities.js` line 66 asserts the literal call `mesocyclePhaseTag(cyclePos, inDeloadWeek)`, which the new third argument breaks; update it to the three-argument form and name it in the PR.
- **Risk:** the day header. Guarded by `test-mesocycle-phase-tag.js`, `test-session-actions.js`, `test-up-next.js` and `test-today-priorities.js`.
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
  - A `SCHEMA_VERSION` (7625, now 8) bump, with a `runMigrations()` (9084) step that **copies nothing it can't attribute**:
    - entries with `n` move to the key whose slot holds that name;
    - legacy entries stay where they are.
- **Acceptance criteria:**
  1. Migrating a store with `n`-stamped entries for two day counts produces two keys, each matching its slot's name.
  2. Legacy entries are byte-identical after migration.
  3. `parseExKey` labels a v6 combat key with the v6 day's exercise.
- **Test plan:** new `test-variant-history-keys.js`, with the real `runMigrations` over a fixture store. Sabotage: drop the `n` check, and criterion 2 must fail.
- **Files:** `index.html` (7625, 9084, 27027–27045, 27117, 40977), `sw.js`, the test. **Re-pins:** `test-custom-exercise-style-scoping.js`, `test-import-backup-full-replace.js` and `test-whats-new.js` read `SCHEMA_VERSION` or `runMigrations`. `test-cross-program-history.js` and `test-watersports-program.js` call the key functions.
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

### BL-54: One exercise, one name in History, PRs and the warm-up fallback (D-3)
- **Why:** the same lift under two names splits grouping:

  | Name | Other name |
  |---|---|
  | Squat (68 slots) | Back Squat (17) |
  | Bench Press (58) | Flat Bench Press (7) |
  | Seated Cable Row (49) | Cable Row (18); bodybuilding uses both (d2 9820, d6 9871) |
  | Farmer's Carry (51) | Farmers Carry (Heavy) (9) |
  | Standing Calf Raise (16) | Calf Raise (40) |

  Switching between the Olympic or Hyrox program and Strength & Size loses "last time", the warm-up basis and a single PR line.
- **Change:**
  - `EXERCISE_CANONICAL = {'Back Squat':'Squat', 'Flat Bench Press':'Bench Press', 'Cable Row':'Seated Cable Row', 'Farmers Carry (Heavy)':"Farmer's Carry", 'Calf Raise':'Standing Calf Raise'}` and `canonicalExName(n)`.
  - Used **only** in `groupCorpusByExercise` (41524) and `getExerciseLocationIndex` (27090).
  - Slot names, cues, `EXERCISE_SUBS` (13709), keys and logs are unchanged.
- **Acceptance criteria:**
  1. A corpus with one Back Squat entry (oly) and one Squat entry (strength) gives one group named "Squat", with 2 entries and both day labels.
  2. The cross-program warm-up fallback for strength d2 Squat finds an oly Back Squat log.
  3. Without aliased names, the output is identical to today.
- **Test plan:** extend `test-cross-program-history.js` and `test-pr-timeline.js` with real functions. Sabotage: empty the map.
- **Files:** `index.html` (41524, 27090, the new const beside `EXERCISE_SUBS` 13709), `sw.js`, tests. **Re-pin likely:** `test-pr-timeline-class-naming.js:87` asserts `/Back Squat/` in the rendered PR row, and its fixture's only exercise is Back Squat, so the row will now read "Squat". `test-pr-timeline.js` uses Back Squat in two programs; it asserts dates and weights, not names, so it's expected to pass. Also run `test-app-2-0.js` and `test-performance-delta-colours.js` (both extract `groupCorpusByExercise`).
- **Risk:** PR timelines merge. A heavier Back Squat PR from the Olympic program now counts for Squat, which is right for the same bar.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; the re-pin was found. Placed after MKT-06a (slot 19a), so the Year in Lifting deadline isn't pushed back; MKT-06b gets the merged names.
- **Status:** ready

### BL-55: Cardio rows show a distance field only when distance is the measure, and it never blocks a finished set (D-5)
- **Why:**
  - `isDistanceExercise` (32584) is "category is cardio". The real-set check (`hasRequiredDistance`, 32044) requires a distance. So the rest timer and the gym-mode offer never fire on Burpees (29 slots), Battle Ropes (39), Wall Balls (13), Burpee Broad Jumps (9), Agility Ladder, every Jump Rope drill (82) and the jump-rope warm-up (105) until a distance is typed.
  - At least 147 cardio slots prescribe no distance at all.
- **Change:**
  - `isDistanceExercise(exName, setsStr)` is true when the prescription contains a distance unit (`\d\s*(m|yd|km|mi)\b`), or the name matches `/Run|Jog|Ride|Spin|Swim|Walk|Row|SkiErg|Sled|Strides|Repeats/`.
  - All three callers pass the sets string: `renderWorkout` 28767, `wireSetsBlock` 31871, and the Analysis weekly-distance card 45650 (`exDef.sets`).
  - `hasRequiredDistance` is dropped from `isRealSet` (32044–32045): reps or minutes alone complete a cardio set. The distance stays optional and is still saved.
- **Acceptance criteria:**
  1. Burpees `4×10`: no distance input renders. Logging reps starts the rest timer (`startRestTimer` stub called once).
  2. `400m Repeats`: the distance input renders, and logging the time alone starts the timer.
  3. `Easy Run 25-30 min` keeps its distance field and pace display.
  4. The Analysis weekly distance is unchanged for the same corpus.
- **Test plan:** new `test-cardio-distance-gate.js`, with the real `wireSetsBlock` and `isDistanceExercise` in jsdom. Sabotage: restore the old predicate, and criterion 1 fails.
- **Files:** `index.html` (32584, 28767, 31871, 32040–32046, 45650), `sw.js`, the test. **Guards:** `test-partial-set-reactions.js` (lines 147–170: distance alone must still not fire, and distance plus reps must fire; both stay true) and the six other `wireSetsBlock` suites (they stub `isDistanceExercise = ()=> false`, so the new argument is harmless). `test-exercise-logger.js` asserts the Up Next logger hides distance on a lift, so run it.
- **Risk:** the pace and distance display and the cardio Analysis card. The suites above guard it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The third caller (45650) was added.
- **Status:** ready

### BL-56: `noWeight` on moves that never take load, and load on the ones that do (D-4)
- **Why:**
  - At least 98 slots of pure bodyweight moves show a weight field. Examples:
    - Core d1 (`index.html` 10040–10043): Bird Dog, Dead Bug, Side Plank and McGill Curl-up;
    - the Bodyweight program (10095): Glute Bridge, Bodyweight Squat, Jump Squat, Push-up to Plank and Bicycle Crunch;
    - Jump Rope Bodyweight Squat (15 slots) and Single-Leg Bound (12).
  - The Bodyweight program's push, pull and leg moves show one too, against its "no equipment" overview.
  - A weight is required before the set counts (`hasRequiredWeight`, 32043), so the rest timer doesn't start.
  - 17 exercises are `noWeight` in some slots and not in others.
  - Wall Balls (a loaded ball) and Sled Pull are `noWeight`, while Sled Push isn't.
- **Change** (slot field only; keys and logs unchanged):
  - Add `noWeight:true` to every slot of Bird Dog, Dead Bug, Side Plank, McGill Curl-up, Glute Bridge (Bodyweight program), Bodyweight Squat, Jump Squat, Push-up to Plank, Bicycle Crunch and Single-Leg Bound.
  - In the **Bodyweight** program and its variants, add it to Push-up, Pike, Decline Push-up, Triceps Dip, Inverted Row, Chin-up, Pull-ups (or assisted), Nordic Curl, Bulgarian Split Squat and Calf Raise.
  - Remove `noWeight` from Wall Balls and Sled Pull.
  - **Calisthenics** keeps load fields on Dip, Pull-up and Muscle-up (weighted calisthenics is normal).
- **Acceptance criteria:**
  1. A real walk of every slot: none of the listed exercises in the listed programs lacks `noWeight`.
  2. Bodyweight d1 Push-up renders no weight input, and reps alone start the rest timer.
  3. Old entries with a weight still show it in History.
- **Test plan:** new `test-noweight-consistency.js` (a slot sweep over `programs` plus the variant tables, and one real `wireSetsBlock` case). Sabotage: drop one slot's flag.
- **Files:** `index.html` (program data 10034–10420 and the day-count variant tables), `sw.js`, the test. **Guards:** `test-partial-set-reactions.js:136` (reps alone finish a `noWeight` set), `test-configurable-training-days.js` and `test-volume-modifier-gate.js` (both walk the program data).
- **Risk:** an owner who logs weighted push-ups in the Bodyweight program loses the field there. That's the owner's call. Placed before BL-11 (slot 26a), because BL-11's rep progression applies to rows without a weight.
- **Status:** ready (owner yes 2026-11-08: "56 a"). Slot 26a, before BL-11.

### BL-57: The rest parser reads trailing multipliers, per-side mobility and swim repeats correctly (D-6, D-11; after BL-14)
- **Why:**
  - `getRepRangeTier` (27715) reads the first number after `×`, while `parseSetCount` (26424) already understands "N reps ×M". With the real `getDefaultRestSeconds` (27726):
    - 61 slots (`5 breaths ×3`, `6 reps ×3`, `3-5 min ×3`: yoga Flow and Hot, and all Tai Chi) get **240 s**;
    - about 100 slots of `2×5/side` mobility and technique drills (Hip CARs ×31, Shoulder CARs, World's Greatest Stretch, Pilates Saw, grappling passes, takedowns and submission drills) get 240 s;
    - Single-Leg Bound gets 90 s at `3×6/leg` but 240 s at `3×5/leg`;
    - `8×100m` swim gets 60 s, against its own cue's 15–30 s.
  - BL-14 (slot 25) fixes unit suffixes (`6×2min`, `6×40yd`). It doesn't fix trailing multipliers, per-side drills or swim repeats.
- **Change** (inside `getRepRangeTier` / `getDefaultRestSeconds`, on top of BL-14's unit branch):
  1. A trailing multiplier (`/^\d+(-\d+)?\s*(reps?|breaths?|min)[^×]*×\s*\d+\s*$/`) → tier `null`; rest 30 s for breaths and forms, 60 s otherwise.
  2. Category `core` or `shoulder` with `noWeight`, or a name in the mobility set (`EXERCISE_MOVE[name] === 'mobility'`, 13603) → never the strength tier; rest 45 s.
  3. Category `jump` → 90 s fixed (120 s for Depth Jump and Trap Bar Jump Squat).
  4. Swim repeats (`\d+×(\d+)m` with a swim name): ≤ 200 m → 20 s; 201–400 m → 30 s.
  5. `getRestReasonLabel` (27740) mirrors every branch.
- **Acceptance criteria:** `getDefaultRestSeconds` returns:
  - Downward Dog `5 breaths ×3` → 30;
  - Hip CARs `2×5/side` → 45;
  - Single-Leg Bound `3×5/leg` and `3×6/leg` → 90, both;
  - Swim Intervals `8×100m` → 20;
  - Bench Press `4×4-6` → 240 (unchanged);
  - Lateral Raise `3×12-15` → BL-14's value (unchanged by this item).

  The label agrees with the number in each case.
- **Test plan:** new `test-rest-tier-parsing.js`, with real functions over a table, plus a full-slot sweep asserting that no `core` or `shoulder` `noWeight` slot gets 240. Sabotage: remove branch 1.
- **Files:** `index.html` (27715–27746), `sw.js`, the test. **Re-pins:** the seven suites that extract the real `getDefaultRestSeconds` and `getRestReasonLabel` must also load `EXERCISE_MOVE`, or the new read must be guarded with `typeof EXERCISE_MOVE !== 'undefined'` (prefer the guard; then no suite changes). The suites are `test-auto-check-sets.js`, `test-backdating-rest-timer-suppression.js`, `test-fallback-entry-consolidation.js`, `test-partial-set-reactions.js`, `test-set-next-button.js`, `test-superset-rest-timer-suppression.js` and `test-superset-shared-sets-block-wiring.js`. `test-lb-per-kg-consolidation.js` extracts `getDefaultRestSeconds` for the calorie estimate; its Back Squat 3×5 case is unchanged.
- **Risk:** the rest timer for every program, and the time estimate (rest feeds `parseEstimatedMinutes`). The superset and backdating rest-suppression suites guard it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The `EXERCISE_MOVE` dependency and the seven suites were found. Placed straight after BL-14 (slot 25a).
- **Status:** ready (after BL-14)

### BL-58: Library entries for the Light and Speed variants; prune orphans (D-7, C-1, C-2; closes L-3)
- **Why:**
  - 7 names in 14 slots have no `exerciseInfo`: Squat (Speed) (e.g. 17221), Bench Press (Speed), Deadlift (Light/Technique), Snatch (Light), Clean & Jerk (Light), Sprint Intervals (Sub-Max) and Handstand Hold (wall) (Light). They get no cues, no category, no ledger counting, and a 5 lb default increment that pushes load on speed work.
  - 6 orphan cycling entries are referenced nowhere (`content-exercises.js` 150–157).
  - `EXERCISE_MOVE` (13603) has 3 duplicate keys, and 85 slot names have no icon key.
- **Change:**
  - Add entries with the base lift's category and three cues each, plus `technique:true`, which BL-02's technique rule reads (no load-increase signal):
    - Speed lifts: "50–60% of your working max; move it as fast as you can; stop if bar speed drops".
    - Light Olympic lifts: "about 70%; technique only; no misses".
  - Delete the 6 orphan entries.
  - Remove the duplicate `EXERCISE_MOVE` keys.
  - Add move keys for the 85 names, using existing `MOVEMENT_ICONS` (13087) keys only.
- **Acceptance criteria:**
  1. Every slot name has an `exerciseInfo` entry (full-slot sweep).
  2. `Squat (Speed)` maps to Legs (Quads) in the ledger.
  3. `analyzeProgressionSignal` (27514) never returns `increase` for a `technique:true` entry.
  4. No `exerciseInfo` key is unreferenced by slots, `EXERCISE_SUBS`, `SUBSTITUTION_MAP` (43948) or `REGION_RELIEF` (43996).
- **Test plan:** new `test-exercise-library-coverage.js` (the sweeps), plus a real-function progression case. Sabotage: delete one new entry.
- **Files:** `content-exercises.js`, `index.html` (13603–13700, `analyzeProgressionSignal` 27514), `sw.js`, the test. **Re-pin:** `test-concise-cues.js:42–45` pins exactly 321 exercises and 964 cues. This item adds 7 entries (21 cues) and deletes 6 (count their cues at build time), so update both numbers and say why in the PR. Its 24-word cap applies to the new cues. Also run `test-accumulation-accessory-add.js` and `test-volume-modifier-gate.js` (both read `exerciseInfo` categories).
- **Risk:** content only, apart from the technique flag. If BL-02's technique branch has landed, reuse it; otherwise add the flag check here.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; the `test-concise-cues.js` re-pin was found. Placed after BL-24 (slot 22a), because both touch the load increment.
- **Status:** ready (after BL-02)

### BL-59: Category corrections that feed the muscle ledger (D-8, with M-8)
- **Why:**
  - Band External Rotation (50 slots), Scapular Retraction (40) and Band Pull-Apart (7) count as **Core**.
  - Deep Squat Hold (27), Chair Pose, Horse Stance Hold and Bow Stance Transitions count as **Quads** sets, and they're eligible for accumulation.
  - Chaturanga (yoga) counts as **Chest & Shoulders**, with a +5 lb increment.
  - Wall Slides, Shoulder CARs and Band Dislocates count as Chest & Shoulders hypertrophy work.
  - Sprawl Drills count as Posterior Chain compound work.
  - The per-muscle ledger (BL-20) inherits all of this.
- **Change:** recategorise:
  - rotator-cuff and scapular moves → `shoulder`;
  - mobility holds and yoga or Tai Chi stances → `core`;
  - Sprawl Drills → `kick`.

  Land it in the same version as M-8's `calf` and `isolation-leg` categories, so `MUSCLE_GROUP_MAP` (45270) changes once.
- **Acceptance criteria:**
  1. Ledger fixture: a Mobility week of Deep Squat Holds adds 0 Quads sets.
  2. Accumulation never selects a recategorised exercise.
  3. Region flags: Band External Rotation flags Shoulder.
- **Test plan:** new `test-category-corrections.js`, with the real `MUSCLE_GROUP_MAP`, `applyAccumulation` (26780) and `CATEGORY_TO_REGIONS`. Sabotage: restore Deep Squat Hold to `squat`.
- **Files:** `content-exercises.js`, `index.html` (45270), `sw.js`, the test. **Guards:** `test-accumulation-accessory-add.js`, `test-volume-modifier-gate.js` (the jump-category rule) and the three search suites that read `MUSCLE_GROUP_MAP` (`test-global-search-techniques.js`, `test-search-2-0.js`, `test-search-index-freshness.js`).
- **Risk:** past weeks' Analysis group totals change (read-time; no stored data changes). Placed before BL-20 (slot 55a), so the ledger ships on the corrected categories.
- **Status:** ready (owner yes 2026-11-08: "59 a", with M-8). Slot 55a, before BL-20.

### BL-60: Substitutes that keep the same muscle and joint (D-9)
- **Why:**
  - In `EXERCISE_SUBS` (13709), Tibialis Raise → Standing Calf Raise / Calf Raise is the antagonist (13814).
  - Calf Raise and Standing Calf Raise → Leg Press puts a knee-and-hip compound in a calf slot (13772, 13780).
  - Farmers Carry (Heavy) → Sandbag Lunges goes from a carry to a lunge (13804).
  - `SUBSTITUTION_MAP` (43948) names 10 alternatives without `exerciseInfo`, so they show no cues when swapped in.
- **Change:**
  - Tibialis Raise → ['Heel Walk', 'Banded Dorsiflexion'].
  - Calf Raise → ['Standing Calf Raise', 'Single-Leg Calf Raise'].
  - Standing Calf Raise → ['Calf Raise', 'Single-Leg Calf Raise'].
  - Farmers Carry (Heavy) → ['Suitcase Carry', "Farmer's Carry"].
  - Add `exerciseInfo` entries (category plus 3 cues) for the new names and the 10 `SUBSTITUTION_MAP` alternatives.
  - Stored substitute selections keep working: `applyExerciseSubs` (27058) applies the stored name regardless of the list.
- **Acceptance criteria:**
  1. Every `EXERCISE_SUBS` target shares the original's `MUSCLE_GROUP_MAP` group (sweep), except listed and justified pairs (Close-Grip Bench ↔ Dip; Olympic pulls → Deadlift).
  2. Every `SUBSTITUTION_MAP` alternative has an entry.
  3. A stored selection of "Leg Press" on a Calf Raise slot still renders and logs to its `:sub:leg-press` key.
- **Test plan:** extend `test-exercise-substitution.js`. Sabotage: restore the Tibialis pair.
- **Files:** `index.html` (13709–13830, 43948), `content-exercises.js`, `sw.js`, the test. **Re-pin:** `test-concise-cues.js:42–45` (exercise and cue counts rise by the new entries). **Guards:** BL-67's no-jump-crossing case in `test-exercise-substitution.js` (no new pair involves a jump) and `test-warmup-ramp-and-plates.js` (Leg Press ramps, unaffected).
- **Risk:** the existing substitution and swap tests guard it. Placed after BL-25 (slot 31a), with the other content fixes.
- **Fold-in (2026-11-08):** line numbers moved to v3.518; the cue-count re-pin was found.
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
- **Files:** `index.html` (11985, 12017–12047, 11001, 11014, 21110–21225), `content-exercises.js` (79), `sw.js`, the test. **Guards:** `test-concise-day-notes.js`, `test-configurable-training-days.js:807` (Sandbag Lunges by name; unaffected).
- **Risk:** clinical-content wording. BIZ-15's clinician review should see it.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The Hyrox variant rows were added. The prenatal fix is a rewrite, not a fourth cue, so the cue count holds.
- **Status:** ready

### BL-63: The time shown on Today counts the work, not just the rest (D-10, C-5)
- **Why:**
  - Today's `~N min` (28708) comes from `parseEstimatedMinutes` (26464) through `unitMinutes` (26585). It counts a distance interval as `count × rest`: `8×100m` swim = 8 min (confirmed: no `min` or `s` match, so it's 8 × 60 s), `4×200m` = 4 min, `6×400m` = 6 min, `6×500m` row = 6 min. Lifting sets count rest only.
  - The auditor measured 251 of 1,065 days showing under 0.6× their authored duration (Hyrox d6 is about 18 vs ~45).
  - The 30/45-minute session length (`SESSION_LENGTH_OPTIONS` 26542, `applySessionLengthLimit` 26889) trims against this number, so capped sessions overrun.
  - The authored `duration` is shown only on rest days (28585).
- **Change** (inside `parseEstimatedMinutes`, plus one day-level allowance in `totalMinutesForUnits` 26589):
  1. Distance sets: work time from a per-activity pace (run 6 min/km; row 2:05/500 m; ski 2:10/500 m; swim 2:00/100 m; sled and carry 0.5 min per 20 m), plus rest.
  2. Rep sets: add 3 s per rep (top of the range; ×2 for `/side` or `/leg`).
  3. One warm-up ramp allowance of 4 min per day, for the first `WARMUP_ELIGIBLE_CATEGORIES` (27690) compound.

  The authored `duration` is left alone (no data change). It's documented as a reference only.
- **Acceptance criteria:**
  1. `parseEstimatedMinutes({sets:'8×100m', name:'Swim Intervals (100s)'})` is 18 ± 2.
  2. The Strength d1 total is within ±15% of its authored ~55.
  3. The share of days under 0.6× authored drops below 5% (a full sweep in the test).
  4. A real `applySessionLengthLimit(exercises, 30)` on Strength d1 still keeps the protected main unit, and its `estimatedMinutes` ≤ 30 + one unit. That's a new case: no suite covers the cap today.
- **Test plan:** new `test-session-time-estimate.js`, with the real `parseEstimatedMinutes`, `parseSetCount`, `getDefaultRestSeconds`, `unitMinutes`, `totalMinutesForUnits`, `groupIntoUnits` and `applySessionLengthLimit`, plus the sweep. Sabotage: remove the distance branch, and criterion 1 fails.
- **Files:** `index.html` (26464–26515, 26583–26592, 26889 onward), `sw.js`, the test. **Re-pin:** `test-lb-per-kg-consolidation.js:32–36` asserts `estimateExerciseCalories` for Back Squat 3×5 at 200 lb = 109 kcal, and that runs through `parseEstimatedMinutes` (26521). The rep-time branch raises it, so re-capture the value from the real function and name it in the PR. The session calorie total on Today moves too; say so in What's New.
- **Risk:** how much the session-length cap trims changes for every program. Placed with BL-55 early in Phase 1 (slot 13d).
- **Fold-in (2026-11-08):** line numbers moved to v3.518. Criterion 4 was rewritten, because the suite it named tests layout, not the cap. The calorie re-pin was found.
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
- **Change** (render-time suggestions only; the block clock is `DELOAD_CYCLE_WEEKS` 14917 and `cycleWeekOf` 26756):
  1. **`longestRunLast30Days()`**, read from the existing cardio corpus. Running-category names: Easy Run, Long Run, Tempo Run, Recovery Jog, Warm-up Jog, Cool-down Jog, Strides, 400m Repeats. Reuse `readExCorpus` (41051) and `groupCorpusByExercise` (41524); don't add a new reader.
  2. **Long Run badge**, weeks 1–4: "Today's cap: X km (10% over your longest run in 30 days)". X = 1.10 × that longest run, snapped to 0.5 km or 0.25 mi. With no logged run, show the authored minutes only.
  3. **400m Repeats**, double progression on count before pace. 4 → 5 → 6 → 8 reps across build weeks, when every rep in the last session was within 3 s of the session's first rep. Above 8, suggest "move to 800s or 1 km reps" (text only). Coaching basis [PRAC].
  4. **Tempo Run**: +2 min per build week from the authored 20, capped at 30 min. Week 5 (deload) uses the authored value.
  5. **Weekly intensity check** on the Running Analysis card (`renderCardioTrend` 45685): minutes logged at Tempo or Repeats vs the total. Show "Hard share this week: N%" with the target "about 20%" [SS14]. Display only.
- **Acceptance criteria:**
  1. With logs whose longest run in the last 30 days is 10.0 km, the Long Run badge on a week-2 render reads 11.0 km. With the longest on day 31 only, the badge falls back to the authored text.
  2. 400m Repeats with a last session of 6 reps, all within 3 s, suggests 8. With one rep 5 s slower, it suggests 6 (hold).
  3. In a deload week, no cap or increase is shown, and BL-48's reduction applies.
  4. Nothing here writes an `ex:` key or a log entry. Snapshot the storage keys before and after a render.
  5. Non-running programs render byte-identical.
- **Test plan:** new `test-running-progression.js`. Use the real `readExCorpus` with a stubbed `window.storage`, the real badge builder, and a fake clock. Sabotage: drop the 30-day window, and criterion 1's day-31 case must fail.
- **Files:** `index.html` (badge builder near `buildProgressBadge` 27779; the Analysis cardio card 45633–45700), `sw.js`, the test. **Guards:** the suites that extract `readExCorpus` (`test-app-2-0.js`, `test-fetch-day-statuses.js`, `test-history-date-range-filter.js`, `test-performance-delta-colours.js`, `test-pr-timeline.js`, `test-pr-timeline-class-naming.js`), plus `test-deload-signal-week-awareness.js` and `test-today-workout-emoji.js` (both extract `buildProgressBadge`).
- **Risk:** the cardio corpus shape (distance in metres, minutes in reps). Don't touch `isDistanceExercise` here (that's BL-55). Ship after BL-48 and BL-55 (slot 38a).
- **Tools:** none extra.
- **Status:** ready (after BL-48)

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
  - `applyDeloadVolumeReduction` (26879) changes only strings with a leading set count (`hasNumericSetPrefix` 26550). In week 5, `6×400m` becomes 3×400m, but `Long Run 45-60 min`, `Long Ride (Zone 2) 90-120 min`, `Endurance Ride 45-60 min` and `Long Swim 30-45 min` stay full length.
  - So the deload cuts the intervals and keeps the biggest aerobic load. A deload typically cuts volume by about 30–50% [BELL23].
- **Change:**
  - In the deload branch only, rows whose `sets` is a pure duration (`/^\d+(\s*-\s*\d+)?\s*min\b/`) and whose category is `cardio` get their minutes × 0.7, rounded to 5. Warm-up and cool-down rows are excluded (`isWarmupOrCooldownUnit` 26600 already defines them).
  - `applyDeloadVolumeReduction(exercises, program)` gains the program, passed from its one call site (`renderWorkout` 28665), so `medical` days keep their authored durations.
  - The duration line's "(deload)" suffix (28704) already keys off `inDeloadWeek`, so no marker is needed.
- **Acceptance criteria:**
  1. Week 5: running d5 `Long Run 45-60 min` renders `30-40 min`, and road d6 `Long Ride (Zone 2) 90-120 min` renders `65-85 min`.
  2. Warm-up Jog `10 min` is unchanged.
  3. Weeks 1–4 are byte-identical to today.
  4. Lifting rows are unchanged (assert one Squat 4×4-6 against `test-mesocycle-phase-tag.js`'s expectations).
  5. A medical `Walking 20-30 min` row is unchanged in week 5.
- **Test plan:** new `test-deload-duration-cardio.js`, with the real `applyDeloadVolumeReduction`, `hasNumericSetPrefix`, `parseSetCount` and `replaceSetCount`. No suite extracts `applyDeloadVolumeReduction` today. Sabotage: remove the duration branch.
- **Files:** `index.html` (26879–26887, 28665), `sw.js`, the test. **Guards:** `test-deload-signal-week-awareness.js`, `test-manual-deload-override.js`, `test-mesocycle-phase-tag.js`.
- **Risk:** medical styles have walking rows; the program argument excludes them, in keeping with BL-01's clinical stance. Placed after BL-23 (slot 24a), with the other deload work.
- **Fold-in (2026-11-08):** line numbers moved to v3.518. The `deloaded` marker was dropped (the suffix already exists). The medical exclusion became a program argument and criterion 5.
- **Tools:** none extra.
- **Status:** ready

## Parked or later (not yet itemised)
- **M-8:** `calf` and `isolation-leg` categories. These shift `MUSCLE_GROUP_MAP` history groupings, so they need the owner. They now ship with BL-59 (needs-owner). BL-03 and BL-04 cover the safety half.
- **L-3:** closed into BL-58. At v3.518, "Squat (Speed)", "Bench Press (Speed)" and "Deadlift (Light/Technique)" have no `exerciseInfo` entries.
- **Program extensions, reserved IDs:**
  - BL-41 (placeholder): Powerlifting top single at RPE 8 with −10% back-offs, plus a meet-peak block;
  - BL-42 (placeholder): Olympic % bands and a miss counter;
  - BL-44 (placeholder): bodyweight progression ladders (H-8, second half);
  - BL-45 (placeholder): athletic jump and sprint metrics;
  - BL-49: unassigned.

  None of these is buildable until the auditor writes it in full. **BL-43, BL-46, BL-47 and BL-48 are now written** (running, cycling, swimming and the endurance deload); see the audit section above.
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
- **Why:** before any height, weight or age is entered, the Log tab shows "2169 cal left of 2169" as if it were the user's own target. It's `computeTargets` (32973) run on the defaults (30 years, 5'8", 160 lb; `userProfile` 32397). A number that looks personal but isn't is a trust problem for the people who log food (business.md §5.2).
- **Change:**
  - When the profile has never been saved, add one line under the calorie hero (`calHeroUnit`, 37820): "Estimate for a 30-year-old, 5'8", 160 lb. Add yours in Profile."
  - Values come from `userProfile`, so the line can't drift from the defaults.
  - The targets themselves don't change.
- **Acceptance criteria:**
  1. With no saved profile, the line renders and contains "Estimate".
  2. After `saveProfile` with real values, the line is gone.
  3. The calorie number is unchanged in both states. Assert it equals `computeTargets(userProfile).cal`.
- **Test plan:** new `test-placeholder-targets.js`, with the real `computeTargets` and the real render function behind 37820. Sabotage: always hide the line, and criterion 1 must fail.
- **Files:** `index.html` (6284, 32397–32412, 32973, ~37820), `sw.js`, the test.
- **Risk:** nutrition hero layout. Guarded by `test-nutrition-default-open.js` and `test-nutrition-macro-bar-colors.js`.
- **Summit note (summit 2026-11-07):** UX-13's Food summary must keep this line (add it to UX-13's checks).
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
- **Change:**
  - When an exercise has no history, the set sheet's target line (under "Target 4×4-6") adds: "First time: pick a weight you could lift for about 3 more reps than the target."
  - This is the same RIR language as BL-10. Copy only: no load number, no new logic.
- **Acceptance criteria:**
  1. Opening the sheet for an exercise with no logged sets shows the hint.
  2. Once one set is logged for that exercise, the hint is absent.
  3. Gym mode's sheet behaves the same.
- **Test plan:** extend `test-set-sheet.js`, with the real sheet open function. Sabotage: drop the history check, and criterion 2 must fail.
- **Files:** `index.html` (set sheet markup and its open function; grep `setSheetTitle`), `sw.js`, the test.
- **Risk:** low. If BL-10 changes the RIR wording first, reuse its string. Don't write a second one.
- **Summit note (summit 2026-11-07):** Pulled into Phase 2, before UX-06a. One string, shown in two places: the set sheet **and** the cover's empty state on a first-ever exercise. It reuses BL-10's wording (summit §1.2, R7).
- **Status:** ready (after BL-10)

### BIZ-06: AI entry points say they need a key before the tap
- **Why:**
  - Several prominent entry points all need the user's own Anthropic key (6630), which strangers won't have:
    - the coach button on every screen (`coachFab`, 7458);
    - the first Analysis card, "Generate insights" (6665);
    - Photo and Describe among the first five food buttons.
  - Today, each one says so only after the tap (`aiKeySetupPrompt`).
  - The core value (programs, progression) is what should lead.
- **Change:** when `getApiKey()` (41733) resolves empty:
  - the "Generate insights" button reads "Add an AI key to use this";
  - the AI card sorts below Training Trends in Analysis;
  - the Coach panel's intro line says "Needs your Anthropic key (Settings)".
  - With a key, nothing changes. No feature is removed.
- **Acceptance criteria:**
  1. With no key, the insights button text contains "key", and the Training Trends group precedes the AI card in DOM order.
  2. With a stub key, the button reads "Generate insights" and the order is as today.
  3. `generateCrossMetricInsights`'s request payload is untouched. Count one real `fetch` per call with a key, as in `test-ai-cross-metric-effort-fix.js`.
- **Test plan:** new `test-ai-entry-honesty.js`. Sabotage: ignore the key state, and criterion 1 must fail.
- **Files:** `index.html` (6630, 6665, 7458, 41733, Analysis card order), `sw.js`, the test.
- **Risk:**
  - Analysis order. Guarded by `test-analysis-2-0.js`, `test-analysis-collapse.js` and `test-coach-2-0.js`.
  - Don't touch the "fixed, unverified live" AI internals (CLAUDE.md).
- **Summit note (summit 2026-11-07):** This item owns "the AI card sorts below the evidence". UX-10 relies on it and doesn't repeat it (summit §1.4). Ships before UX-10.
- **Alignment note (2026-11-07, business-manager B1):** "your logs stay on your phone" is false for AI users unless it's disclosed. `generateCrossMetricInsights` (~42536) sends body weight, nutrition, sleep, water, RPE, pain check-ins and PRs to Anthropic with the user's key. So this item also adds, **at each AI entry point and in the key prompt (`aiKeySetupPrompt`)**, one line saying what that feature sends and to whom. For example, insights: "Sends your recent weight, food, sleep, effort, pain check-ins and PRs to Anthropic using your key." Photo and Describe: "Sends the photo or text to Anthropic using your key." Coach: "Sends your message and a summary of your training to Anthropic using your key."
  - **Extra criterion:** one jsdom assertion per entry point (insights button area, Photo, Describe, Coach intro, key prompt) that its disclosure line is present and names "Anthropic".
  - The payload stays untouched (criterion 3).
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
- **Status:** needs-owner. **Question:** "Put the app's own forwarded web address (not the GitHub Pages URL) on every share card and share message?" **Recommendation:** yes, once the name and its domain are settled; Phase 5, after the Phase 3 gate.

### BIZ-12: Go public: where, and under what name
- **Why:** with no store listing, a generic name and an empty README, nobody can find the app (business.md §5.1). The Capacitor track creates the store build; the business needs the owner's decision to list it.
- **Change:** none in code until answered. The answer unlocks BIZ-08 and BIZ-16 and the marketing launch plan.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §6.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:** going public turns the clinical programs into a health-claim question (BIZ-15) and requires a privacy policy (BIZ-16). Neither should lag the listing.
- **Status:** needs-owner. **Question:** "Do you want the app public after Phase 3 and its gates (web first, then Google Play via the Capacitor build, then the App Store), under the name you settle from `planning/naming.md`?" **Recommendation:** yes, in that order. The name decision itself is MKT-09 / consensus decision 10. Personal Play account, with founding members as the 12 testers for 14 days (business.md §6).

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
- **Status:** needs-owner. **Question:** "Publish a plain-language privacy policy listing exactly which services the app talks to?" **Recommendation:** yes. It's required for a listing and it's a selling point.

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
- **Status:** needs-owner. **Question:** "Before going public, add a one-time care-team acknowledgement to clinical programs and have their claims, tips and nutrient notes reviewed, by a clinician?" **Recommendation:** yes, a paid clinician before listing. Keep the programs, because they're a differentiator no competitor has.

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
- **Status:** needs-owner. **Question:** "Publish business.md §3.4's 'What's free' paragraph (with the safety clause and the coach sentence) in the app, the README and the landing page at public launch?" **Recommendation:** yes, at launch (Phase 5) and not before. The promise is what makes it safe for early users to commit years of logs.

### BIZ-18a: The free-list guard test
- **Why:** BIZ-18's criterion 4 (no lock, upgrade or "Pro" label in free areas) only protects the free list if it runs on **every** later build. Inside a needs-owner Phase 5 item it would run on none (business-manager, non-blocking; roadmap "Business priorities" asked for it).
- **Change:** test only. No copy, no markup, and nothing the person sees. The version still bumps (`automation.md` §4 step 9). The What's New entry says honestly that nothing visible changed: "Behind the scenes: a check that keeps everything you use today free."
- **Acceptance criteria:**
  1. Rendering the real Today, set sheet, program picker, History, Food, Analysis and export controls in jsdom finds 0 elements whose text, `aria-label`, class or `data-*` attribute matches `/\b(pro|premium|upgrade|unlock|locked)\b/i` or a lock glyph (🔒), apart from an explicit allowlist (for example "progress" or "program", which the word-boundary regex shouldn't hit anyway; the test lists any exception it allows).
  2. 0 elements carry `disabled` with a reason mentioning payment.
- **Test plan:** new `test-free-list-guard.js`. Sabotage: inject a `<span class="pro-badge">Pro</span>` into the program picker markup, and criterion 1 must fail.
- **Files:** `sw.js` (version), `index.html` (`APP_VERSION` and the `WHATS_NEW` entry only), the test.
- **Risk:** false positives on words like "progress" or "protein". The word-boundary regex and the named allowlist handle them; the test prints any match.
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
- **Status:** needs-owner. **Question:** "Promise a founding price (half of list, locked while subscribed, on the server-run subscription only) to everyone who trains with the app before the subscription is announced, and announce the promise at public launch?" **Recommendation:** yes. Offer no lifetime plan on hosted AI. Coach programs and the coach plan are priced separately (business.md §3.4, §3.8).

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
- **Status:** needs-owner. **Question:** "Replace '90 days of data' with the six triggers in business.md §3.5, and agree that no billing code is written until they all hold?" **Recommendation:** yes.

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
- **Status:** needs-owner. **Question:** "Plan on Play billing first, once the Capacitor build supports it, with web payments only if many users are on the iPhone PWA and there's no iOS build; and do you also want a 'support us' link now, with nothing locked?" **Recommendation:** yes to Play first, and no billing or server code before BIZ-21's triggers. The support link is optional; it's honest only if it says it pays for nothing extra.

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
  - `computeStreak` (13989) counts consecutive calendar days with a logged set. The first celebration and share card fire at 7 in a row (`STREAK_MILESTONES`, 14008).
  - Readiness warns "6 days without a rest day" one day earlier (`READINESS_DAYS_NO_REST = 6`, 46836). So the app tells you to rest, then throws confetti for not resting.
  - Anyone following a 3–5 day program can never reach the first milestone, so the main consistency share moment never happens for them.
  - Weekly consistency matches the north star: weekly active trainers, at least 2 sessions a week (business.md §4).
- **Change:**
  - Add `computeWeekStreak()` beside `computeStreak`, reading the same `activity-dates`. A week (Monday to Sunday, local) counts when it has at least `max(2, daysPerWeekPref − 1)` training dates, or 2 when the preference is unset. One missed planned day doesn't break it. The current week counts as alive until it ends (the same "still alive until midnight" rule `computeStreak` documents).
  - Milestones become weeks: `[4, 8, 12, 26, 52]`. The celebration reads "8 weeks in a row" with the sub "Rest days included." The card headline is "8 WEEKS IN A ROW".
  - The streak badge (`renderStreak`, 14057) shows weeks ("8 wk").
  - Reuse the `streak-last-celebrated` key; on first run, migrate it with `SCHEMA_VERSION`/`runMigrations()` to 0 so no old day-count blocks a week milestone.
  - `computeStreak` stays: it has another caller at 42680 (re-grep). It just no longer drives milestones or the badge.
- **Acceptance criteria:**
  1. Training dates on Mon/Wed/Fri for 4 consecutive weeks, with `daysPerWeekPref = 3`: `computeWeekStreak()` returns 4, and the 4-week celebration fires once.
  2. 7 consecutive training days and nothing before: no celebration (the old 7-day milestone is gone).
  3. A week with 1 training date, with the preference unset: the streak resets to 0 at the end of that week, not during it.
  4. A rest day never breaks the streak inside a qualifying week.
  5. A second render after a milestone doesn't celebrate it again.
- **Test plan:** extend `test-streak.js` with the real `computeStreak`, the new `computeWeekStreak`, `checkStreakMilestone` and a stub storage with fixed dates (stub `getTodayKey`). Sabotage: count consecutive days again, and criteria 1 and 2 must fail.
- **Files:** `index.html` (13910–14070, 25950, the migration list), `sw.js`, the test.
- **Risk:**
  - Changes a visible number people may be attached to. The What's New line must say why: "Your streak now counts training weeks, so rest days never break it."
  - Today's Priorities and the weekly recap may read the streak. Guarded by `test-streak.js`, `test-weekly-recap.js` and `test-today-priorities.js`.
- **Summit note (summit 2026-11-07):** Preferred implementation: a new namespaced key, `week-streak-last-celebrated`, through `window.storage`, with the old key left alone. That avoids a `SCHEMA_VERSION` bump just to reset a celebration counter (summit §1.7). The streak number lives in UX-11's strip; no confetti.
- **Status:** ready

### MKT-02: Share cards carry no body data by default
- **Why:** the week card's third row falls back from average sleep to **average body weight**, then **average intake** (`archiveCurrentWeek`, `index.html` 45451; the rows at 45499–45501). Body weight is the most sensitive number in the app, and it lands on a public image without the person choosing it. Sleep is also health data.
- **Change:**
  - The week card's third row becomes training-only: "PRs THIS WEEK" when there was at least one, else "SETS" (total logged sets that week). Sleep, weight and intake rows are removed from the card. (Owner decision D15: sets lead the cards.)
  - **Where the numbers come from (no second implementation):** PRs are the events from the existing `reconstructAllPRs()` (41678) dated inside the week; sets are the logged sets of `readExCorpus()` (41051) entries dated inside the week. Put both in one small async helper, `weekShareTrainingStats(weekStartKey)`, beside `computeWeekStats` (45417). Don't add them to `computeWeekStats` itself: `test-weekly-recap.js` runs `computeWeekStats` without the exercise corpus in its sandbox.
  - `archiveCurrentWeek` must stay free of inline `reduce(`: `test-weekly-recap.js` (line 46) pins that, so the summing lives in the helper.
  - Share text follows the card (it's built from `stats` in `shareCelebrationCard`, 29646).
  - The archived `weekStats` record (with `avgWeight`, `avgSleep`) is unchanged; only the share card changes.
  - No setting is added in this item. If people ask for body stats on cards, that's a later opt-in item.
- **Acceptance criteria:**
  1. With weight, intake and sleep all logged that week, the `stats` passed to a stubbed `shareCelebrationCard` (captured by clicking the real `#weekShareBtn` after the real `archiveCurrentWeek` runs with stub storage and stubbed AI digests) contain no label in {AVG WEIGHT, AVG INTAKE, AVG SLEEP}.
  2. With 2 PR events dated in the week (stubbed `reconstructAllPRs`), the third row is `{value:'2', label:'PRs THIS WEEK'}`; with none, it's `{value:'<n>', label:'SETS'}` where n is the fixture's set count (a real `weekShareTrainingStats` over a stubbed `readExCorpus`).
  3. With no logged sets and no PRs, the card has its two rows only (WORKOUTS, PROGRAM).
  4. `archiveCurrentWeek` still calls `computeWeekStats(todayMonday)` and contains no `reduce(` (the existing `test-weekly-recap.js` pin keeps passing).
- **Test plan:** new `test-share-card-privacy.js`. Sabotage: restore the weight fallback, and criterion 1 must fail.
- **Files:** `index.html` (45417 area for the helper; 45451–45508), `sw.js`, `test-share-card-privacy.js` (new).
- **Risk:**
  - Low. Guarded by `test-archive-week-visibility.js`, `test-week-progress.js` and `test-weekly-recap.js`.
  - `reconstructAllPRs` counts an exercise's first logged session as a record (its running max starts empty), so a week that starts a new program can show several "PRs". That's the PR timeline's own definition; the card reuses it rather than inventing a second one. Flag it to MKT-07, which names the record's kind.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; the data sources (`reconstructAllPRs`, `readExCorpus`) named, the `test-weekly-recap.js` constraints found, criterion 3 added. Scope unchanged.
- **Status:** ready

### MKT-03: Story-format share cards with the app's mark
- **Why:**
  - Cards are 1080×1080 (`buildShareCardBlob`, 29510). Instagram and WhatsApp stories, where achievement shares mostly go, are 9:16, so a square gets letterboxed.
  - The footer is the plain text "TRAINING LOG". The icon's ring mark, the most recognisable brand asset, appears nowhere on a card.
- **Change:**
  - `buildShareCardBlob(cardData, format)`: `format` is `'story'` (1080×1920, the new default) or `'square'` (today's layout, unchanged).
  - In story format, keep the icon, headline, detail and stats between y = 250 and y = 1620 (clear of the story UI at the top and bottom).
  - Draw the **Sash mark** (the shipped v3.516 icon: the five plate inks as one band on a `--ground` tile) as canvas rectangles, not an image file, at the bottom. **No wordmark in this version.** The `'TRAINING LOG'` footer text (~29608) is removed, not replaced. A reserved line stays under the mark for the wordmark (MKT-03b) and BIZ-08's address.
  - The file name is `${appSlug()}-<kind>-<YYYY-MM-DD>.png` (`liftnext-pr-2026-11-30.png` at v3.516). This item adds the one helper `appSlug()` beside `APP_NAME` (7622): `APP_NAME` lower-cased, with spaces as hyphens. MKT-20 reuses it for the backup file.
  - Colour and type follow `planning/design-vision.md` §3: a flat ink ground with no gradient or glow, the session day's spot ink as the one colour, Archivo for the big figure if UX-02 is approved, else Geist. If the vision's own card items land first, this item only adds the format and the mark to them.
- **Acceptance criteria:**
  1. With a stub canvas, `buildShareCardBlob(card)` sets `canvas.width === 1080` and `canvas.height === 1920`; with `'square'`, 1080×1080.
  2. In story format, every `fillText` call's y is between 250 and 1700 (stub-recorded).
  3. The Sash mark is drawn in both formats: exactly five `fillRect` calls inside the mark's box, whose `fillStyle`s equal the five target `--spot-*` inks from UX-01 (stub-recorded, in order).
  4. The square format's `fillText` calls equal today's for the same `cardData`, except the footer (record before and after; sabotage-anchored).
  5. No `fillText` string equals or contains "TRAINING LOG", "Training Log" or `APP_NAME` (in any case) in this version.
  6. The card's ground and spot ink come from `dayInk(id)` (UX-01b) for the session's day.
- **Test plan:** new `test-share-card-format.js`, with the real `buildShareCardBlob`, `wrapCanvasText` and `celebrationIconPath`, and a recording stub 2D context. Then render real PNGs in Playwright for the PR, streak and week cards in both formats and attach them to the PR. Sabotage: drop the format switch, and criterion 1 must fail.
- **Files:** `index.html` (29468–29640), `sw.js`, the test.
- **Risk:** visual. The design-engineer reviews the rendered PNGs. The name never appears in this version, so a rename can't strand printed cards.
- **Tools:** `Skill: impeccable` (`polish`, Markdown fallback only until the owner approves the engine) on the rendered cards.
- **Alignment note (2026-11-07):** the ring mark is replaced by the Sash mark (MKT-19 shipped as the icon in v3.516). **No wordmark until the public name is confirmed** (market-researcher B1, marketing-manager B1). The wordmark is MKT-03b. Builds the story frame (safe zones, mark tile, sponsor strip) so the bib (MKT-16) reuses it. Ships after UX-01b and, if approved, UX-02. Year in Lifting 2026 carries no address (consensus decision 16).
- **Summit note (summit 2026-11-07):** Draw it in the Plate & Press world from day one (flat ink ground, the day's spot ink, no gold glow), so cards are never redone (summit §1.4). It's on the Year in Lifting lane (roadmap slot 17).
- **Status:** ready (after UX-01b)

### MKT-03b: The wordmark on cards, once the name is confirmed
- **Why:** MKT-03 ships the mark alone so the Year in Lifting lane never waits on the name (consensus G1). Once the owner confirms the public name (after the USPTO knockout and buying its domain; marketing.md §2.1, §4.3), cards add it.
- **Change:** draw `APP_NAME` beside the Sash mark in the reserved line. Per marketing.md §3.4: one word, in capitals only beside the mark; on story cards the event band reads `[mark] NAME · PROGRAM · WK n`. Never a figure that reads as an instruction (no "NAME: 160").
- **Acceptance criteria:**
  1. Exactly one `fillText` call carries `APP_NAME.toUpperCase()`, and its x and y are inside the mark's row (stub-recorded).
  2. Changing `APP_NAME` in the extracted source changes the drawn text (no literal name in the card code: a real-code count of the literal is 0).
  3. All MKT-03 criteria, except 5, still pass.
- **Test plan:** extend `test-share-card-format.js`. Sabotage: hard-code "LIFTNEXT", and criterion 2 must fail.
- **Files:** `index.html` (the card builder), `sw.js`, the test.
- **Risk:** prints the name on images nobody can recall. That's why it waits for the owner.
- **Status:** ready (after MKT-03) (owner 2026-11-08: "name a": Platestep is confirmed, the USPTO knockout is clear and the domains are held).

### MKT-04: Share a finished session
- **Why:** finishing a session is the most frequent earned moment (every training day), and its celebration (`triggerCelebration('flag', 'Session complete!', …)`, 29263) has no share button. PR and streak celebrations already pass `shareData`.
- **Change:**
  - Pass `shareData` to that call: `{icon:'flag', headline:'SESSION COMPLETE', stats:[…]}`, with the day label ("Upper · Strength"), sets logged today on that day, the number of lifts, minutes when known (`workout-time:{date}` or the Gym clock; left out when unknown), and "PRs: n" when there was at least one.
  - **No total load by default** (alignment round: exercise-auditor N1, marketing-manager). Tonnage rewards extra easy sets [ROB24][PEL]. The pure builder may still return `load` for a later opt-in, but it isn't in `stats`.
  - No share data when `activeProgram` is a `MEDICAL_STYLES` key.
- **Acceptance criteria:**
  1. Completing the last exercise of a day with 18 logged sets calls `triggerCelebration` with `shareData.stats` containing `{value:'18', label:'SETS'}`.
  2. The `stats` labels are exactly {SETS, LIFTS, MIN} (MIN only when the fixture has a `workout-time` entry), plus PRs when present. No label matches /LOAD|VOLUME|LB|KG/.
  3. With a `MEDICAL_STYLES` program active, `shareData` is undefined.
  4. `triggerCelebration` is still called exactly once per completing click (count real calls).
- **Test plan:** new `test-session-share.js`, driving the real checkbox `change` handler in jsdom with stub storage. Sabotage: drop `shareData`, and criterion 1 must fail.
- **Files:** `index.html` (29240–29270), `sw.js`, the test.
- **Risk:** the 5-second banner hold applies whenever there's share data (29464), so the session banner stays up longer. That's intended; check it doesn't cover gym mode's exit control in Playwright.
- **Summit note (summit 2026-11-07):** Put the stats in a named pure builder (e.g. `sessionShareStats`) that UX-09's Share calls. Ship directly before UX-09a, so only the banner wiring is temporary (summit §1.4).
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
- **Files:** `index.html` (Today's Priorities near `getWeeklyRecapInsight` 14595 and `renderTodayInsights` 14615; History; 41641), `sw.js`, the test.
- **Risk:**
  - Larger than one usual increment. If it can't ship as one tested version, split it: (a) the computation and one summary card, (b) the remaining cards. Each its own version.
  - Depends on MKT-03 for the format. Ship MKT-03 first.
  - Time-critical: to land in December 2026 it needs to ship by 30 November.
- **Tools:** `Skill: dataviz` for any chart on the cards.
- **Summit note (summit 2026-11-07):** Ship as two versions. **06a** is the computation, the Priorities row and one summary card; target merged by 30 November (roadmap build 12). **06b** is the remaining cards, after MKT-01. Constraints: "biggest e1RM gain" excludes `oly`/`jump`/`throw` (Epley isn't valid there, SAF-2). No share buttons while a `MEDICAL_STYLES` program is active. Record wording per summit R6. If 06a slips, nothing else moves (summit R5).
- **Alignment note (2026-11-07):** 06a is roadmap slot 19. The 2026 cards carry the mark, the name only if it's confirmed by then (MKT-03b), and **no address** (the Phase 3 gate stays; December 2026 is a dogfood run, and December 2027 is the public moment). **06b has no "wall of bibs":** that moves to the 2027 recap, because MKT-16 ships after 06b.
- **Status:** ready (after MKT-03)

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
- **Change:** none until answered. If yes: factual comparison pages on the landing site (MKT-14) only, never in store keywords (stores restrict competitor names in metadata), with prices dated and sourced.
- **Acceptance criteria:** the owner's answer is recorded in `planning/marketing.md` §4.4.
- **Test plan:** none; a decision.
- **Files:** `planning/marketing.md`.
- **Risk:** trademark and comparative-advertising claims. Every claim must be checkable on the date it's published.
- **Status:** needs-owner. **Question:** "May we publish factual comparison pages that name Strong, Hevy and others (never in store keywords)?" **Recommendation:** yes, for one page with dated, sourced facts, and only after the CSV import (BL-29) exists, because that's what a switcher needs.

### MKT-13: Public launch posts and creator outreach
- **Why:** nobody can find the app (business.md §5.1). The launch plan (marketing.md §4.3) uses Product Hunt, the self-promotion threads of r/Fitness, r/weightlifting and r/xxfitness, r/PWA and r/SideProject, and evidence-based strength creators.
- **Change:** none in code. The posts go out under the owner's name.
- **Acceptance criteria:** the owner's answer is recorded in `planning/marketing.md` §4.3.
- **Test plan:** none; a decision.
- **Files:** `planning/marketing.md`.
- **Risk:** community rules (each sub's sidebar on the day), and the first impression: don't launch before BIZ-01 to BIZ-03 and BIZ-17 ship.
- **Status:** needs-owner. **Question:** "After the first-launch fixes ship, may we launch publicly (Product Hunt plus the designated self-promotion threads) and contact creators, with no paid placements?" **Recommendation:** yes, after BIZ-12 and BIZ-16.

### MKT-14: A landing page file
- **Why:** the README is the only landing page, and a GitHub repo page converts badly for people who don't use GitHub. The app itself is the Pages root.
- **Change:** none until answered. If yes: one static `about.html` beside `index.html` (no framework, no analytics, no third-party fonts), with the promise, screenshots, install steps and privacy facts. Not precached by `sw.js`.
- **Acceptance criteria:** the owner's answer is recorded here.
- **Test plan:** the follow-up item adds a test that the page makes no third-party requests.
- **Files:** later `about.html`, `README.md`.
- **Risk:** a new file beside `index.html`, which CLAUDE.md restricts. That's why it needs the owner.
- **Status:** needs-owner. **Question:** "Add one static landing page file (`about.html`) beside the app?" **Recommendation:** yes, alongside the privacy page (BIZ-16), so both live in the same place.

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
  - "Finished 58:12" is a race-style claim, and outside Gym mode there's no seconds data behind it (`gymElapsedMs`, 30312; `recordWorkoutTime` is minute-resolution, 13943);
  - its number came from `activity-dates`, which is pruned to 730 days (13906), so the number would stop rising after two years.
- **Change:**
  - A `'bib'` story layout inside `buildShareCardBlob` (MKT-03's `format` argument), used by MKT-04's session share. The square format keeps A's grid. Drawn on `<canvas>`: no new asset beyond UX-02's Archivo file (fallback: Geist).
  - **Ground:** the session day's plate ink, from `dayInk` (UX-01b). **Bib:** white, rotated 2.5°, four pin holes, and **one** event band in ink (marketing.md §3.4): `[Sash tile] NAME · PROGRAM · WK n` and the date, where NAME is `APP_NAME` only once MKT-03b has shipped (otherwise the tile alone).
  - **The number:** the training-day number from MKT-17's builder, captioned "your 47th training day on the log". Until MKT-17 ships, the count of distinct dates with a logged set in `readExCorpus` (41014).
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
- **Files:** `index.html` (29468–29640, 41014, the UX-07 plate helper), `sw.js`, the test.
- **Risk:** visual, and the white bib on a white-plate day. Give the bib an ink hairline on white grounds; the design-engineer reviews the PNGs.
- **Tools:** `Skill: impeccable` (`polish`, Markdown fallback) on the rendered PNGs; TOOL-01's harness for the PNGs; `Skill: review-animations` isn't needed (static).
- **Alignment note (2026-11-07):** placed at roadmap slot 51, directly after MKT-04 and UX-09a (market-researcher, marketing-manager B3). There's no market evidence yet that lifters read a bib as lifting (market-researcher), so it's labelled a bet; marketing.md §5's E7 tests it.
- **Status:** ready (after MKT-03 and MKT-04)

### MKT-17: "Your number": a lifetime training-day number, with milestone bibs
- **Why:**
  - A PR fires rarely, and mostly for beginners. A streak can break. Viral apps own a recurring ritual (Duolingo's streak, Wrapped's December; `design-directions.md` §6.1).
  - A number that only goes up gives every lifter, at any strength, a true posting moment at 10, 25, 50, 100, 250, 500 and 1,000, and a sentence lifters can say ("I'm on No. 212").
  - It's honest by construction: it counts days with a logged set, and nothing else.
- **Change:**
  - A pure builder, `trainingDayNumber(corpus, dateKey)`, returns the count of distinct set dates up to and including `dateKey`, from `readExCorpus`. It's never stored as a free-standing counter, so deleting a session corrects it.
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
- **Files:** `index.html` (near 13989 and 41014; the session-complete path, 29263), `sw.js`, the test.
- **Risk:** `readExCorpus` drops keys whose program day no longer exists (`parseExKey`, 40940), so a deleted custom program lowers the number. That's truthful ("days on the log"), but the What's New line should say the number counts what's on the log.
- **Tools:** default; TOOL-01's harness for the banner and the stamp.
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
- **Files:** `index.html` (the share path near 29609 and MKT-16's layout), `sw.js`, the test.
- **Risk:** body images. The photo is the person's own choice, made and shared on the device, the same stance as MKT-08. A transparent-PNG option (clipboard or share) is untested on iOS Safari, so the flattened composite is the default; test the other on a real iPhone before offering it.
- **Tools:** `security-review` (a file input), plus TOOL-01's harness for the composite.
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
- **Why:** at v3.516, saved cards are named `training-log.png` (`index.html:29623`) and backups `training-log-backup-<name>-<date>.json` (34223): the old name, on files people keep. `test-app-rename.js` only looks for the mixed-case "Training Log", so it missed these and the upper-case `'TRAINING LOG'` card footer (29608) (marketing-manager).
- **Change:**
  - Reuse MKT-03's `appSlug()` (consolidation: one place, so a future rename changes every file name at once). The backup file becomes `${appSlug()}-backup-<name>-<YYYY-MM-DD>.json`.
  - MKT-03 (slot 17, earlier) already renames the card file and removes the `'TRAINING LOG'` footer. If MKT-03 hasn't merged when this is built, this item renames the card file too, and allowlists the footer line in criterion 4 with a dated comment naming MKT-03.
  - The `training-log-v` cache names, the `trainingLog_` storage keys and the backup's JSON contents are unchanged.
- **Acceptance criteria:**
  1. The real backup handler (stubbed `URL.createObjectURL` and anchor click) sets `download` to a name starting with `appSlug() + '-backup-'` and ending `.json`.
  2. The real share path, with `File` stubbed, names the file starting with `appSlug() + '-'` (no `training-log` left).
  3. Importing a backup file named the **old** way still works (the real import handler, with a fixture called `training-log-backup-me-2026-11-01.json`): import never reads the filename.
  4. `test-app-rename.js` is extended to fail on any non-comment string literal containing `Training Log`, `TRAINING LOG` or `training-log` in `index.html`, apart from an explicit allowlist: the `training-log-v` cache prefix and the What's New history.
- **Test plan:** extend `test-app-rename.js` (criterion 4), plus new `test-app-file-names.js` (criteria 1–3). Sabotage: restore the `training-log-backup-` literal, and criteria 1 and 4 must fail.
- **Files:** `index.html` (~34223; ~29623 only if MKT-03 hasn't merged), `sw.js`, `test-app-rename.js`, the new test.
- **Risk:** people who sort backups by file name see a new prefix. The What's New line says so: "Backups and shared images are now named <name>-…; old backups still restore."
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
- **Mock-ups:** until the design-engineer re-renders `tools/design/{today,pr,progress,recap}.html` and `directions/a-today.html` (alignment round, design-engineer B4), **the item text and the summit notes beat the pictures**. Known wrong in the renders: "Intensification", "Readiness 72", "+5 lb on your best", "→ 165", "165 × 5", the 20-set ledger ceiling, "Add 2 sets each", and "2 reps in reserve".

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
  4. *(Alignment round, design-engineer)* The Sash mark's literal hexes equal the five target `--spot-*` values recorded in the comments: the header mark (`#brandHome` svg, 5718) and the five launch layers (`.launch-b25` … `.launch-b5`, 5667–5671), parsed from the real markup with jsdom, plus `tools/design/icon/option-b.svg`.
  5. `test-light-mode.js`'s rule that every light token also exists in the dark `:root` still passes (it will, if criterion 1 does).
- **Test plan:** new `test-design-tokens-v2.js`. Sabotage: delete one token from the light rule, and criterion 1 must fail; set `--spot-red`'s target to `#E0352B` (4.4:1), and criterion 2 must fail.
- **Files:** `index.html` (59 onward, 309–313 onward), `sw.js`, `test-design-tokens-v2.js` (new). PR artefact: the harness contact sheet (D14).
- **Risk:** low. Guarded by `test-css-mechanical-token-dedup.js` and `test-light-mode.js` (one light rule; every light token exists in the dark root).
- **Summit note (summit 2026-11-07):** Moved to the front of Phase 1 (now roadmap slot 11). It changes nothing visible, and every later piece of BL/BIZ/MKT markup is then written once in the new vocabulary (summit R1). Pixel-identity criterion 3 is harness PR evidence, not a `check.sh` suite.
- **Tools:** TOOL-01's harness.
- **Spec refresh (2026-11-08):** the light block is a `body:not(.gym-mode)` rule (since v3.480), and the alias-inheritance trap is spelled out; mark lines re-grepped at v3.518; TOOL-01 is merged (`tools/visual/`), so the "after TOOL-01" condition is met. Scope unchanged.
- **Status:** ready

### UX-01b: `dayInk(id)`: one day-to-ink rule, with no visible change
- **Why:**
  - `getDayPlateClass` (`index.html` 26227) ignores each day's `plate` field and colours days by **position** from seven hues (`VIVID_PLATE_CLASSES`, 26226: red, blue, yellow, green, purple, orange, teal). For example, Strength & Size Day 5 "Lower · Hypertrophy" is purple today, while its data says `p-green`.
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
  1. For every day of every built-in program, its `PROGRAM_DAY_COUNT_VARIANTS` days (16204) and every `*_STYLES` style, the real `dayInk` returns one of the six values and equals the mapping of the day's `plate` field. The test asserts it visited ≥ 1,900 days.
  2. Strength & Size Day 5 returns `green`, while the real `getDayPlateClass` (it reads the globals `dayDefs` and `dayOrder`; set them to `programs.strength.days` and its keys) returns `p-purple` for it; the test records both, so the difference is documented.
  3. A rest day returns `off`. A custom program day with no `plate` returns an ink by its index, and never throws.
  4. No rendered DOM changes: the real `getDayPlateClass` outputs for all strength days are identical before and after (snapshot), and `getDayPlateClass`'s source is byte-identical to v3.518.
- **Test plan:** new `test-day-ink.js` (UX-05 extends it later). Sabotage: return `'red'` for everything, and criterion 1 must fail on Day 2.
- **Files:** `index.html` (a new helper beside 26226–26234), `sw.js`, `test-day-ink.js` (new). `test-a11y-keyboard-focus.js` and `test-header-refresh.js` extract `getDayPlateClass` and are unaffected.
- **Risk:** none visible. The What's New line says so honestly.
- **Spec refresh (2026-11-08):** lines re-grepped at v3.518; the plate inventory measured; D13 recorded. Scope unchanged.
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
- **Status:** ready

### UX-03: Flat ground everywhere: retire the halos, glass and gradient buttons
- **Why:** the most "generated" parts of today's look are the blurred plate halos behind the header, the glass card fills with `backdrop-filter` (37 uses) and the gradient call-to-action buttons (`--cta-gradient-*`, 18 uses; the violet "Generate insights" and "Log set" buttons). Removing them app-wide in one version makes every screen coherent before any screen is rebuilt.
- **Change:**
  - Switch the UX-01 aliases for ground, surfaces, rules and text to their target values.
  - Cards become `--surface-1` with a 1 px `--rule` and no blur. Gradient buttons become flat: the primary is ink (`--text` on `--ground`), and the day-coloured one is `--spot` on `--on-spot`.
  - Gym mode's hand-tuned `.exercise-block.open` literal shadow stays untouched (CLAUDE.md). **Gym mode is out of scope** until UX-17.
  - *(Alignment round, design-engineer B2)* Also in scope:
    - the 14 `radial-gradient` halo backgrounds, including `--aura`;
    - the launch's aura (dark) and its literal halos on `#F3F0EA` (light): the launch ground becomes `--ground`;
    - the violet gradient on "Create my profile";
    - `manifest.json` `background_color`/`theme_color` (`#121417`) and the `theme-color` metas (`index.html:18–19`, `#050507` / `#F2F2F5`), which must match `--ground` in each theme.
- **Acceptance criteria:**
  1. In jsdom on the real markup, no element's inline or stylesheet `background` uses `--cta-gradient-*`. Count real rules in the CSSOM.
  2. `backdrop-filter` remains only on the sheet scrim and the tab bar's under-layer, if any: the CSSOM count is 2 or fewer, and the test names the rules allowed.
  3. The UX-01 contrast test passes against the live values now.
  4. ~~`impeccable detect`~~ *(replaced in the alignment round)*: the harness's contrast pass (axe-core once D10 approves it; until then UX-01's WCAG function over the computed colours of every text node in the matrix) reports no new contrast failure compared with the parent commit.
  5. No CSSOM rule outside Gym mode's allowlisted selectors has a `background` or `background-image` containing `radial-gradient` (real CSSOM count, comments excluded).
  6. The launch overlay's computed background equals `--ground` in both themes, and the "Create my profile" button has no gradient.
  7. `manifest.json`'s `theme_color` and `background_color`, and both `theme-color` metas, equal the target `--ground` of their theme.
- **Test plan:** extend `test-design-tokens-v2.js`. Sabotage: restore one gradient button rule, and criterion 1 must fail; restore one halo, and criterion 5 must fail.
- **Files:** `index.html` (CSS, the launch markup, the `theme-color` metas), `manifest.json`, `sw.js`, the test. (`automation.md` §4 step 11 must stage `manifest.json`: consensus F12.)
- **Tools:** TOOL-01's harness with **WebKit** (D10); `Skill: impeccable` (`audit`, Markdown fallback). After it merges, **the owner looks on his phone before the next UX item builds on it.**
- **Risk:** visual, everywhere at once. That's why it's one version on its own and easy to revert. Guarded by `test-css-mechanical-token-dedup.js` and the `--rim` notes in CLAUDE.md.
- **Status:** ready

### UX-04: The tab bar: opaque, labelled, Today · Food · Progress · History · More
- **Why:**
  - The floating glass pill bar (5758–5771) has no icons, and on light it's a white pill on glass.
  - "Log" and "Analysis" don't say what's in them. Log is the food diary; Analysis answers "am I progressing?".
  - Apple HIG: a bottom tab bar with an icon and a label per destination, opaque, with the selected tab marked by colour and a filled icon.
- **Change:**
  - Same five buttons, same IDs (`navToday`, `navLog`, `navAnalysis`, `navHistory`, `navMore`) and the same `showView` wiring. Each gets an authored 24 px outline icon (from the mock-ups) and a label. The labels become Today, Food, Progress, History, More.
  - The bar is `--surface-1` with a 1 px top rule, 84 px tall including the home-indicator area. Selected: ink label and filled icon, `aria-current="page"`.
- **Acceptance criteria:**
  1. `test-tab-bar.js`'s ID order assertion is unchanged and passes.
  2. Each button's accessible name (`textContent` trimmed) is exactly one of the five new labels, and each has `aria-current="page"` only while its view is active. Drive the real `showView` for all five.
  3. Every tab button's rendered height is at least 44 px (Playwright `getBoundingClientRect`).
- **Test plan:** extend `test-tab-bar.js`, with a dated note (2026-11-07) that the labels changed on purpose: Log to Food, Analysis to Progress. Sabotage: leave `aria-current` on the previous tab, and criterion 2 must fail.
- **Files:** `index.html` (5758–5771 and the nav CSS), `sw.js`, `test-tab-bar.js`.
- **Risk:** muscle memory for the two renamed labels. The positions don't change. Guarded by `test-gym-offer-tab-leak.js` and `test-coach-tab-order.js`.
- **Tools:** `Skill: apple-hig` (tab bar); TOOL-01's harness.
- **Status:** ready

### UX-05: The day sets the ink
- **Why:** each program day already carries a plate (`plate:'p-red'`, 9716 onward), and `renderWorkout` already publishes `--day-hue` on `#workoutCard` (28537). The new world needs three values per day: `--spot`, `--on-spot` and `--spot-deep`. It also needs them on `<body>`, because the cover, the rest field, the finish screen and the charts all use them.
- **Change (rewritten in the alignment round against `dayInk`, design-engineer B1):**
  - Beside the `--day-hue` line (28537), publish `--spot`, `--on-spot` and `--spot-deep` on `document.body` from **`dayInk(activeDay)`** (UX-01b), not from `getDayPlateClass`.
  - Re-point the live `--plate-*` tokens (`#FF453A`, `#5B7CFF`, … at ~104–112) and the day-picker discs to the spot inks via `dayInk`, so the cover's red and the disc's red are the same red. Otherwise two reds show on one screen (`#D42F25` and `#FF453A`).
  - `getDayPlateClass` becomes a thin wrapper over `dayInk` (consolidation), so there's one rule. `--day-hue` stays, for the rules that still read it.
- **Acceptance criteria:**
  1. For every day of every built-in program (and its variants), after the real `renderWorkout`, `document.body.style.getPropertyValue('--spot')` is `var(--spot-<dayInk(day)>)`, and `--on-spot` names its pair.
  2. `getDayPlateClass(id)` equals `'p-' + dayInk(id)` for every day (one rule).
  3. Each `--plate-*` token's computed value equals its `--spot-*` target in both themes (CSSOM).
  4. `--day-hue` on `#workoutCard` is unchanged (existing behaviour).
- **Test plan:** extend `test-day-ink.js` (from UX-01b). Sabotage: publish from the day's position instead of `dayInk`, and criterion 1 must fail on Strength & Size Day 5.
- **Files:** `index.html` (~26213–26230, 28537, the `--plate-*` tokens ~104–112), `sw.js`, the test.
- **Risk:** the day-picker discs and any rule reading `--plate-*` change colour on days 5–7, which now repeat inks. It's visible, and that's intended (consensus decision 9). Guarded by `test-a11y-keyboard-focus.js` and `test-header-refresh.js`, the two suites that touch the current rule.
- **Tools:** TOOL-01's harness.
- **Status:** ready

### UX-06: Today's cover: the next set, huge, in the day's ink
- **Why:** on a training day the next set is the sixth block down today (see `renders/today-dark.png` against the incumbent). The mission's first job, "what do I lift now", should be answered in the first glance from a metre away.
- **Change:**
  - The Up next card (`#upNext`, 5873–5894) becomes the cover. It's a full-bleed `--spot` field at the top of Today holding:
    - the program, week and phase line;
    - the day headline;
    - the lift name and "Set n of N";
    - the prescription with its RIR words;
    - the load as the cover numeral (150 px, display face) and "× reps";
    - one Log button;
    - the set chips for that exercise.
  - The data comes from `renderUpNext` (30545), unchanged. The Log button keeps the ID `upNextLog` and its existing handler. The weight, reps and RPE fields move behind the adjust button, which opens them in place (`expand-wrap`), keeping their IDs.
  - The day picker of seven discs collapses into the cover's day headline. Tapping it opens the existing day picker as a sheet; day selection logic is unchanged.
  - Rest days get a white or off-grey field with the day's note.
- **Acceptance criteria:**
  1. **One tap:** on seeded data, one `click()` on `#upNextLog` calls `commitSet` exactly once, with the same values the ready chip would log (stub-count `commitSet`; compare against `chip._values`).
  2. The cover's numeral text equals the ready set's weight and its "×" figure the reps, for 3 seeded exercises including a dumbbell and a bodyweight one (bodyweight shows reps only).
  3. `#upNextWeight`, `#upNextReps` and `#upNextRpe` still exist and still feed the logged values when edited.
  4. The cover has `--spot` from UX-05 as its computed background. Text on it uses `--on-spot`.
  5. Playwright: at 402×874 the Log button's top edge is above y = 480, and the numeral is at least 120 px tall.
- **Test plan:** new `test-today-cover.js`, plus `test-set-chips.js` unchanged and passing. Sabotage: make the button log the first chip instead of the ready chip, and criterion 1 must fail.
- **Files:** `index.html` (5873–5894, `renderUpNext` 30545, the up-next CSS 726–760), `sw.js`, the test.
- **Risk:** Today's layout is the most-used screen. Guarded by `test-set-chips.js`, `test-today-priorities.js`, `test-gym-set-chips.js` and `test-superset-chips.js`.
- **Summit note (summit 2026-11-07):** Ship as **two versions**. **06a:** the cover, numeral, Log button, chips, and fields behind "adjust". **06b:** the day picker collapsing into the headline sheet. 06a adds three criteria: (i) a first-ever exercise shows BIZ-05's hint and the target reps, not an empty numeral; (ii) with a resting region that flags the cover lift (e.g. Shoulder → Bench Press, `CATEGORY_TO_REGIONS` 43895), the cover shows the existing caution and substitute; (iii) effort words come from BL-10 (summit R7). No numeric readiness score (summit F2). Keep `#headerEyebrow` (BIZ-02).
- **Alignment note (2026-11-07):** `design-directions.md` §5's additions, copied in as 06a criteria:
  - (iv) **no state colour sits on a spot field**: no warning, success or error colour is a computed `color` or `background` of any descendant of the cover (CSSOM over the real markup);
  - (v) **in dark mode, a yellow day's cover uses the deep ink**: the cover background is `--spot-deep`-based, with white text at ≥ 4.5:1;
  - (vi) **meta text on spot fields is at least 15 px** (computed `font-size` of every text node in the cover except the numeral and headline);
  - (vii) **a 16 px or larger gap between Log and adjust** (harness `getBoundingClientRect`);
  - (viii) **tap parity**: create `test-tap-counts.js`, counting the real clicks to log the ready set from a fresh Today. The count is ≤ the parent commit's count (1 today).
  - The cover's effort line shows BL-10's `words` form, not the `short` label.
- **Tools:** TOOL-01's harness (WebKit); `Skill: apple-hig`; `Skill: review-animations` for the "adjust" expand.
- **Status:** ready (after BL-08, BL-10 and BIZ-05)

### UX-07: The plate stack beside the load
- **Why:** the signature move. A lifter reads the bar's load as plates before reading the number, then loads the bar without doing sums. The old plate calculator is gone (only its comment remains at 31752; flagged, not fixed).
- **Change:**
  - New pure `platesPerSide(weight, eq)`: a greedy fill from `eq.plates` (`getEquipment`, ~32720; `BARBELL_STANDARDS` 32700) after subtracting `eq.bar`. It returns `{plates:[...], remainder}`.
  - Drawn in the cover for `isBarbellExercise` lifts only (31769): an SVG of plates scaled by size and coloured by the plate code (45 lb blue, 35 yellow, 25 green, 10 white, 55 red; change plates steel; kg sets by their own colours). `aria-hidden`, with a text caption "45 · 10 · 2.5 each side" that VoiceOver reads.
- **Acceptance criteria:**
  1. `platesPerSide(160, lbEq)` → `[45, 10, 2.5]`, remainder 0. `platesPerSide(45, lbEq)` → `[]`. `platesPerSide(142, lbEq)` → `[45, 2.5]` with remainder 1.5 (unloadable; the caption says "about").
  2. With a custom equipment profile without 2.5 lb plates, 160 → `[45, 10]` with remainder 2.5.
  3. No plate stack renders for a dumbbell, cable or bodyweight lift (Lat Pulldown, DB Curl).
  4. The caption text equals the plates joined with " · ", followed by " each side".
  5. *(Alignment round, `design-directions.md` §5)* In the rendered SVG, plates run **heaviest against the inner collar**, lightest outward (read the `x` order of the plate rects for 160 lb: 45, 10, 2.5).
  6. On the cover, the bar is drawn full width: the bar element's width equals the cover's content width (harness `getBoundingClientRect`, ±1 px).
- **Test plan:** new `test-plate-stack.js`, with the real `platesPerSide`, `getEquipment` and `isBarbellExercise`. Sabotage: drop the bar subtraction, and criterion 1 must fail.
- **Files:** `index.html` (new function beside 31769, cover markup), `sw.js`, the test.
- **Risk:** a kg user's colour mapping. Tested by a kg case in criterion 2's sibling.
- **Tools:** TOOL-01's harness; `Skill: dataviz` isn't needed (a diagram, not a chart).
- **Status:** ready

### UX-08: Rest takes over the cover, with the next set's adjusters
- **Why:** the rest timer today is a separate bar. During rest the eye is on the cover, so the countdown should be there, with the next set ready to adjust and log beneath it (`renders/log-set-dark.png`).
- **Change:**
  - While `startRestTimer` (29976) runs, the cover shows "Rest", the remaining time as the cover numeral, "of m:ss" and the logged chips. The bright `--spot` layer shrinks with `transform: scaleX()` over the rest length (linear) to reveal `--spot-deep`. `+30 s` and `Skip` call the existing timer controls.
  - Beneath it: the next set's steppers. Weight steps by the loadable increment from `snapToLoadable` (31035 logic); reps step by 1. A "Reps left" segmented control (3+, 2, 1, 0) writes RPE as 10 − RIR (stored data unchanged: it is still RPE). The Log button is in `--spot`.
  - Reduce Motion: no `scaleX` animation; the field shows a static split at the current fraction and the number updates.
- **Acceptance criteria:**
  1. After a logged set, `startRestTimer` is called once with the same seconds as today (stubbed clock; the existing `getDefaultRestSeconds` path).
  2. The weight "+" button on Bench at 160 lb gives 165 (lb plate set) and on DB Curl at 30 gives the dumbbell increment. Both are computed by the real `snapToLoadable`.
  3. Choosing "Reps left: 2" logs RPE 8. With RPE mode off, the control is still shown and logs RPE, as the RPE field does today.
  4. With `matchMedia('(prefers-reduced-motion: reduce)')` stubbed to true, the fill element has no transition or animation in its computed style.
  5. Superset and backdated-set rest suppression still hold (existing tests pass unchanged).
- **Test plan:** new `test-rest-cover.js`, plus `test-superset-rest-timer-suppression.js` and `test-backdating-rest-timer-suppression.js` unchanged. Sabotage: make "Reps left: 2" write 2 as RPE, and criterion 3 must fail.
- **Files:** `index.html` (29976 onward, the cover markup and CSS), `sw.js`, the test.
- **Risk:** the timer is load-bearing mid-session. Wake lock and notifications are untouched.
- **Tools:** `Skill: review-animations` (the `scaleX` drain); `Skill: animation-performance` (composite-only); TOOL-01's harness (rest state, Reduce Motion pass).
- **Status:** ready

### UX-09: Finish screen, with the PR moment
- **Why:** a session ends in a toast today. The finish should close the session with the true numbers and say what changes next time and why (`renders/pr-dark.png`).
- **Change:**
  - When the last prescribed set of the day is logged, a full-screen sheet opens. It has:
    - a flood in `--spot` if the session holds a weight or strength best, using the same rule as `reconstructAllPRs` (41641): heaviest top set or best e1RM;
    - the best set as the cover numeral with its plate stack, and "+x lb on your best, w × r on date";
    - sets done of planned, minutes and volume in one ruled row;
    - "Next time" rows from the existing progression signal (`analyzeProgressionSignal` 27477), each with its one-line reason;
    - Share (the existing `shareCelebrationCard` 29609; the card itself is MKT-03 and MKT-07) and Done.
  - With no best, the flood is replaced by the day headline on `--surface-1`.
  - Motion: the flood enters once as a `clip-path` circle from the Log button (700 ms, `--ease-out`). Reduce Motion: a cut. It never replays on reopen.
- **Acceptance criteria:**
  1. On seeded data where the last set beats the prior heaviest top set, the sheet shows that set and the prior best's weight, reps and date. Assert against `reconstructAllPRs()`'s newest event, not hard-coded numbers.
  2. With no best, no element with the flood class is rendered.
  3. Each "Next time" row's load equals what `computeSuggestedSet` returns for that exercise next session.
  4. `triggerCelebration` (29438) is still called for PRs, exactly once per PR (no double celebration).
  5. Closing the sheet returns focus to Today, and the sheet has `role="dialog"`, `aria-modal="true"` and a labelled close button.
- **Test plan:** new `test-finish-sheet.js`. Sabotage: compare against the first set instead of the top set, and criterion 1 must fail.
- **Files:** `index.html` (near 29438 and 30980), `sw.js`, the test.
- **Risk:** an extra sheet at the end of every session. It's dismissed with one tap, and it replaces the toast instead of adding to it.
- **Summit note (summit 2026-11-07):** Ship as **two versions**. **09a:** the sheet, totals, "Next time" rows, Share (calling MKT-04's builder) and Done. **09b:** the flood and its motion. The Next-time rows print `computeSuggestedSet`, so BL-08 must have merged. Fix the mock-up first: Bench 4×4–6 at 5, 5, 5, 5 **holds** at 160 (summit F7). Record copy per summit R6: 160×5 over 155×8 is "Heaviest weight yet", not "your best" (e1RM 186.7 vs 196.3). On `MEDICAL_STYLES` programs: no flood, no trophy, no Share.
- **Tools:** 09a: TOOL-01's harness, `Skill: apple-hig` (sheets). 09b: `Skill: animate` and `Skill: review-animations` (the `clip-path` flood), `Skill: animation-performance`.
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
- **Files:** `index.html` (the analysis view markup and its renderer in `VIEW_RENDERERS` 40257), `sw.js`, the test.
- **Tools:** `Skill: dataviz`.
- **Risk:** Analysis has many guarded behaviours. This item only adds a block above them.
- **Summit note (summit 2026-11-07):** The "AI insights moves below the evidence" clause is owned by BIZ-06; don't re-implement it. The ledger slot moves BL-20's renderer (summit R8). It ships after BL-20 and BIZ-06.
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
  - Data comes from `computeWeekStats` (45380), unchanged. Share uses `archiveCurrentWeek`'s card (45414) as MKT-02 left it. The sheet is shown once per week (a `window.storage` flag like the other one-time states).
- **Acceptance criteria:**
  1. For a seeded week with Days 1, 2, 4 and 5 trained, Day 3 cardio logged and Day 6 missed, the strip's seven blocks carry the states trained, trained, trained, trained, trained, missed, rest in order, each with its day's plate class.
  2. The sessions figure equals `computeWeekStats(...).sessions`. No figure on the sheet repeats another figure on it.
  3. The sheet opens once per week: a second `showView('today')` the same week doesn't reopen it.
  4. The strip has an accessible name listing each day and its state.
- **Test plan:** extend `test-weekly-recap.js`, with a dated note. Sabotage: mark rest days as missed, and criterion 1 must fail.
- **Files:** `index.html` (45284–45470 region, Today view init), `sw.js`, `test-weekly-recap.js`.
- **Risk:** a new interruption once a week. It's dismissible, and MKT-02's privacy rules apply to the share.
- **Summit note (summit 2026-11-07):** Share is hidden while a `MEDICAL_STYLES` program is active. "New bests" uses summit R6 wording. Define a **first-week variant**: done against planned, and what week 2 brings, never "0 weeks" (summit §1.2). MKT-05 later adds the block-complete variant to this sheet.
- **Tools:** TOOL-01's harness; `Skill: dataviz` (the week strip); `Skill: apple-hig` (sheets).
- **Status:** ready

### UX-12: History as a month of plate blocks
- **Why:** History is a calendar plus a long list. The week-strip grammar scales to a month: you can scan a month's consistency by colour.
- **Change:** `renderHistory` (44884) draws the month as rows of seven blocks in the trained day's ink. Sessions below become two-line ruled rows: day, date and duration on line 1; top lifts on line 2. Tapping a block scrolls to its session. Same data and the same edit and delete paths.
- **Acceptance criteria:**
  1. Each date with a session renders exactly one block, with that session's day plate class. Dates without a session render the empty state.
  2. Tapping a block scrolls the matching session row into view (`scrollIntoView` stub-counted: 1).
  3. Existing History edit and delete tests pass unchanged.
- **Test plan:** new `test-history-month.js`. Sabotage: key blocks by the weekday instead of the date, and criterion 1 must fail.
- **Files:** `index.html` (44884 onward), `sw.js`, the test.
- **Tools:** TOOL-01's harness; `Skill: dataviz` (the month grid).
- **Alignment note (2026-11-07):** moved from slot 58 to slot 44, before the cover, so History is in the new materials before Today's cover lands (design-engineer B2). Block inks come from `dayInk`.
- **Status:** ready

### UX-13: Food in the world's ink
- **Why:** Food is the most frequent touch in the app, and after UX-03 it would otherwise sit in the old layout beside a rebuilt Today. Its flows are good and stay; only the surface changes. *(Alignment round:* moved to slot 43, before the cover. The food lane (BIZ-03, BL-18, BL-19, BL-16, BL-17) ships at the end of Phase 1, so recents and the placeholder line already exist when this is built.)
- **Change:** the macro rings become one ruled row of four figures (calories, protein, carbs, fat), with the remaining figure as the lead. Search, barcode, Snap a Meal and Describe It become one row of standard buttons. Food rows are two-line ruled rows using the existing `buildFoodResultRow`. No flow, storage or API changes.
- **Acceptance criteria:**
  1. The remaining-calorie figure equals target minus the logged sum for the seeded day (real `computeTargets` and the food log).
  2. Every food entry renders through `buildFoodResultRow`: one call per entry, stub-counted.
  3. Existing food logging tests (search, barcode, repeat yesterday) pass unchanged.
- **Test plan:** new `test-food-view-summary.js`. Sabotage: drop one entry from the sum, and criterion 1 must fail.
- **Files:** `index.html` (Log view markup and CSS), `sw.js`, the test.
- **Summit note (summit 2026-11-07):** Keep BIZ-03's placeholder line and BL-18's recents row, each asserted in this item's test.
- **Alignment note (2026-11-07):** both are now asserted **unconditionally**, not "if present", because they merge before this item. Extra criterion: extend `test-tap-counts.js` (from UX-06a; if UX-06a hasn't shipped, this item creates it) with "log a recent food". The count is ≤ the parent commit's.
- **Tools:** TOOL-01's harness; `Skill: apple-hig`; `Skill: dataviz` for the macro row.
- **Status:** ready (after BL-18)

### UX-14: The unfolded screen: session and lift side by side
- **Why:** unfolded (904×678), Today already puts the lift's history on the right (`renders` of the incumbent). In the new world the left pane is the cover and session, and the right pane is the selected lift: its plate stack, e1RM line and last five sessions. Tapping a session row switches the right pane, with no navigation.
- **Change:** a container query on the Today view at 720 px or wider gives two columns. The right pane reuses UX-10's chart renderer for the selected exercise. `test-foldable-tabletop.js` behaviour holds.
- **Acceptance criteria:**
  1. At a 904 px viewport (jsdom with a stubbed `matchMedia` and the container width), selecting an exercise row updates the right pane's title to that exercise. Exactly one chart render per selection.
  2. At 402 px, the right pane isn't rendered.
  3. `test-foldable-tabletop.js` passes unchanged.
- **Test plan:** new `test-unfolded-today.js`, plus Playwright at 904×678 light and dark. Sabotage: render the chart for the first exercise always, and criterion 1 must fail.
- **Files:** `index.html`, `sw.js`, the test.
- **Summit note (summit 2026-11-07):** Moved up to follow UX-10 (roadmap build 40): the owner uses a Duo daily, so the unfolded Today can't wait for Phase 4. For testability, drive the two panes from a `matchMedia` listener that sets a class, because jsdom can't evaluate container queries (summit §1.7).
- **Tools:** TOOL-01's harness at 904×678 (WebKit, because container queries are the risk); `Skill: dataviz`.
- **Status:** ready

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
- **Why:** the floating chat button (draggable, 48442–48459) covers content on every view at 402 px (see the incumbent screenshots). In the new world it's a plain 44 pt icon button in the header, beside Settings.
- **Change:** the button keeps its ID and its open handler. The floating position, the drag code and the stored drag side are removed.
- **Acceptance criteria:**
  1. One click on the header button opens the coach exactly as the FAB did (the same handler, stub-counted: 1).
  2. No element is `position: fixed` over the content area apart from the tab bar, toast and sheets (a CSSOM check over the real markup).
- **Test plan:** new `test-coach-header-button.js`. Sabotage: re-add the fixed position, and criterion 2 must fail.
- **Risk:** it drops a feature: the draggable button and its remembered side.
- **Tools:** `Skill: apple-hig` (header controls); TOOL-01's harness.
- **Status:** needs-owner. **Question:** "Move the floating chat button into the header (it stops covering content, but you can no longer drag it)?" **Recommendation:** yes.

### UX-17: Retire Gym mode once Today is the session
- **Why:** after UX-06 to UX-08, Today is gym mode: the next set huge, one tap, rest on the cover. Keeping both doubles the surface to maintain, and gym mode's tests guard a second implementation.
- **Change:** none until answered. If yes, a later version removes the toggle and the gym-only rendering. Its tests move to the shared Today paths, with dated notes.
- **Tools:** TOOL-01's harness; `test-tap-counts.js` must pass unchanged.
- **Alignment note (2026-11-07):** waits for **tap parity** (market-researcher): Today must log the ready set in no more taps than Gym mode, confirmed in `test-tap-counts.js` and on the owner's phone. It must **ship or be dropped before any Phase 5 public step**, so retiring Gym mode never lands as a post-launch take-away (business-manager B3).
- **Status:** needs-owner. **Question:** "Once the new Today ships and matches Gym mode's tap counts, remove the separate Gym mode?" **Recommendation:** yes, after two weeks of real use of the new Today on your phone, and before going public.

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
