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

// v3.455 — Ask Your Coach said one thing twice: a hint ("Ask about training,
// nutrition or recovery — the coach already knows your goal and program")
// over an empty conversation saying the same. The empty conversation (shared
// with the floating chat) keeps it. "Clear conversation" shows only when there
// is one.
function chat(history){
  const { window } = runJsdom('<div id="coachChatLog"></div><div id="floatingChatLog"></div><button id="coachChatClear">Clear conversation</button>',
    `var coachChatHistory = ${JSON.stringify(history)};`, [extractFunction(src, 'escapeHtml'), extractFunction(src, 'renderCoachChatLog'), 'renderCoachChatLog();']);
  return window.document;
}
test('REAL invocation (v3.455): Clear is hidden on an empty conversation and shown once there is one; both logs render', (assert)=>{
  const empty = chat([]);
  assert.strictEqual(empty.getElementById('coachChatClear').style.display, 'none');
  assert.match(empty.getElementById('coachChatLog').textContent, /Ask something about your training/);
  assert.match(empty.getElementById('floatingChatLog').textContent, /Ask something about your training/);
  const some = chat([{role:'user', content:'How much protein?'}, {role:'assistant', content:'About 1.6 g/kg.'}]);
  assert.strictEqual(some.getElementById('coachChatClear').style.display, '');
  assert.strictEqual(some.querySelectorAll('#coachChatLog .coach-chat-bubble').length, 2);
  assert.strictEqual(some.querySelectorAll('#floatingChatLog .coach-chat-bubble').length, 2);
});

test('REAL markup (v3.455): the chat card no longer repeats the empty conversation\'s line as a hint', (assert)=>{
  const card = doc.getElementById('coachChatLog').closest('.card');
  assert.strictEqual(card.querySelector('.history-hint'), null);
});

run();
