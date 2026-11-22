'use strict';
// v3.593 (UX-06a): Today's cover. "Up next" leaves the workout card for the
// top of Today and becomes a full-bleed field in the day's ink: the day, the
// lift and "Set n of N", the prescription with BL-10's effort words, the next
// set as the cover numeral, one Log button, "adjust" (the weight, reps and RPE
// fields behind it, in place), the lift's set chips, a resting-region caution
// and the set-to-set note, with the week and phase line at the foot.
//
// Real invocation: the real cover markup (extractElementById), the real
// renderUpNext, logUpNext, fillSetLogger, readSetLogger, commitSet,
// renderAllSetChips/renderSetChips and the set-to-set recommendation, the
// real cover wiring statements, and the real chip click listener, over set
// rows shaped like renderWorkout's (as test-set-chips.js builds them). The
// CSS criteria read the real stylesheet through jsdom's CSSOM; the ink
// criteria resolve the real custom properties per ink and theme and compute
// WCAG contrast (the function test-design-tokens-v2.js uses).
//
// Sabotage: make logUpNext commit the exercise's FIRST row instead of the
// ready one and criterion 1 fails (it logs over a done set).
//
// Deliberate deviation from the spec's criterion 4, recorded: where the day's
// --on-spot fails 4.5:1 on its own field (dark red, light yellow and light
// green), the cover text takes the History blocks' contrast-checked
// --block-on-* ink. Criterion 4 below asserts that, and that every
// ink and theme passes contrast.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-cover.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');

const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
  'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'logSetChip', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep',
  'renderUpNext', 'syncStickyDayTitle', /* 2026-11-17 (v3.605, UX-24): renderUpNext writes the sticky header's set line */ 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'readSetLogger', 'logUpNext', 'setCoverAdjust',
  'targetRirLabel', 'getRepRangeTier', 'firstSetHint', 'rirLabelHtml'].map(n => extractFunction(src, n));
// 2026-11-17 (v3.596, UX-07): renderCoverNumeral also draws the loaded bar
// (test-plate-stack.js), so its real builder and the equipment it reads come along.
FNS.push(...['renderCoverBar', 'platesPerSide', 'plateCaption', 'barStackSvg', 'getEquipment'].map(n => extractFunction(src, n)),
  extractConst(src, 'BARBELL_STANDARDS'), extractConst(src, 'DUMBBELL_DEFAULTS'), extractConst(src, 'PLATE_INKS'), 'var equipmentProfile = null;');
FNS.push(extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractConst(src, 'RIR_TARGETS'), extractConst(src, 'RIR_SPEED_CATEGORIES'),
  extractConst(src, 'RIR_NO_LABEL_CATEGORIES'), extractConst(src, 'RIR_NO_LABEL_NAME'));

function statement(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  const end = src.indexOf('\n', i);
  // A one-line statement, or a block closed by "\n});".
  const line = src.slice(i, end);
  return /\);$/.test(line) ? line : src.slice(i, src.indexOf('\n});', i) + 4);
}
const WIRING = [
  "document.getElementById('upNextLog').addEventListener('click', logUpNext);",
  "document.getElementById('upNextAdjust').addEventListener('click',",
  "document.getElementById('upNextFields').addEventListener('input',",
  "document.getElementById('upNextChips').addEventListener('click',",
].map(statement);
const CHIP_CLICK = (()=>{
  const a = src.indexOf('// One delegated listener for every strip');
  const start = src.indexOf("document.addEventListener('click'", a);
  return src.slice(start, src.indexOf('\n});', start) + 4);
})();

// Rows shaped like renderWorkout's set rows; headers carry the real RIR label.
function row(exIdx, setIdx, owner, {wp = 'lb', rp = 'reps', wv = '', rv = '', noWeight = false} = {}){
  return `<div class="set-row" data-set-idx="${setIdx}" data-ex-idx="${exIdx}"><span class="set-row-owner">${owner}</span>
    ${noWeight ? '' : `<input class="ex-input ex-weight" placeholder="${wp}" value="${wv}">`}
    <input class="ex-input ex-reps" placeholder="${rp}" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
}
function block(i, name, sets, rows, {ticked = false, firstTime = false, caution = '', category = 'chest'} = {}){
  return `<div class="exercise-block"${firstTime ? ' data-first-time="1"' : ''}>
    <div class="exercise"><input type="checkbox" data-idx="${i}"${ticked ? ' checked' : ''}><div class="ex-name">${name}</div>
      <div class="ex-sets"><span>${sets}</span>__RIR_${i}__</div></div>
    <div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div>${caution}<div class="sets-block">${rows}</div></div></div></div>`;
}
const INFO = {
  'Bench Press': {category: 'chest'}, 'Incline DB Press': {category: 'chest'}, 'Pull-up': {category: 'back'},
  'DB Curl': {category: 'arms'},
};
function mount(listHtml, {exercises = []} = {}){
  const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="dayHeroEyebrow">Day 1</div><div id="dayTitle">Upper · Strength</div>
      <div id="mesocyclePhaseTag">Week 4 of 5 · Accumulation</div><div id="exerciseList">${listHtml}</div>`, `
    var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true;
    var exerciseInfo = ${JSON.stringify(INFO)};
    var COMPOUND_CATEGORIES = new Set(['chest', 'back', 'legs', 'shoulders']);
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
    function isBarbellExercise(n){ return /Bench|Squat/.test(n || ''); }
    function isDumbbellExercise(n){ return /DB/.test(n || ''); }
    var setChipLongPressAt = 0;
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
    function openSetSheet(row, chip){ window.__sheet = {row, chip}; }
    function refreshGymLogBtn(){}
  `, [...FNS, CHIP_CLICK, ...WIRING, `
    // The RIR label each header carries, from the real rirLabelHtml.
    window.__rir = (ex) => rirLabelHtml(ex, activeProgram, false);
    window.__commits = [];
    const __realCommit = commitSet;
    commitSet = function(row, values, force){ window.__commits.push({row, values: {...values}}); return __realCommit(row, values, force); };
    window.__render = () => { renderAllSetChips(); renderUpNext(); };`]);
  const doc = window.document;
  for(const ex of exercises){
    const slot = [...doc.querySelectorAll('.ex-sets')].find(s => s.innerHTML.includes(`__RIR_${ex.i}__`));
    slot.innerHTML = slot.innerHTML.replace(`__RIR_${ex.i}__`, window.__rir(ex));
  }
  doc.querySelectorAll('.ex-sets').forEach(s => { s.innerHTML = s.innerHTML.replace(/__RIR_\d+__/, ''); });
  window.__render();
  const $ = id => doc.getElementById(id);
  const readyChip = () => doc.querySelector('#exerciseList .set-chip.is-ready');
  return { window, doc, $, readyChip, render: () => window.__render() };
}
const done = (i, n, name, w, r) => row(i, n, name, {wv: w, rv: r});
const BENCH = block(0, 'Bench Press', '4×4-6', [done(0, 0, 'Bench Press', '185', '5'), done(0, 1, 'Bench Press', '185', '5'),
  row(0, 2, 'Bench Press'), row(0, 3, 'Bench Press')].join(''));

