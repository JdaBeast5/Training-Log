'use strict';
// Behavioral coverage for H2.3, the direct follow-up to H2.2 ("Extend
// --plate-*-rgb rgba() token consolidation to background/border/gradient
// literals", v3.171). H2.2 converted a bounded 38-site batch across five
// colors (red/green/orange/teal/purple) and explicitly left --plate-blue (37
// sites) and --plate-yellow (20 sites) for a dedicated follow-up pass, since
// together they were the two largest remaining categories and converting all
// 57 sites at once would have blown past H2.2's own 20-40-site reviewable
// bound. This is that follow-up: both colors, same mechanism, no new
// companions needed — --plate-blue-rgb (91,124,255) and --plate-yellow-rgb
// (245,197,24) were both already defined back in H2.1 (v3.92), so this pass
// only swaps call sites, it adds nothing to :root.
//
// Same jsdom limitation H2.2 documented still applies: jsdom's CSSOM
// (cssstyle) does not resolve custom properties in getComputedStyle at all,
// so a getComputedStyle before/after comparison on a var()-based rgba() would
// prove nothing (verified directly by H2.2, not re-verified here since
// nothing about that limitation has changed). This file follows the same
// real-cascade substitution proof: manually substitute each rule's
// var(--plate-X-rgb) with the SAME companion value pulled from the real
// extracted :root block, and assert the resolved string is byte-identical to
// the literal rgba(...) that call site held before this pass (independently
// verified against the diff, not re-derived from it).
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rgba-blue-yellow-consolidation.js');

// Non-greedy match to the next top-level '}' — safe here because none of the
// selectors below are @media-wrapped and CSS declaration values in this file
// never themselves contain a literal '}'.
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

// The Gym Mode CSS block boundary, by the same text markers H2.1/H2.2 used
// (the "── GYM MODE" header through the "[PRINT REPORT]" section after it) —
// a name-based lookup, not a hardcoded line range, so it survives drift.
function extractGymModeBlock(source){
  const start = source.indexOf('── GYM MODE');
  const end = source.indexOf('[PRINT REPORT]', start);
  if(start === -1 || end === -1) throw new Error('extractGymModeBlock: markers not found');
  return source.slice(start, end);
}

const rootBlock = extractRoot(src);
const gymBlock = extractGymModeBlock(src);

// ── Both companions already existed before this pass (H2.1) ────────────────
test('sabotage-relevant: --plate-blue-rgb and --plate-yellow-rgb are each declared exactly once in :root (this pass adds no new companions)', (assert)=>{
  const blueCount = (rootBlock.match(/--plate-blue-rgb:/g) || []).length;
  const yellowCount = (rootBlock.match(/--plate-yellow-rgb:/g) || []).length;
  assert.strictEqual(blueCount, 1, `expected exactly one --plate-blue-rgb declaration, found ${blueCount}`);
  assert.strictEqual(yellowCount, 1, `expected exactly one --plate-yellow-rgb declaration, found ${yellowCount}`);
});

test('--plate-blue-rgb is the real R,G,B decode of the real --plate-blue hex, not a guessed/typo\'d triple', (assert)=>{
  const hex = extractCustomProp(rootBlock, 'plate-blue');
  const [r,g,b] = hexToRgb(hex);
  const rgbProp = extractCustomProp(rootBlock, 'plate-blue-rgb');
  assert.strictEqual(rgbProp, `${r},${g},${b}`, `--plate-blue-rgb must equal the hex-decoded ${hex}`);
  assert.strictEqual(rgbProp, '91,124,255', 'sanity: matches the known #5B7CFF decode');
});

