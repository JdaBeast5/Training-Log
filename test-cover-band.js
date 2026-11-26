'use strict';
// v3.675 (UX-67, owner A 2026-11-25; the usability test's Friction #4): Log
// stays in one place. "Log set" moved 278 px during a session. The cover is
// now a column that fills the first screen, and its last row is the action
// band (Log and adjust, or while resting +30 s and Skip rest): the lines that
// come and go sit above it and the free space between, so they move the
// numeral, never the band. CSS only: the markup and every listener are as
// they were (test-tap-counts.js unchanged).
//
// Real CSSOM: the rules are read from index.html's stylesheet through jsdom.
// The positions are PR evidence from Chromium (jsdom has no layout): at
// 402 × 874, dark and light, Log's centre is y = 764 in the plain, warm-up,
// superset, first-time and drop-offer states, and Skip rest's is 764 while
// resting; at 320 × 568 the band is on the first screen.
//
// Sabotage: remove margin-top:auto from .cover-log and the band rule fails
// (in Chromium, Log's centre spreads again).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-cover-band.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const top = [], media = [];
(function walk(list, m){ for(const r of list){ if(r.selectorText) (m ? media : top).push({sel: r.selectorText, style: r.style, media: m}); else if(r.cssRules) walk(r.cssRules, r.media ? r.media.mediaText : m); } })(new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0].cssRules, '');
const get = (rules, sel, prop) => { const r = [...rules].reverse().find(x => x.sel.split(',').map(s => s.trim()).includes(sel) && x.style.getPropertyValue(prop)); return r ? r.style.getPropertyValue(prop) : ''; };

test('the cover is a column that fills the first screen', (assert)=>{
  assert.strictEqual(get(top, '.cover:not([hidden])', 'display'), 'flex');
  assert.strictEqual(get(top, '.cover:not([hidden])', 'flex-direction'), 'column');
  assert.match(get(top, '.cover:not([hidden])', 'min-height'), /100svh/);
  assert.ok(['none', '0 0 auto'].includes(get(top, '.cover > *', 'flex')), 'lines keep their height (flex:none; jsdom reports 0 0 auto)');
});

test('the band: the Log row is last, pushed to the bottom (margin-top:auto); chips, the adjust fields and the caution sit above it', (assert)=>{
  assert.strictEqual(get(top, '.cover-log', 'margin-top'), 'auto');
  const logOrder = Number(get(top, '.cover-log', 'order'));
  for(const sel of ['.cover-chips', '.cover-fields-wrap', '.cover-caution'])
    assert.ok(Number(get(top, sel, 'order')) < logOrder, sel + ' above the band');
  assert.ok(logOrder > 0, 'after every unordered line (hint, cheer, Then, numeral, plates, drop, warm-up)');
});

test('while resting, #coverRest\'s children join the column and +30 s / Skip rest take the band\'s place, at Log\'s height', (assert)=>{
  assert.strictEqual(get(top, '.cover.is-resting .cover-rest:not([hidden])', 'display'), 'contents');
  assert.ok(Number(get(top, '.cover.is-resting .cover-rest-actions', 'order')) > Number(get(top, '.cover-log', 'order')), 'the rest buttons are last');
  assert.strictEqual(get(top, '.cover.is-resting .cover-rest-btn', 'min-height'), get(top, '.cover .cover-go', 'min-height'), 'the same height as Log, so the same centre');
});

test('on a short screen the chips go back under the band, so Log stays on the first screen', (assert)=>{
  const short = media.filter(r => /max-height:\s*700px/.test(r.media));
  assert.ok(Number(get(short, '.cover-chips', 'order')) > Number(get(top, '.cover-log', 'order')));
});

test('no listener moved: the band\'s controls are the same elements, once each', (assert)=>{
  for(const id of ['upNextLog', 'upNextAdjust', 'coverRestAdd', 'coverRestSkip', 'upNextChips'])
    assert.strictEqual(html.split(`id="${id}"`).length, 2, id);
  assert.ok(html.indexOf('id="coverRestSkip"') < html.indexOf('id="upNextLog"'), 'markup order unchanged (rest block before the Log row)');
});

run();
