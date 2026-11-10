'use strict';
// v3.535 (BL-51, audit S-1 and D-2 part 1): new log entries record the
// exercise name, and suggestions ignore another exercise's entries.
//
// History keys are positional, so ex:bodybuilding:d5:0 holds Squat in the
// default layout but Incline DB Press in the 6-day variant. Before this, the
// Incline row read the Squat log and suggested adding weight from the squat
// load.
//
// Real invocation: the real saveExSet, getExLog, normalizeExEntry and
// entriesForExercise run over a stubbed window.storage; the suggestion path is
// the one renderWorkout composes (entriesForExercise -> buildPastSessions ->
// analyzeProgressionSignal -> buildProgressBadge, and priorSetForSlot ->
// computeSuggestedSet), all real. renderWorkout itself can't be driven in
// jsdom, so a call-count anchor pins that it routes those reads through
// entriesForExercise.
//
// Sabotage: make entriesForExercise return the whole log, and criterion 1
// fails (the Squat log produces an add-weight badge and a ghost load).
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-history-name-stamp.js');

const FNS = ['exKey', 'slugifyExerciseName', 'normalizeExEntry', 'getExLog', 'entriesForExercise', 'legacyEntriesUnambiguous',
  'todayEntryFor', 'saveExSet', 'saveExWarmupSet', 'getStyleContainerAccessor',
  'topSetOf', 'buildPastSessions', 'analyzeProgressionSignal', 'buildProgressBadge', 'computeSuggestedSet',
  'priorSetForSlot', 'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'roundToIncrement', 'snapToLoadable',
  'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight',
  'smallestLoadStep', 'capClinicalRpeLoad', 'rpeTargetFor', 'targetRpeForWeek', 'cycleWeekOf', 'rirFromRpe', 'loadForRpeTarget'];
const CONSTS = ['CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS',
  'BARBELL_EXERCISES', 'LB_PER_KG', 'DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK',
  'DAYS_PER_WEEK_PROGRAMS', 'DAYS_PER_WEEK_STYLE_CONTAINERS', 'PROGRAM_DAY_COUNT_VARIANTS'];

const SQUAT_LEGACY = [
  {date: '2026-11-02', sets: [{weight: 225, reps: 8, rpe: null}, {weight: 225, reps: 8, rpe: null}]},
  {date: '2026-11-05', sets: [{weight: 225, reps: 8, rpe: null}, {weight: 225, reps: 8, rpe: null}]},
];
const INCLINE = {name: 'Incline DB Press', sets: '3×8'};
const SQUAT = {name: 'Squat', sets: '3×6-8'};

function sandbox(store, globals, body){
  return runSandboxAsync([
    `var window = {}; var __store = ${JSON.stringify(store)};
     window.storage = {
       get: async k => (k in __store) ? {key: k, value: __store[k]} : null,
       set: async (k, v) => { __store[k] = v; return {key: k, value: v}; },
     };
     var activeProgram = 'bodybuilding', activeMartialArt = 'boxing', activeCyclingStyle = 'road',
         activeWatersportsStyle = 'surfing', activeMedicalStyle = 'diabetes', activeYogaStyle = 'flow';
     var daysPerWeekPref = null; var selectedLogDate = '2026-11-09'; var weightUnit = 'lb';
     var loadSuggestionMode = 'progression';
     var CYCLING_STYLES = {}, COMBAT_STYLES = {}, WATERSPORTS_STYLES = {}, YOGA_STYLES = {};
     var restTargetBySlot = {};
     function isBackdating(){ return false; } function noteRestAchieved(){ return null; }
     function recordActivity(){ return Promise.resolve(); } function renderStreak(){}
     function markMilestone(){} function recordWorkoutTime(){}
     ${globals}`,
    ...CONSTS.map(c => extractConst(src, c)),
    ...FNS.map(f => extractFunction(src, f)),
  ], body);
}

