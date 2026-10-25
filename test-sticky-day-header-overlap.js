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
const { readIndexSource, runJsdom, makeRunner } = require('./testHelpers.js');

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

// v3.288 (Glass & glow): the nav moved to a floating bar at the BOTTOM, so the
// overlap this file was written for (the sticky header sitting on the top rail
// and eating its taps) cannot recur. Both sticky bars now pin at the top safe
// area — still one shared expression, which is what these tests keep guarding.
test('.sticky-day-header pins at the top safe area (the nav rail is no longer up there), not at a bare top:0 under the clock', (assert)=>{
  const block = extractRuleBlock(src, '.sticky-day-header');
  assert.doesNotMatch(block, /(?:^|[;{]\s*)top:0(?:px)?[;\s]/, 'top:0 would put it under the status bar');
  assert.match(block, /top:env\(safe-area-inset-top,\s*0px\);/);
});

test('.analysis-index and .sticky-day-header use the IDENTICAL top offset expression — one established pattern, not two guesses', (assert)=>{
  const topExpr = /top:env\([^;]+\);/;
  const a = extractRuleBlock(src, '.sticky-day-header').match(topExpr);
  const b = extractRuleBlock(src, '.analysis-index').match(topExpr);
  assert.ok(a && b, 'both must declare a top offset');
  assert.strictEqual(a[0], b[0]);
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

// --- Regression found via real usage after the fix above shipped: the
// hidden/resting transform (-100%) was left unchanged when `top` moved
// from 0 to the nav-rail offset. -100% is relative to the element's OWN
// ~44.8px height, not to `top` — so at top:0 it correctly cleared the
// whole viewport, but at top:~56px it only cleared 44.8 of that,
// landing the "hidden" state at screen y ~11-56px: sitting in, and
// bleeding through, the nav rail's own translucent blurred background
// the entire time, on every tab, not just when scrolled — exactly what
// was reported as "at the top of the page at all times, not well
// placed." Fixed by subtracting the same top offset from the resting
// transform, restoring the original "hidden really means invisible"
// guarantee.
test('sabotage-relevant: the hidden/resting transform clears BOTH the element\'s own height AND the top offset that pushes it below the nav rail — not just its own height alone', (assert)=>{
  const block = extractRuleBlock(src, '.sticky-day-header');
  // v3.288: the offset is now just the safe area, so that is what it subtracts.
  assert.match(block, /transform:translateY\(calc\(-100% - env\(safe-area-inset-top,\s*0px\)\)\);/,
    'the resting transform must subtract the same top offset the element is pushed down by, or the hidden state lands on screen');
});

test('regression guard: .sticky-day-header.visible still simply resets to translateY(0) — the fix above only touches the HIDDEN state, not the shown one', (assert)=>{
  assert.match(src, /\.sticky-day-header\.visible\{transform:translateY\(0\);\}/, 'the visible state must be untouched — it was already correct (lands exactly at the element\'s real top: offset, i.e. right below the nav rail)');
});

// --- New ask: clicking the condensed header should take you back to the
// real day title it's standing in for, not sit there as a dead label.
// Extracted from the real file rather than reimplemented, the same
// unnamed-top-level-statement treatment this repo's other tests already
// give jumpToSetting-style wiring that extractFunction can't reach by name.
function extractClickWiring(source){
  const start = source.indexOf("document.getElementById('stickyDayHeader').addEventListener('click', ()=>{");
  if(start === -1) throw new Error('stickyDayHeader click wiring not found');
  const end = source.indexOf('\n});', start);
  if(end === -1) throw new Error('no closing \'});\' found after the click wiring');
  return source.slice(start, end + 4);
}

test('REAL invocation: clicking #stickyDayHeader scrolls #dayTitle (the exact element the observer watches) into view', (assert)=>{
  const bodyHtml = `
    <div id="stickyDayHeader"></div>
    <div id="dayTitle"></div>
  `;
  const { document } = runJsdom(bodyHtml, '', [extractClickWiring(src)]);
  const dayTitle = document.getElementById('dayTitle');
  let scrolledWith = null;
  dayTitle.scrollIntoView = (opts)=>{ scrolledWith = opts; };

  document.getElementById('stickyDayHeader').click();

  assert.ok(scrolledWith, 'clicking the header must actually call scrollIntoView on the real day title — not do nothing');
  assert.strictEqual(scrolledWith.block, 'start', 'must scroll the day title fully into view at the top, not just barely on-screen');
});

run();
