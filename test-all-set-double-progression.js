'use strict';
// v3.538 (BL-08, audit H-2): double progression requires every working set at
// the top of the range, not just the best one. A 4×4-6 logged 6, 5, 4, 4 at
// 185 used to say "add 10 lb"; the app's own tip says "on all sets".
//
// Rule: increase when every set at the top weight reached the top rep, either
//   - in the most recent session alone at RPE 8 or easier, or
//   - in two sessions in a row at the same weight (RPE 8.5 or easier, or not
//     logged; BL-02's criterion 10 keeps RPE 8.5 increasing).
// The clinical gate (medical, senior) adds RPE 7 or easier in both sessions.
// The one-session "try adding weight today" badge and field need every set at
// the top too.
//
// Real invocation: the real buildPastSessions (with sessionTopOf and
// topSetOf), analyzeProgressionSignal, computeSuggestedSet and
// buildProgressBadge, from logged entries.
//
// Sabotage: make buildPastSessions record minRepsAtTop as the top set's reps
// (the old top-set rule), and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-all-set-double-progression.js');

const FNS = ['isMissedSet', 'topSetOf', 'sessionTopOf', 'buildPastSessions', 'cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor',
  'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'analyzeProgressionSignal',
  'buildProgressBadge', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise',
  'isDumbbellExercise', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad'];
const CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES',
  'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'LB_PER_KG'];
const chunks = [
  "var loadSuggestionMode = 'progression'; var weightUnit = 'lb'; var selectedLogDate = '2026-11-09';",
  ...CONSTS.map(c => extractConst(src, c)),
  ...FNS.map(f => extractFunction(src, f)),
];

// The pipeline renderWorkout runs for one row, from the logged entries.
function row(log, ex, category, program){
  return runSandbox(chunks, `
    const log = ${JSON.stringify(log)};
    const ex = ${JSON.stringify(ex)};
    const past = buildPastSessions(log);
    const prior = [...log].sort((a,b)=> b.date < a.date ? -1 : 1)[0];
    const priorTop = sessionTopOf(prior);
    const signal = analyzeProgressionSignal(past, ex, ${JSON.stringify(category)}, ${JSON.stringify(program)});
    const rpeCtx = {e1rm: null, week: 2, program: ${JSON.stringify(program)}, category: ${JSON.stringify(category)}};
    const sug = computeSuggestedSet(prior.sets[0], signal, false, ${JSON.stringify(category)}, ex, priorTop, rpeCtx, prior);
    const badge = buildProgressBadge({ex, signal, inDeloadWeek: false, priorTop, topRep: parseTopRep(ex.sets), rpeCtx, sourceNote: '', prior});
    __capture.push({past, signal: signal && signal.type, sug, badge: badge.html, priorW: prior.sets[0].weight});`)[0];
}
const set = (w, r, rpe) => ({weight: w, reps: r, rpe: rpe == null ? null : rpe});
const SQUAT = {name: 'Back Squat', sets: '4×4-6'};

test('criterion 1: pyramid 6, 5, 4, 4 at 185 on 4×4-6: minRepsAtTop 4, no increase, no heavier suggestion, no "add" badge (with and without RPE)', (assert)=>{
  for(const rpe of [8, null]){
    const log = [
      {date: '2026-11-02', sets: [set(185, 6, rpe), set(185, 5, rpe), set(185, 4, rpe), set(185, 4, rpe)]},
      {date: '2026-11-05', sets: [set(185, 6, rpe), set(185, 5, rpe), set(185, 4, rpe), set(185, 4, rpe)]},
    ];
    const r = row(log, SQUAT, 'squat', 'strength');
    assert.strictEqual(r.past[0].minRepsAtTop, 4, 'rpe ' + rpe);
    assert.strictEqual(r.past[0].reps, 6, 'the top set is still 6');
    assert.notStrictEqual(r.signal, 'increase', 'rpe ' + rpe);
    assert.ok(r.sug == null || r.sug.weight <= r.priorW, 'no heavier suggestion: ' + JSON.stringify(r.sug));
    assert.doesNotMatch(r.badge, /\badd|try adding/i, r.badge);
  }
});

test('criterion 2: one past session, every set 6 at RPE 8: increase', (assert)=>{
  const r = row([{date: '2026-11-05', sets: [set(185, 6, 8), set(185, 6, 8), set(185, 6, 8), set(185, 6, 8)]}], SQUAT, 'squat', 'strength');
  assert.strictEqual(r.signal, 'increase');
  assert.ok(r.sug && r.sug.weight > 185, JSON.stringify(r.sug));
  assert.match(r.badge, /add/i);
});

test('criterion 3: two sessions, every set 6, no RPE: increase', (assert)=>{
  const s = [set(185, 6), set(185, 6), set(185, 6), set(185, 6)];
  const r = row([{date: '2026-11-02', sets: s}, {date: '2026-11-05', sets: s}], SQUAT, 'squat', 'strength');
  assert.strictEqual(r.signal, 'increase');
});

test('criterion 4: one session, every set 6, no RPE: no increase signal', (assert)=>{
  const r = row([{date: '2026-11-05', sets: [set(185, 6), set(185, 6), set(185, 6), set(185, 6)]}], SQUAT, 'squat', 'strength');
  assert.strictEqual(r.signal, null);
});

test('criterion 5: hypertension Seated Cable Row 2×12, both sets 12 at RPE 8 in two sessions, medical: no increase; RPE 7 increases (clinical gate inherited)', (assert)=>{
  const ROW = {name: 'Seated Cable Row', sets: '2×12'};
  const at = (rpe) => [{date: '2026-11-02', sets: [set(60, 12, rpe), set(60, 12, rpe)]}, {date: '2026-11-05', sets: [set(60, 12, rpe), set(60, 12, rpe)]}];
  assert.strictEqual(row(at(8), ROW, 'pull', 'medical').signal, null);
  assert.strictEqual(row(at(7), ROW, 'pull', 'medical').signal, 'increase');
  // The all-set rule applies on clinical plans too: 12, 11 at RPE 7 holds.
  const mixed = [{date: '2026-11-02', sets: [set(60, 12, 7), set(60, 11, 7)]}, {date: '2026-11-05', sets: [set(60, 12, 7), set(60, 11, 7)]}];
  assert.strictEqual(row(mixed, ROW, 'pull', 'medical').signal, null);
});

test('a back-off set at a lighter weight does not hold the lift back: 6, 6 at 185 then 8 at 155 (RPE 8) increases', (assert)=>{
  const r = row([{date: '2026-11-05', sets: [set(185, 6, 8), set(185, 6, 8), set(155, 8, 8)]}], SQUAT, 'squat', 'strength');
  assert.strictEqual(r.past[0].minRepsAtTop, 6);
  assert.strictEqual(r.signal, 'increase');
});

test('the one-session "try adding weight" badge and field need every set at the top (no RPE, so no signal)', (assert)=>{
  const all = row([{date: '2026-11-05', sets: [set(185, 6), set(185, 6), set(185, 6)]}], SQUAT, 'squat', 'strength');
  assert.match(all.badge, /try adding weight/);
  assert.ok(all.sug && all.sug.weight > 185, JSON.stringify(all.sug));
  const some = row([{date: '2026-11-05', sets: [set(185, 6), set(185, 6), set(185, 5)]}], SQUAT, 'squat', 'strength');
  assert.doesNotMatch(some.badge, /try adding weight/);
  assert.ok(some.sug == null || some.sug.weight <= 185, JSON.stringify(some.sug));
});

test('review fix: easy back-off sets do not hide grinding top sets (185×6 ×2 at RPE 9.5, back-offs at RPE 6): no one-session increase', (assert)=>{
  const r = row([{date: '2026-11-05', sets: [set(185, 6, 9.5), set(185, 6, 9.5), set(135, 8, 6), set(135, 8, 6)]}], SQUAT, 'squat', 'strength');
  assert.strictEqual(r.past[0].topRpe, 9.5);
  assert.strictEqual(r.signal, null);
});

test('anchor: renderWorkout passes the prior entry to the badge and to both suggestion calls', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/buildProgressBadge\(\{[^}]*\bprior\}\)/g) || []).length, 1);
  assert.strictEqual((body.match(/computeSuggestedSet\([^)]*rpeCtx, prior\)/g) || []).length, 2);
});

