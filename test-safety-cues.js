'use strict';
// v3.527 (BL-05 + BL-06, audit SAF-5 part 1 and SAF-6): safety cues.
//   - Depth Jump: box height, a landing prerequisite, and Drop Landing for the
//     first 4 weeks, on every one of its program slots (the cue is the one
//     place that renders on every slot; day notes only render on rest days).
//   - Rear Naked Choke Drill and Armbar from Guard Drill: a release rule.
//   - Clinch Knee Drills: knees go into a held pad.
// Real invocation: the real buildDetailsHtml renders the real exerciseInfo in
// jsdom; the slot walk uses the real programs, *_STYLES and
// PROGRAM_DAY_COUNT_VARIANTS tables.
//
//   - v3.528 (BL-05b, audit SAF-4 cue part): Neck Bridges leads with a
//     coach-only line pointing to neck isometrics (6 grappling slots).
//
// Sabotage anchors: revert a Depth Jump cue and criterion 1 fails; drop the
// release cue and BL-06 criterion 1 fails; revert the Neck Bridges cue and
// BL-05b criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-safety-cues.js');

function renderCues(name){
  const { window } = runJsdom('<div id="host"></div>', `function getExerciseIcon(){ return '<svg></svg>'; }`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'exerciseInfo'), extractFunction(src, 'buildDetailsHtml')]);
  const host = window.document.getElementById('host');
  host.innerHTML = window.buildDetailsHtml({ name });
  return [...host.querySelectorAll('.ex-cues li')].map(li => li.textContent);
}

test('BL-05 criterion 1: Depth Jump renders the box height, the prerequisite and the Drop Landing rule', (assert)=>{
  const items = renderCues('Depth Jump');
  const all = items.join('\n');
  assert.ok(all.includes('30–45 cm'), all);
  assert.ok(items.some(t => t.startsWith('Prerequisite:')), all);
  assert.ok(items.some(t => /First 4 weeks: do Drop Landing 3×5 instead/.test(t)), all);
  assert.strictEqual(items.length, 6, 'its 3 cues plus the 3 new ones');
  // The safety gate comes before the how-to (review fix): the first thing read.
  assert.ok(items[0].startsWith('Prerequisite:') && /Drop Landing/.test(items[1]) && /30–45 cm/.test(items[2]), items.slice(0, 3).join(' | '));
});

// One walker for every slot of a named exercise across programs, every
// *_STYLES style and every PROGRAM_DAY_COUNT_VARIANTS day (flat or nested by
// style). A style's days can be the same object as programs[key].days at load
// time, so each day object is counted once.
// Returns [{where, idx, sets}] with where = "<program>/<set>/<day>".
function findSlots(name){
  const [r] = runSandbox([
    extractConst(src, 'programs'), extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'COMBAT_STYLES'),
    extractConst(src, 'CYCLING_STYLES'), extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'YOGA_STYLES'),
    extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
  ], `
    const STYLE_TABLES = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
    const daySets = [];
    for(const key of Object.keys(programs)){
      daySets.push([key + '/base', programs[key].days]);
      for(const [sn, st] of Object.entries(STYLE_TABLES[key] || {})) daySets.push([key + '/' + sn, st.days]);
      for(const [vn, v] of Object.entries(PROGRAM_DAY_COUNT_VARIANTS[key] || {})){
        if(v && v.days) daySets.push([key + '/' + vn + 'd', v.days]);
        else for(const [nn, n] of Object.entries(v || {})) daySets.push([key + '/' + vn + '/' + nn + 'd', n.days]);
      }
    }
    const seen = new Set(); const slots = [];
    for(const [where, days] of daySets) for(const [dn, d] of Object.entries(days || {})){
      if(!d || seen.has(d)) continue; seen.add(d);
      (d.exercises || []).forEach((ex, idx) => { if(ex.name === ${JSON.stringify(name)}) slots.push({where: where + '/' + dn, idx, sets: ex.sets}); });
    }
    __capture.push(slots);
  `);
  return r;
}

