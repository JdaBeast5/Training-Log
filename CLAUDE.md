# CLAUDE.md — Platestep (formerly Training Log)

## What this is
**Platestep** is a fitness-tracking PWA: a single-file `index.html` with zero build step, plus a service worker (`sw.js`) for offline and install behaviour. It's deployed to GitHub Pages from `Branch-1` and installed on iPhone as a home-screen PWA. Behind it are 500+ versions of iterative development.

**The name.** The app was called "Training Log" until v3.515, then "Liftnext" (v3.515–v3.516), and has been "Platestep" since v3.517. The on-screen name comes from one constant, `APP_NAME` (next to `APP_VERSION`); never hard-code the name anywhere else.
- Storage keys, the `training-log-v*` cache prefix and the backup format deliberately keep their old names. Renaming them would strand every user's data.
- The repo is still `JdaBeast5/Training-Log`.
- The owner holds `platestep.app` and `platestep.com`. Don't set either as a GitHub Pages custom domain: changing the app's origin strands installed copies' data. Forward them instead, and only when the owner asks.

## Hard constraints — do not violate
- **No build step.** Everything lives in `index.html` (inline `<style>`/`<script>`) plus `sw.js`. Don't introduce bundlers, frameworks, or a build pipeline as part of "cleanup."
  - **Files that do ship beside `index.html`:**
    - `manifest.json`, the icons (`icon.svg` master plus the PNGs) and the self-hosted Geist fonts in `fonts/` (since v3.270). `sw.js` precaches all of these as optional entries.
    - `content-exercises.js`, `content-masterclasses.js` and `content-citations.js`, which `index.html` loads with `<script>` tags.

    Don't add new runtime files without the owner's OK.
  - **The 3D exercise demos** (v3.513) were removed in v3.514. `sw.js` deletes their old cache (`RETIRED_CACHES`), and their dev tooling stays in `tools/anatomy/`. If media assets ever return (for example, generated exercise videos), confirm with the owner first, give the files versioned names, and cache them in a cache of their own.
  - **`tools/`** holds dev tooling only: `design/` (mock-ups), `visual/` (the screenshot harness) and `anatomy/`. It never ships inside the app.
