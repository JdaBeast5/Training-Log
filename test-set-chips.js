'use strict';
// v3.298 (owner-chosen Option 3, "Set chips"): every set of an exercise shows
// as a chip under its name, without opening the exercise.
//  - logged set: what was done ("185×5"; its RPE is spoken and shown in the set sheet);
//  - each exercise's next set is "ready": its chip shows the app's own
//    suggestion (the row's numeric placeholder — the progression engine's next
//    weight, with ↑/↓ when it is an increase or a lighter load), else the set
//    before it carried forward; ONE TAP logs it as shown, with Undo (Apple HIG:
//    prefer undo over confirmation);
//  - the session's very next set (the one Up next shows) is the one that glows;
//  - with no history yet a chip shows the prescription ("×6-8") and a tap opens
//    the exercise at that set instead of logging blind;
//  - chips are 44px tall (Apple HIG minimum touch target).
// Like Up next, the chips are a thin front end over the REAL set rows: logging
// goes through writeSetToRow, which fires the rows' own change events (reps
// last), so saving, PRs, the rest timer and auto-check run as if typed.
// Confirmed in Chromium (390x844, seeded): one tap logged 135×8 into Barbell
// Row set 2, started the rest timer and showed "Logged Barbell Row 135×8 ·
// Undo"; Undo emptied the row; logged again, it survived a reload; tapping a
// pending chip opened the exercise with focus in that set; no chip text clips
// at 375/390/430px.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-set-chips.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
  'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'logSetChip'].map(n => extractFunction(src, n));
// The one delegated click listener, taken whole from its comment to its close.
const CLICK = (()=>{
  const a = src.indexOf('// One delegated listener for every strip');
  const start = src.indexOf("document.addEventListener('click'", a);
  const end = src.indexOf('\n});', start);
  if(a === -1 || start === -1 || end === -1) throw new Error('chip click listener not found');
  return src.slice(start, end + 4);
})();

function row(exIdx, setIdx, owner, {wp = 'lb', rp = 'reps', wv = '', rv = '', rpev = '', sug = ''} = {}){
  return `<div class="set-row" data-set-idx="${setIdx}" data-ex-idx="${exIdx}"><span class="set-row-owner">${owner}</span>
    <input class="ex-input ex-weight${sug ? ' ex-input-suggested ex-suggested-' + sug : ''}" placeholder="${wp}" value="${wv}">
    <input class="ex-input ex-reps" placeholder="${rp}" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value="${rpev}"></div>`;
}
function header(i, name, sets, ticked = false){
  return `<div class="exercise"><input type="checkbox" data-idx="${i}"${ticked ? ' checked' : ''}><div class="ex-name">${name}</div><div class="ex-sets"><span>${sets}</span></div></div>`;
}
function block(i, name, sets, rows, {ticked = false} = {}){
  return `<div class="exercise-block">${header(i, name, sets, ticked)}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${rows}</div></div></div></div>`;
}
function mount(listHtml){
  const { window } = runJsdom(`<div id="exerciseList">${listHtml}</div><div id="undoToast"></div>`, `
    var distanceUnit = 'km';
    var setChipLongPressAt = 0; // v3.299: the long-press flag the click listener reads (no press in these tests)
    window.__undo = null; window.__opened = null;
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
    function setExerciseBlockOpen(b, open){ window.__opened = open; b.classList.toggle('open', open); }
    // v3.299: the set sheet has its own test (test-set-sheet.js); here, only that a tap opens it on the right row.
    function openSetSheet(row, chip){ window.__sheet = {row, chip}; }
    function refreshGymLogBtn(){} // v3.301: gym mode's dock button, covered by test-gym-set-chips.js
  `, [...FNS, CLICK, 'window.__renderAll = renderAllSetChips;']);
  window.__renderAll();
  const chips = (n = 0) => [...window.document.querySelectorAll('#exerciseList > .exercise-block')[n].querySelectorAll('.set-chip')];
  const describe = n => chips(n).map(c => c.className.replace('set-chip ', '').replace(/is-/g, '') + ':' + c.querySelector('.set-chip-val').textContent);
  return { window, chips, describe, rerender: () => window.__renderAll() };
}

