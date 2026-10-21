# HANDOFF v51 — Training Log

Branch: `claude/iphone-duo-form-factor` (from `Branch-1` at `1ee15ca`). `APP_VERSION`/`VERSION` bumped 3.269 → **3.274**, five increments, one commit each. No `SCHEMA_VERSION` change: no stored-data shape changed.

## 1. What was asked

"I'm getting the new iPhone Duo, and I want the app to also be able to go from a slab phone form factor to the iPhone Duo form factor. Please make any necessary adjustments to accommodate this and anything that will make it feel premium on the iPhone Duo."

## 2. What the device is, as far as a web page can tell

From Apple's spec listing (via search results; apple.com could not be fetched from this environment): inner display 7.6" at 1878×2670px, outer 5.4" at 1398×2034px. At 3× that is about **890×626pt open** (wider than tall in the natural, hinge-vertical hold) and **466×678pt closed**. The CSS-viewport figures come from third-party developer guides, not Apple. Treat them as estimates until checked on the device.

Safari exposes **no fold/hinge API** (no Viewport Segments, no Device Posture). A fold or unfold reaches the page only as a resize. Every adjustment below is therefore width- and height-driven. None of it detects "a Duo" specifically, so an iPad or any similarly sized viewport gets the same treatment.

## 3. What shipped (in order)

| Ver | Change | Test |
|---|---|---|
| 3.270 | `manifest.json` orientation `portrait-primary` → `any`. A portrait lock would make you hold the open Duo sideways. | `test-duo-orientation-unlock.js` |
| 3.271 | Side safe areas. `.wrap` declares `--gutter-l`/`--gutter-r`: max(18px, that side's own inset minus the centred column's margin). `.nav-pills`/`.analysis-index` bleed by the same tokens; the rail scroller/chevron, coach FAB (as margin, zeroed while `.dragging`), today FAB, sticky day header, gym dock and gym-mode `.wrap` all clear side insets. | `test-side-safe-area-gutters.js` (evaluates the real formulas numerically) |
| 3.272 | Open-posture two-pane layout. `@media (min-width:760px) and (min-height:560px)`: `--wrap-max` 640→1080 (moved to `:root`), `.posture-split` grid with `.split-primary` on the left spanning `repeat(24, auto) 1fr`, everything else stacked on the right. Two equal columns put the gutter on the crease. Today: new `.today-session-pane` (tabs header + day tabs + workout card) is the primary. Sticky day header spans only the left pane. Gym mode stays one 640px column. All other non-split tabs are held to the phone column (604px content). | `test-duo-open-posture-layout.js` |
| 3.273 | Log opts in: the nutrition card is its `.split-primary`. Primaries no longer `align-self:stretch` (it grew an empty band of card background). | `test-duo-open-posture-log-split.js` |
| 3.274 | `wirePostureContinuity` / `findPostureAnchor`: keeps the card or exercise row you were on at the same screen position across a width change of ≥100px. | `test-duo-posture-continuity.js` |

Each test was sabotage-verified (every break listed in the commit messages failed its test, and `index.html` was confirmed byte-identical after restore). `bash check.sh` passes with all 135 test files, version parity at 3.274. `test-analysis-index-visual-weight.js`'s padding regex was updated in 3.271 to accept the gutter-token sides. It only asserts the vertical values, which are unchanged.

## 4. Verified in a real browser (Chromium via Playwright, not Safari)

- **Phone sizes are pixel-identical** to before each layout commit: 402×874, 466×678, 874×402 and 626×890. Bounding rects of the wrap, nav, pills, chevron, FAB, cards, workout card, tabs and profile card were diffed with no insets.
- **Side insets**, using `Emulation.setSafeAreaInsetsOverride`: at 430 wide with 40/24 insets, content sits exactly at 40 and 430−24. At 874×402 with 59/47 the column does not shrink (the 117px centring margin already clears the inset); only the FAB moves in.
- **Open posture, 890×626**: the gutter centres on x=445 and right-column cards stack at exactly the 18px card margin with no gaps. The session pane and nutrition card take their own height. Coach/Learn/etc. sit in the centred phone column.
- **Fold continuity**: scrolled to an exercise at 200px on 466×678, then resized to 890×626 and back. Before 3.274 it landed at −31px, then 950px. After, it stays at 200px both ways and scrollY returns exactly to the original.

## 5. Unverified / open — read before building on this

- **Nothing here has run on an actual iPhone Duo or in Safari.** In particular, not yet confirmed:
  - The real CSS viewport sizes against the 760/560 gate.
  - Whether iOS home-screen web apps honour the manifest `orientation` at all.
  - That WebKit gives a spanning grid item's extra height to the `1fr` track the way Chromium does (it is spec behaviour, but if it doesn't, the symptom is vertical gaps between right-hand cards).
  - Real inset values on the Duo.
- **Coach FAB drag with a non-zero side inset** was reasoned through (rect read before `.dragging` zeroes the margin) and its CSS is test-covered, but the drag itself was not exercised in a browser with insets.
- **Fold while a sheet is open:** continuity deliberately does nothing while `body.scroll-locked`. The sheet's own close-time restore puts back the pre-fold pixel offset, which lands on different content. Not fixed.
- **Analysis, History, Care, Coach and Learn** still use the centred phone column when open, so their cards cross the crease. A row-aligned two-column grid was tried in the browser and rejected because of large holes beside tall cards. Real masonry would need moving DOM nodes, which would put the Analysis group collapse (sibling-based) at risk. The next candidate to opt into `.posture-split` is whichever of these has an obvious primary card. Analysis charts would also benefit from the width.

## 6. Flagged, not fixed (unrelated to this change)

- `.rest-timer` and `.undo-toast` sit at `bottom:18px` with no `env(safe-area-inset-bottom)` outside gym mode. Only `body.gym-mode .rest-timer` adds it. On a home-indicator iPhone they may sit close to the indicator.
- The Android/Capacitor side was not touched (per CLAUDE.md). The web `manifest.json` change does not affect it.
