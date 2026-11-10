'use strict';
// v3.518 (BL-01, audit SAF-1): goal volume and block accumulation add sets
// only on the four lifting programs (VOLUME_MODIFIER_PROGRAMS) and on custom
// programs. Every other built-in program, every style of the style programs
// and every day-count variant keeps its authored set strings.
//
// Real invocation: the real applyGoalVolume / applyAccumulation /
// applyAccumulationAccessory, the real program tables and the real
// exerciseInfo are extracted from source and run in a vm sandbox, in the same
// order renderWorkout runs them. Nothing here string-matches the source,
// except criterion 5, which counts real call expressions in renderWorkout.
//
// Sabotage anchor: remove the volumeModifiersApply gate from applyGoalVolume
// or applyAccumulation and criterion 1 fails, listing the programs whose sets
// rise (positive control below proves the fixture can see a rise at all).
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-volume-modifier-gate.js');

const chunks = [
  extractConst(src, 'exerciseInfo'),
  extractConst(src, 'programs'),
  extractConst(src, 'MEDICAL_STYLES'),
  extractConst(src, 'COMBAT_STYLES'),
  extractConst(src, 'CYCLING_STYLES'),
  extractConst(src, 'WATERSPORTS_STYLES'),
  extractConst(src, 'YOGA_STYLES'),
  extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
  extractConst(src, 'CUSTOM_PROGRAM_PREFIX'),
  extractConst(src, 'DELOAD_CYCLE_WEEKS'),
  extractConst(src, 'ACCUMULATION_ADDS'),
  extractConst(src, 'COMPOUND_CATEGORIES'),
  extractConst(src, 'VOLUME_MODIFIER_PROGRAMS'),
  extractConst(src, 'ACCUMULATION_ACCESSORY_POOL'),
  extractConst(src, 'WARMUP_ELIGIBLE_CATEGORIES'),
  extractFunction(src, 'isCustomProgramKey'),
  extractFunction(src, 'volumeModifiersApply'),
  extractFunction(src, 'parseSetCount'),
  extractFunction(src, 'hasNumericSetPrefix'),
  extractFunction(src, 'replaceSetCount'),
  extractFunction(src, 'goalVolumeAdjustment'),
  extractFunction(src, 'getRepRangeTier'), // v3.541 (BL-07)
  extractFunction(src, 'applyGoalVolume'),
  extractFunction(src, 'cycleWeekOf'),
  extractFunction(src, 'applyAccumulation'),
  extractFunction(src, 'applyAccumulationAccessory'),
];

// The three modifiers in renderWorkout's order (goal volume, then the
// non-deload branch: accumulation, then the accumulation accessory).
const PIPE = `
  function pipe(exercises, goal, week, program, dayId){
    let e = applyGoalVolume(exercises, goal, program);
    e = applyAccumulation(e, week, program);
    return applyAccumulationAccessory(e, week, program, dayId);
  }
  const STYLE_TABLES = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES,
                        watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
  // Every day set that renderWorkout can show for a program key: its own
  // days, each style's days, and each PROGRAM_DAY_COUNT_VARIANTS day set
  // (keyed [key][n], or [key][style][n] for the style programs).
  function daySetsFor(key){
    const out = [{where: key, days: programs[key].days}];
    const styles = STYLE_TABLES[key] || {};
    for(const st of Object.keys(styles)) out.push({where: key + '/' + st, days: styles[st].days});
    const variants = PROGRAM_DAY_COUNT_VARIANTS[key] || {};
    for(const k of Object.keys(variants)){
      const v = variants[k];
      if(v && v.days){ out.push({where: key + '/' + k + 'd', days: v.days}); continue; }
      for(const n of Object.keys(v || {})) out.push({where: key + '/' + k + '/' + n + 'd', days: v[n].days});
    }
    return out;
  }
  const GOALS = ['gain', 'leanbulk', 'performance'];
  const WEEKS = [1, 2, 3, 4];
`;

