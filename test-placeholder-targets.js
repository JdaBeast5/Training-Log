'use strict';
// v3.573 (BIZ-03): placeholder calorie targets say they are placeholders.
// Under the calorie hero, #calHeroEstimate reads "Estimate for a 30-year-old,
// 5'8", 160 lb. Add yours in Profile." while age and height still equal the
// defaults AND the profile form has never been saved (the window.storage flag
// profile-body-saved, set only by #pfSave). The targets don't change.
//
// Real invocation: the real computeTargets, renderCalHero, applyTargetsToUI,
// loadProfile, fmtWeight and the real #pfSave click wiring (its render chain
// stubbed, as test-profile-save-zero-value.js does), with the real #calHero
// markup and a stub window.storage.
//
// Sabotage: drop the flag check and criterion 2's second half fails; always
// hide the line and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-placeholder-targets.js');

function wiring(id){
  const start = src.indexOf(`document.getElementById('${id}').addEventListener('click', async ()=>{`);
  return src.slice(start, src.indexOf('\n});', start) + 4);
}
const USER_PROFILE = /^let userProfile = \{[\s\S]*?\n\};/m.exec(src)[0];
const FLAG_LET = 'let profileBodySaved = false;';
if(!src.includes(FLAG_LET)) throw new Error('profileBodySaved not found');
const FIELDS = ['pfName', 'pfAge', 'pfGender', 'pfHeightFt', 'pfHeightIn', 'pfWeight', 'pfGoalWeight', 'pfActivity', 'pfGoal', 'pfBodyGoal',
  'pfCycleTrackingEnabled', 'pfGlutenFree', 'pfDairyFree', 'pfNutFree', 'pfHalal', 'pfKosher', 'pfAvoidFoods', 'pfDietaryPreference'];
const CHECKS = ['pfCycleTrackingEnabled', 'pfGlutenFree', 'pfDairyFree', 'pfNutFree', 'pfHalal', 'pfKosher'];
const SELECTS = {pfGender: 'male', pfActivity: '1.375', pfGoal: 'maintain', pfBodyGoal: '', pfDietaryPreference: ''};
const form = FIELDS.map(id => CHECKS.includes(id) ? `<input type="checkbox" id="${id}">`
  : id in SELECTS ? `<select id="${id}"><option value="${SELECTS[id]}" selected>x</option></select>` : `<input id="${id}">`).join('');

async function mount({store = {}, eaten = 0} = {}){
  const markup = '<div id="calorieFloorNote"></div>' + extractElementById(src, 'calHero') + extractElementById(src, 'calHeroEstimate') + form + '<button id="pfSave"></button><div id="pfStatus"></div><div id="profileHeader" class="open"></div><div id="profileExpandWrap" class="open"></div>';
  const { window } = runJsdom(markup, `
    window.__store = ${JSON.stringify(store)};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    var weightUnit = 'lb', activeUserId = null, targets = null;
    function getUserList(){ return []; } // 2026-11-22 (v3.624, BIZ-02): loadProfile reads the picker's name (test-first-launch.js); no profiles here
    function profileJustCreated(){ return false; } // 2026-11-23 (v3.625): no profile created this session here
    function invalidateFoodPrefCache(){} function readConditionSelections(){ return []; }
    function renderHeader(){} function renderProfileSummary(){} function renderOnboardingCard(){} async function getCurrentTrendStatus(){ return null; }
    async function renderProgramRec(){} async function renderProgramSelector(){} function renderWorkout(){} function renderWater(){} function renderCycleTracking(){}
    function toggleConditionTrackerCards(){} function renderTodayInsights(){} function loadFoodLog(){} function updateHideAvoidedToggleVisibility(){} function renderFoodItems(){}`,
    [USER_PROFILE, FLAG_LET, extractConst(src, 'LB_PER_KG'),
     ...['computeTargets', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'toCanonicalLb', 'readValidAge', 'readGoalWeight', 'loadProfile', 'saveProfile', 'isPlaceholderBody' /* v3.577 */, 'renderCalHero', 'applyTargetsToUI'].map(f => extractFunction(src, f)),
     wiring('pfSave'),
     `window.__boot = (async () => { await loadProfile(); targets = computeTargets(userProfile); document.getElementById('calHero').dataset.eaten = '${eaten}'; applyTargetsToUI(); })();
      window.__state = () => ({profile: userProfile, cal: computeTargets(userProfile).cal});`]);
  await window.__boot;
  const $ = id => window.document.getElementById(id);
  const save = async (values) => {
    for(const [id, v] of Object.entries(values)) $(id).value = v;
    $('pfSave').click();
    for(let i = 0; i < 20 && !window.__store['profile-body-saved']; i++) await new Promise(r => setTimeout(r, 5));
  };
  return {window, $, save, line: () => ({hidden: $('calHeroEstimate').hidden, text: $('calHeroEstimate').textContent}),
    num: () => Number($('calHeroNum').textContent), state: () => window.__state()};
}

test('criteria 1 and 5: default profile, no flag: the line shows "Estimate for a 30-year-old, 5\'8", 160 lb"; the number is unchanged', async (assert)=>{
  const ui = await mount({eaten: 400});
  assert.deepStrictEqual(ui.line(), {hidden: false, text: 'Estimate for a 30-year-old, 5\'8", 160 lb. Add yours in Profile.'});
  assert.strictEqual(ui.num(), ui.state().cal - 400);
});

test('criterion 2: a real #pfSave click sets the flag and hides the line, with age 41 and also with the defaults kept', async (assert)=>{
  const a = await mount();
  await a.save({pfAge: '41', pfHeightFt: '5', pfHeightIn: '8'});
  assert.strictEqual(a.window.__store['profile-body-saved'], '1');
  assert.strictEqual(a.line().hidden, true);
  assert.strictEqual(a.num(), a.state().cal, 'criterion 5 after the save');
  const b = await mount();
  await b.save({pfAge: '30', pfHeightFt: '5', pfHeightIn: '8'});
  assert.deepStrictEqual([b.state().profile.age, b.state().profile.heightFt, b.state().profile.heightIn], [30, 5, 8], 'anchor: the defaults were kept');
  assert.strictEqual(b.line().hidden, true, 'the flag alone hides it');
});

test('criterion 3: default age and height, no flag, a weigh-in of 182 lb: the line names 182 lb', async (assert)=>{
  const ui = await mount({store: {'user-profile': JSON.stringify({age: 30, heightFt: 5, heightIn: 8, weight: 182})}});
  assert.strictEqual(ui.line().hidden, false);
  assert.match(ui.line().text, /182 lb/);
});

test('criterion 4: a stored profile with age 37 and no flag (an existing user) gets no line; neither does a stored flag', async (assert)=>{
  const ui = await mount({store: {'user-profile': JSON.stringify({age: 37, heightFt: 5, heightIn: 8, weight: 175})}, eaten: 1200});
  assert.strictEqual(ui.line().hidden, true);
  assert.strictEqual(ui.num(), ui.state().cal - 1200);
  const flagged = await mount({store: {'profile-body-saved': '1'}});
  assert.strictEqual(flagged.line().hidden, true);
});

run();
