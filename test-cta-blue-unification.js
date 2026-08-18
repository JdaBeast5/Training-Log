'use strict';
// Behavioral coverage for the resolution of a real visual decision the prior
// session flagged rather than autonomously fixed (HANDOFF-v36 §4.4): two
// near-identical CTA gradient blues, #6E8AFF (the existing --cta-gradient-blue
// token) and #7C97FF, coexisted across four sites each, blending into the
// same base --plate-blue in every case. Asked directly, the user picked
// #6E8AFF as the one true CTA blue — this rewrote every real #7C97FF site to
// match, a 1:1 color substitution that originally left each site's own
// gradient angle/percentage/stop-order untouched (that variance was flagged
// as a separate, still-open question at the time).
//
// That second question got resolved in a later session (a visual-formatting/
// redundancy review): the CTA-blue gradient's stop PERCENTAGE also had real,
// undocumented drift — 4 sites (.save-btn, .coach-fab,
// .calendar-cell.selected, .compare-confirm-btn) held a literal 55% stop
// while the shared --cta-gradient-blue token (used at the other 9 sites) was
// 60%. Asked directly again, the user picked 60% — those 4 sites now
// reference the shared token directly instead of duplicating their own
// literal, so this file's original "each site's own stop % is preserved"
// assertions are updated below to match, while everything about the
// #7C97FF retirement itself (the actual subject of this file) is unchanged.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-cta-blue-unification.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('sabotage-relevant: #7C97FF no longer appears as a real CSS/SVG color value anywhere in the file — only in this historical-note comment', (assert)=>{
  const realOccurrences = (src.match(/#7C97FF/g) || []).length;
  // The only two remaining mentions are prose, inside the :root comment
  // documenting that the retired color used to exist here — walked back to
  // confirm each is genuinely inside a `//`-free block comment, not a
  // real declaration a naive count would miss.
  const commentOccurrences = (src.match(/#7C97FF site was rewritten|blue light-stop \(#7C97FF\)/g) || []).length;
  assert.strictEqual(realOccurrences, commentOccurrences, 'every #7C97FF occurrence left in the file must be one of the two known historical-note comment mentions, not a real color value still in use');
});

test('REAL invocation: all four former-#7C97FF sites resolve to #6E8AFF at the token\'s 60% stop, either directly or via --cta-gradient-blue', (assert)=>{
  const rootBlock = extractRuleBlock(src, ':root');
  assert.match(rootBlock, /--cta-gradient-blue:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 60%\);/, 'sanity: the token holds #6E8AFF at 60%');

  // .coach-fab, .vol-bar-fill, and .calendar-cell.selected were all later
  // (a separate, purely-mechanical dedup pass for vol-bar-fill; a
  // deliberate, user-approved stop-percentage unification for the other
  // two — see the header comment) swapped from their own literal gradient
  // to var(--cta-gradient-blue) directly, since the color they need to
  // land on IS what the token already holds.
  const fabBlock = extractRuleBlock(src, '.coach-fab');
  assert.match(fabBlock, /background:var\(--cta-gradient-blue\);/, '.coach-fab must reference the shared token (now 60%, no longer its own 55% literal)');

  const volBlock = extractRuleBlock(src, '.vol-bar-fill');
  assert.match(volBlock, /background:var\(--cta-gradient-blue\);/, '.vol-bar-fill must reference the shared token');

  const coachProgressBlock = extractRuleBlock(src, '.coach-progress-fill');
  assert.match(coachProgressBlock, /background:linear-gradient\(90deg, var\(--plate-blue\), #6E8AFF\);/, '.coach-progress-fill must still use its own literal #6E8AFF, keeping its own reversed 90deg stop order (plate-blue first, then the light stop) — this rule was never part of the --cta-gradient-blue family and neither fix touched it');

  const calBlock = extractRuleBlock(src, '.calendar-cell.selected');
  assert.match(calBlock, /background:var\(--cta-gradient-blue\);/, '.calendar-cell.selected must reference the shared token (now 60%, no longer its own 55% literal)');
});

test('regression guard: the --cta-gradient-blue token and the AI Coach rest-timer SVG stop are untouched by either fix', (assert)=>{
  const rootBlock = extractRuleBlock(src, ':root');
  assert.match(rootBlock, /--cta-gradient-blue:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 60%\);/, 'the token itself must be unchanged — it was already the chosen color and stop');

  const stopMatch = /<stop offset="0%" stop-color="#6E8AFF"\/>/;
  assert.match(src, stopMatch, 'the AI Coach rest-timer SVG gradient stop must be unchanged — it was already #6E8AFF');
});

test('sabotage-relevant: .compare-confirm-btn (a pre-existing #6E8AFF site, never #7C97FF) also now references the shared token, matching the user-approved 60% stop unification', (assert)=>{
  const compareBtnBlock = extractRuleBlock(src, '.compare-confirm-btn');
  assert.match(compareBtnBlock, /background:var\(--cta-gradient-blue\);/, '.compare-confirm-btn must reference the shared token (its own 55% literal was retired by the stop-percentage unification, a separate fix from the #7C97FF retirement this file is mainly about)');
});

test('sabotage-relevant: exactly four real #6E8AFF sites exist in the file, not more and not fewer', (assert)=>{
  const count = (src.match(/#6E8AFF/g) || []).length;
  // Down from the original 6 real values + 2 prose mentions: the
  // mechanical vol-bar-fill dedup and the later 55%->60% stop unification
  // (4 more sites: .save-btn, .coach-fab, .calendar-cell.selected,
  // .compare-confirm-btn) each replaced a literal #6E8AFF with a
  // var(--cta-gradient-blue) reference. What's left: the token definition
  // itself, .coach-progress-fill's own untouched literal, the SVG stop,
  // and one prose mention in the :root comment.
  assert.strictEqual(count, 4, 'expected 3 real #6E8AFF color values (token, .coach-progress-fill, SVG stop) plus 1 historical-note comment mention — a different count means either a site was missed, double-converted, or the comment text drifted');
});

run();
