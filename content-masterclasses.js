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
    'Setup: feet shoulder-width, one foot slightly forward and turned out for taper; never stand square, it flattens your physique.',
    'Execution: raise both arms just above shoulder height and rotate your wrists inward as you flex to peak the biceps.',
    'Whole-body integration: not an arm pose — flex abs and quads hard and spread your lats slightly to widen the whole silhouette.',
    'Common mistake: shrugging toward the ears, which shortens the neck and hides the delts. Keep traps down and neck long.',
    'Judging insight: judges check left-right symmetry first; practice until both sides peak at the same height. A lopsided flex costs more than a smaller peak.',
  ]},
  'Front Lat Spread': {icon:'frontDoubleBiceps', video:'front lat spread bodybuilding pose tutorial', points:[
    'Setup: grip your waist or lower lats, fingers forward, elbows driving forward and slightly down.',
    'Execution: flare your lats by driving your elbows toward each other in front; the spread comes from the lats, not the arms.',
    'Whole-body integration: chest lifted, abs braced hard; the pose depends on your V-taper, and a collapsed chest kills the width.',
    'Common mistake: rounding the shoulders to force more spread. It reads as a slouch; width must come from under the arms.',
    'Judging insight: your lats, not your elbows, should be the widest point. Find the elbow angle that maximizes lat width in a mirror.',
  ]},
  'Side Chest': {icon:'sideChest', video:'side chest bodybuilding pose tutorial', points:[
    'Setup: turn to your strongest side (the better biceps peak or pec shape) and grip your near wrist with your far hand.',
    'Execution: drive your chest up and out by pressing your gripped arms down, separating chest from shoulder.',
    'Whole-body integration: flex the near-side biceps, quad and calf together; a flexed chest over a soft leg looks unfinished.',
    'Common mistake: turning the rear foot straight instead of out toward the judges, which hides the calf completely.',
    'Judging insight: judges score the pec-to-shoulder separation, not chest size. A clear line between chest and delt beats a bigger, blended chest.',
  ]},
  'Back Double Biceps': {icon:'backDoubleBiceps', video:'back double biceps bodybuilding pose tutorial', points:[
    'Setup: arms as in the front double biceps, feet slightly narrower so the legs don\'t distract from the back.',
    'Execution: flare your lats hard and arch the lower back very slightly to show thickness through the middle back, not just width.',
    'Whole-body integration: rise onto one foot to flex that calf; alternate feet in practice to find your better calf.',
    'Common mistake: looking down at the floor, which kills the trap-to-back line. Keep your chin level or slightly up.',
    'Judging insight: judges weigh width and thickness separately. If width is your strength, hold the flare longer before arching; if thickness, arch sooner.',
  ]},
  'Back Lat Spread': {icon:'backDoubleBiceps', video:'back lat spread bodybuilding pose tutorial', points:[
    'Setup: grip your waist from behind, elbows driving out and slightly back, not just to the sides.',
    'Execution: spread your lats as wide as possible while keeping the lower back tight and braced.',
    'Whole-body integration: flex glutes and hamstrings with your back; soft legs look incomplete next to a competitor flexed head to toe.',
    'Common mistake: pulling the elbows straight out to the sides. Elbows back recruit more lat and build a deeper V.',
    'Judging insight: a smaller competitor with better lat insertions can out-width a bigger one here, so train the lat spread itself.',
  ]},
  'Side Triceps': {icon:'sideTriceps', video:'side triceps bodybuilding pose tutorial', points:[
    'Setup: turn to the side, extend your near arm down and back, and grip that wrist with your far hand behind you.',
    'Execution: flex the triceps through full lockout; a bent elbow looks soft, and lockout shows the horseshoe.',
    'Whole-body integration: pull the near shoulder back to avoid hunching, and flex the whole rear leg too; it\'s a full side profile.',
    'Common mistake: letting the chest cave while focusing on the arm, which undermines the whole silhouette.',
    'Judging insight: the horseshoe (three triceps heads separating) makes it great; it responds to close-grip pressing and overhead extensions.',
  ]},
  'Abdominal & Thigh': {icon:'abdominalThigh', video:'abdominal and thigh bodybuilding pose tutorial', points:[
    'Setup: hands behind your head, one leg forward on the ball of the foot, weight mostly on the standing leg.',
    'Execution: crunch forward and down sharply while flexing the extended quad hard, both at the same instant.',
    'Whole-body integration: exhale sharply and completely as you hit it; a held breath pushes the abdominal wall out and flattens separation.',
    'Common mistake: locking the extended knee hard. A slightly soft knee shows more of the quad sweep.',
    'Judging insight: this pose rewards low body fat more than almost any other; conditioning on the day makes or breaks it.',
  ]},
  'Most Muscular': {icon:'mostMuscular', video:'most muscular bodybuilding pose tutorial', points:[
    'Setup: pick and drill one variation, crab (arms down and in) or hands clasped at the waist; each works slightly different muscles.',
    'Execution: crunch the whole upper body inward at once — traps up, chest down and in, arms pressing to center.',
    'Whole-body integration: drive the shoulders forward and slightly down with your chin tucked to maximize the trap-to-chest crunch.',
    'Common mistake: flexing only the arms and forgetting chest and traps; all forearms and biceps misses the pose.',
    'Judging insight: it shows density and hardness most clearly and is often a tiebreaker, rewarding peak-week conditioning over mass.',
  ]},
  'Quarter Turn': {icon:'quarterTurn', video:'bodybuilding quarter turns posing tutorial', points:[
    'Setup: stand tall and relaxed, weight slightly on the back foot, front foot turned out about 30-45°.',
    'Execution: shoulders back and down, chest lifted, core gently engaged: presentation and poise, not maximal flexing.',
    'Whole-body integration: hold the same posture and energy through all four angles; switching off between turns loses points.',
    'Common mistake: over-flexing to look more athletic. These divisions score a relaxed, confident look; straining reads as trying too hard.',
    'Judging insight: practice the turn itself; a crisp, confident quarter turn on the call is scored too.',
  ]},
  'Side Profile Pose': {icon:'quarterTurn', video:'bikini side profile pose tutorial', points:[
    'Setup: turn fully to your best side, weight on the back leg, front leg slightly forward with a soft knee.',
    'Execution: lift your ribcage and lengthen through your side: tall and long, not flexed.',
    'Whole-body integration: keep glutes and hamstrings gently engaged for a clean line from shoulder to heel.',
    'Common mistake: collapsing at the waist or dropping a hip, which breaks the long silhouette.',
    'Judging insight: it\'s about waist-to-hip ratio and shape, not detail; find the hip angle that makes your waist look smallest.',
  ]},
  'Front Relaxed Pose': {icon:'quarterTurn', video:'figure front relaxed pose tutorial', points:[
    'Setup: face forward, feet hip-width, weight even, arms relaxed at your sides or lightly on your hips.',
    'Execution: hold a light, controlled full-body tone: more present than Bikini\'s relaxed look, well short of a hard flex.',
    'Whole-body integration: shoulders open and down, ribcage lifted, light natural engagement through abs and legs.',
    'Common mistake: going too soft (under-conditioned) or too hard (bodybuilding flex); aim for controlled athletic tone.',
    'Judging insight: symmetry and proportion are judged as much as conditioning, and a straight-on stance exposes asymmetry, so rehearse this one most.',
  ]},
  'Rear Pose (Glute Emphasis)': {icon:'quarterTurn', video:'wellness division rear pose tutorial', points:[
    'Setup: back to the judges, feet hip-width, weight balanced, one heel gently lifted for a calf and glute line.',
    'Execution: engage glutes and hamstrings with a light, controlled squeeze, not a hard flex.',
    'Whole-body integration: lower back neutral, shoulders relaxed but open; the pose draws the eye to glute shape and leg lines.',
    'Common mistake: over-arching the lower back to push the glutes out; it looks strained and can shorten the leg line.',
    'Judging insight: judges look at the glute-hamstring tie-in, which responds to hip thrusts and Romanian deadlifts more than squats.',
  ]},
  'Back Pose with Flex': {icon:'backDoubleBiceps', video:'wellness division back pose tutorial', points:[
    'Setup: back to the judges, feet shoulder-width, arms in a light back-double-biceps position without the bodybuilding intent.',
    'Execution: add a moderate flex through back and glutes: more than a relaxed quarter turn, well short of a maximal flex.',
    'Whole-body integration: keep the flex smooth rather than shaking into it; composure is judged.',
    'Common mistake: flexing as hard as a bodybuilding back pose, which overreaches for a look this division isn\'t judged on.',
    'Judging insight: it rewards shape and taper with a light contraction; think back double biceps at 60% effort.',
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
    'Setup: in chest-deep water, take a full breath and sink fully by bending your knees; most later problems trace back to holding your breath.',
    'Execution: exhale slowly through nose and mouth underwater, then push up and inhale quickly through the mouth as your face clears.',
    'Whole-body integration: keep the exhale a steady trickle of bubbles the whole time you\'re under; that\'s the skill, not the bob.',
    'Common mistake: holding your breath underwater and exhaling only at the surface, the root of breathless panic. Fix this before any stroke.',
    'Coaching insight: repeat 10-15 times a session until it\'s automatic; every stroke assumes this rhythm already exists.',
  ]},
  'Front Float (Streamline Position)': {icon:'streamlineFront', video:'front float streamline position swimming tutorial', points:[
    'Setup: push off face-down, arms straight overhead, one hand stacked on the other, biceps against your ears.',
    'Execution: look straight down, not forward, and let hips and legs float up, becoming as long, narrow and flat as possible.',
    'Whole-body integration: this streamline is the lowest-drag shape you can hold, and you return to it after every push-off, recovery and breath.',
    'Common mistake: lifting your head to look forward, which sinks the hips and legs; \'swim downhill\' starts with where the head points.',
    'Coaching insight: hold this float relaxed for 5-10 seconds before adding kick or pull; arm strength can\'t fix the drag underneath.',
  ]},
  'Back Float': {icon:'streamlineBack', video:'back float swimming tutorial beginners', points:[
    'Setup: lie back with ears submerged, chin slightly tucked, arms at your sides or overhead.',
    'Execution: let chest and hips rise while the lower legs stay relaxed near the surface; push your belly button up to lift the hips.',
    'Whole-body integration: your face is clear, so breathe normally; this drill is purely about trusting buoyancy.',
    'Common mistake: lifting your head to check your position, which drops the hips immediately; the head leads and the hips follow.',
    'Coaching insight: backstroke is built on it; if the back float feels unstable, backstroke will feel like fighting sinking hips.',
  ]},
  'Flutter Kick on the Wall': {icon:'flutterKick', video:'flutter kick drill kickboard swimming tutorial', points:[
    'Setup: hold the wall or a kickboard, arms extended, body flat, face in the water looking down.',
    'Execution: kick from the hip, not the knee, legs like long whips finishing with a small, quick flick at the ankle.',
    'Whole-body integration: keep ankles loose and slightly pointed; stiff, flexed ankles act as brakes and can halve your kick\'s propulsion.',
    'Common mistake: kicking from a bent knee like pedaling a bike, the commonest beginner flaw, wasting energy for little propulsion.',
    'Coaching insight: freestyle teaches a 6-beat kick, but beginners should focus on loose ankles and hip-driven rhythm before counting beats.',
  ]},

  'Body Position & Streamline': {icon:'streamlineFront', video:'freestyle swimming body position technique', points:[
    'Setup: start from the front float: long, flat, face down, streamlined off the wall.',
    'Execution: keep your body near horizontal with a slight slope from head to feet, minimizing how much of you plows through the water.',
    'Whole-body integration: the head steers the body; looking down keeps hips and legs high, the basis of \'swim downhill\'.',
    'Common mistake: swimming with the head up, the commonest cause of sinking legs; the fix is dropping the head, not kicking harder.',
    'Coaching insight: drill pure kicking in this position before adding strokes; most freestyle flaws are body-position flaws in disguise.',
  ]},
  'Flutter Kick': {icon:'flutterKick', video:'freestyle flutter kick technique tutorial', points:[
    'Setup: the same hip-driven, straight-leg, loose-ankle kick as the wall drill, now while swimming.',
    'Execution: keep the kick narrow; wider than about shoulder-width pushes water sideways and creates drag.',
    'Whole-body integration: the kick mainly stabilizes rotation and balance; most freestyle speed comes from the pull, so don\'t overspend on it.',
    'Common mistake: kicking too hard too early and burning the legs out in the first 50m; distance swimming uses a light 2- or 6-beat kick.',
    'Coaching insight: a small, tight, fast hip kick beats a big, slow, bent-knee kick, like a tight jab beating a looping one.',
  ]},
  'Catch & Early Vertical Forearm': {icon:'armPullFreestyle', video:'freestyle high elbow catch early vertical forearm tutorial', points:[
    'Setup: let your hand enter in front of the shoulder, not crossing the midline, and sink slightly before pulling.',
    'Execution: bend the elbow and drop the forearm vertical while the elbow stays high (early vertical forearm), paddling against still water.',
    'Whole-body integration: high elbow, vertical forearm, relaxed wrist: the element that most separates efficient swimmers from splashy, tired ones.',
    'Common mistake: a dropped elbow, sweeping the straight arm back like an oar, pushing down and lifting you instead of moving you forward.',
    'Coaching insight: practice slowly with the catch-up drill, one arm waiting forward while the other strokes, to feel the high-elbow catch.',
  ]},
  'Pull-Through & Finish (S-Pull)': {icon:'armPullFreestyle', video:'freestyle swimming s-pull finish technique tutorial', points:[
    'Setup: from the vertical-forearm catch, pull along a gentle curve, in toward the midline, then back out past the hip.',
    'Execution: accelerate through the pull, fastest as the hand exits by the hip; a stroke that starts fast and fades is far weaker.',
    'Whole-body integration: the S-path keeps the hand on undisturbed water longer than a straight pull, which is why it\'s faster.',
    'Common mistake: pulling straight back and stopping at the hip instead of finishing the push, losing propulsion every stroke.',
    'Coaching insight: think \'push the pool behind you\', not \'pull yourself forward\'; it reliably produces a stronger finish.',
  ]},
  'High-Elbow Recovery': {icon:'armRecoveryHighElbow', video:'freestyle high elbow arm recovery technique', points:[
    'Setup: as the pull finishes at the hip, lift the elbow first, letting forearm and hand hang relaxed behind it.',
    'Execution: keep the elbow higher than the hand throughout, fingertips skimming close to the water rather than looping wide.',
    'Whole-body integration: a relaxed recovery swings on momentum, the moment efficient swimmers rest mid-stroke.',
    'Common mistake: a stiff, straight arm swinging wide, which wastes energy and throws off rotation and balance.',
    'Coaching insight: a floppy, relaxed hand in recovery is a real skill; any tension bleeds energy you need for the next pull.',
  ]},
  'Bilateral (Rotary) Breathing': {icon:'breathingSide', video:'bilateral breathing freestyle swimming tutorial', points:[
    'Setup: rotate your whole body, not just your head, so your mouth clears the water in the trough the rotation creates.',
    'Execution: breathe on a steady rhythm, commonly every third stroke alternating sides, rather than always to the same side.',
    'Whole-body integration: the breath rides the stroke\'s rotation; if you must lift your head to breathe, the rotation isn\'t working yet.',
    'Common mistake: lifting the head straight up to breathe, which sinks the hips and breaks rhythm on every breath.',
    'Coaching insight: bilateral breathing forces even rotation both ways, often fixing a zig-zagging path better than \'swim straight\' cues.',
  ]},
  'Stroke Timing & Body Rotation': {icon:'rotationTiming', video:'freestyle body rotation timing swimming technique', points:[
    'Setup: as one arm catches and pulls, rotate hips and shoulders toward that side; freestyle is swum on alternating sides, not flat.',
    'Execution: rotate from the core and hips, the whole body rolling as a unit, about 30-45° each way at moderate pace.',
    'Whole-body integration: rotation eases the shoulder on recovery, lengthens the catch for a stronger pull, and makes side breathing possible.',
    'Common mistake: swimming flat, shoulders and hips square to the bottom, windmilling the arms: slower and harder on the shoulders.',
    'Coaching insight: often the last piece to click; kick, catch and recovery can be right and still look labored until rotation connects them.',
  ]},

  'Back Float & Body Position': {icon:'streamlineBack', video:'backstroke body position technique tutorial', points:[
    'Setup: start from the back float: ears submerged, hips up, chin slightly tucked rather than lifted.',
    'Execution: hold a near-flat line from shoulders to ankles, like a broomstick laid along your spine.',
    'Whole-body integration: with your face clear, backstroke position is all about hip height, and sinking hips usually come from head position.',
    'Common mistake: lifting the head to see where you\'re going; you can\'t see forward anyway, so it only drops the hips.',
    'Coaching insight: fix your gaze on one point on the ceiling; a still head keeps the hips up.',
  ]},
  'Backstroke Flutter Kick': {icon:'flutterKick', video:'backstroke kick technique tutorial', points:[
    'Setup: the same hip-driven, loose-ankle kick as freestyle, face up, toes just breaking the surface on the upkick.',
    'Execution: the upkick is the power phase here, the reverse of freestyle; \'squash a bug on the surface with your big toe\'.',
    'Whole-body integration: a small fountain of white water from the toes is a good sign: the upkick is shallow and fast.',
    'Common mistake: a deep kick that pushes the knees above the surface, creating drag and usually meaning you\'re kicking from the knee.',
    'Coaching insight: regular kickboard-on-chest kick drills build the ankle flexibility and hip-driven habit new backstrokers lack.',
  ]},
  'Catch & Pull': {icon:'backPull', video:'backstroke catch and pull technique tutorial', points:[
    'Setup: the recovering arm enters in line with the shoulder, pinky first, fingertips leading with minimal splash.',
    'Execution: bend the elbow into a vertical-forearm catch and pull in a gentle curve toward the hip, finishing with a downward palm push.',
    'Whole-body integration: the power comes from shoulder and back rotating the body, so rotation and pull are one connected motion.',
    'Common mistake: a straight-arm windmill pull with no elbow bend, shrinking the pulling surface and propulsion.',
    'Coaching insight: you can\'t see your backstroke catch, so straight-arm pulls go unnoticed; coach feedback or underwater video helps most.',
  ]},
  'Recovery Arm (Straight-Arm Exit & Entry)': {icon:'backRecovery', video:'backstroke arm recovery technique tutorial', points:[
    'Setup: as the pull finishes at the hip, exit the water thumb-first with a straight arm.',
    'Execution: swing the straight arm up and over above the shoulder, turning the hand to enter pinky-first in line with that shoulder.',
    'Whole-body integration: the straight-arm recovery works because it\'s above the water, where drag doesn\'t matter; bending just adds effort.',
    'Common mistake: entering directly overhead, in line with the ear, which twists shoulder and torso and disrupts rotation.',
    'Coaching insight: picture a clock, head at 12: the arm travels from 6 to 12 in one plane, never drifting toward 1 or 11.',
  ]},
  'Body Rotation & Timing': {icon:'rotationTiming', video:'backstroke body rotation timing technique', points:[
    'Setup: as one arm pulls and the other recovers, hips and shoulders rotate together toward the pulling side, as in freestyle.',
    'Execution: keep continuous alternating timing: as one arm finishes its pull, the other is just entering, with no pause between strokes.',
    'Whole-body integration: rotation lengthens the catch, clears the recovering arm, and links kick, pull and shoulders into one system.',
    'Common mistake: flat backstroke, arms windmilling over a rigid torso, which shortens the stroke; common in swimmers who learned it last.',
    'Coaching insight: with two arms always moving, timing errors are obvious from the side; a coach can spot unsynced entry and exit instantly.',
  ]},
  'Breathing Rhythm': {icon:'breathingSide', video:'backstroke breathing rhythm technique tutorial', points:[
    'Setup: your face is always clear in backstroke, so breathing isn\'t timed to surfacing; the job is not holding your breath.',
    'Execution: set a simple pattern, such as inhaling as one arm recovers and exhaling as the other pulls, until it\'s automatic.',
    'Whole-body integration: a steady rhythm keeps the stroke relaxed; breath-holding builds tension in shoulders and neck that leaks into the stroke.',
    'Common mistake: holding your breath for several cycles without noticing, since no water forces the exhale; it\'s a uniquely backstroke problem.',
    'Coaching insight: some coaches have swimmers quietly count strokes out loud on easy sets to force a natural breathing pattern.',
  ]},

  'Body Position & Streamline Glide': {icon:'streamlineFront', video:'breaststroke streamline glide technique tutorial', points:[
    'Setup: after each pull-kick cycle, return to a full streamline: arms forward, legs together and straight, face down.',
    'Execution: hold the glide longer than feels natural; breaststroke is the only competitive stroke with a real full-body pause built in.',
    'Whole-body integration: the glide is where breaststroke\'s efficiency comes from; rushing into the next pull gives up its biggest advantage.',
    'Common mistake: cutting the glide short out of impatience or anxiety, treating it as continuous paddling instead of pull-breathe-kick-glide.',
    'Coaching insight: silently count \'one-Mississippi\' in the glide; most learners are surprised how long a correct glide feels.',
  ]},
  'Breaststroke Pull (Out-Sweep, In-Sweep, Recovery)': {icon:'breastPull', video:'breaststroke pull technique tutorial', points:[
    'Setup: from streamline, sweep both hands outward and slightly down in a shallow Y, palms angled to press the water.',
    'Execution: just past shoulder-width, sweep back in and slightly down along a heart-shaped path, hands meeting in front of the chest.',
    'Whole-body integration: the in-sweep lifts head and shoulders for the breath; pull and breath are one connected motion.',
    'Common mistake: pulling too wide or back past the shoulders like freestyle, which kills the glide and adds drag.',
    'Coaching insight: \'small and quick\' pull, \'long and slow\' glide; most breaststroke corrections come back to that ratio.',
  ]},
  'Whip Kick (Breaststroke Kick)': {icon:'whipKick', video:'breaststroke whip kick technique tutorial', points:[
    'Setup: from the glide, draw your heels toward your glutes, knees about hip-width apart, narrower than feels natural.',
    'Execution: turn the feet out at the ankles, whip them around in a circle, then snap them together straight into streamline.',
    'Whole-body integration: the final snap of the feet accelerating together creates almost all the propulsion, like the crack at a whip\'s tip.',
    'Common mistake: a bicycle or scissor kick with knees too wide, the commonest breaststroke error and a disqualification in competition.',
    'Coaching insight: practice it on your back first to watch your knees and feet; most swimmers don\'t notice a bicycle kick until they see it.',
  ]},
  'Timing: Pull-Breathe-Kick-Glide': {icon:'rotationTiming', video:'breaststroke timing pull breathe kick glide tutorial', points:[
    'Setup: the cycle runs in order: pull, breathe, kick, glide, often said out loud to set the rhythm.',
    'Execution: pull and breathe together, then kick as the arms move forward into streamline, after the pull, not during it.',
    'Whole-body integration: at every moment either arms or legs are propelling you, never neither and rarely both, leaving almost no dead spots.',
    'Common mistake: pulling and kicking at the same time, often from rushing for air, giving a choppy, tiring stroke.',
    'Coaching insight: slow, exaggerated reps, counting each phase aloud, fix timing faster than race-pace swimming, which hides the flaws.',
  ]},
  'Breathing & Head Position': {icon:'breastBreathing', video:'breaststroke breathing head position technique', points:[
    'Setup: the head lifts to breathe as a result of the in-sweep pull, not as a separate motion.',
    'Execution: lift just enough to clear mouth and chin, then drop the head as the arms extend into the glide.',
    'Whole-body integration: riding the pull\'s natural lift, a well-timed breath adds almost no drag or rhythm disruption.',
    'Common mistake: lifting the head before the in-sweep raises your chest, disconnecting the breath and dragging the hips down.',
    'Coaching insight: if you\'re gasping or rushed, breathe later in the pull rather than lifting higher or holding your breath.',
  ]},
  'Body Undulation (Modern Wave Breaststroke)': {icon:'undulationWave', video:'wave breaststroke undulation technique tutorial', points:[
    'Setup: once pull-kick-glide timing is automatic, add a subtle forward-and-down chest press during the glide: the modern \'wave\'.',
    'Execution: as the arms extend into streamline, press the chest slightly down and let the hips follow in a small, controlled wave.',
    'Whole-body integration: the wave keeps slight continuous motion through the glide, reducing the stop-start feel of flat breaststroke.',
    'Common mistake: adding it before timing and kick are solid; on a bicycle kick or mistimed pull it just adds drag.',
    'Coaching insight: it\'s deliberately last in the progression; master pull-breathe-kick-glide and a clean whip kick first.',
  ]},

  'Body Undulation (The Wave)': {icon:'undulationWave', video:'butterfly stroke body undulation wave technique', points:[
    'Setup: from a front streamline, start a wave at the chest, pressing it down and slightly forward to send a ripple through hips and legs.',
    'Execution: the wave travels in sequence — chest, hips, legs — like a whip cracking, not the body moving as one rigid unit.',
    'Whole-body integration: the wave is butterfly\'s engine; kick, pull and breathing all time themselves around it.',
    'Common mistake: muscling butterfly with the arms over a stiff, flat torso; it\'s exhausting and the main reason fly feels brutal.',
    'Coaching insight: practice the wave alone, with a kickboard or simply worming through the water, before adding kick or pull.',
  ]},
  'Two-Beat Dolphin Kick': {icon:'dolphinKick', video:'butterfly dolphin kick technique tutorial', points:[
    'Setup: legs together moving as one unit, like a dolphin\'s tail, not alternating like flutter kick.',
    'Execution: two kicks per arm cycle: a small one as the hands enter and press down, a bigger one as they finish at the hips.',
    'Whole-body integration: the kick is the body wave continuing into the legs, timed to reinforce the stroke\'s two power moments.',
    'Common mistake: kicking from the knees only, stiff and disconnected from the body wave.',
    'Coaching insight: learn it on your back first, watching your legs, then combine it with the pull; seeing it speeds learning.',
  ]},
  'Butterfly Pull (Keyhole Pattern)': {icon:'flyPull', video:'butterfly stroke keyhole pull technique tutorial', points:[
    'Setup: both hands enter together in front of the shoulders, not crossing the midline, then press out and slightly down.',
    'Execution: sweep both hands in toward the centerline, then back out toward the hips, tracing a keyhole or hourglass seen from below.',
    'Whole-body integration: the same high-elbow, vertical-forearm catch as freestyle, done with both arms together.',
    'Common mistake: pulling straight front to back instead of the curved keyhole, losing undisturbed water, like a dropped-elbow catch.',
    'Coaching insight: with both arms moving together, any pull-timing error is doubled, so small flaws cost more here.',
  ]},
  'Butterfly Recovery': {icon:'flyRecovery', video:'butterfly stroke arm recovery technique tutorial', points:[
    'Setup: as the pull finishes at the hips, sweep both arms out and around low over the water, elbows only slightly bent.',
    'Execution: keep the arms relaxed and let momentum carry them forward in a wide arc to the entry in front of the shoulders.',
    'Whole-body integration: a relaxed recovery is where efficient fly swimmers recover; tension here quickly makes it exhausting.',
    'Common mistake: hoisting the arms high and stiff, or rushing to catch up with the kick, wasting energy the pull and kick need.',
    'Coaching insight: \'throw your arms, don\'t lift them\' produces the relaxed, momentum-driven recovery that\'s correct.',
  ]},
  'Breathing (Chin-Skim Technique)': {icon:'flyBreathing', video:'butterfly stroke breathing technique tutorial', points:[
    'Setup: breathe on the second, bigger kick as the pull finishes, when the wave already lifts your chest and head slightly.',
    'Execution: lift only enough for your chin to skim the surface, not your whole head and shoulders.',
    'Whole-body integration: riding the wave\'s lift, a well-timed breath adds little drag or effort, like breaststroke\'s pull-timed breath.',
    'Common mistake: lifting too high, too early, or every stroke, which stalls the wave and makes fly feel unsustainable.',
    'Coaching insight: many swimmers breathe every second cycle to keep the wave\'s momentum; fewer, well-timed breaths often feel easier.',
  ]},
  'Timing & Rhythm': {icon:'rotationTiming', video:'butterfly stroke timing rhythm technique tutorial', points:[
    'Setup: the cycle: kick as hands enter and press, keyhole pull, second kick as the pull finishes, relaxed recovery to entry.',
    'Execution: it should feel like one continuous wave from head to toe, not four separate actions.',
    'Whole-body integration: \'less is more\' most of all here; strength-only swimmers tire in a lap or two, timing-led swimmers last far longer.',
    'Common mistake: over-kicking, over-pulling or rushing the recovery to muscle through, a timing problem mistaken for strength.',
    'Coaching insight: if fly exhausts you within a few strokes, the fix is almost never \'get stronger\'; slow down and find the wave.',
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
    'Setup: before moving a hand or foot, check the other three are solidly placed: the default you return to between moves.',
    'Execution: move one limb at a time, keeping the other three in stable contact while it repositions.',
    'Whole-body integration: not just a beginner rule; elite climbers cycle through three-point stability too, only faster and more confidently.',
    'Common mistake: reaching while already off-balance on one or two points, then grabbing to catch yourself instead of moving from a stable base.',
    'Coaching insight: much beginner grip fatigue is really a balance problem the hands are compensating for.',
  ]},
  'Straight-Arm Resting (Skeletal Hang)': {icon:'straightArmHang', video:'climbing straight arm technique resting skeleton', points:[
    'Setup: whenever holds allow, hang on a straight arm so your skeleton, not your biceps and forearms, carries the load.',
    'Execution: relax the bending muscles once the arm is straight; bone and connective tissue don\'t fatigue the way muscle does.',
    'Whole-body integration: the biggest endurance lever new climbers have; bent-arm climbers pump out far faster than those who straighten and shake out.',
    'Common mistake: keeping arms bent \'just in case\' out of fear of falling, usually confidence rather than strength, and why routes feel too hard.',
    'Coaching insight: straighten any elbow that doesn\'t need to be bent; this habit does more for endurance than months of pull-ups.',
  ]},
  'Hip Positioning & Wall Awareness': {icon:'hipPosition', video:'climbing hip positioning technique wall awareness', points:[
    'Setup: instead of facing the wall square, turn the hip on the reaching side toward the wall.',
    'Execution: turning the hip in brings your center of gravity closer to the wall and extends your reach much further.',
    'Whole-body integration: flagging, backstepping and drop-knees are all variations on turning the hips to change reach and balance.',
    'Common mistake: staying square on steep or technical terrain, shortening reach and making the arms fix a hip and footwork problem.',
    'Coaching insight: most plateaued climbers have a technique and positioning gap, not a strength gap, and hip awareness is usually first to fix.',
  ]},
  'Quiet Feet & Precision Footwork': {icon:'quietFeet', video:'climbing quiet feet precision footwork drill', points:[
    'Setup: look at the foothold before moving, then place your foot exactly there without searching or scraping.',
    'Execution: place the foot with control and leave it; it should land and settle without shifting or readjusting.',
    'Whole-body integration: precise feet reduce grip fatigue, as sloppy feet make the arms compensate; technique and endurance are the same skill.',
    'Common mistake: feeling around with the toe after placing it; a loud, scrabbling foot means your eyes didn\'t do the work first.',
    'Coaching insight: climb an easy route placing every foot silently; it exposes sloppy footwork fast, even in technically solid climbers.',
  ]},

  'Crimp Grip (Full & Half Crimp)': {icon:'crimpGrip', video:'climbing crimp grip technique full half crimp', points:[
    'Setup: fingers sharply bent at the middle knuckle on a small edge; a full crimp locks the thumb over the index finger, a half doesn\'t.',
    'Execution: keep the wrist fairly straight; full crimp adds strength on tiny edges but loads the finger joints and A2 pulley far more.',
    'Whole-body integration: crimping is finger-intensive, so pair it with good positioning so your fingers aren\'t also compensating for balance.',
    'Common mistake: full-crimping every small edge out of habit; climbing medicine flags full-crimp loading, especially dynamic, as a major A2 pulley risk.',
    'Coaching insight: make half crimp and open hand your defaults and save full crimp for tiny edges, one of the best ways to protect fingers.',
  ]},
  'Open Hand (Drag) Grip': {icon:'openHandGrip', video:'climbing open hand drag grip technique', points:[
    'Setup: fingers curve over the hold in a shallow, relaxed arc without sharply bending the middle knuckle, as if dragging across it.',
    'Execution: let the hold\'s shape and friction do more of the work, relying on skin and finger pads rather than maximal joint torque.',
    'Whole-body integration: generally the safest grip for joints and pulleys, spreading load instead of concentrating it at the bent middle joint.',
    'Common mistake: assuming open hand is weaker and crimping everything; on many holds a trained open hand is nearly as strong with far less risk.',
    'Coaching insight: structured training plans build open-hand strength early, because most climbers under-train it relative to how often it\'s useful.',
  ]},
  'Pinch Grip': {icon:'pinchGrip', video:'climbing pinch grip technique tutorial', points:[
    'Setup: press your thumb against the fingers on opposite sides of the hold, squeezing it like gripping a brick.',
    'Execution: actively squeeze thumb and fingers together rather than hanging passively as on a crimp or jug.',
    'Whole-body integration: pinch strength comes largely from the thumb, which other grips barely use, so it\'s trained separately (block pinches, pinch blocks).',
    'Common mistake: forgetting to engage the thumb, turning the pinch into a weaker, harder-to-control open hand.',
    'Coaching insight: pinches are common on volumes and comp-style features and a weak point for edge-trained climbers, so seek them out.',
  ]},
  'Sloper': {icon:'sloperGrip', video:'climbing sloper technique friction grip', points:[
    'Setup: get as much palm and finger as possible flat on the rounded hold; with no edge, surface area and friction are everything.',
    'Execution: wrist low and elbow slightly bent to press into the hold, with body weight low and centered beneath it.',
    'Whole-body integration: slopers reward body positioning more than almost any hold; poor positioning slides off what good positioning holds easily.',
    'Common mistake: gripping hard with the fingers, which reduces palm contact; a relaxed, broad palm press works better.',
    'Coaching insight: chalk, skin and hold temperature matter more on slopers than on edges; conditions can change difficulty as much as technique.',
  ]},
  'Pocket Grip': {icon:'pocketGrip', video:'climbing pocket grip technique two finger mono', points:[
    'Setup: put one, two or three fingers into the pocket, choosing the combination its shape and spacing support.',
    'Execution: keep inserted fingers only slightly curled rather than jammed in and cranked, which hugely stresses single finger joints.',
    'Whole-body integration: two-finger and mono pockets carry more injury risk per unit of force than other grips, since load sits on so few tendons.',
    'Common mistake: cranking monos or two-finger pockets cold, or training pockets too early, a common route to serious finger tendon injury.',
    'Coaching insight: build finger strength on jugs, edges and open hand first; add pocket training only after years of healthy tendon loading.',
  ]},
  'Gaston': {icon:'gastonGrip', video:'climbing gaston technique tutorial', points:[
    'Setup: grip a vertical-ish edge with the thumb down and the elbow out, then push outward and away from your body.',
    'Execution: think of prying a door open from inside: shoulder and upper back drive the press, and the arm transmits force.',
    'Whole-body integration: a shoulder-and-back move, not a hand move; a collapsed chest or poor shoulder position makes it far harder.',
    'Common mistake: muscling it with the elbow tucked in, which removes the leverage that makes a gaston work.',
    'Coaching insight: it\'s shoulder-intensive, so the program\'s band rotations, retraction and face pulls directly support safer, stronger gastons.',
  ]},
  'Undercling': {icon:'underclingGrip', video:'climbing undercling technique tutorial', points:[
    'Setup: grip the hold from below, palm up, fingers curling over its underside.',
    'Execution: keep your weight low and feet high and close to your hands, pulling up and in against the hold.',
    'Whole-body integration: underclings depend on feet; low or distant feet put your center of gravity in the wrong place and the hold feels worse.',
    'Common mistake: reaching up from low feet and straight legs, pulling the hips away from the wall just when they need to stay close.',
    'Coaching insight: \'high feet, low hips\': get the feet up first, then commit to the pull.',
  ]},
  'Side Pull': {icon:'sidepullGrip', video:'climbing side pull technique tutorial', points:[
    'Setup: grip a vertical or near-vertical hold, pulling sideways back toward your body rather than down.',
    'Execution: pair it with opposing footwork, a flag or a foot pressed out wide, to create counter-tension that keeps you on the wall.',
    'Whole-body integration: without foot counter-pressure, a side pull spins you off the wall; hold and feet are one technique.',
    'Common mistake: pulling straight in without setting the opposing foot or flag, which usually means a barn-door swing off.',
    'Coaching insight: if a side pull feels impossible, check your feet and hips before blaming the grip.',
  ]},

  'Edging': {icon:'edgingFoot', video:'climbing edging footwork technique tutorial', points:[
    'Setup: place the inside or outside edge of the shoe precisely on a small foothold, using the shoe\'s stiff edge rather than the sole.',
    'Execution: weight straight down through that point and trust it fully, without shifting or re-testing the foot.',
    'Whole-body integration: it rewards Quiet Feet\'s precision and confidence; a committed foot holds far better than a tentative one.',
    'Common mistake: standing on the hold with the arch instead of the big toe or shoe edge, losing precision and push-off leverage.',
    'Coaching insight: stiffer shoes make edging easier for newer climbers; soft, aggressive shoes demand more foot strength.',
  ]},
  'Smearing': {icon:'smearingFoot', video:'climbing smearing footwork technique tutorial', points:[
    'Setup: press as much sole rubber as possible flat against featureless or low-angle rock rather than hunting for an edge.',
    'Execution: keep the heel low, often below the toes, to maximize rubber contact, and trust friction to hold the foot.',
    'Whole-body integration: keep your weight directly over the foot; leaning away, as with slopers, breaks friction and the foot slides.',
    'Common mistake: raising the heel to stand on the toe like an edge, shrinking the contact patch when you need it biggest.',
    'Coaching insight: climbers trust smears least so practice them least; seek out low-angle, featureless terrain to build trust.',
  ]},
  'Backstep & Drop Knee': {icon:'dropKnee', video:'climbing backstep drop knee technique tutorial', points:[
    'Setup: turn one hip into the wall and place that foot\'s outside edge on a hold: the backstep.',
    'Execution: drop that knee down and in toward the wall (the drop knee) to rotate the hip further, extending the opposite reach.',
    'Whole-body integration: a direct use of hip positioning, changing hip orientation to extend reach on steep or technical terrain.',
    'Common mistake: drop-kneeing with the hip still square, which limits rotation and creates awkward torque at the hip.',
    'Coaching insight: it\'s more about hip mobility than leg strength; hip mobility work helps as much as drilling.',
  ]},
  'Flagging': {icon:'flagging', video:'climbing flagging technique tutorial', points:[
    'Setup: extend one leg to the side, or behind the other, without placing it on any hold, purely as a counterbalance.',
    'Execution: the flag shifts your center of gravity back over your base, preventing the barn-door swing when reaching one-footed.',
    'Whole-body integration: often the missing piece that makes an impossible-feeling reach manageable, paired with side pulls and gastons.',
    'Common mistake: not flagging when reaching across your body, then fighting the instability with a harder grip.',
    'Coaching insight: try one reach with and without a flag on an easy route; the difference is immediate, a common \'aha\' moment.',
  ]},

  'Heel Hook': {icon:'heelHook', video:'climbing heel hook technique tutorial', points:[
    'Setup: hook your heel over a hold or feature, often above waist height on steep terrain, arêtes or roofs, instead of standing on it.',
    'Execution: actively pull with the hamstring, as if dragging the heel toward your glutes; a passive hook gives far less stability.',
    'Whole-body integration: a good heel hook is like a third arm, taking load off the hands, which is why it matters so much on overhangs.',
    'Common mistake: resting the heel passively without engaging the hamstring, so it pops off under load when you need it.',
    'Coaching insight: it loads the hamstring and hip in ways other training doesn\'t, so frequent heel-hookers benefit from hamstring work.',
  ]},
  'Toe Hook': {icon:'toeHook', video:'climbing toe hook technique tutorial', points:[
    'Setup: hook the top of your foot under a hold, feature or roof lip, usually to stop your body swinging away from the wall.',
    'Execution: actively pull the toes up and back toward the shin rather than leaving the foot passively caught.',
    'Whole-body integration: common on roofs and steep terrain as a counter-tension anchor against a reaching hand, like a heel hook.',
    'Common mistake: letting the toe hook passively catch you, which fails during a dynamic reach when tension peaks.',
    'Coaching insight: drilled less than heel hooks, but on roof-heavy terrain they often decide whether a move goes; seek out roofs.',
  ]},
  'Mantling': {icon:'mantling', video:'climbing mantle technique tutorial', points:[
    'Setup: from a ledge at chest-to-shoulder height, press down on it with one or both hands, like climbing out of a pool.',
    'Execution: as your arms straighten, get a foot onto the ledge or a nearby hold early, moving weight from arms to leg.',
    'Whole-body integration: mantling is a pressing movement, like a dip, unlike climbing\'s usual pulling, and catches strong pullers out.',
    'Common mistake: pressing all the way up on your arms without getting a foot up early, which often stalls at the hardest point.',
    'Coaching insight: general pressing work (push-ups, dips, shoulder press) pays off directly on mantle-heavy routes.',
  ]},
  'Stemming': {icon:'stemming', video:'climbing stemming technique tutorial', points:[
    'Setup: push hands and/or feet outward against two opposing surfaces at once, usually the walls of a corner or wide chimney.',
    'Execution: push the limbs apart into both surfaces; the opposing tension, not any single hold, creates the stability.',
    'Whole-body integration: once set, the legs bear most of the load, so stems often make genuine low-effort rests mid-route.',
    'Common mistake: standing upright and narrow instead of actively pushing the feet wide, which gives far less stability.',
    'Coaching insight: stemming relies on hip and adductor mobility, so mobility work directly improves it.',
  ]},
  'Dynamic Movement (Dyno)': {icon:'dyno', video:'climbing dyno technique tutorial', points:[
    'Setup: confirm the target is truly out of static reach even with good hips and flagging, so the dyno is needed, not a technique gap.',
    'Execution: build momentum with a coordinated leg push and arm pull, catching the target at the peak of that momentum.',
    'Whole-body integration: a full-body power move, closer to a jump than controlled climbing; the legs produce most of the force.',
    'Common mistake: muscling it with the arms, or dynoing before static movement is solid; dynamics amplify whatever positioning you have.',
    'Coaching insight: it benefits from explosive-power training, which is why programs build a strength base before dyno practice.',
  ]},
  'Rock-over': {icon:'rockover', video:'climbing rockover technique tutorial', points:[
    'Setup: with one foot on a high hold, shift your weight directly over that foot rather than pulling up with your arms.',
    'Execution: lead with the hips, rolling over the high foot until your center of gravity is above it, then stand up through that leg.',
    'Whole-body integration: a hip-driven, leg-powered move; pulling up and over with the arms makes a leg move an arm move.',
    'Common mistake: leaning away from the high foot instead of committing your weight over it, making the move far harder.',
    'Coaching insight: it shows climbing\'s core efficiency principle: let big leg muscles do work tired fingers and forearms would otherwise do.',
  ]},
};

