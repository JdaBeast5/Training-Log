'use strict';
// v3.544 (BL-55, audit D-5): cardio rows show a distance field only when
// distance is the measure, and distance never blocks a finished set.
//   - isDistanceExercise(name, sets): cardio only, and then a distance in the
//     prescription (400m, 2 km) or a run/ride/swim/walk/row/ski/sled/strides
//     name. Burpees, battle ropes and jump-rope drills lose the field.
//   - wireSetsBlock's real-set check no longer needs a distance: reps alone
//     start the rest timer on a cardio row.
//
// Real invocation: the real isDistanceExercise over the real exerciseInfo and
// every program slot; the real wireSetsBlock in jsdom; the real
// computeWeeklyCardio with readExCorpus stubbed.
//
// Sabotage: restore the old predicate (cardio = distance), and criterion 1
// fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-cardio-distance-gate.js');
const PRED = [extractConst(src, 'exerciseInfo'), extractConst(src, 'DISTANCE_EXERCISE_NAME_RE'), extractFunction(src, 'isDistanceExercise')];
const isDist = (pairs) => runSandbox(PRED, `__capture.push(${JSON.stringify(pairs)}.map(([n, s]) => isDistanceExercise(n, s)));`)[0];

// The real wireSetsBlock on one cardio row, with the real isDistanceExercise.
function cardioRow(ex, withDistanceInput){
  const html = `<div id="row"><input type="checkbox" data-idx="0"><div class="sets-block">
    <div class="set-row" data-set-idx="0" data-ex-idx="0"><span class="set-num">1</span>
      ${withDistanceInput ? '<input class="ex-distance" value="">' : ''}<input class="ex-reps" value=""><input class="ex-rpe" value=""><span class="set-status"></span>
    </div><button class="add-set-btn">Add Set</button></div></div>`;
  const globals = `
    window.exKey = ()=> 'ex:test:d1:0'; window.activeProgram = 'running'; window.activeDay = 'd1'; window.selectedLogDate = '2026-11-10';
    window.subVariantOf = ()=> undefined; window.isBarbellExercise = ()=> false; window.escapeHtml = (s)=> String(s);
    window.icon = (n)=> '<svg></svg>'; window.saveExSet = async ()=> ({isPR:false}); window.getFallbackPriorEntry = async ()=> null;
    window.renderWorkout = async ()=>{}; window.refreshSessionSummary = async ()=>{}; window.getDefaultRestSeconds = ()=> 90;
    window.getRestReasonLabel = ()=> ''; window.isBackdating = ()=> false; window.__restCalls = 0; window.startRestTimer = ()=>{ window.__restCalls++; };
    window.noteWorkoutActivity = ()=>{}; window.maybeOfferGymMode = ()=>{}; window.isPastPrNotificationWindow = async ()=> false;
    window.triggerCelebration = ()=>{}; window.toCanonicalLb = (v)=> Number(v); window.toCanonicalMetres = (v)=> Number(v);
    window.fmtWeight = (v)=> v + ' lb'; window.restTargetBySlot = {}; window.SpeechRecognitionCtor = null; window.saveExWarmupSkipped = async ()=>{};
    window.wirePlateButton = ()=>{}; window.wireVoiceLogButton = ()=>{}; window.calcPlatesPerSide = ()=> null; window.formatPlateResult = ()=> '';
    window.getEquipment = ()=> ({bar:45, plates:[45], dbIncrement:5}); window.toDisplayWeight = (v)=> v; window.trimUnitNum = (v)=> String(v);
    window.weightUnit = 'lb'; window.analyzeProgressionSignal = ()=> null; window.buildPastSessions = ()=> []; window.getExLog = async ()=> [];
    window.makeSwipeable = ()=>{};`;
  return runJsdom(html, globals, [...PRED, extractFunction(src, 'checkAllSetsCompleteAndAutoCheck'), extractFunction(src, 'wireSetsBlock'),
    `wireSetsBlock(document.getElementById('row'), 0, ${JSON.stringify(ex)});`]);
}
const change = (el, v) => { el.value = v; el.dispatchEvent(new el.ownerDocument.defaultView.Event('change', {bubbles: true})); };
const flush = () => new Promise(r => setTimeout(r, 0));

test('criterion 1: Burpees 4×10 is not a distance exercise, and logging reps alone starts the rest timer', async (assert)=>{
  assert.deepStrictEqual(isDist([['Burpees', '4×10'], ['Battle Ropes', '4×30s']]), [false, false]);
  const { document, window: w } = cardioRow({name: 'Burpees', sets: '4×10', noWeight: true}, false);
  change(document.querySelector('.ex-reps'), '10'); await flush();
  assert.strictEqual(w.__restCalls, 1);
});

