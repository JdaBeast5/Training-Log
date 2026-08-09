'use strict';
// Behavioral coverage for the Log tab's "Today's Nutrition" card defaulting
// to expanded. Nutrition is the most-used daily section on Log, yet it
// used to default closed like every other card in PERSISTENT_CARDS
// (measure, photos, cycle, aiSettings, program, healthImport, diag).
//
// The real subtlety this exists to get right: restoreCardOpenStates only
// ever ADDS .open, never removes it — so the fix has to live in
// getCardOpenState's fallback (what happens when nothing has EVER been
// stored), not in the static HTML. Hardcoding class="open" would have let
// a user's own explicit "I collapsed this" choice (stored 'false') get
// silently overridden back open on their next reload.
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const getCardOpenStateSrc = extractFunction(src, 'getCardOpenState');

const { test, run } = makeRunner('test-nutrition-default-open.js');

function storageStub(stored){
  // Mirrors this app's real window.storage.get contract: resolves an
  // object with a .value string when the key exists, rejects when it
  // does not (confirmed by test-whats-new.js's own real-storage finding —
  // reused here rather than assuming a null-resolve shape). Declared as
  // `var window` at the SAME top-level scope getCardOpenState is defined
  // in (both are plain sourceChunks, not inside the async IIFE runSandboxAsync
  // wraps the test body in) — deliberately not inside the IIFE, which
  // would shadow this instead of populating the binding the function
  // actually closes over (a real mistake made once before in this
  // project's test suite, on test-streak.js).
  return `
    var window = {
      storage: {
        get: async (key)=>{
          if(Object.prototype.hasOwnProperty.call(${JSON.stringify(stored)}, key)) return {value: ${JSON.stringify(stored)}[key]};
          throw new Error('not found');
        }
      }
    };
  `;
}

test('fresh install (nothing ever stored): nutrition defaults OPEN, other PERSISTENT_CARDS keys default closed', async (assert)=>{
  const [nutrition, measure, photos, cycle] = await runSandboxAsync([
    storageStub({}),
    getCardOpenStateSrc,
  ], `
    __capture.push(await getCardOpenState('nutrition'));
    __capture.push(await getCardOpenState('measure'));
    __capture.push(await getCardOpenState('photos'));
    __capture.push(await getCardOpenState('cycle'));
  `);
  assert.strictEqual(nutrition, true, 'nutrition must default open with nothing stored');
  assert.strictEqual(measure, false, 'measure must keep the original default-closed behavior');
  assert.strictEqual(photos, false, 'photos must keep the original default-closed behavior');
  assert.strictEqual(cycle, false, 'cycle must keep the original default-closed behavior');
});

test('an explicit prior collapse of nutrition (stored "false") is respected, not overridden back open', async (assert)=>{
  const [nutrition] = await runSandboxAsync([
    storageStub({'card-open:nutrition': 'false'}),
    getCardOpenStateSrc,
  ], `
    __capture.push(await getCardOpenState('nutrition'));
  `);
  assert.strictEqual(nutrition, false, 'a user who explicitly closed Nutrition before must see it stay closed');
});

test('an explicit prior open of nutrition (stored "true") still works, same as before this change', async (assert)=>{
  const [nutrition] = await runSandboxAsync([
    storageStub({'card-open:nutrition': 'true'}),
    getCardOpenStateSrc,
  ], `
    __capture.push(await getCardOpenState('nutrition'));
  `);
  assert.strictEqual(nutrition, true);
});

test('sabotage-relevant: a stored "false" for a NON-nutrition card is still respected (the new branch is scoped to the key check, not a blanket override)', async (assert)=>{
  const [measure] = await runSandboxAsync([
    storageStub({'card-open:measure': 'false'}),
    getCardOpenStateSrc,
  ], `
    __capture.push(await getCardOpenState('measure'));
  `);
  assert.strictEqual(measure, false);
});

run();
