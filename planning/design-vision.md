# Design vision: Plate & Press

Owner: design-engineer. Written 2026-11-07 against **v3.514**. Inputs: the owner's mandate (planning/README.md), `planning/research.md`, `roadmap.md`, `backlog.md`, `business.md`, `program-audit.md`, `PRODUCT.md` (inferred, see its header), the incumbent app in Playwright at 402×874 and 904×678, light and dark, and the impeccable, taste-skill (app screens), apple-hig and Emil Kowalski motion skills.

Mock-ups: `tools/design/*.html`, sharing `tools/design/world.css`. Renders: `tools/design/renders/`. Nothing in `tools/design/` is loaded by the app.

> **Status, 2026-11-07 (pre-D1 alignment, live v3.516).** The app is named **Liftnext** (v3.515) and wears the **Sash** icon, header mark and launch (v3.516). The owner chose Plate & Press for the app, with the race bib as the share card (`design-directions.md` §5–§6). The build order is `roadmap.md`'s unified sequence, not §7 below. Known gaps, tracked in `planning/alignment/design-engineer.md`:
> - **The day ink is not the data plate in live code.** `getDayPlateClass` (`index.html` ~26219) colours days by position from seven hues (`VIVID_PLATE_CLASSES`: red, blue, yellow, green, purple, orange, teal), ignoring each day's `plate` field. §2 and §3.2 below describe the intended rule, which still has to be decided and built (before MKT-03 and UX-05).
> - **R1 mock-up corrections are still open** in `today.html`, `pr.html`, `progress.html` and `recap.html` (listed in §5). The renders are not a spec until they're fixed; the backlog text and summit notes win.
> - Line numbers below are `index.html` at v3.514; re-grep before building.

---

## 1. North star

**Liftnext should feel like a coach handing you a loaded bar: the next set, already in plate colours, one tap from done.**

At the bar, between sets, the phone is a glance from a bench a metre away. The screen answers one question in under a second ("what do I lift now?") in type you can read without picking the phone up, in the colour of the plates you're about to load. Everything else (the program, the reasons, the history) is one step behind that answer, quiet, ruled, and exact.

Grand here means **scale and certainty, not decoration**. The answer is enormous; the chrome disappears; colour is ink printed in flat fields with a job, never glow. The mission sets the test for every decision: faster logging, clearer prescriptions, more motivating progress. A change that looks richer but adds a tap or hides a reason is rejected.

### What it must feel like
| Moment | Feeling | How |
|---|---|---|
| Opening on a training day | "I know exactly what to do." | The day's plate colour fills the top of Today as a printed field; the next set is the biggest thing on the screen. |
| Logging a set | Instant, physical, certain | One tap. The figure settles (a 120 ms press, a width-axis settle), the rest clock takes over the field. No modal. |
| Resting | Calm, counted | The spot field drains as the rest runs; the next set waits underneath with its adjusters. |
| A PR | Earned, not confetti | The screen floods with the day's colour once; the new best is set huge, with the arithmetic beside it. |
| Finishing | Closed, proud, brief | A one-screen result: sets, tonnage, bests, what changes next session and why. |
| The weekly recap | A printed page you want to keep | The week as a strip of plate blocks; three numbers; one sentence of coaching; a share card that looks the same. |

### What it must never feel like
- A dashboard of glass cards (the incumbent: blurred violet halos, gradient CTAs, glass pills, cards inside cards).
- A game: no streak guilt, no confetti, no badges, no XP. Motivation comes from the true numbers getting better.
- A social feed. No one else is in this app.

---

## 2. Decision record

