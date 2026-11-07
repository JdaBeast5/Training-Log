# Alignment: exercise-auditor (2026-11-07, checked against live v3.516)

## 1. Sign-off: Agree with conditions
Direction in my words: make the program engine safe, then truthful, before it gets beautiful or shareable, and never let a growth surface reward more volume, more load or more days than the evidence supports.

Phase 0 is the right first thing, and BL-08 at build 7 is right. But the sequence makes the programs *correct* (Phases 0 and 1). It does not make them *the best*. Every dose fix and every RP- or Juggernaut-beating mechanic sits at the tail of Phase 4 or is unscheduled.

## 2. Blocking concerns before D1
**B1. Two high-severity safety items wait about 55 builds.** SAF-4 (BL-35, Neck Bridges) and SAF-5 part 2 (BL-36) are slotted at the end of Phase 4's owner list (`roadmap.md`, Phase 4, "Owner-approved here"). That puts them behind fonts, the tab bar and share cards. The scope is also under-counted:
- Neck Bridges appear 6 times: grappling d6 (`index.html:11048`) plus five grappling day-count variants (21274, 21312, 21355, 21405, 21456). BL-35 names only 2 sites.
- Depth Jump appears about 20 times, including the athletic, skimboarding, wakeboarding and kite variants (17687–17785, 23937–24568).

**Fix:**
- (a) Add a ready, cue-only Phase 0 item now: the Neck Bridges cue reads "Only with a coach; otherwise do 4-way neck isometrics, 15 s each way at 50% effort". It touches no slot and no history.
- (b) Once D4 is approved, BL-35 and BL-36 go straight after Phase 0, not into Phase 4.
- (c) BL-35 and BL-05 must cover every variant occurrence. Count real entries in the test, not 2.

**B2. "This plan never auto-increases" is not true after BL-01.** BL-01 gates *sets*. Load is never gated: `analyzeProgressionSignal` (27483) has no program check. It suggests "+increment" whenever the top rep is hit twice at logged RPE ≤8.5, or with no RPE logged at all. It applies to the 13 medical slots that aren't marked `noWeight`. For example, Seated Cable Row appears in the obesity, hypertension, diabetes, osteoporosis, prenatal, postpartum and shoulder-rehab styles. That's moderate risk, not critical: progressive load is still appropriate in clinical plans [AHA23]. But the RPE ≤8.5 threshold contradicts BL-02's clinical cap of 6–7.

**Fix:** extend BL-02's acceptance criteria. For `MEDICAL_STYLES`, senior and prenatal:
- the increase signal requires logged RPE ≤7 on both sessions;
- the increment is the smallest loadable jump;
- the copy adds "if it felt comfortable".

Reword the promise (`roadmap.md` theme 1) to "never adds sets; load rises only in the smallest steps when sets felt easy". BL-08 and BL-24 must inherit this, and their tests should assert it.

**B3. Program dose fixes must have a hard gate before any public step.** Bodybuilding 3-day gives chest 3 sets a week and hamstrings 2, with every muscle trained once a week (audit H-3, scored F). Summit R9's guard covers only quick-start "gain" with 3 days or fewer. A stranger who picks the program by hand, or answers "lose" with 3 days, still lands there.

**Fix:** add BL-37 and BL-38 (or, failing that, hiding the 2- to 4-day bodybuilding variants) to the Phase 3 hard gate before Phase 5.

## 3. Non-blocking concerns
- **N1. Tonnage as the public number rewards junk volume.**
  - MKT-04's "total load" row, MKT-16's tear-off tab ("total load lifted or 58 min") and MKT-06's "total load lifted" all reward extra easy sets and reps.
  - Tonnage tracks neither strength nor hypertrophy well. Effective sets near failure do [ROB24][PEL].
  - Prefer, in this order: sets, lead-lift top set, minutes. Keep tonnage for the annual recap only, if at all.
- **N2. MKT-17 "Your number" is acceptable.**
  - It counts days, not volume, and it never punishes gaps.
  - Conditions:
    - no "N days to your next number" countdown;
    - no milestone prompt while readiness is showing "6 days without a rest day";
    - the What's New line says "it counts days on the log, not how hard you went".
  - Frequency beyond 2–3 sessions a week adds nothing when volume is equated [FREQ19].
- **N3. The BL-20 ledger has only a floor (summit R8).** I agree with no ceiling [PEL]. But the ink fill must stop growing at the floor. Above about 20 fractional sets, show a neutral line: "more isn't needed; returns get smaller [PEL]". Otherwise the visual reads "more is better".
- **N4. The AI prompts don't know the clinical style.**
  - Cross-Metric Insights must answer PUSH, MAINTAIN or DELOAD (`index.html:42583`). On a medical program it can say PUSH to a prenatal or ACL user.
  - Both that prompt and the coach chat (42670) receive only "Active program: Medically Modified", never the style.
  - **New item (prompt text only, leave the payload and effort fix untouched):** pass the style's label, and for `MEDICAL_STYLES` limit the verdict to MAINTAIN or DELOAD plus "check with your care team". It must land before Phase 5 and before BIZ-14.
- **N5. BL-36 appends the drop landing *after* the depth jumps.** That's the wrong order for a prerequisite. Put the rule in BL-05's Depth Jump cue instead: "first 4 weeks: do Drop Landing 3×5 instead".
- **N6. BL-01's criterion 1 lists programs but not `PROGRAM_DAY_COUNT_VARIANTS` days.** Senior, athletic, combat and watersports have variants (16196+). Iterate the variants too.
- **N7. Deferred work keeps four program classes at F for progression.** "Program extensions after Phase 2" covers:
  - powerlifting top single at RPE 8 plus a peak;
  - Olympic % bands and a miss counter;
  - running, cycling and swimming volume progression (scored F, with no item at all);
  - bodyweight ladders.

  I'll itemise them (BL-41 onward) before Phase 2 ends, so they don't drift.

## 4. Conflicts with other agents' plans
- **roadmap.md theme 1 and pitch.md:** the "never auto-increases" claim. See B2.
- **backlog.md MKT-16 and MKT-04:** the tonnage tab and row. See N1. I'd like the marketing-manager to make "sets" the default tab.
- **business.md §2:** "coaches you like the paid ones" is fair only once BL-08, BL-10, BL-15 and BL-24 have shipped. BIZ-07 and the store copy must not claim adaptive volume (BL-31) or readiness-driven sessions (BL-32) before they exist.
- **pitch.md D3:** the recommendations match my audit (BL-34 for RPE-mode targets only; BL-32 one-tap, not automatic). No conflict.

## 5. Stale items in my own file (fixed in `program-audit.md`, new "Alignment addendum")
- The audit was written against v3.514; the app is now v3.516 (rename and icon only, with no program-logic change). Line references hold within a few lines.
- §6 "Build order" is superseded by the unified sequence in `roadmap.md`.
- SAF-4 and SAF-5 under-counted the variant occurrences (see B1).
- SAF-1's promise didn't cover load (B2), and the AI prompts weren't audited (N4). Both are added as SAF-8 and SAF-9.
- The Pelland publication year (2025 vs 2026) is still unverified. It needs paper-lookup (D10).

## 6. Owner questions
1. D4: approve BL-35 and BL-36 now, so they ship right after Phase 0? Should past neck-bridge sets be archived (my recommendation) or carried over?
2. On clinical programs, should load suggestions be off entirely, or allowed only in the smallest step after two sessions at RPE ≤7? I recommend the second.
3. On share cards, may "sets" replace "total load lifted" as the default number?
