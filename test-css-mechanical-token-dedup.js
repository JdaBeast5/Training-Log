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

run();
