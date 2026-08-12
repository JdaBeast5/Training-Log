'use strict';
// Behavioral coverage for the [SEARCH-PILL PEEK-THROUGH] fix: the bottom nav
// rail's pinned search pill (position:sticky, opaque background + occluder
// shadow) sits at z-index 2 over the horizontally-scrolling tab pills. When
// the rail auto-scrolls to bring the LAST tab (e.g. Learn) into view on a
// phone-width screen, scrollLeft maxes out — there is no further room to
// scroll — so whichever OTHER pill happens to land in the search pill's own
// 0-48px footprint at that exact position gets partially covered, and
// because that pill's background sits UNDER the search pill rather than
// being clipped, whatever text extends past the search pill's right edge
// stays fully opaque: a stray letter or two floats in open space with no
// pill visible around it. Confirmed live before this fix: with Learn active
// at 375px width, "Analysis" scrolled to exactly this position and leaked
// its final "s".
//
// Two things changed, both covered here:
//   1. wireOverflowFade's sync() now also toggles .at-start (mirroring the
//      pre-existing .at-end), so CSS can tell whether anything could be
//      resting behind the search pill right now.
//   2. Four CSS rules on .nav-pills-scroll (source-checked below, since CSS
//      isn't something extractFunction/extractConst can pull into a jsdom
//      sandbox) replace the single unconditional right-edge-fade rule:
//      combined-fade, right-only (the original, untouched), left-notch-only,
//      and the implicit no-mask default when both .at-start and .at-end are
//      true (content fits, nothing to scroll).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-nav-search-pill-peek-through.js');

// --- CSS shape: source-checked, since this is styling, not JS behavior -----

test('the combined-fade rule (:not(.at-start):not(.at-end)) blanks both the search-pill footprint AND the right edge', (assert)=>{
  const m = src.match(/\.nav-pills-scroll:not\(\.at-start\):not\(\.at-end\)\{[\s\S]*?\}/);
  assert.ok(m, 'expected a .nav-pills-scroll:not(.at-start):not(.at-end) rule to exist');
  const body = m[0];
  assert.match(body, /var\(--nav-search-w\)/, 'must blank a zone sized off the search pill\'s own width, not a hardcoded guess');
  assert.match(body, /calc\(100% - 34px\)/, 'must also carry the original right-edge fade — this is the BOTH-active state');
});

test('the .at-start:not(.at-end) rule is the ORIGINAL right-fade-only rule, unchanged — no left notch when nothing is behind the search pill', (assert)=>{
  const m = src.match(/\.nav-pills-scroll\.at-start:not\(\.at-end\)\{[\s\S]*?\}/);
  assert.ok(m, 'expected a .nav-pills-scroll.at-start:not(.at-end) rule to exist');
  const body = m[0];
  assert.match(body, /calc\(100% - 34px\)/, 'must keep the right-edge fade');
  assert.doesNotMatch(body, /var\(--nav-search-w\)/, 'must NOT blank anything near the search pill — at true rest (e.g. Today active) nothing is behind it yet, so blanking there would wrongly fade the start of the very next pill\'s own label');
});

test('the :not(.at-start).at-end rule is left-notch-only — no right fade once genuinely scrolled to the end', (assert)=>{
  const m = src.match(/\.nav-pills-scroll:not\(\.at-start\)\.at-end\{[\s\S]*?\}/);
  assert.ok(m, 'expected a .nav-pills-scroll:not(.at-start).at-end rule to exist');
  const body = m[0];
  assert.match(body, /var\(--nav-search-w\)/, 'must blank the search-pill peek-through zone');
  assert.doesNotMatch(body, /calc\(100% - 34px\)/, 'must NOT fade the right edge — .at-end means there is nothing further right to hint at');
});

test('sabotage-relevant: exactly 3 .nav-pills-scroll mask rules exist (the 4th state, both-at-once, is deliberately the no-mask default)', (assert)=>{
  const rules = src.match(/\.nav-pills-scroll(?:\.at-start|:not\(\.at-start\))?(?:\.at-end|:not\(\.at-end\))?\{[^}]*mask-image/g) || [];
  // Matches the three conditional rules but not the unconditional base
  // .nav-pills-scroll{...} rule (no .at-start/.at-end in its selector, and it
  // has no mask-image at all) — count real mask-bearing rules specifically.
  assert.strictEqual(rules.length, 3, `expected exactly 3 mask-bearing .nav-pills-scroll rules (combined / right-only / left-only), found ${rules.length}`);
});

