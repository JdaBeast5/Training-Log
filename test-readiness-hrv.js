'use strict';
// v3.638 (BL-21): HRV joins readiness, against the person's own baseline.
// ln(rMSSD), this week's mean against the mean and SD of days 8–60 before
// today, flagged below mean − 0.5×SD (Plews et al. 2013, Sports Med 43:773-81,
// doi 10.1007/s40279-013-0071-8; checked 2026-11-23). The SD has a floor of
// 0.05 ln, so a flat baseline doesn't flag a 1 ms dip.
//
// Real invocation: the real hrvBaselineFrom, hrvRecentFrom, computeReadiness,
// formatReadiness and getReadinessInsight (its data sources stubbed).
// Sabotage: drop the 0.5×SD term, and criterion 2 fails.
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-readiness-hrv.js');
const TODAY = '2026-11-23';
const CORE = [
  ...['READINESS_SLEEP_LOW', 'READINESS_RPE_HIGH', 'READINESS_DAYS_NO_REST', 'READINESS_RHR_RISE', 'READINESS_RPE_OVER_TARGET', 'READINESS_RPE_CEILING',
      'HRV_BASELINE_MIN', 'HRV_RECENT_MIN', 'HRV_DROP_SD', 'HRV_SD_FLOOR'].map(n => extractConst(src, n)),
  ...['dateKeyMinusDays', 'trimUnitNum', 'hrvBaselineFrom', 'hrvRecentFrom', 'computeReadiness', 'formatReadiness'].map(f => extractFunction(src, f)),
  'function icon(n){ return "[" + n + "]"; }',
];
const day = n => { const d = new Date(TODAY + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
// A baseline at `base` ms on days 8–(8+count−1), and `recent` ms on days 0–4.
const entries = (base, recent, count = 20) => [
  ...Array.from({length: count}, (_, i) => ({date: day(8 + i), value: base})),
  ...Array.from({length: 5}, (_, i) => ({date: day(i), value: recent})),
];
async function readiness(hrvEntries, extra = {}){
  const [r] = await runSandboxAsync(CORE, `
    const e = ${JSON.stringify(hrvEntries)};
    __capture.push(computeReadiness(Object.assign({sleepHours: null, weeklyRpe: null, daysSinceRest: 0, painRegions: [], rhrToday: null, rhrBaseline: null,
      hrv7: hrvRecentFrom(e, ${JSON.stringify(TODAY)}), hrvBaseline: hrvBaselineFrom(e, ${JSON.stringify(TODAY)})}, ${JSON.stringify(extra)})));`);
  return r;
}

test('criterion 1: a flat 60 ms baseline and a 7-day mean of 48 flag HRV, with its text', async (assert)=>{
  const r = await readiness(entries(60, 48));
  assert.ok(r, 'a result');
  assert.strictEqual(JSON.stringify(r.flags), JSON.stringify([{kind: 'hrv', text: 'HRV has run below your usual this week'}]));
  assert.strictEqual(r.level, 'note', 'one flag is a note');
});

test('criterion 2: 59 ms against the same baseline: no flag', async (assert)=>{
  const r = await readiness(entries(60, 59));
  assert.strictEqual(r, null, 'nothing else known either, so no result at all');
  const withSleep = await readiness(entries(60, 59), {sleepHours: 8});
  assert.strictEqual(JSON.stringify(withSleep.flags), '[]');
  assert.strictEqual(withSleep.level, 'good');
});

test('criterion 3: under 14 baseline readings: no flag, and `known` stays as it was', async (assert)=>{
  assert.strictEqual(await readiness(entries(60, 40, 13)), null, '13 readings: no baseline, nothing known');
  const r = await readiness(entries(60, 40, 13), {sleepHours: 8});
  assert.strictEqual(r.level, 'good');
  assert.ok(await readiness(entries(60, 40, 14)), '14 readings: the flag can show');
});

test('criterion 4: HRV plus a sleep flag gives level caution', async (assert)=>{
  const r = await readiness(entries(60, 48), {sleepHours: 5});
  assert.strictEqual(JSON.stringify(r.flags.map(f => f.kind)), JSON.stringify(['sleep', 'hrv']));
  assert.strictEqual(r.level, 'caution');
});

test('a varied baseline: the threshold is half its SD in ln units; fewer than 3 recent readings say nothing', async (assert)=>{
  const varied = [...Array.from({length: 20}, (_, i) => ({date: day(8 + i), value: i % 2 ? 50 : 70})), ...Array.from({length: 3}, (_, i) => ({date: day(i), value: 52}))];
  // ln mean ≈ ln 59.2, SD ≈ 0.17 → threshold ≈ 54.3 ms: 52 flags.
  assert.ok((await readiness(varied)).flags.some(f => f.kind === 'hrv'));
  const two = [...entries(60, 40).filter(e => e.date < day(5)), {date: day(0), value: 40}, {date: day(1), value: 40}];
  assert.strictEqual(await readiness(two.filter((e, i, a) => !(e.date === day(2) || e.date === day(3) || e.date === day(4)))), null);
});

test('REAL invocation: getReadinessInsight reads the HRV log and shows the note', async (assert)=>{
  const [html] = await runSandboxAsync([...CORE, extractFunction(src, 'getReadinessInsight'), `
    function getTodayKey(){ return ${JSON.stringify(TODAY)}; }
    async function fetchSleepEntries(){ return []; } async function fetchWorkoutDates(){ return new Set(); } async function getRestingRegions(){ return []; }
    async function fetchHealthLog(id){ return id === 'hrv' ? ${JSON.stringify(entries(60, 48))} : []; }
    async function computeWeeklyRpeAvg(){ return []; } function rhrBaselineFrom(){ return null; }
    async function computeDaysSinceRest(){ return 0; } function rpeTargetFor(){ return null; }
    async function getMesocycleWeek(){ return 1; } async function isDeloadWeek(){ return false; } var activeProgram = 'strength'; async function easierDayToday(){ return false; } var loadSuggestionMode = 'progression'; let easierDayWhy = ''; const EASIER_DAY_RPE = 8; // v3.641 (BL-32): no easier day here`],
    '__capture.push(await getReadinessInsight());');
  assert.strictEqual(html, '<b>Readiness:</b> HRV has run below your usual this week — worth keeping an eye on, but not a reason to change the plan on its own.');
});


// --- v3.641 (BL-32): "Make today easier" on a caution note, never automatic ---
// Real invocation: the real renderTodayInsights (every other insight stubbed
// to null) showing the real getReadinessInsight, a real click on its button,
// then the real buildProgressBadge and computeSuggestedSet with rpeCtx built as
// renderWorkout builds it (easier from the real easierDayToday).
// Sabotage: cap whenever readiness is caution, without the stored key, and
// criterion 1 fails.
const { JSDOM: JSDOM_E } = require('jsdom');
const RENDER = extractFunction(src, 'renderTodayInsights');
const OTHERS = [...RENDER.matchAll(/\b(get[A-Za-z]+Insight)\(\)/g)].map(m => m[1]).filter(n => n !== 'getReadinessInsight');
const RPE_FN = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay', 'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep',
  'buildProgressBadge', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight',
  'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad', 'escapeHtml', 'easierDayToday'];
const RPE_CONST = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES',
  'LOAD_INCREMENT_SCALE', 'EASIER_DAY_KEY', 'EASIER_DAY_RPE'];
