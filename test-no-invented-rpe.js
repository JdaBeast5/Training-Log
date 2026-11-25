'use strict';
// v3.666 (BL-83, the usability test's Friction #1; owner 2026-11-25: "if I
// don't enter an RPE, Log set stores none and the weight doesn't go up for the
// next set; if I enter one, the weight can go up whenever it justifies it,
// with no limit per session"). One-tap Log saved an RPE nobody entered (last
// session's 8, echoed set to set), and the set-to-set call raised the weight
// on it: Lateral Raise went 25 → 45 lb in one session.
//  - fillSetLogger never fills the RPE tile; last session's RPE is ghost text.
//  - recommendNextSet: at the top of the range with no RPE, stay, and ask for
//    the effort ("Add how hard it felt to let the weight go up").
//  - An entered RPE ≤ 8 at the top raises one loadable step, every time.
//  - The between-session rule (BL-08) is unchanged.
//
// Real invocations: the whole wireSetsBlock save path into the real saveExSet
// and getExLog over an in-memory window.storage, logUpNext, commitSet,
// writeSetToRow, renderAllSetChips / renderSetChips, recommendNextSet,
// renderUpNext / fillSetLogger / readSetLogger, renderCoverSteppers and
// setCoverRepsLeft over the real cover markup; sessionShareStats and
// finishSheetModel for the counts; buildPastSessions + analyzeProgressionSignal
// for the between-session rule. Stubbed: the rest timer, streak/activity
// writers, PR lookups (reconstructAllPRs → none).
//
// Sabotage: restore the RPE fill in fillSetLogger and criteria 1 and 4 fail
// (stored RPE 8, the weight climbs); restore `rpe == null ||` in
// recommendNextSet and criterion 1 fails on the weight.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, runSandbox, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-no-invented-rpe.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'numericPlaceholder', 'writeSetToRow', 'setChipLabel', 'commitSet', 'findNextSetRow', 'readSetLogger', 'logUpNext',
  'setCoverAdjust', 'isBackdating', 'checkAllSetsCompleteAndAutoCheck', 'wireSetsBlock', 'showUndoToast', 'closeFinishSheet', 'showFinishSheet',
  'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle', 'fillSetLogger',
  'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'renderCoverSteppers', 'setCoverRepsLeft', 'triggerCelebration',
  'setChipValues', 'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor',
  'isCoverDropRow', 'renderCoverDrop', 'endCoverDrop', 'noteSetForCoverDrop', 'holdRestForDrop', 'coverDropKey',
  'saveExSet', 'getExLog', 'todayEntryFor', 'isMissedSet', 'sessionShareStats', 'finishSheetModel'].map(n => extractFunction(src, n));
const DECLS = [/^const prCelebrated = new Set\(\);$/m, /^let coverDropOffer = null;$/m].map(re => { const m = src.match(re); if(!m) throw new Error('declaration not found: ' + re); return m[0]; });

const DATE = '2026-11-25';
const NAME = 'Lateral Raise';
// The row as renderWorkout draws it from last session (25 × 15 at RPE 8 on every set): numeric placeholders.
const setRow = i => `<div class="set-row" data-set-idx="${i}" data-ex-idx="0"><span class="set-row-owner">${NAME}</span>
  <input class="ex-input ex-weight" placeholder="25" value=""><input class="ex-input ex-reps" placeholder="15" value=""><input class="ex-input ex-rpe" placeholder="8" value=""><span class="set-status"></span></div>`;
const block = n => `<div class="exercise-block" id="b0"><div class="set-chips"></div><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">${NAME}</div><div class="ex-sets"><span>${n}×12-15</span></div></div>
  <div class="sets-block">${Array.from({length: n}, (_, i) => setRow(i)).join('')}<button class="add-set-btn">Add Set</button></div></div>`;

