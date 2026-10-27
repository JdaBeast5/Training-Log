# HANDOFF v59 — Analysis 2.0 pass, quieter tags, gym-mode dead CSS (v3.312–v3.316)

Branch `claude/taste-skill-v2`, PR #35 (→ `Branch-1`). Baseline at session start: `check.sh` green.
Green after every increment below. Each version is its own commit with its own test.

## What changed
- **v3.312**: Analysis group headers are 2.0 disclosure rows: 15.5px bold, 44px, the same drawn muted chevron as History months and Learn (down = open, right = collapsed). The `›` text stays in the markup (aria-hidden, font-size 0), so the jump rail's label lookup is unchanged. Test: `test-app-2-0.js`.
- **v3.313**: Body & Health's `#analysisTrendRange` row (`.history-export-row`) now goes with its group. `setAnalysisGroupCollapsed` toggles `group-collapsed` on it, and `syncAnalysisGroupHeaders` hides it when every chart in the group has autohidden. Before, it sat alone under a collapsed header. Tests: `test-analysis-collapse.js` (real markup, sabotage-verified).
- **v3.314**: Exercise Progress rows. Figures use the sans face with tabular numbers (was mono). `Best 185 lb` is plain (was a yellow 🏆 badge). "↑ Ready to go up next session" uses `--plate-green`, like the chips' ↑ (was a yellow ⬆). Test: real `renderExerciseProgress` invocation in `test-app-2-0.js`.
- **v3.315**: The `.super-tag` line under an exercise name (body-goal focus, swapped from, Custom) is one muted 12px style; it was yellow, green, blue and purple. Custom drops its ✏️.
- **v3.316**: Removed the gym-mode rules for set-row parts (`.set-row`, `.set-row-content`, `.set-num`, note/next/drop buttons, `.set-status`, `.set-note-input`, drop rows). Since v3.301, gym mode hides `.sets-block > .set-row`. Proof: computed styles of all 3,109 rendered gym-mode elements, with each exercise opened in turn, were identical before and after (scratchpad `gymsnap.js`). The pink-tint rule (row wells must stay opaque over `.swipe-delete-bg`) now sits as a comment beside the hide rule, because the warm-up rows still depend on it. Guards updated with dated notes:
  - `--gym-panel-gradient` count 3 → 1;
  - white rgba 99 → 90, black 65 → 64;
  - the Gym Mode teal-literal floor is gone;
  - the gym audit note-field tests were replaced by a v3.316 guard.

## Flagged, not fixed (no drive-by fixes)
- **Exercise Progress colours a lift's weight gain red.** The "+N lb since first log" line reuses `.w-up` (red) / `.w-down` (green), which mean bodyweight up or down. For a lift, up is good. Needs the owner's OK, then its own increment.
- **Week Over Week (Analysis) is cramped at 390px.** The "vs Prior Wk" column wraps and clips.
- **Tooling note:** `switchView()` does not run view renderers; `showView()` does. Screenshot scripts must use `showView`, or Analysis cards look empty. This is not an app bug.

## Still open
- Today's program write-up length: the owner is choosing between shortening all 55, collapsing the long one by default, or leaving them as they are.
- Safari/iPhone verification is still blocked (WebKit download denied by the network policy).

## Addendum: concise program overviews (v3.317–v3.321)
The owner chose to rewrite all 55 program and style overviews shorter "without losing important content". Five batches, each its own version:
- v3.317: main programs, first 13;
- v3.318: the other 12 main programs;
- v3.319: martial-art, cycling and yoga styles;
- v3.320: watersports;
- v3.321: medical.

Total went from 5,989 to about 3,250 words: average ~109 → ~59, every overview ≤70 words. The overviews still open by default, and the 3–5 sentence floor in `test-program-overview.js` still holds. The new `test-concise-overviews.js` pins two things:
- the 70-word ceiling for all 55 (with a count anchor of 55);
- one or more phrases per entry that must survive the cut. These cover every safety caveat, clearance step and warning sign (medical red flags, hot yoga in pregnancy, head-impact and clinch limits, the kite-instruction limit, and others).

If you edit an overview, keep its MUST_KEEP phrases or update them deliberately.

## Addendum 2: performance colours, day-count notes, day notes (v3.322–v3.331)
- **v3.322**: A lift's weight change, the estimated-max trend and the distance trend use the new `.perf-up` (green) / `.perf-down` (muted) classes. They had borrowed bodyweight's `.w-up` red. Bodyweight is unchanged. Test: `test-performance-delta-colours.js`.
- **v3.323–v3.329**: All 222 day-count variant overviews (`PROGRAM_DAY_COUNT_VARIANTS`) rewritten, 11,011 → 4,785 words, each ≤45 words.
  - Removed: repeated frequency-research arguments, and pointers to text the user can't see from there ("in-code notes", "this program's own rest-day note").
  - Kept: oly's "coaching consensus" caveat on every count, which `test-configurable-training-days.js` pins.
  - `test-concise-overviews.js` enforces all of this.
  - Scratchpad tooling, if more passes are needed: `vextract.js` re-extracts the variants; `vapply.py` replaces by path and handles duplicated texts by source order.
