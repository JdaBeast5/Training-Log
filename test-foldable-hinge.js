'use strict';
// Passport foldables, part 1 (v3.496; owner: "optimize the new one to also
// allow the new form factor for the passport foldables").
//
// Chrome on Android reports a fold to the page as Viewport Segments: in book
// posture (a passport foldable half-open, fold vertical) two side-by-side
// segments, with env(viewport-segment-*) giving each one's edges. Safari
// reports nothing (the iPhone Duo work sizes the split by width alone).
// Where segments are reported:
//  - the open layout applies at any width (still >= 560 tall, so it never
//    meets the short-landscape gym rail — test-duo-gym-short-landscape.js);
//  - the split stops estimating the crease as the middle of a centred column:
//    the left column ends 12px before the fold and the right starts 12px
//    after it, so an off-centre fold or a physical hinge gap is respected;
//  - gym mode's list | exercise split and its dock follow the same line.
//
// jsdom evaluates no media queries and has no env(), so the real [HINGE]
// rules are read from index.html and EVALUATED with given fold edges.
// Real-browser result (Chromium, CDP display-feature emulation): fold at 452
// -> columns end 440 / start 464; fold 500..530 -> 488 / 542; see HANDOFF.
const { readIndexSource, extractConst, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-foldable-hinge.js');

const HINGE_COND = '(horizontal-viewport-segments: 2) and (min-height:560px)';
function block(cond){
  const start = src.indexOf('@media ' + cond + '{');
  if(start < 0) throw new Error('no @media ' + cond);
  let depth = 0, i = src.indexOf('{', start);
  for(; i < src.length; i++){ if(src[i] === '{') depth++; if(src[i] === '}' && --depth === 0) break; }
  return src.slice(start, i + 1).replace(/\/\*[\s\S]*?\*\//g, '');
}
const HINGE = block(HINGE_COND);
function rule(body, sel){
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('(?:^|[\\s{}])' + esc + '\\s*\\{([^}]*)\\}').exec(body);
  if(!m) throw new Error('no ' + sel);
  return m[1];
}
function decl(body, prop){
  const m = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(body);
  if(!m) throw new Error('no ' + prop);
  return m[1].trim();
}
// Resolve px/vw/calc/var/env(viewport-segment-*) against a fold.
function px(expr, v){
  let e = expr;
  for(let i = 0; i < 6 && /var\(/.test(e); i++) e = e.replace(/var\((--[\w-]+)\)/g, (_, n)=>{ if(!(n in v)) throw new Error('unresolved ' + n); return '(' + v[n] + ')'; });
  e = e.replace(/env\(viewport-segment-right 0 0, 50vw\)/g, String(v.foldL))
       .replace(/env\(viewport-segment-left 1 0, 50vw\)/g, String(v.foldR))
       .replace(/(\d+(?:\.\d+)?)vw/g, (_, n)=> String(v.vw * n / 100))
       .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(').replace(/minmax\(0, 1fr\)/g, '');
  if(/[a-z]/i.test(e)) throw new Error('could not resolve ' + expr + ' -> ' + e);
  return Function('return (' + e + ')')();
}
function geometry(vw, foldL, foldR){
  const root = rule(HINGE, ':root');
  const v = { vw, foldL, foldR, '--gutter-l':'18px' };
  for(const n of ['--hinge-l', '--hinge-r', '--wrap-max', '--pane-gap']) v[n] = decl(root, n);
  const cols = decl(rule(HINGE, '.posture-split'), 'grid-template-columns');
  const col1 = px(cols.split(' minmax')[0], v);
  const gap = px('var(--pane-gap)', v);
  return { wrapMax: px('var(--wrap-max)', v), col1Right: 18 + col1, col2Left: 18 + col1 + gap, v };
}

test('REAL source (v3.496): the open gate and JS share the fold alternative; Safari keeps its size-only path', (assert)=>{
  assert.ok(src.includes('@media (min-width:760px) and (min-height:560px), ' + HINGE_COND + '{'), 'the open-posture block takes either');
  const { window } = require('./testHelpers.js').runJsdom('', '', [extractConst(src, 'OPEN_POSTURE_QUERY')]);
  assert.equal(window.eval('OPEN_POSTURE_QUERY'), '(min-width:760px) and (min-height:560px), ' + HINGE_COND);
});

test('REAL formulas (v3.496): a centred seamless fold puts the gutter exactly around it', (assert)=>{
  const g = geometry(904, 452, 452);
  assert.equal(g.wrapMax, 904, 'the page spans the screen');
  assert.equal(g.col1Right, 440, 'left column ends 12px before the fold');
  assert.equal(g.col2Left, 464, 'right column starts 12px after it');
});

test('REAL formulas (v3.496): an off-centre fold with a physical gap is respected, not assumed central', (assert)=>{
  const g = geometry(904, 500, 530);
  assert.equal(g.col1Right, 488);
  assert.equal(g.col2Left, 542);
  assert.ok(g.col2Left > 530 && g.col1Right < 500, 'nothing is laid across the gap');
});

test('REAL formulas (v3.496): gym mode\'s list | exercise split and its dock follow the fold', (assert)=>{
  const v = { foldL:500, foldR:530, vw:904 };
  const hl = 'env(viewport-segment-right 0 0, 50vw)';
  const gymCols = decl(rule(HINGE, 'body.gym-mode #exerciseList'), 'grid-template-columns');
  const col1 = px(gymCols.split(' minmax')[0].replace('var(--hinge-l)', hl), v);
  assert.equal(10 + col1, 488, 'the list ends 12px before the fold (10px gym-mode side)');
  const gymRoot = rule(HINGE, 'body.gym-mode');
  assert.equal(px(decl(gymRoot, '--gym-col-w').replace('var(--hinge-l)', hl), v), col1, 'the dock and rest timer measure the same column');
  assert.equal(decl(gymRoot, '--gym-wrap-left'), '0px');
});

test('REAL formulas (v3.496): the sticky day header spans the session pane up to the fold', (assert)=>{
  const h = rule(HINGE, '.sticky-day-header');
  const v = { vw:904, foldL:500, foldR:530 };
  assert.equal(decl(h, 'left'), '0');
  assert.equal(904 - px(decl(h, 'right').replace('var(--hinge-l)', 'env(viewport-segment-right 0 0, 50vw)'), v), 488);
});

run();
