# Design directions: is Plate & Press enough, or does it need more edge?

Owner: design-engineer. Written 2026-11-07 against **v3.514**, after the summit. The marketing-manager reviews this next.

**What this answers:** the owner asked, "is it going to be able to withstand viral apps, or does it need more of an edge?" This file:
- critiques Plate & Press honestly (§1);
- builds two genuinely different alternatives (§2);
- draws the same two screens in all three worlds (§3);
- compares them and recommends one (§4, §5).

**Inputs:**
- the planning files: `design-vision.md`, `summit.md` (R1), `marketing.md`, `pitch.md` and `backlog.md` (UX-01 to UX-17);
- the original renders in `tools/design/renders/`;
- the skills: impeccable (context, critique, new-work, bolder, overdrive, the craft floor and the detector), taste-skill (app screens), apple-hig.

**Mock-ups:**
- Sources: `tools/design/directions/*.html`. Direction A reuses `tools/design/world.css`; B and C share `directions/base.css`, which holds only the device chrome and the font files.
- Renders: `tools/design/directions/renders/`. Today is 402×874 at 2× in dark and light. The story cards are 1080×1920 at 1×.
- Nothing here is loaded by `index.html`.

**The concept roll, disclosed:**
- `impeccable concept-seed --scope direction --mode operate` ran this session (**seed:97b8f6939e66b07b**) and assigned **index 7** of my own grounded list.
- This run is a subagent with no way to put a decision page in front of the owner, so I've written the round out here instead. The owner can overturn any of it.

---

## 0. The short answer

**Plate & Press is the best working screen of the three, but its share card has the least edge.**
- In the app, it is right: the answer is huge, the plate stack is the one thing no competitor has, and the backlog is already written for it.
- In a feed, it reads as a well-made stats card: a big condensed headline, a colour field and a three-number grid. That's the grammar Strava, Hevy and every "workout complete" card already use. It won't stop a thumb.

**The edge comes from an object lifters already photograph: the race bib.** My recommendation (§5):
- keep Plate & Press as the app's world, with the R1 corrections and three fixes of my own;
- make the bib the share-card format, printed in the same plate inks and the same Archivo face.

Court (B) is the strong runner-up if the owner would rather have one calm, stable brand colour than a colour that changes with the day.

---

## 1. An honest critique of Plate & Press

### 1.1 What's strong (keep it)
- **The answer is the screen.** "160 × 5" at 150 px reads from a bench a metre away. No competitor's logging screen does this; Strong and Hevy are lists.
- **The plate stack is functional and ownable.** It replaces a tap (the plate calculator), and marketing ranks it the #1 shareable asset (summit §1.3). It survives into every direction below.
- **The colour code is product truth, not costume.** Every program day already carries `plate:'p-red', plateNum:'25'` (`index.html` ~9716).
- **It's an Operate world done properly.** Standard tab bar, sheets and steppers, with the brand living in type, ink and one signature move. The backlog (UX-01 to UX-17) is shippable one version at a time.

### 1.2 What's weak

**Errors in the original renders.** The summit's R1 found five; I found one more.

| Where | Error | Status |
|---|---|---|
| `today-*.png` | "Readiness 72" (no such feature is planned) | Fixed in `directions/a-today.html` |
| `today-*.png` | "Intensification" (new phase copy, F3) | Fixed: "Week 3 of 5" only |
| `today-*.png` | Header chat icon (UX-16 needs the owner) | Removed |
| `today-*.png` | The effort label came from more than one source (F8) | One string: "2 reps in reserve" |
| `pr-dark.png` | Bench "→ 165" and "+5 lb on your best" (F6, F7) | Not re-rendered here. `pr.html` still carries it |
| **`recap-dark.png`** | **"Bench asks for 165 × 5" — the same F7 error, which R1 didn't list** | **New. `recap.html` must hold at 160 too** |
| `progress-dark.png` | Ledger band, colours and "Add 2 sets each" (R1.5) | Not re-rendered here. `progress.html` still carries it |

`tools/design/{pr,recap,progress}.html` still need the R1 corrections before UX-09, UX-10 and UX-11 start. `directions/a-today.html` and `a-card.html` are correct now.

