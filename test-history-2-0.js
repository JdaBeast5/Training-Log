'use strict';
// History tab 2.0 (owner: "Now the history tab" — the Log and Analysis 2.0
// passes, same skills). One increment per version.
//
// v3.443 — The log leads. History's core, the Day-by-Day Log (calendar and
// every logged day), sat last, under the PR timeline and a Saved Weeks card
// that is empty until you save a week. It now comes first.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-history-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

test('REAL markup (v3.443): Day-by-Day Log first, then the PR timeline, then Saved Weeks', (assert)=>{
  const cards = [...doc.getElementById('historyView').children].filter(c => c.classList.contains('card'));
  assert.strictEqual(cards.length, 3, 'anchor: the real three cards');
  assert.ok(cards[0].querySelector('#historyLogHeader') && cards[0].querySelector('#historyList'), 'the log leads');
  assert.ok(cards[1].querySelector('#prTimeline'));
  assert.ok(cards[2].querySelector('#savedWeeksList'));
  assert.strictEqual(doc.getElementById('careView').parentElement, doc.getElementById('historyView').parentElement, 'the next view is still a sibling, not swallowed');
});

run();
