# Backlog: Training Log

Owner: project-manager. Written 2026-11-07 against **v3.514**. The baseline was green: `check.sh` passed and 198/198 `test-*.js` suites passed. Line numbers are `index.html` at v3.514 unless a file is named. **Every build run re-greps them before editing:** each shipped item shifts the lines below it.

**Rules for every item** (CLAUDE.md, `planning/toolchain.md` §5–6):
- One item = one version. `APP_VERSION` (7622) and `sw.js` `VERSION` are bumped together, plus a `WHATS_NEW` entry (7634).
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
  - Custom programs (`isCustomProgramKey`, 14735) **keep today's behaviour**, so this item changes nothing outside the four built-ins.
  - In `applyGoalVolume`, exercises in the `jump` category are never changed.
  - `applyDeloadVolumeReduction` (26842) is untouched: deload still applies everywhere.
- **Acceptance criteria:**
  1. For every day of every `MEDICAL_STYLES` key (11352), and of `senior`, `pilates`, `mobility`, `desk`, `yoga`, `core`, `athletic`, `combat`, `watersports`: × goals {gain, leanbulk, performance} × weeks 1–4, the `sets` string after all three modifiers equals the authored string.
  2. `strength` d1 with goal gain, week 3 still gains sets exactly as it does today. Assert one known exercise's `sets` before and after.
  3. Athletic d4 Depth Jump stays `4×5` under goal gain.
  4. A custom program key gets the same output as today.
  5. `renderWorkout` passes `activeProgram` to all three call sites. Count 3 real call expressions carrying `activeProgram`, ignoring comments.
- **Test plan:** new `test-volume-modifier-gate.js`. Extract the real `applyGoalVolume`, `goalVolumeAdjustment`, `applyAccumulation`, `applyAccumulationAccessory`, `cycleWeekOf`, set-string helpers, `programs`, `MEDICAL_STYLES` and the other `*_STYLES`, plus `exerciseInfo` from `content-exercises.js`. Sabotage: remove the gate, and criterion 1 must fail.
- **Files:** `index.html` (26659, 26747, 26834, 28610, 28634–28635), `sw.js`, the new test.
- **Risk:**
  - Accumulation behaviour on the four lifting programs. Guarded by `test-accumulation-accessory-add.js` and `test-mesocycle-phase-tag.js`.
  - `applyGoalVolume` has no prior test; this item adds the first.
  - The phase tag will still read "Accumulation" on gated programs. Flag it; don't fix it here.
- **Status:** ready

### BL-02: RPE caps for clinical programs; RPE mode off for technique lifts (SAF-2)
- **Why:** `RPE_BY_CYCLE_WEEK` (27409) reaches RPE 9 in week 4 for any exercise with an e1RM.
  - The hypertension plan says to avoid near-maximal lifts [AHA23].
  - A 5×2 snatch at RPE 9 is about 91% of an Epley e1RM, which isn't valid for technical lifts [ACSM26][PRAC].
  - The target is computed twice, separately: `buildProgressBadge` 27746 and `computeSuggestedSet` 27825.
- **Change:**
  - One helper, `rpeTargetFor(week, inDeload, program, category)`, used by both sites (consolidation). It returns:
    - `null` for categories `oly`, `jump` and `throw`. The RPE path is then skipped, falling back to double progression, and the badge shows "Technique lift: stop each set with 2–3 clean reps left."
    - `min(weekTarget, 7)` (RIR ≥ 3) when `program === 'medical'` or `'senior'`. Prenatal and postpartum are `MEDICAL_STYLES` keys, so they're covered.
  - `rpeCtx` (28766) gains `program: activeProgram`.
- **Acceptance criteria:**
  1. With `loadSuggestionMode='rpe'`, medical/hypertension, week 4: the badge shows `RPE 7` and the suggested load equals `loadForRpeTarget(e1rm, reps, 7)`.
  2. With `oly` Snatch, week 4: `loadForRpeTarget` is called **0** times (stub-counted). `computeSuggestedSet` returns the double-progression result, and the badge contains "Technique lift".
  3. Strength program Back Squat, week 4: still RPE 9.
  4. Deload week: RPE 6 everywhere.
  5. `RPE_BY_CYCLE_WEEK[` is read only inside `rpeTargetFor` and `targetRpeForWeek` (real-code count).
