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
// Sabotage anchor: revert a Depth Jump cue and criterion 1 fails; drop the
// release cue and BL-06 criterion 1 fails.
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

test('BL-05 criteria 2-3: every Depth Jump slot (programs, styles, day-count variants) uses that entry, with its sets unchanged', (assert)=>{
  const [r] = runSandbox([
    extractConst(src, 'programs'), extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'COMBAT_STYLES'),
    extractConst(src, 'CYCLING_STYLES'), extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'YOGA_STYLES'),
    extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'), extractConst(src, 'exerciseInfo'),
  ], `
    const STYLE_TABLES = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
    const daySets = [];
    for(const key of Object.keys(programs)){
      daySets.push(programs[key].days);
      for(const st of Object.values(STYLE_TABLES[key] || {})) daySets.push(st.days);
      for(const v of Object.values(PROGRAM_DAY_COUNT_VARIANTS[key] || {})){
        if(v && v.days) daySets.push(v.days); else for(const n of Object.values(v || {})) daySets.push(n.days);
      }
    }
    // A style's days can be the same object as programs[key].days at load
    // time; count each day object once.
    const seen = new Set(); const slots = [];
    for(const days of daySets) for(const d of Object.values(days || {})){
      if(!d || seen.has(d)) continue; seen.add(d);
      for(const ex of (d.exercises || [])) if(ex.name === 'Depth Jump') slots.push(ex.sets);
    }
    __capture.push({slots, cues: exerciseInfo['Depth Jump'].cues});
  `);
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
  const fresh = ['Depth Jump', 'Rear Naked Choke Drill', 'Armbar from Guard Drill', 'Clinch Knee Drills'].flatMap(n => renderCues(n));
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
  const edited = {'Depth Jump': 3, 'Rear Naked Choke Drill': 1, 'Armbar from Guard Drill': 1, 'Clinch Knee Drills': 1};
  const changed = Object.keys(now).filter(k => now[k] !== before(k) + (edited[k] || 0));
  assert.deepStrictEqual(changed, []);
  assert.strictEqual(Object.keys(now).length, 321, 'no exercise added or removed');
});

run();
