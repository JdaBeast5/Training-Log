# Render study (2026-11-07): three visual directions for the exercise demos

Owner: "pick the best [skill] that can create lifelike animations with accurate
anatomy … and give me some renderings that we can then implement".

- `render-study.html` drives the real engine (`assets/anatomy/anatomy.js`: poses,
  kit, muscle maps) with `human-v2.glb` (mh2glb.py with `MH_BODY=v2`: per-limb
  muscle definition, V-taper) and swaps the look:
  - **A, studio:** skin (physical material, sheen), buzz cut, tank top and
    shorts (analytic bind-pose edges), image-based light (`RoomEnvironment.js`,
    three.js examples r170, MIT), and a lifting platform.
  - **B, reveal:** glass Fresnel skin; the working muscles visible beneath it,
    striated (a second skinned mesh on the same skeleton).
  - **C, écorché:** every mapped muscle fibrous red, the working ones brighter;
    fascia in between.
- `shoot.js` renders stills, and `loop.js` renders a rep as frames (served from the repo
  root on :8765, SwiftShader). Outputs are in `renders/`.
- Fibres are procedural striations per muscle, from the 12 baked maps. The fine
  frequency avoids "wood-grain" rings on curved muscles.
