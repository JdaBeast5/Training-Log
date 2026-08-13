'use strict';
// Behavioral coverage for the H2.2 follow-up to H2.1 (v3.92, "Consolidate
// colored-glow box-shadow literals into --plate-*-rgb tokens"). H2.1 only
// tokenized box-shadow/filter colored-glow literals and explicitly left
// every rgba() literal inside background/border/gradient declarations
// untouched, scoped by a script that required a pixel-offset shadow shape
// immediately before rgba() so it could never touch those. This pass
// extends the SAME --plate-*-rgb mechanism to a bounded batch of those
// background/border/gradient literals: every genuinely-repeated (3+ call
// sites) plate-family accent color outside Gym Mode that isn't --plate-blue
// or --plate-yellow (those two are the largest remaining categories, left
// for a dedicated follow-up pass to keep this increment inside a reviewable
// 20-40 site bound, same "one consolidation at a time" discipline CLAUDE.md
// asks for).
//
// Two new companions were added because their color appeared 3+ times as a
// literal with no existing -rgb companion: --plate-teal-rgb (6 real
// background/border sites, plus 3 left alone inside Gym Mode) and
// --plate-purple-rgb (4 sites, all outside Gym Mode). Every other converted
// site reuses a companion H2.1 already defined (red/green/orange).
//
// jsdom's CSSOM (cssstyle) does not resolve custom properties in
// getComputedStyle at all — rgba(var(--x-rgb),0.5) and a plain unset
// property both compute to the same rgba(0,0,0,0)/rgb(0,0,0) regardless of
// what --x-rgb holds, verified directly against a minimal jsdom document
// before writing this file. A getComputedStyle-based "before vs after"
// comparison would therefore not actually be testing anything for the var()
// sites — both states would read identical. So this file follows this
// project's own documented fallback for exactly that situation: a real-
// cascade check that manually substitutes each rule's var(--plate-X-rgb)
// with the SAME companion declaration found in the real extracted :root
// block, and asserts the resolved string is byte-identical to the literal
// rgba(...) that call site held before this pass (independently verified
// against the diff, not re-derived from it).
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rgba-background-border-consolidation.js');

// Non-greedy match to the next top-level '}' — safe here because none of
// the selectors below are @media-wrapped and CSS declaration values in this
// file never themselves contain a literal '}'.
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

// Extracts the :root{...} block up to its real matching close (brace-depth
// aware — :root has no nested braces today, but this is robust either way).
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

// Pulls `--name:VALUE;` out of a CSS text block, trimmed.
function extractCustomProp(cssText, name){
  const re = new RegExp(`--${name}:([^;]+);`);
  const m = re.exec(cssText);
  if(!m) throw new Error(`extractCustomProp: --${name} not found`);
  return m[1].trim();
}

// The Gym Mode CSS block boundary, by the same text markers used elsewhere
// in this file's own comments (the "── GYM MODE" header through the
// "[PRINT REPORT]" section that follows it) — a name-based lookup, not a
// hardcoded line range, so it survives drift the same way the rest of this
// project's tests do.
function extractGymModeBlock(source){
  const start = source.indexOf('── GYM MODE');
  const end = source.indexOf('[PRINT REPORT]', start);
  if(start === -1 || end === -1) throw new Error('extractGymModeBlock: markers not found');
  return source.slice(start, end);
}

const rootBlock = extractRoot(src);
const gymBlock = extractGymModeBlock(src);

// ── The two new companions ──────────────────────────────────────────────
test('sabotage-relevant: --plate-teal-rgb is declared exactly once in :root', (assert)=>{
  const count = (rootBlock.match(/--plate-teal-rgb:/g) || []).length;
  assert.strictEqual(count, 1, `expected exactly one --plate-teal-rgb declaration, found ${count}`);
});

test('sabotage-relevant: --plate-purple-rgb is declared exactly once in :root', (assert)=>{
  const count = (rootBlock.match(/--plate-purple-rgb:/g) || []).length;
  assert.strictEqual(count, 1, `expected exactly one --plate-purple-rgb declaration, found ${count}`);
});

