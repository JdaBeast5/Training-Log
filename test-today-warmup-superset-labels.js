'use strict';
// v3.274 (tasteskill Today pilot, 4b): warm-up and superset labels in the
// workout card stop shouting. Sentence case in the text face, no tracking,
// nothing under 11px; the ⚡ the superset banner injected through ::before is
// gone; the warm-up box keeps its pale orange tint + 1px same-hue border (the
// skill's own "notice" pattern, and still pinned by
// test-rgba-background-border-consolidation.js) but loses its rim and orange
// glow shadow; the warm-up nudge's prose moves to the text face while the
// ramp's own figures keep their mono numerals.
//
// Checked against the real stylesheet (CSSOM) and real function output.
// Computed styles were confirmed in Chromium too: banner/owner/titles Inter,
// text-transform none, 12px; .warmup-box box-shadow none; the nudge note Inter
// (that check is what caught a first draft losing the cascade to the later
// mono .warmup-row rule at equal specificity — see the specificity test below).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-warmup-superset-labels.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style>`).window;

function rules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
function only(selector){
  const found = rules().filter(r => r.selectorText === selector);
  if(found.length !== 1) throw new Error(`expected exactly one "${selector}" rule, found ${found.length}`);
  return found[0].style;
}
const LABELS = ['.superset-banner', '.superset-pair .set-row-owner', '.warmup-box .warmup-title', '.warmup-strip .warmup-title'];

test('REAL CSSOM: every warm-up/superset label is sentence case, untracked and at least 11px (house floor)', (assert)=>{
  for(const sel of LABELS){
    const st = only(sel);
    assert.strictEqual(st.getPropertyValue('text-transform'), '', `${sel} must not uppercase`);
    assert.strictEqual(st.getPropertyValue('letter-spacing'), '', `${sel} must not track`);
    const px = parseFloat(st.getPropertyValue('font-size'));
    assert.ok(px >= 11, `${sel} is ${px}px, under the 11px floor`);
  }
});

test('REAL CSSOM: the superset banner is in the text face and no ::before injects a glyph into it', (assert)=>{
  assert.ok(!/Mono|monospace/.test(only('.superset-banner').getPropertyValue('font-family')), 'banner must use the text face');
  const before = rules().filter(r => /\.superset-banner::before/.test(r.selectorText));
  assert.strictEqual(before.length, 0, 'the ::before that injected ⚡ must be gone');
});

test('REAL CSSOM: the warm-up box has no shadow of its own, but keeps its pale tint and same-hue border (a notice)', (assert)=>{
  const box = only('.warmup-box');
  assert.strictEqual(box.getPropertyValue('box-shadow'), '', 'no rim, no orange glow');
  assert.match(box.getPropertyValue('background'), /plate-orange-rgb/);
  assert.match(box.getPropertyValue('border'), /plate-orange-rgb/);
});

test('REAL cascade: the nudge-note rule outranks the mono .warmup-row rule (equal specificity lost to source order in a first draft)', (assert)=>{
  const note = only('.warmup-box .warmup-row.warmup-note');
  assert.strictEqual(note.getPropertyValue('font-family'), 'inherit');
  assert.match(only('.warmup-box .warmup-row').getPropertyValue('font-family'), /--font-mono/, 'ramp figures keep their mono numerals (via the --font-mono token since v3.276)');
  // Both rules match the same element, and the note's selector carries one more class.
  const el = document.createElement('div'); el.className = 'warmup-box';
  el.innerHTML = '<div class="warmup-row warmup-note"></div>'; document.body.appendChild(el);
  const row = el.firstChild;
  assert.ok(row.matches('.warmup-box .warmup-row.warmup-note') && row.matches('.warmup-box .warmup-row'));
});

test('REAL invocation: buildWarmupNudgeHtml tags its prose row as a note for every reason, so it takes the text face', (assert)=>{
  const { window } = runJsdom('<div id="out"></div>', '', [extractFunction(src, 'buildWarmupNudgeHtml'),
    'window.__html = ["bodyweight","light","no-history"].map(r=>buildWarmupNudgeHtml(r));']);
  for(const h of window.__html){
    const out = window.document.getElementById('out'); out.innerHTML = h;
    const row = out.querySelector('.warmup-box > .warmup-row');
    assert.ok(row && row.classList.contains('warmup-note'), 'the nudge row must carry .warmup-note');
    assert.ok(row.textContent.length > 40, 'and still hold the advice text');
  }
});

test('REAL source site: renderWorkout writes the superset banner in sentence case (site anchored to exactly one occurrence)', (assert)=>{
  const lines = extractFunction(src, 'renderWorkout').split('\n').filter(l => l.includes('class="superset-banner"'));
  assert.strictEqual(lines.length, 1, `expected one superset-banner site in renderWorkout, found ${lines.length}`);
  const text = lines[0].replace(/^.*class="superset-banner">/, '').replace(/<\/div>.*$/, '');
  assert.strictEqual(text, 'Superset — straight into the next exercise, no rest between');
});

run();
