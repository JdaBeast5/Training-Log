# Marketing: brand, built-in virality, store and launch, experiments

Owner: marketing-manager. Written 2026-11-07 against **v3.514** (`APP_VERSION`, `index.html:7622`). Line numbers are `index.html` at v3.514. **Re-grep them before building anything.** **Updated 2026-11-07 (pre-D1 alignment) for v3.516:** the owner named the app **Liftnext** (v3.515, display name only; Chalklog was dropped the same day because several "Chalk" fitness apps exist) and chose the **"Sash"** icon (v3.516). §0.4, §2.1, §2.4, §3.4, §4.1, §4.3 and §5 reflect that. Builds on `planning/business.md` (the promise, the funnel, BIZ-01 to BIZ-16) and `planning/research.md`. `planning/design-vision.md` ("Plate & Press") owns visuals; this file owns the words and the share moments, and §2.4 aligns the two.

**Mandate (owner):** make Training Log the most viral and most successful workout tracker in the world. "Anything he sees that needs fixing and optimizing, goes."

**Ground rules this plan holds itself to:** no dark patterns, no fake scarcity, no fake social proof, no claim the code can't back up, no health or medical claims, and community rules respected. Nothing here assumes users we don't have. Every outside number carries its source.

---

## 0. The short version

1. **The streak works against the program.** It counts consecutive calendar days (`computeStreak`, 13989). The first celebration fires at 7 days in a row (`STREAK_MILESTONES`, 14008). Readiness warns "6 days without a rest day" one day earlier (`READINESS_DAYS_NO_REST = 6`, 46836). Someone following a 3–5 day plan never earns a streak card, and the only person who does has just been told to rest. **Fix: a weekly consistency streak** (MKT-01). It's the most important share moment and it matches the business north star (weekly active trainers, business.md §4).
2. **Share cards exist but aren't built for where people share.** PR, streak and week cards are 1080×1080 squares (`buildShareCardBlob`, 29510) with plain "TRAINING LOG" text and no link. Instagram and WhatsApp stories are 9:16. The week card can fall back to **average body weight** (45463), which puts a sensitive number on a public image without asking. **Fix: private-by-default card content (MKT-02) and story-format cards with the real brand mark (MKT-03).**
3. **The biggest moments have no card:** a finished session (29263), a finished training block, and a year of lifting. **Fix: session (MKT-04), block (MKT-05) and "Year in Lifting" (MKT-06) cards**, all rendered on the device.
4. **The name is decided: Liftnext** (owner, v3.515). What's left is owning it: buy `liftnext.app` and run a trademark knockout search **before the name appears on any share card** (MKT-03), and use `liftnext.app`, never the `github.io` URL, as the address on cards (§2.1, §4.3). The store title is "Liftnext: Training Log". Open risk: "NextLift", the same two words reversed, is a live 2026 App Store fitness app with a pitch close to ours (§2.1); the owner should confirm the name before cards print it.
5. **Invite links and friend challenges can work without a server.** The payload goes in the URL fragment, which browsers never send to the server. This depends on the public address (BIZ-08 / BIZ-12), so it needs the owner (MKT-10, MKT-11).

---

## 1. The product as a stranger sees it

Walked in Playwright Chromium at 402×874, scale factor 2: a fresh context, then the seeded profile (`/.taste-skill/seed3.html`). The cards were rendered by calling the real `buildShareCardBlob` in the page. The screenshots are in the session scratchpad (`scratchpad/mkt/`, not committed).

| Moment | What a stranger sees | Marketing read |
|---|---|---|
| Home-screen name and icon | "Training Log". The icon is an off-white ring with a red-orange segment around a target on a dark navy-to-maroon gradient (`icon-512.png`) | The icon is distinctive and good. The name is generic, and it says "log" while the product's edge is that it **coaches** |
| First screen | A light card on a dimmed app: small "Training Log", then "Who's training?", a name field, and a blue-to-purple "+ Create my profile" button (`userPickerOverlay`, 5701) | No promise and no reason to type a name. The blue-purple gradient matches neither the icon (red-orange), the cards (gold `#F5C518`) nor the plate colours. That's three accent systems on the first three surfaces |
| After the name | "Set up your profile below to personalize this" (BIZ-02 covers it), then a 26-set strength day (BIZ-01 covers it) | Activation is business-owned. BIZ-17 (business, ready) adds a one-line promise to this screen; marketing supplies the wording in §2.2 |
| Share: PR | A square, dark gradient with a gold glow; a trophy line icon; "NEW PR"; "Bench Press — 225 lb"; "TRAINING LOG" in small grey caps | Tasteful and on-brand for the celebration. But it's square (stories crop or letterbox it), it shows no improvement ("+10 lb" is the story), it carries no link, and the wordmark is plain text |
| Share: week | "WEEK COMPLETE" with 2–3 stat rows: workouts, program, then average sleep, **else average weight, else average intake** (45459–45464) | Body weight and intake are the most sensitive numbers in the app, and they're shown by default when sleep isn't logged |
| Share: streak | "14-DAY STREAK", "Consistency is what actually builds results." | Fires only after 7 consecutive training days. See §0.1 |
| Share fallback | With no Web Share for files, it opens the PNG in a new tab (29630) | Fine. Desktop users can save the image |
| What's New | Mostly user-facing, but some headlines are internal ("Cleaner button gradients", "More consistent glow effects", 3.92–3.93) | Voice guidance in §2.3: lead with what the person can now do |

