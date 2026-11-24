'use strict';
// Behavioral coverage for three real bugs found in a focused visual/layout
// audit (quick-add labels, macro value wrapping, the date input's native
// chrome and sizing) and fixed as a single small, verifiable pass — no
// redesign, no new tokens, just the existing --surface2/--line/--text system
// and patterns (.fl-macro's white-space:nowrap, the shared .care-input
// class) applied to spots that had drifted from them.
//
// jsdom has no real layout engine, so it can't reproduce actual text
// wrapping/clipping the way a live browser does — that live confirmation
// (scrollWidth vs clientWidth measurements, before/after screenshots at a
// real 375px viewport) is documented in the commit, not re-derived here.
// What jsdom CAN do, and what these tests lean on, is resolve getComputedStyle
// against the REAL extracted markup through the REAL extracted stylesheet
// rules — proving the fixed declarations actually reach the actual elements
// through the actual class/selector chain, not just that the right text
// exists somewhere in the file.
const { readIndexSource, extractElementById, extractElementByClass, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-visual-polish-audit-fixes.js');

// Takes a PLAIN (unescaped) selector — this function owns escaping. Strips
// comments first: several of the rules touched here carry an explanatory
// comment that quotes the OLD value being replaced (e.g. "width:78px" is
// discussed in the comment above .macro-val's new min-width:78px) — the
// exact defeats-a-naive-assertion trap this project's own testing notes
// warn about. Assertions below run against real declarations only.
function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[\\s\\S]*?\\n  \\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

function countRuleBlocks(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{', 'g');
  return (source.match(re) || []).length;
}

// Builds a real jsdom document from an extracted <style> block plus real
// extracted markup, and returns getComputedStyle for the given selector.
function computedStyleFor(cssBlocks, bodyHtml, selector){
  const dom = new JSDOM(
    `<!DOCTYPE html><style>${cssBlocks.join('\n')}</style><body>${bodyHtml}</body>`,
    { pretendToBeVisual: true }
  );
  const el = dom.window.document.querySelector(selector);
  if(!el) throw new Error(`computedStyleFor: ${selector} not found in assembled markup`);
  return dom.window.getComputedStyle(el);
}

// ── Quick-add labels (Photo / Barcode / Describe / Suggest / Recipes) ──────
// Live-measured at a real 375px viewport before the fix: 5 buttons sharing
// one .quick-add-row (8px gaps) left each ~52.3px wide. At the old 6px side
// padding + 11.5px type, "Barcode"/"Describe"/"Suggest"/"Recipes" all
// overflowed their own box (scrollWidth 1-4px past clientWidth) against
// .quick-add-btn's own overflow:hidden (kept for the ::before gloss layer) —
// clipping a sliver of the label rather than showing it in full. Re-measured
// live after the fix (6px row gap, 4px side padding, 10.5px type): every
// button, worst case "Describe", now clears with real margin.

test('sabotage-relevant: .quick-add-btn is declared exactly once — not a stray duplicate rule the real one gets overridden by later in the cascade', (assert)=>{
  assert.strictEqual(countRuleBlocks(src, '.quick-add-btn'), 1, 'expected exactly one .quick-add-btn{...} declaration');
});

// 2026-11-16 (v3.588, UX-13): the five tiles became standard buttons, an
// icon beside a 14px label, 44px tall, in a row that wraps. Labels no longer
// have to squeeze into ~52px each (the clipping this section fixed), so the
// 6px gap / 4px padding / 10.5px type pins are replaced by the new contract.
test('.quick-add-row is one row with an 8px gap that scrolls sideways (UX-13), so no label has to squeeze into a fifth of the row', (assert)=>{
  const block = extractRuleBlock(src, '.quick-add-row');
  assert.match(block, /flex-wrap:nowrap/);
  assert.match(block, /overflow-x:auto/);
  assert.match(block, /gap:8px/);
});

test('.quick-add-btn is a standard button (UX-13): icon beside a 14px label, 44px tall, 14px side padding', (assert)=>{
  const block = extractRuleBlock(src, '.quick-add-btn');
  assert.match(block, /flex-direction:row/);
  assert.match(block, /min-height:44px/);
  assert.match(block, /font-size:14px/);
  assert.match(block, /padding:0 14px/);
  assert.doesNotMatch(block, /font-size:10\.5px/, 'the clipped-tile type size is gone');
});

test('REAL invocation: getComputedStyle on the actual #describeFoodBtn (the longest label, "Describe") through the real extracted quick-add-row markup and quick-add-btn/row rules reflects the new values', (assert)=>{
  const rowHtml = extractElementByClass(src, 'quick-add-row');
  const rowCss = extractRuleBlock(src, '.quick-add-row');
  const btnCss = extractRuleBlock(src, '.quick-add-btn');
  const cs = computedStyleFor([rowCss, btnCss], rowHtml, '#describeFoodBtn');
  assert.strictEqual(cs.fontSize, '14px');
  assert.strictEqual(cs.minHeight, '44px');
  assert.strictEqual(cs.flexDirection, 'row');
  const row = new JSDOM(`<!DOCTYPE html><style>${rowCss}</style><body>${rowHtml}</body>`, { pretendToBeVisual: true });
  const rcs = row.window.getComputedStyle(row.window.document.querySelector('.quick-add-row'));
  assert.strictEqual(rcs.gap, '8px');
  assert.strictEqual(rcs.flexWrap, 'nowrap');
  assert.strictEqual(rcs.overflowX, 'auto');
});

// ── Macro value wrapping (CALORIES/PROTEIN/FAT/CARBS "current / target") ──
// Live-reproduced before the fix: setting #valCal's real text to a plausible
// logged value, "3184 / 2650" (11 characters), inside the real, unmodified
// .macro-val (width:78px, no white-space rule — default 'normal') doubled
// its rendered height from 16px to 32px — the "current / target" split
// across two lines, misaligned against the other three macro rows and their
// bar tracks. ".fl-macro"/".fi-macro" (the food-log-item macro line) already
// solve this exact "short label, long-ish sibling number in a flex row"
// shape with white-space:nowrap; .macro-val had simply never gotten it.

// 2026-11-16 (v3.588, UX-13): .fl-macro is the logged row's own second line now
// (calories and the three macros), so it wraps rather than holding one line.
test('the logged food row\'s second line (.fl-macro, UX-13) may wrap: calories and macros sit under the name', (assert)=>{
  const block = extractRuleBlock(src, '.food-log-item .fl-macro');
  assert.match(block, /flex-wrap:wrap/);
  assert.doesNotMatch(block, /white-space:nowrap/);
});

test('.macro-val switched from a fixed width to nowrap + min-width + flex-shrink:0, so a long "current / target" value grows the box instead of wrapping inside it', (assert)=>{
  const block = extractRuleBlock(src, '.macro-val');
  assert.match(block, /min-width:78px/, 'expected min-width (not a hard width cap) so longer values can grow the box');
  assert.match(block, /flex-shrink:0/, 'expected flex-shrink:0 so .macro-bar-track (flex:1) gives up room first, not .macro-val');
  assert.match(block, /white-space:nowrap/, 'expected the same nowrap treatment .fl-macro already uses');
  assert.doesNotMatch(block, /(?<!min-)width:78px/, 'the old bare width:78px (which is what let the value wrap) must actually be gone, not just supplemented by min-width');
});

test('REAL invocation: getComputedStyle on the actual #valCal element, through the real extracted macro-row markup (label + bar-track + value) and the real macro-val/-row/-bar-track rules, resolves nowrap/min-width/flex-shrink — proving the selector really reaches this element, not just that the text exists in the file', (assert)=>{
  // 2026-11-16 (v3.588, UX-13): the four static macro rows became figures; .macro-row /
  // .macro-val live on in the medical nutrient bars (renderMedicalNutrientBars), so the
  // row is built the way that function builds it.
  const rowHtml = `<div class="macro-row"><div class="macro-label">Sodium (stay under)</div><div class="macro-bar-track"><div class="macro-bar-fill"></div></div><div class="macro-val" id="valCal">3184 / 2650 mg</div></div>`;
  const rowCss = extractRuleBlock(src, '.macro-row');
  const trackCss = extractRuleBlock(src, '.macro-bar-track');
  const valCss = extractRuleBlock(src, '.macro-val');
  const cs = computedStyleFor([rowCss, trackCss, valCss], rowHtml, '#valCal');
  assert.strictEqual(cs.whiteSpace, 'nowrap');
  assert.strictEqual(cs.minWidth, '78px');
  assert.strictEqual(cs.flexShrink, '0');
});

// ── Date input (#cycleLastPeriod, Cycle Tracking) ──────────────────────────
// Two separate, live-confirmed issues on the app's one <input type="date">:
// (1) the app has never declared color-scheme anywhere (confirmed absent
// app-wide) despite being 100%, unconditionally dark — no light theme, no
// prefers-color-scheme handling, no toggle — so the browser had no signal to
// draw the date input's own calendar affordance/popup in anything but its
// default LIGHT scheme, live-confirmed via getComputedStyle before the fix
// (colorScheme: "normal"). (2) live-measured: the date input rendered 2px
// taller than the plain-number #cycleLength input directly beneath it
// (42.8px vs 40.8px) despite identical .care-input padding/font-size — a
// UA-added internal layout cost specific to type=date — breaking the
// vertical rhythm of the care-input stack. Fixed with a global
// color-scheme:dark (matching the rest of :root's unconditional-dark intent)
// and a 1px-per-side padding trim scoped to input[type=date].care-input,
// live-remeasured at exactly 40.8px afterward.

test('sabotage-relevant: exactly one type="date" input exists in the whole app — this fix (and its scope) is sized to the real, current surface, not a guess', (assert)=>{
  const matches = src.match(/<input[^>]*type="date"[^>]*>/g) || [];
  assert.strictEqual(matches.length, 1, `expected exactly one type="date" input, found ${matches.length}`);
  assert.match(matches[0], /id="cycleLastPeriod"/, 'the one date input should still be #cycleLastPeriod');
});

test(':root now declares color-scheme:dark, matching the fact that this app has no light theme anywhere (no prefers-color-scheme, no data-theme, no toggle)', (assert)=>{
  // Stripped of /* */ and <!-- --> comments before checking — this fix's own
  // rationale comment on :root literally contains the prose "no
  // prefers-color-scheme handling, no data-theme toggle", which would
  // defeat a naive check against the raw, comment-inclusive source.
  const withoutComments = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
  // 2026-10-26 (v3.385): the launch page follows the system appearance (owner
  // request: the launch should adapt to light and dark). That is the one
  // allowed light branch: every prefers-color-scheme @media must style ONLY
  // .launch rules, which hold no form controls, so the blanket dark
  // color-scheme below stays safe for everything else.
  assert.doesNotMatch(withoutComments, /data-theme=/, 'precondition: no theme toggle');
  const at = [...withoutComments.matchAll(/@media[^{]*prefers-color-scheme[^{]*\{/g)];
  for(const m of at){
    let depth = 1, i = m.index + m[0].length;
    while(depth && i < withoutComments.length){ if(withoutComments[i] === '{') depth++; else if(withoutComments[i] === '}') depth--; i++; }
    const body = withoutComments.slice(m.index + m[0].length, i - 1);
    const selectors = [...body.matchAll(/([^{}]+)\{/g)].map(x => x[1].trim());
    // 2026-10-28 (v3.477): the app follows the phone's appearance (owner:
    // "Follow the phone"). The second allowed branch is the light token block
    // (on body), which must also switch color-scheme to light so the form
    // controls it draws match (test-light-mode.js).
    // (v3.480: on :root body, so gym mode keeps the dark tokens.)
    const isTokenBlock = selectors.length === 1 && selectors[0] === ':root body' && /color-scheme:light/.test(body);
    assert.ok(selectors.length && (isTokenBlock || selectors.every(sel => sel.split(',').every(x => x.trim().startsWith('.launch')))), `a prefers-color-scheme block styles only the launch page, or is the light token block: ${selectors.join(' | ')}`);
  }
  assert.ok(at.length >= 1, 'anchor: the launch page\'s light branch exists');
  const block = extractRuleBlock(src, ':root');
  assert.match(block, /color-scheme:dark/, 'expected :root to declare color-scheme:dark');
});

// Three OTHER rules in this file also end in the literal substring
// ".care-input{" before the real base rule does in file order:
// .custom-program-box .care-input{...}, .coach-chat-input-row .care-input{...},
// and this fix's own input[type="date"].care-input{...} — a plain,
// unanchored ".care-input" selector would silently grab one of those instead
// of the shared base rule. Anchoring on "the real declaration line starts
// with exactly two spaces of indent then .care-input{" (true only of the
// base rule) is what extractRuleBlock's escaping-only, no-anchoring design
// needs here to land on the right one.
const CARE_INPUT_BASE_SELECTOR = '\n  .care-input';

test('a new input[type="date"].care-input rule trims vertical padding by 1px a side to offset the UA-added internal height, without touching every other .care-input', (assert)=>{
  const block = extractRuleBlock(src, 'input[type="date"].care-input');
  assert.match(block, /padding:9px 10px/, 'expected 9px vertical / 10px horizontal padding on the date input specifically');
  const sharedBlock = extractRuleBlock(src, CARE_INPUT_BASE_SELECTOR);
  assert.match(sharedBlock, /padding:10px/, 'the shared .care-input rule every other field relies on must be untouched at 10px');
});

test('REAL invocation: getComputedStyle on the actual #cycleLastPeriod input, through the real extracted <input> tag and real extracted :root/.care-input/date-specific rules, resolves both fixes at once', (assert)=>{
  const inputHtml = (src.match(/<input[^>]*id="cycleLastPeriod"[^>]*>/) || [])[0];
  assert.ok(inputHtml, 'must find the real #cycleLastPeriod input markup');
  const rootCss = extractRuleBlock(src, ':root');
  const careInputCss = extractRuleBlock(src, CARE_INPUT_BASE_SELECTOR);
  const dateCss = extractRuleBlock(src, 'input[type="date"].care-input');
  const cs = computedStyleFor([rootCss, careInputCss, dateCss], inputHtml, '#cycleLastPeriod');
  assert.strictEqual(cs.colorScheme, 'dark');
  assert.strictEqual(cs.paddingTop, '9px');
  assert.strictEqual(cs.paddingBottom, '9px');
  assert.strictEqual(cs.paddingLeft, '10px');
});

run();
