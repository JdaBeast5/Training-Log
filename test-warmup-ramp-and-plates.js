'use strict';
// Behavioral coverage for the warm-up ramp / plate-rounding engine —
// buildWarmupRamp, buildGenericWarmupRamp, snapRampWeight, pruneRampSteps,
// calcPlatesPerSide, getEquipment, snapToLoadable. Flagged Tier 1 (highest
// risk, math-heavy) in the stabilization plan because a wrong number here is
// a wrong number on the bar, not a cosmetic bug.
//
// All expected values below were hand-traced against the REAL extracted
// source (see the calculation walkthroughs in the plan/commit history), not
// guessed — e.g. calcPlatesPerSide(225) landing on two 45s per side is the
// well-known "225 = bar + 2x45/side" fact, used here as a sabotage anchor:
// a broken plate-fill loop would not reproduce it by accident.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractConst(src, 'BARBELL_STANDARDS'),
  extractConst(src, 'DUMBBELL_DEFAULTS'),
  extractConst(src, 'BARBELL_EXERCISES'),
  extractConst(src, 'LB_PER_KG'),
  extractFunction(src, 'isBarbellExercise'),
  extractFunction(src, 'isDumbbellExercise'),
  extractFunction(src, 'roundToIncrement'),
  extractFunction(src, 'toDisplayWeight'),
  extractFunction(src, 'trimUnitNum'),
  extractFunction(src, 'getEquipment'),
  extractFunction(src, 'snapToLoadable'),
  extractFunction(src, 'snapRampWeight'),
  extractFunction(src, 'pruneRampSteps'),
  extractFunction(src, 'indexRampSteps'),
  extractFunction(src, 'visibleRampSteps'),
  extractFunction(src, 'buildWarmupRamp'),
  extractFunction(src, 'buildGenericWarmupRamp'),
  extractFunction(src, 'calcPlatesPerSide'),
  extractFunction(src, 'formatPlateResult'),
];

const { test, run } = makeRunner('test-warmup-ramp-and-plates.js');

test('calcPlatesPerSide(225) is bar + two 45s per side — the textbook plate-math fact', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(calcPlatesPerSide(225, undefined, undefined));`);
  assert.strictEqual(result.bar, 45);
  assert.strictEqual(result.perSide, 90);
  assert.deepStrictEqual(result.breakdown, [{plate:45, count:2}]);
  assert.strictEqual(result.leftover, 0);
});

test('calcPlatesPerSide below the bar returns tooLight, not a negative breakdown', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(calcPlatesPerSide(40, undefined, undefined));`);
  assert.deepStrictEqual(result, {tooLight:true, bar:45});
});

test('calcPlatesPerSide leaves an honest leftover when the plate set cannot hit the target exactly', (assert)=>{
  // 143 lb: bar 45, perSide 49. Greedy from [45,35,25,10,5,2.5]: one 45
  // leaves 4, which only the 2.5 satisfies (one of them), leaving a genuine
  // 1.5 lb the plate set can't close — verified numerically, not guessed.
  const [result] = runSandbox(chunks, `__capture.push(calcPlatesPerSide(143, undefined, undefined));`);
  assert.strictEqual(result.perSide, 49);
  assert.deepStrictEqual(result.breakdown, [{plate:45, count:1}, {plate:2.5, count:1}]);
  assert.strictEqual(result.leftover, 1.5);
});

test('getEquipment falls back to commercial-gym defaults when no profile is saved', (assert)=>{
  const [eq] = runSandbox(chunks, `__capture.push(getEquipment());`);
  assert.strictEqual(eq.bar, 45);
  assert.deepStrictEqual(eq.plates, [45,35,25,10,5,2.5]);
  assert.strictEqual(eq.dbIncrement, 5);
});

test('a home-gym profile missing the 2.5s changes the smallest loadable jump to 10 lb', (assert)=>{
  const [step] = runSandbox(chunks, `
    equipmentProfile = { lb: { bar: 45, plates: [45,35,25,10,5] } };
    var eq = getEquipment();
    __capture.push(2 * eq.plates[eq.plates.length - 1]);
  `);
  assert.strictEqual(step, 10);
});

test('snapToLoadable never rounds a weight below the bar up to the bar', (assert)=>{
  const [snapped] = runSandbox(chunks, `__capture.push(snapToLoadable(30, 'Back Squat', 'nearest'));`);
  assert.strictEqual(snapped, 30);
});

