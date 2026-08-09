'use strict';
// Behavioral coverage for the health-import staleness indicator — Tier 2,
// new feature.
//
// A CSV import (steps/RHR/HRV) is necessarily one-shot in a PWA — no browser
// API reads HealthKit live — but the Today readiness check leans on resting
// heart rate more than any other import here. Previously the Import Health
// Data card's summary line was static ("Steps, resting HR and HRV from a CSV
// export") whether the last import was yesterday or eight months ago.
// describeHealthImportAge/refreshHealthImportSummary/
// recordHealthImportIfSuccessful close that gap.
//
// Uses the REAL healthImportCard markup and the REAL extracted
// getTodayKey/describeHealthImportAge/refreshHealthImportSummary/
// recordHealthImportIfSuccessful, loaded into an actual jsdom document via a
// real <script> tag, with window.storage stubbed so no real persistence
// happens.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const healthImportCardHtml = extractElementById(src, 'healthImportCard');

const scriptChunks = [
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'describeHealthImportAge'),
  extractFunction(src, 'refreshHealthImportSummary'),
  extractFunction(src, 'recordHealthImportIfSuccessful'),
];

// Builds a 'YYYY-MM-DD' key `daysAgo` days before the REAL local today, using
// the same local-component formatting getTodayKey itself uses (not UTC) —
// so the fixture stays correct regardless of what day the suite actually
// runs on, matching this project's own stated preference for real relative
// dates over hardcoded ones where the logic being tested is date-relative.
function keyDaysAgo(daysAgo){
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

// A mutable backing store, not a fixed canned response — set() must update
// what a later get() sees, matching the real window.storage's round-trip
// behavior, so a test can assert on the app reading back its own write
// (e.g. recordHealthImportIfSuccessful's immediate refresh) rather than only
// on the write itself.
function storageGlobals(initial){
  return `
    window.storage = {
      __store: ${JSON.stringify(initial)},
      __setCalls: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('no saved preference');
      },
      set: (key, value)=>{
        window.storage.__store[key] = value;
        window.storage.__setCalls.push([key, value]);
      },
    };
  `;
}

const { test, run } = makeRunner('test-health-import-staleness.js');

test('describeHealthImportAge returns null (leave default copy) when never imported', (assert)=>{
  const { window } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  assert.strictEqual(window.describeHealthImportAge(null, window.getTodayKey()), null);
});

test('describeHealthImportAge: imported today', (assert)=>{
  const { window } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  const today = window.getTodayKey();
  assert.strictEqual(window.describeHealthImportAge(today, today), 'Steps, resting HR and HRV — last imported today.');
});

test('describeHealthImportAge: imported yesterday', (assert)=>{
  const { window } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  const today = window.getTodayKey();
  assert.strictEqual(window.describeHealthImportAge(keyDaysAgo(1), today), 'Steps, resting HR and HRV — last imported yesterday.');
});

test('describeHealthImportAge: imported 12 days ago, exact phrasing (sabotage-relevant)', (assert)=>{
  const { window } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  const today = window.getTodayKey();
  assert.strictEqual(window.describeHealthImportAge(keyDaysAgo(12), today), 'Steps, resting HR and HRV — last imported 12 days ago.');
});

test('refreshHealthImportSummary leaves the DEFAULT copy alone when nothing was ever imported', async (assert)=>{
  const { document } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  const before = document.getElementById('healthImportSummaryLine').textContent;
  await document.defaultView.refreshHealthImportSummary();
  assert.strictEqual(document.getElementById('healthImportSummaryLine').textContent, before);
});

test('refreshHealthImportSummary updates the summary line from a stored import date', async (assert)=>{
  const { document, window } = runJsdom(healthImportCardHtml, storageGlobals({'last-health-import': keyDaysAgo(3)}), scriptChunks);
  await window.refreshHealthImportSummary();
  assert.strictEqual(document.getElementById('healthImportSummaryLine').textContent, 'Steps, resting HR and HRV — last imported 3 days ago.');
});

test('recordHealthImportIfSuccessful: a fully-failed result set is NOT recorded (no-op import must not reset the clock)', async (assert)=>{
  const { window } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  const recorded = await window.recordHealthImportIfSuccessful([{label:'Steps', failed:true}, {label:'HRV', failed:true}]);
  assert.strictEqual(recorded, false);
  assert.strictEqual(window.storage.__setCalls.length, 0);
});

test('recordHealthImportIfSuccessful: at least one real save IS recorded, even alongside a partial failure', async (assert)=>{
  const { document, window } = runJsdom(healthImportCardHtml, storageGlobals({}), scriptChunks);
  const today = window.getTodayKey();
  const recorded = await window.recordHealthImportIfSuccessful([{label:'Steps', added:5, updated:0, total:5}, {label:'HRV', failed:true}]);
  assert.strictEqual(recorded, true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(window.storage.__setCalls)), [['last-health-import', today]]);
  // recordHealthImportIfSuccessful must also refresh the visible summary line
  // immediately, not just persist silently for next time the card is seen.
  assert.strictEqual(document.getElementById('healthImportSummaryLine').textContent, 'Steps, resting HR and HRV — last imported today.');
});

run();
