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
  assert.match(render, /mesocyclePhaseTag\(cyclePos, inDeloadWeek, activeProgram\)/); // v3.543 (BL-66): the program decides the phase word
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
  // v3.533 (BL-13): the training advice is the evidence line, not phase-based training.
  assert.ok(row.includes('Research shows no reliable phase effect on strength or muscle gain. Train to your plan and adjust to how you feel on the day.'), 'its training advice');
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

// ── v3.610 (UX-27): under the session, as one line ─────────────────────────
// The real #todayInsightsCard markup (summary row, expand-wrap, list), the
// real renderTodayInsights with the getters stubbed, the real togglePriorities
// and its wiring statement.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { extractElementById } = require('./testHelpers.js');
const PAGE = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const WIRE = (()=>{ const a = src.indexOf("document.getElementById('prioritiesSummary').addEventListener('click', togglePriorities);"); if(a < 0) throw new Error('wiring not found'); return src.slice(a, src.indexOf('\n', a)); })();
function mountSection(rows, stored){
  const stubs = SOURCES.map(n => `async function ${n}(){ return ${JSON.stringify(rows[n] || null)}; }`).join('\n');
  const { window } = runJsdom(extractElementById(src, 'todayInsightsCard'), `
    window.__store = ${JSON.stringify(stored || {})};
    window.__writes = [];
    window.storage = { get: async k => k in window.__store ? { value: window.__store[k] } : null, set: async (k, v) => { window.__writes.push([k, v]); window.__store[k] = v; } };
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }`,
    [stubs, extractFunction(src, 'getTodayKey'), extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'), ...['getHiddenPriorities', 'setHiddenPriorities', 'buildSwipeItem', 'makeSwipeable', 'renderCollapsibleList', 'togglePriorities'].map(n => extractFunction(src, n)), renderSrc, WIRE]);
  const $ = id => window.document.getElementById(id);
  return { window, $, open: () => $('prioritiesWrap').classList.contains('open') };
}
const RECAP = '<b>Last week:</b> 4 workouts · 2,130 cal and 170 g protein a day';

test('UX-27 criterion 1: real markup: #todayInsightsCard follows .today-session-pane in document order (and is still a direct child of Today, so gym mode hides it)', (assert)=>{
  const { document } = new JSDOM(PAGE.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  const card = document.getElementById('todayInsightsCard'), pane = document.querySelector('#todayView > .today-session-pane');
  assert.ok(pane.compareDocumentPosition(card) & 4, 'after the session pane');
  assert.ok(!pane.contains(card), 'not inside it');
  assert.strictEqual(card.parentElement.id, 'todayView');
  assert.ok(card.matches('#todayView > .card:not(#workoutCard)'), 'gym mode\'s hide rule still matches it');
  assert.ok(document.getElementById('upNext').compareDocumentPosition(card) & 4, 'below the cover');
});

test('UX-27 criterion 2: with only the weekly recap the summary reads "1 note · Last week: …" and the section is closed; a readiness row opens it and leads the summary', async (assert)=>{
  const a = mountSection({ getWeeklyRecapInsight: RECAP });
  await a.window.renderTodayInsights();
  assert.match(a.$('prioritiesSummaryText').textContent, /^1 note · Last week: 4 workouts/);
  assert.ok(!a.open(), 'closed by default');
  assert.strictEqual(a.$('prioritiesSummary').getAttribute('aria-expanded'), 'false');
  const b = mountSection({ getWeeklyRecapInsight: RECAP, getReadinessInsight: '<b>Readiness:</b> shoulder resting, go lighter today.' }, {'today-priorities-open': '0'});
  await b.window.renderTodayInsights();
  assert.match(b.$('prioritiesSummaryText').textContent, /^2 notes · Readiness: shoulder resting/, 'readiness leads');
  assert.ok(b.open(), 'a safety row opens it, whatever the preference');
  assert.strictEqual(b.$('prioritiesSummary').getAttribute('aria-expanded'), 'true');
  // Every safety source does it, and the summary names it even when it isn't first in the list.
  for(const [getter, text] of [['getPregnancyHeatInsight', '<b>Heat.</b> Avoid hot rooms.'], ['getDeficitGuardrailInsight', '<b>Eating too little:</b> 900 cal'], ['getEarlyDeloadInsight', '<b>Deload early?</b>'], ['getStaleRestingRegionInsight', '<b>Shoulder still resting.</b>']]){
    const c = mountSection({ getWeeklyRecapInsight: RECAP, getWaterPaceInsight: '<b>Water</b>', [getter]: text }, {'today-priorities-open': '0'});
    await c.window.renderTodayInsights();
    assert.ok(c.open(), getter + ' opens it');
    assert.ok(c.$('prioritiesSummaryText').textContent.startsWith('3 notes · ' + text.replace(/<[^>]+>/g, '')), getter + ' leads the summary');
  }
});

test('UX-27 criterion 3: tapping toggles and writes today-priorities-open through window.storage; a re-render honours it', async (assert)=>{
  const ui = mountSection({ getWeeklyRecapInsight: RECAP, getWaterPaceInsight: '<b>Water</b>' });
  await ui.window.renderTodayInsights();
  assert.ok(!ui.open(), 'anchor: closed');
  ui.$('prioritiesSummary').click();
  assert.ok(ui.open(), 'one tap opens it');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__writes.filter(w => w[0] === 'today-priorities-open'))), [['today-priorities-open', '1']]);
  await ui.window.renderTodayInsights();
  assert.ok(ui.open(), 'a re-render keeps it open');
  ui.$('prioritiesSummary').click();
  assert.ok(!ui.open());
  assert.strictEqual(ui.window.__store['today-priorities-open'], '0');
  await ui.window.renderTodayInsights();
  assert.ok(!ui.open(), 'and keeps it closed');
  const btn = ui.$('prioritiesSummary');
  assert.strictEqual(btn.getAttribute('aria-controls'), 'prioritiesWrap');
});

test('UX-27: the section is ruled, not a card; the summary is a 56 pt row; the notes are ink rows with a 2 px rule (CSSOM)', (assert)=>{
  const CSS = [...PAGE.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${CSS}</style><body>${extractElementById(src, 'todayInsightsCard').replace(' style="display:none"', '')}</body>`);
  const doc = window.document, cs = el => window.getComputedStyle(el);
  const card = doc.getElementById('todayInsightsCard');
  assert.ok(['transparent', 'rgba(0, 0, 0, 0)'].includes(cs(card).backgroundColor), 'no card fill');
  assert.strictEqual(cs(card).borderRadius, '0px');
  assert.ok(parseFloat(cs(doc.getElementById('prioritiesSummary')).minHeight) >= 56);
  doc.getElementById('todayInsightsList').innerHTML = '<div class="today-insight-row">x</div>';
  const row = cs(doc.querySelector('.today-insight-row'));
  assert.strictEqual(row.color, 'var(--text)');
  assert.ok(['transparent', 'rgba(0, 0, 0, 0)', 'none'].includes(row.backgroundColor), 'no tinted box');
});

run();
