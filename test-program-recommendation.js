'use strict';
// Behavioral coverage for scoreAllPrograms / recommendProgram. Tier 1: this
// picks which of 24 programs gets recommended, blending a static fit table
// with body-goal keyword boosts, an age-scaled senior-program discount, and
// a trend-aware nudge from real recent training data — several independently
// moving parts that are easy to get subtly wrong (e.g. clamping, or the
// deliberate "stacking" of both trend boosts for a current high-intensity
// program). Both functions accept an explicit trendStatus parameter
// specifically so callers/tests don't have to also mock the async
// getCurrentTrendStatus() — used throughout to keep these tests pure.
//
// Uses the REAL `programs` table (for real key order and labels) and the
// REAL PROGRAM_FIT_SCORES/bucket constants — all expected values below were
// computed numerically before being written into assertions, not guessed.
const { readIndexSource, extractFunction, extractConst, countCallSites, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractConst(src, 'programs'),
  extractConst(src, 'PROGRAM_FIT_SCORES'),
  extractConst(src, 'HIGH_INTENSITY_PROGRAMS'),
  extractConst(src, 'RECOVERY_FRIENDLY_PROGRAMS'),
  extractConst(src, 'TREND_INTENSITY_BOOST'),
  extractConst(src, 'TREND_INTENSITY_CUT'),
  extractConst(src, 'TREND_RECOVERY_BOOST'),
  extractConst(src, 'CURRENT_PROGRAM_TREND_BOOST'),
  `var activeProgram = 'strength';`,
  extractFunction(src, 'scoreAllPrograms'),
  // STYLE_KEY_FOR_PROGRAM's own arrow-function bodies reference
  // activeMartialArt/activeCyclingStyle/etc via `typeof x !== 'undefined'`
  // checks, but recommendStyle below only ever tests the map's KEYS for
  // truthiness (never calls the functions it holds) — so none of those
  // style-selector globals need to exist in this sandbox.
  extractConst(src, 'STYLE_KEY_FOR_PROGRAM'),
  extractConst(src, 'STYLE_RECOMMENDATIONS'),
  extractFunction(src, 'recommendStyle'),
  extractFunction(src, 'recommendProgram'),
];

const { test, run } = makeRunner('test-program-recommendation.js');

test('base scores come straight from PROGRAM_FIT_SCORES when no bonuses apply', async (assert)=>{
  const [scores] = await runSandboxAsync(chunks, `
    __capture.push(await scoreAllPrograms({goal:'gain', bodyGoal:'', age:30}, null));
  `);
  assert.strictEqual(scores.bodybuilding, 95);
  assert.strictEqual(scores.medical, 15);
  assert.strictEqual(scores.strength, 90);
});

test('a physique-keyword bodyGoal boosts bodybuilding/powerlifting/powerbuilding by 8, clamped at 100', async (assert)=>{
  const [scores] = await runSandboxAsync(chunks, `
    __capture.push(await scoreAllPrograms({goal:'gain', bodyGoal:'classic physique look', age:30}, null));
  `);
  assert.strictEqual(scores.bodybuilding, 100, '95+8=103 must clamp to 100');
  assert.strictEqual(scores.powerbuilding, 100, '92+8=100 exactly');
  assert.strictEqual(scores.powerlifting, 93, '85+8, no clamping needed');
  assert.strictEqual(scores.strength, 90, 'not in the boosted set, must be unaffected');
});

test('the Senior program is scaled down smoothly below age 55, not treated as a flat cutoff', async (assert)=>{
  const [scores] = await runSandboxAsync(chunks, `
    __capture.push(await scoreAllPrograms({goal:'maintain', bodyGoal:'', age:25}, null));
  `);
  assert.strictEqual(scores.senior, 25.5, 'age 25: factor floors at 0.3x of the base-85 maintain score');
});

