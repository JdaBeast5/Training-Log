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
    extractFunction(src, 'slotIdOf') /* v3.561 (BL-72) */, extractFunction(src, 'applyExerciseSubs'),
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
  const chunks = [withMockStorage({}), ...staticChunks, extractFunction(src, 'slotIdOf') /* v3.561 (BL-72) */, extractFunction(src, 'applyExerciseSubs')];
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
    extractFunction(src, 'slotIdOf') /* v3.561 (BL-72) */, extractFunction(src, 'applyExerciseSubs'),
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
    extractFunction(src, 'slotIdOf') /* v3.561 (BL-72) */, extractFunction(src, 'applyExerciseSubs'),
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

// ---- v3.534 (BL-73): a stored substitute applies only if it is listed for
// the slot's current exercise (real applyExerciseSubs, real EXERCISE_SUBS).
async function subsRun(store, exercises){
  const [out] = await runSandboxAsync([withMockStorage(store), ...staticChunks, extractFunction(src, 'slotIdOf') /* v3.561 (BL-72) */, extractFunction(src, 'applyExerciseSubs')], `
    var exercises = ${JSON.stringify(exercises)};
    await applyExerciseSubs(exercises, 'strength', 'd1');
    __capture.push(exercises);`);
  return out;
}

test('BL-73 criterion 1: a stored name that is not listed for the slot\'s exercise is not applied (Front Squat on Bench Press)', async (assert)=>{
  const [ex] = await subsRun({ 'exercise-sub:strength:d1:0': 'Front Squat' }, [{name:'Bench Press', sets:'3×8'}]);
  assert.strictEqual(ex.name, 'Bench Press');
  assert.strictEqual(ex.__isSubbed, undefined);
  assert.strictEqual(ex.__originalName, undefined);
});

test('BL-73 criterion 2: a listed substitute still applies exactly as before (Incline DB Press for Bench Press)', async (assert)=>{
  const [ex] = await subsRun({ 'exercise-sub:strength:d1:0': 'Incline DB Press' }, [{name:'Bench Press', sets:'3×8'}]);
  assert.strictEqual(ex.name, 'Incline DB Press');
  assert.strictEqual(ex.__originalName, 'Bench Press');
  assert.strictEqual(ex.__isSubbed, true);
  assert.strictEqual(ex.sets, '3×8');
});

test('BL-73: nothing stored is deleted; the unlisted choice is still in storage after the read', async (assert)=>{
  const [r] = await runSandboxAsync([withMockStorage({ 'exercise-sub:strength:d1:0': 'Front Squat' }), ...staticChunks, extractFunction(src, 'slotIdOf') /* v3.561 (BL-72) */, extractFunction(src, 'applyExerciseSubs')], `
    await applyExerciseSubs([{name:'Bench Press'}], 'strength', 'd1');
    const got = await window.storage.get('exercise-sub:strength:d1:0');
    __capture.push(got && got.value);`);
  assert.strictEqual(r, 'Front Squat');
});

test('BL-73 sabotage anchor: exactly one applyExerciseSubs swap site', (assert)=>{
  const body = extractFunction(src, 'applyExerciseSubs').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/__isSubbed: true/g) || []).length, 1, 'one swap site; criterion 1 carries the behaviour');
});

// ---- v3.570 (BL-60, audit D-9): substitutes keep the same muscle and joint.
// Real EXERCISE_SUBS, SUBSTITUTION_MAP, MUSCLE_GROUP_MAP, exerciseInfo,
// EXERCISE_REGION_OVERRIDE, CATEGORY_TO_REGIONS, regionsForExercise and
// applyExerciseSubs.
// Sabotage: restore the Tibialis pair and criterion 1 fails; drop the
// region-override lines and criterion 3 fails.
const BL60 = [extractConst(src, 'exerciseInfo'), extractConst(src, 'EXERCISE_SUBS'), extractConst(src, 'SUBSTITUTION_MAP'), extractConst(src, 'MUSCLE_GROUP_MAP'),
  extractConst(src, 'EXERCISE_REGION_OVERRIDE'), extractConst(src, 'CATEGORY_TO_REGIONS'), extractFunction(src, 'regionsForExercise')];
