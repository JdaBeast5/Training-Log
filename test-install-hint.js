'use strict';
// v3.628 (BIZ-10): a one-time "Add to Home Screen" hint for someone using the
// app in a browser tab. It shows in Today's Priorities once a set is logged,
// never inside an installed copy, and "Hide" keeps it hidden for good
// (install-hint-dismissed, the owner's yes on 2026-11-23). iPhone and iPad
// only, and it says to export first and import in the installed copy, whose
// storage is separate from Safari's (owner, 2026-11-23).
//
// Real invocation: the real getInstallHintInsight, runningInstalled and
// getMilestone over the real buildNamespacedStorage (which throws 'not found'
// for a key never written, as on the device), with matchMedia,
// navigator.standalone, window.Capacitor and the device (user agent, platform,
// touch points) stubbed per case. The Hide test
// drives the real renderTodayInsights and clicks its real button.
// Sabotage: drop the standalone check from runningInstalled and criterion 2
// fails.
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractConst } = require('./testHelpers.js');

const { test, run } = makeRunner('test-install-hint.js');
const src = readIndexSource();
const renderSrc = extractFunction(src, 'renderTodayInsights');
const SOURCES = [...renderSrc.matchAll(/\b(get[A-Za-z]+Insight)\(\)/g)].map(m => m[1]);

