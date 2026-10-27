// content-masterclasses.js — extracted from index.html (split-static-content refactor)
// Large, low-churn static content consts. Loaded via <script src> before the
// main inline <script> in index.html so these globals exist before use.
// Do NOT add this file to sw.js PRECACHE lists — see sw.js comments.

const POSE_ICONS = {
  frontDoubleBiceps: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="7" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="10" x2="22" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="16" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="28" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="12" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="18" x2="15" y2="9" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="32" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="32" y1="18" x2="29" y2="9" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  sideChest: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="7" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="15" y1="10" x2="19" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="19" y1="26" x2="14" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="19" y1="26" x2="26" y2="35" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="14" x2="28" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="20" x2="18" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="14" x2="9" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  backDoubleBiceps: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="7" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="10" x2="22" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="17" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="27" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="12" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="18" x2="15" y2="9" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="32" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="32" y1="18" x2="29" y2="9" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 16 Q22 20 26 16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  sideTriceps: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="7" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="15" y1="10" x2="19" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="19" y1="26" x2="14" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="19" y1="26" x2="25" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="10" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="13" x2="20" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  abdominalThigh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="7" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="10" x2="20" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="25" x2="14" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="30" x2="16" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="25" x2="27" y2="27" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="27" y1="27" x2="30" y2="35" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="12" x2="14" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="12" x2="26" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 8 Q20 4 26 8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  mostMuscular: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="25" x2="17" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="25" x2="27" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="15" y2="17" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="15" y1="17" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="29" y2="17" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="29" y1="17" x2="24" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  quarterTurn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="18" cy="7" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="10" x2="19" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="19" y1="26" x2="15" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="19" y1="26" x2="25" y2="37" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="13" x2="26" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="13" x2="12" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
};

const POSE_DETAILS = {
  'Front Double Biceps': {icon:'frontDoubleBiceps', video:'front double biceps bodybuilding pose tutorial', points:[
    'Setup: Feet shoulder-width, one foot slightly forward and out; never stand square.',
    'Execution: Arms just above the shoulders, wrists turning in as you flex; abs and quads hard.',
    'Common mistake: Shrugging toward the ears; judges check symmetry first, so peak both sides evenly.',
  ]},
  'Front Lat Spread': {icon:'frontDoubleBiceps', video:'front lat spread bodybuilding pose tutorial', points:[
    'Setup: Hands on the waist, fingers forward, elbows driving forward.',
    'Execution: Flare the lats wide with the chest lifted and abs braced.',
    'Common mistake: Rounding the shoulders to fake width.',
  ]},
  'Side Chest': {icon:'sideChest', video:'side chest bodybuilding pose tutorial', points:[
    'Setup: Turn to your better side and grip your near wrist.',
    'Execution: Press the arms down to drive the chest up; flex the near biceps, quad and calf.',
    'Common mistake: The rear foot pointing straight, which hides the calf.',
  ]},
  'Back Double Biceps': {icon:'backDoubleBiceps', video:'back double biceps bodybuilding pose tutorial', points:[
    'Setup: Arms as in the front double, feet a little narrower.',
    'Execution: Flare the lats, arch slightly for thickness, and flex one calf.',
    'Common mistake: Looking down, which breaks the line from traps to back.',
  ]},
  'Back Lat Spread': {icon:'backDoubleBiceps', video:'back lat spread bodybuilding pose tutorial', points:[
    'Setup: Hands on the waist from behind, elbows out and slightly back.',
    'Execution: Spread the lats wide, lower back braced, glutes and hamstrings flexed.',
    'Common mistake: Pulling the elbows straight out to the sides.',
  ]},
  'Side Triceps': {icon:'sideTriceps', video:'side triceps bodybuilding pose tutorial', points:[
    'Setup: Side-on, near arm down and back, gripped behind you.',
    'Execution: Lock the elbow fully to show the horseshoe; flex the rear leg too.',
    'Common mistake: Letting the chest cave while focusing on the arm.',
  ]},
  'Abdominal & Thigh': {icon:'abdominalThigh', video:'abdominal and thigh bodybuilding pose tutorial', points:[
    'Setup: Hands behind the head, one leg forward on the ball of the foot.',
    'Execution: Crunch down, flex the front quad, and exhale sharply and completely.',
    'Common mistake: Locking the front knee; a soft knee shows more sweep.',
  ]},
  'Most Muscular': {icon:'mostMuscular', video:'most muscular bodybuilding pose tutorial', points:[
    'Setup: Choose one version, crab or hands clasped, and drill it.',
    'Execution: Crunch everything inward at once: traps up, chest in, arms to center.',
    'Common mistake: Flexing only the arms and forgetting chest and traps.',
  ]},
  'Quarter Turn': {icon:'quarterTurn', video:'bodybuilding quarter turns posing tutorial', points:[
    'Setup: Tall and relaxed, front foot turned out about 30-45°.',
    'Execution: Shoulders back, chest lifted, the same poise through all four turns.',
    'Common mistake: Over-flexing; these divisions score a relaxed, confident look.',
  ]},
  'Side Profile Pose': {icon:'quarterTurn', video:'bikini side profile pose tutorial', points:[
    'Setup: Fully side-on, weight on the back leg, front knee soft.',
    'Execution: Lift the ribs and lengthen through the side, glutes lightly on.',
    'Common mistake: Collapsing at the waist or dropping a hip.',
  ]},
  'Front Relaxed Pose': {icon:'quarterTurn', video:'figure front relaxed pose tutorial', points:[
    'Setup: Face forward, feet hip-width, arms relaxed.',
    'Execution: Hold a light full-body tone, shoulders open, ribs lifted.',
    'Common mistake: Too soft or too flexed; this view exposes symmetry, so rehearse it most.',
  ]},
  'Rear Pose (Glute Emphasis)': {icon:'quarterTurn', video:'wellness division rear pose tutorial', points:[
    'Setup: Back to the judges, one heel gently lifted.',
    'Execution: A light glute and hamstring squeeze to show the glute-hamstring tie-in.',
    'Common mistake: Over-arching the lower back to push the glutes out.',
  ]},
  'Back Pose with Flex': {icon:'backDoubleBiceps', video:'wellness division back pose tutorial', points:[
    'Setup: Back to the judges, arms in a light back double biceps.',
    'Execution: A moderate, smooth flex, about 60% of a bodybuilding pose.',
    'Common mistake: Flexing as hard as a bodybuilder.',
  ]},
};

const SWIM_ICONS = {
  bobbing: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="15" cy="16" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="15" y1="19" x2="15" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="15" y1="22" x2="10" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="15" y1="22" x2="20" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M25 14 Q28 10 31 14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M30 20 Q33 17 36 20" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  streamlineFront: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="22" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="22" x2="34" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="22" x2="40" y2="19" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="22" x2="40" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="7" y1="20" x2="2" y2="17" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  streamlineBack: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="22" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="22" x2="34" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="22" x2="40" y2="19" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="22" x2="40" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M2 14 Q7 11 12 14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  flutterKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="20" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="20" x2="38" y2="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="20" x2="38" y2="27" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  armPullFreestyle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="16" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="16" x2="30" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="20" x2="36" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 8 Q22 20 18 32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="36" x2="40" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  armRecoveryHighElbow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="20" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="20" x2="38" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 14 Q24 4 32 12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  breathingSide: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="9" cy="18" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="20" x2="32" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="32" y1="24" x2="38" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M2 30 Q6 26 10 30" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="36" x2="40" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  rotationTiming: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="18" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="18" x2="30" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="22" x2="38" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 8 A10 10 0 0 1 22 26" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  backPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="22" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="22" x2="30" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="22" x2="38" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 8 Q24 18 20 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="36" x2="40" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  backRecovery: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="22" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="22" x2="30" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="22" x2="38" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="4" x2="18" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  breastPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="18" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="18" x2="26" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 10 Q6 16 15 24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 10 Q26 16 17 24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  whipKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="20" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="20" x2="24" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 20 Q22 28 30 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 20 Q26 28 18 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="34" x2="40" y2="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  breastBreathing: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="14" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="17" x2="20" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="10" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="30" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  undulationWave: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="6" cy="20" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M9 20 Q16 28 22 20 T35 20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="35" y1="20" x2="40" y2="17" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="35" y1="20" x2="40" y2="23" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="34" x2="40" y2="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  dolphinKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="20" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="20" x2="26" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M26 20 Q32 12 38 20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M26 20 Q32 28 38 20" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/> <line x1="4" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  flyPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="7" cy="16" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="16" x2="26" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 8 Q10 18 18 28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 8 Q26 18 18 28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="34" x2="40" y2="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  flyRecovery: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="16" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="19" x2="20" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 20 Q10 14 4 20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 20 Q30 14 36 20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  flyBreathing: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="15" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="18" x2="20" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="21" x2="9" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="21" x2="31" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="29" x2="40" y2="29" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
};

const SWIM_STROKE_DETAILS = {
  'Breath Control & Rhythmic Bobbing': {icon:'bobbing', video:'swimming breath control bobbing drill for beginners', points:[
    'Setup: In chest-deep water, take a full breath and sink by bending your knees.',
    'Execution: Exhale a steady trickle underwater, then push up and inhale as your face clears.',
    'Common mistake: Only exhaling at the surface, holding your breath underwater; fix this before any stroke.',
  ]},
  'Front Float (Streamline Position)': {icon:'streamlineFront', video:'front float streamline position swimming tutorial', points:[
    'Setup: Push off face down, arms overhead, hands stacked, biceps by your ears.',
    'Execution: Look straight down and let the hips and legs float up; hold 5-10 seconds.',
    'Common mistake: Lifting the head to look forward, which sinks the legs.',
  ]},
  'Back Float': {icon:'streamlineBack', video:'back float swimming tutorial beginners', points:[
    'Setup: Lie back with ears underwater, chin slightly tucked.',
    'Execution: Push your belly button up so the hips rise; breathe normally.',
    'Common mistake: Lifting the head to check your position, which drops the hips.',
  ]},
  'Flutter Kick on the Wall': {icon:'flutterKick', video:'flutter kick drill kickboard swimming tutorial', points:[
    'Setup: Hold the wall or a kickboard, body flat, face down.',
    'Execution: Kick from the hip with long legs and loose, slightly pointed ankles.',
    'Common mistake: Kicking from a bent knee like pedaling a bike.',
  ]},

  'Body Position & Streamline': {icon:'streamlineFront', video:'freestyle swimming body position technique', points:[
    'Setup: Start from a long, flat front float off the wall.',
    'Execution: Stay near horizontal with eyes down so the hips and legs ride high.',
    'Common mistake: Swimming head-up, then kicking harder to fix the sinking legs.',
  ]},
  'Flutter Kick': {icon:'flutterKick', video:'freestyle flutter kick technique tutorial', points:[
    'Setup: The same hip-driven, loose-ankle kick, now while swimming.',
    'Execution: Keep it narrow and light; it balances you while the pull drives you.',
    'Common mistake: Kicking too hard early and burning the legs out.',
  ]},
  'Catch & Early Vertical Forearm': {icon:'armPullFreestyle', video:'freestyle high elbow catch early vertical forearm tutorial', points:[
    'Setup: Hand enters in front of the shoulder, not across the midline.',
    'Execution: Bend the elbow and drop the forearm vertical while the elbow stays high.',
    'Common mistake: A dropped elbow sweeping back like an oar; try the catch-up drill.',
  ]},
  'Pull-Through & Finish (S-Pull)': {icon:'armPullFreestyle', video:'freestyle swimming s-pull finish technique tutorial', points:[
    'Setup: From the catch, pull along a gentle curve under the body.',
    'Execution: Accelerate all the way, fastest as the hand passes the hip.',
    'Common mistake: Stopping at the hip instead of finishing the push.',
  ]},
  'High-Elbow Recovery': {icon:'armRecoveryHighElbow', video:'freestyle high elbow arm recovery technique', points:[
    'Setup: As the pull ends, lift the elbow first.',
    'Execution: Elbow above hand, fingertips skimming the water, arm relaxed.',
    'Common mistake: A stiff, straight arm swinging wide.',
  ]},
  'Bilateral (Rotary) Breathing': {icon:'breathingSide', video:'bilateral breathing freestyle swimming tutorial', points:[
    'Setup: Rotate the whole body so your mouth clears the water.',
    'Execution: Breathe every third stroke, alternating sides.',
    'Common mistake: Lifting the head straight up to breathe, which sinks the hips.',
  ]},
  'Stroke Timing & Body Rotation': {icon:'rotationTiming', video:'freestyle body rotation timing swimming technique', points:[
    'Setup: Roll toward each pulling arm; freestyle is swum on alternating sides.',
    'Execution: Rotate hips and shoulders together, about 30-45° each way.',
    'Common mistake: Swimming flat and windmilling the arms, which strains the shoulders.',
  ]},

  'Back Float & Body Position': {icon:'streamlineBack', video:'backstroke body position technique tutorial', points:[
    'Setup: Ears under, hips up, chin slightly tucked.',
    'Execution: Hold a flat line from shoulders to ankles, eyes on one point overhead.',
    'Common mistake: Lifting the head to see ahead, which drops the hips.',
  ]},
  'Backstroke Flutter Kick': {icon:'flutterKick', video:'backstroke kick technique tutorial', points:[
    'Setup: The same loose-ankle kick, face up, toes just breaking the surface.',
    'Execution: Power comes on the upkick, a small fountain of white water.',
    'Common mistake: Kicking deep enough that the knees break the surface.',
  ]},
  'Catch & Pull': {icon:'backPull', video:'backstroke catch and pull technique tutorial', points:[
    'Setup: Enter pinky first, in line with the shoulder.',
    'Execution: Bend into a vertical-forearm catch and pull in a curve to the hip.',
    'Common mistake: A straight-arm windmill pull; video helps since you can\'t see it.',
  ]},
  'Recovery Arm (Straight-Arm Exit & Entry)': {icon:'backRecovery', video:'backstroke arm recovery technique tutorial', points:[
    'Setup: Exit thumb first with a straight arm.',
    'Execution: Swing it straight over the shoulder and enter pinky first.',
    'Common mistake: Entering behind the head in line with the ear.',
  ]},
  'Body Rotation & Timing': {icon:'rotationTiming', video:'backstroke body rotation timing technique', points:[
    'Setup: Hips and shoulders roll together toward the pulling side.',
    'Execution: As one arm finishes its pull, the other enters, with no pause.',
    'Common mistake: A flat torso with arms windmilling over it.',
  ]},
  'Breathing Rhythm': {icon:'breathingSide', video:'backstroke breathing rhythm technique tutorial', points:[
    'Setup: Your face is always clear; the job is not to hold your breath.',
    'Execution: Inhale on one arm\'s recovery, exhale on the other.',
    'Common mistake: Unknowingly holding your breath for several strokes.',
  ]},

  'Body Position & Streamline Glide': {icon:'streamlineFront', video:'breaststroke streamline glide technique tutorial', points:[
    'Setup: After each cycle, return to a full streamline.',
    'Execution: Hold the glide longer than feels natural, about one-Mississippi.',
    'Common mistake: Cutting the glide short and paddling continuously.',
  ]},
  'Breaststroke Pull (Out-Sweep, In-Sweep, Recovery)': {icon:'breastPull', video:'breaststroke pull technique tutorial', points:[
    'Setup: From streamline, sweep the hands out in a shallow Y.',
    'Execution: Sweep back in, hands meeting in front of the chest; small and quick.',
    'Common mistake: Pulling wide or past the shoulders like freestyle.',
  ]},
  'Whip Kick (Breaststroke Kick)': {icon:'whipKick', video:'breaststroke whip kick technique tutorial', points:[
    'Setup: Draw the heels to the glutes, knees about hip-width.',
    'Execution: Turn the feet out, whip them around, and snap them together.',
    'Common mistake: A bicycle or scissor kick, which is also illegal in competition.',
  ]},
  'Timing: Pull-Breathe-Kick-Glide': {icon:'rotationTiming', video:'breaststroke timing pull breathe kick glide tutorial', points:[
    'Setup: The order is pull-breathe-kick-glide; say it aloud while learning.',
    'Execution: Pull and breathe together, then kick as the arms reach forward.',
    'Common mistake: Pulling and kicking at the same time.',
  ]},
  'Breathing & Head Position': {icon:'breastBreathing', video:'breaststroke breathing head position technique', points:[
    'Setup: The head lifts because the pull lifts you, not on its own.',
    'Execution: Lift just enough to clear the mouth, then drop as the arms extend.',
    'Common mistake: Lifting the head before the pull, which drags the hips.',
  ]},
  'Body Undulation (Modern Wave Breaststroke)': {icon:'undulationWave', video:'wave breaststroke undulation technique tutorial', points:[
    'Setup: Add this only once the timing is automatic.',
    'Execution: Press the chest slightly down in the glide and let the hips follow.',
    'Common mistake: Adding the wave before the kick and timing are clean.',
  ]},

  'Body Undulation (The Wave)': {icon:'undulationWave', video:'butterfly stroke body undulation wave technique', points:[
    'Setup: From streamline, start a wave at the chest.',
    'Execution: Let it ripple through chest, hips, then legs, like a whip.',
    'Common mistake: Muscling fly with the arms over a stiff torso.',
  ]},
  'Two-Beat Dolphin Kick': {icon:'dolphinKick', video:'butterfly dolphin kick technique tutorial', points:[
    'Setup: Legs together, moving as one.',
    'Execution: A small kick as the hands enter, a bigger one as they finish.',
    'Common mistake: Kicking from the knees only, disconnected from the wave.',
  ]},
  'Butterfly Pull (Keyhole Pattern)': {icon:'flyPull', video:'butterfly stroke keyhole pull technique tutorial', points:[
    'Setup: Both hands enter in front of the shoulders.',
    'Execution: Sweep in toward the center, then out to the hips, in a keyhole shape.',
    'Common mistake: Pulling straight back instead of the curved path.',
  ]},
  'Butterfly Recovery': {icon:'flyRecovery', video:'butterfly stroke arm recovery technique tutorial', points:[
    'Setup: As the pull ends, sweep both arms out low over the water.',
    'Execution: Throw them forward relaxed, letting momentum carry them.',
    'Common mistake: Hoisting the arms high and stiff.',
  ]},
  'Breathing (Chin-Skim Technique)': {icon:'flyBreathing', video:'butterfly stroke breathing technique tutorial', points:[
    'Setup: Breathe on the second, bigger kick as the pull finishes.',
    'Execution: Lift just enough for the chin to skim the surface.',
    'Common mistake: Lifting too high or breathing every stroke.',
  ]},
  'Timing & Rhythm': {icon:'rotationTiming', video:'butterfly stroke timing rhythm technique tutorial', points:[
    'Setup: Kick on entry, pull, kick on the finish, relaxed recovery.',
    'Execution: Make it one continuous wave, not four separate moves.',
    'Common mistake: Muscling through; if fly exhausts you, slow down and find the wave.',
  ]},
};

