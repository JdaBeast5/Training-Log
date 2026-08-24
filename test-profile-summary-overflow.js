'use strict';
// Behavioral coverage for a real bug found during a live QA pass: entering
// a very long, unbroken profile name (no spaces — the input has no length
// cap) overflowed #profileSummary's card instead of wrapping. Confirmed
// live: scrollWidth (1620px) far exceeded clientWidth (318px) for a
// 220-character name.
//
// #profileSummary reuses the shared .nutrition-summary class (it's also the
// collapsed "Tap to set up..." line), but every OTHER user of that class
// only ever shows short, app-generated strings — never free-form user text.
// Fixed with a rule scoped to the id, not the shared class, so this can't
// change how any other .nutrition-summary usage renders.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-profile-summary-overflow.js');

// Same technique as test-sticky-day-header-overlap.js's extractRuleBlock —
// identity-based lookup so line drift can't silently defeat this.
function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

test('#profileSummary has its own overflow-wrap rule, scoped to the id (not the shared .nutrition-summary class)', (assert)=>{
  const block = extractRuleBlock(src, '#profileSummary');
  assert.match(block, /overflow-wrap:\s*anywhere/, '#profileSummary must wrap long unbroken text instead of letting it overflow the card');
});

test('sabotage-relevant: the shared .nutrition-summary class itself does NOT declare overflow-wrap — this fix must not change every other user of that class', (assert)=>{
  const re = /\.nutrition-summary\{[^}]*\}/;
  const m = re.exec(src);
  if(!m) throw new Error('no rule found for .nutrition-summary');
  assert.doesNotMatch(m[0], /overflow-wrap/, 'the fix must be scoped to #profileSummary specifically, not bleed into the shared class every other summary line uses');
});

run();
