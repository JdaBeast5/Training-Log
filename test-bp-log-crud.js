'use strict';
// Behavioral coverage for the Blood Pressure log CRUD flow (Hypertension
// condition tracker) — Phase B "Tier 3" backfill, same gap named for
// water/weight/glucose. Covers the real saveBP click handler (Create), the
// real loadBP renderer including categorizeBP's category label (Read), and
// the real swipe-delete flow (Delete). No separate Update flow exists —
// same as weight/glucose, this app's swipe-lists are delete-and-relog, not
// in-place edit (confirmed by reading the code, not assumed).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const categorizeBPSrc = extractFunction(src, 'categorizeBP');
const loadBPSrc = extractFunction(src, 'loadBP');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const wireSwipeDeleteListSrc = extractFunction(src, 'wireSwipeDeleteList');
const renderCollapsibleListSrc = extractFunction(src, 'renderCollapsibleList');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const saveBPWiringSrc = extractStatement(src, "document.getElementById('saveBP').addEventListener('click'");

const bodyHtml = `
  <input type="number" inputmode="numeric" id="bpSystolicInput" placeholder="Systolic" aria-label="Systolic blood pressure">
  <input type="number" inputmode="numeric" id="bpDiastolicInput" placeholder="Diastolic" aria-label="Diastolic blood pressure">
  <button id="saveBP">Log</button>
  <div class="status-msg" id="bpSaveStatus"></div>
  <div class="weight-list" id="bpList"><div class="empty-note">No readings yet — log your first one.</div></div>
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

function otherGlobals(selectedLogDate){
  return `
    var undoToastTimeout = null;
    window.selectedLogDate = ${JSON.stringify(selectedLogDate || '2026-08-10')};
    window.matchMedia = ()=> ({ matches: true }); // reduced-motion: skip the swipe-delete animation timer
  `;
}

const scriptChunks = [
  categorizeBPSrc, buildSwipeItemSrc, renderCollapsibleListSrc, makeSwipeableSrc,
  showUndoToastSrc, wireSwipeDeleteListSrc, loadBPSrc, saveBPWiringSrc,
];

const { test, run } = makeRunner('test-bp-log-crud.js');

// --- Read/render: empty, one, several, category labels ------------------

test('loadBP renders the empty state when nothing has been saved', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const list = document.getElementById('bpList');
  assert.match(list.innerHTML, /No readings yet/);
  assert.strictEqual(list.querySelectorAll('.swipe-item').length, 0);
});

test('loadBP renders a single reading with its real categorizeBP label', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([{date:'2026-08-01', systolic:118, diastolic:76}]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1);
  assert.match(rows[0].textContent, /118\/76/);
  assert.match(rows[0].textContent, /Normal/);
});

test('loadBP sorts several readings most-recent-first and labels each category correctly (Normal/Elevated/Stage 1/Stage 2/Crisis)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([
      {date:'2026-08-01', systolic:118, diastolic:76},  // Normal
      {date:'2026-08-05', systolic:135, diastolic:85},  // Stage 1
      {date:'2026-08-03', systolic:150, diastolic:95},  // Stage 2
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = [...document.getElementById('bpList').querySelectorAll('.swipe-item')];
  assert.strictEqual(rows.length, 3);
  assert.match(rows[0].textContent, /135\/85/, 'Aug 5 (most recent) must render first');
  assert.match(rows[0].textContent, /Stage 1/);
  assert.match(rows[1].textContent, /150\/95/);
  assert.match(rows[1].textContent, /Stage 2/);
  assert.match(rows[2].textContent, /118\/76/);
  assert.match(rows[2].textContent, /Normal/);
});

test('a hypertensive-crisis reading renders the Crisis label', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([{date:'2026-08-01', systolic:185, diastolic:100}]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.match(rows[0].textContent, /Hypertensive Crisis/);
});

test('a duplicate-day reading (AM and PM readings logged the same day) both render as separate rows', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([
      {date:'2026-08-05', systolic:120, diastolic:80},
      {date:'2026-08-05', systolic:132, diastolic:84},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 2, 'both same-day readings must render, not be collapsed into one');
});

// --- Create: the real saveBP click handler ------------------------------

test('REAL invocation: clicking Log with valid systolic/diastolic saves under bp-log, clears both inputs, and re-renders the list', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals('2026-08-10'), scriptChunks);
  document.getElementById('bpSystolicInput').value = '128';
  document.getElementById('bpDiastolicInput').value = '82';
  document.getElementById('saveBP').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['bp-log']);
  assert.deepStrictEqual(stored, [{date:'2026-08-10', systolic:128, diastolic:82}]);
  assert.strictEqual(document.getElementById('bpSystolicInput').value, '');
  assert.strictEqual(document.getElementById('bpDiastolicInput').value, '');
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1, 'the freshly-saved reading must actually appear in the re-rendered DOM');
});

test('REAL invocation: a crisis-range reading shows the urgent warning status message', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('bpSystolicInput').value = '190';
  document.getElementById('bpDiastolicInput').value = '125';
  document.getElementById('saveBP').click();
  await new Promise(r=> setTimeout(r, 20));
  const statusEl = document.getElementById('bpSaveStatus');
  assert.match(statusEl.textContent, /crisis/i);
  assert.ok(statusEl.classList.contains('warn'), 'the urgent status message must carry the warn class');
});

test('REAL invocation: clicking Log with a missing diastolic value does not save anything', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('bpSystolicInput').value = '120';
  document.getElementById('bpDiastolicInput').value = '';
  document.getElementById('saveBP').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['bp-log'], undefined, 'an incomplete reading must not be saved');
});

// --- Delete: real wireSwipeDeleteList / swipe-delete-bg click -----------

test('REAL invocation: clicking the swipe-delete background on a MIDDLE row removes exactly that reading, leaving the other two untouched', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([
      {date:'2026-08-01', systolic:118, diastolic:76},
      {date:'2026-08-05', systolic:135, diastolic:85},
      {date:'2026-08-03', systolic:150, diastolic:95},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3, 'precondition: three rows rendered');
  // Rendered order most-recent-first: Aug 5 (135/85), Aug 3 (150/95), Aug 1 (118/76).
  rows[1].querySelector('.swipe-delete-bg').click(); // deletes Aug 3 / 150/95
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['bp-log']);
  assert.strictEqual(stored.length, 2, 'exactly one reading must be removed from storage');
  assert.ok(!stored.some(e=> e.date==='2026-08-03'), 'the Aug 3 reading must be gone');
  assert.ok(stored.some(e=> e.date==='2026-08-01'), 'Aug 1 must survive untouched');
  assert.ok(stored.some(e=> e.date==='2026-08-05'), 'Aug 5 must survive untouched');

  const remainingRows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 2, 'the DOM must also reflect the removal, not just storage');
});

test('REAL invocation: with two TRUE duplicate readings (identical date/systolic/diastolic — a real AM/PM scenario), deleting one removes exactly one, not both', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([
      {date:'2026-08-05', systolic:120, diastolic:80},
      {date:'2026-08-05', systolic:120, diastolic:80},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 2, 'precondition: both duplicate rows rendered');
  rows[0].querySelector('.swipe-delete-bg').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['bp-log']);
  assert.strictEqual(stored.length, 1, 'exactly ONE of the two identical readings must survive — a value-based delete would have removed both');
  const remainingRows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 1);
});

test('REAL invocation: the Undo toast restores the exact pre-delete reading on both storage and DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'bp-log': JSON.stringify([
      {date:'2026-08-01', systolic:118, diastolic:76},
      {date:'2026-08-05', systolic:135, diastolic:85},
    ]),
  }) + otherGlobals(), scriptChunks);
  await window.loadBP();
  const rows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.swipe-delete-bg').click(); // deletes the Aug 5 / 135/85 row
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(JSON.parse(window.storage.__store['bp-log']).length, 1, 'precondition: one reading deleted');

  document.getElementById('undoToastBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const restored = JSON.parse(window.storage.__store['bp-log']);
  assert.strictEqual(restored.length, 2, 'undo must restore both readings');
  assert.ok(restored.some(e=> e.date==='2026-08-05' && e.systolic===135 && e.diastolic===85), 'the specific deleted reading must come back exactly, not a blank placeholder');
  const restoredRows = document.getElementById('bpList').querySelectorAll('.swipe-item');
  assert.strictEqual(restoredRows.length, 2, 'DOM must reflect the restore too');
});

run();