const CLIMB_TECHNIQUE_GROUPS = {
  'Movement Fundamentals for New Climbers': {
    poses:['Three Points of Contact','Straight-Arm Resting (Skeletal Hang)','Hip Positioning & Wall Awareness','Quiet Feet & Precision Footwork'],
    note:'Start here — these four habits underlie every grip and technique below, and most plateaued climbers are missing one of these rather than lacking raw strength.',
  },
  'Hand Grips': {
    poses:['Crimp Grip (Full & Half Crimp)','Open Hand (Drag) Grip','Pinch Grip','Sloper','Pocket Grip','Gaston','Undercling','Side Pull'],
    note:'Every hold on the wall asks for one of these grip families — matching the grip to the hold shape, not defaulting to the same grip on everything, is a core technical skill in itself.',
  },
  'Footwork Techniques': {
    poses:['Edging','Smearing','Backstep & Drop Knee','Flagging'],
    note:'Footwork is where most of the sport\'s actual efficiency lives — strong footwork routinely lets weaker-fingered climbers outperform stronger-fingered ones who move sloppily.',
  },
  'Advanced Movement & Body Positioning': {
    poses:['Heel Hook','Toe Hook','Mantling','Stemming','Dynamic Movement (Dyno)','Rock-over'],
    note:'Techniques for specific terrain — roofs, corners, ledges, and reaches beyond static range — layered on top of the fundamentals and grips above.',
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
    'Setup: on your back, post on one hand and the opposite foot, the other leg free.',
    'Execution: push off the post to shoot your hips back and away, then immediately bring the near knee back in before repeating.',
    'Whole-body integration: creating space with the hips, then recovering, underlies almost every guard retention and escape.',
    'Common mistake: shrimping with the arms instead of hips and legs, or not recovering the knee, so the space closes again.',
    'Coaching insight: white belts over-rely on upper-body strength; this is usually the drill that teaches the hips are the engine.',
  ]},
  'Bridge & Roll (Upa Escape)': {icon:'bridgeRoll', video:'bjj upa bridge roll mount escape tutorial', points:[
    'Setup: from bottom mount, trap one arm and the same-side leg, and plant that foot close to your hip.',
    'Execution: bridge explosively over the trapped shoulder with hips and trapped-side leg together, rolling at the top of the bridge.',
    'Whole-body integration: the fundamental mount escape in every curriculum, because bottom mount is one of the worst positions to be stuck in.',
    'Common mistake: bridging without trapping the arm and leg first, so the top person simply posts out and rides it.',
    'Coaching insight: the bridge is a hip-and-leg movement, not an ab crunch; a torso-powered bridge rarely rolls a resisting opponent.',
  ]},
  'Technical Stand-up': {icon:'technicalStandup', video:'bjj technical stand up tutorial', points:[
    'Setup: on the ground, post one hand behind you and bring the opposite foot under your hips, other leg out front for base.',
    'Execution: stand through the posted hand and planted foot without ever turning your back on your opponent.',
    'Whole-body integration: the safe way to stand from the ground while still facing and defending against an opponent.',
    'Common mistake: turning and pushing up off the knees, taking eyes and hands off them exactly when they can attack.',
    'Coaching insight: it\'s drilled early because it connects ground grappling back to a safe neutral position, including in self-defense.',
  ]},
  'Frames & Guard Retention': {icon:'framesRetention', video:'bjj frames guard retention drill', points:[
    'Setup: on your back against a passer, use your arms as frames braced on their hips, biceps or legs rather than gripping.',
    'Execution: combine hip escapes and frames to keep re-centering your hips, re-establishing distance the instant guard is challenged.',
    'Whole-body integration: retention is trained on its own because its hip movement and framing are shared by nearly every guard.',
    'Common mistake: waiting until the guard is passed to react instead of treating the first inch of pressure as your cue.',
    'Coaching insight: frames use bone structure, not arm strength, so a smaller grappler can stall a much stronger passer.',
  ]},
  'Knee Slice Pass': {icon:'kneeSlicePass', video:'bjj knee slice pass technique tutorial', points:[
    'Setup: control their far hip or leg with your hands to stop re-guarding, then line up a knee toward their center line.',
    'Execution: slide that knee through past their hip and thigh, posture heavy and weight pressing down through the sliding knee.',
    'Whole-body integration: a fundamental modern pass because pressure plus a small target area make it hard to frame against.',
    'Common mistake: passing with a light or upright base, giving their frames and hip escapes room to reset guard.',
    'Coaching insight: often the first pressure pass taught; a slow, heavy knee slice usually beats a fast, light one.',
  ]},
  'Torreando (Bullfighter) Pass': {icon:'torreandoPass', video:'bjj torreando bullfighter pass technique tutorial', points:[
    'Setup: control both ankles or lower legs from standing or kneeling in front of them.',
    'Execution: push their legs one way as your hips go the other, then drop into side control the instant the legs clear.',
    'Whole-body integration: usually the first pass beginners learn, because the mechanic is so clear: redirect the legs, attack the opening.',
    'Common mistake: redirecting the legs then pausing before committing, giving them time to recover guard.',
    'Coaching insight: a slow torreando gives them time to recover; decisiveness in the last step matters more than grip strength.',
  ]},
  'Stack Pass': {icon:'stackPass', video:'bjj stack pass technique tutorial', points:[
    'Setup: inside their guard, gather legs and hips and drive your weight forward and down, folding their hips toward their head.',
    'Execution: keep forward pressure through your shoulders while circling around the stacked legs to clear them, not yanking a leg free.',
    'Whole-body integration: stacking uses gravity and bodyweight, a common pass when you have a weight or pressure advantage over a flexible guard.',
    'Common mistake: losing forward pressure mid-pass, letting their hips settle before the legs are cleared.',
    'Coaching insight: very flexible players absorb the stack, so pair it with a hip-clearing step to finish.',
  ]},
  'Combat Base & Posture': {icon:'combatBase', video:'bjj combat base passing posture tutorial', points:[
    'Setup: kneeling or crouched to pass, one knee up and one down, hips low and weight centered over your base.',
    'Execution: have a partner push and pull you off balance and reset straight back into this base, without standing tall or squaring up.',
    'Whole-body integration: every guard pass is built on a stable combat base; without it, even correct passing falls apart.',
    'Common mistake: squaring the hips flat to them, leaving no post to recover to, unlike a staggered base with a knee ready to plant.',
    'Coaching insight: drill it under resistance; a base that only works when nobody\'s pushing doesn\'t solve the problem.',
  ]},
  'Mount Control & Maintenance': {icon:'mountControl', video:'bjj mount control maintenance tutorial', points:[
    'Setup: in top mount, sit with your weight centered on their torso, knees tucked tight rather than high and light.',
    'Execution: when they bridge or shift, ride it by posting a hand or foot and resettling your weight instead of getting launched.',
    'Whole-body integration: mount is held under resistance before submissions; being hard to unseat is the skill.',
    'Common mistake: posting the hands far forward on the mat, exactly what a well-timed bridge and roll exploits.',
    'Coaching insight: low, heavy knees beat a high, light seat; the higher you sit, the easier the bridge gap.',
  ]},
  'Side Control Maintenance': {icon:'sideControl', video:'bjj side control maintenance tutorial', points:[
    'Setup: chest to chest across their torso, weight heavy through your chest rather than propped on your arms.',
    'Execution: as they shrimp, frame or bridge, follow their hips with yours to stay heavy and centered rather than freezing.',
    'Whole-body integration: often the most stable top pin, because it takes away both guard and legs as tools.',
    'Common mistake: basing up on your hands to watch for escapes, which lightens the pin and gives frames something to push.',
    'Coaching insight: a heavy side control that tracks the hips is usually harder to escape than a stronger, static one.',
  ]},
  'Back Control & Hooks': {icon:'backControl', video:'bjj back control hooks technique tutorial', points:[
    'Setup: on their back with both hooks inside their thighs and a seatbelt grip: one arm over the shoulder, one under the armpit.',
    'Execution: stay glued through their movement, adjusting hooks and seatbelt together so a shift in one brings the other.',
    'Whole-body integration: often considered the most dominant position: strong submission access, almost no offense for them.',
    'Common mistake: crossing your feet instead of hooking the thighs; crossed feet invite a well-known ankle-lock counter.',
    'Coaching insight: the seatbelt usually breaks before the hooks, so re-securing the arms matters most moment to moment.',
  ]},
  'Knee-on-Belly': {icon:'kneeOnBelly', video:'bjj knee on belly technique tutorial', points:[
    'Setup: from side control, plant one knee on their stomach or lower chest, the other leg extended for base and mobility.',
    'Execution: sink weight through the planted knee and use the free leg to hop and adjust as they turn or bridge.',
    'Whole-body integration: it trades some stability for much better submission and transition access, as the free leg moves fast.',
    'Common mistake: staying static and flat-footed instead of using the free leg\'s mobility, the whole point of the position.',
    'Coaching insight: it\'s as much psychological as physical; the discomfort often provokes a panicked, exploitable reaction.',
  ]},
  'Rear Naked Choke': {icon:'rearNakedChoke', video:'bjj rear naked choke drill technique', points:[
    'Setup: from back control, thread one arm under the chin and lock a figure-four, hand behind their head or on your own bicep.',
    'Execution: finish by closing the choking elbow and expanding your chest, not cranking the neck side to side.',
    'Whole-body integration: taking the back is usually harder than the choke; drilling the finish from a secured back makes it automatic.',
    'Common mistake: squeezing before the arm is deep enough under the chin, letting them tuck and defend.',
    'Coaching insight: chest expansion and a closing elbow win it, not curling arms; treat it as a hug, not a pull.',
  ]},
  'Armbar from Guard': {icon:'armbarGuard', video:'bjj armbar from guard drill technique', points:[
    'Setup: from closed guard, control one wrist and swivel your hips to bring a leg over their head, trapping the arm between your thighs.',
    'Execution: keep their thumb pointing up and lift your hips while pulling the wrist down, rather than yanking with your hands.',
    'Whole-body integration: this isolates hip movement and arm control; most failed armbars skip them for the finish.',
    'Common mistake: the elbow drifting off center during the swivel, giving them room to stack or pull the arm out.',
    'Coaching insight: hip extension creates the finishing pressure, which works even against much larger partners.',
  ]},
  'Triangle Choke': {icon:'triangleChoke', video:'bjj triangle choke drill technique', points:[
    'Setup: from guard, pull one of their arms across your body as one leg comes up and over the same-side shoulder.',
    'Execution: lock by hooking that leg behind your opposite knee, then angle off so their shoulder and your thigh close both sides of the neck.',
    'Whole-body integration: finish by pulling their head down and extending your hips, not squeezing your knees; angle beats leg strength.',
    'Common mistake: locking it flat in front of them instead of rotating to a steeper angle, which is usually why it won\'t finish.',
    'Coaching insight: correcting the angle after the lock creates most of the finish, not squeezing harder.',
  ]},
  'Kimura': {icon:'kimura', video:'bjj kimura shoulder lock drill technique', points:[
    'Setup: control one wrist, bend their elbow to about 90°, and reach under their arm to grip your own wrist in a figure-four.',
    'Execution: rotate the trapped arm behind their back by lifting the wrist, using the figure-four as a lever, not pulling with the arms.',
    'Whole-body integration: it\'s trained from guard, side control and back, since the shoulder rotation is the same from every position.',
    'Common mistake: cranking before the grip and elbow angle are secured, telegraphing it and giving them time to defend.',
    'Coaching insight: it\'s a strong control and transition tool even when it doesn\'t finish, taught as much for what it opens up.',
  ]},
  'Double Leg Takedown': {icon:'doubleLegTakedown', video:'bjj double leg takedown technique tutorial', points:[
    'Setup: level change by bending the knees, not the waist, dropping your hips below theirs as you close distance.',
    'Execution: drive through both legs with your shoulder, wrap them, and drive forward with your legs rather than lifting with your back.',
    'Whole-body integration: the level change and drive are one connected motion; shooting from upright loses the leverage.',
    'Common mistake: bending at the waist to reach for the legs, putting your head down and out of position.',
    'Coaching insight: keeping your head up and to the side lets the takedown convert cleanly to top position instead of a scramble.',
  ]},
  'Closed Guard Pull': {icon:'closedGuardPull', video:'bjj guard pull technique tutorial', points:[
    'Setup: from a standing grip exchange, sit back toward the ground while pulling their sleeve or collar toward you.',
    'Execution: wrap your legs around their hips as you sit, arriving in closed guard rather than flat on your back.',
    'Whole-body integration: pulling guard is a strategic choice for bottom players, common where takedowns aren\'t the main route.',
    'Common mistake: sitting down without a grip or without bringing the legs up, giving up top position for nothing.',
    'Coaching insight: secure the grip and close the legs in the same motion as the sit; it\'s one connected action.',
  ]},
  'Sprawl (Takedown Defense)': {icon:'sprawl', video:'bjj sprawl takedown defense technique tutorial', points:[
    'Setup: as they shoot, react immediately by driving your hips back and down, not backing away or standing tall.',
    'Execution: thrust your legs back explosively and drop hips and chest onto their shoulders, head up and posture forward.',
    'Whole-body integration: hips back, legs extending and upper body dropping all happen together, not step by step.',
    'Common mistake: sprawling with your head down and chest collapsed, losing the defensive position.',
    'Coaching insight: shots come with little warning, so the sprawl must become a reflex through repetition.',
  ]},
};

