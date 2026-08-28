'use strict';
// Behavioral coverage for a small, mechanical, 1:1-same-computed-value CSS
// dedup — same method and same reasoning as the prior --plate-*-rgb /
// neutral-rgba consolidation passes (test-rgba-blue-yellow-consolidation.js,
// test-neutral-rgba-consolidation.js): three exact-literal repeats, each
// crossing this codebase's own established "3+ genuine duplication" bar
// (see the [PHASE H2.2] comment in :root), factored into a token with every
// call site swapped to var() and zero change to the resolved value.
//
// 1. --focus-ring-glow — `0 0 0 3px rgba(var(--plate-blue-rgb),0.15)` was
//    copy-pasted verbatim as the last layer of 4 separate box-shadow lists
//    (the base input:focus rule, .ex-input:focus, .program-select:focus,
//    .care-input:focus) because box-shadow doesn't cascade/merge between
//    rules — each override has to restate the whole list.
// 2. --gym-panel-gradient — the "recessed well" background
//    `linear-gradient(170deg, #181C22 0%, #0F1216 62%, #0B0D11 100%)` was
//    copy-pasted verbatim across 4 gym-mode panels; .plate-result's own
//    comment already said outright it was "the same gradient
//    .set-row-content/.warmup-box already use", just never centralized.
// 3. .vol-bar-fill's own gradient was a plain-literal duplicate of the
//    ALREADY-EXISTING --cta-gradient-blue token (byte-identical: 160deg,
//    #6E8AFF, var(--plate-blue) 60%) — swapped to the token directly, no
//    new token needed.
// 4. --cta-gloss-inset — `0 1px 0 rgba(var(--surface-white-rgb),0.25) inset`,
//    the top-highlight hairline on gradient-filled (CTA green/blue) flat
//    surfaces (checkmarks, save/log/compare buttons, chips) — 10 exact
//    call sites.
// 5. --fab-gloss-inset — the same idea, one alpha step stronger
//    (`...0.35) inset`), for large round/pill surfaces (.day-hero-plate,
//    coach-fab, today-fab, and each FAB's own :active state) — 5 exact
//    call sites.
// 6. --glass-blur — `blur(18px) saturate(160%)`, the single most-repeated
//    backdrop-filter recipe in the file: 4 exact call sites (.nav-pills,
//    .status-scrim, .analysis-index, and the pull-refresh indicator, whose
//    own comment already said it takes "the same treatment as every other
//    floating layer"). Each site restates it twice (unprefixed +
//    -webkit-, since backdrop-filter needs both), so 8 real occurrences.
// 7. --nav-glass-bg — `rgba(10,11,13,0.72)`, the near-black glass
//    background specific to the app's sticky navigation-adjacent bars
//    (.nav-pills, .status-scrim, .analysis-index) — 3 exact call sites,
//    always paired with --glass-blur. The pull-refresh indicator shares
//    the blur but not this background (it's --surface-toned, lighter), so
//    it correctly keeps its own literal background and is NOT part of
//    this token.
// 8. --surface-rgb / --surface2-rgb — a DIFFERENT kind of dedup from 1-7
//    above: not a full literal swapped for a token, but the R/G/B-triplet
//    decomposition already used for --plate-*-rgb and the neutral white/
//    black tokens, extended to cover a gap those earlier passes left open
//    (--surface/--surface2 had no RGB companion). 6 glass-panel sites
//    hand-typed rgba(23,25,29,OWN_ALPHA) and 3 hand-typed
//    rgba(31,34,38,OWN_ALPHA) — each site's own alpha is preserved
//    exactly; only the repeated triplet is factored out.
//
// jsdom's CSSOM does not resolve custom properties in getComputedStyle at
// all (documented by the prior H2.2/H2.3 passes) — so, same as those files,
// this proves the dedup via REAL-CASCADE TEXT SUBSTITUTION: pull each
// token's own definition out of the real extracted :root block (never
// hardcoded), substitute it into the real extracted call-site rule exactly
// as a browser's cascade would, and assert the resolved text is
// byte-identical to the literal that call site held before this pass
// (independently confirmed against the diff, not re-derived from it).
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-css-mechanical-token-dedup.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

