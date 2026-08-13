'use strict';
// Behavioral coverage for the Grocery List's DOM-facing CRUD flow — Phase B
// "Tier 3" backfill. test-grocery-list.js already covers the persistence
// layer (loadGroceryList/saveGroceryList/addGroceryItems) but explicitly
// stubs renderGroceryList out via a missing #groceryListItems element (its
// own comment says so), so the actual rendering, the checked-item toggle
// (this app's only "Update" for a grocery item), the swipe-to-delete, and
// the "Clear checked items" bulk action have never been exercised against
// real DOM. This file covers exactly that gap, reusing the same real
// functions and the same mutable-storage convention as test-grocery-list.js.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const loadGroceryListSrc = extractFunction(src, 'loadGroceryList');
const saveGroceryListSrc = extractFunction(src, 'saveGroceryList');
const addGroceryItemsSrc = extractFunction(src, 'addGroceryItems');
const renderGroceryListSrc = extractFunction(src, 'renderGroceryList');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const addBtnWiringSrc = extractStatement(src, "document.getElementById('groceryAddBtn').addEventListener('click'");
const clearCheckedWiringSrc = extractStatement(src, "document.getElementById('groceryClearCheckedBtn').addEventListener('click'");

const bodyHtml = `
  <input type="text" id="groceryAddInput" class="care-input" placeholder="Add an item" aria-label="Add an item">
  <button id="groceryAddBtn">Add</button>
  <div id="groceryListItems"></div>
  <button type="button" class="reorder-btn" id="groceryClearCheckedBtn" style="display:none;">Clear checked items</button>
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

// icon() itself (SVG glyph markup) is a leaf presentation concern with its
// own coverage elsewhere (test-emoji-check-icon-migration.js) — stubbed to a
// simple marker here so this file's assertions stay about grocery
// list/checked-state behavior, not glyph internals. Same treatment
// test-nav-more-panel.js gives VIEW_RENDERERS.
const otherGlobals = `
  var undoToastTimeout = null;
  window.matchMedia = ()=> ({ matches: true }); // reduced-motion: skip the swipe-delete animation timer
  window.icon = (name)=> name === 'check' ? '<span class="check-glyph">CHECK</span>' : '';
