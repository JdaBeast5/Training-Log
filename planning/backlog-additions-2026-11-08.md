# Backlog additions (2026-11-08, exercise-auditor)

Written against **live v3.517** (`origin/Branch-1` 0868e23). The evidence for every item is in `planning/exercise-consistency-audit.md` (finding IDs S-x, D-x, C-x). Source keys are in that file and in `planning/program-audit.md`.

These items are proposals for `planning/backlog.md`; the project-manager merges them through a PR. This file doesn't edit `backlog.md` or `roadmap.md`.

**Same rules as every BL item.**
- One item = one version.
- `APP_VERSION` and `sw.js` `VERSION` are bumped together, plus a `WHATS_NEW` entry.
- A real-function jsdom test via `testHelpers.js`, with a sabotage check.
- Run `check.sh` plus every suite before the change and after the bump.
- Re-grep line numbers: each shipped item shifts the ones below it.

The default `Tools:` from `backlog.md` apply. Item lines list only extras.

**ID use.**
- **BL-41, 42, 44, 45** stay as their reserved placeholders (powerlifting peaking, Olympic % bands, bodyweight ladders, athletic metrics). They're not written here.
- **BL-43, 46, 47, 48** are the running, cycling and swimming progression items, plus the endurance deload they share.
- **BL-49** stays unassigned.
- **BL-51 to BL-64** are the consistency fixes.

---

## Endurance progression (reserved range)

The block clock already exists: `DELOAD_CYCLE_WEEKS` = 5, weeks 1–4 accumulate and week 5 deloads (`cycleWeekOf`). The endurance items reuse it, so lifting and endurance share one calendar. There's no new state manager.

Cardio rows already log a distance and a duration (the reps field holds minutes, "3.1 @ 28"), and Analysis already shows weekly distance and pace (`index.html` ~45607). The items read those logs, so **no stored data changes**.

### BL-43: Running progression from your own logged distance
- **Why:**
  - Running scores **F** for progression (program-audit scorecard). `Easy Run 25-30 min`, `Long Run 45-60 min` and `400m Repeats 6×400m` never change.
  - The deload-week mechanism doesn't touch duration-only rows (BL-48).
  - Current evidence points at the *single-session spike*, not the weekly 10% rule: a run more than 10% longer than the longest run of the previous 30 days raised overuse-injury rates (about +64% for 10–30%), while week-to-week change didn't [FRA25].
  - Easy-dominant (about 80/20) distribution is the supported default [SS14].
- **Change** (render-time suggestions only):
  1. **`longestRunLast30Days()`**, read from the existing cardio corpus. Running-category names: Easy Run, Long Run, Tempo Run, Recovery Jog, Warm-up Jog, Cool-down Jog, Strides, 400m Repeats. Reuse `readExCorpus` / `groupCorpusByExercise`; don't add a new reader.
  2. **Long Run badge**, weeks 1–4: "Today's cap: X km (10% over your longest run in 30 days)". X = 1.10 × that longest run, snapped to 0.5 km or 0.25 mi. With no logged run, show the authored minutes only.
  3. **400m Repeats**, double progression on count before pace. 4 → 5 → 6 → 8 reps across build weeks when every rep in the last session was within 3 s of the session's first rep. Above 8, suggest "move to 800s or 1 km reps" (text only). Coaching basis [PRAC].
  4. **Tempo Run**: +2 min per build week from the authored 20, capped at 30 min. Week 5 (deload) uses the authored value.
  5. **Weekly intensity check** on the Running Analysis card: minutes logged at Tempo or Repeats vs total. Show "Hard share this week: N%" with the target "about 20%" [SS14]. Display only.
- **Acceptance criteria:**
  1. With logs whose longest run in the last 30 days is 10.0 km, the Long Run badge on a week-2 render reads 11.0 km. With the longest at day 31 only, the badge falls back to the authored text.
  2. 400m Repeats with a last session of 6 reps all within 3 s suggests 8. With one rep 5 s slower, it suggests 6 (hold).
  3. In a deload week, no cap or increase is shown, and BL-48's reduction applies.
  4. No `ex:` key or log entry is written by any of this. Snapshot storage keys before and after a render.
  5. Non-running programs render byte-identical.
- **Test plan:** new `test-running-progression.js`. Use the real `readExCorpus` with a stubbed `window.storage`, the real badge builder, and a fake clock. Sabotage: drop the 30-day window, and criterion 1's day-31 case must fail.
- **Files:** `index.html` (badge builder near `buildProgressBadge` ~27742; Analysis cardio card ~45607), `sw.js`, the test.
- **Risk:** the cardio corpus shape (distance in metres, minutes in reps). Guarded by the existing cardio pace and distance tests. Don't touch `isDistanceExercise` here (that's BL-55).
- **Tools:** none extra.
- **Status:** ready

