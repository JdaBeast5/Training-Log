'use strict';
// v3.653 (UX-17b, owner 2026-11-24: "I think we can get rid of gym mode, the
// new set up does very well"): Gym mode is gone. Today does its job: the
// cover's next set and Log set, the rest timer on the cover, warm-ups in the
// open exercise (UX-17a). Removed: the Then head's Gym mode button, the dock,
// the "Switch to gym mode?" offer, its auto-enter, the session clock and the
// restore on boot. `?view=gym` opens Today. The gym-session and gym-auto keys
// are no longer read; nothing removes them (no migration).
//
// Real invocations: the real body markup of index.html; the real
// launchViewFromUrl and restoreActiveView with the real switchView (it stores
// active-view); the real init sequence's text for what boot calls. Boot itself
// with a live gym-session stored was run in Chromium on the harness fixture
// (see the PR): no error, no gym-mode class, the cover rendered.
//
// Sabotage: restore the restoreGymMode() call in init and criterion 3 fails;
// put the Gym mode button back and criterion 2 fails; send ?view=gym to a
// flag instead of Today and criterion 4 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-gym-mode-removed.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// Source without comments, line by line: a comment that names a function must
// not count as a call.
// Inline scripts only: the Gym mode CSS (and its comments) goes in UX-17c.
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const code = scripts.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).map(l => l.replace(/\s\/\/ .*$/, '')).join('\n');

test('criterion 2: the rendered body has no Gym mode button, dock or offer', (assert)=>{
  const doc = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document;
  assert.ok(doc.getElementById('upNextLog') && doc.getElementById('exerciseList'), 'anchor: the real Today markup');
  for(const sel of ['#gymEnterBtn', '#gymDock', '#gymOffer', '#gymLogBtn', '#gymExitBtn', '#gymClock', '.gym-enter-btn', '.gym-dock', '.gym-offer'])
    assert.strictEqual(doc.querySelectorAll(sel).length, 0, sel);
});

