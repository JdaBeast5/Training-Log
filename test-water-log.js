'use strict';
// Behavioral coverage for the Water log — Phase B "Tier 3" backfill.
//
// Water is architecturally different from weight/BP/glucose: it's not a
// list of discrete entries but a single running total per day, stored under
// a per-date key (`water:${selectedLogDate}`). There is no per-entry
// "delete" — the app's only removal affordance is the Reset button, which
// zeroes the whole day's total. Confirmed by reading getWaterIntake/
// saveWaterIntake/renderWater and the real .water-btn/#waterReset wiring —
// there is no editWater or deleteWaterEntry anywhere in the file. So this
// file's "Create" is the +oz buttons (cumulative), "Read" is renderWater's
// text/bar output, and "Delete" is the real Reset button.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const getWaterIntakeSrc = extractFunction(src, 'getWaterIntake');
const saveWaterIntakeSrc = extractFunction(src, 'saveWaterIntake');
const renderWaterSrc = extractFunction(src, 'renderWater');
const computeWaterTargetSrc = extractFunction(src, 'computeWaterTarget');
const waterBtnWiringSrc = extractStatement(src, "document.querySelectorAll('.water-btn[data-oz]').forEach(btn=>{");
const waterResetWiringSrc = extractStatement(src, "document.getElementById('waterReset').addEventListener('click'");

const bodyHtml = `
  <div class="water-value-line" id="waterValText">0 / 128 oz</div>
  <div class="macro-bar-track"><div class="macro-bar-fill" id="barWater" style="background:#4FC3F7;width:0%"></div></div>
  <div class="water-btn-row">
    <button class="water-btn" data-oz="8" aria-label="Log 8 ounces of water">+8oz</button>
    <button class="water-btn" data-oz="16" aria-label="Log 16 ounces of water">+16oz</button>
    <button class="water-btn" data-oz="24" aria-label="Log 24 ounces of water">+24oz</button>
    <button class="water-btn water-reset" id="waterReset">Reset</button>
  </div>
`;

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
      set: async (key, value)=>{ window.storage.__store[key] = value; },
    };
  `;
}

function otherGlobals(opts){
  opts = opts || {};
  return `
    window.selectedLogDate = ${JSON.stringify(opts.selectedLogDate || '2026-08-10')};
    window.userProfile = { weight: ${opts.profileWeight != null ? opts.profileWeight : 150}, activity: ${opts.activity != null ? opts.activity : 1.2} };
    window.renderTodayInsights = ()=>{};
  `;
}

const scriptChunks = [
  computeWaterTargetSrc, getWaterIntakeSrc, saveWaterIntakeSrc, renderWaterSrc,
  waterBtnWiringSrc, waterResetWiringSrc,
];

const { test, run } = makeRunner('test-water-log.js');

// --- Read/render ----------------------------------------------------------

test('renderWater shows 0 / target when nothing has been logged today', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals({profileWeight:150}), scriptChunks);
  await window.renderWater();
  // computeWaterTarget(150lb, activity 1.2) = round(150*0.6) = 90, no activity bump.
  assert.strictEqual(document.getElementById('waterValText').textContent, '0 / 90 oz');
  assert.strictEqual(document.getElementById('barWater').style.width, '0%');
});

test('renderWater reflects an already-saved amount and computes the bar width as a percentage of target', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'water:2026-08-10': '45',
  }) + otherGlobals({profileWeight:150}), scriptChunks);
  await window.renderWater();
  assert.strictEqual(document.getElementById('waterValText').textContent, '45 / 90 oz');
  assert.strictEqual(document.getElementById('barWater').style.width, '50%');
});

test('renderWater clamps the bar width at 100% when intake exceeds target', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'water:2026-08-10': '150',
  }) + otherGlobals({profileWeight:150}), scriptChunks);
  await window.renderWater();
  assert.strictEqual(document.getElementById('waterValText').textContent, '150 / 90 oz');
  assert.strictEqual(document.getElementById('barWater').style.width, '100%', 'the bar must never exceed 100% even when over target');
});

test('the water target rises for a higher-activity profile (activity >= 1.55 adds a 20oz bump)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals({profileWeight:150, activity:1.65}), scriptChunks);
  await window.renderWater();
  assert.strictEqual(document.getElementById('waterValText').textContent, '0 / 110 oz', 'target must be 90 (base) + 20 (activity bump) = 110');
});

// --- Create: the real +oz button wiring -----------------------------------

test('REAL invocation: clicking +8oz saves 8 and updates the DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.querySelector('.water-btn[data-oz="8"]').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['water:2026-08-10'], '8');
  assert.strictEqual(document.getElementById('waterValText').textContent, '8 / 90 oz');
});

test('REAL invocation: clicking multiple +oz buttons accumulates (cumulative, not overwriting)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.querySelector('.water-btn[data-oz="16"]').click();
  await new Promise(r=> setTimeout(r, 20));
  document.querySelector('.water-btn[data-oz="24"]').click();
  await new Promise(r=> setTimeout(r, 20));
  document.querySelector('.water-btn[data-oz="8"]').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['water:2026-08-10'], '48', '16 + 24 + 8 = 48');
  assert.strictEqual(document.getElementById('waterValText').textContent, '48 / 90 oz');
});

test('REAL invocation: water is namespaced per selectedLogDate — an existing total for a DIFFERENT date is untouched and not shown', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'water:2026-08-05': '64', // a different day's total already on record
  }) + otherGlobals({selectedLogDate:'2026-08-10'}), scriptChunks);
  await window.renderWater();
  assert.strictEqual(document.getElementById('waterValText').textContent, '0 / 90 oz', 'today (Aug 10) must start at 0, unaffected by Aug 5\'s total');

  document.querySelector('.water-btn[data-oz="8"]').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['water:2026-08-10'], '8');
  assert.strictEqual(window.storage.__store['water:2026-08-05'], '64', 'a different day\'s stored total must not be touched by logging on today\'s date');
});

// --- Delete-equivalent: the real Reset button ------------------------------

test('REAL invocation: clicking Reset zeroes today\'s total in storage and the DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'water:2026-08-10': '80',
  }) + otherGlobals(), scriptChunks);
  await window.renderWater();
  assert.strictEqual(document.getElementById('waterValText').textContent, '80 / 90 oz', 'precondition: 80oz already logged today');

  document.getElementById('waterReset').click();
  await new Promise(r=> setTimeout(r, 20));

  assert.strictEqual(window.storage.__store['water:2026-08-10'], '0');
  assert.strictEqual(document.getElementById('waterValText').textContent, '0 / 90 oz');
  assert.strictEqual(document.getElementById('barWater').style.width, '0%');
});

test('REAL invocation: Reset only affects the current date, not other days\' stored totals', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'water:2026-08-05': '64',
    'water:2026-08-10': '30',
  }) + otherGlobals({selectedLogDate:'2026-08-10'}), scriptChunks);
  document.getElementById('waterReset').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.storage.__store['water:2026-08-10'], '0');
  assert.strictEqual(window.storage.__store['water:2026-08-05'], '64', 'Reset must not touch a different day\'s total');
});

run();
