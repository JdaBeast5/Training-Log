'use strict';
// Behavioral coverage for a real bug found during a functional/accessibility
// audit: storageHealth.degraded was a plain boolean, set true the first time
// any write spilled to in-memory storage (quota exceeded) and never set back
// to false anywhere in the file. Once triggered even once, the "Storage is
// full" banner (renderStorageBanner) and the Settings diagnostics summary
// (checkStorageHealth) both kept reporting a problem forever — including,
// once every spilled key had successfully re-saved and storageHealth.spilled
// was back to empty, the banner literally reading "0 recent changes are
// being held in memory only", since `n` (spilled.size) was read correctly
// but the gate deciding whether to show anything at all (`degraded`) never
// noticed spilled had emptied out.
//
// Fixed two ways, both needed:
//   1. `degraded` is now a getter deriving from spilled.size>0 — impossible
//      to drift out of sync, since there is no second boolean to forget to
//      reset.
//   2. clearStorageSpill (the new shared chokepoint for both of
//      buildNamespacedStorage's set()/delete() recovery paths) re-renders
//      the banner on recovery, not just on failure — otherwise the DOM
//      banner would still sit there stale until some unrelated re-render
//      happened to come along, even with (1) fixed.
const { readIndexSource, extractFunction, extractConst, countCallSites, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-storage-banner-recovery.js');

const storageHealthSrc = extractConst(src, 'storageHealth');
const isQuotaErrorSrc = extractFunction(src, 'isQuotaError');
const noteStorageDegradedSrc = extractFunction(src, 'noteStorageDegraded');
const clearStorageSpillSrc = extractFunction(src, 'clearStorageSpill');
const buildNamespacedStorageSrc = extractFunction(src, 'buildNamespacedStorage');
const renderStorageBannerSrc = extractFunction(src, 'renderStorageBanner');

const bannerHostHtml = `
  <div class="app-banner-rail" id="appBannerRail" style="display:none">
    <div id="updateBanner"></div>
    <div id="storageBanner"></div>
  </div>
`;

// A fake QuotaExceededError, matching isQuotaError's Chrome-shaped check
// (DOMException named QuotaExceededError) so the real quota-detection logic
// stays part of what's implicitly exercised via noteStorageDegraded's real
// signature, even though this file drives noteStorageDegraded/
// clearStorageSpill directly rather than through a live localStorage quota
// failure. (Storage instances intercept arbitrary property assignment as a
// storage write per the Web Storage spec — `localStorage.setItem = fn`
// silently sets an item literally named "setItem" rather than overriding
// the method, so simulating a real quota failure through jsdom's actual
// localStorage isn't reliable. buildNamespacedStorage's own two real call
// sites into noteStorageDegraded/clearStorageSpill are covered separately,
// below, by a static call-site count instead.)
function makeQuotaError(){
  const e = new Error('The quota has been exceeded.');
  e.name = 'QuotaExceededError';
  return e;
}

test('sabotage-relevant: storageHealth.degraded has no standalone assignment anywhere in the file — it must be derived, not a hand-set flag that can drift out of sync', (assert)=>{
  assert.doesNotMatch(src, /storageHealth\.degraded\s*=[^=]/, 'no code should assign storageHealth.degraded directly; it must stay a derived getter');
  assert.match(storageHealthSrc, /get degraded\(\)/, 'storageHealth must define degraded as a getter');
});

test('sabotage-relevant: buildNamespacedStorage calls noteStorageDegraded on its quota-catch path and clearStorageSpill at both of its recovery sites (set() and delete())', (assert)=>{
  const noteCount = countCallSites(buildNamespacedStorageSrc, 'noteStorageDegraded');
  assert.strictEqual(noteCount, 1, `expected exactly 1 real noteStorageDegraded( call site (the quota catch), found ${noteCount}`);
  const clearCount = countCallSites(buildNamespacedStorageSrc, 'clearStorageSpill');
  assert.strictEqual(clearCount, 2, `expected exactly 2 real clearStorageSpill( call sites (set() success + delete()), found ${clearCount}`);
});

function setup(){
  const { window, document } = runJsdom(bannerHostHtml, '', [
    storageHealthSrc, isQuotaErrorSrc, noteStorageDegradedSrc, clearStorageSpillSrc, renderStorageBannerSrc,
    'window.storageHealth = storageHealth;',
    'window.noteStorageDegraded = noteStorageDegraded;',
    'window.clearStorageSpill = clearStorageSpill;',
    'window.isQuotaError = isQuotaError;',
  ]);
  return { window, document };
}

test('REAL invocation: noteStorageDegraded (the real quota-catch handler) marks storage degraded and renders the "Storage is full" banner with the real singular count', (assert)=>{
  const { window, document } = setup();
  assert.strictEqual(window.storageHealth.degraded, false, 'precondition: nothing has spilled yet');
  assert.strictEqual(window.isQuotaError(makeQuotaError()), true, 'precondition: the real quota-detection logic recognizes this synthetic error, so the scenario below is realistic');

  window.noteStorageDegraded('injury-log', makeQuotaError());

  assert.strictEqual(window.storageHealth.degraded, true, 'storageHealth.degraded must be true right after a real spill');
  assert.strictEqual(window.storageHealth.spilled.size, 1, 'exactly one key should be recorded as spilled');

  const banner = document.getElementById('storageBanner');
  assert.match(banner.innerHTML, /Storage is full/, 'the urgent banner must actually render');
  assert.match(banner.innerHTML, /one recent change is/, 'must use the real singular count, not a hardcoded string');
});

test('REAL invocation: once clearStorageSpill runs for the spilled key (the real recovery chokepoint), degraded clears itself AND the banner actually disappears from the DOM — the real bug, fixed', (assert)=>{
  const { window, document } = setup();
  window.noteStorageDegraded('injury-log', makeQuotaError());
  assert.strictEqual(window.storageHealth.degraded, true, 'precondition: a real spill happened');
  assert.match(document.getElementById('storageBanner').innerHTML, /Storage is full/, 'precondition: the banner is showing');

  // Mirrors exactly what buildNamespacedStorage's set() does on a successful
  // re-write of a previously-spilled key: the key is present in its local
  // `mem` shadow, and that's what clearStorageSpill checks.
  const mem = { 'injury-log': '[]' };
  window.clearStorageSpill('injury-log', mem);

  assert.strictEqual(window.storageHealth.spilled.size, 0, 'the recovered key must be dropped from the spilled set');
  assert.strictEqual(window.storageHealth.degraded, false, 'degraded must clear itself once nothing is spilled — this is the getter fix');
  assert.strictEqual(document.getElementById('storageBanner').innerHTML, '', 'the banner DOM must actually be cleared, not just the underlying flag — this is the "nothing else calls renderStorageBanner on recovery" fix');
});

test('REAL invocation: with two spilled keys, recovering only one leaves the banner showing "one recent change" instead of falsely clearing or showing a stale count of two', (assert)=>{
  const { window, document } = setup();
  window.noteStorageDegraded('injury-log', makeQuotaError());
  window.noteStorageDegraded('weight-log', makeQuotaError());
  assert.strictEqual(window.storageHealth.spilled.size, 2, 'precondition: two keys spilled');

  window.clearStorageSpill('injury-log', { 'injury-log': '[]' });

  assert.strictEqual(window.storageHealth.spilled.size, 1, 'one key should still be spilled');
  assert.strictEqual(window.storageHealth.degraded, true, 'degraded must still read true — real data is still at risk');
  assert.match(document.getElementById('storageBanner').innerHTML, /one recent change is/, 'the banner must reflect the real remaining count, not the original two nor zero');
});

test('clearStorageSpill is a no-op (no re-render, no state change) when the key was never actually spilled — it must not mask an unrelated bug by clearing something that was never dirty', (assert)=>{
  const { window, document } = setup();
  window.noteStorageDegraded('injury-log', makeQuotaError());
  const before = document.getElementById('storageBanner').innerHTML;

  window.clearStorageSpill('some-other-key', {}); // key not present in mem

  assert.strictEqual(window.storageHealth.spilled.size, 1, 'the real spilled key must be untouched');
  assert.strictEqual(document.getElementById('storageBanner').innerHTML, before, 'no re-render should happen for a key that was never spilled');
});

run();
