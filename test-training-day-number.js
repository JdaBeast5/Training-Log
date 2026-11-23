'use strict';
// v3.619 (MKT-17): "Your number". The training-day number (MKT-16's
// trainingDayNumber: distinct dates with a logged set, from the whole corpus)
// shows on the finish sheet. On the day it reaches 10, 25, 50, 100, 250, 500
// or 1,000 the sheet marks it and the bib its Share sends gets a stamp, once
// per milestone ('number-last-celebrated', owner-approved 2026-11-22), never
// on a clinical program and never while readiness's no-rest flag is up. No
// banner: over the open sheet it would cover Share and Done (spec refresh 3
// puts the moment on the sheet).
//
// Real invocation: the real readExCorpus over stub window.storage (bumped
// through the real bumpExCorpusGen, as the storage chokepoint does), the real
// trainingDayNumber, numberMilestoneOn, checkNumberMilestone and
// noRestWarningActive with the real fetchWorkoutDates, readWorkoutCorpus,
// computeDaysSinceRest and READINESS_DAYS_NO_REST, over the real #finishSheet
// and #celebrateBanner markup. getTodayKey is fixed.
//
// Sabotage: count only the last 730 days (activity-dates' prune) in
// trainingDayNumber, and criterion 1 fails on the three-year fixture.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-training-day-number.js');
const TODAY = '2026-11-22';
const COUNTDOWN = /\bto (your )?next\b|\d+ (days|sessions) to\b/i;

function mount(){
  const { window } = runJsdom(extractElementById(src, 'finishSheet') + extractElementById(src, 'celebrateBanner'), `
    var programs = {strength: {label: 'Strength & Size', days: {d1: {label: 'Day 1', exercises: [{name: 'Bench Press', sets: '4x4-6'}, {name: 'Row', sets: '3x8'}]},
                                                               d2: {label: 'Day 2', exercises: [{name: 'Squat', sets: '3x5'}]}}}};
    var COMBAT_STYLES = {}, CYCLING_STYLES = {}, WATERSPORTS_STYLES = {}, MEDICAL_STYLES = {};
    var activeProgram = 'strength', activeDay = 'd1';
    var exCorpusGen = 0, workoutGen = 0;
    function bumpExCorpusGen(){ exCorpusGen++; }
    function getTodayKey(){ return '${TODAY}'; }
    window.__banners = 0;
    function triggerCelebration(){ window.__banners++; }
    window.__store = {};
    window.__sets = 0;
    window.storage = {
      list: async p => ({keys: Object.keys(window.__store).filter(k => k.startsWith(p))}),
      get: async k => { if(!(k in window.__store)) throw new Error('missing'); return {value: window.__store[k]}; },
      set: async (k, v) => { window.__sets++; window.__store[k] = String(v); },
    };
    window.__celebrations = [];`,
    [...['parseExKey', 'normalizeExEntry', 'entryHasLoggedSet' /* v3.633 (BIZ-19): shared logged-set test */, 'trainingDayNumber', 'dateKeyMinusDays', 'numberMilestoneOn', 'noRestWarningActive', 'checkNumberMilestone',
      'fetchWorkoutDates', 'readWorkoutCorpus', 'computeDaysSinceRest'].map(f => extractFunction(src, f)),
     extractConst(src, 'ordinalSuffix'), extractConst(src, 'NUMBER_MILESTONES'), extractConst(src, 'READINESS_DAYS_NO_REST'),
     'let exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null;', extractFunction(src, 'readExCorpus'),
     'let workoutCorpusCache = null, workoutCorpusCacheGen = -1, workoutCorpusInflight = null;',
     `// What renderWorkout's completing click hands checkNumberMilestone: finishSheetModel's number, milestone, share and dateKey.
      window.__finish = async (dateKey = getTodayKey(), clinical = false) => {
        const corpus = await readExCorpus();
        const model = {number: trainingDayNumber(corpus, dateKey), milestone: numberMilestoneOn(corpus, dateKey), clinical, dateKey,
          share: clinical ? undefined : {icon: 'flag', headline: 'SESSION COMPLETE', kind: 'session', stats: [], bib: {number: 0, milestone: 0}}};
        // openFinishSheet's number line (its own test is in test-finish-sheet.js).
        const el = document.getElementById('finishNumber');
        el.textContent = 'No. ' + model.number; el.hidden = false; el.classList.remove('finish-milestone');
        model.celebrated = await checkNumberMilestone(model);
        if(model.celebrated) window.__celebrations.push({n: model.milestone, line: el.textContent, stamp: model.share.bib.milestone});
        return model;
      };
      // A write through the storage chokepoint: the store changes and the corpus generation moves.
      window.__write = (k, v) => { if(v === undefined) delete window.__store[k]; else window.__store[k] = JSON.stringify(v); bumpExCorpusGen(); };`]);
  return window;
}
const addDays = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
// n distinct dates, every `step` days, ending `endOffset` days before today.
function dates(n, step, endOffset = 1){ const out = []; for(let i = n - 1; i >= 0; i--) out.push(addDays(TODAY, -(endOffset + i * step))); return out; }
function seed(w, ds, key = 'ex:strength:d1:0'){ w.__write(key, ds.map(date => ({date, sets: [{weight: 135, reps: 5}]}))); }

