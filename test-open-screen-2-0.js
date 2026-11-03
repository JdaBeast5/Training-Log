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
const { readIndexSource, makeRunner } = require('./testHelpers.js');

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

run();
