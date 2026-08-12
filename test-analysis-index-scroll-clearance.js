'use strict';
// Behavioral coverage for a real bug found during a functional/accessibility
// audit: tapping a chip in .analysis-index (the "jump to a section" rail
// that appears once Analysis has 4+ visible cards) calls
// card.scrollIntoView({behavior:'smooth', block:'start'}). block:'start'
// aligns the card's top edge with the scroll container's edge, offset only
// by the shared `button, input, select, textarea, .card{
// scroll-margin-top:80px }` rule — sized for ONE sticky bar (.nav-pills,
// ~56px). Analysis cards actually sit below TWO stacked sticky bars:
// .nav-pills AND .analysis-index directly beneath it (~44px more), together
// closer to 100px. The extra ~20px meant a jumped-to card's own title
// landed hidden under the index rail — the destination itself obscured by
// the very control used to reach it.
//
// Fixed with a scoped override, not a change to the shared rule (which
// every other tab's single-sticky-bar cards still rely on being 80px):
// #analysisView .card{ scroll-margin-top:128px } — comfortably clears both
// bars' real measured heights (nav-pills ~56px + analysis-index ~44px ≈
// 99px) with a buffer similar in proportion to the original rule's own
// (80px against a ~56px bar). The click handler itself needed no change —
// scroll-margin-top is exactly what native scrollIntoView already respects.
//
// jsdom has no real layout engine (can't resolve computed scroll-margin
// against actual rendered sticky-bar heights), so — same as
// test-sticky-day-header-overlap.js for the sibling bug — this proves the
// fix at the source level: the override exists, is scoped correctly, and
// the shared rule other tabs depend on is untouched.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-analysis-index-scroll-clearance.js');

// Takes a PLAIN (unescaped) selector — this function owns escaping.
function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

test('sabotage-relevant: #analysisView .card has its own scroll-margin-top, comfortably larger than the shared 80px single-bar value', (assert)=>{
  const block = extractRuleBlock(src, '#analysisView .card');
  const match = block.match(/scroll-margin-top:(\d+)px/);
  assert.ok(match, '#analysisView .card must declare a real scroll-margin-top');
  const value = Number(match[1]);
  assert.ok(value >= 120, `expected a value comfortably clearing ~99px of stacked sticky bars (nav-pills + analysis-index), got ${value}px`);
});

test('the shared single-sticky-bar rule (every other tab) is untouched at 80px — this fix must not regress it', (assert)=>{
  const block = extractRuleBlock(src, 'button, input, select, textarea, .card');
  assert.match(block, /scroll-margin-top:80px/, 'the original shared rule other tabs rely on must still read 80px');
  assert.match(block, /scroll-margin-bottom:80px/, 'and its scroll-margin-bottom must be untouched too');
});

test('the override is scoped to #analysisView, not applied globally to .card (which would be a bigger, unintended behavior change for every other tab)', (assert)=>{
  assert.doesNotMatch(src, /(?<!#analysisView )\.card\{\s*scroll-margin-top:128px/, 'a bare, unscoped .card{scroll-margin-top:128px} would leak the Analysis-specific offset to every other tab');
});

test('the jump-rail click handler is unchanged — it still relies on native scrollIntoView, which is exactly what scroll-margin-top governs (no separate JS offset math needed)', (assert)=>{
  assert.match(src, /card\.scrollIntoView\(\{behavior:'smooth', block:'start'\}\)/, 'the fix should work through CSS scroll-margin, not require a parallel JS scroll calculation');
});

run();
