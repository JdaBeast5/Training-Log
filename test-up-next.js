'use strict';
// v3.290 (Glass & glow): the "Up next" card — the next set to do, one tap to
// log it. It is a thin front end over the real set rows (the source of truth):
//  - the next set is the first main row with no reps yet, in on-screen order
//    (so supersets come out interleaved), skipping exercises ticked done;
//  - suggestions are that row's own numeric placeholders; failing that, the set
//    just logged for the same exercise is carried forward; failing that, the
//    reps tile shows the prescribed range as a ghost hint;
//  - "Log set" writes into the REAL row and fires the row's own change events,
//    weight/distance and RPE first and reps LAST, so saving, PRs, the rest
//    timer, the gym offer and auto-check run once, exactly as if typed there;
//  - the ring shows sets done / today's total; a rest day hides the card; a
//    finished session shows "Session complete".
// Driven for real against the real card markup; rows mirror renderWorkout's
// set-row template. Confirmed in Chromium on a seeded session: logging wrote
// 135 x 8 @ 7 into Barbell Row set 1, started the rest timer, survived a
// reload, and moved the card to set 2 with 135 / 8 / 7 carried forward.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-up-next.js');
const src = readIndexSource();
const FNS = ['findNextSetRow', 'numericPlaceholder', 'renderUpNext', 'logUpNext'].map(n => extractFunction(src, n));

