# Pre-D1 alignment: design-engineer

Checked 2026-11-07 against live **v3.516**: `index.html`, `sw.js`, `manifest.json`, `tools/design/`, and Playwright Chromium at 402×874 and 904×678, light and dark. Baseline: `check.sh` passes, with 199/199 suites green.

## 1. Sign-off: **Agree with conditions**
Plate & Press in the app: the next set huge, in the plate colour of the day, with the loaded bar beside it. The bib is the poster outside the app. Sash is the one constant that ties the two together. The conditions are B1 to B4. Without them the loop builds a cover whose colour rule nobody has decided, and the app runs in two looks for about a month.

## 2. Blocking concerns (each with the deadline it actually blocks)
**B1. The day-to-ink rule the whole world depends on doesn't exist in the live code. Blocks build 8 / 11.**
- Evidence: `getDayPlateClass` (`index.html` ~26219) ignores each day's `plate` field. It colours days by their position, from seven hues (`VIVID_PLATE_CLASSES` 26218: red, blue, yellow, green, **purple, orange, teal**). For example, Strength & Size Day 5 "Lower · Hypertrophy" is purple today, while its data says `p-green` / `10`; UX-05 contradicts itself. Its Change says to use `getDayPlateClass`, and its criterion 1 says to match the day's `plate`. Its rule "unknown → off" would turn days 5 and 6 of every program with five or more days grey; MKT-03 (build 11), MKT-06a (build 12, due 30 Nov) and MKT-16 (the bib ground) all print "the day's ink" long before UX-05 (build 29); no test covers the current rule. Only `test-a11y-keyboard-focus.js` and `test-header-refresh.js` touch it.
- Fix: Add one pure `dayInk(id)` that returns one of the five inks or off. Ship it with UX-01, or as UX-01b at build 8, with no visible change. MKT-03, MKT-16 and UX-05 read it; rewrite UX-05's criteria against `dayInk`; re-point `--plate-*` (live `#FF453A`, `#5B7CFF`, … at 104–112) to the spot inks in UX-05. Otherwise two reds show on one screen: the cover's `#D42F25` and the day disc's `#FF453A`; the rule itself is owner question 1.

**B2. The sequence doesn't deliver "never half-redesigned". Blocks build 25. One roadmap edit fixes it now.**
- The flat ground (UX-03) arrives at build 27 and Today's cover at 30. History (UX-12) and Food (UX-13) wait until builds 58–59, and Gym mode keeps its glows until UX-17. At one merge a day, that's about four weeks of a Plate & Press Today beside old-layout tabs. UX-13's own "Why" admits that Food is "the last screen in the old look".
- UX-03's criteria count only gradient buttons and `backdrop-filter`. They miss: the 14 `radial-gradient` halos, including `--aura`; the launch's aura (dark) and its literal halos on `#F3F0EA` (light); the violet gradient on "Create my profile", the first thing a new user taps; `manifest.json` `#121417` and `theme-color` `#050507` / `#F2F2F5`. Three different near-blacks sit around a `#0C0C0D` icon tile.
- Fix: run Phase 2 as BIZ-05 → (UX-02) → UX-03 → UX-04 → UX-05 → **UX-13 → UX-12** → UX-06a… Every tab is then in the world's materials before the cover lands, and the cover is the crescendo. That's two builds earlier, with no dependency broken. BL-18's recents and BIZ-03's line are asserted only "if present"; UX-03 gains criteria for no `radial-gradient` backgrounds, launch ground = `--ground`, and the manifest and `theme-color` matching the ground. The manifest edit needs the automation rule's file list widened; UX-03 states that Gym mode is out of scope until UX-17. CLAUDE.md protects its literal shadow.

**B3. The build loop can't yet *see*, or show, a visual increment. Blocks build 8.**
- UX-01 criterion 3 requires pixel identity with "the v3.514 baseline". That's stale: it should be the parent commit. It also isn't deterministic, for four reasons:
  - the cold-launch animation;
  - clock-dependent copy (the "Hydration check … behind pace for this time of day" line);
  - the empty-profile first-run sheet;
  - no committed seed.
- `automation.md` steps 10–11 put screenshots in the scratchpad and stage nothing else, so the owner approves a redesign he never sees in the PR.
- Fix, before D1, by me as a tooling PR: `tools/visual/` with a seeded fixture (Jordan, Strength & Size, Bench history), a frozen `Date`, `launch-played` preset, fonts awaited, and a Reduce Motion pass; a fixed state matrix (4 views × light/dark × 402/904, plus Gym mode, the rest state and the first-run sheet); one contact-sheet PNG per UX PR that the owner can see (owner question 3).
- Also needed: Playwright WebKit (D10) before UX-03. Chromium can't vouch for iOS rendering of `font-variation-settings`, `clip-path` or container queries; UX-03 criterion 4 (`impeccable detect`) needs the loop's `Skill` tool (D10). Otherwise drop the criterion.

