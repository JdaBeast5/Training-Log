# HANDOFF v44 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2`. `APP_VERSION`/`VERSION` bumped 3.247 → **3.248**.

## 1. What changed

Second increment on the Coach tab's Supplement Recommendations card (see HANDOFF v43 for the first): a **static "Foundational Stack" preset**, agreed with the user as thorough, always-available, and gender-aware — explicitly requested as hardcoded/no-AI-call rather than a quick-prompt into the existing AI path.

- `FOUNDATIONAL_SUPPLEMENT_STACK` (new const, next to `buildSupplementSystemPrompt`): a hand-authored content table in the same style as `BODY_GOALS`/`PROGRAM_SOURCES` — `base` (5 items applicable to almost anyone: Vitamin D3, Omega-3, Magnesium, Creatine Monohydrate, Protein Powder) plus `male` (Zinc) and `female` (Iron, Calcium, Folate) arrays layered on top, each entry carrying an evidence tier, a 1-2 sentence benefit blurb, typical dose, timing, and an optional caution. `other`/unset gender gets the base list only — deliberately no guessed addition, per the same "real, established differences only, don't pad for symmetry" discipline `BODY_GOALS`'s own comment documents.
- `getFoundationalSupplementStack()`: reads `userProfile.gender` (the same field the Profile tab writes and `BODY_GOALS` already keys off) and returns `base` plus whatever that gender's array holds.
- `renderFoundationalStack()` / `toggleFoundationalStack()`: a new "📋 View foundational stack" button + `#foundationalStackResult` container inside the existing Supplement Recommendations card (above the free-text "Anything specific?" input, not a new card) — instant render, zero network calls, toggles open/closed and fully clears its content on close so nothing stale can show through `display:none`.
- **Refactor to avoid duplicating the card markup**: pulled the evidence-label map and the per-item card HTML out of `submitSupplementRequest` into two shared pieces — `SUPPLEMENT_EVIDENCE_LABELS` (const) and `renderSupplementCards(items)` (function) — now used by both the AI path and the new static path, so the two features render identically and a future styling change only has one place to make it. `submitSupplementRequest` itself is otherwise unchanged.
- `WHATS_NEW['3.248']` entry added.

Button label note: the button text is "View foundational stack" / "Hide foundational stack", sentence case — `test-button-label-casing.js` would have flagged "Foundational Stack" as Title Case, caught on the first real run, not overridden.

## 2. Testing

Extended `test-supplement-recommendations.js` from 12 to 17 cases (still the same file — this is the same feature area, not a new one). New coverage: `getFoundationalSupplementStack` for `other`/unset gender returns ONLY the base list; a `male` profile gets the real male-specific addition and NONE of the female-specific ones (sabotage-verified — temporarily flattening the function to `base + male + female` unconditionally made this and the female-equivalent test fail, confirmed and reverted before commit); the mirror-image test for `female`; `renderFoundationalStack` actually renders real item names/evidence-tier text/dose into the real `#foundationalStackResult` markup; and `toggleFoundationalStack` reveals real content and flips the button label on the first click, then fully clears content and resets the label on the second.

The `submitSupplementRequest` tests from v43 needed their jsdom sandbox updated (added `SUPPLEMENT_EVIDENCE_LABELS`/`renderSupplementCards` to the extracted-source list) since they now depend on the newly-extracted shared helper — without that they failed with `renderSupplementCards is not defined` on first run after the refactor, which is exactly what the test suite is for; fixed before committing.

`bash check.sh` passes in full (version parity + every `test-*.js`) as of this commit.

## 3. Not done / out of scope

- No connection yet between this Foundational Stack (or the AI recommendations) and "adding a supplement to a personal tracked list" — a **separate design proposal for that was produced this session by a background planning agent** (not implemented): a new "My Supplements" card on the Log page, right after the existing bariatric-specific `supplementCard` and before Body Measurements, with a Grocery-List-style maintained list (`my-supplements` key) plus a per-day taken/not-taken boolean map (`supplement-taken:{date}` key, dated by `selectedLogDate`) — deliberately a separate, later increment, not started here. Whoever picks this up next should ask the user whether to proceed with that proposal before implementing it.
- No "trends and past questions" adaptive layer for the AI recommendations — the user floated this in passing while approving the Foundational Stack; explicitly treated as a future idea, not part of this increment.
- Still no live web-search / real-time research lookup for the AI path (see HANDOFF v43) — the Foundational Stack sidesteps this entirely by being static, but the free-text AI recommendations still reason from training-time knowledge only.
- Not verified on a real device — jsdom-only coverage, same caveat as every other AI/coach feature in this app.
