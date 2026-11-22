'use strict';
// v3.617 (MKT-16): the session bib card. A finished session's story card is a
// race bib: the day's ink as the ground, a white bib with one event band, the
// training-day number ("No. 47", never a load), the loaded bar on barbell
// days, the lead lift and its honest next-time line, and tear-off tabs (SETS,
// LIFTS, MIN when known). No finish time, no total load, no body data.
//
// Real invocation: the real trainingDayNumber over the real readExCorpus
// (window.storage stubbed with three years of sets), the real
// buildShareCardBlob → drawStoryCard → drawBibCard on a recording 2D context
// (test-share-card-format.js's stub), the real platesPerSide/getEquipment for
// the bar, and the real sessionShareStats for the clinical gate.
//
// Sabotage: count from activity-dates and criterion 1 fails; draw "Finished
// 58:12" and criterion 3 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-bib-card.js');

// ── criterion 1: the number counts distinct set dates in the whole corpus ──
test('criterion 1: three years of sets on 4 dates a week: the number is the count of distinct set dates (about 624), not activity-dates\' 730-day window', async (assert)=>{
  const { window } = runJsdom('', `
    var programs = {strength: {label: 'Strength & Size', days: {d1: {label: 'Day 1', exercises: [{name: 'Bench Press', sets: '4x4-6'}, {name: 'Row', sets: '3x8'}]}}}};
    var COMBAT_STYLES = {}, CYCLING_STYLES = {}, WATERSPORTS_STYLES = {}, MEDICAL_STYLES = {};
    let exCorpusGen = 0;
    const days = []; const start = Date.UTC(2023, 10, 20);
    for(let d = 0; d < 3 * 364; d++){ if([0, 1, 3, 5].includes(d % 7)) days.push(new Date(start + d * 86400000).toISOString().slice(0, 10)); }
    window.__dates = days.length;
    // Two exercises logged on most days (the same date twice must count once); the activity log is pruned to 730 days.
    const bench = days.map(date => ({date, sets: [{weight: 160, reps: 5}]}));
    const row = days.filter((_, i) => i % 3).map(date => ({date, sets: [{weight: 135, reps: 8}]}));
    // activity-dates is pruned to the last 730 days (ACTIVITY_DATES_RETENTION_DAYS).
    const cutoff = new Date(Date.parse(days[days.length - 1]) - 730 * 86400000).toISOString().slice(0, 10);
    window.__activity = days.filter(d => d >= cutoff).length;
    const store = {'ex:strength:d1:0': JSON.stringify(bench), 'ex:strength:d1:1': JSON.stringify(row), 'activity-dates': JSON.stringify(days.filter(d => d >= cutoff))};
    window.storage = { list: async p => ({keys: Object.keys(store).filter(k => k.startsWith(p))}), get: async k => k in store ? {value: store[k]} : null };`,
    [...['parseExKey', 'normalizeExEntry', 'trainingDayNumber'].map(f => extractFunction(src, f)),
     extractConst(src, 'ordinalSuffix'), 'let exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null;', extractFunction(src, 'readExCorpus'),
     "window.__run = async (dk) => trainingDayNumber(await readExCorpus(), dk);"]);
  const n = await window.__run('2099-01-01');
  assert.ok(window.__dates > 600 && window.__dates < 640, 'anchor: the fixture has about 624 dates (' + window.__dates + ')');
  assert.strictEqual(n, window.__dates, 'every distinct set date, once');
  assert.ok(n > window.__activity, `more than activity-dates holds after its 730-day prune (${n} vs ${window.__activity})`);
  const mid = await window.__run('2024-11-20');
  assert.ok(mid > 0 && mid < n, 'up to and including the given date only');
  assert.strictEqual(window.eval('[ordinalSuffix(47), ordinalSuffix(21), ordinalSuffix(112), ordinalSuffix(3)].join()'), 'th,st,th,rd');
});

