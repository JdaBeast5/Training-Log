'use strict';
// v3.642 (BL-58, audit D-7, C-1, C-2; closes L-3): every exercise a program
// prescribes has a library entry and a move. The Light and Speed variants get
// their own entries (base lift's category, three cues, technique:true), and
// technique work never gets a load push. Six cycling entries no slot or swap
// table reaches are gone, and EXERCISE_MOVE has no key twice.
//
// Real invocation: the real exerciseInfo, programs, *_STYLES tables,
// PROGRAM_DAY_COUNT_VARIANTS, EXERCISE_MOVE, MOVEMENT_ICONS, EXERCISE_SUBS,
// SUBSTITUTION_MAP, REGION_RELIEF and MUSCLE_GROUP_MAP; the real
// buildPastSessions, analyzeProgressionSignal, computeSuggestedSet and
// buildProgressBadge on logged entries.
//
// Sabotage: delete one new entry and criterion 1 fails; drop the technique
// check from analyzeProgressionSignal and criterion 3 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-exercise-library-coverage.js');

const NEW = {
  'Squat (Speed)': 'squat', 'Bench Press (Speed)': 'push', 'Deadlift (Light/Technique)': 'hinge',
  'Snatch (Light)': 'oly', 'Clean & Jerk (Light)': 'oly', 'Sprint Intervals (Sub-Max)': 'cardio',
  'Handstand Hold (wall) (Light)': 'shoulder',
};
const ORPHANS = ['Warm-up Spin', 'Easy Ride (Zone 2)', 'Threshold Intervals', 'Hill Repeats', 'Long Ride', 'Technical Descent Drills'];
const SUB_CONSTS = [...src.matchAll(/^const (SUB_[A-Z_]+)\s+=/gm)].map(m => extractConst(src, m[1]));

const TABLES = [
  extractConst(src, 'exerciseInfo'), extractConst(src, 'programs'), extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'COMBAT_STYLES'),
  extractConst(src, 'CYCLING_STYLES'), extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'YOGA_STYLES'),
  extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'), extractConst(src, 'EXERCISE_MOVE'), extractConst(src, 'MOVEMENT_ICONS'),
  extractConst(src, 'EXERCISE_SUBS'), extractConst(src, 'SUBSTITUTION_MAP'), extractConst(src, 'REGION_RELIEF'),
  ...SUB_CONSTS, extractConst(src, 'EXERCISE_SUBSTITUTE_OVERRIDE'), extractConst(src, 'MUSCLE_GROUP_MAP'),
  // Every slot name, walked over the real programs, every *_STYLES table and every variant day (as test-concise-cues does).
  `function slotNames(){
    const T = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
    const names = new Set(); const seen = new Set();
    for(const key of Object.keys(programs)){
      const daySets = [programs[key].days];
      for(const st of Object.values(T[key] || {})) daySets.push(st.days);
      for(const v of Object.values(PROGRAM_DAY_COUNT_VARIANTS[key] || {})){
        if(v && v.days) daySets.push(v.days); else for(const n of Object.values(v || {})) daySets.push(n.days);
      }
      for(const days of daySets) for(const d of Object.values(days || {})){
        if(!d || seen.has(d)) continue; seen.add(d);
        for(const ex of (d.exercises || [])) names.add(ex.name);
      }
    }
    return [...names];
  }`,
];
const tables = body => runSandbox(TABLES, body)[0];

test('criterion 1: every slot name has an exerciseInfo entry and a move key from MOVEMENT_ICONS (full-slot sweep)', (assert)=>{
  const r = tables(`const n = slotNames(); __capture.push({count: n.length,
    noInfo: n.filter(x => !exerciseInfo[x]), noMove: n.filter(x => !EXERCISE_MOVE[x]),
    badMove: Object.entries(EXERCISE_MOVE).filter(([, v]) => !MOVEMENT_ICONS[v]).map(([k]) => k),
    newInSlots: ${JSON.stringify(Object.keys(NEW))}.filter(x => n.includes(x)).length});`);
  assert.ok(r.count > 250, 'anchor: the sweep reached the programs (' + r.count + ' names)');
  assert.strictEqual(r.newInSlots, 7, 'anchor: all seven variants are real slot names');
  assert.deepStrictEqual(r.noInfo, []);
  assert.deepStrictEqual(r.noMove, []);
  assert.deepStrictEqual(r.badMove, []);
});

