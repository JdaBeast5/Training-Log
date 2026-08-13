'use strict';
// Behavioral coverage for wiring the History tab's #historyExportRange
// dropdown into the visible Day-by-Day Log list — new feature.
//
// The dropdown (Last 30 days / Last 90 days / Last year / All time) already
// existed, but was read ONLY inside the "Print workout report" click handler
// (buildPrintReport) — picking "Last 30 days" changed nothing about what
// #historyList actually showed. renderHistory() now reads the same select
// directly and scopes the visible list with it, reusing the exact cutoff
// math (dateKeyMinusDays + getTodayKey) buildPrintReport already used —
// not a second, parallel range calculation. It composes with the
// pre-existing exercise-name text filter (historyFilter) rather than
// replacing it: both can narrow the list at once.
//
// Uses the REAL #historyView markup (the real select, search input, and
// #historyList) and the REAL extracted renderHistory + its real small
// date-math/formatting collaborators, loaded into an actual jsdom document.
// buildDayLog is stubbed — a real, complex, pre-existing collaborator (its
// own readExCorpus/fetchAllWeightEntries/window.storage.list dependencies
// are not what this change is about) — the same way test-history-heatmap.js
// stubs fetchDayStatuses.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const historyViewHtml = extractElementById(src, 'historyView');

const getTodayKeySrc = extractFunction(src, 'getTodayKey');
const dateKeyMinusDaysSrc = extractFunction(src, 'dateKeyMinusDays');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const parseDateKeySrc = extractFunction(src, 'parseDateKey');
const formatDateSrc = extractFunction(src, 'formatDate');
const formatShortDateSrc = extractFunction(src, 'formatShortDate');
const fmtMonthLabelSrc = extractFunction(src, 'fmtMonthLabel');
const renderHistorySrc = extractFunction(src, 'renderHistory');

// document.getElementById('historyExportRange').addEventListener('change', ...)
// is a top-level statement, not a named function/const. Extracted the same
// way this repo's other tests handle small unnamed top-level wiring (see
// test-nav-more-panel.js's extractStatement): matched by its own unique
// opening text through to its closing '});' line.
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}
const rangeChangeWiringSrc = extractStatement(src, "document.getElementById('historyExportRange').addEventListener('change'");

// Local-time 'YYYY-MM-DD', matching getTodayKey()'s own formatting exactly —
// same helper test-history-heatmap.js already uses for the same reason (not
// toISOString(), which is UTC and can land on a different calendar day near
// midnight depending on timezone).
function localDateKey(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function daysAgoKey(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateKey(d);
}

const TODAY_KEY = daysAgoKey(0);
const TEN_AGO = daysAgoKey(10);     // inside 30, 90, 365
const FORTY_AGO = daysAgoKey(40);   // outside 30; inside 90, 365
const HUNDRED_AGO = daysAgoKey(100); // outside 30, 90; inside 365
const FOUR_HUNDRED_AGO = daysAgoKey(400); // outside all three; only in 'all'

// TEN_AGO carries a real exercise name so tests can prove the range filter
// composes with the pre-existing text filter rather than one replacing the
// other. TODAY_KEY carries a different exercise for the same reason.
const FIXTURE_DAY_MAP = {
  [TODAY_KEY]: {exercises: [{name: 'Squat'}]},
  [TEN_AGO]: {exercises: [{name: 'Bench Press'}]},
  [FORTY_AGO]: {exercises: []},
  [HUNDRED_AGO]: {exercises: []},
  [FOUR_HUNDRED_AGO]: {exercises: []},
};

function globalsWithFixture(dayMap){
  return `
    window.buildDayLog = async ()=> (${JSON.stringify(dayMap)});
    window.renderHistoryHeatmap = ()=>{};
    var historyFilter = '';
  `;
}

const scriptChunks = [getTodayKeySrc, dateKeyMinusDaysSrc, escapeHtmlSrc, parseDateKeySrc, formatDateSrc, formatShortDateSrc, fmtMonthLabelSrc, renderHistorySrc];

function totalDaysShown(document){
  const counts = [...document.querySelectorAll('#historyList details.month-group summary .month-count')]
    .map(el=> parseInt(el.textContent, 10));
  return counts.reduce((a,b)=> a+b, 0);
}

const { test, run } = makeRunner('test-history-date-range-filter.js');

test('range=30 scopes the visible list to today + 10-days-ago only (40/100/400-days-ago excluded)', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  document.getElementById('historyExportRange').value = '30';
  await window.renderHistory();
  assert.strictEqual(totalDaysShown(document), 2);
});

