'use strict';
// Behavioral coverage for the superset UX, in two generations:
//
//   1. (Earlier session) advanceSetField/supersetFieldSequence made the
//      Enter/"Next" key WALK the fields in interleaved order (top set 1,
//      bottom set 1, top set 2, ...) while the two exercises still rendered
//      as two separate cards joined by a connector strip.
//   2. (This session, requested directly: "let's weave them together since
//      it's a superset") the two exercises now render as ONE shared,
//      already-woven .sets-block (renderWorkout's assembleSupersetPair) —
//      the interleaved order lives in the DOM itself, not in a dedicated
//      navigation function. supersetFieldSequence and supersetPartnerBlock
//      are gone; advanceSetField's plain "walk this block's own fields in
//      DOM order" path (already tested end-to-end in
//      test-set-next-button.js) is now correct for a pair too, with zero
//      superset-specific code of its own.
//
// This file tests what's actually new in generation 2: that
// assembleSupersetPair really interleaves the two exercises' rows (not
// concatenates one after the other), and that wireExerciseMember treats a
// pair's two checkboxes independently — checking off one exercise must not
// collapse the shared block or read as the whole pair being done.
//
// assembleSupersetPair/wireExerciseMember are nested inside renderWorkout
// (not top-level), so extractFunction can't reach them by name — extracted
// here by anchor + brace-balanced scan instead, the same treatment this
// suite already gives other non-top-level declarations it needs to test in
// isolation (see extractIIFE in testHelpers.js for the same idea applied to
// named IIFEs).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-superset-field-chaining.js');

function extractNestedFunction(source, signature){
  const start = source.indexOf(signature);
  if(start === -1) throw new Error(`extractNestedFunction: signature not found: ${signature}`);
  const braceOpen = source.indexOf('{', start);
  let depth = 0, i = braceOpen;
  for(; i < source.length; i++){
    if(source[i] === '{') depth++;
    else if(source[i] === '}'){
      depth--;
      if(depth === 0) break;
    }
  }
  if(depth !== 0) throw new Error(`extractNestedFunction: unbalanced braces for ${signature}`);
  return source.slice(start, i + 1);
}

const setExerciseBlockOpenSrc = extractFunction(src, 'setExerciseBlockOpen');
const allMemberCheckboxesCheckedSrc = extractFunction(src, 'allMemberCheckboxesChecked');
const nextExerciseBlockSrc = extractFunction(src, 'nextExerciseBlock');
const assembleSupersetPairSrc = extractNestedFunction(src, 'function assembleSupersetPair(topPiece, bottomPiece){');
const wireExerciseMemberSrc = extractNestedFunction(src, 'function wireExerciseMember(memberEl, blockEl, exIdx, piece){');

test('sabotage-relevant: the real assembleSupersetPair source actually interleaves the two rowHtmlArr arrays, not just concatenates topPiece\'s rows then bottomPiece\'s', (assert)=>{
  assert.match(assembleSupersetPairSrc, /for\(let s=0; s<maxSets; s\+\+\)/, 'must build the combined row list set-by-set, not exercise-by-exercise');
  const loopStart = assembleSupersetPairSrc.indexOf('for(let s=0; s<maxSets; s++)');
  const loopBody = assembleSupersetPairSrc.slice(loopStart, assembleSupersetPairSrc.indexOf('}', loopStart) + 1);
  assert.match(loopBody, /topPiece\.setRowHtmlArr\[s\]/, 'each iteration must pull the TOP exercise\'s row at that set index');
  assert.match(loopBody, /bottomPiece\.setRowHtmlArr\[s\]/, 'each iteration must pull the BOTTOM exercise\'s row at that same set index, right after the top\'s');
  const topIdx = loopBody.indexOf('topPiece.setRowHtmlArr[s]');
  const bottomIdx = loopBody.indexOf('bottomPiece.setRowHtmlArr[s]');
  assert.ok(topIdx !== -1 && bottomIdx !== -1 && topIdx < bottomIdx, 'the top exercise\'s row for a given set must be appended before the bottom\'s — top\'s set N straight into bottom\'s set N, not the reverse');
});

function fakePiece(i, name, setLabels){
  return {
    i, ex: {name},
    headerInnerHtml: `<input type="checkbox" data-idx="${i}"><div class="ex-name-wrap"><div class="ex-name">${name}</div></div>`,
    sameAsLastHtml: '', cautionHtml: '', warmupHtml: '',
    setRowHtmlArr: setLabels.map(label=> `<div class="set-row" data-ex-idx="${i}">${label}</div>`),
    summaryHtml: '', badge: '', detailsHtml: '',
    hasSubs: false, hitRegionsForRow: [],
    fallbackEntry: null,
  };
}

