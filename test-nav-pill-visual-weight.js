'use strict';
// Behavioral coverage for the third of four "bulky tab bar" improvements
// found by a dedicated tab-layout audit (option #1, shipped in
// test-analysis-index-visual-weight.js, lightened the secondary index bar
// stacked under the main rail; this one — option #3 — trims the main rail
// itself).
//
// Deliberately narrow: geometry (padding, font-size, tap-target size) is
// UNCHANGED — the audit's own math showed trimming a few px per pill
// doesn't buy back enough width to stop the horizontal-scroll requirement
// (that's option #2's job, a separate increment), and tap-target sizing is
// explicitly the tap-targets fork's territory, not this one's. This
// increment only removes the outer drop-shadow component from .nav-pill
// (keeping its inset top highlight, same trim already applied to
// .analysis-index-chip) and tightens the gap between pills from 8px to
// 6px — both pure visual-weight reductions with zero effect on hit area.
//
// .nav-pill.active's own distinct glow (a deliberate "this is selected"
// cue via --cta-gradient-blue, not generic weight) is untouched — a
// regression guard here, not a change target.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-nav-pill-visual-weight.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('sabotage-relevant: .nav-pills-scroll gap is tightened from the original 8px', (assert)=>{
  const block = extractRuleBlock(src, '.nav-pills-scroll');
  const m = block.match(/gap:(\d+)px;/);
  assert.ok(m, '.nav-pills-scroll must declare a real gap');
  assert.ok(Number(m[1]) < 8, `gap should be reduced below the original 8px, got ${m[1]}px`);
});

test('sabotage-relevant: .nav-pill\'s outer drop-shadow component is gone, inset highlight kept', (assert)=>{
  // extractRuleBlock's regex stops at the first '}', which correctly
  // isolates the base .nav-pill rule from .nav-pill.active/.nav-pill:active
  // that follow it — those are separate selectors, not part of this block.
  const block = extractRuleBlock(src, '.nav-pill');
  assert.match(block, /box-shadow:0 1px 0 rgba\(var\(--surface-white-rgb\),0\.04\) inset;/, 'the inset top highlight must remain — the literal white rgba() was later factored into var(--surface-white-rgb) by the neutral-rgba consolidation pass, same computed color');
  assert.doesNotMatch(block, /0 4px 12px -8px rgba\(var\(--overlay-black-rgb\),0\.5\)/, 'the outer drop-shadow component must be gone');
});

test('regression guard: .nav-pill geometry (padding, font-size, border-radius) is completely unchanged — tap-target size is out of scope for this pass', (assert)=>{
  const block = extractRuleBlock(src, '.nav-pill');
  assert.match(block, /padding:10px 13px;/, 'padding must be unchanged');
  assert.match(block, /font-size:13px;/, 'font-size must be unchanged');
  assert.match(block, /border-radius:var\(--radius-md\);/, 'border-radius must be unchanged');
});

test('regression guard: .nav-pill.active keeps its own distinct selected-state glow, untouched by the base .nav-pill shadow trim', (assert)=>{
  const block = extractRuleBlock(src, '.nav-pill.active');
  assert.match(block, /box-shadow:0 1px 0 rgba\(var\(--surface-white-rgb\),0\.2\) inset, 0 3px 12px rgba\(var\(--plate-blue-rgb\),0\.4\);/, '.nav-pill.active\'s own glow must be exactly as it was (later factored into var(--surface-white-rgb), same computed color) — this is a deliberate selection cue, not generic weight');
});

run();
