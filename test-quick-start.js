'use strict';
// v3.626 (BIZ-01): a three-question quick start before the first workout. On
// the first boot of a device's first profile (created this session per
// createNewUser's marker, nothing saved yet, one profile in the list, no
// training logged), the picker overlay asks goal, days a week and
// where you train. Finishing saves the goal (saveProfile), the days
// (saveDaysPerWeekPref) and the routed program (saveActiveProgram); Skip writes
// nothing. Routing (summit R9): recommendProgram's pick unless "gym" (lifting
// programs only), "home" (the equipment-free allow-list) or 3 days or fewer with Bodybuilding
// (the audit's F variant until BL-37) rules it out; then the best-scoring
// allowed program from scoreAllPrograms.
//
// Real invocation: the real createNewUser, showUserPicker, loadProfile,
// maybeStartQuickStart, the quick start's steps and routing, recommendProgram,
// scoreAllPrograms, saveDaysPerWeekPref, saveActiveProgram and saveProfile over
// the real programs and the real #userPickerOverlay markup. window.storage is a
// stub that records every key written; the two location.reload() calls are
// replaced (one site each, anchored) since jsdom can't reload.
//
// Sabotage: skip the recommendProgram call and criterion 2 fails.
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractConst, extractElementById } = require('./testHelpers.js');

const { test, run } = makeRunner('test-quick-start.js');
const src = readIndexSource();

const CREATE = extractFunction(src, 'createNewUser');
const CREATE_PATCHED = CREATE.replace('switchToUser(newId);', "rawSet('active-user', newId);");
const FINISH = extractFunction(src, 'finishQuickStart');
const FINISH_PATCHED = FINISH.replace('location.reload();', 'window.__reloaded = true;');

