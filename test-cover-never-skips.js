'use strict';
// v3.663 (BL-80, the usability test's B1 and B3): the cover never skips a set.
//  - B1: findNextSetRow's "is this lift ticked?" read the block's FIRST box. In
//    a superset pair that's the first lift's, so logging DB Curl's last set
//    (which auto-ticks DB Curl) made every Triceps Pushdown row read as done:
//    its last set was never offered. Now it reads the row's own lift's box.
//  - B3: Undo on a lift's last set wrote the fields back but left the lift's
//    auto-tick, so the cover skipped the undone set. commitSet now remembers
//    the lift's box; Undo takes back a tick the commit caused, never one made
//    by hand.
//
// Real invocations: the whole wireSetsBlock (its save path runs the real
// checkAllSetsCompleteAndAutoCheck, the auto-tick), logUpNext, commitSet,
// writeSetToRow, findNextSetRow, renderUpNext and showUndoToast over the real
// cover and toast markup, on blocks shaped like renderWorkout's (a lone lift;
// a superset pair: one block, two members with their own boxes, one shared
// sets block, rows interleaved). Stubbed at the boundary: saveExSet (records),
// the rest timer, the list's re-render.
//
// Sabotage: (a) restore the unscoped querySelector('input[type=checkbox]') in
// findNextSetRow and criterion 1 fails; (b) drop the box restore from Undo and
// criterion 2 fails; (c) untick on Undo whatever the box was before, and the
// hand-tick case of criterion 3 fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-never-skips.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'numericPlaceholder', 'writeSetToRow', 'setChipLabel', 'commitSet', 'findNextSetRow', 'readSetLogger', 'logUpNext',
  'setCoverAdjust', 'isBackdating', 'checkAllSetsCompleteAndAutoCheck', 'wireSetsBlock', 'showUndoToast', 'closeFinishSheet',
  'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */,
  'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution',
  'isCoverDropRow', 'renderCoverDrop', 'endCoverDrop', 'noteSetForCoverDrop', 'holdRestForDrop', 'coverDropKey'].map(n => extractFunction(src, n));
const OFFER = (src.match(/^let coverDropOffer = null;$/m) || [])[0];
if(!OFFER) throw new Error('coverDropOffer declaration not found');

const setRow = (ex, i, name) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="${ex}"><span class="set-row-owner">${name}</span>
  <input class="ex-input ex-weight" placeholder="lb" value=""><input class="ex-input ex-reps" placeholder="reps" value=""><input class="ex-input ex-rpe" value=""><span class="set-status"></span></div>`;
const head = (ex, name, sets, ticked) => `<div class="exercise"><input type="checkbox" data-idx="${ex}"${ticked ? ' checked' : ''}><div class="ex-name">${name}</div><div class="ex-sets"><span>${sets}</span></div></div>`;
const lone = (ex, name, n, ticked) => `<div class="exercise-block" id="b${ex}">${head(ex, name, n + '×8', ticked)}<div class="sets-block">${Array.from({length: n}, (_, i) => setRow(ex, i, name)).join('')}<button class="add-set-btn">Add Set</button></div></div>`;
const pair = (a, b, n) => `<div class="exercise-block superset-pair" id="pair">
  <div class="superset-member" data-ex-idx="${a}">${head(a, 'DB Curl', n + '×10')}</div><div class="superset-member" data-ex-idx="${b}">${head(b, 'Triceps Pushdown', n + '×12')}</div>
  <div class="sets-block">${Array.from({length: n}, (_, i) => setRow(a, i, 'DB Curl') + setRow(b, i, 'Triceps Pushdown')).join('')}<button class="add-set-btn">Add a round</button></div></div>`;

function mount(listHtml, wire){
  const body = extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'undoToast') + extractElementById(src, 'finishSheet') + `<div id="exerciseList">${listHtml}</div>`;
  const { window } = runJsdom(body, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', activeDay = 'd1', selectedLogDate = '2026-11-24', exerciseDetailPinned = true;
    var restTargetBySlot = {}, SpeechRecognitionCtor = null, undoToastTimeout = null, restTimerEndsAt = null;
    function getTodayKey(){ return '2026-11-24'; }
    window.__sets = []; async function saveExSet(day, slot, setIdx, w, reps){ await null; window.__sets.push([slot, setIdx, w, reps]); return {isPR:false}; }
    window.__ticks = []; function startRestTimer(){} function getDefaultRestSeconds(){ return 60; } function getRestReasonLabel(){ return ''; }
    function exKey(p, d, s){ return 'ex:' + p + ':' + d + ':' + s; } function slotIdOf(ex, i){ return i; } function subVariantOf(){ return undefined; }
    function isDistanceExercise(){ return false; } function getFallbackPriorEntry(){ return null; } async function renderWorkout(){} async function refreshSessionSummary(){}
    function icon(){ return ''; } function renderAllSetChips(){} function setExerciseBlockOpen(){} function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; }
    async function isPastPrNotificationWindow(){ return false; } function triggerCelebration(){} function toCanonicalLb(v){ return Number(v); } function toCanonicalMetres(v){ return Number(v); }
    function fmtWeight(v){ return v + ' lb'; } async function saveExWarmupSkipped(){} function wirePlateButton(){} function wireVoiceLogButton(){}
    function calcPlatesPerSide(){ return null; } function formatPlateResult(){ return ''; } function analyzeProgressionSignal(){ return null; }
    function buildPastSessions(){ return []; } async function getExLog(){ return []; } function makeSwipeable(){} function noteWorkoutActivity(){} function deleteSet(){}
    function getEquipment(){ return {bar:45, plates:[45,35,25,10,5,2.5], dbIncrement:5}; } function toDisplayWeight(v){ return v; } function trimUnitNum(v){ return String(v); }
    function isBarbellExercise(){ return false; } var exerciseInfo = {};`,
    [OFFER, ...FNS, wire, `
      // The lift's own box: its change handler (renderWorkout's) records the tick.
      document.querySelectorAll('.exercise input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => window.__ticks.push([cb.dataset.idx, cb.checked])));
      window.__log = () => { const w = document.getElementById('upNextWeight'), r = document.getElementById('upNextReps'); if(w && !w.value) w.value = '20'; if(r && !r.value) r.value = '10'; return logUpNext(); };
      renderUpNext();`]);
  const flush = async () => { for(let i = 0; i < 6; i++) await new Promise(r => setTimeout(r, 0)); };
  const $ = id => window.document.getElementById(id);
  const at = () => `${$('upNextLift').textContent} ${$('upNextLabel').textContent}`.trim();
  return { window, $, flush, at, box: i => window.document.querySelector(`.exercise input[data-idx="${i}"]`) };
}

