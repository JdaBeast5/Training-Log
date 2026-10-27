'use strict';
// Log tab 2.0 (owner: "go through the whole Log tab, and use our skills ... to
// make it a 2.0 version of it"). One increment per version.
//
// v3.428 — What you ate comes first. The day's food log sat at the very
// bottom of the nutrition card, under search, five quick-add tiles, the
// category chips, the whole food library and the custom-item form. It now
// opens the expandable part, right under the totals it adds up to.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-log-2-0.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const before = (a, b) => !!(a.compareDocumentPosition(b) & a.ownerDocument.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);

test('REAL markup (v3.428): the day\'s food log is the first thing in the nutrition card\'s expandable part', (assert)=>{
  const wrap = doc.getElementById('nutritionExpandWrap');
  const log = doc.getElementById('foodLogList');
  assert.strictEqual(doc.querySelectorAll('#foodLogList').length, 1);
  assert.ok(wrap.contains(log), 'still inside the collapsible part');
  for(const id of ['foodSearchInput', 'foodItems', 'customToggle', 'repeatYesterdayBtn']) assert.ok(doc.getElementById(id), 'anchor: ' + id);
  for(const id of ['foodSearchInput', 'foodItems', 'customToggle']) assert.ok(before(log, doc.getElementById(id)), 'the log comes before ' + id);
  assert.ok(before(doc.getElementById('repeatYesterdayBtn'), log), 'Repeat yesterday stays with it, above the list');
  const firstLabel = wrap.querySelector('.section-label');
  assert.strictEqual(firstLabel.textContent.trim(), 'Today');
});

run();
