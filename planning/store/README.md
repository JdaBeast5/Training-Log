# planning/store: store listings and launch copy for Platestep

Owner: marketing-manager. Written 2026-11-08 against **v3.517** (`APP_NAME = 'Platestep'`; icon "Sash"; design direction Plate & Press with the race-bib share card). The aim is that launch week is assembly, not writing: every field is drafted, counted against its limit, and mapped to the code that makes it true.

**Nothing in this folder is approved for publication.** Store listings cost money (Apple's developer membership, Play's registration fee) and public posts go out under the owner's name, so they're `needs-owner` (MKT-12, MKT-13, MKT-14 and the store accounts). The copy is ready for the day those are approved.

## Files

| File | What's in it |
|---|---|
| `app-store.md` | Apple: name, subtitle, promotional text, keywords, description, What's New template, age rating answers, category, and a claim-by-claim map to the code (§9) that the other files reuse |
| `google-play.md` | Play: title, short and full description, category, content rating, target audience, the data-safety edges, and the feature graphic |
| `screenshots.md` | The 7-frame storyboard (8 once the bib ships), with captions, order, Apple and Play sizes, and which visual-harness state shoots each frame or what fixture or state it still needs |
| `landing-page.md` | `platestep.app` (MKT-14): SEO head, hero, three proof points, "What's free", install steps for iPhone and Android, footer |
| `launch-posts.md` | r/weightroom, r/Fitness, r/bodyweightfitness and Product Hunt, each within its rules as checked, plus the comparison-page outline (MKT-12) |

## The words we chose

- **App Store name / Play title:** `Platestep: Strength Training` (28 of 30)
- **Subtitle (Apple):** `Tells you what to lift next` (27 of 30)
- **Short description (Play):** `Tells you what to lift next: weight and reps for every set, logged in one tap.` (78 of 80)
- **Product Hunt tagline:** `The strength app that tells you what to lift next` (49 of 60)
- **Landing H1:** `Tells you what to lift next.`

## Rules every file follows

- Lead with "tells you what to lift next".
- No health or medical claims, and never the words "safe", "rehab" or "prevents". The clinical programs aren't mentioned or shown until the clinician review (D9(e), BIZ-15).
- No competitor names in store metadata. They appear only in the comparison-page outline, which is `needs-owner`.
- No price words in names, subtitles, titles or screenshots (Apple 2.3.7; Play's title and preview-asset rules). "Free" lives in the descriptions and the landing page.
- No ratings, reviews, user counts, awards, urgency or scarcity. No asking for upvotes.
- Only shipped features. Bib cards, "Your number", Year in Lifting, the weekly streak, CSV import and export are left out until they ship.
- "Your training log is stored on your phone", never "no data leaves your phone": food search and optional AI do send requests.

## Launch-week assembly checklist

1. **Fill the placeholders:** `{APP_URL}` (the app's current address; never move its origin), `{PRIVACY_URL}` (BIZ-16), `{SUPPORT_URL_OR_EMAIL}`, `{WHATS_FREE_URL}`, `{POST_DATE}`, `{APP_VERSION}`, `{OWNER_OR_LLC_NAME}`, `{CHECK_DATE}`.
2. **Paste the "What's free" paragraph verbatim** from `planning/launch-copy/whats-free.md` (business manager, BIZ-18) into both store descriptions and the landing page, replacing the placeholder line.
3. **Re-run the claim check** (`app-store.md` §9) against that day's `index.html`. Change the copy if a threshold or feature moved.
4. **Re-count every field** (the one-line `node -e` in `app-store.md` §9). Any edit changes the counts.
5. **Shoot the screenshots** with the harness's store mode (`screenshots.md` §3–§4). Read every progression badge before captioning it.
6. **Re-check the limits and rules in each console and sidebar on the day**, especially the ones marked unverified below.
7. **Answer the age-rating and data-safety questions** as written (`app-store.md` §7, `google-play.md` §5), after the clinician review decides what ships.

## Limits and rules not fully verified (2026-11-08)

Apple's limits were checked on Apple's own pages: name 30, subtitle 30, promotional text 170, description 4,000, keywords 100 bytes, What's New 4,000, 6.9" screenshots 1320 × 2868 (or 1290 × 2796, 1260 × 2736), up to 10.

Not verified against the platform's own page (it wasn't reachable from this session, and the figures come from search results or third-party guides):
- **Google Play:** title 30 (one guide still says 50), short description 80, full description 4,000; screenshots 320–3,840 px with at most a 2 : 1 ratio, 1080 × 1920 recommended, 24-bit PNG with no alpha; feature graphic 1024 × 500; the reach of the "free"/"no ads" ban beyond the title; the health apps declaration; the closed-test requirement for new personal accounts.
- **Product Hunt:** tagline 60 and description 260 (Product Hunt's pages quoted in search; the launch guide says 500), gallery 1270 × 760 (third-party), thumbnail 240 × 240.
- **Reddit:** every subreddit rule was read through search results and unofficial mirrors. r/weightroom's self-promotion rule wasn't found at all, so the plan is to ask the moderators first.
- **Apple age rating:** the deadline history (reported as 31 January 2026, later moved) is third-party.
- **iPhone install from non-Safari browsers** (iOS 16.4 and later): not verified, so the landing page says Safari.

## Related backlog items

MKT-12 (comparison page), MKT-13 (launch posts), MKT-14 (landing page), MKT-16 to MKT-18 (the bib, "Your number", "Pin it on"), BIZ-07 (truthful metadata), BIZ-08 (the address on cards), BIZ-16 (privacy page), BIZ-18 ("What's free"). For the harness work the screenshots need, see `screenshots.md` §2 and §3: the `store-*` states, two fixture changes and a `--store` capture size. That belongs to whoever owns `tools/visual/`.
