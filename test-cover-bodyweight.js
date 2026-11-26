'use strict';
// v3.671 (UX-72, the usability test's Friction #9): bodyweight and AMRAP sets
// read as what they are. Pull-ups (or assisted), 4×AMRAP, has a weight field
// for added load; the cover showed "0 lb ×11", the weight tile "lb", the rest
// stepper "0 lb", and the prescription "4×AMRAP reps".
//  - On a bodyweight lift that can take load (isBodyweightLoadable), a weight
//    of 0 or empty is "BW ×11"; with weight, "BW +25 ×8". The weight tile and
//    the stepper are "Added weight"; the stepper reads "BW" / "+25 lb". Log
//    never asks for a weight there. Stored values are unchanged.
//  - AMRAP: "4 sets · as many reps as you can"; the numeral is last time's
//    reps, else "AMRAP".
//
// Real invocations: renderUpNext (isBodyweightLoadable), fillSetLogger,
// renderCoverNumeral, renderCoverSteppers, logUpNext, commitSet and
// writeSetToRow, with the real Log, field and stepper wiring, over the real
// cover markup. commitSet is counted.
//
// Sabotage: print the weight unconditionally and the "BW" criterion fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-bodyweight.js');
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
const row = (ex, i, name, {wp = 'lb', rp = 'reps', noWeight = false, distance = false, wv = '', rv = ''} = {}) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="${ex}"><span class="set-row-owner">${name}</span>
  ${distance ? '<input class="ex-input ex-distance" placeholder="km" value="">' : ''}${noWeight ? '' : `<input class="ex-input ex-weight" placeholder="${wp}" value="${wv}">`}<input class="ex-input ex-reps" placeholder="${rp}" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
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


const PULL = 'Pull-ups (or assisted)';
// Set 1 logged at 0 (bodyweight) × 11; three to go.
const pulls = (w = '0', r = '11') => block(PULL, '4×AMRAP', [row(0, 0, PULL, {wv: w, rv: r}), row(0, 1, PULL), row(0, 2, PULL), row(0, 3, PULL)].join(''), false);
const rowOf = (ui, i) => ui.window.document.querySelector(`.set-row[data-set-idx="${i}"]`);

test('criterion: Pull-ups, weight 0 × 11: the numeral "BW ×11", the tile "Added weight", the prescription in words; one tap logs 0 × 11 (stored unchanged)', (assert)=>{
  const ui = mount(pulls());
  assert.strictEqual(ui.$('upNextLift').textContent, PULL, 'anchor');
  assert.strictEqual(ui.$('upNextWeight').value, '0', 'anchor: the bodyweight set carried forward');
  assert.deepStrictEqual(ui.numeral(), ['BW', '', '×11']);
  assert.match(ui.$('upNextNumeral').getAttribute('aria-label'), /^Bodyweight for 11 reps$/);
  assert.strictEqual(ui.window.document.querySelector('#upNext .up-next-field[data-field="weight"] small').textContent, 'Added weight');
  assert.strictEqual(ui.$('upNextTarget').textContent, '4 sets · as many reps as you can');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log set');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 1);
  assert.strictEqual(rowOf(ui, 1).querySelector('.ex-weight').value, '0', 'stored as it was (0)');
  assert.strictEqual(rowOf(ui, 1).querySelector('.ex-reps').value, '11');
});

test('criterion: with 25 added and 8 reps: "BW +25 ×8"; the stepper reads "+25 lb" (and "BW" at none), labelled "Added weight"', (assert)=>{
  const ui = mount(pulls('25', '8'));
  assert.deepStrictEqual(ui.numeral(), ['BW', '+25', '×8']);
  assert.match(ui.$('upNextNumeral').getAttribute('aria-label'), /^Bodyweight plus 25 lb for 8 reps$/);
  ui.window.renderCoverSteppers(ui.$('upNext'));
  assert.strictEqual(ui.$('coverStepWeight').textContent, '+25 lb');
  assert.strictEqual(ui.window.document.querySelector('#coverSteppers .cover-step[data-field="weight"] .cover-step-label').textContent, 'Added weight');
  const none = mount(pulls());
  none.window.renderCoverSteppers(none.$('upNext'));
  assert.strictEqual(none.$('coverStepWeight').textContent, 'BW', 'not "0 lb"');
});

