'use strict';
// Behavioral coverage for the Watersports program — refactored from a
// standalone Surfing program into a style-switcher container (same pattern
// as Combat/Cycling/Yoga), per an explicit request to match that pattern so
// Skimboarding, Wakeboarding, and Kite-Assisted Surfing can be added as
// sibling styles without cluttering the top-level Training Style list with
// one entry per discipline.
//
// Mirrors this session's own citation-accuracy and completeness-audit
// discipline: every check that audit ran against the existing library is
// re-run here against the watersports content specifically, and the
// container-mechanics pieces (exKey/workoutKey/parseExKey namespacing,
// STYLE_KEY_FOR_PROGRAM) get their own direct coverage since no other
// container (combat/cycling/yoga) has this in the suite yet — this is the
// first one to get it, not a gap unique to watersports.
const { readIndexSource, extractConst, extractFunction, extractElementById, runSandbox, runSandboxAsync, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const { test, run } = makeRunner('test-watersports-program.js');

test('programs.watersports is a container (empty days, populated at runtime), matching the combat/cycling/yoga pattern exactly', (assert)=>{
  const chunks = [extractConst(src, 'programs')];
  const [result] = runSandbox(chunks, `
    __capture.push({
      label: programs.watersports.label,
      daysIsEmptyObject: Object.keys(programs.watersports.days).length === 0,
      surfingIsNotATopLevelProgram: !('surfing' in programs),
    });
  `);
  assert.strictEqual(result.label, 'Watersports');
  assert.strictEqual(result.daysIsEmptyObject, true, 'container programs start with days:{} — real content is populated at runtime from *_STYLES');
  assert.strictEqual(result.surfingIsNotATopLevelProgram, true, 'surfing must now be a style, not a standalone top-level program');
});

test('WATERSPORTS_STYLES.surfing exists with a real 7-day structure and every exercise resolves to a real library entry', (assert)=>{
  const chunks = [extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'exerciseInfo')];
  const [result] = runSandbox(chunks, `
    const names = new Set();
    Object.values(WATERSPORTS_STYLES.surfing.days).forEach(day=>{
      (day.exercises || []).forEach(ex=> names.add(ex.name));
    });
    __capture.push({
      label: WATERSPORTS_STYLES.surfing.label,
      dayCount: Object.keys(WATERSPORTS_STYLES.surfing.days).length,
      hasRestDay: Object.values(WATERSPORTS_STYLES.surfing.days).some(d=> d.rest === true),
      missing: [...names].filter(n=> !exerciseInfo[n]),
      exerciseCount: names.size,
    });
  `);
  assert.strictEqual(result.label, 'Surfing');
  assert.strictEqual(result.dayCount, 7, 'must follow the same d1-d7 weekly structure every other style uses');
  assert.strictEqual(result.hasRestDay, true);
  assert.deepStrictEqual(result.missing, [], `every exercise referenced by the style must have a real exerciseInfo entry, found missing: ${JSON.stringify(result.missing)}`);
  assert.ok(result.exerciseCount >= 10, 'a real 7-day program should reference a real spread of exercises, not a token handful');
});

test('the 5 new exercises across styles (Straight-Arm Lat Pulldown, Battle Ropes, Surfboard Pop-Up Drill, Skimboard Run-and-Drop Drill, Wakeboard Edge Transition Drill) each have real cues, not empty placeholders', (assert)=>{
  const chunks = [extractConst(src, 'exerciseInfo')];
  const [result] = runSandbox(chunks, `
    const names = ['Straight-Arm Lat Pulldown', 'Battle Ropes', 'Surfboard Pop-Up Drill', 'Skimboard Run-and-Drop Drill', 'Wakeboard Edge Transition Drill'];
    __capture.push(names.map(n=> ({
      name: n,
      exists: !!exerciseInfo[n],
      cueCount: exerciseInfo[n] ? exerciseInfo[n].cues.length : 0,
    })));
  `);
  result.forEach(r=>{
    assert.strictEqual(r.exists, true, `${r.name} must exist in exerciseInfo`);
    assert.ok(r.cueCount >= 3, `${r.name} must have real technique cues (found ${r.cueCount})`);
  });
});

