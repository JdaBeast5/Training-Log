'use strict';
// Behavioral coverage for a tap-target audit: several icon-only controls
// (the working-set row's plate/voice/drop/note buttons, Care's "stop resting"
// ✕, and the Settings/Coach panel close buttons) were smaller than the ~44px
// floor this codebase already established for .sub-modal-close/.log-date-nav/
// .calendar-nav-btn/.fi-plus/.fi-duplicate/.fi-star/.reorder-arrows — but
// were never added to those existing hit-area-extension rules, so they never
// got the invisible ::after hit area the rest of the app already has.
//
// This file does NOT re-verify the pre-existing rules (that ground truth
// already ships unchanged) — it verifies only what this pass added: that the
// new selectors are really in the CSS, with real values, AND that those
// selectors really target classes the shipped markup actually emits, in the
// real adjacency the CSS comments' geometry claims depend on. jsdom has no
// layout engine, so widths/heights/positions can't be asserted against an
// actual box model here — that verification was done separately, in a real
// browser, against three real stacked rows / wrapped chip rows / panel
// headers rendered from this exact extracted CSS and markup. What CAN be
// asserted for real in jsdom is the CSSOM: real parsed rules, real selector
// lists, real declared values — not a string search that a stray comment
// could defeat.
const {
  readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner,
} = require('./testHelpers.js');

const src = readIndexSource();
const { JSDOM } = require('jsdom');

// ── The real CSS under test ─────────────────────────────────────────────────
// Scoped to just the "1. Touch targets" section (between its own heading
// comment and the next section's), not the whole ~4000-line stylesheet —
// faster to parse and immune to drift in unrelated CSS elsewhere in the file.
const cssSection = (()=>{
  const start = src.indexOf('/* --- 1. Touch targets');
  if(start === -1) throw new Error('Touch targets CSS section not found');
  const end = src.indexOf('/* --- 2. Visible keyboard focus', start);
  if(end === -1) throw new Error('end of Touch targets CSS section not found');
  return src.slice(start, end);
})();

const cssRules = (()=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${cssSection}</style><body></body>`);
  return [...dom.window.document.styleSheets[0].cssRules];
})();

// Finds the rule whose selector list contains `selector` as one of its
// comma-separated members (exact match after trimming) — not a substring
// match, so `.plate-btn` can never accidentally match a hypothetical
// `.plate-btn-outline` and pass for the wrong reason.
function ruleFor(selector){
  return cssRules.find(r=>
    typeof r.selectorText === 'string' &&
    r.selectorText.split(',').map(s=> s.trim()).includes(selector)
  );
}

const { test, run } = makeRunner('test-tap-target-hit-areas.js');

// ── 1. Group A additions: settings-panel-close, coach-fab-close, qty-btn, frr-remove-btn ──

test('REAL CSS: all four newly-covered Group A controls get position:relative, in the SAME rule as the pre-existing three (proves this is an extension, not a parallel rule someone could drift out of sync)', (assert)=>{
  const posRule = ruleFor('.settings-panel-close');
  assert.ok(posRule, '.settings-panel-close must appear in a position:relative rule');
  assert.strictEqual(posRule.style.position, 'relative');
  const members = posRule.selectorText.split(',').map(s=> s.trim());
  for(const cls of ['.sub-modal-close', '.log-date-nav', '.calendar-nav-btn', '.settings-panel-close', '.coach-fab-close', '.qty-btn', '.frr-remove-btn']){
    assert.ok(members.includes(cls), `${cls} must be in the shared Group A position:relative rule`);
  }
  assert.strictEqual(members.length, 7, 'sabotage-relevant: exactly these 7, not more or fewer — a stray duplicate or a missed addition both change this number');
});

test('REAL CSS: the Group A ::after rule gives all four new controls a full 44x44 centred hit area, matching the pre-existing three exactly', (assert)=>{
  for(const cls of ['.settings-panel-close', '.coach-fab-close', '.qty-btn', '.frr-remove-btn']){
    const rule = ruleFor(`${cls}::after`);
    assert.ok(rule, `${cls}::after must have its own rule`);
    assert.strictEqual(rule.style.width, '44px', `${cls}::after width`);
    assert.strictEqual(rule.style.height, '44px', `${cls}::after height`);
    assert.strictEqual(rule.style.position, 'absolute');
    assert.strictEqual(rule.style.transform, 'translate(-50%,-50%)');
  }
  // Sabotage anchor: the min-width/min-height guard is part of THIS rule
  // (shared with the pre-existing three) — if a future edit split the new
  // selectors into their own rule without copying it, this would catch that.
  const guardRule = ruleFor('.settings-panel-close::after');
  assert.strictEqual(guardRule.style.minWidth, '100%');
  assert.strictEqual(guardRule.style.minHeight, '100%');
});

// ── 2. Group B addition: the working-set row's icon buttons ────────────────

test('REAL CSS: .plate-btn/.voice-log-btn/.set-drop-btn/.set-note-btn get position:relative and a 44px-tall hit area extended by the row\'s real 6px gap', (assert)=>{
  const posRule = ruleFor('.plate-btn');
  assert.ok(posRule, '.plate-btn must appear in a position:relative rule');
  assert.strictEqual(posRule.style.position, 'relative');
  const members = posRule.selectorText.split(',').map(s=> s.trim());
  assert.deepStrictEqual(members, ['.plate-btn', '.voice-log-btn', '.set-drop-btn', '.set-note-btn']);

  for(const cls of ['.plate-btn', '.voice-log-btn', '.set-drop-btn', '.set-note-btn']){
    const rule = ruleFor(`${cls}::after`);
    assert.ok(rule, `${cls}::after must have its own rule`);
    assert.strictEqual(rule.style.width, 'calc(100% + 6px)', `${cls}::after width must use the row's real 6px gap, not a guessed number`);
    assert.strictEqual(rule.style.height, '44px', `${cls}::after gets the FULL 44px — there is no vertical constraint here, unlike .reorder-arrows/.clear-resting below`);
  }
});

