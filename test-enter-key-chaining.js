'use strict';
// Behavioral coverage for Phase F2: Enter/"next" now actually advances
// between weight -> reps -> RPE fields in a working-set row. Every field
// already carried enterkeyhint="next" (a hint to the mobile keyboard),
// but nothing listened for it — tapping "Next" did nothing.
//
// Uses a REAL wireSetsBlock invocation (same stub harness proven in
// test-auto-check-sets.js's integration test — external dependencies like
// storage and sibling render functions are stubbed, wireSetsBlock and
// wireSetRow themselves are the real extracted source) and dispatches
// real keydown Enter events, asserting on document.activeElement.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');

const bodyHtml = `
  <div id="row">
    <input type="checkbox">
    <div class="sets-block">
      <div class="set-row" data-set-idx="0">
        <span class="set-num">1</span>
        <input class="ex-weight" value="">
        <input class="ex-reps" value="">
        <input class="ex-rpe" value="">
      </div>
      <button class="add-set-btn">Add Set</button>
    </div>
  </div>
`;

const globals = `
  window.exKey = ()=> 'ex:test:d1:0';
  window.activeProgram = 'strength';
  window.activeDay = 'd1';
  window.selectedLogDate = '2026-01-01';
  window.subVariantOf = ()=> undefined;
  window.isDistanceExercise = ()=> false;
  window.isBarbellExercise = ()=> false;
  window.escapeHtml = (s)=> String(s);
  window.saveExSet = async ()=> ({isPR:false});
  window.getFallbackPriorEntry = async ()=> null;
  window.renderWorkout = async ()=>{};
  window.refreshSessionSummary = async ()=>{};
  window.getDefaultRestSeconds = ()=> 90;
  window.getRestReasonLabel = ()=> '';
  window.startRestTimer = ()=>{};
  window.noteWorkoutActivity = ()=>{};
  window.maybeOfferGymMode = ()=>{};
  window.isPastPrNotificationWindow = async ()=> false;
  window.triggerCelebration = ()=>{};
  window.toCanonicalLb = (v)=> Number(v);
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

function pressEnter(el){
  el.dispatchEvent(new el.ownerDocument.defaultView.KeyboardEvent('keydown', {key:'Enter', bubbles:true, cancelable:true}));
}

const { test, run } = makeRunner('test-enter-key-chaining.js');

test('Enter on the weight field moves focus to reps', (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml, globals, [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  const w = row.querySelector('.ex-weight');
  const reps = row.querySelector('.ex-reps');
  w.focus();
  pressEnter(w);
  assert.strictEqual(document.activeElement, reps, 'focus must land on the reps field after Enter on weight');
});

test('Enter on the reps field moves focus to RPE', (assert)=>{
  const { document } = runJsdom(bodyHtml, globals, [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  const reps = row.querySelector('.ex-reps');
  const rpe = row.querySelector('.ex-rpe');
  reps.focus();
  pressEnter(reps);
  assert.strictEqual(document.activeElement, rpe, 'focus must land on the RPE field after Enter on reps');
});

test('Enter on the RPE field (the last one) blurs it rather than doing nothing', (assert)=>{
  const { document } = runJsdom(bodyHtml, globals, [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  const rpe = row.querySelector('.ex-rpe');
  rpe.focus();
  assert.strictEqual(document.activeElement, rpe);
  pressEnter(rpe);
  assert.notStrictEqual(document.activeElement, rpe, 'RPE must lose focus (blur) after Enter, not stay focused with nothing happening');
});

test('a non-Enter key does not move focus', (assert)=>{
  const { document } = runJsdom(bodyHtml, globals, [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  const w = row.querySelector('.ex-weight');
  const reps = row.querySelector('.ex-reps');
  w.focus();
  w.dispatchEvent(new document.defaultView.KeyboardEvent('keydown', {key:'a', bubbles:true}));
  assert.strictEqual(document.activeElement, w, 'a plain character key must not trigger the field-advance behavior');
  assert.notStrictEqual(document.activeElement, reps);
});

run();
