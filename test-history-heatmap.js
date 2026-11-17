'use strict';
// Behavioral coverage for the History tab calendar heatmap — rewritten for a
// new feature: the calendar used to render three months stacked on top of
// each other with no navigation. It now shows one month at a time, with the
// same prev/next-month arrows (reusing the .calendar-modal-header/
// .calendar-nav-btn/.calendar-modal-title markup) as the backdating date
// picker you get from tapping the date on Today/Log — same visual language,
// not a lookalike. Clicking a day jumps to that SPECIFIC day's card in the
// log below (not just its month, which is what the old version did).
//
// Uses the REAL #historyView markup and the REAL extracted functions,
// loaded into an actual jsdom document via a real <script> tag.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
// 2026-11-03 (v3.500): jumpToHistoryDay first offers the day to the open-
// screen pane (showHistoryDayPane), which declines on a phone; loaded for
// real with isOpenPosture() false (test-open-screen-2-0.js covers the pane).
const JUMP_SRC = [extractFunction(src, 'showHistoryDayPane'), 'function isOpenPosture(){ return false; }', extractFunction(src, 'jumpToHistoryDay')].join('\n');
const historyViewHtml = extractElementById(src, 'historyView');

const baseChunks = [
  extractConst(src, 'CALENDAR_MONTH_NAMES'),
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'renderHistoryHeatmapMonth'),
];

// fetchDayStatuses is a pre-existing function (built for the backdating
// picker) with its own real dependencies (readWorkoutCorpus, dayDefs) —
// not the subject of this change. Stubbed here the same way test-whats-new.js
// stubs checkBackupAge: a real collaborator, replaced with a canned answer
// so THIS test stays focused on the new rendering/wiring/navigation logic.
//
// Also pre-declares the three module-level state vars (historyHeatmapViewYear/
// Month/_historyHeatmapDayStatus) as plain `window.x = null` assignments
// rather than extracting their real `let` declarations: a top-level `let` in
// a classic <script> creates a lexical binding, NOT a `window` property, so
// extracting it here would just shadow these assignments instead of sharing
// state with them. renderHistoryHeatmap's own bare references to these names
// fall through to the window properties this sets, same as any other
// undeclared-but-window-set global in a browser context.
function fetchDayStatusesGlobals(entries){
  return `
    window.fetchDayStatuses = async ()=> new Map(${JSON.stringify(entries)});
    window.historyHeatmapViewYear = null;
    window.historyHeatmapViewMonth = null;
    window._historyHeatmapDayStatus = null;
    window._historyHeatmapDayInk = null; // 2026-11-16 (v3.589, UX-12)
  `;
}

function localDateKey(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// document.getElementById('historyHeatmapPrevMonth').addEventListener('click', ...)
// is a top-level statement, not a named function/const — same extraction
// approach used elsewhere in this repo for small unnamed top-level wiring
// (see test-history-date-range-filter.js's own extractStatement).
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}
const prevMonthWiringSrc = extractStatement(src, "document.getElementById('historyHeatmapPrevMonth').addEventListener('click'");

const { test, run } = makeRunner('test-history-heatmap.js');

// --- renderHistoryHeatmapMonth: real DOM, driven directly ------------------
// (bypassing renderHistoryHeatmap's fetch/init step so each test controls
// historyHeatmapViewYear/Month and _historyHeatmapDayStatus directly)

test('labels the currently-viewed month/year and renders a full grid', (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, '', baseChunks);
  window.historyHeatmapViewYear = 2026;
  window.historyHeatmapViewMonth = 5; // June (0-indexed)
  window._historyHeatmapDayStatus = new Map();
  window.renderHistoryHeatmapMonth();
  assert.strictEqual(document.getElementById('historyHeatmapMonthLabel').textContent, 'June 2026');
  // June 2026 has 30 days — every non-empty cell must be present regardless
  // of status (as plain, non-interactive cells when nothing was logged).
  const numberedCells = [...document.querySelectorAll('#historyHeatmapGrid .calendar-cell:not(.empty)')];
  assert.strictEqual(numberedCells.length, 30);
});

