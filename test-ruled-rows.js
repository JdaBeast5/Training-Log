'use strict';
// v3.661 (UX-40): in-card list rows are ruled, not tiles. buildSwipeItem's rows
// (weigh-ins, sleep, BP, glucose, measurements, supplements, grocery, the food
// log, care log, coach history) were rounded tiles on the see-through
// --row-fill. Now: square, no gap, a 1px --rule under each, and an OPAQUE
// fill equal to the card's surface (--surface-1, what .card's --glass-fill is),
// so the red delete layer behind can never show through (the v3.383 rule).
// Set rows and warm-up rows (also .swipe-items) keep their own shape.
// .weight-item: 12px padding, the date 15px in --text-2, the value in the text
// face with tabular figures (was mono).
//
// Real CSSOM: the whole stylesheet of index.html. jsdom's getComputedStyle
// can't resolve var(), so winning() runs the cascade itself on real-shaped
// markup: every top-level rule whose selector the element matches
// (element.matches), ranked by specificity then source order, the winning
// declaration read as written (a shorthand counts for its longhands) and then
// resolved through each theme's tokens, read from the real :root rules as
// UX-01's test reads them. Real swipe: buildSwipeItem and makeSwipeable from
// index.html, driven with pointer events and a tap on the revealed Delete.
//
// Sabotage: put list rows' .swipe-content back on --row-fill and criterion 1
// fails (not opaque); put a per-list radius back and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-ruled-rows.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const rules = [...new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0].cssRules];

// ---- tokens per theme ----
function props(list){ const m = {}; for(const r of list) for(let i = 0; i < r.style.length; i++){ const p = r.style[i]; if(p.startsWith('--')) m[p] = r.style.getPropertyValue(p).trim(); } return m; }
const top = sel => rules.filter(r => r.selectorText === sel);
const lightBody = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)).flatMap(r => [...r.cssRules]).filter(r => r.selectorText === ':root body');
const THEMES = {dark: props([...top(':root'), ...top(':root body')]), light: props([...top(':root'), ...top(':root body'), ...lightBody])};
const resolve = (v, t) => { for(let i = 0; i < 10 && /var\(/.test(v); i++) v = v.replace(/var\((--[a-z0-9-]+)\)/g, (_, n) => THEMES[t][n] || ''); return v.trim(); };
const opaque = c => /^#[0-9A-Fa-f]{6}$/.test(c); // a resolved #rrggbb has alpha 1

// ---- the cascade ----
// Per theme, in source order: dark is every top-level style rule; light adds
// the rules inside the light-scheme @media blocks, where they sit.
function styleRules(theme){
  const out = [];
  for(const r of rules){
    if(r.selectorText && r.style) out.push(r);
    else if(theme === 'light' && r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)) for(const c of r.cssRules) if(c.selectorText && c.style) out.push(c);
  }
  return out;
}
const STYLE = {dark: styleRules('dark'), light: styleRules('light')};
function specificity(sel){
  let s = sel.replace(/::[\w-]+/g, ' ');
  const notArgs = [];
  s = s.replace(/:not\(([^)]*)\)/g, (_, a) => { notArgs.push(a); return ' '; });
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const cls = (s.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g) || []).length;
  const types = (s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]|:[\w-]+/g, ' ').match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) || []).length;
  return notArgs.map(specificity).reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [ids, cls, types]);
}
const greater = (a, b) => { for(let i = 0; i < a.length; i++) if(a[i] !== b[i]) return a[i] > b[i]; return false; };
const SHORT = {background: ['background', 'background-color'], radius: ['border-radius', 'border-top-left-radius'], 'margin-bottom': ['margin-bottom', 'margin'],
  'border-bottom': ['border-bottom', 'border'], 'border-top': ['border-top', 'border'], 'margin-top': ['margin-top', 'margin'], 'font-family': ['font-family'], 'font-variant-numeric': ['font-variant-numeric'], 'font-size': ['font-size'],
  color: ['color'], 'padding-top': ['padding-top', 'padding'], 'padding-left': ['padding-left', 'padding']};
function winning(el, prop, theme = 'dark'){
  let best = null;
  STYLE[theme].forEach((r, order) => {
    for(const sel of r.selectorText.split(/,(?![^(]*\))/).map(x => x.trim())){
      let hit = false; try { hit = el.matches(sel); } catch(e){}
      if(!hit) continue;
      for(const p of SHORT[prop]){
        const v = r.style.getPropertyValue(p); if(!v) continue;
        const key = [...specificity(sel), order];
        if(!best || greater(key, best.key)) best = {key, v: v.trim(), p};
        break;
      }
    }
  });
  if(!best) return '';
  if(prop === 'margin-bottom' && best.p === 'margin'){ const x = best.v.split(/\s+/); return x[x.length === 1 ? 0 : 2] || x[0]; }
  if(prop === 'padding-top' && best.p === 'padding') return best.v.split(/\s+/)[0];
  if(prop === 'padding-left' && best.p === 'padding'){ const x = best.v.split(/\s+/); return x[x.length === 4 ? 3 : x.length === 1 ? 0 : 1]; }
  return best.v;
}
const zero = v => /^0(px)?$/.test(v);

