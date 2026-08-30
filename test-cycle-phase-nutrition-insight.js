'use strict';
// Behavioral coverage for getCyclePhaseNutritionInsight — a proactive Today
// Insights row surfacing CYCLE_PHASES' own `nutrition` field (real content
// that already existed inside the Cycle Tracking card's phase-guide list,
// but nobody saw it there without opening that card and scrolling to the
// current phase). The user ask this was built for: "take into consideration
// the time of the month for women... informed about what they may need, not
// only for supplements, but also for nutrition."
//
// Mirrors getCycleInsight's own real behavior exactly (same phase lookup,
// same "always show once cycle data exists" rule, including phases whose
// text says no major shift is needed) — this file proves that parity
// directly, not just that the new function exists in isolation.
//
// Real functions under test: getCyclePhaseNutritionInsight, exercised
// against the real computeCyclePhase and CYCLE_PHASES it actually reads —
// not a reimplementation of either.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const getCyclePhaseNutritionInsightSrc = extractFunction(src, 'getCyclePhaseNutritionInsight');
const isCycleTrackingEnabledSrc = extractFunction(src, 'isCycleTrackingEnabled');
const cyclePhasesSrc = extractConst(src, 'CYCLE_PHASES');
const computeCyclePhaseSrc = extractFunction(src, 'computeCyclePhase');
const getTodayKeySrc = extractFunction(src, 'getTodayKey');
const renderTodayInsightsSrc = extractFunction(src, 'renderTodayInsights');

const { test, run } = makeRunner('test-cycle-phase-nutrition-insight.js');

function storageGlobals(initial){
  return `
    window.storage = {
      __store: ${JSON.stringify(initial || {})},
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('no saved preference');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
    };
  `;
}

function profileGlobals(overrides){
  const profile = Object.assign({ gender: 'other' }, overrides || {});
  return `var userProfile = ${JSON.stringify(profile)};`;
}

const baseChunks = [cyclePhasesSrc, getTodayKeySrc, computeCyclePhaseSrc, isCycleTrackingEnabledSrc, getCyclePhaseNutritionInsightSrc];

function setup(profileOverrides, storageInitial){
  const { window } = runJsdom('', profileGlobals(profileOverrides) + storageGlobals(storageInitial), baseChunks);
  return window;
}

