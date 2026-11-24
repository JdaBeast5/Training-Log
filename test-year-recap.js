'use strict';
// v3.548 (MKT-06a): Year in Lifting, the computation, its Priorities row and
// one summary story card. computeYearRecap(year) counts distinct training
// dates from activity-dates, and logged sets and load from the set history;
// getYearRecapInsight shows a row from 1 December to 15 January when the year
// has at least 8 training dates, unless recap-<year>-dismissed is stored. The
// card leads with sets; load is computed but never drawn (owner D15). No share
// button while a medical program is active.
//
// Real invocation: the real recap functions over a stub storage and a stubbed
// readExCorpus with a fixed date; the real renderTodayInsights (other getters
// stubbed) for the row's slot and its Hide button; the real buildShareCardBlob
// and its helpers with a recording canvas for the card.
//
// Sabotage: count calendar days from the first to the last training date
// instead of training dates, and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runJsdom, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-year-recap.js');

const LET_SHOWN = /^let yearRecapShown = null;/m.exec(src)[0];
const RECAP = [extractConst(src, 'YEAR_RECAP_MIN_DATES'), LET_SHOWN, ...['isLoggedSet', 'yearRecapYearFor', 'yearRecapFrom', 'computeYearRecap', 'getYearRecapInsight', 'yearRecapCard', 'shareYearRecapCard'].map(f => extractFunction(src, f))];

// 120 training dates in 2026 (every third day from 2 January), some logged
// twice, plus 2025 and 2027 dates that must not count.
function fixture(n = 120){
  const dates = [];
  const d = new Date(Date.UTC(2026, 0, 2));
  for(let i = 0; i < n; i++){ dates.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 3); }
  const all = ['2025-12-30', '2025-12-31', ...dates, dates[0], dates[5], '2027-01-02'];
  // Two exercises; each training date has a squat entry, every other one a row.
  const squat = {log: dates.map(date => ({date, sets: [{weight: 225, reps: 5}, {weight: 225, reps: 5}, {weight: 225, reps: 0}, {weight: 135, reps: null}, {weight: null, reps: null}]}))};
  const row = {log: dates.filter((_, i) => i % 2 === 0).map(date => ({date, sets: [{weight: null, reps: 12}, {weight: 95, reps: 10}, {distance: 500}]}))};
  const old = {log: [{date: '2025-12-31', sets: [{weight: 500, reps: 10}]}, {date: '2027-01-02', sets: [{weight: 500, reps: 10}]}]};
  // Sums by hand: per squat entry 3 logged sets (the 0-rep miss counts as a
  // logged set, the weight-only and empty rows don't), load 2 x 225 x 5; per
  // row entry 3 logged sets, load 95 x 10.
  const rows = Math.ceil(n / 2);
  return {dates: all, corpus: [squat, row, old], sets: n * 3 + rows * 3, load: n * 2250 + rows * 950};
}

function mount({today = '2026-12-01', store = {}, corpus = [], program = 'strength', body = '', extra = ''} = {}){
  return runJsdom(body, `
    window.__store = ${JSON.stringify(store)}; window.__fetches = 0; window.__shared = null;
    window.storage = { get: async k => k in window.__store ? { value: window.__store[k] } : null, set: async (k, v) => { window.__store[k] = v; }, delete: async k => { delete window.__store[k]; } };
    window.fetch = async () => { window.__fetches++; return { ok: true, json: async () => ({}) }; };
    window.__corpusReads = 0;
    window.readExCorpus = async () => { window.__corpusReads++; return ${JSON.stringify(corpus)}; };
    window.getTodayKey = () => '${today}';
    var activeProgram = '${program}', activeDay = 'd2';
    window.shareCelebrationCard = async (card, btnId) => { window.__shared = {card, btnId}; };
    window.preloadShareCardFont = () => {};
    ${extra}`, RECAP).window;
}
const json = (v) => JSON.parse(JSON.stringify(v));

