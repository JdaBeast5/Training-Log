'use strict';
// v3.656 (UX-62, owner C+ 2026-11-24; the no-history fallback 2026-11-25):
// the warm-up ramp on the cover, as one line above Log: "Warm-up 1 of 4" over
// "45×8", Done and Skip. The big number and Log stay the working set; the plate
// stack draws the step's load with "Warm-up 1 of 4" as its caption (C+). Done is
// the step's own chip (its handler saves and offers Undo); Skip is the ramp's
// own skip-all. A lift with no history builds its ramp from the weight typed on
// the cover (chooseRampBasis's last source, held in memory).
//
// Real invocations: renderUpNext, renderCoverWarmup, pendingWarmupChip,
// renderCoverNumeral, renderWarmupChips (its chip handler), buildWarmupRampRowsHtml,
// showUndoToast and the cover's Done/Skip and weight-field listeners, taken from
// the source; the real cover markup. renderWorkout itself can't run a training
// day in jsdom (test-today-cover.js says the same), so the whole flow was run in
// Chromium on the harness fixture (see the PR).
//
// Sabotage: show the line for any lift with a ramp strip (pref off included)
// and criterion 5 fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-warmup.js');
const src = readIndexSource();
const stmt = start => { const i = src.indexOf(start); if(i < 0) throw new Error('not found: ' + start); return src.slice(i, src.indexOf('\n});', i) + 4); };
const FNS = ['findNextSetRow', 'numericPlaceholder', 'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip', 'setCoverThen', 'supersetThenLine' /* v3.657 (UX-63) */, 'syncStickyDayTitle', 'fillSetLogger', 'readSetLogger',
  'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'escapeHtml', 'renderWarmupChips', 'buildWarmupRampRowsHtml', 'warmupRepsValue', 'trimUnitNum',
  'toDisplayWeight', 'toCanonicalLb', 'showUndoToast', 'coverBasisKey', 'coverWarmupBlock', 'chooseRampBasis'].map(n => extractFunction(src, n));
const WIRING = [
  stmt("document.getElementById('coverWarmupDone').addEventListener('click'"),
  stmt("document.getElementById('coverWarmupSkip').addEventListener('click'"),
  stmt("document.getElementById('upNextWeight').addEventListener('change'"),
  stmt("document.addEventListener('change', (e)=>{\n  if(e.target && e.target.closest && e.target.closest('#exerciseList')) setTimeout"),
];
// As indexRampSteps leaves them (each step carries its idx).
const RAMP = [{idx: 0, label: 'Bar', short: 'Bar', weight: 45, reps: 8}, {idx: 1, label: '40%', short: '40%', weight: 75, reps: 5},
  {idx: 2, label: '60%', short: '60%', weight: 110, reps: 3}, {idx: 3, label: '80%', short: '80%', weight: 150, reps: 2}];

function rowHtml(setIdx, {wv = '', rv = '', w = '185'} = {}){
  return `<div class="set-row" data-set-idx="${setIdx}" data-ex-idx="0"><span class="set-row-owner">Bench Press</span>
    <input class="ex-input ex-weight" placeholder="${w}" value="${wv}"><input class="ex-input ex-reps" placeholder="5" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
}
// The block as renderWorkout builds it: chips strip, header, sets block with the ramp strip.
function blockHtml({loggable = true, ramp = true, logged = 0, w = '185', rampFrom = ''} = {}){
  const strip = !ramp ? '' : loggable ? `<div class="warmup-strip" id="strip"><div class="warmup-title">Ramp</div>__ROWS__</div>`
    : `<div class="warmup-box"><div class="warmup-row"><span>Bar — 45 lb × 8</span></div></div>`;
  return `<div class="exercise-block"${rampFrom ? ` data-ramp-from="${rampFrom}"` : ''}><div class="set-chips"></div><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-sets"><span>5×5</span></div></div>
    <div class="sets-block">${strip}${[0,1,2,3,4].map(i => rowHtml(i, i < logged ? {wv: w, rv: '5', w} : {w})).join('')}</div></div>`;
}
function mount(opts = {}){
  const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="exerciseList">${blockHtml(opts)}</div>` + extractElementById(src, 'undoToast'), `
    var weightUnit = 'lb', distanceUnit = 'km', activeProgram = 'strength', activeDay = 'd1', selectedLogDate = '2026-11-25', exerciseDetailPinned = true;
    var warmupSetsEnabled = ${opts.pref !== false}; let undoToastTimeout = null;
    const coverWarmupBasis = new Map();
    window.__bars = []; function renderCoverBar(card, weight, caption){ window.__bars.push([String(weight), caption || '']); }
    function renderExerciseDetailBar(){} function icon(){ return ''; } function renderAllSetChips(){ renderWarmupChips(document.querySelector('.exercise-block')); }
    function firstSetHint(){ return ''; } window.__renders = 0; async function renderWorkout(){ window.__renders++; renderUpNext(); } /* as the real one ends: renderUpNext refills the cover's fields */`,
    [...FNS, `
     const strip = document.getElementById('strip');
     if(strip){
       strip.innerHTML = strip.innerHTML.replace('__ROWS__', buildWarmupRampRowsHtml(${JSON.stringify(RAMP)}, []));
       window.__skips = 0; strip._skipAll = () => { window.__skips++; strip.querySelectorAll('.warmup-set-row').forEach(r => r.remove()); renderWarmupChips(document.querySelector('.exercise-block')); renderUpNext(); };
     }
     renderWarmupChips(document.querySelector('.exercise-block'));
     window.__render = renderUpNext; window.__basis = coverWarmupBasis; window.__choose = chooseRampBasis;`, ...WIRING]);
  const $ = id => window.document.getElementById(id);
  window.__render();
  return { window, $, doc: window.document, tick: () => new Promise(r => setTimeout(r, 5)) };
}

