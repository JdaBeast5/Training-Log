'use strict';
// Behavioral coverage for the Coach tab card reorder: "Ask Your Coach"
// (chat) is reachable from a floating button on every tab, sharing the
// same coachChatHistory — so it's the one card on this tab that ISN'T
// exclusive to it. "Get Form Feedback" and "Past Reviews" are, and now
// come first. No JS anywhere depends on these cards' DOM order (confirmed
// by reading renderCoach/renderCoachChatLog — both use getElementById
// exclusively), so this is a light structural regression guard: cheap
// insurance against an accidental revert, not proof of complex behavior.
const { readIndexSource, extractElementById, makeRunner } = require('./testHelpers.js');
const assert = require('assert');

const src = readIndexSource();
const coachViewHtml = extractElementById(src, 'coachView');

const { test, run } = makeRunner('test-coach-tab-order.js');

test('Get Form Feedback and Past Reviews both appear BEFORE Ask Your Coach in the real markup', (assert)=>{
  const formFeedbackIdx = coachViewHtml.indexOf('Get Form Feedback');
  const pastReviewsIdx = coachViewHtml.indexOf('Past Reviews');
  const askCoachIdx = coachViewHtml.indexOf('Ask Your Coach');
  assert.ok(formFeedbackIdx !== -1 && pastReviewsIdx !== -1 && askCoachIdx !== -1, 'all three headings must be present');
  assert.ok(formFeedbackIdx < askCoachIdx, 'Get Form Feedback must come before Ask Your Coach');
  assert.ok(pastReviewsIdx < askCoachIdx, 'Past Reviews must come before Ask Your Coach');
});

test('the disclaimer card is still first, ahead of everything else', (assert)=>{
  const disclaimerIdx = coachViewHtml.indexOf('care-disclaimer-card');
  const formFeedbackIdx = coachViewHtml.indexOf('Get Form Feedback');
  assert.ok(disclaimerIdx !== -1 && disclaimerIdx < formFeedbackIdx, 'the API-key disclaimer must stay first');
});

test('sabotage-anchor: exactly 5 top-level cards exist in #coachView — the reorder must not have dropped or duplicated one', (assert)=>{
  // Matches `class="card"` or `class="card <more classes>"` exactly — NOT
  // `class="card-title"`/`class="card-icon"`, which a looser
  // `class="card` prefix match would also catch (confirmed: it did, on
  // the first run of this test, counting 7 instead of 4).
  const cardCount = (coachViewHtml.match(/<div class="card(?:"| )/g) || []).length;
  assert.strictEqual(cardCount, 5, `expected exactly 5 cards (disclaimer, form feedback, past reviews, chat, supplement recommendations), got ${cardCount}`);
});

test('all functional element ids survived the move: coachChatLog, coachVideoBtn, coachHistoryList', (assert)=>{
  assert.ok(coachViewHtml.includes('id="coachChatLog"'));
  assert.ok(coachViewHtml.includes('id="coachVideoBtn"'));
  assert.ok(coachViewHtml.includes('id="coachHistoryList"'));
  assert.ok(coachViewHtml.includes('id="coachChatSend"'));
  assert.ok(coachViewHtml.includes('id="coachResult"'));
});

run();
