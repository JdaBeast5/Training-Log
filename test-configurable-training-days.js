'use strict';
// Behavioral coverage for configurable training days/week — new feature,
// pilot scope agreed with the user: strength + bodybuilding only. Every
// other program's `days` must stay completely untouched by this feature;
// several tests below exist specifically to prove that containment, not
// just that the pilot programs regenerate correctly.
//
// buildDaysForWeek/daysPerWeekCycle/daysPerWeekInterleave are pure functions
// over a program's own authored `days` (partitioned by the `rest` flag
// those days already carry) — they never invent exercise content, only
// decide how many of a program's own training/rest days appear and in what
// order. Tested here as real invocations against the actual authored
// `strength`/`bodybuilding` data (via extractConst(src, 'programs')), not a
// hand-rolled fixture, so a change to that content that breaks the
// train/rest partition would be caught here too.
//
// The delegated #daysPerWeekInput change-listener wiring itself is
// deliberately NOT unit-tested, matching this project's own established
// choice for this exact class of simple preference-toggle wiring (see
// test-manual-deload-override.js's identical note) — verified live in a
// browser instead. Every function that listener calls (load/save pref,
// applyDaysPerWeekProgramData, buildDaysForWeek, the warning logic) IS
// tested here via real invocation.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const pureChunks = [
  extractConst(src, 'programs'),
  extractConst(src, 'DAYS_PER_WEEK_PROGRAMS'),
  extractConst(src, 'DAYS_PER_WEEK_ORIGINAL'),
  extractConst(src, 'DAYS_PER_WEEK_FALLBACK_REST'),
  extractFunction(src, 'daysPerWeekCycle'),
  extractFunction(src, 'daysPerWeekInterleave'),
  extractFunction(src, 'daysPerWeekTrainCount'),
  extractFunction(src, 'buildDaysForWeek'),
  extractFunction(src, 'daysPerWeekWarningState'),
];

const { test, run } = makeRunner('test-configurable-training-days.js');

test('strength authored data: exactly 5 training-day templates, 2 rest-day templates (the split this whole feature is built on)', (assert)=>{
  const [count] = runSandbox(pureChunks, `__capture.push(daysPerWeekTrainCount('strength'));`);
  assert.strictEqual(count, 5);
});

test('bodybuilding authored data: also 5 training-day templates, 2 rest', (assert)=>{
  const [count] = runSandbox(pureChunks, `__capture.push(daysPerWeekTrainCount('bodybuilding'));`);
  assert.strictEqual(count, 5);
});

test('buildDaysForWeek(strength, 5) — matching the program\'s own authored count — reproduces the exact same set of days, just possibly reordered', (assert)=>{
  const [built, originalSubs] = runSandbox(pureChunks, `
    function subsOf(d){ return Object.values(d).map(x=>x.sub).sort(); }
    __capture.push(subsOf(buildDaysForWeek('strength', 5)));
    __capture.push(subsOf(DAYS_PER_WEEK_ORIGINAL.strength));
  `);
  assert.deepStrictEqual(built, originalSubs);
});

test('buildDaysForWeek(strength, 4) — fewer days than authored — produces exactly 4 UNIQUE training days and 7 total slots, no duplicates', (assert)=>{
  const [days] = runSandbox(pureChunks, `__capture.push(buildDaysForWeek('strength', 4));`);
  assert.strictEqual(Object.keys(days).length, 7, 'always exactly d1..d7');
  const trainSubs = Object.values(days).filter(d=>!d.rest).map(d=>d.sub);
  assert.strictEqual(trainSubs.length, 4);
  assert.strictEqual(new Set(trainSubs).size, 4, 'no repeated training day within the week');
});

