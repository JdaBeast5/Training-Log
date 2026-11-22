'use strict';
// v3.620 (BL-31): weekly ±1 set per muscle, from your own performance. Per
// muscle (EXERCISE_MUSCLES primaries only), last week either "met" (every
// working set reached the bottom of its rep range and every logged RPE was at
// or under 10 − the bottom of BL-10's RIR band; at least one RPE logged) or
// "fell" (a primary's top set lost reps at the same weight); fell wins. The
// running map is clamped to −1…+4, kept in 'muscle-volume-adj', empty in week
// 1 of each block and not applied in the deload week. The change lands on the
// muscle's first primary exercise of the day, after applyAccumulation, with
// its reason on the row; never below 1 set; only where volumeModifiersApply.
//
// Real invocation: the real computeMuscleSetAdjust, muscleWeekVerdict,
// muscleRpeCeiling, applyMuscleSetAdjust, loadMuscleSetAdjust and
// applyAccumulation over the real programs, exerciseInfo, EXERCISE_MUSCLES,
// RIR_TARGETS and the BL-01 allowlist, with stub window.storage and a fixed
// getTodayKey.
//
// Sabotage: drop the RPE condition and criterion 4 fails; drop the clamp and
// criterion 3 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-muscle-set-autoreg.js');

const CHUNKS = [
  ...['exerciseInfo', 'programs', 'MEDICAL_STYLES', 'CUSTOM_PROGRAM_PREFIX', 'DELOAD_CYCLE_WEEKS', 'ACCUMULATION_ADDS', 'COMPOUND_CATEGORIES',
    'VOLUME_MODIFIER_PROGRAMS', 'RIR_TARGETS', 'RIR_SPEED_CATEGORIES', 'RIR_NO_LABEL_CATEGORIES', 'RIR_NO_LABEL_NAME', 'LEDGER_MUSCLES', 'EXERCISE_MUSCLES',
    'MUSCLE_ADJ_MIN', 'RIR_BAND_BOTTOM'].map(c => extractConst(src, c)),
  ...['isCustomProgramKey', 'volumeModifiersApply', 'parseSetCount', 'hasNumericSetPrefix', 'replaceSetCount', 'cycleWeekOf', 'applyAccumulation',
    'getRepRangeTier', 'targetRirLabel', 'isMissedSet', 'topSetOf', 'sessionTopOf', 'entriesForExercise', 'dateKeyMinusDays', 'mondayOf',
    'muscleRirTier', 'muscleRpeCeiling', 'muscleWeekVerdict', 'computeMuscleSetAdjust', 'applyMuscleSetAdjust', 'loadMuscleSetAdjust'].map(f => extractFunction(src, f)),
  // Unstamped (legacy) entries count as this slot's own here; stamped ones must carry the name (BL-51).
  `function legacyEntriesUnambiguous(){ return true; }
   var D1 = programs.strength.days.d1.exercises;
   function corpusOf(logs){ return Object.entries(logs).map(([name, log]) => ({exDef: (D1.find(e => e.name === name) || {name, sets: '3×8-12'}), log})); }`,
];
const LAST = '2026-11-09', BEFORE = '2026-11-02'; // last week's Monday, and the week before
const set = (weight, reps, rpe) => rpe === undefined ? {weight, reps} : {weight, reps, rpe};
const day = (date, sets) => ({date, sets});
function runIt(body){ return runSandbox(CHUNKS, body); }

test('criterion 1: every chest primary set met target at RPE ≤ 8: {chest: 1}; next week strength d1 has Bench Press one set more than applyAccumulation alone, with the reason', (assert)=>{
  const logs = {'Bench Press': [day(LAST, [set(160, 6, 7), set(160, 5, 8), set(160, 5, 8), set(160, 4, 8)]), day('2026-11-12', [set(165, 5, 7.5)])]};
  const [r] = runIt(`
    const why = {};
    const adj = computeMuscleSetAdjust(corpusOf(${JSON.stringify(logs)}), '${LAST}', {}, 'strength', why);
    const acc = applyAccumulation(D1, 3, 'strength');
    const both = applyMuscleSetAdjust(acc, adj, 'strength', why);
    __capture.push({adj, accBench: acc[0], bench: both[0], others: both.slice(1).map((e, i) => e === acc[i + 1])});`);
  assert.deepStrictEqual(r.adj, {chest: 1});
  const n = s => Number(/^(\d+)/.exec(s)[1]);
  assert.strictEqual(r.accBench.name, 'Bench Press', 'anchor: d1 leads with Bench');
  assert.strictEqual(n(r.bench.sets), n(r.accBench.sets) + 1, `${r.accBench.sets} → ${r.bench.sets}`);
  assert.strictEqual(r.bench.accumulated, true, 'anchor: week 3 accumulation ran first, and this stacks on it');
  assert.deepStrictEqual(r.bench.muscleAdjusted, {n: 1, reason: '+1 set: every chest set hit its target at RPE 8 or less'});
  assert.ok(r.others.every(Boolean), 'no other row touched');
});

