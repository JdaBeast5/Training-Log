# Monetization plan, November 2026

Owner: business-manager. Written 2026-11-23 against **v3.632** (`APP_VERSION`, `index.html:8487`). It answers the owner's 2026-11-23 request:

> "I'm building this app for the fitness community to use, especially those who may need some guidance for tracking and training/learning. I am also trying to use it for supplemental income, how can we achieve that? Monthly/annual membership? Ads? … see how we could do something smart like that. Also find out, if the app is free, how I can still get paid by downloads or anything like that too, just trying to see what would be best, but it is supposed to bring in income primarily while helping the community."

**Status: a proposal, pending the owner.** Nothing here changes the app. It proposes revising `business.md` §3, which says "free forever on the phone, Pro only for server costs". The new items are BIZ-27 to BIZ-32 in `backlog.md`, all `needs-owner`.

**How to read the numbers:**
- Every market figure links its source.
- Where we couldn't open the primary page from this session, the figure is marked *(secondary)* or *(unverified)*. `support.google.com`, `revenuecat.com` and `macrumors.com` didn't load here, so those figures come from search results quoting them.
- Every projection is an **assumption** we chose, and says so. We have no users, analytics or sales data, so none of them is a forecast.
- **Not legal or tax advice.** The tax and LLC section is a checklist for a conversation with a CPA, and counsel where noted.

---

## 0. The answer in one page

1. **Nobody pays per free download.** Neither Apple nor Google pays developers when someone installs a free app. A free app earns only from what happens after the install: purchases or subscriptions inside it, ads, sponsorships, or selling to businesses (§2).
2. **Recommendation: a membership, with a free floor that never shrinks, and no ads.**
   - **Free forever:** everything in the app on the day it goes public. That covers logging, every built-in program with its progression and safety rules, full history and every chart that exists today, food logging, health tracking, backup and export, and AI with your own key.
   - **The membership pays for new things on top:**
     - coaching notes for each program week;
     - new programs 60 days early (they then join the free library);
     - new advanced reports;
     - Year in Lifting extras;
     - later, hosted AI coaching with no key needed, and cloud sync.
   - **Price:**
     - **$5.99 a month or $39.99 a year** at full price;
     - **$19.99 a year, locked, for founding members** (anyone who trained before the membership launched);
     - a free membership for anyone who says money is tight (§3.5).
3. **What changes from the earlier plan, and why.** The earlier rule allowed only things that run on our servers (hosted AI, sync) into the paid plan.
   - **The cost of keeping it:** no recurring income until a server, counsel, and the six retention triggers are all done, which realistically means Q3 2027 at the earliest. Server and AI running costs would then eat most of the revenue below about 1,000 active users (§1.1).
   - **The proposed rule:** the free floor is frozen at launch, so nothing anyone has is ever taken away, but **new** on-device extras may go in the membership.
   - **It isn't published yet.** That's why it can be changed honestly now and not after launch (BIZ-18 is still unbuilt; `whats-free.md`).
4. **No ads.** On raw dollars, ads in the Play build could out-earn a membership at the same scale, perhaps 2–3× at 10,000 active users (§1.4). Our advice is still no, for four reasons:
   - the web app (the iPhone path) can't use mobile ad SDKs;
   - ad SDKs in a health app carry real regulatory risk: the FTC fined GoodRx $1.5M and barred it from sharing health data for ads;
   - Apple forbids using fitness data for advertising;
   - the public README already promises "no ads".
5. **First dollars this December.** A "Founding Supporter" payment link on the web launch (BIZ-28), through Stripe, needs no server and no accounts. Licence codes are signed by hand on the owner's laptop. Recurring membership income on the web can start around **March 2027**, and on Play when the Capacitor build supports billing.
6. **Year 1, honestly:** roughly **$200 to $14,000 of revenue** (net of store and card fees, before running costs and tax), depending almost entirely on how many people use it (§5). This is supplemental income that builds slowly, not a salary. The membership is designed so year 2 can grow without changing the promise.

---

## 1. The revenue options, side by side

