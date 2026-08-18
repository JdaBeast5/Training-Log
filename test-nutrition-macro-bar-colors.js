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

test('sabotage-relevant: #barPro no longer carries var(--plate-red) in its markup', (assert)=>{
  const html = extractElementById(src, 'barPro');
  assert.doesNotMatch(html, /var\(--plate-red\)/, `#barPro must not use the urgent/warning color, got: ${html}`);
});

test('REAL invocation: #barPro now uses var(--plate-teal), the color picked to replace it', (assert)=>{
  const html = extractElementById(src, 'barPro');
  assert.match(html, /style="background:var\(--plate-teal\);width:0%"/, `expected #barPro to use --plate-teal, got: ${html}`);
});

test('regression guard: the other three macro bars (CALORIES/FAT/CARBS) are untouched by this fix', (assert)=>{
  assert.match(extractElementById(src, 'barCal'), /background:var\(--plate-white\)/, '#barCal must still be white');
  assert.match(extractElementById(src, 'barFat'), /background:var\(--plate-yellow\)/, '#barFat must still be yellow');
  assert.match(extractElementById(src, 'barCarb'), /background:var\(--plate-blue\)/, '#barCarb must still be blue');
});

test('sabotage-relevant: JS never sets .style.background on any macro bar — the markup color really is the permanent one, not a placeholder a render call overwrites', (assert)=>{
  assert.doesNotMatch(src, /getElementById\('barPro'\)\.style\.background/, 'if JS ever sets barPro\'s background, the markup fix alone would not be the whole story');
  assert.doesNotMatch(src, /getElementById\('barCal'\)\.style\.background/);
  assert.doesNotMatch(src, /getElementById\('barFat'\)\.style\.background/);
  assert.doesNotMatch(src, /getElementById\('barCarb'\)\.style\.background/);
  assert.match(src, /getElementById\('barPro'\)\.style\.width\s*=/, 'sanity: confirms JS does actively touch #barPro on every render, just not its color');
});

test('sabotage-relevant: red really is reserved app-wide for the over-target/urgent case, not a color any bar wears by default — the invariant this fix restores', (assert)=>{
  const nutrientColorMatch = /const NUTRIENT_BAR_COLOR = \{([^}]+)\};/.exec(src);
  assert.ok(nutrientColorMatch, 'expected to find the NUTRIENT_BAR_COLOR table');
  assert.doesNotMatch(nutrientColorMatch[1], /plate-red/, 'no micronutrient must default to red either — red is reserved for the overMax branch, not baked into any single nutrient\'s normal color');
  const overMaxLine = /overMax \? 'var\(--plate-red\)' : NUTRIENT_BAR_COLOR\[nutrient\]/;
  assert.match(src, overMaxLine, 'red must still be reachable, but only via the real overMax warning branch');
});

run();
