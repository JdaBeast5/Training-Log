'use strict';
// Behavioral coverage for the History tab calendar heatmap — Tier 2, new
// feature.
//
// History's Day-by-Day Log was list/text only, grouped by month — scanning
// "did I train this month" meant scrolling and reading. buildHistoryHeatmapMonths/
// renderHistoryHeatmap/jumpToHistoryMonth add a compact trained/rest/off
// calendar view, reusing fetchDayStatuses() (already built for the
// backdating date picker) and the same .calendar-grid/.calendar-cell/
// .calendar-cell-dot classes and mark-trained/mark-rest/mark-off convention
// — one status computation, one set of calendar visuals, not a second copy.
//
// Uses the REAL #historyView markup and the REAL extracted functions,
// loaded into an actual jsdom document via a real <script> tag.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const historyViewHtml = extractElementById(src, 'historyView');

const baseChunks = [
  extractConst(src, 'CALENDAR_MONTH_NAMES'),
  extractConst(src, 'HISTORY_HEATMAP_MONTHS'),
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'buildHistoryHeatmapMonths'),
];

// fetchDayStatuses is a pre-existing function (built for the backdating
// picker) with its own real dependencies (readWorkoutCorpus, dayDefs) —
// not the subject of this change. Stubbed here the same way test-whats-new.js
// stubs checkBackupAge: a real collaborator, replaced with a canned answer
// so THIS test stays focused on the new rendering/wiring logic that calls it.
function fetchDayStatusesGlobals(entries){
  return `window.fetchDayStatuses = async ()=> new Map(${JSON.stringify(entries)});`;
}

// Local-time 'YYYY-MM-DD', matching getTodayKey()'s own formatting exactly
// (not toISOString(), which is UTC and can land on a different calendar day
// near midnight depending on timezone — a real bug this test caught in its
// own first draft).
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function localDateKey(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

const { test, run } = makeRunner('test-history-heatmap.js');

// --- buildHistoryHeatmapMonths: pure function, no DOM ----------------------

test('renders monthCount months, oldest first, each labelled correctly', (assert)=>{
  const { window } = runJsdom('', '', baseChunks);
  const html = window.buildHistoryHeatmapMonths(new Map(), 3);
  const scratch = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`).window.document;
  const labels = [...scratch.querySelectorAll('.history-heatmap-month-label')].map(l=> l.textContent);
  assert.strictEqual(labels.length, 3);
  const today = new Date();
  const expected = [2,1,0].map(i=>{
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  });
  assert.deepStrictEqual(labels, expected, 'oldest month first, current month last');
});

test('a day with a status renders as a clickable cell with the right dot class and aria-label', (assert)=>{
  const { window } = runJsdom('', '', baseChunks);
  const todayKey = window.getTodayKey();
  const monthKey = todayKey.slice(0,7);
  const dayStatus = new Map([[todayKey, 'trained']]);
  const html = window.buildHistoryHeatmapMonths(dayStatus, 1);
  const scratch = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`).window.document;
  const cell = scratch.querySelector(`[data-jump-month="${monthKey}"][aria-label^="${todayKey}"]`);
  assert.ok(cell, 'expected a real button for the trained day');
  assert.strictEqual(cell.tagName, 'BUTTON');
  assert.ok(cell.querySelector('.calendar-cell-dot.mark-trained'));
  assert.match(cell.getAttribute('aria-label'), /trained/);
});

test('a day with NO status is a plain non-interactive cell (sabotage-relevant: not a button, no dot)', (assert)=>{
  const { window } = runJsdom('', '', baseChunks);
  const html = window.buildHistoryHeatmapMonths(new Map(), 1);
  const scratch = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`).window.document;
  const anyButtons = scratch.querySelectorAll('.calendar-grid button');
  const anyDots = scratch.querySelectorAll('.calendar-cell-dot');
  assert.strictEqual(anyButtons.length, 0, 'a month with nothing logged must have zero clickable cells');
  assert.strictEqual(anyDots.length, 0);
});

test('rest and off statuses get their own distinct dot classes', (assert)=>{
  const { window } = runJsdom('', '', baseChunks);
  const todayKey = window.getTodayKey();
  const monthKey = todayKey.slice(0,7);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
  const dayStatus = new Map([[todayKey, 'rest'], [yKey, 'off']]);
  const html = window.buildHistoryHeatmapMonths(dayStatus, 1);
  const scratch = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`).window.document;
  assert.ok(scratch.querySelector(`[data-jump-month="${monthKey}"] .mark-rest`));
  // yKey might fall in the previous month if today is the 1st — only assert
  // it if it's actually rendered within this single-month window.
  if(yKey.slice(0,7) === monthKey){
    assert.ok(scratch.querySelector(`[data-jump-month="${monthKey}"] .mark-off`));
  }
});

