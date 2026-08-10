'use strict';
// Behavioral coverage for a real inconsistency found during a hands-on
// review of the History tab: fetchDayStatuses() (the shared source for both
// the new calendar heatmap and the backdating date picker) only marked a
// date 'trained' when a workout:'s exercise CHECKBOX had been checked
// (readWorkoutCorpus's anyDone). checkAllSetsCompleteAndAutoCheck requires
// weight, reps, AND rpe before it checks a box on its own — so a day with
// real logged weight/reps (RPE skipped, a completely normal way to log a
// set) came through as 'rest' or 'off', even though the streak
// (saveExSet's own activity gate) and the Day-by-Day Log (buildDayLog, via
// the same readExCorpus) already counted it as trained. Confirmed live: a
// Bench Press 185x5 entry with no RPE showed up in the streak and the
// Day-by-Day Log, but left the heatmap completely blank.
//
// Fixed by having fetchDayStatuses also mark 'trained' any date with a real
// logged set (weight, reps, or distance) in readExCorpus — the exact same
// signal buildDayLog already uses — overriding whatever the checkbox-based
// pass concluded, since real logged data means the day wasn't actually
// rest/off regardless of the day definition.
//
// Real extracted source throughout: fetchDayStatuses, readWorkoutCorpus,
// readExCorpus, parseExKey, normalizeExEntry. storage.list/get are stubbed
// (the actual persistence layer, not the subject of this test); the
// module-level corpus caches these functions close over are hand-declared
// at their real initial values (readWorkoutCorpus/readExCorpus's own
// comments document this same cache-by-generation contract).
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const fnSrcs = [
  extractFunction(src, 'parseExKey'),
  extractFunction(src, 'normalizeExEntry'),
  extractFunction(src, 'readWorkoutCorpus'),
  extractFunction(src, 'readExCorpus'),
  extractFunction(src, 'fetchDayStatuses'),
];

const corpusState = `
  var workoutGen = 0;
  var exCorpusGen = 0;
  var workoutCorpusCache = null, workoutCorpusCacheGen = -1, workoutCorpusInflight = null;
  var exCorpusCache = null, exCorpusCacheGen = -1, exCorpusInflight = null;
  var programs = {
    strength: { label: 'Strength & Size', days: { d1: { exercises: [{name:'Bench Press'}, {name:'Row Sprint'}] } } },
  };
  var dayDefs = { d1: {label:'Upper', rest:false}, d7: {label:'Rest', rest:true} };
`;

// workoutEntries: [{key, completed}] under 'workout:' — completed is the
// checkbox map saved for that day (e.g. {0:true} for exercise index 0 done).
// exEntries: [{key, sets:[{date, sets:[{weight,reps,distance}]}]}] under 'ex:'.
function storageStub(workoutEntries, exEntries){
  const workoutMap = {};
  workoutEntries.forEach(({key, completed})=>{ workoutMap[key] = JSON.stringify(completed); });
  const exMap = {};
  exEntries.forEach(({key, log})=>{ exMap[key] = JSON.stringify(log); });
  return `
    var window = {
      storage: {
        list: async (prefix)=>{
          if(prefix === 'workout:') return {keys: ${JSON.stringify(workoutEntries.map(e=>e.key))}};
          if(prefix === 'ex:') return {keys: ${JSON.stringify(exEntries.map(e=>e.key))}};
          return {keys: []};
        },
        get: async (key)=>{
          const workoutMap = ${JSON.stringify(workoutMap)};
          const exMap = ${JSON.stringify(exMap)};
          if(Object.prototype.hasOwnProperty.call(workoutMap, key)) return {value: workoutMap[key]};
          if(Object.prototype.hasOwnProperty.call(exMap, key)) return {value: exMap[key]};
          throw new Error('not found');
        }
      }
    };
  `;
}

const { test, run } = makeRunner('test-fetch-day-statuses.js');

test('THE BUG: a date with real logged weight+reps but no checkbox ever checked reads as trained, not rest/off', async (assert)=>{
  const [status] = await runSandboxAsync([
    corpusState,
    storageStub(
      [{key:'workout:2026-08-10:d1', completed:{}}], // no exercise checked off
      [{key:'ex:strength:d1:0', log:[{date:'2026-08-10', sets:[{weight:185, reps:5, rpe:null}]}]}]
    ),
    ...fnSrcs,
  ], `
    const statuses = await fetchDayStatuses();
    __capture.push(statuses.get('2026-08-10'));
  `);
  assert.strictEqual(status, 'trained', 'real logged weight+reps must count as trained even with no checkbox checked');
});

test('regression: a date with the checkbox actually checked (anyDone) still reads as trained, same as before this fix', async (assert)=>{
  const [status] = await runSandboxAsync([
    corpusState,
    storageStub(
      [{key:'workout:2026-08-11:d1', completed:{0:true}}],
      []
    ),
    ...fnSrcs,
  ], `
    const statuses = await fetchDayStatuses();
    __capture.push(statuses.get('2026-08-11'));
  `);
  assert.strictEqual(status, 'trained');
});

test('sabotage-relevant: a real rest day with NO logged exercise data at all stays rest, not blanket-overridden to trained', async (assert)=>{
  const [status] = await runSandboxAsync([
    corpusState,
    storageStub(
      [{key:'workout:2026-08-12:d7', completed:{}}],
      []
    ),
    ...fnSrcs,
  ], `
    const statuses = await fetchDayStatuses();
    __capture.push(statuses.get('2026-08-12'));
  `);
  assert.strictEqual(status, 'rest', 'a day with genuinely nothing logged must not be forced to trained');
});

test('a distance-only cardio set (no weight, no reps) also counts as trained, matching saveExSet\'s own "distance counts as activity" rule', async (assert)=>{
  const [status] = await runSandboxAsync([
    corpusState,
    storageStub(
      [],
      [{key:'ex:strength:d1:1', log:[{date:'2026-08-13', sets:[{weight:null, reps:null, rpe:null, distance:5000}]}]}]
    ),
    ...fnSrcs,
  ], `
    const statuses = await fetchDayStatuses();
    __capture.push(statuses.get('2026-08-13'));
  `);
  assert.strictEqual(status, 'trained');
});

test('sabotage-relevant: an ex: log entry that exists but whose sets are all empty does NOT force trained (proves the real-data filter runs, not just "an entry exists")', async (assert)=>{
  const [status] = await runSandboxAsync([
    corpusState,
    storageStub(
      [{key:'workout:2026-08-14:d1', completed:{}}],
      [{key:'ex:strength:d1:0', log:[{date:'2026-08-14', sets:[{weight:null, reps:null, rpe:null}]}]}]
    ),
    ...fnSrcs,
  ], `
    const statuses = await fetchDayStatuses();
    __capture.push(statuses.get('2026-08-14'));
  `);
  assert.strictEqual(status, 'off', 'an empty set row with no real data must not count as trained');
});

run();
