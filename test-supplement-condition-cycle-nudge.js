'use strict';
// Behavioral coverage for the Foundational Stack condition/cycle nudge — a
// proactive Today Insights row for someone whose flagged medical condition
// (prenatal, postpartum, hypertension, diabetes, osteoporosis) or CURRENT
// cycle phase (menstrual, via real Cycle Tracking data) has a real
// FOUNDATIONAL_SUPPLEMENT_STACK addition they haven't added to their tracker
// yet — the user ask this was built for ("medically modified groups...
// pregnant or postpartum, women on their periods... should be getting
// supplements added to their list or at least recommended").
//
// This is a RECOMMEND, not an auto-add: it only ever surfaces a real
// jump-link to the existing "+Add" flow (Coach tab's Foundational Stack
// card) — nothing here ever writes to `my-supplements` on its own. See the
// comment above getFoundationalStackNudgeInsight in index.html for the full
// reasoning against auto-add.
//
// Real functions under test: getFoundationalStackNudgeInsight (the new
// function), exercised against the real activeConditionKeys,
// computeCyclePhase, and loadMySupplements it actually calls — not
// reimplementations of any of them.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const getFoundationalStackNudgeInsightSrc = extractFunction(src, 'getFoundationalStackNudgeInsight');
const foundationalStackSrc = extractConst(src, 'FOUNDATIONAL_SUPPLEMENT_STACK');
const activeConditionKeysSrc = extractFunction(src, 'activeConditionKeys');
const computeCyclePhaseSrc = extractFunction(src, 'computeCyclePhase');
const cyclePhasesSrc = extractConst(src, 'CYCLE_PHASES');
const getTodayKeySrc = extractFunction(src, 'getTodayKey');
const loadMySupplementsSrc = extractFunction(src, 'loadMySupplements');
const supplementFrequencyMetaSrc = extractConst(src, 'SUPPLEMENT_FREQUENCY_META');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const renderTodayInsightsSrc = extractFunction(src, 'renderTodayInsights');

const { test, run } = makeRunner('test-supplement-condition-cycle-nudge.js');

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
  const profile = Object.assign({ gender: 'other', conditions: [] }, overrides || {});
  return `
    var userProfile = ${JSON.stringify(profile)};
    var activeProgram = ${JSON.stringify(overrides && overrides.activeProgram || 'strength')};
  `;
}

const baseChunks = [
  foundationalStackSrc, activeConditionKeysSrc, cyclePhasesSrc, getTodayKeySrc,
  computeCyclePhaseSrc, supplementFrequencyMetaSrc, escapeHtmlSrc, loadMySupplementsSrc,
  getFoundationalStackNudgeInsightSrc,
];

function setup(profileOverrides, storageInitial){
  const { window } = runJsdom('', profileGlobals(profileOverrides) + storageGlobals(storageInitial), baseChunks);
  return window;
}

