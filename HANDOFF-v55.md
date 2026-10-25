# HANDOFF v55 — Training Log

Branch: `claude/taste-skill-v2` (continues v54). `APP_VERSION`/`VERSION` 3.290 → **3.293**. No `SCHEMA_VERSION` change.

## What the owner asked
"Use the skill from the top 18 UI/UX skills to improve the formatting of the action buttons and font if needed, due to the new fields… clean… make sure the spacing makes sense."

The skill used is **Impeccable** (pbakaus/impeccable 0.1.17, Apache 2.0). It is vendored unchanged in `.claude/skills/impeccable/`; see its `VENDORED.md`.
- Its `scripts/impeccable` launcher, a downloaded binary, was refused by the session's permission classifier.
- So the skill's own fallback was followed: read `craft-floor.md`, `distill.md`, `layout.md` and `typeset.md`, then verify by hand in Chromium.
- The workout card is treated as an **Operate** surface.

## Shipped (each its own commit, test and bump)
| Version | Change | Test |
| --- | --- | --- |
| 3.291 | **Meta line and controls row.**<br>- One meta line holds the phase pill and the session length, with the calorie line tight under it.<br>- Session length and Gym mode become one row of matched 44px glass pills, ahead of Up next. The select gains an SVG chevron.<br>- Gym mode used to sit below Up next as a second full-width pill; that position is gone.<br>- Gym mode hides the whole row. | `test-session-actions.js` (new) |
| 3.292 | **Up next wells.**<br>- The wells are borderless.<br>- Digits are 22px and labels 12px.<br>- There is no '–' filler; only reps shows a hint, the range.<br>- Fields→button gap is 10px, heading→fields gap is 16px. | `test-up-next.js` (+1) |
| 3.293 | **Button type scale.**<br>- 16px/600 for actions taken now: Log set, session length, Gym mode.<br>- 15px/500 with 44px targets for list extenders: add custom, adapt.<br>- The voice tip becomes a quiet note, and its ✕ is 44×44. | `test-workout-card-type-scale.js` (new) |

### Warning: the `.save-btn` cascade
v3.292's gap never applied:
- `.save-btn` (around line 1630) comes later in the stylesheet with equal specificity, so it beat `.up-next-go`.
- The rule-text test still passed.
- Fixed in v3.293 with `.up-next .up-next-go`. The test now asserts **computed** style; jsdom resolves the cascade for literals.
- jsdom drops `var()` borders when computing, so declared values are pinned as well.

**When styling any `.save-btn` variant, scope it under its container.**

## Verified (Chromium, 390×844, seeded)
- **Controls row:** both pills render 150×44px at 16px. Changing session length works ("~29 min (shortened)"), and gym mode hides the row.
- **Up next end to end:** log, rest timer, reload and carry-forward all work.
- **Day sweep:** 175 days, 0 errors.
- **Tests:** full `check.sh` green.

## Noticed, not fixed (flagged)
- The tip's dismiss is a `✕` unicode glyph, not a drawn icon. That's the craft floor's icon rule.
- The per-exercise yellow `~N cal` tags repeat on every row and add noise.
- The superset banner and the Balance insight are still bordered tinted boxes.
- The Adapt toggle's copy is long (two lines). Shortening it is a copy change, so ask the owner first.
- From v54: the "Today" title duplicates the date stepper, and the More sheet items render as bare labels.
- Safari/iPhone is still unverified.
