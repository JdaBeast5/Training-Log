'use strict';
// Behavioral coverage for "My Supplements" — the new Log-tab tracker for
// self-directed, general supplement use (any name, not just AI-recommended
// ones), agreed as a follow-on to the Coach tab's Supplement Recommendations
// feature. Two axes on purpose: `my-supplements` is a maintained list
// (mirrors Grocery List's own shape/CRUD exactly — see
// test-grocery-render-crud.js, whose bodyHtml/storageGlobals/otherGlobals
// conventions this file reuses directly), while `supplement-taken:{date}` is
// a per-day boolean map keyed by selectedLogDate, resetting every day.
//
// Three things get real, sabotage-relevant coverage here:
// 1. The list and the daily-taken state are genuinely independent — deleting
//    or re-adding an item must never be confused with checking it off, and
//    a taken-state write for one date must never leak into another date's map.
// 2. findKnownSupplementInfo actually looks up the SAME FOUNDATIONAL_SUPPLEMENT_STACK
//    content Supplement Recommendations renders from (case-insensitive name
//    match) — this is what keeps the tracker grounded in real evidence-graded
//    content instead of being a bare checklist, per the user's explicit ask
//    for "elite-level" thoroughness here too.
// 3. The real swipe-to-delete + undo mechanics (makeSwipeable/buildSwipeItem/
//    showUndoToast) work identically to Grocery List's already-tested flow.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const loadMySupplementsSrc = extractFunction(src, 'loadMySupplements');
const saveMySupplementsSrc = extractFunction(src, 'saveMySupplements');
const addMySupplementSrc = extractFunction(src, 'addMySupplement');
const loadSupplementTakenStateSrc = extractFunction(src, 'loadSupplementTakenState');
const toggleMySupplementTakenSrc = extractFunction(src, 'toggleMySupplementTaken');
const findKnownSupplementInfoSrc = extractFunction(src, 'findKnownSupplementInfo');
const renderMySupplementsSrc = extractFunction(src, 'renderMySupplements');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const foundationalStackSrc = extractConst(src, 'FOUNDATIONAL_SUPPLEMENT_STACK');
const supplementEvidenceLabelsSrc = extractConst(src, 'SUPPLEMENT_EVIDENCE_LABELS');
const addBtnWiringSrc = extractStatement(src, "document.getElementById('mySupplementAddBtn').addEventListener('click'");

const bodyHtml = `
  <input type="text" id="mySupplementAddInput" class="care-input" placeholder="Add a supplement (e.g. Creatine)" aria-label="Add a supplement" autocomplete="off">
  <button id="mySupplementAddBtn">Add</button>
  <div id="mySupplementsList"></div>
  <div class="undo-toast" id="undoToast" role="status" aria-live="polite">
    <span id="undoToastText"></span>
    <button id="undoToastBtn">Undo</button>
  </div>
`;

function storageGlobals(initial){
  return `
    window.storage = {
      __store: ${JSON.stringify(initial || {})},
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('no saved preference');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
    };
  `;
}

// icon() is a leaf presentation concern covered elsewhere (same treatment
// test-grocery-render-crud.js and test-nav-more-panel.js give it).
function otherGlobals(selectedLogDate){
  return `
    var undoToastTimeout = null;
    window.selectedLogDate = ${JSON.stringify(selectedLogDate || '2026-08-20')};
    window.matchMedia = ()=> ({ matches: true }); // reduced-motion: skip the swipe-delete animation timer
    window.icon = (name)=> name === 'check' ? '<span class="check-glyph">CHECK</span>' : '';
  `;
}

const scriptChunks = [
  escapeHtmlSrc, foundationalStackSrc, supplementEvidenceLabelsSrc,
  loadMySupplementsSrc, saveMySupplementsSrc, addMySupplementSrc,
  loadSupplementTakenStateSrc, toggleMySupplementTakenSrc, findKnownSupplementInfoSrc,
  buildSwipeItemSrc, makeSwipeableSrc, showUndoToastSrc,
  renderMySupplementsSrc, addBtnWiringSrc,
];

const { test, run } = makeRunner('test-my-supplements-tracker.js');

// --- Read/render ------------------------------------------------------------

test('renderMySupplements shows the empty state when nothing has been added', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  assert.match(document.getElementById('mySupplementsList').innerHTML, /Nothing here yet/);
});

test('a name that matches a Foundational Stack entry (case-insensitively) renders its real evidence tier and benefit note', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['creatine monohydrate']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const html = document.getElementById('mySupplementsList').innerHTML;
  assert.match(html, /Well-established/, 'the real evidence tier for Creatine Monohydrate must render');
  assert.match(html, /strength, power output/, 'the real benefit text (from FOUNDATIONAL_SUPPLEMENT_STACK) must render, not a placeholder');
});

test('an unmatched, made-up name renders as a plain row with no benefit subtitle', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['My Custom Blend XYZ']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const html = document.getElementById('mySupplementsList').innerHTML;
  assert.match(html, /My Custom Blend XYZ/);
  assert.doesNotMatch(html, /supplement-name-wrap/, 'no known match must mean no benefit-subtitle wrapper at all');
});

