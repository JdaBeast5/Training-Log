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

test('.today-fab and .today-fab:active now glow with rgba(var(--plate-yellow-rgb),X), matching how .coach-fab already resolves its own glow through --plate-blue-rgb', (assert)=>{
  const todayFabBlock = extractRuleBlock(src, '.today-fab');
  assert.match(todayFabBlock, /0 14px 34px -8px rgba\(var\(--plate-yellow-rgb\),0\.6\), 0 0 50px -14px rgba\(var\(--plate-yellow-rgb\),0\.5\);/, '.today-fab glow must resolve through --plate-yellow-rgb');

  const todayFabActiveBlock = extractRuleBlock(src, '.today-fab:active');
  assert.match(todayFabActiveBlock, /0 8px 20px -8px rgba\(var\(--plate-yellow-rgb\),0\.5\);/, '.today-fab:active glow must resolve through --plate-yellow-rgb');

  const coachFabBlock = extractRuleBlock(src, '.coach-fab');
  assert.match(coachFabBlock, /rgba\(var\(--plate-blue-rgb\),0\.65\), 0 0 50px -14px rgba\(var\(--plate-blue-rgb\),0\.55\);/, 'sanity: .coach-fab already used its real token — this is the pattern .today-fab now matches');
});

run();