// v3.551 (BL-15, audit M-2): the decrease waits for two short sessions (or
// one at RPE 10); the drop is 5% upper body, 7.5% lower; the badge names the
// loadable figure the field fills in; the clinical plans keep their v3.527
// rule. Sabotage: restore the one-session rule and criterion 1 fails.
const BENCH = {name: 'Bench Press', sets: '3×8-10'};
const SQ = {name: 'Back Squat', sets: '3×8-10'};
const sess = (date, w, reps, rpe) => ({date, sets: reps.map(r => set(w, r, rpe))});
const badgeFigure = (html) => { const m = /drop to ~?([\d.]+) lb/.exec(html); return m ? Number(m[1]) : null; };

test('BL-15 criterion 1: one short session (the one before in range) is no decrease', (assert)=>{
  const r = row([sess('2026-11-02', 200, [9, 9, 9], 8), sess('2026-11-05', 200, [7, 7, 6], 9)], BENCH, 'push', 'strength');
  assert.strictEqual(r.past[0].reps, 7, 'anchor: the newest session is below the 8-rep floor');
  assert.notStrictEqual(r.signal, 'decrease');
});

test('BL-15 criterion 2: two short sessions on Bench at 200 decrease, and the field is snapToLoadable(190) or below', (assert)=>{
  const r = row([sess('2026-11-02', 200, [7, 7, 6], 9), sess('2026-11-05', 200, [7, 6, 6], 9)], BENCH, 'push', 'strength');
  assert.strictEqual(r.signal, 'decrease');
  const [cap] = runSandbox(chunks, `__capture.push(snapToLoadable(190, 'Bench Press', 'down'));`);
  assert.ok(r.sug.weight <= cap, `${r.sug.weight} <= ${cap}`);
  assert.strictEqual(r.sug.weight, 190, '5% of 200 for an upper-body lift');
  // The older session lighter than the newer still counts (same or heavier now).
  const up = row([sess('2026-11-02', 195, [7, 7, 7], 9), sess('2026-11-05', 200, [7, 6, 6], 9)], BENCH, 'push', 'strength');
  assert.strictEqual(up.signal, 'decrease');
  // Lighter now than before: not the same load failing twice.
  const down = row([sess('2026-11-02', 205, [7, 7, 7], 9), sess('2026-11-05', 200, [7, 6, 6], 9)], BENCH, 'push', 'strength');
  assert.notStrictEqual(down.signal, 'decrease');
});

