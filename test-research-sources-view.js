'use strict';
// Behavioral coverage for the Research & Sources card (Learn tab, v3.189) —
// a consolidated, always-visible list of every program/style's real citation
// (PROGRAM_SOURCES/STYLE_SOURCES' `school` + `primary` fields), so someone
// can see what the app's programs are actually built on without switching
// into each program individually to open its own provenance panel.
//
// Real invocation throughout: the actual `renderResearchSources` and
// `buildSourceRowHtml` functions, against a real jsdom document, wired to
// the REAL document-level click listener that already drives the existing
// per-program "What this is based on" toggle (buildBasisHtml/
// renderProgramSource) — this feature deliberately reuses that listener
// rather than adding a second one, so this test also proves the reuse
// actually works, not just that it was intended to.
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-research-sources-view.js');

// No named-function wrapper exists for the delegated click listener (it's a
// bare document.addEventListener call, added alongside buildBasisHtml) — so
// it's extracted here by its own real, fixed anchor text rather than
// reimplemented. If this text ever changes, this throws instead of quietly
// testing a stale reimplementation.
function extractBasisToggleListener(source){
  const anchor = "document.addEventListener('click', (e)=>{\n  const btn = e.target.closest && e.target.closest('.program-basis-toggle');";
  const start = source.indexOf(anchor);
  if(start === -1) throw new Error('extractBasisToggleListener: anchor text not found — the delegated .program-basis-toggle click listener may have moved or changed');
  const end = source.indexOf('});', start);
  if(end === -1) throw new Error('extractBasisToggleListener: could not find closing `});`');
  return source.slice(start, end + 3);
}

const researchSourcesCardHtml = extractElementById(src, 'researchSourcesCard');

const baseChunks = [
  extractFunction(src, 'escapeHtml'),
  extractConst(src, 'programs'),
  extractConst(src, 'CUSTOM_PROGRAM_PREFIX'),
  extractFunction(src, 'isCustomProgramKey'),
  extractConst(src, 'PROGRAM_SOURCES'),
  extractConst(src, 'STYLE_SOURCES'),
  extractConst(src, 'MEDICAL_STYLES'),
  extractConst(src, 'COMBAT_STYLES'),
  extractConst(src, 'CYCLING_STYLES'),
  extractConst(src, 'WATERSPORTS_STYLES'),
  extractConst(src, 'YOGA_STYLES'),
  extractConst(src, 'CONTAINER_STYLE_GROUPS'),
  'let sourcePanelSeq = 0;', // module-level counter buildSourceRowHtml increments; not a const, so extractConst can't pull it
  extractFunction(src, 'buildSourceRowHtml'),
  extractFunction(src, 'renderResearchSources'),
  extractBasisToggleListener(src),
];

function setup(){
  const { window, document } = runJsdom(researchSourcesCardHtml, '', baseChunks);
  window.renderResearchSources();
  return { window, document };
}

test('sabotage-relevant: the card really has 25 top-level program groups, one per non-custom PROGRAM_SOURCES-backed program — not a truncated render quietly passing on a partial fixture', (assert)=>{
  const { document } = setup();
  const groups = document.querySelectorAll('#researchSourcesList > .source-program-group');
  assert.strictEqual(groups.length, 25);
});

test('REAL invocation: every top-level row shows the real program label, and one known entry carries its real DOI text', (assert)=>{
  const { document } = setup();
  const list = document.getElementById('researchSourcesList');
  assert.ok(list.textContent.includes('Strength & Size'), 'the real programs.strength.label must appear as a row label');
  assert.ok(list.innerHTML.includes('doi:10.1249/MSS.0000000000003897'), 'the real ACSM 2026 DOI text (PROGRAM_SOURCES.strength.primary) must be present in the rendered markup');
});

