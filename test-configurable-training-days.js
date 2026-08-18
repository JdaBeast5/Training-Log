'use strict';
// Behavioral coverage for configurable training days/week — pilot scope
// agreed with the user: strength + bodybuilding only. Every other program's
// `days` must stay completely untouched by this feature.
//
// v2 (this version): the user explicitly asked for each day count to get
// its OWN hand-authored, frequency-appropriate plan rather than the earlier
// version's cycle-through-existing-days generator — see the
// PROGRAM_DAY_COUNT_VARIANTS comment in index.html for the reasoning (full
// body at low frequency per ACSM 2026/Currier et al.'s 2x/week-beats-1x
// finding already cited elsewhere in this program; dedicated accessory/
// conditioning days rather than a repeated session at 6-7 days). These
// tests check the DATA is real and complete (every count present, every
// count structurally sound, every count's content genuinely distinct — not
// a copy-paste with the day count changed) and that the runtime plumbing
// (load/save pref, applying it to the live `programs` object, the warning
// banner) works via real invocation.
//
// The delegated #daysPerWeekInput change-listener wiring itself is
// deliberately NOT unit-tested, matching this project's own established
// choice for this exact class of simple preference-toggle wiring (see
// test-manual-deload-override.js's identical note) — verified live in a
// browser instead. Every function that listener calls IS tested here.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const pureChunks = [
  extractConst(src, 'programs'),
  extractConst(src, 'DAYS_PER_WEEK_PROGRAMS'),
  extractConst(src, 'DAYS_PER_WEEK_STYLE_CONTAINERS'),
  extractConst(src, 'DAYS_PER_WEEK_ORIGINAL'),
  extractConst(src, 'DAYS_PER_WEEK_CONTAINER_DEFAULT'),
  extractConst(src, 'CYCLING_STYLES'),
  extractConst(src, 'COMBAT_STYLES'),
  extractConst(src, 'WATERSPORTS_STYLES'),
  'var activeCyclingStyle = "road";', // mirrors the real `let activeCyclingStyle = 'road';` default
  'var activeMartialArt = "kickboxing";', // mirrors the real `let activeMartialArt = 'kickboxing';` default
  'var activeWatersportsStyle = "surfing";', // mirrors the real `let activeWatersportsStyle = 'surfing';` default
  extractFunction(src, 'getStyleContainerAccessor'),
  extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
  extractFunction(src, 'daysPerWeekWarningState'),
];

const { test, run } = makeRunner('test-configurable-training-days.js');

// [Data completeness across all 7 counts, all rolled-out programs] ---------------
const ALL_COUNTS = [1,2,3,4,5,6,7];
const PROGRAMS_TO_CHECK = ['strength', 'bodybuilding', 'oly', 'powerlifting', 'powerbuilding', 'athletic', 'bodyweight', 'calisthenics', 'core', 'jumprope', 'mobility', 'running', 'swimming', 'climbing', 'senior', 'desk', 'pilates', 'boxingsc', 'hyrox', 'grappling'];

for(const programKey of PROGRAMS_TO_CHECK){
  for(const n of ALL_COUNTS){
    test(`${programKey} day-count ${n}: a real plan resolves (either an authored variant, or the program's own default for the intentionally-omitted count), with all 7 slots present`, (assert)=>{
      const [days] = runSandbox(pureChunks, `
        const variant = PROGRAM_DAY_COUNT_VARIANTS['${programKey}'][${n}];
        const resolved = variant || DAYS_PER_WEEK_ORIGINAL['${programKey}'];
        __capture.push(resolved.days);
      `);
      assert.strictEqual(Object.keys(days).length, 7, 'must always be exactly d1..d7');
      ['d1','d2','d3','d4','d5','d6','d7'].forEach(key => {
        assert.ok(days[key], `missing ${key}`);
        assert.ok(days[key].sub, `${key} missing a sub-label`);
        if(!days[key].rest){
          assert.ok(Array.isArray(days[key].exercises) && days[key].exercises.length > 0, `${key} is a training day but has no exercises`);
        }
      });
    });
  }
}

test('sabotage: strength day-count 4 is the intentionally-omitted default — PROGRAM_DAY_COUNT_VARIANTS.strength has no key "4"', (assert)=>{
  const [has4] = runSandbox(pureChunks, `__capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.strength, '4'));`);
  assert.strictEqual(has4, false);
});

test('sabotage: bodybuilding day-count 5 is the intentionally-omitted default — PROGRAM_DAY_COUNT_VARIANTS.bodybuilding has no key "5"', (assert)=>{
  const [has5] = runSandbox(pureChunks, `__capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.bodybuilding, '5'));`);
  assert.strictEqual(has5, false);
});

test('strength day-count 4 (falling back to the original) is byte-identical to the program\'s own shipped default — selecting 4 must not change anything for existing users', (assert)=>{
  const [matches] = runSandbox(pureChunks, `
    __capture.push(JSON.stringify(DAYS_PER_WEEK_ORIGINAL.strength.days) === JSON.stringify(programs.strength.days));
  `);
  assert.strictEqual(matches, true);
});

test('bodybuilding day-count 5 (falling back to the original) is byte-identical to the program\'s own shipped default', (assert)=>{
  const [matches] = runSandbox(pureChunks, `
    __capture.push(JSON.stringify(DAYS_PER_WEEK_ORIGINAL.bodybuilding.days) === JSON.stringify(programs.bodybuilding.days));
  `);
  assert.strictEqual(matches, true);
});

// Two counts per program are deliberately EXCLUDED from "train-day count ==
// n" below, and both are real design decisions, not bugs:
//  - the intentionally-omitted default (4 for strength, 5 for every other
//    rolled-out program so far) falls back to the program's own pre-existing
//    authored content, which predates this feature. Strength's original
//    counts Day 6 "Active Recovery" as a non-rest day (it has real
//    exercises) even though it reads as a 5th quasi-training day — that's an
//    existing, previously-shipped authoring choice this feature doesn't
//    relitigate.
//  - n=7 for every rolled-out program deliberately keeps the SAME real
//    training days as n=6 (see the "6 and 7 keep the same days" sabotage
//    tests below) rather than inventing a 7th hard session — the remaining
//    slot is reframed as a light mobility/cardio (or, for oly specifically,
//    still-bar-free-on-purpose) day instead. So n=7's real training-day
//    count matches n=6's, not 7.
const OMITTED_DEFAULT_COUNT = { strength: 4, bodybuilding: 5, oly: 5, powerlifting: 5, powerbuilding: 5, athletic: 5, bodyweight: 5, calisthenics: 5, core: 5, jumprope: 5, mobility: 5, running: 5, swimming: 5, climbing: 5, senior: 5, desk: 5, pilates: 5, boxingsc: 5, hyrox: 5, grappling: 5 };
for(const programKey of PROGRAMS_TO_CHECK){
  test(`${programKey}: every hand-authored day-count's TRAINING day count actually matches the count selected (n=3 really has 3 non-rest days, not some other number)`, (assert)=>{
    const [results] = runSandbox(pureChunks, `
      const out = {};
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS['${programKey}'][n];
        if(!variant) continue;
        out[n] = Object.values(variant.days).filter(d=>!d.rest).length;
      }
      __capture.push(out);
    `);
    for(const n of ALL_COUNTS){
      if(n === OMITTED_DEFAULT_COUNT[programKey]) continue; // no authored variant to check
      const expected = (n === 7) ? 6 : n; // n=7 deliberately shares n=6's 6 training days
      assert.strictEqual(results[n], expected, `n=${n} should have exactly ${expected} training days, got ${results[n]}`);
    }
  });
}

for(const programKey of PROGRAMS_TO_CHECK){
  test(`${programKey}: all 7 day-count plans have genuinely distinct overview text (sabotage: catches a copy-paste-without-editing mistake across counts)`, (assert)=>{
    const [overviews] = runSandbox(pureChunks, `
      const out = [];
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS['${programKey}'][n] || DAYS_PER_WEEK_ORIGINAL['${programKey}'];
        out.push(variant.overview);
      }
      __capture.push(out);
    `);
    assert.strictEqual(overviews.length, 7);
    assert.strictEqual(new Set(overviews).size, 7, 'expected 7 distinct overview strings, found duplicates');
    overviews.forEach(o => assert.ok(o && o.length > 40, 'overview text looks too short to be a real description'));
  });
}

for(const programKey of PROGRAMS_TO_CHECK){
  test(`sabotage: ${programKey}'s 6-day and 7-day plans keep the SAME real training days (7 does not add an 8th kind of session, per the user's explicit accessory-days-not-repeats decision)`, (assert)=>{
    const [subs6, subs7] = runSandbox(pureChunks, `
      const subsOf = (days) => Object.values(days).filter(d=>!d.rest).map(d=>d.sub).sort();
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS['${programKey}'][6].days));
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS['${programKey}'][7].days));
    `);
    assert.deepStrictEqual(subs6, subs7);
  });
}

