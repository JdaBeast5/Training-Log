# Program audit: Training Log (2026-11-07)

Owner: exercise-auditor. Scope: every program in `index.html` (`programs`, the `*_STYLES` sub-programs and `PROGRAM_DAY_COUNT_VARIANTS`), the exercise library (`exerciseInfo` in `content-exercises.js`, `EXERCISE_MOVE`, `SUBSTITUTION_MAP`), and the progression, deload, RPE, e1RM, warm-up, rest, readiness and goal-volume logic.

**Status (2026-11-07, alignment round):** re-checked against live v3.516 (the Liftnext rename and the Sash icon only; no program logic changed, and line numbers hold within a few lines). §6 is superseded by the unified build sequence in `planning/roadmap.md`. Scope corrections and two new safety findings (SAF-8, SAF-9) are in the **Alignment addendum** at the end.

## How this audit was done
- **Numbers are computed, not estimated.** Node evaluated the real `programs`, `*_STYLES`, `PROGRAM_DAY_COUNT_VARIANTS` and `exerciseInfo` objects. Weekly sets per muscle use **fractional counting** (primary mover 1 set, meaningful synergist 0.5), the method that fit best in Pelland et al. Tables show it as `direct / fractional / days per week`.
- **Real functions.** The modifier findings (SAF-1, H-1) come from running the actual `applyGoalVolume` and `applyAccumulation` source pulled out of `index.html`, not from reading it.
- **Evidence.** Sources came from WebSearch. WebFetch was not used. Several sources are abstracts or secondary summaries; where a detail rests on a secondary source, the reference list says so. One date conflicts and needs checking: Pelland et al. is reported as Sports Medicine Dec 2025 in one source and 2026 in another.
- **No app code was changed and no tests were run.** This session only writes this file. The CLAUDE.md test baseline applies to the build session that picks these items up.
- **Data-safety rule for every program-content change below.** Logged history is keyed by an exercise's **position** in its day: `ex:${program}:${dayId}:${idx}`, see `exKey` and the comment above `ACCUMULATION_ACCESSORY_POOL`.
  - **Appending** an exercise to the end of a day is safe for history.
  - **Inserting, reordering, renaming or replacing** an existing slot moves every later slot onto another exercise's log. That needs a `SCHEMA_VERSION` / `runMigrations()` step and is marked **needs-owner**.
  - Render-time logic changes (gates, parsing, rest, progression rules) touch no stored data.

