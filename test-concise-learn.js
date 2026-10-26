'use strict';
// v3.336+ (owner: "Let's do all of them, you can do one by one" — less writing
// app-wide). Learn's technique masterclasses (content-masterclasses.js: 14
// sports, 274 techniques, 1,370 points, ~50,000 words) are rewritten one
// sport per version so each point is at most 25 words. Every technique keeps
// its five points and each point keeps its label (Setup, Execution,
// Whole-body integration, Common mistake, Coaching/Judging insight) — the
// structure the masterclass renderer shows; only the wording gets shorter.
//
// Against the REAL data: per-technique point count and labels unchanged for
// every sport; the 25-word ceiling for each sport in DONE; and the safety
// phrases each rewritten sport must keep.
const { readIndexSource, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-concise-learn.js');

const CONSTS = ['POSE_DETAILS', 'SWIM_STROKE_DETAILS', 'CLIMB_TECHNIQUE_DETAILS', 'WATERSPORTS_TECHNIQUE_DETAILS', 'GRAPPLE_TECHNIQUE_DETAILS',
  'OLY_TECHNIQUE_DETAILS', 'STRENGTH_TECHNIQUE_DETAILS', 'RUNNING_TECHNIQUE_DETAILS', 'HYROX_TECHNIQUE_DETAILS', 'PILATES_TECHNIQUE_DETAILS',
  'YOGA_TECHNIQUE_DETAILS', 'CALISTHENICS_TECHNIQUE_DETAILS', 'CYCLING_TECHNIQUE_DETAILS', 'COMBAT_TECHNIQUE_DETAILS'];

const DONE = [
  'POSE_DETAILS', // v3.336
  'STRENGTH_TECHNIQUE_DETAILS', // v3.337
  'OLY_TECHNIQUE_DETAILS', // v3.338
  'RUNNING_TECHNIQUE_DETAILS', // v3.339
  'HYROX_TECHNIQUE_DETAILS', // v3.340
  'PILATES_TECHNIQUE_DETAILS', // v3.341
  'YOGA_TECHNIQUE_DETAILS', // v3.342
];

const MUST_KEEP = [
  // v3.336 — posing: no safety content; the scoring facts each pose turns on
  /never stand square/, /symmetry/, /exhale sharply and completely/, /glute-hamstring tie-in/,
  // v3.337 — strength
  /knees caving in/, /linked to knee strain/, /butt wink/, /needs mobility work, not pushing through/,
  /elbows tucked about 45-75°/, /impingement/, /lower back over-arching|lower back over-arch/, /Valsalva/,
  // v3.338
  /early-extension|extending the hips before the knees/, /leaning back during the drive/, /elbows dropping/,
  // v3.339
  /5-10%/, /8-12 weeks/, /overstriding/, /leaning back/,
  // v3.340
  /152kg/, /102kg/, /200m/, /10 feet/, /9 feet/, /time penalty/, /can't be dropped mid-effort/,
  // v3.341
  /never the neck/, /raise the legs or bend the knees/, /hands support the head/,
  // v3.342
  /never on the knee/, /never turn your head/, /not the neck/, /shoulder irritation/,
];

function learn(){
  const [out] = runSandbox(CONSTS.map(n => extractConst(src, n)), `__capture.push(JSON.parse(JSON.stringify({${CONSTS.join(',')}})));`);
  return out;
}
const label = p => (p.match(/^([A-Z][A-Za-z /&-]{2,40}):/) || [])[1];

test('REAL data: every technique keeps five labelled points (structure unchanged)', (assert)=>{
  const all = learn();
  const techniques = Object.values(all).flatMap(o => Object.values(o));
  assert.strictEqual(techniques.length, 274, 'anchor: the real 274 techniques');
  assert.deepStrictEqual(techniques.filter(t => t.points.length !== 5).length, 0);
  assert.deepStrictEqual(techniques.flatMap(t => t.points).filter(p => !label(p)), []);
  for(const t of techniques){
    const labels = t.points.map(label);
    assert.strictEqual(labels[0], 'Setup'); assert.strictEqual(labels[1], 'Execution'); assert.strictEqual(labels[3], 'Common mistake');
  }
});

test('REAL data: rewritten sports have no point over 25 words', (assert)=>{
  const all = learn();
  const long = DONE.flatMap(c => Object.entries(all[c]).flatMap(([name, t]) => t.points.filter(p => p.split(/\s+/).length > 25).map(p => `${c} / ${name}: ${p.slice(0, 50)}`)));
  assert.deepStrictEqual(long, []);
});

test('REAL data: each rewritten sport kept its key phrases', (assert)=>{
  const text = JSON.stringify(learn());
  assert.deepStrictEqual(MUST_KEEP.filter(p => !p.test(text)).map(String), []);
});

run();