test('BL-05 criteria 2-3: every Depth Jump slot (programs, styles, day-count variants) uses that entry, with its sets unchanged', (assert)=>{
  const [cues] = runSandbox([extractConst(src, 'exerciseInfo')], `__capture.push(exerciseInfo['Depth Jump'].cues);`);
  const r = {slots: findSlots('Depth Jump').map(s => s.sets), cues};
  assert.strictEqual(r.slots.length, 20, 'exactly the 20 slots counted at v3.518 (a renamed or lost slot changes this)');
  assert.ok(r.cues.some(c => c.includes('Drop Landing')), 'every slot resolves to the one exerciseInfo entry, which carries the rule');
  const bad = r.slots.filter(s => s !== '4×5' && s !== '3×5');
  assert.deepStrictEqual(bad, [], 'sets unchanged (4×5 Athletic, 3×5 watersports)');
});

test('the slot walk covers every *_STYLES table in the source', (assert)=>{
  const tables = [...src.matchAll(/^const ([A-Z_]+_STYLES)\s*=/gm)].map(m => m[1]).sort();
  assert.deepStrictEqual(tables, ['COMBAT_STYLES', 'CYCLING_STYLES', 'MEDICAL_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES']);
});

test('BL-05 criterion 4: every new cue is 24 words or fewer', (assert)=>{
  const fresh = ['Depth Jump', 'Rear Naked Choke Drill', 'Armbar from Guard Drill', 'Clinch Knee Drills', 'Neck Bridges'].flatMap(n => renderCues(n));
  for(const c of fresh) assert.ok(c.split(/\s+/).length <= 24, c);
});

test('BL-06 criterion 1: the release rule on both grappling drills, and the pad on clinch knees, rendered', (assert)=>{
  for(const n of ['Rear Naked Choke Drill', 'Armbar from Guard Drill']){
    assert.ok(renderCues(n).some(t => t === 'Drill at 30–50% pressure; your partner taps or says tap, you release instantly.'), n);
  }
  assert.ok(renderCues('Clinch Knee Drills').some(t => t === 'Knees go into a pad your partner holds, at controlled speed.'));
});

test('BL-06 criterion 2: no other exercise\'s cue count changed (snapshot from v3.526)', (assert)=>{
  // v3.526 snapshot, read from the real data before this change: all 321
  // exercises had exactly 3 cues, except Eccentric Heel Drop with 4.
  const before = (name) => name === 'Eccentric Heel Drop' ? 4 : 3;
  const [now] = runSandbox([extractConst(src, 'exerciseInfo')], `const o = {}; for(const k in exerciseInfo) o[k] = exerciseInfo[k].cues.length; __capture.push(o);`);
  const edited = {'Depth Jump': 3, 'Rear Naked Choke Drill': 1, 'Armbar from Guard Drill': 1, 'Clinch Knee Drills': 1,
                  'Neck Bridges': 1}; // v3.528 (BL-05b)
  // Exercises added since the snapshot are outside it: v3.563 (BL-36) Drop Landing; v3.564 (BL-35) the neck isometric.
  const added = ['Drop Landing (stick it)', '4-Way Neck Isometric (hand or band)'];
  const changed = Object.keys(now).filter(k => !added.includes(k) && now[k] !== before(k) + (edited[k] || 0));
  assert.deepStrictEqual(changed, []);
  assert.strictEqual(Object.keys(now).length, 321 + added.length, 'no other exercise added or removed');
  assert.ok(added.every(k => k in now), 'anchor: the added exercise is in the library');
});

// ---- v3.528 (BL-05b, audit SAF-4 cue part): Neck Bridges coach-only cue.
// Neck Bridges slots at v3.527 (origin/Branch-1 99b01bf, before this change),
// matching the backlog's list: grappling d6 and the 2-, 3-, 4-, 6- and 7-day
// variants at d3, d4, d5, d6, d6; each the 2nd exercise (index 1).
const POSITIONS_V3527 = ['grappling/2d/d3#1', 'grappling/3d/d4#1', 'grappling/4d/d5#1', 'grappling/6d/d6#1', 'grappling/7d/d6#1', 'grappling/base/d6#1'];
test('BL-05b criterion 1: Neck Bridges leads with the coach-only line, and keeps its pain-free cue', (assert)=>{
  const items = renderCues('Neck Bridges');
  assert.strictEqual(items[0], 'Only with a coach; otherwise do 4-way neck isometrics, 15 s each way at 50% effort.');
  assert.ok(items.some(t => t.includes('only as far as feels stable and pain-free')), 'MUST_KEEP phrase kept');
  assert.strictEqual(items.length, 4);
});

