'use strict';
// Behavioral coverage for the Learn tab's top-level card ORDER — pure DOM
// reordering, Tier 2 (small, verifiable increment on an established view).
//
// "All Masterclasses" (the #masterclassIndex browse-everything card) used to
// render FIRST in #learnView, ahead of Exercise Library, Recently Trained,
// and every program-specific masterclass card. That buried what's actually
// relevant to the person opening Learn (their own program's masterclass,
// what they've logged lately, a quick exercise search) below a full index of
// content most of which isn't theirs. This moves the "All Masterclasses"
// card to the END of #learnView instead — last card, not first — while every
// other card (Exercise Library, Recently Trained, and all program-specific
// masterclass cards, in their existing relative order) is left untouched.
//
// No JS is exercised here — toggleMasterclass/renderMasterclassIndex/etc all
// look up cards by getElementById (verified while making this change; none
// of them read sibling/child-index position), so this is a pure markup
// structure test: extract the real #learnView subtree and assert on the
// real resulting DOM order, not on line numbers or text position in the
// source string.
const { readIndexSource, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const learnViewHtml = extractElementById(src, 'learnView');

// Every top-level card in #learnView, identified either by its own id (the
// program-specific masterclass cards, recentlyTrainedCard) or, for the two
// cards with no id of their own, by a stable id it's known to contain.
// Building this list by walking the REAL parsed DOM (not string-searching
// the source) means a card that's missing, duplicated, or nested wrong gets
// caught here rather than producing a false pass.
function cardOrder(document){
  const cards = [...document.querySelectorAll('#learnView > .card')];
  return cards.map(card=>{
    if(card.id) return card.id;
    if(card.querySelector('#exerciseSearchInput')) return 'exerciseLibrary';
    if(card.querySelector('#masterclassIndex')) return 'allMasterclasses';
    throw new Error('cardOrder: unidentified top-level card in #learnView — ' + card.outerHTML.slice(0, 80));
  });
}

const { test, run } = makeRunner('test-learn-tab-card-order.js');

test('sabotage-relevant: #learnView really has 17 top-level cards — not a truncated extraction quietly passing on a partial fixture', (assert)=>{
  const { document } = runJsdom(learnViewHtml, '', []);
  assert.strictEqual(document.querySelectorAll('#learnView > .card').length, 17);
});

test('REAL invocation: Exercise Library, Recently Trained, and every program-specific masterclass card render in their established relative order, with All Masterclasses moved to the END', (assert)=>{
  const { document } = runJsdom(learnViewHtml, '', []);
  assert.deepStrictEqual(cardOrder(document), [
    'exerciseLibrary',
    'recentlyTrainedCard',
    'strengthTechniquesCard',
    'runningTechniquesCard',
    'hyroxTechniquesCard',
    'pilatesTechniquesCard',
    'yogaTechniquesCard',
    'calisthenicsTechniquesCard',
    'cyclingTechniquesCard',
    'posingCard',
    'swimStylesCard',
    'climbTechniquesCard',
    'watersportsTechniquesCard',
    'combatTechniquesCard',
    'grappleTechniquesCard',
    'olyTechniquesCard',
    'allMasterclasses',
  ]);
});

test('All Masterclasses is the LAST card, after every program-specific masterclass card, Exercise Library, and Recently Trained', (assert)=>{
  const { document } = runJsdom(learnViewHtml, '', []);
  const order = cardOrder(document);
  const allMasterclassesIdx = order.indexOf('allMasterclasses');
  assert.strictEqual(allMasterclassesIdx, order.length - 1, 'All Masterclasses must be the last card, not merely somewhere below the others');
  assert.strictEqual(allMasterclassesIdx > order.indexOf('exerciseLibrary'), true);
  assert.strictEqual(allMasterclassesIdx > order.indexOf('recentlyTrainedCard'), true);
  // Every program-specific masterclass card (the ones keyed off PROGRAM_MASTERCLASS
  // in index.html) — a person's own program's card is always one of these, so
  // this covers "whichever masterclass matches the active program" without
  // needing to simulate a specific active program here.
  ['strengthTechniquesCard','runningTechniquesCard','hyroxTechniquesCard','pilatesTechniquesCard',
   'yogaTechniquesCard','calisthenicsTechniquesCard','cyclingTechniquesCard','posingCard',
   'swimStylesCard','climbTechniquesCard','watersportsTechniquesCard','combatTechniquesCard',
   'grappleTechniquesCard','olyTechniquesCard'].forEach(id=>{
    assert.strictEqual(allMasterclassesIdx > order.indexOf(id), true, `All Masterclasses must render after ${id}`);
  });
});

test('sabotage-relevant: each card kept its own content across the move — this was a pure reorder, not a rewrite', (assert)=>{
  const { document } = runJsdom(learnViewHtml, '', []);
  const allMasterclassesCard = document.getElementById('learnView').querySelector('.card:has(#masterclassIndex)');
  assert.ok(allMasterclassesCard.textContent.includes('All Masterclasses'));
  assert.ok(allMasterclassesCard.textContent.includes("Every discipline's deep-dive"));
  const exerciseLibraryCard = document.getElementById('learnView').querySelector('.card:has(#exerciseSearchInput)');
  assert.ok(exerciseLibraryCard.textContent.includes('Exercise Library'));
  assert.ok(exerciseLibraryCard.querySelector('#exerciseSearchResults'));
});

run();