### BL-46: Cycling FTP anchor, retest, and interval progression
- **Why:**
  - Cycling scores **F** for progression. `FTP Intervals 3×10 min`, `Hill Repeats 6×5 min` and `Long Ride 90-120 min` are fixed, and the FTP cue (cx:143) tells the rider to ride "at your FTP" while the app never stores one.
  - Power zones as % of FTP, with FTP estimated as 95% of a 20-min test, are standard practice [AC].
  - Polarised distribution is the evidence-supported default [SS14].
- **Change:**
  1. **FTP preference** in `window.storage` (`cycling-ftp-w`), with an optional value in watts and an optional `ftp-tested` date. It's set from a small field on the Cycling program card (an existing `expand-wrap` pattern).
  2. **Targets.** With an FTP set, interval rows show watt targets:
     - FTP Intervals 95–105%;
     - Hill Repeats 88–94% (sweet spot);
     - Sprint Intervals (Bike) "max";
     - Endurance and Long Ride ≤75%.

     Without one, keep the RPE text.
  3. **Retest prompt** in week 1 of a block when `ftp-tested` is older than 6 weeks: "20-min test today: FTP = 95% of average power" [AC]. The rider enters a number; nothing is automatic.
  4. **Time-in-zone progression** across build weeks 1–4: FTP Intervals 3×10 → 3×12 → 2×20 → 3×15 min. Hill Repeats 6×5 → 7×5 → 8×5 → 6×6. Long Ride +15 min per week, capped at the authored upper bound + 30 min. Week 5 uses the BL-48 deload.
  5. Mountain style: Standing Climb Repeats 6×3 → 7×3 → 8×3 → 6×4. Technical Trail Ride unchanged (skill session).
- **Acceptance criteria:**
  1. FTP 250 W: the FTP Intervals row shows "238–263 W"; Hill Repeats shows "220–235 W".
  2. Week 3 render: FTP Intervals reads "2×20 min"; week 5 reads the deload value.
  3. `ftp-tested` 43 days old in week 1 shows the retest prompt; 41 days old doesn't.
  4. Without an FTP, the rows render the authored text exactly.
  5. The progression is a render-time string transform like `applyAccumulation`. It never writes an exercise slot, so `exKey`s are unchanged.
- **Test plan:** new `test-cycling-ftp.js`, with real render-time transforms and a stubbed storage. Sabotage: remove the week mapping, and criterion 2 fails.
- **Files:** `index.html` (Cycling selector and card ~12416 and `renderCyclingSelector`; a render-time transform beside `applyAccumulation` ~26768), `sw.js`, the test.
- **Risk:**
  - `CYCLING_STYLES` and their day-count variants, which are swapped at runtime (`applyDaysPerWeekProgramData`). The transform must key on exercise name, not day.
  - The interval-string parse must not break `parseEstimatedMinutes`. Assert the estimate for "2×20 min" is 41.
- **Tools:** none extra.
- **Status:** needs-owner. **Question:** "Store an FTP number and show watt targets, with a retest prompt every 6 weeks?"

### BL-47: Swimming CSS anchor and set progression
- **Why:**
  - Swimming scores **F** for progression; Threshold Swim Set 4×200m and Swim Intervals 8×100m never change.
  - The timer gives 60 s rest where the cue says 15–30 s (audit D-11).
  - Critical swim speed (CSS), from a 400 m and a 200 m time trial, is a validated threshold index [WAK92]. It's the swimming equivalent of FTP.
- **Change:**
  1. **CSS preference** in `window.storage`: T400 and T200 in seconds, and the test date. CSS pace per 100 m = (T400 − T200) / 2.
  2. **Targets:**
     - Threshold Swim Set: "at CSS pace (m:ss/100m), 20 s rest";
     - Swim Intervals: "CSS − 3–5 s/100m, 15–20 s rest";
     - Easy and Long Swim: "CSS + 10–15 s/100m".
  3. **Progression** across build weeks 1–4:
     - Threshold 4×200 → 5×200 → 6×200 → 4×300;
     - Intervals 8×100 → 10×100 → 12×100 → 8×100 on 5 s less rest.

     Week 5: the BL-48 deload.
  4. **Retest prompt** in week 1 when the CSS test is older than 6 weeks: "Swim 400 m then 200 m all-out, with 5–10 min easy between".
  5. **Rest timer.** Swim repeats of 200 m or less get 20 s; 200–400 m get 30 s. Delivered in BL-57, which owns the rest parser. This item only depends on it.
- **Acceptance criteria:**
  1. T400 = 6:00 and T200 = 2:50 gives CSS 1:35/100m, and the Threshold row shows "1:35/100m".
  2. Week 2: Threshold reads "5×200m".
  3. Without CSS stored, the authored text is unchanged.
  4. No slot or key changes (the same snapshot check as BL-43).
