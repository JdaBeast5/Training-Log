'use strict';
// v3.300 — owner, choosing the set chips: "we can then remove some of the
// functions like plates and voice since we won't need them". One tap now logs
// the recommended set, and the set sheet's − / + already step by loadable
// weights, so the plate calculator and voice SET logging were removed: their
// buttons (set rows, warm-up rows, the add-set template), the recognition
// flow, the transcript parser, the plate math, the voice tip, and every style.
//
// Replaces four test files whose only subject was those controls (their
// glyphs, gym-mode sizing and aria-labels): test-plate-btn-glyph.js,
// test-voice-log-btn-glyph.js, test-voice-log-affordance.js and
// test-warmup-plate-btn-glyph.js. Other guards that mentioned them were
// updated with dated notes.
//
// Kept on purpose, and guarded here:
//  - Describe a Meal's own dictation (a different feature): SpeechRecognitionCtor
//    and its mic button, whose styles were the set row's and now live scoped to
//    its slot — still a drawn icon, emoji hidden;
//  - rounding suggested weights to the plates you own (getEquipment +
//    snapToLoadable), which the recommendations depend on.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-plate-voice-removed.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// The raw source, deliberately: a comment stripper is fooled by `accept="image/*"`
// (it reads as a comment opener and swallows the file), which would make every
// GONE check below pass vacuously. No surviving comment names a removed symbol.
const code = src;

test('GONE: no plate or mic button, result panel or voice line is emitted anywhere (set row, add-set row, warm-up row)', (assert)=>{
  for(const cls of ['plate-btn', 'voice-log-btn', 'plate-result', 'voice-feedback']){
    assert.ok(!new RegExp(`class="${cls}"`).test(code), `markup for .${cls} must be gone`);
  }
  // The one voice-log-btn left is Describe a Meal's, created in JS, not in any set template.
  assert.strictEqual((code.match(/className = 'voice-log-btn'/g) || []).length, 1);
});

test('REAL invocation: a warm-up ramp row has no plate button', (assert)=>{
  const { window } = runJsdom('', 'var weightUnit = "lb";', [
    extractFunction(src, 'escapeHtml'), extractFunction(src, 'trimUnitNum'), extractFunction(src, 'warmupRepsValue'),
    'function toDisplayWeight(w){ return w; }', extractFunction(src, 'buildWarmupRampRowsHtml'),
    'window.__html = buildWarmupRampRowsHtml([{idx:0, label:"Bar", weight:45, reps:"10"}, {idx:1, label:"60%", weight:95, reps:"5"}], []);']);
  const doc = new JSDOM(window.__html).window.document;
  assert.strictEqual(doc.querySelectorAll('.warmup-set-row').length, 2, 'anchor: the rows render');
  assert.strictEqual(doc.querySelectorAll('.plate-btn, .plate-result').length, 0);
});

test('GONE: the parser, recognition flow, plate math and voice tip — no definitions, no calls, no styles', (assert)=>{
  for(const name of ['parseVoiceSet', 'voiceNormalise', 'voiceCollapseNumbers', 'wirePlateButton', 'calcPlatesPerSide', 'formatPlateResult', 'renderVoiceHint', 'startVoiceRecognition']){
    assert.ok(!new RegExp(`\\b${name}\\b`).test(code), `${name} must be gone`);
  }
  assert.ok(!/__voiceRecognition|voiceHintBanner/.test(code));
  assert.ok(!/\.plate-btn|\.plate-result|\.voice-feedback|\.voice-hint-banner/.test(code), 'no leftover selectors');
});

test('KEPT: Describe a Meal still dictates — its mic is created when speech is supported, and is a drawn icon with the emoji hidden', (assert)=>{
  const { window } = runJsdom('<span id="describeFoodVoiceSlot"></span><input id="describeFoodInput">',
    'var SpeechRecognitionCtor = function(){};', [extractFunction(src, 'initDescribeFoodVoice'), 'initDescribeFoodVoice();']);
  const btn = window.document.querySelector('#describeFoodVoiceSlot .voice-log-btn');
  assert.ok(btn, 'the mic is created');
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window: w } = new JSDOM(`<style>${css}</style><span id="describeFoodVoiceSlot"><button class="voice-log-btn">🎤</button></span>`);
  const b = w.document.querySelector('button');
  assert.strictEqual(w.getComputedStyle(b).fontSize, '0px', 'emoji hidden');
  assert.match(html, /#describeFoodVoiceSlot \.voice-log-btn::after\{[^}]*mask-image:url\("data:image\/svg\+xml/, 'drawn mic icon');
  assert.match(html, /#describeFoodVoiceSlot \.voice-log-btn\.listening\{[^}]*animation:voiceListenPulse/, 'listening state');
  assert.match(code, /@keyframes voiceListenPulse/);
  assert.match(code, /const SpeechRecognitionCtor = window\.SpeechRecognition \|\| window\.webkitSpeechRecognition;/);
});

test('KEPT: suggested weights still round to the plates you own (getEquipment + snapToLoadable)', (assert)=>{
  assert.match(code, /function getEquipment\(\)/);
  assert.match(code, /function snapToLoadable\(/);
});

run();
