'use strict';
// v3.632 (BIZ-09): a first-month summary in App Health Check, on the device
// only. There are no analytics (business.md §4); a tester or the owner reads
// this row off the screen. Computed from existing keys; nothing is sent and
// nothing is written. Counted from the workout-time:<date> records, written
// only for a set logged live (owner, 2026-11-23): not activity-dates, which
// also holds rest days marked done and backdated days, and is pruned.
//
// Real invocation: the real describeFirstMonth and checkFirstMonth over the
// real buildNamespacedStorage (which throws 'not found' for a key never
// written), and the real runDiagnostics rendering the row through the real
// diagRow. The other checks are stubbed: checkBuildFreshness fetches sw.js by
// design (it compares versions with the server), so criterion 3 counts the
// network calls made while the first-month row is computed and rendered.
// Sabotage: count from the newest date instead of the first, and criterion 1
// fails; read activity-dates instead, and the live-only case fails.
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractConst } = require('./testHelpers.js');

const { test, run } = makeRunner('test-diagnostics-first-month.js');
const src = readIndexSource();

// Each date as the record a live set leaves.
const live = dates => Object.fromEntries(dates.map(d => ['workout-time:' + d, JSON.stringify({first: '09:00', last: '10:00'})]));
function page(stored = {}, today = '2026-11-23'){
  const dom = new JSDOM('<!DOCTYPE html><body><div id="diagResults"></div></body>', {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const el = w.document.createElement('script');
  el.textContent = [
    `window.__net = 0;
     window.fetch = () => { window.__net++; return Promise.reject(new Error('no network')); };
     window.navigator.sendBeacon = () => { window.__net++; return true; };
     const __XHR = window.XMLHttpRequest; window.XMLHttpRequest = function(){ window.__net++; return new __XHR(); };
     function bumpExCorpusGen(){} function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
     function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
     ${Object.entries(stored).map(([k, v]) => `localStorage.setItem('trainingLog_usr1:' + ${JSON.stringify(k)}, ${JSON.stringify(v)});`).join('\n')}
     // The other rows, stubbed: each has its own coverage.
     async function checkBuildFreshness(){ return {ok:true, running:'1', served:'1'}; }
     async function checkManifest(){ return {ok:true, detail:'ok'}; } async function checkServiceWorker(){ return {ok:true, detail:'ok'}; }
     async function checkStorageHealth(){ return {ok:true, detail:'ok'}; } async function checkBackupAge(){ return {ok:true, detail:'ok'}; }
     function checkBootPerformance(){ return {ok:true, detail:'ok'}; } function icon(){ return ''; }
     const APP_VERSION = '3.632', SCHEMA_VERSION = 9, WHATS_NEW = {};
     function getTodayKey(){ return ${JSON.stringify(today)}; }`,
    extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'),
    ...['escapeHtml', 'dateKeyMinusDays', 'describeFirstMonth', 'checkFirstMonth', 'diagRow', 'runDiagnostics'].map(f => extractFunction(src, f)),
    `window.storage = buildNamespacedStorage('1');
     window.checkFirstMonth = checkFirstMonth; window.runDiagnostics = runDiagnostics;`].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const firstMonthRow = w => [...w.document.querySelectorAll('#diagResults .diag-row')].find(r => r.querySelector('b').textContent === 'First month');

test('criterion 1: 5 dates within 7 days of the first read "first 7 days: 5"; the 30-day count and the backup follow', async (assert)=>{
  const dates = ['2026-10-01', '2026-10-02', '2026-10-04', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-20', '2026-11-05'];
  const w = page({...live(dates), 'last-backup': '2026-10-15'});
  const r = await w.checkFirstMonth();
  assert.strictEqual(r.detail, 'First set: 2026-10-01 · sessions in first 7 days: 5 · first 30 days: 7 · last backup: 2026-10-15');
});

test('criterion 2: no activity (the key never written: the real storage throws "not found"): "No sessions yet"', async (assert)=>{
  const r = await page().checkFirstMonth();
  assert.strictEqual(r.detail, 'No sessions yet.');
  assert.strictEqual((await page({'activity-dates': '["2026-10-01"]'}).checkFirstMonth()).detail, 'No sessions yet.', 'activity-dates alone (a rest day ticked) is no session');
});

test('no backup ever: "last backup: never"; dates are sorted, and a stray workout-time key is ignored', async (assert)=>{
  const r = await page({...live(['2026-10-03', '2026-10-01']), 'workout-time:junk': '{}'}).checkFirstMonth();
  assert.strictEqual(r.detail, 'First set: 2026-10-01 · sessions in first 7 days: 2 · first 30 days: 2 · last backup: never');
});

test('only live sets count: rest days ticked and backdated days in activity-dates move nothing', async (assert)=>{
  // Backfilled September and a rest day ticked on 1 Oct are in activity-dates;
  // the first live set was 10 Oct.
  const r = await page({'activity-dates': JSON.stringify(['2026-09-01', '2026-09-03', '2026-10-01', '2026-10-10', '2026-10-12']), ...live(['2026-10-10', '2026-10-12'])}).checkFirstMonth();
  assert.strictEqual(r.detail, 'First set: 2026-10-10 · sessions in first 7 days: 2 · first 30 days: 2 · last backup: never');
});

test('a window still open says "so far"', async (assert)=>{
  const r = await page(live(['2026-11-20', '2026-11-22']), '2026-11-23').checkFirstMonth();
  assert.strictEqual(r.detail, 'First set: 2026-11-20 · sessions in first 7 days: 2 so far · first 30 days: 2 so far · last backup: never');
  const closed = await page(live(['2026-11-01', '2026-11-03']), '2026-11-23').checkFirstMonth();
  assert.match(closed.detail, /first 7 days: 2 · first 30 days: 2 so far/, 'the week closed, the month has not');
});

test('criterion 3, REAL runDiagnostics: the First month row renders under Backup, with no fetch, sendBeacon or XHR, and nothing written', async (assert)=>{
  const w = page(live(['2026-10-01', '2026-10-02']));
  const before = w.localStorage.length;
  await w.runDiagnostics();
  const row = firstMonthRow(w);
  assert.ok(row, 'the row is there');
  assert.match(row.textContent, /First set: 2026-10-01 · sessions in first 7 days: 2/);
  const labels = [...w.document.querySelectorAll('#diagResults .diag-row b')].map(b => b.textContent);
  assert.strictEqual(labels.indexOf('First month'), labels.indexOf('Backup') + 1);
  assert.strictEqual(w.__net, 0, 'no network calls');
  assert.strictEqual(w.localStorage.length, before, 'no key written');
});

run();