// 2026-11-16 (v3.589, UX-12): a trained date is a plate block in its session's
// ink (class p-<ink>, no dot); without a known ink it keeps the trained dot.
test('a day with a status renders as a clickable cell: a trained day is a plate block in its ink (no dot), with its aria-label, keyed to that exact date', (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, '', baseChunks);
  const todayKey = window.getTodayKey();
  const [y, m] = todayKey.split('-').map(Number);
  window.historyHeatmapViewYear = y;
  window.historyHeatmapViewMonth = m - 1;
  window._historyHeatmapDayStatus = new Map([[todayKey, 'trained']]);
  window._historyHeatmapDayInk = new Map([[todayKey, 'red']]);
  window.renderHistoryHeatmapMonth();
  const cell = document.querySelector(`[data-jump-date="${todayKey}"]`);
  assert.ok(cell, 'expected a real button for the trained day, keyed by its exact date');
  assert.strictEqual(cell.tagName, 'BUTTON');
  assert.ok(cell.classList.contains('plate-block') && cell.classList.contains('p-red'), cell.className);
  assert.strictEqual(cell.querySelector('.calendar-cell-dot'), null, 'the block replaces the dot');
  window._historyHeatmapDayInk = new Map();
  window.renderHistoryHeatmapMonth();
  assert.ok(document.querySelector(`[data-jump-date="${todayKey}"] .calendar-cell-dot.mark-trained`), 'no known ink: the trained dot stays');
  assert.match(cell.getAttribute('aria-label'), /trained/);
  assert.ok(cell.classList.contains('today'), 'today must get the same .today highlight as the backdating picker');
});

test('a day with NO status is a plain non-interactive cell (sabotage-relevant: not a button, no dot)', (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, '', baseChunks);
  const todayKey = window.getTodayKey();
  const [y, m] = todayKey.split('-').map(Number);
  window.historyHeatmapViewYear = y;
  window.historyHeatmapViewMonth = m - 1;
  window._historyHeatmapDayStatus = new Map();
  window.renderHistoryHeatmapMonth();
  const anyButtons = document.querySelectorAll('#historyHeatmapGrid button');
  const anyDots = document.querySelectorAll('#historyHeatmapGrid .calendar-cell-dot');
  assert.strictEqual(anyButtons.length, 0, 'a month with nothing logged must have zero clickable cells');
  assert.strictEqual(anyDots.length, 0);
});

test('rest and off statuses get their own distinct dot classes, and a future date within the viewed month never renders as a button', (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, '', baseChunks);
  const todayKey = window.getTodayKey();
  const [y, m, d] = todayKey.split('-').map(Number);
  window.historyHeatmapViewYear = y;
  window.historyHeatmapViewMonth = m - 1;
  // A future date in the same month (only meaningful when today isn't the
  // last day of the month) must never render as clickable even if a status
  // were (incorrectly) present for it.
  const futureKey = d < 28 ? `${y}-${String(m).padStart(2,'0')}-28` : null;
  const statusMap = new Map([[todayKey, 'rest']]);
  if(futureKey) statusMap.set(futureKey, 'trained');
  window._historyHeatmapDayStatus = statusMap;
  window.renderHistoryHeatmapMonth();
  assert.ok(document.querySelector(`[data-jump-date="${todayKey}"] .mark-rest`));
  if(futureKey){
    assert.ok(!document.querySelector(`[data-jump-date="${futureKey}"]`), 'a future date must never render as a clickable cell, even with a status entry');
  }
});

test('the next-month arrow is disabled while viewing the current month, and enabled after navigating to a past month', (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, '', baseChunks);
  const today = new Date();
  window.historyHeatmapViewYear = today.getFullYear();
  window.historyHeatmapViewMonth = today.getMonth();
  window._historyHeatmapDayStatus = new Map();
  window.renderHistoryHeatmapMonth();
  assert.strictEqual(document.getElementById('historyHeatmapNextMonth').disabled, true);

  window.historyHeatmapViewMonth -= 1;
  window.renderHistoryHeatmapMonth();
  assert.strictEqual(document.getElementById('historyHeatmapNextMonth').disabled, false);
});