test('--plate-yellow-rgb is the real R,G,B decode of the real --plate-yellow hex, not a guessed/typo\'d triple', (assert)=>{
  const hex = extractCustomProp(rootBlock, 'plate-yellow');
  const [r,g,b] = hexToRgb(hex);
  const rgbProp = extractCustomProp(rootBlock, 'plate-yellow-rgb');
  assert.strictEqual(rgbProp, `${r},${g},${b}`, `--plate-yellow-rgb must equal the hex-decoded ${hex}`);
  assert.strictEqual(rgbProp, '245,197,24', 'sanity: matches the known #F5C518 decode');
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

// ── Representative sample across both converted colors and every
//    declaration TYPE this pass touched (plain background, border/
//    border-color, single- and multi-stop gradients, a multi-declaration
//    composite background, and the plain ::selection pseudo-element) ──────

test('REAL CASCADE: ::selection and ::-moz-selection (blue) resolve to the exact pre-conversion literal', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '::selection'), 1, '::selection must be declared exactly once');
  assert.strictEqual(countRuleOpenings(src, '::-moz-selection'), 1, '::-moz-selection must be declared exactly once');
  const selBlock = extractRuleBlock(src, '::selection');
  const mozBlock = extractRuleBlock(src, '::-moz-selection');
  assert.doesNotMatch(selBlock + mozBlock, /rgba\(91,\s*124,\s*255,/, 'the literal blue rgba() must be gone from both rules');
  assert.match(resolveVars(selBlock), /background:rgba\(91,124,255,0\.32\);/, 'resolved ::selection background must byte-match the original literal');
  assert.match(resolveVars(mozBlock), /background:rgba\(91,124,255,0\.32\);/, 'resolved ::-moz-selection background must byte-match the original literal');
});

test('REAL CASCADE: body{} composite background (blue AND yellow radial-gradient stops together) resolves to the exact pre-conversion literals', (assert)=>{
  const block = extractRuleBlock(src, 'body');
  assert.doesNotMatch(block, /rgba\(91,\s*124,\s*255,|rgba\(245,\s*197,\s*24,/, 'neither literal must remain in the body{} rule');
  const resolved = resolveVars(block);
  assert.match(resolved, /radial-gradient\(circle at 12% -4%, rgba\(91,124,255,0\.07\), transparent 42%\)/, 'resolved blue radial-gradient stop must byte-match the original literal');
  assert.match(resolved, /radial-gradient\(circle at 88% 14%, rgba\(245,197,24,0\.035\), transparent 38%\)/, 'resolved yellow radial-gradient stop must byte-match the original literal');
});

test('REAL CASCADE: .streak-badge gradient+border (yellow) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.streak-badge'), 1, '.streak-badge must be declared exactly once');
  const block = extractRuleBlock(src, '.streak-badge');
  assert.doesNotMatch(block, /rgba\(245,\s*197,\s*24,\s*0\.14|rgba\(245,\s*197,\s*24,\s*0\.05|rgba\(245,\s*197,\s*24,\s*0\.32/, 'the literal yellow rgba() background/border must be gone');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:linear-gradient\(160deg, rgba\(245,197,24,0\.14\), rgba\(245,197,24,0\.05\)\);/, 'resolved gradient must byte-match the original literal gradient');
  assert.match(resolved, /border:1px solid rgba\(245,197,24,0\.32\);/, 'resolved border must byte-match the original literal border');
});

test('REAL CASCADE: .day-insight background+border (blue) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.day-insight'), 1, '.day-insight must be declared exactly once');
  const block = extractRuleBlock(src, '.day-insight');
  assert.doesNotMatch(block, /rgba\(91,\s*124,\s*255,/, 'the literal blue rgba() must be gone');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(91,124,255,0\.08\);/, 'resolved background must byte-match the original literal');
  assert.match(resolved, /border:1px solid rgba\(91,124,255,0\.28\);/, 'resolved border must byte-match the original literal');
});

