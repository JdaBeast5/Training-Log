# MKT-19: the plate-stripe icon, three options (draft, not shipped)

Drafted 2026-11-07 against v3.515 (Chalklog). Nothing here is loaded by the app. Rendered with `node tools/design/icon/render.js` (Playwright Chromium). The script's header comment explains how Default, Dark, Tinted and Grayscale are simulated.

All three use the five plate inks from `tools/design/world.css`, in weight order (25 red, 20 blue, 15 yellow, 10 green, 5 white). That order isn't spectral, so none reads as a rainbow. Red (`#D42F25`) and blue (`#2C5BD8`) have almost the same luminance. Every option separates them with a strip of ground or ink, so they stay two shapes in Tinted and Grayscale. That was checked in the renders, not assumed. No text, no gradient, no glow. Flat ground.

| | A · Sleeve | B · Sash | C · Swatch |
|---|---|---|---|
| Master | `option-a.svg` | `option-b.svg` | `option-c.svg` |
| Idea | A loaded bar end from the side: plates thinning away from the collar, on a steel sleeve | The five inks as one rising band across an ink tile | The plate code printed as a label: five equal plates in an ink frame, on chalk paper |
| Says "lifting" | Yes, literally | No, it's an abstract constant (the bib's loaded bar carries the lifting) | No, it reads as a colour code or a label |
| 180 / 60 px | Good | Strongest on the home screen | Good |
| 29 px | Plates merge into one striped block, and the sleeve vanishes | Bands still count as five | Clearest at 29 |
| Tinted | Holds, but it's a dark tile with mid-brown bars and low energy | Holds, with the white band brightest | Weak: the chalk ground becomes a full bright amber slab, the loudest tile on the row |
| Grayscale | Holds | Holds | Holds |
| Header mark, 20 px | Bare plates (`mark-a.svg`) read well on dark and light | It needs its tile (`mark-b.svg`). On the dark header the tile disappears and the band stands alone, which works | The bare swatch (`mark-c.svg`) is the cleanest of the three |
| Card mark on a day ink | The bare plates fail: the matching plate vanishes on its own ink. Cards need the tile variant (`mark-a-tile.svg`) | Its tile works on all six inks | Its own ink frame works on all six inks |
| Maskable 80% circle | Plates fit; the shaft and sleeve tail are cropped (fine) | Bands crop at the circle and still read | Fits whole |
| Family with today's world | Ink ground matches the app and launch colour (`#121417`) | Ink ground matches | Chalk ground breaks the dark launch and the dark home screen |

## Recommendation: B · Sash

- **It's the constant the marketing review asked for** (`design-directions.md` §6.1 and §6.5). It's one shape you can name from a thumbnail, it doesn't change with the day, and it's unlike anything on the row (see `renders/option-b-homescreen.png`). It's the only option that still counts as five bands at 29 px.
- **It survives everything iOS does to a web clip.** In Default and Dark, the ink tile sits with the app's own ground. In Tinted and Grayscale, the ground-coloured gaps keep red and blue apart.
- **One drawing serves the icon, the header and the card.** The tile works on every day ink without a second variant. A needs a separate card tile.
- **The cost to accept:** B doesn't say "lifting" on its own. That job goes to the bib's loaded bar (MKT-16) and to the name. If the owner wants the icon itself to say "barbell", choose **A**, and accept a busier 29 px and a separate card mark. **C** is the best small mark, but its chalk tile glares in Tinted mode and breaks the dark launch, so it isn't recommended as the app icon.

## The renders

- `renders/option-{a,b,c}-tiles.png`: Default, Dark, Tinted and Grayscale at 180, 60 and 29 px, in true pixels (DPR 1).
- `renders/option-{a,b,c}-homescreen.png`: two rows of 60 pt icons on a 402 pt screen (DPR 3) beside generic neighbours, in each of the four modes.
- `renders/marks-20px.png`: each header mark at 20 px beside "Chalklog", on the dark and light grounds.
- `renders/option-{a,b,c}-card.png`: `directions/c-card.html` with the ring swapped for each card mark. The generated pages are in `cards/`.
- `renders/card-foot-on-day-inks.png`: the card foot (mark plus name) on all six grounds (five inks and off).
- `renders/maskable-safe-zone.png`: each master with Android's 80% circle, and cropped to it.

## What shipping the chosen option would take (a later version, not this draft)

**PNGs to regenerate from the chosen master** (all opaque RGB with no alpha channel, except monochrome):
- `icon-192.png` (192) and `icon-512.png` (512): the master as drawn.
- `icon-512-maskable.png` (512): the mark scaled into the centre 80% circle, with ground bleeding to the edge. B can ship as drawn because its bands are meant to run off. A should be scaled to about 85%. C fits as is.
- `icon-512-monochrome.png` (512, **RGBA**): the mark's shapes in white on transparent, with the gaps transparent. The ground goes. For C, the ink frame drops and the five plates remain.
- `apple-touch-icon.png` (180), `apple-touch-icon-167.png` and `apple-touch-icon-152.png`: the master, opaque and square. iOS rounds the corners.
- `icon.svg`: replaced by the chosen master.
- Installed home-screen copies keep the old icon until they're removed and re-added, and removing one deletes its data (HANDOFF-v59), so the What's New line should say "export a backup first".
- `manifest.json`: no change to sizes or purposes. `background_color` and `theme_color` stay ink for A and B. C would argue for changing them.
- Bump `APP_VERSION` and sw.js `VERSION` together. If the icon file names stay the same, the precache list is unchanged, but the version bump is what refreshes the cached copies.

**Changes to `test-app-icon.js`** (dated notes, deliberate):
- The header comment describes the old plate-with-a-lit-seventh. Rewrite it for the stripe and keep the iOS rules paragraph.
- Test 1 (sizes and opacity) stays as is.
- Test 2 checks `stroke-width="104"` ×2, `url(#acc)` and `fill="url(#base)"`. All three go. Replace them with:
  - five plate fills in weight order (`#D42F25`, `#2C5BD8`, `#F2C200`, `#1E9E4A`, `#E6E6E2`), each exactly once;
  - a full-bleed opaque ground rect;
  - no `<text`, `filter=`, `feGaussianBlur` or `Gradient`;
  - better than string checks: render the master in jsdom or compute from the rects that adjacent plates never touch (a gap of 1 or more), which is the luminance-separation rule.
- Test 3 (the header mark is the plate) matches `.brand-mark-lit` paths and the bore. Replace it with:
  - five `<rect>`s carrying the inks, through `--spot-*` tokens or literal hex, whichever the build uses;
  - for B, the clip tile;
  - still `aria-hidden` and no `<text>`.
  - The `.brand-mark-lit{stroke:var(--plate-red)}` CSS assertion goes with the old mark.
- Tests 4 to 7 (button, 20 px, 44 px tap area, goHome wiring) are unchanged.
- **Also affected:** `test-icon-manifest-paths.js` (unchanged if the file names stay), and every place that draws the ring mark on a card canvas (MKT-03, MKT-16, the sponsor strip). Those should draw the stripe as canvas `fillRect` calls, with a test counting real calls.