// [Cycling — the first style-variant container] -----------------------------
// Cycling is structurally different from every program in PROGRAMS_TO_CHECK
// above: `programs.cycling.days` isn't fixed content, it's swapped at
// runtime per sub-style (Road/Mountain) from CYCLING_STYLES. So
// PROGRAM_DAY_COUNT_VARIANTS.cycling is keyed by sub-style FIRST, then day
// count (cycling.road[n], not cycling[n]) -- deliberately NOT added to
// PROGRAMS_TO_CHECK, since every loop above assumes the flat {1..7} shape
// and would either silently check the wrong thing or throw against a
// nested one. Same coverage, adapted to the real shape.
const CYCLING_STYLES_TO_CHECK = ['road', 'mountain'];
const CYCLING_OMITTED_DEFAULT_COUNT = 5; // both styles' own default is a 5-day week

for(const style of CYCLING_STYLES_TO_CHECK){
  for(const n of ALL_COUNTS){
    test(`cycling.${style} day-count ${n}: a real plan resolves (either an authored variant, or the style's own default for the intentionally-omitted count), with all 7 slots present`, (assert)=>{
      const [days] = runSandbox(pureChunks, `
        const variant = PROGRAM_DAY_COUNT_VARIANTS.cycling['${style}'][${n}];
        const resolved = variant || CYCLING_STYLES['${style}'];
        __capture.push(resolved.days);
      `);
      assert.strictEqual(Object.keys(days).length, 7, 'must always be exactly d1..d7');
      ['d1','d2','d3','d4','d5','d6','d7'].forEach(key => {
        assert.ok(days[key], `missing ${key}`);
        assert.ok(days[key].sub, `${key} missing a sub-label`);
        if(!days[key].rest){
          assert.ok(Array.isArray(days[key].exercises) && days[key].exercises.length > 0, `${key} is a training day but has no exercises`);
        }
      });
    });
  }
}

for(const style of CYCLING_STYLES_TO_CHECK){
  test(`cycling.${style}: every hand-authored day-count's TRAINING day count actually matches the count selected`, (assert)=>{
    const [results] = runSandbox(pureChunks, `
      const out = {};
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS.cycling['${style}'][n];
        if(!variant) continue;
        out[n] = Object.values(variant.days).filter(d=>!d.rest).length;
      }
      __capture.push(out);
    `);
    for(const n of ALL_COUNTS){
      if(n === CYCLING_OMITTED_DEFAULT_COUNT) continue;
      const expected = (n === 7) ? 6 : n;
      assert.strictEqual(results[n], expected, `n=${n} should have exactly ${expected} training days, got ${results[n]}`);
    }
  });

  test(`sabotage: cycling.${style} day-count 5 is the intentionally-omitted default — PROGRAM_DAY_COUNT_VARIANTS.cycling.${style} has no key "5"`, (assert)=>{
    const [has5] = runSandbox(pureChunks, `__capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.cycling['${style}'], '5'));`);
    assert.strictEqual(has5, false);
  });

  test(`cycling.${style}: all 7 day-count plans have genuinely distinct overview text (sabotage: catches a copy-paste-without-editing mistake across counts)`, (assert)=>{
    const [overviews] = runSandbox(pureChunks, `
      const out = [];
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS.cycling['${style}'][n] || CYCLING_STYLES['${style}'];
        out.push(variant.overview);
      }
      __capture.push(out);
    `);
    assert.strictEqual(overviews.length, 7);
    assert.strictEqual(new Set(overviews).size, 7, 'expected 7 distinct overview strings, found duplicates');
    overviews.forEach(o => assert.ok(o && o.length > 40, 'overview text looks too short to be a real description'));
  });

  test(`sabotage: cycling.${style}'s 6-day and 7-day plans keep the SAME real training days`, (assert)=>{
    const [subs6, subs7] = runSandbox(pureChunks, `
      const subsOf = (days) => Object.values(days).filter(d=>!d.rest).map(d=>d.sub).sort();
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.cycling['${style}'][6].days));
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.cycling['${style}'][7].days));
    `);
    assert.deepStrictEqual(subs6, subs7);
  });
}

