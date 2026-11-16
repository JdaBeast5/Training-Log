'use strict';
// v3.561 (BL-72, owner "1 yes" 2026-11-08; backup per owner 2026-11-16):
// stable history keys for custom, body-goal focus and bonus exercises.
// slotIdOf(ex, i) gives 'c-'/'f-'/'a-' + slug for those rows and i for built-in
// rows; every key-reading/writing call site passes it; the v9 migration moves
// existing positional logs once, after copying every source into
// migration-backup-v9.
//
// Real invocation: the real slotIdOf, exKey, subSelectionKey, getExLog,
// applyExerciseSubs, migrateTrailingSlotsV9 and its helpers over the real
// programs, PROGRAM_DAY_COUNT_VARIANTS, *_STYLES, ACCUMULATION_ACCESSORY_POOL,
// BODY_GOAL_FOCUS and getBodyGoalFocusExercises, with a fixture store; real
// call-site counts over the listed functions.
//
// Sabotage 1: make slotIdOf return i for custom rows → criteria 3 and 5 fail.
// Sabotage 2: delete the source before writing the target → 4(d) loses entries.
const vm = require('vm');
const { readIndexSource, extractFunction, extractConst, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-stable-trailing-keys.js');

const CONSTS = ['programs', 'PROGRAM_DAY_COUNT_VARIANTS', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES',
  'ACCUMULATION_ACCESSORY_POOL', 'FOCUS_ELIGIBLE_PROGRAMS', 'BODY_GOAL_FOCUS', 'EXERCISE_SUBS', 'MIGRATION_BACKUP_V9_KEY', 'TRAILING_STYLE_TABLES'];
const FNS = ['slugifyExerciseName', 'slotIdOf', 'exKey', 'subSelectionKey', 'normalizeExEntry', 'getExLog', 'applyExerciseSubs',
  'getBodyGoalFocusExercises', 'trailingDaysFor', 'trailingDayFor', 'trailingExKey', 'trailingSubKey', 'migrateTrailingSlotsV9'];
const CODE = [...CONSTS.map(c => extractConst(src, c)), ...FNS.map(f => extractFunction(src, f))].join('\n');

async function sandbox(store, body){
  const ctx = vm.createContext({console, __out: null, __store: store});
  const prelude = `
    var activeProgram = 'strength', activeDay = 'd1', activeMartialArt = 'kickboxing', activeCyclingStyle = 'road', activeWatersportsStyle = 'surfing', activeMedicalStyle = 'hypertension';
    var window = {storage: {
      get: async (k) => (k in __store ? {key: k, value: __store[k]} : null),
      set: async (k, v) => { __store[k] = v; return {key: k, value: v}; },
      delete: async (k) => { delete __store[k]; return {key: k, deleted: true}; },
      list: async (prefix) => ({keys: Object.keys(__store).filter(k => !prefix || k.startsWith(prefix))}),
    }};`;
  await vm.runInContext(`(async ()=>{ ${prelude}\n${CODE}\n${body} })()`, ctx);
  return JSON.parse(JSON.stringify(ctx.__out));
}
const log = (...dates) => JSON.stringify(dates.map(d => ({date: d, sets: [{weight: 50, reps: 10}]})));

test('criterion 1: slotIdOf: custom Dips → c-dips, a focus exercise → f-…, the bonus Cable Fly → a-cable-fly, a built-in at 3 → 3', async (assert)=>{
  const r = await sandbox({}, `__out = [slotIdOf({name: 'Dips', isCustom: true}, 7), slotIdOf({name: 'Lateral Raise', isBodyGoalFocus: true}, 6),
    slotIdOf({name: 'Cable Fly', accumulatedAccessory: true}, 8), slotIdOf({name: 'Bench Press'}, 3)];`);
  assert.deepStrictEqual(r, ['c-dips', 'f-lateral-raise', 'a-cable-fly', 3]);
});

test('criterion 2: every exKey / getExLog / saveEx* / subSelectionKey call in the listed functions takes its index from slotIdOf (exact counts, comments stripped)', (assert)=>{
  const POS = {exKey: 2, getExLog: 1, saveExSet: 1, saveExDropSet: 1, saveExWarmupSet: 1, saveExWarmupSkipped: 1, subSelectionKey: 2};
  const args = (text, at) => { const out = []; let depth = 0, cur = '', i = at; for(; i < text.length; i++){ const c = text[i];
    if(c === '(' || c === '[' || c === '{'){ depth++; cur += c; } else if(c === ')' || c === ']' || c === '}'){ if(depth === 0) break; depth--; cur += c; }
    else if(c === ',' && depth === 0){ out.push(cur.trim()); cur = ''; } else cur += c; } out.push(cur.trim()); return out; };
  const WANT = {renderWorkout: 2, wireSetsBlock: 14, applyExerciseSubs: 1, openExerciseSubModal: 3, buildExerciseHistoryHtml: 1, refreshSessionSummary: 1, getSessionHeadsUpInsight: 1, computeProgramFitTrend: 1};
  for(const [fn, want] of Object.entries(WANT)){
    const body = extractFunction(src, fn).split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
    const calls = [...body.matchAll(/\b(exKey|getExLog|saveExSet|saveExDropSet|saveExWarmupSet|saveExWarmupSkipped|subSelectionKey)\(/g)]
      .filter(m => !/function\s+$/.test(body.slice(Math.max(0, m.index - 10), m.index)));
    const bad = calls.map(m => ({name: m[1], idx: args(body, m.index + m[0].length)[POS[m[1]]]})).filter(c => !(/^slotIdOf\(/.test(c.idx) || c.idx === 'slot'));
    assert.strictEqual(calls.length, want, `${fn}: call count`);
    assert.deepStrictEqual(bad, [], `${fn}: unresolved index`);
  }
  assert.match(extractFunction(src, 'wireSetsBlock'), /const slot = slotIdOf\(ex, exIdx\);/);
});

test('criterion 2b: applyExerciseSubs reads the bonus Cable Fly\'s swap at its stable key, not at its render index', async (assert)=>{
  const day = `programs.strength.days.d1.exercises.map(e => ({...e})).concat([{name: 'Cable Fly', sets: '3×12-15', accumulatedAccessory: true}])`;
  const stable = await sandbox({'exercise-sub:strength:d1:a-cable-fly': 'Push-up'}, `const ex = ${day}; await applyExerciseSubs(ex, 'strength', 'd1'); __out = ex[6].name;`);
  assert.strictEqual(stable, 'Push-up');
  const positional = await sandbox({'exercise-sub:strength:d1:6': 'Push-up'}, `const ex = ${day}; await applyExerciseSubs(ex, 'strength', 'd1'); __out = ex[6].name;`);
  assert.strictEqual(positional, 'Cable Fly');
});

test('criterion 3: getExLog for a custom Dips row on strength d1 reads ex:strength:d1:c-dips', async (assert)=>{
  const r = await sandbox({'ex:strength:d1:c-dips': log('2026-11-01'), 'ex:strength:d1:7': log('2026-10-01')},
    `__out = await getExLog('d1', slotIdOf({name: 'Dips', isCustom: true}, 7));`);
  assert.deepStrictEqual(r.map(e => e.date), ['2026-11-01']);
});

// The fixture: strength, pref unset, d1 L = 6; body goal "classic muscular" gives one
// focus exercise (Lateral Raise); custom [Dips]; the strength d1 bonus is Cable Fly.
const BASE = () => ({
  'user-profile': JSON.stringify({bodyGoal: 'classic muscular'}),
  'custom-ex:strength:d1': JSON.stringify([{name: 'Dips', sets: '3×8-12'}]),
  'ex:strength:d1:0': log('2026-10-01'), 'ex:strength:d1:5': log('2026-10-02'),
  'ex:strength:d1:6': log('2026-10-03'), 'ex:strength:d1:7': log('2026-10-04', '2026-10-11'),
  'ex:strength:d1:8': log('2026-10-05'), 'ex:strength:d1:8:sub:push-up': log('2026-10-06'),
  'exercise-sub:strength:d1:8': 'Push-up',
});

test('criterion 4(a, b): focus, custom and bonus logs (with a :sub: sibling and the selection) move to stable keys; built-in rows are byte-identical; a backup holds every source', async (assert)=>{
  const store = BASE(); const before = {...store};
  await sandbox(store, `await migrateTrailingSlotsV9(); __out = null;`);
  assert.strictEqual(store['ex:strength:d1:f-lateral-raise'], before['ex:strength:d1:6']);
  assert.strictEqual(store['ex:strength:d1:c-dips'], before['ex:strength:d1:7']);
  assert.strictEqual(store['ex:strength:d1:a-cable-fly'], before['ex:strength:d1:8']);
  assert.strictEqual(store['ex:strength:d1:a-cable-fly:sub:push-up'], before['ex:strength:d1:8:sub:push-up']);
  assert.strictEqual(store['exercise-sub:strength:d1:a-cable-fly'], 'Push-up');
  for(const k of ['ex:strength:d1:6', 'ex:strength:d1:7', 'ex:strength:d1:8', 'ex:strength:d1:8:sub:push-up', 'exercise-sub:strength:d1:8']) assert.ok(!(k in store), 'source removed: ' + k);
  assert.strictEqual(store['ex:strength:d1:0'], before['ex:strength:d1:0']);
  assert.strictEqual(store['ex:strength:d1:5'], before['ex:strength:d1:5']);
  const backup = JSON.parse(store['migration-backup-v9']);
  for(const k of ['ex:strength:d1:6', 'ex:strength:d1:7', 'ex:strength:d1:8', 'ex:strength:d1:8:sub:push-up', 'exercise-sub:strength:d1:8']) assert.strictEqual(backup[k], before[k], 'backed up: ' + k);
  assert.ok(!('ex:strength:d1:0' in backup), 'built-in rows are not touched, so not in the backup');
});

test('criterion 4(c, d): a second run is a no-op; after a crash between write and delete the run merges without duplicates and deletes the source', async (assert)=>{
  const store = BASE();
  await sandbox(store, `await migrateTrailingSlotsV9(); __out = null;`);
  const after = JSON.stringify(store);
  await sandbox(store, `await migrateTrailingSlotsV9(); __out = null;`);
  assert.strictEqual(JSON.stringify(store), after, 'no-op');
  const crash = BASE();
  crash['ex:strength:d1:c-dips'] = log('2026-10-04', '2026-10-11'); // target written, source still there
  crash['ex:strength:d1:7'] = log('2026-10-04', '2026-10-11', '2026-10-18');
  await sandbox(crash, `await migrateTrailingSlotsV9(); __out = null;`);
  assert.deepStrictEqual(JSON.parse(crash['ex:strength:d1:c-dips']).map(e => e.date), ['2026-10-04', '2026-10-11', '2026-10-18']);
  assert.ok(!('ex:strength:d1:7' in crash));
});

test('criterion 4(e, f): with days-per-week-pref 3, L comes from the 3-day variant; a medical hypertension d5 custom list uses that style\'s d5 length', async (assert)=>{
  const three = {'days-per-week-pref': '3', 'custom-ex:strength:d1': JSON.stringify([{name: 'Dips'}]), 'ex:strength:d1:4': log('2026-10-01'), 'ex:strength:d1:6': log('2026-10-02')};
  await sandbox(three, `await migrateTrailingSlotsV9(); __out = null;`);
  assert.strictEqual(three['ex:strength:d1:c-dips'], log('2026-10-01'), 'L = 4 on the 3-day d1');
  assert.strictEqual(three['ex:strength:d1:6'], log('2026-10-02'), 'nothing at a position the active layout doesn\'t give a trailing row');
  const med = {'custom-ex:medical:hypertension:d5': JSON.stringify([{name: 'Band Row'}]), 'ex:medical:hypertension:d5:3': log('2026-10-01')};
  await sandbox(med, `await migrateTrailingSlotsV9(); __out = null;`);
  assert.strictEqual(med['ex:medical:hypertension:d5:c-band-row'], log('2026-10-01'), 'hypertension d5 has 3 authored exercises');
});

test('criterion 5: after migration, with a 7th built-in exercise added to strength d1, the Dips row still reads its moved history', async (assert)=>{
  const store = BASE();
  const r = await sandbox(store, `await migrateTrailingSlotsV9();
    programs.strength.days.d1.exercises.push({name: 'Face Pull', sets: '3×15'});
    const L = programs.strength.days.d1.exercises.length; // 7: Dips now renders at 8 (after one focus row)
    __out = (await getExLog('d1', slotIdOf({name: 'Dips', isCustom: true}, L + 1))).map(e => e.date);`);
  assert.deepStrictEqual(r, ['2026-10-04', '2026-10-11']);
});

test('the backup comes first: if it can\'t be written, nothing moves', async (assert)=>{
  const store = BASE(); const before = JSON.stringify(store);
  const ctx = vm.createContext({console, __store: store});
  await vm.runInContext(`(async ()=>{
    var activeProgram = 'strength', activeDay = 'd1', activeMedicalStyle = 'hypertension';
    var window = {storage: {
      get: async (k) => (k in __store ? {value: __store[k]} : null),
      set: async (k, v) => { if(k === 'migration-backup-v9') throw new Error('quota'); __store[k] = v; },
      delete: async (k) => { delete __store[k]; },
      list: async (p) => ({keys: Object.keys(__store).filter(k => k.startsWith(p))}),
    }};
    ${CODE}
    await migrateTrailingSlotsV9(); })()`, ctx);
  assert.strictEqual(JSON.stringify(store), before);
});

test('the move waits for its inputs: runMigrations marks it pending and stamps 8; finishTrailingSlotsMove (after styles and custom programs load) stamps 9 only on success', async (assert)=>{
  assert.match(extractConst(src, 'SCHEMA_VERSION'), /= 9;/);
  const rm = extractFunction(src, 'runMigrations');
  assert.match(rm, /if\(version < 9\) trailingSlotsMovePending = true;/);
  assert.match(rm, /const stamp = trailingSlotsMovePending \? Math\.min\(SCHEMA_VERSION, 8\) : SCHEMA_VERSION;/);
  const init = src.slice(src.indexOf('(async function init(){'));
  const at = (re) => init.search(re);
  assert.ok(at(/await finishTrailingSlotsMove\(\);/) > at(/await loadAndInstallCustomPrograms\(\);/) && at(/await loadAndInstallCustomPrograms\(\);/) > at(/await loadYogaStyle\(\);/)
    && at(/await finishTrailingSlotsMove\(\);/) > at(/await loadDaysPerWeekPref\(\);/), 'after the styles, the day-count pref and the custom programs');
  const finish = extractFunction(src, 'finishTrailingSlotsMove');
  const runFinish = async (ok) => { const ctx = vm.createContext({__store: {}}); await vm.runInContext(`(async ()=>{
    var trailingSlotsMovePending = true; const SCHEMA_VERSION = 9;
    var window = {storage: {set: async (k, v) => { __store[k] = v; }}};
    async function migrateTrailingSlotsV9(){ return ${ok}; }
    ${finish}
    await finishTrailingSlotsMove(); })()`, ctx); return JSON.parse(JSON.stringify(ctx.__store)); };
  assert.deepStrictEqual(await runFinish(true), {'meta:schemaVersion': '9'});
  assert.deepStrictEqual(await runFinish(false), {}, 'backup failed: no stamp, retried next launch');
});

test('review fixes: a swapped bonus row keeps its own key; entries name-stamped as another exercise stay put; a custom program\'s list is covered', async (assert)=>{
  const ids = await sandbox({}, `__out = [slotIdOf({name: 'Push-up', __originalName: 'Cable Fly', accumulatedAccessory: true, __isSubbed: true}, 6), slotIdOf({name: '腕立て', isCustom: true}, 7)];`);
  assert.deepStrictEqual(ids, ['a-cable-fly', 7], 'original name; no letters → position');
  const store = BASE();
  store['ex:strength:d1:7'] = JSON.stringify([{date: '2026-10-04', sets: [{reps: 8}], n: 'Dips'}, {date: '2026-10-09', sets: [{reps: 5}], n: 'Lat Pulldown'}, {date: '2026-10-11', sets: [{reps: 9}]}]);
  await sandbox(store, `await migrateTrailingSlotsV9(); __out = null;`);
  assert.deepStrictEqual(JSON.parse(store['ex:strength:d1:c-dips']).map(e => e.date), ['2026-10-04', '2026-10-11']);
  assert.deepStrictEqual(JSON.parse(store['ex:strength:d1:7']).map(e => e.date), ['2026-10-09'], 'the other exercise\'s entry stays at the positional key');
  const custom = {'custom-ex:custom:abc:d1': JSON.stringify([{name: 'Sled Drag'}]), 'ex:custom:abc:d1:2': log('2026-10-01')};
  await sandbox(custom, `programs['custom:abc'] = {days: {d1: {exercises: [{name: 'A'}, {name: 'B'}]}}}; await migrateTrailingSlotsV9(); __out = null;`);
  assert.strictEqual(custom['ex:custom:abc:d1:c-sled-drag'], log('2026-10-01'));
});

test('criterion 4(d), a real crash: the write to the target fails once; nothing is lost, and the next run finishes the move', async (assert)=>{
  const store = BASE();
  const ctx = vm.createContext({console, __store: store, __failOnce: {'ex:strength:d1:c-dips': true}});
  const run = () => vm.runInContext(`(async ()=>{
    var activeProgram = 'strength', activeDay = 'd1', activeMedicalStyle = 'hypertension';
    var window = {storage: {
      get: async (k) => (k in __store ? {value: __store[k]} : null),
      set: async (k, v) => { if(__failOnce[k]){ __failOnce[k] = false; throw new Error('crash'); } __store[k] = v; },
      delete: async (k) => { delete __store[k]; },
      list: async (p) => ({keys: Object.keys(__store).filter(k => k.startsWith(p))}),
    }};
    ${CODE}
    await migrateTrailingSlotsV9(); })()`, ctx);
  await run();
  assert.ok('ex:strength:d1:7' in store, 'the source survives a failed write');
  await run();
  assert.deepStrictEqual(JSON.parse(store['ex:strength:d1:c-dips']).map(e => e.date), ['2026-10-04', '2026-10-11']);
  assert.ok(!('ex:strength:d1:7' in store));
});

run();
