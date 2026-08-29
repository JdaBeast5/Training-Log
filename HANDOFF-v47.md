# HANDOFF v47 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2`. `APP_VERSION`/`VERSION` bumped 3.250 → **3.251**.

## 1. What changed

Fifth increment in this session's supplement-tracking arc — a polish pass the user explicitly asked for on top of v43-v46: make the "already added" state real/persisted rather than session-only, and bring the Foundational Stack toggle in line with the app's existing motion/visual system instead of an ad hoc implementation. No streak was added (explicitly declined).

**1. "Already tracked" state is now real, not just post-click.** `renderSupplementCards(items, alreadyTracked)` takes a second argument — the real `loadMySupplements()` list — and renders a card's `+ Add to my supplements` button as already-added and `disabled` from the very first render if that name (case-insensitive, matching `addMySupplement`'s own dedupe rule) is already tracked. Both call sites now fetch that list before rendering:
- `submitSupplementRequest` — a fresh AI request that happens to recommend something already tracked shows it correctly.
- `renderFoundationalStack` — reopening the Foundational Stack after adding something from it (or from an earlier AI request) shows it correctly too.

This closes the exact gap HANDOFF v46 flagged as known-and-accepted at the time: "the button doesn't pre-check ... on initial render." The user specifically asked this be consistent "across the board" — it's the same check, in the same shared `renderSupplementCards`, for both paths.

**2. Foundational Stack toggle now uses the app's real collapsible-detail component**, not a bespoke one. Previously: a plain `.usda-key-upgrade-toggle` (an underlined text link — this app's convention for minor actions like "Clear conversation") toggling a plain div's `display:none`/`''`, with hand-rolled JS fully re-rendering-and-clearing content on every open/close. Replaced with:
- Markup: `<button class="program-basis-toggle" aria-expanded="false" aria-controls="foundationalStackResult"><span class="chev">›</span> View foundational stack</button>` + `<div class="smooth-toggle" id="foundationalStackResult"><div></div></div>` — the exact same component the program-overview panels' "What this is based on" reveal already uses (`.program-basis-toggle`/`.smooth-toggle`/`.chev`), which is itself the same `grid-template-rows` animation technique as `.expand-wrap` (Body Measurements, Progress Photos).
- The open/close animation itself is **not new code** — it's the existing generic, already-tested, document-delegated `.program-basis-toggle` click listener (see `test-program-overview.js`), which now also fires for this button since it matches by class. This app-wide reuse is what actually delivers "the same visual/motion polish as the app throughout" the user asked for, rather than a bespoke reimplementation that happened to look similar.
- A second, element-specific listener on the SAME button only re-renders content, and only when opening (checked via `aria-expanded` reading the pre-click state, same convention the generic listener itself relies on) — so "already tracked" state and gender-profile changes stay current on every open, without wasting a render on every close.
- `renderFoundationalStack` is now `async` (it awaits `loadMySupplements()`) and writes into the wrapper's single required child div (`.firstElementChild`), never into the animated wrapper itself — same "exactly one child" rule `.expand-wrap`'s own CSS comment documents, for the same overflow-clipping reason.
- `toggleFoundationalStack()` no longer exists — deleted, not deprecated, since its entire job (open/close, label swap, clear-on-close) is now the generic component's job.
- `WHATS_NEW['3.251']` entry added.

**On the broader "glass/gradient/translucent" ask**: audited the rest of the new supplement UI against it before concluding no other changes were needed. The outer `.card` wrapper (My Supplements, Supplement Recommendations) already carries the app's elevation/sheen system (`--elev-2`, the `::before` top-highlight gradient) automatically, by virtue of using the shared `.card` class — nothing bespoke there. `.photo-result-card` (the individual recommendation cards) is deliberately flat/subtle — it's the SAME shared sub-card class Recipe Finder and Snap-a-Meal's photo results already use nested inside their own glass-elevated cards, so leaving it alone is what keeps supplements looking consistent with those, not a gap. The `+ Add to my supplements`/`recipe-log-btn` buttons and the My Supplements "done" checkbox already use the app's `--cta-gradient-green`/`--cta-gloss-inset` tokens. The one real mismatch was the toggle button described above, now fixed.

## 2. Testing

`test-supplement-recommendations.js` grew from 20 to 24 cases (net; several existing ones were rewritten, not just added, since `toggleFoundationalStack` no longer exists):
- Removed the old toggle test (function deleted); replaced with two that prove ONLY what's actually new here — a click while collapsed renders real content, and a click while already expanded (about to close) does NOT re-render (sabotage-verified: removing the `aria-expanded` guard makes the second case fail, confirmed and reverted before commit). The shared component's own open/close mechanic is deliberately NOT re-tested — that's `test-program-overview.js`'s job, and duplicating it here would test the same code twice.
- Three new "already tracked" tests: a Foundational Stack render with one seeded name shows that card pre-added/disabled while a different card in the same render stays normal (sabotage-verified — hardcoding `isTracked` to always-false makes all three of these fail, confirmed and reverted); a case-insensitivity check (stored lowercase, real entry mixed-case, still matches); and the same behavior proven against a real AI-recommendation response.
- `setupSubmit`/`setupFoundationalStack`'s shared `bodyHtml` and script-chunk lists updated to the new real markup/functions throughout.

`bash check.sh` passes in full (version parity + every `test-*.js`) as of this commit.

## 3. Not done / out of scope

- Still no streak for My Supplements — explicitly declined by the user this session.
- No cross-card live sync: adding a supplement from one rendered card doesn't retroactively update a DIFFERENT already-rendered card's button in the same session (e.g., two separate AI requests open at once). Each render checks real state at render time; nothing currently pushes an update to an already-painted card. Not asked for, and would need a broader event/observer mechanism this app doesn't have anywhere else.
- Fuzzy name matching remains out of scope — "Vitamin D3" vs. a hypothetical AI reply of "Vitamin D" would not currently be recognized as the same item. Matches the exact-string (case-insensitive) precedent `addMySupplement`'s own dedupe and `findKnownSupplementInfo` already use; not changed here.
- Not verified on a real device.
