# LLC naming: the parent company that owns Platestep

Written 2026-11-08 by the brand-naming lead (coordinator brief), against the live app named **Platestep** (v3.517). The owner lives in Florida and will form a **Florida LLC** as a **parent company**, since he may run more businesses later. Platestep will be a brand under it: a fictitious name (DBA) now, or later its own subsidiary LLC. The LLC will hold the App Store and Google Play accounts, `platestep.app` and `platestep.com`, the trademark, and the subscription revenue.

**This is not legal or tax advice, and none of the checks below is a clearance.**
- Name availability in Florida is decided only by the Division of Corporations when it accepts the filing.
- Trademark rights are decided by the USPTO and by prior use.
- A Florida business attorney or a CPA should look at the structure before filing.

---

## 0. The short answer

- **Structure: a parent LLC with Platestep as a registered fictitious name** (the owner has decided this; §1 sets out the trade-offs he's accepting).
- **Pick: Ironwright LLC.** Say it "IRON-right": iron (strength) plus wright (a maker, as in shipwright). It reads as a maker of solid things, so it suits any future business, not only fitness, and it ties back to the iron in Platestep.
  - No company, App Store developer, trademark or Florida record of that name turned up in any search.
  - `ironwright.com` is a parked page (registered 1999), so it's in use by someone.
  - `ironwrightholdings.com`, `ironwrightgroup.com` and `ironwright.llc` are unregistered.
- **Runner-up: Plumbstone LLC.** Plumb (true, upright, honest) plus stone (a foundation).
  - Nothing found under the name.
  - `plumbstoneholdings.com`, `plumbstoneco.com`, `plumbstonegroup.com` and `plumbstone.co` are unregistered. `plumbstone.com` is a spam page.
  - Its silent "b" and the plumbing reading make it the weaker of the two.
- **Platestep LLC stays the fallback**: the simplest choice if the owner ever decides one business is enough.
- **Sunbiz could not be queried from here.** It sits behind a Cloudflare challenge (403) and was blocked by the session's network. §4 gives the exact steps to check it yourself in about five minutes. **Do that before anything else.**

---

## 1. The structure question

| Question | "Platestep LLC" | Parent LLC (e.g. "Ironwright LLC") + Platestep as a fictitious name |
|---|---|---|
| **App Store seller name** | Shows "Platestep LLC". It matches the app. | Shows "Ironwright LLC". **Apple shows the legal entity as the seller, and doesn't accept DBAs, fictitious names or trade names for enrollment** ([Apple, Account Help](https://developer.apple.com/support/enrollment/)). The seller line can never read "Platestep" under a parent. |
| **Google Play developer name** | "Platestep" | Can still be "**Platestep**". Google says the public developer name can differ from the organization's legal name. The legal name and address come from the payments profile and D-U-N-S record, and Google displays them ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/13628312)). |
| **Does a seller/app mismatch hurt trust?** | No mismatch | **It's common, and I found no evidence it costs installs** (my judgement, not measured). Many apps are sold by studio or holding names. The real risk is a *suspicious-looking* mismatch: an unknown seller name on a health-adjacent app that asks for a subscription. To soften it, the App Store description, the in-app About screen, the privacy page and the receipt line all say "Platestep is a product of Ironwright LLC". Choose a parent name that sounds like a maker, not a shell. |
| **Trademark** | The LLC owns PLATESTEP; simple. | The parent owns PLATESTEP and licenses it to itself, so there's nothing extra to do. If Platestep later becomes its own subsidiary LLC, the mark is **assigned** to it in writing and the assignment recorded at the USPTO; the store accounts move with it. |
| **Future businesses** | Every new business sits under a fitness-named company, or needs a new LLC. Renaming later means amending the articles plus updating Apple, Google, D-U-N-S, the bank and the IRS. | The parent carries them all. One caution: liabilities share one entity unless each risky business gets its own subsidiary LLC. Ask counsel when a second business appears. |
| **Apple account migration later** | Moving to a parent later means transferring apps between developer accounts, which is possible but slow. Ratings stay; some services (e.g. iCloud containers) need care. | Done once, now. |
| **Privacy** | Same as the parent column | Florida's public record shows: the principal office's **street and mailing address** and the registered agent ([§605.0201(2)](https://www.flsenate.gov/Laws/Statutes/2025/605.0201)); and in every annual report, the name, title and **address of at least one person with authority to manage the company** ([§605.0212(1)(e)](https://www.flsenate.gov/Laws/Statutes/2025/605.0212)). A fictitious-name filing lists **each registrant's name and address** ([§865.09(3)](https://www.flsenate.gov/Laws/Statutes/2025/865.09)). Apple publishes trader contact details on EU product pages ([Apple, DSA](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-compliance-information)), and Google displays the legal address. **Use a commercial registered-agent service, and a business address that isn't home, for every one of these.** Confirm with Sunbiz which address types it accepts for the principal office. |
| **Cost and paperwork** | One LLC | One LLC plus one fictitious-name registration (with a newspaper notice and a 5-year renewal, §4.3) |

**Verdict.** The parent is right for an owner who expects more businesses, and that's this owner. **Platestep LLC would be better only if Platestep stays the one business**, because then the seller line matches the app and no fictitious name is needed.

---

## 2. Candidates and screening

**Checks, run 2026-11-08:**
- **Domains:**
  - `.com` via Verisign RDAP (calibrated: a nonsense name returns 404, a registered one 200).
  - `.co` via DNS-over-HTTPS NS lookups at `dns.google`. The .co registry has no RDAP in IANA's bootstrap, and rdap.org wrongly reported `google.co` and `amazon.co` as unregistered. In the DNS check, status 3 (NXDOMAIN) means not delegated. That's strong but not conclusive evidence the name is unregistered.
  - Holding variants checked the same way.
- **App Store sellers:** iTunes Search API with `attribute=softwareDeveloper` plus a plain term search, flagging sellers or developers that contain the name, and app titles that contain it.
- **Businesses:** **OpenCorporates refused the request** ("Invalid Api Token", HTTP 401; it now needs a key), so I used web searches instead, including Bizapedia, ZoomInfo, Companies House and Florida filing mirrors. I also fetched the live `.com` sites where reachable.
- **Trademarks:** web searches on justia, markinton, trademarkdir, gleanmark and uspto.report. **Not a USPTO clearance.**
- **Florida Sunbiz:** blocked (§4).

**The brief for the parent name:** strength, craft, honesty, plate or iron; must also suit unrelated businesses later; short; no health or medical claim. On the parent-company decision, names tied only to lifting ("plate", "knurl", "collar") were marked down.

| Name | .com | .co (DNS) | Holding variants | App Store | Business / trademark (web) | Verdict |
|---|---|---|---|---|---|---|
| **Ironwright** | taken 1999 (parked "Resources and Information" page) | delegated | `ironwrightholdings.com` free, `ironwrightgroup.com` free, `ironwrightco.com` taken, `ironwright.llc` NX | none | No company, Florida record or mark found. The IRON- field is crowded in fitness marks, none "-wright" | **PICK** |
| **Plumbstone** | taken 2004 (spam page) | NX | `plumbstoneholdings.com`, `plumbstoneco.com`, `plumbstonegroup.com` free, `.llc` NX | none | None found. Near: Plumstone Corporation Ltd (UK, Companies House), plumbing firms | **RUNNER-UP** |
| Fiveink | taken 2025 (redirect lander) | NX | holdings/co/group free | none | None found | Shortlist. The five plate inks story is good, but **"Five Ink" sounds like "Five Inc."**, an odd fit for an LLC name |
| Ferrous Labs | taken 2023 (site didn't answer) | NX | holdings/co/group free | none | None found | Shortlist. "Labs" suits software, less so other businesses |
| Spotink | taken 2006 | NX | holdings/co/group free | none | None found under that name; "The Ink Spot LLC" and other print shops exist | Shortlist, weak: reads as a print shop |
| Plumbright | taken 2005 | NX | holdings free, `plumbrightco.com` taken | none | Sounds like PLUMBRITE (a plumbing mark, dead) | Shortlist, weak: plumbing reading |
| Plumb & Iron | **free** | NX | — | none | None found | Shortlist, weak: reads as plumbing or hardware supply. Florida ignores "&"/"and" when comparing names |
| Ironmonger | taken 1998 | NX | — | Seller: Guild of Architectural Ironmongers (UK) | Reads as "hardware seller" | Out |
| Tareworks | taken 2026-08 | NX | free | none | **tareworks.com is a live software company (scrap-yard ERP)** | Out: same field (software) |
| Steadmark | taken 2017 | delegated | `steadmarkgroup.com` taken | none | **STEADMARK, serial 99815261, class 42, pending (SteadMark LLC, CA, filed 2026-05-11)** ([markinton](https://markinton.com/trademark/steadmark-99815261)) | Out |
| Ironleaf | taken 2014 | delegated | — | **"Ironleaf: Workout & Meal Plan"** | — | Out: a live fitness app |
| Truegauge | taken 2006 | delegated | — | "Truegauge: CPU, RAM & Battery" | — | Out |
| Fivefold | taken 1998 | delegated | — | Four "Fivefold" apps | — | Out: crowded |
| Collarworks | taken 2012 | NX | — | "CollarWorks- Routes & Invoices" | — | Out |
| Tarewell | **taken 2026-10-30** | NX | — | none | — | Out: someone registered it nine days ago |
| Tareline | taken 2026-06 | NX | — | none | — | Out: weak, and the .com was registered recently |
| Platewright | taken 2026-07 | NX | — | none | — | Out: tied to lifting only, and the .com was registered recently |
| Knurlworks | taken 2026-07 | NX | — | none | — | Out: machining reading, and hard to spell after hearing ("nurl") |
| Sashworks | taken 2003 | NX | — | none | — | Out: window-sash industry |
| Barwright | taken 2026-07 | NX | — | none | — | Out: pub reading |
| Plumbwork | taken 2010 | delegated | — | none | — | Out: plumbing |
| *Platestep (fallback)* | **taken 2026-11-08** (Porkbun nameservers, consistent with the owner's purchase) | NX | — | none (no seller or developer named Platestep) | None found, including Florida LLC and fictitious-name mirrors | Fallback |

**The eight shortlisted parent names:** Ironwright, Plumbstone, Fiveink, Ferrous Labs, Spotink, Plumbright, Plumb & Iron, plus the fallback Platestep LLC.

---

## 3. Recommendation

**Ironwright LLC.**
- "Iron" carries strength, and "wright" carries craft: a maker who builds things that last. It suits a software studio, a gym, a property business or a consultancy equally well.
- It's honest, plain English, with no claim attached and no health or medical words.
- It sits naturally above Platestep: "Platestep, made by Ironwright".
- **Evidence:** no company, App Store seller or trademark under the name in any search, and no Florida record in web-indexed mirrors.
- **Domains:** `ironwrightholdings.com`, `ironwrightgroup.com` and `ironwright.llc` are unregistered. `ironwright.com` is parked, so it might be buyable, but don't depend on it.
- **Risks:**
  - "Ironwright" could be written "Ironright" after hearing it once. That matters less for a seller name than for an app.
  - The IRON- family is crowded in fitness trademarks. Since the parent isn't the consumer brand, that's acceptable.
  - Sunbiz is unchecked.

**Runner-up: Plumbstone LLC.**
- It's the most "honest" name: a plumb line is the builder's test of true.
- It has the cleanest domain options (three holding variants and `.co` all unregistered).
- It loses on the silent "b" (heard as "Plumstone", and a UK Plumstone Corporation exists) and on a plumbing reading in Florida, where plumbing firms crowd "Plumb-" names.

**Is Platestep LLC the better simple choice?** Only if the owner drops the plan for more businesses. For one business it's simpler: matching seller name, no fictitious name, no newspaper notice. Since the owner has chosen a parent, it's the fallback.

---

## 4. Florida name rules and the Sunbiz check

### 4.1 What the statute says
From the [Florida Statutes, §605.0112](https://www.flsenate.gov/Laws/Statutes/2025/605.0112), read 2026-11-08:
- **(1)(a)** The name must contain "limited liability company", "L.L.C." or "LLC". So: **"Ironwright LLC"**.
- **(1)(b)** It must be **distinguishable on the Division's records** from every other entity or filing on file. Fictitious names, general partnerships and LLP statements are exempt from this comparison. These differences **don't count** as distinguishing:
  1. a suffix;
  2. "a", "an" or "the";
  3. "and" or "&";
  4. singular, plural or possessive forms;
  5. punctuation or symbols.

  So "Ironwright LLC", "The Ironwright, Inc." and "Ironwrights LLC" all collide. Whether an extra word like "Holdings" makes a name distinguishable isn't spelled out; the Division decides at filing. An indistinguishable name can be used only with the other entity's written consent, filed at registration, and never if it's identical.
- **(1)(c)** The name can't imply a purpose the LLC isn't authorized for.
- **(1)(d)** It can't imply a connection with a state or federal agency, or with a federally chartered corporation.
- **(5)** Filing a name gives notice only, and **creates no ownership** beyond common law. Trademark rights are separate.
- **Restricted words:** under [§655.922(2)(a)](https://www.flsenate.gov/Laws/Statutes/2025/655.922), only authorized financial institutions may use "bank", "banc", "banco", "banque", "banker", "banking", "trust company", "savings and loan association", "savings bank", "credit union" or similar words. None of the candidates uses one. Other professions (insurance, for example) have their own chapters, which I didn't read; avoid regulated-profession words.
- **Name reservation:** I found no name-reservation provision in the Chapter 605 sections I read, and Sunbiz was unreachable. **I couldn't confirm whether Florida offers LLC name reservation**; check on Sunbiz. In practice, filing the articles promptly after the check is the protection.

### 4.2 Exact steps to check names on Sunbiz (about 5 minutes)
1. Go to **https://search.sunbiz.org/Inquiry/CorporationSearch/ByName** ("Search Records" → "Search by Entity Name" on sunbiz.org).
2. Type the name **without** any suffix or article: `Ironwright`. Then search `Iron Wright`, then `Ironwrights`.
3. Results list alphabetically from the closest match. Look at the names just above and below. **Any entity, active or inactive,** whose name differs only by a suffix, article, "and"/"&", plural or possessive, or punctuation is a collision. The statute says "on file"; whether inactive or dissolved names still block is the Division's call, so treat them as blocking.
4. Repeat for `Plumbstone` and `Plumb Stone`, and for `Platestep` and `Plate Step`.
5. **Check the fictitious-name register for "Platestep":** sunbiz.org → Search Records → **"Fictitious Name Search"** (by name) → `Platestep`, then `Plate Step`. Fictitious names don't block an LLC name (§605.0112(1)(b)), and registering one gives no exclusive rights ([§865.09(8)](https://www.flsenate.gov/Laws/Statutes/2025/865.09)). An existing "Platestep" registration would still be a warning sign about prior use.
6. Write the date and the result into this file.

### 4.3 Registering "Platestep" under the parent (fictitious name)
From [§865.09](https://www.flsenate.gov/Laws/Statutes/2025/865.09):
- **When:** you may not do business under a fictitious name until it's registered with the Division.
- **The filing lists** the name, the business's mailing address, and each registrant's name and address. **An LLC registrant must already be registered and active in Florida**, and must give its Florida document number and its EIN, if it has one. So the order is: form the LLC, get the EIN, then file the fictitious name.
- **Newspaper notice:** a registrant must certify that the intention to register was **advertised at least once in a newspaper in the county of the principal place of business**.
- **Term:** valid through December 31 of the 5th calendar year, then renewable for 5-year periods.
- **Rights:** registration gives no exclusive rights and doesn't reserve the name against future use.
- **Penalty for not registering:** the business can't maintain a lawsuit in Florida courts until it complies (§865.09(9)), plus other penalties.
- **Fees:** third-party sites say $50; that's not verified from an official source, so check Sunbiz.

---

## 5. Next steps, in order (each is needs-owner)
1. **Sunbiz name check** (§4.2) for Ironwright; if it's taken, Plumbstone; and the fictitious-name search for Platestep.
2. **USPTO knockout** for IRONWRIGHT (all classes, focusing on 9, 35, 41 and 42) and, more importantly, for **PLATESTEP**. Platestep's own clearance is still outstanding from `naming.md` §5.
3. **Name reservation:** optional, if Sunbiz offers it (unconfirmed, §4.1). Otherwise file promptly.
4. **Form the LLC:** articles of organization on Sunbiz. They need the name, the principal office's street and mailing addresses, and a registered agent with a written acceptance (§605.0201). **Use a registered-agent service and a business address** to keep a home address off the public record. Then the operating agreement (counsel).
5. **EIN** from the IRS: free, online, issued at once. Don't pay a third party for it.
6. **Fictitious name "Platestep"** for the LLC (§4.3): newspaper notice first, then file with the Florida document number and EIN.
7. **D-U-N-S number** for the LLC. Apple and Google both verify organizations through it. The legal name and address must match Sunbiz exactly, and Google takes the legal details from the D&B profile. Apple offers a free D-U-N-S lookup and request path during enrollment, and issuance can take days.
8. **Business bank account** in the LLC's name (the fictitious name can be added for "Platestep" receipts).
9. **Store accounts as the LLC:** Apple Developer Program as an organization (it needs the D-U-N-S, legal authority to bind the LLC, and a company-domain email such as `@platestep.app`). Google Play as an organization, with the developer name "Platestep".
10. **Move assets into the LLC:** transfer the `platestep.app` and `platestep.com` registrations to a registrar account the LLC owns. File PLATESTEP in the LLC's name, if the knockout is clean.
11. **Say who makes it:** add "Platestep is a product of Ironwright LLC" to the store description, the privacy page and the in-app About screen. That's a later app change, shipped as its own version, and not part of this document.

---

## 6. What couldn't be verified
- **Sunbiz (Florida Division of Corporations): not checked.** `search.sunbiz.org` returned a Cloudflare challenge (HTTP 403) to curl, and the session's network blocked it entirely. No Florida availability is claimed for any name. The "no Florida record found" notes come from web-indexed mirrors only.
- **OpenCorporates:** the API returned 401 ("Invalid Api Token"). Company checks are web searches only.
- **USPTO:** not queried directly. The trademark notes come from aggregators, and they are not a clearance.
- **`.co` domains:** checked by DNS delegation, not RDAP or WHOIS. A registered but undelegated `.co` would show as NXDOMAIN.
- **Websites:** `ferrouslabs.com` couldn't be reached.
- **Florida name reservation and current fees:** not confirmed from an official source.
- **Insurance-type and other restricted words** outside chapter 655: not read.
- **Google Play's DSA trader display:** Google's exact current rule wasn't found. The Play facts above come from its developer-account help page.
- **Trust effect of a seller/app mismatch:** my judgement; no study was found.

---

## 7. JdaBeast options (2026-11-08)

The owner asked to consider parent names built on his handle, **JdaBeast**; his GitHub account is `JdaBeast5`. The structure is unchanged: a Florida parent LLC with Platestep as a fictitious name, and possibly a subsidiary later.

**Method** (same as §2, run 2026-11-08):
- **Domains:** `.com` via Verisign RDAP; `.co` via DNS-over-HTTPS (NXDOMAIN means not delegated).
- **App Store:** iTunes Search API, both `attribute=softwareDeveloper` and plain term, for `jdabeast`, `jda beast`, `j da beast`, `jdabeast5`, `jdb holdings`, `jdb studios` and `jda holdings`.
- **Companies and trademarks:** web searches; OpenCorporates still needs an API key.
- **Social handles:** each profile URL compared with a nonsense handle as a baseline.
- **Sunbiz:** still blocked; the steps are below.
- **Not a clearance.**

### 7.1 Variants and evidence

| # | Name | .com | .co | App Store seller or developer | Companies / trademarks (web) | Verdict |
|---|---|---|---|---|---|---|
| 1 | JdaBeast LLC | `jdabeast.com` **free** | NX | none (searches return JD Sports, unrelated) | No company or person found under "JdaBeast", "JDA Beast" or "jdabeast5". No JDABEAST mark found | Usable, see §7.2 |
| 2 | JdaBeast Labs LLC | `jdabeastlabs.com` free | NX | none | none found | Usable. "Labs" next to an app with clinical programs hints at a laboratory |
| 3 | **JdaBeast Studios LLC** | `jdabeaststudios.com` free | NX | none | none found | **Best of the handle options** |
| 4 | JdaBeast Holdings LLC | `jdabeastholdings.com` free | NX | none | **Echoes "Beast Holdings, LLC"**, which holds BEAST GAMES and BEAST LINE marks in class 9. It's associated with MrBeast (my knowledge; confirm in TSDR) | Avoid: the closest echo of the biggest BEAST owner |
| 5 | JdaBeast Ventures LLC | `jdabeastventures.com` free | NX | none | none found | Usable. "Ventures" reads as investing |
| 6 | JdaBeast Works LLC | `jdabeastworks.com` free | NX | none | none found | Usable |
| 7 | JDA Beast LLC (styled) | as #1 | NX | none | **"JDA" is JDA Software**, now Blue Yonder (supply-chain software). A JDA class 9 word mark shows as cancelled on one aggregator, but Blue Yonder pages still call "JDA" its trademark ([trademarkdir](https://trademarkdir.com/owner/jda-software-group-inc), [Business Wire](https://www.businesswire.com/news/home/20200211005664/en/JDA-Software-Announces-Company-Name-Change-to-Blue-Yonder)) | Avoid the spaced "JDA" styling |
| 8 | JDB Holdings LLC | `jdbholdings.com` **taken 2015** | NX | none (DBS and JD Bank apps only) | Florida mirrors show **Jdb 2, LLC; Jdb 4, LLC; Jdb 8, LLC** (Lady Lake) and JDBC Holdings Inc. (Key Largo). Several JDB marks are on file (markinton 85336442, 98328533, 99581323) | Weak: crowded initials, nothing to own |
| 9 | JDB Studios LLC | `jdbstudios.com` free | NX | none | JDB Media LLC (AZ) and JDB Marketing exist | Weak: initials carry no meaning |
| 10 | JDA Holdings LLC | `jdaholdings.com` **taken 2012** | NX | The search surfaces Blue Yonder (ex-JDA) | JDA Software, as #7 | Out |

**The BEAST family** (web, aggregators), which matters for any "…Beast" name:
- Beast Holdings, LLC: BEAST GAMES and BEAST LINE, class 9.
- Beast Industries LLC: BEASTLY, class 9, registered.
- BODY BEAST: a Beachbody fitness programme.
- BEAST MODE.
- BEAST HQ Ltd: a live BEAST mark for gym and personal-training services, class 41.
- A pending BEAST application in classes 9 and 42 (Biomechanics Consulting and Research LLC), with a final refusal on 2026-04-29.
- Sources: [markinton BEAST MODE](https://markinton.com/trademark/beast-mode-99400871), [BODY BEAST](https://markinton.com/trademark/body-beast-85068277), [BEAST GAMES](https://markinton.com/trademark/beast-games-97884438), [justia BEAST 98132827](https://trademarks.justia.com/981/32/beast-98132827.html).

**Handles** (baseline: a nonsense handle returns 404 on YouTube and X):
- **YouTube `@jdabeast` exists** (an empty channel titled "jdabeast"; owner unknown).
- **X `@jdabeast` exists** (owner unknown).
- TikTok returns 200 even for nonsense handles, so it couldn't be judged. Instagram redirects to login.
- GitHub user lookups are blocked in this session.
- If those two accounts aren't the owner's, the bare handle isn't his on two major networks. That may be why GitHub has the "5".

**Sunbiz steps for these names:** as §4.2. Search by entity name for `JdaBeast`, `Jda Beast`, `JDA Beast`, `JdaBeast Studios`, `JDB Holdings` and `JDB Studios`. Capital letters and spaces don't make a name distinguishable in practice: treat `JdaBeast` and `JDA Beast` as one name. Look at the alphabetical neighbours of each result.

### 7.2 Honest assessment of a handle-based parent name

| Test | JdaBeast (best form: JdaBeast Studios LLC) | Ironwright LLC |
|---|---|---|
| **App Store seller line** | Every product page reads "Seller: JdaBeast Studios LLC" beside a Health & Fitness app that includes rehab, prenatal and postpartum, hypertension and seniors programs. "Beast" says extreme, bro training: the opposite of the plain, evidence-cited voice (PRODUCT.md) and the careful trainee the clinical programs serve. To a stranger deciding whether to trust a subscription, it reads as a personal gamer tag. | Reads as a maker. Neutral to positive beside clinical content. |
| **Spell after hearing once** | Poor. Heard as "Jay the Beast", "JD Beast", "Jay Da Beast" or "J.D.A. Beast", with no way to tell the capitals or spacing. | Fair. The main slip is "Ironright". |
| **Unrelated future businesses** | Works for a creator or media business; awkward for property, consulting, B2B or anything formal. | Works across almost anything. |
| **Privacy** | Ties the LLC's public Florida record (principal address, plus a manager's name and address in each annual report, §605.0212) to his public handle. Anyone who knows the handle can find the filing, and the reverse. The `github.io` address already shows `JdaBeast5`, but the plan (marketing.md §4.3) is to replace it with `platestep.app` on everything public. A JdaBeast LLC would make the link permanent on every store page and receipt. | No link to the handle. The manager's name is still public in Florida, as it is for any LLC. |
| **Trademark strength** | JDABEAST as a whole is distinctive (a coined compound). But it sits in a crowded, high-profile BEAST field, with large class 9 owners and fitness-class registrations, so any filing in fitness classes invites an objection. A parent name doesn't need a mark of its own (the mark that matters is PLATESTEP), so this is a secondary point. | IRON- is crowded in fitness, but IRONWRIGHT itself had no hits. Also secondary, for the same reason. |
| **Domains** | Every `jdabeast*.com` and `.co` is unregistered: the strongest domain position of any parent candidate so far. | `.com` parked; holdings and group `.com` free. |

### 7.3 Recommendation
- **The best JdaBeast option is "JdaBeast Studios LLC".** "Studios" frames the handle as a maker of apps and media. Its `.com` and `.co` are unregistered. It avoids the "Beast Holdings" echo (#4), the JDA Software collision (#7, #10) and the faint laboratory hint of "Labs" next to clinical programs (#2).
- **I would not choose it over Ironwright.** It fails on the seller line beside clinical programs, on spelling after hearing, and on privacy. Those are the three tests that matter most for a company that sells a health-adjacent subscription to strangers. Its domains are its only clear win.
- **If the owner wants the handle in the business anyway,** keep the parent as Ironwright LLC. Register "JdaBeast" as a second fictitious name of the parent for any creator or social-media work. That keeps the handle off the App Store seller line and off the main company record. The fictitious-name filing still lists the registrant's address (§865.09(3)), so the link exists in the fictitious-name records, just not on store pages.
- **If he chooses JdaBeast Studios LLC regardless:** run the Sunbiz and USPTO checks above, confirm he owns or can get `@jdabeast` on YouTube and X, and still put "Platestep" as the Google Play developer name, which Google allows. Apple will show the legal name whatever he does.

**What couldn't be verified (beyond §6):**
- Who owns `@jdabeast` on YouTube and X.
- TikTok and Instagram handles.
- GitHub (blocked in this session).
- Sunbiz, for every name in this section.
- Whether "Beast Holdings, LLC" is MrBeast's company: my knowledge; confirm in USPTO TSDR.
- The live status of the JDA mark.
