'use strict';
// Behavioral coverage for a user-requested batch: converting more of this
// app's icon-only, full-colour vendor emoji into hand-drawn inline SVG
// vector glyphs, following the exact pattern the plate-calculator and
// voice-log buttons already established (font-size:0 on the base rule
// collapses the emoji text — kept in the markup for accessibility, not
// removed — and a ::after mask-image draws the real currentColor glyph).
//
// This file covers the two food-search-row buttons rendered by
// buildFoodItemBtn, once per row in the food list — the most-repeated
// icon-only buttons converted in this batch:
//   - .fi-duplicate (\u{270F}\u{FE0F}, "duplicate & edit")
//   - the "remove from My Foods" button (\u{1F5D1}\u{FE0F}), only shown for
//     custom foods
//
// The delete button is the interesting case: it shares its base class,
// .fi-star, with the adjacent favourite-star toggle (★/☆ — plain
// typography, out of scope, deliberately untouched). font-size:0 could not
// go on .fi-star itself without also blanking the star, so a second class,
// .fi-delete, was added to just the delete button's markup and carries the
// override instead. That's the load-bearing fact this file has to prove:
// the star keeps its real size/character, and only the button that also
// carries .fi-delete collapses its emoji and gets the glyph.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-fi-icon-glyphs.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

const fiDuplicateSrc = extractRuleBlock(src, '.fi-duplicate');
const fiDuplicateAfterSrc = extractRuleBlock(src, '.fi-duplicate::after');
const fiStarSrc = extractRuleBlock(src, '.fi-star');
const fiDeleteSrc = extractRuleBlock(src, '.fi-delete');
const fiDeleteAfterSrc = extractRuleBlock(src, '.fi-delete::after');

test('sabotage-relevant: .fi-duplicate now declares font-size:0, not the old raw-emoji font-size', (assert)=>{
  assert.match(fiDuplicateSrc, /font-size:0;/, 'the button must collapse the emoji text itself');
  assert.doesNotMatch(fiDuplicateSrc, /font-size:15px/, 'the old raw-emoji font-size must be gone, not just shadowed');
});

test('REAL invocation: a real CSS cascade resolves .fi-duplicate font-size to 0', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${fiDuplicateSrc}</style>
    <body><button class="fi-duplicate" type="button" aria-label="Duplicate and edit Chicken Breast">✏️</button></body>`);
  const btn = dom.window.document.querySelector('.fi-duplicate');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'the pencil emoji must be genuinely collapsed');
});

test('regression guard: .fi-star (the favourite-star toggle) still declares its real 18px font-size, untouched by this change', (assert)=>{
  assert.match(fiStarSrc, /font-size:18px/, 'the star toggle must keep its real size — it is plain typography (★/☆), not an emoji, and out of scope for this conversion');
  assert.doesNotMatch(fiStarSrc, /font-size:0/, '.fi-star itself must never collapse to 0 — that would also blank the star toggle, which shares this base class with the delete button');
});

test('REAL invocation: a real CSS cascade leaves a plain .fi-star (favourite toggle, no .fi-delete class) at its real 18px, showing the actual star character', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${fiStarSrc}\n${fiDeleteSrc}</style>
    <body><button class="fi-star" type="button" aria-pressed="false" aria-label="Add Chicken Breast to favourites">☆</button></body>`);
  const btn = dom.window.document.querySelector('.fi-star');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '18px', 'a real cascade with both .fi-star and the new .fi-delete rule present must still render the star toggle at its normal size when the element does not carry .fi-delete');
});

test('REAL invocation: a real CSS cascade resolves the delete button (real markup, class="fi-star fi-delete") to font-size 0, even though it also carries .fi-star', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${fiStarSrc}\n${fiDeleteSrc}</style>
    <body><button class="fi-star fi-delete" type="button" aria-label="Remove Chicken Breast from My Foods">\u{1F5D1}️</button></body>`);
  const btn = dom.window.document.querySelector('.fi-star.fi-delete');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', '.fi-delete must win the cascade over .fi-star for font-size on the delete button specifically, collapsing the trash emoji');
});

test('sabotage-relevant: the .fi-duplicate::after rule carries a real pencil SVG mask-image, not an empty/placeholder one', (assert)=>{
  assert.match(fiDuplicateAfterSrc, /mask-image:url\("data:image\/svg\+xml,/, 'a real inline SVG mask must be declared');
  assert.match(fiDuplicateAfterSrc, /M13%203\.2%2016\.8%207%207\.4%2016\.4%203%2017\.6%204\.2%2013\.2Z/, 'must be the actual pencil glyph path');
  assert.match(fiDuplicateAfterSrc, /width:14px; height:14px/, 'the glyph must have a real, non-zero rendered size');
});

test('sabotage-relevant: the .fi-delete::after rule carries a real trash SVG mask-image, not an empty/placeholder one', (assert)=>{
  assert.match(fiDeleteAfterSrc, /mask-image:url\("data:image\/svg\+xml,/, 'a real inline SVG mask must be declared');
  assert.match(fiDeleteAfterSrc, /M7\.3%206V4\.3a1%201%200%200%201%201-1h3\.4/, 'must be the actual trash-can lid path');
  assert.match(fiDeleteAfterSrc, /width:14px; height:14px/, 'the glyph must have a real, non-zero rendered size');
});

test('REAL invocation: the real buildFoodItemBtn template still keeps the raw emoji characters in markup/textContent for both buttons (accessibility labels are separate via aria-label — this is only ever a visual collapse via CSS)', (assert)=>{
  const dupRe = /<button class="fi-duplicate" type="button" aria-label="Duplicate and edit \$\{escapeHtml\(item\.name\)\}">✏️<\/button>/;
  assert.match(src, dupRe, 'the .fi-duplicate button must still render the real pencil emoji character in its markup');
  const delRe = /<button class="fi-star fi-delete" type="button" aria-label="Remove \$\{escapeHtml\(item\.name\)\} from My Foods">\u{1F5D1}️<\/button>/u;
  assert.match(src, delRe, 'the delete button must carry BOTH fi-star (shared base styling / the existing querySelectorAll(".fi-star")[1] lookup) and the new fi-delete class, and must still render the real trash emoji character');
});

test('sabotage-relevant: the delete button markup carries exactly one fi-star-classed sibling ahead of it (the star toggle) so the existing querySelectorAll(\'.fi-star\')[1] lookup still resolves to the delete button, not the star', (assert)=>{
  const starToggleRe = /<button class="fi-star \$\{favorited\?'favorited':''\}"/;
  assert.match(src, starToggleRe, 'the favourite-star toggle must still be the first .fi-star-classed button in the row, so index [0] is the star and [1] is still the delete button after this change');
});

run();
