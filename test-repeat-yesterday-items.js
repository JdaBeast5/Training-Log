'use strict';
// v3.575 (BL-19): "Repeat yesterday" adds single items, even after you've
// started the day. On an empty day the button still copies the whole prior
// day. On a started day it reads "Add from yesterday" (or "Add from <date>"
// when backdating), and a tap opens (expand-wrap) the prior day's items, each
// with one Add that goes through BL-18's relogFoodEntry. The prior day's
// stored record is only read.
//
// Real invocation: the real updateRepeatYesterdayVisibility,
// renderRepeatYesterdayList, the real #repeatYesterdayBtn and
// #repeatYesterdayList click wiring, relogFoodEntry, addFoodToLog,
// scaleFoodItem, saveFoodLog, bumpUsageCount, dateKeyMinusDays,
// formatLogDateLabel and escapeHtml, with the real markup and a stub storage.
//
// Sabotage: hide the button when the day isn't empty and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-repeat-yesterday-items.js');

function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}
const markup = (() => { const d = new JSDOM(html).window.document; return d.getElementById('repeatYesterdayBtn').outerHTML + d.getElementById('repeatYesterdayWrap').outerHTML; })();
const PRIOR = [{name: 'Oatmeal', cal: 300, pro: 10, fat: 5, carb: 54}, {name: 'Bagel ×3', baseName: 'Bagel', qty: 3, cal: 840, pro: 30, fat: 4.5, carb: 165}, {name: 'Apple', cal: 95, pro: 0.5, fat: 0.3, carb: 25}];

async function mount({today = [], selected = '2026-11-16', realToday = '2026-11-16', prior = PRIOR} = {}){
  const priorKey = (() => { const d = new Date(selected + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); })();
  const { window } = runJsdom(markup, `
    window.__store = ${JSON.stringify({[`foodlog:${priorKey}`]: JSON.stringify(prior), [`foodlog:${selected}`]: JSON.stringify(today)})};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    var selectedLogDate = '${selected}', todaysFoodLog = ${JSON.stringify(today)}, usageCounts = {};
    function getTodayKey(){ return '${realToday}'; } function isBackdating(){ return selectedLogDate !== getTodayKey(); }
    function fmtDayLabel(k){ return 'Sat, Nov 14'; } function nowTimeKey(){ return '12:00'; } async function addToCustomFoods(){}
    function renderFoodLog(){ updateRepeatYesterdayVisibility(); } function renderFoodItems(){} function markMilestone(){} function showFoodAddedPop(){} function renderTodayInsights(){}`,
    [extractConst(src, 'FOOD_QTY_MAX'), ...['dateKeyMinusDays', 'formatLogDateLabel', 'escapeHtml', 'scaleFoodItem', 'saveFoodLog', 'bumpUsageCount', 'relogFoodEntry', 'addFoodToLog',
      'updateRepeatYesterdayVisibility', 'renderRepeatYesterdayList'].map(f => extractFunction(src, f)), 'let repeatPriorItems = [];',
     statement("document.getElementById('repeatYesterdayBtn').addEventListener('click'"), statement("document.getElementById('repeatYesterdayList').addEventListener('click'"),
     `window.__logJson = () => JSON.stringify(todaysFoodLog); window.__usageJson = () => JSON.stringify(usageCounts);`]);
  await window.updateRepeatYesterdayVisibility();
  window.__log = () => JSON.parse(window.__logJson()); window.__usage = () => JSON.parse(window.__usageJson()); // parsed in Node, so deepStrictEqual compares same-realm objects
  const $ = id => window.document.getElementById(id);
  const settle = () => new Promise(r => setTimeout(r, 15));
  return {window, $, settle, priorKey, btn: () => ({text: $('repeatYesterdayBtn').textContent, shown: $('repeatYesterdayBtn').style.display !== 'none'}),
    rows: () => [...window.document.querySelectorAll('#repeatYesterdayList [data-repeat-item]')], open: () => $('repeatYesterdayWrap').classList.contains('open')};
}

test('criterion 1: on an empty day the button copies every prior item, as copies (unchanged behaviour)', async (assert)=>{
  const ui = await mount();
  assert.deepStrictEqual(ui.btn(), {text: 'Repeat yesterday', shown: true});
  ui.$('repeatYesterdayBtn').click(); await ui.settle();
  assert.deepStrictEqual(ui.window.__log(), PRIOR);
  assert.strictEqual(ui.open(), false, 'no list on the whole-day path');
});

test('criterion 2: a day with 1 item and a prior day with 3: the button reads "Add from yesterday" and is visible', async (assert)=>{
  const ui = await mount({today: [{name: 'Coffee', cal: 5}]});
  assert.deepStrictEqual(ui.btn(), {text: 'Add from yesterday', shown: true});
});

test('criteria 3 and 4: a tap opens 3 rows without changing the day; one Add appends exactly one entry; the prior day\'s record is byte-identical', async (assert)=>{
  const ui = await mount({today: [{name: 'Coffee', cal: 5}]});
  const before = ui.window.__store[`foodlog:${ui.priorKey}`];
  ui.$('repeatYesterdayBtn').click(); await ui.settle();
  assert.strictEqual(ui.open(), true);
  assert.strictEqual(ui.$('repeatYesterdayBtn').getAttribute('aria-expanded'), 'true');
  assert.strictEqual(ui.rows().length, 3);
  assert.deepStrictEqual(ui.rows().map(b => b.getAttribute('aria-label')), ['Add Oatmeal', 'Add Bagel ×3', 'Add Apple']);
  assert.deepStrictEqual(ui.window.__log(), [{name: 'Coffee', cal: 5}], 'opening adds nothing');
  ui.rows()[1].click(); await ui.settle();
  const log = ui.window.__log();
  assert.strictEqual(log.length, 2);
  assert.deepStrictEqual([log[1].name, log[1].cal], ['Bagel ×3', 840], 'a multiple re-adds as the same portion');
  assert.deepStrictEqual(ui.window.__usage(), {Bagel: 1}, 'counted under the base name (relogFoodEntry)');
  assert.strictEqual(ui.window.__store[`foodlog:${ui.priorKey}`], before);
  assert.strictEqual(ui.open(), true, 'the list stays open for another pick');
});

test('criterion 5: backdated two days, the label names the prior date (as formatLogDateLabel does)', async (assert)=>{
  const ui = await mount({today: [{name: 'Coffee', cal: 5}], selected: '2026-11-14'});
  assert.deepStrictEqual(ui.btn(), {text: 'Add from Sat, Nov 14', shown: true});
  const empty = await mount({selected: '2026-11-15'});
  assert.deepStrictEqual(empty.btn(), {text: 'Repeat Sat, Nov 14', shown: true}, 'the empty-day label is unchanged');
});

test('no prior entries: the button stays hidden on an empty and a started day', async (assert)=>{
  assert.strictEqual((await mount({prior: []})).btn().shown, false);
  assert.strictEqual((await mount({prior: [], today: [{name: 'Coffee', cal: 5}]})).btn().shown, false);
});

run();
