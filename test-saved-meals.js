'use strict';
// v3.636 (BL-28): saved meals. "Save as meal" stores the day's log under
// saved-meals (owner yes 2026-11-08); the meals list at the top of My Foods,
// and adding one re-logs every item through relogFoodEntry and addFoodToLog.
//
// Real invocation: the real saveLogAsMeal, loadSavedMeals, addSavedMealToLog,
// deleteSavedMeal, buildSavedMealBtn, relogFoodEntry, addFoodToLog,
// scaleFoodItem and saveFoodLog over the real buildNamespacedStorage. The
// round trip runs the real export and import listeners (their top-level
// statements), with the download and reload stubbed at the browser edge.
// Sabotage: keep the logged time in the saved items, and criterion 1 fails;
// make delete also clear the day's log, and criterion 2 fails.
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-saved-meals.js');
const statement = (start, end = '\n});') => { const i = src.indexOf(start); if(i < 0) throw new Error('missing: ' + start); return src.slice(i, src.indexOf(end, i) + end.length); };
const EXPORT = statement("document.getElementById('exportDataBtn').addEventListener('click'");
const IMPORT = statement("document.getElementById('importDataInput').addEventListener('change'").replace('setTimeout(()=> location.reload(), 900);', 'window.__reloaded = true;');
const DAY = '2026-11-23';

