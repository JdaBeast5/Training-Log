# Business: strategy, model, funnel, and what blocks success

Owner: business-manager. Written 2026-11-07 against **v3.514** (`APP_VERSION`, `index.html:7622`). Line numbers are `index.html` at v3.514 unless a file is named. Inputs: `CLAUDE.md`, `HANDOFF-v59.md` (Addenda 39–41), every file in `planning/`, a first-launch walk in Playwright, and the web sources linked inline.

**Mandate (owner):** make Training Log the most successful exercise-tracking and workout app in the world. "Anything he sees that needs fixing and optimizing, goes."

**What "successful" can honestly mean today.** Training Log is a personal PWA with one known user, no accounts, no server, no analytics and no store listing. Nothing in this file assumes users, revenue or growth that don't exist. Every market number carries its source. Where a number couldn't be checked, it says so.

---

## 0. The short version

1. **The product is already ahead on the hard part.** It has free progression, deloads, warm-ups, plate math, free barcode lookup and no ads (research §5, §7). On price and breadth it beats every app in the comparison table.
2. **It is not yet a product anyone else can find, start or trust with years of data.** The five blockers, in order:
   1. No go-to-market at all: a generic name, an empty README, no page metadata, no store listing, and a manifest whose claims are out of date.
   2. First launch hands a stranger somebody else's workout and somebody else's calorie target.
   3. All data lives in one browser. The first backup nudge waits 10 sessions, and Safari ignores the persistence request.
   4. The AI features are wired into the most visible places, but they need the user's own Anthropic key, so for almost every stranger they are dead ends.
   5. There's no way to measure activation or retention, and nothing a user shares links back to the app.
3. **Recommended model:** a free core forever with no ads. Pay only for things that cost money to run (hosted AI, sync), and decide that only after the store launch shows retention. Details in §3.
4. **North star:** *weekly active trainers*, meaning people who log at least 2 training sessions in a calendar week (§4).

---

## 1. Target users and the job they hire the app for

| Segment | Who | The job | Why Training Log fits | Evidence |
|---|---|---|---|---|
| **Primary: the self-coached lifter** | Trains 3–6 days a week with free weights, follows or wants a proven program, and is tired of paying for basics | "Tell me what to lift today and whether to add weight, and make logging it take one tap." | One-tap set chips (`renderSetChips` 30776), free double progression with RPE (`analyzeProgressionSignal` 27477), deloads (`isDeloadWeek` 14915), and about 25 authored programs | Paywalled progression at Hevy Trainer, Alpha Progression and RP (research §3); paywall complaints (research §4) |
| **Secondary: the lifter who also eats to a target** | Logs food daily during a cut or lean bulk | "Keep my training and my calories in one place, and tell me if the calorie target is right." | Free barcode (35155), photo and describe logging, macro targets; trend weight and adaptive TDEE are planned (BL-16, BL-17, BL-27) | MacroFactor has no free tier (research §4). Redditors reportedly prefer separate apps (second-hand, research §4), so each half must be as good as the specialist |
| **Tertiary: the careful trainee** | Rehab, prenatal or postpartum, hypertension, seniors | "Train safely around my condition." | Medical styles and care tracking (`MEDICAL_STYLES` 11352, `renderCare` 44606) | No competitor programs clinical populations (roadmap theme 1). **This is also the biggest liability risk for a public launch** (§5, blocker 6) |

**Not the target:** people who want social feeds (Hevy's feed draws complaints; research §4), and people who want a generated workout every day (Fitbod's progression complaints; research §3).

**The one-sentence promise** (for the first screen, the store and the README, and testable against the code):
> "Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone."

Every clause is true at v3.514. The privacy clause is "your **logs** stay on your phone", not "nothing leaves your phone": food search goes to USDA and Open Food Facts, and the AI features go to Anthropic with the user's key (6630).

---

## 2. Positioning against the five named competitors

| | Strong | Hevy | Fitbod | MacroFactor (+Workouts) | WHOOP | **Training Log** |
|---|---|---|---|---|---|---|
| What they sell | A fast, plain logbook | Logbook + social + Trainer (Pro) | AI-generated workouts | Adaptive nutrition; a new workout logger (Jan 2026) | Recovery wearable | Proven programs + progression + food + recovery, free |
| Price (as reported) | Pro $29.99/yr | Pro $2.99/mo, $23.99/yr, $74.99 lifetime | $15.99/mo or $95.99/yr | $11.99/mo, $71.99/yr; no free tier | Membership | **Free, no ads** |
| Their weak spot | No progression help (research §3) | Free tier tighter than it looks; feed can't be turned off | Progression called "randomized" | Paid only | Strength Trainer UX complaints; ignores muscle fatigue | No store presence; one-device data; AI needs your own key |
| How we win | Same 1-tap speed, plus programs and progression | The free tier is the whole app | Proven, cited programs instead of generated ones | Free trend weight + adaptive TDEE with the maths shown (BL-16/17/27) | Readiness from the sets you actually did, plus HRV (BL-21) | — |

