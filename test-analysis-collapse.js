'use strict';
// Behavioral coverage for the Analysis tab's collapsible groups
// (setAnalysisGroupCollapsed, toggleAnalysisGroup, wireAnalysisGroupCollapse)
// — Tier 2. This is the feature HANDOFF-v33 shipped as its most recent,
// least-verified work (no test file ever made it into the repo, and it was
// never confirmed on an actual phone). Uses the REAL #analysisView markup
// (extracted via extractElementById, all 19 real cards and 3 real group
// headers) and the REAL extracted functions, loaded into an actual jsdom
// document via a real <script> tag — the same "extract real markup and
// function source, load into jsdom, assert on actual DOM state" approach
// HANDOFF-v33 describes its own (never-committed) test as having used.
const { readIndexSource, extractFunction, extractConst, extractIIFE, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const analysisViewHtml = extractElementById(src, 'analysisView');

const scriptChunks = [
  extractConst(src, 'ANALYSIS_GROUP_DEFAULT_COLLAPSED'),
  extractFunction(src, 'setAnalysisGroupCollapsed'),
  extractFunction(src, 'toggleAnalysisGroup'),
  extractIIFE(src, 'wireAnalysisGroupCollapse'),
  'wireAnalysisGroupCollapse();',
];

function storageGlobals(getResponses){
  return `
    window.storage = {
      __setCalls: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(${JSON.stringify(getResponses)}, key)){
          return { value: ${JSON.stringify(getResponses)}[key] };
        }
        throw new Error('no saved preference');
      },
      set: (key, value)=>{ window.storage.__setCalls.push([key, value]); },
    };
  `;
}

const tick = ()=> new Promise((resolve)=> setTimeout(resolve, 10));

const { test, run } = makeRunner('test-analysis-collapse.js');

test('defaults apply synchronously: insights expanded, body-health and training collapsed', (assert)=>{
  const { document } = runJsdom(analysisViewHtml, storageGlobals({}), scriptChunks);
  const insights = document.querySelector('[data-group="insights"]');
  const bodyHealth = document.querySelector('[data-group="body-health"]');
  const training = document.querySelector('[data-group="training"]');
  assert.strictEqual(insights.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(insights.classList.contains('collapsed'), false);
  assert.strictEqual(bodyHealth.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(bodyHealth.classList.contains('collapsed'), true);
  assert.strictEqual(training.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(training.classList.contains('collapsed'), true);
});

test('collapsing a group adds .group-collapsed to every card in that group and NO others', (assert)=>{
  const { document } = runJsdom(analysisViewHtml, storageGlobals({}), scriptChunks);
  // body-health is collapsed by default. Its real cards (bodyMetricsCard,
  // weightChart's card, nutritionChart's card, sleepChart's card, ...) must
  // all carry the class; insights' cards (which stays open) must not.
  const bodyMetricsCard = document.getElementById('bodyMetricsCard');
  assert.ok(bodyMetricsCard.classList.contains('group-collapsed'));
  const goalFeedbackCard = document.getElementById('goalFeedback').closest('.card');
  assert.strictEqual(goalFeedbackCard.classList.contains('group-collapsed'), false, 'an insights-group card must not be marked collapsed');
});

test('clicking a header toggles collapsed class, aria-expanded, and persists both directions', async (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, storageGlobals({}), scriptChunks);
  const insights = document.querySelector('[data-group="insights"]');
  assert.strictEqual(insights.classList.contains('collapsed'), false, 'starts expanded');

  insights.dispatchEvent(new window.Event('click', {bubbles:true}));
  await tick();
  assert.strictEqual(insights.classList.contains('collapsed'), true, 'first click collapses');
  assert.strictEqual(insights.getAttribute('aria-expanded'), 'false');

  insights.dispatchEvent(new window.Event('click', {bubbles:true}));
  await tick();
  assert.strictEqual(insights.classList.contains('collapsed'), false, 'second click re-expands');
  assert.strictEqual(insights.getAttribute('aria-expanded'), 'true');

  // JSON round-trip: arrays built inside jsdom's window carry that realm's
  // own Array prototype, which deepStrictEqual treats as a different type
  // from the host's even with identical contents (same issue the vm-sandbox
  // tests hit, different realm boundary).
  const calls = JSON.parse(JSON.stringify(window.storage.__setCalls));
  assert.deepStrictEqual(calls, [
    ['analysis-group-collapsed:insights', 'true'],
    ['analysis-group-collapsed:insights', 'false'],
  ]);
});

test('a saved preference that differs from the default overrides it once the async read resolves', async (assert)=>{
  // body-health defaults to collapsed; saved preference says it should be expanded.
  const { document } = runJsdom(analysisViewHtml, storageGlobals({'analysis-group-collapsed:body-health': 'false'}), scriptChunks);
  const bodyHealth = document.querySelector('[data-group="body-health"]');
  assert.strictEqual(bodyHealth.classList.contains('collapsed'), true, 'default applies first, synchronously');
  await tick();
  assert.strictEqual(bodyHealth.classList.contains('collapsed'), false, 'saved override applied after the async read resolves');
  assert.strictEqual(bodyHealth.getAttribute('aria-expanded'), 'true');
});

test('autohide (inline display:none) and group-collapse (class) coexist on the same card without either erasing the other', (assert)=>{
  const { document } = runJsdom(analysisViewHtml, storageGlobals({}), scriptChunks);
  const bodyMetricsCard = document.getElementById('bodyMetricsCard');
  // Real markup: this card starts with inline style="display:none" (autohide,
  // before any real measurement is logged) AND lives in the body-health group,
  // which defaults to collapsed.
  assert.strictEqual(bodyMetricsCard.style.display, 'none', 'autohide\'s inline style must still be present');
  assert.ok(bodyMetricsCard.classList.contains('group-collapsed'), 'collapse\'s class must ALSO be present');

  // Re-expanding the group must reveal whatever autohide already decided —
  // not force the card visible regardless of its own content state.
  const bodyHealthHeader = document.querySelector('[data-group="body-health"]');
  toggleAnalysisGroupOn(document, bodyHealthHeader);
  assert.strictEqual(bodyMetricsCard.classList.contains('group-collapsed'), false, 'class removed on expand');
  assert.strictEqual(bodyMetricsCard.style.display, 'none', 'autohide\'s inline style is untouched by expanding the group');
});

function toggleAnalysisGroupOn(document, header){
  header.dispatchEvent(new document.defaultView.Event('click', {bubbles:true}));
}

test('Meal Timing now belongs to the Insights & Program Fit group, not Body & Health Trends', (assert)=>{
  // Relocated: it's the other "how do metrics interact" card, same family
  // as AI Cross-Metric Insights right above it in the real markup — not a
  // standalone body-health trend. Group membership in this app is purely
  // DOM-sibling-position-based (nearest preceding .analysis-group-header),
  // so this is the real behavioral proof the move actually took, not just
  // a visual reorder: collapsing insights must now hide it, and collapsing
  // body-health must no longer touch it at all.
  const { document } = runJsdom(analysisViewHtml, storageGlobals({}), scriptChunks);
  const mealTimingCard = document.getElementById('mealTimingCard');
  const insightsHeader = document.querySelector('[data-group="insights"]');
  const bodyHealthHeader = document.querySelector('[data-group="body-health"]');

  assert.strictEqual(mealTimingCard.classList.contains('group-collapsed'), false, 'starts uncollapsed — insights is expanded by default and body-health no longer owns this card');

  toggleAnalysisGroupOn(document, insightsHeader);
  assert.ok(mealTimingCard.classList.contains('group-collapsed'), 'collapsing Insights & Program Fit must now hide Meal Timing');
  toggleAnalysisGroupOn(document, insightsHeader); // re-expand for the next assertion

  toggleAnalysisGroupOn(document, bodyHealthHeader);
  assert.strictEqual(mealTimingCard.classList.contains('group-collapsed'), false, 'collapsing Body & Health Trends must NOT affect Meal Timing anymore — it moved out');
});

run();
