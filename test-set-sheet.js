'use strict';
// v3.299 (owner: "do 3 and include your recommendation of some of 2"): Option
// 2's logger, as an Apple HIG sheet, opened from any set chip that isn't a
// one-tap log (a logged set, a later set, a set with nothing to suggest) or by
// pressing and holding any chip.
//  - starts on the chip's own values: the recommendation, else carried forward;
//  - weight − / + moves by a LOADABLE jump (twice the smallest plate on a
//    barbell, the dumbbell increment on dumbbells), reps by 1; both stay
//    editable fields (HIG: pair a stepper with a field);
//  - RPE is a row of pills; tapping the chosen one again clears it;
//  - "Log set" (a new set) / "Save" (a logged one) writes through commitSet ->
//    writeSetToRow into the REAL row, reps last, with Undo; reps are required;
//  - Cancel, the scrim and Escape close it writing nothing; swipe down too;
//  - a note is written to the row's own note field; "Clear set" empties a
//    logged set (with Undo); "Drop set" hands over to the row's drop rows;
//  - every control is at least 44px (HIG).
// Confirmed in Chromium (390x844, seeded): a long press on a ready chip opened
// the sheet on 135 × 8; + made it 140; RPE 8; Log set wrote 140 × 8 @8 into the
// real row, started the rest timer, and the chip turned green.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-set-sheet.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'trimUnitNum', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'commitSet',
  'setSheetWeightStep', 'openSetSheet', 'closeSetSheet', 'saveSetSheet', 'stepSetSheet'].map(n => extractFunction(src, n));
const STATE = 'const setSheetState = {row:null, chip:null};';
if(!src.includes(STATE)) throw new Error('setSheetState not found');
const WIRE = (()=>{
  const start = src.indexOf('(function wireSetSheet(){');
  const end = src.indexOf('\n})();', start);
  if(start === -1 || end === -1) throw new Error('wireSetSheet not found');
  return src.slice(start, end + 6);
})();
const SHEET = extractElementById(src, 'setSheetScrim') + extractElementById(src, 'setSheet');

function row(name, {w = '', r = '', rpe = '', wp = 'lb', rp = 'reps', note = ''} = {}){
  return `<div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="1"><div class="ex-name">${name}</div><div class="ex-sets"><span>4×6-8</span></div></div>
    <div class="sets-block"><div class="set-row" data-set-idx="1" data-ex-idx="1"><span class="set-row-owner">${name}</span>
    <input class="ex-input ex-weight" placeholder="${wp}" value="${w}"><input class="ex-input ex-reps" placeholder="${rp}" value="${r}">
    <input class="ex-input ex-rpe" placeholder="RPE" value="${rpe}"><button class="set-drop-btn"></button>
    <div class="set-note-wrap"><input class="set-note-input" value="${note}"></div></div></div></div>`;
}
function mount(listHtml){
  const { window } = runJsdom(`<div id="exerciseList">${listHtml}</div>${SHEET}`, `
    var weightUnit = 'lb', distanceUnit = 'km';
    window.requestAnimationFrame = fn => fn();
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5, 1.25], dbIncrement:5}; } // micro plates: the barbell step (2.5) differs from the default (5)
    function isBarbellExercise(n){ return n === 'Barbell Row'; }
    function isDumbbellExercise(n){ return n === 'DB Curl'; }
    function renderAllSetChips(){}
    function setExerciseBlockOpen(b, open){ b.classList.toggle('open', open); }
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
  `, [STATE, ...FNS, WIRE, 'window.__open = openSetSheet; window.__state = setSheetState;']);
  const $ = id => window.document.getElementById(id);
  const real = () => window.document.querySelector('.set-row');
  return { window, $, real, open: (values) => window.__open(real(), values ? {_values: values, dataset: {exIdx:'1', setIdx:'1'}} : null) };
}