test('criterion 2: 400m Repeats keeps its distance field, and logging the reps alone (no distance) starts the timer', async (assert)=>{
  assert.deepStrictEqual(isDist([['400m Repeats', '6×400m']]), [true]);
  const { document, window: w } = cardioRow({name: '400m Repeats', sets: '6×400m', noWeight: true}, true);
  change(document.querySelector('.ex-reps'), '6'); await flush();
  assert.strictEqual(w.__restCalls, 1, 'distance no longer blocks a finished set');
  // Distance alone (no reps) still does not count as a finished set.
  const r2 = cardioRow({name: '400m Repeats', sets: '6×400m', noWeight: true}, true);
  change(r2.document.querySelector('.ex-distance'), '400'); await flush();
  assert.strictEqual(r2.window.__restCalls, 0);
});

test('criterion 3: Easy Run 25-30 min keeps its distance field (and so its pace display); "25 min" is not read as metres or miles', (assert)=>{
  assert.deepStrictEqual(isDist([['Easy Run', '25-30 min'], ['Easy Run', '1×25 min']]), [true, true]);
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/isDistanceExercise\(ex\.name, ex\.sets\)/g) || []).length, 1, 'renderWorkout decides the field with the sets string');
});

test('criterion 4: computeWeeklyCardio gives the same metres as before for Easy Run, 400m Repeats and Rowing Machine Intervals', async (assert)=>{
  const corpus = [
    {exDef: {name: 'Easy Run', sets: '25-30 min'}, log: [{date: '2026-11-03', sets: [{distance: 5000, reps: 28}]}]},
    {exDef: {name: '400m Repeats', sets: '6×400m'}, log: [{date: '2026-11-04', sets: [{distance: 400, reps: 1}, {distance: 400, reps: 1}]}]},
    {exDef: {name: 'Rowing Machine Intervals', sets: '5×500m'}, log: [{date: '2026-11-05', sets: [{distance: 500, reps: 2}]}]},
  ];
  const old = `function isDistanceExercise(n){ const i = exerciseInfo[n]; return !!i && i.category === 'cardio'; }`;
  const runWith = (pred) => runSandboxAsync([extractConst(src, 'exerciseInfo'), extractConst(src, 'DISTANCE_EXERCISE_NAME_RE'), pred,
    "var distanceUnit = 'km', M_PER_KM = 1000, M_PER_MI = 1609.344;", ...['metresPerDisplayUnit', 'getSetFieldUnit', 'mondayOf', 'distanceOf', 'durationMinutesOf', 'computePace', 'computeWeeklyCardio'].map(f => { try{ return extractFunction(src, f); }catch(e){ return ''; } }),
    `function getTodayKey(){ return '2026-11-09'; } async function readExCorpus(){ return ${JSON.stringify(corpus)}; }`],
    `__capture.push((await computeWeeklyCardio(2)).map(w => w.metres));`);
  const [now] = await runWith(extractFunction(src, 'isDistanceExercise'));
  const [before] = await runWith(old);
  assert.deepStrictEqual(now, before);
  assert.ok(now.reduce((a, b) => a + b, 0) >= 6300, 'the distances are counted: ' + now);
});

test('criterion 5: over every program slot, no non-cardio exercise is a distance exercise (Barbell Row false), and every cardio slot naming a distance is one', (assert)=>{
  const [r] = runSandbox([...PRED, extractConst(src, 'programs'), extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
    ...['MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES'].map(c => extractConst(src, c))], `
    const slots = []; const seen = new Set();
    const visit = (days) => { for(const d of Object.values(days || {})){ if(!d || seen.has(d)) continue; seen.add(d); for(const e of d.exercises || []) slots.push(e); } };
    for(const k of Object.keys(programs)) visit(programs[k].days);
    for(const T of [MEDICAL_STYLES, COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES]) for(const st of Object.values(T)) visit(st.days);
    for(const v of Object.values(PROGRAM_DAY_COUNT_VARIANTS)) for(const x of Object.values(v)){ if(x && x.days) visit(x.days); else for(const y of Object.values(x || {})) visit(y.days); }
    const nonCardioTrue = slots.filter(e => (exerciseInfo[e.name] || {}).category !== 'cardio' && isDistanceExercise(e.name, e.sets)).map(e => e.name);
    const unitMissed = slots.filter(e => (exerciseInfo[e.name] || {}).category === 'cardio' && /\\d\\s*(m|yd|km|mi)\\b/i.test(e.sets || '') && !isDistanceExercise(e.name, e.sets)).map(e => e.name + ' ' + e.sets);
    __capture.push({n: slots.length, nonCardioTrue, unitMissed, barbellRow: isDistanceExercise('Barbell Row', '4×6-8'), farmers: isDistanceExercise("Farmer's Walk", '3×40yd')});`);
  assert.ok(r.n > 1000, 'slots: ' + r.n);
  assert.deepStrictEqual(r.nonCardioTrue, []);
  assert.deepStrictEqual(r.unitMissed, []);
  assert.strictEqual(r.barbellRow, false);
  assert.strictEqual(r.farmers, false);
});