test('criterion 1: 99 dates over three years, then a set today: the number is 100 and the milestone celebrates exactly once; a second set the same day celebrates nothing', async (assert)=>{
  const w = mount();
  const past = dates(99, 11);
  assert.ok(Date.parse(TODAY) - Date.parse(past[0]) > 1000 * 86400000, 'anchor: the oldest date is ' + past[0] + ', well past 730 days');
  seed(w, past);
  // activity-dates is pruned to 730 days; the number must not read it.
  w.__store['activity-dates'] = JSON.stringify(past.filter(d => Date.parse(TODAY) - Date.parse(d) <= 730 * 86400000));
  w.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  const m = await w.__finish();
  assert.strictEqual(m.number, 100);
  assert.strictEqual(m.milestone, 100);
  assert.strictEqual(w.__celebrations.length, 1, 'one celebration');
  assert.strictEqual(m.share.bib.milestone, 100, 'the bib the sheet shares is stamped');
  const line = w.document.getElementById('finishNumber');
  assert.ok(line.classList.contains('finish-milestone'), 'the sheet marks it');
  assert.strictEqual(line.textContent, 'Milestone · No. 100 · your 100th training day on the log');
  assert.ok(!COUNTDOWN.test(line.textContent), 'no countdown');
  assert.strictEqual(w.__store['number-last-celebrated'], '100', 'marked once celebrated');
  assert.strictEqual(w.__banners, 0, 'no banner over the open sheet');
  // A second set the same day.
  w.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}, {weight: 95, reps: 8}]}]);
  const again = await w.__finish();
  assert.strictEqual(again.number, 100, 'still 100');
  assert.strictEqual(w.__celebrations.length, 1, 'no second celebration');
  assert.strictEqual(again.share.bib.milestone, 0, 'and no stamp the second time');
  assert.ok(!w.document.getElementById('finishNumber').classList.contains('finish-milestone'));
});

test('criterion 2: two sessions on one date (two program days, two keys) count once', async (assert)=>{
  const w = mount();
  seed(w, dates(5, 2));
  w.__write('ex:strength:d1:0', JSON.parse(w.__store['ex:strength:d1:0']).concat([{date: TODAY, sets: [{weight: 135, reps: 5}]}]));
  w.__write('ex:strength:d2:0', [{date: TODAY, sets: [{weight: 225, reps: 5}]}]);
  assert.strictEqual((await w.__finish()).number, 6);
});

test('criterion 3: deleting every set from one date lowers the number by one on the next render', async (assert)=>{
  const w = mount();
  const ds = dates(30, 3);
  seed(w, ds);
  const before = (await w.__finish()).number;
  assert.strictEqual(before, 30, 'anchor');
  w.__write('ex:strength:d1:0', ds.slice(1).map(date => ({date, sets: [{weight: 135, reps: 5}]})).concat([{date: ds[0], sets: []}]));
  assert.strictEqual((await w.__finish()).number, before - 1);
});

