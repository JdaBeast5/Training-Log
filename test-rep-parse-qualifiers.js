'use strict';
// v3.529 (BL-76): rep targets survive a per-limb or bracketed note.
// parseTopRep/parseBottomRep used to read a fixed rep count only when it was
// the last thing in the string, so "3×8/leg", "3×10/side", "4×20 (10/leg)"
// and "3×15 (straight-knee, …)" had no rep target, and no progression badge,
// next-set target or RPE-mode load. Real invocation of the real parsers, the
// real program tables and the real analyzeProgressionSignal.
//
// Sabotage anchor: remove the suffix stripping in parseTopRep and criteria 1,
// 3 and 4 fail.
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rep-parse-qualifiers.js');
const PARSERS = [extractFunction(src, 'parseTopRep'), extractFunction(src, 'parseBottomRep')];
const parse = (strs) => runSandbox(PARSERS, `__capture.push(${JSON.stringify(strs)}.map(s => [parseTopRep(s), parseBottomRep(s)]));`)[0];

// Every non-null parse at v3.528 (origin/Branch-1 cf8985b, before this change),
// over all 255 distinct sets strings in programs, *_STYLES and the variants.
const V3528_SNAPSHOT = {"4×4-6":[6,4],"4×6-8":[8,6],"3×8-10":[10,8],"3×10-12":[12,10],"3×12-15":[15,12],"4×10-12":[12,10],"3×15":[15,15],"3×5-6":[6,5],"3×10-12/leg":[12,10],"3×6-8":[8,6],"2×8-10":[10,8],"2×12-15":[15,12],"3×5-8":[8,5],"2×10-12":[12,10],"2×10-12/leg":[12,10],"3×12":[12,12],"4×8-10":[10,8],"4×12-15":[15,12],"4×15":[15,15],"2×15":[15,15],"5×2":[2,2],"4×3":[3,3],"3×5":[5,5],"5×3":[3,3],"4×5":[5,5],"3×3":[3,3],"4×2":[2,2],"3×2":[2,2],"3×8":[8,8],"2×5":[5,5],"4×2-3 min":[3,2],"5 reps ×3":[3,3],"6 reps ×3":[3,3],"8 reps/side ×2":[2,2],"4×45-60s":[60,45],"3×20-30s/side":[30,20],"6 reps ×2":[2,2],"3-5 min ×3":[5,3],"4 reps ×2":[2,2],"45-60 min":[60,45],"5-10 min":[10,5],"90-120 min":[120,90],"3×30-45s":[45,30],"2×8-10/side":[10,8],"90-150 min":[150,90],"20-25 min":[25,20],"3×30-45s/side":[45,30],"3×45-60s":[60,45],"3×20-30s":[30,20],"2×10":[10,10],"4×20-25":[25,20],"3×12-15/leg":[15,12],"3×15-20":[20,15],"3×20-25":[25,20],"4×30-45s":[45,30],"3×10":[10,10],"2×20-30s":[30,20],"3×20":[20,20],"6×30-45s":[45,30],"2×20":[20,20],"2×8":[8,8],"2×20-30s/side":[30,20],"2×30-45s":[45,30],"25-30 min":[30,25],"3×6":[6,6],"4×20-30s":[30,20],"4×8-12":[12,8],"3×15-20s":[20,15],"4×3-5":[5,3],"4×10-15s":[15,10],"4×10-20s":[20,10],"3×5-8/leg":[8,5],"4×30-60s attempts":[60,30],"3×8-12":[12,8],"5×5":[5,5],"4×8":[8,8],"1×5":[5,5],"6×3":[3,3],"15-20 min (talk-test pace)":[20,15],"2×12":[12,12],"20-25 min (talk-test pace)":[25,20],"15-20 min (start within ~30 min of eating)":[20,15],"15-20 min":[20,15],"20-30 min":[30,20],"2×15-20s/side":[20,15],"2×12-15/side":[15,12],"1×60-90s":[90,60],"2×6-8/side":[8,6],"2×6-8":[8,6],"2×8-10/leg":[10,8],"5 breaths ×3":[3,3],"5 breaths/side ×2":[2,2],"1×5-10 min":[10,5],"6 breaths ×3":[3,3],"6 breaths/side ×2":[2,2],"2×15-20s":[20,15],"2×8-12":[12,8],"30-45 min":[45,30],"3×10-12/side":[12,10],"3×8-10/side":[10,8],"4×6":[6,6],"2×10-12/side":[12,10],"3×10-15s":[15,10],"3×10-15s/arm":[15,10],"3×10-20s":[20,10],"2×30-45s/side":[45,30],"2×6":[6,6],"2×10-15s":[15,10],"3×8-10/leg":[10,8],"4×10":[10,10],"5×15":[15,15],"4×20":[20,20],"5-8 reps":[8,5],"6-8 reps":[8,6],"4-6 reps":[6,4]};

