'use strict';
// Behavioral coverage for four findings from a dedicated Gym Mode audit:
//
// 1. .sticky-day-header's own "hidden" resting position only reads as hidden
//    because .nav-pills normally masks it — Gym Mode hides .nav-pills but
//    never hid the header itself, so it stayed on screen for the whole
//    gym-mode session regardless of scroll position.
// 2. Gym Mode's own documented rule ("exactly one exercise open at a time")
//    was never enforced on entry — normal use lets any number of exercises
//    sit expanded, and openFirstIncompleteExercise()'s old guard
//    ("something is already open, do nothing") preserved a broken
//    two-open state instead of fixing it.
// 3. .plate-result/.voice-feedback/.set-note-input kept the normal-mode flat
//    --surface2 fill in gym mode, unlike every other panel (.set-row-content,
//    .warmup-box), which already use the dark well gradient.
// 4. The exercise-complete checkbox was 30x30px in gym mode, well under
//    every other control deliberately sized up for the mode's sweaty-hands/
//    glance-and-tap use case (48-56px+).
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-gym-mode-audit-fixes.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

// --- Finding 1: .sticky-day-header is in the gym-mode hide-list ------------

test('sabotage-relevant: .sticky-day-header is hidden in Gym Mode, in the same rule block as .nav-pills (the element that used to mask it)', (assert)=>{
  const hideListRe = /body\.gym-mode header,[\s\S]*?display:none !important;\s*\}/;
  const m = hideListRe.exec(src);
  assert.ok(m, 'the gym-mode hide-list block must exist');
  assert.match(m[0], /body\.gym-mode \.sticky-day-header/, '.sticky-day-header must be in the hide list — without it, it has nothing left to mask it once .nav-pills is hidden');
});

// --- Finding 2: openFirstIncompleteExercise consolidates to one open -------

const setExerciseBlockOpenSrc = extractFunction(src, 'setExerciseBlockOpen');
const openFirstIncompleteSrc = extractFunction(src, 'openFirstIncompleteExercise');
// openFirstIncompleteExercise calls setExerciseBlockOpen directly (a
// superset pair is now ONE physical block — see
// test-superset-field-chaining.js's header comment — so there is no
// separate partner to open together anymore) and
// allMemberCheckboxesChecked (every checkbox in a block, not just the
// first, must be checked for it to count as done).
const allMemberCheckboxesCheckedSrc = extractFunction(src, 'allMemberCheckboxesChecked');

function exerciseBlockHtml(id, {open, checked}){
  return `
    <div class="exercise-block${open ? ' open' : ''}" id="${id}">
      <div class="exercise" aria-expanded="${open ? 'true' : 'false'}">
        <input type="checkbox" ${checked ? 'checked' : ''}>
      </div>
      <div class="expand-wrap${open ? ' open' : ''}"></div>
    </div>
  `;
}

function setup(blocksHtml){
  const { document } = runJsdom(`<div id="exerciseList">${blocksHtml}</div>`, '', [
    setExerciseBlockOpenSrc, allMemberCheckboxesCheckedSrc, openFirstIncompleteSrc,
  ]);
  return document;
}

test('REAL invocation: two exercises open at once (the broken state) gets consolidated down to exactly the first incomplete one', (assert)=>{
  const document = setup(
    exerciseBlockHtml('a', {open:false, checked:true}) +
    exerciseBlockHtml('b', {open:true, checked:false}) +
    exerciseBlockHtml('c', {open:true, checked:false})
  );
  document.defaultView.openFirstIncompleteExercise();
  const openIds = [...document.querySelectorAll('.exercise-block.open')].map(b=>b.id);
  assert.deepStrictEqual(openIds, ['b'], 'exactly one block must end up open — the first incomplete one — not both of the previously-open ones');
  assert.strictEqual(document.getElementById('b').querySelector('.exercise').getAttribute('aria-expanded'), 'true');
  assert.strictEqual(document.getElementById('c').querySelector('.exercise').getAttribute('aria-expanded'), 'false', 'the second previously-open block must actually close, not just lose the class silently');
});

test('regression guard: exactly one exercise already open is left alone, even if it is NOT the first incomplete one — that is where they were', (assert)=>{
  const document = setup(
    exerciseBlockHtml('a', {open:false, checked:false}) + // first incomplete — must NOT be opened
    exerciseBlockHtml('b', {open:true, checked:false})    // the one actually open — must stay open
  );
  document.defaultView.openFirstIncompleteExercise();
  const openIds = [...document.querySelectorAll('.exercise-block.open')].map(b=>b.id);
  assert.deepStrictEqual(openIds, ['b'], 'a single already-open block must not be moved to the first-incomplete one — this behavior must be unchanged by the fix');
});

test('regression guard: nothing open opens the first incomplete exercise, unchanged from before this fix', (assert)=>{
  const document = setup(
    exerciseBlockHtml('a', {open:false, checked:true}) +
    exerciseBlockHtml('b', {open:false, checked:false})
  );
  document.defaultView.openFirstIncompleteExercise();
  const openIds = [...document.querySelectorAll('.exercise-block.open')].map(b=>b.id);
  assert.deepStrictEqual(openIds, ['b']);
});

// --- Finding 3: dark-well reskin for plate/voice/note panels ---------------

test('sabotage-relevant: .plate-result, .voice-feedback, and .set-note-input all get a real dark gradient background in Gym Mode, not the normal-mode flat fill', (assert)=>{
  const plateBlock = extractRuleBlock(src, 'body.gym-mode .plate-result');
  const voiceBlock = extractRuleBlock(src, 'body.gym-mode .voice-feedback');
  const noteBlock = extractRuleBlock(src, 'body.gym-mode .set-note-input');
  assert.match(plateBlock, /linear-gradient\(170deg/, '.plate-result must get a real gradient, not var(--surface2)');
  assert.match(voiceBlock, /linear-gradient\(170deg/, '.voice-feedback must get a real gradient');
  assert.match(noteBlock, /linear-gradient\(170deg/, '.set-note-input must get a real gradient');
});

test('regression guard: .set-note-input keeps its existing gym-mode sizing (min-height/font-size) — this fix only touches color, not layout', (assert)=>{
  const noteBlock = extractRuleBlock(src, 'body.gym-mode .set-note-input');
  assert.match(noteBlock, /min-height:48px/, 'the pre-existing sizing bump must survive this change');
  assert.match(noteBlock, /font-size:15px/);
});

// --- Finding 4: bigger completion checkbox ----------------------------------

test('sabotage-relevant: the gym-mode exercise-complete checkbox is bigger than the original 30x30px', (assert)=>{
  const block = extractRuleBlock(src, 'body.gym-mode .exercise input[type=checkbox]');
  const wMatch = block.match(/width:(\d+)px/);
  const hMatch = block.match(/height:(\d+)px/);
  assert.ok(wMatch && hMatch, 'the rule must declare real width/height');
  assert.ok(Number(wMatch[1]) > 30, `width should be bigger than the original 30px, got ${wMatch[1]}px`);
  assert.ok(Number(hMatch[1]) > 30, `height should be bigger than the original 30px, got ${hMatch[1]}px`);
});

run();
