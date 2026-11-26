'use strict';
// v3.657 (UX-63, owner C and (i) yes, 2026-11-24): supersets on the cover.
//  - The cover still alternates A1 → B1 → A2 (findNextSetRow reads the pair's
//    interleaved rows) and still starts no rest after the lead-in lift.
//  - New: under the prescription, the other lift's next set, so you can set up
//    the next station: "Then Triceps Pushdown · 60×12 · no rest between" on the
//    lead-in lift's cover, "Then DB Curl · 40×10" on the second's.
//  - New: after the pair, the rest is the heavier lift's (the larger of the two
//    lifts' rest targets), and names it.
//
// Real invocations: renderUpNext, supersetThenLine, setCoverThen, logUpNext and
// commitSet over the real cover markup and a pair block shaped like
// renderWorkout's (interleaved rows, the set chips' values); the real
// wireSetsBlock's set-save path for the rest (as test-superset-rest-timer-
// suppression.js drives it). The whole flow was also run in Chromium on the
// harness fixture (see the PR).
//
// Sabotage: build the line from the same lift's next row and criterion 1 fails;
// rest for the second lift's own target and criterion 4 fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-superset-then.js');
const src = readIndexSource();
const FNS = ['findNextSetRow', 'numericPlaceholder', 'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle',
  'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'logUpNext', 'writeSetToRow', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'setCoverAdjust', 'commitSet', 'setChipLabel', 'escapeHtml'].map(n => extractFunction(src, n));

function row(ex, setIdx, owner, w, r, done){
  return `<div class="set-row" data-set-idx="${setIdx}" data-ex-idx="${ex}"><span class="set-row-owner">${owner}</span>
    <input class="ex-input ex-weight" placeholder="${w}" value="${done ? w : ''}"><input class="ex-input ex-reps" placeholder="${r}" value="${done ? r : ''}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
}
// A lone lift, then the pair as renderWorkout builds it: one block, rows interleaved A1 B1 A2 B2.
function page({pairDone = 0, sets = 2} = {}){
  const rows = [];
  for(let k = 0; k < sets; k++){ rows.push(row(1, k, 'DB Curl', '40', '10', 2 * k < pairDone)); rows.push(row(2, k, 'Triceps Pushdown', '60', '12', 2 * k + 1 < pairDone)); }
  const chips = [];
  for(let k = 0; k < sets; k++) for(const [ex, w, r] of [[1, '40', '10'], [2, '60', '12']]) chips.push(`<button class="set-chip" data-ex-idx="${ex}" data-set-idx="${k}"><span class="set-chip-val">${w}×${r}</span></button>`);
  return `<div class="exercise-block"><div class="set-chips"><button class="set-chip" data-ex-idx="0" data-set-idx="0"><span class="set-chip-val">135×8</span></button></div>
      <input type="checkbox" data-idx="0"><div class="ex-sets"><span>1×8</span></div><div class="sets-block">${row(0, 0, 'Barbell Row', '135', '8', true)}</div></div>
    <div class="exercise-block superset-pair"><div class="set-chips">${chips.join('')}</div>
      <div class="superset-member" data-ex-idx="1"><input type="checkbox" data-idx="1"><div class="ex-sets"><span>${sets}×10</span></div></div>
      <div class="superset-member" data-ex-idx="2"><input type="checkbox" data-idx="2"><div class="ex-sets"><span>${sets}×12</span></div></div>
      <div class="sets-block">${rows.join('')}</div></div>`;
}
function mount(opts){
  const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="exerciseList">${page(opts)}</div>`, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'p', exerciseDetailPinned = true;
    function renderAllSetChips(){} function showUndoToast(){} function icon(){ return ''; } function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; }`,
    [...FNS, 'window.__render = renderUpNext; window.__log = logUpNext; document.addEventListener("change", () => renderUpNext());']);
  const $ = id => window.document.getElementById(id);
  window.__render();
  return { window, $, then: () => $('upNextThen').hidden ? null : $('upNextThen').textContent };
}

test('criterion 1: DB Curl next: "Then Triceps Pushdown · 60×12 · no rest between"; after the real Log, Triceps Pushdown set 1, naming DB Curl set 2', (assert)=>{
  const ui = mount();
  assert.strictEqual(ui.$('upNextLift').textContent, 'DB Curl', 'anchor: the pair is next');
  assert.strictEqual(ui.then(), 'Then Triceps Pushdown · 60×12 · no rest between');
  ui.window.__log();
  assert.strictEqual(ui.$('upNextLift').textContent, 'Triceps Pushdown');
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Set 1 of 2');
  assert.strictEqual(ui.then(), 'Then DB Curl · 40×10', 'the second lift names the first\'s next set (a rest comes first)');
});

test('criterion 2: a lift that isn\'t in a superset has no line', (assert)=>{
  const ui = mount();
  // The lone lift: un-log Barbell Row so it is next.
  const r = ui.window.document.querySelector('.set-row[data-ex-idx="0"] .ex-reps'); r.value = '';
  ui.window.__render();
  assert.strictEqual(ui.$('upNextLift').textContent, 'Barbell Row', 'anchor');
  assert.strictEqual(ui.then(), null);
});

test('criterion 3: on the pair\'s last set, nothing comes next in the pair, so no line', (assert)=>{
  const ui = mount({pairDone: 3});
  assert.strictEqual(ui.$('upNextLift').textContent, 'Triceps Pushdown', 'anchor: B2, the last');
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Set 2 of 2');
  assert.strictEqual(ui.then(), null);
});

test('review fix: a chip with only its "Set N" fallback gives no value', (assert)=>{
  const ui = mount();
  const doc = ui.window.document;
  doc.querySelector('.set-chip[data-ex-idx="2"][data-set-idx="0"] .set-chip-val').textContent = 'Set 1';
  ui.window.__render();
  assert.strictEqual(ui.then(), 'Then Triceps Pushdown · no rest between');
});

test('the line goes when the session is done', (assert)=>{
  const ui = mount({pairDone: 4});
  assert.strictEqual(ui.$('upNextLift').textContent, 'Session complete', 'anchor');
  assert.strictEqual(ui.then(), null);
});

// ---- criterion 4: the rest after the pair (the real set-save path) ----------
const GLOBALS = `
  window.exKey = ()=> 'ex:test:d1:0';
  window.slotIdOf = (ex, i)=> i; // v3.561 (BL-72): built-in rows keep their render index
  window.activeProgram = 'strength';
  window.activeDay = 'd1';
  window.selectedLogDate = '2026-01-01';
  window.subVariantOf = ()=> undefined;
  window.isDistanceExercise = ()=> false;
  window.isBarbellExercise = ()=> false;
  window.escapeHtml = (s)=> String(s);
  window.icon = (n)=> '<svg data-icon="'+n+'"></svg>'; // 2026-10-27 (v3.422): a saved set shows the drawn check
  window.saveExSet = async ()=> ({isPR:false});
  window.getFallbackPriorEntry = async ()=> null;
  window.renderWorkout = async ()=>{};
  window.refreshSessionSummary = async ()=>{};
  window.getDefaultRestSeconds = (ex)=> ({'Barbell Row': 150, 'DB Curl': 60, 'Triceps Pushdown': 60, 'Face Pull': 45})[ex.name] || 90;
  window.getRestReasonLabel = (ex)=> 'rest for ' + ex.name;
  // Not what this file is testing (see test-backdating-rest-timer-
  // suppression.js for that) — stubbed false so save()'s real call to the
  // real isBackdating() doesn't throw ReferenceError.
  window.isBackdating = ()=> false;
  window.__restCalls = 0;
  window.__rests = []; window.startRestTimer = (s, why)=>{ window.__restCalls++; window.__rests.push([s, why]); };
  window.__gymCalls = 0;
  window.maybeOfferGymMode = ()=>{ window.__gymCalls++; };
  window.noteWorkoutActivity = ()=>{};
  window.isPastPrNotificationWindow = async ()=> false;
  window.triggerCelebration = ()=>{};
  window.toCanonicalLb = (v)=> Number(v);
  window.toCanonicalMetres = (v)=> Number(v);
  window.fmtWeight = (v)=> v + ' lb';
  window.restTargetBySlot = {};
  window.SpeechRecognitionCtor = null;
  window.saveExWarmupSkipped = async ()=>{};
  window.wirePlateButton = ()=>{};
  window.wireVoiceLogButton = ()=>{};
  window.calcPlatesPerSide = ()=> null;
  window.formatPlateResult = ()=> '';
  window.getEquipment = ()=> ({bar:45, plates:[45,35,25,10,5,2.5], dbIncrement:5});
  window.toDisplayWeight = (v)=> v;
  window.trimUnitNum = (v)=> String(v);
  window.weightUnit = 'lb';
  window.analyzeProgressionSignal = ()=> null;
  window.exerciseInfo = {'DB Curl': {category:'pull'}, 'Barbell Row': {category:'pull'}, 'Triceps Pushdown': {category:'push'}};
  window.buildPastSessions = ()=> [];
  window.getExLog = async ()=> [];
  window.makeSwipeable = ()=>{};
`;
// v3.658 (UX-64): wireSetsBlock's save and startRestTimer call the cover's drop-offer hooks (the real ones).
const COVER_DROP_HOOKS = '\nlet coverDropOffer = null;\n' + ['isCoverDropRow', 'renderCoverDrop', 'endCoverDrop', 'noteSetForCoverDrop', 'holdRestForDrop'].map(n => extractFunction(src, n)).join('\n');
const WIRE = [extractFunction(src, 'checkAllSetsCompleteAndAutoCheck'), extractFunction(src, 'wireSetsBlock') + COVER_DROP_HOOKS];
// The pair's rows as renderWorkout interleaves them: the first lift's set 1
// (logged unless \`leadLogged\` is false), then the second's, the one logged here.
const ROW = (leadLogged = true) => `<div id="row"><input type="checkbox" data-idx="1"><div class="sets-block">
  <div class="set-row" data-set-idx="0" data-ex-idx="0"><span class="set-num">1</span><input class="ex-weight" value="135"><input class="ex-reps" value="${leadLogged ? '5' : ''}"><input class="ex-rpe" value=""><span class="set-status"></span></div>
  <div class="set-row" data-set-idx="0" data-ex-idx="1"><span class="set-num">1</span><input class="ex-weight" value=""><input class="ex-reps" value=""><input class="ex-rpe" value=""><span class="set-status"></span></div>
  <button class="add-set-btn">Add Set</button></div></div>`;
const change = (input, v) => { input.value = v; input.dispatchEvent(new input.ownerDocument.defaultView.Event('change', {bubbles: true})); };
const flush = () => new Promise(r => setTimeout(r, 0));
async function logSecond(lead, leadLogged){
  const { document, window } = runJsdom(ROW(leadLogged), GLOBALS, [...WIRE,
    `wireSetsBlock(document.getElementById('row'), 1, {name:'DB Curl', sets:'3x10'}, undefined, ${lead ? JSON.stringify(lead) : 'undefined'});`]);
  const row = document.getElementById('row').querySelector('.set-row[data-ex-idx="1"]');
  change(row.querySelector('.ex-weight'), '40'); await flush();
  change(row.querySelector('.ex-reps'), '10'); await flush();
  return JSON.parse(JSON.stringify(window.__rests));
}

test('criterion 4: after the pair\'s second lift, the rest is the heavier lift\'s (Barbell Row 150 s over DB Curl 60 s), and names it', async (assert)=>{
  assert.deepStrictEqual(await logSecond({name: 'Barbell Row', sets: '3x8', superTag: 'Superset with next'}), [[150, 'rest for Barbell Row']]);
});

test('criterion 4: when the second lift needs the longer rest, it keeps its own', async (assert)=>{
  assert.deepStrictEqual(await logSecond({name: 'Face Pull', sets: '3x15', superTag: 'Superset with next'}), [[60, 'rest for DB Curl']]);
});

test('review fix: a second-lift set with no first-lift set logged at that number (its extra sets) rests as its own', async (assert)=>{
  assert.deepStrictEqual(await logSecond({name: 'Barbell Row', sets: '3x8', superTag: 'Superset with next'}, false), [[60, 'rest for DB Curl']]);
});

test('anchor: a lift outside a superset rests its own target, as before', async (assert)=>{
  assert.deepStrictEqual(await logSecond(null), [[60, 'rest for DB Curl']]);
});

test('REAL source: renderWorkout wires the pair\'s second lift with the first as its lead', (assert)=>{
  assert.strictEqual((src.match(/wireSetsBlock\(pairRow, b, bottomPiece\.ex, bottomPiece\.fallbackEntry, topPiece\.ex\);/g) || []).length, 1);
});

run();
