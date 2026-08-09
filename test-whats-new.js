'use strict';
// Behavioral coverage for the "What's New" feature: a boot-time check that
// silently records a baseline on a fresh install (nothing to compare a first
// run against), shows only the entries newer than the last-seen version on a
// real update (capped at 5), marks it seen the moment it's shown, and a
// Settings button that reopens the most recent entries on demand without
// touching the stored last-seen value.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const compareVersionsSrc = extractFunction(src, 'compareVersions');
const checkWhatsNewSrc = extractFunction(src, 'checkWhatsNew');
const openWhatsNewSrc = extractFunction(src, 'openWhatsNew');
const closeWhatsNewSrc = extractFunction(src, 'closeWhatsNew');
const renderWhatsNewEntriesSrc = extractFunction(src, 'renderWhatsNewEntries');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const whatsNewConstSrc = extractConst(src, 'WHATS_NEW');
const runDiagnosticsSrc = extractFunction(src, 'runDiagnostics');

// The real, currently-shipped most-recent version — computed from the real
// registry rather than hardcoded, so this test doesn't silently go stale
// (and start asserting a version that's no longer the most recent) every
// time a new WHATS_NEW entry ships. This is exactly the failure mode that
// hit this test's own previous hardcoded '3.98': real, caught by the full
// suite, not assumed away.
const REAL_LATEST_VERSION = (()=>{
  const vm = require('vm');
  const context = vm.createContext({});
  vm.runInContext(`${compareVersionsSrc}\n${whatsNewConstSrc}\nthis.WHATS_NEW = WHATS_NEW; this.compareVersions = compareVersions;`, context);
  return Object.keys(context.WHATS_NEW).sort(context.compareVersions).pop();
})();

const { test, run } = makeRunner('test-whats-new.js');

test('compareVersions handles double-digit segments correctly (a naive string compare would get "3.10" vs "3.9" backwards)', (assert)=>{
  const [a, b, c, d] = runSandbox([compareVersionsSrc], `
    __capture.push(compareVersions('3.10', '3.9') > 0);
    __capture.push(compareVersions('3.9', '3.10') < 0);
    __capture.push(compareVersions('3.98', '3.98') === 0);
    __capture.push(compareVersions('4.0', '3.98') > 0);
  `);
  assert.ok(a, '3.10 must be considered newer than 3.9');
  assert.ok(b);
  assert.ok(c);
  assert.ok(d);
});

function stubs(lastSeenValue, whatsNewOverride){
  return `
    var __sets = [];
    var __opened = null;
    var window = {
      storage: {
        get: async (key)=> key === 'whats-new-last-seen' ? (${lastSeenValue === null ? 'null' : `{value: '${lastSeenValue}'}`}) : null,
        set: async (key, value)=>{ __sets.push([key, value]); },
      },
    };
    var APP_VERSION = '3.98';
    var WHATS_NEW = ${whatsNewOverride || JSON.stringify({
      '3.95': {headline:'A', points:['a']},
      '3.96': {headline:'B', points:['b']},
      '3.97': {headline:'C', points:['c']},
      '3.98': {headline:'D', points:['d']},
    })};
    function openWhatsNew(entries){ __opened = entries; }
    ${compareVersionsSrc}
  `;
}

test('first-ever run (no stored value) silently records the baseline and does NOT open the dialog', async (assert)=>{
  const [sets, opened] = await runSandboxAsync([
    stubs(null),
    checkWhatsNewSrc,
  ], `
    await checkWhatsNew();
    __capture.push(__sets, __opened);
  `);
  assert.deepStrictEqual(sets, [['whats-new-last-seen', '3.98']], 'must record the current version as seen, and only that');
  assert.strictEqual(opened, null, 'must not open the dialog on a fresh install');
});

test('REGRESSION (found via live testing, not a hypothetical): this app\'s real storage.get REJECTS with "not found" for a never-set key, it does not resolve null — a fresh install must still record its baseline rather than silently bailing out of the whole function', async (assert)=>{
  const rejectingStubs = `
    var __sets = [];
    var __opened = null;
    var window = {
      storage: {
        get: async ()=>{ throw new Error('not found'); },
        set: async (key, value)=>{ __sets.push([key, value]); },
      },
    };
    var APP_VERSION = '3.98';
    var WHATS_NEW = ${JSON.stringify({'3.98': {headline:'D', points:['d']}})};
    function openWhatsNew(entries){ __opened = entries; }
    ${compareVersionsSrc}
  `;
  const [sets, opened] = await runSandboxAsync([
    rejectingStubs,
    checkWhatsNewSrc,
  ], `
    await checkWhatsNew();
    __capture.push(__sets, __opened);
  `);
  assert.deepStrictEqual(sets, [['whats-new-last-seen', '3.98']], 'a rejecting get() must still fall through to recording the baseline, not exit early');
  assert.strictEqual(opened, null);
});

test('a real version gap opens the dialog with exactly the entries newer than last-seen, and marks the new version seen immediately', async (assert)=>{
  const [sets, opened] = await runSandboxAsync([
    stubs('3.96'),
    checkWhatsNewSrc,
  ], `
    await checkWhatsNew();
    __capture.push(__sets, __opened);
  `);
  assert.deepStrictEqual(sets, [['whats-new-last-seen', '3.98']]);
  assert.deepStrictEqual(opened.map(e=> e[0]), ['3.98', '3.97'], 'must show only entries newer than 3.96, most recent first');
});

