# HANDOFF v54 — Training Log

Branch: `claude/taste-skill-v2` (continues v53). `APP_VERSION`/`VERSION` 3.285 → **3.290**. No `SCHEMA_VERSION` change.

## 1. The plan the owner set

After v3.285 went live, the owner's verdict was: "not really too impressed, I expected a major overhaul to make it look like a fancy website." Three concept mockups were built (gitignored, in `.taste-skill/mock/`): A glass & glow, B editorial, C bento.

The owner chose **A**: "Go with A, the glass and glow. Also look for new opportunities with this design for smooth navigation or added functionality and efficiency… the whole app should be designed that way."

So this phase does two things:
- it **supersedes v52/v53's "flat, no glow" direction** app-wide;
- it adds new navigation and efficiency features where the design opens room for them.

## 2. What shipped (each its own commit, test and bump)

| Version | Change | Test |
| --- | --- | --- |
| 3.286 | Aura light (`body::before`, fixed, plate-colour radial gradients) and frosted-glass cards app-wide (`--glass-fill/-hair/-shine/-shadow`, 28px radius). No `backdrop-filter` on scrolling content; only fixed or sticky chrome blurs. | `test-glass-cards.js` (renamed from test-flat-cards; includes the backdrop-filter perf guard) |
| 3.287 | Primary `.save-btn` becomes a glowing pill in a blue→purple gradient. Every stop passes 4.5:1 with white. Secondary controls become glass pills. `--cta-glow` is the only glow, reserved for `.save-btn` and `.coach-fab`. | `test-glass-controls.js` (renamed from test-flat-controls) |
| 3.288 | Navigation moves to a floating glass tab bar at the bottom (Today, Log, Analysis, History, More), and search moves into the header. Everything that floats at the bottom clears the bar via `--above-bar`. | `test-tab-bar.js` (new) |
| 3.289 | Large view title (`#viewTitle`, set by `switchView`). The workout hero title fades from white into the day's plate colour (`--day-hue`, set by `renderWorkout`). | `test-header-refresh.js` (extended) |
| 3.290 | **Up next card** on Today: the next set, its prescription, suggested weight/reps/RPE, one-tap "Log set", and a session ring (sets done of total). | `test-up-next.js` (new, 7 tests, sabotage-verified 4 ways) |

### How Up next works (read before touching it)

The card is a **thin front end over the real `.set-row` inputs**, which stay the source of truth:
- `findNextSetRow` picks the first main row with no reps, in on-screen order, so supersets come out interleaved. Exercises ticked done are skipped.
- "Log set" (`logUpNext`) writes into the real row and dispatches `change` on each field: weight, distance and RPE first, **reps last**. Saving, PR checks, the rest timer, the gym offer and auto-check therefore run once, exactly as if the set were typed in the row.
- Suggestions come from the row's own numeric placeholder. Failing that, the set just logged for that exercise is carried forward. Failing that, the field is empty, and the reps tile shows the prescribed range as a placeholder.
- The ring is `aria-hidden`; `#upNextProgress` (visually hidden) speaks "N of M sets done".
- Hidden on rest days and in gym mode.

### Guard tests updated, each with a dated note
These guards pinned the retired flat look:
- `test-neutral-rgba-consolidation`: white count 88 → 94, black count 61 → 62 (history in the assertion messages);
- `test-today-no-glow` (`GLOW_ALLOWED`);
- `test-cta-blue-unification`, `test-css-mechanical-token-dedup`, `test-today-fab-glow-color`, `test-today-hero-glow-flat-buttons`;
- `test-nav-pill-visual-weight`, `test-nav-search-pill-peek-through`, `test-sticky-day-header-overlap`, `test-analysis-index-visual-weight`, `test-rgba-blue-yellow-consolidation`.

Final: **143 suites, 1,549 assertions, all green.**

## 3. Verified (Chromium, 390×844, seeded returning user)
- Tab bar: no overflow at 375, 390 or 430px (320px scrolls with an edge fade). The rest timer and gym offer stack above it. Tapping a tab switches views; More opens its sheet.
- Day sweep: 175 days across all 25 programs, zero page or console errors.
- Up next end to end:
  - logging wrote 135 × 8 @ 7 into Barbell Row set 1;
  - the rest timer started and the data survived a reload;
  - the card moved to set 2 with the values carried forward and the ring went 4/26 → 5/26;
  - with reps empty, nothing is written and focus goes to reps.
- Before/after screenshots compare port 8766 (the pre-rollout archive) with 8765.

## 4. Unverified
- **Safari/WebKit and the real iPhone.** The WebKit download is blocked by the network policy (cdn.playwright.dev, playwright.download.prss.microsoft.com). Specific risks:
  - the `body::before` aura on iOS;
  - the blurred tab bar over the home indicator;
  - `24px !important` inputs in the Up next card. These are 24px, so iOS should not zoom, but that has not been checked.

## 5. Noticed, not fixed (flagged per CLAUDE.md)
- The large "Today" title duplicates the "‹ Today ›" date stepper just below it. Candidate: merge the stepper into the title row.
- The More sheet's Care, Coach and Learn items render as bare labels under the glass look and need a pass.

## 6. Next
The owner asked for the whole app in this design. Continue tab by tab, each as its own versioned commit with a test: Log, Analysis, History, then the More sheet with Care, Coach and Learn. Look for navigation and efficiency wins in each (Up next is the template).
- Do not open a new PR unless the owner asks.
- Don't touch the Capacitor files.
