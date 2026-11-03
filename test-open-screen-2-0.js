'use strict';
// Open-screen 2.0 (owner: "let's do them all that we can … continue tomorrow
// with what we can't", after a brainstorm on the unfolded screen). One
// increment per version, all inside the open-posture layouts.
//
// v3.498 — Floating chrome stays in the left pane. On an open foldable the tab
// bar, date bar, rest timer, undo toast and gym-mode offer stretched across
// the fold (or centred on it). A sidebar would have left the session pane
// ~300pt wide, so the bottom bar keeps its phone shape, a pane wide, and the
// others centre on that pane. With a reported fold ([HINGE]) the pane is
// measured from the fold itself.
//
// jsdom evaluates no media queries; the real rules are read from index.html
// and their formulas evaluated. Real-browser result (Chromium, 904x678): bar
// 18..440, date bar 18..440, rest timer centred at 229; slab/cover unchanged.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-open-screen-2-0.js');

const RAW = {};
function block(head){
  const start = src.indexOf(head);
  if(start < 0) throw new Error('no ' + head);
  let depth = 0, i = src.indexOf('{', start);
  for(; i < src.length; i++){ if(src[i] === '{') depth++; if(src[i] === '}' && --depth === 0) break; }
  const raw = src.slice(start, i + 1);
  const clean = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  RAW[clean] = raw;
  return clean;
}
const OPEN = block('@media (min-width:760px) and (min-height:560px), (horizontal-viewport-segments: 2) and (min-height:560px){');
const HINGE = block('@media (horizontal-viewport-segments: 2) and (min-height:560px){\n    :root{\n      --hinge-l');
function rules(body, sel){
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...body.matchAll(new RegExp('(?:^|[\\s{}])' + esc + '\\s*\\{([^}]*)\\}', 'g'))].map(m=> m[1]);
}
function decl(sel, prop, body = OPEN){
  for(const r of rules(body, sel)){
    const m = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(r);
    if(m) return m[1].trim();
  }
  throw new Error('no ' + prop + ' on ' + sel);
}
function px(expr, v){
  let e = expr;
  for(let i = 0; i < 8 && /var\(/.test(e); i++) e = e.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, n, fb)=>{ if(n in v) return '(' + v[n] + ')'; if(fb) return fb; throw new Error('unresolved ' + n); });
  e = e.replace(/env\(viewport-segment-right 0 0, 50vw\)/g, String(v.foldL))
       .replace(/(\d+(?:\.\d+)?)vw/g, (_, n)=> String(v.vw * n / 100))
       .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(').replace(/\bmax\(/g, 'Math.max(').replace(/\bmin\(/g, 'Math.min(');
  if(/[a-z]/i.test(e.replace(/Math\.(max|min)/g, ''))) throw new Error('could not resolve ' + expr + ' -> ' + e);
  return Function('return (' + e + ')')();
}
function openVars(vw){
  const v = { vw, '--wrap-max': decl(':root', '--wrap-max'), '--pane-gap': decl(':root', '--pane-gap') };
  v['--open-col-left'] = decl(':root', '--open-col-left');
  v['--open-col-w'] = decl(':root', '--open-col-w');
  return v;
}

test('REAL formulas (v3.498): the tab bar spans exactly the left pane, ending before the fold gutter', (assert)=>{
  for(const vw of [890, 904, 861]){
    const v = openVars(vw);
    const left = px(decl('.nav-pills', 'left'), v), width = px(decl('.nav-pills', 'width'), v);
    assert.equal(left, 18, `starts at the page gutter (${vw})`);
    assert.equal(left + width, vw / 2 - 12, `ends 12px before the middle (${vw})`);
    assert.equal(decl('.nav-pills', 'right'), 'auto');
  }
});

test('REAL formulas (v3.498): the date bar, rest timer, undo toast and gym offer centre on the left pane', (assert)=>{
  const v = openVars(904);
  assert.equal(px(decl('.log-date-bar', 'max-width'), v), 904 / 2 - 12 - 18);
  const sel = 'body:not(.gym-mode) .rest-timer, .undo-toast, .gym-offer';
  assert.equal(px(decl(sel, 'left'), v), 18 + (904 / 2 - 30) / 2, 'centre of the left pane');
  assert.ok(!/body\.gym-mode \.rest-timer/.test(sel), 'gym mode keeps positioning its own timer');
});

test('REAL formulas (v3.498): with a reported fold, the pane is measured from the fold', (assert)=>{
  const left = decl(':root', '--open-col-left', HINGE), w = decl(':root', '--open-col-w', HINGE);
  const v = { vw:904, foldL:500, '--hinge-l':'env(viewport-segment-right 0 0, 50vw)', '--gutter-l':'18px' };
  assert.equal(px(left, v), 18);
  assert.equal(px(left, v) + px(w, v), 488, 'ends 12px before an off-centre fold at 500');
});

test('REAL source (v3.498): none of this applies on a phone — every rule lives inside the open-posture block', (assert)=>{
  const outside = src.replace(RAW[OPEN], '').replace(RAW[HINGE], '');
  for(const re of [/--open-col-w/, /\.nav-pills\{\s*left:var\(--open-col-left\)/]) assert.ok(!re.test(outside.replace(/\/\*[\s\S]*?\*\//g, '')), `${re} outside the open layouts`);
});

// v3.499 — Today's right pane leads with the exercise you're on (open screen
// only): its history (the same builder as the history sheet, latest five
// sessions), cues and form video. It follows Up next until you open an
// exercise yourself, then stays on yours until the day changes.
const HIST_FNS = ['escapeHtml', 'normalizeExEntry', 'subVariantOf', 'topSetOf', 'estimated1RM', 'toDisplayWeight', 'trimUnitNum', 'distanceOf', 'dropVolumeOf', 'volumeOf', 'parseDateKey', 'formatDate', 'formatShortDate', 'toDisplayDistance', 'buildExerciseHistoryHtml'];
function detailWindow(open){
  const sessions = Array.from({length:8}, (_, i) => ({ date:`2026-10-${String(27 - i * 3).padStart(2, '0')}`, sets:[{weight:150 - i * 5, reps:8}, {weight:150 - i * 5, reps:7}] }));
  const html = extractElementById(src, 'exerciseDetailCard');
  const { window } = runJsdom(html, `
    var weightUnit = 'lb', distanceUnit = 'mi', activeDay = 'd1', LB_PER_KG = 0.453592, M_PER_MI = 1609.344, M_PER_KM = 1000;
    window.__open = ${open};
    function isOpenPosture(){ return window.__open; }
    async function getExLog(){ return ${JSON.stringify(sessions)}; }
    var exerciseInfo = { 'Bench Press': { cues:['Shoulder blades back', 'Bar to lower chest', 'Drive feet'], videoQuery:'bench press form' } };`,
    [...HIST_FNS.map(n => { try{ return extractFunction(src, n); }catch(e){ return ''; } }),
     ...['metresPerDisplayUnit'].map(n => { try{ return extractFunction(src, n); }catch(e){ return ''; } }),
     `var exerciseDetailByIdx = {}; var exerciseDetailIdx = null; var exerciseDetailPinned = false; var exerciseDetailDay = null;`,
     extractFunction(src, 'focusExerciseDetail'), extractFunction(src, 'renderExerciseDetail'),
     "exerciseDetailByIdx['0'] = {name:'Bench Press'}; exerciseDetailByIdx['2'] = {name:'Overhead Press'};"]);
  return window;
}
const settle = () => new Promise(r => setTimeout(r, 30));

test('REAL invocation (v3.499): open, the pane shows the focused exercise — stats, last five sessions, cues, form video', async (assert)=>{
  const w = detailWindow(true);
  w.focusExerciseDetail('0', false); await settle();
  const card = w.document.getElementById('exerciseDetailCard');
  assert.strictEqual(card.hidden, false);
  assert.strictEqual(w.document.getElementById('exerciseDetailTitle').textContent, 'Bench Press');
  assert.strictEqual(card.querySelectorAll('.exh-row').length, 5, 'the latest five of eight sessions');
  assert.match(card.textContent, /Last 5 sessions/);
  assert.strictEqual(card.querySelector('.exh-stats b').textContent, '8', 'the stats still count every session');
  assert.strictEqual(card.querySelectorAll('.ex-cues li').length, 3);
  assert.match(card.querySelector('.ex-video-link').getAttribute('href'), /bench%20press%20form/);
});

test('REAL invocation (v3.499): on a phone (not open) nothing renders and the card stays hidden', async (assert)=>{
  const w = detailWindow(false);
  w.focusExerciseDetail('0', false); await settle();
  assert.strictEqual(w.document.getElementById('exerciseDetailCard').hidden, true);
  assert.strictEqual(w.document.getElementById('exerciseDetailBody').innerHTML, '');
});

test('REAL invocation (v3.499): opening an exercise pins it; Up next no longer steers until the day changes', async (assert)=>{
  const w = detailWindow(true);
  w.focusExerciseDetail('2', true); await settle();
  assert.strictEqual(w.document.getElementById('exerciseDetailTitle').textContent, 'Overhead Press');
  assert.strictEqual(w.eval('exerciseDetailPinned'), true);
  assert.match(extractFunction(src, 'renderUpNext'), /if\(!exerciseDetailPinned\) focusExerciseDetail\(n\.row\.dataset\.exIdx, false\);/, 'Up next only steers while unpinned');
  assert.match(extractFunction(src, 'renderWorkout'), /if\(exerciseDetailDay !== activeDay\)\{ exerciseDetailDay = activeDay; exerciseDetailPinned = false; exerciseDetailIdx = null; \}/, 'a new day unpins');
  assert.match(extractFunction(src, 'toggleExerciseBlockFromHeader'), /focusExerciseDetail\(idxEl\.dataset\.exIdx, true\)/, 'opening an exercise pins it');
});

test('REAL source (v3.499): the sheet and the pane share one builder; the card heads the right column only when open', (assert)=>{
  assert.match(extractFunction(src, 'openExerciseHistory'), /body\.innerHTML = await buildExerciseHistoryHtml\(exIdx, ex\);/);
  assert.match(OPEN, /\.exercise-detail-card\{ order:-1; \}/);
  assert.match(src, /\.exercise-detail-card\[hidden\]\{display:none;\}/);
  const today = runJsdom(extractElementById(src, 'todayView'), '', []).window.document;
  const card = today.getElementById('exerciseDetailCard');
  assert.strictEqual(card.parentElement.id, 'todayView', 'a direct child, so gym mode hides it with the other Today cards');
  assert.strictEqual(card.nextElementSibling.id, 'profileCardPermanentSlot');
});

run();
