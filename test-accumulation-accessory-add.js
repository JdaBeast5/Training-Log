'use strict';
// Behavioral coverage for applyAccumulationAccessory — the exercise-SELECTION
// half of the accumulation block, alongside applyAccumulation's existing
// set-count half. Real invocation against the real function/consts extracted
// from source, not string-matching. Sabotage anchor: the appended item must
// land at the very END of the array with every prior item byte-identical to
// what was passed in — see the function's own comment on why position has to
// stay stable (getExLog/saveExSet key history by array position).
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractConst(src, 'DELOAD_CYCLE_WEEKS'),
  extractFunction(src, 'cycleWeekOf'),
  extractConst(src, 'ACCUMULATION_ADDS'),
  extractConst(src, 'ACCUMULATION_ACCESSORY_POOL'),
  extractFunction(src, 'applyAccumulationAccessory'),
];

const { test, run } = makeRunner('test-accumulation-accessory-add.js');

const baseExercises = [
  {name:'Bench Press', sets:'4×4-6'},
  {name:'Barbell Row', sets:'4×6-8'},
];

test('week 1 of the cycle (position 1, ACCUMULATION_ADDS 0) adds nothing', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 1, 'strength', 'd1'));`);
  assert.strictEqual(result.length, 2, 'no exercise should have been appended below the peak weeks');
  assert.deepStrictEqual(result, baseExercises);
});

test('week 2 of the cycle (position 2, ACCUMULATION_ADDS 1) adds nothing — only the peak (2-set) weeks qualify', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 2, 'strength', 'd1'));`);
  assert.strictEqual(result.length, 2);
});

test('week 3 of the cycle (position 3, peak) appends the pooled accessory for strength/d1', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'strength', 'd1'));`);
  assert.strictEqual(result.length, 3, 'exactly one accessory should be appended, not zero and not more than one');
  assert.strictEqual(result[2].name, 'Cable Fly');
  assert.strictEqual(result[2].sets, '3×12-15');
  assert.strictEqual(result[2].accumulatedAccessory, true);
});

test('week 4 of the cycle (position 4, also peak) appends it too', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 4, 'strength', 'd1'));`);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[2].name, 'Cable Fly');
});

test('week 5 of the cycle (deload position, ACCUMULATION_ADDS undefined) adds nothing', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 5, 'strength', 'd1'));`);
  assert.strictEqual(result.length, 2);
});

test('week 8 (second cycle, position 3 again via wraparound) appends it too', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 8, 'strength', 'd1'));`);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[2].name, 'Cable Fly');
});

test('SABOTAGE ANCHOR: the appended item is always the LAST element — every prior exercise keeps its exact original position and content', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'strength', 'd1'));`);
  assert.deepStrictEqual(result.slice(0, 2), baseExercises, 'the two original exercises must be untouched and in their original positions — a bug here would silently corrupt logged history for those exercises');
  assert.strictEqual(result[result.length - 1].name, 'Cable Fly', 'the bonus accessory must be the very last element, never inserted mid-list');
});

test('a day with no pool entry (strength/d2) adds nothing even in a peak week', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'strength', 'd2'));`);
  assert.strictEqual(result.length, 2);
});

test('a program with no pool entry at all adds nothing even in a peak week', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'bodybuilding', 'd1'));`);
  assert.strictEqual(result.length, 2);
});

run();
