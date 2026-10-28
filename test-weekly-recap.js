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

run();
