'use strict';
// Weekly recap (owner: "Let's do them all", after a review: a Monday summary
// of last week on Today, from data the app already has).
//
// v3.475 — One week's stats in one place. archiveCurrentWeek (Saved Weeks)
// computed the week's averages inline; they're now computeWeekStats, so the
// recap reads the same numbers a saved week does. No change in behaviour.
const { makeRunner, readIndexSource, extractFunction, extractConst, extractElementById, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-weekly-recap.js');
const src = readIndexSource();

const DATA = {
  weight: [{date:'2026-10-18', weight:182}, {date:'2026-10-19', weight:181}, {date:'2026-10-23', weight:180}, {date:'2026-10-26', weight:179}],
  workouts: ['2026-10-18', '2026-10-19', '2026-10-21', '2026-10-24', '2026-10-26'],
  food: {'2026-10-19':{cal:2000, pro:150, fat:70, carb:200}, '2026-10-20':{cal:2200, pro:130, fat:80, carb:220}, '2026-10-26':{cal:9999, pro:1, fat:1, carb:1}},
  water: {'2026-10-19': 80, '2026-10-25': 100},
  sleep: [{date:'2026-10-19', hours:7}, {date:'2026-10-20', hours:6.5}, {date:'2026-10-27', hours:9}],
};
function weekWindow(){
  return runJsdom('', `
    window.fetchAllWeightEntries = async () => ${JSON.stringify(DATA.weight)};
    window.fetchWorkoutDates = async () => new Set(${JSON.stringify(DATA.workouts)});
    window.fetchFoodDays = async () => (${JSON.stringify(DATA.food)});
    window.fetchWaterDays = async () => (${JSON.stringify(DATA.water)});
    window.storage = { get: async k => k === 'sleep-log' ? { value: ${JSON.stringify(JSON.stringify(DATA.sleep))} } : null };`,
    [extractFunction(src, 'computeWeekStats')]).window;
}

test('REAL invocation (v3.475): a Monday-to-Sunday week, nothing from either side', async (assert)=>{
  const s = await weekWindow().computeWeekStats('2026-10-19');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(s)), {
    avgWeight: 180.5, workoutsCount: 3, daysLogged: 2, avgCal: 2100, avgPro: 140, avgFat: 75, avgCarb: 210, avgWater: 90, avgSleep: 6.8,
  });
});

test('REAL invocation (v3.475): an empty week has no averages, not zeros', async (assert)=>{
  const s = await weekWindow().computeWeekStats('2026-11-02');
  assert.strictEqual(s.workoutsCount, 0);
  for(const k of ['avgWeight', 'avgCal', 'avgPro', 'avgWater', 'avgSleep']) assert.strictEqual(s[k], null, k);
});