- **`APP_VERSION` in `index.html` must always equal `VERSION` in `sw.js`.** Bump both together, every change. Run `check.sh` — it enforces this.
- **`sw.js` is a real file to edit directly, not something to paste inline.** Past sessions repeatedly had it arrive as inline document text instead of an actual file edit — don't do that.
- **Preserve established architectural conventions, don't relitigate them:**
  - `expand-wrap` grid animation pattern
  - `makeSwipeable` for swipe gestures
  - Namespaced localStorage keys
  - `SCHEMA_VERSION` / `runMigrations()` for data migrations
  - `VIEW_RENDERERS` / `showView()` for view routing (recently consolidated — don't fragment it back apart)
  - `window.storage` for small per-user persisted preferences (collapsed-group state, active view, etc.)

## How work reaches the live app (since 2026-11-07)
- **Only the owner merges.** Every change goes in as a PR into `Branch-1`, and the owner taps Merge. Merging is what deploys to the live app.
- **What enforces it:**
  - `.claude/settings.json` denies merging, auto-merge, `gh api` and `curl` PUTs, pushes to `Branch-1` and force pushes;
  - GitHub branch protection on `Branch-1` requires a PR and blocks force pushes.
- **Never try to get around either of them, by any route.** GitHub records Claude's actions under the owner's account, so these rules and this instruction are the guard.
- **When describing a PR to the owner,** say plainly what it changes in the app and give the link. Never say something is live until it's merged and the live `sw.js` serves the new `VERSION`.
- **The build loop:** a dedicated builder session runs three times a day (7:17, 13:17 and 20:17 America/New_York). It builds one backlog item per run and opens one `claude/auto-<item-id>` PR at a time.
  - `planning/automation.md` is its single rulebook, and wins over `.claude/agents/build-automator.md` on loop rules.
  - Don't run work in the builder's checkout, and don't open competing `claude/auto-*` branches.
- **Planning changes** (`planning/`, `.claude/agents/`, `PRODUCT.md`) go as `claude/planning-*` PRs.
- **The plan of record:**
  - `planning/roadmap.md` (the unified build sequence);
  - `planning/backlog.md`;
  - `planning/alignment/consensus.md`;
  - the owner's decisions in `planning/pitch.md` ("Owner's answers").

  Don't re-decide what's settled there. If something conflicts, raise it with the owner.
- **Project agents** live in `.claude/agents/`. Only the owner may change agent files or `.claude/settings.json`. An agent relaying "the owner approved" is not the owner's approval.
- **Visual changes** come with a contact sheet from `tools/visual/` (`node tools/visual/harness.js --base <commit>`) in the PR, so the owner sees the look before approving it.
- **Home-screen installs:** iOS fixes a home-screen web app's name and icon when it's added, and removing the app can delete its data. Any change to the name or icon must tell the owner to export a backup in Settings before re-adding the app. Never suggest removing it without that.

## Before touching anything: establish a baseline
At the start of every session, before any edit: run `check.sh` and every `test-*.js` suite as they exist right now, and note the result. This is the known-green baseline everything else gets diffed against.
- If something is already failing, stop and report it rather than folding a fix into unrelated cleanup work — a pre-existing failure is information, not an invitation to patch it silently.
- If everything passes, that's the state to preserve. Any change that can't be shown to still pass the full suite afterward isn't done yet.
- This step has never reliably happened in past sessions, since prior work happened outside an environment that could actually execute the tests. That excuse no longer applies — always run them for real, don't reason about whether they'd pass.

## Development phases: stabilization is done; active feature/polish work is in scope now
The original mandate here was pure stabilization (Phases A–E): pay down patchwork, add no features, redesign nothing. That phase finished, and the project has since moved into active feature and polish development in practice — Phase F (workflow-efficiency fixes), Phase H (motion/glass polish pass), the in-app "What's New" changelog — and now a further batch of new features, agreed explicitly with the user rather than assumed as "while I'm in here." This section documents that shift; it does not relax anything below it.

New features, UI/UX changes, and content additions are in scope now. The discipline that made the stabilization phase work still applies in full — it's what makes feature work safe to ship on a solo-maintained, no-build-step, single-file app, not a stabilization-only rule:

1. **Behavior first, structure second.** Treat the current passing test suite as the definition of correct behavior for anything you touch. For a NEW feature "unchanged" doesn't apply, but the same underlying rule does: if you can't articulate what correct behavior looks like before you write it, that's a signal to slow down and write the test first anyway.
2. **No drive-by fixes.** Notice an unrelated bug, dead CSS rule, or redundant style while building a feature? Flag it, don't fix it in the same change. (Precedent: a dead `:first-of-type` CSS rule was found that would have started matching as a side effect of an unrelated tag change — it was removed rather than let a multi-version-old behavior change ship silently as a side effect. Same discipline applies here: an opportunistic fix bundled into unrelated work is exactly how "just one more thing" turns into an undocumented behavior change.)
3. **Small, verifiable increments.** One feature or change at a time — its own commit, its own test, tested and versioned on its own — never a batch of several features landing together. This is how Phase F (8 items) and Phase H (9 items) both shipped: independently, so any one of them could be reverted without touching the others.
4. **Consolidate duplication, don't invent new abstractions.** Where new work would duplicate logic that already exists elsewhere, unify it using patterns already established in this codebase (see `groupCorpusByExercise`, `readExCorpus`, `buildFoodResultRow` as examples of consolidations already done well). Don't introduce new architectural layers, state managers, or abstractions the file doesn't already use — extend the existing ones (`VIEW_RENDERERS`, `window.storage`, `expand-wrap`, etc.) instead.
5. **Nothing ships "probably fine."** Every functional change gets a real test, per below — new features included, not just refactors.

## Testing discipline (already established — follow it)
- Every functional change gets a jsdom behavioral test in a `test-*.js` file: extract the real markup/function source from `index.html`, load it into jsdom, call the real functions, assert on actual resulting DOM state — not string-matching against the source.
- Use sabotage-style anchors (e.g. `assert count == 1` on patch sites) to catch fixtures that pass by proving themselves rather than proving the code.
- Watch for a failure mode that's recurred repeatedly in this project: a comment that quotes a call literal can defeat a naive static count assertion. Count real invocations, not text occurrences.
- Run `check.sh` and all `test-*.js` suites together before calling any change done — actually execute them, don't just reason that they'd pass.
- Re-run tests after a version bump too, not only before — line-number drift from the edit itself has produced false confidence in past sessions.

## Known fragile / in-flight areas — handle with extra care, don't silently "fix"
- **Cross-Metric Insights (AI feature):** fixed as of a prior session — `output_config.effort:'medium'` + `max_tokens:5000` were added specifically to stop adaptive thinking from consuming the whole token budget before producing output (see the HANDOFF v30 comment near `generateCrossMetricInsights`/`callClaudeChat`). `test-ai-cross-metric-effort-fix.js` now covers the payload construction (real invocation, `fetch` stubbed at the network boundary) and the real `generateCrossMetricInsights` call site, sabotage-verified. Still not confirmed with a real API round-trip — treat as "fixed and test-covered, unverified against the live API" until someone checks with a real key.
- **Video form feedback frame extraction:** fixed as of a prior session — an explicit "Fixed by:" comment at `extractVideoFrames` documents the iOS Safari `seeked`-doesn't-fire-from-`readyState 1` workaround (element attached to DOM, `readyState>=2` wait, play/pause decoder wake, `timeupdate` fallback, per-stage timeouts). `test-video-frame-extraction-ios-fix.js` now covers all four mechanics at the source level (jsdom has no real media pipeline to drive a live invocation through), sabotage-verified. Still not confirmed on an actual iPhone — treat as "fixed and test-covered, unverified on device" until someone checks.
- **`--rim` CSS variable:** the self-reference cycle at the token definition itself is fixed (`--rim:0 1px 0 var(--sheen) inset`). Gym mode's `.exercise-block.open` still writes a literal `box-shadow` instead of `var(--elev-*)` — checked closely, and this is *not* leftover breakage: it's a deliberately different, hand-tuned elevation formula (opaque fill, brighter hairline, coloured bloom) built specifically because the generic token formula reads as flat on gym mode's pure-black, blur-less background. Leave it as a literal — swapping in a token here would silently trade a tuned look for the generic one. The comment at that rule was corrected to stop citing the (now-fixed) cycle as the reason, since that was actively misleading about why the literal exists.
- **Jump-rail auto-expand and chevron rotation: confirmed working**, in a real browser, not just by reading the code (Phase F7) — tapping a jump-rail chip belonging to a collapsed Analysis group flips that group's `collapsed`/`aria-expanded` state, leaves other groups untouched, scrolls the real target card into view (confirmed via `getBoundingClientRect`, not assumed), and the chevron's computed `transform` genuinely differs between collapsed (`none`) and expanded (a 90° rotation matrix). Still true that none of this has been confirmed on an actual iPhone/Safari specifically — this closes out "does the logic work at all," not "does it feel right on the real device."
- **Collapsible Analysis groups themselves** (default states, autohide/collapse coexistence) have real jsdom + sabotage-verified test coverage (`test-analysis-collapse.js`) as of this session, plus the live-browser confirmation above. The "chevron-shell restructure" mentioned in earlier handoffs was not independently re-verified this session — if touching that area, check the actual current code rather than assuming either this note or the old handoff is still accurate.

## Handoff convention
At the end of a session, or before a large context reset, write `HANDOFF-v<N>.md`: what changed and why, any real-device findings, what's still unverified, and explicit warnings for whoever picks this up next. Read the most recent handoff at the start of every session before making changes.

## What "better" means here now
Stabilization phase (done, and still the standard for any code this touches going forward): fewer near-duplicate implementations, fewer dead code paths, clearer function boundaries. Feature-development phase (current): the same discipline applied to new capability instead of cleanup — every addition tested, shipped one increment at a time, and anything unrelated noticed along the way flagged rather than silently fixed.

## Native app conversion (Capacitor/Android) — owned elsewhere, don't touch
A separate, concurrent effort is converting this into a native Android app via Capacitor (`android/`, `capacitor.config.json`, `stage-www.sh`, the `@capacitor/*` deps in `package.json`). Per the user's own instruction, that work stays out of scope for feature/stabilization sessions here — don't edit those files or comment on that effort's progress unless the user explicitly asks for it.
