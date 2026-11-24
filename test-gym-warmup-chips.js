'use strict';
// v3.392 (owner: "review how the warm up ramp looks and works in the gym mode
// screen ... so there's no jumping around between bottom of the screen then
// top then next"). In gym mode the loggable warm-up ramp is a row of orange
// chips ABOVE the working-set chips, in the order the steps are done, instead
// of field rows below "Same as Last Time". Gym mode only (owner's choice).
//  - tapping a chip ticks the real row's checkbox (its change handler saves);
//    tapping again unticks it;
//  - Edit shows the real rows (to change a weight); Done hides them again;
//  - Skip hides the WHOLE ramp for today (owner: skip the ramp, not steps),
//    through the warmupsSkipped list a swipe already writes; with everything
//    hidden the row reads "Warm-up skipped" with Restore.
// Confirmed in Chromium on the seeded page (Bench Press, ramp 45×8 … 150×2):
// chips above the working chips; a tap saved {weight:45, reps:8, done:true};
// Skip then Restore round-tripped with warmupsSkipped cleared; outside gym
// mode the chips are display:none.
//
// v3.653 (UX-17b): Gym mode is gone; Today's open exercise is where the chips live.
//
// v3.652 (UX-17a, owner 2026-11-24: Gym mode goes, Today does its job): the
// chips move to Today. An open exercise shows them in the ink; Edit shows the
// rows. Marking a step done offers Undo ("Logged warm-up 45×8"), from the
// chip's own handler, which the gym dock's Log button now reuses. Gym mode
// still exists in this version and keeps its orange chips.
// Sabotage: hide .warmup-chips on Today again and the computed-style test
// fails; drop the toast from the chip handler and the Undo test fails; give
// the dock its toast back and the dock test counts two.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-gym-warmup-chips.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'trimUnitNum', 'toDisplayWeight', 'warmupRepsValue', 'buildWarmupRampRowsHtml', 'renderWarmupChips',
  'showUndoToast' /* v3.652 (UX-17a): the real toast */].map(n => extractFunction(src, n));
const TOAST = extractElementById(src, 'undoToast');
const RAMP = [{idx:0, label:'Bar', short:'Bar', weight:45, reps:8}, {idx:1, label:'40%', short:'40%', weight:75, reps:5},
  {idx:2, label:'60%', short:'60%', weight:110, reps:3}, {idx:3, label:'80%', short:'80%', weight:150, reps:2}];

// The block as renderWorkout assembles it: header, chip strip, panel holding
// the real ramp strip (the real row markup, from buildWarmupRampRowsHtml).
function mount({ rows = true, restore = false, skipHook = true, saved = [] } = {}){
  const { window } = runJsdom(`<div id="exerciseList"><div class="exercise-block open"><div class="exercise"></div><div class="set-chips"></div>
    <div class="expand-wrap"><div><div class="sets-block"><div class="warmup-strip" id="strip"><div class="warmup-title">Suggested warm-up ramp</div>__ROWS__${restore ? '<button type="button" class="warmup-restore-btn">Restore</button>' : ''}</div></div></div></div></div></div>${TOAST}`,
  `var weightUnit = 'lb'; function getWeightUnit(){ return 'lb'; } var currentUnit = 'lb'; let undoToastTimeout = null;`,
  [...FNS, `
    const strip = document.getElementById('strip');
    strip.innerHTML = strip.innerHTML.replace('__ROWS__', ${rows} ? buildWarmupRampRowsHtml(${JSON.stringify(RAMP)}, ${JSON.stringify(saved)}) : '');
    window.__changes = [];
    strip.querySelectorAll('.warmup-done').forEach(cb => cb.addEventListener('change', () => window.__changes.push(cb.closest('.warmup-set-row').dataset.stepLabel + ':' + cb.checked)));
    if(${skipHook}) strip._skipAll = () => { window.__skipped = (window.__skipped || 0) + 1; };
    const r = strip.querySelector('.warmup-restore-btn'); if(r) r.addEventListener('click', () => { window.__restored = true; });
    window.__render = () => renderWarmupChips(document.querySelector('.exercise-block'));
    window.__render();`]);
  const doc = window.document;
  const chips = () => [...doc.querySelectorAll('.warmup-chips .set-chip')];
  return { window, doc, chips, block: doc.querySelector('.exercise-block') };
}

test('REAL invocation: the ramp is chips, in order, first step ready, placed BEFORE the working-set chips', (assert)=>{
  const ui = mount();
  assert.deepStrictEqual(ui.chips().map(c => c.textContent), ['45×8', '75×5', '110×3', '150×2']);
  assert.deepStrictEqual(ui.chips().map(c => c.classList.contains('is-ready')), [true, false, false, false]);
  const box = ui.doc.querySelector('.warmup-chips');
  assert.strictEqual(box.nextElementSibling, ui.doc.querySelector('.set-chips'), 'directly above the working sets');
  assert.strictEqual(box.parentElement, ui.block, 'outside the panel, like the set chips');
  assert.match(box.textContent, /Warm-up · not counted/);
  assert.match(ui.chips()[0].getAttribute('aria-label'), /^Warm-up Bar: 45 lb × 8, tap to mark done$/);
});

