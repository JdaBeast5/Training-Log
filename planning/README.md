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
| `business.md` | business-manager | Strategy, model, funnel, what blocks success; BIZ-nn backlog items |
| `marketing.md` | marketing-manager | Brand, built-in virality and share moments, store and launch, experiments; MKT-nn items |
| `design-vision.md` (+ `tools/design/`) | design-engineer | The high-end redesign vision, mock-ups, staged UX-nn items |
| `summit.md` | project-manager (chair) | The 2026-11-07 cross-review of all eight agents and its resolutions (R1–R11) |
| `pitch.md` | project-manager (chair) | The owner-facing pitch: promise, plan, and the decisions only the owner can make |

Flow: research + audit + business + marketing + design vision → roadmap → backlog → build runs (one item per run, as a PR) → owner review → live.

Nothing goes live without the owner's explicit yes.

Owner's mandates (2026-11-07):
- **Business and marketing:** "anything he sees that needs fixing and optimizing, goes". Their items are `ready`, except money, user-data, legal, privacy or health-claim items, which are `needs-owner`.
- **Design engineer:** a full redesign mandate ("even if … the app is no longer recognizable"), delivered in tested, shippable increments.
