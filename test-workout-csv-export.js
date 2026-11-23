'use strict';
// v3.631 (BL-22): export the workout log as CSV, one row per logged set.
// History could leave only as JSON; anyone moving to another app, or handing
// the numbers to a coach, wants a spreadsheet.
//
// Real invocation: the real buildWorkoutCsv and csvField over a corpus built
// the way readExCorpus builds it (real ex: keys through the real parseExKey
// and the real programs object), with the real isLoggedSet, getSetFieldUnit
// and unit constants. The output is read back with an RFC 4180 parser written
// here, so the assertions are on fields, not on text. The button test runs the
// real click listener (its top-level statement), with the download stubbed at
// the browser boundary.
// Sabotage: drop the quoting in csvField and criterion 2 fails.
const vm = require('vm');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-workout-csv-export.js');

const CHUNKS = [
  extractConst(src, 'programs'), extractConst(src, 'LB_PER_KG'), extractConst(src, 'M_PER_MI'), extractConst(src, 'M_PER_KM'),
  ...['parseExKey', 'isLoggedSet', 'getSetFieldUnit', 'csvField', 'buildWorkoutCsv'].map(f => extractFunction(src, f)),
];

// One vm context holding the real source; the functions are read off it.
const ctx = vm.createContext({});
vm.runInContext(CHUNKS.join('\n\n') + '\nthis.__api = {programs, parseExKey, getSetFieldUnit, buildWorkoutCsv};', ctx);
const api = ctx.__api;
const runReal = fn => fn(api);

// RFC 4180 reader: quoted fields, doubled quotes, CRLF rows.
function parseCsv(text){
  if(text.charCodeAt(0) !== 0xFEFF) throw new Error('no byte-order mark: Excel would misread UTF-8');
  text = text.slice(1);
  const rows = []; let row = [], field = '', i = 0, quoted = false;
  while(i < text.length){
    const c = text[i];
    if(quoted){
      if(c === '"' && text[i + 1] === '"'){ field += '"'; i += 2; continue; }
      if(c === '"'){ quoted = false; i++; continue; }
      field += c; i++; continue;
    }
    if(c === '"' && field === ''){ quoted = true; i++; continue; }
    if(c === ','){ row.push(field); field = ''; i++; continue; }
    if(c === '\r' && text[i + 1] === '\n'){ row.push(field); rows.push(row); row = []; field = ''; i += 2; continue; }
    field += c; i++;
  }
  if(field !== '' || row.length) throw new Error('CSV did not end with CRLF');
  return rows;
}

// Build the corpus in the sandbox from real keys, then the CSV.
function csvFor(logsByKey, unit = 'lb', distUnit = 'mi'){
  let out;
  runReal(ctx => {
    const corpus = Object.entries(logsByKey).map(([key, log]) => {
      const parsed = ctx.parseExKey(key);
      if(!parsed) throw new Error('fixture key does not resolve: ' + key);
      return {key, parsed, exDef: parsed.exDef, log};
    });
    out = ctx.buildWorkoutCsv(corpus, unit, distUnit);
  });
  return out;
}
// A real program, its first day, and its first two exercises with rep prescriptions.
const REAL = (() => {
  let found;
  runReal(ctx => {
    for(const [pk, prog] of Object.entries(ctx.programs)){
      for(const [dk, day] of Object.entries(prog.days || {})){
        const ex = (day.exercises || []).map((e, i) => ({i, e})).filter(x => ctx.getSetFieldUnit(String(x.e.sets || '')) === 'reps');
        if(ex.length >= 2 && !found) found = {pk, dk, a: ex[0], b: ex[1], progLabel: prog.label, dayLabel: day.label};
      }
    }
  });
  return found;
})();
const KEY_A = `ex:${REAL.pk}:${REAL.dk}:${REAL.a.i}`, KEY_B = `ex:${REAL.pk}:${REAL.dk}:${REAL.b.i}`;
const three = (w) => [{weight: w, reps: 8, rpe: 7}, {weight: w, reps: 8, rpe: 8}, {weight: w, reps: 7, rpe: 9}];
const HEADER = ['Date', 'Program', 'Day', 'Exercise Name', 'Set Order', 'Weight (lb)', 'Reps', 'Distance (mi)', 'Seconds', 'RPE', 'Notes'];

test('criterion 1: 2 exercises x 3 sets: 1 header row + 6 data rows, each with the real program, day and name', (assert)=>{
  assert.ok(REAL, 'anchor: a real program day with two rep exercises');
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', sets: three(185)}], [KEY_B]: [{date: '2026-11-02', sets: three(95)}]}));
  assert.strictEqual(rows.length, 7);
  assert.deepStrictEqual(rows[0], HEADER);
  assert.deepStrictEqual(rows[1], ['2026-11-02', REAL.progLabel, REAL.dayLabel, REAL.a.e.name, '1', '185', '8', '', '', '7', '']);
  assert.deepStrictEqual(rows.slice(1).map(r => r[3] + '#' + r[4]), [1, 2, 3].map(n => REAL.a.e.name + '#' + n).concat([1, 2, 3].map(n => REAL.b.e.name + '#' + n)));
});

