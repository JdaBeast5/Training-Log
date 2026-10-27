'use strict';
// Owner (Rest / Cardio screenshot): "Fix the spacing for the fields, also
// check all the tabs for any fields that are not yet translucent ... like the
// 'today' field in the log section by the calendar, also the field where
// things can be entered on multiple tabs".
//
// v3.396 — On a rest day "Mark today's rest day as done" is the last thing in
// the list, and "+ Add custom exercise" sat flush against it (0px; 14px above
// it). Training days get their gap from the exercise rows' own padding.
//
// The audit (Chromium, every VIEW_KEYS tab on the seeded page, every visible
// input/select/textarea/button with an opaque fill) is in HANDOFF-v59
// addendum 15; each group is its own increment below.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-fields-translucent.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const { window: cssWin } = new JSDOM(`<style>${CSS}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(/,(?![^(]*\))/).map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL CSSOM (v3.396): the rest-day row has the same 14px below it as above it', (assert)=>{
  assert.strictEqual(declared('.rest-done-row', 'margin-top'), '14px');
  assert.strictEqual(declared('.rest-done-row', 'margin-bottom'), '14px');
});

// v3.397 — Every entry field. The audit's input/select/textarea hits, by the
// rule that paints them. Asserted on the declared fill; the Chromium re-audit
// (every tab) found no opaque entry field left.
const FIELDS = ['.care-input', '.food-search-input', '.weight-input-row input', '.macro-input-row input', '.history-export-select',
  '.ex-input', '.set-note-input', '.gsearch-input', '.custom-form input[type=text]'];
// 2026-10-27 (v3.402): the fields moved on from --row-fill to the cards' glass
// (see the v3.402 test below); only the hidden set-row .ex-input keeps it.
test('REAL CSSOM (v3.397): every entry field is translucent, never opaque --surface2', (assert)=>{
  for(const sel of FIELDS) assert.match(declared(sel, 'background'), /^var\(--(row|glass)-fill\)$/, sel);
  assert.match(html.match(/--row-fill:([^;]+);/)[1], /rgba\(var\(--surface-white-rgb\),\s*\.045\)/, 'anchor: the token is translucent');
});

test('REAL CSSOM (v3.397): a picker\'s option list stays solid (it is its own surface on some platforms)', (assert)=>{
  assert.strictEqual(declared('select option', 'background'), 'var(--surface2)');
});

// v3.398 — The date bar ("‹ Today ›" on Today and Log, the owner's example)
// sits on the page like a card, so it takes the cards' glass; its arrows and
// the History calendar's take the row fill. Backdating keeps its yellow wash.
test('REAL CSSOM (v3.398): the date bar is glass, its arrows and the calendar arrows translucent; backdating still yellow', (assert)=>{
  assert.strictEqual(declared('.log-date-bar', 'background'), 'var(--glass-fill)');
  assert.strictEqual(declared('.log-date-nav', 'background'), 'var(--row-fill)');
  assert.strictEqual(declared('.calendar-nav-btn', 'background'), 'var(--row-fill)');
  assert.match(declared('.log-date-bar.backdating', 'background'), /plate-yellow-rgb/);
});

// v3.399 — The secondary buttons and chips inside cards: History / Edit /
// Same as Last Time, food categories, water buttons, Analysis jump chips,
// Learn's source rows and masterclass index, and the rest of that family. The
// Chromium re-audit afterwards found only the deliberate solids left: the
// active tab pill and the blue primaries (gym offer, active food category,
// banner primary). Floating layers (sheets, menus, lightbox) stay opaque.
const CONTROLS = ['.water-btn', '#researchSourcesList .program-basis-toggle', '#researchSourcesList .source-row-nested .program-basis-toggle',
  '.same-as-last-btn', '.ex-history-btn', '.ex-edit-btn', '.masterclass-link-btn', '.food-cat-btn', '.analysis-index-chip', '.masterclass-index-btn',
  '.reorder-arrows button', '.describe-similar-btn', '.qty-stepper', '.describe-save-btn', '.recipe-link-btn', '.equip-plate', '.set-note-btn',
  '.compare-cancel-btn', '.resting-chip', '.set-drop-btn', '.mesocycle-phase-tag', '.user-pick-btn', '#describeFoodVoiceSlot .voice-log-btn'];
