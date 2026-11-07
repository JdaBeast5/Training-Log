# Pre-D1 alignment round — brief (2026-11-07)

The owner wants every agent to agree on the app's direction and raise any concerns that must be settled **before D1**. D1 means: merge `planning/` to Branch-1 and start the automated build loop. The loop runs 3 builds a day, one tested increment each, as a PR, and never goes live without the owner's "yes".

## Where things stand
- **Live:** v3.516.
  - The app is named **Liftnext**. Chalklog was dropped the same day because several "Chalk" fitness apps exist. The name is display-only; storage keys are unchanged.
  - The new icon **"Sash"** (option B, the five plate inks as one band) is the home-screen icon, the header mark and the launch.
- **Owner decisions so far:** see `planning/pitch.md`, "Owner's answers, 2026-11-07".
  - **Design:** Plate & Press for the app. The race-bib story card, "Your number" and "Pin it on" provide the edge (`design-directions.md` §5–§6, MKT-16 to MKT-19).
  - **Money:** free forever for anything that runs on the phone. A later Pro subscription only for server-cost features (hosted AI, sync). A founding price for early users. Possibly a coach plan and paid coach programs. No ads, no quotas, no paywall on ordinary use. See `business.md` §3, D9, BIZ-18 to BIZ-22.
  - **Still open:** D1 to D6, D8, D10.
- **Planning set:** `research.md`, `program-audit.md`, `toolchain.md`, `roadmap.md` (unified 60-build sequence), `backlog.md`, `automation.md`, `business.md`, `marketing.md`, `design-vision.md`, `design-directions.md`, `summit.md`, `pitch.md`.
- **Known stale spots:** several files still say Chalklog. The roadmap still schedules the rename and icon for Phase 5, though both have shipped.

## What each agent writes
Write `planning/alignment/<your-agent-name>.md`, no more than about 60 lines:
1. **Sign-off:** Agree / Agree with conditions / Disagree, with the direction stated in one line, in your own words.
2. **Blocking concerns before D1:** the things that would make the build loop build the wrong thing, ship something unsafe or dishonest, or conflict with another agent's plan. For each, give the evidence (file, section, item ID) and the fix you propose.
3. **Non-blocking concerns:** things to fix during the build.
4. **Conflicts with other agents' plans:** name the file and item, and say what you'd want.
5. **Stale items in your own files:** anything outdated (Chalklog, already-shipped work, superseded decisions). List them, and fix them in your own file only.
6. **Questions only the owner can answer:** at most 3.

## Rules
- Be blunt. Don't invent consensus.
- Check claims against the files and the live code (`index.html`, `sw.js`), not memory.
- Only edit your own owned planning file to fix stale items, plus your alignment file.
- Don't edit `index.html`, `sw.js`, tests, or another agent's files. Don't commit.