test('REAL CASCADE: .exercise-block.superset-top / .superset-bottom / .superset-connector (yellow) resolve to the exact pre-conversion literals', (assert)=>{
  const topBlock = extractRuleBlock(src, '.exercise-block.superset-top');
  const bottomBlock = extractRuleBlock(src, '.exercise-block.superset-bottom');
  // Declared 3 times by design: the base rule here plus two Gym Mode
  // selector-list/override rules (verified separately below as untouched).
  // extractRuleBlock always returns the FIRST match in source order, which
  // is this base (non-Gym-Mode) rule.
  assert.strictEqual(countRuleOpenings(src, '.superset-connector'), 3, '.superset-connector must be declared exactly 3 times: the base rule plus two Gym Mode rules');
  const connectorBlock = extractRuleBlock(src, '.superset-connector');
  assert.match(resolveVars(topBlock), /background:rgba\(245,197,24,0\.08\);/, 'superset-top background must byte-match the original literal');
  assert.match(resolveVars(bottomBlock), /background:rgba\(245,197,24,0\.08\);/, 'superset-bottom background must byte-match the original literal');
  assert.match(resolveVars(connectorBlock), /background:rgba\(245,197,24,0\.14\);/, 'superset-connector background must byte-match the original literal');
});

test('REAL CASCADE: .sub-option.selected gradient+border-color (blue) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.sub-option.selected'), 1, '.sub-option.selected must be declared exactly once');
  const block = extractRuleBlock(src, '.sub-option.selected');
  assert.doesNotMatch(block, /rgba\(91,\s*124,\s*255,/, 'the literal blue rgba() must be gone');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:linear-gradient\(160deg, rgba\(91,124,255,0\.18\), rgba\(91,124,255,0\.08\)\); border-color:rgba\(91,124,255,0\.45\);/, 'resolved gradient+border-color must byte-match the original literals');
});

test('REAL CASCADE: .calendar-cell.today gradient+border (blue) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.calendar-cell.today'), 1, '.calendar-cell.today must be declared exactly once');
  const block = extractRuleBlock(src, '.calendar-cell.today');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:linear-gradient\(160deg, rgba\(91,124,255,0\.16\), rgba\(91,124,255,0\.05\)\);/, 'resolved gradient must byte-match the original literal gradient');
  assert.match(resolved, /border:1px solid rgba\(91,124,255,0\.4\);/, 'resolved border must byte-match the original literal border');
});

test('REAL CASCADE: .log-date-bar.backdating gradient+border-color (yellow) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.log-date-bar.backdating'), 1, '.log-date-bar.backdating must be declared exactly once');
  const block = extractRuleBlock(src, '.log-date-bar.backdating');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:linear-gradient\(160deg, rgba\(245,197,24,0\.14\), rgba\(245,197,24,0\.05\)\);/, 'resolved gradient must byte-match the original literal gradient');
  assert.match(resolved, /border-color:rgba\(245,197,24,0\.32\);/, 'resolved border-color must byte-match the original literal');
});

test('REAL CASCADE: .care-banner-caution background+border (yellow, single-line rule) resolves to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.care-banner-caution'), 1, '.care-banner-caution must be declared exactly once');
  const block = extractRuleBlock(src, '.care-banner-caution');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(245,197,24,0\.1\); border:1px solid rgba\(245,197,24,0\.38\);/, 'resolved background+border must byte-match the original literals');
});

test('REAL CASCADE: .program-limits background+border (yellow, declared on separate lines) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.program-limits'), 1, '.program-limits must be declared exactly once');
  const block = extractRuleBlock(src, '.program-limits');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(245,197,24,0\.1\);/, 'resolved background must byte-match the original literal');
  assert.match(resolved, /border:1px solid rgba\(245,197,24,0\.38\);/, 'resolved border must byte-match the original literal');
});

test('REAL CASCADE: .rt-adjust and .rt-adjust:active (blue) resolve to the exact pre-conversion literals', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.rt-adjust'), 1, '.rt-adjust base rule must be declared exactly once (this count is brace-exact, so it does not also match .rt-adjust:active)');
  assert.strictEqual(countRuleOpenings(src, '.rt-adjust:active'), 1, '.rt-adjust:active must be declared exactly once');
  const baseBlock = extractRuleBlock(src, '.rt-adjust');
  const activeBlock = extractRuleBlock(src, '.rt-adjust:active');
  const resolvedBase = resolveVars(baseBlock);
  const resolvedActive = resolveVars(activeBlock);
  assert.match(resolvedBase, /background:rgba\(91,124,255,0\.1\); border:1px solid rgba\(91,124,255,0\.3\);/, 'resolved base background+border must byte-match the original literals');
  assert.match(resolvedActive, /background:rgba\(91,124,255,0\.2\);/, 'resolved :active background must byte-match the original literal');
});

