'use strict';
// Behavioral coverage for a bug found during a dedicated Today/Workout-
// logging audit (not user-reported, not a hypothetical): wireSetRow's
// save() called startRestTimer() on every finished set with no
// isBackdating() check. Retroactively filling in a set for a past day
// still popped a live countdown timer, which makes no sense outside a
// real-time session — the exact position saveExSet's own rest/restTarget
// recording already takes ("the elapsed time between two entries typed on
// Sunday for a workout done on Thursday is a measurement of typing
// speed"), and the same position maybeOfferGymMode() already guards
// internally ("Backdating is not training"). The rest timer was the one
// reactive consequence of the same isRealSet signal that never got the
// same guard.
//
// Same real wireSetsBlock + dispatched 'change' event harness proven in
// test-partial-set-reactions.js / test-superset-rest-timer-suppression.js.
// isBackdating and getTodayKey are extracted for real (not stubbed) since
// the whole point is proving the real backdating check now gates the real
// call site — a stubbed isBackdating would only prove the stub was wired
// up, not that the fix uses the app's actual definition of "backdating".
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');
const isBackdatingSrc = extractFunction(src, 'isBackdating');
const getTodayKeySrc = extractFunction(src, 'getTodayKey');

// A real "today" computed the same way the app does, so this test never
// goes stale — and a clearly-past date for the backdating case.
const REAL_TODAY = (()=>{
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
})();
const PAST_DATE = '2020-01-01';

function bodyHtml(){
  return `
    <div id="row">
      <input type="checkbox">
      <div class="sets-block">
        <div class="set-row" data-set-idx="0">
          <span class="set-num">1</span>
          <input class="ex-weight" value="">
          <input class="ex-reps" value="">
          <input class="ex-rpe" value="">
          <span class="set-status"></span>
        </div>
        <button class="add-set-btn">Add Set</button>
      </div>
    </div>
  `;
}

function globalsFor(selectedLogDate){
  return `
    window.exKey = ()=> 'ex:test:d1:0';
    window.activeProgram = 'strength';
    window.activeDay = 'd1';
    window.selectedLogDate = '${selectedLogDate}';
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
    window.__restCalls = 0;
    window.startRestTimer = ()=>{ window.__restCalls++; };
    window.__gymCalls = 0;
    window.maybeOfferGymMode = ()=>{ window.__gymCalls++; };
    window.noteWorkoutActivity = ()=>{};
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

const { test, run } = makeRunner('test-backdating-rest-timer-suppression.js');

test('REAL invocation: finishing a set while backdating (selectedLogDate !== today) does NOT start the rest timer, but still offers gym mode', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(PAST_DATE), [getTodayKeySrc, isBackdatingSrc, checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-weight'), '185');
  await flush();
  setValueAndChange(row.querySelector('.ex-reps'), '5');
  await flush();
  assert.strictEqual(win.__restCalls, 0, 'a finished set while backdating must NOT start a live rest timer — there is no "next set" about to happen right now');
  assert.strictEqual(win.__gymCalls, 1, 'maybeOfferGymMode is called regardless — it already has its own internal backdating guard, unaffected by this fix');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(win.restTargetBySlot)), {}, 'no rest target should be recorded while backdating');
});

test('regression guard: finishing a set on the REAL today (not backdating) still starts the rest timer exactly as before', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), globalsFor(REAL_TODAY), [getTodayKeySrc, isBackdatingSrc, checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-weight'), '185');
  await flush();
  setValueAndChange(row.querySelector('.ex-reps'), '5');
  await flush();
  assert.strictEqual(win.__restCalls, 1, 'a finished set on the real current day must still start the rest timer normally');
  assert.strictEqual(win.__gymCalls, 1);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(win.restTargetBySlot)), {'ex:test:d1:0': 90});
});

run();
