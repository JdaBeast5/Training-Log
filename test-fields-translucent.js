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

run();