test('WATERSPORTS_STYLES.skimboarding exists with a real 7-day structure and every exercise resolves to a real library entry', (assert)=>{
  const chunks = [extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'exerciseInfo')];
  const [result] = runSandbox(chunks, `
    const names = new Set();
    Object.values(WATERSPORTS_STYLES.skimboarding.days).forEach(day=>{
      (day.exercises || []).forEach(ex=> names.add(ex.name));
    });
    __capture.push({
      label: WATERSPORTS_STYLES.skimboarding.label,
      dayCount: Object.keys(WATERSPORTS_STYLES.skimboarding.days).length,
      hasRestDay: Object.values(WATERSPORTS_STYLES.skimboarding.days).some(d=> d.rest === true),
      missing: [...names].filter(n=> !exerciseInfo[n]),
      exerciseCount: names.size,
    });
  `);
  assert.strictEqual(result.label, 'Skimboarding');
  assert.strictEqual(result.dayCount, 7, 'must follow the same d1-d7 weekly structure every other style uses');
  assert.strictEqual(result.hasRestDay, true);
  assert.deepStrictEqual(result.missing, [], `every exercise referenced by the style must have a real exerciseInfo entry, found missing: ${JSON.stringify(result.missing)}`);
  assert.ok(result.exerciseCount >= 8, 'a real 7-day program should reference a real spread of exercises, not a token handful');
});

test('WATERSPORTS_STYLES.wakeboarding exists with a real 7-day structure and every exercise resolves to a real library entry', (assert)=>{
  const chunks = [extractConst(src, 'WATERSPORTS_STYLES'), extractConst(src, 'exerciseInfo')];
  const [result] = runSandbox(chunks, `
    const names = new Set();
    Object.values(WATERSPORTS_STYLES.wakeboarding.days).forEach(day=>{
      (day.exercises || []).forEach(ex=> names.add(ex.name));
    });
    __capture.push({
      label: WATERSPORTS_STYLES.wakeboarding.label,
      dayCount: Object.keys(WATERSPORTS_STYLES.wakeboarding.days).length,
      hasRestDay: Object.values(WATERSPORTS_STYLES.wakeboarding.days).some(d=> d.rest === true),
      missing: [...names].filter(n=> !exerciseInfo[n]),
      exerciseCount: names.size,
      hasEdgeDrill: names.has('Wakeboard Edge Transition Drill'),
    });
  `);
  assert.strictEqual(result.label, 'Wakeboarding');
  assert.strictEqual(result.dayCount, 7, 'must follow the same d1-d7 weekly structure every other style uses');
  assert.strictEqual(result.hasRestDay, true);
  assert.deepStrictEqual(result.missing, [], `every exercise referenced by the style must have a real exerciseInfo entry, found missing: ${JSON.stringify(result.missing)}`);
  assert.ok(result.exerciseCount >= 8, 'a real 7-day program should reference a real spread of exercises, not a token handful');
  assert.strictEqual(result.hasEdgeDrill, true, 'sabotage check: the sport-specific edge-transition drill must actually be referenced by a real day, not just defined in exerciseInfo');
});

test('PROGRAM_SOURCES.watersports is a container redirect (not a placeholder, not a full citation), and STYLE_SOURCES.surfing / .skimboarding / .wakeboarding all carry real citations', (assert)=>{
  const chunks = [extractConst(src, 'PROGRAM_SOURCES'), extractConst(src, 'STYLE_SOURCES')];
  const [result] = runSandbox(chunks, `
    __capture.push({
      containerPrimary: PROGRAM_SOURCES.watersports.primary,
      surfingPrimary: STYLE_SOURCES.surfing.primary,
      skimboardingPrimary: STYLE_SOURCES.skimboarding.primary,
      wakeboardingPrimary: STYLE_SOURCES.wakeboarding.primary,
    });
  `);
  assert.match(result.containerPrimary, /NOW SOURCED PER STYLE/, 'the container entry must redirect to per-style sourcing, matching combat/cycling/yoga');
  [result.surfingPrimary, result.skimboardingPrimary, result.wakeboardingPrimary].forEach(primary=>{
    assert.ok(primary.length > 200, 'the real citation content must live on the style, not the container');
    assert.ok(!primary.includes('NOT YET SOURCED'));
    assert.match(primary, /doi:/i, 'must include at least one real DOI');
  });
});

