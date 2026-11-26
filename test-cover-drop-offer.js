'use strict';
// v3.658 (UX-64, owner C 2026-11-24): a drop set offered on the cover right
// after a lift's last working set, with that set's rest held for it.
//  - Logging the last set of a drop-eligible lift (its row has the drop
//    control) shows one line above Log: "Drop set · 35 lb", with the lift and
//    the cue, Log and Not now. Its rest doesn't start.
//  - Not now: the line goes and the held rest starts (the lift's own seconds).
//  - Log: the set's sheet opens with drop 1 filled in; Save writes it through
//    the row's drop rows (saveExDropSet), and the rest starts as the sheet closes.
//  - Logging any other set: the line goes and the held rest starts.
//  - No line on a set that isn't the last, a lift without the drop control,
//    a backdated day, or when nothing lighter is loadable.
//
// Real invocations: the whole wireSetsBlock (its save, the hooks, the row's
// drop rows), checkAllSetsCompleteAndAutoCheck, logUpNext / commitSet /
// writeSetToRow over the real cover markup, the real startRestTimer over the
// real rest-timer markup, the real engine (computeSuggestedSet through
// suggestDropWeight, with the real exercise library and equipment), and the
// real set sheet (openSetSheet, setSheetAddDrop, saveSetSheet, closeSetSheet,
// writeDropsToRow). Stubbed at the boundary: saveExSet and saveExDropSet
// (recorded), the rest seconds and reason, the rest timer's interval.
//
// Sabotage (each run and seen failing): start the rest timer unconditionally
// (no hold): criterion 1 fails; offer on any set, not only the last: criterion
// 5; end the offer without starting the held rest: criteria 2-4. Review fixes:
// don't dismiss a running rest, start the held rest before a superset lead-in,
// drop the workout key from the validity check, offer on a set that already has
// a drop: each fails its own test.
//
// v3.668 (UX-68, amends UX-64): the cover offers drops on accessories only
// (targetRirLabel === RIR_TARGETS.isolation; a 4×4-6 Bench gets none); an
// offer left unanswered for 20 s ends and starts its rest counted from the set;
// the held rest is stored in the rest timer's own key ({held, seconds, label,
// heldAt}) and restoreRestTimer starts it after a reload. Sabotage (each run
// and seen failing): no isolation check, no release timer, the release not
// counted from the set, the held rest not stored, restore ignoring it.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-drop-offer.js');
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

