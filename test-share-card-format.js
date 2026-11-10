'use strict';
// v3.547 (MKT-03, MKT-03b folded in, owner 2026-11-09 "keep the name"):
// story-format share cards with the app's mark. buildShareCardBlob(card,
// format) draws 1080x1920 by default and the old 1080x1080 card with
// 'square'. Both carry the Sash mark (five fillRects in the target spot inks)
// with APP_NAME beside it. The story card is a flat ground with the session
// day's spot ink (the real dayInk) as one field.
//
// Real invocation: the real buildShareCardBlob and its helpers, wrapCanvasText,
// celebrationIconPath, dayInk and the real programs run in a vm with a
// recording 2D context that tracks the transform, so each fillRect is placed
// where it lands on the canvas. The target inks are read from the real
// stylesheet's token comments. The real shareCelebrationCard runs in jsdom for
// the file name.
//
// Sabotage: drop the format switch (always 1080x1080) and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-share-card-format.js');

const DATA = ['programs', 'DAY_INKS', 'CUSTOM_PLATES', 'SHARE_CARD_INKS', 'SASH_ORDER', 'APP_NAME'].map(c => extractConst(src, c));
const FNS = ['appSlug', 'dayInk', 'wrapCanvasText', 'celebrationIconPath', 'shareCardFootRow', 'drawSashMark', 'drawShareCardFoot', 'drawStoryCard', 'buildShareCardBlob']
  .map(f => extractFunction(src, f));

// A 2D context that records fillText and fillRect in canvas coordinates.
const STUB = `
var ICONS = {trophy: '<svg><path d="M6 4h12v4a6 6 0 0 1-12 0z"/></svg>', flame: '', flag: ''};
var activeProgram = 'strength', activeDay = 'd1';
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
      if(k === 'fillText') return (txt, x, y) => { const [cx, cy] = apply(x, y); rec.text.push({txt: String(txt), x: cx, y: cy, font: st.font, fill: st.fillStyle, align: st.textAlign}); };
      if(k === 'fillRect') return (x, y, w, h) => { const [cx, cy] = apply(x + w/2, y + h/2); rec.rects.push({cx, cy, w, h, fill: st.fillStyle}); };
      if(k === 'stroke') return (p) => { if(p && p.d !== undefined) rec.icons.push({d: p.d, stroke: st.strokeStyle}); };
      if(k === 'measureText') return (txt) => ({ width: String(txt).length * 20 });
      if(typeof k === 'string' && /^create/.test(k)) return () => ({ addColorStop(){} });
      if(k in t) return t[k];
      return () => {};
    },
    set(t, k, v){ t[k] = v; return true; },
    has(t, k){ return k in t; },
  });
}
var document = { createElement: (tag) => { const rec = {text: [], rects: [], icons: []}; __recs.push(rec);
  const c = {width: 0, height: 0, getContext: () => makeCtx(rec), toBlob: (cb) => cb(null)}; rec.canvas = c; return c; } };
var __recs = [];
function draw(card, format){ __recs = []; buildShareCardBlob(card, format); const r = __recs[0]; return {w: r.canvas.width, h: r.canvas.height, text: r.text, rects: r.rects, icons: r.icons}; }
`;
const CARDS = {
  pr: {kind: 'pr', icon: 'trophy', headline: 'NEW PR', detail: 'Bench Press — 160 lb'},
  streak: {kind: 'streak', icon: 'flame', headline: '30-DAY STREAK', detail: 'Consistency is what actually builds results. '.repeat(3).trim()},
  week: {kind: 'week', icon: 'flag', headline: 'WEEK COMPLETE', stats: [{value: '4', label: 'WORKOUTS'}, {value: 'Strength & Size', label: 'PROGRAM'}, {value: '2', label: 'PRs THIS WEEK'}]},
};
function drawAll(extra = '', chunks = [...DATA, ...FNS]){
  const [r] = runSandbox([STUB, ...chunks], `${extra}
    const C = ${JSON.stringify(CARDS)}; const out = {};
    for(const k of Object.keys(C)){ out[k] = {story: draw(C[k]), square: draw(C[k], 'square')}; }
    out.row = {story: shareCardFootRow('story', 1080, 1920, APP_NAME.length*20), square: shareCardFootRow('square', 1080, 1080, APP_NAME.length*20)};
    __capture.push(out);`);
  return r;
}
const R = drawAll();

