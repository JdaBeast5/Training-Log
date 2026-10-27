'use strict';
// Glyphs (owner: "Also fix the glyphs according to our new skills"). The
// skills: no Unicode glyph or emoji standing in for an icon system; icons are
// drawn, one family, one stroke. One increment per version.
//
// v3.421 — The chevron. ‹ › ⌄ ▾ were text characters in ~50 places (rows,
// disclosure toggles, date and month arrows, the tab-rail hint, search hits,
// Settings rows), each a different shape at its own font size and weight. Now
// one drawn chevron (ICONS.chevron / chevronLeft) with a non-scaling 1.6px
// line; the two CSS ones are drawn with borders at the same line.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-glyphs.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// Comments may still name the old glyphs; nothing that renders may.
const uncommented = html.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
const [ICONS, chevronOut, leftOut] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')],
  "__capture.push(ICONS, icon('chevron'), icon('chevronLeft'));");

test('REAL source (v3.421): no ‹ › ⌄ ▾ glyph is rendered anywhere — markup, CSS content, or JS strings', (assert)=>{
  const hits = uncommented.split('\n').filter(l => /[‹›⌄▾]|\\u203[9a]|&[lr]saquo;/.test(l));
  assert.deepStrictEqual(hits, []);
  assert.ok(/[‹›]/.test(html), 'anchor: the comments that explain the change are still there (the strip is not eating everything)');
});

test('REAL ICONS (v3.421): one chevron, both directions, same line — round caps, a 1.6px stroke that does not scale with size', (assert)=>{
  for(const name of ['chevron', 'chevronLeft']){
    const doc = new JSDOM(ICONS[name]).window.document;
    const svg = doc.querySelector('svg');
    assert.strictEqual(svg.getAttribute('stroke-width'), '1.6', name);
    assert.strictEqual(svg.getAttribute('stroke-linecap'), 'round', name);
    assert.strictEqual(doc.querySelector('polyline').getAttribute('vector-effect'), 'non-scaling-stroke', name);
  }
  const pts = n => new JSDOM(ICONS[n]).window.document.querySelector('polyline').getAttribute('points').split(/\s+/).map(Number);
  const [r, l] = [pts('chevron'), pts('chevronLeft')];
  assert.deepStrictEqual(l.filter((_, i) => i % 2 === 0).map(x => 24 - x), r.filter((_, i) => i % 2 === 0), 'the left one is the right one mirrored');
});

test('REAL markup (v3.421): the static arrows embed exactly what icon() draws; buttons keep their names', (assert)=>{
  const doc = new JSDOM(html).window.document;
  const outer = s => new JSDOM(s).window.document.querySelector('svg').outerHTML;
  const right = outer(chevronOut), left = outer(leftOut);
  for(const id of ['logDateNext', 'calendarNextMonth', 'historyHeatmapNextMonth', 'navRailChevron', 'programChevron', 'mySupplementsChevron', 'historyLogChevron']){
    const el = doc.getElementById(id);
    assert.strictEqual(el.querySelector('svg').outerHTML, right, id);
    assert.strictEqual(el.textContent.trim(), '', id + ': no text glyph');
  }
  for(const id of ['logDatePrev', 'calendarPrevMonth', 'historyHeatmapPrevMonth']){
    assert.strictEqual(doc.getElementById(id).querySelector('svg').outerHTML, left, id);
    assert.match(doc.getElementById(id).getAttribute('aria-label'), /^Previous (day|month)$/, id);
  }
  const all = [...doc.querySelectorAll('.ex-chevron, .chev, .settings-jump span:last-child')];
  assert.ok(all.length >= 20, 'anchor: the real static chevrons');
  for(const el of all) assert.strictEqual(el.querySelector('svg') && el.querySelector('svg').outerHTML, right);
  for(const el of doc.querySelectorAll('.analysis-group-header-chevron')) assert.strictEqual(el.innerHTML, '', 'drawn by its own borders (v3.312), nothing left inside');
});

test('REAL invocation (v3.421): templates draw it too — a Learn source row toggle', (assert)=>{
  const [row] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), 'var sourcePanelSeq = 0;',
    extractFunction(src, 'buildSourceCitesHtml'), extractFunction(src, 'buildSourceRowHtml')],
    "__capture.push(buildSourceRowHtml('Strength', {school:'x', cites:[{text:'A · B, 2020'}]}, 'Approach', false));");
  const chev = new JSDOM(row).window.document.querySelector('.program-basis-toggle .chev');
  assert.strictEqual(chev.textContent, '');
  assert.strictEqual(chev.querySelector('polyline').getAttribute('points'), '9 5.5 15.5 12 9 18.5');
});

const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
test('REAL CSS (v3.421): Show more and the program picker draw their chevrons with a 1.6px border, not a character', (assert)=>{
  // jsdom has no pseudo-element computed style; read as declared.
  assert.match(CSS, /\.show-more-btn::after\{content:'';[^}]*border-right:1\.6px solid currentColor/);
  assert.match(CSS, /\.program-select-wrap::after\{[^}]*content:'';[^}]*border-right:1\.6px solid var\(--plate-blue\)/);
  // A row chevron's svg is its whole box, so the row's align-items:center centres the line (the masterclass index sat high).
  const { window } = new JSDOM(`<style>${CSS}</style><span class="ex-chevron"><svg id="a"></svg></span><span class="chev"><svg id="b"></svg></span>`);
  for(const id of ['a', 'b']) assert.strictEqual(window.getComputedStyle(window.document.getElementById(id)).display, 'block', id);
});

run();
