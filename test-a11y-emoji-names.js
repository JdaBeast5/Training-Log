'use strict';
// Screen-reader names for controls whose only text is an emoji kept as a
// fallback (flagged in earlier handoffs; owner: "get this started").
//
// v3.487 — The swipe-to-delete strip is a real control (tapping the revealed
// red strip deletes the row) whose only text was 🗑️, read out as
// "wastebasket" on every row of every list. makeSwipeable, which wires every
// swipe row, makes it a button named "Delete", keeping a caller's own label
// (Today's Priorities says "Hide until tomorrow"). Describe a Meal's mic
// button was named only by its 🎤; it gets a label too. The emoji stay as the
// visual-less fallback earlier tests pin.
const { makeRunner, readIndexSource, extractFunction, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-a11y-emoji-names.js');
const src = readIndexSource();

function swipeRow(label){
  const { window } = runJsdom('<div id="list"></div>', '',
    [extractFunction(src, 'buildSwipeItem'), extractFunction(src, 'makeSwipeable'),
     `document.getElementById('list').innerHTML = buildSwipeItem('<div class="row">Row</div>');
      const item = document.querySelector('.swipe-item');
      ${label ? `item.querySelector('.swipe-delete-bg').setAttribute('aria-label', ${JSON.stringify(label)});` : ''}
      makeSwipeable(item, () => { window.__deleted = true; });`]);
  return window;
}

test('REAL invocation (v3.487): every swipe row\'s strip is a button named Delete, and a tap still deletes', async (assert)=>{
  const w = swipeRow();
  const bg = w.document.querySelector('.swipe-delete-bg');
  assert.ok(bg.textContent.includes('🗑'), 'anchor: the emoji fallback is still there');
  assert.strictEqual(bg.getAttribute('role'), 'button');
  assert.strictEqual(bg.getAttribute('aria-label'), 'Delete');
  bg.click();
  await new Promise(r => setTimeout(r, 260)); // the row's 200ms collapse comes first
  assert.strictEqual(w.__deleted, true, 'tapping it still deletes');
});

test('REAL invocation (v3.487): a caller\'s own label is kept', (assert)=>{
  const bg = swipeRow('Hide until tomorrow').document.querySelector('.swipe-delete-bg');
  assert.strictEqual(bg.getAttribute('aria-label'), 'Hide until tomorrow');
  assert.strictEqual(bg.getAttribute('role'), 'button');
});

test('REAL invocation (v3.487): Describe a Meal\'s mic button is named for what it does', (assert)=>{
  const { window } = runJsdom('<div id="describeFoodVoiceSlot"></div>', 'var SpeechRecognitionCtor = function(){};',
    [extractFunction(src, 'initDescribeFoodVoice'), 'initDescribeFoodVoice();']);
  const btn = window.document.querySelector('#describeFoodVoiceSlot .voice-log-btn');
  assert.ok(btn, 'anchor: the real button was built');
  assert.strictEqual(btn.getAttribute('aria-label'), 'Speak your description');
});

run();
