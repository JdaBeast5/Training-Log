'use strict';
// v3.545 (MKT-02, owner D15): share cards carry no body data by default.
// The week card's third row used to fall back from average sleep to average
// body weight to average intake. It is now training-only: "PRs THIS WEEK"
// when there was at least one, else "SETS"; sleep, weight and intake never
// reach the card. The archived weekStats record is unchanged.
//
// Real invocation: the real archiveCurrentWeek runs in jsdom over the real
// #workoutCard markup, with storage, AI digests and the share renderer
// stubbed; the real #weekShareBtn is clicked and the stats handed to the
// (stubbed) shareCelebrationCard are captured. The real
// weekShareTrainingStats runs over stubbed reconstructAllPRs / readExCorpus.
//
// Sabotage: restore the weight fallback and criterion 1 fails.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-share-card-privacy.js');
const CARD = extractElementById(src, 'workoutCard');

async function archiveAndShare({prs = [], corpus = []} = {}){
  const { window } = runJsdom(CARD, `
    window.__shared = null; window.__archive = [];
    window.storage = { set: async (k, v) => {}, get: async () => null };
    window.programs = { strength: { label: 'Strength & Size' } }; window.activeProgram = 'strength'; window.dayDefs = { d1: {} };
    window.getTodayKey = () => '2026-11-11';
    window.mondayOf = () => '2026-11-09';
    window.computeWeekStats = async () => ({avgWeight: 182.4, workoutsCount: 4, daysLogged: 5, avgCal: 2450, avgPro: 160, avgFat: 70, avgCarb: 250, avgWater: 3, avgSleep: 7.5});
    window.getCurrentTrendStatus = async () => 'steady';
    window.getWeekArchive = async () => window.__archive;
    window.generateWeeklyRecap = async () => null; window.generateWeeklyNutritionDigest = async () => null;
    window.clearProgramRecDismissal = async () => {}; window.clearWeekProgress = async () => {};
    window.escapeHtml = (s) => String(s); window.fmtWeight = (v) => v + ' lb';
    window.renderTabs = () => {}; window.renderWorkout = () => {}; window.renderProgramRec = async () => {};
    window.shareCelebrationCard = (card) => { window.__shared = card; };
    window.activeDay = 'd4'; window.preloadShareCardFont = () => {}; // v3.547 (MKT-03): the week card reads the day's ink
    window.reconstructAllPRs = async () => ${JSON.stringify(prs)};
    window.readExCorpus = async () => ${JSON.stringify(corpus)};
  `, [extractFunction(src, 'dateKeyMinusDays'), extractFunction(src, 'isLoggedSet'), extractFunction(src, 'weekShareTrainingStats'), extractFunction(src, 'archiveCurrentWeek')]);
  await window.archiveCurrentWeek();
  window.document.getElementById('weekShareBtn').click();
  return JSON.parse(JSON.stringify({shared: window.__shared, archived: window.__archive[0]}));
}
const labels = (stats) => stats.map(s => s.label);

test('criterion 1: with weight, intake and sleep all logged, the shared stats carry no AVG WEIGHT, AVG INTAKE or AVG SLEEP (the archive keeps them)', async (assert)=>{
  const {shared, archived} = await archiveAndShare();
  assert.ok(shared, 'the real share button reached shareCelebrationCard');
  assert.strictEqual(shared.dayId, 'd4', 'v3.547: the day the week was finished on, read when it was archived');
  assert.strictEqual(shared.kind, 'week');
  for(const l of ['AVG WEIGHT', 'AVG INTAKE', 'AVG SLEEP']) assert.ok(!labels(shared.stats).includes(l), l);
  assert.doesNotMatch(JSON.stringify(shared), /182\.4|2450|7\.5/, 'no body or sleep number anywhere on the card');
  assert.strictEqual(archived.avgWeight, 182.4, 'the archived weekStats record is unchanged');
  assert.strictEqual(archived.avgSleep, 7.5);
});

test('criterion 2: two PRs in the week → {2, PRs THIS WEEK}; none → {n, SETS} with the week\'s logged-set count', async (assert)=>{
  const prs = [{date: '2026-11-09', name: 'Squat'}, {date: '2026-11-12', name: 'Bench'}, {date: '2026-11-02', name: 'Row'}];
  const corpus = [{log: [
    {date: '2026-11-10', sets: [{weight: 100, reps: 5}, {weight: 100, reps: 5}, {weight: null, reps: null}, {weight: 135, reps: null}]},
    {date: '2026-11-15', sets: [{reps: 10}]},
    {date: '2026-11-08', sets: [{weight: 90, reps: 5}]},
  ]}];
  const a = await archiveAndShare({prs, corpus});
  assert.deepStrictEqual(a.shared.stats[2], {value: '2', label: 'PRs THIS WEEK'});
  const b = await archiveAndShare({prs: [], corpus});
  assert.deepStrictEqual(b.shared.stats[2], {value: '3', label: 'SETS'}, 'two sets on Tuesday and one on Sunday; the empty set, a weight with no reps, and last week\'s do not count');
});

test('criterion 3: no sets and no PRs → the card has its two rows only (WORKOUTS, PROGRAM), also when the week has only empty sets', async (assert)=>{
  const {shared} = await archiveAndShare();
  assert.deepStrictEqual(labels(shared.stats), ['WORKOUTS', 'PROGRAM']);
  const empty = await archiveAndShare({corpus: [{log: [{date: '2026-11-10', sets: [{weight: null, reps: null}, {weight: 95, reps: null}]}]}]});
  assert.deepStrictEqual(labels(empty.shared.stats), ['WORKOUTS', 'PROGRAM']);
});

test('criterion 4: archiveCurrentWeek still calls computeWeekStats(todayMonday) and contains no reduce( (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'archiveCurrentWeek').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.match(body, /computeWeekStats\(todayMonday\)/);
  assert.doesNotMatch(body, /reduce\(/);
  assert.strictEqual((body.match(/weekShareTrainingStats\(todayMonday\)/g) || []).length, 1);
});

run();