const CLIMB_ICONS = {
  threePoints: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="6" x2="8" y2="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/> <line x1="36" y1="6" x2="36" y2="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/> <circle cx="8" cy="12" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="12" cy="30" r="2.6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="32" cy="24" r="2.6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="14" x2="13" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="14" x2="31" y2="23" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="14" x2="24" y2="10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3"/> </svg>',
  straightArmHang: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="6" x2="40" y2="6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="12" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="20" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="15" x2="15" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="15" x2="29" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="26" x2="16" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="26" x2="24" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  hipPosition: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="38" y1="4" x2="38" y2="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> <circle cx="20" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="13" x2="28" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="22" x2="36" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="22" x2="34" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="22" x2="16" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="30" x2="10" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  quietFeet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="30" cy="30" r="2.2" stroke="currentColor" stroke-width="2.2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 34 Q24 32 30 30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 40 Q18 36 18 34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="14" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="14" y1="13" x2="16" y2="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  crimpGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="20" x2="38" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M12 20 Q12 30 8 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 20 Q18 32 14 32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 20 Q24 32 20 32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M30 20 Q30 30 26 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  openHandGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="20" x2="38" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M12 20 Q13 26 11 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 20 Q19 27 17 32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 20 Q25 27 23 32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M30 20 Q31 26 29 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  pinchGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <rect x="16" y="10" width="10" height="24" rx="2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 16 Q6 18 8 26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M26 16 Q36 18 34 26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  sloperGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <path d="M4 26 Q22 8 40 26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M12 22 Q22 30 32 22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="30" x2="22" y2="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  pocketGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="22" x2="38" y2="22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="26" r="4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="22" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 22 L20 26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 22 L24 26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  gastonGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="22" y1="6" x2="22" y2="36" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 14 Q30 14 32 20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 20 Q34 18 36 24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M32 20 L38 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  underclingGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="14" x2="38" y2="14" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M12 14 Q12 6 8 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 14 Q20 4 16 4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="18" x2="20" y2="34" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  sidepullGrip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="30" y1="4" x2="30" y2="36" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 14 Q28 14 30 18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 20 Q28 22 30 26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="8" y2="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  edgingFoot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="30" x2="40" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 30 Q26 28 30 24" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 30 L18 36 L28 34 L30 24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="30" cy="24" r="1.8" stroke="currentColor" stroke-width="1.8" fill="currentColor"/> </svg>',
  smearingFoot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="8" x2="30" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 20 Q26 24 22 32" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M18 20 L12 26 L18 34 L22 32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  dropKnee: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="36" y1="4" x2="36" y2="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> <circle cx="18" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="11" x2="24" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="34" y2="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="14" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="26" x2="20" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="30" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="30" x2="34" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  flagging: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="4" x2="8" y2="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> <circle cx="16" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="18" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="8" x2="16" y2="13" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="22" x2="12" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="22" x2="32" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  heelHook: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="38" y1="4" x2="38" y2="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="16" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="24" x2="12" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 24 Q30 22 34 30" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="34" cy="30" r="1.8" stroke="currentColor" stroke-width="1.8" fill="currentColor"/> </svg>',
  toeHook: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="6" x2="6" y2="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> <circle cx="30" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="13" x2="24" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="24" x2="28" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 24 Q10 26 8 16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="8" cy="16" r="1.8" stroke="currentColor" stroke-width="1.8" fill="currentColor"/> </svg>',
  mantling: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="16" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="16" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="16" x2="26" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="20" x2="20" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="30" x2="14" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  stemming: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="4" x2="6" y2="40" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="38" y1="4" x2="38" y2="40" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <circle cx="22" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="22" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="8" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="36" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="9" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="35" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  dyno: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="18" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="13" x2="30" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="20" x2="10" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="20" x2="26" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="6" y1="36" x2="34" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5" opacity="0.5"/> </svg>',
  rockover: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="6" y1="4" x2="6" y2="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> <circle cx="26" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="26" y1="11" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="10" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="26" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="10" cy="26" r="1.8" stroke="currentColor" stroke-width="1.8" fill="currentColor"/> </svg>',
};

const CLIMB_TECHNIQUE_DETAILS = {
  'Three Points of Contact': {icon:'threePoints', video:'climbing three points of contact technique beginners', points:[
    'Setup: Before moving a limb, check the other three are solid.',
    'Execution: Move one hand or foot at a time from a stable base.',
    'Common mistake: Reaching while off-balance, then grabbing to catch yourself.',
  ]},
  'Straight-Arm Resting (Skeletal Hang)': {icon:'straightArmHang', video:'climbing straight arm technique resting skeleton', points:[
    'Setup: Hang on straight arms whenever the holds allow.',
    'Execution: Relax the arm muscles and let the skeleton carry the load; shake out.',
    'Common mistake: Keeping the arms bent out of fear, which pumps you out fast.',
  ]},
  'Hip Positioning & Wall Awareness': {icon:'hipPosition', video:'climbing hip positioning technique wall awareness', points:[
    'Setup: Turn the hip on the reaching side into the wall.',
    'Execution: Bring your center of gravity close to the wall to extend your reach.',
    'Common mistake: Staying square on steep ground and using the arms instead.',
  ]},
  'Quiet Feet & Precision Footwork': {icon:'quietFeet', video:'climbing quiet feet precision footwork drill', points:[
    'Setup: Look at the foothold before you move.',
    'Execution: Place the foot exactly once and leave it there.',
    'Common mistake: Scraping around with the toe; try placing every foot silently.',
  ]},

  'Crimp Grip (Full & Half Crimp)': {icon:'crimpGrip', video:'climbing crimp grip technique full half crimp', points:[
    'Setup: Fingers bent sharply on a small edge; a full crimp wraps the thumb over.',
    'Execution: Default to half crimp; save the full crimp for the tiniest edges.',
    'Common mistake: Full-crimping everything, a major risk for the A2 pulley.',
  ]},
  'Open Hand (Drag) Grip': {icon:'openHandGrip', video:'climbing open hand drag grip technique', points:[
    'Setup: Fingers curved gently over the hold, middle knuckle relaxed.',
    'Execution: Let friction and finger pads do the work.',
    'Common mistake: Assuming it\'s weak and crimping instead; it\'s the safest grip to train.',
  ]},
  'Pinch Grip': {icon:'pinchGrip', video:'climbing pinch grip technique tutorial', points:[
    'Setup: Thumb on one side of the hold, fingers on the other.',
    'Execution: Squeeze thumb and fingers together actively.',
    'Common mistake: Forgetting the thumb, which turns it into a weak open hand.',
  ]},
  'Sloper': {icon:'sloperGrip', video:'climbing sloper technique friction grip', points:[
    'Setup: Get as much palm and finger flat on the hold as you can.',
    'Execution: Wrist low, body weight low and centered beneath the hold.',
    'Common mistake: Gripping hard with the fingers instead of pressing with the palm.',
  ]},
  'Pocket Grip': {icon:'pocketGrip', video:'climbing pocket grip technique two finger mono', points:[
    'Setup: Pick the fingers the pocket fits, slightly curled, never jammed.',
    'Execution: Build edges and open hand first; add pockets only after years of healthy tendon loading.',
    'Common mistake: Training pockets early, or cranking monos or two-finger pockets cold; both injure tendons.',
  ]},
  'Gaston': {icon:'gastonGrip', video:'climbing gaston technique tutorial', points:[
    'Setup: Thumb down, elbow out on a vertical edge.',
    'Execution: Push outward like prying a door open, driving from shoulder and back.',
    'Common mistake: Tucking the elbow in, which kills the leverage.',
  ]},
  'Undercling': {icon:'underclingGrip', video:'climbing undercling technique tutorial', points:[
    'Setup: Grip the hold from below, palm up.',
    'Execution: Get the feet high and close, hips low, then pull up and in.',
    'Common mistake: Reaching up from low feet and straight legs.',
  ]},
  'Side Pull': {icon:'sidepullGrip', video:'climbing side pull technique tutorial', points:[
    'Setup: Grip a vertical hold and pull sideways toward your body.',
    'Execution: Press a foot out wide or flag to create counter-tension.',
    'Common mistake: Pulling without the opposing foot, so you barn-door off.',
  ]},

  'Edging': {icon:'edgingFoot', video:'climbing edging footwork technique tutorial', points:[
    'Setup: Place the shoe\'s edge precisely on the small hold.',
    'Execution: Weight straight down through that point and trust it.',
    'Common mistake: Standing on the arch instead of the big toe or edge.',
  ]},
  'Smearing': {icon:'smearingFoot', video:'climbing smearing footwork technique tutorial', points:[
    'Setup: Press as much sole rubber as possible flat onto the rock.',
    'Execution: Heel low, weight directly over the foot; trust the friction.',
    'Common mistake: Lifting the heel onto the toe, shrinking the rubber contact.',
  ]},
  'Backstep & Drop Knee': {icon:'dropKnee', video:'climbing backstep drop knee technique tutorial', points:[
    'Setup: Turn a hip in and place that foot\'s outside edge on a hold.',
    'Execution: Drop the knee down and in to extend the opposite reach.',
    'Common mistake: Dropping the knee with the hip still square.',
  ]},
  'Flagging': {icon:'flagging', video:'climbing flagging technique tutorial', points:[
    'Setup: Extend one leg to the side or behind, on no hold, as a counterweight.',
    'Execution: Use it to keep your balance when reaching from one foot.',
    'Common mistake: Not flagging on cross-body reaches, then over-gripping.',
  ]},

  'Heel Hook': {icon:'heelHook', video:'climbing heel hook technique tutorial', points:[
    'Setup: Hook your heel over a hold, often above the waist on steep ground.',
    'Execution: Pull actively with the hamstring, heel toward your glutes.',
    'Common mistake: Resting the heel passively so it pops off under load.',
  ]},
  'Toe Hook': {icon:'toeHook', video:'climbing toe hook technique tutorial', points:[
    'Setup: Hook the top of your foot under a hold or roof lip.',
    'Execution: Pull the toes up toward the shin to hold tension.',
    'Common mistake: Letting it hang passively, so it fails mid-reach.',
  ]},
  'Mantling': {icon:'mantling', video:'climbing mantle technique tutorial', points:[
    'Setup: Press down on the ledge like climbing out of a pool.',
    'Execution: Get a foot onto the ledge early to move weight off the arms.',
    'Common mistake: Pressing all the way up on the arms before bringing a foot up.',
  ]},
  'Stemming': {icon:'stemming', video:'climbing stemming technique tutorial', points:[
    'Setup: Push hands and feet out against two opposing walls.',
    'Execution: Press outward; the opposing tension holds you, often enough to rest.',
    'Common mistake: Standing narrow instead of pushing the feet wide.',
  ]},
  'Dynamic Movement (Dyno)': {icon:'dyno', video:'climbing dyno technique tutorial', points:[
    'Setup: Make sure the hold really is out of static reach first.',
    'Execution: Drive with the legs and pull together, catching at the peak.',
    'Common mistake: Throwing with the arms, or dynoing before static movement is solid.',
  ]},
  'Rock-over': {icon:'rockover', video:'climbing rockover technique tutorial', points:[
    'Setup: Get one foot onto a high hold.',
    'Execution: Lead with the hips, roll your weight over that foot, and stand up.',
    'Common mistake: Leaning away from the foot and pulling with the arms.',
  ]},
};

const CLIMB_TECHNIQUE_GROUPS = {
  'Movement Fundamentals': {
    poses:['Three Points of Contact','Straight-Arm Resting (Skeletal Hang)','Hip Positioning & Wall Awareness','Quiet Feet & Precision Footwork'],
    note:'Start here; most plateaus are a missing habit, not missing strength.',
  },
  'Hand Grips': {
    poses:['Crimp Grip (Full & Half Crimp)','Open Hand (Drag) Grip','Pinch Grip','Sloper','Pocket Grip','Gaston','Undercling','Side Pull'],
    note:'Match the grip to the hold instead of using one grip for everything.',
  },
  'Footwork': {
    poses:['Edging','Smearing','Backstep & Drop Knee','Flagging'],
    note:'Good feet let weaker fingers outclimb strong ones.',
  },
  'Advanced Movement': {
    poses:['Heel Hook','Toe Hook','Mantling','Stemming','Dynamic Movement (Dyno)','Rock-over'],
    note:'Roofs, corners, ledges and reaches beyond static range.',
  },
};

const WATERSPORTS_ICONS = {
  wave: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <path d="M4 26 Q11 16 18 26 T32 26 T44 22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="34" x2="40" y2="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3.5"/> </svg>',
  paddling: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <ellipse cx="22" cy="26" rx="16" ry="4" stroke="currentColor" stroke-width="2" fill="none"/> <circle cx="12" cy="18" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="13" y1="21" x2="20" y2="25" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 24 Q26 14 32 18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20 26 Q26 34 30 30" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  popUp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <ellipse cx="22" cy="34" rx="16" ry="3.2" stroke="currentColor" stroke-width="2" fill="none"/> <circle cx="20" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="13" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="12" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="30" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="16" x2="9" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="31" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  duckDive: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <path d="M2 14 Q11 6 20 14 T38 14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="16" cy="26" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="28" x2="30" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M13 24 Q8 30 12 36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  turn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <path d="M8 32 Q8 12 28 12" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M23 8 L28 12 L23 16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="8" cy="26" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="29" x2="8" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  safety: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <path d="M22 4 L38 12 V22 C38 32 30 38 22 40 C14 38 6 32 6 22 V12 Z" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="22" y2="24" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/> <circle cx="22" cy="30" r="1.6" fill="currentColor"/> </svg>',
};