test('buildDaysForWeek(strength, 7) — MORE days than the 5 authored — has to repeat a training day, not invent one; sabotage: prove an actual repeat, not just a count', (assert)=>{
  const [days] = runSandbox(pureChunks, `__capture.push(buildDaysForWeek('strength', 7));`);
  const trainSubs = Object.values(days).filter(d=>!d.rest).map(d=>d.sub);
  assert.strictEqual(trainSubs.length, 7);
  assert.strictEqual(Object.values(days).some(d=>d.rest), false, '7/7 days requested means zero rest slots');
  const counts = {};
  trainSubs.forEach(s => { counts[s] = (counts[s]||0) + 1; });
  const repeated = Object.values(counts).some(c => c > 1);
  assert.strictEqual(repeated, true, 'at least one training day sub must appear twice when cycling past the authored 5');
});

test('buildDaysForWeek(strength, 1) — one training day, six rest days cycled from the 2 authored rest templates', (assert)=>{
  const [days] = runSandbox(pureChunks, `__capture.push(buildDaysForWeek('strength', 1));`);
  const trainDays = Object.values(days).filter(d=>!d.rest);
  const restDays = Object.values(days).filter(d=>d.rest);
  assert.strictEqual(trainDays.length, 1);
  assert.strictEqual(restDays.length, 6);
  restDays.forEach(d => assert.strictEqual(d.rest, true));
});

test('buildDaysForWeek relabels every slot Day 1..Day 7 in order, matching the real d1..d7 keys it will be assigned to', (assert)=>{
  const [days] = runSandbox(pureChunks, `__capture.push(buildDaysForWeek('bodybuilding', 3));`);
  ['d1','d2','d3','d4','d5','d6','d7'].forEach((key, i) => {
    assert.ok(days[key], `missing ${key}`);
    assert.strictEqual(days[key].label, `Day ${i+1}`);
  });
});

test('sabotage: buildDaysForWeek never mutates the original authored days object it reads from', (assert)=>{
  const [beforeSubs, afterSubs] = runSandbox(pureChunks, `
    const before = JSON.stringify(DAYS_PER_WEEK_ORIGINAL.strength);
    buildDaysForWeek('strength', 2);
    buildDaysForWeek('strength', 7);
    const after = JSON.stringify(DAYS_PER_WEEK_ORIGINAL.strength);
    __capture.push(before);
    __capture.push(after);
  `);
  assert.strictEqual(beforeSubs, afterSubs);
});

test('daysPerWeekWarningState: default 4 days on strength (well within the 5 authored) triggers neither warning', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('strength', 4));`);
  assert.strictEqual(state.repeats, false);
  assert.strictEqual(state.advisory, false);
});

test('daysPerWeekWarningState: exactly 5 (the authored max) still does not trigger the repeat warning — 5 is not > 5', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('strength', 5));`);
  assert.strictEqual(state.repeats, false);
});

test('daysPerWeekWarningState: 6 days triggers BOTH the repeat warning (6 > 5 authored) and the health advisory (>=6)', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('strength', 6));`);
  assert.strictEqual(state.repeats, true);
  assert.strictEqual(state.advisory, true);
});

test('daysPerWeekWarningState: null pref (untouched) never warns, regardless of program', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('strength', null));`);
  assert.strictEqual(state.repeats, false);
  assert.strictEqual(state.advisory, false);
});

test('daysPerWeekWarningState: a program outside the pilot never warns even at 7 days', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('oly', 7));`);
  assert.strictEqual(state.repeats, false);
  assert.strictEqual(state.advisory, false);
});

// [applyDaysPerWeekProgramData] -------------------------------------------------
const applyChunks = [
  ...pureChunks,
  'var daysPerWeekPref = null;',
  extractFunction(src, 'applyDaysPerWeekProgramData'),
];

test('applyDaysPerWeekProgramData with pref=null (untouched) leaves programs.strength.days as the EXACT SAME reference as the original — a true no-op, not a rebuild that happens to match', (assert)=>{
  const [isSameRef] = runSandbox(applyChunks, `
    applyDaysPerWeekProgramData();
    __capture.push(programs.strength.days === DAYS_PER_WEEK_ORIGINAL.strength);
  `);
  assert.strictEqual(isSameRef, true);
});

test('applyDaysPerWeekProgramData with a real pref set regenerates the pilot programs\' days to match buildDaysForWeek\'s own output', (assert)=>{
  const [matches, dayCount] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData();
    const expected = JSON.stringify(buildDaysForWeek('strength', 6));
    __capture.push(JSON.stringify(programs.strength.days) === expected);
    __capture.push(Object.keys(programs.strength.days).length);
  `);
  assert.strictEqual(matches, true);
  assert.strictEqual(dayCount, 7);
});