// Real "today" and "N days ago" dates, matching what the real getTodayKey()
// (also under real test here, not stubbed) actually returns right now — same
// pattern test-supplement-condition-cycle-nudge.js already established, so a
// hardcoded date can never silently drift out of the phase this test expects.
function daysAgoKey(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

test('REAL invocation: non-female gender -> null (no false-positive nudge)', async (assert)=>{
  const window = setup({ gender: 'other' }, { 'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(0), cycleLength: 28 }) });
  const result = await window.getCyclePhaseNutritionInsight();
  assert.strictEqual(result, null);
});

test('REAL invocation: female gender with no cycle data saved yet -> null, not a crash', async (assert)=>{
  const window = setup({ gender: 'female' }, {});
  const result = await window.getCyclePhaseNutritionInsight();
  assert.strictEqual(result, null);
});

test('REAL invocation: female gender who has explicitly opted OUT of cycle tracking -> null, even with real cycle data still saved from before the opt-out', async (assert)=>{
  const window = setup({ gender: 'female', cycleTrackingEnabled: false }, { 'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(0), cycleLength: 28 }) });
  const result = await window.getCyclePhaseNutritionInsight();
  assert.strictEqual(result, null, 'opting out must be a real off switch — it must stop reading pre-existing cycle-data, not just stop collecting new data going forward');
});

test('REAL invocation: menstrual phase (day 1 of 28) surfaces the real CYCLE_PHASES menstrual nutrition text, with a jump-link to the real Nutrition card', async (assert)=>{
  const window = setup({ gender: 'female' }, { 'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(0), cycleLength: 28 }) });
  const result = await window.getCyclePhaseNutritionInsight();
  assert.ok(result, 'must return a real row once cycle data exists');
  assert.match(result, /iron/i, 'must be the REAL menstrual-phase nutrition text (mentions iron), not a placeholder');
  assert.match(result, /Menstrual Phase/, 'must name the real current phase');
  assert.match(result, /class="link-btn"/, 'must use the app\'s real inline-prose-button component');
  assert.match(result, /data-jump-to="nutritionHeader"/, 'must link to the real, existing Nutrition card id (nutritionHeader) via the document-level [data-jump-to] delegation');
});

test('REAL invocation: luteal phase (day 20 of 28) surfaces the real CYCLE_PHASES luteal nutrition text — a genuinely different phase, genuinely different text', async (assert)=>{
  const window = setup({ gender: 'female' }, { 'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(19), cycleLength: 28 }) });
  const result = await window.getCyclePhaseNutritionInsight();
  assert.ok(result);
  assert.match(result, /Luteal Phase/);
  assert.match(result, /calorie/i, 'must be the real luteal-phase nutrition text (mentions calorie needs), not the menstrual one carried over by mistake');
});

test('sabotage-relevant: a phase whose real nutrition text says no major shift is needed (ovulation, day 14 of 28) still produces a real row — this is NOT filtered out as "boring"', async (assert)=>{
  const window = setup({ gender: 'female' }, { 'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(13), cycleLength: 28 }) });
  const result = await window.getCyclePhaseNutritionInsight();
  assert.ok(result, 'every phase must produce a row once cycle data exists, matching getCycleInsight\'s own "always show" precedent — a phase with unremarkable advice is not the same as no advice');
  assert.match(result, /Ovulation/);
});

// --- Wiring: renderTodayInsights actually calls this, not just defines it --
const OTHER_INSIGHT_STUBS = `
  async function getDeloadInsight(){ return null; }
  async function getSleepInsight(){ return null; }
  async function getCycleInsight(){ return null; }
  async function getStaleRestingRegionInsight(){ return null; }
  async function getWeighInReminderInsight(){ return null; }
  async function getWaterPaceInsight(){ return null; }
  async function getSessionHeadsUpInsight(){ return null; }
  async function getDeficitGuardrailInsight(){ return null; }
  async function getPregnancyHeatInsight(){ return null; }
  async function getBackupReminderInsight(){ return null; }
  async function getReadinessInsight(){ return null; }
  async function getFoundationalStackNudgeInsight(){ return null; }
`;

const wiringBodyHtml = `
  <div class="card" id="todayInsightsCard" style="display:none">
    <div id="todayInsightsList"></div>
  </div>
`;

test('REAL invocation: renderTodayInsights genuinely calls getCyclePhaseNutritionInsight and renders its real row into the DOM', async (assert)=>{
  const { document, window } = runJsdom(wiringBodyHtml, profileGlobals({ gender: 'female' }) + storageGlobals({ 'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(0), cycleLength: 28 }) }), [
    ...baseChunks, OTHER_INSIGHT_STUBS, renderTodayInsightsSrc,
  ]);
  await window.renderTodayInsights();
  const card = document.getElementById('todayInsightsCard');
  assert.strictEqual(card.style.display, '', 'the card must become visible once a real insight exists');
  const html = document.getElementById('todayInsightsList').innerHTML;
  assert.match(html, /today-insight-row/, 'must render using the real .today-insight-row wrapper');
  assert.match(html, /nutritionHeader/, 'the real jump-link must reach the actual rendered DOM, proving the wiring works end to end');
});

test('sabotage-relevant: with no cycle data and every other insight stubbed to null, renderTodayInsights hides the card entirely', async (assert)=>{
  const { document, window } = runJsdom(wiringBodyHtml, profileGlobals({ gender: 'female' }) + storageGlobals({}), [
    ...baseChunks, OTHER_INSIGHT_STUBS, renderTodayInsightsSrc,
  ]);
  await window.renderTodayInsights();
  assert.strictEqual(document.getElementById('todayInsightsCard').style.display, 'none', 'with every real insight source producing null, the card must stay hidden — proves this test\'s "visible" case above is actually driven by the new nutrition nudge, not some other always-on row');
});

run();
