'use strict';
// Goal weight (owner: "Let's do them all", after a review: the weight card
// already knows the weekly rate, so it can say when the pace reaches a goal).
//
// v3.471 — The field. An optional "Goal weight" in Your Profile, stored in lb
// like every weight, shown in the display unit. Blank clears it — unlike
// weight, where blank keeps the old value, because no goal is a real answer.
const { makeRunner, readIndexSource, extractFunction, extractElementById, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-goal-weight.js');
const src = readIndexSource();

const fns = (...names) => names.map(n => extractFunction(src, n));

test('REAL invocation (v3.471): readGoalWeight stores lb, converts kg, and treats blank or nonsense as no goal', (assert)=>{
  const { window } = runJsdom('', "var weightUnit = 'lb'; var LB_PER_KG = 0.453592;", fns('toCanonicalLb', 'readGoalWeight'));
  assert.strictEqual(window.readGoalWeight('175'), 175);
  assert.strictEqual(window.readGoalWeight(''), null);
  assert.strictEqual(window.readGoalWeight('0'), null);
  assert.strictEqual(window.readGoalWeight('-5'), null);
  assert.strictEqual(window.readGoalWeight('abc'), null);
  window.weightUnit = 'kg';
  assert.ok(Math.abs(window.readGoalWeight('80') - 80 / 0.453592) < 1e-9, 'kg in, lb stored');
});

test('REAL markup (v3.471): the field sits beside Weight in Your Profile, labelled with the unit', (assert)=>{
  const { window } = runJsdom(extractElementById(src, 'profileCard'), '', []);
  const doc = window.document;
  const input = doc.getElementById('pfGoalWeight');
  assert.ok(input && input.getAttribute('inputmode') === 'decimal');
  assert.strictEqual(input.getAttribute('placeholder'), 'Optional');
  assert.strictEqual(doc.querySelector('label[for="pfGoalWeight"]').textContent, 'Goal weight (lb)');
  assert.strictEqual(input.closest('.profile-row-2'), doc.getElementById('pfWeight').closest('.profile-row-2'));
});

test('REAL invocation (v3.471): the form shows a stored goal in the display unit, and nothing when there is none', (assert)=>{
  const html = '<input id="pfName"><input id="pfAge"><select id="pfGender"><option value="male">m</option></select><input id="pfHeightFt"><input id="pfHeightIn"><input id="pfWeight"><input id="pfGoalWeight"><select id="pfActivity"></select><select id="pfGoal"></select><div id="pfCycleTrackingRow"><input type="checkbox" id="pfCycleTrackingEnabled"></div><select id="pfDietaryPreference"></select><input type="checkbox" id="pfGlutenFree"><input type="checkbox" id="pfDairyFree"><input type="checkbox" id="pfNutFree"><input type="checkbox" id="pfHalal"><input type="checkbox" id="pfKosher"><input id="pfAvoidFoods">';
  const stubs = "function renderConditionOptions(){} function updateBodyGoalOptions(){} function updatePfCycleTrackingRowVisibility(){} var weightUnit='kg'; var LB_PER_KG=0.453592;";
  const set = { gender:'male', weight:180, goalWeight:176.37, dietaryFlags:{} };
  let { window } = runJsdom(html, stubs + `var userProfile = ${JSON.stringify(set)};`, fns('toDisplayWeight', 'trimUnitNum', 'populateProfileForm'));
  window.populateProfileForm();
  assert.strictEqual(window.document.getElementById('pfGoalWeight').value, '80', '176.37 lb shows as 80 kg');
  ({ window } = runJsdom(html, stubs + `var userProfile = ${JSON.stringify({gender:'male', weight:180, dietaryFlags:{}})};`, fns('toDisplayWeight', 'trimUnitNum', 'populateProfileForm')));
  window.populateProfileForm();
  assert.strictEqual(window.document.getElementById('pfGoalWeight').value, '');
});

test('REAL source (v3.471): saving the profile keeps the goal (the handler rebuilds userProfile from the form)', (assert)=>{
  const start = src.indexOf("document.getElementById('pfSave').addEventListener('click'");
  const body = src.slice(start, src.indexOf('\n});', start));
  assert.match(body, /goalWeight: readGoalWeight\(document\.getElementById\('pfGoalWeight'\)\.value\),/);
});

run();