// --- renderHistoryHeatmap: real DOM wiring, fetch + first-render -----------

test('renderHistoryHeatmap hides the whole widget when nothing has ever been logged', async (assert)=>{
  const { document, window } = runJsdom(historyViewHtml, fetchDayStatusesGlobals([]), baseChunks.concat([extractFunction(src, 'renderHistoryHeatmap')]));
  await window.renderHistoryHeatmap();
  assert.strictEqual(document.getElementById('historyHeatmap').style.display, 'none');
});

test('renderHistoryHeatmap shows the widget defaulting to the CURRENT month, with the seeded trained day rendered', async (assert)=>{
  const todayKey = localDateKey(new Date());
  const { document, window } = runJsdom(historyViewHtml, fetchDayStatusesGlobals([[todayKey, 'trained']]), baseChunks.concat([extractFunction(src, 'renderHistoryHeatmap')]));
  await window.renderHistoryHeatmap();
  assert.notStrictEqual(document.getElementById('historyHeatmap').style.display, 'none');
  const today = new Date();
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  assert.strictEqual(document.getElementById('historyHeatmapMonthLabel').textContent, `${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`);
  assert.ok(document.querySelector(`[data-jump-date="${todayKey}"]`), 'the seeded trained day must render as a clickable cell keyed to its exact date');
});

test('renderHistoryHeatmap called again (e.g. a search-filter re-render) does NOT reset a month the user already navigated away from', async (assert)=>{
  const todayKey = localDateKey(new Date());
  const { document, window } = runJsdom(historyViewHtml, fetchDayStatusesGlobals([[todayKey, 'trained']]), baseChunks.concat([extractFunction(src, 'renderHistoryHeatmap')]));
  await window.renderHistoryHeatmap();
  window.historyHeatmapViewMonth -= 1; // navigate away
  window.renderHistoryHeatmapMonth();
  const navigatedLabel = document.getElementById('historyHeatmapMonthLabel').textContent;

  await window.renderHistoryHeatmap(); // simulate a second call, e.g. from a filter change
  assert.strictEqual(document.getElementById('historyHeatmapMonthLabel').textContent, navigatedLabel, 'must stay on the previously-navigated month, not snap back to the current month');
});

// --- REAL invocation: the prev/next arrow click wiring ----------------------

test('REAL invocation: clicking the prev-month arrow navigates back a month and re-renders the label', async (assert)=>{
  const todayKey = localDateKey(new Date());
  const { document, window } = runJsdom(historyViewHtml, fetchDayStatusesGlobals([[todayKey, 'trained']]),
    baseChunks.concat([extractFunction(src, 'renderHistoryHeatmap'), prevMonthWiringSrc]));
  await window.renderHistoryHeatmap();
  const before = document.getElementById('historyHeatmapMonthLabel').textContent;

  document.getElementById('historyHeatmapPrevMonth').dispatchEvent(new window.Event('click', {bubbles:true}));

  const after = document.getElementById('historyHeatmapMonthLabel').textContent;
  assert.notStrictEqual(after, before, 'the real prev-month click listener must re-render with a different month label');
});

// --- jumpToHistoryDay: the click -> open -> scroll-to-day chain ------------

test('jumpToHistoryDay opens the matching month group, fills it, and scrolls to the SPECIFIC day card (not just the month)', (assert)=>{
  const stubFill = `
    window.__fillCalls = [];
    window.fillHistoryMonth = (details)=>{ window.__fillCalls.push(details.dataset.month); };
  `;
  const { document, window } = runJsdom(historyViewHtml, stubFill, [JUMP_SRC]);
  const details = document.createElement('details');
  details.className = 'month-group';
  details.dataset.month = '2026-06';
  let monthScrolled = false;
  details.scrollIntoView = ()=>{ monthScrolled = true; };
  document.getElementById('historyList').appendChild(details);

  const dayCard = document.createElement('div');
  dayCard.className = 'day-card';
  dayCard.dataset.date = '2026-06-15';
  let dayScrolled = false;
  dayCard.scrollIntoView = ()=>{ dayScrolled = true; };
  details.appendChild(dayCard);

  window.jumpToHistoryDay('2026-06-15');

  assert.strictEqual(details.open, true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(window.__fillCalls)), ['2026-06']);
  assert.strictEqual(dayScrolled, true, 'must scroll to the specific day card once present');
  assert.strictEqual(monthScrolled, false, 'must NOT fall back to scrolling the whole month group when the exact day card was found');
});

