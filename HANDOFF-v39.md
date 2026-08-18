# HANDOFF v39 — Training Log

Covers v3.207 → v3.215 on `claude/visual-formatting-card-spacing-65869a`. Scope: a user-requested visual-formatting/redundancy review ("review everything for visual — gradients, shadows, glass, translucent... make sure each card has the correct spacing... have someone check for redundancy") plus one live bug report mid-session ("some red that popped up on the nutrition page that is out of the scheme"). No feature work, no relitigating the native-Android-conversion or per-exercise-citation scope exclusions.

## 1. What shipped

Two parallel background-agent audits (one CSS gradient/shadow/glass, one card-expansion spacing) kicked this off. Their raw findings were independently re-verified with `grep`/`git log -p -L` before anything was touched — one agent's "14x identical inset shadow" claim turned out to actually be several distinct alpha tiers (0.03 through 0.35), only two of which (0.25×10, 0.35×5) were genuine exact repeats. Don't take agent duplicate-counts at face value; recount.

**v3.208 — Removed a dead `.program-intro` CSS rule (the actual "wildly bulky" bug).** `git log -p -L` showed two `.program-intro{...}` rules landed in the *same* commit (v3.153): an older one and its intended "spec plate" replacement. The old one was never deleted. Same selector/specificity, so its `padding-top`/`border-top` kept silently applying everywhere — most visibly, two stacked `<p class="program-intro">` citation paragraphs in Research & Sources rendered with an unwanted divider between a source's school and its citation. This is what the user was actually seeing when they said a card "opens and it's wildly bulky."

**v3.209/v3.210/v3.213/v3.214 — Mechanical CSS token consolidation (zero visual change).** Five rounds of the same established method (see the `[PHASE H2.2]` comment in `:root` — this project's own "3+ exact repeats" bar for token extraction), each verified via real-cascade text substitution (pull the token's own definition from the real `:root`, substitute it into the real call site, assert byte-identical to the pre-conversion literal) and sabotage-verified against a deliberately wrong value:
- `--focus-ring-glow` (4 sites), `--gym-panel-gradient` (4 sites — one already flagged in its own code comment as duplicated), `--cta-gloss-inset` (10 sites), `--fab-gloss-inset` (5 sites), `.vol-bar-fill` deduped onto the pre-existing `--cta-gradient-blue`.
- `--glass-blur` (4 sites × 2 prefixed declarations = 8 occurrences) + `--nav-glass-bg` (3 sites) for the nav-bar backdrop-filter recipe.
- `--surface-rgb`/`--surface2-rgb` — closed a real gap: `--surface`/`--surface2` had no RGB companion unlike `--plate-*-rgb` and the neutral white/black tokens, so 9 glass-panel sites hand-typed the decimal triplet. Each site's own alpha was preserved exactly; only the triplet was factored out.

**v3.211 — CTA-blue gradient stop standardized to 60%.** Real, *undocumented* drift: 4 buttons (`.save-btn`, `.coach-fab`, `.calendar-cell.selected`, `.compare-confirm-btn`) used a literal 55% stop while the shared `--cta-gradient-blue` token (9 other sites) was 60%. The `:root` comment already documents that a *green* 55/60 split was deliberately litigated — this blue one had no such note, so it wasn't safe to assume either way. Asked the user directly (same as this file's own precedent for the `#7C97FF`→`#6E8AFF` color call); 60% won. All 4 sites now reference the token instead of duplicating the literal.

**v3.212 — Fixed the PROTEIN bar's off-brand red (live bug report).** `#barPro`'s markup hardcoded `background:var(--plate-red)` — the one macro bar using this app's "urgent/warning" color for a completely normal metric (CALORIES=white, FAT=yellow, CARBS=blue, none red). Confirmed via `NUTRIENT_BAR_COLOR`'s own pattern a few hundred lines below (red reserved *only* for the `overMax` branch) that this was real drift, not intentional. User picked teal to replace it.

**v3.215 — Aligned `.progress-badge-deload`'s fill to its own text color.** Text used the real `--plate-red` token; background/border/glow used an unlinked literal red (`224,80,80` / `#E05050`) that didn't match `--plate-red-rgb` at all. Its sibling `.progress-badge` (increase/yellow) is fully token-consistent throughout, and `.progress-badge-decrease` is fully self-consistent the other way (deliberate literal `#E67E22` used identically everywhere) — `.progress-badge-deload` alone mixed a token with an unrelated literal. Asked the user; confirmed align-to-token.

## 2. Explicitly investigated and left alone (not bugs)

- **`.program-basis-toggle`'s 44px empty-looking tap target** — the spacing audit flagged this as reintroducing an anti-pattern `.nutrition-header` deliberately avoided elsewhere. Checked the code: it has its own explicit, reasoned comment ("min-height, not padding... clears the 44px touch target") — a genuine accessibility tradeoff, not drift. Left untouched.
- **`.progress-badge-decrease`'s literal `#E67E22`** — checked against `rgba(230,126,34,...)` used in the same rule's background/border/glow: `230,126,34` *is* the exact decode of `#E67E22`. Fully self-consistent, deliberate custom color, not a typo of `--plate-orange`. Left untouched.
- **Inter-card gaps** — the spacing audit checked every list container (`#logView`, `#analysisView`, `#historyView`, settings/care sections) for `gap:`-vs-`margin-bottom` inconsistency and found none: `.card{margin-bottom:18px}` is applied uniformly everywhere, no competing mechanism. Nothing to fix here.

## 3. Current version and state

`APP_VERSION`/`VERSION`: **3.215**, pushed to `origin/claude/visual-formatting-card-spacing-65869a` at every commit in this range (8 commits total, one per increment, each independently tested and versioned — no batched changes). `check.sh` (105 test files as of this commit) is green — run before and after every single change, including after each version bump, per this project's own testing discipline. `node_modules` needed a fresh `npm install` at session start (jsdom wasn't present) — that's environment setup, not a real baseline failure.

No PR has been opened for this branch — not requested.

## 4. What's still open

1. **~80 non-neutral, non-plate-family `rgba()` literals** — carried forward from HANDOFF-v33/v36/v37's original "~212 remaining" count, now further reduced by this session's work but not exhaustively audited to zero. Not all of it is drift; some (like `.progress-badge-decrease`'s literal orange) is deliberate. A future pass would need the same site-by-site verification discipline this session used, not a blanket sweep.
2. **The jump-rail scroll-timing risk on a real device** and the **Cross-Metric Insights / video-frame-extraction unconfirmed-against-live-API/device caveats** — both untouched this session, carried forward unchanged from HANDOFF-v33/v36/v37/v38.
3. Nothing from this session's work has been confirmed on an actual phone — same standing caveat every prior handoff carries. All verification here was jsdom real-cascade computed-style/text-substitution proofs (documented per-test why jsdom's CSSOM can't resolve `var()` in `getComputedStyle`, so text-substitution against the real extracted `:root` was used instead) plus visual reasoning from the source, not a live browser or device screenshot.
4. The road-cycling competitive/recreational citation tension and boxing's head-impact-safety gap (both from HANDOFF-v38) are untouched — out of scope for this session.
