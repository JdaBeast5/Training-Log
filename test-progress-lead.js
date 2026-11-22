'use strict';
// v3.621 (UX-10): Progress leads with the answer. A selector of the person's
// top 4 lifts by sessions; the selected lift's estimated max (the highest
// estimated1RM over its window of sessions) with the change from the window's
// first session to its last; one e1rmChartSvg point per session; the rate per
// week and the next prescribed set (nextTimeSuggestion → computeSuggestedSet);
// then BL-20's per-muscle ledger. The chart is one function shared with the
// exercise sheet (buildExerciseHistoryHtml): 2.5 px line, no fill, 4 gridlines.
//
// Real invocation: the real renderProgressLead, progressLeadLifts,
// progressLeadSeries, progressLeadNextLine, e1rmChartSvg, groupCorpusByExercise,
// estimated1RM, topSetOf, nextTimeSuggestion and computeSuggestedSet (with
// test-finish-sheet.js's list of their helpers), renderMuscleLedgerHtml and
// computeWeeklyMuscleSets, over the real #analysisView markup; readExCorpus is
// stubbed at the storage boundary with a fixed corpus.
//
// Criterion 3 (test-analysis-collapse.js and the jump-rail suites pass
// unchanged; group IDs and default states untouched) is those suites
// themselves, run by check.sh; this file adds that the lead is not a group,
// card or index entry.
//
// Sabotage: chart the top set's weight instead of the e1RM and criteria 1 and 2 fail.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-progress-lead.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const FN = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep',
  'analyzeProgressionSignal', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise', 'isDumbbellExercise',
  'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad', 'estimated1RM', 'recentBestE1RM',
  'buildPastSessions', 'sessionTopOf', 'topSetOf', 'isMissedSet', 'priorSetForSlot', 'normalizeExEntry', 'canonicalExName', 'groupCorpusByExercise',
  'escapeHtml', 'parseDateKey', 'formatDate', 'formatShortDate', 'nextTimeSuggestion', 'parseSetCount', 'dayInk', 'mondayOf', 'setCountOf',
  'computeWeeklyMuscleSets', 'renderMuscleLedgerHtml',
  'e1rmChartSvg', 'progressLeadSeries', 'progressLeadHome', 'progressLeadLifts', 'progressLeadNextLine', 'renderProgressLead'];
const CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS',
  'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'RPE_E1RM_LOOKBACK_SESSIONS', 'EXERCISE_CANONICAL', 'DAY_INKS', 'LEDGER_MUSCLES',
  'EXERCISE_MUSCLES', 'LEDGER_FLOOR', 'PROGRESS_LEAD_SESSIONS', 'COMPOUND_CATEGORIES'];

const BENCH = {name: 'Bench Press', sets: '4×4-6'};
// Ten Bench sessions, climbing; the last at 160 with 6, 6, 5, 5 (BL-08 holds until all 4 reach 6).
const BENCH_LOG = [
  ['2026-09-15', 140, [6, 6, 6, 6]], ['2026-09-19', 145, [6, 6, 5, 5]], ['2026-09-23', 145, [6, 6, 6, 6]], ['2026-09-27', 150, [6, 5, 5, 5]],
  ['2026-10-01', 150, [6, 6, 6, 6]], ['2026-10-05', 155, [6, 6, 5, 5]], ['2026-10-09', 155, [6, 6, 6, 6]], ['2026-10-13', 160, [5, 5, 5, 4]],
  ['2026-10-17', 160, [6, 5, 5, 5]], ['2026-10-21', 160, [6, 6, 5, 5]],
].map(([date, w, reps]) => ({date, sets: reps.map(r => ({weight: w, reps: r}))}));
const lift = (name, n, w, reps = 5) => Array.from({length: n}, (_, i) => ({date: `2026-10-${String(i + 1).padStart(2, '0')}`, sets: [{weight: w + i * 5, reps}]}));
const CORPUS = [
  {exDef: BENCH, parsed: {program: 'strength', dayId: 'd1', idx: 0}, log: BENCH_LOG},
  {exDef: {name: 'Squat', sets: '4×4-6'}, parsed: {program: 'strength', dayId: 'd2', idx: 0}, log: lift('Squat', 8, 225)},
  {exDef: {name: 'Deadlift', sets: '3×3-5'}, parsed: {program: 'strength', dayId: 'd2', idx: 1}, log: lift('Deadlift', 6, 275)},
  {exDef: {name: 'Overhead Press', sets: '3×8-10'}, parsed: {program: 'strength', dayId: 'd1', idx: 2}, log: lift('Overhead Press', 5, 95, 8)},
  {exDef: {name: 'DB Curl', sets: '3×10-12'}, parsed: {program: 'strength', dayId: 'd1', idx: 4}, log: lift('DB Curl', 2, 25, 12)},
  // The most sessions of all, but an isolation lift: an estimated max from 15 reps isn't the answer.
  {exDef: {name: 'Standing Calf Raise', sets: '3×12-15'}, parsed: {program: 'strength', dayId: 'd2', idx: 3}, log: lift('Standing Calf Raise', 14, 200, 15)},
];