- **Test plan:** new `test-rpe-safety-caps.js`, with a real invocation of `buildProgressBadge` and `computeSuggestedSet`. Sabotage: drop the cap.
- **Files:** `index.html` (27409–27413, 27742–27760, 27812–27836, 28766), `sw.js`, the test.
- **Risk:** RPE badge rendering. Guarded by `test-progress-badge-rpe-teal.js`, `test-today-workout-emoji.js` and `test-deload-signal-week-awareness.js`.
- **Status:** ready

### BL-03: Per-exercise body-region override for resting-region flags (SAF-3, part 1)
- **Why:** `CATEGORY_TO_REGIONS` (43894) misses several loads:
  - Neck Bridges (`core`) never flag Neck.
  - Hangboard (`pull`) never flags Hands/Fingers.
  - Calf Raise and Eccentric Heel Drop (`arms`) flag Elbow/Wrist instead of Ankle/Foot.
  - Leg Curl and Nordic Curl (`hinge`) never flag Knee.
- **Change:**
  - Add `EXERCISE_REGION_OVERRIDE`, with exactly the audit's map:
    - Neck Bridges → Neck, Upper Back.
    - Hangboard Max Hang, Hangboard Repeaters, Lock-off Hold → Hands/Fingers, Elbow/Wrist, Shoulder.
    - Calf Raise, Standing Calf Raise, Eccentric Heel Drop, Tibialis Raise → Ankle/Foot, Shins.
    - Leg Curl, Nordic Curl → Knee, Hip.
    - Wall Balls, Sled Push → Knee, Lower Back.
  - One helper, `regionsForExercise(name, category)`, replaces both direct lookups: the session heads-up at 14535 and the row caution at 29023.
  - Categories are unchanged (M-8 is BL-40).
- **Acceptance criteria:**
  1. With "Hands/Fingers" resting, the row for Hangboard Max Hang renders `.ex-caution`.
  2. With "Ankle/Foot" resting, Eccentric Heel Drop renders a caution, and with "Elbow/Wrist" resting it does **not**.
  3. With "Knee" resting, Leg Curl renders a caution.
  4. Bench Press is unchanged.
  5. There is exactly 1 real `CATEGORY_TO_REGIONS[` lookup (inside the helper) and 2 real `regionsForExercise(` call sites.
- **Test plan:** new `test-region-override.js`: the real helper, plus the real `CATEGORY_TO_REGIONS` and the override map. Sabotage: empty the override map.
- **Files:** `index.html` (43894, 14535, 29023), `sw.js`, the test.
- **Risk:** `CATEGORY_TO_REGIONS` has no test today. Care flows are guarded by `test-care-2-0.js` and `test-resting-region-since-tracking.js`.
- **Status:** ready

### BL-04: Exercise-specific substitutes for the overridden exercises (SAF-3, part 2)
- **Why:** `suggestSubstitute` (43928) picks by category. That means a resting Achilles gets "Wrist Flexor Stretch" for a heel drop (the `arms` alts at 43918), and a hangboard gets "Chest-Supported Row".
- **Change:** an `EXERCISE_SUBSTITUTE_OVERRIDE`, consulted first in `suggestSubstitute(category, name)`:
  - heel drop and calf raises → "Isometric Calf Hold (wall-supported)", why: "keeps the tendon loaded without movement";
  - the three hangboard entries → "Feet-on Hang (open hand)";
  - Neck Bridges → "Neck Isometric (hand resistance)".
- **Acceptance criteria:**
  1. `suggestSubstitute('arms','Eccentric Heel Drop').name === 'Isometric Calf Hold (wall-supported)'`.
  2. `suggestSubstitute('arms','DB Curl')` is unchanged.
  3. The rendered caution for a heel drop with Ankle/Foot resting contains "Isometric Calf Hold".
- **Test plan:** extend `test-exercise-substitution.js`. Sabotage: remove the override lookup.
- **Files:** `index.html` (43911–43933), `sw.js`, the test.
- **Risk:** existing substitution suggestions. Guarded by `test-exercise-substitution.js`.
- **Status:** ready

### BL-05: Depth Jump prerequisite and box height in the cue (SAF-5, part 1)
- **Why:** Depth Jump appears with no box height or landing prerequisite:
  - Athletic d4 (9980);
  - skimboarding d6 (12604);
  - wakeboarding d1 (12620), a sport whose own `basis` cites a 42% ACL-tear rate;
  - kite d2 (12687).

  Day-level `note` renders only on rest days (28566), so the audit's "first 4 weeks note" has no render path. The cue is the reliable place.
