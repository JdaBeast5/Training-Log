'use strict';
// Today's Priorities, reviewed row by row (owner: "Look over all today's
// priorities and evaluate if they're necessary or redundant, also make them
// removable by swiping"). One increment per change.
//
// v3.380 — The Sleep row is gone. Readiness already flags under-6h sleep
// (READINESS_SLEEP_LOW = 6, the same threshold), so with a short night the
// list showed both — and they disagreed: Readiness's single-flag note says
// "not a reason to change the plan on its own", the Sleep row said "consider
// trimming today's session".
// v3.381 — The Deload-week row is gone. The day header already reads
// "Week 5 of 5 · Deload" from the same isDeloadWeek() (manual deloads too),
// the session time says "(deload)", the sets are already cut and the chips
// suggest the lighter weights; the row repeated all of it as a paragraph.
// v3.382 — The cycle phase is one row: training, then food, then the jump to
// Nutrition. It was two rows (getCycleInsight, getCyclePhaseNutritionInsight)
// each naming the phase.
// v3.383 — Every row swipes away for the rest of today, with Undo: the shared
// swipe row (buildSwipeItem + makeSwipeable). Hidden ids are stored once as
// {date, ids} in window.storage, so a hidden row comes back tomorrow if it
// still applies, and nothing piles up day after day.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-priorities.js');
const src = readIndexSource();
const renderSrc = extractFunction(src, 'renderTodayInsights');