// stored: keys written to the device before the page runs.
// env: {standalone (display-mode), iosStandalone, capacitor, device}.
const IPHONE = {userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1', platform: 'iPhone', maxTouchPoints: 5};
const IPADOS = {userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 5};
const MAC = {...IPADOS, maxTouchPoints: 0};
const ANDROID = {userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', maxTouchPoints: 5};
function page({stored = {}, env = {}, withRender = false, summary = false} = {}){
  const dom = new JSDOM(`<!DOCTYPE html><body>${summary ? '<span id="prioritiesSummaryText"></span>' : ''}<div class="card" id="todayInsightsCard" style="display:none"><div id="todayInsightsList"></div></div></body>`, {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  w.matchMedia = q => ({matches: q === '(display-mode: standalone)' ? !!env.standalone : false, media: q, addEventListener(){}, removeEventListener(){}});
  if(env.iosStandalone) Object.defineProperty(w.navigator, 'standalone', {value: true, configurable: true});
  for(const [k, v] of Object.entries(env.device || IPHONE)) Object.defineProperty(w.navigator, k, {value: v, configurable: true});
  if(env.capacitor) w.Capacitor = {isNativePlatform: () => true};
  const others = withRender
    ? SOURCES.filter(n => n !== 'getInstallHintInsight').map(n => `async function ${n}(){ return null; }`).join('\n')
    : '';
  const el = w.document.createElement('script');
  el.textContent = [
    `function bumpExCorpusGen(){} function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
     function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
     function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
     ${Object.entries(stored).map(([k, v]) => `localStorage.setItem('trainingLog_usr1:' + ${JSON.stringify(k)}, ${JSON.stringify(v)});`).join('\n')}`,
    extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'),
    extractConst(src, 'INSTALL_HINT_DISMISSED_KEY'),
    ...['getMilestone', 'runningInstalled', 'isAppleTouchDevice', 'getInstallHintInsight'].map(f => extractFunction(src, f)),
    ...(withRender ? [others, extractFunction(src, 'getTodayKey'), extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'),
      ...['getHiddenPriorities', 'setHiddenPriorities', 'buildSwipeItem', 'makeSwipeable', 'renderCollapsibleList'].map(f => extractFunction(src, f)), renderSrc] : []),
    `window.storage = buildNamespacedStorage('1');
     window.getInstallHintInsight = getInstallHintInsight;
     ${withRender ? 'window.renderTodayInsights = renderTodayInsights;' : ''}`].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const FIRST_SET = {'has-logged-first-set': '1'};
// A hidden card keeps its last list in the DOM, so only a shown card's rows count.
const rowIds = w => w.document.getElementById('todayInsightsCard').style.display === 'none' ? [] : [...w.document.querySelectorAll('#todayInsightsList [data-priority]')].map(r => r.dataset.priority);

test('criterion 1: in Safari on an iPhone, first set logged, not dismissed: the row, with its words and a Hide button', async (assert)=>{
  const html = await page({stored: FIRST_SET}).getInstallHintInsight();
  assert.ok(html, 'a row');
  const d = new JSDOM(`<div>${html}</div>`).window.document;
  assert.strictEqual(d.body.textContent.replace(/\s+/g, ' ').replace(/Hide$/, '').trim(), 'Install it: Export My Data in your profile first, then Share → Add to Home Screen and import the file there. It keeps your log safer and opens full screen.');
  assert.strictEqual(d.querySelectorAll('button[data-install-hint-hide]').length, 1);
});

test('criterion 2: installed (display-mode standalone): no row', async (assert)=>{
  assert.strictEqual(await page({stored: FIRST_SET, env: {standalone: true}}).getInstallHintInsight(), null);
});

test('criterion 2: iOS home-screen copy (navigator.standalone), and the Capacitor shell: no row', async (assert)=>{
  assert.strictEqual(await page({stored: FIRST_SET, env: {iosStandalone: true}}).getInstallHintInsight(), null);
  assert.strictEqual(await page({stored: FIRST_SET, env: {capacitor: true}}).getInstallHintInsight(), null, 'Android\'s WebView does not report standalone');
});

test('iPhone and iPad only: an iPad (reporting itself as a Mac, with touch) gets the row; a Mac, Android and desktop Chrome do not', async (assert)=>{
  assert.ok(await page({stored: FIRST_SET, env: {device: IPADOS}}).getInstallHintInsight(), 'iPadOS');
  assert.strictEqual(await page({stored: FIRST_SET, env: {device: MAC}}).getInstallHintInsight(), null, 'a Mac');
  assert.strictEqual(await page({stored: FIRST_SET, env: {device: ANDROID}}).getInstallHintInsight(), null, 'Android Chrome');
  assert.strictEqual(await page({stored: FIRST_SET, env: {device: {userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36', platform: 'Win32', maxTouchPoints: 0}}}).getInstallHintInsight(), null, 'desktop Chrome');
});

test('criterion 4: before the first set (the key never written, so the real storage throws "not found"): no row', async (assert)=>{
  assert.strictEqual(await page().getInstallHintInsight(), null);
});

test('criterion 3: already dismissed: no row', async (assert)=>{
  assert.strictEqual(await page({stored: {...FIRST_SET, 'install-hint-dismissed': '1'}}).getInstallHintInsight(), null);
});

test('criterion 3, REAL renderTodayInsights: Hide removes the row, stores the flag, stays gone on the next render; Undo brings it back', async (assert)=>{
  const w = page({stored: FIRST_SET, withRender: true, summary: true});
  assert.ok(SOURCES.includes('getInstallHintInsight'), 'anchor: the renderer asks for the install hint');
  await w.renderTodayInsights();
  assert.deepStrictEqual(rowIds(w), ['installHint']);
  assert.strictEqual(w.document.getElementById('prioritiesSummaryText').textContent, '1 note · Install it: Export My Data in your profile first, then Share → Add to Home Screen and import the file there. It keeps your log safer and opens full screen.', 'the summary line leaves out the Hide button');
  const btns = w.document.querySelectorAll('[data-install-hint-hide]');
  assert.strictEqual(btns.length, 1);
  btns[0].click();
  await new Promise(r => setTimeout(r, 50));
  assert.strictEqual(w.localStorage.getItem('trainingLog_usr1:install-hint-dismissed'), '1', 'stored, namespaced to the profile');
  assert.strictEqual(w.document.getElementById('todayInsightsCard').style.display, 'none', 'no rows left: the card hides');
  assert.strictEqual(w.__toast, 'Install hint hidden');
  await w.renderTodayInsights();
  assert.deepStrictEqual(rowIds(w), [], 'still gone on the next render');
  await w.__undo();
  assert.deepStrictEqual(rowIds(w), ['installHint'], 'Undo brings it back');
  assert.strictEqual(w.localStorage.getItem('trainingLog_usr1:install-hint-dismissed'), null);
});

test('REAL source: the row sits just above backup in the Priorities order', (assert)=>{
  const order = renderSrc.match(/const order = \[([^\]]+)\]/)[1].match(/'(\w+)'/g).map(s => s.slice(1, -1));
  assert.strictEqual(order.indexOf('installHint'), order.indexOf('backup') - 1);
  assert.strictEqual(order.filter(x => x === 'installHint').length, 1);
});

run();
