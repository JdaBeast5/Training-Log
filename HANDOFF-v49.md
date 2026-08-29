# HANDOFF v49 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2`. `APP_VERSION`/`VERSION` bumped 3.252 → **3.253**. `SCHEMA_VERSION` bumped 7 → **8** (no destructive migration needed — see below).

## 1. What changed

Two things the user asked for together: add Vitamin B12 to the Foundational Stack, and make My Supplements genuinely dosing-frequency-aware (daily / twice-daily / weekly), not just a once-a-day checkbox.

**Vitamin B12** added to `FOUNDATIONAL_SUPPLEMENT_STACK.base` (well-established evidence tier, real rationale — plant-based diets, aging, and common medications like metformin all reduce absorption). While in there, every existing entry got a real `frequency` field: all daily except **Calcium**, now correctly `'twice-daily'` — grounded in its own pre-existing `caution` text ("Split doses through the day absorb better than one large dose"), not picked arbitrarily.

**My Supplements now tracks real dosing frequency**, end to end:
- Data model: `my-supplements` is now `[{name, frequency}, ...]` (was `["name", ...]`); `supplement-taken:{periodKey}` values are now **counts**, not booleans (`state[name]` is 0/1/2, not true/false) — one mechanism covers "once" (daily/weekly, `requiredCount:1`) and "twice a day" (`requiredCount:2`) alike. New `SUPPLEMENT_FREQUENCY_META` const maps each frequency to its `requiredCount` and display `label`.
- **Weekly items use a genuinely different storage period**, not just a different label: `supplementPeriodKey(frequency)` returns `selectedLogDate` for daily/twice-daily, or `mondayOf(selectedLogDate)` — the exact same Monday-of-week boundary `mondayOf()` already computes for "Save This Week & Start Fresh" — for weekly items, reused rather than reinvented. A weekly item checked off Monday reads as done all week and genuinely resets on the next Monday, instead of resetting every midnight like a daily item would.
- **No destructive migration.** Both shape changes (`my-supplements` entries, `supplement-taken` values) are read transparently either-shape — a legacy bare string reads as `{name, frequency:'daily'}`, a legacy `true`/`false` reads as `1`/`0` — the exact same "no destructive rewrite, read either shape transparently" precedent this codebase already used for its v2 exercise-log shape change. `SCHEMA_VERSION` bumped to 8 purely for the doc trail (no `if(version < 8)` block needed, matching that same v2 precedent).
- `toggleMySupplementTaken(name, frequency)` cycles the count 0 → 1 → … → `requiredCount` → 0 on each click/tap — one interaction model for every frequency, rather than a different control per type.
- Add flow: a new frequency `<select>` (Daily / Twice daily / Weekly) sits next to the add-input; whatever's selected is what gets stored.
- Rendering: a row shows its frequency as a small badge ONLY when it isn't the default 'daily' (e.g. "Twice daily — 1/2 today", "Weekly") — keeps the common case visually identical to before.
- **The two places that CREATE tracked items now carry frequency through automatically**: the Foundational Stack's "+ Add to my supplements" passes that item's real, curated `frequency` (so adding Calcium from there sets twice-daily, not a guessed default); the AI recommendation JSON schema (`buildSupplementSystemPrompt`) now also asks for a `"frequency":"daily"|"twice-daily"|"weekly"` field per recommendation, with an explicit instruction not to guess one for variety — a manually-typed add still defaults to daily via the select.

## 2. Testing

`test-my-supplements-tracker.js` grew from 23 to 32 cases. New/changed coverage: `loadMySupplements` transparently normalizing legacy bare-string entries; `addMySupplement` defaulting to daily, storing an explicit non-daily frequency, and rejecting/defaulting an invalid frequency value (sabotage-verified — removing the `SUPPLEMENT_FREQUENCY_META` validation and just trusting the raw value makes that case fail, confirmed and reverted); the real Add-button flow including the new frequency select; a twice-daily item requiring two real clicks with real "1/2"/"2/2" progress text and wrapping back to 0 on a third click (sabotage-verified — removing the wrap-at-required logic makes this fail); a daily item still needing only one click (proving requiredCount is genuinely per-item, not hardcoded); a weekly item writing under the real Monday-of-week key rather than the plain date (sabotage-verified — hardcoding `supplementPeriodKey` to always return `selectedLogDate` makes this fail), staying done across different days of the same week, and NOT carrying over from a prior week. All prior tests whose expected stored shape changed (add, delete, undo, toggle) were updated to the new `{name, frequency}` / count shapes rather than left on the old assertions.

`test-supplement-recommendations.js` grew from 20 to 26 cases: Vitamin B12's presence in the base list; every Foundational Stack entry carrying a real, recognized frequency value with Calcium specifically asserted as `'twice-daily'`; the three existing "+ Add to my supplements" integration tests updated to the new stored object shape; and a new test proving Calcium's real twice-daily frequency reaches the tracker automatically when added from its Foundational Stack card (not defaulted to daily).

`bash check.sh` passes in full (version parity + every `test-*.js`, 210+ files) as of this commit.

## 3. Not done / out of scope

- No AM/PM-specific slots for twice-daily items — it's a plain count (0/1/2), not "morning dose" vs "evening dose" individually trackable/undoable. A person can tell they've taken one of two, not which one.
- No editing an existing tracked item's frequency after adding it — matches the pre-existing "no rename support" limitation for this list; to change frequency today, delete and re-add.
- The AI recommendation JSON schema now asks for `frequency`, but this is unverified against the live API (same standing caveat as the whole Supplement Recommendations feature) — a response that omits or mistypes the field falls back to 'daily' via the same validation `addMySupplement` already applies to a manual add, so a bad response degrades gracefully rather than breaking.
- Not verified on a real device.