test('criterion 1: a fixture year of 120 training dates gives sessions 120, and sets and load equal the sums over the fixture', async (assert)=>{
  const f = fixture();
  const w = mount({store: {'activity-dates': JSON.stringify(f.dates)}, corpus: f.corpus});
  const r = json(await w.computeYearRecap(2026));
  assert.deepStrictEqual(r, {year: 2026, sessions: 120, sets: f.sets, load: f.load});
  assert.strictEqual(r.sets, 540, 'anchor: 120 x 3 + 60 x 3');
});

// The card, drawn by the real share-card code with a recording canvas.
const CARD_FNS = [...['programs', 'DAY_INKS', 'CUSTOM_PLATES', 'SHARE_CARD_INKS', 'SASH_ORDER', 'APP_NAME'].map(c => extractConst(src, c)),
  ...['dayInk', 'wrapCanvasText', 'celebrationIconPath', 'shareCardFootRow', 'drawSashMark', 'drawShareCardFoot', 'drawStoryCard', 'buildShareCardBlob'].map(f => extractFunction(src, f))];
function drawCardSetup(){ return `
    var ICONS = {trophy: '<svg><path d="M8 4h8"/></svg>'}; var activeProgram = 'strength', activeDay = 'd2';
    function Path2D(){}
    var __text = [], __size = {w: 0, h: 0};
    var document = { createElement: () => { const st = {font: ''}; const c = {width: 0, height: 0, toBlob: (cb) => cb(null), getContext: () => new Proxy(st, {
      get(t, k){
        if(k === 'fillText') return (txt, x, y) => __text.push({txt: String(txt), px: Number((/(\\d+)px/.exec(st.font) || [])[1])});
        if(k === 'measureText') return (txt) => ({width: String(txt).length * 20});
        if(typeof k === 'string' && /^create/.test(k)) return () => ({addColorStop(){}});
        if(k in t) return t[k];
        return () => {};
      }, set(t, k, v){ t[k] = v; return true; }, has(t, k){ return k in t; } })}; __size = c; return c; } };`; }
function drawCard(recap){
  const [r] = runSandbox([drawCardSetup(),
    ...CARD_FNS, extractFunction(src, 'yearRecapCard')],
    `buildShareCardBlob(yearRecapCard(${JSON.stringify(recap)})); __capture.push({text: __text, w: __size.width, h: __size.height, card: yearRecapCard(${JSON.stringify(recap)})});`);
  return r;
}

test('criterion 1 and D15: the card leads with sets; the load figure is never drawn, so it is not the largest text', (assert)=>{
  const f = fixture();
  const r = drawCard({year: 2026, sessions: 120, sets: f.sets, load: f.load});
  assert.deepStrictEqual([r.w, r.h], [1080, 1920], 'MKT-03\'s story format');
  assert.deepStrictEqual(r.card.stats, [{value: '540', label: 'SETS'}, {value: '120', label: 'SESSIONS'}]);
  const largest = r.text.reduce((a, c) => c.px > a.px ? c : a);
  assert.strictEqual(largest.txt, '2026 IN LIFTING');
  const loadStrings = [String(f.load), f.load.toLocaleString('en-US')];
  assert.ok(!r.text.some(c => loadStrings.some(s => c.txt.includes(s)) || /lifted|lb\b/i.test(c.txt)), 'no load anywhere on the card: ' + r.text.map(c => c.txt).join(' | '));
});

test('criterion 2: 30 November no row; 1 December the row; 15 January still last year\'s; 16 January none', async (assert)=>{
  const f = fixture();
  const store = {'activity-dates': JSON.stringify(f.dates)};
  const at = async (today) => await mount({today, store, corpus: f.corpus}).getYearRecapInsight();
  assert.strictEqual(await at('2026-11-30'), null);
  const dec = await at('2026-12-01');
  assert.match(dec, /Your 2026 in lifting is ready\.<\/b> 120 sessions · 540 sets\./);
  assert.match(await at('2027-01-15'), /Your 2026 in lifting/);
  assert.strictEqual(await at('2027-01-16'), null);
  assert.strictEqual(await at('2026-07-04'), null);
});

