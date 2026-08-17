'use strict';
// Behavioral coverage for tapping a logged food to reveal its protein/fat/
// carb breakdown (v3.194) — previously the row only ever had room to show
// total calories, so seeing which food actually drove a macro up meant
// looking the food back up from scratch.
//
// Mirrors .exercise's own pattern rather than inventing a new one: role=
// "button" + tabindex="0" + aria-expanded/aria-controls even though the row
// also wraps real qty-stepper buttons, riding the same shared document-level
// Enter/Space keydown listener .exercise and .nutrition-header already use
// (see the comment above it in index.html). That listener is a separate
// top-level statement, not part of renderFoodLog itself, so it isn't
// exercised here — test-a11y-keyboard-focus.js already covers it generically
// for every selector in its list, .food-log-item included as of this change.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const foodQtyMaxSrc = extractConst(src, 'FOOD_QTY_MAX');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const computeTodaysFoodTotalsSrc = extractFunction(src, 'computeTodaysFoodTotals');
const updateBarsSrc = extractFunction(src, 'updateBars');
const renderMedicalNutrientBarsSrc = extractFunction(src, 'renderMedicalNutrientBars');
const updateRepeatYesterdayVisibilitySrc = extractFunction(src, 'updateRepeatYesterdayVisibility');
const renderFoodLogSrc = extractFunction(src, 'renderFoodLog');

const { test, run } = makeRunner('test-food-log-macro-expand.js');

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
    `async function adjustFoodLogQty(){}`,
    `async function removeFoodFromLog(){}`,
    renderFoodLogSrc,
    `renderFoodLog();`,
  ]);
}

test('REAL invocation: a freshly rendered row starts collapsed, is a real role="button" with aria-controls pointing at its own detail panel, and the panel already carries the correct rounded macro numbers', (assert)=>{
  const { document } = jsdomHarness([{name:'Grilled Chicken Breast', cal:284, pro:53.2, fat:6.7, carb:0}]);
  const row = document.querySelector('#foodLogList .food-log-item');
  assert.strictEqual(row.getAttribute('role'), 'button');
  assert.strictEqual(row.getAttribute('tabindex'), '0');
  assert.strictEqual(row.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(row.classList.contains('open'), false);

  const panelId = row.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);
  assert.ok(panel, 'aria-controls must point at a real element in the document');
  assert.strictEqual(panel.classList.contains('open'), false, 'the detail panel starts collapsed');
  assert.ok(panel.textContent.includes('53g'), 'protein must be rounded (53.2 -> 53) and rendered');
  assert.ok(panel.textContent.includes('7g'), 'fat must be rounded (6.7 -> 7) and rendered');
  assert.ok(panel.textContent.includes('0g'), 'carbs (0) must render, not be silently dropped for being falsy');
});

test('REAL invocation: clicking the row expands the macro panel and flips aria-expanded, and clicking again collapses both back', (assert)=>{
  const { document } = jsdomHarness([{name:'Oatmeal', cal:150, pro:5, fat:3, carb:27}]);
  const row = document.querySelector('#foodLogList .food-log-item');
  const panel = document.getElementById(row.getAttribute('aria-controls'));

  row.click();
  assert.strictEqual(row.classList.contains('open'), true, 'clicking must open the row');
  assert.strictEqual(panel.classList.contains('open'), true, 'clicking must open the paired detail panel');
  assert.strictEqual(row.getAttribute('aria-expanded'), 'true');

  row.click();
  assert.strictEqual(row.classList.contains('open'), false, 'clicking again must close the row');
  assert.strictEqual(panel.classList.contains('open'), false, 'clicking again must close the paired detail panel');
  assert.strictEqual(row.getAttribute('aria-expanded'), 'false');
});

test('GUARD: clicking a qty-stepper button inside the row does NOT also toggle the macro panel open — the button\'s own stopPropagation still holds with the new row-level listener added', (assert)=>{
  const { document } = jsdomHarness([{name:'Rice', cal:200, pro:4, fat:1, carb:44}]);
  const row = document.querySelector('#foodLogList .food-log-item');
  const panel = document.getElementById(row.getAttribute('aria-controls'));
  const plusBtn = row.querySelector('.qty-btn[data-step="1"]');

  plusBtn.click();

  assert.strictEqual(row.classList.contains('open'), false, 'a tap on the qty button must not expand the row');
  assert.strictEqual(panel.classList.contains('open'), false, 'a tap on the qty button must not open the detail panel');
});

test('sabotage-relevant: two different logged foods expand INDEPENDENTLY — opening the first row must not touch the second row\'s panel', (assert)=>{
  const { document } = jsdomHarness([
    {name:'Bagel', cal:280, pro:10, fat:2, carb:50},
    {name:'Peanut Butter', cal:190, pro:7, fat:16, carb:7},
  ]);
  const rows = document.querySelectorAll('#foodLogList .food-log-item');
  assert.strictEqual(rows.length, 2, 'sabotage anchor: both rows must actually be in the DOM, not a truncated render');
  const [row0, row1] = rows;
  const panel0 = document.getElementById(row0.getAttribute('aria-controls'));
  const panel1 = document.getElementById(row1.getAttribute('aria-controls'));
  assert.notStrictEqual(panel0.id, panel1.id, 'each row must get its own unique detail panel id');

  row0.click();

  assert.strictEqual(panel0.classList.contains('open'), true, 'the clicked row\'s own panel must open');
  assert.strictEqual(row1.classList.contains('open'), false, 'the untouched row must stay closed');
  assert.strictEqual(panel1.classList.contains('open'), false, 'the untouched row\'s panel must stay closed');
  assert.ok(panel0.textContent.includes('Bagel') === false && panel0.textContent.includes('10g'), 'panel0 shows Bagel\'s own protein, not a shared/mixed-up value');
  assert.ok(panel1.textContent.includes('16g'), 'panel1 (never opened) still carries Peanut Butter\'s own correct fat value in its markup, ready to show whenever it IS opened');
});

run();
