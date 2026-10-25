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

// v3.283 retired every glow; v3.287 (Glass & glow, the owner's chosen concept)
// brings ONE back on purpose: --cta-glow, "press me", on the primary button and
// the floating coach button. The Today jump-back button stays a flat yellow
// pill on a neutral float shadow, and neither uses an unlinked literal.
test('the coach button glows through the shared --cta-glow token; the Today button floats on a neutral shadow, flat, no gradient', (assert)=>{
  const coach = extractRuleBlock(src, '.coach-fab');
  assert.match(coach, /box-shadow:var\(--cta-glow\);/, '.coach-fab glows via the shared token');
  const today = extractRuleBlock(src, '.today-fab');
  assert.match(today, /box-shadow:0 10px 24px -10px rgba\(var\(--overlay-black-rgb\),0\.7\);/);
  assert.doesNotMatch(today, /rgba\(var\(--plate-(yellow|blue)-rgb\)/);
  assert.doesNotMatch(today, /linear-gradient/);
  assert.doesNotMatch(extractRuleBlock(src, '.today-fab:active'), /box-shadow/);
});

run();
