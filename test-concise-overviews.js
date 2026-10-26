'use strict';
// v3.317+ (owner: "I wanted the writing to be more concise without losing
// important content"). The 55 program/style overviews shown open on Today
// averaged ~110 words each. They are rewritten in batches to roughly half,
// keeping what someone needs to choose: the week's structure, who it is for,
// how it differs from its nearest neighbour, and every safety caveat.
//
// Two checks per rewritten entry, against the REAL data extracted from
// index.html (test-program-overview.js still enforces 3-5 sentences, >=200
// characters and "not a copy of short" for all 55):
//  1. length: at most 70 words;
//  2. content: the point that must survive the cut is still there (a phrase
//     per entry below) — a shorter overview that dropped "none of these teach
//     you to fight safely" would be a worse one, not a more concise one.
// Each batch adds its entries to MUST_KEEP.
const { readIndexSource, extractConst, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-concise-overviews.js');

const MUST_KEEP = {
  // v3.317 — main programs, first batch
  'programs.strength': [/four-day/, /Powerbuilding/],
  'programs.bodybuilding': [/five-day/, /twice a week/],
  'programs.oly': [/snatch and clean & jerk/, /coach/],
  'programs.athletic': [/full rest/, /bigger muscles/],
  'programs.combat': [/Tai Chi/, /not sparring instruction/, /fight safely/],
  'programs.cycling': [/Road/, /Mountain/, /FTP/],
  'programs.core': [/resisting movement/, /bolt onto another program/, /Pilates/],
  'programs.bodyweight': [/no gym/, /harder variations/],
  'programs.jumprope': [/double-unders/, /combat sports/],
  'programs.mobility': [/not a strength program/, /deload/],
  'programs.running': [/Jack Daniels/, /tempo and intervals/, /long run/],
  'programs.calisthenics': [/muscle-ups/, /in order/],
  'programs.powerlifting': [/competition rep ranges/, /meet prep/],
  // v3.318 — main programs, second batch
  'programs.medical': [/bariatric/, /prenatal and postpartum/, /care team's clearance first/, /safety notes/],
  'programs.yoga': [/Vinyasa & Flow/, /Hot Yoga/, /Partner Yoga/],
  'programs.powerbuilding': [/5x5/, /pump day/, /Strength & Size/],
  'programs.senior': [/chair/, /balance/, /fall risk/, /lowered slowly/],
  'programs.swimming': [/dryland/, /prehab, not proven prevention/],
  'programs.watersports': [/Kayaking/, /Land-based/, /None of these teach the water skill/],
  'programs.climbing': [/antagonist-and-shoulder/, /years, not weeks/, /overuse/],
  'programs.boxingsc': [/not punches or defense/, /not a substitute for learning to box/],
  'programs.desk': [/prolonged sitting/, /movement breaks/, /best-evidenced/],
  'programs.hyrox': [/compromised running/, /brick intervals/, /harder than a typical endurance plan/],
  'programs.grappling': [/live positional rolling/, /conditioning in its own right/],
  'programs.pilates': [/no ballistic movement/, /not gentle stretching/],
  // v3.319 — martial-art, cycling and yoga styles
  'COMBAT_STYLES.kickboxing': [/without clinch/, /not sparring instruction/],
  'COMBAT_STYLES.boxing': [/head-impact safety/, /take a punch safely/],
  'COMBAT_STYLES.muayThai': [/eight-limb/, /real injury risk/, /coached training/],
  'COMBAT_STYLES.mma': [/transitions/, /not the live skill/],
  'COMBAT_STYLES.taekwondo': [/hip mobility/, /landing base/],
  'COMBAT_STYLES.taiChi': [/fall risk/, /60 and over/, /don't expect or add intensity/],
  'CYCLING_STYLES.road': [/FTP/, /polarized/, /pyramidal/],
  'CYCLING_STYLES.mountain': [/descend/, /trail time/],
  'YOGA_STYLES.flow': [/Restorative/, /moderate intensity/, /not calorie burn/],
  'YOGA_STYLES.hot': [/hydration/, /doesn't clearly beat unheated yoga/, /pregnancy/, /medical clearance/],
  'YOGA_STYLES.couples': [/person being stretched sets the depth/, /out loud/],
};

function entries(){
  const chunks = [
    extractConst(src, 'programs'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'), extractFunction(src, 'isCustomProgramKey'),
    ...['COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES', 'MEDICAL_STYLES'].map(n => extractConst(src, n)),
  ];
  const [all] = runSandbox(chunks, `
    const out = {};
    for(const k of Object.keys(programs).filter(k => !isCustomProgramKey(k))) out['programs.' + k] = programs[k].overview;
    const sets = {COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES, MEDICAL_STYLES};
    for(const [name, obj] of Object.entries(sets)) for(const k of Object.keys(obj)) out[name + '.' + k] = obj[k].overview;
    __capture.push(JSON.parse(JSON.stringify(out)));
  `);
  return all;
}

test('REAL data: every rewritten overview is at most 70 words', (assert)=>{
  const all = entries();
  const keys = Object.keys(MUST_KEEP);
  assert.deepStrictEqual(keys.filter(k => !(k in all)), [], 'anchor: every listed entry exists in the real data');
  const long = keys.map(k => [k, all[k].split(/\s+/).length]).filter(([, n]) => n > 70);
  assert.deepStrictEqual(long, []);
});

test('REAL data: the point each overview must keep survived the cut', (assert)=>{
  const all = entries();
  const lost = [];
  for(const [k, patterns] of Object.entries(MUST_KEEP)) for(const p of patterns) if(!p.test(all[k])) lost.push(`${k}: ${p}`);
  assert.deepStrictEqual(lost, []);
});

run();
