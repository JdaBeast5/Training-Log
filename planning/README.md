# Planning

The owner's mission (2026-11-07): "the best tracking app and the best workout plans according to the most up to date studies and proven workouts."

| File | Owner (agent in `.claude/agents/`) | What it holds |
|---|---|---|
| `research.md` | market-researcher | Top trackers: ratings, loops, praise and complaints; our gaps; the plan of action |
| `program-audit.md` | exercise-auditor | Every program and progression rule against current evidence; how to beat other apps |
| `roadmap.md` | project-manager | Themes ranked by impact × confidence × effort, benchmarked |
| `backlog.md` | project-manager | One-version items with acceptance criteria, test plan, risk, status |
| `toolchain.md` | skills-orchestrator | Which skills and tools each agent uses; vetted additions |
| `automation.md`, `build-log.md` | build-automator | The scheduled build loop and what each run shipped |

Flow: research + audit → roadmap → backlog → build runs (one item per run, as a PR) → owner review → live.

Nothing goes live without the owner's explicit yes.
