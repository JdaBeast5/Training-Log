'use strict';
// Regression coverage for a real, verified CSS bug: two `.program-intro{...}`
// rules existed in index.html, both added in the SAME commit (v3.153) — the
// first (margin-top:10px; padding-top:10px; border-top:...) was written for
// an older, pre-"spec plate" provenance design; the second (margin:0, the
// quiet "spec plate" text style actually documented by the surrounding
// "Program provenance panel" comment block) was its intended replacement.
// The first was never removed. Same selector, same specificity, so cascade
// order alone decided which properties won: the second rule's `margin:0`
// overrides the first's `margin-top:10px`, but the first's `padding-top`
// and `border-top` are never touched by the second rule at all — so they
// silently kept applying to every `.program-intro` element in the app,
// including the six new Program/Style Overview panels (v3.195/3.196) and,
// most visibly, the two stacked `<p class="program-intro">` paragraphs
// buildSourceRowHtml renders back to back in Research & Sources (a school
// name immediately followed by a cited-source line) — which is exactly
// where an unwanted divider + top padding reads as a stray gap between two
// lines that should just read as continuous text.
//
// Confirmed via `git log -p -L` that both rules were added in the same
// commit, and confirmed via `grep` that no existing test asserted on either
// rule before this fix — this really was dead, unexercised CSS.
const { readIndexSource, extractFunction, extractElementByClass, runSandbox, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-program-intro-divider-fix.js');

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

function computedStylesFor(cssBlocks, bodyHtml, selectorAll){
  const dom = new JSDOM(
    `<!DOCTYPE html><style>${cssBlocks.join('\n')}</style><body>${bodyHtml}</body>`,
    { pretendToBeVisual: true }
  );
  const els = Array.from(dom.window.document.querySelectorAll(selectorAll));
  if(els.length === 0) throw new Error(`computedStylesFor: no elements matched ${selectorAll}`);
  return els.map(el => dom.window.getComputedStyle(el));
}

test('sabotage-relevant: .program-intro is now declared exactly once, not the pre-fix two competing rules', (assert)=>{
  assert.strictEqual(countRuleBlocks(src, '.program-intro'), 1, 'expected exactly one .program-intro{...} declaration after removing the dead, superseded rule');
});

test('the surviving .program-intro rule is the "spec plate" one (margin:0, no border-top/padding-top of its own)', (assert)=>{
  const block = extractRuleBlock(src, '.program-intro');
  assert.match(block, /margin:0/, 'expected the surviving rule to be the margin:0 spec-plate style');
  assert.doesNotMatch(block, /border-top/, 'the removed rule\'s border-top must actually be gone, not just shadowed');
  assert.doesNotMatch(block, /padding-top/, 'the removed rule\'s padding-top must actually be gone, not just shadowed');
});

test('REAL invocation: buildSourceRowHtml renders two adjacent .program-intro paragraphs (school, then cited source) with NO divider or top padding between them, through the real extracted markup and real extracted CSS', (assert)=>{
  const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
  const buildSourceRowHtmlSrc = extractFunction(src, 'buildSourceRowHtml');
  const [html] = runSandbox(
    [escapeHtmlSrc, 'var sourcePanelSeq = 0;', buildSourceRowHtmlSrc],
    "__capture.push(buildSourceRowHtml('Test Program', {school:'Some Methodology', primary:'Some Citation, J. et al.'}, 'About this program', false));"
  );
  assert.match(html, /<p class="program-intro">Some Methodology<\/p>/, 'expected the real school paragraph markup');
  assert.match(html, /<p class="program-intro"><strong>Cited source — <\/strong>Some Citation/, 'expected the real cited-source paragraph markup');

  const introCss = extractRuleBlock(src, '.program-intro');
  const [schoolStyle, citedStyle] = computedStylesFor([introCss], html, 'p.program-intro');
  // jsdom's getComputedStyle doesn't collapse border-*-width to 0 just
  // because border-*-style computes to 'none' (real browsers report the used
  // value, 0px; jsdom reports the raw initial value instead) — borderTopStyle
  // is the real, portable signal that no border actually renders. The old,
  // now-removed rule explicitly set border-top:...solid...; a real
  // regression would show up here as borderTopStyle === 'solid'.
  assert.strictEqual(schoolStyle.borderTopStyle, 'none', 'school paragraph must not have a border-top divider');
  assert.strictEqual(schoolStyle.paddingTop, '0', 'school paragraph must not have leftover top padding');
  assert.strictEqual(citedStyle.borderTopStyle, 'none', 'cited-source paragraph (the one directly under the school line) must not have a border-top divider');
  assert.strictEqual(citedStyle.paddingTop, '0', 'cited-source paragraph must not have leftover top padding');
});

test('REAL invocation: buildBasisHtml (the live per-program provenance panel) also resolves the fixed, undivided .program-intro style', (assert)=>{
  const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
  const buildBasisHtmlSrc = extractFunction(src, 'buildBasisHtml');
  const [html] = runSandbox(
    [escapeHtmlSrc, 'var programPanelSeq = 0;', buildBasisHtmlSrc],
    "__capture.push(buildBasisHtml({limits:'Some limit text', basis:'Some basis text'}, 'Some intro text', 'About this program'));"
  );
  assert.match(html, /<p class="program-intro">Some intro text<\/p>/, 'expected the real provenance-panel intro paragraph markup');

  const introCss = extractRuleBlock(src, '.program-intro');
  const [style] = computedStylesFor([introCss], html, 'p.program-intro');
  assert.strictEqual(style.borderTopStyle, 'none');
  assert.strictEqual(style.paddingTop, '0');
  assert.strictEqual(style.marginTop, '0px');
});

test('sabotage-relevant: the six Program/Style Overview panels really do carry the .program-intro class this fix targets (not a stray unrelated class)', (assert)=>{
  const matches = src.match(/class="program-intro program-overview"/g) || [];
  assert.strictEqual(matches.length, 6, `expected exactly 6 Overview panels wearing "program-intro program-overview" (Training Style, martial art, cycling, watersports, yoga, medical), found ${matches.length}`);
});

run();
