'use strict';
// Behavioral coverage for a real color-scheme inconsistency found during a
// visual-formatting/redundancy review: .progress-badge-deload's text used
// the real --plate-red token, but its background/border/box-shadow-glow
// used a different, unlinked literal red (rgba(224,80,80,…), #E05050) that
// doesn't match --plate-red-rgb (255,69,58) at all.
//
// Its two siblings prove this was drift, not a considered choice:
// - .progress-badge (the "increase" signal) is fully token-consistent —
//   text AND background/border/glow all reference --plate-yellow /
//   --plate-yellow-rgb.
// - .progress-badge-decrease is fully self-consistent the OTHER way — its
//   text is a literal #E67E22 and its background/border/glow are the exact
//   same color as a literal rgba(230,126,34,…) (230,126,34 IS #E67E22
//   decoded) — a deliberate custom color, not a token, but internally
//   consistent throughout.
// .progress-badge-deload alone mixed a real token (text) with an unrelated
// literal (background/border/glow) — asked the user directly (same
// approach as every other real color decision this session), who
// confirmed it should align to --plate-red throughout, matching
// .progress-badge's pattern.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-progress-badge-deload-red.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

test('sabotage-relevant: the old unlinked literal red (224,80,80 / #E05050) is completely gone from the file', (assert)=>{
  assert.doesNotMatch(src, /224,80,80/, 'the old off-token literal must not remain anywhere, not even in a comment referencing it as still-current');
});

test('.progress-badge-deload now uses rgba(var(--plate-red-rgb),X) for background/border/box-shadow, matching its own text color', (assert)=>{
  const block = extractRuleBlock(src, '.progress-badge-deload');
  assert.match(block, /background:rgba\(var\(--plate-red-rgb\),0\.12\);/, 'background must resolve through the real --plate-red-rgb token');
  assert.match(block, /border:1px solid rgba\(var\(--plate-red-rgb\),0\.38\);/, 'border must resolve through the real --plate-red-rgb token');
  assert.match(block, /box-shadow:var\(--rim\), 0 4px 12px -7px rgba\(var\(--plate-red-rgb\),0\.35\);/, 'box-shadow glow must resolve through the real --plate-red-rgb token');
  assert.match(block, /color:var\(--plate-red\);/, 'text color must still be --plate-red, now matching its own background/border/glow instead of standing alone');
});

test('sabotage-relevant: .progress-badge-deload is now internally consistent the same way its sibling .progress-badge already is — text and fill both trace to the SAME token family', (assert)=>{
  const deloadBlock = extractRuleBlock(src, '.progress-badge-deload');
  const increaseBlock = extractRuleBlock(src, '.progress-badge');

  // .progress-badge (increase/yellow): every color-bearing declaration
  // references --plate-yellow or --plate-yellow-rgb.
  assert.match(increaseBlock, /rgba\(var\(--plate-yellow-rgb\),0\.12\)/);
  assert.match(increaseBlock, /rgba\(var\(--plate-yellow-rgb\),0\.38\)/);
  assert.match(increaseBlock, /rgba\(var\(--plate-yellow-rgb\),0\.35\)/);
  assert.match(increaseBlock, /color:var\(--plate-yellow\)/);

  // .progress-badge-deload (deload/red): same shape, --plate-red family.
  assert.match(deloadBlock, /rgba\(var\(--plate-red-rgb\),0\.12\)/);
  assert.match(deloadBlock, /rgba\(var\(--plate-red-rgb\),0\.38\)/);
  assert.match(deloadBlock, /rgba\(var\(--plate-red-rgb\),0\.35\)/);
  assert.match(deloadBlock, /color:var\(--plate-red\)/);
});

test('regression guard: .progress-badge-decrease (the deliberately self-consistent custom-orange sibling) is untouched by this fix', (assert)=>{
  const block = extractRuleBlock(src, '.progress-badge-decrease');
  assert.match(block, /background:rgba\(230,126,34,0\.12\);/, '.progress-badge-decrease must keep its own literal orange, unrelated to this fix');
  assert.match(block, /color:#E67E22;/, '.progress-badge-decrease text must still be the same literal orange, matching its own background exactly');
});

run();
