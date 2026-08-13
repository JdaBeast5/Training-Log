'use strict';
// Behavioral coverage for the Bodyweight log CRUD flow — Phase B "Tier 3"
// backfill (per-metric trend cards, water/weight/BP/glucose CRUD, grocery
// CRUD were named as never having real behavioral tests). This covers the
// real saveWeight click handler (Create), the real loadWeights renderer
// (Read), and the real wireSwipeDeleteList-driven delete (Delete) — no
// separate "Update" flow exists for a weigh-in: like every other swipe-list
// in this app (see wireSwipeDeleteList's own comment block), editing an
// entry means deleting it and logging a fresh one, not an in-place edit UI.
// Confirmed by reading the code, not assumed.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

// document.getElementById('saveWeight').addEventListener('click', async ()=>{...});
// is a top-level statement, not a named function — not reachable by
// extractFunction. Extracted the same way this repo's other tests handle
// small unnamed top-level wiring (see test-nav-more-panel.js).
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const loadWeightsSrc = extractFunction(src, 'loadWeights');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const wireSwipeDeleteListSrc = extractFunction(src, 'wireSwipeDeleteList');
const renderCollapsibleListSrc = extractFunction(src, 'renderCollapsibleList');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const toDisplayWeightSrc = extractFunction(src, 'toDisplayWeight');
const toCanonicalLbSrc = extractFunction(src, 'toCanonicalLb');
const trimUnitNumSrc = extractFunction(src, 'trimUnitNum');
const fmtWeightSrc = extractFunction(src, 'fmtWeight');
const saveWeightWiringSrc = extractStatement(src, "document.getElementById('saveWeight').addEventListener('click'");

