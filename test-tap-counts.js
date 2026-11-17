'use strict';
// Tap counts for the redesign's most frequent actions (UX-13 creates this file;
// UX-06a adds the cover's set logging to it, and UX-17 requires it to pass
// unchanged). Each case drives the real wiring with real clicks and counts the
// taps an action takes; the count may never exceed the parent commit's.
//
// v3.588 (UX-13): "log a recent food": one tap on a BL-18 chip adds exactly one
// entry to today's log. At the parent commit (v3.587) the same chip took one tap.
//
// Real invocation: the real #foodRecents and #foodSearchInput markup, the real
// chip-click wiring, buildRecentFoods, relogFoodEntry, renderFoodRecents and
// addFoodToLog, with a stub window.storage (as test-food-recents.js).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-tap-counts.js');

const PARENT_TAPS = {logRecentFood: 1};

function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}

test('log a recent food: one tap on a recent-food chip adds exactly one entry (no more taps than the parent commit)', async (assert)=>{
  const markup = (() => { const d = new JSDOM(html).window.document; return d.getElementById('foodSearchInput').outerHTML + d.getElementById('foodRecents').outerHTML + '<div id="foodCats"></div>'; })();
  const yesterday = (() => { const d = new Date(Date.UTC(2026, 10, 15)); return d.toISOString().slice(0, 10); })();
  const store = {[`foodlog:${yesterday}`]: JSON.stringify([{name: 'Greek Yogurt', cal: 100, pro: 17, fat: 0.7, carb: 6}])};
  const { window } = runJsdom(markup, `
    window.__store = ${JSON.stringify(store)};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    var selectedLogDate = '2026-11-16', todaysFoodLog = [], usageCounts = {}, currentSearchTerm = '', _foodSearchTimer = null;
    function isBackdating(){ return false; } function nowTimeKey(){ return '12:00'; } async function addToCustomFoods(){}
    function renderFoodLog(){} function renderFoodItems(){} function markMilestone(){} function showFoodAddedPop(){}`,
    [extractConst(src, 'FOOD_QTY_MAX'), 'let foodRecents = [];', extractConst(src, 'FOOD_RECENTS_DAYS').replace(/^const /, 'var ').replace(/,\s*FOOD_RECENTS_MAX/, '; var FOOD_RECENTS_MAX'),
     ...['dateKeyMinusDays', 'escapeHtml', 'scaleFoodItem', 'saveFoodLog', 'bumpUsageCount', 'buildRecentFoods', 'relogFoodEntry', 'renderFoodRecents', 'addFoodToLog'].map(f => extractFunction(src, f)),
     statement("document.getElementById('foodRecents').addEventListener('click'"),
     'window.__log = () => todaysFoodLog.length;']);
  await window.renderFoodRecents();
  const chip = window.document.querySelector('#foodRecents [data-recent]');
  assert.ok(chip, 'anchor: a recent-food chip is offered');
  let taps = 0;
  chip.click(); taps++;
  await new Promise(r => setTimeout(r, 10));
  assert.strictEqual(window.__log(), 1, 'one tap logged one entry');
  assert.ok(taps <= PARENT_TAPS.logRecentFood, `taps ${taps} > parent ${PARENT_TAPS.logRecentFood}`);
});

run();