Prices are from `planning/research.md` §1 (dated snapshots, third-party sources). Re-check them before quoting any of them publicly.

**Positioning statement:** *the free, private training app that coaches you like the paid ones.* Against Strong and Hevy we compete on coaching, against Fitbod on proven programs, against MacroFactor on price, and against WHOOP on knowing the lifting. We do **not** compete on social, wearables or watch logging until the Capacitor track exists.

**Differentiators to protect** (don't trade these away for growth):
- No ads, and no paywall on anything that costs nothing to run.
- One-tap set logging, with tap counts enforced in tests (roadmap theme 5).
- Every program rule cited and unit-tested (`content-citations.js`, program audit).
- No account needed to start.

---

## 3. Business model options

| Model | Fits the architecture? | Evidence | Verdict |
|---|---|---|---|
| **Free, no ads (today)** | Yes | Paywalls and ads on basics are the most-cited complaints across MyFitnessPal, Cronometer and Lose It! (research §4) | **Keep it for the core. It's the positioning.** |
| **Ads** | Yes | Full-screen ads interrupting logging are a recurring complaint (Cronometer, Lose It!; research §4) | **Reject.** It would destroy the main advantage |
| **One-time purchase / "supporter" unlock** | Only through a store (the Capacitor track) | Hevy sells a $74.99 lifetime option (research §1) | Possible later, for cosmetic or convenience extras only. Needs the owner (store accounts, money) |
| **Freemium subscription** | Needs accounts and store billing | Health and fitness apps reportedly convert a median 39.9% of trials to paid, and roughly 2× better on iOS than Android (RevenueCat 2025 via [Athletech News](https://athletechnews.com/fitness-apps-monetizable-winner-take-all-or-most/); primary report at [revenuecat.com](https://revenuecat.com/state-of-subscription-apps-2025) not opened; secondary figures conflict). About two-thirds of category subscribers reportedly pick annual plans (secondary, unverified) | Only for things with a running cost: **hosted AI** (no own key) and **sync/backup**. Never for logging, programs or progression |
| **Bring your own key (today, for AI)** | Yes | — | Fine for the owner and power users. For strangers it's a dead end (blocker 4) |

**Recommendation (needs the owner, BIZ-11):** stay free with no ads. Ship to the stores through the Capacitor effort first. Measure retention through the store consoles. Only then consider an optional paid tier ("Training Log Plus": hosted AI with no key, plus encrypted backup), priced under MacroFactor's $71.99/yr. Don't build any billing until real users exist.

---

## 4. North-star metric and the funnel

**North star: weekly active trainers (WAT).** The number of people who log at least 2 training sessions in a calendar week. Why this one:
- It measures the job (training on a plan), not app opens.
- It moves with every theme on the roadmap: progression, speed, safety and food logging all keep people training.
- "At least 2" matches the ACSM minimum frequency the program audit uses ([ACSM26] in `planning/program-audit.md`).

**Funnel, with the in-app event that defines each step** (all events already exist as stored data; nothing new is collected):

| Stage | Definition | Existing signal in the code | Category benchmark |
|---|---|---|---|
| Acquisition | Installs or first opens | None (no analytics); store consoles after Capacitor | — |
| Activation | First set logged within the first session | `has-logged-first-set` milestone (`markMilestone`, ~33865) | — |
| Day-1 retention | Any log on the day after first open | `activity-dates` | 27% on day 1 for health and fitness (Adjust, via [Business of Apps](https://businessofapps.com/data/health-fitness-app-benchmarks)) |
| Day-7 retention | A log 7 days on | `activity-dates` | 13% (Adjust, secondary summary) |
| Day-30 retention | A log 30 days on | `activity-dates` | Between 3% (AppsFlyer 2023) and 8% (Adjust), both via [Business of Apps](https://businessofapps.com/data/health-fitness-app-benchmarks). One vendor says no public benchmark can be verified ([UXCam](https://uxcam.com/blog/mobile-app-retention-benchmarks)) |
| Referral | A share that brings someone in | Share cards exist (`shareCelebrationCard`, ~29610) but carry no link | — |

**What to target:** beat the category's day-30 figure by a wide margin, because the app is used on a schedule (training days), not on a whim. No target number is set here, because we have no cohort data. The first real numbers will come from the Play Console and App Store Connect once the Capacitor build ships; they report installs and retention without any in-app analytics.

**Measurement without breaking the privacy promise:** don't add third-party analytics. Use the store consoles. The one ready item here (BIZ-09) is an on-device "Your first month" view built from data that's already stored, so the owner can see his own funnel and nothing leaves the phone.

---

## 5. What blocks success, ranked by impact

Impact = how much it limits weekly active trainers once the app is public. Each blocker points to backlog items.

### 1. Nobody can find it, and what they'd find over-claims (distribution)
- **Evidence:**
  - `README.md` is one line: `# Training-Log`. The public repo is the only landing page.
  - `index.html` has a `<title>` but no `<meta name="description">` and no Open Graph tags (head, lines 4–27). A shared link previews blank.
  - `manifest.json` says "22 training programs … and AI coaching". The code has **25** keys in `programs` (counted in the live page). AI coaching needs the user's own paid key.
  - "Training Log" is a generic, descriptive name, which is hard to own in store search. Brand belongs to the marketing-manager; it's flagged here only because it gates the store launch.
  - Lock-screen and watch logging can't exist in a PWA (research §7). The Capacitor effort owns that.
- **Items:** BIZ-07 (truthful metadata and README), BIZ-10 (install hint), BIZ-12 (go public: where and under what name).

### 2. First launch gives a stranger someone else's plan (activation)
Walked in Playwright at 402×874 in a fresh context (scripts in the session scratchpad):
- **The first screen** is "Who's training? Create a new profile", with no line on what the app is or why it's worth a name (`userPickerOverlay` 5701).
- **The name is asked twice.** After creating the profile "Alex", the header still says "Set up your profile below to personalize this" (`renderHeader` 33790), and the Getting Started step "Set up your profile" stays unticked. The picker name goes into the user list (`createNewUser` 9629), not into `userProfile.name`, which the checklist reads (33895).
- **The first workout isn't theirs.** With no goal, experience or days asked, Today opens "Upper · Strength, Week 1 of 5 · Accumulation, ~63 min, 0/26 sets", starting with Bench Press 4×4-6 (`activeProgram = 'strength'`, 13053). A beginner with three free evenings gets a 26-set strength day on a 7-day strip.
- **The first set has no starting point.** The set sheet opens with empty lb and reps fields and no hint for a first-time load. After one entry, one-tap works well: 95×6 logged, the next chip offered 100×4 with Undo.
- **The calorie target is a placeholder shown as fact.** The Log tab says "2169 cal left of 2169" before any height, weight or age has been entered. That's the default profile (30 years, 5'8", 160 lb; `userProfile` 32397) run through `computeTargets` (32973), and nothing says it's an estimate.
- **Analysis after one session** leads with "AI Cross-Metric Insights: Generate insights", which needs an API key, while Training Trends sits collapsed below it.
- **The good news:** no console errors, a 347 ms load on localhost, no external requests on first launch, and one-tap logging after the first set.
- **Items:** BIZ-01 (3-question quick start), BIZ-02 (one name, asked once), BIZ-03 (an honest placeholder target), BIZ-05 (first-set load hint), BIZ-17 (the first screen says what the app is).

### 3. One lost phone loses everything (data trust)
- **Evidence:**
  - The code says it plainly: "Everything this app knows lives in one browser's localStorage on one device. There is no sync, no server and no second copy" (14310).
  - The first backup reminder waits for 10 logged sessions (`BACKUP_NUDGE_FIRST`, 14320).
  - `navigator.storage.persist()` is requested at startup (14301), but the comment notes Safari treats it as a no-op. Playwright reported `persisted() === false` on first launch.
  - Safari's 7-day cap on script-writable storage applies to Safari tabs. Apple has said home-screen web apps keep their own days-of-use counter ([Search Engine Land](https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519), [WebKit bug 237350](https://bugs.webkit.org/show_bug.cgi?id=237350)). These are secondary sources, so treat it as unconfirmed. It does mean that **someone who uses the app in a Safari tab and never installs it is the most at risk**.
- **Why it matters for the business:** a lifter's history is the switching cost. Losing it once ends the relationship, and it's exactly what reviewers cite about leaving Strong (CSV fidelity, research §4).
- **Items:** BIZ-04 (earlier first backup, after 3 sessions), BIZ-10 (install hint), BL-22 (CSV export, already ready), BL-29 (import, needs-owner; recommend yes), BIZ-13 (sync, needs-owner).

### 4. The AI features are a dead end for strangers (value promise)
- **Evidence:**
  - The coach button floats on every screen (`coachFab` 7458).
  - The first Analysis card is AI.
  - Photo and Describe sit among the first five food buttons.
  - Every one of these needs an Anthropic key, which costs money on the user's own account (6630).
  - Two AI paths are still "unverified live" (CLAUDE.md fragile areas).
  - The manifest sells "AI coaching" as a headline.
- **Effect:** the most prominent entry points fail for almost every new user, and the core value (programs, progression, one-tap logging) is pushed down the page.
- **Items:** BIZ-06 (AI entry points say what they need before the tap), BIZ-07 (stop leading with AI in metadata), BIZ-14 (hosted AI, needs-owner; recommend not yet).

### 5. No measurement and no sharing loop (growth)
- **Evidence:**
  - No analytics, by design.
  - The share card is a 1080-wide PNG that ends with the text "TRAINING LOG" (`buildShareCardBlob` 29510) and carries no link. The share text has no URL either (~29620).
- **Items:** BIZ-08 (the share card carries the app's address), BIZ-09 (on-device first-month view), BIZ-12 (store consoles once public).
- **Overlap:** the marketing-manager owns share moments. BIZ-08 is limited to adding the link and changes no visuals.

### 6. Health-claim and liability exposure in clinical programs (legal, before going public)
- **Evidence:** program audit SAF-1 and SAF-2 show goal volume and RPE caps reaching rehab, prenatal and hypertension plans. They're fixed by BL-01 and BL-02 (ready). The app also cites a named author for cycle advice (6575).
- **Why it matters:** for a personal app this is a safety issue. In a public store listing it's also a health-claim and liability issue.
- **Items:** BL-01 to BL-06 first (already ranked first). BIZ-15 (needs-owner): a clinical-content review and disclaimer before any public listing.

### 7. Breadth over depth (focus)
- **Evidence:**
  - 25 programs, plus food, sleep, water, BP, glucose, cycle, supplements, care, AI coach and form video.
  - Research §4 (second-hand): people prefer separate specialist apps.
  - The owner himself said "I've lost sight of the original mission" (HANDOFF-v59 Addendum 41).
- **Recommendation:** the business case agrees with the roadmap's order. Lifting first, food second, everything else stays but isn't promoted. No new verticals until weekly active trainers can be measured. This is a priority call for the project-manager, not a backlog item.

---

## 6. Distribution plan

Do these in order. Each step depends on the one before.

1. **Make the web build presentable (ready now):**
   - BIZ-07: truthful metadata, OG tags and README.
   - BIZ-10: install hint.
   - BIZ-01 to BIZ-03: first launch.
   - Cost: zero.
2. **Store listings through the Capacitor track** (owned elsewhere; plan around it only):
   - Google Play and the App Store need a privacy policy, a support contact and developer accounts ($25 one-time for Play, $99/yr for Apple, per their public developer pages; check before paying). These need the owner (BIZ-12, BIZ-16).
   - Store presence also brings what a PWA can't have: lock-screen logging, Health Connect and HealthKit sync (roadmap theme 7, research §7).
3. **Search:**
   - One plain landing page (GitHub Pages already serves the app).
   - Target the switching intents: "Strong alternative free", "Hevy free alternative", "free workout app no ads". These are proposed queries, not measured volumes.
   - The marketing-manager owns copy and brand.
4. **Communities and creators:**
   - Lifters' communities reward free and no-ads (research §4 complaints). Lead with the import (BL-29) and the free progression engine.
   - No paid creators until retention is known (it would cost money, so it needs the owner).
5. **Built-in referral:**
   - BIZ-08 puts the address on every share card.
   - CSV export (BL-22) in a Strong-compatible layout signals "you can leave any time", which builds trust (research §9 item 5).

---

## 7. Business priorities for the roadmap (summary)

The full text is in `planning/roadmap.md` → "Business priorities".
1. Keep safety first (BL-01 to BL-06). It's also the legal prerequisite for going public.
2. Pull the first-launch items (BIZ-01 to BIZ-03, BIZ-05) ahead of the bar-raisers (BL-16 onward). Activation multiplies everything else.
3. Pull data trust forward: BIZ-04 and BL-22, and approve BL-29.
4. BIZ-06, BIZ-07, BIZ-09, BIZ-10 and BIZ-17 are small and ready; slot them between larger items.
5. Owner decisions in this order: BIZ-12 (go public?), BIZ-16 (privacy policy), BIZ-15 (clinical review), BIZ-11 (model), BIZ-13 (sync), BIZ-14 (hosted AI).

---

## 8. Couldn't verify

- **Retention benchmarks:** secondary summaries of AppsFlyer and Adjust. No primary report was opened.
- **RevenueCat 2025 trial-to-paid median (39.9%):** from Athletech News coverage. The primary page wasn't opened, and other sources disagree (35%, 62%).
- **Safari home-screen exemption from the 7-day cap:** from secondary reporting and a WebKit bug thread. The WebKit blog post itself wasn't found.
- **Store fees:** stated from general knowledge of the public developer programs. Check them before the owner pays.
- **Competitor prices:** these are `planning/research.md` snapshots, and several conflict between sources.
- **Playwright walk:** Chromium at 402×874, not iOS Safari. Install, persistence and share-sheet behaviour on an iPhone are unverified.
