'use strict';
// v3.513 — [ANATOMY 3D]: exercise demos with an anatomical 3D human, replacing
// v3.510's drawn figure (owner: "a human animation showing anatomically correct
// movements … it shouldn't be stick figures"). First lifts: squat, bench press,
// deadlift; the rest are added program by program.
//
// The engine (assets/anatomy/anatomy.js) and the real model are loaded in Node
// and the mechanics checked through every part of each rep: feet stay planted,
// hands stay on the bar, no bone stretches, the bar stays over mid-foot, the
// deadlift starts with the plates on the floor, the squat reaches parallel, the
// bench bar touches the chest. The index.html glue runs in jsdom with the stage
// stubbed at its one seam (loadAnatomyStage). WebGL itself is not available
// here; see the real-browser result below.
// Real-browser result (Chromium/SwiftShader, 402x874 dark): opening Bench
// Press's Technique & focus imports the module, the shared canvas mounts
// (588x442 device px), two screenshots 1.2 s apart differ (the rep plays),
// chest and front delts lit, shadow on the floor; no page errors.
const fs = require('fs'), os = require('os'), path = require('path');
const { pathToFileURL } = require('url');
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const src = readIndexSource();
const { test, run } = makeRunner('test-anatomy-3d.js');

// Node runs .js as CommonJS here, so the two ES modules are copied to .mjs
// (the engine's import of Three.js pointed at the copy). Content unchanged.
let E, THREE;
async function loadEngine(){
  if(E) return E;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anatomy-'));
  const threePath = path.join(dir, 'three.mjs');
  fs.copyFileSync(path.join(__dirname, 'assets/vendor/three-0.170.0.module.min.js'), threePath);
  const engineSrc = fs.readFileSync(path.join(__dirname, 'assets/anatomy/anatomy.js'), 'utf8');
  if((engineSrc.match(/from '\.\.\/vendor\/three-0\.170\.0\.module\.min\.js'/g) || []).length !== 1) throw new Error('anchor: one import of the vendored Three.js');
  fs.writeFileSync(path.join(dir, 'anatomy.mjs'), engineSrc.replace("'../vendor/three-0.170.0.module.min.js'", JSON.stringify(pathToFileURL(threePath).href)));
  E = await import(pathToFileURL(path.join(dir, 'anatomy.mjs')).href);
  THREE = await import(pathToFileURL(threePath).href);
  return E;
}
const glbBuf = () => { const b = fs.readFileSync(path.join(__dirname, 'assets/anatomy/human-v1.glb')); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
const U = Array.from({ length: 21 }, (_, i) => i / 20);

test('REAL model: the CC0 MakeHuman body, 163-bone rig, and 12 muscle maps in the engine\'s order', async (assert)=>{
  const { parseHumanGlb, buildHuman, MUSCLE_ORDER } = await loadEngine();
  const glb = parseHumanGlb(glbBuf());
  assert.match(glb.json.asset.copyright, /CC0/);
  assert.deepStrictEqual(glb.muscles.flat(), MUSCLE_ORDER);
  const h = buildHuman(glb);
  assert.strictEqual(h.skeleton.bones.length, 163);
  for(const a of ['muscle0', 'muscle1', 'muscle2']){
    const at = h.geo.attributes[a];
    assert.ok(at && at.itemSize === 4 && at.normalized && at.array instanceof Uint8Array, a + ': normalized bytes');
  }
  // Stood on the floor: the lowest vertex at y = 0, about 1.75 m tall.
  const pos = h.geo.attributes.position; let lo = Infinity, hi = -Infinity;
  for(let i = 0; i < pos.count; i++){ lo = Math.min(lo, pos.getY(i)); hi = Math.max(hi, pos.getY(i)); }
  assert.ok(Math.abs(lo) < 1e-6 && Math.abs(hi - 1.748) < 0.01, `${lo} .. ${hi}`);
  // Each muscle map covers a real region.
  const counts = MUSCLE_ORDER.map((_, k) => { const at = h.geo.attributes['muscle' + (k >> 2)]; let n = 0; for(let i = 0; i < at.count; i++) if(at.array[i * 4 + (k & 3)] > 128) n++; return n; });
  counts.forEach((n, k) => assert.ok(n > 40, `${MUSCLE_ORDER[k]} covers ${n} vertices`));
});

async function rigFor(){
  const { parseHumanGlb, buildHuman, Rig } = await loadEngine();
  return new Rig(buildHuman(parseHumanGlb(glbBuf())));
}
const near = (a, b, tol) => a.distanceTo(b) <= tol;

test('REAL mechanics, every lift through the rep: feet planted, hands on the bar, no bone stretched', async (assert)=>{
  const { LIFTS } = await loadEngine();
  const rig = await rigFor();
  const grips = { squat: 0.36, bench: 0.40, deadlift: 0.25 };
  const segs = [['upperarm01', 'lowerarm01', 'uarm'], ['lowerarm01', 'wrist', 'farm'], ['upperleg01', 'lowerleg01', 'thigh'], ['lowerleg01', 'foot', 'shin']];
  let checks = 0;
  for(const id of ['squat', 'bench', 'deadlift']){
    const feet0 = {};
    for(const u of U){
      const r = LIFTS[id].solve(rig, u);
      for(const s of ['L', 'R']){
        const sg = s === 'L' ? 1 : -1;
        const foot = rig.wp('foot.' + s);
        if(u === 0) feet0[s] = foot; else assert.ok(near(foot, feet0[s], 0.003), `${id} u=${u}: ${s} foot planted`);
        assert.ok(near(rig.wp('wrist.' + s), r.bar.clone().add(new THREE.Vector3(sg * grips[id], 0, 0)), 0.015), `${id} u=${u}: ${s} hand on the bar`);
        for(const [a, b, k] of segs) assert.ok(Math.abs(rig.wp(a + '.' + s).distanceTo(rig.wp(b + '.' + s)) - rig.L[k]) < 0.002, `${id} u=${u}: ${k} keeps its length`);
        checks++;
      }
    }
  }
  assert.strictEqual(checks, 3 * 21 * 2, 'anchor: every frame checked');
});

test('REAL mechanics: the bar stays over mid-foot in the squat and deadlift; the deadlift starts on the floor; the squat reaches parallel', async (assert)=>{
  const { LIFTS } = await loadEngine();
  const rig = await rigFor();
  const midFoot = rig.footToe.z * 0.45;
  for(const id of ['squat', 'deadlift']) for(const u of U){
    const r = LIFTS[id].solve(rig, u);
    assert.ok(Math.abs(r.bar.z - midFoot) < 0.015, `${id} u=${u}: bar over mid-foot (${(r.bar.z - midFoot).toFixed(3)})`);
  }
  const start = LIFTS.deadlift.solve(rig, 1).bar;
  // The set-up: hips above the knees, shoulders over the bar.
  assert.ok(rig.wp('upperleg01.L').y > rig.wp('lowerleg01.L').y + 0.03, 'deadlift set-up: hips above the knees, not a squat');
  assert.ok(start.y > 0.2 && start.y < 0.26, `plates on the floor: bar at ${start.y.toFixed(3)} m (plate radius 0.225)`);
  assert.ok(LIFTS.deadlift.solve(rig, 0).bar.y > 0.6, 'lockout: bar at the thighs');
  LIFTS.squat.solve(rig, 1);
  const hip = rig.wp('upperleg01.L').y, knee = rig.wp('lowerleg01.L').y;
  assert.ok(hip <= knee + 0.03, `the squat reaches parallel (hip ${hip.toFixed(3)} vs knee ${knee.toFixed(3)})`);
  LIFTS.squat.solve(rig, 0);
  assert.ok(rig.wp('upperleg01.L').y - rig.wp('lowerleg01.L').y > 0.35, 'and stands up straight at the top');
});

test('REAL mechanics: a neutral spine in the squat and deadlift: it bends at the hips, never rounds', async (assert)=>{
  const { LIFTS } = await loadEngine();
  const rig = await rigFor();
  const angOf = (P, a, b) => { const p = P(a), q = P(b); return Math.atan2(q.z - p.z, q.y - p.y) * 180 / Math.PI; };
  // The spine's own S-curve standing (lower back vs upper back), from the rest pose.
  const restCurve = angOf(n => rig.rest[n], 'spine03', 'neck01') - angOf(n => rig.rest[n], 'spine05', 'spine03');
  for(const id of ['squat', 'deadlift']) for(const u of U){
    LIFTS[id].solve(rig, u);
    // Neutral = that curve kept: the lift bends at the hips, the back doesn't curl.
    const curve = angOf(n => rig.wp(n), 'spine03', 'neck01') - angOf(n => rig.wp(n), 'spine05', 'spine03');
    assert.ok(Math.abs(curve - restCurve) < 6, `${id} u=${u}: curve ${curve.toFixed(1)} vs standing ${restCurve.toFixed(1)}`);
  }
});

test('REAL mechanics: the bench press locks out over the shoulders and touches the chest, lying on the bench', async (assert)=>{
  const { LIFTS } = await loadEngine();
  const rig = await rigFor();
  const top = LIFTS.bench.solve(rig, 0).bar;
  const shTop = rig.wp('upperarm01.L').add(rig.wp('upperarm01.R')).multiplyScalar(0.5);
  assert.ok(top.y - shTop.y > 0.45 && Math.abs(top.z - shTop.z) < 0.06, 'lockout above the shoulders');
  const bottom = LIFTS.bench.solve(rig, 1).bar;
  const chest = rig.wp('spine01');
  assert.ok(bottom.y - chest.y < 0.16 && bottom.y > chest.y, `bar to the chest (${(bottom.y - chest.y).toFixed(3)} m above the sternum bone)`);
  assert.ok(bottom.z > shTop.z, 'lowered slightly toward the feet (the bar\'s J path)');
  // Lying on the bench: the upper back at pad height, face up.
  assert.ok(Math.abs(rig.wp('spine03').y - 0.5) < 0.08, 'back on the pad');
  assert.ok(rig.wp('head').y > rig.wp('spine01').y - 0.05, 'head on the bench, not hanging');
});

test('REAL timeline: lower, pause, drive, top; effort peaks out of the bottom; muscles light by how hard they work', async (assert)=>{
  const { LIFTS, repPhase, muscleUniforms, MUSCLE_ORDER } = await loadEngine();
  const sq = LIFTS.squat, [down, pause, up, top] = sq.tempo;
  assert.strictEqual(repPhase(sq, 0).u, 0);
  assert.ok(Math.abs(repPhase(sq, down * 0.5).u - 0.5) < 1e-9);
  assert.strictEqual(repPhase(sq, down + pause * 0.5).u, 1, 'the pause at the bottom');
  assert.ok(Math.abs(repPhase(sq, down + pause + up * 0.5).u - 0.5) < 1e-9);
  assert.strictEqual(repPhase(sq, down + pause + up + top * 0.5).u, 0, 'held at the top');
  assert.ok(repPhase(sq, down + pause + 0.01).effort > repPhase(sq, 0.1).effort, 'harder driving up than lowering');
  const [a0] = muscleUniforms(sq, 1);
  assert.strictEqual(a0[MUSCLE_ORDER.indexOf('quads')], 1, 'quads at full effort');
  assert.ok(muscleUniforms(sq, 0)[0][0] < 0.4, 'and dimmer at rest');
  assert.deepStrictEqual(muscleUniforms(LIFTS.bench, 1)[1].slice(0, 1), [1], 'bench: pecs');
});

// ── index.html glue ──────────────────────────────────────────────────────────
function glue(stub){
  const { window } = runJsdom('<div id="host"></div>', `
    window.matchMedia = q => ({ matches: false });
    window.__shows = [];`,
    [extractConst(src, 'ANATOMY_LIFTS'), extractConst(src, 'ANATOMY_WORKS'), extractConst(src, 'ANATOMY_MODULE_URL'), extractConst(src, 'ANATOMY_GLB_URL'),
     extractFunction(src, 'escapeHtml'), extractFunction(src, 'buildExerciseDemoHtml'),
     'var anatomyStagePromise = null, anatomyActive = null, anatomyObserver = null;',
     extractFunction(src, 'mountAnatomy'),
     // The seam: the real loader imports the module; here, a stub stage.
     stub, 'window.__urls = [ANATOMY_MODULE_URL, ANATOMY_GLB_URL];']);
  return window;
}
const okStage = `function loadAnatomyStage(){ return Promise.resolve({ show(el, lift, o){ window.__shows.push([el.className, lift, o.still]); el.appendChild(document.createElement('canvas')); }, setVisible(){} }); }`;

test('REAL invocation: supported lifts get a 3D demo block; everything else none', (assert)=>{
  const w = glue(okStage);
  const host = w.document.getElementById('host');
  host.innerHTML = w.buildExerciseDemoHtml('Back Squat');
  const fig = host.querySelector('figure.ex-anatomy');
  assert.strictEqual(fig.dataset.lift, 'squat');
  assert.ok(fig.querySelector('.ex-anatomy-stage > button.ex-anatomy-play'));
  assert.strictEqual(fig.querySelector('.ex-demo-caption').textContent, 'Quads · glutes');
  for(const [n, l] of [['Bench Press', 'bench'], ['Deadlift', 'deadlift'], ['Pause Squat', 'squat']]){
    host.innerHTML = w.buildExerciseDemoHtml(n); assert.strictEqual(host.querySelector('figure').dataset.lift, l, n);
  }
  for(const n of ['Leg Curl', 'Overhead Press', 'Nope']) assert.strictEqual(w.buildExerciseDemoHtml(n), '', n + ': not yet');
  const [mod, glb] = w.__urls;
  assert.strictEqual(mod, './assets/anatomy/anatomy.js');
  assert.ok(fs.existsSync(path.join(__dirname, mod)) && fs.existsSync(path.join(__dirname, glb)), 'the files it loads exist');
});

test('REAL invocation: playing a demo moves the canvas there and hands the Play button back to the one it left', async (assert)=>{
  const w = glue(okStage);
  const host = w.document.getElementById('host');
  host.innerHTML = w.buildExerciseDemoHtml('Back Squat') + w.buildExerciseDemoHtml('Bench Press');
  const [a, b] = host.querySelectorAll('figure');
  await w.mountAnatomy(a);
  assert.ok(a.classList.contains('is-playing'));
  assert.strictEqual(JSON.stringify(w.__shows[0]), JSON.stringify(['ex-anatomy-stage', 'squat', false]));
  await w.mountAnatomy(b);
  assert.ok(b.classList.contains('is-playing') && !a.classList.contains('is-playing'), 'one plays at a time');
  assert.strictEqual(w.__shows[1][1], 'bench');
});

test('REAL invocation: Reduce Motion draws it still; a device that can\'t run it says so instead of a blank box', async (assert)=>{
  const w = glue(okStage);
  w.matchMedia = q => ({ matches: /reduce/.test(q) });
  const host = w.document.getElementById('host');
  host.innerHTML = w.buildExerciseDemoHtml('Deadlift');
  await w.mountAnatomy(host.querySelector('figure'));
  assert.strictEqual(w.__shows[0][2], true, 'still');
  const bad = glue(`function loadAnatomyStage(){ return Promise.reject(new Error('no webgl')); }`);
  const h2 = bad.document.getElementById('host');
  h2.innerHTML = bad.buildExerciseDemoHtml('Deadlift');
  const fig = h2.querySelector('figure');
  await bad.mountAnatomy(fig);
  assert.ok(fig.classList.contains('is-unavailable') && !fig.classList.contains('is-loading'));
  assert.match(fig.querySelector('.ex-anatomy-stage').textContent, /can't run on this device/);
});

test('REAL source: opening Technique & focus plays its demo; the 2D figure is gone', (assert)=>{
  assert.match(src, /document\.addEventListener\('toggle', \(e\)=>\{\s*const d = e\.target;\s*if\(d && d\.tagName === 'DETAILS' && d\.open\)\{ const fig = d\.querySelector\('\.ex-anatomy'\); if\(fig\) mountAnatomy\(fig\); \}\s*\}, true\);/);
  assert.match(extractFunction(src, 'renderExerciseDetail'), /if\(paneDemo\) mountAnatomy\(paneDemo\);/, 'the open-screen pane plays at once');
  for(const gone of ['DEMO_MOTIONS', 'buildDemoSvg', 'EXERCISE_DEMO', 'class="ex-demo"']) assert.ok(!src.includes(gone), gone + ' removed');
});

test('REAL sw.js: the demos\' files live in their own cache that a release never clears, precached best-effort', (assert)=>{
  const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
  const ASSET_CACHE = /const ASSET_CACHE = '([^']+)';/.exec(sw)[1];
  assert.ok(!ASSET_CACHE.startsWith('training-log-v'), 'activate deletes only training-log-v* caches');
  assert.match(sw, /names\.filter\(n=> n\.startsWith\('training-log-v'\) && n !== CACHE\)/, 'anchor: that is the activate filter');
  const list = /const ANATOMY_ASSETS = \[([\s\S]*?)\];/.exec(sw)[1].match(/'([^']+)'/g).map(s => s.slice(1, -1));
  assert.deepStrictEqual(list.sort(), ['./assets/anatomy/anatomy.js', './assets/anatomy/human-v1.glb', './assets/vendor/three-0.170.0.module.min.js'].sort());
  for(const f of list) assert.ok(fs.existsSync(path.join(__dirname, f)), f + ' exists');
  assert.match(sw, /if\(url\.pathname\.includes\('\/assets\/'\)\)\{/, 'served cache-first from it');
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/vendor/three-LICENSE.txt')), 'Three.js licence shipped');
});

run();
