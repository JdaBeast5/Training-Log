'use strict';
// Behavioral coverage for the boot-timing instrumentation: BOOT_MARKS/
// bootMark() (the raw performance.now() capture near the top of the file),
// collectBootProfile()/checkBootPerformance() (turning those marks plus the
// Navigation Timing entry into the numbers a "should this file be split up"
// decision would rest on), and its real consumer — the "Cold start" row in
// the App Health Check panel (diagRow('Cold start', checkBootPerformance())
// inside runDiagnostics).
//
// This was investigated as a candidate for either wiring in or removing as
// dead write-only telemetry. It turned out to be neither: BOOT_MARKS is
// already fully wired into the "Cold start" diagRow (confirmed both by
// reading collectBootProfile/checkBootPerformance and by a live browser
// check — Settings > App Health Check > Run check renders a real "Cold
// start" row with real computed millisecond values). What was actually
// missing was test coverage for that already-shipped path, which is what
// this file adds. No index.html/sw.js behavior changes accompany this file.
const { readIndexSource, extractFunction, extractConst, countCallSites, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const bootMarksConstSrc = extractConst(src, 'BOOT_MARKS');
const bootMarkFnSrc = extractFunction(src, 'bootMark');
const collectBootProfileSrc = extractFunction(src, 'collectBootProfile');
const fmtMsSrc = extractFunction(src, 'fmtMs');
const checkBootPerformanceSrc = extractFunction(src, 'checkBootPerformance');
const diagRowSrc = extractFunction(src, 'diagRow');
const iconSrc = extractFunction(src, 'icon');
const iconsConstSrc = extractConst(src, 'ICONS');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const runDiagnosticsSrc = extractFunction(src, 'runDiagnostics');

const { test, run } = makeRunner('test-boot-performance.js');

test('sabotage-relevant: bootMark(name) has exactly 3 real call sites (scriptEnd, initStart, initEnd) — the 4th mark, scriptStart, is set inline in the BOOT_MARKS literal itself, not via bootMark()', (assert)=>{
  assert.strictEqual(countCallSites(src, 'bootMark'), 3, 'a future refactor that drops a call site (or adds an untracked one) should be caught here, not discovered by the boot-time row silently going blank');
  assert.ok(/scriptStart:\s*\(typeof performance/.test(bootMarksConstSrc), 'BOOT_MARKS.scriptStart must still be captured inline at const-declaration time, not via a bootMark() call, since nothing has run yet at that point');
});

test('REAL invocation: bootMark(name) writes performance.now() into BOOT_MARKS[name] and ONLY that key', (assert)=>{
  const [before, after, untouched] = runSandbox([
    bootMarksConstSrc, bootMarkFnSrc,
    `var performance = { now: () => 12345.6 };`,
  ], `
    __capture.push(BOOT_MARKS.scriptEnd);
    bootMark('scriptEnd');
    __capture.push(BOOT_MARKS.scriptEnd);
    __capture.push(BOOT_MARKS.initStart);
  `);
  assert.strictEqual(before, null, 'scriptEnd must start null');
  assert.strictEqual(after, 12345.6, 'bootMark must write the real performance.now() value for the named key');
  assert.strictEqual(untouched, null, 'bootMark must not touch any mark other than the one it was named for');
});

test('bootMark degrades silently (no throw) when performance.now is unavailable', (assert)=>{
  const [result] = runSandbox([
    bootMarksConstSrc, bootMarkFnSrc,
    `var performance = undefined;`,
  ], `
    let threw = false;
    try{ bootMark('initEnd'); }catch(e){ threw = true; }
    __capture.push(threw);
  `);
  assert.strictEqual(result, false, 'a missing performance API must not throw out of bootMark');
});

test('collectBootProfile: combines a real Navigation Timing entry with real BOOT_MARKS into the exact field set checkBootPerformance depends on', (assert)=>{
  const [out] = runSandbox([
    `var BOOT_MARKS = { scriptStart: 40, scriptEnd: 55, initStart: 60, initEnd: 260 };`,
    `var performance = {
      getEntriesByType: (type) => type === 'navigation' ? [{
        decodedBodySize: 3145728, transferSize: 0,
        responseEnd: 35, domInteractive: 200, domContentLoadedEventEnd: 210,
      }] : [],
    };`,
    collectBootProfileSrc,
  ], `__capture.push(collectBootProfile());`);
  assert.strictEqual(out.bytes, 3145728);
  assert.strictEqual(out.fromCache, true, 'transferSize 0 with a real decodedBodySize means the shell came from the SW cache, not the network');
  assert.strictEqual(out.parseExecute, 165, 'domInteractive - responseEnd');
  assert.strictEqual(out.network, 35);
  assert.strictEqual(out.domReady, 210);
  assert.strictEqual(out.beforeScript, 40, 'BOOT_MARKS.scriptStart');
  assert.strictEqual(out.scriptExecute, 15, 'scriptEnd - scriptStart');
  assert.strictEqual(out.init, 200, 'initEnd - initStart');
  assert.strictEqual(out.toInteractive, 260, 'BOOT_MARKS.initEnd');
});

test('collectBootProfile: fromCache is false when the shell was actually fetched over the network (real transferSize)', (assert)=>{
  const [out] = runSandbox([
    `var BOOT_MARKS = { scriptStart: 40, scriptEnd: 55, initStart: 60, initEnd: 260 };`,
    `var performance = {
      getEntriesByType: (type) => type === 'navigation' ? [{
        decodedBodySize: 3145728, transferSize: 900000,
        responseEnd: 35, domInteractive: 200, domContentLoadedEventEnd: 210,
      }] : [],
    };`,
    collectBootProfileSrc,
  ], `__capture.push(collectBootProfile());`);
  assert.strictEqual(out.fromCache, false, 'a nonzero transferSize means this load actually hit the network');
});

test('collectBootProfile: degrades to BOOT_MARKS-only fields (no throw) when Navigation Timing is unavailable, matching an embedded webview without level-2 support', (assert)=>{
  const [out] = runSandbox([
    `var BOOT_MARKS = { scriptStart: 40, scriptEnd: 55, initStart: 60, initEnd: 260 };`,
    `var performance = {};`,
    collectBootProfileSrc,
  ], `__capture.push(collectBootProfile());`);
  assert.strictEqual(out.bytes, undefined);
  assert.strictEqual(out.beforeScript, 40);
  assert.strictEqual(out.toInteractive, 260);
});

test('fmtMs: sub-second values render as rounded whole milliseconds, second-plus values render as seconds to 2 decimals, and a missing value renders as an em dash', (assert)=>{
  const [ms, sec, missing, nan] = runSandbox([fmtMsSrc], `
    __capture.push(fmtMs(542.7));
    __capture.push(fmtMs(1523));
    __capture.push(fmtMs(null));
    __capture.push(fmtMs(NaN));
  `);
  assert.strictEqual(ms, '543 ms');
  assert.strictEqual(sec, '1.52 s');
  assert.strictEqual(missing, '—');
  assert.strictEqual(nan, '—');
});

test('checkBootPerformance: "could not measure" when the browser reports neither toInteractive nor parseExecute', (assert)=>{
  const [out] = runSandbox([
    `var BOOT_MARKS = { scriptStart: null, scriptEnd: null, initStart: null, initEnd: null };`,
    `var performance = {};`,
    collectBootProfileSrc, fmtMsSrc, checkBootPerformanceSrc,
  ], `__capture.push(checkBootPerformance());`);
  assert.strictEqual(out.ok, true, 'a browser that cannot report timings is not itself a failure');
  assert.ok(out.warn && out.warn.includes('Could not measure'), 'must say so explicitly rather than showing a blank/zero row');
});

test('checkBootPerformance: a fast real boot (under 1s to interactive) reports ok/detail, not a warning', (assert)=>{
  const [out] = runSandbox([
    `var BOOT_MARKS = { scriptStart: 40, scriptEnd: 55, initStart: 60, initEnd: 260 };`,
    `var performance = {
      getEntriesByType: (type) => type === 'navigation' ? [{
        decodedBodySize: 2097152, transferSize: 0,
        responseEnd: 35, domInteractive: 200, domContentLoadedEventEnd: 210,
      }] : [],
    };`,
    collectBootProfileSrc, fmtMsSrc, checkBootPerformanceSrc,
  ], `__capture.push(checkBootPerformance());`);
  assert.strictEqual(out.ok, true);
  assert.strictEqual(out.warn, undefined, 'a fast boot must not carry a warning');
  assert.ok(out.detail.includes('260 ms to interactive'));
  assert.ok(out.detail.includes('under 1s, no action needed'));
  assert.ok(out.detail.includes('from cache'), 'a transferSize-0 load must be labeled as served from cache');
});

test('checkBootPerformance: a slow real boot (over 1s to interactive) reports ok/warn with the split-the-shell recommendation', (assert)=>{
  const [out] = runSandbox([
    `var BOOT_MARKS = { scriptStart: 40, scriptEnd: 900, initStart: 910, initEnd: 1800 };`,
    `var performance = {
      getEntriesByType: (type) => type === 'navigation' ? [{
        decodedBodySize: 6291456, transferSize: 1200000,
        responseEnd: 30, domInteractive: 850, domContentLoadedEventEnd: 860,
      }] : [],
    };`,
    collectBootProfileSrc, fmtMsSrc, checkBootPerformanceSrc,
  ], `__capture.push(checkBootPerformance());`);
  assert.strictEqual(out.ok, true, 'this is a warning, not a hard failure — the panel has no way to know if 1s+ is actually a problem on this specific device');
  assert.ok(out.warn, 'a boot over 1s must set warn, not detail');
  assert.ok(out.warn.includes('1.80 s to interactive'));
  assert.ok(out.warn.includes('over 1s'));
  assert.ok(out.warn.includes('splitting the inert data'));
});

test('REAL invocation: diagRow(\'Cold start\', checkBootPerformance()) renders an actual "good" diag row with real computed numbers in the DOM, matching runDiagnostics\' own wiring', (assert)=>{
  const bodyHtml = `<div id="diagResults"></div>`;
  const globals = `
    window.BOOT_MARKS = { scriptStart: 40, scriptEnd: 55, initStart: 60, initEnd: 260 };
    window.performance.getEntriesByType = (type) => type === 'navigation' ? [{
      decodedBodySize: 2097152, transferSize: 0,
      responseEnd: 35, domInteractive: 200, domContentLoadedEventEnd: 210,
    }] : [];
  `;
  const { document } = runJsdom(bodyHtml, globals, [
    collectBootProfileSrc, fmtMsSrc, checkBootPerformanceSrc,
    iconsConstSrc, iconSrc, escapeHtmlSrc, diagRowSrc,
    `document.getElementById('diagResults').innerHTML = diagRow('Cold start', checkBootPerformance());`,
  ]);
  const row = document.querySelector('#diagResults .diag-row');
  assert.ok(row, 'diagRow must render a real .diag-row element, not an empty string');
  assert.ok(row.classList.contains('diag-good'), 'a fast boot with no warning must render as the good state');
  assert.ok(row.querySelector('svg'), 'the good state must render the real check icon SVG, not raw text/emoji');
  assert.ok(row.textContent.includes('Cold start'));
  assert.ok(row.textContent.includes('260 ms to interactive'));
});

test('sabotage-relevant: runDiagnostics genuinely calls diagRow(\'Cold start\', checkBootPerformance()) — not just defines a Cold-start-capable function that nothing ever invokes', (assert)=>{
  assert.strictEqual(countCallSites(runDiagnosticsSrc, 'checkBootPerformance'), 1, 'runDiagnostics body must contain exactly one real call to checkBootPerformance');
  assert.ok(/diagRow\(\s*'Cold start'\s*,\s*checkBootPerformance\(\)\s*\)/.test(runDiagnosticsSrc), 'the extracted runDiagnostics source must contain the real, literal wiring — not just each piece existing separately');
});

run();
