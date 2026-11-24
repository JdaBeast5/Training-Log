# Slogan: should Platestep have one, and where does it go?

Owner: marketing-manager. Written 2026-11-23 against live **v3.645** (`APP_NAME = 'Platestep'`, `index.html:8555`). The owner asked: "Should we add a slogan somewhere? Let's tinker around on that." Inputs: `marketing.md` §2 (name rules, promise, voice), `naming.md` §3.1 and §4 (the "one plate at a time" story), `store/` (the subtitle "Tells you what to lift next"), `launch-copy/whats-free.md`, `design-vision.md` (Plate & Press, the Sash) and the bib mock-up `tools/design/directions/c-card.html`.

**Nothing here is a legal clearance.** Every screen below is a web search, plus Apple's iTunes Search API for the exact phrase in app titles and descriptions (US store, 25 results). No USPTO, EUIPO or WIPO search was run. Counsel should knock out the chosen line before it's printed on anything paid for.

**Decided (§10, 2026-11-24).** The owner picked the slogan **"Plate by plate, step by step."** and the cheer **"Step up a plate!"**. The items are MKT-21, MKT-22 and MKT-23 in `backlog.md`. §1 to §9 are kept as the record of how the lines were chosen; where they still say "Earn the next plate.", §10 wins.

---

## 0. The short answer

**Owner's decision, 2026-11-24 (§10):** "I love what you came up with there! The main slogan and the cheer! Let's implement that."

- **The slogan: "Plate by plate, step by step."** (28 characters). It's kept separate from the store subtitle, which stays "Tells you what to lift next" because that's what search reads. The slogan goes where a person reads the brand:
  - the landing hero (H1);
  - the social bio;
  - a new line in the footer under Settings, above the version line (MKT-21);
  - the last card of Year in Lifting (MKT-22);
  - the store promotional text.
- **The brand hashtag: `#PlateByPlate`.**
- **The cheer: "Step up a plate!"** It shows only when the app has really raised a lift's weight above last time (MKT-23). When the weight holds, drops or deloads, nothing is said, so the line is always true.
- **The progression sign-off: `#StepUpAPlate`.** It replaces `#EarnTheNextPlate` on progression posts.
- **Where the cheer goes on the bib and on Today** waits on the owner's pick from the renders in §10.3 (bib options A, B and C; Today options T1 and T2).
- **Not changed:** the store subtitle; the launch animation (still wordless); and the bib's event band, which is full.

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

## 9. Round 2: lines built on the name (Plate + Step)

The owner liked round 1 but wanted a line built on the name, as in "One step to the next plate". The coordinator brainstormed 12 more; marketing added 4 (14 to 17). Each is judged from two angles, because the owner asked for the marketing manager and the social media manager to pick together, and this file covers both jobs.

### 9.1 The screen (2026-11-23, same method as §2)

- **Web search, exact phrase,** for all 17, with trademark aggregators in the results. **No exact-phrase use was found for any of them** in fitness branding or trademarks. The conflicts below come from the parts of each line, not the whole.
- **iTunes Search API, exact phrase in titles and descriptions:** zero hits for all 17. The fragment "small steps" alone returned three apps: a habit tracker, a baby-footprint app and a running app.
- **Fit**, measured with `node tools/design/slogan/render.js 2` (results in `renders/r2-fit.json`):
  - **Subtitle:** Apple's limit is 30 characters.
  - **Bib band:** the 734 px rule from §2 applies. The band is already full, so no line goes on the bib; only "We'll plan the steps. You lift the plates." is too wide even on its own (818 px).
  - **End card:** line count at 230 px. The mock-up steps the size down for longer lines.
  - **Bio:** every line fits 150 characters together with the two promise lines.

**Conflicts and echoes found:**