// Real "today" and "N days ago" dates, matching what the real getTodayKey()
// (also under real test here, not stubbed) actually returns right now —
// so computeCyclePhase's real day-in-cycle math lands on a real, current
// menstrual or non-menstrual day rather than a hardcoded date that drifts
// out of phase the day this file is read again.
function daysAgoKey(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

// --- No trigger at all -------------------------------------------------------

test('REAL invocation: no flagged condition, no cycle data, non-female gender -> null (no false-positive nudge)', async (assert)=>{
  const window = setup({ gender: 'other', conditions: [] }, {});
  const result = await window.getFoundationalStackNudgeInsight();
  assert.strictEqual(result, null);
});

test('REAL invocation: female gender with no cycle data saved yet -> null, not a crash', async (assert)=>{
  const window = setup({ gender: 'female', conditions: [] }, {});
  const result = await window.getFoundationalStackNudgeInsight();
  assert.strictEqual(result, null);
});

test('sabotage-relevant: bariatricRebuilding flagged produces no nudge — that condition is deliberately excluded from FOUNDATIONAL_SUPPLEMENT_STACK.conditions (it has its own separate checklist)', async (assert)=>{
  const window = setup({ gender: 'other', conditions: ['bariatricRebuilding'] }, {});
  const result = await window.getFoundationalStackNudgeInsight();
  assert.strictEqual(result, null, 'a condition with no entry in FOUNDATIONAL_SUPPLEMENT_STACK.conditions must not produce a nudge or throw');
});

// --- Condition-linked trigger ------------------------------------------------

test('REAL invocation: a flagged condition (prenatal) with its real Foundational Stack addition not yet tracked produces a real jump-link nudge', async (assert)=>{
  const window = setup({ gender: 'female', conditions: ['prenatal'] }, {});
  const result = await window.getFoundationalStackNudgeInsight();
  assert.ok(result, 'must return a real insight row, not null, when a flagged condition has an untracked addition');
  assert.match(result, /Choline/, 'must name the real Foundational Stack item tied to prenatal, not a generic message');
  assert.match(result, /class="link-btn"/, 'must use the app\'s real inline-prose-button component, not a bespoke one');
  assert.match(result, /data-jump-to="supplementRecommendationsCard"/, 'must link to the real, existing Supplement Recommendations card id (the document-level [data-jump-to] delegation already handles the navigation)');
});

test('REAL invocation: the SAME condition-linked item, once already tracked (case-insensitive), produces no nudge', async (assert)=>{
  const window = setup({ gender: 'female', conditions: ['prenatal'] }, {
    'my-supplements': JSON.stringify([{name: 'choline', frequency: 'daily'}]),
  });
  const result = await window.getFoundationalStackNudgeInsight();
  assert.strictEqual(result, null, 'already-tracked (even in different case) must suppress the nudge — this recommends what is MISSING, never re-announces what is already tracked');
});

test('REAL invocation: multiple flagged conditions each contribute their own untracked item, joined into one row', async (assert)=>{
  const window = setup({ gender: 'other', conditions: ['osteoporosis', 'diabetes'] }, {});
  const result = await window.getFoundationalStackNudgeInsight();
  assert.ok(result);
  assert.match(result, /Vitamin K2/, 'osteoporosis\'s real addition must appear');
  assert.match(result, /Alpha-Lipoic Acid/, 'diabetes\'s real addition must appear');
});

test('sabotage-relevant: an unflagged condition\'s addition never leaks in — only currently-active conditions contribute', async (assert)=>{
  const window = setup({ gender: 'other', conditions: ['diabetes'] }, {});
  const result = await window.getFoundationalStackNudgeInsight();
  assert.ok(result);
  assert.doesNotMatch(result, /Vitamin K2/, 'osteoporosis was never flagged — its addition must not appear alongside diabetes\'s');
  assert.doesNotMatch(result, /CoQ10/, 'hypertension was never flagged either');
});

// --- Cycle-phase trigger (menstrual only) -----------------------------------

test('REAL invocation: currently in the menstrual phase (real computeCyclePhase, day 1) surfaces the real, existing Iron item — not a new duplicate one', async (assert)=>{
  const window = setup({ gender: 'female', conditions: [] }, {
    'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(0), cycleLength: 28 }),
  });
  const result = await window.getFoundationalStackNudgeInsight();
  assert.ok(result, 'day 1 of a 28-day cycle must compute as the real menstrual phase and trigger a nudge');
  assert.match(result, /Iron/, 'must point at the real, already-existing female-axis Iron item — never a second, invented one');
});

test('sabotage-relevant: currently in the FOLLICULAR phase (day 10 of 28) produces no nudge — this is gated on the real current phase, not just "female with cycle data saved"', async (assert)=>{
  const window = setup({ gender: 'female', conditions: [] }, {
    'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(9), cycleLength: 28 }),
  });
  const result = await window.getFoundationalStackNudgeInsight();
  assert.strictEqual(result, null, 'day 10 of a 28-day cycle is follicular, not menstrual — a nudge here would prove the phase gate is not actually being checked');
});

test('REAL invocation: Iron already tracked during the menstrual phase produces no nudge', async (assert)=>{
  const window = setup({ gender: 'female', conditions: [] }, {
    'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(2), cycleLength: 28 }),
    'my-supplements': JSON.stringify([{name: 'Iron', frequency: 'daily'}]),
  });
  const result = await window.getFoundationalStackNudgeInsight();
  assert.strictEqual(result, null);
});

test('REAL invocation: a flagged condition AND the menstrual phase at once combine into one row naming both real items', async (assert)=>{
  const window = setup({ gender: 'female', conditions: ['osteoporosis'] }, {
    'cycle-data': JSON.stringify({ lastPeriod: daysAgoKey(1), cycleLength: 30 }),
  });
  const result = await window.getFoundationalStackNudgeInsight();
  assert.ok(result);
  assert.match(result, /Vitamin K2/);
  assert.match(result, /Iron/);
});

// --- Wiring: renderTodayInsights actually calls this, not just defines it --
// Every other get*Insight function renderTodayInsights depends on is
// stubbed to resolve null, so the ONLY way a row can appear in the real
// rendered DOM is via the real Promise.all/items wiring actually reaching
// the real getFoundationalStackNudgeInsight — sabotage-relevant the same
// way test-watersports-program.js proves toggleWatersportsTechniquesCard is
// "actually wired into the program-switch flow (not just defined and never
// called)".
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
`;

const wiringBodyHtml = `
  <div class="card" id="todayInsightsCard" style="display:none">
    <div id="todayInsightsList"></div>
  </div>
`;

test('REAL invocation: renderTodayInsights genuinely calls getFoundationalStackNudgeInsight and renders its real row into the DOM', async (assert)=>{
  const { document, window } = runJsdom(wiringBodyHtml, profileGlobals({ gender: 'female', conditions: ['prenatal'] }) + storageGlobals({}), [
    ...baseChunks, OTHER_INSIGHT_STUBS, renderTodayInsightsSrc,
  ]);
  await window.renderTodayInsights();
  const card = document.getElementById('todayInsightsCard');
  assert.strictEqual(card.style.display, '', 'the card must become visible once a real insight exists');
  const html = document.getElementById('todayInsightsList').innerHTML;
  assert.match(html, /today-insight-row/, 'must render using the real .today-insight-row wrapper, not a bespoke one');
  assert.match(html, /Choline/, 'the real nudge content must reach the actual rendered DOM, proving the wiring (not just the function existing) works end to end');
});

test('sabotage-relevant: with nothing flagged and every other insight stubbed to null, renderTodayInsights hides the card entirely', async (assert)=>{
  const { document, window } = runJsdom(wiringBodyHtml, profileGlobals({ gender: 'other', conditions: [] }) + storageGlobals({}), [
    ...baseChunks, OTHER_INSIGHT_STUBS, renderTodayInsightsSrc,
  ]);
  await window.renderTodayInsights();
  assert.strictEqual(document.getElementById('todayInsightsCard').style.display, 'none', 'with every real insight source producing null, the card must stay hidden — proves this test\'s "visible" case above is actually driven by the new nudge, not some other always-on row');
});

run();
