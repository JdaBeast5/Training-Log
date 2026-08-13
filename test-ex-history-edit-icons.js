'use strict';
// Behavioral coverage for the last two conversions in this batch: the
// per-exercise "History" (\u{1F4C8}) and "Edit" (\u{270F}\u{FE0F}) buttons,
// rendered once per exercise in the active program day — repeats a lot
// across a real workout day, same repetition argument as the food-row and
// custom-exercise-row buttons converted alongside these.
//
// Unlike those three (icon-ONLY, mask-image pattern), these two buttons mix
// an icon WITH text ("History"/"Edit"), so they use the OTHER established
// pattern in this codebase: the ICONS/icon() helper already used for
// check/warning/error glyphs inside HTML-template strings (see
// STABILIZATION PHASE E). The raw emoji character is fully REPLACED by an
// icon('trend')/icon('edit') call in the template — not kept-and-collapsed
// via CSS the way the mask-image buttons are, since that's how this
// pattern's existing precedent (diagRow, the goal-feedback call sites)
// already works.
//
// 'edit' redraws (at this helper's 24x24/stroke-2.2 convention) the same
// pencil shown by .fi-duplicate::after's CSS mask, so the app's two "edit"
// affordances read as one icon rather than two different pencils.
const { readIndexSource, extractConst, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-ex-history-edit-icons.js');

const iconsConstSrc = extractConst(src, 'ICONS');
const iconFnSrc = extractFunction(src, 'icon');
// icon() calls escapeHtml(opts.cls) when a cls option is passed; neither
// call site here passes one, but the sandbox still needs a real
// escapeHtml in scope for the function body to evaluate without throwing.
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

test('sabotage-relevant: ICONS carries real, distinct edit and trend SVG entries, not empty/placeholder strings', (assert)=>{
  assert.match(iconsConstSrc, /edit:\s*'<svg/, 'ICONS.edit must be a real inline SVG string');
  assert.match(iconsConstSrc, /trend:\s*'<svg/, 'ICONS.trend must be a real inline SVG string');
  assert.match(iconsConstSrc, /M15\.2 4 19\.4 8\.2 8\.2 19\.4 3\.4 20\.6 4\.6 15\.8Z/, 'edit must be the actual pencil path, not a placeholder');
  assert.match(iconsConstSrc, /points="3 17 9 10\.5 13 14 21 5"/, 'trend must be the actual rising-line path, not a placeholder');
});

test('REAL invocation: the real icon() function, run against the real ICONS table, returns actual working SVG markup for both new entries', (assert)=>{
  const captured = runSandbox([iconsConstSrc, escapeHtmlSrc, iconFnSrc], `
    __capture.push(icon('edit'));
    __capture.push(icon('trend'));
    __capture.push(icon('doesNotExist'));
  `);
  const [editHtml, trendHtml, missingHtml] = captured;
  assert.match(editHtml, /<svg width="1em" height="1em"/, 'icon(\'edit\') must inject the real default 1em sizing the helper always applies');
  assert.match(editHtml, /aria-hidden="true"/, 'icon(\'edit\') must be aria-hidden, matching every other ICONS entry (decorative, the button\'s own aria-label carries the meaning)');
  assert.match(editHtml, /M15\.2 4 19\.4 8\.2/, 'icon(\'edit\') must actually contain the pencil path');
  assert.match(trendHtml, /points="3 17 9 10\.5 13 14 21 5"/, 'icon(\'trend\') must actually contain the rising-line path');
  assert.strictEqual(missingHtml, '', 'an unknown icon name must still fail soft (empty string), the existing contract this helper already had — unaffected by adding two more real entries');
});

test('REAL invocation: the real exercise-row template calls icon(\'trend\')/icon(\'edit\') — real DOM built from the actual call site, not a hand-typed stand-in', (assert)=>{
  const callSiteRe = /const historyBtnHtml = `<button type="button" class="ex-history-btn" data-idx="\$\{i\}" aria-label="See all history for \$\{escapeHtml\(ex\.name\)\}">\$\{icon\('trend'\)\} History<\/button>`\s*\n\s*\+ `<button type="button" class="ex-edit-btn" data-idx="\$\{i\}" aria-label="Edit the prescription for \$\{escapeHtml\(ex\.name\)\}">\$\{icon\('edit'\)\} Edit<\/button>`;/;
  const m = callSiteRe.exec(src);
  if(!m) throw new Error('the real historyBtnHtml/ex-edit-btn template line was not found in the shape expected');

  // Build the actual HTML this template line produces for a stand-in
  // exercise, using the REAL icon()/ICONS/escapeHtml, and load it into a
  // real DOM to assert on structure — not just that the template string
  // looks right.
  const captured = runSandbox([iconsConstSrc, escapeHtmlSrc, iconFnSrc], `
    const i = 0;
    const ex = { name: 'Barbell Row' };
    const historyBtnHtml = \`<button type="button" class="ex-history-btn" data-idx="\${i}" aria-label="See all history for \${escapeHtml(ex.name)}">\${icon('trend')} History</button>\`
      + \`<button type="button" class="ex-edit-btn" data-idx="\${i}" aria-label="Edit the prescription for \${escapeHtml(ex.name)}">\${icon('edit')} Edit</button>\`;
    __capture.push(historyBtnHtml);
  `);
  const html = captured[0];
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  const doc = dom.window.document;

  const histBtn = doc.querySelector('.ex-history-btn');
  const editBtn = doc.querySelector('.ex-edit-btn');
  if(!histBtn || !editBtn) throw new Error('expected both real buttons to be present in the rendered fragment');

  assert.ok(histBtn.querySelector('svg'), 'the History button must contain a real <svg> icon element');
  assert.ok(editBtn.querySelector('svg'), 'the Edit button must contain a real <svg> icon element');
  assert.match(histBtn.textContent, /History/, 'the visible text label must still read "History"');
  assert.match(editBtn.textContent, /Edit/, 'the visible text label must still read "Edit"');
  assert.doesNotMatch(histBtn.textContent, /\u{1F4C8}/u, 'the raw trend-chart emoji character must be gone from the rendered button — this pattern replaces it, unlike the mask-image buttons which keep it hidden');
  assert.doesNotMatch(editBtn.textContent, /✏/u, 'the raw pencil emoji character must be gone from the rendered button');
  assert.strictEqual(histBtn.getAttribute('aria-label'), 'See all history for Barbell Row', 'aria-label wording is unchanged by this conversion');
  assert.strictEqual(editBtn.getAttribute('aria-label'), 'Edit the prescription for Barbell Row', 'aria-label wording is unchanged by this conversion');
});

test('sabotage-relevant: icon(\'trend\')/icon(\'edit\') are each called exactly once as real invocations — not left as dead entries, and not duplicated at a second call site', (assert)=>{
  const re = /\bicon\(('trend'|'edit')\)/g;
  const counts = { "'trend'": 0, "'edit'": 0 };
  let m;
  while((m = re.exec(src))){
    // Walk backward far enough to rule out this being inside a `//` comment
    // line that merely quotes the call (this project's own history flags
    // exactly this failure mode for naive text counts).
    const lineStart = src.lastIndexOf('\n', m.index) + 1;
    const linePrefix = src.slice(lineStart, m.index);
    if(/\/\//.test(linePrefix)) continue;
    counts[m[1]]++;
  }
  assert.strictEqual(counts["'trend'"], 1, 'icon(\'trend\') must be a real call exactly once (the History button) — this file\'s own header comment references it in prose without parentheses specifically to avoid tripping this exact count');
  assert.strictEqual(counts["'edit'"], 1, 'icon(\'edit\') must be a real call exactly once (the Edit button)');
});

test('regression guard: .ex-history-btn/.ex-edit-btn keep their real text-sized font — this is the icon+text pattern, not the icon-only mask pattern, so font-size must NOT have been collapsed to 0', (assert)=>{
  // Anchored to the newline + 2-space-indent prefix of the real base
  // declarations, the same technique test-plate-btn-glyph.js uses — a
  // naive unanchored search finds `.set-actions .ex-edit-btn{...}` (an
  // unrelated layout override a few hundred lines earlier that happens to
  // contain ".ex-edit-btn{" as a substring) instead of the real rule.
  const histSrc = extractRuleBlock(src, '\n  .ex-history-btn');
  const editSrc = extractRuleBlock(src, '\n  .ex-edit-btn');
  assert.match(histSrc, /font-size:11\.5px/, 'the visible "History" text must keep its real font-size — collapsing it the way the icon-only buttons do would blank the label text too');
  assert.match(editSrc, /font-size:11\.5px/, 'the visible "Edit" text must keep its real font-size');
  assert.doesNotMatch(histSrc, /font-size:0/, 'this button must never gain font-size:0 — that pattern is reserved for icon-only buttons');
  assert.doesNotMatch(editSrc, /font-size:0/, 'this button must never gain font-size:0 — that pattern is reserved for icon-only buttons');
});

run();
