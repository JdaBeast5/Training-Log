'use strict';
// v3.598 (UX-09a): the finish sheet. The completing set of a session opens a
// sheet in place of the "Session complete!" toast: the day, the best set if
// today holds a record (with the one it beat), sets done of planned, lifts
// and minutes (no volume: D15), a "Next time" row per exercise from the same
// suggestion engine the set fields use, Share (MKT-04's sessionShareStats)
// and Done. Clinical programs: no Share.
//
// Real invocation: the real finishSheetModel, nextTimeSuggestion,
// openFinishSheet and closeFinishSheet over the real sheet markup; the real
// reconstructAllPRs chain (readExCorpus, groupCorpusByExercise, topSetOf,
// estimated1RM) over stub storage; the real computeSuggestedSet,
// analyzeProgressionSignal, buildPastSessions and their helpers (the list
// test-rpe-safety-caps.js uses); the real sessionShareStats.
//
// Sabotage: take the session's first set instead of its top set as the best
// (topSetOf) and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-finish-sheet.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const FN_NAMES = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep',
  'analyzeProgressionSignal', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise', 'isDumbbellExercise',
  'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad', 'estimated1RM', 'recentBestE1RM',
  'buildPastSessions', 'sessionTopOf', 'topSetOf', 'isMissedSet', 'priorSetForSlot',
  'normalizeExEntry', 'parseExKey', 'canonicalExName', 'groupCorpusByExercise', 'readExCorpus', 'reconstructAllPRs',
  'sessionShareStats', 'getWorkoutTimeWindow', 'gymElapsedMs', 'escapeHtml', 'parseDateKey', 'formatDate', 'fmtDayLabel',
  'finishSheetModel', 'nextTimeSuggestion', 'openFinishSheet', 'closeFinishSheet'];
const CONST_NAMES = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS',
  'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'RPE_E1RM_LOOKBACK_SESSIONS', 'EXERCISE_CANONICAL'];

const TODAY = '2026-11-02';
const BENCH = {name: 'Bench Press', sets: '4×4-6'};
// The last set beats the prior heaviest top set (180 × 5 on Oct 26).
const BENCH_LOG = [
  {date: '2026-10-19', n: 'Bench Press', sets: [{weight: 175, reps: 5}, {weight: 175, reps: 5}]},
  {date: '2026-10-26', n: 'Bench Press', sets: [{weight: 180, reps: 5}, {weight: 180, reps: 4}]},
  {date: TODAY, n: 'Bench Press', sets: [{weight: 180, reps: 5}, {weight: 180, reps: 5}, {weight: 185, reps: 5}]},
];
const ROW_LOG = [
  {date: '2026-10-26', n: 'Barbell Row', sets: [{weight: 135, reps: 8}, {weight: 135, reps: 7}]}, // short of the top: only today's 8, 8 earns the step
  {date: TODAY, n: 'Barbell Row', sets: [{weight: 135, reps: 8}, {weight: 135, reps: 8}]},
];
const ROW = {name: 'Barbell Row', sets: '2×6-8'};

function list(rows){
  return `<div class="exercise-block">` + rows.map((r, i) => `<div class="set-row" data-set-idx="${i}"><input class="ex-input ex-weight" value="${r ? 185 : ''}"><input class="ex-input ex-reps" value="${r || ''}"></div>`).join('') + `</div>`;
}

