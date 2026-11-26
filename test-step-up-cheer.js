'use strict';
// v3.648 (MKT-23, owner 2026-11-24, slogan.md §10): "Step up a plate!" shows
// only when the app really raised a lift's weight: computeSuggestedSet's
// reason 'increase' and a heavier number than the basis (isStepUp). Today's
// cover says it under the target (T1); the bib says it in the note's place (A;
// test-bib-card.js), with the bib model in test-finish-sheet.js (criterion 5).
// Never on a clinical program; silent on holds, drops, deloads and RPE loads.
//
// Real invocation: the real isStepUp; the real analyzeProgressionSignal,
// buildPastSessions, priorSetForSlot, computeSuggestedSet and snapToLoadable;
// the real renderUpNext over the real page markup; the stamp expression taken
// verbatim from renderWorkout and evaluated.
//
// Sabotage: let isStepUp accept reason 'rpe' and criteria 1 and 2 fail; stamp
// the block on a clinical program and criterion 4 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-step-up-cheer.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// Comment lines dropped, line by line (a /* … */ regex eats code at accept="image/*").
const strip = t => t.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).map(l => l.replace(/\s\/\/ .*$/, '')).join('\n');

const ENGINE_FNS = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay', 'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep',
  'analyzeProgressionSignal', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise', 'isDumbbellExercise',
  'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad', 'estimated1RM', 'rpeAdjustedE1RM', 'recentBestE1RM',
  'buildPastSessions', 'sessionTopOf', 'topSetOf', 'isMissedSet', 'priorSetForSlot', 'isStepUp'];
const ENGINE_CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS',
  'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'RPE_E1RM_LOOKBACK_SESSIONS', 'STEP_UP_CHEER'];
const engine = (pre = '') => ["var loadSuggestionMode = 'progression', weightUnit = 'lb', activeProgram = 'strength', equipmentProfile = null, selectedLogDate = '2026-11-23';" + pre,
  ...ENGINE_CONSTS.map(c => extractConst(src, c)), ...ENGINE_FNS.map(f => extractFunction(src, f))];

test('criterion 1: the real isStepUp: true for an increase to 190 against 182.5 lb; false for hold, decrease, deload, rpe, a snap back, and no basis', (assert)=>{
  const [r] = runSandbox(engine(), `__capture.push([
    isStepUp({reason: 'increase', weight: 190}, 182.5),
    isStepUp(null, 182.5), isStepUp({reason: 'decrease', weight: 175}, 182.5), isStepUp({reason: 'deload', weight: 160}, 182.5),
    isStepUp({reason: 'rpe', weight: 200}, 182.5), isStepUp({reason: 'increase', weight: 182.5}, 182.5),
    isStepUp({reason: 'increase', weight: 190}, null), isStepUp({reason: 'increase', weight: 190}, undefined)]);`);
  assert.deepStrictEqual(r, [true, false, false, false, false, false, false, false]);
});

const BENCH = {name: 'Bench Press', sets: '4×4-6'};
const top = date => ({date, sets: [185, 185, 185, 185].map(w => ({weight: w, reps: 6}))});
function viaEngine(log, {deload = false, mode = 'progression'} = {}){
  const [r] = runSandbox(engine(`loadSuggestionMode = ${JSON.stringify(mode)};`), `
    const log = ${JSON.stringify(log)}, ex = ${JSON.stringify(BENCH)};
    const past = buildPastSessions(log, null);
    const prior = [...log].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
    const signal = analyzeProgressionSignal(past, ex, 'push', 'strength');
    const rpeCtx = {e1rm: recentBestE1RM(past), stepE1rm: recentBestE1RM(past, {plain: true}), week: 2, program: 'strength', category: 'push'};
    const basis = priorSetForSlot(prior, 0, ex, false);
    const sug = computeSuggestedSet(basis, signal, ${deload}, 'push', ex, prior ? sessionTopOf(prior) : null, rpeCtx, prior);
    __capture.push({sug, up: isStepUp(sug, basis && basis.weight)});`);
  return r;
}

