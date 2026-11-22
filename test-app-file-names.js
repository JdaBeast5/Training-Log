'use strict';
// v3.572 (MKT-20): every saved file takes its name from one place, appSlug()
// (APP_NAME, lower-cased, spaces to hyphens). Old backups still restore: the
// import handler never reads the file name.
//
// Real invocation: the real export and import listeners (extracted as their
// top-level statements) and the real shareCelebrationCard, with appSlug and
// APP_NAME extracted from index.html; URL.createObjectURL, File and the
// anchor click stubbed at the browser boundary. Each case also runs with
// APP_NAME replaced by 'My App' in the extracted source, which proves the
// slug is used (lower-case alone would give "my app-backup-").
//
// Sabotage: restore the APP_NAME.toLowerCase() / training-log-backup- literal
// in the backup name and criterion 1 fails.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-app-file-names.js');

function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}
const APP_NAME_LINE = /^const APP_NAME = .*$/m.exec(src)[0];
const named = (name) => name ? `const APP_NAME = ${JSON.stringify(name)};` : APP_NAME_LINE;

const EXPORT = statement("document.getElementById('exportDataBtn').addEventListener('click'");
const IMPORT = statement("document.getElementById('importDataInput').addEventListener('change'").replace('setTimeout(()=> location.reload(), 900);', 'window.__reloaded = true;');

async function exportName(name){
  const { window } = runJsdom('<button id="exportDataBtn">Export</button>', `
    window.__store = {'workout:2026-11-01:strength:d1': '{}'};
    window.storage = {list: async () => ({keys: Object.keys(window.__store)}), get: async k => ({value: window.__store[k]}), set: async (k, v) => { window.__store[k] = v; }};
    window.URL.createObjectURL = () => 'blob:x'; window.URL.revokeObjectURL = () => {};
    window.__downloads = []; window.HTMLAnchorElement.prototype.click = function(){ window.__downloads.push(this.download); };
    var userProfile = {name: 'Jordan Lee'}, APP_VERSION = '3.572', SCHEMA_VERSION = 9;
    function isApiKeyStorageKey(){ return false; } async function getPhotoIndex(){ return []; }
    function getTodayKey(){ return '2026-11-16'; } function renderTodayInsights(){}`,
    [named(name), extractFunction(src, 'appSlug'), EXPORT]);
  window.document.getElementById('exportDataBtn').click();
  for(let i = 0; i < 20 && !window.__downloads.length; i++) await new Promise(r => setTimeout(r, 5));
  return window.__downloads[0];
}

test('criterion 1: the real backup export names the file <appSlug>-backup-<name>-<date>.json; with "My App" it starts my-app-backup-', async (assert)=>{
  assert.strictEqual(await exportName(null), 'platestep-backup-jordan-lee-2026-11-16.json');
  assert.strictEqual(await exportName('My App'), 'my-app-backup-jordan-lee-2026-11-16.json');
});

async function shareName(name){
  const { window } = runJsdom('<button id="shareBtn">Share</button>', `
    window.File = function(parts, n){ this.name = n; window.__fileName = n; };
    window.navigator.canShare = () => true; window.navigator.share = async () => {};
    async function buildShareCardBlob(){ return {size: 1}; }
    function getTodayKey(){ return '2026-11-16'; } var SHARE_CARD_DISPLAY_FONT = '900 10px Archivo';`,
    [named(name), extractFunction(src, 'appSlug'), extractFunction(src, 'waitForShareCardFont') /* v3.618 (MKT-18) */, extractFunction(src, 'shareCelebrationCard')]);
  await window.shareCelebrationCard({headline: 'New best', detail: 'Bench 160 x 5', kind: 'pr'}, 'shareBtn');
  return window.__fileName;
}

test('criterion 2: the real share path names the card <appSlug>-<kind>-<date>.png; with "My App" it starts my-app-', async (assert)=>{
  assert.strictEqual(await shareName(null), 'platestep-pr-2026-11-16.png');
  assert.strictEqual(await shareName('My App'), 'my-app-pr-2026-11-16.png');
});

test('criterion 3: a backup file named the old way (training-log-backup-me-2026-11-01.json) still restores through the real import handler', async (assert)=>{
  const { window } = runJsdom('<input type="file" id="importDataInput"><div id="importDataStatus"></div>', `
    window.__store = {'stale': '1'};
    window.storage = {list: async () => ({keys: Object.keys(window.__store)}), set: async (k, v) => { window.__store[k] = v; }, delete: async k => { delete window.__store[k]; }};
    window.confirm = () => true; var SCHEMA_VERSION = 9;
    function isApiKeyStorageKey(){ return false; } async function getPhotoIndex(){ return []; } async function photoDelete(){}
    function getTodayKey(){ return '2026-11-16'; }`,
    [APP_NAME_LINE, IMPORT]);
  const backup = {exportedAt: '2026-11-01T12:00:00Z', schemaVersion: 9, profileName: 'me', data: {'workout:2026-10-30:strength:d1': '{"0":true}', 'user-profile': '{"name":"me"}'}};
  const file = {name: 'training-log-backup-me-2026-11-01.json', text: async () => JSON.stringify(backup)};
  const input = window.document.getElementById('importDataInput');
  Object.defineProperty(input, 'files', {value: [file]});
  input.dispatchEvent(new window.Event('change'));
  for(let i = 0; i < 40 && !window.__reloaded; i++) await new Promise(r => setTimeout(r, 5));
  assert.strictEqual(window.__reloaded, true, window.document.getElementById('importDataStatus').textContent);
  assert.strictEqual(window.__store['workout:2026-10-30:strength:d1'], '{"0":true}');
  assert.ok(!('stale' in window.__store), 'replaced, as the dialog says');
  assert.deepStrictEqual([...new Set(IMPORT.match(/\bfile\.\w+/g))], ['file.text'], 'the handler reads the file\'s text, never its name');
});

run();
