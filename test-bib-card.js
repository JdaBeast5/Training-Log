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
    [...['parseExKey', 'normalizeExEntry', 'entryHasLoggedSet' /* v3.633 (BIZ-19): shared logged-set test */, 'trainingDayNumber'].map(f => extractFunction(src, f)),
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
const DATA = ['programs', 'DAY_INKS', 'CUSTOM_PLATES', 'SHARE_CARD_INKS', 'SASH_ORDER', 'APP_NAME', 'PLATE_INKS', 'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'STEP_UP_CHEER' /* 2026-11-24 (v3.648, MKT-23) */].map(c => extractConst(src, c));
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
      // 2026-11-24 (v3.648, MKT-23): stroked boxes too (the milestone stamp), as their four corners after the transform.
      if(k === 'strokeRect') return (x, y, w, h) => { (rec.strokes = rec.strokes || []).push([[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([a, b]) => apply(a, b))); };
      // Font-aware (about 0.58 em a glyph), so shrink-to-fit is exercised honestly. (\\d: this stub is a template
      // string; a bare \d here became "d" and every measure fell back to 34 px until v3.619.)
      if(k === 'measureText') return (txt) => ({ width: String(txt).length * 0.58 * Number((/(\\d+)px/.exec(st.font) || [0, 34])[1]) });
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
function draw(card, format){ __recs = []; buildShareCardBlob(card, format); const r = __recs[0]; return {w: r.canvas.width, h: r.canvas.height, text: r.text, rects: r.rects, path: r.path, strokes: r.strokes || []}; }
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
  // 2026-11-22 (v3.618, MKT-18): \bcal, so ctx.scale (the photo bib's 70%) isn't read as a calorie.
  assert.ok(!/bodyweight|userProfile|targets\.|sleep|\bcal/i.test(extractFunction(src, 'drawBibCard').replace(/\/\/.*$/gm, '')), 'the drawing reads none of it');
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

test('MKT-17: on a milestone date the bib carries a stamp ("No. 100", "ON THE LOG"), inside the safe zone; other days have none', (assert)=>{
  const r = drawn(card({number: 100, milestone: 100}));
  const stamp = r.text.filter(t => t.txt === 'No. 100');
  assert.strictEqual(stamp.length, 1, 'one stamp');
  assert.ok(r.text.some(t => t.txt === 'ON THE LOG'));
  assert.ok(stamp[0].y > 250 && stamp[0].y < 1620, 'in the safe zone');
  assert.strictEqual(stamp[0].fill, '#D42F25', 'stamp red');
  assert.ok(!drawn(card({number: 101, milestone: 0})).text.some(t => t.txt === 'ON THE LOG'), 'no stamp off a milestone');
  // It clears the next-time note, with the bar drawn and without (the lead block moves up), and "No. 1000" fits its box.
  for(const c of [card({number: 100, milestone: 100}), card({number: 100, milestone: 100}, {plates: []}), card({number: 1000, milestone: 1000})]){
    const d = drawn(c);
    const foot = d.text.find(t => t.txt === 'ON THE LOG'), note = d.text.find(t => /^500 30px/.test(t.font));
    assert.ok(foot.y + 12 < note.y - 15, `the stamp's foot (${Math.round(foot.y)}) is above the note (${Math.round(note.y)})`);
    const label = d.text.find(t => /^No\. \d+$/.test(t.txt));
    assert.ok(label.txt.length * 0.58 * Number(/(\d+)px/.exec(label.font)[1]) <= 210 - 36, label.txt + ' fits: ' + label.font);
  }
  assert.ok(!drawn(card()).text.some(t => /^No\. \d/.test(t.txt)), 'none by default');
});

test('MKT-17: beside the stamp, a long lift name and sets line shrink to stop short of it; off a milestone they keep their size', (assert)=>{
  const long = {name: 'Close-Grip Bench Press', reps: ['8', '8', '8', '8', '8'], weightLabel: '102.5 kg'};
  const r = drawn(card({number: 100, milestone: 100}, long));
  const px = t => Number(/(\d+)px/.exec(t.font)[1]);
  const name = r.text.find(t => t.txt === long.name), sets = r.text.find(t => t.txt.startsWith('102.5 kg ×'));
  // Left-aligned from x0 + 60 = 180; the stamp's box starts near x0 + bw - 165 - 105 - 8 ≈ 682 (before its tilt).
  for(const t of [name, sets]){
    const right = 180 + t.txt.length * 0.58 * px(t);
    assert.ok(right <= 682, `${t.txt} ends at ${Math.round(right)} (${px(t)}px)`);
  }
  assert.ok(px(name) < 44, 'anchor: the name did shrink');
  const plain = drawn(card({number: 101, milestone: 0}, long));
  assert.strictEqual(px(plain.text.find(t => t.txt === long.name)), 44, 'no stamp: the usual 44px');
});

test('the other cards keep their layouts: a PR or streak story is not a bib', (assert)=>{
  const [r] = runSandbox([STUB, ...DATA, ...FNS], `__capture.push(draw({kind: 'pr', icon: 'flag', headline: 'NEW PR', detail: 'Bench Press — 160 lb', dayId: 'd1'}));`);
  assert.ok(r.text.some(t => t.txt === 'NEW PR'));
  assert.ok(!r.text.some(t => t.txt === 'No.'));
});

// ---- v3.648 (MKT-23, option A): "Step up a plate!" in the note's place -------
// Sabotage: draw the cheer whatever stepUp says and the null case fails.
const CHEER = require('vm').runInNewContext(extractConst(src, 'STEP_UP_CHEER').replace(/^const STEP_UP_CHEER\s*=\s*/, '').replace(/;\s*$/, ''));
test('MKT-23 criterion 6: with stepUp, the cheer is drawn once (inside the bib) in place of the note; without it, no "Step up"', (assert)=>{
  const up = drawn(card({}, {stepUp: {next: '165 lb'}}));
  const hits = up.text.filter(t => t.txt === CHEER);
  assert.strictEqual(CHEER, 'Step up a plate!', 'anchor: the const');
  assert.strictEqual(hits.length, 1);
  assert.ok(hits[0].y > 250 && hits[0].y < 1620, 'y ' + hits[0].y);
  assert.match(hits[0].font, /Archivo/, 'the display face');
  assert.ok(up.text.some(t => t.txt === 'Next time 165 lb'), 'the next weight beside it');
  assert.ok(!up.text.some(t => /^500 30px/.test(t.font)), 'the note is not drawn that day');
  const hold = drawn(card({}, {stepUp: null}));
  assert.ok(!hold.text.some(t => /Step up/.test(t.txt)));
  assert.ok(hold.text.some(t => /^500 30px/.test(t.font)), 'anchor: the note is back');
});

test('MKT-23 criterion 6: the cheer\'s ink is the day\'s spot ink on red, the bib\'s black on yellow', (assert)=>{
  const [inks] = runSandbox([...DATA, "__capture.push(SHARE_CARD_INKS.spot.red);"], '');
  const red = drawn(card({}, {stepUp: {next: '165 lb'}})).text.find(t => t.txt === CHEER);
  assert.strictEqual(red.fill, inks, 'red day');
  // Strength & Size's yellow day.
  const [yDay] = runSandbox([STUB, ...DATA, ...FNS], `__capture.push(Object.keys(programs.strength.days).find(d => dayInk(d, 'strength') === 'yellow'));`);
  assert.ok(yDay, 'anchor: a yellow day exists');
  const c = card({}, {stepUp: {next: '165 lb'}}); c.dayId = yDay;
  const yel = drawn(c).text.find(t => t.txt === CHEER);
  assert.strictEqual(yel.fill, '#0C0C0D', 'yellow day: the bib\'s black');
});

test('MKT-23 criterion 6: with the milestone stamp too, the stamp and the cheer don\'t overlap', (assert)=>{
  const r = drawn(card({milestone: 50}, {stepUp: {next: '165 lb'}}));
  assert.ok(r.strokes.length >= 1, 'anchor: the stamp is drawn');
  const t = r.text.find(x => x.txt === CHEER);
  const px = Number(/(\d+)px/.exec(t.font)[1]);
  assert.ok(px < 64, 'anchor: it shrank beside the stamp (' + px + ' px)');
  const w = CHEER.length * 0.58 * px; // the stub's measure at the drawn size
  const cheer = {x1: t.x, x2: t.x + w, y1: t.y - px / 2, y2: t.y + px / 2}; // middle baseline
  for(const corners of r.strokes){
    const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]);
    const box = {x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys)};
    const meet = !(box.x2 < cheer.x1 || box.x1 > cheer.x2 || box.y2 < cheer.y1 || box.y1 > cheer.y2);
    assert.ok(!meet, `stamp ${JSON.stringify(box)} vs cheer ${JSON.stringify(cheer)}`);
  }
});

