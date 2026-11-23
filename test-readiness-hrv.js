'use strict';
// v3.638 (BL-21): HRV joins readiness, against the person's own baseline.
// ln(rMSSD), this week's mean against the mean and SD of days 8–60 before
// today, flagged below mean − 0.5×SD (Plews et al. 2013, Sports Med 43:773-81,
// doi 10.1007/s40279-013-0071-8; checked 2026-11-23). The SD has a floor of
// 0.05 ln, so a flat baseline doesn't flag a 1 ms dip.
//
// Real invocation: the real hrvBaselineFrom, hrvRecentFrom, computeReadiness,
// formatReadiness and getReadinessInsight (its data sources stubbed).
// Sabotage: drop the 0.5×SD term, and criterion 2 fails.
const { readIndexSource, extractFunction, extractConst, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-readiness-hrv.js');
const TODAY = '2026-11-23';
const CORE = [
  ...['READINESS_SLEEP_LOW', 'READINESS_RPE_HIGH', 'READINESS_DAYS_NO_REST', 'READINESS_RHR_RISE', 'READINESS_RPE_OVER_TARGET', 'READINESS_RPE_CEILING',
      'HRV_BASELINE_MIN', 'HRV_RECENT_MIN', 'HRV_DROP_SD', 'HRV_SD_FLOOR'].map(n => extractConst(src, n)),
  ...['dateKeyMinusDays', 'trimUnitNum', 'hrvBaselineFrom', 'hrvRecentFrom', 'computeReadiness', 'formatReadiness'].map(f => extractFunction(src, f)),
  'function icon(n){ return "[" + n + "]"; }',
];
const day = n => { const d = new Date(TODAY + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
// A baseline at `base` ms on days 8–(8+count−1), and `recent` ms on days 0–4.
const entries = (base, recent, count = 20) => [
  ...Array.from({length: count}, (_, i) => ({date: day(8 + i), value: base})),
  ...Array.from({length: 5}, (_, i) => ({date: day(i), value: recent})),
];
async function readiness(hrvEntries, extra = {}){
  const [r] = await runSandboxAsync(CORE, `
    const e = ${JSON.stringify(hrvEntries)};
    __capture.push(computeReadiness(Object.assign({sleepHours: null, weeklyRpe: null, daysSinceRest: 0, painRegions: [], rhrToday: null, rhrBaseline: null,
      hrv7: hrvRecentFrom(e, ${JSON.stringify(TODAY)}), hrvBaseline: hrvBaselineFrom(e, ${JSON.stringify(TODAY)})}, ${JSON.stringify(extra)})));`);
  return r;
}

test('criterion 1: a flat 60 ms baseline and a 7-day mean of 48 flag HRV, with its text', async (assert)=>{
  const r = await readiness(entries(60, 48));
  assert.ok(r, 'a result');
  assert.strictEqual(JSON.stringify(r.flags), JSON.stringify([{kind: 'hrv', text: 'HRV has run below your usual this week'}]));
  assert.strictEqual(r.level, 'note', 'one flag is a note');
});

test('criterion 2: 59 ms against the same baseline: no flag', async (assert)=>{
  const r = await readiness(entries(60, 59));
  assert.strictEqual(r, null, 'nothing else known either, so no result at all');
  const withSleep = await readiness(entries(60, 59), {sleepHours: 8});
  assert.strictEqual(JSON.stringify(withSleep.flags), '[]');
  assert.strictEqual(withSleep.level, 'good');
});

test('criterion 3: under 14 baseline readings: no flag, and `known` stays as it was', async (assert)=>{
  assert.strictEqual(await readiness(entries(60, 40, 13)), null, '13 readings: no baseline, nothing known');
  const r = await readiness(entries(60, 40, 13), {sleepHours: 8});
  assert.strictEqual(r.level, 'good');
  assert.ok(await readiness(entries(60, 40, 14)), '14 readings: the flag can show');
});

test('criterion 4: HRV plus a sleep flag gives level caution', async (assert)=>{
  const r = await readiness(entries(60, 48), {sleepHours: 5});
  assert.strictEqual(JSON.stringify(r.flags.map(f => f.kind)), JSON.stringify(['sleep', 'hrv']));
  assert.strictEqual(r.level, 'caution');
});

test('a varied baseline: the threshold is half its SD in ln units; fewer than 3 recent readings say nothing', async (assert)=>{
  const varied = [...Array.from({length: 20}, (_, i) => ({date: day(8 + i), value: i % 2 ? 50 : 70})), ...Array.from({length: 3}, (_, i) => ({date: day(i), value: 52}))];
  // ln mean ≈ ln 59.2, SD ≈ 0.17 → threshold ≈ 54.3 ms: 52 flags.
  assert.ok((await readiness(varied)).flags.some(f => f.kind === 'hrv'));
  const two = [...entries(60, 40).filter(e => e.date < day(5)), {date: day(0), value: 40}, {date: day(1), value: 40}];
  assert.strictEqual(await readiness(two.filter((e, i, a) => !(e.date === day(2) || e.date === day(3) || e.date === day(4)))), null);
});

test('REAL invocation: getReadinessInsight reads the HRV log and shows the note', async (assert)=>{
  const [html] = await runSandboxAsync([...CORE, extractFunction(src, 'getReadinessInsight'), `
    function getTodayKey(){ return ${JSON.stringify(TODAY)}; }
    async function fetchSleepEntries(){ return []; } async function fetchWorkoutDates(){ return new Set(); } async function getRestingRegions(){ return []; }
    async function fetchHealthLog(id){ return id === 'hrv' ? ${JSON.stringify(entries(60, 48))} : []; }
    async function computeWeeklyRpeAvg(){ return []; } function rhrBaselineFrom(){ return null; }
    async function computeDaysSinceRest(){ return 0; } function rpeTargetFor(){ return null; }
    async function getMesocycleWeek(){ return 1; } async function isDeloadWeek(){ return false; } var activeProgram = 'strength';`],
    '__capture.push(await getReadinessInsight());');
  assert.strictEqual(html, '<b>Readiness:</b> HRV has run below your usual this week — worth keeping an eye on, but not a reason to change the plan on its own.');
});

run();
