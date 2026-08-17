'use strict';
// Structural coverage across EVERY program's real data, not just the one
// pair (Strength & Size d1: DB Curl/Triceps Pushdown) exercised by
// test-superset-field-chaining.js and test-superset-shared-sets-block-
// wiring.js. Those tests prove the weaving logic is correct in general (it
// is generic over exIdx/DOM order, not special-cased per exercise); this
// test instead proves every REAL superTag entry in the actual `programs`
// data satisfies the two assumptions the two-pass renderWorkout assembly
// depends on:
//
//   1. isSupersetBottom (index.html, near "const isSupersetTop") reads
//      renderExercises[i-1].superTag — a superTag exercise must have a
//      following exercise in the SAME day's array, or assembleSupersetPair
//      has nothing to pair it with (the superTag exercise would render as
//      a dangling top half with no partner).
//   2. Nothing in renderWorkout's two-pass model handles a THIRD exercise
//      chained onto a pair — if the "next" exercise itself also carried
//      superTag, it would simultaneously be treated as this pair's bottom
//      AND as a new pair's top for a further exercise, which the current
//      one-pair-of-two model does not support.
//
// A real interaction/layout check for one pair per untested program
// (Bodybuilding, Powerbuilding) was also done live in Chromium via
// Playwright — this test covers the data shape for ALL 25 programs, which
// a browser click-through of every single one is not a practical way to
// keep verified over time.
const { readIndexSource, extractConst, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-superset-all-programs-coverage.js');

const programsSrc = extractConst(src, 'programs');
// Plain data literal (checked: no external identifier references), safe to
// eval in isolation the same way extractConst's callers already treat
// other top-level const data tables in this test suite.
const programs = (0, eval)('(' + programsSrc.replace(/^const\s+programs\s*=\s*/, '').replace(/;\s*$/, '') + ')');

function collectSuperTagPairs(){
  const pairs = [];
  for(const [progKey, prog] of Object.entries(programs)){
    if(!prog || !prog.days) continue;
    for(const [dayKey, day] of Object.entries(prog.days)){
      if(!Array.isArray(day.exercises)) continue;
      day.exercises.forEach((ex, i) => {
        if(ex.superTag){
          pairs.push({
            prog: progKey, day: dayKey, idx: i,
            name: ex.name,
            next: i + 1 < day.exercises.length ? day.exercises[i + 1] : null,
          });
        }
      });
    }
  }
  return pairs;
}

test('sabotage-relevant: the real programs data actually contains superset pairs to check — an empty result would make every assertion below vacuous', (assert)=>{
  const pairs = collectSuperTagPairs();
  assert.ok(pairs.length > 0, 'collectSuperTagPairs must find at least one real superTag exercise in programs');
});

test('every superTag exercise, in every program and day, has a following exercise in the same day — none is left as a dangling top half with no partner', (assert)=>{
  const pairs = collectSuperTagPairs();
  const dangling = pairs.filter(p => p.next === null);
  assert.deepStrictEqual(dangling.map(p => `${p.prog}/${p.day}: ${p.name}`), [],
    'every superTag exercise must be followed by another exercise in its own day\'s array');
});

test('no superTag exercise is immediately followed by ANOTHER superTag exercise — the two-pass assembly model only supports pairs of two, not chains of three+', (assert)=>{
  const pairs = collectSuperTagPairs();
  const chained = pairs.filter(p => p.next && !!p.next.superTag);
  assert.deepStrictEqual(chained.map(p => `${p.prog}/${p.day}: ${p.name} -> ${p.next.name}`), [],
    'a superTag exercise\'s partner must not itself be a superTag exercise (that would need three-way chaining the current model doesn\'t implement)');
});

test('sabotage anchor: the exact known set of superset pairs across all programs, as of this session — catches a program edit silently adding/removing/moving a superset without anyone noticing', (assert)=>{
  const pairs = collectSuperTagPairs().map(p => `${p.prog}/${p.day}: ${p.name} + ${p.next ? p.next.name : '(none)'}`);
  assert.deepStrictEqual(pairs.sort(), [
    'bodybuilding/d1: Overhead Triceps Extension + Triceps Pushdown',
    'bodybuilding/d2: DB Curl + Hammer Curl',
    'bodybuilding/d4: Cable Crunch + Hanging Leg Raise',
    'bodybuilding/d5: Leg Extension + Leg Curl',
    'powerbuilding/d5: Lateral Raise + Rear Delt Fly',
    'strength/d1: DB Curl + Triceps Pushdown',
    'strength/d4: Lateral Raise + Face Pull',
  ].sort(), 'if this fails, a program was edited to add/remove/rename a superset — update this list deliberately after confirming the new pair renders correctly, don\'t just paste the new failure output in to make it pass');
});

run();
