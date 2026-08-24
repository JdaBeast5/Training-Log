'use strict';
// Behavioral coverage for a real bug found during a live click-through QA
// pass: the post-set "Switch to gym mode?" offer (#gymOffer) is a
// position:fixed card with no view scoping of its own — nothing hid it when
// you navigated away from Today before answering it, so it kept rendering
// on top of unrelated content on Log/Analysis/History (confirmed live:
// covering the Sleep card on Log, sitting inside the calendar grid on
// History). This is the exact same class of bug switchView() already
// guards against for .sticky-day-header (see that element's own comment:
// "a hard guarantee it never lingers into another tab") — fixed the same
// way, by calling hideGymOffer() from the identical `if(active !== 'today')`
// branch, rather than inventing a new mechanism.
//
// Deliberately does NOT touch #restTimer — that element is allowed, by
// design, to follow you across tabs (its own comments explain why: "Leaving
// gym mode to check a number in Analysis mid-workout is a normal thing to
// do"). Only the modal-like Yes/No offer card is in scope here.
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-gym-offer-tab-leak.js');

const VIEW_IDS = ['todayView', 'logView', 'analysisView', 'historyView', 'careView', 'coachView', 'learnView'];
const PILL_IDS = ['navToday', 'navLog', 'navAnalysis', 'navHistory', 'navCare', 'navCoach', 'navLearn', 'navMore'];

function buildBodyHtml(){
  const views = VIEW_IDS.map(id => `<div id="${id}"></div>`).join('\n');
  const pills = PILL_IDS.map(id => `<button id="${id}"></button>`).join('\n');
  return `
    ${views}
    ${pills}
    <div id="stickyDayHeader" class="visible"></div>
    <div id="logDateBar"></div>
    <div class="gym-offer" id="gymOffer"></div>
  `;
}

function setup(){
  const switchViewSrc = extractFunction(src, 'switchView');
  const hideGymOfferSrc = extractFunction(src, 'hideGymOffer');
  const globals = [
    "const MOVED_TO_MORE = ['care', 'coach', 'learn'];",
    'const STAGGER_MAX_STEPS = 4;',
    'const STAGGER_STEP_MS = 28;',
    'function renderLogDateBar(){}',
  ].join('\n');
  const { document } = runJsdom(buildBodyHtml(), globals, [hideGymOfferSrc, switchViewSrc]);
  return document;
}

test('REAL invocation: navigating away from Today (switchView("log")) hides an active gym-mode offer', (assert)=>{
  const document = setup();
  const offer = document.getElementById('gymOffer');
  offer.classList.add('active');

  document.defaultView.switchView('log');

  assert.ok(!offer.classList.contains('active'), 'the "Switch to gym mode?" offer must be dismissed once you navigate to another tab — it must not linger on top of Log');
});

test('REAL invocation: same fix applies switching to Analysis and History, not just Log', (assert)=>{
  for(const dest of ['analysis', 'history']){
    const document = setup();
    const offer = document.getElementById('gymOffer');
    offer.classList.add('active');

    document.defaultView.switchView(dest);

    assert.ok(!offer.classList.contains('active'), `the offer must also be dismissed when switching to "${dest}", not just "log"`);
  }
});

test('sabotage-relevant: switching TO Today does NOT force-close the offer — only leaving Today does', (assert)=>{
  const document = setup();
  const offer = document.getElementById('gymOffer');
  offer.classList.add('active');

  // Land on 'today' itself — a naive unconditional hideGymOffer() call
  // (rather than one gated on `active !== 'today'`) would wrongly clear
  // this too, hiding an offer that just appeared on the tab you're ON.
  document.defaultView.switchView('today');

  assert.ok(offer.classList.contains('active'), 'the offer must still be showing after switching TO today — only navigating AWAY should dismiss it');
});

test('regression guard: an already-inactive offer is a no-op, not an error, when switching tabs', (assert)=>{
  const document = setup();
  const offer = document.getElementById('gymOffer');
  // offer starts without .active — nothing to hide

  assert.doesNotThrow(()=> document.defaultView.switchView('history'), 'switchView must not throw when there is no offer currently showing');
  assert.ok(!offer.classList.contains('active'), 'still correctly not-active afterward');
});

run();
