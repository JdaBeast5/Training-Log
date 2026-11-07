# Roadmap: Training Log

Owner: project-manager. Written 2026-11-07 against **v3.514** (`index.html:7622`, `sw.js` `VERSION` matches). Line numbers below are `index.html` at v3.514 unless a file is named.

Inputs:
- `planning/research.md` (market-researcher, 2026-11-07);
- `planning/program-audit.md` (exercise-auditor, 2026-11-07);
- `planning/toolchain.md` (skills-orchestrator, 2026-11-07);
- `HANDOFF-v59.md` through Addendum 41.

All three planning inputs were written against v3.514, the current code, so none is stale.

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
| 1 | **Program safety gates** | 4 | 5 | 5 | 100 (forced first) | BL-01 to BL-06, BL-13, BL-35, BL-36 |
| 2 | **Progression engine correctness** | 5 | 4 | 4 | 80 | BL-07 to BL-11, BL-15, BL-24, BL-34 |
| 3 | **Effort and volume programming** (RIR, per-muscle ledger, set autoregulation) | 5 | 4 | 3 | 60 | BL-12, BL-20, BL-30, BL-31 |
| 4 | **Nutrition you can trust** (trend weight, adaptive expenditure) | 4 | 4 | 3 | 48 | BL-16, BL-17, BL-27 |
| 5 | **Logging speed** (food) | 4 | 4 | 3 | 48 | BL-18, BL-19, BL-28 |
| 6 | **Program quality** (dose, frequency, selection, copy truth) | 4 | 4 | 2 | 32 | BL-14, BL-26, BL-37 to BL-40 |
| 7 | **Recovery that understands lifting** | 3 | 3 | 3 | 27 | BL-21, BL-23, BL-32, BL-33 |
| 8 | **Portability and reliability** | 2 | 5 | 3 | 30 | BL-22, BL-29 |

Theme 7 sits above theme 8 despite the lower score. Readiness is seen every training day; import and export are one-off.

### 1. Program safety gates
- **Problem:**
  - Goal volume and block accumulation add sets to ACL rehab, prenatal, hypertension and senior plans. ACL d4 goes from 3 sets per exercise to 5, and hypertension volume doubles (audit SAF-1).
  - RPE mode can prescribe RPE 9 to hypertension clients and on snatches (SAF-2).
  - Resting-region flags miss fingers, neck, calves and the knee on leg curls (SAF-3).
- **Benchmark:** no competitor programs clinical populations, so there is no best app to copy. The closest is Juggernaut AI's autoregulation, which has no clinical gating ([SensAI compare](https://www.sensai.fit/blog/juggernaut-ai-vs-rp-hypertrophy-vs-alpha-progression-2026)).
- **How we go one better:** a visible, test-enforced promise, "this plan never auto-increases". It's backed by a jsdom test over every `MEDICAL_STYLES` day (11352) × goal × week. Clinical plans then follow their own tolerance-based `basis` text [AHA23][PREG19] (audit source keys).

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
  - running and cycling volume progression;
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
4. BIZ-11: "free core, no ads" as a public commitment.
5. BIZ-08: the app's address on share cards.
6. BIZ-13: off-device backup (own iCloud or Drive first).
7. BIZ-14: hosted AI (recommend not yet).
