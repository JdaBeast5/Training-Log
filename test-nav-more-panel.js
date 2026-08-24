'use strict';
// Behavioral coverage for tab-layout audit option #2: Care/Coach/Learn moved
// out of the main horizontally-scrolling tab rail and into a "More" sheet,
// so the main rail fits five items (Search, Today, Log, Analysis, History,
// More) instead of eight — the audit's own live measurement found three of
// seven text tabs (43%) sat off-screen behind a scroll/chevron.
//
// The three relocated buttons are the SAME real navCare/navCoach/navLearn
// elements switchView/showView already look up by id — the VIEW_KEYS wiring
// loop finds them via document.getElementById wherever they physically sit,
// so moving them into navMoreOverlay required no change to routing itself.
// What this file actually proves, since none of it is free:
//   1. The main rail no longer contains navCare/navCoach/navLearn, and DOES
//      contain the new navMore trigger.
//   2. navMoreOverlay contains the three real relocated buttons.
//   3. navMoreOverlay is wired into the existing SCROLL_LOCK_OVERLAYS /
//      OVERLAY_CLOSERS registries (source-level — the registries' own
//      scroll-lock/focus-trap/Escape machinery is pre-existing and generic,
//      not re-tested per-overlay here).
//   4. REAL invocation: clicking navMore opens the sheet; the close button
//      and a backdrop click both close it.
//   5. REAL invocation: clicking a relocated tab (navCare) inside the sheet
//      both closes the sheet AND switches to that view — the actual
//      end-to-end path a person takes, not just the open/close halves in
//      isolation.
//   6. REAL invocation: switchView keeps navMore's own .active state in
//      sync — landing on Care/Coach/Learn should still show SOMETHING as
//      selected in the visible rail, not leave every pill looking
//      unselected.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-nav-more-panel.js');

// VIEW_KEYS.forEach(...) is a top-level statement, not a named function —
// not reachable by extractFunction/extractConst. Extracted the same way
// this repo's other tests handle small unnamed top-level wiring: matched by
// its own unique opening text through to its closing '});' line.
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const scrollLockOverlaysSrc = extractConst(src, 'SCROLL_LOCK_OVERLAYS');
const overlayClosersSrc = extractConst(src, 'OVERLAY_CLOSERS');

test('sabotage-relevant: SCROLL_LOCK_OVERLAYS includes navMoreOverlay', (assert)=>{
  assert.match(scrollLockOverlaysSrc, /'navMoreOverlay'/, 'navMoreOverlay must be registered for scroll-lock/focus-trap/Escape, the same as every other real dialog');
});

test('sabotage-relevant: OVERLAY_CLOSERS maps navMoreOverlay to closeNavMoreOverlay', (assert)=>{
  assert.match(overlayClosersSrc, /navMoreOverlay:\s*\(\)=>\s*closeNavMoreOverlay\(\)/, 'Escape-to-close depends on this exact mapping existing');
});

test('sabotage-relevant: the main rail (#navPillsScroll) no longer contains navCare/navCoach/navLearn, and does contain the new navMore trigger', (assert)=>{
  const railHtml = extractElementById(src, 'navPillsScroll');
  assert.doesNotMatch(railHtml, /id="navCare"/, 'Care must be out of the main rail');
  assert.doesNotMatch(railHtml, /id="navCoach"/, 'Coach must be out of the main rail');
  assert.doesNotMatch(railHtml, /id="navLearn"/, 'Learn must be out of the main rail');
  assert.match(railHtml, /id="navMore"/, 'the More trigger must be in the main rail');
});

test('sabotage-relevant: navMoreOverlay contains the three REAL relocated buttons (same ids switchView looks up, not stand-ins)', (assert)=>{
  const overlayHtml = extractElementById(src, 'navMoreOverlay');
  assert.match(overlayHtml, /id="navCare"/);
  assert.match(overlayHtml, /id="navCoach"/);
  assert.match(overlayHtml, /id="navLearn"/);
});

// --- REAL invocation: the full open/close/navigate flow ------------------

const navPillsHtml = extractElementById(src, 'navPillsScroll');
const navMoreOverlayHtml = extractElementById(src, 'navMoreOverlay');
const viewsHtml = `
  <div id="todayView"></div><div id="logView"></div><div id="analysisView"></div>
  <div id="historyView"></div><div id="careView"></div><div id="coachView"></div>
  <div id="learnView"></div>
  <div id="stickyDayHeader" class="visible"></div>
  <div id="logDateBar"></div>
  <div class="gym-offer" id="gymOffer"></div>
`;

const viewKeysSrc = extractConst(src, 'VIEW_KEYS');
const movedToMoreSrc = extractConst(src, 'MOVED_TO_MORE');
const staggerMaxSrc = extractConst(src, 'STAGGER_MAX_STEPS');
const staggerStepSrc = extractConst(src, 'STAGGER_STEP_MS');
const switchViewSrc = extractFunction(src, 'switchView');
const hideGymOfferSrc = extractFunction(src, 'hideGymOffer');
const closeNavMoreOverlaySrc = extractFunction(src, 'closeNavMoreOverlay');
const showViewWiringSrc = extractStatement(src, 'VIEW_KEYS.forEach(key=>{');