test('--plate-teal-rgb is the real R,G,B decode of the real --plate-teal hex, not a guessed/typo\'d triple', (assert)=>{
  const hex = extractCustomProp(rootBlock, 'plate-teal');
  const [r,g,b] = hexToRgb(hex);
  const rgbProp = extractCustomProp(rootBlock, 'plate-teal-rgb');
  assert.strictEqual(rgbProp, `${r},${g},${b}`, `--plate-teal-rgb must equal the hex-decoded ${hex}`);
  assert.strictEqual(rgbProp, '47,184,196', 'sanity: matches the known #2FB8C4 decode');
});

test('--plate-purple-rgb is the real R,G,B decode of the real --plate-purple hex, not a guessed/typo\'d triple', (assert)=>{
  const hex = extractCustomProp(rootBlock, 'plate-purple');
  const [r,g,b] = hexToRgb(hex);
  const rgbProp = extractCustomProp(rootBlock, 'plate-purple-rgb');
  assert.strictEqual(rgbProp, `${r},${g},${b}`, `--plate-purple-rgb must equal the hex-decoded ${hex}`);
  assert.strictEqual(rgbProp, '178,107,255', 'sanity: matches the known #B26BFF decode');
});

// ── Real-cascade resolution helper ──────────────────────────────────────
// Builds a map of every --plate-*-rgb companion straight from the real
// :root block (not hardcoded), then, for a given rule block, substitutes
// each rgba(var(--plate-X-rgb),ALPHA) with rgba(R,G,B,ALPHA) exactly as a
// browser's cascade would — proving the token really does resolve to the
// pre-conversion literal, not just that the var() text is present.
function companionMap(){
  const map = {};
  const re = /--plate-(\w+)-rgb:([\d,]+);/g;
  let m;
  while((m = re.exec(rootBlock))) map[m[1]] = m[2];
  return map;
}
const companions = companionMap();

function resolveVars(ruleText){
  return ruleText.replace(/var\(--plate-(\w+)-rgb\)/g, (whole, name) => {
    if(!companions[name]) throw new Error(`resolveVars: no companion found for --plate-${name}-rgb`);
    return companions[name];
  });
}

// ── Representative sample across all 5 converted colors and every
//    declaration TYPE this pass touched (plain background, border/
//    border-color, a multi-stop linear-gradient, and a filter drop-shadow) ──

test('REAL CASCADE: .supplement-streak gradient+border (green) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.supplement-streak'), 1, '.supplement-streak must be declared exactly once');
  const block = extractRuleBlock(src, '.supplement-streak');
  assert.doesNotMatch(block, /rgba\(50,\s*215,\s*75,/, 'the literal green rgba() must be gone');
  assert.match(block, /background:linear-gradient\(160deg, rgba\(var\(--plate-green-rgb\),0\.14\), rgba\(var\(--plate-green-rgb\),0\.05\)\);/, 'gradient stops must reference the token with alphas preserved');
  assert.match(block, /border:1px solid rgba\(var\(--plate-green-rgb\),0\.32\);/, 'border must reference the token with alpha preserved');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:linear-gradient\(160deg, rgba\(50,215,75,0\.14\), rgba\(50,215,75,0\.05\)\);/, 'resolved gradient must byte-match the original literal gradient');
  assert.match(resolved, /border:1px solid rgba\(50,215,75,0\.32\);/, 'resolved border must byte-match the original literal border');
});

test('REAL CASCADE: .voice-feedback background+border (red) resolve to the exact pre-conversion literals', (assert)=>{
  // Declared twice by design: the base rule here, plus a Gym Mode sizing
  // override (`body.gym-mode .voice-feedback{...}`) that this pass must not
  // touch — verified separately below. extractRuleBlock always returns the
  // FIRST match in source order, which is this base (non-Gym-Mode) rule.
  assert.strictEqual(countRuleOpenings(src, '.voice-feedback'), 2, '.voice-feedback must be declared exactly twice: the base rule and its Gym Mode override');
  const block = extractRuleBlock(src, '.voice-feedback');
  assert.doesNotMatch(block, /rgba\(255,\s*69,\s*58,/, 'the literal red rgba() must be gone');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(255,69,58,0\.1\);/, 'resolved background must byte-match the original literal');
  assert.match(resolved, /border:1px solid rgba\(255,69,58,0\.3\);/, 'resolved border must byte-match the original literal');
});

