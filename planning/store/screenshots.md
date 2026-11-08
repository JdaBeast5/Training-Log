# Store screenshots: plan and storyboard

Owner: marketing-manager. Drafted 2026-11-08 against **v3.517**. Replaces the six-frame storyboard in `marketing.md` §4.2, which predates the name, the harness and the store rules checked here.

**How this was checked:** I shot the harness's existing states from its seeded fixture (`node tools/visual/harness.js --only today-dark-402,gym-dark-402,rest-dark-402,progress-dark-402,history-dark-402,food-dark-402,firstrun-dark-402,today-light-402`; 8 states, 0 outbound requests) and looked at each one as a store frame. What each frame needs from the harness is said per frame: either an existing state id, or the fixture and state change it needs. Those changes are tooling work for the build automator (`tools/visual/` is theirs); this plan doesn't edit them.

---

## 1. Rules for every frame

- **Real screens only,** from the seeded fixture (Jordan, Strength & Size, eight weeks of history, frozen at Monday 2 November 2026, 18:10). No mocked numbers, no fake reviews, ratings, user counts or awards.
- **One caption line per frame,** 32 characters or fewer so it sets large. Sentence case, no full stop, no exclamation marks.
- **No price words** on any frame: no "free", "no ads" as a price claim, "$0", "sale". Apple 2.3.7: "Metadata such as app names, subtitles, screenshots, and previews should not include prices". Play's preview-asset guidance asks for no "free"/"best" buzzwords and no ranking or price text. (The old frame 6, "Free. No ads. No account.", is dropped for this reason.)
- **No call to action** ("Download now"), no badges, no device frames with another company's hardware branding.
- **Leave out on every frame:** the clinical programs, supplement and condition notes, blood pressure and glucose logs, the AI "Generate insights" card (it needs a key a stranger doesn't have), and the Goal Progress Check's body-composition sentence ("the surplus is going toward muscle", seen in `progress-dark-402`), which is an inference we shouldn't advertise. All metadata must suit a 4+ audience (Apple 2.3.8): no body photos.
- **Dark theme for all frames.** It's how the app looks in a gym and it keeps Plate & Press's day inks bright. One light frame can be tested later as an experiment, not at launch.
- **Same order on both stores,** so the first three (the ones visible in search results) carry the promise.

---

## 2. The storyboard (7 frames, plus an eighth when the bib ships)

| # | Caption (chars) | App state | Harness today | What it needs |
|---|---|---|---|---|
| 1 | **Tells you what to lift next** (27) | Today, scrolled so the Day 1 "Upper · Strength" workout card leads, with the first exercise's target set visible | `today-dark-402` exists, but the card starts below the fold (Today's Priorities sits above it) and the header shows "1 day streak" | **New state `store-today`:** same seed, scrolled to the day's workout card (`.workout-card` or its current selector) with the first exercise open. Re-shoot once UX-05's cover ships, since that becomes the natural frame 1. Keep the "1 day streak" badge out of frame until MKT-01 (weekly consistency) ships: a calendar-day streak of 1 for a four-day-a-week lifter reads as a failure |
| 2 | **One tap logs the set** (20) | Gym mode on Bench Press: two sets of 185×5 logged, the next chip "185×6", and the "Log 185×6" button | **`gym-dark-402`, as is.** It's the strongest existing frame | Nothing. **If Gym mode is retired** (owner decision D2: retired once tap counts match), swap in the equivalent Today set-chip state |
| 3 | **Adds weight when you earn it** (28) | One exercise on Today with the progression badge reading "Hit … reps at … for 2 sessions straight — add … next time" (`index.html:27532`) | No state shows this badge legibly | **Fixture change:** in `make-fixture.js`, give one Day 1 accessory (not Bench, whose stalled-week story the other states rely on) two final sessions at the top of its rep target, then **new state `store-progression`** with that exercise expanded. Shoot it and read the badge before captioning: the caption must match what the badge actually says |
| 4 | **Programs that show their sources** (32) | The Strength & Size program overview with its `basis` line ("ACSM's 2026 resistance training guidelines.", `index.html:11189`) and the week structure | No state | **New state `store-program`:** an action step that opens the program overview for the active program (`test-program-overview.js` shows the entry point). Crop or scroll so no clinical program name is visible |
| 5 | **Every record, every week** (24) | Analysis with Training Trends expanded: the PR timeline and weekly trend for Bench (165 → 185 lb over eight weeks) | `progress-dark-402` exists but leads with the AI card and the Goal Progress Check | **New state `store-progress`:** seed the Analysis groups' collapsed state in `window.storage` so Training Trends is open and Insights is collapsed, then scroll to the PR timeline (`test-pr-timeline.js` for the selector) |
| 6 | **Deload weeks are planned in** (27) | Today's workout card with the mesocycle tag reading "Deload week" (`mesocyclePhaseTag`, `index.html:26752`) | No: the fixture's today is week 4 of 5 ("Accumulation") | **Fixture variant:** a second seed with `program-cycle-start` moved so the frozen date falls in the cycle's deload week, and **new state `store-deload`**. Check that the badge and the reduced set count both show |
| 7 | **Your log stays on your phone** (28) | Settings, the backup section: "Back up" and "Restore" with the last-backup date (fixture: `last-backup` 2026-10-30) | No state | **New state `store-backup`:** open Settings and scroll to the backup section. If BIZ-16 has shipped, include the privacy link in frame. The caption is a privacy fact, not a price, so it's allowed on both stores |
| 8 (later) | **Pin your number on it** (21) | The bib story card (MKT-16) for the fixture's day: "No. 33" (32 training days in the fixture plus today), the loaded bar, Bench 185 × 5, 5 | Can't exist before MKT-16 and MKT-17 ship | **New state `store-bib`:** render the card's canvas to a PNG on a phone story frame. When it ships, **move it to position 4** (it's the most distinctive image we'll have) and drop frame 6 or 7 |

