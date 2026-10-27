'use strict';
// v3.400 (owner: "Make the refresh function more responsive"). Pull to
// refresh followed POINTER events, and iOS Safari fires pointercancel as soon
// as it treats a drag as a page scroll — which a drag down at the top is (the
// rubber-band bounce) — so the pull was cut off before its threshold more
// often than not. Touch input now uses TOUCH events, which keep coming; while
// the drag is a downward pull from the top the gesture claims it
// (preventDefault) so the page does not bounce under it; sideways swipes are
// left alone. Mouse/pen keep pointer events. The reload waits 150ms (was
// 500ms) — enough for a blurred field's change handler to save locally.
const { readIndexSource, extractConst, extractFunction, extractIIFE, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-pull-to-refresh.js');
const src = readIndexSource();

function mount({ scrollY = 0 } = {}){
  const { window } = runJsdom(extractElementById(src, 'pullRefreshIndicator') + '<div id="row" class="swipe-content"></div><input id="field">', `
    window.__timers = [];
    window.setTimeout = (fn, ms) => { window.__timers.push(ms); return 0; }; // the reload itself never runs
    Object.defineProperty(window, 'scrollY', { value: ${scrollY}, configurable: true });
  `, [extractConst(src, 'ICONS'), extractFunction(src, 'icon'), // 2026-10-27 (v3.426): the spinner draws ICONS.refresh
    extractIIFE(src, 'pullToRefresh'), 'pullToRefresh();']);
  const doc = window.document;
  const ev = (type, props, target = doc.body) => {
    const e = new window.Event(type, { bubbles: true, cancelable: true });
    for(const [k, v] of Object.entries(props)) Object.defineProperty(e, k, { value: v });
    target.dispatchEvent(e);
    return e;
  };
  const touch = (type, x, y, target) => ev(type, { touches: type === 'touchend' || type === 'touchcancel' ? [] : [{ clientX: x, clientY: y }] }, target);
  const pointer = (type, x, y, pointerType = 'mouse') => ev(type, { clientX: x, clientY: y, pointerType });
  return { window, doc, touch, pointer, label: () => doc.getElementById('pullRefreshLabel').textContent };
}

test('REAL invocation: a touch pull past the threshold is claimed (no bounce under it) and refreshes 150ms after release', (assert)=>{
  const ui = mount();
  ui.touch('touchstart', 100, 100);
  const m = ui.touch('touchmove', 102, 200);
  assert.strictEqual(m.defaultPrevented, true, 'the pull owns the drag');
  assert.strictEqual(ui.label(), 'Release to refresh');
  ui.touch('touchend');
  assert.strictEqual(ui.label(), 'Refreshing…');
  assert.deepStrictEqual([...ui.window.__timers], [150]);
});

test('REAL invocation: the iPhone case — Safari\'s pointercancel mid-pull no longer ends it', (assert)=>{
  const ui = mount();
  ui.touch('touchstart', 100, 100);
  ui.pointer('pointerdown', 100, 100, 'touch');
  ui.touch('touchmove', 100, 125);
  ui.pointer('pointercancel', 100, 125, 'touch'); // what iOS sends once it decides it is a scroll
  assert.strictEqual(ui.window.__timers.length, 0);
  ui.touch('touchmove', 100, 190);
  ui.touch('touchend');
  assert.deepStrictEqual([...ui.window.__timers], [150], 'still refreshed');
});

test('REAL invocation: a short pull springs back; a sideways swipe is not claimed; a scrolled page never starts one', (assert)=>{
  const short = mount();
  short.touch('touchstart', 100, 100); short.touch('touchmove', 100, 120); short.touch('touchend');
  assert.strictEqual(short.label(), 'Pull to refresh');
  assert.strictEqual(short.window.__timers.length, 0);
  const side = mount();
  side.touch('touchstart', 100, 100);
  assert.strictEqual(side.touch('touchmove', 180, 110).defaultPrevented, false, 'a chip row can still scroll sideways');
  const scrolled = mount({ scrollY: 400 });
  scrolled.touch('touchstart', 100, 100);
  assert.strictEqual(scrolled.touch('touchmove', 100, 220).defaultPrevented, false);
  scrolled.touch('touchend');
  assert.strictEqual(scrolled.window.__timers.length, 0);
});

test('REAL invocation: swipe rows keep their gesture; a mouse pull still works through pointer events', (assert)=>{
  const ui = mount();
  ui.touch('touchstart', 100, 100, ui.doc.getElementById('row'));
  assert.strictEqual(ui.touch('touchmove', 100, 200).defaultPrevented, false);
  const mouse = mount();
  mouse.pointer('pointerdown', 100, 100); mouse.pointer('pointermove', 100, 200); mouse.pointer('pointerup', 100, 200);
  assert.deepStrictEqual([...mouse.window.__timers], [150]);
});

test('REAL source: touchmove is registered non-passive (so it may claim the pull); touch pointers are ignored', (assert)=>{
  const fn = extractIIFE(src, 'pullToRefresh');
  assert.match(fn, /addEventListener\('touchmove', [^\n]*\{passive:false\}\)/);
  assert.strictEqual((fn.match(/pointerType !== 'touch'/g) || []).length, 4, 'pointerdown, move, up, cancel');
  assert.match(fn, /const RELOAD_DELAY = 150;/);
});

run();
