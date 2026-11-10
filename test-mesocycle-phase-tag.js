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
  // v3.543 (BL-66): the tag now reads the program gate.
  extractConst(src, 'VOLUME_MODIFIER_PROGRAMS'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'),
  extractFunction(src, 'isCustomProgramKey'), extractFunction(src, 'volumeModifiersApply'),
  extractFunction(src, 'mesocyclePhaseTag'),
];

const { test, run } = makeRunner('test-mesocycle-phase-tag.js');

function tagFor(cyclePos, inDeloadWeek, program = 'strength'){
  const [result] = runSandbox(chunks, `__capture.push(mesocyclePhaseTag(${cyclePos}, ${inDeloadWeek}, ${JSON.stringify(program)}));`);
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

// --- Gym Mode regression: found and fixed in the same session this feature
// shipped. #mesocyclePhaseTag sits between .workout-hero and .duration-row
// in the markup, and gym mode's own CSS already hides that entire header
// region (day title, plate icon, duration, insight card) via an explicit
// hide-list — but the new tag wasn't added to that list, so it rendered as
// an orphaned pill floating alone at the top of the screen with none of its
// surrounding context, confirmed via a real screenshot before this fix
// landed. Gym mode deliberately shows nothing at the day-header level (its
// own dock only has a clock/progress/exit button), so hiding the tag there
// — not mirroring it into the dock — matches the mode's own established
// minimalism, same as .workout-hero and .duration-row already do.
test('sabotage-relevant: .mesocycle-phase-tag is hidden in Gym Mode, in the same rule block as .workout-hero and .duration-row', (assert)=>{
  const hideListRe = /body\.gym-mode #workoutCard \.workout-hero,[\s\S]*?display:none !important;\s*\}/;
  const m = hideListRe.exec(src);
  assert.ok(m, 'the gym-mode #workoutCard hide-list block must exist');
  assert.match(m[0], /body\.gym-mode #workoutCard \.mesocycle-phase-tag/, '.mesocycle-phase-tag must be in the hide list — without it, it renders as an orphaned pill with no surrounding context once .workout-hero and .duration-row are hidden');
});

// ---- v3.543 (BL-66): the phase tag stops saying "Accumulation" where no
// block sets are added.
test('BL-66 criterion 1: (3, false, medical) → "Week 3 of 5", neutral class', (assert)=>{
  const t = tagFor(3, false, 'medical');
  assert.strictEqual(t.text, 'Week 3 of 5');
  assert.strictEqual(t.className, 'mesocycle-phase-tag');
});

test('BL-66 criterion 2: strength and a custom program keep "Week 3 of 5 · Accumulation"', (assert)=>{
  assert.strictEqual(tagFor(3, false, 'strength').text, 'Week 3 of 5 · Accumulation');
  assert.strictEqual(tagFor(3, false, 'custom:abc').text, 'Week 3 of 5 · Accumulation');
});

test('BL-66 criterion 3: (5, true, medical) keeps "Week 5 of 5 · Deload" and the deload class', (assert)=>{
  const t = tagFor(5, true, 'medical');
  assert.strictEqual(t.text, 'Week 5 of 5 · Deload');
  assert.strictEqual(t.className, 'mesocycle-phase-tag deload');
});

test('BL-66 criterion 4: every program outside the allowlist (21) gets no "Accumulation" in weeks 1-4', (assert)=>{
  const [r] = runSandbox([extractConst(src, 'programs'), ...chunks], `
    const gated = Object.keys(programs).filter(k => !volumeModifiersApply(k));
    const bad = [];
    for(const k of gated) for(const w of [1, 2, 3, 4]) if(/Accumulation/.test(mesocyclePhaseTag(w, false, k).text)) bad.push(k + ' w' + w);
    __capture.push({n: gated.length, bad});`);
  assert.strictEqual(r.n, 21);
  assert.deepStrictEqual(r.bad, []);
});

test('BL-66 criterion 5: renderWorkout makes exactly one mesocyclePhaseTag call, passing activeProgram (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/mesocyclePhaseTag\(/g) || []).length, 1);
  assert.strictEqual((body.match(/mesocyclePhaseTag\(cyclePos, inDeloadWeek, activeProgram\)/g) || []).length, 1);
});

run();
