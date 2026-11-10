'use strict';
// v3.553 (BL-09, audit H-7): readiness judges the week's RPE against the
// week's own target (rpeTargetFor), not a fixed 8.5: a full point over target,
// or 9.5 in any week. Without a target the old 8.5 rule stands.
//
// Real invocation: the real computeReadiness; the real getReadinessInsight
// with its data sources stubbed and the real rpeTargetFor, targetRpeForWeek,
// cycleWeekOf, RPE_BY_CYCLE_WEEK and DELOAD_CYCLE_WEEKS.
//
// Sabotage: revert the threshold to 8.5 and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-readiness-rpe-target.js');

const CORE = [...['READINESS_SLEEP_LOW', 'READINESS_RPE_HIGH', 'READINESS_DAYS_NO_REST', 'READINESS_RHR_RISE', 'READINESS_RPE_OVER_TARGET', 'READINESS_RPE_CEILING',
  'RPE_BY_CYCLE_WEEK', 'DELOAD_CYCLE_WEEKS'].map(c => extractConst(src, c)),
  ...['trimUnitNum', 'computeReadiness', 'cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor'].map(f => extractFunction(src, f))];
const flags = (args) => runSandbox(CORE, `const r = computeReadiness(${JSON.stringify(args)}); __capture.push(r ? r.flags.map(f => f.kind) : null);`)[0];
const target = (week, deload, program) => runSandbox(CORE, `__capture.push(rpeTargetFor(${week}, ${deload}, ${JSON.stringify(program)}));`)[0];

test('criterion 1: week 4 (target 9) with weekly RPE 9.0 is no rpe flag', (assert)=>{
  assert.strictEqual(target(4, false, 'strength'), 9, 'anchor: the real week-4 target');
  assert.deepStrictEqual(flags({weeklyRpe: 9.0, rpeTarget: 9}), []);
});

test('criterion 2: week 2 (target 8) with 9.2 is flagged', (assert)=>{
  assert.strictEqual(target(2, false, 'strength'), 8);
  assert.deepStrictEqual(flags({weeklyRpe: 9.2, rpeTarget: 8}), ['rpe']);
  assert.deepStrictEqual(flags({weeklyRpe: 8.9, rpeTarget: 8}), [], 'under a full point over is fine');
});

test('criterion 3: 9.6 is flagged in any week, deload included', (assert)=>{
  for(const [w, d] of [[1, false], [3, false], [4, false], [5, true]]){
    assert.deepStrictEqual(flags({weeklyRpe: 9.6, rpeTarget: target(w, d, 'strength')}), ['rpe'], `week ${w}`);
  }
  assert.deepStrictEqual(flags({weeklyRpe: 7.0, rpeTarget: target(5, true, 'strength')}), ['rpe'], 'deload target 6: 7.0 is a point over');
});

test('criterion 4: without rpeTarget, the 8.5 rule stands', (assert)=>{
  assert.deepStrictEqual(flags({weeklyRpe: 8.5}), ['rpe']);
  assert.deepStrictEqual(flags({weeklyRpe: 8.4}), []);
  assert.deepStrictEqual(flags({sleepHours: 5, weeklyRpe: 7}), ['sleep'], 'the other rules are untouched');
});

async function insight(program, weeklyRpe){
  const [r] = await runSandboxAsync([...CORE, extractFunction(src, 'formatReadiness'), extractFunction(src, 'getReadinessInsight'), `
    var activeProgram = ${JSON.stringify(program)};
    function icon(){ return ''; }
    function getTodayKey(){ return '2026-11-10'; }
    async function fetchSleepEntries(){ return []; }
    async function fetchWorkoutDates(){ return []; }
    async function getRestingRegions(){ return []; }
    async function fetchHealthLog(){ return []; }
    async function computeWeeklyRpeAvg(){ return [{avg: ${weeklyRpe}}]; }
    async function computeDaysSinceRest(){ return 1; }
    function rhrBaselineFrom(){ return null; }
    async function getMesocycleWeek(){ return 4; }
    async function isDeloadWeek(){ return false; }`], `__capture.push(await getReadinessInsight());`);
  return r;
}

test('criterion 5: the real getReadinessInsight in week 4: RPE 8.0 is flagged on Medical (target 7) and not on Strength (target 9)', async (assert)=>{
  const med = await insight('medical', 8.0);
  assert.ok(med && /RPE has averaged 8\.0/.test(med), String(med));
  assert.strictEqual(await insight('strength', 8.0), null, 'all clear is not surfaced');
  const hard = await insight('strength', 9.6);
  assert.ok(hard && /RPE has averaged 9\.6/.test(hard), 'anchor: the row does appear when flagged');
});

run();
