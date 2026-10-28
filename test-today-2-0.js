'use strict';
// Today tab 2.0 (owner: "Let's do them all", after a review of what was left).
// One increment per version. v3.463 (Priorities folded) is covered in
// test-today-priorities.js, beside the rest of that list's behaviour.
//
// v3.464 — The adapt button is a label, not a question. "Only have limited
// equipment or time today? Adapt this session" wrapped to two lines on a
// phone, at full width under the exercise list. It says what it does in one
// line; the field it opens still gives the examples.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-2-0.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;

test('REAL markup (v3.464): the adapt button is one short label; its field still carries the examples', (assert)=>{
  const btn = doc.getElementById('adaptWorkoutBtn');
  assert.strictEqual(btn.textContent, 'Adapt for limited equipment or time');
  assert.ok(btn.textContent.length <= 36, 'fits one line at 15px in the card');
  assert.match(doc.getElementById('adaptWorkoutInput').getAttribute('placeholder'), /only dumbbells.*20 minutes/, 'anchor: the examples it no longer needs to carry');
  assert.ok(btn.classList.contains('adapt-workout-toggle'), 'same control, same styles');
});

run();
