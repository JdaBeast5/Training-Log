'use strict';
// v3.655 (UX-65, owner 2026-11-24: "warm ups on by default"): "Build the ramp
// in as sets I can log" is on unless the person turned it off. warmupSetsEnabled
// starts true; loadWarmupSetsPref keeps an explicit stored '0' as off, and a
// stored '1' or nothing at all means on. No schema change: same key, same values.
//
// Real invocations: the real declaration, loadWarmupSetsPref and
// applyWarmupSetsPrefToUI with a stubbed window.storage and the real
// #warmupSetsToggle markup; for the rows, renderWorkout's own rampRows
// expression (extracted verbatim) with the real buildWarmupRampRowsHtml,
// indexRampSteps and visibleRampSteps. The whole of renderWorkout was also run
// in Chromium on the harness fixture with no stored preference (see the PR).
//
// Sabotage: restore `= false` and criteria 1 and 4 fail.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-warmup-default-on.js');
const src = readIndexSource();
const DECL = (src.match(/^let warmupSetsEnabled = [a-z]+;$/m) || [])[0];
if(!DECL) throw new Error('warmupSetsEnabled declaration not found');
const between = (a, b) => { const i = src.indexOf(a); const j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('not found: ' + a); return src.slice(i, j + b.length); };
const RAMP_ROWS = between('          const rampRows = warmupSetsEnabled', ".join('');");
const TOGGLE = (src.match(/<label[^>]*><input type="checkbox" id="warmupSetsToggle">[^\n]*?<\/label>/) || [])[0];
if(!TOGGLE) throw new Error('the real #warmupSetsToggle label not found');

async function boot(stored){
  const { window } = runJsdom(TOGGLE, `
    var weightUnit = 'lb';
    window.storage = { get: async k => (k === 'warmup-sets-pref' && ${JSON.stringify(stored)} !== null) ? {value: ${JSON.stringify(stored)}} : null, set: async () => {} };`,
    [DECL, ...['loadWarmupSetsPref', 'applyWarmupSetsPrefToUI', 'escapeHtml', 'trimUnitNum', 'toDisplayWeight', 'warmupRepsValue',
      'buildWarmupRampRowsHtml', 'indexRampSteps', 'visibleRampSteps'].map(n => extractFunction(src, n)),
     'window.__boot = (async () => { await loadWarmupSetsPref(); applyWarmupSetsPrefToUI(); })();',
     'window.__enabled = () => warmupSetsEnabled;',
     `window.__rampRows = (ramp) => { const visibleSteps = visibleRampSteps(indexRampSteps(ramp), []); const saved = [];
${RAMP_ROWS}
       return rampRows; };`]);
  await window.__boot;
  return window;
}
const RAMP = [{label: 'Bar', short: 'Bar', weight: 45, reps: 8}, {label: '40%', short: '40%', weight: 75, reps: 5}, {label: '60%', short: '60%', weight: 110, reps: 3}];

test('criterion 1: with no stored value warmupSetsEnabled is true and the Settings toggle is checked', async (assert)=>{
  const w = await boot(null);
  assert.strictEqual(w.__enabled(), true);
  assert.strictEqual(w.document.getElementById('warmupSetsToggle').checked, true);
});

test('criterion 2: a stored \'0\' (someone turned it off) keeps it off, and the toggle unchecked', async (assert)=>{
  const w = await boot('0');
  assert.strictEqual(w.__enabled(), false);
  assert.strictEqual(w.document.getElementById('warmupSetsToggle').checked, false);
});

test('criterion 3: a stored \'1\' is on', async (assert)=>{
  const w = await boot('1');
  assert.strictEqual(w.__enabled(), true);
  assert.strictEqual(w.document.getElementById('warmupSetsToggle').checked, true);
});

test('criterion 4: with no stored value, renderWorkout\'s ramp is the loggable rows (one .warmup-set-row per step), not the advice line', async (assert)=>{
  const fresh = await boot(null);
  const box = fresh.document.createElement('div'); box.innerHTML = fresh.__rampRows(RAMP);
  assert.strictEqual(box.querySelectorAll('.warmup-set-row').length, 3, 'loggable rows');
  assert.strictEqual(box.querySelectorAll('.warmup-row').length, 0, 'no advice line');
  // Anchor: the same expression with the person's '0' gives the advice line, so the rows above come from the default.
  const off = await boot('0');
  const o = off.document.createElement('div'); o.innerHTML = off.__rampRows(RAMP);
  assert.strictEqual(o.querySelectorAll('.warmup-set-row').length, 0);
  assert.strictEqual(o.querySelectorAll('.warmup-row').length, 3);
});

test('REAL source: the declaration is `= true`, once, and the comment says why the default changed, with a date', (assert)=>{
  assert.strictEqual((src.match(/^let warmupSetsEnabled = /gm) || []).length, 1);
  assert.strictEqual(DECL, 'let warmupSetsEnabled = true;');
  const at = src.indexOf(DECL);
  assert.match(src.slice(at - 600, at), /On by default since v3\.655 \(UX-65; owner 2026-11-24/);
});

run();
