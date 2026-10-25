'use strict';
// v3.293 (Impeccable typeset + distill on the workout card): one button type
// scale instead of five (Log set 14.5px, Gym mode 15px, the length select 16px,
// "+ Add custom exercise" 13px/400, Adapt 13px/600 in two cramped lines):
//  - actions you take now (Log set, session length, Gym mode): 16px/600;
//  - actions that extend the list (add custom, adapt): 15px/500, full 44px targets;
//  - the voice tip under Up next is a quiet note — muted, no hairline — and its
//    ✕ gets a real 44px touch target (it was 19×22px).
// Checked on COMPUTED style, with the real stylesheet, on the real elements.
// Measured in Chromium at 390px: Log set 16px; add custom 44px tall; Adapt
// 15px/500 in two balanced lines; the tip's ✕ 44×44.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-workout-card-type-scale.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { window } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''));
const { document } = window;
const cs = el => window.getComputedStyle(typeof el === 'string' ? document.querySelector(el) : el);
const declared = sel => { const m = html.match(new RegExp('\\n\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{[^}]*\\}')); if(!m) throw new Error(sel); return m[0]; };

test('REAL computed style: the actions you take now share 16px/600 — Log set is never smaller than the controls above it', (assert)=>{
  for(const sel of ['#upNextLog', '#gymEnterBtn']){
    assert.strictEqual(cs(sel).fontSize, '16px', sel);
    assert.strictEqual(String(cs(sel).fontWeight), '600', sel);
  }
});

test('REAL computed style: the list-extending actions share 15px/500 with full 44px touch targets', (assert)=>{
  for(const sel of ['#addCustomExerciseBtn', '#adaptWorkoutBtn']){
    assert.strictEqual(cs(sel).fontSize, '15px', sel);
    assert.strictEqual(String(cs(sel).fontWeight), '500', sel);
    assert.strictEqual(cs(sel).minHeight, '44px', sel);
  }
});

// v3.300 (owner request): the plate calculator and voice set logging were removed with the set chips.
// The voice tip this test quietened (v3.293) went with it.
test('REMOVED (v3.300): the voice tip and its styles are gone from the workout card', (assert)=>{
  assert.strictEqual(document.getElementById('voiceHintBanner'), null);
  assert.ok(!/\.voice-hint-banner\{/.test(html), 'no leftover rule');
});

run();
