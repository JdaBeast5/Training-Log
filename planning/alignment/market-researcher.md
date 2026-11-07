# Alignment: market-researcher (2026-11-07, checked at v3.516)

## 1. Sign-off: **Agree with conditions**
The direction, in my words: a free, ad-free tracker that tells you what to lift next and logs it in one tap, with food and recovery joined to training. A subscription comes later, and only for things that run on a server. This answers the market. The top complaints are basics behind paywalls (MyFitnessPal barcode, Hevy limits, MacroFactor has no free tier), ads during logging (Cronometer, Lose It!) and progression that drifts (Fitbod), and the money line in business.md §3.3 addresses all three. The conditions are that the name gets re-checked, and that the build order gets the most-wanted features to users sooner (B1, B2 below).

## 2. Blocking concerns before D1
**B1. "Liftnext" collides with "NextLift", which is worse than the Chalk problem that killed Chalklog.** Evidence is in research.md §11, from the iTunes Search API on 2026-11-07:
- No app uses the exact name "Liftnext".
- Four App Store fitness apps use "NextLift" or "Next Lifting", and three of them launched in 2026.
- One of them, Jordan Moffitt's **NextLift** (released 2026-09-21, updated 2026-10-29), describes itself in almost our words: "connects your training, meals, recovery and progress", "leave with a clear next step", barcode, saved meals, Apple Health readiness.
- Another, **NextLift: Barbell Tracker**, sells our privacy line: "no accounts, no subscriptions".
- There is a pending NEXTLIFT trademark in class 28 (aggregator source, unverified). Classes 9 and 41 show nothing, but that's a web search, not a clearance.
- The name currently ships display-only. The loop would print it on every share card: MKT-03 at build 11 carries "the mark", and MKT-16's sponsor strip carries the name.

**Fix:**
- The owner decides one of two things before build 11. Either keep Liftnext knowing about NextLift, after a real USPTO search in classes 9 and 41, or pick another name now.
- Until then, share cards carry the mark only, with no wordmark.

**B2. The five most-wanted capabilities all arrive after build 48, about two months in at one merge a day.** Recents (BL-18) is #51, Repeat-yesterday single items (BL-19) #52, trend weight (BL-16) #53, expenditure (BL-17) #54, HRV baseline (BL-21) #55. The feedback-volume rule (BL-31), the item that beats RP and Juggernaut, comes after #60, although D3 recommends yes. Food logging happens several times a day, so it's the most frequent touch in the app, and MacroFactor competes on taps (research.md §8.4). There's also a timing cost: D5 makes BL-27 wait for three weeks of BL-17 data, so every week BL-17 slips pushes the MacroFactor answer back by a week.

**Fix:** a small reorder, with no new items.
- Move the food lane from summit.md:224 (BIZ-03 → BL-18 → BL-19 → BL-16 → BL-17) to the start of Phase 2, at builds 25–29.
- UX-13 still restyles it later, so the redesign has nothing to wait for. BL-16 is already specified "to §3.6's line rules from the start" (summit.md:138).
- If the owner says yes to D3, put BL-33 and BL-31 directly after BL-20 (#38) instead of after #60.
- Phase 0's safety work and Phase 1's engine work keep their places: they are what fixes "progression that drifts".

## 3. Non-blocking concerns (fix during the build)
- **The redesign can't cost taps.** MyFitnessPal's April 2026 redesign "buried logging" (research.md §4), and summit.md:155 says nobody has measured our tap counts. Before UX-06a merges, add a test that counts taps for "log the ready set" and "log a recent food". The rule: no UX build merges if either count goes up. UX-17 (retiring Gym mode) should wait until that parity is proven.
- **There's no market evidence that lifters want a race-bib card.** I found none. Hevy's complaint is about its feed, not about cards. A bib reads as running (backlog MKT-16 says so itself). That's acceptable as a bet, but it should be labelled as one. Run E6-style tests (marketing.md) on whether a stranger reads the bib as lifting.
- **"Free, no account" is not unique any more.** NextLift: Barbell Tracker says the same thing. Our edge has to be programs plus a progression engine plus food, all free, and not "free" alone. The copy should lead with "tells you what to lift next".
- **AI with your own key is a dead end for strangers** (business.md §5.4). Photo meal logging is a selling point across the category, so keep BIZ-06 at #37 as planned.

## 4. Conflicts with other agents' plans
- **roadmap.md (the 60-build sequence) vs pitch.md (the owner's design choice):** MKT-16, MKT-17 and MKT-18, the bib "edge" the owner chose, aren't in the 60 builds at all. The rename (MKT-09) is still scheduled in Phase 5, although it shipped as v3.515. MKT-19 isn't scheduled anywhere, and its plate-stripe mark effectively shipped as the "Sash" icon in v3.516. I'd like the project-manager to place MKT-16 to MKT-18 after MKT-04 and UX-09a, and to mark both MKT-09 and MKT-19 as shipped.
- **backlog.md MKT-16 and MKT-09, marketing.md §2.1 and §4, design-directions.md §5–§6, summit.md R4, and pitch.md row D7** still say "Chalklog". D7 still recommends Chalklog even though the owner's answers above it say Liftnext. Each owner needs to fix these, and the B1 outcome changes all of them.
- **roadmap.md "Corrections to the research's missing verdicts":** I agree with all of them, and they're now fixed in research.md.

## 5. Stale items in my own file (fixed in research.md)
- Re-checked at v3.516, with a note that the app now displays as Liftnext and how far line numbers have drifted.
- Plate calculator: it was marked "Has it" in §5 and §7, but the calculator is gone. Now **Missing**, restored by UX-07.
- Recents and copy: was "missing". Now **Weaker**, because a whole-day "Repeat yesterday" exists (6313, 37668). Fixed in the summary (#4), §5, §7 and §9 #4. The "yesterday's breakfast" wording was dropped because the app has no meal slots.
- Volume: was "no set targets". Coarse ranges per category group exist (`VOLUME_LANDMARKS`). Fixed in summary #2, §5 and §7.
- Added §11, the dated "Liftnext" name check.
- Left alone: the ratings snapshots, which are still dated as before. I found one dated Hevy change, a notes rebuild in 3.2.2 on 2026-10-22 via APKMirror, which changes no verdict.

## 6. Questions only the owner can answer
1. Knowing about the NextLift app launched 2026-09-21 (same category, same all-in-one pitch), do you keep "Liftnext", or choose again before share cards print a name?
2. May the food lane (recents, single items from yesterday, trend weight, expenditure) move up to the start of Phase 2, so the daily wins and BL-27's three-week data clock start about a month sooner?
3. Do you say yes to D3 (BL-31 and BL-33) now, so the feedback-volume rule can follow the ledger at #38 instead of waiting until after #60?
