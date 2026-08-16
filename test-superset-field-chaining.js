'use strict';
// Behavioral coverage for the fix requested directly by the user: logging a
// superset used to mean manually tapping open/closed between two separate
// exercise-block accordion cards for every alternating set. Two things
// changed together to fix that:
//
//   1. setExerciseUnitOpen(block, isOpen) opens/closes a superset pair
//      TOGETHER as one open UNIT, wired into every place a block's open
//      state changes (header tap, checkbox-driven auto-advance, gym-mode
//      entry's openFirstIncompleteExercise, and advanceToNextExercise
//      below) — Gym Mode's own "exactly one exercise open at a time" rule
//      (audited and enforced in a prior session, test-gym-mode-audit-
//      fixes.js) still holds, it's just redefined to mean one open UNIT:
//      a lone exercise, or a linked pair, never a pair with only one half
//      open.
//   2. advanceSetField/supersetFieldSequence interleave the Enter/"Next"
//      key's field order across a pair: top's set 1 (weight, reps, RPE),
//      THEN bottom's set 1, then top's set 2, then bottom's set 2, and so
//      on — instead of every field of the top exercise followed by every
//      field of the bottom one. This is what the user asked for literally:
//      "1st exercise 1st set: weight<rep<RPE straight to 2nd exercise 1st
//      set: weight<rep<RPE, then 1st exercise 2nd set..."
//
// This file tests the document-level advanceSetField/advanceToNextExercise
// mechanism directly and in isolation from wireSetRow's OWN, separate,
// row-local advanceOnEnter (already covered by test-enter-key-chaining.js)
// — both really do fire on every Enter press in the real app (row-local
// first, since it's bound directly to the input; the document-level
// delegate second, as the event bubbles), but row-local only ever knows
// weight->reps->RPE->blur within its OWN row, with zero awareness of the
// next row or the next exercise. Every cross-row and cross-exercise
// decision — including all of the interleaving this file covers — comes
// from the mechanism tested here, which is what actually determines the
// final focus target since it runs second in the bubble sequence.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-superset-field-chaining.js');

const fnNames = [
  'setExerciseBlockOpen', 'supersetPartnerBlock', 'setExerciseUnitOpen',
  'nextExerciseBlock', 'advanceToNextExercise', 'supersetFieldSequence',
  'advanceSetField', 'focusSetField', 'openFirstIncompleteExercise',
];
const fnSrcs = fnNames.map(name => extractFunction(src, name));

// The real, top-level document Enter-key delegate — extracted by anchoring
// on its own distinctive leading comment rather than hand-copied, so a
// change to the real listener can't silently drift out of sync with what
// this file actually exercises.
function extractKeydownDelegate(source){
  const anchor = '// Delegated at the document, so it survives every renderWorkout without';
  const start = source.indexOf(anchor);
  if(start === -1) throw new Error('extractKeydownDelegate: anchor comment not found');
  const stmtStart = source.indexOf('document.addEventListener', start);
  const end = source.indexOf('});', stmtStart) + 3;
  return source.slice(stmtStart, end);
}
const keydownDelegateSrc = extractKeydownDelegate(src);

function setRowHtml(setIdx){
  return `
    <div class="set-row" data-set-idx="${setIdx}">
      <span class="set-num">${setIdx + 1}</span>
      <input type="number" class="ex-input ex-weight" aria-label="weight" value="">
      <input type="number" class="ex-input ex-reps" aria-label="reps" value="">
      <input type="number" class="ex-input ex-rpe" aria-label="RPE" value="">
    </div>
  `;
}

function exerciseBlockHtml(id, extraClass, setCount){
  const rows = Array.from({length: setCount}, (_, i) => setRowHtml(i)).join('');
  return `
    <div class="exercise-block${extraClass ? ' ' + extraClass : ''}" id="${id}">
      <div class="exercise" tabindex="0" aria-expanded="false">
        <input type="checkbox">
        <span class="ex-name">${id}</span>
      </div>
      <div class="expand-wrap">
        <div class="sets-block">${rows}</div>
      </div>
    </div>
  `;
}

