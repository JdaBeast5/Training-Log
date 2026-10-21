'use strict';
// iPhone Duo support, part 3: the open-posture two-pane Today.
//
// At >=760pt wide AND >=560pt tall (an unfolded Duo, ~890x626pt) the page
// column widens and Today becomes a grid: .today-session-pane (day picker +
// session) on the left, every other Today child stacked on the right, with
// the gutter between two equal columns landing on the crease. Below that
// size nothing changes — the pane is a plain block in the same place in the
// flow the three elements it wraps always were.
//
// jsdom evaluates no media queries and does no layout. So the markup half of
// this runs against the REAL Today markup in jsdom (what is in the pane, what
// is not, document order, the gym-mode hide selector, the real
// positionProfileCard moving the profile card between its slots), and the
// CSS half evaluates the real gate and sticky-header formula against real
// device sizes rather than matching text. Layout itself (equal columns, no
// gaps between right-hand cards, phone sizes pixel-identical to before) was
// confirmed in real Chromium — see HANDOFF-v51.
const { readIndexSource, extractElementById, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-duo-open-posture-layout.js');

function todayDom(){
  return runJsdom(extractElementById(src, 'todayView') + '<div id="settingsProfileSlot"></div>', '', []);
}

// The open-posture block is found by what it CONTAINS (the pane placement
// rule), not by its condition text, so the gate below is read from the real
// source rather than restated here.
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
    if(body.includes('.split-primary{')) hits.push({ condition: m[1].trim(), body: body.replace(/\/\*[\s\S]*?\*\//g, '') });
  }
  if(hits.length !== 1) throw new Error(`expected one @media placing .split-primary, found ${hits.length}`);
  return hits[0];
}
const { condition: GATE, body: wide } = openPostureBlock();
function wideRule(selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('(?:^|[\\s}])' + escaped + '\\s*\\{([^}]*)\\}').exec(wide);
  if(!m) throw new Error('no ' + selector + ' rule in the open-posture block');
  return m[1];
}
function decl(block, prop){
  const m = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(block);
  if(!m) throw new Error('no ' + prop);
  return m[1].trim();
}
function px(expr, vars){
  let e = expr.replace(/var\((--[\w-]+)\)/g, (_, n)=>{ if(!(n in vars)) throw new Error('unresolved ' + n); return '(' + vars[n] + ')'; })
    .replace(/(\d+(?:\.\d+)?)vw/g, (_, n)=> String(vars.vw * n / 100))
    .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(').replace(/\bmax\(/g, 'Math.max(');
  if(/[a-z]/i.test(e.replace(/Math\.max/g, ''))) throw new Error('could not resolve ' + expr);
  return Function('return (' + e + ')')();
}

// ── Markup ────────────────────────────────────────────────────────────────

test('Today is a split view, with exactly one session pane as its split primary (sabotage anchor)', (assert)=>{
  const { document } = todayDom();
  assert.ok(document.getElementById('todayView').classList.contains('posture-split'));
  const panes = document.querySelectorAll('.today-session-pane');
  assert.equal(panes.length, 1);
  assert.ok(panes[0].classList.contains('split-primary'));
  assert.equal(panes[0].parentElement.id, 'todayView');
  assert.equal(document.querySelectorAll('#todayView > .split-primary').length, 1, 'one primary per split view');
});

test('the pane holds exactly the day picker header, the day tabs and the workout card — in that order', (assert)=>{
  const { document } = todayDom();
  const kids = [...document.querySelector('.today-session-pane').children];
  assert.deepEqual(kids.map(k=> k.id || k.className), ['tabs-header', 'tabs', 'workoutCard']);
});

test('single-column order is unchanged: style/discipline cards before the pane, Keep In Mind and profile slot after', (assert)=>{
  const { document } = todayDom();
  const order = [...document.getElementById('todayView').children].map(k=> k.id || (k.querySelector(':scope > .card-title') || {}).textContent || k.classList[0]);
  const pane = order.indexOf('today-session-pane');
  assert.ok(order.indexOf('medicalCard') === pane - 1, 'the medical card should sit directly before the session, as it did');
  assert.ok(/Keep In Mind/.test(order[pane + 1]), 'Keep In Mind should follow the session, as it did');
  assert.equal(order[order.length - 1], 'profileCardPermanentSlot');
});

test('right-hand column fits the explicit rows: fewer Today children than the 24 auto tracks', (assert)=>{
  const { document } = todayDom();
  const right = [...document.getElementById('todayView').children].filter(k=> !k.classList.contains('today-session-pane'));
  const rows = /grid-template-rows:\s*repeat\((\d+), auto\) 1fr/.exec(wideRule('.posture-split'));
  assert.ok(rows, 'needs repeat(N, auto) 1fr so a long session grows the last track, not gaps between cards');
  // +1: positionProfileCard inserts the profile card as one more direct child.
  assert.ok(right.length + 1 <= Number(rows[1]), `${right.length + 1} right-hand children but only ${rows[1]} auto rows`);
});

test('gym mode still hides every Today card except the session (its selector now relies on the workout card NOT being a direct child)', (assert)=>{
  const { document } = todayDom();
  const hidden = [...document.querySelectorAll('#todayView > .card:not(#workoutCard)')];
  assert.ok(!hidden.some(c=> c.id === 'workoutCard'));
  assert.ok(!hidden.some(c=> c.closest('.today-session-pane')), 'nothing inside the session pane may be hidden by it');
  assert.ok(hidden.some(c=> /Keep In Mind/.test(c.textContent)), 'the Keep In Mind card is still hidden in gym mode');
});

test('real positionProfileCard still lands the profile card in the right-hand flow (a direct child of #todayView, outside the pane)', (assert)=>{
  const { window, document } = runJsdom(extractElementById(src, 'todayView'), 'var userProfile = null;', [extractFunction(src, 'positionProfileCard')]);
  window.positionProfileCard();
  const card = document.getElementById('profileCard');
  assert.equal(card.parentElement.id, 'todayView');
  assert.equal(card.previousElementSibling.id, 'profileCardTopSlot');
  window.eval("userProfile = {name:'Sam'};");
  window.positionProfileCard();
  assert.equal(card.previousElementSibling.id, 'profileCardPermanentSlot');
});

// ── CSS ───────────────────────────────────────────────────────────────────

test('the gate matches the open Duo and nothing a phone does', (assert)=>{
  // Supports exactly the feature types the gate is allowed to use; anything
  // else (an orientation or max- query) fails loudly instead of being ignored.
  const features = GATE.split(/\s+and\s+/).map(f=> /^\((min-width|min-height):(\d+)px\)$/.exec(f));
  assert.ok(features.every(Boolean), `unexpected gate syntax: ${GATE}`);
  const matches = (w, h)=> features.every(([, feat, v])=> (feat === 'min-width' ? w : h) >= Number(v));
  assert.ok(matches(890, 626), 'unfolded Duo, natural hold');
  assert.ok(!matches(626, 890), 'unfolded Duo held rotated: one phone-width column is right');
  assert.ok(!matches(466, 678), 'folded Duo cover screen');
  assert.ok(!matches(402, 874), 'slab portrait');
  assert.ok(!matches(874, 402), 'slab landscape (Pro)');
  assert.ok(!matches(956, 440), 'slab landscape (Pro Max)');
});

test('two EQUAL columns (so the gutter sits on the crease) and the session pane spans every row', (assert)=>{
  assert.equal(decl(wideRule('.posture-split'), 'grid-template-columns'), 'minmax(0, 1fr) minmax(0, 1fr)');
  const pane = wideRule('.posture-split > .split-primary');
  assert.equal(decl(pane, 'grid-column'), '1');
  assert.equal(decl(pane, 'grid-row'), '1 / -1');
  assert.equal(decl(wideRule('.posture-split > *'), 'grid-column'), '2');
});

test('sticky day header spans the session pane, ending at the crease gutter (Duo) and at column 1\'s edge (wider)', (assert)=>{
  const root = wideRule(':root');
  const h = wideRule('.sticky-day-header');
  for(const vw of [890, 1180]){
    const vars = { vw, '--wrap-max': decl(root, '--wrap-max'), '--pane-gap': decl(root, '--pane-gap') };
    const left = px(decl(h, 'left'), vars), right = px(decl(h, 'right'), vars);
    const wrapMax = px('var(--wrap-max)', vars), gap = px('var(--pane-gap)', vars);
    const wrapLeft = Math.max(0, (vw - wrapMax) / 2), wrapW = Math.min(vw, wrapMax);
    const col1Right = wrapLeft + 18 + (wrapW - 36 - gap) / 2;
    assert.equal(left, wrapLeft, `left edge at ${vw}`);
    assert.equal(vw - right, col1Right, `right edge at ${vw}`);
  }
});

test('gym mode does not use Today\'s split (it splits its exercise list instead — test-duo-gym-mode-open-split.js)', (assert)=>{
  assert.equal(decl(wideRule('body.gym-mode #todayView'), 'display'), 'block');
});

test('every tab is either a split view or held to the phone column when open — a new tab cannot silently go 854pt wide', (assert)=>{
  const vm = require('vm');
  // The real tab -> view-id map, from switchView itself.
  const m = /const views = (\{[^}]*\});/.exec(extractFunction(src, 'switchView'));
  const viewIds = Object.values(vm.runInNewContext('(' + m[1] + ')'));
  assert.equal(viewIds.length, 7);
  const singleRule = /\n\s*((?:#\w+View,\s*)*#\w+View)\s*\{([^}]*)\}/.exec(wide);
  assert.ok(singleRule, 'expected a rule listing the non-split views');
  assert.equal(decl(singleRule[2], 'max-width'), 'calc(640px - 36px)', 'the phone column\'s content width');
  const held = singleRule[1].split(/,\s*/).map(x=> x.slice(1));
  const { document } = runJsdom(viewIds.map(id=> extractElementById(src, id)).join(''), '', []);
  for(const id of viewIds){
    const split = document.getElementById(id).classList.contains('posture-split');
    assert.ok(split !== held.includes(id), `${id} must be exactly one of: split view, or in the phone-column list`);
  }
});

run();
