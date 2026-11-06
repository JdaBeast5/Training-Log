// [ANATOMY 3D] Exercise demonstrations with an anatomical human (v3.513).
//
// Owner: "a human animation showing anatomically correct movements for each
// exercise … official and professional", not a stick figure. Loaded on demand
// by index.html (import()) the first time a demo is opened; never on start-up.
//
// - The body: MakeHuman's base mesh, athletic male targets, default 163-bone
//   rig and skin weights, all CC0, converted by tools/anatomy/mh2glb.py into
//   human-v1.glb, with 12 muscle groups baked in as soft weights (_M0.._M2).
// - The motion: each exercise is driven by its mechanics, not by drawn poses.
//   A path for the pelvis (or the bar) over the rep; the rest is solved: feet
//   planted with two-bone IK and knees tracking over the toes; the torso angle
//   found so the bar stays over mid-foot (squat, deadlift); hands on the bar
//   by IK with the elbow aimed where a coach would want it.
// - The look: matte skin, charcoal shorts, the working muscles lit in the
//   app's blue, brightest where the rep is hardest. Barbell, plates and bench
//   are modelled to size (20 kg bar, 2.2 m; 450 mm plates).
// - One renderer, one canvas, moved to whichever demo is showing, so a list of
//   open cards never runs out of WebGL contexts; it draws only while visible.
import * as THREE from '../vendor/three-0.170.0.module.min.js';

export const MUSCLE_ORDER = ['quads', 'hamstrings', 'glutes', 'calves', 'pecs', 'frontDelts', 'triceps', 'biceps', 'lats', 'traps', 'erectors', 'abs'];
const D = Math.PI / 180;
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const easeInOut = t => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));
const lerp = (a, b, t) => a + (b - a) * t;

// ── The model file ───────────────────────────────────────────────────────────
// A small reader for exactly what mh2glb.py writes (one skinned primitive,
// translation-only joints), so the app doesn't vendor GLTFLoader and its deps.
export function parseHumanGlb(buf){
  const dv = new DataView(buf);
  if(dv.getUint32(0, true) !== 0x46546C67) throw new Error('not a glb');
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen)));
  const binStart = 20 + jsonLen + 8;
  const TYPES = { SCALAR:1, VEC2:2, VEC3:3, VEC4:4, MAT4:16 };
  const CTORS = { 5121:Uint8Array, 5123:Uint16Array, 5125:Uint32Array, 5126:Float32Array };
  const acc = i => {
    const a = json.accessors[i], v = json.bufferViews[a.bufferView], C = CTORS[a.componentType];
    const n = a.count * TYPES[a.type];
    return { array: new C(buf.slice(binStart + (v.byteOffset || 0), binStart + (v.byteOffset || 0) + n * C.BYTES_PER_ELEMENT)), size: TYPES[a.type], normalized: !!a.normalized };
  };
  const prim = json.meshes[0].primitives[0];
  return { json, prim, acc, muscles: (json.extras && json.extras.muscles) || [] };
}

export function buildHuman(glb){
  const { json, prim, acc } = glb;
  const skin = json.skins[0];
  const bones = json.nodes.map(n => { const b = new THREE.Bone(); b.name = n.name; if(n.translation) b.position.fromArray(n.translation); return b; });
  json.nodes.forEach((n, i) => (n.children || []).forEach(c => bones[i] && bones[c] && bones[i].add(bones[c])));
  const jointBones = skin.joints.map(j => bones[j]);
  const ibm = acc(skin.inverseBindMatrices).array;
  const inverses = jointBones.map((_, i) => new THREE.Matrix4().fromArray(ibm, i * 16));
  const geo = new THREE.BufferGeometry();
  const set = (name, key) => { const a = acc(prim.attributes[key]); geo.setAttribute(name, new THREE.BufferAttribute(a.array, a.size, a.normalized)); };
  set('position', 'POSITION'); set('normal', 'NORMAL'); set('skinIndex', 'JOINTS_0'); set('skinWeight', 'WEIGHTS_0');
  set('muscle0', '_M0'); set('muscle1', '_M1'); set('muscle2', '_M2');
  geo.setIndex(new THREE.BufferAttribute(acc(prim.indices).array, 1));
  // Stand it on y = 0: lift the skeleton and the bind pose by the lowest vertex.
  const pos = geo.attributes.position; let ymin = Infinity;
  for(let i = 0; i < pos.count; i++) ymin = Math.min(ymin, pos.getY(i));
  for(let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) - ymin);
  const root = bones[skin.skeleton];
  root.position.y -= ymin;
  const lift = new THREE.Matrix4().makeTranslation(0, ymin, 0);
  inverses.forEach(m => m.multiply(lift));
  return { geo, bones, root, skeleton: new THREE.Skeleton(jointBones, inverses) };
}

