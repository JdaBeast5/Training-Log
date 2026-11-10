'use strict';
// v3.540 (UX-01b, owner decision D13): dayInk(id), one day-to-ink rule, with
// no visible change. The day's own plate code decides (every built-in day has
// one); a rest day without a plate is 'off'; a custom day with no plate takes
// red, blue, yellow, green by position. Nothing renders from it yet, and
// getDayPlateClass (which colours days by position from seven hues) is
// untouched. UX-05 extends this file when the screens switch.
//
// Real invocation: the real dayInk over the real programs, every *_STYLES
// style and every PROGRAM_DAY_COUNT_VARIANTS day; the real getDayPlateClass.
//
// Sabotage: make dayInk return 'red' for everything, and criterion 1 fails
// (Strength Day 2 is blue).
const crypto = require('crypto');
const { readIndexSource, extractFunction, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-day-ink.js');
const DATA = ['programs', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES', 'PROGRAM_DAY_COUNT_VARIANTS', 'DAY_INKS', 'VIVID_PLATE_CLASSES', 'CUSTOM_PLATES'].map(c => extractConst(src, c)).concat(["var activeProgram = 'strength';"]);
const FNS = [extractFunction(src, 'dayInk'), extractFunction(src, 'getDayPlateClass')];

test('criterion 1: for every built-in day (programs, styles, day-count variants) dayInk returns one of the six inks and equals its plate code', (assert)=>{
  const [r] = runSandbox([...DATA, ...FNS], `
    const seen = new Set(); const bad = []; let n = 0;
    const visit = (days) => { for(const [id, d] of Object.entries(days || {})){
      if(!d || seen.has(d)) continue; seen.add(d); n++;
      const ink = dayInk(d);
      const want = (d.plate || '').replace(/^p-/, '');
      if(!DAY_INKS.includes(ink) || ink !== want) bad.push(id + ' ' + d.plate + ' -> ' + ink);
    } };
    for(const k of Object.keys(programs)) visit(programs[k].days);
    for(const T of [MEDICAL_STYLES, COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES]) for(const st of Object.values(T)) visit(st.days);
    for(const v of Object.values(PROGRAM_DAY_COUNT_VARIANTS)) for(const x of Object.values(v)){ if(x && x.days) visit(x.days); else for(const y of Object.values(x || {})) visit(y.days); }
    __capture.push({n, bad: bad.slice(0, 5), badCount: bad.length, d2: dayInk('d2', 'strength')});`);
  assert.ok(r.n >= 1900, 'days visited: ' + r.n);
  assert.strictEqual(r.badCount, 0, r.bad.join('; '));
  assert.strictEqual(r.d2, 'blue', 'by id: Strength Day 2');
});

test('criterion 2: Strength & Size Day 5 is green by its plate, while getDayPlateClass colours it purple by position (documented difference)', (assert)=>{
  const [r] = runSandbox([...DATA, ...FNS], `
    var dayDefs = programs.strength.days, dayOrder = Object.keys(dayDefs);
    __capture.push({ink: dayInk('d5', 'strength'), cls: getDayPlateClass('d5'), plate: programs.strength.days.d5.plate});`);
  assert.strictEqual(r.plate, 'p-green');
  assert.strictEqual(r.ink, 'green');
  assert.strictEqual(r.cls, 'p-purple');
});

test('criterion 3: a rest day is off; a day with no plate takes the red, blue, yellow, green cycle by its place among training days; unknown days are off', (assert)=>{
  const [r] = runSandbox([...DATA, ...FNS], `
    programs.custom1 = { days: { d1: {label: 'A'}, d2: {rest: true, plateNum: 'OFF'}, d3: {label: 'C'}, d4: {label: 'D'}, d5: {label: 'E'}, d6: {label: 'F'}, d7: {rest: true, plateNum: '—'} } };
    const p = programs.custom1.days;
    __capture.push({
      restBuiltIn: dayInk({rest: true, plate: 'p-off', plateNum: 'OFF'}),
      custom: ['d1', 'd3', 'd4', 'd5', 'd6'].map(id => dayInk(id, 'custom1')),
      byObject: dayInk(p.d4, 'custom1'),
      fullRest: dayInk('d2', 'custom1'), activeRest: dayInk('d7', 'custom1'),
      unknownPlateKnownDay: (p.d3.plate = 'p-purple', dayInk('d3', 'custom1')),
      idOnly: dayInk('d2'), // the active program (strength), as getDayPlateClass
      unknown: [dayInk(null), dayInk('zz', 'custom1'), dayInk('d1', 'nope'), dayInk({label: 'loose'})],
    });`);
  assert.strictEqual(r.restBuiltIn, 'off');
  assert.deepStrictEqual(r.custom, ['red', 'blue', 'yellow', 'green', 'red'], 'consecutive inks over training days, repeating, never grey');
  assert.strictEqual(r.byObject, 'yellow', 'a day object finds its own place');
  assert.strictEqual(r.fullRest, 'off');
  assert.strictEqual(r.activeRest, 'white', 'active recovery, as the built-in data marks it');
  assert.strictEqual(r.unknownPlateKnownDay, 'blue', 'an unknown plate code falls back to the day\'s place');
  assert.strictEqual(r.idOnly, 'blue', 'id only reads the active program: Strength Day 2 is blue');
  assert.deepStrictEqual(r.unknown, ['off', 'off', 'off', 'off']);
});

test('the fallback follows the user\'s saved day order for the active program', (assert)=>{
  const [r] = runSandbox([...DATA, ...FNS], `
    programs.custom2 = { days: { d1: {}, d2: {}, d3: {} } }; activeProgram = 'custom2'; var dayOrder = ['d3', 'd1', 'd2'];
    __capture.push(['d3', 'd1', 'd2'].map(id => dayInk(id)));`);
  assert.deepStrictEqual(r, ['red', 'blue', 'yellow']);
});

// getDayPlateClass at v3.539 (the parent commit): sha256 of its source, and
// its outputs for the strength days.
const GET_DAY_PLATE_CLASS_SHA256 = '799a9b6e4cb469b3cd41b053a2171a899f67c62750ff587dcb72094017916388';
test('criterion 4: no rendered change: getDayPlateClass\'s source is byte-identical to v3.539 and its strength outputs are unchanged', (assert)=>{
  assert.strictEqual(crypto.createHash('sha256').update(extractFunction(src, 'getDayPlateClass')).digest('hex'), GET_DAY_PLATE_CLASS_SHA256);
  const [r] = runSandbox([...DATA, ...FNS], `var dayDefs = programs.strength.days, dayOrder = Object.keys(dayDefs); __capture.push(dayOrder.map(id => id + ':' + getDayPlateClass(id)));`);
  assert.deepStrictEqual(r, ['d1:p-red', 'd2:p-blue', 'd3:p-yellow', 'd4:p-green', 'd5:p-purple', 'd6:p-orange', 'd7:p-off']);
  // The only caller is the share card (v3.547, MKT-03 criterion 6, re-pinned
  // from 1): nothing on screen reads dayInk yet (comments stripped).
  const code = src.split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((code.match(/\bdayInk\(/g) || []).length, 2, 'its declaration and drawStoryCard');
  assert.match(extractFunction(src, 'drawStoryCard'), /dayInk\(cardData\.dayId \?\? activeDay, activeProgram\)/);
});

run();