test('criterion 2: a name or note with a comma, a quote or a line break is quoted and escaped, and reads back intact', (assert)=>{
  const name = 'Press, "close" grip';
  const note = 'felt "heavy",\nstopped';
  const csv = csvFor({[KEY_A]: [{date: '2026-11-02', n: name, sets: [{weight: 100, reps: 5, note}]}]});
  assert.ok(csv.includes('"Press, ""close"" grip"'), 'quotes doubled inside a quoted field');
  const rows = parseCsv(csv);
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[1][3], name);
  assert.strictEqual(rows[1][10], note);
});

test('a text field starting with = + - or @ is prefixed so a spreadsheet shows it rather than running it', (assert)=>{
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', sets: [{weight: 100, reps: 5, note: '=HYPERLINK("x")'}, {weight: 100, reps: 5, note: '+1 rep'}]}]}));
  assert.strictEqual(rows[1][10], "'=HYPERLINK(\"x\")");
  assert.strictEqual(rows[2][10], "'+1 rep");
});

test('reps and RPE are written only as numbers, so a string from a restored backup can\'t become a formula', (assert)=>{
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', sets: [{weight: 100, reps: 5, rpe: '=1+1'}, {weight: 100, reps: '=2+2', distance: null}]}]}));
  assert.strictEqual(rows[1][9], '', 'string RPE dropped');
  assert.ok(!rows.some(r => r.some(c => /^=/.test(c))), 'no cell starts with =');
});

test('criterion 3: kg mode converts the stored pounds and says kg in the header', (assert)=>{
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', sets: [{weight: 225, reps: 5}]}]}, 'kg'));
  assert.strictEqual(rows[0][5], 'Weight (kg)');
  assert.strictEqual(rows[1][5], '102.1', '225 lb = 102.06 kg, to one decimal');
  assert.strictEqual(parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', sets: [{weight: 225, reps: 5}]}]}))[1][5], '225', 'lb stays as stored');
});

test('drop sets are their own rows under the parent with Notes "drop"; warm-ups and unlogged rows are left out', (assert)=>{
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', warmups: [{weight: 45, reps: 10}],
    sets: [{weight: 185, reps: 8, drops: [{weight: 135, reps: 10}, {weight: 95}]}, {weight: 185, reps: null}]}]}));
  assert.strictEqual(rows.length, 3, 'header, the set, its one complete drop');
  assert.deepStrictEqual(rows[2].slice(3), [REAL.a.e.name, '1', '135', '10', '', '', '', 'drop']);
  assert.ok(!rows.some(r => r[5] === '45'), 'no warm-up row');
  // A drop typed under a set that was never logged has no parent row, so it's left out too.
  const orphan = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-02', sets: [{weight: null, reps: null, drops: [{weight: 95, reps: 12}]}]}]}));
  assert.strictEqual(orphan.length, 1, 'header only');
});

test('within a day, exercises follow their place in the day as numbers (the 11th after the 3rd), not key text order', (assert)=>{
  // No authored day has 11 exercises yet, but custom programs can, so the
  // corpus entries are built by hand at indexes 10 and 2, given in key-text
  // order (10 before 2) as storage.list returns them.
  const slot = (idx, name) => ({key: `ex:custom1:d1:${idx}`, parsed: {program: 'custom1', dayId: 'd1', idx, programLabel: 'My Program', dayName: 'Day 1'}, exDef: {name, sets: '3×10'}, log: [{date: '2026-11-02', sets: [{weight: 50, reps: 10}]}]});
  let csv;
  runReal(ctx => { csv = ctx.buildWorkoutCsv([slot(10, 'Eleventh'), slot(2, 'Third')], 'lb', 'mi'); });
  assert.deepStrictEqual(parseCsv(csv).slice(1).map(r => r[3]), ['Third', 'Eleventh']);
});

test('Program and Day come from parseExKey\'s own fields, not from splitting the label', (assert)=>{
  let parsed;
  runReal(ctx => { parsed = ctx.parseExKey(KEY_A); });
  assert.strictEqual(parsed.programLabel, REAL.progLabel);
  assert.strictEqual(parsed.dayName, REAL.dayLabel);
  assert.strictEqual(parsed.dayLabel, `${REAL.progLabel} · ${REAL.dayLabel}`, 'the existing label is unchanged');
});

test('rows run oldest first across exercises; distance converts from metres', (assert)=>{
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '2026-11-05', sets: [{weight: 100, reps: 5}]}], [KEY_B]: [{date: '2026-11-01', sets: [{distance: 1609.344, reps: null}]}]}, 'lb', 'mi'));
  assert.deepStrictEqual(rows.slice(1).map(r => r[0]), ['2026-11-01', '2026-11-05']);
  assert.strictEqual(rows[1][7], '1', '1609.344 m = 1 mi');
  assert.strictEqual(parseCsv(csvFor({[KEY_B]: [{date: '2026-11-01', sets: [{distance: 5000}]}]}, 'lb', 'km'))[1][7], '5');
});