// The dark targets recorded in the stylesheet's token comments (UX-01).
function target(token){
  const m = new RegExp(token + ':[^;]*;\\s*/\\*\\s*target (#[0-9A-Fa-f]{6})').exec(src);
  if(!m) throw new Error('no target for ' + token);
  return m[1].toUpperCase();
}
const inBox = (p, row) => p.cx >= row.x && p.cx <= row.x + row.size && p.cy >= row.y && p.cy <= row.y + row.size;

test('criterion 1: the default is a 1080x1920 story card; \'square\' is 1080x1080', (assert)=>{
  for(const k of Object.keys(CARDS)){
    assert.deepStrictEqual([R[k].story.w, R[k].story.h], [1080, 1920], k);
    assert.deepStrictEqual([R[k].square.w, R[k].square.h], [1080, 1080], k);
  }
});

test('criterion 2: in story format every fillText y lies between 250 and 1700 (PR, streak with a long detail, week)', (assert)=>{
  for(const k of Object.keys(CARDS)){
    const t = R[k].story.text;
    assert.ok(t.length >= 2, k + ' drew text');
    const out = t.filter(c => !(c.y >= 250 && c.y <= 1700));
    assert.deepStrictEqual(out, [], k);
  }
});

test('criterion 3: both formats draw the Sash: exactly five fillRects inside the mark\'s box, in the five target spot inks, in order; the card\'s inks equal the token targets', (assert)=>{
  const want = ['red', 'blue', 'yellow', 'green', 'white'].map(i => target('--spot-' + i));
  for(const k of Object.keys(CARDS)) for(const f of ['story', 'square']){
    const inMark = R[k][f].rects.filter(p => inBox(p, R.row[f]));
    assert.deepStrictEqual(inMark.map(p => p.fill.toUpperCase()), want, `${k} ${f}`);
  }
  const [inks] = runSandbox(DATA, '__capture.push(SHARE_CARD_INKS);');
  for(const i of ['red', 'blue', 'yellow', 'green', 'white', 'off']){
    assert.strictEqual(inks.spot[i], target('--spot-' + i), 'spot ' + i);
    assert.strictEqual(inks.on[i], target('--on-' + i), 'on ' + i);
  }
  assert.strictEqual(inks.ground, target('--ground'));
  assert.strictEqual(inks.text2, target('--text-2'));
  assert.strictEqual(inks.rule, target('--rule-strong'));
});

