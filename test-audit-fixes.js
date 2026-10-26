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
// v3.351 — The idle rest timer is opacity 0 / pointer-events:none but its
// nine buttons stayed in the accessibility tree (VoiceOver could reach
// invisible controls). It is now inert whenever it isn't .active, synced by a
// MutationObserver on its class so every show/hide path is covered.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, extractIIFE, runJsdom, makeRunner } = require('./testHelpers.js');

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

test('REAL markup + invocation (v3.351): the idle rest timer is inert, and follows .active both ways', async (assert)=>{
  const { window } = runJsdom(extractElementById(src, 'restTimer'), '', [extractIIFE(src, 'syncRestTimerInert'), 'syncRestTimerInert();']);
  const el = window.document.getElementById('restTimer');
  assert.ok(el.querySelectorAll('button').length >= 4, 'anchor: the real timer with its buttons');
  assert.ok(el.hasAttribute('inert'), 'idle on load: out of the accessibility tree and tab order');
  el.classList.add('active');
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(el.hasAttribute('inert'), false, 'running: reachable');
  el.classList.remove('active');
  await new Promise(r => setTimeout(r, 0));
  assert.ok(el.hasAttribute('inert'), 'closed or completed: inert again');
});

test('REAL source (v3.352): empty states no longer send you below to controls that are above', (assert)=>{
  const lines = [...src.matchAll(/empty-note">([^<]*)</g)].map(m => m[1]);
  assert.ok(lines.length > 20, 'anchor: the real empty states');
  const wrong = lines.filter(l => /tap an item below|add items below|actually take below/.test(l));
  assert.deepStrictEqual(wrong, []);
  for(const fixed of ['tap + on a food to add it', 'add an item, or tap', 'add what you actually take.']) assert.ok(lines.some(l => l.includes(fixed)), fixed);
  assert.ok(lines.some(l => /log how you\\?.re feeling above/.test(l)), 'the correct "above" in Care stays');
});

run();
