'use strict';
// v3.522 (BL-03, audit SAF-3 part 1): per-exercise body-region overrides for
// the resting-region flags. Real invocation of the real regionsForExercise
// with the real EXERCISE_REGION_OVERRIDE, CATEGORY_TO_REGIONS and exerciseInfo,
// plus a wiring count (renderWorkout is too entangled to drive whole in jsdom,
// as test-today-workout-emoji.js notes).
//
// Sabotage anchor: empty EXERCISE_REGION_OVERRIDE and criteria 1-3 fail; put a
// CATEGORY_TO_REGIONS[ lookup back at either call site and criterion 6 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');
const fs = require('fs');
const path = require('path');

const src = readIndexSource();
const indexOnly = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-region-override.js');

const chunks = [
  extractConst(src, 'SUBSTITUTION_MAP'),
  ...['SUB_CALF_HOLD','SUB_FEET_ON_HANG','SUB_NECK_ISO','SUB_VEST_CARRY','SUB_BIRD_DOG','SUB_LYING_RAISE'].map(n => extractConst(src, n)),
  extractConst(src, 'EXERCISE_SUBSTITUTE_OVERRIDE'),
  extractFunction(src, 'suggestSubstitute'),
  extractConst(src, 'REGION_RELIEF'),
  extractFunction(src, 'isReliefForAllHits'),
  extractConst(src, 'exerciseInfo'),
  extractConst(src, 'CATEGORY_TO_REGIONS'),
  extractConst(src, 'EXERCISE_REGION_OVERRIDE'),
  extractFunction(src, 'regionsForExercise'),
];
const sbx = (body) => runSandbox(chunks, body)[0];
const regionsOf = (name) => sbx(`__capture.push(regionsForExercise(${JSON.stringify(name)}, (exerciseInfo[${JSON.stringify(name)}] || {}).category));`);

test('criterion 1: Hangboard Max Hang flags Hands/Fingers', (assert)=>{
  assert.ok(regionsOf('Hangboard Max Hang').includes('Hands/Fingers'));
  for(const n of ['Hangboard Repeaters', 'Lock-off Hold']) assert.ok(regionsOf(n).includes('Hands/Fingers'), n);
});

test('criterion 2: Eccentric Heel Drop flags Ankle/Foot, not Elbow/Wrist (its category is arms)', (assert)=>{
  const r = regionsOf('Eccentric Heel Drop');
  assert.ok(r.includes('Ankle/Foot'), r.join(','));
  assert.ok(!r.includes('Elbow/Wrist'), r.join(','));
  for(const n of ['Calf Raise', 'Standing Calf Raise', 'Tibialis Raise']) assert.ok(regionsOf(n).includes('Ankle/Foot'), n);
});

test('criterion 3: Leg Curl and Nordic Curl flag Knee; Neck Bridges flag Neck; Wall Balls and Sled Push flag Knee and Lower Back', (assert)=>{
  assert.ok(regionsOf('Leg Curl').includes('Knee'));
  assert.ok(regionsOf('Nordic Curl').includes('Knee'));
  assert.ok(regionsOf('Neck Bridges').includes('Neck'));
  for(const n of ['Wall Balls', 'Sled Push']){
    const r = regionsOf(n);
    assert.ok(r.includes('Knee') && r.includes('Lower Back'), n + ': ' + r.join(','));
  }
});

test('criterion 4: Bench Press returns exactly CATEGORY_TO_REGIONS.push; an unknown category returns []', (assert)=>{
  const r = sbx(`__capture.push({bench: regionsForExercise('Bench Press', exerciseInfo['Bench Press'].category), push: CATEGORY_TO_REGIONS.push,
    unknown: regionsForExercise('Nonexistent Move', 'not-a-category'), none: regionsForExercise('Nonexistent Move', undefined)});`);
  assert.deepStrictEqual(r.bench, r.push);
  assert.deepStrictEqual(r.unknown, []);
  assert.deepStrictEqual(r.none, []);
});

