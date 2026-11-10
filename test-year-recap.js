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
function drawCard(recap){
  const [r] = runSandbox([`
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
      }, set(t, k, v){ t[k] = v; return true; }, has(t, k){ return k in t; } })}; __size = c; return c; } };`,
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

run();