const WATERSPORTS_TECHNIQUE_DETAILS = {
  'Ocean Safety & Rip Currents': {icon:'safety', video:'ocean safety rip current identification surfing beginners', points:[
    'Setup: before paddling out, watch for a few minutes: find the rip (calmer, murkier water moving seaward), the peak, and your exit.',
    'Execution: if caught in a rip, don\'t swim straight back to shore; paddle parallel to the beach until free, then angle in.',
    'Whole-body integration: read the ocean every session; sandbars, rips and wave size shift daily and with the tide.',
    'Common mistake: panicking and fighting a rip head-on; most rip drownings come from exhaustion, not the current\'s strength.',
    'Coaching insight: surf with someone nearby when new, know your limits before bigger or crowded surf, and check leash, board and conditions every time.',
  ]},
  'Reading Waves & Lineup Positioning': {icon:'wave', video:'how to read waves surf lineup positioning beginners', points:[
    'Setup: watch a few sets before paddling out; waves arrive in groups with lulls, and the peak usually breaks in the same spot.',
    'Execution: sit where waves are breaking, not in the whitewater or beyond the break; this spot shifts with the tide.',
    'Whole-body integration: use fixed points on land to hold your position; drifting out of place is a common reason beginners miss waves.',
    'Common mistake: sitting too far inside, in whitewater, or too far outside, catching only the fading shoulder.',
    'Coaching insight: etiquette matters: the surfer closest to the peak has right of way, and dropping in is unsafe and unwelcome.',
  ]},
  'Duck Dive': {icon:'duckDive', video:'surfing duck dive technique tutorial', points:[
    'Setup: as a wave approaches while paddling out, grip the rails at chest level and keep paddling forward into it.',
    'Execution: push the nose under just before the wave hits, then drive the tail down with a knee so you pass under its force.',
    'Whole-body integration: timing beats strength: too early and the wave catches the board; too late and it drives you back.',
    'Common mistake: letting go of the board when a wave looks intimidating, losing ground and getting pushed toward shore.',
    'Coaching insight: shortboards duck dive easily; longboards are too buoyant, so learn the turtle roll (flip and hold on) instead.',
  ]},
  'Paddling Technique': {icon:'paddling', video:'surfing paddling technique efficient stroke', points:[
    'Setup: lie centered so the nose sits just out of the water; too far forward buries it, too far back slows you.',
    'Execution: reach forward with a slightly cupped hand and pull long and deep close to the rail, alternating in a steady rhythm.',
    'Whole-body integration: head up, chest slightly lifted, to keep the board trimmed and see waves and other surfers.',
    'Common mistake: short, splashy strokes near the surface; paddling fills about 54% of a session, so inefficiency compounds.',
    'Coaching insight: practice short, hard sprint-paddle bursts with rest, matching how you actually catch waves.',
  ]},
  'Pop-Up': {icon:'popUp', video:'surfing pop up technique tutorial', points:[
    'Setup: as the wave lifts the board and pushes you, place both hands flat under your chest, ready to press up.',
    'Execution: in one explosive motion, press up and drive both feet into a low stance, front foot under your chest, back foot near the tail.',
    'Whole-body integration: land knees bent and centered; a real pop-up takes under a second, which explosive land training prepares you for.',
    'Common mistake: standing up in two steps, knees then feet, which is too slow on a moving wave; trained surfers measurably popped up faster.',
    'Coaching insight: practice hundreds of pop-ups on sand or a mat until automatic before trying it in the ocean.',
  ]},
  'Trim & Stance': {icon:'popUp', video:'surfing trim stance weight distribution technique', points:[
    'Setup: once up, find a relaxed athletic stance: knees bent, feet shoulder-width on the stringer, hands loose for balance.',
    'Execution: trim by shifting weight forward to speed up and back to slow or turn, keeping the board at its fastest angle.',
    'Whole-body integration: look where you want to go, not at your feet; the body follows eyes and shoulders.',
    'Common mistake: standing upright with locked knees, unable to absorb bumps and harder to turn.',
    'Coaching insight: it\'s the same low, centered stance from pop-up practice; trim is what happens after the pop-up.',
  ]},
  'Bottom Turn': {icon:'turn', video:'surfing bottom turn technique tutorial', points:[
    'Setup: riding down the face toward its base, shift weight to your back foot and turn shoulders and hips toward your new direction.',
    'Execution: drive off the back foot with knees bent, carving a smooth arc back up toward the unbroken power of the wave.',
    'Whole-body integration: a rotational, hip-and-core movement, so rotational land training transfers straight to how hard you can turn.',
    'Common mistake: turning only the upper body while the board stays flat, giving a weak, skidding turn instead of a carve.',
    'Coaching insight: often called surfing\'s most important turn, as its speed and angle set up every maneuver that follows.',
  ]},
  'Cutback': {icon:'turn', video:'surfing cutback technique tutorial', points:[
    'Setup: once you\'ve outrun the wave\'s power on the shoulder, look back over your trailing shoulder toward the pocket.',
    'Execution: shift to your back foot and carve a wide, committed arc back toward the pocket using the bottom turn\'s rotational drive.',
    'Whole-body integration: commit fully through hips and back foot; a tentative cutback stalls exactly when it needs speed.',
    'Common mistake: cutting back before reaching the shoulder, leaving no power to reconnect with.',
    'Coaching insight: it\'s built on the bottom turn; without a confident, powerful bottom turn, cutbacks stay difficult.',
  ]},

  'Beach & Water Safety': {icon:'safety', video:'skimboarding safety tips beginners', points:[
    'Setup: walk your skimming stretch first, checking for holes, rocks, shells and how firm and wet the sand is.',
    'Execution: on flat sand the main risks are a planted, rotated ankle and falling onto an outstretched hand; riding waves is a serious step up.',
    'Whole-body integration: case reports describe spinal cord injuries from diving or launching headfirst into shallow water while riding waves.',
    'Common mistake: treating wave-riding as an extension of flatland skimming; adding wave speed in knee-deep water changes the risk.',
    'Coaching insight: never dive headfirst in shallow water, know the depth before committing, and master flatland basics before waves.',
  ]},
  'The Run & Drop': {icon:'popUp', video:'skimboarding run and drop technique tutorial', points:[
    'Setup: hold the board flat and run at a controlled sprint toward wet sand; timing matters more than speed at first.',
    'Execution: drop the board just ahead of your lead foot without breaking stride and step onto its center the instant it lands.',
    'Whole-body integration: the same single-motion transition as the land drill; learn it on stable ground before sliding sand.',
    'Common mistake: looking down at the board instead of ahead, which slows the drop and throws off the step-on.',
    'Coaching insight: start slow, focused on drop timing and the first foot plant, adding speed only once timing is consistent.',
  ]},
  'Foot Positioning & Stance': {icon:'turn', video:'skimboarding stance foot positioning technique', points:[
    'Setup: land your lead foot near the center, then bring the trailing foot on quickly into a sideways, shoulder-width stance.',
    'Execution: knees bent, weight centered over the middle; too far forward stalls the nose, too far back spins the tail.',
    'Whole-body integration: this low, centered stance is what the ankle-stability and landing training make automatic.',
    'Common mistake: locking the knees on landing, sending the board\'s sudden deceleration up the leg, part of the ankle-injury mechanism.',
    'Coaching insight: stick the landing in a stable stance for a full second before anything else; rushing into turns plants feet awkwardly.',
  ]},
  'Ankle-Safe Turning & Carving': {icon:'turn', video:'skimboarding carving turn technique tutorial', points:[
    'Setup: in a stable slide, shift weight to heels or toes toward your turn, knees bent and hips low.',
    'Execution: turn by rotating hips and shoulders together and letting the board follow, not twisting at the ankle or knee.',
    'Whole-body integration: two hospital studies found rotation over a planted leg was the most common skimboarding injury mechanism.',
    'Common mistake: forcing a sharp turn through the ankle when the board stops or catches; let the turn go and reset instead.',
    'Coaching insight: build from wide, gentle turns to tight carves, and bail out whenever the board suddenly catches or stops.',
  ]},
  'Falling Safely': {icon:'safety', video:'how to fall safely board sports technique', points:[
    'Setup: the instant a fall is unavoidable — the board stops, catches or you lose balance — switch from staying up to falling well.',
    'Execution: fall to the side or roll instead of catching yourself on a straight arm, taking it across forearm and shoulder.',
    'Whole-body integration: falling onto an outstretched hand caused over 40% of skimboarding injuries in hospital studies, a direct path to wrist fracture.',
    'Common mistake: instinctively throwing a straight arm out; the reflex is hard to override, which is why grip and forearm strength work helps.',
    'Coaching insight: practice slow, controlled rolling falls on grass or sand, like martial-arts breakfalls, until the safer reflex is automatic.',
  ]},
  'Wave-Riding Basics': {icon:'wave', video:'skimboarding wave riding basics tutorial', points:[
    'Setup: it\'s a progression from flatland skimming; the run-and-drop, stance and controlled falls must be solid first.',
    'Execution: time your run and drop to meet an incoming wave in the shallows, then ride its push, adjusting stance for the extra speed.',
    'Whole-body integration: waves add speed and unpredictability, so ankle-stability and landing work matter even more here.',
    'Common mistake: attempting wave maneuvers, especially diving or launching toward the water, before flatland basics are solid.',
    'Coaching insight: know the depth first, start with small, gentle whitewater, and treat wave-riding as the most advanced, injury-prone step.',
  ]},

  'Wakeboarding Safety & Gear': {icon:'safety', video:'wakeboarding safety tips beginners gear', points:[
    'Setup: wear a fitted watersports flotation vest and ideally a helmet; head and neck injuries are wakeboarding\'s largest documented category.',
    'Execution: agree hand signals with the driver first: thumbs up faster, flat hand hold, thumbs down slower, hand across throat stop.',
    'Whole-body integration: know your limits before faster pulls or bigger jumps; injury rates climbed as remaining riders took on more risk.',
    'Common mistake: wrapping the tow rope around any part of your body; it\'s a serious entanglement risk, so always be ready to let go.',
    'Coaching insight: check the path is clear of swimmers, riders and shallow water, and always have a dedicated spotter besides the driver.',
  ]},
  'Stance & Deep-Water Start': {icon:'popUp', video:'wakeboarding deep water start technique tutorial', points:[
    'Setup: sit back in the water, knees to chest, board in front across the pull, arms straight holding the handle outside your knees.',
    'Execution: as the rope tightens, stay low and let the pull straighten your legs, chest up and weight centered over the board.',
    'Whole-body integration: it\'s the deep, stable squat your landing training builds; without it, holding the position against the pull is hard.',
    'Common mistake: standing before the boat has enough speed, burying the board and pulling you forward off balance.',
    'Coaching insight: keep arms straight and let the pull go through hips and legs; muscling up with the arms burns out your grip.',
  ]},
  'Edging & Wake Crossing': {icon:'turn', video:'wakeboarding edging technique wake crossing tutorial', points:[
    'Setup: once up, hold a balanced athletic stance, knees bent, handle at hip level, arms relaxed rather than locked.',
    'Execution: tip the board onto its heel or toe edge by shifting your hips, not just leaning your upper body, to build speed and direction.',
    'Whole-body integration: carving from the hips spreads load across legs and core instead of one joint, the principle of the rotational training.',
    'Common mistake: leaning the upper body while hips and board stay flat, giving a weak, skidding edge that pulls you off balance.',
    'Coaching insight: build edge control with small changes before hard cuts across the wake, looking where you want to go.',
  ]},
  'Basic Wake Jump (Ollie)': {icon:'wave', video:'wakeboarding wake jump ollie technique tutorial', points:[
    'Setup: approach the wake with speed from a committed edge, handle at the hip, knees bent and ready to load.',
    'Execution: just before the wake\'s peak, compress, then extend explosively, keeping the handle close to your hip rather than pulling up.',
    'Whole-body integration: the pop comes from the legs; trying to lift off with the arms throws your balance at takeoff.',
    'Common mistake: leaning back and pulling the handle into your chest at takeoff, a common cause of off-balance landings.',
    'Coaching insight: start by just clearing the wake, and keep the landing spot beyond it in sight before committing.',
  ]},
  'Landing Mechanics': {icon:'safety', video:'wakeboarding soft landing technique knee safety', points:[
    'Setup: anticipate the landing before your feet reach the water; be in position already rather than reacting.',
    'Execution: land with knees bent and already absorbing, weight centered, never stiff-legged through a locked knee.',
    'Whole-body integration: 42.3% of surveyed wakeboarders had torn an ACL, mostly from hard landings; soft-knee landing is what depth jumps and Nordics train.',
    'Common mistake: locking the knees on landing, from fatigue, surprise or trying to stick it, sending full impact into the knee.',
    'Coaching insight: if a jump goes wrong in the air, prioritize bent knees and centered weight over finishing the trick; soft beats \'perfect\'.',
  ]},
  'Handle & Rope Control': {icon:'paddling', video:'wakeboarding handle position rope control technique', points:[
    'Setup: grip the handle with hands about shoulder-width, arms extended but not locked, at hip level, not chest height.',
    'Execution: let the rope\'s tension run through hips and legs, using the arms mainly to hold position, not to pull toward the boat.',
    'Whole-body integration: farmer\'s carries and battle ropes build the grip endurance a full pull needs; tired grips let go early.',
    'Common mistake: pulling the handle up toward the chest, especially when tired, which shifts your weight back and sets up a fall.',
    'Coaching insight: if balance goes, simply let go; a controlled release beats being dragged off balance.',
  ]},

  'Kite Safety & Gear': {icon:'safety', video:'kitesurfing safety gear beginners quick release', points:[
    'Setup: wear an impact vest and ideally a helmet, and check the quick-release and safety leash work before attaching the kite.',
    'Execution: check wind direction, strength and the launch area for obstacles and people first; many injuries happen launching or landing.',
    'Whole-body integration: avoid launching or landing alone; have a second person hold or release the kite, as kite schools teach.',
    'Common mistake: putting off the quick-release check; riders with working quick-release systems had fewer injuries.',
    'Coaching insight: judge your skill honestly before choosing wind or kite size; beginners are injured far more per hour, and overconfidence causes accidents.',
  ]},
  'Body-Dragging & Kite Control': {icon:'paddling', video:'kitesurfing body dragging kite control technique beginners', points:[
    'Setup: before the board, practice flying the kite while it drags you through the water, building feel with low consequences.',
    'Execution: steer with small, controlled bar movements for a steady, manageable pull, avoiding sudden moves that spike power.',
    'Whole-body integration: dragging both ways, with and without the board, builds the kite feel crossing depends on.',
    'Common mistake: overcorrecting the bar when the kite drifts, sending it further off course; small, patient corrections work.',
    'Coaching insight: practice self-launching and self-landing on land in light wind under supervision; self-rescue depends on them.',
  ]},
  'The Water Start': {icon:'popUp', video:'kitesurfing water start technique tutorial beginners', points:[
    'Setup: board on your feet, kite in a low-power position, wait for clean, steady wind rather than starting immediately.',
    'Execution: as you power the kite up, keep knees bent and weight back, letting its lift bring you up rather than muscling up.',
    'Whole-body integration: the knees-bent, weight-back position your core and landing work trains; weak cores get pulled flat instead.',
    'Common mistake: powering the kite too hard on the first attempt, generating more pull than you can control.',
    'Coaching insight: it takes many attempts; treat early water starts as a numbers game, not one moment to get right.',
  ]},
  'Crossing & Edge Control': {icon:'turn', video:'kitesurfing crossing edge control technique tutorial', points:[
    'Setup: settle into a leaned-back stance, knees bent, board edge dug in, bar at a comfortable distance rather than pulled in tight.',
    'Execution: crossing is a sustained, near-isometric hold that research shows loads the lower back, abs and thighs most.',
    'Whole-body integration: exactly the sustained core bracing the lumbar-stability day prepares; without it, the low back tires first.',
    'Common mistake: locking the knees while leaned back, losing the ability to absorb chop and loading the lower back.',
    'Coaching insight: switch between heelside and toeside periodically to share the isometric load across both sides.',
  ]},
  'Basic Jump & Landing': {icon:'wave', video:'kitesurfing basic jump landing technique tutorial', points:[
    'Setup: build speed and edge tension, then send the kite up through the window at takeoff, driving through the hips as it lifts you.',
    'Execution: keep knees bent in the air, extend to meet the water, then flex immediately to absorb, the load-absorb pattern landing training builds.',
    'Whole-body integration: poor landings from jumps and tricks are now the leading injury mechanism, and the ankle is the most-hurt joint.',
    'Common mistake: jumping with a kite or wind beyond your comfort because conditions look good; a jump is only as safe as your depower control.',
    'Coaching insight: start small and low and build height gradually; landings hurt people, and a small clean jump teaches more.',
  ]},
  'Self-Rescue & Kite Release': {icon:'safety', video:'kitesurfing self rescue quick release emergency technique', points:[
    'Setup: practice finding and operating your quick release without looking at it; in an emergency you may not see it.',
    'Execution: if you lose control, use the quick release rather than fighting the kite; failing to detach caused most serious historical accidents.',
    'Whole-body integration: after release, know self-rescue: bundle the depowered kite and lines and use it to work back to shore. Practice it first.',
    'Common mistake: assuming you\'ll never need self-rescue; offshore rescues involve hypothermia and exhaustion, not just trauma.',
    'Coaching insight: kite where others are around, ideally with a beach spotter, and never in offshore wind as a beginner.',
  ]},

  'SUP Safety & Gear': {icon:'safety', video:'stand up paddleboarding safety gear beginners leash', points:[
    'Setup: wear a fitted flotation device and the right leash: ankle or calf on flat water, quick-release waist leash in rivers or surf.',
    'Execution: check wind, current and weather, and plan a route you could paddle back against if conditions change.',
    'Whole-body integration: match board and paddle to your size, skill and conditions; pushing volume and intensity beyond your level raises injury risk.',
    'Common mistake: skipping the leash on calm water \'just once\'; a board blown away in wind or current leaves you without flotation.',
    'Coaching insight: tell someone your route and return time, and paddle with someone in open water, tidal or river conditions.',
  ]},
  'Stance & Balance Fundamentals': {icon:'popUp', video:'stand up paddleboarding stance balance technique beginners', points:[
    'Setup: start kneeling near the board\'s center, then stand one foot at a time into a parallel, shoulder-width stance, knees bent, over the stringer.',
    'Execution: keep your eyes on the horizon, not your feet; looking down is one of the commonest reasons beginners fall.',
    'Whole-body integration: soft knees absorb chop through the legs, not the lower back; core endurance keeps that stance from collapsing.',
    'Common mistake: standing upright with locked knees, sending every wobble up a stiff body and toppling easily.',
    'Coaching insight: practice standing and kneeling deliberately on flat water so a real wobble doesn\'t trigger panic.',
  ]},
  'The Forward Stroke': {icon:'paddling', video:'stand up paddleboarding forward stroke technique hip rotation', points:[
    'Setup: reach forward with the paddle, blade fully buried in the water near the nose of the board, torso rotated toward the reaching side rather than reaching with the arm alone.',
    'Execution: pull the board past the planted paddle blade — not the blade through the water — by rotating your torso and driving through the hips, exiting the stroke around your ankle rather than pulling it all the way back past your hip.',
    'Whole-body integration: real biomechanical research comparing experienced and inexperienced paddlers found beginners rely on significantly more shoulder motion and significantly less hip rotation to generate the same stroke — exactly the imbalance this program\'s paddling-pattern day and rotational-power training are built to correct, since the same joints (shoulder, elbow, hip) that show this technique difference are also the joints with the sport\'s highest injury rates.',
    'Common mistake: pulling the paddle back too far past the hip. Once the blade passes your ankle it stops adding forward power and starts lifting water instead, wasting energy and adding unnecessary load to the shoulder for no forward benefit.',
    'Coaching insight: switch paddling sides regularly rather than favoring one — alternating sides distributes the stroke\'s repetitive load across both sides of the body instead of overloading one shoulder specifically, directly relevant given how commonly the shoulder is injured in this sport.',
  ]},
  'The Sweep Stroke & Turning': {icon:'turn', video:'stand up paddleboarding sweep stroke turning technique', points:[
    'Setup: to turn the board, plant the paddle wide near the nose for a bow-side sweep, or near the tail for a stern-side sweep, rather than using the same straight forward stroke you\'d use to go in a straight line.',
    'Execution: sweep the blade in a wide arc away from the board while keeping your core engaged and your stance stable — the turning force comes from the arc of the blade path through the water, not from muscling the paddle with the arms.',
    'Whole-body integration: like the forward stroke, an efficient sweep stroke is driven by torso rotation, not just arm strength — the same rotational core training (Pallof Press, Russian Twist) that supports the forward stroke directly supports turning as well.',
    'Common mistake: leaning the body dramatically to try to force a turn instead of using the paddle\'s sweep. Large upper-body leans away from a stable base are a common way to lose balance entirely rather than actually turn the board faster.',
    'Coaching insight: practice sweep strokes on both sides in calm water until turning either direction feels equally natural — most paddlers develop a strong preference for one turning direction early on, a real limitation once you need to turn quickly around an obstacle or into an oncoming wave or wake.',
  ]},
  'Falling Safely & Board Recovery': {icon:'safety', video:'stand up paddleboarding falling safely board recovery technique', points:[
    'Setup: when a fall is unavoidable, fall away from the board, toward open water.',
    'Execution: fall flat to spread the impact, never diving headfirst, especially where depth is unknown.',
    'Whole-body integration: in the water, find your paddle first, then pull the board back by the leash instead of swimming after it.',
    'Common mistake: grabbing the board as you fall, which can pull it onto you or twist you awkwardly.',
    'Coaching insight: practice a full fall and remount in calm water so a routine fall never becomes a panic.',
  ]},
  'Reading Water & Conditions': {icon:'wave', video:'stand up paddleboarding reading water wind conditions safety', points:[
    'Setup: before heading out, check wind, current or tide, and boat traffic or other hazards.',
    'Execution: paddle into wind or current first while fresh and return with it behind you; fatigue late in a session erodes technique and judgment.',
    'Whole-body integration: aerobic conditioning extends how long your technique holds before fatigue, the pattern injury research describes.',
    'Common mistake: underestimating the paddle back; an easy outbound leg can become an exhausting return if conditions shift.',
    'Coaching insight: start with short sessions close to shore and build distance and open-water exposure gradually.',
  ]},

  'Kayak Safety & Gear': {icon:'safety', video:'kayaking safety gear beginners PFD spray skirt', points:[
    'Setup: always wear a fitted flotation device and dress for water, not air, temperature; in cold water a wetsuit or drysuit is safety.',
    'Execution: in moving water wear a paddlesports helmet and know the water\'s class; match your skill to the conditions.',
    'Whole-body integration: check boat flotation, spray-skirt quick release and paddle every session; gear failure turns a capsize into an emergency.',
    'Common mistake: tucking the spray skirt\'s grab loop where you can\'t find it under stress; that, not the capsize, is the danger.',
    'Coaching insight: never paddle moving water alone or beyond your skill, and tell someone your route; most serious incidents involve solo paddlers.',
  ]},
  'Entry, Exit & Basic Stance': {icon:'popUp', video:'kayaking entry exit basic stance footbrace technique', points:[
    'Setup: enter from a stable spot, sit upright against the seat back, and set the footbraces so knees are bent and feet press firmly.',
    'Execution: press knees and thighs lightly against the thigh braces, connecting at seat, feet and thighs so the boat responds to you.',
    'Whole-body integration: firm footbrace contact measurably adds to stroke force and speed, so a loose leg position wastes power.',
    'Common mistake: slouching with flat, disengaged legs, disconnecting your strongest muscles and leaving the arms to do it all.',
    'Coaching insight: practice entries and exits in calm, shallow water until routine, so a quick exit never causes panic.',
  ]},
  'The Forward Stroke': {icon:'paddling', video:'kayaking forward stroke technique torso rotation leg drive', points:[
    'Setup: reach forward and rotate your torso so the blade plants near your feet, not out to the side.',
    'Execution: push with the top arm and pull with the bottom, powered by unwinding your rotated torso and pushing off the footbrace.',
    'Whole-body integration: removing leg drive cut elite kayakers\' stroke force 21% and boat speed 16%, why the program has a leg-power day.',
    'Common mistake: paddling with the arms only, bending at the elbow; weaker, and a repetitive strain on the shoulder, a commonly injured joint.',
    'Coaching insight: exit at the hip; pulling further back lifts water instead of moving you forward.',
  ]},
  'The Sweep Stroke & Turning': {icon:'turn', video:'kayaking sweep stroke turning technique tutorial', points:[
    'Setup: to turn, plant the blade at the bow or stern and sweep it in a wide arc away from the boat.',
    'Execution: rotate your torso to follow the blade, keeping the arc wide; a wider sweep turns more for the same effort.',
    'Whole-body integration: drive the sweep with torso rotation and keep firm footbrace contact so the boat follows your body.',
    'Common mistake: leaning hard away from the turn to force it, a common way to capsize mid-turn.',
    'Coaching insight: once the sweep is solid, add a slight hip-driven edge for tighter, more efficient turns.',
  ]},
  'The Wet Exit & Capsize Recovery': {icon:'safety', video:'kayaking wet exit capsize recovery technique tutorial', points:[
    'Setup: if you capsize and can\'t roll, tuck forward, find the spray skirt\'s grab loop, and pull it forward and up to release.',
    'Execution: push out and away from the boat and swim clear before surfacing, so you don\'t strike the boat or paddle.',
    'Whole-body integration: many acute injuries happen hitting objects while swimming after a capsize, so stay calm and swim clear deliberately.',
    'Common mistake: panicking and clawing at the cockpit rim instead of finding the grab loop first.',
    'Coaching insight: practice wet exits in calm, shallow water or a pool with an instructor until automatic under stress.',
  ]},
  'The Eskimo Roll': {icon:'wave', video:'kayaking eskimo roll technique hip snap tutorial', points:[
    'Setup: the most advanced skill here: rolling a capsized kayak upright with a hip snap and paddle brace, without exiting.',
    'Execution: from set-up, sweep the blade out along the surface while snapping your hips to rotate the boat; don\'t pull down or lift your head.',
    'Whole-body integration: it relies on torso rotation and leg-to-boat connection; without them, paddle technique alone won\'t roll you.',
    'Common mistake: lifting the head first; it should come up last, and lifting early is the commonest reason rolls fail.',
    'Coaching insight: learn it with an instructor, ideally in a pool, after wet exits are automatic; don\'t rely on a shaky roll in real conditions.',
  ]},
};

