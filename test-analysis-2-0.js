'use strict';
// Analysis tab 2.0 (owner: "Now go through Analysis tab same thing" — the
// Log tab 2.0 pass, with the same skills). One increment per version.
//
// v3.435 — Chart footers. Every sparkline (Nutrition/Sleep/Water through
// renderDayValueTrend, Weight, Average RPE, Cardio, and the exercise history
// sheet's estimated 1RM) printed start · summary · end on one flex line in
// mono. The summary squeezed the two end values until they wrapped
// ("1560 / cal"). Now one shared class: the ends sit under the chart's two
// edges, the summary has its own line in the text face. Three sites used
// .rpe-trend-labels and two repeated the same rule inline.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-analysis-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

test('REAL source (v3.435): one footer class for every sparkline; no inline copy, no old class', (assert)=>{
  assert.strictEqual((src.match(/<div class="trend-labels">/g) || []).length, 5, 'Day-value, Weight, RPE, Cardio, exercise 1RM');
  assert.doesNotMatch(src, /class="rpe-trend-labels"|\.rpe-trend-labels\{/);
  assert.doesNotMatch(src, /<div style="display:flex; justify-content:space-between; margin-top:8px; font-family:var\(--font-mono\)/);
});

test('REAL CSSOM (v3.435): the ends share the first line, the summary takes its own in the text face', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div class="trend-labels" id="f"><span id="a">1560 cal</span><span id="m">Avg</span><span id="z">1560 cal</span></div>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('f').display, 'grid');
  assert.strictEqual(cs('a').whiteSpace, 'nowrap');
  assert.strictEqual(cs('z').whiteSpace, 'nowrap');
  assert.strictEqual(cs('m').fontFamily, 'var(--font-sans)');
  // jsdom does not resolve grid areas; read as declared.
  assert.match(CSS, /\.trend-labels\{[^}]*grid-template-areas:"start end" "sum sum"/);
});

test('REAL invocation (v3.435): a day-value trend reads "Avg … · target … · N days"', (assert)=>{
  const { window } = runJsdom('<div id="c"></div>', 'window.filterDatesByRange = d => d;',
    [extractFunction(src, 'renderDayValueTrend'),
     `renderDayValueTrend('c', {'2026-10-01':1500, '2026-10-02':1700, '2026-10-03':1600}, {label:'calorie', color:'red', target:2000, rangeDays:null, formatValue:v=>Math.round(v)+' cal'});`]);
  const spans = [...window.document.querySelectorAll('#c .trend-labels > span')].map(s => s.textContent);
  assert.deepStrictEqual(spans, ['1500 cal', 'Avg 1600 cal · target 2000 cal · 3 days', '1600 cal']);
});

// v3.436 — The target on the chart. Nutrition, Sleep and Water named their
// target only in the footer text. A dashed reference line now crosses the
// chart at the target, and the target joins the scale so the line is always
// on the chart — 29% under target reads as a gap, not just a number.
function dayChart(target){
  const { window } = runJsdom('<div id="c"></div>', 'window.filterDatesByRange = d => d;',
    [extractFunction(src, 'renderDayValueTrend'),
     `renderDayValueTrend('c', {'2026-10-01':1500, '2026-10-02':1700, '2026-10-03':1600}, {label:'calorie', color:'red', ${target ? `target:${target},` : ''} rangeDays:null, formatValue:v=>Math.round(v)+' cal'});`]);
  return window.document;
}
test('REAL invocation (v3.436): a dashed target line at the target\'s height, inside the chart even when the data never reaches it', (assert)=>{
  const doc = dayChart(2000);
  const line = doc.querySelector('#c svg line.trend-target');
  assert.ok(line);
  assert.strictEqual(Number(line.getAttribute('y1')), 8, 'the highest value on the scale sits at the top padding');
  const ys = doc.querySelector('#c polyline').getAttribute('points').split(' ').map(p => Number(p.split(',')[1]));
  assert.ok(ys.every(y => y > 8), 'all the data sits below the target');
});

test('REAL invocation (v3.436): no target (Care\'s pain trend), no line, scale unchanged', (assert)=>{
  const doc = dayChart(null);
  assert.strictEqual(doc.querySelector('#c line.trend-target'), null);
  const ys = doc.querySelector('#c polyline').getAttribute('points').split(' ').map(p => Number(p.split(',')[1]));
  assert.strictEqual(Math.min(...ys), 8, 'the highest value still fills the chart');
});

test('REAL CSS (v3.436): the target line is quiet — muted, dashed, a fixed hairline', (assert)=>{
  assert.match(CSS, /\.trend-target\{stroke:var\(--text-muted\); stroke-width:1\.2; stroke-dasharray:5 5;[^}]*vector-effect:non-scaling-stroke;\}/);
});

