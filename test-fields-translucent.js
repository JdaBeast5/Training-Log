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
test('REAL CSSOM (v3.397): every entry field is filled with the translucent --row-fill, not opaque --surface2', (assert)=>{
  for(const sel of FIELDS) assert.strictEqual(declared(sel, 'background'), 'var(--row-fill)', sel);
  assert.match(html.match(/--row-fill:([^;]+);/)[1], /rgba\(var\(--surface-white-rgb\),\s*\.045\)/, 'anchor: the token is translucent');
});

test('REAL CSSOM (v3.397): a picker\'s option list stays solid (it is its own surface on some platforms)', (assert)=>{
  assert.strictEqual(declared('select option', 'background'), 'var(--surface2)');
});

run();