test('REAL source (v3.475): Saved Weeks reads its numbers from computeWeekStats, with no second copy of the averaging', (assert)=>{
  const archive = extractFunction(src, 'archiveCurrentWeek');
  assert.match(archive, /computeWeekStats\(todayMonday\)/);
  assert.doesNotMatch(archive, /reduce\(/, 'no inline averages left');
  assert.strictEqual((src.match(/const avgSleep = weekSleep\.length/g) || []).length, 1, 'one implementation');
});

// v3.476 — The Monday recap. A row in Today's Priorities (so it folds,
// swipes away and orders like the others), on Mondays only: last week's
// workouts, average food and sleep, and the change in average weight against
// the week before. Facts only; days logged said when it wasn't all seven.
function recap(todayKey, data){
  const d = data || DATA;
  return runJsdom('', `
    window.getTodayKey = () => '${todayKey}';
    var weightUnit = 'lb'; var LB_PER_KG = 0.453592;
    window.fetchAllWeightEntries = async () => ${JSON.stringify(d.weight)};
    window.fetchWorkoutDates = async () => new Set(${JSON.stringify(d.workouts)});
    window.fetchFoodDays = async () => (${JSON.stringify(d.food)});
    window.fetchWaterDays = async () => (${JSON.stringify(d.water)});
    window.storage = { get: async k => k === 'sleep-log' ? { value: ${JSON.stringify(JSON.stringify(d.sleep))} } : null };`,
    // 2026-11-22 (v3.623, UX-11): the line steps aside once the week's sheet has shown (weeklyRecapSeenThisWeek).
    ['parseDateKey', 'dateKeyMinusDays', 'mondayOf', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'computeWeekStats', 'weeklyRecapSeenThisWeek', 'getWeeklyRecapInsight'].map(n => extractFunction(src, n)).concat([extractConst(src, 'RECAP_SEEN_KEY')])).window;
}

test('REAL invocation (v3.476): on a Monday, last week in one line', async (assert)=>{
  const row = await recap('2026-10-26').getWeeklyRecapInsight();
  assert.strictEqual(row, '<b>Last week:</b> 3 workouts · 2,100 cal and 140 g protein a day (2 days logged) · 6.8 h sleep a night · average weight −1.5 lb.',
    'week of Oct 19: avg 180.5 lb against 182 lb the week before');
});

test('REAL invocation (v3.476): any other day, nothing', async (assert)=>{
  for(const day of ['2026-10-27', '2026-10-25', '2026-10-31']) assert.strictEqual(await recap(day).getWeeklyRecapInsight(), null, day);
});

test('REAL invocation (v3.476): a Monday after an empty week says nothing; a week with only workouts says only that', async (assert)=>{
  const empty = {weight:[], workouts:[], food:{}, water:{}, sleep:[]};
  assert.strictEqual(await recap('2026-10-26', empty).getWeeklyRecapInsight(), null);
  const one = {...empty, workouts:['2026-10-21']};
  assert.strictEqual(await recap('2026-10-26', one).getWeeklyRecapInsight(), '<b>Last week:</b> 1 workout.');
});

test('REAL source (v3.476): the recap is asked for, and sits under the session heads-up', (assert)=>{
  const render = extractFunction(src, 'renderTodayInsights');
  assert.match(render, /getWeeklyRecapInsight\(\)/);
  // v3.554 (BL-23): earlyDeload now sits between readiness and the heads-up.
  assert.match(render, /const order = \['pregnancyHeat', 'readiness', 'earlyDeload', 'sessionHeadsUp', 'weeklyRecap', 'deficit',/);
});

// ---- v3.623 (UX-11): the weekly recap as a sheet ------------------------------
// On the first Today of a new week (when last week had training), once per week
// ('weekly-recap-seen', owner-approved 2026-11-22): the week strip (one block per
// program day: trained in its plate ink, missed hatched, rest in the off ink),
// the missed day named, sessions of planned, sets and time, new bests, this
// week's phase line. It replaces the Monday line above for that week.
// Real invocation: the real VIEW_RENDERERS.today, maybeShowWeeklyRecap,
// weeklyRecapModel, weekStripStates, computeWeekStats, weekShareTrainingStats,
// weekShareCardData, openRecapSheet, getWeeklyRecapInsight, dayInk,
// mesocyclePhaseTag over the real programs and #recapSheet markup; storage and
// the corpus readers stubbed at the boundary; today fixed at Monday 2026-11-16.
// Sabotage: mark rest days as missed and criterion 1 fails.
const LAST_MON = '2026-11-09';
function sheetWindow({program = 'strength', mesoWeek = 4, workoutKeys, exCorpus, prs = [], cycleStart = '2026-09-07', activityDates = null, extra = ''} = {}){
  const wk = workoutKeys || [['2026-11-09', 'd1'], ['2026-11-10', 'd2'], ['2026-11-11', 'd3'], ['2026-11-12', 'd4']];
  // Day 5 is logged only as sets (no checkbox ticked): still trained.
  const ex = exCorpus || [{parsed: {program: 'strength', dayId: 'd5', idx: 0}, exDef: {name: 'Squat'}, log: [{date: '2026-11-13', sets: [{weight: 225, reps: 5}, {weight: 225, reps: 5}]}]},
    {parsed: {program: 'strength', dayId: 'd1', idx: 0}, exDef: {name: 'Bench Press'}, log: [{date: '2026-11-09', sets: Array.from({length: 18}, () => ({weight: 160, reps: 5}))}]}];
  const html = extractElementById(src, 'recapSheet');
  const { window } = runJsdom(html, `
    var weightUnit = 'lb', LB_PER_KG = 0.453592, activeProgram = ${JSON.stringify(program)}, activeDay = 'd1';
    window.getTodayKey = () => '2026-11-16';
    var __store = ${JSON.stringify(Object.assign(cycleStart ? {'program-cycle-start': cycleStart} : {}, activityDates ? {'activity-dates': JSON.stringify(activityDates)} : {}))};
    window.__recapSets = 0;
    window.storage = { get: async k => k in __store ? {value: __store[k]} : null, set: async (k, v) => { if(k === 'weekly-recap-seen') window.__recapSets++; __store[k] = v; } };
    window.fetchAllWeightEntries = async () => [];
    window.fetchWorkoutDates = async () => new Set(${JSON.stringify(wk.map(x => x[0]))});
    window.fetchFoodDays = async () => ({}); window.fetchWaterDays = async () => ({});
    window.readWorkoutCorpus = async () => ${JSON.stringify(wk.map(([date, dayId]) => ({date, dayId, anyDone: true})))};
    window.readExCorpus = async () => ${JSON.stringify(ex)};
    window.reconstructAllPRs = async () => ${JSON.stringify(prs)};
    window.getMesocycleWeek = async () => ${mesoWeek}; window.isDeloadWeek = async () => false;
    window.getWorkoutTimeWindow = async (d) => ({'2026-11-09': {first: '17:00', last: '18:00'}, '2026-11-10': {first: '17:00', last: '17:50'}})[d] || null;
    window.__shared = []; window.shareCelebrationCard = (c, b) => { window.__shared.push(c); };
    window.preloadShareCardFont = () => {}; window.renderStreak = () => {}; window.__insights = 0; window.renderTodayInsights = () => { window.__insights++; };
    ${extra}`,
    [extractConst(src, 'programs'), extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'DAY_INKS'), extractConst(src, 'DELOAD_CYCLE_WEEKS'), extractConst(src, 'ACCUMULATION_ADDS'),
     extractConst(src, 'VOLUME_MODIFIER_PROGRAMS'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'), extractConst(src, 'RECAP_SEEN_KEY'),
     `var dayDefs = programs.strength.days; var dayOrder = Object.keys(dayDefs);`,
     ...['parseDateKey', 'formatDate', 'formatShortDate', 'dateKeyMinusDays', 'mondayOf', 'escapeHtml', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'dayInk',
       'cycleWeekOf', 'mesocyclePhaseTag', 'isCustomProgramKey', 'volumeModifiersApply', 'bestLabel', 'isLoggedSet', 'computeWeekStats', 'weekShareTrainingStats',
       'weekShareCardData', 'blockShareCardData', 'blockRecap', 'blockGainShown', 'isMissedSet', 'estimated1RM' /* v3.645 (MKT-05) */, 'weekStripStates', 'weeklyRecapModel', 'recapMissedLine', 'openRecapSheet', 'closeRecapSheet', 'weeklyRecapSeenThisWeek',
       'recapMayOpen', 'maybeShowWeeklyRecap', 'getWeeklyRecapInsight'].map(n => extractFunction(src, n)),
     'let recapCheckInflight = null, recapNothingFor = null;', extractConst(src, 'VIEW_RENDERERS'), 'window.VIEW_RENDERERS = VIEW_RENDERERS;']);
  return window;
}
const tick = () => new Promise(r => setTimeout(r, 20));

test('UX-11 criterion 1: Days 1, 2, 4, 5 trained, Day 3 cardio logged, Day 6 missed: the strip reads trained ×5, missed, rest, each block in its day\'s plate class', async (assert)=>{
  const w = sheetWindow();
  w.VIEW_RENDERERS.today(); await tick();
  const blocks = [...w.document.querySelectorAll('#recapStrip .recap-block')];
  assert.deepStrictEqual(blocks.map(b => b.dataset.state), ['trained', 'trained', 'trained', 'trained', 'trained', 'missed', 'rest']);
  const plates = Object.values(w.eval('programs.strength.days')).map(d => d.plate);
  blocks.forEach((b, i) => assert.ok(b.classList.contains(plates[i]), `block ${i + 1}: ${plates[i]}`));
  assert.ok(blocks[0].classList.contains('ink-red') && blocks[1].classList.contains('ink-blue'), 'in the day inks (dayInk)');
  assert.strictEqual(blocks[6].textContent, 'OFF');
  assert.match(w.document.getElementById('recapMissed').textContent, /^Day 6's Active Recovery was skipped\. Everything else ran as planned\.$/);
});

test('UX-11 criterion 2: the sessions figure is computeWeekStats(...).workoutsCount; no figure on the sheet repeats another', async (assert)=>{
  const w = sheetWindow();
  const stats = await w.computeWeekStats(LAST_MON);
  w.VIEW_RENDERERS.today(); await tick();
  const figs = [...w.document.querySelectorAll('#recapTotals .finish-total')].map(t => ({v: t.querySelector('.finish-total-v').childNodes[0].textContent, l: t.querySelector('.finish-total-l').textContent}));
  assert.deepStrictEqual(figs.map(f => f.l), ['Sessions', 'Sets', 'Time']);
  assert.strictEqual(figs[0].v, String(stats.workoutsCount));
  assert.match(w.document.querySelector('#recapTotals .finish-total-v small').textContent, /\/ 6/, 'of 6 planned (7 days, one rest)');
  const numbers = [stats.workoutsCount, 6, ...figs.slice(1).map(f => Number(f.v))];
  assert.strictEqual(new Set(numbers).size, numbers.length, 'all distinct: ' + numbers.join(', '));
  assert.strictEqual(figs[2].v, '110', 'time: the two windows, 60 + 50 min');
});

test('UX-11 criterion 3: it opens once per week; a second showView(\'today\') the same week doesn\'t reopen it', async (assert)=>{
  const w = sheetWindow();
  w.VIEW_RENDERERS.today(); await tick();
  const sheet = w.document.getElementById('recapSheet');
  assert.ok(sheet.classList.contains('active'), 'first Today of the week: open');
  w.closeRecapSheet();
  w.VIEW_RENDERERS.today(); await tick();
  assert.ok(!sheet.classList.contains('active'), 'not again this week');
  assert.strictEqual(w.eval('__store')['weekly-recap-seen'], '2026-11-16');
  // Two renders in the same tick open it once.
  const w2 = sheetWindow();
  w2.VIEW_RENDERERS.today(); w2.VIEW_RENDERERS.today(); await tick();
  assert.strictEqual(w2.__recapSets, 1, 'one check, one mark');
  assert.ok(w2.document.getElementById('recapSheet').classList.contains('active'));
  // A week with no training shows no sheet (and marks nothing).
  const quiet = sheetWindow({workoutKeys: [], exCorpus: []});
  quiet.VIEW_RENDERERS.today(); await tick();
  assert.ok(!quiet.document.getElementById('recapSheet').classList.contains('active'));
  assert.ok(!('weekly-recap-seen' in quiet.eval('__store')));
});

test('UX-11 criterion 4: the strip\'s accessible name lists each day and its state', async (assert)=>{
  const w = sheetWindow();
  w.VIEW_RENDERERS.today(); await tick();
  const strip = w.document.getElementById('recapStrip');
  assert.strictEqual(strip.getAttribute('role'), 'img');
  assert.strictEqual(strip.getAttribute('aria-label'), 'Last week: Day 1, trained; Day 2, trained; Day 3, trained; Day 4, trained; Day 5, trained; Day 6, missed; Day 7, rest');
});

test('UX-11 criterion 5: before the sheet, the real getWeeklyRecapInsight gives its Monday line; after the sheet has opened that week, nothing', async (assert)=>{
  const w = sheetWindow();
  assert.match(await w.getWeeklyRecapInsight(), /^<b>Last week:<\/b> 4 workouts\.$/);
  w.VIEW_RENDERERS.today(); await tick();
  assert.ok(w.document.getElementById('recapSheet').classList.contains('active'), 'anchor: it opened');
  assert.strictEqual(await w.getWeeklyRecapInsight(), null);
});

test('UX-11 criterion 6: a MEDICAL_STYLES program gets no Share; the first week says so (never "0 weeks") and what week 2 brings', async (assert)=>{
  const med = Object.keys(require('vm').runInNewContext('(' + extractConst(src, 'MEDICAL_STYLES').replace(/^const MEDICAL_STYLES\s*=\s*/, '').replace(/;\s*$/, '') + ')'))[0];
  const m = sheetWindow({program: med});
  m.VIEW_RENDERERS.today(); await tick();
  assert.ok(m.document.getElementById('recapSheet').classList.contains('active'), 'anchor: opened on ' + med);
  assert.strictEqual(m.document.getElementById('recapShare').hidden, true, 'no Share');
  const s = sheetWindow();
  s.VIEW_RENDERERS.today(); await tick();
  assert.strictEqual(s.document.getElementById('recapShare').hidden, false, 'anchor: Share on strength');
  s.document.getElementById('recapShare').click();
  assert.strictEqual(s.__shared[0].kind, 'week', 'MKT-02\'s week card');
  assert.strictEqual(JSON.stringify(s.__shared[0].stats.map(x => x.label)), JSON.stringify(['WORKOUTS', 'PROGRAM', 'SETS']));
  assert.match(s.document.getElementById('recapTitle').textContent, /^Week 3, done$/);
  // The program began last week (program-cycle-start 2026-11-10): the first-week variant.
  const first = sheetWindow({mesoWeek: 2, cycleStart: '2026-11-10'});
  first.VIEW_RENDERERS.today(); await tick();
  assert.strictEqual(first.document.getElementById('recapTitle').textContent, 'Your first week, done');
  assert.ok(!/\b0 weeks?\b|Week 0/.test(first.document.getElementById('recapSheet').textContent));
  const w2 = sheetWindow({mesoWeek: 2});
  w2.VIEW_RENDERERS.today(); await tick();
  assert.match(w2.document.getElementById('recapNext').textContent, /^Next: Week 2 of 5 · Accumulation\. One more set on your first compound lift\.$/, 'what week 2 brings');
});

test('UX-11: new records use the one labeller (summit R6 wording)', async (assert)=>{
  const w = sheetWindow({prs: [{date: '2026-11-12', name: 'Bench Press', weight: 165, reps: 5, type: 'weight'}, {date: '2026-11-02', name: 'Squat', weight: 225, reps: 5, type: 'weight'}]});
  w.VIEW_RENDERERS.today(); await tick();
  const rows = [...w.document.querySelectorAll('#recapBests .finish-next-row')];
  assert.strictEqual(rows.length, 1, 'only last week\'s');
  assert.match(rows[0].textContent, /Bench Press\s*Heaviest weight yet\s*165 lb × 5/);
});

test('UX-11 review fixes: a lift\'s latest record of the week shows (newest first); a record with no reps prints no "× null"', async (assert)=>{
  const w = sheetWindow({prs: [{date: '2026-11-12', name: 'Bench Press', weight: 165, reps: 5, type: 'weight'}, {date: '2026-11-09', name: 'Bench Press', weight: 160, reps: 5, type: 'weight'},
    {date: '2026-11-10', name: 'Squat', weight: 245, reps: null, type: 'weight'}]});
  w.VIEW_RENDERERS.today(); await tick();
  const text = w.document.getElementById('recapBests').textContent;
  assert.match(text, /Bench Press\s*Heaviest weight yet\s*165 lb × 5/, 'the 12th, not the 9th');
  assert.ok(!/160 lb/.test(text));
  assert.match(text, /Squat\s*Heaviest weight yet\s*245 lb(?! ×)/);
  assert.ok(!/null/.test(text));
});

test('UX-11 review fixes: the title names a week only when known; a week that didn\'t count says "Last week, done"', async (assert)=>{
  const one = sheetWindow({workoutKeys: [['2026-11-09', 'd1']], exCorpus: []});
  one.VIEW_RENDERERS.today(); await tick();
  assert.strictEqual(one.document.getElementById('recapTitle').textContent, 'Last week, done', 'one session: not a counted week');
});

// 2026-11-24 (v3.653, UX-17b): the "never over gym mode" case retired with Gym mode.
test('UX-11 review fixes: never over another overlay, or another view; a week with nothing to recap isn\'t rebuilt on every Today', async (assert)=>{
  assert.ok(!/gymModeActive/.test(extractFunction(src, 'recapMayOpen')), 'v3.653: recapMayOpen no longer reads gym mode');
  // What's New opens while the model is being built: the second check holds it back.
  const late = sheetWindow({extra: `document.body.insertAdjacentHTML('beforeend', '<div id="whatsNewOverlay"></div>'); var SCROLL_LOCK_OVERLAYS = ['whatsNewOverlay'];
    const __cws = computeWeekStats; window.computeWeekStats = async (k) => { document.getElementById('whatsNewOverlay').classList.add('active'); return __cws(k); };`});
  late.VIEW_RENDERERS.today(); await tick();
  assert.ok(!late.document.getElementById('recapSheet').classList.contains('active'), 'not stacked on What\'s New');
  const away = sheetWindow({extra: `document.body.insertAdjacentHTML('beforeend', '<button id="navToday"></button>');`});
  away.VIEW_RENDERERS.today(); await tick();
  assert.ok(!away.document.getElementById('recapSheet').classList.contains('active'), 'Today is not the view');
  const quiet = sheetWindow({workoutKeys: [], exCorpus: [], extra: `window.__models = 0; const __m = weeklyRecapModel; window.weeklyRecapModel = async (k) => { window.__models++; return __m(k); };`});
  quiet.VIEW_RENDERERS.today(); await tick(); quiet.VIEW_RENDERERS.today(); await tick();
  assert.strictEqual(quiet.__models, 1, 'built once this session');
});

// ---- v3.645 (MKT-05, owner 2026-11-23): the block-complete variant -----------
// The week that ends a 5-week block (its last counted week) recaps the block:
// "Block complete", the block's weeks and sessions of planned, the three
// biggest estimated-1RM gains in the block, and a BLOCK COMPLETE card in place
// of the week card. Never on a clinical plan or without a cycle.
// Real invocation: the real weeklyRecapModel, blockRecap, blockShareCardData,
// cycleWeekOf, estimated1RM and openRecapSheet; storage at the boundary.
// Sabotage: treat every week as the last and criterion 2 fails.
const BLOCK_START = '2026-10-12'; // five 7-day blocks to Sunday 2026-11-15
const BLOCK_DATES = ['2026-10-05', '2026-10-06', // before the block: not counted
  '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-19', '2026-10-21', '2026-10-23', '2026-10-26', '2026-10-28', '2026-11-02', '2026-11-04', '2026-11-06',
  '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-13'];
const ex = (dayId, name, log) => ({parsed: {program: 'strength', dayId, idx: 0}, exDef: {name}, log});
const BLOCK_CORPUS = [
  ex('d1', 'Bench Press', [{date: '2026-09-28', sets: [{weight: 150, reps: 5}]}, {date: '2026-10-12', sets: [{weight: 200, reps: 5}, {weight: 190, reps: 5}]}, {date: '2026-11-09', sets: [{weight: 215, reps: 5}, {weight: 260, reps: 0}]}]),
  ex('d5', 'Squat', [{date: '2026-10-13', sets: [{weight: 250, reps: 5}]}, {date: '2026-11-13', sets: [{weight: 265, reps: 5}]}]),
  ex('d4', 'Deadlift', [{date: '2026-10-14', sets: [{weight: 300, reps: 5}]}, {date: '2026-11-11', sets: [{weight: 320, reps: 5}]}]),
  ex('d2', 'Overhead Press', [{date: '2026-10-15', sets: [{weight: 100, reps: 5}]}, {date: '2026-11-10', sets: [{weight: 105, reps: 5}]}]),
];
const blockWindow = (opts = {}) => sheetWindow(Object.assign({mesoWeek: 6, cycleStart: BLOCK_START, activityDates: BLOCK_DATES, exCorpus: BLOCK_CORPUS}, opts));

test('MKT-05 criterion 1: the recap of week 5 of a 5-week strength block is the block variant; its share data is BLOCK COMPLETE', async (assert)=>{
  const w = blockWindow();
  const m = await w.weeklyRecapModel(LAST_MON);
  assert.strictEqual(w.cycleWeekOf(6 - 1), 5, 'anchor: last week was week 5 of 5 (getMesocycleWeek says 6 today)');
  assert.ok(m.block, 'the block variant');
  assert.strictEqual(m.title, 'Block complete');
  assert.strictEqual(m.share.headline, 'BLOCK COMPLETE');
  assert.strictEqual(m.share.kind, 'block');
  assert.strictEqual(m.block.weeks, 5);
  assert.strictEqual(m.block.startKey, BLOCK_START);
  // Days this program had work in the block: the four workout keys of last week and the corpus's in-block log dates (not 2026-09-28's).
  assert.strictEqual(m.block.sessions, 9);
  assert.strictEqual(m.block.endKey, '2026-11-15');
  // The program's schedule: 5 training days a week (Days 3 and 7 are rest days; a logged Day 3 is not planned) × 5.
  const sched = w.eval("Object.keys(dayDefs).filter(id => !dayDefs[id].rest).length");
  assert.strictEqual(sched, 5, 'anchor: the schedule');
  assert.strictEqual(m.block.planned, 25);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(m.share.stats)).slice(0, 2), [{value: '5', label: 'WEEKS'}, {value: '9/25', label: 'SESSIONS'}]);
});

test('MKT-05 criterion 2: the recap of week 3 of 5 is the normal weekly recap, with no block fields', async (assert)=>{
  // The cycle began 2026-10-26: last week was its 3rd counted block.
  const w = blockWindow({mesoWeek: 4, cycleStart: '2026-10-26'});
  const m = await w.weeklyRecapModel(LAST_MON);
  assert.strictEqual(w.cycleWeekOf(4 - 1), 3, 'anchor: week 3 of 5');
  assert.strictEqual(m.block, undefined);
  assert.match(m.title, /^Week 3, done$/);
  assert.strictEqual(m.share.headline, 'WEEK COMPLETE');
  // And week 4 of 5 (the week before the last) is normal too.
  assert.strictEqual((await blockWindow({mesoWeek: 5, cycleStart: '2026-10-19'}).weeklyRecapModel(LAST_MON)).block, undefined);
});

test('MKT-05 review fix: once a block\'s week has been recapped, the next week (a week that didn\'t count) is a normal recap, not a second Block complete', async (assert)=>{
  const w = blockWindow({activityDates: [...BLOCK_DATES, '2026-11-17'], workoutKeys: [['2026-11-17', 'd1'], ['2026-11-18', 'd2']]});
  const m = await w.weeklyRecapModel('2026-11-16');
  assert.ok(m, 'anchor: a recap for that week');
  assert.strictEqual(m.block, undefined);
  assert.ok((await w.weeklyRecapModel(LAST_MON)).block, 'anchor: the week the block ended in is the block variant');
  // A block counts only its counted weeks: a 1-session week inside the span adds nothing.
  const gap = blockWindow({cycleStart: '2026-10-05', activityDates: ['2026-10-05', '2026-10-06', '2026-10-08', ...BLOCK_DATES.slice(2).filter(d => !/^2026-10-1[2-8]$/.test(d)), '2026-10-13']});
  const g = await gap.weeklyRecapModel(LAST_MON);
  assert.ok(g.block, 'anchor: five counted blocks, with an uncounted one inside');
  assert.strictEqual(g.block.startKey, '2026-10-05');
  assert.ok(!g.block.gains.some(x => x.name === 'Squat'), 'the 2026-10-13 squat, in the uncounted week, is not the baseline');
});

test('MKT-05 criterion 3: the gains are sorted biggest first, at most 3, from the fixture\'s sets (the real estimated1RM; missed sets and earlier sessions left out)', async (assert)=>{
  const w = blockWindow();
  const m = await w.weeklyRecapModel(LAST_MON);
  const e = (wt, r) => w.estimated1RM(wt, r);
  const expect = [['Deadlift', e(300, 5), e(320, 5)], ['Bench Press', e(200, 5), e(215, 5)], ['Squat', e(250, 5), e(265, 5)], ['Overhead Press', e(100, 5), e(105, 5)]]
    .map(([name, from, to]) => ({name, from, to, gain: to - from})).sort((a, b) => b.gain - a.gain).slice(0, 3);
  assert.ok(expect[0].gain > expect[2].gain, 'anchor: the fixture has distinct gains');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(m.block.gains)), expect);
  assert.ok(!m.block.gains.some(g => g.name === 'Overhead Press'), 'the fourth is left out');
  assert.strictEqual(m.share.stats[2].label, 'TOP E1RM GAIN');
  assert.strictEqual(m.share.stats[2].value, `+${expect[0].gain} lb`);
});

