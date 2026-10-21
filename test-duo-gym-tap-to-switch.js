'use strict';
// iPhone Duo support, part 7: tapping another exercise in gym mode on an
// unfolded Duo switches the right pane to it.
//
// The pane (test-duo-gym-mode-open-split.js) shows one exercise. A header tap
// used to toggle only the tapped exercise, so on the open Duo it expanded the
// tapped one inside the list while the pane kept the old one. Now, only when
// gym mode is on AND the open-posture layout is on screen, opening one closes
// the others. Everywhere else (cover screen, slab phones, normal Today) a tap
// still toggles just that exercise.
//
// JS learns which layout is on screen from OPEN_POSTURE_QUERY via
// matchMedia, read live on every tap. That string has to be the SAME
// condition the stylesheet uses, or JS and CSS would disagree about which
// layout is showing; the first test pins them together.
//
// Real toggleExerciseBlockFromHeader / setExerciseBlockOpen / isOpenPosture
// run in jsdom with matchMedia stubbed. Real-browser result (Chromium):
// open gym tap -> only the tapped exercise open, in the pane at x=457
// (before: both open, the tapped one in the list); cover-screen gym and
// open-posture normal Today identical to before.
const { readIndexSource, extractFunction, extractConst, extractElementById, countCallSites, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-duo-gym-tap-to-switch.js');

function setup({ gym, open }){
  const globalsSetup = `
    var gymModeActive = ${!!gym};
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

test('gym mode, open: tapping another exercise moves it into the pane (only it is open)', (assert)=>{
  const { window, document } = setup({ gym:true, open:true });
  tap(window, document, 'b0');
  tap(window, document, 'b2');
  assert.deepEqual(openIds(document), ['b2']);
  assert.equal(document.querySelector('#b0 .exercise').getAttribute('aria-expanded'), 'false', 'the closed one is closed properly, not just restyled');
  assert.ok(!document.querySelector('#b0 .expand-wrap').classList.contains('open'));
});

test('gym mode, open: tapping the exercise in the pane just closes it', (assert)=>{
  const { window, document } = setup({ gym:true, open:true });
  tap(window, document, 'b1');
  tap(window, document, 'b1');
  assert.deepEqual(openIds(document), []);
});

test('gym mode, open: also clears an extra open one left over from the cover screen', (assert)=>{
  const { window, document } = setup({ gym:true, open:false });
  tap(window, document, 'b0'); tap(window, document, 'b1'); // two open on the cover screen
  window.__open = true; // unfold
  tap(window, document, 'b3');
  assert.deepEqual(openIds(document), ['b3']);
});

test('gym mode on the cover screen / a slab phone: unchanged, a tap toggles only that exercise', (assert)=>{
  const { window, document } = setup({ gym:true, open:false });
  tap(window, document, 'b0');
  tap(window, document, 'b2');
  assert.deepEqual(openIds(document), ['b0', 'b2']);
});

test('normal Today, even open: unchanged, a tap toggles only that exercise', (assert)=>{
  const { window, document } = setup({ gym:false, open:true });
  tap(window, document, 'b0');
  tap(window, document, 'b2');
  assert.deepEqual(openIds(document), ['b0', 'b2']);
});

test('posture is read live on every tap — folding mid-session changes behaviour with nothing cached', (assert)=>{
  const { window, document } = setup({ gym:true, open:true });
  tap(window, document, 'b0');
  window.__open = false;                      // fold
  tap(window, document, 'b1');
  assert.deepEqual(openIds(document), ['b0', 'b1']);
  window.__open = true;                       // unfold
  tap(window, document, 'b2');
  assert.deepEqual(openIds(document), ['b2']);
  assert.ok(window.__queries.every(q=> q === window.eval('OPEN_POSTURE_QUERY')));
});

test('no matchMedia at all (very old engine): falls back to the phone behaviour, never throws', (assert)=>{
  const { window, document } = setup({ gym:true, open:true });
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
