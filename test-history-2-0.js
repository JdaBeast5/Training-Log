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

// v3.444 — Day rows. Each exercise was one wrapping mono string ("Lat
// Pulldown 80×8, 80×8, 80×7 Vol 1,840 — —"), with two dashes for changes that
// didn't happen, and deltas wrapping onto their own line. Now the name and
// any change share the first line, sets and volume sit under it, and no-change
// prints nothing (the weight line too). Dates read in the text face.
function dayCard(day){
  const { window } = runJsdom('<div id="out"></div>', `
    window.weightUnit = 'lb'; window.toDisplayWeight = v => v; window.trimUnitNum = v => String(v);
    window.fmtWeight = v => v + ' lb'; window.distanceUnit = 'km'; window.toDisplayDistance = v => v;
    window._historyDayMap = { '2026-10-24': ${JSON.stringify(day)} };`,
    [extractFunction(src, 'escapeHtml'), extractFunction(src, 'parseDateKey'), extractFunction(src, 'formatDate'), extractFunction(src, 'fmtDayLabel'), extractFunction(src, 'deltaSpan'), extractFunction(src, 'buildHistoryDayCardHtml'),
     "document.getElementById('out').innerHTML = buildHistoryDayCardHtml('2026-10-24');"]);
  return window.document;
}

const EX = (name, deltaWeight, deltaReps) => ({name, dayLabel:'Strength · Day 1', volume:1840, deltaWeight, deltaReps,
  sets:[{weight:80, reps:8}, {weight:80, reps:8}, {weight:80, reps:7}]});
test('REAL invocation (v3.444): an exercise is name + changes, then sets · volume; no change prints nothing', (assert)=>{
  const doc = dayCard({weight:180.1, weightDelta:0, exercises:[EX('Lat Pulldown', 0, 0), EX('Bench Press', 5, -1)]});
  const rows = [...doc.querySelectorAll('.day-ex-row.day-ex-logged')];
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].querySelector('.day-ex-name').textContent, 'Lat Pulldown');
  assert.strictEqual(rows[0].querySelector('.day-ex-changes').textContent.trim(), '', 'no "— —"');
  assert.strictEqual(rows[0].querySelector('.day-ex-sets').textContent.replace(/\s+/g, ' ').trim(), '80×8, 80×8, 80×7 · Vol 1,840');
  assert.deepStrictEqual([...rows[1].querySelectorAll('.day-ex-changes span')].map(x => x.textContent), ['+5 lb', '-1 reps']);
  assert.doesNotMatch(doc.querySelector('.day-weight-row').textContent, /—/, 'an unchanged weight prints no dash either');
  assert.strictEqual(doc.querySelectorAll('.delta-flat').length, 0);
});

test('REAL CSSOM (v3.444): two-line grid; changes right-aligned on the first line; date in the text face', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div class="day-card-date" id="d">Sat, Oct 24</div><div class="day-ex-row day-ex-logged" id="r"><span class="day-ex-name">A</span><span class="day-ex-changes" id="c"></span><span class="day-ex-sets" id="s">x</span></div><div class="day-ex-row" id="plain"></div>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('r').display, 'grid');
  assert.strictEqual(cs('plain').display, 'flex', 'other .day-ex-row users (saved weeks) keep their layout');
  assert.strictEqual(cs('c').whiteSpace, 'nowrap');
  assert.strictEqual(cs('d').fontFamily, 'var(--font-sans)');
  assert.match(CSS, /\.day-ex-logged > :not\(\.day-ex-name\):not\(\.day-ex-changes\)\{grid-column:1 \/ -1;\}/);
});

run();
