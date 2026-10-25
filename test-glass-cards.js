'use strict';
// Glass & glow (v3.286, owner-chosen concept A) — supersedes the v3.277 flat
// card (this file was test-flat-cards.js; git mv keeps its history).
//
// The contract:
//  - every .card is a frosted-glass panel: translucent --glass-fill, a light
//    --glass-hair border, a --glass-shine inner highlight and --glass-shadow;
//  - the light behind the glass (--aura) is painted ONCE, on a fixed,
//    non-interactive body::before (iOS Safari ignores background-attachment:
//    fixed, which is why the old body washes scrolled away on the phone);
//  - PERFORMANCE GUARD: no card, and nothing inside the scrolling views, uses
//    backdrop-filter. Blur on scrolling content repaints every frame on a phone
//    (the soft skill's own guardrail); real blur is for fixed chrome only;
//  - gym mode keeps its hand-tuned black ground (aura hidden there);
//  - cards still don't perform an entrance; list rows keep their arrival.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-glass-cards.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
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
const cards = () => [...document.querySelectorAll('.card')];
const VIEWS = ['todayView', 'logView', 'analysisView', 'historyView', 'careView', 'coachView', 'learnView'];

test('sabotage anchor: the real document holds cards in every main view', (assert)=>{
  for(const v of ['todayView', 'logView', 'analysisView', 'historyView']) assert.ok(document.querySelectorAll(`#${v} .card`).length > 0, v);
  assert.ok(cards().length >= 40, `found ${cards().length}`);
});

test('REAL CSSOM: base .card is a glass panel built from the glass tokens', (assert)=>{
  const c = only('.card');
  assert.strictEqual(c.getPropertyValue('background'), 'var(--glass-fill)');
  assert.match(c.getPropertyValue('border'), /var\(--glass-hair\)/);
  assert.strictEqual(c.getPropertyValue('border-radius'), 'var(--radius-card)');
  assert.match(c.getPropertyValue('box-shadow'), /var\(--glass-shine\).*var\(--glass-shadow\)/);
});

test('REAL :root: the glass tokens exist and are built from the shared rgb tokens (no literals)', (assert)=>{
  const root = only(':root');
  for(const t of ['--aura', '--glass-fill', '--glass-hair', '--glass-shine', '--glass-shadow', '--radius-card']){
    const v = root.getPropertyValue(t);
    assert.ok(v, `${t} must be defined`);
    assert.doesNotMatch(v, /rgba\(\d/, `${t} must not hold a literal rgba()`);
  }
});

test('REAL CSSOM: the aura is one fixed, non-interactive layer behind everything, hidden in gym mode', (assert)=>{
  const a = only('body::before');
  assert.strictEqual(a.getPropertyValue('position'), 'fixed');
  assert.strictEqual(a.getPropertyValue('pointer-events'), 'none');
  assert.strictEqual(a.getPropertyValue('z-index'), '-1');
  assert.strictEqual(a.getPropertyValue('background'), 'var(--aura)');
  assert.strictEqual(only('body.gym-mode::before').getPropertyValue('display'), 'none');
  assert.doesNotMatch(only('body').cssText, /background-attachment/, 'no background-attachment:fixed (iOS ignores it)');
});

test('PERFORMANCE GUARD: no rule that matches a card, or anything inside a scrolling view, uses backdrop-filter', (assert)=>{
  const inViews = VIEWS.map(id => document.getElementById(id)).filter(Boolean).flatMap(v => [...v.querySelectorAll('*')]);
  const els = new Set([...cards(), ...inViews]);
  // Fixed or sticky chrome inside a view (e.g. Analysis's sticky jump rail)
  // doesn't scroll with the content, so blur on it is allowed — same rule as
  // the soft skill: backdrop-blur only on fixed/sticky elements.
  const pinned = el => allStyleRules().some(r => /^(fixed|sticky)$/.test(r.style.getPropertyValue('position')) &&
    r.selectorText.split(',').some(sel => { try{ return el.matches(sel.trim().replace(/::?(before|after)\b/g, '')); }catch(e){ return false; } }));
  const offenders = [];
  for(const r of allStyleRules()){
    const bf = r.style.getPropertyValue('backdrop-filter') || r.style.getPropertyValue('-webkit-backdrop-filter');
    if(!bf || bf === 'none') continue;
    for(const sel of r.selectorText.split(',').map(x => x.trim())){
      let hit; try{ hit = [...els].find(e => e.matches(sel.replace(/::?(before|after)\b/g, ''))); }catch(e){ continue; }
      if(hit && !pinned(hit)) offenders.push(`${sel} -> ${hit.id || hit.className}`);
    }
  }
  assert.deepStrictEqual(offenders, []);
});

test('REAL CSSOM + markup: cards still don\'t perform an entrance; swipe rows keep their arrival animation', (assert)=>{
  const st = only('.card.card-stagger');
  assert.strictEqual(st.getPropertyValue('animation'), 'none');
  const row = document.createElement('div'); row.className = 'swipe-item card-stagger';
  assert.ok(!row.matches('.card.card-stagger'));
  assert.match(only('.card-stagger').getPropertyValue('animation'), /cardRise/);
});

run();
