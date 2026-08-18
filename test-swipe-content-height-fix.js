'use strict';
// Behavioral coverage for a real, user-reported bug: a bright red line
// appeared under every food-log row (screenshots from a real iPhone —
// Barebell Protein Bar, Fried Rice, Egg, Peas, Chicken breast — each with
// a thin red bar under it, not just a subtle divider).
//
// Root cause, confirmed live in headless Chromium with the app's own real
// CSS/markup (not guessed from source): .fl-detail (the collapsed
// per-food macro-breakdown toggle, class="smooth-toggle fl-detail") has
// `margin:-4px 0 4px`. A NEGATIVE top margin on a trailing child makes a
// plain block's own auto-height calculation undercount by the negative
// amount, UNLESS the block establishes its own formatting context (a BFC).
// .swipe-item already has overflow:hidden and correctly auto-sizes to
// 59px (real, measured); its child .swipe-content had no such rule and
// auto-sized to only 55px — 4px short. Since .swipe-content is what
// carries the opaque background:var(--surface) meant to hide
// .swipe-delete-bg (background:var(--plate-red)) behind it, that missing
// 4px left a real gap at the bottom of every row where nothing painted
// over the red background — .food-log-item's own content (including its
// border-bottom) still rendered there since IT sizes correctly, just not
// within a background that reaches that far.
//
// Fix: overflow:hidden on .swipe-content, the same BFC-establishing
// mechanism .swipe-item already uses for an unrelated reason (containing
// the swipe gesture). Verified with the app's OWN real CSS + real markup
// in a real headless-Chromium page (not jsdom, which has no layout engine
// — this project's own test-list-row-enter-animation.js documents that
// same limitation): before the fix, .swipe-content measured 55px against
// .swipe-item/.food-log-item's real 59px; after, all three match at 59px,
// and a full-page screenshot with 5 real logged food items (via the
// app's own addFoodToLog, not fabricated data) confirmed the red line is
// gone. This test proves the real declaration is in place; the live
// pixel-level proof isn't something jsdom can re-derive.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-swipe-content-height-fix.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('sabotage-relevant: .swipe-content is still declared exactly once (this fix touches the one real declaration, not a stray duplicate)', (assert)=>{
  const count = (src.match(/\.swipe-content\{/g) || []).length;
  assert.strictEqual(count, 1, `expected exactly one .swipe-content{...} declaration, found ${count}`);
});

test('.swipe-content now has overflow:hidden', (assert)=>{
  const block = extractRuleBlock(src, '.swipe-content');
  assert.match(block, /overflow:hidden/, 'expected overflow:hidden to establish a block-formatting-context, matching .swipe-item\'s own existing pattern');
  assert.match(block, /background:var\(--surface\)/, 'sanity: the opaque background this fix is protecting must still be here');
});

test('sabotage-relevant: .fl-detail\'s negative top margin (the actual trigger condition this fix protects against) is still present — if it were ever removed, this fix would be defending against a scenario that no longer exists', (assert)=>{
  const block = extractRuleBlock(src, '.fl-detail');
  assert.match(block, /margin:-4px 0 4px/, 'expected the real, still-current negative-margin declaration that makes overflow:hidden on .swipe-content necessary');
});

run();