function mount({mode = 'progression', program = 'strength', store = {'ex:strength:d1:0': BENCH_LOG, 'ex:strength:d1:1': ROW_LOG}, inputs = [[BENCH, BENCH_LOG, 'chest'], [ROW, ROW_LOG, 'back']]} = {}){
  const storeJson = {};
  for(const [k, v] of Object.entries(store)) storeJson[k] = JSON.stringify(v);
  storeJson['workout-time:' + TODAY] = JSON.stringify({first: '17:05', last: '18:02'});
  const { window } = runJsdom(extractElementById(src, 'finishSheet') + '<div id="todayView" tabindex="-1"></div><button id="upNextDayBtn"></button>'
    + `<div id="dayTitle">Upper · Strength</div><div id="exerciseList">${list([5, 5, 5, 0])}${list([8, 8])}</div>`, `
    var loadSuggestionMode = ${JSON.stringify(mode)}, activeProgram = ${JSON.stringify(program)}, activeDay = 'd1', weightUnit = 'lb', equipmentProfile = null;
    var selectedLogDate = '${TODAY}', gymModeActive = false, gymAccumMs = 0, gymStretchStart = 0;
    var COMBAT_STYLES = {}, CYCLING_STYLES = {};
    var programs = {strength: {label: 'Strength & Size', days: {d1: {exercises: [{name: 'Bench Press'}, {name: 'Barbell Row'}]}}}};
    var exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null, exCorpusGen = 0;
    const __store = ${JSON.stringify(storeJson)};
    window.storage = { list: async () => ({keys: Object.keys(__store).filter(k => k.startsWith('ex:'))}), get: async k => (k in __store ? {value: __store[k]} : null) };
    async function isDeloadWeek(){ return false; }
    async function getMesocycleWeek(){ return 2; }
    function preloadShareCardFont(){}
    window.__shared = [];
    async function shareCelebrationCard(data, btn){ window.__shared.push({data, btn}); }`,
    [...CONST_NAMES.map(n => extractConst(src, n)), ...FN_NAMES.map(n => extractFunction(src, n)),
     `document.getElementById('exerciseList')._finishInputs = ${JSON.stringify(inputs.map(([ex, log, category]) => ({ex, log, category})))};
      window.__model = () => finishSheetModel(document.getElementById('exerciseList'), '${TODAY}', activeProgram);`,
     block("document.getElementById('finishClose').addEventListener('click', closeFinishSheet);"),
     block("document.getElementById('finishDone').addEventListener('click', closeFinishSheet);"),
     block("document.getElementById('finishSheet').addEventListener('click',")]);
  const $ = id => window.document.getElementById(id);
  return { window, $, open: async () => { const m = await window.__model(); window.openFinishSheet(m); return m; } };
}
function block(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n', i));
}

test('criterion 1: the last set beat the prior heaviest top set: the sheet shows that set and the record it beat (from reconstructAllPRs)', async (assert)=>{
  const ui = mount();
  const events = await ui.window.reconstructAllPRs();
  const newest = events.find(e => e.date === TODAY);
  const beaten = events.find(e => e.name === newest.name && e.date < TODAY);
  assert.ok(newest && beaten, 'anchor: today holds a record and there is one before it');
  const m = JSON.parse(JSON.stringify(await ui.open()));
  assert.deepStrictEqual({name: m.best.name, weight: m.best.weight, reps: m.best.reps}, {name: newest.name, weight: newest.weight, reps: newest.reps});
  assert.deepStrictEqual(m.best.prior, {weight: beaten.weight, reps: beaten.reps, date: beaten.date});
  assert.strictEqual(m.best.weight, 185, 'the top set, not the first (180)');
  const best = ui.$('finishBest');
  assert.strictEqual(best.hidden, false);
  assert.strictEqual(best.querySelector('.finish-best-w').textContent, String(newest.weight));
  assert.strictEqual(best.querySelector('.finish-best-x').textContent, '×' + newest.reps);
  assert.match(best.textContent, /Heaviest weight yet · Bench Press/);
  assert.match(best.querySelector('.finish-best-was').textContent, new RegExp(`\\+5 lb on your best, ${beaten.weight} lb × ${beaten.reps} on `));
  assert.match(best.querySelector('.finish-best-was').textContent, /Oct 26/);
});

