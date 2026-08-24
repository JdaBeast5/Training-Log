'use strict';
// Behavioral coverage for the Analysis tab's new #analysisTrendRange
// selector (7/30/90/all-time — new feature). One selector scopes the six
// Body & Health Trends cards (Weight, Nutrition, Sleep, Water, Blood
// Pressure, Blood Glucose), which previously each just showed "the last 16
// logged days" with no way to change that window.
//
// Deliberately NOT wired into every card on the Analysis tab — Strength
// Context's fixed 120-day window, Volume Trend's this-week-vs-last-week
// comparison, and similar cards keep their own documented fixed windows on
// purpose (see the HTML comment above #analysisTrendRange in index.html).
// This suite proves: (1) the real markup shape, (2) renderDayValueTrend's
// new opts.rangeDays branch filters by real calendar cutoff and drops the
// old -16 cap for "all", while a caller that never passes rangeDays (e.g.
// the Care tab's renderPainTrend) is completely unaffected — proving tab
// isolation, not just that a parameter exists, (3) renderSparkline (Weight
// Trend, which doesn't go through renderDayValueTrend) gets the same
// treatment, (4) renderBPTrend's diastolic average is scoped to the exact
// same date window as the systolic average it's quoted alongside — a real
// bug this change would otherwise introduce, (5) the wrapper functions
// actually read the live select's value, and (6) the real change-event
// listener re-renders via the real refreshBodyHealthTrends.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const analysisViewHtml = extractElementById(src, 'analysisView');

const getTodayKeySrc = extractFunction(src, 'getTodayKey');
const dateKeyMinusDaysSrc = extractFunction(src, 'dateKeyMinusDays');
const getAnalysisTrendRangeDaysSrc = extractFunction(src, 'getAnalysisTrendRangeDays');
const filterDatesByRangeSrc = extractFunction(src, 'filterDatesByRange');
const renderDayValueTrendSrc = extractFunction(src, 'renderDayValueTrend');
const renderSparklineSrc = extractFunction(src, 'renderSparkline');
const averageByDaySrc = extractFunction(src, 'averageByDay');
const renderNutritionTrendSrc = extractFunction(src, 'renderNutritionTrend');
const renderWaterTrendSrc = extractFunction(src, 'renderWaterTrend');
const renderSleepTrendSrc = extractFunction(src, 'renderSleepTrend');
const renderBPTrendSrc = extractFunction(src, 'renderBPTrend');
const renderGlucoseTrendSrc = extractFunction(src, 'renderGlucoseTrend');
const categorizeBPSrc = extractFunction(src, 'categorizeBP');
const categorizeGlucoseSrc = extractFunction(src, 'categorizeGlucose');
const computeWaterTargetSrc = extractFunction(src, 'computeWaterTarget');
const toDisplayWeightSrc = extractFunction(src, 'toDisplayWeight');
const trimUnitNumSrc = extractFunction(src, 'trimUnitNum');
const fmtWeightSrc = extractFunction(src, 'fmtWeight');
const refreshBodyHealthTrendsSrc = extractFunction(src, 'refreshBodyHealthTrends');

// document.getElementById('analysisTrendRange').addEventListener('change', ...)
// is a top-level statement, not a named function/const — same extraction
// approach test-history-date-range-filter.js uses for the analogous
// #historyExportRange wiring.
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}
const rangeChangeWiringSrc = extractStatement(src, "document.getElementById('analysisTrendRange').addEventListener('change'");

// Local-time 'YYYY-MM-DD', matching getTodayKey()'s own formatting exactly.
function localDateKey(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function daysAgoKey(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateKey(d);
}

const otherGlobals = `
  window.icon = (name)=> name === 'check' ? '[CHECK]' : '';
  window.weightUnit = 'lb';
  window.userProfile = { weight: 150, activity: 1.2 };
  window.targets = { cal: 2000 };
`;

const { test, run } = makeRunner('test-analysis-trend-range.js');

// =========================== Markup shape ==================================

test('the real #analysisTrendRange select exists with 7/30/90/all options, defaulting to 30', (assert)=>{
  const selMatch = /<select id="analysisTrendRange"[\s\S]*?<\/select>/.exec(analysisViewHtml);
  assert.ok(selMatch, 'expected a real #analysisTrendRange <select> in analysisView markup');
  const selHtml = selMatch[0];
  assert.match(selHtml, /<option value="7">/);
  assert.match(selHtml, /<option value="30" selected>/);
  assert.match(selHtml, /<option value="90">/);
  assert.match(selHtml, /<option value="all">/);
});

// =========================== renderDayValueTrend ============================

test('opts.rangeDays=7 excludes a day outside the window and keeps the ones inside it', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc, renderDayValueTrendSrc,
  ]);
  const dayTotals = { [daysAgoKey(1)]: 100, [daysAgoKey(2)]: 150, [daysAgoKey(20)]: 999 };
  window.renderDayValueTrend('waterChart', dayTotals, { label:'water', color:'#000', formatValue: v=>String(v), rangeDays: 7 });
  const el = document.getElementById('waterChart');
  assert.doesNotMatch(el.innerHTML, /log at least two|widen the date range/i, 'two points survive the cutoff, so this must be a real rendered chart, not an empty state');
  assert.match(el.textContent, /100/, 'the in-range value must be plotted');
  assert.match(el.textContent, /150/, 'the in-range value must be plotted');
  assert.doesNotMatch(el.textContent, /999/, 'the 20-days-ago value must be excluded by the 7-day cutoff');
});

