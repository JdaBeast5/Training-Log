'use strict';
// v3.590 (BL-20): the per-muscle weekly set ledger in Progress's Weekly Volume
// card, fractional (a set counts 1 for each primary muscle, 0.5 for each
// synergist [PEL]) against a "10+" floor [ACSM26]. Grey under the floor, the
// day's ink at or above it, the fill stops at the floor, and above about 20 a
// neutral line says more isn't needed. The group rows above it are unchanged.
//
// Real invocation: the real computeWeeklyMuscleSets, EXERCISE_MUSCLES,
// renderMuscleLedgerHtml and renderVolumeTrend (readExCorpus stubbed at its
// storage boundary), the real CSSOM, and the real programs for coverage.
//
// Sabotage: count synergists as 1 and criterion 1 fails; drop the floor cap and
// criterion 4 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runSandbox, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-muscle-ledger.js');

const MONDAY = '2026-11-16';
const entry = (date, n) => ({date, sets: Array.from({length: n}, () => ({weight: 100, reps: 8}))});
const ex = (name, ...entries) => ({exDef: {name}, log: entries});
const LEDGER = [extractConst(src, 'LEDGER_MUSCLES'), extractConst(src, 'EXERCISE_MUSCLES'), 'const LEDGER_FLOOR = 10, LEDGER_PLENTY = 20;',
  extractFunction(src, 'setCountOf'), extractFunction(src, 'computeWeeklyMuscleSets'), extractFunction(src, 'renderMuscleLedgerHtml')];
if(!src.includes('const LEDGER_FLOOR = 10, LEDGER_PLENTY = 20;')) throw new Error('LEDGER_FLOOR/PLENTY changed');

test('criterion 1: a week of Bench 4 sets and Incline DB Press 3 sets gives chest 7, triceps 3.5, front delts 3.5', (assert)=>{
  const [r] = runSandbox(LEDGER, `__capture.push(computeWeeklyMuscleSets(${JSON.stringify([ex('Bench Press', entry('2026-11-17', 4)), ex('Incline DB Press', entry('2026-11-19', 3)), ex('Bench Press', entry('2026-11-10', 9), entry('2026-11-23', 9))])}, '${MONDAY}'));`);
  assert.deepStrictEqual(r, {chest: 7, triceps: 3.5, 'front delts': 3.5}, 'only this week counts');
});

function ledgerDoc(sets){
  const [h] = runSandbox(LEDGER, `__capture.push(renderMuscleLedgerHtml(${JSON.stringify(sets)}));`);
  return new JSDOM(`<style>${[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')}</style><body>${h}</body>`).window.document;
}

test('criterion 2: one .muscle-ledger-row per muscle with sets > 0, each showing one decimal and "/ 10+"', (assert)=>{
  const doc = ledgerDoc({chest: 7, triceps: 3.5, 'front delts': 3.5, quads: 0});
  const rows = [...doc.querySelectorAll('.muscle-ledger-row')];
  assert.deepStrictEqual(rows.map(r => r.querySelector('.ml-name').textContent), ['Chest', 'Front delts', 'Triceps']);
  assert.deepStrictEqual(rows.map(r => r.querySelector('.ml-val').textContent.replace(/\s+/g, ' ').trim()), ['7.0 / 10+', '3.5 / 10+', '3.5 / 10+']);
});

test('criterion 3: every exercise in strength, bodybuilding, powerbuilding and powerlifting (all day-count variants) has an EXERCISE_MUSCLES entry', (assert)=>{
  const [r] = runSandbox([extractConst(src, 'programs'), extractConst(src, 'PROGRAM_DAY_COUNT_VARIANTS'), extractConst(src, 'EXERCISE_MUSCLES'), extractConst(src, 'LEDGER_MUSCLES')], `
    const names = new Set();
    const visit = days => { for(const d of Object.values(days || {})) for(const e of d.exercises || []) names.add(e.name); };
    for(const p of ['strength', 'bodybuilding', 'powerbuilding', 'powerlifting']){ visit(programs[p].days); const v = PROGRAM_DAY_COUNT_VARIANTS[p];
      if(v) for(const x of Object.values(v)){ if(x && x.days) visit(x.days); else for(const y of Object.values(x || {})) visit(y && y.days); } }
    const bad = Object.values(EXERCISE_MUSCLES).flatMap(m => [...m.p, ...m.s]).filter(mu => !LEDGER_MUSCLES.includes(mu));
    __capture.push({n: names.size, missing: [...names].filter(n => !EXERCISE_MUSCLES[n]), bad});`);
  assert.ok(r.n >= 40, 'exercises swept: ' + r.n);
  assert.deepStrictEqual(r.missing, []);
  assert.deepStrictEqual(r.bad, [], 'every muscle named is one of the twelve');
});

