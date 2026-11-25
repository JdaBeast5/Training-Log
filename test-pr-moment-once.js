'use strict';
// v3.665 (BL-82, the usability test's B2): the PR moment. "Heaviest weight
// yet" covered Undo for 5 s and the finish sheet's Share, and fired up to
// three times a set (writeSetToRow dispatches change on weight, RPE and reps,
// and each save ran the PR branch): 31 banners in one session.
//  - Mid-workout (today's session), a PR is the row's PR mark and a "PR" tag
//    on its chip and on the cover's logged chip; no banner. The finish sheet
//    shows the day's records.
//  - The reaction runs on the save that makes the row a real set; a lift's PR
//    gets its one moment per session (a backdated PR still celebrates, once
//    per lift per day).
//  - triggerCelebration never shows while the Undo toast or the finish sheet
//    is up (every caller).
//
// Real invocations: the whole wireSetsBlock (its save path, PR branch
// included), logUpNext, commitSet, writeSetToRow, showUndoToast,
// renderAllSetChips / renderSetChips, renderUpNext / renderCoverChips, and
// triggerCelebration over the real cover, toast, finish sheet and banner
// markup. Stubbed at the boundary: saveExSet (answers isPR as the test sets
// it), the rest timer, refreshSessionSummary.
//
// Sabotage: drop the once-per-lift guard and criterion 2 fails (3 held);
// drop the Undo/finish guard in triggerCelebration and criterion 4 fails;
// drop a held celebration instead of keeping it, and the hold test fails.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-pr-moment-once.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'numericPlaceholder', 'writeSetToRow', 'setChipLabel', 'commitSet', 'findNextSetRow', 'readSetLogger', 'logUpNext',
  'setCoverAdjust', 'isBackdating', 'checkAllSetsCompleteAndAutoCheck', 'wireSetsBlock', 'showUndoToast', 'closeFinishSheet', 'showFinishSheet',
  'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine', 'syncStickyDayTitle', 'fillSetLogger',
  'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'triggerCelebration',
  'setChipValues', 'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor',
  'isCoverDropRow', 'renderCoverDrop', 'endCoverDrop', 'noteSetForCoverDrop', 'holdRestForDrop', 'coverDropKey'].map(n => extractFunction(src, n));
const SET = (src.match(/^const prCelebrated = new Set\(\);$/m) || [])[0];
const OFFER = (src.match(/^let coverDropOffer = null;$/m) || [])[0];
if(!SET || !OFFER) throw new Error('prCelebrated / coverDropOffer declarations not found');