**B4. The mock-ups are still wrong, and the backlog never absorbed my own fixes. Blocks build 25. Not D1 itself.**
- Still in the files: `today.html:79` "Intensification" and `:112` "Readiness 72"; `pr.html:67` "+5 lb on your best" and `:82` "→ 165"; `progress.html:78` and `recap.html:78` "165 × 5"; the ledger at `progress.html:80–90` (a 20 ceiling and "Add 2 sets each").
- New: my "corrected" `directions/a-today.html:69` "2 reps in reserve" matches neither BL-10 ("2–3 RIR (last set 1–2)") nor RPE mode (week 3 = RPE 8.5, `RPE_BY_CYCLE_WEEK` 27415). So F8 is still open in every render.
- UX-08 to UX-11 cite these renders by name.
- None of `design-directions.md` §5's additions reached `backlog.md`: state colour never on a spot field; a deep-ink cover for yellow in the dark; meta text of 15 px or more on spot fields; UX-07's test that the heaviest plate sits against the collar.
- Fix: I re-render all four mock-ups in a follow-up run. `tools/design/` is mine, but this round only lets me edit planning files; The backlog owner adds those criteria to UX-05, UX-06 and UX-07; Until then, the backlog text and summit notes beat the pictures, as stated in `design-vision.md` §5.

## 3. Non-blocking (fix during the build)
- **Archivo timing.** If D2 is a yes, UX-02 should land before MKT-03 (build 10–11, invisible until it's used). Otherwise the Year in Lifting cards ship in Geist and change face later.
- **BL-10's label is jargon on a 150 px cover.** "2–3 RIR (last set 1–2)" can't be read from a metre away by a beginner. BL-10 should return a short form and a words form ("Stop 2–3 reps short"). Settle this before build 13, because it becomes the single vocabulary (R7).
- **Sash fit.** The icon fits the world: flat inks, a tile equal to `--ground`, the five-ink plate code, and it holds in Tinted and Grayscale. In Playwright it's the only object on screen that belongs to the world. It sits on red, blue and violet halos at launch, dissolves into a glass sheet with a violet gradient button, and then the day picker shows seven brighter hues. Until B1 and UX-03 land, the mark promises a code the app doesn't keep.
  - UX-01 should add a test that the mark's literal hexes equal the target `--spot-*` values.
  - Flag only: the launch comment "The app behind is dark-only" (`index.html` ~5320) has been false since v3.477.
- **Visual review cadence.** UX-03 changes everything at once, so it should get a manual on-device look by the owner before the next UX item builds on it.

## 4. Conflicts with other agents' plans
- **`backlog.md`:** UX-05 criterion 1 (B1); UX-01 criterion 3 and UX-03 criterion 4 cite v3.514 (B3); UX-03 criteria (B2); UX-07 and UX-06 are missing the §5 additions (B4); UX-13's "Why".
- **`roadmap.md`:** Phase 2 order and UX-12/13 at 58–59 (B2). The rename and icon are still scheduled for Phase 5 (MKT-09) though both have shipped.
- **`automation.md` §4 steps 10–11:** scratchpad-only screenshots, and the staged files exclude `tools/visual/` renders and `manifest.json` (B2, B3).
- **`backlog.md` MKT-19:** still `needs-owner` although it shipped in v3.516. MKT-16's bib ground depends on B1. **`design-directions.md` §6** (marketing's section) still argues for Chalklog.
- **BL-10 (exercise-auditor / project-manager):** the words form above.

## 5. Stale items in my files (fixed this round)
- `design-vision.md`: added a status note (Liftnext, Sash, v3.516, roadmap supersedes §7). Changed "Training Log should feel…" to Liftnext. Added a §3.2 caveat that the day ink isn't the data plate yet. Added §3.5a on the mark and the launch. Listed the pending corrections in §5. Added caveats to §7 (order superseded, "never half-redesigned" doesn't hold yet). Mapped §8's questions to D2 and marked Q5 answered.
- `design-directions.md` (§0–§5 only): added a status banner. The §1.2 F8 row is now marked not fixed. The Chalklog lines are marked as history, and §5 Q3 is answered. Noted that the §5 backlog proposals never landed.
- Not a planning file, so not fixed: `PRODUCT.md:36` still says the name is "Training Log" (part of D2's "confirm PRODUCT.md").

## 6. Questions only the owner can answer
1. **Day colours.** Should each day take its program's plate code (red, blue, yellow, green; cardio white; rest grey; colours repeat in programs of five days or more), or keep seven distinct colours per day, where purple, orange and teal aren't plate inks? I recommend the plate code: it's what the icon, the bib and the plate stack all mean.
2. **If D2 is a yes:** ship Archivo before the share cards (around build 10), so Year in Lifting and the app share one typeface from the start?
3. **How do you want to judge visual PRs?** Option one is one contact-sheet image committed with each UX PR (about 0.3 MB each). Option two is a written description only. I recommend the image, because a redesign approved on words alone isn't really reviewed.
