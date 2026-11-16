'use strict';
// v3.578 (BL-43, owner (a) 2026-11-09): running progression from your own
// logs, render-time suggestions only, on the Running program in build weeks:
// the Long Run cap is 10% over the longest run of the last 30 days; 400m
// Repeats climb 4 -> 5 -> 6 -> 8 once every prescribed rep was logged (fewer
// holds); Tempo Run adds 2 min a build week up to 30. A deload week shows
// none of it.
//
// Real invocation: the real readExCorpus (with the real parseExKey,
// normalizeExEntry and programs) over a stub storage, longestRunFrom,
// longestRunLast30Days, runningProgressionBadge, distanceOf, cycleWeekOf,
// parseSetCount and trimUnitNum; renderWorkout can't be driven in jsdom, so
// its one call site is pinned (comments stripped), as BL-10 does.
//
// Sabotage: drop the 30-day window and criterion 1's day-31 case fails.
const vm = require('vm');
const { readIndexSource, extractFunction, extractConst, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-running-progression.js');
const TODAY = '2026-11-16';
const back = (n) => { const d = new Date(Date.UTC(2026, 10, 16 - n)); return d.toISOString().slice(0, 10); };

const CODE = [
  ...['programs', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'MEDICAL_STYLES', 'DELOAD_CYCLE_WEEKS', 'RUNNING_PROGRESSION_NAMES', 'REPEATS_LADDER'].map(c => extractConst(src, c)),
  'var exCorpusGen = 0; let exCorpusCache = null; let exCorpusCacheGen = -1; let exCorpusInflight = null;',
  ...['dateKeyMinusDays', 'parseExKey', 'normalizeExEntry', 'readExCorpus', 'distanceOf', 'cycleWeekOf', 'parseSetCount', 'trimUnitNum',
    'longestRunFrom', 'longestRunLast30Days', 'runningProgressionBadge'].map(f => extractFunction(src, f)),
].join('\n');

async function sandbox(store, body, unit = 'km'){
  const ctx = vm.createContext({console, __out: null, __store: store});
  await vm.runInContext(`(async ()=>{
    var selectedLogDate = '${TODAY}', distanceUnit = '${unit}', activeMartialArt = 'boxing', activeCyclingStyle = 'road', activeWatersportsStyle = 'surfing', activeMedicalStyle = 'hypertension';
    var window = {storage: {get: async k => (k in __store ? {value: __store[k]} : null), list: async (p) => ({keys: Object.keys(__store).filter(k => k.startsWith(p))})}};
    ${CODE}
    ${body}
  })()`, ctx);
  return JSON.parse(JSON.stringify(ctx.__out));
}
const run_ = (date, m) => ({date, sets: [{distance: m, reps: 50}]});
const strip = (h) => String(h).replace(/<[^>]+>/g, '');

test('criterion 1: longest run 10.0 km in the last 30 days gives an 11 km cap in week 2; a 10 km run only on day 31 gives no cap', async (assert)=>{
  const store = {'ex:running:d5:0': JSON.stringify([run_(back(12), 10000), run_(back(5), 8000)]), 'ex:running:d1:0': JSON.stringify([run_(back(3), 6000)])};
  const r = await sandbox(store, `const m = await longestRunLast30Days(); __out = {m, html: runningProgressionBadge({name: 'Long Run', sets: '45-60 min'}, {week: 2, inDeloadWeek: false, longestM: m})};`);
  assert.strictEqual(r.m, 10000);
  assert.strictEqual(strip(r.html), "Today's cap: 11 km (10% over your longest run in 30 days).");
  const old = await sandbox({'ex:running:d5:0': JSON.stringify([run_(back(31), 10000)])}, `const m = await longestRunLast30Days(); __out = {m, html: runningProgressionBadge({name: 'Long Run', sets: '45-60 min'}, {week: 2, inDeloadWeek: false, longestM: m})};`);
  assert.deepStrictEqual(old, {m: 0, html: ''}, 'falls back to the authored text');
  const mi = await sandbox(store, `__out = runningProgressionBadge({name: 'Long Run', sets: '45-60 min'}, {week: 2, inDeloadWeek: false, longestM: 10000});`, 'mi');
  assert.strictEqual(strip(mi), "Today's cap: 6.75 mi (10% over your longest run in 30 days).", '11 km = 6.84 mi, to the nearest 0.25');
});

test('criterion 2 (owner (a)): 400m Repeats with 6 of 6 logged suggests 8; 5 of 6 holds at 6; at 8, longer reps', async (assert)=>{
  const rep = (n) => ({date: back(7), sets: Array.from({length: n}, () => ({distance: 400, reps: 0}))});
  const r = await sandbox({}, `const ex = {name: '400m Repeats', sets: '6×400m'};
    __out = [${JSON.stringify(rep(6))}, ${JSON.stringify(rep(5))}].map(prior => runningProgressionBadge(ex, {week: 3, inDeloadWeek: false, prior}))
      .concat([runningProgressionBadge({name: '400m Repeats', sets: '8×400m'}, {week: 3, inDeloadWeek: false, prior: ${JSON.stringify(rep(8))}}),
               runningProgressionBadge({name: '400m Repeats', sets: '4×400m'}, {week: 3, inDeloadWeek: false, prior: ${JSON.stringify(rep(4))}})]);`);
  assert.deepStrictEqual(r.map(strip), ['Every rep logged last time: try 8×400m today.', 'Last time 5 of 6 reps: hold at 6×400m.',
    'Every rep logged at 8: move to 800s or 1 km reps.', 'Every rep logged last time: try 5×400m today.']);
});

test('Tempo Run: +2 min a build week from the authored 20, up to 30; week 1 shows nothing new', async (assert)=>{
  const r = await sandbox({}, `__out = [1, 2, 4, 6].map(week => runningProgressionBadge({name: 'Tempo Run', sets: '20 min'}, {week, inDeloadWeek: false}))
    .concat([runningProgressionBadge({name: 'Tempo Run', sets: '28 min'}, {week: 4, inDeloadWeek: false})]);`);
  assert.deepStrictEqual(r.map(strip), ['', 'Tempo this week: 22 min (+2 min a build week, up to 30).', 'Tempo this week: 26 min (+2 min a build week, up to 30).',
    '', 'Tempo this week: 30 min (+2 min a build week, up to 30).']);
});

test('criterion 3: in a deload week no cap or increase is shown (and week 5 of the block is the deload)', async (assert)=>{
  const r = await sandbox({}, `const rep6 = {date: '${back(7)}', sets: Array.from({length: 6}, () => ({distance: 400}))};
    __out = [runningProgressionBadge({name: 'Long Run', sets: '45-60 min'}, {week: 5, inDeloadWeek: true, longestM: 10000}),
      runningProgressionBadge({name: '400m Repeats', sets: '6×400m'}, {week: 10, inDeloadWeek: true, prior: rep6}),
      runningProgressionBadge({name: 'Tempo Run', sets: '20 min'}, {week: 5, inDeloadWeek: false}),
      runningProgressionBadge({name: 'Long Run', sets: '45-60 min'}, {week: 6, inDeloadWeek: false, longestM: 10000})];`);
  assert.deepStrictEqual(r.slice(0, 3), ['', '', '']);
  assert.ok(r[3].includes('11 km'), 'week 6 is build week 1 of the next block');
});

test('criterion 4: nothing is written: reading the longest run calls no storage write (the stub has none), and the keys are unchanged', async (assert)=>{
  const store = {'ex:running:d5:0': JSON.stringify([run_(back(12), 10000)]), 'other': '1'};
  const before = JSON.stringify(store);
  const r = await sandbox(store, `await longestRunLast30Days(); __out = JSON.stringify(__store);`);
  assert.strictEqual(r, before);
});

test("criterion 5: only the Running program gets these badges: the one renderWorkout call is gated on activeProgram === 'running' (source pin, comments stripped)", (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/runningProgressionBadge\(/g) || []).length, 1);
  assert.match(body, /if\(!badge && activeProgram === 'running'\) badge = runningProgressionBadge\(ex, \{week: mesoWeek, inDeloadWeek, longestM: runLongestM, prior\}\);/);
  assert.match(body, /const runLongestM = \(activeProgram === 'running' && [^;]*\) \? await longestRunLast30Days\(\) : 0;/);
});

run();