- **v3.330–v3.331**: Every day note (rest-day or program-day `note`) that ran over 30 words was rewritten; none now exceeds 40. Two non-day notes, the NICE waist-ratio note and the folate note, were rewritten in the same pass. `test-concise-day-notes.js` collects every real day note and pins each safety phrase. Oly's "bar-free on purpose" stays, because an existing guard pins it.
- **Not yet touched:** exercise technique cues (behind "Technique & focus"), Analysis card hints, Learn content, and old What's New entries.

## Addendum 3: less writing app-wide, round 2 (v3.332–v3.349)
- **v3.332, Analysis notes:** dropped the "Appears once…" clauses (those cards are hidden until they have data) and tightened the Strength Context note. Test: `test-concise-copy.js`.
- **v3.333–v3.335, technique cues** (`content-exercises.js`, behind "Technique & focus"): every cue that was over 24 words (178 of 964) was rewritten; none is over 24 now and no cue was dropped. Test: `test-concise-cues.js`.
- **v3.336–v3.349, Learn masterclasses** (`content-masterclasses.js`): rewritten one sport per version, 14 sports in all; ~49,800 → ~27,300 words. Every technique still has its five labelled points (Setup / Execution / Whole-body integration / Common mistake / Coaching or Judging insight), and each point is ≤25 words. Test: `test-concise-learn.js`, which checks:
  - the structure of all 274 techniques;
  - the word ceiling, which must cover all 14 sports;
  - the safety phrases for each sport.
- **Static content lives outside index.html:** `content-exercises.js`, `content-masterclasses.js` and `content-citations.js` are separate files loaded by `<script src>`, which `testHelpers.readIndexSource` also loads. Don't add them to sw.js PRECACHE (see the sw.js comments).
- **Scratchpad tooling for rewrites:**
  - `capply.py` (cues) and `lapply.py` (Learn) match each old literal in single, double or `\uXXXX`-escaped form, and `lapply.py` enforces the same count and labels;
  - `lfix.py` makes exact in-place trims;
  - `ship.py` bumps the version, adds the What's New entry and extends the test lists.
- **What's New was not rewritten, deliberately.** The app shows only the latest five entries (unseen ones at boot, or via Settings → What's New). The ~250 older entries never reach the screen and serve as the developer changelog that code comments cite, so rewriting them changes nothing a user sees.
- **Flagged, not fixed:** one Olympic Lifting Front Squat insight reads a little backwards in the original ("can clean more than you can front squat … masking a strength gap"). I kept its meaning as written; worth a coach's eye.

## Addendum 4: post-2.0 audit (v3.350–v3.357)
Impeccable `audit` plus Apple HIG review, run live in Chromium at 390×844 over every tab, sheet and gym mode. It covered errors, overflow, target sizes, accessible names, contrast sampling, input font sizes (iOS zoom) and an emoji sweep. A scripted core-flow run then checked:
- logging food, water, bodyweight, sleep and groceries;
- search;
- switching programs and back;
- a Care check-in;
- jumping from a History calendar day;
- a setting persisting across reload;
- opening What's New;
- entering and leaving gym mode;
- the rest timer start, +15s and close;
- long-press opening the set sheet under both mouse and touch.

Everything in the flow run worked. The fixes, each with a test in `test-audit-fixes.js` and sabotage-verified:
- **v3.350:** the food-row pencil's real tap area was 13×15; it's now 30×45. Two `::after` rules had collided.
- **v3.351:** the idle rest timer is `inert`, kept in sync with `.active` by a MutationObserver.
- **v3.352:** three empty states said "below" for controls that are above.
- **v3.353:** the PR timeline dropped its 💪/🏆.
- **v3.354:** Week Over Week showed "—g" with no protein data, and its "vs Prior Wk" label wrapped. Now "—" and "Change".
- **v3.355:** the grocery and supplement text fields, and word placeholders, moved from mono to sans.
- **v3.356:** six sheets now close with a Done/Cancel text button instead of a ✕ circle (white-alpha guard 90 → 89).
- **v3.357:** day-strip labels (2.34:1) and chip superset tags (3.5:1) now measure ≥4.5:1.

**Verified false positives:**
- collapsible card headers are 22px boxes, but their `::after` gives a 44px hit area;
- the day strip scrolls horizontally on purpose;
- every input renders at 16px or larger, so iOS won't zoom.

**Open P3s:**
- "Watch form video" is 4.39:1 and starts with a ▶ glyph;
- the drop-set button uses a ⤵ glyph;
- the food star ☆ is a text glyph.

**Still unverified:** a real iPhone or Safari.

## Addendum 5: glyph icons and the AI pass (v3.358–v3.371)
Owner: "confirm and enhance all the AI features we have in it so far, improve it with current capabilities across the whole app. Then after that, let's make it live."