function mount({corpus = CORPUS, extra = ''} = {}){
  const view = extractElementById(src, 'analysisView');
  const { window } = runJsdom(view, `
    var weightUnit = 'lb', equipmentProfile = null, loadSuggestionMode = 'progression', activeProgram = 'strength', activeDay = 'd1';
    var programs = {strength: {label: 'Strength & Size', days: {d1: {plate: 'p-red', exercises: [${JSON.stringify(BENCH)}]}, d2: {plate: 'p-blue', exercises: []}}}};
    var dayOrder = ['d1', 'd2'];
    var exerciseInfo = {'Bench Press': {category: 'push'}, 'Squat': {category: 'squat'}, 'Deadlift': {category: 'hinge'}, 'Overhead Press': {category: 'push'}, 'DB Curl': {category: 'arms'}, 'Standing Calf Raise': {category: 'calves'}};
    function getTodayKey(){ return '2026-10-22'; }
    async function readExCorpus(){ return ${JSON.stringify(corpus)}; }
    async function isDeloadWeek(){ return false; }
    async function getMesocycleWeek(){ return 2; }
    ${extra}`,
    [...CONSTS.map(c => extractConst(src, c)), ...FN.map(f => extractFunction(src, f)), 'let progressLeadLift = null;', 'window.__go = renderProgressLead();']);
  return window;
}
const lead = w => w.document.getElementById('progressLead');
const pts = svg => svg.querySelector('polyline.e1rm-line').getAttribute('points').trim().split(/\s+/);

test('criterion 1: the answer figure is the max of estimated1RM over the selected lift\'s sessions, and the change is last minus first (real functions)', async (assert)=>{
  const w = mount(); await w.__go;
  const e1 = BENCH_LOG.map(e => w.eval(`estimated1RM(${JSON.stringify(e)}.sets.reduce((a, s) => (!a || s.weight > a.weight || (s.weight === a.weight && s.reps > a.reps) ? s : a), null).weight, ${JSON.stringify(e)}.sets.reduce((a, s) => (!a || s.weight > a.weight || (s.weight === a.weight && s.reps > a.reps) ? s : a), null).reps)`));
  assert.strictEqual(lead(w).hidden, false);
  assert.strictEqual(lead(w).querySelector('.pl-fig').textContent, String(Math.round(Math.max(...e1))), 'the highest estimated max');
  const delta = Math.round((e1[e1.length - 1] - e1[0]) * 10) / 10;
  assert.ok(delta > 0, 'anchor: the fixture climbs');
  assert.strictEqual(lead(w).querySelector('.pl-delta').textContent, `+${w.eval('trimUnitNum')(delta)} lb`);
  assert.strictEqual(lead(w).querySelector('.pl-over').textContent, 'over 10 sessions');
  assert.match(lead(w).querySelector('.pl-label').textContent, /Estimated max, from your heaviest set each session/);
});

test('criterion 2: the chart\'s polyline has exactly one point per session, and its last point is the latest session\'s estimated max', async (assert)=>{
  const w = mount(); await w.__go;
  const svg = lead(w).querySelector('svg.e1rm-chart');
  assert.strictEqual(pts(svg).length, BENCH_LOG.length);
  assert.strictEqual(svg.querySelectorAll('polyline').length, 1, 'one line');
  const endLabel = svg.querySelector('.e1rm-end').textContent;
  const lastTop = BENCH_LOG[BENCH_LOG.length - 1].sets[0];
  assert.strictEqual(endLabel, w.eval('trimUnitNum')(w.eval(`estimated1RM(${lastTop.weight}, ${lastTop.reps})`)), 'the end label is the last e1RM');
  // A lift with more sessions than the window shows the window's.
  const many = Array.from({length: 20}, (_, i) => ({date: `2026-08-${String(i + 1).padStart(2, '0')}`, sets: [{weight: 100 + i, reps: 5}]}));
  const w2 = mount({corpus: [{exDef: BENCH, parsed: {program: 'strength', dayId: 'd1', idx: 0}, log: many}]}); await w2.__go;
  assert.strictEqual(pts(lead(w2).querySelector('svg.e1rm-chart')).length, 12, 'the window: the last 12 sessions');
});

