'use strict';
// v3.536 (BL-53, audit D-1 and D-12): medical history reaches History, PRs and
// volume; the watersports fallback key.
//   - parseExKey had combat, cycling and watersports style branches but no
//     medical one, so every medical, prenatal, postpartum and rehab log
//     (ex:medical:<style>:<day>:<idx>) parsed to null and was dropped from
//     readExCorpus: no PRs, no History corpus, no weekly volume.
//   - exKeyForLocation had no watersports branch, so the cross-program
//     fallback built ex:watersports:d1:0, a key that is never written.
// The three style branches are now one rule over a style table (no fourth
// copy); criterion 4 pins that every other key parses exactly as before.
//
// Real invocation: the real parseExKey, readExCorpus and exKeyForLocation over
// the real programs and *_STYLES tables.
//
// Sabotage: drop medical from parseExKey's style table, and criteria 1 and 2
// and the round trip fail; drop exKeyForLocation's watersports branch, and
// criterion 3 and the round trip fail.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-parse-ex-key-styles.js');

const DATA = ['programs', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES'].map(c => extractConst(src, c));
const parse = (keys) => runSandbox([...DATA, extractFunction(src, 'parseExKey')],
  `__capture.push(${JSON.stringify(keys)}.map(k => { const p = parseExKey(k); return p && {program: p.program, dayId: p.dayId, idx: p.idx, name: p.exDef.name, dayLabel: p.dayLabel}; }));`)[0];

test('criterion 1: a medical key parses to its exercise and a styled day label (hypertension d2 slot 2 is Seated Cable Row)', (assert)=>{
  const [p] = parse(['ex:medical:hypertension:d2:2']);
  assert.ok(p, 'parses');
  assert.strictEqual(p.name, 'Seated Cable Row');
  assert.strictEqual(p.program, 'medical');
  assert.strictEqual(p.dayLabel, 'Medically Modified (Hypertension / Cardiac-Modified) · Day 2');
  // The spec's example key (d2:0) is Bodyweight Squat at v3.535; it parses too.
  assert.strictEqual(parse(['ex:medical:hypertension:d2:0'])[0].name, 'Bodyweight Squat');
});

test('criterion 2: readExCorpus with one medical key returns 1 entry', async (assert)=>{
  const [r] = await runSandboxAsync([
    ...DATA, extractFunction(src, 'parseExKey'), extractFunction(src, 'normalizeExEntry'), extractFunction(src, 'readExCorpus'),
    `var exCorpusGen = 0; var exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null;
     var window = { storage: {
       list: async () => ({keys: ['ex:medical:hypertension:d2:2']}),
       get: async () => ({value: JSON.stringify([{date: '2026-11-05', sets: [{weight: 60, reps: 12}]}])}),
     }};`,
  ], `__capture.push(await readExCorpus());`);
  assert.strictEqual(r.length, 1);
});

test('criterion 3: exKeyForLocation builds the styled watersports key, matching what exKey writes', (assert)=>{
  const [r] = runSandbox([extractFunction(src, 'exKeyForLocation'), extractFunction(src, 'slugifyExerciseName'),
    `var activeMartialArt = 'boxing', activeCyclingStyle = 'road', activeWatersportsStyle = 'surfing', activeMedicalStyle = 'diabetes';`,
    extractFunction(src, 'exKey')],
    `__capture.push([exKeyForLocation({program: 'watersports', style: 'surfing', dayId: 'd1', idx: 0}), exKey('watersports', 'd1', 0)]);`);
  assert.strictEqual(r[0], 'ex:watersports:surfing:d1:0');
  assert.strictEqual(r[0], r[1], 'the fallback reads the key exKey writes');
});

// Frozen from the v3.535 parseExKey (before the consolidation). All 345 keys of
// a wider sweep (two slots of every day of every program and style, plus these
// edge cases) matched exactly when this change was made.
const BEFORE = [
  ['ex:strength:d1:0', {program: 'strength', dayId: 'd1', idx: 0, name: 'Bench Press', dayLabel: 'Strength & Size · Day 1'}],
  ['ex:strength:d1:0:sub:front-squat', {program: 'strength', dayId: 'd1', idx: 0, name: 'Bench Press', dayLabel: 'Strength & Size · Day 1'}],
  ['ex:combat:boxing:d1:0', {program: 'combat', dayId: 'd1', idx: 0, name: 'Jump Rope (warm-up)', dayLabel: 'Boxing / Kickboxing (Boxing) · Day 1'}],
  ['ex:combat:boxing:d1:0:sub:x', {program: 'combat', dayId: 'd1', idx: 0, name: 'Jump Rope (warm-up)', dayLabel: 'Boxing / Kickboxing (Boxing) · Day 1'}],
  ['ex:cycling:road:d1:0', {program: 'cycling', dayId: 'd1', idx: 0, name: 'Warm-up Ride (easy spin)', dayLabel: 'Cycling (Road) · Day 1'}],
  ['ex:watersports:surfing:d1:0', {program: 'watersports', dayId: 'd1', idx: 0, name: 'Straight-Arm Lat Pulldown', dayLabel: 'Watersports (Surfing) · Day 1'}],
  ['ex:strength:d99:0', null],
  ['ex:combat:nope:d1:0', null],
  ['ex:x', null],
  ['ex:strength:d1:999', null],
];

test('criterion 4: combat, cycling, watersports, plain, :sub: and unresolvable keys parse exactly as before (table)', (assert)=>{
  const got = parse(BEFORE.map(r => r[0]));
  BEFORE.forEach(([key, want], i) => assert.deepStrictEqual(got[i], want, key));
});

test('round trip: for every style of every styled program, the key exKey writes parses back, and the location index points at that same key', (assert)=>{
  const [r] = runSandbox([...DATA, extractFunction(src, 'parseExKey'), extractFunction(src, 'slugifyExerciseName'), extractFunction(src, 'exKey'),
    extractFunction(src, 'exKeyForLocation'), extractConst(src, 'YOGA_STYLES'), 'var exerciseLocationIndex = null;', extractConst(src, 'EXERCISE_CANONICAL'), extractFunction(src, 'canonicalExName'), /* v3.549 (BL-54) */ extractFunction(src, 'getExerciseLocationIndex'),
    `var activeMartialArt, activeCyclingStyle, activeWatersportsStyle, activeMedicalStyle;`], `
    const bad = []; let checked = 0;
    const T = {combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, medical: MEDICAL_STYLES};
    const loc = getExerciseLocationIndex();
    for(const [prog, table] of Object.entries(T)) for(const [style, def] of Object.entries(table)){
      activeMartialArt = activeCyclingStyle = activeWatersportsStyle = activeMedicalStyle = style;
      for(const [dayId, day] of Object.entries(def.days || {})) (day.exercises || []).forEach((ex, idx) => {
        checked++;
        const key = exKey(prog, dayId, idx);
        const p = parseExKey(key);
        if(!p || p.exDef.name !== ex.name) bad.push('parse ' + key);
        const l = (loc[canonicalExName(ex.name)] || []).find( // v3.549 (BL-54): keyed by canonical name
          l => l.program === prog && l.style === style && l.dayId === dayId && l.idx === idx);
        if(!l || exKeyForLocation(l) !== key) bad.push('location ' + key);
      });
    }
    __capture.push({bad, checked});`);
  assert.ok(r.checked > 300, 'slots checked: ' + r.checked);
  assert.deepStrictEqual(r.bad, []);
});

run();
