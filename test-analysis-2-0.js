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

run();
