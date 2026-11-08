'use strict';
// v3.520 (BL-68): backups never carry saved API keys (ai-api-key, usda-api-key,
// or any future "*-api-key"), and restoring a backup never overwrites, removes
// or adds one.
//
// Real invocation: the real export click handler and the real import change
// handler are extracted by literal anchor (same technique as
// test-import-backup-full-replace.js) and run against a stubbed window.storage,
// with the real isApiKeyStorageKey. The Settings note is checked in jsdom from
// the real markup.
//
// Sabotage anchor: isApiKeyStorageKey has exactly 3 real call sites (export
// skip, restore filter, keep-on-device during the wipe). Remove the export
// skip and criterion 1 fails; remove the wipe skip or the restore filter and
// criterion 2 fails.
const { readIndexSource, extractFunction, extractElementById, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');
const fs = require('fs');
const path = require('path');

const src = readIndexSource();
const indexOnly = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-backup-excludes-keys.js');

function handlerBody(start){
  const i = src.indexOf(start);
  if(i === -1) throw new Error('anchor not found: ' + start);
  const b = i + start.length;
  const e = src.indexOf('\n});', b);
  if(e === -1) throw new Error('end not found: ' + start);
  return src.slice(b, e);
}
const EXPORT_BODY = handlerBody("document.getElementById('exportDataBtn').addEventListener('click', async ()=>{");
const IMPORT_BODY = handlerBody("document.getElementById('importDataInput').addEventListener('change', async (e)=>{");
const HELPER = extractFunction(src, 'isApiKeyStorageKey');

function storeGlobals(seed){
  return `
    window = {};
    var __store = ${JSON.stringify(seed)};
    window.storage = {
      get: async (k)=>{ if(!(k in __store)) throw new Error('not found'); return {key:k, value:__store[k]}; },
      set: async (k,v)=>{ __store[k]=v; return {key:k, value:v}; },
      delete: async (k)=>{ delete __store[k]; return {key:k, deleted:true}; },
      list: async (prefix)=>{ return {keys: Object.keys(__store).filter(k=> !prefix || k.startsWith(prefix)), prefix}; },
    };
    function setTimeout(fn){ fn(); }
    function getTodayKey(){ return '2026-11-08'; }
    var SCHEMA_VERSION = 8; var APP_VERSION = '9.999'; var APP_NAME = 'Platestep';
    async function getPhotoIndex(){ return []; }
    ${HELPER}
  `;
}

const SEED = {
  'ai-api-key': 'sk-ant-SECRET',
  'usda-api-key': 'USDA-SECRET',
  'future-service-api-key': 'FUTURE-SECRET',
  'weight-log': '[{"date":"2026-11-01","weight":180}]',
  'ex:strength:d1:0': '[{"date":"2026-11-02","sets":[]}]',
  'user-profile': '{"name":"Jordan"}',
  'theme': 'dark',
};

test('criterion 1: a real export over a store holding API keys writes JSON with no key, and every other key present', async (assert)=>{
  const [r] = await runSandboxAsync([], `
    ${storeGlobals(SEED)}
    var userProfile = {name: 'Jordan'};
    function renderTodayInsights(){}
    var __blobText = null;
    function Blob(parts){ __blobText = parts.join(''); }
    var URL = { createObjectURL: ()=> 'blob:x', revokeObjectURL: ()=>{} };
    var __btn = {textContent: 'Export my data'};
    var document = {
      getElementById: ()=> __btn,
      createElement: ()=> ({ click(){}, set href(v){}, set download(v){} }),
      body: { appendChild(){}, removeChild(){} },
    };
    await (async ()=>{ ${EXPORT_BODY} })();
    __capture.push({text: __blobText, btn: __btn.textContent});
  `);
  assert.ok(r.text, 'the export produced a file');
  const out = JSON.parse(r.text);
  const exported = Object.keys(out.data).sort();
  for(const k of ['ai-api-key', 'usda-api-key', 'future-service-api-key']){
    assert.ok(!(k in out.data), k + ' must not be exported');
  }
  assert.ok(!r.text.includes('SECRET'), 'no key value anywhere in the file');
  assert.strictEqual(exported.length, Object.keys(SEED).length - 3, 'exported = stored minus the 3 API keys');
  assert.deepStrictEqual(exported, ['ex:strength:d1:0', 'theme', 'user-profile', 'weight-log']);
  assert.strictEqual(out.data['weight-log'], SEED['weight-log']);
});

function importRun(deviceSeed, backupData){
  return runSandboxAsync([], `
    ${storeGlobals(deviceSeed)}
    async function photoDelete(){} async function photoPut(){} function dataUrlToBlob(u){ return {u}; }
    var __confirmMsg = null; function confirm(m){ __confirmMsg = m; return true; }
    var location = { reload: ()=>{} };
    var __statusEl = {textContent: ''};
    var document = { getElementById: ()=> __statusEl };
    var __file = { text: async ()=> JSON.stringify({schemaVersion: 8, exportedAt: '2026-10-01T00:00:00.000Z', profileName: 'Jordan', data: ${JSON.stringify(backupData)}}) };
    await (async (e)=>{ ${IMPORT_BODY} })({target: {files: [__file], value: ''}});
    __capture.push({store: __store, confirm: __confirmMsg, status: __statusEl.textContent});
  `);
}

test('criterion 2: restoring an older backup that contains keys keeps the device\'s key, adds none, and still replaces everything else', async (assert)=>{
  const [r] = await importRun(
    {'ai-api-key': 'MINE', 'weight-log': '[{"device":true}]', 'stray': 'gone-after-restore'},
    {'ai-api-key': 'FROM-BACKUP', 'usda-api-key': 'FROM-BACKUP', 'weight-log': '[{"backup":true}]', 'theme': 'light'});
  assert.strictEqual(r.store['ai-api-key'], 'MINE', 'the key on the device is not overwritten');
  assert.ok(!('usda-api-key' in r.store), 'a key the device did not have is not added');
  assert.strictEqual(r.store['weight-log'], '[{"backup":true}]', 'ordinary data is restored');
  assert.strictEqual(r.store.theme, 'light');
  assert.ok(!('stray' in r.store), 'the full-replace behaviour is unchanged for everything else');
  assert.ok(/\(2 items,/.test(r.confirm), 'the confirm counts only what will be restored: ' + r.confirm.slice(0, 80));
  assert.ok(r.confirm.includes('Saved API keys on this device are kept'), 'the confirm says keys are kept');
});

test('criterion 2b: a backup holding ONLY API keys restores nothing and leaves the device alone', async (assert)=>{
  const [r] = await importRun({'ai-api-key': 'MINE', 'weight-log': 'keep'}, {'ai-api-key': 'X', 'usda-api-key': 'Y'});
  assert.deepStrictEqual(r.store, {'ai-api-key': 'MINE', 'weight-log': 'keep'});
  assert.strictEqual(r.confirm, null, 'no confirm: there is nothing to restore');
  assert.ok(/no data/i.test(r.status), r.status);
});

test('Settings (real markup): the export row says keys are not included', (assert)=>{
  const { document } = runJsdom(extractElementById(src, 'exportDataBtn') + extractElementById(src, 'exportKeysNote'), '', []);
  const note = document.getElementById('exportKeysNote');
  assert.ok(note, 'note exists');
  assert.strictEqual(note.textContent.trim(), "API keys aren't included; enter them again after restoring.");
  // It sits directly after the export button in the real source.
  const btnIdx = indexOnly.indexOf('id="exportDataBtn"');
  const noteIdx = indexOnly.indexOf('id="exportKeysNote"');
  const nextBtnIdx = indexOnly.indexOf('id="importDataBtn"');
  assert.ok(btnIdx < noteIdx && noteIdx < nextBtnIdx, 'between Export and Import');
});

test('sabotage anchor: isApiKeyStorageKey has exactly 3 real call sites, and matches only *-api-key names', async (assert)=>{
  const code = indexOnly.split('\n').map(l => { const i = l.indexOf('//'); return i >= 0 ? l.slice(0, i) : l; }).join('\n');
  const calls = (code.match(/\bisApiKeyStorageKey\s*\(/g) || []).length - 1; // minus the declaration
  assert.strictEqual(calls, 3);
  const [r] = await runSandboxAsync([HELPER], `__capture.push(['ai-api-key','usda-api-key','x-api-key','api-key-notes','weight-log','ai-api-keys'].map(isApiKeyStorageKey));`);
  assert.deepStrictEqual(r, [true, true, true, false, false, false]);
});

test('review fix: a backup whose data is only API keys but which carries photos still restores the photos', async (assert)=>{
  const [r] = await runSandboxAsync([], `
    ${storeGlobals({'ai-api-key': 'MINE'})}
    var __put = []; async function photoDelete(){} async function photoPut(id){ __put.push(id); } function dataUrlToBlob(u){ return {u}; }
    function confirm(){ return true; } var location = { reload: ()=>{} };
    var __statusEl = {textContent: ''}; var document = { getElementById: ()=> __statusEl };
    var __file = { text: async ()=> JSON.stringify({schemaVersion: 8, data: {'ai-api-key': 'X'}, photos: {'p1': 'AAAA'}}) };
    await (async (e)=>{ ${IMPORT_BODY} })({target: {files: [__file], value: ''}});
    __capture.push({put: __put, store: __store});
  `);
  assert.deepStrictEqual(r.put, ['p1']);
  assert.strictEqual(r.store['ai-api-key'], 'MINE');
  assert.deepStrictEqual(Object.keys(r.store).sort(), ['ai-api-key', 'last-backup'], 'only the existing restore stamp is written');
});

run();
