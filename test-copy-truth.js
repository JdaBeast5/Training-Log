'use strict';
// v3.568 (BL-12, audit H-4 copy, L-2, L-1 for in-app tips): copy that matches
// the code. The Bodybuilding overview no longer says every muscle is trained
// twice a week (the split trains most once); the bodybuilding deload tip
// matches the 5-week engine; the sleep tip drops the unsupported growth-
// hormone claim; the bodybuilding insight drops "slow the eccentric for more
// growth" (0.5-8 s reps grow similarly [DUR15]).
//
// Real reads: the extracted programs, TIPS_BY_PROGRAM and
// DEFAULT_INSIGHTS_BY_PROGRAM; a real renderDayInsight render into #dayInsight.
//
// Criterion 3 is pinned to the strings' containers plus whole-file counts:
// two other occurrences are out of scope and stay (flagged in the PR): the
// cycling FTP tip "Retest every 6-8 weeks" (a different, correct claim) and the
// Care sleep card's "Growth hormone and muscle protein synthesis peak in deep
// sleep" (static markup, not an in-app tip in this item's list).
//
// Sabotage: restore the old bodybuilding deload tip and criteria 1 and 3 fail.
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractConst, extractFunction, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-copy-truth.js');

const OVERVIEW = 'Most muscles get one hard session a week plus indirect work; pick Strength & Size if you want each muscle twice.';
const DELOAD = 'Deload every 4–6 weeks (the app schedules every 5th)';
const SLEEP = 'Sleep 7–9 hrs:</b> short sleep lowers training performance and recovery.';
const INSIGHT = 'Rep speed from about 0.5-8 s grows muscle similarly; control the weight and take sets close to failure.';

test('criterion 1: the real overview, tips and insight carry the new text exactly', (assert)=>{
  const [r] = runSandbox([extractConst(src, 'programs'), extractConst(src, 'TIPS_BY_PROGRAM'), extractConst(src, 'DEFAULT_INSIGHTS_BY_PROGRAM')],
    `__capture.push({ov: programs.bodybuilding.overview, tips: TIPS_BY_PROGRAM.bodybuilding.join('\\n'), ins: DEFAULT_INSIGHTS_BY_PROGRAM.bodybuilding});`);
  assert.ok(r.ov.includes(OVERVIEW), r.ov);
  assert.ok(r.tips.includes(DELOAD), 'deload tip');
  assert.ok(r.tips.includes(SLEEP), 'sleep tip');
  assert.ok(r.ins.includes(INSIGHT) && r.ins.startsWith('<b>Hypertrophy insight:</b> Muscle responds to mechanical tension'), 'insight keeps its first sentence');
  assert.ok(!/twice a week|6-8 weeks|Growth hormone|eccentric/i.test(r.ov + r.tips + r.ins), 'none of the old claims in these containers');
});

test('criterion 2: the real renderDayInsight on a bodybuilding day with no matching rule renders the new insight', (assert)=>{
  const { window } = runJsdom('<div id="dayInsight"></div>', `var activeProgram = 'bodybuilding';`,
    [extractConst(src, 'DAY_INSIGHT_RULES'), extractConst(src, 'DEFAULT_INSIGHTS_BY_PROGRAM'), extractFunction(src, 'renderDayInsight'),
     `window.__rules = DAY_INSIGHT_RULES.filter(r => r.pattern.test('Zzz Unmatched Day')).length; renderDayInsight({sub: 'Zzz Unmatched Day'});`]);
  assert.strictEqual(window.__rules, 0, 'anchor: no rule matches');
  const t = window.document.getElementById('dayInsight').textContent;
  assert.ok(t.includes(INSIGHT), t);
  assert.ok(!/slow the eccentric/i.test(t));
});

test('criterion 3: the old strings are gone outside comments; the only other matches are the two out-of-scope ones', (assert)=>{
  const code = html.split('\n').map(l => l.replace(/^\s*\/\/.*$/, '').replace(/<!--[\s\S]*?-->/g, '')).join('\n');
  const count = (re) => (code.match(re) || []).length;
  assert.strictEqual(count(/Every muscle is trained at least twice/g), 0);
  const sixEight = code.split('\n').filter(l => /6-8 weeks/.test(l));
  assert.strictEqual(sixEight.length, 1, sixEight.join('\n'));
  assert.ok(/FTP/.test(sixEight[0]), 'the one left is the cycling FTP retest tip');
  const gh = code.split('\n').filter(l => /Growth hormone/.test(l));
  assert.strictEqual(gh.length, 1, gh.join('\n'));
  assert.ok(/<li>Growth hormone and muscle protein synthesis/.test(gh[0]), 'the one left is the Care sleep card (flagged)');
});

run();
