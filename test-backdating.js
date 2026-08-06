'use strict';
// Behavioral coverage for the backdating system's core date logic —
// setLogDate's future-date clamp, mondayOf's week-start math, and
// isInCurrentCalendarWeek (the week-boundary gate that stops fixing an old
// week's checkbox from bleeding into the current week's display). Tier 1:
// mondayOf previously had a real, shipped timezone bug (used toISOString(),
// which silently shifted the week boundary a day early for anyone east of
// Greenwich) — exactly the kind of date-math mistake that's invisible until
// you check it against a known real-world fact, which is what these tests
// do rather than trusting hand arithmetic alone.
//
// getTodayKey() reads the real system clock, so isInCurrentCalendarWeek's
// tests build dates relative to the real "today" (same approach as
// test-streak.js) rather than a fixed fake date.
const { readIndexSource, extractFunction, runSandbox, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const { test, run } = makeRunner('test-backdating.js');

const mondayChunks = [extractFunction(src, 'mondayOf')];

test('mondayOf(2026-07-01), a known Wednesday, returns 2026-06-29', (assert)=>{
  const [monday] = runSandbox(mondayChunks, `__capture.push(mondayOf('2026-07-01'));`);
  assert.strictEqual(monday, '2026-06-29');
});

test('mondayOf handles the Sunday edge case (day 0) correctly, not treating it as day 7', (assert)=>{
  // 2026-06-28 is a Sunday, the LAST day of the week that started 2026-06-22.
  const [monday] = runSandbox(mondayChunks, `__capture.push(mondayOf('2026-06-28'));`);
  assert.strictEqual(monday, '2026-06-22');
});

test('mondayOf is idempotent: applying it to a date that is already a Monday returns the same date', (assert)=>{
  const [monday] = runSandbox(mondayChunks, `__capture.push(mondayOf('2026-06-29'));`);
  assert.strictEqual(monday, '2026-06-29');
});

const weekGateChunks = [
  extractFunction(src, 'getTodayKey'),
  ...mondayChunks,
  extractFunction(src, 'isInCurrentCalendarWeek'),
];

test('isInCurrentCalendarWeek: this Monday and this Sunday are both in range; last week and next week are not', (assert)=>{
  const [monday, sunday, lastSunday, nextMonday] = runSandbox(weekGateChunks, `
    var m = mondayOf(getTodayKey());
    function plusDays(dateStr, n){
      var d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() + n);
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    __capture.push(isInCurrentCalendarWeek(m));
    __capture.push(isInCurrentCalendarWeek(plusDays(m, 6)));
    __capture.push(isInCurrentCalendarWeek(plusDays(m, -1)));
    __capture.push(isInCurrentCalendarWeek(plusDays(m, 7)));
  `);
  assert.strictEqual(monday, true, 'this week\'s Monday must be in range');
  assert.strictEqual(sunday, true, 'this week\'s Sunday (Monday+6) must be in range');
  assert.strictEqual(lastSunday, false, 'the day before this Monday (last week) must NOT be in range');
  assert.strictEqual(nextMonday, false, 'next Monday (Monday+7) must NOT be in range');
});

const setLogDateChunks = [
  extractFunction(src, 'getTodayKey'),
  `var selectedLogDate = null;`,
  `function renderLogDateBar(){ /* DOM rendering — irrelevant to the clamp logic under test */ }`,
  `async function refreshForLogDate(){ /* view refresh — irrelevant to the clamp logic under test */ }`,
  extractFunction(src, 'setLogDate'),
];

test('setLogDate never allows selecting a date in the future — clamps to today', (assert)=>{
  const [selectedDate, today] = runSandbox(setLogDateChunks, `
    var today = getTodayKey();
    var d = new Date(today + 'T00:00:00'); d.setDate(d.getDate() + 30);
    var future = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    setLogDate(future);
    __capture.push(selectedLogDate);
    __capture.push(today);
  `);
  assert.strictEqual(selectedDate, today, 'a 30-day-future date must clamp to today, not be accepted as-is');
});

test('setLogDate accepts a genuine past date unchanged', (assert)=>{
  const [selected] = runSandbox(setLogDateChunks, `
    setLogDate('2020-01-15');
    __capture.push(selectedLogDate);
  `);
  assert.strictEqual(selected, '2020-01-15');
});

run();