const WATERSPORTS_TECHNIQUE_GROUPS = {
  'Surfing — Before You Paddle Out': {
    poses:['Ocean Safety & Rip Currents','Reading Waves & Lineup Positioning','Duck Dive'],
    note:'Start here, before technique — knowing the ocean and how to get past the whitewater safely matters more than any single move on the board, and it\'s exactly the part a phone can\'t simulate for you.',
  },
  'Surfing — Paddling & Catching the Wave': {
    poses:['Paddling Technique','Pop-Up'],
    note:'The two skills that happen before you\'re actually riding anything — and, per real time-motion data on competitive surfers, the ones you\'ll spend the most total time doing.',
  },
  'Surfing — Riding & Turning': {
    poses:['Trim & Stance','Bottom Turn','Cutback'],
    note:'What happens once you\'re up — from holding a stable line to the rotational turns that everything more advanced in surfing gets built from.',
  },
  'Skimboarding': {
    poses:['Beach & Water Safety','The Run & Drop','Foot Positioning & Stance','Ankle-Safe Turning & Carving','Falling Safely','Wave-Riding Basics'],
    note:'Real hospital injury data on this sport converges hard on two mechanisms — a planted, rotated foot and falling onto an outstretched hand — so this masterclass is built around avoiding both, not just teaching the fun parts.',
  },
  'Wakeboarding': {
    poses:['Wakeboarding Safety & Gear','Stance & Deep-Water Start','Edging & Wake Crossing','Basic Wake Jump (Ollie)','Landing Mechanics','Handle & Rope Control'],
    note:'A real survey found 42.3% of wakeboarders had torn an ACL, the highest reported rate in the sport\'s literature, traced specifically to hard landings — so Landing Mechanics is the section to genuinely internalize here, not skim past.',
  },
  'Kite-Assisted Surfing': {
    poses:['Kite Safety & Gear','Body-Dragging & Kite Control','The Water Start','Crossing & Edge Control','Basic Jump & Landing','Self-Rescue & Kite Release'],
    note:'Historically, most serious kitesurfing accidents were attributed to being unable to detach the kite from the harness — Kite Safety & Gear and Self-Rescue & Kite Release are not optional reading in this masterclass, they are the sport\'s single best-documented safety fix.',
  },
  'Stand-Up Paddleboarding': {
    poses:['SUP Safety & Gear','Stance & Balance Fundamentals','The Forward Stroke','The Sweep Stroke & Turning','Falling Safely & Board Recovery','Reading Water & Conditions'],
    note:'Real biomechanics research found beginners lean heavily on shoulder motion where experienced paddlers use hip rotation instead — and the shoulder is, by a wide margin, this sport\'s most commonly injured joint. The Forward Stroke section exists to close that exact gap.',
  },
  'Kayaking': {
    poses:['Kayak Safety & Gear','Entry, Exit & Basic Stance','The Forward Stroke','The Sweep Stroke & Turning','The Wet Exit & Capsize Recovery','The Eskimo Roll'],
    note:'This masterclass goes all the way to the Eskimo roll — real evidence found leg drive alone accounts for a fifth of a kayaker\'s paddle-stroke force, which is exactly why Entry, Exit & Basic Stance and The Forward Stroke both emphasize footbrace connection as much as the paddle itself.',
  },
};

const GRAPPLE_ICONS = {
  hipEscape: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="16" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="22" x2="8" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="22" x2="28" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="26" x2="26" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="34" x2="36" y2="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  bridgeRoll: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="30" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="27" x2="22" y2="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="32" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="12" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="22" y1="14" x2="30" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  technicalStandup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="30" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="27" x2="20" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="16" x2="30" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="16" x2="12" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="16" x2="28" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  framesRetention: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="32" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="32" y1="16" x2="36" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="12" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="16" x2="8" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="34" y2="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="22" y1="15" x2="10" y2="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  kneeSlicePass: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="8" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="13" x2="14" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="22" x2="26" y2="26" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="26" y1="26" x2="24" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="22" x2="10" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="4" y1="36" x2="36" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  torreandoPass: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="11" x2="18" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="18" x2="32" y2="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="18" x2="26" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="26" y1="28" x2="22" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  stackPass: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="24" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="11" x2="24" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="14" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="34" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="26" x2="10" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="34" y1="26" x2="30" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  combatBase: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="20" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="12" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="28" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="28" y1="24" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  mountControl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="20" x2="10" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="20" x2="34" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="24" x2="8" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="24" x2="36" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="30" x2="38" y2="30" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  sideControl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="22" y2="18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="18" x2="34" y2="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="18" x2="28" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="6" y1="26" x2="36" y2="26" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  backControl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="30" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="11" x2="30" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="22" x2="20" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="26" x2="14" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="18" x2="18" y2="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/> <line x1="8" y1="6" x2="8" y2="38" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  kneeOnBelly: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="11" x2="14" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="20" x2="26" y2="24" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="20" x2="8" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="4" y1="26" x2="36" y2="26" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  rearNakedChoke: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="28" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <circle cx="14" cy="14" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="17" x2="22" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="30" y2="14" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="18" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="28" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  armbarGuard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="8" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="13" x2="16" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="20" x2="30" y2="18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="16" y1="20" x2="22" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="20" x2="10" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  triangleChoke: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="28" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="28" y1="13" x2="26" y2="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <circle cx="10" cy="20" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="23" x2="18" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="26" x2="30" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="26" x2="30" y2="30" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  kimura: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="18" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="20" x2="30" y2="16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="30" y1="16" x2="34" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="18" y1="20" x2="14" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  doubleLegTakedown: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="8" cy="14" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="17" x2="20" y2="22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="32" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="20" y1="22" x2="26" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="12" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  closedGuardPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="10" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="22" x2="22" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="10" y1="22" x2="4" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="30" y2="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  sprawl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="16" cy="10" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="24" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="36" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="10" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="14" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
};

const GRAPPLE_TECHNIQUE_DETAILS = {
  'Hip Escape (Shrimping)': {icon:'hipEscape', video:'bjj hip escape shrimping technique tutorial', points:[
    'Setup: On your back, post on one hand and the opposite foot.',
    'Execution: Shoot the hips back and away, then bring the near knee back in.',
    'Common mistake: Pushing with the arms instead of the hips, or not recovering the knee.',
  ]},
  'Bridge & Roll (Upa Escape)': {icon:'bridgeRoll', video:'bjj upa bridge roll mount escape tutorial', points:[
    'Setup: From bottom mount, trap one arm and the same-side leg, foot planted near your hip.',
    'Execution: Bridge hard over the trapped shoulder and roll at the top.',
    'Common mistake: Bridging before trapping the arm and leg, so they just post out.',
  ]},
  'Technical Stand-up': {icon:'technicalStandup', video:'bjj technical stand up tutorial', points:[
    'Setup: Post one hand behind you, opposite foot under your hips, other leg in front.',
    'Execution: Stand up through the hand and foot without ever turning your back.',
    'Common mistake: Turning away and pushing up off the knees.',
  ]},
  'Frames & Guard Retention': {icon:'framesRetention', video:'bjj frames guard retention drill', points:[
    'Setup: Brace your forearms on their hips, biceps or legs as frames, not grips.',
    'Execution: Combine frames and hip escapes to keep your hips facing them.',
    'Common mistake: Waiting until the guard is passed; react to the first inch of pressure.',
  ]},
  'Knee Slice Pass': {icon:'kneeSlicePass', video:'bjj knee slice pass technique tutorial', points:[
    'Setup: Control their far hip or leg, knee lined up toward their center.',
    'Execution: Slide the knee through past their thigh, weight heavy through it.',
    'Common mistake: Passing light or upright, giving their frames room to reset.',
  ]},
  'Torreando (Bullfighter) Pass': {icon:'torreandoPass', video:'bjj torreando bullfighter pass technique tutorial', points:[
    'Setup: Grip both ankles or shins from in front of them.',
    'Execution: Push the legs one way, move your hips the other, and drop straight into side control.',
    'Common mistake: Pausing after redirecting the legs.',
  ]},
  'Stack Pass': {icon:'stackPass', video:'bjj stack pass technique tutorial', points:[
    'Setup: Gather their legs and drive your weight forward, folding their hips over.',
    'Execution: Keep shoulder pressure on while you circle around the legs to clear them.',
    'Common mistake: Easing off the pressure mid-pass so their hips settle.',
  ]},
  'Combat Base & Posture': {icon:'combatBase', video:'bjj combat base passing posture tutorial', points:[
    'Setup: One knee up, one down, hips low, weight centered.',
    'Execution: Have a partner push and pull you, and reset straight back into base.',
    'Common mistake: Squaring the hips flat to them, leaving nothing to post on.',
  ]},
  'Mount Control & Maintenance': {icon:'mountControl', video:'bjj mount control maintenance tutorial', points:[
    'Setup: Sit low and heavy on their torso, knees tight to their sides.',
    'Execution: Ride bridges by posting a hand or foot and resettling your weight.',
    'Common mistake: Posting the hands far forward, which feeds their bridge and roll.',
  ]},
  'Side Control Maintenance': {icon:'sideControl', video:'bjj side control maintenance tutorial', points:[
    'Setup: Chest to chest, weight through your chest, not your arms.',
    'Execution: Follow their hips with yours as they shrimp or bridge.',
    'Common mistake: Propping up on your hands, which lightens the pin.',
  ]},
  'Back Control & Hooks': {icon:'backControl', video:'bjj back control hooks technique tutorial', points:[
    'Setup: Both hooks inside their thighs, seatbelt grip over one shoulder and under the other arm.',
    'Execution: Stay glued, adjusting hooks and seatbelt together; re-secure the seatbelt first.',
    'Common mistake: Crossing your feet, which invites the classic ankle-lock counter.',
  ]},
  'Knee-on-Belly': {icon:'kneeOnBelly', video:'bjj knee on belly technique tutorial', points:[
    'Setup: From side control, knee on their stomach, other leg out wide for base.',
    'Execution: Sink weight through the knee and hop the free leg to follow them.',
    'Common mistake: Staying flat-footed and static.',
  ]},
  'Rear Naked Choke': {icon:'rearNakedChoke', video:'bjj rear naked choke drill technique', points:[
    'Setup: From back control, arm under the chin and a figure-four lock.',
    'Execution: Close the elbow and expand your chest, not cranking the neck.',
    'Common mistake: Squeezing before the arm is deep under the chin.',
  ]},
  'Armbar from Guard': {icon:'armbarGuard', video:'bjj armbar from guard drill technique', points:[
    'Setup: From closed guard, control a wrist and swivel a leg over their head.',
    'Execution: Thumb up, pull the wrist down and lift your hips.',
    'Common mistake: Letting the elbow drift off center during the swivel.',
  ]},
  'Triangle Choke': {icon:'triangleChoke', video:'bjj triangle choke drill technique', points:[
    'Setup: Pull one arm across as your leg comes over that shoulder.',
    'Execution: Lock behind your knee, angle off, pull the head down and lift the hips.',
    'Common mistake: Locking it square in front of them instead of at an angle.',
  ]},
  'Kimura': {icon:'kimura', video:'bjj kimura shoulder lock drill technique', points:[
    'Setup: Bend their elbow to about 90° and lock a figure-four on the wrist.',
    'Execution: Rotate the arm behind their back by lifting the wrist, using the lock as a lever.',
    'Common mistake: Cranking before the grip and angle are secure.',
  ]},
  'Double Leg Takedown': {icon:'doubleLegTakedown', video:'bjj double leg takedown technique tutorial', points:[
    'Setup: Drop your level by bending the knees, hips below theirs.',
    'Execution: Shoulder into their hips, wrap both legs, drive forward with your legs.',
    'Common mistake: Bending at the waist with your head down.',
  ]},
  'Closed Guard Pull': {icon:'closedGuardPull', video:'bjj guard pull technique tutorial', points:[
    'Setup: Get a sleeve or collar grip while standing.',
    'Execution: Sit back and close your legs around their hips in one motion.',
    'Common mistake: Sitting down without a grip or without the legs up.',
  ]},
  'Sprawl (Takedown Defense)': {icon:'sprawl', video:'bjj sprawl takedown defense technique tutorial', points:[
    'Setup: As they shoot, react at once; don\'t back away or stand tall.',
    'Execution: Kick the legs back and drop hips and chest onto their shoulders, head up.',
    'Common mistake: Sprawling with your head down and chest collapsed.',
  ]},
};