test('opts.rangeDays=null ("all time") includes every logged day, not just the last 16 — sabotage against the old cap', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc, renderDayValueTrendSrc,
  ]);
  const dayTotals = {};
  for(let i=0; i<20; i++) dayTotals[daysAgoKey(i)] = i;
  window.renderDayValueTrend('waterChart', dayTotals, { label:'water', color:'#000', formatValue: v=>String(v), rangeDays: null });
  const el = document.getElementById('waterChart');
  assert.match(el.textContent, /over 20 days/, 'all 20 logged days must be included when rangeDays is explicitly null (all time), not capped at 16');
});

test('a legacy caller that never passes opts.rangeDays (e.g. Care tab\'s renderPainTrend) keeps the original last-16-days cap, unaffected by the selector', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc, renderDayValueTrendSrc,
  ]);
  // The real #analysisTrendRange select is present (analysisViewHtml) and set
  // to '7' — if renderDayValueTrend read it directly for every caller instead
  // of only acting on an explicitly-passed opts.rangeDays, this would wrongly
  // leak the Analysis tab's selector into an unrelated caller (e.g. the Care
  // tab's renderPainTrend, which shares this same function but must not be
  // scoped by an Analysis-tab-only control).
  document.getElementById('analysisTrendRange').value = '7';
  const dayTotals = {};
  for(let i=0; i<20; i++) dayTotals[daysAgoKey(i)] = i; // all 20 days are within the last 20 days, well inside a 7-day cutoff
  window.renderDayValueTrend('waterChart', dayTotals, { label:'water', color:'#000', formatValue: v=>String(v) }); // no rangeDays passed
  const el = document.getElementById('waterChart');
  assert.match(el.textContent, /over 16 days/, 'must keep the original last-16 cap (16 of the 20 days), proving the "7" sitting in the selector was never consulted');
});

test('opts.rangeDays present but no data survives the cutoff shows a "widen the range" message, distinct from "log at least two"', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc, renderDayValueTrendSrc,
  ]);
  const dayTotals = { [daysAgoKey(40)]: 100, [daysAgoKey(50)]: 100 }; // 2 real days, both outside a 7-day window
  window.renderDayValueTrend('waterChart', dayTotals, { label:'water', color:'#000', formatValue: v=>String(v), rangeDays: 7 });
  const el = document.getElementById('waterChart');
  assert.match(el.textContent, /widen the date range/i);
  assert.doesNotMatch(el.textContent, /log at least two/i, 'must not show the misleading "log at least two" message when the account actually has 2+ days, just not in this window');
});

test('truly insufficient data (fewer than two days logged, ever) still shows the original "log at least two" message', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc, renderDayValueTrendSrc,
  ]);
  window.renderDayValueTrend('waterChart', { [daysAgoKey(2)]: 100 }, { label:'water', color:'#000', formatValue: v=>String(v), rangeDays: 7 });
  const el = document.getElementById('waterChart');
  assert.match(el.textContent, /log at least two/i);
});

// =========================== renderSparkline (Weight Trend) =================

test('renderSparkline honors rangeDays=30 and drops an entry from 60 days ago', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc,
    toDisplayWeightSrc, trimUnitNumSrc, fmtWeightSrc, renderSparklineSrc,
  ]);
  document.getElementById('analysisTrendRange').value = '30';
  window.renderSparkline([
    { date: daysAgoKey(5), weight: 180 },
    { date: daysAgoKey(10), weight: 182 },
    { date: daysAgoKey(60), weight: 999 },
  ]);
  const el = document.getElementById('weightChart');
  assert.doesNotMatch(el.textContent, /999/, 'the 60-days-ago entry must be excluded by the 30-day range');
  assert.match(el.textContent, /over 2 entries/);
});

test('renderSparkline with range=all shows more than 16 entries — sabotage against the old fixed cap', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc,
    toDisplayWeightSrc, trimUnitNumSrc, fmtWeightSrc, renderSparklineSrc,
  ]);
  document.getElementById('analysisTrendRange').value = 'all';
  const entries = [];
  for(let i=0; i<20; i++) entries.push({ date: daysAgoKey(i), weight: 180 + i });
  window.renderSparkline(entries);
  const el = document.getElementById('weightChart');
  assert.match(el.textContent, /over 20 entries/, 'all time must mean all 20 logged entries, not the old last-16 cap');
});