- **Test plan:** new `test-swimming-css.js`. Sabotage: swap T400 and T200, and criterion 1 must fail.
- **Files:** `index.html` (Swimming card; the same render-time transform as BL-46, shared rather than duplicated), `sw.js`, the test.
- **Risk:** as BL-46. Ship BL-46 first so the transform exists, then extend it.
- **Tools:** none extra.
- **Status:** needs-owner. **Question:** "Ask for a 400 m and a 200 m time to set swim pace targets?"

### BL-48: The deload week also shortens duration-only cardio
- **Why:** `applyDeloadVolumeReduction` (26853) changes only strings with a leading set count (`hasNumericSetPrefix`). In week 5, `6×400m` becomes 3×400m, but `Long Run 45-60 min`, `Long Ride (Zone 2) 90-120 min`, `Endurance Ride 45-60 min` and `Long Swim 30-45 min` stay full length. The deload cuts the intervals and keeps the biggest aerobic load. A deload typically cuts volume by about 30–50% [BELL23].
- **Change:**
  - In the deload branch only, rows whose `sets` is a pure duration (`/^\d+(\s*-\s*\d+)?\s*min\b/`) and whose category is `cardio` get their minutes × 0.7, rounded to 5. Warm-up and cool-down rows are excluded (`isWarmupOrCooldownUnit` already defines them).
  - Add a `deloaded: true` marker so the day header's existing "(deload)" suffix covers it.
- **Acceptance criteria:**
  1. Week 5: running d5 `Long Run 45-60 min` renders `30-40 min`; road d6 `Long Ride (Zone 2) 90-120 min` renders `65-85 min`.
  2. Warm-up Jog `10 min` is unchanged.
  3. Weeks 1–4 are byte-identical to today.
  4. Lifting rows are unchanged (assert one Squat 4×4-6 against `test-mesocycle-phase-tag.js` expectations).
- **Test plan:** extend `test-deload-signal-week-awareness.js`, or add `test-deload-duration-cardio.js`. Use the real `applyDeloadVolumeReduction`. Sabotage: remove the duration branch.
- **Files:** `index.html` (26853), `sw.js`, the test.
- **Risk:** medical styles have walking rows (`Walking 20-30 min`). Exclude `MEDICAL_STYLES` days, which keep authored durations, consistent with BL-01's clinical stance.
- **Tools:** none extra.
- **Status:** ready

---

## Consistency fixes (new)

### BL-51: Log entries carry the exercise name, and suggestions ignore entries from another exercise (S-1, D-2, part 1)
- **Why:**
  - History keys are positional (`exKey` 27001). Day-count variants reuse `d1…d7` and the slot indexes, and yoga styles share `ex:yoga:` keys.
  - Measured: strength 54/120, bodybuilding 81/94 and powerbuilding 47/112 variant slots read a different exercise's log at the same key. Yoga has 40/72 cross-style collisions.
  - Example: bodybuilding 6-day d5 slot 0 Incline DB Press reads Squat history and suggests "try adding weight" from the squat load.
  - Entries store only `{date, sets}`, so nothing can tell them apart today.
- **Change** (no migration, no key change):
  - `saveExSet` (28282) adds `n: <exercise name>` to each **new** entry: the slot's current `ex.name`, or the substitute's name for `:sub:` keys.
  - `normalizeExEntry` keeps `n` when present.
  - One helper, `entriesForExercise(log, name)`: keeps entries with `n === name`, plus legacy entries (no `n`) **only when the active day count equals the program's default** (`daysPerWeekPref == null`) and, for yoga, the active style is `flow`. Legacy entries elsewhere are ambiguous and are left out of suggestions.
  - Callers: `getExLog` consumers that feed `buildPastSessions`, `priorSetForSlot`, `computeSuggestedSet`, `buildProgressBadge` and the PR check.
  - History and Analysis still show every entry (no data hidden), labelled by `n` when present.
- **Acceptance criteria:**
  1. With a stored `ex:bodybuilding:d5:0` log of Squat entries (no `n`) and day count 6 active, the Incline DB Press row shows no "try adding weight" badge and no ghost load.
  2. With the default day count, the same legacy log feeds the Squat row exactly as today.
  3. A new set logged on that row writes an entry with `n:'Incline DB Press'`. The next render uses it.
  4. A pre-existing entry with `n:'Squat'` at that key is ignored on the Incline row under any day count.
  5. The History view still lists all entries (count unchanged).
