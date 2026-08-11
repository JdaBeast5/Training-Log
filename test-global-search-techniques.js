'use strict';
// Behavioral coverage for extending global search (#globalSearchInput,
// renderGlobalSearchResults) to also match Learn's masterclass techniques —
// "Eskimo Roll", "Duck Dive", "Bottom Turn", and every other named technique
// buried inside WATERSPORTS_TECHNIQUE_DETAILS and its 13 sibling
// *_TECHNIQUE_DETAILS consts. Before this, searching any of those names
// returned nothing: not an exercise, not a section title, so neither of
// search's two existing branches ever found them.
//
// Three things get real coverage here, matching the three things that
// actually changed:
//   1. buildMasterclassTechniqueSearchIndex() — the new flattened index,
//      built from MASTERCLASS_LIBRARY's own (also new) `details` pointers
//      rather than a second hand-listed const.
//   2. renderGlobalSearchResults() — the real search function, extended with
//      a third "Techniques" result category alongside "Go to" and
//      "Exercises", exercised with a real query against real data.
//   3. openMasterclassTechnique() — what a technique hit actually DOES when
//      clicked: get to Learn, open the (possibly-closed) masterclass card,
//      expand the one matching technique, and leave every other technique on
//      that card untouched.
const { readIndexSource, extractConst, extractFunction, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-global-search-techniques.js');

// All fourteen *_TECHNIQUE_DETAILS-shaped consts MASTERCLASS_LIBRARY points
// at via `details:`. Listed once here because the object literal evaluates
// `details:CONST_NAME` immediately (unlike the lazy `render:()=>fn()`
// arrows), so every one of them must be a real, defined const for
// MASTERCLASS_LIBRARY itself to construct without a ReferenceError — this is
// NOT a second copy of the search index, just the dependency list a sandbox
// needs to build the same object the real app builds.
const TECHNIQUE_DETAIL_CONST_NAMES = [
  'POSE_DETAILS', 'SWIM_STROKE_DETAILS', 'CLIMB_TECHNIQUE_DETAILS',
  'WATERSPORTS_TECHNIQUE_DETAILS', 'COMBAT_TECHNIQUE_DETAILS', 'GRAPPLE_TECHNIQUE_DETAILS',
  'OLY_TECHNIQUE_DETAILS', 'STRENGTH_TECHNIQUE_DETAILS', 'RUNNING_TECHNIQUE_DETAILS',
  'HYROX_TECHNIQUE_DETAILS', 'PILATES_TECHNIQUE_DETAILS', 'YOGA_TECHNIQUE_DETAILS',
  'CALISTHENICS_TECHNIQUE_DETAILS', 'CYCLING_TECHNIQUE_DETAILS',
];
const detailConstChunks = TECHNIQUE_DETAIL_CONST_NAMES.map(name => extractConst(src, name));
const masterclassLibraryChunks = [...detailConstChunks, extractConst(src, 'MASTERCLASS_LIBRARY')];

// --- buildMasterclassTechniqueSearchIndex(): the pure index-building step ---

test('buildMasterclassTechniqueSearchIndex flattens every masterclass\'s real technique data, not a hand-copied subset', (assert)=>{
  const chunks = [...masterclassLibraryChunks, extractFunction(src, 'buildMasterclassTechniqueSearchIndex')];
  const [result] = runSandbox(chunks, `
    const idx = buildMasterclassTechniqueSearchIndex();
    // Independently recomputed from the raw consts, not from the function under
    // test — a sabotage that made the function return a truncated or stale list
    // would still show a real object here, so the count is the anchor.
    const expectedTotal = [
      POSE_DETAILS, SWIM_STROKE_DETAILS, CLIMB_TECHNIQUE_DETAILS, WATERSPORTS_TECHNIQUE_DETAILS,
      COMBAT_TECHNIQUE_DETAILS, GRAPPLE_TECHNIQUE_DETAILS, OLY_TECHNIQUE_DETAILS, STRENGTH_TECHNIQUE_DETAILS,
      RUNNING_TECHNIQUE_DETAILS, HYROX_TECHNIQUE_DETAILS, PILATES_TECHNIQUE_DETAILS, YOGA_TECHNIQUE_DETAILS,
      CALISTHENICS_TECHNIQUE_DETAILS, CYCLING_TECHNIQUE_DETAILS,
    ].reduce((sum, d)=> sum + Object.keys(d).length, 0);
    __capture.push({
      indexLength: idx.length,
      expectedTotal,
      eskimoRoll: idx.find(t=> t.name === 'The Eskimo Roll'),
      duckDive: idx.find(t=> t.name === 'Duck Dive'),
      bottomTurn: idx.find(t=> t.name === 'Bottom Turn'),
      everyRowHasARealCard: idx.every(t=> !!MASTERCLASS_LIBRARY[t.cardId]),
      distinctCardCount: new Set(idx.map(t=> t.cardId)).size,
    });
  `);
  assert.strictEqual(result.indexLength, result.expectedTotal,
    `index must contain exactly the ${result.expectedTotal} techniques across all fourteen consts, found ${result.indexLength}`);
  assert.ok(result.eskimoRoll, '"The Eskimo Roll" must be findable — the exact technique named in this feature\'s own spec');
  assert.strictEqual(result.eskimoRoll.cardId, 'watersportsTechniquesCard');
  assert.strictEqual(result.eskimoRoll.masterclassLabel, 'Watersports Techniques');
  assert.ok(result.duckDive, '"Duck Dive" must be findable');
  assert.strictEqual(result.duckDive.cardId, 'watersportsTechniquesCard');
  assert.ok(result.bottomTurn, '"Bottom Turn" must be findable');
  assert.strictEqual(result.everyRowHasARealCard, true, 'every row must point at a real MASTERCLASS_LIBRARY entry, not a stale/typo\'d cardId');
  assert.strictEqual(result.distinctCardCount, 14, 'techniques must be drawn from all 14 masterclasses, not just Watersports');
});

test('sabotage-relevant: MASTERCLASS_LIBRARY registers a real `details` pointer for all 14 cards, not label/render alone', (assert)=>{
  const chunks = [...masterclassLibraryChunks];
  const [result] = runSandbox(chunks, `
    __capture.push(Object.keys(MASTERCLASS_LIBRARY).map(cardId=> ({
      cardId,
      hasDetails: !!MASTERCLASS_LIBRARY[cardId].details,
      detailCount: MASTERCLASS_LIBRARY[cardId].details ? Object.keys(MASTERCLASS_LIBRARY[cardId].details).length : 0,
    })));
  `);
  assert.strictEqual(result.length, 14, 'sabotage-relevant anchor: exactly 14 masterclasses are registered');
  result.forEach(r=>{
    assert.strictEqual(r.hasDetails, true, `${r.cardId} must have a real details pointer`);
    assert.ok(r.detailCount > 0, `${r.cardId}'s details map must be non-empty`);
  });
});

// --- renderGlobalSearchResults(): the real search function, real query ------

// exerciseInfo/MUSCLE_GROUP_MAP are stubbed empty and collectSearchSections is
// stubbed to return [] — deliberately, to isolate the NEW behavior under test.
// Both are pre-existing, already-shipped branches of this same function that
// this change does not touch; stubbing them the way test-history-heatmap.js
// stubs fillHistoryMonth keeps this test about the technique branch specifically
// without pulling in and re-verifying the entire 300+ entry exercise library.
const searchFnChunks = [
  ...masterclassLibraryChunks,
  extractFunction(src, 'buildMasterclassTechniqueSearchIndex'),
  extractConst(src, 'GLOBAL_SEARCH_EXERCISE_LIMIT'),
  extractConst(src, 'GLOBAL_SEARCH_SECTION_LIMIT'),
  extractConst(src, 'GLOBAL_SEARCH_TECHNIQUE_LIMIT'),
  extractFunction(src, 'escapeHtml'),
  extractFunction(src, 'renderGlobalSearchResults'),
];
const searchStubGlobals = `
  var exerciseInfo = {};
  var MUSCLE_GROUP_MAP = {};
  function collectSearchSections(){ return []; }
`;

test('REAL invocation: renderGlobalSearchResults("eskimo roll") renders a real, actionable Techniques hit', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, `renderGlobalSearchResults('eskimo roll');`]);
  const groupLabel = document.querySelector('#globalSearchResults .gsearch-group');
  assert.ok(groupLabel && groupLabel.textContent === 'Techniques', 'a "Techniques" result group must render');
  const hits = [...document.querySelectorAll('#globalSearchResults .gsearch-hit[data-technique-card]')];
  assert.strictEqual(hits.length, 1, 'exactly one technique should match "eskimo roll"');
  assert.strictEqual(hits[0].dataset.techniqueCard, 'watersportsTechniquesCard');
  assert.strictEqual(hits[0].dataset.techniqueName, 'The Eskimo Roll');
  assert.match(hits[0].textContent, /The Eskimo Roll/);
  assert.match(hits[0].textContent, /Watersports Techniques/, 'the hit must show which masterclass it belongs to, matching how section hits show their tab');
});

