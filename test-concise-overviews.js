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
//
// v3.323+ (owner: "overall just less writing and less redundancy in the app
// with its writing"): the 222 day-count variant overviews (shown in place of
// the main overview once a days-per-week is picked) are rewritten the same
// way, per program, to at most 45 words. VARIANTS_DONE lists the programs
// rewritten so far. Their per-program rules (distinct per count, oly's
// "coaching consensus" honesty) stay in test-configurable-training-days.js.
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
  // v3.320 — watersports disciplines
  'WATERSPORTS_STYLES.surfing': [/paddling/, /posterior-shoulder/, /Land conditioning only/],
  'WATERSPORTS_STYLES.skimboarding': [/planted foot/, /outstretched hand/, /Land support only/],
  'WATERSPORTS_STYLES.wakeboarding': [/ACL/, /shoulder dislocation/, /head and neck injuries/, /can't address/],
  'WATERSPORTS_STYLES.kiteAssisted': [/ankle/, /supervised kite instruction/, /self-rescue/],
  'WATERSPORTS_STYLES.sup': [/most-injured/, /from the hips/],
  'WATERSPORTS_STYLES.kayaking': [/leg drive/, /Locking the knees/, /lower back/],
  // v3.321 — medically modified programs: every clearance, limit and warning sign
  'MEDICAL_STYLES.obesity': [/consisten/, /not a treatment plan/, /medication, bariatric surgery/],
  'MEDICAL_STYLES.hypertension': [/never hold your breath under load/, /doctor's clearance/, /cardiac history/],
  'MEDICAL_STYLES.diabetes': [/after meals/, /hypoglycemia/, /insulin/, /can't detect or manage/],
  'MEDICAL_STYLES.osteoporosis': [/no spinal flexion under load/, /twisting/, /DEXA/, /fracture history/],
  'MEDICAL_STYLES.bariatricEarly': [/no abdominal work/, /8-12 weeks/, /surgical team/],
  'MEDICAL_STYLES.bariatricRebuilding': [/surgical team clears/, /clinical decision/, /protein/],
  'MEDICAL_STYLES.prenatal': [/recommended default/, /cleared by your OB/, /bleeding, contractions, chest pain or dizziness/],
  'MEDICAL_STYLES.postpartum': [/pelvic-floor-first/, /caesarean/, /leaking, heaviness or pain/],
  'MEDICAL_STYLES.rehabGeneral': [/more than one area/, /doctor or PT/],
  'MEDICAL_STYLES.rehabShoulder': [/three phases/, /instability or referred neck pain/, /doctor or PT/],
  'MEDICAL_STYLES.rehabAcl': [/nine to twelve months/, /seven times/, /surgeon and physical therapist/],
  'MEDICAL_STYLES.rehabAchilles': [/Alfredson/, /insertional/, /rupture/, /doctor or PT/],
  'MEDICAL_STYLES.rehabLowerback': [/neutral spine/, /McGill/, /saddle numbness/, /seek care immediately/],
};

const VARIANTS_DONE = [
  // v3.323
  'strength', 'bodybuilding', 'oly', 'powerlifting', 'powerbuilding',
  // v3.324
  'athletic', 'bodyweight', 'calisthenics', 'core', 'jumprope',
  // v3.325
  'mobility', 'running', 'swimming', 'climbing', 'senior',
  // v3.326
  'desk', 'pilates', 'boxingsc', 'hyrox', 'grappling',
  // v3.327
  'cycling.road', 'cycling.mountain', 'combat.kickboxing', 'combat.boxing', 'combat.muayThai',
  // v3.328
  'combat.mma', 'combat.taekwondo', 'combat.taiChi', 'yoga.flow', 'yoga.hot', 'yoga.couples',
];

function variants(){
  const [out] = runSandbox([extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS')], `
    const out = {};
    (function walk(o, path){ for(const [k, v] of Object.entries(o)){ if(v && typeof v === 'object'){
      if(typeof v.overview === 'string' && v.days) out[path.concat(k).join('.')] = v.overview; else walk(v, path.concat(k)); } } })(PROGRAM_DAY_COUNT_VARIANTS, []);
    __capture.push(JSON.parse(JSON.stringify(out)));
  `);
  return out;
}

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

test('REAL data: every rewritten overview is at most 70 words — all 55 by v3.321', (assert)=>{
  const all = entries();
  const keys = Object.keys(MUST_KEEP);
  assert.strictEqual(Object.keys(all).length, 55, 'anchor: the real 55 programs and styles');
  assert.deepStrictEqual(Object.keys(all).filter(k => !keys.includes(k)), [], 'every overview has been rewritten and listed');
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

test('REAL data (v3.323+): day-count variant overviews of the rewritten programs are at most 45 words', (assert)=>{
  const all = variants();
  assert.strictEqual(Object.keys(all).length, 222, 'anchor: the real 222 day-count variants');
  const done = Object.keys(all).filter(p => VARIANTS_DONE.includes(p.split('.')[0]) || VARIANTS_DONE.includes(p.split('.').slice(0, 2).join('.')));
  assert.strictEqual(done.length, VARIANTS_DONE.length * 6, 'anchor: six variants per listed program');
  assert.deepStrictEqual(done.map(p => [p, all[p].split(/\s+/).length]).filter(([, n]) => n > 45), []);
});

test('REAL data (v3.323+): no overview tells the user to read the code or the app\u2019s own citations', (assert)=>{
  // Variants: the rewritten programs (later batches remove the rest).
  const done = Object.entries(variants()).filter(([p]) => VARIANTS_DONE.includes(p.split('.')[0]) || VARIANTS_DONE.includes(p.split('.').slice(0, 2).join('.'))).map(([, t]) => t);
  const texts = [...done, ...Object.values(entries())];
  assert.deepStrictEqual(texts.filter(t => /in-code|this app's own citations|the same citation this program|own rest-day note|see its own overview|own citation note|see its own rest-day notes|this program's own reasoning|this program's own rest-day note/i.test(t)), []);
});

run();
