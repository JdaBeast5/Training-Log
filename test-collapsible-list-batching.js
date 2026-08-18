'use strict';
// Behavioral coverage for a real, user-reported bug: renderCollapsibleList
// (used by Bodyweight, BP, Glucose, Sleep, Body Measurements, Recently
// Trained, PR Timeline, AI reviews, Care check-ins, and Saved Weeks — 11
// call sites) showed a fixed handful of rows (visibleCount, usually 3) with
// a single "Show N more" button that, on tap, dumped EVERY remaining row
// into view and the DOM at once. For a log kept since day one (nightly
// sleep, say), that button could reveal hundreds of rows in one tap — the
// user's literal complaint: "if I open the sleep log, it opens up all of
// them since I started them."
//
// The fix caps each reveal at COLLAPSIBLE_LIST_BATCH_SIZE and, if there's
// still more beyond that batch, a second "Show N more" button appears
// (revealed, not created) once the first opens — chained, so nothing is
// ever permanently unreachable, but a single tap never reveals more than
// one bounded batch.
//
// A first attempt nested one .expand-wrap inside another so a later
// batch's button would stay hidden until the earlier one opened — that
// broke, confirmed live in headless Chromium: a button two grid-collapse
// levels deep reported a real, nonzero getBoundingClientRect() (a layout
// ghost Chromium doesn't actually paint or let you click, but does not
// remove from the tab order either). The shipped version below uses FLAT
// sibling .expand-wrap/button pairs instead, with every batch beyond the
// first starting inline style="display:none" — unambiguous, no nested-grid
// collapse involved. These tests cover the shipped flat version.
//
// Existing callers (test-weight-log-crud.js etc.) never actually exercised
// the >visibleCount branch — their fixtures top out at exactly 3 entries,
// which takes the early-return path — so this is the first real coverage
// of that branch at all, not just of the new batching.
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-collapsible-list-batching.js');

const renderCollapsibleListSrc = extractFunction(src, 'renderCollapsibleList');
const batchSizeSrc = extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE');

function items(n, prefix){
  return Array.from({length:n}, (_,i)=> `<div class="row">${prefix||'item'}-${i}</div>`);
}

test('sabotage-relevant: COLLAPSIBLE_LIST_BATCH_SIZE is really declared and is a real, sane cap (not left at Infinity/undefined, and not accidentally 1)', (assert)=>{
  const [value] = runSandbox([batchSizeSrc], '__capture.push(COLLAPSIBLE_LIST_BATCH_SIZE);');
  assert.strictEqual(typeof value, 'number', 'expected a real numeric batch size');
  assert.ok(value >= 5 && value <= 100, `expected a sane batch size (5-100), got ${value}`);
});

test('REAL invocation: itemHtmls.length <= visibleCount renders exactly as before — no button, no batching, unaffected regression guard for the common (short-list) case', (assert)=>{
  const { document } = runJsdom('<div id="list"></div>', '', [
    batchSizeSrc, renderCollapsibleListSrc,
    `renderCollapsibleList(document.getElementById('list'), ${JSON.stringify(items(3))}, 3, 'things');`
  ]);
  const list = document.getElementById('list');
  assert.strictEqual(list.querySelectorAll('.show-more-btn').length, 0, 'no button when everything already fits within visibleCount');
  assert.strictEqual(list.querySelectorAll('.row').length, 3, 'all 3 items must render directly, unwrapped');
});

test('REAL invocation: a short overflow (visibleCount=3, 8 items, batch size 20) behaves like the OLD single-batch code — one button reveals everything, since 5 remaining items is under one batch', (assert)=>{
  const { document } = runJsdom('<div id="list"></div>', '', [
    batchSizeSrc, renderCollapsibleListSrc,
    `renderCollapsibleList(document.getElementById('list'), ${JSON.stringify(items(8))}, 3, 'things');`
  ]);
  const list = document.getElementById('list');
  const btns = list.querySelectorAll('.show-more-btn');
  assert.strictEqual(btns.length, 1, 'exactly one button — no second batch needed for a small overflow');
  const btn = btns[0];
  assert.notStrictEqual(btn.style.display, 'none', 'the ONLY batch must be visible from the start, same as the old single-batch code');
  assert.strictEqual(btn.textContent, 'Show 5 more things', 'no "(N total)" suffix when this is the only/last batch');
  btn.click();
  assert.strictEqual(list.querySelectorAll('.row').length, 8, 'clicking the single button must reveal every remaining row, matching the old one-batch behavior');
  assert.strictEqual(btn.textContent, 'Show less', 'must still support collapsing back, same as before this fix');
  btn.click();
  assert.strictEqual(btn.textContent, 'Show 5 more things', 'and re-expanding must restore the original label');
});

