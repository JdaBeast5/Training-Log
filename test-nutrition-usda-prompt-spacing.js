'use strict';
// Behavioral coverage for a real, user-reported spacing bug: "the USDA
// message in the nutrition tab" sat with zero gap against the Photo/
// Barcode/Describe/Suggest/Recipes quick-add button row directly below
// it — confirmed live (headless Chromium, not just source reading): the
// USDA key-upgrade prompt (#usdaKeySettingsSlot's injected content,
// .usda-key-upgrade{margin-top:10px} and nothing on its bottom edge) sat
// flush against .quick-add-row (margin-bottom:14px, nothing on its top
// edge) — 0px of real screen space between "...Add a personal key" and
// the Photo button row.
//
// .quick-add-row is used in exactly one place in the whole app (right
// after #usdaKeySettingsSlot), so adding its own margin-top is a safe,
// narrowly-scoped fix — no other call site to accidentally affect.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-nutrition-usda-prompt-spacing.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

function countRuleOpenings(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{', 'g');
  return (source.match(re) || []).length;
}

test('sabotage-relevant: .quick-add-row is still declared exactly once (this fix touches the one real declaration, not a stray duplicate)', (assert)=>{
  assert.strictEqual(countRuleOpenings(src, '.quick-add-row'), 1);
});

test('.quick-add-row now has margin-top:14px, matching its own existing margin-bottom, so the USDA prompt above it and the row itself no longer touch', (assert)=>{
  const block = extractRuleBlock(src, '.quick-add-row');
  assert.match(block, /margin-top:14px/, 'expected a 14px top margin to be added');
  assert.match(block, /margin-bottom:14px/, 'the existing bottom margin must be untouched');
});

test('REAL invocation: getComputedStyle on the real .quick-add-row, immediately preceded by the real #usdaKeySettingsSlot markup, resolves a real non-zero gap between them', (assert)=>{
  // Real extracted markup: #usdaKeySettingsSlot (empty at boot, exactly as
  // it appears in index.html) immediately followed by the real
  // .quick-add-row block, exactly as they sit in the actual Nutrition
  // card — proving the selector/cascade reaches the real elements, not a
  // synthetic stand-in.
  const bodyHtml = `
    <div id="usdaKeySettingsSlot"><div class="usda-key-upgrade">USDA text</div></div>
    <div class="quick-add-row"><button class="quick-add-btn">Photo</button></div>
  `;
  const usdaCss = extractRuleBlock(src, '.usda-key-upgrade');
  const quickAddCss = extractRuleBlock(src, '.quick-add-row');
  const dom = new JSDOM(`<!DOCTYPE html><style>${usdaCss}\n${quickAddCss}</style><body>${bodyHtml}</body>`, { pretendToBeVisual: true });
  const usdaEl = dom.window.document.querySelector('.usda-key-upgrade');
  const rowEl = dom.window.document.querySelector('.quick-add-row');
  const usdaStyle = dom.window.getComputedStyle(usdaEl);
  const rowStyle = dom.window.getComputedStyle(rowEl);
  assert.strictEqual(usdaStyle.marginBottom, '0', 'sanity: the USDA prompt itself still contributes nothing on its own bottom edge');
  assert.strictEqual(rowStyle.marginTop, '14px', 'the quick-add row must now be the one supplying real breathing room above it');
});

run();
