'use strict';
// v3.637 (BL-29): import history from Strong or Hevy CSV into a separate
// archive (owner, D6, 2026-11-08) that feeds PRs and the e1RM charts only.
//
// The fixtures follow the columns third-party importers document (neither app
// publishes its CSV format; not yet checked against a real export):
//   Strong: Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps,
//     Distance, Seconds, Notes, Workout Notes, RPE
//     (forum.intervals.icu/t/import-strong-data-weightlifting-app/5531;
//      lastlift.pages.dev/articles/how-to-switch-workout-tracker-apps/)
//   Hevy: title, start_time, end_time, description, exercise_title, superset_id,
//     exercise_notes, set_index, set_type, weight_lbs | weight_kg, reps,
//     distance_miles | distance_km, duration_seconds, rpe
//     (glama.ai/mcp/servers/@ndeast/hevy-history-mcp, QUICKSTART.md;
//      repstack.pages.dev/import/hevy-csv/)
//
// Real invocation: the real parser, matcher, planner, writer, remover,
// readImportedCorpus, readExCorpusWithImported, readExCorpus and
// reconstructAllPRs (with groupCorpusByExercise and topSetOf) over the real
// buildNamespacedStorage, the real programs and exerciseInfo.
// Sabotage: write the matched sets to the slot key, and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-strong-hevy-import.js');
const exerciseInfoSrc = fs.readFileSync(path.join(__dirname, 'content-exercises.js'), 'utf8');

const STRONG = [
  'Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE',
  '2025-03-04 07:12:33,Push A,1h 2m,Bench Press (Barbell),W,95,10,0,0,,,',
  '2025-03-04 07:12:33,Push A,1h 2m,Bench Press (Barbell),1,225,5,0,0,,,8',
  '2025-03-04 07:12:33,Push A,1h 2m,Bench Press (Barbell),2,230,3,0,0,"felt ""heavy"", ok",,9',
  '2025-03-04 07:12:33,Push A,1h 2m,Shoulder Press (Dumbbell),1,50,10,0,0,,,',
  '2025-03-06 18:00:00,Legs,55m,Squat (Barbell),1,315,5,0,0,,,',
  '2025-03-06 18:00:00,Legs,55m,Zercher Carry Thing,1,135,20,0,0,,,',
].join('\n');
const HEVY = [
  'title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe',
  '"Upper","10 May 2025, 07:12","10 May 2025, 08:01",,"Bench Press (Barbell)",,,0,warmup,40,10,,,',
  '"Upper","10 May 2025, 07:12","10 May 2025, 08:01",,"Bench Press (Barbell)",,,1,normal,100,5,,,8',
  '"Upper","10 May 2025, 07:12","10 May 2025, 08:01",,"Bent Over Row (Barbell)",,,0,normal,80,8,,,',
].join('\n');

