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
const { readIndexSource, extractFunction, extractConst, extractIIFE, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-tap-counts.js');

const PARENT_TAPS = {logRecentFood: 1, logReadySet: 1,
  // v3.601 (UX-20): the controls that moved onto the Today cover. At v3.600 each took one tap.
  previousDay: 1, backToToday: 1, openCalendar: 1, openSettings: 1, openCoach: 1, openDaySheet: 1,
  // v3.604 (UX-23): Gym mode became a plain text button in the "Then" head. At v3.603 it took one tap.
  enterGymMode: 1,
  // v3.606 (UX-25): the rest day's "mark as done" moved onto the cover. At v3.605 it took one tap.
  markRestDone: 1,
  // v3.608 (UX-28): Training Style moved into Settings. At v3.607 changing program was a scroll to the foot of Today
  // and the select; it is now the Settings icon and the select: 2, the new ceiling. A relocation agreed in the vision
  // (planning/design-vision.md §4), not a regression of a counted action.
  changeProgram: 2};

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
    'recommendNextSet', 'setSheetWeightStep', 'renderUpNext', 'syncStickyDayTitle', /* 2026-11-17 (v3.605, UX-24): renderUpNext writes the sticky header's set line */ 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger',
    'readSetLogger', 'logUpNext', 'setCoverAdjust', 'firstSetHint', 'targetRirLabel', 'getRepRangeTier'].map(f => extractFunction(src, f));
  const row = (i, done) => `<div class="set-row" data-set-idx="${i}" data-ex-idx="0"><span class="set-row-owner">Bench Press</span>
    <input class="ex-input ex-weight" placeholder="lb" value="${done ? '185' : ''}"><input class="ex-input ex-reps" placeholder="reps" value="${done ? '5' : ''}">
    <input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
  const list = `<div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">Bench Press</div>
    <div class="ex-sets"><span>4×4-6</span></div></div><div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${row(0, true)}${row(1)}${row(2)}</div></div></div></div>`;
  const cover = new JSDOM(html).window.document.getElementById('upNext').outerHTML;
  // 2026-11-22 (v3.611, UX-30): run twice, the second time with a milestone
  // moment showing (#celebrateBanner active): Log still takes one tap. That the
  // moment's box can't cover Log in a real browser is the PR's Playwright check
  // (elementFromPoint at Log's centre is Log); jsdom has no hit-testing.
  for(const withMoment of [false, true]){
  const banner = withMoment ? new JSDOM(html).window.document.getElementById('celebrateBanner').outerHTML.replace('class="celebrate-banner"', 'class="celebrate-banner active big"') : '';
  const { window } = runJsdom(cover + banner + `<div id="exerciseList">${list}</div>`, `
    var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true, exerciseInfo = {};
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
    function isBarbellExercise(){ return true; } function isDumbbellExercise(){ return false; }
    function showUndoToast(){} function refreshGymLogBtn(){} function icon(){ return ''; }
    function renderCoverBar(){} // 2026-11-17 (v3.596, UX-07): the loaded bar, driven by test-plate-stack.js
    function renderExerciseDetailBar(){} // 2026-11-22 (v3.622, UX-14): the open-screen pane's stack (test-open-screen-2-0.js)`,
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
  if(withMoment) assert.ok(window.document.querySelector('#celebrateBanner.active'), 'anchor: a moment was showing');
  }
});

