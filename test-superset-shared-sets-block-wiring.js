'use strict';
// Behavioral coverage for the two remaining new behaviors of a woven
// superset pair's shared .sets-block (see renderWorkout's
// assembleSupersetPair, and test-superset-field-chaining.js for the row-
// interleaving and checkbox-independence coverage): wireSetsBlock is called
// TWICE against the SAME physical container, once per exercise, each call
// scoped to its own rows via the data-ex-idx attribute added to every
// .set-row this session.
//
//   1. "+ Add a round": there is only ONE add-set button in a pair's shared
//      block. Each of the two wireSetsBlock calls attaches its OWN click
//      listener to that same button, so one tap runs both and adds a row to
//      EACH exercise — deliberately not a separate code path, just what
//      falls out of calling the existing per-exercise wiring twice.
//   2. Deleting a row from ONE exercise must renumber only THAT exercise's
//      remaining rows (renumberRows is scoped by data-ex-idx — see
//      wireSetsBlock) — the other exercise's rows, and their setIdx, must
//      be completely untouched.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-superset-shared-sets-block-wiring.js');

const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');

// Mirrors the real shared-block shape assembleSupersetPair builds: one
// .sets-block, rows from BOTH exercises tagged with their own data-ex-idx,
// ONE add-set-btn.
const bodyHtml = `
  <div id="pairRow" class="exercise-block superset-pair">
    <div class="sets-block">
      <div class="set-actions" data-ex-idx="0"></div>
      <div class="set-row" data-set-idx="0" data-ex-idx="0">
        <span class="set-num">1</span>
        <input class="ex-input ex-weight" value="185">
        <input class="ex-input ex-reps" value="8">
        <input class="ex-input ex-rpe" value="8">
      </div>
      <div class="set-actions" data-ex-idx="1"></div>
      <div class="set-row" data-set-idx="0" data-ex-idx="1">
        <span class="set-num">1</span>
        <input class="ex-input ex-weight" value="30">
        <input class="ex-input ex-reps" value="12">
        <input class="ex-input ex-rpe" value="7">
      </div>
      <button class="add-set-btn">+ Add a round</button>
    </div>
  </div>
`;

function globalsFor(){
  return `
    window.exKey = (program, day, idx)=> 'ex:test:d1:' + idx;
    window.activeProgram = 'strength';
    window.activeDay = 'd1';
    window.selectedLogDate = '2026-01-01';
    window.subVariantOf = ()=> undefined;
    window.isDistanceExercise = ()=> false;
    window.isBarbellExercise = ()=> false;
    window.escapeHtml = (s)=> String(s);
    window.__saved = {};
    window.saveExSet = async (day, exIdx, setIdx, weight, reps, rpe)=>{
      window.__saved[exIdx] = window.__saved[exIdx] || [];
      window.__saved[exIdx][setIdx] = {weight, reps, rpe};
      return {isPR:false};
    };
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
    window.exerciseInfo = {'DB Curl': {category:'pull'}, 'Triceps Pushdown': {category:'push'}};
    window.buildPastSessions = ()=> [];
    window.getExLog = async ()=> [];
    // Captures the real onDelete callback deleteSet passes in, instead of
    // discarding it — a real swipe gesture (already covered on its own by
    // test-swipe-content-button-passthrough.js) is what would normally
    // invoke it; this lets the test trigger the REAL deleteSet directly.
    window.__deleters = [];
    window.makeSwipeable = (el, onDelete)=>{ window.__deleters.push({el, onDelete}); };
    window.isBackdating = ()=> false;
    window.getSetFieldUnit = ()=> 'reps';
    window.showUndoToast = (msg, undoFn)=>{ window.__undoFn = undoFn; };
    window.storage = {
      get: async (k)=>{ if(!(k in window.__store)) throw new Error('not found'); return {key:k, value: window.__store[k]}; },
      set: async (k,v)=>{ window.__store[k] = v; return {key:k, value:v}; },
    };
    window.__store = {};
  `;
}

