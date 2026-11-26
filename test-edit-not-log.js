'use strict';
// v3.672 (BL-84, the usability test's B5, B6 and Clear set): editing a set
// never acts like logging one.
//  - B6: editing a logged set (5 → 4 reps through its sheet) restarted the full
//    rest and the toast said "Logged". The rest now starts only as a row
//    becomes a finished set; an edit re-saves without touching the timer, and
//    the toast reads "Updated".
//  - Clear on the set whose save started the running rest stops it (Clear on
//    another set leaves it); its toast reads "Cleared".
//  - B5: the cover keeps what the lifter typed while it still points at the
//    same set of the same workout, through a redraw of the list (a warm-up's
//    Done re-renders it); another set, day or date fills afresh.
//
// Real invocations (criteria 2-4): the whole wireSetsBlock save path, the real
// startRestTimer and the rest timer's close handler, commitSet / writeSetToRow,
// openSetSheet / saveSetSheet / closeSetSheet and the sheet's Clear handler,
// over the real cover, rest-timer and sheet markup (test-cover-drop-offer.js's
// setup, drop control off). Criterion 1: renderUpNext, fillSetLogger,
// readSetLogger and logUpNext over the real cover, with the list redrawn as
// renderWorkout redraws it (renderWorkout can't run a day in jsdom; the
// warm-up's Done path was run in Chromium, see the PR).
//
// Sabotage: drop the wasReal check and criterion 2 fails (the rest restarts).
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-edit-not-log.js');
const src = readIndexSource();

const ENGINE_CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES',
  'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'exerciseInfo',
  'RIR_TARGETS', 'COMPOUND_CATEGORIES', 'DROP_SET_MAX',
  // v3.668 (UX-68): the cover offers drops on accessories only (targetRirLabel), and an unanswered offer releases after 20 s.
  'RIR_SPEED_CATEGORIES', 'RIR_NO_LABEL_CATEGORIES', 'RIR_NO_LABEL_NAME', 'COVER_DROP_RELEASE_MS'];
const ENGINE_FNS = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay', 'rirFromRpe', 'loadForRpeTarget',
  'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable',
  'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight', 'toCanonicalLb', 'trimUnitNum',
  'smallestLoadStep', 'capClinicalRpeLoad', 'loadStepFor', 'platesPerSide', 'targetRirLabel', 'getRepRangeTier'];
const UI_FNS = ['escapeHtml', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'setChipOwnerTag', 'commitSet',
  'setSheetWeightStep', 'openSetSheet', 'closeSetSheet', 'saveSetSheet', 'setSheetExercise', 'dropSetCue', 'suggestDropWeight',
  'setSheetAddDrop', 'refreshSetSheetDropBtn', 'writeDropsToRow', 'buildDropRowsHtml', 'recommendNextSet',
  'findNextSetRow', 'readSetLogger', 'logUpNext', 'setCoverAdjust', 'isBackdating',
  'startRestTimer', 'restRemainingSeconds', 'formatTimer',
  'coverDropKey', 'isCoverDropRow', 'renderCoverDrop', 'checkCoverDropStillValid', 'endCoverDrop', 'noteSetForCoverDrop', 'holdRestForDrop', 'logCoverDrop',
  'checkAllSetsCompleteAndAutoCheck', 'wireSetsBlock'];
const STATE = 'const setSheetState = {row:null, chip:null};';
if(!src.includes(STATE)) throw new Error('setSheetState not found');
const OFFER = (src.match(/^let coverDropOffer = null;$/m) || [])[0];
if(!OFFER) throw new Error('coverDropOffer declaration not found');
// The cover's two buttons, wired as index.html wires them (top-level lines, verbatim).
const BUTTONS = ["document.getElementById('coverDropLog').addEventListener('click', logCoverDrop);",
  "document.getElementById('coverDropSkip').addEventListener('click', ()=> endCoverDrop(true));",
  "new MutationObserver(checkCoverDropStillValid).observe(document.getElementById('exerciseList'), {childList: true, subtree: true});"];
