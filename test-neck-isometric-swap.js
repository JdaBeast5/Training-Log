'use strict';
// v3.564 (BL-35, audit SAF-4; owner (b) 2026-11-08, design confirmed
// 2026-11-16 "Yes on all three"): the 6 Neck Bridges slots become
// "4-Way Neck Isometric (hand or band)", 4×15s, carrying legacyName:'Neck
// Bridges'. Nothing is moved:
//   - the isometric logs under its own `:sub:<slug>` key (fresh history);
//   - swapping the slot back to Neck Bridges reads and writes the plain key,
//     where the old sets still are;
//   - parseExKey names the plain key Neck Bridges (History, PRs, volume).
//
// Real invocation: the real programs, PROGRAM_DAY_COUNT_VARIANTS,
// EXERCISE_SUBS, slugifyExerciseName, slotIdOf, exKey, subSelectionKey,
// subVariantOf, normalizeExEntry, getExLog, applyExerciseSubs and parseExKey
// with a fixture store; the real buildDetailsHtml over the real exerciseInfo.
//
// Sabotage 1: drop the legacyName branch in subVariantOf → criterion 3 fails
// (the isometric reads the old sets, and the swap-back reads an empty
// :sub:neck-bridges key).
// Sabotage 2: drop legacyExDef in parseExKey → criterion 4 fails.
const vm = require('vm');
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-neck-isometric-swap.js');
const NEW = '4-Way Neck Isometric (hand or band)';

const CONSTS = ['programs', 'PROGRAM_DAY_COUNT_VARIANTS', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'MEDICAL_STYLES', 'EXERCISE_SUBS'];
const FNS = ['slugifyExerciseName', 'slotIdOf', 'exKey', 'subSelectionKey', 'subVariantOf', 'normalizeExEntry', 'getExLog', 'applyExerciseSubs', 'parseExKey'];
const CODE = [...CONSTS.map(c => extractConst(src, c)), ...FNS.map(f => extractFunction(src, f))].join('\n');

async function sandbox(store, body){
  const ctx = vm.createContext({console, __out: null, __store: store});
  const prelude = `
    var activeProgram = 'grappling', activeDay = 'd6', activeMartialArt = 'kickboxing', activeCyclingStyle = 'road', activeWatersportsStyle = 'surfing', activeMedicalStyle = 'hypertension';
    var window = {storage: {
      get: async (k) => (k in __store ? {key: k, value: __store[k]} : null),
      set: async (k, v) => { __store[k] = v; return {key: k, value: v}; },
      list: async (prefix) => ({keys: Object.keys(__store).filter(k => !prefix || k.startsWith(prefix))}),
    }};`;
  await vm.runInContext(`(async ()=>{ ${prelude}\n${CODE}\n${body} })()`, ctx);
  return JSON.parse(JSON.stringify(ctx.__out));
}
const log = (...dates) => JSON.stringify(dates.map(d => ({date: d, sets: [{weight: 0, reps: 8}]})));

test('criteria 1-2: walking programs.grappling and its day-count variants, the 6 neck slots are the isometric at index 1, 4×15s, noWeight, legacyName Neck Bridges; none names Neck Bridges', async (assert)=>{
  const r = await sandbox({}, `
    const days = [['base', programs.grappling.days], ...Object.entries(PROGRAM_DAY_COUNT_VARIANTS.grappling).map(([n, v]) => [n + 'd', v.days])];
    const slots = [], old = [];
    for(const [w, ds] of days) for(const [dn, d] of Object.entries(ds || {})) (d.exercises || []).forEach((ex, idx) => {
      if(ex.name === ${JSON.stringify(NEW)}) slots.push({at: w + '/' + dn + '#' + idx, sets: ex.sets, noWeight: ex.noWeight, legacyName: ex.legacyName});
      if(ex.name === 'Neck Bridges') old.push(w + '/' + dn);
    });
    __out = {slots, old};`);
  assert.deepStrictEqual(r.old, []);
  assert.deepStrictEqual(r.slots.map(s => s.at).sort(), ['2d/d3#1', '3d/d4#1', '4d/d5#1', '6d/d6#1', '7d/d6#1', 'base/d6#1']);
  for(const s of r.slots) assert.deepStrictEqual([s.sets, s.noWeight, s.legacyName], ['4×15s', true, 'Neck Bridges'], s.at);
});