function countRuleOpenings(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{', 'g');
  return (source.match(re) || []).length;
}

function hexToRgb(hex){
  const m = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(hex);
  if(!m) throw new Error(`hexToRgb: not a 6-digit hex color: ${hex}`);
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}

function extractRoot(source){
  const start = source.indexOf(':root{');
  if(start === -1) throw new Error('extractRoot: :root{ not found');
  let depth = 0, i = start;
  for(; i < source.length; i++){
    if(source[i] === '{') depth++;
    else if(source[i] === '}'){ depth--; if(depth === 0){ i++; break; } }
  }
  return source.slice(start, i);
}

function extractCustomProp(cssText, name){
  const re = new RegExp(`--${name}:([^;]+);`);
  const m = re.exec(cssText);
  if(!m) throw new Error(`extractCustomProp: --${name} not found`);
  return m[1].trim();
}

const rootBlock = extractRoot(src);

function resolveToken(ruleText, tokenName, tokenValue){
  return ruleText.replace(new RegExp(`var\\(--${tokenName}\\)`, 'g'), tokenValue);
}

// ── Tokens exist exactly once, defined in :root ─────────────────────────
test('sabotage-relevant: --focus-ring-glow and --gym-panel-gradient are each declared exactly once, in :root', (assert)=>{
  assert.strictEqual((src.match(/--focus-ring-glow:/g) || []).length, 1);
  assert.strictEqual((src.match(/--gym-panel-gradient:/g) || []).length, 1);
  assert.ok(rootBlock.includes('--focus-ring-glow:'), 'must live in :root');
  assert.ok(rootBlock.includes('--gym-panel-gradient:'), 'must live in :root');
});

// ── Focus-ring glow: 4 real call sites ──────────────────────────────────
test('sabotage-relevant: var(--focus-ring-glow) appears at exactly 4 real call sites (the base rule + 3 component overrides), matching what this pass actually touched', (assert)=>{
  const count = (src.match(/var\(--focus-ring-glow\)/g) || []).length;
  assert.strictEqual(count, 4, `expected 4 usage sites, found ${count}`);
});

test('REAL CASCADE: the base input:focus/select:focus/textarea:focus rule resolves to the exact pre-conversion literal', (assert)=>{
  const glow = extractCustomProp(rootBlock, 'focus-ring-glow');
  assert.strictEqual(glow, '0 0 0 3px rgba(var(--plate-blue-rgb),0.15)', 'sanity: token holds the known pre-conversion literal');
  const block = extractRuleBlock(src, 'input:focus, select:focus, textarea:focus');
  const resolved = resolveToken(block, 'focus-ring-glow', glow);
  assert.strictEqual(resolved, 'input:focus, select:focus, textarea:focus{\n    outline:none; border-color:var(--plate-blue); box-shadow:0 0 0 3px rgba(var(--plate-blue-rgb),0.15);\n  }');
});

test('REAL CASCADE: .ex-input:focus, .program-select:focus, .care-input:focus each resolve to their exact pre-conversion multi-layer box-shadow', (assert)=>{
  const glow = extractCustomProp(rootBlock, 'focus-ring-glow');

  const ex = resolveToken(extractRuleBlock(src, '.ex-input:focus'), 'focus-ring-glow', glow);
  assert.strictEqual(ex, '.ex-input:focus{outline:none; border-color:var(--plate-blue); box-shadow:0 1px 3px rgba(var(--overlay-black-rgb),0.25) inset, 0 0 0 3px rgba(var(--plate-blue-rgb),0.15);}');

  const prog = resolveToken(extractRuleBlock(src, '.program-select:focus'), 'focus-ring-glow', glow);
  assert.strictEqual(prog, '.program-select:focus{outline:none; border-color:var(--plate-blue); box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.06) inset, 0 4px 14px -8px rgba(var(--plate-blue-rgb),0.5), 0 0 0 3px rgba(var(--plate-blue-rgb),0.15);}');

  const care = resolveToken(extractRuleBlock(src, '.care-input:focus'), 'focus-ring-glow', glow);
  assert.strictEqual(care, '.care-input:focus{outline:none; border-color:var(--plate-blue); box-shadow:0 1px 3px rgba(var(--overlay-black-rgb),0.25) inset, 0 0 0 3px rgba(var(--plate-blue-rgb),0.15);}');
});

// ── Gym-panel gradient: 4 real call sites ───────────────────────────────
test('sabotage-relevant: var(--gym-panel-gradient) appears at exactly 4 real call sites', (assert)=>{
  const count = (src.match(/var\(--gym-panel-gradient\)/g) || []).length;
  assert.strictEqual(count, 4, `expected 4 usage sites, found ${count}`);
});

test('REAL CASCADE: body.gym-mode .set-row-content, .set-note-input, .plate-result, .warmup-box all resolve to the exact pre-conversion gradient literal', (assert)=>{
  const grad = extractCustomProp(rootBlock, 'gym-panel-gradient');
  assert.strictEqual(grad, 'linear-gradient(170deg, #181C22 0%, #0F1216 62%, #0B0D11 100%)', 'sanity: token holds the known pre-conversion literal');

  for(const selector of ['body.gym-mode .set-row-content', 'body.gym-mode .set-note-input', 'body.gym-mode .plate-result', 'body.gym-mode .warmup-box']){
    const block = extractRuleBlock(src, selector);
    const resolved = resolveToken(block, 'gym-panel-gradient', grad);
    assert.ok(resolved.includes(`background:${grad};`), `${selector} must resolve to the exact pre-conversion gradient, got: ${resolved}`);
    assert.doesNotMatch(resolved, /var\(--gym-panel-gradient\)/, `${selector} must have no unresolved var() left after substitution`);
  }
});

// ── .vol-bar-fill: swapped to the already-existing --cta-gradient-blue ──
test('REAL CASCADE: .vol-bar-fill now uses var(--cta-gradient-blue), which resolves to the exact literal it held before this pass', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.vol-bar-fill'), 1);
  const ctaBlue = extractCustomProp(rootBlock, 'cta-gradient-blue');
  assert.strictEqual(ctaBlue, 'linear-gradient(160deg, #6E8AFF, var(--plate-blue) 60%)', 'sanity: matches the known token value');
  const block = extractRuleBlock(src, '.vol-bar-fill');
  assert.match(block, /background:var\(--cta-gradient-blue\)/, 'expected .vol-bar-fill to reference the shared token, not a duplicate literal');
  const resolved = resolveToken(block, 'cta-gradient-blue', ctaBlue);
  assert.ok(resolved.includes(`background:${ctaBlue};`), 'resolved background must equal the exact pre-conversion literal');
});

