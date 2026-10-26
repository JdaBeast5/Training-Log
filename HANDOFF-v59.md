# HANDOFF v59 — Analysis 2.0 pass, quieter tags, gym-mode dead CSS (v3.312–v3.316)

Branch `claude/taste-skill-v2`, PR #35 (→ `Branch-1`). Baseline at session start: `check.sh` green.
Green after every increment below. Each version is its own commit with its own test.

## What changed
- **v3.312**: Analysis group headers are 2.0 disclosure rows: 15.5px bold, 44px, the same drawn muted chevron as History months and Learn (down = open, right = collapsed). The `›` text stays in the markup (aria-hidden, font-size 0), so the jump rail's label lookup is unchanged. Test: `test-app-2-0.js`.
- **v3.313**: Body & Health's `#analysisTrendRange` row (`.history-export-row`) now goes with its group. `setAnalysisGroupCollapsed` toggles `group-collapsed` on it, and `syncAnalysisGroupHeaders` hides it when every chart in the group has autohidden. Before, it sat alone under a collapsed header. Tests: `test-analysis-collapse.js` (real markup, sabotage-verified).
- **v3.314**: Exercise Progress rows. Figures use the sans face with tabular numbers (was mono). `Best 185 lb` is plain (was a yellow 🏆 badge). "↑ Ready to go up next session" uses `--plate-green`, like the chips' ↑ (was a yellow ⬆). Test: real `renderExerciseProgress` invocation in `test-app-2-0.js`.
- **v3.315**: The `.super-tag` line under an exercise name (body-goal focus, swapped from, Custom) is one muted 12px style; it was yellow, green, blue and purple. Custom drops its ✏️.
- **v3.316**: Removed the gym-mode rules for set-row parts (`.set-row`, `.set-row-content`, `.set-num`, note/next/drop buttons, `.set-status`, `.set-note-input`, drop rows). Since v3.301, gym mode hides `.sets-block > .set-row`. Proof: computed styles of all 3,109 rendered gym-mode elements, with each exercise opened in turn, were identical before and after (scratchpad `gymsnap.js`). The pink-tint rule (row wells must stay opaque over `.swipe-delete-bg`) now sits as a comment beside the hide rule, because the warm-up rows still depend on it. Guards updated with dated notes:
  - `--gym-panel-gradient` count 3 → 1;
  - white rgba 99 → 90, black 65 → 64;
  - the Gym Mode teal-literal floor is gone;
  - the gym audit note-field tests were replaced by a v3.316 guard.

## Flagged, not fixed (no drive-by fixes)
- **Exercise Progress colours a lift's weight gain red.** The "+N lb since first log" line reuses `.w-up` (red) / `.w-down` (green), which mean bodyweight up or down. For a lift, up is good. Needs the owner's OK, then its own increment.
- **Week Over Week (Analysis) is cramped at 390px.** The "vs Prior Wk" column wraps and clips.
- **Tooling note:** `switchView()` does not run view renderers; `showView()` does. Screenshot scripts must use `showView`, or Analysis cards look empty. This is not an app bug.

## Still open
- Today's program write-up length: the owner is choosing between shortening all 55, collapsing the long one by default, or leaving them as they are.
- Safari/iPhone verification is still blocked (WebKit download denied by the network policy).

## Addendum: concise program overviews (v3.317–v3.321)
The owner chose to rewrite all 55 program and style overviews shorter "without losing important content". Five batches, each its own version:
- v3.317: main programs, first 13;
- v3.318: the other 12 main programs;
- v3.319: martial-art, cycling and yoga styles;
- v3.320: watersports;
- v3.321: medical.

Total went from 5,989 to about 3,250 words: average ~109 → ~59, every overview ≤70 words. The overviews still open by default, and the 3–5 sentence floor in `test-program-overview.js` still holds. The new `test-concise-overviews.js` pins two things:
- the 70-word ceiling for all 55 (with a count anchor of 55);
- one or more phrases per entry that must survive the cut. These cover every safety caveat, clearance step and warning sign (medical red flags, hot yoga in pregnancy, head-impact and clinch limits, the kite-instruction limit, and others).

If you edit an overview, keep its MUST_KEEP phrases or update them deliberately.
