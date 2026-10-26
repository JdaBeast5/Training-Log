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
const fs = require('fs');
const path = require('path');
const { makeRunner } = require('./testHelpers.js');
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
  const marks = html.match(/<span class="brand-mark">[\s\S]*?<\/span>/g) || [];
  assert.strictEqual(marks.length, 1, 'anchor: the one header mark');
  assert.match(marks[0], /<path class="brand-mark-lit" d="M10\.00 3\.00 A7 7 0 0 1 15\.47 5\.64"\/>/, 'the lit seventh, from the top');
  assert.match(marks[0], /A7 7 0 1 1 9\.27 3\.04/, 'the rest of the rim, cut from it');
  assert.match(marks[0], /<circle cx="10" cy="10" r="1\.5"/, 'the bore');
  assert.doesNotMatch(marks[0], /<rect/, 'no barbell plates left');
  assert.match(html, /\.brand-mark-lit\{stroke:var\(--plate-red\);\}/);
});

run();
