'use strict';
// v3.670 (UX-71, the usability test's B8): timed and cardio rows log with one
// tap. The cover appended " reps" to every prescription ("4×45s reps",
// "20 min reps", the numeral "45s reps"); Log did nothing on Plank (an empty
// reps tile); Incline Walk once logged "0×20".
//  - The prescription line keeps the program's unit ("4 × 45 s", "20 min");
//    "reps" only where getSetFieldUnit says reps.
//  - A timed or minutes row with an empty reps tile is filled from the
//    prescription: the numeral reads "45 s" / "20 min", Log reads "Log 45 s" /
//    "Log 20 min" and commits in one tap. The tile is labelled Sec / Min.
//  - Distance stays optional and is never written as 0.
//
// Real invocations: renderUpNext, fillSetLogger (coverSetUnit,
// coverTimedValue, the real getSetFieldUnit), renderCoverNumeral, logUpNext,
// commitSet and writeSetToRow, with the real Log and field wiring, over the
// real cover markup and rows shaped like renderWorkout's (a timed row with no
// history has the unit word as its reps placeholder). commitSet is counted.
//
// Sabotage: restore `${target} reps` and the label criterion fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-timed-rows.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'setChipOwnerTag',
  'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor',
  'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle',
  'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'logUpNext', 'setCoverAdjust',
  'renderCoverSteppers', 'stepCoverField', 'setCoverRepsLeft'].map(n => extractFunction(src, n));
function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1 || src.indexOf(startText, i + 1) !== -1) throw new Error('expected exactly one: ' + startText);
  const line = src.slice(i, src.indexOf('\n', i));
  return /\);$/.test(line) ? line : src.slice(i, src.indexOf('\n});', i) + 4);
}
const WIRING = ["document.getElementById('upNextLog').addEventListener('click', logUpNext);",
  "document.getElementById('upNextFields').addEventListener('input',",
  "document.getElementById('coverRest').addEventListener('click',"].map(statement);

// A first-time lift: no numeric placeholders (nothing to suggest), as renderWorkout draws it.
const row = (ex, i, name, {wp = 'lb', rp = 'reps', noWeight = false, distance = false} = {}) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="${ex}"><span class="set-row-owner">${name}</span>
  ${distance ? '<input class="ex-input ex-distance" placeholder="km" value="">' : ''}${noWeight ? '' : `<input class="ex-input ex-weight" placeholder="${wp}" value="">`}<input class="ex-input ex-reps" placeholder="${rp}" value=""><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
const block = (name, sets, rows, firstTime = true) => `<div class="exercise-block"${firstTime ? ' data-first-time="1"' : ''}><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">${name}</div><div class="ex-sets"><span>${sets}</span></div></div>
  <div class="set-chips" role="group"></div><div class="expand-wrap"><div><div class="sets-block">${rows}</div></div></div></div>`;

