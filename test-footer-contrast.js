'use strict';
// v3.649 (UX-51): the footer's build stamp passes contrast. .app-footer was the
// literal #4A5057, 2.4:1 on the dark ground at 11 px; it is --text-3 now, at
// least 4.5:1 on both grounds. The footer's text is unchanged (Diagnostics and
// support replies read the stamp).
//
// Real invocation: the real stylesheet's CSSOM and its theme tokens, resolved
// as the page does (:root body and its light block over :root); the
// real renderAppFooter with the real consts.
//
// Sabotage: restore color:#4A5057 and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-footer-contrast.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const RULES = (()=>{
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const out = [];
  const walk = (l, media) => { for(const r of l){ if(r.selectorText) out.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } };
  walk(window.document.styleSheets[0].cssRules, '');
  return out;
})();
const get = (sel, prop, light) => { let v = null; for(const {r, media} of RULES){ if(r.selectorText === sel && (!media || (light && /prefers-color-scheme:\s*light/.test(media) && !/contrast/.test(media)))){ const x = r.style.getPropertyValue(prop).trim(); if(x) v = x; } } return v; };
const resolve = (v, light, d = 0) => v.replace(/var\((--[a-z0-9-]+)\)/g, (m, n) => { const x = (light && get(':root body', n, true)) || get(':root body', n, false) || get(':root', n, false); if(!x || d > 10) throw new Error('unresolved ' + n); return resolve(x, light, d + 1); });
const lum = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('criterion 1: the build stamp\'s colour is >= 4.5:1 on the ground in dark and light; the unfolded footer sets no colour of its own', (assert)=>{
  const rule = RULES.filter(({r, media}) => r.selectorText === '.app-footer' && !media);
  assert.strictEqual(rule.length, 1, 'one base footer rule');
  const colour = rule[0].r.style.getPropertyValue('color');
  assert.doesNotMatch(colour, /#4A5057/i);
  for(const light of [false, true]){
    const fg = resolve(colour, light), bg = resolve('var(--bg)', light);
    assert.ok(/^#[0-9a-f]{6}$/i.test(fg) && /^#[0-9a-f]{6}$/i.test(bg), `${fg} / ${bg}`);
    assert.ok(ratio(fg, bg) >= 4.5, `${light ? 'light' : 'dark'}: ${ratio(fg, bg).toFixed(2)}:1`);
  }
  // The Duo override keeps its layout and inherits the colour.
  const duo = RULES.find(({r}) => /posture-split/.test(r.selectorText) && /\.app-footer$/.test(r.selectorText));
  assert.ok(duo, 'anchor: the unfolded footer rule');
  assert.strictEqual(duo.r.style.getPropertyValue('color'), '', 'no colour override there');
  assert.match(duo.r.style.getPropertyValue('height'), /^calc\(20px/);
});

test('criterion 2: the footer\'s text is unchanged: two lines, the slogan then the stamp in its fixed format', (assert)=>{
  const { window } = runJsdom('<div class="app-footer" id="appFooter"></div>', '', [...['APP_NAME', 'APP_SLOGAN', 'APP_VERSION', 'SCHEMA_VERSION'].map(n => extractConst(src, n)),
    extractFunction(src, 'renderAppFooter'), 'renderAppFooter(); window.__v = APP_VERSION;']);
  const f = window.document.getElementById('appFooter');
  assert.strictEqual(f.children.length, 2);
  assert.strictEqual(f.children[0].textContent, 'Plate by plate, step by step.');
  // The stamp Diagnostics and support read, pinned as a literal format (not rebuilt from the function's own template).
  assert.match(f.children[1].textContent, /^Platestep v\d+\.\d+ · schema v\d+$/);
  assert.strictEqual(f.children[1].textContent.split(' v')[1].split(' ')[0], window.__v);
  assert.strictEqual(f.textContent, 'Plate by plate, step by step.' + f.children[1].textContent);
});

// 2026-11-24 (v3.654, UX-17c): retired with Gym mode's CSS. There is no black gym ground any more.

run();
