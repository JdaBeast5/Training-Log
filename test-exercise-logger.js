'use strict';
// v3.376 (owner: "in this log i want each exercise to look like the first of
// the day, it looks like only the first one was the only one that got a
// proper overhaul"). Every open exercise now logs the way the "Up next" card
// does — its own next set as big tiles and one Log set button — instead of
// the raw set rows (lb / reps / RPE plus drop, note and next buttons, which
// wrapped onto a second line on a phone). The rows stay in the page, hidden,
// as the source of truth, the way gym mode already treated them; logging goes
// through commitSet, the same path (and Undo) as a chip tap.
//
// Confirmed in Chromium at 390x844 on a seeded session: Overhead Press opened
// to "Set 1 of 3"; typing 95, then 10 and 8, kept the 95; Log set wrote
// 95 / 10 / 8 into the real row, moved the logger to "Set 2 of 3" with the
// set-to-set call (100×8) the chips also showed, and Undo put it back. A
// superset's logger names the lift ("DB Curl · set 1 of 3"); gym mode shows
// none (it has its own dock).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-exercise-logger.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
  'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep',
  'exLoggerHtml', 'fillSetLogger', 'readSetLogger', 'renderExerciseLogger', 'logExerciseLogger'].map(n => extractFunction(src, n));

function row(exIdx, setIdx, owner, {wp = 'lb', rp = 'reps', wv = '', rv = '', rpev = ''} = {}){
  return `<div class="set-row" data-set-idx="${setIdx}" data-ex-idx="${exIdx}"><span class="set-row-owner">${owner}</span>
    <input class="ex-input ex-weight" placeholder="${wp}" value="${wv}">
    <input class="ex-input ex-reps" placeholder="${rp}" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value="${rpev}"></div>`;
}
function header(i, name, sets){
  return `<div class="exercise"><input type="checkbox" data-idx="${i}"><div class="ex-name">${name}</div><div class="ex-sets"><span>${sets}</span></div></div>`;
}
// The panel's first child is the real logger markup, as in renderWorkout.
function block(i, name, sets, rows){
  return `<div class="exercise-block open">${header(i, name, sets)}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div>__LOGGER__<div class="sets-block">${rows}</div></div></div></div>`;
}
function pair(a, b, rows){
  return `<div class="exercise-block superset-pair open"><div class="superset-member">${header(a[0], a[1], a[2])}</div>
    <div class="superset-member">${header(b[0], b[1], b[2])}</div><div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div>__LOGGER__<div class="sets-block">${rows}</div></div></div></div>`;
}
function mount(listHtml){
  const { window } = runJsdom(`<div id="exerciseList"></div>`, `
    var distanceUnit = 'km', weightUnit = 'lb';
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
    function isBarbellExercise(){ return true; }
    function isDumbbellExercise(){ return false; }
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
    function refreshGymLogBtn(){}
  `, [...FNS, `document.getElementById('exerciseList').innerHTML = ${JSON.stringify(listHtml)}.split('__LOGGER__').join(exLoggerHtml());
    window.__renderAll = renderAllSetChips; window.__log = logExerciseLogger; renderAllSetChips();`]);
  const doc = window.document;
  const blocks = () => [...doc.querySelectorAll('#exerciseList > .exercise-block')];
  const logger = n => blocks()[n].querySelector('.ex-logger');
  const tile = (n, f) => logger(n).querySelector(`.up-next-field[data-field="${f}"] input`);
  return { window, doc, blocks, logger, tile, rerender: () => window.__renderAll(), log: n => window.__log(logger(n)) };
}

test('REAL source: both exercise assemblies open their panel with the logger, once each; renderAllSetChips renders it', (assert)=>{
  const fn = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const panels = fn.match(/<div class="expand-wrap" id="exSetsPanel\$\{[it]\}">\s*<div>\s*\$\{exLoggerHtml\(\)\}/g) || [];
  assert.strictEqual(panels.length, 2, 'single exercise and superset pair');
  assert.strictEqual((fn.match(/exLoggerHtml\(\)/g) || []).length, 2, 'and nowhere else');
  assert.match(extractFunction(src, 'renderAllSetChips'), /renderSetChips\(b, glow\); renderExerciseLogger\(b\);/);
});