test('criterion 2: through the real engine: two sessions at the top of 4-6 step up; a deload, a short last session, no session and RPE mode don\'t', (assert)=>{
  const up = viaEngine([top('2026-11-16'), top('2026-11-19')]);
  assert.strictEqual(up.sug.reason, 'increase', 'anchor: the engine raises it');
  assert.ok(up.sug.weight > 185);
  assert.strictEqual(up.up, true);
  const deload = viaEngine([top('2026-11-16'), top('2026-11-19')], {deload: true});
  assert.strictEqual(deload.sug.reason, 'deload');
  assert.strictEqual(deload.up, false);
  const short = viaEngine([top('2026-11-16'), {date: '2026-11-19', sets: [{weight: 185, reps: 6}, {weight: 185, reps: 6}, {weight: 185, reps: 3}, {weight: 185, reps: 3}]}]);
  assert.notStrictEqual(short.sug && short.sug.reason, 'increase', 'anchor: no increase');
  assert.strictEqual(short.up, false);
  assert.strictEqual(viaEngine([]).up, false, 'no past session: no basis');
  // An easy RPE 6 log, so the RPE load is heavier than last time: still no cheer (effort, not the progression rule).
  const easy = date => ({date, sets: [185, 185, 185, 185].map(w => ({weight: w, reps: 6, rpe: 6}))});
  const rpe = viaEngine([easy('2026-11-16'), easy('2026-11-19')], {mode: 'rpe'});
  assert.strictEqual(rpe.sug.reason, 'rpe', 'anchor: an RPE load');
  assert.ok(rpe.sug.weight > 185, 'anchor: heavier than last time (' + rpe.sug.weight + ')');
  assert.strictEqual(rpe.up, false);
});

