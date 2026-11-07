# Alignment: skills-orchestrator (2026-11-07)

## 1. Sign-off: Agree with conditions
Liftnext becomes the free, on-device training app with the most trustworthy engine, rebuilt in Plate & Press one tested PR at a time, and the owner alone decides what goes live. The toolchain is ready for Phase 0 today; conditions are B1-B3.

## 2. Blocking concerns before D1
- **B1. Nothing technically stops a merge or a push to `Branch-1`.** There is no `.claude/settings.json`. Every agent has `Bash`. The scheduled loop runs in the main session (`automation.md` §2-3), which has `mcp__github__merge_pull_request`. "Never merge" is prose in each agent file and in the run prompt. Subagents can't reach the MCP merge tool (no `mcp__github__*` in any `tools:` line), and `gh` is unauthenticated here, but `git push` to `Branch-1` was not tested and may work.
  *Fix (owner applies; agents may not change settings):* GitHub branch protection on `Branch-1` (require a PR, no force push, no auto-merge), plus project deny rules for `mcp__github__merge_pull_request`, `gh pr merge` and `git push … Branch-1`. Details are in `toolchain.md` §8.
- **B2. The loop would run a binary the vetting record says is never run.** `impeccable/SKILL.md` step 1 tells every invocation to run `scripts/impeccable`, which downloads a ~21 MB engine from GitHub releases and executes it. Its VENDORED.md says "is not run", but it has been: `/root/.impeccable/bin/0.1.17/impeccable` (2026-10-27), an update check on 2026-11-07 (it reports upstream 4.8.0), and `.impeccable/questions/` in the repo (gitignored). A scheduled run invoking `Skill: impeccable` sees SKILL.md, not VENDORED.md.
  *Fix:* the owner decides (Q1). Until then, `toolchain.md` §1-2 now say build runs use the Markdown fallback only. `automation.md` §4 step 6 should say so too (build-automator's file).
- **B3. The build-automator's two instruction sets disagree, and the run prompt loads both.** The prompt says "Act as the build-automator defined in .claude/agents/build-automator.md" and then "follow automation.md §4". The agent file (step 3) picks the "top item in backlog.md with Status: ready" (file order) and names branches `claude/auto-<date>-<item-id>`. `automation.md` §4 step 5 uses the roadmap's Unified build sequence and `claude/auto-<item-id>`. In file order, BL-07 would ship before BL-08 and UX-01, which is the order the summit rejected (R1-R11).
  *Fix:* before D1, edit `.claude/agents/build-automator.md` steps 1 and 3 to defer to `automation.md` §4 (owner-approved config edit), or add one line to the run prompt: "where they differ, automation.md wins".

## 3. Non-blocking (fix during the build)
- **Glass-era exceptions in VENDORED.md.** The notes in `impeccable/`, `apple-hig/` and `taste-skill/` still protect glass & glow: glass on chrome, the Up next ring, the day-hue gradient title, Geist. Plate & Press removes these (UX-03, UX-04, UX-15, MKT-19). A UI run reading them would argue against its own item. Rewrite the notes before Phase 2 (build 25) and leave the skill files unmodified. Until then, `toolchain.md` §1 says design-vision and the item's criteria win.
- **Missing `Tools:` lines.** Only 12 of 98 backlog items have one, and none of UX-03 to UX-09, UX-11 to UX-17 or MKT-17 to MKT-19 does. The defaults cover Phase 0-1. Add them before Phase 2 (project-manager).
- **No `Edit` for two agents.** market-researcher and exercise-auditor have `Write` but not `Edit`, so a one-line fix means rewriting a 438-line file. Add `Edit` (owner).
- **`fonts/` and CLAUDE.md.** CLAUDE.md says "no assets ship now", but `fonts/` (Geist, precached by `sw.js`) does ship. UX-02 (Archivo) builds on that precedent. CLAUDE.md is the owner's file: flagged, not edited.
- **Skills vs CLAUDE.md:** no other conflicts found. `minimalist-skill`, `soft-skill` and `review-animations` are `disable-model-invocation`. taste-skill's scripts write only to the gitignored `.taste-skill/`. Its `assets.mjs` fetches images over the network, but no item needs it.

## 4. Conflicts with other agents' plans
- **D10 timing (`pitch.md`, D10; `summit.md` tools table):** D1 does not need D10. Phase 0 runs on installed tools. paper-lookup is needed before the three unverified citations reach the app. WebKit and axe-core are needed before Phase 2. I want D10 settled before build 25, not before D1.
- **The `ship-increment` skill (`pitch.md` D10; `automation.md` §7 note 4):** I withdraw my own recommendation. `automation.md` §4 is the recipe now, and a third copy would drift the way the agent file already has (B3). Drop it from D10.
- **The `Skill` tool for three agents (D10):** already added in commit `9a277fd`, before approval. D10 is a retroactive yes or a revert, and `pitch.md` should say so.
- **design-engineer implementing outside the loop** (`design-engineer.md` step 3): any PR that bumps `APP_VERSION` collides with the one open auto-PR. All implementation should go through the loop.

## 5. Stale items in my file (`toolchain.md`, fixed today)
- "Three agents have no Skill tool": they do now (commit `9a277fd`).
- "impeccable binary never run": false; the record now says it was run.
- "Exercise demos parked": they were removed in v3.514.
- "About 190 suites": now 199.
- Data-API line numbers moved to their v3.516 positions.
- The "picks the top `ready` item" step now uses the Unified sequence.
- The `ship-increment` recommendation is withdrawn.
- §1 notes that the glass-era VENDORED exceptions are superseded.
- New sections: §8 guardrails, and toolkits for design-engineer, business-manager and marketing-manager.
- No Chalklog mentions were found in my file.

## 6. Questions only the owner can answer
1. **Impeccable's engine:** allow the pinned, checksum-verified 0.1.17 engine to run in build runs, or Markdown fallback only (my recommendation, because it's unattended and downloads code)?
2. **Before D1:** will you turn on branch protection for `Branch-1` and add the merge and push deny rules (B1)?
3. **D10:** keep the `Skill` tool already given to three agents, and approve paper-lookup now, with WebKit and axe-core before Phase 2?