test('criterion 1: Bench not started: the cover shows "Warm-up 1 of 4 · 45×8"; the big number and Log stay set 1\'s working weight; the plates are the step\'s (C+)', (assert)=>{
  const ui = mount();
  assert.strictEqual(ui.$('coverWarmup').hidden, false);
  assert.strictEqual(ui.$('coverWarmupOf').textContent, 'Warm-up 1 of 4');
  assert.strictEqual(ui.$('coverWarmupStep').textContent, '45×8');
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Set 1 of 5', 'the cover is still on set 1');
  assert.strictEqual(ui.$('upNextNumeral').querySelector('.cover-w').textContent, '185', 'the big number is the working weight');
  assert.strictEqual(ui.$('upNextLog').textContent, 'Log set');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__bars.pop())), ['45', 'Warm-up 1 of 4'], 'the plate stack draws the step, captioned');
});

test('criterion 2: Done ticks step 1 through its real chip (the row\'s checkbox, the Undo toast) and the line moves to 2 of 4; Undo puts it back', async (assert)=>{
  const ui = mount();
  ui.$('coverWarmupDone').click();
  assert.ok(ui.doc.querySelector('.warmup-set-row[data-step-idx="0"] .warmup-done').checked, 'the real row is ticked');
  assert.strictEqual(ui.$('undoToastText').textContent, 'Logged warm-up 45×8');
  await ui.tick();
  assert.strictEqual(ui.$('coverWarmupOf').textContent, 'Warm-up 2 of 4');
  assert.strictEqual(ui.$('coverWarmupStep').textContent, '75×5');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__bars.pop())), ['75', 'Warm-up 2 of 4']);
  ui.$('undoToastBtn').click();
  await ui.tick(); await ui.tick();
  assert.ok(!ui.doc.querySelector('.warmup-set-row[data-step-idx="0"] .warmup-done').checked);
  assert.strictEqual(ui.$('coverWarmupOf').textContent, 'Warm-up 1 of 4');
});

test('criterion 3: Skip runs the ramp\'s own skip-all once, and the line is gone', (assert)=>{
  const ui = mount();
  ui.$('coverWarmupSkip').click();
  assert.strictEqual(ui.window.__skips, 1);
  assert.strictEqual(ui.$('coverWarmup').hidden, true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__bars.pop())), ['185', ''], 'the plates go back to the working weight');
});

test('criterion 4: after the last step, or once a working set is logged, the line is gone', async (assert)=>{
  const ui = mount();
  for(let k = 0; k < 4; k++){ ui.$('coverWarmupDone').click(); await ui.tick(); }
  assert.strictEqual(ui.$('coverWarmup').hidden, true, 'all four ticked');
  const started = mount({logged: 1});
  assert.strictEqual(started.$('upNextLabel').textContent, 'Set 2 of 5', 'anchor: set 1 logged');
  assert.strictEqual(started.$('coverWarmup').hidden, true, 'into the working sets');
});

test('criterion 5: with the ramp off (the advice line, no chips) or no ramp at all, there is no warm-up line', (assert)=>{
  assert.strictEqual(mount({loggable: false, pref: false}).$('coverWarmup').hidden, true, 'pref off');
  assert.strictEqual(mount({ramp: false}).$('coverWarmup').hidden, true, 'no ramp');
  assert.strictEqual(mount().$('coverWarmup').hidden, false, 'anchor: shown with a loggable ramp');
});

