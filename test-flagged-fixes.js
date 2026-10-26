'use strict';
// Items flagged in earlier handoffs, fixed on the owner's request ("Fix both
// flagged items, the Olympic lift program and the left over symbols").
//
// v3.372 — Olympic Lifting, Front Squat (Clean Recovery Strength): the
// coaching insight read backwards ("if you can clean more than you can front
// squat, the pull's momentum is masking a strength gap"). The rule coaches
// use is the other way round: the front squat should clearly out-lift the
// clean, and when the two are close, standing up from the catch is the limiter.
const { readIndexSource, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-flagged-fixes.js');

test('REAL content (v3.372): the oly Front Squat insight says the front squat should out-lift the clean', (assert)=>{
  const [points] = runSandbox([extractConst(src, 'OLY_TECHNIQUE_DETAILS')], `__capture.push(OLY_TECHNIQUE_DETAILS['Front Squat (Clean Recovery Strength)'].points);`);
  assert.strictEqual(points.length, 5, 'anchor: the real technique, five points');
  const insight = points.find(p => /^Coaching insight:/.test(p));
  assert.match(insight, /front squat should clearly out-lift your clean/);
  assert.match(insight, /standing up from the catch is what limits your clean/);
  assert.doesNotMatch(src, /masking a strength gap/, 'the backwards wording is gone everywhere');
});

run();
