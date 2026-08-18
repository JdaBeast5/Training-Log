'use strict';
// Behavioral coverage for the "choppy expand/collapse" fix: native
// <details> (.ex-details exercise technique cues, .pose-detail-wrap and
// .posing-class in Learn's masterclass/posing technique breakdowns,
// .month-group in History's Day-by-Day Log) had zero CSS transition on
// their content — the browser snaps them open/closed in one frame, unlike
// every other expandable section in the app (expand-wrap/smooth-toggle),
// which animate smoothly.
//
// The fix keeps real <details>/<summary> semantics (native keyboard
// toggle, Safari find-on-page auto-expand) rather than replacing them with
// divs. A delegated document click listener intercepts the summary click,
// preventDefaults the native instant toggle, and animateDetailsToggle
// animates the <details> element's own height between its collapsed
// (summary-only) and full (scrollHeight) heights.
//
// jsdom has no real layout engine — offsetHeight/scrollHeight are always 0
// there (this project's own test-list-row-enter-animation.js documents the
// same limitation) — so these tests verify the real, extracted JS logic's
// BEHAVIOR (state transitions, timing, which elements get intercepted,
// cleanup on transitionend) rather than literal pixel heights, which only
// a real browser can show.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-smooth-details-toggle.js');

function extractSpan(source, startMarker, endMarker){
  const startIdx = source.indexOf(startMarker);
  if(startIdx === -1) throw new Error(`extractSpan: start marker not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if(endIdx === -1) throw new Error(`extractSpan: end marker not found after start: ${endMarker}`);
  return source.slice(startIdx, endIdx);
}

const delegatedListenerSrc = extractSpan(
  src,
  'const SMOOTH_DETAILS_SELECTOR',
  '\nfunction openGlobalSearch(){'
);
const animateDetailsToggleSrc = extractFunction(src, 'animateDetailsToggle');

test('sabotage-relevant: SMOOTH_DETAILS_SELECTOR really does list all four real choppy-details classes, not a stray subset', (assert)=>{
  const selMatch = /const SMOOTH_DETAILS_SELECTOR = '([^']+)'/.exec(src);
  assert.ok(selMatch, 'expected to find the real SMOOTH_DETAILS_SELECTOR declaration');
  const classes = selMatch[1].split(',').map(s=>s.trim());
  assert.deepStrictEqual(
    classes.sort(),
    ['.ex-details', '.month-group', '.pose-detail-wrap', '.posing-class'].sort(),
    'expected exactly the four real component families this fix targets — no more, no fewer'
  );
});

test('sabotage-relevant: the delegated listener actually calls the real animateDetailsToggle function, not a stray duplicate', (assert)=>{
  // The extracted span also contains the function's own declaration line
  // (function animateDetailsToggle(...){), which itself matches
  // /animateDetailsToggle\(/ — excluded so this only counts real CALLS.
  const callsOnly = delegatedListenerSrc.replace(/function animateDetailsToggle\([^)]*\)\{[\s\S]*$/, '');
  const count = (callsOnly.match(/animateDetailsToggle\(/g) || []).length;
  assert.strictEqual(count, 1, `expected exactly one real call to animateDetailsToggle from the delegated listener, found ${count}`);
});

function detailsBodyHtml(cls, open){
  return `
    <details class="${cls}"${open ? ' open' : ''}>
      <summary>Technique & focus</summary>
      <div class="detail-content">Some real detail content long enough to matter.</div>
    </details>
  `;
}

test('REAL invocation: clicking summary on a matching (.ex-details) closed <details> opens it, marks it animating, and clips overflow immediately (the height/transition themselves are set on a deferred macrotask — covered by the dedicated deferral test below)', async (assert)=>{
  const { document } = runJsdom(detailsBodyHtml('ex-details', false), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
    `document.querySelector('summary').dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));`
  ]);
  const details = document.querySelector('details');
  assert.strictEqual(details.open, true, 'the real open state must flip to true');
  assert.strictEqual(details.dataset.animating, '1', 'must be marked as mid-animation so a second click during the transition is ignored');
  assert.strictEqual(details.style.overflow, 'hidden', 'overflow must be clipped for the duration of the height animation');
  await new Promise(res => setTimeout(res, 20));
  assert.match(details.style.transition, /height/, 'once the deferred macrotask has run, a height transition must be set up so the reveal actually animates, not snaps');
});

test('REAL invocation: the native instant toggle is prevented (defaultPrevented) for a matching <details>, so only the animated path runs', (assert)=>{
  const { document, window: win } = runJsdom(detailsBodyHtml('ex-details', false), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
  ]);
  const ev = new win.Event('click', {bubbles:true, cancelable:true});
  document.querySelector('summary').dispatchEvent(ev);
  assert.strictEqual(ev.defaultPrevented, true, 'expected preventDefault to have been called on the summary click');
});

test('REGRESSION, found via live-browser testing (not a hypothetical, and not reproducible in an isolated single-element repro — it only showed up on the real page, where other rAF activity apparently reorders things): the opening branch must wait for a real macrotask, not requestAnimationFrame, before measuring scrollHeight — confirmed live that setting .open=true does NOT synchronously fire \'toggle\' (the event .month-group relies on to lazily fill its day cards), and that a single rAF is not reliably ordered after that queued toggle task either. A synchronous or rAF-timed read raced the still-empty content and produced a content-less "animation" to the wrong (too-small) target height, which on a real device read as .month-group staying visually flat and then snapping — the exact choppiness this whole fix exists to remove.', async (assert)=>{
  const { document } = runJsdom(detailsBodyHtml('ex-details', false), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
    `document.querySelector('summary').dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));`
  ]);
  const details = document.querySelector('details');
  assert.strictEqual(details.style.transition, '', 'BEFORE the deferred macrotask runs, no transition may be set up yet — measuring content height this early is exactly the bug that produced a content-less animation for .month-group');
  await new Promise(res => setTimeout(res, 20));
  assert.match(details.style.transition, /height/, 'AFTER the deferred macrotask has had a chance to run, the transition must now be set up');
});

test('REAL invocation: a <details> NOT in the four target classes is left completely alone (no interception, no animation)', (assert)=>{
  const { document, window: win } = runJsdom(detailsBodyHtml('some-other-details', false), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
  ]);
  const ev = new win.Event('click', {bubbles:true, cancelable:true});
  document.querySelector('summary').dispatchEvent(ev);
  const details = document.querySelector('details');
  assert.strictEqual(ev.defaultPrevented, false, 'a non-matching details must not have its native click intercepted');
  assert.strictEqual(details.dataset.animating, undefined, 'a non-matching details must never be marked as animating');
});

test('REAL invocation: clicking summary on a matching, currently-OPEN <details> does NOT synchronously close it — it stays open (and visible) until the animation completes', (assert)=>{
  const { document } = runJsdom(detailsBodyHtml('month-group', true), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
    `document.querySelector('summary').dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));`
  ]);
  const details = document.querySelector('details');
  assert.strictEqual(details.open, true, 'closing must animate first — content stays rendered/visible until transitionend, not vanish instantly like the old native behavior');
  assert.match(details.style.transition, /height/, 'a height transition must be set up for the close animation too');
});

test('REAL invocation: a second click while already animating is ignored (no re-entrant animation restart)', (assert)=>{
  const { document } = runJsdom(detailsBodyHtml('ex-details', false), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
    `
    const summary = document.querySelector('summary');
    summary.dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));
    const details = document.querySelector('details');
    details.style.height = '777px'; // stand-in the first animation would have set for real (a valid CSS length, unlike the 0px jsdom's layout-less scrollHeight would produce)
    summary.dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));
    `
  ]);
  const details = document.querySelector('details');
  assert.strictEqual(details.style.height, '777px', 'a click during dataset.animating="1" must be a no-op — it must not restart/overwrite the in-flight animation');
});

test('REAL invocation: transitionend on the height property cleans up — clears inline style and the animating flag, and (for a close) actually sets open=false', (assert)=>{
  const { document, window: win } = runJsdom(detailsBodyHtml('posing-class', true), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
    `document.querySelector('summary').dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));`
  ]);
  const details = document.querySelector('details');
  assert.strictEqual(details.open, true, 'sanity: still open mid-animation before transitionend fires');
  const evt = new win.Event('transitionend', {bubbles:false});
  Object.defineProperty(evt, 'propertyName', {value:'height'});
  Object.defineProperty(evt, 'target', {value: details});
  details.dispatchEvent(evt);
  assert.strictEqual(details.open, false, 'once the close animation genuinely finishes, the details must actually close');
  assert.strictEqual(details.style.transition, '', 'inline transition must be cleared after the animation so it does not linger on future content changes');
  assert.strictEqual(details.style.height, '', 'inline height must be cleared so the element returns to normal auto sizing');
  assert.strictEqual(details.dataset.animating, undefined, 'the animating flag must be cleared so the next click is not ignored forever');
});

test('REAL invocation: a transitionend for an UNRELATED property (e.g. a nested child\'s own transform) is ignored, not treated as the height animation finishing', (assert)=>{
  const { document, window: win } = runJsdom(detailsBodyHtml('ex-details', false), '', [
    delegatedListenerSrc, animateDetailsToggleSrc,
    `document.querySelector('summary').dispatchEvent(new window.Event('click', {bubbles:true, cancelable:true}));`
  ]);
  const details = document.querySelector('details');
  const evt = new win.Event('transitionend', {bubbles:false});
  Object.defineProperty(evt, 'propertyName', {value:'transform'});
  Object.defineProperty(evt, 'target', {value: details});
  details.dispatchEvent(evt);
  assert.strictEqual(details.dataset.animating, '1', 'a transitionend for a property other than height must not trigger cleanup');
});

run();