// ---- real-shaped markup ----
const row = (listId, cls, inner) => `<div id="${listId}"><div class="swipe-item card-stagger" id="${listId}-i"><div class="swipe-delete-bg"></div><div class="swipe-content" id="${listId}-c"><div class="${cls}" id="${listId}-r">${inner}</div></div></div></div>`;
const LISTS = [['weightList', 'weight-item'], ['sleepList', 'weight-item'], ['foodLogList', 'food-log-item'], ['mySupplementsList', 'supplement-row'],
  ['careLogList', 'care-log-item'], ['coachHistoryList', 'care-log-item'], ['groceryListItems', 'grocery-item'], ['savedWeeksList', 'day-card']];
const doc = new JSDOM(`<div class="card">${LISTS.map(([id, cls]) => row(id, cls, '<span>Nov 2</span><span>182.4 lb</span>')).join('')}</div>
  <div class="card"><div id="foodLogList2"><div class="swipe-item"><div class="swipe-content"><div class="food-log-item">Oats</div><div class="smooth-toggle fl-detail" id="fld"></div></div></div>
    <div class="expand-wrap"><div></div></div><button class="show-more-btn" id="fold">Show 3 more</button></div></div>
  <div class="card"><div id="tipsExpandWrap" class="expand-wrap"><div></div></div><button class="show-more-btn" id="tipsToggle">Show 4 more</button></div>
  <div class="card today-priorities" id="todayInsightsCard"><div id="todayInsightsList">${row('ti', 'today-insight-row', 'note')}</div></div>
  <div class="set-row swipe-item" id="setrow"><div class="swipe-content set-row-content" id="setrow-c"></div></div>
  <div class="warmup-set-row swipe-item" id="warmrow"><div class="swipe-content warmup-set-row-content"></div></div>`).window.document;
const $ = id => doc.getElementById(id);

test('criterion 1: every list row is square with no gap, and its .swipe-content is an opaque fill equal to the card\'s surface in both themes', (assert)=>{
  const card = winning(doc.querySelector('.card'), 'background');
  assert.strictEqual(card, 'var(--glass-fill)', 'anchor: the card\'s own fill');
  for(const t of ['dark', 'light']) for(const [id] of LISTS){
    assert.ok(zero(winning($(id + '-i'), 'radius', t)), `${id} ${t} radius: ` + winning($(id + '-i'), 'radius', t));
    assert.ok(zero(winning($(id + '-i'), 'margin-bottom', t)), `${id} ${t} gap: ` + winning($(id + '-i'), 'margin-bottom', t));
    const fill = winning($(id + '-c'), 'background', t), cardFill = winning(doc.querySelector('.card'), 'background', t);
    assert.ok(opaque(resolve(fill, t)), `${id} ${t}: ${fill} -> ${resolve(fill, t)} is opaque (alpha 1)`);
    assert.strictEqual(resolve(fill, t), resolve(cardFill, t), `${id} ${t}: equal to the card's fill`);
  }
});

test('criterion 1: the Priorities notes stay on the ground, opaque, with square ends (their 2px rule is straight)', (assert)=>{
  assert.ok(zero(winning($('ti-i'), 'radius')), 'the wrapper: ' + winning($('ti-i'), 'radius'));
  assert.ok(zero(winning($('ti-c'), 'radius')), 'the content: ' + winning($('ti-c'), 'radius'));
  const fill = winning($('ti-c'), 'background');
  assert.strictEqual(fill, 'var(--ground)');
  for(const t of ['dark', 'light']) assert.ok(opaque(resolve(fill, t)), t);
  assert.ok(!/solid/.test(winning($('ti-r'), 'border-bottom')), 'a note gets no bottom rule (its left rule only): ' + winning($('ti-r'), 'border-bottom'));
});

test('criterion 1: each list row\'s own line is a 1px --rule, even as the only child of its wrapper (no :last-child drop)', (assert)=>{
  for(const [id] of LISTS){
    assert.strictEqual(winning($(id + '-r'), 'border-bottom'), '1px solid var(--rule)', id);
    assert.ok(!/solid/.test(winning($(id + '-i'), 'border-bottom')), id + ': no second line on the wrapper');
  }
});