// v3.676 (UX-69): realCover loads the real cover renderer over the stubs (declared later, so it wins).
const COVER_FNS = ['renderUpNext', 'renderAllSetChips', 'renderSetChips', 'renderExerciseLogger', 'renderWarmupChips', 'renderCoverWarmup', 'pendingWarmupChip',
  'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger',
  'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable', 'readSetLogger', 'escapeHtml'];
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
    lift = 'Lateral Raise', liftSets = '3×12-15', persist = false, store = {}, now = 1764000000000, realCover = false} = {}){
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
    function icon(){ return ''; } function showUndoToast(){} function renderAllSetChips(){} function renderUpNext(){} function setExerciseBlockOpen(){}
    async function isPastPrNotificationWindow(){ return false; } function triggerCelebration(){} function toCanonicalMetres(v){ return Number(v); }
    function fmtWeight(v){ return v + ' lb'; } async function saveExWarmupSkipped(){} function wirePlateButton(){} function wireVoiceLogButton(){}
    function calcPlatesPerSide(){ return null; } function formatPlateResult(){ return ''; } function analyzeProgressionSignal(){ return null; }
    function buildPastSessions(){ return []; } async function getExLog(){ return []; } function makeSwipeable(){} function noteWorkoutActivity(){}
    function firstSetHint(){ return ''; } function deleteSet(){}
    function renderCoverBar(){} function renderExerciseDetailBar(){} var exerciseDetailPinned = true; /* v3.676 (UX-69): realCover */
  `, [...ENGINE_CONSTS.map(n => extractConst(src, n)), ...ENGINE_FNS.map(n => extractFunction(src, n)), STATE, OFFER,
    ...(persist ? [extractConst(src, 'REST_TIMER_STATE_KEY'), extractFunction(src, 'persistRestTimer'), extractFunction(src, 'restoreRestTimer')] : []),
    ...UI_FNS.map(n => extractFunction(src, n)), ...(realCover ? COVER_FNS.map(n => extractFunction(src, n)) : []), ...BUTTONS, CLOSE, `
    // The real ends of startRestTimer write the cover's rest state; record each start.
    const __start = startRestTimer; startRestTimer = (s, l, at) => { window.__rests.push([s, l]); __start(s, l, at); };
    wireSetsBlock(document.getElementById('b0'), 0, {name:${JSON.stringify(lift)}, sets:${JSON.stringify(liftSets)}});
    window.__restore = typeof restoreRestTimer === 'function' ? restoreRestTimer : null;
    wireSetsBlock(document.getElementById('b1'), 1, {name:'Face Pull', sets:'3×15'${faceTag ? ", superTag:'Superset with next'" : ''}});
    window.__state = () => ({offer: coverDropOffer, endsAt: restTimerEndsAt});
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

test('criterion 1: logging Lateral Raise\'s last set on the cover shows "Drop set · 30 lb" (the real suggestDropWeight), and no rest starts', async (assert)=>{
  // Re-pinned v3.673 (BL-85, B7): 45 × 0.75 = 33.75 is floored to 30 (at least 25% lighter), not rounded to 35.
  const ui = mount();
  assert.strictEqual(ui.logOnCover('45', '12'), true, 'anchor: the cover logged set 3');
  await ui.flush();
  assert.ok(ui.window.__sets.some(s => s[0] === 0 && s[1] === 2 && s[3] === '12'), 'anchor: set 3 saved');
  assert.strictEqual(ui.line(), 'Drop set · 30 lb | Lateral Raise · 25% lighter, no rest · Stop 0–2 reps short');
  assert.strictEqual(ui.state().endsAt, null, 'restTimerEndsAt stays null');
  assert.deepStrictEqual(ui.rests(), []);
  assert.strictEqual(ui.window.document.querySelectorAll('#upNext .cover-drop:not([hidden])').length, 1, 'one .cover-drop, shown');
});

test('criterion 2: Not now: the line goes and the rest starts with the lift\'s own seconds and reason', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.line(), 'anchor: offered');
  ui.$('coverDropSkip').click();
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests(), [[75, 'rest for Lateral Raise']]);
  assert.ok(ui.state().endsAt > 0, 'the real timer is running');
  assert.strictEqual(ui.state().offer, null);
});

test('criterion 3: Log opens set 3\'s sheet with drop 1 at 30; Save writes it through saveExDropSet (set 3, drop 1, 30 lb) and then the rest starts', async (assert)=>{
  // Re-pinned v3.673 (BL-85): 30, was 35.
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  ui.$('coverDropLog').click();
  assert.strictEqual(ui.$('setSheet').hidden, false, 'the sheet is open');
  assert.strictEqual(ui.$('setSheetTitle').textContent, 'Lateral Raise · Set 3');
  const lines = ui.window.document.querySelectorAll('#setSheetDrops .set-sheet-drop');
  assert.strictEqual(lines.length, 1);
  assert.strictEqual(lines[0].querySelector('.set-sheet-drop-weight').value, '30');
  assert.strictEqual(ui.window.document.activeElement, lines[0].querySelector('.set-sheet-drop-reps'), 'reps are the result: typed here');
  assert.strictEqual(ui.line(), null, 'the line goes while the sheet is open');
  assert.deepStrictEqual(ui.rests(), [], 'still held while the sheet is open');
  lines[0].querySelector('.set-sheet-drop-reps').value = '10';
  assert.strictEqual(ui.window.__saveSetSheet(), true);
  await ui.flush();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__drops)), [{slot: 0, setIdx: 2, dropIdx: 0, weight: 30, reps: '10'}]);
  assert.ok(ui.rests().length >= 1 && ui.rests().every(r => r[0] === 75 && r[1] === 'rest for Lateral Raise'), 'the rest starts, with the lift\'s seconds: ' + JSON.stringify(ui.rests()));
  assert.strictEqual(ui.state().offer, null);
  assert.strictEqual(ui.line(), null, 'and no second offer for the same set');
});

