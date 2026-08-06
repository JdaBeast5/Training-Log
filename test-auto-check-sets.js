'use strict';
// Behavioral coverage for Phase F1 of the stabilization plan:
// checkAllSetsCompleteAndAutoCheck, pulled out of wireSetsBlock's closure
// into a standalone (row, block) function specifically so it's testable
// and so wireSetsBlock can call it once at the end of every render, not
// just reactively from a single field's change listener. That second call
// site is what fixes the real bug: "Same as Last Time" populates a set's
// data via saveExSet() + a full renderWorkout() re-render rather than
// firing field change events, so the exercise never used to auto-check
// even when every field ended up complete.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const fnSrc = extractFunction(src, 'checkAllSetsCompleteAndAutoCheck');

function buildFixture(setRowsHtml){
  return `
    <div id="row">
      <input type="checkbox">
      <div class="sets-block" id="block">
        ${setRowsHtml}
      </div>
    </div>
  `;
}

function setRowHtml({weight, reps, rpe} = {}){
  return `
    <div class="set-row">
      <input class="ex-weight" value="${weight ?? ''}">
      <input class="ex-reps" value="${reps ?? ''}">
      <input class="ex-rpe" value="${rpe ?? ''}">
    </div>
  `;
}

const { test, run } = makeRunner('test-auto-check-sets.js');

test('checks the box and fires a real change event when every set is complete', (assert)=>{
  const { document } = runJsdom(
    buildFixture(setRowHtml({weight: 185, reps: 5, rpe: 8})),
    '',
    [fnSrc, `
      var row = document.getElementById('row');
      var block = document.getElementById('block');
      var changeFired = false;
      row.querySelector('input[type=checkbox]').addEventListener('change', ()=>{ changeFired = true; });
      checkAllSetsCompleteAndAutoCheck(row, block);
      window.__testResult = { checked: row.querySelector('input[type=checkbox]').checked, changeFired: changeFired };
    `]
  );
  assert.strictEqual(document.defaultView.__testResult.checked, true);
  assert.strictEqual(document.defaultView.__testResult.changeFired, true, 'must dispatch a real change event, not just flip the property');
});

test('does nothing when RPE is missing on one set, even if weight and reps are filled everywhere', (assert)=>{
  const { document } = runJsdom(
    buildFixture(
      setRowHtml({weight: 185, reps: 5, rpe: 8}) +
      setRowHtml({weight: 185, reps: 5, rpe: ''})
    ),
    '',
    [fnSrc, `
      var row = document.getElementById('row');
      var block = document.getElementById('block');
      checkAllSetsCompleteAndAutoCheck(row, block);
      window.__testResult = row.querySelector('input[type=checkbox]').checked;
    `]
  );
  assert.strictEqual(document.defaultView.__testResult, false);
});

test('does not redundantly re-dispatch change when already checked', (assert)=>{
  const { document } = runJsdom(
    buildFixture(setRowHtml({weight: 185, reps: 5, rpe: 8})),
    '',
    [fnSrc, `
      var row = document.getElementById('row');
      var block = document.getElementById('block');
      var cb = row.querySelector('input[type=checkbox]');
      cb.checked = true;
      var changeCount = 0;
      cb.addEventListener('change', ()=>{ changeCount++; });
      checkAllSetsCompleteAndAutoCheck(row, block);
      window.__testResult = changeCount;
    `]
  );
  assert.strictEqual(document.defaultView.__testResult, 0, 'an already-checked box must not fire another change event');
});

test('the exact bug this fixes: data populated WITHOUT firing field change events (the Same-as-Last-Time path) still ends up checked once this runs', (assert)=>{
  // Mirrors what "Same as Last Time" actually does: it sets .value via
  // saveExSet()+renderWorkout(), never dispatching a change event on any
  // field itself. Before this fix, nothing would ever call this function
  // in that path at all — asserting the function's OWN behavior here
  // (given already-populated fields, no field-level events involved).
  const { document } = runJsdom(
    buildFixture(setRowHtml({weight: 225, reps: 5, rpe: 7})),
    '',
    [fnSrc, `
      var row = document.getElementById('row');
      var block = document.getElementById('block');
      // No change events dispatched on the fields — values just exist, as
      // they would after a re-render from storage.
      checkAllSetsCompleteAndAutoCheck(row, block);
      window.__testResult = row.querySelector('input[type=checkbox]').checked;
    `]
  );
  assert.strictEqual(document.defaultView.__testResult, true);
});

test('wireSetsBlock actually calls checkAllSetsCompleteAndAutoCheck once after wiring all existing rows, not just from the field-level save handler', (assert)=>{
  const wireSetsBlockSrc = extractFunction(src, 'wireSetsBlock');
  const callSites = wireSetsBlockSrc.match(/checkAllSetsCompleteAndAutoCheck\(row, block\)/g) || [];
  assert.strictEqual(callSites.length, 2, `expected 2 call sites (the save handler + the post-wiring pass), found ${callSites.length}`);
  assert.ok(
    wireSetsBlockSrc.indexOf("querySelectorAll('.set-row').forEach(wireSetRow)") <
    wireSetsBlockSrc.lastIndexOf('checkAllSetsCompleteAndAutoCheck(row, block)'),
    'the post-wiring auto-check call must come after all existing rows are wired, not before'
  );
});

run();
