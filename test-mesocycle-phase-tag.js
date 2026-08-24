'use strict';
// Behavioral coverage for mesocyclePhaseTag — the always-visible day-header
// phase indicator, distinct from the duration-tag suffix (which only shows
// up on weeks where THIS specific day deviates from baseline). Real
// invocation against the actual function, no re-implementation of its
// branching. Sabotage anchor: exact text AND exact className, both — a
// bug that got the label right but left the deload CSS class off (or vice
// versa) would still fail here.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const chunks = [
  extractConst(src, 'DELOAD_CYCLE_WEEKS'),
  extractFunction(src, 'mesocyclePhaseTag'),
];

const { test, run } = makeRunner('test-mesocycle-phase-tag.js');

function tagFor(cyclePos, inDeloadWeek){
  const [result] = runSandbox(chunks, `__capture.push(mesocyclePhaseTag(${cyclePos}, ${inDeloadWeek}));`);
  return result;
}

test('week 1 (start of the block), not a deload week: "Week 1 of 5 · Accumulation", neutral class', (assert)=>{
  const tag = tagFor(1, false);
  assert.strictEqual(tag.text, 'Week 1 of 5 · Accumulation');
  assert.strictEqual(tag.className, 'mesocycle-phase-tag');
});

test('week 3 (peak accumulation), not a deload week: "Week 3 of 5 · Accumulation"', (assert)=>{
  const tag = tagFor(3, false);
  assert.strictEqual(tag.text, 'Week 3 of 5 · Accumulation');
  assert.strictEqual(tag.className, 'mesocycle-phase-tag');
});

test('week 5, deload week: "Week 5 of 5 · Deload" with the deload CSS class', (assert)=>{
  const tag = tagFor(5, true);
  assert.strictEqual(tag.text, 'Week 5 of 5 · Deload');
  assert.strictEqual(tag.className, 'mesocycle-phase-tag deload');
});

test('SABOTAGE ANCHOR: manual deload override on an early cycle week still reports that ACTUAL cyclePos, not a hardcoded 5 — "Week 2 of 5 · Deload"', (assert)=>{
  // isDeloadWeek() can return true off a manual override even when cyclePos
  // isn't really 5 (see manualDeloadEnabled) — the tag must reflect the real
  // week position passed in, not assume deload always means position 5.
  const tag = tagFor(2, true);
  assert.strictEqual(tag.text, 'Week 2 of 5 · Deload', 'a manually-triggered deload on cycle week 2 must still say week 2, not silently normalize to 5');
  assert.strictEqual(tag.className, 'mesocycle-phase-tag deload');
});

test('never says "Deload" while inDeloadWeek is false, regardless of cyclePos', (assert)=>{
  for(const pos of [1,2,3,4,5]){
    const tag = tagFor(pos, false);
    assert.ok(!tag.text.includes('Deload'), `cyclePos ${pos} with inDeloadWeek=false must not say Deload`);
    assert.strictEqual(tag.className, 'mesocycle-phase-tag');
  }
});

run();