const TABLES = ['programs','MEDICAL_STYLES','COMBAT_STYLES','CYCLING_STYLES','WATERSPORTS_STYLES','YOGA_STYLES','PROGRAM_DAY_COUNT_VARIANTS'];
function allSets(){
  return runSandbox(TABLES.map(n => extractConst(src, n)).concat(PARSERS), `
    const T = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
    const ds = [];
    for(const k of Object.keys(programs)){
      ds.push(programs[k].days);
      for(const st of Object.values(T[k] || {})) ds.push(st.days);
      for(const v of Object.values(PROGRAM_DAY_COUNT_VARIANTS[k] || {})){ if(v && v.days) ds.push(v.days); else for(const n of Object.values(v || {})) ds.push(n.days); }
    }
    const seen = new Set(), all = [], weighted = [];
    for(const days of ds) for(const d of Object.values(days || {})){
      if(!d || seen.has(d)) continue; seen.add(d);
      for(const e of d.exercises || []){ all.push(e.sets); if(!e.noWeight) weighted.push(e.sets); }
    }
    __capture.push({all: [...new Set(all)], weighted});`)[0];
}

test('criterion 1: the parsers read the count before a per-limb or bracketed note, and nothing else', (assert)=>{
  const cases = [
    ['3×8/leg', 8, 8], ['3×10/side', 10, 10], ['4×20 (10/leg)', 20, 20],
    ['3×15 (straight-knee, 3s eccentric lower)', 15, 15], ['3×10-12/leg', 12, 10], ['3×10', 10, 10],
    ['3×20yd/side', null, null], ['3×30s/side', null, null], ['Max 5', null, null], ['20 min', null, null],
    // Review fix: a range inside a note is never the rep target, in either parser.
    ['3×10 (3-5s hold)', 10, 10], ['3×8 (RPE 7-8)', 8, 8], ['3×12 (2-3 min rest)', 12, 12],
  ];
  const got = parse(cases.map(c => c[0]));
  cases.forEach(([s, top, bottom], i) => assert.deepStrictEqual(got[i], [top, bottom], s));
});

test('criterion 2: every prescription that parsed at v3.528 parses to the same numbers (frozen snapshot)', (assert)=>{
  const keys = Object.keys(V3528_SNAPSHOT);
  assert.ok(keys.length > 100, 'snapshot covers ' + keys.length + ' strings');
  const got = parse(keys);
  const changed = keys.filter((k, i) => JSON.stringify(got[i]) !== JSON.stringify(V3528_SNAPSHOT[k]));
  assert.deepStrictEqual(changed, []);
});

test('criterion 3: weighted slots with a per-limb or bracketed note and no rep target drop from 185 to the 7 carry distances', (assert)=>{
  const {weighted} = allSets();
  const qualified = weighted.filter(s => /\/\s*(leg|side|arm|hand|direction)\b|\(/i.test(s) && /^\s*\d+\s*[×xX]\s*\d+/.test(s));
  const tops = parse(qualified).map(r => r[0]);
  const stillNull = qualified.filter((s, i) => tops[i] == null);
  assert.strictEqual(qualified.length, 265, 'v3.529: 255; v3.530 (BL-62): +7 Sandbag Lunges (10/leg); v3.532 (BL-61): +3 bare Single-Leg Bound 3×6 gain /leg');
  assert.strictEqual(stillNull.length, 7, 'v3.528: 185');
  assert.deepStrictEqual([...new Set(stillNull)].sort(), ['3×20yd/side', '4×25yd/side'], 'only distances remain');
});

test('criterion 4: Bulgarian Split Squat 3×8/leg, two sessions at 8 reps on the same weight, now signals an increase', (assert)=>{
  const [r] = runSandbox([
    extractConst(src, 'CATEGORY_LOAD_INCREMENT'), extractFunction(src, 'getLoadIncrement'),
    ...PARSERS, extractFunction(src, 'analyzeProgressionSignal'),
  ], `var weightUnit = 'lb'; function fmtWeight(v){ return v + ' lb'; }
    const sessions = [{date:'2026-11-05', weight:60, reps:8, avgRpe:8, minRepsAtTop:8}, {date:'2026-11-02', weight:60, reps:8, avgRpe:8, minRepsAtTop:8}]; // v3.538 (BL-08): every set at the top
    __capture.push(analyzeProgressionSignal(sessions, {name:'Bulgarian Split Squat', sets:'3×8/leg'}, 'lunge', 'strength'));`);
  assert.ok(r && r.type === 'increase', JSON.stringify(r));
});

run();