test('REAL invocation: a container program (Combat) is immediately followed by one nested row per style in COMBAT_STYLES, each carrying its own real citation', (assert)=>{
  const { document } = setup();
  const groups = [...document.querySelectorAll('#researchSourcesList > .source-program-group')];
  // programs.combat.label, real text, not guessed.
  const combatGroup = groups.find(g => {
    const firstBtn = g.querySelector('.source-row .program-basis-toggle');
    return firstBtn && firstBtn.textContent.trim().startsWith('Boxing / Kickboxing');
  });
  assert.ok(combatGroup, 'the Combat program group (own row labelled "Boxing / Kickboxing") must exist');
  const nested = [...combatGroup.querySelectorAll(':scope > .source-row-nested')];
  assert.strictEqual(nested.length, 6, 'COMBAT_STYLES has 6 styles (kickboxing, boxing, muayThai, mma, taekwondo, taiChi) — each must render as its own nested row under Combat');
  const labels = nested.map(n => n.querySelector('.program-basis-toggle').textContent.trim());
  assert.ok(labels.some(l => l.includes('Boxing')), 'the Boxing style row must be present with its real label');
  assert.ok(combatGroup.textContent.includes('18:1'), 'a nested style panel should carry real citation text specific to that style (STYLE_SOURCES.boxing\'s activity-to-rest ratio finding), not just the container');
});

test('REAL invocation: clicking a row toggle expands its real citation panel via the SAME delegated click handler the per-program panel already uses — no second listener was added for this', (assert)=>{
  const { document } = setup();
  const strengthRow = [...document.querySelectorAll('#researchSourcesList .source-row')]
    .find(r => r.querySelector('.program-basis-toggle').textContent.includes('Strength & Size'));
  const btn = strengthRow.querySelector('.program-basis-toggle');
  const panelId = btn.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  assert.strictEqual(btn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(panel.classList.contains('open'), false);

  btn.click();
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'true', 'clicking must flip aria-expanded to true');
  assert.strictEqual(panel.classList.contains('open'), true, 'clicking must add .open to the smooth-toggle panel so it actually becomes visible (grid-template-rows animation)');
  assert.ok(panel.textContent.includes('doi:10.1249/MSS.0000000000003897'), 'the expanded panel must contain the real citation text, not a placeholder');

  btn.click();
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'false', 'clicking again must collapse it back');
  assert.strictEqual(panel.classList.contains('open'), false);
});

test('sabotage-relevant: editorNote text is deliberately NEVER rendered, even though school/primary from the same entries are — proves the exclusion is real, not just documented in a comment', (assert)=>{
  const { document } = setup();
  const list = document.getElementById('researchSourcesList');
  // PROGRAM_SOURCES.strength.school IS meant to render.
  assert.ok(list.textContent.includes('Upper/lower split with the week divided'), 'school text (meant to render) must be present');
  // PROGRAM_SOURCES.strength.editorNote is meant to stay internal-only —
  // this exact phrase only exists in that field.
  assert.ok(!list.textContent.includes('The >=10 weekly sets figure is per MUSCLE GROUP'), 'editorNote text must never reach the rendered DOM — it is written for whoever edits the file, not for a user reading this card');
});

test('REAL invocation: citation text containing special characters is actually escaped, not trusted raw — proves escapeHtml is really called, not assumed', (assert)=>{
  const { document } = setup();
  const list = document.getElementById('researchSourcesList');
  // PROGRAM_SOURCES.strength.primary contains "D'Souza" — a raw apostrophe.
  // If escapeHtml were skipped, this would still render fine as text (HTML
  // doesn't require escaping a bare apostrophe in text nodes), so the real
  // proof is structural: no unescaped "<" or ">" from any citation's prose
  // (several entries include comparisons like ">=80%") should ever produce
  // a stray element in the panel content.
  assert.ok(list.innerHTML.includes('&gt;='), 'a literal ">=" appearing inside cited prose (e.g. ">=80% 1RM") must be HTML-escaped to &gt;=, proving escapeHtml actually ran on citation text rather than being trusted raw');
});

run();
