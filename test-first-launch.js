'use strict';
// First launch (owner: "Let's do them all", after a review).
//
// v3.467 — No half a choice. With no profiles on the device the picker said
// "No profiles on this device yet — create the first one below", then
// "— or —" with nothing above it to choose. On a first launch the list and
// the divider both stay out; with profiles, both show as before.
const { makeRunner, readIndexSource, extractFunction, extractConst, extractElementById, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-first-launch.js');
const src = readIndexSource();

function picker(users){
  const { window } = runJsdom(extractElementById(src, 'userPickerOverlay'), `
    window.getUserList = () => ${JSON.stringify(users)};
    window.activeUserId = ${users.length ? "'1'" : 'null'};
    window.switchToUser = () => {};`,
    [extractFunction(src, 'escapeHtml'), extractFunction(src, 'showUserPicker'), 'showUserPicker();']);
  return window.document;
}

test('REAL invocation (v3.467): first launch shows only the create form, no empty list and no "or"', (assert)=>{
  const doc = picker([]);
  assert.strictEqual(doc.querySelector('.user-picker-divider').hidden, true);
  assert.strictEqual(doc.getElementById('userPickerList').textContent.trim(), '');
  assert.ok(doc.getElementById('newUserNameInput'), 'anchor: the create form is there');
});

test('REAL invocation (v3.467): with profiles, the list and the divider show', (assert)=>{
  const doc = picker([{id:'1', name:'Jordan'}, {id:'2', name:'Sam'}]);
  assert.strictEqual(doc.querySelector('.user-picker-divider').hidden, false);
  assert.deepStrictEqual([...doc.querySelectorAll('.user-pick-btn')].map(b => b.textContent), ['Jordan', 'Sam']);
});

// v3.624 (BIZ-02) — One name, asked once. The name typed at "Who's training?"
// went only into the user list, so the header kept saying "Set up your profile"
// and Getting Started stayed unticked. Now loadProfile fills an empty
// userProfile.name from the active user-list entry, once, through saveProfile.
// Real invocation: the real createNewUser (writing the real user list through
// rawSet to localStorage), then the boot path's real loadProfile, renderHeader
// and renderOnboardingCard over the real header and Getting Started markup.
// window.storage is stubbed at the boundary (it is the per-user namespace).
// Sabotage: remove the fill and criterion 1 fails.
// createNewUser's reload is replaced by the boot below; the anchor fails loudly if that line ever changes.
const CREATE = extractFunction(src, 'createNewUser');
const CREATE_PATCHED = CREATE.replace('switchToUser(newId);', "rawSet('active-user', newId); /* switchToUser reloads: the boot below is that reload */");
function boot({typed = 'Alex', stored = null, existing = [], readThrows = false} = {}){
  const html = '<div id="headerEyebrow"></div><div id="headerSub"></div>' + extractElementById(src, 'onboardingCard');
  // Its own JSDOM with a URL: rawGet/rawSet need a real localStorage (runJsdom's origin is opaque).
  const runWithStorage = (body, setup, chunks) => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(`<!DOCTYPE html><body>${body}</body>`, { runScripts: 'dangerously', url: 'https://platestep.test/' });
    const el = dom.window.document.createElement('script');
    el.textContent = [setup, ...chunks].join('\n\n');
    dom.window.document.body.appendChild(el);
    return { window: dom.window };
  };
  const { window } = runWithStorage(html, `
    window.__saves = []; window.__store = ${JSON.stringify(stored ? {'user-profile': JSON.stringify(stored)} : {})};
    window.storage = { get: async k => { if(${readThrows} && k === 'user-profile') throw new Error('storage'); return k in window.__store ? {value: window.__store[k]} : null; },
      set: async (k, v) => { window.__saves.push(k); window.__store[k] = v; } };
    localStorage.setItem('trainingLog_user-list', ${JSON.stringify(JSON.stringify(existing))});
    function icon(){ return '<svg></svg>'; } function invalidateFoodPrefCache(){}
    var profileBodySaved = false;`,
    [extractConst(src, 'RAW_PREFIX'), extractConst(src, 'APP_NAME'), extractConst(src, 'GOAL_LABELS'),
     ...['rawGet', 'rawSet', 'getUserList', 'setUserList', 'escapeHtml', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'getMilestone', 'saveProfile', 'loadProfile', 'renderHeader', 'renderOnboardingCard'].map(f => extractFunction(src, f)),
     CREATE_PATCHED,
     `var weightUnit = 'lb', LB_PER_KG = 0.453592;
      var userProfile = {name: '', goal: 'maintain', heightFt: 5, heightIn: 10, weight: 180};
      ${typed ? `createNewUser(${JSON.stringify(typed)});` : ''}
      var activeUserId = rawGet('active-user') || (getUserList()[0] || {}).id;
      window.__boot = (async () => { await loadProfile(); renderHeader(); await renderOnboardingCard(); })();`]);
  return window;
}

