# Slogan: should Platestep have one, and where does it go?

Owner: marketing-manager. Written 2026-11-23 against live **v3.645** (`APP_NAME = 'Platestep'`, `index.html:8555`). The owner asked: "Should we add a slogan somewhere? Let's tinker around on that." Inputs: `marketing.md` §2 (name rules, promise, voice), `naming.md` §3.1 and §4 (the "one plate at a time" story), `store/` (the subtitle "Tells you what to lift next"), `launch-copy/whats-free.md`, `design-vision.md` (Plate & Press, the Sash) and the bib mock-up `tools/design/directions/c-card.html`.

**Nothing here is a legal clearance.** Every screen below is a web search, plus Apple's iTunes Search API for the exact phrase in app titles and descriptions (US store, 25 results). No USPTO, EUIPO or WIPO search was run. Counsel should knock out the chosen line before it's printed on anything paid for.

**No backlog items yet.** The owner picks first; §7 sketches the items.

---

## 0. The short answer

- **Yes, add one, and keep it separate from the subtitle.** The subtitle "Tells you what to lift next" says what the app *does*; it carries search words and stays. A slogan says what *you* do with it, and goes where a person reads the brand rather than searches for it: the landing hero, social bios, the last Year in Lifting card, the footer, the email signature.
- **Pick: "Earn the next plate."** (20 characters, 4 words.) It's the product's real rule in four words: Platestep adds weight only when you've hit the top of your rep range (`store/app-store.md` §3, the "earned" thresholds in the code). It carries the brand word "plate" and the name's story (the next step up the bar, naming.md §3.1), and makes no promise about results. No exact-phrase use found in fitness branding, trademarks or the App Store.
- **Runner-up: "A plan for every lifter."** (24 characters, 5 words.) It says the mission, guidance for people who need it, more directly, and it's clean too. It's less ownable: it could be any program's tagline.
- **Not the slogan: "One plate at a time."** Keep it as the story line it already is (the rename's What's New note, `index.html:9915`; the store description's last sentence). As a slogan it is generic, unownable, and used by food apps and restaurants ("Plate: Meal Recipes for One", restaurant slogan lists), which feeds the "plate reads as food" risk naming.md §3.1 already names.
- **Placement:** copy-only for the landing hero, social bios and email signature (do these now); an app build for the Year in Lifting end card and the Settings footer; **no** on the store subtitle (keep it), the bib (no room), and the launch animation (stays wordless).

---

## 1. The brief for a slogan

**What it has to do:**
- Say something the name and the subtitle don't. The name is the brand ("Platestep"), the subtitle is the function ("Tells you what to lift next"), so the slogan is the attitude: honest, earned progress.
- Fit the voice (marketing.md §2.3): a good coach in a quiet gym. Plain, exact, a little dry. Never shouty, never guilt.
- Fit the mission: help the fitness community, especially people who need guidance in tracking, training and learning.

**Rules it must keep:**
- Under 6 words where possible.
- **No health claims:** nothing like "safe", "prevents", "rehab", "injury-free", "guaranteed results" or "transform" (marketing.md §2.2, `launch-copy/claims-review.md`).
- **No outcome promise.** "Stronger" on its own is a result we can't promise everyone; the programs are built for it, but a slogan that promises it reads as a guarantee. "Proven" stays only in business.md's sentence.
- **No coaching credentials we don't have.** No "coach", "trainer" or "expert" in the slogan. "Plan" and "guidance" are fine: the programs are written plans with their sources shown.
- **No competitor names, and no echo of a famous slogan** (Nike's "Just Do It", Planet Fitness's "Judgement Free Zone", Gymshark's "We Do Gym", and so on).
- **No price words** if it ever goes near a store field (Apple 2.3.7): so "free" stays out of the slogan itself.

---

## 2. The candidates (20) and the screen

**How each was screened (2026-11-23):**
- A web search for the exact phrase, in fitness branding, slogans or trademarks (justia and similar aggregators surface in those results).
- Apple's iTunes Search API for the exact phrase in app titles and descriptions, for the eight closest to a pick.
- A check for echoes of well-known slogans.
- Fit, measured, not guessed (`tools/design/slogan/render.js`, results in `renders/fit.json`):
  - **Subtitle:** characters against Apple's 30 (without the full stop, as a subtitle would be set).
  - **Bio:** every candidate is well under Instagram's 150, so the real question is whether it leaves room for the promise (§4).
  - **Bib band:** the width as tracked caps in the bib's band style (Geist 700, 31 px, 0.09 em, from `c-card.html`), against the band's 734 px of text room.
  - **End card:** the line count at the end card's 230 px Archivo condensed size.

**The bib band, measured once for all of them:** the band already reads `PLATESTEP · STRENGTH & SIZE · WK 3`, which takes **658 of 734 px**. Every candidate is between 276 and 642 px on its own, so **no slogan fits beside the event line**. It could only replace the program and week, which marketing.md §3.4 says stay. The bib gets no slogan; that's settled for every candidate, so the table doesn't repeat it.

### Route A: the plain promise (what it does)

| # | Candidate | Chars | Echo or conflict found | Verdict |
|---|---|---|---|---|
| A1 | Know what to lift next. | 23 | No exact use found. But "lift next" sits beside the four NextLift apps that ended Liftnext (`research.md` §11); search results for the phrase return "NextLift: Barbell Tracker" first. It's also the store's old subtitle | Out: walks back toward the NextLift collision |
| A2 | Your next set, already planned. | 31 (30 without the stop) | No exact use found | Good as copy, long as a slogan (4 lines on the end card). It's already a listed alternative subtitle (`app-store.md` §2). Keep it as a landing section heading |
| A3 | The plan and the log, in one. | 29 | No exact use found | Accurate, flat. A description line, not a slogan |
| A4 | Every set has a target. | 23 | No exact use found | True and specific, but cold; "target" can read as a body goal. Reserve |

### Route B: community and guidance (the mission)

| # | Candidate | Chars | Echo or conflict found | Verdict |
|---|---|---|---|---|
| B1 | **A plan for every lifter.** | 24 | No exact use as a slogan; the phrase only appears in articles arguing that plans must fit the person (bodybuilding.com, Breaking Muscle). No App Store hit | **Runner-up.** The mission in five words. Generic-sounding, so less ownable |
| B2 | Every lifter deserves a plan. | 29 | No exact use found | The same idea with more heart, but "deserves" leans preachy, and it's 4 lines on the end card |
| B3 | Lift with a plan. | 17 | No exact use. Nearest: Let's Lift's store copy, "connect, plan, lift!" | Fine, forgettable. An imperative that any program could say |
| B4 | Learn the lift. Log the work. | 29 | Close to "Learn to Lift", a coach's program on Playbook (Ashley Weingart) | Out: echo, and "learn" over-promises teaching we only partly do (cues, not coaching) |

### Route C: progress, "one plate at a time"

| # | Candidate | Chars | Echo or conflict found | Verdict |
|---|---|---|---|---|
| C1 | **Earn the next plate.** | 20 | **None found**: no fitness, trademark or App Store use. The only "earn … plate" hits are a meal kit's "PlatePoints" and game badges | **Pick** (§3) |
| C2 | One plate at a time. | 20 | No trademark found, but used by food apps ("Plate: Meal Recipes for One" uses "plan your week one plate at a time"; a Myplates app and an Appadee cooking app use it too) and on restaurant slogan lists | Out as the slogan: generic, unownable, and pushes "plate" toward food. **Keep as the story line** in long copy |
| C3 | Every plate, earned. | 20 | Echoes "Earned, not given", a gym cliché: Gym Reapers, Freeletics' motto, Mattie Rogers' "Earned Not Given" programs on TrainHeroic | Out: reads as the cliché's cousin; C1 says it better |
| C4 | Stronger, one plate at a time. | 30 | No exact use found | Out: "stronger" is an outcome promise (§1). Also generic |

### Route D: gym-culture voice

| # | Candidate | Chars | Echo or conflict found | Verdict |
|---|---|---|---|---|
| D1 | **Load the bar. Log the set.** | 26 | No exact use found | **Third.** The strongest gym-floor rhythm, and it's what the app does. It's a ritual line, not a mission line; great for social and video captions |
| D2 | Less guessing. More lifting. | 28 | "Less X. More Y." is a crowded pattern, with a registered "LESS ATTITUDE. MORE FITNESS." among the trademarks. Near "NoGuessMethod" (a lifting program); "Less stress. Less guessing." is a parenting app's copy | Out: crowded pattern; Planet Fitness-adjacent attitude |
| D3 | Rack it. Log it. | 16 | **Echoes a live app's tagline:** "Gym Gym: Gym Workout Tracker" uses "Rack, log, next set." | Out |
| D4 | Just lift. We'll do the math. | 29 | **Echoes Nike's "Just Do It"**, and "Just Lift" is taken many ways: JUST LIFT FITNESS (filed 2024), JUST LIFT BY JUSTIN (filed 2021), and App Store apps "Just Lift" and "Just Lift Be Fit" | Out: the one candidate that fails twice. Listed so nobody suggests it later |

### Route E: short, punchy social lines

| # | Candidate | Chars | Echo or conflict found | Verdict |
|---|---|---|---|---|
| E1 | Plate by plate. | 15 | No fitness brand found; no App Store use | Nice, but an idiom with no verb, so it says less than C1. Use as a hashtag or caption sign-off (`#platebyplate` not checked) |
| E2 | Next plate, please. | 19 | No exact use found | Playful, but "plate, please" reads as ordering food. Out for the food risk |
| E3 | Lift. Tap. Next. | 16 | Echoes the "Lift. Log. Repeat." family: "Lift - Rest - Repeat" is a live app; "The Log" uses "log it, rest, repeat" | Out: crowded three-beat pattern |
| E4 | Show up. We'll do the math. | 27 | No exact use; "show up" is common fitness copy (a creator's app, a "Keep Showing Up" program) | Honest and warm, but "show up" is everywhere. Good as a one-off video caption |

**What the screen says.** Three patterns are crowded in fitness: "Just …" (Nike), "Less X. More Y." and the three-beat "Lift. Log. Repeat." Anything with "earned" in it leans on "Earned, not given". Lines built on our own words, "plate" plus "next", come back clean, which matches what naming.md found: the plate is the part of this brand nobody else owns.

---

## 3. Recommendation

### Primary: "Earn the next plate."

- **It's true in code.** Platestep doesn't add weight because a week passed. It adds weight when you hit the top of your rep range two sessions in a row, and tells you to go lighter or take an easier week when you don't (the thresholds the landing page already quotes, `store/landing-page.md` §2.3). "Earn" is the product's rule, not a mood.
- **It carries the name's story** without repeating it: Platestep is the next step up the bar, one plate at a time (naming.md §3.1); the slogan is the same idea, said to you.
- **It leads with the plate,** as marketing.md §2.1 asks, and with "earn" next to it, the plate is a weight plate, not a dinner plate.
- **It makes no claim.** It doesn't promise strength, safety or speed. It describes a standard you meet.
- **It works for every level.** A beginner earns a 2.5 lb plate; an advanced lifter earns the same. Nobody is excluded by it, which fits the mission.
- **Risks:**
  - It's an imperative. That's fine for a slogan (the bib rule against imperatives was about the *name*), but never put it on the bib.
  - "Earn" can read as rewards points. Next to "plate" and the bar, that reading is weak. Watch for it in the user tests (§6).
  - For bodyweight-only users there's no plate. They still progress by the same rule, and the slogan reads as a figure of speech; the bodyweight posts lead with the promise instead.

### Runner-up: "A plan for every lifter."

Use it if the owner wants the slogan to say the mission (guidance for people who need it) rather than the method. Its weakness is that it's less ownable and doesn't carry the plate. It also makes a good second line wherever there's room: "Earn the next plate. A plan for every lifter." is how both can live together, on the landing page's closing section or in a launch post.

### Third: "Load the bar. Log the set."

Not a brand slogan, but the best caption line we have. Use it on short videos of a set being logged (`marketing.md` §5's content calendar, item 1) and as a recurring post format.

### The social bio, built on the slogan

Instagram, Threads and X (150 or more characters; this is 136):

```
Earn the next plate.
A free strength tracker that tells you what to lift next.
Programs that progress with you. One-tap logging. No ads.
```

TikTok (80 characters; this is 76):

```
Earn the next plate. Free strength tracker that tells you what to lift next.
```

Each line is checked against the app:
- "Free" and "No ads" are true, and are promised in `whats-free.md`. Platestep Plus is optional and adds extras; it doesn't put free features behind a payment.
- "Tells you what to lift next" is the store subtitle.
- "Programs that progress with you" refers to the progression rules (`store/app-store.md` §3).
- The link is the landing page once MKT-14 ships. Until then it's the app's own address, never a new origin (`landing-page.md` precondition 2).
- No "proven" here: marketing.md §2.2 keeps that word in business.md's one sentence.

**Handles are not checked** (naming.md §6 left social handles open). Check `platestep` on Instagram, TikTok, Threads, X and YouTube before printing the slogan anywhere, and register them on the same day. The mock-up says "handle not checked" for that reason.

---

## 4. Where it should appear

| Surface | Recommendation | Build or copy? |
|---|---|---|
| **App Store subtitle** (and Play short description) | **Keep "Tells you what to lift next".** The subtitle is indexed for search and has to say what the app does; "Earn the next plate" has no search word in it. The slogan can go in the promotional text (170 characters, editable without a release), and as the last line of the long description, replacing "an honest next step, one plate at a time" only if the owner wants both in. | Copy-only (store metadata, no app build) |
| **Landing page hero** | **The slogan as the H1, the promise as the sub**, with the eyebrow (Sash and "Platestep") and facts line as drafted. The `<title>` and meta description keep "tells you what to lift next", so search loses nothing. Mock-up 1. | Copy-only (the page is MKT-14, which is still `needs-owner`) |
| **Share cards** | **Not on the bib, the session card or the PR card.** The bib's band is full (§2) and marketing.md §2.2 caps cards at the mark and name. **Yes on a new last card of the Year in Lifting set**: "That's your year." over the slogan, the week strip as the only colour, the Sash and wordmark at the foot, no address (D16). It's the one card where a line that looks forward ("the next plate") is the right ending. Mock-up 2. | **App build** (a sixth card in `yearRecapCards`, `index.html:16505`) |
| **Launch animation's end frame** | **No.** UX-18 is wordless by design: a push into the mark in 1–2 seconds, seen on every cold launch. Text would add reading time and a second thing to look at, and it would be read hundreds of times by the same person. | (none) |
| **About and Settings footer** | **Yes, quietly.** Settings has no About section today; the footer at the bottom of every page shows `Platestep v3.645 · schema v…` (`index.html:53397`). Add the slogan as a line above it, in the footer's own small grey type: "Earn the next plate." Nothing else in Settings changes. | **App build** (one line in the footer, plus a test) |
| **Social bios** | **Yes**, the bio in §3, on every profile at once, with the handles registered first. Mock-up 3. | Copy-only |
| **Email signature for support@platestep.com** | **Yes:** `Platestep · Earn the next plate.` then `support@platestep.com`. No link to the landing page until it exists, and no marketing line beyond that: support mail is for answering. | Copy-only |

**Copy-only, can happen as soon as the owner picks:** the social bios (once handles are checked), the email signature, the landing hero text (`store/landing-page.md` §2.1), the store promotional text and description line, and launch posts (`store/launch-posts.md`).

**Needs app builds, one version each:** the Year in Lifting end card, and the footer line. Both are sketched in §7.

---

## 5. Mock-ups

The three shortlisted slogans, each on three surfaces, are rendered with the pre-installed Playwright Chromium in the Plate & Press type and inks. They're static HTML, not app code.

- Files: `tools/design/slogan/` (`hero.html`, `year-end.html`, `profile.html`, each taking `?s=1|2|3`; the shared `slogan.css` and `slogans.js`; and `render.js`).
- Renders: `tools/design/slogan/renders/` (`hero-1..3.png` at 1280 × 800, `year-end-1..3.png` at 1080 × 1920, `profile-1..3.png` at 430 × 760 @2x, `contact-sheet.png`, and `fit.json`).
- Re-render with `node tools/design/slogan/render.js`.

What the renders show:
1. **Landing hero.** All three hold at 132 px Archivo condensed in two lines. "Earn the next plate." is the tightest and leaves the sub to do the explaining; its "earned it" at the end of the sub echoes it on purpose. "Load the bar. Log the set." is the widest, nearly touching the image column.
2. **Year in Lifting end card.** "That's your year." over the slogan works best with C1, because "the next plate" reads as next year. B1 reads like a mission statement at the end of a personal recap, which is the wrong voice there. D1 reads as an instruction to go to the gym.
3. **Social profile header.** All three fit the bio with the promise and link in five lines. No follower or post counts are drawn (they would be invented, which is fake social proof), and the handle is marked unchecked.

---

## 6. How we'd know it works (no tracking)

- **Recall test, in person:** show 5–10 lifters the landing hero for five seconds, then ask what the app does and what they remember. Success: most recall the slogan or "plate", and nobody says "food" or "steps". This uses the same protocol as marketing.md §6's E5 and E7, with no data collected.
- **The "earn" reading:** in the same session, ask what "earn" means there. If people say "points" or "rewards", fall back to the runner-up.
- **Social:** no analytics are added. Look only at what the networks show any account owner (saves and shares on a post), and compare a slogan-led caption with a promise-led one over the same month. That's a weak signal, so treat it as a hint.

---

## 7. Proposed items (sketches; not in the backlog until the owner picks)

**MKT-21 (proposed): the slogan in the app footer.**
- Why: one quiet place in the app where the brand speaks, at no cost to any screen.
- Change: `#appFooter` gets a first line, "Earn the next plate.", above the existing `${APP_NAME} v${APP_VERSION} · schema v${SCHEMA_VERSION}`. Add a `const APP_SLOGAN` beside `APP_NAME` (`index.html:8555`), so a change of mind is one edit. No new styles beyond the footer's own.
- Acceptance: the real init line renders both lines in jsdom; the version text is unchanged (Diagnostics and support rely on it); `test-app-rename.js` doesn't need to change.
- Status if approved: `ready`. It makes no claim and sends nothing anywhere.

**MKT-22 (proposed): a Year in Lifting end card.**
- Why: the recap set ends on a stat today; a last card gives the year an ending and carries the brand in the one place a forward-looking line belongs.
- Change: `yearRecapCards` (`index.html:16505`) appends a card of a new `kind:'year-end'`. It has no stats: "That's your year." plus `APP_SLOGAN`, the week strip as data (weeks trained, in plate inks), and the Sash and wordmark. No address (D16), no body data (MKT-02), no load totals (D15). It's only built when the set has at least one other card. It follows the existing rule that hides Share on the medical program.
- Acceptance: the real `yearRecapCards` returns it last; the real `buildShareCardBlob` draws the slogan text once and no digit except the year; with no other cards, it's left out.
- Status if approved: `ready`, after the owner picks the line. This year it ships to the dogfood group only (D16), so it can be changed before December 2027's public recap.

**Copy edits (no item, owner sign-off only):** the landing hero H1 (`store/landing-page.md` §2.1), the store promotional text, the social bios and the support email signature, all as in §4.

---

## 8. Questions for the owner

1. **The line:** "Earn the next plate." (recommended), "A plan for every lifter.", or neither?
2. **Social handles:** may marketing check (not register) `platestep` on Instagram, TikTok, Threads, X and YouTube? Registering them is the owner's step.
3. **Counsel:** a knockout on the chosen line is cheap insurance before it goes on anything printed or paid for. Is it worth it now, or at the store launch?

---

## Sources (searched 2026-11-23)

- Echoes found: [Gym Gym: Gym Workout Tracker ("Rack, log, next set.")](https://apps.apple.com/app/id6446095965); [Just Lift Fitness LLC trademarks](https://trademarks.justia.com/owners/just-lift-fitness-llc-5852559); [JUST LIFT BY JUSTIN](https://trademarks.justia.com/908/54/just-lift-by-90854570.html); [Just Lift Be Fit (App Store)](https://apps.apple.com/us/app/-/id6747419034); [LESS ATTITUDE. MORE FITNESS. (trademark)](https://trademarks.justia.com/883/08/less-attitude-more-88308361.html); [Gym Reapers, "Earned, Not Given"](https://uk.gymreapers.com/blogs/news/earned-not-given); [Freeletics, "Earned. Not given."](https://www.freeletics.com/en/blog/posts/earned-not-given/); [Earned Not Given program (TrainHeroic)](https://marketplace.trainheroic.com/workout-plan/program/rogers-program-1623963683); [Learn to Lift (Playbook)](https://my.playbookapp.io/ashley-weingart/programs/learn-to-lift/35684); [Lift - Rest - Repeat (Product Hunt)](https://www.producthunt.com/products/lift-rest-repeat/alternatives); [NextLift: Barbell Tracker](https://apps.apple.com/au/app/id6780114731); [Gymshark "We Do Gym" (The Drum)](https://thedrum.com/news/2024/06/18/crack-the-us-gymshark-tones-up-positioning-with-singular-message-we-do-gym).
- "One plate at a time" in food use: [restaurant slogans (Eat App)](https://restaurant.eatapp.co/blog/restaurant-slogans); the iTunes Search API result "Plate: Meal Recipes for One".
- No exact-phrase use found for: "earn the next plate", "a plan for every lifter", "every lifter deserves a plan", "load the bar" with "log the set", "your next set, already planned", "plate by plate" as a fitness brand, "show up" with "we'll do the math", "stronger one plate at a time".
- Store rules: [App Store Connect Help, "App information"](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) (subtitle 30 characters), Apple guideline 2.3.7 (no prices in subtitles), as already cited in `store/app-store.md`.