test('criterion 2: no script declares or calls the Gym mode functions, or reads its state', (assert)=>{
  assert.ok(code.split('\n').length > 30000 && code.includes('function renderWorkout(') && code.includes('function renderAppFooter('), 'anchor: the stripped scripts keep the whole app (' + code.split('\n').length + ' lines)');
  for(const name of ['enterGymMode', 'exitGymMode', 'finishGymWorkout', 'restoreGymMode', 'loadGymPrefs', 'maybeOfferGymMode', 'answerGymOffer',
    'wireGymMode', 'refreshGymDock', 'refreshGymLogBtn', 'gymElapsedMs', 'openFirstIncompleteExercise', 'pendingWarmupChip', 'hideGymOffer', 'showGymOffer'])
    assert.strictEqual((code.match(new RegExp('\\b' + name + '\\b', 'g')) || []).length, 0, name);
  assert.strictEqual((code.match(/\bgymModeActive\b|\bpendingGymMode\b/g) || []).length, 0, 'no gym state');
  assert.strictEqual((code.match(/classList\.contains\('gym-mode'\)|classList\.(add|toggle)\('gym-mode'/g) || []).length, 0, 'no script sets or reads the gym-mode class');
});

test('criterion 3: boot never reads gym-session or gym-auto, so stored values (a live session, auto-enter on) change nothing', (assert)=>{
  const start = src.indexOf('(async function init(){');
  assert.ok(start > 0, 'anchor: init found');
  const init = src.slice(start, src.indexOf('\n  })();', start));
  assert.match(init, /await restoreActiveView\(\);/, 'anchor: the boot sequence');
  assert.ok(!/restoreGymMode|loadGymPrefs|wireGymMode/.test(init), 'init calls none of them');
  assert.strictEqual((code.match(/'gym-session'|'gym-auto'|GYM_SESSION_KEY|GYM_AUTO_KEY/g) || []).length, 0, 'no reader of either key anywhere');
  // A set logged on Today offers nothing: the save path's offer call is gone.
  assert.ok(/noteWorkoutActivity\(\);\s*checkAllSetsCompleteAndAutoCheck\(row, block, exIdx\);/.test(code), 'anchor: the set-save path');
});

// The real switchView, as test-view-switch-crossfade.js runs it.
const SWITCH = [extractConst(src, 'STAGGER_MAX_STEPS'), extractConst(src, 'STAGGER_STEP_MS'), extractConst(src, 'MOVED_TO_MORE'),
  ...['clearViewEnter', 'scrollAppToTop', 'switchView'].map(n => extractFunction(src, n)), extractConst(src, 'TODAY_CHROME_MOVES'),
  extractFunction(src, 'syncTodayChrome'), extractConst(src, 'VIEW_KEYS'), extractFunction(src, 'launchViewFromUrl'), extractFunction(src, 'restoreActiveView')];
const VIEWS = ['today', 'log', 'analysis', 'history', 'care', 'coach', 'learn'];
const BODY = VIEWS.map(v => `<div id="${v}View"></div>`).join('') + ['Today', 'Log', 'Analysis', 'History', 'Care', 'Coach', 'Learn', 'More'].map(n => `<button id="nav${n}"></button>`).join('')
  + '<div id="stickyDayHeader"></div><div id="logDateBar"></div>';

test('criterions 3 and 4: with a live gym-session and gym-auto stored, ?view=gym opens Today (the real launchViewFromUrl, restoreActiveView and switchView); active-view is stored as today; the query is consumed', async (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><body>${BODY}</body>`, { runScripts: 'dangerously', url: 'https://example.test/index.html?view=gym' });
  const w = dom.window;
  w.eval(`
    // A live gym session from today and auto-enter on, as an old install has them.
    window.__store = {'active-view': 'history', 'gym-session': JSON.stringify({date: '2026-11-02', accumMs: 0, startedAt: Date.now() - 23 * 60000}), 'gym-auto': '1'};
    window.storage = { get: async k => k in window.__store ? {value: window.__store[k]} : null, set: async (k, v) => { window.__store[k] = v; } };
    window.renderLogDateBar = ()=>{}; window.matchMedia = window.matchMedia || (()=> ({matches:false})); window.scrollTo = ()=>{};
    window.__rendered = [];
    var VIEW_RENDERERS = new Proxy({}, {get: (t, k) => () => window.__rendered.push(k)});
    function showView(key, opts){ switchView(key, opts); const r = VIEW_RENDERERS[key]; if(r) r(); }
  ` + SWITCH.join('\n'));
  await w.eval('restoreActiveView()');
  assert.deepStrictEqual(Array.from(w.__rendered), ['today'], 'Today, not the stored History');
  assert.strictEqual(w.__store['active-view'], 'today', 'stored as today (never "gym")');
  assert.strictEqual(w.location.search, '', 'the query is consumed');
  assert.ok(!w.document.body.classList.contains('gym-mode'), 'criterion 3: the stored gym session and auto-enter change nothing');
  assert.strictEqual(w.__store['gym-session'].length > 0 && w.__store['gym-auto'], '1', 'and are left as they were (no migration)');
});

// v3.654 (UX-17c): Gym mode's CSS goes too. The Today rules that were scoped
// body:not(.gym-mode) keep their specificity as ":root body" (see the comment
// at the flat-ground token block), so no rule loses to one it used to beat.
// Sabotage: put one body.gym-mode rule back and this fails.
test('UX-17c criterion 7: no CSS rule, token or keyframes names gym mode (CSSOM count 0); the old scope became :root body', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const sels = [], names = [];
  const walk = l => { for(const r of l){ if(r.selectorText) sels.push(r.selectorText); if(r.name) names.push(r.name); if(r.style) for(let i = 0; i < r.style.length; i++) names.push(r.style[i]); if(r.cssRules) walk(r.cssRules); } };
  walk(window.document.styleSheets[0].cssRules);
  assert.ok(sels.length > 1500, 'anchor: the whole stylesheet parsed (' + sels.length + ' rules)');
  const gym = sels.filter(x => /gym-mode|gym-leaving|gym-finishing|\.gym-dock|\.gym-offer|\.gym-enter|#gym[A-Z]|\.gym-/.test(x));
  assert.deepStrictEqual(gym, [], 'no gym selector');
  assert.deepStrictEqual(names.filter(n => /gym/i.test(n)), [], 'no gym keyframes or custom properties');
  const noComments = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/gym/i.test(noComments), 'the word is gone from the CSS itself (comments aside)');
  assert.ok(sels.includes(':root body'), 'the flat-ground token block keeps its (0,1,1) specificity as :root body');
  assert.ok(sels.some(x => x === ':root body .rest-timer .rest-timer-ring-progress'), 'anchor: a scoped Today rule, as :root body');
});

run();
