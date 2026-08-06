'use strict';
// Regression test for Phase C2 of the stabilization plan: consolidating
// formatShortDate, formatLogDateLabel, fmtWeekLabel, fmtMonthLabel, and
// fmtDayLabel — five independent reimplementations of the same
// `new Date(x+'T00:00:00')` + `toLocaleDateString('en-US', opts)` idiom,
// each with slightly different options. Confirmed empirically (not just by
// reading the code) that formatLogDateLabel's non-Today/Yesterday fallback
// and fmtDayLabel produce byte-identical output for the same date — this
// is the concrete duplication being removed.
//
// Every expected value below was captured by RUNNING the real pre-refactor
// functions, not hand-typed — Intl.toLocaleDateString's exact punctuation
// (e.g. the en dash in a week range) is easy to get subtly wrong by hand.
// Dates are built relative to the real system clock for the
// today/yesterday cases, same pattern as the streak/backdating tests.
const { readIndexSource, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function allChunks(){
  return [
    extractFunction(src, 'getTodayKey'),
    extractFunction(src, 'dateKeyMinusDays'),
    extractFunction(src, 'parseDateKey'),
    extractFunction(src, 'formatDate'),
    extractFunction(src, 'formatShortDate'),
    extractFunction(src, 'formatLogDateLabel'),
    extractFunction(src, 'fmtWeekLabel'),
    extractFunction(src, 'fmtMonthLabel'),
    extractFunction(src, 'fmtDayLabel'),
  ];
}

const { test, run } = makeRunner('test-date-label-formatters.js');

test('formatShortDate omits the year for a date in the current year', (assert)=>{
  const [label] = runSandbox(allChunks(), `
    __capture.push(formatShortDate(getTodayKey()));
  `);
  assert.ok(!/\d{4}/.test(label), `expected no 4-digit year in "${label}"`);
});

test('formatShortDate includes the year for a date in a different year', (assert)=>{
  const [label] = runSandbox(allChunks(), `__capture.push(formatShortDate('2020-03-15'));`);
  assert.strictEqual(label, 'Mar 15, 2020');
});

test('fmtWeekLabel formats a Monday-start range using the known 2026-06-29 Monday', (assert)=>{
  const [label] = runSandbox(allChunks(), `__capture.push(fmtWeekLabel('2026-06-29'));`);
  assert.strictEqual(label, 'Jun 29 – Jul 5');
});

test('fmtMonthLabel formats a YYYY-MM key as full month + year', (assert)=>{
  const [label] = runSandbox(allChunks(), `__capture.push(fmtMonthLabel('2026-07'));`);
  assert.strictEqual(label, 'July 2026');
});

test('fmtDayLabel formats a date as weekday, month, day', (assert)=>{
  const [label] = runSandbox(allChunks(), `__capture.push(fmtDayLabel('2026-07-01'));`);
  assert.strictEqual(label, 'Wed, Jul 1');
});

test('formatLogDateLabel: today -> "Today", yesterday -> "Yesterday"', (assert)=>{
  const [today, yesterday] = runSandbox(allChunks(), `
    var t = getTodayKey();
    __capture.push(formatLogDateLabel(t));
    __capture.push(formatLogDateLabel(dateKeyMinusDays(t, 1)));
  `);
  assert.strictEqual(today, 'Today');
  assert.strictEqual(yesterday, 'Yesterday');
});

test('formatLogDateLabel for any other date matches fmtDayLabel exactly (the duplication being removed)', (assert)=>{
  const [logLabel, dayLabel] = runSandbox(allChunks(), `
    __capture.push(formatLogDateLabel('2026-07-01'));
    __capture.push(fmtDayLabel('2026-07-01'));
  `);
  assert.strictEqual(logLabel, 'Wed, Jul 1');
  assert.strictEqual(logLabel, dayLabel, 'formatLogDateLabel\'s fallback and fmtDayLabel must stay in sync');
});

test('after consolidation: formatLogDateLabel delegates to fmtDayLabel instead of duplicating its toLocaleDateString call', (assert)=>{
  const logSrc = extractFunction(src, 'formatLogDateLabel');
  assert.ok(logSrc.includes('fmtDayLabel'), 'formatLogDateLabel must delegate to fmtDayLabel for its fallback case');
  assert.ok(!logSrc.includes('toLocaleDateString'), 'formatLogDateLabel must no longer call toLocaleDateString itself');
});

test('after consolidation: formatShortDate, fmtWeekLabel, and fmtDayLabel all route through the shared parseDateKey/formatDate helpers', (assert)=>{
  for(const name of ['formatShortDate', 'fmtWeekLabel', 'fmtDayLabel']){
    const fnSrc = extractFunction(src, name);
    assert.ok(fnSrc.includes('parseDateKey('), `${name} must parse its date key via the shared helper`);
    assert.ok(fnSrc.includes('formatDate('), `${name} must format via the shared helper`);
    // formatShortDate legitimately still calls `new Date()` with NO
    // arguments (today's date, for the year comparison) — that's not the
    // duplication being removed, only re-parsing a dateKEY string was.
    assert.ok(!fnSrc.includes("new Date(dateKey") && !fnSrc.includes("new Date(mondayStr") && !fnSrc.includes("new Date(dateStr"),
      `${name} must no longer construct a Date from a date-key string directly`);
  }
});

run();