**Common assumptions for the tables in this section (ours, not benchmarks):**
- **"Active users"** means monthly active users (MAU).
- **DAU/MAU of 35%,** because lifters train about 3 days a week.
- **New installs a year ≈ 3 × MAU.** Health and fitness day-30 retention is only 3–8% (business.md §4), so it takes many installs to hold an active base.
- **Store fee 15%** (§2.2). **Stripe fee:** 2.9% + 30¢ ([flaviocopes](https://flaviocopes.com/payment-provider-fees/), secondary).
- **All figures are annual, in USD, net of store or card fees,** before running costs and before tax.

### 1.1 Membership (freemium subscription): recommended

| | Detail |
|---|---|
| **Shape** | A free app with a paid membership on top. Monthly or annual. A founding price for early users (already approved, BIZ-20) |
| **Evidence** | **Freemium converts far less than a hard paywall.** Median day-35 download-to-paid is about **2.1% for freemium against 10.7% for hard paywalls** ([RevenueCat blog, 2026 benchmarks](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026), via search). RevenueCat's 2026 report also says paywalls convert "almost 6 times as much as freemium", with near-identical retention (27% vs 28%) ([RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps-2026/), via search). Health and fitness earned about **$0.63 per install by day 60**, against an all-category median of $0.31 (RevenueCat 2025, via search; no 2026 category figure found). Health and fitness median prices were **$9.70 a month and $39.99 a year** (RevenueCat 2025, quoted by [Airbridge](https://www.airbridge.io/en/blog/subscription-app-pricing-by-category-2026-benchmark); secondary). Adapty puts health and fitness trial-to-paid at **35%** ([Adapty 2026](https://adapty.io/state-of-in-app-subscriptions/), secondary) |
| **What it means for us** | A free tier that already gives "the whole paid stack" (pitch.md) converts at the low end. The membership has to hold real, new value people want, not locks on what they have. That's why §3 adds on-device extras rather than waiting only for server features |
| **Income (assumption: 2–5% of MAU pay, $28 net per payer per year, blended across founding, annual and monthly)** | **1k MAU:** $560–1,400. **10k:** $5,600–14,000. **50k:** $28,000–70,000 |
| **Running cost** | **On-device extras:** close to $0 per member. **Hosted AI (estimate, from list prices):** Claude Sonnet 5.5 at $2 input and $10 output per million tokens, and Haiku 5.5 at $0.10/$0.50 (Anthropic's price list as cached 2026-11-03). A coach message with about 4,000 tokens of log context and a 400-token reply costs about **$0.012**; 60 a month is about **$0.72**. A food photo on Haiku costs about $0.0004. So plan on **$0.30–1.20 per member a month** under a stated fair-use limit, which is **about 13–50% of the $2.33 a month** a $28/yr member nets. That's estimated, not measured; BIZ-21 T4 requires measuring it. **Sync server:** Supabase Pro from $25 a month plus usage ([Supabase](https://supabase.com/pricing), as quoted in search). **At 1k MAU with AI:** about 35 payers net roughly $980 a year, against roughly $300 of server cost plus $125–500 of AI. Hosted AI only pays at scale; on-device extras pay from member one |
| **Needs** | **On-device extras:** a licence check in `index.html` (an offline signature check, BIZ-29) plus a way to sell (Stripe on the web, Play Billing in the store build). **Hosted AI and sync:** a server, accounts, counsel and a privacy-page update (BIZ-13, BIZ-14) |
| **Fit with the mission** | **Good, if the free floor is generous and frozen,** safety is never paid, and a free membership exists for anyone who needs it (§3.5) |

### 1.2 One-time "Pro unlock" or lifetime purchase

| | Detail |
|---|---|
| **Evidence** | Lifters buy lifetime plans: Hevy sells $74.99 and Strong $99.99 "Forever" ([recurdash](https://recurdash.com/subscription-pricing/hevy), [SensAI](https://www.sensai.fit/blog/strong-app-review-2026); third-party). Boostcamp sells none and says so on [its own page](https://www.boostcamp.app/is-boostcamp-free) |
| **Income (assumption: 1% of installs buy at $49.99, $42.50 net)** | **1k MAU:** about $1,275. **10k:** about $12,750. **50k:** about $63,750. That's comparable to the membership early on, but it **stops when growth stops**, and it can't fund a running cost |
| **Running cost** | None for on-device features. **Never for hosted AI:** each lifetime buyer would cost money every month forever (business.md §3.2, item 3) |
| **Needs** | The same licence check as §1.1 |
| **Fit** | **Good for subscription-averse lifters.** Bad as the main model, because it has no recurring income to carry AI, sync or support |
| **Verdict** | **Not at launch.** Revisit after six months of membership data, as a lifetime option for the **on-device extras only** at about 2.5× the annual price. Hosted AI would stay outside it; BYO-key AI stays free for heavy users (BIZ-30) |

### 1.3 Paid-upfront app

| | Detail |
|---|---|
| **Income** | About **$4.24 net per sale at $4.99**. 1,000 paid downloads is about $4,240, once |
| **The problem** | The same app is free on the web. A paid Play listing would be paying for what the browser gives away, or it would force us to close the web app. Closing it shuts out iPhone users (there's no iOS build) and the people the mission is for |
| **Fit** | **Poor.** It locks out exactly the people who need guidance |
| **Verdict** | **No.** |

### 1.4 Ads

**What a small fitness app can realistically earn.** There's no public, verified ad benchmark for fitness apps. These are third-party US figures, mostly measured on games:

| Format | US eCPM (per 1,000 views) | Source |
|---|---|---|
| Banner | $0.50–1.50 | [Playwire](https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect) (secondary, game-weighted) |
| Interstitial (full screen) | $5–8 | same |
| Rewarded video | $15–30 | same |
| Global averages | banner $0.20–0.80, interstitial $2.50–5, rewarded $8–18 | same |

- **Revenue per daily user:** Adapty lists utilities at **$0.02–0.10 per DAU per day**, mainly ads plus premium, and fitness at $0.05–0.20, mainly subscriptions ([Adapty glossary](https://adapty.io/glossary/arpdau/); undated, unverified).
- **A worked example of what one user's session earns (assumption):** a workout keeps the app on screen for about 15 minutes, with the phone locked between sets. That's about 15 banner refreshes plus one interstitial at the finish: about **$0.02 per active day for a US user**, and less abroad and at lower fill rates.

**Income (assumption: an ads-only ARPDAU of $0.01–0.03, Play build only):**
- **1k MAU:** $1,300–3,800 a year.
- **10k MAU:** $12,800–38,300 a year.
- **50k MAU:** $64,000–192,000 a year.

**The honest comparison:** at the same scale, ads could earn **2–3× a membership.** That is the strongest argument for ads, and we don't hide it.

**Why we still advise against them:**

1. **The web app can't run them properly.** Mobile ad SDKs (AdMob and similar) run only in native builds. The PWA would need web ad scripts loaded into a page that holds every log and health reading. That breaks "no external requests on first launch" (business.md §5.2) and the privacy story on the only path iPhone users have.
2. **Health data and ad SDKs are a known legal hazard.**
   - **Apple:** "information collected in the health, fitness, and medical research context may not be used for advertising, marketing, or other use-based data mining purposes" ([App Review Guidelines 5.1.3](https://developer.apple.com/app-store/review/guidelines/) and the [HealthKit page](https://developer.apple.com/healthkit), via search). The app developer is responsible for every SDK inside the app.
   - **Google Play:** Health Connect data counts as personal and sensitive user data, "may never be sold", and any ad use must follow the Ads policy ([Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311) and the [Health Connect FAQ](https://support.google.com/googleplay/android-developer/answer/12991134), via search; we found no Health Connect clause on ads beyond that).
   - **The FTC:** its first Health Breach Notification Rule case fined **GoodRx $1.5M** for sharing health information with Facebook, Google and others, and **barred it from sharing health data for advertising** ([Crowell](https://www.crowell.com/en/insights/client-alerts/ftc-imposes-dollar15-million-civil-penalty-in-first-of-its-kind-health-breach-notification-rule-enforcement-action), [Covington](https://www.insideprivacy.com/digital-health/ftc-announces-first-enforcement-action-under-health-breach-notification-rule/)). The 2024 amendment names fitness apps (business.md §3.8).
   - **The cost of avoiding that risk:** serving only non-personalised ads with consent management lowers the risk. It also lowers the eCPM, by an amount we couldn't verify.
3. **It breaks a public promise.** The live `README.md` already says "Free, no ads", and every store draft says "No ads" (`store/app-store.md`). Adding ads would be the clawback business.md §3.2 warns about.
4. **It fights the product.**
   - Logging takes one tap, enforced by tests (`test-tap-counts.js`). Interstitials between sets would break it.
   - Full-screen ads that interrupt logging are a recorded complaint about Cronometer's free tier (research.md §2, third-party audit).
   - "No ads" is one of our four differentiators (business.md §2).
5. **The trade, stated plainly:** at 10k active users, no ads probably leaves something like **$13,000–38,000 a year of gross ad revenue** on the table, less whatever ads would cost in retention and membership sales (we couldn't quantify that). It buys trust, a clean privacy story, legal simplicity and a faster app. We think that's the right trade for a health app built to help people, and it's the owner's call.

**Verdict: no ads, on any layer** (unchanged from business.md §3.3).

### 1.5 Tips and supporter tiers

| | Detail |
|---|---|
| **Fees** | **Ko-fi:** 0% platform fee on one-off tips on its free tier (5% on memberships and shop sales), plus card fees ([SchoolMaker on Ko-fi](https://schoolmaker.com/blog/ko-fi-pricing), secondary). **Buy Me a Coffee:** 5% plus processing ([SchoolMaker on BMC](https://schoolmaker.com/blog/buy-me-a-coffee-pricing), secondary). **GitHub Sponsors:** fee not verified. **A Stripe Payment Link:** 2.9% + 30¢ |
| **Store rules** | **Apple:** a tip or donation tied to content or features must use in-app purchase, and reviewers have rejected an About-page "Tips" link ([Apple forum 844046](https://developer.apple.com/forums/thread/844046), [Insight Timer case, TechCrunch](https://techcrunch.com/2024/02/21/in-a-reversal-apple-is-now-demanding-30-of-the-donations-to-meditation-app-insight-timers-teachers/amp)). **Google Play:** requires its billing for digital goods; the donation exemption we found covers tax-exempt donations ([Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818), via search). **So the supporter link is shown on the web build only** (BIZ-28) |
| **Income (assumption: 0.5–1.5% of MAU give about $10 a year)** | **1k MAU:** $50–150. **10k:** $500–1,500. **50k:** $2,500–7,500 |
| **Running cost** | None |
| **Needs** | A Stripe or Ko-fi account. No server, no accounts |
| **Fit** | **Very good.** Nothing is locked, and it's the **fastest path to a first dollar** (§4) |
| **Verdict** | **Yes, as a "Founding Supporter" pass at web launch.** The supporter's $19.99 is a year of founding membership paid in advance; until the membership launches, it pays only for development (BIZ-28) |

### 1.6 Coach programs (BIZ-24) and the coach plan (BIZ-23)

| | Coach programs | Coach plan |
|---|---|---|
| **Shape** | A real coach sells a program that runs on our free engine; we take a share | A coach pays monthly to write programs for clients and see their logs; clients stay free |
| **Evidence** | Boostcamp keeps about 32 of 132 coach programs behind Pro (business.md §3.8; its revenue share isn't public) | **Coaching software:** TrueCoach about $20–107 a month by client count ([Capterra](https://www.capterra.com/p/155784/truecoach/pricing/), [G2](https://www.g2.com/products/xplor-truecoach/pricing), [FitBudd](https://www.fitbudd.com/insights/everfit-vs-trainerize-vs-truecoach?c84a98fb_page=4); the sources conflict). Everfit from $19 a month ([Capterra](https://capterra.com/p/202837/Everfit/pricing/)). Hevy Coach from about $25 (business.md §3.8) |
| **Income (assumption)** | 1% of MAU buy one $20 program a year; the store takes 15%; we keep 30% of the rest. **1k:** $51. **10k:** $510. **50k:** $2,550 | **Doesn't scale with MAU; it scales with coaches.** At $19 a month: 10 coaches is $2,280, 50 is $11,400, and 200 is $45,600 a year |
| **Running cost** | Store fees, payouts and tax forms; contracts | The server, accounts, support, and **counsel** (client health data on our server brings the FTC HBNR and Washington's My Health My Data Act into play; business.md §3.8) |
| **Fit** | Good: coaches earn, and built-in programs stay free | **Very good.** The client never pays, and each coach brings clients. It's the best long-run B2B line |
| **Verdict** | **Year 2.** Small money; its value is content | **Year 2,** after the membership's server exists (unchanged: no work before BIZ-21's T4) |

### 1.7 Affiliate links and sponsorship

| | Detail |
|---|---|
| **Evidence** | Amazon US pays about **3% on Sports and Outdoors** and about **1% on Health and Personal Care** ([Amazon Associates statement](https://affiliate-program.amazon.com/help/node/topic/GRXPHT8U84RAYDXZ), [Lasso](https://getlasso.co/amazon-affiliate-commission-rate/); partial snippets, and the tables conflict) |
| **Income (assumption: 2% of MAU buy $50 a year through a link)** | **1k:** $30. **10k:** $300. **50k:** $1,500 |
| **Trust cost** | High for little money. The app already gives supplement guidance, so a paid supplement link next to it would look like a health claim for money. Endorsements need FTC disclosure |
| **Verdict** | **No affiliate links or sponsors inside the app.** An optional, clearly labelled "gear I use" page on the website is the owner's call. We'd skip it in year 1 |

### 1.8 B2B: gyms, trainers and PT clinics

| | Detail |
|---|---|
| **Shape** | **Trainers:** the coach plan (§1.6). **Gyms:** a white-label or member-perk licence. **PT clinics:** a home-exercise programme tool |
| **Income (assumption, no market source)** | $50–200 per location a month, so 10 locations is $6,000–24,000 a year. Sales are slow and one at a time |
| **Running cost** | Sales time, contracts, support, and accounts on a server. **PT clinics are HIPAA covered entities.** Handling their patients' data likely makes us a business associate under a BAA (counsel needed) |
| **Fit** | Trainers fit well. Gyms are possible. **PT clinics conflict** with the clinical-liability caution in business.md §5.6 |
| **Verdict** | **Trainers through the coach plan in year 2; gyms only if one asks; no PT-clinic product without counsel.** |

### 1.9 Summary table

Annual, net of fees, before running costs and tax. All rows use the assumptions stated above.

| Model | 1k MAU | 10k MAU | 50k MAU | Running cost | Needs | Mission fit | Verdict |
|---|---|---|---|---|---|---|---|
| **Membership** | $560–1,400 | $5,600–14,000 | $28,000–70,000 | ~$0 on-device; AI ~$0.30–1.20 per member a month; server from ~$25 a month | Licence check; Stripe and Play Billing; a server for AI and sync | Good, with a frozen free floor | **Yes (core)** |
| One-time unlock | ~$1,275 | ~$12,750 | ~$63,750 | none | Licence check | Good | Later, on-device extras only |
| Paid upfront | — | — | — | none | Store listing | Poor | No |
| Ads | $1,300–3,800 | $12,800–38,300 | $64,000–192,000 | ad SDK, consent management | Native build only | Poor | **No** |
| Tips and supporters | $50–150 | $500–1,500 | $2,500–7,500 | none | A payment link | Very good | **Yes (first)** |
| Coach programs | ~$51 | ~$510 | ~$2,550 | contracts, payouts | Store billing; contracts | Good | Year 2 |
| Coach plan | scales with coaches: $2,280 per 10 coaches | | | server, counsel | Server, accounts | Very good | Year 2 |
| Affiliate | ~$30 | ~$300 | ~$1,500 | trust | Links | Poor | No |
| B2B gyms and clinics | per deal: $600–2,400 per location | | | sales, HIPAA | Server, contracts | Mixed | Only if asked |

---

## 2. "Getting paid by downloads"

### 2.1 What's true
- **Neither Apple nor Google pays developers for free downloads.** Free apps with no digital sales pay no store commission, and they don't receive anything per install either ([Google Play service fees](https://support.google.com/googleplay/android-developer/answer/112622), [SplitMetrics](https://splitmetrics.com/blog/google-play-apple-app-store-fees/), via search). We found no program from either store that pays per install.
- **Apple's per-install charges run the other way.** Its EU Core Technology Fee charged *developers* per install at very large scale. From 1 October 2026 it's being replaced by a 5% commission on transactions in apps distributed outside the App Store ([Apple Newsroom, Aug 2026](https://www.apple.com/newsroom/2026/08/apple-announces-changes-for-apps-in-the-european-union/), via search).

### 2.2 How a free app actually earns, and what the stores take

| Route | What the store takes (US) | Status |
|---|---|---|
| **In-app subscription or purchase, Google Play** | From **30 June 2026**: a **10% service fee** on the first $1M of annual earnings and on all auto-renewing subscriptions, plus a **5% billing fee** when Play's billing is used. So **15% total** on a subscription ([Android Developers Blog, June 2026](https://android-developers.googleblog.com/2026/06/play-expanded-billing.html), [Play help 15582165](https://support.google.com/googleplay/android-developer/answer/15582165), [TechCrunch](https://techcrunch.com/2026/03/04/google-settles-with-epic-games-drops-its-play-store-commissions-to-20/); all via search). The court approval of the March 2026 settlement is described as pending | Secondary but consistent |
| **Alternative billing or an external web link from a Play app (US)** | The 10% service fee still applies; the 5% billing fee doesn't. You report transactions to Google (same sources) | Secondary |
| **In-app purchase, Apple, Small Business Program** | **15%** for developers under $1M in proceeds a year, across associated accounts ([Apple SBP](https://developer.apple.com/app-store/small-business-program/), via search) | Apple's page, via search |
| **An external purchase link from an iOS app (US)** | Unsettled. In December 2025 the appeals court let Apple charge a "reasonable" fee, to be set by the district court. In April 2026 the stay was reversed, and Apple's contempt appeal is at the Supreme Court ([MacRumors Dec 2025](https://www.macrumors.com/2025/12/11/apple-app-store-fees-external-payment-links/), [MacRumors Apr 2026](https://www.macrumors.com/2026/04/29/epic-games-wins-reversal-app-store-fee-battle/), [TechSpot](https://www.techspot.com/news/112956-apple-fight-epic-over-app-store-fees-reaches.html)) | Moot for us until an iOS build exists |
| **Web (the PWA), through Stripe** | No store fee. Stripe takes 2.9% + 30¢ (secondary). Stripe Tax adds 0.5% where used. A merchant of record (Paddle, 5% + 50¢) handles sales tax and VAT for you ([flaviocopes](https://flaviocopes.com/payment-provider-fees/), [CheckoutPage on Paddle](https://checkoutpage.com/blog/paddle-pricing); secondary). One competitor's page claims Lemon Squeezy closed sign-ups on 16 Nov 2026 ([CheckoutPage](https://checkoutpage.com/tools/lemon-squeezy-fee-calculator), **unverified**), so we don't plan on it | Secondary |
| **Ads** | No store cut; the ad network keeps its share inside the eCPM | §1.4 |
| **A paid-upfront price** | Same store rates as above | §1.3 |

### 2.3 The one "paid by usage" programme we found: Google Play Pass
- **What it is:** a curated subscription catalogue of apps and games with no ads and no in-app purchases for its subscribers.
- **How developers are paid:** a royalty calculated "algorithmically" from signals of how users value the content. In 2019 it was reported to be based on time spent ([Play Pass page](https://play.google.com/console/about/programs/googleplaypass/), [Game Developer 2019](https://gamedeveloper.com/game-platforms/devs-that-sign-on-to-play-pass-are-paid-by-the-time-players-spend-in-their-games)).
- **How to join:** developers can express interest. RevenueCat's docs say it's invitation-only ([RevenueCat docs](https://www.revenuecat.com/docs/google-play-pass)).
- **What it pays:** not published, so it can't be modelled.
- **Verdict:** it fits our no-ads stance. Worth one "express interest" form once the Play listing is live (BIZ-32, checklist). Don't plan on its income.

---

## 3. Recommendation: membership with a frozen free floor

### 3.1 The rule, revised (proposal; the owner decides in BIZ-27)

> **Everything in Platestep on the day it goes public stays free forever, with no ads and no limits. Safety is never paid. An optional membership pays for new extras we build after that, on the phone or on our servers.**

**What changes from business.md §3.3:**

| | Earlier rule (2026-11-07) | Proposed rule |
|---|---|---|
| What can be paid | Only new things that run on our servers | **New** things, on the phone or on our servers |
| What's always free | Everything that runs on the phone | **Everything in the app at public launch**, plus anything safety-related, ever |
| First recurring income | After a server, counsel and six triggers: Q3 2027 at the earliest | **About March 2027** on the web (§4) |
| Ads, selling data, quotas, clawbacks | Never | **Never** (unchanged) |
| Founding price, coach layer, BYO-key AI free | Yes | **Yes** (unchanged) |

**Why change it:**
1. **Income is now the primary goal** (the owner, 2026-11-23). Under the old rule there is nothing to sell until hosted AI and sync exist. That needs a server, counsel and a privacy rewrite, and at 1k active users their running cost eats most of the revenue (§1.1).
2. **On-device extras cost nothing to run,** so every membership dollar is margin from the first member.
3. **Freemium needs a reason to pay.** The median freemium app converts about 2.1% of downloads, against 10.7% for a hard paywall (RevenueCat, §1.1). A free app that already contains everything converts at the bottom of that range.
4. **Nobody loses anything.** The floor is everything that exists at launch, and the "What's free" promise isn't published yet (BIZ-18 is unbuilt). Changing it now is honest; changing it after launch would be a clawback.

**What we deliberately don't do:**
- **Move any shipped feature into the membership.** The per-muscle ledger (BL-20), set autoregulation (BL-31), expenditure (BL-17), Year in Lifting (MKT-06), every chart and Analysis card stay free. The README already publishes "Free, no ads".
- **Put anything safety-related in it:** safety cues, the clinical guardrails (BL-01, BL-02, BL-69), the care acknowledgement, injury flags and substitutions.
- **Sell anything to clinical-program users specifically.** Clinical programs get no paid extras. That avoids both the liability and the look of charging vulnerable people.

**Already planned items: recommend they stay free.** These are planned but not yet shipped:
- BL-27, the weekly calorie check-in, which is our free answer to MacroFactor;
- BL-29, import;
- BL-22, CSV export (done);
- BIZ-13, own-cloud backup;
- BL-21 and BL-32, readiness.

They were promised to the owner as free in the pitch, and they're the acquisition wedge. Moving them would be legal but would weaken the "whole logbook free" story that makes people try the app.

### 3.2 What's free, what's in the membership

**Free forever** (the floor; everything at launch):

| Area | Included |
|---|---|
| Logging | Workouts, one-tap sets, the rest timer, plate math, warm-ups |
| Programs | Every built-in program at launch, plus any added later once its early-access window ends. Custom programs and program links. Progression, deloads, RPE and RIR targets, substitutions, the per-muscle ledger and set autoregulation |
| History and analysis | Full history with no time limit, PRs, e1RM, every chart and Analysis card that exists at launch, Year in Lifting, "Your number", "Training since" |
| Food | Search, barcode, macro targets, trend weight, expenditure, and the weekly check-in when it ships |
| Health tracking | Sleep, water, BP, glucose, cycle, supplements, care, and the clinical programs |
| Safety | Everything: cues, caps, gates, the care acknowledgement, injury flags |
| Your data | JSON backup and restore, CSV export, Strong and Hevy import, backup to your own cloud |
| AI | Everything with your own key, forever |

**In the membership** (new value; each is its own item when built):

| Extra | Runs where | When | Why it's worth paying for |
|---|---|---|---|
| **Coaching notes for each program week:** what this week is for, what to focus on, and how to adjust if a session goes badly. Cited and reviewed, with no health claims; not for clinical programs | On the phone (content in `content-*.js`) | v1, about March 2027 | It's "guidance", which the owner names as the mission, delivered as depth. The basic cues stay free |
| **New programs 60 days early,** after which they join the free library | On the phone | v1 | It funds new programs without ever locking one permanently |
| **New advanced reports:** a block-over-block comparison, lift forecasts, and a printable training report to share with a coach or physio | On the phone | v1–v2 | New analysis only; existing charts stay free |
| **Year in Lifting extras:** alternate card designs and a multi-year comparison | On the phone | v1 (December 2027) | Basic Year in Lifting stays free |
| **Hosted AI coach, no key needed:** coach chat, photo food logging, insights, under a stated fair-use limit | Our server plus Anthropic | v2, about Q3 2027 | Removes the biggest dead end for new users (business.md §5.4). BYO-key AI stays free |
| **Cloud sync and automatic encrypted backup** across devices | Our server | v2 | It solves "one lost phone loses everything" (business.md §5.3) automatically. Manual backup stays free |

### 3.3 Price points

| App | Monthly | Yearly | Lifetime | Source |
|---|---|---|---|---|
| Hevy Pro | $2.99 (a $3.99 listing also exists) | $23.99 | $74.99 | [recurdash](https://recurdash.com/subscription-pricing/hevy) (third-party) |
| Strong PRO | $4.99 | $29.99 | $99.99 | [SensAI](https://www.sensai.fit/blog/strong-app-review-2026) (competitor-written) |
| Boostcamp Pro | $14.99 | $59.99 | none | [Boostcamp](https://www.boostcamp.app/is-boostcamp-free) (own page, via search) |
| MacroFactor | $11.99 | $71.99 | none | business.md §3.7 |
| Fitbod | $15.99 | $95.99 | not found | business.md §3.7 (partly unverified) |
| Health and fitness median | $9.70 | $39.99 | — | RevenueCat 2025 via [Airbridge](https://www.airbridge.io/en/blog/subscription-app-pricing-by-category-2026-benchmark) (secondary) |

**Proposal (not evidence):**
- **List price: $5.99 a month or $39.99 a year.** The annual plan is about 44% off twelve months. That's the category's median annual price and well under MacroFactor and Fitbod. It's above Hevy and Strong, because their Pro tiers sell limits lifted on a logbook we give away, while ours sells coaching depth and, from v2, hosted AI and sync.
- **Founding price: $19.99 a year, or $2.99 a month, locked while subscribed.** That's half of list, as BIZ-20 already approved, for anyone whose first logged set predates the membership launch (BIZ-19's "Training since").
- **Membership v1 opens at the founding price only.** The $39.99 list price starts for new members when v2 (hosted AI and sync) ships, so nobody pays full price for on-device extras alone.
- **Free trial:** none on v1, because the free app already is the trial. A **7-day trial on the annual plan when v2 ships.** The screen states the price and the date it converts, in the same size as the offer. On the web, the app shows its own in-app reminder 2 days before the trial ends.
- **No lifetime plan at launch** (§1.2, BIZ-30).
- **Never price below measured running cost;** BIZ-21's T4 measures it before v2.

### 3.4 Membership name
- **"Platestep Membership"** or **"Platestep Plus"** (the owner's call, BIZ-30).
- Avoid "Pro". BIZ-18a's guard (`test-free-list-guard.js`) already bans "pro", "premium", "upgrade", "unlock" and "locked" from the free areas. The membership UI lives only in its own Settings → Membership section, and BIZ-29 extends the guard to the words "membership", "member", "subscribe" and "plus" outside that section.

### 3.5 The community side: free for need, and gifts

**"Free membership for anyone who needs it"** (BIZ-31):
- **How to ask:** email `support@platestep.com` and say money is tight. There's **no proof and no questions**, and it renews each year on request.
- **What it costs us:** the on-device extras cost nothing to give away. Hosted AI does cost money, so the community membership gets the same features under the same fair-use limit, from a monthly pool the owner sets.
- **What it uses:** the same signed-licence mechanism as paid membership (BIZ-29), with plan `community`.

**"Gift a membership":** a member can buy one for a stranger, and it goes into the community pool. It's a "help the community" loop that also brings in money.

**A separate cheap tier: not recommended.** Two tiers double the explaining. The free floor plus the free-for-need membership already cover anyone who can't pay.

### 3.6 Do we change the earlier line? Yes, in one place

- **What changes:** we would replace "free forever on the phone, Pro only for server costs" with the §3.1 rule.
- **Why:** to make income possible in 2027 rather than 2028, without taking anything from anyone.
- **What stays:** no ads, no data selling, no quotas, no clawbacks, the founding price, the coach layer, BYO-key AI free, and safety never paid.
- **Proposed "What's free" paragraph** (BIZ-27 replaces BIZ-18's text if approved; no price, no currency symbol and no date, per BIZ-18 criterion 3):

> Platestep is free to use, with no ads, ever. Everything in the app when it launched stays free forever with no limits: logging, every built-in program with its progression, your full history and charts, food logging, health tracking, safety guidance, and backing up or exporting your data. We may fix or retire a feature for safety, but we will never put a free feature behind a payment. An optional membership pays for Platestep's development and adds new extras on top, like coaching notes for your program, new programs before everyone else (they then join the free library), and later AI coaching without your own key and cloud sync. Anyone who trained with Platestep before the membership launched gets a founding price for as long as they stay a member, and anyone who can't afford it can ask for a free membership. Coaches may one day pay to manage clients or sell programs they wrote; their clients keep everything above for free.

---

## 4. The fastest path to first dollars

**The constraints:**
- no server and no accounts;
- the single `index.html`, with no build step;
- no iOS build: iPhone users run the PWA, so for them **web payments are the only path**;
- the Play build belongs to the Capacitor track, which we don't touch;
- web launch around mid-to-late December 2026.

**The trick that avoids a server:**
- **A signed licence code, verified offline.** The owner keeps a private signing key on his own computer, never in the repo.
- **On a sale,** Stripe emails him. He runs one local script (`tools/licence/`, BIZ-29), which prints a short code, and emails it to the buyer.
- **The app checks the code's signature** with an embedded public key, through the browser's built-in WebCrypto (ECDSA P-256, which Safari supports). It makes no network call and stores no account.
- **Scale:** this works by hand for a few sales a day. A small serverless function (owner decision) can automate it later without touching health data.
- **An honest limit:** the repo is public, so a determined person could patch the check out. We accept that. Server features (AI, sync) are protected naturally, because they live on the server.

### 4.1 Order and dates

| When | Step | Who | Unblocks |
|---|---|---|---|
| **By 5 Dec 2026** | Answer BIZ-27 (the rule), BIZ-28 (the supporter pass) and BIZ-30 (prices) | Owner | Everything below |
| **By 12 Dec** | **Form the Florida LLC first.** It's cheap, done online, and means Stripe and the bank are in the LLC's name from day one, so nothing needs migrating later (§4.2 checklist). Get the EIN the same day, then open a business bank account | Owner | Stripe |
| **By 15 Dec** | Open a Stripe account in the LLC's name. Create two Payment Links: "Founding Supporter, $19.99 (a year of founding membership, paid in advance)" and an optional one-off amount. Write the refund policy and terms of sale. Update the privacy page draft to name Stripe as the payment processor (BIZ-16) | Owner (marketing for the copy) | BIZ-28 |
| **Mid-to-late Dec** | **Web launch** with BIZ-18 (the revised What's-free text) and BIZ-28 (a "Support Platestep" link in Settings → About, on the web build only, plus the README and landing page) | Build-automator, then owner review | **First dollars: December 2026** |
| **Jan–Feb 2027** | Build BIZ-29 (membership v1: the licence check, the Membership section, coaching notes for the 3–4 most-used programs, the early-access flag). The owner and the exercise auditor write and cite the notes. Founding Supporters get their licence codes when v1 ships | Build-automator, auditor, owner | Recurring income |
| **About March 2027** | **Membership v1 on the web:** Stripe Checkout subscriptions at the founding price; codes sent by hand | Owner | **Earliest recurring revenue: March 2027** |
| **When the Capacitor track supports it** | The Play closed test (12 testers for 14 days, business.md §6), then production, then Play Billing for the same membership (Play's own offer mechanism for the founding price). The supporter link stays hidden in the native build | Capacitor track (outside this team), owner | Android members; an estimated Q2 2027, **unverified**, because it depends on a track we don't own |
| **About Q3 2027** | Hosted AI and sync (BIZ-14, BIZ-13), after counsel, the privacy-page update and cost measurement (BIZ-21's T2 and T4, kept for server features). The list price of $39.99 starts for new members | Owner, counsel, build | Membership v2 |
| **2028** | The coach plan, coach programs, and an iOS build if it exists ($99 a year Apple account, business.md §3.1) | Owner | Year-2 lines |

**What could make it faster:** nothing honest. Selling before there's anything to sell (for example a "Pro" badge) would trade trust for pocket money. The supporter pass is the honest early version: it says plainly what it buys.

### 4.2 LLC and tax basics (a checklist, not advice)
1. **Florida LLC:** file Articles of Organization on Sunbiz for **$125** ($100 filing plus $25 registered agent designation). The annual report is **$138.75**, filed between 1 January and 1 May, with a **$400 late fee** ([Florida Division of Corporations fee schedule](https://dos.fl.gov/sunbiz/forms/fees/llc-fees/)). An LLC formed in 2026 files its first report by 1 May 2027 (third-party guides; confirm on Sunbiz).
2. **Registered agent:** someone with a Florida street address. It can be the owner.
3. **EIN** from the IRS, free online. Use it, not the owner's SSN, on Stripe, Play and the bank.
4. **A separate business bank account.** Every payout (Stripe, Play, later Apple) goes there. Don't mix it with personal money; mixing weakens the LLC's liability shield.
5. **Federal tax:** a single-member LLC is taxed by default as a "disregarded entity", meaning the income goes on the owner's own return, with self-employment tax. Set aside a share of every payout and ask a CPA about quarterly estimated payments.
6. **Florida tax:** Florida has no personal income tax. The Department of Revenue treats remotely accessed software subscriptions as **not taxable** (TAA 16A-014, per [Kintsugi](https://trykintsugi.com/blog/florida-saas-sales-tax); secondary). Sources disagree on other digital goods, so ask the CPA.
7. **Sales tax and VAT elsewhere:**
   - App stores collect and remit the tax on their sales.
   - **On Stripe, the LLC is the seller.** Other US states' economic-nexus thresholds (often $100k) are far off, but EU and UK VAT on digital services can apply from the first sale to someone there.
   - Options: limit web sales to the US at first, turn on Stripe Tax (+0.5%), or use a merchant of record such as Paddle (5% + 50¢), which handles it for you. Recommend **a merchant of record or Stripe Tax before selling outside the US** (BIZ-32).
8. **Local business tax receipt:** Florida counties and cities may require one for a home business. Check the owner's county.
9. **Store accounts:** the Play account is personal for now and transfers to the LLC later (pitch.md, D9(f)). Google may ask an organisation account for a D-U-N-S number (**unverified**; check). Both stores collect US tax forms (W-9) in their consoles.
10. **Paperwork users see:** terms of sale, a refund policy, and the privacy page naming Stripe (and later the server) as processors. **Counsel reviews them before the membership launches** (already recommended before any server, D9(e)).
11. **Trademark:** the USPTO knockout search for Platestep is clear (pitch.md). Filing an application is optional and costs money, so it's the owner's call.

---

## 5. Year-1 projections (December 2026 to November 2027)

**Read this first:** we have **no** usage data. These scenarios are built from stated assumptions so the owner can see which inputs matter. MAU is the input that moves everything.

| Assumption | Conservative | Mid | Optimistic |
|---|---|---|---|
| MAU at month 12 (web plus Play) | 300 | 2,000 | 10,000 |
| How we'd get there | Word of mouth only | Steady community posts (MKT-13), import from Strong and Hevy, Play live by Q2 | One launch post that travels, plus Play featured in search |
| Founding Supporters before v1 ($19.99, about $19.11 net after Stripe) | 3 | 15 | 60 |
| Membership v1 live | from April | from March | from March |
| Paying members at month 12 (share of MAU) | 2% → 6 | 3.5% → 70 | 5% → 500 |
| Average net per payer in year 1 (mostly annual, paid upfront, mostly founding price) | $20 | $22 | $25 |
| Hosted AI and sync shipped in year 1? | No | No | Yes, Q3 |

| Year 1 (USD) | Conservative | Mid | Optimistic |
|---|---|---|---|
| Supporter pass | $57 | $287 | $1,147 |
| Membership (cash in year 1) | $120 | $1,540 | $12,500 |
| Tips beyond the pass | ~$0 | ~$50 | ~$300 |
| Coach plan and coach programs | $0 | $0 | $0 (year 2) |
| **Revenue, net of fees** | **≈ $180** | **≈ $1,880** | **≈ $13,950** |
| Known fixed costs: LLC $125, Play $25 (once) | −$150 | −$150 | −$150 |
| Server and AI | $0 | $0 | −$1,500 to −$4,000 (assumption: Q3–Q4 at ~$25–100 a month for the server, plus AI at $0.30–1.20 per member a month) |
| Not yet priced: clinician review (BIZ-15), counsel, Apple $99 a year if iOS exists | unknown | unknown | unknown |
| **Before the unknown items and tax** | **≈ +$30** | **≈ +$1,730** | **≈ +$9,800 to +$12,300** |

**For comparison only (not recommended):** adding Play-only ads at the same MAU, assuming half the users are on Play, would add roughly $600–1,900 (mid) or $3,000–10,000 (optimistic) at §1.4's rates. That assumes Play users average about a quarter of the year-end MAU across the year, because Play arrives later and the base ramps up. That's before any effect on retention or membership conversion, which we couldn't quantify.

**What the table says:**
- Year 1 is **seed money, not a salary,** in every scenario.
- The lever is **MAU** (distribution: business.md §6, marketing.md), then the **paying share** (whether the membership extras are good).
- Price matters least of the three.
- At 10k MAU, the membership's run rate going into year 2 is roughly $10,000–14,000 a year (§1.1), before the coach plan.

---

## 6. Decisions for the owner

| # | Question | Recommendation | Item |
|---|---|---|---|
| 1 | Replace "free forever on the phone, Pro only for server costs" with "everything at launch is free forever; safety never paid; a membership for **new** extras on the phone or server", and publish §3.6's paragraph at launch instead of the old one? | **Yes** | BIZ-27 (holds BIZ-18) |
| 2 | No ads, ever, confirmed with the trade-off in §1.4 in view? | **Yes, no ads** | BIZ-27 |
| 3 | A "Founding Supporter" Stripe link on the web build at launch ($19.99, a year of founding membership paid in advance, refundable)? | **Yes** | BIZ-28 |
| 4 | Membership v1 (on-device extras, offline signed licence codes sent by hand) around March 2027 on the web, then Play Billing when the Capacitor track supports it? | **Yes** | BIZ-29 |
| 5 | Prices: $5.99 a month or $39.99 a year list; $19.99 a year founding (locked); v1 sold at the founding price only; a 7-day trial only from v2; no lifetime plan at launch; the name "Membership" or "Plus"? | **Yes**; the name is your pick | BIZ-30 |
| 6 | A free membership for anyone who asks, with no proof, plus "gift a membership"? | **Yes** | BIZ-31 |
| 7 | Form the LLC before the first sale (December), and use Stripe Tax or a merchant of record before selling outside the US? | **Yes** | BIZ-32 |
| 8 | For the membership's on-device extras, drop BIZ-21's T1 (retention) and T3 (demand) triggers, keeping all six triggers for hosted AI and sync? | **Yes** | BIZ-27 |
| 9 | Express interest in Google Play Pass once the Play listing is live? | **Optional**; low effort, unknown pay | BIZ-32 |

---

## 7. Couldn't verify
- **Google Play's 2026 fees:** from Google's own blog and help page, as quoted in search results; the pages didn't load here. The settlement's court approval is described as pending.
- **Apple's Small Business Program:** Apple's page as quoted in search; the 15-day start delay comes from a third party.
- **RevenueCat figures:** the 2026 report and blog via search snippets. The health and fitness numbers are from the 2025 edition or quoted by third parties. No 2026 health and fitness breakout was found.
- **Ad eCPM and ARPDAU:** third-party ranges, mostly from games. No fitness-specific benchmark was found. Our ad income rows are assumptions on top of them.
- **Hosted-AI cost:** computed from list prices (Anthropic's price list as cached 2026-11-03) and assumed token counts. It hasn't been measured.
- **Tip-platform fees:** secondary sources. The GitHub Sponsors fee wasn't found. The Lemon Squeezy shutdown claim comes from one competitor.
- **Coaching software prices:** Capterra, G2 and competitor blogs; they conflict.
- **Amazon affiliate rates:** partial official snippets and third-party guides; they conflict.
- **Florida tax treatment of digital goods:** the sources disagree. The SaaS position is from a vendor guide citing a DOR advisement.
- **Play Pass:** payout terms aren't published, and access is "express interest" or invitation-only depending on the source.
- **Store tip rules:** Apple's come from forum threads and press, not the live guideline text. Google's donation exemption is from a policy page that may be out of date.
- **Projections (§5):** every number is an assumption, as stated.