test('criterion 1: the real buildDetailsHtml renders the isometric\'s 4 cues (each at most 24 words); Neck Bridges keeps its entry', (assert)=>{
  const w = runJsdom('<div id="host"></div>', `function getExerciseIcon(){ return '<svg></svg>'; }`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'exerciseInfo'), extractFunction(src, 'buildDetailsHtml')]).window;
  const host = w.document.getElementById('host');
  host.innerHTML = w.buildDetailsHtml({name: NEW});
  const items = [...host.querySelectorAll('.ex-cues li')].map(li => li.textContent);
  assert.strictEqual(items.length, 4, items.join(' | '));
  assert.ok(items.some(t => /15 s each way/.test(t)));
  assert.ok(items.every(t => t.split(/\s+/).length <= 24));
  host.innerHTML = w.buildDetailsHtml({name: 'Neck Bridges'});
  assert.ok(host.querySelectorAll('.ex-cues li').length > 0, 'the old entry stays for history and the swap-back');
});

test('criterion 3: the isometric reads its own fresh :sub: key; swapped back to Neck Bridges (real applyExerciseSubs) the slot reads the plain key with the old sets', async (assert)=>{
  const store = {'ex:grappling:d6:1': log('2026-09-01', '2026-09-08')};
  const r = await sandbox(store, `
    const day = programs.grappling.days.d6.exercises.map((ex, idx) => ({...ex, __srcIndex: idx}));
    const iso = day[1];
    const isoKey = exKey('grappling', 'd6', slotIdOf(iso, 1), subVariantOf(iso));
    const isoLog = await getExLog('d6', slotIdOf(iso, 1), subVariantOf(iso));
    await window.storage.set(subSelectionKey('grappling', 'd6', 1), 'Neck Bridges');
    const swapped = day.map(e => ({...e}));
    await applyExerciseSubs(swapped, 'grappling', 'd6');
    const nb = swapped[1];
    __out = {isoKey, isoLog, nbName: nb.name, nbKey: exKey('grappling', 'd6', slotIdOf(nb, 1), subVariantOf(nb)),
      nbLog: (await getExLog('d6', slotIdOf(nb, 1), subVariantOf(nb))).map(e => e.date),
      plainKey: exKey('grappling', 'd6', 1), subs: EXERCISE_SUBS[${JSON.stringify(NEW)}]};`);
  assert.strictEqual(r.isoKey, 'ex:grappling:d6:1:sub:4-way-neck-isometric-hand-or-band');
  assert.notStrictEqual(r.isoKey, r.plainKey);
  assert.deepStrictEqual(r.isoLog, [], 'fresh history');
  assert.strictEqual(r.nbName, 'Neck Bridges');
  assert.strictEqual(r.nbKey, 'ex:grappling:d6:1');
  assert.deepStrictEqual(r.nbLog, ['2026-09-01', '2026-09-08'], 'the old sets, unmoved');
  assert.ok(r.subs.includes('Neck Bridges'));
});

test('criterion 3 (swap picker): the real openExerciseSubModal shows the old sets under Neck Bridges and none under the isometric', async (assert)=>{
  const store = {'ex:grappling:d6:1': log('2026-09-01', '2026-09-08')};
  const {window: w} = runJsdom('<div id="subModalOverlay"><div id="subModalTitle"></div><div id="subModalOptions"></div></div>', `
    var activeProgram = 'grappling', activeDay = 'd6', activeMartialArt = 'kickboxing', activeCyclingStyle = 'road', activeWatersportsStyle = 'surfing', activeMedicalStyle = 'hypertension';
    var subModalCurrentIdx = null; var __store = ${JSON.stringify(store)};
    window.storage = {get: async (k) => (k in __store ? {key: k, value: __store[k]} : null), set: async () => {}, delete: async () => {}};
    function icon(){ return ''; } function escapeHtml(t){ return String(t); } function closeExerciseSubModal(){}
    function entriesForExercise(l){ return l; } function formatLastLoggedSummary(l){ return l.length ? l.map(e => e.date).join(',') : 'none'; }`,
    [extractConst(src, 'EXERCISE_SUBS'), ...['slugifyExerciseName', 'slotIdOf', 'exKey', 'subSelectionKey', 'subVariantOf', 'normalizeExEntry', 'getExLog', 'openExerciseSubModal'].map(f => extractFunction(src, f))]);
  await w.openExerciseSubModal(1, {name: NEW, sets: '4×15s', noWeight: true, legacyName: 'Neck Bridges', __srcIndex: 1});
  const rows = Object.fromEntries([...w.document.querySelectorAll('.sub-option')].map(el => [el.dataset.name, el.querySelector('.sub-option-history').textContent]));
  assert.deepStrictEqual(rows, {[NEW]: 'none', 'Neck Bridges': '2026-09-01,2026-09-08', 'Chin Tucks': 'none'});
});

