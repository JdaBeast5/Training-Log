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

## Classic skills vendored alongside (owner asked for the best ones to combine)

From https://github.com/Leonxlnx/taste-skill-classics (MIT), commit `5e08c93`, copied unchanged
into `.claude/skills/minimalist-skill` and `.claude/skills/soft-skill`. Both stay opt-in
(`disable-model-invocation: true`): taste-skill v2's app-screen rules remain the base.
Both classics were written for marketing pages, so only these parts are adopted:

- **minimalist-ui:** a face with more character than Inter (it names Geist), pale status tints with
  same-hue text, a solid primary button instead of gradients, crisp radii (12px or less), no emoji.
- **high-end-visual-design (soft):** spring easing for press/open feedback, blur only on fixed or
  sticky chrome, the iOS viewport rules (dvh, not vh).

Deliberately not adopted (they contradict v2's app rules or the owner's earlier calls): scroll-entry
and staggered reveals, double-bezel nested cards, eyebrow pills, pill-shaped hero CTAs, ambient
gradient blobs. Brutalist was not vendored: Swiss grids and harsh contrast fight a glance-between-sets app.
