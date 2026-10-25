'use strict';
// v3.271 (tasteskill Today pilot): the Training Style card and its sport/
// medical siblings moved from ABOVE the day rail to BELOW the workout card.
// Today is opened to answer "what's next in today's session?"; with those
// set-once pickers on top, a returning user's workout card started ~1050px
// down a 844px-tall phone (measured in Chromium on a seeded profile: workout
// card 1052px -> 569px after the move).
//
// What must hold, checked on the real #todayView markup lifted from
// index.html and the real positionProfileCard():
//  - the day rail and workout card come before every program picker;
//  - the deliberate first-run interrupts that were above the workout stay
//    above it (onboarding, Today's Priorities, the unfinished-profile slot,
//    the program recommendation banner) — this move is not allowed to bury
//    them;
//  - every moved card is still a DIRECT child of #todayView, because gym
//    mode hides "#todayView > .card:not(#workoutCard)" and would otherwise
//    start showing the pickers mid-workout;
//  - nothing was lost or duplicated in the move.
const { JSDOM } = require('jsdom');
const { readIndexSource, extractElementById, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-session-first.js');
const src = readIndexSource();
const todayHtml = extractElementById(src, 'todayView');

const MOVED_IDS = ['martialArtCard', 'cyclingCard', 'watersportsCard', 'yogaCard', 'medicalCard'];
const ABOVE_IDS = ['onboardingCard', 'todayInsightsCard', 'profileCardTopSlot', 'programRecommendation'];

function freshToday(){
  const { document } = new JSDOM(`<!DOCTYPE html><body>${todayHtml}</body>`).window;
  return document;
}
function precedes(a, b){
  // DOCUMENT_POSITION_FOLLOWING (4): b comes after a.
  return !!(a.compareDocumentPosition(b) & 4);
}
function styleCard(document){
  const header = document.getElementById('programHeader');
  return header && header.closest('.card');
}

test('sabotage anchor: each id this test relies on exists exactly once in the real Today markup', (assert)=>{
  const document = freshToday();
  for(const id of ['tabs', 'workoutCard', 'programHeader', ...MOVED_IDS, ...ABOVE_IDS]){
    assert.strictEqual(document.querySelectorAll(`#${id}`).length, 1, `#${id} must exist once inside #todayView`);
  }
});

test('REAL markup: the day rail and the workout card come before the Training Style card and every sport/medical picker', (assert)=>{
  const document = freshToday();
  const tabs = document.getElementById('tabs');
  const workout = document.getElementById('workoutCard');
  const pickers = [styleCard(document), ...MOVED_IDS.map(id => document.getElementById(id))];
  for(const picker of pickers){
    assert.ok(precedes(tabs, picker), `#tabs must come before ${picker.id || 'the Training Style card'}`);
    assert.ok(precedes(workout, picker), `#workoutCard must come before ${picker.id || 'the Training Style card'}`);
  }
});

test('GUARD: the deliberate interrupts still sit above the day rail — onboarding, Today\'s Priorities, the unfinished-profile slot and the recommendation banner', (assert)=>{
  const document = freshToday();
  const tabs = document.getElementById('tabs');
  for(const id of ABOVE_IDS){
    assert.ok(precedes(document.getElementById(id), tabs), `#${id} must stay above the day rail`);
  }
});

test('REAL selector: every moved card is still a direct child of #todayView, so gym mode\'s "#todayView > .card:not(#workoutCard)" hide rule still covers it', (assert)=>{
  const document = freshToday();
  const hidden = new Set(document.querySelectorAll('#todayView > .card:not(#workoutCard)'));
  for(const card of [styleCard(document), ...MOVED_IDS.map(id => document.getElementById(id))]){
    assert.ok(hidden.has(card), `${card.id || 'the Training Style card'} must be matched by gym mode's hide selector`);
  }
});

test('REAL markup: the moved pickers sit between the workout card and Keep In Mind, in their original relative order', (assert)=>{
  const document = freshToday();
  const children = [...document.getElementById('todayView').children];
  const idx = el => children.indexOf(el);
  const order = [document.getElementById('workoutCard'), styleCard(document), ...MOVED_IDS.map(id => document.getElementById(id))].map(idx);
  for(let i = 1; i < order.length; i++){
    assert.strictEqual(order[i], order[i - 1] + 1, 'the Training Style card and its siblings must follow the workout card directly, in their old order');
  }
  const keepInMind = children.find(c => /Keep In Mind/.test((c.querySelector('.card-title') || {}).textContent || ''));
  assert.ok(keepInMind && idx(keepInMind) === order[order.length - 1] + 1, 'Keep In Mind must directly follow the last moved picker');
});

test('REAL invocation: positionProfileCard() still puts an UNFINISHED profile above the workout after the move', (assert)=>{
  const profileHtml = extractElementById(src, 'profileCard');
  const { window, document } = runJsdom(
    todayHtml.replace('<div id="profileCardPermanentSlot"></div>', '<div id="profileCardPermanentSlot"></div>' + profileHtml),
    'var userProfile = { name: "" };',
    [extractFunction(src, 'positionProfileCard'), 'positionProfileCard();']
  );
  assert.ok(!window.__err, window.__err);
  const card = document.getElementById('profileCard');
  assert.ok(precedes(card, document.getElementById('workoutCard')), 'an unfinished profile card must land above the workout card');
  assert.strictEqual(card.previousElementSibling.id, 'profileCardTopSlot');
});

// v3.282: inside the workout card, the lifts come before the occasional
// extras. Measured in Chromium on the seeded returning user: first exercise
// 1613px (pre-rollout) -> 1130px (v3.271) -> 924px. The adapt panel still opens
// and gym mode still hides the moved items (their rules are id-based).
test('REAL markup (v3.282): Gym mode, today\'s standout and the voice tip stay above the exercise list; Adapt and the day insight follow it', (assert)=>{
  const document = freshToday();
  const list = document.getElementById('exerciseList');
  // v3.300 (owner request): the plate calculator and voice set logging were removed with the set chips. The voice tip (#voiceHintBanner) went with it.
  for(const id of ['gymEnterBtn', 'todayStandoutBanner']){
    assert.ok(precedes(document.getElementById(id), list), `#${id} must stay above the exercise list`);
  }
  for(const id of ['adaptWorkoutBtn', 'adaptWorkoutPanel', 'dayInsight']){
    const el = document.getElementById(id);
    assert.ok(precedes(list, el), `#${id} must come after the exercise list`);
    assert.ok(el.closest('#workoutCard'), `#${id} must stay inside the workout card (gym mode hides it via #workoutCard)`);
  }
  assert.strictEqual(document.getElementById('adaptWorkoutBtn').nextElementSibling.id, 'adaptWorkoutPanel', 'the panel still follows its toggle');
  assert.ok(precedes(document.getElementById('customExerciseForm'), document.getElementById('adaptWorkoutBtn')), 'add-custom stays attached to the list it extends');
});

run();
