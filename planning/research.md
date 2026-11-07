# Market research: the best trackers, and where Training Log stands

Prepared by the market-researcher agent on **2026-11-07**. Training Log was checked at **v3.514** (`APP_VERSION`, `index.html:7622`). Line numbers refer to `index.html` at that version.

## How this was gathered, and what to trust

- **Method:** web search only (standard mode). No App Store or Google Play page was fetched directly, so every rating below comes from a third-party tracker, a review, or the developer's own site. Each number carries the snapshot date its source gave. Where sources disagreed, the range is shown.
- **Source quality:** many 2026 "reviews" are written by competing apps (SensAI, Nutrola, Dr. Muscle, Alpha Progression, GAYA, Brace) or are auto-generated audits (marlvel.ai, unstar.app). They are used only for facts that a second source supports, or are labelled as such.
- **Reddit:** no first-hand r/weightroom, r/fitness or r/naturalbodybuilding threads came back in search. Reddit sentiment here is second-hand, through aggregators and labelled that way. **Treat it as unverified.**
- **Not invented:** no rating, count or quote appears without a link. Where none was found, the cell says "not found".

---

## Summary: the five biggest opportunities

1. **Adaptive expenditure and a smoothed trend weight.** This is MacroFactor's core differentiator: it re-estimates TDEE weekly from logged intake plus a trended weight and adjusts targets at a check-in. Training Log sets calories once from Mifflin–St Jeor × an activity factor (`computeTargets`, 32973). It draws raw weigh-ins with a first-to-last pace (`renderSparkline`, 40795). **Status: missing.** It matters most to the person who also logs food daily, which Training Log already asks of them.
2. **Per-muscle weekly volume that reacts to feedback.** RP Hypertrophy (about $35/month) and Juggernaut AI (about $35/month) adjust next week's sets from soreness, pump, joint pain and performance. Alpha Progression and MacroFactor Workouts paywall similar ideas. Training Log already has free double progression, RPE-based loads and a stall-triggered deload. It also counts weekly sets by muscle (`renderVolumeTrend`, 45482). It has no set targets per muscle and asks for no feedback. **Status: weaker.** Doing this free and with the reason shown is a clear way to beat the paid apps.
3. **Readiness built for lifters.** Athlytic and WHOOP users complain that HRV-based recovery ignores muscle fatigue, and WHOOP's Strength Trainer is described as hard to use. Training Log imports HRV (`parseHealthCsv`, 47037; HRV alias at 46959), but `computeReadiness` (46843) never reads it. Today readiness only raises flags; it doesn't change the session. **Status: weaker.**
4. **Faster food logging: recents, copy a meal or day, saved meals.** MacroFactor competes on counted taps (its "Food Logging Speed Index"). MyFitnessPal's most-cited complaint is that barcode scanning is paywalled. Training Log already has free barcode lookup (Open Food Facts, `lookupBarcode`, 35155), USDA search, Snap a Meal and Describe It. No recents list, copy-yesterday or saved-meal shortcut turned up in a grep. **Status: missing.**
5. **Data portability: import from Strong and Hevy, export as CSV.** Switching friction keeps people in their current app; reviews say CSV fidelity matters to people leaving Strong. Training Log has a full JSON backup (34217), but there is no CSV export and no importer for other apps. **Status: missing.** This is cheap to build, and it's the only way to win people with years of logs elsewhere.

---

## 1. The apps (ratings dated, as reported)