test('a thriving trend stacks BOTH the current-program boost and the high-intensity boost for a current high-intensity program', async (assert)=>{
  const [scores] = await runSandboxAsync(chunks, `
    var window_before = activeProgram;
    activeProgram = 'powerlifting';
    __capture.push(await scoreAllPrograms({goal:'gain', bodyGoal:'', age:30}, 'thriving'));
    activeProgram = window_before;
  `);
  assert.strictEqual(scores.powerlifting, 99, 'current (+6) AND high-intensity (+8) both apply: 85+6+8');
  assert.strictEqual(scores.oly, 78, 'high-intensity but NOT current: only +8 (70+8)');
});

test('an overreaching trend cuts high-intensity programs and boosts recovery-friendly ones', async (assert)=>{
  const [scores] = await runSandboxAsync(chunks, `
    __capture.push(await scoreAllPrograms({goal:'gain', bodyGoal:'', age:30}, 'overreaching'));
  `);
  assert.strictEqual(scores.oly, 60, 'high-intensity cut: 70-10');
  assert.strictEqual(scores.yoga, 43, 'recovery-friendly boost: 35+8');
});

test('scores never go below 0 or above 100 regardless of stacked bonuses', async (assert)=>{
  const [scores] = await runSandboxAsync(chunks, `
    __capture.push(await scoreAllPrograms({goal:'gain', bodyGoal:'classic physique', age:70}, 'thriving'));
  `);
  for(const [key, score] of Object.entries(scores)){
    assert.ok(score >= 0 && score <= 100, `${key}: score ${score} out of [0,100] range`);
  }
});

test('recommendProgram picks the highest-scoring program and returns an explanatory reason mentioning the actual bodyGoal', async (assert)=>{
  const [result] = await runSandboxAsync(chunks, `
    __capture.push(await recommendProgram({goal:'gain', bodyGoal:'classic physique', age:30}, null));
  `);
  assert.strictEqual(result.key, 'bodybuilding', 'bodybuilding (100) and powerbuilding (100) tie; bodybuilding must win the tie by real programs key order');
  assert.ok(result.why.includes('physique'), `expected the "why" text to reference the actual bodyGoal, got: ${result.why}`);
});

test('recommendProgram appends the trend-aware explanation only when the pick is actually a high-intensity/current-relevant one', async (assert)=>{
  // powerbuilding is both in HIGH_INTENSITY_PROGRAMS and the highest gain-goal
  // base score (92) by a wide enough margin that making it the active program
  // (stacking +6 current +8 high-intensity, clamped to 100) keeps it the
  // unambiguous top pick rather than accidentally tying with another program
  // that also gets the flat +8 — verified by running scoreAllPrograms first.
  const [thrivingResult] = await runSandboxAsync(chunks, `
    activeProgram = 'powerbuilding';
    __capture.push(await recommendProgram({goal:'gain', bodyGoal:'', age:30}, 'thriving'));
  `);
  assert.strictEqual(thrivingResult.key, 'powerbuilding');
  assert.ok(thrivingResult.why.includes('clean progression'), 'thriving + high-intensity pick should explain why, mentioning progression');
});

test('recommendProgram attaches no style suggestion when the pick is not a switcher container', async (assert)=>{
  const [result] = await runSandboxAsync(chunks, `
    __capture.push(await recommendProgram({goal:'gain', bodyGoal:'classic physique', age:30}, null));
  `);
  assert.strictEqual(result.key, 'bodybuilding');
  assert.strictEqual(result.style, null, 'bodybuilding is not one of the 5 real switcher containers in STYLE_KEY_FOR_PROGRAM');
});

// --- Style-level suggestion (recommendStyle) --------------------------------
// Tier 2: once a container program (combat/cycling/watersports/yoga/medical)
// is recommended, this picks which style WITHIN it to suggest. Tested here
// as direct calls to recommendStyle(programKey, p, trendStatus) rather than
// only through the full recommendProgram ranking, because medical's real
// base scores (15-33 across every goal in PROGRAM_FIT_SCORES, with nothing
// in scoreAllPrograms currently boosting it) mean it essentially never wins
// the overall ranking under realistic inputs — the style-pick logic itself
// is still real, tested behavior regardless of whether medical happens to
// be the #1 program for any given profile.

