'use strict';
// Behavioral coverage for the new Surfing program — a land-based S&C
// program (surfing itself only develops in the water) plus a full Learn-tab
// masterclass, requested at the same standard as every other program in
// this app: real, verified citations and complete technique content, not a
// placeholder.
//
// Mirrors this session's own citation-accuracy audit discipline: every
// completeness check that audit ran against the existing library (exercise
// cues present, masterclass technique details present, no orphaned group
// entries) is re-run here against the new surfing content specifically, so
// a future edit that breaks it is caught the same way those gaps were
// caught elsewhere in the app.
const { readIndexSource, extractConst, extractFunction, extractElementById, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

const { test, run } = makeRunner('test-surfing-program.js');

test('programs.surfing exists with a real 7-day structure and every exercise resolves to a real library entry', (assert)=>{
  const chunks = [extractConst(src, 'programs'), extractConst(src, 'exerciseInfo')];
  const [result] = runSandbox(chunks, `
    const names = new Set();
    Object.values(programs.surfing.days).forEach(day=>{
      (day.exercises || []).forEach(ex=> names.add(ex.name));
    });
    __capture.push({
      label: programs.surfing.label,
      dayCount: Object.keys(programs.surfing.days).length,
      hasRestDay: Object.values(programs.surfing.days).some(d=> d.rest === true),
      missing: [...names].filter(n=> !exerciseInfo[n]),
      exerciseCount: names.size,
    });
  `);
  assert.strictEqual(result.label, 'Surfing');
  assert.strictEqual(result.dayCount, 7, 'must follow the same d1-d7 weekly structure every other program uses');
  assert.strictEqual(result.hasRestDay, true);
  assert.deepStrictEqual(result.missing, [], `every exercise referenced by the program must have a real exerciseInfo entry, found missing: ${JSON.stringify(result.missing)}`);
  assert.ok(result.exerciseCount >= 10, 'a real 7-day program should reference a real spread of exercises, not a token handful');
});

test('the 3 new exercises (Straight-Arm Lat Pulldown, Battle Ropes, Surfboard Pop-Up Drill) each have real cues, not empty placeholders', (assert)=>{
  const chunks = [extractConst(src, 'exerciseInfo')];
  const [result] = runSandbox(chunks, `
    const names = ['Straight-Arm Lat Pulldown', 'Battle Ropes', 'Surfboard Pop-Up Drill'];
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

test('PROGRAM_SOURCES.surfing has a real, non-placeholder citation', (assert)=>{
  const chunks = [extractConst(src, 'PROGRAM_SOURCES')];
  const [primary] = runSandbox(chunks, `__capture.push(PROGRAM_SOURCES.surfing.primary);`);
  assert.ok(primary.length > 200, 'a real citation entry should be substantial, not a one-line stub');
  assert.ok(!primary.includes('NOT YET SOURCED'), 'must not ship as an unsourced placeholder');
  assert.match(primary, /doi:/i, 'must include at least one real DOI, matching how every other program cites its sources');
});

test('sabotage-relevant: every technique referenced by SURF_TECHNIQUE_GROUPS has a real SURF_TECHNIQUE_DETAILS entry with points and a valid icon (the exact completeness gap this session found and fixed elsewhere in the app)', (assert)=>{
  const chunks = [extractConst(src, 'SURF_TECHNIQUE_GROUPS'), extractConst(src, 'SURF_TECHNIQUE_DETAILS'), extractConst(src, 'SURF_ICONS')];
  const [issues] = runSandbox(chunks, `
    const out = [];
    Object.keys(SURF_TECHNIQUE_GROUPS).forEach(groupName=>{
      SURF_TECHNIQUE_GROUPS[groupName].poses.forEach(name=>{
        const detail = SURF_TECHNIQUE_DETAILS[name];
        if(!detail){ out.push(['MISSING', groupName, name]); return; }
        if(!detail.points || detail.points.length === 0) out.push(['EMPTY_POINTS', groupName, name]);
        if(!detail.icon || !SURF_ICONS[detail.icon]) out.push(['BAD_ICON', groupName, name]);
      });
    });
    __capture.push(out);
  `);
  assert.deepStrictEqual(issues, []);
});

test('REAL invocation: renderSurfTechniques renders every group and technique into actual DOM, with a working YouTube search link', (assert)=>{
  const fnSrcs = [
    extractConst(src, 'SURF_ICONS'),
    extractConst(src, 'SURF_TECHNIQUE_DETAILS'),
    extractConst(src, 'SURF_TECHNIQUE_GROUPS'),
    extractFunction(src, 'renderSurfTechniques'),
  ];
  const { document } = runJsdom('<div id="surfTechniquesList"></div>', '', [...fnSrcs, `renderSurfTechniques();`]);
  const groupEls = document.querySelectorAll('#surfTechniquesList details.posing-class');
  assert.strictEqual(groupEls.length, 3, 'expected 3 technique groups (Before You Paddle Out, Paddling & Catching the Wave, Riding & Turning)');
  const techEls = document.querySelectorAll('#surfTechniquesList details.pose-detail-wrap');
  assert.strictEqual(techEls.length, 8, 'expected all 8 techniques rendered across the 3 groups');
  const firstLink = document.querySelector('#surfTechniquesList .ex-video-link');
  assert.ok(firstLink, 'each technique must render a real form-video search link');
  assert.match(firstLink.getAttribute('href'), /^https:\/\/www\.youtube\.com\/results\?search_query=/);
});

test('REAL invocation: toggleSurfTechniquesCard shows the card only when Surfing is the active program', (assert)=>{
  const fnSrcs = [
    extractConst(src, 'SURF_ICONS'),
    extractConst(src, 'SURF_TECHNIQUE_DETAILS'),
    extractConst(src, 'SURF_TECHNIQUE_GROUPS'),
    extractFunction(src, 'renderSurfTechniques'),
    extractFunction(src, 'toggleSurfTechniquesCard'),
  ];
  const bodyHtml = `<div class="card" id="surfTechniquesCard" style="display:none"><div id="surfTechniquesList"></div></div>`;

  const { document: docOn } = runJsdom(bodyHtml, `window.activeProgram = 'surfing';`, [...fnSrcs, `toggleSurfTechniquesCard();`]);
  assert.notStrictEqual(docOn.getElementById('surfTechniquesCard').style.display, 'none', 'must show when Surfing is active');
  assert.ok(docOn.querySelectorAll('#surfTechniquesList details.pose-detail-wrap').length > 0, 'must actually render content when shown, not just toggle visibility');

  const { document: docOff } = runJsdom(bodyHtml, `window.activeProgram = 'climbing';`, [...fnSrcs, `toggleSurfTechniquesCard();`]);
  assert.strictEqual(docOff.getElementById('surfTechniquesCard').style.display, 'none', 'must stay hidden for any other active program');
});

test('PROGRAM_MASTERCLASS.surfing and MASTERCLASS_LIBRARY.surfTechniquesCard are wired to each other and to the real render function', (assert)=>{
  const chunks = [extractConst(src, 'PROGRAM_MASTERCLASS')];
  const [pm] = runSandbox(chunks, `__capture.push(PROGRAM_MASTERCLASS.surfing);`);
  assert.deepStrictEqual(pm, {cardId: 'surfTechniquesCard', label: 'Surfing Fundamentals'});

  const libSrc = extractConst(src, 'MASTERCLASS_LIBRARY');
  assert.match(libSrc, /surfTechniquesCard:\s*\{label:'Surfing Fundamentals',\s*render:\(\)=>renderSurfTechniques\(\)\}/,
    'MASTERCLASS_LIBRARY must register the card with the real render function, not a stub');
});

test('sabotage-relevant: toggleSurfTechniquesCard is actually wired into the program-switch flow (not just defined and never called)', (assert)=>{
  const callSites = (src.match(/toggleSurfTechniquesCard\(\);/g) || []).length;
  assert.strictEqual(callSites, 2, 'expected exactly 2 real call sites: initial render and the program-select onchange handler, matching every sibling toggleXTechniquesCard');
});

test('the Learn view has a real #surfTechniquesCard / #surfTechniquesList markup pair (not just JS with nothing to render into)', (assert)=>{
  const learnViewHtml = extractElementById(src, 'learnView');
  assert.ok(learnViewHtml.includes('id="surfTechniquesCard"'));
  assert.ok(learnViewHtml.includes('id="surfTechniquesList"'));
});

run();
