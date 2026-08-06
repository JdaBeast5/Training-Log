# CLAUDE.md — Training Log

## What this is
A personal fitness tracking PWA: single-file `index.html`, zero build step, a service worker (`sw.js`) for offline/install behavior, deployed to GitHub Pages, installed on iPhone as a home-screen PWA. ~80 versions of iterative, mostly solo-session development history behind it.

## Hard constraints — do not violate
- **No build step.** Everything lives in `index.html` (inline `<style>`/`<script>`) plus `sw.js`. Don't introduce bundlers, frameworks, or a build pipeline as part of "cleanup."
- **`APP_VERSION` in `index.html` must always equal `VERSION` in `sw.js`.** Bump both together, every change. Run `check.sh` — it enforces this.
- **`sw.js` is a real file to edit directly, not something to paste inline.** Past sessions repeatedly had it arrive as inline document text instead of an actual file edit — don't do that.
- **Preserve established architectural conventions, don't relitigate them:**
  - `expand-wrap` grid animation pattern
  - `makeSwipeable` for swipe gestures
  - Namespaced localStorage keys
  - `SCHEMA_VERSION` / `runMigrations()` for data migrations
  - `VIEW_RENDERERS` / `showView()` for view routing (recently consolidated — don't fragment it back apart)
  - `window.storage` for small per-user persisted preferences (collapsed-group state, active view, etc.)

## Before touching anything: establish a baseline
At the start of every session, before any edit: run `check.sh` and every `test-*.js` suite as they exist right now, and note the result. This is the known-green baseline everything else gets diffed against.
- If something is already failing, stop and report it rather than folding a fix into unrelated cleanup work — a pre-existing failure is information, not an invitation to patch it silently.
- If everything passes, that's the state to preserve. Any change that can't be shown to still pass the full suite afterward isn't done yet.
- This step has never reliably happened in past sessions, since prior work happened outside an environment that could actually execute the tests. That excuse no longer applies — always run them for real, don't reason about whether they'd pass.

## This session's mandate: stabilize, don't redesign
The priority is **paying down patchwork accumulated across many iterative versions** — not adding features, not redesigning UX, not "while I'm in here" improvements. The app's current capabilities are the spec. Nothing should look, behave, or feel different to the user when this is done — it should just be built on straighter code.

Concretely:
1. **Behavior first, structure second.** Treat the current passing test suite as the definition of correct behavior. If something you're about to refactor has no test, write one that captures its *current* behavior before touching it. If you can't articulate what "unchanged" means for a piece of code, that's a signal to slow down.
2. **No drive-by fixes.** Notice an unrelated bug, dead CSS rule, or redundant style while working on something else? Flag it, don't fix it in the same change. (Precedent: a dead `:first-of-type` CSS rule was found that would have started matching as a side effect of an unrelated tag change — it was removed rather than let a multi-version-old behavior change ship silently as a side effect. Same discipline applies here: an opportunistic fix bundled into a refactor is exactly how "cleanup" turns into an undocumented behavior change.)
3. **Small, verifiable increments.** One consolidation at a time — e.g. "merge these near-duplicate ramp-calculation code paths into one," tested and versioned on its own — not a sweeping rewrite pass across the file.
4. **Consolidate duplication, don't invent new abstractions.** Where the same logic is copy-pasted across programs or views, unify it using patterns already established in this codebase (see `groupCorpusByExercise`, `readExCorpus`, `buildFoodResultRow` as examples of consolidations already done well). Don't introduce new architectural layers, state managers, or abstractions the file doesn't already use.
5. **Nothing ships "probably fine."** Every functional change gets a real test, per below.

## Testing discipline (already established — follow it)
- Every functional change gets a jsdom behavioral test in a `test-*.js` file: extract the real markup/function source from `index.html`, load it into jsdom, call the real functions, assert on actual resulting DOM state — not string-matching against the source.
- Use sabotage-style anchors (e.g. `assert count == 1` on patch sites) to catch fixtures that pass by proving themselves rather than proving the code.
- Watch for a failure mode that's recurred repeatedly in this project: a comment that quotes a call literal can defeat a naive static count assertion. Count real invocations, not text occurrences.
- Run `check.sh` and all `test-*.js` suites together before calling any change done — actually execute them, don't just reason that they'd pass.
- Re-run tests after a version bump too, not only before — line-number drift from the edit itself has produced false confidence in past sessions.

## Known fragile / in-flight areas — handle with extra care, don't silently "fix"
- **Cross-Metric Insights (AI feature):** fixed as of a prior session — `output_config.effort:'medium'` + `max_tokens:5000` were added specifically to stop adaptive thinking from consuming the whole token budget before producing output (see the HANDOFF v30 comment near `generateCrossMetricInsights`/`callClaudeChat`). Not yet confirmed with a real API round-trip or a test — treat as "fixed in code, unverified in practice" until one exists.
- **Video form feedback frame extraction:** fixed as of a prior session — an explicit "Fixed by:" comment at `extractVideoFrames` documents the iOS Safari `seeked`-doesn't-fire-from-`readyState 1` workaround (element attached to DOM, `readyState>=2` wait, play/pause decoder wake, `timeupdate` fallback, per-stage timeouts). Not yet confirmed on an actual iPhone — treat as "fixed in code, unverified on device" until someone checks.
- **`--rim` CSS variable:** the self-reference cycle at the token definition itself is fixed (`--rim:0 1px 0 var(--sheen) inset`). Gym mode's `.exercise-block.open` still writes a literal `box-shadow` instead of `var(--elev-*)` — checked closely, and this is *not* leftover breakage: it's a deliberately different, hand-tuned elevation formula (opaque fill, brighter hairline, coloured bloom) built specifically because the generic token formula reads as flat on gym mode's pure-black, blur-less background. Leave it as a literal — swapping in a token here would silently trade a tuned look for the generic one. The comment at that rule was corrected to stop citing the (now-fixed) cycle as the reason, since that was actively misleading about why the literal exists.
- **A backlog of changes unverified on an actual device** exists as of the last handoff (collapsible Analysis groups, jump-rail auto-expand, chevron rotation, a chevron-shell restructure). Don't assume these work as designed, and don't build further logic on top of unconfirmed assumptions about their behavior — check the actual code.

## Handoff convention
At the end of a session, or before a large context reset, write `HANDOFF-v<N>.md`: what changed and why, any real-device findings, what's still unverified, and explicit warnings for whoever picks this up next. Read the most recent handoff at the start of every session before making changes.

## What "better and more stabilized" means here
Fewer near-duplicate implementations of the same logic. Fewer dead code paths and unused rules — flagged, then fixed deliberately, never silently. Clearer function boundaries. The exact same feature set the app has today, just resting on straighter foundations.
