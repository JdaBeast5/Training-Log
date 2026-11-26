'use strict';
// v3.651 (BL-79, owner 2026-11-24): "when drop set is pressed it should add a
// set at a lower weight that is an appropriate drop to challenge."
//  - computeSuggestedSet answers a {type:'drop', n} signal: drop 1 is 25%
//    lighter than the set, drop 2 20% lighter than drop 1, snapped DOWN to what
//    the person's equipment loads; if that isn't lighter, one loadable step
//    lower; never under the bar; else no number. RPE mode never swallows it.
//  - dropSetEligible decides where Drop set appears (built on targetRirLabel).
//  - the set sheet shows drop lines and saves them through the row's own drop
//    rows (one change each), after the parent set's save; the chip shows them.
//  - drops never count as progression or a PR (all of that reads entry.sets).
//
// Real invocations throughout: the real engine with the real equipment model
// and exercise library; the real sheet (openSetSheet, saveSetSheet,
// wireSetSheet) over a row built with the real buildDropRowsHtml and wired by
// the real wireSetRow code (its save wrapper and drop block, extracted), with
// the real saveExDropSet and getExLog over an in-memory window.storage.
//
// Sabotage (each run and seen failing):
//  - remove `&& !isDrop` from the RPE short-circuit: criterion 2 fails;
//  - snap 'nearest' instead of 'down': criterion 3 gives 145, not 135;
//  - drop the clinical check from dropSetEligible: criterion 4 fails;
//  - make the sheet call saveExDropSet directly: the change count fails.
//  - review fixes: save a drop without queueing on the row, skip clearing a
//    saved drop, list drops on a row without the control, call every missing
//    suggestion "lightest", or drop the header-name fallback: each fails its test.
const { readIndexSource, extractFunction, extractConst, extractElementById, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-drop-set-suggestion.js');
const src = readIndexSource();

const ENGINE_CONSTS = ['DELOAD_CYCLE_WEEKS', 'RPE_BY_CYCLE_WEEK', 'CATEGORY_LOAD_INCREMENT', 'MEDICAL_STYLES',
  'BARBELL_STANDARDS', 'DUMBBELL_DEFAULTS', 'BARBELL_EXERCISES', 'LB_PER_KG', 'LOAD_INCREMENT_SCALE', 'exerciseInfo'];
const ENGINE_FNS = ['cycleWeekOf', 'targetRpeForWeek', 'rpeTargetFor', 'rpeTargetForDay', 'rirFromRpe', 'loadForRpeTarget',
  'getLoadIncrement', 'parseTopRep', 'parseBottomRep', 'computeSuggestedSet', 'roundToIncrement', 'snapToLoadable',
  'getEquipment', 'isBarbellExercise', 'isDumbbellExercise', 'toDisplayWeight', 'toCanonicalLb', 'trimUnitNum',
  'smallestLoadStep', 'capClinicalRpeLoad', 'loadStepFor', 'platesPerSide'];
const ELIG_CONSTS = ['RIR_TARGETS', 'RIR_SPEED_CATEGORIES', 'RIR_NO_LABEL_CATEGORIES', 'RIR_NO_LABEL_NAME', 'COMPOUND_CATEGORIES', 'DISTANCE_EXERCISE_NAME_RE'];
const ELIG_FNS = ['getRepRangeTier', 'targetRirLabel', 'dropSetEligible', 'isDistanceExercise', 'getSetFieldUnit'];
const ENGINE = [
  "var loadSuggestionMode = 'auto'; var activeProgram = 'strength';",
  ...[...ENGINE_CONSTS, ...ELIG_CONSTS].map(n => extractConst(src, n)),
  ...[...ENGINE_FNS, ...ELIG_FNS].map(n => extractFunction(src, n)),
];
const sbx = body => runSandbox(ENGINE, body)[0];
const BENCH = "{name:'Bench Press', sets:'7×4-6'}";

test('criterion 1: real computeSuggestedSet: Bench 185 -> 135 -> 105 lb; a 100 kg parent -> 75 -> 60 kg; reps are not suggested', (assert)=>{
  const lb = sbx(`const a = computeSuggestedSet({weight:185}, {type:'drop', n:1}, false, 'push', ${BENCH});
    const b = computeSuggestedSet({weight:135}, {type:'drop', n:2}, false, 'push', ${BENCH});
    __capture.push([a, b]);`);
  // Re-pinned v3.673 (BL-85, B7): the drop is floored to a loadable weight, never rounded to the nearest first, so 185 -> 135 (was 140), drop 2 from 135 -> 105 (was 110).
  assert.deepStrictEqual(lb, [{weight:135, reps:null, reason:'drop'}, {weight:105, reps:null, reason:'drop'}]);
  const kg = sbx(`weightUnit = 'kg';
    const a = computeSuggestedSet({weight: toCanonicalLb(100)}, {type:'drop', n:1}, false, 'squat', {name:'Barbell Back Squat', sets:'5×5'});
    const b = computeSuggestedSet({weight: toCanonicalLb(a.weight)}, {type:'drop', n:2}, false, 'squat', {name:'Barbell Back Squat', sets:'5×5'});
    __capture.push([a.weight, b.weight, a.reason]);`);
  assert.deepStrictEqual(kg, [75, 60, 'drop']);
});

// v3.673 (BL-85, B7): the drop is at least 25% lighter (drop 2: 20%): floored, never rounded to the nearest first.
test('BL-85: a 45 lb dumbbell -> 30; 45 on a lift the app has no equipment model for (Lateral Raise) -> 30, not 35; a 100 lb bar -> 75; 185 -> 135; drop 1 never above 0.75 x its parent', (assert)=>{
  const out = sbx(`const d = (w, name, n) => { const r = computeSuggestedSet({weight:w}, {type:'drop', n: n || 1}, false, 'push', {name, sets:'3×10'}); return r && r.weight; };
    const sweep = [];
    for(let w = 50; w <= 400; w += 2.5) for(const name of ['Bench Press', 'DB Curl', 'Lateral Raise']){ const v = d(w, name); if(v != null) sweep.push([w, name, v]); }
    __capture.push({db: d(45, 'DB Shoulder Press'), lateral: d(45, 'Lateral Raise'), bar100: d(100, 'Bench Press'), bench: d(185, 'Bench Press'), two: d(100, 'DB Curl', 2), sweep});`);
  assert.strictEqual(out.db, 30);
  assert.strictEqual(out.lateral, 30, 'the tester\'s 35 (22% off) is gone');
  assert.strictEqual(out.bar100, 75);
  assert.strictEqual(out.bench, 135);
  assert.ok(out.bench <= 185 * 0.75);
  assert.strictEqual(out.two, 80, 'drop 2: 20% lighter');
  assert.ok(out.sweep.length > 300, 'anchor: the sweep ran');
  const over = out.sweep.filter(([w, , v]) => v > w * 0.75 + 1e-9);
  assert.deepStrictEqual(over, [], 'no drop 1 above 0.75 x its parent');
});

test('criterion 2: in RPE mode with a valid rpeCtx the drop still answers reason "drop" (the RPE short-circuit does not swallow it)', (assert)=>{
  const out = sbx(`loadSuggestionMode = 'rpe';
    const ctx = {e1rm: 240, stepE1rm: 240, week: 1, program: 'strength', category: 'push'};
    const plain = computeSuggestedSet({weight:185}, null, false, 'push', ${BENCH}, {weight:185, reps:5}, ctx);
    const drop = computeSuggestedSet({weight:185}, {type:'drop', n:1}, false, 'push', ${BENCH}, {weight:185, reps:5}, ctx);
    __capture.push([plain && plain.reason, drop.reason, drop.weight]);`);
  assert.strictEqual(out[0], 'rpe', 'anchor: RPE mode is really on for a normal suggestion');
  assert.deepStrictEqual(out.slice(1), ['drop', 135]); // re-pinned v3.673 (BL-85): was 140
});

test('criterion 3: the floor: a 10 lb dumbbell -> 5; the empty 45 lb bar -> null; without 2.5 lb plates Bench 185 -> 135, loadable exactly', (assert)=>{
  const out = sbx(`
    const db15 = computeSuggestedSet({weight:15}, {type:'drop', n:1}, false, 'shoulder', {name:'Dumbbell Lateral Raise', sets:'3×12-15'});
    const db10 = computeSuggestedSet({weight:10}, {type:'drop', n:1}, false, 'shoulder', {name:'Dumbbell Lateral Raise', sets:'3×12-15'});
    const bar = computeSuggestedSet({weight:45}, {type:'drop', n:1}, false, 'push', ${BENCH});
    equipmentProfile = {lb: {plates: [45, 25, 10, 5]}};
    const coarse = computeSuggestedSet({weight:185}, {type:'drop', n:1}, false, 'push', ${BENCH});
    __capture.push([db15.weight, db10.weight, bar, coarse.weight, platesPerSide(coarse.weight, getEquipment()).remainder]);`);
  assert.deepStrictEqual(out, [10, 5, null, 135, 0]);
});

test('criterion 4: real dropSetEligible: yes for Bench, EZ Bar Curl, Cable Fly; no for Push-up, Incline Walk, Plank 3×45s, Power Clean, medical, senior and a deload week', (assert)=>{
  const out = sbx(`const e = (name, sets, extra) => Object.assign({name, sets}, extra || {});
    __capture.push({
      yes: [dropSetEligible(e('Bench Press', '7×4-6'), 'strength', false), dropSetEligible(e('EZ Bar Curl', '3×8-12'), 'bodybuilding', false), dropSetEligible(e('Cable Fly', '3×12-15'), 'bodybuilding', false)],
      no: [dropSetEligible(e('Push-up', '3×8-12', {noWeight:true}), 'strength', false), dropSetEligible(e('Incline Walk', '20 min'), 'strength', false),
           dropSetEligible(e('Plank', '3×45s'), 'strength', false), dropSetEligible(e('Power Clean', '5×3'), 'strength', false),
           dropSetEligible(e('Bench Press', '3×8-10'), 'medical', false), dropSetEligible(e('Bench Press', '3×8-10'), 'senior', false),
           dropSetEligible(e('Bench Press', '7×4-6'), 'strength', true)],
      known: ['EZ Bar Curl', 'Cable Fly', 'Power Clean', 'Incline Walk', 'Plank'].every(n => !!exerciseInfo[n]),
    });`);
  assert.ok(out.known, 'anchor: every name is in the real library');
  assert.deepStrictEqual(out.yes, [true, true, true]);
  assert.deepStrictEqual(out.no, [false, false, false, false, false, false, false]);
});

// ---- The real sheet over a real row ----------------------------------------
const STATE = 'const setSheetState = {row:null, chip:null};';
if(!src.includes(STATE)) throw new Error('setSheetState not found');
const WIRE = (()=>{
  const start = src.indexOf('(function wireSetSheet(){');
  const end = src.indexOf('\n})();', start);
  if(start === -1 || end === -1) throw new Error('wireSetSheet not found');
  return src.slice(start, end + 6);
})();
// wireSetRow lives inside renderWorkout; its save wrapper and its drop block
// are taken verbatim, anchored on their own first and last lines.
const between = (a, b) => { const i = src.indexOf(a); const j = src.indexOf(b, i); if(i === -1 || j === -1) throw new Error('not found: ' + a); return src.slice(i, j + b.length); };
const ROW_SAVE = between('    const save = (evt)=>{\n      const p = saveNow(evt);', '      return p;\n    };');
const ROW_DROPS = between("    const dropBtn = setRow.querySelector('.set-drop-btn');", '        if(firstField) firstField.focus();\n      });\n    }');
const SHEET = extractElementById(src, 'setSheetScrim') + extractElementById(src, 'setSheet');
const SHEET_FNS = ['escapeHtml', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'setChipOwnerTag', 'commitSet',
  'setSheetWeightStep', 'openSetSheet', 'closeSetSheet', 'saveSetSheet', 'stepSetSheet', 'setSheetExercise', 'dropSetCue',
  'suggestDropWeight', 'setSheetAddDrop', 'refreshSetSheetDropBtn', 'writeDropsToRow', 'buildDropRowsHtml', 'renderSetChips',
  'saveExDropSet', 'getExLog', 'normalizeExEntry', 'todayEntryFor', 'exKey', 'slugifyExerciseName', 'recommendNextSet', 'parseTopRep', 'parseBottomRep'];
const DROP_MAX = extractConst(src, 'DROP_SET_MAX');

function mount(unit, logged){
  const w = unit === 'kg' ? '84' : '185';
  const list = `<div class="exercise-block open"><div class="set-chips"></div><div class="exercise"><input type="checkbox" data-idx="0"><div class="ex-name">Bench Press</div><div class="ex-sets"><span>7×4-6</span></div></div>
    <div class="sets-block">
      <div class="set-row" data-set-idx="0" data-ex-idx="0"><span class="set-row-owner">Bench Press</span><input class="ex-input ex-weight" placeholder="${unit}" value="${w}"><input class="ex-input ex-reps" value="5"><input class="ex-input ex-rpe" value=""><button class="set-drop-btn"></button><div class="set-drop-wrap"></div></div>
      <div class="set-row" data-set-idx="1" data-ex-idx="0"><span class="set-row-owner">Bench Press</span><input class="ex-input ex-weight" placeholder="${unit}" value="${w}"><input class="ex-input ex-reps" value="5"><input class="ex-input ex-rpe" value=""><button class="set-drop-btn"></button><div class="set-drop-wrap"></div></div>
    </div></div>`;
  const stored = JSON.stringify([{date: '2026-11-24', sets: [{weight: logged, reps: 5, rpe: null}, {weight: logged, reps: 5, rpe: null}]}]);
  const { window } = runJsdom(`<div id="exerciseList">${list}</div>${SHEET}`, `
    var weightUnit = '${unit}', distanceUnit = 'km', activeProgram = 'strength', loadSuggestionMode = 'auto', equipmentProfile = null;
    var selectedLogDate = '2026-11-24', activeDay = 'd1';
    window.requestAnimationFrame = fn => fn();
    const __store = {'ex:strength:d1:0': ${JSON.stringify(stored)}};
    window.storage = {
      get: async k => { await null; return k in __store ? {value: __store[k]} : null; },
      set: async (k, v) => { await null; __store[k] = v; },
    };
    window.__store = __store;
    window.__restTimer = 0; function startRestTimer(){ window.__restTimer++; }
    function icon(){ return ''; } function showUndoToast(){} function setExerciseBlockOpen(){}
    function renderAllSetChips(){ document.querySelectorAll('#exerciseList > .exercise-block').forEach(b => renderSetChips(b, null)); }
  `, [...ENGINE, STATE, DROP_MAX, ...SHEET_FNS.map(n => extractFunction(src, n)), WIRE, `
    // The row's own wiring, as wireSetRow does it. Its parent save is the
    // log's read-modify-write with the same awaits as saveExSet's, so a drop
    // that did not wait for it would be overwritten.
    window.__rowChanges = 0; window.__dropChanges = 0;
    document.querySelectorAll('.set-row').forEach(setRow => {
      const slot = 0, subVariant = null, showWeight = true, ex = {name: 'Bench Press'};
      const saveNow = async () => {
        const setIdx = Number(setRow.dataset.setIdx);
        const log = await getExLog(activeDay, slot, subVariant);
        const entry = todayEntryFor(log, ex.name);
        const wv = setRow.querySelector('.ex-weight').value;
        entry.sets[setIdx] = Object.assign({}, entry.sets[setIdx], {weight: wv === '' ? null : toCanonicalLb(wv), reps: Number(setRow.querySelector('.ex-reps').value), rpe: setRow.querySelector('.ex-rpe').value === '' ? null : Number(setRow.querySelector('.ex-rpe').value)});
        await null; await null;
        await window.storage.set(exKey(activeProgram, activeDay, slot, subVariant), JSON.stringify(log));
      };
      ${ROW_SAVE}
      ['.ex-weight', '.ex-reps', '.ex-rpe'].forEach(s => setRow.querySelector(s).addEventListener('change', () => { window.__rowChanges++; save(); }));
      ${ROW_DROPS}
      setRow.querySelector('.set-drop-wrap').addEventListener('change', () => window.__dropChanges++);
    });
    renderAllSetChips();
    window.__open = openSetSheet;
  `]);
  const doc = window.document;
  const $ = id => doc.getElementById(id);
  const row = () => doc.querySelectorAll('.set-row')[1];
  const settle = () => new Promise(r => setTimeout(r, 30));
  const stored2 = () => JSON.parse(window.__store['ex:strength:d1:0'])[0].sets[1];
  return { window, doc, $, row, settle, stored2, open: () => window.__open(row(), doc.querySelectorAll('.set-chip')[1]) };
}

test('criterion 5: the real sheet on a logged 185×5 Bench set: Drop set -> 135 and the compound cue; 9 reps + Save stores [{135, 9}] beside an unchanged parent; then 105; no third', async (assert)=>{
  // Re-pinned v3.673 (BL-85, B7): the drop is floored to a loadable weight, never rounded to the nearest first, so 185 -> 135 (was 140), drop 2 from 135 -> 105 (was 110).
  const ui = mount('lb', 185);
  ui.open();
  assert.strictEqual(ui.$('setSheetDropBtn').hidden, false, 'Drop set is offered on an eligible logged set');
  const before = JSON.stringify(ui.stored2());
  ui.$('setSheetDropBtn').click();
  const lines = () => ui.doc.querySelectorAll('#setSheetDrops .set-sheet-drop');
  assert.strictEqual(lines().length, 1);
  assert.strictEqual(lines()[0].querySelector('.set-sheet-drop-weight').value, '135');
  assert.strictEqual(lines()[0].querySelector('.set-sheet-drop-reps').value, '', 'reps are not suggested');
  assert.strictEqual(lines()[0].querySelector('.set-sheet-drop-cue').textContent, 'Drop 1 · 25% lighter, no rest · Stop 1–3 reps short');
  assert.strictEqual(ui.doc.activeElement, lines()[0].querySelector('.set-sheet-drop-reps'), 'the cursor goes to the reps');
  lines()[0].querySelector('.set-sheet-drop-reps').value = '9';
  ui.$('setSheetSave').click();
  await ui.settle();
  const after = ui.stored2();
  assert.deepStrictEqual(after.drops, [{weight: 135, reps: 9}]);
  const parent = Object.assign({}, after); delete parent.drops;
  assert.strictEqual(JSON.stringify(parent), before, 'the parent set is byte-identical');
  assert.strictEqual(ui.window.__dropChanges, 1, 'one change on the row\'s drop row: saved through the row, once');
  assert.ok(ui.window.__rowChanges >= 1, 'anchor: the parent was committed through the row first');
  assert.strictEqual(ui.window.__restTimer, 0, 'saving a drop starts no rest timer');
  // Drop 2 from drop 1's weight; no third.
  ui.open();
  assert.strictEqual(lines().length, 1, 'criterion 7: reopening lists the saved drop');
  assert.strictEqual(lines()[0].querySelector('.set-sheet-drop-weight').value, '135');
  assert.strictEqual(lines()[0].querySelector('.set-sheet-drop-reps').value, '9');
  ui.$('setSheetDropBtn').click();
  assert.strictEqual(lines()[1].querySelector('.set-sheet-drop-weight').value, '105');
  assert.strictEqual(lines()[1].querySelector('.set-sheet-drop-cue').textContent.slice(0, 27), 'Drop 2 · 20% lighter, no re');
  assert.strictEqual(ui.$('setSheetDropBtn').hidden, true, 'a third drop is not offered');
});

test('criterion 5: drop 2 follows drop 1 as entered, and a line left without reps is not saved', async (assert)=>{
  const ui = mount('lb', 185);
  ui.open();
  ui.$('setSheetDropBtn').click();
  const l1 = ui.doc.querySelector('#setSheetDrops .set-sheet-drop');
  l1.querySelector('.set-sheet-drop-pm[data-dir="1"]').click();
  assert.strictEqual(l1.querySelector('.set-sheet-drop-weight').value, '140', '+ steps by the loadable jump (2 × 2.5 lb) from 135 (re-pinned v3.673, BL-85: was 145 from 140)');
  l1.querySelector('.set-sheet-drop-weight').value = '150';
  ui.$('setSheetDropBtn').click();
  assert.strictEqual(ui.doc.querySelectorAll('#setSheetDrops .set-sheet-drop')[1].querySelector('.set-sheet-drop-weight').value, '120', '150 × 0.8');
  ui.$('setSheetSave').click();
  await ui.settle();
  assert.strictEqual(ui.stored2().drops, undefined);
  assert.strictEqual(ui.window.__dropChanges, 0);
});

test('criterion 5: in kg the stored drop is the lb conversion of what the sheet showed', async (assert)=>{
  const ui = mount('kg', 84 / 0.453592); // 84 kg logged, stored in lb (the app's LB_PER_KG)
  ui.open();
  ui.$('setSheetDropBtn').click();
  const line = ui.doc.querySelector('#setSheetDrops .set-sheet-drop');
  const shown = Number(line.querySelector('.set-sheet-drop-weight').value);
  assert.strictEqual(shown, 62.5, '84 × 0.75 = 63, snapped down to a loadable 62.5 kg');
  line.querySelector('.set-sheet-drop-reps').value = '8';
  ui.$('setSheetSave').click();
  await ui.settle();
  const d = ui.stored2().drops[0];
  assert.ok(Math.abs(d.weight - 62.5 / 0.453592) < 1e-9, `${d.weight} lb`);
  assert.strictEqual(d.reps, 8);
});

test('criterion 7: the logged chip shows the drop glyph and its aria-label ends ", 1 drop: 135×9" (re-pinned v3.673, BL-85: was 140)', async (assert)=>{
  const ui = mount('lb', 185);
  ui.open();
  ui.$('setSheetDropBtn').click();
  ui.doc.querySelector('.set-sheet-drop-reps').value = '9';
  ui.$('setSheetSave').click();
  await ui.settle();
  const chips = ui.doc.querySelectorAll('.set-chip');
  assert.ok(chips[1].querySelector('.set-chip-drop'), 'the glyph');
  assert.match(chips[1].getAttribute('aria-label'), /, 1 drop: 135×9$/);
  assert.ok(!chips[0].querySelector('.set-chip-drop') && !/drop/.test(chips[0].getAttribute('aria-label')), 'set 1 has none');
});

test('GUARD: on a row without the control (an ineligible exercise) Drop set is hidden and saved drops are not offered for editing', (assert)=>{
  const ui = mount('lb', 185);
  ui.row().querySelector('.set-drop-wrap').innerHTML = ui.window.buildDropRowsHtml([{weight:140, reps:9}], 1, true);
  ui.row().querySelector('.set-drop-btn').remove();
  ui.open();
  assert.strictEqual(ui.$('setSheetDropBtn').hidden, true);
  assert.strictEqual(ui.doc.querySelectorAll('#setSheetDrops .set-sheet-drop').length, 0);
});

// Review fixes (v3.651): found by the code review, each run and seen failing
// before its fix.
test('review: two drops saved in one Save both persist (their saves queue on the row, never race)', async (assert)=>{
  const ui = mount('lb', 185);
  ui.open();
  ui.$('setSheetDropBtn').click(); ui.$('setSheetDropBtn').click();
  const lines = ui.doc.querySelectorAll('#setSheetDrops .set-sheet-drop');
  lines[0].querySelector('.set-sheet-drop-reps').value = '9';
  lines[1].querySelector('.set-sheet-drop-reps').value = '7';
  ui.$('setSheetSave').click();
  await ui.settle();
  assert.deepStrictEqual(ui.stored2().drops, [{weight:135, reps:9}, {weight:105, reps:7}]); // re-pinned v3.673 (BL-85): was 140, 110
  assert.strictEqual(ui.window.__dropChanges, 2);
});

test('review: emptying a saved drop\'s reps and saving removes it; a blank drop in the middle keeps line n on drop n', async (assert)=>{
  const ui = mount('lb', 185);
  ui.open(); ui.$('setSheetDropBtn').click();
  ui.doc.querySelector('.set-sheet-drop-reps').value = '9';
  ui.$('setSheetSave').click(); await ui.settle();
  ui.open();
  ui.doc.querySelector('.set-sheet-drop-reps').value = '';
  ui.$('setSheetSave').click(); await ui.settle();
  assert.strictEqual(ui.stored2().drops, undefined, 'the drop is gone');
  // A blank first drop (kept by saveExDropSet) with a real second one.
  const two = mount('lb', 185);
  two.row().querySelector('.set-drop-wrap').innerHTML = two.window.buildDropRowsHtml([{}, {weight:110, reps:6}], 1, true);
  two.open();
  const lines = two.doc.querySelectorAll('#setSheetDrops .set-sheet-drop');
  assert.strictEqual(lines.length, 2);
  assert.strictEqual(lines[1].querySelector('.set-sheet-drop-weight').value, '110');
  two.$('setSheetSave').click(); await two.settle();
  assert.strictEqual(two.window.__dropChanges, 0, 'nothing changed, nothing written (no copy into drop 1)');
});

test('review: with no weight to drop from the line is blank and does not claim the lightest load', (assert)=>{
  const ui = mount('lb', 185);
  ui.open();
  ui.$('setSheetWeight').value = '';
  ui.$('setSheetDropBtn').click();
  const line = ui.doc.querySelector('#setSheetDrops .set-sheet-drop');
  assert.strictEqual(line.querySelector('.set-sheet-drop-weight').value, '');
  assert.strictEqual(line.querySelector('.set-sheet-drop-note').hidden, true);
  const bar = mount('lb', 45);
  bar.open(); bar.$('setSheetWeight').value = '45';
  bar.$('setSheetDropBtn').click();
  assert.strictEqual(bar.doc.querySelector('.set-sheet-drop-note').hidden, false, 'the empty bar says so');
});

test('review: a set added with + Add set (no owner label) still takes the exercise\'s name from its header', (assert)=>{
  const ui = mount('lb', 185);
  ui.row().querySelector('.set-row-owner').remove();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.setSheetExercise(ui.row()))), {name:'Bench Press', sets:'7×4-6'});
});