- **Change:** in `content-exercises.js:237` (`'Depth Jump'` cues), add:
  - "Box 30–45 cm (12–18 in), no higher.";
  - "Prerequisite: land a 30 cm drop 3×5 with knees over toes and no inward collapse first."

  Set counts are unchanged.
- **Acceptance criteria:** the rendered technique cues for Depth Jump (the real `exerciseInfo`, through the real cue renderer) contain "30–45 cm" and "Prerequisite". Every program's Depth Jump `sets` string is unchanged.
- **Test plan:** extend `test-concise-cues.js`, or add `test-safety-cues.js`, shared with BL-06. Sabotage: revert the cue.
- **Files:** `content-exercises.js`, `sw.js` (version and precache), the test.
- **Risk:** cue-length rules. Guarded by `test-concise-cues.js`.
- **Status:** ready

### BL-06: Release rule on partner submission and clinch drills (SAF-6)
- **Why:** these cues describe applying a choke or armbar with no release rule:
  - Rear Naked Choke Drill (`content-exercises.js:346`);
  - Armbar from Guard Drill (347);
  - Clinch Knee Drills (9), which don't say to use pads.
- **Change:** add one cue to each:
  - "Drill at 30–50% pressure; your partner taps or says tap, you release instantly.";
  - "Knees go into a pad your partner holds, at controlled speed."
- **Acceptance criteria:** each of the three rendered cue lists contains its new line. The cue counts of every other exercise are unchanged.
- **Test plan:** `test-safety-cues.js` (with BL-05). Sabotage: drop one cue.
- **Files:** `content-exercises.js`, `sw.js`, the test.
- **Risk:** cue-length caps. Guarded by `test-concise-cues.js`.
- **Status:** ready

## Ready: correctness of what exists (audit High, then Medium)

### BL-07: The performance goal no longer cuts strength-tier work (H-1)
- **Why:** `applyGoalVolume` caps compounds at 3 sets for `performance`:
  - Powerlifting Squat 5×5 → 3×5;
  - Snatch 5×2 → 3×2.

  Yet `PROGRAM_FIT_SCORES.performance` (33543) ranks oly 85 and powerlifting 70. The stand's 2–3 sets is a minimum, not a sport ceiling [ACSM26]; accumulated heavy volume drives strength [PEL].
- **Change:** in the `strength` branch of `applyGoalVolume` (26681–26689), skip when `getRepRangeTier(ex.sets) === 'strength'` (27678) **or** the program is `powerlifting`, `oly` or `powerbuilding`. This uses BL-01's `program` argument.
- **Acceptance criteria:**
  1. With goal performance: powerlifting d1 Squat stays `5×5`; oly Snatch stays `5×2`.
  2. Strength & Size: an 8–12 compound at 4 sets → 3 sets, unchanged from today.
- **Test plan:** extend `test-volume-modifier-gate.js`. Sabotage: remove the skip.
- **Files:** `index.html` (26659–26691), `sw.js`, the test.
- **Risk:** depends on BL-01 shipping first. Same guards.
- **Status:** ready (after BL-01)

### BL-08: Double progression requires every working set at the top of the range (H-2)
- **Why:**
  - `buildPastSessions` (27530) keeps only `topSetOf` (27150). A 4×4–6 with sets of 6, 5, 4, 4 therefore says "add 10 lb".
  - The app's own tip (33105) says "on all sets".
  - Coached double progression (GZCLP, Helms) needs all sets at the top of the range [PRAC]. Hevy Trainer does the same (research §3).
- **Change:**
  - `buildPastSessions` adds `minRepsAtTop`: the minimum reps across the sets logged at the top weight.
  - `analyzeProgressionSignal` (27477), signal 3: increase when `minRepsAtTop >= topRep` at the same load, either:
    - in 1 session with average RPE ≤ 8; or
    - in 2 consecutive sessions when RPE wasn't logged.
  - `computeSuggestedSet` branch 4 (27892–27896) and the matching `buildProgressBadge` branch (27783) both require all sets at the top. They need `priorTop` plus the prior entry's sets, passed from 28749.
  - `recommendNextSet` (30740) is set-to-set and stays as it is.
