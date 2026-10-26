'use strict';
// v3.384 — New app icon (owner: "design a more luxury and more fitting glyph
// ... designed to be able to change with the Home Screen theme"). The mark is
// a bumper plate seen face-on — rim, hub, bore — with one seventh of the rim
// lit as progress (a day of the week; the same ring as Up next), platinum on
// the app's own near-black aura (red top-right, blue left, purple below).
//
// A home-screen web app gets ONE icon on iOS (apple-touch-icon): it cannot
// ship its own dark or tinted variants, so iOS generates them (HIG: "the
// system automatically generates variants you don't provide"). The icon is
// built for that: one centred mark, clean edges, no text, no baked glow, and
// its shapes separated by LUMINANCE, not hue — tinted and grayscale keep
// only luminance, so the lit seventh still reads as a darker band. Checked
// in Chromium against simulated Default, Dark, Tinted and Grayscale tiles.
//
// icon.svg is the 1024 master the PNGs are rendered from.
//
// v3.386 — The header's brand mark (beside "Training Log" on Today) is the
// same plate instead of the old barbell: rim in the text colour, the lit
// seventh in --plate-red, the bore. The hub ring is left out at 14px.
//
// v3.390 (owner: "Make the new symbol a bit bigger and make it act like a
// home button that gets you to the top of the Today tab"). The mark is 20px
// and a <button>: from another tab it goes to Today through showView (which
// lands at the top); already on Today it glides to the top, instantly under
// Reduce Motion. 2026-10-26: the v3.386 test's anchor now matches the button
// (it matched the old <span>); what it checks inside the mark is unchanged.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const { test, run } = makeRunner('test-app-icon.js');

// Width, height and colour type from a PNG's IHDR chunk. Type 2 = RGB (no
// alpha channel at all), 6 = RGBA.
function ihdr(file){
  const b = fs.readFileSync(path.join(__dirname, file));
  assert_png(b, file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), type: b[25] };
}
function assert_png(b, file){ if(b.toString('latin1', 1, 4) !== 'PNG') throw new Error(file + ' is not a PNG'); }

test('every icon the app references is the right size, and every home-screen/app icon is fully opaque', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  const expected = { 'apple-touch-icon.png': 180, 'apple-touch-icon-167.png': 167, 'apple-touch-icon-152.png': 152,
    'icon-192.png': 192, 'icon-512.png': 512, 'icon-512-maskable.png': 512, 'icon-512-monochrome.png': 512 };
  for(const [file, size] of Object.entries(expected)){
    const { w, h, type } = ihdr(file);
    assert.deepStrictEqual([w, h], [size, size], file);
    // iOS fills transparency with black and rounds the corners itself: opaque,
    // square. The monochrome icon is the opposite — Android uses its alpha only.
    assert.strictEqual(type, file.includes('monochrome') ? 6 : 2, `${file}: ${file.includes('monochrome') ? 'alpha carries the mark' : 'no alpha channel'}`);
  }
  assert.ok(html.includes('href="./apple-touch-icon.png"'), 'anchor: still what iOS reads');
  assert.deepStrictEqual(manifest.icons.map(i => i.purpose), ['any', 'any', 'maskable', 'monochrome']);
});

test('the master is the plate: a lit seventh of the rim, cut cleanly from the rest, and no text', (assert)=>{
  const svg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');
  assert.match(svg, /viewBox="0 0 1024 1024"/);
  assert.strictEqual((svg.match(/stroke-width="104"/g) || []).length, 2, 'the rim in two pieces: platinum and the lit seventh');
  assert.match(svg, /stroke="url\(#acc\)"/, 'the lit seventh carries the accent');
  assert.doesNotMatch(svg, /<text|filter=|feGaussianBlur/, 'no text, no baked glow (the system adds its own effects)');
  assert.match(svg, /<rect width="1024" height="1024" fill="url\(#base\)"\/>/, 'full-bleed, opaque background');
});

