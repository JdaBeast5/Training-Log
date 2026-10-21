'use strict';
// iPhone Duo support, part 2: page gutters and edge-anchored controls clear
// the LEFT and RIGHT safe areas, each side on its own.
//
// While the manifest locked portrait, the side insets were always zero and
// every side gutter was a flat 18px. Now that the app rotates (and the Duo's
// own insets can differ left vs right), a phone on its side puts the sensor
// housing inside one side's inset. .wrap now declares --gutter-l/--gutter-r:
// the larger of 18px and THAT side's inset, minus whatever the column's own
// centring margin already clears (a 640px column centred on an 874px
// landscape phone sits 117px in and must not shrink at all).
//
// jsdom has no layout engine and does not resolve env()/max(), so — same
// shape as test-analysis-index-scroll-clearance.js — this reads the real
// rule blocks out of index.html, but goes one step further than matching
// text: it EVALUATES the real formulas with a given viewport width and
// inset pair, so the assertions are about the resulting pixel values.
// (Geometry was also confirmed in real Chromium with
// Emulation.setSafeAreaInsetsOverride — see HANDOFF-v51.)
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-side-safe-area-gutters.js');

// mustContain picks out the one rule for a selector that is declared more
// than once (.gym-dock has a positioning rule and a later state rule).
function ruleBlock(selector, mustContain){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(?:^|\\n)\\s*' + escaped + '\\s*\\{([^}]*)\\}', 'g');
  const hits = [...src.matchAll(re)].filter(h=> !mustContain || h[1].includes(mustContain));
  if(hits.length !== 1) throw new Error(`expected exactly one ${selector} rule, found ${hits.length}`);
  return hits[0][1].replace(/\/\*[\s\S]*?\*\//g, '');
}
// Split a shorthand value on top-level spaces only (calc(a - b) stays whole).
function parts(value){
  const out = []; let depth = 0, cur = '';
  for(const ch of value){
    if(ch === '(') depth++;
    if(ch === ')') depth--;
    if(/\s/.test(ch) && depth === 0){ if(cur) out.push(cur); cur = ''; }
    else cur += ch;
  }
  if(cur) out.push(cur);
  return out;
}
function decl(block, prop){
  const m = new RegExp('(?:^|[;\\s])' + prop.replace(/[-]/g, '\\-') + '\\s*:\\s*([^;]+);').exec(block);
  if(!m) throw new Error(`no ${prop} declaration`);
  return m[1].trim();
}

