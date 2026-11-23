'use strict';
// v3.640 (BL-34, audit M-4): the e1RM behind RPE-mode load targets counts the
// reps a logged RPE left in reserve: w × (1 + (reps + 10 − RPE)/30). RPE-mode
// targets only (owner, D3, 2026-11-08): estimated1RM, the PR history, the e1RM
// charts and the double-progression step are unchanged.
//
// Real invocation: the real buildPastSessions, recentBestE1RM, rpeAdjustedE1RM,
// estimated1RM, loadForRpeTarget, computeSuggestedSet (RPE mode) and
// reconstructAllPRs. Sabotage: put the adjustment inside estimated1RM, and
// criterion 3 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rpe-adjusted-e1rm.js');

const FN = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay' /* v3.641 (BL-32) */, 'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep',
  'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight',
  'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad', 'estimated1RM', 'rpeAdjustedE1RM', 'recentBestE1RM',
  'isMissedSet', 'topSetOf', 'sessionTopOf', 'buildPastSessions', 'normalizeExEntry', 'canonicalExName', 'groupCorpusByExercise'];
const CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS',
  'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'RPE_E1RM_LOOKBACK_SESSIONS', 'EXERCISE_CANONICAL'];
const chunks = (e1rmSrc) => [
  "var loadSuggestionMode = 'rpe'; var activeProgram = 'strength'; var selectedLogDate = '2026-11-23';",
  ...CONSTS.map(n => extractConst(src, n)),
  ...FN.map(n => n === 'estimated1RM' && e1rmSrc ? e1rmSrc : extractFunction(src, n)),
];
const sbx = (body, e1rmSrc) => runSandbox(chunks(e1rmSrc), body)[0];
const LOG = (rpe) => JSON.stringify([{date: '2026-11-16', sets: [{weight: 100, reps: 8, rpe}, {weight: 90, reps: 8, rpe: 6}]}]);

test('criterion 1: recentBestE1RM over a 100×8 @ RPE 7 top set returns 137; with no RPE, 127', (assert)=>{
  const r = sbx(`__capture.push({rpe: recentBestE1RM(buildPastSessions(${LOG(7)}, null)), none: recentBestE1RM(buildPastSessions(${LOG(null)}, null)),
    past: buildPastSessions(${LOG(7)}, null)[0]});`);
  assert.strictEqual(r.rpe, 137);
  assert.strictEqual(r.none, 127);
  assert.strictEqual(r.past.topSetRpe, 7, "buildPastSessions carries the top set's own RPE");
  assert.strictEqual(r.past.topRpe, 7, 'and the existing fields are unchanged');
});

test('criterion 2: estimated1RM(100, 8) still returns 127; the plain option and out-of-range RPEs give the plain figure', (assert)=>{
  const r = sbx(`const p = buildPastSessions(${LOG(7)}, null);
    __capture.push({e: estimated1RM(100, 8), plain: recentBestE1RM(p, {plain: true}),
      r5: rpeAdjustedE1RM(100, 8, 5), r10: rpeAdjustedE1RM(100, 8, 10), over: rpeAdjustedE1RM(100, 12, 6)});`);
  assert.strictEqual(r.e, 127);
  assert.strictEqual(r.plain, 127, 'the progression step stays on the plain figure');
  assert.strictEqual(r.r5, 127, 'RPE 5 is out of range: plain');
  assert.strictEqual(r.r10, 127, 'RPE 10 is failure: the same as plain');
  assert.strictEqual(r.over, 140, '12 reps + 4 in reserve passes the 15-rep ceiling: the plain 100×12 figure, not none');
});

const PR_LOG = JSON.stringify([
  {key: 'ex:strength:d1:0', parsed: {program: 'strength', dayId: 'd1', idx: 0, dayLabel: 'Strength · Day 1'}, exDef: {name: 'Bench Press', sets: '3×8'}, log: [
    {date: '2026-10-01', sets: [{weight: 100, reps: 8, rpe: 7}]},
    {date: '2026-10-08', sets: [{weight: 100, reps: 10, rpe: 9}]},
    {date: '2026-10-15', sets: [{weight: 105, reps: 6, rpe: 8}]},
  ]}]);
