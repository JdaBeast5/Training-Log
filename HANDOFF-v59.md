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
