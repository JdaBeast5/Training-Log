'use strict';
// Behavioral coverage for the cross-program exercise history fallback —
// getExerciseLocationIndex, exKeyForLocation, getFallbackPriorEntry. Tier 1:
// this is what stops a shared exercise (Squat, Bench Press, etc.) from
// looking brand-new just because the CURRENT program/day slot has never
// logged it before, by searching every other program/style it appears in.
//
// Uses the REAL `programs`/`MEDICAL_STYLES` tables (not a fake minimal
// model) specifically so the test exercises real cross-program locations —
// 'Squat' genuinely appears in 5 different programs in the live data,
// including the exact "Strength & Size -> Powerbuilding" pair a past
// session's bug report was about (per HANDOFF history).
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function buildChunks(){
  return [
    extractConst(src, 'programs'),
    extractConst(src, 'MEDICAL_STYLES'),
    `var COMBAT_STYLES = {};`,
    `var CYCLING_STYLES = {};`,
    `var WATERSPORTS_STYLES = {};`,
    `var YOGA_STYLES = {};`,
    extractFunction(src, 'normalizeExEntry'),
    `var exerciseLocationIndex = null;`,
    extractFunction(src, 'getExerciseLocationIndex'),
    extractFunction(src, 'exKeyForLocation'),
    extractFunction(src, 'programLabelFor'),
  ];
}

function storageSetup(logsByKey){
  const entries = Object.entries(logsByKey)
    .map(([key, log])=> `    if(key === ${JSON.stringify(key)}) return { value: ${JSON.stringify(JSON.stringify(log))} };`)
    .join('\n');
  return `
    var window = {
      storage: {
        get: async (key)=>{
${entries}
          return null;
        },
      },
    };
  `;
}

const { test, run } = makeRunner('test-cross-program-history.js');

test('getExerciseLocationIndex finds Squat in every real program that has it, including the documented Strength & Size <-> Powerbuilding pair', async (assert)=>{
  const chunks = [storageSetup({}), ...buildChunks()];
  const [locs] = await runSandboxAsync(chunks, `__capture.push(getExerciseLocationIndex()['Squat']);`);
  assert.ok(Array.isArray(locs) && locs.length >= 5, `expected Squat to appear in 5+ real locations, got ${JSON.stringify(locs)}`);
  const asPairs = locs.map(l=> `${l.program}:${l.dayId}:${l.idx}`);
  assert.ok(asPairs.includes('strength:d2:0'), 'expected strength:d2:0 in the location index');
  assert.ok(asPairs.includes('powerbuilding:d1:0'), 'expected powerbuilding:d1:0 in the location index');
});

test('getFallbackPriorEntry pulls real history from a DIFFERENT program when the current slot has none of its own', async (assert)=>{
  const chunks = [
    storageSetup({
      'ex:powerbuilding:d1:0': [{date:'2026-01-10', sets:[{weight:225, reps:5}]}],
    }),
    `var selectedLogDate = '2026-02-01';`,
    ...buildChunks(),
    extractFunction(src, 'getFallbackPriorEntry'),
  ];
  const [entry] = await runSandboxAsync(chunks, `
    __capture.push(await getFallbackPriorEntry('Squat', 'ex:strength:d2:0'));
  `);
  assert.ok(entry, 'expected a fallback entry from powerbuilding');
  assert.strictEqual(entry.sourceProgram, 'powerbuilding');
  assert.strictEqual(entry.date, '2026-01-10');
  assert.strictEqual(entry.sets[0].weight, 225);
});

test('getFallbackPriorEntry never reads from the excluded (current) slot key, even if it has data', async (assert)=>{
  const chunks = [
    storageSetup({
      // The excluded key has the NEWEST date, on purpose — if it leaked in
      // despite being excluded, it would win over the real fallback below.
      'ex:strength:d2:0': [{date:'2026-01-31', sets:[{weight:999, reps:1}]}],
      'ex:powerbuilding:d1:0': [{date:'2026-01-10', sets:[{weight:225, reps:5}]}],
      'ex:athletic:d1:2': [{date:'2026-01-15', sets:[{weight:230, reps:5}]}],
    }),
    `var selectedLogDate = '2026-02-01';`,
    ...buildChunks(),
    extractFunction(src, 'getFallbackPriorEntry'),
  ];
  const [entry] = await runSandboxAsync(chunks, `
    __capture.push(await getFallbackPriorEntry('Squat', 'ex:strength:d2:0'));
  `);
  assert.notStrictEqual(entry.weight, 999, 'must never surface the excluded slot');
  assert.strictEqual(entry.sourceProgram, 'athletic', 'the most recent NON-excluded entry (2026-01-15) should win');
  assert.strictEqual(entry.sets[0].weight, 230);
});

test('getFallbackPriorEntry picks the most recent entry among several other locations, not just the first found', async (assert)=>{
  const chunks = [
    storageSetup({
      'ex:bodybuilding:d5:0': [{date:'2025-11-01', sets:[{weight:200, reps:5}]}],
      'ex:powerlifting:d1:0': [{date:'2026-01-20', sets:[{weight:245, reps:3}]}],
      'ex:powerbuilding:d1:0': [{date:'2026-01-05', sets:[{weight:220, reps:5}]}],
    }),
    `var selectedLogDate = '2026-02-01';`,
    ...buildChunks(),
    extractFunction(src, 'getFallbackPriorEntry'),
  ];
  const [entry] = await runSandboxAsync(chunks, `
    __capture.push(await getFallbackPriorEntry('Squat', 'ex:strength:d2:0'));
  `);
  assert.strictEqual(entry.sourceProgram, 'powerlifting');
  assert.strictEqual(entry.date, '2026-01-20');
});

test('getFallbackPriorEntry excludes entries dated as the currently-selected (backdating) log date', async (assert)=>{
  const chunks = [
    storageSetup({
      'ex:powerbuilding:d1:0': [
        {date:'2026-01-10', sets:[{weight:220, reps:5}]},
        {date:'2026-01-25', sets:[{weight:230, reps:5}]}, // matches selectedLogDate below -> must be excluded
      ],
    }),
    `var selectedLogDate = '2026-01-25';`,
    ...buildChunks(),
    extractFunction(src, 'getFallbackPriorEntry'),
  ];
  const [entry] = await runSandboxAsync(chunks, `
    __capture.push(await getFallbackPriorEntry('Squat', 'ex:strength:d2:0'));
  `);
  assert.strictEqual(entry.date, '2026-01-10', 'the entry dated as selectedLogDate must be skipped');
});

test('getFallbackPriorEntry returns null when the exercise genuinely has no history anywhere', async (assert)=>{
  const chunks = [
    storageSetup({}),
    `var selectedLogDate = '2026-02-01';`,
    ...buildChunks(),
    extractFunction(src, 'getFallbackPriorEntry'),
  ];
  const [entry] = await runSandboxAsync(chunks, `
    __capture.push(await getFallbackPriorEntry('Squat', 'ex:strength:d2:0'));
  `);
  assert.strictEqual(entry, null);
});

run();
