# HANDOFF v51 — Training Log

Branch: `claude/taste-skill-v2` (from `Branch-1` at `1ee15ca`, v3.269). `APP_VERSION`/`VERSION` 3.269 → **3.275**. No `SCHEMA_VERSION` change.

## 1. What was asked

"Find the taste skill and give us the 2.0 version for our app." Clarified with the owner before any work:

- **The skill:** tasteskill v2 by Leonxlnx (https://github.com/Leonxlnx/taste-skill), current release **2.1.5**. (Not the older `design-taste-frontend-v2-experimental`, which now lives in a separate "classics" repo.)
- **Install + apply.** Vendor it into the repo, then use it.
- **Pilot one view: Today / workout logging.** Before/after shown to the owner before anything rolls past Today.
- **Refine the current identity**, not a new direction.
- **Glass on chrome only:** the skill bans glass/blur/glow on app screens; the owner chose to keep glass on what floats (nav pill, sheets, overlays) and make Today's resting cards opaque.
- **Motion:** keep feedback (expand-wrap, swipe, press, row-arrive, view crossfade), drop load entrances.
- **Fonts:** self-host, precache in `sw.js`.

## 2. Baseline

Fresh container had no `node_modules`, so the first `check.sh` run failed every jsdom suite with `Cannot find module 'jsdom'`. After `npm ci`: **130 suites, 1473 assertions, all green** at v3.269. That was environment, not code.

## 3. What shipped (one commit per increment, each with its own test + bump)

| Version | Commit | Change | Test |
| --- | --- | --- | --- |
| — | `49497f9` | tasteskill v2 2.1.5 vendored at `.claude/skills/taste-skill/` (MIT). `VENDORED.md` records upstream commit + the owner's project exceptions. `.taste-skill/` (its working folder) gitignored. Dev tooling only, so no version bump. | — |
| 3.270 | `405a5e0` | Inter + IBM Plex Mono self-hosted in `fonts/` (fontsource builds, latin subset, OFL licences beside them), `@font-face` in the inline `<style>`, Inter preloaded, all three in `PRECACHE_OPTIONAL`. Google Fonts `<link>` removed. | `test-self-hosted-fonts.js` |
| 3.271 | `7911c71` | Training Style card + sport/medical pickers moved from above the day rail to below the workout card. Onboarding, Today's Priorities, the unfinished-profile slot and the recommendation banner stay above. Moved verbatim. | `test-today-session-first.js` |
| 3.272 | `92e64e9` | `#todayView > .card`: no border, no shadow (incl. the blue `--lift` bloom), no sheen `::before`, no `card-stagger` rise. Base `.card` untouched, so other views are unchanged. | `test-today-flat-surfaces.js` |
| 3.273 | `5721909` | Decorative emoji out of the workout card: 21 day-insight prefixes + fallback, voice tip, adapt toggle, calorie line, warm-up titles, focus tag, RPE badge, archive button. Gym mode uses the Training Style header's barbell SVG. | `test-today-workout-emoji.js` |
| 3.274 | `6d358ee` | Superset banner/owner labels and warm-up titles: sentence case, text face, 12px, no tracking, no `::before` ⚡. Warm-up box keeps tint + border, loses rim/glow. Nudge prose in the text face (`.warmup-note`). | `test-today-warmup-superset-labels.js` |
| 3.275 | `9703ffd` | Plate halo removed (markup, CSS, and the `renderWorkout` line). Adapt + Gym mode buttons flat (gradient midpoint), toggle glow shadow gone. | `test-today-hero-glow-flat-buttons.js` |

Final: **136 suites, 1509 assertions, all green** at v3.275. Every new test was sabotage-verified (3–5 breaks each, file restored byte-identical after).

Existing tests touched, each because this work changed what they anchor on, not to make a failure go away:
- `test-plate-btn-glyph.js`, `test-voice-log-btn-glyph.js`: located the tip banner by its 💡; the locator now keys on `<b>Tip:</b>`. Assertions unchanged.
- `test-neutral-rgba-consolidation.js`: white-alpha count anchor 100 → 99 (the adapt toggle's removed box-shadow held one site). Recorded in its own history line.

## 4. Verified in a real browser (Chromium via Playwright, 390×844, seeded returning user)

- Fonts: zero requests to Google; all three faces load; **with the network cut after SW install, all three still load from cache.**
- Today order: workout card **1052px → 569px** from the top (first set row 1613 → 1130). Program switching from the moved picker still re-renders the day; no errors.
- Flat surfaces: shadow `none`, border transparent, `::before` none, opacity 1 within 60ms of a tab switch; a Log card keeps its border/shadow.
- Emoji: a scan of the rendered `#workoutCard` across **all 25 programs × every day × every exercise open** finds only `⤵` (drop-set button) and `▶` (form-video link) after the change.
- Hero/buttons: **175 days across 25 programs** render with zero page/console errors after removing the glow line.

The seed: `.taste-skill/seed.html` (gitignored) restores a localStorage snapshot made by driving the real UI (profile "Jordan", onboarding hidden, Bench Press 185×5,5,5,4). Inspector runs need `CHROME_PATH` pointing at a `--no-sandbox` wrapper when running as root.

**Not verified on an iPhone.** Same standing caveat as everything else.

## 5. tasteskill notes for the next session

- Route: **app screen** (`references/app-screens.md`), style dealt **true-black-flat** (seed 991405339), `--keep palette,type`. Chosen because Today is glanced at between sets, one person, often a dim gym, and gym mode had already hand-built this formula.
- Screen question: "What's next in today's session?" Signature element: the day plate (Olympic plate colours as day identity), kept.
- Inspector (`inspect.mjs --app`) still reports 10 FAIL / 6 WARN before and after. It judges the **whole page** (header, nav, settings, other views), not just Today. Today-attributable movement: heavy panel shadows 5 → 1, gradient fills 5 → 3, heavy borders 10 → 6, workout-card emoji gone.

## 6. Flagged, deliberately NOT done (no drive-bys)

1. **The biggest remaining Today issue:** the first set row is still ~1130px down, because the workout card's own header stack (insight, voice tip, Adapt, Gym mode) sits above the exercise list. Moving or collapsing those is a product decision, so it goes to the owner.
2. Header chrome (shared by every view): 32px h1 + tracked mono "TRAINING LOG" eyebrow, the 🔥 streak badge, the blue gradient Today pill. These are app-wide, outside the pilot.
3. Day-rail labels are 10px uppercase ("DAY 1"), and "TAP A DAY TO VIEW IT" is tracked mono. These are the bulk of the inspector's `tiny-text`/`micro-label` hits.
4. `⬆`/`🔻` direction markers in progress badges come from progression-signal messages that other tabs also show. Changing them reaches past Today.
5. `▶ Watch form video` is 4.4:1 contrast (needs 4.5:1). It's an existing link colour.
6. The ramp title's basis-note `<span>` still carries an inline `text-transform:none; letter-spacing:0`. Now redundant, harmless.
7. Emoji remain on the setup cards inside Today (profile export/import/print buttons, "➕ Create program"). These are set-once cards, not the session.
8. The skill's house rule says the accent never touches buttons/tabs/nav (primary by inversion). The app's blue accent on buttons and the nav pill was kept, per "refine identity". Revisit at rollout.

## 7. Warnings

- `#todayView > .card` rules intentionally outrank base `.card`; `test-today-flat-surfaces.js` fails if anything else starts outranking them on a Today card.
- The moved pickers must stay **direct children** of `#todayView`, or gym mode's `#todayView > .card:not(#workoutCard)` hide rule stops covering them.
- Don't edit files under `.claude/skills/taste-skill/`. To upgrade, replace the folder and update `VENDORED.md`.