**Glyphs (the audit's open P3s)**, tested in `test-glyph-icons.js`:
- **v3.358:** "Watch form video" uses a mask-drawn play mark, `#7A93FF` (5.66:1 on `--surface2`, scoped to this link only, not a token change) and a 44px minimum height.
- **v3.359:** the drop-set button draws a step-down arrow on `::before` (its `::after` is still the hit area).
- **v3.360:** the food favourite is a drawn star on `.fi-fav::before`, outlined or filled with `.favorited`. It follows the same two-class pattern as `.fi-delete`, so the base `.fi-star` is untouched.

**AI**, tested in `test-ai-current-api.js` (network stubbed at `fetch`) and `test-coach-chat-context.js`:

| Version | Change |
|---|---|
| v3.361 | `anthropic-version: 2026-10-21` on both endpoints. That version removes sampling params, assistant-side documents, user-side citations and Admin API fields; this app sends none of them. |
| v3.362 | `AI_MODEL_DEFAULT = 'claude-sonnet-5-5'` (was Sonnet 5, same price). |
| v3.363 | `AI_MODEL_FAST = 'claude-haiku-5-5'` for the six quick calls (was Haiku 4.5, ~10x cheaper now). See the Haiku note below. |
| v3.364 | Sonnet calls send `fallbacks:'default'` with `anthropic-beta: server-side-fallback-2026-07-01`. Haiku never sends it (no server-side fallback there). `stop_reason:'refusal'` is checked before content is read. If the API rejects the beta field, the request is resent once without it. |
| v3.365–v3.369 | Structured outputs (`output_config.format` json_schema) for describe-a-meal, food photos, label scan, recipe finder and supplement recommendations, all from one `AI_JSON_SCHEMAS` object. A test checks the API's schema rules, each prompt's documented empty reply, and that the supplement enums match `SUPPLEMENT_EVIDENCE_LABELS` / `SUPPLEMENT_FREQUENCY_META`. |
| v3.370 | **Bug:** coach chat's `slice(-10)` began with a coach reply from the sixth question on, and the API requires the first message to be the user's. Fixed in `coachChatApiMessages`. |
| v3.371 | Coach chat's own notices (no key, couldn't reach the coach) are `notice:true`: shown in the chat, never sent to the model. |

**Haiku 5.5 thinks by default** (Haiku 4.5 never did), and thinking spends from `max_tokens`: the HANDOFF v30 failure. So every Haiku call sends effort `'low'` and a raised ceiling (1024–3000). The prompts set their own reply length.

`callClaudeChat` / `callClaudeVision` now take `(…, model, effort, schema)`. The old model gate on effort is gone, because every current model accepts it.

**Confirmed in Chromium with the API mocked at the network layer** (`scratchpad/scripts/aiflows.js`; the mock rejects whatever the current API would reject). Zero request problems and zero page errors across:
- coach chat ×7 (turns 6–7 send 9 messages, starting on a question);
- describe a meal, recipe finder, supplement recommendations, supplement insight;
- label photo, food photo;
- weekly recap and nutrition check-ins;
- adapt workout.

**Not run in the browser:**
- Cross-Metric Insights (the seed data is too thin);
- the tailor button (none on the seeded day);
- photo comparison and form video;
- the Today standout.

All of these share the tested request path, and most have their own suites.

**Considered and skipped:** prompt caching on coach chat. The system prompt is short (likely under the cacheable minimum) and the 10-message window slides every turn after the fifth question, so the saving is near zero.

**Still unverified:**
- **Live API:** no key here. In particular, confirm on device that the refusal-fallback beta is accepted from a browser; if not, the v3.364 guard falls back to a plain request.
- **iPhone / Safari:** not tested.

**Flagged, not fixed:**
- the favourite star's `aria-pressed`/`aria-label` aren't updated on tap (pre-existing);
- `.fi-delete::after` draws the trash glyph and so overrides the shared 44px hit area (the same collision v3.350 fixed for the pencil);
- the set note button still uses a 📝 emoji.

## Addendum 6: flagged items, the exercise logger and Settings (v3.372–v3.379)
PR #35 was merged (v3.371 live; the Pages deploy succeeded). This batch is on `claude/taste-skill-v2`, restarted from `Branch-1`, and **not yet live**: it needs a new PR and merge.

**Flagged items**, tested in `test-flagged-fixes.js`:
- **v3.372:** Olympic Lifting's Front Squat insight now reads the right way round: the front squat should out-lift the clean, and when the two are close the recovery is the limiter.
- **v3.373:** the food favourite star updates `aria-pressed` and its label on tap.
- **v3.374:** the custom-food trash icon moved to `::before`. Its tap area was 13×14, now 30×44 (Chromium `elementFromPoint`).
- **v3.375:** the set note button draws a note icon instead of "+" or 📝.

