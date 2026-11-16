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
const { makeRunner, readIndexSource, extractFunction, extractConst, extractElementById, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-tab-bar.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
function allRules(){
  const out = [];
  // 2026-10-28 (v3.477): the light appearance's token block is skipped — this
  // suite checks the dark design of record (test-light-mode.js covers light).
  // 2026-11-03 (v3.490): likewise the open-posture block, which widens
  // --wrap-max on an unfolded foldable (test-duo-open-posture-layout.js).
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules && !(r.media && /prefers-color-scheme:\s*light|min-width:\s*760px|viewport-segments/.test(r.media.mediaText))) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
const rule = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length}`); return f[0].style; };

// 2026-11-16 (v3.585, UX-04): the bar stops being a floating glass pill on
// purpose. It is an opaque Apple HIG tab bar: edge to edge at the bottom,
// --surface-1 with a 1px top rule, no blur, its padding covering the
// home-indicator area. The selected tab is ink with a filled icon, not a pill.
test('REAL CSSOM: the bar is an opaque, fixed bottom bar: --surface-1, a 1px top rule, no blur, padding over the home indicator', (assert)=>{
  const b = rule('.nav-pills');
  assert.strictEqual(b.getPropertyValue('position'), 'fixed');
  assert.strictEqual(b.getPropertyValue('top'), 'auto');
  assert.strictEqual(b.getPropertyValue('bottom'), '0px');
  assert.strictEqual(b.getPropertyValue('left'), '0px');
  assert.strictEqual(b.getPropertyValue('right'), '0px');
  assert.strictEqual(b.getPropertyValue('background'), 'var(--surface-1)');
  assert.strictEqual(b.getPropertyValue('border-top'), '1px solid var(--rule)');
  assert.strictEqual(b.getPropertyValue('backdrop-filter') + b.getPropertyValue('-webkit-backdrop-filter'), '', 'opaque: no blur');
  assert.match(b.getPropertyValue('padding-bottom'), /env\(safe-area-inset-bottom, 0px\)/, 'the bar covers the home indicator');
  const active = rule('.nav-pills-scroll > .nav-pill.active');
  assert.strictEqual(active.getPropertyValue('background'), 'transparent');
  assert.strictEqual(active.getPropertyValue('color'), 'var(--text)');
  assert.strictEqual(rule('.nav-pill[aria-current="page"] .tab-i .fillable').getPropertyValue('fill'), 'currentcolor');
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
  // 2026-11-16 (v3.585, UX-04): the bar sits on the bottom edge and its own
  // padding covers the home indicator, so its measured height already holds
  // the safe area; adding it again would leave a gap.
  assert.doesNotMatch(root, /safe-area-inset-bottom/);
  // 2026-11-16 (v3.586, UX-16): the coach button moved into the header, so it no longer floats over the bar.
  for(const sel of ['.rest-timer', '.undo-toast', '.today-fab', '.gym-offer']){
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

// ---- v3.585 (UX-04): the labels changed on purpose, Log to Food and Analysis
// to Progress; the IDs, their order and the showView wiring did not.
const src = readIndexSource();
const LABELS = {navToday: 'Today', navLog: 'Food', navAnalysis: 'Progress', navHistory: 'History', navMore: 'More'};
function drive(views){
  const keys = ['today', 'log', 'analysis', 'history', 'care', 'coach', 'learn'];
  const markup = '<h1 id="viewTitle">Today</h1><div id="stickyDayHeader"></div><div id="logDateBar"></div>' + extractElementById(src, 'navPillsScroll')
    + keys.map(k => `<div id="${k}View"><div class="card"></div></div>`).join('') + '<button id="navCare"></button><button id="navCoach"></button><button id="navLearn"></button>';
  const { window } = runJsdom(markup, `
    window.storage = { set(){}, get: async ()=>{ throw new Error('nf'); } };
    window.matchMedia = ()=>({ matches:true }); window.scrollTo = ()=>{};
    var STAGGER_MAX_STEPS = 6, STAGGER_STEP_MS = 40;
    function closeNavMoreOverlay(){} function hideGymOffer(){} function renderLogDateBar(){}
    Element.prototype.scrollIntoView = function(){};`,
    [extractConst(src, 'MOVED_TO_MORE'), extractFunction(src, 'clearViewEnter'), extractFunction(src, 'scrollAppToTop'), extractFunction(src, 'switchView'),
     'window.__seen = [];' + views.map(v => `try{ switchView('${v}'); }catch(e){ window.__err = e.message; }
       window.__seen.push({title: document.getElementById('viewTitle').textContent,
         current: [...document.querySelectorAll('#navPillsScroll > button[aria-current="page"]')].map(b => b.id)});`).join('\n')]);
  return window;
}

test('UX-04 criterion 2: each tab\'s accessible name is its new label, and only the active view\'s tab carries aria-current="page" (real switchView, all five)', (assert)=>{
  const names = Object.fromEntries([...document.querySelectorAll('#navPillsScroll > button')].map(b => [b.id, b.textContent.trim()]));
  assert.deepStrictEqual(names, LABELS);
  for(const b of document.querySelectorAll('#navPillsScroll > button')) assert.strictEqual(b.querySelector('svg').getAttribute('aria-hidden'), 'true', b.id + ': the icon is decoration');
  const w = drive(['today', 'log', 'analysis', 'history', 'coach', 'today']);
  assert.ok(!w.__err, w.__err);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(w.__seen.map(x => x.current))),
    [['navToday'], ['navLog'], ['navAnalysis'], ['navHistory'], ['navMore'], ['navToday']], 'one tab at a time; More stands for Care, Coach and Learn');
});

test('UX-04 criterion 3: the real switchView titles the four views Today, Food, Progress, History', (assert)=>{
  const w = drive(['today', 'log', 'analysis', 'history']);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(w.__seen.map(x => x.title))), ['Today', 'Food', 'Progress', 'History']);
  assert.match(extractConst(src, 'SEARCH_TAB_LABELS'), /log:'Food', analysis:'Progress'/, 'search results tag the tab by its new name');
});

test('UX-04 criterion 4: no non-comment string outside WHATS_NEW says "the Log tab", "the Analysis tab" or "on Analysis" (the sweep prints them)', (assert)=>{
  const whatsNew = extractConst(src, 'WHATS_NEW');
  const body = src.replace(whatsNew, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !/^\s*\/\//.test(l)).map(l => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');
  const hits = body.split('\n').filter(l => /the Log tab|the Analysis tab|on Analysis\b/.test(l)).map(l => l.trim().slice(0, 120));
  assert.deepStrictEqual(hits, []);
  assert.ok(src.includes('Program Fit on Progress.'), 'anchor: the Today hint names the new tab');
});

test('UX-04 criterion 5: every tab button is at least 44px tall in the CSSOM (48px), five equal columns', (assert)=>{
  const tab = rule('.nav-pills-scroll > .nav-pill');
  assert.ok(parseFloat(tab.getPropertyValue('min-height')) >= 44, tab.getPropertyValue('min-height'));
  assert.strictEqual(rule('.nav-pills-scroll').getPropertyValue('grid-template-columns'), 'repeat(5, 1fr)');
});

run();