test('a timed hold goes to Seconds, not Reps', (assert)=>{
  let hold;
  runReal(ctx => {
    for(const [pk, prog] of Object.entries(ctx.programs)) for(const [dk, day] of Object.entries(prog.days || {})){
      (day.exercises || []).forEach((e, i) => { if(!hold && ctx.getSetFieldUnit(String(e.sets || '')) === 'sec') hold = {key: `ex:${pk}:${dk}:${i}`}; });
    }
  });
  assert.ok(hold, 'anchor: a real hold exercise');
  const rows = parseCsv(csvFor({[hold.key]: [{date: '2026-11-02', sets: [{weight: null, reps: 45}]}]}));
  assert.deepStrictEqual([rows[1][6], rows[1][8]], ['', '45']);
  // A positional key can hold another exercise's stamped entry (BL-51): the
  // logged exercise's own prescription decides, found by name in its program.
  const holdName = (() => { let n; runReal(ctx => { n = ctx.parseExKey(hold.key).exDef.name; }); return n; })();
  const holdProgram = hold.key.split(':')[1];
  let repKey;
  runReal(ctx => {
    for(const [dk, d] of Object.entries(ctx.programs[holdProgram].days || {})) (d.exercises || []).forEach((e, i) => {
      if(!repKey && ctx.getSetFieldUnit(String(e.sets || '')) === 'reps') repKey = `ex:${holdProgram}:${dk}:${i}`;
    });
  });
  assert.ok(repKey, 'anchor: a rep slot in the same program');
  const moved = parseCsv(csvFor({[repKey]: [{date: '2026-11-02', n: holdName, sets: [{weight: null, reps: 45}]}]}));
  assert.deepStrictEqual([moved[1][3], moved[1][6], moved[1][8]], [holdName, '', '45'], 'the hold logged under a rep slot still goes to Seconds');
});

test('an entry without a YYYY-MM-DD date is skipped, so nothing odd lands in the Date column', (assert)=>{
  const rows = parseCsv(csvFor({[KEY_A]: [{date: '=1+1', sets: [{weight: 100, reps: 5}]}, {sets: [{weight: 100, reps: 5}]}, {date: '2026-11-02', sets: [{weight: 100, reps: 5}]}]}));
  assert.deepStrictEqual(rows.slice(1).map(r => r[0]), ['2026-11-02']);
});

const EXPORT_CSV = (() => {
  const start = "const EXPORT_CSV_LABEL = ";
  const i = src.indexOf(start);
  if(i === -1) throw new Error('no CSV export listener');
  return src.slice(i, src.indexOf('\n});', i) + 4);
})();

test('criterion 4: the real button downloads <appSlug>-workouts-<name>-<date>.csv, as text/csv, and does not count as a backup', async (assert)=>{
  const { window } = runJsdom('<button id="exportCsvBtn">Export workouts as CSV</button>', `
    window.__downloads = []; window.__blobs = [];
    window.URL.createObjectURL = b => { window.__blobs.push(b); return 'blob:x'; }; window.URL.revokeObjectURL = () => {};
    window.HTMLAnchorElement.prototype.click = function(){ window.__downloads.push(this.download); };
    window.__writes = []; window.storage = {set: async k => { window.__writes.push(k); }};
    var userProfile = {name: 'Jordan Lee'}, weightUnit = 'lb', distanceUnit = 'mi';
    async function readExCorpus(){ return []; }
    function getTodayKey(){ return '2026-11-23'; }`,
    [/^const APP_NAME = .*$/m.exec(src)[0], extractFunction(src, 'appSlug'), ...CHUNKS, EXPORT_CSV]);
  window.document.getElementById('exportCsvBtn').click();
  for(let i = 0; i < 40 && !window.__downloads.length; i++) await new Promise(r => setTimeout(r, 5));
  assert.strictEqual(window.__downloads.length, 1);
  assert.match(window.__downloads[0], /\.csv$/);
  assert.strictEqual(window.__downloads[0], 'platestep-workouts-jordan-lee-2026-11-23.csv');
  assert.strictEqual(window.__blobs[0].type, 'text/csv;charset=utf-8');
  // A second tap while it says "Downloaded" does nothing, so the label comes back.
  const btn = window.document.getElementById('exportCsvBtn');
  assert.strictEqual(btn.textContent, 'Downloaded');
  btn.click();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(window.__downloads.length, 1, 'no second download while busy');
  assert.strictEqual(window.__writes.length, 0, 'last-backup untouched');
});

test('REAL markup: the CSV button sits under the JSON export and its note, before Import', (assert)=>{
  const order = ['id="exportDataBtn"', 'id="exportKeysNote"', 'id="exportCsvBtn"', 'id="importDataBtn"'].map(s => src.indexOf(s));
  assert.ok(order.every(i => i > 0), 'all four found');
  assert.deepStrictEqual([...order].sort((a, b) => a - b), order);
});

run();
