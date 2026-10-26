'use strict';
// v3.330+ (owner: "overall just less writing and less redundancy in the app
// with its writing"). Day notes — the line shown on a rest day, and the
// guidance some program days carry — ran up to 64 words, several repeating
// what the day already said. The long ones are rewritten in two batches,
// keeping every number, threshold and "see a doctor" sign.
//
// Against the REAL data: every `note` on a day object in programs, the five
// style containers and the day-count variants is collected, then
//  1. length: at most CEILING words (lowered as batches land);
//  2. content: each rewritten safety note still carries its key phrase.
const { readIndexSource, extractConst, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-concise-day-notes.js');

const CEILING = 45; // v3.330: the 40 longest rewritten; the rest are <= 42

const MUST_KEEP = [
  // v3.330 — first batch (medical and safety content)
  /never hold your breath under load/, /3×15 straight-knee heel drops/, /stop for sharp or worsening pain/i,
  /within about 10-15% of the other leg/, /not before 9 months/, /every 30-60 minutes/,
  /insulin or a medication that can cause low blood sugar/, /surgical\/bariatric team has the final word/,
  /your PT signs off/, /electrolytes/, /hinging at the hips, never by rounding the spine/,
  /radiates down a leg, worsens, or comes with numbness or weakness needs a doctor/,
  /15 reps on a lower-body move or 12 on an upper-body/, /150-300 minutes/, /experienced with osteoporosis/,
  /150 minutes of moderate aerobic activity/, /about 3 minutes every 30 minutes/, /7 days a week/,
  /Weight-bearing cardio/, /keeps declining for years after surgery/, /only once your PT confirms/,
  /talk test/, /Avoid maximal or near-maximal lifts entirely/,
  /vertebral compression fracture/, /much less strain on the lower back than crunches/,
  /Start quad activation right away/, /4-6 weeks after surgery, once your team clears it/, /Isometric holds \(30-45 seconds\)/,
];

function dayNotes(){
  const chunks = [
    extractConst(src, 'programs'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'), extractFunction(src, 'isCustomProgramKey'),
    ...['COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES', 'MEDICAL_STYLES', 'PROGRAM_DAY_COUNT_VARIANTS'].map(n => extractConst(src, n)),
  ];
  const [notes] = runSandbox(chunks, `
    const out = [];
    const seen = new Set();
    (function walk(o){
      if(!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
      if(typeof o.note === 'string' && typeof o.label === 'string') out.push(o.note);
      for(const v of Object.values(o)) walk(v);
    })({programs, COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES, MEDICAL_STYLES, PROGRAM_DAY_COUNT_VARIANTS});
    __capture.push(out);
  `);
  return notes;
}

test('REAL data: every day note is at most ' + CEILING + ' words', (assert)=>{
  const notes = dayNotes();
  assert.ok(notes.length > 500, `anchor: the real day notes (${notes.length})`);
  assert.deepStrictEqual(notes.filter(n => n.split(/\s+/).length > CEILING), []);
});

test('REAL data: each rewritten safety note kept its key phrase', (assert)=>{
  const all = dayNotes().join('\n');
  assert.deepStrictEqual(MUST_KEEP.filter(p => !p.test(all)).map(String), []);
});

run();