**Problems the summit didn't raise (my own critique):**
- **The plate stack was a glyph, not a diagram.** In `today-dark.png` it is a 112 px sliver at the screen edge. It read as an icon, not as a bar you load. Fixed in A: a full-width loaded bar, with plates in true loading order.
  - My own first draft got the order wrong (45 outermost) and I caught it on the render. That's worth a test in UX-07: the heaviest plate sits against the inner collar.
- **Four identical chips.** "160×5 · 160×5 · 160×5 · 160×5" spends four 44 pt targets on one fact. Fixed: done shows the logged result, ready is outlined, later sets say "Set 3" and "Set 4".
- **Light mode is nominal above the fold.** The cover is the same red field in both themes (`today-light.png` vs `today-dark.png`). That's acceptable, because the field is the data, but "every token has a light value" means less than it sounds.
- **The spot inks collide with the state colours.** This is a real system flaw.
  - Green is both the 25 lb plate and `--positive`. Red is both the 55 lb plate and `--negative`.
  - On a red day, a regression drawn in `--negative` on the cover is invisible. On a green day, a progression in `--positive` is too.
  - Fix: state colour never sits on a spot field. On the cover, state is carried by an icon and a word, never by hue.
- **Red is iOS's destructive colour.** A full-bleed red cover every Monday (Day 1 is the red plate in most programs) borrows the meaning of "delete". It's mostly fine, because the plate meaning is learned fast, but it's a cost.
- **Yellow days at night.** A full-bleed `#F2C200` field on an OLED phone in a dim garage is the brightest thing in the room.
  - Fix: in dark mode, after sunset or under Reduce Transparency, the cover uses the deep ink (`--deep-yellow`) with spot-ink figures. The tokens already exist.

### 1.3 How it risks looking like other apps
- **The impeccable calibration names this exact cluster:** "flat saturated ink with black boxes … and heavy condensed display type". Plate & Press earns it, because the plates are real data. But a stranger scrolling past the card sees the cluster, not the reasoning.
- **Nike Training Club, Nike Run Club and Ladder** already own "full-bleed colour plus giant condensed numerals" in fitness marketing. Strava's and Hevy's completion cards own "headline plus three-stat grid".
- **The A story card (`renders/a-card.png`) is honest and clean, but it is that grid.** Cover the wordmark and it could belong to several apps.
- **The colour changes with the day,** so the brand colour on shared cards changes too: red Monday, blue Tuesday. That gives variety, but weak recall. Strava is orange every time.

### 1.4 Quality at real use

| Condition | Verdict | Detail |
|---|---|---|
| Glare under fluorescents | Good | The 150 px white-on-red figure survives glare. The weak spot is 13 px meta text, white on red at 4.96:1: just over AA, with no margin under glare. Keep meta at 15 px and above on spot fields. |
| A dim gym, at night | Weak | A full-bright saturated field (worst on yellow and white days). The fix is in §1.2 |
| One-handed | Good | The Log button sits at about 63% of the screen height (y ≈ 555 of 874), inside the thumb arc. The day switcher is top right, a stretch, but it's a rare action. |
| Sweaty fingers | Fair | The 44 pt chips meet the floor, not comfort. The Log button (56 pt) and the adjust button sit 10 px apart, so a wet thumb can hit adjust instead of Log. Widen the gap to 16 px, or move adjust onto the chips row. |
| Dark and light | Good | All text pairs pass AA (contrast table in §4.2) |
| The Duo, front screen | Good | A 150 px numeral plus "lb ×5" needs about 330 px. It fits the 402 pt phone and the 420–460 pt cover screens of the passport foldables (HANDOFF-v59, Addendum 33). |
| The Duo, unfolded (904×678) | Open | The cover's "first 60% of the screen" assumes a portrait phone. At 678 pt tall, the cover belongs in the left pane only, with the lift's history on the right. UX-14 must state this, and it hasn't been rendered for any direction yet. |

---

## 2. Two alternative directions

