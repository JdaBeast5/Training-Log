'use strict';
// Behavioral coverage for three accessibility gaps found in a live audit of
// the real app (not a code read):
//
//   1. The exercise-set expander — the single most-used control in the app,
//      7 per workout day — was a bare `<div class="exercise">` with a click
//      listener and nothing else: no role, no tabindex, no aria-expanded, no
//      aria-controls, no key handling, and no focusable ancestor either, so a
//      keyboard or switch-control user could not open a set list at all. Every
//      other collapsible in the file (profileHeader, nutritionHeader,
//      measureHeader, …) was already a role="button" + tabindex="0" div with a
//      real Enter/Space handler; this brings the exercise header onto that same
//      pattern rather than inventing a second one.
//   2. renderTabs() and renderFoodCats() both replace their container's whole
//      innerHTML on activation, destroying the focused node and dropping focus
//      to <body> — so every day switch and every food-category switch threw a
//      keyboard user back to the top of the document.
//   3. Decorative SVGs and chevrons carried no accessibility markup at all, so
//      a screen reader read a stream of unlabelled graphics sitting next to the
//      very text they duplicate.
//
// Everything below runs the REAL extracted source (the real markup template,
// the real setExerciseBlockOpen, the real delegated keydown listener, the real
// renderTabs/renderFoodCats) against jsdom and asserts on resulting DOM state
// and document.activeElement — never string-matching the source for behavior.
const {
  readIndexSource, extractFunction, extractElementById,
  countCallSites, runJsdom, makeRunner,
} = require('./testHelpers.js');

const src = readIndexSource();

function extractBetween(label, startAnchor, endAnchor){
  const start = src.indexOf(startAnchor);
  if(start === -1) throw new Error(`extractBetween(${label}): start anchor not found: ${startAnchor}`);
  const end = src.indexOf(endAnchor, start);
  if(end === -1) throw new Error(`extractBetween(${label}): end anchor not found after start: ${endAnchor}`);
  return src.slice(start, end);
}

// ── Real source under test ──────────────────────────────────────────────────

const openHelperSrc = extractFunction(src, 'setExerciseBlockOpen');
const nextExerciseBlockSrc = extractFunction(src, 'nextExerciseBlock');

// The exercise row's real markup template, lifted whole out of renderWorkout
// rather than hand-copied into a fixture — the point of these tests is that
// the SHIPPING markup carries the attributes, so a fixture that spelled them
// out itself would prove nothing. Ends at the template's own closing backtick;
// the nested `${ex.isCustom ? `…` : ''}` template inside it contains no
// backtick-semicolon pair, so the first one found is the real terminator.
const rowTemplateSrc = (()=>{
  const a = src.indexOf('row.innerHTML = `');
  if(a === -1) throw new Error('row template anchor not found');
  const b = src.indexOf('`;', a);
  if(b === -1) throw new Error('row template terminator not found');
  return src.slice(a, b + 2);
})();

// Just the header's own click wiring (the swap-icon/edit/history bindings that
// follow it need dependencies irrelevant to this behavior). Anchors are all
// single-line substrings — index.html is CRLF, so any anchor spanning a line
// break would silently fail to match. Lives inside wireExerciseMember(memberEl,
// blockEl, exIdx, piece) now — for a lone exercise memberEl and blockEl are
// the SAME element (see ROW_GLOBALS below), matching the real
// assembleSingleExercise call wireExerciseMember(row, row, i, piece).
const headerWiringSrc = extractBetween(
  'exercise header declaration',
  "const exerciseHeader = memberEl.querySelector('.exercise');",
  'const deleteCustomBtn'
) + extractBetween(
  'exercise header toggle listener',
  "exerciseHeader.addEventListener('click', ()=>{",
  '// Bound to the swap ICON'
);

