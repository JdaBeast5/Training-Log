'use strict';
// Behavioral coverage for computeStreak. Tier 1: the streak badge is one of
// the first things shown on Today, and its logic (today-or-yesterday, walk
// backward until a gap) is easy to get subtly wrong at the boundaries.
//
// getTodayKey() reads the real system clock with no injection point, so
// rather than fake "today", every test date is built relative to the REAL
// today via the extracted dateKeyMinusDays — deterministic regardless of
// what date this suite actually runs on.
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'dateKeyMinusDays'),
  extractFunction(src, 'computeStreak'),
];

function storageSetup(dates){
  return `
    var window = {
      storage: {
        get: async (key)=>{
          if(key === 'activity-dates') return { value: JSON.stringify(${JSON.stringify(dates)}) };
          return null;
        },
      },
    };
  `;
}

const { test, run } = makeRunner('test-streak.js');

test('no activity history at all -> streak is 0', async (assert)=>{
  const [streak] = await runSandboxAsync([storageSetup([]), ...chunks], `__capture.push(await computeStreak());`);
  assert.strictEqual(streak, 0);
});

test('5 consecutive days ending today -> streak is 5', async (assert)=>{
  const [streak] = await runSandboxAsync([storageSetup([]), ...chunks], `
    var today = getTodayKey();
    var dates = [];
    for(var i = 0; i < 5; i++) dates.push(dateKeyMinusDays(today, i));
    window = { storage: { get: async (key)=> key === 'activity-dates' ? { value: JSON.stringify(dates) } : null } };
    __capture.push(await computeStreak());
  `);
  assert.strictEqual(streak, 5);
});

test('trained yesterday but not yet today -> streak still counts from yesterday (today just has not happened yet)', async (assert)=>{
  const [streak] = await runSandboxAsync([storageSetup([]), ...chunks], `
    var today = getTodayKey();
    var dates = [dateKeyMinusDays(today, 1), dateKeyMinusDays(today, 2), dateKeyMinusDays(today, 3)];
    window = { storage: { get: async (key)=> key === 'activity-dates' ? { value: JSON.stringify(dates) } : null } };
    __capture.push(await computeStreak());
  `);
  assert.strictEqual(streak, 3);
});

test('neither today nor yesterday trained -> streak is broken (0), even with older activity on record', async (assert)=>{
  const [streak] = await runSandboxAsync([storageSetup([]), ...chunks], `
    var today = getTodayKey();
    var dates = [dateKeyMinusDays(today, 2), dateKeyMinusDays(today, 3), dateKeyMinusDays(today, 4)];
    window = { storage: { get: async (key)=> key === 'activity-dates' ? { value: JSON.stringify(dates) } : null } };
    __capture.push(await computeStreak());
  `);
  assert.strictEqual(streak, 0);
});

test('a gap in the middle of history only breaks the count at the gap — streak reflects the CURRENT run, not total days ever active', async (assert)=>{
  const [streak] = await runSandboxAsync([storageSetup([]), ...chunks], `
    var today = getTodayKey();
    // today, yesterday, 2-ago are consecutive (run of 3); a gap at 3-ago;
    // then 5-ago, 6-ago are also consecutive but must NOT be counted.
    var dates = [
      dateKeyMinusDays(today, 0), dateKeyMinusDays(today, 1), dateKeyMinusDays(today, 2),
      dateKeyMinusDays(today, 5), dateKeyMinusDays(today, 6),
    ];
    window = { storage: { get: async (key)=> key === 'activity-dates' ? { value: JSON.stringify(dates) } : null } };
    __capture.push(await computeStreak());
  `);
  assert.strictEqual(streak, 3, 'must count only the unbroken run through today, not all 5 logged days');
});

// ---- v3.566 (MKT-01): consistency counts training weeks, not consecutive days.
// Real computeWeekStreak, mondayOf, dateKeyMinusDays and checkStreakMilestone
// with a stateful stub storage and a fixed today (Wednesday 2026-11-18, so the
// current week starts Monday 2026-11-16).
// Sabotage: make computeWeekStreak count consecutive days (return
// computeStreak()) with the old day milestones, and criteria 1 and 2 fail.
const { extractConst } = require('./testHelpers.js');
const WEEK_CHUNKS = [extractFunction(src, 'dateKeyMinusDays'), extractFunction(src, 'mondayOf'), extractFunction(src, 'computeStreak'),
  extractFunction(src, 'computeWeekStreak'), extractConst(src, 'STREAK_MILESTONES'), extractFunction(src, 'checkStreakMilestone')];
