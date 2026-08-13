'use strict';
// Behavioral coverage for two audit findings, both about a UI going stale or
// silent without telling anyone:
//
// 1. Global search's "Go to" (sections) and "Techniques" groups have always
//    capped at GLOBAL_SEARCH_SECTION_LIMIT/GLOBAL_SEARCH_TECHNIQUE_LIMIT with
//    no sign anything was left out — unlike the Exercises group right below
//    them, which has always said "Showing N of M matching exercises" past its
//    own limit. A broad one-letter query can match dozens of sections or
//    hundreds of technique names; capping silently reads as "that's
//    everything" when it isn't. Fixed by giving sections and techniques the
//    same hint, reusing the existing .history-hint class and wording shape
//    the exercises group already established — no new pattern invented.
//
// 2. openMasterclass() never re-rendered #masterclassIndex, while
//    closeMasterclass() always has. Opening a masterclass FROM its own index
//    button left that button showing aria-expanded="false" and no "Open ·
//    tap to close" meta text until something unrelated (leaving and
//    re-entering Learn, or closing a different masterclass) happened to
//    rebuild the index and catch this one up incidentally. Fixed by having
//    openMasterclass call renderMasterclassIndex() too, mirroring
//    closeMasterclass exactly.
const { readIndexSource, extractConst, extractFunction, extractElementById, countCallSites, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-search-index-freshness.js');

// === PART 1: search result group overflow hints =============================

const searchStubGlobals = `
  var exerciseInfo = {};
  var MUSCLE_GROUP_MAP = {};
`;

// Builds N fabricated sections/techniques that all match query "match" — real
// counts, not hardcoded strings, so the assertions below prove the number in
// the hint is actually computed from the overflow, not a fixed guess.
function stubsFor(sectionCount, techniqueCount){
  return `
    function collectSearchSections(){
      const out = [];
      for(let i=0;i<${sectionCount};i++) out.push({id:'sec-'+i, tab:'today', tabLabel:'Today', title:'Match Section '+i});
      return out;
    }
    function buildMasterclassTechniqueSearchIndex(){
      const out = [];
      for(let i=0;i<${techniqueCount};i++) out.push({name:'Match Technique '+i, cardId:'someCard', masterclassLabel:'Some Masterclass'});
      return out;
    }
  `;
}

const searchFnChunks = [
  extractConst(src, 'GLOBAL_SEARCH_EXERCISE_LIMIT'),
  extractConst(src, 'GLOBAL_SEARCH_SECTION_LIMIT'),
  extractConst(src, 'GLOBAL_SEARCH_TECHNIQUE_LIMIT'),
  extractFunction(src, 'escapeHtml'),
  extractFunction(src, 'renderGlobalSearchResults'),
];

test('sabotage-relevant: GLOBAL_SEARCH_SECTION_LIMIT and GLOBAL_SEARCH_TECHNIQUE_LIMIT are both 10 right now — the anchor the over/under-limit tests below depend on', (assert)=>{
  // `const` declarations inside the executed <script> don't land on `window`
  // the way `var` does (unlike runSandbox's vm context), so the values are
  // surfaced explicitly rather than read back off window.
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals, [
    ...searchFnChunks, stubsFor(1,1),
    `document.getElementById('globalSearchResults').dataset.sectionLimit = GLOBAL_SEARCH_SECTION_LIMIT; document.getElementById('globalSearchResults').dataset.techniqueLimit = GLOBAL_SEARCH_TECHNIQUE_LIMIT;`
  ]);
  const el = document.getElementById('globalSearchResults');
  assert.strictEqual(el.dataset.sectionLimit, '10');
  assert.strictEqual(el.dataset.techniqueLimit, '10');
});

test('REAL invocation: more matching sections than the limit renders exactly LIMIT hits AND a "Showing N of M" hint with the real overflow count', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, stubsFor(13, 0), `renderGlobalSearchResults('match');`]);
  const hits = document.querySelectorAll('#globalSearchResults .gsearch-hit[data-jump-to]');
  assert.strictEqual(hits.length, 10, 'must still cap rendered hits at the limit');
  const hint = document.querySelector('#globalSearchResults .history-hint');
  assert.ok(hint, 'an overflow hint must render when sections exceed the limit — this was previously silent');
  assert.match(hint.textContent, /Showing 10 of 13 matching sections/, `hint text must state the real 10-of-13 count, got: "${hint.textContent}"`);
});

