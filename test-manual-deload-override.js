'use strict';
// Behavioral coverage for the manual deload/taper override — Tier 2, new
// feature.
//
// isDeloadWeek() was schedule-only: every 5th week since the mesocycle
// started (DELOAD_CYCLE_WEEKS), no way to call one on demand. A real reason
// to deload doesn't always land on week 5 — a competition, a rough patch,
// just needing one. manualDeloadEnabled is checked FIRST inside
// isDeloadWeek() itself, so every one of its ~25 existing call sites
// (suggested weights, warm-up ramps, progress badges, session-length
// trimming) picks it up with no changes of their own.
//
// This had zero prior test coverage (isDeloadWeek/getMesocycleWeek), so
// per this project's own "write a test capturing current behavior before
// touching it" rule, these tests cover BOTH the pre-existing scheduled-week
// behavior (must stay unchanged) and the new override (must win over it).
//
// The toggle's own change-listener wiring (a delegated document-level
// listener, same shape as warmupSetsToggle/wakeLockToggle) is deliberately
// NOT unit-tested here, matching this project's own documented choice to
// leave that exact class of simple preference-toggle wiring to live
// verification rather than Tier 3 unit coverage (see HANDOFF-v34 §5.3).
// The real logic — loadManualDeloadPref, applyManualDeloadPrefToUI, and the
// isDeloadWeek() override itself — IS tested, since that's where an actual
// bug could hide.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const toggleHtml = extractElementById(src, 'prefManualDeload');

const scriptChunks = [
  // var, not let: this test toggles it directly between assertions the same
  // way the real code's own event handler does, and only `var` lands on
  // window as a settable property.
  'var manualDeloadEnabled = false;',
  extractFunction(src, 'getTodayKey'),
  extractConst(src, 'DELOAD_CYCLE_WEEKS'),
  extractFunction(src, 'getMesocycleWeek'),
  extractFunction(src, 'isDeloadWeek'),
  extractFunction(src, 'loadManualDeloadPref'),
  extractFunction(src, 'applyManualDeloadPrefToUI'),
];

// A 'YYYY-MM-DD' key `daysAgo` days before the REAL local today, matching
// getTodayKey()'s own local-component formatting — so a fixture "week 3" or
// "week 5" stays correct regardless of what day the suite actually runs on.
function keyDaysAgo(daysAgo){
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function cycleStartGlobals(cycleStartKey){
  return `
    window.storage = {
      __store: { 'program-cycle-start': ${JSON.stringify(cycleStartKey)} },
      __setCalls: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('no saved preference');
      },
      set: (key, value)=>{ window.storage.__store[key] = value; window.storage.__setCalls.push([key, value]); },
    };
  `;
}

const { test, run } = makeRunner('test-manual-deload-override.js');

test('baseline (unchanged): a non-multiple-of-5 week is NOT a deload week when the override is off', async (assert)=>{
  // 14 days ago -> daysSince=14 -> week = floor(14/7)+1 = 3 (not a multiple of 5)
  const { window } = runJsdom('', cycleStartGlobals(keyDaysAgo(14)), scriptChunks);
  assert.strictEqual(await window.getMesocycleWeek(), 3, 'precondition: week 3');
  assert.strictEqual(await window.isDeloadWeek(), false);
});

test('baseline (unchanged): a multiple-of-5 week IS a deload week when the override is off — the original scheduled behavior', async (assert)=>{
  // 28 days ago -> daysSince=28 -> week = floor(28/7)+1 = 5
  const { window } = runJsdom('', cycleStartGlobals(keyDaysAgo(28)), scriptChunks);
  assert.strictEqual(await window.getMesocycleWeek(), 5, 'precondition: week 5');
  assert.strictEqual(await window.isDeloadWeek(), true);
});

test('the override forces a deload on a week that would NOT normally be one — the actual new behavior', async (assert)=>{
  const { window } = runJsdom('', cycleStartGlobals(keyDaysAgo(14)), scriptChunks);
  assert.strictEqual(await window.getMesocycleWeek(), 3, 'precondition: week 3, would be false without the override');
  window.manualDeloadEnabled = true;
  assert.strictEqual(await window.isDeloadWeek(), true, 'the manual override must win regardless of the schedule');
});

test('loadManualDeloadPref: only the literal stored value "1" turns it on (sabotage-relevant: not any truthy string)', async (assert)=>{
  const { window: onWindow } = runJsdom('', `
    window.storage = { get: async ()=> ({ value: '1' }) };
  `, scriptChunks);
  await onWindow.loadManualDeloadPref();
  assert.strictEqual(onWindow.manualDeloadEnabled, true);

  const { window: offWindow } = runJsdom('', `
    window.storage = { get: async ()=> ({ value: '0' }) };
  `, scriptChunks);
  await offWindow.loadManualDeloadPref();
  assert.strictEqual(offWindow.manualDeloadEnabled, false, 'a stored "0" must NOT turn it on');
});

test('loadManualDeloadPref: nothing ever saved leaves it off, no throw', async (assert)=>{
  const { window } = runJsdom('', `
    window.storage = { get: async ()=>{ throw new Error('no saved preference'); } };
  `, scriptChunks);
  await assertDoesNotThrow(assert, ()=> window.loadManualDeloadPref());
  assert.strictEqual(window.manualDeloadEnabled, false);
});

test('applyManualDeloadPrefToUI syncs the real checkbox to the current flag, both directions', (assert)=>{
  const { document, window } = runJsdom(toggleHtml, '', scriptChunks);
  window.manualDeloadEnabled = true;
  window.applyManualDeloadPrefToUI();
  assert.strictEqual(document.getElementById('manualDeloadToggle').checked, true);

  window.manualDeloadEnabled = false;
  window.applyManualDeloadPrefToUI();
  assert.strictEqual(document.getElementById('manualDeloadToggle').checked, false);
});

async function assertDoesNotThrow(assert, fn){
  let threw = false;
  try{ await fn(); }catch(e){ threw = true; }
  assert.strictEqual(threw, false);
}

run();
