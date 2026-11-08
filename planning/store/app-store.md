# Apple App Store listing: Platestep

Owner: marketing-manager. Drafted 2026-11-08 against **v3.517** (`APP_NAME = 'Platestep'`, `index.html:7624`; `APP_VERSION = '3.517'`, `index.html:7618`). Builds on `planning/marketing.md` §2 and §4.1, `planning/naming.md`, `planning/design-directions.md` §5–§6 and `planning/alignment/marketing-manager.md`.

**Status: copy ready, listing not approved.** Nothing here is submitted. An App Store listing needs a native iOS build (none exists yet; the Capacitor effort is Android-only and owned elsewhere) and an Apple Developer Program membership, which costs money, so the whole listing is `needs-owner`. The App Review risk for a wrapped web app (guideline 4.2, minimum functionality) is noted in §8.

**Rules this copy holds itself to:**
- It leads with "tells you what to lift next".
- It makes no health claims. It never uses the words "safe", "rehab" or "prevents" (checked in §9).
- Every feature line is something v3.517 does today. §7 maps each line to the code, so it can be re-checked on submission day.
- No competitor names anywhere: not in keywords (Apple 2.3.7), not in the description.
- No price words in the name, subtitle or screenshots (Apple 2.3.7: "Metadata such as app names, subtitles, screenshots, and previews should not include prices"). "Free" appears only in the description.
- No ratings, review counts, user numbers or awards: we have none.

---

## 1. Field limits (verified 2026-11-08)

| Field | Limit | Source | Verified? |
|---|---|---|---|
| App name | 30 characters, at least 2 | App Store Connect Help, "App information" ("no more than 30 characters"); also App Review Guidelines 2.3.7 | **Yes**, Apple's own pages |
| Subtitle | 30 characters | App Store Connect Help, "App information" ("This can't be longer than 30 characters") | **Yes** |
| Promotional text | 170 characters, editable without a new build | App Store Connect Help, "Platform version information" | **Yes** |
| Description | 4,000 characters, plain text, no HTML | same page | **Yes** |
| Keywords | 100 **bytes**, each keyword more than two characters | same page | **Yes** |
| What's New | 4,000 characters | same page | **Yes** |
| Support URL, marketing URL | full URL including the protocol; no length given | same page | Yes (no limit stated) |
| Screenshots | up to 10 per device size; `.png`, `.jpg`, `.jpeg` | App Store Connect Help, "Screenshot specifications" | **Yes**; sizes in `screenshots.md` |
| Promotional text not indexed for search; description not indexed on iOS | — | third-party ASO guides only | **Not verified** with Apple. The copy doesn't depend on it: search terms sit in the name, subtitle and keywords |

---

## 2. Name and subtitle

**App name** (limit 30; this is 28)
```text
Platestep: Strength Training
```

**Subtitle** (limit 30; this is 27)
```text
Tells you what to lift next
```

Why:
- The name and subtitle are the only words a stranger reads in search results, so together they say what it is ("strength training") and what it does that others don't ("tells you what to lift next"). That's marketing.md §2.2's promise, word for word.
- "Strength Training" carries the highest-intent generic search phrase without naming anyone. "Workout Log" was the alternative; it describes the logbook every competitor is, not the coach. If the owner prefers the bare brand, use `Platestep` alone and move "strength" and "training" into the keywords (they fit: see §4).
- Apple indexes the name and subtitle together, so no word repeats between them and the keywords.
- Pronunciation and spelling: "Platestep", one word, capital P only. Never "PlateStep" or "Plate Step" (naming.md).

Alternative subtitles, all 30 or fewer: `Know what to lift next` (22, the older wording) · `Your next set, already planned` (30) · `The weight and reps, every set` (30).

---

## 3. Promotional text

(limit 170; this is 158) It sits above the description and can change without a new build, so it's where a launch-week or December note goes.

```text
Pick a program and Platestep tells you what to lift next: the weight and reps for every set, and when you've earned more. One tap logs it. No ads. No account.
```

Seasonal swap, December only, once MKT-06 (Year in Lifting) ships (limit 170; this is 117):
```text
Your Year in Lifting is ready: every training day, every record, made on your phone and shared only if you choose to.
```

---

## 4. Keywords

(limit 100 bytes; this is 98 bytes, ASCII only, so bytes = characters)

