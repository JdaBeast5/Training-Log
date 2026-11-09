# The pitch

*From all eight agents, after the summit. 7 November 2026. Every figure cites the planning doc it came from.*

---

## The promise

**Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone.**
<sub>business.md §1. Every clause is true at v3.516, with one caveat: the AI features send data to Anthropic with your own key. BIZ-06 discloses this at each entry point before BIZ-17 prints the promise (alignment round).</sub>

What it should feel like: **a coach handing you a loaded bar**. The next set fills the screen in the colour of the plates you're about to load, one tap from done (design-vision §1).

---

## Why we win: four unfair advantages

### 1. The whole paid stack, free
Every app we compared charges for something we give away. We're the only one with neither ads nor a paywall (research.md §5, last row).

| They charge | For | We |
|---|---|---|
| Hevy Pro $23.99/yr; Strong Pro $29.99/yr | Progression and full stats | Free |
| RP Hypertrophy $34.99/mo | Per-muscle volume | Free (BL-20; BL-31 with your yes) |
| MacroFactor $71.99/yr, no free tier | Adaptive calories | Free (BL-16, BL-17; BL-27 with your yes) |
| MyFitnessPal | Barcode scanning | Free since day one (`lookupBarcode`) |

<sub>Prices are dated third-party snapshots from research.md §1. Re-check them before quoting any publicly.</sub>

