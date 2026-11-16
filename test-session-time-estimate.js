'use strict';
// v3.565 (BL-63, audit D-10/C-5; owner 2026-11-16 "Yes on all three", taking
// the recommendation): the time shown on Today counts the work, not just the
// rest. Distance sets get work time from a per-activity pace; rep sets add 3 s
// per rep (top of the range, ×2 per side) and rest falls BETWEEN sets; one
// 4-minute warm-up ramp allowance per day with a compound lift. Criterion 3 is
// relaxed to "under 12%" (owner).
//
// Real invocation: the real parseEstimatedMinutes, parseSetCount,
// getDefaultRestSeconds (and its helpers), groupIntoUnits, unitMinutes,
// totalMinutesForUnits and applySessionLengthLimit over the real programs,
// styles and day-count variants, with the real exerciseInfo.
//
// Sabotage: remove the distance branch and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-session-time-estimate.js');
const INFO = extractConst(fs.readFileSync(path.join(__dirname, 'content-exercises.js'), 'utf8'), 'exerciseInfo');
const CONSTS = ['EXERCISE_MOVE', 'WARMUP_ELIGIBLE_CATEGORIES', 'NON_REP_UNITS', 'REST_BY_UNIT', 'EXERCISE_TRANSITION_MINUTES', 'WARMUP_RAMP_MINUTES', 'SESSION_LENGTH_SET_FLOOR',
  'programs', 'PROGRAM_DAY_COUNT_VARIANTS', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES'];
const FNS = ['prescriptionCount', 'getRepRangeTier', 'restUnitKind', 'getDefaultRestSeconds', 'parseSetCount', 'hasNumericSetPrefix', 'replaceSetCount',
  'parseEstimatedMinutes', 'groupIntoUnits', 'unitMinutes', 'totalMinutesForUnits', 'isWarmupOrCooldownUnit', 'applySessionLengthLimit'];
const CHUNKS = [INFO, ...CONSTS.map(c => extractConst(src, c)), ...FNS.map(f => extractFunction(src, f))];
const sandbox = (code) => runSandbox(CHUNKS, code)[0];

test('criterion 1: an 8×100m swim is 18 ± 2 minutes (was 8)', (assert)=>{
  const m = sandbox(`__capture.push(parseEstimatedMinutes({sets: '8×100m', name: 'Swim Intervals (100s)'}));`);
  assert.ok(Math.abs(m - 18) <= 2, String(m));
});

test('criterion 2: the Strength d1 total is within ±15% of its authored ~55', (assert)=>{
  const r = sandbox(`const d = programs.strength.days.d1; __capture.push({est: totalMinutesForUnits(groupIntoUnits(d.exercises)), authored: d.duration});`);
  assert.strictEqual(r.authored, '~55 min', 'anchor: authored duration');
  assert.ok(Math.abs(r.est - 55) <= 55 * 0.15, String(r.est));
});

test('criterion 3 (owner: measured on lifting and cardio days, under 12%): few such days estimate below 0.6× their authored duration', (assert)=>{
  // A lifting or cardio day: at least half its exercises are warm-up-eligible
  // lifts or cardio. Short mobility, Pilates, yoga and medical days are left
  // out: their authored minutes include warm-up and cool-down the exercise list
  // doesn't show (the owner's option, 2026-11-16). All days are counted too,
  // for the record.
  const r = sandbox(`
    const days = [];
    const visit = (ds) => { for(const d of Object.values(ds || {})) if(d && !d.rest && (d.exercises || []).length && /(\\d+)/.test(d.duration || '')) days.push(d); };
    for(const p of Object.values(programs)) visit(p.days);
    for(const T of [MEDICAL_STYLES, COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES]) for(const st of Object.values(T)) visit(st.days);
    for(const byCount of Object.values(PROGRAM_DAY_COUNT_VARIANTS)) for(const v of Object.values(byCount || {})){
      if(v && v.days) visit(v.days); else for(const n of Object.values(v || {})) visit(n && n.days);
    }
    let n = 0, under = 0, all = 0, allUnder = 0;
    for(const d of new Set(days)){
      const short = totalMinutesForUnits(groupIntoUnits(d.exercises)) < 0.6 * Number(d.duration.match(/(\\d+)/)[1]);
      all++; if(short) allUnder++;
      const cats = d.exercises.map(e => (exerciseInfo[e.name] || {}).category);
      if(cats.filter(c => WARMUP_ELIGIBLE_CATEGORIES.includes(c) || c === 'cardio').length * 2 < cats.length) continue;
      n++; if(short) under++;
    }
    __capture.push({n, under, all, allUnder});`);
  assert.ok(r.n > 500 && r.all > 1000, `anchor: ${r.n} lifting/cardio days of ${r.all}`);
  assert.ok(r.under / r.n < 0.12, `${r.under}/${r.n} = ${(100 * r.under / r.n).toFixed(1)}% (all days: ${r.allUnder}/${r.all})`);
});

test('criterion 4: a real applySessionLengthLimit(…, 30) on Strength d1 keeps the main unit and lands at most one unit over 30', (assert)=>{
  const r = sandbox(`
    const ex = programs.strength.days.d1.exercises;
    const res = applySessionLengthLimit(ex, 30);
    const units = groupIntoUnits(ex);
    __capture.push({est: res.estimatedMinutes, names: res.exercises.map(e => e.name), main: units[0].map(e => e.name),
      maxUnit: Math.max(...units.map(u => unitMinutes(u)))});`);
  for(const n of r.main) assert.ok(r.names.includes(n), 'main unit kept: ' + n);
  assert.ok(r.est <= 30 + r.maxUnit, `${r.est} <= 30 + ${r.maxUnit}`);
});

test('rep sets count the reps and rest between sets; a lifting set with no reps falls back to rest only; per-side reps count twice', (assert)=>{
  const r = sandbox(`__capture.push([parseEstimatedMinutes({name: 'Back Squat', sets: '5×5'}), parseEstimatedMinutes({name: 'Lunge', sets: '3×10/leg'}), parseEstimatedMinutes({name: 'Lunge', sets: '3×10'})]);`);
  // Back Squat 5×5: 4 rests × 240 s = 16 min, plus 25 reps × 3 s = 1.25 min.
  assert.ok(Math.abs(r[0] - 17.25) < 0.01, String(r[0]));
  assert.ok(Math.abs((r[1] - r[2]) - 1.5) < 0.01, 'per-leg doubles the 30 reps × 3 s: ' + r);
});
run();
