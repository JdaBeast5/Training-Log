'use strict';
// v3.395 (owner: Squat is 5×5 but the chips read 135×10, 185×10, 225×8,
// 275×4, 275×4; "yes look into it"). Cause: each set's suggestion was
// last session's set at the same index, and with no Squat in this program yet
// "last session" came from ANOTHER program (the cross-program fallback, shown
// as "Same as Last Time (Strength & Size)") — so its pyramid became the
// 5×5's five suggestions. Now, from another program, every set starts from one
// working set: the heaviest set that reached today's bottom rep, at today's
// reps. This program's own history is unchanged (set N from set N). The
// warm-up ramp builds from the same basis.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cross-program-sets.js');
const src = readIndexSource();
const { window } = runJsdom('', '', ['parseTopRep', 'parseBottomRep', 'priorSetForSlot', 'chooseRampBasis'].map(n => extractFunction(src, n))
  .concat(['function toCanonicalLb(w){ return w; }']));
// Plain objects out of the jsdom realm, for deepStrictEqual.
const slot = (...a) => JSON.parse(JSON.stringify(window.priorSetForSlot(...a)));

const PYRAMID = { sets: [{weight:135, reps:10, rpe:6}, {weight:185, reps:10, rpe:7}, {weight:225, reps:8, rpe:8}, {weight:275, reps:4, rpe:9}, {weight:275, reps:4, rpe:9}] };
const SQUAT_5x5 = { name: 'Squat', sets: '5×5' };

test('REAL invocation: from another program, a 5×5 starts every set from one working set at 5 reps (the owner\'s Squat)', (assert)=>{
  const sets = [0, 1, 2, 3, 4].map(i => slot(PYRAMID, i, SQUAT_5x5, true));
  for(const st of sets) assert.deepStrictEqual(st, {weight:225, reps:5}, 'the heaviest set that reached 5 reps (225×8), at 5');
});

test('REAL invocation: this program\'s own history still copies set by set, exactly as before', (assert)=>{
  assert.deepStrictEqual(slot(PYRAMID, 0, SQUAT_5x5, false), {weight:135, reps:10, rpe:6});
  assert.deepStrictEqual(slot(PYRAMID, 3, SQUAT_5x5, false), {weight:275, reps:4, rpe:9});
  assert.strictEqual(window.priorSetForSlot(PYRAMID, 7, SQUAT_5x5, false), null, 'a set beyond last time has nothing to copy');
});

test('REAL invocation: a range uses its bottom rep; nobody reached it → no basis; weightless sets keep the old copy', (assert)=>{
  assert.deepStrictEqual(slot(PYRAMID, 2, { sets: '4×8-10' }, true), {weight:225, reps:8});
  assert.strictEqual(window.priorSetForSlot({ sets: [{weight:300, reps:3}, {weight:300, reps:3}] }, 0, { sets: '3×10' }, true), null, 'never 300×10 off a 300×3');
  assert.deepStrictEqual(slot({ sets: [{weight:null, reps:12}] }, 0, { sets: '3×12' }, true), {weight:null, reps:12});
  assert.strictEqual(window.priorSetForSlot(null, 0, SQUAT_5x5, true), null);
});

test('REAL invocation: with no suggestion of its own, the ramp builds to that basis (225), not the other program\'s 275 top set', (assert)=>{
  const first = window.priorSetForSlot(PYRAMID, 0, SQUAT_5x5, true);
  const basis = window.chooseRampBasis(null, null, first || { weight: 275, reps: 4 });
  assert.strictEqual(basis.weight, 225);
});

test('REAL source: renderWorkout takes both the field basis and the ramp basis from priorSetForSlot, and indexes prior.sets nowhere else', (assert)=>{
  const fn = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((fn.match(/\bpriorSetForSlot\(/g) || []).length, 2);
  assert.match(fn, /const placeholderSet = priorSetForSlot\(prior, setIdx, ex, priorIsCrossProgram\);/);
  assert.match(fn, /const firstBasis = priorSetForSlot\(prior, 0, ex, priorIsCrossProgram\);/);
  assert.match(fn, /chooseRampBasis\(todayFirstSet, suggestedFirst, priorIsCrossProgram \? \(firstBasis \|\| priorTop\) : priorTop\)/);
  assert.deepStrictEqual(fn.match(/prior\.sets\[[^\]]*\]/g) || [], []);
});

run();
