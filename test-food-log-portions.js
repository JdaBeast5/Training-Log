'use strict';
// Behavioral coverage for the food-log portion +/- feature: a logged entry is
// a baked macro snapshot with no live per-unit value (see scaleFoodItem/
// addFoodToLog), so adjustFoodLogQty must derive a per-unit value fresh from
// the CURRENTLY STORED total ÷ CURRENTLY STORED qty on every call, floor at
// qty 1 (deletion stays a separate swipe gesture, not this control), and cap
// at FOOD_QTY_MAX — matching the pre-log qty-stepper's own
// disabled-at-the-ends convention (buildFoodResultRow/wireFoodResultRows).
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const foodQtyMaxSrc = extractConst(src, 'FOOD_QTY_MAX');
const adjustFoodLogQtySrc = extractFunction(src, 'adjustFoodLogQty');
const renderFoodLogSrc = extractFunction(src, 'renderFoodLog');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const computeTodaysFoodTotalsSrc = extractFunction(src, 'computeTodaysFoodTotals');
const updateBarsSrc = extractFunction(src, 'updateBars');
const renderMedicalNutrientBarsSrc = extractFunction(src, 'renderMedicalNutrientBars');
const updateRepeatYesterdayVisibilitySrc = extractFunction(src, 'updateRepeatYesterdayVisibility');

const { test, run } = makeRunner('test-food-log-portions.js');

function sandboxStubs(todaysFoodLog){
  return `
    var todaysFoodLog = ${JSON.stringify(todaysFoodLog)};
    var __saveCalls = 0, __renderCalls = 0;
    var saveFoodLog = async ()=>{ __saveCalls++; };
    var renderFoodLog = ()=>{ __renderCalls++; };
    ${foodQtyMaxSrc}
  `;
}

test('incrementing a fresh (qty=1, no qty field) entry scales macros and bakes the ×2 suffix into the name', async (assert)=>{
  const entry = {name:'Bagel', cal:280, pro:10, fat:2, carb:50, sodium:400, fiber:null, calcium:null, potassium:null, folate:null, iron:null};
  const [result] = await runSandboxAsync([
    sandboxStubs([entry]),
    adjustFoodLogQtySrc,
  ], `
    await adjustFoodLogQty(0, 1);
    __capture.push(todaysFoodLog[0]);
  `);
  assert.strictEqual(result.qty, 2);
  assert.strictEqual(result.cal, 560);
  assert.strictEqual(result.pro, 20);
  assert.strictEqual(result.fat, 4);
  assert.strictEqual(result.carb, 100);
  assert.strictEqual(result.sodium, 800);
  assert.strictEqual(result.fiber, null, 'a missing USDA value must stay null, not become 0');
  assert.strictEqual(result.name, 'Bagel ×2');
  assert.strictEqual(result.baseName, 'Bagel');
});

test('decrementing derives from the CURRENT baked value each time — round-tripping qty 3 -> 2 -> 1 lands back on the exact single-portion values', async (assert)=>{
  const entry = {name:'Chicken ×3', baseName:'Chicken', cal:840, pro:150, fat:9, carb:0, sodium:1200, fiber:0, calcium:0, potassium:0, folate:0, iron:0, qty:3};
  const [afterFirst, afterSecond] = await runSandboxAsync([
    sandboxStubs([entry]),
    adjustFoodLogQtySrc,
  ], `
    await adjustFoodLogQty(0, -1);
    __capture.push(JSON.parse(JSON.stringify(todaysFoodLog[0])));
    await adjustFoodLogQty(0, -1);
    __capture.push(JSON.parse(JSON.stringify(todaysFoodLog[0])));
  `);
  assert.strictEqual(afterFirst.qty, 2);
  assert.strictEqual(afterFirst.cal, 560);
  assert.strictEqual(afterFirst.name, 'Chicken ×2');
  assert.strictEqual(afterSecond.qty, 1);
  assert.strictEqual(afterSecond.cal, 280);
  assert.strictEqual(afterSecond.name, 'Chicken', 'back to qty 1 must strip the × suffix, matching what a fresh single add looks like');
});

test('sabotage: the "-" control is a no-op at qty 1, not a delete — entry, save, and render are all left untouched', async (assert)=>{
  const entry = {name:'Rice', cal:200, pro:4, fat:1, carb:44};
  const [saveCalls, renderCalls, unchanged] = await runSandboxAsync([
    sandboxStubs([entry]),
    adjustFoodLogQtySrc,
  ], `
    await adjustFoodLogQty(0, -1);
    __capture.push(__saveCalls, __renderCalls, todaysFoodLog[0]);
  `);
  assert.strictEqual(saveCalls, 0, 'must not call saveFoodLog when the floor blocks the adjustment');
  assert.strictEqual(renderCalls, 0, 'must not call renderFoodLog when the floor blocks the adjustment');
  assert.deepStrictEqual(unchanged, entry, 'the entry itself must be untouched, not partially mutated then reverted');
});