test('criterion: Bench is unchanged ("185 lb ×5", the tile "lb", the stepper "Weight" and "185 lb")', (assert)=>{
  const ui = mount(block('Bench Press', '4×4-6', [0, 1].map(i => row(0, i, 'Bench Press', {wp: '185', rp: '5'})).join(''), false));
  assert.deepStrictEqual(ui.numeral(), ['185', 'lb', '×5']);
  assert.strictEqual(ui.window.document.querySelector('#upNext .up-next-field[data-field="weight"] small').textContent, 'lb');
  assert.strictEqual(ui.$('upNextTarget').textContent, '4×4-6 reps');
  ui.window.renderCoverSteppers(ui.$('upNext'));
  assert.strictEqual(ui.$('coverStepWeight').textContent, '185 lb');
  assert.strictEqual(ui.window.document.querySelector('#coverSteppers .cover-step[data-field="weight"] .cover-step-label').textContent, 'Weight');
});

test('a first AMRAP set with no history: the numeral reads "AMRAP" (no unit) under Target, and Log asks for reps, not a weight', (assert)=>{
  const ui = mount(block(PULL, '3×AMRAP', [0, 1, 2].map(i => row(0, i, PULL)).join('')));
  assert.deepStrictEqual(ui.numeral(), ['AMRAP', '', '']);
  assert.strictEqual(ui.$('upNextTargetLabel').hidden, false);
  assert.strictEqual(ui.$('upNextLog').textContent, 'Enter reps');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.document.activeElement, ui.$('upNextReps'));
  assert.strictEqual(ui.window.__commits.length, 0);
});

test('isBodyweightLoadable: bodyweight lifts yes, loaded lifts no', (assert)=>{
  for(const n of ['Pull-ups (or assisted)', 'Chin-up', 'Dips', 'Push-up', 'Muscle-up', 'Inverted Row', 'Hanging Leg Raise', 'Toes-to-Bar'])
    assert.strictEqual(mount('').window.isBodyweightLoadable(n), true, n);
  for(const n of ['Bench Press', 'Lat Pulldown', 'Barbell Row', 'Cable Fly', 'DB Curl'])
    assert.strictEqual(mount('').window.isBodyweightLoadable(n), false, n);
});

// v3.678: the set chips on a bodyweight lift (rows renderWorkout marks data-bw).
test('v3.678: setChipLabel on a data-bw row reads "BW×11" (0 or empty) and "BW+25×8"; an unmarked row is unchanged', (assert)=>{
  const ui = mount('');
  const doc = ui.window.document;
  const mk = bw => { const r = doc.createElement('div'); r.className = 'set-row'; if(bw) r.dataset.bw = '1'; r.innerHTML = '<input class="ex-reps" placeholder="reps">'; return r; };
  assert.strictEqual(ui.window.setChipLabel({weight: '0', reps: '11'}, mk(true)), 'BW×11');
  assert.strictEqual(ui.window.setChipLabel({weight: '', reps: '11'}, mk(true)), 'BW×11');
  assert.strictEqual(ui.window.setChipLabel({weight: '25', reps: '8'}, mk(true)), 'BW+25×8');
  assert.strictEqual(ui.window.setChipLabel({weight: '0', reps: '11'}, mk(false)), '0×11', 'unmarked: as before');
  assert.strictEqual(ui.window.setChipLabel({weight: '185', reps: '5'}, mk(false)), '185×5');
});

test('v3.678: renderWorkout marks a bodyweight lift\'s rows (with a weight field) data-bw, and + Add set copies it (real source)', (assert)=>{
  const src2 = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  assert.strictEqual(src2.split("${showWeight && isBodyweightLoadable(ex.name) ? ' data-bw=\"1\"' : ''}").length, 2, 'the row template stamps it once');
  assert.strictEqual(src2.split("if(existingRows[0] && existingRows[0].dataset.bw) div.dataset.bw = '1';").length, 2, 'a new set copies it');
});

run();
