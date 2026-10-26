'use strict';
// v3.304 (owner: "clean up the yellow tags, you'll find a better way to show
// it's a superset in this new format").
//  - The yellow "~N cal" tag is gone from every exercise header (the session's
//    running total stays, once, above Up next).
//  - A superset is no longer a yellow-tinted box with a 4px yellow edge, a
//    yellow banner and a dashed yellow divider (Impeccable craft floor: no
//    coloured edge over 1px). It reads as Apple-style linked rows: a small
//    neutral "Superset · no rest between" label, a thin rail linking the two
//    exercises' checkboxes, and the sets already woven together as chips.
//  - Its actions (Same as Last Time, History, Edit) moved into the opened
//    panel, each labelled with its exercise — before, they showed under each
//    exercise even with the pair closed, unlike any other exercise.
// Confirmed in Chromium: the rail runs x=52 from the first checkbox's bottom
// (214) to the second's top (246), centred on both; no action buttons show
// with the pair closed; History opens for both exercises.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-superset-chips.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
function nested(signature){
  const a = src.indexOf(signature);
  if(a === -1) throw new Error('not found: ' + signature);
  let depth = 0, i = src.indexOf('{', a);
  for(; i < src.length; i++){ if(src[i] === '{') depth++; else if(src[i] === '}' && --depth === 0) break; }
  return src.slice(a, i + 1);
}
const piece = (i, name) => ({ i, ex:{name}, headerInnerHtml:`<input type="checkbox" data-idx="${i}"><div class="ex-name">${name}</div>`,
  sameAsLastHtml:`<button class="ex-history-btn">History</button>`, cautionHtml:'', warmupHtml:'',
  setRowHtmlArr:[`<div class="set-row" data-ex-idx="${i}">${name} 1</div>`], summaryHtml:'', badge:'', detailsHtml:'' });

function buildPair(){
  return runJsdom('<div id="list"></div>', `
    window.list = document.getElementById('list'); window.activeDay = 'd1';
    window.wireSetsBlock = ()=>{}; window.wireExerciseMember = ()=>{}; window.watchSetChips = ()=>{};
  `, [extractFunction(src, 'escapeHtml'), extractFunction(src, 'exLoggerHtml') /* v3.376 */, nested('function assembleSupersetPair(topPiece, bottomPiece){'),
      `assembleSupersetPair(${JSON.stringify(piece(4, 'DB Curl'))}, ${JSON.stringify(piece(5, 'Triceps <Pushdown>'))});`]).window.document;
}

test('REAL invocation: the pair has a small superset label and no yellow banner', (assert)=>{
  const doc = buildPair();
  const tag = doc.querySelector('.superset-pair > .superset-tag');
  assert.ok(tag);
  assert.strictEqual(tag.textContent.trim(), 'Superset · no rest between');
  assert.strictEqual(doc.querySelector('.superset-banner'), null);
});

test('REAL invocation: actions live in the shared panel, labelled per exercise (escaped); none under the closed headers', (assert)=>{
  const doc = buildPair();
  const sets = doc.querySelector('.expand-wrap .sets-block');
  const actions = [...sets.querySelectorAll(':scope > .set-actions')];
  assert.deepStrictEqual(actions.map(a => a.dataset.exIdx), ['4', '5']);
  assert.deepStrictEqual(actions.map(a => a.querySelector('.set-actions-owner').textContent), ['DB Curl', 'Triceps <Pushdown>'], 'names are text, not markup');
  assert.strictEqual(doc.querySelectorAll('.superset-member .set-actions').length, 0);
  assert.ok(sets.querySelector('.set-actions + .set-actions + .set-row'), 'actions before the woven rows');
});

test('REAL source: Edit and History are found by exercise across the whole block (works for both a lone exercise and a pair)', (assert)=>{
  const wire = nested('function wireExerciseMember(memberEl, blockEl, exIdx, piece){');
  assert.match(wire, /blockEl\.querySelector\(`\.set-actions\[data-ex-idx="\$\{exIdx\}"\] \.ex-edit-btn`\)/);
  assert.match(wire, /blockEl\.querySelector\(`\.set-actions\[data-ex-idx="\$\{exIdx\}"\] \.ex-history-btn`\)/);
});

test('REAL CSSOM: no yellow anywhere on a superset; a 2px neutral rail links the two headers', (assert)=>{
  // Comments stripped: rules only (a comment may document the old yellow).
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const { window } = new JSDOM(`<style>${css}</style><div class="exercise-block superset-pair"><div class="superset-tag">x</div>
    <div class="superset-member"><div class="exercise">a</div></div><div class="superset-member" id="m2"><div class="exercise">b</div></div>
    <div class="set-row"><span class="set-row-owner">DB Curl</span></div></div>`);
  const cs = (sel, pseudo) => window.getComputedStyle(window.document.querySelector(sel), pseudo);
  const pairRules = css.match(/[^{}]*superset[^{}]*\{[^}]*\}/g).join('\n');
  assert.doesNotMatch(pairRules, /plate-yellow/, 'no yellow in any superset rule');
  assert.match(css, /\.superset-member \+ \.superset-member::before\{[^}]*width:2px;[^}]*background:rgba\(var\(--surface-white-rgb\),0\.22\)/);
  assert.strictEqual(cs('.set-row-owner').color === '' || /text-muted/.test(css.match(/\.superset-pair \.set-row-owner\{[^}]*\}/)[0]), true);
});

test('GONE: no per-exercise calorie tag in the header template, markup or styles', (assert)=>{
  assert.ok(!/ex-cal-tag/.test(src));
  assert.ok(/updateSessionCalorieTotal\(renderExercises, completed\)/.test(src), 'the session total stays');
});

run();
