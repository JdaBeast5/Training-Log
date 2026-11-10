'use strict';
// v3.537 (BL-77): a set logged with 0 reps is a miss, not a made lift.
// A set saved with a weight and 0 reps used to count as the heaviest set, so
// a missed lift at a new weight showed as a PR and as "best ever". Read-time
// only: nothing stored changes. A set with reps == null (weight-only logging)
// keeps its old behaviour.
//
// Real invocation: the real topSetOf, maxWeightEver, buildPastSessions,
// saveExSet (stubbed storage, not backdating) and reconstructAllPRs (real
// readExCorpus, parseExKey and groupCorpusByExercise over stubbed storage).
//
// Sabotage: drop the 0-rep skip in topSetOf and criteria 1, 2, 3 and 6 fail;
// drop the r !== 0 check in saveExSet's isPR and criterion 4 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-zero-rep-miss.js');

const pure = (body) => runSandbox(['isMissedSet', 'topSetOf', 'sessionTopOf', 'maxWeightEver', 'buildPastSessions'].map(f => extractFunction(src, f)).concat(["var selectedLogDate = '2026-11-09';"]), body)[0];

test('criterion 1: topSetOf skips a 0-rep set: [210×0, 200×2] → 200×2', (assert)=>{
  assert.deepStrictEqual(pure(`__capture.push(topSetOf({sets:[{weight:210,reps:0},{weight:200,reps:2}]}));`), {weight: 200, reps: 2});
});

test('criterion 2: a weight-only set (reps null) still counts; a lone 0-rep set gives no top set', (assert)=>{
  assert.deepStrictEqual(pure(`__capture.push(topSetOf({sets:[{weight:210,reps:null}]}));`), {weight: 210, reps: null});
  assert.strictEqual(pure(`__capture.push(topSetOf({sets:[{weight:210,reps:0}]}));`), null);
});

function prRun(newer){
  const logs = {'ex:strength:d1:0': [{date: '2026-11-01', sets: [{weight: 200, reps: 2}]}, {date: '2026-11-05', sets: [newer]}]};
  return runSandboxAsync([
    `var window = { storage: {
       list: async () => ({keys: ${JSON.stringify(Object.keys(logs))}}),
       get: async (k) => ({value: JSON.stringify(${JSON.stringify(logs)}[k])}),
     }};
     var COMBAT_STYLES = {}, CYCLING_STYLES = {}, WATERSPORTS_STYLES = {}, MEDICAL_STYLES = {};
     var programs = { strength: { label: 'Strength & Size', days: { d1: { label: 'Day 1', exercises: [ {name: 'Back Squat'} ] } } } };
     var exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null, exCorpusGen = 0;`,
    ...['normalizeExEntry', 'parseExKey', 'isMissedSet', 'topSetOf', 'estimated1RM', 'groupCorpusByExercise', 'readExCorpus', 'reconstructAllPRs'].map(f => extractFunction(src, f)),
  ], `__capture.push(await reconstructAllPRs());`);
}

test('criterion 3: reconstructAllPRs records no PR for a newer 210×0, and a weight PR for 210×1', async (assert)=>{
  const [miss] = await prRun({weight: 210, reps: 0});
  assert.deepStrictEqual(miss.map(e => e.date + ' ' + e.weight), ['2026-11-01 200'], 'only the first 200×2');
  const [made] = await prRun({weight: 210, reps: 1});
  const ev = made.find(e => e.date === '2026-11-05');
  assert.ok(ev, 'the 210×1 is a PR');
  assert.strictEqual(ev.type, 'weight');
  assert.strictEqual(ev.weight, 210);
});

function saveRun(weight, reps){
  return runSandboxAsync([
    `var window = {}; var __store = {'ex:strength:d1:0': JSON.stringify([{date: '2026-11-01', sets: [{weight: 200, reps: 2, rpe: null}]}])};
     window.storage = { get: async k => (k in __store) ? {value: __store[k]} : null, set: async (k, v) => { __store[k] = v; } };
     var activeProgram = 'strength', activeYogaStyle = 'flow', daysPerWeekPref = null, selectedLogDate = '2026-11-09';
     var restTargetBySlot = {}; var DAYS_PER_WEEK_PROGRAMS = [], DAYS_PER_WEEK_STYLE_CONTAINERS = [], PROGRAM_DAY_COUNT_VARIANTS = {};
     function isBackdating(){ return false; } function noteRestAchieved(){ return null; }
     function recordActivity(){ return Promise.resolve(); } function renderStreak(){} function markMilestone(){} function recordWorkoutTime(){}`,
    ...['exKey', 'slugifyExerciseName', 'normalizeExEntry', 'getExLog', 'entriesForExercise', 'legacyEntriesUnambiguous', 'todayEntryFor', 'isMissedSet', 'saveExSet'].map(f => extractFunction(src, f)),
  ], `const r = await saveExSet('d1', 0, 0, '${weight}', '${reps}', '', undefined, undefined, undefined, 'Back Squat');
      __capture.push({isPR: r.isPR, stored: JSON.parse(__store['ex:strength:d1:0']).find(e => e.date === '2026-11-09').sets[0]});`);
}