test('combat: with no age/trend signal, falls back to Kickboxing (the app\'s own default style) and says so honestly', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('combat', {goal:'lose', bodyGoal:'', age:25}, null));
  `);
  assert.deepStrictEqual(style, {key:'kickboxing', guess:true});
});

test('combat: age 55+ routes to Tai Chi as a genuine (non-guess) pick, not the default', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('combat', {goal:'lose', bodyGoal:'', age:60}, null));
  `);
  assert.deepStrictEqual(style, {key:'taiChi', guess:false});
});

test('combat: an overreaching trend also routes to Tai Chi even at a young age, matching how scoreAllPrograms already treats overreaching as a recovery signal', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('combat', {goal:'lose', bodyGoal:'', age:25}, 'overreaching'));
  `);
  assert.deepStrictEqual(style, {key:'taiChi', guess:false});
});

test('medical: a real, already-checked profile condition maps directly onto its matching style, not a guess', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('medical', {conditions:['hypertension']}, null));
  `);
  assert.deepStrictEqual(style, {key:'hypertension', guess:false});
});

test('medical: with more than one condition checked, the priority order picks the more specific/actionable one (osteoporosis over diabetes)', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('medical', {conditions:['diabetes','osteoporosis']}, null));
  `);
  assert.deepStrictEqual(style, {key:'osteoporosis', guess:false});
});

test('medical: no conditions checked falls back to Obesity-Modified (the app\'s own default style), honestly labeled as a guess', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('medical', {conditions:[]}, null));
  `);
  assert.deepStrictEqual(style, {key:'obesity', guess:true});
});

test('watersports, cycling, and yoga have no distinguishing signal in current profile data, so all three honestly fall back to their own default style', (assert)=>{
  const [watersports, cycling, yoga] = runSandbox(chunks, `
    __capture.push(recommendStyle('watersports', {goal:'performance', bodyGoal:'', age:30}, 'thriving'));
    __capture.push(recommendStyle('cycling', {goal:'performance', bodyGoal:'', age:30}, 'thriving'));
    __capture.push(recommendStyle('yoga', {goal:'performance', bodyGoal:'', age:30}, 'thriving'));
  `);
  assert.deepStrictEqual(watersports, {key:'surfing', guess:true});
  assert.deepStrictEqual(cycling, {key:'road', guess:true});
  assert.deepStrictEqual(yoga, {key:'flow', guess:true});
});

test('recommendStyle returns null for a program that is not a real switcher container, per STYLE_KEY_FOR_PROGRAM', (assert)=>{
  const [style] = runSandbox(chunks, `
    __capture.push(recommendStyle('strength', {goal:'gain', bodyGoal:'', age:30}, null));
  `);
  assert.strictEqual(style, null);
});

test('recommendProgram attaches a real style suggestion when the pick IS a switcher container, matching a direct recommendStyle call for the same inputs', async (assert)=>{
  // goal:'lose' base score: combat=85. With activeProgram='combat' and a
  // 'thriving' trend, combat stacks both the current-program (+6) and
  // high-intensity (+8) boosts (85+6+8=99) — comfortably ahead of the next
  // highest lose-goal score after the same boosts (hyrox 88+8=96), so this
  // is an unambiguous top pick, not a coincidental tie.
  const [result] = await runSandboxAsync(chunks, `
    activeProgram = 'combat';
    __capture.push(await recommendProgram({goal:'lose', bodyGoal:'', age:60}, 'thriving'));
  `);
  assert.strictEqual(result.key, 'combat');
  assert.ok(result.style, 'a container-program pick must carry a style suggestion');
  assert.strictEqual(result.style.key, 'taiChi', 'age 60 must route to Tai Chi, same as calling recommendStyle directly');
  assert.strictEqual(result.style.guess, false);
});

test('sabotage-relevant: recommendStyle is actually wired into recommendProgram (one real call site), not just defined and never called', (assert)=>{
  assert.strictEqual(countCallSites(src, 'recommendStyle'), 1);
});

run();
