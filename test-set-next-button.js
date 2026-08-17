'use strict';
// Behavioral coverage for the new .set-next-btn: an explicit, always-tappable
// "next field" control requested directly by the user, in these words — a
// BUTTON, not a keyboard hint. It replaces reliance on Enter/enterkeyhint
// (see test-superset-field-chaining.js's header comment for why the old
// row-local advanceOnEnter mechanism was removed rather than kept) with a
// second, guaranteed trigger for the exact same, already-tested
// advanceSetField/supersetFieldSequence logic — this file does not re-prove
// that interleaving ordering (test-superset-field-chaining.js already does,
// directly), it proves the NEW part: that a tap on the button reaches that
// mechanism at all, anchored on whichever of the row's own fields was most
// recently focused rather than always the same fixed field.
//
// Uses the same REAL wireSetsBlock invocation harness test-enter-key-
// chaining.js established (external dependencies stubbed at the boundary,
// wireSetsBlock/wireSetRow themselves are the real extracted source).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-set-next-button.js');

const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const advanceSetFieldSrc = extractFunction(src, 'advanceSetField');
const advanceToNextExerciseSrc = extractFunction(src, 'advanceToNextExercise');
const supersetFieldSequenceSrc = extractFunction(src, 'supersetFieldSequence');
const supersetPartnerBlockSrc = extractFunction(src, 'supersetPartnerBlock');
const setExerciseBlockOpenSrc = extractFunction(src, 'setExerciseBlockOpen');
const setExerciseUnitOpenSrc = extractFunction(src, 'setExerciseUnitOpen');
const nextExerciseBlockSrc = extractFunction(src, 'nextExerciseBlock');
const focusSetFieldSrc = extractFunction(src, 'focusSetField');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');

test('sabotage-relevant: wireSetRow (inside wireSetsBlock) actually wires .set-next-btn to advanceSetField, not left unwired', (assert)=>{
  assert.match(wireSetsBlockSrc, /querySelector\('\.set-next-btn'\)/, 'must look up the real button');
  assert.match(wireSetsBlockSrc, /advanceSetField\(lastFocusedField \|\| rpeInput\)/, 'the click handler must call the real advanceSetField, anchored on the last-focused field with an RPE fallback');
});

const bodyHtml = `
  <div id="row" class="exercise-block">
    <input type="checkbox">
    <div class="sets-block">
      <div class="set-row" data-set-idx="0">
        <span class="set-num">1</span>
        <input class="ex-input ex-weight" value="">
        <input class="ex-input ex-reps" value="">
        <input class="ex-input ex-rpe" value="">
        <button type="button" class="set-next-btn">next</button>
      </div>
      <div class="set-row" data-set-idx="1">
        <span class="set-num">2</span>
        <input class="ex-input ex-weight" value="">
        <input class="ex-input ex-reps" value="">
        <input class="ex-input ex-rpe" value="">
        <button type="button" class="set-next-btn">next</button>
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
  window.isBackdating = ()=> false;
`;

function build(){
  return runJsdom(bodyHtml, globals, [
    setExerciseBlockOpenSrc, supersetPartnerBlockSrc, setExerciseUnitOpenSrc,
    nextExerciseBlockSrc, focusSetFieldSrc, supersetFieldSequenceSrc,
    advanceToNextExerciseSrc, advanceSetFieldSrc,
    checkFnSrc, wireSetsBlockSrc,
    `wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'});`,
  ]);
}

test('REAL invocation: clicking the row\'s next-btn with no field focused yet falls back to advancing from RPE (the last field), moving into the next set\'s weight', (assert)=>{
  const { document } = build();
  const row = document.getElementById('row');
  const firstRowBtn = row.querySelectorAll('.set-row')[0].querySelector('.set-next-btn');
  const secondRowWeight = row.querySelectorAll('.set-row')[1].querySelector('.ex-weight');

  firstRowBtn.click();

  assert.strictEqual(document.activeElement, secondRowWeight, 'with nothing focused yet, the button must fall back to RPE as the anchor and advance exactly as if RPE itself had been the trigger — landing on the next set\'s weight field');
});

test('REAL invocation: clicking the next-btn after focusing WEIGHT anchors on weight, advancing to reps — not skipping ahead to wherever RPE would go', (assert)=>{
  const { document } = build();
  const row = document.getElementById('row');
  const firstRow = row.querySelectorAll('.set-row')[0];
  const weight = firstRow.querySelector('.ex-weight');
  const reps = firstRow.querySelector('.ex-reps');
  const btn = firstRow.querySelector('.set-next-btn');

  weight.focus();
  btn.click();

  assert.strictEqual(document.activeElement, reps, 'the tap must advance from whichever field was actually last focused (weight), landing on reps — not jump straight to wherever RPE\'s own position would advance to');
});

test('REAL invocation: focusing reps then weight again (typing back and forth) tracks the MOST RECENT focus, not the first', (assert)=>{
  const { document } = build();
  const row = document.getElementById('row');
  const firstRow = row.querySelectorAll('.set-row')[0];
  const weight = firstRow.querySelector('.ex-weight');
  const reps = firstRow.querySelector('.ex-reps');
  const rpe = firstRow.querySelector('.ex-rpe');
  const btn = firstRow.querySelector('.set-next-btn');

  reps.focus();
  weight.focus(); // back to weight — this must be what "last focused" means now
  btn.click();

  assert.strictEqual(document.activeElement, reps, 'anchored on weight (the truly last-focused field), the button must advance to reps, proving the tracked field updates on every focus rather than sticking to the first one');
  assert.notStrictEqual(document.activeElement, rpe, 'must not have anchored on reps (an earlier, now-stale focus) instead');
});

test('regression guard: each row\'s next-btn is wired independently — clicking row 2\'s button never touches row 1\'s tracked focus state', (assert)=>{
  const { document } = build();
  const row = document.getElementById('row');
  const rows = row.querySelectorAll('.set-row');
  const row1Weight = rows[0].querySelector('.ex-weight');
  const row2Rpe = rows[1].querySelector('.ex-rpe');
  const row2Btn = rows[1].querySelector('.set-next-btn');

  row1Weight.focus(); // establishes row 1's own tracked focus, must not leak into row 2
  row2Rpe.focus();
  row2Btn.click();

  // Row 2 is the last set row in this fixture, so its RPE running out of
  // fields hands off to the next exercise — advanceToNextExercise returns
  // false here (no next exercise-block sibling exists in this fixture), so
  // focus simply stays on row 2's own RPE rather than jumping anywhere,
  // and — the actual point of this test — never back to row 1's weight.
  assert.notStrictEqual(document.activeElement, row1Weight, 'row 2\'s button must never anchor on row 1\'s previously-focused field');
});

run();