**Why this order:** frames 1–3 are the promise in three steps (what's next, how fast, how it progresses), which is what someone sees in a search result before they tap. Frame 4 is the trust proof. Frames 5–7 answer the switcher's questions (can I see my progress, will it burn me out, is my data mine).

**Frames considered and left out:**
- `rest-dark-402` (the rest timer): the pill sits over Today's Priorities, so the frame reads as clutter. Mention the timer in the description instead.
- `history-dark-402`: frozen on 2 November, the month calendar is almost empty (two days). If a calendar frame is wanted later, it needs a state that navigates back to October (23 training days) or a clock later in the month.
- `food-dark-402`: food logging is a secondary feature; leading with it would blur the promise.
- `firstrun-dark-402`: "Who's training?" is an empty form. Apple 2.3.3 says screenshots should show the app in use, "not merely the title art, login page, or splash screen".

---

## 3. Apple: sizes (verified 2026-11-08)

From App Store Connect Help, "Screenshot specifications":
- **iPhone 6.9" (Apple calls it "iPhone with Dynamic Island (large display)")** accepts **1320 × 2868**, 1290 × 2796 or 1260 × 2736 pixels, portrait.
- The 6.5" class (1284 × 2778 or 1242 × 2688) is "required if app runs on iPhone and screenshots for iPhone with Dynamic Island (large display) aren't provided", so supplying 6.9" covers it. Apple scales them down for smaller iPhones.
- **Up to 10 per device size**, as `.png`, `.jpg` or `.jpeg`.

**Deliver: 1320 × 2868 PNG**, seven (later eight) frames.

**How to get there with the harness:**
- Today the harness shoots 402 × 874 at DPR 2 (`SIZES`, `DPR` in `tools/visual/harness.js`), which gives 804 × 1748. That isn't an accepted size, and scaling it up would look soft.
- **Needed: a `--store` mode** that shoots the `store-*` states at a **440 × 956 viewport with DPR 3**, which gives exactly 1320 × 2868 (the 6.9" logical size). Everything else stays: the frozen clock, seeded randomness, blocked network, fonts awaited and animations parked.
- **Captions** are composited after the shot: the caption band at the top (about 18% of the height) in Archivo on the frame's ground (the day's plate ink, or near-black), and the app capture scaled into the rest with rounded corners. Rendering that composite as a small local HTML page in the same Playwright run keeps it deterministic and free of network calls.
- **Tooling recommendation:** the `app-store-screenshots` skill mentioned in the UI/UX guide may automate the caption composite. I recommend the skills-orchestrator vet it (licence, pinned version, any network or install calls) rather than anyone installing it from here. The harness route above works without it.

---

## 4. Google Play: sizes (partly verified)

Google's help pages weren't reachable from this session; these come from consistent third-party guides citing the Play Console. **Check in the Console on the day.**
- **Phone screenshots: 2 to 8**, JPEG or 24-bit PNG **with no alpha**, up to 8 MB each. Each side between **320 and 3,840 px**, and the long side **no more than twice** the short side.
- **Recommended: 1080 × 1920 (9:16) portrait.**
- **Feature graphic: 1024 × 500**, JPEG or 24-bit PNG, no alpha. Required to publish. Content is in `google-play.md` §6.
- **App icon: 512 × 512** PNG. `icon-512.png` already exists in the repo; check that it has no alpha before upload, since Play's icon spec has asked for 32-bit PNG in the past (not verified this session).

**Why the Apple shots can't be reused as-is:** 1320 × 2868 is a 2.17 : 1 ratio, over Play's 2 : 1 limit. So Play gets its own composite:
- **Deliver: 1080 × 1920 PNG, 24-bit, no alpha,** the same seven frames and captions.
- Build it from the same 440 × 956 @3 capture: a caption band of about 300 px, and the capture scaled to fit the remaining 1080 × 1620, centred on the frame's ground. Flatten onto an opaque ground so no alpha channel survives (Playwright's PNG output has one unless the page background is opaque and `omitBackground` is false).

---

## 5. A preview video (optional, later)

- Apple 2.3.4: previews "may only use video screen captures of the app itself".
- The 15-second recording of logging a set in `marketing.md` §4.5 (week 1) doubles as an App Store preview: open Today → tap the target set → the rest timer starts → the next chip shows the progressed load.
- Record it on a real iPhone, not the harness, so it shows real device behaviour. That's also a cheap real-device check of the set-logging path.

## Sources

- [App Store Connect Help: Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
- [App Review Guidelines 2.3.3, 2.3.4, 2.3.7, 2.3.8](https://developer.apple.com/app-store/review/guidelines/)
- [Adalo: Google Play screenshot sizes and feature graphic requirements (2026)](https://studio.adalo.com/blog/google-play-screenshot-sizes) and [Screenhance: Android screenshot sizes 2026](https://screenhance.com/blog/android-screenshot-sizes-2026) (third-party)
- [Android Developers Blog, April 2021](https://android-developers.googleblog.com/2021/04/updated-guidance-to-improve-your-app.html) (preview assets without "free"/"best")
