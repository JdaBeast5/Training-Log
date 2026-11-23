'use strict';
// v3.633 (BIZ-19): "Training since <Month YYYY>" in Settings, from the log.
// The founding-member promise (BIZ-20) needs proof of when someone started,
// and there are no accounts. The earliest date with a logged set in the ex:
// corpus is that proof; activity-dates can't be, as it's pruned to two years.
//
// Real invocation: the real readExCorpus (its cache and generation), the real
// parseExKey and programs, normalizeExEntry, entryHasLoggedSet,
// earliestTrainingDate and renderTrainingSince, over the real
// buildNamespacedStorage (the real bumpExCorpusGen on every ex: write). The
// restore case runs the real import handler (its top-level statement), with
// the reload replaced by a flag and photos stubbed at the IndexedDB boundary.
// Sabotage: read activity-dates instead of the log, and criterion 2 fails.
const { JSDOM } = require('jsdom');
const vm = require('vm');
const { makeRunner, readIndexSource, extractFunction, extractConst } = require('./testHelpers.js');

const { test, run } = makeRunner('test-training-since.js');
const src = readIndexSource();

// Two real ex: keys: the first two exercises of a real program day.
const KEYS = (() => {
  const ctx = vm.createContext({});
  vm.runInContext(extractConst(src, 'programs') + ';' + extractFunction(src, 'parseExKey') + `
    this.keys = [];
    for(const [pk, p] of Object.entries(programs)) for(const [dk, d] of Object.entries(p.days || {})){
      if(this.keys.length) break;
      const k0 = 'ex:' + pk + ':' + dk + ':0', k1 = 'ex:' + pk + ':' + dk + ':1';
      if(parseExKey(k0) && parseExKey(k1)) this.keys = [k0, k1];
    }`, ctx);
  return [...ctx.keys];
})();
const set = (date, s = [{weight: 100, reps: 5}]) => ({date, sets: s});
const IMPORT = (() => {
  const start = "document.getElementById('importDataInput').addEventListener('change'";
  const i = src.indexOf(start);
  return src.slice(i, src.indexOf('\n});', i) + 4).replace('setTimeout(()=> location.reload(), 900);', 'window.__reloaded = true;');
})();

