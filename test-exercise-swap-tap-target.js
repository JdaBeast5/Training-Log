'use strict';
// Behavioral coverage for the exercise-name tap-target bug found during a
// real golden-path walkthrough: the swap-exercise click handler used to be
// bound to the whole `.ex-name` div, which spans most of an exercise row's
// width, and it called stopPropagation() — so a normal tap anywhere on an
// exercise's name opened "Swap Exercise" instead of the row's own
// expand-to-log toggle. Fixed by binding the swap handler to the small
// `.ex-swap-icon` span specifically, leaving `.ex-name` (and the rest of the
// row) free to bubble up to the header's own expand/collapse listener.
//
// renderWorkout() is too large (700+ lines, dozens of external dependencies)
// to invoke wholesale, so this pulls the two REAL, adjacent statements this
// fix touches straight out of the live file by content anchor (never by line
// number — those drift on every edit in this project) and runs them against
// a hand-built fixture that mirrors the real markup contract
// (.exercise > .ex-name-wrap > .ex-name > .ex-swap-icon, sibling
// .expand-wrap), the same pattern test-auto-check-sets.js already uses for
// checkAllSetsCompleteAndAutoCheck.
const { readIndexSource, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractBetween(label, startAnchor, endAnchor){
  const start = src.indexOf(startAnchor);
  if(start === -1) throw new Error(`extractBetween(${label}): start anchor not found: ${startAnchor}`);
  const end = src.indexOf(endAnchor, start);
  if(end === -1) throw new Error(`extractBetween(${label}): end anchor not found after start: ${endAnchor}`);
  return src.slice(start, end);
}

// The single line declaring exerciseHeader, and separately the two adjacent
// click-wiring statements (exerciseHeader's own toggle + the swap-icon
// binding) — skipping the unrelated delete/AI-tailor button wiring that
// sits between them in the real file, which would otherwise need its own
// large stub surface for dependencies irrelevant to this fix.
const headerDeclSrc = extractBetween(
  'exerciseHeader declaration',
  "const exerciseHeader = row.querySelector('.exercise');",
  '\n'
);
const wiringSrc = extractBetween(
  'header + swap-icon click wiring',
  "exerciseHeader.addEventListener('click', ()=>{",
  "const editBtn = row.querySelector('.ex-edit-btn');"
);

function buildFixture(){
  return `
    <div id="row">
      <div class="exercise">
        <div class="ex-name-wrap">
          <div class="ex-name ex-name-swappable">Bench Press<span class="ex-swap-icon">⇄</span></div>
        </div>
      </div>
      <div class="expand-wrap"></div>
    </div>
  `;
}

function globalsFor(hasSubs){
  return `
    window.row = document.getElementById('row');
    window.hasSubs = ${hasSubs};
    window.i = 0;
    window.ex = {name: 'Bench Press'};
    window.__modalCalls = [];
    window.openExerciseSubModal = (i, ex)=>{ window.__modalCalls.push([i, ex.name]); };
  `;
}

const { test, run } = makeRunner('test-exercise-swap-tap-target.js');

test('clicking the exercise NAME text (not the swap icon) expands the row and does NOT open the swap modal', (assert)=>{
  const { document, window: win } = runJsdom(buildFixture(), globalsFor(true), [
    headerDeclSrc, wiringSrc,
    `
      var nameText = row.querySelector('.ex-name').firstChild; // the raw "Bench Press" text node
      nameText.parentNode.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
    `
  ]);
  assert.strictEqual(document.getElementById('row').classList.contains('open'), true,
    'a tap on the exercise name must still expand the row (the primary action)');
  assert.strictEqual(document.getElementById('row').querySelector('.expand-wrap').classList.contains('open'), true);
  // Round-tripped through JSON rather than assert.deepStrictEqual directly —
  // win.__modalCalls is an Array from jsdom's own realm, whose prototype
  // differs from the host's Array literal below; deepStrictEqual treats
  // those as unequal even with identical contents (same caveat testHelpers'
  // runSandbox already documents for vm-context objects).
  assert.strictEqual(JSON.stringify(win.__modalCalls), JSON.stringify([]), 'a tap on the name text must NOT open the swap modal');
});

test('clicking the swap icon opens the swap modal and does NOT expand the row', (assert)=>{
  const { document, window: win } = runJsdom(buildFixture(), globalsFor(true), [
    headerDeclSrc, wiringSrc,
    `
      row.querySelector('.ex-swap-icon').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
    `
  ]);
  assert.strictEqual(JSON.stringify(win.__modalCalls), JSON.stringify([[0, 'Bench Press']]), 'a tap on the swap icon must open the swap modal for this exercise');
  assert.strictEqual(document.getElementById('row').classList.contains('open'), false,
    'the swap icon click must not also bubble into expanding the row (stopPropagation must still work)');
});

test('when the exercise has no substitutes (hasSubs false), the swap icon is never wired — a click there just bubbles to expand, like anywhere else on the row', (assert)=>{
  const { document, window: win } = runJsdom(buildFixture(), globalsFor(false), [
    headerDeclSrc, wiringSrc,
    `
      row.querySelector('.ex-swap-icon').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
    `
  ]);
  assert.strictEqual(JSON.stringify(win.__modalCalls), JSON.stringify([]), 'with hasSubs false, no swap binding exists, so no modal call');
  assert.strictEqual(document.getElementById('row').classList.contains('open'), true,
    'without a swap binding to stop propagation, the click reaches the header toggle instead');
});

run();