test('caps at FOOD_QTY_MAX and does not overshoot', async (assert)=>{
  const entry = {name:'Protein Bar ×20', baseName:'Protein Bar', cal:4000, pro:400, fat:80, carb:600, qty:20};
  const [saveCalls, qtyAfter] = await runSandboxAsync([
    sandboxStubs([entry]),
    adjustFoodLogQtySrc,
  ], `
    await adjustFoodLogQty(0, 1);
    __capture.push(__saveCalls, todaysFoodLog[0].qty);
  `);
  assert.strictEqual(saveCalls, 0, 'must not save when already at FOOD_QTY_MAX');
  assert.strictEqual(qtyAfter, 20);
});

test('a legacy entry with no qty/baseName field behaves as qty=1 on first tap — no crash, no NaN', async (assert)=>{
  const entry = {name:'Old Log Entry', cal:150, pro:5, fat:3, carb:20};
  const [result] = await runSandboxAsync([
    sandboxStubs([entry]),
    adjustFoodLogQtySrc,
  ], `
    await adjustFoodLogQty(0, 1);
    __capture.push(todaysFoodLog[0]);
  `);
  assert.strictEqual(result.qty, 2);
  assert.strictEqual(result.cal, 300);
  assert.strictEqual(result.name, 'Old Log Entry ×2');
  assert.strictEqual(result.baseName, 'Old Log Entry');
  assert.ok(!Number.isNaN(result.pro) && !Number.isNaN(result.fat) && !Number.isNaN(result.carb));
});

function jsdomHarness(todaysFoodLog){
  const bodyHtml = `
    <div id="foodLogList"></div>
    <div id="barCal"></div><div id="barPro"></div><div id="barFat"></div><div id="barCarb"></div>
    <div id="valCal"></div><div id="valPro"></div><div id="valFat"></div><div id="valCarb"></div>
    <div id="medicalNutrientBars"></div>
  `;
  const globals = `
    window.todaysFoodLog = ${JSON.stringify(todaysFoodLog)};
    window.targets = {cal:2000, pro:150, fat:70, carb:250};
    window.activeProgram = 'strength';
    window.selectedLogDate = '2026-01-01';
    window.storage = { set: async ()=>{} };
    ${foodQtyMaxSrc}
  `;
  return runJsdom(bodyHtml, globals, [
    escapeHtmlSrc, buildSwipeItemSrc, makeSwipeableSrc, computeTodaysFoodTotalsSrc,
    updateBarsSrc, renderMedicalNutrientBarsSrc, updateRepeatYesterdayVisibilitySrc,
    `async function saveFoodLog(){ await window.storage.set('x', '{}'); }`,
    adjustFoodLogQtySrc, renderFoodLogSrc,
    `renderFoodLog();`,
  ]);
}

test('REAL invocation: clicking + in the rendered food log calls adjustFoodLogQty on the right row and updates the macro bars', async (assert)=>{
  const { document, window: win } = jsdomHarness([{name:'Bagel', cal:280, pro:10, fat:2, carb:50}]);
  const plusBtn = document.querySelector('#foodLogList .qty-btn[data-step="1"]');
  assert.ok(plusBtn, 'the rendered row must include a + qty button');
  plusBtn.click();
  await new Promise(res => setTimeout(res, 30));
  assert.strictEqual(win.todaysFoodLog[0].cal, 560, 'clicking + must actually call adjustFoodLogQty on the right index');
  assert.strictEqual(document.getElementById('valCal').textContent, '560 / 2000', 'macro bars must reflect the adjusted total after re-render');
  assert.ok(document.getElementById('foodLogList').textContent.includes('×2'), 're-render must show the updated quantity');
});

test('the "-" button renders disabled at qty 1, matching the pre-log stepper convention', (assert)=>{
  const { document } = jsdomHarness([{name:'Bagel', cal:280, pro:10, fat:2, carb:50}]);
  const minusBtn = document.querySelector('#foodLogList .qty-btn[data-step="-1"]');
  assert.ok(minusBtn.disabled, '- must be rendered disabled at qty 1');
});

test('the "+" button renders disabled at FOOD_QTY_MAX', (assert)=>{
  const { document } = jsdomHarness([{name:'Bagel ×20', baseName:'Bagel', cal:5600, pro:200, fat:40, carb:1000, qty:20}]);
  const plusBtn = document.querySelector('#foodLogList .qty-btn[data-step="1"]');
  assert.ok(plusBtn.disabled, '+ must be rendered disabled at FOOD_QTY_MAX');
});

run();
