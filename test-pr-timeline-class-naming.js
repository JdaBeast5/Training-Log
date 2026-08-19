'use strict';
// Regression coverage for a real class-name collision, found during a
// stylistic-consistency sweep (not reported by a user, not a visible bug
// today): the PR Timeline card (History tab, "Personal Record" events) and
// the print-only export report (buildAnalysisPrintReport et al., see
// "[PRINT REPORT]") both independently picked the "pr-" abbreviation and
// happened to collide on the exact same class, .pr-ex-name, for two
// completely unrelated pieces of UI.
//
// Confirmed harmless in practice — @media print's own
// `body > *:not(#printReportContent){display:none!important}` rule means
// the print report's version of .pr-ex-name can never paint outside of
// #printReportContent, so the PR Timeline's row never actually picked up
// the wrong font-weight/size. But it was a real landmine: either rule's
// scoping changing in the future would have silently bled one feature's
// CSS into the other. Renamed the PR Timeline's version to .prt-ex-name
// (PR Timeline) to remove the collision outright, leaving the print
// report's .pr-ex-name (covered separately by test-analysis-export.js)
// untouched.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-pr-timeline-class-naming.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

test('sabotage-relevant: .prt-ex-name is declared exactly once, outside any print-only scope, carrying the PR Timeline row\'s real styling', (assert)=>{
  const count = (src.match(/\.prt-ex-name\{/g) || []).length;
  assert.strictEqual(count, 1, `expected exactly one .prt-ex-name{...} declaration, found ${count}`);
  const block = extractRuleBlock(src, '.prt-ex-name');
  assert.match(block, /font-weight:600/);
  assert.match(block, /font-size:13\.5px/);
});

test('sabotage-relevant: the PR Timeline\'s row-building code no longer emits class="pr-ex-name" anywhere — the whole point of the rename', (assert)=>{
  const renderPrTimelineSrc = extractFunction(src, 'renderPrTimeline');
  assert.doesNotMatch(renderPrTimelineSrc, /class="pr-ex-name"/, 'renderPrTimeline must not emit the colliding class name any more');
  assert.match(renderPrTimelineSrc, /class="prt-ex-name"/, 'renderPrTimeline must emit its own, disambiguated class name');
});

test('sabotage-relevant: the print report\'s OWN .pr-ex-name is untouched — this fix renamed only the PR Timeline\'s copy, not the print report\'s (which test-analysis-export.js already covers)', (assert)=>{
  const buildAnalysisPrintReportSrc = extractFunction(src, 'buildAnalysisPrintReport');
  assert.match(buildAnalysisPrintReportSrc, /class="pr-ex-name"/, 'the print report must still use its own real .pr-ex-name class, unrenamed');
});

test('REAL invocation: renderPrTimeline, given one real logged PR, renders a row carrying prt-ex-name and NOT pr-ex-name in the actual DOM', async (assert)=>{
  const chunks = [
    `var COMBAT_STYLES = {};`,
    `var CYCLING_STYLES = {};`,
    `var programs = { strength: { label:'Strength & Size', days: { d1: { exercises: [ {name:'Back Squat'} ] } } } };`,
    `var weightUnit = 'lb';`,
    `const LB_PER_KG = 0.453592;`,
    extractFunction(src, 'escapeHtml'),
    extractFunction(src, 'toDisplayWeight'),
    extractFunction(src, 'trimUnitNum'),
    extractFunction(src, 'fmtWeight'),
    extractFunction(src, 'normalizeExEntry'),
    extractFunction(src, 'parseExKey'),
    extractFunction(src, 'topSetOf'),
    extractFunction(src, 'estimated1RM'),
    extractFunction(src, 'groupCorpusByExercise'),
    `var exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null, exCorpusGen = 0;`,
    extractFunction(src, 'readExCorpus'),
    extractFunction(src, 'reconstructAllPRs'),
    extractFunction(src, 'renderCollapsibleList'),
    extractFunction(src, 'renderPrTimeline'),
    `
    window.storage = {
      list: async ()=> ({ keys: ['ex:strength:d1:0'] }),
      get: async (key)=> key === 'ex:strength:d1:0'
        ? { value: JSON.stringify([{date:'2026-01-01', sets:[{weight:135, reps:5}]}]) }
        : null,
    };
    `,
  ];
  const { document, window } = runJsdom('<div id="prTimeline"></div>', '', chunks);
  await window.renderPrTimeline();
  const html = document.getElementById('prTimeline').innerHTML;
  assert.match(html, /class="prt-ex-name"/, 'a real rendered PR row must carry the disambiguated class');
  assert.doesNotMatch(html, /class="pr-ex-name"/, 'a real rendered PR row must NOT carry the old, colliding class name');
  assert.match(html, /Back Squat/, 'sanity: this really is the PR row for the logged exercise, not an empty/error state');
});

run();
