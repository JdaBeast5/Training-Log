'use strict';
// Behavioral coverage for computeMeasurementDeltas / recogniseMeasurementProgress
// — Tier 2. Plain first-to-last deltas over a lookback window, deliberately
// with no judgement attached (per the code's own comment) — and a separate
// "only ever celebrates, never a bad-direction message" progress-recognition
// layer on top. Dates are built relative to the real system clock (same
// pattern as test-streak.js/test-backdating.js) since computeMeasurementDeltas
// calls getTodayKey() with no injection point.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const deltaChunks = [
  extractFunction(src, 'getTodayKey'),
  extractConst(src, 'MEASURE_FIELDS'),
  extractFunction(src, 'computeMeasurementDeltas'),
];

function daysAgo(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const { test, run } = makeRunner('test-measurement-deltas.js');

test('computes a first-to-last delta for a field spanning >=14 days inside the window', (assert)=>{
  const [deltas] = runSandbox(deltaChunks, `
    var entries = [
      {date: ${JSON.stringify(daysAgo(20))}, waist: 34.5},
      {date: ${JSON.stringify(daysAgo(0))}, waist: 33.8},
    ];
    __capture.push(computeMeasurementDeltas(entries, 90));
  `);
  assert.strictEqual(deltas.length, 1);
  assert.strictEqual(deltas[0].key, 'waist');
  assert.strictEqual(deltas[0].delta, -0.7);
  assert.strictEqual(deltas[0].latest, 33.8);
});

test('a field spanning less than 14 days is excluded even with 2+ valid points', (assert)=>{
  const [deltas] = runSandbox(deltaChunks, `
    var entries = [
      {date: ${JSON.stringify(daysAgo(10))}, waist: 34.5},
      {date: ${JSON.stringify(daysAgo(0))}, waist: 33.8},
    ];
    __capture.push(computeMeasurementDeltas(entries, 90));
  `);
  assert.deepStrictEqual(deltas, [], 'span of 10 days must not qualify');
});

test('a field logged in only one of the two window entries is skipped for that field alone', (assert)=>{
  const [deltas] = runSandbox(deltaChunks, `
    var entries = [
      {date: ${JSON.stringify(daysAgo(20))}, waist: 34.5}, // no chest here
      {date: ${JSON.stringify(daysAgo(0))}, waist: 33.8, chest: 40},
    ];
    __capture.push(computeMeasurementDeltas(entries, 90));
  `);
  const keys = deltas.map(d=> d.key);
  assert.ok(keys.includes('waist'));
  assert.ok(!keys.includes('chest'), 'chest only has 1 valid point in-window, must not appear');
});

test('entries outside the lookback window are excluded before anything else is computed', (assert)=>{
  const [deltas] = runSandbox(deltaChunks, `
    var entries = [
      {date: ${JSON.stringify(daysAgo(200))}, waist: 40}, // outside a 30-day lookback
      {date: ${JSON.stringify(daysAgo(0))}, waist: 33.8},
    ];
    __capture.push(computeMeasurementDeltas(entries, 30));
  `);
  assert.deepStrictEqual(deltas, [], 'only 1 entry falls inside the window, so nothing qualifies');
});

test('fewer than 2 entries in the window overall returns [] immediately', (assert)=>{
  const [deltas] = runSandbox(deltaChunks, `
    __capture.push(computeMeasurementDeltas([{date: ${JSON.stringify(daysAgo(0))}, waist: 33.8}], 90));
  `);
  assert.deepStrictEqual(deltas, []);
});

const progressChunks = [extractFunction(src, 'recogniseMeasurementProgress')];

test('a losing goal with waist down >=0.5" over enough weeks gets a celebratory message', (assert)=>{
  const [msg] = runSandbox(progressChunks, `
    var deltas = [{key:'waist', label:'Waist', delta:-0.6, span:21, latest:33}];
    __capture.push(recogniseMeasurementProgress({goal:'lose'}, deltas));
  `);
  assert.ok(msg.includes('0.6'));
  assert.ok(msg.includes('3 weeks'));
});

test('a gain goal with real growth in arms/chest/thighs gets a celebratory message naming them', (assert)=>{
  const [msg] = runSandbox(progressChunks, `
    var deltas = [{key:'arms', label:'Arms', delta:0.3, span:21, latest:14}];
    __capture.push(recogniseMeasurementProgress({goal:'gain'}, deltas));
  `);
  assert.ok(msg.includes('arms +0.3'));
});

test('a recomp goal with waist steady AND growth elsewhere gets the recomp-specific message', (assert)=>{
  const [msg] = runSandbox(progressChunks, `
    var deltas = [
      {key:'waist', label:'Waist', delta:-0.1, span:21, latest:33},
      {key:'arms', label:'Arms', delta:0.3, span:21, latest:14},
    ];
    __capture.push(recogniseMeasurementProgress({goal:'recomp'}, deltas));
  `);
  assert.ok(msg.includes('holding steady'));
  assert.ok(msg.includes('arms'));
});

test('never returns a message for movement in the wrong direction — only celebrates or says nothing', (assert)=>{
  const [msg] = runSandbox(progressChunks, `
    var deltas = [{key:'waist', label:'Waist', delta:0.4, span:21, latest:34}]; // waist UP, goal is to lose
    __capture.push(recogniseMeasurementProgress({goal:'lose'}, deltas));
  `);
  assert.strictEqual(msg, null);
});

run();
