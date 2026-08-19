'use strict';
// Regression coverage for a labeling gap in the PR Timeline (History tab):
// strength PRs already rendered an explicit `.pr-type-tag` ("strength PR")
// next to the 💪 emoji, but weight PRs rendered only a bare 🏆 with no text
// at all — a user had to infer "🏆 = weight PR" purely by contrast with the
// labeled strength case. Fixed by giving weight PRs their own "weight PR"
// tag, reusing the existing .pr-type-tag component rather than inventing a
// new one.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-pr-timeline-weight-pr-tag.js');

function buildChunks(){
  return [
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
  ];
}

test('sabotage-relevant: renderPrTimeline emits exactly one .pr-type-tag per PR event, weight PRs included', (assert)=>{
  const renderPrTimelineSrc = extractFunction(src, 'renderPrTimeline');
  // Guards against the old code, where the tag span only appeared inside the
  // isStrength branch of the ternary (so it vanished entirely for weight PRs).
  assert.doesNotMatch(renderPrTimelineSrc, /isStrength\s*\?\s*'\s*<span class="pr-type-tag">strength PR<\/span>'\s*:\s*''/, 'the tag must no longer be conditional on isStrength alone');
  assert.match(renderPrTimelineSrc, /<span class="pr-type-tag">\$\{isStrength \? 'strength PR' : 'weight PR'\}<\/span>/, 'both PR types must render through the same pr-type-tag span, differing only by label text');
});

test('REAL invocation: weight PRs and a standalone strength PR each render their own distinct pr-type-tag label', async (assert)=>{
  // Same fixture as test-pr-timeline.js's classification test: 2026-01-01
  // 200x5 and 2026-01-08 205x5 are weight PRs, 2026-01-15 185x8 is not a PR
  // at all, and 2026-01-22 190x8 is a standalone strength (est. 1RM) PR that
  // does NOT beat the 205 weight record.
  const chunks = [
    ...buildChunks(),
    `
    window.storage = {
      list: async ()=> ({ keys: ['ex:strength:d1:0'] }),
      get: async (key)=> key === 'ex:strength:d1:0'
        ? { value: JSON.stringify([
            {date:'2026-01-08', sets:[{weight:205, reps:5}]},
            {date:'2026-01-01', sets:[{weight:200, reps:5}]},
            {date:'2026-01-22', sets:[{weight:190, reps:8}]},
            {date:'2026-01-15', sets:[{weight:185, reps:8}]},
          ]) }
        : null,
    };
    `,
  ];
  const { document, window } = runJsdom('<div id="prTimeline"></div>', '', chunks);
  await window.renderPrTimeline();
  const html = document.getElementById('prTimeline').innerHTML;

  const tagMatches = html.match(/<span class="pr-type-tag">([^<]*)<\/span>/g) || [];
  assert.strictEqual(tagMatches.length, 3, `expected exactly 3 PR rows (2 weight + 1 strength), each carrying its own tag — got ${tagMatches.length}`);

  const weightTagCount = (html.match(/<span class="pr-type-tag">weight PR<\/span>/g) || []).length;
  const strengthTagCount = (html.match(/<span class="pr-type-tag">strength PR<\/span>/g) || []).length;
  assert.strictEqual(weightTagCount, 2, 'the 01-01 and 01-08 sessions are weight PRs and must each say "weight PR"');
  assert.strictEqual(strengthTagCount, 1, 'the 01-22 session is a standalone strength PR and must say "strength PR"');

  // Sanity: still exactly 2 trophy-emoji rows (the weight PRs) — confirms
  // the tag-count assertions above are counting real rows, not a fluke.
  const trophyRows = html.split('🏆').length - 1;
  assert.strictEqual(trophyRows, 2, 'sanity: still exactly 2 trophy-emoji rows (the weight PRs)');
});

run();
