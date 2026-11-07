'use strict';
// v3.515 — Training Log is renamed Liftnext (owner, 2026-11-07). Display name
// only: localStorage keys, the service-worker cache prefix and the backup
// format keep their training-log names, so nothing stored on a phone moves.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const src = readIndexSource();
const { test, run } = makeRunner('test-app-rename.js');

test('REAL head: the page title and the iOS home-screen title are Liftnext', (assert)=>{
  const doc = new JSDOM(src).window.document;
  assert.strictEqual(doc.title, 'Liftnext');
  assert.strictEqual(doc.querySelector('meta[name="apple-mobile-web-app-title"]').content, 'Liftnext');
  assert.strictEqual(doc.getElementById('headerEyebrow').textContent, 'Liftnext');
  assert.strictEqual(doc.querySelector('#userPickerOverlay .eyebrow').textContent, 'Liftnext');
});

test('REAL manifest: name and short name are Liftnext; icons are untouched', (assert)=>{
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  assert.strictEqual(m.name, 'Liftnext');
  assert.strictEqual(m.short_name, 'Liftnext');
  assert.strictEqual(m.icons.length, 4, 'anchor: the icon list is still there');
});

test('REAL invocation: verifyBackupFile names Liftnext when the data section is missing', (assert)=>{
  const { window } = runJsdom('', '', [extractConst(src, 'APP_NAME'), extractFunction(src, 'verifyBackupFile'),
    'window.__r = verifyBackupFile(JSON.stringify({version:1}));']);
  assert.strictEqual(window.__r.ok, false, 'anchor: rejected');
  assert.match(window.__r.error, /not a Liftnext backup/);
});

test('REAL source: no visible "Training Log" left outside What\'s New history and comments', (assert)=>{
  const wn = extractConst(src, 'WHATS_NEW');
  const rest = src.replace(wn, '').split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l));
  const left = rest.filter(l => l.includes('Training Log'));
  assert.deepStrictEqual(left, []);
  const ctx = {}; vm.createContext(ctx); vm.runInContext(wn.replace(/^\s*const /, 'var '), ctx);
  assert.match(ctx.WHATS_NEW['3.515'].headline, /Liftnext/);
  assert.match(ctx.WHATS_NEW['3.515'].points[0], /export a backup/, 'never tells anyone to re-add the app without a backup');
});

test('REAL sw.js: the cache keeps its training-log prefix; the offline page says Liftnext', (assert)=>{
  const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
  const v = /const VERSION = '([^']+)'/.exec(sw)[1];
  const ctx = { self: { addEventListener(){} }, caches: {}, URL, console };
  vm.createContext(ctx); vm.runInContext(sw, ctx);
  assert.strictEqual(vm.runInContext('CACHE', ctx), 'training-log-v' + v);
  assert.ok(sw.includes("'Liftnext is offline"), 'offline message');
  assert.ok(!sw.split('\n').some(l => !/^\s*\/\//.test(l) && /['"`]Training Log/.test(l)), 'no old name in a string');
});

run();