test('caps at the 5 most recent entries when returning after a long gap', async (assert)=>{
  const bigChangelog = JSON.stringify({
    '3.90':{headline:'a',points:['x']}, '3.91':{headline:'b',points:['x']}, '3.92':{headline:'c',points:['x']},
    '3.93':{headline:'d',points:['x']}, '3.94':{headline:'e',points:['x']}, '3.95':{headline:'f',points:['x']},
    '3.96':{headline:'g',points:['x']}, '3.97':{headline:'h',points:['x']}, '3.98':{headline:'i',points:['x']},
  });
  const [opened] = await runSandboxAsync([
    stubs('3.89', bigChangelog),
    checkWhatsNewSrc,
  ], `
    await checkWhatsNew();
    __capture.push(__opened);
  `);
  assert.strictEqual(opened.length, 5, 'must cap at 5 even though 9 versions are unseen');
  assert.deepStrictEqual(opened.map(e=> e[0]), ['3.98','3.97','3.96','3.95','3.94'], 'must show the 5 MOST RECENT, most recent first');
});

test('sabotage: already-seen (stored === current) is a true no-op — no save, no open', async (assert)=>{
  const [sets, opened] = await runSandboxAsync([
    stubs('3.98'),
    checkWhatsNewSrc,
  ], `
    await checkWhatsNew();
    __capture.push(__sets, __opened);
  `);
  assert.deepStrictEqual(sets, [], 'must not write to storage when nothing changed');
  assert.strictEqual(opened, null);
});

test('REAL invocation: openWhatsNew renders each entry\'s version, headline, and points into the DOM', (assert)=>{
  const bodyHtml = `
    <div class="sub-modal-overlay" id="whatsNewOverlay">
      <div id="whatsNewBody"></div>
    </div>
  `;
  const { document, window: win } = runJsdom(bodyHtml, '', [
    escapeHtmlSrc, renderWhatsNewEntriesSrc, openWhatsNewSrc, closeWhatsNewSrc,
    `openWhatsNew([['3.98', {headline:'More performance polish', points:['A bit more smoothness tuning.']}]]);`,
  ]);
  assert.ok(document.getElementById('whatsNewOverlay').classList.contains('active'), 'opening must add .active, the established dialog convention');
  const body = document.getElementById('whatsNewBody').textContent;
  assert.ok(body.includes('3.98'));
  assert.ok(body.includes('More performance polish'));
  assert.ok(body.includes('A bit more smoothness tuning.'));
});

test('closeWhatsNew removes .active, matching the one-line exHistoryOverlay convention', (assert)=>{
  const bodyHtml = `<div class="sub-modal-overlay active" id="whatsNewOverlay"></div>`;
  const { document } = runJsdom(bodyHtml, '', [closeWhatsNewSrc, `closeWhatsNew();`]);
  assert.ok(!document.getElementById('whatsNewOverlay').classList.contains('active'));
});

test('the WHATS_NEW registry has a real entry for every version shipped so far (3.86 through the current latest), each with a non-empty headline and at least one point', (assert)=>{
  const vm = require('vm');
  const context = vm.createContext({});
  vm.runInContext(`${whatsNewConstSrc}\nthis.WHATS_NEW = WHATS_NEW;`, context);
  const changelog = context.WHATS_NEW;
  const expectedVersions = ['3.86','3.87','3.88','3.89','3.90','3.91','3.92','3.93','3.94','3.95','3.96','3.97','3.98',
    '3.99','3.100','3.101','3.102','3.103'];
  for(const v of expectedVersions){
    assert.ok(changelog[v], `missing a WHATS_NEW entry for v${v}`);
    assert.ok(changelog[v].headline && changelog[v].headline.length > 0, `v${v} needs a non-empty headline`);
    assert.ok(Array.isArray(changelog[v].points) && changelog[v].points.length > 0, `v${v} needs at least one point`);
  }
});

test('REAL invocation: the Settings "What\'s New" button opens the most recent entries and does NOT touch the stored last-seen value', async (assert)=>{
  const bodyHtml = `
    <div id="diagResults"></div>
    <div class="sub-modal-overlay" id="whatsNewOverlay"><div id="whatsNewBody"></div></div>
  `;
  const globals = `
    window.APP_VERSION = '3.98';
    window.SCHEMA_VERSION = 6;
    window.__storageSets = [];
    window.storage = { set: async (k,v)=>{ window.__storageSets.push([k,v]); } };
    window.checkBuildFreshness = async ()=> ({ok:true, stale:false, running:'3.98'});
    window.checkManifest = async ()=> ({ok:true});
    window.checkServiceWorker = async ()=> ({ok:true});
    window.checkStorageHealth = async ()=> ({ok:true});
    window.checkBackupAge = async ()=> ({ok:true});
    window.checkBootPerformance = ()=> ({ok:true});
    window.diagRow = ()=> '';
  `;
  const { document, window: win } = runJsdom(bodyHtml, globals, [
    escapeHtmlSrc, whatsNewConstSrc, compareVersionsSrc, renderWhatsNewEntriesSrc, openWhatsNewSrc,
    runDiagnosticsSrc,
    `runDiagnostics();`,
  ]);
  await new Promise(res => setTimeout(res, 30));
  const btn = document.getElementById('diagWhatsNew');
  assert.ok(btn, 'runDiagnostics must render a What\'s New button');
  btn.click();
  assert.ok(document.getElementById('whatsNewOverlay').classList.contains('active'), 'clicking it must open the dialog');
  assert.ok(document.getElementById('whatsNewBody').textContent.includes(REAL_LATEST_VERSION), 'must show the most recent entry regardless of any stored last-seen value');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(win.__storageSets)), [], 'the on-demand button must NOT write to whats-new-last-seen');
});

run();