test('REAL invocation: opens on the chip\'s values (the recommendation) with the set named and its target', (assert)=>{
  const ui = mount(row('Barbell Row'));
  ui.open({done:false, weight:'135', reps:'8', distance:null});
  assert.strictEqual(ui.$('setSheet').hidden, false);
  assert.strictEqual(ui.$('setSheetTitle').textContent, 'Barbell Row · Set 2');
  assert.strictEqual(ui.$('setSheetSub').textContent, 'Target 4×6-8');
  assert.strictEqual(ui.$('setSheetWeight').value, '135');
  assert.strictEqual(ui.$('setSheetReps').value, '8');
  assert.strictEqual(ui.$('setSheetSave').textContent, 'Log set');
  assert.strictEqual(ui.$('setSheetClearBtn').hidden, true, 'nothing to clear on a new set');
});

test('REAL invocation: − / + step weight by a loadable jump (2 × smallest plate on a barbell, the dumbbell increment on dumbbells) and reps by 1, never below 0', (assert)=>{
  const ui = mount(row('Barbell Row'));
  ui.open({done:false, weight:'135', reps:'1'});
  const press = (f, d) => ui.window.document.querySelector(`.set-sheet-pm[data-field="${f}"][data-dir="${d}"]`).click();
  press('weight', 1);
  assert.strictEqual(ui.$('setSheetWeight').value, '137.5', '2 × the 1.25 lb micro plate, not the 5 lb default');
  press('reps', -1); press('reps', -1);
  assert.strictEqual(ui.$('setSheetReps').value, '0');
  const db = mount(row('DB Curl'));
  db.open({done:false, weight:'25', reps:'12'});
  db.window.document.querySelector('.set-sheet-pm[data-field="weight"][data-dir="1"]').click();
  assert.strictEqual(db.$('setSheetWeight').value, '30', 'dumbbell increment');
});

test('REAL invocation: Log set writes into the REAL row (reps last, RPE from the pills), closes, and offers Undo', (assert)=>{
  const ui = mount(row('Barbell Row'));
  const order = [];
  for(const f of ['weight', 'reps', 'rpe']) ui.real().querySelector('.ex-' + f).addEventListener('change', e => order.push(f + ':' + e.target.value));
  ui.open({done:false, weight:'135', reps:'8'});
  ui.window.document.querySelector('.set-sheet-pm[data-field="weight"][data-dir="1"]').click();
  ui.window.document.querySelector('[data-rpe="8"]').click();
  ui.$('setSheetSave').click();
  assert.deepStrictEqual(order, ['weight:137.5', 'rpe:8', 'reps:8']);
  assert.strictEqual(ui.$('setSheet').hidden, true);
  assert.strictEqual(ui.window.__toast, 'Logged Barbell Row 137.5×8');
  ui.window.__undo();
  assert.strictEqual(ui.real().querySelector('.ex-reps').value, '');
});

test('GUARD: with reps empty, Log set writes nothing and puts the cursor in reps', (assert)=>{
  const ui = mount(row('Barbell Row'));
  ui.open({done:false, weight:'135', reps:''});
  ui.$('setSheetSave').click();
  assert.strictEqual(ui.real().querySelector('.ex-weight').value, '');
  assert.strictEqual(ui.$('setSheet').hidden, false);
  assert.strictEqual(ui.window.document.activeElement, ui.$('setSheetReps'));
});

test('REAL invocation: editing a logged set says Save; tapping its RPE again clears it, and the clear sticks; Clear set empties it', (assert)=>{
  const ui = mount(row('Barbell Row', {w:'135', r:'8', rpe:'8'}));
  ui.open({done:true, weight:'135', reps:'8', rpe:'8'});
  assert.strictEqual(ui.$('setSheetSave').textContent, 'Save');
  assert.strictEqual(ui.$('setSheetClearBtn').hidden, false);
  const eight = ui.window.document.querySelector('[data-rpe="8"]');
  assert.strictEqual(eight.getAttribute('aria-checked'), 'true');
  eight.click();
  assert.strictEqual(eight.getAttribute('aria-checked'), 'false');
  ui.$('setSheetSave').click();
  assert.strictEqual(ui.real().querySelector('.ex-rpe').value, '', 'an edit writes empties too');
  ui.open({done:true, weight:'135', reps:'8'});
  ui.$('setSheetClearBtn').click();
  assert.strictEqual(ui.real().querySelector('.ex-reps').value, '');
  assert.strictEqual(ui.real().querySelector('.ex-weight').value, '');
});

