'use strict';
// Behavioral coverage for a real, comment-confirmed color mismatch found
// during a visual-formatting review of the remaining non-token rgba()
// literals: .progress-badge-rpe's own explanatory comment says its color is
// meant to match .ex-suggested-rpe's placeholder (--plate-teal) "so the
// badge and the field it explains read as one statement — the same
// pairing the other three badge colours already have with their
// placeholders." But its actual background/border used a different,
// unlinked literal teal (rgba(0,191,165,…), #00BFA5) instead of
// --plate-teal-rgb (47,184,196, #2FB8C4) — a genuinely different shade
// (more green-leaning vs. more cyan-leaning). Its own bold text,
// `.progress-badge-rpe b`, already correctly used var(--plate-teal), so the
// badge visibly mismatched ITSELF, not just its stated intent. Unlike the
// care-type-tag / today-fab findings from the same review pass (which are
// inferential, sibling-pattern arguments), this one didn't need a user
// decision — the code's own comment states the goal, and the literal
// simply failed to achieve it.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-progress-badge-rpe-teal.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

test('sabotage-relevant: the old unlinked literal teal (0,191,165 / #00BFA5) is completely gone from the file', (assert)=>{
  assert.doesNotMatch(src, /0,191,165/, 'the old off-token literal must not remain anywhere');
});

test('.progress-badge-rpe now uses rgba(var(--plate-teal-rgb),X) for background/border, matching its own bold-text color and the placeholder it explains', (assert)=>{
  const badgeBlock = extractRuleBlock(src, '.progress-badge-rpe');
  assert.match(badgeBlock, /background:rgba\(var\(--plate-teal-rgb\),0\.12\);/, 'background must resolve through the real --plate-teal-rgb token');
  assert.match(badgeBlock, /border:1px solid rgba\(var\(--plate-teal-rgb\),0\.4\);/, 'border must resolve through the real --plate-teal-rgb token');

  const boldBlock = extractRuleBlock(src, '.progress-badge-rpe b');
  assert.match(boldBlock, /color:var\(--plate-teal\);/, 'sanity: the bold text inside the badge already used the real token — this is what the fix now matches');

  assert.match(src, /\.ex-suggested-rpe::placeholder\{color:var\(--plate-teal\);\}/, 'sanity: the placeholder this badge is documented to visually pair with also uses the real --plate-teal token, confirming the fix restores the stated intent');
});

run();