test('criterion 1: one click on #upNextLog calls commitSet exactly once, on the ready row, with the ready chip\'s values', (assert)=>{
  const ui = mount(BENCH, {exercises: [{i: 0, name: 'Bench Press', sets: '4×4-6'}]});
  const chip = ui.readyChip();
  assert.ok(chip && chip.dataset.setIdx === '2', 'anchor: set 3 is the ready chip');
  const want = {weight: chip._values.weight, reps: chip._values.reps};
  assert.ok(want.weight && want.reps, 'anchor: the ready chip has a set-to-set call to log');
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 1, 'one commit');
  const c = ui.window.__commits[0];
  assert.strictEqual(c.row.dataset.setIdx, '2', 'on the ready row, not a done one');
  assert.deepStrictEqual({weight: c.values.weight, reps: c.values.reps}, want);
  assert.strictEqual(c.row.querySelector('.ex-reps').value, String(want.reps), 'written into the real row');
  assert.match(ui.window.__toast, /^Logged Bench Press /, 'with the chips\' Undo');
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Set 4 of 4', 'the cover moved on');
});

test('criterion 2: the numeral is the ready set: weight and ×reps for a barbell and a dumbbell lift, reps alone for a bodyweight one', (assert)=>{
  const cases = [
    ['Bench Press', block(0, 'Bench Press', '4×4-6', [done(0, 0, 'Bench Press', '185', '5'), row(0, 1, 'Bench Press')].join(''))],
    ['Incline DB Press', block(1, 'Incline DB Press', '3×10-12', [done(1, 0, 'Incline DB Press', '60', '12'), row(1, 1, 'Incline DB Press')].join(''))],
    ['Pull-up', block(2, 'Pull-up', '3×6-10', [row(2, 0, 'Pull-up', {rv: '8', noWeight: true}), row(2, 1, 'Pull-up', {noWeight: true})].join(''))],
  ];
  for(const [name, list] of cases){
    const ui = mount(list);
    const v = ui.readyChip()._values;
    const [w, u, x] = ui.$('upNextNumeral').children;
    assert.strictEqual(ui.$('upNextLift').textContent, name);
    if(name === 'Pull-up'){
      assert.strictEqual(w.textContent, String(v.reps), name + ': the reps are the figure');
      assert.strictEqual(u.textContent, 'reps');
      assert.strictEqual(x.textContent, '', name + ': no weight, no ×');
    } else {
      assert.strictEqual(w.textContent, String(v.weight), name + ' weight');
      assert.strictEqual(x.textContent, '×' + v.reps, name + ' reps');
      assert.strictEqual(u.textContent, 'lb');
    }
  }
});

test('criterion 3: #upNextWeight, #upNextReps and #upNextRpe still exist, sit behind "adjust", and feed the logged values when edited', (assert)=>{
  const ui = mount(BENCH);
  const wrap = ui.$('upNextFieldsWrap');
  assert.ok(wrap.classList.contains('expand-wrap') && wrap.contains(ui.$('upNextWeight')) && wrap.contains(ui.$('upNextReps')) && wrap.contains(ui.$('upNextRpe')));
  assert.ok(!wrap.classList.contains('open'), 'closed until asked');
  ui.$('upNextAdjust').click();
  assert.ok(wrap.classList.contains('open'), 'adjust opens them in place');
  assert.strictEqual(ui.$('upNextAdjust').getAttribute('aria-expanded'), 'true');
  ui.$('upNextWeight').value = '190'; ui.$('upNextReps').value = '4'; ui.$('upNextRpe').value = '8.5';
  ui.$('upNextWeight').dispatchEvent(new ui.window.Event('input', {bubbles: true}));
  assert.strictEqual(ui.$('upNextNumeral').textContent, '190lb×4', 'the numeral follows the edit');
  ui.$('upNextLog').click();
  const r = ui.doc.querySelector('.set-row[data-set-idx="2"]');
  assert.deepStrictEqual(['weight', 'reps', 'rpe'].map(f => r.querySelector('.ex-' + f).value), ['190', '4', '8.5']);
  ui.$('upNextAdjust').click();
  assert.ok(!wrap.classList.contains('open'), 'and closes them again');
});

test('GUARD: with reps empty, Log writes nothing, opens the fields and puts the cursor in reps', (assert)=>{
  const ui = mount(block(0, 'Bench Press', '4×4-6', row(0, 0, 'Bench Press', {wp: '135'})));
  ui.$('upNextReps').value = '';
  ui.$('upNextLog').click();
  assert.strictEqual(ui.window.__commits.length, 0);
  assert.ok(ui.$('upNextFieldsWrap').classList.contains('open'));
  assert.strictEqual(ui.doc.activeElement, ui.$('upNextReps'));
});