// v3.601 (UX-20): the date controls and the three header buttons move onto the
// Today cover. Their listeners are attached first (as at page load), then
// syncTodayChrome moves them, then each is tapped once: the move must keep
// every listener (same elements, not copies).
function chromeIife(name){
  const i = src.indexOf(`(function ${name}(){`);
  if(i === -1) throw new Error('not found: ' + name);
  return src.slice(i, src.indexOf('\n})();', i) + 6);
}
function lineOf(startText){ const i = src.indexOf(startText); if(i === -1) throw new Error('not found: ' + startText); return src.slice(i, src.indexOf('\n', i)); }
function mountChrome(date){
  const body = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;
  const { window } = runJsdom(body, `
    window.storage = { set(){}, get: async ()=> null };
    window.matchMedia = (q)=>({ matches: !/min-width/.test(q) }); window.scrollTo = ()=>{};
    var selectedLogDate = '${date}';
    function getTodayKey(){ return '2026-11-02'; }
    function isBackdating(){ return selectedLogDate !== getTodayKey(); }
    function refreshForLogDate(){}
    window.__calendar = 0; function openCalendarModal(){ window.__calendar++; }
    window.__daySheet = 0; function openDaySheet(){ window.__daySheet++; }
    function refreshHealthImportSummary(){}
    var coachChatHistory = []; function renderCoachChatLog(){} async function getApiKey(){ return 'k'; }`,
    [...['setLogDate', 'renderLogDateBar', 'updateTodayFab', 'formatLogDateLabel', 'dateKeyMinusDays', 'fmtDayLabel', 'parseDateKey', 'formatDate', 'syncTodayChrome'].map(f => extractFunction(src, f)),
     extractConst(src, 'TODAY_CHROME_MOVES'),
     lineOf("document.getElementById('logDatePrev').addEventListener('click', ()=>{") + "\n  setLogDate(dateKeyMinusDays(selectedLogDate, 1));\n});",
     statement("document.getElementById('logDateToday').addEventListener('click',"),
     lineOf("document.getElementById('logDateLabelBtn').addEventListener('click', openCalendarModal);"),
     lineOf("document.getElementById('upNextDayBtn').addEventListener('click', openDaySheet);"),
     statement("document.getElementById('coachFab').addEventListener('click',"),
     chromeIife('wireSettings'),
     "document.getElementById('upNext').hidden = false; syncTodayChrome(); window.__state = () => ({selectedLogDate});"]);
  return window;
}

test('UX-20 tap parity: on the cover, previous day, back to today, the calendar, Settings, the coach and the day sheet each take one tap', (assert)=>{
  const w = mountChrome('2026-11-02');
  const $ = id => w.document.getElementById(id);
  assert.ok(w.document.body.classList.contains('today-cover') && $('logDatePrev').closest('#upNext') && $('settingsCog').closest('#upNext'), 'anchor: the controls are on the cover');
  const tap = (id) => { $(id).click(); return 1; };
  const taps = {};
  taps.previousDay = tap('logDatePrev');
  assert.strictEqual(w.__state().selectedLogDate, '2026-11-01', 'one tap back a day');
  taps.backToToday = tap('logDateToday');
  assert.strictEqual(w.__state().selectedLogDate, '2026-11-02', 'one tap back to today');
  taps.openCalendar = tap('logDateLabelBtn');
  assert.strictEqual(w.__calendar, 1, 'one tap opens the calendar');
  taps.openSettings = tap('settingsCog');
  assert.ok($('settingsOverlay').classList.contains('active'), 'one tap opens Settings');
  taps.openCoach = tap('coachFab');
  assert.ok($('coachFabModal').classList.contains('active'), 'one tap opens the coach');
  taps.openDaySheet = tap('upNextDayBtn');
  assert.strictEqual(w.__daySheet, 1, 'one tap opens the day sheet');
  for(const [k, n] of Object.entries(taps)) assert.ok(n <= PARENT_TAPS[k], `${k}: ${n} > parent ${PARENT_TAPS[k]}`);
});

test('UX-23: entering Gym mode from the "Then" head takes one tap on #gymEnterBtn (the real wiring and the real enterGymMode)', (assert)=>{
  const btn = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.getElementById('gymEnterBtn').outerHTML;
  const { window } = runJsdom(`<div id="workoutCard">${btn}</div>`, `
    var gymModeActive = false, gymAutoHandledDate = null, selectedLogDate = '2026-11-02', gymClockDate = '2026-11-02', gymAccumMs = 0, gymStretchStart = 0;
    function getTodayKey(){ return '2026-11-02'; }
    window.__calls = [];
    for(const f of ['hideGymOffer', 'finishGymLeave', 'cancelGymFinish', 'startGymClock', 'showView', 'openFirstIncompleteExercise', 'renderAllSetChips',
      'refreshGymDock', 'noteWorkoutActivity', 'scrollAppToTop', 'persistGymSession', 'exitGymMode', 'answerGymOffer'])
      window[f] = (...a) => window.__calls.push(f);`,
    [extractFunction(src, 'enterGymMode'), extractFunction(src, 'wireGymMode'), 'wireGymMode();']);
  const b = window.document.getElementById('gymEnterBtn');
  assert.strictEqual(b.textContent.trim(), 'Gym mode', 'anchor: the real button');
  b.click();
  const taps = {enterGymMode: 1};
  assert.ok(window.document.body.classList.contains('gym-mode'), 'one tap: gym mode is on');
  assert.ok(window.__calls.includes('showView') && window.__calls.includes('persistGymSession'), 'the real entry ran');
  for(const [k, n] of Object.entries(taps)) assert.ok(n <= PARENT_TAPS[k], `${k}: ${n} > parent ${PARENT_TAPS[k]}`);
});

