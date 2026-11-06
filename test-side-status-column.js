'use strict';
// v3.508 — The iPhone Duo's cover screen, stretched (owner, with screenshots
// from the device: "lets stretch it a bit to fit the form factor a bit
// better"). Upright, the cover reports a right safe-area inset of about 82pt
// for its status column (camera, clock, Wi-Fi, battery), and every side gutter
// cleared it top to bottom, leaving an empty strip down the whole page. That
// column only has something in it at the top. Now:
// - --side-l/--side-r, which every side-clearing rule reads, are the insets
//   sideways (the sensor housing runs the full height there) and zero upright;
// - [SIDE STATUS COLUMN] clears the status block itself: the header keeps its
//   width beside the column and reaches below it, gym mode's list starts
//   below it, and a patch of the status strip's glass sits behind it.
// Phones report no side inset upright, so for them it all resolves to what it
// was (--status-col-h is 0).
//
// jsdom evaluates neither media queries nor env(); the real rules are read
// from index.html and their formulas evaluated for a given inset set.
// Real-browser result (Chromium, Emulation.setSafeAreaInsetsOverride):
// a 458x900 cover with insets top 10/right 82 had cards 18..376 before and
// 18..440 after; header buttons 336..376 both times; the first card started
// at 160 (status column 0..160); the gym card at 182; the patch at 376..458 x
// 0..160. A 402x874 phone and an 874x402 landscape phone (59/59) measured
// identical before and after. No errors.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const src = readIndexSource();
const { test, run } = makeRunner('test-side-status-column.js');