// The square card's fillText calls at v3.546 (before this item), recorded
// from that version's buildShareCardBlob with this file's stub; the footer
// (the last call, the name) is compared separately.
const SQUARE_BEFORE = {
  pr: [
    {"txt": "NEW PR", "x": 540, "y": 540, "font": "800 74px Geist, sans-serif", "fill": "#F3F4F6", "align": "center"},
    {"txt": "Bench Press — 160 lb", "x": 540, "y": 626.4, "font": "500 36px Geist, sans-serif", "fill": "#8B929B", "align": "center"},
  ],
  streak: [
    {"txt": "30-DAY STREAK", "x": 540, "y": 540, "font": "800 74px Geist, sans-serif", "fill": "#F3F4F6", "align": "center"},
    {"txt": "Consistency is what actually builds results.", "x": 540, "y": 580.4, "font": "500 36px Geist, sans-serif", "fill": "#8B929B", "align": "center"},
    {"txt": "Consistency is what actually builds results.", "x": 540, "y": 626.4, "font": "500 36px Geist, sans-serif", "fill": "#8B929B", "align": "center"},
    {"txt": "Consistency is what actually builds results.", "x": 540, "y": 672.4, "font": "500 36px Geist, sans-serif", "fill": "#8B929B", "align": "center"},
  ],
  week: [
    {"txt": "WEEK COMPLETE", "x": 540, "y": 432, "font": "800 66px Geist, sans-serif", "fill": "#F3F4F6", "align": "center"},
    {"txt": "4", "x": 194.4, "y": 563.4, "font": "600 40px Geist, sans-serif", "fill": "#F3F4F6", "align": "left"},
    {"txt": "WORKOUTS", "x": 885.6, "y": 563.4, "font": "500 28px Geist, sans-serif", "fill": "#8B929B", "align": "right"},
    {"txt": "Strength & Size", "x": 194.4, "y": 675, "font": "600 40px Geist, sans-serif", "fill": "#F3F4F6", "align": "left"},
    {"txt": "PROGRAM", "x": 885.6, "y": 675, "font": "500 28px Geist, sans-serif", "fill": "#8B929B", "align": "right"},
    {"txt": "2", "x": 194.4, "y": 786.6, "font": "600 40px Geist, sans-serif", "fill": "#F3F4F6", "align": "left"},
    {"txt": "PRs THIS WEEK", "x": 885.6, "y": 786.6, "font": "500 28px Geist, sans-serif", "fill": "#8B929B", "align": "right"},
  ],
};
test('criterion 4: the square format\'s fillText calls equal v3.546\'s for the same card, except the footer', (assert)=>{
  for(const k of Object.keys(SQUARE_BEFORE)){
    const t = R[k].square.text;
    assert.strictEqual(t[t.length - 1].txt, 'PLATESTEP', 'anchor: the last call is the footer name');
    const body = t.slice(0, -1).map(c => ({...c, x: Math.round(c.x * 10) / 10, y: Math.round(c.y * 10) / 10}));
    assert.deepStrictEqual(body, SQUARE_BEFORE[k], k);
  }
});

test('criterion 5: the name is drawn exactly once, beside the mark, from APP_NAME; no old name; no literal name in the card code', (assert)=>{
  for(const k of Object.keys(CARDS)) for(const f of ['story', 'square']){
    const t = R[k][f].text;
    assert.ok(!t.some(c => /training log/i.test(c.txt)), `${k} ${f}: no old name`);
    const names = t.filter(c => c.txt === 'PLATESTEP');
    assert.strictEqual(names.length, 1, `${k} ${f}: one name`);
    const row = R.row[f];
    assert.ok(names[0].x >= row.x + row.size && names[0].y >= row.y && names[0].y <= row.y + row.size, `${k} ${f}: in the mark's row`);
  }
  const renamed = drawAll('', [...DATA.map(c => c.startsWith('const APP_NAME') ? "const APP_NAME = 'Benchmark';" : c), ...FNS]);
  assert.strictEqual(renamed.pr.story.text.filter(c => c.txt === 'BENCHMARK').length, 1, 'the drawn name follows APP_NAME');
  const code = FNS.join('\n').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((code.match(/platestep/gi) || []).length, 0);
});

test('criterion 6: the story card\'s spot field is the real dayInk of cardData.dayId, else the active day', (assert)=>{
  const [r] = runSandbox([STUB, ...DATA, ...FNS], `
    const pr = ${JSON.stringify(CARDS.pr)};
    const field = (d) => d.rects.find(p => p.w === 1080 && p.h < 1920);
    const blue = draw({...pr, dayId: 'd2'}), yellow = draw({...pr, dayId: 'd4'});
    activeDay = 'd5'; const fallback = draw(pr);
    __capture.push({ink: dayInk('d2', 'strength'), blue: field(blue).fill, ground: blue.rects[0].fill, yellow: field(yellow).fill,
      head: yellow.text.find(c => c.txt === 'NEW PR').fill, fallback: field(fallback).fill, d5: SHARE_CARD_INKS.spot[dayInk('d5')]});`);
  assert.strictEqual(r.ink, 'blue', 'Strength Day 2 is a p-blue day');
  assert.strictEqual(r.blue, target('--spot-blue'));
  assert.strictEqual(r.ground, target('--ground'), 'a flat ground first');
  assert.strictEqual(r.yellow, target('--spot-yellow'));
  assert.strictEqual(r.head, target('--on-yellow'), 'the headline is the ink\'s on-colour');
  assert.strictEqual(r.fallback, r.d5);
  assert.strictEqual(r.d5, target('--spot-green'), 'Strength Day 5 is green');
});

