'use strict';
// Behavioral coverage for a bug found during a dedicated Analysis audit:
// buildProgressBadge has an explicit override for the INCREASE signal when
// inDeloadWeek is true (swaps in "sets are already reduced below; hold at a
// reduced load" instead of a weight-bump suggestion), but the automatic
// DELOAD signal from analyzeProgressionSignal (RPE 9+ for 3 straight
// sessions with no progress) had no equivalent check — if that signal fired
// during a week that was already a scheduled or manually-toggled deload
// week, it showed its normal "a 10-20% deload this week likely does more
// for growth than pushing through" message as if recommending something
// new, rather than acknowledging the two already agree.
//
// REAL invocation of the actual buildProgressBadge function against jsdom-
// free plain assertions (this function returns a plain {direction, html}
// object, no DOM needed) — not a re-implementation of its branching logic.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-deload-signal-week-awareness.js');

const chunks = [
  extractConst(src, 'DELOAD_CYCLE_WEEKS'),
  extractConst(src, 'RPE_BY_CYCLE_WEEK'),
  `var loadSuggestionMode = 'progression'; var weightUnit = 'lb';
   function fmtWeight(v){ return v + ' lb'; }`,
  extractFunction(src, 'buildProgressBadge'),
];

const DELOAD_SIGNAL = {
  type: 'deload',
  message: '🔻 RPE has run 9+ for 3 straight sessions with no rep or weight gain — a 10-20% deload this week likely does more for growth than pushing through (sustained near-max effort without progress signals fatigue outpacing recovery).',
};
const INCREASE_SIGNAL = {type: 'increase', message: '⬆ Hit 8+ reps at 185 lb for 2 sessions straight — add 5 lb next time.'};

function buildBadge(signal, inDeloadWeek){
  const [result] = runSandbox(chunks, `
    __capture.push(buildProgressBadge({
      ex: {name:'Bench Press', sets:'3x6-8'}, signal: ${JSON.stringify(signal)},
      inDeloadWeek: ${inDeloadWeek}, priorTop: {weight:185, reps:8}, topRep: 8,
      rpeCtx: null, sourceNote: '',
    }));
  `);
  return result;
}

test('REAL invocation: the automatic deload signal during an ACTIVE deload week acknowledges the overlap instead of repeating the recommendation', (assert)=>{
  const badge = buildBadge(DELOAD_SIGNAL, true);
  assert.match(badge.html, /already reduced below/, 'must acknowledge sets are already reduced, matching the increase override\'s own phrasing');
  assert.match(badge.html, /Good timing|backs it up|agrees/i, 'must read as an acknowledgment, not a fresh recommendation');
  assert.doesNotMatch(badge.html, /a 10-20% deload this week likely does more for growth than pushing through/, 'the original as-if-new recommendation text must not appear verbatim once a deload is already active');
  assert.strictEqual(badge.direction, 'down');
});

test('regression guard: the SAME deload signal OUTSIDE a deload week still shows its normal, unmodified recommendation', (assert)=>{
  const badge = buildBadge(DELOAD_SIGNAL, false);
  assert.match(badge.html, /a 10-20% deload this week likely does more for growth than pushing through/, 'outside an active deload week, the real original message must be shown completely unchanged');
  assert.doesNotMatch(badge.html, /already reduced below/, 'must not falsely claim sets are already reduced when no deload week is active');
});

test('regression guard: the pre-existing increase-signal deload-week override is completely unaffected by this fix', (assert)=>{
  const badge = buildBadge(INCREASE_SIGNAL, true);
  assert.match(badge.html, /hold at a reduced load here too rather than chasing the jump this would normally suggest/, 'the original increase-signal override message must be byte-identical to before this fix');
});

test('regression guard: an increase signal OUTSIDE a deload week is also completely unaffected', (assert)=>{
  const badge = buildBadge(INCREASE_SIGNAL, false);
  assert.match(badge.html, /Hit 8\+ reps at 185 lb for 2 sessions straight/, 'a normal increase signal must render its own message unchanged');
  assert.strictEqual(badge.direction, 'up');
});

run();
