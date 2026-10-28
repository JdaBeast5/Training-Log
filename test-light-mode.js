'use strict';
// Light mode (owner chose "Follow the phone"): light when iOS is in light
// mode, dark otherwise, no setting. One increment per version.
//
// v3.477 — The token layer. A prefers-color-scheme: light block redefines the
// colour tokens on :root; the dark values stay the design of record. The
// translucent tint colour (--surface-white-rgb) becomes ink, glass and its
// sheens stay white, shadows soften, the aura dims. Two theme-color metas
// colour the browser chrome to match.
//
// jsdom has no matchMedia for colour schemes, so the light block is read from
// the real CSSOM and its tokens checked directly (and their text contrast
// computed, not eyeballed).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-light-mode.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window } = new JSDOM(`<style>${CSS}</style>`);
const rules = [...window.document.styleSheets[0].cssRules];
const lightRoots = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText))
  .flatMap(r => [...r.cssRules]).filter(r => r.selectorText === ':root');
const darkRoot = rules.find(r => r.selectorText === ':root');
const tok = (rule, name) => rule.style.getPropertyValue(name).trim();

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

test('REAL CSSOM (v3.477): one light block on :root, which switches color-scheme and redefines only existing tokens', (assert)=>{
  assert.strictEqual(lightRoots.length, 1);
  const light = lightRoots[0];
  assert.strictEqual(tok(light, 'color-scheme'), 'light');
  assert.strictEqual(tok(darkRoot, 'color-scheme'), 'dark', 'dark stays the default');
  const names = [...light.style].filter(n => n.startsWith('--'));
  assert.ok(names.length >= 20, 'anchor: the real token set');
  for(const n of names) assert.notStrictEqual(tok(darkRoot, n), '', `${n} exists in the dark :root`);
});

test('REAL CSSOM (v3.477): ink tints, white glass, light page; text readable on page and card', (assert)=>{
  const light = lightRoots[0];
  assert.strictEqual(tok(light, '--surface-white-rgb'), '17,18,22', 'tints and hairlines become ink');
  assert.strictEqual(tok(light, '--surface-rgb'), '255,255,255');
  assert.match(tok(light, '--glass-fill'), /rgba\(var\(--surface-rgb\)/, 'glass stays white');
  assert.match(tok(light, '--sheen'), /rgba\(var\(--surface-rgb\)/);
  const bg = tok(light, '--bg'), card = tok(light, '--surface'), text = tok(light, '--text'), muted = tok(light, '--text-muted');
  for(const [fg, back, name] of [[text, bg, 'text on page'], [text, card, 'text on card'], [muted, bg, 'muted on page'], [muted, card, 'muted on card']]){
    assert.ok(contrast(fg, back) >= 4.5, `${name}: ${contrast(fg, back).toFixed(2)}:1`);
  }
});

test('REAL markup (v3.477): the browser chrome follows the appearance', (assert)=>{
  const doc = new JSDOM(html).window.document;
  const metas = [...doc.querySelectorAll('meta[name="theme-color"]')].map(m => [m.getAttribute('media'), m.getAttribute('content')]);
  assert.deepStrictEqual(metas, [['(prefers-color-scheme: dark)', '#050507'], ['(prefers-color-scheme: light)', tok(lightRoots[0], '--bg')]]);
});

run();
