# Product

<!-- impeccable:product-schema 1 -->

> Inferred, not interviewed (2026-11-07). The design-engineer ran as a subagent with no question tool, so every fact below comes from the owner's written mission in `planning/README.md`, `CLAUDE.md`, `planning/research.md`, `planning/business.md` and the code at v3.514. The owner should confirm or correct it.

## Platform

web

## Users
- **Primary: the self-coached lifter.** Trains 3–6 days a week with free weights, follows or wants a proven program, and is tired of paying for basics. The job: "Tell me what to lift today and whether to add weight, and make logging it take one tap." (business.md §1)
- **Secondary:** the lifter who also eats to a calorie target and logs food daily.
- **Tertiary:** the careful trainee (rehab, prenatal and postpartum, hypertension, seniors) following a clinical-style plan.
- Today there is one known user, the owner, on an iPhone (including a Duo-style foldable), installed as a home-screen PWA.

## Product Purpose
Owner's mission: "the best tracking app and the best workout plans according to the most up to date studies and proven workouts." Success is a person who opens it at the bar, sees the next set, logs it in one tap, and trusts the next session's prescription. North-star metric: weekly active trainers, people logging at least 2 sessions in a calendar week.

## Positioning
The free, private training app that coaches you like the paid ones: about 25 authored, cited programs with free double progression, RPE loads, deloads, warm-ups and plate math; one-tap set logging; no ads, no account, logs stay on the phone.

## Operating Context
- Used mid-workout in a gym: between sets, sweaty hands, phone on a bench or in a pocket, 1–3 minute rests, mixed lighting from fluorescent to dim basement. Glances of a few seconds.
- Also used at rest: the morning plan check, food logging through the day, the weekly look back at progress.
- Programs are structured as weeks of a block (accumulation, intensification, deload) with day templates; history is keyed by exercise position.

## Capabilities and Constraints
- Single-file `index.html` with inline CSS and JS plus `sw.js`; no build step; GitHub Pages; offline PWA. `APP_VERSION` equals `sw.js` `VERSION`.
- Views routed by `VIEW_RENDERERS` / `showView()`: Today, Log (food), Analysis, History, plus Settings, Care and overlays.
- Features: set chips with one-tap logging and Undo, rest timer, warm-up and plate calculators, PR detection and share cards, weekly recap, readiness, body weight, food search, barcode, AI photo and describe logging (own Anthropic key), JSON backup.
- Every functional change ships as one version with a jsdom test and a sabotage check.
- Asset files beside `index.html` need the owner's approval (CLAUDE.md).

## Brand Commitments
- Name: "Training Log" (an open question for a public launch, BIZ-12).
- Voice: plain, direct, evidence-cited; no hype, no social feed, no ads.
- Self-hosted Geist and Geist Mono already ship (`fonts/`).

## Evidence on Hand
- Real programs and exercises in `index.html` and `content-exercises.js`; realistic seeded data at `/.taste-skill/seed3.html`.
- No user testimonials, ratings, press or customer counts exist. None may be invented.

## Product Principles
1. The next set is the product. Everything else is context for it.
2. One tap per set, enforced in tests; speed never traded for looks.
3. Show the reason: every prescription carries its one-line why and its source.
4. Your data is yours: on the device, exportable, never lost to a migration.
5. Free core forever; no ads.

## Accessibility & Inclusion
WCAG AA contrast in light and dark; 44pt minimum targets; Reduce Motion honoured; VoiceOver names on every control; legible at arm's length mid-set.
