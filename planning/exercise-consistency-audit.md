# Exercise consistency audit (2026-11-08, live v3.517)

Owner: exercise-auditor. Scope: every exercise slot in `programs`, `MEDICAL_STYLES`, `COMBAT_STYLES`, `CYCLING_STYLES`, `WATERSPORTS_STYLES`, `YOGA_STYLES` and `PROGRAM_DAY_COUNT_VARIANTS` (`index.html`), every entry in `exerciseInfo` (`content-exercises.js`), plus `EXERCISE_MOVE`, `EXERCISE_SUBS`, `SUBSTITUTION_MAP`, `REGION_RELIEF`, `MUSCLE_GROUP_MAP`, `CATEGORY_LOAD_INCREMENT` and the rest, tier, time-estimate and history-key functions that read them.

It extends `planning/program-audit.md` (2026-11-07) and does not repeat it. Where a finding touches a known item (SAF-x, H-x, M-x, L-x, BL-xx), it says so and adds only what is new.

## How this was done
- **Read-only against `origin/Branch-1` at 0868e23** (v3.517), in a detached worktree. No app file, test or backlog file was edited. Nothing was committed.
- **Real data, real functions.** Node scripts loaded the real objects through `testHelpers.js` (`extractConst` / `extractFunction`) and walked all **4,300 slots** (305 distinct exercise names, 1,065 training days, 321 `exerciseInfo` entries). Every slot was matched back to its source line.
- These real functions were called, not re-implemented: `getRepRangeTier`, `getDefaultRestSeconds`, `parseSetCount`, `parseEstimatedMinutes`, `groupIntoUnits`, `totalMinutesForUnits`, `parseExKey` and `exKeyForLocation`.
- Where a consequence comes from reading the code rather than running it (the set-completion gate in `wireSetsBlock`, for example), the finding says "by reading".
- **Line numbers** are `index.html` at v3.517 unless a file is named. `content-exercises.js` lines are prefixed `cx:`.
- **Tests were not run.** This was an audit-only session. The CLAUDE.md test baseline applies to whoever builds the items.