BUTTONS.forEach(l => { if(src.split(l).length !== 2) throw new Error('not found once: ' + l); });
// The rest timer's own close handler (what dismissing a rest runs), verbatim.
const CLOSE = (()=>{ const a = "document.getElementById('restTimerClose').addEventListener('click', ()=>{"; const i = src.indexOf(a); const j = src.indexOf('\n});', i);
  if(i < 0 || j < 0 || src.indexOf(a, i + 1) !== -1) throw new Error('restTimerClose handler not found once'); return src.slice(i, j + 4); })();

// v3.672 (BL-84): the set sheet's Clear, as wireSetSheet wires it (verbatim).
const CLEAR = (()=>{ const a = "  document.getElementById('setSheetClearBtn').addEventListener('click', ()=>{"; const i = src.indexOf(a);
  if(i < 0 || src.indexOf(a, i + 1) !== -1) throw new Error('Clear handler not found once'); return src.slice(i, src.indexOf('\n  });', i) + 6); })();
if(!/^let restTimerFromRow = null;$/m.test(src)) throw new Error('restTimerFromRow declaration not found');
function setRow(exIdx, i, name, w, r, drop){
  return `<div class="set-row" data-set-idx="${i}" data-ex-idx="${exIdx}"><span class="set-row-owner">${name}</span>
    <input class="ex-input ex-weight" placeholder="lb" value="${w}"><input class="ex-input ex-reps" placeholder="reps" value="${r}"><input class="ex-input ex-rpe" value="">
    <span class="set-status"></span>${drop ? '<button class="set-drop-btn"></button><div class="set-drop-wrap"></div>' : ''}</div>`;
}
function block(exIdx, name, sets, logged, total, w, r, drop){
  const rows = []; for(let i = 0; i < total; i++) rows.push(setRow(exIdx, i, name, i < logged ? w : '', i < logged ? r : '', drop));
  return `<div class="exercise-block" id="b${exIdx}"><div class="set-chips"></div>
    <div class="exercise"><input type="checkbox" data-idx="${exIdx}"><div class="ex-name">${name}</div><div class="ex-sets"><span>${sets}</span></div></div>
    <div class="sets-block">${rows.join('')}<button class="add-set-btn">Add Set</button></div></div>`;
}
// Lateral Raise 3×12-15 at 45 lb with two sets logged (the drop control: renderWorkout's
// dropSetEligible said yes), then Face Pull with none logged (no drop control).
// v3.668 (UX-68): lift/liftSets swap the first lift (Bench Press, a compound);
// persist runs the real persistRestTimer / restoreRestTimer over an in-memory
// window.storage (store, shared across a "reload"); the clock is fake (__now),
// and timers of a second or more wait for __fireLong().
function mount({drop = true, date = '2026-11-24', weight = '45', logged = 2, faceTag = false, savedDrop = false,
    lift = 'Lateral Raise', liftSets = '3×12-15', persist = false, store = {}, now = 1764000000000} = {}){
  const body = extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'restTimer')
    + extractElementById(src, 'setSheetScrim') + extractElementById(src, 'setSheet')
    + `<div id="exerciseList">${block(0, lift, liftSets, logged, 3, weight, '12', drop)}${block(1, 'Face Pull', '3×15', 0, 3, '40', '15', false)}</div>`;
  const { window } = runJsdom(body, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', activeDay = 'd1', selectedLogDate = ${JSON.stringify(date)};
    var loadSuggestionMode = 'auto', equipmentProfile = null, restTargetBySlot = {}, SpeechRecognitionCtor = null;
    var REST_TIER_TIPS = {};
    let restTimerSeconds = 90, restTimerTotal = 90, restTimerInterval = null, restTimerEndsAt = null;
    window.requestAnimationFrame = fn => fn(); window.setInterval = () => 1; window.clearInterval = () => {};
    function getTodayKey(){ return '2026-11-24'; }
    function applyRestTimerCollapsedWidth(){} function applyRestTimerExpandHeight(){} function refreshRestNotifyControls(){}
    window.__now = ${now}; Date.now = () => window.__now;
    window.__long = []; const __setTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms) => { if(ms >= 1000){ window.__long.push(fn); return window.__long.length; } return __setTimeout(fn, ms); };
    window.__fireLong = () => { const l = window.__long.splice(0); l.forEach(f => f()); };
    window.__store = ${JSON.stringify(store)};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; }, delete: async k => { delete window.__store[k]; } };
    function updateRestTimerRing(){} ${persist ? '' : 'function persistRestTimer(){}'} function scheduleRestNotification(){} function cancelRestNotification(){} function tickRestTimer(){}
    window.__rests = [];
    function getDefaultRestSeconds(ex){ return ex.name === 'Lateral Raise' ? 75 : 60; }
    function getRestReasonLabel(ex){ return 'rest for ' + ex.name; }
    window.__sets = []; async function saveExSet(day, slot, setIdx, w, reps){ await null; window.__sets.push([slot, setIdx, w, reps]); return {isPR:false}; }
    window.__drops = []; async function saveExDropSet(day, slot, setIdx, dropIdx, w, reps){ await null; window.__drops.push({slot, setIdx, dropIdx, weight: w, reps}); }
    function exKey(p, d, s){ return 'ex:' + p + ':' + d + ':' + s; } function slotIdOf(ex, i){ return i; } function subVariantOf(){ return undefined; }
    function isDistanceExercise(){ return false; } function getFallbackPriorEntry(){ return null; } async function renderWorkout(){} async function refreshSessionSummary(){}
    function icon(){ return ''; } window.__toasts = []; function showUndoToast(m, fn){ window.__toasts.push(m); window.__undo = fn; } function closeFinishSheet(){} function renderAllSetChips(){} function renderUpNext(){} function setExerciseBlockOpen(){}
    async function isPastPrNotificationWindow(){ return false; } function triggerCelebration(){} function toCanonicalMetres(v){ return Number(v); }
    function fmtWeight(v){ return v + ' lb'; } async function saveExWarmupSkipped(){} function wirePlateButton(){} function wireVoiceLogButton(){}
    function calcPlatesPerSide(){ return null; } function formatPlateResult(){ return ''; } function analyzeProgressionSignal(){ return null; }
    function buildPastSessions(){ return []; } async function getExLog(){ return []; } function makeSwipeable(){} function noteWorkoutActivity(){}
    function firstSetHint(){ return ''; } function deleteSet(){}
  `, [...ENGINE_CONSTS.map(n => extractConst(src, n)), ...ENGINE_FNS.map(n => extractFunction(src, n)), STATE, OFFER,
    ...(persist ? [extractConst(src, 'REST_TIMER_STATE_KEY'), extractFunction(src, 'persistRestTimer'), extractFunction(src, 'restoreRestTimer')] : []),
    ...UI_FNS.map(n => extractFunction(src, n)), ...BUTTONS, CLOSE, CLEAR, 'let restTimerFromRow = null;', `
    // The real ends of startRestTimer write the cover's rest state; record each start.
    const __start = startRestTimer; startRestTimer = (s, l, at) => { window.__rests.push([s, l]); __start(s, l, at); };
    wireSetsBlock(document.getElementById('b0'), 0, {name:${JSON.stringify(lift)}, sets:${JSON.stringify(liftSets)}});
    window.__restore = typeof restoreRestTimer === 'function' ? restoreRestTimer : null;
    wireSetsBlock(document.getElementById('b1'), 1, {name:'Face Pull', sets:'3×15'${faceTag ? ", superTag:'Superset with next'" : ''}});
    window.__state = () => ({offer: coverDropOffer, endsAt: restTimerEndsAt, from: restTimerFromRow});
    window.__logCoverDrop = logCoverDrop; window.__endCoverDrop = endCoverDrop; window.__logUpNext = logUpNext; window.__saveSetSheet = saveSetSheet; window.__closeSetSheet = closeSetSheet;
    window.__setDate = d => { selectedLogDate = d; };
    window.__startRest = (s, l) => startRestTimer(s, l);
    window.__setDay = d => { activeDay = d; };`]);
  if(savedDrop){
    // A drop already typed on the last set's row (its own Drop set control).
    window.document.querySelector('#b0 .set-row[data-set-idx="2"] .set-drop-btn').click();
  }
  const $ = id => window.document.getElementById(id);
  // The cover's own fields, as the person leaves them for the next set.
  const logOnCover = (w, r) => { $('upNextWeight').value = w; $('upNextReps').value = r; return window.__logUpNext(); };
  const line = () => $('coverDrop').hidden ? null : `${$('coverDropWhat').textContent} | ${$('coverDropCue').textContent}`;
  const flush = async () => { for(let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
  const rests = () => JSON.parse(JSON.stringify(window.__rests));
  return { window, $, logOnCover, line, flush, rests, state: () => window.__state() };
}


const rowOf = (ui, i) => ui.window.document.querySelector(`#b0 .set-row[data-set-idx="${i}"]`);
// Set 1's sheet, reps changed, saved: the lifter's edit.
const editSet1 = async (ui, reps) => {
  ui.window.openSetSheet(rowOf(ui, 0), null);
  ui.$('setSheetReps').value = reps;
  ui.window.__saveSetSheet(); await ui.flush();
};

