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

// 2026-10-28 (v3.477): the light appearance redefines some of these tokens
// inside @media (prefers-color-scheme: light){ body:not(.gym-mode){…} }. Every check here is
// about the dark design of record, so that one block is left out of the text
// this suite counts in (test-light-mode.js covers it).
const LIGHT_BLOCK = /  @media \(prefers-color-scheme: light\)\{\n[\s\S]*?    body:not\(\.gym-mode\)\{[\s\S]*?\n    \}\n  \}\n/; // v3.480: on body
const rawSrc = readIndexSource();
if(!LIGHT_BLOCK.test(rawSrc)) throw new Error('anchor: the light token block was not found');
const src = rawSrc.replace(LIGHT_BLOCK, '');
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
  // 2026-10-27 (v3.402): the dark inset layer became var(--rim), the glass
  // highlight the fields now wear (test-fields-translucent.js); the focus ring
  // layer this test is about still resolves to the same literal.
  assert.strictEqual(care, '.care-input:focus{outline:none; border-color:var(--plate-blue); box-shadow:var(--rim), 0 0 0 3px rgba(var(--plate-blue-rgb),0.15);}');
});

// ── Gym-panel gradient: 4 real call sites ───────────────────────────────
// v3.300 (owner request): the plate calculator and voice set logging were removed with the set chips.
// Its result panel was one of the four sites; three remain.
// 2026-10-26 (v3.316): 3 -> 1. The gym-mode set-row well and note field were
// removed with the rest of the gym-mode set-row styling (gym mode hides those
// rows behind the set chips; see test-gym-mode-audit-fixes.js). The warm-up
// box is the token's one remaining call site.
test('sabotage-relevant: var(--gym-panel-gradient) appears at exactly 1 real call site', (assert)=>{
  const count = (src.match(/var\(--gym-panel-gradient\)/g) || []).length;
  assert.strictEqual(count, 1, `expected 1 usage site, found ${count}`);
});

test('REAL CASCADE: body.gym-mode .warmup-box resolves to the exact pre-conversion gradient literal (the set-row well and note field were removed in v3.316)', (assert)=>{
  const grad = extractCustomProp(rootBlock, 'gym-panel-gradient');
  assert.strictEqual(grad, 'linear-gradient(170deg, #181C22 0%, #0F1216 62%, #0B0D11 100%)', 'sanity: token holds the known pre-conversion literal');

  for(const selector of ['body.gym-mode .warmup-box']){
    const block = extractRuleBlock(src, selector);
    const resolved = resolveToken(block, 'gym-panel-gradient', grad);
    assert.ok(resolved.includes(`background:${grad};`), `${selector} must resolve to the exact pre-conversion gradient, got: ${resolved}`);
    assert.doesNotMatch(resolved, /var\(--gym-panel-gradient\)/, `${selector} must have no unresolved var() left after substitution`);
  }
});

// ── .vol-bar-fill: swapped to the already-existing --cta-gradient-blue ──
// 2026-11-16 (v3.580, UX-03, flat ground): --cta-gradient-* are retired; the bar is the flat blue spot ink.
test('REAL source (v3.580, UX-03): .vol-bar-fill is the flat --spot-blue, and no --cta-gradient token remains', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.vol-bar-fill'), 1);
  assert.match(extractRuleBlock(src, '.vol-bar-fill'), /background:var\(--spot-blue\)/);
  assert.doesNotMatch(src, /var\(--cta-gradient-|--cta-gradient-[a-z]+:/, 'no use and no declaration (the retirement comment may name it)');
});

// ── CTA gloss inset: 10 real call sites ─────────────────────────────────
test('sabotage-relevant: --cta-gloss-inset and --fab-gloss-inset are each declared exactly once, in :root', (assert)=>{
  assert.strictEqual((src.match(/--cta-gloss-inset:/g) || []).length, 1);
  assert.strictEqual((src.match(/--fab-gloss-inset:/g) || []).length, 1);
  assert.ok(rootBlock.includes('--cta-gloss-inset:'), 'must live in :root');
  assert.ok(rootBlock.includes('--fab-gloss-inset:'), 'must live in :root');
});

