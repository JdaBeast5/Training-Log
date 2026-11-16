'use strict';
// v3.540 (UX-01b, owner decision D13): dayInk(id), one day-to-ink rule, with
// no visible change. The day's own plate code decides (every built-in day has
// one); a rest day without a plate is 'off'; a custom day with no plate takes
// red, blue, yellow, green by position. Nothing renders from it yet, and
// getDayPlateClass (which colours days by position from seven hues) is
// untouched. UX-05 extends this file when the screens switch.
//
// 2026-11-16 (v3.587, UX-05): the screens switch. getDayPlateClass is now a
// thin wrapper over dayInk (one rule), VIVID_PLATE_CLASSES is gone, and
// applyDayInk puts the day's day-<ink> class on <body>. UX-01b's criterion 4
// ("getDayPlateClass's source is byte-identical to v3.539") is retired on
// purpose, and criterion 2's documented difference is gone.
//
// Real invocation: the real dayInk over the real programs, every *_STYLES
// style and every PROGRAM_DAY_COUNT_VARIANTS day; the real getDayPlateClass.
//
// Sabotage: make dayInk return 'red' for everything, and criterion 1 fails
// (Strength Day 2 is blue).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-day-ink.js');
const DATA = ['programs', 'MEDICAL_STYLES', 'COMBAT_STYLES', 'CYCLING_STYLES', 'WATERSPORTS_STYLES', 'YOGA_STYLES', 'PROGRAM_DAY_COUNT_VARIANTS', 'DAY_INKS', 'CUSTOM_PLATES'].map(c => extractConst(src, c)).concat(["var activeProgram = 'strength';"]);
const FNS = [extractFunction(src, 'dayInk'), extractFunction(src, 'getDayPlateClass'), extractFunction(src, 'applyDayInk')];

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