const GRAPPLE_TECHNIQUE_GROUPS = {
  'Fundamentals': {
    poses:['Hip Escape (Shrimping)','Bridge & Roll (Upa Escape)','Technical Stand-up','Frames & Guard Retention'],
    note:'Hip movement, frames and getting up safely come before submissions.',
  },
  'Guard Passing': {
    poses:['Knee Slice Pass','Torreando (Bullfighter) Pass','Stack Pass','Combat Base & Posture'],
    note:'The main families of passing pressure and movement.',
  },
  'Control Positions': {
    poses:['Mount Control & Maintenance','Side Control Maintenance','Back Control & Hooks','Knee-on-Belly'],
    note:'Holding a position is its own skill, trained apart from submissions.',
  },
  'Submissions': {
    poses:['Rear Naked Choke','Armbar from Guard','Triangle Choke','Kimura'],
    note:'Secure the position first; a rushed submission loses both.',
  },
  'Takedowns & Entries': {
    poses:['Double Leg Takedown','Closed Guard Pull','Sprawl (Takedown Defense)'],
    note:'Getting to the ground, or staying off it, on your terms.',
  },
};

const OLY_ICONS = {
  snatchSetup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="16" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="22" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="12" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  snatchSecondPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="14" x2="40" y2="14" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="20" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="14" x2="16" y2="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="20" y1="20" x2="14" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="26" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="36" x2="30" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  snatchTurnover: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="6" x2="36" y2="6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="12" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="22" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="12" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="32" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="16" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="28" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  overheadStability: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="6" x2="36" y2="6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="12" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="22" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="12" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="32" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="12" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="26" x2="10" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="32" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="32" y1="26" x2="34" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  cleanSetup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="16" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="20" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="20" y1="22" x2="12" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  cleanSecondPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="20" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="18" x2="30" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/> <line x1="20" y1="20" x2="14" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="26" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="36" x2="30" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  frontRack: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="10" y1="14" x2="34" y2="14" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="8" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="14" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="30" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="16" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="28" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  jerkSequence: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="4" x2="36" y2="4" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="10" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="22" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="12" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="32" y2="6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="12" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="26" x2="8" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="22" x2="30" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="28" x2="34" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  snatchPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="10" y1="20" x2="34" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/> <circle cx="18" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="11" x2="20" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="14" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="26" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="36" x2="30" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  cleanPull: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="12" y1="20" x2="32" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="20" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="14" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="20" x2="26" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="36" x2="32" y2="36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/> </svg>',
  snatchBalance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="8" x2="36" y2="8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="14" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="17" x2="22" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="18" x2="12" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="18" x2="32" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="10" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="28" x2="8" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="34" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="28" x2="36" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  powerSnatch: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="10" x2="36" y2="10" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="16" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="19" x2="22" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="20" x2="12" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="20" x2="32" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="28" x2="16" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="28" x2="28" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  powerClean: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="10" y1="16" x2="34" y2="16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="10" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="13" x2="22" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="14" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="30" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="16" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="28" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  pushPress: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="8" y1="6" x2="36" y2="6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="12" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="22" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="14" y2="9" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="30" y2="9" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="16" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="16" y1="30" x2="18" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="22" y1="24" x2="28" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> <line x1="28" y1="30" x2="26" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/> </svg>',
  jerkDipSquat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="10" y1="14" x2="34" y2="14" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="22" cy="8" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="14" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="14" x2="30" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="14" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="28" x2="14" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="30" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="28" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
};

const OLY_TECHNIQUE_DETAILS = {
  'Snatch: Setup & First Pull': {icon:'snatchSetup', video:'olympic weightlifting snatch first pull technique tutorial', points:[
    'Setup: Hips above knees, below shoulders, wide grip, lats braced, bar over the base of the foot.',
    'Execution: Pull slowly from floor to knee, back angle constant, bar brushing the shins.',
    'Common mistake: Yanking the bar off the floor so the hips rise and the bar drifts away.',
  ]},
  'Snatch: Second Pull (Extension)': {icon:'snatchSecondPull', video:'olympic weightlifting snatch second pull extension technique', points:[
    'Setup: Bar at the knee, back angle set, ready to accelerate.',
    'Execution: Drive hips, knees and ankles together (triple extension), finishing tall with the bar close.',
    'Common mistake: Extending the hips before the knees and ankles, looping the bar forward.',
  ]},
  'Snatch: Turnover & Receiving Position': {icon:'snatchTurnover', video:'olympic weightlifting snatch turnover receiving position', points:[
    'Setup: The moment you finish extending, pull yourself down under the bar.',
    'Execution: Turn the arms over into a locked overhead squat, bar over the neck and mid-foot.',
    'Common mistake: Pressing the bar out instead of dropping under it; it\'s timing, not strength.',
  ]},
  'Overhead Squat Stability': {icon:'overheadStability', video:'overhead squat stability olympic weightlifting technique', points:[
    'Setup: Bar locked overhead on a wide grip, shoulders pushing up, torso braced.',
    'Execution: Squat deep with the bar stacked over mid-foot, torso more upright than a back squat.',
    'Common mistake: The bar drifting forward as you tire, usually upper-back mobility, not leg strength.',
  ]},
  'Clean: Setup & First Pull': {icon:'cleanSetup', video:'olympic weightlifting clean first pull setup technique', points:[
    'Setup: Hip-width grip, hips above knees, shoulders just ahead of the bar, lats braced.',
    'Execution: Pull slowly off the floor, holding the back angle until the bar clears the knee.',
    'Common mistake: Hips rising faster than the shoulders, the same early-extension fault as the snatch.',
  ]},
  'Clean: Second Pull & Turnover': {icon:'cleanSecondPull', video:'olympic weightlifting clean second pull turnover technique', points:[
    'Setup: Bar at the knee, ready for the same triple extension as the snatch.',
    'Execution: Extend explosively, then drop under into the front rack instead of pulling higher.',
    'Common mistake: Reverse-curling the bar to the shoulders instead of whipping the elbows through.',
  ]},
  'Front Rack Receiving Position': {icon:'frontRack', video:'front rack position clean olympic weightlifting technique', points:[
    'Setup: Elbows high and forward, bar resting on the front delts and collarbones.',
    'Execution: Wrists relaxed, fingertips on the bar, shoulders carrying the weight.',
    'Common mistake: A full-fist grip with bent wrists, which keeps the elbows low and the rack loose.',
  ]},
  'The Jerk (Dip, Drive & Receive)': {icon:'jerkSequence', video:'olympic weightlifting jerk dip drive split technique', points:[
    'Setup: Stand tall in a settled front rack before the dip.',
    'Execution: Dip a few inches, torso upright, drive hard, and split or drop under on locked arms.',
    'Common mistake: Dipping too deep or leaning forward, sending the drive off vertical.',
  ]},
  'Snatch Pull': {icon:'snatchPull', video:'snatch pull technique tutorial olympic weightlifting', points:[
    'Setup: The competition snatch start: wide grip, hips set, bar close.',
    'Execution: Pull through full triple extension, finish tall, no turnover; lower under control.',
    'Common mistake: Rushing the first pull because there\'s no catch.',
  ]},
  'Clean Pull': {icon:'cleanPull', video:'clean pull technique tutorial olympic weightlifting', points:[
    'Setup: The competition clean start: hip-width grip, shoulders just ahead of the bar.',
    'Execution: Pull through full triple extension and finish tall, without racking the bar.',
    'Common mistake: Turning it into a slow deadlift; the explosive, tall finish is the point.',
  ]},
  'Snatch Balance': {icon:'snatchBalance', video:'snatch balance drill technique olympic weightlifting', points:[
    'Setup: Bar behind the neck on a snatch grip.',
    'Execution: Dip, drive the bar up, and drop hard into a full overhead squat on locked arms.',
    'Common mistake: Pressing with the arms instead of driving with the legs and dropping under.',
  ]},
  'Power Snatch': {icon:'powerSnatch', video:'power snatch technique tutorial olympic weightlifting', points:[
    'Setup: The full snatch grip and pull, aiming to catch high.',
    'Execution: Turn over and receive with the hips well above parallel.',
    'Common mistake: Quarter-squatting under a weight that needed a deeper catch.',
  ]},
  'Power Clean': {icon:'powerClean', video:'power clean technique tutorial olympic weightlifting', points:[
    'Setup: The full clean grip and pull, aiming to catch high in the rack.',
    'Execution: Turn over fast and receive with the hips above parallel.',
    'Common mistake: Dropping the elbows or catching on the fingers in a rushed catch.',
  ]},
  'Push Press': {icon:'pushPress', video:'push press technique tutorial olympic weightlifting', points:[
    'Setup: Bar in the front rack, feet hip-width, torso upright and braced.',
    'Execution: Short dip, drive through the legs, and ride it to lockout over the neck.',
    'Common mistake: The torso leaning back during the drive, which stresses the lower back.',
  ]},
  'Jerk Dip Squat': {icon:'jerkDipSquat', video:'jerk dip squat technique tutorial olympic weightlifting', points:[
    'Setup: Bar in the front rack, standing in your jerk posture.',
    'Execution: Dip a few inches, torso vertical, weight mid-foot, then stand without driving.',
    'Common mistake: Dipping too deep or leaning forward, the faults that ruin a jerk.',
  ]},
  'Front Squat (Clean Recovery Strength)': {icon:'frontRack', video:'front squat technique tutorial olympic weightlifting', points:[
    'Setup: Bar in your clean rack, feet shoulder-width, torso as upright as the rack allows.',
    'Execution: Squat deep, elbows high; your front squat should clearly out-lift your clean.',
    'Common mistake: The elbows dropping when heavy; if it barely beats your clean, recovery is your limit.',
  ]},
};

const OLY_TECHNIQUE_GROUPS = {
  'The Snatch': {
    poses:['Snatch: Setup & First Pull','Snatch: Second Pull (Extension)','Snatch: Turnover & Receiving Position','Overhead Squat Stability'],
    note:'Four phases; most missed snatches trace back to one of them.',
  },
  'The Clean & Jerk': {
    poses:['Clean: Setup & First Pull','Clean: Second Pull & Turnover','Front Rack Receiving Position','The Jerk (Dip, Drive & Receive)'],
    note:'A clean into a strong rack, then a leg-driven jerk.',
  },
  'Pulls & Positions': {
    poses:['Snatch Pull','Clean Pull','Snatch Balance','Front Squat (Clean Recovery Strength)'],
    note:'Pulling strength and receiving stability, trained apart from the full lifts.',
  },
  'Power Variations & Accessories': {
    poses:['Power Snatch','Power Clean','Push Press','Jerk Dip Squat'],
    note:'Higher catches and slower drills that show where a lift breaks down.',
  },
};

const STRENGTH_TECHNIQUE_GROUPS = {
  'The Squat': {
    poses:['Squat: Bracing & Setup','Squat: The Descent (Hip-Knee Sequencing)','Squat: Bottom Position & Depth','Squat: Drive Out of the Hole'],
    note:'Four phases; most squat faults trace back to one of them.',
  },
  'The Hinge': {
    poses:['Deadlift: Setup & Bar Position','Deadlift: The Pull (Floor to Lockout)','Romanian Deadlift (Eccentric Control)','Hip Hinge Pattern (General)'],
    note:'Load the hips and hamstrings while the spine stays neutral.',
  },
  'Pressing': {
    poses:['Bench Press: Setup & Arch','Bench Press: Bar Path & Elbow Position','Overhead Press: Bracing & Leg Drive','Scapular Control in Pressing'],
    note:'A stable base and controlled bar path keep shoulders healthy.',
  },
  'Pulling': {
    poses:['Barbell Row: Setup & Torso Angle','Lat Engagement (The Pulldown/Pull-up Feel)','Pull-up/Chin-up: Full Range of Motion','Grip & Forearm Considerations in Pulling'],
    note:'Balances your pressing and protects the shoulders long term.',
  },
};

const STRENGTH_TECHNIQUE_DETAILS = {
  'Squat: Bracing & Setup': {points:[
    'Setup: Bar high on the traps or low on the rear delts, feet shoulder-width, toes slightly out.',
    'Execution: Breathe deep into the belly, brace as if for a punch (the Valsalva), hold it all rep.',
    'Common mistake: A shallow chest breath, letting the torso fold forward as the weight gets heavy.',
  ]},
  'Squat: The Descent (Hip-Knee Sequencing)': {points:[
    'Setup: Brace set and feet planted before you move; lower with intent, don\'t drop.',
    'Execution: Bend hips and knees together, torso angle steady; some knee travel past the toes is fine.',
    'Common mistake: The knees caving in under load, a hip and glute issue linked to knee strain.',
  ]},
  'Squat: Bottom Position & Depth': {points:[
    'Setup: Stay as tight at the bottom as at the top.',
    'Execution: Hip crease below the top of the knee, lower back neutral.',
    'Common mistake: A big or lopsided butt wink under heavy load needs mobility work, not pushing through.',
  ]},
  'Squat: Drive Out of the Hole': {points:[
    'Setup: Fully braced at the bottom; reverse with control, no bounce.',
    'Execution: Push the floor away through the whole foot, hips and shoulders rising together.',
    'Common mistake: Hips shooting up first, turning it into a good morning that loads the lower back.',
  ]},
  'Deadlift: Setup & Bar Position': {points:[
    'Setup: Bar over mid-foot, shins close, hips between squat and stiff-leg height, brace set.',
    'Execution: Grip just outside the legs and pull the slack out until the bar clicks.',
    'Common mistake: Bar too far from the shins, turning the pull into a lower-back grind.',
  ]},
  'Deadlift: The Pull (Floor to Lockout)': {points:[
    'Setup: Slack out, brace set, torso angle fixed.',
    'Execution: Push the floor away, bar against shins and thighs; finish tall without leaning back.',
    'Common mistake: Hips rising faster than the chest, which loads the lower back.',
  ]},
  'Romanian Deadlift (Eccentric Control)': {points:[
    'Setup: Stand with the bar, knees soft and fixed for the whole rep.',
    'Execution: Push the hips back, bar sliding down the thighs, to a strong hamstring stretch.',
    'Common mistake: Bending the knees on the way down, or going lower than your hamstrings allow.',
  ]},
  'Hip Hinge Pattern (General)': {points:[
    'Setup: Hold a dowel along your spine, touching head, mid-back and tailbone.',
    'Execution: Push the hips back, knees still, spine neutral; the torso tips as a result.',
    'Common mistake: Squatting down instead of back, or rounding the lower back to reach further.',
  ]},
  'Bench Press: Setup & Arch': {points:[
    'Setup: Shoulder blades back, down and pinned, an upper-back arch, feet flat and driving.',
    'Execution: Grip just wider than shoulders, unrack over the shoulders, hold the blades all set.',
    'Common mistake: Shoulders rolling toward the ears, flattening the arch and exposing the joint.',
  ]},
  'Bench Press: Bar Path & Elbow Position': {points:[
    'Setup: Bar locked out over the shoulders, brace and arch set.',
    'Execution: Lower to the lower chest with elbows tucked about 45-75° from the torso.',
    'Common mistake: Flaring the elbows to 90°, which invites impingement at the front of the shoulder.',
  ]},
  'Overhead Press: Bracing & Leg Drive': {points:[
    'Setup: Bar on the front of the shoulders, grip just outside them, glutes and core braced.',
    'Execution: Press close to the face, head back then through, bar ending over the crown.',
    'Common mistake: Letting the lower back over-arch to clear the head; move the head instead.',
  ]},
  'Scapular Control in Pressing': {points:[
    'Setup: Pin the shoulder blades back before the first rep; reset between reps.',
    'Execution: Hold that position through the hardest last reps.',
    'Common mistake: Blades drifting forward as sets get hard; add rowing and rear-delt work to prevent impingement.',
  ]},
  'Barbell Row: Setup & Torso Angle': {points:[
    'Setup: Hinge to a near-parallel torso, knees soft, spine neutral, arms long.',
    'Execution: Drive the elbows back to the lower ribs, then lower to a full stretch.',
    'Common mistake: Standing taller each rep, letting momentum do the work.',
  ]},
  'Lat Engagement (The Pulldown/Pull-up Feel)': {points:[
    'Setup: Hands comfortable, shoulder blades pulled slightly down, not shrugged.',
    'Execution: Lead with the elbows, "elbows to back pockets," so the lats do the work.',
    'Common mistake: Shrugging first, which hands the pull to the traps and neck.',
  ]},
  'Pull-up/Chin-up: Full Range of Motion': {points:[
    'Setup: Dead hang, arms straight; palms away for back width, palms in for more biceps.',
    'Execution: Chin over the bar, elbows down and back, then lower to a full hang.',
    'Common mistake: Kipping, or stopping short of a full hang every rep.',
  ]},
  'Grip & Forearm Considerations in Pulling': {points:[
    'Setup: Pick your grip before heavy sets: double overhand, mixed or straps.',
    'Execution: Strap back accessories; keep competition lifts strapless to train grip.',
    'Common mistake: Ending a set when your hands gave out, not your back.',
  ]},
};

