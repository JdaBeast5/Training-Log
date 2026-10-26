# HANDOFF v57 — Training Log

Branch: `claude/taste-skill-v2` (continues v56). `APP_VERSION`/`VERSION` 3.297 → **3.301**. No `SCHEMA_VERSION` change.

## Owner requests this session
- **"Do 3 and include your recommendation of some of 2"**: set chips for the list, plus Option 2's logger. **Done in v3.298–v3.301.**
- **"Remove some of the functions like plates and voice since we won't need them."** **Done in v3.300.**
- **"Install the Apple skill and use that knowledge."** Vendored `ebuntario/apple-hig` (MIT) into `.claude/skills/apple-hig/`.
  - The iPhone PWA applies its platform-neutral rules (see its `VENDORED.md`).
  - Applied so far: 44pt targets, the sheet pattern, undo over confirmation, and the workouts guide (large numerals, persistent controls).

## Shipped (each its own commit, test and bump)
| Version | Change | Test |
| --- | --- | --- |
| 3.298 | **Set chips** under every exercise, visible without opening it.<br>- Logged sets are green.<br>- Each exercise's next set is "ready" and shows the progression engine's suggestion (↑/↓ for increase/lighter), else carried forward. **One tap logs it, with Undo.**<br>- The session's next set glows.<br>- With no history a chip shows the prescription ("×6-8").<br>- 44px chips; they wrap, never clip. | `test-set-chips.js` |
| 3.299 | **Set sheet** (Option 2's logger, Apple HIG sheet). Tap any non-one-tap chip, or hold any chip.<br>- Weight − / + steps by a loadable jump (2 × smallest plate; the dumbbell increment on dumbbells), reps by 1.<br>- RPE pills, Note, Drop set (hands over to the row's drop rows), Clear set.<br>- Saves through `commitSet` → `writeSetToRow`, with Undo. | `test-set-sheet.js` |
| 3.300 | **Removed the plate calculator and voice set logging** (~570 lines). Kept: Describe a Meal's dictation (its mic CSS is now scoped to `#describeFoodVoiceSlot`) and rounding to the plates you own. | `test-plate-voice-removed.js` |
| 3.301 | **Gym mode:** big 2-column chips for the open exercise; field rows hidden. The dock "Log 135×8" button mirrors the glowing chip. The open exercise follows the next set. | `test-gym-set-chips.js` |

### Architecture (read before touching)
- The chips, Up next, the sheet and the dock button are **thin front ends over the real `.set-row` inputs**, which stay the source of truth.
- All writes go through **`writeSetToRow`**: change events fire with reps last, so save, PRs, the rest timer, the gym offer and auto-check behave as if typed. `commitSet` adds Undo.
- The strip re-renders on any change in `#exerciseList`, on row add/remove (a `MutationObserver` on `.sets-block`), and from `renderWorkout`.

### Deleted test files (owner-requested feature removal, not silent)
These four files' only subject was the removed controls: `test-plate-btn-glyph.js`, `test-voice-log-btn-glyph.js`, `test-voice-log-affordance.js` and `test-warmup-plate-btn-glyph.js`.
- `test-plate-voice-removed.js` replaces them.
- Other guards were updated with dated notes, including the a11y `setExerciseBlockOpen` call count going 7 → 10.

### Warnings
- **Long-press listens in the capture phase.** The exercise's swipe handling stops pointer events, and a bubble listener never fired (found in Chromium).
- **Apostrophes:** three times this session, an apostrophe inside a single-quoted JS string (in app code or a test note) broke parsing. `test-concise-copy.js` parses the app's inline scripts; check test-file edits too.
- **Comment strippers fail here.** `accept="image/*"` reads as a comment opener and swallows the file. `test-plate-voice-removed.js` uses the raw source on purpose.

## Verified (Chromium 390×844, seeded)
- **One tap:** logged 135×8 with Undo; Undo restores the row; the set persists after a reload.
- **Long press:** opens the sheet; + then RPE 8 then Log set wrote 140×8 @8.
- **Gym mode:** big chips; three dock taps logged sets 2–4; the card moved on to Overhead Press; "Log set" opened the sheet.
- **Regressions:** 175 days, 0 errors; all views load with no errors; Describe's mic still renders (34px, drawn icon).

## Decisions for the owner (flagged, not changed)
1. **Auto-tick needs RPE on every set** (pinned rule, `test-auto-check-sets.js`). One-tap logs leave RPE empty, so exercises don't tick themselves off. Gym mode moves on anyway.
   - Option: tick when every set has weight and reps, with RPE optional.
2. **Up next is now redundant** with the glowing chip and the gym dock button. Remove it, or keep it as a bigger "now" panel?
3. **Superset members still show History/Edit outside the opened panel**, and the yellow `~N cal` tags remain. Clutter candidates.
4. **Gym-mode set-row CSS is now unused** while rows are hidden in gym mode. Remove it in a cleanup pass.
5. **From v56:** shorten the program content, or collapse it.

Safari/iPhone is still unverified.