test('range=90 additionally includes the 40-days-ago entry', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  document.getElementById('historyExportRange').value = '90';
  await window.renderHistory();
  assert.strictEqual(totalDaysShown(document), 3);
});

test('range=365 additionally includes the 100-days-ago entry', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  document.getElementById('historyExportRange').value = '365';
  await window.renderHistory();
  assert.strictEqual(totalDaysShown(document), 4);
});

test('range=all shows every entry, including the 400-days-ago one', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  document.getElementById('historyExportRange').value = 'all';
  await window.renderHistory();
  assert.strictEqual(totalDaysShown(document), 5);
});

test('sabotage-relevant: with no #historyExportRange in the DOM at all, renderHistory falls back to "all" rather than throwing', async (assert)=>{
  // Proves the `historyRangeSel ? historyRangeSel.value : 'all'` fallback in
  // the real function is live code, not dead — remove the select from the
  // markup entirely (rather than just not setting a value) so a version of
  // this code that unconditionally read .value would throw here.
  const noSelectHtml = historyViewHtml.replace(/<select id="historyExportRange"[\s\S]*?<\/select>/, '');
  const { document, window } = runJsdom(noSelectHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  await window.renderHistory();
  assert.strictEqual(totalDaysShown(document), 5, 'no select present must behave like "all time", matching every date shown');
});

test('range filtering composes with the pre-existing exercise-name text filter: range=30 + "bench" matches only the 10-days-ago entry', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  document.getElementById('historyExportRange').value = '30';
  window.historyFilter = 'bench';
  await window.renderHistory();
  assert.strictEqual(totalDaysShown(document), 1, 'today (Squat) must be excluded by the text filter even though it is inside the date range');
  const statusEl = document.getElementById('historySearchStatus');
  assert.match(statusEl.innerHTML, /1 session/);
});

test('range=30 + a text filter matching nothing in range produces one combined empty-state message (both facts, not two competing ones)', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks);
  document.getElementById('historyExportRange').value = '30';
  window.historyFilter = 'deadlift';
  await window.renderHistory();
  const note = document.querySelector('#historyList .empty-note');
  assert.ok(note, 'expected an empty-state note');
  assert.match(note.textContent, /"deadlift"/, 'must still name the search term');
  assert.match(note.textContent, /last 30 days/, 'must also name the active date range, not silently drop that context');
});

test('range=30 with zero entries in range and NO text filter gets a range-specific empty message, distinct from the "nothing logged yet" first-run message', async (assert)=>{
  const oldOnlyFixture = {[FOUR_HUNDRED_AGO]: {exercises: []}};
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(oldOnlyFixture), scriptChunks);
  document.getElementById('historyExportRange').value = '30';
  await window.renderHistory();
  const note = document.querySelector('#historyList .empty-note');
  assert.ok(note);
  assert.match(note.textContent, /last 30 days/);
  assert.doesNotMatch(note.textContent, /once you start tracking/, 'must not show the true first-run message when the account actually has data, just not in this range');
});

test('a truly empty account (buildDayLog returns nothing at all) still shows the original first-run message, regardless of the selected range', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture({}), scriptChunks);
  document.getElementById('historyExportRange').value = '30';
  await window.renderHistory();
  const note = document.querySelector('#historyList .empty-note');
  assert.match(note.textContent, /once you start tracking/);
});

// --- REAL invocation: the actual change listener --------------------------

test('REAL invocation: changing the dropdown and dispatching a real "change" event re-renders the list via the real renderHistory (not just defined, actually wired)', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, globalsWithFixture(FIXTURE_DAY_MAP), scriptChunks.concat([rangeChangeWiringSrc]));
  const sel = document.getElementById('historyExportRange');
  sel.value = '30';
  await window.renderHistory(); // establish the "before" state, same as real app boot
  assert.strictEqual(totalDaysShown(document), 2);

  sel.value = 'all';
  sel.dispatchEvent(new window.Event('change', {bubbles:true}));
  await new Promise((resolve)=> setTimeout(resolve, 20)); // let the async renderHistory triggered by the listener settle
  assert.strictEqual(totalDaysShown(document), 5, 'the real change listener must have called renderHistory again with the new value');
});

run();
