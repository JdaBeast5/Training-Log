'use strict';
// Behavioral coverage for the cycle-tracking opt-out — the user ask: "put an
// option for women in the profile to turn off the cycle tracking if they
// don't wanna do it." `cycleTrackingEnabled` is a new userProfile field,
// defaulting to true (see userProfile's own default object in index.html) so
// nothing changes for anyone who has never touched the setting; explicitly
// turning it off must be a REAL off switch — it hides the Cycle Tracking
// card AND stops every phase-aware Today insight from reading whatever
// cycle-data may already be saved from before the opt-out (covered directly
// in test-supplement-condition-cycle-nudge.js and
// test-cycle-phase-nutrition-insight.js — this file covers the switch
// itself: the shared gate function, the card visibility it drives, and the
// real profile-form checkbox that sets it).
//
// Real functions under test: isCycleTrackingEnabled, toggleCycleCard,
// updatePfCycleTrackingRowVisibility, the real pfGender 'change' listener,
// populateProfileForm, and the real pfSave click wiring — not
// reimplementations of any of them.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-cycle-tracking-opt-out.js');

const isCycleTrackingEnabledSrc = extractFunction(src, 'isCycleTrackingEnabled');
const toggleCycleCardSrc = extractFunction(src, 'toggleCycleCard');
const updateRowVisibilitySrc = extractFunction(src, 'updatePfCycleTrackingRowVisibility');
const populateProfileFormSrc = extractFunction(src, 'populateProfileForm');

function extractChangeWiring(source, elementId){
  const startText = `document.getElementById('${elementId}').addEventListener('change', (e)=>{`;
  const start = source.indexOf(startText);
  if(start === -1) throw new Error(`change wiring not found for #${elementId} (looked for: ${startText})`);
  const end = source.indexOf('\n});', start);
  if(end === -1) throw new Error('no closing \'});\' found after the change wiring');
  return source.slice(start, end + 4);
}

function extractClickWiring(source, elementId){
  const startText = `document.getElementById('${elementId}').addEventListener('click', async ()=>{`;
  const start = source.indexOf(startText);
  if(start === -1) throw new Error(`click wiring not found for #${elementId}`);
  const end = source.indexOf('\n});', start);
  if(end === -1) throw new Error('no closing \'});\' found after the click wiring');
  return source.slice(start, end + 4);
}

const pfGenderChangeWiringSrc = extractChangeWiring(src, 'pfGender');
const pfSaveWiringSrc = extractClickWiring(src, 'pfSave');

// --- isCycleTrackingEnabled: the shared gate function -----------------------

test('REAL invocation: female gender, field never set (undefined) -> enabled (matches the default userProfile object, so pre-existing users see no change)', (assert)=>{
  const { window } = runJsdom('', 'var userProfile = { gender: "female" };', [isCycleTrackingEnabledSrc]);
  assert.strictEqual(window.isCycleTrackingEnabled(), true);
});

test('REAL invocation: female gender, cycleTrackingEnabled explicitly true -> enabled', (assert)=>{
  const { window } = runJsdom('', 'var userProfile = { gender: "female", cycleTrackingEnabled: true };', [isCycleTrackingEnabledSrc]);
  assert.strictEqual(window.isCycleTrackingEnabled(), true);
});

test('REAL invocation: female gender, cycleTrackingEnabled explicitly false -> disabled', (assert)=>{
  const { window } = runJsdom('', 'var userProfile = { gender: "female", cycleTrackingEnabled: false };', [isCycleTrackingEnabledSrc]);
  assert.strictEqual(window.isCycleTrackingEnabled(), false);
});

test('sabotage-relevant: non-female gender is always disabled regardless of the opt-out flag — this option only ever exists for women, never a general toggle', (assert)=>{
  const { window: winMale } = runJsdom('', 'var userProfile = { gender: "male", cycleTrackingEnabled: true };', [isCycleTrackingEnabledSrc]);
  assert.strictEqual(winMale.isCycleTrackingEnabled(), false, 'male gender with the flag explicitly true must still be disabled');
  const { window: winOther } = runJsdom('', 'var userProfile = { gender: "other", cycleTrackingEnabled: true };', [isCycleTrackingEnabledSrc]);
  assert.strictEqual(winOther.isCycleTrackingEnabled(), false, 'other/unset gender with the flag explicitly true must still be disabled');
});