test('criterion 1: the superset (DB Curl + Triceps Pushdown, 3 sets each): the cover visits every set, and after DB Curl\'s last set (now auto-ticked) it offers Triceps Pushdown\'s last set', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 1, true) + pair(1, 2, 3) + lone(3, 'Face Pull', 1), `
    wireSetsBlock(document.getElementById('pair'), 1, {name:'DB Curl', sets:'3x10', superTag:'Superset with next'});
    wireSetsBlock(document.getElementById('pair'), 2, {name:'Triceps Pushdown', sets:'3x12'}, undefined, {name:'DB Curl', sets:'3x10', superTag:'Superset with next'});`);
  const seen = [];
  for(let i = 0; i < 6; i++){ seen.push(ui.at()); assert.strictEqual(ui.window.__log(), true, 'logged ' + ui.at()); await ui.flush(); }
  assert.deepStrictEqual(seen, ['DB Curl Set 1 of 3', 'Triceps Pushdown Set 1 of 3', 'DB Curl Set 2 of 3', 'Triceps Pushdown Set 2 of 3', 'DB Curl Set 3 of 3', 'Triceps Pushdown Set 3 of 3']);
  assert.ok(ui.box(1).checked, 'anchor: DB Curl auto-ticked after its last set');
  assert.ok([...ui.window.document.querySelectorAll('.set-row[data-ex-idx="2"] .ex-reps')].every(r => r.value !== ''), 'every Triceps Pushdown set has reps');
  assert.strictEqual(ui.at(), 'Face Pull Set 1 of 1', 'then the next block');
});

test('criterion 1 (the moment itself): with DB Curl done and ticked, Triceps Pushdown\'s last set is next, not the next block', async (assert)=>{
  const ui = mount(pair(1, 2, 2) + lone(3, 'Face Pull', 1), `wireSetsBlock(document.getElementById('pair'), 1, {name:'DB Curl', sets:'2x10'}); wireSetsBlock(document.getElementById('pair'), 2, {name:'Triceps Pushdown', sets:'2x12'});`);
  for(let i = 0; i < 3; i++){ ui.window.__log(); await ui.flush(); }
  assert.ok(ui.box(1).checked, 'anchor: DB Curl ticked');
  assert.strictEqual(ui.at(), 'Triceps Pushdown Set 2 of 2');
});

