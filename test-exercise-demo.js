'use strict';
// v3.510 — [EXERCISE DEMO]: the exercise card's "Technique & focus" shows a
// drawn, looping demo of the movement instead of only a YouTube search link
// (owner: "show how the exercise is done natively instead of just linking it
// externally"). The engine and the motions are loaded from index.html and run
// for real; the geometry is checked numerically (bones keep their length, the
// pinned joint holds still, toes stay on the floor), and the card's markup is
// built by the real buildDetailsHtml.
// Real-browser result (Chromium, 402x874, dark and light): Bench Press's card
// shows the figure on its bench with chest and triceps lit and the caption
// swatch; the forearm's on-screen position moves between two readings while
// its base path stays put (SMIL running); with Reduce Motion there are no
// <animate> elements and the working position is drawn. No page errors.
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const src = readIndexSource();
const { test, run } = makeRunner('test-exercise-demo.js');

const ENGINE_CONSTS = ['DEMO_BONES', 'DEMO_GROUND', 'DEMO_MOTIONS', 'DEMO_SEGS', 'DEMO_KIT_BOX', 'EXERCISE_DEMO'];
const ENGINE_ARROWS = ['demoRad', 'demoDir', 'demoAdd', 'demoFx', 'demoPt', 'demoPoly', 'demoSlice'];
const ENGINE_FNS = ['demoJoints', 'demoPlace', 'demoLerpAngle', 'demoPoseAt', 'demoParts', 'demoStatic', 'buildDemoSvg', 'buildExerciseDemoHtml'];
function load({ reduce = false } = {}){
  const { window } = runJsdom('<div id="host"></div>', `
    window.matchMedia = q => ({ matches: ${reduce} && /reduce/.test(q), addEventListener(){}, addListener(){} });`,
    [...ENGINE_CONSTS.map(n => extractConst(src, n)), ...ENGINE_ARROWS.map(n => extractConst(src, n)),
     ...ENGINE_FNS.map(n => extractFunction(src, n)), extractFunction(src, 'escapeHtml'),
     // Exposed for the geometry checks (the script's consts are not window properties).
     'window.__E = { DEMO_BONES, DEMO_MOTIONS, EXERCISE_DEMO, demoPlace, demoPoseAt };']);
  return window;
}
const W = load();
const { DEMO_BONES, DEMO_MOTIONS, EXERCISE_DEMO, demoPlace, demoPoseAt } = W.__E;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const T = Array.from({ length: 24 }, (_, i) => i / 24);

test('REAL map: every mapped exercise is a real catalogued exercise, every motion it names exists, and every motion is used', (assert)=>{
  const { window } = runJsdom('', '', [extractConst(src, 'exerciseInfo'), 'window.__info = exerciseInfo;']);
  const names = Object.keys(EXERCISE_DEMO);
  assert.ok(names.length >= 25, `anchor: the map was read (${names.length})`);
  for(const n of names){
    assert.ok(window.__info[n], `${n} is in exerciseInfo`);
    assert.ok(DEMO_MOTIONS[EXERCISE_DEMO[n]], `${n} -> ${EXERCISE_DEMO[n]} exists`);
  }
  const used = new Set(Object.values(EXERCISE_DEMO));
  for(const k of Object.keys(DEMO_MOTIONS)) assert.ok(used.has(k), `${k} is shown somewhere`);
});

test('REAL geometry: through every frame of every motion, each bone keeps its length', (assert)=>{
  const B = DEMO_BONES;
  const pairs = [['H', 'S', B.torso], ['S', 'E', B.ua], ['E', 'W', B.fa], ['H', 'K', B.th], ['K', 'A', B.sh], ['A', 'T', B.ft],
                 ['S', 'E2', B.ua], ['E2', 'W2', B.fa], ['H', 'K2', B.th], ['K2', 'A2', B.sh], ['S', 'head', B.neck]];
  for(const [name, m] of Object.entries(DEMO_MOTIONS)) for(const t of T){
    const j = demoPlace(m, demoPoseAt(m, t));
    for(const [a, b, len] of pairs) assert.ok(Math.abs(dist(j[a], j[b]) - len) < 0.01, `${name} t=${t} ${a}-${b}`);
  }
});

test('REAL geometry: the pinned joint holds still (feet planted, hands on the bar), and a second contact stays on the floor', (assert)=>{
  let pinned = 0, contacts = 0;
  for(const [name, m] of Object.entries(DEMO_MOTIONS)){
    const lifts = m.poses.some(p => p.lift);
    for(const t of T){
      const j = demoPlace(m, demoPoseAt(m, t));
      if(!lifts){ assert.ok(dist(j[m.pin.joint], m.pin.at) < 0.01, `${name} t=${t}: ${m.pin.joint} at the pin`); pinned++; }
      if(m.contact){ assert.ok(Math.abs(j[m.contact.joint][1] - m.contact.y) < 0.05, `${name} t=${t}: ${m.contact.joint} on the floor`); contacts++; }
    }
  }
  assert.ok(pinned > 400 && contacts >= 48, 'anchor: the checks ran');
  // A standing lift's feet are on the floor, not floating or sunk.
  for(const name of ['backSquat', 'deadlift', 'overheadPress', 'curl', 'barbellRow']){
    const m = DEMO_MOTIONS[name];
    for(const t of T){ const j = demoPlace(m, demoPoseAt(m, t)); assert.ok(Math.abs(j.A[1] - 109) < 0.01 && j.T[1] <= 112, `${name}: feet on the floor`); }
  }
});

