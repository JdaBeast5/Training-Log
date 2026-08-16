'use strict';
// Behavioral coverage for another Gym Mode audit finding, fixed alongside
// the superset field-chaining work (test-superset-field-chaining.js):
// getDefaultRestSeconds/startRestTimer never checked ex.superTag, so
// finishing a set on the TOP half of a superset pair popped a real 90-240s
// rest countdown — directly contradicting the pair's own
// .superset-connector label, "SUPERSET — straight into the next exercise,
// no rest between". Fixed in wireSetRow's save() (inside wireSetsBlock) by
// splitting the old single isRealSet gate into two: the rest-timer/
// restTargetBySlot consequence is now ALSO gated on !ex.superTag, while
// maybeOfferGymMode (an unrelated consequence of the same isRealSet signal)
// still fires exactly as before, regardless of superset status.
//
// The bottom half of a pair carries no superTag of its own (only the top
// half's exercise object does — see renderWorkout's isSupersetTop), so it
// is unaffected by this fix and keeps the normal rest timer once the pair
// is actually finished; that's covered here by simply using an exercise
// object without superTag, same as any non-superset exercise looks to
// wireSetsBlock (which only ever receives the one exercise being logged,
// never its neighbors).
//
// Same real wireSetsBlock + dispatched 'change' event harness proven in
// test-partial-set-reactions.js, whose own non-superset assertions this
// fix must leave completely unaffected (that file still passes, unchanged).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');

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

const GLOBALS = `
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
  window.getRestReasonLabel = ()=> 'Hypertrophy · isolation';
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
  window.exerciseInfo = {'DB Curl': {category:'pull'}, 'Lateral Raise': {category:'pull'}};
  window.buildPastSessions = ()=> [];
  window.getExLog = async ()=> [];
  window.makeSwipeable = ()=>{};
`;

function setValueAndChange(input, value){
  input.value = value;
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('change', {bubbles: true}));
}

function flush(){
  return new Promise(resolve=> setTimeout(resolve, 0));
}

const { test, run } = makeRunner('test-superset-rest-timer-suppression.js');

test('REAL invocation: finishing a set on the TOP half of a superset (ex.superTag set) does NOT start the rest timer, but still offers gym mode', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), GLOBALS, [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'DB Curl', sets:'3x10-12', superTag:'Superset with next'});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-weight'), '25');
  await flush();
  setValueAndChange(row.querySelector('.ex-reps'), '10');
  await flush();
  assert.strictEqual(win.__restCalls, 0, 'a finished set on a superset\'s top half must NOT start a rest timer — the connector itself says there is no rest between these two');
  assert.strictEqual(win.__gymCalls, 1, 'the gym-mode offer is a separate, unrelated consequence of the same isRealSet signal and must still fire normally');
  // JSON round-trip: win.restTargetBySlot is a plain object built inside the
  // jsdom realm, whose prototype differs from the host Node process's
  // Object.prototype even when structurally identical — assert.deepStrictEqual
  // treats those as unequal (the same cross-realm gotcha testHelpers.js's own
  // runSandbox works around, documented in its own comment there).
  assert.deepStrictEqual(JSON.parse(JSON.stringify(win.restTargetBySlot)), {}, 'no rest target should be recorded for a slot with no real rest target');
});

test('regression guard: a plain exercise with no superTag at all still starts the rest timer exactly as before', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml(), GLOBALS, [checkFnSrc, wireSetsBlockSrc, `
    wireSetsBlock(document.getElementById('row'), 0, {name:'Lateral Raise', sets:'3x12-15'});
  `]);
  const row = document.getElementById('row');
  setValueAndChange(row.querySelector('.ex-weight'), '15');
  await flush();
  setValueAndChange(row.querySelector('.ex-reps'), '12');
  await flush();
  assert.strictEqual(win.__restCalls, 1, 'an exercise with no superTag — including the BOTTOM half of a pair, which carries no superTag of its own — must still get the normal rest timer');
  assert.strictEqual(win.__gymCalls, 1);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(win.restTargetBySlot)), {'ex:test:d1:0': 90}, 'the rest target must still be recorded for a real rest-timer slot');
});

run();
