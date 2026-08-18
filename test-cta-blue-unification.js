'use strict';
// Behavioral coverage for the resolution of a real visual decision the prior
// session flagged rather than autonomously fixed (HANDOFF-v36 §4.4): two
// near-identical CTA gradient blues, #6E8AFF (the existing --cta-gradient-blue
// token) and #7C97FF, coexisted across four sites each, blending into the
// same base --plate-blue in every case. Asked directly, the user picked
// #6E8AFF as the one true CTA blue — this rewrites every real #7C97FF site
// to match, a 1:1 color substitution that leaves each site's own gradient
// angle/percentage/stop-order exactly as it was (that variance is a
// separate, still-open question this change doesn't touch).
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

test('REAL invocation: all four former-#7C97FF sites now render #6E8AFF, with each site\'s own gradient shape (angle/percentage/stop-order) unchanged', (assert)=>{
  const fabBlock = extractRuleBlock(src, '\n  .coach-fab');
  assert.match(fabBlock, /background:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 55%\);/, '.coach-fab must use #6E8AFF at its original 55% stop');

  // .vol-bar-fill was later (a separate, purely-mechanical dedup pass —
  // see test-css-mechanical-token-dedup.js) swapped from its own literal
  // 60%-stop #6E8AFF gradient to var(--cta-gradient-blue) directly, since
  // that literal was byte-identical to the already-existing token. Its
  // color/stop is still #6E8AFF at 60% — just resolved through the shared
  // token instead of a second copy of the literal.
  const rootForVol = extractRuleBlock(src, ':root');
  assert.match(rootForVol, /--cta-gradient-blue:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 60%\);/, 'sanity: the token .vol-bar-fill now resolves through still holds #6E8AFF at 60%');
  const volBlock = extractRuleBlock(src, '.vol-bar-fill');
  assert.match(volBlock, /background:var\(--cta-gradient-blue\);/, '.vol-bar-fill must reference the shared --cta-gradient-blue token, which resolves to #6E8AFF at its original 60% stop (distinct from the 55% used elsewhere — that variance is untouched by this color-only fix)');

  const coachProgressBlock = extractRuleBlock(src, '.coach-progress-fill');
  assert.match(coachProgressBlock, /background:linear-gradient\(90deg, var\(--plate-blue\), #6E8AFF\);/, '.coach-progress-fill must use #6E8AFF, keeping its own reversed 90deg stop order (plate-blue first, then the light stop) unchanged');

  const calBlock = extractRuleBlock(src, '.calendar-cell.selected');
  assert.match(calBlock, /background:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 55%\);/, '.calendar-cell.selected must use #6E8AFF at its original 55% stop');
});

test('regression guard: the --cta-gradient-blue token and its other three pre-existing #6E8AFF sites are untouched by this change', (assert)=>{
  const rootBlock = extractRuleBlock(src, ':root');
  assert.match(rootBlock, /--cta-gradient-blue:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 60%\);/, 'the token itself must be unchanged — it was already the chosen color');

  const compareBtnBlock = extractRuleBlock(src, '.compare-confirm-btn');
  assert.match(compareBtnBlock, /background:linear-gradient\(160deg, #6E8AFF, var\(--plate-blue\) 55%\);/, '.compare-confirm-btn must be unchanged — it was already #6E8AFF');

  const stopMatch = /<stop offset="0%" stop-color="#6E8AFF"\/>/;
  assert.match(src, stopMatch, 'the AI Coach rest-timer SVG gradient stop must be unchanged — it was already #6E8AFF');
});

test('sabotage-relevant: exactly six real #6E8AFF sites exist in the file, not more and not fewer', (assert)=>{
  const count = (src.match(/#6E8AFF/g) || []).length;
  // Was 7 real color values (token, 2 pre-existing CSS sites, 1 pre-existing
  // SVG stop, plus the 4 rewritten sites) + 2 prose mentions in the
  // historical comment. A later, separate mechanical-dedup pass (see
  // test-css-mechanical-token-dedup.js) swapped .vol-bar-fill from its own
  // literal #6E8AFF gradient to var(--cta-gradient-blue) — same resolved
  // color, one fewer literal text occurrence, so 6 real values + the same
  // 2 prose mentions.
  assert.strictEqual(count, 8, 'expected 6 real #6E8AFF color values plus the 2 historical-note comment mentions — a different count means either a site was missed, double-converted, or the comment text drifted');
});

run();