```text
workout,log,gym,tracker,program,progressive,overload,weightlifting,powerlifting,5x5,planner,deload
```

Rules followed:
- Comma-separated with no spaces (spaces waste bytes).
- No word that's already in the name or subtitle ("platestep", "strength", "training", "lift", "next"), because Apple combines them.
- **No competitor or third-party names.** Not Strong, Hevy, Fitbod, StrongLifts, Starting Strength, or any program trademark. "5x5" is the generic rep scheme, not a brand. If the owner wants to double-check it, swap it for `barbell` (7 bytes) and the field still fits.
- Singular forms: Apple matches plurals.
- No "free": it's pricing information (2.3.7).

Reserve words to rotate in after a month of watching which searches actually find us (App Store Connect's own search-term data, which needs no tracking in the app): `barbell`, `plate`, `calculator`, `bodybuilding`, `hypertrophy`, `split`, `rpe`, `logbook`.

---

## 5. Description

(limit 4,000; this is 2,320 characters including the placeholder note, leaving room for the "What's free" paragraph to be pasted verbatim in §5.1)

```text
Platestep tells you what to lift next.

Pick a program, and every set comes with a target: the weight and the reps. Do the set, tap once, and it's logged. Hit the top of your rep range two sessions in a row and Platestep tells you to add weight next time. Fall below the range and it tells you to go lighter. Grind at RPE 9 or higher for three sessions with nothing to show for it, and it suggests an easier week. That's the idea: an honest next step, one plate at a time.

THE NEXT SET, ALREADY PLANNED
• A target weight and rep count for every set, from your program and your own recent sessions
• Warm-up sets worked out from today's working weight
• A plate calculator, so you know what goes on the bar
• A rest timer that starts when you log a set

ONE TAP PER SET
• Log the suggested set with one tap, or change the weight, reps and RPE
• "Same as Last Time" repeats your previous session in one tap
• Works offline, so nothing has to load between sets

PROGRAMS THAT SHOW THEIR SOURCES
• Programs for strength, size, powerlifting, powerbuilding, Olympic lifting, calisthenics and bodyweight training at home
• Each program names the research or coaching practice it's built on, and says so plainly when the evidence is thin
• Deload weeks are planned into the program's cycle

SEE YOUR PROGRESS
• Personal records for every lift
• Training trends week by week, and a calendar of every session
• Optional logs for food, water, sleep and body weight, with food search from USDA FoodData Central and barcode lookup from Open Food Facts

PRIVATE BY DEFAULT
• No account and no ads
• Your training log is stored on your phone. There's no Platestep server holding it
• Back up your whole log to a file whenever you like, and restore it on a new phone
• Food searches go to the food databases named above. Optional AI features use an AI key you add yourself, and send only what you ask about, to that provider

FREE
Platestep is free, with no ads.
[At public launch, replace the line above with the "What's free" paragraph from planning/launch-copy/whats-free.md, pasted verbatim, so the store, the README, the landing page and the app say exactly the same thing. See §5.1.]

Platestep is a training log and planner, not medical advice. If you have a health condition, talk to your doctor before you start a new program.
```

### 5.1 The "What's free" paragraph

- The business manager is drafting the public wording at `planning/launch-copy/whats-free.md` (BIZ-18; owner decision D9(a): publish it at launch).
- The store description must use it **verbatim**, the same as the README, the landing page and the in-app note. BIZ-18's own test keeps the app and the README equal; add the store copy to the launch checklist (`README.md` in this folder) by hand, since the store isn't in the repo.
- Until then the placeholder line "Platestep is free, with no ads." is true today and promises nothing about the future.
- Apple allows pricing information in the description; it is the name, subtitle, screenshots and previews that must not carry prices (2.3.7). The draft BIZ-18 wording also mentions a possible future paid plan. That's accurate and fine in the description; just don't move it into the promotional text.

### 5.2 Lines deliberately left out

- **Program count ("25 programs").** v3.517 has 25 top-level keys in `programs` (`index.html:9693`), but some open into sub-programs, and the clinical programs are under clinician review (D9(e)) and may change before listing. A wrong number is a false claim, so the copy names the kinds instead. If the owner wants a number, BIZ-07's count rule decides it on submission day.
- **The clinical programs.** Not mentioned anywhere in store copy or screenshots until the clinician review (BIZ-15, D9(e)) is done. Their in-app names include a word this copy must not use.
- **"Evidence-based" as an adjective.** Replaced with the checkable version: each program names its source.
- **AI by brand name.** The provider is a third-party trademark; "an AI key you add yourself" is enough for a stranger. Naming it is the owner's call (`needs-owner` per the marketing rules).
- **Bib cards, "Your number", Year in Lifting, weekly streaks.** Not shipped at v3.517 (MKT-01, MKT-06, MKT-16, MKT-17). Each gets its own bullet in the What's New note of the version that ships it, then joins the description.
- **Import from other apps, CSV export.** Not shipped (BL-29, BL-22). v3.517 exports a JSON backup only (`index.html:34223`), which is why the copy says "back up to a file", not "export to CSV".

---

## 6. What's New template

(limit 4,000; aim for under 500 so it's read)

The in-app What's New (`WHATS_NEW`, `index.html:7636`) already writes one plain headline and one-sentence points per version. The store note reuses them, so there's one source of truth.

```text
{headline of the newest WHATS_NEW entry}

• {point 1, as in WHATS_NEW}
• {point 2}
• {point 3, at most}

Also in this update: {one line summarising any smaller WHATS_NEW entries since the last store release, or delete this line}

Your training log stays on your phone. Questions or problems: {SUPPORT_URL}
```

Rules:
- Name what changed for the lifter, not the code ("The rest timer now..." not "Refactored...").
- No superlatives, no "huge update", no countdowns or "limited time".
- A fix is called a fix. If a version changes or retires a feature for correctness, say so in plain words (business.md §3.3's promise depends on being open about it).
- The store build may bundle several web versions; list the user-visible ones, newest first.

Example (illustrative only; this is how MKT-01's weekly streak would read when it ships):
```text
Rest days no longer break your streak

• Your streak now counts weeks with at least two training days, so a 3-day plan earns one too.
• One missed day no longer breaks it. Rest days are part of the plan.

Your training log stays on your phone. Questions or problems: https://platestep.app/support
```
The first store release has no What's New (Apple shows it from the second version on). Before that, the promotional text carries any launch note.
(Support contact: `support@platestep.com`, the owner's customer-facing address, 2026-11-08. Apple's Support URL field needs a web page, so it points at the landing page's support link once that page exists; see `landing-page.md`.)

---

## 7. Age rating notes

Apple's questionnaire changed in 2025: the tiers are now 4+, 9+, 13+, 16+ and 18+, with new questions on medical or wellness topics, in-app controls and capabilities. Definitions below are quoted from App Store Connect Help, "Age ratings values and definitions" (read 2026-11-08). The deadline for answering the new questions was reported as 31 January 2026 and later moved for some cases (third-party reports only; App Store Connect will ask anyway on first submission).

| Question | Our honest answer | Why | Effect |
|---|---|---|---|
| **Health or Wellness Topics** ("self-care or lifestyle recommendations. May include: calorie tracking, dieting advice, or exercise recommendations") | **Yes** | Programs recommend exercises; the food log tracks calories | **9+** |
| **Medical or Treatment Information** ("diagnoses or guidance around the management of medical conditions or health and wellness. May include: medication guidance, emergency medical care, or treatment information") | **Infrequent**, if the clinical programs, the condition-aware supplement notes, or the blood pressure and glucose logs ship in the store build; **None** only if they're held back | The clinical programs give exercise guidance around specific conditions. Answering "None" with them present would be a false declaration | **13+** if Infrequent |
| Unrestricted Web Access | **No** | The app doesn't browse the web. External links open the system browser | — |
| User-Generated Content | **No** | Nothing a user writes is distributed to other users. Share images go through the phone's own share sheet | — |
| Messaging and Chat | **No** | The AI coach chat is with a model, not with other people | — |
| Advertising | **No** | No ads | — |
| Social Media | **No** | No feed | — |
| Violence, sexual content, profanity, gambling, alcohol/tobacco/drugs, horror | **None** | — | — |
| Age assurance, parental controls | No in-app controls | — | — |

**Recommendation: expect 13+, and declare it honestly.** It costs us nothing (the target user is an adult lifter), and over-declaring costs less than a rejection or a later correction. If the clinician review (D9(e)) removes the clinical programs from the store build, re-answer and the rating likely falls to 9+.

Separately, App Review guideline 1.4.1 reviews medical apps more strictly. We avoid the Medical category and any medical claim (§8), and the description's last line reminds people to see a doctor if they have a condition, as 1.4.1 asks of medical apps.

Metadata must suit a 4+ audience whatever the rating (2.3.8): no shirtless progress photos, no body-measurement screenshots.

---

## 8. Category

- **Primary: Health & Fitness.** It's where every competitor sits (`research.md` §1) and where people browse for a workout app. There is no "Sports training" category; Sports is for sports content and scores.
- **Secondary: none.** The candidates don't fit: **Sports** would mislead (no teams, scores or news); **Lifestyle** is too broad to help; **Food & Drink** would oversell a secondary feature; and **Medical** would invite 1.4.1 scrutiny and imply a claim we don't make. A secondary category is optional, so leave it empty rather than pick a wrong one.

**Review risk to raise with the owner (not a copy issue):** guideline 4.2 rejects apps that are "a repackaged website" without "features, content, and UI that elevate it". A Capacitor wrapper around the PWA is a known rejection risk. Our case is strong: offline logging, a rest timer, a plate calculator, on-device storage, share images and no web chrome. But it should be judged by whoever owns the native build, before money is spent on the developer membership.

---

## 9. Checks run on this copy

- **Lengths:** every fenced field above was counted with a script on 2026-11-08 (characters via JavaScript string length; keywords via UTF-8 byte length). Re-run before submitting, because any edit changes them:
  `node -e "for (const s of process.argv.slice(1)) console.log(s.length, Buffer.byteLength(s), s)" "Platestep: Strength Training" "Tells you what to lift next"`
- **Banned words** ("safe", "rehab", "prevents", plus "prevent", "cure", "treat", "heal", "injury-free"): none in any field (`grep -inE` over this file's fenced blocks).
- **Competitor names:** none in any field.
- **Claims:** each feature line maps to code below.

| Copy line | Where it's true in v3.517 |
|---|---|
| Target weight and reps for every set | `recommendNextSet` and the set chips (`test-next-set-recommendation.js`, `test-set-chips.js`) |
| "add weight next time" after two sessions at the top of the range | `index.html:27532` ("Hit … for 2 sessions straight — add … next time") |
| "go lighter" below the range | `index.html:27518` |
| Easier week after three RPE 9+ sessions | `index.html:27505` |
| Warm-up sets from today's weight | Gym mode's "Suggested warm-up ramp" (seen in the harness, `gym-dark-402`); `test-warmup-ramp-and-plates.js` |
| Plate calculator | `index.html:4221` (set-row plate calculator button) |
| Rest timer starts on logging | `startRestTimer` called on a real set, `index.html:32040` |
| "Same as Last Time" | `WHATS_NEW` 3.86 and 3.89 |
| Works offline | `sw.js` precache |
| Each program names its source | the `basis` table, `index.html:11189` onward; `test-citation-audit.js` |
| Deload weeks in the cycle | `isDeloadWeek`, `index.html:14926`; `test-mesocycle-phase-tag.js` |
| Personal records | `test-pr-timeline.js` |
| Calendar of every session | History's Day-by-Day Log (`test-history-heatmap.js`) |
| USDA food search, Open Food Facts barcodes | `index.html:35042` (USDA, public demo key, rate-limited) and `index.html:35167` (Open Food Facts) |
| Backup to a file and restore | `index.html:34223` (JSON export) and `#importDataInput` (`index.html:6246`) |
| No account, no ads | No sign-in or ad code exists (search the file for an ad SDK or auth flow: none) |
| AI with your own key | `callClaudeChat`; the key prompt (`test-ai-key-validation.js`) |

## Sources

- [App Store Connect Help: App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) (name and subtitle limits, age rating at app level)
- [App Store Connect Help: Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information) (promotional text, description, keywords, What's New)
- [App Store Connect Help: Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
- [App Store Connect Help: Age ratings values and definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (1.4.1, 2.3.3, 2.3.7, 2.3.8, 4.2)
- [9to5Mac: Apple notifies developers of new age rating system (2025-07-24)](https://9to5mac.com/2025/07/24/apple-notifies-developers-of-new-app-store-age-rating-system/) and [Sonar: App Store age rating, new tiers](https://trysonar.app/blog/app-store-age-rating) (deadline reports; third-party)