test('REAL invocation: renderGlobalSearchResults("duck dive") finds the technique named in this feature\'s own spec', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, `renderGlobalSearchResults('duck dive');`]);
  const hit = document.querySelector('#globalSearchResults .gsearch-hit[data-technique-card]');
  assert.ok(hit, '"Duck Dive" must produce a result');
  assert.strictEqual(hit.dataset.techniqueName, 'Duck Dive');
  assert.strictEqual(hit.dataset.techniqueCard, 'watersportsTechniquesCard');
});

test('renderGlobalSearchResults still shows the "nothing matches" empty state for a query that hits nothing at all', (assert)=>{
  const { document } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, `renderGlobalSearchResults('zzz-not-a-real-anything-zzz');`]);
  const el = document.getElementById('globalSearchResults');
  assert.match(el.innerHTML, /Nothing matches/, 'the three-way empty gate (sections/exercises/techniques all empty) must still work with the new third category added');
});

test('renderGlobalSearchResults caps technique results at GLOBAL_SEARCH_TECHNIQUE_LIMIT', (assert)=>{
  // A broad single-letter query matches many techniques across many
  // masterclasses (there are well over 10 techniques with an "e" in the
  // name) — a real over-the-limit case, not a synthetic one.
  const { document, window } = runJsdom('<div id="globalSearchResults"></div>', searchStubGlobals,
    [...searchFnChunks, `renderGlobalSearchResults('e');`]);
  const hits = document.querySelectorAll('#globalSearchResults .gsearch-hit[data-technique-card]');
  assert.ok(hits.length <= 10, `must not exceed GLOBAL_SEARCH_TECHNIQUE_LIMIT (10), found ${hits.length}`);
  assert.ok(hits.length > 0, 'a single common letter must still match at least one real technique');
});

