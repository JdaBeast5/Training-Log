# Marketing: brand, built-in virality, store and launch, experiments

Owner: marketing-manager. Written 2026-11-07 against **v3.514**. **§0 and §1 line numbers re-pinned 2026-11-08 to v3.524** (`APP_VERSION`, `index.html:7625`); later sections may still carry v3.514 numbers. **Re-grep them before building anything.** **Updated 2026-11-08 (live v3.523):** the app is **Platestep** (owner, 2026-11-07, from `planning/naming.md`; shipped as v3.517, display name only), with the **"Sash"** icon (v3.516). The owner confirmed the name on 2026-11-08 (USPTO knockout clear) and holds `platestep.app` and `platestep.com`. The store copy now lives in `planning/store/` and the launch copy in `planning/launch-copy/`; the owner's decisions are in `pitch.md`, "Owner's answers". §0.4, §2.1, §2.2, §2.4, §3.3, §3.4, §4, §5 and §6 reflect that. The name history: Chalklog, then Liftnext, both dropped (§2.1). Builds on `planning/business.md` (the promise, the funnel, BIZ-01 to BIZ-16) and `planning/research.md`. `planning/design-vision.md` ("Plate & Press") owns visuals; this file owns the words and the share moments, and §2.4 aligns the two.

**Mandate (owner):** make Training Log the most viral and most successful workout tracker in the world. "Anything he sees that needs fixing and optimizing, goes."

**Ground rules this plan holds itself to:** no dark patterns, no fake scarcity, no fake social proof, no claim the code can't back up, no health or medical claims, and community rules respected. Nothing here assumes users we don't have. Every outside number carries its source.

---

## 0. The short version

1. **The streak works against the program.** It counts consecutive calendar days (`computeStreak`, 14030). The first celebration fires at 7 days in a row (`STREAK_MILESTONES`, 14049). Readiness warns "6 days without a rest day" one day earlier (`READINESS_DAYS_NO_REST = 6`, 47110). Someone following a 3–5 day plan never earns a streak card, and the only person who does has just been told to rest. **Fix: a weekly consistency streak** (MKT-01). It's the most important share moment and it matches the business north star (weekly active trainers, business.md §4).
2. **Share cards exist but aren't built for where people share.** PR, streak and week cards are 1080×1080 squares (`buildShareCardBlob`, 29694) with plain "TRAINING LOG" text and no link. Instagram and WhatsApp stories are 9:16. The week card can fall back to **average body weight** (45737), which puts a sensitive number on a public image without asking. **Fix: private-by-default card content (MKT-02) and story-format cards with the real brand mark (MKT-03).**
3. **The biggest moments have no card:** a finished session (29447), a finished training block, and a year of lifting. **Fix: session (MKT-04), block (MKT-05) and "Year in Lifting" (MKT-06) cards**, all rendered on the device.
4. **The name is decided: Platestep** (owner, 2026-11-07; shipped v3.517; confirmed 2026-11-08 after a clear USPTO knockout). The owner holds `platestep.app` and `platestep.com`. They forward to the app only when the owner asks, and are never set as a GitHub Pages custom domain (§2.1). The wordmark can now go on cards (MKT-03b, after MKT-03). The address on cards (BIZ-08) will be `platestep.app`, never the `github.io` URL (§4.3). Store copy: `planning/store/`.
5. **Invite links and friend challenges can work without a server.** The payload goes in the URL fragment, which browsers never send to the server. This depends on the public address (BIZ-08), so the owner approved both for after BIZ-08 ships (MKT-10, MKT-11; 2026-11-08).

---

## 1. The product as a stranger sees it

Walked in Playwright Chromium at 402×874, scale factor 2: a fresh context, then the seeded profile (`/.taste-skill/seed3.html`). The cards were rendered by calling the real `buildShareCardBlob` in the page. The screenshots are in the session scratchpad (`scratchpad/mkt/`, not committed).

