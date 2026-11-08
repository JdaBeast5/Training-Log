# Launch posts and the comparison-page outline (MKT-13, MKT-12)

Owner: marketing-manager. Drafted **2026-11-08** against **v3.517**. Every post goes out under the owner's name, so all of this is `needs-owner` (MKT-13). Nothing is posted by an agent.

**Not before** (from `marketing.md` §4.3): the first-launch fixes (BIZ-01 to BIZ-03, BIZ-17) have shipped and the Phase 3 gate holds; `platestep.app` resolves to a page that installs (`landing-page.md`); the privacy page (BIZ-16) is live; and the "What's free" wording is published (BIZ-18). A stranger's first session is the launch.

**Rules for every post:**
- **Say who you are:** "I made this", in the first two lines. Every time.
- **Date every factual claim.** Each post carries "as of {POST_DATE}, v{APP_VERSION}", because the app changes weekly and an old post shouldn't become a false one.
- **Post only where the rules allow it,** in the designated thread, after messaging the moderators where the rules ask for that. Re-read each sidebar on the day: every rule below was checked through search results and unofficial mirrors, because Reddit itself wasn't reachable from this session.
- **No cross-posting the same text.** Each community gets its own post, written for it.
- **No asking for upvotes,** anywhere, from anyone. No friends' accounts, no "go vote" messages. That's vote manipulation on Reddit and fake social proof everywhere.
- **No claims the app can't back.** Feature sentences come from `app-store.md` §5 and are mapped to the code in §9 there. No health claims, and none of the words "safe", "rehab" or "prevents".
- **Answer every reply for the first 48 hours,** including the critical ones, and fix what they find in public (a What's New line that credits "a suggestion from Reddit").
- The account that posts should already take part in these communities. Reddit's own guidance is roughly 10% or less self-promotion; r/bodyweightfitness states a 10 : 1 ratio.

**Suggested order:** soft launch with friends (4 weeks, marketing §4.3 step 1) → r/weightroom (if the mods agree) → Product Hunt on a Tuesday to Thursday → r/Fitness on the following Saturday → r/bodyweightfitness only if §3.3's check passes. Spreading them out means each round's fixes land before the next audience arrives.

---

## 1. r/weightroom

**Rules, as far as they could be checked (2026-11-08):** the official rules page wasn't reachable. A third-party directory shows the sub has a "Self-Promotion" post flair, used about once a month, and the sub's FAQ asks posters to think about whether anyone will care. **Unverified.**

**So:** message the moderators first (modmail), with the draft below, and ask whether and where it may go. Post only with their yes, under whatever flair or thread they name. If they say no, don't post, and don't ask again.

**Modmail (short):**
> Hi mods. I've built a free strength-training app (no ads, no account, data stays on the phone) and I'd like to ask this sub for critique of its progression rules, which is the part I most want experienced lifters to poke at. I'm the developer, and I'd disclose that in the post. Is that welcome, and if so, where and with which flair? Draft below. Happy to take no for an answer.

**Post (if allowed). Title:**
> I built an app that decides your next set by rules I'd like this sub to tear apart (I'm the developer)

**Body:**
> I'm the developer of Platestep, so weigh this accordingly. It's free, with no ads and no account, and your log stays on your phone. As of {POST_DATE} (v{APP_VERSION}), this is how it decides what you lift next:
>
> - Every set gets a target weight and reps from the program and your recent sessions.
> - Hit the top of your rep range two sessions in a row and it tells you to add weight next time (double progression, with the smallest plate step you set).
> - Fall below the bottom of the range and it tells you to go lighter.
> - RPE 9 or above for three straight sessions with no rep or weight gain, and it suggests a 10–20% lighter week.
> - Deload weeks are planned into each program's cycle.
> - Every program shows what it's based on, and says so when it's coaching tradition rather than a study.
>
> What I'd like from you: where do these rules give bad advice? Two sessions at the top of the range before adding load, too slow for novices? Should the RPE trigger look at e1RM instead? Would you rather it suggest a rep-range change than a lighter week?
>
> {APP_URL} · iPhone: Safari → Share → Add to Home Screen. Android: Chrome → ⋮ → Install app.
>
> It's one person's project, so I'll read every reply, and anything you find goes into the changelog.

