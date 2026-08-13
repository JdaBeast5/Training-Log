'use strict';
// Behavioral coverage for the Blood Glucose log CRUD flow (Diabetes
// condition tracker) — Phase B "Tier 3" backfill, same gap named for
// water/weight/BP. Covers the real saveGlucose click handler (Create,
// including the isBackdating()-conditional `time` field), the real
// loadGlucose renderer including categorizeGlucose's context-aware label
// (Read), and the real swipe-delete flow (Delete) — with particular
// attention to the exact duplicate-reading scenario this file's own real
// comment calls out:
//
//   "The old filter compared date/value/context and ignored `time`, so two
//   readings of the same number in the same context on one day — the exact
//   thing someone with diabetes logs — deleted as a pair."
//
// wireSwipeDeleteList (shared by weight/BP/glucose/etc) fixed this by
// deleting by array-identity (source.indexOf(target)) rather than by value
// match — this file's delete tests specifically recreate that exact
// duplicate shape to prove the fix still holds.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const categorizeGlucoseSrc = extractFunction(src, 'categorizeGlucose');
const loadGlucoseSrc = extractFunction(src, 'loadGlucose');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const wireSwipeDeleteListSrc = extractFunction(src, 'wireSwipeDeleteList');
const renderCollapsibleListSrc = extractFunction(src, 'renderCollapsibleList');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const saveGlucoseWiringSrc = extractStatement(src, "document.getElementById('saveGlucose').addEventListener('click'");

