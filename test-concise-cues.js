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
const { readIndexSource, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-concise-cues.js');

const OVER_24_LEFT = 156; // v3.333: 178 -> 156 (batch 1 rewrote 70 cues over 20 words)

const MUST_KEEP = [
  // v3.333 — batch 1
  /never on the knee/, /Sharp or pinching pain in the front knee or groin means come out/,
  /releases the instant they're asked/, /The person folding controls the depth/, /not the neck or lower back/,
  /not lower back/, /never against the knee/, /glide the nerve, don't stretch it hard/,
  /stand up as quickly as you safely can, then lower slowly/, /bend your knees if hamstrings are tight rather than rounding your back/,
];

function cues(){
  const [out] = runSandbox([extractConst(src, 'exerciseInfo')], `
    const o = {}; for(const [k, v] of Object.entries(exerciseInfo)) o[k] = v.cues;
    __capture.push(JSON.parse(JSON.stringify(o)));`);
  return out;
}

test('REAL data: no cue was dropped — 321 exercises, 964 cues', (assert)=>{
  const c = cues();
  assert.strictEqual(Object.keys(c).length, 321);
  assert.strictEqual(Object.values(c).flat().length, 964);
});

test('REAL data: cues over 24 words are down to ' + OVER_24_LEFT, (assert)=>{
  const over = Object.values(cues()).flat().filter(t => t.split(/\s+/).length > 24);
  assert.ok(over.length <= OVER_24_LEFT, `${over.length} cues still over 24 words`);
});

test('REAL data: each rewritten safety cue kept its key phrase', (assert)=>{
  const all = Object.values(cues()).flat().join('\n');
  assert.deepStrictEqual(MUST_KEEP.filter(p => !p.test(all)).map(String), []);
});

run();
