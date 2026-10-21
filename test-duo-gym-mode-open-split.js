'use strict';
// iPhone Duo support, part 6: gym mode on the open Duo.
//
// Inside the open-posture media query, gym mode splits its exercise list:
// the quiet list down the left, the open exercise pinned on the right
// (sticky, scrolling inside itself when taller than the screen), and the
// dock + rest timer under the left pane while something is open. On the
// cover screen and on a slab phone none of this applies — every rule lives
// inside the open-posture block.
//
// Selector semantics run on the REAL workout markup in jsdom with the REAL
// setExerciseBlockOpen; geometry is evaluated from the real formulas.
// Real-browser result (Chromium): 890x626 puts the open exercise at x=457
// (423 wide, 602 tall, fits) and list rows at x=10 on the phone's 93px
// rhythm; the dock spans 10..433; checking an exercise off moves the next
// one into the right pane; unfolding with two open keeps the second in the
// list; phone sizes are pixel-identical in gym mode. See HANDOFF-v51.
const { readIndexSource, extractElementById, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-duo-gym-mode-open-split.js');

function openPostureBlock(){
  const hits = [];
  const re = /@media ([^{]+)\{/g;
  let m;
  while((m = re.exec(src))){
    let depth = 0, i = src.indexOf('{', m.index);
    for(; i < src.length; i++){
      if(src[i] === '{') depth++;
      if(src[i] === '}' && --depth === 0) break;
    }
    const body = src.slice(m.index, i + 1);
    if(body.includes('.split-primary{')) hits.push(body);
  }
  if(hits.length !== 1) throw new Error('expected one open-posture block');
  return hits[0];
}
const wideRaw = openPostureBlock();
const wide = wideRaw.replace(/\/\*[\s\S]*?\*\//g, '');
function wideRule(selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hits = [...wide.matchAll(new RegExp('(?:^|[\\s}])' + escaped + '\\s*\\{([^}]*)\\}', 'g'))];
  if(hits.length !== 1) throw new Error(`expected one ${selector} rule in the open-posture block, found ${hits.length}`);
  return hits[0][1];
}
function decl(block, prop){
  const m = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(block);
  if(!m) throw new Error('no ' + prop);
  return m[1].trim();
}
function px(expr, vars){
  let e = expr;
  for(let i = 0; i < 6 && /var\(/.test(e); i++) e = e.replace(/var\((--[\w-]+)\)/g, (_, n)=>{ if(!(n in vars)) throw new Error('unresolved ' + n); return '(' + vars[n] + ')'; });
  e = e.replace(/env\(safe-area-inset-\w+,\s*0px\)/g, '0')
    .replace(/(\d+(?:\.\d+)?)vw/g, (_, n)=> String(vars.vw * n / 100))
    .replace(/(\d+(?:\.\d+)?)dvh/g, (_, n)=> String(vars.vh * n / 100))
    .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(').replace(/\bmax\(/g, 'Math.max(').replace(/\bmin\(/g, 'Math.min(');
  if(/[a-z]/i.test(e.replace(/Math\.(max|min)/g, ''))) throw new Error('could not resolve ' + expr + ' -> ' + e);
  return Function('return (' + e + ')')();
}
const root = wideRule(':root');
const gymVars = decl.bind(null, wideRule('body.gym-mode'));
function geometry(vw, vh){
  const vars = { vw, vh, '--wrap-max': decl(root, '--wrap-max'), '--pane-gap': decl(root, '--pane-gap') };
  vars['--gym-wrap-left'] = gymVars('--gym-wrap-left');
  vars['--gym-col-w'] = gymVars('--gym-col-w');
  return vars;
}
const PANE = 'body.gym-mode #exerciseList > .exercise-block.open';
const EXTRA = 'body.gym-mode #exerciseList > .exercise-block.open ~ .exercise-block.open';

// ── Which block goes where (real markup, real setExerciseBlockOpen) ─────────

function workout(nBlocks){
  const blocks = Array.from({length:nBlocks}, (_, i)=> `<div class="exercise-block" id="b${i}"><div class="exercise"></div><div class="expand-wrap"></div></div>`).join('');
  const { window, document } = runJsdom(extractElementById(src, 'workoutCard'), '', [extractFunction(src, 'setExerciseBlockOpen')]);
  document.getElementById('exerciseList').innerHTML = blocks;
  return { window, document };
}
const sel = s=> s.replace(/^body\.gym-mode /, '');

test('the exercise list is the real #exerciseList inside the workout card, and its rows are its direct children', (assert)=>{
  const { document } = workout(4);
  assert.equal(document.querySelectorAll('#workoutCard #exerciseList').length, 1);
  assert.equal(document.querySelectorAll(sel('body.gym-mode #exerciseList > *')).length, 4);
});

test('exactly one block takes the right pane: the open one, or the FIRST of several open', (assert)=>{
  const { window, document } = workout(5);
  window.setExerciseBlockOpen(document.getElementById('b1'), true);
  const inPane = ()=> [...document.querySelectorAll(sel(PANE))].filter(b=> !b.matches(sel(EXTRA))).map(b=> b.id);
  assert.deepEqual(inPane(), ['b1']);
  window.setExerciseBlockOpen(document.getElementById('b3'), true); // e.g. opened on the cover screen, then unfolded
  assert.deepEqual(inPane(), ['b1'], 'a second open block must not stack on the first');
  assert.deepEqual([...document.querySelectorAll(sel(EXTRA))].map(b=> b.id), ['b3'], 'it stays in the list instead');
  window.setExerciseBlockOpen(document.getElementById('b1'), false);
  assert.deepEqual(inPane(), ['b3'], 'closing the first hands the pane to the other');
});

test('the extra-open fallback really undoes the pane placement (column, row, pinning, inner scroll)', (assert)=>{
  const extra = wideRule(EXTRA);
  assert.equal(decl(extra, 'grid-column'), '1');
  assert.equal(decl(extra, 'grid-row'), 'auto');
  assert.equal(decl(extra, 'position'), 'relative');
  assert.equal(decl(extra, 'max-height'), 'none');
  assert.equal(decl(extra, 'overflow'), 'visible');
});

// ── Geometry, from the real formulas ────────────────────────────────────────

test('list and exercise are two equal columns around the crease (gutter centred on 445 at 890 wide)', (assert)=>{
  const list = wideRule('body.gym-mode #exerciseList');
  assert.equal(decl(list, 'grid-template-columns'), 'minmax(0, 1fr) minmax(0, 1fr)');
  assert.match(decl(list, 'grid-template-rows'), /^repeat\(\d+, auto\) 1fr$/);
  const v = geometry(890, 626);
  const col = px('var(--gym-col-w)', v), gap = px('var(--pane-gap)', v);
  assert.equal(col, 423);
  const gapStart = 10 + col;
  assert.equal(gapStart + gap / 2, 445);
});

test('the pinned exercise fits the screen: sticky top + max-height never reaches past the bottom', (assert)=>{
  const pane = wideRule(PANE);
  assert.equal(decl(pane, 'position'), 'sticky');
  assert.equal(decl(pane, 'grid-column'), '2');
  assert.equal(decl(pane, 'grid-row'), '1 / -1');
  assert.equal(decl(pane, 'overflow-y'), 'auto', 'a long exercise scrolls inside itself, or its bottom sets are unreachable');
  for(const [vw, vh] of [[890, 626], [1180, 820]]){
    const v = geometry(vw, vh);
    const top = px(decl(pane, 'top'), v), h = px(decl(pane, 'max-height'), v);
    assert.ok(top + h <= vh - 12, `at ${vw}x${vh} the panel would end at ${top + h}`);
  }
});

test('with an exercise open, the dock spans exactly the list column and the rest timer centres on it', (assert)=>{
  const dock = wideRule('body.gym-mode:has(#exerciseList > .exercise-block.open) .gym-dock');
  const timer = wideRule('body.gym-mode:has(#exerciseList > .exercise-block.open) .rest-timer');
  for(const vw of [890, 1180]){
    const v = geometry(vw, 700);
    const wrapLeft = Math.max(0, (vw - 1080) / 2);
    const col = px('var(--gym-col-w)', v);
    assert.equal(px(decl(dock, 'left'), v), wrapLeft + 10);
    assert.equal(vw - px(decl(dock, 'right'), v), wrapLeft + 10 + col, `dock right edge at ${vw}`);
    assert.equal(px(decl(timer, 'left'), v), wrapLeft + 10 + col / 2, `timer centre at ${vw}`);
    assert.equal(px(decl(timer, 'max-width'), v), col);
  }
  assert.ok(px('var(--gym-col-w)', geometry(890, 626)) >= 320, 'the expanded rest timer (320px) must fit the column');
});

test('nothing open: the list falls back to one centred phone-width column', (assert)=>{
  const none = wideRule('body.gym-mode #exerciseList:not(:has(> .exercise-block.open))');
  assert.equal(decl(none, 'display'), 'block');
  assert.equal(decl(none, 'max-width'), 'calc(640px - 20px)');
});

test('phones are untouched: every new gym rule exists only inside the open-posture block', (assert)=>{
  const outside = src.replace(wideRaw, '');
  assert.ok(outside.length < src.length, 'the open-posture block must actually be removed before checking what is left');
  for(const re of [/#exerciseList\s*\{[^}]*display:grid/, /--gym-col-w/, /\.exercise-block\.open\s*\{[^}]*position:sticky/]){
    assert.ok(!re.test(outside), `${re} found outside the open-posture block — it would apply on phones`);
  }
});

run();
