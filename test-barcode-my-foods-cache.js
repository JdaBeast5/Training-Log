'use strict';
// Behavioral coverage for barcode scanning's My Foods caching (v3.192).
//
// Two things were true going in, checked directly rather than assumed:
// 1. Scanning a barcode and adding it to the log ALREADY cached the item
//    into My Foods — addFoodToLog's generic `item.source`-cache path, which
//    lookupBarcode already fed by setting `source: 'Open Food Facts'`. This
//    was real, working behavior with zero test coverage before this file.
// 2. What was actually missing: a REPEAT scan of the same physical barcode
//    still did a fresh network lookup every time, even though the item was
//    already known. This file locks in both — the pre-existing caching
//    behavior, and the new instant-recognize-from-cache path — with real
//    invocation against the real functions, not a reimplementation.
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-barcode-my-foods-cache.js');

const baseChunks = [
  extractFunction(src, 'escapeHtml'),
  extractConst(src, 'FOOD_QTY_MAX'),
  extractFunction(src, 'scaleFoodItem'),
  extractFunction(src, 'invalidateFlatFoodsCache'),
  extractFunction(src, 'addToCustomFoods'),
  extractFunction(src, 'saveCustomFoods'),
  extractFunction(src, 'addFoodToLog'),
  extractFunction(src, 'lookupBarcode'),
  extractFunction(src, 'renderBarcodeResult'),
  extractFunction(src, 'handleBarcodeFound'),
  // Stubs for addFoodToLog's other real dependencies — deliberately inert,
  // none of them are what this file is testing.
  'var todaysFoodLog = [];',
  'async function saveFoodLog(){}',
  'async function bumpUsageCount(){}',
  'function renderFoodLog(){}',
  'function renderFoodItems(){}',
  'function markMilestone(){}',
  'function nowTimeKey(){ return "12:00"; }',
  'function isBackdating(){ return false; }',
  'function logDayLabel(){ return "Today\'s"; }',
];

const barcodeResultHtml = '<div id="barcodeResult"></div>';

function setup(extraChunks, customFoods){
  const globalsSetup = `
    var customFoods = ${JSON.stringify(customFoods || [])};
    window.customFoods = customFoods;
  `;
  return runJsdom(barcodeResultHtml, globalsSetup, [...baseChunks, ...(extraChunks || [])]);
}

const offResponse = (over)=> ({
  status: 1,
  product: {
    product_name: 'Peanut Butter', brands: "Trader Joe's",
    nutriments: {
      'energy-kcal_serving': 190, 'proteins_serving': 7, 'fat_serving': 16, 'carbohydrates_serving': 7,
      'sodium_serving': 0.12, 'fiber_serving': 2,
    },
    serving_size: '2 tbsp',
    ...over,
  },
});

test('REAL invocation: a fresh (never-before-scanned) barcode calls the network, shows "Found it", and adding it caches the item into My Foods WITH the barcode attached', async (assert)=>{
  const { window, document } = setup([`
    window.__fetchCalls = 0;
    window.fetch = async (url)=>{
      window.__fetchCalls++;
      return { ok:true, json: async ()=> (${JSON.stringify(offResponse())}) };
    };
  `], []);

  await window.handleBarcodeFound('0123456789');
  assert.strictEqual(window.__fetchCalls, 1, 'a never-before-seen barcode must hit the network exactly once');

  const resultEl = document.getElementById('barcodeResult');
  assert.ok(resultEl.textContent.includes('Found it'), 'a fresh lookup must render as "Found it", not the cached-item framing');
  assert.ok(resultEl.textContent.includes("Peanut Butter (Trader Joe's)"), 'the real Open Food Facts product name/brand must render');

  document.getElementById('barcodeAddBtn').click();
  await new Promise(r => setTimeout(r, 0)); // let the async click handler's addFoodToLog resolve

  assert.strictEqual(window.customFoods.length, 1, 'adding a barcode-sourced item must cache exactly one entry into My Foods');
  assert.strictEqual(window.customFoods[0].barcode, '0123456789', 'the cached My Foods entry must carry the real scanned barcode, not just the nutrition fields — this is what makes a REPEAT scan recognizable later');
  assert.strictEqual(window.customFoods[0].source, undefined, 'the cached entry must NOT carry `source` — same contract as every other My Foods entry (source is stripped by addFoodToLog before caching)');
  assert.ok(resultEl.textContent.includes('saved to My Foods for next time'), 'a genuinely fresh add should still say it was saved to My Foods, matching existing behavior');
});

