# Landing page: platestep.app (MKT-14)

Owner: marketing-manager. Drafted 2026-11-08 against **v3.517**. Copy and section plan only. Building the page is MKT-14, which is `needs-owner` (one static file beside `index.html` is a structural change under CLAUDE.md).

**Preconditions, in order** (from `marketing.md` §4.3 and `alignment/marketing-manager.md` B2):
1. The owner buys `platestep.app` (and `platestep.com`). As of 2026-11-08 this is still on the owner's to-do list (`pitch.md`, second round).
2. **The app's own origin doesn't move.** localStorage and IndexedDB don't follow an origin change, so pointing a Pages custom domain at the app's repo would strand every installed copy's logs and photos. The landing page links *to* the app's current address; moving the app is a separate `needs-owner` item with an export-and-import path.
3. The privacy page (BIZ-16) exists, because the footer links to it.
4. The "What's free" wording is approved (BIZ-18, D9(a): yes, at launch).

**Build rules (from MKT-14):** one static HTML file, no framework, no analytics, no cookies (so no cookie banner), no third-party requests, the self-hosted Archivo the app already ships, and not precached by `sw.js`. The page must load and read well with JavaScript off.

---

## 1. Page head (SEO)

| Element | Copy | Length |
|---|---|---|
| `<title>` | `Platestep: tells you what to lift next` | 38 (keep under about 60) |
| `meta description` | `Pick a program and Platestep gives you the weight and reps for every set, logs it in one tap, and adds weight when you've earned it. No ads. No account.` | 152 (keep under about 160) |
| `og:title` / `og:description` | same as above | — |
| `og:image` | 1200 × 630, made from the bib card (MKT-16) once it ships; until then frame 2 of the storyboard (Gym mode, "Log 185×6") on the day's plate ink, with the Sash mark | — |
| Canonical | `https://platestep.app/` | — |
| Structured data | `SoftwareApplication`, `applicationCategory: "HealthApplication"`, `operatingSystem: "Web"` (add "iOS" and "Android" only once those listings are live), `offers: { price: "0", priceCurrency: "USD" }`. **No `aggregateRating`**: we have no ratings, and marking up ones we don't have is fake social proof | — |

Searches the page is written to answer (proposed in `marketing.md` §4.4, not measured): "workout app that tells you what to lift", "progressive overload app", "workout log no account", "workout tracker no ads", "strength training app offline". Each phrase appears naturally once in the body copy below; never as a keyword list.

---

## 2. Sections, top to bottom

### 2.1 Hero

- **Eyebrow:** the Sash mark and "Platestep".
- **H1:** Tells you what to lift next.
- **Sub (one sentence):** Pick a program and Platestep gives you the weight and reps for every set, logs it in one tap, and adds weight when you've earned it.
- **Facts line (small, under the sub):** No ads · No account · Your log stays on your phone
- **Primary button:** `Open Platestep` → the app's current address (`{APP_URL}`; never a new origin, see precondition 2).
- **Secondary link:** `How to put it on your home screen` → `#install`.
- **Image:** storyboard frame 1 ("Tells you what to lift next", `screenshots.md`), uncaptioned, at phone size. On wide screens it sits to the right of the text; on phones it follows the button.
- **Ground:** the Day 1 plate ink (red) behind the image, near-black page. That's Plate & Press's "day ink" doing the brand work (design-directions §5).

### 2.2 Proof 1: the next set, already planned

- **Heading:** Your next set is already there
- **Body:** Open it at the gym and the day's workout is waiting: every set has a target weight and reps, worked out from your program and your last few sessions. Warm-up sets and the plates for the bar are worked out too.
- **Image:** frame 2 (Gym mode, "Log 185×6").
- **Fine print:** none needed.

### 2.3 Proof 2: progress you earn, with the rules in plain sight

