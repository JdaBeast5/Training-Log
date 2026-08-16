'use strict';
// Behavioral coverage for a bug found during a dedicated Nutrition audit:
// buildFoodItemBtn (search/USDA/restaurant results) has always flagged an
// item that conflicts with the avoid list or dietary preference/flags
// (gluten-free, dairy-free, nut-free, halal, kosher, vegan/vegetarian/
// pescatarian) with a "⚠️ On your avoid list" badge — but buildFoodResultRow,
// the shared component barcode scans, Snap-a-Meal photos, and Describe It
// all render through, never got the same check at all. The two components
// were explicitly consolidated for editing/portions/saving (see the comment
// at renderPhotoLogResult about closing that exact inconsistency), but the
// dietary flag never made the same trip — arguably the highest-stakes gap
// of the three, since those are exactly the paths most likely to surface
// something whose ingredients aren't already known (an external barcode
// product, an AI-recognized restaurant meal).
//
// Same real-source-extraction chain test-dietary-filtering.js already
// proved out for the underlying matching logic, extended with
// itemViolatesPreferences/computeItemViolation (the actual function
// buildFoodItemBtn calls, now also called by buildFoodResultRow) and a real
// buildFoodResultRow invocation loaded into jsdom — asserting on actual
// rendered DOM structure, not string-matching the template.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-food-result-row-dietary-flag.js');

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
  extractConst(src, 'FOOD_MACRO_FIELDS'),
  `var _dietTagCache = new Map(); var _hiddenIngCache = new Map(); var _wordMatchRe = new Map();
   var _prefViolationCache = new Map(); var _avoidTermsSrc = null; var _avoidTerms = [];
   var customFoods = []; var FOOD_QTY_MAX = 20;
   var userProfile = {dietaryPreference:'', avoidFoods:'', dietaryFlags:{glutenFree:false, dairyFree:false, nutFree:false, halal:false, kosher:false}};`,
  extractFunction(src, 'computeFoodDietTags'),
  extractFunction(src, 'foodDietTags'),
  extractFunction(src, 'containsGluten'),
  extractFunction(src, 'wordMatch'),
  extractFunction(src, 'containsNuts'),
  extractFunction(src, 'containsAlcohol'),
  extractFunction(src, 'matchesDietaryFlags'),
  extractFunction(src, 'matchesDietaryPreference'),
  extractFunction(src, 'getHiddenIngredients'),
  extractFunction(src, 'foodContainsTerm'),
  extractFunction(src, 'matchesAvoidList'),
  extractFunction(src, 'parseAvoidTerms'),
  extractFunction(src, 'activeAvoidTerms'),
  extractFunction(src, 'itemViolatesPreferences'),
  extractFunction(src, 'computeItemViolation'),
  extractFunction(src, 'foodRowTotalText'),
  `function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }`,
  extractFunction(src, 'buildFoodResultRow'),
];

function buildRow(name, qty, userProfileOverrides){
  const [html] = runSandbox(chunks, `
    userProfile = Object.assign(userProfile, ${JSON.stringify(userProfileOverrides)});
    __capture.push(buildFoodResultRow({name: ${JSON.stringify(name)}, cal:200, pro:10, fat:5, carb:20}, 0, [${qty}], {editable:true, removable:true}));
  `);
  return html;
}

test('REAL invocation: a barcode/photo/describe-style row (buildFoodResultRow) for a food matching the nut-free flag shows the avoid warning', (assert)=>{
  const html = buildRow('Peanut Butter Protein Bar', 1, {dietaryFlags:{glutenFree:false, dairyFree:false, nutFree:true, halal:false, kosher:false}});
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  const flag = dom.window.document.querySelector('.fi-avoid-flag');
  assert.ok(flag, 'a nut-containing item must show the avoid-flag warning when nutFree is on — this is the exact bug: it never did');
  // Matches buildFoodItemBtn's own existing label logic verbatim: only a
  // free-text avoid-list match gets the distinct "On your avoid list" text;
  // a dietary-flag violation shares the generic fallback with a preference
  // violation.
  assert.match(flag.textContent, /Doesn't fit your dietary preference/);
});

test('REAL invocation: the same row for a food that does NOT conflict shows no warning at all', (assert)=>{
  const html = buildRow('Grilled Chicken Breast', 1, {dietaryFlags:{glutenFree:false, dairyFree:false, nutFree:true, halal:false, kosher:false}});
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  assert.strictEqual(dom.window.document.querySelector('.fi-avoid-flag'), null, 'a non-conflicting item must render no warning element at all, not an empty one');
});

test('REAL invocation: the free-text avoid list also flags a row through this same component', (assert)=>{
  const html = buildRow('Shrimp Fried Rice', 1, {avoidFoods:'shrimp'});
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  const flag = dom.window.document.querySelector('.fi-avoid-flag');
  assert.ok(flag, 'a free-text avoid-list match must also flag through buildFoodResultRow, matching buildFoodItemBtn\'s own behavior');
});

test('sabotage-relevant: buildFoodResultRow genuinely calls itemViolatesPreferences as a real invocation, not a text mention', (assert)=>{
  const buildFoodResultRowSrc = extractFunction(src, 'buildFoodResultRow');
  assert.match(buildFoodResultRowSrc, /itemViolatesPreferences\(it\.name\)/, 'the real function body must call the real violation checker');
});

test('regression guard: .fi-avoid-flag is styled for BOTH .food-item-btn and .food-result-row contexts — the CSS rule was broadened, not duplicated', (assert)=>{
  const ruleMatch = src.match(/\.food-item-btn \.fi-avoid-flag, \.food-result-row \.fi-avoid-flag\{[^}]*\}/);
  assert.ok(ruleMatch, 'one shared rule must cover both card shapes the flag can now appear inside');
  const duplicateRuleCount = (src.match(/\.fi-avoid-flag\{color:var\(--plate-red\)/g) || []).length
    + (src.match(/font-size:10\.5px; color:var\(--plate-red\); font-weight:600; margin-top:2px;\}/g) || []).length;
  assert.strictEqual(duplicateRuleCount, 1, 'the flag styling must exist exactly once in the file, not as a second near-identical copy for the new context');
});

run();
