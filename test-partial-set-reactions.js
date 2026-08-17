'use strict';
// Behavioral coverage for the partial-set-save bug found during a real
// golden-path walkthrough: typing only a weight (reps still blank) used to
// start the rest-timer countdown and pop the "Switch to gym mode?" offer
// immediately — both meant for a FINISHED set, firing mid-entry. Fixed in
// wireSetRow's save() (inside wireSetsBlock) by gating those two reactive
// consequences behind an isRealSet check: reps present, plus weight (unless
// ex.noWeight) and distance (for cardio exercises) if the row asks for them.
// The underlying autosave-as-you-type (saveExSet) and noteWorkoutActivity
// (screen-awake signal) are deliberately left OUTSIDE that gate — partial
// data must still persist, and keeping the screen on while typing is
// harmless, unlike the two intrusive UI reactions this fix targets.
//
// Uses the same REAL wireSetsBlock + checkAllSetsCompleteAndAutoCheck
// invocation harness proven in test-auto-check-sets.js and
// test-enter-key-chaining.js — external dependencies (storage, sibling
// render functions) are stubbed; the function under test is the real,
// freshly-extracted source, and set-field 'change' events are dispatched for
// real, not simulated by calling save() directly.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');

function bodyHtml(){
  return `
    <div id="row">
      <input type="checkbox" data-idx="0">
      <div class="sets-block">
        <div class="set-row" data-set-idx="0" data-ex-idx="0">
          <span class="set-num">1</span>
          <input class="ex-weight" value="">
          <input class="ex-distance" value="">
          <input class="ex-reps" value="">
          <input class="ex-rpe" value="">
          <span class="set-status"></span>
        </div>
        <button class="add-set-btn">Add Set</button>
      </div>
    </div>
  `;
}

// isDistance controls isDistanceExercise's stub return (cardio row: distance
// required alongside reps). Mirrors test-enter-key-chaining.js's proven stub
// list, adding call counters for the three reactive consumers this fix
// distinguishes between (rest timer / gym mode, gated; activity, not).
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

function setValueAndChange(input, value){
  input.value = value;
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('change', {bubbles: true}));
}

function flush(){
  return new Promise(resolve=> setTimeout(resolve, 0));
}

const { test, run } = makeRunner('test-partial-set-reactions.js');

test('a barbell exercise: weight alone (reps still blank) does NOT start the rest timer or offer gym mode', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(false), [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-weight'), '185');
  await flush();
  assert.strictEqual(win.__restCalls, 0, 'weight-only must not start the rest timer');
  assert.strictEqual(win.__gymCalls, 0, 'weight-only must not offer gym mode');
  assert.strictEqual(win.__activityCalls, 1, 'weight-only must still count as workout activity (screen-awake signal, unaffected by this fix)');
});

test('the same barbell exercise: once reps is also filled in, the rest timer and gym-mode offer DO fire', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(false), [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-weight'), '185');
  await flush();
  setValueAndChange(row.querySelector('.ex-reps'), '5');
  await flush();
  assert.strictEqual(win.__restCalls, 1, 'a finished set (weight + reps) must start the rest timer exactly once');
  assert.strictEqual(win.__gymCalls, 1, 'a finished set (weight + reps) must offer gym mode exactly once');
});

test('a bodyweight exercise (ex.noWeight): reps alone is already a finished set, since weight was never required', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(false), [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Pull-ups', sets:'3xAMRAP', noWeight: true});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-reps'), '12');
  await flush();
  assert.strictEqual(win.__restCalls, 1, 'reps alone must be enough for a noWeight exercise, not held back waiting for a weight field that does not apply');
  assert.strictEqual(win.__gymCalls, 1);
});

test('a distance/cardio exercise: distance alone (reps still blank) does NOT start the rest timer or offer gym mode', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(true), [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Row Sprint', sets:'5x400m', noWeight: true});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-distance'), '400');
  await flush();
  assert.strictEqual(win.__restCalls, 0, 'distance-only must not start the rest timer — reps is still required alongside distance');
  assert.strictEqual(win.__gymCalls, 0);
});

test('the same distance/cardio exercise: once reps is also filled in, the rest timer and gym-mode offer DO fire', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(true), [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Row Sprint', sets:'5x400m', noWeight: true});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-distance'), '400');
  await flush();
  setValueAndChange(row.querySelector('.ex-reps'), '1');
  await flush();
  assert.strictEqual(win.__restCalls, 1);
  assert.strictEqual(win.__gymCalls, 1);
});

run();