test('review fix: a row with no distance box never erases a distance already saved on that set (real saveExSet)', async (assert)=>{
  const [r] = await runSandboxAsync([
    `var window = {}; var __store = {'ex:running:d1:0': JSON.stringify([{date: '2026-11-10', sets: [{weight: null, reps: 6, rpe: null, distance: 800}]}])};
     window.storage = { get: async k => (k in __store) ? {value: __store[k]} : null, set: async (k, v) => { __store[k] = v; } };
     var activeProgram = 'running', activeYogaStyle = 'flow', daysPerWeekPref = null, selectedLogDate = '2026-11-10';
     var restTargetBySlot = {}; var DAYS_PER_WEEK_PROGRAMS = [], DAYS_PER_WEEK_STYLE_CONTAINERS = [], PROGRAM_DAY_COUNT_VARIANTS = {};
     function isBackdating(){ return false; } function noteRestAchieved(){ return null; }
     function recordActivity(){ return Promise.resolve(); } function renderStreak(){} function markMilestone(){} function recordWorkoutTime(){}`,
    ...['exKey', 'slugifyExerciseName', 'normalizeExEntry', 'getExLog', 'entriesForExercise', 'legacyEntriesUnambiguous', 'todayEntryFor', 'isMissedSet', 'saveExSet'].map(f => extractFunction(src, f)),
  ], `
    await saveExSet('d1', 0, 0, '', '8', '', undefined, undefined, '', 'Sprint Intervals');  // no distance box: undefined
    const kept = JSON.parse(__store['ex:running:d1:0'])[0].sets[0].distance;
    await saveExSet('d1', 0, 0, '', '8', '', undefined, '', '', 'Sprint Intervals');         // a box cleared on purpose: ''
    const cleared = JSON.parse(__store['ex:running:d1:0'])[0].sets[0].distance;
    __capture.push({kept, cleared});`);
  assert.strictEqual(r.kept, 800);
  assert.strictEqual(r.cleared, undefined, 'clearing the box still clears it');
});

test('review fix: typing the distance after the reps does not restart the rest timer', async (assert)=>{
  const { document, window: w } = cardioRow({name: '400m Repeats', sets: '6×400m', noWeight: true}, true);
  change(document.querySelector('.ex-reps'), '6'); await flush();
  change(document.querySelector('.ex-distance'), '400'); await flush();
  assert.strictEqual(w.__restCalls, 1);
});

test('review fix: independent cases: a bike drill, spelled-out units and 5k keep the field; plain timed cardio and non-cardio never', (assert)=>{
  assert.deepStrictEqual(isDist([
    ['Sprint Intervals (Bike)', '6×30s'], ['Sprint Intervals', '4×1 mile'], ['Sprint Intervals', '3×200 yards'], ['Burpees', '5k'],
    ['Sprint Intervals', '8×20s'], ['Battle Ropes', '4×30s'], ['Barbell Row', '5k'], ['Easy Run', ''],
  ]), [true, true, true, true, false, false, false, true]);
});

test('review fix: the weekly cardio trend still counts distances logged on cardio exercises that lost the box', async (assert)=>{
  const corpus = [{exDef: {name: 'Sprint Intervals', sets: '8×20s'}, log: [{date: '2026-11-05', sets: [{distance: 1600, reps: 8}]}]}];
  const [m] = await runSandboxAsync([extractConst(src, 'exerciseInfo'), extractConst(src, 'DISTANCE_EXERCISE_NAME_RE'), extractFunction(src, 'isDistanceExercise'),
    "var distanceUnit = 'km', M_PER_KM = 1000, M_PER_MI = 1609.344;",
    ...['metresPerDisplayUnit', 'getSetFieldUnit', 'mondayOf', 'distanceOf', 'durationMinutesOf', 'computePace', 'computeWeeklyCardio'].map(f => { try{ return extractFunction(src, f); }catch(e){ return ''; } }),
    `function getTodayKey(){ return '2026-11-09'; } async function readExCorpus(){ return ${JSON.stringify(corpus)}; }`],
    `__capture.push((await computeWeeklyCardio(2)).reduce((a, w) => a + w.metres, 0));`);
  assert.strictEqual(m, 1600);
});

run();
