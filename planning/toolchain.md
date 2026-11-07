# Toolchain

Owner: skills-orchestrator. Written 2026-11-07; **updated 2026-11-07 for the pre-D1 alignment round** (live is v3.516, display name Liftnext, design direction Plate & Press; see `planning/alignment/skills-orchestrator.md`). This file maps each agent's work to the skills and tools it should use, and lists vetted additions. **None of the §3 additions is installed yet** (D10 is still open). Every addition is `recommended` until the owner says yes. After that, it is vendored unmodified with a `VENDORED.md`, following the existing ones.

**When D10 is actually needed:** not for D1. Phase 0 (builds 1–6) needs only what is installed: `check.sh`, the jsdom suites, `code-review`, Playwright Chromium. paper-lookup is needed before the three unverified citations reach the app (summit Phase 1 row). Playwright WebKit and axe-core are needed before Phase 2 (build 25, the redesign). Without them Phase 2 still runs, but on Chromium only, and each PR must say so.

Status key: `installed` (in the repo now) · `recommended` (vetted, waiting for the owner) · `approved` · `rejected` (with the reason).

---

## 1. What's already here

### Project skills (`.claude/skills/`, all `installed`)

| Skill | Source, commit, licence | Runs code? | Use it for |
|---|---|---|---|
| `impeccable` | pbakaus/impeccable `9fa16a0`, Apache-2.0 | `scripts/impeccable` is a launcher that **downloads a ~21 MB engine binary from GitHub releases** (sha256-checked) and runs it. Its VENDORED.md says it is never run, **but it has been**: the engine 0.1.17 sits in `/root/.impeccable/bin/` (downloaded 2026-10-27), it ran an update check on 2026-11-07 (it reports upstream 4.8.0), and it wrote `.impeccable/questions/` (gitignored) during the design-engineer session. SKILL.md step 1 tells every invocation to run it. **Until the owner decides (alignment file, Q1), build runs use the Markdown fallback only** and do not run `scripts/impeccable`. | UI work: `audit`, `critique`, `polish`, `distill`, `harden`, `clarify`, `typeset`, `layout` |
| `taste-skill` (design-taste-frontend) | Leonxlnx/taste-skill `12af471`, MIT | Node scripts (`inspect.mjs`, `lint.mjs`, …) that drive a real browser. Output goes to `.taste-skill/` (gitignored). | App-screen rules in `references/app-screens.md`. The owner's exceptions are in its VENDORED.md. |
| `minimalist-skill`, `soft-skill` | Leonxlnx/taste-skill-classics `5e08c93`, MIT | No | Opt-in only. Use just the parts the VENDORED.md lists. |
| `apple-hig` | ebuntario/apple-hig `c434b91`, MIT | No (`bin/` and `setup` were not copied) | iPhone PWA conventions: 44pt targets, sheets, tab bars, safe areas, Reduce Motion, VoiceOver |
| `animate`, `animation-performance`, `animation-vocabulary`, `choreograph`, `find-animation-opportunities`, `improve-animations`, `review-animations` | emilkowalski/skills `c8a7962`, MIT | No | Motion work. The exercise demos were removed in v3.514, so these are for feedback motion and the UX-09b PR moment (`review-animations`, `animation-performance`). |