// ── the drawing, on test-share-card-format.js's recording context ──────────
const DATA = ['programs', 'DAY_INKS', 'CUSTOM_PLATES', 'SHARE_CARD_INKS', 'SASH_ORDER', 'APP_NAME', 'PLATE_INKS', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES'].map(c => extractConst(src, c));
const FNS = ['appSlug', 'dayInk', 'wrapCanvasText', 'celebrationIconPath', 'shareCardFootRow', 'drawSashMark', 'drawShareCardFoot', 'drawBibCard', 'drawStoryCard', 'buildShareCardBlob',
  'platesPerSide', 'getEquipment', 'isBarbellExercise'].map(f => extractFunction(src, f));
FNS.push(extractConst(src, 'ordinalSuffix'));
const STUB = `
var ICONS = {flag: '<svg><path d="M5 3v18"/></svg>'};
var activeProgram = 'strength', activeDay = 'd1', weightUnit = 'lb', equipmentProfile = null;
function Path2D(d){ this.d = d; }
function makeCtx(rec){
  let m = [1, 0, 0, 1, 0, 0]; const stack = [];
  const st = {fillStyle: '#000', strokeStyle: '#000', font: '', textAlign: 'start', textBaseline: 'alphabetic', lineWidth: 1};
  const apply = (x, y) => [m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5]];
  const mul = (a, b, c, d, e, f) => { m = [m[0]*a + m[2]*b, m[1]*a + m[3]*b, m[0]*c + m[2]*d, m[1]*c + m[3]*d, m[0]*e + m[2]*f + m[4], m[1]*e + m[3]*f + m[5]]; };
  return new Proxy(st, {
    get(t, k){
      if(k === 'save') return () => stack.push([m.slice(), Object.assign({}, st)]);
      if(k === 'restore') return () => { const [mm, s] = stack.pop(); m = mm; Object.assign(st, s); };
      if(k === 'translate') return (x, y) => mul(1, 0, 0, 1, x, y);
      if(k === 'scale') return (x, y) => mul(x, 0, 0, y, 0, 0);
      if(k === 'rotate') return (a) => mul(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0);
      if(k === 'fillText') return (txt, x, y) => { const [cx, cy] = apply(x, y); rec.text.push({txt: String(txt), x: cx, y: cy, font: st.font, fill: st.fillStyle}); };
      if(k === 'moveTo' || k === 'lineTo') return (x, y) => { const [cx, cy] = apply(x, y); rec.path.push({op: k, x: cx, y: cy}); };
      if(k === 'fillRect') return (x, y, w, h) => { const [cx, cy] = apply(x + w/2, y + h/2); rec.rects.push({cx, cy, w, h, fill: st.fillStyle}); };
      // Font-aware (about 0.58 em a glyph), so shrink-to-fit is exercised honestly.
      if(k === 'measureText') return (txt) => ({ width: String(txt).length * 0.58 * Number((/(\d+)px/.exec(st.font) || [0, 34])[1]) });
      if(typeof k === 'string' && /^create/.test(k)) return () => ({ addColorStop(){} });
      if(k in t) return t[k];
      return () => {};
    },
    set(t, k, v){ t[k] = v; return true; },
    has(t, k){ return k in t; },
  });
}
var document = { createElement: () => { const rec = {text: [], rects: [], path: []}; __recs.push(rec);
  const c = {width: 0, height: 0, getContext: () => makeCtx(rec), toBlob: (cb) => cb(null)}; rec.canvas = c; return c; } };
var __recs = [];
function draw(card, format){ __recs = []; buildShareCardBlob(card, format); const r = __recs[0]; return {w: r.canvas.width, h: r.canvas.height, text: r.text, rects: r.rects, path: r.path}; }
`;
const BENCH = {name: 'Bench Press', reps: ['6', '6', '5', '5'], weightLabel: '160 lb', unit: 'lb', note: 'Hold until every set reaches the top of the range.'};
function card(over = {}, leadOver = {}){
  return {icon: 'flag', headline: 'SESSION COMPLETE', kind: 'session', dayId: 'd1',
    stats: [{value: '18', label: 'SETS'}, {value: '5', label: 'LIFTS'}, {value: '58', label: 'MIN'}],
    bib: Object.assign({number: 47, program: 'Strength & Size', week: 4, dateLabel: 'Mon, Nov 2', sets: '18', lifts: '5', minutes: '58', lead: Object.assign({}, BENCH, leadOver)}, over)};
}
function drawn(c, extra = ''){
  const [r] = runSandbox([STUB, ...DATA, ...FNS], `${extra}
    const lead = ${JSON.stringify(c.bib.lead)};
    if(lead && lead.plates === undefined) lead.plates = platesPerSide(160, getEquipment()).plates;
    const cd = ${JSON.stringify(c)}; cd.bib.lead = lead;
    __capture.push(draw(cd));`);
  return r;
}

test('the bib: the day\'s ink as the ground, the number "47" as the big figure with its caption, the event band naming the app, program, week and date', (assert)=>{
  const r = drawn(card());
  assert.strictEqual(r.w, 1080); assert.strictEqual(r.h, 1920);
  assert.strictEqual(r.rects[0].fill, '#D42F25', 'Strength & Size Day 1 is red');
  const txt = r.text.map(t => t.txt);
  assert.ok(txt.includes('47') && txt.includes('No.'), 'the number');
  assert.ok(txt.includes('your 47th training day on the log'));
  assert.ok(txt.some(t => /^PLATESTEP · STRENGTH & SIZE · WK 4$/.test(t)), 'the event band: ' + txt.filter(t => /·/.test(t)));
  assert.ok(txt.includes('MON, NOV 2'), 'the date');
  assert.ok(txt.includes('Bench Press') && txt.includes('160 lb × 6, 6, 5, 5'), 'the lead lift');
  assert.ok(txt.join(' ').includes('Hold until every set reaches the top of the range.'), 'its honest next-time line (wrapped)');
  const big = r.text.find(t => t.txt === '47');
  assert.match(big.font, /Archivo/, 'the display face');
});

test('criterion 2: every fillText y is between 250 and 1620 (after the bib\'s tilt)', (assert)=>{
  for(const c of [card(), card({minutes: ''}), card({}, {plates: []}), card({lead: null})]){
    const r = drawn(c);
    const out = r.text.filter(t => t.y < 250 || t.y > 1620).map(t => `${t.txt}@${Math.round(t.y)}`);
    assert.deepStrictEqual(out, []);
  }
});

test('the lead lift clears the tear-off tabs: with the bar drawn and a long note, every line sits above the tear line; the note stops at two lines, ending in …', (assert)=>{
  const LONG = 'Hold the weight until every set reaches the top of the range, then add the smallest jump your plates allow and start again at the bottom of the range next session.';
  for(const c of [card(), card({}, {note: LONG}), card({}, {plates: [], note: LONG})]){
    const r = drawn(c);
    // The tear line: the one long horizontal stroke (moveTo → lineTo across the bib), tilted with it.
    const i = r.path.findIndex((p, j) => p.op === 'moveTo' && r.path[j + 1] && r.path[j + 1].op === 'lineTo' && r.path[j + 1].x - p.x > 700);
    assert.ok(i >= 0, 'anchor: the tear line is drawn');
    const a = r.path[i], b = r.path[i + 1], tearY = x => a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x);
    const lead = c.bib.lead;
    const leadLines = r.text.filter(t => t.txt === lead.name || t.txt.startsWith(lead.weightLabel) || /^500 30px/.test(t.font));
    assert.ok(leadLines.length >= 3, 'anchor: the name, the sets and the note are found (' + leadLines.length + ')');
    // A 30px line's descenders reach about 8px below its baseline; keep 20px of paper between it and the tear.
    const low = leadLines.filter(t => t.y + 8 > tearY(t.x) - 20).map(t => `${t.txt}@${Math.round(t.y)} vs tear ${Math.round(tearY(t.x))}`);
    assert.deepStrictEqual(low, []);
    const note = r.text.filter(t => /^500 30px/.test(t.font));
    assert.ok(note.length <= 2, 'at most two note lines: ' + note.length);
    if(lead.note === LONG) assert.ok(note[note.length - 1].txt.endsWith('…'), 'the cut line says so: ' + note[note.length - 1].txt);
    else assert.strictEqual(note.map(t => t.txt).join(' '), lead.note, 'a short note is whole');
  }
});