test('REAL CASCADE: .warmup-box background+border (orange) resolve to the exact pre-conversion literals', (assert)=>{
  // Same Gym-Mode-override shape as .voice-feedback above.
  assert.strictEqual(countRuleOpenings(src, '.warmup-box'), 2, '.warmup-box must be declared exactly twice: the base rule and its Gym Mode override');
  const block = extractRuleBlock(src, '.warmup-box');
  assert.doesNotMatch(block, /rgba\(255,\s*122,\s*51,/, 'the literal orange rgba() must be gone');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(255,122,51,0\.08\);/, 'resolved background must byte-match the original literal');
  assert.match(resolved, /border:1px solid rgba\(255,122,51,0\.28\);/, 'resolved border must byte-match the original literal');
});

test('REAL CASCADE: .rest-timer.tier-strength border+filter drop-shadow (purple, a NEW companion) resolve to the exact pre-conversion literals', (assert)=>{
  const block1 = extractRuleBlock(src, '.rest-timer.tier-strength .rest-timer-ring-progress');
  const block2 = extractRuleBlock(src, '.rest-timer.tier-strength');
  assert.doesNotMatch(block1 + block2, /rgba\(178,\s*107,\s*255,/, 'the literal purple rgba() must be gone from both rules');
  const resolved1 = resolveVars(block1);
  const resolved2 = resolveVars(block2);
  assert.match(resolved1, /filter:drop-shadow\(0 0 4px rgba\(178,107,255,0\.7\)\);/, 'resolved filter drop-shadow must byte-match the original literal');
  assert.match(resolved2, /border-color:rgba\(178,107,255,0\.5\);/, 'resolved border-color must byte-match the original literal');
});

test('REAL CASCADE: .rest-timer.tier-endurance border+filter drop-shadow (teal, a NEW companion) resolve to the exact pre-conversion literals', (assert)=>{
  const block1 = extractRuleBlock(src, '.rest-timer.tier-endurance .rest-timer-ring-progress');
  const block2 = extractRuleBlock(src, '.rest-timer.tier-endurance');
  assert.doesNotMatch(block1 + block2, /rgba\(47,\s*184,\s*196,/, 'the literal teal rgba() must be gone from both rules');
  const resolved1 = resolveVars(block1);
  const resolved2 = resolveVars(block2);
  assert.match(resolved1, /filter:drop-shadow\(0 0 4px rgba\(47,184,196,0\.7\)\);/, 'resolved filter drop-shadow must byte-match the original literal');
  assert.match(resolved2, /border-color:rgba\(47,184,196,0\.5\);/, 'resolved border-color must byte-match the original literal');
});

test('REAL CASCADE: .pr-type-tag background+border (purple) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.pr-type-tag'), 1, '.pr-type-tag must be declared exactly once');
  const block = extractRuleBlock(src, '.pr-type-tag');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(178,107,255,0\.12\);/, 'resolved background must byte-match the original literal');
  assert.match(resolved, /border:1px solid rgba\(178,107,255,0\.3\);/, 'resolved border must byte-match the original literal');
});

test('REAL CASCADE: .drop-set-row and its children (teal) resolve to the exact pre-conversion literals', (assert)=>{
  const rowBlock = extractRuleBlock(src, '.drop-set-row');
  const inputBlock = extractRuleBlock(src, '.drop-set-row .ex-input');
  const btnBlock = extractRuleBlock(src, '.set-drop-btn.has-drops');
  assert.match(resolveVars(rowBlock), /background:rgba\(47,184,196,0\.08\);/, 'row background must byte-match the original literal');
  assert.match(resolveVars(inputBlock), /border-color:rgba\(47,184,196,0\.30\);/, 'row input border must byte-match the original literal');
  assert.match(resolveVars(btnBlock), /border-color:rgba\(47,184,196,0\.45\);/, 'has-drops button border must byte-match the original literal');
});

