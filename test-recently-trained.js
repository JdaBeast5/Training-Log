'use strict';
// Behavioral coverage for the Learn tab's "Recently Trained — Review
// Technique" card — Tier 2, new feature.
//
// Learn's 13 masterclasses and the full exercise library were pure
// reference before this, with no connection to what's actually being
// logged. getRecentlyTrainedExerciseNames/renderRecentlyTrained close that
// gap, reusing buildDayLog() (already assembled for History) and
// buildExerciseSearchResultHtml (Exercise Library's own cues/video
// renderer) rather than a second copy of either.
//
// buildDayLog and buildExerciseSearchResultHtml are pre-existing functions
// with their own heavy dependency chains (storage, the exercise corpus, the
// icon system) — not the subject of this change. Stubbed here the same way
// test-whats-new.js stubs checkBackupAge and test-history-heatmap.js stubs
// fetchDayStatuses/fillHistoryMonth: real collaborators, replaced with
// canned/marker answers so these tests stay focused on the new windowing,
// dedup, and DOM-wiring logic that calls them.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const cardHtml = extractElementById(src, 'recentlyTrainedCard');

const baseChunks = [
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'dateKeyMinusDays'),
  extractFunction(src, 'getRecentlyTrainedExerciseNames'),
];

// renderRecentlyTrained (extracted per-test below) references these two
// consts as free identifiers, same as the real file.
const renderChunks = [
  extractConst(src, 'RECENT_TRAINED_WINDOW_DAYS'),
  extractConst(src, 'RECENT_TRAINED_LIMIT'),
  extractFunction(src, 'renderRecentlyTrained'),
];

