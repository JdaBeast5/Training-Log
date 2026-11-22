'use strict';
// v3.616 (UX-35): Keep In Mind follows the goal. Strength & Size's tips
// assumed a cut ("protects muscle in the deficit", "Non-negotiable for
// recomp", "your biggest fat-loss lever"); those three phrases are now
// placeholders that renderTips resolves from the profile's goal through
// TIP_GOAL_PHRASES. The advice is the same; the reason fits the goal.
//
// Real invocation: the real TIPS_BY_PROGRAM, TIP_COLORS, TIP_GOAL_PHRASES,
// applyTipGoal, getActiveTips and renderTips, over the real #tipsCard markup.
//
// Sabotage: drop the goal step from renderTips and the lean-bulk case fails
// (the placeholders show, and nothing says "build").
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-tips-goal.js');
const src = readIndexSource();

function render(goal, program = 'strength'){
  const { window } = runJsdom(extractElementById(src, 'tipsCard'), `
    var activeProgram = ${JSON.stringify(program)}, activeMartialArt = '', activeCyclingStyle = '', activeWatersportsStyle = '', activeMedicalStyle = '';
    var TIPS_BY_MARTIAL_ART = {}, TIPS_BY_CYCLING_STYLE = {}, TIPS_BY_WATERSPORTS_STYLE = {}, TIPS_BY_MEDICAL_STYLE = {};
    var targets = {pro: 170};
    var userProfile = ${goal === undefined ? 'undefined' : JSON.stringify({goal})};`,
    [extractConst(src, 'TIPS_BY_PROGRAM'), extractConst(src, 'TIP_COLORS'), extractConst(src, 'TIP_GOAL_PHRASES'),
     ...['applyTipGoal', 'getActiveTips', 'renderTips'].map(f => extractFunction(src, f)), 'renderTips();']);
  const doc = window.document;
  return [...doc.querySelectorAll('#tipsAlways .tip, #tipsMore .tip')].map(t => t.textContent.trim());
}

test('a lean bulk (and a gain) gets no cut wording: no "deficit", "recomp" or "fat-loss lever"; the reasons are about building', (assert)=>{
  for(const goal of ['leanbulk', 'gain']){
    const tips = render(goal).join('\n');
    assert.ok(tips.length > 0, 'anchor: tips rendered');
    assert.ok(!/deficit|recomp|fat-loss/i.test(tips), `${goal}: ${tips.match(/.*(deficit|recomp|fat-loss).*/i)}`);
    assert.match(tips, /Hit 170g before worrying about anything else — this is what turns your training into new muscle\./);
    assert.match(tips, /Non-negotiable while you build — this is when muscle actually rebuilds\./);
  }
  assert.match(render('leanbulk').join('\n'), /Keeps the bulk lean without costing you strength\./);
});

test('a cut keeps its words; a recomp names the recomp; maintain and performance read on their own terms', (assert)=>{
  const lose = render('lose').join('\n');
  assert.match(lose, /this is what protects muscle in the deficit\./);
  assert.match(lose, /Non-negotiable in a deficit — /);
  assert.match(lose, /Your biggest fat-loss lever that doesn't cost you strength\./);
  const recomp = render('recomp').join('\n');
  assert.match(recomp, /lets you build muscle while you lose fat/);
  assert.match(recomp, /Non-negotiable for a recomp — /);
  const maintain = render('maintain').join('\n');
  assert.match(maintain, /Non-negotiable — this is when muscle actually rebuilds\./, 'no dangling space when there is no phase');
  assert.ok(!/deficit|recomp|fat-loss/i.test(maintain));
  assert.ok(!/deficit|recomp|fat-loss/i.test(render('performance').join('\n')));
});

test('no placeholder ever reaches the screen: every goal (and none), every program\'s tips', (assert)=>{
  const programs = Object.keys(require('vm').runInNewContext(extractConst(src, 'TIPS_BY_PROGRAM').replace(/^const TIPS_BY_PROGRAM\s*=\s*/, '(') .replace(/;\s*$/, ')')));
  assert.ok(programs.length > 10, 'anchor: the real program list (' + programs.length + ')');
  for(const goal of ['lose', 'gain', 'leanbulk', 'recomp', 'maintain', 'performance', undefined, 'unknown']){
    for(const p of programs){
      const tips = render(goal, p).join('\n');
      assert.ok(!/__[A-Z_]+__/.test(tips), `${p} / ${goal}: ${tips.match(/__[A-Z_]+__/)}`);
    }
  }
});

test('the advice is unchanged: only Strength & Size\'s three phrases moved, and every goal has all three', (assert)=>{
  const decl = extractConst(src, 'TIPS_BY_PROGRAM');
  assert.strictEqual((decl.match(/__GOAL_[A-Z]+__/g) || []).length, 3, 'three placeholders, all in Strength & Size');
  const phrases = require('vm').runInNewContext('(' + extractConst(src, 'TIP_GOAL_PHRASES').replace(/^const TIP_GOAL_PHRASES\s*=\s*/, '').replace(/;\s*$/, '') + ')');
  for(const goal of ['lose', 'gain', 'leanbulk', 'recomp', 'maintain', 'performance']){
    assert.ok(phrases[goal] && phrases[goal].protein && 'sleep' in phrases[goal] && phrases[goal].steps, goal + ': all three phrases');
  }
});

run();
