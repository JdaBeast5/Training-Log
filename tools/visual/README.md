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

## Why two runs give the same bytes

- **Fixture:** `fixture.json` is the committed seed. Jordan, 31, on a lean bulk, has run Strength & Size since 7 September 2026, with eight weeks of history. Bench Press has the richest log, and today's Day 1 is in progress with two Bench sets logged. `make-fixture.js` generated the file deterministically. Edit that script, then rerun `node tools/visual/make-fixture.js`; don't hand-edit the JSON. `whats-new-last-seen` is filled with the shot commit's `APP_VERSION`, so What's New never opens over a state.
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