test('criterion 2: editing a logged set\'s reps through its sheet: no rest starts (null stays null), and the toast says "Updated"', async (assert)=>{
  const ui = mount({drop: false});
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-reps').value, '12', 'anchor: set 1 logged at 45 × 12');
  await editSet1(ui, '11');
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-reps').value, '11', 'the edit landed');
  assert.ok(ui.window.__sets.some(s => s[1] === 0 && s[3] === '11'), 'and was saved');
  assert.strictEqual(ui.state().endsAt, null, 'no rest');
  assert.deepStrictEqual(ui.rests(), []);
  assert.match(ui.window.__toasts[0], /^Updated Lateral Raise 45×11$/);
});

test('criterion 2: a running rest keeps its end when a logged set is edited', async (assert)=>{
  const ui = mount({drop: false});
  ui.logOnCover('45', '12'); await ui.flush(); // set 3: its rest starts
  const end = ui.state().endsAt;
  assert.ok(end > 0, 'anchor: a rest is running');
  assert.strictEqual(ui.rests().length, 1, 'one start for a logged set');
  ui.window.__now += 30000;
  await editSet1(ui, '10');
  assert.strictEqual(ui.state().endsAt, end, 'the same end');
  assert.strictEqual(ui.rests().length, 1, 'not restarted');
  assert.match(ui.window.__toasts[ui.window.__toasts.length - 1], /^Updated /);
});