// One row, shaped like renderWorkout's .set-row template.
function row(exIdx, setIdx, owner, {w = 'lb', r = 'reps', rpe = 'RPE', wv = '', rv = '', rpev = ''} = {}){
  return `<div class="set-row swipe-item" data-set-idx="${setIdx}" data-ex-idx="${exIdx}"><div class="swipe-content set-row-content">
    <span class="set-num">${setIdx + 1}</span><span class="set-row-owner">${owner}</span>
    <input class="ex-input ex-weight" placeholder="${w}" value="${wv}"><input class="ex-input ex-reps" placeholder="${r}" value="${rv}">
    <input class="ex-input ex-rpe" placeholder="${rpe}" value="${rpev}"></div></div>`;
}
function block(sets, rowsHtml, ticked = false){
  return `<div class="exercise-block"><input type="checkbox"${ticked ? ' checked' : ''}><div class="ex-sets"><span>${sets}</span><div class="ex-cal-tag">~50 cal</div></div>${rowsHtml}</div>`;
}
function mount(listHtml){
  const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="exerciseList">${listHtml}</div>`,
    'var weightUnit = "lb";', [...FNS, 'window.__render = renderUpNext; window.__log = logUpNext; window.__find = findNextSetRow;']);
  const $ = id => window.document.getElementById(id);
  return { window, $, render: () => window.__render(), log: () => window.__log() };
}
const BENCH_DONE = block('4×4-6', [0,1,2,3].map(i => row(0, i, 'Bench Press', {wv:'185', rv:'5'})).join(''));

test('REAL invocation: the card shows the first set without reps — label, lift, prescription (calorie tag excluded), ring', (assert)=>{
  const ui = mount(BENCH_DONE + block('4×6-8', [0,1,2,3].map(i => row(1, i, 'Barbell Row')).join('')));
  ui.render();
  assert.strictEqual(ui.$('upNext').hidden, false);
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Up next · set 1 of 4');
  assert.strictEqual(ui.$('upNextLift').textContent, 'Barbell Row');
  assert.strictEqual(ui.$('upNextTarget').textContent, '4×6-8 reps');
  assert.strictEqual(ui.$('upNextRingText').textContent, '4/8');
  assert.strictEqual(ui.$('upNextRingFill').getAttribute('stroke-dashoffset'), '50');
  // The ring is decoration to assistive tech; its meaning is spoken from hidden text.
  assert.strictEqual(ui.window.document.querySelector('.up-next-ring').getAttribute('aria-hidden'), 'true');
  assert.strictEqual(ui.$('upNextProgress').textContent, '4 of 8 sets done');
});

test('REAL invocation: suggestions — numeric placeholder first, else carry forward the set just logged, else empty with the rep range as a hint', (assert)=>{
  const ui = mount(block('4×6-8', [
    row(1, 0, 'Barbell Row', {wv:'135', rv:'8', rpev:'7'}),
    row(1, 1, 'Barbell Row'),
  ].join('')) + block('3×8-10', row(2, 0, 'Overhead Press', {w:'95', r:'10'})));
  ui.render();
  assert.strictEqual(ui.$('upNextWeight').value, '135', 'carried forward from set 1');
  assert.strictEqual(ui.$('upNextReps').value, '8');
  assert.strictEqual(ui.$('upNextRpe').value, '7');
  // Log set 2, then OHP's own numeric suggestion must win.
  ui.log();
  assert.strictEqual(ui.$('upNextLift').textContent, 'Overhead Press');
  assert.strictEqual(ui.$('upNextWeight').value, '95');
  assert.strictEqual(ui.$('upNextReps').value, '10');
  assert.strictEqual(ui.$('upNextRpe').value, '', 'no suggestion and no earlier set: empty');
  assert.strictEqual(ui.$('upNextRpe').placeholder, '', 'v3.292: an empty tile stays empty — no dash filler');
  const fresh = mount(block('4×6-8', row(1, 0, 'Barbell Row')));
  fresh.render();
  assert.strictEqual(fresh.$('upNextReps').value, '');
  assert.strictEqual(fresh.$('upNextReps').placeholder, '6-8', 'the prescription guides an empty reps tile');
});

test('REAL invocation: Log set writes into the REAL row and fires its change events with reps LAST (one rest-timer start)', (assert)=>{
  const ui = mount(block('4×6-8', [0,1].map(i => row(1, i, 'Barbell Row')).join('')));
  ui.render();
  const target = ui.window.document.querySelector('.set-row[data-set-idx="0"]');
  const order = [];
  for(const f of ['weight', 'reps', 'rpe']) target.querySelector('.ex-' + f).addEventListener('change', e => order.push(f + ':' + e.target.value));
  ui.$('upNextWeight').value = '135'; ui.$('upNextReps').value = '8'; ui.$('upNextRpe').value = '7';
  assert.strictEqual(ui.log(), true);
  assert.deepStrictEqual(order, ['weight:135', 'rpe:7', 'reps:8']);
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Up next · set 2 of 2', 'the card moved on');
});

test('GUARD: with reps empty, Log set writes nothing and puts the cursor in reps', (assert)=>{
  const ui = mount(block('4×6-8', row(1, 0, 'Barbell Row')));
  ui.render();
  ui.$('upNextWeight').value = '135'; ui.$('upNextReps').value = '';
  assert.strictEqual(ui.log(), false);
  assert.strictEqual(ui.window.document.querySelector('.set-row .ex-weight').value, '', 'nothing written to the real row');
  assert.strictEqual(ui.window.document.activeElement, ui.$('upNextReps'));
});

test('REAL invocation: exercises ticked done are skipped; superset rows are taken in on-screen (performing) order', (assert)=>{
  const superset = block('3×10-12', [row(4, 0, 'DB Curl'), row(5, 0, 'Triceps Pushdown'), row(4, 1, 'DB Curl')].join(''));
  const ui = mount(block('4×6-8', row(1, 0, 'Barbell Row'), true) + superset);
  ui.render();
  assert.strictEqual(ui.$('upNextLift').textContent, 'DB Curl', 'the ticked Barbell Row is skipped');
  ui.$('upNextReps').value = '12'; ui.log();
  assert.strictEqual(ui.$('upNextLift').textContent, 'Triceps Pushdown', 'then the paired exercise, as performed');
});

test('REAL invocation: a finished session says so; a rest day (no rows) hides the card', (assert)=>{
  const ui = mount(BENCH_DONE);
  ui.render();
  assert.strictEqual(ui.$('upNextLabel').textContent, 'Session complete');
  assert.strictEqual(ui.$('upNextLift').textContent, 'All 4 sets logged');
  assert.ok(ui.$('upNext').classList.contains('is-done'));
  const rest = mount('');
  rest.render();
  assert.strictEqual(rest.$('upNext').hidden, true);
});

test('REAL source, comments stripped: renderWorkout refreshes the card exactly once, after the rows exist', (assert)=>{
  const fn = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((fn.match(/\brenderUpNext\(\)/g) || []).length, 1);
  assert.ok(fn.indexOf('renderUpNext()') > fn.indexOf("getElementById('exerciseList')"), 'after the list is built');
});

// v3.292 (Impeccable distill): the input wells lose their hairline (the panel
// already draws the edge) and the fields→button gap tightens so the inputs and
// Log set read as one group, set apart from the heading above.
test('REAL CSSOM (v3.292): borderless wells; tight fields→button gap, wider heading→fields gap', (assert)=>{
  const fs = require('fs'), path = require('path'), { JSDOM } = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { document } = new JSDOM(`<style>${css}</style>`).window;
  const rules = []; const walk = l => { for(const r of l){ if(r.type === 1) rules.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const sh of document.styleSheets) walk(sh.cssRules);
  const one = sel => { const f = rules.filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length}`); return f[0].style; };
  assert.match(one('.up-next-field').getPropertyValue('border'), /transparent/, 'no visible hairline on the wells');
  const gapAbove = parseFloat(one('.up-next-fields').getPropertyValue('margin-top'));
  const gapBelow = parseFloat(one('.up-next-go').getPropertyValue('margin-top'));
  assert.ok(gapBelow < gapAbove, `fields→button (${gapBelow}px) must be tighter than heading→fields (${gapAbove}px)`);
});

run();