function page(stored = {}){
  const dom = new JSDOM('<!DOCTYPE html><body></body>', {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const el = w.document.createElement('script');
  el.textContent = [
    `var exCorpusGen = 0; function bumpExCorpusGen(){ exCorpusGen++; }
     function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
     function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
     ${Object.entries(stored).map(([k, v]) => `localStorage.setItem('trainingLog_usr1:' + ${JSON.stringify(k)}, ${JSON.stringify(typeof v === 'string' ? v : JSON.stringify(v))});`).join('\n')}`,
    exerciseInfoSrc,
    extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'), extractConst(src, 'programs'),
    extractConst(src, 'EXERCISE_CANONICAL'), extractFunction(src, 'canonicalExName'), extractConst(src, 'LB_PER_KG'),
    'let exCorpusCache = null; let exCorpusCacheGen = -1; let exCorpusInflight = null; let importNameIndex = null;',
    extractConst(src, 'IMPORTED_PREFIX'), extractConst(src, 'IMPORT_MONTHS'), extractConst(src, 'IMPORT_NAME_ALIASES'), extractConst(src, 'importSlug'),
    extractConst(src, 'BARBELL_EXERCISES'), extractFunction(src, 'isBarbellExercise'),
    ...['parseExKey', 'normalizeExEntry', 'readExCorpus', 'parseCsvText', 'importDateKey', 'parseWorkoutExport',
        'buildImportNameIndex', 'refreshImportNameIndex', 'importEquipmentFits', 'matchImportName',
        'planWorkoutImport', 'applyWorkoutImport', 'importedKeys', 'removeImportedHistory', 'readImportedCorpus', 'readExCorpusWithImported',
        'estimated1RM', 'isMissedSet', 'topSetOf', 'groupCorpusByExercise', 'reconstructAllPRs'].map(f => extractFunction(src, f)),
    extractConst(src, 'importSkipText'),
    `window.storage = buildNamespacedStorage('1');
     window.api = {parseWorkoutExport, matchImportName, refreshImportNameIndex, readExCorpus, groupCorpusByExercise, importSkipText, planWorkoutImport, applyWorkoutImport, removeImportedHistory, readImportedCorpus, reconstructAllPRs, programs};`].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const keysWith = (w, prefix) => Array.from({length: w.localStorage.length}, (_, i) => w.localStorage.key(i)).filter(k => k.startsWith('trainingLog_usr1:' + prefix)).sort();
const snapshot = (w, prefix) => JSON.stringify(keysWith(w, prefix).map(k => [k, w.localStorage.getItem(k)]));

// A real slot key holding the app's own Bench Press, for the PR checks.
function benchSlot(w){
  for(const [pk, p] of Object.entries(w.api.programs)) for(const [dk, d] of Object.entries(p.days || {})){
    const i = (d.exercises || []).findIndex(e => e && e.name === 'Bench Press');
    if(i >= 0) return `ex:${pk}:${dk}:${i}`;
  }
  throw new Error('no Bench Press slot');
}

test('criterion 1: a Strong file maps the known names and lists the unknown one without writing it; warm-ups are left out', async (assert)=>{
  const w = page();
  const parsed = w.api.parseWorkoutExport(STRONG);
  assert.strictEqual(parsed.ok, true);
  assert.strictEqual(parsed.source, 'Strong');
  assert.strictEqual(parsed.weightUnit, null, "Strong's file doesn't say its unit");
  assert.strictEqual(parsed.sets.length, 5, 'the W row is a warm-up');
  const plan = w.api.planWorkoutImport(parsed, 'lb');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.mapping)), [
    {from: 'Bench Press (Barbell)', to: 'Bench Press', sets: 2},
    {from: 'Shoulder Press (Dumbbell)', to: 'DB Shoulder Press', sets: 1},
    {from: 'Squat (Barbell)', to: 'Squat', sets: 1},
  ]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.unmatched)), [{from: 'Zercher Carry Thing', sets: 1}]);
  await w.api.applyWorkoutImport(plan);
  const keys = keysWith(w, 'imported:').map(k => k.replace('trainingLog_usr1:', ''));
  assert.deepStrictEqual(keys, ['imported:bench-press', 'imported:db-shoulder-press', 'imported:squat']);
  assert.ok(!keys.some(k => /zercher/.test(k)), 'the unmatched name wrote nothing');
  const bench = JSON.parse(w.localStorage.getItem('trainingLog_usr1:imported:bench-press'));
  assert.strictEqual(JSON.stringify(bench), JSON.stringify([{date: '2025-03-04', sets: [{weight: 225, reps: 5, rpe: 8}, {weight: 230, reps: 3, rpe: 9}], n: 'Bench Press', src: 'Strong'}]));
});

test('a Hevy file: its date format, the kg column converted to lb, set_type warmup left out, an alias matched', async (assert)=>{
  const w = page();
  const parsed = w.api.parseWorkoutExport(HEVY);
  assert.strictEqual(parsed.source, 'Hevy');
  assert.strictEqual(parsed.weightUnit, 'kg');
  const plan = w.api.planWorkoutImport(parsed, parsed.weightUnit);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.mapping)).map(m => m.to), ['Bench Press', 'Barbell Row']);
  await w.api.applyWorkoutImport(plan);
  const bench = JSON.parse(w.localStorage.getItem('trainingLog_usr1:imported:bench-press'));
  assert.strictEqual(bench[0].date, '2025-05-10');
  assert.strictEqual(bench[0].sets.length, 1, 'the 40 kg warm-up is gone');
  assert.strictEqual(bench[0].sets[0].weight, 100 / 0.453592, '100 kg, unrounded, as a kg weight typed in the app is stored');
  assert.strictEqual(JSON.stringify(parsed.skipped), JSON.stringify({warmup: 1, noReps: 0, unreadable: 0}), 'the warm-up counted as left out, as a warm-up');
});

test('equipment has to fit: Smith, trap-bar and barbell-into-DB lifts stay unmatched; Strong\'s dumbbell suffix finds the DB exercise', (assert)=>{
  const w = page();
  assert.strictEqual(w.api.matchImportName('Squat (Smith Machine)'), null);
  assert.strictEqual(w.api.matchImportName('Deadlift (Trap Bar)'), null);
  assert.strictEqual(w.api.matchImportName('Bicep Curl (Barbell)'), null, 'not the DB Curl alias');
  assert.strictEqual(w.api.matchImportName('Bicep Curl (Dumbbell)'), 'DB Curl');
  assert.strictEqual(w.api.matchImportName('Bench Press (Machine)'), null, 'a machine press is not the barbell bench');
  assert.strictEqual(w.api.matchImportName('Lat Pulldown (Cable)'), 'Lat Pulldown');
  assert.strictEqual(w.api.matchImportName('Squat (Barbell)'), 'Squat');
});