// =========================== renderBPTrend diastolic fix ====================

test('renderBPTrend: the diastolic average quoted in the insight is scoped to the SAME date window as the systolic average, not all diastolic history ever logged', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc,
    averageByDaySrc, categorizeBPSrc, renderDayValueTrendSrc, renderBPTrendSrc,
  ]);
  document.getElementById('analysisTrendRange').value = '7';
  window.renderBPTrend([
    { date: daysAgoKey(2), systolic: 118, diastolic: 76 },
    { date: daysAgoKey(3), systolic: 120, diastolic: 78 },
    // Way outside the 7-day window, and a wildly different diastolic value —
    // if this leaked into the average, it would pull it far from 77.
    { date: daysAgoKey(200), systolic: 118, diastolic: 40 },
  ]);
  const el = document.getElementById('bpChart');
  assert.match(el.textContent, /119\/77/, 'systolic avg (118+120)/2=119, diastolic avg of the two in-range readings only (76+78)/2=77 — not dragged by the 200-days-ago outlier');
});

// =========================== Wrapper functions read the live selector =======

test('renderNutritionTrend reads the live #analysisTrendRange value: range=7 excludes a 30-days-ago entry', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc,
    renderDayValueTrendSrc, renderNutritionTrendSrc,
  ]);
  document.getElementById('analysisTrendRange').value = '7';
  window.renderNutritionTrend({
    [daysAgoKey(1)]: { cal: 2000 },
    [daysAgoKey(3)]: { cal: 2100 },
    [daysAgoKey(30)]: { cal: 9999 },
  });
  const el = document.getElementById('nutritionChart');
  assert.doesNotMatch(el.textContent, /9999/);
  assert.match(el.textContent, /over 2 days/);
});

test('switching the live select from 7 to all and re-rendering picks up the previously-excluded entry', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc,
    renderDayValueTrendSrc, renderNutritionTrendSrc,
  ]);
  const foodDays = {
    [daysAgoKey(1)]: { cal: 2000 },
    [daysAgoKey(3)]: { cal: 2100 },
    [daysAgoKey(30)]: { cal: 2400 },
  };
  const sel = document.getElementById('analysisTrendRange');
  sel.value = '7';
  window.renderNutritionTrend(foodDays);
  assert.match(document.getElementById('nutritionChart').textContent, /over 2 days/);

  sel.value = 'all';
  window.renderNutritionTrend(foodDays);
  assert.match(document.getElementById('nutritionChart').textContent, /over 3 days/, 'switching the selector to all time must surface the previously out-of-range entry on the next render');
});

// =========================== REAL invocation: the change listener ===========

test('REAL invocation: dispatching a real "change" event on #analysisTrendRange calls the real refreshBodyHealthTrends, which re-renders Weight/Nutrition/Sleep/Water', async (assert)=>{
  const fetchStubs = `
    window.hasCondition = ()=> false;
    window.fetchAllWeightEntries = async ()=> ([
      { date: '${daysAgoKey(1)}', weight: 180 },
      { date: '${daysAgoKey(3)}', weight: 181 },
      { date: '${daysAgoKey(40)}', weight: 999 },
    ]);
    window.fetchFoodDays = async ()=> ({});
    window.fetchWaterDays = async ()=> ({});
    window.fetchSleepEntries = async ()=> ([]);
    window.fetchBPEntries = async ()=> ([]);
    window.fetchGlucoseEntries = async ()=> ([]);
  `;
  const { document, window } = runJsdom(analysisViewHtml, otherGlobals + fetchStubs, [
    getTodayKeySrc, dateKeyMinusDaysSrc, filterDatesByRangeSrc, getAnalysisTrendRangeDaysSrc,
    toDisplayWeightSrc, trimUnitNumSrc, fmtWeightSrc, renderSparklineSrc,
    averageByDaySrc, categorizeBPSrc, categorizeGlucoseSrc, computeWaterTargetSrc,
    renderDayValueTrendSrc, renderNutritionTrendSrc, renderWaterTrendSrc, renderSleepTrendSrc, renderBPTrendSrc, renderGlucoseTrendSrc,
    refreshBodyHealthTrendsSrc, rangeChangeWiringSrc,
  ]);
  const sel = document.getElementById('analysisTrendRange');
  sel.value = '30';
  await window.refreshBodyHealthTrends(); // establish the "before" state, same as real app boot
  assert.match(document.getElementById('weightChart').textContent, /over 2 entries/);

  sel.value = 'all';
  sel.dispatchEvent(new window.Event('change', {bubbles:true}));
  await new Promise((resolve)=> setTimeout(resolve, 20)); // let the async refreshBodyHealthTrends triggered by the listener settle
  assert.match(document.getElementById('weightChart').textContent, /over 3 entries/, 'the real change listener must have called refreshBodyHealthTrends again with the new value');
});

run();
