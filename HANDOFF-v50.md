# HANDOFF v50 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2` (restarted fresh from `origin/Branch-1` at the start of this session — the branch had been merged via PR #22 / `b8e1f2f`). `APP_VERSION`/`VERSION` bumped 3.258 → **3.261**. No `SCHEMA_VERSION` change — no stored-data shape changed.

Note for whoever reads this next: HANDOFFs v43–v49 cover this same feature arc; the three commits between v49 and this session (3.254 "frequency on cards", 3.255 "naturally-typed name recognition", 3.256 "flagged-condition additions", 3.257 "DSLD search", 3.258 "age-based HMB") shipped **without** their own HANDOFF entries — a lapse in whatever session did them, not something this session caused or backfilled. Their content is fully described in commit messages and in `index.html`'s own `WHATS_NEW` entries for those versions if you need the detail.

Also mid-session, PR #23 (`claude/supplement-descriptions-expand`, "Fix description persistence, make My Supplements collapsible") merged into `Branch-1` and claimed v3.259 first — this session's branch was rebased onto that new tip (fast-forward, no functional conflicts) and bumped to 3.260, correctly avoiding that collision.

Then, after this session's PR (#25) was already open, a SECOND PR on the same `claude/supplement-descriptions-expand` branch ("Make My Supplements descriptions expandable") merged into `Branch-1` first and independently also claimed v3.260 — the two branches split from the same base and bumped in parallel. At merge time this PR's commit was cherry-picked onto the new `Branch-1` tip and re-bumped a second time, to 3.261, with its `WHATS_NEW` entry renumbered to match — this second collision/renumber was resolved by the orchestrating session at merge time, not by this session's own work.

## 1. What was asked

"Another agent can work on making sure that the medically modified groups or pregnant or post partum, women on their periods etc, if selected in the profile, should be getting supplements added to their list or at least recommended."

## 2. Audit: what was already covered

- Prenatal and postpartum already get a Choline addition (`FOUNDATIONAL_SUPPLEMENT_STACK.conditions`), worded differently for each, added in an earlier session (v3.256 line of work).
- The female axis already carries a blanket Iron item, whose own `why` text already names menstrual blood loss as the reason.
- Cycle Tracking's own `CYCLE_PHASES.menstrual.physical`/`.nutrition` text already says "iron-rich foods... worth prioritizing" and "make sure iron... intake stay[s] adequate" — this app already knew about the iron/period link in two separate places.