- **Mode:** Operate. The world lends type, palette, density and one signature move; navigation and controls stay standard iOS patterns (bottom tab bar, sheets, steppers, segmented controls).
- **Direction:** *Plate & Press*: the calibrated plate colour code as printed spot inks. It is pinned by brief: the previous design-engineer run committed it in `tools/design/world.css`, and the product already owns it in data (`plate:'p-red', plateNum:'25'` on every program day, `index.html` ~9716; `--plate-*` tokens at 104–112). The owner's earlier taste-skill pilot (v3.275 comment at 626–630) already named it "the Olympic-plate colour this product owns".
- **Concept roll:** `impeccable concept-seed --scope direction --mode operate` ran this session, **seed:cb5e30efafc19f9d**. Grounded list by resonance: (1) the calibrated plate colour code, (2) the meet attempt card and three-light judging, (3) the Munich 1972 sports identity, (4) the box's chalk whiteboard, (5) sports-hall floor markings, (6) the stadium results board, (7) the paper training notebook (the literal reading of the name; the rut). The roll assigned (5). The brief-pinned direction (1) wins, per the skill's rule; the assigned world was not discarded but **raises** it (below). No decision page was served: this run is a subagent with no way for the owner to answer, so this choice is the owner's to overturn.
- **Raises kept from the roll** (discipline, not clothes):
  - *From sports-hall floor markings (assigned):* lines are the data. Charts are thin coloured lines on the ground, one line per series in its day's ink, never filled areas or boxes. Overlap is allowed and legible, as on a court floor.
  - *From the coded catalog sleeve (challenger, declined):* colour can stand in for words when the code is learned. The weekly strip spells the week in plate blocks; the label decodes it.
  - *From the variable-font specimen (challenger, declined):* one axis drives state. Archivo's width axis is the press: a logged figure settles from semi-condensed to condensed.
  - *From the lexicon (challenger, declined):* the header names where you are: "Set 2 of 4 · Bench Press" stays pinned while the session scrolls.
  - Declined outright: the design-annual plate section (registration marks are costume on a working screen), the convention catalog grid, the guide-map lobes.

---

## 3. The visual world

### 3.1 Scene, and light versus dark
A lifter under gym fluorescents or in a dim garage, phone on a bench, glancing between sets; and the same person at home in the morning checking the plan or logging breakfast. **Dark is the in-session default** (less glare, more battery on OLED, spot inks read hotter on ink); **light follows the phone** at home. Both are first-class; every token has a light value and every render is checked in both.

