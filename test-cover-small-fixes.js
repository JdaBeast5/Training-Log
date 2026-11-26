'use strict';
// v3.674 (UX-73, the usability test's Friction #10, #11 and B9):
//  - The list under the cover is headed "Rest of session"; "Then" stays the
//    superset line's word on the cover (UX-63).
//  - After a Log that commits, the cover's adjust fields close
//    (setCoverAdjust(false)); a Log that still needs reps opens them as before.
//  - Below 360 px wide the numeral steps down a size, so the page never scrolls
//    sideways at 320 px (measured in Chromium at 320 × 568: scrollWidth 320
//    for "182.5 lb ×10", 368 before; see the PR).
//
// Real invocations: logUpNext, setCoverAdjust, commitSet, renderUpNext and the
// real Log / Adjust wiring over the real cover markup; supersetThenLine on a
// pair; the real stylesheet through jsdom's CSSOM; the real list markup.
//
// Sabotage: remove the close call and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-small-fixes.js');
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
  "document.getElementById('coverRest').addEventListener('click',",
  "document.getElementById('upNextAdjust').addEventListener('click',"].map(statement);

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
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('criterion 1: the list header reads "Rest of session"; the superset line on the cover still starts "Then"', (assert)=>{
  const heads = [...html.matchAll(/<h2 class="then-title">([^<]*)<\/h2>/g)].map(m => m[1]);
  assert.deepStrictEqual(heads, ['Rest of session'], 'one header, renamed');
  const pair = `<div class="exercise-block superset-pair">`
    + `<div class="set-row" data-set-idx="0" data-ex-idx="0"><span class="set-row-owner">DB Curl</span><input class="ex-input ex-weight" placeholder="35" value=""><input class="ex-input ex-reps" placeholder="12" value=""></div>`
    + `<div class="set-row" data-set-idx="0" data-ex-idx="1"><span class="set-row-owner">Triceps Pushdown</span><input class="ex-input ex-weight" placeholder="60" value=""><input class="ex-input ex-reps" placeholder="12" value=""></div></div>`;
  const ui = mount(pair);
  const line = ui.window.supersetThenLine(ui.$('exerciseList'), ui.window.document.querySelector('.set-row[data-ex-idx="0"]'));
  assert.match(line, /^Then Triceps Pushdown/);
});

test('criterion 2: adjust opened, then Log: the fields close (no open class, aria-expanded false)', (assert)=>{
  const ui = mount(block('Bench Press', '4×4-6', [0, 1, 2].map(i => row(0, i, 'Bench Press', {wp: '185', rp: '5'})).join(''), false));
  ui.$('upNextAdjust').click();
  assert.ok(ui.$('upNextFieldsWrap').classList.contains('open'), 'anchor: opened');
  assert.strictEqual(ui.$('upNextAdjust').getAttribute('aria-expanded'), 'true');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 1, 'anchor: the set went in');
  assert.ok(!ui.$('upNextFieldsWrap').classList.contains('open'), 'closed');
  assert.strictEqual(ui.$('upNextAdjust').getAttribute('aria-expanded'), 'false');
});

test('a Log that still needs reps opens the fields, as before', (assert)=>{
  const ui = mount(block('Cable Fly', '3×12-15', [0, 1].map(i => row(0, i, 'Cable Fly')).join('')));
  ui.type('upNextWeight', '30');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 0);
  assert.ok(ui.$('upNextFieldsWrap').classList.contains('open'));
});

test('criterion 3 (CSSOM): a max-width 359px rule sets every numeral size smaller than the wide one', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const sheet = new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0];
  const top = {}, narrow = {};
  for(const r of sheet.cssRules){
    if(r.selectorText) top[r.selectorText] = top[r.selectorText] || r.style.getPropertyValue('font-size');
    if(r.media && /max-width:\s*359px/.test(r.media.mediaText)) for(const n of r.cssRules) narrow[n.selectorText] = n.style.getPropertyValue('font-size');
  }
  for(const sel of ['.cover-w', '.cover-numeral.is-m .cover-w', '.cover-numeral.is-s .cover-w']){
    assert.ok(narrow[sel], 'narrow rule for ' + sel);
    assert.ok(parseFloat(narrow[sel]) < parseFloat(top[sel]), `${sel}: ${narrow[sel]} < ${top[sel]}`);
  }
});

run();
