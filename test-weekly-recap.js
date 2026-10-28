'use strict';
// Weekly recap (owner: "Let's do them all", after a review: a Monday summary
// of last week on Today, from data the app already has).
//
// v3.475 — One week's stats in one place. archiveCurrentWeek (Saved Weeks)
// computed the week's averages inline; they're now computeWeekStats, so the
// recap reads the same numbers a saved week does. No change in behaviour.
const { makeRunner, readIndexSource, extractFunction, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-weekly-recap.js');
const src = readIndexSource();

const DATA = {
  weight: [{date:'2026-10-18', weight:182}, {date:'2026-10-19', weight:181}, {date:'2026-10-23', weight:180}, {date:'2026-10-26', weight:179}],
  workouts: ['2026-10-18', '2026-10-19', '2026-10-21', '2026-10-24', '2026-10-26'],
  food: {'2026-10-19':{cal:2000, pro:150, fat:70, carb:200}, '2026-10-20':{cal:2200, pro:130, fat:80, carb:220}, '2026-10-26':{cal:9999, pro:1, fat:1, carb:1}},
  water: {'2026-10-19': 80, '2026-10-25': 100},
  sleep: [{date:'2026-10-19', hours:7}, {date:'2026-10-20', hours:6.5}, {date:'2026-10-27', hours:9}],
};
function weekWindow(){
  return runJsdom('', `
    window.fetchAllWeightEntries = async () => ${JSON.stringify(DATA.weight)};
    window.fetchWorkoutDates = async () => new Set(${JSON.stringify(DATA.workouts)});
    window.fetchFoodDays = async () => (${JSON.stringify(DATA.food)});
    window.fetchWaterDays = async () => (${JSON.stringify(DATA.water)});
    window.storage = { get: async k => k === 'sleep-log' ? { value: ${JSON.stringify(JSON.stringify(DATA.sleep))} } : null };`,
    [extractFunction(src, 'computeWeekStats')]).window;
}

test('REAL invocation (v3.475): a Monday-to-Sunday week, nothing from either side', async (assert)=>{
  const s = await weekWindow().computeWeekStats('2026-10-19');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(s)), {
    avgWeight: 180.5, workoutsCount: 3, daysLogged: 2, avgCal: 2100, avgPro: 140, avgFat: 75, avgCarb: 210, avgWater: 90, avgSleep: 6.8,
  });
});

test('REAL invocation (v3.475): an empty week has no averages, not zeros', async (assert)=>{
  const s = await weekWindow().computeWeekStats('2026-11-02');
  assert.strictEqual(s.workoutsCount, 0);
  for(const k of ['avgWeight', 'avgCal', 'avgPro', 'avgWater', 'avgSleep']) assert.strictEqual(s[k], null, k);
});

test('REAL source (v3.475): Saved Weeks reads its numbers from computeWeekStats, with no second copy of the averaging', (assert)=>{
  const archive = extractFunction(src, 'archiveCurrentWeek');
  assert.match(archive, /computeWeekStats\(todayMonday\)/);
  assert.doesNotMatch(archive, /reduce\(/, 'no inline averages left');
  assert.strictEqual((src.match(/const avgSleep = weekSleep\.length/g) || []).length, 1, 'one implementation');
});

// v3.476 — The Monday recap. A row in Today's Priorities (so it folds,
// swipes away and orders like the others), on Mondays only: last week's
// workouts, average food and sleep, and the change in average weight against
// the week before. Facts only; days logged said when it wasn't all seven.
function recap(todayKey, data){
  const d = data || DATA;
  return runJsdom('', `
    window.getTodayKey = () => '${todayKey}';
    var weightUnit = 'lb'; var LB_PER_KG = 0.453592;
    window.fetchAllWeightEntries = async () => ${JSON.stringify(d.weight)};
    window.fetchWorkoutDates = async () => new Set(${JSON.stringify(d.workouts)});
    window.fetchFoodDays = async () => (${JSON.stringify(d.food)});
    window.fetchWaterDays = async () => (${JSON.stringify(d.water)});
    window.storage = { get: async k => k === 'sleep-log' ? { value: ${JSON.stringify(JSON.stringify(d.sleep))} } : null };`,
    ['parseDateKey', 'dateKeyMinusDays', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'computeWeekStats', 'getWeeklyRecapInsight'].map(n => extractFunction(src, n))).window;
}

test('REAL invocation (v3.476): on a Monday, last week in one line', async (assert)=>{
  const row = await recap('2026-10-26').getWeeklyRecapInsight();
  assert.strictEqual(row, '<b>Last week:</b> 3 workouts · 2,100 cal and 140 g protein a day (2 days logged) · 6.8 h sleep a night · average weight −1.5 lb.',
    'week of Oct 19: avg 180.5 lb against 182 lb the week before');
});

test('REAL invocation (v3.476): any other day, nothing', async (assert)=>{
  for(const day of ['2026-10-27', '2026-10-25', '2026-10-31']) assert.strictEqual(await recap(day).getWeeklyRecapInsight(), null, day);
});

test('REAL invocation (v3.476): a Monday after an empty week says nothing; a week with only workouts says only that', async (assert)=>{
  const empty = {weight:[], workouts:[], food:{}, water:{}, sleep:[]};
  assert.strictEqual(await recap('2026-10-26', empty).getWeeklyRecapInsight(), null);
  const one = {...empty, workouts:['2026-10-21']};
  assert.strictEqual(await recap('2026-10-26', one).getWeeklyRecapInsight(), '<b>Last week:</b> 1 workout.');
});

test('REAL source (v3.476): the recap is asked for, and sits under the session heads-up', (assert)=>{
  const render = extractFunction(src, 'renderTodayInsights');
  assert.match(render, /getWeeklyRecapInsight\(\)/);
  assert.match(render, /const order = \['pregnancyHeat', 'readiness', 'sessionHeadsUp', 'weeklyRecap', 'deficit',/);
});

run();