test('criterion 3: Clear on the set that started the running rest stops it; Clear on another set leaves it', async (assert)=>{
  const ui = mount({drop: false});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.state().endsAt > 0 && ui.state().from === rowOf(ui, 2), 'anchor: set 3 started the rest');
  ui.window.openSetSheet(rowOf(ui, 0), null); ui.$('setSheetClearBtn').click(); await ui.flush();
  assert.strictEqual(rowOf(ui, 0).querySelector('.ex-reps').value, '', 'set 1 cleared');
  assert.ok(ui.state().endsAt > 0, 'another set cleared: the rest keeps going');
  assert.match(ui.window.__toasts[ui.window.__toasts.length - 1], /^Cleared Lateral Raise set 1$/);
  ui.window.openSetSheet(rowOf(ui, 2), null); ui.$('setSheetClearBtn').click(); await ui.flush();
  assert.strictEqual(ui.state().endsAt, null, 'its own set cleared: no rest running');
  assert.strictEqual(ui.window.document.getElementById('restTimer').classList.contains('active'), false);
});

test('criterion 4: a new set still starts its rest, once; logging it again after Undo starts it again', async (assert)=>{
  const ui = mount({drop: false});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.deepStrictEqual(ui.rests(), [[75, 'rest for Lateral Raise']], 'one start');
  assert.match(ui.window.__toasts[0], /^Logged Lateral Raise 45×12$/);
  ui.window.__undo(); await ui.flush();
  assert.strictEqual(ui.state().endsAt, null, 'Undo of the set that started the rest stops it');
  ui.logOnCover('45', '12'); await ui.flush();
  assert.strictEqual(ui.rests().length, 2, 'logged again: a rest again');
});

test('a set typed in the row, reps before weight: its rest starts when the weight completes it', async (assert)=>{
  const ui = mount({drop: false});
  const r = rowOf(ui, 2);
  r.querySelector('.ex-reps').value = '12'; r.querySelector('.ex-reps').dispatchEvent(new ui.window.Event('change', {bubbles: true})); await ui.flush();
  assert.deepStrictEqual(ui.rests(), [], 'reps alone on a weighted lift: not a set yet');
  r.querySelector('.ex-weight').value = '45'; r.querySelector('.ex-weight').dispatchEvent(new ui.window.Event('change', {bubbles: true})); await ui.flush();
  assert.deepStrictEqual(ui.rests(), [[75, 'rest for Lateral Raise']]);
});

