'use strict';
// Behavioral coverage for a bug found during the same Today/Workout-logging
// audit as test-backdating-rest-timer-suppression.js: getCustomExercises/
// saveCustomExercises stored custom exercises as
// custom-ex:{program}:{dayId} — no style segment — even though exKey/
// workoutKey (right next to it in the file) have always namespaced
// Combat/Cycling/Watersports/Medical by their active style, specifically
// because a shared day-slot identifier like "d1" means a different actual
// workout per style. A custom exercise added under one style (e.g. Combat
// -> Boxing -> Day 1) bled into every other style sharing that day slot
// (Combat -> Muay Thai -> Day 1), and deleting it in one style deleted it
// from all of them.
//
// Three things are tested: the fixed key format itself (customExStorageKey
// — real invocation, not a re-implementation of the key logic), the actual
// bug scenario end-to-end through the real getCustomExercises/
// saveCustomExercises, and the SCHEMA_VERSION 7 migration that renames
// pre-existing old-format keys into their program's default style — the
// same resolution the v3 combat migration already used for the identical
// shape of bug on ex:/workout: keys (there is no way to know which style a
// pre-existing key belonged to, so it's attributed to the style each
// activeX variable already defaults to).
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');
const vm = require('vm');

const src = readIndexSource();
const { test, run } = makeRunner('test-custom-exercise-style-scoping.js');

const customExStorageKeySrc = extractFunction(src, 'customExStorageKey');
const getCustomExercisesSrc = extractFunction(src, 'getCustomExercises');
const saveCustomExercisesSrc = extractFunction(src, 'saveCustomExercises');
const runMigrationsSrc = extractFunction(src, 'runMigrations');

test('REAL invocation: customExStorageKey namespaces Combat/Cycling/Watersports/Medical by their active style, and leaves other programs unscoped', (assert)=>{
  const context = vm.createContext({
    activeMartialArt: 'boxing', activeCyclingStyle: 'gravel',
    activeWatersportsStyle: 'kiteAssisted', activeMedicalStyle: 'diabetes',
  });
  const run = (program, dayId)=> vm.runInContext(`${customExStorageKeySrc}\ncustomExStorageKey(${JSON.stringify(program)}, ${JSON.stringify(dayId)});`, context, {filename:'sandbox.js'});
  assert.strictEqual(run('combat', 'd1'), 'custom-ex:combat:boxing:d1');
  assert.strictEqual(run('cycling', 'd2'), 'custom-ex:cycling:gravel:d2');
  assert.strictEqual(run('watersports', 'd3'), 'custom-ex:watersports:kiteAssisted:d3');
  assert.strictEqual(run('medical', 'd4'), 'custom-ex:medical:diabetes:d4');
  assert.strictEqual(run('strength', 'd1'), 'custom-ex:strength:d1', 'a program with no styles must stay unscoped, unchanged from before this fix');
});

test('REAL invocation: a custom exercise added under one Combat style does NOT appear under a different style sharing the same day slot — the actual bug scenario', async (assert)=>{
  const captured = await runSandboxAsync([customExStorageKeySrc, getCustomExercisesSrc, saveCustomExercisesSrc], `
    // activeMartialArt is a bare top-level identifier in the real app (let
    // activeMartialArt = 'kickboxing'), not window.activeMartialArt — customExStorageKey
    // reads it the same way.
    window = {};
    activeMartialArt = 'boxing';
    // Matches window.storage's REAL contract (buildNamespacedStorage): get()
    // REJECTS (throws) for a never-set key rather than resolving null.
    var __store = {};
    window.storage = {
      get: async (k)=>{ if(!(k in __store)) throw new Error('not found'); return {key:k, value:__store[k]}; },
      set: async (k,v)=>{ __store[k]=v; return {key:k, value:v}; },
    };

    await saveCustomExercises('combat', 'd1', [{name:'Custom Combo Drill'}]);

    // Switch styles — same program, same day, different active style.
    activeMartialArt = 'muayThai';
    const underMuayThai = await getCustomExercises('combat', 'd1');
    activeMartialArt = 'boxing';
    const underBoxing = await getCustomExercises('combat', 'd1');

    __capture.push(underMuayThai);
    __capture.push(underBoxing);
  `);
  const [underMuayThai, underBoxing] = captured;
  assert.deepStrictEqual(underMuayThai, [], 'a custom exercise added under Boxing must NOT appear under Muay Thai, even though both share day slot d1');
  assert.deepStrictEqual(underBoxing, [{name:'Custom Combo Drill'}], 'the custom exercise must still be there under the style it was actually added under');
});