test('criterion 2: Bench\'s top set fell from 6 to 4 reps at 160 lb: {chest: −1} (one lower than before); never below 1 set on the row', (assert)=>{
  const logs = {'Bench Press': [day(BEFORE, [set(160, 6, 8)]), day(LAST, [set(160, 4, 8)])]};
  const [r] = runIt(`
    const c = corpusOf(${JSON.stringify(logs)});
    const fromNone = computeMuscleSetAdjust(c, '${LAST}', {}, 'strength');
    const fromTwo = computeMuscleSetAdjust(c, '${LAST}', {chest: 2}, 'strength');
    const one = applyMuscleSetAdjust([{name: 'Bench Press', sets: '1×4-6'}], {chest: -1}, 'strength');
    const four = applyMuscleSetAdjust([{name: 'Bench Press', sets: '4×4-6'}], {chest: -1}, 'strength');
    __capture.push({fromNone, fromTwo, one, four});`);
  assert.deepStrictEqual(r.fromNone, {chest: -1});
  assert.deepStrictEqual(r.fromTwo, {chest: 1}, 'one lower than before');
  assert.deepStrictEqual(r.one, [{name: 'Bench Press', sets: '1×4-6'}], 'never below 1 set (and no reason when nothing changed)');
  assert.strictEqual(r.four[0].sets, '3×4-6');
  assert.deepStrictEqual(r.four[0].muscleAdjusted, {n: -1, reason: '−1 set: your chest reps fell at the same weight'});
});

test('criterion 2b: fell wins over met (all sets met at RPE 7, but the top set lost a rep at the same weight)', (assert)=>{
  const logs = {'Bench Press': [day(BEFORE, [set(160, 6, 7)]), day(LAST, [set(160, 5, 7), set(160, 5, 7)])]};
  const [r] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify(logs)}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(r, {chest: -1});
});

test('criterion 3: five met weeks in a block cap at +4; the deload week (loadMuscleSetAdjust is not called there) and week 1 of a block give {} and the row is unchanged', async (assert)=>{
  const weeks = ['2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'];
  const logs = {'Bench Press': weeks.map(w => day(w, [set(160, 5, 8), set(160, 5, 8)]))};
  const [r] = runIt(`
    let adj = {}; const steps = [];
    for(const w of ${JSON.stringify(weeks)}){ adj = computeMuscleSetAdjust(corpusOf(${JSON.stringify(logs)}), w, adj, 'strength'); steps.push(adj.chest); }
    __capture.push({steps, row: applyMuscleSetAdjust(D1, {}, 'strength')[0] === D1[0]});`);
  assert.deepStrictEqual(r.steps, [1, 2, 3, 4, 4], 'capped at +4');
  assert.strictEqual(r.row, true, 'an empty map leaves the row as it is');
  // The stored map through the real loader: windows counted from program-cycle-start (2026-09-17, a Thursday), as the block is.
  const harness = (today, stored, overrides = {}) => `
    var __store = ${JSON.stringify(Object.assign({'program-cycle-start': '2026-09-17'}, stored))}; var __sets = 0;
    var window = {storage: {get: async k => k in __store ? {value: __store[k]} : null, set: async (k, v) => { __sets++; __store[k] = v; }}};
    function getTodayKey(){ return '${today}'; }
    async function getExOverrides(p, d){ return ${JSON.stringify(overrides)}[p + ':' + d] || {}; }
    async function readExCorpus(){ return corpusOf(${JSON.stringify(logs)}).map((c, i) => Object.assign(c, {parsed: {program: 'strength', dayId: 'd1', idx: 0}})); }`;
  // Today 2026-11-18 (Wed): the window that started Thu 2026-11-12; the one judged is 11-05 … 11-11 (Bench met on 11-09).
  const [fresh] = await runSandboxAsync([...CHUNKS, harness('2026-11-18', {'muscle-volume-adj': JSON.stringify({weekOf: '2026-11-05', block: 0, adj: {chest: 3}})})],
    `const w1 = await loadMuscleSetAdjust(6, 'strength'); __capture.push({w1, stored: JSON.parse(__store['muscle-volume-adj']), sets: __sets});`);
  assert.deepStrictEqual(fresh.w1.adj, {}, 'week 1 of the next block: {}');
  assert.deepStrictEqual(fresh.stored, {weekOf: '2026-11-12', block: 1, adj: {}, why: {}}, 'the reset is stored, with its block and the block\'s own window');
  const [mid] = await runSandboxAsync([...CHUNKS, harness('2026-11-18', {'muscle-volume-adj': JSON.stringify({weekOf: '2026-11-05', block: 0, adj: {chest: 1}})})],
    `const a = await loadMuscleSetAdjust(3, 'strength'); const b = await loadMuscleSetAdjust(3, 'strength'); __capture.push({a, b, sets: __sets});`);
  assert.deepStrictEqual(mid.a.adj, {chest: 2}, 'week 3: the judged window met, so +1 on the stored +1');
  assert.deepStrictEqual(mid.a.why, {chest: {v: 1, rpe: 8}});
  assert.deepStrictEqual(mid.b.adj, {chest: 2}, 'the same answer all window');
  assert.strictEqual(mid.sets, 1, 'computed and stored once per window');
  // A new block that was never seen in its week 1 (no render then): the stored map belongs to the old block, so it starts from {}.
  const [skipped] = await runSandboxAsync([...CHUNKS, harness('2026-11-18', {'muscle-volume-adj': JSON.stringify({weekOf: '2026-10-01', block: 0, adj: {chest: 3}})})],
    `__capture.push(await loadMuscleSetAdjust(7, 'strength'));`);
  assert.deepStrictEqual(skipped.adj, {chest: 1}, 'block 1, week 2: {} + this window\'s met, not 3 + 1');
  // Your own override's rep range is the one judged: Bench overridden to 3×8-10, so 5-rep sets don't reach it.
  const [ov] = await runSandboxAsync([...CHUNKS, harness('2026-11-18', {}, {'strength:d1': {'0': {name: 'Bench Press', sets: '3×8-10'}}})],
    `__capture.push(await loadMuscleSetAdjust(3, 'strength'));`);
  assert.deepStrictEqual(ov.adj, {}, 'judged against 8-10, not the program\'s 4-6');
  // A program that doesn't adjust volume neither reads the corpus nor stores anything.
  const [yoga] = await runSandboxAsync([...CHUNKS, harness('2026-11-18', {})], `const r = await loadMuscleSetAdjust(3, 'yoga'); __capture.push({r, sets: __sets});`);
  assert.deepStrictEqual(yoga, {r: {adj: {}, why: {}}, sets: 0});
  // In the deload week renderWorkout's deload branch runs instead (criterion 6 pins the call inside the non-deload branch).
});

