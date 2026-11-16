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

// 2026-11-16 (v3.580, UX-03, flat ground): --cta-gradient-blue is retired. The former token sites are flat:
// the coach button and Compare are ink (--text on --ground); the volume bar and
// the selected calendar day are the blue spot ink. The coach progress fill keeps
// its own literal (never part of that family).
test('REAL source (v3.580, UX-03): the former --cta-gradient-blue sites are flat ink or flat --spot-blue; .coach-progress-fill keeps its literal', (assert)=>{
  const rootBlock = extractRuleBlock(src, ':root');
  assert.doesNotMatch(rootBlock, /--cta-gradient-blue:/, 'the token is retired');
  assert.match(extractRuleBlock(src, '.coach-fab'), /background:var\(--text\);/);
  assert.match(extractRuleBlock(src, '.vol-bar-fill'), /background:var\(--spot-blue\);/);
  assert.match(extractRuleBlock(src, '.calendar-cell.selected'), /background:var\(--spot-blue\);/);
  assert.match(extractRuleBlock(src, '.coach-progress-fill'), /background:linear-gradient\(90deg, var\(--plate-blue\), #6E8AFF\);/);
});

// 2026-11-16 (v3.580, UX-03, flat ground): the token is retired; the SVG stop is still untouched.
test('regression guard: the AI Coach rest-timer SVG stop is untouched', (assert)=>{
  assert.match(src, /<stop offset="0%" stop-color="#6E8AFF"\/>/, 'the AI Coach rest-timer SVG gradient stop must be unchanged — it was already #6E8AFF');
});

// 2026-11-16 (v3.580, UX-03, flat ground): Compare is a primary button, so it is flat ink.
test('REAL source (v3.580, UX-03): .compare-confirm-btn is flat ink, no gradient', (assert)=>{
  const block = extractRuleBlock(src, '.compare-confirm-btn');
  assert.match(block, /background:var\(--text\);/);
  assert.match(block, /color:var\(--ground\);/);
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
  // 3 since v3.280: the token stopped holding #6E8AFF (contrast), so what is
  // left is .coach-progress-fill, the SVG stop and the historical :root note.
  assert.strictEqual(count, 3, 'expected 2 real #6E8AFF color values (.coach-progress-fill, SVG stop) plus 1 historical-note comment mention — a different count means either a site was missed, double-converted, or the comment text drifted');
});

run();
