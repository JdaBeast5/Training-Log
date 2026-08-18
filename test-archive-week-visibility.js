'use strict';
// Behavioral coverage for the "Save this week & start fresh" button's
// reachability. Found via user review: the button used to live entirely
// inside renderWorkout()'s REST-DAY branch, rebuilt into #exerciseList's
// innerHTML only when `activeDay === 'd7' && day.rest`. That's fine for
// programs whose Day 7 is always a rest day -- but the configurable-
// training-days feature's 6/7-day variants make Day 7 a genuine TRAINING
// day (not rest:true) for every program it covers, so the button became
// completely unreachable at those frequencies: nowhere in the UI could a
// 6/7-day/week user ever archive their week.
//
// Fixed by moving the button to a persistent element (#archiveWeekWrap)
// that lives as a sibling of #exerciseList inside #workoutCard, shown/
// hidden by renderArchiveWeekVisibility() based on `activeDay === 'd7'`
// alone -- day-count and rest-status independent. Two things this test
// suite specifically checks, because a persistent (not rebuilt-per-render)
// element is a different failure mode than the old rebuilt-per-render one:
//   1. The button must survive #exerciseList's innerHTML being wholesale
//      replaced on every renderWorkout() call -- i.e. it must NOT be a
//      descendant of #exerciseList, or the old bug just relocates.
//   2. Because it's no longer torn down and rebuilt fresh on every visit
//      to Day 7, a stale "week saved" confirmation (and a disabled button)
//      from an EARLIER visit must be explicitly reset when Day 7 becomes
//      visible again, or old confirmation state would wrongly persist into
//      a later week.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-archive-week-visibility.js');

const workoutCardHtml = extractElementById(src, 'workoutCard');

test('sabotage-relevant: #archiveWeekWrap exists, starts hidden, and is a SIBLING of #exerciseList — not nested inside it, or it would be destroyed on every renderWorkout() re-render the same way the old bug worked', (assert)=>{
  assert.match(workoutCardHtml, /id="archiveWeekWrap"/);
  assert.match(workoutCardHtml, /id="archiveWeekBtn"/);
  assert.match(workoutCardHtml, /id="archiveWeekStatus"/);
  assert.match(workoutCardHtml, /id="weekShareWrap"/);
  assert.match(workoutCardHtml, /id="weekShareBtn"/);

  const { window } = runJsdom(workoutCardHtml, '', []);
  const wrap = window.document.getElementById('archiveWeekWrap');
  const exerciseList = window.document.getElementById('exerciseList');
  assert.strictEqual(wrap.style.display, 'none', 'must start hidden — visibility is decided per-render by renderArchiveWeekVisibility(), not by default markup');
  assert.notStrictEqual(wrap, null);
  assert.notStrictEqual(exerciseList, null);
  assert.ok(!exerciseList.contains(wrap), 'archiveWeekWrap must not be a descendant of exerciseList — it needs to survive exerciseList.innerHTML being wholesale-replaced on every render');
  assert.strictEqual(wrap.parentElement, exerciseList.parentElement, 'expected both to be siblings under the same #workoutCard parent');
});

const visibilityChunks = [
  extractFunction(src, 'renderArchiveWeekVisibility'),
];

test('REAL invocation: renderArchiveWeekVisibility() shows the wrap when activeDay is "d7"', (assert)=>{
  const { window } = runJsdom(workoutCardHtml, 'window.activeDay = "d7";', visibilityChunks.concat([
    'renderArchiveWeekVisibility();',
  ]));
  const wrap = window.document.getElementById('archiveWeekWrap');
  assert.notStrictEqual(wrap.style.display, 'none');
});

test('REAL invocation: renderArchiveWeekVisibility() hides the wrap for every day OTHER than "d7", regardless of whether that day is a rest day or a training day (this function never looks at day.rest at all)', (assert)=>{
  for(const day of ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']){
    const { window } = runJsdom(workoutCardHtml, `window.activeDay = "${day}";`, visibilityChunks.concat([
      'renderArchiveWeekVisibility();',
    ]));
    const wrap = window.document.getElementById('archiveWeekWrap');
    assert.strictEqual(wrap.style.display, 'none', `expected hidden on ${day}`);
  }
});

test('sabotage: REAL invocation — revisiting "d7" resets a stale post-archive state (disabled button, leftover status text, visible share-wrap) from an earlier visit, instead of leaving it stuck', (assert)=>{
  const { window } = runJsdom(workoutCardHtml, 'window.activeDay = "d3";', visibilityChunks.concat([
    // Simulate what archiveCurrentWeek() leaves behind after a real save:
    // the button disabled mid-save, a real confirmation message, and the
    // share button revealed.
    `document.getElementById('archiveWeekBtn').disabled = true;`,
    `document.getElementById('archiveWeekStatus').innerHTML = 'Week saved — back to Day 1 for a fresh start ✓';`,
    `document.getElementById('weekShareWrap').style.display = '';`,
    'renderArchiveWeekVisibility();', // still on d3 -- wrap stays hidden, nothing reset yet
    'window.activeDay = "d7";',
    'renderArchiveWeekVisibility();', // now visiting d7 fresh -- must reset
  ]));
  assert.strictEqual(window.document.getElementById('archiveWeekBtn').disabled, false, 'button must be re-enabled on a fresh visit to Day 7');
  assert.strictEqual(window.document.getElementById('archiveWeekStatus').innerHTML.trim(), '', 'stale confirmation text must not linger into a later week');
  assert.strictEqual(window.document.getElementById('weekShareWrap').style.display, 'none', 'stale share button must not linger into a later week');
});

run();