// --- toggleCycleCard: real card visibility driven by the real gate --------

test('REAL invocation: toggleCycleCard shows the real #cycleCard for an enabled female profile', (assert)=>{
  const { document } = runJsdom('<div class="card" id="cycleCard" style="display:none"></div>', 'var userProfile = { gender: "female", cycleTrackingEnabled: true };', [isCycleTrackingEnabledSrc, toggleCycleCardSrc, 'toggleCycleCard();']);
  assert.strictEqual(document.getElementById('cycleCard').style.display, '');
});

test('REAL invocation: toggleCycleCard hides the real #cycleCard once a female profile has opted out, even though gender is still female', (assert)=>{
  const { document } = runJsdom('<div class="card" id="cycleCard" style="display:none"></div>', 'var userProfile = { gender: "female", cycleTrackingEnabled: false };', [isCycleTrackingEnabledSrc, toggleCycleCardSrc, 'toggleCycleCard();']);
  assert.strictEqual(document.getElementById('cycleCard').style.display, 'none', 'the card must stay hidden — opting out must actually hide it, not just the Today insights');
});

// --- Profile-form wiring: the row only shows for female, and mirrors it ----

test('REAL invocation: updatePfCycleTrackingRowVisibility shows the real #pfCycleTrackingRow only when #pfGender is female', (assert)=>{
  const bodyHtml = `
    <select id="pfGender"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
    <div id="pfCycleTrackingRow" style="display:none;"></div>
  `;
  const { document, window } = runJsdom(bodyHtml, '', [updateRowVisibilitySrc]);
  document.getElementById('pfGender').value = 'male';
  window.updatePfCycleTrackingRowVisibility();
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, 'none', 'must stay hidden for male');

  document.getElementById('pfGender').value = 'female';
  window.updatePfCycleTrackingRowVisibility();
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, '', 'must show once female is selected');

  document.getElementById('pfGender').value = 'other';
  window.updatePfCycleTrackingRowVisibility();
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, 'none', 'must hide again for other/unset');
});

test('REAL invocation: the real pfGender change listener calls updatePfCycleTrackingRowVisibility as part of its real wiring (not just defined and never called)', (assert)=>{
  const bodyHtml = `
    <select id="pfGender"><option value="male">Male</option><option value="female">Female</option></select>
    <div id="pfCycleTrackingRow" style="display:none;"></div>
  `;
  const stubGlobals = `
    var userProfile = { gender: 'male' };
    function updateBodyGoalOptions(){}
    function toggleCycleCard(){}
  `;
  const { document, window } = runJsdom(bodyHtml, stubGlobals, [updateRowVisibilitySrc, pfGenderChangeWiringSrc]);
  document.getElementById('pfGender').value = 'female';
  document.getElementById('pfGender').dispatchEvent(new window.Event('change'));
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, '', 'the real change listener must actually call updatePfCycleTrackingRowVisibility, not just have it defined nearby');
  assert.strictEqual(window.userProfile.gender, 'female', 'the listener\'s own existing job (updating userProfile.gender) must still work alongside the new call');
});

// --- populateProfileForm: sets the real checkbox + row from userProfile ---

const populateBodyHtml = `
  <input type="text" id="pfName">
  <input type="number" id="pfAge">
  <select id="pfGender"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
  <input type="number" id="pfHeightFt"> <input type="number" id="pfHeightIn">
  <input type="number" id="pfWeight">
  <select id="pfActivity"></select>
  <select id="pfGoal"></select>
  <div id="pfCycleTrackingRow" style="display:none;"><input type="checkbox" id="pfCycleTrackingEnabled"></div>
  <select id="pfDietaryPreference"></select>
  <input type="checkbox" id="pfGlutenFree"><input type="checkbox" id="pfDairyFree"><input type="checkbox" id="pfNutFree"><input type="checkbox" id="pfHalal"><input type="checkbox" id="pfKosher">
  <input id="pfAvoidFoods">
`;
const populateStubGlobals = `
  function renderConditionOptions(){}
  function updateBodyGoalOptions(){}
  function trimUnitNum(n){ return n; }
  function toDisplayWeight(w){ return w; }
`;