test('REAL invocation: matching sections AT OR UNDER the limit render with NO overflow hint (nothing was actually cut off)', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, stubsFor(4, 0), `renderGlobalSearchResults('match');`]);
  const hits = document.querySelectorAll('#globalSearchResults .gsearch-hit[data-jump-to]');
  assert.strictEqual(hits.length, 4);
  const hint = document.querySelector('#globalSearchResults .history-hint');
  assert.strictEqual(hint, null, 'no hint should render when every match already fits on screen — the hint is a "there is more" signal, not decoration');
});

test('REAL invocation: more matching techniques than the limit renders exactly LIMIT hits AND its own "Showing N of M" hint', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, stubsFor(0, 27), `renderGlobalSearchResults('match');`]);
  const hits = document.querySelectorAll('#globalSearchResults .gsearch-hit[data-technique-card]');
  assert.strictEqual(hits.length, 10, 'must still cap rendered technique hits at the limit');
  const hints = [...document.querySelectorAll('#globalSearchResults .history-hint')];
  assert.strictEqual(hints.length, 1, 'exactly one hint (the technique one — no sections were stubbed in this case)');
  assert.match(hints[0].textContent, /Showing 10 of 27 matching techniques/, `hint text must state the real 10-of-27 count, got: "${hints[0].textContent}"`);
});

test('REAL invocation: matching techniques AT OR UNDER the limit render with NO overflow hint', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, stubsFor(0, 6), `renderGlobalSearchResults('match');`]);
  const hits = document.querySelectorAll('#globalSearchResults .gsearch-hit[data-technique-card]');
  assert.strictEqual(hits.length, 6);
  const hint = document.querySelector('#globalSearchResults .history-hint');
  assert.strictEqual(hint, null);
});

test('REAL invocation: sections AND techniques can both overflow at once, each with its own correctly-numbered hint', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, stubsFor(15, 22), `renderGlobalSearchResults('match');`]);
  const hints = [...document.querySelectorAll('#globalSearchResults .history-hint')].map(h=> h.textContent);
  assert.ok(hints.some(t=> /Showing 10 of 15 matching sections/.test(t)), `expected a sections hint among: ${JSON.stringify(hints)}`);
  assert.ok(hints.some(t=> /Showing 10 of 22 matching techniques/.test(t)), `expected a techniques hint among: ${JSON.stringify(hints)}`);
});

// === PART 2: masterclass index freshness on the OPEN path ===================

const masterclassLibraryDeps = [
  'POSE_DETAILS', 'SWIM_STROKE_DETAILS', 'CLIMB_TECHNIQUE_DETAILS',
  'WATERSPORTS_TECHNIQUE_DETAILS', 'COMBAT_TECHNIQUE_DETAILS', 'GRAPPLE_TECHNIQUE_DETAILS',
  'OLY_TECHNIQUE_DETAILS', 'STRENGTH_TECHNIQUE_DETAILS', 'RUNNING_TECHNIQUE_DETAILS',
  'HYROX_TECHNIQUE_DETAILS', 'PILATES_TECHNIQUE_DETAILS', 'YOGA_TECHNIQUE_DETAILS',
  'CALISTHENICS_TECHNIQUE_DETAILS', 'CYCLING_TECHNIQUE_DETAILS',
].map(name => extractConst(src, name));

const masterclassChunks = [
  ...masterclassLibraryDeps,
  extractConst(src, 'MASTERCLASS_LIBRARY'),
  extractConst(src, 'PROGRAM_MASTERCLASS'),
  extractFunction(src, 'escapeHtml'),
  extractFunction(src, 'isProgramOwnedMasterclass'),
  extractFunction(src, 'isMasterclassOpen'),
  extractFunction(src, 'closeMasterclass'),
  extractFunction(src, 'openMasterclass'),
  extractFunction(src, 'toggleMasterclass'),
  extractFunction(src, 'renderMasterclassIndex'),
];