// v3.564 (BL-35): those 6 slots now hold the 4-way neck isometric (4×15s),
// at the same positions; no slot names Neck Bridges any more (its entry stays
// for history and as the swap-back).
test('BL-05b criteria 2-3 (re-pinned by BL-35): the 6 v3.527 Neck Bridges positions now hold the neck isometric, 4×15s; none still names Neck Bridges', (assert)=>{
  assert.deepStrictEqual(findSlots('Neck Bridges'), []);
  const found = findSlots('4-Way Neck Isometric (hand or band)');
  assert.strictEqual(found.length, 6, JSON.stringify(found));
  for(const s of found) assert.strictEqual(s.sets, '4×15s', s.where);
  assert.deepStrictEqual(found.map(s => s.where + '#' + s.idx).sort(), POSITIONS_V3527);
  const [cue0] = runSandbox([extractConst(src, 'exerciseInfo')], `__capture.push(exerciseInfo['Neck Bridges'].cues[0]);`);
  assert.ok(cue0.startsWith('Only with a coach'), 'every slot resolves to the one entry');
});

// ---- v3.569 (BL-25, audit §4 / L-1): exercise cue corrections, each a
// rewrite of one existing cue in place (counts unchanged; the v3.526 snapshot
// test above passes as it is). Sabotage: restore the Hip Thrust line and
// criteria 1 and 2 fail.
const BL25 = {
  'Hip Thrust': 'Lock out and pause 1 s; squats and hip thrusts grow glutes about equally, so use whichever you can load and feel.',
  'DB Curl': 'Lower under control in about 2 s; full stretch at the bottom with arms straight.',
  'Leg Press': 'Lower as deep as your lower back stays flat on the pad.',
  'Deadlift': 'Push the floor away; hips and shoulders rise together until the bar passes the knees.',
  'Lateral Raise': 'Raise in the plane of the shoulder blade, slightly forward; stop at shoulder height.',
  'Dragon Flag': 'Start with tuck or single-leg negatives; stop if your lower back arches off the bench.',
  'Front Lever Hold': 'Progress tuck → advanced tuck → one leg → straddle; hold 10-15 s with straight arms.',
  'Dip (Bar/Ring)': "Lower until your shoulder is level with your elbow, not deeper, unless that's comfortable.",
  'L-sit Hold': 'Press the shoulders down hard; tuck sit first.',
  'Muscle-up': 'Prerequisite: 10 strict pull-ups and 10 dips first; until then, practise the transition with a band.',
};
test('BL-25 criteria 1 and 4: each of the 10 exercises renders its new cue exactly once, at most 24 words, with its cue count unchanged', (assert)=>{
  for(const [name, cue] of Object.entries(BL25)){
    const items = renderCues(name);
    assert.strictEqual(items.filter(t => t === cue).length, 1, name + ': ' + items.join(' | '));
    assert.ok(cue.split(/\s+/).length <= 24, name);
    assert.strictEqual(items.length, 3, name + ' keeps 3 cues');
  }
  assert.ok(renderCues('Front Lever Hold').includes('Too hard? Tuck the knees to the chest and extend one leg as you progress.'), 'BL-64\'s cue 2 is left as it was');
});

test('BL-25 criterion 2: none of the removed claims appears in any cue (Triceps Dip keeps its own "about 90°")', (assert)=>{
  const [all] = runSandbox([extractConst(src, 'exerciseInfo')], `__capture.push(Object.entries(exerciseInfo).map(([k, v]) => [k, v.cues]));`);
  const BAD = ['EMG research ranks', 'most of the growth', 'legs first', 'V-taper', 'Bruce Lee', 'Christopher Sommer', 'one of the most effective', 'one of the best pure ab', "If you're not there yet"];
  const hits = [];
  for(const [name, cues] of all) for(const c of cues){
    for(const b of BAD) if(c.includes(b)) hits.push(name + ': ' + b);
    if(name === 'Leg Press' && c.includes('about 90°')) hits.push('Leg Press: about 90°');
  }
  assert.deepStrictEqual(hits, []);
  assert.ok(all.some(([n, cues]) => n === 'Triceps Dip' && cues.some(c => c.includes('about 90°'))), 'anchor: Triceps Dip keeps its own');
});

run();
