'use strict';
// v3.639 (MKT-07): PR and progress cards show the gain. A weight record says
// what it beat ("+10 lb over 215 lb", under "Heaviest weight yet", summit R6);
// a lift's history shares a progress card, first e1RM to the best, with a
// sparkline drawn on the canvas.
//
// Real invocation: the real saveExSet (getExLog, todayEntryFor, isMissedSet;
// storage and its side effects stubbed) gives priorMax, and the real
// prGainDetail builds the line; the real progressCardData over a series from
// the real topSetOf and estimated1RM; the real drawStoryCard draws the line.
// Sabotage: drop the previous best (priorMax) from prGainDetail, and criterion
// 1 fails.
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-pr-gain-card.js');
const FMT = [extractConst(src, 'LB_PER_KG'), ...['toDisplayWeight', 'trimUnitNum', 'fmtWeight'].map(f => extractFunction(src, f))];

async function prDetailAfter(history, weight, reps = 5, unit = 'lb'){
  const [out] = await runSandboxAsync([...FMT, ...['normalizeExEntry', 'isMissedSet', 'todayEntryFor', 'getExLog', 'saveExSet', 'prGainDetail'].map(f => extractFunction(src, f)), `
    weightUnit = ${JSON.stringify(unit)};
    var activeProgram = 'strength', selectedLogDate = '2026-11-23';
    var __store = {'ex:strength:d1:0': ${JSON.stringify(JSON.stringify(history))}};
    var window = {storage: {get: async k => k in __store ? {value: __store[k]} : null, set: async (k, v) => { __store[k] = v; }}};
    function exKey(p, d, i){ return 'ex:' + p + ':' + d + ':' + i; }
    function isBackdating(){ return false; } function markMilestone(){} function noteRestAchieved(){}
    function recordActivity(){ return Promise.resolve(); } function renderStreak(){} function recordWorkoutTime(){} function getTodayKey(){ return '2026-11-23'; }`],
    `const r = await saveExSet('d1', 0, 0, ${weight}, '${reps}', '', null, undefined, '', 'Bench Press');
     __capture.push({isPR: r.isPR, priorMax: r.priorMax, detail: prGainDetail('Bench Press', ${weight}, r.priorMax)});`);
  return out;
}

test('criterion 1: a previous best of 215 and a new 225 PR: the detail has "+10" and "215" (from saveExSet\'s priorMax)', async (assert)=>{
  const r = await prDetailAfter([{date: '2026-11-10', sets: [{weight: 215, reps: 5}], n: 'Bench Press'}], 225);
  assert.strictEqual(r.isPR, true, 'anchor: the real PR check fired');
  assert.strictEqual(r.priorMax, 215);
  assert.strictEqual(r.detail, 'Bench Press — 225 lb · +10 lb over 215 lb');
});

test('criterion 2: a first-ever weight (no previous best) gives today\'s text exactly', async (assert)=>{
  const r = await prDetailAfter([], 225);
  assert.strictEqual(r.priorMax, null);
  assert.strictEqual(r.detail, 'Bench Press — 225 lb');
});

test('kg mode: the gain and the old best are in kg', async (assert)=>{
  const lb = kg => kg / 0.453592;
  const r = await prDetailAfter([{date: '2026-11-10', sets: [{weight: lb(100), reps: 5}], n: 'Bench Press'}], lb(105), 5, 'kg');
  assert.strictEqual(r.detail, 'Bench Press — 105 kg · +5 kg over 100 kg');
});

test('a gain too small to show is no gain: no "+0 lb over" the same number', async (assert)=>{
  const r = await prDetailAfter([{date: '2026-11-10', sets: [{weight: 220.46, reps: 5}], n: 'Bench Press'}], 220.5);
  assert.strictEqual(r.isPR, true, 'anchor: the raw values do beat');
  assert.strictEqual(r.detail, 'Bench Press — 220.5 lb');
});