test('a custom exercise is matched once the index is refreshed', async (assert)=>{
  const w = page({'custom-ex:strength:d1': [{name: 'Hip Thrust Machine Special', sets: '3×10'}]});
  assert.strictEqual(w.api.matchImportName('Hip Thrust Machine Special'), null, 'before the refresh');
  await w.api.refreshImportNameIndex();
  assert.strictEqual(w.api.matchImportName('Hip Thrust Machine Special'), 'Hip Thrust Machine Special');
});

test('numbers: the value decides its decimal mark, whatever the delimiter', (assert)=>{
  const w = page();
  const weights = (delim, vals) => JSON.parse(JSON.stringify(w.api.parseWorkoutExport(['Date', 'Exercise Name', 'Set Order', 'Weight', 'Reps'].join(delim) + vals.map(v => '\n' + ['2025-01-02', 'Leg Press', '1', v, '8'].join(delim)).join('')).sets.map(s => s.weight)));
  assert.deepStrictEqual(weights(',', ['"1,005"', '"102,5"', '102.5', '"1,005.5"']), [1005, 102.5, 102.5, 1005.5], 'comma file');
  assert.deepStrictEqual(weights(';', ['102,5', '102.5', '1.005', '1.005,5']), [102.5, 102.5, 1005, 1005.5], 'semicolon file');
});

test('the review says why rows were left out: an unreadable date format is named, not called a warm-up', (assert)=>{
  const w = page();
  const p = w.api.parseWorkoutExport('Date,Exercise Name,Set Order,Weight,Reps\n10/05/2023,Squat (Barbell),1,225,5\n2025-01-02,Squat (Barbell),W,95,5\n2025-01-02,Squat (Barbell),1,225,');
  assert.strictEqual(JSON.stringify(p.skipped), JSON.stringify({warmup: 1, noReps: 1, unreadable: 1}));
  assert.strictEqual(w.api.importSkipText(p.skipped), "<div>Left out: 1 warm-up, 1 with no reps, 1 with a date or name this couldn't read.</div>");
});

test('Exercise Progress keeps this app\'s own place and prescription when imported history is newer', async (assert)=>{
  const slot = benchSlot(page());
  const w = page({[slot]: [{date: '2025-01-02', sets: [{weight: 185, reps: 5}], n: 'Bench Press'}]});
  await w.api.applyWorkoutImport(w.api.planWorkoutImport(w.api.parseWorkoutExport(STRONG), 'lb')); // Strong is newer (2025-03)
  const corpus = [...await w.api.readExCorpus(), ...await w.api.readImportedCorpus()];
  const g = w.api.groupCorpusByExercise(corpus).find(x => x.name === 'Bench Press');
  assert.ok(g.log.some(e => e.src === 'Strong'), 'anchor: the import is in the group');
  assert.notStrictEqual(g.dayLabel, 'Imported (Strong)', 'the place is the app slot');
  assert.ok(g.exDef.sets, 'the slot\'s own prescription');
  // With no app sessions at all, the imported entry is all there is.
  const only = page();
  await only.api.applyWorkoutImport(only.api.planWorkoutImport(only.api.parseWorkoutExport(STRONG), 'lb'));
  const g2 = only.api.groupCorpusByExercise(await only.api.readImportedCorpus()).find(x => x.name === 'Bench Press');
  assert.strictEqual(g2.dayLabel, 'Imported (Strong)');
});

test('criterion 2: after an import, the ex: keys and their values are byte-identical to before', async (assert)=>{
  const slot = benchSlot(page());
  const w = page({[slot]: [{date: '2026-11-02', sets: [{weight: 185, reps: 5}], n: 'Bench Press'}]});
  const before = snapshot(w, 'ex:');
  assert.ok(before.includes('2026-11-02'), 'anchor: an ex: key is there');
  await w.api.applyWorkoutImport(w.api.planWorkoutImport(w.api.parseWorkoutExport(STRONG), 'lb'));
  await w.api.applyWorkoutImport(w.api.planWorkoutImport(w.api.parseWorkoutExport(HEVY), 'kg'));
  assert.strictEqual(snapshot(w, 'ex:'), before);
});

test('re-importing the same file replaces that source\'s days, so nothing doubles', async (assert)=>{
  const w = page();
  const plan = () => w.api.planWorkoutImport(w.api.parseWorkoutExport(STRONG), 'lb');
  await w.api.applyWorkoutImport(plan());
  const once = snapshot(w, 'imported:');
  await w.api.applyWorkoutImport(plan());
  assert.strictEqual(snapshot(w, 'imported:'), once);
});