Why this framing: r/weightroom is the most programming-literate audience we'll reach. An invitation to critique the rules is the honest pitch, and it's the one most likely to be welcome.

**Check before posting:** the "smallest plate step you set" phrase depends on the clinical smallest-step rule (D12) and the user's plate setting; confirm what v{APP_VERSION} actually does and edit the line to match.

---

## 2. r/Fitness

**Rules (checked through mirrors, 2026-11-08):**
- **Self-Promotion Saturday** is "the one and only place that ads are allowed on r/Fitness" (wiki intro, mirrored).
- Rule 2: if you're posting your own content you must discuss it with the moderators first; otherwise the result is a permanent ban (rules wiki, mirrored).
- There's also a monthly "Apps, Gadgets and Gear" thread for fitness tech.

**So:** modmail first (same note as §1, with "Self-Promotion Saturday" named), then **one comment in the Self-Promotion Saturday thread** on the agreed Saturday. Optionally, a separate, shorter comment in that month's Apps thread if the mods say both are fine. Never a standalone post.

**Comment (Self-Promotion Saturday):**
> I made Platestep, a strength app that tells you what to lift next. Free, no ads, no account, and your log stays on your phone. (As of {POST_DATE}, v{APP_VERSION}.)
>
> You pick a program (strength, size, powerlifting, powerbuilding, Olympic lifting, calisthenics, bodyweight at home), and every set comes with a target weight and reps. One tap logs it. When you've hit the top of your rep range two sessions running, it tells you to add weight; when you're stuck at RPE 9+, it suggests a lighter week. Each program shows the research or coaching practice it's based on.
>
> {APP_URL}. On iPhone, open it in Safari, then Share → Add to Home Screen. On Android, Chrome → ⋮ → Install app.
>
> It's a one-person project. Honest feedback welcome, especially from anyone following a program for the first time.

---

## 3. r/bodyweightfitness

**Rules (checked through mirrors, 2026-11-08):**
- Apps "have been allowed conditionally if they are totally free. If they are paid or in-app purchases they are not permitted at this juncture."
- Self-promotion follows a **10 : 1** rule: about one link to your own content per ten comments elsewhere in the sub.
- Posts must be discussion-oriented and related to bodyweight, gymnastics or calisthenics.

### 3.1 Does Platestep qualify?
- Today, yes on price: free, with no in-app purchases and no ads.
- **But** the plan of record is "free at launch, a subscription later" for server-run extras only (business.md §3.3, D9). The honest move is to say so in the modmail and let the moderators decide whether that matters. The "What's free" paragraph says exactly what will stay free.

### 3.2 Modmail
> Hi mods. I've built a strength app with bodyweight and calisthenics programs. It's free: no ads, no in-app purchases, no account. In full honesty, I may one day add an optional paid plan, but only for things that run on a server (like AI without your own key, or cloud sync); everything on the phone stays free, and I've published that promise: {WHATS_FREE_URL}. Would a post asking for feedback on the bodyweight programs be allowed under your app rule? I'm the developer and would say so.

### 3.3 Check before posting (the honesty gate)
The post must only promise what the bodyweight programs actually do. Before posting:
- Open the `bodyweight` and `calisthenics` programs in v{APP_VERSION} on the seeded profile and log three sessions.
- Confirm the progression line makes sense **for bodyweight moves** (at zero added weight, does it say "add reps" or a progression step, rather than "add 0 lb"?).
- Confirm the static-hold progressions show their source line (`index.html:11223`: "the straight-arm-vs-bent-arm split itself is coaching tradition").
- If any of that reads wrong, fix it first (a backlog item, not a post) and skip this sub until then.

### 3.4 Post (if allowed and the gate passes)
**Title:**
> Feedback wanted on the bodyweight and calisthenics programs in a free app I built (developer here)

