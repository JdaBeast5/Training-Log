# Platestep privacy policy (draft)

> **Draft for the owner. This is not legal advice.** Have counsel review this page before public launch (BIZ-16). Everything in square brackets is a placeholder the owner fills in. Nothing here invents a company, an address or a legal basis.
>
> Written against **Platestep v3.517** (`index.html` `APP_VERSION` and `sw.js` `VERSION`, both `3.517`), branch `Branch-1` at `0868e23`. Every claim below cites the line that makes it true. If the code changes, this page must change with it; BIZ-16's test (`test-privacy-policy-hosts.js`) is meant to catch drift.

---

**Who we are:** Platestep is made by [OWNER'S LLC, legal name and registered address]. Questions about privacy: [CONTACT EMAIL OR FORM].
**Effective date:** [DATE OF PUBLICATION]

## The short version

- **Your training log stays on your phone.** Workouts, food, body weight, sleep, measurements, photos, pain check-ins and health conditions are saved in your browser's storage on this device. We don't run a server that receives them.
- **No accounts.** You type a profile name, and it is stored only on the device. There's no sign-up, no email and no password.
- **No ads, no analytics, no tracking.** The app contains no advertising, analytics, crash-reporting or tracking code, and no third-party cookies.
- **A few features talk to outside services, and only when you use them:** food search (USDA), barcode lookup (Open Food Facts), supplement search (NIH), the barcode-scanner library (jsDelivr or unpkg), and the AI features (Anthropic, with your own key). Each one is listed below, with what it sends and when.
- **You can export everything, and you can delete everything,** from Settings.

## What stays on your device

Everything you log is saved in this browser's own storage for this site: `localStorage`, under keys namespaced to your profile (`window.storage`, built at `index.html:9682`), and progress photos in IndexedDB. The app has no server of its own that receives this data.

- **Profiles are for sharing one device, not for security.** Anyone who can open the app on your phone can switch profiles and see their data.
- **Your API keys are stored on the device too.** If you add an Anthropic key or a personal USDA key, it's saved in the same storage (`ai-api-key`, `index.html:41753`; `usda-api-key`, `index.html:35133`). It's sent only to the service it belongs to.
- **Progress photos are never uploaded** unless you choose "Compare with AI" and confirm (`index.html:6544`, confirmation at `index.html:38935`).
- **Cycle tracking never leaves the device.** No feature sends cycle data anywhere (`index.html:6571`; checked against every AI request builder).

## When the app contacts other services

The app contacts outside services only in the situations below. In each case it sends only what the service needs to answer. Your device's IP address and ordinary browser details (such as the user agent) reach any server your phone talks to; that's how the internet works, and it isn't something the app adds.

### 1. Anthropic (AI features), only with your own key

Platestep's AI features call Anthropic's API **directly from your phone with the API key you entered** (`index.html:41989`). Nothing passes through a Platestep server, because there isn't one. If you never add a key, the AI features never send anything.

Your use of the API is governed by your own agreement with Anthropic, under your own key: [LINK TO ANTHROPIC'S COMMERCIAL TERMS AND PRIVACY POLICY, OWNER TO CONFIRM]. We don't control or see what Anthropic receives.

What each feature sends, and when:

| Feature (where you find it) | When it sends | What it sends |
|---|---|---|
| **Saving your key** (Settings, AI Features Setup) | When you tap Save key | Only the key, to check that it works (`/v1/models`, `index.html:42137`) |
| **Coach chat** (the coach button, and the Coach tab) | Each message you send | Your last 10 messages, plus a summary of your training: goal, program, streak, body-weight trend, waist and arm trend, training-load signal, average food intake and targets, diet preference, restrictions and foods you avoid, any calorie-deficit warning showing, average sleep and water, your most recent pain check-in (date and worst level), your top 3 PRs and today's session (`index.html:42675`–`42880`, sent at `43007`) |
| **Cross-Metric Insights** (Analysis, "Generate insights") | When you tap the button (a repeat with unchanged data reuses the saved answer and sends nothing) | Goal and program; up to 16 body-weight entries; daily calories and protein for your last 10 logged days, with dates; nightly sleep with dates; average water; weekly average effort (RPE); recent training days with dates; up to 10 pain check-ins (date, level, body area, exercise, sensation); your top 5 PRs (`buildCrossMetricInsightsContext`, `index.html:42437`; sent at `42631`) |
| **Weekly check-ins** (Today, "Save this week & start fresh") | **Automatically, when you save the week, if a key is saved** | The week's program, goal, workouts logged, average body weight, average calories and target, average sleep and training-load signal; plus, for the nutrition digest, diet preference and restrictions, days logged, and average calories, protein, fat, carbs and water with targets (`index.html:45295`, `45345`, called at `45445`–`45446`) |
| **Session-complete note** (Today) | **Automatically, once a day, when you finish a session, if a key is saved and your training load shows signs of overreaching** | A fixed request and your program's coaching style. No logged numbers (`index.html:26240`–`26261`) |
| **Photo** (Food, "Snap a Meal") | When you choose photos | The meal photos (`index.html:42260`–`42284`) |
| **Scan a nutrition label** (Food, custom food) | When you choose a photo | The label photo (`index.html:37985`–`38002`) |
| **Describe** (Food) | When you submit | The text you typed (`index.html:36565`–`36582`) |
| **Recipes** (Food) | When you search | What you asked for, diet preference, restrictions, foods you avoid, and the calories and macros you have left today (`index.html:35424`–`35466`) |
| **Compare with AI** (Progress photos) | After you pick two photos and confirm | Those two photos (`index.html:38946`–`38971`) |
| **Form feedback** (Coach, upload a video) | When you upload a clip | 8 still frames taken from the video on your phone (the video itself isn't uploaded), the exercise name, the app's previous review of that exercise, and any body areas you've marked as resting (`index.html:43833`, `43860`–`43880`) |
| **Adapt today's workout** (Today) | When you submit | Today's planned exercises and the limit you typed, such as "only dumbbells" (`index.html:37877`–`37902`) |
| **Swap advice on a resting area** (an exercise that loads an area you marked as resting) | When you tap the AI button on that exercise | The exercise, the app's suggested swap, and your latest pain check-in for that area: level, area, exercise, sensation and your own note (`index.html:29300`–`29323`) |
| **Supplement recommendations** (Coach) | When you tap Get recommendations | Your goal, physique goal text, program, diet preference, restrictions, foods you avoid, **any health conditions you flagged in your profile** (for example pregnancy, high blood pressure or diabetes), and your question (`index.html:43373`–`43437`) |
| **Supplement insight** (My Supplements, supplement search) | When you tap Get AI insight or Preview AI insight | The product name and the ingredients on its label (`index.html:36112`–`36125`) |

Your name, age, sex, height and profile name are not part of any AI request.

### 2. USDA FoodData Central (food search)

- **When:** only when a food search finds nothing in the app's own library and you tap **Search USDA database for "…"** (`index.html:37281`–`37284`).
- **What:** the search words, plus the API key: either the public `DEMO_KEY` or your own free USDA key if you saved one (`index.html:35047`, `35050`–`35055`, request at `35140`–`35143`).
- Any food you add from the results is saved to My Foods on your phone, so that food is never looked up again.

### 3. Open Food Facts (barcode lookup)

- **When:** after you scan a barcode that isn't already in your My Foods (`index.html:35340`–`35349`).
- **What:** the barcode number only (`index.html:35166`–`35168`). The camera image is read on your phone and is never sent.

### 4. NIH Dietary Supplement Label Database (supplement search)

- **When:** only when you tap **Search supplement database for "…"** (`index.html:36236`).
- **What:** the search words (`index.html:35797`–`35801`).

### 5. jsDelivr or unpkg (barcode-scanner code)

- **When:** the first time you tap **Barcode** in a session. The app downloads the open-source ZXing scanner library from `cdn.jsdelivr.net`, or from `unpkg.com` if that fails (`index.html:35228`–`35233`, called at `35280`).
- **What:** an ordinary download request. No logged data, and no barcode.

### 6. The site that hosts the app

- **When:** when you open or update the app, your phone downloads the app's own files (the page, its scripts, fonts and icons) from the site that serves Platestep: [HOSTING PROVIDER AND ADDRESS, currently GitHub Pages; OWNER TO CONFIRM AT LAUNCH]. The built-in update check asks the same site for the current version (`sw.js:254`, `sw.js:328`, `sw.js:356`; `index.html:46196`, `46209`).
- **What:** ordinary file requests. No logged data.
- Fonts are served from the same site, not from a font service (`sw.js:202`). The offline cache stores only the app's own files and passes every request to other services straight through, without saving it (`sw.js:309`–`314`).

### Links you choose to open

Some buttons open another website in your browser. The app sends nothing to that site itself; your browser just opens the address.

- **"Watch form video"** opens a YouTube search for the exercise (`index.html:13280`, `15054`, `28380`, `31580`, `44141`, `44166`).
- **Recipe links** open a Google search for the recipe name (`index.html:35421`).
- **Research citations** open the paper's DOI page at doi.org (`index.html:15283`).
- **Share** on a celebration card hands an image to your phone's share sheet, and you choose where it goes (`index.html:29634`).

## What we don't do

- No advertising, and no advertising identifiers.
- No analytics, crash reporting, session recording or tracking pixels.
- No accounts and no sign-in.
- No selling or sharing of your data. We never receive it in the first place.
- No server of our own that stores your logs.

## Export your data

Settings → **Export my data (backup as JSON)** (`index.html:6244`) downloads one file containing everything stored for the current profile, including progress photos (`index.html:34170`–`34245`). You can restore it with **Import backup** (`index.html:6245`) on any device, or open it in any text editor.

**Keep the backup file private.** It contains everything you've logged, and **if you saved an Anthropic or USDA key, the key is in the file too**, because the export copies every stored item (`index.html:34174`–`34186`). Treat it like a password.

## Delete your data

- **Everything, for one profile:** Settings → **Delete all my data (this profile, permanently)** (`index.html:6252`). After two confirmations it deletes every stored item for that profile, including progress photos, then reloads (`index.html:34362`–`34418`). There's no undo, and we can't recover it, because we never had a copy.
- **One item at a time:** individual workouts, foods, photos and log entries can each be deleted where they appear.
- **The whole app:** removing the app from your home screen, or clearing this site's data in your browser settings, deletes everything it stored on the device.
- **What deletion can't reach:** backup files you exported, images you shared, and anything already sent to the services above. Requests sent to Anthropic with your key are covered by your own agreement with Anthropic.

## Children

[OWNER AND COUNSEL TO DECIDE: minimum age statement and store age rating. The app doesn't ask for age verification.]

## Changes to this policy

If a future version sends anything new anywhere, this page will say so before that version ships, and the in-app What's New will mention it. [OWNER TO CONFIRM HOW CHANGES ARE ANNOUNCED.]

## Contact

[OWNER'S LLC LEGAL NAME]
[CONTACT EMAIL OR FORM]
[POSTAL ADDRESS, IF COUNSEL ADVISES ONE]

---

## Evidence table: every outbound host (for reviewers, not the public page)

Inventory method: every `http(s)://` host literal in `index.html`, `sw.js`, `manifest.json` and the three `content-*.js` files, plus every `fetch(`, `<script src>`, `sendBeacon`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `import(`, `new Image(`, `navigator.share` and `window.open` call in `index.html`. The only other host literal is `http://www.w3.org` (an SVG namespace string, which is never contacted). `sw.js` contains no host literals and passes cross-origin requests through untouched (`sw.js:314`).

### The app contacts

| Host | Trigger | Data sent | Evidence (file:line) |
|---|---|---|---|
| `api.anthropic.com` (`/v1/messages`) | The user taps an AI feature, with a saved key. Two features send **without a tap on an AI control**: the weekly check-ins (on "Save this week & start fresh") and the session-complete note (on the last set of a session, only if overreaching). | The user's key in the `x-api-key` header; per-feature data as in the table above (health categories: body weight, food intake, sleep, water, RPE, pain check-ins, PRs, body measurements, flagged health conditions, meal, label and progress photos, video frames) | `index.html:41989` (request); callers `26261`, `29323`, `35466`, `36125`, `36582`, `37902`, `38002`, `38971`, `42284`, `42631`, `43007`, `43437`, `43880`, `45329`, `45378` |
| `api.anthropic.com` (`/v1/models`) | The user saves a key | The key only | `index.html:42137`, called at `42166` |
| `api.nal.usda.gov` | The user taps "Search USDA database for …" after a local miss | Search text; `api_key` (`DEMO_KEY` or the user's own) | `index.html:35047` (`USDA_API_BASE`), `35050`–`35055`, `35140`–`35143`; trigger `37281`–`37284` |
| `world.openfoodfacts.org` | A barcode is scanned that isn't already in My Foods | Barcode number | `index.html:35166`–`35168`; trigger `35340`–`35349` |
| `api.ods.od.nih.gov` | The user taps "Search supplement database for …" | Search text | `index.html:35797` (`DSLD_API_BASE`), `35799`–`35801`; trigger `36236` |
| `cdn.jsdelivr.net` | First Barcode tap in a session | A plain script download (`@zxing/browser@0.1.5`), no app data | `index.html:35232`, loader `35228`–`35254`, called at `35280` |
| `unpkg.com` | Only if jsDelivr fails | Same as above | `index.html:35233` |
| The app's own origin (currently GitHub Pages) | App load, service-worker install and update, Diagnostics freshness check | Requests for the app's own files only | `sw.js:247`, `254`, `328`, `356`; `index.html:46196`, `46209` |

### Links the user opens (the app contacts nothing)

| Host | Where | Evidence (file:line) |
|---|---|---|
| `www.youtube.com` | "Watch form video" (search for the exercise name) | `index.html:13280`, `15054`, `28380`, `31580`, `44141`, `44166` |
| `www.google.com` | Recipe search link | `index.html:35421` |
| `doi.org` | Research citation links | `index.html:15283` |

Plain-text mentions only, not links: `console.anthropic.com` (`index.html:6626`) and `fdc.nal.usda.gov/api-key-signup` (`index.html:35120`).

### Not contacted

There's no analytics, ads or crash-reporting host anywhere in the shipped files. There's no font CDN: fonts moved to `./fonts/` in v3.270 (`sw.js:202`).

### Discrepancies found while writing this (flag for the owner; not fixed here)

1. **Health conditions are labelled "stored only on this device"** (`index.html:6211`), but Supplement recommendations sends the flagged conditions to Anthropic (`index.html:43387`–`43391`). The label is true of storage but reads as "never sent". BIZ-06's per-entry-point disclosure should cover Supplement recommendations, and the label could add "...and sent to Anthropic only if you ask for AI supplement recommendations".
2. **The form-feedback note says "Your clip goes straight to Anthropic"** (`index.html:6969`). What's actually sent is 8 still frames extracted on the phone (`index.html:43833`). The note overstates what leaves the device; it's not a privacy leak.
3. **The JSON backup contains the user's API keys** (`ai-api-key`, `usda-api-key`), because the export copies every stored key (`index.html:34174`–`34186`). The privacy page says so. A build item could leave keys out of the export, or warn about them at export time. That changes what the backup contains, so it's an owner decision.
4. **Two AI calls fire without a tap on an AI control** (weekly check-ins, session-complete note). Both are disclosed above. BIZ-06 should name them in the key prompt, because they have no entry-point button to carry a disclosure line.
5. **The barcode library loads without Subresource Integrity** (`index.html:35243`, the script tag has no `integrity` attribute), as already noted in `planning/alignment/business-manager.md` §3. This isn't a privacy-page claim, but counsel may ask about it.
