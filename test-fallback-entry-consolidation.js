'use strict';
// Behavioral coverage for Phase F5: the "Same as Last Time" click handler
// now reuses the exact fallback-prior-entry value renderWorkout already
// computed for this slot (threaded through wireSetsBlock as a 4th
// parameter) instead of independently re-deriving it via a second
// getFallbackPriorEntry call. Previously the two were kept in sync only by
// convention (both calling the same function with the same arguments).
//
// The strongest proof this actually changed: stub getFallbackPriorEntry to
// return a DELIBERATELY WRONG value, and pass a DIFFERENT, correct value as
// the fallbackEntry parameter. If the click handler still used the
// parameter (not the function), the saved set reflects the parameter's
// weight, not the stub's — proof by contradiction that the code path
// genuinely changed, not just that a call site happens to be absent from
// the text.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const checkFnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');
const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');

const bodyHtml = `
  <div id="row">
    <input type="checkbox">
    <div class="sets-block">
      <div class="set-actions" data-ex-idx="0">
        <button class="same-as-last-btn">Same as Last Time</button>
      </div>
      <div class="set-row" data-set-idx="0" data-ex-idx="0">
        <span class="set-num">1</span>
        <input class="ex-weight" value="">
        <input class="ex-reps" value="">
        <input class="ex-rpe" value="">
      </div>
      <button class="add-set-btn">Add Set</button>
    </div>
  </div>
`;

function globals(recordedSaves, fallbackFnReturnsWeight){
  return `
    window.exKey = ()=> 'ex:test:d1:0';
    window.activeProgram = 'strength';
    window.activeDay = 'd1';
    window.selectedLogDate = '2026-01-01';
    window.subVariantOf = ()=> undefined;
    window.isDistanceExercise = ()=> false;
    window.isBarbellExercise = ()=> false;
    window.escapeHtml = (s)=> String(s);
    window.saveExSet = async (dayId, idx, setIdx, weight, reps, rpe)=>{
      window.__saves.push({weight, reps, rpe});
      return {isPR:false};
    };
    window.__saves = [];
    // Deliberately WRONG value — if this ever gets called and its result
    // used, the test's assertion on the saved weight will fail, proving the
    // click handler stopped relying on the parameter.
    window.getFallbackPriorEntry = async ()=> ({sets:[{weight:${fallbackFnReturnsWeight}, reps:1, rpe:1}]});
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
    window.storage = { get: async ()=> null }; // no own-slot history -> forces the fallback path
  `;
}

const { test, run } = makeRunner('test-fallback-entry-consolidation.js');

test('REAL invocation: Same as Last Time uses the passed fallbackEntry parameter, not a fresh getFallbackPriorEntry call', async (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml, globals([], 999), [checkFnSrc, wireSetsBlockSrc, `
    // 225 (the parameter) vs 999 (what the stub function would return) —
    // deliberately different so the result proves which one was used.
    wireSetsBlock(document.getElementById('row'), 0, {name:'Bench Press', sets:'4x4-6'}, {sets:[{weight:225, reps:5, rpe:8}]});
    document.querySelector('.same-as-last-btn').click();
  `]);
  await new Promise(res => setTimeout(res, 50));
  const saves = JSON.parse(JSON.stringify(win.__saves));
  assert.strictEqual(saves.length, 1, `expected exactly 1 save, got ${JSON.stringify(saves)}`);
  assert.strictEqual(saves[0].weight, 225, 'must use the passed fallbackEntry (225), not getFallbackPriorEntry\'s stubbed return value (999)');
});

test('structural: wireSetsBlock no longer CALLS getFallbackPriorEntry anywhere in its own body', (assert)=>{
  // Checking for the bare identifier is not enough — this function's own
  // explanatory comment mentions "getFallbackPriorEntry call" in prose,
  // which would defeat a naive text-absence check (confirmed: this
  // assertion failed against the real file on the first run, exactly the
  // "comment quotes a call literal" failure mode this project's own
  // testing discipline warns about). Checking for an actual call
  // expression instead.
  assert.ok(!/getFallbackPriorEntry\s*\(/.test(wireSetsBlockSrc), 'wireSetsBlock must not CALL getFallbackPriorEntry anymore, even though it may still be mentioned in a comment');
});

test('the real call site (renderWorkout) threads the precomputed fallbackPriorEntries[i] through to wireSetsBlock', (assert)=>{
  const renderWorkoutSrc = extractFunction(src, 'renderWorkout');
  // Indirected through the per-exercise "piece" object the assembly pass
  // builds from (see assembleSingleExercise/assembleSupersetPair) rather
  // than passed as a literal `fallbackPriorEntries[i]` at the call site
  // itself — the piece is WHERE fallbackPriorEntries[i] actually gets
  // captured, once per exercise, so this checks that capture plus both real
  // wireSetsBlock call sites reading it back off the piece.
  assert.match(renderWorkoutSrc, /fallbackEntry:\s*fallbackPriorEntries\[i\]/, 'each exercise\'s piece must capture its own fallbackPriorEntries[i]');
  assert.ok(renderWorkoutSrc.includes('wireSetsBlock(row, i, ex, piece.fallbackEntry)'), 'the lone-exercise assembly path must thread piece.fallbackEntry through to wireSetsBlock');
  assert.ok(renderWorkoutSrc.includes('wireSetsBlock(pairRow, t, topPiece.ex, topPiece.fallbackEntry)'), 'the superset-pair assembly path must thread the TOP exercise\'s own fallbackEntry through');
  assert.ok(renderWorkoutSrc.includes('wireSetsBlock(pairRow, b, bottomPiece.ex, bottomPiece.fallbackEntry)'), 'the superset-pair assembly path must thread the BOTTOM exercise\'s own fallbackEntry through, not accidentally reuse the top\'s');
});

run();
