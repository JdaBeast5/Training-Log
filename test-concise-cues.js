'use strict';
// v3.333+ (owner: "Let's do all of them, you can do one by one" — less
// writing app-wide). The exercise technique cues behind "Technique & focus"
// (content-exercises.js: 321 exercises, 964 cues) had 178 cues over 24 words
// (273 over 20). They are rewritten in batches to at most 24, keeping the coaching point
// and every safety line. Cue COUNT per exercise never changes (a shorter cue
// list would be dropped content, not concise content).
//
// Against the REAL exerciseInfo data:
//  1. still 321 exercises and 964 cues;
//  2. cues over 24 words: at most OVER_24_LEFT (0 once every batch lands);
//  3. each rewritten safety cue keeps its key phrase.
const { readIndexSource, extractConst, extractFunction, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-concise-cues.js');

const OVER_24_LEFT = 0; // v3.333: 178 -> 156 (batch 1 rewrote 70 cues over 20 words); v3.334: 78; v3.335: 0

const MUST_KEEP = [
  // v3.333 — batch 1
  /never on the knee/, /Sharp or pinching pain in the front knee or groin means come out/,
  /releases the instant they're asked/, /The person folding controls the depth/, /not the neck or lower back/,
  /not lower back/, /never against the knee/, /glide the nerve, don't stretch it hard/,
  /stand up as quickly as you safely can, then lower slowly/, /bend your knees if hamstrings are tight rather than rounding your back/,
  // v3.334 — batch 2
  /Sharp or pinching finger pain means stop/, /feet-on or large-edge hangs/, /fully relax the pelvic floor between reps/,
  /insulin or a medication that can cause low blood sugar, ask your care team/, /not sharp or worsening pain/,
  /raising on the injured side defeats it/, /harder on the lower back/, /front knee tracking over the foot rather than caving in/,
  // v3.335 — batch 3
  /only as far as feels stable and pain-free/, /without letting the lower back arch/, /planted, rotated foot causes most skimboarding ankle injuries/,
  /21% in elite kayakers/, /keep the low back long rather than crunching/,
];

function cues(){
  const [out] = runSandbox([extractConst(src, 'exerciseInfo')], `
    const o = {}; for(const [k, v] of Object.entries(exerciseInfo)) o[k] = v.cues;
    __capture.push(JSON.parse(JSON.stringify(o)));`);
  return out;
}

// v3.527 (BL-05 + BL-06): +3 Depth Jump safety cues, +1 each on Rear Naked
// Choke Drill, Armbar from Guard Drill and Clinch Knee Drills (964 -> 970).
// v3.528 (BL-05b): +1 Neck Bridges coach-only cue (970 -> 971).
test('REAL data: no cue was dropped — 321 exercises, 971 cues', (assert)=>{
  const c = cues();
  assert.strictEqual(Object.keys(c).length, 321);
  assert.strictEqual(Object.values(c).flat().length, 971);
});

test('REAL data: cues over 24 words are down to ' + OVER_24_LEFT, (assert)=>{
  const over = Object.values(cues()).flat().filter(t => t.split(/\s+/).length > 24);
  assert.ok(over.length <= OVER_24_LEFT, `${over.length} cues still over 24 words`);
});

test('REAL data: each rewritten safety cue kept its key phrase', (assert)=>{
  const all = Object.values(cues()).flat().join('\n');
  assert.deepStrictEqual(MUST_KEEP.filter(p => !p.test(all)).map(String), []);
});

// ---- v3.530 (BL-62, audit S-4, S-5, C-3): clinical dose and position wording.
// Each edited prescription keeps every real parser result it had at v3.529:
// set count, rep tier, and the rep target BL-76 reads past "/leg" and "(…)".
const BL62_TABLE = [
  ['3×15 (straight-knee, 3s eccentric lower)', '3×15/leg (straight-knee, 3s eccentric lower)'],
  ['3×15 (bent-knee, 3s eccentric lower)',     '3×15/leg (bent-knee, 3s eccentric lower)'],
  ['3×10', '3×10/leg'],
  ['3×12', '3×12/leg'],
  ['4×20', '4×20 (10/leg)'],
  ['3×20', '3×20 (10/leg)'],
];
// Every slot BL-62 edits, walked over the real programs, every *_STYLES table
// and every PROGRAM_DAY_COUNT_VARIANTS day (each day object counted once).
function slotSets(name, programKeys){
  const [r] = runSandbox([
    extractConst(src, 'programs'), extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'COMBAT_STYLES'),
    extractConst(src, 'CYCLING_STYLES'), extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'YOGA_STYLES'),
    extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'),
  ], `
    const T = {medical: MEDICAL_STYLES, combat: COMBAT_STYLES, cycling: CYCLING_STYLES, watersports: WATERSPORTS_STYLES, yoga: YOGA_STYLES};
    const sets = []; const seen = new Set();
    for(const key of Object.keys(programs)){
      const daySets = [[key, programs[key].days]];
      for(const [sn, st] of Object.entries(T[key] || {})) daySets.push([sn, st.days]);
      // A style program's variants nest as [key][style][n]: label them by style.
      for(const [vn, v] of Object.entries(PROGRAM_DAY_COUNT_VARIANTS[key] || {})){
        if(v && v.days) daySets.push([key, v.days]); else for(const n of Object.values(v || {})) daySets.push([vn, n.days]);
      }
      for(const [owner, days] of daySets) for(const d of Object.values(days || {})){
        if(!d || seen.has(d)) continue; seen.add(d);
        for(const ex of (d.exercises || [])) if(ex.name === ${JSON.stringify(name)}) sets.push(owner + '|' + ex.sets);
      }
    }
    __capture.push(sets);
  `);
  return programKeys ? r.filter(s => programKeys.includes(s.split('|')[0])) : r;
}

