'use strict';
// v3.574 (BL-18): one-tap recent foods. buildRecentFoods reads the 14 days
// before selectedLogDate, ranks foods by the number of days they appear, then
// by recency, de-duplicates on baseName || name and keeps 8; each chip is the
// food's most recent entry. relogFoodEntry re-adds a logged multiple through
// addFoodToLog as one base portion at the same qty, so usage counts stay
// under the base name.
//
// Real invocation: the real buildRecentFoods, relogFoodEntry,
// renderFoodRecents, addFoodToLog, scaleFoodItem, saveFoodLog,
// bumpUsageCount, dateKeyMinusDays and escapeHtml, the real #foodRecents and
// #foodSearchInput markup, and the real chip-click and search-input wiring,
// with a stub window.storage. The real CSS for the chip's min-height.
//
// Sabotage: rank by recency only and criterion 1 fails; pass the logged entry
// straight to addFoodToLog and criterion 3 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-food-recents.js');

function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}
const LET_RECENTS = 'let foodRecents = [];';
const markup = (() => { const d = new JSDOM(html).window.document; return d.getElementById('foodSearchInput').outerHTML + d.getElementById('foodRecents').outerHTML + '<div id="foodCats"></div>'; })();

const TODAY = '2026-11-16';
const day = (n) => { const d = new Date(Date.UTC(2026, 10, 16 - n)); return d.toISOString().slice(0, 10); };
const yogurt = {name: 'Greek Yogurt', cal: 100, pro: 17, fat: 0.7, carb: 6};
const banana = {name: 'Banana', cal: 105, pro: 1.3, fat: 0.4, carb: 27};
const bagel3 = {name: 'Bagel ×3', baseName: 'Bagel', qty: 3, cal: 840, pro: 30, fat: 4.5, carb: 165, time: '08:10'};

async function mount(store){
  const { window } = runJsdom(markup, `
    window.__store = ${JSON.stringify(store)};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    var selectedLogDate = '${TODAY}', todaysFoodLog = [], usageCounts = {}, currentSearchTerm = '', _foodSearchTimer = null;
    function isBackdating(){ return false; } function nowTimeKey(){ return '12:00'; } async function addToCustomFoods(){}
    function renderFoodLog(){} function renderFoodItems(){} function markMilestone(){} function showFoodAddedPop(){}`,
    [extractConst(src, 'FOOD_QTY_MAX'), LET_RECENTS, extractConst(src, 'FOOD_RECENTS_DAYS').replace(/^const /, 'var ').replace(/,\s*FOOD_RECENTS_MAX/, '; var FOOD_RECENTS_MAX'),
     ...['dateKeyMinusDays', 'escapeHtml', 'scaleFoodItem', 'saveFoodLog', 'bumpUsageCount', 'buildRecentFoods', 'relogFoodEntry', 'renderFoodRecents', 'addFoodToLog'].map(f => extractFunction(src, f)),
     statement("document.getElementById('foodRecents').addEventListener('click'"), statement("document.getElementById('foodSearchInput').addEventListener('input'"),
     `window.__state = () => ({log: todaysFoodLog, usage: usageCounts, recents: foodRecents});`]);
  await window.renderFoodRecents();
  const $ = id => window.document.getElementById(id);
  const chips = () => [...window.document.querySelectorAll('#foodRecents [data-recent]')];
  const settle = () => new Promise(r => setTimeout(r, 10));
  return {window, $, chips, settle, state: () => JSON.parse(JSON.stringify(window.__state()))};
}

// Yogurt on days 2, 4, 6, 8, 10 (5 days); Banana on days 1, 3, 5 (3 days, more recent).
function fixture(){
  const s = {};
  for(const n of [2, 4, 6, 8, 10]) s[`foodlog:${day(n)}`] = JSON.stringify([yogurt]);
  for(const n of [1, 3, 5]) s[`foodlog:${day(n)}`] = JSON.stringify([...(s[`foodlog:${day(n)}`] ? JSON.parse(s[`foodlog:${day(n)}`]) : []), banana]);
  s[`foodlog:${day(7)}`] = JSON.stringify([bagel3]);
  return s;
}

