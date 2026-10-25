'use strict';
// v3.272 (tasteskill Today pilot): Today's resting cards follow the
// true-black-flat style — elevation by a lightness step alone, no border, no
// shadow (incl. the blue --lift bloom), no sheen line — and they no longer
// replay the card-rise entrance on every switch to the tab. Floating chrome
// keeps its glass (owner's call), and other views keep their look until the
// pilot is rolled out.
//
// jsdom's getComputedStyle mis-resolves a `border` shorthand against a more
// specific `border-color` longhand (probed: it reports the shorthand's colour
// for an element a real browser gives `transparent`), so this cannot assert on
// computed styles. Instead it proves the cascade structurally against the real
// stylesheet and real markup:
//   1. the scoped rules exist with the right declarations;
//   2. they match every real direct .card child of #todayView;
//   3. no OTHER rule that sets one of these properties on those cards has equal
//      or higher specificity (so nothing outranks the pilot rule);
//   4. base .card and its ::before are untouched, so other views are unchanged.
// The computed result was also confirmed in Chromium (shadow none, border
// transparent, ::before none, opacity 1 / no animation 60ms after a tab
// switch on Today; a Log card still carries its border and shadow).
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { extractElementById, readIndexSource, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-flat-surfaces.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const todayHtml = extractElementById(readIndexSource(), 'todayView');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style><body>${todayHtml}</body>`).window;

// Every style rule, flattened out of @media blocks, with its selector split
// into its comma-separated parts.
function allStyleRules(){
  const out = [];
  const walk = list => {
    for(const r of list){
      if(r.type === 1) out.push(r);
      else if(r.cssRules) walk(r.cssRules);
    }
  };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
function splitSelectors(sel){ return sel.split(',').map(s => s.trim()).filter(Boolean); }

// Specificity [ids, classes/attrs/pseudo-classes, types/pseudo-elements] for the
// simple selectors this stylesheet uses; :not()/:is() count their argument.
function specificity(sel){
  let s = sel.replace(/::?(before|after|placeholder|selection|first-line|first-letter)\b/g, m => ' __PE__ ');
  let a = 0, b = 0, c = 0;
  s = s.replace(/:(not|is)\(([^()]*)\)/g, (_, __, inner) => { const [x, y, z] = specificity(inner); a += x; b += y; c += z; return ' '; });
  a += (s.match(/#[\w-]+/g) || []).length;
  b += (s.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+(\([^)]*\))?/g) || []).length;
  c += (s.match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) || []).length + (s.match(/__PE__/g) || []).length;
  return [a, b, c];
}
function cmp(x, y){ for(let i = 0; i < 3; i++){ if(x[i] !== y[i]) return x[i] - y[i]; } return 0; }

const PILOT_PROPS = ['box-shadow', 'border', 'border-color', 'border-top-color', 'opacity', 'animation', 'animation-name', 'transform'];
const isPilot = sel => sel.startsWith('#todayView > .card');

function todayCards(){ return [...document.querySelectorAll('#todayView > .card')]; }

test('sabotage anchor: the real Today markup has the cards this pilot targets (workout card included) and the parser sees the pilot rules once each', (assert)=>{
  const ids = todayCards().map(c => c.id);
  assert.ok(ids.includes('workoutCard') && todayCards().length >= 8, `expected the workout card among >=8 Today cards, got ${todayCards().length}`);
  for(const sel of ['#todayView > .card', '#todayView > .card::before', '#todayView > .card.card-stagger']){
    assert.strictEqual(allStyleRules().filter(r => r.selectorText === sel).length, 1, `exactly one rule for "${sel}"`);
  }
});

test('REAL CSSOM: the scoped rules flatten Today\'s cards — no shadow, transparent border, no sheen, no entrance', (assert)=>{
  const rule = sel => allStyleRules().find(r => r.selectorText === sel).style;
  assert.strictEqual(rule('#todayView > .card').getPropertyValue('box-shadow'), 'none');
  assert.strictEqual(rule('#todayView > .card').getPropertyValue('border-color'), 'transparent');
  assert.strictEqual(rule('#todayView > .card::before').getPropertyValue('content'), 'none');
  const st = rule('#todayView > .card.card-stagger');
  assert.strictEqual(st.getPropertyValue('animation'), 'none');
  assert.strictEqual(st.getPropertyValue('opacity'), '1');
  assert.strictEqual(st.getPropertyValue('transform'), 'none');
});

test('REAL markup: the scoped selectors match every direct card of the real #todayView, the stagger one once the class switchView adds is present', (assert)=>{
  for(const card of todayCards()){
    assert.ok(card.matches('#todayView > .card'), `${card.id || card.className} must match the pilot rule`);
    card.classList.add('card-stagger');
    assert.ok(card.matches('#todayView > .card.card-stagger'), `${card.id || card.className} must match the stagger override`);
    card.classList.remove('card-stagger');
  }
});

test('GUARD: no other rule setting a shadow/border/opacity/animation/transform on a Today card outranks the pilot rules (gym mode, which hides these cards, excepted)', (assert)=>{
  const pilotSpec = specificity('#todayView > .card');
  const offenders = [];
  for(const r of allStyleRules()){
    const props = PILOT_PROPS.filter(p => r.style.getPropertyValue(p) !== '');
    if(!props.length) continue;
    for(const sel of splitSelectors(r.selectorText)){
      if(isPilot(sel) || /gym-mode/.test(sel)) continue;
      const plain = sel.replace(/::?(before|after)\b/g, '');
      let hits;
      try{ hits = todayCards().some(c => { c.classList.add('card-stagger'); const m = c.matches(plain); c.classList.remove('card-stagger'); return m; }); }
      catch(e){ continue; } // selector jsdom can't evaluate — not one of the simple card rules
      if(hits && cmp(specificity(sel), pilotSpec) >= 0) offenders.push(`${sel} {${props.join(',')}}`);
    }
  }
  assert.deepStrictEqual(offenders, [], 'these rules would outrank the pilot rule on a Today card');
});

test('GUARD: base .card and .card::before are untouched, so every other view keeps its border, shadow and sheen', (assert)=>{
  const base = allStyleRules().find(r => r.selectorText === '.card').style;
  assert.ok(/--elev-2/.test(base.getPropertyValue('box-shadow')), 'base .card must keep its --elev-2 shadow');
  assert.ok(base.getPropertyValue('border') !== '' || base.getPropertyValue('border-top-width') !== '', 'base .card must keep its border');
  const sheen = allStyleRules().find(r => r.selectorText === '.card::before').style;
  assert.notStrictEqual(sheen.getPropertyValue('content'), 'none');
});

run();