test('criterion 4: parseExKey names the plain key Neck Bridges and the :sub: key the isometric; an ordinary slot and an ordinary substitute key are unchanged', async (assert)=>{
  const r = await sandbox({}, `
    const n = (k) => { const p = parseExKey(k); return p && p.exDef.name; };
    __out = [n('ex:grappling:d6:1'), n('ex:grappling:d6:1:sub:4-way-neck-isometric-hand-or-band'), n('ex:grappling:d6:0'),
      n('ex:strength:d1:0'), n('ex:strength:d1:0:sub:dumbbell-bench-press')];`);
  assert.deepStrictEqual(r, ['Neck Bridges', NEW, 'Positional Sparring (Guard Retention)', 'Bench Press', 'Bench Press']);
});

test('review fix: the replaced exercise flags a resting neck in Care (region override), and Care offers Chin Tucks, one of its Neck relief moves', (assert)=>{
  const [r] = runSandbox([extractConst(src, 'EXERCISE_REGION_OVERRIDE'), extractConst(src, 'SUB_CALF_HOLD'), extractConst(src, 'SUB_FEET_ON_HANG'), extractConst(src, 'SUB_NECK_ISO'),
    extractConst(src, 'SUB_VEST_CARRY'), extractConst(src, 'SUB_BIRD_DOG'), extractConst(src, 'SUB_LYING_RAISE'), extractConst(src, 'EXERCISE_SUBSTITUTE_OVERRIDE')],
    `__capture.push({region: EXERCISE_REGION_OVERRIDE[${JSON.stringify(NEW)}], sub: EXERCISE_SUBSTITUTE_OVERRIDE[${JSON.stringify(NEW)}]});`);
  assert.deepStrictEqual([r.region, r.sub.name, r.sub.for], [['Neck'], 'Chin Tucks', ['Neck']]);
});

test('review fixes: swap-back restores 3×8; parseExKey gives the plain key 3×8; a saved removal of Neck Bridges keeps the slot off the day, and its sets override is not applied', async (assert)=>{
  const r = await sandbox({}, `
    ${extractFunction(src, 'applyExOverrides')}
    const day = programs.grappling.days.d6.exercises.map((ex, idx) => ({...ex, __srcIndex: idx}));
    await window.storage.set(subSelectionKey('grappling', 'd6', 1), 'Neck Bridges');
    const swapped = day.map(e => ({...e})); await applyExerciseSubs(swapped, 'grappling', 'd6');
    const removed = applyExOverrides(day, {'1': {name: 'Neck Bridges', removed: true}}).map(e => e.name);
    const resized = applyExOverrides(day, {'1': {name: 'Neck Bridges', sets: '5×10'}})[1];
    __out = {swapSets: swapped[1].sets, plainSets: parseExKey('ex:grappling:d6:1').exDef.sets,
      subSets: parseExKey('ex:grappling:d6:1:sub:4-way-neck-isometric-hand-or-band').exDef.sets, removed, resized: [resized.name, resized.sets]};`);
  assert.strictEqual(r.swapSets, '3×8');
  assert.strictEqual(r.plainSets, '3×8');
  assert.strictEqual(r.subSets, '4×15s');
  assert.ok(!r.removed.includes(NEW) && r.removed.length === 2, JSON.stringify(r.removed));
  assert.deepStrictEqual(r.resized, [NEW, '4×15s']);
});

test('review fix: the warm-up fallback index lists the neck slots under Neck Bridges (their plain keys hold its sets), not under the isometric', async (assert)=>{
  const r = await sandbox({}, `
    ${extractConst(src, 'YOGA_STYLES')} ${extractConst(src, 'EXERCISE_CANONICAL')} ${extractFunction(src, 'canonicalExName')}
    let exerciseLocationIndex = null;
    ${extractFunction(src, 'getExerciseLocationIndex')}
    const ix = getExerciseLocationIndex();
    __out = {iso: (ix[${JSON.stringify(NEW)}] || []).length, nb: (ix['Neck Bridges'] || []).map(l => l.program + ':' + l.dayId + ':' + l.idx)};`);
  assert.strictEqual(r.iso, 0);
  assert.deepStrictEqual(r.nb, ['grappling:d6:1']);
});

run();