function mount(n = 5){
  const body = extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'undoToast') + extractElementById(src, 'finishSheet')
    + extractElementById(src, 'celebrateBanner') + `<div id="exerciseList">${block(n)}</div><div id="dayTitle">Day 1</div>`;
  const { window } = runJsdom(body, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', activeDay = 'd1', selectedLogDate = ${JSON.stringify(DATE)}, exerciseDetailPinned = true;
    var restTargetBySlot = {}, SpeechRecognitionCtor = null, undoToastTimeout = null, celebrateTimeout = null, restTimerEndsAt = null, equipmentProfile = null;
    var MEDICAL_STYLES = {}, programs = {strength: {label: 'Strength'}}, DELOAD_CYCLE_WEEKS = 5;
    window.__store = {};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    function normalizeExEntry(e){ return e; } function noteRestAchieved(){ return null; } function recordActivity(){ return Promise.resolve(); }
    function renderStreak(){} function markMilestone(){} function recordWorkoutTime(){}
    function getTodayKey(){ return ${JSON.stringify(DATE)}; }
    function startRestTimer(){} function getDefaultRestSeconds(){ return 60; } function getRestReasonLabel(){ return ''; }
    function exKey(p, d, s, sub){ return 'ex:' + p + ':' + d + ':' + s + (sub ? ':sub:' + sub : ''); } function slotIdOf(ex, i){ return i; } function subVariantOf(){ return undefined; }
    function isDistanceExercise(){ return false; } function getFallbackPriorEntry(){ return null; } async function renderWorkout(){} async function refreshSessionSummary(){}
    function icon(n){ return '<svg data-icon="' + n + '"></svg>'; } function setExerciseBlockOpen(){} function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; }
    async function isPastPrNotificationWindow(){ return true; } function toCanonicalLb(v){ return Number(v); } function toCanonicalMetres(v){ return Number(v); }
    function prGainDetail(){ return ''; } function bestLabel(){ return ''; } function preloadShareCardFont(){} function shareCelebrationCard(){}
    function fmtWeight(v){ return v + ' lb'; } async function saveExWarmupSkipped(){} function wirePlateButton(){} function wireVoiceLogButton(){}
    function calcPlatesPerSide(){ return null; } function formatPlateResult(){ return ''; } function analyzeProgressionSignal(){ return null; }
    function buildPastSessions(){ return []; } function makeSwipeable(){} function noteWorkoutActivity(){} function deleteSet(){}
    function getEquipment(){ return {bar:45, plates:[45,35,25,10,5,2.5], dbIncrement:5}; } function toDisplayWeight(v){ return v; }
    function isBarbellExercise(){ return false; } function isDumbbellExercise(n){ return n === ${JSON.stringify(NAME)}; } var exerciseInfo = {};
    async function getWorkoutTimeWindow(){ return null; } async function reconstructAllPRs(){ return []; } async function readExCorpus(){ return []; }
    async function isDeloadWeek(){ return false; } async function getMesocycleWeek(){ return null; } function nextTimeSuggestion(){ return null; }
    function trainingDayNumber(){ return 1; } function fmtDayLabel(d){ return d; } function cycleWeekOf(w){ return w; } function numberMilestoneOn(){ return 0; } function bibLeadLift(){ return null; }
    function openFinishSheet(){ document.getElementById('finishSheet').classList.add('active'); }`,
    [...DECLS, ...FNS, `
      wireSetsBlock(document.getElementById('b0'), 0, {name: ${JSON.stringify(NAME)}, sets: '${n}x12-15'});
      renderAllSetChips(); renderUpNext();`]);
  const $ = id => window.document.getElementById(id);
  const flush = async () => { for(let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 0)); };
  // One set, as the lifter does it: optionally type an RPE, then tap Log. Undo is dismissed (it would hold nothing here).
  const log = async (rpe) => {
    if(rpe != null){ $('upNextRpe').value = String(rpe); $('upNextRpe').dispatchEvent(new window.Event('input', {bubbles: true})); }
    const ok = window.logUpNext(); await flush(); $('undoToast').classList.remove('active'); return ok;
  };
  const stored = () => JSON.parse(window.__store['ex:strength:d1:0'] || '[]').find(e => e.date === DATE).sets;
  const cover = () => ({weight: $('upNextWeight').value, numeral: $('upNextNumeral').querySelector('.cover-w').textContent, why: $('upNextWhy').hidden ? '' : $('upNextWhy').textContent});
  return { window, $, flush, log, stored, cover };
}

test('criterion 1: the tester\'s case. Five one-tap Logs at the top of the range, nothing else touched: no RPE stored, 25 lb before every set, and the cover asks for the effort', async (assert)=>{
  const ui = mount(5);
  for(let i = 0; i < 5; i++){
    const c = ui.cover();
    assert.strictEqual(c.weight, '25', `set ${i + 1}: the cover's weight`);
    assert.strictEqual(c.numeral, '25', `set ${i + 1}: the numeral`);
    if(i > 0) assert.strictEqual(c.why, 'Add how hard it felt to let the weight go up', `set ${i + 1}: why`);
    assert.strictEqual(await ui.log(), true);
  }
  const sets = ui.stored();
  assert.strictEqual(sets.length, 5, 'anchor: five sets reached storage through the real saveExSet');
  sets.forEach((s, i) => {
    assert.ok(s.rpe == null || s.rpe === '', `set ${i + 1}: no RPE stored (got ${JSON.stringify(s.rpe)})`);
    assert.strictEqual(s.weight, 25); assert.strictEqual(s.reps, 15);
  });
});