function build(){
  return runJsdom(bodyHtml, globalsFor(), [checkFnSrc, wireSetsBlockSrc, `
    const pairRow = document.getElementById('pairRow');
    wireSetsBlock(pairRow, 0, {name:'DB Curl', sets:'3x8'});
    wireSetsBlock(pairRow, 1, {name:'Triceps Pushdown', sets:'3x12'});
  `]);
}

test('REAL invocation: tapping the one shared add-set button adds a row to BOTH exercises — "a round", not a single exercise\'s set', (assert)=>{
  const { document } = build();
  const pairRow = document.getElementById('pairRow');
  document.querySelector('.add-set-btn').click();
  const topRows = pairRow.querySelectorAll('.set-row[data-ex-idx="0"]');
  const bottomRows = pairRow.querySelectorAll('.set-row[data-ex-idx="1"]');
  assert.strictEqual(topRows.length, 2, 'the top exercise must gain its own new row');
  assert.strictEqual(bottomRows.length, 2, 'the bottom exercise must ALSO gain its own new row, from the same single tap');
  assert.strictEqual(topRows[1].dataset.setIdx, '1', 'the new top row is indexed against the TOP exercise\'s own existing count (1 prior row), not the combined total across both exercises');
  assert.strictEqual(bottomRows[1].dataset.setIdx, '1', 'same for the new bottom row, independently');
});

test('REAL invocation: deleting a row from ONE exercise only renumbers THAT exercise\'s own remaining rows — the other exercise\'s rows are untouched', async (assert)=>{
  const { document, window: win } = build();
  const pairRow = document.getElementById('pairRow');
  // Add a second round first so the top exercise has something left to renumber.
  document.querySelector('.add-set-btn').click();
  const topRowsBefore = [...pairRow.querySelectorAll('.set-row[data-ex-idx="0"]')];
  const bottomRowsBefore = [...pairRow.querySelectorAll('.set-row[data-ex-idx="1"]')];
  assert.strictEqual(topRowsBefore.length, 2);
  assert.strictEqual(bottomRowsBefore.length, 2);

  // Trigger the REAL deleteSet for the first top row via the callback
  // makeSwipeable was stubbed to capture (a real swipe gesture, the thing
  // that would normally invoke it, is already covered on its own by
  // test-swipe-content-button-passthrough.js).
  const deleter = win.__deleters.find(d=> d.el === topRowsBefore[0]);
  assert.ok(deleter, 'sanity: the first top row must actually be wired to a real deleteSet callback');
  await deleter.onDelete();

  assert.strictEqual(pairRow.querySelectorAll('.set-row[data-ex-idx="0"]').length, 1, 'sanity: the top row was actually removed');
  assert.strictEqual(pairRow.querySelectorAll('.set-row[data-ex-idx="1"]').length, 2, 'the bottom exercise\'s rows must be completely unaffected by deleting a top row');
  const topRowsAfter = [...pairRow.querySelectorAll('.set-row[data-ex-idx="0"]')];
  assert.deepStrictEqual(topRowsAfter.map(r=> r.dataset.setIdx), ['0'], 'the top exercise\'s own remaining row must be renumbered down to index 0');
  const bottomRowsAfter = [...pairRow.querySelectorAll('.set-row[data-ex-idx="1"]')];
  assert.deepStrictEqual(bottomRowsAfter.map(r=> r.dataset.setIdx), ['0','1'], 'the bottom exercise\'s own setIdx sequence must be untouched — no renumbering leaked across exercises');
});

test('sabotage-relevant: renumberRows (inside wireSetsBlock) is scoped by data-ex-idx, not a bare .set-row query', (assert)=>{
  assert.match(wireSetsBlockSrc, /function renumberRows\(\)\{\s*\[\.\.\.block\.querySelectorAll\(`\.set-row\[data-ex-idx="\$\{exIdx\}"\]`\)\]/,
    'renumberRows must only ever touch rows carrying THIS wireSetsBlock call\'s own exIdx');
});

run();
