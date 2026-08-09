'use strict';
// Behavioral coverage for settingsOverlay's membership in SCROLL_LOCK_OVERLAYS
// (anyOverlayOpen, openOverlayEl, handleOverlayEscape, wireSettings) — Tier 2.
//
// settingsOverlay is a real dialog (role="dialog" aria-modal="true") that
// opens/closes via the same `.active` class every other tracked overlay uses,
// and already has a real closer registered in OVERLAY_CLOSERS. But it was
// missing from SCROLL_LOCK_OVERLAYS, the single list that drives THREE
// behaviours — background scroll lock, focus trapping, and Escape-to-close —
// via anyOverlayOpen()/openOverlayEl(). Because openOverlayEl() only checks
// ids in that list, all three were broken for Settings specifically, and the
// OVERLAY_CLOSERS.settingsOverlay entry was dead code, unreachable since
// openOverlayEl() never found it. Compare userPickerOverlay, which IS in
// SCROLL_LOCK_OVERLAYS but deliberately excluded from OVERLAY_CLOSERS with an
// explicit comment explaining why — Settings had no such documented reason.
//
// Uses the REAL settingsOverlay + settingsCog markup and the REAL extracted
// SCROLL_LOCK_OVERLAYS/OVERLAY_CLOSERS/anyOverlayOpen/openOverlayEl/
// handleOverlayEscape/wireSettings, loaded into an actual jsdom document via
// a real <script> tag, exercising the real `.active`-class open/close path.
const { readIndexSource, extractFunction, extractConst, extractIIFE, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const settingsCogHtml = extractElementById(src, 'settingsCog');
const settingsOverlayHtml = extractElementById(src, 'settingsOverlay');

const scriptChunks = [
  extractConst(src, 'SCROLL_LOCK_OVERLAYS'),
  extractConst(src, 'OVERLAY_CLOSERS'),
  extractFunction(src, 'anyOverlayOpen'),
  extractFunction(src, 'openOverlayEl'),
  extractFunction(src, 'handleOverlayEscape'),
  // wireSettings' open() also calls refreshHealthImportSummary(), which this
  // fixture doesn't render healthImportSummaryLine for — it must no-op
  // safely (guarded on the missing element) rather than throw and abort the
  // rest of open() before .active ever gets added.
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'describeHealthImportAge'),
  extractFunction(src, 'refreshHealthImportSummary'),
  extractIIFE(src, 'wireSettings'),
  'wireSettings();',
  // Exposes the two extracted registries for direct assertion — top-level
  // const/let in a classic script are not window properties, but they ARE
  // reachable from later code in the SAME script, which is what this is.
  'window.__scrollLockOverlays = SCROLL_LOCK_OVERLAYS.slice();',
  'window.__hasSettingsCloser = typeof OVERLAY_CLOSERS.settingsOverlay === "function";',
  'window.__handleOverlayEscape = handleOverlayEscape;',
  'window.__anyOverlayOpen = anyOverlayOpen;',
  'window.__openOverlayEl = openOverlayEl;',
];

const { test, run } = makeRunner('test-settings-overlay-scroll-lock.js');

test('sabotage anchor: settingsOverlay appears in SCROLL_LOCK_OVERLAYS exactly once', (assert)=>{
  const { window } = runJsdom(settingsCogHtml + settingsOverlayHtml, '', scriptChunks);
  const occurrences = window.__scrollLockOverlays.filter(id=> id === 'settingsOverlay').length;
  assert.strictEqual(occurrences, 1, 'settingsOverlay must be tracked exactly once, not zero and not duplicated');
});

test('OVERLAY_CLOSERS.settingsOverlay is a real, already-registered closer', (assert)=>{
  const { window } = runJsdom(settingsCogHtml + settingsOverlayHtml, '', scriptChunks);
  assert.strictEqual(window.__hasSettingsCloser, true);
});

test('before opening: anyOverlayOpen() is false and openOverlayEl() is null', (assert)=>{
  const { window } = runJsdom(settingsCogHtml + settingsOverlayHtml, '', scriptChunks);
  assert.strictEqual(window.__anyOverlayOpen(), false);
  assert.strictEqual(window.__openOverlayEl(), null);
});

test('opening Settings (the real .active-class path) makes anyOverlayOpen() true and openOverlayEl() return the settings element', (assert)=>{
  const { document, window } = runJsdom(settingsCogHtml + settingsOverlayHtml, '', scriptChunks);
  document.getElementById('settingsCog').click();
  assert.strictEqual(window.__anyOverlayOpen(), true, 'anyOverlayOpen() must see Settings as open once .active is set');
  const open = window.__openOverlayEl();
  assert.ok(open, 'openOverlayEl() must return an element, not null, while Settings is open');
  assert.strictEqual(open.id, 'settingsOverlay');
});

test('pressing Escape while Settings is open actually calls the settings closer and closes it', (assert)=>{
  const { document, window } = runJsdom(settingsCogHtml + settingsOverlayHtml, '', scriptChunks);
  const overlay = document.getElementById('settingsOverlay');
  document.getElementById('settingsCog').click();
  assert.strictEqual(overlay.classList.contains('active'), true, 'precondition: Settings is open');

  window.__handleOverlayEscape({ key: 'Escape', preventDefault(){}, stopPropagation(){} });

  assert.strictEqual(overlay.classList.contains('active'), false, 'Escape must close Settings via its registered closer');
  assert.strictEqual(window.__anyOverlayOpen(), false, 'once closed, anyOverlayOpen() must go back to false');
});

test('a non-Escape key does not close Settings', (assert)=>{
  const { document, window } = runJsdom(settingsCogHtml + settingsOverlayHtml, '', scriptChunks);
  const overlay = document.getElementById('settingsOverlay');
  document.getElementById('settingsCog').click();

  window.__handleOverlayEscape({ key: 'Enter', preventDefault(){}, stopPropagation(){} });

  assert.strictEqual(overlay.classList.contains('active'), true, 'a non-Escape key must leave Settings open');
});

run();