test('criterion 2: an entered RPE 6 at the top is stored and raises one loadable step; entering 6 again raises again (no session cap)', async (assert)=>{
  const ui = mount(4);
  await ui.log(6);
  assert.strictEqual(ui.stored()[0].rpe, 6);
  assert.strictEqual(ui.cover().weight, '30');
  assert.strictEqual(ui.cover().why, 'Go up 5 — 15 reps at RPE 6 last set');
  ui.$('upNextReps').value = '15'; // the next suggestion restarts reps at the bottom of the range; the lifter hits the top again
  await ui.log(6);
  assert.strictEqual(ui.stored()[1].weight, 30);
  assert.strictEqual(ui.stored()[1].rpe, 6);
  assert.strictEqual(ui.cover().weight, '35', 'a second raise in the same session');
});

test('a "Reps left" pill is an entered RPE too: tapping 3+ stores RPE 7 and the weight goes up', async (assert)=>{
  const ui = mount(3);
  ui.window.renderCoverSteppers(ui.$('upNext'));
  ui.window.setCoverRepsLeft(3);
  await ui.log();
  assert.strictEqual(ui.stored()[0].rpe, 7);
  assert.strictEqual(ui.cover().weight, '30');
});

test('criterion 3: entered RPE 9 or 10 at the top: the next set stays at the same weight', async (assert)=>{
  for(const rpe of [9, 10]){
    const ui = mount(3);
    await ui.log(rpe);
    assert.strictEqual(ui.stored()[0].rpe, rpe);
    assert.strictEqual(ui.cover().weight, '25', 'rpe ' + rpe);
    const chip = ui.window.document.querySelector('#b0 .set-chip[data-set-idx="1"]');
    assert.strictEqual(chip._values.trend, 'same', 'rpe ' + rpe);
  }
});

test('criterion 4: the ghost. After an RPE 6 set, the next set\'s RPE tile is empty (last session\'s 8 as ghost text) and no Reps-left pill is selected', async (assert)=>{
  const ui = mount(3);
  assert.strictEqual(ui.$('upNextRpe').value, '', 'set 1: empty before anything is entered');
  assert.strictEqual(ui.$('upNextRpe').placeholder, '8', 'set 1: last session\'s RPE as ghost text');
  await ui.log(6);
  assert.strictEqual(ui.$('upNextRpe').value, '');
  assert.ok(ui.$('upNextRpe').placeholder !== '', 'a ghost RPE still shows');
  ui.window.renderCoverSteppers(ui.$('upNext'));
  const pills = [...ui.window.document.querySelectorAll('#coverSteppers .cover-rir [data-rir]')];
  assert.strictEqual(pills.length, 4, 'anchor: the real pills');
  pills.forEach(p => assert.strictEqual(p.getAttribute('aria-checked'), 'false', 'pill ' + p.dataset.rir));
});

test('criterion 5: sets with no RPE are still sets: the finish sheet and the share card count them', async (assert)=>{
  const ui = mount(3);
  for(let i = 0; i < 3; i++) await ui.log();
  const list = ui.$('exerciseList');
  const model = await ui.window.finishSheetModel(list, DATE, 'strength');
  assert.strictEqual(model.sets, 3);
  assert.strictEqual(model.lifts, 1);
  const share = await ui.window.sessionShareStats(list, DATE, 'strength');
  assert.strictEqual(share.stats.find(s => s.label === 'SETS').value, '3');
});

test('criterion 6: between sessions unchanged. Two no-RPE sessions at the top, same weight → increase; one such session → no increase', ()=>{
  const assert = require('assert');
  const FN2 = ['isMissedSet', 'topSetOf', 'sessionTopOf', 'buildPastSessions', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'analyzeProgressionSignal',
    'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'estimated1RM', 'rpeAdjustedE1RM', 'recentBestE1RM', 'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight'];
  const CONSTS = ['CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_EXERCISES', 'DUMBBELL_DEFAULTS', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'RPE_E1RM_LOOKBACK_SESSIONS'];
  const chunks = ["var weightUnit = 'lb'; var selectedLogDate = '2026-11-25'; var equipmentProfile = null;", ...CONSTS.map(c => extractConst(src, c)), ...FN2.map(f => extractFunction(src, f))];
  // As the real saveExSet stores a set logged with no RPE (rpe: null).
  const session = date => ({date, n: NAME, sets: [0, 1, 2].map(() => ({weight: 25, reps: 15, rpe: null}))});
  const signal = log => runSandbox(chunks, `__capture.push((analyzeProgressionSignal(buildPastSessions(${JSON.stringify(log)}), {name: ${JSON.stringify(NAME)}, sets: '3×12-15'}, 'isolation', 'strength') || {}).type || null);`)[0];
  assert.strictEqual(signal([session('2026-11-18'), session('2026-11-21')]), 'increase', 'two sessions at the top, no RPE');
  assert.notStrictEqual(signal([session('2026-11-21')]), 'increase', 'one session at the top, no RPE');
});

run();
