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

// v3.472 — On the weight trend. A dashed line at the goal (the goal joins the
// chart's scale, as the nutrition targets do) and one sentence from the
// trend's own weekly pace: when it gets there, that it's heading the other
// way, or how far there is to go when the pace is flat.
const PACE = fns('parseDateKey', 'formatDate', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'describeGoalPace');
function pace(){ return runJsdom('', "var weightUnit = 'lb'; var LB_PER_KG = 0.453592;", PACE).window; }

test('REAL invocation (v3.472): the goal sentence for each kind of pace', (assert)=>{
  const w = pace();
  const year = new Date().getFullYear();
  const last = `${year}-01-01`;
  assert.strictEqual(w.describeGoalPace(180, null, -1, last), '', 'no goal, no sentence');
  assert.strictEqual(w.describeGoalPace(180, 180.4, -1, last), "You're at your 180.4 lb goal.");
  assert.strictEqual(w.describeGoalPace(180, 175, -0.1, last), '5 lb to your 175 lb goal.', 'a flat pace gives no date');
  assert.strictEqual(w.describeGoalPace(180, 175, 0.5, last), 'Moving away from your 175 lb goal.');
  assert.strictEqual(w.describeGoalPace(180, 175, -1, last), 'At this pace, 175 lb around Feb 5.', '5 lb at 1 lb a week is 35 days');
  assert.strictEqual(w.describeGoalPace(170, 175, 0.5, last), 'At this pace, 175 lb around Mar 12.', 'gaining toward a higher goal works too');
  assert.strictEqual(w.describeGoalPace(200, 175, -0.2, last), '25 lb to your 175 lb goal; over two years at this pace.');
  assert.match(w.describeGoalPace(180, 170, -0.2, `${year}-11-01`), new RegExp(`around [A-Z][a-z]{2} \\d+, ${year + 1}\\.$`), 'a date in another year names the year');
});

const SPARK = [...fns('getTodayKey', 'dateKeyMinusDays', 'getAnalysisTrendRangeDays', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'parseDateKey', 'formatDate', 'describeGoalPace', 'renderSparkline')];
function spark(goalWeight){
  const today = new Date(); const key = d => { const x = new Date(today); x.setDate(x.getDate() - d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
  const entries = [21, 14, 7, 0].map((d, i) => ({date:key(d), weight:184 - i}));
  const { window } = runJsdom('<div id="weightChart"></div>', `var weightUnit = 'lb'; var LB_PER_KG = 0.453592; var userProfile = ${JSON.stringify(goalWeight ? {goalWeight} : {})};`,
    [...SPARK, `renderSparkline(${JSON.stringify(entries)});`]);
  return window.document;
}

test('REAL invocation (v3.472): with a goal, a dashed line at it and the pace sentence; the goal is inside the chart', (assert)=>{
  const doc = spark(175);
  const line = doc.querySelector('#weightChart svg line.trend-target');
  assert.ok(line, 'a goal line');
  assert.strictEqual(Number(line.getAttribute('y1')), 62, 'the lowest value on the scale sits at the bottom padding (70 - 8)');
  const ys = doc.querySelector('#weightChart polyline').getAttribute('points').split(' ').map(p => Number(p.split(',')[1]));
  assert.ok(ys.every(y => y < 62), 'all the data sits above a lower goal');
  const note = doc.querySelector('#weightChart .goal-feedback-neutral').textContent;
  assert.match(note, /^About 1 lb a week loss over this window\. At this pace, 175 lb around /);
});

test('REAL invocation (v3.472): no goal, no line, no sentence, scale unchanged', (assert)=>{
  const doc = spark(null);
  assert.strictEqual(doc.querySelector('#weightChart line.trend-target'), null);
  assert.strictEqual(doc.querySelector('#weightChart .goal-feedback-neutral').textContent, 'About 1 lb a week loss over this window.');
  const ys = doc.querySelector('#weightChart polyline').getAttribute('points').split(' ').map(p => Number(p.split(',')[1]));
  assert.strictEqual(Math.max(...ys), 62, 'the lowest weigh-in still fills the chart');
});

run();