// The one delegated Enter/Space listener shared by the static card headers and
// the exercise header. Located by the selector that makes it unique (several
// other keydown listeners exist), then taken from its own
// `document.addEventListener(` back to the `});` that closes it at column 0.
const keydownListenerSrc = (()=>{
  const marker = src.indexOf("'.nutrition-header, .exercise, .food-log-item'");
  if(marker === -1) throw new Error('delegated collapsible keydown listener: selector marker not found');
  const start = src.lastIndexOf("document.addEventListener('keydown'", marker);
  if(start === -1) throw new Error('delegated collapsible keydown listener: no enclosing keydown listener');
  const close = src.indexOf('\n});', start);
  if(close === -1) throw new Error('delegated collapsible keydown listener: no closing });');
  return src.slice(start, close + 4);
})();

const renderTabsSrc = extractFunction(src, 'renderTabs');
const renderFoodCatsSrc = extractFunction(src, 'renderFoodCats');
const iconHelperSrc = extractFunction(src, 'icon');
const iconsRegistrySrc = extractBetween('ICONS registry', 'const ICONS = {', '\n};') + '\n};';

// Stubs for everything the row template interpolates that isn't part of what's
// being asserted. Deliberately inert strings so any attribute found in the
// resulting DOM can only have come from the real template. assembleSingle
// Exercise builds this from a `piece` object (see renderWorkout) rather than
// individually-named locals, so the stand-ins are nested under window.piece
// to match — `i` and `trackingHtml` stay bare globals because the real
// function still reads THOSE directly from its own scope, only `cautionHtml`/
// `headerInnerHtml`/`detailsHtml` moved onto the piece.
const ROW_GLOBALS = `
  window.i = 3;
  window.piece = {
    headerInnerHtml: '<input type="checkbox" data-idx="3"><div class="ex-name-wrap"><div class="ex-name">Back Squat</div></div><div class="ex-sets"><span>3×8</span></div><span class="ex-chevron" aria-hidden="true">›</span>',
    cautionHtml: '',
    detailsHtml: '',
  };
  window.trackingHtml = '<div class="sets-block"><input class="ex-input" type="number"></div>';
  // For a lone (non-superset) exercise, memberEl and blockEl are the same
  // element — exactly how assembleSingleExercise calls
  // wireExerciseMember(row, row, i, piece) for real.
  window.row = document.getElementById('row');
  window.memberEl = window.row;
  window.blockEl = window.row;
`;

const { test, run } = makeRunner('test-a11y-keyboard-focus.js');

// ── 1. Exercise header: keyboard + ARIA ─────────────────────────────────────

test('REAL markup: the shipped exercise header is a role="button" with tabindex, aria-expanded and an aria-controls pointing at the real sets panel', (assert)=>{
  const { document } = runJsdom('<div id="row" class="exercise-block"></div>', ROW_GLOBALS, [rowTemplateSrc]);
  const header = document.querySelector('.exercise');
  const panel = document.querySelector('.expand-wrap');
  assert.strictEqual(header.getAttribute('role'), 'button', 'header must announce itself as a button');
  assert.strictEqual(header.getAttribute('tabindex'), '0', 'header must be reachable by Tab / switch control');
  assert.strictEqual(header.getAttribute('aria-expanded'), 'false', 'a freshly rendered row starts collapsed and says so');
  const controls = header.getAttribute('aria-controls');
  assert.ok(controls && controls.length > 0, 'header must name the region it controls');
  assert.strictEqual(panel.id, controls, 'aria-controls must resolve to the real sets panel, not a dangling id');
  assert.strictEqual(document.getElementById(controls), panel, 'the id must actually be findable in the document');
  // The decorative chevron inside the header is hidden, so the header's
  // accessible name is not polluted by a "›" glyph.
  assert.strictEqual(document.querySelector('.ex-chevron').getAttribute('aria-hidden'), 'true');
});