test('criterion 3: closing the sheet without saving still starts the held rest, and saves no drop', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  ui.$('coverDropLog').click();
  ui.window.__closeSetSheet();
  await ui.flush();
  assert.deepStrictEqual(ui.rests(), [[75, 'rest for Lateral Raise']]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__drops)), []);
});

test('criterion 4: logging another set while the line shows: it goes, and the held rest starts (then that set\'s own)', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.line(), 'anchor: offered');
  assert.strictEqual(ui.logOnCover('40', '15'), true, 'anchor: the cover moves on to Face Pull set 1');
  await ui.flush();
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests()[0], [75, 'rest for Lateral Raise'], 'the held rest first');
  assert.deepStrictEqual(ui.rests()[ui.rests().length - 1], [60, 'rest for Face Pull'], 'then Face Pull\'s own');
});

test('criterion 5: no line on a set that isn\'t the last (and its rest starts as before)', async (assert)=>{
  const ui = mount({logged: 1});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.window.__sets.some(s => s[1] === 1 && s[3] === '12'), 'anchor: set 2 saved');
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests()[0], [75, 'rest for Lateral Raise']);
});

test('criterion 5: no line on a lift without the drop control (renderWorkout\'s dropSetEligible said no)', async (assert)=>{
  const ui = mount({drop: false});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests()[0], [75, 'rest for Lateral Raise']);
});

test('criterion 5: no line when backdating (and no rest, as before)', async (assert)=>{
  const ui = mount({date: '2026-11-20'});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.window.__sets.some(s => s[1] === 2), 'anchor: set 3 saved');
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests(), []);
});

test('criterion 5: no line when nothing lighter is loadable (a 5 lb dumbbell), and the rest starts', async (assert)=>{
  const ui = mount({weight: '5'});
  ui.logOnCover('5', '12'); await ui.flush();
  assert.ok(ui.window.__sets.some(s => s[1] === 2), 'anchor: set 3 saved');
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests()[0], [75, 'rest for Lateral Raise']);
});

test('Undo of the offered set ends the offer, with no rest', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  const reps = ui.window.document.querySelector('#b0 .set-row[data-set-idx="2"] .ex-reps');
  reps.value = ''; reps.dispatchEvent(new ui.window.Event('change', {bubbles: true}));
  await ui.flush();
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests(), []);
});

test('a rest started any other way ends the offer (the real startRestTimer)', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  ui.window.__startRest(30, 'manual');
  assert.strictEqual(ui.line(), null);
  assert.strictEqual(ui.state().offer, null);
  assert.deepStrictEqual(ui.rests(), [[30, 'manual']]);
});

test('review fix: a rest still running from the set before is dismissed when the drop is offered, so the line shows', async (assert)=>{
  const ui = mount({logged: 1});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.state().endsAt > 0, 'anchor: set 2\'s rest is running');
  ui.logOnCover('45', '12'); await ui.flush();
  assert.strictEqual(ui.state().endsAt, null, 'the running rest was dismissed (its own close handler)');
  assert.ok(ui.line(), 'the line shows');
  ui.$('coverDropSkip').click();
  assert.deepStrictEqual(ui.rests()[ui.rests().length - 1], [75, 'rest for Lateral Raise'], 'Not now starts the held rest');
});

test('review fix: the next set being a superset\'s lead-in ends the offer without starting the held rest', async (assert)=>{
  const ui = mount({faceTag: true});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.line(), 'anchor: offered');
  ui.logOnCover('40', '15'); await ui.flush();
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests(), [], 'no rest between a superset\'s lifts');
});

test('review fix: an offer from another day never matches that day\'s set of the same place, and ends when the list re-renders', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.line(), 'anchor: offered');
  ui.window.__setDay('d2');
  // Another day's list, rendered in place (the same places, nothing logged).
  const list = ui.$('exerciseList');
  list.innerHTML = list.innerHTML;
  // That day has the same place logged too, so only the workout key tells them apart.
  ui.window.document.querySelector('#b0 .set-row[data-set-idx="2"] .ex-reps').value = '12';
  await ui.flush();
  assert.strictEqual(ui.line(), null, 'the stale line goes');
  assert.strictEqual(ui.state().offer, null);
  assert.deepStrictEqual(ui.rests(), []);
});