test('REAL markup (v3.386): the header mark is the plate — rim, lit seventh, bore — not the old barbell', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const marks = html.match(/<button type="button" class="brand-mark" id="brandHome"[^>]*>[\s\S]*?<\/button>/g) || [];
  assert.strictEqual(marks.length, 1, 'anchor: the one header mark');
  assert.match(marks[0], /<path class="brand-mark-lit" d="M10\.00 3\.00 A7 7 0 0 1 15\.47 5\.64"\/>/, 'the lit seventh, from the top');
  assert.match(marks[0], /A7 7 0 1 1 9\.27 3\.04/, 'the rest of the rim, cut from it');
  assert.match(marks[0], /<circle cx="10" cy="10" r="1\.5"/, 'the bore');
  assert.doesNotMatch(marks[0], /<rect/, 'no barbell plates left');
  assert.match(html, /\.brand-mark-lit\{stroke:var\(--plate-red\);\}/);
});

test('REAL markup + CSSOM (v3.390): the mark is a labelled button, 20px, with a 44px tap area and no box of its own', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const doc = new JSDOM(html).window.document;
  const btn = doc.getElementById('brandHome');
  assert.strictEqual(doc.querySelectorAll('.brand-mark').length, 1, 'anchor: one mark');
  assert.strictEqual(btn.tagName, 'BUTTON');
  assert.strictEqual(btn.getAttribute('type'), 'button');
  assert.strictEqual(btn.getAttribute('aria-label'), 'Today, back to top');
  assert.strictEqual(btn.querySelector('svg').getAttribute('aria-hidden'), 'true');
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const { window: cssWin } = new JSDOM(`<style>${CSS}</style>`);
  const declared = (sel, prop) => { let v = ''; for(const sh of cssWin.document.styleSheets) for(const r of sh.cssRules) if(r.selectorText && r.selectorText.split(',').map(x => x.trim()).includes(sel)){ const x = r.style.getPropertyValue(prop); if(x) v = x; } return v; };
  assert.strictEqual(declared('.brand-mark', 'width'), '20px');
  assert.strictEqual(declared('.brand-mark', 'height'), '20px');
  assert.strictEqual(declared('.brand-mark', 'border'), '0px');
  assert.match(declared('.brand-mark', 'background'), /none/);
  assert.strictEqual(declared('.brand-mark::before', 'width'), '44px');
  assert.strictEqual(declared('.brand-mark::before', 'height'), '44px');
});

function homeHarness(onToday, reduce){
  const src = readIndexSource();
  const { window } = runJsdom(`<button id="brandHome"></button><div id="navToday" class="${onToday ? 'active' : ''}"></div>`, `
    window.__calls = [];
    function closeNavMoreOverlay(){ window.__calls.push('close'); }
    function showView(k){ window.__calls.push('show:' + k); }
    window.matchMedia = q => ({ matches: ${reduce ? 'true' : 'false'} && /reduce/.test(q) });
    window.scrollTo = (o) => window.__calls.push('scroll:' + JSON.stringify(o));
  `, [extractFunction(src, 'goHome'), `document.getElementById('brandHome').addEventListener('click', goHome);`]);
  window.document.getElementById('brandHome').click();
  return [...window.__calls]; // copied out of the jsdom realm for deepStrictEqual
}

test('REAL invocation (v3.390): from another tab, a tap goes to Today through showView', (assert)=>{
  assert.deepStrictEqual(homeHarness(false, false), ['close', 'show:today']);
});

test('REAL invocation (v3.390): on Today, a tap glides to the top; instantly under Reduce Motion', (assert)=>{
  assert.deepStrictEqual(homeHarness(true, false), ['close', 'scroll:{"top":0,"left":0,"behavior":"smooth"}']);
  assert.deepStrictEqual(homeHarness(true, true), ['close', 'scroll:{"top":0,"left":0,"behavior":"instant"}']);
});

test('REAL source (v3.390): the button is wired once, to goHome', (assert)=>{
  const src = readIndexSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((src.match(/getElementById\('brandHome'\)\.addEventListener\('click', goHome\)/g) || []).length, 1);
});

run();
