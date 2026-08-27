'use strict';
// Behavioral coverage for a real, pre-existing bug found while adding the
// Signature Blue icon + a proper "monochrome" manifest icon (for iOS 18+/
// Android themed-icon support): manifest.json's icons array pointed at
// icons/icon-192.png, icons/icon-512.png, icons/icon-512-maskable.png — a
// SUBFOLDER that has never existed in this repo. The real files have always
// lived at the repo root. sw.js's own precache list already uses the
// correct root-level paths, and its own v3.60 changelog entry documents
// removing the exact same dead icons/ references from index.html — this
// manifest.json copy was just the one place that got missed at the time.
//
// A browser that actually reads manifest.json for install icons (Chrome/
// Android — iOS reads apple-touch-icon instead, which is why this went
// unnoticed there) would 404 on every one of these and fall back to a
// generic/blank icon. Worth catching structurally, not just visually.
//
// No index.html functions are involved, so this doesn't use the usual
// jsdom-behavioral pattern — it validates the real on-disk manifest.json,
// sw.js's precache list, and the actual PNG files against each other,
// parsing PNG headers directly (no image library needed: width/height/color
// type sit in the IHDR chunk at a fixed offset per the PNG spec) so a
// dimension or transparency mismatch is caught, not just a missing file.
const fs = require('fs');
const path = require('path');
const { makeRunner } = require('./testHelpers.js');

const ROOT = __dirname;
const { test, run } = makeRunner('test-icon-manifest-paths.js');

function readPngHeader(filePath){
  const buf = fs.readFileSync(filePath);
  const sig = buf.subarray(0, 8);
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if(!sig.equals(PNG_SIG)) throw new Error(`${filePath} is not a valid PNG (bad signature)`);
  // IHDR is always the first chunk: 8-byte sig, then [4-byte length][4-byte
  // type 'IHDR'][13-byte data: width(4) height(4) bitDepth(1) colorType(1) ...].
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf.readUInt8(25); // 2=RGB (opaque), 6=RGBA (has alpha)
  return { width, height, colorType };
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

test('manifest.json is valid JSON with a real icons array', (assert)=>{
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest.json must declare at least one icon');
});

test('REAL check: every manifest icon src resolves to a file that actually exists on disk (this is what catches the icons/ subfolder bug)', (assert)=>{
  for(const icon of manifest.icons){
    const resolved = path.join(ROOT, icon.src);
    assert.ok(fs.existsSync(resolved), `manifest.json icon src "${icon.src}" does not exist on disk — must not reference a nonexistent path`);
  }
});

test('sabotage-relevant: no manifest icon src references the dead icons/ subfolder', (assert)=>{
  for(const icon of manifest.icons){
    assert.ok(!icon.src.startsWith('icons/'), `"${icon.src}" still references the removed icons/ subfolder (see sw.js v3.60 changelog — that path has never existed)`);
  }
});

test('REAL check: each manifest icon\'s actual PNG dimensions match its declared "sizes"', (assert)=>{
  for(const icon of manifest.icons){
    const { width, height } = readPngHeader(path.join(ROOT, icon.src));
    assert.strictEqual(`${width}x${height}`, icon.sizes, `${icon.src}'s real dimensions (${width}x${height}) must match its declared sizes ("${icon.sizes}")`);
  }
});

test('the manifest includes a "monochrome" purpose icon, required for iOS 18+/Android to tint the icon intentionally instead of improvising', (assert)=>{
  const mono = manifest.icons.find(i => i.purpose === 'monochrome');
  assert.ok(mono, 'manifest.json must declare an icon with purpose:"monochrome"');
});

test('REAL check: the monochrome icon actually has an alpha channel (color type 6) — a fully opaque one could not be tinted by the OS at all', (assert)=>{
  const mono = manifest.icons.find(i => i.purpose === 'monochrome');
  const { colorType } = readPngHeader(path.join(ROOT, mono.src));
  assert.strictEqual(colorType, 6, `${mono.src} must be RGBA (PNG color type 6), got color type ${colorType} — a monochrome icon needs an alpha channel for the OS to mask/tint against`);
});

test('the "any" and "maskable" icons are fully opaque (no alpha) — apple-touch-icon-style backgrounds must be real pixels, not transparency iOS would render as solid black', (assert)=>{
  for(const icon of manifest.icons){
    if(icon.purpose === 'monochrome') continue;
    const { colorType } = readPngHeader(path.join(ROOT, icon.src));
    assert.strictEqual(colorType, 2, `${icon.src} (purpose "${icon.purpose}") must be opaque RGB (color type 2), got color type ${colorType}`);
  }
});

// --- sw.js's own precache list ---------------------------------------------

const swSrc = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

function extractPrecacheOptional(src){
  const m = /const PRECACHE_OPTIONAL = \[([\s\S]*?)\];/.exec(src);
  if(!m) throw new Error('PRECACHE_OPTIONAL not found in sw.js');
  return m[1].match(/'([^']+)'/g).map(s => s.slice(1, -1));
}

test('REAL check: every file sw.js precaches actually exists on disk', (assert)=>{
  const entries = extractPrecacheOptional(swSrc);
  assert.ok(entries.length > 0, 'PRECACHE_OPTIONAL must not be empty');
  for(const entry of entries){
    const relative = entry.replace(/^\.\//, '');
    assert.ok(fs.existsSync(path.join(ROOT, relative)), `sw.js precaches "${entry}", which does not exist on disk`);
  }
});

test('sw.js precaches the new monochrome icon (not just the pre-existing set)', (assert)=>{
  const entries = extractPrecacheOptional(swSrc);
  assert.ok(entries.includes('./icon-512-monochrome.png'), 'sw.js\'s PRECACHE_OPTIONAL must include the new monochrome icon so it works offline like every other icon file');
});

run();