### 3.2 Colour: ink ground plus five spot inks
- **Ground and surfaces:** true neutral ink, not navy (`--ground #0C0C0D`, `--surface-1 #151516`, `--surface-2 #1E1E20`, rules `#29292C`). Light: chalk paper (`#F3F3F1`) with white surfaces. No gradients on grounds, buttons, cards or text. No glass, no blur, except the native-feeling sheet scrim.
- **Spot inks** (the plate code): red 25 kg / 55 lb, blue 20 kg / 45 lb, yellow 15 kg / 35 lb, green 10 kg / 25 lb, white 5 kg / 10 lb, and an "off" grey for rest days. Each is printed as a **flat field** with its own on-colour (`--on-red` etc.), checked for 4.5:1 text contrast.
- **The day sets the spot.** Each program day already carries a plate in its data (`plate`, `plateNum`). *(2026-11-07: the live app doesn't use it yet; see the status note at the top.)* That plate becomes `--spot` for the whole session: the Today cover field, the Log button, the rest field, the PR flood, the day's line in charts. One day, one ink. Two inks never compete on one screen except in the week strip and multi-day charts, where they are the data.
- **State colours** sit on top only where they mean something: `--positive` for a best or a progression, `--negative` for a regression or a missed target, `--warning` for a caution. Good/bad, never up/down.
- Retired: `--cta-gradient-*`, the violet chat FAB, blurred plate halos, glass fills.

### 3.3 Type
- **Display:** Archivo (variable, width 62–125, weight 100–900, OFL, to be self-hosted beside the app as `fonts/archivo-latin-wdth-wght-v1.woff2` if the owner approves UX-02; 90 KB). Used only for screen headlines and big figures, at 68% width (condensed) or 84% (semi). It is a grotesque with real competition-number energy; its width axis is the press move.
- **Text:** Geist (already shipped). Everything you read in sentences, labels, lists and controls.
- **Figures:** tabular lining figures everywhere; units smaller and grey ("160 lb").
- **Scale:** caption 12, meta 13, body 16, lead 18, title 22, headline 40 (display, condensed), sibling figure 34, answer figure 64, **cover numeral 150–176** (the next set only). The cover numeral is the one deliberate exception to the taste-skill "nothing over 48" app rule: it is read from a metre away, mid-set, and it is the screen's single answer.
- Geist Mono is retired from the UI (it was a costume); it stays for the build stamp only.

### 3.4 Material and depth
Printed, not lit. Flat fields of ink, 1px rules, one tone step between surfaces. Shadows only on what floats (sheets, the toast), with an offset and soft blur (`--float-shadow`). Radius: 14 for controls, 28 for sheets, 0 for the spot field (a printed bleed).

### 3.5 Iconography
One authored outline set, 1.75 stroke, 22–24 px, round caps, drawn in SVG (the incumbent's per-day pictograms survive as the day mark). No emoji anywhere in the UI (the incumbent puts emoji in program day labels; they move out of chrome into nothing).

### 3.5a The mark and the launch (added 2026-11-07)
- **Sash** (v3.516): the five inks as one rising band on an ink tile (`tools/design/icon/`, option B). It is the constant the daily colour lacks, and it belongs to this world: flat inks, no text, no glow, parted by ground so red and blue survive Tinted and Grayscale.
- Its fills are literal hex in the header mark and the launch (`#D42F25`, `#2C5BD8`, `#F2C200`, `#1E9E4A`, `#E6E6E2`, tile `#0C0C0D`). They equal the target `--spot-*` and `--ground` values. When UX-01 lands, a test should hold them equal, so the mark and the day inks never drift apart.
- **The launch still sits on the old world:** the dark launch paints `var(--aura)` (red, blue and violet halos) over `#050507`, the light launch two radial halos on `#F3F0EA`, and `manifest.json` says `#121417`. In this world the launch is the mark on flat `--ground` (`#0C0C0D` / `#F3F3F1`), and the manifest and `theme-color` match it. That belongs to UX-03.

### 3.6 Data visualisation
- **Lines are the data** (raise from the court markings): 2 px straight lines, no area fill, no markers except the last point and a marked PR. One hue per chart, the day's spot ink or ink-grey; comparison series in `--text-3`.
- 3–4 faint gridlines, y ticks in their own lane, no legend for a single series, direct labels at line ends.
- **The plate stack** (signature move, below) is the load diagram everywhere a load appears large.
- **The per-muscle ledger** (BL-20/BL-30) is a row per muscle: a hairline target band and a bar in ink; under target in grey, inside the band in the day ink, over in `--warning`.
- **The week strip:** seven blocks in their plate inks; done = filled, planned = outlined, missed = outlined with a rule through, rest = off-grey.

### 3.7 The signature move: the plate stack
Wherever the next set's load is shown big, the bar is drawn beside it **loaded with the actual plates per side, in their competition colours and relative sizes**. The plates come from the person's own equipment profile (`getEquipment`, `BARBELL_STANDARDS` at `index.html:32700`, lb set 45/35/25/10/5/2.5) through a new greedy `platesPerSide` (UX-07). The old plate calculator is gone: only its comment survives at 31752 (flagged, not fixed). Colour by size: 45 lb blue (20 kg), 35 yellow (15 kg), 25 green (10 kg), 10 white (5 kg), 55 red (25 kg); change plates steel. 160 lb reads as a blue 45 and a white 10 and a 2.5 change plate. A lifter recognises the load before they read the number, and loads the bar without opening the plate calculator. It's functional (it replaces a tap) and only this product has it.

### 3.8 Motion
Tokens (Emil Kowalski): `--ease-out cubic-bezier(.23,1,.32,1)`, `--ease-in-out cubic-bezier(.77,0,.175,1)`, `--ease-drawer cubic-bezier(.32,.72,0,1)`; durations press 120, UI 220, sheet 420, moment 700 ms.
- **Frequent (every set):** the press. The Log button scales to .97 on press (120 ms); on release the logged figure's width axis settles 84%→68% and its set chip fills (220 ms ease-out). Transitions, not keyframes, so double taps retarget. That's all.
- **Rest:** the spot field shrinks with `transform: scaleY()` (linear, the rest length), composite-only.
- **Occasional:** sheets rise on the drawer curve (420 ms); view changes cross-fade 160 ms with no slide.
- **Rare (delight budget):** the PR flood (a clip-path circle from the Log button outward, 700 ms ease-out, once) and the finish screen's figures counting up (600 ms, once per session).
- **Reduce Motion:** every one of these becomes an instant state change, the rest field becomes a static fill with a number, the PR flood a cut. The existing `prefers-reduced-motion` handling is extended, not replaced.

---

## 4. Information architecture

The five destinations stay (they're tested and they're right), renamed to say what's in them, with the routing untouched (`VIEW_RENDERERS` / `showView()` keys stay `today`, `log`, `analysis`, `history`):

| Tab | Label now | Label proposed | One question it answers |
|---|---|---|---|
| `today` | Today | **Today** | What do I lift now? |
| `log` | Log | **Food** | What have I eaten against my target? |
| `analysis` | Analysis | **Progress** | Am I getting stronger, and is the plan working? |
| `history` | History | **History** | What did I do, and when? |
| more | More | **More** | Care, Coach, Learn, Settings |

Changes:
- **Today becomes the session.** The cover (day field + next set + plate stack) on top; the session's remaining work as a ruled list of exercises with set chips; Today's Priorities moves under the session, collapsed to one line ("2 notes · Readiness: shoulder resting"). The profile prompt, Training Style and Keep In Mind cards move to More (Training Style) and Progress (insights). Gym mode becomes unnecessary as a separate mode: the new Today *is* gym mode. It stays as a toggle until the owner approves retiring it (UX-17).
- **The floating chat button** goes into the header as a plain icon (it covers content today; see the 402 renders). That drops its drag, so it waits for the owner (UX-16).
- **Progress** leads with one lift's strength line and the weekly per-muscle ledger; the AI insights card moves below the evidence, with its key requirement stated (BIZ-06).
- **The tab bar** becomes opaque with a hairline, labels always on, the active tab in ink (not a white pill on glass).
- **Unfolded (904×678, the Duo inner screen):** two panes. Left, the session (cover + list). Right, the selected exercise's history and plate stack (the incumbent already shows the lift's history there; it keeps that job).

---

## 5. Signature moments

1. **The next set (Today).** `tools/design/today.html` → `renders/today-dark.png`, `renders/today-light.png`.
2. **Logging a set, then resting.** `tools/design/log-set.html` → `renders/log-set-dark.png`.
3. **A PR.** `tools/design/pr.html` → `renders/pr-dark.png`.
4. **Progress.** `tools/design/progress.html` → `renders/progress-dark.png`, `renders/progress-light.png`.
5. **The weekly recap.** `tools/design/recap.html` → `renders/recap-dark.png`.

**Pending corrections (R1 plus my own, 2026-11-07). The renders above are not a spec until these are made; the backlog text and summit notes win:**
- `today.html:79` "Intensification" → "Week 3 of 5" only. `today.html:112` "Readiness 72" → no score; the resting-shoulder caution and its substitute on the cover.
- Effort words (F8): `today.html:88` "stop 2 reps short (RIR 2)", `log-set.html:86` "Reps left" and `directions/a-today.html:69` "2 reps in reserve" must all print what BL-10's `targetRirLabel` returns for a strength-tier compound ("2–3 RIR (last set 1–2)"), or the RPE-mode `rpeTargetFor` (week 3 is RPE 8.5, `RPE_BY_CYCLE_WEEK`). My own "fixed" a-today string matches neither.
- `pr.html:67` "+5 lb on your best, 155 × 8" → "Heaviest weight yet: +5 lb over 155" (F6, e1RM 186.7 < 196.3). `pr.html:82` "All 4 sets hit 5 … 165" → holds at 160 until all four sets reach 6 (F7).
- `progress.html:78` and `recap.html:78` "165 × 5" → holds at 160 (F7). `progress.html:80–90`: no 20 ceiling, "10+" floor, fractional counts, grey under the floor, and no "Add 2 sets each" link (R8).

Content in every mock-up is the app's own: Strength & Size (`programs.strength`), Day 1 Upper · Strength on the red 25 plate, Bench Press 4×4–6 leading, seeded history (Jordan, Bench 155×8 → e1RM 196 lb). Loads are computed from the app's own rules (Epley e1RM, RPE target table). Figures not in the seed (body weight trend, per-muscle sets) are plausible sample data, marked as such in each file.

---

## 6. Screen by screen: what changes and why

| Screen | Now | Proposed | Why (mission) |
|---|---|---|---|
| Today | 14 stacked glass cards; the next set is the 6th thing down; day picker of 7 glowing discs; floating chat button over content | Day field + cover numeral + plate stack in the first 60% of the screen; one Log button; the session list below; priorities collapsed | The answer in < 1 s from a metre away; one tap unchanged |
| Set logging | Set chip tap logs (good), Up-next card with fields, rest timer in a separate bar | Same one-tap chip; the cover Log button logs the ready set; rest takes over the cover field with a draining spot; adjusters (±5 lb, ±1 rep, RIR) beside the next set | Same tap count, enforced in tests; the adjusters move to where the eye already is |
| Workout complete / PR | Toast plus share card on canvas | A one-time flood in the day ink; the best set huge with the e1RM arithmetic; next session's change and why | Motivating with true numbers; "show the reason" |
| Progress (Analysis) | 13 collapsible cards led by an AI button | Leads with the strength line and the per-muscle ledger; insights after evidence; jump rail stays | Answer "am I getting stronger" first |
| History | Calendar + long list | Month of plate blocks (the week-strip grammar), sessions as two-line rows | Scan a month by colour |
| Food | Glass cards, gradient buttons | Same flows in the world's ink; recents on top (BL-18) | Speed |
| Weekly recap | Inside Analysis | Its own sheet each Monday and the share card redrawn in the same grammar | A moment worth keeping and sharing (MKT) |

---

## 7. How it ships

As 17 staged items, `UX-01` to `UX-17`, at the end of `planning/backlog.md`. *(2026-11-07: the order and splits below are superseded by `roadmap.md`'s unified sequence, builds 8 and 25–60: UX-06 and UX-09 are split into a/b, UX-14 moved up after UX-10, and UX-12, UX-13 and UX-15 come last.)* One version each, behind the same data and behaviour. The app is never half-redesigned: tokens arrive first as aliases (no visual change), then one version flattens the whole app at once, then each screen switches whole. *(2026-11-07: under the unified sequence this promise doesn't hold yet. Today switches at build 30, while Food and History wait until builds 58–59 and Gym mode keeps its glow until UX-17. That's about four weeks of mixed screens at one merge a day. The fix is proposed in `planning/alignment/design-engineer.md`.)*

| Step | Item | What changes | Status |
|---|---|---|---|
| 1 | UX-01 | Token set v2 as aliases; contrast of the target values tested | ready |
| 2 | UX-02 | Archivo display font file beside `index.html`, cached by `sw.js` | **needs-owner** (asset) |
| 3 | UX-03 | Flat ground everywhere: halos, glass and gradient buttons go | ready |
| 4 | UX-04 | Tab bar: opaque, icons and labels; Log → Food, Analysis → Progress (IDs and routing unchanged) | ready |
| 5 | UX-05 | The day publishes `--spot`, `--on-spot`, `--spot-deep` | ready |
| 6 | UX-06 | Today's cover: the next set huge, one Log button, chips | ready |
| 7 | UX-07 | The plate stack (new `platesPerSide`) | ready |
| 8 | UX-08 | Rest on the cover; steppers and "reps left" (stored as RPE) | ready |
| 9 | UX-09 | Finish screen with the PR flood and "Next time" | ready |
| 10 | UX-10 | Progress leads with the strength line (then BL-20's ledger) | ready |
| 11 | UX-11 | Weekly recap sheet with the week strip | ready |
| 12 | UX-12 | History as a month of plate blocks | ready |
| 13 | UX-13 | Food in the world's ink | ready |
| 14 | UX-14 | Unfolded two-pane Today (904×678) | ready |
| 15 | UX-15 | Dead CSS sweep of the old look | ready |
| 16 | UX-16 | Coach button into the header (drops the draggable FAB) | **needs-owner** (drops a feature) |
| 17 | UX-17 | Retire Gym mode once Today does its job | **needs-owner** (drops a feature) |

Without UX-02, every item still ships: `--font-display` falls back to Geist 800 and the cover numeral drops to about 120 px.

Constraints held: single file, no build step, `APP_VERSION` = `sw.js VERSION` per item, jsdom tests plus a Playwright visual check per item, Reduce Motion, 44 pt targets, AA contrast and VoiceOver names kept or improved. Share-card visuals belong to the marketing items (MKT-03, MKT-07); the design-engineer reviews their renders against this world.

## 8. Open questions for the owner
*(2026-11-07: 1–4 are bundled into the owner's D2 in `pitch.md`, still open. 5 is answered: the owner chose Plate & Press.)*
1. Ship the Archivo display face (90 KB woff2, OFL) beside `index.html`? (UX-02)
2. Move the floating chat button into the header, losing its drag? (UX-16)
3. Retire Gym mode once the new Today replaces it? (UX-17)
4. `PRODUCT.md` was inferred from the planning files, not from an interview with you. Please confirm or correct it.
5. The concept roll assigned a different world (sports-hall floor markings). This vision kept the plate world because it's already in the app's data and the earlier run committed it. Say so if you'd rather see the alternative.

## 9. Self-critique of the mock-ups (what to watch when building)
- **The cover numeral is the one rule broken on purpose** (app screens normally cap figures at 40–48 px). It is justified only while it is the single answer on the screen. If a second huge number appears on Today, one of them is wrong.
- **Red is the hardest ink.** At `#D42F25`, white is 4.9:1. Any tint over the red (the chip fills) must be re-checked; the first mock-up's tinted ready chip was 4.1:1 and was fixed by keeping it transparent with a border.
- **White plates on chalk** vanish in light mode. They need a rim (`--rule-strong` inset), as a real white plate has.
- **The ledger needs words.** Done versus planned isn't readable from the bars alone, so the sentence above the bars says it and carries the action.
- **Sample data** in the mock-ups is labelled in each file's head comment: readiness, other lifts' loads, the session totals and the per-muscle sets. Only the program structure, the plate code and the Bench history come from the app and its seed.
- `impeccable detect` on the mock-ups is clean except: Geist flagged as overused (kept, because it already ships and is the text face only), row and stepper padding (deliberate: 64 px steppers fill edge to edge), and the hatched missed day (state, not decoration).