test('REAL invocation: a pointer click on the header expands the row AND flips aria-expanded, and a second click collapses both again', (assert)=>{
  const { window: win } = runJsdom('<div id="row" class="exercise-block"></div>', ROW_GLOBALS,
    [rowTemplateSrc, openHelperSrc, nextExerciseBlockSrc, headerWiringSrc, `
      var header = document.querySelector('.exercise');
      function snapshot(){
        return [row.classList.contains('open'), row.querySelector('.expand-wrap').classList.contains('open'), header.getAttribute('aria-expanded')];
      }
      header.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
      window.__afterFirst = snapshot();
      header.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
      window.__afterSecond = snapshot();
    `]);
  assert.strictEqual(JSON.stringify(win.__afterFirst), JSON.stringify([true, true, 'true']),
    'one click opens the row and the announced state agrees with what is on screen');
  assert.strictEqual(JSON.stringify(win.__afterSecond), JSON.stringify([false, false, 'false']),
    'a second click closes it and the announced state follows it back');
});

test('THE FIX: a keyboard-only Enter on the focused exercise header opens the set list — previously impossible, there was no key handler at all', (assert)=>{
  const { document, window: win } = runJsdom('<div id="row" class="exercise-block"></div>', ROW_GLOBALS,
    [rowTemplateSrc, openHelperSrc, nextExerciseBlockSrc, headerWiringSrc, keydownListenerSrc, `
      var header = document.querySelector('.exercise');
      header.focus();
      window.__wasFocused = (document.activeElement === header);
      var ev = new window.KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
      header.dispatchEvent(ev);
      window.__defaultPrevented = ev.defaultPrevented;
    `]);
  assert.strictEqual(win.__wasFocused, true, 'the header must be focusable in the first place (tabindex="0") or nothing else here matters');
  assert.strictEqual(document.getElementById('row').classList.contains('open'), true, 'Enter must expand the row');
  assert.strictEqual(document.querySelector('.expand-wrap').classList.contains('open'), true);
  assert.strictEqual(document.querySelector('.exercise').getAttribute('aria-expanded'), 'true');
});

test('THE FIX: Space does the same, and its default scroll is prevented (a role="button" that scrolls the page instead of activating is its own bug)', (assert)=>{
  const { document, window: win } = runJsdom('<div id="row" class="exercise-block"></div>', ROW_GLOBALS,
    [rowTemplateSrc, openHelperSrc, nextExerciseBlockSrc, headerWiringSrc, keydownListenerSrc, `
      var header = document.querySelector('.exercise');
      header.focus();
      var ev = new window.KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true});
      header.dispatchEvent(ev);
      window.__defaultPrevented = ev.defaultPrevented;
    `]);
  assert.strictEqual(document.getElementById('row').classList.contains('open'), true, 'Space must expand the row');
  assert.strictEqual(document.querySelector('.exercise').getAttribute('aria-expanded'), 'true');
  assert.strictEqual(win.__defaultPrevented, true, 'Space must not also scroll the page');
});

test('GUARD: Enter pressed on the completion checkbox INSIDE the header belongs to the checkbox — it must not also toggle the row open', (assert)=>{
  const { document } = runJsdom('<div id="row" class="exercise-block"></div>', ROW_GLOBALS,
    [rowTemplateSrc, openHelperSrc, nextExerciseBlockSrc, headerWiringSrc, keydownListenerSrc, `
      var cb = document.querySelector('.exercise input[type=checkbox]');
      cb.focus();
      cb.dispatchEvent(new window.KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true}));
    `]);
  assert.strictEqual(document.getElementById('row').classList.contains('open'), false,
    'a keypress that started inside a nested control must not reach the header toggle');
  assert.strictEqual(document.querySelector('.exercise').getAttribute('aria-expanded'), 'false');
});