test('criterion 4: the selector is the top 4 lifts by sessions, as 44 px buttons with aria-pressed; choosing one shows its own answer', async (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const w = mount({extra: `document.head.insertAdjacentHTML('beforeend', '<style>' + ${JSON.stringify(CSS)} + '</style>');`}); await w.__go;
  const btns = [...lead(w).querySelectorAll('.pl-lift')];
  assert.deepStrictEqual(btns.map(b => b.textContent), ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'], 'compound lifts by sessions; the calf raise (14) and DB Curl are isolation');
  const iso = mount({corpus: CORPUS.filter(c => ['DB Curl', 'Standing Calf Raise'].includes(c.exDef.name))}); await iso.__go;
  assert.deepStrictEqual([...lead(iso).querySelectorAll('.pl-lift')].map(b => b.textContent), ['Standing Calf Raise', 'DB Curl'], 'with no compound lift logged, the others show');
  assert.deepStrictEqual(btns.map(b => b.getAttribute('aria-pressed')), ['true', 'false', 'false', 'false']);
  assert.ok(btns.every(b => b.type === 'button'));
  assert.strictEqual(w.getComputedStyle(btns[0]).minHeight, '44px');
  btns[1].click();
  await new Promise(r => setTimeout(r, 20));
  const again = [...lead(w).querySelectorAll('.pl-lift')];
  assert.deepStrictEqual(again.map(b => b.getAttribute('aria-pressed')), ['false', 'true', 'false', 'false']);
  assert.strictEqual(pts(lead(w).querySelector('svg.e1rm-chart')).length, 8, 'Squat\'s 8 sessions');
  assert.ok(lead(w).querySelector('svg.e1rm-chart').classList.contains('ink-blue'), 'in Squat\'s day ink (d2, blue)');
  assert.strictEqual(w.document.activeElement, again[1], 'focus stays on the chosen chip after the rebuild');
});

test('criterion 5: the sheet\'s chart and the lead\'s are the same real e1rmChartSvg (one definition; buildExerciseHistoryHtml calls it once); no fill, stroke-width 2.5, 4 gridlines', async (assert)=>{
  const defs = (src.match(/\nfunction e1rmChartSvg\(/g) || []).length;
  assert.strictEqual(defs, 1, 'one definition');
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((strip(extractFunction(src, 'buildExerciseHistoryHtml')).match(/\be1rmChartSvg\(/g) || []).length, 1, 'the sheet calls it once');
  assert.strictEqual((strip(extractFunction(src, 'renderProgressLead')).match(/\be1rmChartSvg\(/g) || []).length, 1, 'the lead calls it once');
  assert.ok(!/class="sparkline"/.test(extractFunction(src, 'buildExerciseHistoryHtml')), 'the sheet\'s old sparkline is gone');
  const w = mount(); await w.__go;
  const line = lead(w).querySelector('polyline.e1rm-line');
  assert.strictEqual(line.getAttribute('fill'), 'none');
  assert.strictEqual(line.getAttribute('stroke-width'), '2.5');
  assert.strictEqual(lead(w).querySelectorAll('.e1rm-grid').length, 4);
  assert.ok(!lead(w).querySelector('svg.e1rm-chart polygon, svg.e1rm-chart linearGradient'), 'no area fill');
  assert.ok(lead(w).querySelector('svg.e1rm-chart').classList.contains('ink-red'), 'Bench in its day ink (d1, red)');
  assert.strictEqual(lead(w).querySelector('svg.e1rm-chart').getAttribute('role'), 'img');
  assert.match(lead(w).querySelector('svg.e1rm-chart').getAttribute('aria-label'), /^Estimated max over 10 sessions, /);
});

test('criterion 6: "Next session …" prints the real computeSuggestedSet result for the lift: held at 160 until all 4 sets reach 6 (BL-08), never a made-up increase', async (assert)=>{
  const w = mount(); await w.__go;
  const real = w.eval(`nextTimeSuggestion({ex: ${JSON.stringify(BENCH)}, log: ${JSON.stringify(BENCH_LOG)}, category: 'push'}, '2026-10-21', 'strength', false, 2)`);
  assert.strictEqual(real.reason, 'hold', 'anchor: the real suggestion holds');
  assert.strictEqual(real.weight, 160);
  const next = lead(w).querySelector('.pl-next').textContent;
  assert.match(next, new RegExp(`Next session 160 × ${real.reps}, held there until all 4 sets reach 6\\.$`));
  assert.match(next, /^About \+\d+(\.\d)? lb a week\. /, 'the rate per week first');
});

test('the ledger (BL-20) renders in the lead, below the chart; with nothing logged the lead is hidden', async (assert)=>{
  const week = [{exDef: BENCH, parsed: {program: 'strength', dayId: 'd1', idx: 0}, log: BENCH_LOG.concat([{date: '2026-10-20', sets: [1, 2, 3, 4, 5, 6, 7].map(() => ({weight: 150, reps: 5}))}])}];
  const w = mount({corpus: week}); await w.__go;
  const ledger = lead(w).querySelector('.muscle-ledger');
  assert.ok(ledger, 'the ledger is in the lead');
  assert.ok(lead(w).querySelector('svg.e1rm-chart').compareDocumentPosition(ledger) & 4, 'after the chart');
  assert.match(ledger.textContent, /Chest\s+\d+\.\d \/ 10\+/);
  const empty = mount({corpus: []}); await empty.__go;
  assert.strictEqual(lead(empty).hidden, true);
  assert.strictEqual(lead(empty).innerHTML, '');
});

test('criterion 3 (this file\'s part): the lead is first in #analysisView and is not a group header, a card or an index entry', (assert)=>{
  const { document } = new JSDOM(`<body>${extractElementById(src, 'analysisView')}</body>`).window;
  const view = document.getElementById('analysisView');
  const el = document.getElementById('progressLead');
  assert.strictEqual(view.firstElementChild, el, 'first');
  assert.ok(!el.matches('.card, .analysis-group-header, [data-autohide], [data-group]'));
  assert.strictEqual(el.tagName, 'SECTION');
  assert.ok(el.hasAttribute('hidden'), 'hidden until renderProgressLead fills it');
});

test('review fixes: a weightless lift has no estimated max; two slots on one date are one session; "Next session" follows the newest logged session, even one of misses', async (assert)=>{
  const pull = {exDef: {name: 'Pull-ups (or assisted)', sets: '3×6-10'}, parsed: {program: 'strength', dayId: 'd1', idx: 5}, log: lift('Pull-ups (or assisted)', 15, 0, 10).map(e => ({date: e.date, sets: [{weight: 0, reps: 10}]}))};
  const w = mount({corpus: CORPUS.concat([pull]), extra: `exerciseInfo['Pull-ups (or assisted)'] = {category: 'pull'};`}); await w.__go;
  assert.ok(![...lead(w).querySelectorAll('.pl-lift')].some(b => /Pull-ups/.test(b.textContent)), 'no 0 lb lift in the selector');
  const twice = [{exDef: BENCH, parsed: {program: 'strength', dayId: 'd1', idx: 0}, log: BENCH_LOG},
    {exDef: BENCH, parsed: {program: 'strength', dayId: 'd2', idx: 1}, log: [{date: '2026-10-21', sets: [{weight: 135, reps: 8}]}]}];
  const t = mount({corpus: twice}); await t.__go;
  assert.strictEqual(pts(lead(t).querySelector('svg.e1rm-chart')).length, 10, 'one point for 10-21, not two');
  assert.strictEqual(lead(t).querySelector('.pl-over').textContent, 'over 10 sessions');
  const missed = [{exDef: BENCH, parsed: {program: 'strength', dayId: 'd1', idx: 0}, log: BENCH_LOG.concat([{date: '2026-10-24', sets: [1, 2, 3, 4].map(() => ({weight: 165, reps: 0}))}])}];
  const m = mount({corpus: missed}); await m.__go;
  const real = m.eval(`nextTimeSuggestion({ex: ${JSON.stringify(BENCH)}, log: ${JSON.stringify(missed[0].log)}, category: 'push'}, '2026-10-24', 'strength', false, 2)`);
  assert.strictEqual(pts(lead(m).querySelector('svg.e1rm-chart')).length, 10, 'anchor: the all-miss session has no point');
  assert.ok(real, 'anchor: the real suggestion from 10-24');
  assert.match(lead(m).querySelector('.pl-next').textContent, new RegExp(`Next session ${real.weight} × ${real.reps}`), 'from 10-24, not 10-21');
});

test('review fixes: a flat series gets round gridlines; long labels have room (kg and half steps)', async (assert)=>{
  const flat = [{exDef: BENCH, parsed: {program: 'strength', dayId: 'd1', idx: 0}, log: lift('Bench Press', 4, 0).map(e => ({date: e.date, sets: [{weight: 185, reps: 5}]}))}];
  const w = mount({corpus: flat}); await w.__go;
  const labels = [...lead(w).querySelectorAll('.e1rm-axis')].filter(t => t.getAttribute('dominant-baseline') === 'middle').map(t => Number(t.textContent));
  assert.strictEqual(labels.length, 4, 'anchor: the four gridline labels');
  const steps = labels.slice(1).map((v, i) => v - labels[i]);
  assert.ok(steps.every(s => s >= 2), 'steps of at least 2: ' + labels.join(', '));
  const src2 = extractFunction(src, 'e1rmChartSvg');
  const [L, R] = /L = (\d+), R = (\d+)/.exec(src2).slice(1).map(Number);
  assert.ok(L - 10 >= 5 * 0.6 * 20, 'room for a 5-character axis label ("227.5") at 20 units');
  assert.ok(R - 12 >= 5 * 0.6 * 22, 'room for a 5-character end label ("142.9") at 22 units');
});

run();
