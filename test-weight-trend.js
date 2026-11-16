'use strict';
// v3.576 (BL-16): a smoothed trend weight, with pace from the trend.
// computeWeightTrend is exponential smoothing at 10% a day, gap-aware (alpha =
// 1 - 0.9^days since the previous weigh-in), seeded with the first weigh-in;
// it runs over all entries and is then cut to the range. renderSparkline draws
// it as .weight-trend-line over the raw line; over a range of 14+ days, pace is
// the trend's change since the latest weigh-in at least 14 days back, and the
// goal sentence reads the trend's last value.
//
// Real invocation: the real computeWeightTrend and renderSparkline (with the
// real getTodayKey, dateKeyMinusDays, getAnalysisTrendRangeDays, fmtWeight
// and describeGoalPace, as test-goal-weight.js loads them), in jsdom.
//
// Sabotage: alpha = 1 (the trend equals the raw series) and criteria 1 and 4
// fail.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-weight-trend.js');
const fns = (...names) => names.map(n => extractFunction(src, n));
const BASE = fns('getTodayKey', 'dateKeyMinusDays', 'getAnalysisTrendRangeDays', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'parseDateKey', 'formatDate', 'computeWeightTrend');
const key = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };

function mount(entries, {goal = null, stubPace = false} = {}){
  const { window } = runJsdom('<div id="weightChart"></div>', `var weightUnit = 'lb'; var LB_PER_KG = 0.453592; var userProfile = ${JSON.stringify(goal ? {goalWeight: goal} : {})};`,
    [...BASE, stubPace ? 'window.__pace = []; function describeGoalPace(...a){ window.__pace.push(a); return ""; }' : extractFunction(src, 'describeGoalPace'),
     extractFunction(src, 'renderSparkline'), `renderSparkline(${JSON.stringify(entries)});`]);
  return window;
}
const trendOf = (entries) => { const { window } = runJsdom('', '', [extractFunction(src, 'computeWeightTrend'), `window.__t = JSON.stringify(computeWeightTrend(${JSON.stringify(entries)}));`]); return JSON.parse(window.__t); };

test('criterion 1: 20 daily weigh-ins at 180.0, then one at 184.0: the last trend value is 180.4', (assert)=>{
  const entries = [...Array.from({length: 20}, (_, i) => ({date: key(20 - i), weight: 180})), {date: key(0), weight: 184}];
  const t = trendOf(entries);
  assert.strictEqual(t[0], 180, 'seeded with the first weigh-in');
  assert.ok(Math.abs(t[t.length - 1] - 180.4) < 1e-9, String(t[t.length - 1]));
});

test('criterion 2: a two-day gap gives alpha 0.19 for the next point', (assert)=>{
  const t = trendOf([{date: '2026-11-01', weight: 180}, {date: '2026-11-03', weight: 190}]);
  assert.ok(Math.abs((t[1] - 180) / 10 - 0.19) < 0.001, String(t[1]));
});

test('criterion 3: the chart has exactly one .weight-trend-line with one point per weigh-in in range', (assert)=>{
  const entries = [0, 3, 6, 9, 12].map((d, i) => ({date: key(d), weight: 180 + i}));
  const w = mount(entries);
  const lines = w.document.querySelectorAll('#weightChart polyline.weight-trend-line');
  assert.strictEqual(lines.length, 1);
  assert.strictEqual(lines[0].getAttribute('points').trim().split(/\s+/).length, 5);
  assert.strictEqual(w.document.querySelectorAll('#weightChart polyline').length, 2, 'the raw line stays');
});

test('criterion 4: 60 daily weigh-ins falling 0.5 lb a week, range all: "About 0.5 lb a week loss"', (assert)=>{
  const entries = Array.from({length: 60}, (_, i) => ({date: key(59 - i), weight: 200 - i * 0.5 / 7}));
  const note = mount(entries).document.querySelector('#weightChart .goal-feedback-neutral').textContent;
  assert.match(note, /^About 0\.5 lb a week loss over this window\./, note);
});

test('criterion 4 (the point of it): a 4 lb water-heavy last morning on a steady 60-day loss still reads as a loss (first-to-last raw would read about flat)', (assert)=>{
  const entries = Array.from({length: 60}, (_, i) => ({date: key(59 - i), weight: 200 - i * 0.5 / 7}));
  entries[59] = {...entries[59], weight: entries[59].weight + 4};
  const note = mount(entries).document.querySelector('#weightChart .goal-feedback-neutral').textContent;
  assert.match(note, /^About 0\.[2-5] lb a week loss/, note);
});

test('criterion 5: fewer than 2 weigh-ins keeps the empty note; under 4 gives no pace sentence', (assert)=>{
  assert.match(mount([{date: key(0), weight: 180}]).document.getElementById('weightChart').textContent, /Log at least two weigh-ins to see your trend\./);
  const three = mount([0, 7, 14].map((d, i) => ({date: key(d), weight: 180 + i})));
  assert.strictEqual(three.document.querySelector('#weightChart .goal-feedback-neutral'), null);
});

test('criterion 6: with a goal set, describeGoalPace gets the trend\'s last value, not the last raw weigh-in', (assert)=>{
  const entries = [...Array.from({length: 20}, (_, i) => ({date: key(20 - i), weight: 180})), {date: key(0), weight: 184}];
  const w = mount(entries, {goal: 170, stubPace: true});
  assert.strictEqual(w.__pace.length, 1);
  assert.ok(Math.abs(w.__pace[0][0] - 180.4) < 1e-9, String(w.__pace[0][0]));
  assert.strictEqual(w.__pace[0][1], 170);
});

run();
