'use strict';
// v3.275 (tasteskill Today pilot, 4c): the blurred plate-coloured halo behind
// the workout card's day plate is removed — its markup (#dayHeroGlow), its CSS
// (.workout-hero-glow) and the one renderWorkout line that coloured it — and
// the Adapt-session toggle and Gym mode button lose their gradient fills (flat
// at the old gradient's midpoint) and the toggle its coloured glow shadow.
// The plate itself (.day-hero-plate) is deliberately kept as modelled: it is
// the day's identity, the screen's signature element.
//
// Confirmed in Chromium: all 175 days across the 25 programs render with zero
// page/console errors after the renderWorkout line went, and the two buttons
// compute background-image none / box-shadow none.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-hero-glow-flat-buttons.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style><body>${extractElementById(src, 'workoutCard')}</body>`).window;

function rules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
function only(sel){
  const f = rules().filter(r => r.selectorText === sel);
  if(f.length !== 1) throw new Error(`expected one "${sel}" rule, found ${f.length}`);
  return f[0].style;
}
// Comment-stripped code, so a comment that NAMES the removed element (the CSS
// note does, on purpose) can't make a reference check pass or fail.
function code(fnSrc){ return fnSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1'); }

test('REAL markup: the workout hero holds the plate and nothing behind it', (assert)=>{
  assert.strictEqual(document.getElementById('dayHeroGlow'), null);
  const wrap = document.querySelector('.workout-hero-plate-wrap');
  assert.deepStrictEqual([...wrap.children].map(c => c.id), ['dayPlateIcon']);
});

test('REAL code: renderWorkout no longer touches the removed element (comments stripped), while it still paints the plate', (assert)=>{
  const fn = code(extractFunction(src, 'renderWorkout'));
  assert.ok(!/dayHeroGlow|workout-hero-glow/.test(fn), 'renderWorkout must not reference the removed glow — getElementById would return null and throw');
  // Sabotage anchor: the same stripped body still contains the plate paint, so
  // an over-eager strip (or the wrong function) can't make this vacuous.
  assert.match(fn, /getElementById\('dayPlateIcon'\)/);
  assert.match(fn, /'day-hero-plate ' \+ dayPlateClass/);
});

test('REAL CSSOM: no .workout-hero-glow rule survives, and the plate\'s own rule is intact', (assert)=>{
  assert.strictEqual(rules().filter(r => /workout-hero-glow/.test(r.selectorText)).length, 0);
  const plate = only('.day-hero-plate');
  assert.match(plate.getPropertyValue('border-radius'), /50%/);
  assert.notStrictEqual(plate.getPropertyValue('box-shadow'), '', 'the plate keeps its modelled depth');
});

// v3.287 (Glass & glow, owner-chosen): Adapt and Gym mode are frosted-glass
// pills now. What this test still guards from v3.275: neither glows (glow is
// reserved for the primary button and the coach button), borders are kept.
test('REAL CSSOM: Adapt and Gym mode are glass pills (glass fill, border kept) with no glow', (assert)=>{
  for(const sel of ['.adapt-workout-toggle', '.gym-enter-btn']){
    const st = only(sel);
    assert.strictEqual(st.getPropertyValue('background'), 'var(--glass-fill)', `${sel} is glass`);
    assert.match(st.getPropertyValue('border'), /1px solid/, `${sel} keeps its border`);
    assert.strictEqual(st.getPropertyValue('border-radius'), 'var(--radius-pill)');
    assert.strictEqual(st.getPropertyValue('box-shadow'), '', `${sel} must not glow`);
  }
});

run();