test('REAL invocation: setExerciseBlockOpen is the single writer of open state — class on the block, class on the wrap, and aria-expanded on the header, in both directions', (assert)=>{
  const { document, window: win } = runJsdom('<div id="row" class="exercise-block"></div>', ROW_GLOBALS,
    [rowTemplateSrc, openHelperSrc, `
      setExerciseBlockOpen(row, true);
      window.__afterOpen = [row.classList.contains('open'), row.querySelector('.expand-wrap').classList.contains('open'), row.querySelector('.exercise').getAttribute('aria-expanded')];
      setExerciseBlockOpen(row, false);
      window.__afterClose = [row.classList.contains('open'), row.querySelector('.expand-wrap').classList.contains('open'), row.querySelector('.exercise').getAttribute('aria-expanded')];
      // A block with no header/wrap at all must not throw — gym mode calls this
      // against whatever is in the list.
      window.__bareThrew = false;
      try{ setExerciseBlockOpen(document.getElementById('bare'), true); }catch(e){ window.__bareThrew = true; }
      window.__nullThrew = false;
      try{ setExerciseBlockOpen(null, true); }catch(e){ window.__nullThrew = true; }
    `]);
  assert.strictEqual(JSON.stringify(win.__afterOpen), JSON.stringify([true, true, 'true']));
  assert.strictEqual(JSON.stringify(win.__afterClose), JSON.stringify([false, false, 'false']));
  assert.strictEqual(win.__bareThrew, false, 'a block without a header/wrap must be tolerated');
  assert.strictEqual(win.__nullThrew, false, 'a missing block must be tolerated');
  void document;
});

test('SABOTAGE ANCHOR: every path that opens or closes an exercise row goes through the one helper — counted as real invocations, not text matches', (assert)=>{
  // A superset pair is now ONE physical block (see
  // test-superset-field-chaining.js's header comment) rather than two
  // linked blocks needing a separate "open them together" wrapper, so
  // setExerciseUnitOpen is gone and every caller uses setExerciseBlockOpen
  // directly: the header toggle (once per member, so either half of a pair
  // opens the shared block), the checkbox-driven auto-collapse/auto-open,
  // openFirstIncompleteExercise's own consolidate-to-one and open-the-
  // target calls, and both halves of advanceToNextExercise's handover — 7
  // real direct call sites. If this count drifts, some path now hand-writes
  // the class dance instead and aria-expanded goes stale there — this
  // number is what makes that visible instead of silent.
  assert.strictEqual(countCallSites(src, 'setExerciseBlockOpen'), 7);
  assert.strictEqual(src.includes('setExerciseUnitOpen'), false, 'the old pairing wrapper must be gone entirely, not just uncalled');
  // And the old hand-written form is gone from all of them.
  assert.strictEqual(src.includes("row.querySelector('.expand-wrap').classList.toggle('open')"), false);
  assert.strictEqual(src.includes("row.querySelector('.expand-wrap').classList.remove('open')"), false);
});

// ── 2. Focus restore across a destructive re-render ─────────────────────────

const TABS_GLOBALS = `
  window.dayOrder = ['d1','d2','d3','d4','d5'];
  window.dayDefs = {
    d1:{label:'Day 1', sub:'Push', plateNum:'1'},
    d2:{label:'Day 2', sub:'Pull', plateNum:'2'},
    d3:{label:'Day 3', sub:'Legs', plateNum:'3'},
    d4:{label:'Day 4', sub:'Upper', plateNum:'4'},
    d5:{label:'Day 5', sub:'Full Rest', plateNum:'OFF', rest:true},
  };
  window.activeDay = 'd1';
  window.weekProgress = {};
  window.reorderMode = false;
  window.getDayPlateClass = ()=> 'p-red';
  window.dayGlyphSvg = ()=> '<svg aria-hidden="true" viewBox="0 0 20 20"></svg>';
  window.icon = ()=> '';
  window.renderWorkout = ()=>{};
  window.saveActiveDay = ()=>{};
  window.moveDay = (idx, dir)=>{
    var t = dayOrder[idx]; dayOrder[idx] = dayOrder[idx+dir]; dayOrder[idx+dir] = t;
    renderTabs();
  };
`;