function buildPair(topSetLabels, bottomSetLabels){
  return runJsdom('<div id="list"></div>', `
    window.list = document.getElementById('list');
    window.activeDay = 'd1';
    // Isolates the markup-weaving behavior under test from the separate
    // question of whether each exercise's OWN fields save correctly —
    // that's wireSetsBlock's job, already covered by its own data-ex-idx
    // scoping tests (test-auto-check-sets.js and friends).
    window.wireSetsBlock = ()=>{};
    window.wireExerciseMember = ()=>{};
  `, [
    assembleSupersetPairSrc,
    `
      const topPiece = ${JSON.stringify(fakePiece(0, 'DB Curl', topSetLabels))};
      const bottomPiece = ${JSON.stringify(fakePiece(1, 'Triceps Pushdown', bottomSetLabels))};
      topPiece.setRowHtmlArr = ${JSON.stringify(fakePiece(0, 'DB Curl', topSetLabels).setRowHtmlArr)};
      bottomPiece.setRowHtmlArr = ${JSON.stringify(fakePiece(1, 'Triceps Pushdown', bottomSetLabels).setRowHtmlArr)};
      assembleSupersetPair(topPiece, bottomPiece);
    `,
  ]);
}

test('REAL invocation: equal set counts weave top1,bottom1,top2,bottom2,top3,bottom3 — not every row of the top exercise before any of the bottom\'s', (assert)=>{
  const { document } = buildPair(['top-set-1','top-set-2','top-set-3'], ['bot-set-1','bot-set-2','bot-set-3']);
  const rows = [...document.querySelectorAll('.sets-block .set-row')];
  const order = rows.map(r=> r.textContent);
  assert.deepStrictEqual(order, ['top-set-1','bot-set-1','top-set-2','bot-set-2','top-set-3','bot-set-3'],
    'the real interleaved order requested directly by the user: straight from one exercise\'s set into the paired exercise\'s set, before either one\'s next set');
});

test('REAL invocation: a shorter bottom exercise drops out of the sequence past its own last row — no placeholder, the top exercise just continues alone', (assert)=>{
  const { document } = buildPair(['top-1','top-2','top-3'], ['bot-1']);
  const rows = [...document.querySelectorAll('.sets-block .set-row')];
  const order = rows.map(r=> r.textContent);
  assert.deepStrictEqual(order, ['top-1','bot-1','top-2','top-3'],
    'once the shorter exercise runs out, the longer one\'s remaining sets just follow in order, nothing invented for the missing side');
});

test('REAL invocation: a shorter TOP exercise (fewer sets than its partner) behaves symmetrically', (assert)=>{
  const { document } = buildPair(['top-1'], ['bot-1','bot-2','bot-3']);
  const rows = [...document.querySelectorAll('.sets-block .set-row')];
  const order = rows.map(r=> r.textContent);
  assert.deepStrictEqual(order, ['top-1','bot-1','bot-2','bot-3'], 'symmetric to the shorter-bottom case — the shorter side (top, here) drops out first, the longer one continues');
});

test('REAL invocation: exactly ONE shared .sets-block is created for the pair, not two — the two exercises\' rows genuinely live together, not in two containers styled to look adjacent', (assert)=>{
  const { document } = buildPair(['a'], ['b']);
  assert.strictEqual(document.querySelectorAll('.sets-block').length, 1, 'must be a single shared container');
  assert.strictEqual(document.querySelectorAll('.exercise-block').length, 1, 'must be a single physical exercise-block for the whole pair, not two linked ones');
});

// ── wireExerciseMember: a pair's two checkboxes are independent ────────────