const RUNNING_TECHNIQUE_GROUPS = {
  'Posture & Upper Body': {
    poses:['Trunk Position & Forward Lean','Arm Swing & Shoulder Relaxation','Head & Gaze Position','Breathing Mechanics'],
    note:'Rarely limits speed, but a big source of wasted energy.',
  },
  'Cadence & Footstrike': {
    poses:['Cadence (Steps Per Minute)','Footstrike Pattern','Ground Contact & Overstriding','Vertical Oscillation'],
    note:'The evidence points somewhere different from the popular advice.',
  },
  'Hip & Leg Drive': {
    poses:['Hip Extension & Glute Drive','Knee Drive & Leg Recovery','Stride Length','Foot Placement Relative to Center of Mass'],
    note:'How the hips and legs actually push you forward.',
  },
  'Terrain & Pacing': {
    poses:['Uphill Running Technique','Downhill Running Technique','Trail & Uneven Terrain Adjustments','Effort-Based Pacing'],
    note:'Hills and trails each need their own adjustment.',
  },
};

const RUNNING_TECHNIQUE_DETAILS = {
  'Trunk Position & Forward Lean': {points:[
    'Setup: Stand tall with a slight forward lean from the ankles, not the waist.',
    'Execution: Keep a straight line from heel to crown, tilted so your weight falls just ahead.',
    'Common mistake: Bending at the hips, which cramps the diaphragm and loads the lower back.',
  ]},
  'Arm Swing & Shoulder Relaxation': {points:[
    'Setup: Elbows near 90°, hands loose, shoulders down away from the ears.',
    'Execution: Swing front to back from the shoulder, hands not crossing your midline.',
    'Common mistake: Arms crossing the body, or tension creeping into the jaw and neck.',
  ]},
  'Head & Gaze Position': {points:[
    'Setup: Chin level, eyes on the path 10-20 meters ahead.',
    'Execution: Head balanced over the spine; glance down only when the terrain needs it.',
    'Common mistake: Staring at your feet or watch, rounding the upper back.',
  ]},
  'Breathing Mechanics': {points:[
    'Setup: Relaxed jaw, belly expanding on the inhale, nose and mouth as needed.',
    'Execution: Tie breaths to steps, about 2-3 in and 2-3 out, and adjust with effort.',
    'Common mistake: Shallow chest breathing as effort rises, which also brings on side stitches.',
  ]},
  'Cadence (Steps Per Minute)': {points:[
    'Setup: Count one foot\'s strikes for 30 seconds at easy pace and multiply by 4.',
    'Execution: If you overstride or have impact pain, raise cadence 5-10% over several weeks.',
    'Common mistake: Forcing 180 steps per minute regardless of your baseline; that number came from elite racers.',
  ]},
  'Footstrike Pattern': {points:[
    'Setup: Start with your natural footstrike; it changes with pace anyway.',
    'Execution: Land closer under your hips and let the footstrike sort itself out.',
    'Common mistake: Switching to forefoot without a reason; calves and Achilles need about 8-12 weeks to adapt.',
  ]},
  'Ground Contact & Overstriding': {points:[
    'Setup: Check where your foot lands on side-view video, not by feel.',
    'Execution: Land close under your center of mass, knee slightly bent.',
    'Common mistake: Reaching forward to speed up; overstriding brakes every step and stresses the knee.',
  ]},
  'Vertical Oscillation': {points:[
    'Setup: This is your bounce per stride; measure it with a watch, not by feel.',
    'Execution: Aim forward, not up; better cadence and hip drive reduce bounce on their own.',
    'Common mistake: Chopping the stride to flatten the bounce instead of fixing cadence and hip extension.',
  ]},
  'Hip Extension & Glute Drive': {points:[
    'Setup: Stand tall, ready to drive from the hip and glute, not just the calf.',
    'Execution: Push the ground behind you, fully extending the hip before the leg swings through.',
    'Common mistake: Pushing mostly with the ankle, which tires faster; hinge and glute work fixes it.',
  ]},
  'Knee Drive & Leg Recovery': {points:[
    'Setup: After toe-off, the leg folds at the knee and swings forward.',
    'Execution: Let heel lift and knee drive grow with speed; fold the leg more when fast.',
    'Common mistake: Forcing high knees or a big heel kick at easy pace.',
  ]},
  'Stride Length': {points:[
    'Setup: Don\'t set a stride length; it\'s cadence times speed.',
    'Execution: Let it grow as you speed up and shrink as you slow.',
    'Common mistake: Lengthening the stride to go faster, a leading cause of overstriding.',
  ]},
  'Foot Placement Relative to Center of Mass': {points:[
    'Setup: The goal is your weight balanced over a foot landing roughly beneath you.',
    'Execution: On video, look for a near-vertical shin at contact.',
    'Common mistake: Working on cues without ever checking the result on video.',
  ]},
  'Uphill Running Technique': {points:[
    'Setup: Hold effort steady and let the pace drop.',
    'Execution: Shorter, quicker steps, a little more ankle lean, stronger arm drive.',
    'Common mistake: Holding flat-ground pace uphill, which brings back overstriding and a hip bend.',
  ]},
  'Downhill Running Technique': {points:[
    'Setup: Aim for controlled quickness, neither braking hard nor letting momentum run away.',
    'Execution: Trunk vertical to slightly forward, quick turnover, short ground contact.',
    'Common mistake: The instinct of leaning back, which adds braking, impact and quad soreness.',
  ]},
  'Trail & Uneven Terrain Adjustments': {points:[
    'Setup: Expect higher cadence and shorter strides on technical ground; that\'s correct.',
    'Execution: Scan a few steps ahead, take quick steps, let the arms move for balance.',
    'Common mistake: Keeping road stride and cadence on trails, risking a rolled ankle.',
  ]},
  'Effort-Based Pacing': {points:[
    'Setup: Decide before the run whether pace or effort leads.',
    'Execution: On hills, trails, heat or fatigue, run by effort or heart rate.',
    'Common mistake: Chasing a fixed pace through changing conditions and blowing up the run.',
  ]},
};

const HYROX_TECHNIQUE_GROUPS = {
  'Compromised Running': {
    poses:['Pacing Strategy Across Eight Runs','Running on Fatigued or Pumped Legs','Run-to-Station Transition Speed','Managing Effort Across the Whole Race'],
    note:'You never run fresh after the first kilometer; pace it as one race.',
  },
  'Sled Work': {
    poses:['Sled Push Technique & Body Position','Sled Push Pacing (Unbroken vs. Broken)','Sled Pull Technique & Positioning','Sled Pull Pacing & Rope Management'],
    note:'Technique and pacing matter as much as raw strength.',
  },
  'Carries & Lunges': {
    poses:['Farmer\'s Carry Technique & Grip','Sandbag Lunge Technique','Sandbag Lunge Pacing','Grip Fatigue Management Across the Race'],
    note:'Grip endurance quietly limits almost every station.',
  },
  'Wall Balls & Burpees': {
    poses:['Wall Ball Squat Depth & Accuracy','Wall Ball Pacing (Unbroken vs. Broken Sets)','Burpee Broad Jump Technique','Race-Day Pacing Strategy'],
    note:'Wall balls come last, at peak fatigue; earlier pacing protects them.',
  },
};

const HYROX_TECHNIQUE_DETAILS = {
  'Pacing Strategy Across Eight Runs': {points:[
    'Setup: Know a pace you can hold for all eight runs, not your fresh 1km pace.',
    'Execution: Run the early kilometers easier than feels necessary.',
    'Common mistake: Fast first runs, then a collapse in the back half; train pace right after stations.',
  ]},
  'Running on Fatigued or Pumped Legs': {points:[
    'Setup: Expect heavy legs after sleds, lunges and burpees; it\'s normal and trainable.',
    'Execution: Quick, light turnover instead of forcing your fresh stride.',
    'Common mistake: Treating the run after a station as recovery; a steady effort is faster overall.',
  ]},
  'Run-to-Station Transition Speed': {points:[
    'Setup: Know each station\'s setup before you reach it.',
    'Execution: Walk briskly in, get hands on the kit, and start.',
    'Common mistake: Long rests in transitions; across eight stations they add up.',
  ]},
  'Managing Effort Across the Whole Race': {points:[
    'Setup: Know your strong and weak stations before race day.',
    'Execution: Hold back a little on easy stations to save energy for hard ones.',
    'Common mistake: Racing every run and station as its own event.',
  ]},
  'Sled Push Technique & Body Position': {points:[
    'Setup: Hands on the handles that give the strongest push (open totals: 152kg men, 102kg women).',
    'Execution: Body low and forward, short powerful steps through the whole foot; the legs drive it.',
    'Common mistake: Standing too upright, shifting the work to the arms and stalling the sled.',
  ]},
  'Sled Push Pacing (Unbroken vs. Broken)': {points:[
    'Setup: Plan the 50m before you start: continuous, or a couple of short pauses.',
    'Execution: Keep any pause to a few seconds; restarting a stopped sled takes far more force.',
    'Common mistake: Stopping fully several times without a plan.',
  ]},
  'Sled Pull Technique & Positioning': {points:[
    'Setup: Start at the front of the marked area, rope in hand.',
    'Execution: Lean back and step backward, using bodyweight like a tug-of-war.',
    'Common mistake: Standing upright and pulling hand over hand with the arms.',
  ]},
  'Sled Pull Pacing & Rope Management': {points:[
    'Setup: Know the square\'s boundary; stepping outside earns a time penalty.',
    'Execution: Manage the rope slack and keep a steady rhythm.',
    'Common mistake: Rushing and stepping out of the area; practice inside a taped square.',
  ]},
  'Farmer\'s Carry Technique & Grip': {points:[
    'Setup: A weight in each hand, grip set before the 200m starts.',
    'Execution: Walk tall, shoulders back, core braced, weights close and still.',
    'Common mistake: Rushing with rounded shoulders, which costs energy and time.',
  ]},
  'Sandbag Lunge Technique': {points:[
    'Setup: Bag across the upper back, core braced for the full 100m.',
    'Execution: Even lunges, front knee over the foot, torso upright.',
    'Common mistake: Depth fading with fatigue; the bag can\'t be dropped mid-effort, so pace it.',
  ]},
  'Sandbag Lunge Pacing': {points:[
    'Setup: Decide before starting: continuous, or a few short pauses.',
    'Execution: If you pause, keep the bag on your back.',
    'Common mistake: Setting the bag down; re-shouldering it costs more than the rest.',
  ]},
  'Grip Fatigue Management Across the Race': {points:[
    'Setup: Carries, sled pull, wall balls, SkiErg and rowing all tax grip.',
    'Execution: Train grip on its own (timed carries, dead hangs); use straps in training where useful.',
    'Common mistake: Blaming general fatigue when grip was the real limit.',
  ]},
  'Wall Ball Squat Depth & Accuracy': {points:[
    'Setup: Ball at the chest, facing a target 10 feet high for men, 9 feet for women.',
    'Execution: Hip crease below the knee, then drive up and hit the target\'s center.',
    'Common mistake: Squats getting shallow late in the race, earning no-reps.',
  ]},
  'Wall Ball Pacing (Unbroken vs. Broken Sets)': {points:[
    'Setup: Plan a rep-and-rest pattern for the 100 reps before starting.',
    'Execution: Planned sets with short rests beat an all-out unbroken attempt.',
    'Common mistake: Going unbroken without a plan and hitting a wall.',
  ]},
  'Burpee Broad Jump Technique': {points:[
    'Setup: Chest to the ground on each burpee, then a broad jump, for the distance.',
    'Execution: Use the momentum of standing up to launch straight into the jump.',
    'Common mistake: Fully resetting between burpee and jump, or starting too fast.',
  ]},
  'Race-Day Pacing Strategy': {points:[
    'Setup: Know the order: SkiErg, sled push, sled pull, burpees, row, carry, lunges, wall balls.',
    'Execution: Follow your plan, adjusting only a little to how you feel.',
    'Common mistake: Changing strategy because one early station felt bad; rehearse full race simulations.',
  ]},
};

const PILATES_TECHNIQUE_GROUPS = {
  'Breath & Core': {
    poses:['Pilates Breathing (Lateral/Ribcage)','Neutral Spine & Pelvis','Powerhouse Engagement (Core Activation)','Scapular Stabilization'],
    note:'The four basics under every exercise in the method.',
  },
  'The Opening Sequence': {
    poses:['The Hundred','Roll-Up','Single Leg Circles','Rolling Like a Ball'],
    note:'Each exercise builds on the control of the one before.',
  },
  'Spinal Articulation': {
    poses:['Spine Stretch Forward','Saw','Swan','Spine Twist'],
    note:'Moving the spine one segment at a time, not as a block.',
  },
  'Integration & Balance': {
    poses:['Teaser','Criss-Cross','Side-Lying Leg Series','Standing & Balance Control'],
    note:'Harder because they combine several earlier skills at once.',
  },
};

const PILATES_TECHNIQUE_DETAILS = {
  'Pilates Breathing (Lateral/Ribcage)': {points:[
    'Setup: Hands on the sides of your ribs to feel the breath.',
    'Execution: Inhale wide into the ribs, exhale fully, drawing the deep abdominals in and up.',
    'Common mistake: Shallow chest breaths, or belly breathing that lets the core go.',
  ]},
  'Neutral Spine & Pelvis': {points:[
    'Setup: On your back, knees bent, keeping the lower back\'s gentle natural curve.',
    'Execution: Find a level pelvis and hold exactly that while your arms and legs move.',
    'Common mistake: Tucking the pelvis to flatten the back and calling it core work.',
  ]},
  'Powerhouse Engagement (Core Activation)': {points:[
    'Setup: Draw the navel gently toward the spine while still breathing into the ribs.',
    'Execution: Hold that engagement through every rep and return, never letting it go between.',
    'Common mistake: Bracing hard, then releasing between reps.',
  ]},
  'Scapular Stabilization': {points:[
    'Setup: Shoulder blades gently down and back, away from the ears.',
    'Execution: Keep them there as the exercise gets harder.',
    'Common mistake: Shoulders creeping up in hard moments like the Hundred or Teaser.',
  ]},
  'The Hundred': {points:[
    'Setup: On your back, legs in tabletop or extended low, head and shoulders lifted.',
    'Execution: Pump the arms, breathing in for five and out for five, to 100.',
    'Common mistake: The lower back arching up; raise the legs or bend the knees instead of pushing on.',
  ]},
  'Roll-Up': {points:[
    'Setup: Lie flat, legs long, arms reaching overhead.',
    'Execution: Exhale and peel up one vertebra at a time, reach forward, then roll back down.',
    'Common mistake: Swinging up with momentum; bend the knees or use a strap instead.',
  ]},
  'Single Leg Circles': {points:[
    'Setup: On your back, one leg to the ceiling, hips level and still.',
    'Execution: Circle the leg only as big as you can without the hips rocking; reverse.',
    'Common mistake: Circles too big, which rocks the pelvis.',
  ]},
  'Rolling Like a Ball': {points:[
    'Setup: Knees to chest, balanced just behind the sit bones in a rounded C-curve.',
    'Execution: Roll back onto the upper back, never the neck, then roll up to balance.',
    'Common mistake: Rolling onto the neck, or swinging the head and arms to come up.',
  ]},
  'Spine Stretch Forward': {points:[
    'Setup: Sit tall, legs a little wider than hips, feet flexed, arms forward.',
    'Execution: Exhale and round forward one segment at a time, then restack to tall.',
    'Common mistake: Hinging from the hips with a flat back.',
  ]},
  'Saw': {points:[
    'Setup: Sit tall, legs wide, arms out at shoulder height.',
    'Execution: Twist toward one leg and reach the opposite hand to its little toe, hips square.',
    'Common mistake: Letting the hips turn with the torso.',
  ]},
  'Swan': {points:[
    'Setup: Face down, hands under the shoulders, legs long and together.',
    'Execution: Lengthen the spine and lift chest and head with the back muscles.',
    'Common mistake: Pushing up with the arms like a push-up; keep the lift modest.',
  ]},
  'Spine Twist': {points:[
    'Setup: Sit tall, legs long or crossed, arms out at shoulder height.',
    'Execution: Rotate in small pulses at end range, hips square, then switch sides.',
    'Common mistake: Turning only the shoulders and arms while the spine barely moves.',
  ]},
  'Teaser': {points:[
    'Setup: On your back, ready to lift upper body and legs together.',
    'Execution: Roll up into a balanced V, reaching for the toes, then lower with control.',
    'Common mistake: Trying the full version before the Roll-Up is solid; bent knees are fine.',
  ]},
  'Criss-Cross': {points:[
    'Setup: On your back, hands lightly behind the head, knees in tabletop.',
    'Execution: Turn one elbow toward the opposite knee as the other leg extends; alternate.',
    'Common mistake: Pulling the neck; hands support the head, nothing more.',
  ]},
  'Side-Lying Leg Series': {points:[
    'Setup: On your side in one straight line, bottom arm supporting the head.',
    'Execution: Lift and lower the top leg with hips stacked and still.',
    'Common mistake: The leg drifting forward for more height, which takes the work off the glutes.',
  ]},
  'Standing & Balance Control': {points:[
    'Setup: Stand tall in neutral, core gently on.',
    'Execution: Add single-leg stances and slow limb movements, using the mat\'s principles.',
    'Common mistake: Dropping the mat principles once you stand up.',
  ]},
};