### 2. Programs that show their work
- **The library:** 25 authored programs (business.md §5.1), with 84 cited DOIs in `content-citations.js` (toolchain.md §1).
- **An audit we computed ourselves.** We ran our own programs through the real code and published the failures (program-audit.md).
- **Clinical breadth with a guarantee.** No competitor programs rehab, prenatal or hypertension plans (roadmap theme 1). Ours will carry a test-enforced guarantee: **these plans never add sets, and load rises only in the smallest steps when sets felt easy**, checked over every clinical day × goal × week (BL-01, plus BL-02's load gate).

### 3. An engine that knows what you actually lifted
- **Readiness.** Recovery apps miss the obvious: Athlytic's targets "do not take into account muscle fatigue" (research.md §4). Ours reads your real sets, RPE, pain regions **and** HRV against your own baseline (BL-21).
- **Progression with the reason shown.** It's free and every number is explained: "all sets hit 10: add weight".

### 4. Private by architecture, not by policy
- **Nothing to breach:** no server, no account, no analytics.
- **First launch** made no external requests and threw no console errors, and the page loaded in 347 ms on localhost (business.md §5.2).
- **Sharing goes outward:** through your phone's share sheet, never to us.

---

## The experience

Five signature moments, rendered at iPhone size in dark and light (`tools/design/renders/`).

### The next set: `today-dark.png`, `today-light.png`
![Today](../tools/design/renders/today-dark.png)
- **"160 lb × 5" in huge type,** in the day's plate colour, readable from a bench a metre away.
- **The plate stack:** 45 · 10 · 2.5 each side, drawn as real plates (UX-07). The plate calculator Strong users love has quietly gone from our app (summit F1). This brings it back with **zero taps**.
- **One Log button,** placed above the middle of the screen. One tap, asserted in a test (UX-06).

### Logging, then resting: `log-set-dark.png`
![Rest](../tools/design/renders/log-set-dark.png)
- **The rest takes over the screen.** The red drains as 2:24 of 4:00 counts down (UX-08).
- **The next set waits below** with big steppers and "Reps left 3+ / 2 / 1 / 0", stored as the same RPE data as today.

### Finishing, and a PR: `pr-dark.png`
![Finish](../tools/design/renders/pr-dark.png)
- **One screen closes the session:** sets, time and volume, then **"Next time"**, with each change and its reason (UX-09).
- **The auditor caught two errors in this picture,** and they're fixed before it's built:
  - the Bench line should **hold** at 160, because 5 isn't the top of 4–6;
  - "160 × 5" is a *weight* record, not a strength best: its estimated max is 186.7 against the old set's 196.3 (summit F6, F7).

  That's the standard: the screen never celebrates a number our own chart would contradict.

### Am I getting stronger? `progress-dark.png`
![Progress](../tools/design/renders/progress-dark.png)
- **The answer first:** your estimated max and its line (UX-10).
- **Then sets per muscle this week,** counted the way the latest meta-regression fits best (BL-20, [PEL]).

### The week, in plate colours: `recap-dark.png`
![Recap](../tools/design/renders/recap-dark.png)
- **A Monday sheet:** seven blocks in each day's ink, sessions done against planned, new bests, and what next week asks (UX-11).
- **The share card uses the same layout,** so what you share is what you saw.

---

## The science edge (from the audit)

**Found and fixed before anyone else saw it:**
- **SAF-1:** with goal "gain" in week 3, ACL rehab day 4 went from 3 sets to **5**, and hypertension volume **doubled**. BL-01 gates it.
- **SAF-2:** RPE mode could prescribe **RPE 9** to hypertension clients and on snatches. BL-02 caps it at 7 and turns RPE off for technique lifts.
- **M-1:** heavy-bag rounds got **240 s** of rest and 40-yard sprints **60 s**. BL-14 makes them 60 s and 120 s [SING24].
- **H-3:** the Bodybuilding 3-day variant gives chest **3 sets a week** and glutes **0**. The rebuild targets 9+ [ACSM26][PEL] (BL-37, with your yes).

**Raised past the paid apps:**
- **All-set double progression:** add weight only when *every* set hits the top of the range (BL-08). Hevy charges for this.
- **A target effort on every set:** reps in reserve by lift type (BL-10) [ROB24][REF23].
- **A streak that counts training weeks:** rest days never break it (MKT-01). Today's daily streak fires at 7 days in a row, one day after readiness warns "6 days without a rest" (marketing.md §0).

**The single biggest lever** (audit §5): a per-muscle weekly ledger driving a ±1-set rule learned from *your* performance. That's RP's engine without the $35 a month, with every number explained.

---

## Growth without ads or tracking

| Mechanism | Evidence | Privacy cost |
|---|---|---|
| **Year in Lifting** (MKT-06), every December | Spotify reports 500M Wrapped shares in about 24 h (company-reported, marketing.md §3.1) | Computed on the phone; no body data |
| **Story-format cards** for PRs, weeks and blocks (MKT-03, MKT-05, MKT-07) | People share achievements, not logs (marketing.md §3.1) | Body data off by default (MKT-02) |
| **The weekly streak** (MKT-01) | Duolingo: 7-day streakers are 2.4× likelier to return (company-reported, correlational) | None beyond how often you train |
| **Friend challenges by link** (MKT-11) | Social comparison raised class attendance about 90% in a 790-person RCT (Zhang 2016) | The link carries only the rule, in the URL fragment, which never reaches a server |
| **Easy to leave, easy to join:** CSV export (BL-22), import from Strong or Hevy (BL-29) | Switchers care about CSV fidelity (research.md §4, second-hand) | None |

**The only referral loop is the address printed on the card** (BIZ-08). There's no attribution tag (MKT-15) and no analytics. We measure through the store consoles plus an on-device first-month row (BIZ-09).

---

## The business

- **Free at launch, a subscription later (your call, 2026-11-07).** The rule: **if it runs on your phone, it's free forever, with no ads and no quotas.** That covers logging, programs, progression, history and charts, food, backup to your own cloud, and AI with your own key (BIZ-11, BIZ-13).
- **The subscription only ever holds new things that run on our servers:** hosted AI (no key needed) and cloud sync. Nothing free is ever taken back; that's how MyFitnessPal (2022) and Strava (2020) got burned (business.md §3.2).
- **Founding members:** everyone who trains with us before the subscription is announced gets a founding price, locked while they stay subscribed (BIZ-20).
- **Switch-on is by metrics, not a date:** retention, scale, demand, a good paid feature, and a working payment path (BIZ-21). Play billing comes first, through the Capacitor build (BIZ-22).
- **Pricing:** priced against Hevy ($23.99/yr) and Strong ($29.99/yr) for sync, and kept under MacroFactor ($71.99/yr) for the full plan (business.md §3.7; third-party prices).
- **North star: weekly active trainers,** people logging ≥2 sessions a week (business.md §4). The category's day-30 retention is 3–8% (business.md §4). An app you use on a schedule should beat that by a wide margin.
- **Distribution:** web now, Google Play first through the Capacitor build, then the App Store. Store fees are about $25 one-time for Play and $99/yr for Apple; check before paying (business.md §6).

---

## The plan

After the alignment round, that becomes **69 ready builds in one order**, plus approved owner items in marked slots. Each is its own tested version and PR (roadmap.md, Unified build sequence; the changes are in `alignment/consensus.md` (d)).

| Phase | What ships | Builds |
|---|---|---|
| **0. Safety** | Clinical gates (sets **and** load), RPE caps, injury-region flags, safety cues including Depth Jump and Neck Bridges, cycle-card honesty; then the neck-bridge and drop-landing swaps if you approve D4 | 7 (+2) |
| **1. Engine truth, YIL, food** | All-set progression, RIR targets, smarter increments and deloads, correct rest; design tokens and the day-ink rule (no visual change); the YIL lane (MKT-02 → MKT-03 → MKT-06a, **target 30 Nov**); then the food lane: recent foods, add-from-yesterday, trend weight, expenditure | 26 (+3) |
| **2. Redesign core** | Flat world, tab bar, day inks, Food and History, then the cover, plate stack, rest on the cover, the finish sheet, **the bib, "Your number", "Pin it on"**, the ledger, Progress, the Duo layout, the weekly recap | 21 (+3) |
| **3. First week and launch gates** | Quick start, honest first screen, backup nudge, install hint, CSV export, AI prompts that know clinical plans, barcode integrity; plus the program dose fixes (BL-37/38) you approve | 11 (+4) |
| **4. Bar-raisers** | HRV readiness, PR gain cards, block card, cleanup; then your approved engine and program upgrades, and the program extensions (BL-41+) | 4 (+ approved) |
| **5. Public launch** | Clinical acknowledgement and claims review, privacy page, landing page, "What's free", the address on cards; then program links and challenges | about 9 after your yes |

At one merge a day (your pace, an assumption) that's about ten weeks of ready work. It moves only as fast as you review, and **nothing goes live without your yes.**

### The first two weeks
1. **You, before D1:** branch protection on `Branch-1` plus the merge/push deny rules (O1), a dedicated builder checkout (O2), the builder agent file aligned with `automation.md` (O3), and answers to D11 and D12. Then D1.
2. **Build-automator:** `automation.md` fixes: stage each item's `Files:`, skip items with a merged PR, the step-1 guard, and the impeccable fallback (consensus F12–F14).
3. **Design-engineer:** the visual harness (TOOL-01) before slot 11, then re-render the mock-ups before Phase 2.
4. **Slots 1–7, Phase 0:** BL-01, BL-02 (with the clinical load gate), BL-03, BL-04, BL-05 with BL-06, BL-05b (the Neck Bridges cue), BL-13. Then BL-35 and BL-36 if you approve D4.
5. **Slots 10–19:** BL-08, UX-01, UX-01b (the day-ink rule), BL-07, MKT-02, (the rename if you choose a new name; Archivo if D2), MKT-03 (mark only), MKT-06a. At one merge a day, 06a lands around 22–27 November.
6. **Auditor:** verify the three citations still marked unverified (the Pelland date, Plews 2013, the Hacker's Diet) before they reach the app (needs D10, before slot 34).
7. **You:** settle the name (D7) before MKT-03b prints it, and send one Strong or Hevy export file (D6).

---

## Decisions only you can make

### Owner's answers, 2026-11-07
- **Owner (2026-11-09):** BL-24 option (a), 5 lb floors for squat and deadlift; MKT-03 keeps the PLATESTEP name beside the mark (MKT-03b folded in).
- **BL-74 (owner, 2026-11-08):** (a), switch history keys to the authored position as soon as BL-72 lands.
- **Sixth round (owner, 2026-11-08, on PR #86, "1 yes, 2b, 3b"):**
  - **1 yes:** protect the history of custom, body-goal and bonus exercises before any exercise is added to a day. New item **BL-72** (stable keys plus a migration; slot 8a, before BL-36), and **BL-73** (a stored substitute only applies if it's listed for that exercise; slot 8b). BL-36 to BL-40 now wait for BL-72. Found while specifying it: **BL-74**, built-in rows shift too when exercises are removed or reordered (needs-owner; the auditor recommends option (a), switch now).
  - **2b:** BL-39 and BL-40 each add a relocation migration step (BL-37's helper), so name-stamped sets move with their exercise. This needs BL-51's name stamps.
  - **3b:** the hypertension wall squat runs three times a week, on Days 2, 5 and 6 (Edwards et al. 2023), and the basis text says so.
- **Support email (owner, 2026-11-08):** `support@platestep.com` is the customer-facing address. Use it for the privacy page, store listings, landing page and launch posts. Don't put it in the app's code until a build item says so.
- **Fifth round (owner, 2026-11-08, on the exercise auditor's recommendation for the PR #77 questions):** "Q1 yes / Q2 c / Q3 yes / heel drop yes". New item **BL-70**, slot 3a: widen Sled Push and Wall Balls; add Sled Pull, the three carries, Hanging Leg Raise and Toes-to-Bar; relief-aware caution wording; Eccentric Heel Drop becomes Ankle/Foot relief. BL-04 gains substitutes for the carries and hanging raises.
- **Fourth round (owner, 2026-11-08, in the builder session):** "61 a, 51 a, rpe c, 56 a, 59 a, 52 a, 46 b, 47 b, play a, but there will be an LLC before full launch, name a, plus-items yes, 25 forward":
  - **BL-61, BL-51, BL-56, BL-59, BL-52:** yes, as written (the exercise auditor's fold-ins).
  - **RPE mode on clinical plans (PR #72 flag):** option (c), at most one smallest step per session. New item **BL-69**, slot 2b.
  - **BL-46, BL-47:** no (parked); the RPE text stays.
  - **D9(f):** a **personal** Play account now, with founding members as the 12 testers. **An LLC will exist before full launch.** Google Play can transfer an app between developer accounts, so the listing can move to the LLC's account then.
  - **Name:** Platestep is confirmed (the USPTO knockout is clear), so MKT-03b is ready.
  - **D9's other items:** yes as recommended. BIZ-13: own cloud via the share sheet, free forever. BIZ-14: not yet. MKT-15: no. MKT-10 and MKT-11: yes, after BIZ-08. BIZ-23 and BIZ-24: plan of record, no work before BIZ-21's T4.
  - **BIZ-25:** forward only; the app's origin doesn't move.
- **Third round (owner, 2026-11-08, "1-6 yes, clinician"):** approved as recommended:
  - **D3:** BL-31 and BL-33 yes; BL-34 for RPE-mode targets only; BL-32 as a one-tap "make today easier"; BL-30 no.
  - **D5:** yes; BL-27 after 3 weeks of BL-17 data.
  - **D6:** yes. The owner may send a Strong or Hevy export.
  - **D8:** yes, in order, after Phase 3 and its gates.
  - **D9 follow-ups (a)–(d):** yes.
  - **D9(e):** a **clinician** reviews the clinical copy.
  - **D10:** yes.
  - Still open: **D9(f)**, a personal or organisation Play account (the owner is weighing an LLC). PR #32 (old Duo branch) is closed as superseded.
- **Second round (owner, 2026-11-07, "1-13 yes, Platestep"):** the name is **Platestep** (naming.md; built as v3.517, awaiting the owner's go-live). Decisions 1–13 of the consensus list are approved:
  - O1 branch protection;
  - O2 a dedicated builder checkout and the 3-a-day schedule;
  - O3 the agent file follows automation.md (applied);
  - O4 no impeccable engine in unattended runs;
  - D1 merge planning and `.claude/agents/`;
  - D11 BL-01 allowlist;
  - D12 the clinical smallest-step load rule;
  - D4 BL-35/36 after Phase 0, BL-37/38 before going public, old neck-bridge sets archived;
  - D13 plate-colour days;
  - D2 Archivo before cards, plus the coach button, plus Gym mode retired once tap counts match;
  - D14 contact sheets with UX PRs;
  - D15 sets as the card's lead number;
  - D16 Year in Lifting 2026 with no address.

  Still open: D3, D5, D6, D8, D9 follow-ups, D10. Owner to do: buy platestep.app and platestep.com, run a USPTO search, and turn on branch protection.
- **Name:** Liftnext. Chalklog was chosen first, then dropped the same day because several "Chalk" fitness apps exist. The rename shipped as v3.515, display name only. **Since reopened (alignment round):** four "NextLift" fitness apps were found, three launched in 2026 and one with nearly our pitch. A naming specialist is writing `naming.md`, and the public name is open until you decide (D7 below). Until then, cards carry the Sash mark and no wordmark. Marketing's note still applies to whichever name you choose: on a bib card the name must read as the brand (an event band), never as an instruction.
- **Design:** Plate & Press for the app, plus the hybrid edge additions: the race bib as the story card, "Your number", "Pin it on", and the bib with the loaded bar as the constant (design-directions.md §5–§6, MKT-16 to MKT-18).
- **Icon:** option B, "Sash" (tools/design/icon/), shipped as v3.516: the home-screen icon, the header mark and the launch. It doesn't depend on the name (MKT-19 done).
- **Money (D9, revised):** free at launch, with a subscription later. The business manager has reworked the model (business.md §3). Our view: it's sound if the line is drawn now. D9 below asks the follow-ups.
- **Still open:** D1–D8, D10 and the new D11–D16 (the alignment round). D9 has follow-ups. The full ordered list is in `alignment/consensus.md` (e).


**Owner actions before D1** (`alignment/consensus.md` (b)):

| # | Action | Recommended |
|---|---|---|
| **O1** | Turn on branch protection for `Branch-1` (PR required, no force push, no auto-merge), and add deny rules for `mcp__github__merge_pull_request`, `gh pr merge` and `git push … Branch-1` | **Yes** |
| **O2** | Run the builder in its own checkout or worktree; after D1, planning changes go as `claude/planning-*` PRs | **Yes** |
| **O3** | Make `.claude/agents/build-automator.md` follow `automation.md` (sequence order, `claude/auto-<id>`), or add "automation.md wins" to the run prompt | **Edit the agent file** |
| **O4** | Impeccable's downloaded engine in unattended runs? | **No**: Markdown fallback only |
| **O6** | Add the v3.515/v3.516 addendum to `HANDOFF-v59.md` | **Yes** |

**Decisions**, ordered by what they unblock first:

| # | Question | Recommended | Unblocks |
|---|---|---|---|
| **D1** | Merge `planning/` **and `.claude/agents/`** into `Branch-1` and start the build loop (7:17, 13:17 and 20:17 ET), reviewing about one PR a day? The merge also publishes `tools/design/`, `PRODUCT.md` and `.claude/` on the Pages site. | **Yes**, after O1–O3 and a check that `.claude/` holds nothing private (the repo is already public) | Every build |
| **D11** *(new)* | BL-01: keep goal-based extra sets and block accumulation only on Strength & Size, Bodybuilding, Powerbuilding and Powerlifting (custom programs unchanged)? The other 21 programs, including Olympic, Climbing and Calisthenics, keep their written set counts. | **Yes** (the audit's list) | Slot 1 |
| **D12** *(new)* | On clinical, senior and prenatal plans, let load rise only in the smallest step after two sessions at RPE ≤7, rather than no load suggestions at all? | **Yes** | Slot 2 |
| **D4** | Approve the audit's program fixes: BL-35 and BL-36 **now, so they ship right after Phase 0**; BL-37 and BL-38 (slot rewrites with migrations) before going public; BL-39 and BL-40 appends? | **Yes**, one migration per version; old neck-bridge sets archived | Slots 8–9; the Phase 3 gate |
| **D13** *(new)* | Day colours: each day takes its program's plate ink (red, blue, yellow, green; white for cardio; grey for rest; inks repeat in programs of 5+ days), rather than 7 distinct hues? | **Yes, the plate code** | UX-01b (slot 12) and every card |
| **D7** *(replaced; was Chalklog)* | The public name: adopt `naming.md`'s pick, or keep Liftnext after a free USPTO knockout (classes 9, 41, 42) and buying its `.app` domain? The domain forwards to the app and is never set as a Pages custom domain. | **Decide before MKT-03b**; until then cards carry the mark only. A new name ships as a rename at slot 15. | Wordmark, Year in Lifting name, store listing |
| **D2** | Ship Archivo (UX-02) **before the share cards**; move the chat button into the header (UX-16); retire Gym mode once Today matches its tap counts and you've used it for two weeks (UX-17, before going public); update PRODUCT.md to the chosen name? | **Yes to all** | The redesign at full fidelity |
| **D14** *(new)* | Visual review: commit one contact-sheet image (about 0.3 MB) with each UX PR? | **Yes** | Reviewing the redesign by sight |
| **D10** | Keep the `Skill` tool already given to three agents (a retroactive yes); approve paper-lookup now and Playwright WebKit and axe-core before Phase 2; give market-researcher and exercise-auditor `Edit`. The `ship-increment` skill is withdrawn. | **Yes** | Verified citations (before slot 34); Safari-engine and accessibility checks (before slot 39) |
| **D3** | Let the engine adapt: ±1 set per muscle per week (BL-31); deloads count only weeks you trained (BL-33); RPE-adjusted e1RM (BL-34); readiness (BL-32); the ledger on Today (BL-30)? | **Yes** to BL-31 and BL-33 (now **right after the ledger**, slots 57–58); BL-34 **only for RPE-mode targets**; BL-32 as a **one-tap "make today easier"**; BL-30 **no** | The RP- and Juggernaut-beating engine |
| **D15** *(new)* | Share cards lead with sets, lifts and minutes; total load off by default? | **Yes** (tonnage rewards junk volume) | MKT-04, MKT-06, MKT-16 |
| **D16** *(new)* | Year in Lifting 2026: the mark (and the name only if confirmed), no web address? | **Yes** (December 2026 is a dogfood run) | MKT-06a |
| **D5** | Weekly calorie check-in, applied only on Accept (BL-27); saved meals (BL-28)? | **Yes**; BL-27 after BL-17 has 3 weeks of data (BL-17 now ships about a month sooner) | Our free answer to MacroFactor |
| **D6** | Strong/Hevy import into a separate "Imported" archive feeding PRs and e1RM (BL-29); one dated, sourced comparison page (MKT-12)? | **Yes**, and send one real export file | The switchers' door |
| **D8** | Go public after Phase 3 **and its gates** (BL-37/38, AI prompts that know clinical plans, the AI disclosure, UX-17 shipped or dropped): web first, then Play, then the App Store (BIZ-12), with a privacy page (BIZ-16), landing page (MKT-14), clinical acknowledgement and claims review (BIZ-15), the address on cards (BIZ-08) and launch posts (MKT-13)? | **Yes, in that order** | Phase 5 |
| **D9** (revised) | You chose **free at launch, a subscription later**. Follow-ups: (a) publish `business.md` §3.4's "What's free" wording (with "we may fix or retire a feature for safety, never put it behind a payment" and the coach sentence) at launch (BIZ-18); (b) a founding price for early users, on the server-run subscription only (BIZ-20); (c) switch on by six metrics, not a date (BIZ-21); (d) Play billing first (BIZ-22); (e) who reviews clinical copy (BIZ-15); (f) a personal or organisation Play account; plus hosted AI (BIZ-14), own-cloud backup (BIZ-13), ref tags (MKT-15), program links and challenges (MKT-10, MKT-11), and the coach plan and coach programs (BIZ-23, BIZ-24). | (a) **Yes**. (b) **Yes**: half the list price, locked while subscribed, no lifetime plan on hosted AI. (c) **Yes**: day-30 retention ≥16% for 3 cohorts, plus T2–T6; no billing code before then. (d) **Yes**; web payments only if iPhone PWA demand is large. (e) **A paid clinician before listing, and counsel before any server.** (f) **Personal**, with founding members as the 12 testers. BIZ-14 **not yet**; BIZ-13 **own cloud via the share sheet, free forever**; MKT-15 **no**; MKT-10 and MKT-11 **yes, after BIZ-08**; BIZ-23 and BIZ-24 **plan of record, no work before BIZ-21's T4** | A model that can earn later without breaking trust |

---

## What we're deliberately NOT doing
- **No social feed.** It's a complaint at Hevy (research.md §4).
- **No ads,** ever. **No paywall** on anything that costs nothing to run.
- **No generated Fitbod-style workouts.** Proven programs only.
- **No exercise demos, 3D or AI video.** You parked them (HANDOFF-v59, Addendum 41).
- **No analytics, attribution or tracking.** No server, no accounts, and no hosted AI yet.
- **No made-up "readiness score".** Confetti, badges, XP and streak guilt are retired too.
- **No body weight, intake or health data on a share card** unless you turn it on. **No share buttons on clinical programs.**
- **No health claims in public copy** ("safe", "rehab", "prevents"), and no competitor names in store keywords.
- **No watch or lock-screen logging in the PWA.** That's the Capacitor track's job, and we don't touch `android/`.
- **No new verticals** until weekly active trainers can be measured.
