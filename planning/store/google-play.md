# Google Play listing: Platestep

Owner: marketing-manager. Drafted 2026-11-08 against **v3.517**. Same promise, rules and claim map as `app-store.md` (§9 there maps every feature line to the code). This file holds what's different on Play.

**Status: copy ready, listing not approved.** The Android build is the Capacitor effort, owned elsewhere; this file doesn't touch it. Publishing needs a Play developer account (a one-time fee, so `needs-owner`) and decision D9(f) (personal or organisation account) is still open.

---

## 1. Field limits

Google's own help pages (`support.google.com`) weren't reachable from this session, so the limits below come from Google's 2021 policy announcement and from consistent third-party guides. **Check each in the Play Console form on the day.**

| Field | Limit | Source | Verified? |
|---|---|---|---|
| App name (title) | **30 characters** | Google's 2021 metadata policy cut titles from 50 to 30; enforced from late 2021 (Android Developers Blog, April 2021; Gummicube, Apptamin). One recent guide still quotes 50 | **Partly**: consistent secondary sources; the official page wasn't reachable. Writing to 30 fits either |
| Short description | **80 characters** | Google Play Console Help, as quoted in search results ("80 characters or less") | **Partly**: Google's wording via search snippet |
| Full description | **4,000 characters** | same, plus every guide | **Partly** |
| Title, icon, developer name: no "free", "best", "top", "#1", "no ads", "ad free", emoji, or all caps (unless the brand) | — | 2021 policy as reported (Android Developers Blog; Gummicube; MobileSyrup) | **Partly** |
| Preview assets (screenshots, feature graphic): no price or ranking words, no "free"/"best" buzzwords, no calls to action like "download now" | — | Play Console Help as quoted in search results; Android Developers Blog 2021 | **Partly** |
| Screenshots, feature graphic, icon | see `screenshots.md` §4 | — | Partly |

---

## 2. Title

(limit 30; this is 28)
```text
Platestep: Strength Training
```
Same as the App Store name, so a friend who heard about it finds one name on both stores. No promotional words, emoji or capitals, per Play's title policy.

---

## 3. Short description

(limit 80; this is 78) It's the line under the screenshots, and Play's search reads it.

```text
Tells you what to lift next: weight and reps for every set, logged in one tap.
```

Why no "free" or "no ads" here: Play's 2021 guidance bans those words in the title and steers preview assets away from them, and reports say the restriction is creeping into the short description. "Free, no ads" is true and lives in the full description, where price information is normal. Losing it here costs little: on Play the price shows as "Free" beside the Install button anyway.

Alternatives (all 80 or fewer): `Your next set, planned: target weight and reps, one-tap logging, honest progress` (80) · `Pick a program; Platestep sets the weight and reps for every set and when to add` (80)

---

## 4. Full description

(limit 4,000; this is 2,399 characters including the placeholder note) Play indexes the full description for search, so it names the things people search for in plain sentences (workout log, gym tracker, progressive overload, powerlifting, bodyweight training). Each appears once or twice: Play's metadata policy rejects repeated keyword lists.

```text
Platestep tells you what to lift next.

Pick a program, and every set comes with a target: the weight and the reps. Do the set, tap once, and it's logged. Hit the top of your rep range two sessions in a row and Platestep tells you to add weight next time. Fall below the range and it tells you to go lighter. Grind at RPE 9 or higher for three sessions with nothing to show for it, and it suggests an easier week. That's progressive overload without the spreadsheet: an honest next step, one plate at a time.

It's a workout log and a gym tracker, but the point is the plan. You open it and the next set is already there.

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
[At public launch, replace the line above with the "What's free" paragraph from planning/launch-copy/whats-free.md, pasted verbatim. See app-store.md §5.1.]

Platestep is a training log and planner, not medical advice. If you have a health condition, talk to your doctor before you start a new program.
```

The words "safe", "rehab" and "prevents" don't appear (checked with `grep -inE`), and no competitor is named.

---

## 5. Category, tags, rating and declarations

- **Category: Health & Fitness.** Same reasoning as `app-store.md` §8. Not Medical.
- **Tags:** Play lets you pick store-listing tags in the Console. Pick the closest to "workout tracker", "strength training" and "fitness" from Google's list on the day (the list itself wasn't verifiable here).
- **Content rating (IARC questionnaire):** answer as on Apple (`app-store.md` §7): no violence, sexual content, profanity, gambling or drugs; no user-to-user communication; no sharing of location; no unrestricted web. Expect the lowest or a low rating. Declare health and fitness content honestly where asked.
- **Target audience:** recommend **18 and over** at launch. It keeps the app out of Play's Families policy obligations, matches business.md's target user, and avoids any question about clinical content for minors. Revisit after the clinician review (D9(e)).
- **Ads declaration:** "No, my app does not contain ads."
- **Data safety form:** a draft belongs with the privacy page (BIZ-16), not here, but marketing's copy depends on it, so note the honest edges:
  - Training, body and food logs are stored on the device and never sent to us.
  - Food search terms and barcodes are sent to USDA FoodData Central and Open Food Facts when the person searches.
  - With an AI key added, the parts of the log the person asks about are sent to the AI provider.
  - Whether Play counts these as "collected" or "shared" (Play has exceptions for user-initiated transfers and ephemeral processing) is the privacy owner's call. **The copy "Your training log is stored on your phone" stays true either way; never shorten it to "no data leaves your phone."**
- **Health apps declaration:** Play has asked health and fitness apps to complete a health declaration in App content. Its current form wasn't verifiable here; complete it to match the Data safety answers.
- **New personal developer accounts** have had to run a closed test (reported as 12 testers for 14 days since late 2024) before production. Not verified this session. If it still applies, the soft-launch friends (marketing.md §4.3, step 1) are the closed test, which pitch.md D9(f) already anticipates ("founding members as the 12 testers").

---

## 6. Store listing graphics

Specs and the storyboard are in `screenshots.md` §4. The one Play-only asset:

**Feature graphic, 1024 × 500**, JPEG or 24-bit PNG with no alpha (third-party guides; Play Console on the day). Content:
- Left: the Sash mark and "Platestep" in Archivo.
- Right: the loaded bar from the bib (marketing.md §3.4) in the day's plate inks.
- One line: "Tells you what to lift next".
- No "free", no device frame with another brand, no call to action, no badge or ranking.
- Keep text away from the edges: Play may overlay a play button or crop the graphic in some placements (third-party guides; not verified).

## Sources

- [Android Developers Blog: Updated guidance to improve your app quality and discovery on Google Play (April 2021)](https://android-developers.googleblog.com/2021/04/updated-guidance-to-improve-your-app.html)
- [Gummicube: Google Play changes coming in 2021](https://www.gummicube.com/blog/google-play-changes-coming-in-2021)
- [Apptamin: New ASO rules coming to the Play Store](https://www.apptamin.com/blog/new-aso-rules-coming-to-the-play-store)
- [MobileSyrup: Google Play Store policy app listing changes (2021-05-01)](https://mobilesyrup.com/2021/05/01/google-play-store-policy-app-listing-changes/)
- [InspiringApps: Google Play store listing guide (2026)](https://www.inspiringapps.com/blog/google-play-store-listing)
- [Play Console Help: Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) (cited through search results; the page wasn't reachable from this session)