test('sabotage-relevant: every technique referenced by WATERSPORTS_TECHNIQUE_GROUPS has a real WATERSPORTS_TECHNIQUE_DETAILS entry with points and a valid icon', (assert)=>{
  const chunks = [extractConst(src, 'WATERSPORTS_TECHNIQUE_GROUPS'), extractConst(src, 'WATERSPORTS_TECHNIQUE_DETAILS'), extractConst(src, 'WATERSPORTS_ICONS')];
  const [issues] = runSandbox(chunks, `
    const out = [];
    Object.keys(WATERSPORTS_TECHNIQUE_GROUPS).forEach(groupName=>{
      WATERSPORTS_TECHNIQUE_GROUPS[groupName].poses.forEach(name=>{
        const detail = WATERSPORTS_TECHNIQUE_DETAILS[name];
        if(!detail){ out.push(['MISSING', groupName, name]); return; }
        if(!detail.points || detail.points.length === 0) out.push(['EMPTY_POINTS', groupName, name]);
        if(!detail.icon || !WATERSPORTS_ICONS[detail.icon]) out.push(['BAD_ICON', groupName, name]);
      });
    });
    __capture.push(out);
  `);
  assert.deepStrictEqual(issues, []);
});

test('REAL invocation: renderWatersportsTechniques renders every group and technique into actual DOM, with a working YouTube search link', (assert)=>{
  const groupsSrc = extractConst(src, 'WATERSPORTS_TECHNIQUE_GROUPS');
  const fnSrcs = [
    extractConst(src, 'WATERSPORTS_ICONS'),
    extractConst(src, 'WATERSPORTS_TECHNIQUE_DETAILS'),
    groupsSrc,
    extractFunction(src, 'renderWatersportsTechniques'),
  ];
  // Expected counts are derived from the real source, not hardcoded — this
  // keeps the test correct as more disciplines are added (wakeboarding,
  // kite-assisted surfing) without needing an update every time, while still
  // being a real render-into-DOM check, not just a source-content check.
  const [expected] = runSandbox([groupsSrc], `
    const groupCount = Object.keys(WATERSPORTS_TECHNIQUE_GROUPS).length;
    const poseCount = Object.values(WATERSPORTS_TECHNIQUE_GROUPS).reduce((sum, g)=> sum + g.poses.length, 0);
    __capture.push({groupCount, poseCount});
  `);
  const { document } = runJsdom('<div id="watersportsTechniquesList"></div>', '', [...fnSrcs, `renderWatersportsTechniques();`]);
  const groupEls = document.querySelectorAll('#watersportsTechniquesList details.posing-class');
  assert.strictEqual(groupEls.length, expected.groupCount, `expected ${expected.groupCount} technique groups (matching the real WATERSPORTS_TECHNIQUE_GROUPS source)`);
  const techEls = document.querySelectorAll('#watersportsTechniquesList details.pose-detail-wrap');
  assert.strictEqual(techEls.length, expected.poseCount, `expected all ${expected.poseCount} techniques rendered across the groups`);
  assert.ok(expected.groupCount >= 5, 'sabotage-relevant: must actually include Skimboarding and Wakeboarding as real groups, not just the 3 Surfing sub-groups');
  const firstLink = document.querySelector('#watersportsTechniquesList .ex-video-link');
  assert.ok(firstLink, 'each technique must render a real form-video search link');
  assert.match(firstLink.getAttribute('href'), /^https:\/\/www\.youtube\.com\/results\?search_query=/);
});