test('MKT-05 criterion 4: a MEDICAL_STYLES program\'s last week, and a program with no cycle started, give the normal recap, with no block share data', async (assert)=>{
  const med = Object.keys(require('vm').runInNewContext('(' + extractConst(src, 'MEDICAL_STYLES').replace(/^const MEDICAL_STYLES\s*=\s*/, '').replace(/;\s*$/, '') + ')'))[0];
  const m = await blockWindow({program: med}).weeklyRecapModel(LAST_MON);
  assert.ok(m, 'anchor: a recap');
  assert.strictEqual(m.block, undefined);
  assert.strictEqual(m.share, null);
  const none = await blockWindow({cycleStart: ''}).weeklyRecapModel(LAST_MON);
  assert.strictEqual(none.block, undefined, 'no cycle: no block');
});

test('MKT-05 criterion 5: the opened sheet (real openRecapSheet) shows exactly one Share button, which shares the block card; the gains and totals are on it', async (assert)=>{
  const w = blockWindow();
  w.VIEW_RENDERERS.today(); await tick();
  const sheet = w.document.getElementById('recapSheet');
  assert.ok(sheet.classList.contains('active'), 'anchor: opened');
  const shares = [...sheet.querySelectorAll('button')].filter(b => /share/i.test(b.textContent) && !b.hidden);
  assert.strictEqual(shares.length, 1, 'one Share');
  shares[0].click();
  assert.strictEqual(w.__shared.length, 1);
  assert.strictEqual(w.__shared[0].headline, 'BLOCK COMPLETE');
  assert.strictEqual(w.document.getElementById('recapTitle').textContent, 'Block complete');
  assert.match(w.document.getElementById('recapRange').textContent, /^Oct 12 – Nov 15 · /);
  const totals = [...sheet.querySelectorAll('#recapTotals .finish-total-l')].map(x => x.textContent);
  assert.deepStrictEqual(totals, ['Block', 'Sessions']);
  const rows = [...sheet.querySelectorAll('#recapBests .finish-next-row')];
  assert.strictEqual(rows.length, 3);
  assert.match(rows[0].textContent, /^Deadlift/);
  assert.match(sheet.querySelector('#recapBests .finish-next-head').textContent, /^Biggest gains$/);
  assert.ok(!/\bPR\b|New PR/.test(sheet.textContent), 'no "PR" wording (summit R6)');
  assert.match(w.document.getElementById('recapMissed').textContent, /^Last week: /, 'the strip and its line are last week\'s');
});

run();