test('sabotage: cycling.road\'s 6-day and 7-day extra day is "Extra Easy Ride", never a 4th hard-interval day — proving the "polarized mostly-easy week" design decision landed in the data', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.cycling.road[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.cycling.road[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.cycling.road[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Easy Ride');
  assert.strictEqual(sub7, 'Extra Easy Ride');
  ['FTP Intervals', 'Hill Repeats (seated climbing)', 'Sprint Intervals (Bike)'].forEach(hardEx => {
    assert.strictEqual(exNames6.includes(hardEx), false, `cycling.road's 7th day should contain no hard-interval exercise, found ${hardEx}`);
  });
});

test('sabotage: cycling.mountain\'s 6-day and 7-day extra day is "Extra Technical Trail Time", never a 2nd punchy power-interval day — proving the "skill work over more intervals" design decision landed in the data', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.cycling.mountain[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.cycling.mountain[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.cycling.mountain[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Technical Trail Time');
  assert.strictEqual(sub7, 'Extra Technical Trail Time');
  ['Standing Climb Repeats', 'Sprint Intervals (Bike)'].forEach(hardEx => {
    assert.strictEqual(exNames6.includes(hardEx), false, `cycling.mountain's 7th day should contain no punchy power-interval exercise, found ${hardEx}`);
  });
});

test('sabotage: cycling is deliberately NOT in the flat PROGRAMS_TO_CHECK/OMITTED_DEFAULT_COUNT shape — PROGRAM_DAY_COUNT_VARIANTS.cycling has no numeric-keyed day count directly on it, only sub-style keys', (assert)=>{
  const [hasNumeric, hasStyleKeys] = runSandbox(pureChunks, `
    __capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.cycling, '1'));
    __capture.push(['road','mountain'].every(k => Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.cycling, k)));
  `);
  assert.strictEqual(hasNumeric, false, 'cycling must not have a flat day-count key — it would silently shadow the real nested style-keyed shape');
  assert.strictEqual(hasStyleKeys, true);
});

// [Combat — the second style-variant container] ------------------------------
// Same nested-by-sub-style shape as cycling, now generalized behind
// getStyleContainerAccessor(). Deliberately NOT added to PROGRAMS_TO_CHECK
// for the same reason cycling wasn't -- the flat-shape loops above would
// either check the wrong thing or throw against a nested one.
const COMBAT_STYLES_TO_CHECK = ['kickboxing', 'boxing', 'muayThai', 'mma', 'taekwondo', 'taiChi'];
const COMBAT_OMITTED_DEFAULT_COUNT = 5; // every style's own default is a 5-day week

for(const style of COMBAT_STYLES_TO_CHECK){
  for(const n of ALL_COUNTS){
    test(`combat.${style} day-count ${n}: a real plan resolves (either an authored variant, or the style's own default for the intentionally-omitted count), with all 7 slots present`, (assert)=>{
      const [days] = runSandbox(pureChunks, `
        const variant = PROGRAM_DAY_COUNT_VARIANTS.combat['${style}'][${n}];
        const resolved = variant || COMBAT_STYLES['${style}'];
        __capture.push(resolved.days);
      `);
      assert.strictEqual(Object.keys(days).length, 7, 'must always be exactly d1..d7');
      ['d1','d2','d3','d4','d5','d6','d7'].forEach(key => {
        assert.ok(days[key], `missing ${key}`);
        assert.ok(days[key].sub, `${key} missing a sub-label`);
        if(!days[key].rest){
          assert.ok(Array.isArray(days[key].exercises) && days[key].exercises.length > 0, `${key} is a training day but has no exercises`);
        }
      });
    });
  }
}

for(const style of COMBAT_STYLES_TO_CHECK){
  test(`combat.${style}: every hand-authored day-count's TRAINING day count actually matches the count selected`, (assert)=>{
    const [results] = runSandbox(pureChunks, `
      const out = {};
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS.combat['${style}'][n];
        if(!variant) continue;
        out[n] = Object.values(variant.days).filter(d=>!d.rest).length;
      }
      __capture.push(out);
    `);
    for(const n of ALL_COUNTS){
      if(n === COMBAT_OMITTED_DEFAULT_COUNT) continue;
      const expected = (n === 7) ? 6 : n;
      assert.strictEqual(results[n], expected, `n=${n} should have exactly ${expected} training days, got ${results[n]}`);
    }
  });

  test(`sabotage: combat.${style} day-count 5 is the intentionally-omitted default — PROGRAM_DAY_COUNT_VARIANTS.combat.${style} has no key "5"`, (assert)=>{
    const [has5] = runSandbox(pureChunks, `__capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.combat['${style}'], '5'));`);
    assert.strictEqual(has5, false);
  });

  test(`combat.${style}: all 7 day-count plans have genuinely distinct overview text (sabotage: catches a copy-paste-without-editing mistake across counts)`, (assert)=>{
    const [overviews] = runSandbox(pureChunks, `
      const out = [];
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS.combat['${style}'][n] || COMBAT_STYLES['${style}'];
        out.push(variant.overview);
      }
      __capture.push(out);
    `);
    assert.strictEqual(overviews.length, 7);
    assert.strictEqual(new Set(overviews).size, 7, 'expected 7 distinct overview strings, found duplicates');
    overviews.forEach(o => assert.ok(o && o.length > 40, 'overview text looks too short to be a real description'));
  });

  test(`sabotage: combat.${style}'s 6-day and 7-day plans keep the SAME real training days`, (assert)=>{
    const [subs6, subs7] = runSandbox(pureChunks, `
      const subsOf = (days) => Object.values(days).filter(d=>!d.rest).map(d=>d.sub).sort();
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.combat['${style}'][6].days));
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.combat['${style}'][7].days));
    `);
    assert.deepStrictEqual(subs6, subs7);
  });
}

test('sabotage: combat.muayThai\'s 6-day and 7-day extra day contains ZERO clinch or elbow work — proving the "real injury risk, keep it off the extra day" design decision landed in the data', (assert)=>{
  const [sub6, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.muayThai[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.muayThai[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Conditioning & Hip Mobility');
  ['Clinch Knee Drills', 'Elbow Strike Drills'].forEach(riskyEx => {
    assert.strictEqual(exNames6.includes(riskyEx), false, `muayThai's 7th day should contain no clinch/elbow work, found ${riskyEx}`);
  });
});

test('sabotage: combat.mma\'s 6-day and 7-day extra day contains ZERO Ground & Pound or Sprawl work — proving the "aerobic recovery, not more high-impact ground work" design decision landed in the data', (assert)=>{
  const [sub6, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.mma[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.mma[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Aerobic Conditioning & Mobility');
  ['Ground & Pound Drills', 'Sprawl Drills'].forEach(riskyEx => {
    assert.strictEqual(exNames6.includes(riskyEx), false, `mma's 7th day should contain no ground-and-pound/sprawl work, found ${riskyEx}`);
  });
});

test('sabotage: combat.taekwondo\'s 6-day and 7-day extra day is genuinely flexibility-focused, not another kicking-power session — proving the "kick performance is built on rest days" design decision landed in the data', (assert)=>{
  const [sub6, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.taekwondo[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.taekwondo[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Flexibility & Footwork');
  const heavyBagExercises = exNames6.filter(name => name.startsWith('Heavy Bag'));
  assert.strictEqual(heavyBagExercises.length, 0, `taekwondo's 7th day should contain no heavy-bag work, found ${heavyBagExercises.join(', ')}`);
});

test('sabotage: combat.taiChi\'s 6-day and 7-day extra day is real practice content (Zhan Zhuang / Qigong), not a copy-pasted mobility filler from an unrelated program', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.taiChi[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.taiChi[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.combat.taiChi[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Standing Meditation & Breath Work');
  assert.strictEqual(sub7, 'Extra Standing Meditation & Breath Work');
  assert.strictEqual(exNames6.includes('Zhan Zhuang (Standing Post)'), true, 'expected real tai chi practice content, not generic filler');
});

test('sabotage: combat.taiChi\'s Push Hands & Sensitivity (the one day needing a training partner) is deferred to n=4 and up, not assumed available at n=1-3', (assert)=>{
  const [has1, has2, has3, has4] = runSandbox(pureChunks, `
    const subsOf = (n) => Object.values(PROGRAM_DAY_COUNT_VARIANTS.combat.taiChi[n].days).map(d=>d.sub);
    __capture.push(subsOf(1).includes('Push Hands & Sensitivity'));
    __capture.push(subsOf(2).includes('Push Hands & Sensitivity'));
    __capture.push(subsOf(3).includes('Push Hands & Sensitivity'));
    __capture.push(subsOf(4).includes('Push Hands & Sensitivity'));
  `);
  assert.strictEqual(has1, false);
  assert.strictEqual(has2, false);
  assert.strictEqual(has3, false);
  assert.strictEqual(has4, true, 'Push Hands & Sensitivity should appear once the day budget allows it, starting at n=4');
});

test('sabotage: combat is deliberately NOT in the flat PROGRAMS_TO_CHECK/OMITTED_DEFAULT_COUNT shape — PROGRAM_DAY_COUNT_VARIANTS.combat has no numeric-keyed day count directly on it, only sub-style keys', (assert)=>{
  const [hasNumeric, hasStyleKeys] = runSandbox(pureChunks, `
    __capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.combat, '1'));
    __capture.push(${JSON.stringify(COMBAT_STYLES_TO_CHECK)}.every(k => Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.combat, k)));
  `);
  assert.strictEqual(hasNumeric, false, 'combat must not have a flat day-count key — it would silently shadow the real nested style-keyed shape');
  assert.strictEqual(hasStyleKeys, true);
});

// [Watersports — the third style-variant container] --------------------------
// Same nested-by-sub-style shape as cycling/combat, generalized behind
// getStyleContainerAccessor(). Deliberately NOT added to PROGRAMS_TO_CHECK
// for the same reason cycling/combat weren't -- the flat-shape loops above
// would either check the wrong thing or throw against a nested one.
const WATERSPORTS_STYLES_TO_CHECK = ['surfing', 'skimboarding', 'wakeboarding', 'kiteAssisted', 'sup', 'kayaking'];
const WATERSPORTS_OMITTED_DEFAULT_COUNT = 5; // every discipline's own default is a 5-day week

for(const style of WATERSPORTS_STYLES_TO_CHECK){
  for(const n of ALL_COUNTS){
    test(`watersports.${style} day-count ${n}: a real plan resolves (either an authored variant, or the style's own default for the intentionally-omitted count), with all 7 slots present`, (assert)=>{
      const [days] = runSandbox(pureChunks, `
        const variant = PROGRAM_DAY_COUNT_VARIANTS.watersports['${style}'][${n}];
        const resolved = variant || WATERSPORTS_STYLES['${style}'];
        __capture.push(resolved.days);
      `);
      assert.strictEqual(Object.keys(days).length, 7, 'must always be exactly d1..d7');
      ['d1','d2','d3','d4','d5','d6','d7'].forEach(key => {
        assert.ok(days[key], `missing ${key}`);
        assert.ok(days[key].sub, `${key} missing a sub-label`);
        if(!days[key].rest){
          assert.ok(Array.isArray(days[key].exercises) && days[key].exercises.length > 0, `${key} is a training day but has no exercises`);
        }
      });
    });
  }
}

for(const style of WATERSPORTS_STYLES_TO_CHECK){
  test(`watersports.${style}: every hand-authored day-count's TRAINING day count actually matches the count selected`, (assert)=>{
    const [results] = runSandbox(pureChunks, `
      const out = {};
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS.watersports['${style}'][n];
        if(!variant) continue;
        out[n] = Object.values(variant.days).filter(d=>!d.rest).length;
      }
      __capture.push(out);
    `);
    for(const n of ALL_COUNTS){
      if(n === WATERSPORTS_OMITTED_DEFAULT_COUNT) continue;
      const expected = (n === 7) ? 6 : n;
      assert.strictEqual(results[n], expected, `n=${n} should have exactly ${expected} training days, got ${results[n]}`);
    }
  });

  test(`sabotage: watersports.${style} day-count 5 is the intentionally-omitted default — PROGRAM_DAY_COUNT_VARIANTS.watersports.${style} has no key "5"`, (assert)=>{
    const [has5] = runSandbox(pureChunks, `__capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.watersports['${style}'], '5'));`);
    assert.strictEqual(has5, false);
  });

  test(`watersports.${style}: all 7 day-count plans have genuinely distinct overview text (sabotage: catches a copy-paste-without-editing mistake across counts)`, (assert)=>{
    const [overviews] = runSandbox(pureChunks, `
      const out = [];
      for(const n of [1,2,3,4,5,6,7]){
        const variant = PROGRAM_DAY_COUNT_VARIANTS.watersports['${style}'][n] || WATERSPORTS_STYLES['${style}'];
        out.push(variant.overview);
      }
      __capture.push(out);
    `);
    assert.strictEqual(overviews.length, 7);
    assert.strictEqual(new Set(overviews).size, 7, 'expected 7 distinct overview strings, found duplicates');
    overviews.forEach(o => assert.ok(o && o.length > 40, 'overview text looks too short to be a real description'));
  });

  test(`sabotage: watersports.${style}'s 6-day and 7-day plans keep the SAME real training days`, (assert)=>{
    const [subs6, subs7] = runSandbox(pureChunks, `
      const subsOf = (days) => Object.values(days).filter(d=>!d.rest).map(d=>d.sub).sort();
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.watersports['${style}'][6].days));
      __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.watersports['${style}'][7].days));
    `);
    assert.deepStrictEqual(subs6, subs7);
  });
}

test('sabotage: watersports.surfing\'s 6-day and 7-day extra day contains ZERO of the exercises this program\'s own citation flags for shoulder-injury risk (Box Jump, Broad Jump, Single-Leg Bound)', (assert)=>{
  const [sub6, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.surfing[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.surfing[6].days.d7.exercises.map(e=>e.name));
  `);
  ['Box Jump', 'Broad Jump', 'Single-Leg Bound'].forEach(riskyEx => {
    assert.strictEqual(exNames6.includes(riskyEx), false, `surfing's extra day should contain none of its own high-injury-risk exercises, found ${riskyEx}`);
  });
  assert.ok(sub6 && sub6.length > 0);
});

test('sabotage: watersports.skimboarding\'s 6-day and 7-day extra day contains ZERO of the exercises this program\'s own citation flags for the dominant ankle/wrist-fracture mechanisms (Sprint Intervals, Depth Jump, Single-Leg Bound)', (assert)=>{
  const [exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.skimboarding[6].days.d7.exercises.map(e=>e.name));
  `);
  ['Sprint Intervals', 'Depth Jump', 'Single-Leg Bound'].forEach(riskyEx => {
    assert.strictEqual(exNames6.includes(riskyEx), false, `skimboarding's extra day should contain none of its own high-injury-risk exercises, found ${riskyEx}`);
  });
});

test('sabotage: watersports.wakeboarding\'s 6-day and 7-day extra day contains ZERO of the exercises this program\'s own citation flags for the 42.3% ACL-tear rate (Box Jump, Broad Jump)', (assert)=>{
  const [exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.wakeboarding[6].days.d7.exercises.map(e=>e.name));
  `);
  ['Box Jump', 'Broad Jump'].forEach(riskyEx => {
    assert.strictEqual(exNames6.includes(riskyEx), false, `wakeboarding's extra day should contain none of its own high-injury-risk exercises, found ${riskyEx}`);
  });
});

test('sabotage: watersports.kiteAssisted\'s 6-day and 7-day extra day contains ZERO of the exercises this program\'s own citation flags for its 64%-of-lower-extremity ankle-injury rate (Box Jump, Depth Jump, Broad Jump)', (assert)=>{
  const [sub6, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.kiteAssisted[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.kiteAssisted[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Core Endurance & Grip');
  ['Box Jump', 'Depth Jump', 'Broad Jump'].forEach(riskyEx => {
    assert.strictEqual(exNames6.includes(riskyEx), false, `kiteAssisted's extra day should contain none of its own high-injury-risk exercises, found ${riskyEx}`);
  });
});

test('sabotage: watersports.sup\'s 6-day and 7-day extra day is genuinely "Extra Shoulder Health & Core Endurance" content, not a repeat of the closing Full-Body Aerobic Endurance Conditioning day\'s exercises', (assert)=>{
  const [sub6, sub7, exNames6, exNamesClosing] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.sup[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.sup[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.sup[6].days.d7.exercises.map(e=>e.name));
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.sup[6].days.d6.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Shoulder Health & Core Endurance');
  assert.strictEqual(sub7, 'Extra Shoulder Health & Core Endurance');
  exNames6.forEach(name => {
    assert.strictEqual(exNamesClosing.includes(name), false, `sup's extra day should not repeat the closing aerobic day's exercise "${name}"`);
  });
});

test('sabotage: watersports.kayaking\'s 6-day and 7-day extra day is genuinely "Extra Shoulder Health & Core Endurance" content, not a repeat of the closing Rotational Power & Full-Body Conditioning day\'s exercises', (assert)=>{
  const [sub6, sub7, exNames6, exNamesClosing] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.kayaking[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.kayaking[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.kayaking[6].days.d7.exercises.map(e=>e.name));
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.watersports.kayaking[6].days.d6.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Shoulder Health & Core Endurance');
  assert.strictEqual(sub7, 'Extra Shoulder Health & Core Endurance');
  exNames6.forEach(name => {
    assert.strictEqual(exNamesClosing.includes(name), false, `kayaking's extra day should not repeat the closing rotational-power day's exercise "${name}"`);
  });
});

test('sabotage: watersports is deliberately NOT in the flat PROGRAMS_TO_CHECK/OMITTED_DEFAULT_COUNT shape — PROGRAM_DAY_COUNT_VARIANTS.watersports has no numeric-keyed day count directly on it, only sub-style keys', (assert)=>{
  const [hasNumeric, hasStyleKeys] = runSandbox(pureChunks, `
    __capture.push(Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.watersports, '1'));
    __capture.push(${JSON.stringify(WATERSPORTS_STYLES_TO_CHECK)}.every(k => Object.prototype.hasOwnProperty.call(PROGRAM_DAY_COUNT_VARIANTS.watersports, k)));
  `);
  assert.strictEqual(hasNumeric, false, 'watersports must not have a flat day-count key — it would silently shadow the real nested style-keyed shape');
  assert.strictEqual(hasStyleKeys, true);
});

test('sabotage: strength\'s 7-day plan reframes the rest slot as light mobility/cardio, NOT a full-rest day and NOT a 7th hard session', (assert)=>{
  const [day3] = runSandbox(pureChunks, `__capture.push(PROGRAM_DAY_COUNT_VARIANTS.strength[7].days.d3);`);
  assert.strictEqual(day3.rest, true, 'must still be a light/rest-style day, not a hard session');
  assert.notStrictEqual(day3.plateNum, 'OFF', 'must not be a true zero-activity full-rest day either');
});

test('sabotage: oly is never made "safe" by silently dropping to full rest at high frequency — its light day is still tagged rest:true but keeps a real, program-specific reasoning note distinct from a generic rest day', (assert)=>{
  const [note] = runSandbox(pureChunks, `__capture.push(PROGRAM_DAY_COUNT_VARIANTS.oly[7].days.d3.note);`);
  assert.match(note, /bar-free on purpose/, 'expected the oly-specific frequency-vs-recovery reasoning, not a generic rest note');
});

test('sabotage: powerlifting keeps the deadlift on a genuinely LOWER volume than squat/bench at 1 day/week — verifying the documented "deadlift is treated conservatively" design decision actually landed in the data, not just the prose', (assert)=>{
  const [setsFor] = runSandbox(pureChunks, `
    const day = PROGRAM_DAY_COUNT_VARIANTS.powerlifting[1].days.d1;
    const totalSets = (name) => {
      const ex = day.exercises.find(e => e.name === name);
      const m = /^(\\d+)/.exec(ex.sets);
      return m ? parseInt(m[1], 10) : NaN;
    };
    __capture.push({ squat: totalSets('Squat'), bench: totalSets('Bench Press'), deadlift: totalSets('Deadlift') });
  `);
  assert.ok(setsFor.deadlift < setsFor.squat, `deadlift sets (${setsFor.deadlift}) should be fewer than squat sets (${setsFor.squat})`);
  assert.ok(setsFor.deadlift < setsFor.bench, `deadlift sets (${setsFor.deadlift}) should be fewer than bench sets (${setsFor.bench})`);
});

test('sabotage: calisthenics makes the SAME "recovery argument wins" choice as oly at 7 days, but with its own genuinely different reasoning (joint safety, not skill-frequency evidence quality) — proving this isn\'t a copy-pasted note between the two programs', (assert)=>{
  const [note] = runSandbox(pureChunks, `__capture.push(PROGRAM_DAY_COUNT_VARIANTS.calisthenics[7].days.d3.note);`);
  assert.match(note, /joints/i, 'expected calisthenics\' own joint-safety reasoning');
  assert.doesNotMatch(note, /bar-free/i, 'must not be oly\'s wording copy-pasted in — calisthenics has no barbell to begin with');
});

test('sabotage: running\'s 6-day and 7-day plans never add a 3rd hard-quality session — Tempo Run and Interval Training each appear exactly once across the training days, proving the "cap hard sessions at 2" claim landed in the data, not just the prose', (assert)=>{
  const [subs6, subs7] = runSandbox(pureChunks, `
    const subsOf = (days) => Object.values(days).filter(d=>!d.rest).map(d=>d.sub);
    __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.running[6].days));
    __capture.push(subsOf(PROGRAM_DAY_COUNT_VARIANTS.running[7].days));
  `);
  [subs6, subs7].forEach(subs => {
    assert.strictEqual(subs.filter(s => s === 'Tempo Run').length, 1);
    assert.strictEqual(subs.filter(s => s === 'Interval Training').length, 1);
  });
});

test('sabotage: climbing\'s 6-day and 7-day new accessory days add ZERO extra Hangboard Max Hang (the hardest finger-loading exercise) — proving the "no added finger loading at high frequency" claim landed in the data', (assert)=>{
  const [day7Names] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.climbing[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(day7Names.includes('Hangboard Max Hang'), false);
});

test('sabotage: mobility does NOT reuse the "recovery argument wins" framing from oly/calisthenics at 7 days — its own citation (frequency doesn\'t drive ROM gains) makes that argument inapplicable, and the note text proves this wasn\'t copy-pasted', (assert)=>{
  const [note] = runSandbox(pureChunks, `__capture.push(PROGRAM_DAY_COUNT_VARIANTS.mobility[7].days.d3.note);`);
  assert.doesNotMatch(note, /bar-free|joints that make/i, 'must not be oly\'s or calisthenics\' wording copy-pasted in');
});

test('mobility\'s day-count overviews are honest that frequency itself doesn\'t drive extra range-of-motion gains, per this program\'s own cited research', (assert)=>{
  const [overviews] = runSandbox(pureChunks, `
    __capture.push([1,2,6,7].map(n => PROGRAM_DAY_COUNT_VARIANTS.mobility[n].overview));
  `);
  overviews.forEach((o, i) => assert.match(o, /frequency|consistency|Konrad/i, `mobility variant overview #${i} should acknowledge frequency isn't the driver here`));
});

test('sabotage: senior\'s 6-day and 7-day extra day is "Extra Balance Practice", never a 3rd strength day — proving the "balance tolerates higher frequency than heavy strength" design decision landed in the data, not just the prose', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.senior[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.senior[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.senior[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Balance Practice');
  assert.strictEqual(sub7, 'Extra Balance Practice');
  ['Sit-to-Stand', 'Bodyweight Squat', 'Calf Raise'].forEach(strengthEx => {
    assert.strictEqual(exNames6.includes(strengthEx), false, `senior's 7th day should contain no heavy/loaded strength exercise, found ${strengthEx}`);
  });
});

test('sabotage: desk\'s "Rest / Movement Snacks" note text is byte-identical across every day-count variant — proving the "this habit is unchanged by day count" claim in every overview actually holds in the data, not just the prose', (assert)=>{
  const [notes] = runSandbox(pureChunks, `
    const notesFor = (n) => Object.values(PROGRAM_DAY_COUNT_VARIANTS.desk[n].days)
      .filter(d => d.sub === 'Rest / Movement Snacks')
      .map(d => d.note);
    __capture.push([1,2,3,4,6,7].flatMap(notesFor));
  `);
  assert.ok(notes.length > 0, 'expected at least one Rest / Movement Snacks day across all variants');
  notes.forEach((note, i) => assert.strictEqual(note, notes[0], `desk variant note #${i} should be byte-identical to the first`));
});

test('sabotage: pilates\'s 6-day and 7-day new day is "Breath & Control Refinement" and contains zero ballistic Teaser content — proving the "fatigue degrades precision, so the extra day stays low-fatigue" design decision landed in the data', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.pilates[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.pilates[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.pilates[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Breath & Control Refinement');
  assert.strictEqual(sub7, 'Breath & Control Refinement');
  assert.strictEqual(exNames6.some(name => /Teaser/i.test(name)), false, 'pilates\'s 7th day should contain zero ballistic Teaser content');
});

test('sabotage: boxingsc\'s 6-day and 7-day extra day is "Extra Round Conditioning", never a 2nd max-power/CNS-taxing session — proving the "conditioning tolerates the extra frequency, power doesn\'t" design decision landed in the data', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.boxingsc[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.boxingsc[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.boxingsc[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Round Conditioning');
  assert.strictEqual(sub7, 'Extra Round Conditioning');
  ['Power Clean', 'Box Jump', 'Med Ball Rotational Throw', 'Bench Press'].forEach(powerEx => {
    assert.strictEqual(exNames6.includes(powerEx), false, `boxingsc's 7th day should contain no max-power/CNS-taxing exercise, found ${powerEx}`);
  });
});

test('sabotage: hyrox\'s 6-day and 7-day extra day is "Easy Aerobic Engine", never a 2nd Full Simulation/brick session — proving the "no 2nd high-intensity day" design decision landed in the data', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.hyrox[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.hyrox[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.hyrox[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Easy Aerobic Engine');
  assert.strictEqual(sub7, 'Easy Aerobic Engine');
  ['Farmers Carry (Heavy)', '400m Repeats', 'Sandbag Lunges', 'Wall Balls'].forEach(hardEx => {
    assert.strictEqual(exNames6.includes(hardEx), false, `hyrox's 7th day should contain no hard-effort/station exercise, found ${hardEx}`);
  });
});

test('sabotage: grappling\'s 6-day and 7-day extra day is "Extra Technical Drilling", never a 2nd live-rolling session — proving the "drilling tolerates the extra frequency, live rolling doesn\'t" design decision landed in the data', (assert)=>{
  const [sub6, sub7, exNames6] = runSandbox(pureChunks, `
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.grappling[6].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.grappling[7].days.d7.sub);
    __capture.push(PROGRAM_DAY_COUNT_VARIANTS.grappling[6].days.d7.exercises.map(e=>e.name));
  `);
  assert.strictEqual(sub6, 'Extra Technical Drilling');
  assert.strictEqual(sub7, 'Extra Technical Drilling');
  ['Positional Sparring (Guard Retention)', 'Neck Bridges', 'Farmers Carry (Heavy)'].forEach(rollingEx => {
    assert.strictEqual(exNames6.includes(rollingEx), false, `grappling's 7th day should contain no live-rolling exercise, found ${rollingEx}`);
  });
});

test('every oly day-count variant is honest about evidence quality (coaching consensus, not RCT), matching this program\'s own established convention', (assert)=>{
  const [overviews] = runSandbox(pureChunks, `
    __capture.push([1,2,3,4,6,7].map(n => PROGRAM_DAY_COUNT_VARIANTS.oly[n].overview));
  `);
  overviews.forEach((o, i) => assert.match(o, /coaching|consensus|RCT/i, `oly variant overview #${i} should acknowledge the weaker evidence base, like the rest of this program does`));
});

test('sabotage: the medical/rehab programs are NEVER added to DAYS_PER_WEEK_PROGRAMS — a permanent safety exclusion, not a "not yet" gap. Regression guard against someone casually adding it back in a future rollout batch.', (assert)=>{
  const [hasMedical] = runSandbox(pureChunks, `__capture.push(DAYS_PER_WEEK_PROGRAMS.includes('medical'));`);
  assert.strictEqual(hasMedical, false);
});

test('bodybuilding\'s 6-day Push/Pull/Legs ×2 plan uses genuinely different exercises between the A and B session for the same pattern (sabotage: catches a literal copy-paste "B" session)', (assert)=>{
  const [pushA, pushB] = runSandbox(pureChunks, `
    const namesOf = (day) => day.exercises.map(e=>e.name).sort();
    __capture.push(namesOf(PROGRAM_DAY_COUNT_VARIANTS.bodybuilding[6].days.d1));
    __capture.push(namesOf(PROGRAM_DAY_COUNT_VARIANTS.bodybuilding[6].days.d5));
  `);
  const overlap = pushA.filter(name => pushB.includes(name));
  assert.strictEqual(overlap.length, 0, `Push A and Push B should share zero identical exercises, found: ${overlap.join(', ')}`);
});

// Found via user review, not authored test-first: strength's 5/6/7-day
// "Accessory & Weak Points" day (d6) originally repeated Hip Thrust from
// the immediately preceding "Lower · Hypertrophy" day (d5) -- two
// back-to-back training days with zero rest between them, hitting the same
// exercise twice. It also contradicted the accessory day's own stated
// purpose (covering what four heavy days leave short -- hamstrings, rear
// delts, arms -- not repeating something d5 already covers). Fixed by
// dropping Hip Thrust from d6; Leg Curl/Face Pull/Lateral Raise/DB
// Curl/Triceps Pushdown already matched that stated purpose without it.
for(const n of [5, 6, 7]){
  test(`sabotage: strength's ${n}-day "Accessory & Weak Points" day (d6) shares ZERO exercises with the immediately preceding "Lower · Hypertrophy" day (d5) -- these run back-to-back with no rest between them, so any overlap is real same-exercise overload, not just a coincidence`, (assert)=>{
    const [namesD5, namesD6] = runSandbox(pureChunks, `
      __capture.push(PROGRAM_DAY_COUNT_VARIANTS.strength[${n}].days.d5.exercises.map(e=>e.name));
      __capture.push(PROGRAM_DAY_COUNT_VARIANTS.strength[${n}].days.d6.exercises.map(e=>e.name));
    `);
    const overlap = namesD5.filter(name => namesD6.includes(name));
    assert.strictEqual(overlap.length, 0, `d5 and d6 should share zero exercises, found: ${overlap.join(', ')}`);
    assert.strictEqual(namesD6.includes('Hip Thrust'), false, 'Hip Thrust specifically must not be back on the accessory day — d5 already covers it');
  });
}

// [Body-goal focus exercises reach the new accessory/high-frequency days] --------
// The user asked for the extra accessory days (added at 5-7 days/week) to
// align with a person's body goal. Rather than building a second, competing
// goal-selection system, this reuses the app's OWN existing one:
// getBodyGoalFocusExercises(bodyGoal, program, day) already adds 1-2
// goal-specific bonus exercises to whatever day is being rendered, for any
// program in FOCUS_ELIGIBLE_PROGRAMS -- and all 5 programs rolled out so far
// (strength, bodybuilding, oly, powerlifting, powerbuilding) are already in
// that list, from before this feature existed. Since the mechanism operates
// on whatever `day` object renderWorkout hands it, with no knowledge of
// where that day came from, it already reaches the NEW accessory days added
// by PROGRAM_DAY_COUNT_VARIANTS with zero extra code -- these tests prove
// that integration point actually holds, real invocation, not by reasoning
// about the code.
//
// Nothing tested getBodyGoalFocusExercises/BODY_GOAL_FOCUS at all before this
// -- a real, pre-existing gap, noted here rather than silently backfilled in
// full (that's a larger, separate testing gap than this feature's scope).
const bodyGoalChunks = [
  ...pureChunks,
  extractConst(src, 'BODY_GOAL_FOCUS'),
  extractConst(src, 'FOCUS_ELIGIBLE_PROGRAMS'),
  extractFunction(src, 'getBodyGoalFocusExercises'),
];

// Batches 1-3 (strength, bodybuilding, oly, powerlifting, powerbuilding,
// athletic, bodyweight, calisthenics) are exactly FOCUS_ELIGIBLE_PROGRAMS'
// membership, so their extra accessory days align with body goals for
// free. Batch 4 (core, jumprope, mobility), batch 6 (senior, desk,
// pilates), batch 7 (boxingsc, hyrox, grappling), batch 8 (cycling), and
// batch 9 (combat) are deliberately NOT in that list -- these are the two
// disjoint groups, checked separately. (Batch 5 -- running, swimming,
// climbing -- isn't in either check list; also not in
// FOCUS_ELIGIBLE_PROGRAMS, but that batch didn't add the corresponding
// negative-case coverage. Pre-existing gap, noted rather than silently
// backfilled here.)
const FOCUS_ELIGIBLE_BATCH = ['strength', 'bodybuilding', 'oly', 'powerlifting', 'powerbuilding', 'athletic', 'bodyweight', 'calisthenics'];
const NON_FOCUS_ELIGIBLE_BATCH = ['core', 'jumprope', 'mobility', 'senior', 'desk', 'pilates', 'boxingsc', 'hyrox', 'grappling', 'cycling', 'combat', 'watersports'];

test('FOCUS_ELIGIBLE_PROGRAMS already covers the first 8 programs rolled out — the reason their extra accessory days align with body goals for free', (assert)=>{
  const [results] = runSandbox(bodyGoalChunks, `
    __capture.push(PROGRAMS_PLACEHOLDER.map(p => FOCUS_ELIGIBLE_PROGRAMS.includes(p)));
  `.replace('PROGRAMS_PLACEHOLDER', JSON.stringify(FOCUS_ELIGIBLE_BATCH)));
  results.forEach((included, i) => assert.strictEqual(included, true, `${FOCUS_ELIGIBLE_BATCH[i]} should be in FOCUS_ELIGIBLE_PROGRAMS`));
});

test('sabotage: core/jumprope/mobility are deliberately NOT in FOCUS_ELIGIBLE_PROGRAMS — a specialization/conditioning/flexibility program isn\'t where an aesthetic body-goal add-on belongs, per that list\'s own existing comment', (assert)=>{
  const [results] = runSandbox(bodyGoalChunks, `
    __capture.push(PROGRAMS_PLACEHOLDER.map(p => FOCUS_ELIGIBLE_PROGRAMS.includes(p)));
  `.replace('PROGRAMS_PLACEHOLDER', JSON.stringify(NON_FOCUS_ELIGIBLE_BATCH)));
  results.forEach((included, i) => assert.strictEqual(included, false, `${NON_FOCUS_ELIGIBLE_BATCH[i]} should NOT be in FOCUS_ELIGIBLE_PROGRAMS`));
});

test('REAL invocation: a body goal adds its focus exercise to a NEW accessory day (strength\'s 6-day "Accessory & Weak Points"), skipping whichever focus exercise that day already happens to include', (assert)=>{
  const [added] = runSandbox(bodyGoalChunks, `
    const day = PROGRAM_DAY_COUNT_VARIANTS.strength[6].days.d6; // Accessory & Weak Points — already has Lateral Raise
    __capture.push(getBodyGoalFocusExercises('Classic Muscular (Classic Physique style)', 'strength', day).map(e=>e.name));
  `);
  assert.deepStrictEqual(added, ['Lat Pulldown'], 'Lateral Raise should be skipped as a duplicate; Lat Pulldown (not already on this day) should be added');
});

test('REAL invocation: the same mechanism reaches powerbuilding\'s NEW "Arms & Weak Points" 7-day accessory day', (assert)=>{
  const [added] = runSandbox(bodyGoalChunks, `
    const day = PROGRAM_DAY_COUNT_VARIANTS.powerbuilding[7].days.d7; // Arms & Weak Points
    __capture.push(getBodyGoalFocusExercises('Maximum Size (Open Bodybuilding style)', 'powerbuilding', day).map(e=>e.name));
  `);
  // That day already has Skull Crushers/Cable Curl for arms but no calf work —
  // Maximum Size's focus is DB Curl + Standing Calf Raise, so DB Curl (a
  // different curl variation, not a literal name match) is added alongside
  // Standing Calf Raise.
  assert.deepStrictEqual(added.sort(), ['DB Curl', 'Standing Calf Raise'].sort());
});

test('REAL invocation: oly\'s NEW "Light Technical Practice" day still gets a body-goal focus exercise added — pre-existing app behavior (oly was already FOCUS_ELIGIBLE before this feature), not something this feature changed', (assert)=>{
  const [added] = runSandbox(bodyGoalChunks, `
    const day = PROGRAM_DAY_COUNT_VARIANTS.oly[6].days.d7; // Light Technical Practice
    __capture.push(getBodyGoalFocusExercises('Athletic Performance', 'oly', day).map(e=>e.name));
  `);
  assert.deepStrictEqual(added, ['Plank', 'Box Jump']);
});

test('a rest day among the new variants (e.g. strength\'s 7-day "Mobility & Easy Cardio") never gets a body-goal focus exercise added, matching this app\'s existing rest-day exemption', (assert)=>{
  const [added] = runSandbox(bodyGoalChunks, `
    const day = PROGRAM_DAY_COUNT_VARIANTS.strength[7].days.d3; // Mobility & Easy Cardio, rest:true
    __capture.push(getBodyGoalFocusExercises('Maximum Size (Open Bodybuilding style)', 'strength', day));
  `);
  assert.deepStrictEqual(added, []);
});

// [daysPerWeekWarningState] -------------------------------------------------------
test('daysPerWeekWarningState no longer has a "repeats" concept — every count now has real, non-repeating content, so the shape is just {advisory}', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('strength', 7));`);
  assert.strictEqual(state.repeats, undefined);
  assert.strictEqual(state.advisory, true);
});

test('daysPerWeekWarningState: 4 and 5 days never trigger the advisory', (assert)=>{
  const [s4, s5] = runSandbox(pureChunks, `
    __capture.push(daysPerWeekWarningState('strength', 4));
    __capture.push(daysPerWeekWarningState('bodybuilding', 5));
  `);
  assert.strictEqual(s4.advisory, false);
  assert.strictEqual(s5.advisory, false);
});

test('daysPerWeekWarningState: null pref never warns', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('strength', null));`);
  assert.strictEqual(state.advisory, false);
});

test('daysPerWeekWarningState: a program outside the rollout never warns even at 7 days', (assert)=>{
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('medical', 7));`);
  assert.strictEqual(state.advisory, false);
});

// [applyDaysPerWeekProgramData] -------------------------------------------------
const applyChunks = [
  ...pureChunks,
  'var daysPerWeekPref = null;',
  extractFunction(src, 'applyDaysPerWeekProgramData'),
];

test('applyDaysPerWeekProgramData with pref=null (untouched) leaves programs.strength.days/.overview/.short as the EXACT SAME reference as the original default', (assert)=>{
  const [daysSame, overviewSame, shortSame] = runSandbox(applyChunks, `
    applyDaysPerWeekProgramData();
    __capture.push(programs.strength.days === DAYS_PER_WEEK_ORIGINAL.strength.days);
    __capture.push(programs.strength.overview === DAYS_PER_WEEK_ORIGINAL.strength.overview);
    __capture.push(programs.strength.short === DAYS_PER_WEEK_ORIGINAL.strength.short);
  `);
  assert.strictEqual(daysSame, true);
  assert.strictEqual(overviewSame, true);
  assert.strictEqual(shortSame, true);
});

test('applyDaysPerWeekProgramData with a real pref set regenerates days AND overview/short to match that count\'s authored variant', (assert)=>{
  const [daysMatch, overviewMatch, shortMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 3;
    applyDaysPerWeekProgramData();
    const variant = PROGRAM_DAY_COUNT_VARIANTS.strength[3];
    __capture.push(JSON.stringify(programs.strength.days) === JSON.stringify(variant.days));
    __capture.push(programs.strength.overview === variant.overview);
    __capture.push(programs.strength.short === variant.short);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewMatch, true);
  assert.strictEqual(shortMatch, true);
});

test('sabotage: applyDaysPerWeekProgramData NEVER touches a program outside DAYS_PER_WEEK_PROGRAMS, even with a pref set', (assert)=>{
  const [sameRef, sameOverview] = runSandbox(applyChunks, `
    const medicalDaysBefore = programs.medical.days;
    const medicalOverviewBefore = programs.medical.overview;
    daysPerWeekPref = 7;
    applyDaysPerWeekProgramData();
    __capture.push(programs.medical.days === medicalDaysBefore);
    __capture.push(programs.medical.overview === medicalOverviewBefore);
  `);
  assert.strictEqual(sameRef, true);
  assert.strictEqual(sameOverview, true);
});

// [applyDaysPerWeekProgramData — cycling's style-container branch] --------------
// Cycling needs its own coverage here: unlike every flat program above,
// `.days` always follows the active sub-style (pref or no pref), while
// `.overview`/`.short` only swap to the variant's text once a real
// day-count variant is active -- otherwise they must revert to the
// container's own generic blurb (DAYS_PER_WEEK_CONTAINER_DEFAULT), NOT the
// sub-style's blurb. Getting this wrong either regresses cycling's
// pre-existing pref-unset behavior (main card would start describing
// "Road" specifically instead of "pick a style below") or silently
// discards the day-count pref on every style switch.
test('applyDaysPerWeekProgramData with pref=null: cycling.days follows the active style (CYCLING_STYLES.road), but .overview/.short stay the container\'s own generic blurb, NOT the style\'s blurb', (assert)=>{
  const [daysMatch, overviewIsContainer, shortIsContainer, overviewIsNotStyle] = runSandbox(applyChunks, `
    applyDaysPerWeekProgramData();
    __capture.push(JSON.stringify(programs.cycling.days) === JSON.stringify(CYCLING_STYLES.road.days));
    __capture.push(programs.cycling.overview === DAYS_PER_WEEK_CONTAINER_DEFAULT.cycling.overview);
    __capture.push(programs.cycling.short === DAYS_PER_WEEK_CONTAINER_DEFAULT.cycling.short);
    __capture.push(programs.cycling.overview !== CYCLING_STYLES.road.overview);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewIsContainer, true);
  assert.strictEqual(shortIsContainer, true);
  assert.strictEqual(overviewIsNotStyle, true);
});

test('applyDaysPerWeekProgramData with a real pref set: cycling.days/.overview/.short all regenerate to match the active style\'s authored variant', (assert)=>{
  const [daysMatch, overviewMatch, shortMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData();
    const variant = PROGRAM_DAY_COUNT_VARIANTS.cycling.road[6];
    __capture.push(JSON.stringify(programs.cycling.days) === JSON.stringify(variant.days));
    __capture.push(programs.cycling.overview === variant.overview);
    __capture.push(programs.cycling.short === variant.short);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewMatch, true);
  assert.strictEqual(shortMatch, true);
});

test('REAL invocation: switching activeCyclingStyle from road to mountain and reapplying keeps the SAME day-count pref instead of silently discarding it', (assert)=>{
  const [daysMatchMountain6, notRoad6] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData(); // road, 6 days
    activeCyclingStyle = 'mountain';
    applyDaysPerWeekProgramData(); // style switch -- must reapply the same pref, not clobber .days with the raw style default
    const mountainVariant = PROGRAM_DAY_COUNT_VARIANTS.cycling.mountain[6];
    const roadVariant = PROGRAM_DAY_COUNT_VARIANTS.cycling.road[6];
    __capture.push(JSON.stringify(programs.cycling.days) === JSON.stringify(mountainVariant.days));
    __capture.push(JSON.stringify(programs.cycling.days) !== JSON.stringify(roadVariant.days));
  `);
  assert.strictEqual(daysMatchMountain6, true, 'day count 6 must survive the style switch, applied to the NEW style\'s own 6-day variant');
  assert.strictEqual(notRoad6, true, 'must not still be showing road\'s 6-day plan after switching to mountain');
});

test('sabotage: cycling day-count 5 (the intentionally-omitted default) falls back to the active style\'s own CYCLING_STYLES days, not some other style or a stale value', (assert)=>{
  const [daysMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 5;
    applyDaysPerWeekProgramData();
    __capture.push(JSON.stringify(programs.cycling.days) === JSON.stringify(CYCLING_STYLES.road.days));
  `);
  assert.strictEqual(daysMatch, true);
});

// [applyDaysPerWeekProgramData — combat's style-container branch] ---------------
// Same coverage as cycling above, now proving getStyleContainerAccessor()'s
// generalization actually works for a SECOND container, not just the one it
// was extracted from.
test('applyDaysPerWeekProgramData with pref=null: combat.days follows the active style (COMBAT_STYLES.kickboxing), but .overview/.short stay the container\'s own generic blurb, NOT the style\'s blurb', (assert)=>{
  const [daysMatch, overviewIsContainer, shortIsContainer, overviewIsNotStyle] = runSandbox(applyChunks, `
    applyDaysPerWeekProgramData();
    __capture.push(JSON.stringify(programs.combat.days) === JSON.stringify(COMBAT_STYLES.kickboxing.days));
    __capture.push(programs.combat.overview === DAYS_PER_WEEK_CONTAINER_DEFAULT.combat.overview);
    __capture.push(programs.combat.short === DAYS_PER_WEEK_CONTAINER_DEFAULT.combat.short);
    __capture.push(programs.combat.overview !== COMBAT_STYLES.kickboxing.overview);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewIsContainer, true);
  assert.strictEqual(shortIsContainer, true);
  assert.strictEqual(overviewIsNotStyle, true);
});

test('applyDaysPerWeekProgramData with a real pref set: combat.days/.overview/.short all regenerate to match the active style\'s authored variant', (assert)=>{
  const [daysMatch, overviewMatch, shortMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData();
    const variant = PROGRAM_DAY_COUNT_VARIANTS.combat.kickboxing[6];
    __capture.push(JSON.stringify(programs.combat.days) === JSON.stringify(variant.days));
    __capture.push(programs.combat.overview === variant.overview);
    __capture.push(programs.combat.short === variant.short);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewMatch, true);
  assert.strictEqual(shortMatch, true);
});

test('REAL invocation: switching activeMartialArt from kickboxing to taiChi and reapplying keeps the SAME day-count pref instead of silently discarding it', (assert)=>{
  const [daysMatchTaiChi6, notKickboxing6] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData(); // kickboxing, 6 days
    activeMartialArt = 'taiChi';
    applyDaysPerWeekProgramData(); // style switch -- must reapply the same pref, not clobber .days with the raw style default
    const taiChiVariant = PROGRAM_DAY_COUNT_VARIANTS.combat.taiChi[6];
    const kickboxingVariant = PROGRAM_DAY_COUNT_VARIANTS.combat.kickboxing[6];
    __capture.push(JSON.stringify(programs.combat.days) === JSON.stringify(taiChiVariant.days));
    __capture.push(JSON.stringify(programs.combat.days) !== JSON.stringify(kickboxingVariant.days));
  `);
  assert.strictEqual(daysMatchTaiChi6, true, 'day count 6 must survive the style switch, applied to the NEW style\'s own 6-day variant');
  assert.strictEqual(notKickboxing6, true, 'must not still be showing kickboxing\'s 6-day plan after switching to taiChi');
});

test('sabotage: combat day-count 5 (the intentionally-omitted default) falls back to the active style\'s own COMBAT_STYLES days, not some other style or a stale value', (assert)=>{
  const [daysMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 5;
    applyDaysPerWeekProgramData();
    __capture.push(JSON.stringify(programs.combat.days) === JSON.stringify(COMBAT_STYLES.kickboxing.days));
  `);
  assert.strictEqual(daysMatch, true);
});

// [applyDaysPerWeekProgramData — watersports's style-container branch] ----------
// Same coverage as cycling/combat above, now proving getStyleContainerAccessor()'s
// generalization actually works for a THIRD container.
test('applyDaysPerWeekProgramData with pref=null: watersports.days follows the active style (WATERSPORTS_STYLES.surfing), but .overview/.short stay the container\'s own generic blurb, NOT the style\'s blurb', (assert)=>{
  const [daysMatch, overviewIsContainer, shortIsContainer, overviewIsNotStyle] = runSandbox(applyChunks, `
    applyDaysPerWeekProgramData();
    __capture.push(JSON.stringify(programs.watersports.days) === JSON.stringify(WATERSPORTS_STYLES.surfing.days));
    __capture.push(programs.watersports.overview === DAYS_PER_WEEK_CONTAINER_DEFAULT.watersports.overview);
    __capture.push(programs.watersports.short === DAYS_PER_WEEK_CONTAINER_DEFAULT.watersports.short);
    __capture.push(programs.watersports.overview !== WATERSPORTS_STYLES.surfing.overview);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewIsContainer, true);
  assert.strictEqual(shortIsContainer, true);
  assert.strictEqual(overviewIsNotStyle, true);
});

test('applyDaysPerWeekProgramData with a real pref set: watersports.days/.overview/.short all regenerate to match the active style\'s authored variant', (assert)=>{
  const [daysMatch, overviewMatch, shortMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData();
    const variant = PROGRAM_DAY_COUNT_VARIANTS.watersports.surfing[6];
    __capture.push(JSON.stringify(programs.watersports.days) === JSON.stringify(variant.days));
    __capture.push(programs.watersports.overview === variant.overview);
    __capture.push(programs.watersports.short === variant.short);
  `);
  assert.strictEqual(daysMatch, true);
  assert.strictEqual(overviewMatch, true);
  assert.strictEqual(shortMatch, true);
});

test('REAL invocation: switching activeWatersportsStyle from surfing to kayaking and reapplying keeps the SAME day-count pref instead of silently discarding it', (assert)=>{
  const [daysMatchKayaking6, notSurfing6] = runSandbox(applyChunks, `
    daysPerWeekPref = 6;
    applyDaysPerWeekProgramData(); // surfing, 6 days
    activeWatersportsStyle = 'kayaking';
    applyDaysPerWeekProgramData(); // style switch -- must reapply the same pref, not clobber .days with the raw style default
    const kayakingVariant = PROGRAM_DAY_COUNT_VARIANTS.watersports.kayaking[6];
    const surfingVariant = PROGRAM_DAY_COUNT_VARIANTS.watersports.surfing[6];
    __capture.push(JSON.stringify(programs.watersports.days) === JSON.stringify(kayakingVariant.days));
    __capture.push(JSON.stringify(programs.watersports.days) !== JSON.stringify(surfingVariant.days));
  `);
  assert.strictEqual(daysMatchKayaking6, true, 'day count 6 must survive the style switch, applied to the NEW style\'s own 6-day variant');
  assert.strictEqual(notSurfing6, true, 'must not still be showing surfing\'s 6-day plan after switching to kayaking');
});

test('sabotage: watersports day-count 5 (the intentionally-omitted default) falls back to the active style\'s own WATERSPORTS_STYLES days, not some other style or a stale value', (assert)=>{
  const [daysMatch] = runSandbox(applyChunks, `
    daysPerWeekPref = 5;
    applyDaysPerWeekProgramData();
    __capture.push(JSON.stringify(programs.watersports.days) === JSON.stringify(WATERSPORTS_STYLES.surfing.days));
  `);
  assert.strictEqual(daysMatch, true);
});

// [loadDaysPerWeekPref / saveDaysPerWeekPref] ------------------------------------
// Real `window` is only available under jsdom (a bare vm context has none),
// and these functions read/write window.storage — so, matching this
// project's own established pattern for async-storage functions (see
// test-whats-new.js's identical shape), these run under runJsdom and the
// test awaits a short real delay for the fired async call to finish before
// asserting on the resulting window state.
function storageGlobals(initialStore){
  return `
    var daysPerWeekPref = null;
    window.storage = {
      __store: ${JSON.stringify(initialStore)},
      __deletedKeys: [],
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('not found');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
      delete: async (key)=>{ delete window.storage.__store[key]; window.storage.__deletedKeys.push(key); },
    };
  `;
}

const loadSaveChunks = [
  ...pureChunks,
  extractFunction(src, 'applyDaysPerWeekProgramData'),
  extractFunction(src, 'loadDaysPerWeekPref'),
  extractFunction(src, 'saveDaysPerWeekPref'),
];

// `programs`/`DAYS_PER_WEEK_ORIGINAL`/`PROGRAM_DAY_COUNT_VARIANTS` are
// declared `const` in the real source, so — unlike `var` — they never
// become properties of `window` under jsdom's real <script> execution; this
// exposure line is the only way for the test, running outside that script,
// to read them back afterward.
const exposeGlobals = 'window.__programs = programs; window.__daysPerWeekOriginal = DAYS_PER_WEEK_ORIGINAL; window.__variants = PROGRAM_DAY_COUNT_VARIANTS;';

test('REAL invocation: loadDaysPerWeekPref with nothing ever stored leaves the pref null and programs.strength unchanged from its own default', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), loadSaveChunks.concat(['loadDaysPerWeekPref();', exposeGlobals]));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.daysPerWeekPref, null);
  assert.strictEqual(window.__programs.strength.days, window.__daysPerWeekOriginal.strength.days);
});

test('REAL invocation: loadDaysPerWeekPref with a real stored value regenerates the pilot program\'s days AND overview to match that count\'s real plan', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({ 'days-per-week-pref': '2' }), loadSaveChunks.concat(['loadDaysPerWeekPref();', exposeGlobals]));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.daysPerWeekPref, 2);
  assert.strictEqual(window.__programs.strength.overview, window.__variants.strength[2].overview);
  assert.strictEqual(Object.values(window.__programs.strength.days).filter(d=>!d.rest).length, 2);
});

test('REAL invocation: an out-of-range stored value (e.g. "9") is rejected — pref stays null, program stays on its own default', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({ 'days-per-week-pref': '9' }), loadSaveChunks.concat(['loadDaysPerWeekPref();', exposeGlobals]));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.daysPerWeekPref, null);
  assert.strictEqual(window.__programs.strength.days, window.__daysPerWeekOriginal.strength.days);
});

test('REAL invocation: saveDaysPerWeekPref(6) writes the value to storage and updates the in-memory pref', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({}), loadSaveChunks.concat(['saveDaysPerWeekPref(6);']));
  await new Promise(res => setTimeout(res, 20));
  assert.strictEqual(window.storage.__store['days-per-week-pref'], '6');
  assert.strictEqual(window.daysPerWeekPref, 6);
});

test('REAL invocation: saveDaysPerWeekPref(null) DELETES the stored key (this is how "leave blank to reset to default" actually works) rather than writing a bogus value', async (assert)=>{
  const { window } = runJsdom('', storageGlobals({ 'days-per-week-pref': '6' }), loadSaveChunks.concat(['saveDaysPerWeekPref(null);']));
  await new Promise(res => setTimeout(res, 20));
  assert.deepStrictEqual([...window.storage.__deletedKeys], ['days-per-week-pref']);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(window.storage.__store, 'days-per-week-pref'), false);
});

// [DOM: Profile input markup + warning banner] -----------------------------------
const inputHtml = extractElementById(src, 'prefDaysPerWeek');

test('the Profile "Training days per week" input matches the existing customProgDays precedent: number input, min=1, max=7', (assert)=>{
  assert.match(inputHtml, /id="daysPerWeekInput"/);
  assert.match(inputHtml, /type="number"/);
  assert.match(inputHtml, /min="1"/);
  assert.match(inputHtml, /max="7"/);
  const inputCount = (inputHtml.match(/<input\b/g) || []).length;
  assert.strictEqual(inputCount, 1, 'sabotage anchor: exactly one input in this block');
});

test('the Profile card ships an (initially hidden) daysPerWeekWarning container for the advisory banner', (assert)=>{
  assert.match(inputHtml, /id="daysPerWeekWarning"/);
  assert.match(inputHtml, /style="display:none"/);
});

const warningDomChunks = [
  extractFunction(src, 'escapeHtml'),
  ...pureChunks,
  'var daysPerWeekPref = null;',
  'var activeProgram = "strength";',
  extractFunction(src, 'renderDaysPerWeekWarning'),
];

test('REAL invocation: renderDaysPerWeekWarning shows nothing when there is nothing to warn about', (assert)=>{
  const { window } = runJsdom(inputHtml, '', warningDomChunks.concat([
    'renderDaysPerWeekWarning();',
  ]));
  const el = window.document.getElementById('daysPerWeekWarning');
  assert.strictEqual(el.style.display, 'none');
  assert.strictEqual(el.innerHTML.trim(), '');
});

test('REAL invocation: renderDaysPerWeekWarning renders a collapsible banner (reusing the existing .program-basis-toggle/.smooth-toggle pattern, not a new bespoke toggle) at 6+ days', (assert)=>{
  const { window } = runJsdom(inputHtml, '', warningDomChunks.concat([
    'daysPerWeekPref = 7;',
    'renderDaysPerWeekWarning();',
  ]));
  const el = window.document.getElementById('daysPerWeekWarning');
  assert.notStrictEqual(el.style.display, 'none');
  assert.ok(el.querySelector('.program-basis-toggle'), 'must reuse the existing collapsible-toggle pattern so it can be minimized');
  assert.ok(el.querySelector('.smooth-toggle'), 'must reuse the existing collapsible-panel pattern');
  assert.match(el.textContent, /at least one full rest day/);
});

test('REAL invocation: switching from 7 back to a safe value (4) clears the previously-rendered warning rather than leaving it stuck', (assert)=>{
  const { window } = runJsdom(inputHtml, '', warningDomChunks.concat([
    'daysPerWeekPref = 7;',
    'renderDaysPerWeekWarning();',
    'daysPerWeekPref = 4;',
    'renderDaysPerWeekWarning();',
  ]));
  const el = window.document.getElementById('daysPerWeekWarning');
  assert.strictEqual(el.style.display, 'none');
  assert.strictEqual(el.innerHTML.trim(), '');
});

run();