// ── CTA gloss inset: 10 real call sites ─────────────────────────────────
test('sabotage-relevant: --cta-gloss-inset and --fab-gloss-inset are each declared exactly once, in :root', (assert)=>{
  assert.strictEqual((src.match(/--cta-gloss-inset:/g) || []).length, 1);
  assert.strictEqual((src.match(/--fab-gloss-inset:/g) || []).length, 1);
  assert.ok(rootBlock.includes('--cta-gloss-inset:'), 'must live in :root');
  assert.ok(rootBlock.includes('--fab-gloss-inset:'), 'must live in :root');
});

test('sabotage-relevant: var(--cta-gloss-inset) appears at exactly 10 real call sites, var(--fab-gloss-inset) at exactly 6', (assert)=>{
  assert.strictEqual((src.match(/var\(--cta-gloss-inset\)/g) || []).length, 10);
  // 6, not the original 5 — .coach-fab.dragging (the drag-to-reposition
  // feature) reuses this same token for its own lift-shadow, consistent
  // with every other FAB active/hover state already doing so.
  assert.strictEqual((src.match(/var\(--fab-gloss-inset\)/g) || []).length, 6);
});

test('REAL CASCADE: a representative sample of --cta-gloss-inset call sites resolve to the exact pre-conversion literal', (assert)=>{
  const gloss = extractCustomProp(rootBlock, 'cta-gloss-inset');
  assert.strictEqual(gloss, '0 1px 0 rgba(var(--surface-white-rgb),0.25) inset', 'sanity: token holds the known pre-conversion literal');

  const checkboxBlock = resolveToken(extractRuleBlock(src, '.exercise input[type=checkbox]:checked'), 'cta-gloss-inset', gloss);
  assert.ok(checkboxBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.25) inset;'), `checkbox check must resolve to the exact pre-conversion single-layer shadow, got: ${checkboxBlock}`);

  const saveBtnBlock = resolveToken(extractRuleBlock(src, '.save-btn'), 'cta-gloss-inset', gloss);
  assert.ok(saveBtnBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.25) inset, 0 6px 16px -6px rgba(var(--plate-blue-rgb),0.55);'), `.save-btn must resolve to its exact original multi-layer shadow, got: ${saveBtnBlock}`);

  const compareBtnBlock = resolveToken(extractRuleBlock(src, '.compare-confirm-btn'), 'cta-gloss-inset', gloss);
  assert.ok(compareBtnBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.25) inset, 0 4px 12px -6px rgba(var(--plate-blue-rgb),0.5);'), `.compare-confirm-btn must resolve to its exact original shadow, got: ${compareBtnBlock}`);
});