const BENCH_DONE = block(0, 'Bench Press', '4×4-6', [0, 1].map(s => row(0, s, 'Bench Press', {wv:'185', rv:'5', rpev:'8'})).join(''));

test('REAL invocation: logged sets show what was done; each exercise has one ready chip; only the session\'s next set glows', (assert)=>{
  const ui = mount(BENCH_DONE
    + block(1, 'Barbell Row', '4×6-8', row(1, 0, 'Barbell Row', {wv:'135', rv:'8', rpev:'7'}) + row(1, 1, 'Barbell Row') + row(1, 2, 'Barbell Row'))
    + block(2, 'Overhead Press', '3×8-10', row(2, 0, 'Overhead Press', {wp:'95', rp:'10'}) + row(2, 1, 'Overhead Press')));
  assert.deepStrictEqual(ui.describe(0), ['done:185×5', 'done:185×5']);
  // v3.299: RPE moved off the chip (into its spoken label and the sheet) so four sets fit one line.
  assert.strictEqual(ui.chips(0)[0].querySelector('.set-chip-rpe'), null);
  assert.match(ui.chips(0)[0].getAttribute('aria-label'), /185×5 at RPE 8/);
  assert.deepStrictEqual(ui.describe(1), ['done:135×8', 'ready next:135×8', 'pending:135×8'], 'carried forward from the logged set, through the plan');
  assert.deepStrictEqual(ui.describe(2), ['ready:95×10', 'pending:95×10'], 'its own suggestion, ready but not the glowing one');
  assert.strictEqual(ui.window.document.querySelectorAll('.set-chip.is-next').length, 1, 'exactly one glow');
});

test('REAL invocation: the recommendation is the chip — the progression engine\'s suggested weight, marked ↑ for an increase and ↓ for a lighter load', (assert)=>{
  const ui = mount(block(0, 'Squat', '3×5', row(0, 0, 'Squat', {wp:'230', rp:'5', sug:'increase'}))
    + block(1, 'Bench', '3×5', row(1, 0, 'Bench', {wp:'160', rp:'5', sug:'deload'})));
  const up = ui.chips(0)[0], down = ui.chips(1)[0];
  assert.strictEqual(up.querySelector('.set-chip-val').textContent, '230×5');
  assert.strictEqual(up.querySelector('.set-chip-trend').textContent, '↑');
  assert.match(up.getAttribute('aria-label'), /suggested increase/);
  assert.strictEqual(down.querySelector('.set-chip-trend').textContent, '↓');
  assert.match(down.getAttribute('aria-label'), /lighter weight/);
});

test('REAL invocation: one tap on a ready chip writes into the REAL row (reps last) and offers Undo, which puts the row back', (assert)=>{
  const ui = mount(block(0, 'Barbell Row', '4×6-8', row(0, 0, 'Barbell Row', {wp:'135', rp:'8'}) + row(0, 1, 'Barbell Row')));
  const real = ui.window.document.querySelector('.set-row[data-set-idx="0"]');
  const order = [];
  for(const f of ['weight', 'reps', 'rpe']) real.querySelector('.ex-' + f).addEventListener('change', e => order.push(f + ':' + e.target.value));
  ui.chips(0)[0].click();
  assert.deepStrictEqual(order, ['weight:135', 'reps:8'], 'weight first, reps last; no RPE invented');
  assert.strictEqual(ui.window.__toast, 'Logged Barbell Row 135×8');
  assert.deepStrictEqual(ui.describe(0), ['done:135×8', 'ready next:135×8'], 'the strip moved on');
  ui.window.__undo();
  assert.strictEqual(real.querySelector('.ex-reps').value, '');
  assert.strictEqual(real.querySelector('.ex-weight').value, '');
  assert.deepStrictEqual(ui.describe(0), ['ready next:135×8', 'pending:135×8'], 'back as it was');
});

