'use strict';
// Behavioral coverage for a second instance of the exact same bug fixed in
// test-resting-region-since-tracking.js, found during the same systematic
// scan of this file for every try{...}catch(e){} block that wraps BOTH a
// storage.get() and a later storage.set() together: loadActiveProgram's
// mesocycle-start backfill.
//
// window.storage.get REJECTS (throws "not found") for a key that has never
// been written, not resolve null/undefined. The backfill's own comment
// states its purpose plainly: establish 'program-cycle-start' for anyone
// who doesn't already have it. But wrapping the read AND the conditional
// write in one try/catch meant that for exactly that person — the one this
// code exists for — the read threw, the catch swallowed it, and the set()
// never ran. getMesocycleWeek() (index.html) falls back to "today" as the
// start date whenever the key is missing, which — since the key could never
// actually be created — happened on EVERY call, forever, making
// Math.floor(daysSince/7)+1 permanently return 1 and the scheduled deload
// week (every 5th week, DELOAD_CYCLE_WEEKS=5) unreachable for anyone this
// backfill was meant to help.
//
// Extracted by literal anchor (not hand-copied) so a changed real
// implementation fails this test loudly rather than silently testing stale
// logic — same technique test-superset-warmup-ramp-eligibility.js already
// established for a self-contained snippet living inside a much larger,
// heavily-dependent function.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const vm = require('vm');

const src = readIndexSource();
const { test, run } = makeRunner('test-program-cycle-start-backfill.js');

// Extracted FROM the real source by anchor, not hand-copied as a separate
// string constant — every test below runs THIS extracted snippet, so a
// change (or a regression) to the real implementation is what the "REAL
// invocation" tests actually exercise, not a hardcoded stand-in that could
// silently drift out of sync with the file and still pass.
const START_TEXT = "  let cycleStartRes = null;";
const END_TEXT = "  }";
const startIdx = src.indexOf(START_TEXT);
if(startIdx === -1) throw new Error('program-cycle-start backfill: start anchor not found');
const endIdx = src.indexOf(END_TEXT, startIdx) + END_TEXT.length;
const SNIPPET = src.slice(startIdx, endIdx);

test('sabotage-relevant: the extracted snippet is real backfill code, not an empty/wrong match', (assert)=>{
  assert.match(SNIPPET, /window\.storage\.get\('program-cycle-start'\)/, 'must contain the real read');
  assert.match(SNIPPET, /window\.storage\.set\('program-cycle-start', getTodayKey\(\)\)/, 'must contain the real write');
  assert.doesNotMatch(SNIPPET, /^\s*try\{\s*const res = await window\.storage\.get/, 'must NOT match the old, broken single-try-block shape (get and set sharing one try) — that shape is the bug this file exists to catch');
});

function makeStorageStub(seed){
  const store = {...seed};
  return {
    get: async (k)=>{ if(!(k in store)) throw new Error('not found'); return {key:k, value:store[k]}; },
    set: async (k,v)=>{ store[k]=v; return {key:k, value:v}; },
    __store: store,
  };
}

async function runBackfill(seed){
  const storage = makeStorageStub(seed);
  const context = vm.createContext({
    window: {storage},
    getTodayKey: ()=> '2026-06-15',
  });
  await vm.runInContext(`(async ()=>{\n${SNIPPET}\n})()`, context, {filename:'sandbox.js'});
  return storage.__store;
}

test('REAL invocation: on a profile that has NEVER had program-cycle-start set (the exact case this backfill exists for), the key actually gets created', async (assert)=>{
  const store = await runBackfill({});
  assert.strictEqual(store['program-cycle-start'], '2026-06-15', 'the backfill must actually create the key when it has never existed — this is the exact bug: it never could before this fix');
});

test('REAL invocation: on a profile that already has a real program-cycle-start, the backfill leaves it completely untouched', async (assert)=>{
  const store = await runBackfill({'program-cycle-start': '2025-01-01'});
  assert.strictEqual(store['program-cycle-start'], '2025-01-01', 'an existing real start date must never be overwritten by the backfill');
});

// ---- v3.584 (BL-33, M-6 part 1): the block counts only weeks you trained.
// Real getMesocycleWeek and isDeloadWeek, stub window.storage, getTodayKey fixed.
// Start Monday 2026-09-07; blocks are 7 days from there.
const START = '2026-09-07';
const dayKey = (n) => { const d = new Date(START + 'T00:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
async function meso({today, dates, manual = false, noStart = false}){
  const store = noStart ? {} : {'program-cycle-start': START};
  if(dates) store['activity-dates'] = JSON.stringify(dates.map(dayKey));
  const { window } = runJsdom('', `
    var manualDeloadEnabled = ${manual};
    const __s = ${JSON.stringify(store)};
    window.storage = { get: async k => { if(k in __s) return {value: __s[k]}; throw new Error('no key'); } };
    function getTodayKey(){ return ${JSON.stringify(dayKey(today))}; }
  `, ['const DELOAD_CYCLE_WEEKS = 5;', extractFunction(src, 'getMesocycleWeek'), extractFunction(src, 'isDeloadWeek'),
    'window.__w = getMesocycleWeek; window.__d = isDeloadWeek;']);
  return {week: await window.__w(), deload: await window.__d()};
}

test('BL-33 criterion 1: blocks 1-2 trained 3 times, block 3 off, block 4 trained twice, today in block 5: week 4 (not 5), so no deload', async (assert)=>{
  const r = await meso({today: 30, dates: [0, 2, 4, 7, 9, 11, 21, 24]});
  assert.strictEqual(r.week, 4, 'the old calendar rule gives 5');
  assert.strictEqual(r.deload, false);
  const all = await meso({today: 30, dates: [0, 2, 4, 7, 9, 11, 14, 16, 21, 24]});
  assert.deepStrictEqual(all, {week: 5, deload: true}, 'anchor: four trained blocks reach the deload');
});

test('BL-33 criterion 2: a block with one session does not count; the block in progress always does', async (assert)=>{
  assert.strictEqual((await meso({today: 16, dates: [0, 3, 8]})).week, 2, 'block 1 counts (2), block 2 (1 session) does not');
  assert.strictEqual((await meso({today: 16, dates: [0, 3, 8, 15]})).week, 2, 'sessions in the block in progress do not add a week');
  assert.strictEqual((await meso({today: 3, dates: []})).week, 1);
});

test('BL-33 criterion 3: no activity-dates key: week 1 in the first block, as the calendar rule, and no throw (also with no start)', async (assert)=>{
  assert.strictEqual((await meso({today: 5})).week, 1);
  assert.strictEqual((await meso({today: 20})).week, 1, 'past the first block, untrained weeks do not count');
  assert.strictEqual((await meso({today: 20, noStart: true})).week, 1);
});

test('BL-33 criterion 4: the manual deload wins regardless of the count', async (assert)=>{
  assert.strictEqual((await meso({today: 30, dates: [0, 2, 4, 7, 9, 11, 21, 24], manual: true})).deload, true);
});

run();
