'use strict';
// v3.555 (BL-48): the deload week also shortens duration-only cardio. A cardio
// row whose sets is a pure duration gets its minutes × 0.7, rounded to 5;
// warm-ups, cool-downs and the medical plans keep their authored length;
// lifting rows reduce exactly as before (× 0.55 on the set count).
//
// Real invocation: the real applyDeloadVolumeReduction, deloadDuration,
// hasNumericSetPrefix, parseSetCount and replaceSetCount over the real
// programs, CYCLING_STYLES and MEDICAL_STYLES days, with the real exerciseInfo.
//
// Sabotage: remove the duration branch and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-deload-duration-cardio.js');
const INFO = extractConst(fs.readFileSync(path.join(__dirname, 'content-exercises.js'), 'utf8'), 'exerciseInfo');
const CHUNKS = [INFO, ...['programs', 'CYCLING_STYLES', 'MEDICAL_STYLES', 'DELOAD_DURATION_FACTOR'].map(c => extractConst(src, c)),
  ...['hasNumericSetPrefix', 'parseSetCount', 'replaceSetCount', 'deloadDuration', 'applyDeloadVolumeReduction'].map(f => extractFunction(src, f))];
const sandbox = (code) => runSandbox(CHUNKS, code)[0];

test('criterion 1: the real running day\'s Long Run 45-60 min becomes 30-40 min; road d6\'s Long Ride (Zone 2) 90-120 min becomes 65-85 min', (assert)=>{
  const r = sandbox(`
    const find = (days, name, sets) => { for(const [id, d] of Object.entries(days)) if((d.exercises || []).some(e => e.name === name && e.sets === sets)) return d.exercises; return null; };
    let run = null, prog = null;
    for(const [k, p] of Object.entries(programs)){ const ex = find(p.days || {}, 'Long Run', '45-60 min'); if(ex){ run = ex; prog = k; break; } }
    const ride = CYCLING_STYLES.road.days.d6.exercises;
    const pick = (list, name) => list.find(e => e.name === name).sets;
    __capture.push({prog, run: pick(applyDeloadVolumeReduction(run, prog), 'Long Run'),
      rideBefore: pick(ride, 'Long Ride (Zone 2)'), ride: pick(applyDeloadVolumeReduction(ride, 'cycling'), 'Long Ride (Zone 2)')});`);
  assert.ok(r.prog, 'anchor: a real program holds Long Run 45-60 min');
  assert.strictEqual(r.run, '30-40 min');
  assert.strictEqual(r.rideBefore, '90-120 min');
  assert.strictEqual(r.ride, '65-85 min');
});

test('criterion 2: Warm-up Jog 10 min (and a cool-down) keep their length', (assert)=>{
  const r = sandbox(`__capture.push(applyDeloadVolumeReduction([{name: 'Warm-up Jog', sets: '10 min'}, {name: 'Cool-down Jog', sets: '10 min'}, {name: 'Easy Run', sets: '30 min'}], 'running').map(e => e.sets));`);
  assert.deepStrictEqual(r, ['10 min', '10 min', '20 min'], 'the Easy Run anchor shortens');
});

test('criterion 3: weeks 1-4 are untouched: renderWorkout calls it only in the deload branch', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.match(body, /if\(inDeloadWeek\)\{\s*fullExercises = applyDeloadVolumeReduction\(fullExercises, activeProgram\);/);
});

test('criterion 4: lifting rows reduce exactly as before (Squat 4×4-6 → 2×4-6)', (assert)=>{
  const r = sandbox(`__capture.push(applyDeloadVolumeReduction([{name: 'Squat', sets: '4×4-6'}, {name: 'Bench Press', sets: '3×8-10'}, {name: 'Interval', sets: '6×400m'}], 'strength').map(e => e.sets));`);
  assert.deepStrictEqual(r, ['2×4-6', '2×8-10', '3×400m']);
});

test('criterion 5: a medical Walking 20-30 min row is unchanged in week 5', (assert)=>{
  const r = sandbox(`
    let walk = null;
    for(const st of Object.values(MEDICAL_STYLES)) for(const d of Object.values(st.days || {})) for(const e of d.exercises || []) if(e.name === 'Walking' && e.sets === '20-30 min') walk = e;
    __capture.push({found: !!walk, med: applyDeloadVolumeReduction([walk], 'medical')[0].sets, other: applyDeloadVolumeReduction([walk], 'senior')[0].sets});`);
  assert.ok(r.found, 'anchor: a real medical Walking 20-30 min row');
  assert.strictEqual(r.med, '20-30 min');
  assert.strictEqual(r.other, '15-20 min', 'anchor: off the medical plans it does shorten');
});

test('criterion 6: renderWorkout makes exactly 1 applyDeloadVolumeReduction( call and passes activeProgram (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/applyDeloadVolumeReduction\(/g) || []).length, 1);
  assert.strictEqual((body.match(/applyDeloadVolumeReduction\(fullExercises, activeProgram\)/g) || []).length, 1);
});

run();
