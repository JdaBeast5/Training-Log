'use strict';
// v3.660 (UX-39): "Show N more" folds as a quiet ruled row. It was a glass pill
// (--glass-fill, --glass-hair, --radius-pill) with a plate-blue label, the most
// visible 2.0 piece left. Now: full width, no fill, a 1px --rule on top, square
// ends, 44 px tall, the label 13px/600 in --text-2, the chevron in --text-3,
// and a press dims it (opacity 0.6) with no scale. Labels, ids, the expanded
// toggling and the counts are untouched.
//
// Real CSSOM (the whole stylesheet); each theme's tokens resolved from the real
// :root rules as test-design-tokens-v2.js (UX-01) reads them, with UX-01's
// luminance function. Real folds with real clicks in jsdom: the tips toggle's
// own handler (top-level in index.html, verbatim) over the real markup,
// appendItemsCollapsible (Food's lists) and renderCollapsibleList (weigh-ins,
// Exercise Progress, PRs). Their own suites (test-collapsible-list-batching.js,
// test-today-priorities.js) pass unchanged.
//
// Sabotage: put color:var(--plate-blue) back and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-show-more-row.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const rules = [...new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0].cssRules];

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function props(list){ const m = {}; for(const r of list) for(let i = 0; i < r.style.length; i++){ const p = r.style[i]; if(p.startsWith('--')) m[p] = r.style.getPropertyValue(p).trim(); } return m; }
const top = sel => rules.filter(r => r.selectorText === sel);
const lightBody = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)).flatMap(r => [...r.cssRules]).filter(r => r.selectorText === ':root body');
const THEMES = {dark: props([...top(':root'), ...top(':root body')]), light: props([...top(':root'), ...top(':root body'), ...lightBody])};
const resolve = (v, t) => { for(let i = 0; i < 10 && /var\(/.test(v); i++) v = v.replace(/var\((--[a-z0-9-]+)\)/g, (_, n) => THEMES[t][n] || ''); return v.trim(); };

// Every rule (any depth) whose selector names .show-more-btn.
const FOLD = [];
(function walk(l){ for(const r of l){ if(r.selectorText && /\.show-more-btn/.test(r.selectorText)) FOLD.push(r); if(r.cssRules) walk(r.cssRules); } })(rules);
const base = FOLD.filter(r => r.selectorText === '.show-more-btn');
const get = (sel, prop) => { const r = FOLD.find(x => x.selectorText === sel && x.style.getPropertyValue(prop)); return r ? r.style.getPropertyValue(prop).trim() : ''; };

test('criterion 1: .show-more-btn has no fill, square ends, the label in --text-2 and a 1px --rule on top; no rule reads --plate-blue, --glass-fill or --radius-pill', (assert)=>{
  assert.strictEqual(base.length, 1, 'anchor: one base rule');
  assert.ok(/^(none|transparent)$/.test(get('.show-more-btn', 'background')), 'background: ' + get('.show-more-btn', 'background'));
  assert.ok(/^0(px)?$/.test(get('.show-more-btn', 'border-radius')), 'square ends: ' + get('.show-more-btn', 'border-radius'));
  assert.strictEqual(get('.show-more-btn', 'color'), 'var(--text-2)');
  assert.strictEqual(get('.show-more-btn', 'border-top'), '1px solid var(--rule)');
  assert.strictEqual(get('.show-more-btn', 'font-size'), '13px');
  assert.strictEqual(get('.show-more-btn', 'font-weight'), '600');
  assert.strictEqual(get('.show-more-btn::after', 'color'), 'var(--text-3)', 'the chevron (drawn in currentColor) in --text-3');
  const bad = FOLD.filter(r => /--plate-blue|--glass-fill|--glass-hair|--radius-pill/.test(r.cssText)).map(r => r.selectorText);
  assert.deepStrictEqual(bad, []);
});

test('criterion 1: a press dims it (opacity 0.6) and nothing scales', (assert)=>{
  assert.strictEqual(get('.show-more-btn:active', 'opacity'), '0.6');
  assert.ok(!FOLD.some(r => /:active/.test(r.selectorText) && /scale/.test(r.style.getPropertyValue('transform'))), 'no scale on press');
});

// A button's accessible name, as a screen reader computes it here: an
// aria-label or aria-labelledby wins; otherwise its text (no child is hidden).
function accName(b){
  if(b.hasAttribute('aria-label')) return b.getAttribute('aria-label');
  if(b.hasAttribute('aria-labelledby')) return b.getAttribute('aria-labelledby').split(/\s+/).map(id => b.ownerDocument.getElementById(id).textContent).join(' ');
  noHiddenChild(b);
  return b.textContent.replace(/\s+/g, ' ').trim();
}
function noHiddenChild(b){ if(b.querySelector('[aria-hidden="true"]')) throw new Error('a hidden child: the name is not just the text'); }

test('criterion 3: every fold in the real markup computes min-height of at least 44px (the real stylesheet)', (assert)=>{
  const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''));
  const btns = [...dom.window.document.querySelectorAll('.show-more-btn')];
  assert.ok(btns.length >= 1 && dom.window.document.getElementById('tipsToggle'), 'anchor: the tips fold');
  for(const b of btns) assert.ok(parseFloat(dom.window.getComputedStyle(b).minHeight) >= 44, b.id + ': ' + dom.window.getComputedStyle(b).minHeight);
});

