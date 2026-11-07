# Business: strategy, model, funnel, and what blocks success

Owner: business-manager. Written 2026-11-07 against **v3.514** (`APP_VERSION`, `index.html:7622`). Line numbers are `index.html` at v3.514 unless a file is named. **Revised 2026-11-07 against v3.516** (`APP_VERSION`, `index.html:7618`) for the pre-D1 alignment round: the app is now **Liftnext** (display name only; storage keys unchanged), and the owner approved the three-layer money model ("Love it"), so §3 now covers the coach plan and coach programs (§3.8, BIZ-23, BIZ-24). "Training Log" below means the same app under its old name. Inputs: `CLAUDE.md`, `HANDOFF-v59.md` (Addenda 39–41), every file in `planning/`, a first-launch walk in Playwright, and the web sources linked inline.

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
3. **Model (owner-approved 2026-11-07: three layers, "Love it").**
   1. **Free forever on the phone:** everything we build that runs on the device, with no ads and no quotas, including every built-in program.
   2. **Liftnext Pro, later:** a subscription only for new things that run on our servers (hosted AI, cloud sync). Early users get a founding price. The switch-on is triggered by metrics, not a date, and Play billing comes first.
   3. **Revenue that never touches the free app:** a coach plan where the coach pays and the clients stay free (BIZ-23), and paid programs written by real coaches with a revenue share (BIZ-24). The built-in programs stay free.

   Details in §3; the coach layer is §3.8.
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

## 3. Business model: free at launch, a subscription later

**Owner's decision (2026-11-07, `pitch.md` → "Owner's answers"):** "income will eventually be the goal, but we can start with free and then go to subscription down the line." The owner asked "what do you guys think?" This section is the answer, and the rules that make the plan work. It replaces the earlier "free core, decide later" table. Revised 2026-11-07 against v3.515.

### 3.1 Verdict: sound, if the line is drawn now

**The plan is sound,** for four reasons:
- **Free is the wedge.** The paid apps charge for progression and limit history (research §1, §3), and MyFitnessPal's paywalled barcode is still the most-cited single feature in its negative reviews (research §1, third-party). "The free tier is the whole app" is our positioning (§2).
- **Free costs us almost nothing.** There's no server. The only fixed costs are store developer accounts: $25 once for Play and $99 a year for Apple (consistent across secondary sources, e.g. [playcode.io](https://playcode.io/blog/how-much-does-it-cost-to-publish-an-app); confirm on the stores' own pages before paying).
- **The things worth paying for need a server anyway.** Hosted AI (no key needed) and cloud sync are the only features with a real running cost, and neither exists yet. So nothing could be sold today even if we wanted to. The subscription arrives with the server, and not before.
- **Users get to judge the product before it asks for money.** That is how we earn the trust that a subscription later depends on.

**It works only on one condition:** the free/paid line is fixed now, written down publicly at launch, and the subscription only ever holds **new things that run on our servers**. Nothing a free user has ever had moves behind it.

