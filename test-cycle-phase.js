'use strict';
// Behavioral coverage for computeCyclePhase — Tier 2. Pure date-math over a
// self-reported last-period date and cycle length, with a modulo trick
// specifically built (per its own comment) to handle a last-period date
// that's after "today" too (a plausible data-entry case, not just a
// theoretical one). getTodayKey() reads the real system clock, so every
// scenario here is built relative to the real "today" (same pattern as
// test-streak.js), computed and verified numerically before being written
// into assertions.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractFunction(src, 'getTodayKey'),
  extractConst(src, 'CYCLE_PHASES'),
  extractFunction(src, 'computeCyclePhase'),
];

function dateOffset(days){
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const { test, run } = makeRunner('test-cycle-phase.js');

test('2 days since last period (28-day cycle) is menstrual, day 3', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(computeCyclePhase(${JSON.stringify(dateOffset(-2))}, 28));`);
  assert.strictEqual(result.dayInCycle, 3);
  assert.strictEqual(result.phase.key, 'menstrual');
  assert.strictEqual(result.dayRangeLabel, 'Days 1-5');
});

test('10 days since last period (28-day cycle) is follicular, day 11', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(computeCyclePhase(${JSON.stringify(dateOffset(-10))}, 28));`);
  assert.strictEqual(result.dayInCycle, 11);
  assert.strictEqual(result.phase.key, 'follicular');
  assert.strictEqual(result.dayRangeLabel, 'Days 6-13');
});

test('13 days since last period (28-day cycle) crosses into ovulation, day 14', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(computeCyclePhase(${JSON.stringify(dateOffset(-13))}, 28));`);
  assert.strictEqual(result.dayInCycle, 14);
  assert.strictEqual(result.phase.key, 'ovulation');
  assert.strictEqual(result.dayRangeLabel, 'Days 14-15');
});

test('20 days since last period (28-day cycle) is luteal, day 21', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(computeCyclePhase(${JSON.stringify(dateOffset(-20))}, 28));`);
  assert.strictEqual(result.dayInCycle, 21);
  assert.strictEqual(result.phase.key, 'luteal');
  assert.strictEqual(result.dayRangeLabel, 'Days 16-28');
});

test('a last-period date entered as ONE DAY IN THE FUTURE still resolves to a valid positive day, not a broken negative one', (assert)=>{
  // daysSince = -1. The modulo trick this function documents specifically
  // for this case must produce day 28 of a 28-day cycle (luteal), not -1,
  // NaN, or day 0.
  const [result] = runSandbox(chunks, `__capture.push(computeCyclePhase(${JSON.stringify(dateOffset(1))}, 28));`);
  assert.strictEqual(result.dayInCycle, 28);
  assert.strictEqual(result.phase.key, 'luteal');
});

test('ovulation day scales with a longer cycle length (35 days -> ovulation day 21, not a fixed day 14)', (assert)=>{
  const [result] = runSandbox(chunks, `__capture.push(computeCyclePhase(${JSON.stringify(dateOffset(-20))}, 35));`);
  assert.strictEqual(result.dayInCycle, 21);
  assert.strictEqual(result.phase.key, 'ovulation', 'day 21 of a 35-day cycle should be the ovulation window, not luteal');
});

run();