// 2026-11-16 (v3.587, UX-05): the documented difference is gone. Day 5 was
// purple by position; its disc is now green, its own plate.
test('criterion 2 (UX-05): Strength & Size Day 5 is green by its plate, and getDayPlateClass now agrees', (assert)=>{
  const [r] = runSandbox([...DATA, ...FNS], `
    var dayDefs = programs.strength.days, dayOrder = Object.keys(dayDefs);
    __capture.push({ink: dayInk('d5', 'strength'), cls: getDayPlateClass('d5'), plate: programs.strength.days.d5.plate});`);
  assert.strictEqual(r.plate, 'p-green');
  assert.strictEqual(r.ink, 'green');
  assert.strictEqual(r.cls, 'p-green');
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

// ---- v3.587 (UX-05): the day sets the ink ------------------------------
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const RULES = (() => { const out = []; const walk = l => { for(const r of l){ if(r.style && r.selectorText) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  walk(new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0].cssRules); return out; })();
const ruleOf = sel => { const f = RULES.filter(r => r.selectorText === sel && !r.parentRule); if(f.length !== 1) throw new Error(sel + ': ' + f.length); return f[0].style; };

test('UX-05 criterion 1: for every day of every program, style and day-count variant, applyDayInk leaves exactly one day-* class on body: day-<dayInk>', (assert)=>{
  const { window } = runJsdom('', '', [...DATA, ...FNS, `
    const bad = []; let n = 0;
    const visit = (days) => { programs.__t = {days}; for(const id of Object.keys(days || {})){
      n++; document.body.className = 'day-red other';
      const ink = applyDayInk(id, '__t');
      const dayCls = [...document.body.classList].filter(c => /^day-/.test(c));
      if(dayCls.length !== 1 || dayCls[0] !== 'day-' + dayInk(id, '__t') || ink !== dayInk(id, '__t') || !document.body.classList.contains('other')) bad.push(id + ' ' + dayCls.join(','));
    } };
    for(const k of Object.keys(programs)) if(k !== '__t') visit(programs[k].days);
    for(const T of [MEDICAL_STYLES, COMBAT_STYLES, CYCLING_STYLES, WATERSPORTS_STYLES, YOGA_STYLES]) for(const st of Object.values(T)) visit(st.days);
    for(const v of Object.values(PROGRAM_DAY_COUNT_VARIANTS)) for(const x of Object.values(v)){ if(x && x.days) visit(x.days); else for(const y of Object.values(x || {})) visit(y.days); }
    applyDayInk('d5', 'strength'); window.__d5 = document.body.className;
    window.__r = {n, bad: bad.slice(0, 5), badCount: bad.length};`]);
  assert.ok(window.__r.n >= 1900, 'days visited: ' + window.__r.n);
  assert.strictEqual(window.__r.badCount, 0, window.__r.bad.join('; '));
  assert.match(window.__d5, /\bday-green\b/, 'Strength & Size Day 5 is green (its own plate), not by position');
});

test('UX-05 criterion 2: CSSOM: each of the six .day-* rules declares --spot, --on-spot and --spot-deep; the four colour inks name their own tokens', (assert)=>{
  for(const ink of ['red', 'blue', 'yellow', 'green', 'white', 'off']){
    const st = ruleOf('.day-' + ink);
    for(const p of ['--spot', '--on-spot', '--spot-deep']) assert.ok(st.getPropertyValue(p).trim(), `.day-${ink} ${p}`);
    if(['red', 'blue', 'yellow', 'green'].includes(ink)){
      assert.strictEqual(st.getPropertyValue('--spot').trim(), `var(--spot-${ink})`);
      assert.strictEqual(st.getPropertyValue('--on-spot').trim(), `var(--on-${ink})`);
      assert.strictEqual(st.getPropertyValue('--spot-deep').trim(), `var(--deep-${ink})`);
    }
  }
  assert.strictEqual(ruleOf('.day-white').getPropertyValue('--spot-deep').trim(), 'var(--rule-strong)');
  assert.strictEqual(ruleOf('.day-off').getPropertyValue('--spot-deep').trim(), 'var(--surface-2)');
});

test('UX-05 criterion 3: getDayPlateClass(id) is p- + dayInk(id, activeProgram) for every day (one rule)', (assert)=>{
  const [r] = runSandbox([...DATA, ...FNS], `
    const bad = [];
    for(const k of Object.keys(programs)){ activeProgram = k; var dayDefs = programs[k].days || {}, dayOrder = Object.keys(dayDefs);
      for(const id of dayOrder) if(getDayPlateClass(id) !== 'p-' + dayInk(id, k)) bad.push(k + ' ' + id); }
    __capture.push(bad);`);
  assert.deepStrictEqual(r, []);
  assert.doesNotMatch(src, /VIVID_PLATE_CLASSES/, 'the position palette is gone');
});

// The --plate-* accents at v3.528 (and unchanged since): UX-05 does not re-point them.
const PLATE_SNAPSHOT = {
  dark: {'--plate-red': '#FF453A', '--plate-blue': '#5B7CFF', '--plate-yellow': '#F5C518', '--plate-green': '#32D74B', '--plate-purple': '#B26BFF', '--plate-orange': '#FF7A33', '--plate-teal': '#2FB8C4', '--plate-white': '#E4E7EB', '--plate-off': '#4A5057'},
  light: {'--plate-red': '#D70015', '--plate-orange': '#B04400', '--plate-yellow': '#8F6200', '--plate-green': '#187A33', '--plate-teal': '#0B7480', '--plate-purple': '#8436D6', '--plate-blue': '#3A57E0'},
};
test('UX-05 criterion 4: the .p-red ... .p-white discs read var(--spot-...); every --plate-* accent keeps its value in both themes', (assert)=>{
  for(const ink of ['red', 'blue', 'yellow', 'green', 'white']) assert.strictEqual(ruleOf('.p-' + ink).getPropertyValue('background').trim(), `var(--spot-${ink})`);
  for(const gone of ['.p-purple', '.p-orange', '.p-teal']) assert.strictEqual(RULES.filter(r => r.selectorText === gone).length, 0, gone);
  const root = RULES.find(r => r.selectorText === ':root');
  const light = RULES.find(r => r.selectorText === 'body:not(.gym-mode)' && r.parentRule && r.parentRule.media && /light/.test(r.parentRule.media.mediaText));
  for(const [k, v] of Object.entries(PLATE_SNAPSHOT.dark)) assert.strictEqual(root.style.getPropertyValue(k).trim(), v, 'dark ' + k);
  for(const [k, v] of Object.entries(PLATE_SNAPSHOT.light)) assert.strictEqual(light.style.getPropertyValue(k).trim(), v, 'light ' + k);
});

test('UX-05 criterion 5: renderWorkout calls applyDayInk( exactly once, and --day-hue reads the ink, not getDayPlateClass(...).slice(2) (comments stripped)', (assert)=>{
  const fn = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((fn.match(/\bapplyDayInk\(/g) || []).length, 1);
  const hue = fn.split('\n').filter(l => /--day-hue/.test(l));
  assert.strictEqual(hue.length, 1);
  assert.match(hue[0], /'var\(--spot-' \+ dayInkName \+ '\)'/);
  assert.doesNotMatch(hue[0], /getDayPlateClass/);
});

run();