// ── Look ─────────────────────────────────────────────────────────────────────
// Skin and shorts as vertex colours; the muscles glow by activation uniforms.
function bodyMaterial(geo, accent){
  const pos = geo.attributes.position, ji = geo.attributes.skinIndex, wi = geo.attributes.skinWeight;
  let ymin = Infinity, ymax = -Infinity;
  for(let i = 0; i < pos.count; i++){ const y = pos.getY(i); if(y < ymin) ymin = y; if(y > ymax) ymax = y; }
  const col = new Float32Array(pos.count * 3), cloth = new Float32Array(pos.count);
  const skinC = new THREE.Color(0xd8cdc3), shortC = new THREE.Color(0x24272e);
  for(let i = 0; i < pos.count; i++){
    const y = (pos.getY(i) - ymin) / (ymax - ymin);
    // Shorts: hip to mid-thigh. Arms hanging past the hips never take the colour.
    let armW = 0; for(let k = 0; k < 4; k++){ if(ARM_BONE_SET.has(ji.getComponent(i, k))) armW += wi.getComponent(i, k); }
    // Athletic shorts: hip to upper thigh, so the quads show below the hem.
    const isCloth = y > 0.47 && y < 0.585 && armW < 0.2;
    const c = isCloth ? shortC : skinC;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; cloth[i] = isCloth ? 1 : 0;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('cloth', new THREE.BufferAttribute(cloth, 1));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0 });
  const uniforms = { uA0: { value: new THREE.Vector4() }, uA1: { value: new THREE.Vector4() }, uA2: { value: new THREE.Vector4() }, uAccent: { value: new THREE.Color(accent) } };
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 muscle0; attribute vec4 muscle1; attribute vec4 muscle2; attribute float cloth; uniform vec4 uA0; uniform vec4 uA1; uniform vec4 uA2; varying float vLit;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLit = clamp(dot(muscle0, uA0) + dot(muscle1, uA1) + dot(muscle2, uA2), 0.0, 1.0) * (1.0 - 0.85 * cloth);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLit; uniform vec3 uAccent;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uAccent, vLit * 0.62);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uAccent * vLit * 0.42;');
  };
  return { mat, uniforms };
}
let ARM_BONE_SET = new Set();

// ── Kit, to size ─────────────────────────────────────────────────────────────
function makeBarbell(){
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec6, metalness: 0.85, roughness: 0.32 });
  const plateM = new THREE.MeshStandardMaterial({ color: 0x1c1f25, metalness: 0.2, roughness: 0.55 });
  const rimM = new THREE.MeshStandardMaterial({ color: 0x3a3f49, metalness: 0.3, roughness: 0.5 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.2, 20), steel); bar.rotation.z = Math.PI / 2; g.add(bar);
  for(const s of [-1, 1]){
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 20), steel); sleeve.rotation.z = Math.PI / 2; sleeve.position.x = s * 0.88; g.add(sleeve);
    for(const [k, w] of [[0, 0.055], [1, 0.045]]){
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, w, 48), k === 0 ? plateM : rimM);
      plate.rotation.z = Math.PI / 2; plate.position.x = s * (0.72 + k * 0.055 + w / 2); g.add(plate);
    }
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 20), steel); collar.rotation.z = Math.PI / 2; collar.position.x = s * 0.85; g.add(collar);
  }
  g.traverse(o => { if(o.isMesh){ o.castShadow = true; } });
  return g;
}
function makeBench(){
  const g = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 1.22), new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.7 }));
  pad.position.y = 0.43 - 0.035; g.add(pad);
  const frameM = new THREE.MeshStandardMaterial({ color: 0x4a4f59, metalness: 0.6, roughness: 0.4 });
  for(const z of [-0.5, 0.5]){ const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.06), frameM); leg.position.set(0, 0.18, z); g.add(leg); const foot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.06), frameM); foot.position.set(0, 0.02, z); g.add(foot); }
  g.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ── Solving a pose ───────────────────────────────────────────────────────────
