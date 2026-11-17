'use strict';
// Tap counts for the redesign's most frequent actions (UX-13 creates this file;
// UX-06a adds the cover's set logging to it, and UX-17 requires it to pass
// unchanged). Each case drives the real wiring with real clicks and counts the
// taps an action takes; the count may never exceed the parent commit's.
//
// v3.588 (UX-13): "log a recent food": one tap on a BL-18 chip adds exactly one
// entry to today's log. At the parent commit (v3.587) the same chip took one tap.
//
// v3.593 (UX-06a): "log the ready set": from a fresh Today, one tap on the
// cover's Log button commits the ready set. At the parent commit (v3.592) the
// Up next card's Log set took one tap too.
//
// Real invocation: the real #foodRecents and #foodSearchInput markup, the real
// chip-click wiring, buildRecentFoods, relogFoodEntry, renderFoodRecents and
// addFoodToLog, with a stub window.storage (as test-food-recents.js).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-tap-counts.js');

const PARENT_TAPS = {logRecentFood: 1, logReadySet: 1};

function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}

test('log a recent food: one tap on a recent-food chip adds exactly one entry (no more taps than the parent commit)', async (assert)=>{
  const markup = (() => { const d = new JSDOM(html).window.document; return d.getElementById('foodSearchInput').outerHTML + d.getElementById('foodRecents').outerHTML + '<div id="foodCats"></div>'; })();
  const yesterday = (() => { const d = new Date(Date.UTC(2026, 10, 15)); return d.toISOString().slice(0, 10); })();
  const store = {[`foodlog:${yesterday}`]: JSON.stringify([{name: 'Greek Yogurt', cal: 100, pro: 17, fat: 0.7, carb: 6}])};
  const { window } = runJsdom(markup, `
    window.__store = ${JSON.stringify(store)};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    var selectedLogDate = '2026-11-16', todaysFoodLog = [], usageCounts = {}, currentSearchTerm = '', _foodSearchTimer = null;
    function isBackdating(){ return false; } function nowTimeKey(){ return '12:00'; } async function addToCustomFoods(){}
    function renderFoodLog(){} function renderFoodItems(){} function markMilestone(){} function showFoodAddedPop(){}`,
    [extractConst(src, 'FOOD_QTY_MAX'), 'let foodRecents = [];', extractConst(src, 'FOOD_RECENTS_DAYS').replace(/^const /, 'var ').replace(/,\s*FOOD_RECENTS_MAX/, '; var FOOD_RECENTS_MAX'),
     ...['dateKeyMinusDays', 'escapeHtml', 'scaleFoodItem', 'saveFoodLog', 'bumpUsageCount', 'buildRecentFoods', 'relogFoodEntry', 'renderFoodRecents', 'addFoodToLog'].map(f => extractFunction(src, f)),
     statement("document.getElementById('foodRecents').addEventListener('click'"),
     'window.__log = () => todaysFoodLog.length;']);
  await window.renderFoodRecents();
  const chip = window.document.querySelector('#foodRecents [data-recent]');
  assert.ok(chip, 'anchor: a recent-food chip is offered');
  let taps = 0;
  chip.click(); taps++;
  await new Promise(r => setTimeout(r, 10));
  assert.strictEqual(window.__log(), 1, 'one tap logged one entry');
  assert.ok(taps <= PARENT_TAPS.logRecentFood, `taps ${taps} > parent ${PARENT_TAPS.logRecentFood}`);
});

test('log the ready set: one tap on the cover\'s Log button commits exactly the ready set (no more taps than the parent commit)', (assert)=>{
  const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'setChipOwnerTag',
    'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips', 'trimUnitNum', 'parseTopRep', 'parseBottomRep',
    'recommendNextSet', 'setSheetWeightStep', 'renderUpNext', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger',
    'readSetLogger', 'logUpNext', 'setCoverAdjust', 'firstSetHint', 'targetRirLabel', 'getRepRangeTier'].map(f => extractFunction(src, f));
  const row = (i, done) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="0"><span class="set-row-owner">Bench Press</span>
    <input class="ex-input ex-weight" placeholder="lb" value="${done ? '185' : ''}"><input class="ex-input ex-reps" placeholder="reps" value="${done ? '5' : ''}">
    <input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
  const list = `<div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">Bench Press</div>
    <div class="ex-sets"><span>4×4-6</span></div></div><div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${row(0, true)}${row(1)}${row(2)}</div></div></div></div>`;
  const cover = new JSDOM(html).window.document.getElementById('upNext').outerHTML;
  const { window } = runJsdom(cover + `<div id="exerciseList">${list}</div>`, `
    var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true, exerciseInfo = {};
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
    function isBarbellExercise(){ return true; } function isDumbbellExercise(){ return false; }
    function showUndoToast(){} function refreshGymLogBtn(){} function icon(){ return ''; }
    function renderCoverBar(){} // 2026-11-17 (v3.596, UX-07): the loaded bar, driven by test-plate-stack.js`,
    [...FNS, statement("document.getElementById('upNextLog').addEventListener('click', logUpNext);").split('\n')[0],
     'window.__commits = 0; const __c = commitSet; commitSet = function(r, v, f){ window.__commits++; return __c(r, v, f); };',
     'renderAllSetChips(); renderUpNext();']);
  const ready = window.document.querySelector('#exerciseList .set-chip.is-ready');
  assert.ok(ready && ready._values.reps, 'anchor: the ready set has something to log');
  let taps = 0;
  window.document.getElementById('upNextLog').click(); taps++;
  assert.strictEqual(window.__commits, 1, 'one tap, one set');
  assert.strictEqual(window.document.querySelector('.set-row[data-set-idx="1"] .ex-reps').value, String(ready._values.reps), 'the ready set');
  assert.ok(taps <= PARENT_TAPS.logReadySet, `taps ${taps} > parent ${PARENT_TAPS.logReadySet}`);
});

run();
