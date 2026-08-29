# HANDOFF v46 — Training Log

Branch: `claude/supplement-recommendations-vi9hw2`. `APP_VERSION`/`VERSION` bumped 3.249 → **3.250**.

## 1. What changed

Fourth increment in this session's supplement-tracking arc (see HANDOFF v43-v45): wired Coach tab's Supplement Recommendations straight into the Log tab's My Supplements tracker (v45), closing the loop the design proposal flagged as the natural next step.

- `renderSupplementCards(items)` (shared by both the AI-generated recommendations and the Foundational Stack) now renders a `+ Add to my supplements` button on every card, keyed by array index (`data-idx`) — same convention `submitRecipeSearch`'s `recipe-log-btn`/`data-idx` already uses, not by embedding the name in the DOM.
- New `wireSupplementAddButtons(containerEl, items)`: one shared wiring function, called by both `submitSupplementRequest` and `renderFoundationalStack` after they set their result HTML. Looks up the clicked card's item by index into the SAME array that was just rendered, calls the real `addMySupplement(item.name)`, then flips the button to "Added ✓" and disables it. One implementation, so the AI path and the static path can never drift into two different behaviors.
- CSS: extended the existing `.recipe-log-btn` selector to also cover `.supplement-add-btn` (shared visual definition, not a duplicated block) plus one small override (`width:100%`) since this button isn't inside a flex action row the way Recipe Finder's is.
- `WHATS_NEW['3.250']` entry added.

## 2. Testing

Extended `test-supplement-recommendations.js` from 17 to 20 cases. The two setup helpers (`setupSubmit`, `setupFoundationalStack`) needed real `window.storage` (get/set against a `__store`, not just the old single-purpose `ai-api-key` stub) plus `addMySupplement`/`loadMySupplements`/`saveMySupplements`/`wireSupplementAddButtons` added to their extracted-source lists — `renderMySupplements` itself is stubbed as a no-op in both, since the My Supplements card's own rendering is already covered end-to-end by `test-my-supplements-tracker.js`; duplicating that here would test the same thing twice for no benefit.

New cases: clicking the real add button on an AI-recommended card calls the real `addMySupplement` and disables itself; **sabotage-verified index wiring** — with two rendered cards, clicking the SECOND one's button adds only that item (temporarily hardcoding the lookup to always use index 0 makes this fail, confirmed and reverted before commit — this is exactly the "always affects the first item" bug class the index-based convention exists to prevent); and clicking the Foundational Stack's add button adds one of the real curated entries, not a placeholder.

`bash check.sh` passes in full (version parity + every `test-*.js`) as of this commit.

## 3. Not done / out of scope

- The button always says "+ Add to my supplements", even if that exact name is already in the tracker — clicking again is a harmless no-op (`addMySupplement`'s own case-insensitive dedupe handles it), but the button doesn't pre-check and show "Already added" on initial render. Matches Recipe Finder's own `recipe-log-btn`, which has the same non-precondition-checked behavior; consistent with existing precedent, not a gap introduced here.
- No "jump to My Supplements" link/toast after adding — the button confirms in place (green check network + disabled), same as Recipe Finder's own grocery-list button.
- This closes out the four-part arc from this session: Supplement Recommendations (v43) → Foundational Stack preset (v44) → My Supplements tracker (v45) → this integration (v46). Nothing further was explicitly requested at session's end.
- Not verified on a real device.
