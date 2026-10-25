'use strict';
// v3.301 (owner-chosen Option 3, with Option 2's logger): gym mode uses the
// set chips. Apple HIG (workouts): large numerals, minimal text, persistent
// controls, large targets.
//  - the open exercise's sets are big chips, two to a row; closed exercises
//    show none (one at a time); the cramped field rows are not shown — they
//    stay in the page as the source of truth;
//  - the dock gains a Log button that mirrors the glowing chip: "Log 135×8"
//    logs it in one tap (with Undo), "Log set" opens the sheet when there is
//    nothing to suggest, and it hides when nothing is left;
//  - the open exercise follows the next set, so the chips on screen are the
//    ones being logged — including past an exercise that is finished but not
//    ticked (ticking needs an RPE on every set; a one-tap log leaves it empty).
// Confirmed in Chromium (390x844, seeded): entering gym mode showed Barbell
// Row's chips at 167x76 with no field rows; three dock taps logged sets 2-4
// with "Logged Barbell Row 135×8"; the open card moved to Overhead Press and
// the dock read "Log set", which opened the sheet on Overhead Press · Set 1.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-gym-set-chips.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const DOCK_CLICK = (()=>{
  const start = src.indexOf("document.getElementById('gymLogBtn').addEventListener('click'");
  const end = src.indexOf('\n});', start);
  if(start === -1 || end === -1) throw new Error('dock Log listener not found');
  return src.slice(start, end + 4);
})();

function block(i, name, rows, open = false){
  return `<div class="exercise-block${open ? ' open' : ''}" data-b="${i}"><div class="exercise"><input type="checkbox" data-idx="${i}"><div class="ex-name">${name}</div></div>
    <div class="set-chips"></div><div class="sets-block">${rows}</div></div>`;
}
function row(i, s, reps = ''){ return `<div class="set-row" data-ex-idx="${i}" data-set-idx="${s}"><input class="ex-reps" value="${reps}"></div>`; }
function mount(listHtml, chipsHtml, {gym = true} = {}){
  const { window } = runJsdom(`<div id="exerciseList">${listHtml}</div>${extractElementById(src, 'gymDock')}`, `
    var gymModeActive = ${gym};
    window.__sheet = null;
    function setExerciseBlockOpen(b, open){ b.classList.toggle('open', open); }
    function openSetSheet(row, chip){ window.__sheet = {row, chip}; }
  `, [extractFunction(src, 'findNextSetRow'), extractFunction(src, 'refreshGymLogBtn'), DOCK_CLICK]);
  // Chips as renderSetChips leaves them (their own behaviour is test-set-chips.js's).
  for(const [i, html] of Object.entries(chipsHtml)) window.document.querySelector(`[data-b="${i}"] .set-chips`).innerHTML = html;
  window.refreshGymLogBtn();
  return window;
}

test('REAL invocation: the dock button mirrors the glowing chip and one tap logs it through that chip', (assert)=>{
  const w = mount(block(1, 'Barbell Row', row(1, 0, '8') + row(1, 1), true),
    {1: '<button class="set-chip is-done" data-ex-idx="1" data-set-idx="0"><span class="set-chip-val">135×8</span></button><button class="set-chip is-ready is-next" data-ex-idx="1" data-set-idx="1" aria-label="Barbell Row, set 2: 135×8, tap to log"><span class="set-chip-val">135×8</span></button>'});
  const btn = w.document.getElementById('gymLogBtn');
  assert.strictEqual(btn.hidden, false);
  assert.strictEqual(btn.textContent, 'Log 135×8');
  assert.strictEqual(btn.getAttribute('aria-label'), 'Barbell Row, set 2: 135×8, log it');
  let clicked = null;
  w.document.querySelector('.set-chip.is-next').addEventListener('click', e => clicked = e.target.closest('.set-chip').dataset.setIdx);
  btn.click();
  assert.strictEqual(clicked, '1', 'the same one-tap path as the chip (Undo included)');
});

test('REAL invocation: nothing to suggest → "Log set" opens the sheet on the next set; nothing left → the button hides', (assert)=>{
  const w = mount(block(2, 'Overhead Press', row(2, 0) + row(2, 1), true),
    {2: '<button class="set-chip is-ready" data-ex-idx="2" data-set-idx="0"><span class="set-chip-val">×8-10</span></button>'});
  const btn = w.document.getElementById('gymLogBtn');
  assert.strictEqual(btn.textContent, 'Log set');
  btn.click();
  assert.strictEqual(w.__sheet.row, w.document.querySelector('.set-row[data-set-idx="0"]'));
  const done = mount(block(2, 'Overhead Press', row(2, 0, '10'), true), {});
  assert.strictEqual(done.document.getElementById('gymLogBtn').hidden, true);
});

test('REAL invocation: in gym mode the open exercise follows the next set, one open at a time (an exercise finished but not ticked is passed); outside gym mode nothing moves', (assert)=>{
  const list = block(1, 'Barbell Row', row(1, 0, '8') + row(1, 1, '8'), true) + block(2, 'Overhead Press', row(2, 0));
  const w = mount(list, {});
  assert.deepStrictEqual([...w.document.querySelectorAll('.exercise-block.open')].map(b => b.dataset.b), ['2']);
  const off = mount(list, {}, {gym:false});
  assert.deepStrictEqual([...off.document.querySelectorAll('.exercise-block.open')].map(b => b.dataset.b), ['1'], 'normal mode leaves opening to you');
});

test('REAL CSSOM: gym mode shows the open exercise\'s chips as a big two-column grid, hides closed exercises\' chips and the field rows', (assert)=>{
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${css}</style><body class="gym-mode"><div id="exerciseList">
    <div class="exercise-block open" id="o"><div class="set-chips"><button class="set-chip">135×8</button></div><div class="sets-block"><div class="set-row">r</div></div></div>
    <div class="exercise-block" id="c"><div class="set-chips"><button class="set-chip">95×10</button></div></div></div></body>`);
  const cs = sel => window.getComputedStyle(window.document.querySelector(sel));
  assert.strictEqual(cs('#o > .set-chips').display, 'grid');
  assert.strictEqual(cs('#o > .set-chips').gridTemplateColumns, '1fr 1fr');
  assert.strictEqual(cs('#o .set-chip').minHeight, '76px', 'well past the 44px HIG floor');
  assert.strictEqual(cs('#o .set-chip').fontSize, '26px');
  assert.strictEqual(cs('#c > .set-chips').display, 'none');
  assert.strictEqual(cs('#o .set-row').display, 'none');
});

run();