function easierPage({stored = {}, sleep = 5, program = 'strength', mode = 'rpe'} = {}){
  const dom = new JSDOM_E('<!DOCTYPE html><body><div class="card" id="todayInsightsCard"><div id="todayInsightsList"></div></div></body>', {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const el = w.document.createElement('script');
  el.textContent = [
    `window.__store = ${JSON.stringify(stored)}; window.__workouts = 0;
     window.storage = {get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; }, delete: async k => { delete window.__store[k]; }};
     var loadSuggestionMode = ${JSON.stringify(mode)}, activeProgram = ${JSON.stringify(program)}, weightUnit = 'lb', equipmentProfile = null; let easierDayWhy = '';
     function getTodayKey(){ return ${JSON.stringify(TODAY)}; } function showUndoToast(){}
     // As the real one does: it draws the notes again.
     function renderWorkout(){ window.__workouts++; renderTodayInsights(); }
     ${OTHERS.map(n => `async function ${n}(){ return null; }`).join('\n')}
     async function fetchSleepEntries(){ return [{date: ${JSON.stringify(TODAY)}, hours: ${sleep}}]; } async function fetchWorkoutDates(){ return new Set(); } async function getRestingRegions(){ return []; }
     async function fetchHealthLog(id){ return id === 'hrv' ? ${JSON.stringify(entries(60, 48))} : []; }
     async function computeWeeklyRpeAvg(){ return []; } function rhrBaselineFrom(){ return null; } async function computeDaysSinceRest(){ return 0; }
     async function getMesocycleWeek(){ return 4; } async function isDeloadWeek(){ return false; }`,
    ...CORE, ...RPE_CONST.map(n => extractConst(src, n)), ...RPE_FN.map(f => extractFunction(src, f)),
    extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'), ...['getHiddenPriorities', 'setHiddenPriorities', 'buildSwipeItem', 'makeSwipeable', 'renderCollapsibleList', 'getReadinessInsight'].map(f => extractFunction(src, f)),
    RENDER,
    `window.renderTodayInsights = renderTodayInsights;
     // The badge and the suggested load for a week-4 bench, with rpeCtx built as renderWorkout builds it.
     window.badge = async (program) => {
       const easierToday = await easierDayToday();
       const ex = {name: 'Bench Press', sets: '3×5'};
       const rpeCtx = {e1rm: 300, week: 4, program, category: 'push', easier: easierToday ? (easierDayWhy || true) : null};
       const b = buildProgressBadge({ex, signal: null, inDeloadWeek: false, priorTop: null, topRep: 5, rpeCtx, sourceNote: ''});
       const sug = computeSuggestedSet({weight: 200, reps: 5}, null, false, 'push', ex, null, rpeCtx);
       return {html: b.html, weight: sug && sug.weight, at: rpe => snapToLoadable(toDisplayWeight(loadForRpeTarget(300, 5, rpe)), ex.name, 'down')};
     };`].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const buttons = (w, sel) => w.document.querySelectorAll(sel).length;

test('BL-32 criterion 1: caution, RPE mode, week 4 (RPE 9), no tap: the badge says RPE 9 and the note has one button', async (assert)=>{
  const w = easierPage();
  await w.renderTodayInsights();
  assert.strictEqual(buttons(w, '[data-easier-day]'), 1);
  const b = await w.badge('strength');
  assert.match(b.html, /RPE 9\b/);
  assert.doesNotMatch(b.html, /easier day/);
  assert.strictEqual(b.weight, b.at(9));
});

test('BL-32 criterion 2: after a real click, the badge says RPE 8 and why, the load follows, and today is stored', async (assert)=>{
  const w = easierPage();
  await w.renderTodayInsights();
  w.document.querySelector('[data-easier-day]').click();
  for(let i = 0; i < 40 && w.__store['easier-day'] !== TODAY; i++) await new Promise(r => setTimeout(r, 5));
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(w.__store['easier-day'], TODAY);
  assert.strictEqual(w.__workouts, 1, 'the workout is drawn again');
  const b = await w.badge('strength');
  assert.match(b.html, /<b>RPE 8<\/b>/);
  assert.match(b.html, /Capped at RPE 8: you chose an easier day \(slept 5h, HRV has run below your usual this week\)/);
  assert.strictEqual(b.weight, b.at(8));
  assert.notStrictEqual(b.at(8), b.at(9), 'anchor: the cap changes the load');
  // The note now says so, with Undo; Undo clears it.
  assert.strictEqual(buttons(w, '[data-easier-undo]'), 1);
  w.document.querySelector('[data-easier-undo]').click();
  for(let i = 0; i < 40 && 'easier-day' in w.__store; i++) await new Promise(r => setTimeout(r, 5));
  assert.ok(!('easier-day' in w.__store));
});

test('BL-32 criterion 3: the stored day is yesterday: RPE 9 again', async (assert)=>{
  const w = easierPage({stored: {'easier-day': day(1)}});
  assert.match((await w.badge('strength')).html, /RPE 9\b/);
});

test('BL-32 criterion 4: readiness good or note: no button', async (assert)=>{
  const note = easierPage({sleep: 8}); // HRV only: one flag, a note
  await note.renderTodayInsights();
  assert.match(note.document.getElementById('todayInsightsList').textContent, /HRV has run below/, 'anchor: the note shows');
  assert.strictEqual(buttons(note, '[data-easier-day]'), 0);
  const [good] = await runSandboxAsync([...CORE], `__capture.push(formatReadiness(computeReadiness({sleepHours: 8, weeklyRpe: null, daysSinceRest: 0, painRegions: []})))`);
  assert.doesNotMatch(JSON.stringify(good), /easier/);
});

test('BL-32: double progression (no RPE target to cap): no button', async (assert)=>{
  const w = easierPage({mode: 'progression'});
  await w.renderTodayInsights();
  assert.match(w.document.getElementById('todayInsightsList').textContent, /Slept 5h/, 'anchor: the caution note shows');
  assert.strictEqual(buttons(w, '[data-easier-day]'), 0);
});

test('BL-32: once chosen, Undo stays while readiness improves; the summary line leaves the buttons out', async (assert)=>{
  const w = easierPage({stored: {'easier-day': TODAY}, sleep: 8}); // only the HRV note now
  await w.renderTodayInsights();
  assert.strictEqual(buttons(w, '[data-easier-undo]'), 1, 'the cap is never on without its line');
  assert.match(extractFunction(src, 'renderTodayInsights'), /lead\.querySelectorAll\('\.easier-actions'\)\.forEach\(b => b\.remove\(\)\)/);
});

test('BL-32 criterion 5: a clinical day already capped at 7 stays at 7 after the tap', async (assert)=>{
  const w = easierPage({stored: {'easier-day': TODAY}, program: 'medical'});
  const b = await w.badge('medical');
  assert.match(b.html, /<b>RPE 7<\/b>/);
  assert.doesNotMatch(b.html, /Capped at RPE 8/);
});

run();