const masterclassBodyHtml =
  extractElementById(src, 'masterclassIndex') +
  extractElementById(src, 'swimStylesCard');

const masterclassGlobalsSetup = `
  var activeProgram = 'strength'; // NOT swimming — swimStylesCard must not be program-owned for this test
  window.requestAnimationFrame = function(fn){ fn(); };
  window.Element.prototype.scrollIntoView = function(){};
`;

function swimBtn(document){
  return document.getElementById('masterclassIndex').querySelector('[data-card="swimStylesCard"]');
}

test('REAL invocation: opening a masterclass FROM ITS OWN INDEX BUTTON immediately flips that button to the open state — no navigation away and back required', (assert)=>{
  const { document } = runJsdom(masterclassBodyHtml, masterclassGlobalsSetup,
    [...masterclassChunks, `renderMasterclassIndex();`]);

  const before = swimBtn(document);
  assert.ok(before, 'index must render a real button for swimStylesCard');
  assert.strictEqual(before.getAttribute('aria-expanded'), 'false', 'starts closed');
  assert.strictEqual(before.classList.contains('opened'), false);
  assert.strictEqual(before.querySelector('.mc-index-meta').textContent.trim(), '›', 'no "Open · tap to close" text yet (only the decorative chevron)');

  before.click(); // toggleMasterclass -> openMasterclass, since it starts closed

  assert.strictEqual(document.getElementById('swimStylesCard').style.display, '', 'the card itself must actually be open');

  // THE REGRESSION: re-query the index button fresh, since renderMasterclassIndex
  // (if it ran) replaced the whole #masterclassIndex subtree, including this node.
  const after = swimBtn(document);
  assert.ok(after, 'index button must still exist after opening');
  assert.strictEqual(after.getAttribute('aria-expanded'), 'true', 'BUG: opening a masterclass must flip its OWN index button to aria-expanded="true" immediately, not leave it stale until something else re-renders the index');
  assert.strictEqual(after.classList.contains('opened'), true, 'BUG: the "opened" class must apply immediately too');
  assert.match(after.querySelector('.mc-index-meta').textContent, /Open · tap to close/, 'BUG: the "Open · tap to close" meta text must appear immediately');
});

test('REAL invocation: closing that same masterclass (already-covered path, locked in as a regression guard) flips the button back to closed, still without navigating away', (assert)=>{
  const { document } = runJsdom(masterclassBodyHtml, masterclassGlobalsSetup,
    [...masterclassChunks, `renderMasterclassIndex(); openMasterclass('swimStylesCard');`]);

  const openBtn = swimBtn(document);
  assert.strictEqual(openBtn.getAttribute('aria-expanded'), 'true', 'setup: must actually be open first');

  openBtn.click(); // toggleMasterclass -> closeMasterclass, since it is now open and not program-owned

  assert.strictEqual(document.getElementById('swimStylesCard').style.display, 'none', 'the card itself must actually be closed');
  const closedBtn = swimBtn(document);
  assert.strictEqual(closedBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(closedBtn.classList.contains('opened'), false);
  assert.strictEqual(closedBtn.querySelector('.mc-index-meta').textContent.trim(), '›');
});

test('sabotage-relevant: openMasterclass contains exactly one real call to renderMasterclassIndex(), matching closeMasterclass\'s own existing call — not zero (the bug) and not merely mentioned in a comment', (assert)=>{
  const openSrc = extractFunction(src, 'openMasterclass');
  const closeSrc = extractFunction(src, 'closeMasterclass');
  assert.strictEqual(countCallSites(openSrc, 'renderMasterclassIndex'), 1,
    'openMasterclass must call renderMasterclassIndex() exactly once — this is the fix; it was 0 before');
  assert.strictEqual(countCallSites(closeSrc, 'renderMasterclassIndex'), 1,
    'closeMasterclass must still call renderMasterclassIndex() exactly once — the pre-existing behavior this fix mirrors');
});

run();
