'use strict';
// Behavioral coverage for a real usability gap: addFoodToLog gave no
// feedback at all when a food was logged — the only way to check a tap
// landed was scrolling down to the food log itself. Since addFoodToLog is
// already the single choke point every logging path funnels through
// (search, barcode, Describe, Snap-a-Meal, recipes, meal suggestions,
// custom foods — see the call-site list in the comment above it), the fix
// lives there once rather than at each of those ~9 call sites individually.
//
// First pass used the existing showUndoToast component (name + "added to
// X log" + an Undo button) — explicitly rejected as too much ceremony for
// something this routine ("just a little +1"). This is that revision:
// showFoodAddedPop shows a small, non-interactive "+1" that fades in and
// back out on its own — no text naming the item, no button, nothing to
// read. Deliberately its OWN component rather than a reuse of
// showUndoToast, since it has none of that component's message/undo-button
// shape and reusing it would mean threading unused params through.
//
// Real invocation throughout (runJsdom), matching this suite's established
// convention.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-food-add-confirmation-pop.js');

const foodQtyMaxSrc = extractConst(src, 'FOOD_QTY_MAX');
const scaleFoodItemSrc = extractFunction(src, 'scaleFoodItem');
const showFoodAddedPopSrc = extractFunction(src, 'showFoodAddedPop');
const saveFoodLogSrc = extractFunction(src, 'saveFoodLog');
const addFoodToLogSrc = extractFunction(src, 'addFoodToLog');

// bumpUsageCount/addToCustomFoods/renderFoodItems/renderFoodLog/markMilestone/
// nowTimeKey/isBackdating are real functions with their own large, unrelated
// dependency trees (usage-ranking storage, My Foods caching, the entire
// log/library render paths, milestone bookkeeping, date math) — stubbed
// here since this file is about the confirmation pop, not those systems.
const stubs = `
  let foodAddedPopTimeout = null;
  let todaysFoodLog = [];
  function isBackdating(){ return false; }
  function nowTimeKey(){ return '12:00'; }
  async function bumpUsageCount(){}
  async function addToCustomFoods(){}
  function renderFoodItems(){}
  function renderFoodLog(){}
  function markMilestone(){}
`;

const bodyHtml = `<div class="food-add-pop" id="foodAddedPop" aria-hidden="true">+1</div>`;

function setup(){
  const globalsSetup = `window.storage = { get: async ()=>{ throw new Error('not found'); }, set: async ()=>{} };`;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    foodQtyMaxSrc,
    stubs,
    scaleFoodItemSrc, showFoodAddedPopSrc, saveFoodLogSrc, addFoodToLogSrc,
    'window.addFoodToLog = addFoodToLog;',
    'window.showFoodAddedPop = showFoodAddedPop;',
  ]);
  return { window, document };
}

test('REAL invocation: adding a food shows the "+1" pop — no more scrolling down to check a tap landed', async (assert)=>{
  const { window, document } = setup();
  const pop = document.getElementById('foodAddedPop');
  assert.ok(!pop.classList.contains('active'), 'must start hidden');

  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);

  assert.ok(pop.classList.contains('active'), 'the pop must actually be shown, not just constructed and left hidden');
  assert.strictEqual(pop.textContent, '+1', 'deliberately minimal — no item name, no "added to X log" sentence, just the pop');
});

test('REAL invocation: the pop is non-interactive — it carries no button and nothing wired to a click', async (assert)=>{
  const { window, document } = setup();
  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);
  const pop = document.getElementById('foodAddedPop');
  assert.strictEqual(pop.querySelector('button'), null, 'no Undo or any other button — this is a passive notice, not an actionable toast');
});

test('REAL invocation: the pop auto-hides after its window, without anything else being tapped', async (assert)=>{
  const { window, document } = setup();
  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);
  const pop = document.getElementById('foodAddedPop');
  assert.ok(pop.classList.contains('active'));

  await new Promise(r=> setTimeout(r, 950));
  assert.ok(!pop.classList.contains('active'), 'must fade back out on its own — nothing has to be tapped to dismiss it');
});

test('REAL invocation: a second add before the first pop finished extends the same window rather than flickering it closed', async (assert)=>{
  const { window, document } = setup();
  await window.addFoodToLog({name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}, 1);

  await new Promise(r=> setTimeout(r, 700)); // still within the first pop's window
  await window.addFoodToLog({name:'Banana', cal:100, pro:1, fat:0, carb:27}, 1);

  await new Promise(r=> setTimeout(r, 400)); // 1100ms since the first add, but only 400ms since the second
  const pop = document.getElementById('foodAddedPop');
  assert.ok(pop.classList.contains('active'), 'a second add mid-window must reset the timer, not let the first one\'s expiry hide the pop while the second add is still fresh');
});

test('sabotage-relevant: addFoodToLog genuinely calls the real showFoodAddedPop, not a text mention or a leftover call to the old toast', (assert)=>{
  assert.match(addFoodToLogSrc, /showFoodAddedPop\(\)/, 'must actually invoke the pop function');
  assert.doesNotMatch(addFoodToLogSrc, /showUndoToast/, 'the earlier undo-toast-based confirmation must be fully replaced, not left calling both');
});

run();
