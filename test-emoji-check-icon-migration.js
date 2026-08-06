'use strict';
// Behavioral coverage for Phase E's first emoji-to-icon batch: the ✅ heavy
// checkmark, used as a "good" verdict marker across ~11 HTML-template call
// sites, converted to the existing icon('check') SVG helper (previously
// only used by diagRow). Explicitly NOT converted (per the code's own
// updated comment): any ✅/✓ assigned via .textContent (ephemeral status
// flashes like "Saved ✓", the celebration banner's icon) — textContent
// can't hold markup, matching this file's own established precedent from
// earlier emoji-conversion passes (see sw.js's v3.68 changelog entry).
//
// Two layers: (1) a full behavioral test — real markup, real functions,
// real jsdom — proving the rendered DOM actually contains the SVG icon,
// not just that a string exists somewhere; (2) a structural check across
// every other converted site confirming the raw ✅ character is gone and
// icon('check') is referenced, since fully wiring up each of these 11
// functions' real dependencies (storage reads, userProfile, targets, etc.)
// for a deep test each would be disproportionate to what is, for all of
// them, the same one-line text substitution with no control-flow change.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const { test, run } = makeRunner('test-emoji-check-icon-migration.js');

test('renderPainTrend: a "trending down" verdict renders the real check icon SVG in the DOM, not the raw emoji', (assert)=>{
  const bodyHtml = `<div id="painChart"></div>`;
  const scriptChunks = [
    extractConst(src, 'ICONS'),
    extractFunction(src, 'icon'),
    extractFunction(src, 'renderDayValueTrend'),
    extractFunction(src, 'renderPainTrend'),
    // Pain trending down over the window: first entry high, last two entries
    // low enough that trend <= -2, which is the specific branch under test.
    `renderPainTrend({
      '2026-07-20': 7,
      '2026-07-25': 6,
      '2026-07-28': 3,
      '2026-08-01': 3,
    });`,
  ];
  const { document } = runJsdom(bodyHtml, 'window.escapeHtml = (s)=> String(s);', scriptChunks);
  const insightEl = document.querySelector('#painChart .goal-feedback-good');
  assert.ok(insightEl, 'expected a goal-feedback-good insight block to render');
  assert.ok(insightEl.innerHTML.includes('<svg'), 'expected real SVG markup in the rendered insight');
  assert.ok(insightEl.textContent.includes('Trending down'), 'expected the actual insight text alongside the icon');
  assert.ok(!insightEl.innerHTML.includes('✅'), 'the raw emoji character must not appear in the rendered output');
});

const CONVERTED_SITES = [
  {fn: 'renderMealSuggestions', desc: 'meal-suggestions "done" card'},
  {fn: 'renderNutritionTrend', desc: 'nutrition trend insight'},
  {fn: 'renderWaterTrend', desc: 'water trend insight'},
  {fn: 'renderSleepTrend', desc: 'sleep trend insight'},
  {fn: 'renderGlucoseTrend', desc: 'glucose trend insight'},
  {fn: 'renderStrengthContext', desc: 'lift-balance diag row'},
  {fn: 'renderExerciseProgress', desc: 'progression roll-up summary'},
  {fn: 'renderPainTrend', desc: 'pain trend insight'},
  {fn: 'renderCare', desc: 'resting-regions empty state'},
  {fn: 'renderCardioTrend', desc: 'cardio pace trend insight'},
  {fn: 'renderRpeTrend', desc: 'weekly RPE trend insight'},
];

for(const {fn, desc} of CONVERTED_SITES){
  test(`${fn} (${desc}): no raw ✅ remains, icon('check') is referenced`, (assert)=>{
    const fnSrc = extractFunction(src, fn);
    assert.ok(!fnSrc.includes('✅'), `${fn} must no longer contain the raw emoji character`);
    assert.ok(fnSrc.includes("icon('check')"), `${fn} must reference icon('check')`);
  });
}

test('deliberately NOT converted: triggerCelebration\'s icon argument stays plain text (assigned via .textContent, cannot hold markup)', (assert)=>{
  const fnSrc = extractFunction(src, 'triggerCelebration');
  assert.ok(fnSrc.includes('.textContent = icon'), 'triggerCelebration must still assign its icon via textContent');
  // The call sites passing '✅' are outside this function (in
  // checkStreakMilestone-adjacent callers) — confirmed separately by
  // grep, not re-asserted here since this function itself is untouched.
});

run();
