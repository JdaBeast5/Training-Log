'use strict';
// Resting cards are flat in every view. Piloted on Today in v3.272 (as
// test-today-flat-surfaces.js), promoted to base .card in v3.277: a card is a
// lightness step alone (--surface on --bg) — no visible border, no shadow, no
// blue --lift bloom, no sheen ::before — and a card no longer performs the
// rise switchView replays on every tab switch. List ROWS carrying .card-stagger
// (buildSwipeItem) keep their arrival animation: that is feedback, which the
// owner kept, along with the view crossfade and press feedback.
//
// jsdom's getComputedStyle mis-resolves `border` shorthand vs longhand, so this
// proves the cascade structurally against the real stylesheet and the real
// markup of the whole document, every view:
//   1. base .card carries the flat declarations and no ::before rule exists;
//   2. no other rule that sets shadow/border/opacity/animation on a real card
//      (any view) brings them back — gym mode excepted, it is its own surface;
//   3. the no-entrance override hits cards but not swipe rows.
// Computed result confirmed in Chromium on Today, Log, Analysis and History.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-flat-cards.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// The real document, scripts not run: every view's static cards are present.
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;

function allStyleRules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
function only(sel){
  const f = allStyleRules().filter(r => r.selectorText === sel);
  if(f.length !== 1) throw new Error(`expected exactly one "${sel}" rule, found ${f.length}`);
  return f[0].style;
}
function splitSelectors(sel){ return sel.split(',').map(s => s.trim()).filter(Boolean); }
const cards = () => [...document.querySelectorAll('.card')];

test('sabotage anchor: the real document holds cards in every main view', (assert)=>{
  for(const view of ['todayView', 'logView', 'analysisView', 'historyView']){
    assert.ok(document.querySelectorAll(`#${view} .card`).length > 0, `#${view} must contain cards`);
  }
  assert.ok(cards().length >= 40, `expected 40+ cards app-wide, found ${cards().length}`);
});

test('REAL CSSOM: base .card is a flat lightness step — transparent 1px border (no layout shift), no shadow, surface fill', (assert)=>{
  const c = only('.card');
  assert.strictEqual(c.getPropertyValue('box-shadow'), '');
  assert.match(c.getPropertyValue('border'), /1px solid transparent/);
  assert.strictEqual(c.getPropertyValue('background'), 'var(--surface)');
  assert.strictEqual(allStyleRules().filter(r => r.selectorText === '.card::before').length, 0, 'the sheen ::before rule is gone');
});

// Deliberate status marks, not ornament: a card that NEEDS attention may carry
// a hue on its edge (the skill's own "notice" pattern). Each entry is named.
const STATUS_EDGE_ALLOWED = new Set([
  '.care-disclaimer-card', // Care tab medical disclaimers: yellow edge = read this first
]);

test('GUARD: no other rule re-adds a shadow, visible border or ::before sheen to any real card in any view (gym mode and named status edges excepted)', (assert)=>{
  const PROPS = ['box-shadow', 'border', 'border-color', 'border-top', 'border-top-color'];
  const offenders = [];
  for(const r of allStyleRules()){
    const props = PROPS.filter(p => r.style.getPropertyValue(p) !== '');
    const isBefore = /::?before/.test(r.selectorText) && r.style.getPropertyValue('content') !== '' && r.style.getPropertyValue('content') !== 'none';
    if(!props.length && !isBefore) continue;
    for(const sel of splitSelectors(r.selectorText)){
      if(/gym-mode/.test(sel)) continue;
      if(STATUS_EDGE_ALLOWED.has(sel) && !r.style.getPropertyValue('box-shadow')) continue;
      const plain = sel.replace(/::?(before|after)\b/g, '');
      if(isBefore && !/::?before/.test(sel)) continue;
      let hit;
      try{ hit = cards().find(c => c.matches(plain)); }catch(e){ continue; }
      if(!hit) continue;
      // A rule that clears to none/transparent is fine; anything else is a regression.
      const vals = props.map(p => r.style.getPropertyValue(p)).join(' ');
      if(isBefore || !/^(none|\s|1px solid transparent|transparent)*$/.test(vals)) offenders.push(`${sel} {${props.join(',') || 'content'}} -> ${hit.id || hit.className}`);
    }
  }
  assert.deepStrictEqual(offenders, []);
});

test('REAL CSSOM + markup: the no-entrance override matches every card once switchView adds .card-stagger, and never a swipe row', (assert)=>{
  const st = only('.card.card-stagger');
  assert.strictEqual(st.getPropertyValue('animation'), 'none');
  assert.strictEqual(st.getPropertyValue('opacity'), '1');
  for(const c of cards()){
    c.classList.add('card-stagger');
    assert.ok(c.matches('.card.card-stagger'), `${c.id || c.className}`);
    c.classList.remove('card-stagger');
  }
  const row = document.createElement('div'); row.className = 'swipe-item card-stagger';
  assert.ok(!row.matches('.card.card-stagger'), 'a swipe row must keep its arrival animation');
  assert.match(only('.card-stagger').getPropertyValue('animation'), /cardRise/, 'the row animation itself is intact');
});

test('GUARD: the retired --lift token is neither defined nor referenced in real CSS (comments aside)', (assert)=>{
  const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /--lift\s*:/);
  assert.doesNotMatch(css, /var\(--lift\)/);
});

run();