test('criterion 2: Barbell Row, 7 sets logged on the cover (auto-ticked); Undo empties set 7, unticks Row and the cover returns to "Barbell Row, Set 7 of 7"', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 7) + lone(1, 'DB Curl', 1), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'7x8'});`);
  for(let i = 0; i < 7; i++){ ui.window.__log(); await ui.flush(); }
  assert.ok(ui.box(0).checked, 'anchor: Row auto-ticked');
  assert.strictEqual(ui.at(), 'DB Curl Set 1 of 1', 'anchor: the cover moved on');
  ui.$('undoToastBtn').click();
  await ui.flush();
  assert.strictEqual(ui.window.document.querySelector('.set-row[data-ex-idx="0"][data-set-idx="6"] .ex-reps').value, '', 'set 7 is empty again');
  assert.strictEqual(ui.box(0).checked, false, 'Row is unticked');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__ticks.slice(-1))), [['0', false]], 'the untick runs the box\'s own change handler');
  ui.window.renderUpNext();
  assert.strictEqual(ui.$('upNextLift').textContent, 'Barbell Row');
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Set 7 of 7');
});

test('criterion 3: a lift ticked by hand with sets still empty is still skipped, and Undo of another set never unticks it', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 2) + lone(1, 'Lat Pulldown', 3, true) + lone(2, 'DB Curl', 1), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'2x8'});`);
  ui.window.__log(); await ui.flush(); ui.window.__log(); await ui.flush();
  assert.strictEqual(ui.at(), 'DB Curl Set 1 of 1', 'the hand-ticked Lat Pulldown is skipped');
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(ui.box(1).checked, true, 'the hand tick stays');
  ui.window.renderUpNext();
  assert.strictEqual(ui.at(), 'Barbell Row Set 2 of 2', 'Row\'s undone set is next again; Lat Pulldown still skipped');
});

test('criterion 3: Undo of a set that didn\'t complete its lift leaves the lift\'s box as it was (unticked, no change event)', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 3), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'3x8'});`);
  ui.window.__log(); await ui.flush();
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(ui.box(0).checked, false);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__ticks)), [], 'no tick change at all');
});

test('criterion 3: a lift the lifter ticked by hand, then logged a set on (a chip: commitSet) and undid, stays ticked', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 2, true), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'2x8'});`);
  assert.ok(ui.box(0).checked, 'anchor: ticked by hand');
  ui.window.commitSet(ui.window.document.querySelector('.set-row[data-ex-idx="0"][data-set-idx="0"]'), {weight: '135', reps: '8'});
  await ui.flush();
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(ui.window.document.querySelector('.set-row[data-ex-idx="0"][data-set-idx="0"] .ex-reps').value, '', 'anchor: the set was undone');
  assert.strictEqual(ui.box(0).checked, true, 'the hand tick stays');
});

test('review fix: Undo of the day\'s last set also closes the finish sheet its auto-tick opened', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 1), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'1x8'});`);
  ui.window.__log(); await ui.flush();
  assert.ok(ui.box(0).checked, 'anchor: the day\'s last lift auto-ticked');
  ui.$('finishSheet').classList.add('active'); // what the completing tick's handler does (openFinishSheet)
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(ui.box(0).checked, false);
  assert.strictEqual(ui.$('finishSheet').classList.contains('active'), false, 'the finish sheet closed');
});

test('review fix: a tick made by hand AFTER the commit (within the Undo window) stays', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 3), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'3x8'});`);
  ui.window.__log(); await ui.flush();
  ui.box(0).click(); // the lifter ticks the lift by hand to skip the rest
  assert.ok(ui.box(0).checked, 'anchor: ticked by hand');
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(ui.box(0).checked, true, 'Undo takes back the set, not the hand tick');
});

test('review fix: if the list was rebuilt before Undo (the row is no longer in the page), Undo leaves the lift\'s box alone', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 1), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'1x8'});`);
  ui.window.__log(); await ui.flush();
  const list = ui.$('exerciseList'); list.innerHTML = list.innerHTML; // a re-render: new elements
  const live = ui.box(0); live.checked = true;
  const before = ui.window.__ticks.length;
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(live.checked, true, 'the live box is untouched');
  assert.strictEqual(ui.window.__ticks.length, before, 'no change handler ran on a detached box');
});

test('criterion 4: lone lifts keep their order (one box per block, its own)', async (assert)=>{
  const ui = mount(lone(0, 'Barbell Row', 2) + lone(1, 'DB Curl', 1), `wireSetsBlock(document.getElementById('b0'), 0, {name:'Barbell Row', sets:'2x8'}); wireSetsBlock(document.getElementById('b1'), 1, {name:'DB Curl', sets:'1x10'});`);
  const seen = [];
  for(let i = 0; i < 3; i++){ seen.push(ui.at()); ui.window.__log(); await ui.flush(); }
  assert.deepStrictEqual(seen, ['Barbell Row Set 1 of 2', 'Barbell Row Set 2 of 2', 'DB Curl Set 1 of 1']);
  assert.strictEqual(ui.$('upNextLift').textContent, 'Session complete');
});

run();
