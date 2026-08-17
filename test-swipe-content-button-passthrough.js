'use strict';
// Behavioral coverage for a bug found while wiring the new .set-next-btn
// (test-set-next-button.js) and then found to run deeper than first thought:
// makeSwipeable's `content.addEventListener('pointerdown', ...)` called
// `content.setPointerCapture(e.pointerId)` UNCONDITIONALLY, on every
// pointerdown anywhere inside the row. Per the Pointer Events spec, once an
// element has captured a pointer, that pointer's later events — including
// the pointerup, and the click the browser synthesizes from it — retarget
// to the CAPTURING element instead of wherever the tap actually landed.
//
// The first fix attempted here checked whether the pointerdown's target was
// a button/input/etc and skipped capture for those — it made every row
// BUTTON work again (confirmed live: .set-note-btn opening its note field).
// But a live-browser check of the grocery list — whose checkbox-toggle is a
// plain `<div class="grocery-item">` click listener, not a button — showed
// it was STILL broken: tapping it never added the `.done` class. An
// allowlist of tag names can never be complete; the real distinction was
// never "is this a button" but "did the pointer actually move," which is
// what a genuine swipe is and a tap never is. The final fix defers
// setPointerCapture until horizontal movement crosses a small threshold —
// below it, no element's own tap handling is ever touched, regardless of
// what kind of element it is.
//
// Confirmed against a real Chromium browser both ways: a real swipe drag
// (mouse down, several moves past the threshold, up) still reveals the
// delete background and deletes on tap; a plain click on the grocery item
// now adds `.done`, where before this fix it silently did nothing.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-swipe-content-button-passthrough.js');

const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');

test('sabotage-relevant: the real makeSwipeable source defers pointer capture until real movement, not the old unconditional-capture-on-pointerdown shape', (assert)=>{
  assert.doesNotMatch(makeSwipeableSrc, /pointerdown['"],\s*\(e\)=>\{\s*dragging = true/, 'pointerdown must not set dragging true immediately — that is the old, broken unconditional-capture shape');
  assert.match(makeSwipeableSrc, /DRAG_THRESHOLD/, 'must define a real movement threshold');
  assert.match(makeSwipeableSrc, /Math\.abs\(dx\) < DRAG_THRESHOLD/, 'pointermove must bail out below the threshold, before ever capturing');
  const thresholdCheckIdx = makeSwipeableSrc.indexOf('Math.abs(dx) < DRAG_THRESHOLD');
  const captureIdx = makeSwipeableSrc.indexOf('content.setPointerCapture(activePointerId)');
  assert.ok(thresholdCheckIdx !== -1 && captureIdx !== -1 && thresholdCheckIdx < captureIdx, 'the threshold check must run BEFORE setPointerCapture, not after (an after-the-fact check can\'t undo a capture that already happened)');
});

const bodyHtml = `
  <div class="set-row swipe-item">
    <div class="swipe-delete-bg">delete</div>
    <div class="swipe-content">
      <div class="grocery-item">grocery row (plain div, not a button)</div>
      <button type="button" class="set-next-btn">next</button>
      <input type="number" class="ex-weight">
    </div>
  </div>
`;

function build(){
  return runJsdom(bodyHtml, '', [makeSwipeableSrc, `
    window.__onDeleteCalls = 0;
    makeSwipeable(document.querySelector('.swipe-item'), ()=>{ window.__onDeleteCalls++; });
  `]);
}

function fireSequence(el, win, moves){
  // moves: array of clientX values. First is pointerdown, rest are pointermove, last also fires pointerup.
  const pid = 1;
  const down = new win.Event('pointerdown', {bubbles:true});
  Object.defineProperty(down, 'clientX', {value: moves[0]});
  Object.defineProperty(down, 'pointerId', {value: pid});
  el.dispatchEvent(down);
  for(let i=1;i<moves.length;i++){
    const move = new win.Event('pointermove', {bubbles:true});
    Object.defineProperty(move, 'clientX', {value: moves[i]});
    Object.defineProperty(move, 'pointerId', {value: pid});
    el.ownerDocument.querySelector('.swipe-content').dispatchEvent(move);
  }
  const up = new win.Event('pointerup', {bubbles:true});
  Object.defineProperty(up, 'clientX', {value: moves[moves.length-1]});
  Object.defineProperty(up, 'pointerId', {value: pid});
  el.ownerDocument.querySelector('.swipe-content').dispatchEvent(up);
}

test('REAL invocation: a tap on the grocery-item div (pointer barely moves, well under the threshold) never captures the pointer', (assert)=>{
  const { document, window: win } = build();
  const content = document.querySelector('.swipe-content');
  const groceryItem = document.querySelector('.grocery-item');
  let captured = false;
  content.setPointerCapture = ()=>{ captured = true; };
  fireSequence(groceryItem, win, [100, 101, 100]); // 1px of jitter, never a real drag
  assert.strictEqual(captured, false, 'a plain tap on a non-button element must never trigger pointer capture — this is the exact bug the tag-allowlist version of this fix missed');
});

test('REAL invocation: a tap on the set-next-btn (no meaningful movement) never captures the pointer', (assert)=>{
  const { document, window: win } = build();
  const content = document.querySelector('.swipe-content');
  const btn = document.querySelector('.set-next-btn');
  let captured = false;
  content.setPointerCapture = ()=>{ captured = true; };
  fireSequence(btn, win, [100, 100]);
  assert.strictEqual(captured, false, 'a plain tap on a button must also never trigger pointer capture');
});

test('REAL invocation: real horizontal movement past the threshold DOES capture the pointer and starts the drag transform, preserving real swipe-to-delete', (assert)=>{
  const { document, window: win } = build();
  const content = document.querySelector('.swipe-content');
  const groceryItem = document.querySelector('.grocery-item');
  let captured = false;
  content.setPointerCapture = ()=>{ captured = true; };
  fireSequence(groceryItem, win, [100, 95, 80, 60, 40, 30]); // 70px left, well past threshold
  assert.strictEqual(captured, true, 'real drag movement must still capture the pointer exactly as before this fix — the regression guard for swipe-to-delete itself');
  assert.match(content.style.transform, /translateX\(-\d/, 'the row must actually visually slide during a real swipe');
});

test('regression guard: tapping the delete background still triggers onDelete, completely unaffected by this fix', async (assert)=>{
  const { document, window: win } = build();
  const deleteBg = document.querySelector('.swipe-delete-bg');
  deleteBg.click();
  await new Promise(res=> win.setTimeout(res, 250));
  assert.strictEqual(win.__onDeleteCalls, 1, 'the swipe-delete-bg click path (a separate listener, not the pointerdown/pointermove ones this fix touches) must still fire onDelete exactly once');
});

run();