test('REAL CASCADE: .equip-plate.on background (blue) resolves to the exact pre-conversion literal', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.equip-plate.on'), 1, '.equip-plate.on must be declared exactly once');
  const block = extractRuleBlock(src, '.equip-plate.on');
  assert.match(resolveVars(block), /background:rgba\(91,124,255,0\.16\);/, 'resolved background must byte-match the original literal');
});

test('REAL CASCADE: .app-banner-info background+border (blue) resolves to the exact pre-conversion literal', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.app-banner-info'), 1, '.app-banner-info must be declared exactly once');
  const block = extractRuleBlock(src, '.app-banner-info');
  const resolved = resolveVars(block);
  assert.match(resolved, /background:rgba\(91,124,255,0\.12\); border:1px solid rgba\(91,124,255,0\.42\);/, 'resolved background+border must byte-match the original literals');
});

// ── Gym Mode must stay untouched ────────────────────────────────────────
test('regression guard: Gym Mode keeps its own literal blue/yellow rgba() values, not converted to var() by this pass', (assert)=>{
  const blueLiterals = (gymBlock.match(/rgba\(91,\s*124,\s*255,/g) || []).length;
  const yellowLiterals = (gymBlock.match(/rgba\(245,\s*197,\s*24,/g) || []).length;
  assert.ok(blueLiterals >= 10, `Gym Mode should still hold real literal blue rgba() sites, found ${blueLiterals}`);
  assert.ok(yellowLiterals >= 4, `Gym Mode should still hold real literal yellow rgba() sites, found ${yellowLiterals}`);
  const blueVarUse = (gymBlock.match(/rgba\(var\(--plate-blue-rgb\)/g) || []).length;
  const yellowVarUse = (gymBlock.match(/rgba\(var\(--plate-yellow-rgb\)/g) || []).length;
  assert.strictEqual(blueVarUse, 0, 'this pass must not have touched Gym Mode\'s blue literals');
  assert.strictEqual(yellowVarUse, 0, 'this pass must not have touched Gym Mode\'s yellow literals');
});

// ── Full accounting: every targeted literal DECLARATION outside Gym Mode is gone ─
test('sabotage-relevant: zero literal rgba(R,G,B,...) DECLARATIONS remain OUTSIDE Gym Mode for blue and yellow', (assert)=>{
  const styleStart = src.indexOf('<style>');
  const styleEnd = src.indexOf('</style>');
  const gymStart = src.indexOf('── GYM MODE', styleStart);
  const gymEnd = src.indexOf('[PRINT REPORT]', gymStart);
  let before = src.slice(styleStart, gymStart);
  const after = src.slice(gymEnd, styleEnd);
  // The [STABILIZATION PHASE E] comment near the top of <style> quotes the
  // blue triplet in prose as a worked example ("e.g. every rgba(91,124,255,X)
  // is --plate-blue at some opacity...") — it is documentation, not a
  // declaration, and this pass deliberately left it exactly as-is (same
  // "don't touch explanatory comments" discipline H2.2 used for its own
  // prose). Assert it's still there verbatim, THEN strip that one known
  // sentence before counting, so this assertion targets real CSS
  // declarations only and can't quietly pass by ignoring more than intended.
  const commentNeedle = 'e.g. every rgba(91,124,255,X) is --plate-blue';
  assert.ok(before.includes(commentNeedle), 'sanity: the known explanatory comment must still be present verbatim (proves this assertion is deliberately excluding ONE known sentence, not silently no-oping)');
  before = before.replace(commentNeedle, '');
  const targets = { blue: [91,124,255], yellow: [245,197,24] };
  for(const [name, [r,g,b]] of Object.entries(targets)){
    const re = new RegExp(`rgba\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*,`, 'g');
    const remaining = (before.match(re) || []).length + (after.match(re) || []).length;
    assert.strictEqual(remaining, 0, `expected zero remaining literal ${name} rgba() outside Gym Mode, found ${remaining}`);
  }
});

run();