- **Acceptance criteria:**
  1. Pyramid case, prior session sets {6, 5, 4, 4} at 185 on `4×4-6`: signal ≠ increase, `computeSuggestedSet` returns `null` or the same weight, and the badge doesn't say "add".
  2. All sets {6, 6, 6, 6} at RPE 8 in one session: increase.
  3. Two sessions of {6, 6, 6, 6} with no RPE: increase.
  4. One session with no RPE: no increase.
- **Test plan:** new `test-all-set-double-progression.js`, calling the real three functions with fixture logs. Sabotage: revert to `topSetOf`. Re-run the 9 suites that already extract `analyzeProgressionSignal` (listed under Risk).
- **Files:** `index.html` (27477–27545, 27742–27800, 27812–27900, 28749), `sw.js`, the test.
- **Risk:** progression is the most-tested area. Guards:
  - `test-program-fit-trend.js`, `test-deload-signal-week-awareness.js`;
  - `test-auto-check-sets.js`, `test-set-next-button.js`, `test-partial-set-reactions.js`;
  - `test-fallback-entry-consolidation.js`;
  - `test-backdating-rest-timer-suppression.js`, `test-superset-rest-timer-suppression.js`, `test-superset-shared-sets-block-wiring.js`.

  The cross-program fallback (`priorSetForSlot`, 27799) must keep its single-basis behaviour.
- **Status:** ready

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
- **Why:** `CYCLE_PHASES[*].training` (39056, 39064, 39072, 39080) presents the follicular phase as "a strong window" and suggests testing heavy lifts at ovulation. An umbrella review finds no consistent phase effect [MC23].
- **Change:** each `training` line becomes "Research shows no reliable phase effect on strength or muscle gain. Train to your plan and adjust to how you feel on the day." The symptom, hormone and nutrition text is kept.
- **Acceptance criteria:** all four rendered phase cards show the new line. `nutrition` and `physical` are unchanged.
- **Test plan:** extend `test-cycle-phase.js`. Sabotage: restore one line.
- **Files:** `index.html` (39050–39085), `sw.js`, the test.
- **Risk:** cycle-phase insights. Guarded by `test-cycle-phase.js`, `test-cycle-phase-nutrition-insight.js` and `test-supplement-condition-cycle-nudge.js`.
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
- **Why:** Neck Bridges, "bridge onto the top of your head", unsupervised, at grappling d6 (11042, 21268). No trial supports either option for injury prevention [PRAC].
- **Change:** rename the slot to "4-Way Neck Isometric (hand or band)", 4 directions × 15 s each at about 50% effort, with a new `exerciseInfo` entry.
- **Acceptance criteria:** the grappling d6 slot renders the new name and cues, and the old slot's history stays reachable.
- **Test plan:** new test, plus a migration test if chosen.
- **Risk:** history is keyed by position, so the old neck-bridge log would show under the new name.
- **Status:** needs-owner. **Question:** "Swap Neck Bridges for a neck isometric in the same slot, and should your past neck-bridge sets carry over or be archived?"

### BL-36: Add a "Drop Landing" progression to the ACL-risk watersports days (SAF-5, part 2)
- **Why:** landing prerequisites come before depth jumps [PRAC]. Wakeboarding's own basis cites a 42% ACL-tear rate.
- **Change:** append "Drop Landing (stick it) 3×5" to the end of wakeboarding d1 and kite d2. Appending is safe for history.
- **Acceptance criteria:** the last exercise on those days is Drop Landing, and the earlier `exKey`s are unchanged.
- **Test plan:** extend `test-watersports-program.js`.
- **Risk:** sessions get about 4 minutes longer.
- **Status:** needs-owner. **Question:** "Append a drop-landing drill to wakeboarding Day 1 and kite Day 2 (about +4 min)?"

### BL-37: Rebuild the low day-count variants (H-3)
- **Why:** Bodybuilding 3-day doses chest at 3 sets a week and glutes at 0. Powerlifting 3-day trains each lift 1×/wk [ACSM26][PEL][FREQ19].
- **Change:** the audit's H-3 layouts: Bodybuilding 3-day becomes Full Body A/B/C, Bodybuilding 4-day gets appends, and Powerlifting 3-day gets a heavy main lift plus a volume lift each day.
- **Acceptance criteria:** computed weekly sets meet the H-3 targets (chest 9, back 12, ...) in a test using BL-20's ledger.
- **Risk:** this rewrites variant slots, so it needs `SCHEMA_VERSION` (7623) / `runMigrations()` (9070) for any history on those variants.
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