test('criterion 1: every built-in program outside the allowlist, every style and every day-count variant keeps its authored sets under goals gain/leanbulk/performance in weeks 1-4', (assert)=>{
  const [r] = runSandbox(chunks, PIPE + `
    const gated = Object.keys(programs).filter(k => !VOLUME_MODIFIER_PROGRAMS.has(k));
    const problems = [];
    let daySets = 0, checks = 0;
    const styleProgramsSeen = new Set(), variantProgramsSeen = new Set();
    for(const key of gated){
      for(const {where, days} of daySetsFor(key)){
        daySets++;
        if(where.includes('/') && STYLE_TABLES[key]) styleProgramsSeen.add(key);
        if(PROGRAM_DAY_COUNT_VARIANTS[key] && /d$/.test(where)) variantProgramsSeen.add(key);
        for(const dayId of Object.keys(days)){
          const day = days[dayId];
          if(!day || day.rest || !Array.isArray(day.exercises)) continue;
          for(const goal of GOALS) for(const week of WEEKS){
            const out = pipe(day.exercises, goal, week, key, dayId);
            checks++;
            if(out.length !== day.exercises.length){ problems.push(where+' '+dayId+' '+goal+' w'+week+': '+day.exercises.length+'→'+out.length+' exercises'); continue; }
            out.forEach((ex, i)=>{
              if(ex.sets !== day.exercises[i].sets) problems.push(where+' '+dayId+' '+goal+' w'+week+' '+ex.name+': '+day.exercises[i].sets+'→'+ex.sets);
            });
          }
        }
      }
    }
    __capture.push({gatedCount: gated.length, totalPrograms: Object.keys(programs).length, daySets, checks,
      styleProgramsSeen: [...styleProgramsSeen].sort(), variantProgramsSeen: variantProgramsSeen.size,
      problems: problems.slice(0, 12), problemCount: problems.length});
  `);
  assert.strictEqual(r.totalPrograms, 25, 'the programs table has 25 keys; a new one must be classified');
  assert.strictEqual(r.gatedCount, 21, 'iterated 21 programs outside VOLUME_MODIFIER_PROGRAMS');
  assert.deepStrictEqual(r.styleProgramsSeen, ['combat', 'cycling', 'medical', 'watersports', 'yoga'], 'every *_STYLES table was walked');
  assert.strictEqual(r.variantProgramsSeen, 20, 'all 20 gated programs with day-count variants had their variant days walked');
  assert.ok(r.checks > 3000, 'expected thousands of day×goal×week checks, got ' + r.checks);
  assert.strictEqual(r.problemCount, 0, 'sets changed on gated programs:\n      ' + r.problems.join('\n      '));
});

test('positive control: the same days run as a CUSTOM program (ungated) do gain sets, so criterion 1 can see a rise', (assert)=>{
  const [r] = runSandbox(chunks, PIPE + `
    const sets = (exs, name)=> (exs.find(e=>e.name===name) || {}).sets;
    const acl = MEDICAL_STYLES.rehabAcl.days.d4.exercises;
    const htn = MEDICAL_STYLES.hypertension.days.d2.exercises;
    const pre = MEDICAL_STYLES.prenatal.days.d1.exercises;
    const changed = (exs)=> pipe(exs, 'gain', 3, 'custom:x', 'd1').some((e, i)=> e.sets !== exs[i].sets);
    let rises = 0;
    for(const key of Object.keys(programs).filter(k => !VOLUME_MODIFIER_PROGRAMS.has(k))){
      for(const {days} of daySetsFor(key)) for(const d of Object.values(days)){
        if(d && !d.rest && Array.isArray(d.exercises) && changed(d.exercises)) rises++;
      }
    }
    __capture.push({
      aclLegCurl: [sets(acl, 'Leg Curl'), sets(pipe(acl, 'gain', 3, 'custom:x', 'd4'), 'Leg Curl')],
      htnChanged: changed(htn), preChanged: changed(pre), rises,
    });
  `);
  assert.ok(r.aclLegCurl[0] && r.aclLegCurl[0] !== r.aclLegCurl[1], 'ACL rehab d4 Leg Curl rises when ungated: ' + r.aclLegCurl.join(' → '));
  assert.ok(r.htnChanged, 'hypertension d2 rises when ungated');
  assert.ok(r.preChanged, 'prenatal d1 rises when ungated');
  assert.ok(r.rises > 50, 'many gated day sets would rise without the gate, got ' + r.rises);
});

test('criterion 2: strength d1, goal gain, week 3 gains sets exactly as before v3.518', (assert)=>{
  const [r] = runSandbox(chunks, PIPE + `
    const d1 = programs.strength.days.d1.exercises;
    __capture.push({authoredBench: d1.find(e=>e.name==='Bench Press').sets,
      out: pipe(d1, 'gain', 3, 'strength', 'd1').map(e => e.name + ' ' + e.sets)});
  `);
  assert.strictEqual(r.authoredBench, '4×4-6', 'authored Bench Press');
  // Reference: the same pipeline run on the unmodified v3.517 functions.
  assert.deepStrictEqual(r.out, [
    'Bench Press 6×4-6',
    'Barbell Row 6×6-8',
    'Overhead Press 4×8-10',
    'Lat Pulldown 4×10-12',
    'DB Curl 4×10-12',
    'Triceps Pushdown 4×10-12',
    'Cable Fly 3×12-15',
  ]);
});