// ── FAB gloss inset: 5 real call sites ──────────────────────────────────
test('REAL CASCADE: a representative sample of --fab-gloss-inset call sites resolve to the exact pre-conversion literal', (assert)=>{
  const gloss = extractCustomProp(rootBlock, 'fab-gloss-inset');
  assert.strictEqual(gloss, '0 1px 0 rgba(var(--surface-white-rgb),0.35) inset', 'sanity: token holds the known pre-conversion literal');

  const heroPlateBlock = resolveToken(extractRuleBlock(src, '.day-hero-plate'), 'fab-gloss-inset', gloss);
  assert.ok(heroPlateBlock.includes('0 1px 0 rgba(var(--surface-white-rgb),0.35) inset,'), `.day-hero-plate must resolve to its exact original shadow layer, got: ${heroPlateBlock}`);

  const coachFabBlock = resolveToken(extractRuleBlock(src, '.coach-fab'), 'fab-gloss-inset', gloss);
  assert.ok(coachFabBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.35) inset, 0 14px 34px -8px rgba(var(--plate-blue-rgb),0.65), 0 0 50px -14px rgba(var(--plate-blue-rgb),0.55);'), `.coach-fab must resolve to its exact original shadow, got: ${coachFabBlock}`);

  // .today-fab:active's own glow color was later (a separate, deliberate
  // color fix, not a mechanical dedup — see test-today-fab-glow-color.js)
  // changed from an unlinked literal (255,184,92) to var(--plate-yellow-rgb),
  // matching how .coach-fab's own glow above already resolves through
  // --plate-blue-rgb rather than a hand-picked literal. Only the
  // --fab-gloss-inset layer (this test's actual subject) is checked here.
  const todayFabActiveBlock = resolveToken(extractRuleBlock(src, '.today-fab:active'), 'fab-gloss-inset', gloss);
  assert.ok(todayFabActiveBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.35) inset, 0 8px 20px -8px rgba(var(--plate-yellow-rgb),0.5);'), `.today-fab:active must resolve its --fab-gloss-inset layer correctly, got: ${todayFabActiveBlock}`);
});

// ── Glass blur + nav-glass background: 4 and 3 real call sites ─────────
test('sabotage-relevant: --glass-blur and --nav-glass-bg are each declared exactly once, in :root', (assert)=>{
  assert.strictEqual((src.match(/--glass-blur:/g) || []).length, 1);
  assert.strictEqual((src.match(/--nav-glass-bg:/g) || []).length, 1);
  assert.ok(rootBlock.includes('--glass-blur:'), 'must live in :root');
  assert.ok(rootBlock.includes('--nav-glass-bg:'), 'must live in :root');
});