// The suggestion path exactly as renderWorkout composes it for one row.
const ROW = `
  async function suggestFor(ex, category){
    const log = await getExLog('d5', 0, undefined);
    const own = entriesForExercise(log, ex.name);
    const ownPrior = [...own].filter(e=> e.date !== selectedLogDate).sort((a,b)=> new Date(b.date+'T00:00:00') - new Date(a.date+'T00:00:00'))[0] || null;
    const pastSessions = buildPastSessions(own);
    const signal = analyzeProgressionSignal(pastSessions, ex, category, activeProgram);
    const priorTop = ownPrior ? topSetOf(ownPrior) : null;
    const badge = buildProgressBadge({ex, signal, inDeloadWeek: false, priorTop, topRep: parseTopRep(ex.sets), rpeCtx: null, sourceNote: ''});
    const sug = computeSuggestedSet(priorSetForSlot(ownPrior, 0, ex, false), signal, false, category, ex, priorTop, null);
    return {own: own.length, all: log.length, signal: signal && signal.type, badge: badge.html, sug};
  }`;

test('criterion 1: a legacy Squat log at ex:bodybuilding:d5:0 with day count 6 gives the Incline DB Press row no add-weight badge and no ghost load', async (assert)=>{
  const [r] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(SQUAT_LEGACY)}, 'daysPerWeekPref = 6;',
    `${ROW} __capture.push(await suggestFor(${JSON.stringify(INCLINE)}, 'push'));`);
  assert.strictEqual(r.all, 2, 'the log is there');
  assert.strictEqual(r.own, 0, 'none of it is the Incline row\'s');
  assert.strictEqual(r.signal, null);
  assert.strictEqual(r.badge, '', 'no badge');
  assert.ok(r.sug == null || r.sug.weight == null, 'no ghost load: ' + JSON.stringify(r.sug));
});

test('criterion 2: with the default day count, the same legacy log feeds the Squat row exactly as before (whole log, add-weight signal)', async (assert)=>{
  const [r] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(SQUAT_LEGACY)}, '',
    `${ROW} __capture.push(await suggestFor(${JSON.stringify(SQUAT)}, 'squat'));`);
  assert.strictEqual(r.own, 2);
  assert.strictEqual(r.signal, 'increase');
  assert.match(r.badge, /\S/, 'the badge shows');
  assert.ok(r.sug && r.sug.weight > 225, 'the ghost load rises from 225: ' + JSON.stringify(r.sug));
});

test('criterion 3: a set logged on the Incline row (real saveExSet) stamps n, and the next read uses it', async (assert)=>{
  const [r] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(SQUAT_LEGACY)}, 'daysPerWeekPref = 6;',
    `${ROW}
     await saveExSet('d5', 0, 0, '50', '8', '', undefined, undefined, undefined, 'Incline DB Press');
     const stored = JSON.parse(__store['ex:bodybuilding:d5:0']);
     selectedLogDate = '2026-11-12';
     __capture.push({today: stored.find(e => e.date === '2026-11-09'), row: await suggestFor(${JSON.stringify(INCLINE)}, 'push')});`);
  assert.strictEqual(r.today.n, 'Incline DB Press');
  assert.strictEqual(r.row.own, 1, 'only the stamped entry is the row\'s');
  assert.ok(r.row.sug && r.row.sug.weight != null && r.row.sug.weight < 100, 'the ghost load now comes from the 50 lb set: ' + JSON.stringify(r.row.sug));
});

test('criterion 4: an entry stamped n:"Squat" is ignored on the Incline row under any day count, including the default', async (assert)=>{
  const stamped = SQUAT_LEGACY.map(e => ({...e, n: 'Squat'}));
  for(const pref of ['null', '6', '4']){
    const [r] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(stamped)}, `daysPerWeekPref = ${pref};`,
      `${ROW} __capture.push(await suggestFor(${JSON.stringify(INCLINE)}, 'push'));`);
    assert.strictEqual(r.own, 0, 'pref ' + pref);
    assert.strictEqual(r.badge, '', 'pref ' + pref);
  }
});