test('criterion 4: --text-2 on --surface-1 and on --ground is at least 4.5:1 in both themes', (assert)=>{
  for(const t of ['dark', 'light']) for(const bg of ['--surface-1', '--ground']){
    const fg = resolve('var(--text-2)', t), b = resolve(`var(${bg})`, t);
    assert.match(fg + b, /^#[0-9A-Fa-f]{6}#[0-9A-Fa-f]{6}$/, `${t} resolves: ${fg} ${b}`);
    assert.ok(contrast(fg, b) >= 4.5, `${t}: --text-2 ${fg} on ${bg} ${b} is ${contrast(fg, b).toFixed(2)}:1`);
  }
});

// ---- criterion 2: the real folds, real clicks ------------------------------
const TIPS_HANDLER = (()=>{ const a = "document.getElementById('tipsToggle').addEventListener('click', ()=>{"; const i = src.indexOf(a); const j = src.indexOf('\n});', i);
  if(i < 0 || src.indexOf(a, i + 1) !== -1) throw new Error('tips handler not found once'); return src.slice(i, j + 4); })();

test('criterion 2: the tips fold (#tipsToggle, its own handler) flips "Show 4 more" / "Show less" and opens its wrap', (assert)=>{
  const body = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document;
  const wrap = body.getElementById('tipsExpandWrap'), btn = body.getElementById('tipsToggle');
  assert.ok(wrap && btn, 'anchor: the real markup');
  const { window } = runJsdom(wrap.outerHTML + btn.outerHTML, `function getActiveTips(){ return [1,2,3,4,5,6,7]; }`, [TIPS_HANDLER]);
  const b = window.document.getElementById('tipsToggle'), w = window.document.getElementById('tipsExpandWrap');
  assert.strictEqual(b.textContent, 'Show 4 more');
  assert.strictEqual(accName(b), 'Show 4 more', 'criterion 3: the accessible name is the visible label');
  b.click();
  assert.strictEqual(b.textContent, 'Show less'); assert.ok(w.classList.contains('open') && b.classList.contains('expanded'));
  assert.strictEqual(accName(b), 'Show less');
  b.click();
  assert.strictEqual(b.textContent, 'Show 4 more'); assert.ok(!w.classList.contains('open') && !b.classList.contains('expanded'));
});

test('criterion 2: Food\'s folds (appendItemsCollapsible) flip "Show 3 more" / "Show less" and reveal the same rows', (assert)=>{
  const { window } = runJsdom('<div id="list"></div>', '', [extractFunction(src, 'appendItemsCollapsible'),
    `const nodes = [1,2,3,4,5].map(i => { const d = document.createElement('div'); d.className = 'row'; d.textContent = 'r' + i; return d; });
     appendItemsCollapsible(document.getElementById('list'), nodes, 2);`]);
  const b = window.document.querySelector('#list .show-more-btn'), w = window.document.querySelector('#list .expand-wrap');
  assert.strictEqual(b.textContent, 'Show 3 more');
  assert.strictEqual(accName(b), 'Show 3 more', 'criterion 3: the accessible name is the visible label');
  assert.deepStrictEqual([...w.querySelectorAll('.row')].map(r => r.textContent), ['r3', 'r4', 'r5']);
  b.click(); assert.strictEqual(b.textContent, 'Show less'); assert.ok(w.classList.contains('open'));
  assert.strictEqual(accName(b), 'Show less');
  b.click(); assert.strictEqual(b.textContent, 'Show 3 more');
});

test('criterion 2: the weigh-in / Exercise Progress fold (renderCollapsibleList) keeps its label in data-collapsed-label and opens its batch', (assert)=>{
  const { window } = runJsdom('<div id="wl"></div>', '', [extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'), extractFunction(src, 'renderCollapsibleList'),
    `renderCollapsibleList(document.getElementById('wl'), [1,2,3,4,5,6].map(i => '<div class="row">w' + i + '</div>'), 3, 'weigh-ins');`]);
  const b = window.document.getElementById('wl-more-0-btn'), w = window.document.getElementById('wl-more-0');
  assert.strictEqual(b.textContent, 'Show 3 more weigh-ins');
  assert.strictEqual(b.dataset.collapsedLabel, 'Show 3 more weigh-ins');
  assert.strictEqual(w.querySelectorAll('.row').length, 3);
  assert.strictEqual(accName(b), 'Show 3 more weigh-ins', 'criterion 3: the accessible name is the visible label');
  b.click();
  assert.ok(w.classList.contains('open'), 'the batch opens');
  assert.strictEqual(b.textContent, 'Show less');
  assert.strictEqual(accName(b), 'Show less');
  b.click();
  assert.ok(!w.classList.contains('open'));
  assert.strictEqual(b.textContent, 'Show 3 more weigh-ins', 'back to its data-collapsed-label');
});

test('criterion 2: a long list (Exercise Progress, PRs) folds in batches of 20, each fold showing the next', (assert)=>{
  const { window } = runJsdom('<div id="ep"></div>', '', [extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'), extractFunction(src, 'renderCollapsibleList'),
    `renderCollapsibleList(document.getElementById('ep'), Array.from({length: 30}, (_, i) => '<div class="row">e' + i + '</div>'), 5, 'exercises');`]);
  const b0 = window.document.getElementById('ep-more-0-btn'), b1 = window.document.getElementById('ep-more-1-btn');
  assert.strictEqual(b0.textContent, 'Show 20 more exercises (25 total)');
  assert.strictEqual(b1.style.display, 'none', 'the second fold waits');
  b0.click();
  assert.strictEqual(b0.textContent, 'Show less');
  assert.strictEqual(b1.style.display, '', 'the next fold shows');
  assert.strictEqual(b1.textContent, 'Show 5 more exercises');
});

run();