test('set rows and warm-up rows (also .swipe-items) keep their own shape', (assert)=>{
  assert.strictEqual(winning($('setrow'), 'radius'), 'var(--radius-sm)');
  assert.strictEqual(winning($('setrow'), 'margin-bottom'), '2px');
  assert.strictEqual(winning($('warmrow'), 'radius'), 'var(--radius-sm)');
  assert.strictEqual(winning($('setrow-c'), 'background'), 'var(--row-fill)', 'untouched');
});

test('criterion 2: the real makeSwipeable on a weigh-in row (buildSwipeItem): a swipe reveals Delete and a tap on it deletes', async (assert)=>{
  const { window } = runJsdom('<div id="weightList"></div>', `window.matchMedia = () => ({matches: true});`, [extractFunction(src, 'buildSwipeItem'), extractFunction(src, 'makeSwipeable'), `
    document.getElementById('weightList').innerHTML = buildSwipeItem('<div class="weight-item"><span>Nov 2</span><span>182.4 lb</span></div>');
    window.__deleted = 0;
    const item = document.querySelector('#weightList .swipe-item');
    item.querySelector('.swipe-content').setPointerCapture = () => {};
    makeSwipeable(item, () => { window.__deleted++; });`]);
  const item = window.document.querySelector('#weightList .swipe-item'), content = item.querySelector('.swipe-content');
  const pe = (type, x) => { const e = new window.Event(type, {bubbles: true}); Object.defineProperty(e, 'clientX', {value: x}); Object.defineProperty(e, 'pointerId', {value: 1}); content.dispatchEvent(e); };
  pe('pointerdown', 300); pe('pointermove', 280); pe('pointermove', 220); pe('pointerup', 220);
  assert.strictEqual(content.style.transform, 'translateX(-80px)', 'the row opens');
  assert.strictEqual(item.style.getPropertyValue('--swipe-reveal'), '80px', 'Delete is uncovered');
  assert.strictEqual(item.querySelector('.swipe-delete-bg').getAttribute('aria-label'), 'Delete');
  item.querySelector('.swipe-delete-bg').click();
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(window.__deleted, 1, 'the entry is deleted');
});

test('criterion 3: .weight-item\'s value is in the text face (not --font-mono) with tabular figures; the date 15px in --text-2, 12px padding', (assert)=>{
  const v = doc.querySelector('#weightList-r span:last-child');
  assert.strictEqual(winning(v, 'font-family'), 'var(--font-sans)');
  assert.strictEqual(winning(v, 'font-variant-numeric'), 'tabular-nums');
  assert.strictEqual(winning($('weightList-r'), 'font-size'), '15px');
  assert.strictEqual(winning($('weightList-r'), 'color'), 'var(--text-2)');
  assert.strictEqual(winning($('weightList-r'), 'padding-top'), '12px');
  assert.ok(zero(winning($('weightList-r'), 'padding-left')));
});

test('criterion 4: a .food-log-item row\'s .swipe-content is the card surface, so it reads as UX-13\'s ruled row', (assert)=>{
  assert.strictEqual(winning($('foodLogList-c'), 'background'), 'var(--surface-1)');
  assert.strictEqual(winning($('foodLogList-r'), 'border-bottom'), '1px solid var(--rule)');
});

test('review fix: the food log\'s macro breakdown (.fl-detail, after the row) keeps its own line; only the row takes the --rule', (assert)=>{
  assert.notStrictEqual(winning($('fld'), 'border-bottom'), '1px solid var(--rule)', winning($('fld'), 'border-bottom'));
});

test('review fix: a fold right after ruled rows uses the last row\'s rule as its top line (one line, not two); other folds keep their own', (assert)=>{
  assert.ok(/^0(px)?$/.test(winning($('fold'), 'border-top') || '') || winning($('fold'), 'border-top') === '0', 'the fold after rows: ' + winning($('fold'), 'border-top'));
  assert.ok(zero(winning($('fold'), 'margin-top')));
  assert.strictEqual(winning($('tipsToggle'), 'border-top'), '1px solid var(--rule)', 'the tips fold (no rows before it) keeps its rule');
});

// The cascade helper itself, on known pairs (so a broken ranking can't pass the tests above by accident).
test('anchor: winning() ranks by specificity, then order', (assert)=>{
  assert.deepStrictEqual(specificity('#a .b:not(.c) > d'), [1, 2, 1]);
  assert.strictEqual(winning($('ti-c'), 'background'), 'var(--ground)', '#todayInsightsCard #todayInsightsList .swipe-content (2,1,0) beats the list-row rule (0,4,0)');
  assert.strictEqual(winning($('mySupplementsList-r'), 'padding-left'), '14px', 'the list\'s own padding (an id rule) still wins');
});

run();
