'use strict';
// Behavioral coverage for the dietary preference/restriction classifier —
// Tier 2. Covers the tag-derivation layer (computeFoodDietTags),
// preference matching (vegetarian/vegan/pescatarian), flag matching
// (gluten-free/dairy-free/nut-free/halal/kosher), and the hidden-ingredient
// + alias matching that lets avoiding "pork" catch a BLT even though
// "pork" never appears in its name — the concrete, documented example the
// code comments themselves use.
//
// Halal/kosher are deliberately tested only for what the code itself
// claims to do (catch obvious ingredient conflicts), never framed as
// certifying actual compliance — matching the app's own stated boundary.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractConst(src, 'INGREDIENT_ALIASES'),
  extractConst(src, 'HIDDEN_INGREDIENT_NAMES'),
  extractConst(src, 'MEAT_KEYWORDS'),
  extractConst(src, 'POULTRY_KEYWORDS'),
  extractConst(src, 'FISH_KEYWORDS'),
  extractConst(src, 'SHELLFISH_KEYWORDS'),
  extractConst(src, 'DAIRY_KEYWORDS'),
  extractConst(src, 'FOOD_NAME_OVERRIDES'),
  extractConst(src, 'GLUTEN_KEYWORDS'),
  extractConst(src, 'NUT_KEYWORDS'),
  extractConst(src, 'ALCOHOL_KEYWORDS'),
  extractConst(src, 'GLUTEN_OVERRIDES'),
  extractConst(src, 'NUT_OVERRIDES'),
  `var _dietTagCache = new Map(); var _hiddenIngCache = new Map(); var _wordMatchRe = new Map();`,
  extractFunction(src, 'computeFoodDietTags'),
  extractFunction(src, 'foodDietTags'),
  extractFunction(src, 'containsGluten'),
  extractFunction(src, 'wordMatch'),
  extractFunction(src, 'containsNuts'),
  extractFunction(src, 'containsAlcohol'),
  extractFunction(src, 'matchesDietaryFlags'),
  extractFunction(src, 'matchesDietaryPreference'),
  extractFunction(src, 'describeDietaryFlags'),
  extractFunction(src, 'getHiddenIngredients'),
  extractFunction(src, 'foodContainsTerm'),
  extractFunction(src, 'matchesAvoidList'),
  extractFunction(src, 'parseAvoidTerms'),
];

const { test, run } = makeRunner('test-dietary-filtering.js');

test('computeFoodDietTags tags plain keyword matches (poultry, dairy)', (assert)=>{
  const [chickenTags, milkTags] = runSandbox(chunks, `
    __capture.push([...computeFoodDietTags('Grilled Chicken Breast')]);
    __capture.push([...computeFoodDietTags('Whole Milk')]);
  `);
  assert.ok(chickenTags.includes('poultry'));
  assert.ok(milkTags.includes('dairy'));
});

test('FOOD_NAME_OVERRIDES tags a dish whose name does not literally mention its ingredients', (assert)=>{
  const [tags] = runSandbox(chunks, `__capture.push([...computeFoodDietTags('Egg Roll')]);`);
  assert.ok(tags.includes('meat'));
  assert.ok(tags.includes('egg'));
});

test('vegetarian allows egg/dairy but excludes meat, poultry, fish, and shellfish', (assert)=>{
  const [eggOk, dairyOk, meatBlocked, fishBlocked] = runSandbox(chunks, `
    __capture.push(matchesDietaryPreference('Scrambled Eggs', 'vegetarian'));
    __capture.push(matchesDietaryPreference('Cheddar Cheese', 'vegetarian'));
    __capture.push(matchesDietaryPreference('Beef Burger', 'vegetarian'));
    __capture.push(matchesDietaryPreference('Grilled Salmon', 'vegetarian'));
  `);
  assert.strictEqual(eggOk, true);
  assert.strictEqual(dairyOk, true);
  assert.strictEqual(meatBlocked, false);
  assert.strictEqual(fishBlocked, false);
});

