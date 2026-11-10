'use strict';
// v3.539 (UX-01): design tokens v2, introduced as aliases (no visual change).
// The vocabulary every later UX item switches to (ground, surfaces, rules,
// text levels, spot inks and their on-colours, deep inks, type scale, radii,
// motion) is declared in BOTH the dark :root and the light body:not(.gym-mode)
// rule. Each points at today's value; a comment records its target.
//
// Real invocation: the real <style> is parsed by jsdom's CSSOM (as
// test-light-mode.js does); the targets are read from the real source
// comments; WCAG contrast is computed; the Sash mark's hexes come from the
// real markup parsed by jsdom.
//
// Sabotage: delete one token from the light rule and criterion 1 fails; set
// --spot-red's target to #E0352B (4.4:1 with white) and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-design-tokens-v2.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window } = new JSDOM(`<style>${CSS}</style>`);
const rules = [...window.document.styleSheets[0].cssRules];
const darkRoot = rules.find(r => r.selectorText === ':root');
const lightRule = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText))
  .flatMap(r => [...r.cssRules]).find(r => r.selectorText === 'body:not(.gym-mode)');

const INKS = ['red', 'blue', 'yellow', 'green', 'white', 'off'];
const TOKENS = ['--ground', '--surface-1', '--surface-2', '--rule', '--rule-strong', '--text-2', '--text-3',
  ...INKS.map(i => '--spot-' + i), ...INKS.map(i => '--on-' + i), ...['red', 'blue', 'yellow', 'green'].map(i => '--deep-' + i),
  '--fs-caption', '--fs-meta', '--fs-body', '--fs-lead', '--fs-title', '--fs-head', '--fs-figure-m', '--fs-figure-l', '--fs-figure-xl',
  '--r-control', '--r-sheet', '--dur-press', '--dur-ui', '--dur-sheet', '--dur-moment', '--ease-out', '--ease-in-out', '--ease-drawer'];

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

// The source text of each block's token section, for the recorded targets.
function blockSource(startMarker){
  const i = CSS.indexOf(startMarker);
  if(i === -1) throw new Error('block not found: ' + startMarker);
  const a = CSS.indexOf('[TOKENS v2, v3.539, UX-01]', i);
  if(a === -1) throw new Error('token section not found after ' + startMarker);
  return CSS.slice(a, CSS.indexOf('--ease-drawer', a));
}
const SRC = {dark: blockSource(':root{'), light: blockSource('body:not(.gym-mode){\n      color-scheme:light;')};
function targets(theme){
  const t = {};
  for(const m of SRC[theme].matchAll(/(--[a-z0-9-]+):[^;]*;\s*\/\*\s*target (#[0-9A-Fa-f]{6})\s*\*\//g)) t[m[1]] = m[2].toUpperCase();
  const text = SRC[theme].match(/--text keeps its own definition; its target is (#[0-9A-Fa-f]{6})/);
  if(text) t['--text'] = text[1].toUpperCase();
  return t;
}

test('criterion 1: every new token is defined in the dark :root and in the light body:not(.gym-mode) rule (real CSSOM)', (assert)=>{
  assert.ok(darkRoot && lightRule, 'both rules found');
  const missDark = TOKENS.filter(t => !darkRoot.style.getPropertyValue(t).trim());
  const missLight = TOKENS.filter(t => !lightRule.style.getPropertyValue(t).trim());
  assert.deepStrictEqual(missDark, [], 'dark');
  assert.deepStrictEqual(missLight, [], 'light');
});

test('aliases point at today\'s values, so nothing changes: each colour alias is the same var() in both themes', (assert)=>{
  const ALIAS = {'--ground': 'var(--bg)', '--surface-1': 'var(--surface)', '--surface-2': 'var(--surface2)', '--rule': 'var(--line)',
    '--rule-strong': 'var(--line-bright)', '--text-2': 'var(--text-muted)', '--text-3': 'var(--text-muted)', '--r-sheet': 'var(--radius-card)',
    ...Object.fromEntries(INKS.map(i => ['--spot-' + i, `var(--plate-${i})`]))};
  for(const [t, v] of Object.entries(ALIAS)){
    assert.strictEqual(darkRoot.style.getPropertyValue(t).trim(), v, 'dark ' + t);
    assert.strictEqual(lightRule.style.getPropertyValue(t).trim(), v, 'light ' + t);
  }
  assert.strictEqual(darkRoot.style.getPropertyValue('--radius-card').trim(), '28px', 'the r-sheet target equals today');
});

test('criterion 2: target contrast ≥ 4.5:1 in both themes: on-ink on spot-ink, white on deep-ink, and text, text-2, text-3 on ground', (assert)=>{
  // Each block's own targets were read (not the other theme's by mistake).
  assert.strictEqual(targets('dark')['--ground'], '#0C0C0D');
  assert.strictEqual(targets('light')['--ground'], '#F3F3F1');
  for(const theme of ['dark', 'light']){
    const t = targets(theme);
    for(const i of INKS){
      assert.ok(t['--spot-' + i] && t['--on-' + i], `${theme} ${i}: targets recorded`);
      const c = contrast(t['--on-' + i], t['--spot-' + i]);
      assert.ok(c >= 4.5, `${theme} on-${i} on spot-${i}: ${c.toFixed(2)}:1`);
    }
    for(const i of ['red', 'blue', 'yellow', 'green']){
      const c = contrast('#FFFFFF', t['--deep-' + i]);
      assert.ok(c >= 4.5, `${theme} white on deep-${i}: ${c.toFixed(2)}:1`);
    }
    for(const k of ['--text', '--text-2', '--text-3']){
      assert.ok(t[k], `${theme} ${k}: target recorded`);
      const c = contrast(t[k], t['--ground']);
      assert.ok(c >= 4.5, `${theme} ${k} on ground: ${c.toFixed(2)}:1`);
    }
  }
});

test('criterion 4: the Sash mark\'s hexes (header mark, the five launch layers, option-b.svg) equal the five target spot inks', (assert)=>{
  const t = targets('dark');
  const want = ['red', 'blue', 'yellow', 'green', 'white'].map(i => t['--spot-' + i]).sort();
  const doc = new JSDOM(html).window.document;
  const fills = (els) => [...new Set(els.flatMap(el => [...el.querySelectorAll('[fill]')].map(n => n.getAttribute('fill').toUpperCase())).filter(f => /^#[0-9A-F]{6}$/.test(f) && f !== '#0C0C0D'))].sort();
  assert.deepStrictEqual(fills([doc.querySelector('#brandHome svg')]), want, 'header mark');
  const layers = ['launch-b25', 'launch-b20', 'launch-b15', 'launch-b10', 'launch-b5'].map(c => doc.querySelector('svg.' + c)).filter(Boolean);
  assert.strictEqual(layers.length, 5, 'five launch layers');
  assert.deepStrictEqual(fills(layers), want, 'launch layers');
  const icon = new JSDOM(fs.readFileSync(path.join(__dirname, 'tools/design/icon/option-b.svg'), 'utf8'), {contentType: 'image/svg+xml'}).window.document;
  assert.deepStrictEqual(fills([icon.documentElement]), want, 'option-b.svg');
});

test('nothing reads the new tokens yet: no var(--new-token) outside the two declaration blocks', (assert)=>{
  const outside = CSS.replace(SRC.dark, '').replace(SRC.light, '') + html.replace(/<style>[\s\S]*?<\/style>/g, '');
  const used = TOKENS.filter(t => outside.includes(`var(${t})`) || outside.includes(`var(${t},`));
  assert.deepStrictEqual(used, []);
});

run();