test('the seven variants: the base lift\'s category, technique:true, three cues each, none over 24 words', (assert)=>{
  const r = tables(`__capture.push(Object.fromEntries(${JSON.stringify(Object.keys(NEW))}.map(n => [n, exerciseInfo[n]])));`);
  for(const [name, cat] of Object.entries(NEW)){
    assert.strictEqual(r[name].category, cat, name);
    assert.strictEqual(r[name].technique, true, name);
    assert.strictEqual(r[name].cues.length, 3, name);
    for(const c of r[name].cues) assert.ok(c.split(/\s+/).length <= 24, name + ': ' + c);
  }
  assert.match(r['Squat (Speed)'].cues.join(' '), /50–60% of your working max/);
  assert.match(r['Squat (Speed)'].cues.join(' '), /bar speed drops/);
  assert.match(r['Snatch (Light)'].cues.join(' '), /About 70%.*technique only.*No misses/s);
});

test('criterion 2: Squat (Speed) counts toward Legs (Quads) in the ledger', (assert)=>{
  const r = tables(`__capture.push(MUSCLE_GROUP_MAP[exerciseInfo['Squat (Speed)'].category]);`);
  assert.strictEqual(r, 'Legs (Quads)');
});

test('criterion 4: no exerciseInfo key is unreferenced by slots, EXERCISE_SUBS, SUBSTITUTION_MAP or REGION_RELIEF; the six cycling orphans are gone', (assert)=>{
  const r = tables(`
    const ref = new Set(slotNames());
    for(const [k, v] of Object.entries(EXERCISE_SUBS)){ ref.add(k); v.forEach(x => ref.add(x)); }
    for(const v of Object.values(SUBSTITUTION_MAP)) (v.alts || []).forEach(x => ref.add(x));
    for(const v of Object.values(REGION_RELIEF)) v.forEach(x => ref.add(x));
    __capture.push({unref: Object.keys(exerciseInfo).filter(k => !ref.has(k)), orphans: ${JSON.stringify(ORPHANS)}.filter(k => k in exerciseInfo), size: ref.size});`);
  assert.ok(r.size > 300, 'anchor: the reference set is real');
  assert.deepStrictEqual(r.unref, []);
  assert.deepStrictEqual(r.orphans, []);
});

test('EXERCISE_MOVE (source): no key appears twice in the literal', (assert)=>{
  const lit = extractConst(src, 'EXERCISE_MOVE');
  const keys = [...lit.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'[a-zA-Z]+'/g)].map(m => m[1]);
  assert.ok(keys.length > 300, 'anchor: keys read from the literal (' + keys.length + ')');
  assert.deepStrictEqual(keys.filter((k, i) => keys.indexOf(k) !== i), []);
});

// ---- The progression pipeline renderWorkout runs for one row (as test-all-set-double-progression).
const FNS = ['isMissedSet', 'topSetOf', 'sessionTopOf', 'buildPastSessions', 'cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay',
  'rirFromRpe', 'loadForRpeTarget', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'analyzeProgressionSignal',
  'buildProgressBadge', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise',
  'isDumbbellExercise', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'smallestLoadStep', 'capClinicalRpeLoad', 'estimated1RM', 'rpeAdjustedE1RM', 'recentBestE1RM'];
const CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES',
  'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'RPE_E1RM_LOOKBACK_SESSIONS', 'exerciseInfo'];
const chunks = (analyzeSrc) => [
  "var loadSuggestionMode = 'progression'; var weightUnit = 'lb'; var selectedLogDate = '2026-11-23';",
  ...CONSTS.map(c => extractConst(src, c)),
  ...FNS.map(f => f === 'analyzeProgressionSignal' && analyzeSrc ? analyzeSrc : extractFunction(src, f)),
];
function row(log, ex, analyzeSrc){
  return runSandbox(chunks(analyzeSrc), `
    const log = ${JSON.stringify(log)}, ex = ${JSON.stringify(ex)};
    const category = exerciseInfo[ex.name].category;
    const past = buildPastSessions(log);
    const prior = [...log].sort((a,b)=> b.date < a.date ? -1 : 1)[0];
    const priorTop = sessionTopOf(prior);
    const signal = analyzeProgressionSignal(past, ex, category, 'strength');
    const rpeCtx = {e1rm: recentBestE1RM(past), stepE1rm: recentBestE1RM(past, {plain: true}), week: 2, program: 'strength', category};
    const sug = computeSuggestedSet(prior.sets[0], signal, false, category, ex, priorTop, rpeCtx, prior);
    const badge = buildProgressBadge({ex, signal, inDeloadWeek: false, priorTop, topRep: parseTopRep(ex.sets), rpeCtx, sourceNote: '', prior});
    __capture.push({signal: signal && signal.type, sug, badge: badge.html, dir: badge.direction});`)[0];
}
const sets = (w, n, reps, rpe) => Array.from({length: n}, () => ({weight: w, reps, rpe}));
const twoAtTop = (w, n, reps) => [{date: '2026-11-16', sets: sets(w, n, reps, 7)}, {date: '2026-11-19', sets: sets(w, n, reps, 7)}];