test('sabotage-relevant: var(--cta-gloss-inset) appears at exactly 10 real call sites, var(--fab-gloss-inset) at exactly 6', (assert)=>{
  // 10 -> 3 in v3.280: the gloss highlight came off .save-btn (base + :active),
  // .day-done-badge, the supplement/grocery checks, .program-rec-btn and
  // .recipe-log-btn/.supplement-add-btn when filled controls went flat.
  assert.strictEqual((src.match(/var\(--cta-gloss-inset\)/g) || []).length, 3);
  // 6, not the original 5 — .coach-fab.dragging (the drag-to-reposition
  // feature) reuses this same token for its own lift-shadow, consistent
  // with every other FAB active/hover state already doing so.
  // 6 -> 1 in v3.283: both FABs (base, :active, .dragging) and their gloss
  // went neutral; only .day-hero-plate, the modelled day plate, keeps it.
  assert.strictEqual((src.match(/var\(--fab-gloss-inset\)/g) || []).length, 1);
});

test('REAL CASCADE: a representative sample of --cta-gloss-inset call sites resolve to the exact pre-conversion literal', (assert)=>{
  const gloss = extractCustomProp(rootBlock, 'cta-gloss-inset');
  assert.strictEqual(gloss, '0 1px 0 rgba(var(--surface-white-rgb),0.25) inset', 'sanity: token holds the known pre-conversion literal');

  const checkboxBlock = resolveToken(extractRuleBlock(src, '.exercise input[type=checkbox]:checked'), 'cta-gloss-inset', gloss);
  assert.ok(checkboxBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.25) inset;'), `checkbox check must resolve to the exact pre-conversion single-layer shadow, got: ${checkboxBlock}`);

  // .save-btn left this sample in v3.280: it is flat now, with no shadow at all.
  // v3.287: no gloss inset on .save-btn; its only shadow is the --cta-glow token.
  assert.doesNotMatch(extractRuleBlock(src, '.save-btn'), /cta-gloss-inset/);
  assert.match(extractRuleBlock(src, '.save-btn'), /box-shadow:var\(--cta-glow\);/);

  const compareBtnBlock = resolveToken(extractRuleBlock(src, '.compare-confirm-btn'), 'cta-gloss-inset', gloss);
  assert.ok(compareBtnBlock.includes('box-shadow:0 1px 0 rgba(var(--surface-white-rgb),0.25) inset, 0 4px 12px -6px rgba(var(--plate-blue-rgb),0.5);'), `.compare-confirm-btn must resolve to its exact original shadow, got: ${compareBtnBlock}`);
});

// ── FAB gloss inset: 5 real call sites ──────────────────────────────────
test('REAL CASCADE: a representative sample of --fab-gloss-inset call sites resolve to the exact pre-conversion literal', (assert)=>{
  const gloss = extractCustomProp(rootBlock, 'fab-gloss-inset');
  assert.strictEqual(gloss, '0 1px 0 rgba(var(--surface-white-rgb),0.35) inset', 'sanity: token holds the known pre-conversion literal');

  const heroPlateBlock = resolveToken(extractRuleBlock(src, '.day-hero-plate'), 'fab-gloss-inset', gloss);
  assert.ok(heroPlateBlock.includes('0 1px 0 rgba(var(--surface-white-rgb),0.35) inset,'), `.day-hero-plate must resolve to its exact original shadow layer, got: ${heroPlateBlock}`);

  // .coach-fab left this sample in v3.283: it uses a neutral float shadow now.
  assert.doesNotMatch(extractRuleBlock(src, '.coach-fab'), /fab-gloss-inset/);

  // .today-fab:active's own glow color was later (a separate, deliberate
  // color fix, not a mechanical dedup — see test-today-fab-glow-color.js)
  // changed from an unlinked literal (255,184,92) to var(--plate-yellow-rgb),
  // matching how .coach-fab's own glow above already resolves through
  // --plate-blue-rgb rather than a hand-picked literal. Only the
  // --fab-gloss-inset layer (this test's actual subject) is checked here.
  // .today-fab:active left this sample in v3.283: pressing scales it, no glow.
  assert.doesNotMatch(extractRuleBlock(src, '.today-fab:active'), /fab-gloss-inset|box-shadow/);
});

// ── Glass blur + nav-glass background: 4 and 3 real call sites ─────────
test('sabotage-relevant: --glass-blur and --nav-glass-bg are each declared exactly once, in :root', (assert)=>{
  assert.strictEqual((src.match(/--glass-blur:/g) || []).length, 1);
  assert.strictEqual((src.match(/--nav-glass-bg:/g) || []).length, 1);
  assert.ok(rootBlock.includes('--glass-blur:'), 'must live in :root');
  assert.ok(rootBlock.includes('--nav-glass-bg:'), 'must live in :root');
});

