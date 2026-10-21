'use strict';
// iPhone Duo support, part 5: keep your place across a fold or unfold.
//
// Folding/unfolding reaches the page as a resize, and between the cover
// screen and the open two-pane layout nearly everything moves, so the same
// scrollY lands somewhere else. wirePostureContinuity remembers the innermost
// card or exercise row on the line under the nav and, on a width change big
// enough to be a posture change, scrolls so it sits where it was.
//
// Real findPostureAnchor and the real wirePostureContinuity IIFE run in
// jsdom against a fake layout: getBoundingClientRect is answered from a table
// of document positions for the current "posture", offset by a fake scrollY
// that window.scrollBy moves. requestAnimationFrame is queued and flushed by
// hand so each test controls exactly when the restore runs. Real-browser
// result (Chromium, 466x678 -> 890x626 -> 466x678): the exercise row stayed
// at 200px both ways and scrollY returned to the exact original — see
// HANDOFF-v51; without this change it landed at -31 and then 950.
const { readIndexSource, extractFunction, extractConst, extractIIFE, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-duo-posture-continuity.js');

const bodyHtml = `
  <div class="nav-pills" id="nav"></div>
  <div id="todayView">
    <div class="card" id="cardA"></div>
    <div class="today-session-pane">
      <div class="card" id="workoutCard">
        <div class="exercise-block" id="ex1"></div>
        <div class="exercise-block" id="ex2"></div>
        <div class="exercise-block" id="ex3"></div>
      </div>
    </div>
    <div class="card" id="cardB"></div>
    <div class="card" id="hiddenCard"></div>
  </div>
  <div id="logView" style="display:none"><div class="card" id="logCard"></div></div>
`;

// Document-space boxes per posture: [left, top, width, height].
const LAYOUTS = {
  folded: { nav:[0,0,466,60], cardA:[18,0,430,300], workoutCard:[18,318,430,1500],
            ex1:[40,400,386,80], ex2:[40,500,386,80], ex3:[40,600,386,80],
            cardB:[18,1836,430,200], hiddenCard:[0,0,0,0], logCard:[18,0,430,100] },
  open:   { nav:[0,0,890,60], workoutCard:[18,0,415,1500], cardA:[457,0,415,300],
            ex1:[40,82,371,80], ex2:[40,182,371,80], ex3:[40,282,371,80],
            cardB:[457,318,415,200], hiddenCard:[0,0,0,0], logCard:[18,0,415,100] },
};

function setup({ width = 466, posture = 'folded', scrollY = 0 } = {}){
  const globalsSetup = `
    window.__layouts = ${JSON.stringify(LAYOUTS)};
    window.__posture = ${JSON.stringify(posture)};
    window.__scrollY = ${scrollY};
    window.__scrolls = [];
    Object.defineProperty(window, 'innerWidth', {value:${width}, configurable:true, writable:true});
    Element.prototype.getBoundingClientRect = function(){
      const box = window.__layouts[window.__posture][this.id];
      if(!box) return {left:0, top:0, right:0, bottom:0, width:0, height:0};
      // The nav is sticky: it does not scroll.
      const y = this.id === 'nav' ? box[1] : box[1] - window.__scrollY;
      return {left:box[0], top:y, right:box[0] + box[2], bottom:y + box[3], width:box[2], height:box[3]};
    };
    window.scrollBy = function(opts){
      const dy = typeof opts === 'object' ? opts.top : arguments[1];
      window.__scrolls.push(dy);
      window.__scrollY += dy;
    };
    window.__frames = [];
    window.requestAnimationFrame = function(cb){ window.__frames.push(cb); return window.__frames.length; };
    window.cancelAnimationFrame = function(id){ window.__frames[id - 1] = null; };
    window.__flushFrames = function(){ const f = window.__frames; window.__frames = []; f.forEach(cb=> cb && cb()); };
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    extractConst(src, 'VIEW_KEYS'),
    extractConst(src, 'POSTURE_ANCHOR_SELECTOR'),
    extractConst(src, 'POSTURE_WIDTH_DELTA'),
    extractFunction(src, 'findPostureAnchor'),
    extractIIFE(src, 'wirePostureContinuity'),
    'wirePostureContinuity();',
  ]);
  return { window, document };
}
const settle = ms=> new Promise(r=> setTimeout(r, ms));
function fold(window, width, posture){
  window.innerWidth = width;
  window.__posture = posture;
  window.dispatchEvent(new window.Event('resize'));
}
const topOf = (document, id)=> document.getElementById(id).getBoundingClientRect().top;

// ── findPostureAnchor ─────────────────────────────────────────────────────

test('anchors on the innermost element on the line: the exercise row, not the workout card around it', (assert)=>{
  const { window, document } = setup({ scrollY: 540 });
  const a = window.findPostureAnchor(document.getElementById('todayView'), 68);
  assert.equal(a.el.id, 'ex3');
  assert.equal(a.top, 60);
});

test('when both panes cross the line, the left (primary) one wins', (assert)=>{
  const { window, document } = setup({ width: 890, posture: 'open', scrollY: 0 });
  // y=120 crosses the workout card (left, via ex1 inside it) and cardA (right).
  const a = window.findPostureAnchor(document.getElementById('todayView'), 120);
  assert.equal(a.el.id, 'ex1');
});

test('a line in a gap anchors on the next element down; zero-height (hidden) ones never count', (assert)=>{
  const { window, document } = setup({ scrollY: 0 });
  // y=305 sits in the 300..318 gap between cardA and the workout card.
  const a = window.findPostureAnchor(document.getElementById('todayView'), 305);
  assert.equal(a.el.id, 'workoutCard');
  assert.ok(window.findPostureAnchor(document.getElementById('todayView'), 5000) === null);
});

// ── wirePostureContinuity ─────────────────────────────────────────────────

test('unfolding keeps the exercise you were on at the same spot on screen', async (assert)=>{
  const { window, document } = setup({ scrollY: 540 });
  assert.equal(topOf(document, 'ex3'), 60);
  fold(window, 890, 'open');
  assert.equal(window.__scrolls.length, 0, 'restore waits for the next frame, after layout');
  window.__flushFrames();
  assert.equal(topOf(document, 'ex3'), 60);
});

test('fold -> unfold -> fold returns to the exact starting scroll position', async (assert)=>{
  const { window, document } = setup({ scrollY: 540 });
  fold(window, 890, 'open'); window.__flushFrames();
  fold(window, 466, 'folded'); window.__flushFrames();
  assert.equal(window.__scrollY, 540);
  assert.equal(topOf(document, 'ex3'), 60);
});

test('a keyboard-sized resize (width barely moves) does nothing', async (assert)=>{
  const { window } = setup({ scrollY: 540 });
  fold(window, 466 + 60, 'folded'); window.__flushFrames();
  assert.deepEqual(window.__scrolls, []);
});

test('a reflow scroll event that beats the resize event cannot overwrite the pre-fold anchor', async (assert)=>{
  const { window, document } = setup({ scrollY: 540 });
  window.innerWidth = 890; window.__posture = 'open';
  window.dispatchEvent(new window.Event('scroll'));
  await settle(160); // the debounced capture fires here, before any resize
  window.dispatchEvent(new window.Event('resize'));
  window.__flushFrames();
  assert.equal(topOf(document, 'ex3'), 60);
});

test('anchor follows the person: after scrolling, the NEW position is what gets kept', async (assert)=>{
  const { window, document } = setup({ scrollY: 540 });
  window.__scrollY = 1800; // cardB (1836) now the first thing under the line
  window.dispatchEvent(new window.Event('scroll'));
  await settle(160);
  fold(window, 890, 'open'); window.__flushFrames();
  assert.equal(topOf(document, 'cardB'), 36);
});

test('with a sheet open (body.scroll-locked) the page is left alone', async (assert)=>{
  const { window, document } = setup({ scrollY: 540 });
  document.body.classList.add('scroll-locked');
  fold(window, 890, 'open'); window.__flushFrames();
  assert.deepEqual(window.__scrolls, []);
});

test('only the visible tab is considered (hidden Log content is never the anchor)', (assert)=>{
  const { window, document } = setup({ scrollY: 0 });
  document.getElementById('todayView').style.display = 'none';
  document.getElementById('logView').style.display = '';
  window.__scrollY = 0;
  window.dispatchEvent(new window.Event('scroll'));
  return settle(160).then(()=>{
    fold(window, 890, 'open'); window.__flushFrames();
    // logCard is at the same place in both postures, so nothing needs to move.
    assert.deepEqual(window.__scrolls, [0]);
  });
});

run();