test('REAL source: the PR celebration and its share card both use prGainDetail with saveExSet\'s priorMax', (assert)=>{
  assert.match(src, /const prDetail = prGainDetail\(ex\.name, toCanonicalLb\(weightValRaw\), result\.priorMax\);/);
  assert.match(src, /triggerCelebration\('trophy', bestLabel\('weight'\), prDetail, true,[^\n]*\n\s*\{icon:'trophy', headline:'NEW PR', detail: prDetail, kind:'pr'/);
});

const SERIES_LOG = [
  {date: '2026-08-31', sets: [{weight: 185, reps: 5}]},
  {date: '2026-09-21', sets: [{weight: 205, reps: 3}]},
  {date: '2026-10-19', sets: [{weight: 225, reps: 5}]},
  {date: '2026-11-23', sets: [{weight: 215, reps: 5}]},
];
async function progress(log, program = 'strength'){
  const [out] = await runSandboxAsync([...FMT, ...['isMissedSet', 'topSetOf', 'estimated1RM', 'progressCardData'].map(f => extractFunction(src, f)), `var activeDay = 'd1';`],
  `const series = ${JSON.stringify(log)}.map(e => { const t = topSetOf(e); return t ? {date: e.date, v: estimated1RM(t.weight, t.reps)} : null; }).filter(Boolean);
   __capture.push({series, card: progressCardData('Squat', series)});`);
  return out;
}

test('criterion 3: the progress card runs from the first to the best e1RM (the real estimated1RM), over the weeks between', async (assert)=>{
  const {series, card} = await progress(SERIES_LOG);
  const first = Math.round(series[0].v), best = Math.round(Math.max(...series.map(p => p.v)));
  assert.ok(best > first, 'anchor: a real gain in the fixture');
  const shown = v => String(Math.round(v * 10) / 10).replace(/\.0$/, '');
  assert.strictEqual(card.stats[0].value, `${shown(series[0].v)} → ${shown(Math.max(...series.map(p => p.v)))} lb`);
  assert.strictEqual(card.stats[1].value, '7 weeks', '31 Aug to 19 Oct, where the best is');
  assert.strictEqual(card.detail, `Squat e1RM ${shown(series[0].v)} → ${shown(Math.max(...series.map(p => p.v)))} lb in 7 weeks`);
  assert.strictEqual(card.headline, 'SQUAT E1RM');
  assert.strictEqual(JSON.stringify(card.spark), JSON.stringify(series.map(p => p.v)));
  assert.strictEqual(card.kind, 'progress');
});

test('no gain, a gain that rounds away, or a single session: no progress card', async (assert)=>{
  const [tiny] = await runSandboxAsync([...FMT, extractFunction(src, 'progressCardData'), `var activeDay = 'd1';`],
    `__capture.push(progressCardData('Squat', [{date: '2026-10-01', v: 225.31}, {date: '2026-11-01', v: 225.33}]));`);
  assert.strictEqual(tiny, null);
  assert.strictEqual((await progress([{date: '2026-10-01', sets: [{weight: 225, reps: 5}]}, {date: '2026-11-01', sets: [{weight: 205, reps: 5}]}])).card, null);
  assert.strictEqual((await progress(SERIES_LOG.slice(0, 1))).card, null);
});

test('the story card draws the sparkline (a stroke across the spot block) only when the card has one', (assert)=>{
  const ops = withSpark => {
    const { window } = runJsdom('', `
      window.__ops = [];
      const ctx = new Proxy({}, {get: (t, k) => k in t ? t[k] : (typeof k === 'string' && ['fillRect','fillText','beginPath','moveTo','lineTo','stroke','save','restore','translate','scale','measureText'].includes(k)
        ? (...a) => { window.__ops.push(k); return k === 'measureText' ? {width: 10} : undefined; } : undefined), set: (t, k, v) => { t[k] = v; return true; }});
      window.Path2D = function(){};
      window.__ctx = ctx;
      var activeDay = 'd1', activeProgram = 'strength', APP_NAME = 'Platestep';
      function dayInk(){ return 'red'; } function celebrationIconPath(){ return ''; } function drawShareCardFoot(){} function wrapCanvasText(){}`,
      [extractConst(src, 'SHARE_CARD_INKS'), extractFunction(src, 'drawStoryCard'),
       `drawStoryCard(window.__ctx, {headline: 'SQUAT E1RM', icon: 'trend', stats: [{value: '1', label: 'A'}], ${withSpark ? 'spark: [200, 220, 260],' : ''} kind: 'progress', dayId: 'd1'}, 1080, 1920);`]);
    return window.__ops.filter(o => o === 'lineTo').length;
  };
  assert.ok(ops(true) >= ops(false) + 2, 'two more line segments with a three-point spark');
});

test('REAL source: Share progress is offered in the lift history, never on a clinical program', (assert)=>{
  const body = extractFunction(src, 'buildExerciseHistoryHtml');
  assert.match(body, /\(activeProgram === 'medical' \|\| MEDICAL_STYLES\[activeProgram\]\) \? null : progressCardData\(ex\.name, e1rmSeries\)/);
  assert.match(body, /data-progress-share="\$\{shareId\}">Share progress<\/button>/);
  assert.match(body, /progressShareCards\.set\(shareId, \{name: ex\.name, series: e1rmSeries\}\);\n\s*preloadShareCardFont\(\);/, 'the series kept, the font started');
  assert.match(src, /const card = src && progressCardData\(src\.name, src\.series\);\n\s*if\(card\) shareCelebrationCard\(card, btn\.id\);/, 'the card is built at the tap');
});

run();
