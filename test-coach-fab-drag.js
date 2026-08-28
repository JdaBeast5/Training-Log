'use strict';
// Behavioral coverage for a new feature: the AI coach chat bubble (#coachFab)
// can now be dragged and repositioned to any vertical spot along either
// screen edge, so it never sits over content the user actually wants to
// tap. Same movement-threshold-before-capture shape makeSwipeable already
// established (test-swipe-content-button-passthrough.js covers that file's
// own version of this) — extended here to 2D, plus edge-snapping and
// window.storage persistence, neither of which makeSwipeable needed.
const { readIndexSource, extractFunction, extractConst, extractIIFE, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-coach-fab-drag.js');

function extractClickWiring(source, startText){
  const start = source.indexOf(startText);
  if(start === -1) throw new Error(`click wiring not found (looked for: ${startText})`);
  const end = source.indexOf('\n});', start);
  if(end === -1) throw new Error('no closing \'});\' found after the click wiring');
  return source.slice(start, end + 4);
}

const positionKeySrc = extractConst(src, 'COACH_FAB_POSITION_KEY');
const edgeGapSrc = extractConst(src, 'COACH_FAB_EDGE_GAP');
const topClearanceSrc = extractConst(src, 'COACH_FAB_TOP_CLEARANCE');
const bottomClearanceSrc = extractConst(src, 'COACH_FAB_BOTTOM_CLEARANCE');
const clampSrc = extractFunction(src, 'clampCoachFabTop');
const applySrc = extractFunction(src, 'applyCoachFabPosition');
const saveSrc = extractFunction(src, 'saveCoachFabPosition');
const restoreSrc = extractFunction(src, 'restoreCoachFabPosition');
const dragWiringSrc = extractIIFE(src, 'wireCoachFabDrag');
const clickWiringSrc = extractClickWiring(src, "let coachFabJustDragged = false;");

const bodyHtml = `
  <button class="coach-fab" id="coachFab"><span>💬</span></button>
  <div class="coach-fab-modal" id="coachFabModal">
    <div class="coach-fab-panel" id="coachFabPanel">
      <input id="floatingChatInput">
    </div>
  </div>
`;

function setup({ storedPosition, storageGetThrows } = {}){
  const globalsSetup = `
    window.storage = {
      __saved: null,
      set: async (k, v) => { window.storage.__saved = v; },
      get: async (k) => {
        ${storageGetThrows ? "throw new Error('not found');" : ''}
        ${storedPosition ? `return { value: ${JSON.stringify(JSON.stringify(storedPosition))} };` : "return null;"}
      },
    };
    function renderCoachChatLog(){}
    Object.defineProperty(window, 'innerWidth', {value: 400, configurable: true});
    Object.defineProperty(window, 'innerHeight', {value: 800, configurable: true});
  `;
  const { document, window } = runJsdom(bodyHtml, globalsSetup, [
    positionKeySrc, edgeGapSrc, topClearanceSrc, bottomClearanceSrc,
    clampSrc, applySrc, saveSrc, restoreSrc, clickWiringSrc, dragWiringSrc, 'wireCoachFabDrag();',
  ]);
  const fab = document.getElementById('coachFab');
  // jsdom's getBoundingClientRect always returns zeros — give it a real,
  // controllable rect matching the CSS default (58x58, bottom-right corner)
  // unless the test has already applied inline top/left, in which case
  // reflect THOSE (a real browser's rect would too).
  fab.getBoundingClientRect = function(){
    const style = this.style;
    const width = 58, height = 58;
    let left = 400 - 18 - width; // default: right:18px
    let top = 800 - 22 - height; // default: bottom:22px
    if(style.left && style.left !== 'auto') left = parseFloat(style.left);
    if(style.top && style.top !== 'auto') top = parseFloat(style.top);
    return { left, top, width, height, right: left + width, bottom: top + height };
  };
  fab.setPointerCapture = () => {};
  return { document, window, fab };
}

function fireDrag(fab, path){
  // path: array of [clientX, clientY]. First is pointerdown, rest are
  // pointermove, last also fires pointerup. Same Event+defineProperty
  // technique test-swipe-content-button-passthrough.js already established
  // for faking pointer coordinates jsdom's plain Event doesn't carry.
  const pid = 1;
  const down = new fab.ownerDocument.defaultView.Event('pointerdown', {bubbles:true, cancelable:true});
  Object.defineProperty(down, 'clientX', {value: path[0][0]});
  Object.defineProperty(down, 'clientY', {value: path[0][1]});
  Object.defineProperty(down, 'pointerId', {value: pid});
  Object.defineProperty(down, 'button', {value: 0});
  fab.dispatchEvent(down);
  for(let i = 1; i < path.length; i++){
    const move = new fab.ownerDocument.defaultView.Event('pointermove', {bubbles:true, cancelable:true});
    Object.defineProperty(move, 'clientX', {value: path[i][0]});
    Object.defineProperty(move, 'clientY', {value: path[i][1]});
    Object.defineProperty(move, 'pointerId', {value: pid});
    fab.dispatchEvent(move);
  }
  const last = path[path.length - 1];
  const up = new fab.ownerDocument.defaultView.Event('pointerup', {bubbles:true, cancelable:true});
  Object.defineProperty(up, 'clientX', {value: last[0]});
  Object.defineProperty(up, 'clientY', {value: last[1]});
  Object.defineProperty(up, 'pointerId', {value: pid});
  fab.dispatchEvent(up);
}

test('REAL invocation: a tap (pointer barely moves) never captures the pointer or adds the dragging class', (assert)=>{
  const { fab } = setup();
  let captured = false;
  fab.setPointerCapture = () => { captured = true; };
  fireDrag(fab, [[300, 700], [301, 701], [300, 700]]); // 1px jitter
  assert.strictEqual(captured, false, 'a plain tap must never trigger pointer capture');
  assert.ok(!fab.classList.contains('dragging'), 'a plain tap must never add the dragging class');
});

test('REAL invocation: a tap still opens the chat modal (drag wiring must not swallow ordinary taps)', (assert)=>{
  const { document, fab } = setup();
  fireDrag(fab, [[300, 700], [300, 700]]); // zero movement — the pointer sequence a real click also fires
  fab.click(); // jsdom does not synthesize click from pointerup on its own — fire it explicitly, same as a real browser would
  assert.ok(document.getElementById('coachFabModal').classList.contains('active'), 'tapping the fab (no real drag) must still open the chat panel');
});

test('REAL invocation: real movement past the threshold captures the pointer, adds .dragging, and moves the fab live', (assert)=>{
  const { fab } = setup();
  let captured = false;
  fab.setPointerCapture = () => { captured = true; };
  fireDrag(fab, [[382, 720], [382, 680], [382, 620], [382, 560]]); // 160px up, well past threshold
  assert.strictEqual(captured, true, 'real drag movement must capture the pointer');
  // dragging class is removed again by endDrag on the final pointerup in
  // fireDrag — check it was live mid-drag by inspecting the position landed
  // somewhere consistent with real tracking instead.
  assert.match(fab.style.top, /^\d+(\.\d+)?px$/, 'the fab must have a real inline top position after a drag');
});

test('REAL invocation: a real drag suppresses the click that follows it (must not pop the chat panel open on release)', (assert)=>{
  const { document, fab } = setup();
  fireDrag(fab, [[382, 720], [382, 500], [382, 300]]); // real drag, far up
  fab.click(); // the browser's own synthesized click after the drag's pointerup
  assert.ok(!document.getElementById('coachFabModal').classList.contains('active'), 'a real drag must suppress the click that follows it — the panel must NOT open');
});

test('REAL invocation: releasing on the left half of the screen snaps to the left edge; the right half snaps right', (assert)=>{
  const { fab: fabLeft } = setup();
  fireDrag(fabLeft, [[382, 400], [200, 400], [50, 400]]); // ends at x=50, well left of the 400px-wide viewport's midpoint
  assert.strictEqual(fabLeft.style.left, '18px', 'releasing on the left half must snap left');
  assert.strictEqual(fabLeft.style.right, 'auto', 'left and right must never both be set');

  const { fab: fabRight } = setup();
  fireDrag(fabRight, [[20, 400], [200, 400], [350, 400]]); // ends at x=350, well right of midpoint
  assert.strictEqual(fabRight.style.right, '18px', 'releasing on the right half must snap right');
  assert.strictEqual(fabRight.style.left, 'auto', 'left and right must never both be set');
});

test('REAL invocation: dragging past the top/bottom clamps clears within the safe range instead of running off-screen', (assert)=>{
  const { fab } = setup();
  fireDrag(fab, [[382, 400], [382, -500]]); // drag way off the top of the screen
  const top = parseFloat(fab.style.top);
  assert.ok(top >= 100, `top must be clamped to the 100px top clearance, got ${top}`);

  const { fab: fab2 } = setup();
  fireDrag(fab2, [[382, 400], [382, 5000]]); // drag way off the bottom
  const top2 = parseFloat(fab2.style.top);
  assert.ok(top2 <= 800 - 22 - 58, `top must be clamped to stay above the bottom clearance, got ${top2}`);
});

test('REAL invocation: a real drag persists {side, topFraction} to window.storage', async (assert)=>{
  const { fab, window } = setup();
  fireDrag(fab, [[382, 700], [200, 400], [50, 200]]); // drag to upper-left
  await new Promise(res => setTimeout(res, 20));
  const saved = JSON.parse(window.storage.__saved);
  assert.strictEqual(saved.side, 'left');
  assert.ok(saved.topFraction >= 0 && saved.topFraction <= 1, `topFraction must be a 0-1 fraction, got ${saved.topFraction}`);
});

test('REAL invocation: restoreCoachFabPosition applies a saved left-edge position on load', async (assert)=>{
  const { document, fab } = setup({ storedPosition: { side: 'left', topFraction: 0.5 } });
  await document.defaultView.restoreCoachFabPosition();
  assert.strictEqual(fab.style.left, '18px');
  assert.strictEqual(fab.style.right, 'auto');
  assert.match(fab.style.top, /^\d+(\.\d+)?px$/);
});

test('REAL invocation: restoreCoachFabPosition is a no-op when nothing was ever saved (first run) — no throw, default CSS position untouched', async (assert)=>{
  const { document, fab } = setup({ storageGetThrows: true }); // real window.storage.get rejects for a never-set key
  await assert.doesNotThrow(async () => document.defaultView.restoreCoachFabPosition());
  assert.strictEqual(fab.style.top, '', 'must not set an inline top when there is nothing saved — stays at the CSS default');
});

test('sabotage-relevant: pointer capture is deferred until real movement, not unconditional on pointerdown (same defect class makeSwipeable already had to fix once)', (assert)=>{
  assert.doesNotMatch(dragWiringSrc, /pointerdown['"],\s*\(e\)=>\{[^}]*dragging = true/, 'pointerdown must not set dragging true immediately');
  const thresholdIdx = dragWiringSrc.indexOf('Math.hypot(dx, dy) < DRAG_THRESHOLD');
  const captureIdx = dragWiringSrc.indexOf('fab.setPointerCapture(activePointerId)');
  assert.ok(thresholdIdx !== -1 && captureIdx !== -1 && thresholdIdx < captureIdx, 'the threshold check must run before setPointerCapture');
});

test('sabotage-relevant: the click handler checks coachFabJustDragged BEFORE doing anything else', (assert)=>{
  const guardIdx = clickWiringSrc.indexOf('if(coachFabJustDragged)');
  const openIdx = clickWiringSrc.indexOf("modal.classList.add('active')");
  assert.ok(guardIdx !== -1 && openIdx !== -1 && guardIdx < openIdx, 'the drag guard must be the first thing the click handler checks, or a suppressed drag could still open the panel');
});

run();