test('no record today: no best block; the totals are sets done of planned, lifts and minutes (no volume)', async (assert)=>{
  const ui = mount({store: {'ex:strength:d1:0': [{date: '2026-10-26', n: 'Bench Press', sets: [{weight: 200, reps: 5}]}, {date: TODAY, n: 'Bench Press', sets: [{weight: 185, reps: 5}]}]}});
  const m = await ui.open();
  assert.strictEqual(m.best, null);
  assert.strictEqual(ui.$('finishBest').hidden, true);
  assert.deepStrictEqual([m.sets, m.planned, m.lifts, m.minutes], [5, 6, 2, 57]);
  const labels = [...ui.$('finishTotals').querySelectorAll('.finish-total-l')].map(l => l.textContent);
  assert.deepStrictEqual(labels, ['Sets', 'Lifts', 'Minutes']);
  assert.strictEqual(ui.$('finishTotals').querySelector('.finish-total-v').textContent, '5/6');
  assert.ok(!/volume/i.test(ui.$('finishSheet').textContent), 'no volume');
});

test('criterion 3: each "Next time" row\'s load is what computeSuggestedSet gives that exercise next session (today as the latest session)', async (assert)=>{
  const ui = mount();
  const m = await ui.open();
  assert.strictEqual(m.next.length, 2, 'one row per exercise logged today');
  for(const [ex, log, category] of [[BENCH, BENCH_LOG, 'chest'], [ROW, ROW_LOG, 'back']]){
    const w = ui.window;
    const today = log.find(e => e.date === TODAY);
    const past = w.buildPastSessions(log, null);
    assert.strictEqual(past[0].date, TODAY, 'today counts as the most recent session');
    const signal = w.analyzeProgressionSignal(past, ex, category, 'strength');
    const want = w.computeSuggestedSet(w.priorSetForSlot(today, 0, ex, false), signal, false, category, ex, w.sessionTopOf(today), {e1rm: w.recentBestE1RM(past), week: 2, program: 'strength', category}, today);
    const row = m.next.find(r => r.name === ex.name);
    if(want){
      assert.deepStrictEqual({weight: row.weight, reps: row.reps}, {weight: want.weight, reps: want.reps}, ex.name);
    } else {
      // No change to make: the set fields ghost today's own first set, and so does Next time.
      const basis = w.priorSetForSlot(today, 0, ex, false);
      assert.deepStrictEqual({weight: row.weight, reps: row.reps, reason: row.reason}, {weight: w.toDisplayWeight(basis.weight), reps: basis.reps, reason: 'hold'}, ex.name + ' holds');
    }
  }
  // Barbell Row hit the top (8, 8) twice: an increase, said so.
  const row = m.next.find(r => r.name === 'Barbell Row');
  assert.strictEqual(row.reason, 'increase');
  assert.ok(row.weight > 135);
  const rendered = [...ui.$('finishNext').querySelectorAll('.finish-next-row')].map(r => r.querySelector('.finish-next-load').textContent);
  assert.deepStrictEqual(rendered, JSON.parse(JSON.stringify(m.next.map(r => `${ui.window.trimUnitNum(r.weight)} lb × ${r.reps}`))));
  assert.ok(ui.$('finishNext').querySelector('.finish-next-why').textContent.length > 10, 'each with its one-line reason');
});

test('criterion 3, RPE mode: next time loads from a best that includes today\'s 185 × 5 (leaving today out gives a different load)', async (assert)=>{
  const ui = mount({mode: 'rpe'});
  const w = ui.window;
  const m = await ui.open();
  const row = m.next.find(r => r.name === 'Bench Press');
  const today = BENCH_LOG.find(e => e.date === TODAY);
  const call = (past) => w.computeSuggestedSet(w.priorSetForSlot(today, 0, BENCH, false), w.analyzeProgressionSignal(past, BENCH, 'chest', 'strength'), false, 'chest', BENCH,
    w.sessionTopOf(today), {e1rm: w.recentBestE1RM(past), week: 2, program: 'strength', category: 'chest'}, today);
  const withToday = call(w.buildPastSessions(BENCH_LOG, null)), without = call(w.buildPastSessions(BENCH_LOG));
  assert.ok(withToday && without && withToday.weight !== without.weight, `anchor: today moves the load (${withToday && withToday.weight} vs ${without && without.weight})`);
  assert.strictEqual(row.reason, 'rpe');
  assert.strictEqual(row.weight, withToday.weight, 'today counts');
  assert.match(row.words, /RPE \d/);
});