const bodyHtml = `
  <input type="number" inputmode="numeric" id="glucoseInput" placeholder="mg/dL" aria-label="Blood glucose in mg/dL">
  <select id="glucoseContext" class="care-input">
    <option value="fasting">Fasting / before meal</option>
    <option value="postmeal">After meal</option>
  </select>
  <button id="saveGlucose">Log</button>
  <div class="status-msg" id="glucoseSaveStatus"></div>
  <div class="weight-list" id="glucoseList"><div class="empty-note">No readings yet — log your first one.</div></div>
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

function otherGlobals(opts){
  opts = opts || {};
  return `
    var undoToastTimeout = null;
    window.selectedLogDate = ${JSON.stringify(opts.selectedLogDate || '2026-08-10')};
    window.matchMedia = ()=> ({ matches: true }); // reduced-motion: skip the swipe-delete animation timer
    window.isBackdating = ${opts.isBackdating ? '()=> true' : '()=> false'};
    window.nowTimeKey = ()=> ${JSON.stringify(opts.nowTime || '08:15')};
  `;
}

const scriptChunks = [
  categorizeGlucoseSrc, buildSwipeItemSrc, renderCollapsibleListSrc, makeSwipeableSrc,
  showUndoToastSrc, wireSwipeDeleteListSrc, loadGlucoseSrc, saveGlucoseWiringSrc,
];

const { test, run } = makeRunner('test-glucose-log-crud.js');

// --- Read/render: empty, one, several, context-aware category labels ----

test('loadGlucose renders the empty state when nothing has been saved', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const list = document.getElementById('glucoseList');
  assert.match(list.innerHTML, /No readings yet/);
  assert.strictEqual(list.querySelectorAll('.swipe-item').length, 0);
});

test('loadGlucose renders a single reading with its context label and category', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([{date:'2026-08-01', value:95, context:'fasting', time:'07:00'}]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1);
  assert.match(rows[0].textContent, /fasting/);
  assert.match(rows[0].textContent, /95 mg\/dL/);
  assert.match(rows[0].textContent, /In range/);
});

test('the SAME numeric value is categorized differently depending on context (150 fasting = High, 150 post-meal = In range)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([
      {date:'2026-08-01', value:150, context:'fasting', time:'07:00'},
      {date:'2026-08-02', value:150, context:'postmeal', time:'13:00'},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = [...document.getElementById('glucoseList').querySelectorAll('.swipe-item')];
  // Rendered most-recent-first: Aug 2 (postmeal) then Aug 1 (fasting).
  assert.match(rows[0].textContent, /post-meal/);
  assert.match(rows[0].textContent, /In range/, '150 mg/dL post-meal must read as In range');
  assert.match(rows[1].textContent, /fasting/);
  assert.match(rows[1].textContent, /High/, '150 mg/dL fasting must read as High (fasting ceiling is 130)');
});

test('a low reading (<=70) renders the Low label regardless of context', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([{date:'2026-08-01', value:65, context:'postmeal', time:'14:00'}]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.match(rows[0].textContent, /Low/);
});

test('sabotage-relevant edge case: two readings, same date, same value, same context, DIFFERENT time both render as separate rows (this is the exact real-world duplicate this app is built to support — an AM and a PM reading that happen to match)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([
      {date:'2026-08-05', value:110, context:'fasting', time:'07:00'},
      {date:'2026-08-05', value:110, context:'fasting', time:'19:00'},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 2, 'both readings must render as separate rows, not merged');
});

// --- Create: the real saveGlucose click handler -------------------------

test('REAL invocation: clicking Log with a value saves under glucose-log with the real nowTimeKey time, clears the input, and re-renders the list', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals({selectedLogDate:'2026-08-10', isBackdating:false, nowTime:'08:15'}), scriptChunks);
  document.getElementById('glucoseInput').value = '105';
  document.getElementById('glucoseContext').value = 'fasting';
  document.getElementById('saveGlucose').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['glucose-log']);
  assert.deepStrictEqual(stored, [{date:'2026-08-10', value:105, context:'fasting', time:'08:15'}]);
  assert.strictEqual(document.getElementById('glucoseInput').value, '');
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1, 'the freshly-saved reading must actually appear in the re-rendered DOM');
});

test('REAL invocation: when backdating a past day, the saved entry has no time field (matches the real isBackdating() ? undefined : nowTimeKey() branch)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals({selectedLogDate:'2026-07-20', isBackdating:true}), scriptChunks);
  document.getElementById('glucoseInput').value = '98';
  document.getElementById('glucoseContext').value = 'fasting';
  document.getElementById('saveGlucose').click();
  await new Promise(r=> setTimeout(r, 20));
  const stored = JSON.parse(window.storage.__store['glucose-log']);
  assert.strictEqual(stored.length, 1);
  assert.ok(!Object.prototype.hasOwnProperty.call(JSON.parse(window.storage.__store['glucose-log'])[0], 'time') || stored[0].time === undefined, 'a backdated entry must not carry a fabricated same-day time');
});

test('REAL invocation: a low-glucose save shows the urgent hypoglycemia warning status', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('glucoseInput').value = '60';
  document.getElementById('glucoseContext').value = 'fasting';
  document.getElementById('saveGlucose').click();
  await new Promise(r=> setTimeout(r, 20));
  const statusEl = document.getElementById('glucoseSaveStatus');
  assert.match(statusEl.textContent, /Hypoglycemia|fast-acting carbs/i);
  assert.ok(statusEl.classList.contains('warn'));
});

test('REAL invocation: clicking Log with an empty value does not save anything', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('glucoseInput').value = '';
  document.getElementById('saveGlucose').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['glucose-log'], undefined);
});

// --- Delete: real wireSwipeDeleteList / swipe-delete-bg click -----------

test('REAL invocation: clicking the swipe-delete background on a MIDDLE row removes exactly that reading, leaving the other two untouched', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([
      {date:'2026-08-01', value:95, context:'fasting', time:'07:00'},
      {date:'2026-08-05', value:140, context:'postmeal', time:'13:00'},
      {date:'2026-08-03', value:200, context:'postmeal', time:'19:00'},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3, 'precondition: three rows rendered');
  // Most-recent-first: Aug 5 (140), Aug 3 (200), Aug 1 (95).
  rows[1].querySelector('.swipe-delete-bg').click(); // deletes Aug 3 / 200
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['glucose-log']);
  assert.strictEqual(stored.length, 2, 'exactly one reading must be removed from storage');
  assert.ok(!stored.some(e=> e.date==='2026-08-03'), 'the Aug 3 reading must be gone');
  assert.ok(stored.some(e=> e.date==='2026-08-01'), 'Aug 1 must survive untouched');
  assert.ok(stored.some(e=> e.date==='2026-08-05'), 'Aug 5 must survive untouched');

  const remainingRows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 2);
});

test('REGRESSION GUARD (real bug documented in this app\'s own source comment): two readings with identical date/value/context but DIFFERENT time — deleting one removes exactly that one, not both', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([
      {date:'2026-08-05', value:110, context:'fasting', time:'07:00'},
      {date:'2026-08-05', value:110, context:'fasting', time:'19:00'},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 2, 'precondition: both readings rendered');
  rows[0].querySelector('.swipe-delete-bg').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['glucose-log']);
  assert.strictEqual(stored.length, 1, 'exactly ONE reading must survive — the old date/value/context-only filter (ignoring time) would have matched and deleted BOTH');
  const remainingRows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 1, 'DOM must also show exactly one remaining row, not zero');
});

test('REAL invocation: the Undo toast restores the exact pre-delete reading, including its time field, on both storage and DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'glucose-log': JSON.stringify([
      {date:'2026-08-01', value:95, context:'fasting', time:'07:00'},
      {date:'2026-08-05', value:140, context:'postmeal', time:'13:00'},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadGlucose();
  const rows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.swipe-delete-bg').click(); // deletes the Aug 5 / 140 postmeal row
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(JSON.parse(window.storage.__store['glucose-log']).length, 1, 'precondition: one reading deleted');

  document.getElementById('undoToastBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const restored = JSON.parse(window.storage.__store['glucose-log']);
  assert.strictEqual(restored.length, 2);
  assert.ok(restored.some(e=> e.date==='2026-08-05' && e.value===140 && e.context==='postmeal' && e.time==='13:00'), 'the specific deleted reading must come back with all its fields intact');
  const restoredRows = document.getElementById('glucoseList').querySelectorAll('.swipe-item');
  assert.strictEqual(restoredRows.length, 2);
});

run();
