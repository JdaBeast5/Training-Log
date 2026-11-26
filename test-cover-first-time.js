'use strict';
// v3.669 (UX-70, the usability test's Friction #6 and #7): a first-time lift
// says what Log will do. On a lift with no history the cover's numeral showed
// the target ("×12-15") in the same face as a set to log, and Log, with no reps,
// silently opened the fields; the rest steppers started at 0 lb and 0 reps.
//  - Nothing to log yet (no reps): a "Target" label over the numeral, the range
//    read as one ("12–15 reps"), and Log reads "Enter weight" (or "Enter reps"
//    with no weight field, or with the weight in). Its tap opens the fields at
//    that field. "Log set" once there are reps.
//  - The steppers read "–" for an empty field; the first + on an empty weight
//    starts at the bar (a barbell lift) or one loadable step, not 0 + step.
//
// Real invocations: renderUpNext, renderCoverNumeral, fillSetLogger,
// readSetLogger, logUpNext, setCoverAdjust, commitSet, writeSetToRow, the
// chips, renderCoverSteppers and stepCoverField, with the real wiring
// statements (#upNextLog's click, #upNextFields' input, #coverRest's click)
// over the real cover markup. commitSet is wrapped to count (the real one runs).
//
// Sabotage: keep "Log set" unconditionally and criterion 1 fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-first-time.js');
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
const row = (ex, i, name, {wp = 'lb', rp = 'reps', noWeight = false} = {}) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="${ex}"><span class="set-row-owner">${name}</span>
  ${noWeight ? '' : `<input class="ex-input ex-weight" placeholder="${wp}" value="">`}<input class="ex-input ex-reps" placeholder="${rp}" value=""><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
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
const CABLE_FLY = block('Cable Fly', '3×12-15', [0, 1, 2].map(i => row(0, i, 'Cable Fly')).join(''));

test('criterion 1: a first-time Cable Fly 3×12-15: "Target" over "12–15 reps", Log reads "Enter weight"; its tap opens the fields at the weight and commits nothing', (assert)=>{
  const ui = mount(CABLE_FLY);
  assert.strictEqual(ui.$('upNextLift').textContent, 'Cable Fly', 'anchor: Cable Fly is next');
  assert.strictEqual(ui.$('upNextTargetLabel').hidden, false);
  assert.strictEqual(ui.$('upNextTargetLabel').textContent, 'Target');
  assert.deepStrictEqual(ui.numeral(), ['12–15', 'reps', '']);
  assert.match(ui.$('upNextNumeral').getAttribute('aria-label'), /^Target: 12–15 reps$/);
  assert.strictEqual(ui.$('upNextLog').textContent, 'Enter weight');
  assert.ok(!ui.$('upNextFieldsWrap').classList.contains('open'), 'anchor: fields closed');
  ui.$('upNextLog').click();
  assert.ok(ui.$('upNextFieldsWrap').classList.contains('open'), 'the fields open');
  assert.strictEqual(ui.window.document.activeElement, ui.$('upNextWeight'), 'at the weight');
  assert.strictEqual(ui.window.__commits.length, 0, 'no commit');
});

test('criterion 2: after typing 30 and 12, the label goes, Log reads "Log set", and one click commits 30 × 12', (assert)=>{
  const ui = mount(CABLE_FLY);
  ui.type('upNextWeight', '30');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Enter reps', 'the weight in, reps still to enter');
  ui.type('upNextReps', '12');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log set');
  assert.strictEqual(ui.$('upNextTargetLabel').hidden, true);
  assert.deepStrictEqual(ui.numeral(), ['30', 'lb', '×12']);
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 1);
  assert.strictEqual(ui.window.__commits[0].weight, '30');
  assert.strictEqual(ui.window.__commits[0].reps, '12');
});

test('criterion 3: a lift with a suggestion: no "Target" label, and "Log set"', (assert)=>{
  const ui = mount(block('Bench Press', '4×4-6', [0, 1].map(i => row(0, i, 'Bench Press', {wp: '185', rp: '5'})).join(''), false));
  assert.deepStrictEqual(ui.numeral(), ['185', 'lb', '×5'], 'anchor: the suggestion');
  assert.strictEqual(ui.$('upNextTargetLabel').hidden, true);
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log set');
});

test('a first-time lift with no weight field: Log reads "Enter reps" and opens the fields at the reps', (assert)=>{
  const ui = mount(block('Push-up', '3×8-12', [0, 1].map(i => row(0, i, 'Push-up', {noWeight: true})).join('')));
  assert.strictEqual(ui.$('upNextLog').textContent, 'Enter reps');
  assert.strictEqual(ui.$('upNextTargetLabel').hidden, false);
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.document.activeElement, ui.$('upNextReps'));
  assert.strictEqual(ui.window.__commits.length, 0);
});

test('criterion 4: empty fields read "–" on the steppers; one + on an empty barbell weight gives the bar; on a cable lift one loadable step', (assert)=>{
  const bench = mount(block('Bench Press', '4×4-6', [0, 1].map(i => row(0, i, 'Bench Press')).join('')));
  bench.window.renderCoverSteppers(bench.$('upNext'));
  assert.strictEqual(bench.$('coverStepWeight').textContent, '– lb');
  assert.strictEqual(bench.$('coverStepReps').textContent, '–');
  bench.window.document.querySelector('#coverSteppers .cover-step[data-field="weight"] [data-step="-1"]').click();
  assert.strictEqual(bench.$('upNextWeight').value, '', '− on an empty weight leaves it empty');
  bench.window.document.querySelector('#coverSteppers .cover-step[data-field="weight"] [data-step="1"]').click();
  assert.strictEqual(bench.$('upNextWeight').value, '45', 'the bar');
  assert.strictEqual(bench.$('coverStepWeight').textContent, '45 lb');
  bench.window.document.querySelector('#coverSteppers .cover-step[data-field="weight"] [data-step="1"]').click();
  assert.strictEqual(bench.$('upNextWeight').value, '50', 'then steps as before (2 × the smallest plate)');
  const fly = mount(CABLE_FLY);
  fly.window.document.querySelector('#coverSteppers .cover-step[data-field="weight"] [data-step="1"]').click();
  assert.strictEqual(fly.$('upNextWeight').value, '5', 'one loadable step, not 0 + step past nothing');
  fly.window.document.querySelector('#coverSteppers .cover-step[data-field="reps"] [data-step="1"]').click();
  assert.strictEqual(fly.$('upNextReps').value, '1');
});

test('Finish session and the rest day keep their own label (the numeral never overrides them)', (assert)=>{
  const done = mount(block('Cable Fly', '3×12-15', [0, 1].map(i => row(0, i, 'Cable Fly')).join('')));
  const rows = done.window.document.querySelectorAll('.set-row');
  rows.forEach(r => { r.querySelector('.ex-weight').value = '30'; r.querySelector('.ex-reps').value = '12'; });
  done.window.renderAllSetChips(); done.window.renderUpNext();
  assert.strictEqual(done.$('upNextLog').textContent, 'Finish session');
  done.type('upNextReps', '');
  assert.strictEqual(done.$('upNextLog').textContent, 'Finish session', 'an input event on a finished cover leaves it');
  assert.strictEqual(done.$('upNextTargetLabel').hidden, true);
});

run();
