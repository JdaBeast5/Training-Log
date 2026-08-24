'use strict';
// Behavioral coverage for a real bug found during a live QA pass: the
// #pfSave click handler built each numeric profile field as
// `Number(input.value) || userProfile.oldField` — a pattern that looks like
// a normal "field left blank, keep the old value" guard, but Number('0') is
// 0, which is falsy in JS. So deliberately entering 0 for age, height (ft),
// or weight fell through to the OLD value instead, while #pfStatus still
// said "Saved ✓" — a silent data-integrity bug, not a crash.
//
// Fixed by gating on the raw input STRING being non-empty (the actual
// "was anything typed" question) rather than the parsed NUMBER being
// truthy. heightIn was already correct by coincidence (its fallback is 0,
// not the old value, so 0 || 0 still lands on 0) and is left untouched.
//
// The real #pfSave handler chains into ~15 rendering functions after
// building userProfile (renderWorkout, renderWater, loadFoodLog, etc.) —
// irrelevant to the input-parsing bug this covers, and each with its own
// deep dependencies. Extracted here at the source level with those stubbed
// to no-ops, same treatment this suite already gives other heavy
// addEventListener wiring (see test-sticky-day-header-overlap.js's
// extractClickWiring) — toCanonicalLb, the one function actually relevant
// to the weight-field fix, is extracted and run for real rather than
// stubbed.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-profile-save-zero-value.js');

function extractClickWiring(source, elementId){
  const startText = `document.getElementById('${elementId}').addEventListener('click', async ()=>{`;
  const start = source.indexOf(startText);
  if(start === -1) throw new Error(`pfSave click wiring not found (looked for: ${startText})`);
  const end = source.indexOf('\n});', start);
  if(end === -1) throw new Error('no closing \'});\' found after the click wiring');
  return source.slice(start, end + 4);
}

const toCanonicalLbSrc = extractFunction(src, 'toCanonicalLb');
// A real dependency of the pfSave handler added alongside this bug's own
// fix (negative-age validation, see test-profile-age-validation.js) — not
// under test here, but the handler now throws without it defined.
const readValidAgeSrc = extractFunction(src, 'readValidAge');
const pfSaveWiringSrc = extractClickWiring(src, 'pfSave');

const FIELD_IDS = [
  'pfName', 'pfAge', 'pfGender', 'pfHeightFt', 'pfHeightIn', 'pfWeight',
  'pfActivity', 'pfGoal', 'pfBodyGoal', 'pfGlutenFree', 'pfDairyFree',
  'pfNutFree', 'pfHalal', 'pfKosher', 'pfAvoidFoods', 'pfDietaryPreference',
];

function buildBodyHtml(){
  const selectIds = ['pfGender', 'pfActivity', 'pfGoal', 'pfBodyGoal', 'pfDietaryPreference'];
  const checkboxIds = ['pfGlutenFree', 'pfDairyFree', 'pfNutFree', 'pfHalal', 'pfKosher'];
  const inputs = FIELD_IDS.map(id => {
    if(checkboxIds.includes(id)) return `<input type="checkbox" id="${id}">`;
    if(selectIds.includes(id)) return `<select id="${id}"><option value="" selected></option></select>`;
    return `<input id="${id}">`;
  }).join('\n');
  return `
    ${inputs}
    <button id="pfSave"></button>
    <div id="pfStatus"></div>
    <div id="profileHeader" class="open"></div>
    <div id="profileExpandWrap" class="open"></div>
  `;
}

// Every rendering function the real handler chains into after building
// userProfile — irrelevant to the bug this test covers, stubbed to no-ops
// so the extracted wiring runs standalone without pulling in the rest of
// the app's render pipeline.
const stubGlobals = `
  var weightUnit = 'lb';
  var userProfile = { name: 'Old Name', age: 30, gender: 'male', heightFt: 5, heightIn: 10, weight: 180 };
  var activeUserId = null; // falsy on purpose — skips the getUserList/setUserList sync block, unrelated to this bug
  var targets = null;
  function invalidateFoodPrefCache(){}
  function readConditionSelections(){ return []; }
  async function saveProfile(){}
  function computeTargets(){ return {}; }
  function applyTargetsToUI(){}
  function renderHeader(){}
  function renderProfileSummary(){}
  function renderOnboardingCard(){}
  async function getCurrentTrendStatus(){ return null; }
  async function renderProgramRec(){}
  async function renderProgramSelector(){}
  function renderWorkout(){}
  function renderWater(){}
  function renderCycleTracking(){}
  function toggleConditionTrackerCards(){}
  function renderTodayInsights(){}
  function loadFoodLog(){}
  function updateHideAvoidedToggleVisibility(){}
  function renderFoodItems(){}
`;

async function saveWith(fieldValues){
  const { document, window } = runJsdom(buildBodyHtml(), stubGlobals, [toCanonicalLbSrc, readValidAgeSrc, pfSaveWiringSrc]);
  for(const [id, value] of Object.entries(fieldValues)){
    document.getElementById(id).value = value;
  }
  document.getElementById('pfSave').click();
  // The handler is async (awaits saveProfile()); let its microtasks/timers settle.
  await new Promise(res => setTimeout(res, 20));
  return window.userProfile;
}

test('REAL invocation: entering 0 for age is saved as 0, not silently kept at the old value', async (assert)=>{
  const profile = await saveWith({ pfAge: '0', pfHeightFt: '5', pfHeightIn: '10', pfWeight: '180' });
  assert.strictEqual(profile.age, 0, 'age=0 must actually save as 0 — the old bug kept it at the previous age (30) instead');
});

test('REAL invocation: entering 0 for height (ft) is saved as 0, not silently kept at the old value', async (assert)=>{
  const profile = await saveWith({ pfAge: '30', pfHeightFt: '0', pfHeightIn: '10', pfWeight: '180' });
  assert.strictEqual(profile.heightFt, 0, 'heightFt=0 must actually save as 0 — the old bug kept it at the previous height (5) instead');
});

test('REAL invocation: entering 0 for weight is saved as 0, not silently kept at the old value', async (assert)=>{
  const profile = await saveWith({ pfAge: '30', pfHeightFt: '5', pfHeightIn: '10', pfWeight: '0' });
  assert.strictEqual(profile.weight, 0, 'weight=0 must actually save as 0 — the old bug kept it at the previous weight (180) instead');
});

test('regression guard: leaving a field genuinely BLANK still keeps the old value (this must stay true — only entered 0 was the bug)', async (assert)=>{
  const profile = await saveWith({ pfAge: '', pfHeightFt: '', pfHeightIn: '10', pfWeight: '' });
  assert.strictEqual(profile.age, 30, 'blank age must keep the old value');
  assert.strictEqual(profile.heightFt, 5, 'blank heightFt must keep the old value');
  assert.strictEqual(profile.weight, 180, 'blank weight must keep the old value');
});

test('sabotage-relevant: a genuinely NEW non-zero value still overwrites the old one (proves this is not just "always keep old value")', async (assert)=>{
  const profile = await saveWith({ pfAge: '42', pfHeightFt: '6', pfHeightIn: '1', pfWeight: '200' });
  assert.strictEqual(profile.age, 42);
  assert.strictEqual(profile.heightFt, 6);
  assert.strictEqual(profile.weight, 200);
});

run();
