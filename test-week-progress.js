'use strict';
// Behavioral coverage for the week-scoped completion state
// (loadWeekProgress/saveWeekProgress/clearWeekProgress) — Tier 2. This is
// deliberately separate from the calendar-date-keyed workout:/ex: history
// that streaks/PRs/progression read (untouched by any of this): it only
// controls what shows checked in the UI for "this week," reset solely by
// an explicit "Clear the Week" action.
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function chunksWithStorage(storageImpl){
  return [
    `var activeProgram = 'strength';`,
    `var weekProgress = {};`,
    storageImpl,
    extractFunction(src, 'loadWeekProgress'),
    extractFunction(src, 'saveWeekProgress'),
    extractFunction(src, 'weekCheckedKey'),
    extractFunction(src, 'clearWeekProgress'),
  ];
}

function fakeStorage(getResponses){
  return `
    window = { storage: {
      __sets: [],
      __deletes: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(${JSON.stringify(getResponses)}, key)){
          return { value: ${JSON.stringify(getResponses)}[key] };
        }
        return null;
      },
      set: async (key, value)=>{ window.storage.__sets.push([key, value]); },
      delete: async (key)=>{ window.storage.__deletes.push(key); },
    }};
  `;
}

const { test, run } = makeRunner('test-week-progress.js');

test('loadWeekProgress parses the stored JSON for the active program into the module-level weekProgress', async (assert)=>{
  const chunks = chunksWithStorage(fakeStorage({'week-progress:strength': JSON.stringify({d1:true, d2:false})}));
  const [wp] = await runSandboxAsync(chunks, `
    await loadWeekProgress();
    __capture.push(weekProgress);
  `);
  assert.deepStrictEqual(wp, {d1:true, d2:false});
});

test('loadWeekProgress resets to {} when nothing is stored yet for this program', async (assert)=>{
  const chunks = chunksWithStorage(fakeStorage({}));
  const [wp] = await runSandboxAsync(chunks, `
    weekProgress = {stale:true}; // simulate leftover state from a prior program
    await loadWeekProgress();
    __capture.push(weekProgress);
  `);
  assert.deepStrictEqual(wp, {});
});

test('saveWeekProgress writes the current in-memory weekProgress under the active program\'s key', async (assert)=>{
  const chunks = chunksWithStorage(fakeStorage({}));
  const [sets] = await runSandboxAsync(chunks, `
    weekProgress = {d1:true};
    await saveWeekProgress();
    __capture.push(window.storage.__sets);
  `);
  assert.deepStrictEqual(sets, [['week-progress:strength', JSON.stringify({d1:true})]]);
});

test('clearWeekProgress deletes the week-progress key AND every given day\'s weekCheckedKey, and resets the in-memory state', async (assert)=>{
  const chunks = chunksWithStorage(fakeStorage({}));
  const [wp, deletes] = await runSandboxAsync(chunks, `
    weekProgress = {d1:true, d2:true};
    await clearWeekProgress('strength', ['d1', 'd2', 'd3']);
    __capture.push(weekProgress);
    __capture.push(window.storage.__deletes);
  `);
  assert.deepStrictEqual(wp, {});
  assert.deepStrictEqual(deletes, [
    'week-progress:strength',
    'week-checked:strength:d1',
    'week-checked:strength:d2',
    'week-checked:strength:d3',
  ]);
});

test('clearWeekProgress does not touch a different program\'s week-progress or day-checked keys', async (assert)=>{
  const chunks = chunksWithStorage(fakeStorage({}));
  const [deletes] = await runSandboxAsync(chunks, `
    await clearWeekProgress('bodybuilding', ['d1']);
    __capture.push(window.storage.__deletes);
  `);
  assert.ok(deletes.every(k=> k.includes('bodybuilding')), `expected only bodybuilding keys, got ${JSON.stringify(deletes)}`);
  assert.ok(!deletes.some(k=> k.includes('strength')));
});

run();