## Source keys
| Key | Source |
|---|---|
| [ACSM26] | Currier et al. 2026, ACSM position stand on resistance training, MSSE 58(4):851-872, doi 10.1249/MSS.0000000000003897. https://acsm.org/science-spotlight-acsm-releases-new-position-stand-on-resistance-training/ (I worked from secondary summaries: ≥2 sessions/wk, ~10+ sets/muscle/wk for hypertrophy, ≥80% 1RM for strength, 30-70% fast for power; check against the full text) |
| [PEL] | Pelland et al., resistance-training dose-response meta-regressions on weekly volume and frequency, fractional set counting. Preprint: https://sportrxiv.org/index.php/server/preprint/download/460/967/908. Reported as Sports Med 2025, doi 10.1007/s40279-025-02344-w (secondary; verify) |
| [ROB24] | Robinson et al. 2024, Sports Med 54(9):2209-2231, proximity to failure: hypertrophy improves closer to failure, strength flat across RIR. https://doi.org/10.1007/s40279-024-02069-2 |
| [REF23] | Refalo et al. 2023, Sports Med 53:649-665, proximity to failure and hypertrophy: momentary failure not required. https://doi.org/10.1007/s40279-023-01946-6 |
| [SING24] | Singer et al. 2024, Front Sports Act Living 6:1429789, rest intervals: small benefit above 60 s, no added benefit beyond about 90 s. https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1429789/full |
| [FREQ19] | Schoenfeld, Grgic & Krieger 2019, J Sports Sci, frequency: no difference when volume is equated; higher frequency helps when it adds volume. https://www.pubmed.gov/30558493/ |
| [BELL23] | Bell et al. 2023, Sports Med Open 9:87, Delphi consensus on deloading. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10511399/ |
| [DUR15] | Schoenfeld, Ogborn & Krieger 2015, Sports Med 45:577, rep duration 0.5-8 s gives similar hypertrophy. https://doi.org/10.1007/s40279-015-0304-0 |
| [PLOT23] | Plotkin et al. 2023, Front Physiol 14:1279170, hip thrust vs squat: similar glute growth despite higher hip-thrust EMG. https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1279170/full |
| [LEN] | Wolf et al. 2023, lengthened partials systematic review (https://sportrxiv.org/index.php/server/preprint/view/455). Maeo et al. 2021, MSSE 53(4):825, seated leg curl beats lying; Maeo et al. 2022/23, EJSS, overhead beats neutral-arm triceps extension. Secondary summary: https://www.strongerbyscience.com/stretch-mediated-hypertrophy/ |
| [MC23] | Colenso-Semple et al. 2023, Front Sports Act Living, umbrella review: no clear menstrual-phase effect on strength or adaptations. https://www.frontiersin.org/articles/10.3389/fspor.2023.1054542 |
| [NHE19] | van Dyk et al. 2019, BJSM 53:1362, Nordic hamstring exercise cuts hamstring injuries about 51%. A later reappraisal disputes this. https://bjsm.bmj.com/content/53/21/1362 |
| [BP23] | Edwards et al. 2023, BJSM 57:1317, network meta-analysis of 270 RCTs: isometric training (wall squat 4×2 min) lowers resting BP most. https://bjsm.bmj.com/content/57/20/1317 |
| [AHA23] | Paluch et al. 2023, Circulation, AHA statement on resistance training with and without CVD. https://www.aminer.org/pub/6572af3c939a5f4082adf4d1 (index record only) |
| [PREG19] | Mottola et al., 2019 Canadian guideline for physical activity throughout pregnancy, BJSM 52:1339. https://csepguidelines.ca/?p=1037 |
| [ACH15] | Beyer et al. 2015, AJSM, heavy slow resistance as effective as eccentric for Achilles tendinopathy, with better compliance. https://pubmed.ncbi.nlm.nih.gov/26018970/ |
| [LIFT18] | Watson et al. 2018, JBMR 33:211, LIFTMOR: supervised heavy (>80%) resistance and impact training was safe and effective in low bone mass. https://pubmed.ncbi.nlm.nih.gov/28975661/ |
| [PRAC] | Established coaching practice (NSCA plyometric guidance, 5/3/1, GZCLP, Starting Strength, RP, Juggernaut). Not trial evidence; labelled wherever it is the only basis. |

---

## 1. Safety items first

### SAF-1 (critical): Auto volume increases change medical, rehab, prenatal and senior programs
**What's wrong.** Two render-time modifiers run for every program, with no program gate (`renderWorkout`, around line 28600):
- `applyGoalVolume` adds +1 set to every exercise with 2-4 sets when the goal is gain or leanbulk.
- `applyAccumulation` adds +1 set to the first 1-2 compound-category exercises in cycle weeks 2-4.

The only medical checks in the file concern storage keys and tips. Results from the real functions, goal "gain", cycle week 3:

| Program / day | Authored | Rendered |
|---|---|---|
| Rehab ACL d4 | Leg Curl 3×10 (light), Glute Bridge 3×12, SLR 3×12 | **Leg Curl 5×10, Glute Bridge 5×12, SLR 4×12** |
| Hypertension d2 | BW Squat 2×12, Wall Push-up 2×10, Cable Row 2×12 | **4×12, 4×10, 3×12** (volume doubled) |
| Prenatal d1 | BW Squat 2×10-12, Wall Push-up 2×10-12, Row 2×10-12, Pelvic Tilt 2×10 | **4, 4, 3, 3 sets** |
| Achilles d1 | Heel Drop 3×15 straight + 3×15 bent | **4×15 + 4×15** (the plan's own basis is a *reduced*-volume Alfredson) |
| Athletic d4 | Depth Jump 4×5, Bound 3×6/leg, Deadlift 4×5, BSS 3×8 | **Depth Jump 5×5, Bound 4×6, Deadlift 6×5, BSS 5×8** |

Without any goal, accumulation alone still adds sets in weeks 2-4 to every medical style except Achilles: Glute Bridge and Leg Curl in ACL rehab, Sit-to-Stand in osteoporosis and senior, and so on.

**Evidence.** Clinical-population plans are prescribed by tolerance and symptoms, not by a hypertrophy set target [AHA23][PREG19]. The ACL and Achilles plans' own `basis`/`limits` text promises criteria-based and reduced-volume loading.

**Exact change.** Gate all three modifiers (`applyGoalVolume`, `applyAccumulation`, `applyAccumulationAccessory`) on a single allowlist constant:
- **Allowed:** `strength, bodybuilding, powerbuilding, powerlifting`.
- **Not allowed:** `medical` (all styles), `senior`, `pilates`, `mobility`, `desk`, `yoga`, `core`, all sport and skill programs.
- **Plyometrics:** `jump`-category exercises are excluded everywhere.
- **Deload:** the existing deload still applies everywhere (it only lowers load).
- **Test:** a real-invocation jsdom test over every `MEDICAL_STYLES` day × goals {gain, leanbulk, performance} × weeks 1-4 asserts the rendered `sets` equal the authored ones. Sabotage check: remove the gate and the test must fail.

### SAF-2 (critical): RPE mode targets RPE 9 for hypertension, medical and Olympic lifts
**What's wrong.** `computeSuggestedSet` and `buildProgressBadge` apply `RPE_BY_CYCLE_WEEK = {1:7.5, 2:8, 3:8.5, 4:9, 5:6}` to any exercise with an e1RM, in any program (`rpeCtx` has no program check).
- **Hypertension:** a user in RPE mode gets "RPE 9 — about 1 rep left" on Seated Cable Row in week 4. The program's own d7 note says *avoid near-maximal lifts entirely*.
- **Oly:** a 5×2 Snatch at RPE 9 resolves to e1RM/(1+3/30), about 91% of an Epley e1RM. That e1RM comes from a technical lift where Epley isn't valid.

**Evidence.**
- Power and technical lifts are trained at moderate loads (about 30-70% for power, 70-85% for Olympic-lift technique work) with no grinding [ACSM26][PRAC].
- Hypertension guidance favours moderate effort and avoiding breath-holding [AHA23].

**Exact change.**
- **Medical, senior and prenatal:** RPE target capped at 6-7, i.e. RIR ≥3, every week.
- **`oly`, `jump`, `throw` categories:** RPE mode disabled; fall back to double progression with a 5 lb increment, as below. Badge copy: "Technique lift: stop each set with 2-3 clean reps left."
- **Test:** assert `loadForRpeTarget` is never called for those categories and programs.

### SAF-3 (high): "Resting" body regions miss the exercises that load them
**What's wrong.** `CATEGORY_TO_REGIONS` flags exercises by category only:
- **Neck:** no category maps to it, so **Neck Bridges** (grappling d6) are never flagged.
- **Hands/Fingers:** only `arms` maps to it. **Hangboard Max Hang / Repeaters / Lock-off** are `pull`, so a resting finger injury doesn't flag them.
- **Ankle/Foot:** **Calf Raise, Standing Calf Raise and Eccentric Heel Drop** are categorised `arms`. They're flagged for *Elbow/Wrist* and not for *Ankle/Foot*. The `arms` substitute for a heel drop is "Wrist Flexor Stretch".
- **Knee:** **Leg Curl** and **Nordic Curl** are `hinge`, so they flag Lower Back but not Knee.

**Exact change.** Add a per-exercise override map, `EXERCISE_REGION_OVERRIDE`, consulted before the category lookup at the two flag sites (lines ~14535 and ~29023):
- Neck Bridges → Neck, Upper Back
- Hangboard Max Hang, Hangboard Repeaters, Lock-off Hold → Hands/Fingers, Elbow/Wrist, Shoulder
- Calf Raise, Standing Calf Raise, Eccentric Heel Drop, Tibialis Raise → Ankle/Foot, Shins
- Leg Curl, Nordic Curl → Knee, Hip
- Wall Balls, Sled Push → Knee, Lower Back

Also give these exercises their own substitutes (heel drop → isometric calf hold; hangboard → open-hand or feet-on hangs). Keep categories unchanged here (see M-9). Test: real flag function with each region resting.

### SAF-4 (high): Neck Bridges as programmed
**What's wrong.** The grappling d6 prescription is "bridge onto the top of your head", 3×8, unsupervised, from an app. It loads the cervical spine at end range with body weight. The app's own boxing basis already says the protective claim for neck strength is unproven.

**Exact change (needs-owner: it replaces a slot).** Replace with **"4-Way Neck Isometric (hand or band)"**:
- 3×15 s each direction (flexion, extension, both lateral) at about 50% effort.
- Progress to 3×20 s, then a light band.
- Cue: "Neck stays still; push into your hand, don't let it move".
- Head-supported bridges only with a coach.

Basis: conservative practice [PRAC]. No trial supports either option for injury prevention.

### SAF-5 (high): Depth jumps without prerequisites, including in ACL-risk sports
**What's wrong.** Depth Jump appears with no box height and no landing progression:
- athletic d4: 4×5;
- skimboarding d6: 3×5;
- wakeboarding d1: 3×5, a sport whose own `basis` cites a 42% ACL-tear rate;
- kite-assisted d2: 3×5.

**Exact change.**
- **Display text:** set the prescription to "3×5 from a 30-45 cm (12-18 in) box".
- **Landing progression:** add a "Drop Landing (stick it)" exercise, 3×5. In wakeboarding and kite, the first 4 weeks of the block show a note to do drop landings first, using the existing `note` field.
- **Contacts:** athletic weekly ground contacts capped at about 100 per session for intermediates [PRAC]; the current d4 is about 56, so it's fine.
- **Cue addition:** "Prerequisite: land a 30 cm drop with knees over toes and no valgus for 3×5 first."

### SAF-6 (medium): Partner-drill cues lack the release rule
**What's wrong.** Rear Naked Choke Drill and Armbar from Guard Drill describe applying the submission with no "apply slowly; partner taps, release at once" line. Clinch Knee Drills don't say to use pads and controlled contact.

**Exact change.** Add one cue to each:
- **Chokes and armbars:** "Drill at 30-50% pressure; your partner taps or says tap, you release instantly."
- **Clinch knees:** "Knees go into a pad your partner holds, at controlled speed; no full-power knees to the body without pads."

### SAF-7 (medium): The menstrual-cycle card states phase-based training as fact
**What's wrong.** `CYCLE_PHASES.training` tells users the follicular phase is the strong window, to test heavy lifts at ovulation (with an ACL-laxity aside) and to back off in the luteal phase. This could make someone skip progression on half her cycle.

**Evidence.** Current umbrella-review evidence finds no consistent phase effect on strength or adaptation; at most the early follicular phase may be trivially lower [MC23].

**Exact change.** Rewrite each phase's `training` line to the same template: "Research shows no reliable phase effect on strength or muscle gain. Train to your plan and adjust to how you feel on the day." Keep the symptom and nutrition text.

---

## 2. Findings by severity (quality)

### High

**H-1. The "performance" goal guts the strength-sport programs.**
- **What's wrong.** `applyGoalVolume` caps every compound at 3 sets for `performance` (real run): Powerlifting Squat 5×5 becomes **3×5**, Oly Snatch 5×2 becomes **3×2**, and Snatch Pull 4×3 becomes **3×3**. Yet `PROGRAM_FIT_SCORES.performance` ranks oly 85 and powerlifting 70, so the goal most likely to choose them is the one that cuts them.
- **Evidence.** The stand's "2-3 sets" is a general-population minimum, not a ceiling for sport programs [ACSM26]. Accumulated heavy volume drives strength [PEL].
- **Exact change.** Skip the cap when `getRepRangeTier(ex.sets) === 'strength'`, or when the program is in `{powerlifting, oly, powerbuilding}`. Test: a real invocation on powerlifting d1 keeps 5×5.

**H-2. Double progression reads only the top set.**
- **What's wrong.** `analyzeProgressionSignal` and branch 4 of `computeSuggestedSet` use `topSetOf`, the heaviest set. On a 4×4-6, if set 1 hits 6 and sets 2-4 hit 5, 4, 4, it still says "add 10 lb". The Strength tip says "Hit the top of a rep range **on all sets** → add weight".
- **Evidence.** Double progression as coached (GZCLP, RP, Helms) requires every working set at the top of the range [PRAC]. Adding load while back-off sets are falling short lowers effective volume [PEL].
- **Exact change.**
  - Build `buildPastSessions` with `minRepsAcrossWorkingSets` (sets at the top weight).
  - **Increase** when every working set ≥ top rep at the same load in 1 session with average RPE ≤8 (RIR ≥2), or in 2 consecutive sessions if RPE wasn't logged.
  - **Branch 4:** the one-session nudge needs all sets at the top as well.
  - **Tests:** existing `test-next-set-recommendation.js` / suggested-load cases, plus a new pyramid-shaped case.

**H-3. Low day-count variants under-dose hypertrophy.**
- **What's wrong** (direct sets per week):
  - **Bodybuilding 3-day** is "PPL once through": chest **3**, lats 3, hamstrings **2**, glutes **0**, every muscle 1×/wk. This contradicts the file's own comment above `PROGRAM_DAY_COUNT_VARIANTS` ("every LOW day count below is full-body").
  - **Bodybuilding 2-day:** hamstrings 0, side delts 2.
  - **Bodybuilding 4-day:** lats 3, upper back 3, rear delts 0.
  - **Powerlifting 3-day:** bench, squat and deadlift each 1×/wk.
- **Evidence.**
  - Hypertrophy needs about 10 or more sets per muscle per week [ACSM26]. The dose-response is steepest from low to moderate, so 3 → 9 sets is the highest-value change in the app [PEL].
  - When sessions are few, spreading volume adds it [FREQ19].
  - Strength gains track frequency even after volume is accounted for [PEL]. Bench responds well to 2-3 exposures per week [PRAC].
- **Exact change (needs-owner: rewrites variant slots).**
  - **Bodybuilding 3-day → Full body A/B/C.** Each day: 1 squat or hinge (3×8-12), 1 horizontal and 1 vertical press or pull (3×8-12 each), 2 isolation (2-3×10-20). Target per week: chest 9, back 12, quads 9, hamstrings 6-9, side delts 6-9, arms 6 each.
  - **Bodybuilding 4-day:** add Lat Pulldown 3×10-12 and Face Pull 2×15 to Upper B (append), and Seated Leg Curl 3×10-12 to Lower B (append).
  - **Powerlifting 3-day → each day: one main lift heavy plus one other lift as volume.**
    - d1: Squat 5×5, Bench 3×6.
    - d3: Bench 5×5, Deadlift 3×3 at about 75%.
    - d5: Deadlift 5×3, Squat 3×5 at about 70-75%.
    - Result: bench and squat 2×/wk.

**H-4. Bodybuilding (5-day) says every muscle is trained twice a week; it isn't.**
- **What's wrong.** By direct sets: chest 10 sets 1×, quads 10 sets 1×, side delts 4 sets 1×, lats 4 sets 1×. Calves get 4 sets per week.
- **Evidence.** [FREQ19][PEL]; per-muscle volume [ACSM26].
- **Exact change.**
  - **Now:** fix the overview copy (no data risk).
  - **Then (needs-owner):** rebuild d6 "Arms, Back Detail & Conditioning" as **"Upper Detail"**: Incline DB Press 3×8-12, Lat Pulldown 3×10-12, Lateral Raise 4×12-20, Overhead Triceps Extension 3×10-12, Incline DB Curl 3×10-12, Incline Walk 20 min.
  - **Append to d5:** Seated Leg Curl 3×10-12 (lengthened bias [LEN]).
  - **d4:** Lateral Raise 4 → 5 sets, appended as a second Lateral Raise entry 2×15-20 rather than an edit.
  - **Calves:** add Standing Calf Raise 3×10-15 to d6.
  - **Result:** chest, quads, lats and delts 2×/wk; side delts about 10 sets.

**H-5. No set has an effort target.**
- **What's wrong.** In default mode the only effort cue is optional RPE logging. "3×10-12" means one thing at 0 RIR and another at 5 RIR.
- **Evidence.** Hypertrophy improves as sets end closer to failure. Strength is flat across a wide RIR range [ROB24]. Failure isn't required [REF23].
- **Exact change (display only).** Derive a target RIR from tier and category and show it beside the prescription and in the badge:
  - strength tier: **2-3 RIR**, last set 1-2;
  - hypertrophy compounds: **1-3 RIR**;
  - isolation and machines: **0-2 RIR**;
  - `oly`/`jump`/`throw`/`punch`/`kick`: **"stop with 3+ in reserve; speed over grind"**;
  - medical/senior/prenatal: **3-4 RIR**.

  No stored data changes. Test: the rendered label for one exercise per class.

**H-6. Strength & Size: arms, side delts and hamstrings below the minimum.**
- **What's wrong.** Direct sets per week: biceps 3, triceps 3, side delts 3, rear delts 3, chest 8, hamstrings 6 (1×/wk). The overview promises "a bigger physique".
- **Evidence.** [ACSM26] ~10 sets; fractional counting puts biceps and triceps at ~10 because of compounds [PEL], so arms are borderline, not failing. Chest, side delts and hamstrings are the real gaps.
- **Exact change (append-only, history-safe):**
  - d1: Lateral Raise 3×12-20.
  - d4: Cable Fly 2×12-15 and Overhead Triceps Extension 3×10-12 (lengthened [LEN]).
  - d5: Seated Leg Curl 3×10-12.
  - **Result:** chest 10, side delts 6 direct / about 9 fractional, triceps 6/13, hamstrings 9 direct at 2×/wk.
  - About +6 min on d1, d4 and d5. Owner approves the longer sessions.

**H-7. Readiness says "fatigued" in the weeks the plan asks for hard effort.**
- **What's wrong.** `READINESS_RPE_HIGH = 8.5`, but RPE mode prescribes 8.5 in week 3 and 9 in week 4. A user doing exactly what's prescribed gets "RPE has averaged 8.8 this week — worth keeping an eye on".
- **Exact change.** Flag when the weekly average is ≥ the week's target + 1.0 (`targetRpeForWeek`), or ≥9.5 absolute. Test: week 4 at 9.0 gives no flag; week 2 at 9.2 gives a flag.

**H-8. No progression engine for bodyweight, holds or time-based work.**
- **What's wrong.** `computeSuggestedSet` returns `null` when `weight == null`. Bodyweight, Calisthenics, Senior, Core, Pilates and every medical style have no progression suggestions at all. "Push-up 4×AMRAP" and "BW Squat 2×10-12" stay the same forever.
- **Evidence.** Progressive overload is the core recommendation of [ACSM26]. Bodyweight work progresses by reps, then by leverage [PRAC].
- **Exact change.** A rep/time double progression for `noWeight` or weightless sets:
  - When all sets reach the top of the range (or the hold time) in 2 sessions, suggest +1 rep per set, or +5 s for holds.
  - Above 15 reps or 60 s, suggest the next variant from a small progression ladder: wall → incline → knee → floor → decline push-up; assisted → negative → full pull-up; tuck → advanced tuck → straddle lever.
  - The ladder lives beside `SUBSTITUTION_MAP`; it uses the existing substitution mechanism, so no new layer.
  - **Excluded:** medical styles; they keep fixed prescriptions (SAF-1).

### Medium

**M-1. The rest timer reads durations and distances as rep counts.**
- **What's wrong.** `getRepRangeTier` parses the first number after "×" whatever its unit. Real outputs:
  - Heavy Bag 6×2min rounds → **240 s** (all combat styles and 37 entries in total). Boxing rounds use 60 s.
  - Jump rope 4×1min → 240 s.
  - Sprint Intervals 6×40yd → **60 s**; the Athletic tip says "near-full recovery".
  - Front Lever / L-sit / Handstand max holds → 60 s.
  - Rowing 6×500m → 60 s.
  - Leg Press 3×12-15 (compound, endurance tier) → **60 s**.
- **Evidence.** Above 60 s helps hypertrophy slightly; nothing extra beyond about 90 s [SING24]. Maximal sprints and max holds need near-full recovery [PRAC].
- **Exact change.**
  - (a) `getRepRangeTier` returns `null` when the matched number is followed by `s|min|m|yd|rounds|breaths|steps`.
  - (b) A unit-aware branch in `getDefaultRestSeconds`:
    - `rounds` → 60 s (combat), or 45 s for jump rope;
    - sprints of 20 s or less, or distances of 40 yd or less → 120 s;
    - isometric skill holds (category `pull`/`push`/`shoulder` with an `s` unit) → 120 s;
    - erg or run intervals → 90 s.
  - (c) Endurance tier: compound 60 → **120 s**, isolation 60 → **75 s**.
  - Tests: one per branch, plus `getRestReasonLabel` agreeing.

**M-2. The "decrease" signal fires after one bad session.**
- **What's wrong.** Reps fall below the floor once and the next session drops 7.5%.
- **Evidence.** Coached LP and stall rules wait for a repeated failure: Starting Strength resets about 10% after 3 stalls; GZCLP changes the rep scheme before cutting load [PRAC]. One session is often noise (sleep, food).
- **Exact change.** Require 2 consecutive sessions below the floor, or 1 at RPE 10. Drop 5% for upper body and 7.5% for lower; snap down.

**M-3. Fixed lb increments ignore relative strength.**
- **What's wrong.** `squat/hinge/oly: 10 lb` is +7.4% on a 135 lb squat and +2.2% on a 455 lb one. Shoulder and isolation work gets 2.5 lb.
- **Exact change.** Increment = max(smallest loadable jump, round(e1RM × p)), with p = 2.5% lower body, 2% upper compounds, 0 for isolation (add a rep first), snapped through `snapToLoadable`. Keep the current table as the floor. Basis [PRAC].

**M-4. e1RM ignores the logged RPE.**
- **What's wrong.** `estimated1RM(w, reps)` treats every set as taken to failure. A logged 100×8 @ RPE 7 under-estimates e1RM by about 10%.
- **Exact change.** When an RPE is logged, use e1RM = w × (1 + (reps + (10 − RPE))/30), keeping the >15 cap. RPE mode then becomes accurate instead of systematically light. Keep it display/derived only.

**M-5. Exercise selection lacks lengthened-position work.**
- **What's wrong.**
  - Leg Curl is unspecified everywhere; seated beats lying [LEN].
  - Strength & Size, Powerlifting and Powerbuilding d2 have no overhead triceps work [LEN].
  - The Leg Press cue stops at "about 90°".
  - The calf cues don't ask for a pause in the stretch.
- **Exact change.**
  - Rename display to "Seated Leg Curl (or lying)". This is a rename, so **needs-owner** for exKey continuity unless done as a cue-only change. Preferred now: cue only, "Seated machine if available — the stretched hip position grows hamstrings more [LEN]".
  - Leg Press cue: "Lower as deep as you can keep your lower back on the pad".
  - Calf Raise cue: "Pause 1-2 s in the bottom stretch".

**M-6. Deload is calendar-only and inconsistent with the tips.**
- **What's wrong.** Every 5th calendar week is a deload even after a week off. Bodybuilding tips say "deload every 6-8 weeks".
- **Evidence.** Consensus places deloads at the end of a mesocycle, typically every 4-8 weeks. It favours lowering volume over abandoning intensity, and supports earlier deloads from fatigue signals [BELL23]. The current mechanism is reasonable: about 45% fewer sets and a 15% load drop.
- **Exact change.**
  - Count a week toward the block only if it has ≥2 logged sessions.
  - Offer an early deload when `buildProgramFitInsight` returns `overreaching`. `manualDeloadEnabled` already exists; surface it as a one-tap suggestion.
  - Align the bodybuilding tip to "every 4-6 weeks".

**M-7. Medical programs don't progress to the evidence-supported dose.**
- **Osteoporosis:** stays on wall push-ups and bodyweight. LIFTMOR showed supervised 5×5 at >80% 1RM was safe and raised spine BMD [LIFT18].
  - Add a d7-style note with the path: "With a physio/coach: progress toward supervised heavy deadlift, squat and press (LIFTMOR protocol)".
  - Don't auto-progress (SAF-1).
- **Hypertension:** add **Wall Squat (isometric) 4×2 min, 2 min rest**, as an append to d5, about 3×/wk. Isometrics ranked first for lowering resting BP [BP23]. Cue: "Breathe throughout; no breath-holding".
- **Achilles:** add a note offering heavy slow resistance (3×15 → 3×6 calf raises with a 3 s up / 3 s down tempo, 3×/wk) as an equal alternative with better adherence [ACH15].

**M-8. Categories that mis-drive the logic.**
- **Calf Raise, Standing Calf Raise and Eccentric Heel Drop are `arms`:** wrong increment, wrong regions, wrong substitutes.
- **Leg Extension is `squat`:** it gets a compound warm-up ramp, accumulation +1 set and 150 s rest.
- **Leg Curl is `hinge`:** it counts toward Posterior Chain correctly but triggers the Lower Back region.

Exact change (**needs-owner**, because `MUSCLE_GROUP_MAP` / Analysis history groupings shift):
- Add `calf` and `isolation-leg` categories, with increment 5 / 2.5 and rest 75-90 s.
- Mapped to Legs in `MUSCLE_GROUP_MAP`.
- Not in `WARMUP_ELIGIBLE_CATEGORIES` or `COMPOUND_CATEGORIES`.

**M-9. Powerbuilding and Powerlifting gaps.**
- **Powerbuilding** (direct sets, 5-day): chest 11 at 1×, lats 3, side delts 3, calves 3.
- **Powerlifting:** side and rear delts 0, calves 0. That's acceptable for the sport, but it doesn't train upper-back density for the bench arch.
- **Exact change (append-only):**
  - Powerbuilding d4: Pull-ups 3×6-10.
  - Powerbuilding d6: Incline DB Press 3×8-12 and Lateral Raise 3×15-20.
  - Powerlifting d5: Face Pull 3×15.

### Low

**L-1. Cue and copy claims the evidence doesn't support** (exact rewrites in §4):
- Hip Thrust EMG claim [PLOT23].
- DB Curl "lowering is where most growth happens" and the bodybuilding insight "slow the eccentric for more growth" [DUR15].
- "Growth hormone release peaks in deep sleep, directly supporting repair".

**L-2. Tips that contradict the engine.**
- Strength "all sets" (H-2).
- Bodybuilding deload interval (M-6).
- Athletic "full recovery" vs the 60 s sprint rest (M-1).

**L-3. Unmapped variant names** ("Squat (Speed)", "Bench Press (Speed)", "Deadlift (Light/Technique)") — check they have `exerciseInfo` entries, otherwise they have no cues, rest tier or progression category.

---

## 3. Scorecard
P = pass, W = weak, F = fail. Volume figures are **direct sets per week, default day count**; fractional totals are in H-3 to H-6 and M-9. Source keys are in the table at the top.

### Lifting programs
| Program | Volume | Frequency | Intensity | Progression | Selection | Recovery | Safety | Clarity |
|---|---|---|---|---|---|---|---|---|
| Strength & Size | **W** chest 8, side delt 3, ham 6 [ACSM26] | **P** most muscles 2× [FREQ19] | **P** 4×4-6 main + 8-15 accessories [ACSM26] | **W** top-set-only DP (H-2) [PRAC] | **W** no overhead triceps or seated curl [LEN] | **P** 5-wk block + deload [BELL23] | **W** goal/accumulation stacking to 6×4-6 squat (SAF-1) | **P** clear day roles |
| Bodybuilding | **W** side delt 4, lats 4, calves 4 [ACSM26] | **F** chest, quads, lats 1× despite "2×" claim [FREQ19] | **W** no RIR target (H-5) [ROB24] | **W** H-2 | **P** good isolation mix; **W** pushdown-heavy | **W** tip says 6-8 wk vs engine 5 (M-6) [BELL23] | **P** | **F** overview claim false (H-4) |
| Bodybuilding 3-day | **F** chest 3, ham 2 [PEL] | **F** 1× all [FREQ19] | **W** | **W** | **W** | **P** | **P** | **W** contradicts the code comment |
| Powerbuilding | **W** lats 3, side delt 3 [ACSM26] | **W** chest 1× [FREQ19] | **P** 5×5 + hypertrophy [ACSM26] | **W** H-2 | **P** | **P** | **W** SAF-1 | **P** |
| Powerlifting | **P** quads 14, ham 9, chest 9 for the sport [PEL] | **W** squat main 1× + front squat; 3-day **F** [PEL] | **P** 5×5, 5×3, pause, deficit [PRAC] | **W** no top sets, peaking or %1RM [PRAC] | **P** carryover accessories | **P** | **W** "performance" cuts to 3×5 (H-1) | **P** |
| Olympic | **P** for technique [PRAC] | **P** lifts 2×+/wk [PRAC] | **W** no %1RM guide; RPE 9 possible (SAF-2) | **F** +10 lb Epley-based DP on snatch [PRAC] | **P** pulls, OHS, balance | **P** | **W** SAF-2, H-1 | **P** |
| Athletic / Plyo | **P** ~100 contacts/wk [PRAC] | **P** | **P** power + strength mix [ACSM26] | **W** jumps don't progress; no tracking metric | **P** | **W** sprints get 60 s rest (M-1) | **W** depth jumps without prerequisites (SAF-5) | **P** |
| Calisthenics | **P** | **P** | **W** no RIR on skill holds | **F** no bodyweight progression (H-8) | **P** good skill ladder | **W** 60 s on max holds (M-1) | **W** muscle-up 4×3-5 with no prerequisite | **P** |
| Bodyweight | **W** legs only BW squat/BSS | **P** | **W** AMRAP only | **F** H-8 | **P** Nordic included [NHE19] | **P** | **P** | **P** |
| Senior | **W** 2 sets, no external load [ACSM26] | **P** 3 strength days | **P** fast concentric sit-to-stand (power) [ACSM26] | **F** none (H-8) | **P** balance, power, step-ups | **P** | **W** accumulation adds sets (SAF-1) | **P** |
| Core & Stability | **P** | **P** | **P** | **W** none for holds (H-8) | **W** McGill basis, yet weighted sit-ups and Russian twists [PRAC] | **P** | **P** | **W** basis vs selection mismatch |

### Sport, conditioning and clinical
| Program | Volume | Frequency | Intensity | Progression | Selection | Recovery | Safety | Clarity |
|---|---|---|---|---|---|---|---|---|
| Running | **P** easy/tempo/interval/long | **P** 5 runs | **P** ~2 hard of 5 | **F** no weekly mileage progression [PRAC] | **P** heavy strength day | **P** | **P** | **P** |
| Cycling (road, MTB) | **P** | **P** | **P** polarized | **F** no FTP retest or progression | **P** | **W** 3×10 min FTP gets 90 s rest (M-1) | **P** | **P** |
| Swimming | **P** | **P** | **P** | **F** none | **P** dryland ER/face pull | **P** | **P** | **P** honest basis |
| Combat styles (6) | **P** | **P** | **P** | **W** lifts only | **P** | **F** 240 s between bag rounds (M-1) | **W** SAF-6 cues | **P** |
| Boxing S&C | **P** | **P** | **P** | **W** | **P** rotational power | **W** M-1 | **P** | **P** |
| BJJ / Grappling | **P** | **P** | **P** | **W** | **W** neck bridges | **P** | **F** SAF-4, SAF-6 | **P** |
| Hyrox | **P** | **P** | **P** compromised running | **W** none | **P** | **W** erg rest 60 s | **P** | **P** |
| Climbing | **P** | **P** | **P** | **W** hangboard load not tracked as %BW | **P** antagonists included | **P** | **W** fingers not flagged (SAF-3) | **P** |
| Watersports (6) | **P** | **P** | **P** | **W** | **P** sport-specific | **P** | **W** depth jumps in ACL-risk sports (SAF-5) | **P** |
| Jump Rope, Mobility, Pilates, Yoga, Desk | **P** | **P** | **P** | **W** none (H-8) | **P** | **P** | **P** | **P** |
| Medical: hypertension | **P** | **P** | **F** RPE 9 possible (SAF-2) [AHA23] | **W** | **W** no isometric work [BP23] | **P** | **F** SAF-1/2 | **P** |
| Medical: osteoporosis | **P** start | **P** | **W** no path to ≥80% [LIFT18] | **W** | **P** no-flexion rule | **P** | **W** SAF-1 | **P** |
| Medical: prenatal / postpartum | **P** [PREG19] | **P** | **P** | **P** fixed by design | **P** avoids prolonged supine | **P** | **F** SAF-1 doubles volume | **P** |
| Medical: ACL / Achilles / shoulder / low back / general | **P** | **P** | **P** | **P** criteria-based text [ACH15] | **P** | **P** | **F** SAF-1 (+67% ACL d4 sets) | **P** |
| Medical: obesity / diabetes / bariatric | **P** | **P** | **P** | **W** | **P** post-meal walks | **P** | **W** SAF-1 | **P** |

---

## 4. Cue quality
**Wrong or misleading (rewrite):**
- **Hip Thrust**, cue 3: "…EMG research ranks it the most direct glute exercise". Hip thrust and squat grew glutes equally despite higher hip-thrust EMG [PLOT23]. New: "Lock out and pause 1 s; squats and hip thrusts grow glutes about equally, so use whichever you can load and feel."
- **DB Curl**: "Control the lowering phase — that's where most of the growth happens". New: "Lower under control in about 2 s; full stretch at the bottom with arms straight." [DUR15]
- **Bodybuilding default insight** "Slow the eccentric down… more growth stimulus". New: "Rep speed from about 0.5-8 s grows muscle similarly; control the weight and take sets close to failure." [DUR15][ROB24]
- **Leg Press**: "Lower until knees reach about 90°". New: "Lower as deep as your lower back stays flat on the pad." [LEN]
- **Deadlift**, cue 2: "legs first, then extend the hips" invites hips shooting up early. New: "Push the floor away; hips and shoulders rise together until the bar passes the knees."
- **Neck Bridges**: replace the exercise (SAF-4).
- **Eccentric Heel Drop / Calf Raise categories**: not cue text but driving wrong substitutes (SAF-3, M-8).

**Vague or filler (replace the line with a real cue):**
- **Lateral Raise** cue 3 (the V-taper line). New: "Raise in the plane of the shoulder blade, slightly forward; stop at shoulder height."
- **Dragon Flag** cue 3 (Bruce Lee). New: "Start with tuck or single-leg negatives; stop if your lower back arches off the bench."
- **Front Lever Hold** cue 3 (Sommer). New: "Progress tuck → advanced tuck → one leg → straddle; hold 10-15 s with straight arms."
- **Dip (Bar/Ring)**: "one of the most effective…". New: "Lower until your shoulder is level with your elbow, not deeper, unless that's comfortable."
- **L-sit**: "one of the best…". New: "Press the shoulders down hard; tuck sit first."

**Missing safety cues:**
- RNC, Armbar and Clinch knees (SAF-6).
- **Depth Jump** box height and prerequisite (SAF-5).
- **Muscle-up**: "Prerequisite: 10 strict pull-ups and 10 dips first."
- **Hangboard**: "Under 1-2 years of climbing, use feet-on or no-hang devices" is already present (good).

**Good and evidence-aligned (keep):**
- Squat, Bench, OHP, Row, RDL, Pull-up, BSS.
- Nordic Curl injury-prevention line (holds, but note the dispute [NHE19]).
- Sit-to-Stand "as fast as safely" (power for older adults [ACSM26]).
- Hangboard tendon-adaptation note.
- Eccentric Heel Drop technique.
- Standing Pelvic Tilt prenatal supine note [PREG19].

---

## 5. Raising the bar: how each program beats Strong, Hevy, Fitbod, RP and Juggernaut
The competitor descriptions come from their public positioning, not from testing them this session; the market-researcher's `research.md` owns verification.
- **Strong and Hevy:** excellent loggers with user-built templates, but no evidence-driven programming.
- **Fitbod:** generates sessions from per-muscle recovery estimates.
- **RP Hypertrophy:** adjusts sets per muscle weekly from soreness, pump and workload feedback across mesocycles.
- **Juggernaut AI:** autoregulates strength loads from RPE and readiness, with block periodisation.

Training Log's edge has to be: **their best mechanics, plus visible citations, plus clinical and sport breadth, offline, with no subscription.**

| Program | Beat whom | How (concrete) |
|---|---|---|
| Strength & Size | Strong/Hevy templates, Fitbod | H-2 all-set double progression + H-5 RIR targets + M-3 percentage increments. Show "why this number" (already a strength of the badge). Add a per-muscle weekly set ledger (fractional [PEL]) on Today, so the user sees 10/10 chest before they leave the gym; Fitbod shows recovery, not dose. |
| Bodybuilding / Powerbuilding | RP Hypertrophy | **Set autoregulation from logged data:** after each week, per muscle, if all sets hit target reps at the prescribed RIR and RPE ≤ target, add 1 set the next week (cap +4 over the block); if reps fell at the same load, hold or remove 1 set. Over 2-3 blocks this learns the owner's own volume landmarks (MEV/MRV) from their logs, not population constants (`VOLUME_LANDMARKS` stays as the prior). RP asks for subjective pump and soreness; this uses performance, which is harder to fool, and can add RP's soreness prompt as a tiebreak. |
| Powerlifting | Juggernaut | Add a **weekly top single or triple at RPE 8** with back-off sets at −10% (RTS-style), e1RM trend per lift, and a **stall rule**: 3 sessions without an e1RM gain → swap the variation (pause, deficit, tempo) for 3 weeks (GZCLP-style [PRAC]). Add an optional **meet-peak** block (taper volume about 40-60% over the final 2 weeks [BELL23]). |
| Olympic | none of them program it well | % bands per lift (snatch and C&J 70-85% for doubles, pulls 90-110% of the lift), a **miss counter** (2 misses at a weight → drop 5%), and a no-RPE-9 rule (SAF-2). |
| Athletic | Fitbod | Log jump height or broad-jump distance and sprint times as **performance metrics**; progress contacts by quality: stop a set when distance falls more than 10% from the session best [PRAC]. |
| Calisthenics / Bodyweight | Hevy (no progression) | H-8 progression ladders with automatic "next variant" suggestions; skill-readiness gates (muscle-up, front lever). |
| Senior | none | Power-first prescriptions [ACSM26], a monthly 30-s chair-stand test logged as a metric, and progression from bodyweight to a held weight. |
| Medical styles | none of them | Safety gates (SAF-1/2) as a visible promise: "This plan never auto-increases". Plus each style's best-evidence lever: isometric BP work [BP23], LIFTMOR path [LIFT18], HSR option [ACH15], criteria-based return to sport. |
| Running / Cycling / Swimming | Runna-type apps (not in the brief) | Weekly volume progression ≤10% with a down week every 4th, matching the lifting block clock; FTP/threshold retest every block. |
| Combat / Grappling / Watersports / Hyrox | none | Correct round-based rest (M-1), safety cues (SAF-4/5/6), and conditioning benchmarks (rounds, erg splits) tracked like PRs. |

### Single biggest bar-raising opportunity
**A per-muscle weekly volume ledger driving set-level autoregulation.**
- Fractional sets per muscle [PEL] are counted live from the log, with an RIR target on every set [ROB24].
- All-set double progression for load.
- A weekly ±1-set rule per muscle, learned from the owner's own performance.

This combines RP's volume autoregulation and Juggernaut's load autoregulation, but every number is explained and cited, it works offline, and it stays out of clinical programs.

It builds on pieces the app already has:
- `VOLUME_LANDMARKS` / `volumeLandmarkLabel`;
- `analyzeProgressionSignal`;
- the 5-week block and the Program Fit Check;
- `window.storage` for per-muscle state.

So it extends existing patterns rather than adding a new layer. Ship it as small increments: ledger, then RIR labels, then all-set progression, then the weekly set rule.

---

## 6. Build order (superseded: see the unified sequence in `planning/roadmap.md`; kept for reference)
1. SAF-1: program-class gate on goal volume and accumulation (render-time, no data change).
2. SAF-2: RPE caps for medical/senior/prenatal; RPE mode off for oly/jump/throw.
3. SAF-3: exercise region override map.
4. H-1: performance cap skips strength-tier sets.
5. M-1: unit-aware rest parsing.
6. H-7: readiness against the week's RPE target.
7. H-2: all-set double progression.
8. H-5: RIR target labels.
9. SAF-6, SAF-7, L-1, §4 cue rewrites: text only, one version per group.
10. **Needs-owner (slot changes, migrations):** SAF-4 neck bridge swap, SAF-5 drop-landing slot, H-3 low-day variants, H-4 bodybuilding d6, M-5 renames, M-8 categories.
11. **Append-only content (owner approves the longer sessions):** H-6, M-7, M-9.
12. H-8 bodyweight progression ladders, then the §5 volume ledger and set autoregulation.

---

## Alignment addendum (2026-11-07, v3.516)

**Scope corrections:**
- **SAF-4:** Neck Bridges appear **6 times**, not once: grappling d6 (`index.html:11048`) plus five grappling day-count variants (21274, 21312, 21355, 21405, 21456). Every occurrence needs the same fix.
- **SAF-5:** Depth Jump appears about **20 times**: the 4 default days plus the athletic (17687–17785), skimboarding, wakeboarding and kite (23937–24568) variants.
  - The cue fix (BL-05) covers all of them.
  - The prerequisite belongs in that cue: "first 4 weeks: do Drop Landing 3×5 instead". An appended drill (BL-36) would come *after* the depth jumps, which is the wrong order for a prerequisite.
- **SAF-1 test scope:** iterate `PROGRAM_DAY_COUNT_VARIANTS` days too (senior, athletic, combat, watersports), not only the default days.

### SAF-8 (medium): Load increases are not gated on clinical programs
**What's wrong.**
- SAF-1 gates sets only. `analyzeProgressionSignal` (27483) has no program check. It suggests "+increment" after two sessions at the top rep with logged RPE ≤8.5, or with no RPE logged.
- This applies to the 13 medical slots without `noWeight`. For example, Seated Cable Row appears in the obesity, hypertension, diabetes, osteoporosis, prenatal, postpartum and shoulder-rehab styles.
- So "this plan never auto-increases" would be untrue after SAF-1 alone.

**Evidence.** Progressive loading is appropriate in clinical plans, but at moderate effort, prescribed by tolerance [AHA23][PREG19]. An RPE 8.5 threshold contradicts SAF-2's cap of 6–7.

**Exact change** (fold into BL-02). For `MEDICAL_STYLES`, senior and prenatal:
- the increase signal requires logged RPE ≤7 in both sessions; with no RPE logged, no number is shown, only "if both sessions felt comfortable, try the smallest jump";
- the increment is the smallest loadable jump;
- BL-08 and BL-24 inherit this rule.

The promise wording becomes: "never adds sets; load rises only in the smallest steps when sets felt easy".

**Test:** a real invocation on hypertension Seated Cable Row 2×12 at RPE 8 gives no increase; at RPE 7 it gives the smallest jump.

### SAF-9 (medium): AI prompts don't know the clinical style
**What's wrong.**
- Cross-Metric Insights (42583) must answer PUSH, MAINTAIN or DELOAD. The coach chat (42670) and that prompt both receive only "Active program: Medically Modified".
- Neither receives the style (prenatal, ACL, hypertension) or the tolerance rule.

**Exact change (prompt text only):**
- Pass `MEDICAL_STYLES[activeMedicalStyle].label` to both prompts.
- For medical styles, limit the verdict to MAINTAIN or DELOAD and add "check with your care team".
- Leave `output_config.effort`, `max_tokens` and the payload untouched (CLAUDE.md fragile area); `test-ai-cross-metric-effort-fix.js` must still pass.
- Land it before any public step and before hosted AI (BIZ-14).

**Still unverified:** Pelland et al.'s publication year (2025 vs 2026). Check it with paper-lookup once D10 is approved.