**Since this walk (v3.515 to v3.516):** the home-screen name, title and header now say Liftnext, and the icon and header mark are the Sash. The share cards, the first-screen gradient and the What's New voice are unchanged.

**What's good and should be protected:** no console errors, no network requests on first launch, real one-tap logging, a celebration banner that already offers a share button (`triggerCelebration`, 29438) with a sensible 5-second hold, an AbortError-aware share path, and a privacy note on Progress Photos that tells the truth (6556).

---

## 2. Brand

### 2.1 The name

**The problem.** "Training Log" describes a category, so it can't be found, owned or trademarked. An App Store search for it returns Training Tracker – Gym Log, Training Tracker – Workout Log, TrainingRecord, TrainLog, Workout Log – Training Journal and StrengthLog ([search, 2026-11-07](https://apps.apple.com/app/id6752959007); [StrengthLog](https://apps.apple.com/app/apple-store/id1434229662); [TrainLog](https://appgoblin.info/apps/6779832543)). It also names the least valuable part of the product: the log. The edge is the coaching: what to lift next.

**What a good name needs here:** short (it must fit under an iPhone icon, about 12 characters), ownable in store search, a free `.app` domain, no conflict in class 9/41/42 marks as far as a search shows, and a meaning a lifter recognises.

Availability was checked on 2026-11-07. Domains: RDAP lookups through rdap.org (no record means unregistered). Store and trademark: web search only. **No USPTO or EUIPO database was queried directly, and no lawyer was consulted.**

