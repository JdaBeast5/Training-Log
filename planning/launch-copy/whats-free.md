# What's free (public copy for BIZ-18)

> Source: `planning/business.md` §3.4, the "wording (revised 2026-11-07)" paragraph, with `{name}` filled from `APP_NAME = 'Platestep'` (`index.html:7624`). The owner approved publishing this paragraph at launch (pitch.md, D9(a)). Marketing owns tone (marketing.md §2); this file owns the facts, and the facts must not drift.
>
> **Not legal advice.** This is a public consumer promise, so counsel should read it together with privacy.md before launch.

## The paragraph (use exactly this text)

Everything Platestep does on your phone is free, forever, with no ads, including every program that comes with the app. We may fix or retire a feature for safety, but we will never put it behind a payment. If we ever add a paid plan, it will only cover things that run on our servers, like AI without your own key or cloud sync, and anyone who trained with Platestep before then gets a founding price for as long as they stay subscribed. Coaches may one day pay to manage clients or sell programs they wrote; their clients and everyone else keep everything above for free.

## Where it goes

| Surface | Item | Note |
|---|---|---|
| Settings, near the privacy link | BIZ-18 | As a short note under a "What's free" heading |
| `README.md`, "What's free" section | BIZ-18 | BIZ-18 criterion 2 requires the Settings note and the README paragraph to match exactly (after normalising whitespace). Paste it byte for byte. |
| Landing page | MKT-14 | Same paragraph |
| Store listing, long description | Phase 5 | Same paragraph, or the paragraph's first sentence plus a link to the landing page |
| Privacy page | BIZ-16 | One line linking here (business.md §3.4 names the privacy page as an announce surface) |

## Rules the text must keep (from BIZ-18 and business.md §3.3 and §3.4)

1. **It contains no price, no currency symbol and no date** (BIZ-18 criterion 3) until BIZ-21 sets them.
2. **The safety clause stays.** "We may fix or retire a feature for safety" is what keeps BL-35 (Neck Bridges replaced) and BIZ-15's clinical review from reading as a clawback.
3. **The coach sentence stays.** Without it, a paid coach program (BIZ-23, BIZ-24) would break the promise.
4. **It doesn't say "if it runs on your phone, it's free."** That older line was dropped in the alignment round.
5. **It publishes at public launch (Phase 5), not before** (BIZ-18's owner recommendation). The founding price and the billing date go into What's New and the landing page at least 30 days before billing starts (business.md §3.4).
6. **It stays true in code.** BIZ-18a's `test-free-list-guard.js` keeps any lock, "Pro", "Premium", "Upgrade" or "Unlock" label out of the free areas on every build.

## A short version, for tight spaces only (optional; owner to approve)

> Free, forever, with no ads: everything Platestep does on your phone, including every built-in program.

This shortens the first sentence and makes no new promise. Where a surface has room, use the full paragraph, because the short version leaves out the safety and coach clauses.
