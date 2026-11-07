# Marketing manager: pre-D1 alignment (2026-11-07, against live v3.516)

## 1. Sign-off: Agree with conditions
A free, private, ad-free coach-in-your-pocket. Its growth engine is share cards made on the phone (bib, Year in Lifting, "Your number"), sent through the networks people already use, never a feed. The conditions: the name is confirmed and owned before any card prints it (B1), and every printed address is a permanent one (B2). The bib also needs a slot in the roadmap (B3).

## 2. Blocking concerns before D1
**B1. Settle the name before MKT-03 (build 11) puts it on every card.**
- Evidence: I re-ran the iTunes Search API today. "NextLift" by Jordan Moffitt (Health & Fitness, released 2026-09-21) and "NextLift" by AutoFit LLC (2026-01-13) are live, and research.md §11 lists two more. Moffitt's pitch is close to ours.
- A NEXTLIFT filing is reported pending in class 28 (aggregator source only).
- `liftnext.app` is still unregistered (RDAP, today). `liftnext.com` has been held since 2017.
- Our own §2.1 used to reject the "Lift…" field as crowded. A friend who hears "Liftnext" and searches "next lift" lands on a competitor, and that leaks exactly the word-of-mouth the cards exist to create. I agree with market-researcher B1.
- Fix:
  - This week, the owner either confirms Liftnext or re-picks.
  - Confirming means three things: a free USPTO knockout (LIFTNEXT, LIFT NEXT, NEXTLIFT and live LIFT- marks in classes 9, 41 and 42), buying `liftnext.app`, and accepting the reversed-name risk.
  - If any of these is missing at build 11, MKT-03 ships the Sash mark with no wordmark, and the wordmark follows as its own version. The steps are written in marketing.md §2.1 and §4.3.

**B2. The address on cards must be `liftnext.app`, and the app must not change origin by accident.**
- Evidence: BIZ-08 recommends "GitHub Pages now". That URL (`jdabeast5.github.io/Training-Log`) puts the old name and the owner's GitHub handle on images nobody can edit afterwards.
- Separately, setting a GitHub Pages custom domain on the app's repo changes its origin. localStorage and IndexedDB (every log and photo) don't follow an origin change, so installed copies would be stranded.
- Fix:
  - `PUBLIC_APP_URL = 'https://liftnext.app'`, with the registrar's HTTPS 301 forward to the current app.
  - Moving the app's own origin becomes a separate needs-owner item with an export-and-import path. Backups already include photos (`index.html` ~34215).

**B3. The bib the owner chose isn't in the build plan, and one dependency can't be met.**
- Evidence: MKT-16 to MKT-18 appear nowhere in `roadmap.md`'s 60 builds. MKT-17 says MKT-06b adds "the wall of bibs", but 06b is build 22 (mid-December) and MKT-04 is build 34.
- Fix:
  - The project-manager places MKT-16, then MKT-17, then MKT-18 directly after MKT-04 and UX-09a.
  - MKT-03 builds the story frame (safe zones, Sash tile, sponsor strip) so the bib reuses it.
  - The wall of bibs moves to the 2027 recap. 06a and 06b ship without bibs.

## 3. Non-blocking (fix during the build)
- **Live:** cards still print "TRAINING LOG" (`index.html:29608`) and save as `training-log.png` (29623). `test-app-rename.js` checks only the mixed-case "Training Log", so it missed both. MKT-03 should use `APP_NAME` (subject to B1), and the rename test should also catch the upper-case form.
- **"Reads as an instruction":** handled in marketing.md §3.4.
  - The event band is one line: [Sash tile] LIFTNEXT · PROGRAM · WK n (the owner's idea).
  - The sponsor strip carries the address only.
  - The big figure is "No. 47", never a load, so nothing reads "lift next: 160".
  - "Liftnext" is always one word, and in capitals only beside the mark.
  - With "chalk" gone, the loaded bar is the bib's only lifting signal, so it's mandatory on barbell days.
  - MKT-16's spec needs these lines.
- **Year in Lifting, December 2026, carries no address.** BIZ-08 stays behind the Phase 3 gate, and strangers shouldn't land on an unfixed first launch. Treat December 2026 as a dogfood run; December 2027 is the public moment.
- **Exercise-auditor N1:** agreed. "Sets" becomes the default tab and row on MKT-04, MKT-06 and MKT-16. Total load stays off by default: it rewards junk volume, which breaks §3.2 rule 6.
- **Market-researcher:** the bib is a bet with no demand evidence. I added E7 (do strangers read it as lifting?) to marketing.md §5.
- `manifest.json` still says "22 training programs … and AI coaching" under the new name. BIZ-07 owns the fix.

## 4. Conflicts with other agents' plans
- **backlog.md BIZ-08 (business):** the address should be `liftnext.app`, not GitHub Pages (B2). BIZ-12's question still asks about keeping "Training Log".
- **roadmap.md:**
  - Phase 5 still schedules MKT-09 (the rename), which shipped in v3.515.
  - MKT-19 is settled by the Sash icon (v3.516).
  - MKT-16 to MKT-18 are missing (B3).
- **pitch.md D7** still recommends Chalklog. Replace it with "confirm Liftnext against NextLift; buy `liftnext.app`".
- **design-directions.md §6.4 Q3 and §6.6:** "Chalklog survives the bib" is superseded. Point those sections to marketing.md §3.4.
- **backlog.md MKT items:** these are my IDs, but I'm leaving the file to its maintainer under the brief's rules. Please apply these changes:
  - MKT-03: the file name becomes `liftnext-<kind>-<date>.png`, and the ring mark becomes the Sash tile.
  - MKT-09 and MKT-19: settled. MKT-09 keeps the domain and trademark steps; the MKT-19 card mark folds into MKT-03.
  - MKT-16: the event band and sponsor strip follow §3.4; drop "Chalklog".
  - MKT-17: drop the 06b dependency.

## 5. Stale items in my own file (fixed in marketing.md)
- Header: now notes v3.515 and v3.516.
- §0.4: the name is decided; the remaining owning steps and the NextLift risk are listed.
- §1: a note on what changed since the walk.
- §2.1:
  - The table is updated: Chalklog dropped, Liftnext chosen, domains re-checked, NextLift and the LIFT- marks added.
  - The recommendation is replaced with the decision, the domain and trademark steps, and the name rules.
- §2.4: the mark is now Sash; the "chalk" name-fit line is replaced.
- §3.4 (new): the bib under the Liftnext name.
- §4.1: the listing copy uses Liftnext.
- §4.3: the sequencing rule and step 0 (domain).
- §5: E6 reworded; E7 added.
- §6: MKT-09 and MKT-19 settled; MKT-16 to MKT-18 listed.
- §7 and Sources: updated.

## 6. Owner questions (max 3)
1. **Do you keep "Liftnext", knowing about the "NextLift" fitness apps?**
   - Recommended: run the free USPTO knockout this week, then decide before build 11.
   - If anything turns up in classes 9, 41 or 42, re-pick now, while it costs one version.
2. **May we buy `liftnext.app`** (one `.app` registration a year, plus WHOIS privacy) and forward it to the app, so it's the only address ever printed on cards?
   - Recommended: yes, this week.
   - Don't attach it to the app's repo as a Pages custom domain.
3. **Should the December 2026 Year in Lifting cards carry the name and mark but no address**, keeping the Phase 3 gate? Recommended: yes.