| Option | Meaning | `.app` domain | Store conflicts found | Trademark signals | Verdict |
|---|---|---|---|---|---|
| Chalklog | Chalk is what a lifter puts on before a heavy set | `chalklog.app` available; `chalklog.com` registered 2026-06-08 | The owner found several "Chalk" fitness apps | CHALK-family marks exist | **Dropped by the owner, 2026-11-07** (before release) |
| **Liftnext** | The promise in one word: what to lift next | Re-checked 2026-11-07 (RDAP): `liftnext.app`, `liftnext.fit`, `liftnext.io`, `getliftnext.com` **available**; `liftnext.com` registered 2017-07-24 (HiChina nameservers, no website answers) | No exact "Liftnext". **But the reversed name is taken in the same category:** "NextLift" by Jordan Moffitt (released 2026-09-21, an all-in-one training, meals and recovery pitch close to ours) and "NextLift" by AutoFit LLC (2026-01-13), both Health & Fitness (iTunes Search API, re-run by marketing 2026-11-07; research.md §11 lists two more) | No LIFTNEXT record found in web search. **Crowded LIFT- family:** LIFT ([76541387](https://gleanmark.com/trademark/uspto-76541387); Lift, Inc., [portfolio](https://trademarkdir.com/owner/lift-inc)), LIFT PLUS, LIFTIX, LIFTSHIFT | **Chosen by the owner, shipped v3.515.** Clearance steps in the decision below |
| Overload (Overload Log) | Progressive overload | `overloadlog.app` available | Not checked in depth; a common word in fitness | Common word; weak | Not recommended: too generic |
| Next Set / NextSet | The next set | `nextrep.app` taken | At least four "Next Set" apps ([search](https://apps.apple.com/app/id6758898625)) | — | Rejected |
| Setwise, Barwise, Liftmark, Platecraft, Platebook | — | All registered | Setwise is a live paid app ([listing](https://apps.apple.com/mx/app/setwise-training-performance/id6757760643)) | — | Rejected |
| Iron Ledger, Lift Ledger | — | `repledger.app` registered | IronLedger and IronPulse: Lift Ledger exist ([iphoneaddict](https://iphoneaddict.fr/apps/forme-sante/ironledger-139.html)) | — | Rejected |
| Keep "Training Log" | — | `traininglog.app` registered 2026-06-06 | Many near-duplicates | Descriptive; likely unregistrable | Kept as the **descriptor** in the store title ("Liftnext: Training Log") |

**Decision (owner, 2026-11-07): Liftnext.** Shipped in v3.515 as a display name only (`APP_NAME`, `<title>`, manifest, What's New). Storage keys, cache names and the backup format keep their `training-log` names. Store title: **"Liftnext: Training Log"** (22 characters): the descriptor keeps the search phrase, and people who installed "Training Log" still recognise it.

**Owning the name, in this order (each is `needs-owner`: it costs money or is a legal step):**
1. **Domain, this week.** Buy `liftnext.app` (one registration, roughly the price of any `.app` domain; `.app` is HTTPS-only, so the registrar's forwarding must support HTTPS). Turn on WHOIS privacy. Optionally `liftnext.fit`. Don't chase `liftnext.com` (held since 2017).
2. **Point it without moving the app.** Forward `liftnext.app` with an HTTPS 301 to the current app URL (or, later, to a landing page). **Don't set a GitHub Pages custom domain on the app's repo yet:** that changes the app's origin, and `localStorage` and IndexedDB (every log and photo) don't follow an origin change. Installed copies would be stranded on the old origin. Moving the app itself is a separate owner decision with a planned export-and-import path (backup already includes photos, `index.html` ~34215).
3. **Knockout search before the name goes on a card (free, about 30 minutes):** USPTO Trademark Search (tmsearch.uspto.gov) for LIFTNEXT, LIFT NEXT, **NEXTLIFT (a pending class 28 filing is reported, serial 98603476, research.md §11; check TSDR)** and live LIFT- marks in classes 9 (downloadable software), 41 (fitness instruction) and 42 (non-downloadable software); EUIPO eSearch and the WIPO Global Brand Database for the same. Search the App Store and Play on a phone (web search isn't the stores' own search). Record the result here.
4. **Before the store listing (BIZ-12):** decide whether to file. USPTO charges per class (check the current fee schedule on uspto.gov); class 9 first. An attorney clearance opinion is worth it if the knockout search shows any live LIFT- mark for fitness software. This plan is not legal advice.

**Open risk (raised at the pre-D1 alignment, 2026-11-07):** a reversed-word name in the same category with near-identical positioning is the closer collision. A friend who hears "Liftnext" and searches "next lift" lands on NextLift. That leaks exactly the word-of-mouth the share cards exist to create. Marketing's recommendation: the owner confirms or re-picks the name **before MKT-03 merges**; until then cards carry the Sash mark only, with no wordmark. If he re-picks, the next name round adds both word orders to the store search.

**Name rules (Liftnext reads as an instruction):**
- Always one word, capital L only: **Liftnext**. Never "LiftNext", "Lift Next" or "lift next" as the name.
- In caps (event band, card footer), the wordmark always sits **beside the Sash mark**, never alone, so it reads as a brand, not an imperative.
- Never set the wordmark directly above or before a load or a lift ("LIFTNEXT 165 LB" reads as "lift next: 165 lb"). On a bib, the big figure is the training-day number ("No. 47"), never a weight.
- Use the pun once, on purpose: the subtitle "Know what to lift next". Don't stack it with the name in the same line on cards.

### 2.2 The one-line promise

Business.md §1 wrote the promise. Every clause is true at v3.514, so marketing keeps it and adds shorter cuts for each surface:

- **Full (README, landing page, store long description, first paragraph):** "Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone."
- **Tagline (store subtitle, 30 characters):** "Lift what's next. Log in a tap." (31; use "Know what to lift next" at 22 if the store counts strictly.)
- **First screen (wording for BIZ-17):** the full promise above is right. If it wraps past three lines at 402 px, use the shorter cut "Your training plan and logbook. Free, no ads, and your logs stay on your phone." It keeps BIZ-17's test phrase.
- **Share-card footer:** the wordmark plus the address (BIZ-08), nothing else.

**Words to avoid** (truth and health-claim rules):
- "Safe", "injury-free", "rehab", "prevents", "treats" in any public copy. The clinical programs exist, but advertising them is a health claim (BIZ-15).
- "AI coach" as a headline. It needs your own key (BIZ-06, BIZ-07).
- "Science-based" on its own. Say "programs built on published research, with the sources shown in the app". That's checkable (`content-citations.js`).
- Competitor names in store copy (third-party trademarks; MKT-12).
- "Proven" stays only in the sentence business.md wrote, which refers to established programs. Never "proven results".

### 2.3 Voice

A good coach in a quiet gym: specific, short, a little dry, never shouty.

- **Numbers over adjectives.** "+10 lb on your squat since September", not "Amazing progress!!".
- **Second person, present tense.** "You trained 3 times this week."
- **Celebrate the work, not the body.** Cards talk about sets, weeks and lifts, never body weight or appearance unless the person explicitly chooses to.
- **Honest about limits.** "Estimate", "your own key", "on this phone".
- **No guilt.** Rest days are part of the plan. Nothing says "Don't break your streak!" or "You're falling behind."
- **What's New:** lead with what the person can now do, in one line. Purely internal changes (gradients, refactors) get grouped under "Polish and fixes", not a headline of their own.

### 2.4 Visual identity (aligned with `planning/design-vision.md`)

The design-engineer's vision ("Plate & Press", design-vision.md §3) landed while this file was being written, and it owns visuals. Today there are three unrelated accents: the icon's red-orange segment, the cards' gold `#F5C518` with a radial glow, and the first screen's blue-to-purple gradient. The vision retires the gradients, the glow and the violet. Marketing's brand rules, consistent with it:

- **The mark (superseded 2026-11-07):** the owner chose **"Sash"** (v3.516): the five plate inks as one band, on its own ink tile (`tools/design/icon/option-b.svg`; the header mark at `index.html` ~489 notes the sash only reads inside its square). This settles MKT-19. On cards, draw the **tile with the sash**, not the bare sash, beside the Liftnext wordmark. The ring mark is retired. Cards today still print "TRAINING LOG" (`buildShareCardBlob`, `index.html:29608`) and save as `training-log.png` (29623); MKT-03 replaces both.
- **Ground:** flat neutral ink (`#0C0C0D`) in dark, chalk paper (`#F3F3F1`) in light, with no gradients (design-vision §3.2). Share cards use the dark ground.
- **Colour on cards = the day's spot ink** (the plate colour of the session's day), the same rule the vision applies to the PR flood. Gold retires with the glow. A block or year card, which spans days, uses ink-grey with the week strip in plate colours as data.
- **Type:** Archivo condensed for the big figure and headline if the owner approves the font file (the vision's UX-02), otherwise Geist; Geist for everything else; tabular figures.
- **Name fit:** with Chalklog gone, nothing in the name ties a bib to lifting (design-directions §6.4 Q3 relied on "chalk" for that). The lifting signal must now come from the **Sash's plate inks and the loaded bar on the bib**; the bar is mandatory on the session bib, not decoration (§3.4).

---

## 3. Virality built into the product

### 3.1 What drives sharing in fitness apps (evidence)

- **Annual recaps are the single biggest share event in consumer apps.** Spotify reports Wrapped 2025 reached 200 million engaged users and 500 million shares in its first ~24 hours, up 41% year on year ([Music Business Worldwide](https://www.musicbusinessworldwide.com/spotify-wrapped-campaign-hit-200m-engaged-users-in-24-hours-a-19-yoy-increase); company-reported). Strava runs the fitness version, "Year in Sport", every December for its roughly 180 million members ([Athletech News](https://athletechnews.com/running-walking-strength-training-strava-year-in-sport-report/)). No share count was found for Strava's recap.
- **Social comparison beats social support for getting people to exercise.** In a randomized trial with 790 students, class attendance was 90% higher in the social-comparison arms than in the arms without comparison. Support networks alone did no better than control ([Zhang et al., Preventive Medicine Reports 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5008041/)). Friend challenges should therefore show **comparison** (who did more), opt-in, and not a feed.
- **Streaks retain, through loss aversion, but the unit has to fit the activity.** Duolingo reports learners with a 7-day streak are 2.4× more likely to come back the next day ([Duolingo blog](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals); company-reported, correlational). Language practice is daily. Lifting isn't: rest days are prescribed. A daily streak in a lifting app rewards skipping rest, so ours must count weeks.
- **People share achievement, not logs.** Spotify and Strava share summaries, never raw history. Every card below is a summary the person chooses to send.
- **Social feeds are a complaint, not a draw, for lifters** (Hevy's feed can't be turned off; research.md §4). So: **share cards out to the networks people already use**, and no in-app feed.

### 3.2 Principles for every share moment

1. **Private by default.** Nothing is ever shared automatically. Every card is rendered on the device with `<canvas>` and leaves only through the system share sheet (`navigator.share({files})`) the person taps. The fallback opens the image to save (existing code at 29630).
2. **No body data on a card unless the person turns it on per card:** no body weight, intake, sleep, heart rate, cycle, pain or condition. Clinical programs (`MEDICAL_STYLES`) never get a share button on their celebrations.
3. **One tap from the celebration**, never a modal that blocks logging. The banner's share button already works this way.
4. **Story format first:** 1080×1920, with the key content kept out of the top 250 px and bottom 300 px, where Instagram and WhatsApp draw their own UI. The square stays available for messages.
5. **Every card carries the mark and, once BIZ-08 is approved, the address.** That's the referral loop.
6. **Brag about progress, not volume for its own sake.** "+10 lb" beats "225 lb", because it's the story and it's less identifying.

### 3.3 The moments

| # | Moment | Trigger (existing code) | What the card shows | Render | Privacy cost | Item |
|---|---|---|---|---|---|---|
| 1 | **PR** | `result.isPR` in `saveExSet` → `triggerCelebration('trophy', …)` (31988) | "NEW PR", the exercise, the new best, and the **gain over the previous best** ("+10 lb · was 215 lb") | Existing `buildShareCardBlob`, story format | Shows a lift weight, which the person chose to share. No body data | MKT-03, MKT-07 |
| 2 | **Session complete** | `triggerCelebration('flag', 'Session complete!', …)` (29263), which has no share today | Day label ("Upper · Strength"), sets done, total load lifted, duration if timed, and any PRs that session | Same function, stats layout | Training numbers only | MKT-04 |
| 3 | **Consistency** | Today: 7/14/30… consecutive days. Proposed: **weeks in a row** with at least max(2, planned days − 1) sessions, or 2 when no plan is set (the business north-star floor) | "8 WEEKS IN A ROW", a 12-week strip of filled squares, "Rest days included" | Same function, with a week-strip drawn in canvas | None beyond training frequency | MKT-01 |
| 4 | **Week complete** | `archiveCurrentWeek` share (45471) | Workouts, program, and **total sets or PRs this week** in place of weight/intake | Existing | Today: body weight or intake can appear by default. After MKT-02: none | MKT-02 |
| 5 | **Block / program complete** | The last week of a mesocycle (`cycleWeekOf` returns the final week) is archived; the rehab and postpartum "graduation" celebrations (15590, 15921) stay **without** a share button | Program name, "Block complete: 5 weeks", sessions done out of planned, and the top 3 lift gains for the block | Same function, stats layout | Training numbers only. Clinical programs excluded | MKT-05 |
| 6 | **Year in Lifting** (a "Wrapped") | From 1 December to 15 January, a row in Today's Priorities and an entry in History opens it. Only with at least 8 sessions logged that year | A sequence of 4–5 story cards: sessions and weeks trained; total sets and load lifted; biggest gain (lift and amount); most-trained muscle group; best consistency run. The person picks which to share | On-device from `activity-dates`, `week-archive` and `reconstructAllPRs` (41641). Nothing is computed on a server | Training numbers only. Body weight never appears | MKT-06 |
| 7 | **Progress, before and after** | A "Show progress" action on any lift's history | "Squat e1RM: 225 → 275 lb in 12 weeks" with a sparkline | Canvas, stats layout plus a line | Training numbers only | MKT-07 |
| 8 | **Progress photos, side by side** | Only from inside Progress Photos (6543), and never suggested | The two photos the person picks, with their dates, side by side. No numbers | Canvas compositing on the device. **Nothing is sent** (unlike "Compare with AI") | High: body images. Strictly opt-in, no nudges, no default watermark beyond the small mark | MKT-08 |
| 9 | **Share a program** | "Share this program" on a custom program | A link that opens the app with the program ready to preview and import | Program JSON, compressed and base64url-encoded into the URL **fragment** (`#p=…`), which is never sent to the server. The existing `launchViewFromUrl` (40172) shows the URL-handling pattern | Low: it's a program, not a log. But a URL payload is an input to validate (security review) | MKT-10 (needs-owner) |
| 10 | **Friend challenge** | "Challenge a friend" from the consistency card | A link: "Train 3×/week for 4 weeks, starting Monday". Each person tracks it locally; at the end, each one shares a result card, and the comparison happens in the chat they already use | Fragment link as in #9; no leaderboard server | Low: the challenge spec only. No one's data leaves their phone unless they share their own result card | MKT-11 (needs-owner) |

**What not to build:** a public profile, a feed, likes, contact-book import, "X people are training now" counters (fake social proof without a server), or notifications that guilt someone about a broken streak.

### 3.4 The bib under the Liftnext name (MKT-16 to MKT-18; added 2026-11-07)

The owner chose the race bib as the story card (pitch.md, "Owner's answers"). With the name now Liftnext:
- **Event band:** one tracked-caps line, as on a real bib: **[Sash tile] LIFTNEXT · STRENGTH & SIZE · WK 3**. The name takes the event slot (the owner's suggestion), framed by the mark so it reads as the event's name. Program and week follow in the same line (design-directions §2.3 allows one tracked-caps line). If it doesn't fit at 1080 px, program and week drop to a sentence-case line under the band; the name and mark stay in the band.
- **Sponsor strip** (the bib's foot): the address only, once there is one (BIZ-08). The name appears once per card, not twice.
- **The big figure** is "No. 47" (MKT-17), never a load, so the band never reads "lift next: 160".
- **The loaded bar is mandatory** whenever the lead lift is a barbell lift: it's what says "lifting, not running" now that "chalk" is gone. For days with no barbell lift, the bib shows the lead lift's top set line in its place; no invented bar.
- **"Year in Lifting"** stays the recap's name: descriptive, and not Spotify's "Wrapped" or Strava's "Year in Sport". The "wall of bibs" is for the 2027 recap: MKT-06b ships mid-December, before MKT-16 exists in the roadmap.

---

## 4. Store and launch

The store listing waits on the owner's go-public decision (BIZ-12) and the Capacitor build (owned elsewhere). This is the copy and storyboard ready for that day.

### 4.1 Listing copy (draft)

Uses the owner's name, Liftnext (v3.515).

- **App name (30):** Liftnext: Training Log
- **Subtitle (App Store, 30):** Know what to lift next
- **Short description (Play, 80):** Proven programs, one-tap logging and progression. Free, no ads, no account.
- **Promotional text (App Store, 170):** Pick a program and Liftnext tells you the weight and reps for every set, and when to add more. One tap logs it. Free, with no ads and no account.
- **Keywords (App Store, 100):** `workout,gym,log,lifting,strength,program,progressive overload,weightlifting,tracker,powerlifting,5x5`. Check the length, and drop any that are another company's mark.
- **Long description (both):**
  > Liftnext is a training plan and a logbook in one. Pick from 25 programs built on published research, and every set comes with a target weight and reps. Log it with one tap. When you've earned it, Liftnext adds weight; when you're stalling, it tells you, and it schedules deloads on its own.
  >
  > • Programs for strength, size, powerlifting, home training and more, with the sources shown in the app
  > • One-tap set logging, plate maths, warm-up sets and a rest timer
  > • Progression and deloads, free
  > • PRs, weekly consistency and training trends
  > • Food logging with free barcode lookup (USDA and Open Food Facts)
  > • Optional AI features with your own Anthropic key
  >
  > No ads. No account. Your logs stay on your phone. Export them any time.

  Every line must be re-checked against the shipped build before listing: "25 programs" (count `programs` keys, as BIZ-07 does) and "export" (BL-22 adds CSV; JSON export exists at 6248).

### 4.2 Screenshot storyboard (6 frames, 1290×2796 for iPhone, plus Play's 1080×1920)

Real screens from the seeded profile with one caption line each, set in the brand's ground and type. No fake reviews or ratings, and no device mock-ups showing other brands.

1. **"Know what to lift next."** Today with the workout card leading: the target weight and reps on each set chip.
2. **"One tap per set."** The set chips mid-session, with the next chip offering the progressed load.
3. **"It adds weight when you've earned it."** The progression note after a strong session.
4. **"25 programs, sources included."** The program picker with a cited `basis` line visible.
5. **"See every PR and every week."** Analysis trends, plus the consistency strip.
6. **"Free. No ads. No account."** The share card on a phone's story screen, with "Your logs stay on your phone" underneath.

**Tooling:** the `app-store-screenshots` skill mentioned in the UI/UX guide could automate frames and captions. **Recommend it to the skills-orchestrator for vetting** (licence, pinned version, any network or install calls) rather than installing it. Until then, Playwright at 430×932 ×3 produces 1290×2796 captures directly.

### 4.3 Launch plan

All public posting needs the owner (MKT-13): it publishes under his name and commits to a public address.

**Sequencing rule (added 2026-11-07): nothing points strangers at the app before there's an address that will never change, and nothing carries an address before a stranger can succeed there.**
- **Before MKT-03 merges (roadmap build 11):** the owner has confirmed the name against NextLift, `liftnext.app` is bought, and the knockout search is done (§2.1, steps 1 and 3). If any of the three is missing at build time, MKT-03 ships with the Sash mark and no wordmark, and the wordmark follows in its own version. MKT-03 puts the Liftnext wordmark on every card; it must not advertise a name we don't hold the domain for.
- **The card address (BIZ-08) is `liftnext.app`, never the `github.io` URL.** Shared images can't be edited later, and the `github.io` URL carries the old repo name and the owner's GitHub handle.
- **BIZ-08 stays behind the Phase 3 gate** (roadmap Phase 5). So the December 2026 Year in Lifting cards (MKT-06a/b) carry the name and mark but **no address**. That's deliberate: strangers shouldn't land on a first launch that BIZ-01 to BIZ-03 and BIZ-17 haven't fixed. December 2026 is a dogfood run with the owner and friends; the public recap moment is December 2027.
- **No launch post (MKT-13) before** `liftnext.app` resolves to a page that installs (MKT-14 or the README), the privacy page (BIZ-16) is live, and the Phase 3 gate holds.
- **Program links and challenges (MKT-10, MKT-11)** are built on `PUBLIC_APP_URL`, so they come after BIZ-08, as the owner already said (D9).

| Step | Where | How, inside the rules |
|---|---|---|
| 0. Ready | `liftnext.app` owned and forwarding (§2.1); README as the landing page (BIZ-07), privacy page (BIZ-16), share links (BIZ-08), the first-launch fixes (BIZ-01 to BIZ-03) | Don't launch before the first-launch fixes. A stranger's first session is the launch |
| 1. Soft launch | Friends who lift: 10–20 people, using the app for 4 weeks | Ask them in person what confused them. That's the only "analytics" (§5) |
| 2. Communities | **r/Fitness:** only in "Self-Promotion Saturday" or the monthly apps thread; the rules wiki says posting your own content without asking the moderators first gets a permanent ban ([r/Fitness rules mirror](https://reddit.rtrace.io/r/Fitness/wiki/intro), unofficial copy; check the live sidebar). **r/weightlifting** has a "Self Promotional Saturday" ([mirror](https://lr.psf.lt/r/weightlifting/comments/1ipwpsd/self_promotional_saturday)). **r/xxfitness** has a biweekly self-promotion thread ([mirror](https://lr.sudovanilla.org/r/xxfitness/comments/1frpacj/biweekly_self_promotion_thread_sell_yourself_and)). **r/PWA**, **r/SideProject** and **r/webdev** for the no-build-step single-file story | Disclose that you made it, every time. Post in the designated thread only. Answer questions; don't cross-post the same text. Read each sidebar on the day: these rules were checked through unofficial mirrors |
| 3. Product Hunt | One launch, on a Tuesday–Thursday | Lead with "free, no ads, no account, your data stays on your phone". No upvote requests to friends (it breaks PH's rules and it's fake social proof) |
| 4. Creators | Evidence-based strength and nutrition creators who already criticise paywalled basics | Offer nothing but the app and a short note. No paid placements (that costs money: needs the owner). If someone reviews it, ask that they disclose any relationship (FTC endorsement rules) |
| 5. December | "Year in Lifting" (MKT-06) | The yearly recurring launch moment, if MKT-06 ships by 1 December |

### 4.4 Search and the landing page

- **Today the README is the landing page** (BIZ-07 owns its facts). Marketing's copy for it: the promise, three screenshots, "Open it in Safari → Share → Add to Home Screen", and the privacy facts.
- **A real landing page** (one static `about.html`, or the Pages root with the app at `/app/`) is a structural change to a single-file app, so it needs the owner (MKT-14). Recommendation: one static file, no framework, no analytics, no web fonts beyond the self-hosted ones.
- **Target searches** (proposed, not measured): "free workout tracker no ads", "workout log app no account", "progressive overload app free", "5x5 tracker free", "workout app offline". Pages that name competitors ("Strong alternative") use third-party marks: needs the owner (MKT-12).
- **On-page:** a meta description and OG tags (BIZ-07), an OG image made from a share card (1200×630), and `SoftwareApplication` structured data with `"offers": {"price": "0"}`. Don't mark up ratings we don't have.

### 4.5 Content calendar (first 8 weeks after go-public)

Low effort, made from the app itself. One post a week where the owner already has a presence; nothing automated.

| Week | Theme | Asset |
|---|---|---|
| 1 | "What to lift next": the promise | Screenshot frame 1, plus a 15-second screen recording of logging a set |
| 2 | Free progression, explained | A short post on double progression with the in-app source |
| 3 | Rest days count | The weekly consistency card (MKT-01) |
| 4 | Your data stays on your phone | The privacy page (BIZ-16) in plain words |
| 5 | A program deep-dive | One program's `basis` and citations |
| 6 | Deloads | Why the app schedules them, with the source |
| 7 | Plate maths and warm-ups | Screen recording |
| 8 | Block complete | The block card (MKT-05) from the owner's own training |
| December | Year in Lifting | MKT-06 cards from the owner's own year |

---

## 5. Growth experiments

**No analytics, and none to be added without the owner.** Every measurement below uses either (a) the store consoles' aggregate numbers after a store launch (installs, retention, referrer), (b) the on-device first-month row (BIZ-09) read by testers and reported by hand, or (c) an opt-in "How did you hear about us?" asked once, kept on the device and shown in Diagnostics, never sent. Adding any counting that leaves the device is `needs-owner` (MKT-15).

| # | Hypothesis | Change | Metric | How to measure without tracking |
|---|---|---|---|---|
| E1 | A weekly streak gets more people a first consistency card than a daily one | MKT-01 | Share of testers who reach a 4-week milestone vs. a 7-day one in their first 6 weeks | BIZ-09's diagnostics row extended with "consistency milestone reached: date" (on device), read by testers |
| E2 | Story-format cards get shared more than squares | MKT-03 | Testers' self-reported shares per milestone | Ask soft-launch testers. After the store launch, store-console referrals from share links |
| E3 | A link on the card brings installs | BIZ-08 | Store-console installs from web referrals; GitHub Pages has no analytics | Store consoles only. Optionally `?ref=card` in the URL, stripped on load and never stored (needs the owner because it's attribution: MKT-15) |
| E4 | A Year in Lifting recap brings back lapsed users in December | MKT-06 | Store-console weekly actives in December vs. November | Store consoles (aggregate) |
| E5 | A promise line on the first screen raises profile creation | BIZ-17 (business) | Testers who create a profile vs. close the app | Moderated tests with 5–10 strangers: watch, don't count |
| E6 | "Liftnext" is remembered and spelled right | MKT-09 (shipped v3.515) | Can a tester name the app a week later, and type it as one word into a search box? | Ask them. Cheap, honest, no data |

---

## 6. Backlog items

Appended to `planning/backlog.md` under "Marketing (MKT)". Ready items first, in suggested build order:

- **Ready:** MKT-01 weekly consistency streak; MKT-02 no body data on share cards by default; MKT-03 story-format cards with the brand mark; MKT-04 session-complete card; MKT-05 block-complete card; MKT-06 Year in Lifting; MKT-07 PR and progress cards show the gain; MKT-08 side-by-side progress photos on device.
- **Bib (owner-approved design, 2026-11-07):** MKT-16 session bib, MKT-17 "Your number", MKT-18 pin it on a photo. Not yet placed in `roadmap.md`.
- **Settled by the owner:** MKT-09 the name (Liftnext, v3.515; domain and trademark steps still open, §2.1); MKT-19 the mark (Sash icon, v3.516; the card mark folds into MKT-03).
- **Needs owner:** MKT-10 share a program by link; MKT-11 friend challenges by link; MKT-12 competitor names in copy and pages; MKT-13 public launch posts and creator outreach; MKT-14 a landing page file; MKT-15 any referral attribution.

BIZ-08 (the address on cards) is the prerequisite for the referral value of every card. MKT items don't duplicate it: MKT-03 leaves a footer slot for it.

---

## 7. Couldn't verify

- **Trademarks:** web search only; USPTO and EUIPO weren't queried directly. No LIFTNEXT record turned up (2026-11-07), but several live LIFT- marks exist in classes not checked.
- **Domains:** RDAP through rdap.org on 2026-11-07. A domain can be registered between now and purchase.
- **App Store searches:** web search, not the store's own search, which ranks differently by country.
- **Reddit rules:** read through unofficial mirrors; they may be out of date.
- **Spotify and Duolingo figures:** company-reported, and correlational where they concern retention.
- **Story safe zones (top 250 px, bottom 300 px):** common design guidance, not an Instagram specification.
- **Rendering:** cards were rendered in Chromium, not iOS Safari. The share sheet with files is unverified on an iPhone.

## Sources

- [Music Business Worldwide: Spotify Wrapped 2025, 200M engaged users in 24 hours](https://www.musicbusinessworldwide.com/spotify-wrapped-campaign-hit-200m-engaged-users-in-24-hours-a-19-yoy-increase)
- [IBTimes: Wrapped 2025, 500M shares in a day](https://www.ibtimes.co.uk/record-breaking-spotify-wrapped-2025-sees-200m-engage-500m-shares-day-1760640)
- [Athletech News: Strava Year in Sport report](https://athletechnews.com/running-walking-strength-training-strava-year-in-sport-report/)
- [Zhang et al. 2016, "Support or competition?", Preventive Medicine Reports (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5008041/)
- [Duolingo: how streaks keep learners committed](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals)
- [Duolingo: improving the streak](https://blog.duolingo.com/improving-the-streak)
- App Store listings: [Training Tracker – Gym Log](https://apps.apple.com/app/id6752959007), [StrengthLog](https://apps.apple.com/app/apple-store/id1434229662), [Setwise](https://apps.apple.com/mx/app/setwise-training-performance/id6757760643), [NextSet](https://apps.apple.com/app/id6758898625), [Lift Notes](https://apps.apple.com/us/app/id6753324391), [TrainLog](https://appgoblin.info/apps/6779832543), [IronLedger](https://iphoneaddict.fr/apps/forme-sante/ironledger-139.html), [Liftlog](https://alternativeto.net/software/liftlog-liam-morrow/)
- Trademark search results: [LIFTLOG 99587187](https://markinton.com/trademark/liftlog-99587187), [CHALK 97310379](https://markinton.com/trademark/chalk-97310379), [CHALKOLOGY](https://gleanmark.com/trademark/uspto-88065562), [LIFT 76541387](https://gleanmark.com/trademark/uspto-76541387), [Lift, Inc. portfolio](https://trademarkdir.com/owner/lift-inc), [LIFT PLUS](https://www.trademarkelite.com/trademark/trademark-detail/86284598/LIFT-PLUS), [LIFTIX](https://markinton.com/trademark/liftix-98948850), [LIFTSHIFT](https://trademarkdir.com/trademark/liftshift-99462736)
- Liftnext store search (web, 2026-11-07), nearest names only: [LiftUp](https://apps.apple.com/app/id6760911569), [LiftXP](https://mwm.ai/apps/liftxp-ranked-gym-tracker/6791541944), [Liftz](https://www.producthunt.com/p/liftz-your-gym-buddy/liftz)
- Reddit rules (unofficial mirrors): [r/Fitness](https://reddit.rtrace.io/r/Fitness/wiki/intro), [r/weightlifting](https://lr.psf.lt/r/weightlifting/comments/1ipwpsd/self_promotional_saturday), [r/xxfitness](https://lr.sudovanilla.org/r/xxfitness/comments/1frpacj/biweekly_self_promotion_thread_sell_yourself_and)
