'use strict';
// Regression test for Phase C1 of the stabilization plan: routing
// estimateExerciseCalories and computeTargets through the canonical
// LB_PER_KG constant instead of each independently hardcoding the literal
// 0.453592. This is a behavior-preserving substitution (LB_PER_KG === the
// same literal), so the test has two jobs: (1) prove the numeric output is
// byte-identical before and after — values below were computed from the
// REAL pre-edit functions, not hand-derived a second time, so this can't
// silently agree with a mistake repeated in both places; (2) a structural
// check proving the literal is actually gone afterward, not just that
// output happens to still match.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const calorieChunks = [
  extractConst(src, 'LB_PER_KG'),
  extractConst(src, 'exerciseInfo'),
  extractConst(src, 'CATEGORY_MET'),
  extractConst(src, 'WARMUP_ELIGIBLE_CATEGORIES'),
  extractFunction(src, 'getRepRangeTier'),
  extractFunction(src, 'getDefaultRestSeconds'),
  extractFunction(src, 'parseSetCount'),
  extractFunction(src, 'parseEstimatedMinutes'),
  extractFunction(src, 'estimateExerciseCalories'),
];

const targetsChunks = [extractConst(src, 'LB_PER_KG'), extractFunction(src, 'computeTargets')];

const { test, run } = makeRunner('test-lb-per-kg-consolidation.js');

test('estimateExerciseCalories: Back Squat, 200 lb, 3x5 -> 109 kcal (captured from the real pre-refactor function)', (assert)=>{
  const [result] = runSandbox(calorieChunks, `
    __capture.push(estimateExerciseCalories({name:'Back Squat', sets:'3×5'}, 200));
  `);
  assert.strictEqual(result, 109);
});

test('computeTargets: male maintain profile matches the real function\'s current output exactly', (assert)=>{
  const [result] = runSandbox(targetsChunks, `
    __capture.push(computeTargets({gender:'male', weight:200, heightFt:6, heightIn:0, age:30, activity:1.375, goal:'maintain'}));
  `);
  assert.deepStrictEqual(result, {cal:2620, pro:160, fat:79, carb:317, isFloored:false, tdee:2620});
});

test('computeTargets: female lose profile matches the real function\'s current output exactly', (assert)=>{
  const [result] = runSandbox(targetsChunks, `
    __capture.push(computeTargets({gender:'female', weight:140, heightFt:5, heightIn:5, age:28, activity:1.2, goal:'lose'}));
  `);
  assert.deepStrictEqual(result, {cal:1229, pro:140, fat:37, carb:84, isFloored:false, tdee:1639});
});

test('after consolidation: neither function hardcodes the 0.453592 literal, both reference LB_PER_KG', (assert)=>{
  const calorieSrc = extractFunction(src, 'estimateExerciseCalories');
  const targetsSrc = extractFunction(src, 'computeTargets');
  assert.ok(!calorieSrc.includes('0.453592'), 'estimateExerciseCalories must not hardcode the literal anymore');
  assert.ok(!targetsSrc.includes('0.453592'), 'computeTargets must not hardcode the literal anymore');
  assert.ok(calorieSrc.includes('LB_PER_KG'), 'estimateExerciseCalories must reference the canonical constant');
  assert.ok(targetsSrc.includes('LB_PER_KG'), 'computeTargets must reference the canonical constant');
});

run();