**What to expect, honestly:**
- With no accounts and no analytics, we will know little about who uses the app. The only channel to every user is the app itself (What's New). The switch-on has to be announced there.
- The subscription will pay for running costs first. Whether it becomes real income depends on retention and scale we can't measure yet. No revenue forecast appears here, because there is no data to base one on.

### 3.2 The ways this usually goes wrong

1. **Taking back or paywalling what free users already have.** This is the big one. People judge the change against what they had yesterday, not against the market price.
   - **MyFitnessPal, 2022:** announced in August that barcode scanning would need Premium from 1 October 2022 ([Droid-Life](https://www.droid-life.com/2022/08/24/myfitnesspal-puts-barcode-scanner-behind-premium-paywall/), [Digital Trends](https://digitaltrends.com/phones/myfitnesspal-barcode-scanning-not-free-premium-subscription), [The Verge via Slashdot](https://news.slashdot.org/story/22/08/25/1955238/myfitnesspal-paywalls-barcode-scanner-that-made-counting-calories-easy)). Four years on, a 2026 review analysis still found the barcode scanner the single most-named feature in its negative reviews ([unstar](https://unstar.app/blog/is-myfitnesspal-premium-worth-it-paywall-app-reviews-2026); a third-party blog).
   - **Strava, 18 May 2020:** free users lost segment leaderboards beyond the top 10, and creating or editing routes moved to the subscription ([DC Rainmaker](https://dcrainmaker.com/2020/05/strava-leaderboard-reduces.html), [BikeRadar](https://www.bikeradar.com/news/strava-leaderboards-routes-subscription/), [Cyclingnews](https://www.cyclingnews.com/news/stravas-latest-update-makes-leaderboards-a-paid-for-feature)).
   - **Our guard:** the free list in §3.3 is frozen. Nothing on it ever moves. Bring-your-own-key AI stays free after hosted AI exists.
2. **Shrinking the free tier by quota instead of removal.** Limits on routines, custom exercises or months of history are the same clawback in disguise. Hevy's free tier allows 4 routines, 7 custom exercises and 3 months of stats; Strong's allows 3 templates (research §1, third-party sources). That works for them because they started that way. For us, adding a quota later would be taking something away.
   - **Our guard:** no counts or time limits on anything on the free list, ever. A weak paid tier is not a reason to squeeze the free one; make the paid thing better instead.
3. **Promises the running costs can't carry, or new terms for existing customers.**
   - A "lifetime" plan for hosted AI is an open-ended cost: every lifetime buyer keeps costing money each month.
   - **Oura, 2021:** the Gen3 ring came with a paid membership, and lifetime membership went only to existing owners who upgraded at launch ([Engadget](https://www.engadget.com/oura-ring-version-3-150032257.html), [Android Authority](https://androidauthority.com/oura-ring-3-3039812)). Users on forums called the switch "jarring" ([TrainerRoad forum](https://www.trainerroad.com/forum/t/oura-ring-any-users/13744/68); anecdotal).
   - **The better pattern:** when Fitbod raised its price in 2026, existing subscribers reportedly kept their old $12.99/mo or $79.99/yr ([SensAI](https://www.sensai.fit/blog/fitbod-review-2026); a competitor's blog, so unverified). That is grandfathering, and our founding promise (§3.4) is built on it.
   - **Our guard:** no lifetime plan on anything with a per-use cost. Price changes never apply to people already subscribed.

### 3.3 The line, decided now

**The rule in one sentence (revised for the three layers):** *everything we build that runs on your phone is free forever; only things that run on our servers can be in Liftnext Pro; and the only other things anyone pays for are a coach's own work: a coach's client plan (the coach pays) or a program a coach wrote and sells.* No ads, ever, on any layer. No selling or sharing of data, ever.

**Why the sentence changed.** The earlier wording ("if it runs on your phone, it's free forever") would have made a paid coach program a broken promise, because a program runs on the phone. It was never published (BIZ-18 is still needs-owner), so fixing it now costs nothing. After launch it would have been a clawback.

**What "free forever" promises, and what it doesn't.** It is a promise about **price**: nothing on this list will ever cost money or sit behind a lock, a quota or a "Pro" label. It is not a promise that every feature stays exactly as it is. We may still fix or retire something for safety or correctness (for example BL-35 replaces Neck Bridges, and BIZ-15's review may change clinical content), but anything retired is never brought back as a paid feature. The public wording in §3.4 says this in one clause, so a later safety fix can't be read as a clawback.

**Free forever** (it runs on the device and costs nothing to run):

| Area | What's included |
|---|---|
| Logging | Workouts, one-tap sets, the rest timer, plate math and warm-ups |
| Programs | Every built-in program, today's 25 and any we add later. Your own custom programs, and sharing them as links (MKT-10). Progression, deloads, RPE and RIR targets, and substitutions, which also apply to any coach program you add |
| History and analysis | Full history with no time limit, PRs, e1RM, every chart and Analysis card computed on the device, Year in Lifting, "Your number" (MKT-06, MKT-17) |
| Food | Search (USDA and Open Food Facts), barcode lookup, macro targets, trend weight and adaptive expenditure when they ship (BL-16, BL-17, BL-27) |
| Health tracking | Sleep, water, blood pressure, glucose, cycle, supplements and care tracking, and the clinical programs |
| Your data | JSON backup and restore, CSV export (BL-22), Strong and Hevy import (BL-29), and backup to your own iCloud or Drive through the share sheet (BIZ-13) |
| Sharing | Share cards, program links and challenges (MKT-10, MKT-11) |
| AI with your own key | You pay Anthropic directly, so it costs us nothing. It stays after hosted AI exists, and it's the escape valve for heavy AI users |

**No quotas** on routines, custom exercises, programs or history length.

**Liftnext Pro candidates** (only once built, and only new things):
- **Hosted AI coaching**, with no key needed. Every request costs money. This is the first candidate, because BYO-key AI is the biggest dead end for new users today (§5.4).
- **Cloud sync and automatic encrypted backup** on a server we run, across devices.

**Outside Pro, paid by someone other than the ordinary user** (§3.8): the coach plan (BIZ-23) and coach-written programs (BIZ-24).

**"Advanced analytics": our honest view is to keep it free.** If a chart is computed on the phone, it costs nothing to run, and the paid apps' history limits are exactly the complaint we win on. The one exception is analysis that needs hosted AI (for example an AI monthly review), which belongs with hosted AI.

**Rejected:**
- ads;
- selling or sharing data;
- paywalling anything on the free list;
- cosmetic unlocks (they blur the one-sentence rule);
- lifetime plans on hosted AI;
- selling programs we wrote ourselves, or moving a built-in program into the coach store.

### 3.4 The founding-member promise

**Who:** everyone who logs a training session before the subscription is announced.

**What they get:**
1. Everything on the free list, forever. That's true for everyone, but it's stated in the promise anyway.
2. **A founding price on the subscription, locked for as long as they stay subscribed.** The recommendation is half the list price. That's our proposal for the owner, not a market figure.
3. No pressure: nobody is subscribed automatically. If the store build offers a trial, the screen states the price and the day it converts, in the same size as the offer.

**What they don't get:** a lifetime plan on hosted AI (§3.2, item 3). The founding price applies to Liftnext Pro only. Coach programs are priced by the coach who wrote them, and the coach plan is a business purchase (§3.8).

**Proof without accounts:** the earliest logged set in the device's own log (`readExCorpus` over the `ex:` keys, `index.html` 41021).
- Not `activity-dates`, which prunes after 730 days (`ACTIVITY_DATES_RETENTION_DAYS`, 13913).
- The proof travels with the JSON backup, so it survives a new phone.
- It can be faked by editing data. We accept that: being generous to the odd cheater costs little.
- At switch-on the app reads the date locally and applies the offer through the store's own offer mechanism (Apple and Google both have discount offers; the details aren't verified here).
- BIZ-19 (ready) shows "Training since" from the same data now, so the date is visible long before it matters.

**When to announce:**
- **At public launch (Phase 5)**, in general terms, alongside the free list: in the README, the landing page (MKT-14), the store listing, the privacy page (BIZ-16) and an in-app "What's free" note (BIZ-18). The wording (revised 2026-11-07 for the name and the three layers; BIZ-18 must use this text, not its older Chalklog draft): "Everything Liftnext does on your phone is free, forever, with no ads, including every program that comes with the app. We may fix or retire a feature for safety, but we will never put it behind a payment. If we ever add a paid plan, it will only cover things that run on our servers, like AI without your own key or cloud sync, and anyone who trained with Liftnext before then gets a founding price for as long as they stay subscribed. Coaches may one day pay to manage clients or sell programs they wrote; their clients and everyone else keep everything above for free."
- **Why then:** the promise has to exist before anyone could be affected, so it can never look retroactive. It also rewards the people who take a chance on a new app.
- **The price and the date:** in What's New and on the landing page **at least 30 days before billing starts.** That's our own notice rule, not an industry figure.

### 3.5 Trigger metrics for switching the subscription on

**No calendar date.** The subscription switches on only when **all** of these hold. The owner checks them monthly, from the store consoles, BIZ-09 tester reports and measured costs.

| # | Trigger | How it's measured | Threshold (our proposal) |
|---|---|---|---|
| T1 | **Retention is proven** | Play Console retention for new-install cohorts | Day-30 retention at least **twice** the category's upper published figure (8%, Adjust via [Business of Apps](https://businessofapps.com/data/health-fitness-app-benchmarks), secondary), so 16% or more, for **3 monthly cohorts in a row** |
| T2 | **There's enough scale to fund a server** | Console active users × a conservative paying share × net price, against the measured monthly server and AI cost | It covers the running cost with margin. The owner sets the paying-share assumption. Plan on a low single-digit percentage: that's an assumption, not a benchmark |
| T3 | **People ask for it unprompted** | Store reviews, support email and GitHub issues asking for sync or for AI without a key | A recurring request, month after month, with a count recorded each month |
| T4 | **The paid thing exists and is good** | Hosted AI or sync is built, beta-tested free with founding members, its cost per active user measured, and the privacy page updated | All four done |
| T5 | **The free core is finished** | Phases 0–2 of the roadmap shipped, and nothing on the free list needed to move | Yes |
| T6 | **The payment path works** | §3.6 is in place and tested in the store's sandbox | Yes |

**Not triggers:** a date, needing money, or a competitor raising prices. These replace the earlier rule "no billing code until 90 days of retention data" (summit R3). T1 is stricter and says what the data has to show.

### 3.6 The technical constraint, plainly

**Today:** no server, no accounts, one file. That's no obstacle to being free. It's the whole obstacle to charging.

**The key point:** everything we'd charge for (hosted AI, sync) needs a server anyway, and the payment check lives on that same server. The subscription can't arrive before a server does. The server is itself an owner decision, because data leaves the phone for people who opt in (BIZ-13, BIZ-14). The PWA stays free, complete and serverless for everyone who doesn't.

| Path | What it needs | Fees (level, as verified) | Who it reaches |
|---|---|---|---|
| **A. Store billing in the native app** | The Capacitor build with Play Billing (and Apple in-app purchase if an iOS build ever exists). **The Capacitor effort owns that, and this team only records the dependency.** Plus our server to verify purchases and unlock the server features, and the developer accounts | **Google Play:** 15% on auto-renewing subscriptions ([Google help page](https://support.google.com/googleplay/android-developer/answer/112622), via search; the page wouldn't load from this session). After the Epic settlement, a US, UK and EEA rate of 10% service plus 5% billing is reported from 30 June 2026 ([TechCrunch](https://techcrunch.com/2026/03/04/google-settles-with-epic-games-drops-its-play-store-commissions-to-20/), [Adapty](https://adapty.io/blog/google-play-billing-changes-subscriptions-fees)); **unverified**, and dates differ between reports. **Apple:** 15% under the Small Business Program (under $1M a year); otherwise 30% in a subscriber's first year and 15% after ([MacRumors](https://www.macrumors.com/2020/11/18/apple-drops-app-store-fees/), [RevenueCat](https://revenuecat.com/blog/engineering/small-business-program)); check Apple's current terms | Android users of the store build. iPhone users only if an iOS store build exists; today the owner's own iPhone runs the PWA |
| **B. Web payments** | A card processor, accounts (email sign-in), our server with a licence check, and sales-tax and VAT handling (merchant-of-record services exist; their fees aren't verified here) | Stripe's US card rate is 2.9% + 30¢ ([NerdWallet](https://www.nerdwallet.com/business/software/learn/stripe-fees), secondary; Stripe's page wasn't opened) | PWA users, including iPhone home-screen users, with no store needed. **But** an iOS store app that unlocks features bought on the web risks rejection under App Review guideline 3.1.1 unless in-app purchase is offered too (developer reports on [Apple's forums](https://developer.apple.com/forums/thread/828238); the guideline text wasn't opened). In the US, the rules on linking out are still in court: the April 2025 order in Epic v. Apple ([MacRumors](https://www.macrumors.com/2025/04/30/apple-app-store-anti-steering-injunction-violation)) was narrowed on appeal in December 2025 ([AppleInsider](https://appleinsider.com/articles/25/12/11/appeals-court-amends-order-to-let-apple-resume-third-party-commissions)) |
| **C. Both** | A and B, with one entitlement record on our server | Both of the above | Everyone. It's the most work |
| **D. A voluntary "support us" link now** | A payment account only (GitHub Sponsors or similar). No server, and nothing locked | Not verified | Anyone who wants to give. A store build may have to sell tips through its own billing (unverified) |

**Recommendation:**
- **A, Play first,** once the Capacitor track supports billing. That matches BIZ-12 (Play first).
- Keep the PWA free and complete.
- Add B only if a large share of users turn out to be iPhone PWA users and there's still no iOS build.
- D is optional and the owner's call. It doesn't conflict with "free"; the honest framing is "this pays for nothing extra".
- **Write no billing or server code before the triggers in §3.5.** Server and billing code would live outside `index.html`. The single file only calls the server for people who opt in. That changes the "no server, no account" claim for them, so the privacy page must say so.

### 3.7 Price anchors

US prices. Most come from third-party trackers and reviews, as research §1 explains. **Re-check them on the store's checkout screen before quoting any of them publicly.**

| App | Monthly | Yearly | Lifetime | What the money buys | Source and status |
|---|---|---|---|---|---|
| **Hevy Pro** | $2.99 (a $3.99 listing also exists) | $23.99 | $74.99 | Limits lifted, plus the Trainer | [recurdash](https://recurdash.com/subscription-pricing/hevy) (says it checked hevy.com, Jul 2026), [apppricinglab](https://apppricinglab.com/iap/apple/1458862350). Third-party, consistent |
| **Strong PRO** | $4.99 | $29.99 (also $19.99 for 6 months) | $99.99 "Forever" (one storefront shows $79.99) | Unlimited templates, plus charts | [App Store listing](https://apps.apple.com/app/id464254577) via search, [SensAI, Oct 2026](https://www.sensai.fit/blog/strong-app-review-2026). Mostly consistent |
| **Fitbod** | $15.99 (legacy $12.99) | $95.99 (legacy $79.99) | Not corroborated | Generated workouts | [SensAI 2026](https://www.sensai.fit/blog/fitbod-review-2026), [apppricinglab](https://www.apppricinglab.com/iap/apple/1041517543). Competitor-written; **partly unverified** |
| **MacroFactor** | $11.99 | $71.99 (also $47.99 for 6 months); the bundle with Workouts is $89.99/yr | None | Adaptive nutrition; no free tier | [App Store listing](https://apps.apple.com/gb/app/id1553503471) via search, [MacroFactor help](https://help.macrofactorapp.com/en/articles/393-how-macrofactor-subscriptions-and-bundles-work) |
| **MyFitnessPal Premium** | $19.99 | $79.99 | — | Barcode and more | Reported in 2022 ([Droid-Life](https://www.droid-life.com/2022/08/24/myfitnesspal-puts-barcode-scanner-behind-premium-paywall/)); research §1 has the same figures. **Current price unverified** |
| **RP Hypertrophy** | $34.99 | $299.99 | — | Feedback-driven training blocks | research §1 (Oct 2026, third-party). **Unverified** |
| **WHOOP** | Membership | — | — | Wearable plus app | **Price unverified** |

**What the anchors say:**
- The logbook Pros (Hevy $23.99/yr, Strong $29.99/yr) sell what we give away free.
- The specialist coaches (MacroFactor $71.99/yr, Fitbod $95.99/yr) sell running intelligence.
- Our paid plan sells only the server features.

**Proposal (not evidence):**
- **One plan, annual-first, with a monthly option.**
- **Sync and backup alone** would sit in the logbook band, about $20–30 a year.
- **Hosted AI** is priced from the measured cost per active user (T4), with a fair-use allowance stated in plain numbers. Heavy users can keep using their own key for free.
- **Stay under MacroFactor's $71.99/yr** for the full plan.
- **Never price below the measured running cost.**
- The final price is set at switch-on, not now.

### 3.8 The third layer: revenue that never touches the free app

**Owner (2026-11-07):** approved the three-layer model ("Love it"). This section turns "possibly a coach plan and paid coach programs" into two needs-owner items, **BIZ-23** and **BIZ-24**. Neither has code, a server or a contract yet, and neither should until the conditions below hold.

**The test both must pass:** an ordinary user who never meets a coach loses nothing, sees no upsell in the free areas, and never needs an account.

#### The coach plan (BIZ-23): the coach pays, the clients are free
- **What it is:** a coach writes and adjusts programs for clients and sees their training logs. It needs a server, because two phones have to share data. A client joins by an invite, opting in to share; the coach pays a monthly plan.
- **Market evidence (third-party, unverified on the vendors' own pages):**
  - **Hevy Coach** is listed from about **$25 a month**, with clients using Hevy free ([Capterra](https://www.capterra.com/p/155784/fitbot/), [Coachway](https://coachway.io/articles/hevy-coach-vs-truecoach/)). This is the same "coach pays, client free" shape, from a direct competitor (research §1).
  - **TrueCoach** is reported at $29.98/mo for up to 5 clients, $69.98 for 20 and $164.98 for 50, with 5% on payments it collects ([FitBudd, Oct 2026](https://www.fitbudd.com/insights/truecoach-pricing-explained-plans-costs-and-what-coaches-actually-pay?c84a98fb_page=5); a competitor's blog, and Capterra lists a different starting price).
  - So coaches already pay $25–165 a month for this job. **No price is proposed here.** It's set from the measured server cost and the owner's call, when and if the plan exists.
- **The guardrails (these become acceptance criteria when it's built):**
  1. **Clients pay nothing and need nothing they don't already have**, beyond joining the coach by an invite.
  2. **Opt-in, scoped sharing.** The client chooses what the coach sees. Training logs are the default; body weight, food, sleep, BP, glucose, cycle and care data are off unless the client turns each one on. The client can stop sharing at any time, and the coach's copy is deleted.
  3. **Leaving costs the client nothing.** If the coach stops paying or the client leaves, the client keeps every log and the last version of every program on the phone. Only the live link to the coach ends.
  4. **No coach upsell in the free areas.** Nothing in the set sheet, the program picker, History or export advertises coaching.
  5. **Payments between coach and client stay outside the app.** We sell the coach a tool, not a cut of their coaching. That avoids holding client money.
- **Store rules:** Apple lets apps for real-time one-to-one services, fitness training among them, take payment outside in-app purchase (guideline 3.1.3(d), as quoted on [Apple's developer forums](https://developer.apple.com/forums/thread/723322); the live guideline text wasn't opened). A coach's *software* subscription bought in the app is a different case and may need in-app purchase. Check both stores' current rules before building.
- **Privacy and law:** the moment client data reaches our server, the app is covered by rules it avoids today:
  - the FTC's amended Health Breach Notification Rule, in force since 29 July 2024, which names diet and fitness apps and treats unauthorised sharing as a breach ([Covington](https://www.insideprivacy.com/health-privacy/ftc-issues-final-rule-to-expand-scope-of-the-health-breach-notification-rule/), [Jones Day](https://jonesday.com/en/insights/2024/07/ftc-issues-final-health-breach-notification-rule); law-firm summaries);
  - Washington's My Health My Data Act, which law firms read as reaching fitness and wellness data, with consent rules of its own ([Perkins Coie](https://perkinscoie.com/en/trending-now/topics/my-health-my-data-mhmd.html), [Holland & Knight](https://www.hklaw.com/en/insights/publications/2023/05/washington-state-imposes-far-reaching-privacy-obligations); interpretive, not settled).
  
  That makes the coach plan a legal and privacy decision first and a revenue decision second.
- **When:** not before Liftnext Pro's server exists and has run cleanly (BIZ-21 T4), because it shares that server, the accounts and the privacy page.

#### Coach programs (BIZ-24): real coaches, revenue share, built-in programs stay free
- **What it is:** a qualified coach publishes a program in Liftnext's program format; users can buy it; the coach gets a share of the net revenue. Once bought, it runs on the phone like any program and uses the free engine (progression, deloads, substitutions).
- **Market evidence:** **Boostcamp** keeps a free library of coach programs and puts about 32 of 132 coach programs behind Pro, with some sold one-time ([Boostcamp program library](https://www.boostcamp.app/features/program-library), [Boostcamp Pro](https://boostcamp.app/pro)). Its revenue-share terms aren't public; no source found. **No revenue-share percentage is proposed here.** It's a contract term for the owner.
- **Why this doesn't break the free promise:** the free list promises everything *we build*. A coach's program is the coach's work, sold by the coach. The built-in programs, the user's own custom programs and link sharing of custom programs (MKT-10) stay free.
- **The guardrails:**
  1. **No built-in program ever moves into the store,** and we never sell programs we wrote ourselves (§3.3, Rejected).
  2. **Bought means kept.** A bought program stays on the phone and in the JSON backup, even if the coach leaves or the store closes.
  3. **Same safety bar as built-in programs.** Every coach program passes the BL-01/BL-02 gates and the program audit's checks, and makes no health claims. **No clinical, prenatal, postpartum, rehab or hypertension programs from third parties**, because the liability sits with us (BIZ-15).
  4. **Store billing for digital content.** A program bought in a store build is digital content, so expect in-app purchase on iOS (guideline 3.1.1, not opened here) and Play Billing on Android. The store's fee comes off the top, before the coach's share.
  5. **No upsell in the free areas.** The program picker lists built-in programs first and labels coach programs as such; no lock icons appear on anything free (BIZ-18 criterion 4).
- **An honest limit:** a single-file app can't stop a bought program from being copied, because it lives in the user's own data. Accept that, as Boostcamp-style libraries implicitly do; the price buys the coach's work and updates, not secrecy.
- **When:** after public launch and after BIZ-21's triggers, because it needs payments, contracts and tax handling for payouts. It's the least urgent of the three layers.

#### What this changes elsewhere
- **BIZ-18's public wording** must use the §3.4 text, not its older draft (which names Chalklog and says nothing of coaches).
- **MKT-10 (program links)** stays free for custom programs. When coach programs exist, a coach program shares as a link to the coach's page, not as its full contents. That's a rule for the future store, not a restriction on MKT-10 today.

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
  - ~~"Training Log" is a generic, descriptive name.~~ **Resolved at v3.515:** the display name is now Liftnext (`manifest.json` `name`). The domain and USPTO check are still open before public use (pitch.md, Owner's answers). The manifest `description` still says "22 training programs … and AI coaching" at v3.516, so BIZ-07 is still needed.
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
   - **Plan two to three weeks for Play's tester gate.** Google's help page says a personal developer account created after November 2023 must run a closed test with at least 12 opted-in testers for 14 days before it can request production access ([Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB); secondary sources differ on the exact account cutoff date). An organisation account isn't subject to it. The first founding members are the natural testers, recruited honestly (no paid tester services).
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
5. Owner decisions in this order: BIZ-12 (go public?), BIZ-16 (privacy policy), BIZ-15 (clinical review), BIZ-11 and BIZ-18 (adopt the free/paid line publicly), BIZ-20 (founding promise), BIZ-13 (own-cloud backup), BIZ-21 (switch-on triggers), BIZ-22 (payment path), BIZ-14 (hosted AI, the first subscription candidate).
6. BIZ-19 (a "Training since" date from the log) is ready and small. It makes founding eligibility visible long before it matters.
7. The coach layer (BIZ-23 coach plan, BIZ-24 coach programs) is last. Both need the server, accounts, a privacy review and contracts, and neither changes anything in the build sequence. The one thing it changes now is BIZ-18's public wording (§3.4).

---

## 8. Couldn't verify

- **Retention benchmarks:** secondary summaries of AppsFlyer and Adjust. No primary report was opened.
- **RevenueCat 2025 trial-to-paid median (39.9%):** from Athletech News coverage. The primary page wasn't opened, and other sources disagree (35%, 62%).
- **Safari home-screen exemption from the 7-day cap:** from secondary reporting and a WebKit bug thread. The WebKit blog post itself wasn't found.
- **Store fees:** the developer accounts ($25 Play, $99/yr Apple) and the commission levels in §3.6 come from secondary sources. Google's help page couldn't be opened from this session, and the 2026 post-Epic Play rates are reported with differing dates. Check both stores' own pages before deciding on a price.
- **Precedent cases (§3.2):** the MyFitnessPal and Strava changes are confirmed by several news outlets. The Oura reaction is a forum anecdote. Fitbod's grandfathered legacy price comes from a competitor's blog.
- **Apple and web purchases:** the guideline 3.1.1 risk comes from developer forum reports, not from the guideline text. The US link-out rules are still in litigation.
- **Competitor prices:** these are `planning/research.md` snapshots, and several conflict between sources.
- **Coach market (§3.8):** Hevy Coach and TrueCoach prices come from Capterra and a competitor's blog, and they conflict. Boostcamp's revenue share is not public. The health-data laws (FTC HBNR, Washington MHMDA) are from law-firm summaries; how they apply to Liftnext is a question for counsel, not this file.
- **Play's 12-tester rule:** from Google's help page as surfaced in search; the account cutoff date differs between sources.
- **Playwright walk:** Chromium at 402×874, not iOS Safari. Install, persistence and share-sheet behaviour on an iPhone are unverified.
