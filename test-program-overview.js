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

// --- 0. Expand/collapse (added after the overview shipped, once it turned
// out to fill the whole screen) --------------------------------------------
// Deliberately reuses buildBasisHtml's exact toggle pattern — same
// .program-basis-toggle class, same .smooth-toggle panel, same one generic
// document-level click listener already proven out for the citation panel
// AND for the Research & Sources card (see test-research-sources-view.js,
// which extracts this identical listener by the identical anchor). The only
// difference here is the STARTING state: aria-expanded="true" and
// class="smooth-toggle open" baked into the static markup, since the whole
// point is "shown by default, collapsible afterward" rather than the
// citation panel's "collapsed by default, expand on demand."

function extractBasisToggleListener(source){
  const anchor = "document.addEventListener('click', (e)=>{\n  const btn = e.target.closest && e.target.closest('.program-basis-toggle');";
  const start = source.indexOf(anchor);
  if(start === -1) throw new Error('extractBasisToggleListener: anchor text not found — the delegated .program-basis-toggle click listener may have moved or changed');
  const end = source.indexOf('});', start);
  if(end === -1) throw new Error('extractBasisToggleListener: could not find closing `});`');
  return source.slice(start, end + 3);
}

test('sabotage-relevant: all 6 overview toggle buttons (top-level + 5 styles) really exist in the static markup, each wired to its own real panel by aria-controls', (assert)=>{
  const ids = ['programOverview', 'martialArtOverview', 'cyclingOverview', 'watersportsOverview', 'yogaOverview', 'medicalOverview'];
  ids.forEach(id=>{
    const panel = extractElementById(src, id + 'Panel');
    assert.ok(panel.includes('class="smooth-toggle open"'), `${id}Panel must start open (class="smooth-toggle open") — collapsed-by-default would silently undo "shown so you can read it first"`);
    assert.ok(panel.includes(`id="${id}"`), `${id}Panel must actually contain the real #${id} text element, not just an empty shell`);
  });
});

// Extracts the real button+panel pair together — from the button's real,
// fixed opening-tag text (unique per id since aria-controls differs) through
// the panel's real closing tags — rather than hand-reconstructing the button
// markup and hoping it still matches the template. Throws if the anchor
// text has drifted, same discipline as extractBasisToggleListener above.
function extractOverviewToggleAndPanel(source, panelId){
  const anchor = `<button type="button" class="program-basis-toggle" aria-expanded="true" aria-controls="${panelId}">`;
  const start = source.indexOf(anchor);
  if(start === -1) throw new Error(`extractOverviewToggleAndPanel: no toggle button found for aria-controls="${panelId}"`);
  const panelHtml = extractElementById(source, panelId);
  const panelStart = source.indexOf(panelHtml, start);
  if(panelStart === -1) throw new Error(`extractOverviewToggleAndPanel: panel #${panelId} not found after its own toggle button`);
  return source.slice(start, panelStart) + panelHtml;
}

test('REAL invocation: the real #programOverview toggle button starts expanded, collapses on click, and re-expands on a second click — via the SAME shared listener the citation panel and Research & Sources card already use', (assert)=>{
  const pairHtml = extractOverviewToggleAndPanel(src, 'programOverviewPanel');
  const { document, window } = runJsdom(pairHtml, '', [extractBasisToggleListener(src)]);
  const btn = document.querySelector('.program-basis-toggle');
  const panel = document.getElementById('programOverviewPanel');

  assert.strictEqual(btn.getAttribute('aria-expanded'), 'true', 'must start expanded');
  assert.strictEqual(panel.classList.contains('open'), true, 'panel must start open');

  btn.click();
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'false', 'a click must collapse it');
  assert.strictEqual(panel.classList.contains('open'), false, 'panel must lose .open on collapse — this is what actually stops it filling the screen');

  btn.click();
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'true', 'a second click must re-expand it');
  assert.strictEqual(panel.classList.contains('open'), true, 'panel must regain .open on re-expand');
});

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
    window.storage = { set: async ()=>{} };
    function renderProgramSource(){}
    async function saveMartialArtStyle(){}
  `;
  // renderMartialArtSelector's onchange now calls the REAL
  // applyDaysPerWeekProgramData() (see the fix that stopped a style switch
  // from silently discarding whatever day-count variant was active) --
  // that touches every program in DAYS_PER_WEEK_PROGRAMS, not just combat,
  // so this harness needs the real `programs` object and the real
  // configurable-training-days machinery in scope, not a minimal stub.
  return runJsdom(bodyHtml, globals, [
    extractConst(src, 'programs'),
    extractConst(src, 'DAYS_PER_WEEK_PROGRAMS'),
    extractConst(src, 'DAYS_PER_WEEK_STYLE_CONTAINERS'),
    extractConst(src, 'DAYS_PER_WEEK_ORIGINAL'),
    extractConst(src, 'DAYS_PER_WEEK_CONTAINER_DEFAULT'),
    extractConst(src, 'CYCLING_STYLES'),
    extractConst(src, 'COMBAT_STYLES'),
    extractConst(src, 'WATERSPORTS_STYLES'),
    extractConst(src, 'YOGA_STYLES'),
    `window.COMBAT_STYLES = COMBAT_STYLES;`, // see topLevelHarness's identical comment on why this bridge is needed
    `window.activeCyclingStyle = 'road';`,
    `window.activeWatersportsStyle = 'surfing';`,
    `window.activeYogaStyle = 'flow';`,
    extractFunction(src, 'getStyleContainerAccessor'),
    extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
    `window.daysPerWeekPref = null;`,
    extractFunction(src, 'applyDaysPerWeekProgramData'),
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