test('the cover\'s chips are the lift\'s own: drawn from the real strip, not .set-chips (findNextSetRow and the sheet\'s twin lookup see only the real ones), and a tap is the real chip\'s tap', (assert)=>{
  const ui = mount(BENCH + block(1, 'DB Curl', '3×10-12', row(1, 0, 'DB Curl', {wp: '30'})));
  const chips = [...ui.$('upNextChips').querySelectorAll('.cover-chip')];
  assert.deepStrictEqual(chips.map(c => c.className.replace('cover-chip ', '')), ['is-done', 'is-done', 'is-ready', 'is-pending'], 'Bench only, in order');
  assert.strictEqual(ui.$('upNext').querySelectorAll('.set-chip, .set-row').length, 0, 'no real chip or row inside the cover');
  // The set sheet's twin lookup (closeSetSheet) finds the chip in the list.
  assert.ok(ui.doc.querySelector('.set-chip[data-ex-idx="0"][data-set-idx="0"]').closest('#exerciseList'));
  chips[2].click();
  assert.strictEqual(ui.window.__commits.length, 1, 'a ready cover chip logs, as the real one does');
  assert.strictEqual(ui.window.__commits[0].row.dataset.setIdx, '2');
  ui.$('upNextChips').querySelector('.cover-chip.is-done').click();
  assert.strictEqual(ui.window.__sheet.row.dataset.setIdx, '0', 'a done chip opens the sheet on its own set');
  assert.ok(ui.window.__sheet.chip.closest('#exerciseList'), 'with the real chip, so focus returns into the list');
});

test('the prescription line carries BL-10\'s effort words (iii); the day and the week/phase line come from the workout card', (assert)=>{
  const ui = mount(BENCH, {exercises: [{i: 0, name: 'Bench Press', sets: '4×4-6'}]});
  assert.strictEqual(ui.$('upNextTarget').textContent, '4×4-6 reps · ' + ui.window.targetRirLabel({name: 'Bench Press', sets: '4×4-6'}, 'strength').words);
  assert.match(ui.$('upNextTarget').textContent, /Stop \d/, 'the words form, not the "2–3 RIR" short label');
  assert.strictEqual(ui.$('upNextDay').textContent, 'Upper · Strength');
  // 2026-11-17 (v3.601, UX-20): the program line leads the cover: the program's label, then the week and phase.
  assert.strictEqual(ui.$('upNextWhere').textContent, 'Week 4 of 5 · Accumulation', 'no programs table in this fixture: the week and phase alone');
});

test('(i) a first-ever exercise shows BIZ-05\'s firstSetHint and the target reps, not an empty numeral', (assert)=>{
  const ui = mount(block(0, 'Bench Press', '4×4-6', [row(0, 0, 'Bench Press'), row(0, 1, 'Bench Press')].join(''), {firstTime: true}));
  assert.strictEqual(ui.$('upNextHint').hidden, false);
  assert.strictEqual(ui.$('upNextHint').textContent, ui.window.firstSetHint({name: 'Bench Press', sets: '4×4-6', noWeight: false}, 'strength'));
  assert.match(ui.$('upNextHint').textContent, /^First time: pick a weight where you’d stop/);
  const [w, u, x] = ui.$('upNextNumeral').children;
  assert.deepStrictEqual([w.textContent, u.textContent, x.textContent], ['4-6', 'reps', '']);
  // Once a set is in, the hint goes (as in the set sheet).
  const seen = mount(block(0, 'Bench Press', '4×4-6', [done(0, 0, 'Bench Press', '135', '5'), row(0, 1, 'Bench Press')].join(''), {firstTime: true}));
  assert.strictEqual(seen.$('upNextHint').hidden, true);
});

test('(ii) a resting region that flags the cover lift shows the caution and its substitute, as an icon and words', (assert)=>{
  const caution = `<div class="ex-caution"><svg></svg> You marked <button type="button" class="link-btn" data-care-area="Shoulder">Shoulder</button> as resting — consider skipping or lightening this one. Try <b>Floor Press</b> instead — less shoulder range. Clear it in Care when you're ready. <button type="button" class="ex-ai-tailor-btn">Tailor</button></div>`;
  const ui = mount(block(0, 'Bench Press', '4×4-6', row(0, 0, 'Bench Press', {wp: '135'}), {caution}));
  const el = ui.$('upNextCaution');
  assert.strictEqual(el.hidden, false);
  assert.ok(el.querySelector('svg'), 'an icon');
  assert.strictEqual(el.textContent, 'Resting Shoulder: go lighter or skip. Try Floor Press instead.');
  const relief = mount(block(0, 'Bench Press', '4×4-6', row(0, 0, 'Bench Press', {wp: '135'}), {caution: '<div class="ex-caution ex-caution-relief">relief move</div>'}));
  assert.strictEqual(relief.$('upNextCaution').hidden, true, 'a relief move is not a caution');
  const clear = mount(block(0, 'Bench Press', '4×4-6', row(0, 0, 'Bench Press', {wp: '135'})));
  assert.strictEqual(clear.$('upNextCaution').hidden, true);
});