// --- openMasterclassTechnique(): the click -> navigate -> open -> expand ----

test('REAL invocation: openMasterclassTechnique gets to Learn, opens the masterclass card, and expands exactly the matching technique — no others', (assert)=>{
  const fnChunks = [
    ...masterclassLibraryChunks,
    extractConst(src, 'PROGRAM_MASTERCLASS'),
    extractConst(src, 'WATERSPORTS_ICONS'),
    extractConst(src, 'WATERSPORTS_TECHNIQUE_GROUPS'),
    extractFunction(src, 'renderWatersportsTechniques'),
    extractFunction(src, 'isProgramOwnedMasterclass'),
    extractFunction(src, 'isMasterclassOpen'),
    extractFunction(src, 'openMasterclass'),
    extractFunction(src, 'openMasterclassTechnique'),
  ];
  const bodyHtml = `<div class="card" id="watersportsTechniquesCard" style="display:none"><div id="watersportsTechniquesList"></div></div>`;
  const globalsSetup = `
    var activeProgram = 'strength'; // deliberately NOT watersports — search must reach a card you are not currently training
    window.__showViewCalls = [];
    window.showView = function(view, opts){ window.__showViewCalls.push({view, opts}); };
    window.requestAnimationFrame = function(fn){ fn(); }; // jsdom has no native rAF; runs synchronously so the nested double-rAF chain resolves within this call
    window.__scrollCalls = [];
    window.Element.prototype.scrollIntoView = function(){ window.__scrollCalls.push(this); };
  `;
  const { document, window } = runJsdom(bodyHtml, globalsSetup, [...fnChunks, `openMasterclassTechnique('watersportsTechniquesCard', 'The Eskimo Roll');`]);

  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(window.__showViewCalls)),
    [{view: 'learn', opts: {scrollTop: false}}],
    'must switch to Learn without also forcing scroll-to-top, matching updateMasterclassLinkBtn/goToCareArea\'s own convention'
  );

  const card = document.getElementById('watersportsTechniquesCard');
  assert.notStrictEqual(card.style.display, 'none', 'the masterclass card must be shown even though it is not the active program\'s own card');
  assert.ok(document.querySelectorAll('#watersportsTechniquesList details.pose-detail-wrap').length > 0, 'the card must actually be rendered (openMasterclass\'s render() step), not just unhidden');

  const nameEls = [...document.querySelectorAll('#watersportsTechniquesCard .pose-name')];
  const target = nameEls.find(el => el.textContent.trim() === 'The Eskimo Roll');
  assert.ok(target, 'the real rendered technique row must exist');
  const targetRow = target.closest('details.pose-detail-wrap');
  const targetGroup = target.closest('details.posing-class');
  assert.strictEqual(targetRow.open, true, 'the matching technique\'s own <details> must be expanded');
  assert.strictEqual(targetGroup.open, true, 'its parent group must also be expanded — a closed group hides an "open" child regardless of the child\'s own state');

  // Sabotage-relevant: prove this opens ONE row, not every row on the card.
  const otherRow = nameEls.find(el => el.textContent.trim() === 'Duck Dive').closest('details.pose-detail-wrap');
  assert.notStrictEqual(otherRow.open, true, 'an unrelated technique on the same card must stay closed');

  assert.strictEqual(window.__scrollCalls.length, 2, 'must scroll twice: once to the card (openMasterclass\'s own behavior) and once refined to the specific technique row');
  assert.strictEqual(window.__scrollCalls[0].id, 'watersportsTechniquesCard', 'first scroll is openMasterclass\'s own card-level scroll');
  assert.ok(window.__scrollCalls[1].classList.contains('pose-detail-wrap'), 'second scroll must target the specific technique\'s <details>, not the card again');
});

run();
