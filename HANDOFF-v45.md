# HANDOFF v45 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2`. `APP_VERSION`/`VERSION` bumped 3.248 → **3.249**.

## 1. What changed

Third increment in this session's supplement-tracking work (see HANDOFF v43/v44 for the Coach tab side): **"My Supplements"**, a new card on the Log tab for tracking any supplement day-to-day, general/self-directed and not limited to what Coach recommends. Built from a design proposal a background planning agent produced earlier this session (surveyed the real `#logView` structure, Grocery List, and the existing bariatric supplement checklist before proposing anything — see that proposal's reasoning, reflected below).

- New card `#mySupplementsCard`, inserted right after the existing bariatric-only `#supplementCard` and before Body Measurements — the same "quick daily check-ins" cluster as Water/Weight/Sleep/BP/Glucose, which is where a person's eye already goes for "did I take my supplement(s) today" (the bariatric card sitting right above it is exactly that instinct, just medical/prescribed rather than general).
- **Two independent storage axes**, deliberately kept apart: `my-supplements` (`["name", ...]`, a maintained list — add/remove rarely) and `supplement-taken:{date}` (`{name: boolean, ...}`, resets every day, dated by `selectedLogDate`). This is a **separate key from the existing `supplement-log:{date}`** (the bariatric checklist's own key) — reusing it would have let arbitrary user-added names corrupt `computeSupplementStreak`'s `SUPPLEMENT_ITEMS.every(...)` check the moment an unrelated name showed up in that map. No `SCHEMA_VERSION` bump — a brand-new key needs no migration, same precedent as `grocery-list`/`hide-avoided-foods`.
- **List axis mirrors Grocery List's CRUD exactly**: `loadMySupplements`/`saveMySupplements`/`addMySupplement` (case-insensitive dedupe-on-add), rendered via the same `buildSwipeItem`/`makeSwipeable`/`showUndoToast` swipe-to-delete-with-undo mechanics Grocery List already uses.
- **Taken-state axis mirrors the bariatric checklist**: `loadSupplementTakenState`/`toggleMySupplementTaken`, click-to-toggle, reusing the existing `.supplement-row`/`.supplement-check` CSS (the bariatric checklist's own classes — genuinely the same visual/interaction concept, so this reuses rather than re-declares them).
- **The "elite-level, thorough" tie-in the user specifically asked for**: `findKnownSupplementInfo(name)` looks up a tracked name (case-insensitive) against the SAME `FOUNDATIONAL_SUPPLEMENT_STACK` content Supplement Recommendations already renders from (see HANDOFF v44). A match — e.g. tracking "Creatine Monohydrate" — shows that entry's real evidence tier and a one-line benefit note right in the tracker row, so it's never a bare checklist; an unmatched, made-up name just renders plainly. New `.supplement-name-wrap`/`.supplement-benefit` CSS wraps the name+subtitle as one `span:last-child` specifically so the existing `.supplement-row.done` strike-through rule keeps working correctly for both the bariatric checklist (single-span rows) and this tracker (single- or double-span rows) without touching that shared rule.
- Wired into both refresh points every other Log-page daily card already uses: the boot sequence (next to `renderGroceryList()`/`toggleConditionTrackerCards()`) and `refreshForLogDate()` (so switching the log date via the date-bar actually re-renders taken state for that day, not a stale one).
- Storage-key doc block (near `SCHEMA_VERSION`) updated with both new keys.
- `WHATS_NEW['3.249']` entry added.

## 2. Testing

New file: `test-my-supplements-tracker.js` (12 cases), built directly on `test-grocery-render-crud.js`'s established conventions (same `storageGlobals`/`icon` stub/`extractStatement` pattern) since the list axis is functionally the same CRUD shape. Covers: empty state; a Foundational-Stack-matching name rendering its real evidence tier and benefit text; an unmatched name rendering plainly (no subtitle wrapper); `findKnownSupplementInfo` returning `null` for an unknown name; add + case-insensitive dedupe (sabotage-verified — removing the dedupe check makes that case fail, confirmed and reverted); the real Add-button click path end-to-end; the real per-day toggle writing to the dated key with only the clicked item flipping; **date isolation** (sabotage-verified — pointing `loadSupplementTakenState` at the bariatric checklist's `supplement-log:{date}` key instead of the new `supplement-taken:{date}` key makes two cases fail, confirmed and reverted — this was the single highest-risk mistake this design flagged); swipe-delete removing only the targeted item while leaving other items' taken state untouched; undo restoring the exact removed item at its original position; and HTML-escaping of a supplement name.

`bash check.sh` passes in full (version parity + every `test-*.js`, 12 new + all prior) as of this commit.

## 3. Not done / out of scope (agreed scope for v1, per the design proposal)

- **No "Add to My Supplements" button on the Coach tab's recommendation cards yet** — the natural next integration (both the AI-generated recommendations and the Foundational Stack), flagged by the design proposal as a deliberate second step once this tracker existed. This is the most likely next increment given the user's "keep improving and integrating it" direction.
- No dosage/timing/brand/notes fields on tracked items — matches the bariatric checklist's own precedent (label only, no structured dose field).
- No reminders/notifications, no multiple-times-per-day (AM/PM) tracking, no streaks/history chart for this tracker specifically (the bariatric checklist has its own `computeSupplementStreak`, not reused here — a parallel streak for the general tracker would be an easy, low-risk follow-on but is cut from v1 per the original design's own explicit scoping).
- No rename support for list items — add/delete only, matching Grocery List's own current capability.
- Not verified on a real device.
