'use strict';
// Builds tools/visual/fixture.json: the seeded localStorage the harness loads.
//
//   node tools/visual/make-fixture.js
//
// Deterministic (no Math.random, no clock): the same script always writes the
// same bytes. The fixture is committed; this script is how it was made and how
// to change it. Dates are absolute and line up with FROZEN_NOW in harness.js
// (Monday 2 November 2026, 18:10 America/New_York).
//
// Who: Jordan, 31, male, 5'11", ~184 lb, lean bulk, on Strength & Size
// (strength) since 7 Sep 2026, training Mon d1 / Tue d2 / Thu d4 / Fri d5 /
// Sat d6. Eight weeks of history; Bench Press (d1 slot 0) has the richest log
// (top sets 165 -> 185 lb, with one stalled week). Today, Monday, Day 1 is in
// progress: two Bench sets are logged.
//
// Keys and shapes follow the STORAGE KEY REFERENCE comment in index.html.
// Raw keys only: the app namespaces as `trainingLog_usr<id>:<key>`.
const fs = require('fs');
const path = require('path');

const USER = '1';
const PFX = `trainingLog_usr${USER}:`;
const TODAY = '2026-11-02';

function addDays(key, n){
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

const raw = {
  'trainingLog_multiuser-migrated': '1',
  'trainingLog_user-list': JSON.stringify([{ id: USER, name: 'Jordan' }]),
  'trainingLog_active-user': USER,
};
const s = {}; // namespaced keys, prefixed at the end

s['meta:schemaVersion'] = '8';
s['user-profile'] = JSON.stringify({
  name: 'Jordan', age: '31', gender: 'male', heightFt: '5', heightIn: '11', weight: '184', goalWeight: '192',
  activity: '1.55', goal: 'leanbulk', bodyGoal: '', dietaryPreference: '', avoidFoods: '',
  dietaryFlags: { glutenFree: false, dairyFree: false, nutFree: false, halal: false, kosher: false },
  conditions: [],
});
s['active-program'] = 'strength';
s['active-day:strength'] = 'd1';
s['program-cycle-start'] = '2026-09-07';
s['weight-unit-pref'] = 'lb';
// The harness swaps in the APP_VERSION of the commit it is shooting, so the
// What's New sheet never opens over a state.
s['whats-new-last-seen'] = '__APP_VERSION__';
s['onboarding-dismissed'] = '1';
s['has-logged-first-set'] = '1';
s['has-logged-first-meal'] = '1';
s['last-backup'] = '2026-10-30';
// Jordan said no to the program-switch banner (it suggests Powerbuilding for a
// lean bulk), as a settled user would have; Today opens on the session.
s['program-rec-dismissed-key'] = 'powerbuilding';

// ---- Training history -----------------------------------------------------
// Weekly schedule: offset from Monday -> day id.
const SCHEDULE = [[0, 'd1'], [1, 'd2'], [3, 'd4'], [4, 'd5']];
const FIRST_MONDAY = '2026-09-07';
const WEEKS = 8; // 7 full weeks + today (week 9's Monday is TODAY)

// Per-slot top-set weights for each of the 8 completed weeks, plus reps.
// Bench is the story: steady, one stalled week (wk 6), a PR the week before today.
const LIFTS = {
  d1: [
    { w: [165, 170, 170, 175, 175, 175, 180, 182.5], reps: [5, 5, 6, 5, 5, 4, 5, 5], n: 4 }, // Bench Press
    { w: [135, 135, 140, 140, 145, 145, 150, 150], reps: [8, 8, 7, 8, 8, 7, 8, 8], n: 4 },   // Barbell Row
    { w: [95, 95, 100, 100, 100, 105, 105, 105], reps: [10, 9, 9, 10, 10, 8, 9, 10], n: 3 }, // Overhead Press
    { w: [120, 120, 125, 125, 130, 130, 130, 135], reps: [12, 12, 11, 12, 12, 11, 12, 11], n: 3 },
    { w: [30, 30, 30, 35, 35, 35, 35, 35], reps: [12, 12, 12, 10, 11, 12, 12, 12], n: 3 },
    { w: [50, 50, 55, 55, 55, 60, 60, 60], reps: [12, 12, 11, 12, 12, 10, 11, 12], n: 3 },
  ],
  d2: [
    { w: [225, 235, 235, 245, 245, 250, 255, 255], reps: [5, 5, 6, 5, 5, 5, 4, 5], n: 4 }, // Squat
    { w: [185, 185, 195, 195, 205, 205, 205, 215], reps: [10, 9, 8, 9, 8, 9, 10, 8], n: 3 },
    { w: [360, 360, 380, 380, 400, 400, 410, 410], reps: [12, 12, 11, 12, 11, 12, 12, 12], n: 3 },
    { w: [90, 90, 95, 95, 100, 100, 100, 105], reps: [12, 12, 11, 12, 11, 12, 12, 10], n: 3 },
    { w: [180, 180, 190, 190, 200, 200, 200, 210], reps: [15, 15, 14, 15, 14, 15, 15, 13], n: 3 },
  ],
  d4: [
    { w: [55, 55, 60, 60, 60, 65, 65, 65], reps: [12, 12, 10, 11, 12, 10, 11, 12], n: 4 },
    { w: [120, 120, 125, 125, 130, 130, 135, 135], reps: [12, 12, 11, 12, 12, 11, 12, 12], n: 4 },
    { w: [45, 45, 45, 50, 50, 50, 50, 55], reps: [12, 12, 12, 10, 11, 12, 12, 10], n: 3 },
    { w: [0, 0, 0, 0, 0, 0, 0, 0], reps: [8, 8, 9, 9, 10, 10, 10, 11], n: 3 },
    { w: [20, 20, 20, 20, 25, 25, 25, 25], reps: [15, 15, 15, 15, 12, 13, 14, 15], n: 3 },
    { w: [40, 40, 45, 45, 45, 50, 50, 50], reps: [15, 15, 15, 15, 15, 14, 15, 15], n: 3 },
  ],
  d5: [
    { w: [275, 285, 285, 295, 305, 305, 315, 315], reps: [5, 5, 6, 5, 5, 5, 5, 6], n: 3 }, // Deadlift
    { w: [40, 40, 45, 45, 45, 50, 50, 50], reps: [12, 12, 10, 11, 12, 10, 11, 12], n: 3 },
    { w: [110, 110, 120, 120, 120, 130, 130, 130], reps: [15, 15, 13, 14, 15, 12, 13, 14], n: 3 },
    { w: [185, 185, 205, 205, 225, 225, 225, 245], reps: [12, 12, 10, 11, 12, 10, 11, 10], n: 3 },
    { w: [135, 135, 145, 145, 155, 155, 155, 165], reps: [15, 15, 13, 14, 15, 12, 13, 14], n: 3 },
  ],
};

// One session of a lift: the same top set across sets, the last set one rep
// short and a touch harder. A realistic log.
function setsFor(top, reps, n){
  const sets = [];
  for(let i = 0; i < n; i++){
    const r = i === n - 1 && reps > 4 ? reps - 1 : reps;
    sets.push({ weight: top, reps: r, rpe: i === n - 1 ? 9 : 8 });
  }
  return sets;
}

const ex = {};      // key -> [{date, sets}]
const workout = {}; // workout:{date}:strength:{day} -> {idx:true}
const activity = new Set();
const times = {};

for(let wk = 0; wk < WEEKS; wk++){
  const monday = addDays(FIRST_MONDAY, wk * 7);
  for(const [off, day] of SCHEDULE){
    const date = addDays(monday, off);
    const done = {};
    LIFTS[day].forEach((lift, idx) => {
      const sets = setsFor(lift.w[wk], lift.reps[wk], lift.n);
      const key = `ex:strength:${day}:${idx}`;
      (ex[key] = ex[key] || []).push({ date, sets });
      done[idx] = true;
    });
    workout[`workout:${date}:strength:${day}`] = done;
    activity.add(date);
    times[`workout-time:${date}`] = { first: '17:40', last: '18:42' };
  }
}

// Today: Day 1 in progress, two Bench sets at 185 (a new top weight).
ex['ex:strength:d1:0'].push({ date: TODAY, sets: [
  { weight: 185, reps: 5, rpe: 8 },
  { weight: 185, reps: 5, rpe: 8.5 },
]});
activity.add(TODAY);
times[`workout-time:${TODAY}`] = { first: '17:52', last: '18:06' };

for(const [k, v] of Object.entries(ex)) s[k] = JSON.stringify(v);
for(const [k, v] of Object.entries(workout)) s[k] = JSON.stringify(v);
for(const [k, v] of Object.entries(times)) s[k] = JSON.stringify(v);
s['activity-dates'] = JSON.stringify([...activity].sort());
s['week-progress:strength'] = JSON.stringify({});

// ---- Body, food, water, sleep ---------------------------------------------
const weights = [];
for(let i = 0; i < 57; i += 2){
  const date = addDays(FIRST_MONDAY, i);
  // A lean bulk: +0.25 lb a week with a small, fixed wobble.
  const wobble = [0, 0.4, -0.2, 0.6, -0.4, 0.2, -0.6][i % 7];
  weights.push({ date, weight: Math.round((180.2 + i * 0.07 + wobble) * 10) / 10 });
}
s['weight-log'] = JSON.stringify(weights);

const sleep = [];
for(let i = 0; i < 14; i++){
  sleep.push({ date: addDays(TODAY, -14 + i), hours: [7.5, 6.8, 7.2, 8.1, 7.0, 6.5, 7.8][i % 7] });
}
s['sleep-log'] = JSON.stringify(sleep);

s['measurements-log'] = JSON.stringify([
  { date: '2026-09-07', waist: 33.5, chest: 41.0, arms: 15.0, thighs: 23.5, hips: 38.5, neck: 15.5 },
  { date: '2026-10-05', waist: 33.6, chest: 41.6, arms: 15.3, thighs: 23.8, hips: 38.6, neck: 15.6 },
  { date: '2026-11-01', waist: 33.7, chest: 42.1, arms: 15.5, thighs: 24.1, hips: 38.7, neck: 15.6 },
]);

const MEALS = [
  { name: 'Greek yogurt, berries, granola', cal: 420, pro: 32, fat: 9, carb: 54, time: '07:45' },
  { name: 'Chicken burrito bowl', cal: 780, pro: 52, fat: 24, carb: 86, time: '12:30' },
  { name: 'Protein shake', cal: 240, pro: 40, fat: 3, carb: 12, time: '16:15' },
];
s[`foodlog:${TODAY}`] = JSON.stringify(MEALS);
s[`foodlog:${addDays(TODAY, -1)}`] = JSON.stringify([
  ...MEALS,
  { name: 'Salmon, rice, broccoli', cal: 690, pro: 46, fat: 22, carb: 70, time: '19:20' },
]);
s[`water:${TODAY}`] = '64';
s['food-favorites'] = JSON.stringify([MEALS[2]]);

// ---- Write ----------------------------------------------------------------
function write(name, seed){
  const out = { ...raw };
  for(const k of Object.keys(seed).sort()) out[PFX + k] = seed[k];
  const file = path.join(__dirname, name);
  fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  console.log(`wrote ${path.relative(process.cwd(), file)}: ${Object.keys(out).length} keys`);
}

// The default fixture. Every default-mode state shoots from this one, so it
// must not change when the store seeds below do.
write('fixture.json', s);

// ---- Store seeds (harness.js --store; planning/store/screenshots.md) -------
// Two changes, each in its own file so fixture.json stays byte-identical.
//
// 1. fixture-store.json (frame 3, "Adds weight when you earn it"): Overhead
//    Press (Day 1 slot 2, 3x8-10) goes 105x9 -> 105x10 in week 7 (19 Oct), so
//    its last two sessions both top the range at 105 lb with RPE to spare and
//    the double-progression badge fires. Bench is left alone: the other states
//    rely on its stalled-week story.
const OHP_KEY = 'ex:strength:d1:2';
const OHP_WEEK = 6; // 0-based: week 7, Monday 19 Oct
const ohp = LIFTS.d1[2];
const store = { ...s };
store[OHP_KEY] = JSON.stringify(ex[OHP_KEY].map(e => (
  e.date === addDays(FIRST_MONDAY, OHP_WEEK * 7) ? { date: e.date, sets: setsFor(ohp.w[OHP_WEEK], 10, ohp.n) } : e
)));
write('fixture-store.json', store);

// 2. fixture-store-deload.json (frame 6, "Deload weeks are planned in"): the
//    store seed with the mesocycle started a week earlier (31 Aug), so the
//    frozen Monday falls in week 10, the cycle's deload week (5 of 5), not
//    week 9 (4 of 5, Accumulation).
write('fixture-store-deload.json', { ...store, 'program-cycle-start': '2026-08-31' });
