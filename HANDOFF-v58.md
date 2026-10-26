# HANDOFF v58 — Training Log

Branch: `claude/taste-skill-v2`. `APP_VERSION`/`VERSION` 3.301 → **3.311**. No `SCHEMA_VERSION` change. Not yet merged; the live site is 3.293.

## Owner decisions this round
1. **"RPE is optional."** Done in 3.302: auto-tick needs weight and reps (and distance where the row has it) on every set.
2. **"Keep Up next, and show if weight should go up or stay on the next set."** Done in 3.303: `recommendNextSet`.
3. **"Clean up the yellow tags; find a better way to show a superset."** Done in 3.304.
4. **"Apple design with Impeccable and the other skills, across the whole app, a 2.0 version with continuity."** Done in 3.305–3.311; continuing.

## Shipped
| Version | Change | Test |
| --- | --- | --- |
| 3.302 | RPE optional for the auto-tick. | `test-auto-check-sets.js` (updated) |
| 3.303 | **Set-to-set recommendation.**<br>- Up one loadable step when a set reached the top of its range and wasn't a grind (RPE ≤ 8 or not logged); reps back to the bottom.<br>- Otherwise stay: same reps after a grind, or the top of the range to build to.<br>- Never up in a deload week (`#exerciseList[data-deload]`).<br>- Shown on the chip (↑ / =), the sheet subtitle, and Up next (`#upNextWhy`). Chips now render before Up next. | `test-next-set-recommendation.js` |
| 3.304 | No per-exercise calorie tags.<br>Superset: a neutral "Superset · no rest between" label, a 2px rail joining the checkboxes, and its actions moved into the panel (Edit/History found by exercise across the block). | `test-superset-chips.js` |
| 3.305 | The large title stands alone off Today (`header-compact`). | `test-app-2-0.js` |
| 3.306 | More is an inset grouped list (icon, name, description, chevron). | same |
| 3.307 | Settings is a bottom sheet on phones, with Done; on/off settings are iOS switches (`role=switch`). | same |
| 3.308 | One notice style (neutral glass, drawn icon) for privacy notes and disclaimers; upload buttons are glass pills with drawn icons. | same |
| 3.309 | Log: quick actions are glass tiles with drawn icons; inline Log/Add are compact primary pills; no emoji empty states app-wide (25 removed). | same |
| 3.310 | Disclosure rows (Learn, posing classes, History months): muted chevron, count in the text face, 44px. | same |
| 3.311 | The last emoji leave buttons (8); food chips show "Favorites" / "My Foods" (keys unchanged); food-row + is the primary. | same |

### The 2.0 building blocks (use these for anything new)
- **Primary action:** `.save-btn`, the blue→purple pill. Only `.save-btn` and `.coach-fab` glow.
- **Compact primary:** the gradient without the glow (`.weight-input-row button`, `.fi-plus`).
- **Secondary:** a glass pill with a drawn icon (`.photo-log-btn` and friends).
- **Notice:** `.privacy-note` / `.notice` (neutral glass, drawn leading icon).
- **Lists:** inset grouped rows with chevrons (`.nav-more-list`, disclosure rows).
- **Sheets:** grabber plus Cancel/Done (set sheet, Settings on phones).
- **Icons:** drawn SVG only; no emoji in UI text.

### Warnings
- Keep `test-app-2-0.js` growing: one test per 2.0 increment, each sabotage-checked.
- Apostrophes in single-quoted test notes broke parsing four more times this round. Run `node --check` on every edited test.
- Count guards (`test-neutral-rgba-consolidation.js`, the a11y `setExerciseBlockOpen` count of 10) move with real changes. Update them with dated notes, never by deleting.

## Verified (Chromium 390×844, seeded)
- 175 days, 0 errors; every view loads with no errors.
- Next set: 135×8 @7 → 140×6 ↑; after 140×6 → 140×8 =.
- Barbell Row ticks itself off from chips without RPE.
- The superset rail is centred on both checkboxes.
- Settings switches and the More list render as designed.

## Next (candidates)
- **Analysis:** group headers and the ✨-free AI card layout; chart cards in the same row and notice language.
- **Today program content:** shorten or collapse (owner decision still open from v56).
- **Gym-mode set-row CSS is dead** while rows are hidden; clean it up.
- **The green "Toning Focus — added for your body goal" tags** on exercises could go muted.
- **Safari/iPhone is still unverified.**