test('REAL invocation: populateProfileForm checks the real checkbox and shows the real row for a female profile with tracking enabled', (assert)=>{
  const profile = { gender: 'female', cycleTrackingEnabled: true, weight: 0, dietaryFlags: {} };
  const { document, window } = runJsdom(populateBodyHtml, `var userProfile = ${JSON.stringify(profile)};`, [populateStubGlobals, updateRowVisibilitySrc, populateProfileFormSrc]);
  window.populateProfileForm();
  assert.strictEqual(document.getElementById('pfCycleTrackingEnabled').checked, true);
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, '', 'the row must be visible for a female profile');
});

test('REAL invocation: populateProfileForm leaves the real checkbox unchecked and hides the real row for a female profile that opted out', (assert)=>{
  const profile = { gender: 'female', cycleTrackingEnabled: false, weight: 0, dietaryFlags: {} };
  const { document, window } = runJsdom(populateBodyHtml, `var userProfile = ${JSON.stringify(profile)};`, [populateStubGlobals, updateRowVisibilitySrc, populateProfileFormSrc]);
  window.populateProfileForm();
  assert.strictEqual(document.getElementById('pfCycleTrackingEnabled').checked, false, 'the checkbox must reflect the real stored opt-out, not default to checked');
  // Row still shows (gender is still female) — it's the checkbox state, not the row visibility, that carries the opt-out.
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, '', 'the row itself stays visible so she can re-enable it later — only the checkbox state reflects the opt-out');
});

test('sabotage-relevant: populateProfileForm hides the real row for a non-female profile regardless of the stored flag', (assert)=>{
  const profile = { gender: 'male', cycleTrackingEnabled: true, weight: 0, dietaryFlags: {} };
  const { document, window } = runJsdom(populateBodyHtml, `var userProfile = ${JSON.stringify(profile)};`, [populateStubGlobals, updateRowVisibilitySrc, populateProfileFormSrc]);
  window.populateProfileForm();
  assert.strictEqual(document.getElementById('pfCycleTrackingRow').style.display, 'none');
});

// --- pfSave: persists the real checkbox into userProfile.cycleTrackingEnabled

const saveBodyHtml = `
  <input id="pfName"><input id="pfAge"><select id="pfGender"><option value="female" selected></option></select>
  <input id="pfHeightFt"><input id="pfHeightIn"><input id="pfWeight">
  <select id="pfActivity"><option value="1.2" selected></option></select>
  <select id="pfGoal"><option value="maintain" selected></option></select>
  <select id="pfBodyGoal"><option value="" selected></option></select>
  <input type="checkbox" id="pfCycleTrackingEnabled">
  <input type="checkbox" id="pfGlutenFree"><input type="checkbox" id="pfDairyFree"><input type="checkbox" id="pfNutFree"><input type="checkbox" id="pfHalal"><input type="checkbox" id="pfKosher">
  <input id="pfAvoidFoods"><select id="pfDietaryPreference"><option value="" selected></option></select>
  <button id="pfSave"></button>
  <div id="pfStatus"></div>
  <div id="profileHeader" class="open"></div>
  <div id="profileExpandWrap" class="open"></div>
`;
const saveStubGlobals = `
  var weightUnit = 'lb';
  var userProfile = { name: 'Old Name', age: 30, gender: 'female', heightFt: 5, heightIn: 10, weight: 180, cycleTrackingEnabled: true };
  var activeUserId = null;
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
  function toCanonicalLb(v){ return Number(v); }
  function readValidAge(raw, fallback){ return raw === '' ? fallback : Number(raw); }
`;

test('REAL invocation: pfSave persists an explicit opt-out (unchecked box) into userProfile.cycleTrackingEnabled', async (assert)=>{
  const { document, window } = runJsdom(saveBodyHtml, saveStubGlobals, [pfSaveWiringSrc]);
  document.getElementById('pfCycleTrackingEnabled').checked = false;
  document.getElementById('pfSave').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.userProfile.cycleTrackingEnabled, false);
});

test('REAL invocation: pfSave persists an explicit opt-IN (checked box) into userProfile.cycleTrackingEnabled', async (assert)=>{
  const { document, window } = runJsdom(saveBodyHtml, saveStubGlobals, [pfSaveWiringSrc]);
  document.getElementById('pfCycleTrackingEnabled').checked = true;
  document.getElementById('pfSave').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.strictEqual(window.userProfile.cycleTrackingEnabled, true);
});

run();
