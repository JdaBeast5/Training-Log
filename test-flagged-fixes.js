'use strict';
// Items flagged in earlier handoffs, fixed on the owner's request ("Fix both
// flagged items, the Olympic lift program and the left over symbols").
//
// v3.372 — Olympic Lifting, Front Squat (Clean Recovery Strength): the
// coaching insight read backwards ("if you can clean more than you can front
// squat, the pull's momentum is masking a strength gap"). The rule coaches
// use is the other way round: the front squat should clearly out-lift the
// clean, and when the two are close, standing up from the catch is the limiter.
// v3.373 — The food favourite star updated its look on tap but not
// aria-pressed or its "Add … to favourites" label, so VoiceOver kept reading
// the old state.
// v3.374 — The custom-food trash button drew its icon on ::after, which
// overrode .fi-star::after, the shared 44px hit area: a 13x14 tap target in
// Chromium (elementFromPoint), next to a 30x44 pencil. The icon is on ::before
// now, the same fix v3.350 made for the pencil.
const { readIndexSource, extractConst, extractFunction, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-flagged-fixes.js');

test('REAL content (v3.372): the oly Front Squat insight says the front squat should out-lift the clean', (assert)=>{
  const [points] = runSandbox([extractConst(src, 'OLY_TECHNIQUE_DETAILS')], `__capture.push(OLY_TECHNIQUE_DETAILS['Front Squat (Clean Recovery Strength)'].points);`);
  assert.strictEqual(points.length, 5, 'anchor: the real technique, five points');
  const insight = points.find(p => /^Coaching insight:/.test(p));
  assert.match(insight, /front squat should clearly out-lift your clean/);
  assert.match(insight, /standing up from the catch is what limits your clean/);
  assert.doesNotMatch(src, /masking a strength gap/, 'the backwards wording is gone everywhere');
});

test('REAL invocation (v3.373): tapping the favourite star flips aria-pressed and its label, both ways', async (assert)=>{
  const { window } = runJsdom('', '', [extractFunction(src, 'escapeHtml'), extractFunction(src, 'buildFoodItemBtn'), `
    let activeCat = 'Proteins';
    const favs = new Set();
    const isFavorited = n => favs.has(n);
    const toggleFavorite = async item => { favs.has(item.name) ? favs.delete(item.name) : favs.add(item.name); };
    const itemViolatesPreferences = () => null;
    const addFoodToLog = () => {}; const duplicateToCustomForm = () => {}; const removeFromCustomFoods = async () => {}; const renderFoodItems = () => {};
    document.body.append(buildFoodItemBtn({name:'Chicken Breast', cal:165, pro:31, fat:4, carb:0, category:'Proteins'}, false));
  `]);
  const star = window.document.querySelector('.fi-fav');
  assert.strictEqual(star.getAttribute('aria-pressed'), 'false', 'anchor: starts unsaved');
  star.click(); await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(star.getAttribute('aria-pressed'), 'true');
  assert.strictEqual(star.getAttribute('aria-label'), 'Remove Chicken Breast from favourites');
  star.click(); await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(star.getAttribute('aria-pressed'), 'false');
  assert.strictEqual(star.getAttribute('aria-label'), 'Add Chicken Breast to favourites');
});

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const CSS = [...fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL CSSOM (v3.374): the trash icon is on ::before, and nothing on .fi-delete::after shrinks the shared hit area', (assert)=>{
  assert.match(declared('.fi-delete::before', 'mask-image') || declared('.fi-delete::before', '-webkit-mask-image'), /data:image\/svg\+xml/);
  assert.strictEqual(declared('.fi-delete::before', 'width'), '14px');
  assert.strictEqual(declared('.fi-delete::after', 'width'), '', 'no rule of its own on ::after');
  assert.strictEqual(declared('.fi-star::after', 'height'), '44px', 'the shared hit area it now gets');
  assert.strictEqual(declared('.fi-delete', 'min-width'), '22px');
  assert.strictEqual(declared('.fi-delete', 'min-height'), '22px');
});

run();