- **Test plan:** new `test-history-name-stamp.js`, with a real `saveExSet`, real badge and suggestion functions, and stubbed storage. Sabotage: make `entriesForExercise` return the whole log, and criterion 1 must fail.
- **Files:** `index.html` (28282, `normalizeExEntry`, 27149, ~27742–27850), `sw.js`, the test.
- **Risk:**
  - Every progression test touches this path: `test-next-set-recommendation.js`, `test-set-chips.js`, `test-cross-program-history.js` and `test-exercise-substitution.js` must stay green.
  - Export/import (`test-import-backup-full-replace.js`) must round-trip the `n` field.
- **Tools:** `code-review` at high (progression path).
- **Status:** ready (safety; build before BL-08)

### BL-52: Variant- and style-scoped history keys, with a migration (S-1, D-2, part 2)
- **Why:** BL-51 stops wrong suggestions, but legacy logs under a variant stay ambiguous, and `parseExKey` (40951) resolves combat, cycling and watersports keys against the default style days, not the active variant. Only a key change fixes the labels for good.
- **Change:**
  - Variant days write `ex:<program>[:<style>]:v<N>:<dayId>:<idx>` when `daysPerWeekPref` selects a variant. Yoga gains a style segment (`ex:yoga:<style>:…`).
  - `parseExKey` and `exKeyForLocation` learn both shapes.
  - A `SCHEMA_VERSION` bump with a `runMigrations()` step that **copies nothing it can't attribute**:
    - entries with `n` move to the key whose slot holds that name;
    - legacy entries stay where they are.
- **Acceptance criteria:**
  1. Migrating a store with `n`-stamped entries for two day counts produces two keys, each matching its slot name.
  2. Legacy entries are byte-identical after migration.
  3. `parseExKey` labels a v6 combat key with the v6 day's exercise.
- **Risk:** a stored-data migration on the history store. A backup export is prompted first.
- **Status:** needs-owner. **Question:** "Give each day-count option and yoga style its own history, moving only entries we can attribute by name?"

### BL-53: Medical history joins the corpus; the watersports fallback key (D-1, D-12)
- **Why:**
  - `parseExKey('ex:medical:hypertension:d2:0')` returns `null` (run against the real function). Every medical, prenatal, postpartum and rehab log is missing from PRs, `groupCorpusByExercise`, weekly volume and the weekly-RPE readiness input, including the signals the clinical gates (BL-02) rely on.
  - `exKeyForLocation` (27091) has no watersports branch, so the cross-program warm-up fallback builds `ex:watersports:d1:0`, which is never written.
- **Change:**
  - Add a `medical` branch to `parseExKey` that mirrors the combat one, using `MEDICAL_STYLES[style].days`, with the label `${programs.medical.label} (${styleDef.label}) · ${dayDef.label}`.
  - Add a `watersports` branch to `exKeyForLocation`.
- **Acceptance criteria:**
  1. `parseExKey('ex:medical:hypertension:d2:0').exDef.name === 'Seated Cable Row'`.
  2. `readExCorpus` with one medical key returns 1 entry.
  3. `exKeyForLocation({program:'watersports', style:'surfing', dayId:'d1', idx:0}) === 'ex:watersports:surfing:d1:0'`.
  4. Combat, cycling, watersports and plain keys parse exactly as before (table test).
- **Test plan:** new `test-parse-ex-key-styles.js`, real functions. Sabotage: remove the medical branch, and criterion 1 fails.
- **Files:** `index.html` (40951, 27091), `sw.js`, the test.
- **Risk:** medical users will now see their logs in PR and volume views. That's intended, and the What's New line says so.
- **Status:** ready

### BL-54: One exercise, one name in History, PRs and the warm-up fallback (D-3)
- **Why:** the same lift under two names splits grouping:

  | Name | Other name |
  |---|---|
  | Squat (68 slots) | Back Squat (17) |
  | Bench Press (58) | Flat Bench Press (7) |
  | Seated Cable Row (49) | Cable Row (18); bodybuilding uses both, d2 9817 and d6 9868 |
  | Farmer's Carry (51) | Farmers Carry (Heavy) (9) |
  | Standing Calf Raise (16) | Calf Raise (40) |

  Switching between Olympic or Hyrox and Strength & Size loses "last time", the warm-up basis and a single PR line.
- **Change:**
  - `EXERCISE_CANONICAL = {'Back Squat':'Squat', 'Flat Bench Press':'Bench Press', 'Cable Row':'Seated Cable Row', 'Farmers Carry (Heavy)':"Farmer's Carry", 'Calf Raise':'Standing Calf Raise'}` and `canonicalExName(n)`.
  - Used **only** in `groupCorpusByExercise` (41498) and `getExerciseLocationIndex` (27064).
  - Slot names, cues, `EXERCISE_SUBS`, keys and logs are unchanged.