test('criterion 4: 10 and 25 sets render equal fill widths, and only 25 shows "More isn\'t needed; returns get smaller"', (assert)=>{
  const doc = ledgerDoc({chest: 10, quads: 25});
  const [chest, quads] = [...doc.querySelectorAll('.muscle-ledger-row')];
  assert.strictEqual(chest.querySelector('.ml-fill').style.width, '100%');
  assert.strictEqual(quads.querySelector('.ml-fill').style.width, chest.querySelector('.ml-fill').style.width);
  assert.strictEqual(chest.querySelector('.ml-note'), null);
  assert.strictEqual(quads.querySelector('.ml-note').textContent, "More isn't needed; returns get smaller.");
  assert.strictEqual(ledgerDoc({chest: 5}).querySelector('.ml-fill').style.width, '50%');
});

test('criterion 5: under the floor the fill is --text-3 (grey); at or above it, the day\'s ink (--spot); no state colour on any ledger rule', (assert)=>{
  const doc = ledgerDoc({chest: 7, quads: 12});
  const [under, over] = [...doc.querySelectorAll('.ml-fill')];
  assert.ok(under.classList.contains('is-under') && !over.classList.contains('is-under'));
  const rules = []; const walk = l => { for(const r of l){ if(r.style && r.selectorText) rules.push(r); else if(r.cssRules) walk(r.cssRules); } };
  walk(doc.styleSheets[0].cssRules);
  const rule = sel => rules.find(r => r.selectorText === sel).style;
  assert.strictEqual(rule('.ml-fill.is-under').getPropertyValue('background'), 'var(--text-3)');
  assert.strictEqual(rule('.ml-fill').getPropertyValue('background'), 'var(--spot, var(--text))');
  const ledgerRules = rules.filter(r => /muscle-ledger|\.ml-/.test(r.selectorText));
  assert.ok(ledgerRules.length >= 6, 'anchor');
  for(const r of ledgerRules) assert.doesNotMatch(r.style.cssText, /--positive|--negative|--warning|plate-(green|yellow|red)/, r.selectorText);
  assert.strictEqual(doc.querySelectorAll('.muscle-ledger [class*="vol-landmark"]').length, 0);
});

// The real renderVolumeTrend over a stub corpus (this week and last).
function volumeHtml(source){
  const corpus = [ex('Bench Press', entry('2026-11-17', 4), entry('2026-11-10', 3)), ex('Incline DB Press', entry('2026-11-19', 3)), ex('Squat', entry('2026-11-18', 5))];
  const fns = ['getTodayKey', 'mondayOf', 'volumeOf', 'dropVolumeOf', 'setCountOf', 'volumeLandmarkLabel', 'escapeHtml', 'icon', 'toDisplayWeight', 'renderVolumeTrend'];
  const has = (n) => { try{ extractFunction(source, n); return true; }catch(e){ return false; } };
  const extra = has('computeWeeklyMuscleSets') ? [extractConst(source, 'LEDGER_MUSCLES'), extractConst(source, 'EXERCISE_MUSCLES'), 'const LEDGER_FLOOR = 10, LEDGER_PLENTY = 20;', extractFunction(source, 'computeWeeklyMuscleSets'), extractFunction(source, 'renderMuscleLedgerHtml')] : [];
  const { window } = runJsdom('<div id="volumeTrend"></div>', `
    var weightUnit = 'lb', exerciseInfo = {'Bench Press': {category: 'push'}, 'Incline DB Press': {category: 'push'}, 'Squat': {category: 'squat'}};
    Date.now = () => new Date('2026-11-19T12:00:00').getTime(); const _D = Date; Date = class extends _D { constructor(...a){ super(...(a.length ? a : [_D.now()])); } static now(){ return _D.now(); } };
    async function readExCorpus(){ return ${JSON.stringify(corpus)}; }`,
    [extractConst(source, 'MUSCLE_GROUP_MAP'), extractConst(source, 'VOLUME_LANDMARKS'), extractConst(source, 'ICONS'), ...extra, ...fns.map(n => extractFunction(source, n)), 'window.__done = renderVolumeTrend();']);
  return window;
}

const GROUP_ROWS_V3589 = [
  'Chest & Shoulders +133% This week: 5,600 lb Last week: 2,400 lb 7 sets/wk — below the typical 10-20 range for growth',
  'Legs (Quads) new This week: 4,000 lb Last week: 0 lb 5 sets/wk — below the typical 10-20 range for growth',
];
test('criterion 6: the group rows render unchanged for the same fixture (their text before and after); the ledger follows them', async (assert)=>{
  const after = volumeHtml(src); await after.__done;
  const text = w => [...w.document.querySelectorAll('#volumeTrend .vol-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
  // Snapshot of the group rows for this fixture at v3.589 (the parent commit), taken by
  // running that commit's renderVolumeTrend: the ledger must leave them exactly as they were.
  assert.deepStrictEqual(text(after), GROUP_ROWS_V3589);
  const ledger = after.document.querySelector('#volumeTrend .muscle-ledger');
  assert.ok(ledger, 'the ledger is inside the Weekly Volume card');
  assert.ok(after.document.querySelector('#volumeTrend .vol-row').compareDocumentPosition(ledger) & 4, 'below the group rows');
  assert.match(ledger.textContent, /Chest\s+7\.0 \/ 10\+/);
  assert.match(ledger.textContent, /Quads\s+5\.0 \/ 10\+/);
});

run();