test('UX-25: marking a rest day done takes one tap on the cover (the real renderWorkout rest branch and renderUpNext)', async (assert)=>{
  const FNS = ['escapeHtml', 'findNextSetRow', 'renderUpNext', 'syncStickyDayTitle', 'renderWorkout'].map(f => extractFunction(src, f));
  const page = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;
  const { window } = runJsdom(page, `
    var store = new Map();
    window.storage = { get: async k => store.has(k) ? {value: store.get(k)} : null, set: async (k, v) => { store.set(k, v); } };
    window.__store = store;
    var activeDay = 'd4', activeProgram = 'strength', selectedLogDate = '2026-11-02';
    var exerciseDetailDay = 'd4', exerciseDetailPinned = true, exerciseDetailIdx = null;
    function renderExerciseDetailBar(){} // 2026-11-22 (v3.622, UX-14): renderUpNext refreshes the open-screen pane's stack (test-open-screen-2-0.js)
    var dayDefs = { d4: {label: 'Day 4', sub: 'Full Rest', rest: true, plateNum: 'OFF', duration: 'Rest day', note: 'Walk and stretch.'} };
    function recordActivity(){ return Promise.resolve(); } function renderStreak(){}
    function renderTodayInsights(){} function renderArchiveWeekVisibility(){} function renderDayInsight(){}
    function getDayPlateClass(){ return 'p-off'; } function applyDayInk(){ return 'off'; } function dayGlyphSvg(){ return ''; }
    function formatLogDateLabel(){ return 'Today'; }`, [...FNS, 'window.__done = renderWorkout();']);
  await window.__done;
  const cb = window.document.getElementById('restDoneCheckbox');
  assert.ok(cb && cb.closest('#upNext'), 'anchor: the action is on the cover');
  cb.click();
  const taps = {markRestDone: 1};
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(window.__store.get('rest-log:2026-11-02:strength:d4'), '{"done":true}', 'one tap marks it done');
  for(const [k, n] of Object.entries(taps)) assert.ok(n <= PARENT_TAPS[k], `${k}: ${n} > parent ${PARENT_TAPS[k]}`);
});

test('UX-28: changing program takes 2 taps: the Settings icon, then #programSelector (the real wireSettings reparents it)', (assert)=>{
  const page = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;
  const { window } = runJsdom(page, `function restNotificationsSupported(){ return false; } function refreshHealthImportSummary(){}`,
    [extractIIFE(src, 'wireSettings') + '\nwireSettings();',
     "window.__switched = 0; document.getElementById('programSelector').onchange = () => { window.__switched++; }; // renderProgramSelector's handler: test-today-relocations.js"]);
  const doc = window.document;
  let taps = 0;
  doc.getElementById('settingsCog').click(); taps++;
  const sel = doc.getElementById('programSelector');
  assert.ok(doc.getElementById('settingsOverlay').classList.contains('active') && sel.closest('#settingsOverlay'), 'one tap: Settings, with the picker in it');
  sel.dispatchEvent(new window.Event('change')); taps++;
  assert.strictEqual(window.__switched, 1, 'the second: the switch');
  assert.ok(taps <= PARENT_TAPS.changeProgram, `changeProgram: ${taps} > ${PARENT_TAPS.changeProgram}`);
});

run();
