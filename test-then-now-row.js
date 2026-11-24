'use strict';
// v3.643 (UX-36, owner option c, 2026-11-23): under "Then", the exercise on
// the cover is one compact "now" row. It keeps its checkbox, pictogram, name,
// swap glyph, chevron and the spot bar, and shows "On the cover" in place of
// its set chips and prescription. When the cover moves on, the marker moves
// and the finished row shows its chips again. The list's ↑ arrows are
// --text-2, not green (gym mode unchanged), and "Then" no longer repeats the
// cover's week and phase line, only the time.
//
// Real invocation: the real page markup and stylesheet (jsdom's cascade), the
// real "On the cover" line taken from renderWorkout's row header, the real
// renderSetChips/renderAllSetChips and renderUpNext moving the marker.
//
// Sabotage: remove the compact rule and criterion 1 fails; colour the list
// arrow green again and criterion 4 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-then-now-row.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const BODY = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;

// The real "now" line from renderWorkout's row header (one occurrence).
const NOW_LINE = (()=>{
  const m = src.match(/\n\s*(<div class="ex-now-meta">On the cover<\/div>)/g) || [];
  if(m.length !== 1) throw new Error('ex-now-meta lines: ' + m.length);
  return m[0].trim();
})();

const NAMES = ['Bench Press', 'DB Curl', 'Pushdown'];
const ROW = (ex, set, wv = '', rv = '') => `<div class="set-row" data-set-idx="${set}" data-ex-idx="${ex}"><span class="set-row-owner">${NAMES[ex]}</span>
  <input class="ex-input ex-weight" placeholder="lb" value="${wv}"><input class="ex-input ex-reps" placeholder="reps" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
const HEAD = (i, name) => `<div class="exercise" role="button" tabindex="0"><input type="checkbox" data-idx="${i}" aria-label="Mark ${name} complete">
  <div class="ex-thumb"><svg></svg></div><div class="ex-name-wrap"><div class="ex-name">${name}<span class="ex-swap-icon">⇄</span></div><div class="ex-adjust-note">+1 set: every set hit its target</div></div>
  <div class="ex-sets"><span>4×4-6</span><span class="ex-rir">2–3 RIR</span></div>${NOW_LINE}<span class="ex-chevron" aria-hidden="true"></span></div>`;
const LIST = `<div class="exercise-block">${HEAD(0, 'Bench Press')}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${ROW(0, 0, '185', '5')}${ROW(0, 1)}${ROW(0, 2)}</div></div></div></div>
  <div class="exercise-block">${HEAD(1, 'DB Curl')}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${ROW(1, 0)}${ROW(1, 1)}</div></div></div></div>
  <div class="exercise-block">${HEAD(2, 'Pushdown')}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${ROW(2, 0)}${ROW(2, 1)}${ROW(2, 2)}</div></div></div></div>`;

const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
  'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips',
  'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor' /* v3.651 (BL-79) */,
  'renderUpNext', 'syncStickyDayTitle', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'readSetLogger', 'firstSetHint']
  .map(n => extractFunction(src, n)).concat([extractConst(src, 'ICONS'), extractFunction(src, 'icon')]);
const STUBS = `var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true;
  var exerciseInfo = {}; var COMPOUND_CATEGORIES = new Set(['chest', 'back']);
  function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
  function isBarbellExercise(n){ return /Bench/.test(n || ''); } function isDumbbellExercise(n){ return /DB/.test(n || ''); }
  function renderCoverBar(){} function renderExerciseDetailBar(){} function refreshGymLogBtn(){}`;

// The whole page under the real stylesheet, with the real functions loaded.
function page(bodyClass, cssOverride){
  const { window } = new JSDOM(`<!doctype html><html><head><style>${cssOverride || CSS}</style></head><body class="${bodyClass}">${BODY}</body></html>`, { pretendToBeVisual: true, runScripts: 'outside-only' });
  const doc = window.document;
  doc.getElementById('exerciseList').innerHTML = LIST;
  window.eval(STUBS + '\n' + FNS.join('\n') + '\nwindow.renderAllSetChips = renderAllSetChips; window.renderUpNext = renderUpNext;');
  const shown = el => window.getComputedStyle(el).display !== 'none';
  return { window, doc, $: id => doc.getElementById(id), shown, cs: el => window.getComputedStyle(el) };
}
const blocks = ui => [...ui.doc.querySelectorAll('#exerciseList .exercise-block')];
const visibleChips = (ui, b) => ui.shown(b.querySelector('.set-chips')) ? b.querySelectorAll('.set-chips .set-chip').length : 0;

test('criterion 1: exactly one row is "now": no visible chips or prescription, its meta reads "On the cover"; every other row\'s chips render as before', (assert)=>{
  const stripped = CSS.replace(/\.ex-now-meta\{display:none;\}[\s\S]*?color:var\(--text-2\);\}/, '.ex-now-meta{display:none;}');
  assert.ok(stripped !== CSS && !/is-now > \.set-chips/.test(stripped), 'anchor: the "before" page really lacks the compact rule');
  const before = page('day-red has-cover', stripped);
  before.window.renderAllSetChips(); before.window.renderUpNext();
  const ui = page('day-red has-cover');
  ui.window.renderAllSetChips(); ui.window.renderUpNext();
  const now = ui.doc.querySelectorAll('#exerciseList .is-now');
  assert.strictEqual(now.length, 1, 'exactly one');
  const b = now[0];
  assert.strictEqual(ui.$('upNextLift').textContent, 'Bench Press', 'anchor: the cover is on Bench Press');
  assert.ok(b.querySelector('.ex-name').textContent.startsWith('Bench Press'));
  assert.ok(b.querySelectorAll('.set-chips .set-chip').length > 0, 'anchor: its chips exist');
  assert.strictEqual(visibleChips(ui, b), 0, 'no visible chip');
  assert.ok(!ui.shown(b.querySelector('.ex-sets')), 'no prescription line');
  assert.ok(!ui.shown(b.querySelector('.ex-adjust-note')), 'no adjustment note: one meta line only');
  const meta = b.querySelector('.ex-now-meta');
  assert.ok(ui.shown(meta) && meta.textContent === 'On the cover', 'the meta line');
  assert.strictEqual(ui.cs(meta).color, 'var(--text-2)');
  for(const sel of ['input[type=checkbox]', '.ex-thumb', '.ex-name', '.ex-swap-icon', '.ex-chevron']) assert.ok(ui.shown(b.querySelector(sel)), sel + ' stays');
  // Every other row: chips as many as before the change, the meta line hidden.
  const others = blocks(ui).filter(x => x !== b);
  assert.deepStrictEqual(others.map(x => visibleChips(ui, x)), blocks(before).slice(1).map(x => visibleChips(before, x)));
  assert.ok(others.every(x => visibleChips(ui, x) > 0 && !ui.shown(x.querySelector('.ex-now-meta')) && ui.shown(x.querySelector('.ex-sets')) && ui.shown(x.querySelector('.ex-adjust-note'))));
});

test('criterion 2: after the cover\'s last set is logged, "now" moves to the next row; the finished row shows its chips again, all ticked', (assert)=>{
  const ui = page('day-red has-cover');
  ui.window.renderAllSetChips(); ui.window.renderUpNext();
  for(const r of ui.doc.querySelectorAll('.set-row[data-ex-idx="0"]')){ r.querySelector('.ex-weight').value = '185'; r.querySelector('.ex-reps').value = '5'; }
  ui.window.renderAllSetChips(); ui.window.renderUpNext();
  const [b0, b1] = blocks(ui);
  assert.ok(!b0.classList.contains('is-now') && b1.classList.contains('is-now'), 'the marker moved');
  assert.strictEqual(ui.$('upNextLift').textContent, 'DB Curl', 'anchor: the cover moved');
  assert.strictEqual(visibleChips(ui, b0), 3, 'the finished row shows its 3 chips');
  assert.ok([...b0.querySelectorAll('.set-chip')].every(c => c.classList.contains('is-done')), 'all ticked');
  assert.strictEqual(visibleChips(ui, b1), 0, 'the new "now" row is compact');
});

test('outside the cover: no compact row in gym mode (its own look)', (assert)=>{
  const gym = page('day-red has-cover gym-mode');
  gym.window.renderAllSetChips(); gym.window.renderUpNext();
  const b = gym.doc.querySelector('#exerciseList .is-now');
  assert.ok(b, 'anchor: the marker is set');
  const other = blocks(gym).find(x => x !== b);
  assert.strictEqual(gym.shown(b.querySelector('.set-chips')), gym.shown(other.querySelector('.set-chips')), 'gym mode treats the "now" row\'s chips as any other row\'s');
  assert.ok(gym.shown(b.querySelector('.ex-sets')) === gym.shown(other.querySelector('.ex-sets')), 'and its prescription line');
  assert.ok(!gym.shown(b.querySelector('.ex-now-meta')), 'and shows no meta line');
});

const arrowColour = (bodyClass, css) => {
  const ui = page(bodyClass, css);
  ui.window.renderAllSetChips();
  const chip = ui.doc.querySelector('#exerciseList .set-chip');
  chip.insertAdjacentHTML('beforeend', '<span class="set-chip-trend is-up">↑</span>');
  return ui.cs(chip.querySelector('.set-chip-trend')).color;
};
test('criterion 4: outside gym mode no list chip\'s ↑ computes to the green ink (it is --text-2); in gym mode it is unchanged', (assert)=>{
  assert.strictEqual(arrowColour('day-red has-cover'), 'var(--text-2)');
  assert.strictEqual(arrowColour('day-red has-cover gym-mode'), 'var(--plate-green)');
});

test('criterion 5: with the cover showing, "Then" carries no "Week" or "Accumulation", still the time; without the cover the phase line shows', (assert)=>{
  const line = bodyClass => {
    const ui = page(bodyClass);
    ui.$('mesocyclePhaseTag').textContent = 'Week 2 of 5 · Accumulation';
    ui.$('dayDuration').textContent = '~64 min';
    const row = ui.doc.querySelector('#workoutCard .duration-row');
    return [...row.children].filter(el => ui.shown(el) && el.textContent).map(el => el.textContent).join(' | ');
  };
  const withCover = line('day-red has-cover');
  assert.doesNotMatch(withCover, /Week|Accumulation/);
  assert.match(withCover, /~64 min/);
  assert.match(line('day-red'), /Week 2 of 5 · Accumulation/, 'anchor: without the cover the phase stays');
  // No stray leading " · " once the phase is hidden: the shown parts, with their separators as the cascade gives them.
  const sepRules = (()=>{ const { window } = new JSDOM(`<style>${CSS}</style>`); const out = []; const walk = l => { for(const r of l){ if(r.selectorText) out.push(r); else if(r.cssRules) walk(r.cssRules); } }; walk(window.document.styleSheets[0].cssRules); return out.filter(r => /::before$/.test(r.selectorText.split(',').pop().trim()) && /duration-row|mesocyclePhaseTag/.test(r.selectorText)); })();
  const shownLine = (dur, cal) => {
    const ui = page('day-red has-cover');
    ui.$('mesocyclePhaseTag').textContent = 'Week 2 of 5 · Accumulation'; ui.$('dayDuration').textContent = dur; ui.$('sessionCalTotal').textContent = cal;
    const parts = [...ui.doc.querySelector('#workoutCard .duration-row').children].filter(el => ui.shown(el) && el.textContent);
    return parts.map(el => {
      let sep = '';
      for(const r of sepRules) for(const sel of r.selectorText.split(/,(?![^(]*\))/).map(x => x.trim())){
        let hit = false; try{ hit = el.matches(sel.replace(/::before$/, '')); }catch(e){}
        if(hit) sep = r.style.getPropertyValue('content').replace(/^["']|["']$/g, '') === 'none' ? '' : r.style.getPropertyValue('content').replace(/^["']|["']$/g, '');
      }
      return sep + el.textContent;
    }).join('');
  };
  assert.strictEqual(shownLine('~64 min', '~620 kcal'), '~64 min · ~620 kcal');
  assert.strictEqual(shownLine('', '~620 kcal'), '~620 kcal', 'no leading separator with the time empty');
  assert.strictEqual(shownLine('~64 min', ''), '~64 min');
  // The tag keeps its text: the cover's program line reads it (renderUpNext).
  assert.match(extractFunction(src, 'renderUpNext'), /textOf\('mesocyclePhaseTag'\)/);
  // No leading " · " before the time once the phase is hidden.
  const rules = (()=>{ const { window } = new JSDOM(`<style>${CSS}</style>`); const out = []; const walk = l => { for(const r of l){ if(r.selectorText) out.push(r); else if(r.cssRules) walk(r.cssRules); } }; walk(window.document.styleSheets[0].cssRules); return out; })();
  const r = rules.find(x => x.selectorText.includes('body.has-cover:not(.gym-mode) #workoutCard #mesocyclePhaseTag + :not(:empty)::before'));
  assert.ok(r && r.style.getPropertyValue('content') === 'none');
});

test('REAL source: renderWorkout\'s row header carries the line once (lone rows and superset members share it)', (assert)=>{
  const body = extractFunction(src, 'renderWorkout');
  assert.strictEqual((body.match(/<div class="ex-now-meta">On the cover<\/div>/g) || []).length, 1);
  assert.match(body, /const headerInnerHtml = `[\s\S]*?ex-now-meta[\s\S]*?`;/);
  assert.match(body, /const memberHtml = \(piece\)=> `[\s\S]*?\$\{piece\.headerInnerHtml\}/, 'superset members use the same header');
});

run();
