# What's free (public copy for BIZ-18)

> Source: BIZ-27's paragraph (`planning/monetization-2026-11.md` §3.6), adopted by the owner on 2026-11-23 ("1-6 yes"), with the paid tier named **Platestep Plus** ("Call it Plus"). `{name}` is filled from `APP_NAME = 'Platestep'`. It replaces the 2026-11-07 paragraph, which the owner had approved for launch under D9(a) and which was never published. Marketing owns tone (marketing.md §2); this file owns the facts, and the facts must not drift.
>
> **Not legal advice.** This is a public consumer promise, so counsel should read it together with privacy.md before launch.

## The paragraph (use exactly this text)

Platestep is free to use, with no ads, ever. Everything in the app when it launched stays free forever with no limits: logging, every built-in program with its progression, your full history and charts, food logging, health tracking, safety guidance, and backing up or exporting your data. We may fix or retire a feature for safety, but we will never put a free feature behind a payment. An optional membership, Platestep Plus, pays for Platestep's development and adds new extras on top, like coaching notes for your program, new programs before everyone else (they then join the free library), and later AI coaching without your own key and cloud sync. Anyone who trained with Platestep before Platestep Plus launched gets a founding price for as long as they stay a member, and anyone who can't afford it can ask for a free membership. Coaches may one day pay to manage clients or sell programs they wrote; their clients keep everything above for free.

## Where it goes

| Surface | Item | Note |
|---|---|---|
| Settings, near the privacy link | BIZ-18 | As a short note, `#whatsFreeNote`, under a "What's free" heading |
| `README.md`, "What's free" section | BIZ-18 | BIZ-18 criterion 2 requires the Settings note and the README paragraph to match exactly (after normalising whitespace). Paste it byte for byte. |
| Landing page | MKT-14 | Same paragraph |
| Store listing, long description | Phase 5 | Same paragraph, or the paragraph's first sentence plus a link to the landing page |
| Privacy page | BIZ-16 | One line linking here (business.md §3.4 names the privacy page as an announce surface) |

## Rules the text must keep (from BIZ-18, BIZ-27 and business.md §3)

1. **It contains no price, no currency symbol, no digit and no date** (BIZ-18 criterion 3). Prices live on the payment page and in the Platestep Plus section, never in this promise.
2. **The safety clause stays.** "We may fix or retire a feature for safety" is what keeps BL-35 (Neck Bridges replaced) and BIZ-15's clinical review from reading as a clawback.
3. **The coach sentence stays.** Without it, a paid coach program (BIZ-23, BIZ-24) would break the promise.
4. **It doesn't say "if it runs on your phone, it's free" or "everything on your phone is free".** Platestep Plus's on-device extras (BIZ-29) would make either line false. The floor is "everything in the app when it launched", plus anything safety-related.
7. **The free-for-need clause stays** (BIZ-31). "Anyone who can't afford it can ask for a free membership" is a promise the owner keeps by support email.
8. **The name is "Platestep Plus"** (owner, 2026-11-23). Don't call it "Pro", "Premium" or "Membership" in copy.
5. **It publishes at public launch (Phase 5), not before** (BIZ-18's owner recommendation). The founding price and the billing date go into What's New and the landing page at least 30 days before billing starts (business.md §3.4).
6. **It stays true in code.** BIZ-18a's `test-free-list-guard.js` keeps any lock, "Pro", "Premium", "Upgrade" or "Unlock" label out of the free areas on every build. BIZ-29 extends it to "Plus", "Platestep Plus" and "membership" outside the Plus section, with `#whatsFreeNote` allowlisted.

## A short version, for tight spaces only (optional; owner to approve)

> Free to use, with no ads, ever. Everything in Platestep when it launched stays free forever, including every built-in program.

This shortens the first two sentences and makes no new promise. Where a surface has room, use the full paragraph, because the short version leaves out the safety, Platestep Plus, free-for-need and coach clauses.
