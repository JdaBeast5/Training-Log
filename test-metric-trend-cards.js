'use strict';
// Behavioral coverage for the Analysis tab's per-metric trend cards — Phase
// B "Tier 3" backfill ("per-metric trend cards" was named explicitly
// alongside water/weight/BP/glucose CRUD). Covers the real render functions
// for Weight Trend (renderSparkline), Water Trend (renderWaterTrend), Blood
// Pressure Trend (renderBPTrend), and Blood Glucose Trend (renderGlucoseTrend)
// against real DOM, across empty / below-minimum / typical data shapes, plus
// each card's own insight-status branches (good/neutral/warn).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const renderDayValueTrendSrc = extractFunction(src, 'renderDayValueTrend');
const averageByDaySrc = extractFunction(src, 'averageByDay');
const categorizeBPSrc = extractFunction(src, 'categorizeBP');
const categorizeGlucoseSrc = extractFunction(src, 'categorizeGlucose');
const computeWaterTargetSrc = extractFunction(src, 'computeWaterTarget');
const renderWaterTrendSrc = extractFunction(src, 'renderWaterTrend');
const renderBPTrendSrc = extractFunction(src, 'renderBPTrend');
const renderGlucoseTrendSrc = extractFunction(src, 'renderGlucoseTrend');
const renderSparklineSrc = extractFunction(src, 'renderSparkline');
const toDisplayWeightSrc = extractFunction(src, 'toDisplayWeight');
const trimUnitNumSrc = extractFunction(src, 'trimUnitNum');
const fmtWeightSrc = extractFunction(src, 'fmtWeight');

const bodyHtml = `
  <div id="weightChart"></div>
  <div id="waterChart"></div>
  <div id="bpChart"></div>
  <div id="glucoseChart"></div>
`;

// icon() (SVG glyph markup) is a leaf presentation concern covered elsewhere
// (test-emoji-check-icon-migration.js) — stubbed here so assertions stay
// about the trend/insight logic, not glyph internals.
const otherGlobals = `
  window.icon = (name)=> name === 'check' ? '[CHECK]' : '';
  window.weightUnit = 'lb';
  window.userProfile = { weight: 150, activity: 1.2 };
`;

const scriptChunks = [
  toDisplayWeightSrc, trimUnitNumSrc, fmtWeightSrc,
  renderDayValueTrendSrc, averageByDaySrc, categorizeBPSrc, categorizeGlucoseSrc,
  computeWaterTargetSrc, renderWaterTrendSrc, renderBPTrendSrc, renderGlucoseTrendSrc, renderSparklineSrc,
];

const { test, run } = makeRunner('test-metric-trend-cards.js');

// =========================== Weight Trend (renderSparkline) ===============

test('renderSparkline shows the "log at least two" empty state with 0 or 1 entries', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderSparkline([]);
  assert.match(document.getElementById('weightChart').innerHTML, /at least two weigh-ins/);
  window.renderSparkline([{date:'2026-08-01', weight:180}]);
  assert.match(document.getElementById('weightChart').innerHTML, /at least two weigh-ins/);
});

test('renderSparkline renders a real sparkline with first/last values and a weekly-rate insight for several entries', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderSparkline([
    {date:'2026-08-01', weight:185},
    {date:'2026-08-08', weight:183},
    {date:'2026-08-15', weight:181},
    {date:'2026-08-22', weight:179},
  ]);
  const el = document.getElementById('weightChart');
  assert.ok(el.querySelector('svg.sparkline'), 'a real sparkline SVG must be rendered');
  assert.ok(el.querySelector('polyline'), 'a real trend line must be drawn');
  assert.match(el.textContent, /185 lb/, 'first entry value must be shown');
  assert.match(el.textContent, /179 lb/, 'last entry value must be shown');
  assert.match(el.textContent, /-6 lb over 4 entries/, 'the total delta across the window must be reported');
  assert.match(el.textContent, /gain|loss/, 'a weekly-rate insight must render once there are 4+ entries');
});

test('renderSparkline chart sorts by date rather than assuming input order', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderSparkline([
    {date:'2026-08-15', weight:181},
    {date:'2026-08-01', weight:185}, // out of order on purpose
  ]);
  const el = document.getElementById('weightChart');
  assert.match(el.textContent, /185 lb/);
  assert.match(el.textContent, /181 lb/);
  // First-rendered value (leftmost, earliest date) must be 185, not 181.
  const firstSpanText = el.querySelector('span').textContent;
  assert.strictEqual(firstSpanText, '185 lb', 'the earliest date (Aug 1 / 185lb) must be the leftmost/first value, proving the function sorts rather than trusting input order');
});