const setRow = (ex, i, name) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="${ex}"><span class="set-row-owner">${name}</span>
  <input class="ex-input ex-weight" placeholder="lb" value=""><input class="ex-input ex-reps" placeholder="reps" value=""><input class="ex-input ex-rpe" value=""><span class="set-status"></span></div>`;
const lone = (ex, name, n) => `<div class="exercise-block" id="b${ex}"><div class="set-chips"></div><div class="exercise"><input type="checkbox" data-idx="${ex}"><div class="ex-name">${name}</div><div class="ex-sets"><span>${n}×8</span></div></div>
  <div class="sets-block">${Array.from({length: n}, (_, i) => setRow(ex, i, name)).join('')}<button class="add-set-btn">Add Set</button></div></div>`;

function mount({date = '2026-11-24', isPR = true} = {}){
  const body = extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'undoToast') + extractElementById(src, 'finishSheet')
    + extractElementById(src, 'celebrateBanner') + `<div id="exerciseList">${lone(0, 'Bench Press', 3)}${lone(1, 'Barbell Row', 2)}</div>`;
  const { window } = runJsdom(body, `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', activeDay = 'd1', selectedLogDate = ${JSON.stringify(date)}, exerciseDetailPinned = true;
    var restTargetBySlot = {}, SpeechRecognitionCtor = null, undoToastTimeout = null, celebrateTimeout = null, restTimerEndsAt = null, equipmentProfile = null;
    function getTodayKey(){ return '2026-11-24'; }
    window.__isPR = ${isPR};
    async function saveExSet(day, slot, setIdx, w, reps){ await null; return {isPR: window.__isPR, priorMax: 100}; }
    function startRestTimer(){} function getDefaultRestSeconds(){ return 60; } function getRestReasonLabel(){ return ''; }
    function exKey(p, d, s, sub){ return 'ex:' + p + ':' + d + ':' + s + (sub ? ':sub:' + sub : ''); } function slotIdOf(ex, i){ return i; } function subVariantOf(){ return undefined; }
    function isDistanceExercise(){ return false; } function getFallbackPriorEntry(){ return null; } async function renderWorkout(){} async function refreshSessionSummary(){}
    function icon(n){ return '<svg data-icon="' + n + '"></svg>'; } function setExerciseBlockOpen(){} function renderCoverBar(){} function renderExerciseDetailBar(){} function firstSetHint(){ return ''; }
    async function isPastPrNotificationWindow(){ return true; } function toCanonicalLb(v){ return Number(v); } function toCanonicalMetres(v){ return Number(v); }
    function prGainDetail(){ return 'Bench Press — 185 lb'; } function bestLabel(){ return 'Heaviest weight yet'; } function preloadShareCardFont(){} function shareCelebrationCard(){}
    function fmtWeight(v){ return v + ' lb'; } async function saveExWarmupSkipped(){} function wirePlateButton(){} function wireVoiceLogButton(){}
    function calcPlatesPerSide(){ return null; } function formatPlateResult(){ return ''; } function analyzeProgressionSignal(){ return null; }
    function buildPastSessions(){ return []; } async function getExLog(){ return []; } function makeSwipeable(){} function noteWorkoutActivity(){} function deleteSet(){}
    function getEquipment(){ return {bar:45, plates:[45,35,25,10,5,2.5], dbIncrement:5}; } function toDisplayWeight(v){ return v; }
    function isBarbellExercise(){ return false; } function isDumbbellExercise(){ return false; } var exerciseInfo = {};
    async function finishSheetModel(){ return {}; } function openFinishSheet(){ document.getElementById('finishSheet').classList.add('active'); }`,
    [SET, OFFER, ...FNS, `
      // Count every call that reaches the real triggerCelebration, and whether it showed.
      const __real = triggerCelebration; window.__calls = 0; window.__shown = 0;
      triggerCelebration = function(){ window.__calls++; const b = document.getElementById('celebrateBanner'); const was = b.classList.contains('active'); b.classList.remove('active'); __real.apply(this, arguments); if(b.classList.contains('active')) window.__shown++; else if(was) b.classList.add('active'); };
      window.triggerCelebration = triggerCelebration;
      // The held list lives on the global triggerCelebration (here, this spy), as the app's own code refers to it.
      window.__realHeld = () => (triggerCelebration.held || []).length;
      wireSetsBlock(document.getElementById('b0'), 0, {name:'Bench Press', sets:'3x8'});
      wireSetsBlock(document.getElementById('b1'), 1, {name:'Barbell Row', sets:'2x8'});
      window.__log = (w = '185', r = '8') => { document.getElementById('upNextWeight').value = w; document.getElementById('upNextReps').value = r; return logUpNext(); };
      renderAllSetChips(); renderUpNext();`]);
  const flush = async () => { for(let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 0)); };
  const $ = id => window.document.getElementById(id);
  const row = (ex, i) => window.document.querySelector(`.set-row[data-ex-idx="${ex}"][data-set-idx="${i}"]`);
  return { window, $, flush, row };
}

test('criterion 1: one-tap Log of a PR set, today: no celebration call, no banner; the row shows its PR mark and its chip (and the cover\'s logged chip) a PR tag', async (assert)=>{
  const ui = mount();
  assert.strictEqual(ui.window.__log(), true);
  await ui.flush();
  assert.strictEqual(ui.window.__calls, 0, 'the PR path doesn\'t celebrate mid-workout');
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), false);
  assert.ok(ui.row(0, 0).querySelector('.set-status.set-status-pr'), 'the row\'s PR mark');
  const chip = ui.window.document.querySelector('#b0 .set-chip[data-set-idx="0"]');
  assert.ok(chip.querySelector('.set-chip-pr'), 'the chip\'s PR tag');
  assert.match(chip.getAttribute('aria-label'), /personal record$/);
  assert.ok(ui.window.document.querySelector('#upNextChips .cover-chip.is-done .set-chip-pr'), 'the cover\'s logged chip carries it');
});

test('criterion 2: a backdated PR set (still a celebration path): one moment per set, though its commit fires three field saves; held while Undo is up, then shown', async (assert)=>{
  const ui = mount({date: '2026-11-20'});
  ui.window.__log(); await ui.flush();
  assert.strictEqual(ui.window.__shown, 0, 'not over the Undo toast');
  assert.strictEqual(ui.window.__realHeld(), 1, 'one held moment, not three');
  ui.$('undoToast').classList.remove('active');
  await new Promise(r => setTimeout(r, 800));
  assert.strictEqual(ui.window.__shown, 1, 'shown once Undo is gone');
  assert.strictEqual(ui.window.__realHeld(), 0, 'nothing left held');
});

test('criterion 3: two PR sets on the same lift in one session: the second gets the inline mark and no extra celebration', async (assert)=>{
  const ui = mount({date: '2026-11-20'});
  ui.window.__log(); await ui.flush();
  ui.$('undoToast').classList.remove('active');
  await new Promise(r => setTimeout(r, 800)); // the first moment shows
  ui.window.__log('190', '8'); await ui.flush();
  ui.$('undoToast').classList.remove('active');
  await new Promise(r => setTimeout(r, 800));
  assert.strictEqual(ui.window.__shown, 1, 'one moment for Bench this session');
  assert.strictEqual(ui.window.__realHeld(), 0);
  assert.ok(ui.row(0, 0).querySelector('.set-status-pr') && ui.row(0, 1).querySelector('.set-status-pr'), 'both sets marked');
  assert.strictEqual(ui.row(0, 1).dataset.pr, '1');
});

test('the mark goes with the set: undoing a PR set clears its PR tag', async (assert)=>{
  const ui = mount();
  ui.window.__log(); await ui.flush();
  ui.$('undoToastBtn').click(); await ui.flush();
  assert.strictEqual(ui.row(0, 0).dataset.pr, undefined);
  assert.strictEqual(ui.window.document.querySelectorAll('#b0 .set-chip-pr').length, 0);
});

test('a set that isn\'t a PR gets no mark and no tag', async (assert)=>{
  const ui = mount({isPR: false});
  ui.window.__log(); await ui.flush();
  assert.ok(!ui.row(0, 0).querySelector('.set-status-pr'));
  assert.strictEqual(ui.window.document.querySelectorAll('.set-chip-pr').length, 0);
});

test('criterion 4: triggerCelebration doesn\'t show while the Undo toast is up, nor while the finish sheet is open; it does otherwise', async (assert)=>{
  const ui = mount();
  const fire = () => ui.window.triggerCelebration('trophy', 'Heaviest weight yet', '', true, null);
  ui.$('undoToast').classList.add('active'); fire();
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), false, 'not over Undo');
  ui.$('undoToast').classList.remove('active'); ui.$('finishSheet').classList.add('active'); fire();
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), false, 'not over the finish sheet');
  ui.$('finishSheet').classList.remove('active'); fire();
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), true, 'anchor: it shows when neither is up');
});

test('review fix: a celebration held behind Undo (a streak milestone, say) isn\'t lost: it shows once Undo is gone', async (assert)=>{
  const ui = mount();
  ui.$('undoToast').classList.add('active');
  ui.window.triggerCelebration('flame', '4 weeks in a row', '', true, null);
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), false, 'held');
  await new Promise(r => setTimeout(r, 700));
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), false, 'still held while Undo is up');
  ui.$('undoToast').classList.remove('active');
  await new Promise(r => setTimeout(r, 700));
  assert.strictEqual(ui.$('celebrateBanner').classList.contains('active'), true, 'shown');
  assert.strictEqual(ui.$('celebrateText').textContent, '4 weeks in a row');
});

test('review fix: a set re-saved as no longer a record loses its PR tag', async (assert)=>{
  const ui = mount();
  ui.window.__log(); await ui.flush();
  assert.strictEqual(ui.row(0, 0).dataset.pr, '1', 'anchor: tagged');
  ui.window.__isPR = false;
  const w = ui.row(0, 0).querySelector('.ex-weight'); w.value = '135'; w.dispatchEvent(new ui.window.Event('change', {bubbles: true}));
  await ui.flush();
  assert.strictEqual(ui.row(0, 0).dataset.pr, undefined);
  assert.strictEqual(ui.window.document.querySelectorAll('#b0 .set-chip-pr').length, 0);
});

run();
