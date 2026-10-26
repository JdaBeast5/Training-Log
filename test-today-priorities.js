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
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-priorities.js');
const src = readIndexSource();
const renderSrc = extractFunction(src, 'renderTodayInsights');

// Every source the real renderer awaits, by the name it calls. A test sets
// the ones it cares about; the rest return null (nothing to say today).
const SOURCES = [...renderSrc.matchAll(/\b(get[A-Za-z]+Insight)\(\)/g)].map(m => m[1]);
function mount(rows){
  const stubs = SOURCES.map(n => `async function ${n}(){ return ${JSON.stringify(rows[n] || null)}; }`).join('\n');
  const { window } = runJsdom('<div class="card" id="todayInsightsCard" style="display:none"><div id="todayInsightsList"></div></div>', '', [stubs, renderSrc]);
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

run();