test('criterion 7: Done and Skip are 44 × 44 and named', (assert)=>{
  const fs = require('fs'), path = require('path'), { JSDOM } = require('jsdom');
  const css = [...fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const w = new JSDOM(`<style>${css}</style>${extractElementById(src, 'upNext')}`).window;
  for(const id of ['coverWarmupDone', 'coverWarmupSkip']){
    const cs = w.getComputedStyle(w.document.getElementById(id));
    assert.ok(parseFloat(cs.minWidth) >= 44 && parseFloat(cs.minHeight) >= 44, id);
  }
  const ui = mount();
  assert.strictEqual(ui.$('coverWarmupDone').getAttribute('aria-label'), 'Mark warm-up 45 lb × 8 reps done');
  assert.strictEqual(ui.$('coverWarmupSkip').getAttribute('aria-label'), 'Skip the warm-up');
});

const change = (u, v) => { u.$('upNextWeight').value = v; u.$('upNextWeight').dispatchEvent(new u.window.Event('change', {bubbles: true})); };

test('fallback (owner 2026-11-25): a lift renderWorkout stamped as wanting a ramp with no basis builds it from the weight typed on the cover', async (assert)=>{
  const ui = mount({ramp: false, w: 'lb', rampFrom: 'none'});
  assert.strictEqual(ui.$('coverWarmup').hidden, true, 'anchor: no history, no ramp, no line');
  change(ui, '100'); await ui.tick();
  assert.strictEqual(ui.window.__basis.get('strength|d1|2026-11-25|0|Bench Press'), 100, 'held for this lift (by name too), this day and date');
  assert.strictEqual(ui.window.__renders, 1, 'the workout re-renders once with it');
  change(ui, '100'); await ui.tick();
  assert.strictEqual(ui.window.__renders, 1, 'the same weight again: no second render');
  // The real chooseRampBasis takes it last: history and a suggestion still win.
  const choose = ui.window.__choose;
  assert.deepStrictEqual(JSON.parse(JSON.stringify(choose(null, null, null, 100))), {weight: 100, from: 'cover'});
  assert.strictEqual(choose(null, null, {weight: 185}, 100).from, 'last');
  assert.strictEqual(choose(null, null, null, undefined), null);
});

test('review fix: a corrected weight rebuilds a ramp built from the cover; the reps typed on the cover survive the re-render', async (assert)=>{
  const ui = mount({ramp: false, w: 'lb', rampFrom: 'cover'});
  ui.$('upNextReps').value = '5';
  change(ui, '185'); await ui.tick();
  assert.strictEqual(ui.window.__renders, 1, 'rebuilt from the corrected weight');
  assert.strictEqual(ui.window.__basis.get('strength|d1|2026-11-25|0|Bench Press'), 185);
  assert.strictEqual(ui.$('upNextReps').value, '5', 'the typed reps are kept');
  assert.strictEqual(ui.$('upNextWeight').value, '185', 'and the typed weight');
});

test('review fix: nothing re-renders for a lift with history but no ramp, one with a ramp already, one under way, or with the ramp off', async (assert)=>{
  for(const o of [{ramp: false}, {}, {ramp: false, rampFrom: 'none', logged: 1}, {ramp: false, rampFrom: 'none', pref: false}]){
    const u = mount(o);
    change(u, '100'); await u.tick();
    assert.strictEqual(u.window.__renders, 0, JSON.stringify(o));
  }
});


test('C+ caption (review fix): the real plate stack names the step and keeps the bar: "Warm-up 1 of 4 · 45 lb bar"; no caption, the bar alone', (assert)=>{
  const { window } = runJsdom('<div id="b"></div>', "var weightUnit = 'lb', equipmentProfile = null;",
    [...['BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES'].map(n => require('./testHelpers.js').extractConst(src, n)),
     ...['getEquipment', 'platesPerSide', 'plateCaption', 'barStackSvg', 'plateStackInner', 'escapeHtml'].map(n => extractFunction(src, n)),
     `const eq = getEquipment(); document.getElementById('b').innerHTML = plateStackInner(platesPerSide(45, eq), eq, 'Warm-up 1 of 4') + '<i></i>' + plateStackInner(platesPerSide(45, eq), eq);`]);
  const caps = [...window.document.querySelectorAll('.cover-bar-cap span:last-child')].map(x => x.textContent);
  assert.deepStrictEqual(caps, ['Warm-up 1 of 4 · 45 lb bar', '45 lb bar']);
});

run();