// Every cross-group pair left at v3.528 after this item's three fixes (spec, measured).
const CROSS_ALLOWED = ['Close-Grip Bench Press -> Dip (Bar/Ring)', 'Dip (Bar/Ring) -> Close-Grip Bench Press', 'Skull Crushers -> Close-Grip Bench Press',
  'Clean & Jerk -> Push Press', 'Clean Pull -> Deadlift', 'Snatch Pull -> Deadlift', 'Jerk Dip Squat -> Push Press', 'Jerk Dip Squat -> Front Squat',
  'Overhead Squat -> Front Squat', 'Power Clean -> Front Squat',
  // 2026-11-16 (v3.583, BL-59, D-8): Band Dislocates moves to `core` (the audit's table), so its
  // swaps with the shoulder moves cross groups now. The pairing itself is flagged for the auditor.
  'Band Dislocates -> Face Pull', 'Face Pull -> Band Dislocates', 'Rear Delt Fly -> Band Dislocates'];

test('BL-60 criterion 1: every EXERCISE_SUBS target shares its original\'s muscle group, except the named allowlist (the sweep prints any other pair)', (assert)=>{
  const [r] = runSandbox(BL60, `
    const g = (n) => MUSCLE_GROUP_MAP[(exerciseInfo[n] || {}).category];
    const cross = []; let n = 0;
    for(const [k, v] of Object.entries(EXERCISE_SUBS)) for(const t of v){ n++; if(g(k) !== g(t)) cross.push(k + ' -> ' + t); }
    __capture.push({n, cross, tib: EXERCISE_SUBS['Tibialis Raise'], calf: EXERCISE_SUBS['Calf Raise'], scalf: EXERCISE_SUBS['Standing Calf Raise'], carry: EXERCISE_SUBS['Farmers Carry (Heavy)']});`);
  assert.ok(r.n > 100, 'anchor: pairs swept ' + r.n);
  assert.deepStrictEqual(r.cross.filter(c => !CROSS_ALLOWED.includes(c)), []);
  assert.deepStrictEqual([r.tib, r.calf, r.scalf, r.carry], [['Heel Walk', 'Banded Dorsiflexion'], ['Standing Calf Raise', 'Single-Leg Calf Raise'], ['Calf Raise', 'Single-Leg Calf Raise'], ['Suitcase Carry', "Farmer's Carry"]]);
});

test('BL-60 criterion 2: every SUBSTITUTION_MAP alternative and every EXERCISE_SUBS target has an exerciseInfo entry with at least 3 cues (Neck Bridges, a v3.564 swap-back, has 4)', (assert)=>{
  const [r] = runSandbox(BL60, `
    const names = new Set();
    for(const v of Object.values(SUBSTITUTION_MAP)) for(const a of v.alts) names.add(a);
    for(const v of Object.values(EXERCISE_SUBS)) for(const t of v) names.add(t);
    __capture.push({n: names.size, bad: [...names].filter(n => !exerciseInfo[n] || (exerciseInfo[n].cues || []).length < 3)});`);
  assert.ok(r.n > 100, 'anchor: names checked ' + r.n);
  assert.deepStrictEqual(r.bad, []);
});

test('BL-60 criterion 3: regionsForExercise flags Ankle/Foot and Shins for Single-Leg Calf Raise, Heel Walk and Banded Dorsiflexion', (assert)=>{
  const [r] = runSandbox(BL60, `__capture.push(['Single-Leg Calf Raise', 'Heel Walk', 'Banded Dorsiflexion'].map(n => regionsForExercise(n, exerciseInfo[n].category)));`);
  for(const regions of r) assert.deepStrictEqual(regions, ['Ankle/Foot', 'Shins']);
});

test('BL-60 criteria 4 and 5: a stored Leg Press on a Calf Raise slot no longer applies (and is not deleted); a stored Single-Leg Calf Raise does', async (assert)=>{
  const [old] = await subsRun({ 'exercise-sub:strength:d1:0': 'Leg Press' }, [{name:'Calf Raise', sets:'3×12-15'}]);
  assert.strictEqual(old.name, 'Calf Raise');
  assert.strictEqual(old.__isSubbed, undefined);
  const [kept] = await runSandboxAsync([withMockStorage({ 'exercise-sub:strength:d1:0': 'Leg Press' }), ...staticChunks, extractFunction(src, 'slotIdOf'), extractFunction(src, 'applyExerciseSubs')], `
    await applyExerciseSubs([{name:'Calf Raise'}], 'strength', 'd1');
    const got = await window.storage.get('exercise-sub:strength:d1:0'); __capture.push(got && got.value);`);
  assert.strictEqual(kept, 'Leg Press', 'the stored value stays');
  const [now] = await subsRun({ 'exercise-sub:strength:d1:0': 'Single-Leg Calf Raise' }, [{name:'Calf Raise', sets:'3×12-15'}]);
  assert.deepStrictEqual([now.name, now.__originalName, now.__isSubbed], ['Single-Leg Calf Raise', 'Calf Raise', true]);
});

run();