// 2026-11-17 (v3.595, UX-06b): a rest day keeps the cover (its headline opens
// the day picker), as the spec's white/off field: is-rest, nothing to log.
test('a finished session says so and hides the numeral and Log; a rest day keeps the cover with nothing to log', (assert)=>{
  const ui = mount(block(0, 'Bench Press', '2×4-6', [done(0, 0, 'Bench Press', '185', '5'), done(0, 1, 'Bench Press', '185', '5')].join('')));
  assert.ok(ui.$('upNext').classList.contains('is-done'));
  assert.strictEqual(ui.$('upNextLift').textContent, 'Session complete');
  assert.strictEqual(ui.$('upNextTarget').textContent, 'All 2 sets logged');
  assert.strictEqual(ui.$('upNextChips').children.length, 0);
  const rest = mount('');
  assert.strictEqual(rest.$('upNext').hidden, false);
  assert.ok(rest.$('upNext').classList.contains('is-rest'));
  assert.strictEqual(rest.$('upNextLift').textContent, 'Rest day');
  assert.strictEqual(rest.$('upNextChips').children.length, 0);
  assert.strictEqual(rest.$('upNextDay').textContent, 'Upper · Strength', 'the headline is there to pick another day');
});

// ---- The stylesheet --------------------------------------------------------
// The CSS criteria run over a cover the real code has rendered (chips in every
// state, the hint, the caution and the note filled in), not the empty markup:
// rules like .cover-chip.is-ready only match once renderUpNext has run.
const RENDERED = (() => {
  const caution = '<div class="ex-caution"><svg></svg> You marked <button type="button" class="link-btn" data-care-area="Shoulder">Shoulder</button> as resting. Try <b>Floor Press</b> instead.</div>';
  const ui = mount(block(0, 'Bench Press', '4×4-6', [done(0, 0, 'Bench Press', '185', '5'), row(0, 1, 'Bench Press'), row(0, 2, 'Bench Press')].join(''), {firstTime: false, caution}),
    {exercises: [{i: 0, name: 'Bench Press', sets: '4×4-6'}]});
  ui.$('upNextHint').textContent = 'First time: pick a weight'; ui.$('upNextHint').hidden = false;
  const states = [...ui.$('upNextChips').children].map(c => c.className.replace('cover-chip ', ''));
  if(states.join() !== 'is-done,is-ready,is-pending') throw new Error('fixture: chips ' + states);
  if(ui.$('upNextCaution').hidden || ui.$('upNextWhy').hidden) throw new Error('fixture: caution and note shown');
  return ui.$('upNext').outerHTML;
})();
const { window: cssWin } = new JSDOM(`<!doctype html><html><head><style>${CSS}</style></head><body class="day-red">${RENDERED}</body></html>`);
function allRules(list = cssWin.document.styleSheets[0].cssRules, media = '', out = []){
  for(const r of list){
    if(r.selectorText && r.style) out.push({r, media});
    else if(r.cssRules) allRules(r.cssRules, (r.media && r.media.mediaText) || media, out);
  }
  return out;
}
const RULES = allRules();
const one = sel => { const f = RULES.filter(x => x.r.selectorText === sel && !x.media); if(f.length !== 1) throw new Error(sel + ': ' + f.length); return f[0].r.style; };

