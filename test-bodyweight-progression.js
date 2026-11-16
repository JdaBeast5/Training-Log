'use strict';
// v3.560 (BL-11, audit H-8 part 1): rep and time progression for bodyweight
// and timed work. suggestRepProgression(log, ex, program): every set at the top
// (or the hold time) in the last two sessions → +1 rep or +5 s; past 15 reps
// or 60 s → "Ready for a harder variation"; never on Medical or Senior.
//
// Real invocation: the real suggestRepProgression, parseTopRep and
// parseBottomRep over raw logs; the real computeSuggestedSet for weighted
// rows; a real-call count over renderWorkout.
//
// Sabotage: remove the two-session rule and criterion 5 fails.
const { readIndexSource, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-bodyweight-progression.js');
const CHUNKS = ["var selectedLogDate = '2026-11-15';", ...['parseTopRep', 'parseBottomRep', 'suggestRepProgression'].map(f => extractFunction(src, f))];
const sug = (log, ex, program = 'bodyweight') => runSandbox(CHUNKS, `__capture.push(suggestRepProgression(${JSON.stringify(log)}, ${JSON.stringify(ex)}, ${JSON.stringify(program)}));`)[0];
const sess = (date, reps) => ({date, sets: reps.map(r => ({weight: null, reps: r}))});
const PUSHUP = {name: 'Push-up', sets: '4×8-12', noWeight: true};
const PLANK = {name: 'Plank', sets: '3×45s', noWeight: true};

test('criterion 1: Push-up 4×8-12, two sessions with every set at 12 → 13', (assert)=>{
  assert.deepStrictEqual(sug([sess('2026-11-10', [12, 12, 12, 12]), sess('2026-11-13', [12, 12, 12, 12])], PUSHUP), {value: 13, unit: 'reps'});
});

test('criterion 2: Plank 3×45s, two sessions at 45 s → 50 s', (assert)=>{
  assert.deepStrictEqual(sug([sess('2026-11-10', [45, 45, 45]), sess('2026-11-13', [45, 45, 45])], PLANK), {value: 50, unit: 's'});
});

test('criterion 3: Push-up at 16 in both sessions → no number, "Ready for a harder variation"', (assert)=>{
  assert.deepStrictEqual(sug([sess('2026-11-10', [16, 16, 16, 16]), sess('2026-11-13', [16, 16, 16, 16])], PUSHUP), {harder: true, words: 'Ready for a harder variation'});
});

test('criterion 4: Medical and Senior: no suggestion', (assert)=>{
  const log = [sess('2026-11-10', [12, 12, 12, 12]), sess('2026-11-13', [12, 12, 12, 12])];
  assert.strictEqual(sug(log, PUSHUP, 'medical'), null);
  assert.strictEqual(sug(log, PUSHUP, 'senior'), null);
});

test('criterion 5: one qualifying session only, or one set short of the top, or today\'s entry counted: no suggestion', (assert)=>{
  assert.strictEqual(sug([sess('2026-11-10', [10, 11, 12, 12]), sess('2026-11-13', [12, 12, 12, 12])], PUSHUP), null);
  assert.strictEqual(sug([sess('2026-11-13', [12, 12, 12, 12])], PUSHUP), null);
  assert.strictEqual(sug([sess('2026-11-13', [12, 12, 12, 12]), sess('2026-11-15', [12, 12, 12, 12])], PUSHUP), null, 'today (selectedLogDate) is not a past session');
});

test('criterion 6: weighted rows: no rep suggestion, and the real computeSuggestedSet is untouched by this item', (assert)=>{
  const weighted = [{date: '2026-11-10', sets: [{weight: 25, reps: 12}]}, {date: '2026-11-13', sets: [{weight: 25, reps: 12}]}];
  assert.strictEqual(sug(weighted, {name: 'Push-up', sets: '4×8-12'}), null);
  assert.doesNotMatch(extractFunction(src, 'computeSuggestedSet'), /suggestRepProgression/);
});

test('criterion 7: renderWorkout makes exactly 1 suggestRepProgression( call, and the reps placeholder takes its value (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/suggestRepProgression\(/g) || []).length, 1);
  assert.match(body, /const repsPlaceholder = suggested && suggested\.reps!=null\s*\?\s*suggested\.reps\s*:\s*\(repSug && repSug\.value != null && !savedSet\) \? repSug\.value/);
});

run();