test('buildPastSessions: called as before (one argument), it still leaves out the day on screen', (assert)=>{
  const ui = mount();
  assert.ok(!ui.window.buildPastSessions(BENCH_LOG).some(s => s.date === TODAY));
  assert.ok(ui.window.buildPastSessions(BENCH_LOG, null).some(s => s.date === TODAY));
});

test('criterion 5: a labelled modal dialog with a labelled close; Done, the close, the backdrop and Escape\'s closer return focus to Today', async (assert)=>{
  const ui = mount();
  const sheet = ui.$('finishSheet');
  assert.strictEqual(sheet.getAttribute('role'), 'dialog');
  assert.strictEqual(sheet.getAttribute('aria-modal'), 'true');
  assert.strictEqual(ui.$(sheet.getAttribute('aria-labelledby')).textContent, 'Session complete');
  assert.ok(ui.$('finishClose').getAttribute('aria-label'), 'the close button is labelled');
  for(const how of ['finishDone', 'finishClose', 'backdrop']){
    await ui.open();
    assert.ok(sheet.classList.contains('active'), 'open');
    if(how === 'backdrop') sheet.dispatchEvent(new ui.window.MouseEvent('click', {bubbles: true}));
    else ui.$(how).click();
    assert.ok(!sheet.classList.contains('active'), how + ' closes it');
    assert.strictEqual(ui.window.document.activeElement, ui.$('upNextDayBtn'), how + ': focus back on Today');
  }
  const closers = new Function(extractConst(src, 'SCROLL_LOCK_OVERLAYS') + '; return SCROLL_LOCK_OVERLAYS;')();
  assert.ok(closers.includes('finishSheet'), 'in the overlay registry (Escape, focus trap, scroll lock)');
  assert.match(extractConst(src, 'OVERLAY_CLOSERS'), /finishSheet:\s*\(\)=> closeFinishSheet\(\)/);
});

test('Share sends MKT-04\'s session data; criterion 6: a clinical program gets no Share button', async (assert)=>{
  const ui = mount();
  await ui.open();
  const share = ui.$('finishShare');
  assert.strictEqual(share.hidden, false);
  share.click();
  assert.strictEqual(ui.window.__shared.length, 1);
  assert.strictEqual(ui.window.__shared[0].btn, 'finishShare');
  assert.strictEqual(ui.window.__shared[0].data.headline, 'SESSION COMPLETE');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__shared[0].data.stats.find(s => s.label === 'SETS'))), {value: '5', label: 'SETS'});
  await ui.open();
  ui.$('finishShare').click();
  assert.strictEqual(ui.window.__shared.length, 2, 'reopened: still one listener per tap');
  for(const program of ['medical', 'rehabAcl']){
    const clinical = mount({program});
    const m = await clinical.open();
    assert.strictEqual(m.share, undefined, program);
    assert.strictEqual(clinical.$('finishShare').hidden, true, program + ': no Share');
  }
});

test('criterion 7: renderWorkout calls openFinishSheet( at exactly one site, the completing click, and no longer raises the "Session complete!" toast (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const calls = [...body.matchAll(/\bopenFinishSheet\(/g)];
  assert.strictEqual(calls.length, 1, 'one site');
  const at = body.indexOf('openFinishSheet(');
  const guard = body.lastIndexOf('if(cb.checked && dayNowComplete){', at);
  assert.ok(guard > -1 && body.slice(guard, at).split('{').length - body.slice(guard, at).split('}').length === 1, 'inside the completing-click branch');
  assert.match(body.slice(at, at + 140), /^openFinishSheet\(await finishSheetModel\(document\.getElementById\('exerciseList'\), selectedLogDate, activeProgram\)\);/);
  assert.strictEqual((body.match(/'Session complete!'/g) || []).length, 0, 'the toast is gone from renderWorkout');
});

run();