test('criterion 5: history still reads every entry: getExLog returns the whole log, and buildExerciseHistoryHtml does not filter by name', async (assert)=>{
  const [r] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(SQUAT_LEGACY.concat([{date: '2026-11-07', n: 'Incline DB Press', sets: [{weight: 50, reps: 8, rpe: null}]}]))}, 'daysPerWeekPref = 6;',
    `__capture.push((await getExLog('d5', 0, undefined)).length);`);
  assert.strictEqual(r, 3);
  const hist = extractFunction(src, 'buildExerciseHistoryHtml').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.ok(!/entriesForExercise\(/.test(hist), 'the History view is not filtered');
});

test('criterion 6: a new set\'s stored object is byte-identical to before (only the entry gains n); yoga legacy entries count only in the flow style', async (assert)=>{
  const [r] = await sandbox({}, '',
    `await saveExSet('d1', 0, 0, '135', '5', '8', undefined, undefined, undefined, 'Back Squat');
     const e = JSON.parse(__store['ex:bodybuilding:d1:0'])[0];
     activeProgram = 'yoga'; activeYogaStyle = 'yin';
     const yin = entriesForExercise([{date: '2026-11-01', sets: []}], 'Pigeon Pose').length;
     activeYogaStyle = 'flow';
     const flow = entriesForExercise([{date: '2026-11-01', sets: []}], 'Pigeon Pose').length;
     __capture.push({set: JSON.stringify(e.sets[0]), keys: Object.keys(e).sort(), yin, flow});`);
  assert.strictEqual(r.set, '{"weight":135,"reps":5,"rpe":8}');
  assert.deepStrictEqual(r.keys, ['date', 'n', 'sets']);
  assert.strictEqual(r.yin, 0);
  assert.strictEqual(r.flow, 1);
});

test('the PR check inside saveExSet ignores entries stamped as another exercise, but still counts unstamped legacy entries (no false PR)', async (assert)=>{
  const stamped = SQUAT_LEGACY.map(e => ({...e, n: 'Squat'}));
  const [a] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(stamped)}, 'daysPerWeekPref = 6;',
    `__capture.push(await saveExSet('d5', 0, 0, '60', '8', '', undefined, undefined, undefined, 'Incline DB Press'));`);
  assert.strictEqual(a.priorMax, null, 'the stamped 225 lb squat sets are not this exercise\'s');
  const [b] = await sandbox({'ex:bodybuilding:d5:0': JSON.stringify(SQUAT_LEGACY)}, 'daysPerWeekPref = 6;',
    `__capture.push(await saveExSet('d5', 0, 0, '230', '8', '', undefined, undefined, undefined, 'Incline DB Press'));`);
  assert.strictEqual(b.priorMax, 225, 'legacy entries still count, as before');
});

test('legacy entries are trusted wherever the layout is the authored one: a pref with no variant (bodybuilding 5), a program without variants (medical); not yoga outside flow', async (assert)=>{
  const [r] = await sandbox({}, '', `
    const L = [{date: '2026-11-01', sets: []}];
    const at = (prog, pref, yoga) => { activeProgram = prog; daysPerWeekPref = pref; activeYogaStyle = yoga || 'flow'; return entriesForExercise(L, 'X').length; };
    __capture.push({bb5: at('bodybuilding', 5), bb6: at('bodybuilding', 6), med: at('medical', 4), yogaYin: at('yoga', null, 'yin'), yogaFlow: at('yoga', null, 'flow')});`);
  assert.deepStrictEqual(r, {bb5: 1, bb6: 0, med: 1, yogaYin: 0, yogaFlow: 1});
});

test('a warm-up logged first (real saveExWarmupSet) creates today\'s entry stamped with the exercise, and the first working set keeps it', async (assert)=>{
  const [r] = await sandbox({}, 'daysPerWeekPref = 6;', `
    await saveExWarmupSet('d5', 0, 0, '45', '10', true, undefined, 'Incline DB Press');
    await saveExSet('d5', 0, 0, '50', '8', '', undefined, undefined, undefined, 'Incline DB Press');
    const log = JSON.parse(__store['ex:bodybuilding:d5:0']);
    __capture.push({n: log.map(e => e.n), count: log.length});`);
  assert.deepStrictEqual(r, {n: ['Incline DB Press'], count: 1});
});