test('vegan excludes everything vegetarian excludes, PLUS egg and dairy', (assert)=>{
  const [eggBlocked, dairyBlocked, veggieOk] = runSandbox(chunks, `
    __capture.push(matchesDietaryPreference('Scrambled Eggs', 'vegan'));
    __capture.push(matchesDietaryPreference('Cheddar Cheese', 'vegan'));
    __capture.push(matchesDietaryPreference('Steamed Broccoli', 'vegan'));
  `);
  assert.strictEqual(eggBlocked, false);
  assert.strictEqual(dairyBlocked, false);
  assert.strictEqual(veggieOk, true);
});

test('pescatarian allows fish but still excludes meat and poultry', (assert)=>{
  const [fishOk, chickenBlocked] = runSandbox(chunks, `
    __capture.push(matchesDietaryPreference('Grilled Salmon', 'pescatarian'));
    __capture.push(matchesDietaryPreference('Grilled Chicken Breast', 'pescatarian'));
  `);
  assert.strictEqual(fishOk, true);
  assert.strictEqual(chickenBlocked, false);
});

test('halal rejects a hidden pork ingredient (bacon) even when the name says nothing about pork', (assert)=>{
  const [ok] = runSandbox(chunks, `__capture.push(matchesDietaryFlags('Bacon Cheeseburger', {halal:true}));`);
  assert.strictEqual(ok, false);
});

test('kosher rejects a meat-and-dairy combination even when tagged only via FOOD_NAME_OVERRIDES', (assert)=>{
  // Crunchwrap Supreme is tagged ['meat','dairy'] by FOOD_NAME_OVERRIDES,
  // not by any literal ingredient word in its own name.
  const [ok] = runSandbox(chunks, `__capture.push(matchesDietaryFlags('Crunchwrap Supreme', {kosher:true}));`);
  assert.strictEqual(ok, false);
});

test('gluten-free rejects an obvious bread keyword and honors the noodle exception (rice noodles are not gluten)', (assert)=>{
  const [breadBlocked, riceNoodleOk] = runSandbox(chunks, `
    __capture.push(matchesDietaryFlags('Whole Wheat Bread', {glutenFree:true}));
    __capture.push(matchesDietaryFlags('Rice Noodle Bowl', {glutenFree:true}));
  `);
  assert.strictEqual(breadBlocked, false);
  assert.strictEqual(riceNoodleOk, true);
});

test('nut-free word-boundary matching does not false-positive on Coconut Oil', (assert)=>{
  const [coconutOk, mixedNutsBlocked] = runSandbox(chunks, `
    __capture.push(matchesDietaryFlags('Coconut Oil', {nutFree:true}));
    __capture.push(matchesDietaryFlags('Mixed Nuts', {nutFree:true}));
  `);
  assert.strictEqual(coconutOk, true, '"nut" inside "Coconut" must not word-match');
  assert.strictEqual(mixedNutsBlocked, false);
});

test('avoiding "pork" catches a BLT via the hidden-ingredient + alias chain, even though the name never says pork or bacon-as-pork', (assert)=>{
  const [caught] = runSandbox(chunks, `
    __capture.push(matchesAvoidList('BLT Sandwich', parseAvoidTerms('pork')));
  `);
  assert.strictEqual(caught, true, 'BLT -> hidden ingredient "bacon" -> pork alias chain must catch this');
});

test('avoiding "egg" does not silently hide Eggplant (word-boundary, not substring)', (assert)=>{
  const [eggplantCaught] = runSandbox(chunks, `
    __capture.push(matchesAvoidList('Roasted Eggplant', parseAvoidTerms('egg')));
  `);
  assert.strictEqual(eggplantCaught, false);
});

test('parseAvoidTerms splits on commas, trims whitespace, and lowercases', (assert)=>{
  const [terms] = runSandbox(chunks, `__capture.push(parseAvoidTerms(' Peanuts,  Shellfish ,pork'));`);
  assert.deepStrictEqual(terms, ['peanuts', 'shellfish', 'pork']);
});

test('describeDietaryFlags always attaches the ingredient-conflict-only caveat to halal/kosher, never presenting them as certification', (assert)=>{
  const [desc] = runSandbox(chunks, `__capture.push(describeDietaryFlags({halal:true, glutenFree:true}));`);
  assert.ok(desc.includes('gluten-free'));
  assert.ok(desc.toLowerCase().includes('not certifying compliance'), 'halal description must include the non-certification caveat');
});

run();
