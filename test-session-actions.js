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

// 2026-11-24 (v3.653, UX-17b): Gym mode is gone, so the actions row holds the
// session length alone (Today lays the row out as flex, start-aligned).
test('REAL markup: phase and length share one meta line; the session length has the actions row (Gym mode gone), above Up next', (assert)=>{
  const meta = $('mesocyclePhaseTag').parentElement;
  assert.ok(meta.classList.contains('duration-row'));
  assert.strictEqual($('dayDuration').parentElement, meta, 'length sits on the meta line');
  const actions = $('sessionLengthSelector').closest('.session-actions');
  assert.ok(actions, 'the select is in the actions row');
  assert.strictEqual(actions.children.length, 1, 'only the session length now');
  assert.ok(precedes(meta, $('sessionCalTotal')) && precedes($('sessionCalTotal'), actions), 'meta, calories, actions');
  // 2026-11-17 (v3.593, UX-06a): Up next left the workout card for the top of
  // Today as its cover, so it now comes before the card and these controls.
  assert.ok(precedes($('upNext'), actions) && !$('upNext').closest('#workoutCard'), 'Up next (the cover) leads Today, ahead of the controls');
  assert.strictEqual(document.querySelectorAll('#gymEnterBtn, .gym-enter-btn').length, 0, 'v3.653: no Gym mode button');
});

// 2026-11-24 (v3.653, UX-17b): the select's matched partner (Gym mode) is gone;
// the select's own checks stay.
test('REAL CSSOM: the session length is a full touch target at 16px; the select shows a chevron', (assert)=>{
  const sel = rule('.session-length-select');
  assert.strictEqual(sel.getPropertyValue('min-height'), '44px', 'a full touch target');
  // Selects render at 16px whatever their rule says (global iOS zoom guard), so the button must say 16px.
  assert.ok(allRules().some(r => r.selectorText === 'input, select, textarea' && /^16px/.test(r.style.getPropertyValue('font-size'))), 'the zoom guard exists');
  assert.strictEqual(sel.getPropertyValue('background'), 'var(--glass-fill)');
  assert.ok($('sessionLengthSelector').nextElementSibling.classList.contains('session-length-chevron'));
  assert.strictEqual(rule('.session-length-chevron').getPropertyValue('pointer-events'), 'none', 'taps fall through to the select');
});

// 2026-11-24 (v3.654, UX-17c): retired with Gym mode's CSS. Gym mode's hide list is gone.

run();
