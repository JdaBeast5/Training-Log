'use strict';
// Items flagged in earlier handoffs, fixed on the owner's request ("Fix both
// flagged items, the Olympic lift program and the left over symbols").
//
// v3.372 — Olympic Lifting, Front Squat (Clean Recovery Strength): the
// coaching insight read backwards ("if you can clean more than you can front
// squat, the pull's momentum is masking a strength gap"). The rule coaches
// use is the other way round: the front squat should clearly out-lift the
// clean, and when the two are close, standing up from the catch is the limiter.
// v3.373 — The food favourite star updated its look on tap but not
// aria-pressed or its "Add … to favourites" label, so VoiceOver kept reading
// the old state.
const { readIndexSource, extractConst, extractFunction, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

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

test('REAL invocation (v3.373): tapping the favourite star flips aria-pressed and its label, both ways', async (assert)=>{
  const { window } = runJsdom('', '', [extractFunction(src, 'escapeHtml'), extractFunction(src, 'buildFoodItemBtn'), `
    let activeCat = 'Proteins';
    const favs = new Set();
    const isFavorited = n => favs.has(n);
    const toggleFavorite = async item => { favs.has(item.name) ? favs.delete(item.name) : favs.add(item.name); };
    const itemViolatesPreferences = () => null;
    const addFoodToLog = () => {}; const duplicateToCustomForm = () => {}; const removeFromCustomFoods = async () => {}; const renderFoodItems = () => {};
    document.body.append(buildFoodItemBtn({name:'Chicken Breast', cal:165, pro:31, fat:4, carb:0, category:'Proteins'}, false));
  `]);
  const star = window.document.querySelector('.fi-fav');
  assert.strictEqual(star.getAttribute('aria-pressed'), 'false', 'anchor: starts unsaved');
  star.click(); await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(star.getAttribute('aria-pressed'), 'true');
  assert.strictEqual(star.getAttribute('aria-label'), 'Remove Chicken Breast from favourites');
  star.click(); await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(star.getAttribute('aria-pressed'), 'false');
  assert.strictEqual(star.getAttribute('aria-label'), 'Add Chicken Breast to favourites');
});

run();
