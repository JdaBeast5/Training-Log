'use strict';
// v3.385 — Launch (owner: "design ... initial launching animation, to match
// the highly sophisticated and dynamic design of the app ... auto adjust to
// light mode dark mode, gray scale, etc."). Once per cold launch the app's
// mark draws itself — rim clockwise from the cut, hub, the lit seventh, the
// bore — then dissolves into the app. Dark: the app's own background and
// aura, so the hand-off is seamless. Light: porcelain, graphite mark.
// Increase Contrast: no aura. Reduce Motion: the finished mark, cross-fade.
// A tap skips it; a reload in the same session (pull to refresh) skips it;
// it never holds the app for more than 4s.
//
// Confirmed in Chromium at 390x844 (frames at 60-1500ms) in dark and light
// with motion, and with Reduce Motion: drawn by ~1s, gone by 1.5s (0.3s
// reduced), removed from the DOM, and not replayed on reload.
//
// 2026-10-26 (v3.387, owner: "make the starting animation more smooth"):
// the mark no longer DRAWS (stroke-dashoffset runs on the main thread and
// stuttered while the app's large script loaded; its phases also had
// different speeds and a bouncing bore). It is four stacked layers — rim,
// lit seventh, hub, bore — moved with transform and opacity only, which are
// composited, on one gentle ease-out: the rim turns in, the lit seventh
// orbits round and settles, the hub and bore ease in. No overshoot. Frames
// every 100ms in Chromium show even, decaying motion, settled by ~0.9s.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { test, run } = makeRunner('test-launch.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const bodyStart = html.slice(html.indexOf('<body>'), html.indexOf('<body>') + 6000);
const script = bodyStart.match(/<script>\s*(\(function launch\(\)\{[\s\S]*?\}\)\(\);)\s*<\/script>/)[1];
const markup = bodyStart.match(/<div class="launch" id="launch"[\s\S]*?<\/svg>\s*<\/div>\s*<\/div>/)[0];
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

function boot({ played = false, reduce = false } = {}){
  const dom = new JSDOM(`<!doctype html><body>${markup}</body>`, { runScripts: 'outside-only', url: 'https://example.test/' });
  const w = dom.window;
  if(played) w.sessionStorage.setItem('launch-played', '1');
  w.matchMedia = q => ({ matches: reduce && /reduce/.test(q) });
  w.eval(script);
  return w;
}
const wait = ms => new Promise(r => setTimeout(r, ms));

test('REAL markup: the launch is the first thing in <body>, hidden from assistive tech, and draws the icon\'s geometry', (assert)=>{
  assert.match(bodyStart, /^<body>\s*<!--[\s\S]*?-->\s*<div class="launch" id="launch" aria-hidden="true">/);
  const layers = [...markup.matchAll(/<svg class="launch-layer launch-(\w+)" viewBox="0 0 1024 1024" aria-hidden="true">/g)].map(m => m[1]);
  assert.deepStrictEqual(layers, ['rim', 'lit', 'hub', 'bore'], 'v3.387: four stacked layers, each hidden from assistive tech');
  const icon = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');
  for(const d of [...markup.matchAll(/ d="([^"]+)"/g)].map(m => m[1])) assert.ok(icon.includes(d), `same arc as icon.svg: ${d}`);
});

test('REAL invocation: a cold launch plays, a tap skips it, and it removes itself', async (assert)=>{
  const w = boot();
  const el = w.document.getElementById('launch');
  assert.ok(el && !el.classList.contains('is-out'), 'playing');
  assert.strictEqual(w.sessionStorage.getItem('launch-played'), '1', 'remembered for this session');
  el.dispatchEvent(new w.Event('pointerdown'));
  assert.ok(el.classList.contains('is-out'), 'a tap starts the fade at once');
  await wait(650); // v3.387: a 0.55s fade, removed at 600ms
  assert.strictEqual(w.document.getElementById('launch'), null, 'and it leaves the page');
});

test('REAL invocation: a reload in the same session skips it entirely', (assert)=>{
  const w = boot({ played: true });
  assert.strictEqual(w.document.getElementById('launch'), null);
});

test('REAL invocation: without a tap it fades on its own once drawn — sooner under Reduce Motion', async (assert)=>{
  const reduced = boot({ reduce: true });
  await wait(300);
  assert.ok(reduced.document.getElementById('launch').classList.contains('is-out'), 'Reduce Motion: out by ~250ms');
  const full = boot();
  await wait(300);
  assert.ok(!full.document.getElementById('launch').classList.contains('is-out'), 'full motion: still drawing at 300ms');
  await wait(1150); // v3.387: holds 1.35s so the settle finishes first
  assert.ok(!full.document.getElementById('launch') || full.document.getElementById('launch').classList.contains('is-out'), 'full motion: out by ~1.35s');
  assert.match(script, /setTimeout\(finish, 4000\)/, 'never holds the app longer than 4s');
});

test('REAL CSS: dark uses the app\'s own background; light, Increase Contrast and Reduce Motion each have their branch', (assert)=>{
  assert.match(CSS, /\.launch\{[^}]*background:var\(--aura\), var\(--bg\)/);
  assert.match(CSS, /@media \(prefers-color-scheme: light\)\{\s*\.launch\{[^}]*#F3F0EA[^}]*--launch-ink:#1B1A20/);
  assert.match(CSS, /@media \(prefers-contrast: more\)\{\s*\.launch\{background:var\(--bg\);\}/);
  const reduce = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce){\n    .launch-layer'));
  assert.match(reduce, /\.launch-layer\{opacity:1; transform:none; animation:none;\}/, 'the mark is shown finished, not animated');
  assert.match(CSS, /\.launch\{[^}]*z-index:2147483000/, 'above everything, including the profile picker');
});

test('REAL CSS (v3.387): the launch animates transform and opacity only, on one gentle ease-out, with no overshoot', (assert)=>{
  // 2026-10-28 (v3.477): the app's own light token block now comes first in
  // the file, so the slice ends at the launch's light block, after .launch{.
  const launchStart = CSS.indexOf('.launch{');
  const launchCss = CSS.slice(launchStart, CSS.indexOf('@media (prefers-color-scheme: light)', launchStart));
  assert.doesNotMatch(launchCss, /stroke-dash/, 'nothing is drawn with stroke dashes any more');
  const frames = CSS.match(/@keyframes launch\w+\{[^}]*\}\}/g) || [];
  assert.deepStrictEqual(frames, ['@keyframes launchSettle{to{opacity:1; transform:none;}}'], 'one keyframe, compositor-friendly properties only');
  const anims = [...launchCss.matchAll(/\.launch-(rim|lit|hub|bore)\{transform:([^;]+); animation:launchSettle ([\d.]+)s (cubic-bezier\([^)]+\))/g)];
  assert.strictEqual(anims.length, 4, 'anchor: all four layers');
  for(const a of anims){
    assert.strictEqual(a[4], 'cubic-bezier(.33,1,.68,1)', `${a[1]}: the same gentle ease-out`);
    for(const n of a[4].match(/[\d.]+/g).map(Number)) assert.ok(n <= 1, `${a[1]}: no control point past 1, so no overshoot`);
  }
  assert.match(launchCss, /\.launch-layer\{[^}]*will-change:transform, opacity/, 'each layer is promoted to its own compositing layer');
});

run();