| App | Category | Rating and count (as reported) | Snapshot | Price (as reported) | Sources |
|---|---|---|---|---|---|
| Hevy | Workout log | iOS 4.9 / ~94K US; Google Play 4.9 / ~268K | 2026-09-21 | Pro $2.99/mo, $23.99/yr, $74.99 lifetime. Free: 4 routines, 7 custom exercises, 3 months of stats | [soma review](https://soma-web.pages.dev/blog/hevy-app-review/), [recurdash (2026-07-21)](https://recurdash.com/subscription-pricing/hevy), [aitoolsbakery](https://aitoolsbakery.com/blog/hevy-review/) |
| Strong | Workout log | iOS 4.9 / 108,477 | 2026-07-29 | Pro $29.99/yr. Free: 3 routines | [Sonar](https://trysonar.app/keyword-difficulty/workout-tracker/ios/us), [SensAI pricing](https://www.sensai.fit/blog/fitness-app-pricing-free-tier-comparison) |
| Fitbod | AI generator | iOS 4.8 / ~268K–280K; Google Play 4.6 / 27.7K | 2026 (undated within year) | $15.99/mo or $95.99/yr (Jun 2026); older sources say $79.99/yr | [SensAI Fitbod 2026](https://www.sensai.fit/blog/fitbod-review-2026), [apppricinglab](https://apppricinglab.com/app/google_play/com.fitbod.fitbod) |
| JEFIT | Workout log and library | iOS ~4.8 / 43K–47K US (81K global) | 2026-07-21 to 2026-10-26 | not checked | [AppGoblin](https://appgoblin.info/apps/449810000), [AppBrain](https://www.appbrain.com/appstore/jefit-workout-plan-gym-tracker/ios-449810000) |
| Boostcamp | Program library | iOS 4.8 / 8.3K | undated | Free; analytics in Pro | [GarageGymReviews](https://www.garagegymreviews.com/boostcamp-review), [Fortune](https://www.fortune.com/article/boostcamp-review/) |
| Alpha Progression | Progression engine | iOS 4.91 / 2.6K; other sources: 4.7 / 18K+ | undated | Progression recommendations are Pro | [AppGoblin](https://appgoblin.info/apps/1462277793), [hotelgyms](https://www.hotelgyms.com/blog/alpha-progression-the-gym-logger-app-from-germany) |
| RP Hypertrophy | Feedback-driven mesos | iOS 4.3 / 212 (other sources: 4.45 / 97 Android) | undated | $34.99/mo, $299.99/yr (Oct 2026) | [appfollow](https://apps.appfollow.io/ios/rp-hypertrophy/1555614554?country=us), [SensAI compare](https://www.sensai.fit/blog/juggernaut-ai-vs-rp-hypertrophy-vs-alpha-progression-2026) |
| Juggernaut AI | Powerlifting autoregulation | not found | — | $34.99/mo, $349.99/yr (competitor-reported) | [SensAI compare](https://www.sensai.fit/blog/juggernaut-ai-vs-rp-hypertrophy-vs-alpha-progression-2026), [GarageGymReviews](https://garagegymreviews.com/juggernautai-review) |
| SmartGym | Apple Watch–first log | iOS 4.7 / 30.9K–34K | 2026-09-29 | Premium+ $59.99/yr | [SensAI compare](https://www.sensai.fit/blog/smartgym-vs-hevy-vs-fitbod-2026), [apppricinglab](https://apppricinglab.com/app/apple/922744883) |
| Gravitus | Workout log | iOS 4.8 / 3.1K (AppGoblin: 4.84 / 8.7K) | undated | not checked | [apppricinglab](https://apppricinglab.com/app/apple/965383840), [AppGoblin](https://appgoblin.info/apps/965383840/trends) |
| Liftin' | Workout log (Apple ecosystem) | **not found** | — | premium, free trial | [appfollow](https://apps.appfollow.io/ios/liftin-gym-log/1445041669?country=sv) |
| StrengthLog | Free log plus programs | ~4.7 / 10.9K (auto-audit) | undated | Free core; premium programs and stats | [marlvel](https://marlvel.ai/api/llm/apps/health-fitness/strengthlog-workout-tracker), [App Store IE](https://apps.apple.com/ie/app/id1434229662?l=en-gb) |
| MacroFactor Workouts (new) | Smart-progression log | **not found** | launched Jan 2026 | $11.99/mo, $71.99/yr (AU listing) | [MacroFactor Jan 2026](https://macrofactor.com/mm-jan-2026/), [Apr 2026](https://macrofactor.com/mm-april-2026/) |
| LADDER (rising) | Coach-led plans | iOS 4.95 / 136,453 | May 2026 | not checked | [App Store Tracker](https://www.appstoretracker.com/best/strength-training-apps) |
| MacroFactor | Nutrition | iOS 4.7–4.8 / 12.6K–19.5K | Dec 2025 snapshot | $11.99/mo, $71.99/yr; no free tier | [apppricinglab](https://apppricinglab.com/app/apple/1553503471), [gainframe](https://gainframe.app/blog/macrofactor-review/) |
| Cronometer | Nutrition (micros) | iOS 4.8 / 88.2K | Mar 2026 | Gold paid; free tier has ads | [apppricinglab](https://apppricinglab.com/app/apple/1145935738), [Cronometer press](https://cronometer.com/blog/?p=46801) |
| MyFitnessPal | Nutrition | 1.82 "score" on 795 recent US reviews (MyNetDiary); 202 of 300 Play reviews were 1–3★ (Jul 2026). Lifetime 4.7 / 2.3M is undated. | May / Jul 2026 | $19.99/mo, $79.99/yr; barcode is premium | [MyNetDiary May 2026](https://www.mynetdiary.com/diet-app-scorecard-may-2026.html), [unstar](https://unstar.app/blog/is-myfitnesspal-premium-worth-it-paywall-app-reviews-2026) |
| Lose It! | Nutrition | iOS 4.8 / 738.8K | 2026 | Premium ~$39.99/yr | [apppricinglab](https://apppricinglab.com/app/apple/297368629), [amyfoodjournal](https://amyfoodjournal.com/blog/lose-it-app-review) |
| WHOOP | Recovery wearable | iOS ~4.46–4.6 / 12K–30K | Mar 2026 | membership | [AppBrain](https://www.appbrain.com/appstore/whoop/ios-933944389), [marlvel](https://marlvel.ai/intel-report/health-fitness/whoop) |
| Oura | Recovery wearable | 4.84 / ~255K (auto-audit) | Apr 2026 | membership required for detail and history | [marlvel](https://marlvel.ai/intel-report/health-fitness/oura), [channelnews](https://channelnews.com.au/oura-quietly-files-for-ipo-as-users-revolt-over-subscription-costs-battery-failures-and-product-complaints/) |
| Bevel | Recovery (Apple Health) | 4.8 / 7.8K | 2026 | Pro $9.99–14.99/mo (sources conflict) | [autonomous.ai](https://www.autonomous.ai/ourblog/bevel-app-review), [apptail US](https://apptail.io/app/bevel-ai-health-coach-vsMo/united-states) |
| Athlytic | Recovery (Apple Watch) | iOS 4.8 / 9.8K–16K | undated | subscription | [apppricinglab](https://apppricinglab.com/app/apple/1543571755), [apptail UK](https://apptail.io/app/athlytic-ai-fitness-coach-usT/united-kingdom) |

---

## 2. Core logging loops

| App | How a set or meal is logged | Taps (where known) |
|---|---|---|
| Hevy | A routine pre-fills sets. A PREVIOUS column shows last session's set; tap the check to log, and the rest timer starts. A Live Activity can mark sets done from the lock screen. Warm-up sets come from a % formula. ([track exercises](https://www.hevyapp.com/features/track-exercises/), [live activity](https://www.hevyapp.com/features/live-activity/), [settings](https://www.hevyapp.com/features/workout-settings/)) | 1 tap when the plan is hit (not independently counted) |
| Strong | Same pattern: template, previous values, check, auto rest timer. Plate calculator, and a mature Apple Watch app. ([setgraph summary of Reddit](https://setgraph.app/ai-blog/hevy-vs-strong), [Brace review](https://brace-ai.pages.dev/reviews/strong/)) | 1 tap when matched (not independently counted) |
| Fitbod | The app generates the day's workout from recovery per muscle and equipment; you log or edit each set. | not found |
| RP / Juggernaut AI | Log reps and RIR/RPE per set, then answer pump, soreness, joint and workload questions. Next week is rewritten from the answers. ([Dr. Muscle on RP](https://dr-muscle.com/rp-hypertrophy-app-beginners/)) | more taps by design (questionnaires) |
| SmartGym | Standalone Apple Watch logging and Siri start; reviewers say logging sets on the watch is "hit and miss". ([justuseapp](https://justuseapp.com/en/app/922744883/smartgym-gym-home-workouts/reviews)) | not found |
| MacroFactor | Search, barcode, AI photo (beta, Apr 2025), "Photo & Text", recents and quick add. The company measures speed in taps with its FLSI and claims to be fastest of 20 loggers; MFP needs ~1.5× the actions. Self-reported. ([FLSI 2025](https://macrofactorapp.com/fastest-food-logger-2025/), [AI logging](https://macrofactor.com/ai-food-logging/)) | self-reported fastest |
| Cronometer | Manual search and select per item; reviewers report fatigue. Full-screen ads in the free tier interrupt logging. ([marlvel audit](https://marlvel.ai/intel-report/health-fitness/cronometer-calorie-counter)) | not found |
| Lose It! | Search, barcode, Snap It photo (Premium; accuracy called inconsistent). ([amyfoodjournal](https://amyfoodjournal.com/blog/lose-it-app-review)) | not found |
| **Training Log** | Set chips show every set. The ready set logs as shown in **one tap**, with Undo (`renderSetChips` 30776, `logSetChip` 30988, `commitSet` 30980). Rest timer auto-starts (29679, `startRestTimer` 29976), with optional notifications (29809–29900) and wake lock (30095). Food: USDA search (35129), free barcode (35155), Snap a Meal with multi-photo (8172, 42250), Describe It with voice (36554, 36597). | 1 tap for a set as suggested |

---

## 3. Progression logic

| App | Model | Evidence |
|---|---|---|
| Hevy (Trainer, Pro) | Rep-range double progression: all sets at the top of the range, then add load. Algorithmic, not AI. Without Trainer, routines only show last time. | [Hevy help](https://help.hevyapp.com/hc/en-us/articles/38385724273047-Hevy-Trainer-Explained-How-It-Builds-Your-Workout-Program), [Alpha Progression vs Hevy](https://alphaprogression.com/en/blog/alpha-progression-vs-hevy) |
| Strong | None. A logbook; reviewers position it as lacking progression and programming help. | [Brace review (Jun 2026)](https://brace-ai.pages.dev/reviews/strong/) |
| Fitbod | Per-muscle recovery plus generated workouts. Long-term users call progression "randomized" or "broken". | [SensAI Fitbod 2026](https://www.sensai.fit/blog/fitbod-review-2026), [Trustpilot](https://www.trustpilot.com/review/fitbod.me), [IndieHackers](https://www.indiehackers.com/post/fitbod-app-review-2026-honest-take-after-real-testing-45d5f07a1b) |
| Alpha Progression | Per-set weight and rep recommendations (Pro). Its most-praised feature. | [hotelgyms](https://www.hotelgyms.com/blog/alpha-progression-the-gym-logger-app-from-germany) |
| RP Hypertrophy | Mesocycles; weekly sets per muscle adjusted from pump, soreness, joint pain and workload. 45+ premade plans. Critics: "pump" is hard for beginners to judge, and no rest periods are prescribed. | [rpstrength](https://rpstrength.com/rphypeapp), [Dr. Muscle](https://dr-muscle.com/rp-hypertrophy-app-for-strength-training-expert-review/) |
| Juggernaut AI | RPE/RIR set ratings plus a daily readiness check adjust the plan. The autoregulation literature is modest, and no app's rules have been tested. | [SensAI compare](https://www.sensai.fit/blog/juggernaut-ai-vs-rp-hypertrophy-vs-alpha-progression-2026) |
| MacroFactor Workouts | Smart progression; widens rep ranges when optimal; reps-first or weight-first setting (Apr 2026). Strength-estimation and fatigue logic are being reworked. | [MacroFactor Apr 2026](https://macrofactor.com/mm-april-2026/) |
| **Training Log** | Free. Session to session: double progression with an RPE-based load from e1RM (`loadForRpeTarget` 27395, `estimated1RM` 27431). Signals in `analyzeProgressionSignal` (27477) include a deload after 3 sessions at RPE ≥ 9 with no progress. Set to set: `recommendNextSet` (30740), never up in a deload week. Planned deloads: `isDeloadWeek` 14915, `applyDeloadVolumeReduction` 26842, mesocycle tag 26741. | — |

---

## 4. What users praise and complain about

**Praise (recurring)**
- **Hevy:** easy, intuitive logging; consistency; a generous free tier. ([justuseapp](https://justuseapp.com/en/app/1458862350/hevy-gym-trainingstagebuch/reviews))
- **Strong:** quick set logging without extra taps; plate calculator; rest timer with notifications; mature Apple Watch app. (Reddit, second-hand via [setgraph](https://setgraph.app/ai-blog/best-workout-tracker-app-reddit); [Brace](https://brace-ai.pages.dev/reviews/strong/))
- **Alpha Progression and MacroFactor Workouts:** progression recommendations people "wouldn't have thought of". ([MacroFactor Apr 2026](https://macrofactor.com/mm-april-2026/))
- **MacroFactor:** removes TDEE guesswork; handles water retention and weekend swings. ([gainframe](https://gainframe.app/blog/macrofactor-review/), [V3 write-up](https://macrofactor.com/expenditure-v3/))
- **Athlytic:** "a better Whoop" on an Apple Watch that people already own. ([appshunter reviews](https://appshunter.io/ios/app/1543571755/reviews))
- **Bevel:** works with Apple Watch through Apple Health; useful sleep insights. ([justuseapp](https://justuseapp.com/en/app/6456176249/bevel-ai-health-coach/reviews))

**Complaints (recurring)**
- **Paywalls on basics:**
  - MyFitnessPal's barcode scanner is the most-cited feature in an Unstar sample: 27 of 300 reviews ([unstar](https://unstar.app/blog/is-myfitnesspal-premium-worth-it-paywall-app-reviews-2026), [kimola](https://kimola.com/reports/myfitnesspal-removes-free-barcode-scanner-feature-140890)).
  - MacroFactor has no free tier ([gainframe](https://gainframe.app/blog/macrofactor-review/)).
  - Hevy's free tier is tighter than its listing implies ([aitoolsbakery](https://aitoolsbakery.com/blog/hevy-review/)).
  - Oura's detail and history need a membership ([channelnews](https://channelnews.com.au/oura-quietly-files-for-ipo-as-users-revolt-over-subscription-costs-battery-failures-and-product-complaints/)).
- **Ads interrupting logging:** Cronometer's full-screen ads ([marlvel](https://marlvel.ai/intel-report/health-fitness/cronometer-calorie-counter)); Lose It!'s interstitials after saving a meal ([amyfoodjournal](https://amyfoodjournal.com/blog/lose-it-app-review)).
- **Generic or erratic progression:** Fitbod ([SensAI](https://www.sensai.fit/blog/fitbod-review-2026), [Trustpilot](https://www.trustpilot.com/review/fitbod.me)).
- **Recovery that ignores lifting:**
  - Athlytic's exertion targets "do not take into account muscle fatigue" ([appshunter](https://appshunter.io/ios/app/1543571755/reviews)).
  - WHOOP's Strength Trainer is called "death by a thousand UX paper cuts" and "still unusable" (Reddit, through a [sentinel snapshot](https://reddit.sentinel-team.org/posts/1pw0jmh/snapshots/2025-12-27T01%3A00%3A57.159564Z)). Forum reports say it "stops mid-workout" ([WHOOP community](https://www.community.whoop.com/c/product-feedback/15?page=1)).
- **Redesigns that bury logging:** MyFitnessPal's April 2026 redesign ([MyNetDiary](https://www.mynetdiary.com/diet-app-scorecard-may-2026.html)).
- **Social noise:** Hevy's feed can't be switched off ([aitoolsbakery](https://aitoolsbakery.com/blog/hevy-review/)).
- **Missing integrations:** Hevy has no Garmin support; WHOOP doesn't integrate with strength apps; Bevel users ask for watches beyond its current ones.
- **Migration friction:** CSV fidelity matters to people leaving Strong; this is second-hand ([setgraph](https://setgraph.app/ai-blog/hevy-vs-strong)).
- **Scope:** Redditors reportedly prefer separate apps for nutrition and lifting. This is second-hand and unverified ([setgraph](https://setgraph.app/ai-blog/best-workout-tracker-app-reddit)). It's a risk for an all-in-one app: each domain has to be as good as the specialist's.

---

## 5. Comparison: app × capability

Key: ✔ has it · ◐ partial or paid-only · ✘ missing · ? not verified.

| Capability | Hevy | Strong | Fitbod | Alpha P. | RP Hyp. | MacroFactor (+Workouts) | Cronometer | WHOOP / Athlytic | **Training Log** |
|---|---|---|---|---|---|---|---|---|---|
| 1-tap set from previous/plan | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | — | ◐ (WHOOP ST) | **✔** 30776 |
| Auto rest timer | ✔ | ✔ | ? | ? | ✘ (no rests prescribed) | ? | — | — | **✔** 29976 |
| Warm-up calculator | ◐ Pro | ? | ? | ? | ? | ? | — | — | **✔** 28099 |
| Plate calculator | ? | ✔ | ? | ? | ? | ? | — | — | **✔** ~31753 |
| Auto progression suggestions | ◐ Pro (Trainer) | ✘ | ✔ | ◐ Pro | ✔ | ✔ | — | — | **✔ free** 27477, 30740 |
| Feedback-driven weekly volume | ✘ | ✘ | ◐ (recovery model) | ? | ✔ | ? | — | — | **◐** sets counted 45482, no targets or feedback |
| Planned deload / mesocycles | ◐ | ✘ | ✘ | ✔ | ✔ | ? | — | — | **✔** 14915, 26842 |
| Program library | ✔ (Trainer) | templates | generated | ✔ | 45+ | ✔ | — | — | **✔** ~24 programs (9682) + custom (14745) |
| PRs and e1RM history | ✔ | ✔ | ✔ | ✔ | ? | ✔ | — | — | **✔** 41682, 27431 |
| Lock-screen / watch logging | ✔ Live Activity, Wear OS | ✔ Watch | ✔ | ? | ? | ◐ beta | — | ✔ band | **✘** (PWA) |
| Barcode (free) | — | — | — | — | — | ✔ (paid app) | ✔ | — | **✔** 35155 |
| AI photo meal logging | — | — | — | — | — | ◐ beta | ? | — | **✔** (own API key) 42250 |
| Recents / copy meal / saved meals | — | — | — | — | — | ✔ | ✔ | — | **✘** |
| Adaptive TDEE + trend weight | — | — | — | — | — | ✔ | ✘ | — | **✘** 32973, 40795 |
| Readiness score | — | — | ◐ | — | — | — | — | ✔ | **◐** 46843 (no HRV) |
| Wearable sync | ✔ | ✔ | ✔ | ? | ? | ✔ | ✔ | ✔ | **◐** manual CSV (6610–6615) |
| CSV import from other apps / export | ✔ (import from Strong, second-hand) | export ✔ (?) | ? | ? | ? | ? | ✔ export | ? | **◐** JSON backup only (34217) |
| No ads, no paywall | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | **✔** |

Cells marked "?" weren't confirmed by any source found this session.

---

## 6. Patterns

**Table stakes** (every top app has these):
- One-tap set logging pre-filled from last time.
- Auto rest timer.
- Exercise history and PRs.
- Templates or programs.
- Charts.
- On the nutrition side: barcode lookup and a big food database.

Training Log has all of these.

**Differentiators** (only the best do these):
- Feedback-driven volume (RP, Juggernaut).
- Per-set progression recommendations (Alpha Progression, MacroFactor Workouts).
- Adaptive expenditure with weekly check-ins (MacroFactor).
- Tap-count-optimised food logging (MacroFactor).
- Lock-screen and watch logging (Hevy, Strong, SmartGym).
- Recovery scores (WHOOP, Oura, Athlytic, Bevel).

**Unmet needs** (from the complaints above):
1. The basics behind paywalls and ads.
2. Progression that stays sensible over months, not just early on.
3. Recovery that understands lifting.
4. Logging speed that survives redesigns.
5. Getting your history in and out.
6. One place that connects training, food and recovery without each part being worse than the specialist app.

---

## 7. Training Log: has it, weaker or missing

| Feature | Status | Where, and how |
|---|---|---|
| One-tap set logging with Undo | **Has it** | Set chips: `renderSetChips` 30776, `logSetChip` 30988, `commitSet` 30980 |
| Auto rest timer, notifications, screen awake | **Has it** | 29679, `startRestTimer` 29976, notifications 29809–29900, wake lock 30095 |
| Warm-up ramp and plate math | **Has it** | `buildWarmupRamp` 28099, `BARBELL_EXERCISES` / plate calculator ~31753 |
| Progression engine (session and set) | **Has it** (free, which beats Hevy, Alpha Progression and RP on price) | `analyzeProgressionSignal` 27477, `loadForRpeTarget` 27395, `recommendNextSet` 30740 |
| Deloads and mesocycles | **Has it** | `getMesocycleWeek` 14904, `isDeloadWeek` 14915, `applyDeloadVolumeReduction` 26842, manual override 30183 |
| Exercise substitution | **Has it** | `suggestSubstitute` 43928 |
| Programs and recommendation | **Has it** | `programs` 9682 (~24 authored programs), custom programs 14745, `recommendProgram` 33662, program fit 27557, days-per-week 25952 |
| PRs, exercise history | **Has it** | `renderPrTimeline` 41682, `openExerciseHistory` 31422 |
| Weekly volume per muscle | **Weaker** | `renderVolumeTrend` 45482 counts sets and volume against last week. There are no per-muscle set targets or ranges, and no soreness, pump or joint feedback feeding back into the plan. |
| Gym mode / foldable layouts | **Has it** (unusual) | `enterGymMode` 31243 |
| Lock-screen / watch logging | **Missing** | A PWA can't add a Live Activity or watch app. The Capacitor effort is out of scope here (CLAUDE.md). |
| Food search, barcode, photo, describe | **Has it** | USDA 35129, Open Food Facts barcode 35155 (free, where MFP charges), Snap a Meal 42250 / 8172, Describe It + voice 36554 / 36597, dietary filters 36797 |
| Remaining-macro meal suggestions | **Has it** | `computeRemainingMacros` 37455, `buildMealSuggestions` 37468 |
| Recents, copy meal or day, saved meals | **Missing** | Only My Foods (custom or cached items, 35002–35023) |
| Calorie targets | **Weaker** | Static Mifflin–St Jeor × activity (`computeTargets` 32973) with a deficit guardrail (`computeDeficitGuardrail` 14446). Never re-estimated from intake against the weight trend. |
| Weight trend | **Weaker** | `renderSparkline` 40795 plots raw weigh-ins; pace is first-to-last over the range. No smoothed trend, so one water-heavy weigh-in swings it. Goal-date projection 34049 / ~40776. |
| Body fat, measurements, progress photos | **Has it** | `readBodyFat` 39208, `loadMeasurements` 39213, `computeMeasurementDeltas` 45976, photos 6549 / IndexedDB 8996 |
| Readiness | **Weaker** | `computeReadiness` 46843 uses sleep, weekly RPE, days since rest, pain and RHR. It ignores HRV even though HRV is imported (46959). It flags; it doesn't adjust the session. |
| Wearable data | **Weaker** | Manual CSV import (6610–6615, `parseHealthCsv` 47037). No automatic sync; a PWA can't read HealthKit. |
| Sleep, water, BP, glucose, cycle, supplements, pain/care | **Has it** (broader than any single competitor) | `loadSleep` 38617, `renderWater` 34583, `renderCycleTracking` 39139, `renderMySupplements` 35892, `renderCare` 44606 |
| AI coach and cross-metric insights | **Has it** (owner's own key) | `generateCrossMetricInsights` 42530, coach chat 42954, form-video frames 43459 (both "unverified live" per CLAUDE.md) |
| Streaks, weekly recap, heatmap | **Has it** | `computeStreak` 13989, `getWeeklyRecapInsight` 14595, `renderHistoryHeatmap` 39859 |
| Import from Strong or Hevy; CSV export | **Missing** | JSON backup and restore only (34217) |
| Social feed | **Missing, deliberately fine** | Hevy's social feed draws complaints, so not a gap worth chasing for a personal app. |
| Ads or paywall | **None** | A real positioning advantage against every app above. |

---

## 8. Evidence for each opportunity

1. **Adaptive expenditure and trend weight.**
   - MacroFactor estimates expenditure from intake and the trended rate of weight change, and recommends changes at a weekly check-in. It needs 2–3 weeks of data to settle; daily weigh-ins are preferred ([help 109](https://help.macrofactorapp.com/en/articles/109-how-frequently-do-i-need-to-log-my-weight-for-the-expenditure-algorithm-and-weekly-coaching-updates), [V3](https://macrofactor.com/expenditure-v3/), [philosophy](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)).
   - Its most-praised trait is removing TDEE guesswork. Its top complaint is having no free tier ([gainframe](https://gainframe.app/blog/macrofactor-review/)).
2. **Feedback-driven volume.**
   - RP adjusts weekly sets from pump, soreness, joint pain and workload, at $34.99/mo ([rpstrength](https://rpstrength.com/rphypeapp), [SensAI](https://www.sensai.fit/blog/juggernaut-ai-vs-rp-hypertrophy-vs-alpha-progression-2026)).
   - Critics say "pump" is hard for beginners to judge ([Dr. Muscle](https://dr-muscle.com/rp-hypertrophy-app-beginners/)).
   - Alpha Progression's recommendations are Pro-only ([appfollow](https://appfollow.io/android/alpha-progression-gym-tracker/com.alphaprogression.alphaprogression?country=in)).
3. **Readiness for lifters.**
   - Athlytic's targets ignore muscle fatigue ([appshunter](https://appshunter.io/ios/app/1543571755/reviews)).
   - WHOOP's Strength Trainer has UX complaints, and its Passive MSK load is unvalidated ([the5krunner, Feb 2026](https://the5krunner.com/2026/02/28/new-whoop-strength-trainer-update/)).
4. **Food logging speed.**
   - MacroFactor's FLSI tap counts (self-reported) ([FLSI](https://macrofactorapp.com/fastest-food-logger/)).
   - MyFitnessPal's paywalled barcode and its April 2026 redesign burying the diary ([MyNetDiary](https://www.mynetdiary.com/diet-app-scorecard-may-2026.html)).
   - Cronometer's manual search-and-select fatigue ([marlvel](https://marlvel.ai/intel-report/health-fitness/cronometer-calorie-counter)).
5. **Portability.**
   - Strong-to-Hevy migration threads (second-hand) ([setgraph](https://setgraph.app/ai-blog/hevy-vs-strong)).
   - Hevy's 150-set cap per workout, even on Pro ([SensAI](https://www.sensai.fit/blog/hevy-review-2026)): a reminder that limits annoy power users.

---

## 9. Plan of action

Ranked by expected impact for someone training 3–6 days a week. Each item ships as its own version with its own jsdom test, per CLAUDE.md.

| # | Improvement | Why it ranks here | How to do it better than the best app that has it |
|---|---|---|---|
| 1 | **Per-muscle weekly set targets, with a 10-second post-session check-in** (soreness, joint pain, "could you do more?") that nudges next week's sets ±1 per muscle within a range | Hits every session for a 3–6 day lifter. Turns `renderVolumeTrend` (45482) from a report into a plan. RP charges ~$35/mo for this. | **vs RP:** free; skip "pump" (critics say beginners can't judge it); use performance (reps at load, already in `analyzeProgressionSignal`) as the main signal and feedback as a modifier; show the reason in one line, as `recommendNextSet` already does; cap changes inside the program's own range. |
| 2 | **Trend weight (EMA) plus adaptive expenditure with a weekly check-in** | Pace and calorie targets are wrong for anyone whose TDEE differs from Mifflin × activity, and Training Log already collects both inputs. | **vs MacroFactor:** free; show the maths ("intake 2,410 avg, trend −0.4 lb/wk → expenditure ≈ 2,600"); fall back to `computeTargets` until 14 days of data; keep `computeDeficitGuardrail`; flag low-logging weeks rather than silently trusting them. |
| 3 | **Readiness v2: HRV against a personal baseline, plus recent training load and soreness** → an actual session adjustment (e.g. "cap RPE 8 today" or "drop the last set"), wired into the set suggestions | Fixes the top complaint about Athlytic and WHOOP (they ignore muscle fatigue), and uses data already imported (46959). | **vs WHOOP and Athlytic:** it knows the actual sets, RPE and soreness, not wrist motion; the suggestion lands in the set chips, not a separate score you have to interpret. |
| 4 | **Food logging speed: recents, "copy yesterday's breakfast", saved meals** | Daily, several times a day. MacroFactor's whole pitch is tap count. | **vs MacroFactor:** free with barcode and photo; publish our own tap counts for the common tasks in a test, so speed can't regress unnoticed. |
| 5 | **CSV import from Strong and Hevy; CSV export** | One-off, but it's what lets someone with years of history switch. | **vs Hevy:** map exercise names to our library with a review step for unmatched ones; keep PRs and e1RM history intact (`reconstructAllPRs` 41641); export in a Strong-compatible layout so leaving is easy too, which builds trust. |
| 6 | **Plateau playbook** (beyond the RPE ≥ 9 deload signal): after N stalled sessions, offer a rep-range shift, a substitution (`suggestSubstitute` 43928) or a micro-load | Long-term progression is Fitbod's main complaint. | **vs Fitbod and Alpha Progression:** explain the stall from the logs and offer a choice, not a silent change. |
| 7 | **Lock-screen presence** | Hevy and Strong users rate it highly. | Not achievable in the PWA. It belongs to the separate Capacitor track; flagged only, out of scope here. |

Deliberately not recommended:
- **A social feed:** a complaint at Hevy, and off-mission for a personal app.
- **Generated workouts in the Fitbod style:** progression complaints, and the owner's mission favours proven programs.

---

## 10. Couldn't verify

- **Store pages:** no live App Store or Play page was fetched. Every rating is a third-party or press snapshot, and counts vary 2–3× between sources (Hevy 35.8K–94K; JEFIT 43K–81K).
- **Missing ratings:** Liftin', Juggernaut AI and MacroFactor Workouts.
- **Reddit:** nothing was read first-hand. All Reddit sentiment comes through aggregators (setgraph, gummysearch, sentinel snapshots).
- **Tap counts:** MacroFactor's figures are self-reported; no independent counts were found for Hevy or Strong.
- **Product claims:**
  - Hevy importing from Strong is second-hand.
  - Strong's CSV export wasn't confirmed.
  - Whether Hevy has an Apple Watch app wasn't confirmed (only Wear OS appeared).
- **Prices:** these conflict between sources (Fitbod, Bevel, RP) and should be checked before being quoted.
- **Training Log:** "missing" verdicts come from greps of `index.html` v3.514 (e.g. no recents, copy-meal or CSV export found). A feature named differently could have been missed.