test('criterion 4: a week with no RPE logged gives no add (reps alone never add a set)', (assert)=>{
  const logs = {'Bench Press': [day(LAST, [set(160, 6), set(160, 6), set(160, 5)])]};
  const [r] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify(logs)}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(r, {});
  const [over] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify({'Bench Press': [day(LAST, [set(160, 5, 9), set(160, 5, 8)])]})}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(over, {}, 'RPE 9 before the last set of a strength-tier lift (ceiling 8) is not met');
  const [short] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify({'Bench Press': [day(LAST, [set(160, 3, 7)])]})}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(short, {}, 'a set under the range\'s bottom (3 < 4) is not met');
});

test('criterion 5: on MEDICAL_STYLES programs and wherever volumeModifiersApply is false, applyMuscleSetAdjust returns the list byte-identical', (assert)=>{
  const [r] = runIt(`
    const adj = {chest: 1, quads: 2, lats: -1, 'upper back': 1};
    const progs = Object.keys(programs).filter(p => !volumeModifiersApply(p));
    const out = progs.map(p => { const list = Object.values(programs[p].days || {})[0]; const ex = (list && list.exercises) || [];
      return {p, same: applyMuscleSetAdjust(ex, adj, p) === ex, bytes: JSON.stringify(applyMuscleSetAdjust(ex, adj, p)) === JSON.stringify(ex)}; });
    const med = Object.keys(MEDICAL_STYLES).map(p => ({p, gated: !volumeModifiersApply(p)}));
    __capture.push({n: progs.length, out, med, positive: applyMuscleSetAdjust(D1, adj, 'strength') !== D1});`);
  assert.ok(r.n > 10, 'anchor: the gated built-in programs (' + r.n + ')');
  assert.deepStrictEqual(r.out.filter(x => !x.same || !x.bytes).map(x => x.p), []);
  assert.ok(r.med.length > 0 && r.med.every(x => x.gated), 'every medical style is gated');
  assert.strictEqual(r.positive, true, 'positive control: strength does change');
});