test('criterion 4: saveExSet over a stored 200×2: logging 210×0 is not a PR, 205×1 is; the 210×0 set is stored as it always was', async (assert)=>{
  const [miss] = await saveRun(210, 0);
  assert.strictEqual(miss.isPR, false);
  assert.strictEqual(JSON.stringify(miss.stored), '{"weight":210,"reps":0,"rpe":null}', 'nothing stored changes');
  const [made] = await saveRun(205, 1);
  assert.strictEqual(made.isPR, true);
});

test('criterion 5: maxWeightEver over [200×2, 210×0] is 200', (assert)=>{
  assert.strictEqual(pure(`__capture.push(maxWeightEver([{date:'2026-11-01', sets:[{weight:200,reps:2}]}, {date:'2026-11-05', sets:[{weight:210,reps:0}]}]));`), 200);
});

test('criterion 6: buildPastSessions over an entry [210×0, 200×2] reads the made lift (200×2), so the progression signal does too', (assert)=>{
  const r = pure(`__capture.push(buildPastSessions([{date:'2026-11-05', sets:[{weight:210,reps:0},{weight:200,reps:2}]}]));`);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].weight, 200);
  assert.strictEqual(r[0].reps, 2);
});

test('a later miss never raises the PR bar: after a stored 210×0, logging 205×1 over 200×2 is still a PR', async (assert)=>{
  const [r] = await runSandboxAsync([
    `var window = {}; var __store = {'ex:strength:d1:0': JSON.stringify([{date: '2026-11-01', sets: [{weight: 200, reps: 2}]}, {date: '2026-11-05', sets: [{weight: 210, reps: 0}]}])};
     window.storage = { get: async k => (k in __store) ? {value: __store[k]} : null, set: async (k, v) => { __store[k] = v; } };
     var activeProgram = 'strength', activeYogaStyle = 'flow', daysPerWeekPref = null, selectedLogDate = '2026-11-09';
     var restTargetBySlot = {}; var DAYS_PER_WEEK_PROGRAMS = [], DAYS_PER_WEEK_STYLE_CONTAINERS = [], PROGRAM_DAY_COUNT_VARIANTS = {};
     function isBackdating(){ return false; } function noteRestAchieved(){ return null; }
     function recordActivity(){ return Promise.resolve(); } function renderStreak(){} function markMilestone(){} function recordWorkoutTime(){}`,
    ...['exKey', 'slugifyExerciseName', 'normalizeExEntry', 'getExLog', 'entriesForExercise', 'legacyEntriesUnambiguous', 'todayEntryFor', 'isMissedSet', 'saveExSet'].map(f => extractFunction(src, f)),
  ], `__capture.push(await saveExSet('d1', 0, 0, '205', '1', '', undefined, undefined, undefined, 'Back Squat'));`);
  assert.strictEqual(r.priorMax, 200);
  assert.strictEqual(r.isPR, true);
});

test('review fix: an all-miss session still reads as a failed session, so the progression signal does not flip to increase', (assert)=>{
  const [r] = runSandbox([
    "var selectedLogDate = '2026-11-09'; var weightUnit = 'lb'; function fmtWeight(v){ return v + ' lb'; }",
    extractConst(src, 'CATEGORY_LOAD_INCREMENT'),
    ...['getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'isMissedSet', 'topSetOf', 'sessionTopOf', 'buildPastSessions', 'analyzeProgressionSignal'].map(f => extractFunction(src, f)),
  ], `
    const ex = {name: 'Back Squat', sets: '3×6-8'};
    const log = [
      {date: '2026-11-01', sets: [{weight: 200, reps: 8}, {weight: 200, reps: 8}]},
      {date: '2026-11-04', sets: [{weight: 200, reps: 8}, {weight: 200, reps: 8}]},
      {date: '2026-11-07', sets: [{weight: 210, reps: 0}, {weight: 210, reps: 0}, {weight: 210, reps: 0}]},
    ];
    const past = buildPastSessions(log);
    const sig = analyzeProgressionSignal(past, ex, 'squat', 'strength');
    __capture.push({n: past.length, newest: past[0], sig: sig && sig.type, mixedTop: sessionTopOf({sets: [{weight: 210, reps: 0}, {weight: 200, reps: 2}]})});`);
  assert.strictEqual(r.n, 3, 'the failed session is still a session');
  assert.deepStrictEqual([r.newest.weight, r.newest.reps], [210, 0], 'it reads as the miss, as before');
  assert.notStrictEqual(r.sig, 'increase', 'never told to go up right after missing every set');
  assert.deepStrictEqual(r.mixedTop, {weight: 200, reps: 2}, 'a mixed session reads its made lift');
});

run();
