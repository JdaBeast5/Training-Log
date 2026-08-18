'use strict';
// Behavioral coverage for the always-visible 3-5 sentence program/style
// overview shown directly under the Training Style selector (and under each
// of the 5 style selectors it contains — Combat, Cycling, Watersports, Yoga,
// Medical) — added so someone can tell whether a program fits their goals
// without first tapping the "Training Style" header open to read the old
// one-line `short` description.
//
// Two kinds of coverage:
//   1. DATA completeness — every one of the 55 programs/styles has a real,
//      substantial overview, genuinely distinct from its existing one-line
//      `short` field (not a copy-paste), long enough to plausibly be 3-5
//      sentences. Sandbox-only, no DOM.
//   2. REAL DOM invocation — the actual renderProgramSelector (top-level)
//      and renderMartialArtSelector (representative of the 5 identical
//      style-selector functions — see the shared-pattern comment in
//      index.html above the keydown listener for why one is representative)
//      really write the real overview text into the real #programOverview /
//      #martialArtOverview elements, on both initial render and on a style
//      change — not a reimplementation of that logic.
const {
  readIndexSource, extractConst, extractFunction, extractElementById,
  runSandbox, runJsdom, makeRunner,
} = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-program-overview.js');

// --- 1. Data completeness -------------------------------------------------

test('sabotage-relevant: every one of the 55 real programs/styles has a real overview — 25 top-level programs, 30 styles across the 5 containers, zero gaps', (assert)=>{
  const chunks = [
    extractConst(src, 'programs'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'), extractFunction(src, 'isCustomProgramKey'),
    extractConst(src, 'COMBAT_STYLES'), extractConst(src, 'CYCLING_STYLES'),
    extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'YOGA_STYLES'), extractConst(src, 'MEDICAL_STYLES'),
  ];
  const [result] = runSandbox(chunks, `
    const progKeys = Object.keys(programs).filter(k=> !isCustomProgramKey(k));
    const styleSets = [COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES, MEDICAL_STYLES];
    const allEntries = [
      ...progKeys.map(k=> ({ set:'programs', key:k, entry: programs[k] })),
      ...styleSets.flatMap(obj=> Object.keys(obj).map(k=> ({ set:'style', key:k, entry: obj[k] }))),
    ];
    const missingEntries = allEntries.filter(e=> !e.entry.overview || typeof e.entry.overview !== 'string');
    const missingKeys = new Set(missingEntries.map(e=> e.set+'.'+e.key));
    // Every check below this line only runs against entries that actually
    // HAVE an overview string — a missing field is reported once, cleanly,
    // by the 'missing' check itself, rather than also crashing the
    // length/sentence checks on undefined.length further down.
    const present = allEntries.filter(e=> !missingKeys.has(e.set+'.'+e.key));
    __capture.push({
      count: allEntries.length,
      missing: [...missingKeys],
      // A regression that reverts overview to just repeat the short field
      // would pass a naive "is it set" check — this catches that specifically.
      sameAsShort: present.filter(e=> e.entry.overview === e.entry.short).map(e=> e.set+'.'+e.key),
      tooShort: present.filter(e=> e.entry.overview.length < 200).map(e=> e.set+'.'+e.key+' ('+e.entry.overview.length+' chars)'),
      // Rough 3-5-sentence check: count '. ' / '? ' / '! ' plus a trailing
      // terminator. Not exact prose-parsing, but catches a one-liner or a
      // wall of 10+ sentences either way.
      sentenceCountOutOfRange: present.filter(e=>{
        const n = (e.entry.overview.match(/[.!?](\\s|$)/g) || []).length;
        return n < 3 || n > 6; // 6 not 5, to tolerate a "Dr." or "e.g." style abbreviation without false-failing
      }).map(e=> e.set+'.'+e.key),
    });
  `);
  assert.strictEqual(result.count, 55, 'expected exactly 55 programs+styles — a different count means the extraction broke or the data shape changed, not that entries vanished on purpose');
  assert.deepStrictEqual(result.missing, [], 'every program/style must have a real overview string');
  assert.deepStrictEqual(result.sameAsShort, [], 'overview must never just duplicate the one-line `short` field — that would defeat the entire point of adding it');
  assert.deepStrictEqual(result.tooShort, [], 'an overview under 200 chars is not plausibly 3-5 real sentences');
  assert.deepStrictEqual(result.sentenceCountOutOfRange, [], 'every overview should read as roughly 3-5 sentences, not one line or a wall of text');
});

// --- 2. Real DOM: top-level program selector ------------------------------

