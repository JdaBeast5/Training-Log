'use strict';
// Behavioral coverage for Phase F3: the food search's active category now
// persists across sessions the same way weightUnit/active-view already do
// (window.storage get-on-load, set-on-change), instead of always
// defaulting to Protein on every fresh page load.
const { readIndexSource, extractFunction, runSandbox, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const { test, run } = makeRunner('test-food-category-persistence.js');

test('loadActiveCat restores a previously-saved category instead of leaving the Protein default', async (assert)=>{
  const chunks = [
    `var activeCat = 'Protein';`,
    `var window = { storage: { get: async (key)=> key === 'food-active-category' ? { value: 'Chinese Takeout' } : null } };`,
    extractFunction(src, 'loadActiveCat'),
  ];
  const [result] = await runSandboxAsync(chunks, `
    await loadActiveCat();
    __capture.push(activeCat);
  `);
  assert.strictEqual(result, 'Chinese Takeout');
});

test('loadActiveCat leaves the Protein default alone when nothing is stored yet', async (assert)=>{
  const chunks = [
    `var activeCat = 'Protein';`,
    `var window = { storage: { get: async ()=> null } };`,
    extractFunction(src, 'loadActiveCat'),
  ];
  const [result] = await runSandboxAsync(chunks, `
    await loadActiveCat();
    __capture.push(activeCat);
  `);
  assert.strictEqual(result, 'Protein');
});

test('REAL invocation: tapping a category button actually persists it to storage, not just updates the in-memory variable', (assert)=>{
  const renderFoodCatsSrc = extractFunction(src, 'renderFoodCats');
  const bodyHtml = `<div id="foodCats"></div>`;
  const globals = `
    window.activeCat = 'Protein';
    window.activeRestaurant = null;
    window.foodLibrary = { Protein: [], Carbs: [], Dairy: [] };
    window.renderFoodItems = ()=>{};
    window.storage = { __sets: [], set: (k, v)=>{ window.storage.__sets.push([k, v]); } };
  `;
  const { document, window: win } = runJsdom(bodyHtml, globals, [renderFoodCatsSrc, `
    renderFoodCats();
    var buttons = [...document.getElementById('foodCats').querySelectorAll('button')];
    var carbsBtn = buttons.find(b => b.textContent === 'Carbs');
    carbsBtn.click();
  `]);
  const sets = JSON.parse(JSON.stringify(win.storage.__sets));
  assert.deepStrictEqual(sets, [['food-active-category', 'Carbs']]);
  assert.strictEqual(win.activeCat, 'Carbs', 'the in-memory variable must also update, not just storage');
});

run();
