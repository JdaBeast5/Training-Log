'use strict';
// Behavioral coverage for another icon-only conversion in the same batch as
// test-fi-icon-glyphs.js: the custom-exercise-row delete button
// (.ex-delete-custom-btn, shown once per exercise the person added
// themselves — repeats across a program's day view). Same mechanism as the
// plate/voice/fi-duplicate/fi-delete fixes: font-size:0 on the base rule
// collapses the \u{1F5D1}\u{FE0F} emoji (kept in markup for accessibility),
// and a ::after mask-image draws the real currentColor glyph.
//
// Unlike .fi-duplicate/.fi-star, .ex-delete-custom-btn was never part of
// any existing hit-area-extension group, so there is no earlier ::after
// rule to reuse/collide with here — this is a plain, self-contained glyph
// rule. It intentionally reuses the EXACT SAME trash artwork as
// .fi-delete::after (test-fi-icon-glyphs.js) rather than drawing a second
// trash can, matching how .plate-btn::after reuses the header brand mark's
// barbell verbatim. This file's de-duplication check proves that reuse is
// real (one drawing, referenced twice), not two near-identical copies that
// happen to look the same today and can drift apart later.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-ex-delete-custom-btn-glyph.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

const baseSrc = extractRuleBlock(src, '.ex-delete-custom-btn');
const afterSrc = extractRuleBlock(src, '.ex-delete-custom-btn::after');

test('sabotage-relevant: .ex-delete-custom-btn now declares font-size:0, not the old raw-emoji font-size', (assert)=>{
  assert.match(baseSrc, /font-size:0;/, 'the button must collapse the emoji text itself');
  assert.doesNotMatch(baseSrc, /font-size:15px/, 'the old raw-emoji font-size must be gone, not just shadowed');
});

test('REAL invocation: a real CSS cascade resolves .ex-delete-custom-btn font-size to 0', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${baseSrc}</style>
    <body><button class="ex-delete-custom-btn" aria-label="Remove custom exercise Cable Curl">\u{1F5D1}️</button></body>`);
  const btn = dom.window.document.querySelector('.ex-delete-custom-btn');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'the trash emoji must be genuinely collapsed');
});

test('regression guard: the button keeps its real layout declarations — this fix only touched font-size and added display/centering, nothing else', (assert)=>{
  assert.match(baseSrc, /flex:0 0 auto/, 'flex-item sizing must be untouched');
  assert.match(baseSrc, /padding:4px/, 'padding must be untouched');
  assert.match(baseSrc, /margin-right:2px/, 'margin must be untouched');
});

test('sabotage-relevant: the ::after rule carries a real trash SVG mask-image, not an empty/placeholder one', (assert)=>{
  assert.match(afterSrc, /mask-image:url\("data:image\/svg\+xml,/, 'a real inline SVG mask must be declared');
  assert.match(afterSrc, /M7\.3%206V4\.3a1%201%200%200%201%201-1h3\.4/, 'must be the actual trash-can lid path');
  assert.match(afterSrc, /width:14px; height:14px/, 'the glyph must have a real, non-zero rendered size');
});

test('sabotage-relevant: the trash SVG artwork is genuinely REUSED from .fi-delete::after, not redrawn as a second near-identical copy', (assert)=>{
  // This fragment (the SVG's opening tag through the lid path's start) is
  // unique to the hand-drawn trash glyph and appears exactly once per FULL
  // mask-image declaration. If the artwork were truly shared (one drawing,
  // referenced by both .fi-delete::after and .ex-delete-custom-btn::after,
  // each declaring both -webkit-mask-image and mask-image), this fragment
  // must occur exactly 4 times in the whole file — 2 declarations x 2
  // buttons. A 5th or 6th occurrence would mean a third, drifted copy
  // exists somewhere; fewer than 4 would mean the reuse didn't actually
  // happen and one of the two buttons is missing its glyph.
  const trashSvgOccurrences = (src.match(/stroke-linejoin%3D%27round%27%3E%3Cline%20x1%3D%274%27%20y1%3D%276%27%20x2%3D%2716%27/g) || []).length;
  assert.strictEqual(trashSvgOccurrences, 4, 'the trash SVG should be declared exactly 4 times total in the file — the -webkit-mask-image and mask-image declarations of BOTH .fi-delete::after and .ex-delete-custom-btn::after, and no more');
});

test('REAL invocation: the real exercise-row template still keeps the raw trash emoji character in markup/textContent, only for custom exercises', (assert)=>{
  const re = /\$\{ex\.isCustom \? `<button class="ex-delete-custom-btn" aria-label="Remove custom exercise \$\{escapeHtml\(ex\.name\)\}">\u{1F5D1}️<\/button>` : ''\}/u;
  assert.match(src, re, 'the button must still render the real trash emoji character in its markup, gated on ex.isCustom exactly as before');
});

run();
