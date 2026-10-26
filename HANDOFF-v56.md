# HANDOFF v56 — Training Log

Branch: `claude/taste-skill-v2` (continues v55, merged as PR #34). `APP_VERSION`/`VERSION` 3.293 → **3.297**. No `SCHEMA_VERSION` change.

## Owner requests this session
1. **The daily exercise list and gym mode feel cluttered.**
   - Three concepts were mocked up in `.taste-skill/mock/ex-*.html` (gitignored): Ledger, Focus sheet, Set chips.
   - Recommended: Set chips for the list plus the Focus logger for gym mode.
   - **Awaiting the owner's pick. Nothing is built yet.**
2. **"Less writing… concise without losing meaning… across the whole app."** Done for interface text with Impeccable `clarify`, in four passes.

## Shipped
| Version | Area | Strings | Word cut |
| --- | --- | --- | --- |
| 3.294 | Today + Settings/profile | 32 | 37% |
| 3.295 | Log | 27 | 41% |
| 3.296 | Analysis + History | 31 | 39% |
| 3.297 | Care, Coach, Learn | 35 | 42% |

Visible words across the seven views on the seeded account: 3,057 → 2,416, down 21%.
- Today only dropped 13%, because most of its text is program content (see below).
- Every safety, privacy and limitation fact was kept. `test-concise-copy.js` pins each one: per-note word budgets plus the regexes for the facts each note must still state, read from the real markup.

### Warning
A rewritten string with an apostrophe inside a single-quoted JS string ("there's") broke the whole script mid-pass. The suite caught it.
- `test-concise-copy.js` now parses every inline script.
- **Copy edits inside JS strings must check their quote style.**

## Not yet done (owner decision)
Program and education **content** was left untouched:
- 55 program/style overviews (about 100 words each), shown open by default on purpose (`test-program-overview.js`);
- 25 research intros, which restate the overview in "About this program";
- "Keep in mind" tips, progression messages and masterclass bodies.

Options for the owner: rewrite them, or collapse the overview by default (this reverses an earlier explicit decision).

## Noticed, not fixed
- Gym-mode set rows squeeze weight, reps and RPE into ~32px slivers while four icon buttons take the rest of the row. The exercise-list redesign would fix it.
- Safari/iPhone is still unverified.