const YOGA_TECHNIQUE_GROUPS = {
  'Standing Poses': {
    poses:['Mountain Pose (Tadasana) Alignment','Warrior II Alignment','Triangle Pose Alignment','Tree Pose Balance'],
    note:'Most standing poses build on these four.',
  },
  'Breath & Core': {
    poses:['Ujjayi Breath (Ocean Breath)','Bandhas (Core Locks) Basics','Plank & Chaturanga Transition','Boat Pose Core Engagement'],
    note:'The breath and core work under the whole practice.',
  },
  'Folds & Backbends': {
    poses:['Seated Forward Fold Technique','Downward Dog Alignment','Bridge Pose Technique','Cobra vs. Upward Dog Distinction'],
    note:'Balance flexion with extension so the spine trains evenly.',
  },
  'Twists, Balance & Inversions': {
    poses:['Seated Spinal Twist Technique','Half Moon Pose Balance','Shoulder Stand Prep & Safety','Savasana (Final Relaxation) Technique'],
    note:'The advanced end of the practice, plus the final rest.',
  },
};

const YOGA_TECHNIQUE_DETAILS = {
  'Mountain Pose (Tadasana) Alignment': {points:[
    'Setup: Feet together or hip-width, weight even across both feet.',
    'Execution: Stack ankles, knees, hips and shoulders; legs engaged, knees soft, crown reaching up.',
    'Common mistake: Locked knees and flared ribs, which tip the pelvis in every pose after.',
  ]},
  'Warrior II Alignment': {points:[
    'Setup: Feet wide, front foot forward, back foot near parallel to the mat\'s back edge.',
    'Execution: Front knee over the ankle, back leg straight, arms level, gaze past the front hand.',
    'Common mistake: The front knee caving inward past the big toe.',
  ]},
  'Triangle Pose Alignment': {points:[
    'Setup: Feet wide, front foot forward, back foot turned slightly in, legs straight.',
    'Execution: Hinge at the front hip, hand to shin or a block, top arm up, chest open.',
    'Common mistake: Reaching for the floor and rounding the lower back; use a block.',
  ]},
  'Tree Pose Balance': {points:[
    'Setup: From Mountain, shift your weight fully onto one leg first.',
    'Execution: Sole on the inner calf or thigh, never on the knee; gaze on one still point.',
    'Common mistake: Pressing the foot into the side of the knee.',
  ]},
  'Ujjayi Breath (Ocean Breath)': {points:[
    'Setup: Mouth closed, breathing through the nose.',
    'Execution: Gently narrow the throat, like fogging a mirror with your mouth shut, for a soft sound.',
    'Common mistake: Squeezing so hard the breath strains; keep it soft enough to last the practice.',
  ]},
  'Bandhas (Core Locks) Basics': {points:[
    'Setup: Settle into an easy Ujjayi breath first.',
    'Execution: Gently lift the pelvic floor; on the exhale, draw the lower belly in and up.',
    'Common mistake: Clenching so hard that breathing gets difficult.',
  ]},
  'Plank & Chaturanga Transition': {points:[
    'Setup: Plank with shoulders over wrists, one straight line from head to heels.',
    'Execution: Lower with elbows tracking back by the ribs, stopping at or above 90°.',
    'Common mistake: Sagging hips or shoulders dipping below the elbows, a common source of shoulder irritation.',
  ]},
  'Boat Pose Core Engagement': {points:[
    'Setup: Sit with knees bent, feet flat, hands behind the thighs.',
    'Execution: Lean back with a long spine, lift the feet, straighten the legs only as control allows.',
    'Common mistake: Rounding the lower back to get straighter legs.',
  ]},
  'Seated Forward Fold Technique': {points:[
    'Setup: Sit tall, legs long, feet flexed; loop a strap around the feet if needed.',
    'Execution: Hinge from the hips, chest leading, only until the lower back starts to round.',
    'Common mistake: Rounding the whole spine to get the head down; bend the knees instead.',
  ]},
  'Downward Dog Alignment': {points:[
    'Setup: Hands shoulder-width, feet hip-width, from hands and knees.',
    'Execution: Press the hips up and back, bending the knees to keep the spine long.',
    'Common mistake: Forcing straight legs, which rounds the lower back.',
  ]},
  'Bridge Pose Technique': {points:[
    'Setup: On your back, knees bent, feet flat and hip-width.',
    'Execution: Press through the feet and lift with the glutes, knees tracking forward.',
    'Common mistake: Lifting with the lower back, which pinches instead of opening the hips.',
  ]},
  'Cobra vs. Upward Dog Distinction': {points:[
    'Setup: Face down, hands under or just ahead of the shoulders.',
    'Execution: Cobra keeps the thighs down and lifts with the back; Upward Dog lifts them on straight arms.',
    'Common mistake: Treating Upward Dog as a higher Cobra pushed up by the arms.',
  ]},
  'Seated Spinal Twist Technique': {points:[
    'Setup: Sit tall before any twist.',
    'Execution: Inhale to lengthen, exhale to turn from the base of the spine, head last.',
    'Common mistake: Yanking with the arm before the spine has lengthened.',
  ]},
  'Half Moon Pose Balance': {points:[
    'Setup: From Triangle, shift fully onto the front leg; a block under the hand is standard.',
    'Execution: Lift the back leg to hip height, hips stacked, chest and top arm open.',
    'Common mistake: Skipping the block and losing alignment to reach the floor.',
  ]},
  'Shoulder Stand Prep & Safety': {points:[
    'Setup: Build strength first with Bridge and leg lifts; Legs-Up-The-Wall is a safe alternative.',
    'Execution: Support the lower back, weight on shoulders and arms, not the neck.',
    'Common mistake: Inverting too early; once up, never turn your head.',
  ]},
  'Savasana (Final Relaxation) Technique': {points:[
    'Setup: Lie flat, legs relaxed, arms at your sides, palms up, eyes closed.',
    'Execution: Release tension from the feet up and stay still for several minutes.',
    'Common mistake: Skipping it when short on time; it\'s part of the practice.',
  ]},
};

const CALISTHENICS_TECHNIQUE_GROUPS = {
  'Pushing': {
    poses:['Push-up Progression Fundamentals','Dip Technique & Progression','Pike Push-up to Handstand Push-up Path','Planche Lean Progression'],
    note:'Strength built through leverage and position, not added weight.',
  },
  'Pulling': {
    poses:['Pull-up/Chin-up Progression Fundamentals','Row Progression (Ring/Bar Rows)','Front Lever Progression Path','Muscle-Up Technique & Prerequisites'],
    note:'No machine to lean on, so the progressions matter most here.',
  },
  'Core & Static Holds': {
    poses:['L-Sit Progression','Hollow Body Position','Handstand Balance Fundamentals','Human Flag Progression'],
    note:'Most skills fail from a weak hold position, not weak muscles.',
  },
  'Legs & Movement': {
    poses:['Pistol Squat Progression','Broad Jump & Landing Technique','Animal Flow Transitions','Skin-the-Cat & Shoulder Prep'],
    note:'Lower-body and whole-body skills beyond pushing and pulling.',
  },
};

const CALISTHENICS_TECHNIQUE_DETAILS = {
  'Push-up Progression Fundamentals': {points:[
    'Setup: Hands just wider than shoulders, body straight, core and glutes braced.',
    'Execution: Lower until the chest nearly touches, elbows about 45°, then press up in one line.',
    'Common mistake: Hips sagging or piking; make it easier with a higher hand position instead.',
  ]},
  'Dip Technique & Progression': {points:[
    'Setup: Arms locked on bars or rings, shoulders down away from the ears.',
    'Execution: Lower until shoulders reach elbow height, then press to lockout.',
    'Common mistake: Sinking far deeper for range, a common route to impingement.',
  ]},
  'Pike Push-up to Handstand Push-up Path': {points:[
    'Setup: Pike with hips high in an inverted V.',
    'Execution: Lower the head between the hands and press up; raise the feet on a box over time.',
    'Common mistake: Raising the feet too soon, so the head crashes down; that\'s how neck strain starts.',
  ]},
  'Planche Lean Progression': {points:[
    'Setup: Plank with hands under or just ahead of the shoulders.',
    'Execution: Lean the shoulders past the hands, body straight, holding each depth for weeks.',
    'Common mistake: Leaning far forward too soon, a common cause of wrist strain.',
  ]},
  'Pull-up/Chin-up Progression Fundamentals': {points:[
    'Setup: Dead hang, arms straight, shoulder blades slightly engaged.',
    'Execution: Drive the elbows down until the chin clears the bar, then lower to a full hang.',
    'Common mistake: Kipping when you want strength; use bands or slow negatives to build up.',
  ]},
  'Row Progression (Ring/Bar Rows)': {points:[
    'Setup: Hang under a bar or rings, heels down, body straight.',
    'Execution: Pull the chest to the bar, elbows back; a flatter body is harder.',
    'Common mistake: Hips sagging as you tire.',
  ]},
  'Front Lever Progression Path': {points:[
    'Setup: Hang from a bar and work through tuck, then straddle positions.',
    'Execution: Hold the body rigid with shoulders pulled down; add straight-arm pulldowns to your training.',
    'Common mistake: Straightening the legs before the tuck is solid.',
  ]},
  'Muscle-Up Technique & Prerequisites': {points:[
    'Setup: Build to about 10 strict pull-ups and 10 strict dips first.',
    'Execution: Pull explosively to the chest, roll the elbows over in one motion, press out.',
    'Common mistake: One elbow clearing first (the chicken wing), which loads one shoulder.',
  ]},
  'L-Sit Progression': {points:[
    'Setup: Straight arms on bars or blocks, knees bent toward the chest.',
    'Execution: Press down to lift the hips, legs at hip height, shoulders down, spine tall.',
    'Common mistake: Shrugging to hold it; bent-knee versions are fine.',
  ]},
  'Hollow Body Position': {points:[
    'Setup: On your back, lower back pressed down, arms overhead, legs long.',
    'Execution: Lift shoulders and legs a few inches into a slight banana curve.',
    'Common mistake: The lower back arching off the floor to hold higher.',
  ]},
  'Handstand Balance Fundamentals': {points:[
    'Setup: Hands shoulder-width, fingers spread, chest facing the wall.',
    'Execution: Shoulders over wrists in a hollow line; balance with small finger adjustments.',
    'Common mistake: Big corrections like kicking a leg down.',
  ]},
  'Human Flag Progression': {points:[
    'Setup: Grip a pole, one hand high, one low.',
    'Execution: Pull with the top hand, push with the bottom, starting from a tuck.',
    'Common mistake: Trying the straight flag too early; watch for left-right differences.',
  ]},
  'Pistol Squat Progression': {points:[
    'Setup: Stand on one leg, the other forward, arms out for balance.',
    'Execution: Lower under control as deep as you can, free leg off the floor, then drive up.',
    'Common mistake: The standing knee caving in; a light weight held in front helps balance.',
  ]},
  'Broad Jump & Landing Technique': {points:[
    'Setup: Stand tall, feet hip-width.',
    'Execution: Swing the arms and drive through the legs; land quietly on bent knees.',
    'Common mistake: Landing stiff-legged to chase distance; train landings first.',
  ]},
  'Animal Flow Transitions': {points:[
    'Setup: Bear crawl, knees hovering, core engaged.',
    'Execution: Flow between positions like bear and crab, smooth rather than fast.',
    'Common mistake: Rushing the transitions.',
  ]},
  'Skin-the-Cat & Shoulder Prep': {points:[
    'Setup: Hang from a bar or rings with straight arms.',
    'Execution: Tuck and rotate slowly back through an inverted hang, then reverse.',
    'Common mistake: Swinging to force the rotation.',
  ]},
};

const CYCLING_TECHNIQUE_GROUPS = {
  'Bike Fit': {
    poses:['Saddle Height & Position','Handlebar Reach & Drop','Cleat Positioning (Clipless Pedals)','Core & Upper Body Stability on the Bike'],
    note:'A good fit makes every other technique easier.',
  },
  'Pedaling': {
    poses:['Pedal Stroke Efficiency (Circular vs. Mashing)','Cadence Selection','Standing Climb Technique','Seated Climb Technique'],
    note:'How power gets from the legs to the road.',
  },
  'Handling': {
    poses:['Cornering Technique & Line Choice','Braking Technique','Descending Technique & Body Position','Group Riding & Drafting Position'],
    note:'The skills that matter most when speed is highest.',
  },
  'Pacing & Endurance': {
    poses:['Power/Effort-Based Pacing (Zones)','Interval Pacing Strategy','On-Bike Nutrition & Hydration Timing','Aerodynamic Position on Flats'],
    note:'Riding the right effort at the right time.',
  },
};

const CYCLING_TECHNIQUE_DETAILS = {
  'Saddle Height & Position': {points:[
    'Setup: Start from inseam × 0.883 (bottom bracket to saddle top), or heel on pedal, leg straight.',
    'Execution: Ball of the foot on the pedal at the bottom, knee bent about 25-35°.',
    'Common mistake: Never rechecking the height after changing shoes, cleats or flexibility.',
  ]},
  'Handlebar Reach & Drop': {points:[
    'Setup: Hands on the hoods with elbows softly bent.',
    'Execution: Set stem length and bar height for a back position you can hold all ride.',
    'Common mistake: Going low and aero before you have the flexibility to hold it, which numbs the hands.',
  ]},
  'Cleat Positioning (Clipless Pedals)': {points:[
    'Setup: Find the ball of the foot, the widest point at the base of the big toe.',
    'Execution: Ball of the foot over the pedal axle, cleat turned to your natural foot angle.',
    'Common mistake: Forcing a straight, symmetrical angle, a known cause of knee pain.',
  ]},
  'Core & Upper Body Stability on the Bike': {points:[
    'Setup: Keep the core gently braced the whole ride.',
    'Execution: Keep hips and shoulders still while the legs work, especially when climbing.',
    'Common mistake: Rocking to make power; off-bike core work fixes it.',
  ]},
  'Pedal Stroke Efficiency (Circular vs. Mashing)': {points:[
    'Setup: Think of the stroke as a full circle.',
    'Execution: Push over the top, drive through the bottom, and let the rising leg go light.',
    'Common mistake: Mashing only on the downstroke, which tires the quads.',
  ]},
  'Cadence Selection': {points:[
    'Setup: Treat cadence as something to train, not a fixed number.',
    'Execution: Favour about 80-100 rpm on the road over grinding a big gear.',
    'Common mistake: Never training cadence; drills above your natural rate build efficiency.',
  ]},
  'Standing Climb Technique': {points:[
    'Setup: Stand with hands on the hoods or drops.',
    'Execution: Let the bike rock gently while your body stays centered over the pedals.',
    'Common mistake: Standing too often on long climbs; alternate with seated spells.',
  ]},
  'Seated Climb Technique': {points:[
    'Setup: Sit back on the saddle, not perched on the nose.',
    'Execution: Keep a smooth, steady stroke and power, upper body still.',
    'Common mistake: Sliding forward for power, which changes your saddle height.',
  ]},
  'Cornering Technique & Line Choice': {points:[
    'Setup: In the drops, using the road\'s width: wide in, clip the apex, wide out.',
    'Execution: Weight the outside pedal down, inside pedal up, and press gently on the inside bar.',
    'Common mistake: Sticking the inside knee out like a motorcyclist; practice in an empty car park.',
  ]},
  'Braking Technique': {points:[
    'Setup: Use both brakes, mostly the front.',
    'Execution: Slow down early: brake before, not during, the corner.',
    'Common mistake: Grabbing the front brake hard mid-corner or on loose ground.',
  ]},
  'Descending Technique & Body Position': {points:[
    'Setup: Hands in the drops, weight slightly back and low, pedals level on bends.',
    'Execution: Look through the turn to where you\'re going.',
    'Common mistake: Tensing up and gripping hard; loose arms handle better.',
  ]},
  'Group Riding & Drafting Position': {points:[
    'Setup: Sit a steady, safe distance behind the wheel ahead.',
    'Execution: Hold your line and effort, call out hazards, and rotate through smoothly.',
    'Common mistake: Sudden braking, swerving or surging; be predictable.',
  ]},
  'Power/Effort-Based Pacing (Zones)': {points:[
    'Setup: Know your easy, tempo and threshold zones by power, heart rate or feel.',
    'Execution: Ride the zone the session is for: mostly easy, some truly hard.',
    'Common mistake: Riding everything medium-hard, the gray zone that undertrains both ends.',
  ]},
  'Interval Pacing Strategy': {points:[
    'Setup: Know each interval\'s target, length and rest before you start.',
    'Execution: Hold the same effort across all of them, lowering the target slightly if needed.',
    'Common mistake: Going too hard on the first interval, then fading.',
  ]},
  'On-Bike Nutrition & Hydration Timing': {points:[
    'Setup: Under an hour, water is usually enough; plan fuel for anything longer.',
    'Execution: Eat and drink early and regularly, before you feel hungry or thirsty.',
    'Common mistake: Under-fuelling on long rides; practice your fuelling in training.',
  ]},
  'Aerodynamic Position on Flats': {points:[
    'Setup: On fast flat roads, air drag is the main resistance.',
    'Execution: Go lower and narrower only as far as breathing and pedal stroke allow.',
    'Common mistake: An aero position you can\'t hold, abandoned when it would matter most.',
  ]},
};