test('criterion 5: every EXERCISE_REGION_OVERRIDE key is an exerciseInfo key, and every region is a real Care region', (assert)=>{
  const r = sbx(`__capture.push({keys: Object.keys(EXERCISE_REGION_OVERRIDE), missing: Object.keys(EXERCISE_REGION_OVERRIDE).filter(k => !exerciseInfo[k]),
    regions: [...new Set(Object.values(EXERCISE_REGION_OVERRIDE).flat())]});`);
  assert.strictEqual(r.keys.length, 18, 'the audit\'s 12 plus BL-70\'s 6 (v3.523)');
  assert.deepStrictEqual(r.missing, []);
  // The Care region picker's own option labels (the strings resting regions are stored as).
  const picker = indexOnly.slice(indexOnly.indexOf('<select id="careRegion"'), indexOnly.indexOf('</select>', indexOnly.indexOf('<select id="careRegion"')));
  const careLabels = new Set([...picker.matchAll(/<option>([^<]+)<\/option>/g)].map(m => m[1].trim()));
  assert.ok(careLabels.has('Neck') && careLabels.has('Knee') && careLabels.size >= 10, 'read the real picker: ' + [...careLabels].join(','));
  for(const reg of r.regions) assert.ok(careLabels.has(reg), 'not a Care region label: ' + reg);
});

function stripLineComments(text){
  return text.split('\n').map(l => { const i = l.indexOf('//'); return i >= 0 && !/https?:$/.test(l.slice(0, i)) ? l.slice(0, i) : l; }).join('\n');
}

