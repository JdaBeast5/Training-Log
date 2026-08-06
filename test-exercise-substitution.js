'use strict';
// Behavioral coverage for the exercise substitution engine — exKey,
// subSelectionKey, applyExerciseSubs, subVariantOf, and a data-integrity
// check over EXERCISE_SUBS itself. Tier 1: this table drives real key
// generation (independent per-substitute history), so a bad entry doesn't
// just look wrong, it can misfile logged data.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const staticChunks = [
  extractConst(src, 'EXERCISE_SUBS'),
  extractFunction(src, 'slugifyExerciseName'),
  `var activeMartialArt = 'boxing', activeCyclingStyle = 'road', activeMedicalStyle = 'diabetes';`,
  extractFunction(src, 'exKey'),
  extractFunction(src, 'subSelectionKey'),
  extractFunction(src, 'subVariantOf'),
];

const { test, run } = makeRunner('test-exercise-substitution.js');

test('exKey with no substitute active returns byte-for-byte the same key as before the feature existed', (assert)=>{
  const [plain, combat, cycling, medical] = runSandbox(staticChunks, `
    __capture.push(exKey('strength', 'd1', 0));
    __capture.push(exKey('combat', 'd1', 2));
    __capture.push(exKey('cycling', 'd1', 1));
    __capture.push(exKey('medical', 'd2', 0));
  `);
  assert.strictEqual(plain, 'ex:strength:d1:0');
  assert.strictEqual(combat, 'ex:combat:boxing:d1:2');
  assert.strictEqual(cycling, 'ex:cycling:road:d1:1');
  assert.strictEqual(medical, 'ex:medical:diabetes:d2:0');
});

test('exKey with a substitute active gets a distinct :sub: suffix, so the two never collide', (assert)=>{
  const [withSub, withoutSub] = runSandbox(staticChunks, `
    __capture.push(exKey('strength', 'd1', 0, 'Front Squat'));
    __capture.push(exKey('strength', 'd1', 0));
  `);
  assert.strictEqual(withSub, 'ex:strength:d1:0:sub:front-squat');
  assert.notStrictEqual(withSub, withoutSub);
});

test('subVariantOf returns the substitute name only when __isSubbed is set', (assert)=>{
  const [subbed, notSubbed] = runSandbox(staticChunks, `
    __capture.push(subVariantOf({name:'Front Squat', __isSubbed:true}));
    __capture.push(subVariantOf({name:'Back Squat'}));
  `);
  assert.strictEqual(subbed, 'Front Squat');
  assert.strictEqual(notSubbed, null); // JSON round-trip turns undefined into null
});

function withMockStorage(selections){
  return `
    var window = {
      storage: {
        get: async (key)=>{
          if(Object.prototype.hasOwnProperty.call(${JSON.stringify(selections)}, key)){
            return { value: ${JSON.stringify(selections)}[key] };
          }
          return null;
        },
      },
    };
  `;
}

test('applyExerciseSubs swaps in the stored substitute and tags __originalName/__isSubbed', async (assert)=>{
  const chunks = [
    withMockStorage({ 'exercise-sub:strength:d1:0': 'Front Squat' }),
    ...staticChunks,
    extractFunction(src, 'applyExerciseSubs'),
  ];
  const [exercises] = await runSandboxAsync(chunks, `
    var exercises = [{name:'Back Squat', sets:3}];
    await applyExerciseSubs(exercises, 'strength', 'd1');
    __capture.push(exercises);
  `);
  assert.strictEqual(exercises[0].name, 'Front Squat');
  assert.strictEqual(exercises[0].__originalName, 'Back Squat');
  assert.strictEqual(exercises[0].__isSubbed, true);
  assert.strictEqual(exercises[0].sets, 3, 'other fields on the exercise must survive the swap');
});

test('applyExerciseSubs leaves a slot alone when no substitute is stored', async (assert)=>{
  const chunks = [withMockStorage({}), ...staticChunks, extractFunction(src, 'applyExerciseSubs')];
  const [exercises] = await runSandboxAsync(chunks, `
    var exercises = [{name:'Back Squat'}];
    await applyExerciseSubs(exercises, 'strength', 'd1');
    __capture.push(exercises);
  `);
  assert.strictEqual(exercises[0].name, 'Back Squat');
  assert.strictEqual(exercises[0].__isSubbed, undefined);
});

test('applyExerciseSubs never touches custom exercises or body-goal-focus additions, even with a stored selection', async (assert)=>{
  // Both are never in EXERCISE_SUBS by construction, but this proves the
  // isCustom/isBodyGoalFocus guard itself works, not just that the lookup
  // would have failed anyway.
  const chunks = [
    withMockStorage({ 'exercise-sub:strength:d1:0': 'Front Squat', 'exercise-sub:strength:d1:1': 'Front Squat' }),
    ...staticChunks,
    extractFunction(src, 'applyExerciseSubs'),
  ];
  const [exercises] = await runSandboxAsync(chunks, `
    var exercises = [
      {name:'Back Squat', isCustom:true},
      {name:'Back Squat', isBodyGoalFocus:true},
    ];
    await applyExerciseSubs(exercises, 'strength', 'd1');
    __capture.push(exercises);
  `);
  assert.strictEqual(exercises[0].name, 'Back Squat');
  assert.strictEqual(exercises[1].name, 'Back Squat');
});

test('applyExerciseSubs skips slots whose exercise has no entry in EXERCISE_SUBS at all', async (assert)=>{
  const chunks = [
    withMockStorage({ 'exercise-sub:strength:d1:0': 'Something Else' }),
    ...staticChunks,
    extractFunction(src, 'applyExerciseSubs'),
  ];
  const [exercises] = await runSandboxAsync(chunks, `
    var exercises = [{name:'Totally Made Up Exercise'}];
    await applyExerciseSubs(exercises, 'strength', 'd1');
    __capture.push(exercises);
  `);
  assert.strictEqual(exercises[0].name, 'Totally Made Up Exercise');
  assert.strictEqual(exercises[0].__isSubbed, undefined);
});

// --- Data-integrity check over the 88-entry EXERCISE_SUBS table itself ---
test('every EXERCISE_SUBS entry has exactly 2 distinct alternates, and never lists itself', (assert)=>{
  const [entries] = runSandbox(staticChunks, `
    __capture.push(Object.entries(EXERCISE_SUBS).map(([name, alts])=> ({name, alts})));
  `);
  assert.ok(entries.length >= 80, `expected at least 80 entries, got ${entries.length}`);
  for(const {name, alts} of entries){
    assert.strictEqual(alts.length, 2, `${name}: expected exactly 2 alternates, got ${alts.length}`);
    assert.notStrictEqual(alts[0], alts[1], `${name}: the two alternates must be distinct`);
    assert.ok(!alts.includes(name), `${name}: must not list itself as its own alternate`);
  }
});

run();