**Superseded project exceptions (read this before any VENDORED.md).** The "How this project uses it" notes in `impeccable/`, `apple-hig/` and `taste-skill/` VENDORED.md still describe the old **glass & glow** look (concept A): glass on chrome, the Up next ring, the day-hue gradient title, Geist as the face. The owner has since chosen **Plate & Press** (`pitch.md`, Owner's answers), and UX-03, UX-04, UX-15 and MKT-19 remove exactly those things. **For any UI item, `design-vision.md` and the item's acceptance criteria win over those VENDORED notes.** The notes need rewriting (owner's OK; the skill files themselves stay unmodified).

### Session built-in skills (available in every Claude Code session)
- **`code-review`**: correctness review of a diff or PR. Use it **without `--fix`**, because an auto-fix pass invites drive-by changes.
- **`security-review`**: review of pending changes for security problems.
- **`simplify`**: **applies** cleanups as well as finding them. Use it only on the item's own diff, and never on the whole file.
- **`run`**: launch the app and look at it.
- **`dataviz`**: rules for charts, colours and stat tiles.
- **`claude-api`**: Claude API reference: model IDs, `effort`, `max_tokens`, streaming.
- **`anthropic-skills:deep-research`**: multi-source research. It needs a tool that can spawn subagents (Agent/Task).
- **`anthropic-skills:skill-creator`**: write and evaluate a project-owned skill.
- **`loop`** and **`session-start-hook`**: scheduling, and setting up cloud sessions.
- **`fewer-permission-prompts`**: build a permission allowlist from past tool calls.

### Stack tools
- **Tests:**
  - `bash check.sh` (version parity, among other checks);
  - `node test-*.js` (199 jsdom suites at v3.516, through `testHelpers.js`);
  - `jsdom ^30` is the only devDependency.
- **Real browser:**
  - Playwright CLI 1.63, installed globally, with **Chromium only** in `/opt/pw-browsers`;
  - no WebKit binary is installed.
- **GitHub:** the GitHub MCP tools (branch, PR, review, checks). These exist **only in the main session**: no agent's `tools:` line lists any `mcp__github__*` tool. `gh` is installed but **not authenticated** here (`gh auth status`: the GH_TOKEN login fails, checked 2026-11-07), so PRs go through the MCP tools.
- **App data APIs already in `index.html`** (line numbers at v3.516):
  - USDA FoodData Central (`index.html:35037–35140`; DEMO_KEY by default, with an upgrade prompt for a personal key);
  - Open Food Facts barcode lookup (`index.html:35157–35210`);
  - NIH DSLD for supplements (`index.html:35781`);
  - Anthropic Messages API, with the owner's own key.
- **Evidence in the app:** `content-citations.js` (`PROGRAM_SOURCES`, 84 DOIs) and `test-citation-audit.js`, which checks that every entry has a citation attempt.

### Agent tool lines, as they are now (checked 2026-11-07)
- **`Skill` was added to `market-researcher`, `exercise-auditor` and `project-manager` in commit `9a277fd`, before the owner approved it.** D10 still lists it as a question, so it is a retroactive approval. If the owner says no, revert those three `tools:` lines. Every agent except skills-orchestrator now has `Skill`.
- `market-researcher` and `exercise-auditor` have `Write` but **not `Edit`**, so fixing a stale line means rewriting their whole file (438 lines for `program-audit.md`). Adding `Edit` is recommended (owner's call).
- **No agent and no setting technically blocks a merge or a push to `Branch-1`.** Subagents can't reach the GitHub MCP merge tool (not in any `tools:` line), but every agent has `Bash`, and the scheduled loop runs in the **main session**, which has `merge_pull_request`. There is no `.claude/settings.json`. "Never merge" is enforced by instructions only. See §8.

---

## 2. Each agent's toolkit

### market-researcher → `planning/research.md`

| Step | Tool | How |
|---|---|---|
| Find apps, ratings and complaints | `WebSearch` (standard mode; extended for review mining) | Date every rating. Prefer the App Store or Play listing, the developer's changelog, and Reddit threads. |
| Read a page | `WebFetch` | **In this cloud session some hosts don't resolve** (`fdc.nal.usda.gov` and `openfoodfacts.github.io` failed on 2026-11-07). When a fetch fails, fall back to a search-result citation and label it unverified, as the role file says. |
| Wide sweeps | `deep-research` | Not available to this agent, which has no Agent/Task tool. When a sweep needs it, ask the main session to run it and save the output. |
| Count taps in our own core loop | Playwright Chromium against `index.html` (a script in the scratchpad, never in the repo) | Count real clicks to log a set or a meal, so the comparison table uses measured numbers rather than guesses. |
| Score our UX gaps | Read `.claude/skills/impeccable/reference/critique.md`, plus `ux-heuristics` if approved (§3) | Give each gap a severity: 0–4 on Nielsen's scale. |

### exercise-auditor → `planning/program-audit.md`

| Step | Tool | How |
|---|---|---|
| Inventory | `Grep` / `Read` | Look at `programs`, `exerciseInfo`, `EXERCISE_MOVE`, `PROGRAM_SOURCES`, and the progression, deload and readiness code. |
| Find and verify studies | **`paper-lookup`** (recommended, §3). Until it's installed, use `curl` against the same APIs. | Use the APIs in §4. All of them except OpenAlex answered from this session on 2026-11-07. Record the endpoint, query and access date for every citation. |
| Check existing citations | `curl` to the Crossref `works/{doi}` endpoint for each DOI in `content-citations.js` | Confirm each DOI resolves, its title and year match, and it hasn't been retracted (Crossref `update-to`). Report problems in the audit. Don't edit the content. |
| Rank the evidence | §4's evidence hierarchy | Position stands and meta-analyses come first. Label preprints (SportRxiv) as such. |
| Cross-check exercise metadata | free-exercise-db JSON, read at dev time (§5) | Compare the primary and secondary muscle tags with `EXERCISE_MOVE` and the substitution lists. Use it to find gaps, never as the authority. |
| Compare with proven programs | `WebSearch` for the authors' own pages (Wendler, Cody LeFever/GZCLP, RP, Juggernaut) | Cite the author's own source, not a forum summary. |

### project-manager → `planning/roadmap.md`, `planning/backlog.md`

| Step | Tool | How |
|---|---|---|
| Check whether a feature already exists | `Grep` on `index.html`, the newest `HANDOFF-v*.md` | Cite `index.html:line`. |
| Write acceptance criteria for UI items | Read `apple-hig` references (`components/*`, `foundations/accessibility.md`) and `impeccable/reference/craft-floor.md` | Turn each rule into something a jsdom test can observe, e.g. "hit area ≥ 44px" or "`aria-label` present". |
| Rank by severity | `ux-heuristics`' 0–4 scale, if approved | Use it alongside impact × confidence × effort. |
| Tag items with their tools | This file | Every backlog item gets a `Tools:` line naming the skills the build run will use: `impeccable polish`, `apple-hig`, `dataviz`, `claude-api`, `security-review`, and so on. |
| Mark items `needs-owner` | — | Mark any item that adds a dependency, a dataset, an API, or cost. Every §3 addition counts. |

### build-automator → one PR per run

| Step | Tool | How |
|---|---|---|
| 0. Session readiness | `session-start-hook` (once, with the owner's OK) | Make cloud sessions able to run `check.sh` and the suites from the start. |
| 1. Baseline | `bash check.sh`; `for f in test-*.js; do node "$f"; done` | Record the pass counts. Stop if anything is red. |
| 1b. Pick | `planning/roadmap.md` **Unified build sequence**, as on `origin/Branch-1` (`automation.md` §4 step 5) | Not "top `ready` item in backlog file order". `.claude/agents/build-automator.md` step 3 still says file order; `automation.md` wins until that file is fixed. |
| 2. Design the change (UI items) | `Skill: impeccable` with the item's verb (`polish`, `distill`, `harden`, `clarify`, `layout`, `typeset`), **Markdown fallback only: don't run `scripts/impeccable`** (§1); `taste-skill`'s app-screen rules; `apple-hig` | `design-vision.md` (Plate & Press) and the item's criteria win over the glass-era VENDORED notes (§1). "The brief wins." |
| 2. Design the change (charts or Analysis) | `Skill: dataviz` | Keep it consistent with the existing chart tokens. |
| 2. Design the change (motion) | `review-animations`, `animation-performance` | Feedback motion only. Nothing animates on load (taste-skill exception). |
| 2. Design the change (AI features) | `Skill: claude-api` | Keep the `effort` and `max_tokens` fix described in CLAUDE.md. |
| 3. Implement | `Edit` on `index.html` and `sw.js` directly | Bump `APP_VERSION` and sw.js `VERSION` together, and add a What's New entry. |
| 4. Test | jsdom through `testHelpers.js` | Add a new or extended `test-*.js`, then sabotage-check it: revert, watch it fail, restore. Count real invocations, not text matches. |
| 4b. Accessibility pass (UI items) | `web-interface-guidelines` rules (recommended, §3); `axe-core` inside the jsdom test, if approved | axe in jsdom covers names, roles, labels and ARIA. It can't check colour contrast, which needs the browser pass. |
| 5. Real browser | Playwright Chromium (`/opt/pw-browsers`) at 402×874 (iPhone) and 904×678 (Duo, unfolded); `Skill: run` | Take screenshots into the scratchpad. Use Playwright WebKit for a Safari-engine check, if approved. It is still not a device. |
| 6. Verify before claiming | `verification-before-completion` (recommended, §3), or the same rule by hand | Re-run `check.sh` and every suite **after** the version bump. Paste the counts into the log. |
| 7. Review | `Skill: code-review` (medium, no `--fix`); `Skill: security-review` when the item touches `fetch`, keys, storage, import/export or the service worker | Fix only findings that belong to this item. Flag anything else in `build-log.md`. |
| 8. PR | GitHub MCP: `create_pull_request` into `Branch-1`; `subscribe_pr_activity` | **Main session only** (the scheduled run). Spawned as a subagent, build-automator has no MCP tools and `gh` is unauthenticated, so it can push a branch but cannot open the PR. Never merge. Never push to `Branch-1`. |
| 9. Schedule | `create_trigger` / `send_later` (see `planning/automation.md`) | One open auto-PR at a time. Main session only. |

### design-engineer → `planning/design-vision.md`, `UX-nn` items

| Step | Tool | How |
|---|---|---|
| Vision and mock-ups | `impeccable` (`critique`, `layout`, `typeset`; Markdown fallback), `taste-skill` app-screens, `apple-hig`, Playwright Chromium screenshots into `tools/design/` | Plate & Press is the brief. The glass-era VENDORED notes are superseded (§1). |
| Motion (UX-09b PR moment) | `review-animations`, `animation-performance` | Reduce Motion path is an acceptance criterion, not a polish step. |
| Charts (UX-10, UX-11, BL-20) | `Skill: dataviz` | — |
| Implementation | **Through the build loop only.** | A design-engineer PR outside the loop would collide on `APP_VERSION`/`WHATS_NEW` with the one open auto-PR (`automation.md` §1.3). |

### business-manager, marketing-manager → `planning/business.md`, `planning/marketing.md`

| Step | Tool | How |
|---|---|---|
| Market and growth evidence | `WebSearch`, `WebFetch` | Date every figure; label vendor statistics as such. |
| Claims check (BIZ-15, MKT-12, store copy) | Read `program-audit.md` source keys; ask the exercise-auditor | No health claim without a cited source. |
| Share cards (MKT-03 to MKT-19) | Their items' `Tools:` lines name `impeccable`, `dataviz`, Playwright | Built by the loop, not by these agents. |

### skills-orchestrator → this file

| Step | Tool | How |
|---|---|---|
| Discover | `WebSearch`, `SearchSkills` / `SearchPlugins` / `ListPlugins` (deferred tools), the awesome-lists in §7 | — |
| Vet | `git clone --depth 1` into a **new empty directory** under the scratchpad; read with `Read`/`grep`; **never run** a candidate's scripts | Note the licence, what it runs, its network use, its `allowed-tools`, any hooks, and the date of its last commit. |
| Install (after the owner's yes) | Copy unmodified into `.claude/skills/<name>/` with `VENDORED.md` | Use the same format as `apple-hig/VENDORED.md`. |
| Project-owned skill | `anthropic-skills:skill-creator` | See §3, item 8. |

---

## 3. Recommended additions (vetted 2026-11-07)

Vetting method: shallow clone into `scratchpad/vet/<owner_repo>/`, read SKILL.md, references and scripts, grep for network, subprocess and install calls, check the licence file and last commit. No candidate script was run.

| # | Candidate | For | Licence · commit · maintained | What it runs / network | Status |
|---|---|---|---|---|---|
| 1 | **`paper-lookup`** (K-Dense-AI/claude-scientific-skills, `skills/paper-lookup/`) | exercise-auditor | MIT · `a25cf9e` (2026-11-02) · actively maintained; endpoints reviewed 2026-09-30 | `curl` plus four stdlib-only Python helpers (`paginate.py`, `jats_to_text.py`, `openalex_abstract.py`, `arxiv_atom.py`). Network goes only to public scholarly APIs: NCBI, Europe PMC, Crossref, OpenAlex, Semantic Scholar, Unpaywall and others. Keys are optional. Bounded to about 50 calls or 1,000 records. It tells the agent to treat responses as untrusted data. `allowed-tools: Read Bash`. | `recommended`. **Top pick.** It gives the auditor reproducible, rate-limited lookups and catches the APIs' "fails with HTTP 200" traps. Vendor only this folder. Its helpers must be run with `python3 -I`. |
| 2 | **Vercel Web Interface Guidelines** (vercel-labs/web-interface-guidelines, `command.md`) | build-automator step 4b, project-manager criteria | MIT · `434b7f9` (2026-10-05) | Markdown only, 191 lines of rules: accessibility, focus, forms, animation, touch, dark mode. | `recommended`, **pinned copy only.** The wrapper skill in vercel-labs/agent-skills (`web-design-guidelines`, MIT, `1a2c79d`) is **`rejected`**: it WebFetches the rules fresh from `main` on every run, so its instructions can change underneath us unreviewed. Some rules are React-specific (`htmlFor`, `onKeyDown`). Read them as their plain-DOM equivalents. |
| 3 | **`ux-heuristics`** (wondelai/skills) | market-researcher, project-manager, impeccable critiques | MIT · `d8d5d75` (2026-11-02) · v1.6.0 | Markdown only: SKILL.md plus 6 references covering Nielsen, Krug, a WCAG checklist and dark patterns. The only links are book references (Amazon affiliate tags). | `recommended`. A shared 0–4 severity scale makes research gaps and backlog priorities comparable. Overlaps a little with impeccable `critique`, but it's the better scoring rubric. |
| 4 | **axe-core 4.14.0** (Deque), as a devDependency only | build-automator tests | MPL-2.0 · npm 4.14.0 · very widely used | A JS rule engine that runs inside our own jsdom or Playwright page. No network. Never shipped to the app. | `recommended` (**needs-owner: adds a devDependency**). Pin the exact version. jsdom can't do colour contrast, so the contrast check runs in Playwright Chromium (plain `axe.run` via `page.addScriptTag`; `@axe-core/playwright` isn't needed). |
| 5 | **superpowers**: `verification-before-completion` and `systematic-debugging` only (obra/superpowers) | build-automator | MIT · `22f0b46` (2026-11-03) · very active | Both are Markdown. `systematic-debugging` ships `find-polluter.sh`, a test-bisection script, which should be run only when needed and after reading it. | `recommended` for these **two skills only**. Their rules match CLAUDE.md ("actually execute them, don't reason that they'd pass"). **The full plugin is `rejected`:** its SessionStart hook injects a workflow on every session, and its brainstorming, worktree and plan skills would compete with CLAUDE.md and the planning flow. |
| 6 | **Playwright WebKit browser** (`playwright install webkit`, matching the CLI's 1.63) | build-automator step 5, market-researcher | Apache-2.0 | Downloads a browser binary from Playwright's CDN. No change to the app. | `recommended` (**needs-owner**). It's the closest thing to iOS Safari we can run here: it catches `-webkit-` and `backdrop-filter` differences. It **doesn't** replace on-device checks. CLAUDE.md's "unverified on device" notes stay. |
| 7 | **free-exercise-db** (yuhonas), reference data | exercise-auditor | Unlicense · `f00c92c` (2026-09-27) · 876 exercises | Static JSON. Read at dev time; nothing fetched by the app. | `recommended` **as an audit cross-check only.** See the provenance flag in §5. Don't ship its images or instructions in the app without the owner's decision. |
| 8 | **Project-owned skill `ship-increment`**, written by us with `skill-creator` | build-automator | Ours | Markdown recipe for one version. | **`rejected` (withdrawn by skills-orchestrator, 2026-11-07 alignment round).** Since this was proposed, `automation.md` §4 became the full per-run recipe, and the scheduled prompt already points at it. A skill would be a third copy beside CLAUDE.md and `automation.md` §4, and the second copy (`.claude/agents/build-automator.md`) has already drifted from §4 (pick order, branch name). Fix the drift instead. Remove it from D10. |

### Rejected (vetted and not recommended)

| Candidate | Reason |
|---|---|
| **AccessLint plugin** (accesslint/claude-marketplace → AccessLint/skills, MIT, `2e9d733`) | Every scan runs `npx -y @accesslint/chrome@latest` and `@accesslint/cli@latest`, and the bundled MCP server is `npx -y @accesslint/mcp@latest`. That means unpinned code from npm on every use, and it launches its own Chrome. Its WCAG-EM method is good, but axe-core pinned (#4) covers the engine without the moving parts. Reconsider only if they publish pinned versions. |
| **Anthropic `webapp-testing`** (anthropics/skills, Apache-2.0, `2c5958e`) | It is written for **Python** Playwright, which isn't installed (we use the Node CLI), and `with_server.py` runs `shell=True` server commands. Its one useful idea ("wait for the page, look, then pick selectors") is already how our Playwright passes work. |
| **refactoring-ui-skill** (LovroPodobnik) | No licence file, so all rights are reserved. wondelai's `refactoring-ui` (MIT) exists but overlaps impeccable and taste-skill. Not needed. |
| **wondelai `ios-hig-design`**, **rshankras/claude-code-apple-skills** (MIT) | Native SwiftUI/UIKit focus, and it duplicates the installed `apple-hig`. rshankras is a large Swift toolkit with shell scripts, irrelevant to a PWA. |
| **K-Dense `literature-review`** | `generate_schematic_ai.py` calls OpenRouter, a **paid API**, with `OPENROUTER_API_KEY`. The SKILL.md installs pandoc, TeX and `parallel-web-tools`. `paper-lookup` (#1) is the safe subset. |
| **wondelai `hooked-ux`** | Engagement-loop design (Nir Eyal) works against the mission of faster, more trustworthy tracking, and risks dark patterns. |
| **ExerciseDB API** (AscendAPI) | Proprietary. The licence ends with the subscription and **forbids storing data**, which is incompatible with an offline PWA. Paid. |
| UI/UX Pro Max, Hallmark, Scroll-World, Scroll-Craft, img2threejs, Design Sprint, frontend-design | Marketing-page or 3D focus, or duplicates of installed skills. Exercise demos are parked (HANDOFF-v59 addendum 41). |

---

## 4. Evidence sources for the exercise-auditor

**Hierarchy** (cite the highest tier available, with the year):
1. Position stands and consensus statements:
   - ACSM, already cited as Currier et al. 2026 in `content-citations.js`;
   - NSCA;
   - ISSN position stands for nutrition and supplements (open access in *JISSN*);
   - WHO 2020 physical-activity guidelines.
2. Systematic reviews and meta-analyses, e.g. Schoenfeld volume dose-response, Pelland et al. on volume and frequency, Refalo et al. on proximity to failure, Singer et al. 2024 on rest intervals. Cochrane reviews for rehab topics.
3. Individual RCTs.
4. Preprints (SportRxiv). Label them "preprint, not peer-reviewed", and recheck before shipping.
5. Practitioner sources (program authors, Stronger By Science, RP) for **program structure**, never as evidence of effect.

**APIs** (tested from this session on 2026-11-07):

| Source | Reachable here | Licence and limits | Use |
|---|---|---|---|
| NCBI E-utilities (PubMed, PMC) | yes (200) | Public. 3 req/s without a key, 10 with one. | Search, abstracts, PMID↔DOI conversion |
| Europe PMC REST | yes (200) | Free. Open-access full text in JATS. | Full text, preprints (`SRC:PPR`) |
| Crossref REST | yes (200) | Metadata is free. 1 req/s for lists; add `mailto` for 3. | DOI verification, **retraction checks** for `content-citations.js` |
| OpenAlex | **429**: an API key has been required since Feb 2026. The free budget is quoted inconsistently, so check it. | Data is CC0 | Citation counts and topic sweeps. Needs a free key via `request_credential` (owner). |
| Unpaywall, Semantic Scholar | not tested | Unpaywall needs an `email` parameter. S2 rate-limits hard without a key. | Open-access PDFs, citation graph |

---

## 5. Datasets and data APIs

| Dataset | Licence | Status in the app | Recommendation / flags |
|---|---|---|---|
| **USDA FoodData Central** | Public domain, CC0 1.0 | In use (`index.html:35028`) | Keep it. **Flag:** DEMO_KEY is shared per IP and returned **429** on a test call today. The app already shows an upgrade prompt when the limit is hit (`index.html:35100`). An option for later (needs-owner): bundle a small CC0 Foundation Foods / SR Legacy subset of common foods so search works offline and without a key. |
| **Open Food Facts** | Database ODbL; contents DbCL. Image licence not confirmed here; check OFF's terms. | In use for barcodes (`index.html:35156`) | Keep it. Limits are 100 product reads/min and 10 searches/min, per user. **Flags** (for the owner and backlog, not fixed here): (a) OFF asks callers to identify themselves (`AppName/Version (email)`), and a browser `fetch` can't reliably set `User-Agent`, so check how the app identifies itself. (b) ODbL needs attribution, and share-alike applies if a derived database (e.g. the barcode→My Foods cache) is ever redistributed. Confirm the app shows "Data from Open Food Facts" somewhere a user can see. |
| **NIH DSLD** | US government, public | In use (`index.html:35775`) | No change. |
| **free-exercise-db** | Unlicense (public domain) | Not used | Use it as an audit cross-check only. **Provenance flag:** it was restructured from `wrkout/exercises.json`, whose text and images appear to come from an older commercial site, so the public-domain claim for the **images and instruction text** is uncertain. Muscle, equipment and mechanic tags are low-risk facts. |
| **wger** | Code AGPL-3.0. Exercise data has a **per-exercise** licence (mostly CC-BY-SA 3/4, some CC-BY 4 or CC0). 930 exercises via `wger.de/api/v2/exerciseinfo/` (reachable). | Not used | `recommended` as a secondary reference with clean licensing metadata. Anything shown in the app needs per-item attribution and share-alike. Needs-owner before any in-app use. |
| ExerciseDB | Proprietary, no storage | — | `rejected` (§3). |

---

## 6. Orchestration: research → live

1. **Research** (market-researcher) and **audit** (exercise-auditor) run in parallel and independently.
   - The researcher uses WebSearch and WebFetch, measures tap counts with Playwright Chromium, and scores gaps with ux-heuristics. Output: `research.md`.
   - The auditor inventories `index.html`, finds and verifies studies with paper-lookup or curl (PubMed, Europe PMC, Crossref), and runs a Crossref DOI and retraction sweep over `content-citations.js`. Output: `program-audit.md`.
   - Neither touches app code.
2. **Roadmap.** The project-manager reads both files and greps the app before claiming a gap. It ranks themes by impact × confidence × effort, using the shared 0–4 severity, and benchmarks each theme against the best app. Output: `roadmap.md`.
3. **Backlog.** The project-manager splits themes into one-version items. Each has jsdom-checkable acceptance criteria (drawn from apple-hig, impeccable's craft floor and the Web Interface Guidelines for UI items), a test plan, a risk, and a **`Tools:` line** naming the §2 skills. Anything that adds a dependency or dataset, costs money, or changes data shape is `needs-owner`. Output: `backlog.md`.
4. **Toolchain check** (skills-orchestrator). Before the first build run, and whenever the backlog gains a new kind of work, confirm the `Tools:` lines name installed tools. Propose an addition here if one is missing, and wait for the owner.
5. **Build run** (build-automator, scheduled, one item per run). Each run:
   - syncs and runs the **baseline** (stops if red);
   - picks the next `ready` item in the roadmap's Unified build sequence;
   - designs with the named skill (`impeccable <verb>`, apple-hig, dataviz, claude-api);
   - implements in `index.html` and `sw.js`;
   - writes a jsdom test with a **sabotage check**, adding axe if approved;
   - bumps both versions and adds What's New;
   - runs the **full suite again** (verification-before-completion);
   - does a **Playwright pass** at the iPhone and Duo sizes (WebKit too, if approved);
   - runs **code-review** (no `--fix`) and **security-review** when relevant;
   - commits, pushes the branch, and opens a PR into `Branch-1`;
   - logs to `build-log.md`, marks the backlog item done, and adds a HANDOFF addendum.
6. **PR.** One open auto-PR at a time. The run subscribes to PR activity, and review comments come back to the next run.
7. **Owner review.** The owner reads the PR, the screenshots and the test counts, and tries it on the iPhone where it matters. Device-only behaviour stays marked "unverified on device" until then.
8. **Live.** Only the owner's explicit yes merges into `Branch-1`, which deploys to GitHub Pages. No agent merges, pushes to `Branch-1`, or deploys.

```
market-researcher ─┐                        ┌─ skills-orchestrator (tools per item)
                   ├─► project-manager ─► backlog ─► build-automator ─► PR ─► owner ─► Branch-1 (live)
exercise-auditor ──┘   (roadmap)                       (one item/run)        ▲
                                                                             └ review comments → next run
```

---

## 7. Red flags and open questions for the owner

1. **The `Skill` tool for market-researcher, exercise-auditor and project-manager** was already added (commit `9a277fd`) before approval. D10 now asks the owner to keep it or revert it.
2. **Unpinned remote instructions or code** are the main risk in this ecosystem. The guide cites Snyk's ToxicSkills research: prompt injection in 36% of the skills it sampled. That figure comes from a vendor, but it shows the scale of the problem. This is why Vercel's live-fetch wrapper and AccessLint's `npx @latest` were rejected.
3. **Auto-fixing skills** (`simplify`, `code-review --fix`, `accessibility-fix`-style tools) conflict with "no drive-by fixes". Use them review-only, scoped to the item's own diff.
4. **Network:** WebFetch couldn't resolve `fdc.nal.usda.gov` or `openfoodfacts.github.io` here. OpenAlex needs a key. The USDA DEMO_KEY was rate-limited. Research and audit runs should expect gaps and label them.
5. **Licences to settle before any in-app content import:** OFF attribution and ODbL share-alike; wger CC-BY-SA per exercise; free-exercise-db image provenance.
6. **Approvals waiting**, in priority order:
   1. paper-lookup;
   2. Web Interface Guidelines (pinned);
   3. axe-core devDependency;
   4. ux-heuristics;
   5. superpowers' two skills;
   6. Playwright WebKit;
   7. ~~a `ship-increment` project skill~~ (withdrawn, §3 #8);
   8. an OpenAlex key.

## 8. Guardrails so no agent can merge or deploy (proposed, needs the owner)

Today "never merge" is a sentence in each agent file and in the run prompt. Nothing enforces it. Proposed, for the owner to apply (agents may not change settings):
1. **`.claude/settings.json` deny rules** (project-level, so they bind the main session and every subagent): `mcp__github__merge_pull_request`, `mcp__github__update_pull_request_branch`, `Bash(gh pr merge:*)`, `Bash(git push origin Branch-1:*)`, `Bash(git push origin HEAD:Branch-1:*)`, `Bash(git push --force:*)`. Prefix rules can be evaded by other spellings, so this is a seatbelt, not a lock.
2. **The lock: GitHub branch protection on `Branch-1`** (owner, in repo settings): require a pull request; block force pushes and deletion; do not allow auto-merge. If Claude's GitHub access uses the owner's own token, protection can't tell Claude from the owner, so rule 1 still matters.
3. Not verified here: whether this environment's git proxy already refuses pushes to `Branch-1`. No push was attempted.

## Sources
- UI/UX skills guide (local copy read): https://pasqualepillitteri.it/en/news/576/claude-code-skills-design-uiux-guide
- Repos vetted:
  - https://github.com/K-Dense-AI/claude-scientific-skills
  - https://github.com/vercel-labs/web-interface-guidelines
  - https://github.com/vercel-labs/agent-skills
  - https://github.com/wondelai/skills
  - https://github.com/obra/superpowers
  - https://github.com/accesslint/claude-marketplace
  - https://github.com/anthropics/skills
  - https://github.com/rshankras/claude-code-apple-skills
  - https://github.com/LovroPodobnik/refactoring-ui-skill
  - https://github.com/yuhonas/free-exercise-db
- FoodData Central API guide (CC0; 1,000 req/h per key): https://fdc.nal.usda.gov/api-guide (via search; direct fetch blocked here)
- Open Food Facts API (rate limits, User-Agent, ODbL): https://openfoodfacts.github.io/openfoodfacts-server/api/ (via search; direct fetch blocked here)
- NCBI E-utilities limits: https://support.nlm.nih.gov/kbArticle/?pn=KA-05510
- OpenAlex keys and pricing: https://developers.openalex.org/api-reference/authentication
- ExerciseDB terms: https://exercisedb.notion.site/ExerciseDB-API-Terms-of-Use-226983b728ca8090bf7be79564e4b356
- wger licences: `https://wger.de/api/v2/license/` (queried 2026-11-07)