const COMBAT_ICONS = {
  jabPunch: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="12" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="24" x2="8" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="24" x2="18" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="18" x2="36" y2="18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="36" cy="18" r="2.4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="18" x2="18" y2="8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  crossPunch: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="14" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="9" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="20" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="16" x2="38" y2="20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="38" cy="20" r="2.4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 24 A8 8 0 0 0 20 18" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  hookPunch: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="14" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="9" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="20" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 16 Q30 8 34 22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="34" cy="22" r="2.4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  uppercutPunch: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="14" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="9" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="20" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 30 Q20 34 28 14" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="28" cy="14" r="2.4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  guardStance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="14" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="20" x2="16" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="15" x2="30" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30" y1="20" x2="28" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="16" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="28" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  headMovementSlip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="14" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/> <circle cx="24" cy="18" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 14 Q19 17 24 18" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3"/> <line x1="24" y1="21" x2="24" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="30" x2="18" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="30" x2="30" y2="38" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="24" x2="16" y2="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="20" x2="32" y2="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  roundhouseKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="11" x2="14" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="14" x2="20" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="22" x2="8" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="22" x2="34" y2="16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 22 A16 16 0 0 1 30 10" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3" opacity="0.5"/> </svg>',
  teepKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="11" x2="14" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="14" x2="20" y2="10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="22" x2="8" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="22" x2="38" y2="22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="18" x2="38" y2="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="34" y1="26" x2="38" y2="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  switchKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="12" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/> <line x1="20" y1="22" x2="34" y2="16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M8 34 Q14 38 20 34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M6 30 L8 34 L4 36" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  comboTiming: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="8" cy="10" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="30" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="30" cy="16" r="2.2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="13" x2="8" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="8" y1="26" x2="4" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/> <line x1="8" y1="26" x2="26" y2="34" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  clinchControl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 13 Q10 13 10 22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 13 Q34 13 34 22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="20" x2="16" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="20" x2="28" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  kneeStrike: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="6" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="9" x2="18" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 12 Q30 14 32 22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="20" x2="26" y2="26" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="26" y1="26" x2="24" y2="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="18" y1="20" x2="12" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  elbowStrike: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="11" x2="16" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="22" x2="10" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="22" x2="20" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M16 14 L34 20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M30 14 L34 20 L28 24" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  checkBlock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="6" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="9" x2="16" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 12 Q26 14 30 24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="20" x2="12" y2="30" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M32 26 L36 30 L30 34" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="30 " y1="30" x2="34" y2="30" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.01"/> </svg>',
  sideKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="11" x2="12" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="14" x2="18" y2="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="22" x2="8" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="12" y1="22" x2="38" y2="18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M34 15 L38 18 L34 21" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  axeKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="14" cy="6" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="9" x2="14" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="12" x2="6" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="20" x2="10" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 20 Q28 4 32 10" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 20 L26 30" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3" opacity="0.5"/> </svg>',
  spinningBackKick: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="20" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="11" x2="20" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="22" x2="12" y2="32" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/> <line x1="20" y1="22" x2="6" y2="18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M28 6 A14 14 0 0 1 34 20" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1,3"/> <path d="M30 18 L34 20 L31 24" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  sprawl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="16" cy="10" r="3.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="13" x2="24" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="36" y2="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="10" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="24" y1="20" x2="14" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  groundPound: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="4" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/> <circle cx="18" cy="16" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="19" x2="16" y2="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="28" x2="8" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="28" x2="26" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="18" y1="21" x2="34" y2="12" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <circle cx="34" cy="12" r="2.2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  cageControl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <line x1="36" y1="4" x2="36" y2="40" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <circle cx="16" cy="12" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="15" x2="20" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="16" y1="18" x2="34" y2="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="24" x2="14" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="24" x2="26" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  wardOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 14 Q34 16 32 26" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="16" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="24" x2="28" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  rollback: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="20" y2="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M34 14 Q20 16 18 26" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="24" x2="14" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="20" y1="24" x2="26" y2="36" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  pressPush: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="20" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="13" y1="20" x2="24" y2="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="16" x2="38" y2="16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="14" y1="24" x2="38" y2="24" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M34 12 L38 16 L34 20" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M34 20 L38 24 L34 28" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="23" x2="6" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="10" y1="23" x2="14" y2="30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
  listeningEnergy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <circle cx="34" cy="10" r="3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="10" y1="13" x2="20" y2="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="34" y1="13" x2="24" y2="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <circle cx="22" cy="24" r="2.6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="27" x2="16" y2="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <line x1="22" y1="27" x2="28" y2="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
  rooting: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"> <circle cx="22" cy="8" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="11" x2="22" y2="26" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="12" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="16" x2="32" y2="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="14" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <line x1="22" y1="26" x2="30" y2="34" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 34 Q10 38 6 40" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> <path d="M30 34 Q34 38 38 40" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/> </svg>',
};

const COMBAT_TECHNIQUE_DETAILS = {
  'Jab': {icon:'jabPunch', video:'boxing jab technique tutorial', points:[
    'Setup: From guard, lead shoulder turning slightly to cover the chin.',
    'Execution: Snap the fist straight out, palm down at impact, and straight back.',
    'Common mistake: Dropping the rear hand, or pulling the jab back in an arc.',
  ]},
  'Cross (Straight Right)': {icon:'crossPunch', video:'boxing cross straight right technique tutorial', points:[
    'Setup: Rear hip and shoulder sit slightly back, loaded.',
    'Execution: Pivot the rear foot and turn hip and shoulder as the hand drives straight out.',
    'Common mistake: An arm-only punch; drill it slowly to feel the foot start it.',
  ]},
  'Hook': {icon:'hookPunch', video:'boxing hook punch technique tutorial', points:[
    'Setup: Bend the punching arm to about 90° and keep it there.',
    'Execution: Turn hips, torso and lead foot together, forearm level at impact.',
    'Common mistake: Winding up first, or straightening the arm mid-swing.',
  ]},
  'Uppercut': {icon:'uppercutPunch', video:'boxing uppercut technique tutorial', points:[
    'Setup: Dip the knees slightly, elbow tucked to your side.',
    'Execution: Drive up with the legs and hips, fist rising on a short path, palm toward you.',
    'Common mistake: Dropping the hand low first, which telegraphs it.',
  ]},
  'Guard & Head Movement': {icon:'headMovementSlip', video:'boxing guard position head movement technique', points:[
    'Setup: Hands high at the cheekbones, elbows in, chin down.',
    'Execution: Slip off the centerline and duck with the knees, then return to guard.',
    'Common mistake: Dropping the hands to move the head.',
  ]},

  'Roundhouse Kick (Kickboxing)': {icon:'roundhouseKick', video:'kickboxing roundhouse kick technique tutorial', points:[
    'Setup: Chamber the knee up and out, pivoting the standing foot about 90°.',
    'Execution: Snap the shin or instep through the target, driven by the hip.',
    'Common mistake: No pivot on the standing foot, which caps the rotation.',
  ]},
  'Teep (Push Kick)': {icon:'teepKick', video:'muay thai kickboxing teep push kick technique', points:[
    'Setup: Raise the knee toward the chest, hip facing the target.',
    'Execution: Drive the ball or heel of the foot straight out, like pushing a door.',
    'Common mistake: Snapping it back early and losing the push.',
  ]},
  'Switch Kick': {icon:'switchKick', video:'kickboxing switch kick technique tutorial', points:[
    'Setup: Swap your feet with a quick, small hop.',
    'Execution: Turn the switch straight into a rear-leg roundhouse, one motion.',
    'Common mistake: Pausing between the switch and the kick.',
  ]},
  'Punch-Kick Combination Timing': {icon:'comboTiming', video:'kickboxing punch kick combination timing tutorial', points:[
    'Setup: Lead with the hands to close range and draw a reaction.',
    'Execution: Kick as their guard moves, or as the finish once the rhythm is set.',
    'Common mistake: A visible reset between punches and kicks.',
  ]},

  'Muay Thai Roundhouse Kick': {icon:'roundhouseKick', video:'muay thai roundhouse kick technique tutorial', points:[
    'Setup: A bigger hip turn than kickboxing, standing foot pivoting fully.',
    'Execution: Strike with the shin, not the foot, turning the whole hip through.',
    'Common mistake: Kicking with the instep; build shin-conditioning volume gradually.',
  ]},
  'Clinch Control & Off-Balancing': {icon:'clinchControl', video:'muay thai clinch control technique tutorial', points:[
    'Setup: Control the head or arms up close, elbows tight.',
    'Execution: Stay tall and pull the head down or turn their posture to open strikes.',
    'Common mistake: Letting your own posture drop while fighting for grips.',
  ]},
  'Straight Knee Strike': {icon:'kneeStrike', video:'muay thai straight knee strike technique tutorial', points:[
    'Setup: From the clinch, hips square, knee chambered.',
    'Execution: Pull them off balance, then drive the hips forward into the knee.',
    'Common mistake: Kneeing with the leg while the hips stay back.',
  ]},
  'Elbow Strike (Horizontal & Diagonal)': {icon:'elbowStrike', video:'muay thai elbow strike technique tutorial', points:[
    'Setup: Elbow close to the body, arm tightly bent, at close range.',
    'Execution: Turn hip and shoulder to whip the elbow point through a short arc.',
    'Common mistake: Wide, arm-only elbows; mind the cutting risk and drill on pads first.',
  ]},
  'Checking a Low Kick': {icon:'checkBlock', video:'muay thai checking low kick technique tutorial', points:[
    'Setup: As the kick comes, lift the same-side knee and turn the shin out.',
    'Execution: Take it on the shin bone, not the thigh, balanced on the other leg.',
    'Common mistake: Checking late, after the kick reaches the thigh.',
  ]},

  'Sprawl (Takedown Defense)': {icon:'sprawl', video:'mma sprawl takedown defense technique tutorial', points:[
    'Setup: As they shoot, react at once; don\'t back away.',
    'Execution: Kick the legs back and drop hips and chest onto their shoulders, head up.',
    'Common mistake: Sprawling with your head down and chest collapsed.',
  ]},
  'Ground & Pound Positioning': {icon:'groundPound', video:'mma ground and pound positioning technique tutorial', points:[
    'Setup: Set a stable top base before striking.',
    'Execution: Throw short strikes that keep your base.',
    'Common mistake: Over-extending for big shots and getting swept.',
  ]},
  'Striking-to-Clinch Transition': {icon:'clinchControl', video:'mma striking to clinch transition technique tutorial', points:[
    'Setup: Close the distance behind a strike or feint.',
    'Execution: Secure a collar tie or underhooks the instant you make contact.',
    'Common mistake: Walking in unprotected.',
  ]},
  'Cage/Wall Control': {icon:'cageControl', video:'mma cage wall control technique tutorial', points:[
    'Setup: Pin them to the cage with an underhook, overhook or collar tie.',
    'Execution: Use hip pressure to hold them while your hands work.',
    'Common mistake: Pinning without upper-body control, so they circle out.',
  ]},

  'Roundhouse Kick (Taekwondo)': {icon:'roundhouseKick', video:'taekwondo roundhouse kick technique tutorial', points:[
    'Setup: Chamber the knee high and out, standing foot fully pivoted.',
    'Execution: Snap through with the ball of the foot or instep, then rechamber.',
    'Common mistake: Skimping on chamber height and pivot for speed.',
  ]},
  'Side Kick': {icon:'sideKick', video:'taekwondo side kick technique tutorial', points:[
    'Setup: Chamber the knee to the chest, hip and knee aimed at the target.',
    'Execution: Pivot and drive the heel straight out sideways in a line.',
    'Common mistake: Leaning back for reach, which strains the lower back.',
  ]},
  'Axe Kick': {icon:'axeKick', video:'taekwondo axe kick technique tutorial', points:[
    'Setup: Raise the leg high and fairly straight above the target.',
    'Execution: Chop it down under control, striking with the heel.',
    'Common mistake: Forcing height before your hamstrings and back are ready.',
  ]},
  'Spinning Back Kick': {icon:'spinningBackKick', video:'taekwondo spinning back kick technique tutorial', points:[
    'Setup: Turn your head to spot the target over your shoulder first.',
    'Execution: Pivot, turn briefly away, and drive the heel straight back.',
    'Common mistake: Rushing the spin; spotting comes first, so drill it slowly.',
  ]},

  'Ward-Off (Peng) as Structural Defense': {icon:'wardOff', video:'tai chi peng ward off application tutorial', points:[
    'Setup: A rounded, springy forearm, held by legs and waist, not arm tension.',
    'Execution: Absorb and redirect pressure through legs, waist and spine together.',
    'Common mistake: A stiff arm block that collapses under pressure.',
  ]},
  'Rollback (Lu) as Yielding': {icon:'rollback', video:'tai chi lu rollback application tutorial', points:[
    'Setup: As force arrives, turn the waist instead of meeting it.',
    'Execution: Lead the force past you along a curve so their momentum does the work.',
    'Common mistake: Pulling back with the arms instead of turning from the waist.',
  ]},
  'Press (Ji) & Push (An) as Issuing Power': {icon:'pressPush', video:'tai chi ji an press push application tutorial', points:[
    'Setup: After neutralizing, sink your weight and load the waist.',
    'Execution: Issue power from the rear leg through the waist to the hands.',
    'Common mistake: Shoving with the arms while the legs stay passive.',
  ]},
  'Push Hands Listening Energy (Ting Jin)': {icon:'listeningEnergy', video:'tai chi ting jin listening energy push hands tutorial', points:[
    'Setup: Keep the lightest forearm contact with your partner.',
    'Execution: Sense their force and direction, and respond only to what you feel.',
    'Common mistake: Gripping or pressing hard, which kills the sensitivity.',
  ]},
  'Rooting & Whole-Body Weight Transfer': {icon:'rooting', video:'tai chi rooting weight transfer application tutorial', points:[
    'Setup: Settle your weight fully into one leg at a time.',
    'Execution: Shift weight smoothly and completely with each step, torso upright.',
    'Common mistake: Keeping your weight vaguely split between both legs.',
  ]},
};

const COMBAT_TECHNIQUE_GROUPS = {
  'Boxing': {
    poses:['Jab','Cross (Straight Right)','Hook','Uppercut','Guard & Head Movement'],
    note:'The punching mechanics every style here builds on.',
  },
  'Kickboxing': {
    poses:['Roundhouse Kick (Kickboxing)','Teep (Push Kick)','Switch Kick','Punch-Kick Combination Timing'],
    note:'Adds fast kicks and clean punch-to-kick combinations.',
  },
  'Muay Thai': {
    poses:['Muay Thai Roundhouse Kick','Clinch Control & Off-Balancing','Straight Knee Strike','Elbow Strike (Horizontal & Diagonal)','Checking a Low Kick'],
    note:'Heavier strikes with eight limbs, plus the clinch.',
  },
  'MMA': {
    poses:['Sprawl (Takedown Defense)','Ground & Pound Positioning','Striking-to-Clinch Transition','Cage/Wall Control'],
    note:'The transitions between striking and grappling.',
  },
  'Taekwondo': {
    poses:['Roundhouse Kick (Taekwondo)','Side Kick','Axe Kick','Spinning Back Kick'],
    note:'Fast, high, precisely chambered kicks.',
  },
  'Tai Chi': {
    poses:['Ward-Off (Peng) as Structural Defense','Rollback (Lu) as Yielding','Press (Ji) & Push (An) as Issuing Power','Push Hands Listening Energy (Ting Jin)','Rooting & Whole-Body Weight Transfer'],
    note:'How the form works as self-defense, not only moving meditation.',
  },
};
