'use strict';
// v3.581 (MKT-04): finishing a session offers a share card. The stats come from
// a pure, async builder, sessionShareStats(listEl, dateKey, program), that reads
// the rendered list and storage, so it is driven for real here: the real
// function over a real jsdom list, getWorkoutTimeWindow real over stub storage,
// reconstructAllPRs stubbed at its boundary. The completing click lives inside
// renderWorkout, which can't be driven in jsdom, so the wiring is a one-site
// count of real calls (comments stripped).
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-session-share.js');
const src = readIndexSource();
const FNS = ['sessionShareStats', 'getWorkoutTimeWindow' /* v3.653 (UX-17b): no gym clock */].map(n => extractFunction(src, n));

function block(reps){
  return `<div class="exercise-block"><div class="sets-block">` + reps.map((r, i) =>
    `<div class="set-row" data-set-idx="${i + 1}"><input class="ex-input ex-weight" value="${r === '' ? '' : 100}"><input class="ex-input ex-reps" value="${r}"></div>`).join('') + `</div></div>`;
}
// 18 rows with reps across 5 exercises, plus empty rows (and one exercise with none) that must not count.
const LIST = block([5, 5, 5, 5]) + block([8, 8, 8, '']) + block([10, 10, 10, 10]) + block([12, 12, 12, 12]) + block([6, 6, 6, '']) + block(['', '']);

async function build({program = 'ppl', store = {}, prs = []} = {}){
  const { window } = runJsdom(`<div id="exerciseList">${LIST}</div>`, `
    var activeDay = 'd2';
    const MEDICAL_STYLES = {rehabAcl: {}, obesity: {}};
    const __store = ${JSON.stringify(store)};
    window.storage = { get: async k => (k in __store ? {value: __store[k]} : null) };
    async function reconstructAllPRs(){ return ${JSON.stringify(prs)}; }
  `, [...FNS, 'window.__build = (p) => sessionShareStats(document.getElementById("exerciseList"), "2026-11-16", p);']);
  const out = await window.__build(program);
  return out === undefined ? undefined : JSON.parse(JSON.stringify(out));
}

test('criterion 1: 18 rows with reps across 5 exercises read as SETS 18 and LIFTS 5', async (assert)=>{
  const d = await build();
  assert.deepStrictEqual(d.stats.find(s => s.label === 'SETS'), {value: '18', label: 'SETS'});
  assert.deepStrictEqual(d.stats.find(s => s.label === 'LIFTS'), {value: '5', label: 'LIFTS'});
  assert.strictEqual(d.headline, 'SESSION COMPLETE');
  assert.strictEqual(d.icon, 'flag');
  assert.strictEqual(d.dayId, 'd2', 'the session day sets the card ink');
});

test('criterion 2: labels are exactly SETS, LIFTS (+ MIN with a workout-time window, + PRS with a PR dated today); never load', async (assert)=>{
  const labels = d => d.stats.map(s => s.label);
  assert.deepStrictEqual(labels(await build()), ['SETS', 'LIFTS']);
  const timed = await build({store: {'workout-time:2026-11-16': JSON.stringify({first: '17:05', last: '18:02'})}});
  assert.deepStrictEqual(labels(timed), ['SETS', 'LIFTS', 'MIN']);
  assert.strictEqual(timed.stats[2].value, '57');
  const withPr = await build({store: {'workout-time:2026-11-16': JSON.stringify({first: '17:05', last: '18:02'})},
    prs: [{date: '2026-11-16', name: 'Bench'}, {date: '2026-11-09', name: 'Squat'}]});
  assert.deepStrictEqual(labels(withPr), ['SETS', 'LIFTS', 'MIN', 'PRS']);
  assert.strictEqual(withPr.stats[3].value, '1', 'only the PR dated today counts');
  const oldPrOnly = await build({prs: [{date: '2026-11-09', name: 'Squat'}]});
  assert.deepStrictEqual(labels(oldPrOnly), ['SETS', 'LIFTS']);
  for(const d of [timed, withPr]) for(const s of d.stats) assert.ok(!/LOAD|VOLUME|LB|KG/.test(s.label), s.label);
});

// 2026-11-24 (v3.653, UX-17b): "MIN comes from the Gym clock" retired with Gym
// mode. UX-17b criterion 5: MIN is the logged-time window, with no clock.
test('UX-17b criterion 5: MIN is the logged-time window (first to last set logged), > 0, with no gym clock', async (assert)=>{
  const d = await build({store: {'workout-time:2026-11-16': JSON.stringify({first: '17:05', last: '18:02'})}});
  assert.deepStrictEqual(d.stats.find(s => s.label === 'MIN'), {value: '57', label: 'MIN'});
  const code = extractFunction(src, 'sessionShareStats').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  assert.ok(/getWorkoutTimeWindow\(dateKey\)/.test(code), 'anchor: the window is read');
  assert.ok(!/gym/i.test(code), 'no gym arm left in sessionShareStats (code, not comments)');
});

test('criterion 3: a clinical program (the medical program, or a MEDICAL_STYLES key) gets no share data', async (assert)=>{
  assert.strictEqual(await build({program: 'medical'}), undefined);
  assert.strictEqual(await build({program: 'rehabAcl'}), undefined);
});

// 2026-11-17 (v3.598, UX-09a): the "Session complete!" toast became the finish
// sheet. Its Share reuses this builder through finishSheetModel, which
// renderWorkout calls once at the completing click (test-finish-sheet.js).
test('criterion 4: the session\'s share data reaches the finish sheet: one real sessionShareStats( call, in finishSheetModel, and renderWorkout opens the sheet from it', (assert)=>{
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const body = strip(extractFunction(src, 'renderWorkout'));
  assert.strictEqual((body.match(/'Session complete!'/g) || []).length, 0, 'no toast');
  // 2026-11-22 (v3.619, MKT-17): the model is held in finishModel, then opened.
  // 2026-11-25 (v3.664, BL-81): through showFinishSheet(), shared with the cover's Finish session; the helper builds the model and opens it.
  assert.strictEqual((body.match(/\bconst finishModel = await showFinishSheet\(\);/g) || []).length, 1);
  assert.match(strip(extractFunction(src, 'showFinishSheet')), /const model = await finishSheetModel\(document\.getElementById\('exerciseList'\), selectedLogDate, activeProgram\);\s*openFinishSheet\(model\);/);
  const model = strip(extractFunction(src, 'finishSheetModel'));
  assert.strictEqual((model.match(/\bsessionShareStats\(listEl, dateKey, program\)/g) || []).length, 1, 'one real call');
  assert.match(strip(extractFunction(src, 'openFinishSheet')), /shareCelebrationCard\(model\.share, 'finishShare'\)/);
});

run();
