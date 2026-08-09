'use strict';
// Behavioral coverage for addGroceryItems/loadGroceryList/saveGroceryList —
// Tier 2, backfill for existing (previously untested) behavior.
//
// This was investigated as a candidate new feature ("connect Recipe Finder
// to the Grocery List") but turned out to already be fully built: every
// Recipe Finder result with an ingredients list renders a real
// "Add N ingredients to grocery list" button (recipe-grocery-btn,
// index.html's submitRecipeSearch) that calls this exact addGroceryItems —
// the same function the manual "Add" input on the Grocery List card itself
// uses. No test file referenced any of it. Rather than build a duplicate of
// an already-shipped feature, this backfills real coverage for it —
// following this project's own precedent (test-food-log-portions.js
// backfilled coverage for adjustFoodLogQty, which had landed from a
// concurrent session with none).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const scriptChunks = [
  extractFunction(src, 'loadGroceryList'),
  extractFunction(src, 'saveGroceryList'),
  // renderGroceryList is called at the end of addGroceryItems, but its own
  // DOM-building work (buildSwipeItem/makeSwipeable/icon) is a separate
  // concern from the persistence/dedup logic under test here — the fixture
  // deliberately omits #groceryListItems so its early
  // `if(!el) return;` guard skips that work instead of needing every one
  // of those helpers stubbed too.
  extractFunction(src, 'renderGroceryList'),
  extractFunction(src, 'addGroceryItems'),
];

// A mutable backing store so a write from addGroceryItems is visible to a
// later loadGroceryList call within the same test — matching the real
// window.storage's round-trip behavior.
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
      set: (key, value)=>{ window.storage.__store[key] = value; },
    };
  `;
}

// Arrays/objects built inside jsdom's window carry that realm's own
// Array/Object prototypes, which deepStrictEqual treats as a different type
// from the host's even with identical contents — same issue testHelpers.js
// documents for the vm-sandbox path. Round-tripping through JSON gets a
// plain host-realm value to assert against.
async function plainList(window){
  return JSON.parse(JSON.stringify(await window.loadGroceryList()));
}

const { test, run } = makeRunner('test-grocery-list.js');

test('loadGroceryList returns [] when nothing has ever been saved', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), scriptChunks);
  assert.deepStrictEqual(await plainList(window), []);
});

test('addGroceryItems on an empty list adds every item, unchecked, and persists it', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), scriptChunks);
  await window.addGroceryItems(['chicken thighs', 'toasted sesame oil']);
  const list = await plainList(window);
  assert.deepStrictEqual(list, [
    {text:'chicken thighs', checked:false},
    {text:'toasted sesame oil', checked:false},
  ]);
});

test('addGroceryItems is case-insensitive against items already on the list', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({'grocery-list': JSON.stringify([{text:'Garlic', checked:false}])}), scriptChunks);
  await window.addGroceryItems(['garlic', 'ginger']);
  const list = await plainList(window);
  assert.deepStrictEqual(list, [
    {text:'Garlic', checked:false},
    {text:'ginger', checked:false},
  ], 'the pre-existing "Garlic" must not become a second "garlic" entry');
});

test('addGroceryItems de-duplicates WITHIN the same batch too, not just against pre-existing items', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), scriptChunks);
  await window.addGroceryItems(['eggs', 'Eggs', 'EGGS', 'milk']);
  const list = await plainList(window);
  assert.deepStrictEqual(list, [{text:'eggs', checked:false}, {text:'milk', checked:false}]);
});

test('addGroceryItems trims whitespace and drops blank entries', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), scriptChunks);
  await window.addGroceryItems(['  paprika  ', '   ', '']);
  const list = await plainList(window);
  assert.deepStrictEqual(list, [{text:'paprika', checked:false}]);
});

test('checked state on an existing item survives a later addGroceryItems call for unrelated items', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({'grocery-list': JSON.stringify([{text:'onions', checked:true}])}), scriptChunks);
  await window.addGroceryItems(['carrots']);
  const list = await plainList(window);
  assert.deepStrictEqual(list, [{text:'onions', checked:true}, {text:'carrots', checked:false}]);
});

test('REAL integration shape: a Recipe Finder result\'s ingredients merge into the SAME list the manual Add input uses', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), scriptChunks);
  // Manual add first, exactly what groceryAddBtn's click handler does.
  await window.addGroceryItems(['paper towels']);
  // Then a recipe-grocery-btn click, exactly what submitRecipeSearch wires:
  // addGroceryItems(recipe.ingredients).
  const recipe = { name:'Sesame Chicken', ingredients:['boneless chicken thighs', 'toasted sesame oil', 'soy sauce'] };
  await window.addGroceryItems(recipe.ingredients);
  const list = await plainList(window);
  assert.deepStrictEqual(list.map(i=> i.text), ['paper towels', 'boneless chicken thighs', 'toasted sesame oil', 'soy sauce']);
});

run();
