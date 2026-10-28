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

// v3.474 — Lean and fat mass. Analysis' Body Metrics turns each body-fat
// reading into lean and fat mass, using a weigh-in from within 3 days (the
// nearest), and says how each moved since a reading at least two weeks
// earlier. A reading with no weigh-in near it is left out, not paired with a
// stale profile weight.
function comp(){
  return runJsdom('<div id="out"></div>', "var weightUnit = 'lb'; var LB_PER_KG = 0.453592;",
    ['parseDateKey', 'formatDate', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'computeBodyComposition', 'bodyCompositionHtml'].map(n => extractFunction(src, n))
      .concat([require('./testHelpers.js').extractConst(src, 'BODY_COMP_PAIR_DAYS')])).window;
}

test('REAL invocation (v3.474): each reading pairs with the nearest weigh-in within 3 days; the change runs from one at least 14 days back', (assert)=>{
  const w = comp();
  const r = w.computeBodyComposition(
    [{date:'2026-09-28', bodyFat:20}, {date:'2026-10-20', bodyFat:19}, {date:'2026-10-26', bodyFat:18}, {date:'2026-10-27', waist:'32'}],
    [{date:'2026-09-30', weight:184}, {date:'2026-10-19', weight:181}, {date:'2026-10-25', weight:180}, {date:'2026-10-27', weight:179}]);
  assert.strictEqual(r.latest.date, '2026-10-26');
  assert.strictEqual(r.latest.weight, 180, 'Oct 25 and Oct 27 are both a day away; the first found nearest wins');
  assert.strictEqual(r.latest.fat, 32.4);
  assert.ok(Math.abs(r.latest.lean - 147.6) < 1e-9);
  assert.strictEqual(r.since.date, '2026-09-28', 'Oct 20 is only 6 days back');
  assert.ok(Math.abs(r.since.fat - (32.4 - 36.8)) < 1e-9, 'Sep 28 pairs with Sep 30 (2 days)');
  assert.ok(Math.abs(r.since.lean - (147.6 - 147.2)) < 1e-9);
});

test('REAL invocation (v3.474): no weigh-in near a reading, or no readings, means nothing to show', (assert)=>{
  const w = comp();
  assert.strictEqual(w.computeBodyComposition([{date:'2026-10-26', bodyFat:18}], [{date:'2026-10-10', weight:180}]), null);
  assert.strictEqual(w.computeBodyComposition([{date:'2026-10-26', waist:'32'}], [{date:'2026-10-26', weight:180}]), null);
  assert.strictEqual(w.bodyCompositionHtml(null), '');
});

test('REAL invocation (v3.474): the block says lean and fat, the reading behind them, and each one\'s change', (assert)=>{
  const w = comp();
  const html = w.bodyCompositionHtml(w.computeBodyComposition(
    [{date:'2026-09-28', bodyFat:20}, {date:'2026-10-26', bodyFat:18}], [{date:'2026-09-28', weight:184}, {date:'2026-10-26', weight:180}]));
  w.document.getElementById('out').innerHTML = html;
  const text = w.document.querySelector('.goal-feedback-neutral').textContent;
  assert.strictEqual(text, 'About 147.6 lb lean, 32.4 lb fat at 18% body fat and 180 lb (Oct 26).Since Sep 28: lean +0.4 lb, fat −4.4 lb.');
  assert.match(w.document.querySelector('.history-hint').textContent, /off by several points/);
});

test('REAL source (v3.474): Body Metrics fetches weigh-ins and leads with the composition block', (assert)=>{
  assert.match(extractFunction(src, 'renderBodyMetrics'), /Promise\.all\(\[fetchAllMeasurements\(\), fetchAllWeightEntries\(\)\]\)/);
  const build = extractFunction(src, 'buildBodyMetricsHtml');
  assert.match(build, /if\(!whtr && deltas\.length === 0 && !comp\) return null;/, 'a body-fat reading alone is enough to show the card');
  assert.ok(build.indexOf('bodyCompositionHtml(comp)') < build.indexOf('if(whtr){'), 'composition first');
});

run();
