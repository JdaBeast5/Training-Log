'use strict';
// Behavioral coverage for the History tab's Day-by-Day Log card-level
// collapse — new feature.
//
// Each month inside Day-by-Day Log was already individually collapsible
// (<details class="month-group">), but the CARD itself had no way to get
// out of the way — unlike every other long card on Log/Settings (Nutrition,
// Body Measurements, Progress Photos, Cycle Tracking, AI Features Setup,
// Training Style, App Health Check, Import Health Data), which all use the
// nutrition-header/expand-wrap collapsible-card pattern plus PERSISTENT_CARDS
// storage. This reuses that exact mechanism for a ninth card ('historyLog')
// rather than inventing a parallel one — confirmed a fit, not the
// Analysis-tab group-collapse pattern (analysis-group-header/
// toggleAnalysisGroup), which collapses MULTIPLE sibling cards under one
// shared header; Day-by-Day Log is a single card collapsing its own body,
// the same shape as the eight cards above it.
//
// Uses the REAL #historyView markup and REAL extracted functions, loaded
// into an actual jsdom document via a real <script> tag.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const historyViewHtml = extractElementById(src, 'historyView');

// document.getElementById('historyLogHeader').addEventListener('click', ...)
// is a top-level statement, not a named function/const — not reachable by
// extractFunction/extractConst. Extracted the same way this repo's other
// tests handle small unnamed top-level wiring (see test-nav-more-panel.js):
// matched by its own unique opening text through to its closing '});' line.
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const persistentCardsSrc = extractConst(src, 'PERSISTENT_CARDS');
const getCardOpenStateSrc = extractFunction(src, 'getCardOpenState');
const setCardOpenStateSrc = extractFunction(src, 'setCardOpenState');
const restoreCardOpenStatesSrc = extractFunction(src, 'restoreCardOpenStates');
const headerClickWiringSrc = extractStatement(src, "document.getElementById('historyLogHeader').addEventListener('click'");

function storageGlobals(getResponses){
  return `
    window.storage = {
      __setCalls: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(${JSON.stringify(getResponses)}, key)){
          return { value: ${JSON.stringify(getResponses)}[key] };
        }
        throw new Error('no saved preference');
      },
      set: async (key, value)=>{ window.storage.__setCalls.push([key, value]); },
    };
  `;
}

const tick = ()=> new Promise((resolve)=> setTimeout(resolve, 10));

const { test, run } = makeRunner('test-history-log-collapse.js');

// --- Markup shape ------------------------------------------------------

test('sabotage-relevant: PERSISTENT_CARDS includes historyLog exactly once, alongside the other real entries', (assert)=>{
  // `const` at the top level of a classic <script> does not become a window
  // property (unlike `var`) — this line exposes it for the assertion below
  // without changing what's actually declared in the real source.
  const { window } = runJsdom('', '', [persistentCardsSrc, 'window.__PERSISTENT_CARDS = PERSISTENT_CARDS;']);
  const arr = JSON.parse(JSON.stringify(window.__PERSISTENT_CARDS));
  assert.strictEqual(arr.filter(k=> k==='historyLog').length, 1);
  // 'mySupplements' joined later (see test-my-supplements-tracker.js's own
  // card-collapse coverage) — updated here rather than left as a stale
  // exact-match failure, same precedent this suite already follows for a
  // real, intentional shape change.
  assert.deepStrictEqual(arr, ['nutrition', 'measure', 'photos', 'cycle', 'aiSettings', 'program', 'healthImport', 'diag', 'historyLog', 'mySupplements']);
});

test('the real Day-by-Day Log header/wrap markup uses the established collapsible-card pattern, not a bespoke one', (assert)=>{
  const { document } = runJsdom(historyViewHtml, '', []);
  const header = document.getElementById('historyLogHeader');
  const wrap = document.getElementById('historyLogExpandWrap');
  assert.ok(header, 'historyLogHeader must exist');
  assert.ok(wrap, 'historyLogExpandWrap must exist');
  assert.ok(header.classList.contains('nutrition-header'), 'must reuse the real nutrition-header class, not a new one');
  assert.ok(wrap.classList.contains('expand-wrap'), 'must reuse the real expand-wrap class, not a new one');
  // restoreCardOpenStates only ever ADDS .open (see its own real comment) —
  // the static markup must NOT hardcode it, or an explicit stored collapse
  // choice ('false') could never be honored on reload.
  assert.strictEqual(header.classList.contains('open'), false, 'must not hardcode open in static markup');
  assert.strictEqual(wrap.classList.contains('open'), false, 'must not hardcode open in static markup');
  // Everything that used to sit loose in the card (hint, heatmap, export
  // row, search, list) must now live INSIDE the collapsing wrap — collapsing
  // "down to just the card title" means literally that, not title+hint.
  assert.ok(wrap.querySelector('#historyList'), 'historyList must be inside the expand-wrap');
  assert.ok(wrap.querySelector('#historyExportRange'), 'the date-range select must be inside the expand-wrap');
  assert.ok(wrap.querySelector('#historySearch'), 'the search input must be inside the expand-wrap');
  assert.ok(wrap.querySelector('.history-hint'), 'the descriptive hint must be inside the expand-wrap too, not left always-visible');
});

