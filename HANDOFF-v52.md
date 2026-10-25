# HANDOFF v52 — Training Log

Branch: `claude/taste-skill-v2` (continues v51). `APP_VERSION`/`VERSION` 3.275 → **3.282**. No `SCHEMA_VERSION` change. Read HANDOFF-v51 first; this session continues it.

## 1. What was asked

"Install some more of those skills from that source and use them to build new… software." Clarified with the owner: **not a new app.** Enhance the current app and make it fresher, **replacing the current layout app-wide** (the v51 Today pilot rolled out), and **I pick the best classic skills** to combine.

## 2. Skills

Vendored from `Leonxlnx/taste-skill-classics` (MIT, commit `5e08c93`), unchanged and opt-in: `.claude/skills/minimalist-skill`, `.claude/skills/soft-skill`. `taste-skill/VENDORED.md` lists exactly what was adopted and what was rejected. In short:
- **Adopted from minimalist:** a face with character (Geist), solid primary, crisp radii, no emoji, pale tints with same-hue text.
- **Adopted from soft:** blur on fixed chrome only, and its iOS viewport rules.
- **Rejected:** scroll reveals, double-bezel cards, eyebrow pills, ambient blobs.
- **Brutalist:** not taken.
- **The `imagegen-skills` repo:** not taken, because this session has no image-generation tool.

## 3. What shipped (one commit per change, each tested, sabotage-verified, version-bumped)

| Version | Change | Test |
| --- | --- | --- |
| — | Classic skills vendored (`0f5971d`), no bump | — |
| 3.276 | Typeface **Geist + Geist Mono** (self-hosted, precached), replacing Inter + IBM Plex Mono. All 169 font-family rules now read `--font-sans`/`--font-mono`; canvas strings name Geist. Geist's tabular figures verified to equalise digit widths. | `test-self-hosted-fonts.js` (updated) |
| 3.277 | **Flat cards in every view:** base `.card` = lightness step, transparent 1px border, no shadow / `--lift` (token retired) / sheen; no card rise on tab switch. Swipe rows keep their arrival animation. Care disclaimer's yellow edge kept as a named status exception. | `test-flat-cards.js` (renamed from `test-today-flat-surfaces.js`) |
| 3.278 | **Header:** h1 24/700; eyebrow is sentence case with the name as typed; streak pill flat with a flame outline SVG. | `test-header-refresh.js` |
| 3.279 | **Labels:** 38 rules lose forced uppercase/tracking, mono labels move to the text face, nothing under 11px. "Add a food", "Cal target" sentence-cased. | `test-label-floor.js` |
| 3.280 | **Flat filled controls that pass contrast:** `--cta-gradient-blue` = flat `#3860FF` (white 4.9:1, was 3.1–3.6:1), green fills carry `--bg` ink (~10:1, white was ~2:1), `--shine-gloss` = `none`, no glows on `.save-btn`/green controls. | `test-flat-controls.js` |
| 3.281 | Macro bar labels (literal caps + `.toUpperCase()`) are sentence case. | `test-label-floor.js` |
| 3.282 | **Lifts first:** Adapt toggle/panel + day insight moved below the exercise list (`.session-extras`). | `test-today-session-first.js` |

Final: **139 suites, 1,525 assertions, all green.**

Older guard tests were updated only where this work deliberately changed what they pin, each with a dated note and their structural checks kept:
- `test-neutral-rgba-consolidation` (white-alpha anchor 99→98→97→94; `--shine-gloss`);
- `test-rgba-blue-yellow-consolidation` (streak tint);
- `test-cta-blue-unification` and `test-css-mechanical-token-dedup` (CTA token value, gloss call sites 10→3, `.save-btn` sample);
- `test-food-result-row-dietary-flag` (11px literal);
- `test-today-warmup-superset-labels` (mono via token).

## 4. Verified in Chromium (390×844, seeded returning user via `.taste-skill/seed.html`)

- Fonts load online, and with the network cut after SW install.
- All four main tabs: cards compute shadow none, `::before` none, opacity 1 within 60ms of a switch.
- Swept labels render in sentence case with nothing clipped.
- **First exercise row: 1613px → 924px** (workout card 1052 → 576).
- Adapt still opens its panel; gym mode still hides moved items.
- **175 days across 25 programs: zero errors** after all changes.
- Inspector (`inspect.mjs --app`): **10 FAIL / 6 WARN → 8 FAIL / 5 WARN.** `micro-label`, `gradient` and `app-title-size` are cleared.

**Not verified in Safari/WebKit**: the WebKit download (`cdn.playwright.dev`, `playwright.download.prss.microsoft.com`) is blocked by this environment's network policy. **Not verified on an iPhone.**

## 5. Flagged, deliberately not done

1. Emoji still in: the Log quick-add buttons (📷 📝 💡 🍳), the food search 🔍, 📁 My Foods, "✨ Generate insights", "🤖 Compare with AI", profile/setup buttons (⬆️ ⬇️ 🔄 🔍 🖨️ ➕), the coach FAB 💬, and the celebration overlay. Icon buttons also keep a hidden `font-size:0` emoji fallback (🗑️ 🏋️), which the inspector counts as tiny text.
2. Prose still set in mono: the Profile card's hint, "Full session" selector, "Week 1 of 5 · Accumulation" tag, app footer.
3. `.quick-add-btn` stays 10.5px. Five buttons at 375px clip at 11px (documented at the rule), so it needs a layout change.
4. Token names `--cta-gradient-blue/green` now hold flat colours (kept to avoid touching 16 call sites). A rename is a mechanical follow-up.
5. Remaining glows: `.compare-confirm-btn`, the active nav pill's bloom, the coach FAB, the `.day-insight` rim/glow.
6. With no profile name, the header eyebrow falls back to "Training Log", repeating the h1.
7. `▶ Watch form video` is 4.4:1 (needs 4.5:1).
8. Carried over from v51: the ⬆/🔻 progress-badge markers, and the redundant inline resets on the ramp title's basis span.

## 6. Warnings

- `test-flat-cards.js` guards every `.card` in the document. A new card style that re-adds a border/shadow fails it unless named as a status exception.
- `test-label-floor.js` guards the whole stylesheet: any new uppercase or sub-11px text rule fails unless it's a named exception.
- `test-flat-controls.js` computes contrast from real `:root` values. Retuning `--plate-green`, `--bg` or the CTA blue can fail it, and that's on purpose.
