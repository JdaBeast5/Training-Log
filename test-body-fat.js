'use strict';
// Body fat (owner: "Let's do them all", after a review: Measurements had no
// body-fat field, so a recomp couldn't see lean and fat mass apart).
//
// v3.473 — The field. An optional "Body fat (%)" in Measurements, for a
// reading from whatever you use (a scale, calipers, a scan). The app never
// estimates it. Saved on the same entry as the tape; enough on its own to
// save; shown in the card's summary and in each row in its own unit.
const { makeRunner, readIndexSource, extractFunction, extractElementById, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-body-fat.js');
const src = readIndexSource();

test('REAL invocation (v3.473): readBodyFat takes a plausible percentage and nothing else', (assert)=>{
  const { window } = runJsdom('', '', [extractFunction(src, 'readBodyFat')]);
  assert.strictEqual(window.readBodyFat('18.5'), 18.5);
  for(const bad of ['', '0', '1', '71', '-4', 'abc']) assert.strictEqual(window.readBodyFat(bad), null, JSON.stringify(bad));
});

test('REAL invocation (v3.473): a row shows the tape in inches and body fat in %, with no stray inch mark', (assert)=>{
  const { window } = runJsdom('', '', [extractFunction(src, 'measureRowText')]);
  assert.strictEqual(window.measureRowText({waist:'32', chest:'40'}), 'W:32 C:40"', 'unchanged for tape-only entries');
  assert.strictEqual(window.measureRowText({waist:'32', bodyFat:18}), 'W:32" · 18% fat');
  assert.strictEqual(window.measureRowText({bodyFat:18}), '18% fat');
});

function measureCard(stored){
  const { window } = runJsdom(extractElementById(src, 'measureExpandWrap') + '<div id="measureSummary"></div>', `
    window.__store = ${JSON.stringify(stored || {})};
    window.storage = { get: async k => k in window.__store ? { value: window.__store[k] } : null, set: async (k, v) => { window.__store[k] = v; } };
    var selectedLogDate = '2026-10-28';
    window.buildSwipeItem = h => '<div class="swipe-item">' + h + '</div>';
    window.renderCollapsibleList = (el, items) => { el.innerHTML = items.join(''); };
    window.wireSwipeDeleteList = () => {};`,
    [extractFunction(src, 'measureRowText'), extractFunction(src, 'readBodyFat'), extractFunction(src, 'loadMeasurements'),
     (() => { const start = src.indexOf("document.getElementById('saveMeasurements').addEventListener('click'"); return src.slice(start, src.indexOf('\n});', start) + 4); })()]);
  return window;
}

test('REAL invocation (v3.473): body fat alone saves, is stored on the entry, and shows in the summary and the list', async (assert)=>{
  const w = measureCard();
  const doc = w.document;
  assert.ok(doc.getElementById('mBodyFat'), 'anchor: the real field');
  doc.getElementById('mBodyFat').value = '18.5';
  doc.getElementById('saveMeasurements').click();
  await new Promise(r => setTimeout(r, 20));
  const saved = JSON.parse(w.__store['measurements-log']);
  assert.strictEqual(saved.length, 1);
  assert.strictEqual(saved[0].bodyFat, 18.5);
  assert.strictEqual(saved[0].waist, null);
  assert.strictEqual(doc.getElementById('mBodyFat').value, '', 'cleared after saving');
  assert.strictEqual(doc.getElementById('measureSummary').textContent, 'Latest: Body fat 18.5%');
  assert.strictEqual(doc.querySelector('#measureList .weight-item span:last-child').textContent, '18.5% fat');
});

test('REAL invocation (v3.473): an empty form still asks for at least one measurement', async (assert)=>{
  const w = measureCard();
  w.document.getElementById('saveMeasurements').click();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(w.__store['measurements-log'], undefined);
  assert.strictEqual(w.document.getElementById('measureStatus').textContent, 'Enter at least one measurement');
});

run();
