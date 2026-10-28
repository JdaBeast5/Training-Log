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
  .flatMap(r => [...r.cssRules]).filter(r => r.selectorText === 'body:not(.gym-mode)'); // v3.480: on body, not :root
const darkRoot = rules.find(r => r.selectorText === ':root');
const tok = (rule, name) => rule.style.getPropertyValue(name).trim();

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

test('REAL CSSOM (v3.477): one light block, which switches color-scheme and redefines only existing tokens', (assert)=>{
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

// v3.478 — The selected tab. It was the one white pill in the glass bar —
// literal #fff, so on the light bar it all but disappeared. Its colours are
// tokens now: white on black in the dark design, ink on white in light.
test('REAL CSSOM (v3.478): the active tab pill is ink in light mode and still reads', (assert)=>{
  const light = lightRoots[0];
  assert.strictEqual(tok(darkRoot, '--pill-active-bg'), '#fff');
  assert.strictEqual(tok(light, '--pill-active-bg'), '#111216');
  assert.strictEqual(tok(light, '--pill-active-ink'), '#FFFFFF');
  assert.ok(contrast(tok(light, '--pill-active-ink'), tok(light, '--pill-active-bg')) >= 4.5, 'label on pill');
  assert.ok(contrast(tok(light, '--pill-active-bg'), tok(light, '--bg')) >= 3, 'pill against the page');
});

// v3.479 — Accents as text. Yellow, green, orange, teal and even red and blue
// fell under 4.5:1 on white (yellow 1.6:1: History's PR weights, the warning
// notes). In light mode each accent is a deeper shade; the -rgb twins stay
// bright because they only tint and glow.
test('REAL CSSOM (v3.479): every accent reads at 4.5:1 on the light page and on a light card', (assert)=>{
  const light = lightRoots[0];
  const accents = ['red', 'orange', 'yellow', 'green', 'teal', 'purple', 'blue'];
  for(const a of accents){
    const hex = tok(light, `--plate-${a}`);
    assert.match(hex, /^#[0-9A-Fa-f]{6}$/, a);
    assert.notStrictEqual(hex, tok(darkRoot, `--plate-${a}`), `${a} has its own light shade`);
    for(const [back, name] of [[tok(light, '--bg'), 'page'], [tok(light, '--surface'), 'card']]){
      assert.ok(contrast(hex, back) >= 4.5, `${a} on ${name}: ${contrast(hex, back).toFixed(2)}:1`);
    }
    assert.strictEqual(tok(light, `--plate-${a}-rgb`), '', `${a}'s rgb twin is untouched`);
  }
});

// v3.480 — Gym mode stays dark. It is a hand-tuned black screen (its own
// background, glows and literal shadows), and with light tokens inside it came
// out half white. The light block applies to body:not(.gym-mode), so gym mode
// inherits the dark tokens from :root whatever the phone is set to.
test('REAL CSSOM (v3.480): the light tokens apply to everything but gym mode, which keeps the dark :root values', (assert)=>{
  const blocks = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)).flatMap(r => [...r.cssRules]);
  assert.deepStrictEqual(blocks.filter(r => /--bg/.test(r.cssText)).map(r => r.selectorText), ['body:not(.gym-mode)']);
  const { window: w } = new JSDOM('<body class="gym-mode"></body>');
  assert.strictEqual(w.document.body.matches('body:not(.gym-mode)'), false, 'a gym-mode body does not take the light tokens');
  w.document.body.className = '';
  assert.strictEqual(w.document.body.matches('body:not(.gym-mode)'), true);
  assert.match(CSS, /body\.gym-mode\{\s*background:#000;/, 'anchor: gym mode\'s own black ground');
});

run();
