'use strict';
// Behavioral coverage for Phase H1.4: list rows built via buildSwipeItem
// (food log, weight/BP/glucose, grocery) previously had zero enter
// animation on a full-rebuild re-render, unlike view-level cards which get
// a fade+rise via .card-stagger. buildSwipeItem now carries that same
// class directly — one shared function, so all 5 consumers get it for
// free without each renderer needing its own change.
//
// The second half covers the EXIT side: makeSwipeable's delete handler used
// to call onDelete synchronously the instant the trash icon was tapped,
// so a swiped-open row was simply gone the moment the caller's rebuild
// landed. It now collapses the row (max-height/opacity/margin) and waits
// 200ms before calling onDelete — skipped under reduced motion. jsdom does
// no real layout, so offsetHeight is always 0 there; these tests verify the
// TIMING (delayed vs immediate) and the end-state style values actually
// get set, not the literal pixel heights, which only a real browser can show.
const { readIndexSource, extractFunction, extractConst, countCallSites, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');
const assert = require('assert');

const src = readIndexSource();
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');

const { test, run } = makeRunner('test-list-row-enter-animation.js');

test('REAL invocation: buildSwipeItem returns markup with BOTH swipe-item and card-stagger on the same element', (assert)=>{
  const [html] = runSandbox([buildSwipeItemSrc], `
    __capture.push(buildSwipeItem('<div>hello</div>'));
  `);
  // Checking for the two classes on the SAME div (not just present anywhere
  // in the string) — a naive "includes('card-stagger')" could pass even if
  // the class landed on the wrong element (e.g. swipe-delete-bg).
  const divMatch = /<div class="([^"]*)">/.exec(html);
  assert.ok(divMatch, 'the returned markup must open with a classed div');
  const classes = divMatch[1].split(/\s+/);
  assert.ok(classes.includes('swipe-item'), 'must still carry swipe-item');
  assert.ok(classes.includes('card-stagger'), 'must carry card-stagger for the enter animation');
});

test('the inner content passed in is preserved untouched', (assert)=>{
  const [html] = runSandbox([buildSwipeItemSrc], `
    __capture.push(buildSwipeItem('<span class="marker">MARKER-123</span>'));
  `);
  assert.ok(html.includes('<span class="marker">MARKER-123</span>'), 'innerHtml must pass through unmodified');
});

test('sabotage-anchor: all 5 real list renderers actually call buildSwipeItem — not just the function definition existing in isolation', (assert)=>{
  // Counting real call sites, not text occurrences (a comment mentioning
  // "buildSwipeItem" in prose would defeat a naive includes() check — this
  // project's own testing discipline flags exactly that failure mode).
  const count = countCallSites(src, 'buildSwipeItem');
  assert.ok(count >= 5, `expected at least 5 real call sites (renderFoodLog, loadWeights, loadBP, loadGlucose, renderGroceryList), got ${count}`);
});

function swipeBodyHtml(){
  return `
    <div class="swipe-item">
      <div class="swipe-delete-bg"></div>
      <div class="swipe-content"><span>row</span></div>
    </div>
  `;
}

test('REAL invocation: tapping delete does NOT call onDelete synchronously — the row collapses first', async (assert)=>{
  const { document, window: win } = runJsdom(swipeBodyHtml(), `
    window.matchMedia = ()=> ({matches:false});
    window.__deleted = false;
  `, [makeSwipeableSrc, `
    makeSwipeable(document.querySelector('.swipe-item'), ()=>{ window.__deleted = true; });
    document.querySelector('.swipe-delete-bg').click();
  `]);
  // Checked immediately after the click, before any timer has fired.
  assert.strictEqual(win.__deleted, false, 'onDelete must not fire synchronously on tap — the row should collapse first');
  await new Promise(res=> setTimeout(res, 260));
  assert.strictEqual(win.__deleted, true, 'onDelete must fire once the collapse has had time to finish');
});

test('the collapsing row is set to its end-state (0 height/opacity/margin) before onDelete fires', async (assert)=>{
  const { document, window: win } = runJsdom(swipeBodyHtml(), `
    window.matchMedia = ()=> ({matches:false});
  `, [makeSwipeableSrc, `
    makeSwipeable(document.querySelector('.swipe-item'), ()=>{});
    document.querySelector('.swipe-delete-bg').click();
  `]);
  await new Promise(res=> setTimeout(res, 30));
  const item = document.querySelector('.swipe-item');
  assert.strictEqual(item.style.maxHeight, '0px', 'maxHeight must be driven to 0 to actually collapse the row, not just fade it');
  assert.strictEqual(item.style.opacity, '0', 'opacity must be driven to 0');
  assert.strictEqual(item.style.marginBottom, '0px', 'marginBottom must collapse too, so no residual gap is left before the rebuild lands');
});

test('reduced motion: onDelete fires immediately, with no collapse delay', async (assert)=>{
  const { document, window: win } = runJsdom(swipeBodyHtml(), `
    window.matchMedia = ()=> ({matches:true});
    window.__deleted = false;
  `, [makeSwipeableSrc, `
    makeSwipeable(document.querySelector('.swipe-item'), ()=>{ window.__deleted = true; });
    document.querySelector('.swipe-delete-bg').click();
  `]);
  await new Promise(res=> setTimeout(res, 10));
  assert.strictEqual(win.__deleted, true, 'reduced motion must skip the 200ms collapse wait entirely — deletion should feel instant');
});

run();
