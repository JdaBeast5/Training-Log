# HANDOFF v43 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2`. `APP_VERSION`/`VERSION` bumped 3.246 → **3.247**.

## 1. What changed

New feature, first increment of a larger "supplement recommendations" idea agreed with the user: a **Supplement Recommendations** card on the Coach tab.

- New card in `#coachView`, after "Ask Your Coach": an optional free-text request input, a "Get recommendations" button, and a result area — same shape as Recipe Finder (free-text ask + profile context baked into the system prompt), not folded into the open-ended Ask Your Coach chat, since this needs its own stronger safety framing every time rather than only when it happens to come up.
- `buildSupplementSystemPrompt(request)`: builds the system prompt from real profile state — goal (`GOAL_LABELS`), `bodyGoal`, active program label, dietary preference/flags/avoid list (`describeDietaryFlags`), and flagged health conditions (`activeConditionKeys()` / `PERSISTENT_CONDITIONS`, e.g. pregnancy, hypertension, diabetes) — so a condition or dietary restriction actually changes what gets asked for, not just cosmetic context.
- `submitSupplementRequest()`: the DOM-facing handler — `getApiKey()` gate with the shared `aiKeySetupPrompt` banner, skeleton loading state, `callClaudeChat(..., 3000, undefined, 'medium')` (medium effort + generous max_tokens, deliberately matching the Cross-Metric Insights fix from a prior session rather than repeating the "adaptive thinking eats the whole budget" bug), JSON-only response parsed into recommendation cards (name, evidence tier, why, dose, timing, optional caution banner) plus a closing note.
- The system prompt explicitly: grades every recommendation by real evidence tier (well-established/promising/mixed/limited) instead of presenting everything as equally proven; caps at 4 recommendations, ranked by actual relevance; refuses banned/dangerous substances (steroids, SARMs, prohormones, DNP, ephedra) via an empty `recommendations` array + explanatory note instead of ever listing them; and treats "your protein/sleep/training is the real gap" as a valid, sometimes-empty answer rather than always padding out a product list.
- Its own disclaimer (`care-disclaimer`, not the whole-view one): stronger than the view's existing generic "not medical advice" line — explicitly calls out medication interactions, pregnancy/breastfeeding, and flagged conditions, and that doses are general starting points, not a prescription.
- `WHATS_NEW['3.247']` entry added.

**On "cutting-edge/elite-level research"**: this app has no live web-search tool wired into `callClaudeChat` — it's a direct Messages API call, same as every other AI feature here. "Current" therefore means the system prompt holds the model to real evidence-tiering (ISSN-position-stand-grade consensus vs. early/promising vs. hype) from its own training knowledge, the same way the rest of this app's coaching content does (`COACH_PERSONAS`, `PROGRAM_SOURCES`) — not literal real-time internet access. Flagging this now rather than let it be assumed: if genuinely live research lookup is wanted, that's a separate, larger increment (would need a different Anthropic API capability, e.g. the web-search tool, which nothing else in this app currently uses).

## 2. Testing

New file: `test-supplement-recommendations.js` (12 cases, real invocation via `runJsdom`, `fetch` stubbed at the network boundary). Covers: `buildSupplementSystemPrompt` reacting to real goal/program/diet/condition state (sabotage-verified — a flagged `prenatal` condition actually reaching the prompt via the real `activeConditionKeys`/`PERSISTENT_CONDITIONS` pipeline, not a hand-picked string), the dangerous-substance refusal rule being real prompt text, the no-API-key short-circuit, exactly-one-request-per-submit with `effort:'medium'` (sabotage-verified — reverting to unset effort makes that case fail, confirmed and reverted before commit), conditional caution-banner rendering, a full refusal response (empty recommendations + note) rendering with zero cards, and a malformed-JSON response falling back to the error banner instead of throwing.

Adding this card also **changed the true count in two existing structural regression tests**, both updated to match (not drive-by fixes — direct, expected consequences of this feature):
- `test-coach-tab-order.js`: "exactly N cards in #coachView" was 4, now 5.
- `test-ai-key-prompt-navigation.js`: "exactly N real `aiKeySetupPrompt(` call sites" was 8, now 9.

Also fixed the button label itself before committing: `test-button-label-casing.js` caught "Get Recommendations" as Title Case on the first run — real, no override needed, changed to "Get recommendations" (sentence case, matching every other button in the app).

`bash check.sh` passes in full (version parity + every `test-*.js`, this new file included) as of this commit. Baseline was also re-established at session start after finding `jsdom` wasn't installed (`npm install` — environment issue, not a real test failure).

## 3. Not done / out of scope

- No live web-search / real-time research lookup — see the note above. If wanted, that's its own increment.
- No "log what you're actually taking" tracking, no interaction checker against a real drug database, no dose reminders — this increment is recommendations only, matching the "small, verifiable increment" scoping agreed with the user before starting.
- Not verified on a real device or against the live Anthropic API — jsdom-only coverage, same caveat as this project's other AI-feature tests (Cross-Metric Insights, video frame extraction).
- Did not touch `bariatricRebuilding`'s existing "supplement tracking" note in `PERSISTENT_CONDITIONS` — noticed it during this session but it refers to a different, pre-existing feature (nutrient-target supplementation for post-bariatric-surgery patients), not this one; flagging, not touching.
