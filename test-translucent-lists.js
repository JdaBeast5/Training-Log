'use strict';
// Lists that cover the app's aura (owner: "Make lists translucent like the
// rest throughout the app, notice how the background of the supplement and
// food selection covers the background we created"). One increment each.
//
// v3.388 — Every swipe-to-delete list (supplements, food log, grocery,
// weight, blood pressure, glucose, measurements, Today's Priorities...) is
// built by buildSwipeItem, whose .swipe-content was an opaque --surface slab:
// it had to be, because the red delete layer filled the whole row behind it.
// The red layer is now clipped to the strip the swipe has actually uncovered
// (--swipe-reveal, set by makeSwipeable as the row moves), so the row can be
// translucent: --row-fill, a faint white lift like the glass cards.
// v3.389 — The same --row-fill replaces the opaque --surface2 on every in-card
// list tile: the food choices (the food library's .food-item-btn), search
// results, exercise-swap options, AI result cards, the technique panel,
// program boxes, cycle and care cards, the rest-day row, the targets strip
// and History's stats. Floating layers (dropdowns, sheets, toasts) stay
// opaque on purpose: they sit over content, not over the aura.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');
const { test, run } = makeRunner('test-translucent-lists.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL CSSOM (v3.388): swipe rows are translucent, and the red layer is clipped to what the swipe uncovers', (assert)=>{
  assert.strictEqual(declared('.swipe-content', 'background'), 'var(--row-fill)');
  const fill = (CSS.match(/--row-fill:rgba\(var\(--surface-white-rgb\),([.\d]+)\);/) || [])[1];
  assert.ok(fill && Number(fill) < 0.1, `--row-fill is a faint see-through lift (${fill})`);
  assert.strictEqual(declared('.swipe-delete-bg', 'clip-path'), 'inset(0 0 0 calc(100% - var(--swipe-reveal, 0px)))');
  assert.strictEqual(declared('.swipe-item.is-dragging .swipe-delete-bg', 'transition'), 'none', 'tracks the finger exactly while dragging');
  assert.strictEqual(declared('#todayInsightsList .swipe-content', 'background'), 'transparent', 'priority rows keep their own blue tint');
});

function swipeRow(){
  const { window } = runJsdom(`<div class="swipe-item"><div class="swipe-delete-bg"></div><div class="swipe-content">Creatine</div></div>`,
    '', [extractFunction(src, 'makeSwipeable'), `
      const item = document.querySelector('.swipe-item');
      item.querySelector('.swipe-content').setPointerCapture = () => {};
      window.__deleted = 0;
      makeSwipeable(item, () => { window.__deleted++; });
    `]);
  const item = window.document.querySelector('.swipe-item');
  const content = item.querySelector('.swipe-content');
  const fire = (type, x) => { const e = new window.Event(type, { bubbles: true }); e.clientX = x; e.pointerId = 1; content.dispatchEvent(e); };
  return { item, fire, reveal: () => item.style.getPropertyValue('--swipe-reveal') };
}

test('REAL invocation (v3.388): the red strip uncovers exactly as far as the row has moved, and snaps with it', (assert)=>{
  const r = swipeRow();
  assert.strictEqual(r.reveal(), '', 'at rest: nothing red anywhere behind the row');
  r.fire('pointerdown', 300);
  r.fire('pointermove', 270);
  assert.strictEqual(r.reveal(), '30px', 'mid-swipe: the 30px the row has moved, no more');
  assert.ok(r.item.classList.contains('is-dragging'));
  r.fire('pointermove', 230);
  r.fire('pointerup', 230);
  assert.strictEqual(r.reveal(), '80px', 'past halfway: snaps open, uncovering the 80px action');
  assert.ok(!r.item.classList.contains('is-dragging'));
  r.fire('pointerdown', 230);
  r.fire('pointermove', 290);
  r.fire('pointerup', 290);
  assert.strictEqual(r.reveal(), '0px', 'swiped back: closed, nothing red uncovered');
});

test('REAL invocation (v3.388): a tap below the drag threshold uncovers nothing', (assert)=>{
  const r = swipeRow();
  r.fire('pointerdown', 300);
  r.fire('pointermove', 296);
  r.fire('pointerup', 296);
  assert.strictEqual(r.reveal(), '');
});

test('REAL CSSOM (v3.389): every in-card list tile uses the translucent row fill; floating layers stay opaque', (assert)=>{
  // 2026-10-28 (v3.466): .gsearch-hit became a plain row with no fill (test-search-2-0.js).
  for(const sel of ['.food-item-btn', '.sub-option', '.photo-result-card', '.ex-detail-body', '.custom-program-box',
                    '.cycle-phase-card', '.care-relief', '.rest-done-row', '.exh-stats > div']){ // 2026-10-27 (v3.429): .targets-strip removed (test-log-2-0.js)
    assert.strictEqual(declared(sel, 'background'), 'var(--row-fill)', sel);
  }
  assert.match(declared('.program-panel', 'background'), /, var\(--row-fill\)$/, '.program-panel: its sheen over the translucent fill');
  assert.match(declared('.ex-suggest', 'background') || declared('.ex-suggest', 'background-color'), /surface2/, 'the autocomplete dropdown floats over content: still opaque');
});

run();