function buildWiredPair(){
  const bodyHtml = `
    <div id="pairRow" class="exercise-block superset-pair open">
      <div class="superset-member" data-ex-idx="0">
        <div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">DB Curl</div></div>
      </div>
      <div class="superset-member" data-ex-idx="1">
        <div class="exercise"><input type="checkbox" data-idx="1"><div class="ex-name">Triceps Pushdown</div></div>
      </div>
      <div class="expand-wrap open"></div>
    </div>
  `;
  const globals = `
    window.completed = {};
    window.renderExercises = [{name:'DB Curl'}, {name:'Triceps Pushdown'}];
    window.selectedLogDate = '2026-01-01';
    window.activeProgram = 'strength';
    window.activeDay = 'd1';
    window.weekProgress = {};
    window.storage = { set: async ()=>{} };
    window.isInCurrentCalendarWeek = ()=> false;
    window.updateSessionCalorieTotal = ()=>{};
    window.saveWeekProgress = ()=>{};
    window.renderTabs = ()=>{};
    window.refreshGymDock = ()=>{};
    window.gymModeActive = false;
    window.triggerCelebration = ()=>{};
    window.maybeShowTodayStandout = ()=>{};
    window.finishGymWorkout = ()=>{};
    window.day = {label:'Day 1', sub:'Upper'};
    window.getCustomExercises = async ()=> [];
    window.saveCustomExercises = async ()=>{};
    window.getApiKey = async ()=> null;
    window.aiKeySetupPrompt = ()=> '';
    window.getInjuryLog = async ()=> [];
    window.getCoachPersona = ()=> '';
    window.exerciseInfo = {};
    window.suggestSubstitute = ()=> null;
    window.callClaudeChat = async ()=> '';
    window.escapeHtml = (s)=> String(s);
    window.openExerciseSubModal = ()=>{};
    window.openExerciseEditor = ()=>{};
    window.openExerciseHistory = ()=>{};
    window.workoutKey = ()=> 'workout:test';
    window.weekCheckedKey = ()=> 'week:test';
  `;
  const { document, window: win } = runJsdom(bodyHtml, globals, [
    setExerciseBlockOpenSrc, allMemberCheckboxesCheckedSrc, nextExerciseBlockSrc, wireExerciseMemberSrc,
    `
      const pairRow = document.getElementById('pairRow');
      const topMember = pairRow.querySelector('.superset-member[data-ex-idx="0"]');
      const bottomMember = pairRow.querySelector('.superset-member[data-ex-idx="1"]');
      const topPiece = {ex:{name:'DB Curl'}, hasSubs:false, hitRegionsForRow:[]};
      const bottomPiece = {ex:{name:'Triceps Pushdown'}, hasSubs:false, hitRegionsForRow:[]};
      wireExerciseMember(topMember, pairRow, 0, topPiece);
      wireExerciseMember(bottomMember, pairRow, 1, bottomPiece);
    `,
  ]);
  return { document, win };
}

function flush(win){
  return new Promise(resolve=> win.setTimeout(resolve, 0));
}

test('REAL invocation: checking off just ONE exercise in a superset pair does NOT collapse the shared block — the other exercise still needs logging', async (assert)=>{
  const { document, win } = buildWiredPair();
  const pairRow = document.getElementById('pairRow');
  const topCb = pairRow.querySelector('input[data-idx="0"]');
  topCb.checked = true;
  topCb.dispatchEvent(new document.defaultView.Event('change', {bubbles:true}));
  await flush(win);
  assert.strictEqual(pairRow.classList.contains('open'), true, 'the pair must stay open — only the top exercise is actually done');
});

test('REAL invocation: checking off BOTH exercises in a superset pair DOES collapse the shared block, exactly like finishing a lone exercise', async (assert)=>{
  const { document, win } = buildWiredPair();
  const pairRow = document.getElementById('pairRow');
  const topCb = pairRow.querySelector('input[data-idx="0"]');
  const bottomCb = pairRow.querySelector('input[data-idx="1"]');
  topCb.checked = true;
  topCb.dispatchEvent(new document.defaultView.Event('change', {bubbles:true}));
  await flush(win);
  bottomCb.checked = true;
  bottomCb.dispatchEvent(new document.defaultView.Event('change', {bubbles:true}));
  await flush(win);
  assert.strictEqual(pairRow.classList.contains('open'), false, 'once both halves are checked, the whole pair collapses — the same "finished, no reason to keep looking at it" rule a lone exercise already gets');
});

test('REAL invocation: tapping EITHER member\'s own header opens/closes the SAME shared block', (assert)=>{
  const { document } = buildWiredPair();
  const pairRow = document.getElementById('pairRow');
  pairRow.classList.remove('open');
  pairRow.querySelector('.expand-wrap').classList.remove('open');
  const bottomHeader = pairRow.querySelector('.superset-member[data-ex-idx="1"] .exercise');
  bottomHeader.dispatchEvent(new document.defaultView.Event('click', {bubbles:true}));
  assert.strictEqual(pairRow.classList.contains('open'), true, 'clicking the BOTTOM exercise\'s own header must open the whole shared pair, not just its own half (there is no "just its own half" anymore)');
  const topHeader = pairRow.querySelector('.superset-member[data-ex-idx="0"] .exercise');
  topHeader.dispatchEvent(new document.defaultView.Event('click', {bubbles:true}));
  assert.strictEqual(pairRow.classList.contains('open'), false, 'and the TOP header\'s click closes that same shared pair back up');
});

run();
