# planning/launch-copy

The business copy that has to exist before Platestep goes public (Phase 5), drafted ahead of time so the build items only need to wire it in. It was drafted against **v3.517** (`Branch-1` at `0868e23`). Every factual claim cites `file:line`, and line numbers drift with every version, so re-check the citations before wiring anything in.

**This is not legal or medical advice.** Counsel should review `privacy.md` (and the public promise in `whats-free.md`) before public launch, and the clinician from D9(e) reviews `claims-review.md`.

| File | What it is | Feeds | Owner gate |
|---|---|---|---|
| `privacy.md` | A plain-English privacy policy that matches the live code: what stays on the phone, each outbound host with its trigger and the data sent, export, delete, and what we don't do. Ends with a reviewer-only evidence table (host → trigger → data → file:line) and five discrepancies found while writing it. Placeholders for the LLC, contact, effective date, hosting provider and children's policy. | **BIZ-16** (`privacy.html`; its test's host classification table can be copied from the evidence table), the README privacy facts in **BIZ-07**, and the store's data-safety forms | BIZ-16 is needs-owner; counsel review recommended |
| `whats-free.md` | The public "What's free" paragraph: business.md §3.4 wording with Platestep filled in, the safety clause and the coach sentence, plus where it goes and the rules it must keep | **BIZ-18** (Settings note and README, which must match byte for byte), **MKT-14** landing page, store listing | Approved in principle (D9(a)); publish at launch, not before |
| `ai-disclosure.md` | The key-prompt text and one "Sends … to Anthropic using your key" line for each AI entry point, including the two calls that fire without a tap on an AI control | **BIZ-06** (its extra criterion: one disclosure line per entry point, each naming Anthropic) | BIZ-06 is ready |
| `claims-review.md` | 566 items for the clinician: 546 itemised health-adjacent strings (clinical program copy, basis strings, about text, tips, nutrient notes, supplement copy, cycle advice and Care cues), the 6 "Watch form video" link sites, the 6 places "proven programs" would ship, and 8 existing disclaimers | **BIZ-15** (the review, and criterion 4 on video links) and the wording choice in **BIZ-07** and **BIZ-17** | BIZ-15 is needs-owner; D9(e) chose a paid clinician |

## Things the owner should know now

- **The JSON backup contains the user's API keys** if they saved any (privacy.md, discrepancy 3). The privacy page discloses it; leaving keys out of the export would be a separate owner decision.
- **Health conditions are labelled "stored only on this device"** but are sent to Anthropic when the person asks for AI supplement recommendations (privacy.md discrepancy 1; ai-disclosure.md §3 has a one-line fix).
- **Two AI calls run without a tap on an AI control** (weekly check-ins, session-complete note). Both are disclosed in privacy.md and in the key-prompt text.
- **Open Food Facts** (`world.openfoodfacts.org`, barcode lookup) is in BIZ-16's Why but not in its criterion 1 host list. It's in privacy.md.
- **"Proven programs" isn't in the app's code**, only in the planned public copy. claims-review.md §10 recommends the research-based fallback until BL-37 ships and the review passes.
