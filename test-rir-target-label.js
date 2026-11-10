'use strict';
// v3.550 (BL-10, audit H-5): a target RIR on every prescription.
// targetRirLabel(ex, program) returns {short, words} by class (speed work,
// Medical/Senior, strength tier, compound, isolation) or null when the
// prescription has no rep count; rirLabelHtml renders the row's label; the
// workout row calls it once, inside .ex-sets, outside RPE mode.
//
// Real invocation: the real targetRirLabel and rirLabelHtml over the real
// exerciseInfo (content-exercises.js), getRepRangeTier and
// COMPOUND_CATEGORIES; the markup parsed with jsdom; a real-call count over
// the extracted renderWorkout.
//
// Sabotage: make rirLabelHtml return '' and criterion 3 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-rir-target-label.js');
const content = fs.readFileSync(path.join(__dirname, 'content-exercises.js'), 'utf8');
const INFO = extractConst(content, 'exerciseInfo');
const CHUNKS = [INFO, extractConst(src, 'COMPOUND_CATEGORIES'), extractConst(src, 'RIR_TARGETS'), extractConst(src, 'RIR_SPEED_CATEGORIES'), extractConst(src, 'RIR_NO_LABEL_CATEGORIES'), /^const RIR_NO_LABEL_NAME = .*$/m.exec(src)[0],
  ...['escapeHtml', 'getRepRangeTier', 'targetRirLabel', 'rirLabelHtml'].map(f => extractFunction(src, f))];
const label = (name, sets, program = 'strength', deload = false) => runSandbox(CHUNKS, `__capture.push(targetRirLabel(${JSON.stringify({name, sets})}, ${JSON.stringify(program)}, ${deload}));`)[0];

test('criterion 1: the exact short and words for each class', (assert)=>{
  const cases = [
    ['Back Squat', '5×5', 'strength', '2–3 RIR (last set 1–2)', 'Stop 2–3 reps short; last set 1–2'],
    ['Barbell Row', '4×6-8', 'strength', '1–3 RIR', 'Stop 1–3 reps short'],
    ['Lateral Raise', '3×12-15', 'strength', '0–2 RIR', 'Stop 0–2 reps short'],
    // short shortened from the spec's 'Stop with 3+ in reserve; speed over
    // grind' (it wrapped to five lines in the row at 402 px); words unchanged.
    ['Power Clean', '5×3', 'oly', '3+ RIR · fast', 'Stop 3+ reps short; speed over grind'],
    ['Box Jump', '4×5', 'athletic', '3+ RIR · fast', 'Stop 3+ reps short; speed over grind'],
    ['Bench Press', '3×8-10', 'medical', '3–4 RIR', 'Stop 3–4 reps short'],
    ['Bench Press', '3×8-10', 'senior', '3–4 RIR', 'Stop 3–4 reps short'],
  ];
  for(const [name, sets, program, short, words] of cases){
    assert.deepStrictEqual(label(name, sets, program), {short, words}, `${name} ${sets} on ${program}`);
  }
  // Anchors: the classes come from the real exercise data.
  const [cats] = runSandbox([INFO], `__capture.push(['Back Squat', 'Barbell Row', 'Lateral Raise', 'Power Clean', 'Box Jump', 'Bench Press'].map(n => exerciseInfo[n] && exerciseInfo[n].category));`);
  assert.deepStrictEqual(cats, ['squat', 'pull', 'shoulder', 'oly', 'jump', 'push']);
});

test('criterion 2: cardio, timed, distance, counted-unit and AMRAP rows get no label; nor do core rows or an exercise with no known category', (assert)=>{
  for(const [name, sets] of [['Easy Run', '25-30 min'], ['Plank', '3×45s'], ['Plank', '3×30-45 sec'], ["Farmer's Carry", '4×30yd'],
    ['Farmers Carry (Heavy)', '3×30m'], ['Push-up', '3×AMRAP'], ['Burpees', '3×10'], ['My Own Lift', '3×8'],
    ['Heavy Bag — Speed Combos', '8×1.5min rounds'], ['Heel-to-Toe Walk', '3×10 steps'], ['Diaphragmatic Breathing', '3×10 breaths'],
    ['The Hundred', '1×100 pumps'], ['Cat-Cow Mobility', '2×10'], ['Hip CARs', '2×5/direction'], ['Shoulder CARs', '2×5/side'], ['Cable Crunch', '3×12-15']]){
    assert.strictEqual(label(name, sets), null, `${name} ${sets}`);
  }
});