// Real markup for the pieces this flow touches, assembled directly (the
// weightInput/saveWeight/weightList trio sits inside a larger Log-tab card
// that also contains unrelated siblings not needed here) — matching the
// established pattern of hand-assembling a minimal-but-real fixture rather
// than extracting a huge ancestor card (see test-fallback-entry-consolidation.js).
const bodyHtml = `
  <input type="number" step="0.1" inputmode="decimal" id="weightInput" placeholder="Weight today (lb)" aria-label="Weight today (lb)">
  <button id="saveWeight">Log</button>
  <div class="status-msg" id="weightSaveStatus"></div>
  <div class="weight-list" id="weightList"><div class="empty-note">No entries yet — log your first weigh-in.</div></div>
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

// Leaf dependencies the real saveWeight handler also touches (profile/target
// sync when the new entry is the latest on record) that are genuinely a
// separate concern from "does the entry get saved and rendered" — stubbed
// as no-ops/plain values, same treatment test-fallback-entry-consolidation.js
// gives renderWorkout/refreshSessionSummary/etc.
function otherGlobals(opts){
  opts = opts || {};
  return `
    var undoToastTimeout = null;
    window.selectedLogDate = ${JSON.stringify(opts.selectedLogDate || '2026-08-10')};
    window.weightUnit = 'lb';
    window.userProfile = { weight: ${opts.priorProfileWeight != null ? opts.priorProfileWeight : 175} };
    window.targets = {};
    window.matchMedia = ()=> ({ matches: true }); // reduced-motion: skip the swipe-delete animation timer
    window.saveProfile = async ()=>{};
    window.computeTargets = ()=>({});
    window.applyTargetsToUI = ()=>{};
    window.renderProfileSummary = ()=>{};
    window.renderWater = ()=>{};
    window.loadFoodLog = ()=>{};
    window.renderTodayInsights = ()=>{};
    window.formatLogDateLabel = (d)=> d;
  `;
}

const scriptChunks = [
  toDisplayWeightSrc, toCanonicalLbSrc, trimUnitNumSrc, fmtWeightSrc,
  buildSwipeItemSrc, renderCollapsibleListSrc, makeSwipeableSrc, showUndoToastSrc,
  wireSwipeDeleteListSrc, loadWeightsSrc, saveWeightWiringSrc,
];

const { test, run } = makeRunner('test-weight-log-crud.js');

// --- Read/render: empty, one, several, duplicate-day ------------------

test('loadWeights renders the empty state when nothing has been saved', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const list = document.getElementById('weightList');
  assert.match(list.innerHTML, /No entries yet/);
  assert.strictEqual(list.querySelectorAll('.swipe-item').length, 0);
});

test('loadWeights renders a single entry as a real swipe-item row, most-recent first with only one entry', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([{date:'2026-08-01', weight:180}]),
  }) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const rows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1);
  assert.match(rows[0].textContent, /180 lb/);
});

test('loadWeights sorts several entries most-recent-first', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([
      {date:'2026-08-01', weight:180},
      {date:'2026-08-05', weight:178},
      {date:'2026-08-03', weight:179},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const rows = [...document.getElementById('weightList').querySelectorAll('.swipe-item')];
  // Two spans render back-to-back with no separator (date then weight), so
  // the whole row's textContent concatenates them (e.g. "Aug 5178 lb") —
  // reading the second span directly avoids that ambiguity.
  const weights = rows.map(r=> r.querySelectorAll('.weight-item span')[1].textContent.match(/^(\d+)/)[1]);
  assert.deepStrictEqual(weights, ['178', '179', '180'], 'Aug 5 (178) must render before Aug 3 (179) before Aug 1 (180)');
});

test('a duplicate-day entry (two weigh-ins logged the same day) both render as separate rows, not merged or dropped', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([
      {date:'2026-08-05', weight:180},
      {date:'2026-08-05', weight:179.4},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const rows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 2, 'both same-day entries must render, not be collapsed into one');
});

// --- Create: the real saveWeight click handler -------------------------

test('REAL invocation: clicking Log with a value saves it under weight-log, clears the input, and re-renders the list', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals({selectedLogDate:'2026-08-10'}), scriptChunks);
  document.getElementById('weightInput').value = '182.4';
  document.getElementById('saveWeight').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['weight-log']);
  assert.deepStrictEqual(stored, [{date:'2026-08-10', weight:182.4}]);
  assert.strictEqual(document.getElementById('weightInput').value, '', 'input must clear after a successful save');
  const rows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1, 'the freshly-saved entry must actually appear in the re-rendered DOM');
  assert.match(rows[0].textContent, /182\.4 lb/);
});

test('REAL invocation: clicking Log with an empty/zero input does not save anything', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('weightInput').value = '';
  document.getElementById('saveWeight').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['weight-log'], undefined, 'a blank input must not create a weight-log entry');
});

test('REAL invocation: a new entry appends to existing entries rather than overwriting them', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([{date:'2026-08-01', weight:180}]),
  }) + otherGlobals({selectedLogDate:'2026-08-10'}), scriptChunks);
  document.getElementById('weightInput').value = '175';
  document.getElementById('saveWeight').click();
  await new Promise(r=> setTimeout(r, 20));
  const stored = JSON.parse(window.storage.__store['weight-log']);
  assert.strictEqual(stored.length, 2, 'the pre-existing entry must survive a new save');
  assert.deepStrictEqual(stored[0], {date:'2026-08-01', weight:180});
  assert.deepStrictEqual(stored[1], {date:'2026-08-10', weight:175});
});

// --- Delete: real wireSwipeDeleteList / swipe-delete-bg click -----------

test('REAL invocation: clicking the swipe-delete background on a MIDDLE row removes exactly that entry, leaving the other two untouched (catches an off-by-one/hardcoded-index regression, not just "a row disappeared")', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([
      {date:'2026-08-01', weight:180},
      {date:'2026-08-05', weight:182},
      {date:'2026-08-03', weight:179},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const rows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3, 'precondition: three rows rendered');
  // Rendered order is most-recent-first: Aug 5 (182), Aug 3 (179), Aug 1 (180).
  // Deleting the MIDDLE row (index 1, Aug 3/179) — not index 0 — means a
  // sabotaged delete that always targets index 0 (or any other wrong index)
  // provably fails this assertion instead of accidentally passing.
  rows[1].querySelector('.swipe-delete-bg').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['weight-log']);
  assert.strictEqual(stored.length, 2, 'exactly one entry must be removed from storage');
  assert.ok(!stored.some(e=> e.date==='2026-08-03'), 'the Aug 3 entry must be gone');
  assert.ok(stored.some(e=> e.date==='2026-08-01' && e.weight===180), 'Aug 1 must survive untouched');
  assert.ok(stored.some(e=> e.date==='2026-08-05' && e.weight===182), 'Aug 5 must survive untouched');

  const remainingRows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 2, 'the DOM must also reflect the removal, not just storage');
});

test('REAL invocation: with two TRUE duplicate entries (identical date AND weight — a real scenario per this app\'s own wireSwipeDeleteList comment), deleting one removes exactly one, not both', async (assert)=>{
  // This is the exact bug class wireSwipeDeleteList's own header comment
  // documents as previously real for weight/BP/glucose/sleep/etc: a delete
  // that matched by VALUE (date+weight) rather than by object identity would
  // remove every entry that looks like the tapped one — here, both. This
  // proves the real code still deletes by identity (source.indexOf(target)),
  // not by re-deriving a value match.
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([
      {date:'2026-08-05', weight:180},
      {date:'2026-08-05', weight:180},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const rows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 2, 'precondition: both duplicate rows rendered');
  rows[0].querySelector('.swipe-delete-bg').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['weight-log']);
  assert.strictEqual(stored.length, 1, 'exactly ONE of the two identical entries must survive — a value-based delete would have removed both');
  const remainingRows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 1);
});

test('REAL invocation: the Undo toast restores the exact pre-delete list on both storage and DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'weight-log': JSON.stringify([
      {date:'2026-08-01', weight:180},
      {date:'2026-08-05', weight:182},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadWeights();
  const rows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.swipe-delete-bg').click(); // deletes the Aug 5 / 182 row (renders first, most-recent)
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(JSON.parse(window.storage.__store['weight-log']).length, 1, 'precondition: one entry deleted');

  document.getElementById('undoToastBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const restored = JSON.parse(window.storage.__store['weight-log']);
  assert.strictEqual(restored.length, 2, 'undo must restore both entries');
  assert.ok(restored.some(e=> e.date==='2026-08-05' && e.weight===182), 'the specific deleted entry must come back, not a blank placeholder');
  const restoredRows = document.getElementById('weightList').querySelectorAll('.swipe-item');
  assert.strictEqual(restoredRows.length, 2, 'DOM must reflect the restore too');
});

run();
