'use strict';
// v3.635 (BIZ-26): the barcode library loads with an integrity hash. It runs
// from two CDNs in a page that holds health data; without Subresource
// Integrity a changed file there would run with access to every log.
//
// Real invocation: the real loadZXing and ZXING_SRI in jsdom, with every
// <script> it appends observed. jsdom doesn't fetch them; the test fires each
// script's own onerror/onload, as the browser would. The PR records a real
// Chromium load of both pinned URLs with this hash.
// Sabotage: drop the integrity attribute, and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-barcode-sri.js');

function page(){
  const { window } = runJsdom('', `
    window.__scripts = [];
    document.head.appendChild = el => { if(el.tagName === 'SCRIPT') window.__scripts.push(el); return el; };`,
    [extractConst(src, 'ZXING_SRI'), 'let zxingLoadPromise = null;', extractFunction(src, 'loadZXing'), 'window.loadZXing = loadZXing;']);
  return window;
}

test('criterion 1: every script the loader creates carries a sha384 integrity hash and crossorigin="anonymous"', async (assert)=>{
  const w = page();
  const done = w.loadZXing().catch(e => e);
  assert.strictEqual(w.__scripts.length, 1, 'the first CDN');
  w.__scripts[0].onerror();            // the first CDN fails (or its hash doesn't match)
  assert.strictEqual(w.__scripts.length, 2, 'then the second');
  w.__scripts[1].onerror();
  const err = await done;
  assert.match(String(err && err.message), /Could not load the barcode scanner/);
  for(const s of w.__scripts){
    assert.match(s.getAttribute('integrity') || '', /^sha384-[A-Za-z0-9+/]{64}$/, s.src);
    assert.strictEqual(s.getAttribute('crossorigin'), 'anonymous', s.src);
  }
  assert.strictEqual(w.__scripts[0].getAttribute('integrity'), w.__scripts[1].getAttribute('integrity'), 'both CDNs serve the same bytes, so one hash');
});

test('criterion 2: each URL names an exact version and the exact file (no @latest, no bare major, no package default)', async (assert)=>{
  const w = page();
  w.loadZXing().catch(()=>{});
  w.__scripts[0].onerror();
  const urls = w.__scripts.map(s => s.src);
  assert.strictEqual(urls.length, 2);
  for(const u of urls){
    assert.match(u, /@zxing\/browser@\d+\.\d+\.\d+\/umd\/zxing-browser\.min\.js$/, u);
    assert.doesNotMatch(u, /@latest|@\d+(?:\.\d+)?\//, u);
  }
});

test('criterion 3: the fallback order is unchanged: jsDelivr first, then unpkg; a load stops the chain', async (assert)=>{
  const w = page();
  const done = w.loadZXing();
  assert.match(w.__scripts[0].src, /^https:\/\/cdn\.jsdelivr\.net\//);
  w.__scripts[0].onerror();
  assert.match(w.__scripts[1].src, /^https:\/\/unpkg\.com\//);
  w.ZXingBrowser = {};
  w.__scripts[1].onload();
  await done;
  assert.strictEqual(w.__scripts.length, 2, 'no third attempt');
});

run();