test('criterion 3: the real analyzeProgressionSignal never returns increase for a technique:true entry (two sessions at the top, RPE 7)', (assert)=>{
  for(const [name, plain, w] of [['Squat (Speed)', 'Squat', 185], ['Bench Press (Speed)', 'Bench Press', 135], ['Deadlift (Light/Technique)', 'Deadlift', 225]]){
    const reps = name.startsWith('Deadlift') ? 2 : 3;
    const setsStr = name.startsWith('Deadlift') ? '4×2' : '6×3';
    const base = row(twoAtTop(w, 4, reps), {name: plain, sets: setsStr});
    assert.strictEqual(base.signal, 'increase', 'anchor: the plain ' + plain + ' with the same sets does increase');
    const t = row(twoAtTop(w, 4, reps), {name, sets: setsStr});
    assert.notStrictEqual(t.signal, 'increase', name);
  }
  // Sabotage at the patch site: without the technique line the speed squat increases again.
  const fn = extractFunction(src, 'analyzeProgressionSignal');
  const line = /\n\s*if\(typeof exerciseInfo !== 'undefined' && exerciseInfo\[ex\.name\] && exerciseInfo\[ex\.name\]\.technique\) return null;/;
  assert.strictEqual((fn.match(new RegExp(line.source, 'g')) || []).length, 1, 'one technique check in the signal');
  assert.strictEqual(row(twoAtTop(185, 4, 3), {name: 'Squat (Speed)', sets: '6×3'}, fn.replace(line, '')).signal, 'increase', 'anchor: the check is what holds it');
});

test('one session at the top: the badge and the field add weight to Squat, never to Squat (Speed)', (assert)=>{
  const one = [{date: '2026-11-19', sets: sets(185, 6, 3, null)}];
  const base = row(one, {name: 'Squat', sets: '6×3'});
  assert.match(base.badge, /try adding weight today/, 'anchor: the plain squat gets the one-session nudge');
  assert.ok(base.sug && base.sug.reason === 'increase' && base.sug.weight > 185, 'anchor: and the field goes up');
  const t = row(one, {name: 'Squat (Speed)', sets: '6×3'});
  assert.doesNotMatch(t.badge, /try adding weight|add \d/);
  assert.notStrictEqual(t.dir, 'up');
  assert.ok(!t.sug || t.sug.reason !== 'increase', 'the field does not go up: ' + JSON.stringify(t.sug));
  assert.match(t.badge, /Last top set/, 'the badge shows last time instead');
});