test('THE FIX: activating the 3rd day tab by keyboard leaves focus ON that tab after the re-render destroys it — not on <body>', (assert)=>{
  const { document, window: win } = runJsdom('<div id="tabs" role="tablist"></div>', TABS_GLOBALS,
    [renderTabsSrc, `
      renderTabs();
      var third = document.getElementById('tabs').children[2];
      window.__thirdDayBefore = third.dataset.dayId;
      third.focus();
      // The real keyboard activation path: Enter on a focused tab runs its own
      // onkeydown, which calls onclick, which re-renders the whole rail.
      third.dispatchEvent(new window.KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
      window.__activeTag = document.activeElement.tagName;
      window.__activeDayId = document.activeElement.dataset ? document.activeElement.dataset.dayId : null;
      window.__isBody = (document.activeElement === document.body);
      window.__activeIsInRail = document.getElementById('tabs').contains(document.activeElement);
      window.__tabIndex = document.activeElement.tabIndex;
      window.__ariaSelected = document.activeElement.getAttribute('aria-selected');
      window.__nodeReplaced = (document.activeElement !== third);
    `]);
  assert.strictEqual(win.__thirdDayBefore, 'd3', 'sanity: the 3rd tab really is day 3');
  assert.strictEqual(win.__isBody, false, 'focus must NOT fall through to <body> — this is the whole bug');
  assert.strictEqual(win.__nodeReplaced, true,
    'sabotage-relevant: the original node really was destroyed by the re-render, so this is a genuine restore and not the old node surviving');
  assert.strictEqual(win.__activeIsInRail, true, 'focus stays inside the day rail');
  assert.strictEqual(win.__activeDayId, 'd3', 'and lands on the SAME day it was on, matched by day id');
  assert.strictEqual(win.__ariaSelected, 'true', 'which is now the selected tab');
  assert.strictEqual(win.__tabIndex, 0, 'and is in the tab order, so Tab continues sensibly from there');
  assert.strictEqual(document.getElementById('tabs').children.length, 5);
});

test('a reorder move keeps focus with the DAY that moved, following it into its new slot rather than staying on the position', (assert)=>{
  const { window: win } = runJsdom('<div id="tabs" role="tablist"></div>', TABS_GLOBALS,
    [renderTabsSrc, `
      window.reorderMode = true;
      renderTabs();
      // Day 3 sits at slot index 2; its "move earlier" arrow is child 0.
      var third = document.getElementById('tabs').children[2];
      var earlier = third.querySelector('.reorder-arrows').children[0];
      earlier.focus();
      earlier.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
      window.__orderAfter = dayOrder.join(',');
      window.__activeDayId = document.activeElement.closest('.tab') ? document.activeElement.closest('.tab').dataset.dayId : null;
      window.__isBody = (document.activeElement === document.body);
      window.__isArrow = document.activeElement.classList.contains ? !!document.activeElement.closest('.reorder-arrows') : false;
      window.__slotOfD3 = [...document.getElementById('tabs').children].findIndex(function(t){ return t.dataset.dayId === 'd3'; });
    `]);
  assert.strictEqual(win.__orderAfter, 'd1,d3,d2,d4,d5', 'sanity: the move really happened');
  assert.strictEqual(win.__isBody, false, 'focus must not be dropped by the reorder re-render either');
  assert.strictEqual(win.__activeDayId, 'd3', 'focus follows day 3 into its new slot');
  assert.strictEqual(win.__slotOfD3, 1);
  assert.strictEqual(win.__isArrow, true, 'and stays on the same arrow button, so a second press keeps moving it');
});

test('GUARD: renderTabs() called while focus is somewhere else entirely does NOT yank focus into the day rail', (assert)=>{
  // renderTabs() also runs when a set checkbox flips a day's done badge, on a
  // program switch, and at boot. Restoring focus unconditionally there would be
  // a brand-new bug rather than a fix.
  const { window: win } = runJsdom('<div id="tabs" role="tablist"></div><button id="elsewhere">Elsewhere</button>', TABS_GLOBALS,
    [renderTabsSrc, `
      renderTabs();
      var other = document.getElementById('elsewhere');
      other.focus();
      window.weekProgress = {d2: true};
      renderTabs();
      window.__activeId = document.activeElement.id;
    `]);
  assert.strictEqual(win.__activeId, 'elsewhere', 'focus must be left exactly where it was');
});