// Every bone's rest frame is world-aligned (mh2glb writes translations only),
// so a bone's world rotation is the product of its chain's local rotations,
// and setting a world rotation is local = parentWorld⁻¹ · world.
export class Rig {
  constructor(human){
    this.h = human;
    this.by = {}; human.bones.forEach(b => { this.by[b.name] = b; });
    this.rest = {}; human.root.updateMatrixWorld(true);
    human.bones.forEach(b => { this.rest[b.name] = b.getWorldPosition(V3()); });
    const len = (a, b) => this.rest[a].distanceTo(this.rest[b]);
    this.L = {
      thigh: len('upperleg01.L', 'lowerleg01.L'), shin: len('lowerleg01.L', 'foot.L'),
      uarm: len('upperarm01.L', 'lowerarm01.L'), farm: len('lowerarm01.L', 'wrist.L'),
    };
    this.footToe = this.rest['toe3-1.L'].clone().sub(this.rest['foot.L']);
    this.ankleH = this.rest['foot.L'].y;   // ankle joint height above the floor, standing
  }
  reset(){ this.h.bones.forEach(b => b.quaternion.identity()); this.h.root.position.copy(this.h.root.userData.restPos || (this.h.root.userData.restPos = this.h.root.position.clone())); }
  wq(name){ const q = new THREE.Quaternion(); this.by[name].getWorldQuaternion(q); return q; }
  wp(name){ return this.by[name].getWorldPosition(V3()); }
  setWorld(name, qWorld){
    const b = this.by[name], pq = new THREE.Quaternion();
    if(b.parent) b.parent.getWorldQuaternion(pq);
    b.quaternion.copy(pq.invert().multiply(qWorld));
    b.updateMatrixWorld(true);
  }
  // Rotate the segment from bone `a` to joint `b` (rest positions) to point along dir.
  aim(a, b, dir, extra){
    const rest = this.rest[b].clone().sub(this.rest[a]).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(rest, dir.clone().normalize());
    if(extra) q.multiply(extra);
    this.setWorld(a, q);
  }
  // Two-bone IK: from bone a (to joint b, to joint c) reach `target`, bending
  // toward `pole`. Returns the reached end.
  ik(a, b, c, l1, l2, target, pole){
    const S = this.wp(a);
    const toT = target.clone().sub(S);
    const d = Math.min(Math.max(toT.length(), 1e-4), (l1 + l2) * 0.9995);
    const dir = toT.normalize();
    const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    const perp = pole.clone().sub(S).projectOnPlane(dir).normalize();
    const E = S.clone().add(dir.clone().multiplyScalar(l1 * cosA)).add(perp.multiplyScalar(l1 * sinA));
    this.aim(a, b, E.clone().sub(S));
    const W = S.clone().add(dir.multiplyScalar(d));
    this.aim(b, c, W.clone().sub(this.wp(b)));
    return W;
  }
  // A whole-body pose from a few mechanical quantities. Units: metres, degrees.
  //  pelvis: [y, z] hip-joint height and fore-aft offset (feet at z=0),
  //  torso:  lean from vertical (forward +), split over the lumbar and thoracic spine,
  //  supine: lying face up (bench), gaze: neck counter-rotation,
  //  stance: half the distance between the feet, toeOut: degrees,
  //  hands:  [L, R] world targets, elbowPole: where the elbows point,
  //  feet:   override foot targets (bench).
  pose(p){
    this.reset();
    const root = this.h.root;
    const base = Math.PI / 2 * (p.supine ? -1 : 0);
    // Pelvis: place the hips, and hinge. A neutral spine bends at the hips, not
    // in the back: the pelvis tips with the torso and the spine stays nearly
    // straight above it (spreading the lean up the spine rounds the back,
    // which is the fault the demo must never show).
    const tilt = (p.torso || 0) * 0.85;
    this.setWorld('root', new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), base + tilt * D));
    // pelvis = where the hip joints (midway between them) should be.
    root.updateMatrixWorld(true);
    const hj = this.wp('upperleg01.L').add(this.wp('upperleg01.R')).multiplyScalar(0.5);
    root.position.add(V3(0, p.pelvis[0] - hj.y, p.pelvis[1] - hj.z));
    root.updateMatrixWorld(true);
    // Spine: the rest of the lean, spread over three segments.
    const spineLean = (p.torso || 0) - tilt;
    const qBase = new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), base);
    let acc = 0;
    for(const [bone, share] of [['spine05', 0.3], ['spine03', 0.4], ['spine01', 0.3]]){
      acc += spineLean * share;
      this.setWorld(bone, new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), base + (tilt + acc) * D));
    }
    this.setWorld('neck01', new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), base + ((p.torso || 0) - (p.gaze != null ? p.gaze : (p.torso || 0) * 0.75)) * D));
    // Legs: feet planted, knees over the toes.
    for(const [s, sg] of [['L', 1], ['R', -1]]){
      const foot = p.feet ? p.feet[s].clone() : V3(sg * (p.stance || 0.17), this.ankleH, 0);
      const toe = (p.toeOut != null ? p.toeOut : 12) * sg;
      const pole = foot.clone().add(V3(Math.sin(toe * D) * 1.0, 0.3, Math.cos(toe * D) * 1.0));
      this.ik('upperleg01.' + s, 'lowerleg01.' + s, 'foot.' + s, this.L.thigh, this.L.shin, foot, pole);
      // Foot flat and turned out.
      this.setWorld('foot.' + s, new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), toe * D * 0.6).multiply(new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), (p.footPitch || 0) * D)));
    }
    // Arms: hands on the bar.
    if(p.hands){
      for(const [s, sg] of [['L', 1], ['R', -1]]){
        const pole = this.wp('upperarm01.' + s).add(p.elbowPole(sg));
        this.ik('upperarm01.' + s, 'lowerarm01.' + s, 'wrist.' + s, this.L.uarm, this.L.farm, p.hands[s], pole);
        // Grip: fingers wrapped round the bar.
        for(const f of ['finger2', 'finger3', 'finger4', 'finger5']) for(const k of ['-1', '-2', '-3']){
          const n = f + k + '.' + s; if(!this.by[n]) continue;
          // Curl about the hand's own knuckle axis (its local X, as posed).
          const axis = V3(1, 0, 0).applyQuaternion(this.wq('wrist.' + s));
          const pq = new THREE.Quaternion().setFromAxisAngle(axis, 72 * D).multiply(this.wq(n));
          this.setWorld(n, pq);
        }
      }
    }
    root.updateMatrixWorld(true);
  }
}

