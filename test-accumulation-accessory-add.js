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

test('a program with no pool entry at all (oly — deliberately excluded, technique-only days) adds nothing even in a peak week', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'oly', 'd1'));`);
  assert.strictEqual(result.length, 2);
});

test('bodybuilding/d1 (peak week) appends Skull Crushers', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'bodybuilding', 'd1'));`);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[2].name, 'Skull Crushers');
  assert.strictEqual(result[2].sets, '3×10-12');
});

test('powerlifting/d4 (peak week) appends Good Morning', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 4, 'powerlifting', 'd4'));`);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[2].name, 'Good Morning');
});

test('powerbuilding/d6 (peak week) appends Bulgarian Split Squat', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'powerbuilding', 'd6'));`);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[2].name, 'Bulgarian Split Squat');
  assert.strictEqual(result[2].sets, '3×10-12/leg');
});

test('powerlifting/d3 (a real rest day, not in the pool) adds nothing even in a peak week', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(applyAccumulationAccessory(${JSON.stringify(baseExercises)}, 3, 'powerlifting', 'd3'));`);
  assert.strictEqual(result.length, 2);
});

test('REGRESSION GUARD: every pool entry across every covered program is a real exerciseInfo-catalogued exercise, is a real non-rest day in that program, and is NOT already present in that day\'s own authored exercise list', (assert)=>{
  const [result] = runSandbox([
    extractConst(src, 'programs'),
    extractConst(src, 'exerciseInfo'),
    extractConst(src, 'ACCUMULATION_ACCESSORY_POOL'),
  ], `
    const problems = [];
    for(const prog in ACCUMULATION_ACCESSORY_POOL){
      for(const dayId in ACCUMULATION_ACCESSORY_POOL[prog]){
        const pick = ACCUMULATION_ACCESSORY_POOL[prog][dayId];
        if(!exerciseInfo[pick.name]) problems.push(prog+'/'+dayId+': not in exerciseInfo');
        const day = (programs[prog] && programs[prog].days || {})[dayId];
        if(!day || day.rest) { problems.push(prog+'/'+dayId+': missing or a rest day'); continue; }
        if((day.exercises||[]).some(e=>e.name === pick.name)) problems.push(prog+'/'+dayId+': already in that day');
      }
    }
    __capture.push(problems);
  `);
  assert.deepStrictEqual(result, [], 'every pool entry must be a real, non-duplicate, catalogued exercise on a real training day');
});

run();
