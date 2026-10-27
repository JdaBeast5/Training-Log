'use strict';
// Log tab 2.0 (owner: "go through the whole Log tab, and use our skills ... to
// make it a 2.0 version of it"). One increment per version.
//
// v3.428 — What you ate comes first. The day's food log sat at the very
// bottom of the nutrition card, under search, five quick-add tiles, the
// category chips, the whole food library and the custom-item form. It now
// opens the expandable part, right under the totals it adds up to.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractElementById, runJsdom } = require('./testHelpers.js');
const src = readIndexSource();

const { test, run } = makeRunner('test-log-2-0.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const before = (a, b) => !!(a.compareDocumentPosition(b) & a.ownerDocument.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);

test('REAL markup (v3.428): the day\'s food log is the first thing in the nutrition card\'s expandable part', (assert)=>{
  const wrap = doc.getElementById('nutritionExpandWrap');
  const log = doc.getElementById('foodLogList');
  assert.strictEqual(doc.querySelectorAll('#foodLogList').length, 1);
  assert.ok(wrap.contains(log), 'still inside the collapsible part');
  for(const id of ['foodSearchInput', 'foodItems', 'customToggle', 'repeatYesterdayBtn']) assert.ok(doc.getElementById(id), 'anchor: ' + id);
  for(const id of ['foodSearchInput', 'foodItems', 'customToggle']) assert.ok(before(log, doc.getElementById(id)), 'the log comes before ' + id);
  assert.ok(before(doc.getElementById('repeatYesterdayBtn'), log), 'Repeat yesterday stays with it, above the list');
  const firstLabel = wrap.querySelector('.section-label');
  assert.strictEqual(firstLabel.textContent.trim(), 'Today');
});

// v3.429 — Targets once. A strip of four targets (2169 / 128g / 65g / 268g)
// sat over four bars that said the same numbers again ("0 / 2169"). Now one
// figure answers the question you open the card for, calories left (or
// over, in yellow), and each bar carries its own target with its unit.
function nutrition(eaten, cal = 2000){
  const markup = '<div id="calorieFloorNote"></div>' + extractElementById(src, 'calHero') +
    ['Cal', 'Pro', 'Fat', 'Carb'].map(k => `<div id="bar${k}"></div><div id="val${k}"></div>`).join('');
  const { window } = runJsdom(markup, `window.targets = {cal:${cal}, pro:150, fat:70, carb:200, isFloored:false};`,
    [extractFunction(src, 'renderCalHero'), extractFunction(src, 'updateBars'), extractFunction(src, 'applyTargetsToUI'),
     `updateBars(${JSON.stringify(eaten)});`]);
  return window;
}
test('REAL invocation (v3.429): the hero says calories left; the bars carry their targets in grams', (assert)=>{
  const w = nutrition({cal:640, pro:52, fat:20, carb:71});
  const $ = id => w.document.getElementById(id).textContent;
  assert.strictEqual($('calHeroNum'), '1360');
  assert.strictEqual($('calHeroUnit'), 'cal left of 2000');
  assert.strictEqual($('valCal'), '640 / 2000');
  assert.strictEqual($('valPro'), '52 / 150g');
  assert.strictEqual($('valCarb'), '71 / 200g');
  assert.strictEqual(w.document.getElementById('calHero').classList.contains('is-over'), false);
});

test('REAL invocation (v3.429): over target reads "over" in yellow; a target change alone redraws it', (assert)=>{
  const w = nutrition({cal:2300});
  assert.strictEqual(w.document.getElementById('calHeroNum').textContent, '300');
  assert.strictEqual(w.document.getElementById('calHeroUnit').textContent, 'cal over 2000');
  assert.ok(w.document.getElementById('calHero').classList.contains('is-over'));
  w.eval('targets.cal = 2500; applyTargetsToUI();');
  assert.strictEqual(w.document.getElementById('calHeroNum').textContent, '200');
  assert.strictEqual(w.document.getElementById('calHeroUnit').textContent, 'cal left of 2500');
});

test('REAL markup + CSS (v3.429): no targets strip; the figure is the card\'s one large number', (assert)=>{
  assert.strictEqual(doc.querySelector('.targets-strip'), null);
  assert.strictEqual(doc.getElementById('tvCal'), null);
  assert.ok(before(doc.getElementById('calHero'), doc.getElementById('barCal')), 'the figure leads, the bars follow');
  assert.match(html, /\.cal-hero-num\{[^}]*font-size:34px/);
  assert.match(html, /\.cal-hero\.is-over \.cal-hero-num\{color:var\(--plate-yellow\);\}/);
});

// v3.430 — The food-search key offer. "Food search is on (shared key) · Add
// your own key" sat as an underlined line between the search field and the
// quick-add tiles for everyone, always. buildUsdaKeyUpgradePrompt's own
// comment said it should only appear once the shared key's limit is hit;
// now it does.
function usdaSearch(error){
  const { window } = runJsdom('<div id="usdaKeySettingsSlot"></div><div id="foodItems"></div>',
    `window.renderFoodItems = ()=>{}; window.searchUsdaFoods = async ()=>{ ${error ? `throw new Error(${JSON.stringify(error)});` : 'return [];'} };
     var usdaResults = [], usdaSearchedTerm = null, usdaSearchLoading = false, usdaSearchError = null;`,
    [extractFunction(src, 'runUsdaSearch'), "window.__done = runUsdaSearch('oats');"]);
  return window;
}
test('REAL invocation (v3.430): the key offer appears after a rate-limit error, and not otherwise', async (assert)=>{
  const limited = usdaSearch('USDA rate limit hit — try again in a bit, or add a free personal key for a much higher limit.');
  await limited.__done;
  assert.ok(limited.document.getElementById('usdaKeySettingsSlot').classList.contains('is-needed'));
  for(const other of [null, 'USDA lookup failed (500)']){
    const w = usdaSearch(other); await w.__done;
    assert.strictEqual(w.document.getElementById('usdaKeySettingsSlot').classList.contains('is-needed'), false, String(other));
  }
});

test('REAL CSSOM (v3.430): the slot is hidden until needed', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const { window } = new JSDOM(`<style>${CSS}</style><div id="usdaKeySettingsSlot"><div class="usda-key-upgrade">x</div></div>`);
  const slot = window.document.getElementById('usdaKeySettingsSlot');
  assert.strictEqual(window.getComputedStyle(slot).display, 'none');
  slot.classList.add('is-needed');
  assert.strictEqual(window.getComputedStyle(slot).display, 'block');
});

// v3.431 — Rows fit the card. A number input keeps an intrinsic minimum
// width, so Bodyweight's and Sleep's Log buttons ran 13px past the card's
// inner edge (measured in Chromium: button right 362 vs inner edge 349; the
// grocery row, a text input, fit). The row's inputs may now shrink.
test('REAL CSSOM (v3.431): the add-row inputs may shrink below their intrinsic width', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const { window } = new JSDOM(`<style>${CSS}</style><div class="weight-input-row"><input type="number" id="w"><input type="text" id="t"><button>Log</button></div>`);
  for(const id of ['w', 't']) assert.strictEqual(window.getComputedStyle(window.document.getElementById(id)).minWidth, '0px', id);
  for(const id of ['weightInput', 'sleepInput']) assert.ok(doc.getElementById(id).closest('.weight-input-row'), 'anchor: ' + id + ' sits in the row');
});

run();