- **Acceptance criteria:**
  1. A corpus with one Back Squat entry (oly) and one Squat entry (strength) gives one group named "Squat" with 2 entries and both day labels.
  2. The cross-program warm-up fallback for strength d2 Squat finds an oly Back Squat log.
  3. Without aliased names, output is identical to today.
- **Test plan:** extend `test-cross-program-history.js` and `test-pr-timeline.js` with real functions. Sabotage: empty the map.
- **Files:** `index.html` (41498, 27064, the new const beside `EXERCISE_SUBS` 13706), `sw.js`, tests.
- **Risk:** PR timelines merge. A heavier Back Squat PR from the oly program now counts for Squat, which is correct for the same bar.
- **Status:** ready

### BL-55: Cardio rows show a distance field only when distance is the measure, and it never blocks a finished set (D-5)
- **Why:**
  - `isDistanceExercise` (32558) is "category is cardio", and the real-set check (32018) requires a distance, so the rest timer and gym-mode offer never fire on Burpees (29 slots), Battle Ropes (39), Wall Balls (13), Burpee Broad Jumps (9), Agility Ladder, every Jump Rope drill (82) and the jump-rope warm-up (105) until a distance is typed.
  - At least 147 cardio slots prescribe no distance at all.
- **Change:**
  - `isDistanceExercise(exName, setsStr)` is true when the prescription contains a distance unit (`\d\s*(m|yd|km|mi)\b`) or the name matches `/Run|Jog|Ride|Spin|Swim|Walk|Row|SkiErg|Sled|Strides|Repeats/`.
  - `hasRequiredDistance` is dropped from `isRealSet`: reps or minutes alone complete a cardio set. The distance stays optional and is still saved.
- **Acceptance criteria:**
  1. Burpees `4×10`: no distance input renders. Logging reps starts the rest timer (`startRestTimer` stub called once).
  2. `400m Repeats`: the distance input renders, and logging the time alone starts the timer.
  3. `Easy Run 25-30 min` keeps its distance field and pace display.
  4. Analysis weekly distance is unchanged for the same corpus.
- **Test plan:** extend `test-exercise-logger.js`, or add `test-cardio-distance-gate.js`, with a real `wireSetsBlock` in jsdom. Sabotage: restore the old predicate, and criterion 1 fails.
- **Files:** `index.html` (32558, 28741, 31845, 32014–32046), `sw.js`, the test.
- **Risk:** pace and distance tests and the cardio Analysis card. Guarded by the existing distance/pace suites.
- **Status:** ready

### BL-56: `noWeight` on moves that never take load, and load on the ones that do (D-4)
- **Why:**
  - At least 98 slots of pure bodyweight moves show a weight field: Core program d1 Bird Dog, Dead Bug, Side Plank and McGill Curl-up (10037–10041); Bodyweight program Glute Bridge, Bodyweight Squat, Jump Squat, Push-up to Plank and Bicycle Crunch; Jump Rope Bodyweight Squat (15 slots); Single-Leg Bound (12).
  - The Bodyweight program's push, pull and leg moves show one too, against its "no equipment" overview.
  - A weight is required before the set counts (32017), so the rest timer doesn't start.
  - 17 exercises are `noWeight` in some slots and not others.
  - Wall Balls (a loaded ball) and Sled Pull are `noWeight` while Sled Push isn't.
- **Change** (slot field only; keys and logs unchanged):
  - Add `noWeight:true` to every slot of Bird Dog, Dead Bug, Side Plank, McGill Curl-up, Glute Bridge (Bodyweight program), Bodyweight Squat, Jump Squat, Push-up to Plank, Bicycle Crunch and Single-Leg Bound.
  - In the **Bodyweight** program and its variants, add it to Push-up, Pike, Decline Push-up, Triceps Dip, Inverted Row, Chin-up, Pull-ups (or assisted), Nordic Curl, Bulgarian Split Squat and Calf Raise.
  - Remove `noWeight` from Wall Balls and Sled Pull.
  - **Calisthenics** keeps load fields on Dip, Pull-up and Muscle-up (weighted calisthenics is normal).
- **Acceptance criteria:**
  1. A real walk of all slots: none of the listed exercises in the listed programs lacks `noWeight`.
  2. Bodyweight d1 Push-up renders no weight input, and reps alone start the rest timer.
  3. Old entries with a weight still show it in History.
- **Risk:** an owner who logs weighted push-ups in the Bodyweight program loses the field there. That's the owner's call.
- **Status:** needs-owner. **Question:** "Remove the weight box from bodyweight moves in Core, Bodyweight and Jump Rope (Calisthenics keeps it for weighted dips and pull-ups)?"

