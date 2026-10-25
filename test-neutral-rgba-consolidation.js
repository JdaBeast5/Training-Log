'use strict';
// Behavioral coverage for closing out the bulk of HANDOFF-v36's "~212
// remaining rgba() literals" note: white(255,255,255) and black(0,0,0)
// surface/overlay neutrals, which made up the large majority of what the
// prior session's H2.1-H2.3 accent-color passes deliberately left alone
// (those passes only ever touched the --plate-* accent family).
//
// Same mechanism and same reasoning as test-rgba-blue-yellow-consolidation.js
// / test-rgba-background-border-consolidation.js: a real CSS custom property
// can't hold a full color and still be alpha-blended via rgba() without
// color-mix() or an R/G/B-triplet companion. --surface-white-rgb and
// --overlay-black-rgb are that companion for the two neutral tones, applied
// as a blanket 1:1 mechanical substitution across every rgba(255,255,255,X)
// and rgba(0,0,0,X) literal inside the <style> block — every alpha value
// preserved exactly as a literal at its own call site, only the repeated
// R/G/B triplet factored out.
//
// jsdom's CSSOM does not resolve CSS custom properties in getComputedStyle
// at all (documented by the prior session in the [PHASE H] comment block and
// in HANDOFF-v36 §1's testing note) — a var()-based rgba() and an unset
// property both compute to the same rgba(0,0,0,0) regardless of what the
// variable holds. So, matching that established precedent exactly, this
// file proves the substitution via real-cascade string substitution
// (resolve the var() back to its literal value, assert byte-identical to
// the pre-conversion original) rather than a getComputedStyle diff.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-neutral-rgba-consolidation.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

const rootBlock = extractRuleBlock(src, ':root');

function resolveVars(ruleText){
  return ruleText
    .replace(/var\(--surface-white-rgb\)/g, '255,255,255')
    .replace(/var\(--overlay-black-rgb\)/g, '0,0,0')
    // .nav-pill.active's own accent glow also carries a --plate-blue-rgb
    // reference from the earlier H2.1-H2.3 accent-color pass, untouched by
    // this one — resolved too so the whole rule can be byte-matched here.
    .replace(/var\(--plate-blue-rgb\)/g, '91,124,255');
}

test('sabotage-relevant: :root declares real, correct R/G/B companions for white and black', (assert)=>{
  assert.match(rootBlock, /--surface-white-rgb:255,255,255;/, '--surface-white-rgb must decode to real white');
  assert.match(rootBlock, /--overlay-black-rgb:0,0,0;/, '--overlay-black-rgb must decode to real black');
});

// ── Representative sample across declaration TYPES this pass touched:
//    plain custom-property values, multi-declaration box-shadow composites,
//    a linear-gradient, and real component rules found via the visual-weight
//    tests this same change had to update ──────────────────────────────────

test('REAL CASCADE: --sheen/--sheen-strong/--elev-1/2/3 resolve to their exact pre-conversion literals', (assert)=>{
  assert.match(resolveVars(rootBlock), /--sheen:rgba\(255,255,255,0\.06\);/, '--sheen must byte-match the original literal');
  assert.match(resolveVars(rootBlock), /--sheen-strong:rgba\(255,255,255,0\.12\);/, '--sheen-strong must byte-match the original literal');
  assert.match(resolveVars(rootBlock), /--elev-1:var\(--rim\), 0 2px 6px -2px rgba\(0,0,0,0\.40\);/, '--elev-1 must byte-match the original literal');
  assert.match(resolveVars(rootBlock), /--elev-2:var\(--rim\), 0 14px 32px -12px rgba\(0,0,0,0\.55\);/, '--elev-2 must byte-match the original literal');
  assert.match(resolveVars(rootBlock), /--elev-3:var\(--rim\), 0 24px 48px -16px rgba\(0,0,0,0\.70\);/, '--elev-3 must byte-match the original literal');
});

test('REAL CASCADE: --shine-gloss is a no-op none since v3.280 (was a two-stop white gradient)', (assert)=>{
  const shineBlock = rootBlock.match(/--shine-gloss:[^;]*;/)[0];
  assert.ok(shineBlock, '--shine-gloss must be declared');
  // v3.280: the gloss layer was retired (filled controls went flat); the token
  // stays as a no-op `none` so `background:var(--shine-gloss), ...` still parses.
  assert.ok(shineBlock.startsWith('--shine-gloss:none;'), shineBlock);
});

test('REAL CASCADE: .analysis-index-chip and .nav-pill/.nav-pill.active box-shadows resolve to their exact pre-conversion literals', (assert)=>{
  const chipBlock = extractRuleBlock(src, '.analysis-index-chip');
  assert.match(resolveVars(chipBlock), /box-shadow:0 1px 0 rgba\(255,255,255,0\.04\) inset;/, '.analysis-index-chip inset highlight must byte-match the original literal');

  const pillBlock = extractRuleBlock(src, '\n  .nav-pill');
  // v3.288 (Glass & glow tab bar): a resting tab casts nothing.
  assert.match(pillBlock, /box-shadow:none;/, '.nav-pill has no highlight since v3.288');

  const activeBlock = extractRuleBlock(src, '.nav-pill.active');
  // v3.283: the active pill's glow was retired (see test-nav-pill-visual-weight.js).
  assert.doesNotMatch(activeBlock, /box-shadow/, '.nav-pill.active has no glow since v3.283');
});