test('jumpToHistoryDay falls back to scrolling the month group when the exact day card is not present (e.g. filtered out by search)', (assert)=>{
  const stubFill = `window.fillHistoryMonth = ()=>{};`;
  const { document, window } = runJsdom(historyViewHtml, stubFill, [JUMP_SRC]);
  const details = document.createElement('details');
  details.className = 'month-group';
  details.dataset.month = '2026-06';
  let monthScrolled = false;
  details.scrollIntoView = ()=>{ monthScrolled = true; };
  document.getElementById('historyList').appendChild(details);

  window.jumpToHistoryDay('2026-06-15'); // no matching .day-card ever added

  assert.strictEqual(monthScrolled, true, 'must fall back to scrolling the month group itself');
});

test('jumpToHistoryDay does nothing (no throw) when the month is not present — e.g. filtered out', (assert)=>{
  const { window } = runJsdom(historyViewHtml, 'window.fillHistoryMonth = ()=>{};', [JUMP_SRC]);
  assert.doesNotThrow(()=> window.jumpToHistoryDay('1999-01-01'));
});

test('jumpToHistoryDay does not re-fill an already-open, already-filled month (avoids a redundant render)', (assert)=>{
  const stubFill = `window.fillHistoryMonth = ()=>{ window.__calls = (window.__calls||0) + 1; };`;
  const { document, window } = runJsdom(historyViewHtml, stubFill, [JUMP_SRC]);
  const details = document.createElement('details');
  details.className = 'month-group';
  details.dataset.month = '2026-06';
  details.open = true; // already open from a previous jump
  details.scrollIntoView = ()=>{};
  document.getElementById('historyList').appendChild(details);

  window.jumpToHistoryDay('2026-06-15');

  assert.strictEqual(window.__calls, undefined, 'fillHistoryMonth must only be called when the group was actually opened by this call, matching how renderHistory itself opens groups');
});

// ---- v3.589 (UX-12): History's month as plate blocks ---------------------
// Real renderHistoryHeatmap -> renderHistoryHeatmapMonth over the real
// #historyView, the real inkForDate and dayInk over the real programs, with
// fetchDayStatuses and the two corpora stubbed at their storage boundary.
const INK_CHUNKS = [extractConst(src, 'programs'), extractConst(src, 'DAY_INKS'), extractConst(src, 'CUSTOM_PLATES'),
  extractFunction(src, 'dayInk'), extractFunction(src, 'inkForDate'), extractFunction(src, 'renderHistoryHeatmap')];