test('criterion 6: one CATEGORY_TO_REGIONS[ read (in the helper); regionsForExercise( called exactly twice, from the heads-up and from renderWorkout', (assert)=>{
  const code = stripLineComments(indexOnly);
  assert.strictEqual((code.match(/CATEGORY_TO_REGIONS\s*\[/g) || []).length, 1);
  assert.strictEqual((stripLineComments(extractFunction(src, 'regionsForExercise')).match(/CATEGORY_TO_REGIONS\s*\[/g) || []).length, 1);
  const calls = (code.match(/\bregionsForExercise\s*\(/g) || []).length - (code.match(/function\s+regionsForExercise\s*\(/g) || []).length;
  assert.strictEqual(calls, 2);
  for(const fn of ['getSessionHeadsUpInsight', 'renderWorkout']){
    const body = stripLineComments(extractFunction(src, fn));
    assert.strictEqual((body.match(/\bregionsForExercise\s*\(\s*ex\.name\s*,\s*info\.category\s*\)/g) || []).length, 1, fn + ' looks up by the (substituted) exercise name');
  }
});

// ---- v3.523 (BL-70): wider overrides, more twins, relief-aware cautions.
test('BL-70 criterion 1: Sled Push gains Ankle/Foot and Shins; Wall Balls gains Shoulder, Elbow/Wrist and Ankle/Foot', (assert)=>{
  const push = regionsOf('Sled Push'), balls = regionsOf('Wall Balls');
  for(const r of ['Knee','Hip','Ankle/Foot','Shins','Lower Back']) assert.ok(push.includes(r), 'Sled Push ' + r);
  for(const r of ['Knee','Hip','Lower Back','Shoulder','Elbow/Wrist','Ankle/Foot']) assert.ok(balls.includes(r), 'Wall Balls ' + r);
});

test('BL-70 criterion 2: Sled Pull, the three carries and the two hanging raises flag Hands/Fingers', (assert)=>{
  for(const n of ['Sled Pull', "Farmer's Carry", 'Farmers Carry (Heavy)', 'Suitcase Carry', 'Hanging Leg Raise', 'Toes-to-Bar']){
    const r = regionsOf(n);
    assert.ok(r.includes('Hands/Fingers') && r.includes('Elbow/Wrist'), n + ': ' + r.join(','));
  }
});

test('BL-70 criteria 3-4: isReliefForAllHits is true only when the move relieves EVERY hit region', (assert)=>{
  const r = sbx(`__capture.push([
    isReliefForAllHits('Tibialis Raise', ['Shins']),
    isReliefForAllHits('Tibialis Raise', ['Shins','Ankle/Foot']),
    isReliefForAllHits('Bird Dog', ['Lower Back']),
    isReliefForAllHits('Back Squat', ['Knee']),
    isReliefForAllHits('Eccentric Heel Drop', ['Ankle/Foot']),
    isReliefForAllHits('Bird Dog', []),
  ]);`);
  assert.deepStrictEqual(r, [true, false, true, false, true, false]);
});

test('BL-70 criterion 5: the row caution and the heads-up each call isReliefForAllHits once; the relief wording is in renderWorkout', (assert)=>{
  const code = stripLineComments(indexOnly);
  const all = (code.match(/\bisReliefForAllHits\s*\(/g) || []).length - (code.match(/function\s+isReliefForAllHits\s*\(/g) || []).length;
  assert.strictEqual(all, 2);
  for(const fn of ['getSessionHeadsUpInsight', 'renderWorkout'])
    assert.strictEqual((stripLineComments(extractFunction(src, fn)).match(/\bisReliefForAllHits\s*\(/g) || []).length, 1, fn);
  const rw = extractFunction(src, 'renderWorkout');
  // renderWorkout can't be driven whole in jsdom (see the header); the live
  // Playwright check in the PR renders these rows. Here: the branch's content.
  const reliefBranch = rw.slice(rw.indexOf('isReliefForAllHits('), rw.indexOf('} else if(hitRegions.length){'));
  assert.ok(reliefBranch.includes("gentle relief moves for ${areaWord}: keep it light and pain-free"), 'relief text');
  assert.ok(reliefBranch.includes('ex-caution-relief') && reliefBranch.includes("icon('info')"), 'distinct, non-warning look');
  assert.ok(!/suggestSubstitute|consider skipping|ex-ai-tailor-btn|hitRegionsForRow\s*=/.test(reliefBranch), 'no swap, no "consider skipping", no AI tailor');
});

// ---- v3.524 (BL-04): exercise-specific substitutes.
const subOf = (cat, name) => sbx(`__capture.push(suggestSubstitute(${JSON.stringify(cat)}, ${JSON.stringify(name)}));`);

test('BL-04 criterion 1: Eccentric Heel Drop gets the isometric calf hold, with its own reason', (assert)=>{
  assert.deepStrictEqual(subOf('arms', 'Eccentric Heel Drop'), {name: 'Isometric Calf Hold (wall-supported)', why: 'keeps the tendon loaded without movement'});
  for(const n of ['Calf Raise', 'Standing Calf Raise']) assert.strictEqual(subOf('arms', n).name, 'Isometric Calf Hold (wall-supported)', n);
});

test('BL-04 criterion 2: hangboard → Feet-on Hang; Neck Bridges → Neck Isometric; carries → (v3.525) vest walk first; hanging raises → Lying Leg Raise', (assert)=>{
  assert.strictEqual(subOf('pull', 'Hangboard Repeaters').name, 'Feet-on Hang (open hand)');
  assert.strictEqual(subOf('core', 'Neck Bridges').name, 'Neck Isometric (hand resistance)');
  for(const n of ["Farmer's Carry", 'Farmers Carry (Heavy)', 'Suitcase Carry']) assert.strictEqual(subOf('core', n).name, 'Vest or Backpack Walk (hands free)', n);
  for(const n of ['Hanging Leg Raise', 'Toes-to-Bar']) assert.strictEqual(subOf('core', n).name, 'Lying Leg Raise (floor)', n);
});

test('BL-04 criterion 3: an ordinary exercise keeps its category swap exactly as before', (assert)=>{
  assert.deepStrictEqual(subOf('arms', 'DB Curl'), {name: 'Wrist Flexor Stretch', why: 'lighter loading for a sensitive elbow or wrist'});
  assert.deepStrictEqual(subOf('squat', 'Back Squat'), {name: 'Wall Sit', why: 'reduces knee shear force and spinal loading'});
  assert.strictEqual(subOf('not-a-category', 'Mystery Move'), null);
});

test('BL-04 criterion 4: the substitute map and the region map list exactly the same exercises (both directions), all real', (assert)=>{
  const r = sbx(`__capture.push({sub: Object.keys(EXERCISE_SUBSTITUTE_OVERRIDE).sort(), reg: Object.keys(EXERCISE_REGION_OVERRIDE).sort(),
    unknown: Object.keys(EXERCISE_SUBSTITUTE_OVERRIDE).filter(k => !exerciseInfo[k])});`);
  assert.deepStrictEqual(r.sub, r.reg);
  assert.deepStrictEqual(r.unknown, []);
});

test('BL-04 review: an exercise-specific swap is offered only when it fits EVERY resting area hit', (assert)=>{
  const r = sbx(`__capture.push({
    hangFingers: suggestSubstitute('pull', 'Hangboard Repeaters', ['Hands/Fingers']),
    hangShoulder: suggestSubstitute('pull', 'Hangboard Repeaters', ['Shoulder']),
    raiseGrip: suggestSubstitute('core', 'Hanging Leg Raise', ['Hands/Fingers','Shoulder']),
    raiseBack: suggestSubstitute('core', 'Hanging Leg Raise', ['Lower Back']),
    carryHandsAndBack: suggestSubstitute('core', "Farmer's Carry", ['Hands/Fingers','Lower Back']),
    carryShoulder: suggestSubstitute('core', "Farmer's Carry", ['Shoulder']),
    calfAnkle: suggestSubstitute('arms', 'Calf Raise', ['Ankle/Foot','Shins']),
    squatKnee: suggestSubstitute('squat', 'Back Squat', ['Knee']),
  });`);
  assert.strictEqual(r.hangFingers.name, 'Feet-on Hang (open hand)');
  assert.strictEqual(r.hangShoulder, null, 'a feet-on hang still hangs from the shoulder');
  assert.strictEqual(r.raiseGrip.name, 'Lying Leg Raise (floor)');
  assert.strictEqual(r.raiseBack, null, 'a floor leg raise loads the lower back');
  assert.strictEqual(r.carryHandsAndBack, null, 'no single carry swap fits hands AND lower back (v3.525)');
  assert.strictEqual(r.carryShoulder.name, 'Vest or Backpack Walk (hands free)');
  assert.strictEqual(r.calfAnkle.name, 'Isometric Calf Hold (wall-supported)');
  assert.strictEqual(r.squatKnee.name, 'Wall Sit', 'category swaps ignore the hit list');
});

test('BL-04 criterion 5: both suggestSubstitute( call sites pass ex.name, with no leftover v3.522 guard', (assert)=>{
  const code = stripLineComments(indexOnly);
  const calls = [...code.matchAll(/\bsuggestSubstitute\s*\(([^)]*)\)/g)].filter(m => !/function\s+$/.test(code.slice(Math.max(0, m.index - 20), m.index)));
  assert.strictEqual(calls.length, 2);
  const third = calls.map(m => m[1].split(',').map(x => x.trim()));
  for(const a of third) assert.strictEqual(a[1], 'ex.name');
  assert.deepStrictEqual(third.map(a => a[2]).sort(), ['hitRegions', 'piece.hitRegionsForRow'], 'both pass the resting areas hit');
  assert.ok(!/EXERCISE_REGION_OVERRIDE\[ex\.name\]\s*\?\s*null/.test(code), 'the call-site guard is gone (suggestSubstitute decides)');
});

test('BL-04 criterion 6: Sled Push, Sled Pull, Wall Balls and the other overridden exercises without their own swap get none, never a category swap', (assert)=>{
  for(const [cat, n] of [['cardio', 'Sled Push'], ['cardio', 'Sled Pull'], ['cardio', 'Wall Balls'], ['hinge', 'Leg Curl'], ['hinge', 'Nordic Curl'], ['core', 'Tibialis Raise']]){
    assert.strictEqual(subOf(cat, n), null, n);
  }
});

// ---- v3.525 (BL-71): carry swaps by resting area (owner option a).
test('BL-71 criteria 1-3: carries pick their swap by resting area; hands + lower back gets none', (assert)=>{
  const r = sbx(`const c = ["Farmer's Carry", 'Farmers Carry (Heavy)', 'Suitcase Carry']; __capture.push(c.map(n => [
    suggestSubstitute('core', n, ['Hands/Fingers']), suggestSubstitute('core', n, ['Elbow/Wrist']),
    suggestSubstitute('core', n, ['Shoulder']), suggestSubstitute('core', n, ['Hands/Fingers','Elbow/Wrist','Shoulder']),
    suggestSubstitute('core', n, ['Lower Back']), suggestSubstitute('core', n, ['Hands/Fingers','Lower Back'])]));`);
  for(const row of r){
    for(const k of [0,1,2,3]) assert.strictEqual(row[k].name, 'Vest or Backpack Walk (hands free)');
    assert.deepStrictEqual(row[4], {name: 'Bird Dog', why: "keeps the bracing with no load on your spine, and it's one of Care's own lower-back moves"});
    assert.strictEqual(row[5], null);
  }
});

// Frozen from v3.524 (computed against origin/Branch-1 at 2be5d0c, before
// BL-71): every non-null single-area result for the non-carry overrides.
const V3524_SNAPSHOT = {"Eccentric Heel Drop@Shins":"Isometric Calf Hold (wall-supported)","Eccentric Heel Drop@Ankle/Foot":"Isometric Calf Hold (wall-supported)","Calf Raise@Shins":"Isometric Calf Hold (wall-supported)","Calf Raise@Ankle/Foot":"Isometric Calf Hold (wall-supported)","Standing Calf Raise@Shins":"Isometric Calf Hold (wall-supported)","Standing Calf Raise@Ankle/Foot":"Isometric Calf Hold (wall-supported)","Hangboard Max Hang@Hands/Fingers":"Feet-on Hang (open hand)","Hangboard Repeaters@Hands/Fingers":"Feet-on Hang (open hand)","Lock-off Hold@Hands/Fingers":"Feet-on Hang (open hand)","Neck Bridges@Upper Back":"Neck Isometric (hand resistance)","Neck Bridges@Neck":"Neck Isometric (hand resistance)","Hanging Leg Raise@Shoulder":"Lying Leg Raise (floor)","Hanging Leg Raise@Elbow/Wrist":"Lying Leg Raise (floor)","Hanging Leg Raise@Hands/Fingers":"Lying Leg Raise (floor)","Toes-to-Bar@Shoulder":"Lying Leg Raise (floor)","Toes-to-Bar@Elbow/Wrist":"Lying Leg Raise (floor)","Toes-to-Bar@Hands/Fingers":"Lying Leg Raise (floor)"};

test('BL-71 criterion 4: every non-carry override returns exactly what v3.524 did, for each single resting area (frozen snapshot)', (assert)=>{
  const r = sbx(`
    const areas = ['Shoulder','Elbow/Wrist','Upper Back','Chest','Lower Back','Hip','IT Band/Outer Thigh','Knee','Shins','Ankle/Foot','Neck','Hands/Fingers'];
    const out = {};
    for(const name of Object.keys(EXERCISE_SUBSTITUTE_OVERRIDE)){
      if(Array.isArray(EXERCISE_SUBSTITUTE_OVERRIDE[name])) continue;
      for(const a of areas){ const g = suggestSubstitute('core', name, [a]); if(g) out[name + '@' + a] = g.name; }
    }
    __capture.push({out, lists: Object.entries(EXERCISE_SUBSTITUTE_OVERRIDE).filter(([, v]) => Array.isArray(v)).map(([k]) => k).sort()});`);
  assert.deepStrictEqual(r.out, V3524_SNAPSHOT);
  assert.deepStrictEqual(r.lists, ["Farmer's Carry", 'Farmers Carry (Heavy)', 'Suitcase Carry'], 'only the carries use a list');
});

test('BL-71 review: the caution escapes the swap name and reason; Bird Dog really is one of Care\'s lower-back moves', (assert)=>{
  const rw = stripLineComments(extractFunction(src, 'renderWorkout'));
  assert.ok(/Try <b>\$\{escapeHtml\(sub\.name\)\}<\/b> instead — \$\{escapeHtml\(sub\.why\)\}/.test(rw), 'swap name and reason are escaped');
  const r = sbx(`__capture.push(REGION_RELIEF['Lower Back'].includes(SUB_BIRD_DOG.name));`);
  assert.strictEqual(r, true);
});

run();
