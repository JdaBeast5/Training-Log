'use strict';
// Behavioral coverage for a real color mismatch found during a
// visual-formatting review of the remaining non-token rgba() literals:
// .today-fab's ambient glow shadow used a literal color, rgba(255,184,92,…)
// / #FFB85C, that matched neither its own gradient's light stop (#FFC978,
// 255,201,120) nor --plate-yellow (245,197,24) — a third, unrelated shade.
//
// Its sibling .coach-fab (blue) establishes the intended pattern: its glow
// uses rgba(var(--plate-blue-rgb),…) — the gradient's own BASE/dark stop
// color, not the lighter highlight stop, resolved through the real token.
// .today-fab's glow broke that pattern with an unlinked literal. Unlike
// test-progress-badge-rpe-teal.js's finding (comment-confirmed, fixed
// directly), this one was inferential (a sibling-pattern argument) — asked
// the user directly, who confirmed aligning to --plate-yellow, matching how
// .coach-fab already works.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-today-fab-glow-color.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

test('sabotage-relevant: the old unlinked literal glow color (255,184,92 / #FFB85C) is completely gone from the file', (assert)=>{
  assert.doesNotMatch(src, /255,184,92/, 'the old off-token literal must not remain anywhere');
});

// v3.283 (tasteskill rollout): glows are gone app-wide on the owner's
// direction to replace the layout using the vendored skills. The earlier
// owner call above was about WHICH colour the glow used; with no glow left,
// both floating buttons share one neutral float shadow through the black
// token, and neither keeps a plate-colour bloom or a gradient fill.
test('.today-fab and .coach-fab float on the same neutral shadow (overlay-black token), with no plate-colour glow and no gradient', (assert)=>{
  const NEUTRAL = /box-shadow:0 10px 24px -10px rgba\(var\(--overlay-black-rgb\),0\.7\);/;
  for(const sel of ['.today-fab', '.coach-fab']){
    const block = extractRuleBlock(src, sel);
    assert.match(block, NEUTRAL, `${sel} must use the shared neutral float shadow`);
    assert.doesNotMatch(block, /rgba\(var\(--plate-(yellow|blue)-rgb\)/, `${sel} must not glow in a plate colour`);
    assert.doesNotMatch(block, /linear-gradient/, `${sel} must be a flat fill`);
  }
  assert.doesNotMatch(extractRuleBlock(src, '.today-fab:active'), /box-shadow/, 'pressing scales it; no glow on press');
});

run();
