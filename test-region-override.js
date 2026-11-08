'use strict';
// v3.522 (BL-03, audit SAF-3 part 1): per-exercise body-region overrides for
// the resting-region flags. Real invocation of the real regionsForExercise
// with the real EXERCISE_REGION_OVERRIDE, CATEGORY_TO_REGIONS and exerciseInfo,
// plus a wiring count (renderWorkout is too entangled to drive whole in jsdom,
// as test-today-workout-emoji.js notes).
//
// Sabotage anchor: empty EXERCISE_REGION_OVERRIDE and criteria 1-3 fail; put a
// CATEGORY_TO_REGIONS[ lookup back at either call site and criterion 6 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');
const fs = require('fs');
const path = require('path');

const src = readIndexSource();
const indexOnly = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-region-override.js');

const chunks = [
  extractConst(src, 'exerciseInfo'),
  extractConst(src, 'CATEGORY_TO_REGIONS'),
  extractConst(src, 'EXERCISE_REGION_OVERRIDE'),
  extractFunction(src, 'regionsForExercise'),
];
const sbx = (body) => runSandbox(chunks, body)[0];
const regionsOf = (name) => sbx(`__capture.push(regionsForExercise(${JSON.stringify(name)}, (exerciseInfo[${JSON.stringify(name)}] || {}).category));`);

test('criterion 1: Hangboard Max Hang flags Hands/Fingers', (assert)=>{
  assert.ok(regionsOf('Hangboard Max Hang').includes('Hands/Fingers'));
  for(const n of ['Hangboard Repeaters', 'Lock-off Hold']) assert.ok(regionsOf(n).includes('Hands/Fingers'), n);
});

test('criterion 2: Eccentric Heel Drop flags Ankle/Foot, not Elbow/Wrist (its category is arms)', (assert)=>{
  const r = regionsOf('Eccentric Heel Drop');
  assert.ok(r.includes('Ankle/Foot'), r.join(','));
  assert.ok(!r.includes('Elbow/Wrist'), r.join(','));
  for(const n of ['Calf Raise', 'Standing Calf Raise', 'Tibialis Raise']) assert.ok(regionsOf(n).includes('Ankle/Foot'), n);
});

test('criterion 3: Leg Curl and Nordic Curl flag Knee; Neck Bridges flag Neck; Wall Balls and Sled Push flag Knee and Lower Back', (assert)=>{
  assert.ok(regionsOf('Leg Curl').includes('Knee'));
  assert.ok(regionsOf('Nordic Curl').includes('Knee'));
  assert.ok(regionsOf('Neck Bridges').includes('Neck'));
  for(const n of ['Wall Balls', 'Sled Push']){
    const r = regionsOf(n);
    assert.ok(r.includes('Knee') && r.includes('Lower Back'), n + ': ' + r.join(','));
  }
});

test('criterion 4: Bench Press returns exactly CATEGORY_TO_REGIONS.push; an unknown category returns []', (assert)=>{
  const r = sbx(`__capture.push({bench: regionsForExercise('Bench Press', exerciseInfo['Bench Press'].category), push: CATEGORY_TO_REGIONS.push,
    unknown: regionsForExercise('Nonexistent Move', 'not-a-category'), none: regionsForExercise('Nonexistent Move', undefined)});`);
  assert.deepStrictEqual(r.bench, r.push);
  assert.deepStrictEqual(r.unknown, []);
  assert.deepStrictEqual(r.none, []);
});

test('criterion 5: every EXERCISE_REGION_OVERRIDE key is an exerciseInfo key, and every region is a real Care region', (assert)=>{
  const r = sbx(`__capture.push({keys: Object.keys(EXERCISE_REGION_OVERRIDE), missing: Object.keys(EXERCISE_REGION_OVERRIDE).filter(k => !exerciseInfo[k]),
    regions: [...new Set(Object.values(EXERCISE_REGION_OVERRIDE).flat())]});`);
  assert.strictEqual(r.keys.length, 12, 'the audit\'s 12 exercises');
  assert.deepStrictEqual(r.missing, []);
  // The Care region picker's own option labels (the strings resting regions are stored as).
  const picker = indexOnly.slice(indexOnly.indexOf('<select id="careRegion"'), indexOnly.indexOf('</select>', indexOnly.indexOf('<select id="careRegion"')));
  const careLabels = new Set([...picker.matchAll(/<option>([^<]+)<\/option>/g)].map(m => m[1].trim()));
  assert.ok(careLabels.has('Neck') && careLabels.has('Knee') && careLabels.size >= 10, 'read the real picker: ' + [...careLabels].join(','));
  for(const reg of r.regions) assert.ok(careLabels.has(reg), 'not a Care region label: ' + reg);
});

function stripLineComments(text){
  return text.split('\n').map(l => { const i = l.indexOf('//'); return i >= 0 && !/https?:$/.test(l.slice(0, i)) ? l.slice(0, i) : l; }).join('\n');
}

test('criterion 6: one CATEGORY_TO_REGIONS[ read (in the helper); regionsForExercise( called exactly twice, from the heads-up and from renderWorkout', (assert)=>{
  const code = stripLineComments(indexOnly);
  assert.strictEqual((code.match(/CATEGORY_TO_REGIONS\s*\[/g) || []).length, 1);
  assert.strictEqual((stripLineComments(extractFunction(src, 'regionsForExercise')).match(/CATEGORY_TO_REGIONS\s*\[/g) || []).length, 1);
  const calls = (code.match(/\bregionsForExercise\s*\(/g) || []).length - (code.match(/function\s+regionsForExercise\s*\(/g) || []).length;
  assert.strictEqual(calls, 2);
  for(const fn of ['getSessionHeadsUpInsight', 'renderWorkout']){
    const body = stripLineComments(extractFunction(src, fn));
    assert.strictEqual((body.match(/\bregionsForExercise\s*\(\s*ex\.name\s*,\s*info\.category\s*\)/g) || []).length, 1, fn + ' looks up by the (substituted) exercise name');
  }
});

test('review: in renderWorkout, every category swap lookup skips overridden exercises (no wrong-body-part swap before BL-04)', (assert)=>{
  const body = stripLineComments(extractFunction(src, 'renderWorkout'));
  const swaps = (body.match(/\bsuggestSubstitute\s*\(/g) || []).length;
  const guarded = (body.match(/EXERCISE_REGION_OVERRIDE\[ex\.name\]\s*\?\s*null\s*:\s*suggestSubstitute\s*\(/g) || []).length;
  assert.strictEqual(swaps, 2, 'the caution swap and the AI-tailor prompt');
  assert.strictEqual(guarded, swaps);
});

run();
