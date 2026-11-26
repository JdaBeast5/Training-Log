'use strict';
// v3.667 (UX-66, the usability test's Friction #2): a cover chip opens the set
// sheet; only "Log set" commits. The cover's chips forwarded a tap to the real
// list chip, and a ready list chip logs in one tap, so the cover had a second
// commit button beside Log: the tester logged a set by tapping its chip to look
// at it. Now a cover chip, in any state, opens the set sheet on its set. The
// list's chips (in Then) keep one-tap logging (v3.298, with Undo).
//
// Real invocations: the real #upNextChips click statement, the real list-chip
// click listener, renderAllSetChips / renderSetChips, renderUpNext /
// renderCoverChips, openSetSheet, saveSetSheet, closeSetSheet, commitSet and
// writeSetToRow, over the real cover and set-sheet markup and rows shaped like
// renderWorkout's. commitSet is wrapped to count calls (the real one runs).
// Stubbed: the Undo toast, the sheet's drop helpers, firstSetHint.
//
// Sabotage: restore `real.click()` in the #upNextChips handler and criterion 1
// fails (one commit, no sheet).
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-chip-sheet.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'setChipOwnerTag',
  'renderSetChips', 'renderAllSetChips', 'commitSet', 'logSetChip', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor',
  'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle',
  'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'logUpNext', 'setCoverAdjust',
  'openSetSheet', 'closeSetSheet', 'saveSetSheet'].map(n => extractFunction(src, n));
// One statement or block from the source, by its first line.
function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1 || src.indexOf(startText, i + 1) !== -1) throw new Error('expected exactly one: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}
const COVER_CHIPS = statement("document.getElementById('upNextChips').addEventListener('click',");
// The list's delegated chip listener (as test-today-cover.js reads it).
const LIST_CHIPS = (()=>{
  const a = src.indexOf('// One delegated listener for every strip');
  const start = src.indexOf("document.addEventListener('click'", a);
  return src.slice(start, src.indexOf('\n});', start) + 4);
})();

const row = (i, done) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="0"><span class="set-row-owner">Bench Press</span>
  <input class="ex-input ex-weight" placeholder="185" value="${done ? '185' : ''}"><input class="ex-input ex-reps" placeholder="5" value="${done ? '5' : ''}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
const LIST = `<div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">Bench Press</div><div class="ex-sets"><span>4×4-6</span></div></div>
  <div class="set-chips" role="group"></div><div class="expand-wrap"><div><div class="sets-block">${[row(0, true), row(1, false), row(2, false), row(3, false)].join('')}</div></div></div></div>`;

function mount(){
  const { window } = runJsdom(extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'setSheetScrim') + extractElementById(src, 'setSheet')
    + `<div id="exerciseList">${LIST}</div>`, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', exerciseDetailPinned = true, equipmentProfile = null;
    var setChipLongPressAt = 0; const setSheetState = {row: null, chip: null};
    window.requestAnimationFrame = f => f();
    function getEquipment(){ return {bar:45, plates:[45,25,10,5,2.5], dbIncrement:5}; } function isBarbellExercise(){ return true; } function isDumbbellExercise(){ return false; }
    function icon(){ return ''; } function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; }
    function showUndoToast(){} function setSheetAddDrop(){} function refreshSetSheetDropBtn(){} function writeDropsToRow(){}`,
    [...FNS, `
      window.__commits = 0; const __realCommit = commitSet;
      commitSet = function(){ window.__commits++; return __realCommit.apply(this, arguments); };`,
     LIST_CHIPS, COVER_CHIPS, 'renderAllSetChips(); renderUpNext();']);
  const $ = id => window.document.getElementById(id);
  return { window, $, sheetOpen: () => !$('setSheet').hidden, reps: i => window.document.querySelector(`#exerciseList .set-row[data-set-idx="${i}"] .ex-reps`).value };
}

test('criterion 1: a tap on the cover\'s ready chip opens the set sheet on that set and commits nothing', (assert)=>{
  const ui = mount();
  const ready = ui.$('upNextChips').querySelector('.cover-chip.is-ready');
  assert.ok(ready && ready.dataset.setIdx === '1', 'anchor: set 2 is the ready chip on the cover');
  ready.click();
  assert.strictEqual(ui.window.__commits, 0, 'no commit');
  assert.strictEqual(ui.reps(1), '', 'the row is untouched');
  assert.ok(ui.sheetOpen(), 'the set sheet is open');
  assert.strictEqual(ui.$('setSheetTitle').textContent, 'Bench Press · Set 2');
  assert.strictEqual(ui.$('setSheetSave').textContent, 'Log set');
  assert.strictEqual(ui.$('setSheetWeight').value, '185', 'filled with the chip\'s values, to check or adjust');
});

test('criterion 2: then the sheet\'s "Log set" commits exactly once, on that set', (assert)=>{
  const ui = mount();
  ui.$('upNextChips').querySelector('.cover-chip.is-ready').click();
  ui.$('setSheetReps').value = '6';
  assert.strictEqual(ui.window.saveSetSheet(), true);
  assert.strictEqual(ui.window.__commits, 1);
  assert.strictEqual(ui.reps(1), '6');
  assert.ok(!ui.sheetOpen(), 'the sheet closed');
});

test('pending and logged cover chips open the sheet too, each on its own set', (assert)=>{
  const ui = mount();
  ui.$('upNextChips').querySelector('.cover-chip.is-pending').click();
  assert.match(ui.$('setSheetTitle').textContent, /Set [34]$/);
  ui.window.closeSetSheet();
  ui.$('upNextChips').querySelector('.cover-chip.is-done').click();
  assert.strictEqual(ui.$('setSheetTitle').textContent, 'Bench Press · Set 1');
  assert.strictEqual(ui.$('setSheetSave').textContent, 'Save');
  assert.strictEqual(ui.window.__commits, 0);
});

test('criterion 3: a ready chip in the list (Then) still logs in one tap', (assert)=>{
  const ui = mount();
  ui.window.document.querySelector('#exerciseList .set-chip[data-set-idx="1"]').click();
  assert.strictEqual(ui.window.__commits, 1);
  assert.strictEqual(ui.reps(1), '6', 'the chip\'s call (aim for 6, the top of 4-6), logged as shown');
  assert.ok(!ui.sheetOpen());
});

run();