test('REAL invocation: a tap ticks the REAL row (its change handler fires) and moves "ready" on; a second tap undoes', (assert)=>{
  const ui = mount();
  ui.chips()[0].click();
  assert.deepStrictEqual([...ui.window.__changes], ['Bar:true']);
  assert.strictEqual(ui.doc.querySelector('.warmup-set-row[data-step-label="Bar"] .warmup-done').checked, true);
  assert.deepStrictEqual(ui.chips().map(c => c.className.split(' ').pop()), ['is-done', 'is-ready', 'is-pending', 'is-pending']);
  ui.chips()[0].click();
  assert.deepStrictEqual([...ui.window.__changes], ['Bar:true', 'Bar:false']);
  assert.ok(ui.chips()[0].classList.contains('is-ready'));
});

test('UX-17a criterion 1: marking the ready step done shows the real undo toast "Logged warm-up 45×8"; Undo unticks it through the same handler', async (assert)=>{
  const ui = mount();
  ui.chips()[0].click();
  const toast = ui.doc.getElementById('undoToast');
  assert.ok(toast.classList.contains('active'), 'the toast shows');
  assert.strictEqual(ui.doc.getElementById('undoToastText').textContent, 'Logged warm-up 45×8');
  assert.ok(ui.chips()[0].classList.contains('is-done'));
  ui.doc.getElementById('undoToastBtn').click();
  await new Promise(r => setTimeout(r, 0));
  assert.deepStrictEqual([...ui.window.__changes], ['Bar:true', 'Bar:false'], 'the real row was unticked');
  assert.ok(ui.chips()[0].classList.contains('is-ready'), 'the step is ready again');
  assert.ok(!toast.classList.contains('active'));
  // Unticking by hand offers no toast (there is nothing to undo into).
  ui.chips()[0].click(); // ticked again: a toast
  toast.classList.remove('active'); // as when it times out
  ui.chips()[0].click(); // unticked by hand
  assert.ok(!toast.classList.contains('active'), 'a second tap (untick) shows no toast');
});

// 2026-11-24 (v3.653, UX-17b): the UX-17a dock test ("the gym dock's real Log
// button reuses the chip's handler") retired with the dock. The chip's own
// Undo is covered above.

test('REAL invocation: saved progress shows on load (done steps struck through, the next one ready)', (assert)=>{
  const ui = mount({ saved: [{weight:45, reps:8, done:true}, {weight:80, reps:5, done:true}] });
  assert.deepStrictEqual(ui.chips().map(c => c.textContent), ['45×8', '80×5', '110×3', '150×2'], 'a step edited to 80 shows 80');
  assert.deepStrictEqual(ui.chips().map(c => c.className.split(' ').pop()), ['is-done', 'is-done', 'is-ready', 'is-pending']);
});

test('REAL invocation: Edit shows the rows (class on the block) and becomes Done; Skip calls the whole-ramp hook once', (assert)=>{
  const ui = mount();
  const edit = () => ui.doc.querySelector('.warmup-chips-edit');
  assert.strictEqual(edit().getAttribute('aria-expanded'), 'false');
  edit().click();
  assert.ok(ui.block.classList.contains('warmup-editing'));
  assert.strictEqual(edit().textContent, 'Done');
  edit().click();
  assert.ok(!ui.block.classList.contains('warmup-editing'));
  ui.doc.querySelector('.warmup-chips-skip').click();
  assert.strictEqual(ui.window.__skipped, 1);
});

test('REAL invocation: no Skip without the hook (a superset member\'s ramp); everything hidden offers Restore; no ramp, no row', (assert)=>{
  assert.strictEqual(mount({ skipHook:false }).doc.querySelector('.warmup-chips-skip'), null);
  const hidden = mount({ rows:false, restore:true });
  assert.match(hidden.doc.querySelector('.warmup-chips').textContent, /Warm-up skipped/);
  assert.strictEqual(hidden.chips().length, 0);
  hidden.doc.querySelector('.warmup-chips-restore').click();
  assert.strictEqual(hidden.window.__restored, true, 'through the real restore button');
  assert.strictEqual(mount({ rows:false }).doc.querySelector('.warmup-chips'), null);
});

