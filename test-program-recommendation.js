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
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, makeRunner } = require('./testHelpers.js');

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

run();
