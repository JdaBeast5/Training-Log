'use strict';
// v3.588 (UX-13): Food in the world's ink. The calorie lead figure stays; the
// four macro bars become one ruled row of four figures (eaten, with its target
// under it); the quick-add tiles become standard buttons; each logged food is a
// two-line ruled row (the name; calories and macros) with its macro expand and
// portion stepper. No flow, storage or API changes.
//
// Real invocation: the real computeTargets over the real default userProfile,
// computeTodaysFoodTotals, renderFoodLog (with the real buildSwipeItem,
// makeSwipeable, icon), updateBars and renderCalHero, over the real #calHero,
// #calHeroEstimate, .food-figs and #foodLogList markup.
//
// Sabotage: drop one entry from the sum and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, extractElementById, extractElementByClass, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-food-view-summary.js');
const USER_PROFILE = /^let userProfile = \{[\s\S]*?\n\};/m.exec(src)[0];

const LOG = [
  {name: 'Greek Yogurt', cal: 100, pro: 17, fat: 0.7, carb: 6},
  {name: 'Chicken burrito bowl', cal: 640, pro: 42, fat: 21, carb: 70},
  {name: 'Bagel ×2', baseName: 'Bagel', qty: 2, cal: 560, pro: 20, fat: 3, carb: 110},
];

function mount({saved = false} = {}){
  const markup = '<div id="calorieFloorNote"></div>' + extractElementById(src, 'calHero') + extractElementById(src, 'calHeroEstimate') + extractElementByClass(src, 'food-figs') + '<div id="foodLogList"></div>';
  const { window } = runJsdom(markup, `
    var weightUnit = 'lb', profileBodySaved = ${saved}, todaysFoodLog = ${JSON.stringify(LOG)}, targets = null, activeProgram = 'strength';
    window.__steps = [];
    function adjustFoodLogQty(i, step){ window.__steps.push([i, step]); }
    function removeFoodFromLog(){} function renderMedicalNutrientBars(){} function updateRepeatYesterdayVisibility(){}`,
    [USER_PROFILE, extractConst(src, 'LB_PER_KG'), extractConst(src, 'FOOD_QTY_MAX'), extractConst(src, 'ICONS'),
     ...['computeTargets', 'readValidAge', 'readGoalWeight', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight', 'isPlaceholderBody', 'escapeHtml', 'icon',
         'buildSwipeItem', 'makeSwipeable', 'computeTodaysFoodTotals', 'renderCalHero', 'updateBars', 'renderFoodLog'].map(f => extractFunction(src, f)),
     'targets = computeTargets(userProfile); renderFoodLog(); window.__cal = computeTargets(userProfile).cal;']);
  return window;
}

test('criterion 1: the lead figure is computeTargets(userProfile).cal minus the logged sum (real computeTargets, computeTodaysFoodTotals, renderFoodLog)', (assert)=>{
  const w = mount();
  const sum = LOG.reduce((a, i) => a + i.cal, 0);
  assert.ok(w.__cal > 1000, 'anchor: a real target, ' + w.__cal);
  assert.strictEqual(w.document.getElementById('calHeroNum').textContent, String(w.__cal - sum));
  assert.strictEqual(w.document.getElementById('calHeroUnit').textContent, `cal left of ${w.__cal}`);
  // The four figures: eaten, with each target under it, in one ruled row.
  const figs = [...w.document.querySelectorAll('.food-figs .food-fig')].map(f => [f.querySelector('.fig').textContent, f.querySelector('.lbl').textContent]);
  assert.strictEqual(figs.length, 4);
  assert.deepStrictEqual(figs.map(f => f[0]), [String(sum), '79', '186', '25']);
  assert.match(figs[0][1], new RegExp(`^of ${w.__cal} cal$`));
  assert.deepStrictEqual(figs.slice(1).map(f => f[1].replace(/\d+/, 'N')), ['of Ng protein', 'of Ng carbs', 'of Ng fat']);
});

test('criterion 2: every entry is exactly one two-line .food-log-item (name; calories and macros), and its expand and portion stepper still work (real clicks)', (assert)=>{
  const w = mount();
  const rows = [...w.document.querySelectorAll('#foodLogList .food-log-item')];
  assert.strictEqual(rows.length, LOG.length);
  rows.forEach((row, i) => {
    assert.strictEqual(row.querySelector('.fl-name').textContent, LOG[i].name);
    assert.strictEqual(row.querySelector('.fl-macro').textContent.trim(),
      `${LOG[i].cal} cal · ${Math.round(LOG[i].pro)}g protein · ${Math.round(LOG[i].carb)}g carbs · ${Math.round(LOG[i].fat)}g fat`);
    assert.strictEqual(row.querySelectorAll('.fl-text > div').length, 2, 'two lines');
  });
  rows[1].click();
  assert.ok(rows[1].classList.contains('open'));
  assert.ok(w.document.getElementById('flDetail1').classList.contains('open'));
  assert.strictEqual(rows[1].getAttribute('aria-expanded'), 'true');
  rows[2].querySelector('.qty-btn[data-step="1"]').click();
  rows[2].querySelector('.qty-btn[data-step="-1"]').click();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(w.__steps)), [[2, 1], [2, -1]]);
  assert.ok(!rows[2].classList.contains('open'), 'a stepper tap does not open the row');
});

test('criterion 3: BIZ-03\'s estimate line and BL-18\'s recents row are present; the estimate shows on the placeholder body and not once saved', (assert)=>{
  const doc = new JSDOM(html).window.document;
  const log = doc.getElementById('logView');
  assert.ok(log.querySelector('#calHeroEstimate'), 'BIZ-03 line');
  assert.ok(log.querySelector('#foodRecents'), 'BL-18 recents row');
  const placeholder = mount().document.getElementById('calHeroEstimate');
  assert.strictEqual(placeholder.hidden, false);
  assert.match(placeholder.textContent, /^Estimate for a 30-year-old, 5'8"/);
  assert.strictEqual(mount({saved: true}).document.getElementById('calHeroEstimate').hidden, true);
});

test('the summary order: the lead figure, then the four figures, then the eaten list; the four bars are gone', (assert)=>{
  const log = new JSDOM(html).window.document.getElementById('logView');
  const [hero, figs, list] = [log.querySelector('#calHero'), log.querySelector('.food-figs'), log.querySelector('#foodLogList')];
  assert.ok(hero.compareDocumentPosition(figs) & 4);
  assert.ok(figs.compareDocumentPosition(list) & 4);
  assert.strictEqual(log.querySelectorAll('#barCal, #barPro, #barFat, #barCarb').length, 0);
  assert.strictEqual(log.querySelectorAll('.quick-add-row .quick-add-btn').length, 5, 'all five ways to add a food stay');
});

run();
