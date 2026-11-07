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
- **Test plan:** new `test-share-card-url.js`, with the real `buildShareCardBlob` and share handler, a stub canvas and a stub `navigator.share`. Sabotage: drop the append, and the share-text assertion must fail.
- **Files:** `index.html` (7622, 29510, ~29620), `sw.js`, the test.
- **Risk:** it advertises the app's public address on every share, before the owner has decided to go public (BIZ-12).
- **Status:** needs-owner. **Question:** "Put the app's public web address on every share card and share message?" **Recommendation:** yes, once BIZ-12 settles the address (GitHub Pages now, the store link later).

### BIZ-12: Go public: where, and under what name
- **Why:** with no store listing, a generic name and an empty README, nobody can find the app (business.md §5.1). The Capacitor track creates the store build; the business needs the owner's decision to list it.
- **Change:** none in code until answered. The answer unlocks BIZ-08 and BIZ-16 and the marketing launch plan.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §6.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:** going public turns the clinical programs into a health-claim question (BIZ-15) and requires a privacy policy (BIZ-16). Neither should lag the listing.
- **Status:** needs-owner. **Question:** "Do you want Training Log public (Google Play first via the Capacitor build, then the App Store), and do you keep the name 'Training Log' or let marketing propose an ownable one?" **Recommendation:** Play first (Android is the Capacitor track's target, and the Play fee is one-time); let marketing propose names before the listing.

### BIZ-16: A privacy policy page
- **Why:** store listings for apps handling health data require a privacy policy (business.md §6). Ours would be unusually short and strong: logs stay on device; food queries go to USDA and Open Food Facts; AI calls go to Anthropic only with your own key; no analytics.
- **Change:** a static `privacy.html` beside `index.html`. Text only, linked from Settings and the README.
- **Acceptance criteria:**
  1. Every third-party host the app can contact (the hosts in the real `fetch(` call expressions in `index.html`, comments excluded) is named in `privacy.html`.
  2. `privacy.html` contains no analytics or tracking script tag (count 0).
  3. Settings has one link whose `href` is `privacy.html`.
- **Test plan:** new `test-privacy-policy-hosts.js`: parse the real `fetch(` targets out of `index.html`, then load `privacy.html` in jsdom and assert each host appears in its text. Sabotage: add a fake `fetch('https://example.org')` to the extracted source, and criterion 1 must fail.
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
- **Acceptance criteria:**
  1. Choosing any `MEDICAL_STYLES` key (11352) for the first time shows the acknowledgement.
  2. After it's acknowledged, choosing the same or another clinical program doesn't show it again (stored with `window.storage`).
  3. Choosing a non-clinical program never shows it.
- **Test plan:** new `test-clinical-ack.js`, with the real program-switch path (`saveActiveProgram`, 14888) and a stub `window.storage`. Sabotage: skip the stored flag, and criterion 2 must fail.
- **Files:** `index.html` (11352, 14888, program picker), `sw.js`, the test. The `basis` review touches `content-citations.js` and program `basis` strings only after the owner decides who reviews them.
- **Risk:**
  - Health-claim and legal wording; the owner (or a clinician) must approve it.
  - One extra tap on clinical programs, once. Guarded by `test-program-recommendation.js`.
- **Status:** needs-owner. **Question:** "Before going public, add a one-time care-team acknowledgement to clinical programs and have their claims reviewed (by you or a clinician)?" **Recommendation:** yes. Keep the programs, because they're a differentiator no competitor has.

### BIZ-11: Business model
- **Why:**
  - Free with no ads is the positioning (research §4 complaints).
  - Running costs exist only for hosted AI and sync.
  - Category subscriptions reportedly convert well, but only through store billing (business.md §3; RevenueCat 2025 via Athletech News, secondary).
- **Change:** none until answered.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §3, and BIZ-07's README copy matches it.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:** a public "free forever" promise is hard to take back. Scope it to the core (logging, programs, progression).
- **Status:** needs-owner. **Question:** "Commit publicly to 'free core, no ads, ever', with any future paid tier limited to things that cost money to run (hosted AI, encrypted sync)?" **Recommendation:** yes. Decide on a paid tier only after the store build has 90 days of retention data.

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
- **Status:** needs-owner. **Question:** "Should the app offer automatic backup off the device, either to your own iCloud or Google Drive (no server of ours) or to an encrypted sync service (needs a server and accounts)?" **Recommendation:** own-cloud file export first (no server, privacy promise intact); a sync service only alongside BIZ-11's paid tier.

### BIZ-14: Hosted AI for people without a key
- **Why:** the AI features need the user's own Anthropic key (6630), which blocks almost every new user (business.md §5.4). Hosting them needs a server, a key we pay for, and abuse limits.
- **Change:** none until answered. BIZ-06 makes the current state honest in the meantime.
- **Acceptance criteria:** the owner's answer is recorded in `planning/business.md` §3.
- **Test plan:** none; a decision, not code.
- **Files:** `planning/business.md`.
- **Risk:** recurring API cost, abuse limits, and user prompts (food photos, health data) going to a server we run. That breaks the privacy promise unless it's clearly opt-in.
- **Status:** needs-owner. **Question:** "Run the AI features on a server we pay for, so users don't need their own key?" **Recommendation:** not yet. Revisit with BIZ-11 once retention is known. Today AI is a power-user extra, not the core.

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
- **Status:** ready

---

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
- **Status:** ready

### MKT-02: Share cards carry no body data by default
- **Why:** the week card's third row falls back from average sleep to **average body weight**, then **average intake** (`archiveCurrentWeek`, 45459–45464). Body weight is the most sensitive number in the app, and it lands on a public image without the person choosing it. Sleep is also health data.
- **Change:**
  - The week card's third row becomes training-only: "PRs THIS WEEK" when there was at least one, else "SETS" (total logged sets that week). Sleep, weight and intake rows are removed from the card.
  - Share text follows the card (it's built from `stats` in `shareCelebrationCard`, 29617).
  - No setting is added in this item. If people ask for body stats on cards, that's a later opt-in item.
- **Acceptance criteria:**
  1. With weight, intake and sleep all logged that week, the `stats` passed to `shareCelebrationCard` contain no label in {AVG WEIGHT, AVG INTAKE, AVG SLEEP}.
  2. With 2 PRs that week, the third row is `{value:'2', label:'PRs THIS WEEK'}`; with none, it's the set count.
  3. The share text passed to a stubbed `navigator.share` contains no weight unit next to "AVG".
- **Test plan:** new `test-share-card-privacy.js`. Run the real `archiveCurrentWeek` share-stat path with stub storage, and capture the click handler's `cardData` through a stubbed `shareCelebrationCard`. Sabotage: restore the weight fallback, and criterion 1 must fail.
- **Files:** `index.html` (45450–45472), `sw.js`, the test.
- **Risk:** low. Guarded by `test-archive-week-visibility.js` and `test-week-progress.js`.
- **Status:** ready

### MKT-03: Story-format share cards with the app's mark
- **Why:**
  - Cards are 1080×1080 (`buildShareCardBlob`, 29510). Instagram and WhatsApp stories, where achievement shares mostly go, are 9:16, so a square gets letterboxed.
  - The footer is the plain text "TRAINING LOG". The icon's ring mark, the most recognisable brand asset, appears nowhere on a card.
- **Change:**
  - `buildShareCardBlob(cardData, format)`: `format` is `'story'` (1080×1920, the new default) or `'square'` (today's layout, unchanged).
  - In story format, keep the icon, headline, detail and stats between y = 250 and y = 1620 (clear of the story UI at the top and bottom).
  - Draw the ring mark (the icon's ring with its one coloured segment, as canvas arcs, not an image file) above a wordmark at the bottom. Leave a reserved line under it for BIZ-08's address.
  - The file name becomes `training-log-<kind>-<YYYY-MM-DD>.png`.
  - Colour and type follow `planning/design-vision.md` §3: a flat ink ground with no gradient or glow, the session day's spot ink as the one colour, Archivo for the big figure if UX-02 is approved, else Geist. If the vision's own card items land first, this item only adds the format and the mark to them.
- **Acceptance criteria:**
  1. With a stub canvas, `buildShareCardBlob(card)` sets `canvas.width === 1080` and `canvas.height === 1920`; with `'square'`, 1080×1080.
  2. In story format, every `fillText` call's y is between 250 and 1700 (stub-recorded).
  3. The mark is drawn: at least one `arc` call (stub-counted) in both formats.
  4. The square format's `fillText` calls equal today's for the same `cardData`, except the footer (record before and after; sabotage-anchored).
- **Test plan:** new `test-share-card-format.js`, with the real `buildShareCardBlob`, `wrapCanvasText` and `celebrationIconPath`, and a recording stub 2D context. Then render real PNGs in Playwright for the PR, streak and week cards in both formats and attach them to the PR. Sabotage: drop the format switch, and criterion 1 must fail.
- **Files:** `index.html` (29468–29640), `sw.js`, the test.
- **Risk:** visual. The design-engineer reviews the rendered PNGs. If the owner renames the app (MKT-09), only the wordmark string changes.
- **Tools:** `Skill: impeccable` (`polish`) on the rendered cards.
- **Status:** ready

### MKT-04: Share a finished session
- **Why:** finishing a session is the most frequent earned moment (every training day), and its celebration (`triggerCelebration('flag', 'Session complete!', …)`, 29263) has no share button. PR and streak celebrations already pass `shareData`.
- **Change:**
  - Pass `shareData` to that call: `{icon:'flag', headline:'SESSION COMPLETE', stats:[…]}`, with the day label ("Upper · Strength"), sets logged today on that day, total load (sum of weight × reps, shown with `fmtWeight`), and "PRs: n" when there was at least one.
  - No share data when `activeProgram` is a `MEDICAL_STYLES` key.
- **Acceptance criteria:**
  1. Completing the last exercise of a day with 18 logged sets calls `triggerCelebration` with `shareData.stats` containing `{value:'18', label:'SETS'}`.
  2. The load row equals the sum of weight × reps over that day's logged sets (computed from the fixture, not hard-coded).
  3. With a `MEDICAL_STYLES` program active, `shareData` is undefined.
  4. `triggerCelebration` is still called exactly once per completing click (count real calls).
- **Test plan:** new `test-session-share.js`, driving the real checkbox `change` handler in jsdom with stub storage. Sabotage: drop `shareData`, and criterion 1 must fail.
- **Files:** `index.html` (29240–29270), `sw.js`, the test.
- **Risk:** the 5-second banner hold applies whenever there's share data (29464), so the session banner stays up longer. That's intended; check it doesn't cover gym mode's exit control in Playwright.
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
- **Status:** ready

### MKT-06: Year in Lifting (an annual recap, on device)
- **Why:** annual recaps are the largest share event in consumer apps: Spotify reports 500 million Wrapped shares in about 24 hours (company-reported, marketing.md §3.1). Strava's "Year in Sport" is the fitness version, but it's for subscribers only. A free, private, on-device version is on-brand and recurs every December.
- **Change:**
  - From 1 December to 15 January, with at least 8 training dates in the year: one row in Today's Priorities ("Your 2026 in lifting is ready") and an entry in History.
  - It opens a short sequence of 4–5 story cards (MKT-03's format), each with its own share button: sessions and weeks trained; total sets and load lifted; the biggest e1RM gain (lift and amount); the most-trained muscle group (from the existing muscle mapping); the longest weekly streak (MKT-01).
  - All computed on the device from `activity-dates`, `week-archive` and the set history. No body weight, food or health data on any card.
  - Rendered as a view section using existing patterns (`VIEW_RENDERERS`/`showView`, `expand-wrap`); no new view framework.
  - "Hide" is stored with `window.storage` (`recap-<year>-dismissed`).
- **Acceptance criteria:**
  1. With a fixture year of 120 training dates, the computed recap's `sessions === 120`, and the total sets and load equal sums over the fixture.
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
- **Status:** ready

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
- **Status:** ready

### MKT-09: The public name
- **Why:** "Training Log" is a category description. The App Store already lists Training Tracker, TrainLog, LiftLog, StrengthLog, Workout Log and Lift Notes (marketing.md §2.1). It can't be owned in search or as a trademark.
- **Change:** none until answered. If yes: one version changes the manifest `name`/`short_name`, `<title>`, `apple-mobile-web-app-title`, the share-card wordmark and the What's New text ("Training Log is now Chalklog. Same app, same data."). Storage keys keep the `trainingLog_` prefix: never rename namespaced keys.
- **Acceptance criteria:** the owner's answer is recorded in `planning/marketing.md` §2.1. The follow-up item writes its own criteria, including "no localStorage key changes".
- **Test plan:** none until answered.
- **Files:** `planning/marketing.md`; later `manifest.json`, `index.html` head, `sw.js`.
- **Risk:** a domain costs money, and the name needs a trademark clearance check. A rename confuses existing installs unless What's New explains it.
- **Status:** needs-owner. **Question:** "Rename the public app to 'Chalklog' (store title 'Chalklog: Training Log'), after buying chalklog.app and a USPTO clearance search, with 'Liftnext' as the fallback?" **Recommendation:** yes. Decide before the store listing (BIZ-12), not after it.

### MKT-10: Share a program as a link
- **Why:** people pass programs to training partners. A link that opens the app with the program ready to import is a referral that carries real value, and it needs no server: the program goes in the URL fragment (`#p=…`), which browsers never send to the server.
- **Change (if approved):** "Share this program" on custom programs builds `PUBLIC_APP_URL + '#p=' + base64url(JSON)`. On load, the app reads the fragment (following the `launchViewFromUrl` pattern, 40172), validates it against the custom-program shape, shows a preview and imports only after a tap. The fragment is stripped after reading.
- **Acceptance criteria:** a round trip reproduces the program exactly; a malformed or oversized payload is rejected with a message and writes nothing; nothing is imported without the confirm tap.
- **Test plan:** new `test-program-link.js` with the real encode, decode and validate functions. Sabotage: skip validation, and the malformed case must fail.
- **Files:** `index.html` (custom programs near 14735 and 15471; 40172), `sw.js`, the test.
- **Risk:** the URL is untrusted input (`Skill: security-review`). It depends on the public address (BIZ-08, BIZ-12).
- **Status:** needs-owner. **Question:** "Allow custom programs to be shared as links that carry the program in the link itself (no server), once the app has a public address?" **Recommendation:** yes, after BIZ-08.

### MKT-11: Friend challenges by link, with no server
- **Why:** in a randomized trial, social comparison raised exercise-class attendance about 90% over arms without comparison, while support alone did not beat control ([Zhang et al. 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5008041/)). A challenge can work with no server: the link carries the rule, each person tracks it on their own phone, and the comparison happens in the chat they already use, with each person's result card.
- **Change (if approved):** from the consistency card, "Challenge a friend" builds a fragment link: `#c=` with a start date, length in weeks, and target sessions per week. Opening it shows the challenge and an "I'm in" button, stored with `window.storage`. At the end, a result card ("Challenge done: 4/4 weeks") with a share button. No leaderboard and no names in the link.
- **Acceptance criteria:** the link round-trips; progress is computed from `activity-dates` within the challenge window; a malformed link is rejected and writes nothing.
- **Test plan:** new `test-challenge-link.js`. Sabotage: count dates outside the window.
- **Files:** `index.html`, `sw.js`, the test.
- **Risk:** depends on BIZ-08 and MKT-01. Keep it opt-in and guilt-free: no reminders that shame a missed week.
- **Status:** needs-owner. **Question:** "Add friend challenges that work through shared links, with no server, no accounts and no leaderboard?" **Recommendation:** yes, after MKT-01 and BIZ-08.

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
- **Status:** needs-owner. **Question:** "Add a `ref` tag to share links so the store consoles can show which share moments bring installs (the app stores nothing)?" **Recommendation:** no for now. Use store-console totals and tester interviews until there's enough volume for it to matter.

---

## Design (UX): added by design-engineer, 2026-11-07

Written against **v3.514**. The vision, the world (*Plate & Press*) and the reasons are in `planning/design-vision.md`. Mock-ups: `tools/design/*.html` with `tools/design/world.css`. Renders at 402×874 (2×), dark and light: `tools/design/renders/`. Line numbers are `index.html` at v3.514. **Re-grep them before editing.**

**Rules every UX item keeps**, on top of the BL rules and default `Tools:`:
- Same data, same behaviour. No storage key, schema or routing key changes (`VIEW_RENDERERS` keys stay `today`, `log`, `analysis`, `history`). Element IDs that tests or code read keep their IDs, even when the element moves.
- Each screen switches whole in one version. Tokens land first as aliases, so no version leaves a screen half old, half new.
- Tap counts never rise. Logging the ready set stays one tap, asserted in a test.
- Accessibility is kept or improved: 4.5:1 text contrast (3:1 for 24 px and up) in light and dark, 44 pt targets, a VoiceOver name on every control, and Reduce Motion turning every animation into an instant state change.
- **Visual check per item:** Playwright Chromium at 402×874 and 904×678, light and dark, on `/.taste-skill/seed3.html`, compared side by side with the item's mock-up render. Screenshots are attached to the PR. Then `impeccable detect --json` over `index.html`: no new contrast findings.
- **Extra tools for every UX item:** `Skill: impeccable` (`polish`, and `audit` for contrast), `Skill: apple-hig` (targets, tab bar, sheets), and `Skill: review-animations` for anything that moves.

Ready items are listed in build order, then needs-owner items.

### UX-01: Design tokens v2, introduced as aliases (no visual change)
- **Why:** every later UX item needs one vocabulary: ground, surfaces, rules, text, spot inks and their on-colours, deep inks, type scale, radii and motion. Introducing them as aliases of today's values first means the switch can happen screen by screen without a broken middle state.
- **Change:**
  - Add the token set from `tools/design/world.css` (`--ground`, `--surface-1/2`, `--rule`, `--rule-strong`, `--text-2/3`, `--spot-*`, `--on-*`, `--deep-*`, `--fs-*`, `--r-control`, `--r-sheet`, `--dur-*`, `--ease-out`/`--ease-in-out`/`--ease-drawer`) to `:root` (59) and the light block (309).
  - In this version each new token **points at the existing value** (`--ground: var(--bg)` and so on). The new values are recorded in a comment beside each, for the later items.
  - Nothing reads the new tokens yet.
- **Acceptance criteria:**
  1. Every new token is defined in both the dark `:root` and the light block. The test parses the real `<style>` with jsdom's CSSOM, not by string match.
  2. For every spot ink, the **target** values (from the comment) give `--on-*` against `--spot-*` ≥ 4.5:1, white against `--deep-*` ≥ 4.5:1, and `--text`, `--text-2` and `--text-3` against `--ground` ≥ 4.5:1 in both themes. Computed with a real WCAG luminance function in the test.
  3. Playwright: screenshots of all four views at 402×874 and 904×678, light and dark, are pixel-identical to the v3.514 baseline.
- **Test plan:** new `test-design-tokens-v2.js`. Sabotage: delete one token from the light block, and criterion 1 must fail; set `--spot-red` to `#E0352B` (4.4:1), and criterion 2 must fail.
- **Files:** `index.html` (59, 309), `sw.js`, the test.
- **Risk:** low. Guarded by `test-css-mechanical-token-dedup.js`.
- **Status:** ready

### UX-02: Ship the Archivo display face beside index.html
- **Why:** the cover numeral, the screen headlines and the share cards (MKT-03) are drawn in Archivo, condensed through its width axis. Its width axis is also the "press" move when a set is logged. Geist at 800 is the fallback and works, but it's wider, so the cover numeral would have to shrink to about 120 px.
- **Change:**
  - Copy `tools/design/fonts/archivo-latin-wdth-wght.woff2` (90 KB, OFL; licence `tools/design/fonts/OFL-Archivo.txt`) to `fonts/archivo-latin-wdth-wght-v1.woff2`, with the licence beside it.
  - Add an `@font-face` beside the Geist ones (29–34) and `--font-display: 'Archivo', 'Geist', ...`.
  - `sw.js` caches the font file in its own versioned cache, as CLAUDE.md asks for assets.
- **Acceptance criteria:**
  1. `sw.js`'s install handler (real function, stubbed `caches`) adds the font URL to a cache whose name carries the version.
  2. The `@font-face` `src` URL resolves to a file that exists in the repo (test reads the path from the real CSSOM).
  3. Offline in Playwright: after one online load, with the network blocked, `document.fonts.check('800 64px Archivo')` is true.
- **Test plan:** new `test-display-font.js`. Sabotage: misspell the file name, and criterion 2 must fail.
- **Files:** `fonts/`, `index.html` (29–34), `sw.js`, the test.
- **Risk:** first load is 90 KB heavier. `font-display: swap` keeps the text visible.
- **Status:** needs-owner. **Question:** "Ship one 90 KB display font file (Archivo, open licence) beside the app for the big numbers and headlines?" **Recommendation:** yes. It's the single biggest visual lift per byte, and MKT-03's cards use it too.

### UX-03: Flat ground everywhere: retire the halos, glass and gradient buttons
- **Why:** the most "generated" parts of today's look are the blurred plate halos behind the header, the glass card fills with `backdrop-filter` (37 uses) and the gradient call-to-action buttons (`--cta-gradient-*`, 18 uses; the violet "Generate insights" and "Log set" buttons). Removing them app-wide in one version makes every screen coherent before any screen is rebuilt.
- **Change:**
  - Switch the UX-01 aliases for ground, surfaces, rules and text to their target values.
  - Cards become `--surface-1` with a 1 px `--rule` and no blur. Gradient buttons become flat: the primary is ink (`--text` on `--ground`), and the day-coloured one is `--spot` on `--on-spot`.
  - Gym mode's hand-tuned `.exercise-block.open` literal shadow stays untouched (CLAUDE.md).
- **Acceptance criteria:**
  1. In jsdom on the real markup, no element's inline or stylesheet `background` uses `--cta-gradient-*`. Count real rules in the CSSOM.
  2. `backdrop-filter` remains only on the sheet scrim and the tab bar's under-layer, if any: the CSSOM count is 2 or fewer, and the test names the rules allowed.
  3. The UX-01 contrast test passes against the live values now.
  4. Playwright on all four views, light and dark: `impeccable detect` reports no new low-contrast findings compared with v3.514.
- **Test plan:** extend `test-design-tokens-v2.js`. Sabotage: restore one gradient button rule, and criterion 1 must fail.
- **Files:** `index.html` (CSS only), `sw.js`, the test.
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
- **Status:** ready

### UX-05: The day sets the ink
- **Why:** each program day already carries a plate (`plate:'p-red'`, 9716 onward), and `renderWorkout` already publishes `--day-hue` on `#workoutCard` (28537). The new world needs three values per day: `--spot`, `--on-spot` and `--spot-deep`. It also needs them on `<body>`, because the cover, the rest field, the finish screen and the charts all use them.
- **Change:** beside the `--day-hue` line (28537), publish `--spot`, `--on-spot` and `--spot-deep` on `document.body` from `getDayPlateClass(activeDay)` (26213). Map them through one table: `p-red` → red, and so on; `p-off` and `p-white` → their own; any unknown class → `off`. `--day-hue` stays, for the rules that still read it.
- **Acceptance criteria:**
  1. For every day of every built-in program, after the real `renderWorkout`, `document.body.style.getPropertyValue('--spot')` names the plate token matching that day's `plate`, and `--on-spot` names its pair.
  2. An unknown plate class falls back to `off` without throwing.
  3. `--day-hue` on `#workoutCard` is unchanged (existing behaviour).
- **Test plan:** new `test-day-ink.js`, with the real `renderWorkout` path or the extracted helper plus `getDayPlateClass` and `programs`. Sabotage: always publish red, and criterion 1 must fail on Day 2.
- **Files:** `index.html` (26213, 28537), `sw.js`, the test.
- **Risk:** low. Nothing visible reads the new values until UX-06.
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
- **Status:** ready

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
- **Test plan:** new `test-plate-stack.js`, with the real `platesPerSide`, `getEquipment` and `isBarbellExercise`. Sabotage: drop the bar subtraction, and criterion 1 must fail.
- **Files:** `index.html` (new function beside 31769, cover markup), `sw.js`, the test.
- **Risk:** a kg user's colour mapping. Tested by a kg case in criterion 2's sibling.
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
- **Status:** ready

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
- **Status:** ready

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
- **Status:** ready

### UX-13: Food in the world's ink
- **Why:** the Food view is the last screen in the old look after UX-03. Its flows are good and stay; only the surface changes. Recents (BL-18) slot in on top when they ship.
- **Change:** the macro rings become one ruled row of four figures (calories, protein, carbs, fat), with the remaining figure as the lead. Search, barcode, Snap a Meal and Describe It become one row of standard buttons. Food rows are two-line ruled rows using the existing `buildFoodResultRow`. No flow, storage or API changes.
- **Acceptance criteria:**
  1. The remaining-calorie figure equals target minus the logged sum for the seeded day (real `computeTargets` and the food log).
  2. Every food entry renders through `buildFoodResultRow`: one call per entry, stub-counted.
  3. Existing food logging tests (search, barcode, repeat yesterday) pass unchanged.
- **Test plan:** new `test-food-view-summary.js`. Sabotage: drop one entry from the sum, and criterion 1 must fail.
- **Files:** `index.html` (Log view markup and CSS), `sw.js`, the test.
- **Status:** ready

### UX-14: The unfolded screen: session and lift side by side
- **Why:** unfolded (904×678), Today already puts the lift's history on the right (`renders` of the incumbent). In the new world the left pane is the cover and session, and the right pane is the selected lift: its plate stack, e1RM line and last five sessions. Tapping a session row switches the right pane, with no navigation.
- **Change:** a container query on the Today view at 720 px or wider gives two columns. The right pane reuses UX-10's chart renderer for the selected exercise. `test-foldable-tabletop.js` behaviour holds.
- **Acceptance criteria:**
  1. At a 904 px viewport (jsdom with a stubbed `matchMedia` and the container width), selecting an exercise row updates the right pane's title to that exercise. Exactly one chart render per selection.
  2. At 402 px, the right pane isn't rendered.
  3. `test-foldable-tabletop.js` passes unchanged.
- **Test plan:** new `test-unfolded-today.js`, plus Playwright at 904×678 light and dark. Sabotage: render the chart for the first exercise always, and criterion 1 must fail.
- **Files:** `index.html`, `sw.js`, the test.
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
- **Status:** ready

### UX-16: The coach button moves into the header
- **Why:** the floating chat button (draggable, 48442–48459) covers content on every view at 402 px (see the incumbent screenshots). In the new world it's a plain 44 pt icon button in the header, beside Settings.
- **Change:** the button keeps its ID and its open handler. The floating position, the drag code and the stored drag side are removed.
- **Acceptance criteria:**
  1. One click on the header button opens the coach exactly as the FAB did (the same handler, stub-counted: 1).
  2. No element is `position: fixed` over the content area apart from the tab bar, toast and sheets (a CSSOM check over the real markup).
- **Test plan:** new `test-coach-header-button.js`. Sabotage: re-add the fixed position, and criterion 2 must fail.
- **Risk:** it drops a feature: the draggable button and its remembered side.
- **Status:** needs-owner. **Question:** "Move the floating chat button into the header (it stops covering content, but you can no longer drag it)?" **Recommendation:** yes.

### UX-17: Retire Gym mode once Today is the session
- **Why:** after UX-06 to UX-08, Today is gym mode: the next set huge, one tap, rest on the cover. Keeping both doubles the surface to maintain, and gym mode's tests guard a second implementation.
- **Change:** none until answered. If yes, a later version removes the toggle and the gym-only rendering. Its tests move to the shared Today paths, with dated notes.
- **Status:** needs-owner. **Question:** "Once the new Today ships, remove the separate Gym mode, since Today will do its job?" **Recommendation:** yes, but only after two weeks of real use of the new Today on your phone.
