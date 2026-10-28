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

// v3.466 — Plain rows. Each hit was a boxed tile, the name wrapping beside an
// 11px source column ("Calisthenics & Bodyweight Fundamentals"). Now the
// name, then where it lives underneath, then a chevron; a hairline under
// each, as Learn's lists (v3.459).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
test('REAL invocation (v3.466): a hit is name over source, with the chevron on its own', (assert)=>{
  const doc = search('squat', { sections: [{id:'squatCard', title:'Squat Progress', tabLabel:'Analysis'}],
    techniques: [{name:'Pistol Squat Progression', cardId:'calCard', masterclassLabel:'Calisthenics & Bodyweight Fundamentals'}] });
  for(const hit of doc.querySelectorAll('.gsearch-hit')){
    const text = hit.querySelector('.gsearch-hit-text');
    assert.strictEqual(text.children.length, 2);
    assert.ok(text.children[1].classList.contains('gsearch-hit-tab'));
    assert.strictEqual(hit.querySelector('.gsearch-hit-tab svg'), null, 'the chevron is not inside the source label');
    assert.strictEqual(hit.querySelector('.gsearch-hit-chev').getAttribute('aria-hidden'), 'true');
  }
  assert.strictEqual(doc.querySelector('[data-jump-to] .gsearch-hit-tab').textContent, 'Analysis');
  assert.strictEqual(doc.querySelector('[data-technique-card] .gsearch-hit-text > span').textContent, 'Pistol Squat Progression');
});

test('REAL CSSOM (v3.466): no box, a hairline under each row, a 15px name and a readable source', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><button class="gsearch-hit" id="h"><span class="gsearch-hit-text"><span>x</span><span class="gsearch-hit-tab" id="t">y</span></span></button>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('h').backgroundColor, 'rgba(0, 0, 0, 0)');
  assert.strictEqual(cs('h').borderTopStyle, 'none');
  assert.strictEqual(cs('h').paddingLeft, '0px');
  assert.strictEqual(cs('h').fontSize, '15px');
  assert.strictEqual(cs('h').minHeight, '52px');
  assert.strictEqual(cs('t').fontSize, '12.5px');
  assert.match(CSS, /\.gsearch-hit\{[^}]*border:none; border-bottom:1px solid var\(--line-soft\);/);
});

run();