const prEvents = async (e1rmSrc) => (await runSandboxAsync([...chunks(e1rmSrc), `async function readExCorpusWithImported(){ return ${PR_LOG}; }`, extractFunction(src, 'reconstructAllPRs')],
  '__capture.push(await reconstructAllPRs());'))[0];

test('criterion 3: reconstructAllPRs over sets carrying RPE gives the same events (dates, types, e1rm) as plain Epley', async (assert)=>{
  const plainEpley = 'function estimated1RM(weight, reps){ if(weight==null || reps==null || reps<=0) return null; if(reps>15) return null; return Math.round(weight * (1 + reps/30)); }';
  const now = await prEvents();
  const before = await prEvents(plainEpley);
  assert.ok(Array.isArray(now) && now.length >= 2, 'anchor: events');
  assert.strictEqual(JSON.stringify(now.map(e => [e.date, e.type, e.e1rm])), JSON.stringify(before.map(e => [e.date, e.type, e.e1rm])));
});

test('criterion 4: RPE mode week 2 (RPE 8): a prior 100×8 @ RPE 7 gives the 8-rep load from 137, not from 127', (assert)=>{
  const r = sbx(`
    const ex = {name: 'Bench Press', sets: '3×8'};
    const e1rm = recentBestE1RM(buildPastSessions(${LOG(7)}, null));
    const sug = computeSuggestedSet({weight: 100, reps: 8}, null, false, 'push', ex, null, {e1rm, week: 2, program: 'strength', category: 'push'});
    const at = v => snapToLoadable(toDisplayWeight(loadForRpeTarget(v, 8, targetRpeForWeek(2))), ex.name, 'down');
    __capture.push({e1rm, sug, from137: at(137), from127: at(127), target: targetRpeForWeek(2)});`);
  assert.strictEqual(r.target, 8, 'anchor: week 2 is RPE 8');
  assert.strictEqual(r.e1rm, 137);
  assert.notStrictEqual(r.from137, r.from127, 'anchor: the two e1RMs give different loads');
  assert.strictEqual(r.sug.weight, r.from137);
});

test('double progression (not RPE mode): the suggested step comes from the plain e1RM, so the weight matches the badge', (assert)=>{
  const r = sbx(`
    loadSuggestionMode = 'double';
    const ex = {name: 'Squat', sets: '3×5'};
    const past = buildPastSessions([{date: '2026-11-16', sets: [{weight: 340, reps: 5, rpe: 7}]}], null);
    const withPlain = computeSuggestedSet({weight: 340, reps: 5}, {type: 'increase'}, false, 'squat', ex, null, {e1rm: recentBestE1RM(past), stepE1rm: recentBestE1RM(past, {plain: true}), week: 1, program: 'strength', category: 'squat'});
    const plainOnly = computeSuggestedSet({weight: 340, reps: 5}, {type: 'increase'}, false, 'squat', ex, null, {e1rm: recentBestE1RM(past, {plain: true}), week: 1, program: 'strength', category: 'squat'});
    __capture.push({adj: recentBestE1RM(past), plain: recentBestE1RM(past, {plain: true}), a: withPlain && withPlain.weight, b: plainOnly && plainOnly.weight});`);
  assert.ok(r.adj > r.plain, 'anchor: the two e1RMs differ');
  assert.ok(r.a != null && r.a > 340, 'anchor: a real increase was suggested: ' + r.a);
  assert.strictEqual(r.a, r.b, 'the same suggestion as with the plain e1RM alone');
});

test('REAL source: only the RPE-mode readers take the adjusted figure; the step asks for the plain one', (assert)=>{
  assert.strictEqual((src.match(/stepE1rm: recentBestE1RM\((pastSessions|past), \{plain: true\}\)/g) || []).length, 2, 'both rpeCtx builders pass the plain step figure');
  assert.match(extractFunction(src, 'computeSuggestedSet'), /rpeCtx\.stepE1rm !== undefined \? rpeCtx\.stepE1rm : rpeCtx\.e1rm/);
  assert.match(extractFunction(src, 'analyzeProgressionSignal'), /recentBestE1RM\(pastSessions, \{plain: true\}\)/);
  assert.doesNotMatch(extractFunction(src, 'estimated1RM'), /rpe/i, 'estimated1RM is unchanged');
});

run();
