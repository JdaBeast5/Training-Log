'use strict';
// Behavioral coverage for a real bug found during a functional/accessibility
// audit: Care lets you log a check-in with "Where is it now?" left on its
// default "Select a region" option (region is optional — the app doesn't
// require it to log a check-in, and that's unchanged by this fix). The
// result banner always rendered a "Mark [this area] as resting" button
// regardless, with data-region="" when nothing was picked.
//
// Clicking it ran careSubmit's click handler, which correctly guarded the
// actual write behind `if(region) await addRestingRegion(region);` — so
// nothing was ever recorded for a blank region — but then UNCONDITIONALLY
// set the button's text to "Marked as resting ✓" and disabled it, regardless
// of whether that guard had actually run addRestingRegion or silently
// skipped it. A person who never picked a region saw a confident
// confirmation for something that never happened: the region never appears
// in Today's exercise cautions or the stale-check-in reminder, and there is
// no way to tell from the UI that nothing was saved.
//
// Fixed at the source of the false signal: buildCareResultHtml only renders
// the "Mark as resting" button when a real region was picked. With no
// region, there is nothing coherent to mark as resting, so no button is
// offered — rather than offering one that can silently do nothing while
// claiming success.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-care-mark-resting-confirmation.js');

const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const sensationLabelsSrc = extractConst(src, 'SENSATION_LABELS');
const redFlagSrc = extractConst(src, 'RED_FLAG_SENSATIONS');
const regionReliefSrc = extractConst(src, 'REGION_RELIEF');
const buildReliefHtmlSrc = extractFunction(src, 'buildReliefHtml');
const buildCareResultHtmlSrc = extractFunction(src, 'buildCareResultHtml');

// exerciseInfo backs buildReliefHtml's per-exercise cue lookup — stubbed to
// a minimal real shape rather than loading the full content-exercises.js
// data file, matching the established pattern in
// test-partial-set-reactions.js.
const exerciseInfoStub = `var exerciseInfo = {
  'Pendulum Swings': {cues:['Let the arm hang and swing gently — no muscling it']},
  'Wrist Flexor Stretch': {cues:['Pull the fingers back gently until a light stretch is felt']},
};`;

function render(sensation, region, pain){
  const [html] = runSandbox(
    [exerciseInfoStub, escapeHtmlSrc, sensationLabelsSrc, redFlagSrc, regionReliefSrc, buildReliefHtmlSrc, buildCareResultHtmlSrc],
    `__capture.push(buildCareResultHtml(${JSON.stringify(sensation)}, ${JSON.stringify(region)}, ${JSON.stringify(pain)}));`
  );
  return html;
}

test('sabotage-relevant: buildCareResultHtml itself gates the button on region (not left to the caller)', (assert)=>{
  assert.match(buildCareResultHtmlSrc, /region\s*\?\s*`<button[^`]*careMarkResting/, 'the button markup must be conditioned on region truthiness inside the helper');
});

test('non-urgent path: no region picked -> no "Mark as resting" button rendered at all (nothing to falsely confirm)', (assert)=>{
  const html = render('ache', '', 3);
  assert.doesNotMatch(html, /careMarkResting/, 'must not render the button id when region is blank');
  assert.doesNotMatch(html, /Mark .*as resting/, 'must not render any "Mark ... as resting" affordance when region is blank');
});

test('non-urgent path: a real region picked -> button renders with the correct data-region and label', (assert)=>{
  const html = render('ache', 'Shoulder', 3);
  assert.match(html, /id="careMarkResting"/, 'button must render when a real region was picked');
  assert.match(html, /data-region="Shoulder"/, 'must carry the picked region');
  assert.match(html, /Mark Shoulder as resting/, 'button label must name the actual region, not a vague fallback');
});

test('urgent (red-flag) path: no region picked -> no "Mark as resting" button rendered', (assert)=>{
  const html = render('sharp', '', 8);
  assert.match(html, /doctor or urgent care/, 'precondition: this must be the red-flag banner');
  assert.doesNotMatch(html, /careMarkResting/, 'the red-flag banner must not offer the button either when region is blank');
});

test('urgent (red-flag) path: a real region picked -> button still renders with the correct region', (assert)=>{
  const html = render('sharp', 'Knee', 8);
  assert.match(html, /doctor or urgent care/, 'precondition: this must be the red-flag banner');
  assert.match(html, /id="careMarkResting"/);
  assert.match(html, /data-region="Knee"/);
  assert.match(html, /Mark Knee as resting/);
});

run();
