'use strict';
// v3.519 (BL-02, audit SAF-2 + SAF-8): one RPE target helper (rpeTargetFor)
// with a clinical cap at RPE 7 and no RPE target for technique lifts, plus the
// clinical load gate in analyzeProgressionSignal (two sessions at RPE <= 7,
// the smallest loadable step, no number on cables/machines or without RPE).
//
// Real invocation throughout: the real functions and tables are extracted
// from index.html and run in a vm sandbox (or jsdom, for the Settings note).
// Criteria 5 and 11 count real code expressions with comments stripped.
//
// Sabotage anchors: drop the Math.min cap and criteria 1, 6 and 9 fail; drop
// the clinical branch in analyzeProgressionSignal and criteria 7 and 8 fail.
const { readIndexSource, extractFunction, extractConst, extractElementById, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');
const fs = require('fs');
const path = require('path');

const src = readIndexSource();
const indexOnly = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-rpe-safety-caps.js');

const FN_NAMES = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rirFromRpe', 'loadForRpeTarget',
  'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'analyzeProgressionSignal', 'buildProgressBadge',
  'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable', 'getEquipment', 'isBarbellExercise',
  'isDumbbellExercise', 'toDisplayWeight', 'trimUnitNum', 'fmtWeight'];
const CONST_NAMES = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES',
  'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'LB_PER_KG'];

const chunks = [
  "var loadSuggestionMode = 'rpe'; var activeProgram = 'strength';",
  ...CONST_NAMES.map(n => extractConst(src, n)),
  ...FN_NAMES.map(n => extractFunction(src, n)),
  // Counting stub around the REAL loadForRpeTarget (criterion 2).
  `var __lfCalls = 0; var __realLF = loadForRpeTarget;
   loadForRpeTarget = function(){ __lfCalls++; return __realLF.apply(null, arguments); };`,
];

const sbx = (body) => runSandbox(chunks, body)[0];

const CABLE = {name: 'Seated Cable Row', sets: '2×12'};
const sessions = (w, reps, rpe) => JSON.stringify([
  {date: '2026-11-05', weight: w, reps, avgRpe: rpe},
  {date: '2026-11-02', weight: w, reps, avgRpe: rpe},
]);

test('criterion 1: hypertension (medical) week 4 in RPE mode: badge shows RPE 7, and the suggested load is the RPE-7 load', (assert)=>{
  const r = sbx(`
    const ex = ${JSON.stringify(CABLE)};
    const ok = MEDICAL_STYLES.hypertension && Object.values(MEDICAL_STYLES.hypertension.days).some(d => (d.exercises||[]).some(e => e.name === ex.name && e.sets === ex.sets));
    const rpeCtx = {e1rm: 200, week: 4, program: 'medical', category: 'pull'};
    const badge = buildProgressBadge({ex, signal: null, inDeloadWeek: false, priorTop: {weight: 60, reps: 12}, topRep: 12, rpeCtx, sourceNote: ''});
    const sug = computeSuggestedSet({weight: 60, reps: 12}, null, false, 'pull', ex, {weight: 60, reps: 12}, rpeCtx);
    const expected = snapToLoadable(toDisplayWeight(__realLF(200, parseBottomRep(ex.sets), 7)), ex.name, 'down');
    __capture.push({ok, html: badge.html, sug, expected});
  `);
  assert.ok(r.ok, 'Seated Cable Row 2×12 is a real hypertension exercise');
  assert.ok(/RPE 7\b/.test(r.html), r.html);
  assert.ok(!/RPE 9/.test(r.html));
  assert.strictEqual(r.sug.reason, 'rpe');
  assert.strictEqual(r.sug.targetRpe, 7);
  assert.strictEqual(r.sug.weight, r.expected);
});

