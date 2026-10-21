'use strict';
// iPhone Duo support, part 4: Log opts into the open-posture split.
//
// Same .posture-split / .split-primary mechanism Today uses (see
// test-duo-open-posture-layout.js for the grid itself and the gate): on an
// unfolded Duo the nutrition card — search, quick-add, today's food log —
// sits on the left, and water, bodyweight, sleep, supplements, measurements
// and the rest stack on the right. On a phone nothing changes: the class
// only means anything inside the open-posture media query.
//
// Runs the real Log markup in jsdom. The visual result (nutrition card at
// its own height on the left, right-hand cards stacked at the 18px card
// margin, phone sizes pixel-identical) was confirmed in real Chromium —
// see HANDOFF-v51.
const { readIndexSource, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-duo-open-posture-log-split.js');
const { document } = runJsdom(extractElementById(src, 'logView'), '', []);
const logView = document.getElementById('logView');

test('Log is a split view with exactly one primary (sabotage anchor)', (assert)=>{
  assert.ok(logView.classList.contains('posture-split'));
  assert.equal(document.querySelectorAll('.split-primary').length, 1);
  assert.equal(document.querySelectorAll('#logView > .split-primary').length, 1, 'the primary must be a DIRECT child, or the grid never places it');
});

test('the primary is the nutrition card — and still the first card, so the phone order is unchanged', (assert)=>{
  const primary = logView.querySelector(':scope > .split-primary');
  assert.ok(primary.querySelector('#nutritionHeader'), 'expected the Today\'s Nutrition card');
  assert.equal(logView.firstElementChild, primary);
  assert.ok(primary.classList.contains('card'), 'still a card, so it keeps the card treatment');
});

test('the right-hand cards fit the grid\'s explicit rows', (assert)=>{
  const right = [...logView.children].filter(k=> !k.classList.contains('split-primary'));
  const rows = /\.posture-split\{[^}]*grid-template-rows:\s*repeat\((\d+), auto\) 1fr/.exec(src);
  assert.ok(rows);
  assert.ok(right.length <= Number(rows[1]), `${right.length} right-hand children, ${rows[1]} auto rows`);
});

test('a card primary is not stretched to the right column\'s height (it would grow an empty band of card background)', (assert)=>{
  const m = /\.posture-split > \.split-primary\{([^}]*)\}/.exec(src);
  assert.ok(m);
  assert.ok(!/align-self\s*:\s*stretch/.test(m[1]));
  assert.match(/\.posture-split\{([^}]*)\}/.exec(src)[1], /align-items:start/);
});

run();