### BL-57: The rest parser reads trailing multipliers, per-side mobility and swim repeats correctly (D-6, D-11; lands with or after BL-14)
- **Why:**
  - `getRepRangeTier` (27689) reads the first number after `×`. `parseSetCount` (26421) already understands "N reps ×M". With the real `getDefaultRestSeconds`:
    - 61 slots (`5 breaths ×3`, `6 reps ×3`, `3-5 min ×3`: yoga Flow/Hot and all Tai Chi) get **240 s**;
    - about 100 slots of `2×5/side` mobility and technique drills (Hip CARs ×31, Shoulder CARs, World's Greatest Stretch, Pilates Saw, grappling passes, takedowns and submission drills) get 240 s;
    - Single-Leg Bound gets 90 s at `3×6/leg` but 240 s at `3×5/leg`;
    - `8×100m` swim gets 60 s, against its own cue's 15–30 s.
- **Change** (inside `getRepRangeTier` / `getDefaultRestSeconds`, coordinated with BL-14's unit branch):
  1. A trailing multiplier (`/^\d+(-\d+)?\s*(reps?|breaths?|min)[^×]*×\s*\d+\s*$/`) → tier `null`, rest 30 s for breaths/forms, 60 s otherwise.
  2. Category `core` or `shoulder` with `noWeight`, or a name in the mobility set (`EXERCISE_MOVE[name] === 'mobility'`) → never the strength tier; rest 45 s.
  3. Category `jump` → 90 s fixed (120 s for Depth Jump and Trap Bar Jump Squat).
  4. Swim repeats (`\d+×(\d+)m` with a swim name): ≤200 m → 20 s; 201–400 m → 30 s.
  5. `getRestReasonLabel` mirrors every branch.
- **Acceptance criteria:** `getDefaultRestSeconds` returns:
  - Downward Dog `5 breaths ×3` → 30;
  - Hip CARs `2×5/side` → 45;
  - Single-Leg Bound `3×5/leg` and `3×6/leg` → 90 both;
  - Swim Intervals `8×100m` → 20;
  - Bench Press `4×4-6` → 240 (unchanged);
  - Lateral Raise `3×12-15` → unchanged.

  The label agrees with the number for each.
- **Test plan:** new `test-rest-tier-parsing.js`, real functions over a table, plus a full-slot sweep asserting no `core`/`shoulder` `noWeight` slot gets 240. Sabotage: remove branch 1.
- **Files:** `index.html` (27689–27723), `sw.js`, the test.
- **Risk:** the rest timer for every program. Guarded by `test-superset-rest-timer-suppression.js` and `test-backdating-rest-timer-suppression.js`.
- **Status:** ready

### BL-58: Library entries for the Light/Speed variants; prune orphans (D-7, C-1, C-2)
- **Why:**
  - 7 names in 14 slots have no `exerciseInfo`: Squat (Speed), Bench Press (Speed), Deadlift (Light/Technique), Snatch (Light), Clean & Jerk (Light), Sprint Intervals (Sub-Max), Handstand Hold (wall) (Light). They get no cues, no category, no ledger counting and a 5 lb default increment that pushes load on speed work.
  - 6 orphan cycling entries are referenced nowhere (cx:150–157).
  - `EXERCISE_MOVE` has 3 duplicate keys and 85 slot names without an icon key.
- **Change:**
  - Add entries with the base lift's category and three cues each. Speed lifts: "50–60% of your working max; move it as fast as you can; stop if bar speed drops". Light Olympic lifts: "about 70%; technique only; no misses". Plus `technique:true`, which BL-02's technique rule reads (no load increase signal).
  - Delete the 6 orphan entries.
  - Remove the duplicate `EXERCISE_MOVE` keys.
  - Add move keys for the 85 names, using existing `MOVEMENT_ICONS` keys only.
- **Acceptance criteria:**
  1. Every slot name has an `exerciseInfo` entry (full-slot sweep).
  2. `Squat (Speed)` maps to Legs (Quads) in the ledger.
  3. `analyzeProgressionSignal` never returns `increase` for a `technique:true` entry.
  4. No `exerciseInfo` key is unreferenced by slots, `EXERCISE_SUBS`, `SUBSTITUTION_MAP` or `REGION_RELIEF`.
- **Test plan:** new `test-exercise-library-coverage.js` (the sweeps), plus a real-function progression case. Sabotage: delete one new entry.
- **Files:** `content-exercises.js`, `index.html` (13600–13700, analyzeProgressionSignal ~27483), `sw.js`, the test.
- **Risk:** content-only, apart from the technique flag. Depends on BL-02's technique branch if that lands first; otherwise add the flag check here.
- **Status:** ready

### BL-59: Category corrections that feed the muscle ledger (D-8, with M-8)
- **Why:**
  - Band External Rotation (50 slots), Scapular Retraction (40) and Band Pull-Apart (7) count as **Core**.
  - Deep Squat Hold (27), Chair Pose, Horse Stance Hold and Bow Stance Transitions count as **Quads** sets and are accumulation-eligible.
  - Chaturanga (yoga) counts as **Chest & Shoulders** with a +5 lb increment.
  - Wall Slides, Shoulder CARs and Band Dislocates count as Chest & Shoulders hypertrophy work.
  - Sprawl Drills count as Posterior Chain compound work.
  - The per-muscle ledger (BL-20/BL-30) inherits all of this.
- **Change:** recategorise:
  - rotator-cuff and scapular moves → `shoulder`;
  - mobility holds and yoga or Tai Chi stances → `core`;
  - Sprawl Drills → `kick`.

  Land in the same version as M-8's `calf` and `isolation-leg` categories, so `MUSCLE_GROUP_MAP` changes once.
- **Acceptance criteria:**
  1. Ledger fixture: a Mobility week of Deep Squat Holds adds 0 Quads sets.
  2. Accumulation never selects a recategorised exercise.
  3. Region flags: Band External Rotation flags Shoulder.
- **Risk:** past weeks' Analysis group totals change (read-time, no stored data).
- **Status:** needs-owner (with M-8). **Question:** "Re-file mobility holds and band shoulder work so they stop counting as leg, chest or core training volume?"

### BL-60: Substitutes that keep the same muscle and joint (D-9)
- **Why:**
  - `EXERCISE_SUBS`: Tibialis Raise → Standing Calf Raise / Calf Raise is the antagonist (13811).
  - Calf Raise and Standing Calf Raise → Leg Press puts a knee-and-hip compound in a calf slot (13769, 13777).
  - Farmers Carry (Heavy) → Sandbag Lunges goes from a carry to a lunge (13801).
  - `SUBSTITUTION_MAP` names 10 alternatives without `exerciseInfo`, so they show no cues when swapped in.
- **Change:**
  - Tibialis Raise → ['Heel Walk', 'Banded Dorsiflexion'].
  - Calf Raise → ['Standing Calf Raise', 'Single-Leg Calf Raise'].
  - Standing Calf Raise → ['Calf Raise', 'Single-Leg Calf Raise'].
  - Farmers Carry (Heavy) → ['Suitcase Carry', "Farmer's Carry"].
  - Add `exerciseInfo` entries (category plus 3 cues) for the new names and the 10 `SUBSTITUTION_MAP` alternatives.
  - Stored substitute selections keep working: `applyExerciseSubs` applies the stored name regardless of the list.
- **Acceptance criteria:**
  1. Every `EXERCISE_SUBS` target shares the original's `MUSCLE_GROUP_MAP` group (sweep), except listed and justified pairs (Close-Grip Bench ↔ Dip; Olympic pulls → Deadlift).
  2. Every `SUBSTITUTION_MAP` alternative has an entry.
  3. A stored selection of "Leg Press" on a Calf Raise slot still renders and logs to its `:sub:leg-press` key.
- **Test plan:** extend `test-exercise-substitution.js`. Sabotage: restore the Tibialis pair.
- **Files:** `index.html` (13706–13830, 43922), `content-exercises.js`, `sw.js`, the test.
- **Risk:** guarded by the existing substitution and swap tests.
- **Status:** ready

### BL-61: Plyometric prescriptions match their cues (S-2, S-3)
- **Why:**
  - "Single-Leg Bound" is cued as an alternate-leg bound (cx:277), prescribed `/leg`, `/side` or bare (running d6 10370), and shows a weight field in 12 slots.
  - Jump Squat `3×12-15` (bodyweight d5 10148, calisthenics d5 10419, plus 7 variant slots) contradicts its "reset each rep for max power" cue and gets 60 s rest.
  - Fatigued plyometric landings are the injury mechanism the program's own SAF-5 work guards against [PRAC].
- **Change:**
  - Single-Leg Bound cue: "Hop forward off one leg and land on the **same** leg; stick each landing for a beat, knee over toes, no cave-in."
  - All its prescriptions become `/leg` (running d6 `3×6` → `3×6/leg`). `noWeight` comes from BL-56.
  - Jump Squat `3×12-15` → `3×6-8`, plus the cue line "Stop the set when landings get loud or knees cave."
  - Names and slot positions are unchanged (history-safe).
- **Acceptance criteria:**
  1. A sweep: every Single-Leg Bound prescription matches `/\/leg$/`.
  2. No `jump`-category prescription has a top rep above 8.
  3. The rest from BL-57 is 90 s for both.
- **Risk:** prescriptions change in 2 programs plus their variants. Visible, so the What's New line names it.
- **Status:** needs-owner. **Question:** "Change Jump Squat in Bodyweight and Calisthenics from 12-15 to 6-8 reps, and make Single-Leg Bound a true one-leg hop?"

### BL-62: Clinical dose and position wording (S-4, S-5, C-3)
- **Why:**
  - Achilles heel drops are `3×15 (straight-knee…)` with no per-leg dose (12014–12042).
  - ACL `Straight Leg Raise 3×12` (11982) has the same gap.
  - Prenatal d6 `Diaphragmatic Breathing` is cued "Lie down…" (cx:79) while the plan's own Standing Pelvic Tilt cue says to avoid prolonged supine positions [PREG19].
  - Hyrox `Sandbag Lunges 4×20` doesn't say total or per leg.
- **Change** (text only):
  - `3×15/leg (straight-knee, 3s eccentric lower)` and the bent-knee twin;
  - `Straight Leg Raise 3×12/leg` in ACL and rehabGeneral;
  - Diaphragmatic Breathing gets a fourth cue: "Pregnant? Do this seated or lying on your side.";
  - `Sandbag Lunges 4×20 (10/leg)`.
- **Acceptance criteria:**
  1. Real `parseSetCount` and `getRepRangeTier` results are unchanged for each edited string (table test).
  2. BL-01's authored-equals-rendered test still passes, using the new authored strings.
- **Test plan:** extend `test-concise-cues.js`, or add a table test.
- **Files:** `index.html` (11982, 12014–12042, 10998, 11011), `content-exercises.js` (cx:79), `sw.js`, the test.
- **Risk:** clinical-content wording. BIZ-15's clinical review should see it.
- **Status:** ready

### BL-63: The time shown on Today counts the work, not just the rest (D-10, C-5)
- **Why:**
  - Today's `~N min` (28682) comes from `parseEstimatedMinutes` (26461). It counts a distance interval as `count × rest`: `8×100m` swim = 8 min, `4×200m` = 4 min, `6×400m` = 6 min, `6×500m` row = 6 min. Lifting sets count rest only.
  - 251 of 1,065 days show under 0.6× their authored duration (hyrox d6 about 18 vs ~45).
  - The 30/45-min session cap trims against this number, so capped sessions overrun.
  - The authored `duration` is shown only on rest days (28559).
- **Change** (inside `parseEstimatedMinutes`):
  1. Distance sets: work time from a per-activity pace (run 6 min/km, row 2:05/500 m, ski 2:10/500 m, swim 2:00/100 m, sled and carry 0.5 min per 20 m) plus rest.
  2. Rep sets: add 3 s per rep (top of range; ×2 for `/side` or `/leg`).
  3. One warm-up ramp allowance of 4 min per day, for the first `WARMUP_ELIGIBLE` compound.

  The authored `duration` is left alone (no data change). Documented as a reference only.
- **Acceptance criteria:**
  1. `parseEstimatedMinutes({sets:'8×100m', name:'Swim Intervals (100s)'})` is 18 ± 2.
  2. Strength d1 total is within ±15% of its authored ~55.
  3. The share of days under 0.6× authored drops below 5% (full sweep in the test).
  4. The session cap still never drops the protected main unit (`test-session-actions.js` or the existing cap tests).
- **Test plan:** extend the session-length tests with real functions and the sweep. Sabotage: remove the distance branch, and criterion 1 fails.
- **Files:** `index.html` (26461–26515, 26580), `sw.js`, the test.
- **Risk:** how much the session cap trims changes for every program. Check the cap tests' expected outputs and update them only where the new estimate is the reason.
- **Status:** ready

### BL-64: Cue contradictions (C-4)
- **Why:** these cues contradict the app's own squat cues or the evidence:
  - Chair Pose (cx:21) and Partner Chair Pose (cx:50) say knees must not pass the toes [FRY03];
  - Good Morning (cx:180) says "keep the bar path close to your body";
  - Front Lever Hold (cx:171) says "hips slightly tucked";
  - Hammer Curl (cx:241) puts the forearm emphasis on tempo;
  - Hanging Leg Raise (cx:242) says the eccentric is "where the core works hardest".
- **Change** (text only):
  - Chair and Partner Chair: "Let the knees travel forward as far as your heels stay down."
  - Good Morning: "Hinge until your torso nears parallel or your back starts to round, whichever comes first."
  - Front Lever: "Too hard? Tuck the knees to the chest and extend one leg as you progress."
  - Hammer Curl: "The neutral grip shifts work to the brachioradialis; keep the tempo you use for other curls."
  - Hanging Leg Raise: "Lower under control to a full hang."
- **Acceptance criteria:** the new strings render in `buildDetailsHtml`. The phrase "not past" is absent from every squat-pattern cue (sweep).
- **Test plan:** extend `test-concise-cues.js`.
- **Files:** `content-exercises.js`, `sw.js` (version), the test.
- **Risk:** none beyond copy. Merge with BL-25 if it's still open.
- **Status:** ready