// v3.299: +1 site for each token — the set sheet (Option 2's logger) is fixed
// chrome made of the same glass as the tab bar (see test-set-sheet.js).
test('sabotage-relevant: var(--glass-blur) appears at exactly 10 real occurrences (5 sites x 2 prefixed declarations each), var(--nav-glass-bg) at exactly 4', (assert)=>{
  // 2026-11-16 (v3.580, UX-03, flat ground): blur stays only on the tab bar (.nav-pills, 2 prefixed declarations);
  // the set sheet, status strip, jump rail and pull-refresh indicator went flat.
  assert.strictEqual((src.match(/var\(--glass-blur\)/g) || []).length, 2);
  // 2026-10-28 (v3.482): .analysis-index moved to its own lighter --index-glass-bg
  // (test-analysis-index-visual-weight.js).
  // 2026-11-02 (v3.483): .status-scrim joined the rail on --index-glass-bg.
  // 2026-11-16 (v3.580, UX-03, flat ground): the set sheet is --surface-1 now; only the tab bar reads it.
  assert.strictEqual((src.match(/var\(--nav-glass-bg\)/g) || []).length, 1);
});

test('REAL CASCADE: .nav-pills, .status-scrim, and .analysis-index all resolve to the exact pre-conversion background + backdrop-filter pair', (assert)=>{
  const blur = extractCustomProp(rootBlock, 'glass-blur');
  const navBg = extractCustomProp(rootBlock, 'nav-glass-bg');
  assert.strictEqual(blur, 'blur(18px) saturate(160%)', 'sanity: token holds the known pre-conversion literal');
  assert.strictEqual(navBg, 'rgba(10,11,13,0.72)', 'sanity: token holds the known pre-conversion literal');

  // 2026-10-28 (v3.482): .analysis-index left this pair for its own lighter glass.
  // 2026-11-02 (v3.483): .status-scrim moved to --index-glass-bg too.
  for(const selector of ['.nav-pills']){
    let block = extractRuleBlock(src, selector);
    block = resolveToken(block, 'glass-blur', blur);
    block = resolveToken(block, 'nav-glass-bg', navBg);
    assert.ok(block.includes('background:rgba(10,11,13,0.72);'), `${selector} must resolve to the exact pre-conversion background, got: ${block}`);
    assert.ok(block.includes('backdrop-filter:blur(18px) saturate(160%); -webkit-backdrop-filter:blur(18px) saturate(160%);'), `${selector} must resolve to the exact pre-conversion backdrop-filter pair, got: ${block}`);
  }
});

// 2026-11-16 (v3.580, UX-03, flat ground): the indicator is a solid --surface-1 with no blur.
test('REAL source (v3.580, UX-03): the pull-refresh indicator is solid --surface-1 with no blur', (assert)=>{
  const block = extractRuleBlock(src, '.pull-refresh-indicator');
  assert.match(block, /background:var\(--surface-1\);/);
  assert.doesNotMatch(block, /backdrop-filter|var\(--nav-glass-bg\)/);
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
  // 2026-11-16 (v3.580, UX-03, flat ground): every translucent surface fill became solid (--surface-1 / --surface-2),
  // so no dark call site remains; the tokens stay declared for the light block.
  assert.strictEqual((src.match(/rgba\(var\(--surface-rgb\),/g) || []).length, 0);
  // 4, not the original 3 — .food-add-pop (v3.240's "+1" confirmation pop)
  // added one new legitimate rgba(var(--surface2-rgb),…) site.
  assert.strictEqual((src.match(/rgba\(var\(--surface2-rgb\),/g) || []).length, 0);
});

test('sabotage-relevant: the neutral rgba(23,25,29,…)/rgba(31,34,38,…) literals are genuinely gone from the file, not just supplemented', (assert)=>{
  assert.doesNotMatch(src, /rgba\(23,25,29,/, 'every rgba(23,25,29,…) site must now go through var(--surface-rgb)');
  assert.doesNotMatch(src, /rgba\(31,34,38,/, 'every rgba(31,34,38,…) site must now go through var(--surface2-rgb)');
});

// 2026-11-16 (v3.580, UX-03, flat ground): the translucent sites this sample checked are solid now.
test('REAL source (v3.580, UX-03): the formerly translucent panels are solid surfaces (pull-refresh, the 360px picker box, sticky day header, celebrate banner, undo toast, food-add pop)', (assert)=>{
  assert.match(extractRuleBlock(src, '.pull-refresh-indicator'), /background:var\(--surface-1\);/);
  const box = src.split('\n').find(line => line.includes('max-width:360px') && line.includes('background:'));
  assert.ok(box && box.includes('background:var(--surface-1);'), box);
  for(const sel of ['.sticky-day-header', '.celebrate-banner', '.undo-toast', '.food-add-pop']) assert.match(extractRuleBlock(src, sel), /background:var\(--surface-2\);/, sel);
});

run();
