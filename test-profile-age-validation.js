'use strict';
// Behavioral coverage for a real bug found during a live QA pass: entering
// a negative age (e.g. -5) in the profile form saved it as-is — Number(-5)
// is truthy, so it passed straight through the save handler's old
// `Number(...) || fallback` guard (see test-profile-save-zero-value.js for
// that same guard's OTHER bug, the falsy-zero one). Nothing crashed, but
// computeTargets feeds age straight into the BMR formula as `-5*age`, so a
// negative age quietly INFLATES the calorie target by a wrong amount —
// silent bad data, not a visible error.
//
// Fixed with a small named helper (readValidAge) rather than another inline
// ternary, since this is genuine validation logic (two conditions: blank
// AND non-negative), not just an empty-string check like the other fields
// in the same handler.
const { readIndexSource, extractFunction, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-profile-age-validation.js');

const readValidAgeSrc = extractFunction(src, 'readValidAge');

function run_readValidAge(rawValue, fallback){
  const vm = require('vm');
  const context = vm.createContext({});
  const script = `${readValidAgeSrc}\nreadValidAge(${JSON.stringify(rawValue)}, ${JSON.stringify(fallback)});`;
  return vm.runInContext(script, context);
}

test('REAL invocation: a negative age keeps the old value, not the entered negative number', (assert)=>{
  assert.strictEqual(run_readValidAge('-5', 30), 30, 'a negative age must not be saved — it must fall back to the old age');
});

test('REAL invocation: 0 is a valid age and is NOT treated as "blank" or "invalid" — same non-negative-is-fine rule, matching the sibling zero-value fix', (assert)=>{
  assert.strictEqual(run_readValidAge('0', 30), 0, 'age=0 is non-negative and must be accepted, consistent with the other profile fields\' zero-value fix');
});

test('REAL invocation: a genuinely blank field keeps the old value', (assert)=>{
  assert.strictEqual(run_readValidAge('', 30), 30);
});

test('REAL invocation: a normal positive age is accepted as entered', (assert)=>{
  assert.strictEqual(run_readValidAge('42', 30), 42);
});

test('REAL invocation: non-numeric garbage falls back to the old value rather than saving NaN', (assert)=>{
  assert.strictEqual(run_readValidAge('abc', 30), 30);
});

test('sabotage-relevant: decimal ages are still accepted (no unintended integer-only restriction introduced)', (assert)=>{
  assert.strictEqual(run_readValidAge('42.5', 30), 42.5, 'the fix must only reject negative/non-numeric input, not decimals');
});

run();