test('criterion 2: Olympic Snatch in RPE mode, week 4: loadForRpeTarget is never called, the suggestion is double progression and the badge says "Technique lift"', (assert)=>{
  const r = sbx(`
    const ex = {name: 'Snatch', sets: '5×2'};
    const rpeCtx = {e1rm: 200, week: 4, program: 'oly', category: 'oly'};
    __lfCalls = 0;
    const badge = buildProgressBadge({ex, signal: null, inDeloadWeek: false, priorTop: {weight: 135, reps: 2}, topRep: 2, rpeCtx, sourceNote: ''});
    const sug = computeSuggestedSet({weight: 135, reps: 2}, null, false, 'oly', ex, {weight: 135, reps: 2}, rpeCtx);
    __capture.push({calls: __lfCalls, html: badge.html, sug, target: rpeTargetFor(4, false, 'oly', 'oly')});
  `);
  assert.strictEqual(r.target, null);
  assert.strictEqual(r.calls, 0, 'loadForRpeTarget calls');
  assert.ok(r.html.includes('Technique lift'), r.html);
  assert.ok(!/RPE \d/.test(r.html), 'no RPE target on a technique lift');
  assert.ok(r.sug && r.sug.reason !== 'rpe', JSON.stringify(r.sug));
  assert.strictEqual(r.sug.reason, 'increase', 'double progression: top of range last time → add weight');
});

test('criterion 3: Strength Back Squat week 4 is still RPE 9', (assert)=>{
  const r = sbx(`
    const ex = {name: 'Back Squat', sets: '4×5'};
    const rpeCtx = {e1rm: 300, week: 4, program: 'strength', category: 'squat'};
    const badge = buildProgressBadge({ex, signal: null, inDeloadWeek: false, priorTop: null, topRep: 5, rpeCtx, sourceNote: ''});
    __capture.push({t: rpeTargetFor(4, false, 'strength', 'squat'), html: badge.html});
  `);
  assert.strictEqual(r.t, 9);
  assert.ok(/RPE 9\b/.test(r.html), r.html);
});

test('criterion 4: deload week is RPE 6 for strength, medical and senior on every non-technique category; technique stays null', (assert)=>{
  const r = sbx(`
    const out = [];
    for(const p of ['strength', 'medical', 'senior', 'bodybuilding', 'custom:x'])
      for(const c of ['squat','hinge','push','pull','lunge','shoulder','arms','core', null, 'oly','jump','throw'])
        for(const w of [5, 10]) out.push([p, c, w, rpeTargetFor(w, true, p, c)]);
    __capture.push(out);
  `);
  for(const [p, c, w, t] of r){
    const technique = c === 'oly' || c === 'jump' || c === 'throw';
    assert.strictEqual(t, technique ? null : 6, `${p}/${c}/w${w}`);
  }
});

function stripLineComments(text){
  return text.split('\n').map(line => {
    const i = line.indexOf('//');
    return i >= 0 && !/https?:$/.test(line.slice(0, i)) ? line.slice(0, i) : line;
  }).join('\n');
}

