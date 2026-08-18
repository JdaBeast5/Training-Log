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
  extractConst(src, 'DAYS_PER_WEEK_ORIGINAL'),
  extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
  extractFunction(src, 'daysPerWeekWarningState'),
];

const { test, run } = makeRunner('test-configurable-training-days.js');

// [Data completeness across all 7 counts, all rolled-out programs] ---------------
const ALL_COUNTS = [1,2,3,4,5,6,7];
const PROGRAMS_TO_CHECK = ['strength', 'bodybuilding', 'oly', 'powerlifting', 'powerbuilding', 'athletic', 'bodyweight', 'calisthenics'];

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
const OMITTED_DEFAULT_COUNT = { strength: 4, bodybuilding: 5, oly: 5, powerlifting: 5, powerbuilding: 5, athletic: 5, bodyweight: 5, calisthenics: 5 };
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

test('FOCUS_ELIGIBLE_PROGRAMS already covers all 5 programs rolled out so far — the reason the extra accessory days align with body goals for free', (assert)=>{
  const [results] = runSandbox(bodyGoalChunks, `
    __capture.push(PROGRAMS_TO_CHECK_PLACEHOLDER.map(p => FOCUS_ELIGIBLE_PROGRAMS.includes(p)));
  `.replace('PROGRAMS_TO_CHECK_PLACEHOLDER', JSON.stringify(PROGRAMS_TO_CHECK)));
  results.forEach((included, i) => assert.strictEqual(included, true, `${PROGRAMS_TO_CHECK[i]} should be in FOCUS_ELIGIBLE_PROGRAMS`));
});

test('REAL invocation: a body goal adds its focus exercise to a NEW accessory day (strength\'s 6-day "Accessory & Weak Points"), skipping whichever focus exercise that day already happens to include', (assert)=>{
  const [added] = runSandbox(bodyGoalChunks, `
    const day = PROGRAM_DAY_COUNT_VARIANTS.strength[6].days.d6; // Accessory & Weak Points — already has Hip Thrust
    __capture.push(getBodyGoalFocusExercises('Hourglass / Curvy (Wellness style)', 'strength', day).map(e=>e.name));
  `);
  assert.deepStrictEqual(added, ['Clamshell'], 'Hip Thrust should be skipped as a duplicate; Clamshell (not already on this day) should be added');
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
  const [state] = runSandbox(pureChunks, `__capture.push(daysPerWeekWarningState('core', 7));`);
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
    const coreDaysBefore = programs.core.days;
    const coreOverviewBefore = programs.core.overview;
    daysPerWeekPref = 7;
    applyDaysPerWeekProgramData();
    __capture.push(programs.core.days === coreDaysBefore);
    __capture.push(programs.core.overview === coreOverviewBefore);
  `);
  assert.strictEqual(sameRef, true);
  assert.strictEqual(sameOverview, true);
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