test('snapToLoadable direction matters: up never rounds down, down never rounds up', (assert)=>{
  const [up, down] = runSandbox(chunks, `
    __capture.push(snapToLoadable(151, 'Back Squat', 'up'));
    __capture.push(snapToLoadable(151, 'Back Squat', 'down'));
  `);
  // step = 2*2.5 = 5, base = 45. 151 -> over=106, k=21.2
  assert.strictEqual(up, 155);
  assert.strictEqual(down, 150);
});

test('buildWarmupRamp at working=95 lb drops the ~40% rung (it would land under the bar)', (assert)=>{
  const [ramp] = runSandbox(chunks, `__capture.push(buildWarmupRamp(95, 'Back Squat'));`);
  assert.strictEqual(ramp.length, 3, 'expected Bar/60%/80% only, ~40% pruned');
  assert.deepStrictEqual(ramp.map(s=> s.label), ['Bar only', '~60%', '~80%']);
  assert.deepStrictEqual(ramp.map(s=> s.weight), [45, 55, 75]);
});

test('buildWarmupRamp at working=115 lb drops ~40% (it would land exactly on the bar, showing 45 twice)', (assert)=>{
  const [ramp] = runSandbox(chunks, `__capture.push(buildWarmupRamp(115, 'Back Squat'));`);
  assert.strictEqual(ramp.length, 3);
  assert.deepStrictEqual(ramp.map(s=> s.label), ['Bar only', '~60%', '~80%']);
  assert.deepStrictEqual(ramp.map(s=> s.weight), [45, 70, 90]);
});

test('buildWarmupRamp ramp always strictly ascends and stays under the working weight', (assert)=>{
  const [ramp] = runSandbox(chunks, `__capture.push(buildWarmupRamp(315, 'Deadlift'));`);
  for(let i = 1; i < ramp.length; i++){
    assert.ok(ramp[i].weight > ramp[i-1].weight, `step ${i} (${ramp[i].weight}) did not strictly increase over step ${i-1} (${ramp[i-1].weight})`);
  }
  for(const step of ramp){
    assert.ok(step.weight < 315, `step ${step.label} (${step.weight}) was not under the working weight`);
  }
});

test('buildGenericWarmupRamp (non-barbell) rounds to flat 5 lb increments and keeps all three rungs when they ascend cleanly', (assert)=>{
  const [ramp] = runSandbox(chunks, `__capture.push(buildGenericWarmupRamp(200, 'Leg Press'));`);
  assert.deepStrictEqual(ramp.map(s=> s.label), ['~30%', '~55%', '~75%']);
  assert.deepStrictEqual(ramp.map(s=> s.weight), [60, 110, 150]);
});

test('pruneRampSteps drops a non-ascending step and anything at/above the working weight (direct unit test, not just via buildWarmupRamp)', (assert)=>{
  const [pruned] = runSandbox(chunks, `
    var steps = [
      {label:'A', weight:45},
      {label:'B', weight:45},  // duplicate of A -> dropped
      {label:'C', weight:60},
      {label:'D', weight:100}, // >= working (95) -> dropped
    ];
    __capture.push(pruneRampSteps(steps, 95));
  `);
  assert.deepStrictEqual(pruned.map(s=> s.label), ['A', 'C']);
});

test('visibleRampSteps hides by label, not by index, so hiding one rung does not misassign the rest', (assert)=>{
  const [visible] = runSandbox(chunks, `
    var indexed = indexRampSteps([{label:'Bar only', weight:45}, {label:'~60%', weight:55}, {label:'~80%', weight:75}]);
    __capture.push(visibleRampSteps(indexed, ['~60%']));
  `);
  assert.strictEqual(visible.length, 2);
  assert.deepStrictEqual(visible.map(s=> s.label), ['Bar only', '~80%']);
  // idx must still reflect original computed position, not post-filter position
  assert.strictEqual(visible[1].idx, 2);
});

test('kg mode: buildGenericWarmupRamp rounds to 2.5 kg increments, not the lb 5 lb rule', (assert)=>{
  // workingWeightLb is always canonical lb regardless of display unit — 90 lb
  // converts to a 40.8 kg display working weight (toDisplayWeight's own
  // rounding), verified numerically before writing this assertion.
  const [ramp] = runSandbox(chunks, `
    weightUnit = 'kg';
    __capture.push(buildGenericWarmupRamp(90, 'Leg Press'));
  `);
  assert.deepStrictEqual(ramp.map(s=> s.weight), [12.5, 22.5, 30]);
});

run();
