'use strict';
// v3.583 (BL-59, D-8 with M-8): category corrections that feed the muscle
// ledger. Mobility holds and drills that counted as Quads, Chest & Shoulders or
// Posterior Chain work move to `core`; the band shoulder moves move to
// `shoulder`; Sprawl Drills to `kick`; calf work gets its own `calf` (it was
// `arms`) and Leg Extension `isolation-leg` (it was `squat`). Real tables and
// functions throughout: exerciseInfo, MUSCLE_GROUP_MAP, applyAccumulation,
// regionsForExercise, getLoadIncrement.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-category-corrections.js');
const src = readIndexSource();
const TABLES = ['CAT_TO_ICON', 'CATEGORY_MET', 'CATEGORY_LOAD_INCREMENT', 'CATEGORY_TO_REGIONS', 'SUBSTITUTION_MAP', 'MUSCLE_GROUP_MAP'];
const CHUNKS = [extractConst(src, 'exerciseInfo'), ...TABLES.map(t => extractConst(src, t)),
  extractConst(src, 'EXERCISE_REGION_OVERRIDE'), extractFunction(src, 'regionsForExercise'), extractFunction(src, 'getLoadIncrement'), extractConst(src, 'LOAD_INCREMENT_SCALE'),
  extractConst(src, 'COMPOUND_CATEGORIES'), extractConst(src, 'WARMUP_ELIGIBLE_CATEGORIES'), extractConst(src, 'ACCUMULATION_ADDS'), extractConst(src, 'VOLUME_MODIFIER_PROGRAMS'),
  extractConst(src, 'DELOAD_CYCLE_WEEKS'), 'function isCustomProgramKey(){ return false; }',
  ...['volumeModifiersApply', 'cycleWeekOf', 'hasNumericSetPrefix', 'parseSetCount', 'replaceSetCount', 'applyAccumulation'].map(n => extractFunction(src, n))];
const sandbox = body => runSandbox(CHUNKS, body)[0];

const MOVED = {
  shoulder: ['Band External Rotation', 'Scapular Retraction', 'Band Pull-Apart'],
  core: ['Deep Squat Hold', 'Chair Pose', 'Horse Stance Hold (Mabu)', 'Bow Stance Transitions (Gong Bu)', 'Chaturanga', 'Wall Slides', 'Shoulder CARs', 'Band Dislocates'],
  kick: ['Sprawl Drills'],
  calf: ['Calf Raise', 'Standing Calf Raise', 'Eccentric Heel Drop', 'Single-Leg Calf Raise'],
  'isolation-leg': ['Leg Extension'],
};

test('the D-8 and M-8 tables: every named exercise has its new category', (assert)=>{
  const got = sandbox(`__capture.push(Object.fromEntries(${JSON.stringify(Object.values(MOVED).flat())}.map(n => [n, (exerciseInfo[n] || {}).category])));`);
  for(const [cat, names] of Object.entries(MOVED)) for(const n of names) assert.strictEqual(got[n], cat, n);
});

test('criterion 1 (group view): Deep Squat Hold counts as Core, not Legs (Quads); Calf Raise as Calves, not Arms; Leg Extension stays with the quads', (assert)=>{
  const g = sandbox(`const g = n => MUSCLE_GROUP_MAP[exerciseInfo[n].category]; __capture.push({dsh: g('Deep Squat Hold'), calf: g('Calf Raise'), le: g('Leg Extension'), ber: g('Band External Rotation'), chat: g('Chaturanga'), sprawl: g('Sprawl Drills')});`);
  assert.deepStrictEqual(g, {dsh: 'Core', calf: 'Calves', le: 'Legs (Quads)', ber: 'Chest & Shoulders', chat: 'Core', sprawl: 'Combat'});
  // The Analysis volume card groups each exercise exactly this way.
  const body = extractFunction(src, 'renderVolumeTrend');
  assert.strictEqual((body.match(/MUSCLE_GROUP_MAP\[info\.category\]/g) || []).length, 1);
});

test('criterion 2: real applyAccumulation in week 3 of a strength block adds no set to any recategorised exercise (a Back Squat after them still gets one)', (assert)=>{
  const names = Object.values(MOVED).flat();
  const r = sandbox(`
    const day = ${JSON.stringify(names)}.map(name => ({name, sets: '3×10'})).concat([{name: 'Back Squat', sets: '4×5'}]);
    __capture.push(applyAccumulation(day, 3, 'strength').filter(ex => ex.accumulated).map(ex => ex.name + ' ' + ex.sets));`);
  assert.deepStrictEqual(r, ['Back Squat 5×5'], 'anchor: accumulation runs, and only the compound takes the set');
});

test('the new categories are isolation work: not compound, not warm-up eligible', (assert)=>{
  const r = sandbox(`__capture.push(['calf', 'isolation-leg'].map(c => COMPOUND_CATEGORIES.has(c) || WARMUP_ELIGIBLE_CATEGORIES.includes(c)));`);
  assert.deepStrictEqual(r, [false, false]);
});

test('criterion 3: Band External Rotation flags Shoulder; Leg Extension flags Knee; calf work still flags the ankle', (assert)=>{
  const r = sandbox(`const f = n => regionsForExercise(n, exerciseInfo[n].category); __capture.push({ber: f('Band External Rotation'), le: f('Leg Extension'), cr: f('Calf Raise'), slcr: f('Single-Leg Calf Raise')});`);
  assert.ok(r.ber.includes('Shoulder'), JSON.stringify(r.ber));
  assert.deepStrictEqual(r.le, ['Knee']);
  assert.deepStrictEqual(r.cr, ['Ankle/Foot', 'Shins']);
  assert.deepStrictEqual(r.slcr, ['Ankle/Foot', 'Shins']);
});

test('criterion 4: every category used in exerciseInfo has an entry in each category table (the sweep prints the gaps)', (assert)=>{
  const gaps = sandbox(`
    const T = {${TABLES.map(t => `${t}`).join(', ')}};
    const cats = [...new Set(Object.values(exerciseInfo).map(i => i.category).filter(Boolean))];
    const gaps = []; for(const c of cats) for(const [n, t] of Object.entries(T)) if(!(c in t)) gaps.push(n + ' lacks ' + c);
    // A substitute with no exerciseInfo would show no cues when swapped in.
    for(const c of ['calf', 'isolation-leg']) for(const a of SUBSTITUTION_MAP[c].alts) if(!exerciseInfo[a]) gaps.push('SUBSTITUTION_MAP.' + c + ' names ' + a + ' with no exerciseInfo');
    __capture.push({gaps, cats: cats.length});`);
  assert.ok(gaps.cats >= 16, 'anchor: categories swept ' + gaps.cats);
  assert.deepStrictEqual(gaps.gaps, []);
});

test('criterion 5: getLoadIncrement(\'calf\') is 5, and Chaturanga steps like core', (assert)=>{
  const r = sandbox(`__capture.push({calf: getLoadIncrement('calf'), le: getLoadIncrement('isolation-leg', 300), chat: getLoadIncrement(exerciseInfo['Chaturanga'].category), core: CATEGORY_LOAD_INCREMENT.core});`);
  assert.strictEqual(r.calf, 5);
  assert.strictEqual(r.le, 5, 'isolation: no e1RM scaling');
  assert.strictEqual(r.chat, r.core);
  assert.strictEqual(r.chat, 2.5);
});

run();