test('criterion 3: with 7 training dates in the year, no row; with 8, the row', async (assert)=>{
  for(const [n, want] of [[7, false], [8, true]]){
    const f = fixture(n);
    const row = await mount({store: {'activity-dates': JSON.stringify(f.dates)}, corpus: f.corpus}).getYearRecapInsight();
    assert.strictEqual(row != null, want, n + ' dates');
  }
});

test('criterion 4: no body-weight, calorie or sleep value reaches the card, though the store holds them', async (assert)=>{
  const f = fixture();
  const w = mount({store: {'activity-dates': JSON.stringify(f.dates), 'weight-log': JSON.stringify([{date: '2026-11-30', weight: 182.4}]),
    'foodlog:2026-11-30': JSON.stringify({cal: 2450}), 'sleep-log': JSON.stringify([{date: '2026-11-30', hours: 7.5}])}, corpus: f.corpus});
  const r = drawCard(json(await w.computeYearRecap(2026)));
  assert.ok(r.text.length >= 5, 'anchor: the card drew its text');
  assert.ok(!r.text.some(c => /182\.4|2450|2,450|7\.5/.test(c.txt)), r.text.map(c => c.txt).join(' | '));
});

test('criterion 5: computing the recap, and the row, call no fetch', async (assert)=>{
  const f = fixture();
  const w = mount({store: {'activity-dates': JSON.stringify(f.dates)}, corpus: f.corpus});
  await w.computeYearRecap(2026); await w.getYearRecapInsight();
  assert.strictEqual(w.__fetches, 0);
  assert.ok(!/fetch\(|callClaude/.test(RECAP.join('\n')), 'no network call in the recap code');
});

// The real renderTodayInsights with every other getter stubbed.
const renderSrc = extractFunction(src, 'renderTodayInsights');
const OTHERS = [...renderSrc.matchAll(/\b(get[A-Za-z]+Insight)\(\)/g)].map(m => m[1]).filter(n => n !== 'getYearRecapInsight');
function mountRender(opts){
  const stubs = OTHERS.map(n => `async function ${n}(){ return ${JSON.stringify((opts.rows || {})[n] || null)}; }`).join('\n');
  const { window } = runJsdom('<div class="card" id="todayInsightsCard" style="display:none"><div id="todayInsightsList"></div></div>', `
    window.__store = ${JSON.stringify(opts.store)}; window.__shared = null;
    window.storage = { get: async k => k in window.__store ? { value: window.__store[k] } : null, set: async (k, v) => { window.__store[k] = v; }, delete: async k => { delete window.__store[k]; } };
    window.__corpusReads = 0; window.readExCorpus = async () => { window.__corpusReads++; return ${JSON.stringify(opts.corpus)}; };
    var activeProgram = '${opts.program || 'strength'}', activeDay = 'd2';
    window.shareCelebrationCard = async (card, btnId) => { window.__shared = {card, btnId}; };
    window.__preloads = 0; window.preloadShareCardFont = () => { window.__preloads++; };
    function showUndoToast(msg, fn){ window.__toast = msg; window.__undo = fn; }`,
    [stubs, `function getTodayKey(){ return '2026-12-01'; }`, extractConst(src, 'COLLAPSIBLE_LIST_BATCH_SIZE'), ...RECAP,
      ...['getHiddenPriorities', 'setHiddenPriorities', 'buildSwipeItem', 'makeSwipeable', 'renderCollapsibleList'].map(n => extractFunction(src, n)), renderSrc]);
  return window;
}
const ids = (w) => [...w.document.querySelectorAll('[data-priority]')].map(e => e.dataset.priority);
const tick = () => new Promise(r => setTimeout(r, 0));

test('criterion 6a: the real renderTodayInsights shows the row in its slot (under deficit, above cycle); Hide stores recap-2026-dismissed and the row goes', async (assert)=>{
  const f = fixture();
  const w = mountRender({store: {'activity-dates': JSON.stringify(f.dates)}, corpus: f.corpus,
    rows: {getDeficitGuardrailInsight: 'deficit row', getCycleInsight: 'cycle row', getWeeklyRecapInsight: 'weekly row'}});
  await w.renderTodayInsights();
  assert.deepStrictEqual(ids(w), ['weeklyRecap', 'deficit', 'yearRecap', 'cycle']);
  w.document.querySelector('[data-year-recap-share]').click(); await tick();
  assert.strictEqual(w.__shared.btnId, 'yearRecapShareBtn');
  assert.strictEqual(json(w.__shared.card).headline, '2026 IN LIFTING');
  w.document.querySelector('[data-year-recap-hide]').click(); await tick(); await tick(); await tick();
  assert.strictEqual(w.__store['recap-2026-dismissed'], '1');
  assert.deepStrictEqual(ids(w), ['weeklyRecap', 'deficit', 'cycle'], 'the row is gone');
  assert.strictEqual(w.__toast, 'Hidden for 2026');
  await w.__undo(); await tick();
  assert.ok(!('recap-2026-dismissed' in w.__store), 'Undo removes the key');
  assert.deepStrictEqual(ids(w), ['weeklyRecap', 'deficit', 'yearRecap', 'cycle'], 'and the row is back');
  // And the real getter alone, with the key stored:
  const g = mount({store: {'activity-dates': JSON.stringify(f.dates), 'recap-2026-dismissed': '1'}, corpus: f.corpus});
  assert.strictEqual(await g.getYearRecapInsight(), null);
  assert.strictEqual(await mount({store: {'activity-dates': JSON.stringify(f.dates), 'recap-2025-dismissed': '1'}, corpus: f.corpus}).getYearRecapInsight() != null, true, 'last year\'s dismissal does not hide this year\'s');
});

test('criterion 7a: no share button while a medical program is active (the row and Hide stay); shareYearRecapCard shares nothing', async (assert)=>{
  const f = fixture();
  const w = mountRender({store: {'activity-dates': JSON.stringify(f.dates)}, corpus: f.corpus, program: 'medical'});
  await w.renderTodayInsights();
  assert.deepStrictEqual(ids(w), ['yearRecap']);
  assert.strictEqual(w.document.querySelector('[data-year-recap-share]'), null);
  assert.ok(w.document.querySelector('[data-year-recap-hide]'));
  await w.shareYearRecapCard(2026);
  assert.strictEqual(w.__shared, null);
  const s = mount({store: {'activity-dates': JSON.stringify(f.dates)}, corpus: f.corpus});
  await s.shareYearRecapCard(2026);
  assert.deepStrictEqual(json(s.__shared.card).stats.map(x => x.label), ['SETS', 'SESSIONS']);
  assert.strictEqual(json(s.__shared.card).kind, 'year');
});

test('review fixes: rest days marked done and weight-only days are not sessions; the row preloads the card font; Share reuses the row\'s recap', async (assert)=>{
  const f = fixture(6);
  // 6 training dates, plus 3 rest days marked done and 1 day with only a weight typed (all in activity-dates).
  const extra = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04'];
  const corpus = [...f.corpus, {log: [{date: '2026-06-04', sets: [{weight: 135, reps: null}]}]}];
  const w = mount({store: {'activity-dates': JSON.stringify([...f.dates, ...extra])}, corpus});
  assert.strictEqual(json(await w.computeYearRecap(2026)).sessions, 6, '10 activity dates, 6 with a logged set');
  assert.strictEqual(await w.getYearRecapInsight(), null, 'so under the 8-date floor');
  const g = fixture();
  const r = mountRender({store: {'activity-dates': JSON.stringify(g.dates)}, corpus: g.corpus});
  await r.renderTodayInsights();
  assert.strictEqual(r.__preloads, 1, 'the font starts loading when the Share button appears');
  const reads = r.__corpusReads;
  assert.ok(reads >= 1, 'anchor: the row read the corpus');
  r.document.querySelector('[data-year-recap-share]').click(); await tick();
  assert.ok(r.__shared, 'shared');
  assert.strictEqual(r.__corpusReads, reads, 'no second scan between the tap and navigator.share');
});

// ---- v3.567 (MKT-06b): the remaining cards and the History entry.
// Real yearRecapDetailsFrom, yearRecapCards, computeYearRecapCards and
// renderYearRecapHistory, with MKT-01's real weekStreakNeed,
// weekTrainingCounts and computeWeekStreak, the real estimated1RM, mondayOf,
// MUSCLE_GROUP_MAP and VOLUME_LANDMARKS, and the real fmtWeight.
// Sabotage: drop the oly/jump/throw exclusion and criterion 6b fails.
const B_CHUNKS = [...['MUSCLE_GROUP_MAP', 'VOLUME_LANDMARKS', 'YEAR_RECAP_NO_E1RM', 'STREAK_MILESTONES', 'APP_SLOGAN' /* v3.647 (MKT-22) */].map(c => extractConst(src, c)),
  ...['dateKeyMinusDays', 'mondayOf', 'estimated1RM', 'weekStreakNeed', 'weekTrainingCounts', 'computeWeekStreak', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight',
    'yearRecapDetailsFrom', 'yearRecapCards', 'computeYearRecapCards', 'renderYearRecapHistory', 'escapeHtml'].map(f => extractFunction(src, f))];
const B_INFO = `var exerciseInfo = {'Back Squat': {category: 'squat'}, 'Bench Press': {category: 'push'}, 'Snatch': {category: 'oly'}, 'Box Jump': {category: 'jump'}, 'Barbell Row': {category: 'pull'}, 'Rowing Machine': {category: 'cardio'}};
  var weightUnit = 'lb', daysPerWeekPref = null, LB_PER_KG = 2.20462;`;
const add = (k, n) => { const d = new Date(k + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// Mon/Wed/Fri over [from Monday, weeks).
const mwf = (monday, weeks) => Array.from({length: weeks}, (_, w) => [0, 2, 4].map(o => add(monday, 7 * w + o))).flat();
function fixtureB(){
  // A 5-week run in February-March and a 13-week run from 5 October to 31 December.
  const dates = [...mwf('2026-02-02', 5), ...mwf('2026-10-05', 13)];
  const sq = (date, i) => ({date, sets: [{weight: 225 + i * 2, reps: 5}, {weight: 225 + i * 2, reps: 5}]});
  const corpus = [
    {exDef: {name: 'Back Squat'}, log: dates.map(sq)},
    {exDef: {name: 'Snatch'}, log: [{date: dates[0], sets: [{weight: 60, reps: 3}]}, {date: dates[50], sets: [{weight: 200, reps: 3}]}]}, // a huge gain, but oly
    {exDef: {name: 'Box Jump'}, log: [{date: dates[0], sets: [{weight: 10, reps: 3}]}, {date: dates[50], sets: [{weight: 300, reps: 3}]}]},
    {exDef: {name: 'Barbell Row'}, log: dates.map(date => ({date, sets: [{weight: 135, reps: 8}, {weight: 135, reps: 8}, {weight: 135, reps: 8}]}))},
    {exDef: {name: 'Rowing Machine'}, log: dates.map(date => ({date, sets: [{distance: 500}, {distance: 500}, {distance: 500}, {distance: 500}]}))},
  ];
  return {dates, corpus};
}
function mountB({today = '2026-12-31', program = 'strength', f = fixtureB(), pref = null} = {}){
  return runJsdom(`<div id="yearRecapHistoryCard" hidden><span id="yearRecapHistoryTitle"></span><div id="yearRecapHistoryList"></div></div>`, `
    window.__store = {'activity-dates': ${JSON.stringify(JSON.stringify(f.dates))}}; window.__fetches = 0; window.__shared = null;
    window.storage = { get: async k => k in window.__store ? { value: window.__store[k] } : null, set: async () => {} };
    window.fetch = async () => { window.__fetches++; return {}; };
    window.readExCorpus = async () => ${JSON.stringify(f.corpus)};
    window.getTodayKey = () => '${today}';
    var activeProgram = '${program}', activeDay = 'd2';
    window.shareCelebrationCard = async (card, btnId) => { window.__shared = {card, btnId}; };
    window.preloadShareCardFont = () => {};
    ${B_INFO} daysPerWeekPref = ${JSON.stringify(pref)};`, [...RECAP, ...B_CHUNKS]).window;
}

test('MKT-06b: weeks trained, the most-trained muscle group (sets), and the cards in order', async (assert)=>{
  const w = mountB();
  const {recap, cards} = json(await w.computeYearRecapCards(2026));
  assert.strictEqual(recap.sessions, 53, 'anchor: 18 weeks x 3, less Friday 1 January 2027');
  // 2026-11-24 (v3.647, MKT-22): the set now ends on a card with no stats (the slogan); the stat cards are unchanged.
  assert.deepStrictEqual(cards.filter(c => c.stats).map(c => c.stats[0].label), ['SETS', 'WEEKS TRAINED', 'BIGGEST E1RM GAIN', 'MOST-TRAINED', 'WEEKS IN A ROW']);
  assert.deepStrictEqual(cards[1].stats, [{value: '18', label: 'WEEKS TRAINED'}, {value: '53', label: 'SESSIONS'}]);
  // Back 3 sets x 53 = 159 beats Legs 2 x 53 = 106; the rower's 4 x 53 are cardio, not a muscle group.
  assert.deepStrictEqual(cards[3].stats, [{value: 'BACK', label: 'MOST-TRAINED'}, {value: '159', label: 'SETS'}]);
  assert.ok(cards.slice(0, -1).every(c => c.headline === '2026 IN LIFTING' && c.kind === 'year'));
});

test('MKT-06b criterion 6b: the e1RM card never names an oly, jump or throw exercise, even with a bigger Snatch gain', async (assert)=>{
  const w = mountB();
  const {cards} = json(await w.computeYearRecapCards(2026));
  const lift = cards.find(c => c.stats && c.stats[0].label === 'BIGGEST E1RM GAIN');
  // Back Squat: first 225x5 = 263; the year's last session (index 52) 329x5 = 384. Gain 121 lb.
  assert.deepStrictEqual(lift.stats, [{value: '+121 lb', label: 'BIGGEST E1RM GAIN'}, {value: 'BACK SQUAT', label: 'LIFT'}]);
  assert.ok(!JSON.stringify(cards).match(/SNATCH|BOX JUMP/));
});

test('MKT-06b criterion 7b: the streak card equals the real computeWeekStreak\'s longest run over the fixture year (13, not the earlier 5)', async (assert)=>{
  for(const pref of [null, 3]){
    const w = mountB({pref});
    const {cards} = json(await w.computeYearRecapCards(2026));
    const streak = cards.find(c => c.stats && c.stats[0].label === 'WEEKS IN A ROW');
    const live = await w.computeWeekStreak(); // today 31 December: the run ending this week
    assert.strictEqual(live, 13, 'anchor: the real streak at year end, preference ' + pref);
    assert.strictEqual(streak.stats[0].value, String(live));
  }
  const early = mountB({today: '2026-03-08'}); // the Sunday ending the 5-week run
  assert.strictEqual(await early.computeWeekStreak(), 5, 'anchor: the real streak at the end of the first run');
});

test('MKT-06b criterion 4 for every card: no body-weight, calorie or sleep value, and no load, on any card', async (assert)=>{
  const w = mountB();
  w.__store['weight-log'] = JSON.stringify([{date: '2026-11-30', weight: 182.4}]);
  w.__store['sleep-log'] = JSON.stringify([{date: '2026-11-30', hours: 7.5}]);
  const {recap, cards} = json(await w.computeYearRecapCards(2026));
  for(const card of cards){
    const [r] = runSandbox([drawCardSetup(), ...CARD_FNS], `buildShareCardBlob(${JSON.stringify(card)}); __capture.push(__text);`);
    assert.ok(r.length >= 3, 'anchor: the card drew text');
    const all = r.map(c => c.txt).join(' | ');
    assert.ok(!/182\.4|2450|2,450|7\.5/.test(all), all);
    assert.ok(!all.includes(String(recap.load)) && !all.includes(recap.load.toLocaleString('en-US')), 'no load: ' + all);
  }
});

test('MKT-06b History entry: in season it lists every card with its own Share; out of season hidden; no Share under a medical program; no fetch', async (assert)=>{
  const w = mountB({today: '2026-12-05'});
  await w.renderYearRecapHistory();
  const card = w.document.getElementById('yearRecapHistoryCard');
  assert.strictEqual(card.hidden, false);
  assert.strictEqual(w.document.getElementById('yearRecapHistoryTitle').textContent, 'Your 2026 in lifting');
  const btns = [...w.document.querySelectorAll('[data-year-recap-card]')];
  assert.strictEqual(btns.length, 6, '2026-11-24 (v3.647, MKT-22): five stat cards and the slogan card');
  btns[2].click(); await tick();
  assert.strictEqual(w.__shared.btnId, 'yearRecapCardBtn2');
  assert.strictEqual(json(w.__shared.card).stats[0].label, 'BIGGEST E1RM GAIN');
  assert.strictEqual(w.__fetches, 0);
  const off = mountB({today: '2026-11-30'}); await off.renderYearRecapHistory();
  assert.strictEqual(off.document.getElementById('yearRecapHistoryCard').hidden, true);
  const med = mountB({today: '2026-12-05', program: 'medical'}); await med.renderYearRecapHistory();
  assert.strictEqual(med.document.getElementById('yearRecapHistoryCard').hidden, false);
  assert.strictEqual(med.document.querySelectorAll('[data-year-recap-card]').length, 0);
  assert.strictEqual(med.document.querySelectorAll('#yearRecapHistoryList .diag-row').length, 6, 'the numbers still show (v3.647: six rows)');
});

test('MKT-06b criterion 7b: a 1-session week between two runs breaks the run, as it does for the real computeWeekStreak (10, not 5 + 1 + 10)', async (assert)=>{
  const dates = [...mwf('2026-02-02', 5), '2026-03-11', ...mwf('2026-03-16', 10)];
  const f = {dates, corpus: [{exDef: {name: 'Back Squat'}, log: dates.map(date => ({date, sets: [{weight: 225, reps: 5}]}))}]};
  const w = mountB({f, today: '2026-05-24'});
  const d = json(w.yearRecapDetailsFrom(2026, dates, f.corpus));
  assert.strictEqual(await w.computeWeekStreak(), 10, 'anchor: the real streak on the Sunday ending the second run');
  assert.strictEqual(d.longestStreak, 10);
});

// ---- v3.647 (MKT-22, owner 2026-11-24): the year ends on the slogan ----------
// The set's last card: "THAT'S YOUR YEAR." over APP_SLOGAN, no stats, drawn by
// drawStoryCard's headline-and-detail branch; History lists it as a row.
// Sabotage: give the end card a stats row and criterion 4 fails; drop the
// stats guard in renderYearRecapHistory and criterion 3 throws.
const SLOGAN = require('vm').runInNewContext(extractConst(src, 'APP_SLOGAN').replace(/^const APP_SLOGAN\s*=\s*/, '').replace(/;\s*$/, ''));
const drawWithStrokes = card => runSandbox([drawCardSetup().replace("if(k === 'measureText')", "if(k === 'stroke') return () => { __strokes++; }; if(k === 'measureText')").replace('var __text = []', 'var __strokes = 0, __text = []'), ...CARD_FNS],
  `buildShareCardBlob(${JSON.stringify(card)}); __capture.push({text: __text, strokes: __strokes});`)[0];

test('MKT-22 criterion 1: the real yearRecapCards ends on the slogan card (kind year-end, detail APP_SLOGAN, no stats); the cards before it are unchanged', async (assert)=>{
  const w = mountB();
  const {cards} = json(await w.computeYearRecapCards(2026));
  const end = cards[cards.length - 1];
  assert.strictEqual(SLOGAN, 'Plate by plate, step by step.', 'anchor: the const');
  assert.strictEqual(end.kind, 'year-end');
  assert.strictEqual(end.headline, "THAT'S YOUR YEAR.");
  assert.strictEqual(end.detail, SLOGAN);
  assert.strictEqual(end.stats, undefined);
  assert.strictEqual(cards.filter(c => c.kind === 'year-end').length, 1, 'once, last');
  assert.deepStrictEqual(cards.slice(0, -1).map(c => c.stats.map(s => s.label).join('/')), ['SETS/SESSIONS', 'WEEKS TRAINED/SESSIONS', 'BIGGEST E1RM GAIN/LIFT', 'MOST-TRAINED/SETS', 'WEEKS IN A ROW']);
});

test('MKT-22 criteria 2 and 4: the real buildShareCardBlob draws the slogan once and no digit at all; no stats rows (no rule lines)', async (assert)=>{
  const w = mountB();
  const {cards} = json(await w.computeYearRecapCards(2026));
  const end = cards[cards.length - 1];
  const r = drawWithStrokes(end);
  const all = r.text.map(x => x.txt).join(' ');
  assert.ok(r.text.length >= 2, 'anchor: text was drawn');
  assert.strictEqual(all.split(SLOGAN).length - 1, 1, 'the slogan once: ' + all);
  assert.ok(!/\d/.test(all), 'no digits: ' + all);
  // No stats rows: the same strokes as another card with no stats (the PR card's
  // headline-and-detail form); a stats card draws its n + 1 rule lines on top.
  const plain = drawWithStrokes({icon: 'trophy', headline: 'NEW PR', detail: 'Bench Press', kind: 'pr', dayId: 'd2'});
  assert.strictEqual(r.strokes, plain.strokes, 'no stats rule lines');
  const stat = drawWithStrokes(cards[1]);
  assert.strictEqual(stat.strokes, plain.strokes + cards[1].stats.length + 1, 'anchor: a stats card draws its rule lines');
});

test('MKT-22 criterion 3: History lists the slogan card last, with its own Share; under a medical program the rows show without Share', async (assert)=>{
  const w = mountB({today: '2026-12-05'});
  await w.renderYearRecapHistory();
  const rows = [...w.document.querySelectorAll('#yearRecapHistoryList .diag-row')];
  assert.strictEqual(rows.length, 6);
  const last = rows[rows.length - 1];
  assert.match(last.textContent, /That's your year\./);
  assert.ok(last.textContent.includes(SLOGAN));
  assert.strictEqual(last.querySelectorAll('button[data-year-recap-card]').length, 1);
  last.querySelector('button').click(); await tick();
  assert.strictEqual(json(w.__shared.card).kind, 'year-end');
  const med = mountB({today: '2026-12-05', program: 'medical'}); await med.renderYearRecapHistory();
  const medRows = [...med.document.querySelectorAll('#yearRecapHistoryList .diag-row')];
  assert.strictEqual(medRows.length, 6);
  assert.ok(medRows[5].textContent.includes(SLOGAN));
  assert.strictEqual(med.document.querySelectorAll('[data-year-recap-card]').length, 0);
});

run();
