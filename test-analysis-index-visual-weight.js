'use strict';
// Behavioral coverage for the first of four "bulky tab bar" improvements
// found by a dedicated tab-layout audit (measured live: .nav-pills + a
// stacked .analysis-index together occupy ~99px of a 375x812 viewport on
// Analysis — vs. 56px on every other tab — and both bars carry the exact
// same inset-highlight + drop-shadow box-shadow recipe over independently
// blurred glass, which reads as one thick blob rather than "nav + a
// lighter secondary index").
//
// This increment (audit option #1, "tighten the double bar") did NOT
// touch .nav-pill's geometry or the sticky positioning/measurement
// machinery (--nav-rail-h, the two tests in
// test-analysis-index-scroll-clearance.js already cover that) — a later,
// separate increment (option #3) does trim .nav-pill's own box-shadow,
// covered by test-nav-pill-visual-weight.js instead. This file only
// reduces .analysis-index's own vertical padding and
// .analysis-index-chip's padding (shaving real height off the second
// bar) and drops the chip's drop-shadow component (keeping only the
// inset top highlight), so the index reads as a lighter continuation of
// the rail rather than a second independently-heavy bar.
//
// jsdom has no real layout engine, so — same as the sibling sticky-bar
// tests in this repo — this proves the fix at the source level: the real
// padding/shadow values changed, and the untouched sibling (.nav-pill)
// didn't move.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-analysis-index-visual-weight.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('sabotage-relevant: .analysis-index\'s own vertical padding is smaller than the original 6px/8px top/bottom', (assert)=>{
  const block = extractRuleBlock(src, '.analysis-index');
  const m = block.match(/padding:(\d+)px 18px (\d+)px/);
  assert.ok(m, '.analysis-index must declare a real top/bottom padding alongside its 18px sides');
  assert.ok(Number(m[1]) < 6, `top padding should be reduced below the original 6px, got ${m[1]}px`);
  assert.ok(Number(m[2]) < 8, `bottom padding should be reduced below the original 8px, got ${m[2]}px`);
});

test('sabotage-relevant: .analysis-index-chip padding is smaller than the original 7px/12px, and its drop-shadow component is gone (inset highlight kept)', (assert)=>{
  const block = extractRuleBlock(src, '.analysis-index-chip');
  const paddingMatch = block.match(/padding:(\d+)px (\d+)px;/);
  assert.ok(paddingMatch, '.analysis-index-chip must declare real padding');
  assert.ok(Number(paddingMatch[1]) < 7, `vertical chip padding should be reduced below 7px, got ${paddingMatch[1]}px`);
  assert.ok(Number(paddingMatch[2]) < 12, `horizontal chip padding should be reduced below 12px, got ${paddingMatch[2]}px`);
  assert.match(block, /box-shadow:0 1px 0 rgba\(var\(--surface-white-rgb\),0\.04\) inset;/, 'the inset top highlight must remain (still reads as a real, tactile chip) — the literal white rgba() was later factored into var(--surface-white-rgb) by the neutral-rgba consolidation pass, same computed color');
  assert.doesNotMatch(block, /0 4px 12px -8px rgba\(var\(--overlay-black-rgb\),0\.5\)/, 'the outer drop-shadow component must be gone — that duplicated .nav-pill\'s own shadow directly beneath it');
});

test('regression guard: .nav-pill itself is completely untouched by this change — the index gets lighter, the primary rail does not', (assert)=>{
  const block = extractRuleBlock(src, '.nav-pill');
  // Geometry (padding/font-size/tap-target size) is this test's real
  // regression guard for THIS increment — it's not this pass's job to
  // touch it. .nav-pill's own box-shadow was intentionally trimmed in a
  // later, separate increment (tab-layout option #3, same rationale as
  // this file's .analysis-index-chip change) — see
  // test-nav-pill-visual-weight.js for that change's own coverage, so this
  // file no longer asserts a shadow value that later commit deliberately
  // supersedes.
  assert.match(block, /padding:10px 13px;/, '.nav-pill padding must be unchanged by this increment — geometry/tap-target size is out of scope here');
});

run();
