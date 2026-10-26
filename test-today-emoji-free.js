'use strict';
// v3.285 (finishing Today before the owner's approval): no decorative emoji on
// the Today screen. Covers what v3.273 did not reach: the setup buttons in the
// profile/program cards, the coach button (now the app's own chat-bubble
// outline, the same path as ICONS.chat), and the emoji prefix on seven Today's
// Priorities insights — whose bold labels already say what the emoji did.
// Functional glyphs on controls (⤵ drop-set, ▶ form video, ‹ › steppers) are
// rendered at runtime or aren't pictographic, and stay.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractFunction, extractConst, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-emoji-free.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
const EMOJI = /\p{Extended_Pictographic}/gu;
// Code without comments, so a comment that QUOTES an old emoji can't decide a check.
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// 2026-10-26 (v3.380): getSleepInsight was removed (Readiness covers short
// sleep; test-today-priorities.js), so the list is six getters now.
const INSIGHT_GETTERS = ['getDeloadInsight', 'getStaleRestingRegionInsight', 'getWeighInReminderInsight',
  'getWaterPaceInsight', 'getSessionHeadsUpInsight', 'getFoundationalStackNudgeInsight'];

test('REAL markup: no emoji anywhere in the Today screen\'s static markup (header, nav, the tab, both floating buttons)', (assert)=>{
  const roots = [document.querySelector('header'), document.querySelector('.nav-pills'), document.getElementById('todayView'),
                 document.getElementById('coachFab'), document.getElementById('todayFab')];
  assert.strictEqual(roots.filter(Boolean).length, 5, 'anchor: every root exists');
  const found = roots.flatMap(r => (r.textContent.match(EMOJI) || []));
  assert.deepStrictEqual(found, []);
});

test('REAL markup: the coach button draws the app\'s own chat-bubble path (identical to ICONS.chat), hidden from screen readers, and keeps its name', (assert)=>{
  const fab = document.getElementById('coachFab');
  assert.strictEqual(fab.getAttribute('aria-label'), 'Ask your coach');
  const svg = fab.querySelector('svg.coach-fab-icon');
  assert.ok(svg && svg.closest('[aria-hidden="true"]'), 'icon present and aria-hidden');
  const icons = new Function(`${extractConst(src, 'ICONS')}; return ICONS;`)();
  const want = new JSDOM(icons.chat).window.document.querySelector('path').getAttribute('d');
  assert.strictEqual(svg.querySelector('path').getAttribute('d'), want);
});

test('REAL markup: the setup buttons keep their words, minus the emoji', (assert)=>{
  const want = { switchProfileBtn: /^Switch profile/, printProgramBtn: /^Print my program/, exportDataBtn: /^Export my data/,
                 importDataBtn: /^Import backup/, verifyBackupBtn: /^Check a backup file/, customProgCreate: /^\+ Create program$/ };
  for(const [id, re] of Object.entries(want)) assert.match(document.getElementById(id).textContent.trim(), re, id);
});

test('REAL source, comments stripped: each insight getter leads with its bold label and carries no emoji', (assert)=>{
  for(const name of INSIGHT_GETTERS){
    const body = code(extractFunction(src, name));
    assert.deepStrictEqual(body.match(EMOJI) || [], [], `${name} still carries emoji`);
    const returns = body.split('\n').filter(l => /return `<b>/.test(l));
    assert.ok(returns.length >= 1, `${name}: expected a return that leads with <b> (anchor)`);
  }
});

test('REAL invocation: getWaterPaceInsight, driven at 14:00 behind pace, returns the hydration check with its label leading and no emoji', async (assert)=>{
  const { runJsdom } = require('./testHelpers.js');
  const { window } = runJsdom('', `
    var userProfile = {weight: 180};
    function computeWaterTarget(){ return 100; }
    async function getWaterIntake(){ return 10; }
    const RealDate = Date; Date = class extends RealDate { getHours(){ return 14; } };`,
    [extractFunction(src, 'getWaterPaceInsight'), 'window.__p = getWaterPaceInsight();']);
  const out = await window.__p;
  assert.strictEqual(out, '<b>Hydration check:</b> 10/100 oz so far today — behind pace for this time of day.');
});

test('REAL markup: the medical-program safety note keeps a warning cue, as the app\'s own outline icon (ICONS.warning), not an emoji', (assert)=>{
  const icons = new Function(`${extractConst(src, 'ICONS')}; return ICONS;`)();
  const want = new JSDOM(icons.warning).window.document.querySelector('path').getAttribute('d');
  const svg = document.querySelector('#medicalCard svg.inline-warning');
  assert.ok(svg && svg.getAttribute('aria-hidden') === 'true');
  assert.strictEqual(svg.querySelector('path').getAttribute('d'), want);
});

run();
