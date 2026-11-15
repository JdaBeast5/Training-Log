'use strict';
// v3.559 (BL-56, audit D-4): noWeight on moves that never take load, and
// load on the ones that do. A weight field on a bodyweight move held the set
// back (weight is required before it counts), so the rest timer never
// started.
//
// Real invocation: a sweep of every slot in the real programs, the day-count
// variants and the *_STYLES tables; the real wireSetsBlock on a row built from
// the real Bodyweight d1 Push-up slot (the row's globals are the harness of
// test-partial-set-reactions.js); the real buildExerciseHistoryHtml.
//
// Sabotage: drop one slot's flag and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-noweight-consistency.js');
const DATA = ['programs', 'PROGRAM_DAY_COUNT_VARIANTS', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES'].map(c => extractConst(src, c));
const GLOBAL = ['Bird Dog', 'Dead Bug', 'Side Plank', 'McGill Curl-up', 'Bodyweight Squat', 'Jump Squat', 'Push-up to Plank', 'Bicycle Crunch', 'Single-Leg Bound'];
const BODYWEIGHT = ['Push-up', 'Pike Push-up', 'Decline Push-up', 'Triceps Dip', 'Inverted Row', 'Chin-up', 'Pull-ups (or assisted)', 'Nordic Curl', 'Bulgarian Split Squat', 'Calf Raise', 'Glute Bridge'];

// Every slot, with the program it belongs to.
const [SLOTS] = runSandbox(DATA, `
  const out = [];
  const visit = (owner, days) => { for(const d of Object.values(days || {})) for(const ex of d.exercises || []) out.push({owner, name: ex.name, noWeight: !!ex.noWeight}); };
  for(const [k, p] of Object.entries(programs)) visit(k, p.days);
  for(const [k, v] of Object.entries(PROGRAM_DAY_COUNT_VARIANTS)) for(const x of Object.values(v)){ if(x && x.days) visit(k, x.days); else for(const y of Object.values(x || {})) visit(k, y.days); }
  for(const [n, T] of [['medical', MEDICAL_STYLES], ['combat', COMBAT_STYLES], ['cycling', CYCLING_STYLES], ['watersports', WATERSPORTS_STYLES], ['yoga', YOGA_STYLES]]) for(const st of Object.values(T)) visit(n, st.days);
  __capture.push(out);`);

test('criterion 1: every slot of the listed moves, and the listed Bodyweight-program moves, is noWeight', (assert)=>{
  const missing = SLOTS.filter(s => !s.noWeight && (GLOBAL.includes(s.name) || (s.owner === 'bodyweight' && BODYWEIGHT.includes(s.name))));
  assert.ok(SLOTS.filter(s => GLOBAL.includes(s.name)).length > 50, 'anchor: the listed moves appear across the programs');
  assert.deepStrictEqual(missing.map(s => s.owner + '|' + s.name), []);
  // Calisthenics keeps its load fields on weighted calisthenics.
  const cal = SLOTS.filter(s => s.owner === 'calisthenics' && ['Dip (Bar/Ring)', 'Muscle-up', 'Pull-ups (or assisted)'].includes(s.name));
  assert.ok(cal.length >= 3, 'anchor: Calisthenics dips, pull-ups and muscle-ups');
  assert.deepStrictEqual(cal.filter(s => s.noWeight).map(s => s.name), [], 'Calisthenics keeps their load fields (weighted calisthenics)');
});

test('criterion 4: Sled Push, Sled Pull and Wall Balls agree: none is noWeight in any slot', (assert)=>{
  const loaded = SLOTS.filter(s => ['Sled Push', 'Sled Pull', 'Wall Balls'].includes(s.name));
  assert.ok(loaded.length >= 3, 'anchor');
  assert.deepStrictEqual(loaded.filter(s => s.noWeight).map(s => s.owner + '|' + s.name), []);
});

function globalsFor(isDistance){
  return `
    window.exKey = ()=> 'ex:test:d1:0';
    window.activeProgram = 'strength';
    window.activeDay = 'd1';
    window.selectedLogDate = '2026-01-01';
    window.subVariantOf = ()=> undefined;
    window.isDistanceExercise = ()=> ${isDistance};
    window.isBarbellExercise = ()=> false;
    window.escapeHtml = (s)=> String(s);
    window.icon = (n)=> '<svg data-icon="'+n+'"></svg>'; // 2026-10-27 (v3.422): a saved set shows the drawn check
    window.saveExSet = async ()=> ({isPR:false});
    window.getFallbackPriorEntry = async ()=> null;
    window.renderWorkout = async ()=>{};
    window.refreshSessionSummary = async ()=>{};
    window.getDefaultRestSeconds = ()=> 90;
    window.getRestReasonLabel = ()=> '';
    // Not what this file is testing (see test-backdating-rest-timer-
    // suppression.js for that) — stubbed false so save()'s real call to the
    // real isBackdating() doesn't throw ReferenceError.
    window.isBackdating = ()=> false;
    window.__restCalls = 0;
    window.startRestTimer = ()=>{ window.__restCalls++; };
    window.__activityCalls = 0;
    window.noteWorkoutActivity = ()=>{ window.__activityCalls++; };
    window.__gymCalls = 0;
    window.maybeOfferGymMode = ()=>{ window.__gymCalls++; };
    window.isPastPrNotificationWindow = async ()=> false;
    window.triggerCelebration = ()=>{};
    window.toCanonicalLb = (v)=> Number(v);
    window.toCanonicalMetres = (v)=> Number(v);
    window.fmtWeight = (v)=> v + ' lb';
    window.restTargetBySlot = {};
    window.SpeechRecognitionCtor = null;
    window.saveExWarmupSkipped = async ()=>{};
    window.wirePlateButton = ()=>{};
    window.wireVoiceLogButton = ()=>{};
    window.calcPlatesPerSide = ()=> null;
    window.formatPlateResult = ()=> '';
    window.getEquipment = ()=> ({bar:45, plates:[45,35,25,10,5,2.5], dbIncrement:5});
    window.toDisplayWeight = (v)=> v;
    window.trimUnitNum = (v)=> String(v);
    window.weightUnit = 'lb';
    window.analyzeProgressionSignal = ()=> null;
    window.exerciseInfo = {'Bench Press': {category:'push'}};
    window.buildPastSessions = ()=> [];
    window.getExLog = async ()=> [];
    window.makeSwipeable = ()=>{};
  `;
}

function flush(){
  return new Promise(resolve=> setTimeout(resolve, 0));
}

test('criterion 2: the real wireSetsBlock on the real Bodyweight d1 Push-up slot, with no weight input: reps alone start the rest timer', async (assert)=>{
  const [slot] = runSandbox(DATA, `__capture.push(programs.bodyweight.days.d1.exercises.find(e => e.name === 'Push-up'));`);
  assert.strictEqual(slot.noWeight, true, 'read from programs');
  const html = `<div id="row"><input type="checkbox" data-idx="0"><div class="sets-block"><div class="set-row" data-set-idx="0" data-ex-idx="0">
    <span class="set-num">1</span><input class="ex-reps" value=""><input class="ex-rpe" value=""><span class="set-status"></span></div>
    <button class="add-set-btn">Add Set</button></div></div>`;
  const { document, window: win } = runJsdom(html, globalsFor(false).replace(/wireSetsBlock\([^\n]*\n/, ''), [extractFunction(src, 'checkAllSetsCompleteAndAutoCheck'), extractFunction(src, 'wireSetsBlock'),
    `wireSetsBlock(document.getElementById('row'), 0, ${JSON.stringify(slot)});`]);
  const reps = document.querySelector('.ex-reps');
  reps.value = '12'; reps.dispatchEvent(new win.Event('change', {bubbles: true}));
  await flush();
  assert.strictEqual(win.__restCalls, 1);
});

test('criterion 3: an old weighted Push-up entry still prints its weight in the real buildExerciseHistoryHtml', async (assert)=>{
  const HIST = ['escapeHtml', 'normalizeExEntry', 'subVariantOf', 'isMissedSet', 'topSetOf', 'estimated1RM', 'toDisplayWeight', 'trimUnitNum', 'distanceOf', 'dropVolumeOf', 'volumeOf', 'parseDateKey', 'formatDate', 'formatShortDate', 'toDisplayDistance', 'metresPerDisplayUnit', 'buildExerciseHistoryHtml'];
  const { window } = runJsdom('<div id="h"></div>', `
    var weightUnit = 'lb', distanceUnit = 'mi', activeDay = 'd1', LB_PER_KG = 0.453592, M_PER_MI = 1609.344, M_PER_KM = 1000;
    async function getExLog(){ return [{date: '2026-10-01', sets: [{weight: 25, reps: 12}]}]; }`, HIST.map(n => { try{ return extractFunction(src, n); }catch(e){ return ''; } }));
  window.document.getElementById('h').innerHTML = await window.buildExerciseHistoryHtml(0, {name: 'Push-up', sets: '3×10-15', noWeight: true}, {});
  assert.match(window.document.getElementById('h').textContent, /25/);
});

run();