test('review fix: deleting the offered set (rows renumbered) ends the offer', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  const rows = ui.window.document.querySelectorAll('#b0 .set-row');
  rows[0].remove(); rows[1].dataset.setIdx = '0'; rows[2].dataset.setIdx = '1'; await ui.flush();
  assert.strictEqual(ui.line(), null);
  assert.strictEqual(ui.state().offer, null);
});

test('review fix: no offer for a set that already has a drop', async (assert)=>{
  const ui = mount({savedDrop: true});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.strictEqual(ui.line(), null);
  assert.deepStrictEqual(ui.rests()[0], [75, 'rest for Lateral Raise']);
});

// v3.668 (UX-68): accessories only; an unanswered offer releases its rest; a reload keeps it.
test('UX-68 criterion 1: Bench Press 4×4-6 (a compound, with the drop control): its last set offers no drop and the rest starts at once; Lateral Raise still offers', async (assert)=>{
  const bench = mount({lift: 'Bench Press', liftSets: '4×4-6', weight: '185', logged: 2});
  assert.ok(bench.window.document.querySelector('#b0 .set-row[data-set-idx="2"] .set-drop-btn'), 'anchor: the row has the drop control (the set sheet keeps it)');
  bench.logOnCover('185', '5'); await bench.flush();
  assert.ok(bench.window.__sets.some(s => s[0] === 0 && s[1] === 2), 'anchor: set 3 saved');
  assert.strictEqual(bench.line(), null, 'no .cover-drop');
  assert.strictEqual(bench.state().offer, null);
  assert.ok(bench.rests().length >= 1 && bench.rests().every(r => r[0] === 60 && r[1] === 'rest for Bench Press'), 'the rest starts at once: ' + JSON.stringify(bench.rests()));
  assert.ok(bench.state().endsAt > 0);
  const raise = mount();
  raise.logOnCover('45', '12'); await raise.flush();
  assert.ok(raise.line(), 'Lateral Raise: the offer shows (UX-64 criterion 1)');
});

test('UX-68 criterion 2: no answer for 20 s: the offer goes, and the rest ends at the set\'s time + its seconds', async (assert)=>{
  const T0 = 1764000000000;
  const ui = mount({now: T0});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.line(), 'anchor: offered');
  ui.window.__now = T0 + 20000;
  ui.window.__fireLong();
  assert.strictEqual(ui.line(), null, 'the offer went');
  assert.strictEqual(ui.state().offer, null);
  assert.strictEqual(ui.state().endsAt, T0 + 75 * 1000, 'counted from the set');
  assert.deepStrictEqual(ui.rests(), [[75, 'rest for Lateral Raise']]);
});

test('UX-68: an answered offer cancels its release (Not now starts the rest once; the timer firing later does nothing)', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  ui.$('coverDropSkip').click();
  ui.window.__fireLong();
  assert.deepStrictEqual(ui.rests(), [[75, 'rest for Lateral Raise']]);
});

test('UX-68 criterion 3: a reload during the offer: the held rest is stored, and the reloaded page starts it, ending at the set\'s time + its seconds', async (assert)=>{
  const T0 = 1764000000000;
  const ui = mount({persist: true, now: T0});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok(ui.line(), 'anchor: offered');
  const stored = JSON.parse(ui.window.__store['rest-timer-state']);
  assert.deepStrictEqual(stored, {held: true, seconds: 75, label: 'rest for Lateral Raise', heldAt: T0});
  // The page script runs again, 5 s later, from the same storage.
  const again = mount({persist: true, now: T0 + 5000, store: JSON.parse(JSON.stringify(ui.window.__store))});
  assert.strictEqual(again.state().endsAt, null, 'anchor: nothing running before the restore');
  await again.window.__restore(); await again.flush();
  assert.strictEqual(again.state().endsAt, T0 + 75 * 1000, 'a rest is running, ending at set time + 75 s');
  assert.strictEqual(again.line(), null, 'the offer itself isn\'t restored');
  assert.strictEqual(JSON.parse(again.window.__store['rest-timer-state']).endsAt, T0 + 75 * 1000, 'stored as a running rest from then on');
});