function page(stored = {}){
  const dom = new JSDOM('<!DOCTYPE html><body><button id="exportDataBtn">Export</button><input type="file" id="importDataInput"><div id="importDataStatus"></div><div id="undoToast"></div></body>', {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const el = w.document.createElement('script');
  el.textContent = [
    `function bumpExCorpusGen(){} function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
     function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
     ${Object.entries(stored).map(([k, v]) => `localStorage.setItem('trainingLog_usr1:' + ${JSON.stringify(k)}, ${JSON.stringify(typeof v === 'string' ? v : JSON.stringify(v))});`).join('\n')}
     var selectedLogDate = ${JSON.stringify(DAY)}; let todaysFoodLog = [];
     function getTodayKey(){ return ${JSON.stringify(DAY)}; } function isBackdating(){ return false; } function nowTimeKey(){ return '12:30'; }
     async function bumpUsageCount(n){ (window.__usage = window.__usage || []).push(n); } async function addToCustomFoods(){}
     function renderFoodLog(){} window.__renders = 0; function renderFoodItems(){ window.__renders++; } function markMilestone(){} function showFoodAddedPop(){}
     function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
     // The export/import listeners' other dependencies, at the browser edge.
     window.URL.createObjectURL = b => { window.__blob = b; return 'blob:x'; }; window.URL.revokeObjectURL = () => {};
     window.HTMLAnchorElement.prototype.click = function(){};
     var userProfile = {name: 'Sam'}, APP_VERSION = '3.636', SCHEMA_VERSION = 9; window.confirm = () => true;
     function isApiKeyStorageKey(){ return false; } async function getPhotoIndex(){ return []; } async function photoDelete(){}
     function renderTodayInsights(){} const APP_NAME = 'Platestep';`,
    extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'), extractFunction(src, 'appSlug'),
    extractConst(src, 'FOOD_QTY_MAX'), extractConst(src, 'SAVED_MEALS_KEY'), 'let savedMeals = []; let savedMealAddPending = false;',
    'var __hide = []; function shouldHideItem(n){ return __hide.includes(n); }',
    ...['escapeHtml', 'scaleFoodItem', 'saveFoodLog', 'addFoodToLog', 'relogFoodEntry', 'loadSavedMeals', 'persistSavedMeals', 'saveLogAsMeal',
        'addSavedMealToLog', 'deleteSavedMeal', 'mealTotals', 'buildSavedMealBtn', 'savedMealHidden'].map(f => extractFunction(src, f)),
    `window.storage = buildNamespacedStorage('1');
     window.api = {saveLogAsMeal, loadSavedMeals, addSavedMealToLog, deleteSavedMeal, buildSavedMealBtn,
       savedMealHidden, hide: list => { __hide = list; },
       getLog: () => todaysFoodLog, setLog: l => { todaysFoodLog = l; }, meals: () => savedMeals};`,
    EXPORT, IMPORT].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const stored = (w, k) => w.localStorage.getItem('trainingLog_usr1:' + k);
const MACROS = ['name', 'cal', 'pro', 'fat', 'carb', 'qty', 'baseName'];
const pick = e => Object.fromEntries(MACROS.map(k => [k, e[k] ?? null]));
// Three logged entries, one of them two portions, as addFoodToLog writes them.
const LOGGED = [
  {name: 'Oatmeal', cal: 150, pro: 5, fat: 3, carb: 27, time: '07:10'},
  {name: 'Egg ×2', baseName: 'Egg', qty: 2, cal: 140, pro: 12, fat: 10, carb: 1, time: '07:10'},
  {name: 'Coffee', cal: 5, pro: 0.3, fat: 0, carb: 0, time: '07:15', source: 'USDA'},
];

test('criterion 1: saving 3 items and re-adding the meal adds 3 entries with the same macros and portions', async (assert)=>{
  const w = page();
  w.api.setLog(LOGGED.map(e => ({...e})));
  assert.strictEqual(await w.api.saveLogAsMeal('  Usual breakfast  ', w.api.getLog()), true);
  const meal = JSON.parse(stored(w, 'saved-meals'));
  assert.strictEqual(meal.length, 1);
  assert.strictEqual(meal[0].name, 'Usual breakfast', 'trimmed');
  assert.strictEqual(meal[0].items.length, 3);
  assert.ok(meal[0].items.every(it => !('time' in it) && !('source' in it)), 'no logged time or source is kept');
  // A fresh day: re-add it.
  w.api.setLog([]);
  await w.api.addSavedMealToLog(meal[0]);
  const log = JSON.parse(stored(w, 'foodlog:' + DAY));
  assert.strictEqual(log.length, 3, '3 entries, saved to the day');
  assert.strictEqual(JSON.stringify(log.map(pick)), JSON.stringify(LOGGED.map(pick)));
  assert.ok(log.every(e => e.time === '12:30'), 'each stamped now, not with the saved time');
  assert.strictEqual(JSON.stringify(w.__usage), JSON.stringify(['Oatmeal', 'Egg', 'Coffee']), 'usage counts under the base food');
});

test('criterion 2: deleting a meal leaves the logged days untouched; Undo brings the meal back', async (assert)=>{
  const day = JSON.stringify(LOGGED);
  const w = page({['foodlog:' + DAY]: day, 'foodlog:2026-11-22': day});
  await w.api.saveLogAsMeal('Usual breakfast', LOGGED);
  await w.api.saveLogAsMeal('Lunch', LOGGED.slice(0, 1));
  await w.api.deleteSavedMeal('Usual breakfast');
  assert.strictEqual(JSON.stringify(JSON.parse(stored(w, 'saved-meals')).map(m => m.name)), JSON.stringify(['Lunch']));
  assert.strictEqual(stored(w, 'foodlog:' + DAY), day, 'today untouched');
  assert.strictEqual(stored(w, 'foodlog:2026-11-22'), day, 'yesterday untouched');
  assert.strictEqual(w.__toast, 'Deleted "Usual breakfast"');
  await w.__undo();
  assert.strictEqual(JSON.stringify(JSON.parse(stored(w, 'saved-meals')).map(m => m.name)), JSON.stringify(['Usual breakfast', 'Lunch']));
});

test('criterion 3: a JSON backup with one saved meal, restored into an empty store, gives back the same saved-meals value', async (assert)=>{
  const a = page({['foodlog:' + DAY]: JSON.stringify(LOGGED)});
  await a.api.saveLogAsMeal('Usual breakfast', LOGGED);
  const value = stored(a, 'saved-meals');
  a.document.getElementById('exportDataBtn').click();
  for(let i = 0; i < 60 && !a.__blob; i++) await new Promise(r => setTimeout(r, 5));
  const backup = await a.__blob.text();
  assert.ok(JSON.parse(backup).data['saved-meals'], 'anchor: the export carries the key');

  const b = page();
  assert.strictEqual(stored(b, 'saved-meals'), null, 'empty store');
  const input = b.document.getElementById('importDataInput');
  Object.defineProperty(input, 'files', {value: [{name: 'platestep-backup-sam-2026-11-23.json', text: async () => backup}]});
  input.dispatchEvent(new b.Event('change'));
  for(let i = 0; i < 60 && !b.__reloaded; i++) await new Promise(r => setTimeout(r, 5));
  assert.ok(b.__reloaded, 'the import finished');
  assert.strictEqual(stored(b, 'saved-meals'), value);
  await b.api.loadSavedMeals();
  assert.strictEqual(b.api.meals().length, 1, 'and it loads');
});

test('a double tap adds the meal once, and one Undo removes exactly what it added', async (assert)=>{
  const w = page();
  await w.api.saveLogAsMeal('Usual breakfast', LOGGED);
  w.api.setLog([{name: 'Apple', cal: 95, pro: 0.5, fat: 0.3, carb: 25, time: '06:00'}]);
  const meal = w.api.meals()[0];
  await Promise.all([w.api.addSavedMealToLog(meal), w.api.addSavedMealToLog(meal)]);
  assert.strictEqual(w.api.getLog().length, 4, 'the apple and the meal once');
  assert.strictEqual(w.__toast, 'Added "Usual breakfast"');
  await w.__undo();
  assert.strictEqual(JSON.stringify(w.api.getLog().map(e => e.name)), JSON.stringify(['Apple']), 'only the meal\'s entries go');
  assert.strictEqual(JSON.stringify(JSON.parse(stored(w, 'foodlog:' + DAY)).map(e => e.name)), JSON.stringify(['Apple']), 'and the day is saved');
});

test('Undo of a delete puts back that meal in place, keeping a meal saved in between', async (assert)=>{
  const w = page();
  await w.api.saveLogAsMeal('A', LOGGED); await w.api.saveLogAsMeal('B', LOGGED); await w.api.saveLogAsMeal('C', LOGGED);
  await w.api.deleteSavedMeal('B');
  const undo = w.__undo;
  await w.api.saveLogAsMeal('D', LOGGED);
  await undo();
  assert.strictEqual(JSON.stringify(w.api.meals().map(m => m.name)), JSON.stringify(['A', 'B', 'C', 'D']));
});

test('"Hide foods that don\'t fit" hides a meal holding a food that doesn\'t (by its base name)', async (assert)=>{
  const w = page();
  await w.api.saveLogAsMeal('Usual breakfast', LOGGED);
  assert.strictEqual(w.api.savedMealHidden(w.api.meals()[0]), false);
  w.api.hide(['Egg']);
  assert.strictEqual(w.api.savedMealHidden(w.api.meals()[0]), true);
});

test('saving under an existing name replaces that meal; an empty name or an empty log saves nothing', async (assert)=>{
  const w = page();
  await w.api.saveLogAsMeal('Breakfast', LOGGED);
  await w.api.saveLogAsMeal('Breakfast', LOGGED.slice(0, 1));
  assert.strictEqual(w.api.meals().length, 1);
  assert.strictEqual(w.api.meals()[0].items.length, 1);
  assert.strictEqual(await w.api.saveLogAsMeal('   ', LOGGED), false);
  assert.strictEqual(await w.api.saveLogAsMeal('Dinner', []), false);
  assert.strictEqual(w.api.meals().length, 1);
});

test('a stored value that is not a list of meals loads as none (no crash)', async (assert)=>{
  for(const bad of ['{"x":1}', 'not json', '[{"name":"x"},null,{"name":"ok","items":[{"name":"a","cal":1}]}]']){
    const w = page({'saved-meals': bad});
    await w.api.loadSavedMeals();
    assert.ok(w.api.meals().every(m => m.name && m.items.length), bad);
  }
});

test('the meal row: name, item count and totals; + adds the meal; the bin deletes it', async (assert)=>{
  const w = page();
  await w.api.saveLogAsMeal('Usual breakfast', LOGGED);
  const row = w.api.buildSavedMealBtn(w.api.meals()[0]);
  assert.strictEqual(row.querySelector('.fi-name').textContent, 'Usual breakfast');
  assert.strictEqual(row.querySelector('.fi-cat').textContent, '3 items');
  assert.strictEqual(row.querySelector('.fi-macro').textContent, '295 cal · 17p / 13f / 28c');
  row.querySelector('.fi-plus').click();
  for(let i = 0; i < 40 && w.api.getLog().length < 3; i++) await new Promise(r => setTimeout(r, 5));
  assert.strictEqual(w.api.getLog().length, 3);
  row.querySelector('.fi-delete').click();
  for(let i = 0; i < 40 && w.api.meals().length; i++) await new Promise(r => setTimeout(r, 5));
  assert.strictEqual(w.api.meals().length, 0);
});

test('REAL source: My Foods lists meals first; Save as meal hides while the log is empty; meals load at startup', (assert)=>{
  const render = extractFunction(src, 'renderFoodItems');
  assert.match(render, /activeCat === '📁 My Foods' \? savedMeals\.filter\(m => !savedMealHidden\(m\)\)[\s\S]*buildSavedMealBtn\(meal\)[\s\S]*const items = activeCat/, 'meals before the foods, hide filter applied');
  assert.match(src, /\.food-log-list:has\(> \.empty-note\) ~ #saveMealBtn/);
  assert.match(src, /await loadCustomFoods\(\);\n\s*await loadSavedMeals\(\);/);
});

run();
