'use strict';
// Behavioral coverage for Phase H1.3: switchView's outgoing-view exit fade.
// Previously the outgoing view's display:none was applied synchronously in
// the same tick the incoming view started its enter animation — a hard cut
// underneath a soft entrance. Now the outgoing view gets a .view-exit class
// (a 150ms fade-out) and only receives display:none after that timeout,
// guarded so a rapid second switch can't let a stale timeout hide a view
// that's since become active again.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const switchViewSrc = extractFunction(src, 'switchView');
const staggerMaxSrc = extractConst(src, 'STAGGER_MAX_STEPS');
const staggerStepSrc = extractConst(src, 'STAGGER_STEP_MS');
// Tab-layout audit (v3.160): switchView reads this to decide when the
// "More" pill (navCare/navCoach/navLearn's new home) should show as
// active — a real dependency, not incidental, so it's extracted alongside
// switchView itself rather than stubbed.
const movedToMoreSrc = extractConst(src, 'MOVED_TO_MORE');

const bodyHtml = `
  <div id="todayView"></div>
  <div id="logView"></div>
  <div id="analysisView"></div>
  <div id="historyView"></div>
  <div id="careView"></div>
  <div id="coachView"></div>
  <div id="learnView"></div>
  <button id="navToday"></button>
  <button id="navLog"></button>
  <button id="navAnalysis"></button>
  <button id="navHistory"></button>
  <button id="navCare"></button>
  <button id="navCoach"></button>
  <button id="navLearn"></button>
  <button id="navMore"></button>
  <div id="stickyDayHeader" class="visible"></div>
  <div id="logDateBar"></div>
`;

function globals(){
  return `
    window.storage = { set: async ()=>{} };
    window.renderLogDateBar = ()=>{};
    window.matchMedia = window.matchMedia || (()=> ({matches:false}));
  `;
}

const { test, run } = makeRunner('test-view-switch-crossfade.js');

test('switching views: the OUTGOING view gets .view-exit, not an immediate display:none', (assert)=>{
  const { document, window: win } = runJsdom(bodyHtml, globals(), [staggerMaxSrc, staggerStepSrc, movedToMoreSrc, switchViewSrc, `
    document.getElementById('todayView').style.display = '';
    switchView('log');
  `]);
  const today = document.getElementById('todayView');
  assert.strictEqual(today.style.display, '', 'the outgoing view must NOT be hidden synchronously');
  assert.ok(today.classList.contains('view-exit'), 'the outgoing view must be marked for exit-fade');
  const log = document.getElementById('logView');
  assert.strictEqual(log.style.display, '', 'the incoming view must be shown');
  assert.ok(log.classList.contains('view-enter'), 'the incoming view must get its enter animation');
});

test('REAL invocation: after the fade timeout, the outgoing view actually gets display:none', async (assert)=>{
  const { document } = runJsdom(bodyHtml, globals(), [staggerMaxSrc, staggerStepSrc, movedToMoreSrc, switchViewSrc, `
    document.getElementById('todayView').style.display = '';
    switchView('log');
  `]);
  await new Promise(res=> setTimeout(res, 220));
  const today = document.getElementById('todayView');
  assert.strictEqual(today.style.display, 'none', 'the outgoing view must be hidden once the fade timeout has actually elapsed');
});

test('sabotage-relevant: a view already hidden (display:none) does not get the exit-fade treatment', (assert)=>{
  const { document } = runJsdom(bodyHtml, globals(), [staggerMaxSrc, staggerStepSrc, movedToMoreSrc, switchViewSrc, `
    document.getElementById('todayView').style.display = 'none';
    document.getElementById('careView').style.display = 'none';
    switchView('log');
  `]);
  const care = document.getElementById('careView');
  assert.strictEqual(care.style.display, 'none', 'an already-hidden view stays hidden');
  assert.ok(!care.classList.contains('view-exit'), 'an already-hidden view must not be animated — nothing was visible to fade');
});

test('rapid re-switch guard: switching BACK to a view mid-fade cancels the stale hide instead of yanking it away again', async (assert)=>{
  const { document } = runJsdom(bodyHtml, globals(), [staggerMaxSrc, staggerStepSrc, movedToMoreSrc, switchViewSrc, `
    document.getElementById('todayView').style.display = '';
    switchView('log');   // todayView starts fading out (view-exit, 150ms timer running)
    switchView('today'); // switch back to today BEFORE that timer fires
  `]);
  const today = document.getElementById('todayView');
  assert.ok(!today.classList.contains('view-exit'), 'switching back to this view must clear the pending exit state');
  assert.strictEqual(today.style.display, '', 'the view must be visible again immediately');
  await new Promise(res=> setTimeout(res, 220));
  assert.strictEqual(today.style.display, '', 'the STALE timeout from the first switch must NOT hide this view after it was reclaimed as active');
});

test('reduced motion: the outgoing view is hidden immediately, no exit-fade class, matching the pre-existing enter-animation skip', (assert)=>{
  const { document } = runJsdom(bodyHtml, globals(), [staggerMaxSrc, staggerStepSrc, movedToMoreSrc, switchViewSrc, `
    window.matchMedia = ()=> ({matches:true});
    document.getElementById('todayView').style.display = '';
    switchView('log');
  `]);
  const today = document.getElementById('todayView');
  assert.strictEqual(today.style.display, 'none', 'reduced motion must hide the outgoing view synchronously, same as before this change');
  assert.ok(!today.classList.contains('view-exit'), 'reduced motion must not add the fade class at all');
});

run();
