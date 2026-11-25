'use strict';
// v3.659 (UX-38): Food's water buttons and bar readable in light. The
// "+8oz / +16oz / +24oz" labels were the 2.0 cyan #4FC3F7, 2.0:1 on the light
// card. They are now the standard secondary control (--surface-2 fill, a 1px
// --rule, --r-control, the label in --text, 44 px tall), and the bar's fill is
// the ink (--text) on its --surface-2 track, out of the inline style.
//
// Real CSSOM: the whole stylesheet of index.html, parsed by jsdom; each
// theme's tokens resolved from the real :root rules (dark: :root, then the
// flat-ground :root body; light: those, then the light-scheme :root body), as
// test-design-tokens-v2.js (UX-01) reads them, with UX-01's luminance function.
// Real markup: index.html's body with scripts removed.
// Criterion 3 (the real addWater path) is test-water-log.js, unchanged.
//
// Sabotage: restore color:#4FC3F7 on .water-btn and criterion 1 fails in
// light (and criterion 2).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-water-contrast.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const sheetWin = new JSDOM(`<style>${CSS}</style>`).window;
const rules = [...sheetWin.document.styleSheets[0].cssRules];

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

// Each theme's custom properties, in cascade order.
function props(list){ const m = {}; for(const r of list) for(let i = 0; i < r.style.length; i++){ const p = r.style[i]; if(p.startsWith('--')) m[p] = r.style.getPropertyValue(p).trim(); } return m; }
const top = sel => rules.filter(r => r.selectorText === sel);
const lightBody = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)).flatMap(r => [...r.cssRules]).filter(r => r.selectorText === ':root body');
const THEMES = {dark: props([...top(':root'), ...top(':root body')]), light: props([...top(':root'), ...top(':root body'), ...lightBody])};
function resolve(v, t){
  for(let i = 0; i < 10 && /var\(/.test(v); i++) v = v.replace(/var\((--[a-z0-9-]+)\)/g, (_, n) => THEMES[t][n] || '');
  return v.trim();
}
// The first rule for a selector that declares the property (the real CSSOM, any depth outside media queries).
function declared(sel, prop){
  for(const r of rules) if(r.selectorText && r.selectorText.split(/,(?![^(]*\))/).map(x => x.trim()).includes(sel)){ const v = r.style.getPropertyValue(prop); if(v) return v; }
  return '';
}

test('criterion 1: the .water-btn label against its own background is at least 4.5:1 in both themes (UX-01\'s luminance, resolved tokens)', (assert)=>{
  assert.ok(lightBody.length === 1 && top(':root').length >= 1, 'anchor: both themes\' token rules found');
  for(const t of ['dark', 'light']){
    const fg = resolve(declared('.water-btn', 'color'), t), bg = resolve(declared('.water-btn', 'background'), t);
    assert.match(fg, /^#[0-9A-Fa-f]{6}$/, t + ' label resolves to a colour: ' + fg);
    assert.match(bg, /^#[0-9A-Fa-f]{6}$/, t + ' fill resolves to a colour: ' + bg);
    const c = contrast(fg, bg);
    assert.ok(c >= 4.5, `${t}: ${fg} on ${bg} is ${c.toFixed(2)}:1`);
  }
  // Anchor: the old cyan on the new light fill would fail, so the check can see a failure.
  assert.ok(contrast('#4FC3F7', resolve('var(--surface-2)', 'light')) < 4.5);
});

test('criterion 1: the secondary control: --surface-2 fill, a 1px --rule, --r-control, the label in --text; the bar is the ink', (assert)=>{
  assert.strictEqual(declared('.water-btn', 'background'), 'var(--surface-2)');
  assert.strictEqual(declared('.water-btn', 'border'), '1px solid var(--rule)');
  assert.strictEqual(declared('.water-btn', 'border-radius'), 'var(--r-control)');
  assert.strictEqual(declared('.water-btn', 'color'), 'var(--text)');
  assert.strictEqual(declared('#barWater', 'background'), 'var(--text)');
  assert.strictEqual(declared('.macro-bar-track', 'background'), 'var(--surface2)', 'its track: --surface2 is --surface-2 (the flat-ground alias)');
  assert.strictEqual(resolve('var(--surface2)', 'light'), resolve('var(--surface-2)', 'light'));
});

test('criterion 2: no CSS rule for .water-btn or #barWater, and no inline style in the Food markup, carries #4FC3F7', (assert)=>{
  const hits = [];
  const walk = l => { for(const r of l){ if(r.selectorText && /\.water-btn|#barWater/.test(r.selectorText) && /4fc3f7/i.test(r.cssText)) hits.push(r.selectorText); if(r.cssRules) walk(r.cssRules); } };
  walk(rules);
  assert.deepStrictEqual(hits, []);
  const doc = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document;
  const bar = doc.getElementById('barWater');
  assert.ok(bar && doc.querySelectorAll('.water-btn[data-oz]').length === 3, 'anchor: the real water card');
  assert.strictEqual(bar.getAttribute('style'), 'width:0%', 'only the width the code sets stays inline');
  const card = bar.closest('.card') || bar.parentElement.parentElement;
  assert.ok(![...card.querySelectorAll('[style]')].some(e => /4fc3f7/i.test(e.getAttribute('style'))), 'no inline cyan in the water card');
});

test('criterion 4: every .water-btn computes min-height of at least 44px (the real markup and stylesheet)', (assert)=>{
  const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''));
  const btns = [...dom.window.document.querySelectorAll('.water-btn')];
  assert.ok(btns.length >= 3, 'anchor: the buttons');
  for(const b of btns) assert.ok(parseFloat(dom.window.getComputedStyle(b).minHeight) >= 44, b.textContent + ': ' + dom.window.getComputedStyle(b).minHeight);
});

run();