test('sabotage-relevant: var(--glass-blur) appears at exactly 8 real occurrences (4 sites x 2 prefixed declarations each), var(--nav-glass-bg) at exactly 3', (assert)=>{
  assert.strictEqual((src.match(/var\(--glass-blur\)/g) || []).length, 8);
  assert.strictEqual((src.match(/var\(--nav-glass-bg\)/g) || []).length, 3);
});

test('REAL CASCADE: .nav-pills, .status-scrim, and .analysis-index all resolve to the exact pre-conversion background + backdrop-filter pair', (assert)=>{
  const blur = extractCustomProp(rootBlock, 'glass-blur');
  const navBg = extractCustomProp(rootBlock, 'nav-glass-bg');
  assert.strictEqual(blur, 'blur(18px) saturate(160%)', 'sanity: token holds the known pre-conversion literal');
  assert.strictEqual(navBg, 'rgba(10,11,13,0.72)', 'sanity: token holds the known pre-conversion literal');

  for(const selector of ['.nav-pills', '.status-scrim', '.analysis-index']){
    let block = extractRuleBlock(src, selector);
    block = resolveToken(block, 'glass-blur', blur);
    block = resolveToken(block, 'nav-glass-bg', navBg);
    assert.ok(block.includes('background:rgba(10,11,13,0.72);'), `${selector} must resolve to the exact pre-conversion background, got: ${block}`);
    assert.ok(block.includes('backdrop-filter:blur(18px) saturate(160%); -webkit-backdrop-filter:blur(18px) saturate(160%);'), `${selector} must resolve to the exact pre-conversion backdrop-filter pair, got: ${block}`);
  }
});

test('REAL CASCADE: the pull-refresh indicator resolves to its exact pre-conversion backdrop-filter, but keeps its OWN (non-nav) background unchanged in COLOR — just resolved through --surface-rgb now, not var(--nav-glass-bg)', (assert)=>{
  const blur = extractCustomProp(rootBlock, 'glass-blur');
  // .pull-refresh-indicator's background was later (a separate, purely-
  // mechanical dedup pass — see the --surface-rgb/--surface2-rgb tests
  // below) swapped from its own literal rgba(23,25,29,0.72) to
  // rgba(var(--surface-rgb),0.72), mirroring the existing --plate-*-rgb
  // pattern. Its resolved color is unchanged; what matters here is that
  // it stayed --surface-toned and did NOT become var(--nav-glass-bg) —
  // that's still a genuinely different, darker background.
  let block = extractRuleBlock(src, '.pull-refresh-indicator');
  assert.doesNotMatch(block, /var\(--nav-glass-bg\)/, '.pull-refresh-indicator must not have been folded into the nav-specific background token');
  assert.match(block, /background:rgba\(var\(--surface-rgb\),0\.72\);/, '.pull-refresh-indicator must reference --surface-rgb (its own --surface-toned background), not the near-black nav background');
  block = resolveToken(block, 'glass-blur', blur);
  assert.ok(block.includes('backdrop-filter:blur(18px) saturate(160%); -webkit-backdrop-filter:blur(18px) saturate(160%);'), `.pull-refresh-indicator must resolve to the exact pre-conversion backdrop-filter pair, got: ${block}`);
});

// ── --surface-rgb / --surface2-rgb: R/G/B-triplet decomposition ────────
test('sabotage-relevant: --surface-rgb and --surface2-rgb are each declared exactly once, in :root, and are the real hex-decode of --surface/--surface2', (assert)=>{
  assert.strictEqual((src.match(/--surface-rgb:/g) || []).length, 1);
  assert.strictEqual((src.match(/--surface2-rgb:/g) || []).length, 1);

  const surfaceHex = extractCustomProp(rootBlock, 'surface');
  const [r1,g1,b1] = hexToRgb(surfaceHex);
  assert.strictEqual(extractCustomProp(rootBlock, 'surface-rgb'), `${r1},${g1},${b1}`, `--surface-rgb must equal the hex-decoded ${surfaceHex}`);
  assert.strictEqual(extractCustomProp(rootBlock, 'surface-rgb'), '23,25,29', 'sanity: matches the known #17191D decode');

  const surface2Hex = extractCustomProp(rootBlock, 'surface2');
  const [r2,g2,b2] = hexToRgb(surface2Hex);
  assert.strictEqual(extractCustomProp(rootBlock, 'surface2-rgb'), `${r2},${g2},${b2}`, `--surface2-rgb must equal the hex-decoded ${surface2Hex}`);
  assert.strictEqual(extractCustomProp(rootBlock, 'surface2-rgb'), '31,34,38', 'sanity: matches the known #1F2226 decode');
});