// Resolve a CSS length expression to px. Handles exactly what these rules
// use: px, 100vw, env(safe-area-inset-*, fallback), var(--x), calc(), max().
function resolve(expr, env, vars){
  let e = expr;
  for(let i = 0; i < 6 && /var\(/.test(e); i++){
    e = e.replace(/var\((--[\w-]+)\)/g, (_, name)=>{
      if(!(name in vars)) throw new Error(`unresolved ${name}`);
      return '(' + vars[name] + ')';
    });
  }
  e = e.replace(/env\(safe-area-inset-(left|right|top|bottom)\s*,\s*0px\)/g, (_, side)=> String(env[side] || 0))
       .replace(/(\d+(?:\.\d+)?)vw/g, (_, n)=> String(env.vw * n / 100))
       .replace(/(\d+(?:\.\d+)?)px/g, '$1')
       .replace(/\bcalc\(/g, '(')
       .replace(/\bmax\(/g, 'Math.max(');
  if(/[a-z]/i.test(e.replace(/Math\.max/g, ''))) throw new Error(`could not resolve: ${expr} -> ${e}`);
  return Function('return (' + e + ')')();
}

const wrap = ruleBlock('.wrap');
const wrapVars = {};
for(const name of ['--wrap-side-margin', '--gutter-l', '--gutter-r']) wrapVars[name] = decl(wrap, name);
// The phone-width column (the open-posture layout overrides it in a media
// query; these cases are all phone-sized, so the base :root value applies).
wrapVars['--wrap-max'] = decl(ruleBlock(':root', '--wrap-max:640px'), '--wrap-max');
function gutters(env){
  // Custom properties resolve lazily against each other, same as the browser.
  const vars = {...wrapVars};
  return { l: resolve('var(--gutter-l)', env, vars), r: resolve('var(--gutter-r)', env, vars), vars };
}

test('portrait slab (no side insets): both gutters are the original 18px', (assert)=>{
  const g = gutters({vw:402, left:0, right:0});
  assert.equal(g.l, 18); assert.equal(g.r, 18);
});

test('narrow viewport with ASYMMETRIC insets: each side takes its OWN inset, not one mirrored to both', (assert)=>{
  const g = gutters({vw:430, left:40, right:24});
  assert.equal(g.l, 40, 'left gutter must follow the left inset');
  assert.equal(g.r, 24, 'right gutter must follow the right inset (mirroring the left would over-pad this edge)');
});

test('landscape slab: the centred 640px column already clears a 59px inset, so it must not shrink', (assert)=>{
  const g = gutters({vw:874, left:59, right:59});
  assert.equal(g.l, 18); assert.equal(g.r, 18);
});

test('.wrap actually APPLIES the tokens: right padding from --gutter-r, left from --gutter-l', (assert)=>{
  const padding = parts(decl(wrap, 'padding'));
  assert.equal(padding.length, 4, 'padding must be the four-value form so left and right can differ');
  const env = {vw:430, left:40, right:24};
  const vars = {...wrapVars};
  assert.equal(resolve(padding[1], env, vars), 24, 'right padding');
  assert.equal(resolve(padding[3], env, vars), 40, 'left padding');
});

test('.nav-pills bleeds out by exactly the gutter on each side (sum-to-zero with .wrap padding)', (assert)=>{
  const b = ruleBlock('.nav-pills');
  for(const env of [{vw:402, left:0, right:0}, {vw:430, left:40, right:24}]){
    const {l, r, vars} = gutters(env);
    assert.equal(resolve(decl(b, 'margin-left'), env, vars), -l);
    assert.equal(resolve(decl(b, 'margin-right'), env, vars), -r);
  }
});

test('.nav-pills-scroll insets itself by what the gutter adds beyond 18px — zero in portrait, so the rail is unchanged there', (assert)=>{
  const m = parts(decl(ruleBlock('.nav-pills-scroll'), 'margin'));
  const portrait = gutters({vw:402, left:0, right:0});
  assert.equal(resolve(m[1], {vw:402}, portrait.vars), 0);
  assert.equal(resolve(m[3], {vw:402}, portrait.vars), 0);
  const env = {vw:430, left:40, right:24};
  const g = gutters(env);
  assert.equal(resolve(m[3], env, g.vars), 22, 'pinned search pill must stop 18px short of the content edge, outside the inset');
  assert.equal(resolve(m[1], env, g.vars), 6);
});

test('.analysis-index bleeds and re-pads by the same tokens', (assert)=>{
  const mg = parts(decl(ruleBlock('.analysis-index'), 'margin'));
  const pad = parts(decl(ruleBlock('.analysis-index'), 'padding'));
  const env = {vw:430, left:40, right:24};
  const g = gutters(env);
  assert.equal(resolve(mg[1], env, g.vars), -24); assert.equal(resolve(mg[3], env, g.vars), -40);
  assert.equal(resolve(pad[1], env, g.vars), 24); assert.equal(resolve(pad[3], env, g.vars), 40);
});

test('coach FAB carries both side insets as margin, and drops it while dragging (no sideways jump under the finger)', (assert)=>{
  const m = parts(decl(ruleBlock('.coach-fab'), 'margin'));
  const env = {left:40, right:24};
  assert.equal(resolve(m[1], env, {}), 24); assert.equal(resolve(m[3], env, {}), 40);
  assert.equal(decl(ruleBlock('.coach-fab.dragging'), 'margin'), '0');
});

test('today FAB, sticky day header and gym dock clear the side insets', (assert)=>{
  const env = {left:40, right:24};
  assert.equal(resolve(decl(ruleBlock('.today-fab'), 'left'), env, {}), 58);
  const dock = ruleBlock('.gym-dock', 'position:fixed');
  assert.equal(resolve(decl(dock, 'left'), env, {}), 50);
  assert.equal(resolve(decl(dock, 'right'), env, {}), 34);
  const pad = parts(decl(ruleBlock('.sticky-day-header', 'position:fixed'), 'padding'));
  assert.equal(resolve(pad[1], env, {}), 24); assert.equal(resolve(pad[3], env, {}), 40);
  assert.equal(resolve(pad[1], {}, {}), 16, 'unchanged 16px with no inset');
});

test('gym mode keeps its tighter 10px sides, but still clears a side inset', (assert)=>{
  const b = ruleBlock('body.gym-mode .wrap');
  const env = {vw:430, left:40, right:24};
  const g = gutters(env);
  assert.equal(resolve(decl(b, 'padding-left'), env, g.vars), 40);
  assert.equal(resolve(decl(b, 'padding-right'), env, g.vars), 24);
  const portrait = {vw:402, left:0, right:0};
  assert.equal(resolve(decl(b, 'padding-left'), portrait, gutters(portrait).vars), 10);
});

run();