// Criterion 1 (B5): the cover keeps what was typed through a redraw of the same set.
const COVER_FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'setChipOwnerTag',
  'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips', 'trimUnitNum', 'parseTopRep', 'parseBottomRep',
  'recommendNextSet', 'setSheetWeightStep', 'loadStepFor', 'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine',
  'syncStickyDayTitle', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue',
  'isBodyweightLoadable', 'readSetLogger', 'logUpNext', 'setCoverAdjust'].map(n => extractFunction(src, n));
const firstTime = () => `<div class="exercise-block" data-first-time="1"><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">Squat</div><div class="ex-sets"><span>3×5</span></div></div>
  <div class="set-chips"></div><div class="sets-block">${[0, 1, 2].map(i => `<div class="set-row" data-set-idx="${i}" data-ex-idx="0"><span class="set-row-owner">Squat</span><input class="ex-input ex-weight" placeholder="lb" value=""><input class="ex-input ex-reps" placeholder="reps" value=""><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`).join('')}</div></div>`;
function cover(){
  const { window } = runJsdom(extractElementById(src, 'upNext').replace(' hidden>', '>') + `<div id="exerciseList" data-workout="strength|d2|2026-11-26">${firstTime()}</div>`, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', exerciseDetailPinned = true, equipmentProfile = null;
    function getEquipment(){ return {bar:45, plates:[45,25,10,5,2.5], dbIncrement:5}; } function isBarbellExercise(){ return true; } function isDumbbellExercise(){ return false; }
    function icon(){ return ''; } function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; } function showUndoToast(){}`,
    [...COVER_FNS, `window.__commits = []; const __c = commitSet; commitSet = function(row, v){ window.__commits.push(JSON.parse(JSON.stringify(v))); return __c.apply(this, arguments); };
      renderAllSetChips(); renderUpNext();`]);
  const $ = id => window.document.getElementById(id);
  const type = (id, v) => { $(id).value = v; $(id).dispatchEvent(new window.Event('input', {bubbles: true})); };
  // What renderWorkout does on a warm-up's Done: the list drawn again, the same workout.
  const redraw = (workout = 'strength|d2|2026-11-26') => { $('exerciseList').dataset.workout = workout; $('exerciseList').innerHTML = firstTime(); window.renderAllSetChips(); window.renderUpNext(); };
  return { window, $, type, redraw };
}

test('criterion 1 (B5): a first-time lift, 95 and 6 typed, then the list redrawn (a warm-up\'s Done): the cover keeps 95 × 6 and Log commits it', (assert)=>{
  const ui = cover();
  assert.strictEqual(ui.$('upNextReps').value, '', 'anchor: nothing to suggest');
  ui.type('upNextWeight', '95'); ui.type('upNextReps', '6');
  ui.redraw();
  assert.strictEqual(ui.$('upNextWeight').value, '95');
  assert.strictEqual(ui.$('upNextReps').value, '6');
  ui.window.logUpNext();
  assert.strictEqual(ui.window.__commits.length, 1);
  assert.strictEqual(ui.window.__commits[0].weight, '95');
  assert.strictEqual(ui.window.__commits[0].reps, '6');
});

test('criterion 1: another day or date at the same place, or the next set, fills afresh (the typed values don\'t follow)', (assert)=>{
  const ui = cover();
  ui.type('upNextWeight', '95'); ui.type('upNextReps', '6');
  ui.redraw('strength|d3|2026-11-26');
  assert.strictEqual(ui.$('upNextReps').value, '', 'another day');
  const two = cover();
  two.type('upNextWeight', '95'); two.type('upNextReps', '6');
  two.window.logUpNext();
  assert.strictEqual(two.$('upNextLabel').textContent, 'Set 2 of 3', 'anchor: moved on');
  two.type('upNextReps', '4');
  two.redraw('strength|d2|2026-11-25');
  assert.strictEqual(two.$('upNextReps').value, '', 'another date');
});

run();