### Source keys (new in this audit; the rest are in program-audit.md)
| Key | Source |
|---|---|
| [FRA25] | Frandsen et al. 2025, BJSM, doi 10.1136/bjsports-2024-109380. Garmin-RUNSAFE cohort, 5,205 runners, 588,071 sessions. A single run more than 10% longer than the longest run of the previous 30 days raised the overuse-injury rate (about +64% for a 10-30% spike); week-to-week change was not significant. Worked from secondary summaries (https://pmc.ncbi.nlm.nih.gov/articles/PMC12421110, https://www.shoulditrain.com/blog/10-percent-rule-running-injury-myth); verify against the full text. |
| [SS14] | Stöggl & Sperlich 2014, Front Physiol 5:33. Polarised (about 80/20) training beat threshold-heavy and high-volume training in trained endurance athletes. Not re-fetched this session. |
| [WAK92] | Wakayoshi et al. 1992, Int J Sports Med 13(5):367. Critical swimming velocity as a threshold index. Practical use: CSS = (400 − 200 m) / (T400 − T200). Not re-fetched this session. |
| [FRY03] | Fry, Smith & Schilling 2003, J Strength Cond Res 17(4):629. Stopping the knees from travelling past the toes in a squat cut knee torque but raised hip torque about tenfold. Not re-fetched this session. |
| [AC] | Allen & Coggan, *Training and Racing with a Power Meter*. FTP ≈ 95% of a 20-min test, and power zones as % of FTP. Coaching practice, not trial evidence. |

## Severity counts
| Tier | Count | IDs |
|---|---|---|
| Safety | 5 | S-1 to S-5 |
| Wrong data that breaks history or progression | 12 | D-1 to D-12 |
| Cosmetic | 5 | C-1 to C-5 |
| **Total** | **22** | |

---

## 1. Safety

### S-1 (critical): Changing days per week hands one lift's history to a different lift
- **What's wrong.**
  - `exKey` (27001) keys history by position only: `ex:${program}:${dayId}:${idx}`. It has no day-count component.
  - `applyDaysPerWeekProgramData` (~25999) swaps `programs[key].days` for the `PROGRAM_DAY_COUNT_VARIANTS` table, which **reuses the same `d1…d7` ids and indexes**.
  - Log entries store only `{date, sets}` (`normalizeExEntry`); they carry no exercise name. So `getExLog` (27149) returns whatever was logged at that position under any day count.
- **Measured** (variant slots whose same-key default slot is a different exercise):

  | Program | Variant slots that collide |
  |---|---|
  | strength | 54/120 |
  | bodybuilding | 81/94 |
  | powerbuilding | 47/112 |
  | powerlifting | 36/86 |
  | climbing | 48/104 |
  | 34 other containers and styles | 8–40 each |

- **Concrete cases.** In each, the badge says "Hit N reps last time at W — try adding weight", and the ghost load in the weight field comes from the other lift:
  - bodybuilding 6-day d5 slot 0 (16672): **Incline DB Press 3×10-12** reads the default **Squat 4×8-10** history;
  - bodybuilding 6/7-day d5 slot 1 (16673/16730): Overhead Triceps Extension reads **Romanian Deadlift**;
  - powerbuilding 4-day d6 slot 0 (17421): **Overhead Press 5×5** reads **Leg Press 3×12-15**;
  - strength 3-day d5 slot 3 (16294): DB Curl reads Hip Thrust.
- **Style containers make it worse.** `parseExKey` (40951) resolves combat, cycling and watersports keys against the *default* style days (`styleDef.days`), never the active variant. History, PRs and the corpus therefore relabel a variant's logs with the default day's exercise names.
- **Why it's safety.** A squat or leg-press working weight shown as the next load for a DB press or overhead press is a suggestion to lift a load the user has never pressed. It's only a placeholder, never a value, but the badge tells them to go up from it.
- **Fix.**
  - BL-51 (ready, no stored-data change): stamp new entries with the exercise name and ignore mismatched entries for suggestions.
  - BL-52 (needs-owner): variant-scoped keys plus migration.

### S-2 (medium): "Single-Leg Bound": the name, cue and prescriptions describe two different drills
- The name is a single-leg hop. The cue (cx:277) says "Push off one leg, land on the **opposite** leg", which is an alternate-leg bound, a lower-intensity drill (NSCA plyometric intensity ladder [PRAC]).
- The prescriptions disagree across 45 slots: `3×6/leg` (athletic 9992), `3×5/side` (26 watersports slots), plain `3×6` (running d6, 10370).
- 12 slots show a weight field; 33 are `noWeight`.
- It sits in the ACL-risk watersports days (SAF-5 context), where the drill's intensity matters most.
- **Fix (BL-61):** rewrite the cue so it matches a single-leg hop, with a landing rule, and normalise the prescription to `/leg`. Name unchanged (history-safe).

### S-3 (medium): Jump Squat programmed as a 12-15-rep conditioning set against its own cue
- Bodyweight d5 (10148) and calisthenics d5 (10419), plus 7 variant slots: `Jump Squat 3×12-15`, which gets 60 s rest (endurance tier, measured).
- The cue (cx:190) says "Reset your position each rep for max power — don't just bounce".
- Plyometric sets are normally 3-8 reps with landing quality as the stop rule; fatigued landings are where valgus shows up [PRAC; NSCA plyometric guidance].
- The athletic and watersports programs already use 3×5 to 3×8.
- **Fix (BL-61, needs-owner: it changes a prescription):** `3×6-8`, cue line "Stop the set when landings get loud or knees cave". Rest then comes from the tier (90 s) [SING24].

### S-4 (low): Achilles rehab heel drops have no per-leg dose
- `Eccentric Heel Drop 3×15 (straight-knee…)` and `3×15 (bent-knee…)`, rehabAchilles d1, d4 and d5 (12014-12042). The cue says to load the *injured* leg.
- The sets string doesn't say whether 15 is per leg, so the dose can be read as half or double the intended one. Alfredson-type protocols are dosed per leg [ACH15][PRAC].
- `Straight Leg Raise` in ACL rehab (11982) has the same gap.
- **Fix (BL-62):** text only, `3×15/leg (…)`. The `parseSetCount` and tier results are unchanged (checked: `/leg` is ignored by both).

### S-5 (low): Prenatal d6 uses a breathing cue that says "lie down"
- Prenatal d6 (11783): `Diaphragmatic Breathing 3×60s`. Its cue (cx:79) starts "Lie down, one hand on your chest…".
- The sibling prenatal cue for Standing Pelvic Tilt (cx:137) explains the plan avoids prolonged supine positions after the first trimester [PREG19]. Three minutes is short, but the two cues contradict each other inside one plan.
- **Fix (BL-62):** add the line "In pregnancy, do this seated or side-lying."

---

## 2. Wrong data that breaks history or progression

### D-1 (high): Medical-style history never reaches the corpus
- `exKey` writes `ex:medical:<style>:<dayId>:<idx>` (5 parts, 27006). `parseExKey` (40951) has branches for combat, cycling and watersports, **but not medical**.
- The generic branch reads `dayId = 'hypertension'`. The real call `parseExKey('ex:medical:hypertension:d2:0')` returns **`null`**.
- `readExCorpus` (41025) drops null keys. So every medical, prenatal, postpartum and rehab log is missing from:
  - the PR timeline;
  - `groupCorpusByExercise`;
  - weekly volume (`renderVolumeTrend`, 45493);
  - the weekly-RPE readiness input.

  It also hides the logs from the signals the clinical safety items depend on (BL-02, SAF-8).
- **Fix (BL-53):** add a medical branch that mirrors the others. Read-only; no stored key changes.

### D-2 (high): Yoga styles share history keys while their slots differ
- `exKey` has no yoga branch, so Flow, Hot and Couples all write `ex:yoga:dX:N`. `getExerciseLocationIndex` (27086) even says so ("yoga styles share one storage key regardless of style").
- Measured: **40 of 72** cross-style same-key slot pairs are different exercises.
  - Example: d1 slot 0 is Sun Salutation Flow in Flow and Hot, but Seated Back-to-Back Breathing in Couples.
- `parseExKey` resolves against the active style, so switching style relabels past sessions.
- Mostly `noWeight` holds, so load risk is low, but History and the PR timeline mislabel them.
- **Fix:** with S-1 in BL-52 (needs-owner, key migration). The BL-51 name stamp covers new logs at once.

### D-3 (high): The same lift under two names splits History, PRs and the cross-program fallback
`groupCorpusByExercise` (41498) and `getExerciseLocationIndex` (27064) group by exact name, so each pair below is two exercises to the app:

| Canonical | Variant name | Slots | Where |
|---|---|---|---|
| Squat (68) | Back Squat (17) | oly d4/d5, running d6, hyrox d2 | 10368, 10987, 9934 |
| Bench Press (58) | Flat Bench Press (7) | bodybuilding d1 + variants | 9805, 16500 |
| Seated Cable Row (49) | Cable Row (18) | strength, bodybuilding d6, powerbuilding d6, boxingsc | 9755, 9868, 10601 |
| Farmer's Carry (51) | Farmers Carry (Heavy) (9) | hyrox d6, grappling d6 | 11010, 11054 |
| Standing Calf Raise (16) | Calf Raise (40) | both cues describe a standing raise (cx:231, cx:287) | 9744, 9780 |

Consequences:
- A lifter moving from Olympic (Back Squat) to Strength & Size (Squat) gets no "last time", no warm-up ramp basis and no single PR line for the same bar.
- Bodybuilding even uses **Seated Cable Row** (d2, 9817) and **Cable Row** (d6, 9868) in one program, with one cue (cx:229 vs cx:275) for the same machine.
- `EXERCISE_SUBS` has separate keys for both members of each pair.

**Fix (BL-54):** a read-time `EXERCISE_CANONICAL` alias map used only by grouping and the location index. Slot names, keys and logs are untouched. Renaming slots instead would be history-safe for the slot itself (keys are positional) but churns `EXERCISE_SUBS`, substitute slugs and the cue table; the alias does the same job with no data risk.

### D-4 (high): Bodyweight moves carry a weight field, which blocks the rest timer
- `wireSetsBlock` (by reading, 32014-32046): a set is "real" only when `hasReps && hasRequiredWeight && hasRequiredDistance`. `hasRequiredWeight` is `!showWeight || weight !== ''`.
- The rest timer (`startRestTimer`, its only call site, 32040) and the gym-mode offer fire only on a real set. So any slot without `noWeight` needs a typed weight before rest starts.
- **At least 98 slots of moves that never take load** have a weight field:
  - Bird Dog, Dead Bug, Side Plank, McGill Curl-up (the whole Core program d1, 10037-10041);
  - Glute Bridge, Bodyweight Squat, Jump Squat, Push-up to Plank and Bicycle Crunch (Bodyweight program d4-d6, 10136-10157);
  - Bodyweight Squat 3×20 in Jump Rope (10177, 15 slots);
  - Single-Leg Bound (12 slots).
- Push-up, Pike, Decline, Triceps Dip, Inverted Row and Nordic Curl in the **Bodyweight** program (10098-10139) are the same; the program's overview says "no gym or equipment needed".
- **17 exercises are `noWeight` in some slots and weighted in others.** Examples: Bird Dog 70/10, Glute Bridge 31/5, Dead Bug 33/6, Side Plank 42/9, Ab Wheel 22/8, Nordic Curl 12/16, Scapular Retraction 35/5, Leg Curl 1/24 (ACL d4 11980 has no load field on a machine curl), Seated Cable Row 1/48 (rehabShoulder d4 11926).
- **Loaded moves marked `noWeight`:** Wall Balls (13 slots; the ball weight isn't logged); Sled Pull `noWeight` while Sled Push is weighted.
- **Fix:** BL-56 (needs-owner, because some owners log weighted push-ups). Plus BL-55, which removes the hard gate.

### D-5 (high): Every cardio-category row demands a distance, including drills that have none
- `isDistanceExercise` (32558) is `category === 'cardio'`, and `hasRequiredDistance` gates the real-set check the same way (32018).
- So the rest timer never starts on these until a distance is typed:
  - Burpees (29 slots, "4×30-45s" or "4×10");
  - Battle Ropes (39);
  - Wall Balls (13, "5×15" reps);
  - Burpee Broad Jumps (9);
  - every Jump Rope drill (82 slots) and Jump Rope (warm-up) (105);
  - Agility Ladder (20);
  - FTP, Cadence and Standing Climb intervals.
- At least 147 cardio slots prescribe reps or time with no distance; the jump-rope and bike intervals add more.
- **Fix (BL-55, ready):** a distance field shows only for exercises whose prescription or name is distance-based (`m|yd|km|mi`, or Run, Jog, Ride, Swim, Walk, Row, SkiErg, Sled). Even then, distance stops gating the real-set check (reps or time alone is a finished set).

### D-6 (medium): The rest tier misreads trailing multipliers and per-side mobility reps as "strength", giving 240 s
- `getRepRangeTier` (27689) takes the first number after `×` as reps. `parseSetCount` (26421) already knows the trailing form ("5 reps ×3", "8 breaths/side ×2"); the two parsers disagree.
- Measured with the real `getDefaultRestSeconds`:
  - **61 slots** of the form `N reps ×M`, `N breaths ×M` or `3-5 min ×3` (all Tai Chi forms; yoga Flow/Hot Downward Dog and Warrior II) get **240 s**;
  - about 100 slots of `2×5/side` mobility and technique drills get 240 s: Hip CARs (31), Shoulder CARs, World's Greatest Stretch, Pilates Saw, grappling Knee Slice, Torreando, takedowns, RNC and Armbar drills, and Bridge & Roll.
  - Single-Leg Bound gets 90 s at `3×6/leg` but 240 s at `3×5/leg`. Same drill, one rep apart.
- Distinct from M-1/BL-14, which covers units *after* the ×.
- **Fix (BL-57):** a trailing multiplier means no rep tier. Non-loaded categories (`core`/`shoulder` with `noWeight`, plus mobility holds) cap at 60 s. Plyometrics use a fixed 90-120 s [PRAC].

### D-7 (medium): Seven "Light/Speed" variant names have no `exerciseInfo` (confirms L-3)

| Name | Where |
|---|---|
| Squat (Speed) 6×3, Bench Press (Speed) 6×3, Deadlift (Light/Technique) 4×2 | powerlifting 6/7-day d7, 17218-17220 and 17274-17276 |
| Snatch (Light) 4×2, Clean & Jerk (Light) 3×2 | oly 6/7-day d7, 16958-16959 and 17013-17014 |
| Sprint Intervals (Sub-Max) 4×30yd | athletic 6/7-day d7, 17759 and 17813 |
| Handstand Hold (wall) (Light) | calisthenics 6/7-day d7, 18282 and 18336 |

With no entry, these slots have:
- no cues and no video link (`buildDetailsHtml` returns '');
- no category, so they're skipped by the volume ledger (`if(!info) continue`, 45508) and get the 5 lb default increment;
- no warm-up ramp;
- the strength-tier 240 s rest from "6×3".

Double progression then pushes load on speed work, which is meant to stay at about 50-60% and be moved fast [PRAC].

Keeping these as separate names is right: it keeps speed sets out of the main lift's PRs.

**Fix (BL-58):** entries with category, cues and a technique flag. The BL-02 technique rule then applies (no load nudges).

### D-8 (medium, needs-owner): Category tags that feed the wrong muscle group (beyond M-8)
`MUSCLE_GROUP_MAP` (45244) derives the group only from `exerciseInfo.category`, and categories also drive `COMPOUND_CATEGORIES` (accumulation), increments and region flags.

| Exercise | Tag | Slots | Effect | Should be |
|---|---|---|---|---|
| Band External Rotation | core | 50 | counted as Core sets | shoulder |
| Scapular Retraction | core | 40 | Core | shoulder (or pull) |
| Band Pull-Apart | core | 7 | Core | shoulder |
| Deep Squat Hold | squat | 27 | mobility hold counted as Quads sets; compound, so accumulation-eligible | core/mobility |
| Chair Pose; Horse Stance Hold (Mabu) | squat | 12; 4 | same | core |
| Bow Stance Transitions (Gong Bu) | lunge | 4 | Quads | core |
| Chaturanga (yoga) | push | 12 | Chest & Shoulders sets, +5 lb increment | core |
| Wall Slides; Shoulder CARs; Band Dislocates | shoulder | 19; 7; 10 | mobility counted as Chest & Shoulders | core |
| Sprawl Drills | hinge | 10 | combat drill counted as Posterior Chain and compound | kick/punch or core |

Ledger and BL-20/BL-30 consequences:
- A Mobility user's Deep Squat Holds read as quad hypertrophy volume.
- The 50 rotator-cuff slots inflate Core.

Categories shift Analysis history groupings, so this goes with M-8 as one needs-owner migration-free change. Groupings are computed at read time, so no stored data changes, but past weeks' group totals change.

### D-9 (medium): Substitutes that change the joint or the muscle (`EXERCISE_SUBS`, 13706)
- **Tibialis Raise → Standing Calf Raise / Calf Raise** (13811): the antagonist (dorsiflexion vs plantarflexion). Use "Banded Dorsiflexion" or "Heel Walk".
- **Calf Raise → Leg Press** and **Standing Calf Raise → Leg Press** (13769, 13777): a knee-and-hip compound logged in a calf slot. Use "Seated Calf Raise" or "Single-Leg Calf Raise".
- **Farmers Carry (Heavy) → Sandbag Lunges** (13801): carry → lunge. Use "Trap-Bar Carry".
- `SUBSTITUTION_MAP` (43922, the Care swap suggestions) names 10 alternatives that have no `exerciseInfo`, so they show no cues if swapped in: Push-up (partial range), Machine Chest Press, Landmine Press, Chest-Supported Row, Wall Sit, Leg Press (light, partial depth), Step-Up (low box), Grip Strengthening (light), Shadowboxing (no resistance).
- **History-safe.** Substitutes have their own `:sub:<slug>` keys, and `applyExerciseSubs` honours an already-stored selection even after a list changes, so nobody loses a current swap.

### D-10 (medium): The time shown on Today ignores interval work time
- `dayDuration` on training days is `~${estimatedMinutes}` from `totalMinutesForUnits` (28682). The authored `duration` shows only on rest days (28559).
- `parseEstimatedMinutes` (26461) treats a distance prescription as `count × rest`. Real values:

  | Prescription | Estimated |
  |---|---|
  | `8×100m` swim | 8 min |
  | `4×200m` threshold | 4 min |
  | `6×400m` run | 6 min |
  | `6×500m` row | 6 min |
  | `6×50m` drill set | 6 min |
  | `6×40yd` sprints | 6 min |

  None includes the swimming or running itself. Lifting sets count rest only, with no rep time or warm-up ramp.
- The "~30 min / ~45 min" session-length cap trims against these numbers, so a capped session runs long.
- Measured: on **251 of 1,065** training days the estimate is under 0.6× the authored duration. For example, hyrox d6 is shown as about 18 min against an authored ~45.
- **Fix (BL-63).**

### D-11 (low): The Swim Intervals cue and the rest timer disagree
- The cue (cx:132) says rest 15-30 s between 100s. The timer gives **60 s**: "8×100m" reads 100 as reps, so it lands in the endurance tier.
- BL-14's planned "erg or run intervals → 90 s" would widen the gap.
- **Fix:** fold into BL-57. Swim repeats ≤200 m get 20 s; 200-400 m get 30 s [PRAC; CSS-style sets, WAK92].

### D-12 (low): The cross-program warm-up fallback can't find watersports history
- `exKeyForLocation` (27091) has combat, cycling and medical branches but **no watersports branch**. The real call returns `ex:watersports:d1:0`, a key that is never written (the real key includes the style).
- **Fix:** in BL-53.

---

## 3. Cosmetic

- **C-1. Orphan library entries and duplicate keys.**
  - Six cycling entries are referenced nowhere (no slot, sub, Care list or substitution): Warm-up Spin, Easy Ride (Zone 2), Threshold Intervals, Hill Repeats, Long Ride, Technical Descent Drills (cx:150-157). They duplicate the live Warm-up Ride (easy spin), Endurance Ride, FTP Intervals, Hill Repeats (seated climbing) and Long Ride (Zone 2).
  - `EXERCISE_MOVE` declares Cool-down Spin, Cadence Drills and Sprint Intervals (Bike) twice (13628-13633; last write wins, so it's harmless).
  - The other 17 "unused" entries are live through `REGION_RELIEF` (Care) or `EXERCISE_SUBS` (V-Up).
- **C-2. 85 slot names have no `EXERCISE_MOVE` icon** and fall back to the category icon (`getExerciseIcon`, 28356). These include all of Pilates, Tai Chi and Couples Yoga, the grappling drills, Hyrox stations, Neck Bridges and Eccentric Heel Drop.
- **C-3. Per-side notation is inconsistent.** `/side`, `/leg`, `/direction` and bare counts are mixed for the same drill (Single-Leg Bound, see S-2), and `Sandbag Lunges 4×20` (hyrox 10998) doesn't say whether that's total or per leg.
- **C-4. Cue contradictions not covered by program-audit §4.**
  - Chair Pose (cx:21) "knees over (not past) your toes" and Partner Chair Pose (cx:50) "stop before they pass the toes". The app's own Squat, Back Squat and Bodyweight Squat cues say "knees track over/in line with toes", and restricting forward knee travel shifts the load to the hips and back [FRY03]. New line: "Let the knees travel forward as far as the heels stay down."
  - Good Morning (cx:180) "keep the bar path close to your body": the bar is on the back. New line: "Hinge until your torso nears parallel or your back starts to round, whichever comes first."
  - Front Lever Hold (cx:171) "keep your hips slightly tucked" should read "tuck the knees" (the progression is a knee tuck); §4 already rewrites cue 3.
  - Hammer Curl (cx:241) "slower tempo targets the forearm": it's the neutral grip that biases the brachioradialis, not tempo.
  - Hanging Leg Raise (cx:242) "the eccentric is where the core works hardest": an unsupported claim; replace with "Lower under control to a full hang".
- **C-5. Authored `duration` on training days is dead data.** It's only shown on rest days (28559). On 251 days it disagrees with the number the user sees. BL-63 either deletes the dependence or uses it as a floor.

---

## 4. What was checked and found consistent
- Every slot name except the 7 in D-7 has an `exerciseInfo` entry with at least 3 cues. Every `EXERCISE_SUBS` key is used by a slot, and every substitute target has an entry.
- No exercise appears twice in one day, apart from the intentional straight-knee and bent-knee heel-drop pair (S-4).
- No `superTag` sits on the last exercise of a day; every superset lead-in has a following exercise.
- No isolation lift falls in the strength tier (no 240 s on curls or raises).
- Warm-up eligibility: the "Light/Speed" names (D-7) are the only compounds that miss the ramp. Leg Extension and Leg Curl being ramp-eligible is M-8.

## 5. Not checked, or limits
- **No real-device check** of the rest-timer gate (D-4, D-5). The gate was confirmed by reading `wireSetsBlock` (32014-32046), not by driving it in jsdom.
- **Test suites were not run** (audit-only; read-only worktree).
- The variant-collision safety case (S-1) shows that a wrong history *can* be read. How many owners have logs under more than one day count isn't knowable from code; old entries carry no name or day-count stamp.
- D-10 "realistic" comparisons rely on the authored duration as the reference. No independent timing model was validated.
- Sources marked "not re-fetched" were cited from prior knowledge. [FRA25] was checked only against secondary summaries.