// v3.437 — Fewer boxes. Every Analysis chart ended in a tinted, glowing box,
// including plain neutral notes ("Averaging 89% of your hydration target").
// With a box under everything the box meant nothing. On Analysis a neutral
// note is now a plain sentence; good and warning keep their tint.
test('REAL CSSOM (v3.437): a neutral note on Analysis has no box; good and warning keep theirs; neutral elsewhere is untouched', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div id="analysisView"><div class="goal-feedback-neutral" id="n">x</div><div class="goal-feedback-warn" id="w">x</div><div class="goal-feedback-good" id="g">x</div></div><div id="logView"><div class="goal-feedback-neutral" id="o">x</div></div>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('n').paddingLeft, '0px');
  assert.strictEqual(cs('n').boxShadow, 'none');
  assert.strictEqual(cs('w').paddingLeft, '12px', 'a warning keeps its box');
  assert.strictEqual(cs('g').paddingLeft, '12px', 'a good verdict keeps its box');
  assert.strictEqual(cs('o').paddingLeft, '12px', 'outside Analysis the neutral box stays');
  assert.match(CSS, /#analysisView \.goal-feedback-neutral\{background:none; border:none;/);
});

// v3.438 — Week Over Week as a table. Every row repeated "Workouts / Avg Cal /
// Avg Pro / Weight / Change" under its five numbers, and its "Oct 26 –
// Nov 1" date wrapped to two lines. The column names now sit once in a
// header row; in the rows they stay for screen readers only; each row names
// its week by its start date.
test('REAL invocation (v3.438): a week is named by its start date, on one line', (assert)=>{
  const { window } = runJsdom('', '', [extractFunction(src, 'parseDateKey'), extractFunction(src, 'formatDate'), extractFunction(src, 'fmtWeekLabel'),
    "window.__l = fmtWeekLabel('2026-10-26');"]);
  assert.strictEqual(window.__l, 'Oct 26');
});

test('REAL source + CSSOM (v3.438): one header row; row labels visually hidden, header labels shown', (assert)=>{
  const fn = extractFunction(src, 'renderAnalysis');
  assert.match(fn, /tableEl\.innerHTML = weekHeadHtml \+ rows\.map/);
  assert.match(fn, /<div class="week-row week-head" aria-hidden="true">/);
  for(const l of ['Week of', 'Workouts', 'Avg cal', 'Protein', 'Weight', 'Change']) assert.ok(fn.includes(`<div class="w-label">${l}</div>`), l);
  const { window } = new JSDOM(`<style>${CSS}</style><div class="week-row week-head"><div class="week-col"><div class="w-label" id="h">Workouts</div></div></div>
    <div class="week-row"><div class="week-col"><div class="w-val">3</div><div class="w-label" id="r">Workouts</div></div></div>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('r').position, 'absolute');
  assert.strictEqual(cs('r').width, '1px');
  assert.notStrictEqual(cs('h').position, 'absolute', 'the header shows its labels');
});

// v3.439 — Text in the text face, no empty indent. Weekly Volume's notes ("6
// sets/wk — below the typical 10-20 range for growth") were sentences set
// in mono at 11px; they take the text face. Strength Context's lift rows
// each carried an empty icon column (their '•' went in v3.426), indenting
// the list against the card.
test('REAL CSSOM (v3.439): Weekly Volume\'s notes are in the text face at a readable size', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div class="vol-landmark" id="v">6 sets/wk</div>`);
  const cs = window.getComputedStyle(window.document.getElementById('v'));
  assert.strictEqual(cs.fontFamily, 'var(--font-sans)');
  assert.strictEqual(cs.fontSize, '12.5px');
});

test('REAL source (v3.439): a Strength Context lift row has no empty icon column; the ratio rows keep theirs', (assert)=>{
  const fn = extractFunction(src, 'renderStrengthContext');
  assert.doesNotMatch(fn, /<span class="diag-icon"><\/span>/);
  assert.match(fn, /return `<div class="diag-row diag-good"><span><b>\$\{escapeHtml\(l\.label\)\}<\/b>`/);
  assert.match(fn, /<span class="diag-icon">\$\{b\.inRange \? icon\('check'\) : icon\('info'\)\}<\/span>/, 'the ratio rows still mark in or out of range');
});

// v3.440 — "Print analysis snapshot" took the top slot, under the jump rail
// and above every card. It is an occasional action; it now follows the last
// card.
test('REAL markup (v3.440): the print button is the last thing on Analysis, after every card', (assert)=>{
  const view = doc.getElementById('analysisView');
  const btn = doc.getElementById('analysisExportBtn');
  assert.ok(view.contains(btn));
  assert.strictEqual(view.lastElementChild, btn);
  const cards = view.querySelectorAll('.card');
  assert.strictEqual(cards.length, 19, 'anchor: the real 19 Analysis cards');
  for(const c of cards) assert.ok(c.compareDocumentPosition(btn) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING, (c.id || 'a card') + ' comes first');
  assert.strictEqual(btn.classList.contains('card'), false, 'not swept up by group collapse');
});

run();