test('BL-62 criterion 1: real parseSetCount, getRepRangeTier, parseTopRep and parseBottomRep are unchanged for each edited string', (assert)=>{
  const [r] = runSandbox(['parseSetCount', 'getRepRangeTier', 'parseTopRep', 'parseBottomRep'].map(f => extractFunction(src, f)), `
    const T = ${JSON.stringify(BL62_TABLE)};
    __capture.push(T.map(([a, b]) => [a, b].map(s => [parseSetCount(s), getRepRangeTier(s), parseTopRep(s), parseBottomRep(s)])));`);
  r.forEach(([before, after], i) => {
    assert.deepStrictEqual(after, before, BL62_TABLE[i][1]);
    assert.ok(after[2] !== null && after[1] !== null, 'a rep target and tier are read: ' + BL62_TABLE[i][1]);
  });
});

test('BL-62: every edited slot carries the new wording (6 heel drops, 3 Straight Leg Raises, 7 Sandbag Lunges), and no old string is left', (assert)=>{
  const heel = slotSets('Eccentric Heel Drop');
  assert.strictEqual(heel.length, 6, heel.join('; '));
  for(const s of heel) assert.ok(/^rehabAchilles\|3×15\/leg \((straight|bent)-knee, 3s eccentric lower\)$/.test(s), s);
  const slr = slotSets('Straight Leg Raise', ['rehabAcl', 'rehabGeneral']).sort();
  assert.deepStrictEqual(slr, ['rehabAcl|3×10/leg', 'rehabAcl|3×12/leg', 'rehabGeneral|3×10/leg']);
  // Senior's 2×10-12 is outside BL-62's spec and stays as written.
  assert.ok(slotSets('Straight Leg Raise', ['senior']).every(s => s === 'senior|2×10-12'));
  const lunges = slotSets('Sandbag Lunges');
  assert.strictEqual(lunges.length, 7, lunges.join('; '));
  for(const s of lunges) assert.ok(/^hyrox\|[34]×20 \(10\/leg\)$/.test(s), s);
});

test('BL-62 criterion 3: no prenatal exercise cue says "lie down" without a side-lying option; the breathing cue is rewritten, not added', (assert)=>{
  const [r] = runSandbox([extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'exerciseInfo')], `
    const names = new Set(Object.values(MEDICAL_STYLES.prenatal.days).flatMap(d => (d.exercises || []).map(e => e.name)));
    __capture.push({names: [...names], cues: [...names].flatMap(n => (exerciseInfo[n] ? exerciseInfo[n].cues : [])),
                    breath: exerciseInfo['Diaphragmatic Breathing'].cues});`);
  assert.ok(r.names.includes('Diaphragmatic Breathing'), 'the sweep reaches the breathing exercise');
  const bad = r.cues.filter(c => /lie down/i.test(c) && !/on your side/i.test(c));
  assert.deepStrictEqual(bad, []);
  assert.strictEqual(r.breath[0], 'Sit tall or lie down (on your side if pregnant), one hand on chest, one on belly; the belly rises more than the chest.');
  assert.ok(r.breath[0].split(/\s+/).length <= 24);
  assert.strictEqual(r.breath.length, 3, 'count unchanged');
});

// ---- v3.531 (BL-64, audit C-4): cue contradictions, each a rewrite in place.
// One jsdom window running the real buildDetailsHtml over the real exerciseInfo.
let detailsWindow = null;
function renderedCues(name){
  if(!detailsWindow) detailsWindow = runJsdom('<div id="host"></div>', `function getExerciseIcon(){ return '<svg></svg>'; }`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'exerciseInfo'), extractFunction(src, 'buildDetailsHtml')]).window;
  const host = detailsWindow.document.getElementById('host');
  host.innerHTML = detailsWindow.buildDetailsHtml({ name });
  return [...host.querySelectorAll('.ex-cues li')].map(li => li.textContent);
}
const BL64 = {
  'Chair Pose': 'Knees track in line with your toes and may travel forward as long as your heels stay down.',
  'Partner Chair Pose (Back-to-Back)': 'Knees track in line with your toes and may travel forward as long as heels stay down; come up on a shared count.',
  'Good Morning': 'Keep your back flat; hinge until your torso nears parallel or your back starts to round.',
  'Front Lever Hold': 'Too hard? Tuck the knees to the chest and extend one leg as you progress.',
  'Hammer Curl': 'The neutral grip shifts work to the brachioradialis; keep the tempo you use for other curls.',
  'Hanging Leg Raise': 'Lower under control to a full hang.',
};

test('BL-64: each rewritten cue renders in the real buildDetailsHtml, with the cue count unchanged', (assert)=>{
  for(const [name, cue] of Object.entries(BL64)){
    const items = renderedCues(name);
    assert.ok(items.includes(cue), name + ': ' + items.join(' | '));
    assert.strictEqual(items.length, 3, name);
  }
});

test('BL-64: no cue anywhere tells you to keep the knees behind the toes, and the contradicted phrases are gone', (assert)=>{
  const c = cues();
  const knee = Object.entries(c).flatMap(([n, l]) => l.filter(t => /not past|pass(es)? the toes|past (your |the )?toes|behind (your |the )?toes|beyond (your |the )?toes|in front of (your |the )?toes/i.test(t)).map(t => n + ': ' + t));
  assert.deepStrictEqual(knee, []);
  const all = Object.values(c).flat().join('\n');
  for(const old of [/bar path close to your body/, /hips slightly tucked/, /slower than a standard curl/, /eccentric is where the core works hardest/]) assert.ok(!old.test(all), String(old));
});

run();