| Moment | What a stranger sees | Marketing read |
|---|---|---|
| Home-screen name and icon | "Training Log". The icon is an off-white ring with a red-orange segment around a target on a dark navy-to-maroon gradient (`icon-512.png`) | The icon is distinctive and good. The name is generic, and it says "log" while the product's edge is that it **coaches** |
| First screen | A light card on a dimmed app: small "Training Log", then "Who's training?", a name field, and a blue-to-purple "+ Create my profile" button (`userPickerOverlay`, 5703) | No promise and no reason to type a name. The blue-purple gradient matches neither the icon (red-orange), the cards (gold `#F5C518`) nor the plate colours. That's three accent systems on the first three surfaces |
| After the name | "Set up your profile below to personalize this" (BIZ-02 covers it), then a 26-set strength day (BIZ-01 covers it) | Activation is business-owned. BIZ-17 (business, ready) adds a one-line promise to this screen; marketing supplies the wording in §2.2 |
| Share: PR | A square, dark gradient with a gold glow; a trophy line icon; "NEW PR"; "Bench Press — 225 lb"; "TRAINING LOG" in small grey caps | Tasteful and on-brand for the celebration. But it's square (stories crop or letterbox it), it shows no improvement ("+10 lb" is the story), it carries no link, and the wordmark is plain text |
| Share: week | "WEEK COMPLETE" with 2–3 stat rows: workouts, program, then average sleep, **else average weight, else average intake** (45733–45738) | Body weight and intake are the most sensitive numbers in the app, and they're shown by default when sleep isn't logged |
| Share: streak | "14-DAY STREAK", "Consistency is what actually builds results." | Fires only after 7 consecutive training days. See §0.1 |
| Share fallback | With no Web Share for files, it opens the PNG in a new tab (29814) | Fine. Desktop users can save the image |
| What's New | Mostly user-facing, but some headlines are internal ("Cleaner button gradients", "More consistent glow effects", 3.92–3.93) | Voice guidance in §2.3: lead with what the person can now do |

**Since this walk (v3.515 to v3.517):** the home-screen name, title and header said Liftnext in v3.515–v3.516 and say **Platestep** from v3.517; the icon and header mark are the Sash (v3.516). The share cards, the first-screen gradient and the What's New voice were unchanged at that point (re-check against the live build: MKT-03 and later items change the cards).

**What's good and should be protected:** no console errors, no network requests on first launch, real one-tap logging, a celebration banner that already offers a share button (`triggerCelebration`, 29622) with a sensible 5-second hold, an AbortError-aware share path, and a privacy note on Progress Photos that tells the truth (6559).

---

## 2. Brand

### 2.1 The name

**The problem.** "Training Log" describes a category, so it can't be found, owned or trademarked. An App Store search for it returns Training Tracker – Gym Log, Training Tracker – Workout Log, TrainingRecord, TrainLog, Workout Log – Training Journal and StrengthLog ([search, 2026-11-07](https://apps.apple.com/app/id6752959007); [StrengthLog](https://apps.apple.com/app/apple-store/id1434229662); [TrainLog](https://appgoblin.info/apps/6779832543)). It also names the least valuable part of the product: the log. The edge is the coaching: what to lift next.

**What a good name needs here:** short (it must fit under an iPhone icon, about 12 characters), ownable in store search, a free `.app` domain, no conflict in class 9/41/42 marks as far as a search shows, and a meaning a lifter recognises.

**How the name was chosen (three rounds, 2026-11-07).** Availability for the first two rounds was checked through rdap.org and web search; the third round, `planning/naming.md`, used the registries' own RDAP servers and Apple's iTunes Search API. No round queried USPTO or EUIPO directly, and no lawyer was consulted; the owner reports a clear USPTO knockout for Platestep (below).

| Round | Name | Outcome | Why |
|---|---|---|---|
| 1 | Chalklog | **Dropped by the owner, 2026-11-07** (before release) | The owner found several "Chalk" fitness apps, and CHALK-family marks exist. `chalklog.com` was registered 2026-06-08 |
| 2 | Liftnext | Shipped as v3.515–v3.516 (display name only), then **dropped** | The reversed name was taken in the same category: four App Store fitness apps called "NextLift" or "Next Lifting", one (Jordan Moffitt, 2026-09-21) with nearly our pitch, and a NEXTLIFT filing reported pending (research.md §11). A friend who searched "next lift" would land on a competitor. `liftnext.com` was held since 2017, the LIFT- mark family is crowded, and in caps the name read as an instruction ("LIFTNEXT 165 LB") |
| 3 | **Platestep** | **Chosen by the owner, 2026-11-07; shipped v3.517; confirmed 2026-11-08** | `naming.md` screened 128 candidates. Platestep was the only one with both `platestep.app` and `platestep.com` unregistered that also passed every other test: no App Store, developer, Play, trademark-aggregator or open-web hit, 9 characters, spelled as heard, and no negative meaning in ES, FR, DE or PT (naming.md §3.1, §4). Runner-up: Plateward (its `.com` was taken) |