// ── The lifts ────────────────────────────────────────────────────────────────
// Each: a rep timeline (seconds: lower, pause, drive, top), a pose for a
// progress u (0 = top, 1 = bottom), which muscles work and how hard, and
// where the bar sits. Mechanics are solved per frame, not keyframed.
// Half the distance between the hands, metres.
const GRIP = { squat: 0.36, bench: 0.40, deadlift: 0.25 };
export const LIFTS = {
  squat: {
    label: 'Back squat', tempo: [1.8, 0.35, 1.1, 0.75], camera: { yaw: 38, pitch: 8, dist: 4.3, target: [0, 0.88, 0] },
    // Quads and glutes drive; hamstrings, erectors and abs hold the torso.
    muscles: { quads: 1, glutes: 0.95, hamstrings: 0.45, erectors: 0.55, abs: 0.4, calves: 0.25 },
    kit: ['barbell'],
    solve(rig, u){
      // Hip height from standing to just below parallel; hips travel back.
      const stand = rig.rest['upperleg01.L'].y;
      const hy = lerp(stand - 0.01, rig.ankleH + rig.L.shin * 0.82, easeInOut(u) * 0.96 + u * 0.04);
      const torso = lerp(4, 40, u);
      // Bar over mid-foot: shift the hips until the bar's z lands there.
      const midFoot = rig.footToe.z * 0.45;
      let z = -0.02 - 0.2 * u;
      for(let i = 0; i < 2; i++){
        rig.pose({ pelvis: [hy, z], torso, stance: 0.19, toeOut: 20 });
        const bar = barOnBack(rig);
        z += midFoot - bar.z;
      }
      const bar = (rig.pose({ pelvis: [hy, z], torso, stance: 0.19, toeOut: 20 }), barOnBack(rig));
      rig.pose({ pelvis: [hy, z], torso, stance: 0.19, toeOut: 20,
        hands: { L: bar.clone().add(V3(GRIP.squat, 0, 0)), R: bar.clone().add(V3(-GRIP.squat, 0, 0)) },
        elbowPole: sg => V3(sg * 0.35, -0.8, -0.25) });
      return { bar, barRot: 0 };
    },
  },
  bench: {
    label: 'Bench press', tempo: [1.6, 0.4, 1.0, 0.8], camera: { yaw: 28, pitch: 26, dist: 3.9, target: [0, 0.6, 0.05] },
    muscles: { pecs: 1, frontDelts: 0.75, triceps: 0.85, lats: 0.2, abs: 0.15 },
    kit: ['barbell', 'bench'],
    solve(rig, u){
      // Lying on the bench, eyes under the bar, feet planted behind the knees.
      const benchTop = 0.43, torsoHalf = 0.11;
      const hipZ = 0.32;
      const feet = { L: V3(0.26, rig.ankleH, 0.66), R: V3(-0.26, rig.ankleH, 0.66) };
      rig.pose({ pelvis: [benchTop + torsoHalf, hipZ], torso: 0, supine: true, gaze: 0, feet, footPitch: -10 });
      const sh = rig.wp('upperarm01.L').add(rig.wp('upperarm01.R')).multiplyScalar(0.5);
      // Bar path: lockout over the shoulders, down and slightly forward to the
      // lower chest (the J the bar actually follows).
      const top = V3(0, sh.y + rig.L.uarm + rig.L.farm - 0.05, sh.z + 0.02);
      const bottom = V3(0, sh.y + 0.06, sh.z + 0.11);
      const e = easeInOut(u);
      const bar = V3(0, lerp(top.y, bottom.y, e), lerp(top.z, bottom.z, Math.pow(e, 1.4)));
      rig.pose({ pelvis: [benchTop + torsoHalf, hipZ], torso: 0, supine: true, gaze: 0, feet, footPitch: -10,
        hands: { L: bar.clone().add(V3(GRIP.bench, 0, 0)), R: bar.clone().add(V3(-GRIP.bench, 0, 0)) },
        // Elbows about 45 degrees from the torso: out and toward the feet.
        elbowPole: sg => V3(sg * 0.6, -0.5, 0.5) });
      return { bar, barRot: 0, bench: true };
    },
  },
  deadlift: {
    label: 'Deadlift', tempo: [1.5, 0.3, 1.4, 0.8], camera: { yaw: 42, pitch: 6, dist: 4.1, target: [0, 0.8, 0] },
    muscles: { glutes: 1, hamstrings: 0.9, erectors: 0.9, quads: 0.6, lats: 0.5, traps: 0.45, abs: 0.35 },
    kit: ['barbell'],
    solve(rig, u){
      // Conventional pull: bar over mid-foot, shoulders just ahead of it, arms
      // straight. u=1 is the set-up (plates on the floor), u=0 lockout. The
      // bar's height is the path (floor to lockout); the hips are solved to
      // put it there, the torso angle to keep it over mid-foot.
      const midFoot = rig.footToe.z * 0.45;
      const stand = rig.rest['upperleg01.L'].y;
      const armLen = rig.L.uarm + rig.L.farm;
      const e = easeInOut(u);
      // Hips above the knees at the set-up, back about 70 degrees from vertical.
      const torso = lerp(0, 71, Math.pow(e, 0.8));
      const hipsBack = lerp(-0.01, -0.2, e);
      const at = (hy) => {
        let z = hipsBack, bar = V3();
        for(let i = 0; i < 3; i++){
          rig.pose({ pelvis: [hy, z], torso, stance: 0.15, toeOut: 10 });
          const sh = rig.wp('upperarm01.L');
          bar = V3(0, sh.y - armLen * 0.97, sh.z);   // arms hang straight
          z += midFoot - bar.z;
        }
        return { z, bar };
      };
      const top = at(stand - 0.005).bar.y, floor = 0.225 + 0.004;
      const target = lerp(top, floor, e);
      // Secant search for the hip height that puts the bar at the target.
      let h0 = stand - 0.005, h1 = stand - 0.005 - (top - target);
      let f0 = at(h0).bar.y - target, f1 = at(h1).bar.y - target;
      for(let i = 0; i < 8 && Math.abs(f1) > 0.001; i++){
        const h2 = h1 - f1 * (h1 - h0) / ((f1 - f0) || 1e-6);
        h0 = h1; f0 = f1; h1 = h2; f1 = at(h1).bar.y - target;
      }
      const { z, bar } = at(h1);
      rig.pose({ pelvis: [h1, z], torso, stance: 0.15, toeOut: 10,
        hands: { L: bar.clone().add(V3(GRIP.deadlift, 0, 0)), R: bar.clone().add(V3(-GRIP.deadlift, 0, 0)) },
        elbowPole: sg => V3(sg * 0.3, 0, -0.6) });
      return { bar, barRot: 0 };
    },
  },
};
function barOnBack(rig){
  // High-bar: across the upper traps, just below the base of the neck.
  const n = rig.wp('neck01'), s = rig.wp('spine01');
  const back = n.clone().sub(s).normalize();
  const up = back.clone();
  const fwd = V3(0, 0, 1).applyQuaternion(rig.wq('spine01'));
  return n.clone().add(up.multiplyScalar(-0.035)).add(fwd.multiplyScalar(-0.075));
}