const FOODCATS_GLOBALS = `
  window.foodLibrary = {Protein:[], Carbs:[], Fats:[], Snacks:[], Restaurants:{}};
  window.activeCat = '★ Favorites';
  window.activeRestaurant = null;
  window.storage = {set: ()=> Promise.resolve(), get: ()=> Promise.reject(new Error('not found'))};
  window.renderFoodItems = ()=>{};
`;

test('THE FIX: activating the 3rd food-category chip in the row leaves focus on that same chip after the re-render, not on <body>', (assert)=>{
  const { window: win } = runJsdom('<div id="foodCats"></div>', FOODCATS_GLOBALS,
    [renderFoodCatsSrc, `
      renderFoodCats();
      var chips = document.getElementById('foodCats').children;
      window.__chipCount = chips.length;
      var third = chips[2];
      window.__thirdCat = third.dataset.cat;
      third.focus();
      window.__focusTook = (document.activeElement === third);
      third.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
      window.__isBody = (document.activeElement === document.body);
      window.__activeCatAttr = document.activeElement.dataset ? document.activeElement.dataset.cat : null;
      window.__activeIsChip = document.activeElement.classList.contains('food-cat-btn');
      window.__activeIsActiveChip = document.activeElement.classList.contains('active');
      window.__nodeReplaced = (document.activeElement !== third);
      window.__activeCatVar = activeCat;
    `]);
  assert.strictEqual(win.__chipCount, 7, 'sanity: ★ Favorites + 📁 My Foods + 5 library categories');
  assert.strictEqual(win.__thirdCat, 'Protein', 'sanity: the 3rd chip is the first real library category');
  assert.strictEqual(win.__focusTook, true, 'sanity: the chip was genuinely focused before activation');
  assert.strictEqual(win.__activeCatVar, 'Protein', 'sanity: the click really did switch category and re-render');
  assert.strictEqual(win.__nodeReplaced, true,
    'sabotage-relevant: the focused node really was destroyed, so this is a genuine restore');
  assert.strictEqual(win.__isBody, false, 'focus must NOT fall through to <body>');
  assert.strictEqual(win.__activeIsChip, true, 'focus stays on a category chip');
  assert.strictEqual(win.__activeCatAttr, 'Protein', 'and on the SAME category, matched by its data-cat key');
  assert.strictEqual(win.__activeIsActiveChip, true, 'which is now the selected chip');
});

test('GUARD: renderFoodCats() at boot, with nothing in the row focused, does not steal focus', (assert)=>{
  const { window: win } = runJsdom('<div id="foodCats"></div><button id="elsewhere">Elsewhere</button>', FOODCATS_GLOBALS,
    [renderFoodCatsSrc, `
      document.getElementById('elsewhere').focus();
      renderFoodCats();
      window.__activeId = document.activeElement.id;
    `]);
  assert.strictEqual(win.__activeId, 'elsewhere');
});

// ── 3. Decorative icons are hidden from assistive tech ─────────────────────

