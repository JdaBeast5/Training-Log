'use strict';
// Behavioral coverage for the "Save this week & start fresh" button's
// reachability. Found via user review, in two rounds:
//
// Round 1: the button used to live entirely inside renderWorkout()'s
// REST-DAY branch, rebuilt into #exerciseList's innerHTML only when
// `activeDay === 'd7' && day.rest`. That's fine for programs whose Day 7
// is always a rest day -- but the configurable-training-days feature's
// 6/7-day variants make Day 7 a genuine TRAINING day (not rest:true) for
// every program it covers, so the button became completely unreachable at
// those frequencies: nowhere in the UI could a 6/7-day/week user ever
// archive their week. Fixed by moving the button to a persistent element
// (#archiveWeekWrap) that lives as a sibling of #exerciseList inside
// #workoutCard, so it survives #exerciseList's innerHTML being wholesale-
// replaced on every render instead of being torn down with it.
//
// Round 2: the visibility check itself was still gated on the literal id
// 'd7' -- which ignores that days can be drag-reordered (see dayOrder/
// moveDay elsewhere in this file). After a reorder, the day genuinely
// sitting in the LAST tab position is whatever dayOrder[dayOrder.length-1]
// says, not necessarily 'd7'. renderArchiveWeekVisibility() now keys off
// that instead -- "the end of my week" is about the user's actual rail
// position, not an internal id they never see.
//
// Persisting the element (rather than rebuilding it fresh every visit)
// introduces its own failure mode this suite checks for too: a stale
// "week saved" confirmation (and a disabled button) from an EARLIER visit
// must be explicitly reset when the last-position day becomes active
// again, or old confirmation state would wrongly persist into a later week.
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
const defaultOrderGlobals = 'window.dayOrder = ["d1","d2","d3","d4","d5","d6","d7"];';

test('REAL invocation: renderArchiveWeekVisibility() shows the wrap when activeDay is in the default order\'s LAST slot ("d7")', (assert)=>{
  const { window } = runJsdom(workoutCardHtml, defaultOrderGlobals + ' window.activeDay = "d7";', visibilityChunks.concat([
    'renderArchiveWeekVisibility();',
  ]));
  const wrap = window.document.getElementById('archiveWeekWrap');
  assert.notStrictEqual(wrap.style.display, 'none');
});

test('REAL invocation: renderArchiveWeekVisibility() hides the wrap for every OTHER slot in the default order, regardless of whether that day is a rest day or a training day (this function never looks at day.rest at all)', (assert)=>{
  for(const day of ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']){
    const { window } = runJsdom(workoutCardHtml, defaultOrderGlobals + ` window.activeDay = "${day}";`, visibilityChunks.concat([
      'renderArchiveWeekVisibility();',
    ]));
    const wrap = window.document.getElementById('archiveWeekWrap');
    assert.strictEqual(wrap.style.display, 'none', `expected hidden on ${day}`);
  }
});

test('sabotage: REAL invocation — after the days are drag-reordered so "d3" now sits in the LAST tab position, the wrap follows the position, not the literal id "d7" (which is no longer last)', (assert)=>{
  const reorderedGlobals = 'window.dayOrder = ["d7","d1","d2","d4","d5","d6","d3"]; window.activeDay = "d3";';
  const { window } = runJsdom(workoutCardHtml, reorderedGlobals, visibilityChunks.concat([
    'renderArchiveWeekVisibility();',
  ]));
  const wrap = window.document.getElementById('archiveWeekWrap');
  assert.notStrictEqual(wrap.style.display, 'none', 'd3 is now in the last slot after reordering, so the button must show here');
});

test('sabotage: REAL invocation — after that same reorder, visiting the literal "d7" (now in the FIRST slot, not the last) does NOT show the button', (assert)=>{
  const reorderedGlobals = 'window.dayOrder = ["d7","d1","d2","d4","d5","d6","d3"]; window.activeDay = "d7";';
  const { window } = runJsdom(workoutCardHtml, reorderedGlobals, visibilityChunks.concat([
    'renderArchiveWeekVisibility();',
  ]));
  const wrap = window.document.getElementById('archiveWeekWrap');
  assert.strictEqual(wrap.style.display, 'none', 'd7 is no longer the last slot after reordering, so the button must NOT show here — proving the check is position-based, not id-based');
});

test('sabotage: REAL invocation — revisiting the last-position day resets a stale post-archive state (disabled button, leftover status text, visible share-wrap) from an earlier visit, instead of leaving it stuck', (assert)=>{
  const { window } = runJsdom(workoutCardHtml, defaultOrderGlobals + ' window.activeDay = "d3";', visibilityChunks.concat([
    // Simulate what archiveCurrentWeek() leaves behind after a real save:
    // the button disabled mid-save, a real confirmation message, and the
    // share button revealed.
    `document.getElementById('archiveWeekBtn').disabled = true;`,
    `document.getElementById('archiveWeekStatus').innerHTML = 'Week saved — back to Day 1 for a fresh start ✓';`,
    `document.getElementById('weekShareWrap').style.display = '';`,
    'renderArchiveWeekVisibility();', // still on d3 -- wrap stays hidden, nothing reset yet
    'window.activeDay = "d7";',
    'renderArchiveWeekVisibility();', // now visiting the last slot fresh -- must reset
  ]));
  assert.strictEqual(window.document.getElementById('archiveWeekBtn').disabled, false, 'button must be re-enabled on a fresh visit to the last-position day');
  assert.strictEqual(window.document.getElementById('archiveWeekStatus').innerHTML.trim(), '', 'stale confirmation text must not linger into a later week');
  assert.strictEqual(window.document.getElementById('weekShareWrap').style.display, 'none', 'stale share button must not linger into a later week');
});

run();