test('UX-68: a held rest already over by the reload is dropped; Undo of the offered set removes it from storage', async (assert)=>{
  const T0 = 1764000000000;
  const late = mount({persist: true, now: T0 + 90000, store: {'rest-timer-state': JSON.stringify({held: true, seconds: 75, label: 'x', heldAt: T0})}});
  await late.window.__restore();
  assert.strictEqual(late.state().endsAt, null);
  assert.ok(!('rest-timer-state' in late.window.__store));
  const ui = mount({persist: true, now: T0});
  ui.logOnCover('45', '12'); await ui.flush();
  assert.ok('rest-timer-state' in ui.window.__store, 'anchor: stored');
  ui.window.__endCoverDrop(false);
  await ui.flush();
  assert.ok(!('rest-timer-state' in ui.window.__store), 'an offer ended with no rest leaves nothing to restore');
});

// v3.676 (UX-69, owner B): the cover holds the finished lift while its drop is offered.
const coverView = ui => ({lift: ui.$('upNextLift').textContent, label: ui.$('upNextLabel').textContent, numeral: ui.$('upNextNumeral').textContent,
  offer: ui.$('upNext').classList.contains('is-drop-offer')});
test('UX-69: while the drop is offered the cover shows the finished lift, "Drop set" and the drop\'s weight, with Log set hidden; Not now moves it on', async (assert)=>{
  const ui = mount({realCover: true});
  ui.window.renderUpNext();
  assert.strictEqual(ui.$('upNextLift').textContent, 'Lateral Raise', 'anchor: set 3 is next');
  ui.logOnCover('45', '12'); await ui.flush(); ui.window.renderUpNext();
  assert.ok(ui.line(), 'anchor: offered');
  assert.deepStrictEqual(coverView(ui), {lift: 'Lateral Raise', label: 'Drop set', numeral: '30lb', offer: true});
  ui.$('coverDropSkip').click();
  const after = coverView(ui);
  assert.deepStrictEqual([after.lift, after.label, after.offer], ['Face Pull', 'Set 1 of 3', false], 'the next lift, Log set back');
  assert.notStrictEqual(after.numeral, '30lb', 'its own numeral, not the drop\'s');
});

test('UX-69: the 20 s release and Log drop also move the cover on', async (assert)=>{
  const rel = mount({realCover: true});
  rel.logOnCover('45', '12'); await rel.flush(); rel.window.renderUpNext();
  assert.ok(coverView(rel).offer, 'anchor');
  rel.window.__fireLong();
  assert.strictEqual(coverView(rel).lift, 'Face Pull');
  assert.strictEqual(coverView(rel).offer, false);
  const log = mount({realCover: true});
  log.logOnCover('45', '12'); await log.flush(); log.window.renderUpNext();
  log.$('coverDropLog').click();
  assert.strictEqual(coverView(log).lift, 'Face Pull', 'the sheet takes the drop; the cover moves on');
  assert.strictEqual(coverView(log).offer, false);
});

test('UX-69 (CSSOM): the drop-offer cover hides the Log row and the next lift\'s lines', (assert)=>{
  for(const sel of ['.cover.is-drop-offer .cover-log', '.cover.is-drop-offer .cover-rx', '.cover.is-drop-offer .cover-chips', '.cover.is-drop-offer .cover-bar'])
    assert.ok(new RegExp(sel.replace(/\./g, '\\.').replace(/ /g, '\\s+') + '[^{]*\\{display:none;?\\}').test(src) || src.includes(sel), sel);
});

test('REAL source: the cover markup puts the drop line just above the warm-up line, and the CSS hides the warm-up line while it shows', (assert)=>{
  const at = src.indexOf('id="coverDrop"');
  assert.ok(at > 0 && at < src.indexOf('id="coverWarmup"') && src.indexOf('id="coverWarmup"') < src.indexOf('class="cover-log"'));
  assert.match(src, /\.cover-drop:not\(\[hidden\]\) ~ \.cover-warmup\{display:none;\}|\.cover-drop:not\(\[hidden\]\) ~ \.cover-warmup[,{]/);
  assert.strictEqual((src.match(/noteSetForCoverDrop\(block, setRow, ex, \{seconds: restTarget, label: restLabel\}\);/g) || []).length, 1, 'one call in the row save');
  assert.strictEqual((src.match(/if\(!holdRestForDrop\(setRow, /g) || []).length, 1, 'one hold at the rest start');
});

run();