// =========================== Water Trend ==================================

test('renderWaterTrend shows the "log at least two days" empty state with fewer than two days of data', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderWaterTrend({'2026-08-01': 80});
  assert.match(document.getElementById('waterChart').innerHTML, /at least two days/);
});

test('renderWaterTrend renders a good-status insight when averaging at/above 90% of target', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  // computeWaterTarget({weight:150, activity:1.2}) = round(150*0.6) = 90.
  window.renderWaterTrend({'2026-08-01': 90, '2026-08-02': 85});
  const el = document.getElementById('waterChart');
  assert.ok(el.querySelector('svg.sparkline'));
  assert.match(el.innerHTML, /goal-feedback-good/, 'averaging ~97% of target must render as a good-status insight');
});

test('renderWaterTrend renders a warn-status insight when averaging well below target', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderWaterTrend({'2026-08-01': 30, '2026-08-02': 20});
  const el = document.getElementById('waterChart');
  assert.match(el.innerHTML, /goal-feedback-warn/, 'averaging well under target must render as a warn-status insight');
});

// =========================== Blood Pressure Trend ==========================

test('renderBPTrend shows the "log at least two readings" empty state with no entries', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderBPTrend([]);
  assert.match(document.getElementById('bpChart').innerHTML, /at least two readings/);
});

test('renderBPTrend averages multiple same-day readings into one daily point rather than treating each as a separate day', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderBPTrend([
    {date:'2026-08-01', systolic:120, diastolic:80},
    {date:'2026-08-01', systolic:130, diastolic:84}, // same day, second (PM) reading
    {date:'2026-08-02', systolic:118, diastolic:76},
  ]);
  const el = document.getElementById('bpChart');
  // Two distinct days -> a real trend line (not the "log at least two" empty state).
  assert.ok(el.querySelector('polyline'), 'two distinct days of averaged data must produce a real trend line');
  assert.doesNotMatch(el.innerHTML, /at least two readings/);
});

test('renderBPTrend labels the averaged category correctly (Normal example)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderBPTrend([
    {date:'2026-08-01', systolic:112, diastolic:72},
    {date:'2026-08-02', systolic:118, diastolic:76},
  ]);
  assert.match(document.getElementById('bpChart').textContent, /Normal range/);
});

// =========================== Blood Glucose Trend ============================

test('renderGlucoseTrend shows the "log at least two readings" empty state with no entries', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderGlucoseTrend([]);
  assert.match(document.getElementById('glucoseChart').innerHTML, /at least two readings/);
});

test('renderGlucoseTrend mixes fasting and post-meal readings into one daily average, per its own documented behavior', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  window.renderGlucoseTrend([
    {date:'2026-08-01', value:95, context:'fasting'},
    {date:'2026-08-01', value:145, context:'postmeal'},
    {date:'2026-08-02', value:100, context:'fasting'},
  ]);
  const el = document.getElementById('glucoseChart');
  assert.ok(el.querySelector('polyline'));
  // Aug 1's averaged point is (95+145)/2 = 120, shown as the first plotted value.
  assert.match(el.textContent, /120 mg\/dL/, 'Aug 1 must be plotted as the average of its two same-day readings (95+145)/2=120');
});

test('renderGlucoseTrend renders a warn-status insight for a low average, and good for an in-range average', async (assert)=>{
  const { document: doc1, window: win1 } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  win1.renderGlucoseTrend([{date:'2026-08-01', value:65, context:'fasting'}, {date:'2026-08-02', value:68, context:'fasting'}]);
  assert.match(doc1.getElementById('glucoseChart').innerHTML, /goal-feedback-warn/, 'averaging near the hypoglycemia threshold must warn');

  const { document: doc2, window: win2 } = runJsdom(bodyHtml, otherGlobals, scriptChunks);
  win2.renderGlucoseTrend([{date:'2026-08-01', value:95, context:'fasting'}, {date:'2026-08-02', value:100, context:'fasting'}]);
  assert.match(doc2.getElementById('glucoseChart').innerHTML, /goal-feedback-good/, 'a reasonable average must render as good');
});

run();