// v3.299: a chip that isn't one-tap loggable opens the set sheet for its row
// (v3.298 opened the exercise at that row; the sheet replaced that).
test('REAL invocation: no history → the chip shows the prescription and a tap opens the set sheet for that set (nothing logged blind)', (assert)=>{
  const ui = mount(block(0, 'Lat Pulldown', '3×10-12', row(0, 0, 'Lat Pulldown') + row(0, 1, 'Lat Pulldown')));
  assert.deepStrictEqual(ui.describe(0), ['ready:×10-12', 'pending:×10-12']);
  ui.chips(0)[1].click();
  const r = ui.window.document.querySelector('.set-row[data-set-idx="1"]');
  assert.strictEqual(ui.window.__sheet.row, r, 'the sheet opens on that row');
  assert.strictEqual(r.querySelector('.ex-reps').value, '', 'nothing written');
  ui.chips(0)[0].click();
  assert.strictEqual(ui.window.__sheet.row, ui.window.document.querySelector('.set-row[data-set-idx="0"]'), 'a ready chip with nothing to suggest opens the sheet too');
});

test('REAL invocation: an exercise ticked done offers no ready chip; a superset interleaves its two exercises, told apart by initials', (assert)=>{
  const ticked = mount(block(0, 'Barbell Row', '4×6-8', row(0, 0, 'Barbell Row', {wp:'135', rp:'8'}), {ticked:true}));
  assert.deepStrictEqual(ticked.describe(0), ['pending:135×8']);
  const pair = `<div class="exercise-block superset-pair">${header(4, 'DB Curl', '3×10-12')}${header(5, 'Triceps Pushdown', '3×10-12')}
    <div class="set-chips" role="group"></div><div class="expand-wrap"><div><div class="sets-block">
    ${row(4, 0, 'DB Curl', {wp:'25', rp:'12'})}${row(5, 0, 'Triceps Pushdown', {wp:'50', rp:'12'})}${row(4, 1, 'DB Curl')}${row(5, 1, 'Triceps Pushdown')}</div></div></div></div>`;
  const ui = mount(pair);
  assert.deepStrictEqual(ui.chips(0).map(c => c.querySelector('.set-chip-tag').textContent), ['DC', 'TP', 'DC', 'TP'], 'performed order');
  assert.deepStrictEqual(ui.describe(0), ['ready next:25×12', 'ready:50×12', 'pending:25×12', 'pending:50×12']);
  assert.strictEqual(ui.window.document.querySelector('.set-chips').getAttribute('aria-label'), 'Sets for DB Curl and Triceps Pushdown');
});

test('REAL source: the strip sits OUTSIDE the expanding panel in both assemblies; renderWorkout draws it once, after the rows exist', (assert)=>{
  const strip = /<div class="set-chips" role="group"><\/div>\s*<div class="expand-wrap"/g;
  assert.strictEqual((src.match(strip) || []).length, 2, 'single exercise and superset pair');
  const fn = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  // Two real calls: the draw after the rows exist, and the row watcher (sets
  // added or swiped away change the rows without a change event).
  assert.strictEqual((fn.match(/\brenderAllSetChips\(\)/g) || []).length, 2);
  assert.match(fn, /new MutationObserver\(\(\)=> renderAllSetChips\(\)\)\.observe\(sets, \{childList:true\}\)/, 'the watcher');
  const draw = fn.indexOf('renderAllSetChips(); ');
  assert.ok(draw > fn.indexOf('renderUpNext()'), 'drawn after the list (and Up next) are built');
});

test('REAL CSSOM: chips are at least 44px tall (Apple HIG touch target) and the next set has no glow', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${css}</style><div class="set-chips"><button class="set-chip is-ready is-next">x</button></div>`);
  const cs = window.getComputedStyle(window.document.querySelector('.set-chip'));
  assert.strictEqual(cs.minHeight, '44px');
  assert.ok(!/plate-blue-rgb|cta-glow/.test(html.match(/\.set-chip\.is-next\{[^}]*\}/)[0]), 'no glow on the chip');
});

run();
