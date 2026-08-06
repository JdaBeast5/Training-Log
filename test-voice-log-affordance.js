'use strict';
// Behavioral coverage for Phase F6: barbell exercises get the plate-
// calculator button in the mic button's slot (showPlateCalc branch), with
// voice logging still reachable via a long-press — a real, deliberate
// mechanism with zero on-screen indication before this. The aria-label now
// says so, for both the main working-set row and the dynamically-inserted
// "Add Set" row template.
const { readIndexSource, extractFunction, makeRunner } = require('./testHelpers.js');
const assert = require('assert');

const src = readIndexSource();

const { test, run } = makeRunner('test-voice-log-affordance.js');

test('both plate-calculator button templates mention long-press voice logging in their aria-label', (assert)=>{
  const renderWorkoutSrc = extractFunction(src, 'renderWorkout');
  const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');
  for(const [name, fnSrc] of [['renderWorkout', renderWorkoutSrc], ['wireSetsBlock (Add Set row)', wireSetsBlockSrc]]){
    assert.ok(
      fnSrc.includes('aria-label="Open plate calculator — long-press to voice log a set"'),
      `${name} must include the updated aria-label mentioning long-press voice logging`
    );
  }
});

test('the warm-up ramp\'s plate button is deliberately left unchanged (no long-press voice mechanism exists there)', (assert)=>{
  const buildWarmupRampRowsHtmlSrc = extractFunction(src, 'buildWarmupRampRowsHtml');
  assert.ok(
    buildWarmupRampRowsHtmlSrc.includes('aria-label="Plate calculator for warm-up'),
    'the warm-up ramp plate button\'s aria-label should be untouched — checked, this mechanism does not apply to warm-up rows'
  );
});

run();