**Conclusion on new supplement CONTENT: none needed.** I looked specifically for a genuinely new, non-duplicate, well-evidenced angle tied to Cycle Tracking (the task's own suggested example was "extra Iron emphasis during/after menstrual bleeding") and did not find one that wasn't just the existing Iron item restated with different framing — which is exactly the anti-pattern the `conditions` axis's own comment in `FOUNDATIONAL_SUPPLEMENT_STACK` already warns against ("never a re-statement of an existing item with a tweaked dose"). I considered and rejected: a second Iron entry scoped to "during your period" (same nutrient, restated); Vitamin C as an iron-absorption enhancer (real mechanism, but still just in service of the same existing Iron item, not a standalone need); Chasteberry/Vitex for PMS symptoms (real but distinct concern — mood/cramping, not deficiency — and evidence tier is meaningfully weaker/more mixed than anything else in this table; left out as a separate product decision, not folded in here to "look busy").

**The real gap was surfacing, not content.** Both the condition-linked additions (prenatal/postpartum/hypertension/diabetes/osteoporosis, and the age-50+ HMB band) and the menstrual-phase iron relevance already existed in the app, but nothing ever pointed a flagged person at them. The condition-linked items were only reachable by manually opening Coach → expanding "View foundational stack" — with zero signal that there was anything condition-specific waiting there. The cycle-phase iron note lived only in Cycle Tracking's own phase-guide text, with no link to the actual Iron recommendation card that has a real "+Add to my supplements" button.

## 3. Recommend vs. auto-add decision

**Decision: recommend, not auto-add.** Every existing write path into `my-supplements` (the Coach tab's "+ Add to my supplements" buttons) already requires an explicit tap. There is no precedent anywhere in this app for silently populating someone's tracked list without one — starting that precedent here, for content someone hasn't asked about, would be a materially more paternalistic move than anything else this app does, and the user's own phrasing ("added to their list **or at least recommended**") explicitly leaves room for the safer option.

What shipped instead: a new Today Insights row (`getFoundationalStackNudgeInsight`) that fires when (a) any currently-flagged condition has a real, untracked `FOUNDATIONAL_SUPPLEMENT_STACK.conditions` addition, or (b) Cycle Tracking's own `computeCyclePhase` currently reads `menstrual` and Iron isn't tracked yet. It names the specific untracked item(s) and carries a real `.link-btn`/`data-jump-to="supplementRecommendationsCard"` — the app's own existing inline-prose-action and cross-tab-jump components (no new navigation mechanism invented) — straight to the Coach tab's Foundational Stack card, where the person taps "+ Add" themselves exactly as they would from anywhere else. Nothing in this change ever calls `addMySupplement`.

## 4. What shipped

One function, `getFoundationalStackNudgeInsight()` (index.html, right after `getCycleInsight`), added to `renderTodayInsights`'s existing `Promise.all`/`items` list — same `getXInsight() -> string|null` shape every other Today Insights row already uses, sitting directly under the Cycle Tracking row in priority order. Already-tracked items (case-insensitive, matching the existing "already tracked" rule) are always filtered out, so this only ever nudges toward what's missing.

Deliberately NOT touched: `SUPPLEMENT_ITEMS`/`loadSupplements` (bariatric checklist, explicitly out of scope) — verified with a real test that flagging `bariatricRebuilding` produces no nudge and doesn't crash, since that key has no entry in `FOUNDATIONAL_SUPPLEMENT_STACK.conditions` by design.

## 5. Testing

New file: `test-supplement-condition-cycle-nudge.js`, 13 real-invocation tests against the actual `getFoundationalStackNudgeInsight`, `activeConditionKeys`, `computeCyclePhase`, and `loadMySupplements` — no reimplementations. Covers: no-trigger baseline; bariatric exclusion; single and multiple flagged conditions; already-tracked suppression (case-insensitive); the real menstrual-phase Iron trigger computed from real `computeCyclePhase` day-in-cycle math (not a hardcoded phase); a sabotage-relevant follicular-phase (day 10/28) case proving the phase gate is real, not "any female with cycle data saved"; a combined condition+cycle case; and two wiring tests that stub every other Today Insights getter to null and prove `renderTodayInsights` genuinely calls and renders this one (and correctly hides the card when nothing fires).

**Sabotage-verified, three separate breaks, each confirmed failing then restored:**
1. Removed `getFoundationalStackNudgeInsight()`/`stackNudge` from `renderTodayInsights`'s `Promise.all`/`items` — both wiring tests failed (`stackNudge is not defined`), confirming they aren't just checking a stub.
2. Hardcoded `onPeriod = true` regardless of actual phase — the follicular-phase test failed, confirming the phase gate is real.
3. Dropped the `tracked.has(lower)` half of the dedupe check — both already-tracked tests failed, confirming the filter is real, not accidentally always-passing.

All three restored; `diff` against a pre-sabotage backup of `index.html` confirmed byte-identical after restore.

`bash check.sh` (128 test files as of this commit): **all checks passed**, version parity confirmed at 3.261, including a fix along the way — my first draft of the nudge's button label ("Review in Foundational Stack →") tripped `test-button-label-casing.js`'s real Title Case detector (mid-clause capital on "Foundational Stack"); reworded to "Review in the foundational stack →" and reran clean. That test doing its job here is itself a small confirmation the existing suite is worth keeping green.

## 6. What's still open / unverified

- Not verified on a real device — same standing caveat as the rest of this feature arc.
- No AI-path equivalent: `buildSupplementSystemPrompt`'s AI recommendations already read `activeConditionKeys()`/flagged conditions into the prompt (pre-existing), but this nudge is Foundational-Stack-specific and doesn't currently prompt someone to also try the AI request box. Not treated as a gap — the two surfaces already point at each other elsewhere (My Supplements' empty-state jump-link goes to the whole Coach card, which contains both).
- The `link` list-formatting helper inside `getFoundationalStackNudgeInsight` (`"X & Y"` / `"X, Y, & Z"`) is a small piece of purpose-built copy, not a shared utility — no other insight row needed a multi-item list before this, so nothing existing was duplicated, but a future insight needing the same shape should reuse this rather than write a fourth version.
