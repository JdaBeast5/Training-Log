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

// v3.422 — Ticks and crosses. A status message already says Saved, Logged or
// Added; the ✓ after it was a glyph standing in for an icon. It is gone, and
// the word carries it. The one place the tick IS the message (a set row's
// "saved" flash, no word beside it) draws ICONS.check. The ✕ close buttons
// (rest timer, coach chat, Care's stop-resting) draw ICONS.close, the same
// 1.6px line as the chevron.
test('REAL source (v3.422): no ✓ or ✕ is rendered anywhere — status words carry it, marks are drawn', (assert)=>{
  const hits = uncommented.split('\n').filter(l => /[✓✕]/.test(l));
  assert.deepStrictEqual(hits, []);
  assert.ok(/✓/.test(html) && /✕/.test(html), 'anchor: comments naming the old glyphs survive the strip');
});

test('REAL ICONS (v3.422): the close mark is the chevron\'s line — 1.6px, round, non-scaling', (assert)=>{
  const doc = new JSDOM(ICONS.close).window.document;
  assert.strictEqual(doc.querySelector('svg').getAttribute('stroke-width'), '1.6');
  assert.strictEqual(doc.querySelector('svg').getAttribute('stroke-linecap'), 'round');
  assert.strictEqual(doc.querySelector('path').getAttribute('vector-effect'), 'non-scaling-stroke');
});

test('REAL markup + template (v3.422): the close buttons draw ICONS.close and keep their names', (assert)=>{
  const [closeOut] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')], "__capture.push(icon('close'));");
  const outer = s => new JSDOM(s).window.document.querySelector('svg').outerHTML;
  const doc = new JSDOM(html).window.document;
  for(const [id, name] of [['restTimerClose', 'Close rest timer'], ['coachFabClose', 'Close coach chat']]){
    const b = doc.getElementById(id);
    assert.strictEqual(b.getAttribute('aria-label'), name);
    assert.strictEqual(b.textContent.trim(), '', id + ': no glyph');
    assert.strictEqual(b.querySelector('svg').outerHTML, outer(closeOut), id);
  }
  // Care's chip: the real template line, evaluated.
  const line = src.split('\n').find(l => l.includes('class="resting-chip"'));
  const [chip] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')],
    "const r = 'Knee'; __capture.push(`" + line.trim() + "`);");
  const clear = new JSDOM(chip).window.document.querySelector('.clear-resting');
  assert.strictEqual(clear.getAttribute('aria-label'), 'Stop resting Knee');
  assert.strictEqual(clear.querySelector('svg').outerHTML, outer(closeOut));
});

test('REAL source (v3.422): a saved set flashes the drawn check, and clears it by state, not by comparing a glyph', (assert)=>{
  const fn = extractFunction(src, 'wireSetRow');
  assert.strictEqual((fn.match(/statusEl\.innerHTML = icon\('check'\);/g) || []).length, 1);
  assert.match(fn, /if\(statusEl\.classList\.contains\('set-status-saved'\)\) statusEl\.textContent='';/);
});

// v3.423 — Warnings. ⚠/⚠️ prefixed ~30 warnings. Where the warning is markup
// (Analysis verdicts, the avoid-list flag, Care's urgent banner, readiness)
// it draws ICONS.warning, the same way the "good" verdicts already draw
// ICONS.check. Where it is plain text (program descriptions, a banner title,
// textContent notices) the words carry it and the glyph is gone.
test('REAL source (v3.423): no ⚠ is rendered anywhere', (assert)=>{
  assert.deepStrictEqual(uncommented.split('\n').filter(l => /⚠/.test(l)), []);
});

const ICON_CHUNKS = [extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')];
const isWarning = el => !!el && el.innerHTML === new JSDOM(ICONS.warning).window.document.querySelector('svg').innerHTML;
test('REAL invocation (v3.423): the overreaching verdict and a readiness warning lead with the drawn warning; a readiness note has no mark', (assert)=>{
  const [fit, warn, note] = runSandbox([...ICON_CHUNKS, extractConst(src, 'PROGRAM_FIT_MIN_SAMPLE'), extractFunction(src, 'buildProgramFitInsight'), extractFunction(src, 'formatReadiness')],
    `__capture.push(buildProgramFitInsight({increase:0, decrease:2, deload:1, hold:1, total:4}),
      formatReadiness({level:'caution', flags:[{text:'short sleep'}]}), formatReadiness({level:'note', flags:[{text:'short sleep'}]}));`);
  const fitDoc = new JSDOM(fit.text).window.document;
  assert.ok(isWarning(fitDoc.body.firstElementChild), 'the verdict opens with ICONS.warning');
  assert.ok(isWarning(new JSDOM(warn.icon).window.document.querySelector('svg')));
  assert.strictEqual(note.icon, '');
});

test('REAL invocation (v3.423): Care\'s urgent banner draws the warning inside its bold line', (assert)=>{
  const html = runSandbox([...ICON_CHUNKS, 'var exerciseInfo = {};', extractConst(src, 'SENSATION_LABELS'), extractConst(src, 'RED_FLAG_SENSATIONS'),
    extractConst(src, 'REGION_RELIEF'), extractFunction(src, 'buildReliefHtml'), extractFunction(src, 'buildCareResultHtml')],
    "__capture.push(buildCareResultHtml('numb', 'Knee', 8));")[0];
  const b = new JSDOM(html).window.document.querySelector('.care-banner-urgent b');
  assert.ok(isWarning(b.querySelector('svg')));
  assert.match(b.textContent.trim(), /^Please get this looked at/);
});

run();