test('criterion 3: no "Finished" and no mm:ss anywhere; with no minutes known, no MIN tab', (assert)=>{
  const r = drawn(card());
  assert.ok(!r.text.some(t => /Finished|\d+:\d\d/.test(t.txt)), r.text.map(t => t.txt).join(' | '));
  const none = drawn(card({minutes: ''}));
  assert.ok(!none.text.some(t => t.txt === 'MIN'), 'no MIN tab');
  assert.ok(none.text.some(t => t.txt === 'SETS') && none.text.some(t => t.txt === 'LIFTS'));
  assert.ok(drawn(card()).text.some(t => t.txt === 'MIN'), 'anchor: shown when known');
});

test('criterion 4: 160 lb on a 45 lb bar: the plates run 45, 10, 2.5 from the collar outward, on both sides, in their inks', (assert)=>{
  const r = drawn(card());
  const plates = r.rects.filter(x => x.h >= 50 && x.h <= 140 && x.w >= 14 && x.w <= 50);
  assert.strictEqual(plates.length, 6, 'three a side');
  const left = plates.filter(p => p.cx < 540).sort((a, b) => b.cx - a.cx), right = plates.filter(p => p.cx > 540).sort((a, b) => a.cx - b.cx);
  const ink = {'#2C5BD8': 45, '#E6E6E2': 10, '#8E8E93': 2.5};
  assert.deepStrictEqual(left.map(p => ink[p.fill]), [45, 10, 2.5], 'left, collar outward');
  assert.deepStrictEqual(right.map(p => ink[p.fill]), [45, 10, 2.5], 'right, collar outward');
  assert.ok(left[0].h > left[1].h && left[1].h > left[2].h, 'heaviest tallest');
});