test('criterion 3: rirLabelHtml gives one element whose text is short and whose aria-label is words ("reps", not "RIR"); \'\' when there is no label', (assert)=>{
  const [html, none] = runSandbox(CHUNKS, `__capture.push(rirLabelHtml({name: 'Back Squat', sets: '5×5'}, 'strength'), rirLabelHtml({name: 'Plank', sets: '3×45s'}, 'strength'));`);
  const doc = new JSDOM(`<div>${html}</div>`).window.document;
  const els = doc.querySelectorAll('div > *');
  assert.strictEqual(els.length, 1);
  assert.strictEqual(els[0].textContent, '2–3 RIR (last set 1–2)');
  assert.strictEqual(els[0].getAttribute('aria-label'), 'Stop 2–3 reps short; last set 1–2');
  assert.ok(!/RIR/.test(els[0].getAttribute('aria-label')));
  assert.strictEqual(none, '');
});

test('criterion 4: renderWorkout makes exactly one rirLabelHtml( call, inside the .ex-sets cell after the prescription span, and not in RPE mode (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/rirLabelHtml\(/g) || []).length, 1);
  const cell = /<div class="ex-sets">([^\n]*)<\/div>/.exec(body);
  assert.ok(cell, 'the .ex-sets cell');
  assert.match(cell[1], /^<span [^\n]*\$\{escapeHtml\(ex\.sets\)\}<\/span>\$\{loadSuggestionMode === 'rpe' \? '' : rirLabelHtml\(ex, activeProgram, inDeloadWeek\)\}$/);
});

test('every built-in strength-program lift with a plain rep count (like 4×6-8) gets a label (none silently dropped)', (assert)=>{
  const [r] = runSandbox([...CHUNKS, extractConst(src, 'programs')], `
    const missing = [];
    for(const [d, day] of Object.entries(programs.strength.days)) for(const ex of day.exercises || []){
      const cat = exerciseInfo[ex.name] && exerciseInfo[ex.name].category;
      const plain = /^\\d+×\\d+(?:-\\d+)?$/.test(ex.sets);
      if(cat && !['cardio', 'core'].includes(cat) && plain && !targetRirLabel(ex, 'strength')) missing.push(ex.name + ' ' + ex.sets);
    }
    __capture.push(missing);`);
  assert.deepStrictEqual(r, []);
});

test('review fixes: a deload week reads 3–4 RIR; reps and each are still rep counts; the label is announced by its words (role img)', (assert)=>{
  assert.deepStrictEqual(label('Back Squat', '5×5', 'strength', true), {short: '3–4 RIR · deload', words: 'Deload week: stop 3–4 reps short'});
  assert.deepStrictEqual(label('Power Clean', '5×3', 'oly', true).short, '3+ RIR · fast', 'speed work keeps its own cue');
  assert.strictEqual(label('Barbell Row', '4×6-8 reps').short, '1–3 RIR');
  assert.strictEqual(label('Barbell Row', '4×8 each').short, '1–3 RIR');
  assert.strictEqual(label('Barbell Row', '4×8/side').short, '1–3 RIR');
  const [html] = runSandbox(CHUNKS, `__capture.push(rirLabelHtml({name: 'Barbell Row', sets: '4×6-8'}, 'strength'));`);
  assert.strictEqual(new JSDOM(html).window.document.querySelector('.ex-rir').getAttribute('role'), 'img');
});

test('across every built-in program and style, no stretch, mobility, breathing, balance, pose or drill row gets a label', (assert)=>{
  const [r] = runSandbox([...CHUNKS, ...['programs', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES'].map(c => extractConst(src, c))], `
    const bad = []; let labelled = 0;
    const visit = (p, days) => { for(const d of Object.values(days || {})) for(const ex of d.exercises || []){
      const t = targetRirLabel(ex, p);
      if(t) labelled++;
      const text = ex.name + ' ' + ex.sets;
      if(t && /stretch|mobility|breath|pose|CARs|walk|hold|flow|qigong|savasana/i.test(text)) bad.push(text);
      if(t && /balance/i.test(text) && ex.name !== 'Snatch Balance') bad.push(text);
      // Land drills for board sports are explosive ('jump'): only the speed cue.
      if(t && /drill/i.test(text) && t.short !== '3+ RIR · fast') bad.push(text);
    } };
    for(const [k, p] of Object.entries(programs)) visit(k, p.days);
    for(const [T, n] of [[MEDICAL_STYLES, 'medical'], [COMBAT_STYLES, 'combat'], [CYCLING_STYLES, 'cycling'], [WATERSPORTS_STYLES, 'watersports'], [YOGA_STYLES, 'yoga']]) for(const st of Object.values(T)) visit(n, st.days);
    __capture.push({bad, labelled});`);
  assert.ok(r.labelled > 150, 'anchor: rows labelled ' + r.labelled);
  assert.deepStrictEqual(r.bad, []);
});

run();