// ---- the cover (T1) -----------------------------------------------------------
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const BODY = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;
const NAMES = ['Bench Press', 'DB Curl'];
const ROW = (ex, set) => `<div class="set-row" data-set-idx="${set}" data-ex-idx="${ex}"><span class="set-row-owner">${NAMES[ex]}</span>
  <input class="ex-input ex-weight" placeholder="lb" value=""><input class="ex-input ex-reps" placeholder="reps" value=""><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
const HEAD = (i, name) => `<div class="exercise"><input type="checkbox" data-idx="${i}"><div class="ex-name-wrap"><div class="ex-name">${name}</div></div><div class="ex-sets"><span>4×4-6</span></div></div>`;
const LIST = `<div class="exercise-block" data-step-up="7.5">${HEAD(0, 'Bench Press')}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${ROW(0, 0)}${ROW(0, 1)}</div></div></div></div>
  <div class="exercise-block">${HEAD(1, 'DB Curl')}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${ROW(1, 0)}</div></div></div></div>`;
const COVER_FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
  'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep',
  'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip' /* v3.656 (UX-62) */, 'setCoverThen', 'supersetThenLine' /* v3.657 (UX-63) */, 'syncStickyDayTitle', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'firstSetHint']
  .map(n => extractFunction(src, n)).concat([extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractConst(src, 'STEP_UP_CHEER')]);
function cover(){
  const { window } = new JSDOM(`<!doctype html><html><head><style>${CSS}</style></head><body class="day-red has-cover">${BODY}</body></html>`, { pretendToBeVisual: true, runScripts: 'outside-only' });
  window.document.getElementById('exerciseList').innerHTML = LIST;
  window.eval(`var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true;
    var exerciseInfo = {}; var COMPOUND_CATEGORIES = new Set(['chest']);
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
    function isBarbellExercise(n){ return /Bench/.test(n || ''); } function isDumbbellExercise(n){ return /DB/.test(n || ''); }
    function renderCoverBar(){} function renderExerciseDetailBar(){}
    ${COVER_FNS.join('\n')}
    window.renderAllSetChips = renderAllSetChips; window.renderUpNext = renderUpNext;`);
  return window;
}

test('criterion 3: the real renderUpNext shows the cheer for a stamped block (+7.5 lb on last time), hides it for an unstamped one, and leaves no stale text', (assert)=>{
  const w = cover(), $ = id => w.document.getElementById(id);
  w.renderAllSetChips(); w.renderUpNext();
  assert.strictEqual($('upNextLift').textContent, 'Bench Press', 'anchor: the cover is on the stamped block');
  const cheer = $('upNextCheer');
  assert.strictEqual(cheer.hidden, false);
  assert.ok(cheer.textContent.startsWith('Step up a plate!'));
  assert.match(cheer.textContent, /\+7\.5 lb on last time/);
  assert.strictEqual(cheer.getAttribute('aria-hidden'), null, 'read in order, not hidden from VoiceOver');
  // Log Bench's sets: the cover moves to DB Curl, which has no stamp.
  for(const r of w.document.querySelectorAll('.set-row[data-ex-idx="0"]')){ r.querySelector('.ex-weight').value = '190'; r.querySelector('.ex-reps').value = '4'; }
  w.renderAllSetChips(); w.renderUpNext();
  assert.strictEqual($('upNextLift').textContent, 'DB Curl', 'anchor: the cover moved');
  assert.strictEqual(cheer.hidden, true);
  assert.strictEqual(cheer.textContent, '', 'no stale text');
});

// The stamp, as renderWorkout computes it (the statement taken from its source).
const STAMP = (()=>{
  const body = extractFunction(src, 'renderWorkout');
  const i = body.indexOf('stepUp = (activeProgram');
  if(i < 0) throw new Error('stamp statement not found');
  return body.slice(i, body.indexOf(';\n', i) + 1);
})();
function stamp(program, cross = false){
  const [r] = runSandbox(engine(`activeProgram = ${JSON.stringify(program)};`), `
    let stepUp = null; const priorIsCrossProgram = ${cross};
    const firstBasis = {weight: 182.5, reps: 6}, suggestedFirst = {reason: 'increase', weight: 190};
    ${STAMP}
    __capture.push({stepUp, would: isStepUp(suggestedFirst, firstBasis.weight)});`);
  return r;
}

test('criterion 4: clinical programs are never stamped, even when isStepUp is true; a lifting program is, with the display step', (assert)=>{
  assert.deepStrictEqual(stamp('strength'), {stepUp: 7.5, would: true});
  // Review fix: a basis from another program is not "last time" for this lift.
  assert.deepStrictEqual(stamp('strength', true), {stepUp: null, would: true});
  const [med] = runSandbox([extractConst(src, 'MEDICAL_STYLES')], `__capture.push(Object.keys(MEDICAL_STYLES)[0]);`);
  for(const p of ['medical', med]){
    const r = stamp(p);
    assert.strictEqual(r.would, true, 'anchor: the predicate is true on ' + p);
    assert.strictEqual(r.stepUp, null, p);
  }
});

test('criterion 7: one isStepUp, called only from renderWorkout and finishSheetModel; one literal; no new computeSuggestedSet call in renderWorkout', (assert)=>{
  const code = strip(src);
  assert.ok(code.includes('function drawBibCard(') && code.split('\n').length > 40000, 'anchor: the stripped source is the whole app');
  assert.strictEqual((code.match(/function isStepUp\(/g) || []).length, 1);
  const calls = (code.match(/\bisStepUp\(/g) || []).length - 1;
  assert.strictEqual(calls, 2, 'two call sites');
  assert.strictEqual((strip(extractFunction(src, 'renderWorkout')).match(/\bisStepUp\(/g) || []).length, 1);
  assert.strictEqual((strip(extractFunction(src, 'finishSheetModel')).match(/\bisStepUp\(/g) || []).length, 1);
  const wn = extractConst(src, 'WHATS_NEW');
  assert.strictEqual((strip(src.replace(wn, '')).match(/Step up a plate!/g) || []).length, 1, 'STEP_UP_CHEER is the one literal');
  // renderWorkout's computeSuggestedSet calls: the hoisted set-1 call and the per-set placeholder, as before (2).
  assert.strictEqual((strip(extractFunction(src, 'renderWorkout')).match(/\bcomputeSuggestedSet\(/g) || []).length, 2);
});

run();