test('BIZ-02 criterion 1: after creating "Alex", userProfile.name is "Alex" (written once through saveProfile) and #headerEyebrow says Alex', async (assert)=>{
  const w = boot();
  await w.__boot;
  assert.strictEqual(w.eval('getUserList()').map(u => u.name).join(), 'Alex', 'anchor: the real createNewUser wrote the list');
  assert.strictEqual(w.eval('userProfile.name'), 'Alex');
  assert.match(w.document.getElementById('headerEyebrow').textContent, /^Alex · /);
  assert.strictEqual(JSON.stringify(w.__saves), JSON.stringify(['user-profile']), 'one write, through saveProfile');
  assert.strictEqual(JSON.parse(w.__store['user-profile']).name, 'Alex');
});

test('BIZ-02 criterion 2: a profile whose name was already set keeps it (and nothing is written)', async (assert)=>{
  const w = boot({stored: {name: 'Alexander', goal: 'gain'}});
  await w.__boot;
  assert.strictEqual(w.eval('userProfile.name'), 'Alexander');
  assert.match(w.document.getElementById('headerEyebrow').textContent, /^Alexander · /);
  assert.strictEqual(w.__saves.length, 0);
});

test('BIZ-02 criterion 3: Getting Started\'s "Set up your profile" row renders .done', async (assert)=>{
  const w = boot();
  await w.__boot;
  const rows = [...w.document.querySelectorAll('#onboardingRows .onboarding-row')];
  const row = rows.find(r => /Set up your profile/.test(r.textContent));
  assert.ok(row, 'anchor: the row');
  assert.ok(row.classList.contains('done'));
});

test('BIZ-02 anchor: the fixture really replaced createNewUser\'s reload (one site)', (assert)=>{
  assert.strictEqual(CREATE.split('switchToUser(newId);').length - 1, 1);
  assert.notStrictEqual(CREATE_PATCHED, CREATE);
});

test('BIZ-02 review: a saved profile with no name (cleared on purpose, or migrated as "Me") is left alone; so is a failed read (no defaults written over it)', async (assert)=>{
  const cleared = boot({stored: {name: '', age: 41, weight: 210}});
  await cleared.__boot;
  assert.strictEqual(cleared.eval('userProfile.name'), '', 'a name cleared on purpose stays cleared');
  assert.strictEqual(cleared.__saves.length, 0);
  const migrated = boot({typed: '', existing: [{id: '1', name: 'Me'}], stored: {name: '', age: 52}});
  await migrated.__boot;
  assert.strictEqual(migrated.eval('userProfile.name'), '', 'not "Me"');
  const failed = boot({readThrows: true});
  await failed.__boot;
  assert.strictEqual(failed.__saves.length, 0, 'nothing written after a failed read');
  assert.strictEqual(failed.eval('userProfile.name'), '');
});

test('BIZ-02: on a shared device, each profile takes its own name (the active entry, not the first)', async (assert)=>{
  const w = boot({typed: 'Sam', existing: [{id: '1', name: 'Jordan'}]});
  await w.__boot;
  assert.strictEqual(w.eval('getUserList()').length, 2);
  assert.strictEqual(w.eval('userProfile.name'), 'Sam');
});

run();