// Real showView() calls VIEW_RENDERERS[key](...) — stubbed to a plain no-op
// map here on purpose: this file is about navigation/overlay behavior, not
// about what renderCare()/renderCoach()/etc. individually do, which have
// their own real-app dependencies unrelated to this feature.
const showViewSrc = `
  var VIEW_RENDERERS = {today:()=>{}, log:()=>{}, analysis:()=>{}, history:()=>{}, care:()=>{}, coach:()=>{}, learn:()=>{}};
  function showView(key, opts){
    switchView(key, opts);
    const render = VIEW_RENDERERS[key];
    if(render) render(opts && opts.intent);
  }
`;

// The real open-navMore / close-button / backdrop-click wiring, inlined —
// three short unnamed top-level listeners, same treatment as
// showViewWiringSrc above.
const navMoreWiringSrc = `
  document.getElementById('navMore').addEventListener('click', ()=>{
    document.getElementById('navMoreOverlay').classList.add('active');
  });
  document.getElementById('navMoreClose').addEventListener('click', closeNavMoreOverlay);
  document.getElementById('navMoreOverlay').addEventListener('click', (e)=>{
    if(e.target.id === 'navMoreOverlay') closeNavMoreOverlay();
  });
`;

function setup(){
  const bodyHtml = navPillsHtml + navMoreOverlayHtml + viewsHtml;
  const globalsSetup = `
    window.storage = { set: async ()=>{} };
    window.renderLogDateBar = ()=>{};
    window.matchMedia = window.matchMedia || (()=> ({matches:true})); // reduced-motion: skip fade timers, keep assertions synchronous
    window.Element.prototype.scrollIntoView = function(){}; // jsdom has none
  `;
  const { document, window } = runJsdom(bodyHtml, globalsSetup, [
    viewKeysSrc, movedToMoreSrc, staggerMaxSrc, staggerStepSrc,
    hideGymOfferSrc, switchViewSrc, closeNavMoreOverlaySrc, showViewSrc,
    showViewWiringSrc, navMoreWiringSrc,
  ]);
  return { document, window };
}

test('REAL invocation: clicking navMore opens the sheet; the close button and a backdrop click both close it', (assert)=>{
  const { document } = setup();
  const overlay = document.getElementById('navMoreOverlay');
  assert.strictEqual(overlay.classList.contains('active'), false, 'precondition: closed');

  document.getElementById('navMore').click();
  assert.strictEqual(overlay.classList.contains('active'), true, 'clicking the trigger must open the sheet');

  document.getElementById('navMoreClose').click();
  assert.strictEqual(overlay.classList.contains('active'), false, 'the close button must close it');

  document.getElementById('navMore').click();
  // Dispatched directly ON the overlay element, so e.target === overlay —
  // the real backdrop-click case (a tap that lands on the dimmed background,
  // not the sheet sitting on top of it).
  overlay.dispatchEvent(new document.defaultView.MouseEvent('click', {bubbles:true}));
  assert.strictEqual(overlay.classList.contains('active'), false, 'a click landing on the backdrop itself (target.id === overlay.id) must close it');
});

test('REAL invocation: clicking a relocated tab inside the sheet closes the sheet AND switches to that view — the real end-to-end path', (assert)=>{
  const { document } = setup();
  document.getElementById('navMore').click();
  assert.strictEqual(document.getElementById('navMoreOverlay').classList.contains('active'), true, 'precondition: sheet open');

  document.getElementById('navCare').click();

  assert.strictEqual(document.getElementById('navMoreOverlay').classList.contains('active'), false, 'choosing Care must close the sheet — it should not still be covering the tab you just picked');
  assert.strictEqual(document.getElementById('careView').style.display, '', 'Care must actually become the visible view');
  assert.ok(document.getElementById('navCare').classList.contains('active'), 'the Care button itself must show as selected');
});

test('REAL invocation: switchView keeps navMore\'s own .active state synced to whether the current view lives inside the sheet', (assert)=>{
  const { document, window } = setup();
  const moreBtn = document.getElementById('navMore');

  window.switchView('care');
  assert.strictEqual(moreBtn.classList.contains('active'), true, 'landing on Care (inside the sheet) must show More as the "you are here" pill in the visible rail');

  window.switchView('today');
  assert.strictEqual(moreBtn.classList.contains('active'), false, 'leaving for a main-rail tab must clear More\'s active state');
  assert.ok(document.getElementById('navToday').classList.contains('active'));

  window.switchView('learn');
  assert.strictEqual(moreBtn.classList.contains('active'), true, 'Learn is also inside the sheet — same sync must apply to all three relocated tabs, not just Care');
});

test('REAL invocation: clicking a main-rail tab while the sheet happens to be open still closes it (one rule for "a tab was chosen", not a special case)', (assert)=>{
  const { document } = setup();
  document.getElementById('navMore').click();
  assert.strictEqual(document.getElementById('navMoreOverlay').classList.contains('active'), true, 'precondition: sheet open');

  document.getElementById('navLog').click();

  assert.strictEqual(document.getElementById('navMoreOverlay').classList.contains('active'), false, 'picking a main-rail tab must also close a sheet left open from a previous visit');
});

run();