function mount(listHtml){
  const { window } = runJsdom(extractElementById(src, 'upNext').replace(' hidden>', '>') + `<div id="exerciseList">${listHtml}</div>`, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', exerciseDetailPinned = true, equipmentProfile = null;
    function getEquipment(){ return {bar:45, plates:[45,25,10,5,2.5], dbIncrement:5}; }
    function isBarbellExercise(n){ return /Bench|Squat/.test(n || ''); } function isDumbbellExercise(n){ return /DB/.test(n || ''); }
    function icon(){ return ''; } function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return 'First time: pick a weight'; }
    function showUndoToast(){} function adjustRestTimer(){}`,
    [...FNS, `window.__commits = []; const __realCommit = commitSet;
      commitSet = function(row, values){ window.__commits.push(JSON.parse(JSON.stringify(values))); return __realCommit.apply(this, arguments); };`,
     ...WIRING, 'renderAllSetChips(); renderUpNext();']);
  const $ = id => window.document.getElementById(id);
  const type = (id, v) => { $(id).value = v; $(id).dispatchEvent(new window.Event('input', {bubbles: true})); };
  return { window, $, type, numeral: () => [...$('upNextNumeral').children].map(c => c.textContent) };
}

// Plank (noWeight) and Incline Walk (noWeight, with the distance field a walk gets), as the program writes them.
const PLANK = block('Plank', '4×45s', [0, 1, 2, 3].map(i => row(0, i, 'Plank', {rp: 'sec', noWeight: true})).join(''));
const WALK = block('Incline Walk', '20 min', row(0, 0, 'Incline Walk', {rp: 'min', noWeight: true, distance: true}));
const rowOf = (ui, i) => ui.window.document.querySelector(`.set-row[data-set-idx="${i}"]`);

test('criterion: Plank 4×45s: "4 × 45 s" (no "reps"), the numeral "45 s", Log reads "Log 45 s" and one tap stores 45 with no weight', (assert)=>{
  const ui = mount(PLANK);
  assert.strictEqual(ui.$('upNextLift').textContent, 'Plank', 'anchor');
  assert.strictEqual(ui.$('upNextTarget').textContent, '4 × 45 s');
  assert.deepStrictEqual(ui.numeral(), ['45', 's', '']);
  assert.strictEqual(ui.$('upNextTargetLabel').hidden, true, 'a set to log, not a target');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log 45 s');
  assert.strictEqual(ui.window.document.querySelector('#upNext .up-next-field[data-field="reps"] small').textContent, 'Sec');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 1, 'one tap, one set');
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-reps').value, '45');
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-weight'), null, 'no weight');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log 45 s', 'the next hold, the same');
});

test('criterion: Incline Walk 20 min: "20 min", Log reads "Log 20 min", one tap stores 20 with no weight and no distance (never 0)', (assert)=>{
  const ui = mount(WALK);
  assert.strictEqual(ui.$('upNextTarget').textContent, '20 min');
  assert.deepStrictEqual(ui.numeral(), ['20', 'min', '']);
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log 20 min');
  assert.strictEqual(ui.$('upNextDistance').value, '', 'distance stays optional');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 1);
  assert.strictEqual(ui.window.__commits[0].reps, '20');
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-reps').value, '20');
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-distance').value, '', 'no distance written (not 0)');
});

test('criterion: a reps lift is unchanged ("4×4-6 reps", "Log set"); a range of seconds fills its low end; a typed time is kept', (assert)=>{
  const bench = mount(block('Bench Press', '4×4-6', [0, 1].map(i => row(0, i, 'Bench Press', {wp: '185', rp: '5'})).join(''), false));
  assert.strictEqual(bench.$('upNextTarget').textContent, '4×4-6 reps');
  assert.strictEqual(bench.$('upNextLog').textContent, 'Log set');
  assert.strictEqual(bench.window.document.querySelector('#upNext .up-next-field[data-field="reps"] small').textContent, 'Reps');
  const range = mount(block('Plank', '3×45-60s', [0, 1, 2].map(i => row(0, i, 'Plank', {rp: 'sec', noWeight: true})).join('')));
  assert.strictEqual(range.$('upNextTarget').textContent, '3 × 45-60 s');
  assert.strictEqual(range.$('upNextLog').textContent, 'Log 45 s');
  range.type('upNextReps', '60');
  assert.strictEqual(range.$('upNextLog').textContent, 'Log 60 s');
});

test('a timed row with its time cleared: "Enter time", and Log opens the field without logging', (assert)=>{
  const ui = mount(PLANK);
  ui.type('upNextReps', '');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Enter time');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 0);
  assert.strictEqual(ui.window.document.activeElement, ui.$('upNextReps'));
});

// v3.677: the rest stepper on a timed set is its time, and "Reps left" is hidden.
test('v3.677: on Plank the rest stepper reads "Seconds" and "45 s", steps by 5 s, and Reps left is hidden; a reps lift keeps Reps and Reps left', (assert)=>{
  const ui = mount(PLANK);
  ui.window.renderCoverSteppers(ui.$('upNext'));
  const step = ui.window.document.querySelector('#coverSteppers .cover-step[data-field="reps"]');
  assert.strictEqual(step.querySelector('.cover-step-label').textContent, 'Seconds');
  assert.strictEqual(ui.$('coverStepReps').textContent, '45 s');
  assert.strictEqual(step.querySelector('[data-step="1"]').getAttribute('aria-label'), 'More time');
  assert.strictEqual(ui.window.document.querySelector('#coverSteppers .cover-rir').hidden, true);
  step.querySelector('[data-step="1"]').click();
  assert.strictEqual(ui.$('upNextReps').value, '50', '5 s a step');
  assert.strictEqual(ui.$('coverStepReps').textContent, '50 s');
  const walk = mount(WALK);
  walk.window.renderCoverSteppers(walk.$('upNext'));
  assert.strictEqual(walk.window.document.querySelector('#coverSteppers .cover-step[data-field="reps"] .cover-step-label').textContent, 'Minutes');
  assert.strictEqual(walk.$('coverStepReps').textContent, '20 min');
  const bench = mount(block('Bench Press', '4×4-6', [0, 1].map(i => row(0, i, 'Bench Press', {wp: '185', rp: '5'})).join(''), false));
  bench.window.renderCoverSteppers(bench.$('upNext'));
  assert.strictEqual(bench.window.document.querySelector('#coverSteppers .cover-step[data-field="reps"] .cover-step-label').textContent, 'Reps');
  assert.strictEqual(bench.$('coverStepReps').textContent, '5');
  assert.strictEqual(bench.window.document.querySelector('#coverSteppers .cover-rir').hidden, false);
});

run();
