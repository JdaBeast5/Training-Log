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
       .replace(/env\(viewport-segment-left 1 0, 50vw\)/g, String(v.foldR))
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
  assert.match(OPEN, /\.exercise-detail-card, \.history-day-card\{ order:-1; \}/); // v3.500 shares it
  assert.match(src, /\.exercise-detail-card\[hidden\], \.history-day-card\[hidden\]\{display:none;\}/);
  const today = runJsdom(extractElementById(src, 'todayView'), '', []).window.document;
  const card = today.getElementById('exerciseDetailCard');
  assert.strictEqual(card.parentElement.id, 'todayView', 'a direct child, so gym mode hides it with the other Today cards');
  assert.strictEqual(card.nextElementSibling.id, 'profileCardPermanentSlot');
});

// v3.500 — History as master-detail. Unfolded, the Day-by-Day Log (calendar
// and list) is the left pane and a day pane heads the right one: tapping a day
// on the calendar shows that day's card there (the list's own builder),
// marked on the calendar, instead of scrolling the list away. It starts on
// the most recent logged day. On a phone the tap scrolls the list as before.
function historyWindow(open){
  const day = { weight:180.1, weightDelta:0, exercises:[{name:'Lat Pulldown', dayLabel:'Strength · Day 1', volume:1725, deltaWeight:0, deltaReps:0, sets:[{weight:75, reps:8}]}] };
  const { window } = runJsdom(extractElementById(src, 'historyView'), `
    window.__open = ${open};
    function isOpenPosture(){ return window.__open; }
    var weightUnit = 'lb', distanceUnit = 'km';
    window.toDisplayWeight = v => v; window.trimUnitNum = v => String(v); window.fmtWeight = v => v + ' lb'; window.toDisplayDistance = v => v;
    var _historyDayMap = { '2026-10-21': ${JSON.stringify(day)}, '2026-10-24': ${JSON.stringify(day)} };
    window.fillHistoryMonth = ()=>{};`,
    [...['escapeHtml', 'parseDateKey', 'formatDate', 'fmtDayLabel', 'deltaSpan', 'buildHistoryDayCardHtml', 'showHistoryDayPane', 'jumpToHistoryDay'].map(n => extractFunction(src, n)),
     "document.getElementById('historyHeatmapGrid').innerHTML = '<button data-jump-date=\"2026-10-21\"></button><button data-jump-date=\"2026-10-24\"></button>';"]);
  return window;
}

test('REAL invocation (v3.500): open, a tapped day fills the right pane, marked on the calendar; the list does not scroll', (assert)=>{
  const w = historyWindow(true);
  let scrolled = false; w.Element.prototype.scrollIntoView = ()=>{ scrolled = true; };
  w.jumpToHistoryDay('2026-10-21');
  const card = w.document.getElementById('historyDayCard');
  assert.strictEqual(card.hidden, false);
  assert.strictEqual(card.dataset.date, '2026-10-21');
  assert.match(w.document.getElementById('historyDayTitle').textContent, /Oct 21/);
  assert.ok(card.querySelector('.day-ex-row.day-ex-logged'), 'the same day card the list builds');
  assert.deepStrictEqual([...w.document.querySelectorAll('#historyHeatmapGrid .is-shown')].map(b => b.dataset.jumpDate), ['2026-10-21']);
  assert.strictEqual(scrolled, false);
});

test('REAL invocation (v3.500): on a phone, or for a day with nothing logged, the pane declines and the list path runs', (assert)=>{
  const phone = historyWindow(false);
  assert.strictEqual(phone.showHistoryDayPane('2026-10-21'), false);
  assert.strictEqual(phone.document.getElementById('historyDayCard').hidden, true);
  const open = historyWindow(true);
  assert.strictEqual(open.showHistoryDayPane('2026-10-22'), false, 'nothing logged that day');
});