test('sabotage-relevant: the neutral-rgba sweep is genuinely complete inside the <style> block — no literal rgba(255,255,255,…) or rgba(0,0,0,…) remains there', (assert)=>{
  const styleMatch = /<style>([\s\S]*?)<\/style>/.exec(src);
  if(!styleMatch) throw new Error('could not locate the <style> block');
  const styleBlock = styleMatch[1];
  assert.doesNotMatch(styleBlock, /rgba\(255,255,255,/, 'every in-stylesheet white rgba() literal must now be var()-based');
  assert.doesNotMatch(styleBlock, /rgba\(0,0,0,/, 'every in-stylesheet black rgba() literal must now be var()-based');
});

test('sabotage-relevant: the real total count of converted sites matches what this pass actually touched (95 white, 64 black) — not a partial sweep that happens to pass the spot-checks above', (assert)=>{
  const whiteCount = (src.match(/rgba\(var\(--surface-white-rgb\),/g) || []).length;
  const blackCount = (src.match(/rgba\(var\(--overlay-black-rgb\),/g) || []).length;
  assert.strictEqual(whiteCount, 95, 'the real total of rgba(var(--surface-white-rgb), occurrences in the file must be 95 — every white-alpha CSS declaration in the <style> block, and no more (the :root declaration line itself is `--surface-white-rgb:255,255,255;`, which has no rgba( prefix and so is not counted here). History: 114 -> 113 when a visual-formatting pass deleted a dead, superseded .program-intro{...} rule (see test-program-intro-divider-fix.js); 113 -> 100 when the same pass factored 15 exact-duplicate box-shadow literals (10x the 0.25 "CTA gloss" inset highlight, 5x the 0.35 "FAB gloss" inset highlight) into --cta-gloss-inset/--fab-gloss-inset tokens (see test-css-mechanical-token-dedup.js) — each literal site still resolves the same rgba(), just through a token now instead of 15 separate copies of the text; 100 -> 99 in v3.275 (tasteskill Today pilot) when .adapt-workout-toggle lost its box-shadow, whose inset highlight was one white-alpha site (see test-today-hero-glow-flat-buttons.js); 99 -> 98 in v3.277 when the 0.07 white border on base .card became transparent as cards went flat app-wide (see test-flat-cards.js); 98 -> 97 in v3.278 when the streak pill lost its inset highlight and glow (see test-header-refresh.js); 97 -> 94 in v3.280 when --shine-gloss (two white stops) became none and the .save-btn sheen stripe was removed (see test-flat-controls.js); 94 -> 88 in v3.283 when resting buttons/panels lost their highlight shadows and the two FABs lost their gloss (see test-today-no-glow.js); 88 -> 92 in v3.286 when the Glass & glow tokens (--glass-fill x2, --glass-hair, --glass-shine) were added in :root (see test-glass-cards.js); 92 -> 90 in v3.288 when the tab pills and the old pinned search pill lost their highlights (see test-nav-pill-visual-weight.js); 90 -> 94 in v3.290 when the Up next card was added: its glass panel (2 stops), ring track and input placeholder (see test-up-next.js); 94 -> 95 in v3.298 for the resting fill of the set chips (see test-set-chips.js); 95 -> 98 in v3.299 for the set sheet: its grabber, stepper buttons and RPE pills (see test-set-sheet.js); 98 -> 95 in v3.300 when the plate calculator and voice set logging were removed: the highlights on the gym-mode result panel and voice line, and the plate cell divider (see test-plate-voice-removed.js)');
  // 61, not the original 60 — .food-add-pop (v3.240's "+1" confirmation
  // pop) added one new legitimate rgba(var(--overlay-black-rgb),…)
  // box-shadow site. 62 in v3.286 (--glass-shadow), 61 in v3.287 when the coach
  // button's neutral float shadow became --cta-glow (Glass & glow).
  assert.strictEqual(blackCount, 64, 'the real total of rgba(var(--overlay-black-rgb), occurrences in the file must be 64 — every black-alpha CSS declaration in the <style> block, and no more. History: 61 -> 62 in v3.290 for the Up next card\'s dark input wells (see test-up-next.js); 62 -> 64 in v3.299 for the set sheet scrim and its stepper wells (see test-set-sheet.js)');
});

test('regression guard: the three canvas ctx.strokeStyle white-rgba assignments were deliberately left as literals, not converted — Canvas 2D context strings do not resolve CSS custom properties', (assert)=>{
  const canvasOccurrences = (src.match(/ctx\.strokeStyle = 'rgba\(255,255,255,[\d.]+\)';/g) || []).length;
  assert.strictEqual(canvasOccurrences, 3, 'all three real canvas stroke-color assignments must still be plain literal strings — a var()-based string here would silently break the canvas drawing rather than fail loudly');
  assert.strictEqual((src.match(/ctx\.strokeStyle = 'rgba\(var\(/g) || []).length, 0, 'no canvas ctx.strokeStyle assignment should ever have been converted to var() form');
});

run();
