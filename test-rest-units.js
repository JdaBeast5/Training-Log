'use strict';
// v3.556 (BL-14, audit M-1): unit-aware rest times. getRepRangeTier no longer
// reads "6×2min" or "6×40yd" as reps; getDefaultRestSeconds has a unit branch
// (rounds 60 s, jump rope 45 s, short sprints 120 s, max holds 120 s,
// intervals 90 s); the endurance tier rests 120 s (compound) / 75 s
// (isolation). getRestReasonLabel names the same branch.
//
// Real invocation: the real getRepRangeTier, prescriptionCount, restUnitKind,
// getDefaultRestSeconds and getRestReasonLabel with the real exerciseInfo.
//
// Sabotage: drop the unit guard in getRepRangeTier and the tier case fails.
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rest-units.js');
const INFO = extractConst(fs.readFileSync(path.join(__dirname, 'content-exercises.js'), 'utf8'), 'exerciseInfo');
const CHUNKS = [INFO, ...['WARMUP_ELIGIBLE_CATEGORIES', 'NON_REP_UNITS', 'REST_BY_UNIT'].map(c => extractConst(src, c)),
  ...['prescriptionCount', 'getRepRangeTier', 'restUnitKind', 'getDefaultRestSeconds', 'getRestReasonLabel'].map(f => extractFunction(src, f))];
const rest = (cases) => runSandbox(CHUNKS, `__capture.push(${JSON.stringify(cases)}.map(([name, sets]) => ({sec: getDefaultRestSeconds({name, sets}), label: getRestReasonLabel({name, sets}), tier: getRepRangeTier(sets)})));`)[0];

const CASES = [
  ['Heavy Bag — Jab-Cross Combos', '6×2min rounds', 60, 'Rounds · short reset'],
  ['Sprint Intervals', '6×40yd', 120, 'Sprints · near-full recovery'],
  ['Front Lever Hold', '5×10s', 120, 'Max holds · near-full recovery'],
  ['Rowing Machine Intervals', '6×500m', 90, 'Intervals · partial recovery'],
  ['Leg Press', '3×12-15', 120, 'Endurance range · compound'],
  ['Lateral Raise', '3×15-20', 75, 'Endurance range · isolation'],
  ['Back Squat', '5×5', 240, 'Strength range · low reps'],
  ['Jump Rope — Basic Bounce', '5×60s', 45, 'Jump rope · short reset'],
];

test('acceptance: each case\'s rest, and its label naming the same branch', (assert)=>{
  const r = rest(CASES.map(c => [c[0], c[1]]));
  CASES.forEach(([name, sets, sec, label], i) => {
    assert.strictEqual(r[i].sec, sec, `${name} ${sets}`);
    assert.strictEqual(r[i].label, label, `${name} ${sets} label`);
  });
  assert.strictEqual(new Set(r.map(x => x.label)).size, CASES.length, 'one distinct label per branch');
});

test('getRepRangeTier gives no tier to time, distance or counted units, and keeps reps', (assert)=>{
  const r = rest([['x', '6×2min'], ['x', '6×40yd'], ['x', '5×10s'], ['x', '3×10 steps'], ['x', '8×1.5min rounds'], ['x', '5×5'], ['x', '3×8/leg'], ['x', '4×8 reps'], ['x', '3×12-15']]);
  assert.deepStrictEqual(r.map(x => x.tier), [null, null, null, null, null, 'strength', 'hypertrophy', 'hypertrophy', 'endurance']);
});

test('hypertrophy rest is unchanged (150 s compound, 90 s isolation)', (assert)=>{
  const r = rest([['Barbell Row', '4×6-8'], ['Bicep Curl', '3×10-12']]);
  assert.deepStrictEqual(r.map(x => x.sec), [150, 90]);
});

run();