| # | Line | Conflict |
|---|---|---|
| 3 | Step up to the next plate. | It's the baseball idiom "step up to the plate" with one word added. That helps recall but can't be owned. "Step-up plate" is also rack hardware sold by Synergee and Powertec, and a step-up is an exercise |
| 4 | One step closer to the next plate. | "One Step Closer" is a well-known Linkin Park song title |
| 5 | Step up a plate. | It reads as an exercise (a step-up on a plate) or as the rack attachment, the same problem that ruled out Platerise in naming.md |
| 7 | Small steps. Heavy plates. | "Small steps" is crowded: SMALL STEPS THAT LEAD TO BIG RESULTS (registered, no. 5065215), THE POWER OF SMALL STEPS (owned by a fitness institute, for education services), SMALL STEPS = BIG CHANGES (filed 2024, wellness coaching), and a "Small Steps" step-count app |
| 11 | Stack the steps. | StepStack is a UK step-count app that turns steps into coins, and STEPSAPP is a step-tracking mark. "Steps" alone reads as step counts, the risk naming.md §3.1 warned about |
| 13 | We'll plan the steps. You lift the plates. | It echoes Kodak's "You press the button, we do the rest". It's also 42 characters, too wide for the band, and twice the word target |
| 9, 10 | Every step adds a plate. / Every rep a step. Every step a plate. | **Untrue.** Not every session adds weight: progression holds, drops the weight or suggests an easier week. This is a results claim the code contradicts |
| 2 | The next plate is one step away. | It promises how close the next plate is. Under the progression rules it is usually two sessions or more away |
| 8, 16 | Step by step. Plate by plate. / Plate by plate, step by step. | No conflict found. Both halves are idioms, so the line can't be registered as a mark on its own. Next to the name it is distinctive. "Plate by plate" alone could read as cooking. The searches found no cookbook or restaurant with that title, and `#platebyplate` turned up no indexed use, though the networks themselves weren't searched |

### 9.2 Scores

Each criterion is scored 1 to 5.

**(a) Brand and growth, out of 25:**
- **R:** does it bring the name to mind (both "plate" and "step")?
- **O:** can we own it (clean screen, distinctive)?
- **L:** does it read as lifting, not food or step counts?
- **H:** is it honest, with no results claim?
- **M:** does it fit the mission (guidance for the people who need it) and support Plus?

**(b) Social and content, out of 20:**
- **T:** does it work as a hashtag or a recurring series?
- **B:** does it work as a bio line?
- **C:** does it work as the caption hook on a set video?
- **S:** is it chantable and shareable?

**Top 8.** Round 1's pick is included as the benchmark; it isn't a round-2 line.