// Where in the rep at time t (seconds) → { u: 0 top … 1 bottom, effort: 0…1 }.
export function repPhase(lift, t){
  const [down, pause, up, top] = lift.tempo, T = down + pause + up + top;
  let x = ((t % T) + T) % T;
  if(x < down) return { u: x / down, effort: 0.35 + 0.35 * (x / down) };
  x -= down; if(x < pause) return { u: 1, effort: 0.75 };
  x -= pause; if(x < up) return { u: 1 - x / up, effort: 1 - 0.4 * (x / up) };
  return { u: 0, effort: 0.3 };
}
export function muscleUniforms(lift, effort){
  const a = MUSCLE_ORDER.map(m => (lift.muscles[m] || 0) * (0.35 + 0.65 * effort));
  return [a.slice(0, 4), a.slice(4, 8), a.slice(8, 12)];
}

// ── The stage ────────────────────────────────────────────────────────────────
export async function createStage({ glbUrl, accent = 0x3d7bff } = {}){
  const buf = await (await fetch(glbUrl)).arrayBuffer();
  const glb = parseHumanGlb(buf);
  const human = buildHuman(glb);
  ARM_BONE_SET = new Set(human.skeleton.bones.map((b, i) => /upperarm|lowerarm|wrist|finger|metacarpal/.test(b.name) ? i : -1).filter(i => i >= 0));
  const { mat, uniforms } = bodyMaterial(human.geo, accent);
  const mesh = new THREE.SkinnedMesh(human.geo, mat);
  mesh.add(human.root); mesh.bind(human.skeleton); mesh.castShadow = true; mesh.frustumCulled = false;
  const rig = new Rig(human);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xcfdcff, 0x1a1b22, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(1.6, 3.6, 2.6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 2.2, bottom: -0.4, near: 0.5, far: 9 }); key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(accent).lerp(new THREE.Color(0xffffff), 0.8), 1.1); rim.position.set(-2.4, 2.2, -2.8); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.7, 64), new THREE.ShadowMaterial({ opacity: 0.45 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(mesh);
  const barbell = makeBarbell(); scene.add(barbell);
  const bench = makeBench(); scene.add(bench);
  const camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.1, 40);

  let lift = null, t0 = 0, raf = 0, host = null, yawOffset = 0, still = false, visible = true;
  // One place sets a frame: the solved pose, the kit, and how hard each muscle works.
  const poseAt = (liftObj, u, effort) => {
    const r = liftObj.solve(rig, u);
    barbell.visible = liftObj.kit.includes('barbell'); bench.visible = liftObj.kit.includes('bench');
    if(barbell.visible) barbell.position.copy(r.bar);
    const [a0, a1, a2] = muscleUniforms(liftObj, effort);
    uniforms.uA0.value.fromArray(a0); uniforms.uA1.value.fromArray(a1); uniforms.uA2.value.fromArray(a2);
    return r;
  };
  const setFrame = t => {
    const { u, effort } = still ? { u: 0.75, effort: 0.85 } : repPhase(lift, t);
    poseAt(lift, u, effort);
  };
  const place = () => {
    const c = lift.camera, yaw = (c.yaw + yawOffset) * D, pitch = c.pitch * D;
    const tg = V3(...c.target);
    camera.position.set(tg.x + Math.sin(yaw) * Math.cos(pitch) * c.dist, tg.y + Math.sin(pitch) * c.dist, tg.z + Math.cos(yaw) * Math.cos(pitch) * c.dist);
    camera.lookAt(tg);
  };
  const resize = () => {
    if(!host) return;
    const w = host.clientWidth || 320, h = Math.round(w * 3 / 4);
    renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = 'auto';
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const loop = now => {
    raf = 0;
    if(!lift || !host || !visible) return;
    setFrame((now - t0) / 1000); place(); renderer.render(scene, camera);
    if(!still) raf = requestAnimationFrame(loop);
  };
  // Drag to turn the athlete.
  let drag = null;
  renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, yaw: yawOffset }; renderer.domElement.setPointerCapture(e.pointerId); });
  renderer.domElement.addEventListener('pointermove', e => { if(!drag) return; yawOffset = drag.yaw + (e.clientX - drag.x) * 0.5; if(still) loop(performance.now()); });
  renderer.domElement.addEventListener('pointerup', () => { drag = null; });
  renderer.domElement.style.touchAction = 'pan-y';

  return {
    renderer, scene, camera, rig, mesh, uniforms, barbell, bench,
    // Show `liftId` in `container` (moving the one canvas there).
    show(container, liftId, opts = {}){
      const next = LIFTS[liftId]; if(!next) return false;
      // Same lift again (the pane re-rendered after a logged set): the rep
      // carries on rather than jumping back to the top.
      if(next !== lift){ t0 = performance.now(); yawOffset = 0; }
      lift = next; host = container; still = !!opts.still; visible = true;
      if(renderer.domElement.parentNode !== container) container.appendChild(renderer.domElement);
      resize();
      if(!raf) raf = requestAnimationFrame(loop);
      return true;
    },
    setVisible(v){ visible = v; if(v && !raf && lift) raf = requestAnimationFrame(loop); },
    hide(){ visible = false; },
    // For tests and stills: a frame at time t, or at a point u of the rep.
    frame(liftId, t){ lift = LIFTS[liftId]; setFrame(t); return { bar: barbell.position.clone() }; },
    poseAt(liftId, u, effort = 0.85){ lift = LIFTS[liftId]; return poseAt(lift, u, effort); },
    placeCamera(liftId, yaw){ lift = LIFTS[liftId]; yawOffset = yaw || 0; place(); },
    resize,
  };
}