test('criterion 1: Greek Yogurt (5 of the 14 days) is the first chip, ahead of Banana (3 days, more recent)', async (assert)=>{
  const ui = await mount(fixture());
  assert.deepStrictEqual(ui.chips().map(c => c.textContent), ['Greek Yogurt', 'Banana', 'Bagel ×3']);
  assert.strictEqual(ui.$('foodRecents').hidden, false);
});

test('criterion 2: one click on a chip adds exactly one entry, with that item\'s macros', async (assert)=>{
  const ui = await mount(fixture());
  ui.chips()[0].click(); await ui.settle();
  const s = ui.state();
  assert.strictEqual(s.log.length, 1);
  assert.deepStrictEqual([s.log[0].name, s.log[0].cal, s.log[0].pro, s.log[0].carb], ['Greek Yogurt', 100, 17, 6]);
  assert.strictEqual(ui.window.__store[`foodlog:${TODAY}`], JSON.stringify(s.log), 'saved to today');
});

test('criterion 3: a "Bagel ×3" chip adds one 840-cal entry named "Bagel ×3", and usage counts rise under "Bagel"', async (assert)=>{
  const ui = await mount(fixture());
  ui.chips().find(c => c.textContent === 'Bagel ×3').click(); await ui.settle();
  const s = ui.state();
  assert.strictEqual(s.log.length, 1);
  assert.strictEqual(s.log[0].name, 'Bagel ×3');
  assert.ok(Math.abs(s.log[0].cal - 840) <= 1, String(s.log[0].cal));
  assert.strictEqual(s.log[0].time, '12:00', 'stamped now, not the logged time');
  assert.deepStrictEqual(s.usage, {Bagel: 1});
});

test('criterion 4: typing in the search box hides the chips; clearing it shows them again (real input events)', async (assert)=>{
  const ui = await mount(fixture());
  const input = ui.$('foodSearchInput');
  input.value = 'chick'; input.dispatchEvent(new ui.window.Event('input'));
  assert.strictEqual(ui.$('foodRecents').hidden, true);
  input.value = ''; input.dispatchEvent(new ui.window.Event('input'));
  assert.strictEqual(ui.$('foodRecents').hidden, false);
});

test('criterion 5: each chip is labelled "Add <name>", and the chip\'s CSS min-height is at least 44px', async (assert)=>{
  const ui = await mount(fixture());
  assert.deepStrictEqual(ui.chips().map(c => c.getAttribute('aria-label')), ['Add Greek Yogurt', 'Add Banana', 'Add Bagel ×3']);
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const rule = /\.food-recent-chip\{([^}]*)\}/.exec(css);
  assert.ok(rule && Number((/min-height:(\d+)px/.exec(rule[1]) || [])[1]) >= 44, rule && rule[1]);
});

test('criterion 6: food logged on the day being logged is not counted; with nothing in the 14 days the row stays hidden', async (assert)=>{
  const ui = await mount({[`foodlog:${TODAY}`]: JSON.stringify([yogurt, yogurt]), [`foodlog:${day(15)}`]: JSON.stringify([banana])});
  assert.deepStrictEqual(ui.chips(), []);
  assert.strictEqual(ui.$('foodRecents').hidden, true);
});

test('the top 8, most recent portion: 10 foods give 8 chips, and a food logged as ×2 then later ×1 repeats the ×1', async (assert)=>{
  const s = {};
  for(let n = 1; n <= 10; n++) s[`foodlog:${day(n)}`] = JSON.stringify([{name: 'Food ' + n, cal: n}]);
  s[`foodlog:${day(1)}`] = JSON.stringify([{name: 'Food 1', cal: 1}, {name: 'Rice', cal: 200}]);
  s[`foodlog:${day(2)}`] = JSON.stringify([{name: 'Food 2', cal: 2}, {name: 'Rice ×2', baseName: 'Rice', qty: 2, cal: 400}]);
  const ui = await mount(s);
  assert.strictEqual(ui.chips().length, 8);
  assert.strictEqual(ui.chips()[0].textContent, 'Rice', 'two days ranks first; the latest portion (×1) is the chip');
});

run();