| Rank | Line | Chars | R | O | L | H | M | **(a)** | T | B | C | S | **(b)** | **Total /45** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Plate by plate, step by step.** (16, marketing) | 28 | 5 | 3 | 4 | 5 | 4 | **21** | 5 | 5 | 4 | 5 | **19** | **40** |
| (benchmark) | Earn the next plate. (round 1) | 20 | 3 | 5 | 5 | 5 | 3 | 21 | 5 | 5 | 5 | 4 | 19 | 40 |
| 2 | **Earn the next plate, step by step.** (17, marketing) | 33 | 5 | 4 | 5 | 5 | 4 | **23** | 4 | 4 | 5 | 3 | **16** | **39** |
| 3 | Step by step. Plate by plate. (8) | 29 | 5 | 3 | 3 | 5 | 4 | 20 | 4 | 4 | 4 | 5 | 17 | 37 |
| 4 | Step by step to the next plate. (14, marketing) | 30 | 5 | 4 | 4 | 5 | 4 | 22 | 3 | 4 | 4 | 3 | 14 | 36 |
| 5 | One step to the next plate. (1, the owner's) | 26 | 5 | 4 | 4 | 3 | 4 | 20 | 3 | 5 | 4 | 3 | 15 | 35 |
| 6 | One step. One plate. (6) | 20 | 5 | 4 | 3 | 3 | 2 | 17 | 4 | 4 | 4 | 5 | 17 | 34 |
| 7 | We'll plan the steps. You lift the plates. (13) | 42 | 5 | 3 | 5 | 5 | 5 | 23 | 1 | 4 | 3 | 2 | 10 | 33 |
| 8 | Step up to the next plate. (3) | 26 | 5 | 2 | 3 | 4 | 3 | 17 | 3 | 4 | 4 | 4 | 15 | 32 |

Line 13 ranks 7th on its brand score, but it can't be the slogan: it's 42 characters and echoes Kodak. Use it in long copy, such as a landing-page section or a launch post.

**The rest:**

| Line | (a) | (b) | Total | Main reason it ranks lower |
|---|---|---|---|---|
| One step closer to the next plate. (4) | 20 | 11 | 31 | The Linkin Park echo; 34 characters |
| Small steps. Heavy plates. (7) | 16 | 15 | 31 | The "small steps" marks; "heavy" hints at an outcome |
| Step up a plate. (5) | 16 | 13 | 29 | Reads as an exercise or rack hardware |
| The next plate is one step away. (2) | 18 | 10 | 28 | Promises how close the next plate is |
| Every step adds a plate. (9) | 15 | 12 | 27 | Untrue in code |
| Your next step, already planned. (12) | 17 | 9 | 26 | No plate; a generic "next step" |
| Every rep a step. Every step a plate. (10) | 14 | 12 | 26 | Untrue; 37 characters |
| Stack the steps. (11) | 13 | 12 | 25 | Reads as step counts; StepStack |
| Next step: the next plate. (15, marketing) | 19 | 12 | 31 | Clear, but flat as a hashtag or chant |

**About the owner's line, "One step to the next plate."** It's the clearest name line on the list and a good bio line. It scores lower only on honesty: "one step" sounds like the next plate is a session away, and the rules usually take two or more. "Step by step to the next plate." (14) keeps his idea and fixes that word.

### 9.3 Recommendation

**Winner: "Plate by plate, step by step."** (28 characters)
- **(a) Brand and growth:**
  - It says both halves of the name, plate first, as marketing.md §2.1 requires ("lead with the plate, never with step"). Anyone who hears the slogan can rebuild the name.
  - It promises nothing about results. It describes patience, which is the honest truth about progressive overload and suits beginners who need guidance.
  - Its weakness is ownability: two idioms can't be registered as a mark. Next to the name and the Sash it still reads as ours.
  - The food reading of "plate by plate" disappears beside the bar, the bib and the word "step".
  - It fits Plus without overselling it: the free app gives the steps, and Plus adds coaching notes on top.
- **(b) Social and content:**
  - It's the most chantable line on the list.
  - **`#PlateByPlate`** is short and works as a series: "Plate by plate, week 3", a creator's 12-week log, or a December recap.
  - It fits a bio in one line, and as a set-video caption it turns any increment into a story ("+5 lb. Plate by plate.").

**Runner-up: "Earn the next plate, step by step."** (33 characters)
- **(a) Brand and growth:**
  - It scores highest on brand (23/25). It keeps round 1's honest, true-in-code rule ("earn") and adds the name.
  - Of the strong lines it is the clearest about lifting: "earn the next plate" can only mean the bar.
- **(b) Social and content:**
  - It's weaker, because it's long: 33 characters, five lines on the end card at full size, and a hashtag that's too long to chant.
  - It is the best caption hook for the moment the app says "add weight next time".
- **How to use it:** keep `#EarnTheNextPlate` as the caption sign-off for exactly those progression posts, alongside the main hashtag.

**Placement is unchanged from §4.** Only the line changes. The store subtitle stays "Tells you what to lift next". The winner and runner-up are both too long to replace the subtitle well anyway (28 characters fits Apple's 30 but carries no search word).

**Social bio (Instagram, Threads, X; 145 of 150 characters):**

```
Plate by plate, step by step.
A free strength tracker that tells you what to lift next.
Programs that progress with you. One-tap logging. No ads.
```

**TikTok (78 of 80 characters):**

```
Plate by plate, step by step. A free tracker that tells you what to lift next.
```

**Hashtags:** `#PlateByPlate` is the brand tag and the series. `#EarnTheNextPlate` is the sign-off on progression posts. Before launch, check both on Instagram and TikTok in the apps themselves; web search doesn't index hashtags. Don't use a tag someone else's community already owns.

**Email signature:** `Platestep · Plate by plate, step by step.`

### 9.4 Mock-ups (round 2)

These show the top three by what they offer, not strictly by score:
1. the winner (16);
2. the runner-up (17);
3. the owner's own line (1), so he can see it beside the others.

Line 8 ranks third by score but is line 16 with its halves swapped, so a render of it would show nothing new.

- **Files:** `tools/design/slogan/renders/r2-*.png` and `r2-contact-sheet.png`.
- **Rendering:** run `node tools/design/slogan/render.js 2`. The pages take `?r=2&s=1|2|3`.
- **Size steps:** lines over 24 characters step down to 104 px in the hero. On the end card, lines over 24 characters drop to 186 px and lines over 30 drop to 168 px.
- **Round 1 change:** the round-1 render of "Load the bar. Log the set." now uses the smaller hero size too. That change is mine: the hero rule moved, and the round-1 wording is untouched.

**What the renders show:**
- **The winner** sets in two even lines on the hero and three on the end card. Its rhythm carries without the sub.
- **The runner-up** needs three lines on the hero and still feels long.
- **The owner's line** sets cleanly in two lines. On the Year in Lifting end card ("That's your year. One step to the next plate.") it reads well, but it implies next year is one step away.

### 9.5 Proposed items, updated

MKT-21 (the footer line) and MKT-22 (the Year in Lifting end card) in §7 are unchanged; only the text of `APP_SLOGAN` changes. They still wait for the owner's pick.

---

## 10. Owner's decision (2026-11-24)

The owner wrote: "I love what you came up with there! The main slogan and the cheer! Let's implement that, I'll need renderings of what the bib concept would look like". The coordinator passed this on, and it is recorded here as the decision.

### 10.1 The two lines

| | Line | Job | Where | Hashtag |
|---|---|---|---|---|
| **Slogan** | **Plate by plate, step by step.** | Says the brand: patience, both halves of the name, plate first (§9.3) | The landing hero H1; the social bio; a footer line in Settings, above the version line (MKT-21); the last card of Year in Lifting (MKT-22); the store promotional text | `#PlateByPlate` (the brand tag and the series) |
| **Cheer** | **Step up a plate!** | Celebrates the one moment the app adds weight | The bib and Today, only on a raised lift (MKT-23) | `#StepUpAPlate` (the sign-off on progression posts; it replaces `#EarnTheNextPlate`) |

**The cheer's honesty rule.** "Step up a plate!" shows only when the app's own progression has raised a lift's weight above last time. That means the suggestion from `computeSuggestedSet` (`index.html:30718`) has reason `'increase'`, and its weight is heavier than the session it's compared with. It never shows when the weight holds, drops or deloads. It never shows on the first-ever session of a lift, since there's no "last time". It never shows on the clinical programs, where Share is hidden. So the line is always true. It reuses the decision the set fields, the badge and the finish sheet already make; there is no second rule.

**About §9.1's note on "Step up a plate."** Round 2 marked it down as a slogan, because on its own it reads as an exercise (a step-up) or as rack hardware. As the cheer, it always sits next to a lift and a heavier weight ("Bench Press · 185 lb × 6 · Step up a plate! Next time 190 lb"), and that context makes it read as the bar. The exclamation mark is the cheer's; the slogan keeps its full stop.

### 10.2 Copy, ready to use

- **Social bio (Instagram, Threads, X; 145 of 150 characters):** unchanged from §9.3. It already leads with "Plate by plate, step by step."
- **TikTok (78 of 80):** unchanged from §9.3.
- **Landing hero:** H1 "Plate by plate, step by step."; the sub is the promise ("A free strength tracker that tells you what to lift next."). The `<title>` and meta description keep "tells you what to lift next" (§4).
- **Store promotional text (165 of 170).** The December seasonal swap in `store/app-store.md` §3 is unchanged.
  ```text
  Plate by plate, step by step. Platestep tells you what to lift next: weight and reps for every set, and when you've earned more. One tap logs it. No ads. No account.
  ```
- **Email signature:** `Platestep · Plate by plate, step by step.`
- **Progression post caption, the pattern:** "+5 lb on bench. Step up a plate! #StepUpAPlate #PlateByPlate". Post it only when the app really added weight, the same rule the app follows.
- **Hashtag check:** before launch, check `#PlateByPlate` and `#StepUpAPlate` in the Instagram and TikTok apps themselves, because web search doesn't index hashtags (§9.3).

### 10.3 The cheer on the bib and on Today: renders

- **Contact sheet:** `tools/design/cheer/renders/contact-sheet.png` (DPR 2). The single renders sit beside it.
- **Re-render:** `node tools/design/cheer/render.js` from the repo root.
- **How it's drawn:** the script runs the app's real `finishSheetModel`, `buildShareCardBlob` and `drawBibCard` in Playwright Chromium, with the harness's fixture and frozen clock. A prototype patch is applied in memory to the served `index.html` (three anchors, each asserted to match once). The repo's `index.html` is never changed.
- **The seed:** today's Bench Press is 185 lb × 6 on every set, which is the top of 4-6, so the real engine raises it to 190 lb for next time. For "before", the harness's own fixture is used (185 × 5, 5), where next time holds and the patched code draws no cheer. The script fails if the cheer shows on the hold, or doesn't show on the raise.

**Bib placements:**

| Option | What it is | For | Against |
|---|---|---|---|
| **A: the next line** | "Step up a plate!" goes in the place of the lead lift's note, set in the display face, with "Next time 190 lb" after it in the note's grey. It uses the day's ink where that ink holds 3:1 on the bib's paper (red, blue, green); otherwise (yellow, white) it uses the bib's black | It *is* the honest next-time line, said as a cheer. Nothing moves when it's absent. It sits clear of the milestone stamp (rendered). It reads on every ink and on the photo bib | It's the quietest of the three at thumbnail size |
| **B: the stamp** | A second rubber stamp beside the big number ("STEP UP A PLATE!", "NEXT · 190 LB"), in the same ink rule. The note is kept | The most "race bib" of the three | On a milestone day there are two stamps (rendered), and they compete. A three-digit number (No. 212) would collide with the stamp unless the number shrinks |
| **C: the second band** | A band in the day's ink above the tear-off tabs, the event band's twin, with "STEP UP A PLATE!" and "NEXT · 190 LB" | The loudest of the three, and it reads from across a feed | It breaks the bib's "one event band" rule (marketing.md §3.4) and drops the note. A raised day and a hold day then look like different cards |

**Recommendation: A.** It turns the line the bib already carries into the cheer, exactly when that line says "up a step", so the card stays one honest object and nothing else moves. It is the only option that coexists cleanly with the No. 50 stamp, and it holds contrast on all five inks.

**Today placements (402 px, dark and light):**
- **T1, the cover:** under the lift name and prescription, in the cover's display face: "Step up a plate! +7.5 lb on last time". It shows only while the cover shows the raised lift.
- **T2, the list row:** under the exercise name in "Then", where the "+1 set" note sits: "Step up a plate! 155 lb, +5 on last time". It shows for raised lifts that aren't on the cover.

**Recommendation: T1 alone.** The cover is where the eye is while you load the bar, and one line there is the moment. T2 repeats the line down the list on a day when several lifts go up. That adds noise to the list UX-36 just made compact, and the up arrows on the chips already mark those sets.

**Checked in the renders:** no clipping or overlap on red, yellow, white or the photo bib. On the bib, the cheer stays inside the y 250–1620 text band. On Today, the cover line fits on one line at 402 px, in dark and light.

**Seen while rendering, flagged and not changed:**
- The bib's event band reads "WK 9", while Today's header in the same fixture reads "Week 4 of 5". The bib counts weeks since the program started; Today counts the week of the block. That may be intended, but it's worth a look. *(Now BL-78, 2026-11-24.)*
- The footer's grey (`#4A5057` on the dark ground) is under 4.5:1. MKT-21 gives its own new line a passing colour and leaves the version line alone. *(Now UX-51, 2026-11-24.)*

### 10.4 Items

- **MKT-21:** `APP_SLOGAN` beside `APP_NAME`, and the footer line. `ready`.
- **MKT-22:** the Year in Lifting end card. `ready`. Slotted ahead of the tab audit, because the window opens 1 December.
- **MKT-23:** the "Step up a plate!" cheer. The owner picked bib **A** (the next line) and Today **T1** (the cover) on 2026-11-24 ("Go with your recommendations"). It's `ready` after MKT-21.

---

## Sources (searched 2026-11-23)

- Echoes found: [Gym Gym: Gym Workout Tracker ("Rack, log, next set.")](https://apps.apple.com/app/id6446095965); [Just Lift Fitness LLC trademarks](https://trademarks.justia.com/owners/just-lift-fitness-llc-5852559); [JUST LIFT BY JUSTIN](https://trademarks.justia.com/908/54/just-lift-by-90854570.html); [Just Lift Be Fit (App Store)](https://apps.apple.com/us/app/-/id6747419034); [LESS ATTITUDE. MORE FITNESS. (trademark)](https://trademarks.justia.com/883/08/less-attitude-more-88308361.html); [Gym Reapers, "Earned, Not Given"](https://uk.gymreapers.com/blogs/news/earned-not-given); [Freeletics, "Earned. Not given."](https://www.freeletics.com/en/blog/posts/earned-not-given/); [Earned Not Given program (TrainHeroic)](https://marketplace.trainheroic.com/workout-plan/program/rogers-program-1623963683); [Learn to Lift (Playbook)](https://my.playbookapp.io/ashley-weingart/programs/learn-to-lift/35684); [Lift - Rest - Repeat (Product Hunt)](https://www.producthunt.com/products/lift-rest-repeat/alternatives); [NextLift: Barbell Tracker](https://apps.apple.com/au/app/id6780114731); [Gymshark "We Do Gym" (The Drum)](https://thedrum.com/news/2024/06/18/crack-the-us-gymshark-tones-up-positioning-with-singular-message-we-do-gym).
- "One plate at a time" in food use: [restaurant slogans (Eat App)](https://restaurant.eatapp.co/blog/restaurant-slogans); the iTunes Search API result "Plate: Meal Recipes for One".
- Round 2: [SMALL STEPS THAT LEAD TO BIG RESULTS (trademark)](https://trademarks.justia.com/866/40/small-steps-that-lead-to-big-86640349.html); [Institute for Fitness & Health, Inc. trademarks (THE POWER OF SMALL STEPS)](https://trademark.justia.com/owners/institute-for-fitness-health-inc-3201032); [SMALL STEPS = BIG CHANGES, LLC](https://trademark.justia.com/owners/small-steps-big-changes-llc-5844630); [Small Steps (App Store)](https://apps.apple.com/si/app/small-steps/id6445825563); [StepStack (App Store)](https://apps.apple.com/gb/app/stepstack/id1611345028); [STEPSAPP (trademark)](https://trademarks.justia.com/792/01/stepsapp-79201044.html); [Synergee step-up plate](https://www.living.fit/products/synergee-pull-up-step-up-plate); [Powertec step-up plate attachment](https://www.topfitness.com/products/powertec-step-up-plate-attachment). Linkin Park's "One Step Closer" and Kodak's "You press the button, we do the rest" are general knowledge, not searched.
- No exact-phrase use found for: "earn the next plate", "a plan for every lifter", "every lifter deserves a plan", "load the bar" with "log the set", "your next set, already planned", "plate by plate" as a fitness brand, "show up" with "we'll do the math", "stronger one plate at a time".
- Store rules: [App Store Connect Help, "App information"](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) (subtitle 30 characters), Apple guideline 2.3.7 (no prices in subtitles), as already cited in `store/app-store.md`.