test('REAL invocation: toggleWatersportsTechniquesCard shows the card only when Watersports is the active PROGRAM (not filtered by active style, matching how Combat Techniques shows all styles at once)', (assert)=>{
  const fnSrcs = [
    extractConst(src, 'WATERSPORTS_ICONS'),
    extractConst(src, 'WATERSPORTS_TECHNIQUE_DETAILS'),
    extractConst(src, 'WATERSPORTS_TECHNIQUE_GROUPS'),
    extractFunction(src, 'renderWatersportsTechniques'),
    extractFunction(src, 'toggleWatersportsTechniquesCard'),
  ];
  const bodyHtml = `<div class="card" id="watersportsTechniquesCard" style="display:none"><div id="watersportsTechniquesList"></div></div>`;

  const { document: docOn } = runJsdom(bodyHtml, `window.activeProgram = 'watersports';`, [...fnSrcs, `toggleWatersportsTechniquesCard();`]);
  assert.notStrictEqual(docOn.getElementById('watersportsTechniquesCard').style.display, 'none', 'must show when Watersports is active');
  assert.ok(docOn.querySelectorAll('#watersportsTechniquesList details.pose-detail-wrap').length > 0, 'must actually render content when shown, not just toggle visibility');

  const { document: docOff } = runJsdom(bodyHtml, `window.activeProgram = 'climbing';`, [...fnSrcs, `toggleWatersportsTechniquesCard();`]);
  assert.strictEqual(docOff.getElementById('watersportsTechniquesCard').style.display, 'none', 'must stay hidden for any other active program');
});

test('PROGRAM_MASTERCLASS.watersports and MASTERCLASS_LIBRARY.watersportsTechniquesCard are wired to each other and to the real render function', (assert)=>{
  const chunks = [extractConst(src, 'PROGRAM_MASTERCLASS')];
  const [pm] = runSandbox(chunks, `__capture.push(PROGRAM_MASTERCLASS.watersports);`);
  assert.deepStrictEqual(pm, {cardId: 'watersportsTechniquesCard', label: 'Watersports Techniques'});

  const libSrc = extractConst(src, 'MASTERCLASS_LIBRARY');
  assert.match(libSrc, /watersportsTechniquesCard:\{label:'Watersports Techniques',\s*render:\(\)=>renderWatersportsTechniques\(\)\}/,
    'MASTERCLASS_LIBRARY must register the card with the real render function, not a stub');
});

test('sabotage-relevant: toggleWatersportsTechniquesCard is actually wired into the program-switch flow (not just defined and never called)', (assert)=>{
  const callSites = (src.match(/toggleWatersportsTechniquesCard\(\);/g) || []).length;
  assert.strictEqual(callSites, 2, 'expected exactly 2 real call sites: initial render and the program-select onchange handler, matching every sibling toggleXTechniquesCard');
});

test('the Learn view has a real #watersportsTechniquesCard / #watersportsTechniquesList markup pair, and the Training Style selector has a real #watersportsCard / #watersportsSelector / #watersportsDesc markup set', (assert)=>{
  const learnViewHtml = extractElementById(src, 'learnView');
  assert.ok(learnViewHtml.includes('id="watersportsTechniquesCard"'));
  assert.ok(learnViewHtml.includes('id="watersportsTechniquesList"'));
  assert.ok(src.includes('id="watersportsCard"'));
  assert.ok(src.includes('id="watersportsSelector"'));
  assert.ok(src.includes('id="watersportsDesc"'));
});

// --- Container mechanics: storage-key namespacing, matching Combat/Cycling ---

test('exKey and workoutKey namespace by the active watersports style, matching the combat/cycling pattern exactly (so Surfing and a future Skimboarding never collide on the same day/slot)', (assert)=>{
  const chunks = [
    extractFunction(src, 'slugifyExerciseName'),
    extractFunction(src, 'exKey'),
    extractFunction(src, 'workoutKey'),
  ];
  const [result] = runSandbox(chunks, `
    var activeMartialArt = 'boxing';
    var activeCyclingStyle = 'road';
    var activeWatersportsStyle = 'surfing';
    var activeMedicalStyle = 'hypertension';
    __capture.push({
      ex: exKey('watersports', 'd1', 0),
      workout: workoutKey('2026-01-01', 'watersports', 'd1'),
      exOtherProgram: exKey('strength', 'd1', 0),
    });
  `);
  assert.strictEqual(result.ex, 'ex:watersports:surfing:d1:0');
  assert.strictEqual(result.workout, 'workout:2026-01-01:watersports:surfing:d1');
  assert.strictEqual(result.exOtherProgram, 'ex:strength:d1:0', 'non-container programs must be completely unaffected');
});

