'use strict';
// v3.646 (MKT-21, owner 2026-11-24, slogan.md §10): the slogan "Plate by plate,
// step by step." lives in one const, APP_SLOGAN, and the footer shows it on its
// own line above the build stamp. The stamp is byte for byte what it was. The
// unfolded footer (one 20 px line) shows the stamp only.
//
// Real invocation: the real renderAppFooter with the real APP_NAME, APP_SLOGAN,
// APP_VERSION and SCHEMA_VERSION; the real stylesheet's CSSOM (media blocks
// included) and its theme tokens for the contrast check.
//
// Sabotage: put the slogan into the version span and criterion 1 fails; add a
// second literal of the slogan in a template and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-app-slogan.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const CONSTS = ['APP_NAME', 'APP_SLOGAN', 'APP_VERSION', 'SCHEMA_VERSION'].map(n => extractConst(src, n));
// Source without comments, line by line (as test-moments.js does): a regex
// strip of /* … */ across the file eats real code where a string holds "/*"
// (accept="image/*"). Comment lines go, and a trailing " // …" is cut.
const strip = t => t.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).map(l => l.replace(/\s\/\/ .*$/, '')).join('\n');

test('criterion 1: the real renderAppFooter leaves #appFooter with two children: the slogan, then the build stamp, byte for byte', (assert)=>{
  const { window } = runJsdom('<div class="app-footer" id="appFooter">old</div>', '', [...CONSTS, extractFunction(src, 'renderAppFooter'),
    'window.__c = {APP_NAME, APP_SLOGAN, APP_VERSION, SCHEMA_VERSION}; renderAppFooter(); renderAppFooter();']);
  const f = window.document.getElementById('appFooter');
  const c = window.__c;
  assert.strictEqual(f.children.length, 2, 'two lines (and a second call does not add more)');
  assert.strictEqual(f.children[0].className, 'app-footer-slogan');
  assert.strictEqual(f.children[0].textContent, c.APP_SLOGAN);
  assert.strictEqual(f.children[1].className, 'app-footer-build');
  assert.strictEqual(f.children[1].textContent, `${c.APP_NAME} v${c.APP_VERSION} · schema v${c.SCHEMA_VERSION}`);
  assert.ok(!f.children[1].textContent.includes(c.APP_SLOGAN), 'the stamp holds no slogan');
});

test('criterion 2: APP_SLOGAN is "Plate by plate, step by step.", declared once; the literal appears once outside WHATS_NEW and comments', (assert)=>{
  const { window } = runJsdom('', '', [...CONSTS, 'window.__s = APP_SLOGAN;']);
  assert.strictEqual(window.__s, 'Plate by plate, step by step.');
  assert.strictEqual((src.match(/\bconst APP_SLOGAN\b/g) || []).length, 1);
  const wn = extractConst(src, 'WHATS_NEW');
  const code = strip(src.replace(wn, ''));
  assert.strictEqual((code.match(/Plate by plate, step by step\./g) || []).length, 1);
});

test('criterion 3: init calls renderAppFooter exactly once, and nothing else writes the footer\'s text', (assert)=>{
  const start = src.indexOf('(async function init(){');
  assert.ok(start > 0, 'anchor: init found');
  const body = strip(src.slice(start, src.indexOf('\n  })();', start)));
  assert.strictEqual((body.match(/\brenderAppFooter\(\)/g) || []).length, 1);
  const code = strip(src);
  assert.ok(code.split('\n').length > 40000 && code.includes('function drawStoryCard(') && code.includes('function renderAppFooter('), 'anchor: the stripped source keeps the whole app (' + code.split('\n').length + ' lines)');
  assert.strictEqual((code.match(/getElementById\('appFooter'\)/g) || []).length, 1, 'one reader: renderAppFooter');
  assert.strictEqual((code.match(/querySelector(All)?\(['"`][^'"`]*(#appFooter|\.app-footer)\b/g) || []).length, 0, 'no other route to the footer');
  assert.match(extractFunction(src, 'renderAppFooter'), /getElementById\('appFooter'\)/);
});

const RULES = (()=>{
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const out = [];
  const walk = (l, media) => { for(const r of l){ if(r.selectorText) out.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } };
  walk(window.document.styleSheets[0].cssRules, '');
  return out;
})();

test('criterion 4: the slogan line is var(--text-2), and against --bg it is >= 4.5:1 in dark and light', (assert)=>{
  const rule = RULES.find(({r, media}) => r.selectorText === '.app-footer-slogan' && !media);
  assert.ok(rule, 'one slogan rule');
  assert.strictEqual(rule.r.style.getPropertyValue('color'), 'var(--text-2)');
  assert.match(rule.r.style.getPropertyValue('font-family'), /--font-sans/, 'the sans face, not the mono');
  const get = (sel, prop, light) => { let v = null; for(const {r, media} of RULES){ if(r.selectorText === sel && (!media || (light && /prefers-color-scheme:\s*light/.test(media) && !/contrast/.test(media)))){ const x = r.style.getPropertyValue(prop).trim(); if(x) v = x; } } return v; };
  const resolve = (v, light, d = 0) => v.replace(/var\((--[a-z0-9-]+)\)/g, (m, n) => { const x = (light && get('body:not(.gym-mode)', n, true)) || get('body:not(.gym-mode)', n, false) || get(':root', n, false); if(!x || d > 10) throw new Error('unresolved ' + n); return resolve(x, light, d + 1); });
  const lum = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for(const light of [false, true]){
    const fg = resolve('var(--text-2)', light), bg = resolve('var(--bg)', light);
    assert.ok(/^#[0-9a-f]{6}$/i.test(fg) && /^#[0-9a-f]{6}$/i.test(bg), `${fg} / ${bg}`);
    assert.ok(ratio(fg, bg) >= 4.5, `${light ? 'light' : 'dark'}: ${ratio(fg, bg).toFixed(2)}:1`);
  }
});

test('criterion 5: in the unfolded posture the slogan is hidden and the footer keeps its 20 px height', (assert)=>{
  const folded = RULES.filter(({r}) => /posture-split/.test(r.selectorText) && /\.app-footer/.test(r.selectorText));
  const hide = folded.find(({r}) => /\.app-footer-slogan$/.test(r.selectorText));
  assert.ok(hide, 'a rule for the slogan in the unfolded footer');
  assert.strictEqual(hide.r.style.getPropertyValue('display'), 'none');
  const box = folded.find(({r}) => /\.app-footer$/.test(r.selectorText));
  assert.ok(box && /^calc\(20px/.test(box.r.style.getPropertyValue('height')), 'the 20 px footer rule');
  // jsdom garbles env() in the CSSOM, so the declaration is checked in the source, unchanged since v3.499.
  assert.strictEqual((CSS.match(/\.app-footer\{\n\s*height:calc\(20px \+ env\(safe-area-inset-bottom, 0px\)\); padding:3px 0 0; text-align:right;/g) || []).length, 1);
});

run();