test('every <svg> in index.html is hidden from assistive tech, except the sparkline data-visualisations (deliberately left for a real judgment call) and the icon() registry (which injects aria-hidden at render)', (assert)=>{
  // index.html ONLY, deliberately not readIndexSource() — that also folds in
  // content-masterclasses.js, whose ~112 technique-illustration SVGs are a
  // separate, larger sweep that this pass did not touch and does not claim to
  // cover. Asserting over the combined source would either fail here or force
  // an out-of-scope edit to a file this change has no business in.
  const indexOnly = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  const tags = indexOnly.match(/<svg\b[^>]*>/g) || [];
  assert.ok(tags.length > 100, 'sanity: the file really does contain a large pile of SVGs');

  const sparklines = tags.filter(t=> t.includes('class="sparkline"'));
  // The icon() registry's three literals get their aria-hidden injected by
  // icon() itself, verified separately below — the raw literals legitimately
  // lack it, and so does the template inside icon()'s own replace() call.
  const registryLines = indexOnly.split('\n').filter(l=> /^\s*(check|warning|error):\s*'<svg/.test(l) || l.includes('svg.replace('));
  const registryTags = registryLines.join('\n').match(/<svg\b[^>]*>/g) || [];

  const unhidden = tags.filter(t=> !/aria-hidden/.test(t) && !t.includes('class="sparkline"') && !registryTags.includes(t));
  assert.strictEqual(unhidden.length, 0,
    `every non-sparkline SVG must carry aria-hidden; missing on: ${unhidden.slice(0,3).join(' | ')}`);

  // Proves the exclusion above isn't vacuously true — if the sparklines ever
  // stopped matching, `unhidden.length === 0` would be passing for the wrong
  // reason. These 5 are the flagged, deliberately-untouched data-vizzes: each
  // one is a real chart, and inventing an aria-label for it would be worse
  // coverage than none.
  assert.strictEqual(sparklines.length, 5);
  assert.strictEqual(sparklines.filter(t=> /aria-hidden|aria-label/.test(t)).length, 0,
    'the sparklines were left alone on purpose — neither hidden nor given a guessed label');
});

test('REAL DOM: a card header lifted straight out of index.html has both its icon SVG and its state chevron hidden, while its visible text label is untouched', (assert)=>{
  const headerHtml = extractElementById(src, 'nutritionHeader');
  const { document } = runJsdom(headerHtml, '', []);
  const header = document.getElementById('nutritionHeader');
  const svg = header.querySelector('svg');
  const chevron = header.querySelector('.ex-chevron');
  assert.ok(svg, 'sanity: this header really does carry an icon SVG');
  assert.strictEqual(svg.getAttribute('aria-hidden'), 'true', 'the icon duplicates the text beside it, so it is hidden');
  assert.ok(chevron, 'sanity: this header really does carry a chevron');
  assert.strictEqual(chevron.getAttribute('aria-hidden'), 'true', 'the chevron is a pure visual state indicator');
  assert.ok(header.textContent.includes("Today's Nutrition"), 'the real text label is still there to be read');
});

test('REAL DOM: the app-header brand mark and the search pill icon are hidden — both sit next to (or inside) something already labelled', (assert)=>{
  const cogHtml = extractElementById(src, 'settingsCog');
  const searchHtml = extractElementById(src, 'globalSearchBtn');
  const { document } = runJsdom(cogHtml + searchHtml, '', []);
  const cog = document.getElementById('settingsCog');
  const search = document.getElementById('globalSearchBtn');
  assert.strictEqual(cog.getAttribute('aria-label'), 'Settings', 'sanity: the button carries the real label');
  assert.strictEqual(cog.querySelector('svg').getAttribute('aria-hidden'), 'true');
  assert.strictEqual(search.getAttribute('aria-label'), 'Search the app');
  assert.strictEqual(search.querySelector('svg').getAttribute('aria-hidden'), 'true');
});

test('REAL invocation: icon() still injects aria-hidden into its registry SVGs at render time, which is why those three literals are exempt above', (assert)=>{
  const { window: win } = runJsdom('<div id="out"></div>', '', [iconsRegistrySrc, iconHelperSrc, `
    document.getElementById('out').innerHTML = icon('check') + icon('warning') + icon('error');
    window.__svgCount = document.querySelectorAll('#out svg').length;
    window.__hiddenCount = document.querySelectorAll('#out svg[aria-hidden="true"]').length;
  `]);
  assert.strictEqual(win.__svgCount, 3);
  assert.strictEqual(win.__hiddenCount, 3, 'all three rendered icons are hidden without the literals needing the attribute');
});

run();
