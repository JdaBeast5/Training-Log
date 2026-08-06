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

run();
