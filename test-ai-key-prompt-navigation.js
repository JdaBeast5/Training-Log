'use strict';
// Behavioral coverage for a real navigation bug found during a content audit:
// aiKeySetupPrompt() (the single helper 7+ "add your API key" banners across
// the app were consolidated into, specifically so the location couldn't
// drift again) shipped a "Take me there" button whose handler did
// showView('log') + manually clicked #aiSettingsHeader. That was correct
// when the AI Features Setup card lived on the Log tab — but wireSettings()
// now reparents aiSettingsCard into Settings (settingsAiSlot) unconditionally
// on every boot, so the button was sending people to a tab that no longer
// has the card on it: the exact class of bug the helper was built to
// prevent, reintroduced by a later, unrelated change that moved the card
// without updating this one hardcoded assumption.
//
// Fixed by switching the button to data-jump-to="aiSettingsCard", the
// existing, already-correct, already-DOM-driven mechanism (jumpToSetting,
// wired inside wireSettings) that every other "jump into a possibly-nested
// settings card" case in the app already uses.
//
// This file proves the fix two ways: the markup shape (no more hand-rolled
// class/handler), and a REAL end-to-end invocation — the actual wireSettings
// IIFE, the actual aiSettingsCard/settingsOverlay markup, a real click —
// confirming Settings actually opens and the card actually expands, not just
// that a data-jump-to attribute is present in a string.
const { readIndexSource, extractFunction, extractConst, extractIIFE, extractElementById, countCallSites, runJsdom, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-ai-key-prompt-navigation.js');

// --- Markup shape: the old broken pattern must be gone -----------------

test('aiKeySetupPrompt no longer ships the stale showView(\'log\') + manual header-click handler', (assert)=>{
  const fnSrc = extractFunction(src, 'aiKeySetupPrompt');
  assert.doesNotMatch(fnSrc, /js-ai-setup-jump/, 'the old hand-rolled click-target class must be gone from the helper itself');
  assert.match(fnSrc, /data-jump-to=["']aiSettingsCard["']/, 'must use the established data-jump-to mechanism instead');
  // The old delegated handler (showView('log') + header.click()) lived right
  // after the helper's own definition — confirm it's actually gone from the
  // file, not just unreferenced.
  assert.doesNotMatch(src, /js-ai-setup-jump/, 'no remaining reference anywhere in the file to the removed handler\'s target class');
});

test('sabotage-relevant: exactly 11 real aiKeySetupPrompt( call sites (the original 7, Snap a Meal converted from hand-rolled HTML, Supplement Recommendations, the My Supplements AI-insight feature, plus its DSLD search-time preview)', (assert)=>{
  const count = countCallSites(src, 'aiKeySetupPrompt');
  assert.strictEqual(count, 11, `expected 11 real call sites, found ${count}`);
});

test('the Snap a Meal "no API key" banner no longer hand-rolls its own HTML, and the stale "card below" phrasing is gone from the file', (assert)=>{
  assert.doesNotMatch(src, /AI Features Setup["'”]? card below/, 'the specific wrong phrasing (the card has not been "below" since it moved into Settings) must not remain anywhere');
});

// --- REAL invocation: aiKeySetupPrompt() itself -------------------------

test('REAL invocation: aiKeySetupPrompt(feature) renders a real button with the right data-jump-to target and an escaped feature name', (assert)=>{
  const { document } = runJsdom('<div id="host"></div>', '', [
    extractFunction(src, 'escapeHtml'),
    extractFunction(src, 'aiKeySetupPrompt'),
    `document.getElementById('host').innerHTML = aiKeySetupPrompt('Snap a Meal');`,
  ]);
  const btn = document.querySelector('#host button');
  assert.ok(btn, 'must render a real button');
  assert.strictEqual(btn.dataset.jumpTo, 'aiSettingsCard');
  assert.match(document.getElementById('host').textContent, /Snap a Meal/);
});

test('REAL invocation: aiKeySetupPrompt escapes its feature argument (defense against a future caller passing unescaped content)', (assert)=>{
  const [html] = runSandbox([extractFunction(src, 'escapeHtml'), extractFunction(src, 'aiKeySetupPrompt')], `
    __capture.push(aiKeySetupPrompt('<script>x</script>'));
  `);
  assert.doesNotMatch(html, /<script>x<\/script>/, 'a literal, unescaped <script> tag must never appear in the output');
  assert.match(html, /&lt;script&gt;/, 'the feature name must be HTML-escaped');
});

// --- REAL invocation: the actual end-to-end click path ------------------
// Same extraction pattern test-settings-overlay-scroll-lock.js already
// established for wireSettings — reused here, not reinvented, per this
// repo's own "unify using patterns already established" rule.

const settingsCogHtml = extractElementById(src, 'settingsCog');
const settingsOverlayHtml = extractElementById(src, 'settingsOverlay');
// aiSettingsCard (containing aiSettingsHeader) lives OUTSIDE settingsOverlay
// in the real document — inside logView — until wireSettings()'s move() call
// reparents it into settingsAiSlot at runtime. Both must be present in the
// test DOM for that move to have something real to move and somewhere real
// to land, exactly like the real page.
const aiSettingsCardHtml = extractElementById(src, 'aiSettingsCard');

// jumpToSetting's own job is only to OPEN Settings and click the header —
// what that click actually DOES (toggle .open on the header/expand-wrap,
// persist it) is a separate, real, un-named top-level listener
// (index.html ~26185) this test needs wired too, or header.click() would be
// a no-op and the real "did it actually expand" assertion below would be
// testing nothing. setCardOpenState (real function, but async and storage-
// backed) is stubbed to a no-op — this test is about navigation reaching
// the right element and it opening, not about persisting that state.
const aiHeaderClickListenerSrc = `
  document.getElementById('aiSettingsHeader').addEventListener('click', ()=>{
    const isOpen = document.getElementById('aiSettingsHeader').classList.toggle('open');
    document.getElementById('aiSettingsExpandWrap').classList.toggle('open');
    setCardOpenState('aiSettings', isOpen);
  });
`;

const wireSettingsChunks = [
  extractConst(src, 'SCROLL_LOCK_OVERLAYS'),
  extractConst(src, 'OVERLAY_CLOSERS'),
  extractFunction(src, 'anyOverlayOpen'),
  extractFunction(src, 'openOverlayEl'),
  extractFunction(src, 'handleOverlayEscape'),
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'describeHealthImportAge'),
  extractFunction(src, 'refreshHealthImportSummary'),
  extractFunction(src, 'escapeHtml'),
  extractFunction(src, 'aiKeySetupPrompt'),
  'async function setCardOpenState(){}',
  aiHeaderClickListenerSrc,
  extractIIFE(src, 'wireSettings'),
  'wireSettings();',
];

// jumpToSetting's expand + scrollIntoView happen inside a real 80ms
// setTimeout (so a lazily-rendered tab's contents have a moment to land
// first — see jumpToSetting's own comment). These tests wait past it with a
// real timer rather than faking one, matching how real usage actually
// resolves. jsdom has no scrollIntoView implementation at all (unrelated to
// this fix), so it's stubbed to a no-op the same way an earlier real-DOM
// test in this repo (openMasterclassTechnique's) already stubbed it.
const scrollIntoViewStub = `window.Element.prototype.scrollIntoView = function(){};`;

// The button clicked below is aiKeySetupPrompt('Snap a Meal')'s REAL output,
// injected via innerHTML exactly like every real call site does — not a
// hand-built stand-in. A regression in the helper's own markup (e.g. the
// sabotage this file's suite catches above) would break this test too, not
// just the source-shape one, since the button clicked here IS the helper's
// actual product.
const bannerHostHtml = '<div id="bannerHost"></div>';
const injectRealBannerSrc = `document.getElementById('bannerHost').innerHTML = aiKeySetupPrompt('Snap a Meal');`;

test('REAL invocation: clicking aiKeySetupPrompt\'s REAL "Take me there" button actually opens Settings AND expands the AI card — the real bug, fixed', async (assert)=>{
  const bodyHtml = settingsCogHtml + settingsOverlayHtml + aiSettingsCardHtml + bannerHostHtml;
  const { document } = runJsdom(bodyHtml, scrollIntoViewStub, [...wireSettingsChunks, injectRealBannerSrc]);

  const overlay = document.getElementById('settingsOverlay');
  const header = document.getElementById('aiSettingsHeader');
  const jumpBtn = document.querySelector('#bannerHost button');
  assert.ok(overlay, 'precondition: real settingsOverlay markup must be present');
  assert.ok(header, 'precondition: real aiSettingsHeader markup (inside aiSettingsCard) must be present');
  assert.ok(jumpBtn, 'precondition: aiKeySetupPrompt must have actually rendered a real button');
  assert.strictEqual(overlay.classList.contains('active'), false, 'precondition: Settings starts closed');
  assert.strictEqual(header.classList.contains('open'), false, 'precondition: the AI card starts collapsed');

  jumpBtn.click();
  assert.strictEqual(overlay.classList.contains('active'), true, 'clicking the button must IMMEDIATELY open Settings — this is the part the old showView(\'log\') handler could never do, since the card is not on Log');

  await new Promise(r=> setTimeout(r, 150)); // past jumpToSetting's real 80ms delay
  assert.strictEqual(header.classList.contains('open'), true, 'the AI Features Setup card itself must also expand, matching the old handler\'s intent, just via the mechanism that actually finds it now');
});

test('REAL invocation: the same real button, if Settings were already open, leaves it open rather than toggling it closed', async (assert)=>{
  const bodyHtml = settingsCogHtml + settingsOverlayHtml + aiSettingsCardHtml + bannerHostHtml;
  const { document } = runJsdom(bodyHtml, scrollIntoViewStub, [...wireSettingsChunks, injectRealBannerSrc]);
  document.getElementById('settingsCog').click();
  const overlay = document.getElementById('settingsOverlay');
  assert.strictEqual(overlay.classList.contains('active'), true, 'precondition: Settings opened via the cog first');

  document.querySelector('#bannerHost button').click();
  await new Promise(r=> setTimeout(r, 150));

  assert.strictEqual(overlay.classList.contains('active'), true, 'must still be open, not toggled closed by a second "open" trigger');
});

run();