test('criterion 5: RPE_BY_CYCLE_WEEK[ is read only inside rpeTargetFor and targetRpeForWeek (real reads, comments stripped)', (assert)=>{
  const reads = (text) => (stripLineComments(text).match(/RPE_BY_CYCLE_WEEK\s*\[/g) || []).length;
  const total = reads(indexOnly);
  const inHelpers = reads(extractFunction(src, 'rpeTargetFor')) + reads(extractFunction(src, 'targetRpeForWeek'));
  assert.strictEqual(inHelpers, 2, 'one read in each helper');
  assert.strictEqual(total, 2, 'no other reads anywhere in index.html, got ' + total);
  for(const fn of ['buildProgressBadge', 'computeSuggestedSet', 'renderLoadModeNote']){
    assert.strictEqual(reads(extractFunction(src, fn)), 0, fn + ' reads the table directly');
    assert.ok(/\brpeTargetFor\s*\(/.test(stripLineComments(extractFunction(src, fn))), fn + ' calls rpeTargetFor');
  }
});

test('criterion 6: the Settings note (real markup, jsdom) says "targets RPE 7" on medical and "targets RPE 9" on strength in week 4', (assert)=>{
  const markup = extractElementById(src, 'loadModeSelect') + extractElementById(src, 'loadModeNote');
  const noteFor = (program) => {
    const { document } = runJsdom(markup, `var loadSuggestionMode = 'rpe'; var activeProgram = '${program}';`, [
      extractConst(src, 'DELOAD_CYCLE_WEEKS'), extractConst(src, 'RPE_BY_CYCLE_WEEK'),
      ...['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rirFromRpe', 'renderLoadModeNote'].map(n => extractFunction(src, n)),
      'renderLoadModeNote(4);',
    ]);
    return document.getElementById('loadModeNote').textContent;
  };
  const med = noteFor('medical'), str = noteFor('strength');
  assert.ok(med.includes('targets RPE 7'), med);
  assert.ok(str.includes('targets RPE 9'), str);
});

test('criterion 7: clinical load gate on the hypertension cable row: RPE 8 holds, RPE 7 increases with no target weight; a barbell steps by 2 × the smallest plate', (assert)=>{
  const r = sbx(`
    const ex = ${JSON.stringify(CABLE)};
    const at8 = analyzeProgressionSignal(${sessions(60, 12, 8)}, ex, 'pull', 'medical');
    const at7 = analyzeProgressionSignal(${sessions(60, 12, 7)}, ex, 'pull', 'medical');
    const sug7 = computeSuggestedSet({weight: 60, reps: 12}, at7, false, 'pull', ex, {weight: 60, reps: 12}, null);
    loadSuggestionMode = 'progression';
    const badge7 = buildProgressBadge({ex, signal: at7, inDeloadWeek: false, priorTop: {weight: 60, reps: 12}, topRep: 12, rpeCtx: {e1rm: 80, week: 2, program: 'medical', category: 'pull'}, sourceNote: ''});
    const sq = {name: 'Back Squat', sets: '3×5'};
    const bar = analyzeProgressionSignal(${sessions(135, 5, 7)}, sq, 'squat', 'medical');
    const barSug = computeSuggestedSet({weight: 135, reps: 5}, bar, false, 'squat', sq, {weight: 135, reps: 5}, null);
    const eq = getEquipment();
    __capture.push({at8, at7, sug7, badge7: badge7.html, bar, barSug, plateStep: 2 * eq.plates.at(-1), cableSnap: snapToLoadable(60.1, ex.name, 'up')});
  `);
  assert.strictEqual(r.cableSnap, 60.1, 'premise: snapToLoadable has no step for cables');
  assert.ok(!r.at8 || r.at8.type !== 'increase', 'RPE 8 on a clinical plan is not an increase: ' + JSON.stringify(r.at8));
  assert.strictEqual(r.at7 && r.at7.type, 'increase');
  assert.strictEqual(r.at7.loadStep, null, 'no step on a cable');
  assert.strictEqual(r.sug7, null, 'no target weight in the field');
  assert.ok(r.at7.message.includes('smallest step your machine allows'), r.at7.message);
  assert.ok(r.badge7.includes('smallest step your machine allows'), r.badge7);
  assert.strictEqual(r.bar.type, 'increase');
  assert.strictEqual(r.bar.loadStep, r.plateStep, 'barbell step = 2 × smallest plate');
  assert.strictEqual(r.barSug.weight, 135 + r.plateStep);
});

test('criterion 7b (review): when the gate blocks an increase, the one-session "add weight" fallback does not raise it either, on clinical plans only', (assert)=>{
  const r = sbx(`
    loadSuggestionMode = 'progression';
    const ex = ${JSON.stringify(CABLE)};
    const top = {weight: 60, reps: 12};
    const run = (program)=>{
      const sig = analyzeProgressionSignal(${sessions(60, 12, 8)}, ex, 'pull', program);
      const rpeCtx = {e1rm: 80, week: 2, program, category: 'pull'};
      return {sig, sug: computeSuggestedSet(top, sig, false, 'pull', ex, top, rpeCtx),
              html: buildProgressBadge({ex, signal: sig, inDeloadWeek: false, priorTop: top, topRep: 12, rpeCtx, sourceNote: ''}).html};
    };
    __capture.push({medical: run('medical'), senior: run('senior'), strength: run('strength')});
  `);
  for(const p of ['medical', 'senior']){
    assert.strictEqual(r[p].sig, null, p + ': RPE 8 blocks the increase');
    assert.strictEqual(r[p].sug, null, p + ': no raised weight in the field: ' + JSON.stringify(r[p].sug));
    assert.ok(!/adding weight|add \d/.test(r[p].html), p + ': badge does not suggest adding weight: ' + r[p].html);
  }
  assert.strictEqual(r.strength.sig.type, 'increase', 'strength at RPE 8 (<= 8.5) still increases');
  assert.strictEqual(r.strength.sug.reason, 'increase');
});

test('technique hint only where an RPE target would have shown (an e1RM exists)', (assert)=>{
  const r = sbx(`
    const ex = {name: 'Box Jump', sets: '3×5'};
    const b = buildProgressBadge({ex, signal: null, inDeloadWeek: false, priorTop: null, topRep: 5, rpeCtx: {e1rm: null, week: 4, program: 'athletic', category: 'jump'}, sourceNote: ''});
    __capture.push(b);
  `);
  assert.deepStrictEqual(r, {direction: null, html: ''});
});

test('criterion 8: no RPE logged in either session: clinicalNoRpe, "felt comfortable", no digits, and no suggested number', (assert)=>{
  const r = sbx(`
    const ex = ${JSON.stringify(CABLE)};
    const sig = analyzeProgressionSignal(${sessions(60, 12, null)}, ex, 'pull', 'medical');
    __capture.push({sig, sug: computeSuggestedSet({weight: 60, reps: 12}, sig, false, 'pull', ex, {weight: 60, reps: 12}, null)});
  `);
  assert.strictEqual(r.sig.clinicalNoRpe, true);
  assert.ok(r.sig.message.includes('felt comfortable'), r.sig.message);
  assert.ok(!/\d/.test(r.sig.message), 'no number: ' + r.sig.message);
  assert.strictEqual(r.sug, null);
});

test('criterion 9: every MEDICAL_STYLES style (13) and Senior stay at or under RPE 7 in weeks 1-4', (assert)=>{
  const r = sbx(`
    const keys = Object.keys(MEDICAL_STYLES);
    const bad = [];
    for(const w of [1,2,3,4,6,7,8,9]){
      if(rpeTargetFor(w, false, 'senior', 'push') > 7) bad.push('senior w' + w);
      // Every style runs under activeProgram 'medical'; iterate them so a new
      // style is counted (and so the count below catches one being added).
      for(const k of keys) if(rpeTargetFor(w, false, 'medical', 'push') > 7) bad.push(k + ' w' + w);
    }
    __capture.push({count: keys.length, bad, wk1: rpeTargetFor(1, false, 'medical', 'push')});
  `);
  assert.strictEqual(r.count, 13, 'MEDICAL_STYLES key count');
  assert.deepStrictEqual(r.bad, []);
  assert.strictEqual(r.wk1, 7, 'week 1 (7.5) is capped too');
});

test('criterion 10: Strength Back Squat at RPE 8.5 still increases by the category increment (unchanged)', (assert)=>{
  const r = sbx(`
    const sq = {name: 'Back Squat', sets: '3×5'};
    const sig = analyzeProgressionSignal(${sessions(135, 5, 8.5)}, sq, 'squat', 'strength');
    const three = analyzeProgressionSignal(${sessions(135, 5, 8.5)}, sq, 'squat');
    loadSuggestionMode = 'progression';
    const sug = computeSuggestedSet({weight: 135, reps: 5}, sig, false, 'squat', sq, {weight: 135, reps: 5}, null);
    __capture.push({sig, three, sug, inc: getLoadIncrement('squat'), incText: fmtWeight(getLoadIncrement('squat'))});
  `);
  assert.strictEqual(r.sig.type, 'increase');
  assert.ok(!r.sig.clinical);
  assert.ok(r.sig.message.includes('add ' + r.incText), r.sig.message);
  assert.deepStrictEqual(r.three, r.sig, 'three-argument calls behave exactly as before');
  assert.strictEqual(r.sug.weight, 135 + r.inc);
});

test('criterion 11: all three analyzeProgressionSignal( call sites pass a fourth argument (real calls, comments stripped)', (assert)=>{
  const code = stripLineComments(indexOnly);
  const calls = [];
  const re = /\banalyzeProgressionSignal\s*\(/g;
  let m;
  while((m = re.exec(code))){
    if(/function\s+$/.test(code.slice(Math.max(0, m.index - 20), m.index))) continue; // the declaration
    let depth = 1, i = re.lastIndex, args = [''];
    for(; i < code.length && depth > 0; i++){
      const ch = code[i];
      if(ch === '(' || ch === '[' || ch === '{') depth++;
      else if(ch === ')' || ch === ']' || ch === '}') depth--;
      if(depth === 0) break;
      if(ch === ',' && depth === 1) args.push(''); else args[args.length - 1] += ch;
    }
    calls.push(args.map(a => a.trim()));
  }
  assert.strictEqual(calls.length, 3, 'call sites: ' + JSON.stringify(calls));
  for(const a of calls){
    assert.strictEqual(a.length, 4, 'four arguments: ' + a.join(', '));
    assert.strictEqual(a[3], 'activeProgram');
  }
});

run();