test('REAL invocation: a mapped exercise gets a looping SVG whose every animation starts and ends on the same frame', (assert)=>{
  const html = W.buildExerciseDemoHtml('Back Squat');
  const host = W.document.getElementById('host');
  host.innerHTML = html;
  const svg = host.querySelector('figure.ex-demo-wrap > svg.ex-demo');
  assert.ok(svg, 'the figure');
  assert.strictEqual(svg.getAttribute('aria-hidden'), 'true', 'it illustrates the cues and caption, which are read as text');
  assert.strictEqual(svg.getAttribute('data-motion'), 'Squat');
  assert.strictEqual(svg.getAttribute('viewBox').split(' ').length, 4);
  const [, , w, h] = svg.getAttribute('viewBox').split(' ').map(Number);
  assert.ok(Math.abs(w / h - 4 / 3) < 0.01, 'framed 4:3');
  const anims = [...svg.querySelectorAll('animate')];
  assert.strictEqual(anims.length, 19, 'every moving part animates: 12 bones, 3 lit muscles, the bar (x, y), the head (x, y)');
  for(const a of anims){
    const v = a.getAttribute('values').split(';');
    assert.strictEqual(v.length, 25);
    assert.strictEqual(v[0], v[24], 'a seamless loop');
    assert.strictEqual(a.getAttribute('repeatCount'), 'indefinite');
    assert.strictEqual(a.getAttribute('dur'), '3.2s');
  }
  assert.strictEqual(svg.querySelectorAll('path.lit').length, 3, 'thighs and glutes lit');
  assert.strictEqual(svg.querySelectorAll('circle.plate').length, 1, 'the bar');
  assert.strictEqual(host.querySelector('.ex-demo-caption').textContent, 'Quads · glutes');
  assert.ok(host.querySelector('.ex-demo-caption .ex-demo-swatch[aria-hidden="true"]'), 'the swatch says what the blue means');
});

test('REAL invocation: an unmapped exercise has no demo; under Reduce Motion the demo is drawn still, in the working position', (assert)=>{
  assert.strictEqual(W.buildExerciseDemoHtml('Leg Curl'), '', 'its pattern ("squat") would show the wrong movement');
  assert.strictEqual(W.buildExerciseDemoHtml('Not An Exercise'), '');
  const still = load({ reduce: true });
  still.document.getElementById('host').innerHTML = still.buildExerciseDemoHtml('Back Squat');
  const svg = still.document.querySelector('svg.ex-demo');
  assert.strictEqual(svg.querySelectorAll('animate').length, 0);
  // The working position: at the bottom of the squat the hip is far lower than standing.
  const m = DEMO_MOTIONS.backSquat;
  const hipStand = demoPlace(m, demoPoseAt(m, 0)).H[1], hipBottom = demoPlace(m, demoPoseAt(m, 0.5)).H[1];
  assert.ok(hipBottom - hipStand > 15, 'anchor: the two positions differ');
  const torso = svg.querySelector('path.bone.b-torso').getAttribute('d');
  assert.match(torso, new RegExp('^M[\\d.-]+ ' + String(Math.round(hipBottom * 10) / 10).replace('.', '\\.') + 'L'), 'drawn at the bottom');
});

test('REAL invocation: the card\'s Technique & focus leads with the demo where there is one, and keeps the video as a link', (assert)=>{
  const { window } = runJsdom('<div id="host"></div>', `
    window.matchMedia = () => ({ matches:false });
    function getExerciseIcon(){ return '<svg class="pattern-icon"></svg>'; }`,
    [...ENGINE_CONSTS.map(n => extractConst(src, n)), ...ENGINE_ARROWS.map(n => extractConst(src, n)),
     ...ENGINE_FNS.map(n => extractFunction(src, n)), extractFunction(src, 'escapeHtml'),
     extractConst(src, 'exerciseInfo'), extractFunction(src, 'buildDetailsHtml')]);
  const host = window.document.getElementById('host');
  host.innerHTML = window.buildDetailsHtml({ name:'Bench Press' });
  const body = host.querySelector('details.ex-details .ex-detail-body');
  assert.ok(body.classList.contains('has-demo'));
  assert.strictEqual(body.firstElementChild.tagName, 'FIGURE', 'the demo leads');
  assert.strictEqual(body.querySelector('.ex-icon'), null, 'in place of the small pattern icon');
  assert.ok(body.querySelectorAll('.ex-cues li').length >= 3, 'the cues stay');
  assert.match(body.querySelector('a.ex-video-link').href, /youtube\.com\/results/, 'the video stays a link');
  host.innerHTML = window.buildDetailsHtml({ name:'Leg Curl' });
  const plain = host.querySelector('.ex-detail-body');
  assert.ok(!plain.classList.contains('has-demo'));
  assert.ok(plain.querySelector('.ex-icon .pattern-icon'), 'no demo: unchanged');
  assert.strictEqual(plain.querySelector('figure'), null);
});

test('REAL source: the demo is drawn in tokens (light mode follows), with solid mixes rather than translucent limbs', (assert)=>{
  const rule = sel => { const m = new RegExp('\\n\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{([^}]*)\\}').exec(src); if(!m) throw new Error('no ' + sel); return m[1]; };
  assert.match(rule('.ex-demo .bone'), /stroke:color-mix\(in srgb, var\(--text\) 84%, var\(--surface2\)\)/);
  assert.match(rule('.ex-demo .lit'), /stroke:var\(--plate-blue\)/);
  assert.doesNotMatch(rule('.ex-demo .bone'), /opacity/);
  assert.match(rule('.ex-demo-swatch'), /background:var\(--plate-blue\)/, 'the caption swatch is the lit colour');
  // Helpers are namespaced: nothing generic leaked into the global scope.
  for(const n of ['add', 'poly', 'fx', 'pt', 'dirv', 'lerpAngle']) assert.doesNotMatch(src, new RegExp('\\nconst ' + n + ' = '), n);
});

run();
