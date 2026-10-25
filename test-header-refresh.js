'use strict';
// v3.278 (tasteskill rollout): the header every view shares.
//  - h1 at app-title size (24/700, was 32/800): an app screen is not a landing page.
//  - The eyebrow keeps its job (product scope: whose log, which goal) but is
//    sentence case as the person typed their name, text face, 12px, untracked
//    (was 10.5px tracked uppercase mono, with the name force-uppercased).
//  - The streak pill: flat pale tint (no gradient, no glow), a flame outline SVG
//    instead of 🔥, text face with tabular figures.
// Real CSSOM + real renderHeader / renderStreak invocations.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-header-refresh.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style>`).window;
function only(sel){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1 && r.selectorText === sel) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  if(out.length !== 1) throw new Error(`expected one "${sel}" rule, found ${out.length}`);
  return out[0].style;
}
const headerHtml = extractElementById(src, 'headerEyebrow'); // anchor: the real element exists
const EMOJI = /\p{Extended_Pictographic}/u;

test('REAL CSSOM: h1 is app-title size (24px, 700) and the eyebrow is sentence-case text face at 12px, untracked', (assert)=>{
  assert.ok(headerHtml.includes('headerEyebrow'));
  const h1 = only('h1');
  assert.strictEqual(h1.getPropertyValue('font-size'), '24px');
  assert.strictEqual(h1.getPropertyValue('font-weight'), '700');
  const eb = only('.eyebrow');
  assert.strictEqual(eb.getPropertyValue('text-transform'), '');
  assert.strictEqual(eb.getPropertyValue('letter-spacing'), '');
  assert.strictEqual(eb.getPropertyValue('font-family'), 'var(--font-sans)');
  assert.ok(parseFloat(eb.getPropertyValue('font-size')) >= 11);
});

test('REAL invocation: renderHeader shows the name as typed, not force-uppercased; falls back to the product name with no profile', (assert)=>{
  const { window } = runJsdom('<div id="headerEyebrow"></div><div id="headerSub"></div>',
    'var userProfile = {name:"Jordan", goal:"recomp", heightFt:5, heightIn:10, weight:180}; function fmtWeight(w){ return w + " lb"; }',
    [extractConst(src, 'GOAL_LABELS'), extractFunction(src, 'renderHeader'),
     'renderHeader(); window.__named = document.getElementById("headerEyebrow").textContent;',
     'userProfile = {}; renderHeader(); window.__empty = document.getElementById("headerEyebrow").textContent;']);
  assert.ok(window.__named.startsWith('Jordan · '), window.__named);
  assert.ok(/ program$/.test(window.__named), window.__named);
  assert.strictEqual(window.__empty, 'Training Log');
});

test('REAL invocation: renderStreak draws a flame outline (aria-hidden), no emoji, the count in its own span, then animates in place', async (assert)=>{
  const { window } = runJsdom('<div id="streakBadge" style="display:none"></div>',
    'var __n = 5; async function computeStreak(){ return __n; } window.__animated = []; function animateNumberTo(el, v){ window.__animated.push(v); el.textContent = String(v); } async function checkStreakMilestone(){}',
    [extractConst(src, 'STREAK_FLAME_SVG'), extractFunction(src, 'renderStreak'),
     'window.__first = renderStreak();']);
  await window.__first;
  const el = window.document.getElementById('streakBadge');
  assert.strictEqual(el.style.display, 'inline-flex');
  const svg = el.querySelector('svg.streak-flame');
  assert.ok(svg && svg.getAttribute('aria-hidden') === 'true');
  assert.ok(!EMOJI.test(el.textContent), el.textContent);
  assert.strictEqual(el.textContent.trim(), '5 days streak');
  window.__n = 6; await window.eval('renderStreak()');
  assert.deepStrictEqual(Array.from(window.__animated), [6], 'a second render animates the existing number instead of rebuilding');
  assert.strictEqual(el.querySelectorAll('svg.streak-flame').length, 1);
});

test('REAL CSSOM: the streak pill is a flat tint with a same-hue border, no gradient, no glow, tabular figures in the text face', (assert)=>{
  const b = only('.streak-badge');
  assert.ok(!/gradient/.test(b.getPropertyValue('background')), b.getPropertyValue('background'));
  assert.strictEqual(b.getPropertyValue('box-shadow'), '');
  assert.match(b.getPropertyValue('border'), /plate-yellow-rgb/);
  assert.strictEqual(b.getPropertyValue('font-family'), 'var(--font-sans)');
  assert.strictEqual(b.getPropertyValue('font-variant-numeric'), 'tabular-nums');
});

run();
