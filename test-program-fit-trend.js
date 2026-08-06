'use strict';
// Behavioral coverage for the program-fit trend engine — Tier 2, last item.
// Two pure pieces tested directly: analyzeProgressionSignal (the per-exercise
// double-progression / RPE-autoregulation signal detector) and
// buildProgramFitInsight (aggregates those signals across a program into a
// program-wide verdict). computeProgramFitTrend itself (the orchestration
// that walks every exercise in the active program, applying substitutions
// and reading each one's real storage log) is intentionally not covered
// here — it's mostly a loop wiring together pieces this file already tests
// directly, and duplicating a full programs+storage mock for it would test
// plumbing more than logic. What matters most (and is easiest to get subtly
// wrong) is the signal math and the aggregate-to-verdict thresholds, both
// covered below.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const signalChunks = [
  extractFunction(src, 'parseTopRep'),
  extractFunction(src, 'parseBottomRep'),
  extractConst(src, 'CATEGORY_LOAD_INCREMENT'),
  extractFunction(src, 'getLoadIncrement'),
  `function fmtWeight(lb){ return lb + ' lb'; }`, // display-only formatting, irrelevant to the signal logic under test
  extractFunction(src, 'analyzeProgressionSignal'),
];

const { test, run } = makeRunner('test-program-fit-trend.js');

test('fewer than 2 past sessions -> no signal (not enough data)', (assert)=>{
  const [signal] = runSandbox(signalChunks, `
    __capture.push(analyzeProgressionSignal([{date:'2026-01-01', weight:100, reps:10, avgRpe:8}], {sets:'3x8-10'}, 'squat'));
  `);
  assert.strictEqual(signal, null);
});

test('increase: top-of-range hit for 2 sessions straight at the same weight, with RPE room to spare', (assert)=>{
  const [signal] = runSandbox(signalChunks, `
    var sessions = [
      {date:'2026-01-15', weight:100, reps:11, avgRpe:8},
      {date:'2026-01-08', weight:100, reps:10, avgRpe:7.5},
    ];
    __capture.push(analyzeProgressionSignal(sessions, {sets:'3x8-10'}, 'squat'));
  `);
  assert.strictEqual(signal.type, 'increase');
  assert.ok(signal.message.includes('10 lb'), 'squat category load increment is 10 lb');
});

test('increase does NOT fire when RPE is already maxed out, even with reps met', (assert)=>{
  const [signal] = runSandbox(signalChunks, `
    var sessions = [
      {date:'2026-01-15', weight:100, reps:11, avgRpe:9.5},
      {date:'2026-01-08', weight:100, reps:10, avgRpe:9},
    ];
    __capture.push(analyzeProgressionSignal(sessions, {sets:'3x8-10'}, 'squat'));
  `);
  assert.notStrictEqual(signal && signal.type, 'increase', 'RPE 9+ means no room to spare, even though reps hit the top of range');
});

test('decrease: reps fell below the rep floor at the same or heavier weight', (assert)=>{
  const [signal] = runSandbox(signalChunks, `
    var sessions = [
      {date:'2026-01-15', weight:105, reps:6, avgRpe:9},
      {date:'2026-01-08', weight:100, reps:9, avgRpe:8},
    ];
    __capture.push(analyzeProgressionSignal(sessions, {sets:'3x8-10'}, 'squat'));
  `);
  assert.strictEqual(signal.type, 'decrease');
});

test('deload takes priority over what would otherwise read as decrease: 3 sessions of RPE 9+ with no progress', (assert)=>{
  const [signal] = runSandbox(signalChunks, `
    var sessions = [
      {date:'2026-01-15', weight:100, reps:8, avgRpe:9},
      {date:'2026-01-08', weight:100, reps:8, avgRpe:9.5},
      {date:'2026-01-01', weight:100, reps:8, avgRpe:9},
    ];
    __capture.push(analyzeProgressionSignal(sessions, {sets:'3x8-10'}, 'squat'));
  `);
  assert.strictEqual(signal.type, 'deload');
});

test('no signal (hold) when nothing meaningful changed and RPE is not maxed', (assert)=>{
  const [signal] = runSandbox(signalChunks, `
    var sessions = [
      {date:'2026-01-15', weight:100, reps:9, avgRpe:7},
      {date:'2026-01-08', weight:100, reps:9, avgRpe:7},
    ];
    __capture.push(analyzeProgressionSignal(sessions, {sets:'3x8-10'}, 'squat'));
  `);
  assert.strictEqual(signal, null);
});

const insightChunks = [
  extractConst(src, 'PROGRAM_FIT_MIN_SAMPLE'),
  extractFunction(src, 'buildProgramFitInsight'),
];

test('below the minimum sample size, no verdict is drawn even with a 100% trouble ratio', (assert)=>{
  const [insight] = runSandbox(insightChunks, `
    __capture.push(buildProgramFitInsight({increase:0, decrease:2, deload:1, hold:0, total:3}));
  `);
  assert.strictEqual(insight, null, 'total=3 is below PROGRAM_FIT_MIN_SAMPLE=4');
});

test('a >=40% trouble ratio (decrease+deload) at a valid sample size reads as overreaching', (assert)=>{
  const [insight] = runSandbox(insightChunks, `
    __capture.push(buildProgramFitInsight({increase:0, decrease:2, deload:1, hold:1, total:4}));
  `);
  assert.strictEqual(insight.status, 'overreaching');
});

test('a >=50% increase ratio with <15% trouble reads as thriving', (assert)=>{
  const [insight] = runSandbox(insightChunks, `
    __capture.push(buildProgramFitInsight({increase:3, decrease:0, deload:0, hold:1, total:4}));
  `);
  assert.strictEqual(insight.status, 'thriving');
});

test('a >=50% increase ratio is NOT enough for thriving if the trouble ratio also clears 15%', (assert)=>{
  const [insight] = runSandbox(insightChunks, `
    __capture.push(buildProgramFitInsight({increase:2, decrease:1, deload:0, hold:1, total:4}));
  `);
  assert.strictEqual(insight, null, 'increaseRatio=0.5 but troubleRatio=0.25 (>=0.15) must stay a mixed/no-verdict picture');
});

run();
