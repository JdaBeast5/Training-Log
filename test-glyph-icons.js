'use strict';
// The last typed glyphs the post-2.0 audit flagged as P3s, each replaced with
// a drawn icon in the app's own conventions. One increment per glyph.
//
// v3.358 — "▶ Watch form video": the ▶ is now a mask-drawn play mark on
// .ex-video-link::before (the .fi-duplicate::after convention), and the link
// moved from --plate-blue (4.39:1 on --surface2 at 12px) to #7A93FF (5.66:1),
// with a 44px minimum height for the tap target.
// v3.359 — The drop-set button's ⤵ is now a mask-drawn step-down arrow on
// .set-drop-btn::before; ::after stays its 44px hit area.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-glyph-icons.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}
function lum(hex){
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rootVar = name => (src.match(new RegExp(`${name}:(#[0-9A-Fa-f]{6});`)) || [])[1];

test('sabotage anchor (v3.358): all 5 form-video links lost the typed ▶, none were missed or duplicated', (assert)=>{
  assert.strictEqual((src.match(/rel="noopener">Watch form video<\/a>/g) || []).length, 5);
  assert.strictEqual((src.match(/▶ Watch form video/g) || []).length, 0);
});

test('REAL CSSOM (v3.358): the link draws its play mark, clears 4.5:1 on --surface2, and is a 44px target', (assert)=>{
  const rgb = declared('.ex-video-link', 'color').match(/\d+/g).map(Number);
  const color = '#' + rgb.map(n => n.toString(16).padStart(2, '0')).join('');
  const surface2 = rootVar('--surface2');
  assert.ok(surface2, 'anchor: --surface2 resolved from the real :root');
  assert.ok(contrast(color, surface2) >= 4.5, `${color} on ${surface2} must be >= 4.5:1`);
  assert.ok(contrast(rootVar('--plate-blue'), surface2) < 4.5, 'anchor: the old --plate-blue really failed here, so this test can catch a revert');
  assert.strictEqual(declared('.ex-video-link', 'min-height'), '44px');
  assert.strictEqual(declared('.ex-video-link::before', 'background'), 'currentcolor');
  assert.match(declared('.ex-video-link::before', 'mask-image') || declared('.ex-video-link::before', '-webkit-mask-image'), /data:image\/svg\+xml/);
});

test('REAL invocation (v3.358): a rendered masterclass link reads just "Watch form video"', (assert)=>{
  const DETAIL = ['POSE_DETAILS', 'SWIM_STROKE_DETAILS', 'CLIMB_TECHNIQUE_DETAILS', 'WATERSPORTS_TECHNIQUE_DETAILS', 'COMBAT_TECHNIQUE_DETAILS', 'GRAPPLE_TECHNIQUE_DETAILS', 'OLY_TECHNIQUE_DETAILS', 'STRENGTH_TECHNIQUE_DETAILS', 'RUNNING_TECHNIQUE_DETAILS', 'HYROX_TECHNIQUE_DETAILS', 'PILATES_TECHNIQUE_DETAILS', 'YOGA_TECHNIQUE_DETAILS', 'CALISTHENICS_TECHNIQUE_DETAILS', 'CYCLING_TECHNIQUE_DETAILS'];
  const chunks = [...DETAIL.map(n => extractConst(src, n)), extractConst(src, 'CATEGORY_ICONS'), extractConst(src, 'POSING_CLASSES'), extractConst(src, 'POSE_ICONS'),
    extractConst(src, 'MASTERCLASS_LIBRARY'), extractFunction(src, 'renderMasterclassTechniques'), `renderMasterclassTechniques('posingCard');`];
  const { document } = runJsdom('<div id="posingClassList"></div>', '', chunks);
  const links = document.querySelectorAll('.ex-video-link');
  assert.ok(links.length > 5, 'anchor: real poses rendered');
  for(const a of links) assert.strictEqual(a.textContent, 'Watch form video');
});

test('sabotage anchor (v3.359): both drop-set button templates are empty, no ⤵ left in code', (assert)=>{
  const btns = [...src.matchAll(/<button type="button" class="set-drop-btn[^>]*>([^<]*)<\/button>/g)];
  assert.strictEqual(btns.length, 2, 'anchor: renderWorkout and the add-set path');
  for(const m of btns) assert.strictEqual(m[1], '');
  assert.strictEqual((src.match(/\\u2935/g) || []).length, 0);
});

test('REAL CSSOM (v3.359): ::before draws the arrow, ::after is still the 44px hit area', (assert)=>{
  assert.strictEqual(declared('.set-drop-btn::before', 'background'), 'currentcolor');
  assert.match(declared('.set-drop-btn::before', 'mask-image') || declared('.set-drop-btn::before', '-webkit-mask-image'), /data:image\/svg\+xml/);
  assert.strictEqual(declared('.set-drop-btn::before', 'width'), '14px');
  assert.strictEqual(declared('.set-drop-btn::after', 'height'), '44px');
  assert.strictEqual(declared('.set-drop-btn', 'display'), 'flex', 'centres the glyph');
});

run();