test('REAL source: the badge and the field read the same technique flag (one each)', (assert)=>{
  const flag = /const techniqueWork = typeof exerciseInfo !== 'undefined' && !!exerciseInfo\[ex\.name\] && !!exerciseInfo\[ex\.name\]\.technique;/g;
  for(const f of ['buildProgressBadge', 'computeSuggestedSet']){
    const body = extractFunction(src, f);
    assert.strictEqual((body.match(flag) || []).length, 1, f);
    assert.match(body, /if\(!clinicalPlan && !techniqueWork && priorTop/, f);
  }
});

test('RPE mode: a speed squat gets no RPE load target (badge or field); the plain squat still does', (assert)=>{
  const rpeRow = (name) => runSandbox(chunks(), `
    loadSuggestionMode = 'rpe';
    const log = [{date: '2026-11-19', sets: [{weight: 185, reps: 3, rpe: 6}, {weight: 185, reps: 3, rpe: 6}]}];
    const ex = {name: ${JSON.stringify('X')}.replace('X', ${JSON.stringify(name)}), sets: '6×3'};
    const category = exerciseInfo[ex.name].category;
    const past = buildPastSessions(log); const prior = log[0]; const priorTop = sessionTopOf(prior);
    const signal = analyzeProgressionSignal(past, ex, category, 'strength');
    const rpeCtx = {e1rm: recentBestE1RM(past), stepE1rm: recentBestE1RM(past, {plain: true}), week: 2, program: 'strength', category};
    const sug = computeSuggestedSet(prior.sets[0], signal, false, category, ex, priorTop, rpeCtx, prior);
    const badge = buildProgressBadge({ex, signal, inDeloadWeek: false, priorTop, topRep: parseTopRep(ex.sets), rpeCtx, sourceNote: '', prior});
    __capture.push({sug, badge: badge.html, dir: badge.direction});`)[0];
  const base = rpeRow('Squat');
  assert.strictEqual(base.dir, 'rpe', 'anchor: the plain squat gets an RPE target badge');
  assert.ok(base.sug && base.sug.reason === 'rpe' && base.sug.weight > 185, 'anchor: and an RPE load above last time: ' + JSON.stringify(base.sug));
  const t = rpeRow('Squat (Speed)');
  assert.notStrictEqual(t.dir, 'rpe');
  assert.doesNotMatch(t.badge, /RPE \d/);
  assert.ok(!t.sug || (t.sug.reason !== 'rpe' && t.sug.reason !== 'increase'), JSON.stringify(t.sug));
});

test('the light handstand hold keeps its dose: the real suggestRepProgression asks for no longer hold; the plain wall handstand still does', (assert)=>{
  const repSug = (name) => runSandbox(["var selectedLogDate = '2026-11-23';", extractConst(src, 'exerciseInfo'), ...['parseTopRep', 'parseBottomRep', 'suggestRepProgression'].map(f => extractFunction(src, f))],
    `__capture.push(suggestRepProgression([{date: '2026-11-16', sets: [{reps: 20}, {reps: 20}, {reps: 20}]}, {date: '2026-11-19', sets: [{reps: 20}, {reps: 20}, {reps: 20}]}], {name: ${JSON.stringify(name)}, sets: '3×15-20s', noWeight: true}, 'calisthenics'));`)[0];
  assert.ok(repSug('Handstand Hold (wall)'), 'anchor: the plain hold progresses');
  assert.strictEqual(repSug('Handstand Hold (wall) (Light)'), null);
});

function progressTable(name){
  return runJsdom('<div id="exerciseProgress"></div>', `
    var weightUnit = 'lb';
    const fmtWeight = lb => lb + ' lb', toDisplayWeight = lb => lb;
    const readExCorpus = async () => [1], readExCorpusWithImported = readExCorpus;
    const groupCorpusByExercise = () => [{name: ${JSON.stringify(name)}, exDef: {sets: '6×3'}, log: [{date: '2026-11-16', sets: [{weight: 185, reps: 3}]}, {date: '2026-11-19', sets: [{weight: 185, reps: 3}, {weight: 185, reps: 3}]}]}];
    const topSetOf = e => e.sets[0], sessionTopOf = topSetOf, maxWeightEver = () => 185, volumeOf = () => 1000, estimated1RM = () => 200;
    const describeExercisePlaces = () => 'Day 1', reconstructAllPRs = async () => [];
    const renderCollapsibleList = (el, items) => { el.innerHTML = items.join(''); }, icon = () => '';`,
    [extractConst(src, 'exerciseInfo'), extractFunction(src, 'escapeHtml'), extractFunction(src, 'trimUnitNum'), extractFunction(src, 'parseTopRep'), extractFunction(src, 'renderExerciseProgress'),
     'window.__done = renderExerciseProgress();']).window;
}
test('Progress: the real renderExerciseProgress shows "Ready to go up" for Squat, never for Squat (Speed)', async (assert)=>{
  const plain = progressTable('Squat'); await plain.__done;
  assert.strictEqual(plain.document.querySelectorAll('.prog-ready').length, 1, 'anchor: the plain squat reads as ready');
  const t = progressTable('Squat (Speed)'); await t.__done;
  assert.ok(/Squat \(Speed\)/.test(t.document.getElementById('exerciseProgress').textContent), 'anchor: the row rendered');
  assert.strictEqual(t.document.querySelectorAll('.prog-ready').length, 0);
});

run();
