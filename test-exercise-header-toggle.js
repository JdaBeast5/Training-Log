'use strict';
// v3.653 (UX-17b): the non-gym cases of test-duo-gym-tap-to-switch.js, kept
// when that suite retired with Gym mode. A header tap on Today toggles only the
// tapped exercise, on every layout (the open-posture "move it into the pane"
// switch was gym-only and went with it); OPEN_POSTURE_QUERY still matches the
// stylesheet's open-posture @media condition; no matchMedia never throws; and
// renderWorkout's header listener goes through toggleExerciseBlockFromHeader.
//
// Real toggleExerciseBlockFromHeader / setExerciseBlockOpen / isOpenPosture
// run in jsdom with matchMedia stubbed.
const { readIndexSource, extractFunction, extractConst, extractElementById, countCallSites, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-exercise-header-toggle.js');

function setup({ open }){
  const globalsSetup = `
    window.__open = ${!!open};
    window.__queries = [];
    window.matchMedia = function(q){ window.__queries.push(q); return { matches: window.__open }; };
  `;
  const { window, document } = runJsdom(extractElementById(src, 'workoutCard'), globalsSetup, [
    extractConst(src, 'OPEN_POSTURE_QUERY'),
    extractFunction(src, 'isOpenPosture'),
    extractFunction(src, 'setExerciseBlockOpen'),
    extractFunction(src, 'toggleExerciseBlockFromHeader'),
  ]);
  document.getElementById('exerciseList').innerHTML = [0, 1, 2, 3].map(i=>
    `<div class="exercise-block" id="b${i}"><div class="exercise" aria-expanded="false"></div><div class="expand-wrap"></div></div>`).join('');
  return { window, document };
}
const openIds = document=> [...document.querySelectorAll('#exerciseList > .exercise-block.open')].map(b=> b.id);
const tap = (window, document, id)=> window.toggleExerciseBlockFromHeader(document.getElementById(id));

test('OPEN_POSTURE_QUERY is exactly the stylesheet\'s open-posture @media condition', (assert)=>{
  const m = /@media ([^{]+)\{(?:(?!@media)[\s\S])*?\.split-primary\{/.exec(src);
  assert.ok(m, 'could not find the open-posture @media block');
  const { window } = setup({});
  assert.equal(window.eval('OPEN_POSTURE_QUERY'), m[1].trim());
});

test('Today, folded or unfolded: a tap toggles only that exercise', (assert)=>{
  for(const open of [false, true]){
  const { window, document } = setup({ open });
  tap(window, document, 'b0');
  tap(window, document, 'b2');
  assert.deepEqual(openIds(document), ['b0', 'b2'], open ? 'unfolded' : 'folded');
  tap(window, document, 'b0');
  assert.deepEqual(openIds(document), ['b2'], 'a second tap closes it');
  }
});

test('no matchMedia at all (very old engine): falls back to the phone behaviour, never throws', (assert)=>{
  const { window, document } = setup({ open:true });
  window.matchMedia = undefined;
  assert.equal(window.isOpenPosture(), false);
  tap(window, document, 'b0'); tap(window, document, 'b1');
  assert.deepEqual(openIds(document), ['b0', 'b1']);
});

test('renderWorkout\'s header listener goes through toggleExerciseBlockFromHeader exactly once (sabotage anchor)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').replace(/\/\/[^\n]*/g, '');
  assert.equal(countCallSites(body, 'toggleExerciseBlockFromHeader'), 1);
  assert.ok(!/setExerciseBlockOpen\(blockEl, !blockEl\.classList\.contains\('open'\)\)/.test(body), 'the old direct toggle must be gone, or taps would bypass the switch');
});

run();