`;

const scriptChunks = [
  escapeHtmlSrc, loadGroceryListSrc, saveGroceryListSrc, addGroceryItemsSrc, renderGroceryListSrc,
  buildSwipeItemSrc, makeSwipeableSrc, showUndoToastSrc, addBtnWiringSrc, clearCheckedWiringSrc,
];

const { test, run } = makeRunner('test-grocery-render-crud.js');

// --- Read/render: empty, one, several ------------------------------------

test('renderGroceryList shows the empty state and hides Clear-checked when the list is empty', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  assert.match(document.getElementById('groceryListItems').innerHTML, /Nothing here yet/);
  assert.strictEqual(document.getElementById('groceryClearCheckedBtn').style.display, 'none');
});

test('renderGroceryList renders a single unchecked item as a real swipe-item row', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([{text:'eggs', checked:false}]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1);
  assert.match(rows[0].textContent, /eggs/);
  assert.strictEqual(rows[0].querySelector('.grocery-item').classList.contains('done'), false);
  assert.strictEqual(document.getElementById('groceryClearCheckedBtn').style.display, 'none', 'no checked items yet, so Clear must stay hidden');
});

test('renderGroceryList renders several items, checked and unchecked, and shows Clear-checked when at least one is checked', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([
      {text:'eggs', checked:false},
      {text:'milk', checked:true},
      {text:'bread', checked:false},
    ]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3);
  assert.strictEqual(rows[1].querySelector('.grocery-item').classList.contains('done'), true, 'milk is checked, must carry the done class');
  assert.strictEqual(rows[0].querySelector('.grocery-item').classList.contains('done'), false);
  assert.notStrictEqual(document.getElementById('groceryClearCheckedBtn').style.display, 'none');
});

test('an item name with HTML-significant characters is escaped, not injected as markup', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([{text:'<script>alert(1)</script>', checked:false}]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  const textEl = document.querySelector('.grocery-item-text');
  assert.strictEqual(textEl.querySelectorAll('script').length, 0, 'a raw <script> tag in item text must never become a real DOM element');
  assert.match(textEl.textContent, /<script>alert\(1\)<\/script>/, 'the text must still be visible as literal text');
});

// --- Update: the real checked-toggle click -------------------------------

test('REAL invocation: clicking an unchecked item toggles it to checked in both storage and the DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([{text:'eggs', checked:false}, {text:'milk', checked:false}]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  rows[0].querySelector('.grocery-item').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['grocery-list']);
  assert.deepStrictEqual(stored, [{text:'eggs', checked:true}, {text:'milk', checked:false}], 'only the clicked item (eggs) flips, milk stays untouched');
  const updatedRows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(updatedRows[0].querySelector('.grocery-item').classList.contains('done'), true);
});

test('REAL invocation: clicking a checked item toggles it back to unchecked (a real "un-buy" scenario)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([{text:'eggs', checked:true}]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  document.querySelector('.grocery-item').click();
  await new Promise(r=> setTimeout(r, 20));
  const stored = JSON.parse(window.storage.__store['grocery-list']);
  assert.deepStrictEqual(stored, [{text:'eggs', checked:false}]);
});

// --- Delete: real makeSwipeable-driven removal ----------------------------

test('REAL invocation: clicking the swipe-delete background on a MIDDLE row removes exactly that item, leaving the others untouched', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([
      {text:'eggs', checked:false},
      {text:'milk', checked:false},
      {text:'bread', checked:false},
    ]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3, 'precondition: three rows');
  rows[1].querySelector('.swipe-delete-bg').click(); // deletes "milk"
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['grocery-list']);
  assert.deepStrictEqual(stored.map(i=> i.text), ['eggs', 'bread'], 'milk must be gone; eggs and bread must survive in order');
  const remainingRows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 2, 'DOM must reflect the removal too');
});

test('REAL invocation: the Undo toast after a delete restores the exact removed item at its original position', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([
      {text:'eggs', checked:false},
      {text:'milk', checked:true},
    ]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  rows[0].querySelector('.swipe-delete-bg').click(); // deletes "eggs"
  await new Promise(r=> setTimeout(r, 20));
  assert.deepStrictEqual(JSON.parse(window.storage.__store['grocery-list']).map(i=> i.text), ['milk']);
  assert.match(document.getElementById('undoToastText').textContent, /eggs removed/);

  document.getElementById('undoToastBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const restored = JSON.parse(window.storage.__store['grocery-list']);
  assert.deepStrictEqual(restored, [{text:'eggs', checked:false}, {text:'milk', checked:true}], 'undo must restore eggs at its original position with its original checked state, not appended at the end');
  const restoredRows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(restoredRows.length, 2);
});

// --- Bulk action: the real "Clear checked items" button -------------------

test('REAL invocation: Clear checked items removes only checked items and re-hides itself once none remain checked', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'grocery-list': JSON.stringify([
      {text:'eggs', checked:false},
      {text:'milk', checked:true},
      {text:'bread', checked:true},
    ]),
  }) + otherGlobals, scriptChunks);
  await window.renderGroceryList();
  assert.notStrictEqual(document.getElementById('groceryClearCheckedBtn').style.display, 'none', 'precondition: Clear button visible with checked items present');

  document.getElementById('groceryClearCheckedBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['grocery-list']);
  assert.deepStrictEqual(stored, [{text:'eggs', checked:false}], 'only the unchecked item must survive');
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(document.getElementById('groceryClearCheckedBtn').style.display, 'none', 'button must hide itself again once nothing is checked');
});

// --- Create, via the real Add button (end-to-end UI path, not just addGroceryItems directly) ---

test('REAL invocation: typing an item and clicking Add renders it into the list and clears the input', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals, scriptChunks);
  document.getElementById('groceryAddInput').value = '  paper towels  ';
  document.getElementById('groceryAddBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['grocery-list']);
  assert.deepStrictEqual(stored, [{text:'paper towels', checked:false}]);
  assert.strictEqual(document.getElementById('groceryAddInput').value, '');
  const rows = document.getElementById('groceryListItems').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1);
});

run();