test('REAL source: drawn with the set chips, once per block; Skip writes every step\'s label with an Undo snapshot', (assert)=>{
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const all = strip(extractFunction(src, 'renderAllSetChips'));
  assert.strictEqual((all.match(/\brenderWarmupChips\(b\)/g) || []).length, 1);
  assert.ok(all.indexOf('renderSetChips(b, glow)') < all.indexOf('renderWarmupChips(b)'), 'after the set chips exist');
  const wire = strip(extractFunction(src, 'wireSetsBlock'));
  assert.strictEqual((wire.match(/warmupStrip\._skipAll = async/g) || []).length, 1);
  assert.match(wire, /saveExWarmupSkipped\(activeDay, slot, already\.concat\(labels\), subVariant, ex\.name\)/); // v3.535 (BL-51): the name stamp rides along; v3.561 (BL-72): the stable slot
  assert.match(wire, /showUndoToast\('Warm-up skipped'/);
});

const CSS = [...fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

// 2026-11-24 (v3.654, UX-17c): its gym-mode rules are gone with Gym mode's CSS.
test('REAL CSSOM: an open exercise on Today shows the chips (v3.652); chips are at least 44px', (assert)=>{
  assert.strictEqual(declared('.warmup-chips', 'display'), 'none');
  assert.strictEqual(declared(':root body #exerciseList .exercise-block.open > .warmup-chips', 'display'), 'block');
  assert.ok(parseInt(declared(':root body #exerciseList .warmup-chips .set-chip', 'min-height'), 10) >= 44);
  assert.ok(parseInt(declared('.warmup-chips .set-chip', 'min-height'), 10) >= 44);
  assert.ok(parseInt(declared('.warmup-chips-head .link-btn', 'min-height'), 10) >= 44);
});

// v3.394: "Same as Last Time" is a quiet link in gym mode. Checked on the
// COMPUTED style of the real button inside .set-actions in body.gym-mode, so a
// later or more specific rule overriding it would fail this.
// 2026-11-24 (v3.654, UX-17c): retired with Gym mode's CSS. Gym mode's Same as Last Time link style is gone.

test('REAL computed style (v3.401, v3.652): the ramp\'s rows stay hidden on Today unless editing', (assert)=>{
  const at = (bodyClass, blockClass = 'exercise-block open') => {
    const { window } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style><body class="${bodyClass}"><div id="exerciseList"><div class="${blockClass}">
      <div class="sets-block"><div class="warmup-strip" id="s">rows</div><div class="warmup-box" id="b">Warm up first</div></div></div></div></body>`);
    const d = id => window.getComputedStyle(window.document.getElementById(id)).display;
    return { strip: d('s'), box: d('b') };
  };
  assert.deepStrictEqual(at(''), { strip: 'none', box: 'none' }, 'regular Today list');
  assert.notStrictEqual(at('', 'exercise-block open warmup-editing').strip, 'none', 'v3.652: Edit shows the rows on Today too');
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
});

// v3.652 (UX-17a criterion 1): the chips' computed display on Today, on the
// real stylesheet: shown in an open exercise, hidden in a closed one.
test('UX-17a criterion 1 (REAL computed style): outside gym mode an open exercise shows its warm-up chips, in the ink; a closed one doesn\'t', (assert)=>{
  const at = (bodyClass, blockClass) => {
    const { window } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style><body class="${bodyClass}"><div id="exerciseList"><div class="${blockClass}">
      <div class="warmup-chips" id="c"><div class="warmup-chips-head"><span class="warmup-chips-title" id="t">Warm-up · not counted</span></div>
      <div class="warmup-chips-row"><button class="set-chip warmup-chip is-done" id="d">45×8</button><button class="set-chip warmup-chip is-ready" id="r">75×5</button></div></div><div class="set-chips"></div></div></div></body>`);
    const cs = id => window.getComputedStyle(window.document.getElementById(id));
    return { display: cs('c').display, chipHeight: cs('r').minHeight, chipBg: cs('r').backgroundColor, doneBg: cs('d').backgroundColor, doneLine: cs('d').textDecoration };
  };
  const open = at('', 'exercise-block open');
  assert.strictEqual(open.display, 'block');
  assert.strictEqual(open.chipHeight, '44px', 'Today\'s chip size, not gym mode\'s 56 px');
  assert.ok(!/255, 122, 51/.test(open.chipBg), 'not gym mode\'s orange fill: ' + open.chipBg);
  // jsdom can't resolve the ink fill's var(), so the computed background can't
  // tell the two apart: the override is checked as declared on the real sheet.
  assert.strictEqual(declared(':root body #exerciseList .warmup-chips .set-chip.is-done', 'background'), 'none', 'a done step is not the logged set\'s ink fill');
  assert.strictEqual(declared(':root body #exerciseList .set-chip.is-done', 'background'), 'var(--text)', 'anchor: the logged set\'s fill it overrides');
  assert.match(open.doneLine, /line-through/, 'and is struck through (not counted)');
  assert.strictEqual(at('', 'exercise-block').display, 'none', 'a closed exercise');
});

run();