test('REAL MARKUP: the real working-set row template emits plate-btn/voice-log-btn immediately after the RPE input, then set-drop-btn, then set-note-btn — the exact adjacency the 6px-gap CSS comment claims', (assert)=>{
  const rowStart = src.indexOf('<div class="set-row swipe-item" data-set-idx="${setIdx}" data-ex-idx="${i}">');
  assert.ok(rowStart !== -1, 'sanity: the real set-row template must be found');
  const rowEnd = src.indexOf('<button class="add-set-btn"', rowStart);
  assert.ok(rowEnd !== -1, 'sanity: template must end before the real Add Set button');
  const rowTemplate = src.slice(rowStart, rowEnd);

  const rpeAt = rowTemplate.indexOf('class="ex-input ex-rpe"');
  const plateAt = rowTemplate.indexOf('class="plate-btn"');
  const voiceAt = rowTemplate.indexOf('class="voice-log-btn"');
  const dropAt = rowTemplate.indexOf('class="set-drop-btn');
  const noteAt = rowTemplate.indexOf('class="set-note-btn');
  const statusAt = rowTemplate.indexOf('class="set-status"');

  assert.ok(rpeAt !== -1 && dropAt !== -1 && noteAt !== -1 && statusAt !== -1, 'sanity: all real anchors must be found in the real template');
  assert.ok(plateAt !== -1 || voiceAt !== -1, 'sanity: at least one of plate-btn/voice-log-btn (they are mutually exclusive in real markup) must be found');
  const firstButtonAt = plateAt !== -1 ? plateAt : voiceAt;

  assert.ok(rpeAt < firstButtonAt, 'RPE input comes before the plate/voice button');
  assert.ok(firstButtonAt < dropAt, 'plate/voice button comes before the drop-set button');
  assert.ok(dropAt < noteAt, 'drop-set button comes before the note button');
  assert.ok(noteAt < statusAt, 'note button comes before the (non-interactive) status span');
});

test('sabotage-relevant: the second, dynamically-added set-row template (used when "+ Add set" is pressed) carries the SAME four classes — both templates must stay in sync for the CSS fix to cover every row, not just the first render', (assert)=>{
  // This is a DIFFERENT code path from the initial-render template above
  // (`div.innerHTML =`, built by hand in wireSetsBlock's add-set handler,
  // not the `.map(...)` in the render function) — found by its own anchor,
  // not reused from the first template, so this genuinely proves both
  // places were updated rather than checking the same string twice.
  const dynamicStart = src.indexOf('div.innerHTML = `');
  assert.ok(dynamicStart !== -1, 'sanity: the dynamic add-set template must be found');
  const dynamicEnd = src.indexOf('`;', dynamicStart);
  assert.ok(dynamicEnd !== -1, 'sanity: template must have a terminating backtick-semicolon');
  const dynamicTemplate = src.slice(dynamicStart, dynamicEnd);

  assert.ok(dynamicTemplate.includes('class="plate-btn"') || dynamicTemplate.includes('class="voice-log-btn"'),
    'dynamic template: plate-btn or voice-log-btn present');
  assert.ok(dynamicTemplate.includes('class="set-drop-btn"'), 'dynamic template: set-drop-btn present');
  assert.ok(dynamicTemplate.includes('class="set-note-btn"'), 'dynamic template: set-note-btn present');
});

// ── 3. Care view: the "stop resting" ✕ (.clear-resting) ────────────────────