test('criterion 4: number 101 fires no celebration (and neither does a day that only repeats 100)', async (assert)=>{
  const w = mount();
  seed(w, dates(100, 2));
  w.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  const m = await w.__finish();
  assert.strictEqual(m.number, 101);
  assert.strictEqual(m.milestone, 0);
  assert.strictEqual(w.__celebrations.length, 0);
  const rest = mount();
  seed(rest, dates(100, 2));
  const r = await rest.__finish();
  assert.strictEqual(r.number, 100, 'anchor: 100, reached on an earlier day');
  assert.strictEqual(r.milestone, 0, 'today is not the day it was reached');
  assert.strictEqual(rest.__celebrations.length, 0);
});

test('criterion 5 (the celebration side): a clinical model has the number and celebrates nothing, and writes no mark', async (assert)=>{
  const w = mount();
  seed(w, dates(99, 2));
  w.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  const m = await w.__finish(TODAY, true);
  assert.strictEqual(m.number, 100, 'the number is still there');
  assert.strictEqual(m.share, undefined, 'no share data');
  assert.strictEqual(w.__celebrations.length, 0);
  assert.ok(!('number-last-celebrated' in w.__store));
});

test('criterion 6: with readiness\'s no-rest flag up on a milestone date, no prompt and no stamped share (nothing is marked; the moment passes with the day); no countdown anywhere', async (assert)=>{
  const w = mount();
  const ds = dates(93, 9, 7).concat(dates(6, 1, 1)); // the last six days before today in a row
  seed(w, ds);
  for(const d of ds.slice(-6)) w.__store[`workout:${d}:d1`] = JSON.stringify({'0': true});
  w.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  assert.strictEqual(await w.noRestWarningActive(), true, 'anchor: six days without a rest day');
  const m = await w.__finish();
  assert.strictEqual(m.milestone, 100, 'anchor: a milestone date');
  assert.strictEqual(w.__celebrations.length, 0, 'no milestone prompt');
  assert.ok(!w.document.getElementById('finishNumber').classList.contains('finish-milestone'), 'the sheet doesn\'t mark it');
  assert.strictEqual(m.share.bib.milestone, 0, 'the bib Share sends carries no stamp');
  assert.strictEqual(w.__banners, 0, 'no banner');
  assert.ok(!('number-last-celebrated' in w.__store), 'nothing marked');
  // The flag down (a rest day yesterday): the same milestone does celebrate.
  const calm = mount();
  seed(calm, ds);
  for(const d of ds.slice(-6, -1)) calm.__store[`workout:${d}:d1`] = JSON.stringify({'0': true});
  calm.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  assert.strictEqual(await calm.noRestWarningActive(), false);
  await calm.__finish();
  assert.strictEqual(calm.__celebrations.length, 1, 'anchor: the gate is what held it');
  // No countdown in any string this feature renders (the source of every one).
  for(const f of ['checkNumberMilestone', 'openFinishSheet', 'drawBibCard']){
    const lits = (extractFunction(src, f).match(/`[^`]*`|'[^']*'/g) || []).filter(l => COUNTDOWN.test(l));
    assert.deepStrictEqual(lits, [], f);
  }
  assert.ok(!COUNTDOWN.test(src.match(/'3\.619': \{[\s\S]*?\]\}/)[0]), 'nor in What\'s New');
});

test('a past date never celebrates, even the day a milestone was reached (backfilling an old session isn\'t a moment)', async (assert)=>{
  const w = mount();
  const ds = dates(10, 3, 3);
  seed(w, ds);
  const m = await w.__finish(ds[ds.length - 1]);
  assert.strictEqual(m.milestone, 10, 'anchor: that day reached 10');
  assert.strictEqual(w.__celebrations.length, 0);
});

test('each milestone once, in order: 10 then 25 each celebrate; a stored 25 holds 25 back', async (assert)=>{
  const w = mount();
  seed(w, dates(9, 2));
  w.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  await w.__finish();
  assert.strictEqual(w.__celebrations.length, 1);
  assert.strictEqual(w.__celebrations[0].n, 10);
  const x = mount();
  seed(x, dates(24, 2));
  x.__store['number-last-celebrated'] = '25';
  x.__write('ex:strength:d1:1', [{date: TODAY, sets: [{weight: 95, reps: 8}]}]);
  assert.strictEqual((await x.__finish()).milestone, 25);
  assert.strictEqual(x.__celebrations.length, 0, 'already celebrated');
});

run();
