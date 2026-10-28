'use strict';
// v3.288 (Glass & glow): navigation moves from a sticky rail at the top to a
// floating glass tab bar at the bottom, in thumb reach. Contract:
//  - .nav-pills is fixed to the bottom safe area, a glass pill (blur is fine
//    here: it is fixed chrome), above page content and below sheets/FABs;
//  - it holds exactly the five destinations — Today, Log, Analysis, History,
//    More — and the selected one is the white pill;
//  - search moved to the header beside the cog (named, focusable);
//  - everything else that floats at the bottom (rest timer, undo toast, both
//    FABs, the gym-mode offer) and the page's own bottom padding clear the bar
//    through one shared offset, --above-bar, built from the bar's measured
//    height (--nav-rail-h, still published by wireNavRailHeight);
//  - gym mode still hides the bar.
// Measured in Chromium: all five tabs fit without scrolling at 375/390/430px
// (320px scrolls with the edge fade); the bar measures 53px; tapping a tab
// switches views; More still opens its sheet.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-tab-bar.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
function allRules(){
  const out = [];
  // 2026-10-28 (v3.477): the light appearance's token block is skipped — this
  // suite checks the dark design of record (test-light-mode.js covers light).
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules && !(r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText))) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
const rule = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length}`); return f[0].style; };

test('REAL CSSOM: the bar is fixed to the bottom safe area as a floating glass pill', (assert)=>{
  const b = rule('.nav-pills');
  assert.strictEqual(b.getPropertyValue('position'), 'fixed');
  assert.match(b.getPropertyValue('bottom'), /safe-area-inset-bottom/);
  assert.strictEqual(b.getPropertyValue('top'), 'auto');
  assert.strictEqual(b.getPropertyValue('border-radius'), 'var(--radius-pill)');
  assert.match(b.getPropertyValue('backdrop-filter') || b.getPropertyValue('-webkit-backdrop-filter'), /glass-blur/, 'fixed chrome may blur');
  assert.match(rule('.nav-pill.active').getPropertyValue('background'), /^(#fff|rgb\(255, 255, 255\))$/, 'the selected tab is the white pill');
});

test('REAL markup: the bar holds exactly the five destinations, Today first; search is in the header with a name', (assert)=>{
  const ids = [...document.querySelectorAll('.nav-pills-scroll > button')].map(b => b.id);
  assert.deepStrictEqual(ids, ['navToday', 'navLog', 'navAnalysis', 'navHistory', 'navMore']);
  const search = document.getElementById('globalSearchBtn');
  assert.ok(search.closest('header'), 'search lives in the header');
  assert.strictEqual(search.getAttribute('aria-label'), 'Search the app');
  assert.strictEqual(search.tagName, 'BUTTON');
});

test('REAL CSSOM: every bottom-floating element, and the page padding, clears the bar through the one shared --above-bar offset', (assert)=>{
  const root = rule(':root').getPropertyValue('--above-bar');
  assert.match(root, /var\(--nav-rail-h/, '--above-bar is built from the measured bar height');
  assert.match(root, /safe-area-inset-bottom/);
  for(const sel of ['.rest-timer', '.undo-toast', '.coach-fab', '.today-fab', '.gym-offer']){
    // The rule that positions it (a selector can also have media/state variants).
    const pos = allRules().filter(r => r.selectorText === sel && r.style.getPropertyValue('bottom'));
    assert.strictEqual(pos.length, 1, `${sel}: one positioning rule`);
    assert.match(pos[0].style.getPropertyValue('bottom'), /var\(--above-bar\)/, `${sel} must sit above the bar`);
  }
  assert.match(rule('body').getPropertyValue('padding-bottom'), /var\(--above-bar\)/, 'the last card must scroll clear of the bar');
});

test('REAL CSSOM: gym mode still hides the bar', (assert)=>{
  const hides = allRules().some(r => /body\.gym-mode \.nav-pills\b/.test(r.selectorText) && r.style.getPropertyValue('display') === 'none');
  assert.ok(hides);
});

run();