test('criterion 3: Athletic d4 Depth Jump stays 4×5 under goal gain, and the jump rule holds even where goal volume runs', (assert)=>{
  const [r] = runSandbox(chunks, PIPE + `
    const d4 = programs.athletic.days.d4.exercises;
    const dj = (exs)=> (exs.find(e=>e.name==='Depth Jump') || {}).sets;
    __capture.push({
      authored: dj(d4),
      athletic: GOALS.flatMap(g => WEEKS.map(w => dj(pipe(d4, g, w, 'athletic', 'd4')))),
      // Custom programs keep goal volume, but jump-category sets are never raised.
      customGoal: dj(applyGoalVolume(d4, 'gain', 'custom:x')),
      category: exerciseInfo['Depth Jump'].category,
    });
  `);
  assert.strictEqual(r.authored, '4×5');
  assert.strictEqual(r.category, 'jump');
  assert.ok(r.athletic.every(s => s === '4×5'), 'athletic: ' + r.athletic.join(', '));
  assert.strictEqual(r.customGoal, '4×5', 'goal volume never raises a jump-category exercise');
});

// Exception, by the item's own spec: jump-category exercises no longer take
// goal volume on any program, custom included (criterion 3 pins that).
test('criterion 4: a custom program gets the same output as before v3.518 (non-jump exercises)', (assert)=>{
  const [r] = runSandbox(chunks, PIPE + `
    const exs = [
      {name:'Squat', sets:'3×5'},
      {name:'Romanian Deadlift', sets:'3×8'},
      {name:'Bench Press', sets:'2×8'},
      {name:'DB Curl', sets:'3×12'},
      {name:'Plank', sets:'1×45s'},
    ];
    __capture.push({
      gainW3: pipe(exs, 'gain', 3, 'custom:abc', 'd1').map(e => e.sets),
      perfW1: pipe([{name:'Squat', sets:'5×8'}, {name:'DB Curl', sets:'4×12'}], 'performance', 1, 'custom:abc', 'd1').map(e => e.sets),
      perfStrengthTier: pipe([{name:'Squat', sets:'5×5'}], 'performance', 1, 'custom:abc', 'd1').map(e => e.sets),
      maintainW2: pipe(exs, 'maintain', 2, 'custom:abc', 'd1').map(e => e.sets),
      sameAsStrength: JSON.stringify(pipe(exs, 'gain', 3, 'custom:abc', 'd9')) === JSON.stringify(pipe(exs, 'gain', 3, 'strength', 'd9')),
    });
  `);
  // Hand-checked against the v3.517 rules: gain adds 1 set to 2-4 set entries,
  // then week 3 adds 1 more to the first two compounds.
  assert.deepStrictEqual(r.gainW3, ['5×5', '5×8', '3×8', '4×12', '1×45s']);
  // v3.541 (BL-07): the cap now applies to hypertrophy-tier compounds only (5×8);
  // a strength-tier 5×5 keeps its sets.
  assert.deepStrictEqual(r.perfW1, ['3×8', '4×12'], 'performance caps hypertrophy-tier compounds at 3 sets');
  assert.deepStrictEqual(r.perfStrengthTier, ['5×5'], 'performance no longer cuts strength-tier work (BL-07)');
  assert.deepStrictEqual(r.maintainW2, ['4×5', '3×8', '2×8', '3×12', '1×45s'], 'week 2: +1 on the first compound only');
  assert.ok(r.sameAsStrength, 'custom and an allowlisted program behave identically on the same list');
});

test('accessory gate: every ACCUMULATION_ACCESSORY_POOL program is in VOLUME_MODIFIER_PROGRAMS, and the allowlist is exactly the audit\'s four', (assert)=>{
  const [r] = runSandbox(chunks, `
    __capture.push({pool: Object.keys(ACCUMULATION_ACCESSORY_POOL).sort(), allow: [...VOLUME_MODIFIER_PROGRAMS].sort(),
      missing: undefined === volumeModifiersApply(undefined) ? 'undef' : volumeModifiersApply(undefined)});
  `);
  assert.deepStrictEqual(r.allow, ['bodybuilding', 'powerbuilding', 'powerlifting', 'strength']);
  assert.ok(r.pool.every(k => r.allow.includes(k)), 'pool keys outside the allowlist: ' + r.pool.filter(k => !r.allow.includes(k)));
  assert.strictEqual(r.missing, false, 'a missing program key means no modifiers');
});