// --- JS behavior: real invocation of the actual wireOverflowFade function --

function buildRail({scrollLeft, scrollWidth, clientWidth}){
  return `
    const rail = document.createElement('div');
    rail.id = 'testRail';
    Object.defineProperty(rail, 'scrollWidth', {value: ${scrollWidth}, configurable:true});
    Object.defineProperty(rail, 'clientWidth', {value: ${clientWidth}, configurable:true});
    let __scrollLeft = ${scrollLeft};
    Object.defineProperty(rail, 'scrollLeft', {
      get(){ return __scrollLeft; },
      set(v){ __scrollLeft = v; },
      configurable:true,
    });
    document.body.appendChild(rail);
  `;
}

test('REAL invocation: wireOverflowFade marks BOTH at-start and at-end when content fits entirely (nothing to scroll)', (assert)=>{
  const { document } = runJsdom('', '', [
    extractFunction(src, 'wireOverflowFade'),
    buildRail({scrollLeft:0, scrollWidth:300, clientWidth:375}),
    `wireOverflowFade(rail); window.__rail = rail;`,
  ]);
  const rail = document.getElementById('testRail');
  assert.ok(rail.classList.contains('at-start'), 'content fits -> trivially at the start');
  assert.ok(rail.classList.contains('at-end'), 'content fits -> trivially at the end too (this is the deliberate 4th, no-mask, state)');
});

test('REAL invocation: wireOverflowFade marks at-start but NOT at-end at true rest with overflow present (e.g. Today active)', (assert)=>{
  const { document } = runJsdom('', '', [
    extractFunction(src, 'wireOverflowFade'),
    buildRail({scrollLeft:0, scrollWidth:578, clientWidth:375}),
    `wireOverflowFade(rail);`,
  ]);
  const rail = document.getElementById('testRail');
  assert.ok(rail.classList.contains('at-start'), 'scrollLeft 0 -> at-start');
  assert.ok(!rail.classList.contains('at-end'), 'more content to the right -> must NOT be at-end');
});

test('REAL invocation: wireOverflowFade marks at-end but NOT at-start once scrolled all the way to the last pill (the exact reproduction of the original bug scenario)', (assert)=>{
  const { document } = runJsdom('', '', [
    extractFunction(src, 'wireOverflowFade'),
    buildRail({scrollLeft:0, scrollWidth:578, clientWidth:375}),
    `wireOverflowFade(rail); rail.scrollLeft = 203; rail.dispatchEvent(new Event('scroll'));`,
  ]);
  const rail = document.getElementById('testRail');
  assert.ok(!rail.classList.contains('at-start'), 'scrolled well past 1px tolerance -> must NOT be at-start (this is the state the left-notch mask must be active for)');
  assert.ok(rail.classList.contains('at-end'), 'scrollLeft+clientWidth (203+375=578) reaches scrollWidth (578) -> at-end');
});

test('REAL invocation: wireOverflowFade marks NEITHER at-start nor at-end mid-scroll — the state where BOTH fades must be active simultaneously', (assert)=>{
  const { document } = runJsdom('', '', [
    extractFunction(src, 'wireOverflowFade'),
    buildRail({scrollLeft:0, scrollWidth:578, clientWidth:375}),
    `wireOverflowFade(rail); rail.scrollLeft = 100; rail.dispatchEvent(new Event('scroll'));`,
  ]);
  const rail = document.getElementById('testRail');
  assert.ok(!rail.classList.contains('at-start'), 'scrolled away from the start');
  assert.ok(!rail.classList.contains('at-end'), 'not yet scrolled to the end (100+375=475 < 578)');
});

test('sabotage-relevant: sync() really calls classList.toggle for both at-start and at-end (not just at-end, which existed before this fix)', (assert)=>{
  const fnSrc = extractFunction(src, 'wireOverflowFade');
  const toggleAtStart = (fnSrc.match(/classList\.toggle\(\s*['"]at-start['"]/g) || []).length;
  const toggleAtEnd = (fnSrc.match(/classList\.toggle\(\s*['"]at-end['"]/g) || []).length;
  assert.strictEqual(toggleAtStart, 1, `expected exactly 1 real classList.toggle('at-start', ...) call site, found ${toggleAtStart}`);
  assert.strictEqual(toggleAtEnd, 1, `expected exactly 1 real classList.toggle('at-end', ...) call site, found ${toggleAtEnd}`);
});

run();