test('parseExKey correctly parses a real watersports:surfing key back into program/dayId/idx/exDef, matching the combat/cycling 5-segment format', (assert)=>{
  const chunks = [
    extractConst(src, 'programs'),
    extractConst(src, 'WATERSPORTS_STYLES'),
    `var COMBAT_STYLES = {}; var CYCLING_STYLES = {};`,
    extractFunction(src, 'parseExKey'),
  ];
  const [result] = runSandbox(chunks, `
    __capture.push(parseExKey('ex:watersports:surfing:d1:0'));
  `);
  assert.ok(result, 'must successfully parse a real 5-segment watersports key');
  assert.strictEqual(result.program, 'watersports');
  assert.strictEqual(result.dayId, 'd1');
  assert.strictEqual(result.idx, 0);
  assert.strictEqual(result.exDef.name, 'Straight-Arm Lat Pulldown');
  assert.match(result.dayLabel, /Watersports \(Surfing\)/);
});

test('STYLE_KEY_FOR_PROGRAM.watersports resolves to the real activeWatersportsStyle variable, matching the combat/cycling/yoga/medical pattern', (assert)=>{
  const chunks = [extractConst(src, 'STYLE_KEY_FOR_PROGRAM')];
  const [result] = runSandbox(chunks, `
    var activeWatersportsStyle = 'surfing';
    __capture.push(STYLE_KEY_FOR_PROGRAM.watersports());
  `);
  assert.strictEqual(result, 'surfing');
});

test('getExerciseLocationIndex includes watersports styles (excluded from the leaf-program loop, added via its own WATERSPORTS_STYLES loop, matching combat/cycling)', (assert)=>{
  const chunks = [
    extractConst(src, 'programs'),
    extractConst(src, 'MEDICAL_STYLES'),
    `var COMBAT_STYLES = {}; var CYCLING_STYLES = {}; var YOGA_STYLES = {};`,
    extractConst(src, 'WATERSPORTS_STYLES'),
    `var exerciseLocationIndex = null;`,
    extractFunction(src, 'getExerciseLocationIndex'),
  ];
  const [locs] = runSandbox(chunks, `__capture.push(getExerciseLocationIndex()['Straight-Arm Lat Pulldown']);`);
  assert.ok(Array.isArray(locs) && locs.length >= 1, 'Straight-Arm Lat Pulldown must be indexed via the watersports styles loop');
  assert.strictEqual(locs[0].program, 'watersports');
  assert.strictEqual(locs[0].style, 'surfing');
});

test('loadActiveProgram migrates a stored "surfing" active-program (real for one version, v3.140, before this refactor) to "watersports" instead of silently falling back to the default', async (assert)=>{
  const chunks = [
    extractConst(src, 'programs'),
    extractConst(src, 'WATERSPORTS_STYLES'),
    extractFunction(src, 'loadWatersportsStyle'),
    extractFunction(src, 'loadActiveProgram'),
  ];
  const [result] = await runSandboxAsync([
    `
      var activeProgram = 'strength';
      var activeWatersportsStyle = 'surfing';
      var dayDefs = null;
      function getTodayKey(){ return '2026-01-01'; }
      var window = {
        storage: {
          get: async (key)=>{
            if(key === 'active-program') return {value: 'surfing'};
            if(key === 'watersports-style') return {value: 'surfing'};
            return null;
          },
          set: async ()=>{},
        },
      };
    `,
    ...chunks,
  ], `
    await loadWatersportsStyle();
    await loadActiveProgram();
    __capture.push({activeProgram, dayCount: Object.keys(dayDefs || {}).length});
  `);
  assert.strictEqual(result.activeProgram, 'watersports', 'a stored "surfing" value must migrate to the new container program key');
  assert.strictEqual(result.dayCount, 7, 'dayDefs must end up populated with real days, not the container\'s empty {} placeholder — proves loadWatersportsStyle running first actually mattered');
});

run();
