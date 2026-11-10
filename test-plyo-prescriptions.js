'use strict';
// v3.532 (BL-61, audit S-2 and S-3): plyometric prescriptions match their cues.
//   - Single-Leg Bound is a same-leg hop, so every one of its 45 slots is
//     counted per leg ("/leg"), and cue 1 says land on the same leg.
//   - Jump Squat 3×12-15 becomes 3×6-8 in all 9 slots (its cue asks for a
//     reset each rep), and a cue now says to stop when landings get loud.
//
// Real invocation: the slot walks read the real programs, every *_STYLES table
// and PROGRAM_DAY_COUNT_VARIANTS; rep targets come from the real parseTopRep;
// rest from the real getDefaultRestSeconds; cues render through the real
// buildDetailsHtml in jsdom.
//
// Sabotage anchor: exactly 9 Jump Squat slots read 3×6-8. Restore one 3×12-15
// and criterion 2 fails (top rep 15) and criterion 3 fails (that slot rests 60 s).
const { readIndexSource, extractConst, extractFunction, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-plyo-prescriptions.js');

// Every exercise slot, each day object counted once: [{owner, name, sets, category}].
function allSlots(){
  const [r] = runSandbox([
    'programs', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES',
    'PROGRAM_DAY_COUNT_VARIANTS', 'exerciseInfo',
  ].map(c => extractConst(src, c)), `
    const T = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
    const seen = new Set(); const out = [];
    for(const key of Object.keys(programs)){
      const ds = [[key, programs[key].days]];
      for(const [sn, st] of Object.entries(T[key] || {})) ds.push([sn, st.days]);
      for(const [vn, v] of Object.entries(PROGRAM_DAY_COUNT_VARIANTS[key] || {})){
        if(v && v.days) ds.push([key, v.days]); else for(const n of Object.values(v || {})) ds.push([vn, n.days]);
      }
      for(const [owner, days] of ds) for(const d of Object.values(days || {})){
        if(!d || seen.has(d)) continue; seen.add(d);
        for(const ex of (d.exercises || [])) out.push({owner, name: ex.name, sets: ex.sets, category: exerciseInfo[ex.name] && exerciseInfo[ex.name].category});
      }
    }
    __capture.push(out);`);
  return r;
}
const SLOTS = allSlots();
const PARSERS = ['parseTopRep', 'getRepRangeTier', 'getDefaultRestSeconds'].map(f => extractFunction(src, f))
  .concat([extractConst(src, 'WARMUP_ELIGIBLE_CATEGORIES'), extractConst(src, 'exerciseInfo')]);

test('criterion 1: every Single-Leg Bound prescription is counted per leg (45 slots)', (assert)=>{
  const sets = SLOTS.filter(s => s.name === 'Single-Leg Bound').map(s => s.sets);
  assert.strictEqual(sets.length, 45, 'the 45 slots counted at v3.518');
  assert.deepStrictEqual(sets.filter(s => !/\/leg$/.test(s)), []);
});

test('criterion 2: no jump-category prescription has a top rep above 8 (real parseTopRep); Jump Squat is 3×6-8 in exactly 9 slots', (assert)=>{
  const jump = SLOTS.filter(s => s.category === 'jump');
  assert.ok(jump.length > 100, 'the sweep reaches the jump slots: ' + jump.length);
  const [tops] = runSandbox(PARSERS, `__capture.push(${JSON.stringify(jump.map(s => s.sets))}.map(parseTopRep));`);
  const over = jump.filter((s, i) => tops[i] === null || tops[i] > 8).map((s, i) => s.owner + '|' + s.name + '|' + s.sets);
  assert.deepStrictEqual(over, []);
  assert.strictEqual(SLOTS.filter(s => s.name === 'Jump Squat' && s.sets === '3×6-8').length, 9);
  assert.strictEqual(SLOTS.filter(s => /×12-15/.test(s.sets) && s.category === 'jump').length, 0);
});

test('criterion 3 (BL-57 not shipped): real rest is 90 s for Jump Squat 3×6-8 (was 60 s), and Single-Leg Bound rest is unchanged by the /leg wording', (assert)=>{
  const [r] = runSandbox(PARSERS, `
    const rest = (name, sets) => getDefaultRestSeconds({name, sets});
    __capture.push({
      jsOld: rest('Jump Squat', '3×12-15'), jsNew: rest('Jump Squat', '3×6-8'),
      slb: [['3×6', '3×6/leg'], ['3×5/side', '3×5/leg'], ['2×5/side', '2×5/leg']].map(([a, b]) => [rest('Single-Leg Bound', a), rest('Single-Leg Bound', b)]),
    });`);
  assert.strictEqual(r.jsOld, 60);
  assert.strictEqual(r.jsNew, 90, 'the 90 s BL-57 asks for');
  // Every real Jump Squat slot, as shipped, gets 90 s.
  const js = SLOTS.filter(s => s.name === 'Jump Squat');
  const [rests] = runSandbox(PARSERS, `__capture.push(${JSON.stringify(js.map(s => s.sets))}.map(sets => getDefaultRestSeconds({name: 'Jump Squat', sets})));`);
  assert.deepStrictEqual(js.filter((s, i) => rests[i] !== 90).map(s => s.owner + '|' + s.sets), []);
  for(const [before, after] of r.slb) assert.strictEqual(after, before);
});

test('cues render in the real buildDetailsHtml: same-leg landing, and the stop rule; 3 cues each', (assert)=>{
  const { window } = runJsdom('<div id="host"></div>', `function getExerciseIcon(){ return '<svg></svg>'; }`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'exerciseInfo'), extractFunction(src, 'buildDetailsHtml')]);
  const host = window.document.getElementById('host');
  const cues = (name) => { host.innerHTML = window.buildDetailsHtml({ name }); return [...host.querySelectorAll('.ex-cues li')].map(li => li.textContent); };
  const slb = cues('Single-Leg Bound');
  assert.strictEqual(slb[0], 'Hop forward off one leg and land on the same leg; stick each landing for a beat, knee over toes, no cave-in.');
  assert.ok(!slb.some(c => /opposite leg/.test(c)), slb.join(' | '));
  const js = cues('Jump Squat');
  assert.ok(js.some(c => c.includes('stop the set when landings get loud or knees cave')), js.join(' | '));
  assert.strictEqual(slb.length, 3); assert.strictEqual(js.length, 3);
  for(const c of slb.concat(js)) assert.ok(c.split(/\s+/).length <= 24, c);
});

run();