// The FIRST rule for each selector (where the fill lives); later rules for the
// same selector are state or layout tweaks.
function firstDeclared(selector, prop){
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(/,(?![^(]*\))/).map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) return v;
    }
  }
  return '';
}
test('REAL CSSOM (v3.399): the secondary controls inside cards are translucent; the deliberate solids are not touched', (assert)=>{
  assert.strictEqual(CONTROLS.length, 23, 'anchor: the audited list');
  // 2026-10-27 (v3.403): these moved on to the cards' glass (test below).
  for(const sel of CONTROLS) assert.match(firstDeclared(sel, 'background'), /^var\(--(row|glass)-fill\)$/, sel);
  assert.doesNotMatch(declared('.food-cat-btn.active', 'background'), /row-fill/, 'the selected category stays blue');
  assert.doesNotMatch(declared('.ex-suggest', 'background') || 'var(--surface2)', /row-fill/, 'a floating menu stays opaque');
});

// v3.402 (owner: fields on Analysis/History/Care/Coach/Learn "not quite
// there"). Translucent, but they read as dark recessed slabs beside the
// frosted cards and buttons (a 4.5% fill plus a dark inset shadow). They now
// wear the cards' glass: --glass-fill, the --glass-hair edge, the --rim
// highlight. .program-select (Care's area picker, Training Style) was missed by
// the computed-colour audit because its gradient STARTED at opaque --surface2.
const GLASS_FIELDS = ['.care-input', '.food-search-input', '.weight-input-row input', '.macro-input-row input', '.history-export-select',
  '.set-note-input', '.gsearch-input', '.custom-form input[type=text]', '.program-select'];
test('REAL CSSOM (v3.402): fields and pickers wear the glass — fill, hairline, highlight; no dark inset; no opaque gradient', (assert)=>{
  for(const sel of GLASS_FIELDS){
    assert.strictEqual(declared(sel, 'background'), 'var(--glass-fill)', sel);
    assert.match(declared(sel, 'border'), /var\(--glass-hair\)/, sel + ' edge');
    if(sel !== '.program-select') assert.strictEqual(declared(sel, 'box-shadow'), 'var(--rim)', sel + ' highlight');
  }
  assert.strictEqual(declared('.ex-input', 'background'), 'var(--row-fill)', 'the set-row fields are unchanged');
  assert.strictEqual(declared('.program-select', 'box-shadow'), '', 'the picker keeps v3.283\'s no-shadow rule');
  assert.strictEqual(declared('.care-input:focus', 'box-shadow'), 'var(--rim), var(--focus-ring-glow)', 'focus keeps its ring, loses the dark inset');
  assert.doesNotMatch(CSS, /gradient\(160deg, var\(--surface2\)/, 'no gradient starts on the opaque surface any more');
});

// v3.403 — The same in-card buttons and chips, plus .settings-jump where it
// sits in a card (Analysis's "See the sessions these came from"; it was still
// opaque --surface2 — the earlier audit ran with that Analysis group closed),
// wear the cards' glass like the fields, with the glass hairline where their
// edge was the opaque --line. Inside the settings sheet .settings-jump stays a
// transparent row. No shadow is added (v3.283).
test('REAL CSSOM (v3.403): in-card buttons and chips wear the glass; settings rows stay transparent; no opaque --line edge left on them', (assert)=>{
  for(const sel of [...CONTROLS, '.settings-jump']){
    assert.strictEqual(firstDeclared(sel, 'background'), 'var(--glass-fill)', sel);
    assert.doesNotMatch(firstDeclared(sel, 'border'), /var\(--line\)/, sel + ' edge');
  }
  assert.strictEqual(declared('.settings-group .settings-jump', 'background'), 'transparent');
  assert.strictEqual(declared('.food-cat-btn.active', 'background') === 'var(--glass-fill)', false, 'the selected category stays blue');
});

run();
