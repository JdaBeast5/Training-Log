# Anatomy spike (2026-11-06): 3D exercise animation pipeline

Dev tooling, not loaded by the app. The owner chose an in-app 3D human for the
exercise demos (over a licensed library or a 2D illustration) and allowed asset
files beside index.html. This proves the pipeline; nothing here ships yet.

## What it does
- `mh2glb.py`: the MakeHuman base mesh (body group), athletic male shape
  targets, the default 163-bone rig and its skin weights, all CC0, turned into
  a rigged `human.glb` (13,380 verts, 26,756 tris, 1.75 m, ~1 MB). Rest
  frames are world-aligned (translations only), so a sagittal joint angle is a
  rotation about X.
- `view.html`: Three.js 0.187 (MIT) loads it. `__pose({torso, thigh, shin,
  shoulder, armDown, elbow})` sets world segment angles (degrees), keeps the feet
  planted (re-anchors foot.L), counter-rotates the neck for a neutral gaze. A
  vertex attribute tints shorts and a `glow` attribute lights the working
  muscles through an `onBeforeCompile` patch (uPulse uniform for effort).
- `shoot.js`: Playwright screenshots (SwiftShader WebGL).
- `spike-squat.png`: stand / mid / bottom, side and front.

## Rebuild
```
git clone --depth 1 --filter=blob:none --sparse https://github.com/makehumancommunity/makehuman.git mh
(cd mh && git sparse-checkout set makehuman/data/3dobjs makehuman/data/rigs)
mkdir targets && for f in universal-male-young-maxmuscle-averageweight universal-male-young-maxmuscle-minweight caucasian-male-young; do (cd mh && git show HEAD:makehuman/data/targets/macrodetails/$f.target) > targets/$f.target; done
python3 mh2glb.py human.glb
npm i three@0.187.0
python3 -m http.server 8799 & node shoot.js
```
Notes: GLTFLoader strips dots from node names (`foot.L` -> `footL`). Rotating
upperarm01 about Z by -side*44deg brings the A-pose arms to the sides.

## Known gaps before it can ship
- Muscle masks are crude bounds; need per-muscle regions (pecs, delts, lats,
  traps, biceps, triceps, forearms, abs/obliques, glutes, quads, hamstrings,
  calves).
- Kit (bar, plates, dumbbells, bench, cables) as simple modelled meshes.
- Keyframes per exercise from biomechanics (bar over mid-foot, joint ranges).
- Asset budget: three.module.js + three.core.js (~2.1 MB unminified) + glb
  (~1 MB, draco/quantize later); cached by sw.js for offline.