const GRAPPLE_TECHNIQUE_GROUPS = {
  'Fundamentals: Base, Frames & Escapes': {
    poses:['Hip Escape (Shrimping)','Bridge & Roll (Upa Escape)','Technical Stand-up','Frames & Guard Retention'],
    note:'Start here — hip mobility, framing, and a safe path back to your feet underlie every position and submission below. Skipping ahead to submissions without these is the most common beginner mistake in the sport.',
  },
  'Guard Passing': {
    poses:['Knee Slice Pass','Torreando (Bullfighter) Pass','Stack Pass','Combat Base & Posture'],
    note:'Passing the guard is often considered the technical core of BJJ — these four cover the main families of guard-passing pressure and movement.',
  },
  'Dominant Positions & Control': {
    poses:['Mount Control & Maintenance','Side Control Maintenance','Back Control & Hooks','Knee-on-Belly'],
    note:'Holding a position under a resisting opponent is a skill in its own right, trained separately from any submission attempted from it.',
  },
  'Submissions': {
    poses:['Rear Naked Choke','Armbar from Guard','Triangle Choke','Kimura'],
    note:'All four rely on the control positions above being secured first — a submission attempted from a weak position is usually lost along with the position itself.',
  },
  'Takedowns & Entries': {
    poses:['Double Leg Takedown','Closed Guard Pull','Sprawl (Takedown Defense)'],
    note:'Getting the fight to the ground (or safely staying off it) on your own terms, rather than ending up there without a plan.',
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
  'Breath & Core Foundation': {
    poses:['Pilates Breathing (Lateral/Ribcage)','Neutral Spine & Pelvis','Powerhouse Engagement (Core Activation)','Scapular Stabilization'],
    note:'The four things underneath every single exercise in this method — get these right and the actual mat sequence below becomes dramatically more effective; skip them and even perfect-looking reps train the wrong pattern.',
  },
  'Foundational Mat Sequence': {
    poses:['The Hundred','Roll-Up','Single Leg Circles','Rolling Like a Ball'],
    note:'The classical opening sequence of the mat method — each exercise builds directly on the core control established in the one before it.',
  },
  'Spinal Articulation & Control': {
    poses:['Spine Stretch Forward','Saw','Swan','Spine Twist'],
    note:'Where the method moves from foundational control into moving the spine itself through its full range, one segment at a time, rather than as one rigid block.',
  },
  'Integration & Balance Work': {
    poses:['Teaser','Criss-Cross','Side-Lying Leg Series','Standing & Balance Control'],
    note:'Where everything above gets combined into more complex, whole-body coordination — these exercises are genuinely harder specifically because they demand several of the earlier skills working together at once.',
  },
};

const PILATES_TECHNIQUE_DETAILS = {
  'Pilates Breathing (Lateral/Ribcage)': {points:[
    'Setup: sit or lie comfortably with your hands on the sides of your ribcage to feel the breath.',
    'Execution: inhale through the nose, widening the ribs sideways and back, then exhale fully through the mouth, drawing the deep abdominals in and up.',
    'Whole-body integration: rib breathing keeps the deep core engaged even while inhaling; belly breathing releases that tension on every breath.',
    'Common mistake: shallow chest breaths, or belly breathing that lets the core go, both undermining the method\'s constant tension.',
    'Coaching insight: one of Joseph Pilates\' founding principles, because belly breathing and continuous core bracing are hard to do together; this solves it.',
  ]},
  'Neutral Spine & Pelvis': {points:[
    'Setup: lie on your back, knees bent, feet flat, keeping the lower back\'s gentle natural curve rather than flattening or arching it.',
    'Execution: find a level pelvis with that small curve in the lower back, then hold exactly that position as your arms and legs move.',
    'Whole-body integration: neutral spine is the reference for nearly every exercise; losing it is usually the first sign the deep core isn\'t in control.',
    'Common mistake: tucking the pelvis to press the back flat and calling it core engagement; it\'s a different, less useful position.',
    'Coaching insight: flat versus gently curved is subtle, so a teacher\'s hand check or mirror helps early on, even for experienced students.',
  ]},
  'Powerhouse Engagement (Core Activation)': {points:[
    'Setup: in any position, gently draw the navel toward the spine while keeping lateral breathing, without holding your breath.',
    'Execution: hold that gentle engagement through the whole exercise — breath, movement and return — rather than releasing between reps.',
    'Whole-body integration: the \'powerhouse\' is the deep abs, low back, hips and glutes working as one, a different target from typical ab work.',
    'Common mistake: bracing hard then releasing between reps, which turns continuous control into disconnected efforts.',
    'Coaching insight: continuous engagement is why Pilates feels demanding with little or no weight: the core holding constant tension is the resistance.',
  ]},
  'Scapular Stabilization': {points:[
    'Setup: in any arm or upper-body position, start with the shoulder blades gently drawn down and slightly back, away from the ears.',
    'Execution: keep that stable shoulder position throughout, rather than letting the shoulders creep up as the exercise gets harder.',
    'Whole-body integration: the same scapular control as Strength Fundamentals\' pressing group: it protects the shoulder and stops the upper traps compensating.',
    'Common mistake: shoulders riding up toward the ears in hard moments, like the Hundred or the Teaser\'s reach, usually without noticing.',
    'Coaching insight: \'shoulders away from your ears\' is cued all class long because the compensation is common and easy to lose track of.',
  ]},
  'The Hundred': {points:[
    'Setup: on your back, knees in tabletop or legs extended low, head and shoulders lifted, arms long beside the body.',
    'Execution: pump the arms in small, controlled beats, breathing in for five and out for five, for 100 pumps, holding neutral spine and core.',
    'Whole-body integration: it opens the mat sequence because it demands breath, neutral spine and core engagement all at once from the first move.',
    'Common mistake: the lower back arching off the mat as the legs lower; raise the legs or bend the knees rather than powering through.',
    'Coaching insight: leg height scales difficulty; choosing the right height for your core matters more than reaching 100 pumps in a bad position.',
  ]},
  'Roll-Up': {points:[
    'Setup: lie flat, legs extended, arms reaching overhead, ready to curl up one vertebra at a time.',
    'Execution: exhale and peel head, shoulders, then upper back off the mat, reach toward the toes, then reverse the sequence with control.',
    'Whole-body integration: it trains the segmental spinal control (one vertebra at a time) that the whole Spinal Articulation group builds on.',
    'Common mistake: swinging up with momentum instead of articulating through the spine, which looks similar but trains almost nothing.',
    'Coaching insight: bent knees or a strap around the feet are standard modifications; controlled segmental movement matters more than the full version.',
  ]},
  'Single Leg Circles': {points:[
    'Setup: on your back, one leg toward the ceiling, the other flat, hips level and still.',
    'Execution: circle the raised leg small enough that the opposite hip never rocks or lifts, then reverse after a set number.',
    'Whole-body integration: it tests whether the powerhouse can stabilize the pelvis while one limb moves, a harder skill that carries to single-leg stability.',
    'Common mistake: circles too big, which is almost always what rocks the hips; small and stable shows more skill.',
    'Coaching insight: when the hips start rocking, shrink the circle; it works far better than fighting the rocking at full size.',
  ]},
  'Rolling Like a Ball': {points:[
    'Setup: sit with knees to chest, balanced just behind the sit bones in a rounded C-curve, hands lightly on shins or ankles.',
    'Execution: roll back onto the upper back (never the neck), then roll up to balance using deep core control, not swinging arms or head.',
    'Whole-body integration: it trains balance and control in a rounded spine, adding a momentum challenge to the Roll-Up\'s spinal awareness.',
    'Common mistake: rolling onto the neck instead of stopping on the upper back and shoulders, a safety issue to correct immediately.',
    'Coaching insight: a quick, honest core check: relying on momentum to come back up shows immediately.',
  ]},
  'Spine Stretch Forward': {points:[
    'Setup: sit tall, legs slightly wider than hips, feet flexed, arms forward at shoulder height.',
    'Execution: exhale and round forward one segment at a time, as if over a large ball, then restack the same way back to tall sitting.',
    'Whole-body integration: the Roll-Up\'s segmental articulation, seated, to refine it without the full supine movement.',
    'Common mistake: hinging from the hips with a flat spine instead of curving through each segment; it looks similar but trains something else.',
    'Coaching insight: imagining curving up and over a large ball cues segment-by-segment rounding rather than a rigid-backed hinge.',
  ]},
  'Saw': {points:[
    'Setup: sit tall, legs wider than hips, arms out at shoulder height, spine long.',
    'Execution: rotate toward one leg and reach the opposite hand toward its little toe in a sawing motion, hips square and grounded.',
    'Whole-body integration: it adds rotation to Spine Stretch Forward\'s flexion; most people find clean rotation harder than straight flexion.',
    'Common mistake: letting the hips turn with the torso instead of isolating rotation in the spine, a very common compensation.',
    'Coaching insight: keep a hand or your attention on your hips; rotation creeps into them gradually and goes unnoticed.',
  ]},
  'Swan': {points:[
    'Setup: lie face down, hands under the shoulders, legs long and together, ready to lift with the back, not the arms.',
    'Execution: lengthen the spine and lift chest and head with your back muscles, using the arms only lightly for support.',
    'Whole-body integration: the main spinal extension exercise, balancing the flexion-heavy work; flexion alone trains the spine one-sidedly.',
    'Common mistake: pushing up mainly with the arms, like a cobra or push-up, which trains a different pattern.',
    'Coaching insight: often shortened for sensitive lower backs; back strength matters more than lift height, and going too high shifts load to the arms.',
  ]},
  'Spine Twist': {points:[
    'Setup: sit tall, legs long and together or cross-legged, arms out at shoulder height.',
    'Execution: rotate to one side in small, controlled pulses at end range, hips square, then return to center and repeat the other way.',
    'Whole-body integration: pure seated rotation without the Saw\'s reach, a more direct test of rotational control.',
    'Common mistake: turning the shoulders and arms while the spine barely moves; it looks like rotation but isn\'t.',
    'Coaching insight: the end-range pulses are deliberate, working the deep rotators through their real range instead of just holding a twist.',
  ]},
  'Teaser': {points:[
    'Setup: on your back, ready to lift upper body and legs together into a balanced V, arms reaching toward the toes.',
    'Execution: roll up through the spine while lifting the legs into a balanced V, back straight or gently rounded, then lower with the same control.',
    'Whole-body integration: one of the hardest mat exercises, combining the Roll-Up\'s spinal control, the Hundred\'s core strength, and balance.',
    'Common mistake: trying the full version before segmental roll-up control and core-supported leg lifts are solid.',
    'Coaching insight: bent-knee or single-leg versions are legitimate progressions; most teachers treat the full Teaser as earned, not a starting point.',
  ]},
  'Criss-Cross': {points:[
    'Setup: on your back, hands lightly behind the head, knees in tabletop, elbows wide.',
    'Execution: rotate one elbow toward the opposite knee as the other leg extends, alternating with control, the twist coming from the torso.',
    'Whole-body integration: it adds rotation to the Hundred\'s core flexion, working the obliques that stabilize everyday rotation.',
    'Common mistake: pulling on the head to force the twist instead of letting the obliques do it; hands support the head, nothing more.',
    'Coaching insight: \'hands are a hammock, not a handle\': neck strain from pulling is one of the commonest ab-exercise errors.',
  ]},
  'Side-Lying Leg Series': {points:[
    'Setup: lie on one side in a straight line, bottom arm supporting the head, top hand on the mat for balance.',
    'Execution: lift and lower the top leg with control, hips stacked and still, through front, side and rear variations.',
    'Whole-body integration: it targets the hip stabilizers (especially glute medius) that keep the pelvis level when walking and running.',
    'Common mistake: letting the leg drift forward of the body line for more range, which takes work off the stabilizers.',
    'Coaching insight: a straight body line matters more than leg height; a smaller, aligned lift trains the right muscles.',
  ]},
  'Standing & Balance Control': {points:[
    'Setup: stand tall in neutral spine, weight even, core gently engaged, ready to challenge balance upright.',
    'Execution: add single-leg stances, weight shifts or slow limb movements, applying the mat\'s core and posture principles standing up.',
    'Whole-body integration: this is where mat work carries into everyday movement; the control built lying down is meant to transfer upright.',
    'Common mistake: dropping the mat principles once standing, as if balance work were a separate skill.',
    'Coaching insight: Joseph Pilates designed \'Contrology\' to improve everyday movement, not just mat performance; standing work shows that most directly.',
  ]},
};

const YOGA_TECHNIQUE_GROUPS = {
  'Standing Pose Foundations': {
    poses:['Mountain Pose (Tadasana) Alignment','Warrior II Alignment','Triangle Pose Alignment','Tree Pose Balance'],
    note:'Nearly every standing pose in a yoga practice is a variation on the alignment principles established here — get these right and most of the rest of the standing sequence follows naturally.',
  },
  'Core & Breath Integration': {
    poses:['Ujjayi Breath (Ocean Breath)','Bandhas (Core Locks) Basics','Plank & Chaturanga Transition','Boat Pose Core Engagement'],
    note:'The breath and core-engagement techniques that run underneath the entire practice, not just the poses that look core-focused from the outside.',
  },
  'Forward Folds & Backbends': {
    poses:['Seated Forward Fold Technique','Downward Dog Alignment','Bridge Pose Technique','Cobra vs. Upward Dog Distinction'],
    note:'Spinal flexion and extension, balanced against each other — a practice heavy on one without the other trains the spine asymmetrically, the same principle covered in Pilates\' Swan technique.',
  },
  'Twists, Balance & Inversion Prep': {
    poses:['Seated Spinal Twist Technique','Half Moon Pose Balance','Shoulder Stand Prep & Safety','Savasana (Final Relaxation) Technique'],
    note:'The more advanced end of a mat practice — genuine balance and inversion work, plus the often-skipped final relaxation that\'s actually part of the technique, not just a nice-to-have at the end.',
  },
};

const YOGA_TECHNIQUE_DETAILS = {
  'Mountain Pose (Tadasana) Alignment': {points:[
    'Setup: stand with feet together or hip-width, weight even across all four corners of both feet.',
    'Execution: stack ankles, knees, hips and shoulders, crown reaching up; engage the legs without locking the knees, arms resting naturally.',
    'Whole-body integration: it looks like just standing, but every standing pose returns to it; good alignment here makes the rest easier to align.',
    'Common mistake: locking the knees and flaring the ribs, which tips the pelvis and exaggerates the lower-back curve in every pose that follows.',
    'Coaching insight: students rush past it as \'not a real pose\', but poor alignment here quietly undermines the whole standing sequence.',
  ]},
  'Warrior II Alignment': {points:[
    'Setup: feet wide, front foot forward, back foot roughly parallel to the back of the mat, hips facing the side.',
    'Execution: bend the front knee over the ankle, not caving past the big toe; back leg straight, arms parallel, gaze over the front hand.',
    'Whole-body integration: knee over ankle is the same tracking principle as the squat in Strength Fundamentals; the joint logic is identical.',
    'Common mistake: the front knee collapsing inward past the ankle, stressing the knee unevenly; correct it as you would in a squat.',
    'Coaching insight: keep the hips facing the side; squaring them toward the front foot reduces the pose\'s hip opening.',
  ]},
  'Triangle Pose Alignment': {points:[
    'Setup: feet wide as in Warrior II, front foot forward, back foot turned in slightly, both legs straight.',
    'Execution: hinge at the front hip, not the waist, front hand to shin, ankle or floor, top arm up, chest opening sideways.',
    'Whole-body integration: it starts from the same hip hinge as the deadlift group; the body doesn\'t distinguish yoga hinges from strength hinges.',
    'Common mistake: reaching for the floor beyond your flexibility, rounding the lower back; a block or your shin is a fine substitute.',
    'Coaching insight: a block under the bottom hand keeps the hinge aligned at any flexibility rather than trading alignment for depth.',
  ]},
  'Tree Pose Balance': {points:[
    'Setup: start in Mountain Pose and shift your weight fully onto one leg before the other foot leaves the ground.',
    'Execution: place the lifted sole on the inner calf or inner thigh, never on the knee, hips forward, hands at heart or overhead once stable.',
    'Whole-body integration: like Pilates\' Single Leg Circles, it tests whether the standing leg and hips can stabilize on their own.',
    'Common mistake: pressing the foot into the side of the knee, which isn\'t built for sideways load; go above or below, never on it.',
    'Coaching insight: fixing your gaze on one still point (drishti) is one of the most effective balance tools; vision directly affects stability.',
  ]},
  'Ujjayi Breath (Ocean Breath)': {points:[
    'Setup: sit or stand comfortably, mouth closed, breathing through the nose only.',
    'Execution: gently narrow the back of your throat, like fogging a mirror mouth-closed, for a soft ocean sound on each slow breath.',
    'Whole-body integration: it\'s kept up through the whole practice, not just seated breathing: Pilates\' continuous engagement through a different mechanism.',
    'Common mistake: constricting so hard the breath strains or sounds harsh; it should be soft enough to keep up all practice.',
    'Coaching insight: it does two jobs: slightly resisting airflow to pace the breath, and giving the mind a steady sound to focus on.',
  ]},
  'Bandhas (Core Locks) Basics': {points:[
    'Setup: sit comfortably with a settled Ujjayi breath, ready to add a gentle internal engagement, not a big squeeze.',
    'Execution: for Mula Bandha, gently draw up the pelvic floor; for Uddiyana, draw the lower belly in and up on the exhale. Subtle, not clenched.',
    'Whole-body integration: they serve much like the Pilates powerhouse, a low-level core and pelvic floor activation supporting the spine.',
    'Common mistake: engaging so hard that normal breathing gets difficult; the locks sit quietly under breath and movement.',
    'Coaching insight: they\'re introduced only once Ujjayi is comfortable; layering them on an effortful breath creates tension instead of support.',
  ]},
  'Plank & Chaturanga Transition': {points:[
    'Setup: from plank, shoulders over wrists, body in one straight line from head to heels, core engaged.',
    'Execution: lower with control, elbows tracking back by the ribs, stopping at or above 90°, body in one line without hips or chest dropping first.',
    'Whole-body integration: it overlaps with a controlled push-up negative, so push-up eccentric strength gives you a head start.',
    'Common mistake: hips sagging or shoulders diving below elbow height, a common, cumulative source of shoulder irritation in yoga.',
    'Coaching insight: lowering from the knees is a legitimate option many experienced practitioners choose on tired days rather than losing shoulder alignment.',
  ]},
  'Boat Pose Core Engagement': {points:[
    'Setup: sit with knees bent, feet flat, hands lightly behind the thighs.',
    'Execution: lean back slightly and lift the chest with a long spine, then lift the feet and straighten the legs only as core control allows.',
    'Whole-body integration: it mirrors the Pilates Hundred: can the deep core support the spine against upper body and legs together?',
    'Common mistake: rounding the lower back to get straighter legs and hands off the floor before the core is strong enough.',
    'Coaching insight: hands on the floor or thighs is a real modification, not an incomplete pose; a long, supported spine beats a rounded one.',
  ]},
  'Seated Forward Fold Technique': {points:[
    'Setup: sit with legs extended, spine tall, feet flexed.',
    'Execution: hinge from the hips, chest leading rather than the head, only as far as the hips allow before the lower back rounds.',
    'Whole-body integration: the seated version of Triangle\'s and the hinge group\'s hip-hinge and hamstring mechanics.',
    'Common mistake: rounding the whole spine to bring your head down, shifting the stretch to the lower back; bend your knees instead.',
    'Coaching insight: a strap around the feet keeps the arms long and the spine straight at any hamstring flexibility.',
  ]},
  'Downward Dog Alignment': {points:[
    'Setup: hands shoulder-width, feet hip-width, starting from hands and knees before lifting the hips up and back.',
    'Execution: press through the hands and lift the hips up and back, bending your knees as needed to keep the spine long.',
    'Whole-body integration: spine length beats straight legs; the pose works shoulders, spine and hamstrings together, not leg flexibility.',
    'Common mistake: forcing straight legs too early, rounding the lower back and taking work from the shoulders and core.',
    'Coaching insight: \'bent knees, long spine\' is repeated across traditions because straight-leg dog is where back rounding sneaks in.',
  ]},
  'Bridge Pose Technique': {points:[
    'Setup: on your back, knees bent, feet flat and hip-width, arms along the body.',
    'Execution: press through the feet to lift the hips with glutes and hamstrings, not the lower back, knees tracking forward rather than splaying.',
    'Whole-body integration: the same glute-driven hip extension as the squat and hinge groups; \'drive through the glutes, not the lower back\' applies to both.',
    'Common mistake: lifting mainly with the lower back, which can pinch there instead of opening the front of the hips.',
    'Coaching insight: squeezing a block between the knees cues the glutes and stops the knees splaying, both at once.',
  ]},
  'Cobra vs. Upward Dog Distinction': {points:[
    'Setup: lie face down, hands under or slightly ahead of the shoulders, ready to lift with back extension.',
    'Execution: in Cobra, pelvis and thighs stay down and the back lifts you; in Upward Dog, straight arms lift hips and thighs off the floor.',
    'Whole-body integration: two different poses, not easy and hard versions: Cobra is back strength with support; Upward Dog adds shoulder and core stability.',
    'Common mistake: treating Upward Dog as Cobra pushed higher, pressing with the arms without the back and core engagement that support it.',
    'Coaching insight: many flows let you choose Cobra or Upward Dog based on that day\'s back strength and shoulder stability; both are legitimate.',
  ]},
  'Seated Spinal Twist Technique': {points:[
    'Setup: sit with legs extended or one crossed over, spine tall before any rotation.',
    'Execution: lengthen first, then rotate from the base of the spine up through the chest, head last, the back hand giving gentle leverage only.',
    'Whole-body integration: \'lengthen, then rotate\' applies to almost every seated twist, yoga or Pilates; rotating a compressed spine is less effective and riskier.',
    'Common mistake: yanking with the arm before the spine has lengthened and turned, which forces the rotation into the lower back.',
    'Coaching insight: \'inhale to lengthen, exhale to twist\' builds the lengthen-before-rotate habit without thinking about it.',
  ]},
  'Half Moon Pose Balance': {points:[
    'Setup: usually entered from Triangle, shifting weight fully onto the front leg before the back leg lifts.',
    'Execution: extend the lifted leg back at hip height, bottom hand on a block or the floor, chest and top arm opening up, hips stacked.',
    'Whole-body integration: it combines Tree\'s standing-leg stability with Triangle\'s hinge, a demanding combination pose like Pilates\' Teaser.',
    'Common mistake: skipping the block, forcing a compromise in standing-leg alignment or hip position just to reach the floor.',
    'Coaching insight: experienced teachers treat the block as standard, not a beginner aid; advanced practitioners use it to keep alignment clean.',
  ]},
  'Shoulder Stand Prep & Safety': {points:[
    'Setup: on your back, build shoulder, neck and core strength with preparatory poses like Bridge and leg lifts before any full inversion.',
    'Execution: if progressing, support your lower back with your hands, weight on shoulders and upper arms, not the neck, and never turn your head.',
    'Whole-body integration: one of the riskier poses because the neck is vulnerable bearing weight here; prepare as carefully as for advanced lifting.',
    'Common mistake: inverting before building the supporting strength, or turning the head while inverted, which puts avoidable risk on the neck.',
    'Coaching insight: many trainings now de-emphasize full shoulder stands for neck safety, using Legs-Up-The-Wall instead; that\'s a safety choice, not lost content.',
  ]},
  'Savasana (Final Relaxation) Technique': {points:[
    'Setup: lie flat on your back, legs relaxed and slightly apart, arms at your sides with palms up, eyes closed.',
    'Execution: release tension from the feet up, let the breath find its natural rhythm, and stay still for a real rest, not a quick minute.',
    'Whole-body integration: this is where the nervous system shifts from active to recovery and the practice settles in; skipping it skips part of the technique.',
    'Common mistake: treating it as optional when short on time, though tradition counts it among the most important poses.',
    'Coaching insight: teachers protect its time because relaxation needs unhurried minutes to take effect; a rushed 30 seconds doesn\'t do the same.',
  ]},
};

const CALISTHENICS_TECHNIQUE_GROUPS = {
  'Push Progressions': {
    poses:['Push-up Progression Fundamentals','Dip Technique & Progression','Pike Push-up to Handstand Push-up Path','Planche Lean Progression'],
    note:'Pushing strength built entirely through leverage and body positioning rather than added weight — the progression itself is the training variable.',
  },
  'Pull Progressions': {
    poses:['Pull-up/Chin-up Progression Fundamentals','Row Progression (Ring/Bar Rows)','Front Lever Progression Path','Muscle-Up Technique & Prerequisites'],
    note:'The most strength-demanding group in calisthenics — pulling your own bodyweight has no machine to lean on, which is exactly why the progressions matter so much here.',
  },
  'Core & Static Holds': {
    poses:['L-Sit Progression','Hollow Body Position','Handstand Balance Fundamentals','Human Flag Progression'],
    note:'Static holds that build the exact full-body tension and control everything else in this card depends on — most calisthenics skills fall apart from a weak hold position, not weak muscles.',
  },
  'Leg & Locomotion Skills': {
    poses:['Pistol Squat Progression','Broad Jump & Landing Technique','Animal Flow Transitions','Skin-the-Cat & Shoulder Prep'],
    note:'The lower-body and full-body movement skills that round out a calisthenics practice beyond just upper-body pushing and pulling strength.',
  },
};

const CALISTHENICS_TECHNIQUE_DETAILS = {
  'Push-up Progression Fundamentals': {points:[
    'Setup: hands slightly wider than shoulders, body straight from head to heels, core and glutes braced before the first rep.',
    'Execution: lower until your chest nearly touches, elbows about 45° from the torso, not flared, then press up keeping the line.',
    'Whole-body integration: the same elbow principle as the bench press; flared elbows put the shoulder in the same less stable position.',
    'Common mistake: hips sagging or piking to make reps easier, breaking the straight line and taking work from core and glutes.',
    'Coaching insight: progress by hand height or body angle (incline, decline, feet up) before adding weight; the pattern must be solid first.',
  ]},
  'Dip Technique & Progression': {points:[
    'Setup: support on parallel bars or rings, arms locked, shoulders down away from the ears.',
    'Execution: lower under control until shoulders reach elbow height (deeper adds shoulder strain without much benefit), then press to lockout.',
    'Whole-body integration: dip depth and shoulder stability feed the muscle-up; uncontrolled dips are a gap to close first.',
    'Common mistake: sinking well past shoulder comfort for more range, a common route to impingement over time.',
    'Coaching insight: ring dips are a real step up, as instability demands shoulder-stabilizer strength on top of pressing strength.',
  ]},
  'Pike Push-up to Handstand Push-up Path': {points:[
    'Setup: start in a pike, hips high in an inverted V, putting more bodyweight on the shoulders than a push-up.',
    'Execution: lower your head between your hands with control and press up, raising the feet onto a box over time toward vertical.',
    'Whole-body integration: it builds vertical pressing strength before any handstand push-up; skipping it brings frustration and neck strain.',
    'Common mistake: raising the feet before you control the current height, shown by the head crashing down instead of lowering.',
    'Coaching insight: the position scales difficulty, so mastering control at each step matters more than reaching the hardest version.',
  ]},
  'Planche Lean Progression': {points:[
    'Setup: in a plank with hands under or slightly ahead of the shoulders, starting to shift weight forward.',
    'Execution: lean the shoulders progressively past the hands, body straight and core engaged, holding each depth before going deeper.',
    'Whole-body integration: shoulders, wrists and core support an unusual load at once, so for most people it\'s a multi-year progression.',
    'Common mistake: leaning far forward before a shallower lean is solid, a common cause of wrist strain.',
    'Coaching insight: spend weeks to months at each lean depth; rushing this progression works against the goal.',
  ]},
  'Pull-up/Chin-up Progression Fundamentals': {points:[
    'Setup: dead hang, arms straight, shoulder blades slightly engaged; just outside shoulder width for pull-ups, palms in for chin-ups.',
    'Execution: drive the elbows down and back until your chin clears the bar, then lower to a full, controlled hang.',
    'Whole-body integration: strict pull-up strength is the base the front lever and muscle-up build on; nothing substitutes for it.',
    'Common mistake: kipping or swinging when the goal is strict strength, which trains a different quality.',
    'Coaching insight: bands or slow negatives from the top build toward a first strict pull-up while training the right pattern.',
  ]},
  'Row Progression (Ring/Bar Rows)': {points:[
    'Setup: hang under a bar or rings at an angle, heels down, body straight from head to heels.',
    'Execution: pull your chest to the bar by driving the elbows back, body rigid, then lower to full arm extension.',
    'Whole-body integration: body angle scales difficulty (more horizontal is harder), the calisthenics version of changing the weight.',
    'Common mistake: hips sagging as you tire, the same core breakdown as in push-ups.',
    'Coaching insight: rows build horizontal pulling, different from pull-ups\' vertical pulling; a rounded program needs real row volume.',
  ]},
  'Front Lever Progression Path': {points:[
    'Setup: hang from a bar and work toward a horizontal body through progressively harder tuck and straddle positions.',
    'Execution: at your level, keep the body rigid and shoulders actively pulled down, hold for time, then return to a dead hang.',
    'Whole-body integration: one of the hardest straight-arm pulling tests: lats, core and shoulder stabilizers all resist dropping to a hang.',
    'Common mistake: straightening the legs before the current tuck can be held well for a meaningful time.',
    'Coaching insight: pair it with straight-arm work like straight-arm pulldowns; bent-arm pull-up strength doesn\'t fully transfer.',
  ]},
  'Muscle-Up Technique & Prerequisites': {points:[
    'Setup: build the base first; a common standard is about 10 strict pull-ups (or chest-to-bar) and 10 strict dips with good form.',
    'Execution: pull explosively to the chest, roll the grip and elbows over the bar in one motion (a false grip helps), then press out.',
    'Whole-body integration: it joins the pull-up and dip into one skill; attempting it without both strengths is where injury risk concentrates.',
    'Common mistake: one elbow clearing before the other (\'chicken wing\'), twisting the body and loading one shoulder, a documented injury risk.',
    'Coaching insight: you arrive at a muscle-up after building pull-ups and dips; using it as a shortcut brings bad habits and shoulder or elbow strain.',
  ]},
  'L-Sit Progression': {points:[
    'Setup: support on bars, blocks or the floor with straight arms, knees bent toward the chest before straightening the legs.',
    'Execution: press down to lift the hips and hold the legs out at hip height, shoulders down and spine tall, not shrugged or rounded.',
    'Whole-body integration: it tests hip flexor and core strength plus shoulder depression, the same shoulders-down principle as elsewhere.',
    'Common mistake: shrugging toward the ears to support the hold, which looks strained and is less stable.',
    'Coaching insight: bent-knee or single-leg L-sits are legitimate progressions; shoulder and core position matter more than straight legs.',
  ]},
  'Hollow Body Position': {points:[
    'Setup: lie on your back, lower back pressed down, arms overhead and legs extended.',
    'Execution: lift shoulders and legs a few inches while keeping the lower back pressed down, holding a slight banana curve.',
    'Whole-body integration: the full-body tension that handstands, levers and planche depend on; a weak hollow body hides behind unstable skills.',
    'Common mistake: letting the lower back arch to hold arms and legs higher, which means the core has lost control.',
    'Coaching insight: gymnastics teaches it first and drills it most, because so much later skill depends on finding it under fatigue.',
  ]},
  'Handstand Balance Fundamentals': {points:[
    'Setup: hands shoulder-width, fingers spread, practicing against a wall before any freestanding hold.',
    'Execution: stack shoulders over wrists, hold a hollow-body line, and balance with small, constant finger and wrist adjustments.',
    'Whole-body integration: a handstand is a vertical hollow body on your hands, so hollow body and shoulder stability are prerequisites.',
    'Common mistake: big, sudden corrections like kicking a leg down, rather than small finger-and-wrist adjustments.',
    'Coaching insight: practice facing the wall, not back to it; it trains real balance instead of making the wall a crutch.',
  ]},
  'Human Flag Progression': {points:[
    'Setup: grip a vertical pole, one hand high and one low, building toward holding your body horizontal to the side.',
    'Execution: the top hand pulls as the bottom hand pushes to hold the body rigid, progressing through tucked and bent-leg versions first.',
    'Whole-body integration: it combines pulling strength, Hollow Body and L-Sit core control, and full-body tension in one combination skill.',
    'Common mistake: trying the straight-body flag before controlling the tucked version, hard on shoulders and grip without the base.',
    'Coaching insight: it loads the body very asymmetrically, so build slowly and watch for differences between left and right sides.',
  ]},
  'Pistol Squat Progression': {points:[
    'Setup: stand on one leg, the other extended forward, arms out for counterbalance.',
    'Execution: lower under control without the free leg touching down, as deep as strength and ankle mobility allow, then drive up.',
    'Whole-body integration: it tests single-leg strength, balance and ankle mobility, with the same knee-tracking and depth rules as the squat.',
    'Common mistake: the standing knee caving in as you go deeper, the squat\'s valgus collapse made worse with no second leg.',
    'Coaching insight: holding a light weight in front, even a water bottle, helps counterbalance without changing the leg strength needed.',
  ]},
  'Broad Jump & Landing Technique': {points:[
    'Setup: stand tall, feet hip-width, ready to dip into a quarter-to-half squat.',
    'Execution: swing the arms back then forward as you drive through the legs, landing with bent knees and a quiet, controlled landing.',
    'Whole-body integration: landing matters as much as the jump; bent knees spread impact through the leg, stiff ones concentrate it in knees and shins.',
    'Common mistake: chasing distance while landing stiff-legged, avoidable joint stress unrelated to how far you jumped.',
    'Coaching insight: good jump programs train landings first, before adding distance or height; landing is its own skill.',
  ]},
  'Animal Flow Transitions': {points:[
    'Setup: start in a bear crawl, hands and feet down, knees hovering just above the ground, core engaged.',
    'Execution: flow between positions like bear crawl and crab walk with control, focusing on smooth transitions rather than speed.',
    'Whole-body integration: it builds dynamic, multi-planar control and coordination, different from the static holds elsewhere.',
    'Common mistake: rushing transitions to look impressive, which undercuts the coordination and stability benefit.',
    'Coaching insight: it trains movement quality across several planes at once, which single-plane strength work doesn\'t.',
  ]},
  'Skin-the-Cat & Shoulder Prep': {points:[
    'Setup: hang from a bar or rings with straight arms, ready to rotate backward through your arms slowly.',
    'Execution: tuck the knees and rotate back and under through an inverted hang, then reverse, always slow, never swinging.',
    'Whole-body integration: it takes the shoulder through a large range under control, preparing for front levers and muscle-ups.',
    'Common mistake: swinging to force the rotation, which defeats a movement meant to build controlled shoulder mobility.',
    'Coaching insight: it\'s mainly a warm-up and mobility drill, building the range and control the harder skills depend on.',
  ]},
};

const CYCLING_TECHNIQUE_GROUPS = {
  'Bike Fit & Position': {
    poses:['Saddle Height & Position','Handlebar Reach & Drop','Cleat Positioning (Clipless Pedals)','Core & Upper Body Stability on the Bike'],
    note:'The foundation every other technique in this card is built on — a genuinely well-fit bike makes the rest of these techniques meaningfully easier to execute, and a poorly fit one works against all of them at once.',
  },
  'Pedaling Technique': {
    poses:['Pedal Stroke Efficiency (Circular vs. Mashing)','Cadence Selection','Standing Climb Technique','Seated Climb Technique'],
    note:'How power actually gets from the legs to the road — the difference between an efficient and inefficient pedal stroke shows up as real, measurable wasted energy over a long ride.',
  },
  'Handling & Cornering': {
    poses:['Cornering Technique & Line Choice','Braking Technique','Descending Technique & Body Position','Group Riding & Drafting Position'],
    note:'The bike-handling skills that matter most exactly when things are moving fastest and margin for error is smallest.',
  },
  'Pacing & Endurance Strategy': {
    poses:['Power/Effort-Based Pacing (Zones)','Interval Pacing Strategy','On-Bike Nutrition & Hydration Timing','Aerodynamic Position on Flats'],
    note:'The strategic layer on top of the physical skills — riding at the right effort at the right time is often a bigger differentiator than raw fitness alone.',
  },
};

const CYCLING_TECHNIQUE_DETAILS = {
  'Saddle Height & Position': {points:[
    'Setup: start with the LeMond formula (inseam × 0.883, bottom bracket to saddle top) or the heel method: heel on pedal, leg straight.',
    'Execution: with the ball of the foot on the pedal at the bottom, the knee should keep a slight bend, roughly 25-35°, not locked.',
    'Whole-body integration: too high makes the hips rock and strains the knees; too low cuts power and stresses the knees the other way.',
    'Common mistake: setting saddle height once and never rechecking as flexibility, cleats or shoes change.',
    'Coaching insight: a dynamic professional fit beats any formula, but LeMond or the heel method gets most riders very close.',
  ]},
  'Handlebar Reach & Drop': {points:[
    'Setup: seated, hands on the hoods, elbows slightly and comfortably bent, neither locked nor cramped.',
    'Execution: adjust stem length and bar height so your back position is sustainable for the whole ride, not just a moment standing still.',
    'Whole-body integration: reach too long or low puts excess weight on the hands, causing numbness well before the legs tire.',
    'Common mistake: chasing a low aero position before you have the flexibility and core strength to hold it.',
    'Coaching insight: fitters set saddle height and position first, for power and knees, then tune the front end for comfort and aero.',
  ]},
  'Cleat Positioning (Clipless Pedals)': {points:[
    'Setup: with the shoe off, find the ball of the foot, the widest part at the base of the big toe, as your landmark.',
    'Execution: place the cleat so the ball of the foot sits over the pedal axle, rotated to your foot\'s natural, relaxed angle.',
    'Whole-body integration: cleats affect the whole chain to the knee and hip; forcing an unnatural foot angle is a documented cause of knee pain.',
    'Common mistake: setting a rigid, symmetrical rotation that ignores your natural foot angle, making the knee compensate.',
    'Coaching insight: fitters watch how your foot naturally rests when standing or walking before setting cleat rotation.',
  ]},
  'Core & Upper Body Stability on the Bike': {points:[
    'Setup: keep the core gently engaged throughout, like the squat brace adapted to sitting.',
    'Execution: keep the upper body still while the legs work, without the hips or shoulders rocking, especially when pushing hard or climbing.',
    'Whole-body integration: a stable torso turns more leg power into forward motion instead of wasted upper-body movement.',
    'Common mistake: rocking and swaying to generate power, which is inefficient and suggests core strength is a limit.',
    'Coaching insight: it\'s why cyclists benefit from off-bike core training; general core strength transfers directly to on-bike efficiency.',
  ]},
  'Pedal Stroke Efficiency (Circular vs. Mashing)': {points:[
    'Setup: think of the stroke as a full circle, applying smooth, continuous force through as much of it as possible.',
    'Execution: push forward over the top, drive through the bottom, and let the recovering leg unweight rather than consciously pulling up.',
    'Whole-body integration: using glutes, hamstrings and calves through the stroke, not just quads on the downstroke, spreads the work and delays fatigue.',
    'Common mistake: mashing, pushing almost only on the downstroke, which is less efficient and tires the quads.',
    'Coaching insight: power meters showing force through the stroke reveal how dead most riders\' top and bottom of the circle really are.',
  ]},
  'Cadence Selection': {points:[
    'Setup: cadence (pedal revolutions per minute) is a training variable, not a number to hold regardless of terrain or effort.',
    'Execution: generally favour a moderate-to-high cadence (often 80-100 rpm on the road) over grinding low cadence, shifting load from muscles to heart and lungs.',
    'Whole-body integration: low cadence tires the legs faster; very high cadence at the same power loads breathing and heart rate instead.',
    'Common mistake: never training cadence and just riding whatever feels natural, leaving efficiency gains unexplored.',
    'Coaching insight: cadence drills, riding faster than feels natural for set periods, build efficiency at higher cadence; it\'s trainable.',
  ]},
  'Standing Climb Technique': {points:[
    'Setup: moving from seated to standing on a climb, usually with hands on the hoods or drops for leverage.',
    'Execution: let the bike rock gently with the stroke while your body stays centered over the bottom bracket, using bodyweight on each downstroke.',
    'Whole-body integration: standing uses more upper-body and core stability, trading some efficiency for power and leverage on steep sections.',
    'Common mistake: standing too early or too often on long climbs; it costs more energy than sitting, so use it strategically.',
    'Coaching insight: alternating seated and standing periodically delays fatigue better than holding either for the whole climb.',
  ]},
  'Seated Climb Technique': {points:[
    'Setup: sit properly on the saddle, not perched on the nose, hands on hoods or tops depending on gradient.',
    'Execution: keep the circular pedal stroke and steady, sustainable power rather than surging, core braced to keep the upper body still.',
    'Whole-body integration: sitting is usually more efficient on sustained climbs, so most pacing plans stay seated except for short standing efforts.',
    'Common mistake: sliding forward on the saddle for more power, which changes effective saddle height and is usually just tension.',
    'Coaching insight: steady, sustainable climbing power is the same skill as effort-based pacing, at a different scale.',
  ]},
  'Cornering Technique & Line Choice': {points:[
    'Setup: ride the drops for a lower center of gravity and use the road\'s full width: wide entry, clip the apex, wide exit.',
    'Execution: weight the dropped outside pedal, inside pedal up, lower your torso, and press the inside knee gently toward the top tube.',
    'Whole-body integration: a small push on the inside of the bar (countersteering) leans the bike while your body stays balanced and centered.',
    'Common mistake: sticking the inside knee out like a motorcycle racer, which on a bicycle reduces stability.',
    'Coaching insight: practice cornering in a low-risk setting like an empty car park with cones before relying on it on the road.',
  ]},
  'Braking Technique': {points:[
    'Setup: use both brakes together, biased toward the front, which gives most of the stopping power, with the rear for stability.',
    'Execution: do most braking before the corner, not in it; trail braking while leaning is an advanced skill to build gradually.',
    'Whole-body integration: braking hard mid-corner takes grip the tyre needs for turning, which is why \'brake before, not during\' is repeated so often.',
    'Common mistake: grabbing the front brake hard and suddenly, especially mid-corner or on loose surfaces, which can wash out the front wheel.',
    'Coaching insight: relying mostly on the rear brake out of fear of going over the bars actually reduces stopping power; the front carries more weight.',
  ]},
  'Descending Technique & Body Position': {points:[
    'Setup: hands in the drops for stability and brake leverage, weight slightly back and low, pedals level through technical sections.',
    'Execution: look through the turn to where you\'re going, not at the road just ahead, applying cornering and braking skills with less margin.',
    'Whole-body integration: descending uses the same cornering and braking skills, executed with more precision where mistakes cost more.',
    'Common mistake: tensing up and gripping hard as speed rises, which stops the bike moving naturally and makes handling worse.',
    'Coaching insight: staying relaxed (loose grip, soft arms and shoulders) is one of the biggest differences in descending confidence and control.',
  ]},
  'Group Riding & Drafting Position': {points:[
    'Setup: draft close behind another rider to cut wind resistance, keeping your front wheel a consistent, safe distance behind theirs.',
    'Execution: hold a steady line and effort without surging or braking abruptly, call out hazards, and take smooth turns at the front.',
    'Whole-body integration: drafting saves real energy, especially at speed, so group pacing differs from solo: effort is shared across the group.',
    'Common mistake: sudden braking, swerving or surging in a tight group, a common cause of crashes; predictability beats individual skill.',
    'Coaching insight: new group riders should practice steady wheel-following at the back before rotating through, as it\'s a separate skill from fitness.',
  ]},
  'Power/Effort-Based Pacing (Zones)': {points:[
    'Setup: by power, heart rate or feel, know your rough zones: easy endurance, moderate tempo, and hard threshold-or-above.',
    'Execution: ride the zone each ride or segment is meant for, not whatever feels achievable; a hard easy ride defeats its purpose.',
    'Whole-body integration: the same effort-based pacing as running: train the intended zone, not whatever pace feels right today.',
    'Common mistake: riding mostly medium-hard, too hard to recover and too easy to stimulate — the \'gray zone\' that undertrains both ends.',
    'Coaching insight: polarized training (mostly easy, some genuinely hard, little in between) is well supported over moderate-dominated plans.',
  ]},
  'Interval Pacing Strategy': {points:[
    'Setup: know each interval\'s target effort, duration and recovery before starting, rather than deciding as you go.',
    'Execution: hold consistent effort across all intervals, lowering the target slightly if needed rather than blowing up the session early.',
    'Whole-body integration: the same pacing discipline as Hyrox\'s wall-ball and sled sections; consistent repeated efforts transfer across sports.',
    'Common mistake: a too-hard first interval, then fading; smooth, sustainable intervals train better than one strong effort and a fade.',
    'Coaching insight: plans set interval targets slightly below your best effort to protect consistency; the value is the repeated stimulus.',
  ]},
  'On-Bike Nutrition & Hydration Timing': {points:[
    'Setup: under about an hour, water is usually enough; for longer or harder rides, plan carbs and fluids before starting.',
    'Execution: start drinking and fuelling early and regularly; by the time thirst or hunger is strong, performance is already dropping.',
    'Whole-body integration: waiting for hunger or thirst is a known mistake across endurance sports, not just cycling.',
    'Common mistake: under-fuelling on long rides because eating feels like an interruption; a brief pause protects the rest of the ride.',
    'Coaching insight: practice your fuelling in training, both amount and timing, and how your gut handles it, well before an event.',
  ]},
  'Aerodynamic Position on Flats': {points:[
    'Setup: on flat roads at speed, air drag is the main resistance; a lower, narrower position reduces it, if you can hold it.',
    'Execution: go lower and narrower (drops or aero bars) while keeping breathing and pedal stroke intact; a cramped position can cost more than it saves.',
    'Whole-body integration: it depends on the flexibility and core endurance from Handlebar Reach; without them, the position becomes its own fatigue.',
    'Common mistake: an aggressive aero position you can\'t sustain, abandoned before the point where it would have mattered most.',
    'Coaching insight: on the flat, drag far outweighs rolling resistance and drivetrain friction, which is why position matters as much as fitness.',
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
    'Setup: from a balanced guard, the lead hand extends straight at the target, lead shoulder rotating slightly for reach and chin cover.',
    'Execution: snap the fist out and back along the most direct line, turning it palm-down just before impact, then straight back to guard.',
    'Whole-body integration: even the jab starts with a small push from the lead foot; an arm-only jab is slower and telegraphs earlier.',
    'Common mistake: dropping the rear hand while the jab is out, or pulling it back in a wide arc instead of along the same line.',
    'Coaching insight: the jab sets range, breaks rhythm and sets up nearly every combination, which is why beginners drill it first.',
  ]},
  'Cross (Straight Right)': {icon:'crossPunch', video:'boxing cross straight right technique tutorial', points:[
    'Setup: from guard, the rear hip and shoulder sit slightly behind the lead side, loading the rotation.',
    'Execution: drive off the rear foot, rotating hip and shoulder together as the rear hand goes straight out, palm-down at full extension.',
    'Whole-body integration: power starts at the ground: the rear foot pivots and the hip rotates first, and the arm just transmits it.',
    'Common mistake: throwing it as an arm punch with little hip or foot rotation; it still lands, but with a fraction of the power.',
    'Coaching insight: throw it in slow motion to feel the power start at the rear-foot pivot; rushing to speed locks in the arm-only habit.',
  ]},
  'Hook': {icon:'hookPunch', video:'boxing hook punch technique tutorial', points:[
    'Setup: from guard, bend the striking arm to about 90° and keep that angle throughout the punch.',
    'Execution: rotate hip, torso and (on the lead hook) lead foot together, sweeping the bent arm horizontally to land with forearm parallel to the ground.',
    'Whole-body integration: hook power comes almost entirely from hip and torso rotation; flat feet and still hips make it armsy and weak.',
    'Common mistake: a visible wind-up that telegraphs it, or straightening the arm during the swing.',
    'Coaching insight: a lead hook off a small front-foot pivot amplifies rotation without the wind-up that makes it easy to see.',
  ]},
  'Uppercut': {icon:'uppercutPunch', video:'boxing uppercut technique tutorial', points:[
    'Setup: bend the knees slightly to drop the striking hand below the target, elbow tucked close to the body.',
    'Execution: drive up by extending the legs and rotating hip and shoulder, the fist travelling a short vertical line, palm facing you.',
    'Whole-body integration: as with the cross, legs and hips generate the power; the arm carries it along a short path.',
    'Common mistake: dropping the hand low and out front first, which telegraphs it and leaves that side of the head open.',
    'Coaching insight: it works best up close, where its short travel keeps it fast and hard to see.',
  ]},
  'Guard & Head Movement': {icon:'headMovementSlip', video:'boxing guard position head movement technique', points:[
    'Setup: hands high to protect chin and cheekbones, elbows tucked for the ribs, chin slightly down.',
    'Execution: slip straight punches by moving your head just off the centerline, duck hooks by bending the knees, and return to guard immediately.',
    'Whole-body integration: move the head by bending the knees and rotating the torso, not tilting the neck; a neck-only slip is small and slow.',
    'Common mistake: dropping the hands to move the head; head movement and guard work together, not instead of each other.',
    'Coaching insight: elite defenders use very little wasted movement; small, precise slips with a solid guard beat big dodges.',
  ]},

  'Roundhouse Kick (Kickboxing)': {icon:'roundhouseKick', video:'kickboxing roundhouse kick technique tutorial', points:[
    'Setup: chamber the knee up and to the side, pivoting the standing foot about 90° to allow full hip rotation.',
    'Execution: snap the shin or instep through the target in a fast, whipping arc, driven by the hip rotating through, not the leg swinging.',
    'Whole-body integration: kickboxing\'s roundhouse favours speed and snap over Muay Thai\'s deeper hip drive: different emphases, both valid.',
    'Common mistake: no pivot on the standing foot, which caps hip rotation and leaves a weaker, slower-recovering leg swing.',
    'Coaching insight: kickboxing rewards speed and volume, so gyms drill the snap back to a ready position as much as the kick.',
  ]},
  'Teep (Push Kick)': {icon:'teepKick', video:'muay thai kickboxing teep push kick technique', points:[
    'Setup: chamber the knee straight up toward the chest, the kicking hip facing the target, not turned sideways.',
    'Execution: extend the leg straight out, driving the ball or heel of the foot into the target, like pushing a door open.',
    'Whole-body integration: mainly a range and off-balancing tool, interrupting rhythm and managing distance rather than doing damage.',
    'Common mistake: snapping it back early like a front kick, losing the push that stops an advancing opponent.',
    'Coaching insight: underrated for controlling range against an aggressive fighter without retreating every exchange.',
  ]},
  'Switch Kick': {icon:'switchKick', video:'kickboxing switch kick technique tutorial', points:[
    'Setup: from your stance, swap front and back feet with a quick small hop, switching stance for a split second.',
    'Execution: as the feet switch, drive the new rear leg into a roundhouse, using the switch\'s momentum for extra rotation.',
    'Whole-body integration: switch and kick should be one continuous motion; a pause between them telegraphs it and loses the advantage.',
    'Common mistake: switching clearly, then pausing before the kick, losing both surprise and momentum.',
    'Coaching insight: it lets you attack with the stronger rear leg without a visible stance change; drill the switch alone for speed.',
  ]},
  'Punch-Kick Combination Timing': {icon:'comboTiming', video:'kickboxing punch kick combination timing tutorial', points:[
    'Setup: open combinations with hands to close range and draw a reaction, as punches are faster to throw and retract.',
    'Execution: land the kick right after the hands pull their guard out of position, or as the finisher once range and rhythm are set.',
    'Whole-body integration: shifting from punching to kicking mid-combination needs a weight shift without an obvious pause.',
    'Common mistake: hands and kicks as two separate sequences with a visible reset between them.',
    'Coaching insight: shadowbox combinations linking punches into kicks and back; the disconnect is easier to feel than on the bag.',
  ]},

  'Muay Thai Roundhouse Kick': {icon:'roundhouseKick', video:'muay thai roundhouse kick technique tutorial', points:[
    'Setup: chamber with a bigger, more committed hip turn than kickboxing, pivoting the standing foot fully round.',
    'Execution: strike with the shin, not the foot, driving through the target with the whole hip and torso rotating through.',
    'Whole-body integration: the deeper hip commitment makes it heavier than the kickboxing version, trading speed and recovery for force.',
    'Common mistake: striking with the foot or instep instead of the shin, weaker and more likely to injure the foot.',
    'Coaching insight: progressive bag work conditions the shin for repeated impact, so programs build in dedicated shin-conditioning volume.',
  ]},
  'Clinch Control & Off-Balancing': {icon:'clinchControl', video:'muay thai clinch control technique tutorial', points:[
    'Setup: control their head and/or arms up close, hands linked behind the neck or behind an arm, elbows tight.',
    'Execution: use arms and upper body to off-balance them, pulling the head down or turning their posture to open knees and short strikes.',
    'Whole-body integration: posture is everything; a tall, straight spine gives far more leverage than a hunched one, whatever your arm strength.',
    'Common mistake: letting head and posture drop while fighting for grips, surrendering the leverage the clinch depends on.',
    'Coaching insight: clinch skill comes from accumulated hours, not strength, which is why gyms run dedicated clinch sparring.',
  ]},
  'Straight Knee Strike': {icon:'kneeStrike', video:'muay thai straight knee strike technique tutorial', points:[
    'Setup: from the clinch or close range, chamber the knee up and slightly forward with hips square to the target.',
    'Execution: drive the hips forward explosively, striking with the point of the knee, then retract quickly to reset.',
    'Whole-body integration: in the clinch, off-balance them forward or down first; a knee lands far harder on someone pulled off their base.',
    'Common mistake: kneeing with the leg while the hips stay back, giving a fraction of the force.',
    'Coaching insight: it needs little distance or wind-up; hip drive, not travel, is where its power comes from.',
  ]},
  'Elbow Strike (Horizontal & Diagonal)': {icon:'elbowStrike', video:'muay thai elbow strike technique tutorial', points:[
    'Setup: keep the elbow close to the body at the start, the striking arm tightly bent.',
    'Execution: rotate hip and shoulder to whip the point of the elbow through a short arc, horizontally or rising diagonally.',
    'Whole-body integration: as with the hook, power comes from hip and shoulder rotation; a wide, arm-only elbow telegraphs and lands softer.',
    'Common mistake: throwing elbows from punching or kicking range; they\'re close-range weapons, and stepping in to land them loses surprise.',
    'Coaching insight: elbows carry real cutting risk, so gyms drill them on pads and bags first, and control and gear matter most in sparring.',
  ]},
  'Checking a Low Kick': {icon:'checkBlock', video:'muay thai checking low kick technique tutorial', points:[
    'Setup: as a low kick comes, lift the same-side knee up and slightly across, turning the shin to meet it.',
    'Execution: take the impact on the shin bone, not the thigh, keeping balance on the standing leg.',
    'Whole-body integration: a good check defends and often hurts the kicker more, discouraging further low kicks.',
    'Common mistake: checking late, after the kick reaches the thigh, or lifting the knee straight up without turning the shin into it.',
    'Coaching insight: checking shins need the same progressive conditioning as kicking ones; under-conditioned shins get injured defending.',
  ]},

  'Sprawl (Takedown Defense)': {icon:'sprawl', video:'mma sprawl takedown defense technique tutorial', points:[
    'Setup: as they shoot, drive your hips back and down immediately, rather than backing away or standing tall.',
    'Execution: thrust your legs back explosively and drop hips and chest onto their shoulders and upper back, head up, posture forward.',
    'Whole-body integration: hips back, legs extending and upper body dropping all happen together in one explosive movement.',
    'Common mistake: sprawling with head down and chest collapsed, losing position and risking being driven through or struck.',
    'Coaching insight: shots come with little warning, so the sprawl has to become a reflex through repetition.',
  ]},
  'Ground & Pound Positioning': {icon:'groundPound', video:'mma ground and pound positioning technique tutorial', points:[
    'Setup: from a dominant top position, set a stable base so you can\'t be rolled, rather than posting your weight onto your hands.',
    'Execution: throw short, controlled strikes that keep your base; over-extending risks losing the position entirely.',
    'Whole-body integration: position first, strikes second; abandoning base for a bigger shot often gets you swept mid-strike.',
    'Common mistake: throwing full-extension standing punches from top position, compromising balance and base.',
    'Coaching insight: elite ground strikers prioritize position over damage; a smaller strike from secure position beats a big one that risks it.',
  ]},
  'Striking-to-Clinch Transition': {icon:'clinchControl', video:'mma striking to clinch transition technique tutorial', points:[
    'Setup: close distance behind a strike or combination rather than walking in unprotected.',
    'Execution: secure control (collar tie, underhooks or double collar tie) the instant you make contact, without pausing to reassess.',
    'Whole-body integration: striking, clinch and grappling overlap here; a fighter slow between ranges concedes a real advantage.',
    'Common mistake: closing distance with no strike or feint covering the entry, letting them strike, counter or sprawl first.',
    'Coaching insight: MMA sparring mixes striking distance with clinch entries because pure striking or grappling never trains this transition.',
  ]},
  'Cage/Wall Control': {icon:'cageControl', video:'mma cage wall control technique tutorial', points:[
    'Setup: with them pressed to the cage or wall, secure upper-body control (underhook, overhook or collar tie) to stop them circling or striking.',
    'Execution: pin them with hip pressure, freeing your hands for strikes, takedowns or more control while their movement stays limited.',
    'Whole-body integration: the cage acts almost like a grappling partner, removing their options to retreat or circle.',
    'Common mistake: pinning them without real upper-body control, so they simply circle off and reset in open space.',
    'Coaching insight: cage control barely exists in other combat sports, so fence-savvy wrestlers bring a toolkit striking-only fighters lack.',
  ]},

  'Roundhouse Kick (Taekwondo)': {icon:'roundhouseKick', video:'taekwondo roundhouse kick technique tutorial', points:[
    'Setup: chamber the knee high and to the side, pivoting the standing foot fully for maximum rotation and reach.',
    'Execution: snap the kick through with the ball of the foot or instep, favouring speed and whip over Muay Thai\'s heavy hip drive.',
    'Whole-body integration: electronic scoring rewards speed and clean contact over power, shaping taekwondo\'s snap-and-rechamber style.',
    'Common mistake: skimping on chamber height and pivot for a faster, shallower kick that scores less and telegraphs more.',
    'Coaching insight: sparring rewards rapid combinations, so recovering to a ready stance is drilled almost as much as the kick.',
  ]},
  'Side Kick': {icon:'sideKick', video:'taekwondo side kick technique tutorial', points:[
    'Setup: chamber the knee to the chest with hip and knee pointing at the target, not to the side.',
    'Execution: pivot the standing foot and drive straight sideways with the heel or outer edge of the foot, in a line, not an arc.',
    'Whole-body integration: a linear, driving strike; leaning back to reach pulls the hips out of line and reduces power.',
    'Common mistake: leaning the upper body away for height or distance, over-extending the lower back and losing hip drive.',
    'Coaching insight: prized for raw power and as a long-range check on distance, similar in role to the teep.',
  ]},
  'Axe Kick': {icon:'axeKick', video:'taekwondo axe kick technique tutorial', points:[
    'Setup: raise the kicking leg high and fairly straight, well above the target.',
    'Execution: bring the leg down in a controlled, mostly straight chop, striking with the heel.',
    'Whole-body integration: power comes from controlled descent plus hip and core control, so flexibility, not leg strength, is the limit.',
    'Common mistake: forcing height before hips, hamstrings and lower back are ready, losing control and risking back and hamstring injury.',
    'Coaching insight: active flexibility and mobility training improves it more than strength training does.',
  ]},
  'Spinning Back Kick': {icon:'spinningBackKick', video:'taekwondo spinning back kick technique tutorial', points:[
    'Setup: turn your head to spot the target over your shoulder before committing to the spin; spotting comes first.',
    'Execution: pivot on the standing foot, turning briefly away from the target, then drive the kicking leg straight back with the heel.',
    'Whole-body integration: it briefly removes sight of the opponent; early spotting and a tight spin keep it safe and accurate.',
    'Common mistake: rushing or skipping the head turn, the main reason it misses badly or leaves you out of position.',
    'Coaching insight: it\'s drilled slowly first; spotting and a tight spin must be automatic before it\'s safe at full speed in sparring.',
  ]},

  'Ward-Off (Peng) as Structural Defense': {icon:'wardOff', video:'tai chi peng ward off application tutorial', points:[
    'Setup: present a rounded, springy forearm to incoming force, structured by legs and waist rather than tense arm muscle.',
    'Execution: absorb and redirect pressure up and out through legs, waist and spine together, rather than blocking with the arm alone.',
    'Whole-body integration: peng is the root of all tai chi techniques; rollback, press and push are layered on a peng structure that never disappears.',
    'Common mistake: substituting arm tension for structure, making a stiff block that collapses easily.',
    'Coaching insight: solo practice comes before push hands because peng structure must be built into the body; arm strength can\'t fake it.',
  ]},
  'Rollback (Lu) as Yielding': {icon:'rollback', video:'tai chi lu rollback application tutorial', points:[
    'Setup: as force arrives, turn the waist to redirect it along a curve past your body instead of meeting it head-on.',
    'Execution: let the force continue past you, leading it off line with hip and waist rotation so their momentum does the work.',
    'Whole-body integration: it embodies \'four ounces moves a thousand pounds\': a small, well-timed rotation redirects a much larger force.',
    'Common mistake: pulling back with the arms instead of turning the whole body from the waist, losing most of the redirection.',
    'Coaching insight: timing is everything: too early there\'s nothing to redirect, too late it has landed; push hands trains this timing.',
  ]},
  'Press (Ji) & Push (An) as Issuing Power': {icon:'pressPush', video:'tai chi ji an press push application tutorial', points:[
    'Setup: after neutralizing their force, gather your structure — weight sunk, spine long, waist loaded — before issuing power.',
    'Execution: press drives forward through both hands or forearms in a short release; push extends through the palms, legs and waist supplying the force.',
    'Whole-body integration: power issues from the ground up: rear leg extends, waist drives, arms deliver at the end of the chain.',
    'Common mistake: pushing with arms and shoulders while legs and hips stay passive, a shove rather than whole-body power.',
    'Coaching insight: they\'re taught as a pair because they flow together: press to disrupt their structure, then push as it gives way.',
  ]},
  'Push Hands Listening Energy (Ting Jin)': {icon:'listeningEnergy', video:'tai chi ting jin listening energy push hands tutorial', points:[
    'Setup: keep only the lightest forearm contact with your partner, enough to sense pressure and direction, not to push or resist.',
    'Execution: continuously sense, not anticipate, the direction, timing and amount of their force, responding only to what you feel.',
    'Whole-body integration: \'listening\' underpins every push hands technique; without it, the cardinal techniques are guesses.',
    'Common mistake: gripping or pressing too hard, numbing the sensitivity the drill builds; tension is how beginners defeat it.',
    'Coaching insight: listening energy (ting jin) is a trainable skill, not a talent; patient push hands practice measurably improves it.',
  ]},
  'Rooting & Whole-Body Weight Transfer': {icon:'rooting', video:'tai chi rooting weight transfer application tutorial', points:[
    'Setup: settle your weight fully into one leg at a time in stances and transitions, rather than splitting it evenly.',
    'Execution: shift weight smoothly and completely between legs on every step, torso upright and stable without bobbing.',
    'Whole-body integration: a rooted stance resists pushes because weight is fully settled, not braced; every cardinal technique depends on it.',
    'Common mistake: keeping weight vaguely split between both legs, which feels safer but removes the clear transfer rooting needs.',
    'Coaching insight: slow solo practice exists so clean weight transfer becomes automatic before it faces real pressure in push hands.',
  ]},
};

const COMBAT_TECHNIQUE_GROUPS = {
  'Boxing': {
    poses:['Jab','Cross (Straight Right)','Hook','Uppercut','Guard & Head Movement'],
    note:'Hands-only fundamentals — every combat style in this program builds on these punching mechanics in some form.',
  },
  'Kickboxing': {
    poses:['Roundhouse Kick (Kickboxing)','Teep (Push Kick)','Switch Kick','Punch-Kick Combination Timing'],
    note:'Adds kicks to the boxing foundation above, with an emphasis on speed and clean punch-to-kick combinations.',
  },
  'Muay Thai': {
    poses:['Muay Thai Roundhouse Kick','Clinch Control & Off-Balancing','Straight Knee Strike','Elbow Strike (Horizontal & Diagonal)','Checking a Low Kick'],
    note:'The full 8-limb toolkit — heavier, more committed strikes plus the clinch range no other style here trains directly.',
  },
  'MMA': {
    poses:['Sprawl (Takedown Defense)','Ground & Pound Positioning','Striking-to-Clinch Transition','Cage/Wall Control'],
    note:'The connective tissue between standup striking and grappling — these transitions are what a single-discipline background usually misses.',
  },
  'Taekwondo': {
    poses:['Roundhouse Kick (Taekwondo)','Side Kick','Axe Kick','Spinning Back Kick'],
    note:'Kick-dominant technique built around speed, height, and precise chambering rather than the heavier hip drive of Muay Thai kicks.',
  },
  'Tai Chi': {
    poses:['Ward-Off (Peng) as Structural Defense','Rollback (Lu) as Yielding','Press (Ji) & Push (An) as Issuing Power','Push Hands Listening Energy (Ting Jin)','Rooting & Whole-Body Weight Transfer'],
    note:'The internal art\'s martial application layer — how the form and standing work above actually function as self-defense, not just moving meditation.',
  },
};
