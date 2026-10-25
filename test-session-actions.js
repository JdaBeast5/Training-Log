'use strict';
// v3.291 (Impeccable layout pass on the workout card): the space above "Up next"
// held four type treatments in ~70px (an 11px phase pill, an 11.5px mono length,
// a session-length select that rendered as a bare 16px grey word, a bold yellow
// calorie line) and Gym mode sat below Up next as a second full-width 50px pill
// competing with "Log set". Now:
//  - one meta line: the phase pill and the length, wrapping together;
//  - the calorie line tight under it;
//  - one actions row: session length and Gym mode as a MATCHED pair of glass
//    pills (same height, same size text, a chevron marking the select as a
//    menu), above Up next — the two ways to change how you run the session;
//  - gym mode hides the whole row, as it hid both controls before.
// Measured in Chromium at 390px: both pills 44px tall, 150px wide, 16px/600.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-session-actions.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
function allRules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
const rule = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length}`); return f[0].style; };
const $ = id => document.getElementById(id);
const precedes = (a, b) => !!(a.compareDocumentPosition(b) & 4);

test('REAL markup: phase and length share one meta line; length and Gym mode share one actions row, above Up next', (assert)=>{
  const meta = $('mesocyclePhaseTag').parentElement;
  assert.ok(meta.classList.contains('duration-row'));
  assert.strictEqual($('dayDuration').parentElement, meta, 'length sits on the meta line');
  const actions = $('gymEnterBtn').parentElement;
  assert.ok(actions.classList.contains('session-actions'));
  assert.strictEqual($('sessionLengthSelector').closest('.session-actions'), actions, 'the select is in the same row');
  assert.strictEqual(actions.children.length, 2, 'exactly the two controls');
  assert.ok(precedes(meta, $('sessionCalTotal')) && precedes($('sessionCalTotal'), actions), 'meta, calories, actions');
  assert.ok(precedes(actions, $('upNext')), 'the controls come before Up next');
  assert.strictEqual(document.querySelectorAll('#gymEnterBtn').length, 1, 'sabotage anchor: one Gym mode button, not a leftover copy');
});

test('REAL CSSOM: the pair is matched — same height, same type, both glass pills; the select shows a chevron', (assert)=>{
  const sel = rule('.session-length-select'), gym = rule('.gym-enter-btn');
  assert.strictEqual(rule('.session-actions').getPropertyValue('grid-template-columns'), '1fr 1fr');
  for(const p of ['min-height', 'font-weight', 'border-radius']) assert.strictEqual(sel.getPropertyValue(p), gym.getPropertyValue(p), p);
  assert.strictEqual(sel.getPropertyValue('min-height'), '44px', 'a full touch target');
  // Selects render at 16px whatever their rule says (global iOS zoom guard), so the button must say 16px.
  assert.ok(allRules().some(r => r.selectorText === 'input, select, textarea' && /^16px/.test(r.style.getPropertyValue('font-size'))), 'the zoom guard exists');
  assert.strictEqual(gym.getPropertyValue('font-size'), '16px');
  assert.strictEqual(sel.getPropertyValue('background'), 'var(--glass-fill)');
  assert.ok($('sessionLengthSelector').nextElementSibling.classList.contains('session-length-chevron'));
  assert.strictEqual(rule('.session-length-chevron').getPropertyValue('pointer-events'), 'none', 'taps fall through to the select');
});

test('REAL CSSOM: gym mode hides the actions row (and so the select) alongside the meta line', (assert)=>{
  const hide = allRules().find(r => /body\.gym-mode #workoutCard \.session-actions/.test(r.selectorText));
  assert.ok(hide, 'in the gym-mode hide list');
  assert.strictEqual(hide.style.getPropertyValue('display'), 'none');
  assert.match(hide.selectorText, /body\.gym-mode #workoutCard \.duration-row/, 'same rule as the meta line');
});

run();
