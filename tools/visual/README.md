# Visual harness (TOOL-01)

Deterministic screenshots of the app across a fixed state matrix, a contact sheet, and a per-state diff against any commit. It's dev tooling only: it never edits `index.html` or `sw.js`, and needs no version bump.

## The one command

```
node tools/visual/harness.js --base <commit>
```

Run it from the repo root. It shoots the working tree, then the base commit (extracted with `git archive`, so your checkout isn't touched), and prints which states differ. To shoot without a diff, leave out `--base`.

Output goes to `tools/visual/out/` (gitignored):

| Path | What |
|---|---|
| `out/contact-sheet.png` | Every state on one sheet (about 0.35 MB). States that differ from the base get a red frame and a pixel count. |
| `out/worktree/<state>.png` | One PNG per state at 2× (or `out/<sha>/` for `--rev`). |
| `out/base-<sha>/<state>.png` | The base commit's PNGs. |
| `out/diff/<state>.png` | Changed pixels in red over a faded copy, for changed states only. |
| `out/diff/report.json` | `same` or `changed` (with pixel count) for each state. |

Other options: `--rev <commit>` shoots a commit instead of the working tree, `--only today-dark-402,rest-dark-402` shoots only those states, and `--out <dir>` changes the output folder.

## The state matrix (26 states)

- **Views:** Today, Food (the `log` view), Progress (`analysis`) and History, in dark and light, at 402×874 (iPhone) and 904×678 (Duo unfolded). That's 16 states, named `<view>-<theme>-<width>`.
- **Extras at 402×874, in dark and light:** the rest timer (`rest-*`, 2:30 left of 4:00 after Bench set 2), and the first-run sheet (`firstrun-*`, an empty device).
- **Reduce Motion pass:** `today`, `rest` and `firstrun` at 402×874 dark, with `prefers-reduced-motion: reduce` emulated (ids end `-rm`).

## Store mode (`--store`)

```
node tools/visual/harness.js --store
```

This shoots the App Store and Google Play screenshots in `planning/store/screenshots.md`. It doesn't touch the default mode: its states, fixture and output are separate, and a default run gives the same bytes with or without this mode in the file.

- **Capture:** each `store-*` frame is shot at **440×956 with DPR 3**, which is exactly Apple's 6.9" size, **1320×2868**. It uses dark theme and the same frozen clock, seeded randomness, blocked network and settle as the default mode.
- **Apple:** the caption goes in a band at the top (516 px), on an opaque near-black ground with a short Day 1 plate-red rule. The capture is scaled into the space below with rounded corners. Output is a 1320×2868 PNG.
- **Play:** the same composite at **1080×1920**, with a 300 px band. The PNG has no alpha channel (colour type 2). The run reads each PNG's header and fails if the size is wrong or an alpha channel survives. The Apple capture can't be reused here because 2868:1320 is over Play's 2:1 limit.
- **Caption font:** Geist, the app's own font, loaded as a data URL from the shot's `fonts/`. The storyboard asks for Archivo, but the repo has no Archivo file and fetching one would be a network call, so the font is the marketing manager's call.

| # | Frame id | Caption | What's on screen |
|---|---|---|---|
| 1 | `store-today` | Tells you what to lift next | Today, scrolled to the workout card (phase, Up next, Bench open). The header streak is out of frame. |
| 2 | `store-cover` | One tap logs the set | Today's cover: Bench's next set, big, and Log set. (Was `store-gym`, Gym mode on Bench, until Gym mode went in v3.653.) |
| 3 | `store-progression` | Adds weight when you earn it | Overhead Press open. Its badge reads "Hit 10+ reps at 105 lb for 2 sessions straight — add 5 lb next time". |
| 4 | `store-program` | Programs that show their sources | The Training Style card: overview, program description and "What this is based on" (ACSM's 2026 guidelines). No clinical program in frame. |
| 5 | `store-progress` | Every record, every week | Analysis with Insights collapsed and Training Trends open (seeded `analysis-group-collapsed:*`), scrolled to Exercise Progress. The PR timeline named in the storyboard is on History, not Analysis. |
| 6 | `store-deload` | Deload weeks are planned in | Today in "Week 5 of 5 · Deload", with Bench cut to 3×4-6. |
| 7 | `store-backup` | Your log stays on your phone | Settings, at Data & maintenance, with "Your data lives only in this browser". |

Frame 8 (`store-bib`) waits for MKT-16 and MKT-17.

**Two store seeds,** both written by `make-fixture.js` alongside an unchanged `fixture.json`:
- `fixture-store.json` gives Overhead Press (Day 1 slot 2, 8-10 reps) 105×10 instead of 105×9 in week 7 (19 October). Its last two sessions then both top the range, so the double-progression badge fires. Bench is left as it was.
- `fixture-store-deload.json` is the store seed with `program-cycle-start` moved to 31 August. The frozen Monday then falls in week 10, which is the cycle's deload week.

Each frame's in-page step (in `STORE_STEPS`) only calls the app's own functions or taps what a user would tap. It then scrolls the target to just under the sticky bars, or centres it inside a scrolling panel. `--only store-today,store-deload` and `--rev <commit>` work. `--base` doesn't: shoot each side and compare the folders.

| Path | What |
|---|---|
| `out/store/capture/<id>.png` | The raw 1320×2868 capture. |
| `out/store/apple/NN-<id>.png` | The App Store frame, 1320×2868. |
| `out/store/play/NN-<id>.png` | The Play frame, 1080×1920, no alpha. |
| `out/store/contact-sheet.png` | Both stores' frames on one sheet. |
| `out/store/store.json` | Frame order, captions and file names. |

## Today audit mode (`--today`)

```
node tools/visual/harness.js --today --base <commit>
```

Added 2026-11-17 for the Today coherence audit (`planning/backlog.md`, UX-19 to UX-30). It shoots Today top to bottom and the states those items change. It doesn't touch the default mode: its states and output are separate (`out/today/`), and the default matrix shoots the same bytes with or without it. `--base`, `--rev` and `--only` work as in the default mode. States are shot at DPR 1, because the full-page PNGs are about 3,600 px tall.

Every state seeds the 8-week streak as already celebrated (`week-streak-last-celebrated` = 8), except `tday-milestone-*`, where the milestone is the subject. In the default mode the fixture's 8-week streak opens the milestone over `today-*` whenever the shot catches it.

| State (dark and light) | What |
|---|---|
| `tday-<theme>-402` | Today, full page, mid-session (Bench set 3 of 6 ready) |
| `tday-rest-<theme>-402` | Full page, resting (2:30 of 4:00) |
| `tday-quiet-<theme>-402` | Full page, Settings > Today cover > Quiet (v3.594) |
| `tday-restday-<theme>-402` | Full page, Day 7 (Full Rest) picked in the day sheet |
| `tday-backdated-<theme>-402` | Full page, seven taps on the previous-day arrow (Mon 26 Oct) |
| `tday-finish-<theme>-402` | The finish sheet, as the default `finish-*` state |
| `tday-daysheet-<theme>-402` | The day sheet, opened from the cover's headline |
| `tday-milestone-<theme>-402` | The 8-week streak milestone as it opens on load |
| `tday-firstrun-<theme>-402` | Full page, Today after creating a first profile ("Sam") at Who's training? |
| `tday-<theme>-904` | Unfolded, both panes at the top |
| `tday-left-<theme>-904` | Unfolded, the left pane scrolled 650 px |
| `tday-right-<theme>-904` | Unfolded, the right pane (the tab) scrolled 1,000 px |

A full-page shot draws `position: fixed` elements (the tab bar, the rest pill) where the viewport was, part-way down the page. That's how Playwright's full-page capture works, not a layout bug.

## Tab audit mode (`--tabs`)

```
node tools/visual/harness.js --tabs --base <commit>
```

Added 2026-11-24 (TOOL-02) for the tab audit (`planning/backlog.md`, UX-38 to UX-50). The default matrix shoots one viewport per view and never reaches Care, Coach, Learn, Settings or an open masterclass, so a 2.0 leftover below the fold never showed in a PR's contact sheet. This mode shoots every other tab top to bottom. It doesn't touch the default mode: its states and output are separate (`out/tabs/`), and the default matrix shoots the same state list and PNG bytes with or without it. `--base`, `--rev` and `--only` work. States are shot at DPR 1, and every state seeds the 8-week streak as already celebrated (`week-streak-last-celebrated` = 8), so the milestone moment never covers a page.

| State | What |
|---|---|
| `tabs-food-<theme>-402` | Food (the `log` view), full page |
| `tabs-progress-<theme>-402` | Progress, full page, with every Analysis group open (seeded through `analysis-group-collapsed:insights`, `:body-health` and `:training` = `false`) |
| `tabs-history-<theme>-402` | History, full page |
| `tabs-care-<theme>-402` | Care, full page |
| `tabs-coach-<theme>-402` | Coach, full page |
| `tabs-learn-<theme>-402` | Learn, full page |
| `tabs-masterclass-<theme>-402` | Learn with the first masterclass that isn't the program's own opened through its index button, full page |
| `tabs-settings-<theme>-402` | Settings, opened by tapping the cog, the whole sheet |
| `tabs-progress-dark-904` | Progress on the unfolded Duo (the dashboard grid), groups open, full page |
| `tabs-learn-dark-904` | Learn on the unfolded Duo, both panes top to bottom |

That's 18 PNGs: eight tabs in dark and light at 402×874, plus two at 904×678 in dark.

- **Panels that scroll themselves.** The Settings sheet and a split tab's two panes at 904 scroll inside themselves, so a full-page capture would cut them off. For those states the run makes the viewport taller, a step at a time, until the panel no longer scrolls, then shoots the viewport. The sheet is drawn whole, and a 904 state's width (and so its layout) is unchanged.
- **Groups open (acceptance criterion 3).** After each `tabs-progress-*` shot the run puts the groups back to their defaults (Body & Health and Training collapsed) in the same page and measures it. The shot must be taller. If it isn't, it prints `groups open FAILED` and exits with code 4. Sabotage-checked: without the seeding the three shots are exactly as tall as the defaults and the run fails.
- **Page errors** fail a `--tabs` run (exit code 3), as blocked requests fail every run (exit code 2).
- A full-page shot draws `position: fixed` elements (the tab bar) where the viewport was, part-way down the page, as in `--today`.

## Why two runs give the same bytes

- **Fixture:** `fixture.json` is the committed seed (store mode adds two variants of it, above). Jordan, 31, on a lean bulk, has run Strength & Size since 7 September 2026, with eight weeks of history. Bench Press has the richest log, and today's Day 1 is in progress with two Bench sets logged. `make-fixture.js` generated the file deterministically. Edit that script, then rerun `node tools/visual/make-fixture.js`; don't hand-edit the JSON. `whats-new-last-seen` is filled with the shot commit's `APP_VERSION`, so What's New never opens over a state.
- **Clock:** `Date` is frozen at Monday 2 November 2026, 18:10, America/New_York (`page.clock.setFixedTime`). Timers still run, so the rest countdown holds still. The locale is `en-US`.
- **Launch:** the launch-played preset (`sessionStorage['launch-played']`) is set, so the cold-launch mark never plays.
- **Randomness:** `Math.random` is seeded (mulberry32).
- **Service workers:** blocked. The app is served by the harness's own `127.0.0.1` server with `no-store`.
- **Settling:** each state waits for `document.fonts.ready` and then for a quiet DOM (400 ms without a mutation). Finite animations are finished and infinite ones are parked at 0. The shot uses `animations: 'disabled'` with the caret hidden.
- **Isolation:** each state gets a fresh browser context, seeded before the page's first script runs.

## Network

Every request that doesn't go to the harness's own localhost server is aborted and counted, and WebSockets are counted too. The run prints `outbound requests blocked: N` and exits with code 2 if N isn't 0.

## Limits

- **Chromium only:** WebKit waits for decision D10.
- **Same machine for both runs:** byte identity is guaranteed between runs on one machine, because font rasterisation differs across machines. A diff always shoots both sides fresh in the same run, so it doesn't depend on a stored baseline.
- **Viewport, not full page:** each default-mode PNG is the visible screen at that size, so a change below the fold of a view doesn't show there. `--today` and `--tabs` shoot full pages for that reason.