function boot({users = [], create = 'Alex', stored = {}, activityDates = null} = {}){
  const dom = new JSDOM(`<!DOCTYPE html><body>${extractElementById(src, 'userPickerOverlay')}</body>`, {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const setup = `
    window.__writes = [];
    function bumpExCorpusGen(){} function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
    function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
    localStorage.setItem('trainingLog_user-list', ${JSON.stringify(JSON.stringify(users))});
    ${users.length ? `localStorage.setItem('trainingLog_active-user', ${JSON.stringify(users[0].id)});` : ''}
    function invalidateFoodPrefCache(){} async function getCurrentTrendStatus(){ return null; }
    function getTodayKey(){ return '2026-11-23'; }
    var profileBodySaved = false, activeProgram = 'strength', daysPerWeekPref = null;
    var userProfile = {name: '', age: 30, gender: 'other', goal: 'maintain', bodyGoal: '', conditions: []};`;
  const chunks = [extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'), extractConst(src, 'GOAL_LABELS'), extractConst(src, 'programs'), extractConst(src, 'PROGRAM_FIT_SCORES'),
    extractConst(src, 'HIGH_INTENSITY_PROGRAMS'), extractConst(src, 'RECOVERY_FRIENDLY_PROGRAMS'), extractConst(src, 'TREND_INTENSITY_BOOST'), extractConst(src, 'TREND_INTENSITY_CUT'),
    extractConst(src, 'TREND_RECOVERY_BOOST'), extractConst(src, 'CURRENT_PROGRAM_TREND_BOOST'), extractConst(src, 'VOLUME_MODIFIER_PROGRAMS'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'),
    extractConst(src, 'STYLE_KEY_FOR_PROGRAM'), extractConst(src, 'STYLE_RECOMMENDATIONS'), extractConst(src, 'NEW_PROFILE_SESSION_KEY'), extractConst(src, 'QUICK_START_HOME_PROGRAMS'),
    ...['rawGet', 'rawSet', 'getUserList', 'setUserList', 'escapeHtml', 'showUserPicker', 'hideUserPicker', 'isCustomProgramKey', 'saveProfile', 'loadProfile',
      'saveDaysPerWeekPref', 'saveActiveProgram', 'scoreAllPrograms', 'recommendStyle', 'recommendProgram',
      'profileJustCreated', 'quickStartSteps', 'quickStartAllows', 'quickStartProgram', 'renderQuickStartStep', 'showQuickStart', 'closeQuickStart', 'maybeStartQuickStart'].map(f => extractFunction(src, f)),
    CREATE_PATCHED, FINISH_PATCHED, 'let quickStartAnswers = null, profileWasFresh = false;',
    "document.getElementById('quickStartSkip').addEventListener('click', closeQuickStart);",
    `${create && !users.length ? `createNewUser(${JSON.stringify(create)});` : ''}
     var activeUserId = rawGet('active-user');
     // The real namespaced storage (it throws 'not found' for a key never written), wrapped only to record writes.
     const __pre = 'trainingLog_usr' + activeUserId + ':';
     for(const [k, v] of Object.entries(${JSON.stringify(Object.assign({}, stored, activityDates ? {'activity-dates': JSON.stringify(activityDates)} : {}))})) localStorage.setItem(__pre + k, v);
     const __real = buildNamespacedStorage(activeUserId);
     window.storage = { get: k => __real.get(k), set: async (k, v) => { window.__writes.push(k); return __real.set(k, v); },
       delete: async k => { window.__writes.push(k); return __real.delete(k); }, list: p => __real.list(p) };
     window.__store = new Proxy({}, { get: (t, k) => localStorage.getItem(__pre + String(k)), has: (t, k) => localStorage.getItem(__pre + String(k)) !== null,
       ownKeys: () => Object.keys(localStorage).filter(x => x.startsWith(__pre)).map(x => x.slice(__pre.length)),
       getOwnPropertyDescriptor: () => ({enumerable: true, configurable: true}) });
     window.__boot = (async () => { await loadProfile(); window.__bootWrites = window.__writes.slice(); return maybeStartQuickStart(); })();`];
  const el = w.document.createElement('script');
  el.textContent = [setup, ...chunks].join('\n\n');
  w.document.body.appendChild(el);
  return w;
}
const tick = () => new Promise(r => setTimeout(r, 30));
async function answer(w, goal, days, where){
  for(const v of [goal, String(days), where]){
    const btn = [...w.document.querySelectorAll('#quickStartOptions .quick-start-option')].find(b => b.dataset.value === v);
    if(!btn) throw new Error('no option ' + v + ' in ' + w.document.getElementById('quickStartTitle').textContent);
    btn.click();
  }
  await tick();
}

test('anchors: the two reload sites the fixture replaces each exist exactly once', (assert)=>{
  assert.strictEqual(CREATE.split('switchToUser(newId);').length - 1, 1);
  assert.strictEqual(FINISH.split('location.reload();').length - 1, 1);
  assert.notStrictEqual(CREATE_PATCHED, CREATE); assert.notStrictEqual(FINISH_PATCHED, FINISH);
});

test('criterion 1: with an empty user list, creating a profile shows quick-start step 1; with an existing user list, switching users shows none', async (assert)=>{
  const w = boot();
  assert.strictEqual(await w.__boot, true);
  const ov = w.document.getElementById('userPickerOverlay');
  assert.ok(ov.classList.contains('active') && ov.classList.contains('quick-start-mode'));
  assert.strictEqual(w.document.getElementById('quickStart').hidden, false);
  assert.strictEqual(w.document.getElementById('quickStartStep').textContent, 'Step 1 of 3');
  assert.strictEqual(w.document.getElementById('quickStartTitle').textContent, "What's your goal?");
  assert.strictEqual(w.document.querySelectorAll('#quickStartOptions .quick-start-option').length, 6, 'the existing goal options');
  // Switching to an existing user (a saved profile).
  const sw = boot({users: [{id: '1', name: 'Jordan'}], stored: {'user-profile': JSON.stringify({name: 'Jordan', goal: 'gain'})}});
  assert.strictEqual(await sw.__boot, false);
  assert.ok(!sw.document.getElementById('userPickerOverlay').classList.contains('active'));
  // A second profile on a shared device, and a profile with training already logged, don't get it either.
  const second = boot({users: [{id: '1', name: 'Jordan'}, {id: '2', name: 'Sam'}]});
  assert.strictEqual(await second.__boot, false);
  const trained = boot({users: [{id: '1', name: 'Jordan'}], activityDates: ['2026-11-20']});
  assert.strictEqual(await trained.__boot, false);
});

test('criterion 2: goal "lose", 3 days, "home" sets the goal, daysPerWeekPref 3, and activeProgram to exactly the real recommendProgram\'s pick', async (assert)=>{
  const w = boot();
  await w.__boot;
  await answer(w, 'lose', 3, 'home');
  assert.strictEqual(w.eval('userProfile.goal'), 'lose');
  assert.strictEqual(w.eval('daysPerWeekPref'), 3);
  const rec = await w.eval('recommendProgram(userProfile)');
  assert.strictEqual(w.eval('activeProgram'), rec.key, 'the real function\'s return (' + rec.key + ')');
  assert.strictEqual(w.__reloaded, true, 'it boots into the program');
  assert.ok(!w.document.getElementById('userPickerOverlay').classList.contains('active'));
});

test('criterion 3: Skip leaves activeProgram "strength" and daysPerWeekPref null, and writes nothing', async (assert)=>{
  const w = boot();
  await w.__boot;
  const before = w.__writes.length;
  w.document.getElementById('quickStartSkip').click();
  await tick();
  assert.strictEqual(w.eval('activeProgram'), 'strength');
  assert.strictEqual(w.eval('daysPerWeekPref'), null);
  assert.strictEqual(w.__writes.length, before, 'no writes');
  assert.ok(!w.document.getElementById('userPickerOverlay').classList.contains('active'));
  assert.notStrictEqual(w.__reloaded, true);
  assert.strictEqual(w.sessionStorage.getItem('trainingLog_new-profile'), null, 'asked once: the marker is gone, so it won\'t come back even if nothing was saved');
});

test('the trigger is the real createNewUser\'s session marker: a profile that never saved the form but wasn\'t created this session (an upgrade) gets no quick start', async (assert)=>{
  const w = boot();
  assert.strictEqual(w.sessionStorage.getItem('trainingLog_new-profile'), w.eval('activeUserId'), 'anchor: the real marker');
  const upgraded = boot({users: [{id: '1', name: 'Jordan'}]}); // one profile, nothing saved, no marker
  assert.strictEqual(await upgraded.__boot, false);
});

test('a11y: in quick-start mode the dialog is named by the visible question; back to "Who\'s training?" after', async (assert)=>{
  const w = boot();
  await w.__boot;
  const ov = w.document.getElementById('userPickerOverlay');
  assert.strictEqual(ov.getAttribute('aria-labelledby'), 'quickStartTitle');
  w.document.getElementById('quickStartSkip').click();
  assert.strictEqual(ov.getAttribute('aria-labelledby'), 'userPickerTitle');
});

test('criterion 4: the quick start writes only the existing keys (profile, days-per-week-pref, active-program, and saveActiveProgram\'s own program-cycle-start)', async (assert)=>{
  const w = boot();
  await w.__boot;
  const keysBefore = Object.keys(w.__store).sort();
  const writesBefore = w.__writes.length;
  await answer(w, 'gain', 4, 'gym');
  const written = [...new Set(w.__writes.slice(writesBefore))].sort();
  assert.strictEqual(JSON.stringify(written), JSON.stringify(['active-program', 'days-per-week-pref', 'program-cycle-start', 'user-profile']));
  const added = Object.keys(w.__store).filter(k => !keysBefore.includes(k)).sort();
  assert.ok(added.every(k => ['active-program', 'days-per-week-pref', 'program-cycle-start', 'user-profile'].includes(k)), added.join());
});

test('R9 routing: "gym" stays on lifting programs (never Jump Rope for "lose"); "gain" with 3 days or fewer never lands on Bodybuilding; "home" only on the equipment-free allow-list', async (assert)=>{
  const route = async (goal, days, where) => { const w = boot(); await w.__boot; await answer(w, goal, days, where); return w.eval('activeProgram'); };
  const lifting = ['strength', 'bodybuilding', 'powerbuilding', 'powerlifting'];
  const home = ['bodyweight', 'calisthenics', 'jumprope', 'core', 'mobility', 'yoga', 'pilates', 'athletic', 'running', 'desk', 'senior'];
  const w0 = boot(); await w0.__boot;
  for(const k of ['oly', 'swimming', 'cycling', 'climbing', 'hyrox', 'combat']) assert.strictEqual(w0.eval(`quickStartAllows('${k}', 4, 'home')`), false, k + ' needs equipment');
  for(const goal of ['lose', 'gain', 'recomp', 'leanbulk', 'maintain', 'performance']){
    const g = await route(goal, 4, 'gym');
    assert.ok(lifting.includes(g), `${goal}/gym → ${g}`);
    const h = await route(goal, 4, 'home');
    assert.ok(home.includes(h), `${goal}/home → ${h}`);
  }
  for(const days of [2, 3]) assert.notStrictEqual(await route('gain', days, 'gym'), 'bodybuilding', `gain/${days}/gym`);
  assert.strictEqual(await route('gain', 4, 'gym'), 'bodybuilding', 'anchor: 4 days, the recommendation stands');
});

run();