test('REAL source (v3.500): History is a split view led by the log; the day pane is CSS-gated to the open layout and starts on the latest day', (assert)=>{
  const doc = runJsdom(extractElementById(src, 'historyView'), '', []).window.document;
  const view = doc.getElementById('historyView');
  assert.ok(view.classList.contains('posture-split'));
  assert.ok(view.querySelector(':scope > .split-primary #historyLogHeader'), 'the Day-by-Day Log is the primary');
  assert.match(src, /\.history-day-card\{display:none;\}/, 'hidden on phones by CSS, whatever JS does');
  assert.match(OPEN, /\.history-day-card:not\(\[hidden\]\)\{ display:block; \}/);
  assert.match(extractFunction(src, 'renderHistory'), /showHistoryDayPane\(keep \|\| Object\.keys\(dayMap\)\.sort\(\)\.pop\(\) \|\| ''\);/);
  assert.ok(!/#historyView,/.test(OPEN), 'no longer held to the phone column');
});

// v3.501 — Learn as a library. Unfolded, what you choose from (exercise
// search, Recently Trained, the masterclass index) runs down the left and the
// lesson you open is on the right. The left pane is built only while open;
// the three cards move into it and return to their places on folding, so the
// phone order (test-learn-tab-card-order.js) never changes.
function learnWindow(){
  const { window } = runJsdom(extractElementById(src, 'learnView'), 'window.__open = true; function isOpenPosture(){ return window.__open; }',
    [extractFunction(src, 'arrangeLearnForPosture')]);
  return window;
}
const learnOrder = d => [...d.getElementById('learnView').children].map(c => c.id || (c.querySelector('#exerciseSearchInput') ? 'library' : c.querySelector('#masterclassIndex') ? 'index' : c.className));

test('REAL invocation (v3.501): open, the library, Recently Trained and the index form the left pane, in that order', (assert)=>{
  const w = learnWindow();
  const before = learnOrder(w.document);
  assert.deepStrictEqual([before[0], before[1], before[before.length - 1]], ['library', 'recentlyTrainedCard', 'index'], 'anchor: the phone order');
  w.arrangeLearnForPosture();
  const pane = w.document.getElementById('learnNavPane');
  assert.ok(pane && pane.classList.contains('split-primary') && w.document.getElementById('learnView').firstElementChild === pane);
  assert.deepStrictEqual([...pane.children].map(c => c.id || (c.querySelector('#exerciseSearchInput') ? 'library' : 'index')), ['library', 'recentlyTrainedCard', 'index']);
});

test('REAL invocation (v3.501): folding puts every card back exactly where it was; unfolding again rebuilds the pane', (assert)=>{
  const w = learnWindow();
  const before = learnOrder(w.document);
  w.arrangeLearnForPosture();
  w.__open = false; w.arrangeLearnForPosture();
  assert.deepStrictEqual(learnOrder(w.document), before);
  assert.strictEqual(w.document.getElementById('learnNavPane'), null);
  w.__open = true; w.arrangeLearnForPosture(); w.arrangeLearnForPosture();
  assert.strictEqual(w.document.querySelectorAll('#learnNavPane').length, 1, 'idempotent: one pane');
});

test('REAL source (v3.501): Learn is a split view; the first arrangement waits for the whole script (OPEN_POSTURE_QUERY is declared later)', (assert)=>{
  const doc = runJsdom(extractElementById(src, 'learnView'), '', []).window.document;
  assert.ok(doc.getElementById('learnView').classList.contains('posture-split'));
  assert.ok(src.indexOf('function arrangeLearnForPosture') < src.indexOf("const OPEN_POSTURE_QUERY = '"), 'anchor: it is defined before the query');
  assert.match(src, /setTimeout\(\(\)=>\{\n  arrangeLearnForPosture\(\);/, 'so its first call is deferred');
  assert.ok(!/#learnView\{/.test(OPEN), 'no longer held to the phone column');
});

// v3.502 — Analysis as a dashboard: two cards to a row on the open screen,
// one each side of the fold (or of the reported fold). Group headers, hints,
// the jump rail and Print span both columns. CSS only — no DOM moves, so the
// sibling-walking group collapse is untouched. Real-browser result (904x678):
// every visible card at x=18 or x=464, 422 wide.
test('REAL source (v3.502): a two-column grid on the open screen; cards take a column, everything else spans', (assert)=>{
  assert.equal(decl('#analysisView', 'display'), 'grid');
  assert.equal(decl('#analysisView', 'grid-template-columns'), 'minmax(0, 1fr) minmax(0, 1fr)');
  assert.equal(decl('#analysisView', 'column-gap'), 'var(--pane-gap)', 'the same gap as the split, so it sits on the fold');
  assert.equal(decl('#analysisView > *', 'grid-column'), '1 / -1');
  assert.equal(decl('#analysisView > .card', 'grid-column'), 'auto');
  assert.ok(!/#analysisView,/.test(OPEN), 'no longer held to the phone column');
  const hingeCols = decl('#analysisView', 'grid-template-columns', HINGE);
  const v = { vw:904, foldL:500, '--hinge-l':'env(viewport-segment-right 0 0, 50vw)', '--gutter-l':'18px' };
  assert.equal(18 + px(hingeCols.split(' minmax')[0], v), 488, 'with a reported fold at 500 the left column ends 12px short of it');
});

test('REAL markup (v3.502): every Analysis group header and non-card stays a direct child, so it spans; no wrapper was added', (assert)=>{
  const doc = runJsdom(extractElementById(src, 'analysisView'), '', []).window.document;
  const kids = [...doc.getElementById('analysisView').children];
  assert.ok(kids.filter(k => k.classList.contains('analysis-group-header')).length >= 3, 'anchor: the real group headers');
  assert.ok(kids.filter(k => k.classList.contains('card')).length >= 15, 'the cards are direct children, as the collapse expects');
  assert.strictEqual(doc.querySelectorAll('#analysisView .posture-split, #analysisView .split-primary').length, 0);
});

// v3.503 — Coach: the conversation is the left pane on the open screen; form
// feedback, past reviews and supplements stack on the right.
test('REAL markup (v3.503): Coach is a split view whose one primary is the Ask Your Coach card', (assert)=>{
  const doc = runJsdom(extractElementById(src, 'coachView'), '', []).window.document;
  const view = doc.getElementById('coachView');
  assert.ok(view.classList.contains('posture-split'));
  const primaries = view.querySelectorAll(':scope > .split-primary');
  assert.strictEqual(primaries.length, 1);
  assert.match(primaries[0].querySelector('.card-title').textContent, /Ask Your Coach/);
  assert.ok(!/#coachView[,{]/.test(OPEN), 'no longer held to the phone column');
});

// v3.504 — Care: the check-in form is the left pane; what you are resting,
// the pain trend, stretches and history stack on the right. With it, every
// tab has its own open layout.
test('REAL markup (v3.504): Care is a split view led by the check-in form; no tab is left in the phone column', (assert)=>{
  const doc = runJsdom(extractElementById(src, 'careView'), '', []).window.document;
  const view = doc.getElementById('careView');
  assert.ok(view.classList.contains('posture-split'));
  const primaries = view.querySelectorAll(':scope > .split-primary');
  assert.strictEqual(primaries.length, 1);
  assert.match(primaries[0].querySelector('.card-title').textContent, /Log How You.re Feeling/);
  assert.ok(!/#\w+View\s*\{[^}]*max-width:calc\(640px - 36px\)/.test(OPEN), 'the phone-column list is gone');
});

// v3.505 — Sheets sit in a pane on the open screen. A bottom sheet as wide as
// the screen ran across the fold; now a sheet is a panel in the right pane,
// lifted off the bottom edge with all four corners rounded. More rises over
// the tab bar in the left pane. The set editor opens opposite what it edits:
// right of the session, but left of gym mode's pinned exercise.
// Real-browser result (Chromium, 904x678): search and set editor 464..886,
// More 18..440, gym set editor 10..440 beside the exercise at 464; with a
// 30px hinge at 500, search 542..886 and gym set editor 10..488. No errors.
function col2(vw){
  const v = openVars(vw);
  v['--open-col2-left'] = decl(':root', '--open-col2-left');
  v['--open-col2-w'] = decl(':root', '--open-col2-w');
  return v;
}
test('REAL formulas (v3.505): the right column mirrors the left one about the middle of the page', (assert)=>{
  for(const vw of [861, 904, 1366]){
    const v = col2(vw);
    const l1 = px('var(--open-col-left)', v), w1 = px('var(--open-col-w)', v);
    const l2 = px('var(--open-col2-left)', v), w2 = px('var(--open-col2-w)', v);
    assert.equal(w2, w1, `same width (${vw})`);
    assert.equal(l2 + w2, vw - l1, `the same margin on the right (${vw})`);
    assert.equal(l2 - (l1 + w1), 24, `the pane gap between them (${vw})`);
  }
});

test('REAL formulas (v3.505): with a reported fold, the right column starts 12px past its far edge', (assert)=>{
  const v = { vw:904, foldL:500, foldR:530, '--hinge-l':'env(viewport-segment-right 0 0, 50vw)', '--hinge-r':'env(viewport-segment-left 1 0, 50vw)' };
  const l = px(decl(':root', '--open-col2-left', HINGE), v), w = px(decl(':root', '--open-col2-w', HINGE), v);
  assert.equal(l, 542);
  assert.equal(l + w, 904 - 18, 'to the page gutter');
});

test('REAL source (v3.505): sheets are panels in a pane, never across the fold', (assert)=>{
  for(const ov of ['.sub-modal-overlay, .calendar-modal-overlay']){
    assert.equal(decl(ov, 'justify-content'), 'flex-start');
    assert.equal(decl(ov, 'padding-left'), 'var(--open-col2-left)');
  }
  const sheet = '.sub-modal-sheet, .calendar-modal-sheet';
  assert.equal(decl(sheet, 'width'), 'var(--open-col2-w)');
  assert.equal(decl(sheet, 'max-width'), 'none');
  assert.equal(decl(sheet, 'border-radius'), 'var(--radius-lg)', 'all four corners');
  assert.match(decl(sheet, 'margin-bottom'), /^calc\(12px \+ env\(safe-area-inset-bottom/, 'lifted off the edge');
  assert.match(decl(sheet, 'transform'), /translateY\(calc\(100% \+ 24px\)\)/, 'closed, it clears the bottom edge completely');
  assert.equal(decl('#navMoreOverlay', 'padding-left'), 'var(--open-col-left)', 'More, over the tab bar');
  assert.equal(decl('#navMoreOverlay .sub-modal-sheet', 'width'), 'var(--open-col-w)');
  assert.equal(decl('.set-sheet', 'left'), 'var(--open-col2-left)');
  assert.equal(decl('.set-sheet', 'width'), 'var(--open-col2-w)');
  assert.equal(decl('.set-sheet', 'right'), 'auto');
  assert.equal(decl('.set-sheet', 'border-radius'), '28px');
  const gym = 'body.gym-mode:has(#exerciseList > .exercise-block.open) .set-sheet';
  assert.equal(decl(gym, 'left'), 'calc(var(--gym-wrap-left) + 10px)', 'gym mode: the left pane');
  assert.equal(decl(gym, 'width'), 'var(--gym-col-w)');
  assert.equal(decl('body.gym-mode #exerciseList > .exercise-block.open', 'grid-column'), '2', 'which is opposite the pinned exercise');
  const outside = src.replace(RAW[OPEN], '').replace(RAW[HINGE], '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/--open-col2/.test(outside), 'phones keep the bottom sheets');
});

run();
