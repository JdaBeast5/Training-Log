# Alignment: business-manager (2026-11-07, against v3.516)

## 1. Sign-off: Agree with conditions
Direction in my words: build the best free lifting app on the phone first (safety, engine, redesign, first week), go public only after that, and charge only for server features (Liftnext Pro) or for coaches' own work (coach plan, coach programs), never for anything we built that runs on the phone. Nothing in the 60-build sequence adds a lock, a quota, a server or a paid feature (checked item by item against roadmap.md, Unified build sequence), so **the sequence protects the free list by what it leaves out.** My conditions are about honesty of public copy and what gets removed after launch, not about D1 itself.

## 2. Blocking concerns (each blocks a named build, not D1)
1. **"Your logs stay on your phone" is false for AI users unless disclosed. Blocks build 37 (BIZ-06) and build 48 (BIZ-17).** `generateCrossMetricInsights` (`index.html:42536`) sends body weight, nutrition, sleep, water, RPE, pain check-ins and PRs to Anthropic with the user's key. BIZ-17 puts the clause on the first screen. **Fix (project-manager, backlog):** BIZ-06 also says, at each AI entry point and before the key prompt, what that feature sends and to whom (one jsdom criterion per entry point). If that's not accepted, BIZ-17's copy ends "...unless you use AI with your own key." business.md §1 now records this.
2. **BIZ-16's test can't see the app's hosts. Fix before the owner approves it.** Criterion 1 parses literal `fetch(` targets. At v3.516 that finds only `api.anthropic.com`: USDA and NIH DSLD go through constants (`USDA_API_BASE` 35042, `DSLD_API_BASE` 35792), and the barcode library loads by `<script src>` from `cdn.jsdelivr.net` and `unpkg.com` (35227). **Fix:** enumerate every `https://` host literal in `index.html`, split into "the app contacts" and "links you open" (youtube.com, google.com, doi.org), and list per host what is sent (the AI row must name the health categories above).
3. **Removals must land before launch, or they become take-aways.** The hard gate before Phase 5 covers Phase 3 only. Phase 4 still holds UX-17 (retire Gym mode), BL-35 (Neck Bridges replaced) and UX-15 (retired confetti). **Fix (project-manager, roadmap.md):** "UX-17 is shipped or dropped before any Phase 5 public step." The free-list wording now also says a feature may be fixed or retired for safety but never moved behind a payment (business.md §3.3, §3.4), so BL-35 and BIZ-15 outcomes can't read as a clawback.

## 3. Non-blocking (fix during the build)
- **The free-list guard isn't scheduled.** BIZ-18 criterion 4 (no lock, upgrade or "Pro" label in free areas) sits in a needs-owner item that isn't in the sequence, and BIZ-19 (ready) was never placed, although roadmap.md "Business priorities" asked for both. Ask: place BIZ-19 in Phase 3, and split criterion 4 into a ready, test-only guard (no copy, no version-visible change) early in Phase 1, so every later build runs it.
- **BIZ-15's scope is too narrow.** It reviews `basis` strings only. Health-adjacent copy also sits in tips ("reduces fall risk", 33229), program notes ("lower blood pressure", 11468), nutrient notes ("reduces neural tube defect risk", 34530), and "Watch form video" opens an unfiltered YouTube search on care and rehab items (44136, 44161). Widen BIZ-15 to all user-facing strings in clinical programs, tips and nutrient notes, and drop or replace the YouTube link on care items before launch.
- **"Proven programs" over-claims for the 3-day variants** until BL-37 (H-3) ships. Use marketing.md §2's fallback ("built on published research, with sources shown") until then.
- **Third-party script with no integrity check.** The barcode library runs from two CDNs without SRI, in a page holding health data. A `security-review` item for the build-automator; check that both CDNs serve the same file before pinning a hash.
- **Play's 12-tester, 14-day closed test** for new personal developer accounts (Google help page, business.md §6) adds two to three weeks to "Play first". Founding members are the testers.
- **The coach layer changes no build.** BIZ-23 and BIZ-24 (added to backlog.md as needs-owner, the one edit I was allowed there) need the Pro server, accounts, contracts and a privacy-law review. Once client data reaches our server, the FTC's amended Health Breach Notification Rule (2024) and Washington's My Health My Data Act come into play (business.md §3.8, law-firm summaries).

## 4. Conflicts with other agents' plans
- **backlog.md BIZ-18 and BIZ-20 (project-manager's file, my items):** both still say "Chalklog". BIZ-18's paragraph is superseded by business.md §3.4: it names Liftnext, adds the safety clause and the coach sentence, and drops "if it runs on your phone, it's free". That older line would have made a paid coach program a broken promise. Please replace the text; I may only edit BIZ-23 and BIZ-24.
- **roadmap.md Phase 5:** "MKT-09: the rename" is listed as a build, but it shipped as v3.515. The Business priorities section should add BIZ-23 and BIZ-24 as the last owner decisions.
- **pitch.md D7 and backlog MKT-09:** both still ask about Chalklog. D7 should become "domain and USPTO check for Liftnext".
- **marketing.md §2 (line 66):** the same privacy condition as blocking concern 1 applies to the full-length promise.
- **MKT-10:** no conflict. Custom-program links stay free. When coach programs exist, they share as a link to the coach's page, not their contents (business.md §3.8).

## 5. Stale items in my own file (fixed in business.md)
- The header now says v3.516 and Liftnext; §5.1's "generic name" is marked resolved (the manifest `description` still claims 22 programs and AI coaching, so BIZ-07 stays).
- §0 and §3.3 now describe the three layers. "Every program … and any added later" became "every built-in program". The one-sentence rule is rewritten, and selling our own programs is rejected.
- §3.4's public wording no longer says Chalklog. The founding price is limited to Liftnext Pro.
- New: §3.8 (coach plan and coach programs, with sources), the Play tester gate in §6, and §7 item 7. §8 lists what couldn't be verified.

## 6. Questions only the owner can answer
1. Adopt the revised public wording in business.md §3.4 (with "we may retire for safety, never put behind a payment" and the coach sentence) as BIZ-18's text? **Recommend yes.**
2. Who reviews clinical copy before launch (BIZ-15): you, or a paid clinician? Any server (Pro or coach) also needs a privacy-law review, which costs money. **Recommend:** a clinician for the clinical programs before listing, and counsel before any server.
3. Play account: personal (12 testers for 14 days) or organisation (exempt; the requirements weren't checked here)? **Recommend personal**, with founding members as testers, unless you already have a business entity.