test('THE ACTUAL BUG, FIXED: a long history (visibleCount=3, 40 items, batch size 20) never reveals more than one batch per tap — this is the literal "opens up all of them" scenario', (assert)=>{
  const { document } = runJsdom('<div id="list"></div>', '', [
    batchSizeSrc, renderCollapsibleListSrc,
    `renderCollapsibleList(document.getElementById('list'), ${JSON.stringify(items(40))}, 3, 'nights');`
  ]);
  const list = document.getElementById('list');
  assert.strictEqual(list.querySelectorAll('.row').length, 40, 'sanity: every row IS in the DOM up front (needed so swipe-to-delete indices still line up) — the cap is about what is VISUALLY revealed per tap, not what exists');
  // 40 total - 3 visible = 37 remaining -> batch1 caps at 20 (17 left over,
  // so batch1 announces a total), batch2 takes the final 17 (no more left,
  // so no total suffix) -> exactly 2 chained buttons.
  const btns = Array.from(list.querySelectorAll('.show-more-btn'));
  assert.strictEqual(btns.length, 2, 'expected exactly 2 chained buttons: batch 1 (20 more) then batch 2 (17 more) for the remaining 37 after the first 3 visible');
  const [firstBtn, secondBtn] = btns;

  assert.strictEqual(firstBtn.textContent, 'Show 20 more nights (37 total)', 'the FIRST tap must announce it is a partial batch, not silently cap without saying so');
  assert.notStrictEqual(firstBtn.style.display, 'none', 'the first batch\'s button must be visible immediately');

  assert.strictEqual(secondBtn.style.display, 'none', 'THE ACTUAL FIX: batch 2\'s button must be genuinely hidden (display:none — not merely inside a collapsed wrapper) until batch 1 is opened, so a real user cannot reach or tab into it yet');
  assert.strictEqual(secondBtn.textContent, 'Show 17 more nights', 'batch 2 is the final batch (37 - 20 = 17 remaining), so no "(N total)" suffix, even while still hidden');

  const firstWrap = document.getElementById(firstBtn.id.replace(/-btn$/, ''));
  assert.strictEqual(firstWrap.classList.contains('open'), false, 'batch 1 must start collapsed — nothing is open until tapped');

  firstBtn.click();
  assert.strictEqual(firstWrap.classList.contains('open'), true, 'clicking batch 1\'s button must open exactly batch 1');
  assert.notStrictEqual(secondBtn.style.display, 'none', 'opening batch 1 must reveal batch 2\'s button');

  const secondWrap = document.getElementById(secondBtn.id.replace(/-btn$/, ''));
  assert.strictEqual(secondWrap.classList.contains('open'), false, 'revealing batch 2\'s button must NOT also open batch 2 — a single tap must not cascade both batches open');

  secondBtn.click();
  assert.strictEqual(secondWrap.classList.contains('open'), true, 'a second, now-possible tap opens batch 2 — full history stays reachable, just not dumped in one tap');
});

test('sabotage-relevant: ALL 30 rows are real, present, distinct DOM elements up front — not lazily inserted on click — so wireSwipeDeleteList\'s one-time querySelectorAll(\'.swipe-item\') pass (called immediately after renderCollapsibleList by every real caller) still finds and correctly indexes every row, batched or not', (assert)=>{
  const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
  const rows = Array.from({length:30}, (_,i)=> `SWIPE-MARKER-${i}`);
  const { document } = runJsdom('<div id="list"></div>', '', [
    buildSwipeItemSrc, batchSizeSrc, renderCollapsibleListSrc,
    `
    const htmls = ${JSON.stringify(rows)}.map(m=> buildSwipeItem('<span>' + m + '</span>'));
    renderCollapsibleList(document.getElementById('list'), htmls, 3, 'entries');
    `
  ]);
  const list = document.getElementById('list');
  const swipeItems = list.querySelectorAll('.swipe-item');
  assert.strictEqual(swipeItems.length, 30, 'every row must be a real, distinct .swipe-item in the DOM immediately, regardless of which batch it visually belongs to');
  // Index-for-index correctness, not just a count match — this is exactly
  // what wireSwipeDeleteList relies on (sorted[i] <-> the i-th .swipe-item).
  swipeItems.forEach((el, i)=>{
    assert.ok(el.textContent.includes(`SWIPE-MARKER-${i}`), `swipe item at index ${i} must contain marker ${i}, in document order — an off-by-one here would silently delete the wrong real entry`);
  });
});

run();