test('REAL invocation: Cancel, the scrim and Escape close without writing; a note goes to the row\'s own note field', (assert)=>{
  const ui = mount(row('Barbell Row'));
  for(const close of [() => ui.$('setSheetCancel').click(), () => ui.$('setSheetScrim').click(),
                      () => ui.window.document.dispatchEvent(new ui.window.KeyboardEvent('keydown', {key:'Escape'}))]){
    ui.open({done:false, weight:'135', reps:'8'});
    close();
    assert.strictEqual(ui.$('setSheet').hidden, true);
    assert.strictEqual(ui.real().querySelector('.ex-reps').value, '');
  }
  let noted = '';
  ui.real().querySelector('.set-note-input').addEventListener('change', e => noted = e.target.value);
  ui.open({done:false, weight:'135', reps:'8'});
  ui.$('setSheetNoteBtn').click();
  ui.$('setSheetNote').value = 'left shoulder pinched';
  ui.$('setSheetSave').click();
  assert.strictEqual(noted, 'left shoulder pinched');
});

test('REAL CSSOM: every sheet control is at least 44px (Apple HIG)', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${css}</style>${SHEET}`);
  const cs = sel => window.getComputedStyle(window.document.querySelector(sel));
  assert.strictEqual(cs('.set-sheet-pm').height, '56px');
  for(const sel of ['.set-sheet-cancel', '.set-sheet-rpe button', '.set-sheet-tools button']) assert.strictEqual(cs(sel).minHeight, '44px', sel);
});

// Found in Chromium while building this: the exercise's own swipe handling
// stops pointer events from bubbling, so a document-level bubble listener
// never saw the press. The press listener listens in the capture phase, and
// finds the chip again by its set when it fires (the strip can re-render
// under a held finger).
const PRESS = (()=>{
  const start = src.indexOf('let setChipPressTimer = null, setChipLongPressAt = 0;');
  const end = src.indexOf("document.addEventListener('contextmenu'", start);
  if(start === -1 || end === -1) throw new Error('long-press block not found');
  return src.slice(start, end);
})();
test('REAL invocation: holding a chip opens the sheet even when an ancestor stops the event, and even if the strip re-rendered under the finger', async (assert)=>{
  const { window } = runJsdom(`<div id="exerciseList"><div class="exercise-block" id="blk"><div class="set-chips"><button class="set-chip" data-ex-idx="1" data-set-idx="0">135×8</button></div>
    <div class="sets-block"><div class="set-row" data-ex-idx="1" data-set-idx="0"></div></div></div></div>`, `
    window.__opened = null;
    function openSetSheet(row, chip){ window.__opened = {row, chip}; }
  `, [PRESS]);
  const doc = window.document;
  doc.getElementById('blk').addEventListener('pointerdown', e => e.stopPropagation()); // what the swipe handling does
  doc.querySelector('.set-chip').dispatchEvent(new window.Event('pointerdown', {bubbles:true}));
  // Re-render the strip mid-press: the held element is replaced by a twin.
  doc.querySelector('.set-chips').innerHTML = '<button class="set-chip" data-ex-idx="1" data-set-idx="0">135×8</button>';
  await new Promise(r => setTimeout(r, 520));
  assert.ok(window.__opened, 'the sheet opened');
  assert.strictEqual(window.__opened.chip, doc.querySelector('.set-chip'), 'on the chip now on screen');
  assert.strictEqual(window.__opened.row, doc.querySelector('.set-row'));
});

run();
