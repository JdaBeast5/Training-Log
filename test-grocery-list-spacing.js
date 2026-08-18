'use strict';
// Behavioral coverage for a real spacing inconsistency found alongside the
// USDA-prompt fix in the same review: Grocery List's empty-state note sat
// only 6px below the Add-item row (the note's own top padding, nothing
// else) — its sibling cards' equivalent lists (Bodyweight/Sleep/BP/
// Glucose, all via .weight-list{margin-top:12px}) all get a real 12px
// margin before their own empty-note. Grocery List's #groceryListItems
// never got the same treatment, so it alone read noticeably tighter.
const { readIndexSource, extractElementById, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-grocery-list-spacing.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('sabotage-relevant: #groceryListItems is styled exactly once (this fix adds the one real declaration, not a stray duplicate)', (assert)=>{
  const count = (src.match(/#groceryListItems\{/g) || []).length;
  assert.strictEqual(count, 1, `expected exactly one #groceryListItems{...} declaration, found ${count}`);
});

test('#groceryListItems now has margin-top:12px, matching .weight-list — the equivalent sibling pattern every other empty-state list in the app already uses', (assert)=>{
  const groceryBlock = extractRuleBlock(src, '#groceryListItems');
  assert.match(groceryBlock, /margin-top:12px/, 'expected a 12px top margin, matching .weight-list');

  const weightListBlock = extractRuleBlock(src, '.weight-list');
  assert.match(weightListBlock, /margin-top:12px/, 'sanity: .weight-list (Bodyweight/Sleep/BP/Glucose) really does use 12px, confirming this is matching an established pattern, not inventing a number');
});

test('REAL invocation: getComputedStyle on the actual Grocery List markup (Add row + real #groceryListItems id) resolves a real 12px gap above the list, up from effectively zero', (assert)=>{
  const rowHtml = extractElementById(src, 'groceryAddBtn');
  const bodyHtml = `
    <div class="weight-input-row">
      <input type="text" id="groceryAddInput" class="care-input" placeholder="Add an item">
      ${rowHtml}
    </div>
    <div id="groceryListItems"><div class="empty-note">Nothing here yet</div></div>
  `;
  const rowCss = extractRuleBlock(src, '.weight-input-row');
  const listCss = extractRuleBlock(src, '#groceryListItems');
  const dom = new JSDOM(`<!DOCTYPE html><style>${rowCss}\n${listCss}</style><body>${bodyHtml}</body>`, { pretendToBeVisual: true });
  const listEl = dom.window.document.getElementById('groceryListItems');
  const listStyle = dom.window.getComputedStyle(listEl);
  assert.strictEqual(listStyle.marginTop, '12px');
});

run();