Other names from the first round, kept for the record: Overload Log (too generic), Next Set (four apps), Setwise, Barwise, Liftmark, Platecraft, Platebook (all registered; Setwise is a live app), Iron Ledger and Lift Ledger (live apps). Keeping "Training Log" was rejected as the name: `traininglog.app` was registered 2026-06-06, there are many near-duplicates, and it's likely unregistrable.

**What the name says.** Progress one plate at a time: the plate is the brand's whole visual system (the Sash is five plates' inks, and the day's spot ink is the day's plate), and the step is the product's promise, an honest, earned next increment (naming.md §4). It's a noun, so on a bib it reads as the event's name, not an instruction, which fixes Liftnext's problem.

**Decision (owner, 2026-11-07, second round of answers): Platestep.** Shipped in v3.517 as a display name only (`APP_NAME`, `<title>`, manifest, `apple-mobile-web-app-title`, What's New). Storage keys, cache names and the backup format keep their `training-log` names (`test-app-rename.js`). **Confirmed 2026-11-08** (fourth round, "name a"): the owner reports the USPTO knockout is clear, so MKT-03b (the wordmark on cards) is ready after MKT-03. Store title: see §4.1 (`planning/store/` chose "Platestep: Strength Training").

**Owning the name, where it stands:**
1. **Domains: held.** The owner holds `platestep.app` and `platestep.com` (CLAUDE.md, 2026-11-08). `platestep.fit` and `.io` were optional and aren't recorded as bought.
2. **Forward only, and only when the owner asks.** When asked, forward with an HTTPS 301 to the app's current address (or later to a landing page). **Never set either domain as a GitHub Pages custom domain** on the app's repo: that changes the app's origin, and `localStorage` and IndexedDB (every log and photo) don't follow an origin change, so installed copies would open empty. The owner chose "forward" (BIZ-25 parked, 2026-11-08): the app's origin doesn't move; revisit at the store launch.
3. **Knockout search: done by the owner** (reported clear, 2026-11-08). Marketing hasn't seen the search itself, so the classes and databases covered aren't recorded here (§7). EUIPO and WIPO weren't mentioned.
4. **Filing:** not decided. Class 9 first if the owner files. An LLC will exist before full launch (pitch.md, fourth round), which may be the right applicant. This plan is not legal advice.
5. **Social handles:** not checked (naming.md §6).

**Name rules (Platestep):**
- Always one word, capital P only: **Platestep**. Never "PlateStep", "Plate Step" or "plate step" as the name.
- In caps (event band), the wordmark sits **beside the Sash mark**, and appears once per card.
- On a bib, the big figure is the training-day number ("No. 47"), never a weight (§3.4).
- Lead with the plate and the Sash, never with "step": "step" can suggest step counts or step aerobics, and "plate" can read as food (naming.md §3.1 risks). The loaded bar on the bib stays mandatory for that reason.
- The subtitle "Tells you what to lift next" (the store's choice, §4.1) sits under the name; the old Liftnext pun rule no longer applies.

### 2.2 The one-line promise

Business.md §1 wrote the promise. Every clause is true at v3.514, so marketing keeps it and adds shorter cuts for each surface:

- **Full (README, landing page, store long description, first paragraph):** "Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone."
- **Tagline (store subtitle, 30 characters):** **"Tells you what to lift next"** (27), as chosen in `planning/store/` (2026-11-08). It replaces this file's earlier drafts ("Lift what's next. Log in a tap.", "Know what to lift next"). The store files are the source of truth for every store field.
- **First screen (wording for BIZ-17):** the full promise above is right. If it wraps past three lines at 402 px, use the shorter cut "Your training plan and logbook. Free, no ads, and your logs stay on your phone." It keeps BIZ-17's test phrase.
- **Share cards:** the Sash mark and the Platestep wordmark once (MKT-03b), plus the address once BIZ-08 ships, nothing else. Year in Lifting 2026 carries no address (D16).

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

- **The mark (superseded 2026-11-07):** the owner chose **"Sash"** (v3.516): the five plate inks as one band, on its own ink tile (`tools/design/icon/option-b.svg`; the header mark at `index.html` ~489 notes the sash only reads inside its square). This settles MKT-19. On cards, draw the **tile with the sash**, not the bare sash, beside the Platestep wordmark (MKT-03b). The ring mark is retired. Cards today still print "TRAINING LOG" (`buildShareCardBlob`, `index.html:29608`) and save as `training-log.png` (29623); MKT-03 replaces both.
- **Ground:** flat neutral ink (`#0C0C0D`) in dark, chalk paper (`#F3F3F1`) in light, with no gradients (design-vision §3.2). Share cards use the dark ground.
- **Colour on cards = the day's spot ink** (the plate colour of the session's day, from `dayInk`; owner D13: each day takes its program's plate ink), the same rule the vision applies to the PR flood. Gold retires with the glow. A block or year card, which spans days, uses ink-grey with the week strip in plate colours as data.
- **Type:** Archivo condensed for the big figure and headline (owner D2: Archivo ships before the cards, UX-02); Geist for everything else; tabular figures.
- **Name fit:** "Platestep" carries the plate, which "chalk" (design-directions §6.4 Q3) and "Liftnext" didn't, and it matches the Sash: five plates' inks. It isn't enough on its own ("plate" can read as food, "step" as step counts), so the lifting signal still comes from the **Sash's plate inks and the loaded bar on the bib**; the bar is mandatory on the session bib, not decoration (§3.4).

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
| 2 | **Session complete** | `triggerCelebration('flag', 'Session complete!', …)` (29263), which has no share today | Day label ("Upper · Strength"), sets done, lifts, minutes if timed, and any PRs that session. **No total load** (owner D15: cards lead with sets, lifts and minutes; tonnage rewards junk volume) | Same function, stats layout | Training numbers only | MKT-04 |
| 3 | **Consistency** | Today: 7/14/30… consecutive days. Proposed: **weeks in a row** with at least max(2, planned days − 1) sessions, or 2 when no plan is set (the business north-star floor) | "8 WEEKS IN A ROW", a 12-week strip of filled squares, "Rest days included" | Same function, with a week-strip drawn in canvas | None beyond training frequency | MKT-01 |
| 4 | **Week complete** | `archiveCurrentWeek` share (45471) | Workouts, program, and **total sets or PRs this week** in place of weight/intake | Existing | Today: body weight or intake can appear by default. After MKT-02: none | MKT-02 |
| 5 | **Block / program complete** | The last week of a mesocycle (`cycleWeekOf` returns the final week) is archived; the rehab and postpartum "graduation" celebrations (15590, 15921) stay **without** a share button | Program name, "Block complete: 5 weeks", sessions done out of planned, and the top 3 lift gains for the block | Same function, stats layout | Training numbers only. Clinical programs excluded | MKT-05 |
| 6 | **Year in Lifting** (a "Wrapped") | From 1 December to 15 January, a row in Today's Priorities and an entry in History opens it. Only with at least 8 sessions logged that year | A sequence of 4–5 story cards: sessions and weeks trained; total sets (no total load, D15); biggest gain (lift and amount); most-trained muscle group; best consistency run. The person picks which to share | On-device from `activity-dates`, `week-archive` and `reconstructAllPRs` (41641). Nothing is computed on a server | Training numbers only. Body weight never appears | MKT-06 |
| 7 | **Progress, before and after** | A "Show progress" action on any lift's history | "Squat e1RM: 225 → 275 lb in 12 weeks" with a sparkline | Canvas, stats layout plus a line | Training numbers only | MKT-07 |
| 8 | **Progress photos, side by side** | Only from inside Progress Photos (6543), and never suggested | The two photos the person picks, with their dates, side by side. No numbers | Canvas compositing on the device. **Nothing is sent** (unlike "Compare with AI") | High: body images. Strictly opt-in, no nudges, no default watermark beyond the small mark | MKT-08 |
| 9 | **Share a program** | "Share this program" on a custom program | A link that opens the app with the program ready to preview and import | Program JSON, compressed and base64url-encoded into the URL **fragment** (`#p=…`), which is never sent to the server. The existing `launchViewFromUrl` (40172) shows the URL-handling pattern | Low: it's a program, not a log. But a URL payload is an input to validate (security review) | MKT-10 (needs-owner) |
| 10 | **Friend challenge** | "Challenge a friend" from the consistency card | A link: "Train 3×/week for 4 weeks, starting Monday". Each person tracks it locally; at the end, each one shares a result card, and the comparison happens in the chat they already use | Fragment link as in #9; no leaderboard server | Low: the challenge spec only. No one's data leaves their phone unless they share their own result card | MKT-11 (needs-owner) |

**What not to build:** a public profile, a feed, likes, contact-book import, "X people are training now" counters (fake social proof without a server), or notifications that guilt someone about a broken streak.

### 3.4 The bib under the Platestep name (MKT-16 to MKT-18; added 2026-11-07, updated 2026-11-08)

The owner chose the race bib as the story card (pitch.md, "Owner's answers"). These notes were first written for Liftnext; with the name now Platestep (and the design-engineer's rebuilt bib render, `tools/design/renders/c-card.png`, design-directions.md §3):
- **Event band:** one tracked-caps line, as on a real bib: **[Sash tile] PLATESTEP · STRENGTH & SIZE · WK 3**. The name takes the event slot (the owner's suggestion), framed by the mark so it reads as the event's name. Program and week follow in the same line (design-directions §2.3 allows one tracked-caps line). If it doesn't fit at 1080 px, program and week drop to a sentence-case line under the band; the name and mark stay in the band. Until MKT-03b ships, the band carries the tile alone.
- **The name appears once per card:** in the event band. No separate name and mark at the foot.
- **Sponsor strip** (the bib's foot): the address only, once BIZ-08 ships. None on Year in Lifting 2026 (D16).
- **The big figure** is "No. 47" (MKT-17), captioned "your 47th training day on the log", never a load. Platestep is a noun, so it doesn't read as an instruction the way "LIFTNEXT 160" did, but the rule stays: the bib's number is the training day.
- **Sets lead, not tonnage (D15).** The tear-off tabs read sets · lifts · minutes (for example "20 sets · 6 lifts · 58 min"). Total load is off by default.
- **The loaded bar is mandatory** whenever the lead lift is a barbell lift: it's what says "lifting, not running", and with Platestep it also keeps "step" from reading as step counts. For days with no barbell lift, the bib shows the lead lift's top set line in its place; no invented bar.
- **"Year in Lifting"** stays the recap's name: descriptive, and not Spotify's "Wrapped" or Strava's "Year in Sport". The "wall of bibs" is for the 2027 recap: MKT-06b ships mid-December, before MKT-16 exists in the roadmap.

---

## 4. Store and launch

**Where the copy lives now (2026-11-08):**
- **`planning/store/`** (marketing): the App Store and Google Play listings, the screenshot storyboard, the `platestep.app` landing page (MKT-14) and the launch posts (MKT-13, with the MKT-12 comparison-page outline). Its README has the launch-week assembly checklist and the platform limits it couldn't verify.
- **`planning/launch-copy/`** (business): the privacy policy draft (BIZ-16), the "What's free" paragraph (BIZ-18), the AI disclosure lines (BIZ-06) and the claims list for the clinician (BIZ-15).

Those files are the source of truth for their copy; this section keeps only the decisions and the sequencing. **Nothing there is approved for publication**, and the owner's go-public order is decided (D8): after Phase 3 and its gates, web first, then Google Play, then the App Store. Play goes first through the Capacitor build (owned elsewhere), on a **personal** Play account with founding members as the 12 testers; an LLC will exist before full launch, and the listing can transfer to the LLC's account then (D9(f), pitch.md fourth round).

### 4.1 Listing copy

The Liftnext draft that was here ("Liftnext: Training Log", "Know what to lift next") is superseded by `planning/store/app-store.md` and `google-play.md`, drafted for Platestep against v3.517. The words chosen there:
- **App Store name / Play title:** `Platestep: Strength Training` (28 of 30). It replaces both "Liftnext: Training Log" and naming.md's suggested "Platestep: Training Log".
- **Subtitle (Apple):** `Tells you what to lift next` (27 of 30).
- **Short description (Play):** `Tells you what to lift next: weight and reps for every set, logged in one tap.` (78 of 80).
- **Rules the store copy adds:** no price words in names, subtitles, titles or screenshots (Apple 2.3.7; Play's title rules), so "Free" lives only in descriptions and the landing page; only shipped features; "Your training log is stored on your phone", never "no data leaves your phone" (food search and optional AI do send requests); the clinical programs aren't mentioned until the clinician review (D9(e), BIZ-15).

### 4.2 Screenshot storyboard

Superseded by `planning/store/screenshots.md`: **7 frames, plus an eighth (the bib) when MKT-16 ships**, shot from the visual harness's seeded fixture, delivered at 1320 × 2868 for Apple and 1080 × 1920 for Play. The old frame 6 ("Free. No ads. No account.") is dropped because Apple 2.3.7 bars prices in screenshots.

**Tooling:** the `app-store-screenshots` skill mentioned in the UI/UX guide could automate frames and captions. **Recommend it to the skills-orchestrator for vetting** (licence, pinned version, any network or install calls) rather than installing it. Until then, the harness's store mode (`screenshots.md` §3–§4) produces the captures.

### 4.3 Launch plan

**Owner's answer (2026-11-08, D8):** yes to the launch posts and creator outreach (MKT-13), with no paid placements, under the sequencing rule below and after Phase 3 and its gates; web first, then Play, then the App Store.

All public posting needs the owner (MKT-13): it publishes under his name and commits to a public address.

**Sequencing rule (added 2026-11-07): nothing points strangers at the app before there's an address that will never change, and nothing carries an address before a stranger can succeed there.**
- **The wordmark on cards (MKT-03b):** the conditions set here on 2026-11-07 (name confirmed, domain held, knockout done) were met on 2026-11-08 for Platestep. MKT-03 ships the Sash mark alone; MKT-03b adds the Platestep wordmark after it. (The open NextLift risk that held it back belonged to Liftnext and went with it.)
- **The card address (BIZ-08) is `platestep.app`, never the `github.io` URL.** Shared images can't be edited later, and the `github.io` URL carries the old repo name and the owner's GitHub handle.
- **The domains forward; the app's origin doesn't move.** `platestep.app` and `platestep.com` are forwarded (HTTPS 301 to the app's current address) **only when the owner asks**, and are never set as a GitHub Pages custom domain (BIZ-25 parked: "forward only", 2026-11-08). So BIZ-08's address works only once the owner has turned forwarding on.
- **BIZ-08 stays behind the Phase 3 gate** (roadmap Phase 5). So the December 2026 Year in Lifting cards (MKT-06a/b) carry the mark (and the name, now confirmed) but **no address** (owner D16). That's deliberate: strangers shouldn't land on a first launch that BIZ-01 to BIZ-03 and BIZ-17 haven't fixed. December 2026 is a dogfood run with the owner and friends; the public recap moment is December 2027.
- **No launch post (MKT-13) before** `platestep.app` forwards to something that installs (the app, or a landing page under MKT-14), the privacy page (BIZ-16) is live, and the Phase 3 gate holds.
- **Program links and challenges (MKT-10, MKT-11):** the owner said yes (2026-11-08), after BIZ-08, since they're built on `PUBLIC_APP_URL`.

| Step | Where | How, inside the rules |
|---|---|---|
| 0. Ready | `platestep.app` forwarding (when the owner asks; §2.1); README or landing page (BIZ-07, MKT-14), privacy page (BIZ-16), "What's free" (BIZ-18), share links (BIZ-08), the first-launch fixes (BIZ-01 to BIZ-03) | Don't launch before the first-launch fixes. A stranger's first session is the launch |
| 1. Soft launch | Friends who lift: 10–20 people, using the app for 4 weeks. On Play, the founding members are the 12 closed testers (D9(f)) | Ask them in person what confused them. That's the only "analytics" (§5) |
| 2. Communities | The drafted posts are in `planning/store/launch-posts.md`: **r/weightroom** (its self-promotion rule wasn't found, so ask the moderators first), **r/Fitness** (designated self-promotion thread only; the rules wiki warns of a permanent ban for unasked self-promotion), **r/bodyweightfitness** (modmail first; the post goes only if Platestep qualifies). The earlier ideas, kept as options and not drafted: **r/weightlifting** ("Self Promotional Saturday", [mirror](https://lr.psf.lt/r/weightlifting/comments/1ipwpsd/self_promotional_saturday)), **r/xxfitness** (biweekly thread, [mirror](https://lr.sudovanilla.org/r/xxfitness/comments/1frpacj/biweekly_self_promotion_thread_sell_yourself_and)), **r/PWA**, **r/SideProject** and **r/webdev** for the single-file story | Disclose that you made it, every time. Post in the designated thread only. Answer questions; don't cross-post the same text. Read each sidebar on the day: these rules were checked through search results and unofficial mirrors |
| 3. Product Hunt | One launch, on a Tuesday–Thursday; tagline "The strength app that tells you what to lift next" (`launch-posts.md` §4) | No upvote requests to friends (it breaks PH's rules and it's fake social proof) |
| 4. Creators | Evidence-based strength and nutrition creators who already criticise paywalled basics | Offer nothing but the app and a short note. No paid placements (that costs money: needs the owner). If someone reviews it, ask that they disclose any relationship (FTC endorsement rules) |
| 5. December | "Year in Lifting" (MKT-06) | The yearly recurring launch moment. 2026 is the dogfood run (no address, D16); 2027 is the public one |

### 4.4 Search and the landing page

**Owner's answers (2026-11-08):** the landing page `about.html` is approved (MKT-14, D8; now `ready` behind the Phase 3 gate, so the "still `needs-owner`" below is superseded). **One** dated, sourced comparison page that names other apps is approved (MKT-12, D6), as `compare.html`, after the CSV import (BL-29); competitor names stay out of store keywords and store copy.

- **Today the README is the landing page** (BIZ-07 owns its facts).
- **A real landing page** is drafted in `planning/store/landing-page.md` (SEO head, hero "Tells you what to lift next.", three proof points, "What's free", install steps, footer). Building it is MKT-14, still `needs-owner`: one static file, no framework, no analytics, no cookies, no third-party requests, the self-hosted Archivo, not precached by `sw.js`. Its buttons link to the app's current address, never a new origin.
- **Target searches** (proposed, not measured): "free workout tracker no ads", "workout log app no account", "progressive overload app free", "5x5 tracker free", "workout app offline". Pages that name competitors ("Strong alternative") use third-party marks: needs the owner (MKT-12; outline in `launch-posts.md` §6).
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

**No analytics, and none to be added without the owner.** Every measurement below uses either (a) the store consoles' aggregate numbers after a store launch (installs, retention, referrer), (b) the on-device first-month row (BIZ-09) read by testers and reported by hand, or (c) an opt-in "How did you hear about us?" asked once, kept on the device and shown in Diagnostics, never sent. Adding any counting that leaves the device is `needs-owner`; the owner said no to referral attribution for now (MKT-15 parked, 2026-11-08).

| # | Hypothesis | Change | Metric | How to measure without tracking |
|---|---|---|---|---|
| E1 | A weekly streak gets more people a first consistency card than a daily one | MKT-01 | Share of testers who reach a 4-week milestone vs. a 7-day one in their first 6 weeks | BIZ-09's diagnostics row extended with "consistency milestone reached: date" (on device), read by testers |
| E2 | Story-format cards get shared more than squares | MKT-03 | Testers' self-reported shares per milestone | Ask soft-launch testers. After the store launch, store-console referrals from share links |
| E3 | A link on the card brings installs | BIZ-08 | Store-console installs from web referrals; GitHub Pages has no analytics | Store consoles only. The `?ref=card` tag once proposed here is out: the owner declined attribution (MKT-15 parked, 2026-11-08) |
| E4 | A Year in Lifting recap brings back lapsed users in December | MKT-06 | Store-console weekly actives in December vs. November | Store consoles (aggregate) |
| E5 | A promise line on the first screen raises profile creation | BIZ-17 (business) | Testers who create a profile vs. close the app | Moderated tests with 5–10 strangers: watch, don't count |
| E6 | "Platestep" is remembered and spelled right | MKT-09 (shipped v3.517; v3.515's Liftnext was never tested this way) | Can a tester name the app a week later, and type it as one word into a search box (not "Plate Step" or "Platestepp")? | Ask them. Cheap, honest, no data |
| E7 | A stranger reads the bib as lifting, not running (a bet: no market evidence yet that lifters want a bib, alignment 2026-11-07) | MKT-16 | Of 5–10 strangers shown the bib PNG with the name covered, how many say "gym" or "lifting" when asked which sport? | Show printed or on-screen PNGs in person. No data collected |

---

## 6. Backlog items

Appended to `planning/backlog.md` under "Marketing (MKT)". Ready items first, in suggested build order:

Statuses as of 2026-11-08 (`backlog.md` is the source of truth):

- **Ready:** MKT-01 weekly consistency streak; MKT-02 no body data on share cards by default; MKT-03 story-format cards with the brand mark (after UX-01b); MKT-03b the Platestep wordmark on cards (after MKT-03; owner confirmed the name 2026-11-08); MKT-04 session-complete card; MKT-05 block-complete card (after UX-11); MKT-06 Year in Lifting (after MKT-03); MKT-07 PR and progress cards show the gain; MKT-20 card and backup file names follow the app's name.
- **Bib (owner-approved design, 2026-11-07):** MKT-16 session bib (after MKT-03 and MKT-04), MKT-17 "Your number", MKT-18 pin it on a photo (both after MKT-16).
- **Ready once BIZ-08 ships (owner yes, 2026-11-08):** MKT-10 share a program by link; MKT-11 friend challenges by link (also after MKT-01).
- **Done:** MKT-09 the name (Liftnext v3.515, then Platestep v3.517; §2.1); MKT-19 the mark (Sash icon, v3.516; the card mark folds into MKT-03).
- **Parked:** MKT-08 side-by-side progress photos (summit: Phase 5); MKT-15 referral attribution (owner no, 2026-11-08).
- **Needs owner:** MKT-12 competitor names in copy and pages; MKT-13 public launch posts and creator outreach; MKT-14 a landing page file.

BIZ-08 (the address on cards, `platestep.app`) is the prerequisite for the referral value of every card. MKT items don't duplicate it: MKT-03 leaves a footer slot for it.

---

## 7. Couldn't verify

- **Trademarks:** marketing searched the web only; USPTO and EUIPO weren't queried directly by this file. For Platestep, the owner reports a clear USPTO knockout (2026-11-08); the classes and databases it covered aren't recorded here, and EUIPO and WIPO weren't mentioned. (The 2026-11-07 Liftnext search is history: no LIFTNEXT record, a crowded LIFT- family.)
- **Domains:** the owner holds `platestep.app` and `platestep.com` (CLAUDE.md, 2026-11-08). Marketing hasn't checked their forwarding, which stays off until he asks. `platestep.fit` and `.io` aren't recorded as bought.
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
- `planning/naming.md` (2026-11-07): the 128-candidate screen behind Platestep, with its own App Store, RDAP and trademark-aggregator checks and sources
- Liftnext store search (web, 2026-11-07, history), nearest names only: [LiftUp](https://apps.apple.com/app/id6760911569), [LiftXP](https://mwm.ai/apps/liftxp-ranked-gym-tracker/6791541944), [Liftz](https://www.producthunt.com/p/liftz-your-gym-buddy/liftz)
- Reddit rules (unofficial mirrors): [r/Fitness](https://reddit.rtrace.io/r/Fitness/wiki/intro), [r/weightlifting](https://lr.psf.lt/r/weightlifting/comments/1ipwpsd/self_promotional_saturday), [r/xxfitness](https://lr.sudovanilla.org/r/xxfitness/comments/1frpacj/biweekly_self_promotion_thread_sell_yourself_and)