// ---- criterion 6: drops never count as progression or a PR ---------------
test('criterion 6: real topSetOf, maxWeightEver, buildPastSessions ignore drops (even a corrupt heavier one); real volumeOf adds them', (assert)=>{
  const out = runSandbox(["var selectedLogDate = '2026-11-24';", ...['topSetOf', 'sessionTopOf', 'maxWeightEver', 'buildPastSessions', 'volumeOf', 'dropVolumeOf', 'isMissedSet'].map(n => extractFunction(src, n))], `
    const plain = [{date:'2026-11-20', sets:[{weight:185, reps:5}, {weight:185, reps:5}]}];
    const withDrops = [{date:'2026-11-20', sets:[{weight:185, reps:5}, {weight:185, reps:5, drops:[{weight:140, reps:9}, {weight:400, reps:1}]}]}];
    __capture.push([
      JSON.stringify(topSetOf(plain[0])) === JSON.stringify(topSetOf(withDrops[0])),
      maxWeightEver(plain) === maxWeightEver(withDrops),
      JSON.stringify(buildPastSessions(plain)) === JSON.stringify(buildPastSessions(withDrops)),
      volumeOf(plain[0]), volumeOf(withDrops[0]),
    ]);`)[0];
  assert.deepStrictEqual(out, [true, true, true, 1850, 1850 + 140 * 9 + 400]);
});

test('criterion 6: the drop branch is the only change to the engine path: a non-drop signal gives what it gave without the branch', (assert)=>{
  // The non-drop result, computed by the real function, against the same function with the drop branch cut out.
  const fn = extractFunction(src, 'computeSuggestedSet');
  const cut = fn.replace(/\n  if\(isDrop\)\{[\s\S]*?\n  \}\n/, '\n');
  assert.notStrictEqual(cut, fn, 'anchor: the drop branch was found and cut');
  const call = `__capture.push(['increase', 'hold', 'decrease', null].map(t => JSON.stringify(computeSuggestedSet({weight:185, reps:6}, t && {type:t}, false, 'push', ${BENCH}, {weight:185, reps:6}))));`;
  const real = runSandbox(ENGINE, call)[0];
  const without = runSandbox(ENGINE.map(c => c === fn ? cut : c), call)[0];
  assert.deepStrictEqual(real, without);
});

run();