const bodyHtml = `
  <div id="exerciseList">
    ${exerciseBlockHtml('exTop', 'superset-top', 2)}
    <div class="superset-connector">SUPERSET — straight into the next exercise, no rest between</div>
    ${exerciseBlockHtml('exBottom', 'superset-bottom', 2)}
    ${exerciseBlockHtml('exAfter', '', 1)}
  </div>
`;

function pressEnter(el){
  el.dispatchEvent(new el.ownerDocument.defaultView.KeyboardEvent('keydown', {key:'Enter', bubbles:true, cancelable:true}));
}

function build(){
  return runJsdom(bodyHtml, '', [...fnSrcs, keydownDelegateSrc]);
}

test('REAL invocation: supersetPartnerBlock resolves both directions of the real pair, and null for a plain exercise', (assert)=>{
  const { document, window: win } = build();
  const top = document.getElementById('exTop');
  const bottom = document.getElementById('exBottom');
  const after = document.getElementById('exAfter');
  assert.strictEqual(win.supersetPartnerBlock(top), bottom, 'top\'s partner must be the real bottom block');
  assert.strictEqual(win.supersetPartnerBlock(bottom), top, 'bottom\'s partner must be the real top block');
  assert.strictEqual(win.supersetPartnerBlock(after), null, 'a plain exercise-block must have no partner');
});

test('REAL invocation: setExerciseUnitOpen opens/closes BOTH halves of a pair together, and a plain exercise alone', (assert)=>{
  const { document, window: win } = build();
  const top = document.getElementById('exTop');
  const bottom = document.getElementById('exBottom');
  const after = document.getElementById('exAfter');

  win.setExerciseUnitOpen(top, true);
  assert.ok(top.classList.contains('open'), 'top must open');
  assert.ok(bottom.classList.contains('open'), 'bottom must open too, as one unit');

  win.setExerciseUnitOpen(top, false);
  assert.ok(!top.classList.contains('open'), 'top must close');
  assert.ok(!bottom.classList.contains('open'), 'bottom must close too, as one unit');

  win.setExerciseUnitOpen(after, true);
  assert.ok(after.classList.contains('open'), 'a plain exercise must still open on its own (no partner to drag along)');
  assert.ok(!top.classList.contains('open') && !bottom.classList.contains('open'), 'opening the unrelated plain exercise must not touch the pair');
});

test('REAL invocation: pressing Enter walks the FULL interleaved order across a superset pair — top set1, bottom set1, top set2, bottom set2 — not every field of one exercise before the other', (assert)=>{
  const { document } = build();
  const top = document.getElementById('exTop');
  const bottom = document.getElementById('exBottom');
  const topRows = [...top.querySelectorAll('.set-row')];
  const bottomRows = [...bottom.querySelectorAll('.set-row')];

  const expectedOrder = [
    topRows[0].querySelector('.ex-weight'), topRows[0].querySelector('.ex-reps'), topRows[0].querySelector('.ex-rpe'),
    bottomRows[0].querySelector('.ex-weight'), bottomRows[0].querySelector('.ex-reps'), bottomRows[0].querySelector('.ex-rpe'),
    topRows[1].querySelector('.ex-weight'), topRows[1].querySelector('.ex-reps'), topRows[1].querySelector('.ex-rpe'),
    bottomRows[1].querySelector('.ex-weight'), bottomRows[1].querySelector('.ex-reps'), bottomRows[1].querySelector('.ex-rpe'),
  ];

  let current = expectedOrder[0];
  current.focus();
  for(let i = 1; i < expectedOrder.length; i++){
    pressEnter(current);
    assert.strictEqual(document.activeElement, expectedOrder[i], `after Enter #${i}, focus must be on the real expected field (index ${i} of the interleaved sequence), not the next field of the same exercise`);
    current = expectedOrder[i];
  }
});