function weekSetup(dates, pref, today){
  return `
    var __store = {'activity-dates': JSON.stringify(${JSON.stringify(dates)})}, __celebrations = [];
    var window = {storage: {get: async (k) => (k in __store ? {value: __store[k]} : null), set: async (k, v) => { __store[k] = v; }}};
    var document = {getElementById: () => null};
    var daysPerWeekPref = ${JSON.stringify(pref)}, activeDay = 'd1';
    function getTodayKey(){ return ${JSON.stringify(today || '2026-11-18')}; }
    function triggerCelebration(icon, title, sub, share, card){ __celebrations.push({title, sub, headline: card.headline}); }`;
}
const plus = (k, n) => { const d = new Date(k + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }; // UTC math, so the test's own dates never shift with the runner's time zone
const MWF = (mondays) => mondays.flatMap(m => [0, 2, 4].map(o => plus(m, o)));

test('MKT-01 criteria 1 and 5: Mon/Wed/Fri for 4 weeks with a 3-day preference is a 4-week streak; the 4-week celebration fires once, not again on a second render', async (assert)=>{
  const [r] = await runSandboxAsync([weekSetup(MWF(['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09']), 3), ...WEEK_CHUNKS], `
    const n = await computeWeekStreak(); await checkStreakMilestone(n); await checkStreakMilestone(await computeWeekStreak());
    __capture.push({n, c: __celebrations, key: __store['week-streak-last-celebrated'], old: __store['streak-last-celebrated']});`);
  assert.strictEqual(r.n, 4);
  assert.deepStrictEqual(r.c, [{title: '4 weeks in a row', sub: 'Rest days included.', headline: '4 WEEKS IN A ROW'}]);
  assert.strictEqual(r.key, '4');
  assert.strictEqual(r.old, undefined, 'the old day-based key is left alone');
});

test('MKT-01 criterion 2: 7 consecutive training days and nothing before: no celebration (the 7-day milestone is gone)', async (assert)=>{
  const days = Array.from({length: 7}, (_, i) => plus('2026-11-12', i));
  const [r] = await runSandboxAsync([weekSetup(days, null), ...WEEK_CHUNKS], `
    const n = await computeWeekStreak(); await checkStreakMilestone(n); await checkStreakMilestone(7);
    __capture.push({n, days: await computeStreak(), c: __celebrations.length});`);
  assert.strictEqual(r.days, 7, 'anchor: the day count would have hit the old 7-day milestone');
  assert.strictEqual(r.n, 2);
  assert.strictEqual(r.c, 0);
});

test('MKT-01 criterion 3: a week with 1 training date (preference unset) resets the streak at the end of that week, not during it', async (assert)=>{
  const dates = [...MWF(['2026-11-02', '2026-11-09']), '2026-11-16'];
  const [r] = await runSandboxAsync([weekSetup(dates, null, '2026-11-22'), ...WEEK_CHUNKS], `
    const during = await computeWeekStreak();
    getTodayKey = () => '2026-11-23';
    __capture.push({during, after: await computeWeekStreak()});`);
  assert.strictEqual(r.during, 2, 'Sunday of the 1-date week: still alive');
  assert.strictEqual(r.after, 0, 'the next Monday: reset');
});

test('MKT-01 criterion 4: rest days never break the streak inside a qualifying week (Mon and Thu only, preference unset)', async (assert)=>{
  const [r] = await runSandboxAsync([weekSetup(['2026-11-02', '2026-11-05', '2026-11-09', '2026-11-12'], null), ...WEEK_CHUNKS], `__capture.push(await computeWeekStreak());`);
  assert.strictEqual(r, 2);
});

test('MKT-01: the threshold is max(2, preference - 1): a 5-day preference needs 4 dates; a 1-day preference still needs 2', async (assert)=>{
  const wk = ['2026-11-09', '2026-11-10', '2026-11-11'];
  const [a] = await runSandboxAsync([weekSetup(wk, 5), ...WEEK_CHUNKS], `__capture.push(await computeWeekStreak());`);
  const [b] = await runSandboxAsync([weekSetup(wk, 4), ...WEEK_CHUNKS], `__capture.push(await computeWeekStreak());`);
  const [c] = await runSandboxAsync([weekSetup(['2026-11-09'], 1), ...WEEK_CHUNKS], `__capture.push(await computeWeekStreak());`);
  assert.deepStrictEqual([a, b, c], [0, 1, 0]);
});

run();
