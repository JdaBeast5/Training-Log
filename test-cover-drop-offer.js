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
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-drop-offer.js');
const src = readIndexSource();

const ENGINE_CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES',
  'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'exerciseInfo',
  'RIR_TARGETS', 'COMPOUND_CATEGORIES', 'DROP_SET_MAX'];
const ENGINE_FNS = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay', 'rirFromRpe', 'loadForRpeTarget',
  'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable',
  'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight', 'toCanonicalLb', 'trimUnitNum',
  'smallestLoadStep', 'capClinicalRpeLoad', 'loadStepFor', 'platesPerSide'];
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
function mount({drop = true, date = '2026-11-24', weight = '45', logged = 2, faceTag = false, savedDrop = false} = {}){
  const body = extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'restTimer')
    + extractElementById(src, 'setSheetScrim') + extractElementById(src, 'setSheet')
    + `<div id="exerciseList">${block(0, 'Lateral Raise', '3×12-15', logged, 3, weight, '12', drop)}${block(1, 'Face Pull', '3×15', 0, 3, '40', '15', false)}</div>`;
  const { window } = runJsdom(body, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', activeDay = 'd1', selectedLogDate = ${JSON.stringify(date)};
    var loadSuggestionMode = 'auto', equipmentProfile = null, restTargetBySlot = {}, SpeechRecognitionCtor = null;
    var REST_TIER_TIPS = {};
    let restTimerSeconds = 90, restTimerTotal = 90, restTimerInterval = null, restTimerEndsAt = null;
    window.requestAnimationFrame = fn => fn(); window.setInterval = () => 1; window.clearInterval = () => {};
    function getTodayKey(){ return '2026-11-24'; }
    function applyRestTimerCollapsedWidth(){} function applyRestTimerExpandHeight(){} function refreshRestNotifyControls(){}
    function updateRestTimerRing(){} function persistRestTimer(){} function scheduleRestNotification(){} function cancelRestNotification(){} function tickRestTimer(){}
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
  `, [...ENGINE_CONSTS.map(n => extractConst(src, n)), ...ENGINE_FNS.map(n => extractFunction(src, n)), STATE, OFFER,
    ...UI_FNS.map(n => extractFunction(src, n)), ...BUTTONS, CLOSE, `
    // The real ends of startRestTimer write the cover's rest state; record each start.
    const __start = startRestTimer; startRestTimer = (s, l) => { window.__rests.push([s, l]); __start(s, l); };
    wireSetsBlock(document.getElementById('b0'), 0, {name:'Lateral Raise', sets:'3×12-15'});
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

test('criterion 1: logging Lateral Raise\'s last set on the cover shows "Drop set · 35 lb" (the real suggestDropWeight), and no rest starts', async (assert)=>{
  const ui = mount();
  assert.strictEqual(ui.logOnCover('45', '12'), true, 'anchor: the cover logged set 3');
  await ui.flush();
  assert.ok(ui.window.__sets.some(s => s[0] === 0 && s[1] === 2 && s[3] === '12'), 'anchor: set 3 saved');
  assert.strictEqual(ui.line(), 'Drop set · 35 lb | Lateral Raise · 25% lighter, no rest · Stop 0–2 reps short');
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

test('criterion 3: Log opens set 3\'s sheet with drop 1 at 35; Save writes it through saveExDropSet (set 3, drop 1, 35 lb) and then the rest starts', async (assert)=>{
  const ui = mount();
  ui.logOnCover('45', '12'); await ui.flush();
  ui.$('coverDropLog').click();
  assert.strictEqual(ui.$('setSheet').hidden, false, 'the sheet is open');
  assert.strictEqual(ui.$('setSheetTitle').textContent, 'Lateral Raise · Set 3');
  const lines = ui.window.document.querySelectorAll('#setSheetDrops .set-sheet-drop');
  assert.strictEqual(lines.length, 1);
  assert.strictEqual(lines[0].querySelector('.set-sheet-drop-weight').value, '35');
  assert.strictEqual(ui.window.document.activeElement, lines[0].querySelector('.set-sheet-drop-reps'), 'reps are the result: typed here');
  assert.strictEqual(ui.line(), null, 'the line goes while the sheet is open');
  assert.deepStrictEqual(ui.rests(), [], 'still held while the sheet is open');
  lines[0].querySelector('.set-sheet-drop-reps').value = '10';
  assert.strictEqual(ui.window.__saveSetSheet(), true);
  await ui.flush();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__drops)), [{slot: 0, setIdx: 2, dropIdx: 0, weight: 35, reps: '10'}]);
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

test('REAL source: the cover markup puts the drop line just above the warm-up line, and the CSS hides the warm-up line while it shows', (assert)=>{
  const at = src.indexOf('id="coverDrop"');
  assert.ok(at > 0 && at < src.indexOf('id="coverWarmup"') && src.indexOf('id="coverWarmup"') < src.indexOf('class="cover-log"'));
  assert.match(src, /\.cover-drop:not\(\[hidden\]\) ~ \.cover-warmup\{display:none;\}|\.cover-drop:not\(\[hidden\]\) ~ \.cover-warmup[,{]/);
  assert.strictEqual((src.match(/noteSetForCoverDrop\(block, setRow, ex, \{seconds: restTarget, label: restLabel\}\);/g) || []).length, 1, 'one call in the row save');
  assert.strictEqual((src.match(/if\(!holdRestForDrop\(setRow, /g) || []).length, 1, 'one hold at the rest start');
});

run();