function topLevelHarness(){
  const bodyHtml = `
    <select id="programSelector"></select>
    <div id="programSelectDesc"></div>
    <div id="programOverview"></div>
    <div id="programSourceNote"></div>
    <button id="viewMasterclassBtn" style="display:none"></button>
    <div id="customProgList"></div>
  `;
  const noop = ()=>{};
  const globals = `
    window.activeProgram = 'strength';
    window.userProfile = {};
    window.storage = { set: async ()=>{} };
    async function scoreAllPrograms(){ return {}; }
    function renderProgramSource(){}
    function renderCustomProgramList(){}
    function togglePosingCard(){} function toggleMartialArtCard(){} function toggleCyclingCard(){}
    function toggleWatersportsCard(){} function toggleMedicalCard(){} function toggleYogaCard(){}
    function toggleSwimStylesCard(){} function toggleClimbTechniquesCard(){} function toggleWatersportsTechniquesCard(){}
    function toggleCombatTechniquesCard(){} function toggleGrappleTechniquesCard(){} function toggleOlyTechniquesCard(){}
    function toggleStrengthTechniquesCard(){} function toggleRunningTechniquesCard(){} function toggleHyroxTechniquesCard(){}
    function togglePilatesTechniquesCard(){} function toggleYogaTechniquesCard(){} function toggleCalisthenicsTechniquesCard(){}
    function toggleCyclingTechniquesCard(){}
    function renderTips(){}
    function updateMasterclassLinkBtn(){}
  `;
  return runJsdom(bodyHtml, globals, [
    extractConst(src, 'programs'),
    // jsdom's top-level `const` bindings don't become window properties (a
    // classic-script quirk — only `var`/function declarations do), so this
    // bridges them explicitly for the test's own assertions to read back.
    `window.programs = programs;`,
    extractConst(src, 'CUSTOM_PROGRAM_PREFIX'),
    extractFunction(src, 'isCustomProgramKey'),
    extractFunction(src, 'renderProgramSelector'),
    // renderProgramSelector is async (awaits scoreAllPrograms) — runJsdom
    // itself is synchronous, so without stashing the real promise here the
    // test would inspect the DOM before the post-await lines (including the
    // overviewEl write) ever ran.
    `window.__renderDone = renderProgramSelector();`,
  ]);
}

test('REAL invocation: renderProgramSelector writes the REAL active program\'s overview into #programOverview on initial render', async (assert)=>{
  const { document, window } = topLevelHarness();
  await window.__renderDone;
  const overviewEl = document.getElementById('programOverview');
  assert.ok(overviewEl.textContent.length > 200, 'the real strength overview must actually be written, not left empty');
  assert.strictEqual(overviewEl.textContent, window.programs.strength.overview, 'must be the exact real overview text for the active program, not a paraphrase or the short field');
});

// --- 3. Real DOM: a representative style selector (Martial Art / Combat) --
// Structurally identical to renderCyclingSelector/renderWatersportsSelector/
// renderYogaSelector/renderMedicalSelector (same descEl+overviewEl pattern,
// same el.onchange shape) — see the Python insertion script's ENTRIES list
// and the shared comment above index.html's delegated keydown listener.
// Testing this one is representative rather than redundant with the other 4.

function martialArtHarness(){
  const bodyHtml = `
    <select id="martialArtSelector"></select>
    <div id="martialArtDesc"></div>
    <div id="martialArtOverview"></div>
  `;
  const globals = `
    window.activeMartialArt = 'kickboxing';
    // Deliberately NOT 'combat', so the onchange handler's
    // if(activeProgram === 'combat') block (day-order/tabs/workout
    // re-render — unrelated to what this test covers) never runs, and
    // doesn't need its own pile of stubs.
    window.activeProgram = 'strength';
    window.programs = { combat: { days: {} } };
    window.storage = { set: async ()=>{} };
    function renderProgramSource(){}
    async function saveMartialArtStyle(){}
  `;
  return runJsdom(bodyHtml, globals, [
    extractConst(src, 'COMBAT_STYLES'),
    `window.COMBAT_STYLES = COMBAT_STYLES;`, // see topLevelHarness's identical comment on why this bridge is needed
    extractFunction(src, 'renderMartialArtSelector'),
    `renderMartialArtSelector();`,
  ]);
}

test('REAL invocation: renderMartialArtSelector writes the REAL active style\'s overview on initial render, and updates it on a real style change', async (assert)=>{
  const { document, window } = martialArtHarness();
  const overviewEl = document.getElementById('martialArtOverview');
  assert.strictEqual(overviewEl.textContent, window.COMBAT_STYLES.kickboxing.overview, 'initial render must show the real Kickboxing overview');

  const select = document.getElementById('martialArtSelector');
  select.value = 'boxing';
  select.dispatchEvent(new window.Event('change'));
  await new Promise(res => setTimeout(res, 20)); // el.onchange is async

  assert.strictEqual(overviewEl.textContent, window.COMBAT_STYLES.boxing.overview, 'switching styles must update the overview to the newly selected style\'s real text');
  assert.notStrictEqual(overviewEl.textContent, window.COMBAT_STYLES.kickboxing.overview, 'must not still show the previous style\'s overview');
});

run();