- **Heading:** It adds weight when you've earned it
- **Body:** Hit the top of your rep range two sessions in a row, and Platestep tells you to add weight next time. Fall below the range, and it tells you to go lighter. Grind at RPE 9 or above for three sessions without progress, and it suggests an easier week. Deload weeks are planned into every cycle. That's progressive overload, without the spreadsheet.
- **Second paragraph:** Every program names the research or coaching practice it's built on, and says so plainly when the evidence is thin.
- **Image:** frame 3 (the progression badge) beside frame 4 (a program's source line).
- **Why these exact rules:** they're the real thresholds in the code (`index.html:27505`, `27518`, `27532`), so a lifter who tests them finds the page was telling the truth. If the thresholds change, this section changes in the same release.

### 2.4 Proof 3: your log is yours

- **Heading:** No account. No ads. Your log stays on your phone.
- **Body:** There's nothing to sign up for. Your training log is stored on your phone, not on a Platestep server, and you can back up the whole thing to a file whenever you like and restore it on a new phone. Food searches go to USDA FoodData Central and Open Food Facts. If you add your own AI key, what you ask about goes to that AI provider, and only then.
- **Link:** `Read the privacy page` → `{PRIVACY_URL}` (BIZ-16).
- **Image:** frame 7 (Settings, backup).
- **Never shorten this** to "your data never leaves your phone": food search and optional AI do send requests.

### 2.5 What's free

- **Heading:** What's free
- **Body:** the "What's free" paragraph from `planning/launch-copy/whats-free.md` (being drafted by the business manager, BIZ-18), **pasted verbatim**. The same words appear in the README, the in-app note and both store descriptions, so none can drift. BIZ-18's test compares the app and the README; extend it to this page when MKT-14 is built.
- **Do not** add a price comparison, a countdown, a "founding member" urgency line, or any "limited time" wording here.

### 2.6 Install

Anchor `#install`. Two columns on wide screens, stacked on phones. Plain numbered steps, one short sentence each, with a small screenshot of the share or menu sheet beside steps 2–3 (shot on a real device, since the harness can't show browser chrome).

**iPhone**
1. Open `{APP_URL}` in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open Platestep from your home screen. It works offline from then on.

Note under the steps: *Install from the same address every time. Your log is stored for that address on this phone, so a copy added from a different link starts empty.*

(Other iPhone browsers have offered Add to Home Screen in their own share menus since iOS 16.4, per Apple's release notes as reported; not verified this session, so the page tells people to use Safari, which always works.)

**Android**
1. Open `{APP_URL}` in **Chrome**.
2. Tap the **⋮** menu.
3. Tap **Install app** (on some phones it's called **Add to Home screen**), then **Install**.
4. Open Platestep from your home screen or app drawer.

When the Play listing is live, add a third column: "Or get it on Google Play" with Google's official badge, used under Google's badge guidelines (a third-party mark, so the owner approves it with the listing).

### 2.7 Footer

- Sash mark · "Platestep"
- `Privacy` → `{PRIVACY_URL}` (placeholder until BIZ-16 ships)
- `What's free` → `#free`
- `Support` → `{SUPPORT_URL_OR_EMAIL}` (needed for the App Store listing too; the owner chooses an address that doesn't expose a personal inbox)
- `Changelog` → the app's What's New (optional)
- One line: *Platestep is a training log and planner, not medical advice.*
- `© 2026 {OWNER_OR_LLC_NAME}` (the owner is weighing an LLC, D9(f))
- **Not included:** social icons until those accounts exist; a GitHub link (the repo URL carries the owner's handle; the owner decides); any download count, rating or "as seen in".

---

## 3. What the page must not do

- No analytics, pixels, session replay, embedded videos from third-party hosts or web fonts from a CDN. Any measurement is `needs-owner` (`marketing.md` §5).
- No email capture at launch: it would need a server and a privacy basis. If the owner wants a waitlist later, that's its own `needs-owner` item.
- No competitor names on this page. Comparisons, if approved, live on their own page (MKT-12, `launch-posts.md` §6).
- No health claims, and none of the words "safe", "rehab" or "prevents".
- No fake urgency, scarcity or social proof.

## 4. Copy check

- Words checked for: "safe", "rehab", "prevent", "cure", "treat", "heal", competitor names. None in the copy above.
- Claims: every feature sentence is one from `app-store.md` §5, and is mapped to the code in `app-store.md` §9.
