'use strict';
// v3.664 (BL-81, the usability test's B4): "Session complete" tells the truth,
// and the cover offers Finish session.
//  - The cover read "Session complete · All 40 sets logged" at 38 of 40 (the
//    remaining two were in a lift ticked done). Now: "All 40 sets logged" only
//    when all are; otherwise "38 of 40 sets logged".
//  - With no next set and something logged, the cover's Log button reads
//    "Finish session" and opens the finish sheet through the same helper the
//    completing tick uses (showFinishSheet; test-finish-sheet.js covers the
//    sheet it opens and that only the helper calls openFinishSheet).
//  - A rest day, and a session with nothing logged, show no Finish.
//
// Real invocations: renderUpNext, findNextSetRow and logUpNext over the real
// cover markup (#upNext from index.html), on blocks shaped like renderWorkout's
// (each lift's box in its .exercise head, data-idx = its exIdx). The real CSS
// rule that shows the button in a finished session is read from the CSSOM.
// Stubbed: showFinishSheet (counted; the real one is test-finish-sheet.js's),
// commitSet (counted: Finish commits nothing).
//
// Sabotage: print `All ${n.total} sets logged` unconditionally and criterion 1
// fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-finish.js');
const src = readIndexSource();
const FNS = ['findNextSetRow', 'numericPlaceholder', 'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle',
  'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'logUpNext', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'setCoverAdjust', 'setChipLabel', 'escapeHtml'].map(n => extractFunction(src, n));

const setRow = (ex, i, logged) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="${ex}"><span class="set-row-owner">Lift ${ex}</span>
  <input class="ex-input ex-weight" placeholder="lb" value="${logged ? '100' : ''}"><input class="ex-input ex-reps" placeholder="reps" value="${logged ? '8' : ''}"><input class="ex-input ex-rpe" value=""></div>`;
// lifts: [[setCount, loggedCount, ticked], ...]
function list(lifts){
  return lifts.map(([n, logged, ticked], ex) => `<div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="${ex}"${ticked ? ' checked' : ''}><div class="ex-sets"><span>${n}×8</span></div></div>
    <div class="sets-block">${Array.from({length: n}, (_, i) => setRow(ex, i, i < logged)).join('')}</div></div>`).join('');
}
function mount(lifts){
  const { window } = runJsdom(extractElementById(src, 'upNext').replace(' hidden>', '>') + `<div id="exerciseList">${list(lifts)}</div>`, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', exerciseDetailPinned = true;
    window.__finish = 0; async function showFinishSheet(){ window.__finish++; }
    window.__commits = 0; function commitSet(){ window.__commits++; }
    function renderAllSetChips(){} function showUndoToast(){} function icon(){ return ''; } function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; }`,
    [...FNS, 'renderUpNext();']);
  const $ = id => window.document.getElementById(id);
  return { window, $, card: $('upNext') };
}
const FORTY_38 = [[10, 10], [10, 10], [10, 10], [10, 8, true]]; // the last lift ticked done with two sets empty

test('criterion 1: 40 sets, 38 logged, the other 2 in a lift ticked done: "Session complete", "38 of 40 sets logged", and the button reads "Finish session"', (assert)=>{
  const ui = mount(FORTY_38);
  assert.strictEqual(ui.$('upNextLift').textContent, 'Session complete');
  assert.strictEqual(ui.$('upNextTarget').textContent, '38 of 40 sets logged');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Finish session');
  assert.ok(ui.card.classList.contains('is-done') && ui.card.classList.contains('can-finish'));
});

test('criterion 2: 40 of 40 logged: "All 40 sets logged", and the button reads "Finish session"', (assert)=>{
  const ui = mount([[10, 10], [10, 10], [10, 10], [10, 10]]);
  assert.strictEqual(ui.$('upNextTarget').textContent, 'All 40 sets logged');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Finish session');
});

test('criterion 3 (the cover\'s side): Finish session opens the sheet through the shared helper, once per tap, and commits nothing', (assert)=>{
  const ui = mount(FORTY_38);
  assert.strictEqual(ui.window.logUpNext(), true);
  assert.strictEqual(ui.window.__finish, 1);
  assert.strictEqual(ui.window.__commits, 0);
});

test('criterion 5: with a next set the button reads "Log set" and the cover is not in its Finish state (what Log does is test-tap-counts.js, unchanged)', (assert)=>{
  const ui = mount([[3, 1], [2, 0]]);
  assert.strictEqual(ui.$('upNextLift').textContent, 'Lift 0', 'anchor: a next set');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log set');
  assert.ok(!ui.card.classList.contains('can-finish'));
});

test('no Finish when nothing was logged (every lift ticked, no sets), and none on a rest day', (assert)=>{
  const none = mount([[3, 0, true], [2, 0, true]]);
  assert.strictEqual(none.$('upNextTarget').textContent, '0 of 5 sets logged');
  assert.ok(!none.card.classList.contains('can-finish'));
  assert.strictEqual(none.$('upNextLog').textContent, 'Log set');
  assert.strictEqual(none.window.logUpNext(), false);
  assert.strictEqual(none.window.__finish, 0);
  const rest = mount([]);
  assert.strictEqual(rest.$('upNextLift').textContent, 'Rest day');
  assert.ok(!rest.card.classList.contains('can-finish'));
});

test('a finished day, then switching to a rest day: the Finish state goes', (assert)=>{
  const ui = mount(FORTY_38);
  assert.ok(ui.card.classList.contains('can-finish'), 'anchor');
  ui.$('exerciseList').innerHTML = '';
  ui.window.renderUpNext();
  assert.ok(!ui.card.classList.contains('can-finish'));
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log set');
});

test('REAL CSSOM: a finished session shows the Log row (one button, no adjust); otherwise a finished cover hides it as before', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const rules = []; (function walk(l){ for(const r of l){ if(r.selectorText) rules.push(r); else if(r.cssRules) walk(r.cssRules); } })(new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0].cssRules);
  const get = (sel, p) => (rules.find(r => r.selectorText === sel && r.style.getPropertyValue(p)) || {style: {getPropertyValue: () => ''}}).style.getPropertyValue(p);
  assert.strictEqual(get('.cover.is-done.can-finish .cover-log', 'display'), 'grid');
  assert.strictEqual(get('.cover.is-done.can-finish .cover-adjust', 'display'), 'none');
  assert.ok(rules.some(r => r.selectorText.split(',').map(x => x.trim()).includes('.cover.is-done .cover-log') && r.style.getPropertyValue('display') === 'none'), 'anchor: the old rule still hides it otherwise');
});

run();
