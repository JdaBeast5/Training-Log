'use strict';
// Behavioral coverage for another item in the emoji-icon sweep (continuing
// test-fi-icon-glyphs.js / test-ex-delete-custom-btn-glyph.js): the
// swipe-to-delete reveal background (.swipe-delete-bg) used by every
// swipeable list row in the app (sets, warm-up steps, weight/water/BP/
// glucose logs, saved weeks, etc. — the shared markup lives in
// makeSwipeable's own template plus a couple of inline set-row templates)
// shipped the raw \u{1F5D1}\u{FE0F} emoji, full-colour and differently
// weighted per OS. Same mechanism as every other icon-only conversion in
// this batch: font-size:0 on the base rule collapses the emoji character
// (kept in markup — this element IS the click target for confirming a
// delete, per makeSwipeable's `deleteBg.addEventListener('click', ...)`,
// so keeping real text content here matters, not just decoration), and a
// ::after mask-image draws the real currentColor glyph.
//
// This is the THIRD reuse of the exact same trash artwork already shared by
// .fi-delete::after and .ex-delete-custom-btn::after — verbatim, not
// redrawn a third time, matching how .plate-btn::after's barbell glyph is
// reused rather than redrawn wherever it appears. Sized to 18px rather than
// those two buttons' 14px, matching the old raw-emoji font-size this
// element used (a bigger, full-row reveal area, not a small square button).
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-swipe-delete-bg-glyph.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

const baseSrc = extractRuleBlock(src, '\n  .swipe-delete-bg');
const afterSrc = extractRuleBlock(src, '.swipe-delete-bg::after');

test('sabotage-relevant: .swipe-delete-bg now declares font-size:0, not the old raw-emoji font-size', (assert)=>{
  assert.match(baseSrc, /font-size:0;/, 'the element must collapse the emoji text itself');
  assert.doesNotMatch(baseSrc, /font-size:18px;/, 'the old raw-emoji font-size must be gone, not just shadowed by a later rule');
});

test('REAL invocation: a real CSS cascade resolves .swipe-delete-bg font-size to 0', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${baseSrc}</style>
    <body><div class="swipe-delete-bg">\u{1F5D1}️</div></body>`);
  const el = dom.window.document.querySelector('.swipe-delete-bg');
  const computed = dom.window.getComputedStyle(el);
  assert.strictEqual(computed.fontSize, '0px', 'the trash emoji must be genuinely collapsed');
});

test('regression guard: the element keeps its real layout declarations — this fix only touched font-size and added the ::after glyph, nothing else', (assert)=>{
  assert.match(baseSrc, /position:absolute; inset:0/, 'positioning must be untouched');
  assert.match(baseSrc, /background:var\(--plate-red\)/, 'the red reveal background must be untouched');
  assert.match(baseSrc, /justify-content:flex-end/, 'alignment must be untouched — the glyph should still sit at the trailing edge');
  assert.match(baseSrc, /cursor:pointer/, 'this element is a real click target (makeSwipeable wires a click handler to it), not decorative — cursor:pointer must remain');
});

test('sabotage-relevant: the ::after rule carries a real trash SVG mask-image, not an empty/placeholder one', (assert)=>{
  assert.match(afterSrc, /mask-image:url\("data:image\/svg\+xml,/, 'a real inline SVG mask must be declared');
  assert.match(afterSrc, /M7\.3%206V4\.3a1%201%200%200%201%201-1h3\.4/, 'must be the actual trash-can lid path');
  assert.match(afterSrc, /width:18px; height:18px/, 'the glyph must be sized to 18px, matching the old emoji font-size here (bigger than the 14px icon-only buttons elsewhere)');
});

test('sabotage-relevant: the trash SVG artwork is genuinely REUSED a third time, not redrawn as a new copy', (assert)=>{
  // Same anchor fragment test-ex-delete-custom-btn-glyph.js uses to prove
  // its own reuse from .fi-delete::after. With this fix adding a THIRD
  // consumer (.swipe-delete-bg::after), the real total across the whole
  // file must now be 6 (2 declarations x 3 buttons/elements), not the 4
  // it was before this change.
  const trashSvgOccurrences = (src.match(/stroke-linejoin%3D%27round%27%3E%3Cline%20x1%3D%274%27%20y1%3D%276%27%20x2%3D%2716%27/g) || []).length;
  assert.strictEqual(trashSvgOccurrences, 6, 'the trash SVG should be declared exactly 6 times total in the file — the -webkit-mask-image and mask-image declarations of .fi-delete::after, .ex-delete-custom-btn::after, AND .swipe-delete-bg::after, and no more');
});

test('REAL invocation: every real .swipe-delete-bg template in the file still renders the raw trash emoji character in its markup', (assert)=>{
  const occurrences = (src.match(/<div class="swipe-delete-bg">\u{1F5D1}️<\/div>/gu) || []).length;
  assert.strictEqual(occurrences, 4, 'all four real swipe-delete-bg template sites (warm-up steps, two set-row templates, and the generic makeSwipeableRow helper) must still render the emoji character in markup — this fix hides it visually via font-size:0, it does not remove it from the DOM');
});

run();