test('sabotage-relevant: findKnownSupplementInfo returns null for a name that is not in FOUNDATIONAL_SUPPLEMENT_STACK', (assert)=>{
  const { window } = runJsdom('', otherGlobals(), [foundationalStackSrc, findKnownSupplementInfoSrc]);
  assert.strictEqual(window.findKnownSupplementInfo('Definitely Not A Real Supplement'), null);
  assert.notStrictEqual(window.findKnownSupplementInfo('vitamin d3'), null, 'precondition: a real, lowercased entry name must still match');
});

// --- Create: addMySupplement, including dedupe -----------------------------

test('REAL invocation: addMySupplement appends a new name and re-renders', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.addMySupplement('Creatine');
  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Creatine']);
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1, 'the freshly-added item must appear in the re-rendered DOM');
});

test('sabotage-relevant: adding a name that already exists (case-insensitively) is a no-op, not a duplicate row', async (assert)=>{
  const { window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine']),
  }) + otherGlobals(), scriptChunks);
  await window.addMySupplement('creatine');
  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Creatine'], 'the list must still have exactly one entry, not two');
});

test('REAL invocation: typing a name and clicking Add renders it and clears the input (end-to-end UI path)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('mySupplementAddInput').value = '  Magnesium  ';
  document.getElementById('mySupplementAddBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Magnesium'], 'the value must be trimmed before saving');
  assert.strictEqual(document.getElementById('mySupplementAddInput').value, '', 'input must clear after a successful add');
});

// --- Update: the real per-day taken toggle ----------------------------------

test('REAL invocation: clicking a row toggles it to taken in both storage (dated) and the DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Fish Oil']),
  }) + otherGlobals('2026-08-20'), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.supplement-row').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['supplement-taken:2026-08-20']);
  assert.deepStrictEqual(stored, {Creatine: true}, 'must be written under the dated key, and only the clicked item flips');
  const updatedRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(updatedRows[0].querySelector('.supplement-row').classList.contains('done'), true);
  assert.strictEqual(updatedRows[1].querySelector('.supplement-row').classList.contains('done'), false, 'Fish Oil must stay untouched');
});

test('sabotage-relevant: taken state for one date never leaks into another date\'s map', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine']),
    'supplement-taken:2026-08-19': JSON.stringify({Creatine: true}),
  }) + otherGlobals('2026-08-20'), scriptChunks);

  // Today (Aug 20) must render as NOT taken, even though yesterday's map says true.
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows[0].querySelector('.supplement-row').classList.contains('done'), false, 'a different date\'s taken state must not bleed into today');

  // Toggling today must not touch yesterday's stored map at all.
  rows[0].querySelector('.supplement-row').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.deepStrictEqual(JSON.parse(window.storage.__store['supplement-taken:2026-08-19']), {Creatine: true}, 'yesterday\'s map must be byte-for-byte untouched');
  assert.deepStrictEqual(JSON.parse(window.storage.__store['supplement-taken:2026-08-20']), {Creatine: true}, 'today\'s own map must have been written');
});

// --- Delete: real makeSwipeable-driven removal, independent of taken state --

test('REAL invocation: swipe-delete removes the item from the maintained list but does not touch other items\' taken state', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Magnesium', 'Fish Oil']),
    'supplement-taken:2026-08-20': JSON.stringify({Creatine: true, Magnesium: true, 'Fish Oil': true}),
  }) + otherGlobals('2026-08-20'), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3, 'precondition: three rows');
  rows[1].querySelector('.swipe-delete-bg').click(); // deletes Magnesium
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Creatine', 'Fish Oil'], 'Magnesium must be gone; the others survive in order');
  const remainingRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 2);
  assert.strictEqual(remainingRows[0].querySelector('.supplement-row').classList.contains('done'), true, 'Creatine\'s taken state must survive an unrelated deletion');
  assert.strictEqual(remainingRows[1].querySelector('.supplement-row').classList.contains('done'), true, 'Fish Oil\'s taken state must survive too');
});

test('REAL invocation: the Undo toast after a delete restores the exact removed item at its original position', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Magnesium']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.swipe-delete-bg').click(); // deletes Creatine
  await new Promise(r=> setTimeout(r, 20));
  assert.deepStrictEqual(JSON.parse(window.storage.__store['my-supplements']), ['Magnesium']);
  assert.match(document.getElementById('undoToastText').textContent, /Creatine removed/);

  document.getElementById('undoToastBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const restored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(restored, ['Creatine', 'Magnesium'], 'undo must restore Creatine at its original position');
  const restoredRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(restoredRows.length, 2);
});

test('an item name with HTML-significant characters is escaped, not injected as markup', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['<script>alert(1)</script>']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  assert.strictEqual(document.querySelectorAll('#mySupplementsList script').length, 0, 'a raw <script> tag in a supplement name must never become a real DOM element');
  assert.match(document.getElementById('mySupplementsList').textContent, /<script>alert\(1\)<\/script>/, 'the text must still be visible as literal text');
});

run();