test('REAL CSS: .clear-resting gets a hit area extended by its real 8px gap horizontally, but a REDUCED 36px height — not the full 44 — because a wrapped chip row sits only ~8px below the one above it (measured, documented in the CSS comment, same discipline as .reorder-arrows)', (assert)=>{
  const posRule = ruleFor('.clear-resting');
  assert.ok(posRule, '.clear-resting must appear in a position:relative rule');
  assert.strictEqual(posRule.style.position, 'relative');

  const afterRule = ruleFor('.clear-resting::after');
  assert.ok(afterRule, '.clear-resting::after must have its own rule');
  assert.strictEqual(afterRule.style.width, 'calc(100% + 8px)', 'horizontal expansion matches .resting-chip\'s real 8px gap');
  assert.strictEqual(afterRule.style.height, '36px', 'sabotage-relevant: NOT 44px — a naive copy of the Group A/B pattern here would create real inter-row overlap, verified separately in a real browser');
});

test('REAL MARKUP: the real resting-chip template places the region-name link BEFORE the clear-resting ✕, in the same chip, matching the geometry the CSS comment assumes', (assert)=>{
  const anchor = 'class="resting-chip"';
  const chipAt = src.indexOf(anchor);
  assert.ok(chipAt !== -1, 'sanity: the real resting-chip template must be found');
  const chipLineEnd = src.indexOf('</span>', chipAt);
  assert.ok(chipLineEnd !== -1);
  const chipTemplate = src.slice(chipAt, chipLineEnd);
  const linkAt = chipTemplate.indexOf('class="link-btn"');
  const clearAt = chipTemplate.indexOf('class="clear-resting"');
  assert.ok(linkAt !== -1 && clearAt !== -1, 'both the region-name link and the clear button must be found in the real chip template');
  assert.ok(linkAt < clearAt, 'the region-name link comes first, clear-resting second — the ::after\'s left-side neighbour really is the link');
});

// ── 4. Real-DOM render: the food-result row's qty-stepper and remove button ─

test('REAL invocation: buildFoodResultRow (the real, already-consolidated row builder) renders qty-btn/qty-count/qty-btn adjacent in the stepper, and frr-remove-btn as the last control, exactly the adjacency the CSS comment relies on', (assert)=>{
  const fn = extractFunction(src, 'buildFoodResultRow');
  const macroFieldsConst = extractConst(src, 'FOOD_MACRO_FIELDS');
  const qtyMaxConst = extractConst(src, 'FOOD_QTY_MAX');
  const totalFn = extractFunction(src, 'foodRowTotalText');

  const { document } = runJsdom('<div id="out"></div>', `
    window.customFoods = [];
    window.escapeHtml = (s)=> String(s);
    // Not what this test is about (see test-food-result-row-dietary-flag.js
    // for that) — stubbed so the real call inside buildFoodResultRow
    // doesn't throw ReferenceError.
    window.itemViolatesPreferences = ()=> null;
  `, [macroFieldsConst, qtyMaxConst, totalFn, fn, `
    document.getElementById('out').innerHTML = buildFoodResultRow(
      {name: 'Test Food', cal: 100}, 0, [2], {removable: true}
    );
  `]);

  const stepper = document.querySelector('.qty-stepper');
  assert.ok(stepper, 'sanity: the real function really renders a qty-stepper');
  const children = [...stepper.children];
  assert.strictEqual(children.length, 3, 'sanity: exactly minus button, count, plus button');
  assert.ok(children[0].classList.contains('qty-btn') && children[0].dataset.step === '-1', 'decrement button is first');
  assert.ok(children[1].classList.contains('qty-count'), 'count sits directly between the two buttons');
  assert.ok(children[2].classList.contains('qty-btn') && children[2].dataset.step === '1', 'increment button is last');

  const controls = document.querySelector('.frr-controls');
  const removeBtn = controls.querySelector('.frr-remove-btn');
  assert.ok(removeBtn, 'removable:true must really render frr-remove-btn');
  assert.strictEqual(controls.lastElementChild, removeBtn, 'frr-remove-btn is the last control in the row — nothing after it competing for the hit area\'s right-side expansion');
});

// ── 5. Real markup: the settings/coach close buttons really carry the classes the CSS targets ──

test('REAL MARKUP: the real settingsClose and coachFabClose buttons carry the exact classes the new Group A CSS rule targets', (assert)=>{
  const settingsCloseHtml = extractElementById(src, 'settingsClose');
  const coachFabCloseHtml = extractElementById(src, 'coachFabClose');
  const { document } = runJsdom(settingsCloseHtml + coachFabCloseHtml, '', []);
  const settingsClose = document.getElementById('settingsClose');
  const coachFabClose = document.getElementById('coachFabClose');
  assert.ok(settingsClose.classList.contains('settings-panel-close'));
  assert.ok(coachFabClose.classList.contains('coach-fab-close'));
});

run();
