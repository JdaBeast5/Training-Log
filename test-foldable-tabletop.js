'use strict';
// Passport foldables, part 2 (v3.497): tabletop gym mode.
//
// Half-folded on a bench with the fold horizontal, a passport foldable
// reports two STACKED viewport segments (Chrome on Android). In gym mode the
// page no longer runs across the fold: the exercise list ends at it, in the
// upright top half, and the flat bottom half is one control surface from the
// fold down: clock, the rest timer in its slot, a big Log target, Exit.
// Scoped under 760 wide and portrait (a passport in this posture is ~610-700
// wide) so it never meets the open-posture layouts or the sideways gym rail;
// phones and Safari never match.
//
// jsdom evaluates no media queries and has no env(), so the real [TABLETOP]
// rules are read from index.html and EVALUATED with given fold edges.
// Real-browser result (Chromium, CDP horizontal display feature at 430 on
// 609x861): dock 440..851, rest timer 496..574 inside it, Log 581..774; with
// no fold reported, the dock stays 769..851 as before.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-foldable-tabletop.js');

const COND = '(vertical-viewport-segments: 2) and (max-width:759px) and (orientation:portrait)';
function block(cond){
  const start = src.indexOf('@media ' + cond + '{');
  if(start < 0) throw new Error('no @media ' + cond);
  let depth = 0, i = src.indexOf('{', start);
  for(; i < src.length; i++){ if(src[i] === '{') depth++; if(src[i] === '}' && --depth === 0) break; }
  return src.slice(start, i + 1).replace(/\/\*[\s\S]*?\*\//g, '');
}
const T = block(COND);
function rule(sel){
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('(?:^|[\\s{}])' + esc + '\\s*\\{([^}]*)\\}').exec(T);
  if(!m) throw new Error('no ' + sel);
  return m[1];
}
function decl(body, prop){
  const m = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(body);
  if(!m) throw new Error('no ' + prop);
  return m[1].trim();
}
function px(expr, v){
  let e = expr;
  for(let i = 0; i < 6 && /var\(/.test(e); i++) e = e.replace(/var\((--[\w-]+)\)/g, (_, n)=>{ if(!(n in v)) throw new Error('unresolved ' + n); return '(' + v[n] + ')'; });
  e = e.replace(/env\(viewport-segment-bottom 0 0, 50vh\)/g, String(v.foldTop))
       .replace(/env\(viewport-segment-top 0 1, 50vh\)/g, String(v.foldBottom))
       .replace(/env\(safe-area-inset-bottom, 0px\)/g, '0')
       .replace(/(\d+(?:\.\d+)?)vh/g, (_, n)=> String(v.vh * n / 100))
       .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(');
  if(/[a-z]/i.test(e)) throw new Error('could not resolve ' + expr + ' -> ' + e);
  return Function('return (' + e + ')')();
}
function vars(vh, foldTop, foldBottom){
  const g = rule('body.gym-mode');
  return { vh, foldTop, foldBottom, '--fold-top':decl(g, '--fold-top'), '--fold-bottom':decl(g, '--fold-bottom') };
}

test('REAL source (v3.497): tabletop is gym-mode only, under 760 wide, and keyed to stacked segments', (assert)=>{
  const rules = [...T.matchAll(/([^{}]+)\{[^{}]*\}/g)].map(m=> m[1].trim()).filter(sel=> !sel.startsWith('@media'));
  assert.ok(rules.length >= 5, 'anchor: the real rules');
  for(const sel of rules) assert.ok(sel.startsWith('body.gym-mode'), `${sel} must be scoped to gym mode`);
});

test('REAL formulas (v3.497): the list ends at the fold; the dock covers the whole bottom half', (assert)=>{
  for(const [vh, top, bottom] of [[861, 430, 430], [861, 420, 450]]){
    const v = vars(vh, top, bottom);
    const padB = px(decl(rule('body.gym-mode .wrap'), 'padding-bottom'), v);
    assert.equal(vh - padB, top - 12, 'the page can scroll its content up to 12px above the fold, no further');
    const dock = rule('body.gym-mode .gym-dock');
    assert.equal(px(decl(dock, 'top'), v), bottom + 10, 'the dock starts just below the fold');
    assert.equal(px(decl(dock, 'bottom'), v), 10);
    assert.equal(decl(dock, 'flex-direction'), 'column');
  }
});

test('REAL formulas (v3.497): the rest timer sits in its slot inside the dock, above it, between clock and Log', (assert)=>{
  const v = vars(861, 430, 430);
  const t = rule('body.gym-mode .rest-timer');
  const top = px(decl(t, 'top'), v);
  const dockTop = px(decl(rule('body.gym-mode .gym-dock'), 'top'), v);
  const pad = 16, clock = 28, gap = 12;
  assert.equal(top, dockTop + pad + clock + gap, 'just under the clock row');
  assert.equal(decl(t, 'bottom'), 'auto');
  assert.ok(Number(decl(t, 'z-index')) > 55, 'drawn above the dock (z-index 55)');
  const log = rule('body.gym-mode .gym-dock .gym-log-btn');
  assert.ok(parseFloat(decl(log, 'margin-top')) >= 78, 'the Log button leaves room for the collapsed timer (78px tall)');
  assert.ok(parseFloat(decl(log, 'min-height')) >= 72, 'a big target');
});

test('REAL conditions (v3.497): at no size can tabletop apply together with the open layouts or the sideways rail', (assert)=>{
  // Every media condition is read from the real stylesheet. The fold is
  // reported as STACKED (tabletop's own premise): vertical segments true,
  // side-by-side false — a two-segment fold runs one way, not both.
  const conds = (re)=> [...src.matchAll(re)].map(m=> m[1]);
  const openGate = conds(/@media ((?:\(min-width:760px\)[^{]*))\{/g)[0];
  const rail = conds(/@media (\(orientation:landscape\) and \(max-height:559px\))\{/g)[0];
  assert.ok(openGate && rail, 'anchor: the real open gate and rail conditions');
  const feat = (f, w, h)=>{
    if(/vertical-viewport-segments: 2/.test(f)) return true;
    if(/horizontal-viewport-segments: 2/.test(f)) return false;
    let m = /^\(orientation:(landscape|portrait)\)$/.exec(f); if(m) return (w > h) === (m[1] === 'landscape');
    m = /^\((min|max)-(width|height):(\d+)px\)$/.exec(f); if(!m) throw new Error('unsupported ' + f);
    const val = m[2] === 'width' ? w : h; return m[1] === 'min' ? val >= +m[3] : val <= +m[3];
  };
  const match = (cond, w, h)=> cond.split(/\s*,\s*/).some(alt=> alt.split(/\s+and\s+/).every(f=> feat(f, w, h)));
  for(let w = 300; w <= 1400; w += 5){
    for(let h = 300; h <= 1100; h += 5){
      if(!match(COND, w, h)) continue;
      assert.ok(!match(openGate, w, h), `tabletop and the open layout both apply at ${w}x${h}`);
      assert.ok(!match(rail, w, h), `tabletop and the sideways rail both apply at ${w}x${h}`);
    }
  }
});

run();
