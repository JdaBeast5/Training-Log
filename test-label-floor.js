'use strict';
// v3.279 (tasteskill rollout): no forced-uppercase tracked labels and nothing
// under 11px, app-wide. 37 rules swept: text-transform:uppercase and its
// letter-spacing removed, mono labels moved to the text face (figure-carrying
// ones kept mono), every size raised to the 11px floor. Two labels whose
// source text was Title Case showed it once uppercasing came off and were
// sentence-cased ("Add a food", "Cal target").
//
// This guards the whole stylesheet, so a NEW tiny or shouty label fails here.
// Each exception is named with its reason:
//  - glyph-only rules (an icon drawn as a character, not words);
//  - .quick-add-btn: five buttons share one row at 375px and 11px measured as
//    clipping "Describe"/"Suggest" (documented at the rule) — needs a layout
//    change, not a font tweak; flagged in HANDOFF-v52;
//  - gym mode: its own hand-tuned surface, out of this rollout's scope.
// Confirmed in Chromium on Today/Log/Analysis/History: every swept label
// renders in sentence case with no clipping and no page errors.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractElementById, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-label-floor.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style>`).window;

function allRules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
const GLYPH_ONLY = new Set(['.ex-details summary::before', '.day-done-badge', '.reorder-arrows button']);
const DOCUMENTED = new Set(['.quick-add-btn']);
const exempt = sel => GLYPH_ONLY.has(sel) || DOCUMENTED.has(sel) || /gym-mode/.test(sel);

test('sabotage anchor: the parser sees the whole stylesheet (hundreds of rules, incl. the swept labels)', (assert)=>{
  const sels = new Set(allRules().map(r => r.selectorText));
  assert.ok(allRules().length > 800, `only ${allRules().length} rules parsed`);
  for(const s of ['.plate-label', '.section-label', '.program-basis-toggle', '.calendar-weekday-row span']) assert.ok(sels.has(s), s);
});

test('REAL CSSOM: no rule outside the named exceptions forces uppercase', (assert)=>{
  const offenders = allRules().filter(r => r.style.getPropertyValue('text-transform') === 'uppercase' && !exempt(r.selectorText)).map(r => r.selectorText);
  assert.deepStrictEqual(offenders, []);
});

test('REAL CSSOM: no rule outside the named exceptions sets text under 11px', (assert)=>{
  const offenders = allRules().filter(r => {
    const v = r.style.getPropertyValue('font-size');
    // 0px is not small text: icon buttons zero their fallback text so a
    // CSS-drawn glyph (::after mask) shows instead.
    return /px$/.test(v) && parseFloat(v) > 0 && parseFloat(v) < 11 && !exempt(r.selectorText);
  }).map(r => `${r.selectorText} ${r.style.getPropertyValue('font-size')}`);
  assert.deepStrictEqual(offenders, []);
});

test('REAL CSSOM: the swept labels read in the text face; figure labels keep mono numerals', (assert)=>{
  const ff = sel => allRules().find(r => r.selectorText === sel).style.getPropertyValue('font-family');
  for(const s of ['.section-label', '.prog-day', '.program-basis-toggle', '.tabs-header .hint', '.calendar-weekday-row span']) assert.strictEqual(ff(s), 'var(--font-sans)', s);
  for(const s of ['.whats-new-version', '.masterclass-index-btn .mc-index-meta']) assert.strictEqual(ff(s), 'var(--font-mono)', s);
});

test('REAL markup: the two labels whose Title Case surfaced are sentence case', (assert)=>{
  const src = readIndexSource();
  const log = new JSDOM(`<body>${extractElementById(src, 'logView')}</body>`).window.document;
  const texts = [...log.querySelectorAll('.section-label, .targets-strip .t-label, .t-label')].map(e => e.textContent.trim());
  assert.ok(texts.includes('Add a food'), texts.join(' | '));
  assert.ok(texts.includes('Cal target'), texts.join(' | '));
  assert.ok(!texts.includes('Add a Food') && !texts.includes('Cal Target'));
});

test('REAL markup + invocation (v3.281): the macro bar labels are sentence case — the four static rows and renderMedicalNutrientBars\' generated rows', (assert)=>{
  const { runJsdom, extractFunction } = require('./testHelpers.js');
  const src = readIndexSource();
  const log = new JSDOM(`<body>${extractElementById(src, 'logView')}</body>`).window.document;
  const statics = [...log.querySelectorAll('.macro-row .macro-label')].map(e => e.textContent.trim());
  assert.deepStrictEqual(statics.slice(0, 4), ['Calories', 'Protein', 'Fat', 'Carbs']);
  const { window } = runJsdom('<div id="medicalNutrientBars"></div>', `
    var activeProgram = 'medical'; var userProfile = {}; var targets = {cal: 2000};
    var NUTRIENT_BAR_COLOR = {sodium: 'red', fiber: 'green'};
    function activeConditionKeys(){ return ['hypertension']; }
    function computeMicronutrientTargets(){ return { sodium:{type:'max', value:1500, unit:'mg', label:'Sodium'}, fiber:{type:'min', value:30, unit:'g', label:'Fiber'} }; }`,
    [extractFunction(src, 'renderMedicalNutrientBars'), 'renderMedicalNutrientBars({sodium: 900, fiber: 12});']);
  const labels = [...window.document.querySelectorAll('.macro-label')].map(e => e.textContent.trim());
  assert.deepStrictEqual(Array.from(labels), ['Sodium (stay under)', 'Fiber (aim for)']);
});

test('REAL CSSOM (v3.284): Today\'s word-carrying text is in the text face with tabular figures; figure-only text keeps mono numerals', (assert)=>{
  const ff = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length}`); return f[0].style; };
  for(const sel of ['.nutrition-summary', '.equip-preview', '.mesocycle-phase-tag', '.session-cal-total', '.ex-name .super-tag', '.session-length-select']){
    assert.strictEqual(ff(sel).getPropertyValue('font-family'), 'var(--font-sans)', sel);
    assert.strictEqual(ff(sel).getPropertyValue('font-variant-numeric'), 'tabular-nums', `${sel} keeps aligned figures`);
  }
  assert.strictEqual(ff('.duration-tag').getPropertyValue('font-family'), 'var(--font-mono)', '"~63 min" is a figure and keeps mono');
});

run();
