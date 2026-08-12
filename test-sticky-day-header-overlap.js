'use strict';
// Behavioral coverage for a real, high-frequency bug found during a visual
// audit: .sticky-day-header (the condensed "Day 1 — Upper · Strength" bar
// that appears once the real day title scrolls out of view on Today) used
// to sit at position:fixed; top:0 with z-index:55 — directly on top of
// .nav-pills (the bottom-of-page-feeling but actually TOP-of-viewport
// sticky tab bar, position:sticky; top:env(safe-area-inset-top); z-index:30).
// Once both were visible, which is most of a scrolled workout session, the
// header's full 44.8px height covered the ENTIRE nav rail, and — being a
// real, non-transparent-to-pointer-events element — silently ate every tap
// meant for a tab. Confirmed live before this fix: elementFromPoint() at
// the centre of the Analysis pill returned the day header, not the pill,
// and a dispatched click at those exact coordinates never reached Analysis.
//
// Fixed by adopting the EXACT SAME pattern .analysis-index already uses one
// section over in this same stylesheet for the identical "second sticky bar
// must sit below the first, not on top of it" problem: offset `top` by the
// rail's own PUBLISHED height (--nav-rail-h, measured by wireNavRailHeight,
// not guessed) plus the safe-area inset, so the two bars stack instead of
// overlapping. z-index dropped from 55 to 20, since it no longer needs to
// outrank the rail once they don't share screen space.
//
// jsdom cannot resolve calc()/custom-property arithmetic into real pixel
// positions (no real CSS layout engine), so this file proves the fix at the
// source level — the exact expression is now byte-identical to
// .analysis-index's own already-correct rule, which is the strongest
// possible proof of "same pattern, same guarantee" without live layout.
// The live browser confirmation (real elementFromPoint hit-testing) is
// documented in the commit, not re-derived here.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-sticky-day-header-overlap.js');

// Takes a PLAIN (unescaped) selector — this function owns escaping. Also
// strips /* */ comments before returning: this rule's own explanatory
// comment literally contains the text "top:0" (documenting what the OLD
// behavior was), which would defeat a naive text-match on the raw block —
// exactly the "a comment that quotes a call/value literal defeats a naive
// assertion" failure mode this project's own testing discipline flags as a
// recurring trap. Assertions below check real DECLARATIONS, not prose.
function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[\\s\\S]*?\\n  \\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('.sticky-day-header no longer starts at the viewport top — it is offset below the nav rail, same expression as .analysis-index', (assert)=>{
  const block = extractRuleBlock(src, '.sticky-day-header');
  assert.doesNotMatch(block, /(?:^|[;{]\s*)top:0(?:px)?[;\s]/, 'must not declare top:0 anymore (checked as a real declaration, comments stripped) — that is what put it on top of the nav rail');
  assert.match(block, /top:calc\(env\(safe-area-inset-top,\s*0px\)\s*\+\s*var\(--nav-rail-h,\s*56px\)\)/,
    'must use the exact same measured-offset expression .analysis-index already uses for the identical problem');
});

test('.analysis-index and .sticky-day-header use the IDENTICAL top offset expression — proof this is the same established pattern, not a one-off guess', (assert)=>{
  const dayHeaderBlock = extractRuleBlock(src, '.sticky-day-header');
  const analysisIndexBlock = extractRuleBlock(src, '.analysis-index');
  const topExpr = /top:calc\([^;]+\);/;
  const dayHeaderTop = dayHeaderBlock.match(topExpr);
  const analysisIndexTop = analysisIndexBlock.match(topExpr);
  assert.ok(dayHeaderTop, 'sticky-day-header must have a top:calc(...) declaration');
  assert.ok(analysisIndexTop, 'analysis-index must have a top:calc(...) declaration (precondition — this is the pattern being copied)');
  assert.strictEqual(dayHeaderTop[0], analysisIndexTop[0], 'both must use byte-identical top offset expressions');
});

test('sabotage-relevant: .sticky-day-header no longer double-counts the safe-area inset in its own padding (that compensation was specifically for sitting at top:0, which no longer applies)', (assert)=>{
  const block = extractRuleBlock(src, '.sticky-day-header');
  assert.doesNotMatch(block, /padding:calc\(12px \+ env\(safe-area-inset-top/, 'padding must no longer separately add the inset — the new top: offset already clears the status bar AND the rail, so a second inset addition here would overshoot');
});

test('.sticky-day-header\'s z-index no longer outranks .nav-pills — it does not need to once they do not occupy the same space', (assert)=>{
  const dayHeaderBlock = extractRuleBlock(src, '.sticky-day-header');
  const navPillsBlock = extractRuleBlock(src, '.nav-pills'); // NOT .nav-pills-scroll — the escaped-brace anchor inside extractRuleBlock keeps these distinct
  const dayHeaderZ = parseInt((dayHeaderBlock.match(/z-index:(\d+)/) || [])[1], 10);
  const navPillsZ = parseInt((navPillsBlock.match(/z-index:(\d+)/) || [])[1], 10);
  assert.ok(Number.isFinite(dayHeaderZ) && Number.isFinite(navPillsZ), 'both rules must declare a real z-index');
  assert.ok(dayHeaderZ < navPillsZ, `sticky-day-header's z-index (${dayHeaderZ}) should no longer be forced above nav-pills' (${navPillsZ}) now that they don't overlap spatially`);
});

run();
