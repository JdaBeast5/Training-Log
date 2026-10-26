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
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-gym-warmup-chips.js');
const src = readIndexSource();
const FNS = ['escapeHtml', 'trimUnitNum', 'toDisplayWeight', 'warmupRepsValue', 'buildWarmupRampRowsHtml', 'renderWarmupChips'].map(n => extractFunction(src, n));
const RAMP = [{idx:0, label:'Bar', short:'Bar', weight:45, reps:8}, {idx:1, label:'40%', short:'40%', weight:75, reps:5},
  {idx:2, label:'60%', short:'60%', weight:110, reps:3}, {idx:3, label:'80%', short:'80%', weight:150, reps:2}];

// The block as renderWorkout assembles it: header, chip strip, panel holding
// the real ramp strip (the real row markup, from buildWarmupRampRowsHtml).
function mount({ rows = true, restore = false, skipHook = true, saved = [] } = {}){
  const { window } = runJsdom(`<div id="exerciseList"><div class="exercise-block open"><div class="exercise"></div><div class="set-chips"></div>
    <div class="expand-wrap"><div><div class="sets-block"><div class="warmup-strip" id="strip"><div class="warmup-title">Suggested warm-up ramp</div>__ROWS__${restore ? '<button type="button" class="warmup-restore-btn">Restore</button>' : ''}</div></div></div></div></div></div>`,
  `var weightUnit = 'lb'; function getWeightUnit(){ return 'lb'; } var currentUnit = 'lb';`,
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
  assert.match(wire, /saveExWarmupSkipped\(activeDay, exIdx, already\.concat\(labels\), subVariant\)/);
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

test('REAL CSSOM: gym mode only; the rows hide behind the chips unless editing; chips are at least 44px', (assert)=>{
  assert.strictEqual(declared('.warmup-chips', 'display'), 'none');
  assert.strictEqual(declared('body.gym-mode .exercise-block.open > .warmup-chips', 'display'), 'block');
  assert.strictEqual(declared('body.gym-mode .exercise-block:not(.warmup-editing) .warmup-strip', 'display'), 'none');
  assert.ok(parseInt(declared('.warmup-chips .set-chip', 'min-height'), 10) >= 44);
  assert.ok(parseInt(declared('.warmup-chips-head .link-btn', 'min-height'), 10) >= 44);
});

// v3.394: "Same as Last Time" is a quiet link in gym mode. Checked on the
// COMPUTED style of the real button inside .set-actions in body.gym-mode, so a
// later or more specific rule overriding it would fail this.
test('REAL computed style (v3.394): in gym mode Same as Last Time is a link (no fill, no border, 44px), outside it a button', (assert)=>{
  const at = gym => {
    const { window } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style><body class="${gym ? 'gym-mode' : ''}"><div class="set-actions"><button class="same-as-last-btn">↻ Same as Last Time</button></div></body>`);
    return window.getComputedStyle(window.document.querySelector('.same-as-last-btn'));
  };
  const g = at(true);
  assert.strictEqual(g.borderTopWidth, '0px');
  assert.match(g.backgroundColor + ' ' + g.backgroundImage, /transparent|rgba\(0, 0, 0, 0\)|none/);
  assert.strictEqual(g.minHeight, '44px');
  assert.strictEqual(g.width, 'auto');
  const n = at(false);
  assert.strictEqual(g.paddingTop, '0px');
  // Anchor on padding: jsdom cannot resolve the base rule's border shorthand
  // (it holds var()), so a border check here would test jsdom, not the app.
  assert.strictEqual(n.paddingTop, '7px', 'anchor: the normal Today button keeps its button padding');
  assert.notStrictEqual(n.minHeight, '44px');
});

// v3.401 (owner: "the warm up ramp is still in the regular work out, didn't
// we say to only keep the ramp in the gym mode?"). v3.392 changed how gym mode
// shows the ramp and left Today's list as it was; the owner meant the ramp
// belongs to gym mode only. Outside gym mode no ramp shows — loggable rows,
// read-only table or nudge. Checked on COMPUTED style of real markup.
test('REAL computed style (v3.401): no warm-up ramp on the regular list; gym mode still shows it (rows while editing)', (assert)=>{
  const at = (bodyClass, blockClass = 'exercise-block open') => {
    const { window } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style><body class="${bodyClass}"><div id="exerciseList"><div class="${blockClass}">
      <div class="sets-block"><div class="warmup-strip" id="s">rows</div><div class="warmup-box" id="b">Warm up first</div></div></div></div></body>`);
    const d = id => window.getComputedStyle(window.document.getElementById(id)).display;
    return { strip: d('s'), box: d('b') };
  };
  assert.deepStrictEqual(at(''), { strip: 'none', box: 'none' }, 'regular Today list');
  const gym = at('gym-mode');
  assert.strictEqual(gym.strip, 'none', 'gym mode: the rows sit behind the chips…');
  assert.notStrictEqual(gym.box, 'none', '…and a read-only ramp or nudge still shows');
  assert.notStrictEqual(at('gym-mode', 'exercise-block open warmup-editing').strip, 'none', '…and Edit brings the rows back');
});

run();