// Local-time 'YYYY-MM-DD' N days before the REAL local today, same
// formatting getTodayKey() itself uses (not toISOString(), which is UTC) —
// so these fixtures stay correct regardless of what day the suite actually
// runs on, not coupled to a hardcoded date.
function daysAgoKey(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function dayLogGlobals(dayMap){
  return `window.buildDayLog = async ()=> (${JSON.stringify(dayMap)});`;
}

// Arrays built inside jsdom's window carry that realm's own Array
// prototype, which deepStrictEqual treats as a different type from the
// host's even with identical contents — same issue testHelpers.js
// documents for the vm-sandbox path. Round-tripping through JSON gets a
// plain host-realm array to assert against.
async function plainNames(window, days){
  return JSON.parse(JSON.stringify(await window.getRecentlyTrainedExerciseNames(days)));
}

const { test, run } = makeRunner('test-recently-trained.js');

// --- getRecentlyTrainedExerciseNames ---------------------------------------

test('an empty day log returns no names', async (assert)=>{
  const { window } = runJsdom('', dayLogGlobals({}), baseChunks);
  assert.deepStrictEqual(await plainNames(window, 14), []);
});

test('names within the window come back most-recently-trained first', async (assert)=>{
  const dayMap = {
    [daysAgoKey(7)]: { exercises: [{name:'Back Squat'}] },
    [daysAgoKey(1)]: { exercises: [{name:'Bench Press'}] },
    [daysAgoKey(4)]: { exercises: [{name:'Deadlift'}] },
  };
  const { window } = runJsdom('', dayLogGlobals(dayMap), baseChunks);
  const names = await plainNames(window, 14);
  assert.deepStrictEqual(names, ['Bench Press', 'Deadlift', 'Back Squat']);
});

test('a name older than the cutoff is excluded (sabotage-relevant: not just "everything ever logged")', async (assert)=>{
  const dayMap = {
    [daysAgoKey(400)]: { exercises: [{name:'Ancient Curl'}] }, // long before any 14-day window
    [daysAgoKey(2)]: { exercises: [{name:'Bench Press'}] },
  };
  const { window } = runJsdom('', dayLogGlobals(dayMap), baseChunks);
  const names = await plainNames(window, 14);
  assert.ok(!names.includes('Ancient Curl'));
  assert.ok(names.includes('Bench Press'));
});

test('a name logged on multiple days within the window appears exactly ONCE, at its most recent date (not just "last iterated")', async (assert)=>{
  const dayMap = {
    [daysAgoKey(6)]: { exercises: [{name:'Back Squat'}] },
    [daysAgoKey(1)]: { exercises: [{name:'Back Squat'}] }, // most recent — object insertion order puts this AFTER the entry below
    [daysAgoKey(3)]: { exercises: [{name:'Overhead Press'}] },
  };
  const { window } = runJsdom('', dayLogGlobals(dayMap), baseChunks);
  const names = await plainNames(window, 14);
  assert.deepStrictEqual(names, ['Back Squat', 'Overhead Press'], 'Back Squat must appear once, ranked by its most recent date, not its first-seen date');
});

// --- renderRecentlyTrained: DOM wiring --------------------------------------

function stubBuildExerciseSearchResultHtml(knownNames){
  return `
    window.buildExerciseSearchResultHtml = (name)=>
      ${JSON.stringify(knownNames)}.includes(name) ? '<div class="stub-entry">' + name + '</div>' : '';
  `;
}

test('renderRecentlyTrained hides the card when nothing was logged in the window', async (assert)=>{
  const { document, window } = runJsdom(
    cardHtml,
    dayLogGlobals({}) + stubBuildExerciseSearchResultHtml([]),
    baseChunks.concat(renderChunks)
  );
  await window.renderRecentlyTrained();
  assert.strictEqual(document.getElementById('recentlyTrainedCard').style.display, 'none');
});

test('renderRecentlyTrained shows the card and renders each name via the REAL library renderer', async (assert)=>{
  const dayMap = { [daysAgoKey(2)]: { exercises: [{name:'Bench Press'}, {name:'Deadlift'}] } };
  const { document, window } = runJsdom(
    cardHtml,
    dayLogGlobals(dayMap) + stubBuildExerciseSearchResultHtml(['Bench Press', 'Deadlift']),
    baseChunks.concat(renderChunks)
  );
  await window.renderRecentlyTrained();
  assert.notStrictEqual(document.getElementById('recentlyTrainedCard').style.display, 'none');
  const entries = [...document.querySelectorAll('#recentlyTrainedList .stub-entry')].map(e=> e.textContent);
  assert.deepStrictEqual(entries, ['Bench Press', 'Deadlift']);
});

test('a name with no real library entry (buildExerciseSearchResultHtml returns "") is filtered out, not shown as a gap', async (assert)=>{
  const dayMap = {
    [daysAgoKey(2)]: { exercises: [{name:'Custom Garage Move'}, {name:'Bench Press'}] },
  };
  const { document, window } = runJsdom(
    cardHtml,
    dayLogGlobals(dayMap) + stubBuildExerciseSearchResultHtml(['Bench Press']), // Custom Garage Move NOT in the library
    baseChunks.concat(renderChunks)
  );
  await window.renderRecentlyTrained();
  const entries = [...document.querySelectorAll('#recentlyTrainedList .stub-entry')].map(e=> e.textContent);
  assert.deepStrictEqual(entries, ['Bench Press']);
  assert.ok(!document.getElementById('recentlyTrainedList').innerHTML.includes('Custom Garage Move'));
});

test('more names than the display limit: only the most recent RECENT_TRAINED_LIMIT render', async (assert)=>{
  const names = ['Ex1','Ex2','Ex3','Ex4','Ex5','Ex6','Ex7','Ex8','Ex9','Ex10'];
  const dayMap = {};
  // Oldest (Ex1) furthest back, most recent (Ex10) yesterday — 10 distinct
  // days, all well within the 14-day window.
  names.forEach((name, i)=>{ dayMap[daysAgoKey(names.length - i)] = { exercises: [{name}] }; });
  const { document, window } = runJsdom(
    cardHtml,
    dayLogGlobals(dayMap) + stubBuildExerciseSearchResultHtml(names),
    baseChunks.concat(renderChunks)
  );
  await window.renderRecentlyTrained();
  const entries = document.querySelectorAll('#recentlyTrainedList .stub-entry');
  assert.strictEqual(entries.length, 8, 'RECENT_TRAINED_LIMIT is 8 — must not dump all 10');
  assert.strictEqual(entries[0].textContent, 'Ex10', 'must keep the MOST recent 8, not the first 8 logged');
});

run();
