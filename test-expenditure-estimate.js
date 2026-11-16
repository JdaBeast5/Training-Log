'use strict';
// v3.577 (BL-17): expenditure estimated from your own logs (read-only).
// estimateExpenditure: over the last 28 days before today (from when both
// logs started, at least 14 days), average intake on logged days minus the
// smoothed trend's change (BL-16's computeWeightTrend) x 3,500 cal per lb, per
// day. Needs food on 80% of the days and 2 weigh-ins in each half; otherwise
// {reason}. The line under the weight chart shows it beside the formula
// figure (computeTargets(userProfile).tdee).
//
// Real invocation: the real estimateExpenditure, computeWeightTrend,
// dateKeyMinusDays, renderExpenditureLine, computeTargets, isPlaceholderBody,
// toDisplayWeight and trimUnitNum, with a fixed today and a counting storage.
//
// Sabotage: drop the logging-coverage rule and criterion 2 fails.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-expenditure-estimate.js');
const TODAY = '2026-11-16';
const back = (n) => { const d = new Date(Date.UTC(2026, 10, 16 - n)); return d.toISOString().slice(0, 10); };
const USER_PROFILE = /^let userProfile = \{[\s\S]*?\n\};/m.exec(src)[0];

function mount({profile = {age: 41, heightFt: 5, heightIn: 11, weight: 190, gender: 'male'}, saved = true} = {}){
  const { window } = runJsdom('<div id="expenditureLine" hidden></div>', `
    window.__sets = 0; window.storage = {get: async () => null, set: async () => { window.__sets++; }};
    var weightUnit = 'lb', LB_PER_KG = 0.453592;
    function getTodayKey(){ return '${TODAY}'; }`,
    [USER_PROFILE, `userProfile = {...userProfile, ...${JSON.stringify(profile)}}; let profileBodySaved = ${saved};`, extractConst(src, 'EXPENDITURE_KCAL_PER_LB'),
     ...['dateKeyMinusDays', 'computeWeightTrend', 'computeTargets', 'isPlaceholderBody', 'toDisplayWeight', 'trimUnitNum', 'estimateExpenditure', 'renderExpenditureLine'].map(f => extractFunction(src, f)),
     'window.__est = (f, w) => JSON.stringify(estimateExpenditure(f, w, getTodayKey())); window.__tdee = () => computeTargets(userProfile).tdee;']);
  return {window, est: (f, w) => JSON.parse(window.__est(f, w)), line: () => window.document.getElementById('expenditureLine')};
}
// Food: cal per day for days [from..to] back (1 = yesterday); weights: linear lb/wk from `start` days back.
const foodFor = (from, to, cal = 2400, skip = () => false) => { const f = {}; for(let n = from; n >= to; n--) if(!skip(n)) f[back(n)] = {cal, pro: 150, fat: 80, carb: 250}; return f; };
const weightsFor = (start, perWeek = -0.5, every = 1) => { const w = []; for(let n = start; n >= 0; n -= every) w.push({date: back(n), weight: 200 + (start - n) * perWeek / 7}); return w; };

test('criterion 1: 2,400 cal every day for 21 days and a settled -0.5 lb/wk trend give about 2,650 cal/day', (assert)=>{
  const r = mount().est(foodFor(21, 1), weightsFor(81));
  assert.strictEqual(r.days, 21, 'anchor: the window starts when food logging did');
  assert.ok(Math.abs(r.kcal - 2650) <= 10, JSON.stringify(r));
  assert.strictEqual(r.intake, 2400);
});

test('criterion 2: 9 of 14 days logged gives a "Log food on more days" reason', (assert)=>{
  const r = mount().est(foodFor(14, 1, 2400, n => [2, 5, 8, 11, 13].includes(n)), weightsFor(40));
  assert.ok(!('kcal' in r), JSON.stringify(r));
  assert.match(r.reason, /^Log food on more days/);
  assert.match(r.reason, /9 of the last 14/);
});

test('criterion 3: only 1 weigh-in in the window\'s first half gives a weigh-in reason, not a number', (assert)=>{
  const w = [{date: back(14), weight: 200}, ...[6, 4, 2, 1].map(n => ({date: back(n), weight: 199}))];
  const r = mount().est(foodFor(14, 1), w);
  assert.ok(!('kcal' in r));
  assert.match(r.reason, /^Weigh in at least twice a week/);
});

test('criterion 4: the line shows the estimate and the formula figure with thousands separators; placeholder details are labelled', async (assert)=>{
  const ui = mount();
  ui.window.renderExpenditureLine(foodFor(21, 1), weightsFor(81));
  const text = ui.line().textContent, tdee = ui.window.__tdee();
  assert.ok(tdee >= 1000, 'anchor: a four-digit formula figure');
  assert.match(text, /^From your logs: about 2,6[45]0 cal\/day \(formula: /);
  assert.ok(text.includes(`(formula: ${tdee.toLocaleString('en-US')})`), text);
  assert.match(text, /Intake 2,400 avg, trend −0\.5 lb\/wk\. Counts each lb as about 3,500 cal\./);
  assert.strictEqual(ui.line().hidden, false);
  const ph = mount({profile: {age: 30, heightFt: 5, heightIn: 8, weight: 160}, saved: false});
  ph.window.renderExpenditureLine(foodFor(21, 1), weightsFor(81));
  assert.match(ph.line().textContent, /\(formula, on placeholder details: /);
});

test('criterion 5: nothing is written to storage', async (assert)=>{
  const ui = mount();
  ui.est(foodFor(21, 1), weightsFor(81));
  ui.window.renderExpenditureLine(foodFor(14, 1, 2400, n => n % 3 === 0), weightsFor(40));
  assert.strictEqual(ui.window.__sets, 0);
});

test('under two weeks of both logs: a reason, not a number', (assert)=>{
  const r = mount().est(foodFor(9, 1), weightsFor(60));
  assert.match(r.reason, /^An estimate needs two weeks/);
});

run();