// Every source the real renderer awaits, by the name it calls. A test sets
// the ones it cares about; the rest return null (nothing to say today).
const SOURCES = [...renderSrc.matchAll(/\b(get[A-Za-z]+Insight)\(\)/g)].map(m => m[1]);
function mount(rows, stored){
  const stubs = SOURCES.map(n => `async function ${n}(){ return ${JSON.stringify(rows[n] || null)}; }`).join('\n');
  const { window } = runJsdom('<div class="card" id="todayInsightsCard" style="display:none"><div id="todayInsightsList"></div></div>', `
    window.__store = ${JSON.stringify(stored || {})};
    window.storage = { get: async k => k in window.__store ? { value: window.__store[k] } : null, set: async (k, v) => { window.__store[k] = v; } };
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }
  // 2026-10-28 (v3.463): the renderer folds rows after the first into the
  // shared collapsible list, so the real one (and its batch size) loads too.
  `, [stubs, extractFunction(src, 'getTodayKey'), extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'), ...['getHiddenPriorities', 'setHiddenPriorities', 'buildSwipeItem', 'makeSwipeable', 'renderCollapsibleList'].map(n => extractFunction(src, n)), renderSrc]);
  return window;
}
const rowsOf = w => [...w.document.querySelectorAll('#todayInsightsList .today-insight-row')].map(r => r.textContent.trim());

test('REAL source (v3.380): the renderer no longer asks for a separate sleep row, and nothing defines one', (assert)=>{
  assert.ok(SOURCES.length >= 10, 'anchor: the real list of sources was read');
  assert.ok(!SOURCES.includes('getSleepInsight'));
  assert.doesNotMatch(src, /function getSleepInsight\(/);
  assert.match(extractFunction(src, 'computeReadiness'), /sleepHours < READINESS_SLEEP_LOW/, 'Readiness still covers short sleep');
  assert.match(extractConst(src, 'READINESS_SLEEP_LOW'), /= 6;/, 'at the threshold the removed row used');
});

test('REAL invocation (v3.380): with a short night, the list says it once, through Readiness', async (assert)=>{
  const w = mount({ getReadinessInsight: '• <b>Readiness:</b> Slept 5h — worth keeping an eye on, but not a reason to change the plan on its own.' });
  await w.renderTodayInsights();
  const rows = rowsOf(w);
  assert.strictEqual(rows.length, 1);
  assert.match(rows[0], /Slept 5h/);
});

test('REAL source (v3.381): no deload row; the day header carries the deload week from the same check', (assert)=>{
  assert.ok(!SOURCES.includes('getDeloadInsight'));
  assert.doesNotMatch(src, /function getDeloadInsight\(/);
  assert.match(extractFunction(src, 'mesocyclePhaseTag'), /Week \$\{cyclePos\} of \$\{DELOAD_CYCLE_WEEKS\} · Deload/);
  const render = extractFunction(src, 'renderWorkout');
  assert.match(render, /const inDeloadWeek = await isDeloadWeek\(\);/, 'the header asks isDeloadWeek(), which includes the manual toggle');
  assert.match(render, /mesocyclePhaseTag\(cyclePos, inDeloadWeek\)/);
});

test('REAL invocation (v3.382): the cycle phase is one row carrying both its training and its food advice', async (assert)=>{
  assert.ok(!SOURCES.includes('getCyclePhaseNutritionInsight'));
  assert.doesNotMatch(src, /function getCyclePhaseNutritionInsight\(/);
  const d = new Date(); d.setDate(d.getDate() - 19); // day 20 of 28: luteal
  const last = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const { window } = runJsdom('', `
    window.storage = { get: async k => k === 'cycle-data' ? { value: JSON.stringify({ lastPeriod: '${last}', cycleLength: 28 }) } : null };
    function isCycleTrackingEnabled(){ return true; }
  `, [extractConst(src, 'CYCLE_PHASES'), extractFunction(src, 'getTodayKey'), extractFunction(src, 'computeCyclePhase'), extractFunction(src, 'getCycleInsight')]);
  const row = await window.getCycleInsight();
  assert.strictEqual((row.match(/Luteal Phase/g) || []).length, 1, 'the phase is named once');
  assert.match(row, /technique work and moderate intensity/, 'its training advice');
  assert.match(row, /<b>Food:<\/b> Slightly higher calorie needs/, 'and its food advice');
  assert.match(row, /data-jump-to="nutritionHeader"/);
});

const wait = ms => new Promise(r => setTimeout(r, ms));
const swipeAway = async (w, id) => { w.document.querySelector(`[data-priority="${id}"]`).closest('.swipe-item').querySelector('.swipe-delete-bg').click(); await wait(260); };

test('REAL invocation (v3.383): every row is a swipe item whose action is labelled for what it does', async (assert)=>{
  const w = mount({ getWaterPaceInsight: '<b>Hydration check:</b> 20/96 oz', getBackupReminderInsight: '<b>Back up.</b>' });
  await w.renderTodayInsights();
  // 2026-10-28 (v3.463): rows after the first sit in the fold, one level down.
  const items = [...w.document.querySelectorAll('#todayInsightsList .swipe-item')];
  assert.strictEqual(items.length, 2);
  assert.deepStrictEqual(items.map(i => i.querySelector('.today-insight-row').dataset.priority), ['waterPace', 'backup'], 'in the list\'s order');
  for(const i of items) assert.strictEqual(i.querySelector('.swipe-delete-bg').getAttribute('aria-label'), 'Hide until tomorrow');
});

test('REAL invocation (v3.383): a swiped row is hidden for today, remembered, and Undo brings it back', async (assert)=>{
  const w = mount({ getWaterPaceInsight: '<b>Hydration check:</b> 20/96 oz', getBackupReminderInsight: '<b>Back up.</b>' });
  await w.renderTodayInsights();
  await swipeAway(w, 'waterPace');
  assert.deepStrictEqual(rowsOf(w), ['Back up.']);
  assert.strictEqual(w.__toast, 'Hidden until tomorrow');
  const saved = JSON.parse(w.__store['priorities-hidden']);
  assert.deepStrictEqual(saved.ids, ['waterPace']);
  assert.match(saved.date, /^\d{4}-\d{2}-\d{2}$/);
  await w.renderTodayInsights();
  assert.deepStrictEqual(rowsOf(w), ['Back up.'], 'stays hidden on the next render');
  await w.__undo();
  assert.deepStrictEqual(rowsOf(w), ['Hydration check: 20/96 oz', 'Back up.']);
});

test('REAL invocation (v3.383): a row hidden on another day shows again; hiding the last row hides the card', async (assert)=>{
  const w = mount({ getWaterPaceInsight: '<b>Hydration check:</b> 20/96 oz' }, { 'priorities-hidden': JSON.stringify({ date: '2020-01-01', ids: ['waterPace'] }) });
  await w.renderTodayInsights();
  assert.deepStrictEqual(rowsOf(w), ['Hydration check: 20/96 oz'], 'yesterday\'s hide has expired');
  await swipeAway(w, 'waterPace');
  assert.strictEqual(w.document.getElementById('todayInsightsCard').style.display, 'none');
});

// v3.463 — One priority up front. Three or four boxed paragraphs sat above the
// workout (they stay above it: test-today-session-first.js); now the first
// shows and the rest fold behind "Show N more". The list's order already puts
// the most important first, and the safety row always leads.
test('REAL invocation (v3.463): the top row shows, the rest fold behind Show N more, and every row still swipes', async (assert)=>{
  const w = mount({ getPregnancyHeatInsight: '<b>Heat.</b>', getReadinessInsight: '<b>Readiness:</b> ok', getWaterPaceInsight: '<b>Water</b>', getBackupReminderInsight: '<b>Back up.</b>' });
  await w.renderTodayInsights();
  const list = w.document.getElementById('todayInsightsList');
  const shown = [...list.children].filter(c => c.classList.contains('swipe-item'));
  assert.strictEqual(shown.length, 1, 'one row up front');
  assert.strictEqual(shown[0].querySelector('[data-priority]').dataset.priority, 'pregnancyHeat', 'the safety row leads');
  const fold = list.querySelector('.expand-wrap');
  assert.ok(fold && !fold.classList.contains('open'), 'the rest start folded');
  assert.strictEqual(fold.querySelectorAll('.swipe-item').length, 3);
  assert.strictEqual(list.querySelector('.show-more-btn').textContent, 'Show 3 more priorities');
  assert.strictEqual(list.querySelectorAll('.swipe-delete-bg[aria-label="Hide until tomorrow"]').length, 4, 'folded rows still swipe away');
});

test('REAL invocation (v3.463): a single priority has no fold', async (assert)=>{
  const w = mount({ getBackupReminderInsight: '<b>Back up.</b>' });
  await w.renderTodayInsights();
  assert.strictEqual(w.document.querySelector('#todayInsightsList .show-more-btn'), null);
  assert.deepStrictEqual(rowsOf(w), ['Back up.']);
});

run();