test('REAL CASCADE: .warmup-set-row-content gradient background and .warmup-restore-btn border (orange) resolve to the exact pre-conversion literals', (assert)=>{
  const gradBlock = extractRuleBlock(src, '.warmup-set-row-content');
  assert.match(resolveVars(gradBlock), /background:linear-gradient\(rgba\(255,122,51,0\.08\), rgba\(255,122,51,0\.08\)\), var\(--surface\);/, 'resolved two-stop gradient must byte-match the original literal pair');
  const restoreBlock = extractRuleBlock(src, '.warmup-restore-btn');
  assert.match(resolveVars(restoreBlock), /border:1px dashed rgba\(255,122,51,0\.35\);/, 'resolved dashed border must byte-match the original literal');
});

test('REAL CASCADE: .care-banner-urgent and .app-banner-urgent (red) resolve to the exact pre-conversion literals', (assert)=>{
  const careBlock = extractRuleBlock(src, '.care-banner-urgent');
  const appBlock = extractRuleBlock(src, '.app-banner-urgent');
  assert.match(resolveVars(careBlock), /background:rgba\(255,69,58,0\.12\); border:1px solid rgba\(255,69,58,0\.42\);/, 'resolved care banner must byte-match the original literal');
  assert.match(resolveVars(appBlock), /background:rgba\(255,69,58,0\.12\); border:1px solid rgba\(255,69,58,0\.42\);/, 'resolved app banner must byte-match the original literal');
});

// ── Gym Mode must stay untouched ────────────────────────────────────────
test('regression guard: Gym Mode keeps its own literal orange/teal rgba() values, not converted to var() by this pass', (assert)=>{
  const orangeLiterals = (gymBlock.match(/rgba\(255,\s*122,\s*51,/g) || []).length;
  const tealLiterals = (gymBlock.match(/rgba\(47,\s*184,\s*196,/g) || []).length;
  assert.ok(orangeLiterals >= 3, `Gym Mode should still hold real literal orange rgba() sites, found ${orangeLiterals}`);
  assert.ok(tealLiterals >= 3, `Gym Mode should still hold real literal teal rgba() sites, found ${tealLiterals}`);
  const orangeVarUse = (gymBlock.match(/rgba\(var\(--plate-orange-rgb\)/g) || []).length;
  const tealVarUse = (gymBlock.match(/rgba\(var\(--plate-teal-rgb\)/g) || []).length;
  assert.strictEqual(orangeVarUse, 0, 'this pass must not have touched Gym Mode\'s orange literals');
  assert.strictEqual(tealVarUse, 0, 'this pass must not have touched Gym Mode\'s teal literals');
});

// ── Full accounting: every targeted literal outside Gym Mode is gone ─────
test('sabotage-relevant: zero literal rgba(R,G,B,...) remain OUTSIDE Gym Mode for all 5 converted colors', (assert)=>{
  const styleStart = src.indexOf('<style>');
  const styleEnd = src.indexOf('</style>');
  const gymStart = src.indexOf('── GYM MODE', styleStart);
  const gymEnd = src.indexOf('[PRINT REPORT]', gymStart);
  const before = src.slice(styleStart, gymStart);
  const after = src.slice(gymEnd, styleEnd);
  const targets = {
    red: [255,69,58], green: [50,215,75], orange: [255,122,51],
    teal: [47,184,196], purple: [178,107,255],
  };
  for(const [name, [r,g,b]] of Object.entries(targets)){
    const re = new RegExp(`rgba\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*,`, 'g');
    const remaining = (before.match(re) || []).length + (after.match(re) || []).length;
    assert.strictEqual(remaining, 0, `expected zero remaining literal ${name} rgba() outside Gym Mode, found ${remaining}`);
  }
});

run();
