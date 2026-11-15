'use strict';
// v3.557 (BL-57, audit D-6/D-11): the rest parser reads trailing multipliers
// ("5 breaths ×3"), per-side mobility ("2×5/side"), plyometrics and swim
// repeats correctly, on top of BL-14's unit branch.
//
// Real invocation: the real getRepRangeTier, prescriptionCount, restUnitKind,
// getDefaultRestSeconds and getRestReasonLabel with the real exerciseInfo and
// EXERCISE_MOVE, over a table and a sweep of every built-in slot.
//
// Sabotage: remove branch 1 (trailing multipliers) and the Downward Dog case
// fails.
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rest-tier-parsing.js');
const INFO = extractConst(fs.readFileSync(path.join(__dirname, 'content-exercises.js'), 'utf8'), 'exerciseInfo');
const CHUNKS = [INFO, ...['EXERCISE_MOVE', 'WARMUP_ELIGIBLE_CATEGORIES', 'NON_REP_UNITS', 'REST_BY_UNIT'].map(c => extractConst(src, c)),
  ...['prescriptionCount', 'getRepRangeTier', 'restUnitKind', 'getDefaultRestSeconds', 'getRestReasonLabel'].map(f => extractFunction(src, f))];
const rest = (cases) => runSandbox(CHUNKS, `__capture.push(${JSON.stringify(cases)}.map(ex => ({sec: getDefaultRestSeconds(ex), label: getRestReasonLabel(ex), tier: getRepRangeTier(ex.sets)})));`)[0];

test('acceptance: each case\'s rest, with a label that names the same branch', (assert)=>{
  const cases = [
    [{name: 'Downward Dog', sets: '5 breaths ×3', noWeight: true}, 30, 'Flow · move on when ready'],
    [{name: 'Hip CARs', sets: '2×5/side', noWeight: true}, 45, 'Mobility · easy pace'],
    [{name: 'Single-Leg Bound', sets: '3×5/leg'}, 90, 'Plyometrics · full recovery'],
    [{name: 'Single-Leg Bound', sets: '3×6/leg'}, 90, 'Plyometrics · full recovery'],
    [{name: 'Swim Intervals (100s)', sets: '8×100m', noWeight: true}, 20, 'Swim repeats · short rest'],
    [{name: 'Bench Press', sets: '4×4-6'}, 240, 'Strength range · low reps'],
    [{name: 'Lateral Raise', sets: '3×12-15'}, 75, 'Endurance range · isolation'],
    [{name: 'Depth Jump', sets: '3×5'}, 120, 'Heavy plyometrics · full recovery'],
    [{name: 'Air Squat', sets: '6 reps ×3'}, 60, 'Rounds of reps · short reset'],
  ];
  const r = rest(cases.map(c => c[0]));
  cases.forEach(([ex, sec, label], i) => {
    assert.strictEqual(r[i].sec, sec, `${ex.name} ${ex.sets}`);
    assert.strictEqual(r[i].label, label, `${ex.name} ${ex.sets} label`);
  });
  assert.strictEqual(r[0].tier, null, 'a trailing multiplier has no rep tier');
});

test('sweep: no core or shoulder noWeight slot, and no trailing-multiplier slot, in any built-in program or style gets 240 s', (assert)=>{
  const [r] = runSandbox([...CHUNKS, ...['programs', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES'].map(c => extractConst(src, c))], `
    const bad = []; let n = 0;
    const visit = (days) => { for(const d of Object.values(days || {})) for(const ex of d.exercises || []){
      const cat = (exerciseInfo[ex.name] || {}).category;
      const watch = ((cat === 'core' || cat === 'shoulder') && ex.noWeight) || /^\\d+(?:-\\d+)?\\s*(?:reps?|breaths?|min)[^×]*×\\s*\\d+\\s*$/i.test(ex.sets || '');
      if(!watch) continue; n++;
      if(getDefaultRestSeconds(ex) === 240) bad.push(ex.name + ' ' + ex.sets);
    } };
    for(const p of Object.values(programs)) visit(p.days);
    for(const T of [MEDICAL_STYLES, COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES]) for(const st of Object.values(T)) visit(st.days);
    __capture.push({n, bad: [...new Set(bad)]});`);
  assert.ok(r.n > 100, 'anchor: slots checked ' + r.n);
  assert.deepStrictEqual(r.bad, []);
});

run();
