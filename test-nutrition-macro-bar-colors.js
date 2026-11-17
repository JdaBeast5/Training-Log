'use strict';
// Behavioral coverage for a real color-scheme violation on Today's Nutrition
// (user-reported: "some red that popped up on the nutrition page that is
// out of the scheme"). The four daily macro bars (#barCal/#barPro/#barFat/
// #barCarb) each carry a hardcoded initial `background:var(--plate-*)` in
// their markup, and the JS that updates them on every render
// (renderMacroBars, around the `document.getElementById('barPro').style.width`
// lines) only ever touches `.style.width`, never `.style.background` — so
// whatever color ships in the markup is the bar's real, permanent color, not
// a placeholder.
//
// CALORIES=white, FAT=yellow, CARBS=blue — none of them red. PROTEIN alone
// was var(--plate-red), which collides with this app's own well-established
// convention (visible in NUTRIENT_BAR_COLOR a few hundred lines below: every
// extended micronutrient bar gets its own non-red color, and red is used
// ONLY for the overMax/over-target warning case) that red means urgent/
// warning, not "this is just what protein looks like today." Nowhere else
// in the app (the per-food-item .fl-macro-breakdown chips, the nutrition
// trend chart) treats protein as red either — confirmed no competing
// convention existed to preserve. Asked the user directly which non-red
// color should replace it (teal, unused by any of the other three macro
// bars or six micronutrient bars) rather than guessing.
const { readIndexSource, extractElementById, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-nutrition-macro-bar-colors.js');

// 2026-11-16 (v3.588, UX-13): the four macro bars became one ruled row of
// figures (.food-figs), so there are no bar colours left to pin. The owner's
// original report still holds: nothing in the daily totals wears red (or any
// state colour) by default. The figures are ink, their labels --text-2, and
// updateBars writes only text, never a colour.
test('REAL markup + CSSOM (UX-13): the four bars are gone; the daily figures carry no colour of their own, and protein is not red', (assert)=>{
  for(const id of ['barCal', 'barPro', 'barFat', 'barCarb']) assert.doesNotMatch(src, new RegExp(`id="${id}"`), id + ' is gone');
  const figs = /<div class="food-figs"[\s\S]*?\n    <\/div>/.exec(src);
  assert.ok(figs, 'the figures row exists');
  assert.doesNotMatch(figs[0], /plate-|style=/, 'no inline colour on any figure');
  assert.match(src, /\.food-fig \.fig\{[^}]*color:var\(--text\);/);
  assert.match(src, /\.food-fig \.lbl\{[^}]*color:var\(--text-2\);/);
  const body = /function updateBars\(v\)\{[\s\S]*?\n\}/.exec(src)[0];
  assert.doesNotMatch(body, /\.style\./, 'updateBars writes text only, never a colour');
});

test('sabotage-relevant: red really is reserved app-wide for the over-target/urgent case, not a color any bar wears by default — the invariant this fix restores', (assert)=>{
  const nutrientColorMatch = /const NUTRIENT_BAR_COLOR = \{([^}]+)\};/.exec(src);
  assert.ok(nutrientColorMatch, 'expected to find the NUTRIENT_BAR_COLOR table');
  assert.doesNotMatch(nutrientColorMatch[1], /plate-red/, 'no micronutrient must default to red either — red is reserved for the overMax branch, not baked into any single nutrient\'s normal color');
  const overMaxLine = /overMax \? 'var\(--plate-red\)' : NUTRIENT_BAR_COLOR\[nutrient\]/;
  assert.match(src, overMaxLine, 'red must still be reachable, but only via the real overMax warning branch');
});

run();