// Custom properties as the body sees them, for one ink and theme: the
// matching rules' declarations by specificity then source order, with :root
// inherited beneath, and var() resolved.
function specificityOne(sel){
  const s = sel.replace(/:not\(([^)]*)\)/g, ' $1');
  return [(s.match(/#/g) || []).length, (s.match(/\.|\[|:(?!:)/g) || []).length, (s.match(/(^|[\s>+~])[a-z]+/gi) || []).length];
}
// A grouped selector counts as its most specific part that matches `el`.
function specificity(selText, el){
  const cmp = (p, q) => (p[0] - q[0]) || (p[1] - q[1]) || (p[2] - q[2]);
  return selText.split(',').map(x => x.trim()).filter(x => { try{ return !el || el.matches(x); }catch(e){ return false; } })
    .map(specificityOne).sort(cmp).pop() || [0, 0, 0];
}
function tokens(ink, theme, extraClass){
  const { document } = new JSDOM('<!doctype html><html><body><section class="cover"></section></body></html>').window;
  document.body.className = 'day-' + ink + (extraClass ? ' ' + extraClass : '');
  const decl = (el) => {
    const out = {};
    RULES.map((x, order) => ({...x, order}))
      .filter(x => (!x.media || (theme === 'light' && /prefers-color-scheme:\s*light/.test(x.media) && !/contrast/.test(x.media))) && x.r.selectorText.split(',').some(sel => { try{ return el.matches(sel.trim()); }catch(e){ return false; } }))
      .sort((a, b) => { const p = specificity(a.r.selectorText, el), q = specificity(b.r.selectorText, el); return (p[0] - q[0]) || (p[1] - q[1]) || (p[2] - q[2]) || (a.order - b.order); })
      .forEach(x => { for(const p of x.r.style) if(p.startsWith('--')) out[p] = x.r.style.getPropertyValue(p).trim(); });
    return out;
  };
  // The cover's own declarations, then what it inherits from body, then :root.
  const chain = [decl(document.querySelector('.cover')), decl(document.body), decl(document.documentElement)];
  const raw = name => { const hit = chain.find(d => name in d); return hit ? hit[name] : undefined; };
  const resolve = (v, depth = 0) => {
    if(depth > 20) throw new Error('var cycle');
    return v.replace(/var\((--[a-z0-9-]+)(?:,\s*([^()]*))?\)/gi, (m, n, fb) => raw(n) != null ? resolve(raw(n), depth + 1) : (fb != null ? resolve(fb, depth + 1) : 'UNSET'));
  };
  return { raw, get: n => resolve(raw(n) || '') };
}
function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

test('criterion 4: the cover is var(--cover) with var(--on-cover) text; --cover is --spot for every ink except a yellow day at night, and --on-cover is --on-spot or the contrast-checked block ink', (assert)=>{
  const c = one('.cover');
  assert.match(c.getPropertyValue('background'), /^var\(--cover\b/);
  assert.match(c.getPropertyValue('color'), /^var\(--on-cover\b/);
  // 2026-11-17 (v3.600, UX-19): with the spot inks at their targets, red takes its own white on-ink (no override).
  const BLOCK = {dark: ['green'], light: ['yellow', 'green']};
  for(const theme of ['dark', 'light']) for(const ink of ['red', 'blue', 'yellow', 'green']){
    const t = tokens(ink, theme);
    const cover = t.get('--cover'), on = t.get('--on-cover'), fig = t.get('--cover-figure');
    if(theme === 'dark' && ink === 'yellow'){
      assert.strictEqual(cover, t.get('--deep-yellow'), 'night yellow: the deep ink');
    } else {
      assert.strictEqual(cover, t.get('--spot'), `${theme} ${ink}: the spot`);
    }
    if(!(theme === 'dark' && ink === 'yellow')){
      assert.strictEqual(on, BLOCK[theme].includes(ink) ? t.get('--block-on-' + ink) : t.get('--on-spot'), `${theme} ${ink}: on-cover`);
    }
    assert.ok(/^#[0-9A-F]{6}$/i.test(cover) && /^#[0-9A-F]{6}$/i.test(on), `${theme} ${ink}: resolved to colours (${cover} / ${on})`);
    assert.ok(contrast(on, cover) >= 4.5, `${theme} ${ink}: text ${on} on ${cover} is ${contrast(on, cover).toFixed(2)}:1`);
    assert.ok(contrast(fig, cover) >= 3, `${theme} ${ink}: numeral ${fig} on ${cover} is ${contrast(fig, cover).toFixed(2)}:1`);
    const act = t.get('--cover-action'), onAct = t.get('--on-cover-action');
    assert.ok(contrast(onAct, act) >= 4.5, `${theme} ${ink}: Log button text ${contrast(onAct, act).toFixed(2)}:1`);
  }
});

test('(v) a yellow day at night: deep ink, white text ≥ 4.5:1, the numeral in the yellow ≥ 3:1; in light mode the plain spot field', (assert)=>{
  const night = tokens('yellow', 'dark');
  assert.strictEqual(night.get('--cover'), '#6B5600');
  assert.strictEqual(night.get('--on-cover'), '#FFFFFF');
  assert.strictEqual(night.get('--cover-figure'), night.get('--spot-yellow'));
  assert.ok(contrast('#FFFFFF', '#6B5600') >= 4.5 && contrast(night.get('--cover-figure'), '#6B5600') >= 3);
  const day = tokens('yellow', 'light');
  assert.strictEqual(day.get('--cover'), day.get('--spot-yellow'), 'light: the spot field');
  // Sabotage anchor: the resolver really is theme-aware (the two differ).
  assert.notStrictEqual(night.get('--cover'), day.get('--cover'));
});

const STATE = /--positive|--negative|--warning|--plate-green|--plate-red|--plate-yellow/;
test('(iv) no state colour on the field: no rule matching the cover or anything in it sets a state colour', (assert)=>{
  const cover = cssWin.document.getElementById('upNext');
  const els = [cover, ...cover.querySelectorAll('*')];
  const bad = [];
  let checked = 0;
  for(const {r} of RULES){
    const props = ['color', 'background', 'background-color', 'border-color', 'border', 'fill', 'outline', 'outline-color'].filter(p => r.style.getPropertyValue(p));
    if(!props.length) continue;
    let hits = false;
    try{ hits = els.some(el => el.matches(r.selectorText)); }catch(e){}
    if(!hits) continue;
    checked++;
    for(const p of props) if(STATE.test(r.style.getPropertyValue(p))) bad.push(`${r.selectorText} { ${p}: ${r.style.getPropertyValue(p)} }`);
  }
  assert.ok(checked > 10, 'anchor: the walk saw the cover\'s rules (' + checked + ')');
  assert.deepStrictEqual(bad, []);
});

// The font size an element ends up with: the winning font-size declaration
// (importance, specificity, source order) on it or its nearest ancestor,
// with var(--meta-on-spot) read from the .cover rule. jsdom computes neither
// var() nor inheritance through it, so this is done here, on the real rules.
function fontSizeOf(el, stop){
  const metaOnSpot = one('.cover').getPropertyValue('--meta-on-spot').trim();
  for(let n = el; n; n = n.parentElement){
    const hits = RULES.map((x, order) => ({...x, order})).filter(x => !x.media && x.r.style.getPropertyValue('font-size') && (() => { try{ return n.matches(x.r.selectorText); }catch(e){ return false; } })());
    if(hits.length){
      hits.sort((a, b) => { const ia = a.r.style.getPropertyPriority('font-size') ? 1 : 0, ib = b.r.style.getPropertyPriority('font-size') ? 1 : 0;
        const p = specificity(a.r.selectorText, n), q = specificity(b.r.selectorText, n);
        return (ia - ib) || (p[0] - q[0]) || (p[1] - q[1]) || (p[2] - q[2]) || (a.order - b.order); });
      const v = hits[hits.length - 1].r.style.getPropertyValue('font-size').trim().replace('var(--meta-on-spot)', metaOnSpot);
      return {px: parseFloat(v), from: hits[hits.length - 1].r.selectorText};
    }
    if(n === stop) break;
  }
  return {px: 16, from: 'inherited body size'};
}
test('(vi) meta text on the field is at least 15 px: every element but the numeral and the day headline (real rules, var() and inheritance resolved)', (assert)=>{
  const cover = cssWin.document.getElementById('upNext');
  const small = [];
  let seen = 0;
  for(const el of cover.querySelectorAll('*')){
    if(el.closest('#upNextDay, #upNextNumeral, svg') || el.classList.contains('cover-sr')) continue;
    seen++;
    const f = fontSizeOf(el, cover);
    if(!(f.px >= 15)) small.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className : ''}: ${f.px}px from ${f.from}`);
  }
  assert.ok(seen > 15, 'anchor: the walk saw the cover (' + seen + ' elements)');
  assert.deepStrictEqual(small, []);
  assert.strictEqual(one('.cover').getPropertyValue('--meta-on-spot').trim(), '15px');
  // Sabotage anchor: the resolver does see a small size where one applies
  // (the shared logger's unit label, outside the cover).
  const { document } = new JSDOM('<div class="up-next ex-logger"><label class="up-next-field"><small>lb</small></label></div>').window;
  assert.strictEqual(fontSizeOf(document.querySelector('small'), null).px, 12);
  assert.ok(parseFloat(one('.cover-w').getPropertyValue('font-size')) >= 120, 'the numeral is display size');
});

test('(vii) 16 px or more between Log and adjust; the adjust button is a 56 px target', (assert)=>{
  const log = one('.cover-log');
  assert.strictEqual(log.getPropertyValue('display'), 'grid');
  assert.ok(parseFloat(log.getPropertyValue('gap')) >= 16, log.getPropertyValue('gap'));
  const btns = [...cssWin.document.querySelector('.cover-log').children].map(b => b.id);
  assert.deepStrictEqual(btns, ['upNextLog', 'upNextAdjust'], 'the two sit side by side in that grid');
  assert.strictEqual(one('.cover-adjust').getPropertyValue('width'), '56px');
});

test('placement: the cover leads Today, outside the workout card, and gym mode hides it', (assert)=>{
  const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  const view = document.getElementById('todayView');
  assert.strictEqual(view.firstElementChild, document.getElementById('upNext'));
  assert.strictEqual(document.getElementById('upNext').closest('#workoutCard'), null);
  assert.strictEqual(one('body.gym-mode .cover').getPropertyValue('display'), 'none');
});

// ---- v3.594 (owner request, 2026-11-17): Settings > Today cover > Quiet ----
// "in case all the red is too much for some people". Quiet puts the cover on
// the card surface with the normal text ink; the day's colour stays in the
// numeral and a stripe along the top.
test('v3.594 Quiet cover: the card surface and text ink; the numeral in the day colour at >= 3:1 and every text >= 4.5:1, every ink and theme', (assert)=>{
  const q = one('body.cover-quiet .cover');
  assert.match(q.getPropertyValue('box-shadow'), /var\(--spot\b/, 'the day colour as a stripe (inset: it takes no layout room)');
  for(const theme of ['dark', 'light']) for(const ink of ['red', 'blue', 'yellow', 'green']){
    const t = tokens(ink, theme, 'cover-quiet');
    const cover = t.get('--cover'), on = t.get('--on-cover'), fig = t.get('--cover-figure');
    assert.strictEqual(cover, t.get('--surface-1'), `${theme} ${ink}: the card surface, not the spot field`);
    // 2026-11-17 (v3.600, UX-19): light yellow (#F2C200, 1.6:1 on white) takes the deep yellow.
    assert.strictEqual(fig, theme === 'light' && ink === 'yellow' ? t.get('--deep-yellow') : t.get('--spot'), `${theme} ${ink}: the numeral keeps the day colour`);
    assert.ok(/^#[0-9A-F]{6}$/i.test(on) && /^#[0-9A-F]{6}$/i.test(fig), `${theme} ${ink}: resolved (${on}, ${fig})`);
    assert.ok(contrast(on, cover) >= 4.5, `${theme} ${ink}: text ${contrast(on, cover).toFixed(2)}:1`);
    assert.ok(contrast(fig, cover) >= 3, `${theme} ${ink}: numeral ${fig} on ${cover} ${contrast(fig, cover).toFixed(2)}:1`);
    const act = t.get('--cover-action'), onAct = t.get('--on-cover-action');
    assert.ok(contrast(onAct, act) >= 4.5, `${theme} ${ink}: Log ${contrast(onAct, act).toFixed(2)}:1`);
    // Sabotage anchor: without the class the same ink is the full field.
    assert.notStrictEqual(tokens(ink, theme).get('--cover'), cover, `${theme} ${ink}: the class is what changes it`);
  }
});

test('v3.594 Quiet cover: the real select, load, save and apply; the choice persists per profile and defaults to the day colour', async (assert)=>{
  const markup = new JSDOM(html).window.document.getElementById('prefCoverStyle').outerHTML;
  const wire = src.slice(src.indexOf("document.getElementById('coverStyleSelect').addEventListener('change'"), src.indexOf('\n', src.indexOf("document.getElementById('coverStyleSelect').addEventListener('change'")));
  const make = (stored) => runJsdom(markup, `
    window.__store = ${JSON.stringify(stored)};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };`,
    ['let coverStyle = \'colour\';', ...['applyCoverStyle', 'loadCoverStylePref', 'saveCoverStyle'].map(f => extractFunction(src, f)), wire,
     'window.__load = loadCoverStylePref;']).window;
  const fresh = make({});
  await fresh.__load();
  assert.ok(!fresh.document.body.classList.contains('cover-quiet'), 'default: the day colour');
  assert.strictEqual(fresh.document.getElementById('coverStyleSelect').value, 'colour');
  const sel = fresh.document.getElementById('coverStyleSelect');
  sel.value = 'quiet'; sel.dispatchEvent(new fresh.Event('change'));
  await new Promise(r => setTimeout(r, 0));
  assert.ok(fresh.document.body.classList.contains('cover-quiet'), 'choosing Quiet applies at once');
  assert.strictEqual(fresh.__store['cover-style'], 'quiet', 'and is saved');
  const back = make({'cover-style': 'quiet'});
  await back.__load();
  assert.ok(back.document.body.classList.contains('cover-quiet'), 'a saved Quiet is restored on load');
  assert.strictEqual(back.document.getElementById('coverStyleSelect').value, 'quiet');
  const odd = make({'cover-style': 'neon'});
  await odd.__load();
  assert.ok(!odd.document.body.classList.contains('cover-quiet'), 'anything else is the day colour');
});

test('v3.594 Quiet cover: the row sits in Settings under "During a workout", and boot loads it once (real source, comments stripped)', (assert)=>{
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((code.match(/move\('prefCoverStyle', 'settingsWorkoutSlot'\)/g) || []).length, 1, 'moved into the workout group');
  assert.strictEqual((code.match(/await loadCoverStylePref\(\)/g) || []).length, 1, 'loaded once at startup');
  const init = code.slice(code.indexOf('(async function init(){'));
  assert.ok(init.indexOf('await loadCoverStylePref()') > -1 && init.indexOf('await loadCoverStylePref()') < init.indexOf('renderWorkout('), 'before Today first renders');
  const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  const opts = [...document.querySelectorAll('#coverStyleSelect option')].map(o => o.value + ':' + o.textContent);
  assert.deepStrictEqual(opts, ['colour:Day colour', 'quiet:Quiet']);
  assert.ok(document.getElementById('settingsWorkoutSlot').closest('.settings-section').querySelector('.care-label').textContent.includes('During a workout'));
});

// ---- v3.600 (UX-19): the spot inks reach their targets ---------------------
test('UX-19 criterion 2: every ink, both themes: cover text ≥ 4.5:1 on the cover, the rest band\'s ink ≥ 4.5:1 on the spot; dark red is white on #D42F25', (assert)=>{
  for(const theme of ['dark', 'light']) for(const ink of ['red', 'blue', 'yellow', 'green']){
    const t = tokens(ink, theme);
    const cover = t.get('--cover'), on = t.get('--on-cover'), spot = t.get('--spot'), spotInk = t.get('--spot-ink');
    assert.ok(contrast(on, cover) >= 4.5, `${theme} ${ink}: ${on} on ${cover} ${contrast(on, cover).toFixed(2)}`);
    assert.ok(contrast(spotInk, spot) >= 4.5, `${theme} ${ink}: rest ink ${spotInk} on ${spot} ${contrast(spotInk, spot).toFixed(2)}`);
  }
  const red = tokens('red', 'dark');
  assert.deepStrictEqual([red.get('--cover'), red.get('--on-cover')], ['#D42F25', '#FFFFFF'], 'the approved mock-up');
});

test('UX-19 criterion 3: no rule for the cover or anything in it points --on-cover at --block-on-red', (assert)=>{
  const bad = RULES.filter(({r}) => /var\(--block-on-red\)/.test(r.style.getPropertyValue('--on-cover')));
  assert.deepStrictEqual(bad.map(({r}) => r.selectorText), []);
  assert.ok(RULES.some(({r}) => /var\(--block-on-green\)/.test(r.style.getPropertyValue('--on-cover'))), 'anchor: the walk does see the green override');
});

// ---- v3.603 (UX-22): one figure face, and a numeral that fits -------------
// Sabotage: drop the 4–5 character size class and criterion 2 fails on "182.5".
test('UX-22 criterion 1: Today\'s figures are Geist with tabular figures, not Geist Mono (chips, steppers, fields, Next time, the session length)', (assert)=>{
  const all = []; (function walk(l){ for(const r of l){ if(r.selectorText) all.push(r); else if(r.cssRules) walk(r.cssRules); } })(cssWin.document.styleSheets[0].cssRules);
  for(const sel of ['.set-chip', '.cover-step output', '.cover .up-next-field input', '.finish-next-load', '.duration-tag']){
    const r = all.filter(x => x.selectorText === sel && x.style.getPropertyValue('font-family'));
    assert.ok(r.length, sel + ' sets a family');
    for(const x of r){
      assert.ok(!/font-mono|Geist Mono/.test(x.style.getPropertyValue('font-family')), sel + ': ' + x.style.getPropertyValue('font-family'));
      assert.match(x.style.getPropertyValue('font-variant-numeric'), /tabular-nums/, sel + ' tabular');
    }
  }
});

test('UX-22 criteria 2–3: the real renderCoverNumeral sizes the weight by its length (95, 185: 150px; 182.5: 120px; 1102.5: 100px) and the numeral never wraps', (assert)=>{
  const ui = mount(BENCH);
  const want = {'95': '', '185': '', '182.5': 'is-m', '1102.5': 'is-s'};
  for(const [w, cls] of Object.entries(want)){
    ui.$('upNextWeight').value = w; ui.$('upNextReps').value = '6';
    ui.window.renderCoverNumeral(ui.$('upNext'));
    const el = ui.$('upNextNumeral');
    assert.deepStrictEqual(['is-m', 'is-s'].filter(c => el.classList.contains(c)), cls ? [cls] : [], w);
    const px = parseFloat(cssWin.getComputedStyle((() => { const n = cssWin.document.getElementById('upNextNumeral'); n.className = el.className; return n.querySelector('.cover-w'); })()).fontSize);
    assert.strictEqual(px, {'': 150, 'is-m': 120, 'is-s': 100}[cls], w + ' at ' + px + 'px');
  }
  const rule = RULES.find(({r}) => r.selectorText === '.cover-numeral');
  assert.strictEqual(rule.r.style.getPropertyValue('flex-wrap'), 'nowrap');
});

// ── v3.606 (UX-25): a rest day is one quiet field ──────────────────────────
// The real renderWorkout (its rest branch returns before anything else runs)
// and the real renderUpNext, over the real page markup (scripts stripped)
// under the real stylesheet. The calls before the rest branch that aren't
// about the cover are stubbed; the storage is a Map.
const PAGE_BODY = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;
async function mountDay(dayDef, {restDone = false} = {}){
  const { window } = runJsdom(`<style>${CSS}</style>` + PAGE_BODY, `
    var store = new Map(${JSON.stringify(restDone ? [['rest-log:2026-11-02:strength:d4', '{"done":true}']] : [])});
    window.storage = { get: async k => store.has(k) ? {value: store.get(k)} : null, set: async (k, v) => { store.set(k, v); } };
    window.__store = store;
    var activeDay = 'd4', activeProgram = 'strength', selectedLogDate = '2026-11-02', distanceUnit = 'km', weightUnit = 'lb';
    var exerciseDetailDay = 'd4', exerciseDetailPinned = true, exerciseDetailIdx = null;
    var dayDefs = { d4: ${JSON.stringify(dayDef)} };
    window.__activity = 0;
    function recordActivity(){ window.__activity++; return Promise.resolve(); } function renderStreak(){}
    function renderTodayInsights(){} function renderArchiveWeekVisibility(){} function renderDayInsight(){}
    function getDayPlateClass(){ return 'p-off'; } function applyDayInk(){ document.body.classList.add('day-off'); return 'off'; } function dayGlyphSvg(){ return ''; }
    function formatLogDateLabel(){ return 'Today'; }
    function renderCoverBar(){} function refreshGymLogBtn(){} function focusExerciseDetail(){}
  `, [...FNS, extractFunction(src, 'renderWorkout'), extractFunction(src, 'syncStickyDayTitle'),
    // A training day carries on past the rest branch into code this fixture
    // doesn't load; everything the rest branch sets happens before that.
    'window.__render = () => renderWorkout().catch(e => { window.__err = e; });', 'window.__done = window.__render();']);
  await window.__done;
  return { window, doc: window.document, $: id => window.document.getElementById(id), cs: el => window.getComputedStyle(el) };
}
const REST_DAY = {label: 'Day 4', sub: 'Full Rest', rest: true, plateNum: 'OFF', duration: 'Rest day', note: 'Walk, stretch, sleep. Let the week land.'};

test('UX-25 criterion 1: on a rest day the cover carries the day\'s note and #restDoneCheckbox (once in the document, inside #upNext); the list holds nothing', async (assert)=>{
  const ui = await mountDay(REST_DAY);
  assert.strictEqual(ui.$('upNextLift').textContent, 'Rest day', 'anchor: the cover says so');
  assert.strictEqual(ui.doc.querySelectorAll('#restDoneCheckbox').length, 1, 'exactly once');
  assert.ok(ui.$('restDoneCheckbox').closest('#upNext'), 'inside the cover');
  assert.strictEqual(ui.doc.querySelector('#upNext .rest-note').textContent, REST_DAY.note, 'the day\'s own note');
  assert.strictEqual(ui.$('upNextTarget').textContent, '', 'the generic "Training today instead?" line gives way to the note');
  assert.strictEqual(ui.$('exerciseList').innerHTML.trim(), '', 'nothing in the list');
  assert.strictEqual(ui.$('restDoneLabel').textContent, 'Mark today\'s rest day as done');
  const row = ui.doc.querySelector('#upNext .rest-done-row');
  assert.ok(parseFloat(ui.cs(row).minHeight) >= 56, 'a 56 pt toggle row');
  assert.strictEqual(ui.cs(row).color, ui.cs(ui.$('upNext')).color, 'in the cover\'s ink');
  const rowRule = [...ui.doc.styleSheets].flatMap(sh => [...sh.cssRules]).find(r => r.selectorText === '.cover .rest-done-row');
  assert.match(rowRule.style.getPropertyValue('border'), /^1\.5px solid( currentcolor)?$/i, 'its rule in that ink too (no colour = currentColor; jsdom drops the keyword)');
});

test('UX-25 criterion 2: checking it writes rest-log:<date>:<program>:<day> = {"done":true}, calls recordActivity once, and reads "Marked as done for today" (as at v3.599)', async (assert)=>{
  const ui = await mountDay(REST_DAY);
  const cb = ui.$('restDoneCheckbox');
  cb.click(); // checks it and fires change
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(ui.window.__store.get('rest-log:2026-11-02:strength:d4'), '{"done":true}');
  assert.strictEqual(ui.window.__activity, 1, 'recordActivity once');
  assert.strictEqual(ui.$('restDoneLabel').textContent, 'Marked as done for today');
  const again = await mountDay(REST_DAY, {restDone: true});
  assert.ok(again.$('restDoneCheckbox').checked, 'a done rest day comes back checked');
  assert.strictEqual(again.$('restDoneLabel').textContent, 'Marked as done for today');
});

test('UX-25 criterion 3: on a rest day Gym mode, the session length and Add custom exercise compute display:none; on a training day they don\'t, and the cover\'s rest slot is cleared', async (assert)=>{
  const rest = await mountDay(REST_DAY);
  rest.doc.body.classList.add('has-cover');
  for(const el of [rest.$('gymEnterBtn'), rest.$('sessionLengthSelector').closest('.session-length-wrap'), rest.$('addCustomExerciseBtn')])
    assert.strictEqual(rest.cs(el).display, 'none', (el.id || el.className) + ' on a rest day');
  // The same page, then a training day: the real renderWorkout clears the slot and the class.
  const train = rest;
  train.window.eval(`dayDefs.d4 = {label: 'Day 1', sub: 'Upper · Strength', duration: '~60 min', exercises: []};`);
  await train.window.__render();
  assert.ok(!train.$('workoutCard').classList.contains('is-rest-day'), 'a training day: no is-rest-day');
  assert.ok(train.$('coverRestDay').hidden && train.$('coverRestDay').innerHTML === '', 'the cover\'s rest slot is cleared');
  assert.strictEqual(train.doc.querySelectorAll('#restDoneCheckbox').length, 0, 'no rest checkbox on a training day');
  for(const el of [train.$('gymEnterBtn'), train.$('sessionLengthSelector').closest('.session-length-wrap'), train.$('addCustomExerciseBtn')])
    assert.notStrictEqual(train.cs(el).display, 'none', (el.id || el.className) + ' on a training day');
});

run();
