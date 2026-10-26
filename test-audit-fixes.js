'use strict';
// Fixes from the post-2.0 audit (owner: "use the skills one more time to
// confirm and make sure the app looks correct and see if there's any
// functionality that needs to be fixed or updated"). Impeccable `audit`, run
// live in Chromium at 390x844 over every tab, sheet and gym mode, plus the
// Apple HIG 44pt target floor. One increment per finding.
//
// v3.350 — Food-row pencil (duplicate & edit): its ::after draws the pencil
// glyph and overrode the shared 44px hit-area ::after, so its real tap area
// was ~14x14 (button box 4x4 at font-size:0). Measured with elementFromPoint
// in Chromium: 13x15 before, 30x45 after (the star beside it is 31x45).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-audit-fixes.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
// Real parsed rules (CSSOM), last declaration wins, like the cascade for equal specificity.
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL CSSOM (v3.350): the food-row pencil keeps its drawn glyph on ::after and gets its 44px hit area on ::before', (assert)=>{
  assert.strictEqual(declared('.fi-duplicate::after', 'width'), '14px', 'anchor: ::after is the 14px pencil glyph, so it cannot also be the hit area');
  assert.strictEqual(declared('.fi-duplicate::before', 'height'), '44px');
  assert.strictEqual(declared('.fi-duplicate::before', 'width'), 'calc(100% + 8px)', 'meets the star at the gap midpoint, no overlap');
  assert.strictEqual(declared('.fi-duplicate::before', 'position'), 'absolute');
  assert.strictEqual(declared('.fi-duplicate', 'min-width'), '22px');
  assert.strictEqual(declared('.fi-duplicate', 'min-height'), '22px');
});

run();
