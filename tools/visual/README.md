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
- **Extras at 402×874, in dark and light:** Gym mode (`gym-*`, 23 minutes into a session), the rest timer (`rest-*`, 2:30 left of 4:00 after Bench set 2), and the first-run sheet (`firstrun-*`, an empty device).
- **Reduce Motion pass:** `today`, `gym`, `rest` and `firstrun` at 402×874 dark, with `prefers-reduced-motion: reduce` emulated (ids end `-rm`).

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
| 2 | `store-gym` | One tap logs the set | Gym mode on Bench, as in `gym-dark-402`. |
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

## Why two runs give the same bytes

- **Fixture:** `fixture.json` is the committed seed (store mode adds two variants of it, above). Jordan, 31, on a lean bulk, has run Strength & Size since 7 September 2026, with eight weeks of history. Bench Press has the richest log, and today's Day 1 is in progress with two Bench sets logged. `make-fixture.js` generated the file deterministically. Edit that script, then rerun `node tools/visual/make-fixture.js`; don't hand-edit the JSON. `whats-new-last-seen` is filled with the shot commit's `APP_VERSION`, so What's New never opens over a state.
- **Clock:** `Date` is frozen at Monday 2 November 2026, 18:10, America/New_York (`page.clock.setFixedTime`). Timers still run, so the gym clock and rest countdown hold still. The locale is `en-US`.
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
- **Viewport, not full page:** each PNG is the visible screen at that size, so a change below the fold of a view doesn't show.