**v3.376: every open exercise logs like Up next.** Owner: "I want each exercise to look like the first of the day."
- Each open exercise's `expand-wrap` starts with `exLoggerHtml()`: "Set N of M", big weight/reps/RPE tiles and Log set. Supersets name the lift.
- The logger is filled by `fillSetLogger`, shared with Up next and extracted from `renderUpNext`. It logs through `commitSet`, the same row write and Undo as a chip tap.
- Tiles refill only when the target set changes (`panel.dataset.rowKey`), so typed values survive re-renders.
- `#exerciseList .sets-block > .set-row{display:none}`: the raw rows are hidden on Today too, as gym mode already did. They remain the source of truth.
- The 76px name-column indent is gone from sets-block, summaries, badges, cautions and Technique.
- The rep-range hint (`::placeholder`) is 17px so "10-12" fits, including on Up next.
- Gym mode shows no extra loggers (they carry `.up-next`).
- Covered by `test-exercise-logger.js`.
- **Trade-off, same as gym mode:** with the rows hidden, there is no swipe-to-delete for a set. Drops, notes and clearing go through the set sheet (long-press a chip).

**v3.377–v3.379: Settings is an iOS inset-grouped list** (`test-settings-grouped.js`):
- **Structure:** each section is a header, one `.settings-group`, then footer notes. Slots are `display:contents`, so reparented cards become rows.
- **Switch rows** drop their duplicate label.
- **Pickers** are rows with the value on the right. The "(default)" suffix was dropped from Double progression.
- **Card rows:** no icons, grey chevrons, and the summary hides while the row is open.
- **AI row wording** is current; with a key saved, the summary reads "Connected".
- **"You":** a "Set up your profile" jump row until the profile moves in.
- The `:has()` rules are checked as declared (jsdom can't match `:has()`) and verified in Chromium.

**Testing note:** Chromium screenshots must block service workers (`serviceWorkers:'block'`), or the SW serves a stale `index.html`.

**Still unverified:** a real iPhone/Safari; the live Claude API.

## Addendum 7: Today's Priorities review (v3.380–v3.383)
PR #36 was merged (v3.379 live). This batch is on `claude/taste-skill-v2` and is **not yet live**.

Owner: "evaluate if they're necessary or redundant, also make them removable by swiping." The tests are in `test-today-priorities.js`.

**Removed or merged:**
- **v3.380, Sleep row:** removed, along with `getSleepInsight` (now dead code). It duplicated Readiness (same <6h threshold), and the two rows' advice disagreed.
- **v3.381, Deload row:** removed (`getDeloadInsight`). The day header already shows "Week 5 of 5 · Deload" from the same `isDeloadWeek()`; the time reads "(deload)", sets are cut, and the chips suggest lighter weights.
- **v3.382, cycle phase:** one row now. `getCycleInsight` returns training plus `<b>Food:</b>` plus the Nutrition link. `getCyclePhaseNutritionInsight` is gone, and its tests were moved onto `getCycleInsight`.

**Kept:**
- pregnancy-heat safety;
- readiness;
- the session heads-up (exercise cautions are inside collapsed exercises);
- the deficit guardrail;
- the supplement nudge (now hideable);
- the stale resting region;
- weigh-in, hydration and backup.

**v3.383, swipe to hide:**
- Every row is a `buildSwipeItem` row wired with `makeSwipeable`.
- Hiding is for today, with an Undo toast. It's stored as `priorities-hidden = {date, ids}`, and any other date reads as empty.
- `#todayInsightsList .swipe-content` is opaque `--surface2`. `test-swipe-content-height-fix.js` now counts only unscoped `.swipe-content{` declarations (dated note).
- Confirmed in Chromium with a real drag, the hide, the toast and a reload.

**Known gap:** like every swipe list in the app, there's no keyboard or VoiceOver path to hide a row.

## Addendum 8: app icon, launch and header mark (v3.384–v3.386)
Owner: a more luxurious, more fitting glyph and a launch animation that follows light, dark and grayscale. This batch was built with the apple-hig skill. Its `app-icons` reference is pending, so the live HIG page was read from its JSON endpoint.

**v3.384, icon** (`test-app-icon.js`):
- **Design:** the plate face-on (rim, hub ring, bore), with one seventh of the rim lit coral→rose, on the app's near-black aura. The aura is quieter than the UI's.
- **Choice:** picked from three concepts after simulating Default, Dark, Tinted and Grayscale tiles in Chromium.
- **Source:** `icon.svg` is the 1024 master; all PNGs are rendered from it, opaque and square except the RGBA monochrome.
- **iOS limits:** a home-screen web app gets ONE `apple-touch-icon` and cannot ship dark or tinted variants. iOS generates them, so the mark separates its parts by luminance, which is what tinted and grayscale keep.
- **Installed copies:** iOS reads a web clip's icon only when it is added. Existing installs keep the old icon until removed and re-added, and removing a home-screen web app deletes its data, so **export a backup first**.

**v3.385, launch** (`test-launch.js`):
- `#launch` is the first element in `<body>`, with an inline IIFE.
- **Sequence:** the rim draws from the cut, then the hub, the lit seventh and the bore; then a fade with a slight scale.
- **Timing:** about 1.15s minimum, waiting for `load`; a 4s cap; a tap skips it.
- **Cold launch only:** sessionStorage `launch-played` prevents replays on reload.
- **Appearances:** dark uses `var(--aura), var(--bg)` for a seamless hand-off; light is porcelain with a graphite mark; Increase Contrast drops the aura; Reduce Motion shows the finished mark and cross-fades in 0.2s.
- `test-visual-polish-audit-fixes.js` now allows `prefers-color-scheme` only in `.launch`-scoped blocks (dated note).
- **Note:** the app itself is still dark-only, so in light mode the launch hands off from porcelain to a dark app with a fade.

**v3.386, header mark:** the 14px brand mark beside "Training Log" is the same plate (no hub ring at that size).

**Not done:** iOS `apple-touch-startup-image` (per-device static launch images shown before the HTML parses). iOS still shows its own blank screen for that first moment.

## Addendum 9: smoother launch (v3.387)
PR #37 was merged (v3.386 live). Owner: "make the starting animation more smooth".
- **Causes:**
  - The mark drew itself with `stroke-dashoffset`, which isn't composited, so it stuttered while the app's large script parsed.
  - The phases ran at different speeds, and the bore bounced with an overshoot curve.
- **Now:**
  - Four stacked `<svg class="launch-layer">` (rim, lit, hub, bore) animate transform and opacity only (`will-change`).
  - They share one gentle ease-out, `cubic-bezier(.33,1,.68,1)`, with no overshoot: the rim turns in from -60°, the lit seventh orbits from -160° and settles, the hub and bore scale in.
  - The page holds 1.35s, then fades over 0.55s with a slight lift.
- **Tested:** `test-launch.js` asserts the transform/opacity-only keyframe and the curve (sabotage-checked with the old overshoot).
- **Checked in Chromium:** frames every 100ms show even, decaying motion, settled by ~0.9s.

## Addendum 10: translucent lists (v3.388–v3.389)
PR #38 was merged (v3.387 live). Owner: lists covered the aura (the supplements and food selection). The tests are in `test-translucent-lists.js`.
- **v3.388, swipe rows:** every `buildSwipeItem` row (supplements, food log, grocery, weight, BP, glucose, measurements, priorities) had an opaque `.swipe-content` (`--surface`), because the red `.swipe-delete-bg` filled the whole row behind it.
  - The red layer is now clipped to the uncovered strip: `clip-path:inset(0 0 0 calc(100% - var(--swipe-reveal)))`. `makeSwipeable` sets `--swipe-reveal` as the row moves, and `.is-dragging` disables its transition while the finger is down.
  - Rows use the new `--row-fill: rgba(white, .045)`.
  - Verified in Chromium: 60px of red mid-drag, 80px open, no pink tint on the translucent row.
  - Warm-up rows keep their own opaque well (the "pink-tint rule"); it's no longer required, but it was left as is.
- **v3.389, other list tiles:** `--row-fill` replaces `--surface2` on twelve in-card tiles: `.food-item-btn`, `.gsearch-hit`, `.sub-option`, `.photo-result-card`, `.ex-detail-body`, `.custom-program-box`, `.cycle-phase-card`, `.care-relief`, `.rest-done-row`, `.targets-strip`, `.exh-stats > div` and `.program-panel` (sheen kept).
  - Floating layers (the `.ex-suggest` dropdown, sheets, toasts, modals) stay opaque on purpose.
- **Updated guards:** the white-alpha count went 89→90, and `test-swipe-content-height-fix` now checks for `--row-fill` (dated notes).

## Addendum 11: brand mark as a home button (v3.390)
Owner: "Make the new symbol a bit bigger and make it act like a home button that gets you to the top of the Today tab."
- **The change:** the header plate mark is now 20px (was 14px). It's a `<button id="brandHome" aria-label="Today, back to top">` with no box of its own and a 44px tap area on `::before`, and it presses in to 0.88 on `:active`.
- **`goHome()`** (just before the `VIEW_KEYS` wiring): it closes the More overlay, then:
  - off Today, it calls `showView('today')`, which already lands at the top;
  - on Today, it smooth-scrolls to the top, or jumps there instantly under Reduce Motion.
- **Tested in `test-app-icon.js`:** a real `goHome` invocation for both branches and for Reduce Motion, the CSSOM sizes, and a check that the button is wired exactly once. Every one was sabotage-checked. The v3.386 test's anchor regex now matches the button instead of the span (dated note).
- **Checked in Chromium on the seeded page:**
  - The mark is 20×20 and reads well next to "Training Log".
  - On Today, a tap from scrollY 2537 returned to 0.
  - From History, a tap landed on Today at the top.
  - There were no page errors.
- **Unverified on an iPhone:** the feel of the smooth scroll and the press feedback.

## Addendum 12: rest days hide Up next (v3.391)
Owner (screenshots of Rest / Cardio and Full Rest showing "Squat 0/23"): "the rest days show exercises? Is that by design?" It wasn't by design.
- **Cause:** `renderWorkout`'s `if(day.rest)` branch returns early, before the `renderUpNext()` at the end of the function. The Up next card therefore kept the last training day's lift. It has carried that stale state ever since Up next was added (v3.290).
- **Fix:** the rest branch now calls `renderUpNext()` after the rest note replaces the rows. With no set rows, the card hides itself through its existing "rest day: nothing to log" path.
- **Tests:**
  - `test-up-next.js` extracts the real rest branch, runs it against a card that Squat filled, and asserts the card is hidden. It's sabotage-checked.
  - The call-count guard is now two calls, one per path.
  - `test-set-chips`' ordering check uses `lastIndexOf`. Both changes carry dated notes.
- **Checked in Chromium:**
  - Day 1 then Day 3 (seeded page, real plate taps): the card is hidden, and the rest note leads.
  - Every day rendered after Day 1: only d3 and d7 (the rest days) hide the card.
- **Flagged, not fixed:** on a rest day the card still shows "Full session" / "Gym mode", "+ Add custom exercise" and "Adapt this session", all of which are workout controls. The rest branch never renders custom exercises, so adding one on a rest day saves it but shows nothing.

## Addendum 13: agreed next work (NOT started), gym-mode warm-up flow, and the 5×5 chip finding
The owner ran low on session budget. This addendum records the decisions; the code is unchanged.

### Gym-mode warm-up flow (owner approved; build as 3 separate increments, GYM MODE ONLY)
The owner's problem: "jumping around between bottom of the screen then top then next".
- **Current order:** working-set chips → a full-width "Same as Last Time" → the ramp title and note → orange warm-up rows with checkboxes. The dock's Log button skips warm-ups (`refreshGymLogBtn` and `findNextSetRow` only see `.set-row`).
- **Mock:** a Playwright DOM-injection mock of the agreed design is the script `gym-mock.js` in the previous session's scratchpad. It doesn't persist, so rebuild it if you need a picture.

Increments:
1. **Warm-up chips:** in gym mode, the ramp becomes orange chips above the working chips, under the label "Warm-up · not counted". Order: Bar, 40%, 60%, 80%.
   - Tapping a chip edits its weight and reps, like the set sheet does.
   - `.warmup-strip` rows are hidden in gym mode but stay the source of truth, with the same storage (`saveExWarmupSet`, `todayEntry.warmups`).
   - A single "Skip warm-up" control skips the whole ramp (owner's choice), reusing the `warmupsSkipped` mechanism for all steps.
2. **Dock Log button:** walks the undone warm-up steps first ("Log 45×8", orange), then the working sets. The glow follows it, with Undo the same as a chip.
   - No rest timer after a warm-up step (owner accepted).
   - Today's "Up next" card and the per-exercise logger do not include warm-ups (owner: gym mode only).
3. **"Same as Last Time":** in gym mode, a small text link under the working chips instead of the full-width button.

### Investigated: 5×5 Squat chips showing 135×10, 185×10, 225×8, 275×4, 275×4
- **Cause:** in `renderWorkout` each set row's placeholder is `prior.sets[setIdx]`, set by set, adjusted by `computeSuggestedSet`. `prior` can come from another program (the owner's button read "Same as Last Time (Strength & Size)", i.e. `priorIsCrossProgram`).
  - So a 5×5 copies the other program's pyramid, set by set: its reps (10/10/8/4/4) and its weights.
  - Nothing reconciles the copy with today's prescription (5 reps × 5 sets at one working weight).
- **Proposed fix (not done; a progression-engine behavior change, so test first):** when `prior` is cross-program, or its set shape doesn't match the current prescription, derive every working set from one basis: the top set via `computeSuggestedSet`, with reps from the current prescription.
  - Keep the per-set copy only when the shape matches.
  - Needs a REAL-invocation test with a cross-program pyramid prior, and a sabotage check.

## Addendum 14: gym-mode warm-up flow and cross-program sets (v3.392–v3.395)
This builds the plan from addendum 13. The owner chose: skip the whole ramp, warm-ups in gym mode only, no rest timer after a warm-up. Each item is its own commit and test, sabotage-checked and confirmed in Chromium on the seeded page.
- **v3.392, warm-up chips (`renderWarmupChips`, drawn by `renderAllSetChips`):**
  - In gym mode the loggable ramp is orange chips above the working chips. The `.warmup-strip` rows stay hidden as the source of truth.
  - Tapping a chip ticks or unticks the real row's checkbox; its own change handler saves.
  - "Edit" toggles `.warmup-editing` to show the rows.
  - "Skip" calls `strip._skipAll`, which `wireSetsBlock` sets: every step's label goes into `warmupsSkipped`, with an Undo snapshot. Afterwards the row reads "Warm-up skipped · Restore".
  - Skip is absent for a superset member's ramp, because its rows sit outside `.sets-block` and so never get the hook. The rows weren't wired for logging before this change either; flagged, not changed.
  - **Deviation from the plan:** a chip tap marks the step done rather than opening the set sheet. The sheet is `.set-row`-specific (`.ex-weight` and so on), and the warm-up rows use `.warmup-weight`. Edit covers changing numbers.
  - Orange is a literal `rgba(255,122,51,…)` inside the gym block, per the rgba consolidation guard.
- **v3.393, the dock walks the warm-ups (`pendingWarmupChip`):**
  - While the open exercise has a ready warm-up step and no working set logged, the Log button reads "Log 45×8" (`.is-warmup`, orange) and logs the step through its chip, with Undo. The working chip's glow waits.
  - `refreshGymLogBtn` restores the glow when the ramp is done, using `renderSetChips`' rule.
  - `enterGymMode` and `exitGymMode` call `renderAllSetChips()` so the label and glow are right immediately.
- **v3.394:** `body.gym-mode .set-actions .same-as-last-btn` is a 44px text link. Today's button is unchanged.
- **v3.395, `priorSetForSlot`:**
  - The 5×5 cause from addendum 13 is fixed. Own-program history still copies set by set.
  - From another program, every slot starts from the heaviest set that reached today's bottom rep, at today's reps. If none reached it, there's no basis.
  - The ramp's basis follows the same rule; `chooseRampBasis` falls back to that basis instead of the other program's top set.
  - The "Last top set" hint and "Same as Last Time" still show the other program's real numbers, on purpose.
- **Harness updates (dated notes):** `test-set-chips` and `test-exercise-logger` (`renderWarmupChips`), `test-gym-set-chips` (`pendingWarmupChip`, warm-up functions, Undo stub).
- **Unverified on an iPhone:** the chip sizes at real thumb reach, and the orange dock button in sunlight.

## Addendum 15: rest-day spacing, translucent fields and controls (v3.396–v3.399)
Owner (Rest / Cardio screenshot): "Fix the spacing for the fields, also check all the tabs for any fields that are not yet translucent". Each item is its own commit; the tests are in `test-fields-translucent.js`, sabotage-checked.
- **v3.396:** `.rest-done-row` gets `margin:14px 0`. On a rest day it's the last item in the list, and "+ Add custom exercise" sat flush against it (0px).
- **The audit:** a Playwright script ran over every `VIEW_KEYS` tab of the seeded page, with collapsibles opened. It flagged every visible input, select, textarea and button with an opaque computed fill.
- **v3.397, entry fields:** nine rules move to `--row-fill`: `.care-input`, `.food-search-input`, `.weight-input-row input`, `.macro-input-row input`, `.history-export-select`, `.ex-input`, `.set-note-input`, `.gsearch-input`, `.custom-form input[type=text]`. `select option` stays solid, because on some platforms the option list is its own surface.
- **v3.398, date bar:** `.log-date-bar` (the owner's "Today field") becomes `--glass-fill`, and `.log-date-nav` and `.calendar-nav-btn` become `--row-fill`. Backdating's yellow wash is kept.
- **v3.399, secondary controls:** 23 rules for buttons and chips inside cards become `--row-fill`; the test lists them.
- **After the change:** the re-audit finds only the deliberate solids: the active tab pill, the gym-offer and banner primaries, and the active food category.
- **Kept opaque on purpose:** floating layers: the settings sheet groups and `.settings-jump`, `.ex-suggest`, the lightbox, and the calendar and masterclass close buttons.
- **Flagged, not changed:**
  - Checkbox wells (`input[type=checkbox]`) still use `--surface2`.
  - Icon wells (`.ex-thumb`, `.pose-icon`) still use `--surface2`.
  - The progress tracks (`.macro-bar-track`, `.vol-bar-track`, and so on) are opaque too, but those are meters, not fields.

## Addendum 16: pull to refresh, ramp only in gym mode (v3.400–v3.401)
- **v3.400, pull to refresh** (owner: "make the refresh function more responsive"):
  - **Cause:** the gesture followed pointer events, and iOS Safari fires `pointercancel` once it treats a drag as a scroll. A pull at the top is exactly that.
  - **Touch input now uses touch events.** `touchmove` is non-passive and claims the drag only while it's a downward pull from the top, so the page doesn't bounce. Sideways moves and `.swipe-content` are ignored. Mouse and pen keep pointer events, filtered with `pointerType !== 'touch'`.
  - **Faster reload:** `RELOAD_DELAY` is 150ms (was 500ms).
  - The IIFE is now named `pullToRefresh` for `test-pull-to-refresh.js`.
  - **Checked in Chromium:** iPhone 13 emulation, with a CDP touch drag. Not yet felt on a real phone.
- **v3.401, ramp:** the owner meant "the ramp only in gym mode", but v3.392 had changed only gym mode's display and left Today's list as it was.
  - `body:not(.gym-mode) #exerciseList .warmup-strip/.warmup-box{display:none}` hides the loggable rows, the read-only table and the nudge everywhere outside gym mode.
  - Saved data and the `warmupSetsEnabled` setting are unchanged.
  - The rgba consolidation guard now counts three `.warmup-box` rules (dated note).

## Addendum 17: fields, buttons and rows wear the cards' glass (v3.402–v3.403)
Owner: fields on Analysis, History, Care, Coach and Learn were "not quite there".
- **Finding:** the computed fills were already translucent (`--row-fill`, 4.5% white). Visually, though, the fields read as dark recessed slabs next to the frosted `--glass-fill` cards and buttons. Two surfaces really were opaque, and both slipped past the v3.396 audit:
  - `.program-select` (Care's area picker, Training Style): its gradient started at `--surface2`, and the audit skipped gradients.
  - `.settings-jump` on Analysis: the audit ran with that group collapsed.
- **v3.402, fields:**
  - The fields take `--glass-fill`, a `--glass-hair` edge and a `--rim` highlight, in place of the dark inset. That covers `.care-input` (and its focus state), the food search, the weight and macro rows, the History export picker, set notes, global search and the custom-exercise form.
  - `.program-select` gets the glass fill and edge but no highlight; that follows v3.283's no-shadow rule, which `test-today-no-glow` enforces.
  - `.ex-input` (set rows, hidden on Today) keeps `--row-fill`.
  - Dated test updates: the `care-input:focus` cascade string, white rgba total 90→89, black 64→62.
- **v3.403, controls:**
  - v3.399's 23 in-card controls, plus `.settings-jump`, take `--glass-fill`, and their opaque `--line` edges (18 of them) become `--glass-hair`.
  - `.settings-group .settings-jump` stays transparent inside the sheet.
- **Rule of thumb now:** anything you tap or type in inside a card wears the card's glass. Swipe list rows keep `--row-fill`. Floating layers stay opaque.
- **Audit for next time:** open every collapsible first (including `.analysis-group-header.collapsed`), and check `background-image` for gradients that start on opaque tokens as well as `background-color`.

## Addendum 18: Learn tab rework (v3.404–v3.420)
Owner: "fix the writing and formatting per our skills in the Learn tab… shorten the citations, make the content more concise like the rest of the app." The rules applied come from impeccable's clarify guide (say each idea once; help text adds something rather than restating the heading; consistent terms; as short as possible without losing meaning).
- **v3.404, Research & Sources:**
  - Each of the 55 `PROGRAM_SOURCES`/`STYLE_SOURCES` entries in `content-citations.js` gains `cites`: at most three entries, each "Author et al. · Journal, year", linked to doi.org when there is a DOI. Entries with deliberately no single source get a one-line `citeNote` instead.
  - `primary` stays the full audited record (`test-citation-audit`) but is no longer rendered. It ran 100–400 words of findings, editing notes and "NOW SOURCED…" process text.
  - `school` (now shown as "Approach") was rewritten in plain words. Four lines had leaked internal names (`COMBAT_STYLES` and similar).
  - `test-learn-rework.js` checks every DOI and first author or body against `primary`.
- **v3.405, formatting:**
  - The group rule `.posing-class summary` also matched each technique's nested summary, causing double chevrons and rules. It's now scoped to `> summary`.
  - Technique rows have a single CSS chevron. Names drop the group's own word when the group title contains it, and `data-name` keeps the full name for `openMasterclassTechnique`.
  - Points render with a bold, capitalised label and no bullets. Icon tiles are glass. The exercise list's ▸ glyph is now a drawn chevron.
  - "Recently Trained" title and nine shorter hints.
  - The standalone watersports renderer has the same markup; it stays standalone because two tests extract it alone.
- **v3.406–v3.419, content:** all 14 masterclasses (274 techniques) went from five points to three (Setup, Execution, Common mistake), each at most 18 words with its label. Group titles and notes are shorter.
  - Every `MUST_KEEP` safety phrase in `test-concise-learn.js` still holds, and the `THREE` list there now has to contain every sport.
  - `test-flagged-fixes` keeps the front-squat insight, carried by the Execution and Common mistake points (dated note).
  - Tooling (not committed): the scratchpad `mc/mc.py` parses JS string literals to swap `points` arrays and group keys and notes. `mc/ship.sh` updates `THREE`, bumps, runs the suite gated on its exit code, and commits; it refuses to bump a version already in `WHATS_NEW`.
  - **Watch:** pinned phrases must not start a point. The data is capitalised and the regexes are lowercase. Data starts each point capitalised after the label, and the renderer capitalises it anyway.
- **v3.420:** "Close this masterclass" is glass.
- **Verified in Chromium:** all 14 masterclasses open, each technique row has exactly three points, no text chevrons, no page errors.