// --- getCardOpenState defaults ------------------------------------------

test('getCardOpenState defaults historyLog to OPEN when nothing has ever been stored (matches Nutrition, unlike the other six)', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), [getCardOpenStateSrc]);
  assert.strictEqual(await window.getCardOpenState('historyLog'), true);
  // Regression guard on the sibling defaults, so this change didn't flip one
  // of the pre-existing default-closed cards by accident.
  assert.strictEqual(await window.getCardOpenState('measure'), false);
  assert.strictEqual(await window.getCardOpenState('nutrition'), true);
});

test('an explicit stored choice always wins over the default, in both directions', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({'card-open:historyLog': 'false'}), [getCardOpenStateSrc]);
  assert.strictEqual(await window.getCardOpenState('historyLog'), false, 'an explicit collapse must be honored even though the default is open');
});

// --- REAL invocation: click toggles + persists --------------------------

test('REAL invocation: clicking the header toggles .open on both header and wrap, and persists via the REAL setCardOpenState under the historyLog key', async (assert)=>{
  const { document, window } = runJsdom(
    historyViewHtml,
    storageGlobals({}),
    [setCardOpenStateSrc, headerClickWiringSrc]
  );
  const header = document.getElementById('historyLogHeader');
  const wrap = document.getElementById('historyLogExpandWrap');
  assert.strictEqual(header.classList.contains('open'), false, 'starts closed in static markup');

  header.dispatchEvent(new window.Event('click', {bubbles:true}));
  assert.strictEqual(header.classList.contains('open'), true, 'first click opens the header');
  assert.strictEqual(wrap.classList.contains('open'), true, 'first click opens the wrap');

  header.dispatchEvent(new window.Event('click', {bubbles:true}));
  assert.strictEqual(header.classList.contains('open'), false, 'second click closes it again');
  assert.strictEqual(wrap.classList.contains('open'), false);

  const calls = JSON.parse(JSON.stringify(window.storage.__setCalls));
  assert.deepStrictEqual(calls, [
    ['card-open:historyLog', 'true'],
    ['card-open:historyLog', 'false'],
  ]);
});

// --- REAL invocation: restoreCardOpenStates end-to-end -------------------

test('REAL invocation: restoreCardOpenStates opens Day-by-Day Log by default (no stored preference), and every other PERSISTENT_CARDS entry present here stays closed', async (assert)=>{
  const viewsHtml = historyViewHtml + `
    <div class="card-title nutrition-header" id="measureHeader"></div>
    <div class="expand-wrap" id="measureExpandWrap"></div>
  `;
  const { document, window } = runJsdom(viewsHtml, storageGlobals({}), [persistentCardsSrc, getCardOpenStateSrc, restoreCardOpenStatesSrc]);
  await window.restoreCardOpenStates();
  assert.strictEqual(document.getElementById('historyLogHeader').classList.contains('open'), true, 'Day-by-Day Log must default open');
  assert.strictEqual(document.getElementById('historyLogExpandWrap').classList.contains('open'), true);
  assert.strictEqual(document.getElementById('measureHeader').classList.contains('open'), false, 'a real sibling PERSISTENT_CARDS entry must stay closed by default, unaffected by this change');
});

test('REAL invocation: restoreCardOpenStates honors an explicit stored "closed" choice for historyLog instead of forcing it back open', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, storageGlobals({'card-open:historyLog': 'false'}), [persistentCardsSrc, getCardOpenStateSrc, restoreCardOpenStatesSrc]);
  await window.restoreCardOpenStates();
  assert.strictEqual(document.getElementById('historyLogHeader').classList.contains('open'), false);
});

run();
