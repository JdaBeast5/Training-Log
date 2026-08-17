'use strict';
// Behavioral coverage for a bug found while wiring the new .set-next-btn
// (test-set-next-button.js): makeSwipeable's `content.addEventListener
// ('pointerdown', ...)` called `content.setPointerCapture(e.pointerId)`
// UNCONDITIONALLY, on every pointerdown anywhere inside the row — including
// a plain tap that starts ON one of the row's own buttons (plate
// calculator, voice log, add note, add drop set, and now "next field").
// Per the Pointer Events spec, once an element has captured a pointer, that
// pointer's later events — including the pointerup, and the click the
// browser synthesizes from it — retarget to the CAPTURING element instead
// of wherever the tap actually landed. So a tap that started on a button
// never actually reached that button's own click listener: content silently
// captured it first. Confirmed live in a real Chromium browser (not just
// reasoned about): before this fix, clicking .set-note-btn inside an open
// exercise's set row did nothing at all; after it, the note field opens
// exactly as it should.
//
// The fix is a single early return: bail out of the drag/capture path
// entirely when the pointerdown's real target is a button/input/etc, since
// that is never the start of a genuine swipe gesture.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-swipe-content-button-passthrough.js');

const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');

test('sabotage-relevant: the real makeSwipeable source actually bails out of pointer capture for an interactive descendant, not the old unconditional-capture shape', (assert)=>{
  assert.match(makeSwipeableSrc, /e\.target\.closest\('button, input, a, select, textarea'\)/, 'must check the pointerdown\'s real target for an interactive element before ever capturing the pointer');
  const bailIdx = makeSwipeableSrc.indexOf("e.target.closest('button, input, a, select, textarea')");
  const captureIdx = makeSwipeableSrc.indexOf('content.setPointerCapture(e.pointerId)');
  assert.ok(bailIdx !== -1 && captureIdx !== -1 && bailIdx < captureIdx, 'the interactive-element check must run BEFORE setPointerCapture, not after (an after-the-fact check can\'t undo a capture that already happened)');
});

const bodyHtml = `
  <div class="set-row swipe-item">
    <div class="swipe-delete-bg">delete</div>
    <div class="swipe-content">
      <span class="row-bg-area">row background</span>
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

function fireFakePointerdown(el, win){
  const evt = new win.Event('pointerdown', {bubbles:true});
  Object.defineProperty(evt, 'clientX', {value:100});
  Object.defineProperty(evt, 'pointerId', {value:1});
  el.dispatchEvent(evt);
}

test('REAL invocation: a pointerdown that originates on a button inside the row does NOT capture the pointer', (assert)=>{
  const { document, window: win } = build();
  const content = document.querySelector('.swipe-content');
  const btn = document.querySelector('.set-next-btn');
  let captured = false;
  content.setPointerCapture = ()=>{ captured = true; };
  fireFakePointerdown(btn, win);
  assert.strictEqual(captured, false, 'a tap starting on a real button must never trigger pointer capture — this is the exact bug: capturing here silently swallowed the button\'s own click');
});

test('REAL invocation: a pointerdown that originates on an input inside the row does NOT capture the pointer', (assert)=>{
  const { document, window: win } = build();
  const content = document.querySelector('.swipe-content');
  const input = document.querySelector('.ex-weight');
  let captured = false;
  content.setPointerCapture = ()=>{ captured = true; };
  fireFakePointerdown(input, win);
  assert.strictEqual(captured, false, 'a tap starting on a real input must never trigger pointer capture either');
});

test('REAL invocation: a pointerdown that originates on the row\'s own background (not a button/input) still captures the pointer, preserving real swipe-to-delete', (assert)=>{
  const { document, window: win } = build();
  const content = document.querySelector('.swipe-content');
  const bg = document.querySelector('.row-bg-area');
  let captured = false;
  content.setPointerCapture = ()=>{ captured = true; };
  fireFakePointerdown(bg, win);
  assert.strictEqual(captured, true, 'a genuine swipe starting on the row\'s own surface must still capture the pointer exactly as before this fix — this is the regression guard for the swipe-to-delete gesture itself');
});

test('regression guard: tapping the delete background still triggers onDelete, completely unaffected by this fix', async (assert)=>{
  const { document, window: win } = build();
  const deleteBg = document.querySelector('.swipe-delete-bg');
  deleteBg.click();
  await new Promise(res=> win.setTimeout(res, 250));
  assert.strictEqual(win.__onDeleteCalls, 1, 'the swipe-delete-bg click path (a separate listener, not the pointerdown one this fix touches) must still fire onDelete exactly once');
});

run();
