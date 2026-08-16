'use strict';
// Behavioral coverage for the third Gym Mode audit finding fixed alongside
// the superset field-chaining and rest-timer work (test-superset-field-
// chaining.js, test-superset-rest-timer-suppression.js): warm-up ramp
// eligibility (renderWorkout's warmupEligible, inside the per-exercise
// forEach) never checked whether an exercise was the BOTTOM half of a
// superset pair. "First two exercises of the day" or "a heavy top set"
// could both make the SECOND half of an early-day superset pair eligible
// for its own warm-up ramp — even though the whole point of a superset is
// going straight from the top exercise into this one with no rest, leaving
// no time to actually work through a ramp's incremental weights.
//
// renderWorkout is a huge function with a page-sized DOM/storage surface no
// existing test in this project fully invokes end-to-end — the established
// pattern for logic buried in its closure (see test-fallback-entry-
// consolidation.js) is a structural assertion on the extracted source, or,
// as here, isolating just the real boolean-expression lines (by literal
// anchor, not a hand-copied stand-in) and evaluating them in a sandbox with
// representative inputs — a REAL invocation of the actual decision, not a
// re-implementation of it.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const vm = require('vm');

const src = readIndexSource();
const { test, run } = makeRunner('test-superset-warmup-ramp-eligibility.js');

// The four real declarations this decision is built from sit far apart in
// renderWorkout's forEach body (isSupersetBottom is computed near the top
// of the loop for the row's CSS class; the other three sit ~60 lines later,
// inside a nested block dense with unrelated, heavily-dependent rendering
// code — badges, progression signals, cross-program fallbacks — that would
// need a huge stub surface just to parse, let alone run). Pulling out only
// these four exact, complete statements (verified present verbatim, so a
// changed line fails loudly here rather than silently testing stale logic)
// and concatenating them is what makes this a real, isolated invocation of
// the actual decision rather than either a hand-copied reimplementation or
// an impractically large slice of renderWorkout.
function extractLine(exactText){
  if(!src.includes(exactText)) throw new Error(`extractLine: exact statement not found verbatim in source: ${exactText}`);
  return exactText;
}

const eligibilitySnippetSrc = [
  extractLine('const isSupersetBottom = i > 0 && !!renderExercises[i-1].superTag;'),
  extractLine('const warmupEligiblePosition = i <= 1;'),
  extractLine('const isHeavySet = topRep != null && topRep <= 8;'),
  extractLine('const warmupEligible = !isSupersetBottom && (warmupEligiblePosition || isHeavySet);'),
].join('\n');

function warmupEligibleFor({i, renderExercises, topRep}){
  // i, renderExercises, topRep are free variables the real snippet reads —
  // bound directly onto the sandbox context so the script sees them as
  // globals, exactly like the real forEach closure's own outer scope
  // provides them.
  const context = vm.createContext({i, renderExercises, topRep});
  const script = `${eligibilitySnippetSrc}\nwarmupEligible;`;
  return vm.runInContext(script, context, {filename: 'sandbox.js'});
}

test('sabotage-relevant: the real eligibility snippet still contains all three real gates, not a stripped-down stand-in', (assert)=>{
  assert.match(eligibilitySnippetSrc, /warmupEligiblePosition = i <= 1/);
  assert.match(eligibilitySnippetSrc, /isHeavySet = topRep != null && topRep <= 8/);
  assert.match(eligibilitySnippetSrc, /warmupEligible = !isSupersetBottom && \(warmupEligiblePosition \|\| isHeavySet\)/);
});

test('REAL invocation: the BOTTOM half of an early-day superset pair (position-eligible) is NOT warm-up eligible', (assert)=>{
  const renderExercises = [
    {name:'DB Curl', superTag:'Superset with next'},
    {name:'Lateral Raise'}, // the bottom half — position i=1, would qualify on position alone
  ];
  const result = warmupEligibleFor({i:1, renderExercises, topRep:10});
  assert.strictEqual(result, false, 'the bottom half of a superset must never be warm-up eligible, even though position (i<=1) alone would otherwise qualify it');
});

test('REAL invocation: the BOTTOM half of an early-day superset pair is NOT warm-up eligible even with a heavy top set', (assert)=>{
  const renderExercises = [
    {name:'DB Curl', superTag:'Superset with next'},
    {name:'Lateral Raise'},
  ];
  const result = warmupEligibleFor({i:1, renderExercises, topRep:5}); // topRep<=8 -> isHeavySet would otherwise qualify it
  assert.strictEqual(result, false, 'a heavy top set does not override the superset exclusion — there is no time to ramp regardless of why this slot would otherwise qualify');
});

test('regression guard: the TOP half of a superset pair is unaffected — still eligible by normal position rules', (assert)=>{
  const renderExercises = [
    {name:'DB Curl', superTag:'Superset with next'},
    {name:'Lateral Raise'},
  ];
  const result = warmupEligibleFor({i:0, renderExercises, topRep:10});
  assert.strictEqual(result, true, 'the top half of a superset is approached fresh, same as any other exercise in the first two slots — only the handover AFTER it is rest-free');
});

test('regression guard: a plain, non-superset exercise is completely unaffected by this fix — both position and heavy-set eligibility still work exactly as before', (assert)=>{
  const renderExercises = [
    {name:'Back Squat'},
    {name:'Front Squat'},
  ];
  assert.strictEqual(warmupEligibleFor({i:1, renderExercises, topRep:10}), true, 'position-eligible (i<=1), no superset involved at all');
  assert.strictEqual(warmupEligibleFor({i:5, renderExercises: [...renderExercises, {}, {}, {}, {name:'Deadlift'}], topRep:5}), true, 'a heavy top set past the first two slots must still qualify on its own, unrelated to supersets');
  assert.strictEqual(warmupEligibleFor({i:5, renderExercises: [...renderExercises, {}, {}, {}, {name:'Leg Curl'}], topRep:12}), false, 'neither gate holds (past position, not heavy) — still correctly ineligible, same as before this fix');
});

run();