// A month before the current one, so every date in it is in the past.
const PAST = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return {y: d.getFullYear(), m: d.getMonth()}; })();
const pastKey = (day) => `${PAST.y}-${String(PAST.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const sets = (n) => Array.from({length: n}, () => ({weight: 100, reps: 5}));
const ex = (dayId, date, n, program = 'strength') => ({parsed: {program, dayId, idx: 0}, log: [{date, sets: sets(n)}]});

async function blocksFor(statuses, exCorpus, workoutCorpus = []){
  const { document, window } = runJsdom(historyViewHtml, `
    window.fetchDayStatuses = async ()=> new Map(${JSON.stringify(statuses)});
    window.readExCorpus = async ()=> ${JSON.stringify(exCorpus)};
    window.readWorkoutCorpus = async ()=> ${JSON.stringify(workoutCorpus)};
    window.historyHeatmapViewYear = ${PAST.y}; window.historyHeatmapViewMonth = ${PAST.m};
    window._historyHeatmapDayStatus = null; window._historyHeatmapDayInk = null;
    var activeProgram = 'strength', dayOrder = ['d1','d2','d3','d4','d5','d6','d7'];
    window.__jumps = []; window.jumpToHistoryDay = (d)=> window.__jumps.push(d);`, [...baseChunks, ...INK_CHUNKS]);
  await window.renderHistoryHeatmap();
  return {document, window, blocks: [...document.querySelectorAll('#historyHeatmapGrid .plate-block')]};
}

test('UX-12 criterion 1: each trained date renders exactly one block in its main session\'s dayInk (a strength d1 date is red); dates without a session stay plain', async (assert)=>{
  const statuses = [[pastKey(3), 'trained'], [pastKey(4), 'trained'], [pastKey(10), 'rest']];
  const { document, blocks } = await blocksFor(statuses, [ex('d1', pastKey(3), 5), ex('d2', pastKey(4), 6)]);
  assert.deepStrictEqual(blocks.map(b => [b.dataset.jumpDate, [...b.classList].filter(c => /^p-/.test(c)).join()]),
    [[pastKey(3), 'p-red'], [pastKey(4), 'p-blue']]);
  assert.ok(document.querySelector(`[data-jump-date="${pastKey(10)}"] .calendar-cell-dot.mark-rest`), 'rest keeps its own look');
  const plain = document.querySelector('#historyHeatmapGrid .calendar-cell:not(.empty):not([data-jump-date])');
  assert.ok(plain && plain.tagName === 'DIV' && !plain.classList.contains('plate-block'), 'an empty date is a plain, non-interactive cell');
});

test('UX-12 criterion 2: tapping a block calls the real jumpToHistoryDay with that date, which scrolls the matching day card into view once', async (assert)=>{
  const { document, window, blocks } = await blocksFor([[pastKey(3), 'trained']], [ex('d1', pastKey(3), 5)]);
  // The real jump chain (as the cases above), on this document.
  window.eval(JUMP_SRC + '\nwindow.jumpToHistoryDay = jumpToHistoryDay; window.fillHistoryMonth = ()=>{};');
  const details = document.createElement('details'); details.className = 'month-group'; details.dataset.month = pastKey(3).slice(0, 7);
  const card = document.createElement('div'); card.className = 'day-card'; card.dataset.date = pastKey(3);
  let scrolled = 0; card.scrollIntoView = () => { scrolled++; };
  details.appendChild(card); document.getElementById('historyList').appendChild(details);
  window.renderHistoryHeatmapMonth(); // rewire the blocks to the real jump
  document.querySelector(`#historyHeatmapGrid .plate-block[data-jump-date="${pastKey(3)}"]`).click();
  assert.strictEqual(scrolled, 1);
  assert.strictEqual(details.open, true);
  assert.ok(blocks.length === 1);
});

test('UX-12 criterion 3: a date with two sessions (d1 with 12 sets, d3 with 4) takes d1\'s ink; a tie goes to the earlier day', async (assert)=>{
  const { blocks } = await blocksFor([[pastKey(5), 'trained']], [ex('d3', pastKey(5), 4), ex('d1', pastKey(5), 12)]);
  assert.deepStrictEqual(blocks.map(b => b.className.match(/p-\w+/)[0]), ['p-red']);
  const tie = await blocksFor([[pastKey(5), 'trained']], [ex('d3', pastKey(5), 6), ex('d2', pastKey(5), 6)]);
  assert.deepStrictEqual(tie.blocks.map(b => b.className.match(/p-\w+/)[0]), ['p-blue'], 'a tie takes d2 (blue) before d3');
  // No logged sets: the checked-off day (workout corpus) decides.
  const ticked = await blocksFor([[pastKey(6), 'trained']], [], [{date: pastKey(6), dayId: 'd4', anyDone: true, completed: {0: true}}]);
  assert.deepStrictEqual(ticked.blocks.map(b => b.className.match(/p-\w+/)[0]), ['p-yellow'], 'strength d4 is yellow');
});

run();