test('sabotage: applyDaysPerWeekProgramData NEVER touches a program outside DAYS_PER_WEEK_PROGRAMS, even with a pref set — proves pilot scope containment, not just that strength/bodybuilding happen to work', (assert)=>{
  const [sameRef, olyStillHasOriginalDays] = runSandbox(applyChunks, `
    const olyBefore = programs.oly.days;
    daysPerWeekPref = 7;
    applyDaysPerWeekProgramData();
    __capture.push(programs.oly.days === olyBefore);
    __capture.push(Object.keys(programs.oly.days).length === Object.keys(olyBefore).length);
  `);
  assert.strictEqual(sameRef, true);
  assert.strictEqual(olyStillHasOriginalDays, true);
});

// [loadDaysPerWeekPref / saveDaysPerWeekPref] ------------------------------------
// Real `window` is only available under jsdom (runSandbox/runSandboxAsync use
// a bare vm context with no window at all), and these functions read/write
// window.storage — so, matching this project's own established pattern for
// async-storage functions (see test-whats-new.js's identical shape), these
// run under runJsdom and the test awaits a short real delay for the fired
// async call to actually finish before asserting on the resulting window state.
function storageGlobals(initialStore){
  return `
    var daysPerWeekPref = null;
    window.storage = {
      __store: ${JSON.stringify(initialStore)},
      __deletedKeys: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('not found');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
      delete: async (key)=>{ delete window.storage.__store[key]; window.storage.__deletedKeys.push(key); },
    };
  `;
}

const loadSaveChunks = [
  ...pureChunks,
  extractFunction(src, 'applyDaysPerWeekProgramData'),
  extractFunction(src, 'loadDaysPerWeekPref'),
  extractFunction(src, 'saveDaysPerWeekPref'),
];

// `programs`/`DAYS_PER_WEEK_ORIGINAL` are declared `const` in the real
// source, so — unlike `var` — they never become properties of `window`
// under jsdom's real <script> execution; this exposure line is the only way
// for the test, running outside that script, to read them back afterward.
const exposeGlobals = 'window.__programs = programs; window.__daysPerWeekOriginal = DAYS_PER_WEEK_ORIGINAL;';

test('REAL invocation: loadDaysPerWeekPref with nothing ever stored leaves the pref null and programs.strength.days as the original, untouched', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), loadSaveChunks.concat(['loadDaysPerWeekPref();', exposeGlobals]));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.daysPerWeekPref, null);
  assert.strictEqual(window.__programs.strength.days, window.__daysPerWeekOriginal.strength);
});

test('REAL invocation: loadDaysPerWeekPref with a real stored value regenerates the pilot programs\' days on load', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({ 'days-per-week-pref': '3' }), loadSaveChunks.concat(['loadDaysPerWeekPref();', exposeGlobals]));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.daysPerWeekPref, 3);
  assert.strictEqual(Object.values(window.__programs.strength.days).filter(d=>!d.rest).length, 3);
});

test('REAL invocation: an out-of-range stored value (e.g. "9", pre-dating a future validation change) is rejected — pref stays null, program stays untouched', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({ 'days-per-week-pref': '9' }), loadSaveChunks.concat(['loadDaysPerWeekPref();', exposeGlobals]));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.daysPerWeekPref, null);
  assert.strictEqual(window.__programs.strength.days, window.__daysPerWeekOriginal.strength);
});