test('MKT-23 review fix: a long "Next time" (kg, a fallback-wide face) shrinks with the cheer and stays inside the bib', (assert)=>{
  const r = drawn(card({}, {stepUp: {next: '102.5 kg'}}));
  const i = r.path.findIndex((p, j) => p.op === 'moveTo' && r.path[j + 1] && r.path[j + 1].op === 'lineTo' && r.path[j + 1].x - p.x > 700);
  assert.ok(i >= 0, 'anchor: the tear line marks the bib\'s width');
  const right = r.path[i + 1].x;
  const nxt = r.text.find(x => x.txt === 'Next time 102.5 kg');
  const px = Number(/(\d+)px/.exec(nxt.font)[1]);
  const end = nxt.x + nxt.txt.length * 0.58 * px;
  assert.ok(end <= right + 1, `the line ends at ${Math.round(end)}, the bib's text edge is ${Math.round(right)}`);
  const cheer = r.text.find(x => x.txt === CHEER);
  assert.ok(nxt.x > cheer.x, 'anchor: beside the cheer');
});

// ---- v3.650 (BL-78): the band reads WK n/5 and still fits with the longest program label ----
test('BL-78 criterion 2: the event band shows "WK 4/5" and, with the longest program label, fits without a cut', (assert)=>{
  const r = drawn(card({week: 4, weeks: 5}));
  assert.ok(r.text.some(t => /^PLATESTEP · STRENGTH & SIZE · WK 4\/5$/.test(t.txt)), r.text.map(t => t.txt).filter(t => /·/.test(t)).join(' | '));
  // The longest label a bib is built for (clinical programs get none). Measured with real Geist 700 in
  // Chromium on 2026-11-24, "PLATESTEP · BOXING STRENGTH & CONDITIONING · WK 4/5" is 629 of 676 px at 22 px.
  const [longest] = runSandbox([...DATA, extractConst(src, 'MEDICAL_STYLES')], `__capture.push(Object.entries(programs).filter(([k]) => k !== 'medical' && !MEDICAL_STYLES[k]).map(([, p]) => p.label || '').sort((a, b) => b.length - a.length)[0]);`);
  assert.ok(longest.length > 10, 'anchor: the longest label (' + longest + ')');
  const l = drawn(card({program: longest, week: 4, weeks: 5}));
  const band = l.text.find(t => t.txt.startsWith('PLATESTEP ·'));
  assert.ok(band && !band.txt.endsWith('…'), 'no cut: ' + (band && band.txt));
  assert.ok(band.txt.endsWith('WK 4/5'));
});

test('BL-78 review fix: a program name too long for the band is shortened; the week stays whole at the end', (assert)=>{
  const r = drawn(card({program: 'Powerbuilding Hypertrophy Phase Two With A Very Long Custom Name', week: 4, weeks: 5}));
  const band = r.text.find(t => t.txt.startsWith('PLATESTEP ·'));
  assert.ok(band, 'anchor: the band');
  assert.ok(band.txt.endsWith('… · WK 4/5'), 'the name is cut, the week kept: ' + band.txt);
  assert.ok(band.txt.length < 'PLATESTEP · POWERBUILDING HYPERTROPHY PHASE TWO WITH A VERY LONG CUSTOM NAME · WK 4/5'.length);
});

run();
