'use strict';
// Behavioral coverage for a real usability gap: addFoodToLog gave no
// feedback at all when a food was logged — the only way to check a tap
// landed was scrolling down to the food log itself. Since addFoodToLog is
// already the single choke point every logging path funnels through
// (search, barcode, Describe, Snap-a-Meal, recipes, meal suggestions,
// custom foods — see the call-site list in the comment above it), the fix
// lives there once rather than at each of those ~9 call sites individually.
//
// Reuses the existing showUndoToast component (previously scoped to
// destructive actions like set/food-log deletion) instead of inventing a
// new banner — an accidental double-tap add is exactly as reversible as an
// accidental delete, and the mechanism (message + undo + auto-hide) already
// fits.
//
// Undo removes the exact entry object that was just pushed (indexOf by
// identity), not a stored index — this is what makes it safe if the viewed
// date changes before the 5s window closes: loadFoodLog reassigns
// todaysFoodLog wholesale to a freshly-parsed array for the new day, which
// can never contain the old entry's object identity, so indexOf misses and
// Undo quietly no-ops instead of corrupting the wrong day. That safety
// property is asserted directly below, not just described.
//
// Real invocation throughout (runJsdom), matching this suite's established
// convention.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-food-add-confirmation-toast.js');

const foodQtyMaxSrc = extractConst(src, 'FOOD_QTY_MAX');
const getTodayKeySrc = extractFunction(src, 'getTodayKey');
const nowTimeKeySrc = extractFunction(src, 'nowTimeKey');
const scaleFoodItemSrc = extractFunction(src, 'scaleFoodItem');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const saveFoodLogSrc = extractFunction(src, 'saveFoodLog');
const addFoodToLogSrc = extractFunction(src, 'addFoodToLog');

// bumpUsageCount/addToCustomFoods/renderFoodItems/renderFoodLog/markMilestone
// are real functions with their own large, unrelated dependency trees
// (usage-ranking storage, My Foods caching, the entire log/library render
// paths, milestone bookkeeping) — stubbed here since this file is about the
// confirmation toast, not those systems. logDayLabel is stubbed to the same
// simple "Today's"/"Yesterday's" shape its real implementation produces,
// without pulling in formatLogDateLabel/dateKeyMinusDays/fmtDayLabel.
const stubs = `
  let undoToastTimeout = null;
  let selectedLogDate = getTodayKey();
  function isBackdating(){ return selectedLogDate !== getTodayKey(); }
  function logDayLabel(){ return isBackdating() ? "Yesterday's" : "Today's"; }
  let todaysFoodLog = [];
  async function bumpUsageCount(){}
  async function addToCustomFoods(){}
  function renderFoodItems(){}
  function renderFoodLog(){}
  function markMilestone(){}
`;

const bodyHtml = `
  <div class="undo-toast" id="undoToast" role="status" aria-live="polite">
    <span id="undoToastText"></span>
    <button id="undoToastBtn">Undo</button>
  </div>
`;

function setup(){
  const globalsSetup = `
    window.storage = { get: async ()=>{ throw new Error('not found'); }, set: async ()=>{} };
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    foodQtyMaxSrc, getTodayKeySrc, nowTimeKeySrc,
    stubs,
    scaleFoodItemSrc, showUndoToastSrc, saveFoodLogSrc, addFoodToLogSrc,
    'window.addFoodToLog = addFoodToLog;',
    'window.__getFoodLog = ()=> todaysFoodLog;',
    'window.__setFoodLog = (arr)=> { todaysFoodLog = arr; };',
  ]);
  return { window, document };
}

// showUndoToast's click handler is async but click() dispatch doesn't await
// it — this flushes the microtask/macrotask queue so the (stubbed, instant)
// saveFoodLog/renderFoodLog inside the undo callback have actually run
// before assertions read the post-undo state.
function flush(){ return new Promise(r=> setTimeout(r, 0)); }

test('REAL invocation: adding a food shows a confirmation toast naming the item — no more scrolling down to check it landed', async (assert)=>{
  const { window, document } = setup();
  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);
  const toast = document.getElementById('undoToast');
  assert.ok(toast.classList.contains('active'), 'the toast must actually be shown, not just constructed and left hidden');
  assert.strictEqual(document.getElementById('undoToastText').textContent, "Oatmeal added to Today's log");
});

test('REAL invocation: a multi-portion add shows the real ×qty name scaleFoodItem produces, not the bare item name', async (assert)=>{
  const { window, document } = setup();
  await window.addFoodToLog({name:'Banana', cal:100, pro:1, fat:0, carb:27}, 2);
  assert.strictEqual(document.getElementById('undoToastText').textContent, "Banana ×2 added to Today's log");
});

test('REAL invocation: tapping Undo removes exactly the just-added entry, leaving pre-existing entries untouched', async (assert)=>{
  const { window, document } = setup();
  window.__setFoodLog([{name:'Existing A', cal:1}, {name:'Existing B', cal:2}]);
  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);
  assert.strictEqual(window.__getFoodLog().length, 3, 'the new entry must actually be in the log before Undo is ever tapped');

  document.getElementById('undoToastBtn').click();
  await flush();

  const log = window.__getFoodLog();
  assert.strictEqual(log.length, 2, 'exactly one entry — the one just added — must be removed');
  assert.deepStrictEqual(log.map(i=> i.name), ['Existing A', 'Existing B'], 'the two pre-existing entries must be untouched, not shifted or dropped by index');
});

test("REAL invocation: if the viewed date changes before Undo is tapped, Undo safely no-ops instead of corrupting the new day's log", async (assert)=>{
  const { window, document } = setup();
  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);

  // Simulates navigating to a different day: the real loadFoodLog reassigns
  // todaysFoodLog wholesale to a freshly-parsed array for that day, so the
  // just-added entry's object identity is gone from what's now in scope.
  window.__setFoodLog([{name:'A Different Day Entry', cal:500}]);

  document.getElementById('undoToastBtn').click();
  await flush();

  const log = window.__getFoodLog();
  assert.strictEqual(log.length, 1, "the other day's log must be completely untouched by an undo that no longer applies to it");
  assert.strictEqual(log[0].name, 'A Different Day Entry');
});

test('sabotage-relevant: addFoodToLog genuinely routes through the real, existing showUndoToast component rather than inventing a new banner', (assert)=>{
  assert.match(addFoodToLogSrc, /showUndoToast\(/, 'must reuse the existing reusable toast component, not a bespoke one — this is the actual fix, not a comment describing an intended one');
});

run();