test('REAL invocation: saveDaysPerWeekPref(5) writes the value to storage and updates the in-memory pref', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), loadSaveChunks.concat(['saveDaysPerWeekPref(5);']));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.storage.__store['days-per-week-pref'], '5');
  assert.strictEqual(window.daysPerWeekPref, 5);
});

test('REAL invocation: saveDaysPerWeekPref(null) DELETES the stored key (this is how "leave blank to reset to default" actually works) rather than writing a bogus value', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({ 'days-per-week-pref': '6' }), loadSaveChunks.concat(['saveDaysPerWeekPref(null);']));
  await new Promise(res => setTimeout(res, 20));
  assert.deepStrictEqual([...window.storage.__deletedKeys], ['days-per-week-pref']);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(window.storage.__store, 'days-per-week-pref'), false);
});

// [DOM: Profile input markup + warning banner] -----------------------------------
const inputHtml = extractElementById(src, 'prefDaysPerWeek');

test('the Profile "Training days per week" input matches the existing customProgDays precedent: number input, min=1, max=7', (assert)=>{
  assert.match(inputHtml, /id="daysPerWeekInput"/);
  assert.match(inputHtml, /type="number"/);
  assert.match(inputHtml, /min="1"/);
  assert.match(inputHtml, /max="7"/);
  // sabotage anchor: exactly one input in this block, not zero and not a
  // second stray one from a bad merge
  const inputCount = (inputHtml.match(/<input\b/g) || []).length;
  assert.strictEqual(inputCount, 1);
});

test('the Profile card ships an (initially hidden) daysPerWeekWarning container for the advisory banner', (assert)=>{
  assert.match(inputHtml, /id="daysPerWeekWarning"/);
  assert.match(inputHtml, /style="display:none"/);
});

const warningDomChunks = [
  extractFunction(src, 'escapeHtml'),
  ...pureChunks,
  'var daysPerWeekPref = null;',
  'var activeProgram = "strength";',
  extractFunction(src, 'renderDaysPerWeekWarning'),
];

test('REAL invocation: renderDaysPerWeekWarning shows nothing when there is nothing to warn about', (assert)=>{
  const { window } = runJsdom(inputHtml, '', warningDomChunks.concat([
    'renderDaysPerWeekWarning();',
  ]));
  const el = window.document.getElementById('daysPerWeekWarning');
  assert.strictEqual(el.style.display, 'none');
  assert.strictEqual(el.innerHTML.trim(), '');
});

test('REAL invocation: renderDaysPerWeekWarning renders a collapsible banner (reusing the existing .program-basis-toggle/.smooth-toggle pattern, not a new bespoke toggle) once a warning condition is true', (assert)=>{
  const { window } = runJsdom(inputHtml, '', warningDomChunks.concat([
    'daysPerWeekPref = 7;', // 7 > 5 authored -> both repeats and advisory
    'renderDaysPerWeekWarning();',
  ]));
  const el = window.document.getElementById('daysPerWeekWarning');
  assert.notStrictEqual(el.style.display, 'none');
  assert.ok(el.querySelector('.program-basis-toggle'), 'must reuse the existing collapsible-toggle pattern so it can be minimized');
  assert.ok(el.querySelector('.smooth-toggle'), 'must reuse the existing collapsible-panel pattern');
  assert.match(el.textContent, /repeat some training sessions/);
  assert.match(el.textContent, /at least one full rest day/);
});

test('REAL invocation: switching from 7 back to a safe value (4) clears the previously-rendered warning rather than leaving it stuck', (assert)=>{
  const { window } = runJsdom(inputHtml, '', warningDomChunks.concat([
    'daysPerWeekPref = 7;',
    'renderDaysPerWeekWarning();',
    'daysPerWeekPref = 4;',
    'renderDaysPerWeekWarning();',
  ]));
  const el = window.document.getElementById('daysPerWeekWarning');
  assert.strictEqual(el.style.display, 'none');
  assert.strictEqual(el.innerHTML.trim(), '');
});

run();