test('criterion 3: an imported set heavier than any logged one is a PR event from reconstructAllPRs, labelled Imported', async (assert)=>{
  const slot = benchSlot(page());
  const w = page({[slot]: [{date: '2026-11-02', sets: [{weight: 185, reps: 5}], n: 'Bench Press'}]});
  const pre = JSON.stringify(await w.api.reconstructAllPRs());
  await w.api.applyWorkoutImport(w.api.planWorkoutImport(w.api.parseWorkoutExport(STRONG), 'lb'));
  const events = JSON.parse(JSON.stringify(await w.api.reconstructAllPRs()));
  const imported = events.filter(e => e.name === 'Bench Press' && e.dayLabel === 'Imported (Strong)');
  assert.ok(imported.length >= 1, 'a Bench Press PR from the archive');
  assert.ok(imported.some(e => e.weight === 230 || e.weight === 225), 'at the imported weight');
  assert.ok(imported.every(e => e.imported === true), 'marked imported');
  assert.ok(events.filter(e => e.dayLabel !== 'Imported (Strong)').every(e => !('imported' in e)), 'the app\'s own events unchanged');
  // The archive joined the existing group: one exercise, not a parallel one.
  assert.ok(events.every(e => e.name !== 'Bench Press (Barbell)'));
  assert.notStrictEqual(JSON.stringify(events), pre);
});

test('criterion 4: Remove imported history leaves no imported: keys, and reconstructAllPRs returns the pre-import events', async (assert)=>{
  const slot = benchSlot(page());
  const w = page({[slot]: [{date: '2026-11-02', sets: [{weight: 185, reps: 5}], n: 'Bench Press'}], 'custom-foods': '[]'});
  const pre = JSON.stringify(await w.api.reconstructAllPRs());
  const exBefore = snapshot(w, 'ex:');
  await w.api.applyWorkoutImport(w.api.planWorkoutImport(w.api.parseWorkoutExport(STRONG), 'lb'));
  assert.ok(keysWith(w, 'imported:').length > 0, 'anchor: imported');
  await w.api.removeImportedHistory();
  assert.strictEqual(keysWith(w, 'imported:').length, 0);
  assert.strictEqual(JSON.stringify(await w.api.reconstructAllPRs()), pre);
  assert.strictEqual(snapshot(w, 'ex:'), exBefore, 'and only imported: keys went');
  assert.strictEqual(w.localStorage.getItem('trainingLog_usr1:custom-foods'), '[]');
});

test('a file from neither app, or with no rows, is refused with a reason and nothing is planned', (assert)=>{
  const w = page();
  assert.match(w.api.parseWorkoutExport('a,b,c\n1,2,3').error, /doesn't look like a Strong or Hevy export/);
  assert.match(w.api.parseWorkoutExport('').error, /no rows/);
});

test('REAL source: only the PR and e1RM readers take the archive; the calendar, streaks, year recap and Training since do not', (assert)=>{
  const users = [...src.matchAll(/await readExCorpusWithImported\(\)/g)].length;
  assert.strictEqual(users, 3);
  for(const f of ['reconstructAllPRs', 'collectLiftE1RMs', 'renderExerciseProgress']) assert.match(extractFunction(src, f), /readExCorpusWithImported\(\)/, f);
  for(const f of ['fetchDayStatuses', 'computeYearRecap', 'renderTrainingSince', 'buildDayLog', 'buildWorkoutCsv']){
    const body = extractFunction(src, f);
    assert.doesNotMatch(body, /readExCorpusWithImported|readImportedCorpus/, f);
  }
  assert.doesNotMatch(extractFunction(src, 'readExCorpus'), /imported:/, 'readExCorpus itself stays slot-only');
  // Date-scoped counts are of records set here; "ready to go up" comes from sessions logged here.
  assert.match(extractFunction(src, 'sessionShareStats'), /e\.date === dateKey && !e\.imported/);
  assert.match(extractFunction(src, 'finishSheetModel'), /e\.date === dateKey && !e\.imported/);
  assert.match(extractFunction(src, 'weekShareTrainingStats'), /inWeek\(ev\.date\) && !ev\.imported/);
  assert.match(extractFunction(src, 'renderExerciseProgress'), /const appLog = log\.filter\(e => !e\.src\);[\s\S]*readyToProgress = appLog\.length > 0/);
  // The AI prompts list records set here; Import runs once per tap.
  assert.match(extractFunction(src, 'buildCrossMetricInsightsContext'), /\(await pcPRs\)\.filter\(p => !p\.imported\)/);
  assert.match(extractFunction(src, 'buildCoachChatContext'), /\(await pPRs\)\.filter\(p => !p\.imported\)/);
  assert.match(extractFunction(src, 'renderImportReview'), /importRunning\) return;\n\s*importRunning = true;/);
});

run();