// --- renderHistoryHeatmap: real DOM wiring ---------------------------------

test('renderHistoryHeatmap hides the whole widget when nothing has ever been logged', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, fetchDayStatusesGlobals([]), baseChunks.concat([extractFunction(src, 'renderHistoryHeatmap')]));
  await window.renderHistoryHeatmap();
  assert.strictEqual(document.getElementById('historyHeatmap').style.display, 'none');
});

test('renderHistoryHeatmap shows the widget and fills in real months once something exists', async (assert)=>{
  const todayKey = localDateKey(new Date());
  const { document, window } = runJsdom(historyViewHtml, fetchDayStatusesGlobals([[todayKey, 'trained']]), baseChunks.concat([extractFunction(src, 'renderHistoryHeatmap')]));
  await window.renderHistoryHeatmap();
  assert.notStrictEqual(document.getElementById('historyHeatmap').style.display, 'none');
  assert.strictEqual(document.querySelectorAll('#historyHeatmapMonths .history-heatmap-month').length, 3);
  assert.ok(document.querySelector('#historyHeatmapMonths [data-jump-month]'), 'the seeded trained day must render as a clickable cell');
});

// --- jumpToHistoryMonth: the click -> open -> scroll chain ----------------

test('jumpToHistoryMonth opens the matching month group, fills it, and scrolls to it', (assert)=>{
  const stubFill = `
    window.__fillCalls = [];
    // Stubbed collaborator: fillHistoryMonth's own rendering
    // (buildHistoryDayCardHtml and its dependencies) isn't what this test is
    // about — the seam under test is whether jumpToHistoryMonth finds the
    // right element and calls the fill/scroll steps at all.
    window.fillHistoryMonth = (details)=>{ window.__fillCalls.push(details.dataset.month); };
  `;
  const { document, window } = runJsdom(historyViewHtml, stubFill, [extractFunction(src, 'jumpToHistoryMonth')]);
  const details = document.createElement('details');
  details.className = 'month-group';
  details.dataset.month = '2026-06';
  let scrolledInto = false;
  details.scrollIntoView = ()=>{ scrolledInto = true; };
  document.getElementById('historyList').appendChild(details);

  window.jumpToHistoryMonth('2026-06');

  assert.strictEqual(details.open, true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(window.__fillCalls)), ['2026-06']);
  assert.strictEqual(scrolledInto, true);
});

test('jumpToHistoryMonth does nothing (no throw) when the month is not present — e.g. filtered out', (assert)=>{
  const { window } = runJsdom(historyViewHtml, 'window.fillHistoryMonth = ()=>{};', [extractFunction(src, 'jumpToHistoryMonth')]);
  assert.doesNotThrow(()=> window.jumpToHistoryMonth('1999-01'));
});

test('jumpToHistoryMonth does not re-fill an already-open, already-filled month (avoids a redundant render)', (assert)=>{
  const calls = [];
  const stubFill = `window.fillHistoryMonth = (details)=>{ window.__calls = window.__calls || []; window.__calls.push(1); };`;
  const { document, window } = runJsdom(historyViewHtml, stubFill, [extractFunction(src, 'jumpToHistoryMonth')]);
  const details = document.createElement('details');
  details.className = 'month-group';
  details.dataset.month = '2026-06';
  details.open = true; // already open from a previous jump
  details.scrollIntoView = ()=>{};
  document.getElementById('historyList').appendChild(details);

  window.jumpToHistoryMonth('2026-06');

  assert.strictEqual(window.__calls, undefined, 'fillHistoryMonth must only be called when the group was actually opened by this call, matching how renderHistory itself opens groups');
});

run();
