'use strict';
// First launch (owner: "Let's do them all", after a review).
//
// v3.467 — No half a choice. With no profiles on the device the picker said
// "No profiles on this device yet — create the first one below", then
// "— or —" with nothing above it to choose. On a first launch the list and
// the divider both stay out; with profiles, both show as before.
const { makeRunner, readIndexSource, extractFunction, extractElementById, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-first-launch.js');
const src = readIndexSource();

function picker(users){
  const { window } = runJsdom(extractElementById(src, 'userPickerOverlay'), `
    window.getUserList = () => ${JSON.stringify(users)};
    window.activeUserId = ${users.length ? "'1'" : 'null'};
    window.switchToUser = () => {};`,
    [extractFunction(src, 'escapeHtml'), extractFunction(src, 'showUserPicker'), 'showUserPicker();']);
  return window.document;
}

test('REAL invocation (v3.467): first launch shows only the create form, no empty list and no "or"', (assert)=>{
  const doc = picker([]);
  assert.strictEqual(doc.querySelector('.user-picker-divider').hidden, true);
  assert.strictEqual(doc.getElementById('userPickerList').textContent.trim(), '');
  assert.ok(doc.getElementById('newUserNameInput'), 'anchor: the create form is there');
});

test('REAL invocation (v3.467): with profiles, the list and the divider show', (assert)=>{
  const doc = picker([{id:'1', name:'Jordan'}, {id:'2', name:'Sam'}]);
  assert.strictEqual(doc.querySelector('.user-picker-divider').hidden, false);
  assert.deepStrictEqual([...doc.querySelectorAll('.user-pick-btn')].map(b => b.textContent), ['Jordan', 'Sam']);
});

run();