### 2.1 How they were chosen
**My grounded list,** from the lifter's own world, ordered by resonance. It spans five material families: ink, light and signage, architecture, identity programs, paper ephemera and handwriting.
1. The calibrated plate colour code (**A, Plate & Press**: pinned by brief)
2. The powerlifting meet: attempt cards and the three white lights *(my pick, see below)*
3. **Sports-hall floor markings** (the earlier roll's assignment, and the owner's prompt): **B, Court**
4. Munich 1972 (Otl Aicher's identity program)
5. The box's chalk whiteboard
6. The stadium results board
7. **The race bib** (competitor number, Tyvek, tear-off tabs). This is the **roll's assignment, index 7**: **C, Race Bib**

The rut was kept off the list: the paper training notebook, which is the literal reading of "Training Log".

**Challengers dealt by the roll, with verdicts:**

| Challenger | Verdict | What C kept from it |
|---|---|---|
| Jet-age ticket wallet (coupons, stamps, "nothing disappears, it cancels") | **Competitive.** It holds audience identification weakly and product clarity well | **Raise to C:** a logged set is *stamped*, never removed. The tab stays, with its result, so the session's history stays visible on the bib. |
| Split-flap concourse board | Declined. On a working screen it's an instrument costume | Discipline: only the figure that changed moves. That's already A's "width-axis settle" |
| Airline timetable slide rack | Declined | — |
| Warm consumer app surface | Declined. It's the category canon | — |
| Crouwel grid specimen | Declined | **Raise to B:** the grid is visible and *is* the layout. Court lines are the armature, not decoration |
| Zoo guide map | Declined | — |

**My pick (not built):** the meet's three white lights. "Three whites" is lifter slang, and a judged-attempt card would be a strong PR moment. Its honest risk is that it's powerlifting-specific: a hypertrophy or clinical user never sees a meet. It stays adoptable as a PR-card variant inside any world.

### 2.2 Direction B, "Court": the sports-hall floor

**Thesis:** the app is the floor you train on. Structure is painted line, never boxes. Each line colour does one job.

**World:**
- **Ground:**
  - dark mode is poured court green `#0E3B34`, with a darker run-off `#0A2B26` for the chrome;
  - light mode is maple `#EBD4A6` with run-off `#DFC28C`, as flat colour with no wood-grain texture.
  - This is lower glare than white paper and warmer than grey.
- **Line colours, one job each:**
  - white for structure;
  - yellow for the live set (and the Log button);
  - red for a miss;
  - blue for a planned change (OHP "add weight → 100").
  - In light mode the structure lines go black, as on a real maple floor.
- **Type:** the same Archivo file at **125% width**, like painted court numerals, for figures and headlines. Geist for text.
- **Signature move:** the session is drawn as lines.
  - The next set stands in the **key**: a full-bleed boundary line with the free-throw arc holding "Set 2 of 4".
  - The sets are one **lane line**, one segment per set: done, live and planned (dashed).
  - Charts are thin lines on the floor. This was already A's raise from the floor-markings world, and here it's native.
- **Motion:** a logged segment paints in, left to right (a 220 ms `clip-path`), and the live segment moves on. Under Reduce Motion, it's a cut.
- **Share card (`renders/b-card.png`):**
  - the session as a floor plan, with the sets in the centre circle;
  - one lane per lift, one stroke per set, the stroke's length being the reps against the top of the range;
  - strokes below the top are outlined.
  - The card is honest data-ink. It's calm and distinctive, but quieter in a feed than C.
- **Fit with "Chalklog":** the best of the three. Lines on a field are literally chalked.

### 2.3 Direction C, "Race Bib": the competitor number

**Thesis:** today's session is an event you've entered. The next set's load *is* your bib number.

**World:**
- **Material:**
  - Tyvek white in light mode; black Tyvek `#151514` on true black in dark mode.
  - The **event band** across the top carries the day's plate ink (data, as in A).
  - Four pin holes mark the bib.
- **Type:** Archivo at **100% width, weight 900**, the heavy, wide numerals real bibs use. Geist for text. There is one tracked-caps line per screen: the event band.
- **Signature move: the tear-off set tabs.**
  - The sets are a perforated row of tabs under the number.
  - Logging *stamps* the tab with its result (the ticket-wallet raise): a rotated red outline, "160×5 · Set 1 done".
  - The live tab is reversed (ink fill).
  - Nothing is torn away, so the session's record stays on the bib.
- **Motion:** the stamp lands with a 120 ms scale from 1.06 to 1, plus a press on the tab. Under Reduce Motion, it's a cut.
- **Share card (`renders/c-card.png`):** the finished session as a bib, tilted 2.5° on the day's plate colour.
  - **The bib number is your session count** ("47", from activity dates).
  - **"Finished 58:12"** reads like a chip time.
  - The Bench line carries its honest progression: "2 of 4 sets at the top. Two more and it's 165".
  - The tear-off tabs hold sets, lifts and load lifted.
- **Why it has edge:**
  - A bib is an object lifters and runners already photograph and post. Hyrox, CrossFit and meets all use them.
  - It works from **session 1**: no record needed, so every session can be shared truthfully, and first-week users (activation) have something worth posting.
  - Year in Lifting becomes "a wall of your bibs".
- **Fit with "Chalklog":** weaker. A bib says "event", not "chalk". It would suit "Liftnext" just as well.

---

## 3. The renders

All six screens show the same truth:
- Bench Press 4×4–6, holding at 160 lb until all four sets reach 6 (BL-08);
- "2 reps in reserve" from one source (BL-10);
- 45 + 10 + 2.5 a side;
- no readiness score, no phase name, no record claimed (160 was already lifted last session), and no body data on any card.

Sample values are labelled in each file's head comment.

| Direction | Today, dark | Today, light | Story card |
|---|---|---|---|
| A, Plate & Press (R1-corrected) | `renders/a-today-dark.png` | `renders/a-today-light.png` | `renders/a-card.png` |
| B, Court | `renders/b-today-dark.png` | `renders/b-today-light.png` | `renders/b-card.png` |
| C, Race Bib | `renders/c-today-dark.png` | `renders/c-today-light.png` | `renders/c-card.png` |

(All paths are under `tools/design/directions/`.)

**What the look-and-fix rounds caught and fixed:**
- A's plate order (§1.2).
- A's card: the headline overflowed, and a grey caption sat on red at under 3:1.
- B's key read as a card drawn with lines, so its sides now bleed off the screen like a real court boundary.
- C's numeral overflowed 402 px at 168 px, so it's now 144 px, measured.
- C's perforation, the boundary of the set buttons, was 2.76:1, so it's darkened to 3.7:1.
- Two orphaned words, and C's safety pins (too small to read as pins; removed).

**The mechanical checks:**
- No horizontal overflow, and no tap target under 44 pt, on any render.
- Both fonts loaded on every render.
- The impeccable detector's remaining findings:
  - Geist flagged as overused (it already ships; it's the text face only);
  - "cramped padding" on rows that are vertically centred in a 60 pt minimum height (a false positive);
  - B's dashed planned-set segment (state, not decoration).

---

## 4. Comparison

### 4.1 Scores (1 = weak, 5 = strong)

| | A · Plate & Press | B · Court | C · Race Bib |
|---|---|---|---|
| **Quality in real use** (glare, night, one hand, sweat) | **4.** The best figure at a metre. A bright field at night (fixable with deep inks) | **5.** A mid-dark ground with no bright flood; the maple light mode is the lowest-glare of the three; yellow Log button at 11:1 | **3.** White Tyvek in light mode is the most glare; dark mode is excellent; the tabs are 64 pt (the best target size) |
| **Distinctiveness in the app** | **4.** The plate code is ownable, but the look sits in a known cluster | **5.** No fitness app looks like a court floor | **4.** Unusual, but the bib frame competes with content on deep screens |
| **Distinctiveness in a feed** (share edge) | **2.** A stats card | **3.** Calm, but a data poster people won't instantly "get" | **5.** A recognisable object, which people already post |
| **Scales to every screen** | **5.** The backlog was written for it: Today, rest, finish, Progress, History, Food | **4.** Lines carry charts, History (a month as lanes) and the per-muscle ledger (a line to a target). Food is plain rows | **2.** Today, finish and cards are bibs. Progress, Food and History can't be, and fall back to a plain system (in practice A or B) |
| **Accessibility** | **4.** AA everywhere, but 4.96:1 is a thin margin for small text on red, and state/spot colours collide (§1.2) | **5.** The widest margins (text 5.3–14.7:1, most pairs above 6.5); state colours never sit on a colour field | **4.** AA everywhere; the stamp is 6.3:1 light and 6.5:1 dark; tab boundaries fixed to 3.7:1 |
| **Build cost against UX-01 to UX-17** | **Lowest.** As written, plus R1, plus the §1.2 fixes | **Medium.** New UX-01 values; UX-05 changes meaning (the day ink becomes data only, never a field); UX-06 layout rewrite; UX-12 becomes lanes. UX-07, -08, -09, -10, -11, -13, -14 and -15 carry over in substance | **High in the app** (UX-06, -08, -09 and -11 rewritten, plus a second "plain" system for the other screens). **Low as cards only:** MKT-03 to MKT-07 draw on `<canvas>` either way |
| **Font asset** | Archivo (UX-02) | The same file | The same file |

All three use the same 90 KB Archivo file at different widths (68%, 125% and 100% at weight 900). Choosing between them adds no asset beyond UX-02.

### 4.2 Contrast (checked, not estimated)

| Pair | Ratio |
|---|---|
| A: white on red | 4.96 |
| A: chip red on white | 6.30 |
| B dark: text | 10.97 |
| B dark: secondary text | 7.73 |
| B dark: yellow live | 7.55 |
| B dark: on yellow | 11.25 |
| B dark: blue plan | 6.08 |
| B light: text | 12.00 |
| B light: secondary text | 6.62 |
| B light: blue plan | 5.29 |
| C light: secondary on sheet | 7.50 |
| C light: stamp | 6.30 |
| C dark: stamp | 6.54 |
| C dark: secondary text | 7.73 |
| C: perforation (non-text) | 3.71 light, 3.89 dark |

---

## 5. Recommendation

**Keep Plate & Press as the app's world. Make the race bib the share-card format, printed in Plate & Press's inks.**

**Why:**
1. **At the bar, A wins on the measure that matters.** The mission is "faster, clearer, more motivating training".
   - A's cover answers "what do I lift now?" best, and it's the one the backlog can build next week.
   - C's in-app frame doesn't scale past three screens. B is better under glare, but it trades away the plate-colour cover that makes the day legible at a glance.
2. **In the feed, A loses, and the bib fixes exactly that.**
   - A share card is a Persuade surface, not an Operate one: impeccable chooses the mode per surface, and Spotify Wrapped looks nothing like the Spotify app.
   - The bib keeps A's DNA: the day's plate ink is its ground, Archivo is its numerals, and the plate stack can ride on the bib.
   - So a stranger who installs from a bib card opens an app in the same inks and type.
3. **The bib makes every session shareable without bending the truth.** The session count and the finish time are always true. A PR card needs a real record (F6), so it fires rarely.
4. **It costs almost nothing extra.**
   - MKT-03 to MKT-07 draw on `<canvas>` whatever the layout, so the bib is a layout choice inside the same builder.
   - No new asset, and no change to the app's UX items.

**What changes in the plan (proposals; the backlog isn't edited in this pass):**
- **Before UX-06:** correct `tools/design/{pr,recap,progress}.html` per R1, including the newly found recap error ("165 × 5" → hold at 160).
- **UX-05 / UX-06:**
  - add "state colour never sits on a spot field" and a dark-mode deep-ink cover;
  - meta text on spot fields at 15 px or more;
  - a 16 px gap between Log and adjust.
- **UX-07:** add a test that the heaviest plate sits against the inner collar, and that the bar is drawn full width on the cover.
- **MKT-03 / MKT-04:** the story layout is the bib, built as a **session-card variant** first.
  - It holds: the session count, the finish time, three tabs (sets · lifts · load), and the lead lift's honest progression line.
  - Ground = the day's spot ink. No body data. Clinical programs get no card (R2).
  - The square card keeps A's grid for messages.
- **MKT-06 (Year in Lifting):** "a wall of your bibs" as one of its cards.

**When to choose B instead:** if the owner wants **one stable brand colour** for recall (court green every time, like Strava's orange), the calmest screen in a dark gym, and the best fit with the name "Chalklog".
- B is fully viable, and it's the only alternative I'd ship as the *whole* app.
- Its cost is rewriting UX-05 and UX-06 and giving up the coloured cover.

**Not recommended:** C as the whole app. The bib is a brilliant poster and a weak operating system. Progress, Food and History would need a second visual language, which is exactly the "half-redesigned" state the plan exists to avoid.

**For the marketing-manager's review:**
1. Does the bib card beat A's grid card for MKT-03?
2. Is the session count ("47") the right bib number, or should it be the program week ("Wk 3")?
3. Does "Chalklog" survive a bib-led card, or does that argue for "Liftnext"?
4. Is "Finished 58:12" too close to a race claim for a lifting session?
