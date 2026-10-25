# Vendored: tasteskill v2

- Upstream: https://github.com/Leonxlnx/taste-skill (MIT, see `LICENSE`)
- Version: 2.1.5 (upstream commit `12af471`, 2026-10-25)
- Copied unchanged from `skills/taste-skill/`. Do not edit files here; to upgrade,
  replace the folder with a newer upstream copy and update this note.

## How this project uses it

This app is an **app screen** (worked in, not read), so it follows
`references/app-screens.md`, not the page run in `SKILL.md`.

Project-level exceptions agreed with the owner, which override the skill's defaults
for this repo:

- **Glass on chrome only.** Backdrop blur/glass stays on what floats (nav pill,
  sheets, overlays). Resting content cards on a redesigned screen become opaque
  tone steps, as the skill asks. The inspector's glass findings on floating chrome
  are an accepted exception.
- **Motion: keep feedback, drop entrances.** `expand-wrap`, swipe, press and
  row-arrival feedback stay; nothing animates purely on load.
- **Fonts are self-hosted** and precached in `sw.js` so the PWA works offline.
- **CLAUDE.md still wins** on architecture: no build step, one screen per increment,
  each with its own jsdom test and version bump.

Working files from the skill's scripts go to `.taste-skill/` (gitignored).