test('REAL invocation: an open exercise shows its own next set — label, carried-forward weight, rep range as the hint', (assert)=>{
  const ui = mount(block(1, 'Overhead Press', '3×8-10', row(1, 0, 'Overhead Press', {wv:'95', rv:'10', rpev:'9'}) + row(1, 1, 'Overhead Press') + row(1, 2, 'Overhead Press')));
  assert.strictEqual(ui.logger(0).hidden, false);
  assert.strictEqual(ui.logger(0).querySelector('.ex-logger-label').textContent, 'Set 2 of 3');
  // RPE 9 at the top of the range: hold the weight (the chip's set-to-set call).
  assert.strictEqual(ui.tile(0, 'weight').value, ui.blocks()[0].querySelectorAll('.set-chip')[1]._values.weight, 'the same call the chip shows');
  assert.strictEqual(ui.tile(0, 'rpe').value, '9', 'RPE carries forward from the set just logged, as on Up next');
  assert.strictEqual(ui.logger(0).querySelector('.up-next-field[data-field="distance"]').hidden, true, 'no distance field on this lift');
  assert.match(ui.tile(0, 'reps').getAttribute('aria-label'), /^Reps for Overhead Press set 2$/);
});

test('REAL invocation: a weight typed before the reps survives every re-render; the tiles refill only when the set changes', (assert)=>{
  const ui = mount(block(1, 'Overhead Press', '3×8-10', row(1, 0, 'Overhead Press') + row(1, 1, 'Overhead Press')));
  ui.tile(0, 'weight').value = '97.5';
  ui.rerender(); ui.rerender();
  assert.strictEqual(ui.tile(0, 'weight').value, '97.5');
});

test('REAL invocation: Log set writes into the REAL row through commitSet (reps last, Undo offered) and moves on to the next set', (assert)=>{
  const ui = mount(block(1, 'Overhead Press', '3×8-10', row(1, 0, 'Overhead Press') + row(1, 1, 'Overhead Press') + row(1, 2, 'Overhead Press')));
  const real = ui.doc.querySelector('.set-row[data-set-idx="0"]');
  const order = [];
  for(const f of ['weight', 'reps', 'rpe']) real.querySelector('.ex-' + f).addEventListener('change', e => order.push(f + ':' + e.target.value));
  ui.tile(0, 'weight').value = '95'; ui.tile(0, 'reps').value = '10'; ui.tile(0, 'rpe').value = '8';
  assert.strictEqual(ui.log(0), true);
  assert.deepStrictEqual(order, ['weight:95', 'rpe:8', 'reps:10'], 'reps last, so the row becomes a real set once');
  assert.strictEqual(ui.window.__toast, 'Logged Overhead Press 95×10');
  assert.strictEqual(ui.logger(0).querySelector('.ex-logger-label').textContent, 'Set 2 of 3');
  assert.ok(ui.tile(0, 'weight').value !== '', 'the next set starts from a suggestion, not blank');
  ui.window.__undo();
  assert.strictEqual(real.querySelector('.ex-reps').value, '', 'Undo empties the row again');
  assert.strictEqual(ui.logger(0).querySelector('.ex-logger-label').textContent, 'Set 1 of 3');
});

test('REAL invocation: no reps, no write — the reps tile takes focus instead', (assert)=>{
  const ui = mount(block(1, 'Overhead Press', '3×8-10', row(1, 0, 'Overhead Press')));
  ui.tile(0, 'weight').value = '95';
  assert.strictEqual(ui.log(0), false);
  assert.strictEqual(ui.doc.querySelector('.set-row .ex-weight').value, '', 'nothing written');
  assert.strictEqual(ui.doc.activeElement, ui.tile(0, 'reps'));
});

test('REAL invocation: a finished exercise hides its logger; a superset\'s names whose set it is', (assert)=>{
  const ui = mount(block(0, 'Bench Press', '2×5', row(0, 0, 'Bench Press', {wv:'185', rv:'5'}) + row(0, 1, 'Bench Press', {wv:'185', rv:'5'}))
    + pair([4, 'DB Curl', '3×10-12'], [5, 'Triceps Pushdown', '3×10-12'], row(4, 0, 'DB Curl', {wv:'30', rv:'12'}) + row(5, 0, 'Triceps Pushdown') + row(4, 1, 'DB Curl') + row(5, 1, 'Triceps Pushdown')));
  assert.strictEqual(ui.logger(0).hidden, true, 'all sets logged');
  assert.strictEqual(ui.logger(1).querySelector('.ex-logger-label').textContent, 'Triceps Pushdown · set 1 of 2', 'interleaved order, as performed');
});

const CSS = [...fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL CSSOM: raw rows hidden on Today; the logger is gone in gym mode; no 76px indent left; the rep-range hint fits', (assert)=>{
  assert.strictEqual(declared('#exerciseList .sets-block > .set-row', 'display'), 'none');
  assert.strictEqual(declared('body.gym-mode .up-next', 'display'), 'none', 'the logger carries .up-next, so gym mode drops it with the card');
  assert.strictEqual(declared('.sets-block', 'padding'), '4px 0px');
  assert.strictEqual(declared('.ex-details', 'margin'), '6px 0px 2px');
  assert.strictEqual(declared('.up-next .up-next-field input::placeholder', 'font-size'), '17px', '"10-12" in a third of a 390px card');
});

run();