const RAW = [];
function block(head){
  const start = src.indexOf(head);
  if(start < 0) throw new Error('no ' + head);
  let depth = 0, i = src.indexOf('{', start);
  for(; i < src.length; i++){ if(src[i] === '{') depth++; if(src[i] === '}' && --depth === 0) break; }
  RAW.push(src.slice(start, i + 1));
  return src.slice(start, i + 1).replace(/\/\*[\s\S]*?\*\//g, '');
}
const UPRIGHT = block('  @media (orientation: portrait){\n    :root{\n      --side-l:0px');
const UPRIGHT_RAW = RAW[0];
const ROOT = block('  :root{\n');
function decl(body, sel, prop){
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for(const m of body.matchAll(new RegExp('(?:^|[\\s{}])' + esc + '\\s*\\{([^}]*)\\}', 'g'))){
    const d = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(m[1]);
    if(d) return d[1].trim();
  }
  throw new Error('no ' + prop + ' on ' + sel);
}
function px(expr, env, vars = {}){
  let e = expr;
  for(let i = 0; i < 6 && /var\(/.test(e); i++) e = e.replace(/var\((--[\w-]+)\)/g, (_, n)=>{ if(!(n in vars)) throw new Error('unresolved ' + n); return '(' + vars[n] + ')'; });
  e = e.replace(/env\(safe-area-inset-(left|right|top|bottom),\s*0px\)/g, (_, s)=> String(env[s] || 0))
    .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(').replace(/\bmax\(/g, 'Math.max(').replace(/\bmin\(/g, 'Math.min(');
  if(/[a-z]/i.test(e.replace(/Math\.(max|min)/g, ''))) throw new Error('could not resolve ' + expr + ' -> ' + e);
  return Function('return (' + e + ')')();
}
const COVER = { top:10, right:82, left:0 }, PHONE = { top:62, right:0, left:0 };
const H = env => px(decl(UPRIGHT, ':root', '--status-col-h'), env);

test('REAL tokens: the side insets are the real ones sideways and zero upright', (assert)=>{
  assert.equal(px(decl(ROOT, ':root', '--side-r'), COVER), 82, 'the main :root: the inset');
  assert.equal(px(decl(ROOT, ':root', '--side-l'), { left:59 }), 59);
  assert.equal(decl(UPRIGHT, ':root', '--side-l'), '0px');
  assert.equal(decl(UPRIGHT, ':root', '--side-r'), '0px');
});

test('REAL source: every side-clearing rule reads the tokens; env() side insets remain only in sideways-only rules and this block', (assert)=>{
  const uses = (src.match(/var\(--side-[lr]\)/g) || []).length;
  assert.ok(uses >= 14, `anchor: the call sites were converted (${uses})`);
  const rest = src.replace(UPRIGHT_RAW, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const left = [...rest.matchAll(/[^\n]*env\(safe-area-inset-(?:left|right)[^\n]*/g)].map(m => m[0].trim());
  // The main :root's two token definitions, and the short-landscape gym rail
  // (an orientation:landscape block, so never upright).
  assert.strictEqual(left.filter(l => !/^--side-l:env/.test(l) && !/--gym-pad-[lr]:|right:calc\(10px \+ env\(safe-area-inset-right/.test(l)).length, 0, left.join('\n'));
  const rail = block('@media (orientation:landscape) and (max-height:559px)');
  assert.match(rail, /--gym-pad-r:calc\(var\(--gym-rail-w\) \+ 20px \+ env\(safe-area-inset-right/);
});

test('REAL formulas: the status column is 160px deep with a side inset, and nothing without one', (assert)=>{
  assert.equal(H(COVER), 160);
  assert.equal(H({ left:30 }), 160, 'either side');
  assert.equal(H(PHONE), 0, 'phones: inert');
});

test('REAL formulas: the header reaches the bottom of the status column, so the first card starts below it', (assert)=>{
  const vars = { '--status-col-h': H(COVER) };
  const wrapTop = 22 + COVER.top;  // .wrap's padding-top
  assert.match(decl(src, '.wrap', 'padding'), /^calc\(22px \+ env\(safe-area-inset-top, 0px\)\)/, 'anchor: that padding');
  assert.equal(wrapTop + px(decl(UPRIGHT, 'header', 'min-height'), COVER, vars), 160);
  const phone = px(decl(UPRIGHT, 'header', 'min-height'), PHONE, { '--status-col-h': H(PHONE) });
  assert.ok(phone <= 0, 'on a phone the minimum is below zero, so the header keeps its natural height');
});

test('REAL formulas: the header and its buttons stay exactly where they were, beside the column', (assert)=>{
  // Before: the page's right gutter was max(18px, inset) = 82, buttons at
  // right:0 and right:50px inside it. Now the gutter is 18, so they take the rest.
  const gutterBefore = Math.max(18, COVER.right), gutterNow = 18;
  assert.equal(gutterNow + px(decl(UPRIGHT, '.settings-cog', 'right'), COVER), gutterBefore);
  assert.equal(gutterNow + px(decl(UPRIGHT, '.header-search', 'right'), COVER), gutterBefore + 50);
  assert.equal(gutterNow + px(decl(UPRIGHT, 'header', 'padding-right'), COVER), gutterBefore, 'the title wraps where it did');
  assert.equal(px(decl(UPRIGHT, '.settings-cog', 'right'), PHONE), 0, 'phones: unchanged');
  assert.equal(px(decl(UPRIGHT, 'header', 'padding-left'), PHONE), 0);
});

test('REAL formulas: gym mode, which has no header, starts its list below the column; on a phone, where it did', (assert)=>{
  const top = decl(UPRIGHT, 'body.gym-mode .wrap', 'padding-top');
  assert.equal(px(top, COVER, { '--status-col-h': H(COVER) }), 168);
  assert.equal(px(top, PHONE, { '--status-col-h': H(PHONE) }), 12 + PHONE.top, 'the base rule\'s value');
  assert.match(decl(src, 'body.gym-mode .wrap', 'padding-top'), /^calc\(12px \+ env\(safe-area-inset-top, 0px\)\)$/, 'anchor: the base rule');
  assert.ok(src.indexOf(UPRIGHT_RAW) > src.indexOf('padding-bottom:calc(208px + env(safe-area-inset-bottom'), 'placed after the base rule, so upright it wins');
});

test('REAL source + markup: the patch is the status strip\'s glass, as wide as the inset and as deep as the column, and only upright', (assert)=>{
  const sel = '.status-col-scrim';
  assert.equal(decl(UPRIGHT, sel, 'width'), 'env(safe-area-inset-right, 0px)');
  assert.equal(decl(UPRIGHT, sel, 'height'), 'var(--status-col-h)');
  assert.equal(decl(UPRIGHT, sel, 'right'), '0');
  assert.equal(decl(UPRIGHT, sel, 'background'), decl(src, '.status-scrim', 'background'), 'the same glass as the top strip');
  assert.equal(decl(UPRIGHT, sel, 'pointer-events'), 'none');
  assert.equal(decl(UPRIGHT, sel, 'display'), 'block');
  assert.match(src, /\n  \.status-col-scrim\{ display:none; \}\n  @media \(orientation: portrait\)\{/, 'hidden outside the upright block');
  assert.strictEqual((src.match(/<div class="status-col-scrim" aria-hidden="true"><\/div>/g) || []).length, 1);
});

run();