test('sabotage-relevant: var(--surface-rgb) appears at exactly 6 real call sites, var(--surface2-rgb) at exactly 4', (assert)=>{
  assert.strictEqual((src.match(/rgba\(var\(--surface-rgb\),/g) || []).length, 6);
  // 4, not the original 3 — .food-add-pop (v3.240's "+1" confirmation pop)
  // added one new legitimate rgba(var(--surface2-rgb),…) site.
  assert.strictEqual((src.match(/rgba\(var\(--surface2-rgb\),/g) || []).length, 4);
});

test('sabotage-relevant: the neutral rgba(23,25,29,…)/rgba(31,34,38,…) literals are genuinely gone from the file, not just supplemented', (assert)=>{
  assert.doesNotMatch(src, /rgba\(23,25,29,/, 'every rgba(23,25,29,…) site must now go through var(--surface-rgb)');
  assert.doesNotMatch(src, /rgba\(31,34,38,/, 'every rgba(31,34,38,…) site must now go through var(--surface2-rgb)');
});

test('REAL CASCADE: a representative sample of --surface-rgb/--surface2-rgb call sites resolve to their exact pre-conversion literal, each keeping its OWN alpha', (assert)=>{
  const surfaceRgb = extractCustomProp(rootBlock, 'surface-rgb');
  const surface2Rgb = extractCustomProp(rootBlock, 'surface2-rgb');

  // .pull-refresh-indicator: 0.72 alpha, --surface
  const pullRefreshBlock = resolveToken(extractRuleBlock(src, '.pull-refresh-indicator'), 'surface-rgb', surfaceRgb);
  assert.ok(pullRefreshBlock.includes('background:rgba(23,25,29,0.72);'), `.pull-refresh-indicator must resolve to its exact original 0.72 alpha, got: ${pullRefreshBlock}`);

  // .sub-modal-sheet-area (or whichever selector holds the 0.9 alpha,
  // originally the highest of the 6 --surface sites — max-width:360px is
  // this rule's other distinguishing declaration, used to disambiguate it
  // from any other rule that might also reference --surface-rgb).
  const highAlphaBlock = src.split('\n').find(line => line.includes('max-width:360px') && line.includes('--surface-rgb'));
  assert.ok(highAlphaBlock, 'expected to find the 0.9-alpha --surface-rgb site (max-width:360px sheet)');
  const resolvedHighAlpha = resolveToken(highAlphaBlock, 'surface-rgb', surfaceRgb);
  assert.match(resolvedHighAlpha, /background:rgba\(23,25,29,0\.9\);/, `expected the 0.9-alpha site to resolve to its exact original alpha, got: ${resolvedHighAlpha}`);

  // The four --surface2 sites keep their own distinct alphas (0.72, 0.78,
  // 0.75, plus 0.85 from .food-add-pop — v3.240's "+1" confirmation pop,
  // added after this pass).
  const alphas = [...src.matchAll(/rgba\(var\(--surface2-rgb\),([\d.]+)\)/g)].map(m => m[1]);
  assert.deepStrictEqual(alphas.sort(), ['0.72', '0.75', '0.78', '0.85'].sort(), 'the 4 --surface2-rgb sites must keep their own distinct original alphas, not collapse to one shared value');
  for(const alpha of alphas){
    assert.ok(`rgba(${surface2Rgb},${alpha})` === `rgba(31,34,38,${alpha})`, `--surface2-rgb must resolve to 31,34,38 regardless of which site's alpha is applied`);
  }
});

run();