**Body:**
> I'm the developer of Platestep. It's free, with no ads, no in-app purchases and no account; your log stays on your phone. As of {POST_DATE} (v{APP_VERSION}), it has a bodyweight program for training at home and a calisthenics program built around static-hold progressions, and it shows what each one is based on. For the calisthenics one, that's a 2023 gymnastics review and a 2019 isometric-training review, and it says plainly that the straight-arm versus bent-arm split is coaching tradition rather than something those studies tested.
>
> I'd like this sub's view on two things: are the progression steps in the right order, and is anything in the [Recommended Routine]'s territory that I should simply point people to instead of re-inventing?
>
> {APP_URL}. iPhone: Safari → Share → Add to Home Screen. Android: Chrome → ⋮ → Install app.

(The bracketed reference to the sub's own routine is a nominative mention of the community's resource, not a claim about it; drop it if the mods prefer.)

---

## 4. Product Hunt

**Limits (checked 2026-11-08, partly verified):** tagline **60 characters** (Product Hunt's launch guide, via search: "no gimmicks or over-the-top language"); description **260 characters** in the help article, 500 in the launch guide, so write to 260; thumbnail square, 240 × 240 recommended; gallery images reported as 1270 × 760, up to 8, under 3 MB (third-party guides). Product Hunt's own pages weren't reachable from this session.

**On votes:** don't ask anyone to upvote, in any channel. Tell friends it's live if they ask; don't send them the link with an ask. Third-party guides recommend DMing supporters in the first hour; we don't, because it's fake social proof whatever PH's enforcement is.

- **Name:** Platestep
- **Tagline** (49 of 60):
  ```text
  The strength app that tells you what to lift next
  ```
- **Description** (227 of 260):
  ```text
  Pick a program and Platestep gives you the weight and reps for every set, logs it in one tap, and adds weight when you've earned it. Each program shows its sources. No ads, no account, and your training log stays on your phone.
  ```
- **Topics:** Health & Fitness, Productivity (if a third is allowed: Android or iOS, whichever is live). Not "Open Source": the repo is public but has no licence file, so it isn't open source.
- **Pricing field:** Free.
- **Thumbnail:** the Sash icon (`icon-512.png`), downscaled.
- **Gallery** (1270 × 760 each; the storyboard frames laid out landscape, two phones per image where it helps):
  1. Frame 1 + frame 2: "Tells you what to lift next" / "One tap logs the set"
  2. Frame 3: "Adds weight when you earn it"
  3. Frame 4: "Programs that show their sources"
  4. Frame 5: "Every record, every week"
  5. Frame 7: "Your log stays on your phone"
  6. (When MKT-16 ships) the bib card pinned on a gym photo.
- **Launch day:** a Tuesday to Thursday, 12:01 a.m. Pacific (when PH's day starts, per third-party guides), with the owner free to answer comments all day.

**Maker's first comment** (post it as soon as the launch is live):
> Hi Product Hunt, I'm the maker. (As of {POST_DATE}, v{APP_VERSION}.)
>
> I lift, and every app I tried was either a blank logbook (you decide everything) or a black box (it decides, and won't say why). Platestep is the middle: you pick a program, and it tells you the weight and reps for every set, with rules you can read. Hit the top of your rep range two sessions in a row, add weight. Stuck at RPE 9+ for three sessions, take a lighter week. Every program shows what it's based on, and says so when the evidence is thin.
>
> A few things I care about:
> - No ads and no account. Your training log is stored on your phone, and you can back it up to a file any time.
> - Everything it does on your phone is free, for good. The exact promise, including what a paid plan could ever cover, is here: {WHATS_FREE_URL}
> - It works offline, because gyms are basements.
>
> What it doesn't do yet: import from other apps, a watch app, or syncing between devices. If those are deal-breakers, I'd like to hear it.
>
> Install: {APP_URL} (iPhone: Safari → Share → Add to Home Screen; Android: Chrome → Install app).
>
> I'll be here all day. The most useful thing you can tell me is where the next-set suggestion was wrong for you.

---

## 5. Dating and versioning the posts

- Replace `{POST_DATE}` with the posting date, `{APP_VERSION}` with `APP_VERSION` from `index.html` that day, `{APP_URL}` with the app's address, and `{WHATS_FREE_URL}` with the landing page's `#free` anchor.
- Before posting, re-run the claim check in `app-store.md` §9 against that day's build. If a rule threshold has changed (27505, 27518, 27532), change the post.
- Keep a dated copy of what was posted, and where, in `planning/store/posted/` (a later commit), so that if a rule changes later we can see what we promised and when.

---

## 6. Comparison page outline (MKT-12, needs-owner)

**Status:** `needs-owner`. It names other companies' products, which is a third-party trademark use. The recommendation in the backlog stands: **yes, one page, dated and sourced, never in store keywords, and only after CSV import (BL-29) exists**, because a switcher's first question is "can I bring my history?".

**Where:** a section of the landing site, `platestep.app/compare` (a second static file under MKT-14's rules), linked only from the footer. Not from the store listings.

**Title:** `How Platestep compares with other workout apps (checked {CHECK_DATE})`

**Rules for the page:**
- Names in plain text only: no logos, screenshots or brand colours of other apps (nominative use).
- Every cell carries a source link and the date it was checked. Prices are listed as "US price on {CHECK_DATE}". A competitor's change makes our page wrong, so re-check quarterly and show the date at the top.
- Facts, not adjectives. No "best", no "better than", no star ratings, no review quotes about competitors.
- A **"Where they're ahead"** section, written in good faith. It's the most credible part of the page.
- A corrections line: "Something here out of date? Tell us at support@platestep.com and we'll fix it within a week."
- No "alternative to X" keyword stuffing in the title, headings or URL.

**Sections:**
1. **One paragraph:** what Platestep is (the store description's first paragraph) and who it's for.
2. **The table** (columns: Platestep, then each compared app; data from `research.md` §1–§3 as of its dates, re-checked on publication):
   - Price and what the free tier limits (e.g. routines, custom exercises, history length)
   - Does it plan your next set, or log what you decide? Is that free?
   - Progression method, in one plain phrase
   - Ads
   - Account required
   - Where your log is stored
   - Export format; import from other apps
   - Works offline
   - Apple Watch, lock screen, Android
   - Social feed (and whether you can turn it off)
3. **Where they're ahead** (from `research.md`'s "what users love"): mature watch apps and lock-screen logging; a large community feed for those who want one; import from other apps (until BL-29 ships); cloud sync between devices.
4. **Where Platestep is different:** the next set planned for free, the rules shown, the sources shown, no account, on-device storage. Each stated once, with the code-backed sentence from `app-store.md` §5.
5. **Switching:** how to bring your history (BL-29's importer, when it exists) and how to leave (our export), with the steps.
6. **Checked on:** the date, the list of sources, and the corrections line.

**Candidates to compare** (subject to the owner's answer; the top three by switching searches in `business.md` §6): Strong, Hevy, Fitbod. Add others only if a real search shows demand.

## Sources

- [r/Fitness wiki intro (unofficial mirror)](https://reddit.rtrace.io/r/Fitness/wiki/intro) and [r/Fitness rule 2 (unofficial mirror)](https://cal1.lr.ggtyler.dev/r/Fitness/wiki/rules/rule2): Self-Promotion Saturday and the moderator-first rule, via search results
- [r/bodyweightfitness rules (unofficial mirror)](https://lr.vern.cc/r/bodyweightfitness/wiki/rules): apps allowed if totally free, 10 : 1, via search results
- [The Hive Index: r/weightroom](https://thehiveindex.com/communities/r-weightroom/): a "Self-Promotion" flair, via search results
- [Redship: Reddit self-promotion rules in 2026](https://redship.io/blog/reddit-self-promotion-rules) (the 90/10 guidance)
- [Product Hunt launch guide: preparing for launch](https://www.producthunt.com/launch/preparing-for-launch) and [Product Hunt help: how to post a product](https://help.producthunt.com/posting/how-to-post-a-product): tagline 60, description 260, thumbnail 240 × 240, via search results
- [Screenhance: Product Hunt gallery size (2026)](https://screenhance.com/blog/product-hunt-gallery-size) (1270 × 760; third-party)