test('History (real buildExerciseHistoryHtml) lists every entry and labels one stamped as another exercise', async (assert)=>{
  const log = [{date: '2026-11-02', n: 'Squat', sets: [{weight: 225, reps: 8}]}, {date: '2026-11-05', n: 'Incline DB Press', sets: [{weight: 50, reps: 8}]}, {date: '2026-11-07', sets: [{weight: 55, reps: 8}]}];
  const HIST = ['escapeHtml', 'normalizeExEntry', 'subVariantOf', 'topSetOf', 'estimated1RM', 'toDisplayWeight', 'trimUnitNum', 'distanceOf', 'dropVolumeOf', 'volumeOf', 'parseDateKey', 'formatDate', 'formatShortDate', 'toDisplayDistance', 'metresPerDisplayUnit', 'buildExerciseHistoryHtml'];
  const { window } = runJsdom('<div id="h"></div>', `
    var weightUnit = 'lb', distanceUnit = 'mi', activeDay = 'd5', LB_PER_KG = 0.453592, M_PER_MI = 1609.344, M_PER_KM = 1000;
    async function getExLog(){ return ${JSON.stringify(log)}; }`, HIST.map(n => { try{ return extractFunction(src, n); }catch(e){ return ''; } }));
  window.document.getElementById('h').innerHTML = await window.buildExerciseHistoryHtml(0, {name: 'Incline DB Press'}, {});
  const dates = [...window.document.querySelectorAll('.exh-date')].map(d => d.textContent);
  assert.strictEqual(dates.length, 3, 'every entry listed');
  assert.strictEqual(dates.filter(d => /· Squat$/.test(d)).length, 1, 'the Squat entry is labelled: ' + dates.join(' | '));
  assert.strictEqual(dates.filter(d => /·/.test(d)).length, 1, 'own and unstamped entries carry no label');
});

test('anchors (real-call counts, comments stripped): renderWorkout, the heads-up and the fit check read through entriesForExercise; both saveExSet calls pass ex.name', (assert)=>{
  const strip = f => extractFunction(src, f).split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  const count = (f, re) => (strip(f).match(re) || []).length;
  assert.strictEqual(count('renderWorkout', /entriesForExercise\(/g), 1);
  assert.strictEqual(count('renderWorkout', /buildPastSessions\(ownLogs\[i\]\)/g), 1);
  assert.strictEqual(count('renderWorkout', /\[\.\.\.ownLogs\[i\]\]/g), 1);
  assert.strictEqual(count('getSessionHeadsUpInsight', /entriesForExercise\(/g), 1);
  assert.strictEqual(count('computeProgramFitTrend', /entriesForExercise\(/g), 1);
  assert.strictEqual(count('wireSetsBlock', /saveExSet\([^)]*ex\.name\)/g), 2);
  assert.strictEqual(count('wireSetsBlock', /saveExSet\(/g), 2);
  // Every other writer passes the name too, and gets today's entry from todayEntryFor.
  assert.strictEqual(count('wireSetsBlock', /saveEx(?:DropSet|WarmupSet|WarmupSkipped)\(/g), 5);
  assert.strictEqual(count('wireSetsBlock', /saveEx(?:DropSet|WarmupSet|WarmupSkipped)\([^;]*ex\.name\)/g), 5);
  for(const f of ['saveExSet', 'saveExDropSet', 'saveExWarmupSet', 'saveExWarmupSkipped']) assert.strictEqual(count(f, /todayEntryFor\(/g), 1, f);
  // Same as Last (in wireSetsBlock), the cross-program fallback and the swap modal ignore other exercises' entries.
  assert.strictEqual(count('wireSetsBlock', /entriesForExercise\(/g), 1);
  assert.strictEqual(count('getFallbackPriorEntry', /e\.n == null \|\| e\.n === exerciseName/g), 1);
  assert.strictEqual(count('openExerciseSubModal', /entriesForExercise\(/g), 1);
});

run();
