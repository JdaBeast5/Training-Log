'use strict';
// Behavioral coverage for the render*Techniques()/render*Styles()/render*Classes()
// consolidation: 13 of the 14 Learn-tab masterclass card renderers (all
// EXCEPT renderWatersportsTechniques — see the block comment on
// MASTERCLASS_LIBRARY in index.html for why that one specifically stays a
// full standalone implementation) were near-identical hand-written functions
// that now delegate to one shared renderMasterclassTechniques(cardId), driven
// entirely by per-card config added to MASTERCLASS_LIBRARY (listElId, groups,
// icon, itemNoun, fallbackQuerySuffix).
//
// This suite proves the shared function renders correctly for masterclasses
// drawn from genuinely different corners of the config space, not just one
// happy path:
//   - swimStylesCard:    per-technique icon lookup, "drill" noun (not "technique")
//   - combatTechniquesCard: per-technique icon lookup, "technique" noun
//   - pilatesTechniquesCard: ONE FIXED CATEGORY_ICONS icon (not per-technique), "technique" noun
//   - posingCard:        per-technique icon lookup, "pose" noun (not "technique")
// plus a real-invocation call-site count (sabotage-relevant: exactly 13 real
// calls to renderMasterclassTechniques(, one per wrapper — the 14th
// occurrence in the source is the function's own declaration, which
// countCallSites deliberately excludes) and a sabotage test that corrupts one
// card's wiring in a cloned copy of the real MASTERCLASS_LIBRARY source and
// confirms the render actually breaks (proving these assertions exercise the
// real wiring, not a self-fulfilling fixture), then restores it and diffs
// byte-for-byte against the pre-sabotage source to confirm the sabotage never
// touched the real file.
const { readIndexSource, extractConst, extractFunction, countCallSites, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-masterclass-technique-render-consolidation.js');

// Every *_TECHNIQUE_DETAILS-shaped const MASTERCLASS_LIBRARY's `details:`
// field references eagerly (unlike the lazy `render:()=>fn()`/`groups:()=>...`
// /`icon:()=>...` fields) — all 14 must be present for the object literal to
// construct without a ReferenceError, exactly as test-global-search-techniques.js
// already established for the same reason.
const DETAIL_CONST_NAMES = [
  'POSE_DETAILS', 'SWIM_STROKE_DETAILS', 'CLIMB_TECHNIQUE_DETAILS',
  'WATERSPORTS_TECHNIQUE_DETAILS', 'COMBAT_TECHNIQUE_DETAILS', 'GRAPPLE_TECHNIQUE_DETAILS',
  'OLY_TECHNIQUE_DETAILS', 'STRENGTH_TECHNIQUE_DETAILS', 'RUNNING_TECHNIQUE_DETAILS',
  'HYROX_TECHNIQUE_DETAILS', 'PILATES_TECHNIQUE_DETAILS', 'YOGA_TECHNIQUE_DETAILS',
  'CALISTHENICS_TECHNIQUE_DETAILS', 'CYCLING_TECHNIQUE_DETAILS',
];
const detailConstChunks = DETAIL_CONST_NAMES.map(name => extractConst(src, name));

// The groups/icons consts actually invoked (lazily) by the four masterclasses
// under test here.
const baseChunks = [
  ...detailConstChunks,
  extractConst(src, 'CATEGORY_ICONS'),
  extractConst(src, 'SWIM_STROKES'),
  extractConst(src, 'SWIM_ICONS'),
  extractConst(src, 'COMBAT_TECHNIQUE_GROUPS'),
  extractConst(src, 'COMBAT_ICONS'),
  extractConst(src, 'PILATES_TECHNIQUE_GROUPS'),
  extractConst(src, 'POSING_CLASSES'),
  extractConst(src, 'POSE_ICONS'),
  extractConst(src, 'MASTERCLASS_LIBRARY'),
  extractFunction(src, 'renderMasterclassTechniques'),
];

function expectedCounts(groupsObj){
  const groupCount = Object.keys(groupsObj).length;
  const itemCount = Object.values(groupsObj).reduce((sum, g)=> sum + g.poses.length, 0);
  return { groupCount, itemCount };
}

test('sabotage-relevant: exactly 13 real call sites of renderMasterclassTechniques( — one per thin wrapper, not the 14th (renderWatersportsTechniques, deliberately excluded) and not the declaration itself', (assert)=>{
  const count = countCallSites(src, 'renderMasterclassTechniques');
  assert.strictEqual(count, 13, `expected exactly 13 real calls (14 render*/toggle* functions minus the one deliberately-excluded renderWatersportsTechniques), found ${count}`);
});

test('REAL invocation: renderMasterclassTechniques("swimStylesCard") renders every stroke/drill with a per-technique icon and the "drill" noun (not "technique")', (assert)=>{
  const { document } = runJsdom(
    '<div id="swimStylesList"></div>',
    '',
    [...baseChunks, `renderMasterclassTechniques('swimStylesCard');`]
  );
  const expected = expectedCounts(JSON.parse(JSON.stringify(require('vm').runInNewContext(
    '(' + extractConst(src, 'SWIM_STROKES').replace(/^const\s+SWIM_STROKES\s*=\s*/, '').replace(/;\s*$/, '') + ')'
  ))));
  const groupEls = document.querySelectorAll('#swimStylesList details.posing-class');
  assert.strictEqual(groupEls.length, expected.groupCount, `expected ${expected.groupCount} stroke groups`);
  const itemEls = document.querySelectorAll('#swimStylesList details.pose-detail-wrap');
  assert.strictEqual(itemEls.length, expected.itemCount, `expected all ${expected.itemCount} drills rendered`);
  assert.match(groupEls[0].querySelector('summary').textContent, /\d+ drills?\b/, 'swim must use the "drill" noun, not "technique" — this is the one thing that made swimStylesCard NOT a drop-in copy of the other 12');
  const firstIcon = document.querySelector('#swimStylesList .pose-icon svg');
  assert.ok(firstIcon, 'swimStylesCard uses per-technique icons (SWIM_ICONS[detail.icon]) — a real <svg> must render, not an empty div');
  const firstLink = document.querySelector('#swimStylesList .ex-video-link');
  assert.match(firstLink.getAttribute('href'), /^https:\/\/www\.youtube\.com\/results\?search_query=/);
});

test('REAL invocation: renderMasterclassTechniques("combatTechniquesCard") renders every style/technique with a per-technique icon and the "technique" noun', (assert)=>{
  const { document } = runJsdom(
    '<div id="combatTechniquesList"></div>',
    '',
    [...baseChunks, `renderMasterclassTechniques('combatTechniquesCard');`]
  );
  const expected = expectedCounts(JSON.parse(JSON.stringify(require('vm').runInNewContext(
    '(' + extractConst(src, 'COMBAT_TECHNIQUE_GROUPS').replace(/^const\s+COMBAT_TECHNIQUE_GROUPS\s*=\s*/, '').replace(/;\s*$/, '') + ')'
  ))));
  const groupEls = document.querySelectorAll('#combatTechniquesList details.posing-class');
  assert.strictEqual(groupEls.length, expected.groupCount, `expected ${expected.groupCount} combat style groups`);
  const itemEls = document.querySelectorAll('#combatTechniquesList details.pose-detail-wrap');
  assert.strictEqual(itemEls.length, expected.itemCount, `expected all ${expected.itemCount} combat techniques rendered`);
  assert.match(groupEls[0].querySelector('summary').textContent, /\d+ techniques?\b/, 'combat must use the "technique" noun');
  const firstIcon = document.querySelector('#combatTechniquesList .pose-icon svg');
  assert.ok(firstIcon, 'combatTechniquesCard also uses per-technique icons (COMBAT_ICONS[detail.icon])');
});

test('REAL invocation: renderMasterclassTechniques("pilatesTechniquesCard") renders every technique with ONE FIXED CATEGORY_ICONS.core icon on every row, not a per-technique lookup', (assert)=>{
  const { document } = runJsdom(
    '<div id="pilatesTechniquesList"></div>',
    '',
    [...baseChunks, `renderMasterclassTechniques('pilatesTechniquesCard');`]
  );
  const expected = expectedCounts(JSON.parse(JSON.stringify(require('vm').runInNewContext(
    '(' + extractConst(src, 'PILATES_TECHNIQUE_GROUPS').replace(/^const\s+PILATES_TECHNIQUE_GROUPS\s*=\s*/, '').replace(/;\s*$/, '') + ')'
  ))));
  const itemEls = document.querySelectorAll('#pilatesTechniquesList details.pose-detail-wrap');
  assert.strictEqual(itemEls.length, expected.itemCount, `expected all ${expected.itemCount} Pilates techniques rendered`);
  const iconHtmls = [...document.querySelectorAll('#pilatesTechniquesList .pose-icon')].map(el=> el.innerHTML);
  assert.ok(iconHtmls.length >= 2, 'sabotage-relevant: need at least 2 rows to prove the icon is genuinely fixed, not coincidentally identical for one row');
  const allSame = iconHtmls.every(h=> h === iconHtmls[0]);
  assert.strictEqual(allSame, true, 'every row on pilatesTechniquesCard must render the exact same fixed CATEGORY_ICONS.core icon — this is the shape-B branch of the shared function (icon.mode === "fixed"), distinct from swim/combat above');
});

test('REAL invocation: renderMasterclassTechniques("posingCard") renders every bodybuilding class/pose with the "pose" noun (not "technique"), matching the original renderPosingClasses exactly', (assert)=>{
  const { document } = runJsdom(
    '<div id="posingClassList"></div>',
    '',
    [...baseChunks, `renderMasterclassTechniques('posingCard');`]
  );
  const expected = expectedCounts(JSON.parse(JSON.stringify(require('vm').runInNewContext(
    '(' + extractConst(src, 'POSING_CLASSES').replace(/^const\s+POSING_CLASSES\s*=\s*/, '').replace(/;\s*$/, '') + ')'
  ))));
  const groupEls = document.querySelectorAll('#posingClassList details.posing-class');
  assert.strictEqual(groupEls.length, expected.groupCount, `expected ${expected.groupCount} posing classes`);
  const itemEls = document.querySelectorAll('#posingClassList details.pose-detail-wrap');
  assert.strictEqual(itemEls.length, expected.itemCount, `expected all ${expected.itemCount} poses rendered`);
  assert.match(groupEls[0].querySelector('summary').textContent, /\d+ poses?\b/, 'posing must use the "pose" noun, matching the pre-consolidation renderPosingClasses source exactly');
});

test('the four masterclasses above render into fully independent DOM — no cross-contamination between cards sharing the one function', (assert)=>{
  const { document } = runJsdom(
    '<div id="swimStylesList"></div><div id="combatTechniquesList"></div><div id="pilatesTechniquesList"></div><div id="posingClassList"></div>',
    '',
    [
      ...baseChunks,
      `renderMasterclassTechniques('swimStylesCard');`,
      `renderMasterclassTechniques('combatTechniquesCard');`,
      `renderMasterclassTechniques('pilatesTechniquesCard');`,
      `renderMasterclassTechniques('posingCard');`,
    ]
  );
  const swimNames = [...document.querySelectorAll('#swimStylesList .pose-name')].map(el=> el.textContent);
  const combatNames = [...document.querySelectorAll('#combatTechniquesList .pose-name')].map(el=> el.textContent);
  assert.ok(swimNames.length > 0 && combatNames.length > 0, 'both cards must have actually rendered content');
  const overlap = swimNames.filter(n=> combatNames.includes(n));
  assert.deepStrictEqual(overlap, [], 'swim drills and combat techniques must not leak into each other\'s lists — each call must only ever touch its own #<id>List element');
});

test('sabotage: corrupting one masterclass\'s listElId in a CLONED copy of the real MASTERCLASS_LIBRARY source breaks that card\'s render, proving the assertions above exercise the real wiring — then confirms the real file was never touched', (assert)=>{
  const realLibSrc = extractConst(src, 'MASTERCLASS_LIBRARY');
  assert.ok(realLibSrc.includes(`listElId:'swimStylesList'`), 'sanity: the real source must contain the exact field this sabotage targets');

  const sabotagedLibSrc = realLibSrc.replace(`listElId:'swimStylesList'`, `listElId:'thisIdDoesNotExistAnywhere'`);
  assert.notStrictEqual(sabotagedLibSrc, realLibSrc, 'the sabotage must have actually changed something');

  const sabotagedChunks = [
    ...detailConstChunks,
    extractConst(src, 'CATEGORY_ICONS'),
    extractConst(src, 'SWIM_STROKES'),
    extractConst(src, 'SWIM_ICONS'),
    sabotagedLibSrc,
    extractFunction(src, 'renderMasterclassTechniques'),
  ];
  const { document } = runJsdom(
    '<div id="swimStylesList"></div>',
    '',
    [...sabotagedChunks, `renderMasterclassTechniques('swimStylesCard');`]
  );
  const rows = document.querySelectorAll('#swimStylesList details.pose-detail-wrap');
  assert.strictEqual(rows.length, 0, 'with a wrong listElId, renderMasterclassTechniques must find no matching element and render nothing — proving the earlier passing tests actually depend on the real listElId wiring, not a fixture that would pass regardless');

  // Confirm the sabotage was purely local to this test's in-memory string and
  // never touched the real file on disk.
  const freshSrc = readIndexSource();
  assert.strictEqual(freshSrc, src, 'the real index.html on disk must be byte-for-byte unchanged by this sabotage test');
});

run();
