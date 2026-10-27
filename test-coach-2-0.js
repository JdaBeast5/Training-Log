'use strict';
// Coach tab 2.0 (owner: "Now the coach tab with our skills"). One increment
// per version. Card order is left as test-coach-tab-order.js pins it.
//
// v3.454 — Name the movement first. Choosing a clip starts the review at
// once, and the change handler reads the exercise and focus fields at that
// moment — but the fields sat below the upload button, so uploading first
// (the order on screen) sent "this movement" and no focus.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-coach-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const before = (a, b) => !!(a.compareDocumentPosition(b) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);

test('REAL markup + source (v3.454): the exercise and focus fields come before the upload button that starts the review', (assert)=>{
  const btn = doc.getElementById('coachVideoBtn');
  for(const id of ['coachExerciseInput', 'coachFocusInput']) assert.ok(before(doc.getElementById(id), btn), id + ' before the button');
  assert.ok(before(btn, doc.getElementById('coachResult')), 'the result follows the button');
  const start = src.indexOf("document.getElementById('coachVideoInput').addEventListener('change'");
  const handler = src.slice(start, start + 600);
  assert.match(handler, /getElementById\('coachExerciseInput'\)\.value/, 'anchor: the review reads the fields as soon as a clip is chosen');
  assert.match(handler, /getElementById\('coachFocusInput'\)\.value/);
});

run();
