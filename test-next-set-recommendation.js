'use strict';
// v3.303 (owner: "integrate the algorithm to show if weight should go up or
// stay the same on the next set"). The progression engine answers "what
// weight today?" between SESSIONS; recommendNextSet answers it between SETS,
// from the set just logged, with the same double-progression model:
//  - UP one loadable step when the set reached the top of the rep range (or
//    beat a single target) and was not a grind: RPE 8 or less, or not logged;
//    reps restart at the bottom of the range;
//  - otherwise STAY at the same weight (short of the top: the chip shows the
//    top of the range to build to). Never up in a deload week.
// The call shows on the next set's chip (↑ / =, with the reason spoken), in the
// set sheet's subtitle, and on the Up next card — one call, three places.
// Confirmed in Chromium: after 135×8 at RPE 7 on Barbell Row (4×6-8) the next
// chip read 140×6 ↑, Up next said "Go up 5 — 8 reps at RPE 7 last set" with
// 140 / 6 filled in; after 140×6 the next chip read 140×8 = ("Stay — aim for 8 reps").
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-next-set-recommendation.js');
const src = readIndexSource();
const FNS = ['trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet'].map(n => extractFunction(src, n));
const { window } = runJsdom('', "var weightUnit = 'lb';", [...FNS, 'window.__rec = recommendNextSet;']);
// JSON round trip: objects from the jsdom realm fail deepStrictEqual's prototype check.
const rec = (prev, sets, step = 5, deload = false) => JSON.parse(JSON.stringify(window.__rec(prev, sets, step, deload)));

test('REAL invocation: top of the range and not a grind → up one loadable step, reps back to the bottom', (assert)=>{
  assert.deepStrictEqual(rec({weight:'135', reps:'8', rpe:'7'}, '4×6-8'),
    {dir:'up', weight:'140', reps:'6', why:'Go up 5 — 8 reps at RPE 7 last set'});
  assert.strictEqual(rec({weight:'135', reps:'8', rpe:'8'}, '4×6-8').dir, 'up', 'RPE 8 still counts as not a grind');
  assert.strictEqual(rec({weight:'135', reps:'9', rpe:''}, '4×6-8').dir, 'up', 'beat the range, RPE optional');
  assert.deepStrictEqual(rec({weight:'225', reps:'5', rpe:''}, '5×5'), {dir:'up', weight:'230', reps:'5', why:'Go up 5 — 5 reps last set'}, 'a single target');
  assert.strictEqual(rec({weight:'60', reps:'10', rpe:'7'}, '3×8-10', 2.5).weight, '62.5', 'kg-sized loadable step');
});

test('REAL invocation: a grind or a short set → stay, and says why', (assert)=>{
  assert.deepStrictEqual(rec({weight:'135', reps:'8', rpe:'9'}, '4×6-8'), {dir:'same', weight:'135', reps:'8', why:'Stay — RPE 9 last set'});
  assert.deepStrictEqual(rec({weight:'135', reps:'6', rpe:''}, '4×6-8'), {dir:'same', weight:'135', reps:'8', why:'Stay — aim for 8 reps'}, 'the chip shows the reps to build to');
  assert.strictEqual(rec({weight:'135', reps:'7', rpe:'6'}, '4×6-8').dir, 'same', 'an easy set below the top still stays (double progression)');
});

test('REAL invocation: never up in a deload week; nothing to say without a weight and reps', (assert)=>{
  assert.deepStrictEqual(rec({weight:'135', reps:'8', rpe:'6'}, '4×6-8', 5, true), {dir:'same', weight:'135', reps:'8', why:'Deload week — hold the weight'});
  assert.strictEqual(rec({weight:'', reps:'8'}, '4×6-8'), null);
  assert.strictEqual(rec({weight:'135', reps:''}, '4×6-8'), null);
});

test('REAL invocation: the set sheet and Up next show the same call the chip carries', (assert)=>{
  const values = {done:false, weight:'140', reps:'6', trend:'up', why:'Go up 5 — 8 reps at RPE 7 last set'};
  // Set sheet subtitle.
  const sheet = runJsdom(`<div id="exerciseList"><div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="1"><div class="ex-sets"><span>4×6-8</span></div></div>
      <div class="sets-block"><div class="set-row" data-ex-idx="1" data-set-idx="1"><span class="set-row-owner">Barbell Row</span><input class="ex-weight" placeholder="lb"><input class="ex-reps" placeholder="reps"><input class="ex-rpe"></div></div></div></div>
      ${extractElementById(src, 'setSheetScrim')}${extractElementById(src, 'setSheet')}`,
    "var weightUnit = 'lb', distanceUnit = 'km'; window.requestAnimationFrame = f => f(); const setSheetState = {row:null, chip:null};",
    [extractFunction(src, 'numericPlaceholder'), extractFunction(src, 'setChipValues'), extractFunction(src, 'openSetSheet'),
     `openSetSheet(document.querySelector('.set-row'), {_values: ${JSON.stringify(values)}, dataset:{exIdx:'1', setIdx:'1'}});`]).window;
  assert.strictEqual(sheet.document.getElementById('setSheetSub').textContent, 'Go up 5 — 8 reps at RPE 7 last set');
  assert.strictEqual(sheet.document.getElementById('setSheetWeight').value, '140');
  // Up next card.
  const card = runJsdom(extractElementById(src, 'upNext') + `<div id="exerciseList"><div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="1"><div class="ex-sets"><span>4×6-8</span></div></div>
      <div class="set-chips"><button class="set-chip" data-ex-idx="1" data-set-idx="1"></button></div>
      <div class="sets-block"><div class="set-row" data-ex-idx="1" data-set-idx="0"><span class="set-row-owner">Barbell Row</span><input class="ex-weight" value="135"><input class="ex-reps" value="8"><input class="ex-rpe" value="7"></div>
      <div class="set-row" data-ex-idx="1" data-set-idx="1"><span class="set-row-owner">Barbell Row</span><input class="ex-weight" placeholder="lb"><input class="ex-reps" placeholder="reps"><input class="ex-rpe" placeholder="RPE"></div></div></div></div>`,
    "var weightUnit = 'lb';",
    [extractFunction(src, 'findNextSetRow'), extractFunction(src, 'numericPlaceholder'), extractFunction(src, 'renderUpNext'), extractFunction(src, 'fillSetLogger'), // v3.376: shared with the exercise logger
     `document.querySelector('.set-chip')._values = ${JSON.stringify(values)}; renderUpNext();`]).window;
  assert.strictEqual(card.document.getElementById('upNextWhy').textContent, 'Go up 5 — 8 reps at RPE 7 last set');
  assert.strictEqual(card.document.getElementById('upNextWhy').hidden, false);
  assert.strictEqual(card.document.getElementById('upNextWeight').value, '140');
  assert.strictEqual(card.document.getElementById('upNextReps').value, '6');
});

run();