test('BL-15 criterion 3: one short session at RPE 10 decreases', (assert)=>{
  const r = row([sess('2026-11-02', 200, [9, 9, 9], 8), sess('2026-11-05', 200, [7, 6, 6], 10)], BENCH, 'push', 'strength');
  assert.strictEqual(r.signal, 'decrease');
  const nine = row([sess('2026-11-02', 200, [9, 9, 9], 8), sess('2026-11-05', 200, [7, 6, 6], 9.5)], BENCH, 'push', 'strength');
  assert.notStrictEqual(nine.signal, 'decrease', 'RPE 9.5 is not 10');
});

test('BL-15 criterion 4: the badge names the field\'s figure, upper body (5%) and lower body (7.5%)', (assert)=>{
  const b = row([sess('2026-11-02', 200, [7, 7, 6], 9), sess('2026-11-05', 200, [7, 6, 6], 9)], BENCH, 'push', 'strength');
  assert.strictEqual(badgeFigure(b.badge), b.sug.weight, b.badge);
  const q = row([sess('2026-11-02', 300, [7, 7, 6], 9), sess('2026-11-05', 300, [7, 6, 6], 9)], SQ, 'squat', 'strength');
  assert.strictEqual(q.signal, 'decrease');
  assert.strictEqual(badgeFigure(q.badge), q.sug.weight, q.badge);
  assert.strictEqual(q.sug.weight, 275, '7.5% of 300 is 22.5, 277.5 snaps down to 275');
});

test('BL-15 criterion 5: on Medical the decrease rule is v3.527\'s: one short session decreases, by 7.5% even upper body', (assert)=>{
  const r = row([sess('2026-11-02', 100, [9, 9, 9], 6), sess('2026-11-05', 100, [7, 7, 6], 7)], BENCH, 'push', 'medical');
  assert.strictEqual(r.signal, 'decrease');
  const two = row([sess('2026-11-02', 100, [7, 7, 7], 6), sess('2026-11-05', 100, [7, 7, 6], 7)], BENCH, 'push', 'medical');
  assert.notStrictEqual(two.signal, 'decrease', 'as before: the older session must have been in range');
  const [drop] = runSandbox(chunks, `__capture.push(analyzeProgressionSignal([{weight: 200, reps: 7, avgRpe: 7}, {weight: 200, reps: 9, avgRpe: 6}], {name: 'Bench Press', sets: '3×8-10'}, 'push', 'senior').dropLb);`);
  assert.strictEqual(drop, 15, '7.5% of 200 on Senior');
});

test('BL-15 review fixes: RPE 10 is the top set\'s, back-off rows keep their own drop, and RPE 10 after a heavier session does not stack', (assert)=>{
  const top10 = {date: '2026-11-05', sets: [set(200, 6, 10), set(150, 9, 8), set(150, 9, 8)]};
  const r = row([sess('2026-11-02', 200, [9, 9, 9], 8), top10], BENCH, 'push', 'strength');
  assert.strictEqual(r.signal, 'decrease', 'the top set ground out at RPE 10, though the average is under 10');
  const [backoff] = runSandbox(chunks, `
    const prior = {date: '2026-11-05', sets: [{weight: 150, reps: 7, rpe: 9}]};
    const signal = {type: 'decrease', dropLb: 10};
    __capture.push(computeSuggestedSet(prior.sets[0], signal, false, 'push', {name: 'Bench Press', sets: '3×8-10'}, {weight: 200, reps: 7}, {e1rm: null, week: 2, program: 'strength', category: 'push'}, prior).weight);`);
  assert.strictEqual(backoff, 140, 'a 150 back-off row drops to 140, not to the top set\'s 190');
  const stacked = row([sess('2026-11-02', 200, [6, 6, 6], 10), sess('2026-11-05', 190, [7, 7, 7], 10)], BENCH, 'push', 'strength');
  assert.notStrictEqual(stacked.signal, 'decrease', 'already dropped to 190 after a 200 at RPE 10: no second drop');
});

run();