test('criterion 6: renderWorkout (comments stripped) calls applyMuscleSetAdjust( exactly once, right after applyAccumulation(, in the non-deload branch', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const calls = [...body.matchAll(/\bapplyMuscleSetAdjust\(/g)];
  assert.strictEqual(calls.length, 1);
  const acc = body.indexOf('applyAccumulation(fullExercises');
  assert.ok(acc > -1 && acc < calls[0].index, 'after applyAccumulation');
  assert.match(body.slice(acc, calls[0].index + 120), /^applyAccumulation\(fullExercises, mesoWeek, activeProgram\);\s*const muscleAdj = await loadMuscleSetAdjust\(mesoWeek, activeProgram\);\s*fullExercises = applyMuscleSetAdjust\(fullExercises, muscleAdj\.adj, activeProgram, muscleAdj\.why\);/);
  const deload = body.lastIndexOf('applyDeloadVolumeReduction(', calls[0].index);
  assert.ok(deload > -1 && /\}\s*else\s*\{/.test(body.slice(deload, calls[0].index)), 'inside the else of the deload branch');
});

test('synergists never trigger, and one row working two adjusted muscles changes once (fell wins)', (assert)=>{
  // Overhead Press credits triceps as a synergist only: a met week there changes nothing for triceps.
  const [syn] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify({'Overhead Press': [day(LAST, [set(95, 8, 8), set(95, 8, 8)])]})}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(syn, {'front delts': 1}, 'only its primary');
  const [row] = runIt(`__capture.push(applyMuscleSetAdjust([{name: 'Barbell Row', sets: '4×6-8'}], {'upper back': 1, lats: -1}, 'strength'));`);
  assert.strictEqual(row[0].sets, '3×6-8');
  assert.deepStrictEqual(row[0].muscleAdjusted, {n: -1, reason: '−1 set: your lats reps fell at the same weight'});
  const [both] = runIt(`__capture.push(applyMuscleSetAdjust([{name: 'Barbell Row', sets: '4×6-8'}], {'upper back': 1, lats: 1}, 'strength', {lats: {v: 1, rpe: 9}, 'upper back': {v: 1, rpe: 9}}));`);
  assert.strictEqual(both[0].sets, '5×6-8', 'once, not twice');
  assert.match(both[0].muscleAdjusted.reason, /^\+1 set: every lats and upper back set hit its target at RPE 9 or less$/);
});

test('review fixes: the strength tier\'s last set may be RPE 9; a session of only misses is a fall; another lift\'s stamped entries on the key are not judged', (assert)=>{
  const [last9] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify({'Bench Press': [day(LAST, [set(160, 5, 8), set(160, 5, 8), set(160, 5, 9)])]})}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(last9, {chest: 1}, '"last set 1–2": RPE 9 on the last set is on target');
  const [mid9] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify({'Bench Press': [day(LAST, [set(160, 5, 9), set(160, 5, 8)])]})}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(mid9, {}, 'but not on an earlier set');
  const [miss] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify({'Bench Press': [day(BEFORE, [set(160, 6, 8)]), day(LAST, [set(160, 0), set(160, 0)])]})}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(miss, {chest: -1}, 'every set missed at the same weight');
  const foreign = {'Bench Press': [day(BEFORE, [set(95, 8, 8)]), Object.assign(day(LAST, [set(95, 4, 8)]), {n: 'Overhead Press'}), Object.assign(day(LAST, [set(160, 5, 8)]), {n: 'Bench Press'})]};
  const [f] = runIt(`__capture.push(computeMuscleSetAdjust(corpusOf(${JSON.stringify(foreign)}), '${LAST}', {}, 'strength'));`);
  assert.deepStrictEqual(f, {chest: 1}, 'only Bench\'s own entries: no fall from the Overhead Press entry');
});

test('review fixes: the reason never claims a met week that didn\'t happen, and never prints "RPE null"', (assert)=>{
  const [r] = runIt(`__capture.push({
    kept: applyMuscleSetAdjust([{name: 'Bench Press', sets: '4×4-6'}], {chest: 1}, 'strength', {chest: {v: -1, rpe: 8}})[0].muscleAdjusted,
    noRpe: applyMuscleSetAdjust([{name: 'Bench Press', sets: '4×4-6'}], {chest: 1}, 'strength', {chest: {v: 1, rpe: null}})[0].muscleAdjusted,
    two: applyMuscleSetAdjust([{name: 'Bench Press', sets: '4×4-6'}], {chest: 2}, 'strength', {chest: {v: 1, rpe: 8}})[0].muscleAdjusted});`);
  assert.deepStrictEqual(r.kept, {n: 1, reason: '+1 set: kept from earlier this block (your chest reps fell last time, so one came off)'});
  assert.deepStrictEqual(r.noRpe, {n: 1, reason: '+1 set: every chest set hit its target'});
  assert.deepStrictEqual(r.two, {n: 2, reason: '+2 sets: every chest set hit its target at RPE 8 or less'});
});

run();