test('REAL invocation: SCHEMA_VERSION 7 migration renames pre-existing old-format custom-ex keys into the program\'s default style, for all four style-having programs', async (assert)=>{
  const store = {
    'meta:schemaVersion': '6', // only the v7 block under test should run
    'custom-ex:combat:d1': JSON.stringify([{name:'Old Combat Custom'}]),
    'custom-ex:cycling:d2': JSON.stringify([{name:'Old Cycling Custom'}]),
    'custom-ex:watersports:d3': JSON.stringify([{name:'Old Watersports Custom'}]),
    'custom-ex:medical:d4': JSON.stringify([{name:'Old Medical Custom'}]),
    // Already-new-format keys (e.g. from a previous partial run, or a
    // second style already migrated some other way) must be left alone.
    'custom-ex:combat:kickboxing:d5': JSON.stringify([{name:'Already migrated'}]),
    // A program with no styles at all must never be touched by this block.
    'custom-ex:strength:d1': JSON.stringify([{name:'Strength Custom'}]),
  };
  const storage = {
    get: async (k)=>{ if(!(k in store)) throw new Error('not found'); return {key:k, value:store[k]}; },
    set: async (k,v)=>{ store[k]=v; return {key:k, value:v}; },
    delete: async (k)=>{ delete store[k]; return {key:k, deleted:true}; },
    list: async (prefix)=>{
      const keys = Object.keys(store).filter(k=> !prefix || k.startsWith(prefix));
      return {keys, prefix};
    },
  };

  const context = vm.createContext({
    window: {storage},
    console,
    SCHEMA_VERSION: 7, // real top-level const, read by the final if(version < SCHEMA_VERSION) block
    // The v6 photo-migration block above v7 in runMigrations is skipped
    // entirely (version=6 is not < 6), so these three are never actually
    // called — present only so the function body parses/hoists cleanly.
    photoGet: async ()=> null, photoPut: async ()=>{}, dataUrlToBlob: ()=> null,
  });
  await vm.runInContext(`(async ()=>{ ${runMigrationsSrc}\nawait runMigrations(); })()`, context, {filename:'sandbox.js'});

  assert.strictEqual(store['custom-ex:combat:d1'], undefined, 'the old-format combat key must be gone (renamed, not copied)');
  assert.strictEqual(store['custom-ex:combat:kickboxing:d1'], JSON.stringify([{name:'Old Combat Custom'}]), 'combat renames into kickboxing, the same default combat\'s ex:/workout: keys already migrate into (v3)');
  assert.strictEqual(store['custom-ex:cycling:road:d2'], JSON.stringify([{name:'Old Cycling Custom'}]), 'cycling renames into road, matching activeCyclingStyle\'s own default');
  assert.strictEqual(store['custom-ex:watersports:surfing:d3'], JSON.stringify([{name:'Old Watersports Custom'}]), 'watersports renames into surfing, matching activeWatersportsStyle\'s own default');
  assert.strictEqual(store['custom-ex:medical:obesity:d4'], JSON.stringify([{name:'Old Medical Custom'}]), 'medical renames into obesity, matching activeMedicalStyle\'s own default');
  assert.strictEqual(store['custom-ex:combat:kickboxing:d5'], JSON.stringify([{name:'Already migrated'}]), 'an already-new-format key must be left completely untouched');
  assert.strictEqual(store['custom-ex:strength:d1'], JSON.stringify([{name:'Strength Custom'}]), 'a program with no styles must never be touched by this migration');
});

run();
