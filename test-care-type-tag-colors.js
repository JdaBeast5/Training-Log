'use strict';
// Behavioral coverage for a real color mismatch found during a
// visual-formatting review of the remaining non-token rgba() literals:
// .care-type-tag.strengthen and .care-type-tag.mobility showed colored text
// via the real --plate-yellow/--plate-green tokens, but their own
// background tint was a different, unlinked custom literal that didn't
// match (rgba(224,163,80,…) for strengthen vs. --plate-yellow-rgb
// 245,197,24; rgba(126,211,140,…) for mobility vs. --plate-green-rgb
// 50,215,75).
//
// The third sibling, .care-type-tag.stretch, proves the intended pattern:
// its background and text are the exact same custom color (79,195,247 /
// #4FC3F7) — background = own-color-at-15%-alpha, text = own-color-at-full.
// .strengthen/.mobility broke that pattern by pulling text from a shared
// token while keeping an unrelated literal background. Unlike
// test-progress-badge-rpe-teal.js's finding (comment-confirmed, fixed
// directly), this one was inferential — asked the user directly, who
// confirmed background should match text, same as .stretch.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-care-type-tag-colors.js');

test('sabotage-relevant: the old unlinked literal backgrounds (224,163,80 / 126,211,140) are completely gone from the file', (assert)=>{
  assert.doesNotMatch(src, /224,163,80/, 'the old off-token strengthen literal must not remain anywhere');
  assert.doesNotMatch(src, /126,211,140/, 'the old off-token mobility literal must not remain anywhere');
});

test('.care-type-tag.strengthen and .mobility now use rgba(var(--plate-*-rgb),0.15) backgrounds matching their own text color', (assert)=>{
  assert.match(src, /\.care-type-tag\.strengthen\{background:rgba\(var\(--plate-yellow-rgb\),0\.15\); color:var\(--plate-yellow\);\}/, 'strengthen background must match its own --plate-yellow text');
  assert.match(src, /\.care-type-tag\.mobility\{background:rgba\(var\(--plate-green-rgb\),0\.15\); color:var\(--plate-green\);\}/, 'mobility background must match its own --plate-green text');
});

test('regression guard: .care-type-tag.stretch (the already-self-consistent sibling that established the pattern) is untouched by this fix', (assert)=>{
  assert.match(src, /\.care-type-tag\.stretch\{background:rgba\(79,195,247,0\.15\); color:#4FC3F7;\}/, '.stretch must keep its own literal-matching pair exactly as it was');
});

run();