function page(stored = {}){
  const dom = new JSDOM('<!DOCTYPE html><body><div id="trainingSinceSlot"></div><input type="file" id="importDataInput"><div id="importDataStatus"></div></body>', {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const el = w.document.createElement('script');
  el.textContent = [
    `window.__net = 0;
     window.fetch = () => { window.__net++; return Promise.reject(new Error('no network')); };
     window.navigator.sendBeacon = () => { window.__net++; return true; };
     const __XHR = window.XMLHttpRequest; window.XMLHttpRequest = function(){ window.__net++; return new __XHR(); };
     var exCorpusGen = 0; function bumpExCorpusGen(){ exCorpusGen++; }
     function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
     function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
     window.confirm = () => true; var SCHEMA_VERSION = 9;
     function isApiKeyStorageKey(){ return false; } async function getPhotoIndex(){ return []; } async function photoDelete(){} async function photoPut(){}
     function getTodayKey(){ return '2026-11-23'; }
     ${Object.entries(stored).map(([k, v]) => `localStorage.setItem('trainingLog_usr1:' + ${JSON.stringify(k)}, ${JSON.stringify(typeof v === 'string' ? v : JSON.stringify(v))});`).join('\n')}`,
    extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'), extractConst(src, 'programs'),
    'let exCorpusCache = null; let exCorpusCacheGen = -1; let exCorpusInflight = null;',
    ...['escapeHtml', 'parseExKey', 'normalizeExEntry', 'readExCorpus', 'entryHasLoggedSet', 'isRealDateKey', 'earliestTrainingDate', 'renderTrainingSince'].map(f => extractFunction(src, f)),
    `window.storage = buildNamespacedStorage('1');
     window.renderTrainingSince = renderTrainingSince;`,
    IMPORT].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const line = w => { const l = w.document.getElementById('trainingSince'); return l ? l.textContent : null; };
const LOG_2024 = {[KEYS[0]]: [set('2025-01-02'), set('2026-11-01')], [KEYS[1]]: [set('2024-03-05')]};

test('criterion 1: sets dated 2024-03-05, 2025-01-02 and 2026-11-01 render "Training since March 2024"', async (assert)=>{
  assert.strictEqual(KEYS.length, 2, 'anchor: two real ex: keys');
  const w = page(LOG_2024);
  await w.renderTrainingSince();
  assert.strictEqual(line(w), 'Training since March 2024. This date travels with your backup.');
});

test('criterion 2: an activity-dates list pruned to a later start changes nothing (the line reads the log only)', async (assert)=>{
  const w = page({...LOG_2024, 'activity-dates': ['2025-06-01', '2026-11-01']});
  await w.renderTrainingSince();
  assert.match(line(w), /^Training since March 2024\./);
});

test('an entry with no logged set (a weight with no reps, or an empty row) is not the start', async (assert)=>{
  const w = page({[KEYS[0]]: [set('2023-01-01', [{weight: 100, reps: null}]), set('2023-02-01', []), set('2024-07-10')]});
  await w.renderTrainingSince();
  assert.match(line(w), /^Training since July 2024\./);
});

test('a date that names no real day (2024-13-05, 2024-02-31) is skipped, never "Invalid Date"', async (assert)=>{
  const w = page({[KEYS[0]]: [set('2024-13-05'), set('2024-02-31'), set('2024-00-10'), set('2025-05-20')]});
  await w.renderTrainingSince();
  assert.strictEqual(line(w), 'Training since May 2025. This date travels with your backup.');
});

test('criterion 3: with no logged sets, the line is not in the DOM', async (assert)=>{
  const w = page();
  await w.renderTrainingSince();
  assert.strictEqual(w.document.getElementById('trainingSince'), null);
  assert.strictEqual(w.document.getElementById('trainingSinceSlot').innerHTML, '');
});

test('criterion 4: restoring a JSON backup with the 2024 entries into an empty profile, through the real import handler, renders the same line', async (assert)=>{
  const w = page();
  await w.renderTrainingSince();
  assert.strictEqual(line(w), null, 'empty before');
  const data = Object.fromEntries(Object.entries(LOG_2024).map(([k, v]) => [k, JSON.stringify(v)]));
  const file = {name: 'platestep-backup-me-2026-11-01.json', text: async () => JSON.stringify({exportedAt: '2026-11-01T12:00:00Z', schemaVersion: 9, profileName: 'me', data})};
  const input = w.document.getElementById('importDataInput');
  Object.defineProperty(input, 'files', {value: [file]});
  input.dispatchEvent(new w.Event('change'));
  for(let i = 0; i < 60 && !w.__reloaded; i++) await new Promise(r => setTimeout(r, 5));
  assert.ok(w.__reloaded, 'the import finished');
  await w.renderTrainingSince();
  assert.strictEqual(line(w), 'Training since March 2024. This date travels with your backup.');
});

test('criterion 5: no fetch, sendBeacon or XHR during the render, and no storage key written', async (assert)=>{
  const w = page(LOG_2024);
  const keys = () => Array.from({length: w.localStorage.length}, (_, i) => w.localStorage.key(i)).sort().join('|');
  const before = keys();
  await w.renderTrainingSince();
  assert.ok(line(w), 'anchor: it rendered');
  assert.strictEqual(w.__net, 0);
  assert.strictEqual(keys(), before);
});

test('REAL source: the slot sits with the backup controls, and opening Settings renders it (not startup, where it is hidden)', (assert)=>{
  assert.ok(src.indexOf('id="trainingSinceSlot"') < src.indexOf('id="exportDataBtn"') && src.indexOf('id="exportDataBtn"') - src.indexOf('id="trainingSinceSlot"') < 400, 'right above Export');
  assert.strictEqual((src.match(/^\s*renderTrainingSince\(\);/gm) || []).length, 0, 'no stand-alone call at startup');
  assert.match(src, /function open\(\)\{[^}]*renderTrainingSince\(\);[^}]*overlay\.classList\.add\('active'\);/, 'on opening Settings');
});

run();