test('REAL invocation: once BOTH halves of the pair are exhausted, Enter hands off to the next real exercise after the pair, closing both pair halves and opening it', (assert)=>{
  const { document } = build();
  const top = document.getElementById('exTop');
  const bottom = document.getElementById('exBottom');
  const after = document.getElementById('exAfter');
  top.classList.add('open');
  bottom.classList.add('open');

  const lastField = [...bottom.querySelectorAll('.set-row')][1].querySelector('.ex-rpe');
  lastField.focus();
  pressEnter(lastField);

  const afterFirstField = after.querySelector('.ex-input');
  assert.strictEqual(document.activeElement, afterFirstField, 'focus must land on the next real exercise after the whole pair, not loop back into it');
  assert.ok(!top.classList.contains('open'), 'the pair\'s top half must close on handoff');
  assert.ok(!bottom.classList.contains('open'), 'the pair\'s bottom half must close on handoff');
  assert.ok(after.classList.contains('open'), 'the next real exercise must open to receive focus');
});

test('regression guard: a plain, non-superset exercise with multiple sets still chains within itself exactly as before (weight->reps->RPE->next set\'s weight)', (assert)=>{
  const { document } = build();
  const after = document.getElementById('exAfter'); // only 1 set rendered — extend the fixture inline for this case
  const setsBlock = after.querySelector('.sets-block');
  setsBlock.insertAdjacentHTML('beforeend', setRowHtml(1));
  const rows = [...after.querySelectorAll('.set-row')];
  const set1Rpe = rows[0].querySelector('.ex-rpe');
  const set2Weight = rows[1].querySelector('.ex-weight');
  set1Rpe.focus();
  pressEnter(set1Rpe);
  assert.strictEqual(document.activeElement, set2Weight, 'a non-superset exercise must still chain from one set\'s RPE straight into the next set\'s weight, unaffected by the superset changes');
});

test('REAL invocation: openFirstIncompleteExercise leaves a genuinely matched superset pair open — that IS what one open unit looks like, not the broken multi-open state it exists to fix', (assert)=>{
  const { document, window: win } = build();
  const top = document.getElementById('exTop');
  const bottom = document.getElementById('exBottom');
  top.classList.add('open');
  bottom.classList.add('open');

  win.openFirstIncompleteExercise();

  assert.ok(top.classList.contains('open'), 'top must stay open — collapsing a real matched pair would be the bug this function exists to prevent, not fix');
  assert.ok(bottom.classList.contains('open'), 'bottom must stay open too');
});

test('REAL invocation: openFirstIncompleteExercise still collapses two open blocks that are NOT a matched pair down to exactly one', (assert)=>{
  const { document, window: win } = build();
  const top = document.getElementById('exTop');
  const bottom = document.getElementById('exBottom');
  const after = document.getElementById('exAfter');
  // top and exAfter are real exercises but not each other's superset
  // partner (exAfter has no superset-top/-bottom class at all) — this is
  // the genuinely broken multi-open state Gym Mode audit finding #2 fixed.
  top.classList.add('open');
  after.classList.add('open');
  // The pair is already checked off complete, so the "first incomplete
  // exercise" this function opens afterward is exAfter itself, a plain
  // exercise with no partner — otherwise it would legitimately re-open the
  // pair as its own matched unit (2 blocks), which is correct behavior
  // covered by the test above, not what this test is isolating.
  top.querySelector('input[type=checkbox]').checked = true;
  bottom.querySelector('input[type=checkbox]').checked = true;

  win.openFirstIncompleteExercise();

  const openBlocks = [...document.querySelectorAll('#exerciseList .exercise-block')].filter(b=> b.classList.contains('open'));
  assert.strictEqual(openBlocks.length, 1, 'two open blocks that are not a matched superset pair must still be consolidated down to exactly one');
  assert.strictEqual(openBlocks[0], after, 'the one that stays open must be the real first incomplete exercise (exAfter, since the pair is already checked off)');
});

run();