test('criterion 5: renderWorkout passes activeProgram to all three modifier calls (real call expressions, comments ignored)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout');
  const calls = [];
  for(const name of ['applyGoalVolume', 'applyAccumulation', 'applyAccumulationAccessory']){
    const re = new RegExp('\\b' + name + '\\s*\\(([^)]*)\\)', 'g');
    let m;
    while((m = re.exec(body))){
      const lineStart = body.lastIndexOf('\n', m.index) + 1;
      if(body.slice(lineStart, m.index).includes('//')) continue; // inside a line comment
      calls.push({name, args: m[1].split(',').map(s => s.trim())});
    }
  }
  assert.strictEqual(calls.length, 3, 'exactly one real call of each modifier: ' + JSON.stringify(calls));
  for(const c of calls) assert.ok(c.args.includes('activeProgram'), c.name + ' is called without activeProgram: ' + c.args.join(', '));
  assert.deepStrictEqual(calls.map(c => c.name), ['applyGoalVolume', 'applyAccumulation', 'applyAccumulationAccessory']);
});

// ---- v3.541 (BL-07, audit H-1): the performance goal no longer cuts
// strength-tier work, and never trims powerlifting or powerbuilding.
const goalRun = (body) => runSandbox(chunks, body)[0];

test('BL-07 criterion 1: goal performance, powerlifting d1: Squat stays 5×5', (assert)=>{
  const r = goalRun(`const d = programs.powerlifting.days.d1.exercises;
    __capture.push({before: d.map(e => e.name + ' ' + e.sets), after: applyGoalVolume(d, 'performance', 'powerlifting').map(e => e.name + ' ' + e.sets)});`);
  assert.ok(r.after.some(x => /^(Back )?Squat 5×5$/.test(x)), r.after.join(' | '));
  assert.deepStrictEqual(r.after, r.before, 'the whole day keeps its written sets');
});

test('BL-07 criterion 2: goal performance, Strength & Size d1: Bench Press 4×4-6 stays; Barbell Row 4×6-8 still becomes 3×6-8', (assert)=>{
  const r = goalRun(`__capture.push(applyGoalVolume(programs.strength.days.d1.exercises, 'performance', 'strength').map(e => e.name + ' ' + e.sets));`);
  assert.ok(r.includes('Bench Press 4×4-6'), r.join(' | '));
  assert.ok(r.includes('Barbell Row 3×6-8'), r.join(' | '));
});

test('BL-07 criterion 3: goal performance, every powerbuilding day (base and day-count variants): no set count falls', (assert)=>{
  const r = goalRun(`
    const fell = [];
    const sets = [['base', programs.powerbuilding.days], ...Object.entries(PROGRAM_DAY_COUNT_VARIANTS.powerbuilding || {}).map(([k, v]) => [k + 'd', v.days])];
    for(const [w, days] of sets) for(const [d, day] of Object.entries(days || {})){
      const before = day.exercises || []; const after = applyGoalVolume(before, 'performance', 'powerbuilding');
      after.forEach((e, i) => { if(parseSetCount(e.sets) < parseSetCount(before[i].sets)) fell.push(w + '/' + d + ' ' + e.name); });
    }
    __capture.push(fell);`);
  assert.deepStrictEqual(r, []);
});

// sha256 of applyGoalVolume(day, 'gain', program) for every day of the four
// lifting programs and their day-count variants (196 days), taken at v3.540,
// before this change.
const GAIN_SHA256_V3540 = '630479d0ad044666e93b35c0028076b7bd89a17a760df81f1239c474cb251940';
test('BL-07 criterion 4: goal gain is unchanged on all four lifting programs (snapshot of every day)', (assert)=>{
  const r = goalRun(`
    const out = {}; for(const p of ['strength', 'bodybuilding', 'powerlifting', 'powerbuilding']){
      const sets = [[p, programs[p].days]]; for(const [k, v] of Object.entries(PROGRAM_DAY_COUNT_VARIANTS[p] || {})) sets.push([p + k, v.days]);
      for(const [w, days] of sets) for(const [d, day] of Object.entries(days || {})) out[w + '/' + d] = applyGoalVolume(day.exercises || [], 'gain', p).map(e => e.name + ' ' + e.sets);
    }
    __capture.push(out);`);
  assert.strictEqual(Object.keys(r).length, 196);
  assert.strictEqual(require('crypto').createHash('sha256').update(JSON.stringify(r)).digest('hex'), GAIN_SHA256_V3540);
});

run();
