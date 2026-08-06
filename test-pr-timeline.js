'use strict';
// Behavioral coverage for reconstructAllPRs — the PR Timeline on the History
// tab. Tier 1 in the stabilization plan: this derives every PR moment that
// ever happened by replaying the real exercise corpus, with no separate
// stored list to fall back on, so a bug here silently rewrites history
// rather than throwing.
//
// Mocks window.storage (list/get) and a minimal `programs` table rather than
// the function under test itself — same "mocked-storage integration test"
// approach this project already used for its weekly-digest tests (per
// HANDOFF-v3 §2), so reconstructAllPRs, readExCorpus, parseExKey, and
// groupCorpusByExercise are all the REAL extracted source, only storage is
// faked.
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function buildChunks(){
  return [
    // Minimal program table: "Back Squat" exists in TWO programs, deliberately,
    // to exercise the documented cross-program-merge behavior ("the running
    // max is per EXERCISE, not per program slot").
    `var COMBAT_STYLES = {};`,
    `var CYCLING_STYLES = {};`,
    `var programs = {
      strength: { label:'Strength & Size', days: { d1: { exercises: [ {name:'Back Squat'} ] } } },
      powerbuilding: { label:'Powerbuilding', days: { d1: { exercises: [ {name:'Back Squat'} ] } } },
    };`,
    extractFunction(src, 'normalizeExEntry'),
    extractFunction(src, 'parseExKey'),
    extractFunction(src, 'topSetOf'),
    extractFunction(src, 'estimated1RM'),
    extractFunction(src, 'groupCorpusByExercise'),
    `var exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null, exCorpusGen = 0;`,
    extractFunction(src, 'readExCorpus'),
    extractFunction(src, 'reconstructAllPRs'),
  ];
}

function storageSetup(logsByKey){
  const entries = Object.entries(logsByKey)
    .map(([key, log])=> `    if(key === ${JSON.stringify(key)}) return { value: ${JSON.stringify(JSON.stringify(log))} };`)
    .join('\n');
  return `
    var window = {
      storage: {
        list: async ()=> ({ keys: ${JSON.stringify(Object.keys(logsByKey))} }),
        get: async (key)=>{
${entries}
          return null;
        },
      },
    };
  `;
}

const { test, run } = makeRunner('test-pr-timeline.js');

// --- Scenario 1: cross-program merge must not let a program switch fake a PR ---
// A 250x3 squat in an OLD program, then a 200x5 squat after switching to a
// NEW program. 200 doesn't beat 250's weight, and 200x5's est. 1RM (233)
// doesn't beat 250x3's (275) either — so if the running max is correctly
// shared across both programs, the switch produces ZERO new PR events. A
// version that computed each program's history independently would
// wrongly treat the new program's first session as "no history yet" and
// falsely award it a PR — exactly the bug this function's own comment says
// it exists to avoid ("the running max is per EXERCISE, not per program
// slot"). Verified this dataset actually discriminates the two behaviors
// via a sabotage run before trusting it (splitting the grouping key
// produces 2 events instead of 1).
test('switching programs does not fake a PR for a weight that never actually beat the all-time record', async (assert)=>{
  const chunks = [storageSetup({
    'ex:powerbuilding:d1:0': [{date:'2025-12-01', sets:[{weight:250, reps:3}]}],
    'ex:strength:d1:0': [{date:'2026-01-01', sets:[{weight:200, reps:5}]}],
  }), ...buildChunks()];
  const [events] = await runSandboxAsync(chunks, `__capture.push(await reconstructAllPRs());`);
  assert.strictEqual(events.length, 1, `expected only the original 250x3 to be a PR, got ${JSON.stringify(events)}`);
  assert.strictEqual(events[0].date, '2025-12-01');
  assert.strictEqual(events[0].weight, 250);
});

test('the genuinely first session ever logged for an exercise always counts as its first PR', async (assert)=>{
  const chunks = [storageSetup({
    'ex:strength:d1:0': [{date:'2026-01-01', sets:[{weight:135, reps:5}]}],
  }), ...buildChunks()];
  const [events] = await runSandboxAsync(chunks, `__capture.push(await reconstructAllPRs());`);
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].type, 'weight');
  assert.strictEqual(events[0].weight, 135);
});

// --- Scenario 2: weight-PR vs strength(e1RM)-PR classification, single program ---
// 2026-01-01 200x5, 2026-01-08 205x5 (weight PRs), 2026-01-15 185x8 (beats
// neither record — sanity check that not every session is an event),
// 2026-01-22 190x8 (doesn't beat the 205 weight record, but ITS est. 1RM of
// 241 beats the standing 239 — a standalone strength PR). Expected e1RM
// values (233/239/234/241) were verified numerically, not hand-guessed,
// before being written into these assertions.
test('single-program timeline: weight PRs, a standalone strength PR, and a non-PR session all classify correctly', async (assert)=>{
  const chunks = [storageSetup({
    'ex:strength:d1:0': [
      {date:'2026-01-08', sets:[{weight:205, reps:5}]},
      {date:'2026-01-01', sets:[{weight:200, reps:5}]},
      {date:'2026-01-22', sets:[{weight:190, reps:8}]},
      {date:'2026-01-15', sets:[{weight:185, reps:8}]},
    ],
  }), ...buildChunks()];
  const [events] = await runSandboxAsync(chunks, `__capture.push(await reconstructAllPRs());`);

  assert.deepStrictEqual(events.map(e=> e.date), ['2026-01-22', '2026-01-08', '2026-01-01'], 'newest-first, and 01-15 must not appear at all');

  const jan1 = events.find(e=> e.date === '2026-01-01');
  assert.strictEqual(jan1.type, 'weight');
  assert.strictEqual(jan1.weight, 200);

  const jan8 = events.find(e=> e.date === '2026-01-08');
  assert.strictEqual(jan8.type, 'weight');
  assert.strictEqual(jan8.weight, 205);

  const jan22 = events.find(e=> e.date === '2026-01-22');
  assert.strictEqual(jan22.type, 'strength', '190x8 does not beat the 205 weight record, so this must be a strength PR, not a weight PR');
  assert.strictEqual(jan22.weight, 190);
  assert.strictEqual(jan22.e1rm, 241);
});

run();