test('REAL invocation: rescanning a barcode already in My Foods finds it WITHOUT touching the network at all', async (assert)=>{
  const cachedItem = { name: 'Oat Milk (Oatly)', cal: 120, pro: 3, fat: 5, carb: 16, barcode: '9998887776' };
  const { window, document } = setup([`
    window.__fetchCalls = 0;
    window.fetch = async ()=>{ window.__fetchCalls++; throw new Error('fetch must not be called for a barcode already in My Foods'); };
  `], [cachedItem]);

  await window.handleBarcodeFound('9998887776');

  assert.strictEqual(window.__fetchCalls, 0, 'a barcode already cached in My Foods must never trigger a network lookup — this is the actual point of the feature, not just a nice-to-have');
  const resultEl = document.getElementById('barcodeResult');
  assert.ok(resultEl.textContent.includes('Already in My Foods'), 'a cache hit must render the "already known" framing, not "Found it"');
  assert.ok(resultEl.textContent.includes('Oat Milk (Oatly)'), 'the real cached item name must render');
});

test('sabotage-relevant: the cache-first check really is keyed by BARCODE, not by coincidence — a barcode NOT in My Foods still falls through to the network even when other cached items exist', async (assert)=>{
  const cachedItem = { name: 'Oat Milk (Oatly)', cal: 120, pro: 3, fat: 5, carb: 16, barcode: '9998887776' };
  const { window, document } = setup([`
    window.__fetchCalls = 0;
    window.fetch = async ()=>{
      window.__fetchCalls++;
      return { ok:true, json: async ()=> (${JSON.stringify(offResponse({ product_name: 'Different Product', brands: 'Other Brand' }))}) };
    };
  `], [cachedItem]);

  await window.handleBarcodeFound('1112223334'); // a different barcode than the one cached

  assert.strictEqual(window.__fetchCalls, 1, 'a barcode that is NOT the cached one must still hit the network — proves the match is on barcode identity, not "any cached item exists"');
  const resultEl = document.getElementById('barcodeResult');
  assert.ok(resultEl.textContent.includes('Different Product'), 'the real (uncached) network result must render, not the unrelated cached item');
  assert.ok(!resultEl.textContent.includes('Oat Milk'), 'the unrelated cached item must never leak into an unrelated barcode\'s result');
});

test('REAL invocation: a cache-hit item (no servingDesc, since My Foods entries never carry one) renders and re-adds cleanly without showing "undefined"', async (assert)=>{
  const cachedItem = { name: 'Rice Cakes', cal: 35, pro: 1, fat: 0, carb: 7, barcode: '5554443332' };
  const { window, document } = setup([`window.fetch = async ()=>{ throw new Error('must not be called'); };`], [cachedItem]);

  await window.handleBarcodeFound('5554443332');
  const resultEl = document.getElementById('barcodeResult');
  assert.ok(!resultEl.innerHTML.includes('undefined'), 'a cached item with no servingDesc must not render the literal string "undefined" — this is exactly the kind of thing an unconditional template interpolation would produce');

  document.getElementById('barcodeAddBtn').click();
  await new Promise(r => setTimeout(r, 0));
  assert.ok(resultEl.textContent.includes('Added to'), 're-adding a cache-hit item must still log it');
  assert.ok(!resultEl.textContent.includes('saved to My Foods for next time'), 're-adding something ALREADY in My Foods should not claim it was just saved — it was already there');
});

run();