## Parked or later (not yet itemised)
- **M-8:** `calf` and `isolation-leg` categories. These shift `MUSCLE_GROUP_MAP` history groupings, so they need the owner. BL-03 and BL-04 cover the safety half now.
- **L-3:** check whether "Squat (Speed)", "Bench Press (Speed)" and "Deadlift (Light/Technique)" have `exerciseInfo` entries.
- **Program extensions:**
  - H-8 progression ladders;
  - Powerlifting top single and peak block;
  - Olympic % bands and a miss counter;
  - athletic performance metrics;
  - running, cycling and swimming volume progression.
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
- **Status:** ready

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
- **Test plan:** extend the share-card coverage with a stub canvas. Sabotage: drop the append.
- **Risk:** it advertises the app's public address on every share, before the owner has decided to go public (BIZ-12).
- **Status:** needs-owner. **Question:** "Put the app's public web address on every share card and share message?" **Recommendation:** yes, once BIZ-12 settles the address (GitHub Pages now, the store link later).

### BIZ-12: Go public: where, and under what name
- **Why:** with no store listing, a generic name and an empty README, nobody can find the app (business.md §5.1). The Capacitor track creates the store build; the business needs the owner's decision to list it.
- **Change:** none in code until answered. The answer unlocks BIZ-08 and BIZ-16 and the marketing launch plan.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §6.
- **Status:** needs-owner. **Question:** "Do you want Training Log public (Google Play first via the Capacitor build, then the App Store), and do you keep the name 'Training Log' or let marketing propose an ownable one?" **Recommendation:** Play first (Android is the Capacitor track's target, and the Play fee is one-time); let marketing propose names before the listing.

### BIZ-16: A privacy policy page
- **Why:** store listings for apps handling health data require a privacy policy (business.md §6). Ours would be unusually short and strong: logs stay on device; food queries go to USDA and Open Food Facts; AI calls go to Anthropic only with your own key; no analytics.
- **Change:** a static `privacy.html` beside `index.html`. Text only, linked from Settings and the README.
- **Acceptance criteria:** every third-party host the app can contact (grep of `fetch(` targets) is named in the page. Checked by a test that greps the real `fetch` URLs.
- **Risk:** legal text. The owner must approve the wording.
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
- **Acceptance criteria:** choosing any `MEDICAL_STYLES` key the first time shows the acknowledgement, once (stored with `window.storage`).
- **Status:** needs-owner. **Question:** "Before going public, add a one-time care-team acknowledgement to clinical programs and have their claims reviewed (by you or a clinician)?" **Recommendation:** yes. Keep the programs, because they're a differentiator no competitor has.

### BIZ-11: Business model
- **Why:**
  - Free with no ads is the positioning (research §4 complaints).
  - Running costs exist only for hosted AI and sync.
  - Category subscriptions reportedly convert well, but only through store billing (business.md §3; RevenueCat 2025 via Athletech News, secondary).
- **Change:** none until answered.
- **Status:** needs-owner. **Question:** "Commit publicly to 'free core, no ads, ever', with any future paid tier limited to things that cost money to run (hosted AI, encrypted sync)?" **Recommendation:** yes. Decide on a paid tier only after the store build has 90 days of retention data.

### BIZ-13: Off-device backup or sync
- **Why:**
  - One lost phone loses everything (business.md §5.3).
  - BIZ-04 and BL-22 reduce the risk, but they're manual.
  - A real fix moves data off the device: an export to the user's own iCloud or Drive through the share sheet, or encrypted sync on a server.
- **Change:** none until answered.
- **Status:** needs-owner. **Question:** "Should the app offer automatic backup off the device, either to your own iCloud or Google Drive (no server of ours) or to an encrypted sync service (needs a server and accounts)?" **Recommendation:** own-cloud file export first (no server, privacy promise intact); a sync service only alongside BIZ-11's paid tier.

### BIZ-14: Hosted AI for people without a key
- **Why:** the AI features need the user's own Anthropic key (6630), which blocks almost every new user (business.md §5.4). Hosting them needs a server, a key we pay for, and abuse limits.
- **Change:** none until answered. BIZ-06 makes the current state honest in the meantime.
- **Status:** needs-owner. **Question:** "Run the AI features on a server we pay for, so users don't need their own key?" **Recommendation:** not yet. Revisit with BIZ-11 once retention is known. Today AI is a power-user extra, not the core.