test('criterion 5: with a MEDICAL_STYLES program active, no share data is built (the real sessionShareStats)', async (assert)=>{
  const { window } = runJsdom('<div id="exerciseList"></div>', `var gymModeActive = false;
    var MEDICAL_STYLES = {postpartum: {label: 'Postpartum'}};`, [extractFunction(src, 'sessionShareStats')]);
  const list = window.document.getElementById('exerciseList');
  assert.strictEqual(await window.sessionShareStats(list, '2026-11-02', 'medical'), undefined);
  assert.strictEqual(await window.sessionShareStats(list, '2026-11-02', 'postpartum'), undefined);
  // And the bib is only attached where share data exists (finishSheetModel).
  const fsm = extractFunction(src, 'finishSheetModel');
  assert.match(fsm, /if\(share\)\{[\s\S]*share\.bib = /, 'the bib rides on the share data');
});

test('criterion 6: no body weight, calorie or sleep value on the card', (assert)=>{
  const r = drawn(card());
  assert.ok(!r.text.some(t => /\b(kcal|cal|calories|sleep|hrs?|body ?weight|BMI)\b/i.test(t.txt)), r.text.map(t => t.txt).join(' | '));
  assert.ok(!/bodyweight|userProfile|targets\.|sleep|cal/i.test(extractFunction(src, 'drawBibCard').replace(/\/\/.*$/gm, '')), 'the drawing reads none of it');
});

test('criterion 7: no tab label matches LOAD or VOLUME; the first tab is SETS; on a barbell day the plates are drawn; the big figure is never a load', (assert)=>{
  const r = drawn(card());
  const labels = r.text.filter(t => /^[A-Z]+$/.test(t.txt) && t.y > 1300).map(t => t.txt);
  assert.deepStrictEqual(labels, ['SETS', 'LIFTS', 'MIN']);
  assert.ok(!r.text.some(t => /LOAD|VOLUME/.test(t.txt)));
  assert.ok(r.rects.filter(x => x.h >= 50 && x.h <= 140 && x.w >= 14 && x.w <= 50).length > 0, 'plates drawn');
  const sizes = r.text.map(t => ({txt: t.txt, px: Number((/(\d+)px/.exec(t.font) || [])[1])})).sort((a, b) => b.px - a.px);
  assert.strictEqual(sizes[0].txt, '47', 'the largest text is the number');
  const noBar = drawn(card({}, {plates: []}));
  assert.strictEqual(noBar.rects.filter(x => x.h >= 50 && x.h <= 140 && x.w >= 14 && x.w <= 50).length, 0, 'no bar off a barbell lift');
});

test('the other cards keep their layouts: a PR or streak story is not a bib', (assert)=>{
  const [r] = runSandbox([STUB, ...DATA, ...FNS], `__capture.push(draw({kind: 'pr', icon: 'flag', headline: 'NEW PR', detail: 'Bench Press — 160 lb', dayId: 'd1'}));`);
  assert.ok(r.text.some(t => t.txt === 'NEW PR'));
  assert.ok(!r.text.some(t => t.txt === 'No.'));
});

run();