test('criterion 7: the icon is stroked as a Path2D in both formats, never drawn as text', (assert)=>{
  for(const f of ['story', 'square']){
    assert.strictEqual(R.pr[f].icons.length, 1, f);
    assert.ok(R.pr[f].icons[0].d.startsWith('M6 4'), f);
    assert.ok(!R.pr[f].text.some(c => c.txt === 'trophy'), f);
  }
  assert.strictEqual(R.pr.story.icons[0].stroke, target('--on-red'), 'Strength Day 1 (red): the icon in the on-ink');
});

test('the shared file is named <slug>-<kind>-<date>.png by the real shareCelebrationCard', async (assert)=>{
  const { window } = runJsdom('<button id="celebrateShareBtn">Share</button>', `
    window.__files = [];
    window.File = function(parts, name){ window.__files.push(name); };
    window.navigator.canShare = () => true; window.navigator.share = async () => {};
    window.buildShareCardBlob = async () => ({});
    window.getTodayKey = () => '2026-11-30';`,
    [extractConst(src, 'APP_NAME'), extractFunction(src, 'appSlug'), extractFunction(src, 'shareCelebrationCard')]);
  await window.shareCelebrationCard({kind: 'pr', headline: 'NEW PR', detail: 'x'});
  await window.shareCelebrationCard({headline: 'X', detail: 'y'});
  assert.deepStrictEqual([...window.__files], ['platestep-pr-2026-11-30.png', 'platestep-card-2026-11-30.png']);
  assert.strictEqual(window.appSlug(), 'platestep');
});

test('the three share call sites name their kind and the day they happened on (comments stripped)', (assert)=>{
  const code = src.split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  for(const [k, day] of [['pr', 'activeDay'], ['streak', 'activeDay'], ['week', 'shareDay']]){
    assert.strictEqual((code.match(new RegExp(`\\{icon:'[a-z]+', headline:[^\\n]*, kind:'${k}', dayId: ${day}\\}`, 'g')) || []).length, 1, k);
  }
});

test('review fixes: a long stat value is cut to fit beside its label; a long detail runs down from under the headline', (assert)=>{
  const [r] = runSandbox([STUB, ...DATA, ...FNS], `
    const w = draw({icon: 'flag', headline: 'WEEK COMPLETE', stats: [{value: 'Upper/Lower Hypertrophy Block Phase 2 Custom', label: 'PROGRAM'}]});
    const d = draw({icon: 'trophy', headline: 'NEW PR', detail: 'word '.repeat(80).trim()});
    __capture.push({w: w.text, d: d.text});`);
  const value = r.w.find(c => c.align === 'left' && c.txt !== 'PLATESTEP' && c.txt !== 'WEEK COMPLETE');
  const label = r.w.find(c => c.txt === 'PROGRAM');
  assert.ok(value.txt.endsWith('…'), value.txt);
  assert.ok(value.x + value.txt.length * 20 <= label.x - 'PROGRAM'.length * 20, 'the value ends before the label starts');
  const head = r.d.find(c => c.txt === 'NEW PR'), lines = r.d.filter(c => /^word/.test(c.txt));
  assert.ok(lines.length >= 5, 'anchor: the detail wrapped');
  assert.ok(lines[0].y > head.y + 100 && lines.every((c, i) => i === 0 || c.y > lines[i - 1].y), 'top-anchored under the headline');
});

test('review fix: the display font is condensed in the font shorthand (Safari has no ctx.fontStretch)', (assert)=>{
  assert.match(R.pr.story.text.find(c => c.txt === 'NEW PR').font, /^800 condensed \d+px Archivo, Geist/);
  assert.match(R.pr.story.text.find(c => c.txt === 'PLATESTEP').font, /^600 42px Geist/);
});

run();
