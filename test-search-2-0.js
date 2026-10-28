'use strict';
// Global search 2.0 (owner: "Let's do them all", after a review). One
// increment per version.
//
// v3.465 — Exercises before techniques. Searching "squat" listed nine
// masterclass techniques ("Jerk Dip Squat", "Squat: Bracing & Setup") before
// Back Squat. An exercise is what a search almost always means; sections
// ("Go to") still lead, since those are the app's own places.
const { makeRunner, readIndexSource, extractFunction, extractConst, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-search-2-0.js');
const src = readIndexSource();

function search(q, { sections = [], techniques = [] } = {}){
  const { window } = runJsdom('<div id="globalSearchResults"></div>', `
    window.collectSearchSections = () => ${JSON.stringify(sections)};
    window.exerciseInfo = { 'Back Squat': {category:'squat'}, 'Front Squat': {category:'squat'}, 'Bench Press': {category:'push'} };
    window.MUSCLE_GROUP_MAP = { squat:'Legs', push:'Chest & Shoulders' };
    window.buildMasterclassTechniqueSearchIndex = () => ${JSON.stringify(techniques)};
    window.buildExerciseSearchResultHtml = n => '<details class="ex-details" data-ex="' + n + '"><summary>' + n + '</summary></details>';`,
    [extractConst(src, 'GLOBAL_SEARCH_SECTION_LIMIT'), extractConst(src, 'GLOBAL_SEARCH_EXERCISE_LIMIT'), extractConst(src, 'GLOBAL_SEARCH_TECHNIQUE_LIMIT'),
     extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractFunction(src, 'renderGlobalSearchResults'),
     `renderGlobalSearchResults(${JSON.stringify(q)});`]);
  return window.document;
}
const groups = doc => [...doc.querySelectorAll('.gsearch-group')].map(g => g.textContent);

test('REAL invocation (v3.465): Go to, then Exercises, then Techniques', (assert)=>{
  const doc = search('squat', {
    sections: [{id:'squatCard', title:'Squat Progress', tabLabel:'Analysis'}],
    techniques: [{name:'Jerk Dip Squat', cardId:'olyTechniquesCard', masterclassLabel:'Olympic Lifting Technique'}],
  });
  assert.deepStrictEqual(groups(doc), ['Go to', 'Exercises', 'Techniques']);
  const all = [...doc.getElementById('globalSearchResults').children];
  const firstEx = all.findIndex(e => e.matches('details.ex-details'));
  const firstTech = all.findIndex(e => e.matches('[data-technique-card]'));
  assert.ok(firstEx > -1 && firstTech > firstEx, 'Back Squat comes before Jerk Dip Squat');
  assert.deepStrictEqual([...doc.querySelectorAll('details.ex-details')].map(d => d.dataset.ex), ['Back Squat', 'Front Squat'], 'name matches, as ranked before');
});

test('REAL invocation (v3.465): with no exercise match, techniques still show', (assert)=>{
  const doc = search('eskimo', { techniques: [{name:'Eskimo Roll', cardId:'watersportsTechniquesCard', masterclassLabel:'Watersports Techniques'}] });
  assert.deepStrictEqual(groups(doc), ['Techniques']);
});

run();
