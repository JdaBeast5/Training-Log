'use strict';
// v3.604 (UX-23): "Then". Under the cover, the day's remaining work is a
// ruled list on the ground in the world's ink, not a 2.0 glass card: the
// card loses its fill, border and radius; while the cover shows, its second
// day hero isn't displayed (the cover's headline names the day); the head is
// "Then" over one quiet line (phase · length · calories); session length and
// Gym mode are plain controls; the chips take the cover's grammar (done = ink
// fill with a check, ready = a 2.5 px ink border, pending dashed, no "="
// mark); the exercise on the cover carries a "now" rule. Gym mode keeps its
// own look (UX-17 decides it).
//
// Real invocation: the real page markup (scripts stripped) under the real
// stylesheet, resolved by jsdom's cascade (specificity included); the real
// syncTodayChrome sets body.has-cover; the real renderSetChips writes the
// chips; the real renderUpNext (with the functions test-today-cover.js loads)
// sets the "now" marker.
//
// Sabotage: show the hero beside the cover and criterion 2 fails; put the
// blue back on the ready chip and criterion 5 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-then.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const BODY = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;

// A list shaped like renderWorkout's: a plain exercise and a superset pair.
const NAMES = ['Bench Press', 'DB Curl', 'Pushdown'];
const ROW = (ex, set, wv = '', rv = '') => `<div class="set-row" data-set-idx="${set}" data-ex-idx="${ex}"><span class="set-row-owner">${NAMES[ex]}</span>
  <input class="ex-input ex-weight" placeholder="lb" value="${wv}"><input class="ex-input ex-reps" placeholder="reps" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE" value=""></div>`;
const HEAD = (i, name) => `<div class="exercise" role="button" tabindex="0"><input type="checkbox" data-idx="${i}" aria-label="Mark ${name} complete">
  <div class="ex-thumb"><svg></svg></div><div class="ex-name-wrap"><div class="ex-name">${name}<span class="ex-swap-icon">⇄</span></div></div>
  <div class="ex-sets"><span>4×4-6</span><span class="ex-rir" aria-label="2–3 reps short">2–3 RIR</span></div><span class="ex-chevron" aria-hidden="true"></span></div>`;
const LIST = `<div class="exercise-block">${HEAD(0, 'Bench Press')}<div class="set-chips" role="group"></div>
    <div class="expand-wrap"><div><div class="sets-block">${ROW(0, 0, '185', '5')}${ROW(0, 1, '185', '5')}${ROW(0, 2)}${ROW(0, 3)}</div></div></div></div>
  <div class="exercise-block superset-pair"><div class="superset-tag"><span class="superset-tag-link"></span>Superset</div>
    <div class="superset-member" data-ex-idx="1">${HEAD(1, 'DB Curl')}</div><div class="superset-member" data-ex-idx="2">${HEAD(2, 'Pushdown')}</div>
    <div class="set-chips" role="group"></div><div class="expand-wrap"><div><div class="sets-block">${ROW(1, 0)}${ROW(2, 0)}${ROW(1, 1)}${ROW(2, 1)}</div></div></div></div>`;

const CHIP_FNS = ['escapeHtml', 'numericPlaceholder', 'setChipValues', 'setChipLabel', 'setChipOwnerTag', 'renderSetChips', 'trimUnitNum', 'parseTopRep', 'parseBottomRep',
  'recommendNextSet', 'setSheetWeightStep'].map(n => extractFunction(src, n));
CHIP_FNS.push(extractConst(src, 'ICONS'), extractFunction(src, 'icon'));

// The whole page under the real stylesheet; body classes as the app sets them.
function page(bodyClass){
  const { window } = new JSDOM(`<!doctype html><html><head><style>${CSS}</style></head><body class="${bodyClass}">${BODY}</body></html>`, { pretendToBeVisual: true });
  const doc = window.document;
  doc.getElementById('exerciseList').innerHTML = LIST;
  return { window, doc, $: id => doc.getElementById(id), cs: (el, pseudo) => window.getComputedStyle(el, pseudo) };
}
// Every rule in the stylesheet, flattened (media blocks included).
const RULES = (()=>{
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const out = [];
  const walk = l => { for(const r of l){ if(r.selectorText) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  walk(window.document.styleSheets[0].cssRules);
  return out;
})();
// jsdom computes no pseudo-elements: their declarations come from the one rule
// with exactly this selector (each is declared once).
const pseudo = sel => { const f = RULES.filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length} rules`); return f[0].style; };
// jsdom's computed style drops a shorthand holding var() (a border of
// "2.5px solid var(--text)" computes as none), so border checks take the
// winning declaration from the CSSOM: the matching rule of highest
// specificity, later rules winning ties, over a list of properties that all
// set the same thing (the shorthand and its longhands).
function specificity(sel){
  let a = 0, b = 0, c = 0;
  sel = sel.replace(/:not\(([^()]*)\)/g, (m, inner) => { const [x, y, z] = specificity(inner); a += x; b += y; c += z; return ''; });
  a += (sel.match(/#[\w-]+/g) || []).length;
  b += (sel.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) || []).length;
  c += (sel.match(/(^|[\s>+~])[a-z][\w-]*/gi) || []).length + (sel.match(/::[\w-]+/g) || []).length;
  return [a, b, c];
}
const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
function cascade(el, props){
  let best = null;
  RULES.forEach((r, order) => {
    for(const sel of r.selectorText.split(/,(?![^(]*\))/).map(t => t.trim())){
      if(/::/.test(sel)) continue;
      let hit = false; try{ hit = el.matches(sel); }catch(e){}
      if(!hit) continue;
      for(const p of props){
        const v = r.style.getPropertyValue(p);
        if(!v) continue;
        const spec = specificity(sel);
        if(!best || cmp(spec, best.spec) > 0 || (cmp(spec, best.spec) === 0 && order >= best.order)) best = {spec, order, prop: p, value: v, sel};
      }
    }
  });
  return best;
}
const BORDER = ['border', 'border-top', 'border-color', 'border-top-color', 'border-style', 'border-top-style', 'border-width', 'border-top-width'];
const STUBS = `var exerciseInfo = {}; var COMPOUND_CATEGORIES = new Set(['chest', 'back']);
    function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; }
    function isBarbellExercise(n){ return /Bench/.test(n || ''); } function isDumbbellExercise(n){ return /DB/.test(n || ''); }`;

test('criterion 1: #workoutCard (not in gym mode) is on the ground: transparent, no border, radius 0; nothing in it is glass, gradient text or a blurred shadow', (assert)=>{
  const ui = page('day-red has-cover today-cover');
  const card = ui.cs(ui.$('workoutCard'));
  assert.ok(['transparent', 'rgba(0, 0, 0, 0)'].includes(card.backgroundColor), 'transparent: ' + card.backgroundColor);
  const cb = cascade(ui.$('workoutCard'), ['border-top-style', 'border-style']);
  assert.strictEqual(cb.value, 'none', 'no border');
  assert.match(cb.sel, /^body:not\(\.gym-mode\) #workoutCard$/, 'from the flat card rule');
  assert.strictEqual(card.borderRadius, '0px');
  assert.strictEqual(card.boxShadow, 'none');
  assert.strictEqual(pseudo('body:not(.gym-mode) #workoutCard::before').getPropertyValue('display'), 'none');
  // Every element of the head and the list, as the cascade resolves it. Not
  // the hero (not displayed while the cover shows), and not what UX-24 owns:
  // the open exercise's logger (.expand-wrap) and the extras under the list
  // (Add custom exercise, Adapt, the week's share button). Deviation from the
  // spec's "no rule under #workoutCard", recorded: those extras are UX-24's
  // criterion 1, so they keep their 2.0 look for one more version.
  const bad = [];
  const scope = [...ui.$('workoutCard').querySelectorAll('.then-title, .duration-row, .duration-row *, .session-actions, .session-actions *'),
    ...ui.$('exerciseList').querySelectorAll('*')];
  assert.ok(scope.length > 30, 'anchor: the head and the list are in scope (' + scope.length + ')');
  for(const el of scope){
    if(el.closest('.expand-wrap')) continue;
    const s = ui.cs(el);
    const all = ['background', 'background-color', 'background-image', 'border-color', 'border-top-color', 'box-shadow', 'backdrop-filter', '-webkit-backdrop-filter', 'background-clip', '-webkit-background-clip']
      .map(p => p + ':' + s.getPropertyValue(p)).join(';');
    if(/--glass-|--cta-gradient|gradient\(|background-clip:text|backdrop-filter:(?!none|;|$)[^;]+/.test(all)) bad.push((el.id || el.className) + ' → ' + all);
    const sh = s.getPropertyValue('box-shadow');
    if(sh && sh !== 'none' && /(\d+(\.\d+)?px\s+){2}[1-9]/.test(sh.replace(/var\([^)]*\)/g, ''))) bad.push((el.id || el.className) + ' blurred shadow ' + sh);
  }
  assert.deepStrictEqual(bad, [], 'no glass, gradient or blur under #workoutCard');
  // Gym mode keeps its own card rule (UX-17 decides it): ours don't reach it.
  const gym = page('day-red has-cover gym-mode');
  assert.ok(!/not\(\.gym-mode\)/.test(cascade(gym.$('workoutCard'), ['background', 'background-color']).sel), 'gym mode\'s card is its own rule');
});

test('criterion 2: while the cover shows, .workout-hero isn\'t displayed (the IDs stay in the DOM); with the cover hidden it is; in gym mode it is hidden as at v3.599', (assert)=>{
  // Through the real syncTodayChrome: it sets has-cover from the cover's hidden.
  const { window } = runJsdom(BODY, `
    window.matchMedia = () => ({ matches: false });`, [extractConst(src, 'TODAY_CHROME_MOVES'), extractFunction(src, 'syncTodayChrome')]);
  const cover = window.document.getElementById('upNext');
  cover.hidden = false; window.syncTodayChrome();
  assert.ok(window.document.body.classList.contains('has-cover'), 'the cover shows: has-cover');
  cover.hidden = true; window.syncTodayChrome();
  assert.ok(!window.document.body.classList.contains('has-cover'), 'the cover hidden: no has-cover');
  window.document.body.classList.add('gym-mode'); cover.hidden = false; window.syncTodayChrome();
  assert.ok(window.document.body.classList.contains('has-cover'), 'gym mode too (the CSS decides)');

  const shown = page('day-red has-cover');
  assert.strictEqual(shown.cs(shown.doc.querySelector('#workoutCard .workout-hero')).display, 'none', 'the cover names the day');
  for(const id of ['dayPlateIcon', 'dayHeroEyebrow', 'dayTitle']) assert.ok(shown.$(id), id + ' stays in the DOM');
  assert.strictEqual(shown.cs(shown.doc.querySelector('.then-title')).display, 'block', '"Then" heads the list');
  assert.strictEqual(shown.doc.querySelector('.then-title').textContent, 'Then');
  const none = page('day-red');
  assert.strictEqual(none.cs(none.doc.querySelector('#workoutCard .workout-hero')).display, 'flex', 'no cover: the hero names the day, as before');
  assert.strictEqual(none.cs(none.doc.querySelector('.then-title')).display, 'none');
  const gym = page('day-red has-cover gym-mode');
  assert.strictEqual(gym.cs(gym.doc.querySelector('#workoutCard .workout-hero')).display, 'none', 'gym mode: hidden, as at v3.599 (its own rule)');
  assert.strictEqual(gym.cs(gym.doc.querySelector('.then-title')).display, 'none', 'no "Then" in gym mode');
});

test('criterion 3: the head line holds the phase, the length and the calories as renderWorkout writes them, joined with " · " (no wording change)', (assert)=>{
  const ui = page('day-red has-cover');
  // The strings renderWorkout writes (no wording change: the same elements).
  const fn = extractFunction(src, 'renderWorkout');
  assert.match(fn, /document\.getElementById\('mesocyclePhaseTag'\)/);
  assert.match(fn, /getElementById\('dayDuration'\)/);
  ui.$('mesocyclePhaseTag').textContent = 'Week 4 of 5 · Accumulation';
  ui.$('dayDuration').textContent = '~94 min (week 4 · +2 set · +1 exercise)';
  ui.$('sessionCalTotal').textContent = '';
  const line = ui.doc.querySelector('#workoutCard .duration-row');
  for(const id of ['mesocyclePhaseTag', 'dayDuration', 'sessionCalTotal']) assert.strictEqual(ui.$(id).parentElement, line, id + ' is on the head line');
  assert.ok(line.textContent.includes('Week 4 of 5 · Accumulation') && line.textContent.includes('~94 min (week 4 · +2 set · +1 exercise)'));
  assert.strictEqual(ui.cs(ui.$('mesocyclePhaseTag')).display, 'inline');
  assert.strictEqual(ui.cs(ui.$('dayDuration')).display, 'inline');
  // The separator opens every shown part after the first shown one.
  const sepSel = 'body:not(.gym-mode) #workoutCard .duration-row > :not(:empty) ~ :not(:empty)';
  assert.match(pseudo(sepSel + '::before').getPropertyValue('content'), /^["'] · ["']$/, '" · " between parts');
  assert.ok(!ui.$('mesocyclePhaseTag').matches(sepSel), 'nothing before the first part');
  assert.ok(ui.$('dayDuration').matches(sepSel), 'the second part opens with " · "');
  ui.$('sessionCalTotal').textContent = '~620 kcal';
  assert.ok(ui.$('sessionCalTotal').matches(sepSel), 'the calories, when there are some, too');
  ui.$('sessionCalTotal').textContent = '';
  assert.strictEqual(ui.cs(ui.$('sessionCalTotal')).display, 'none', 'an empty part isn\'t shown');
  assert.match(ui.cs(ui.$('mesocyclePhaseTag')).getPropertyValue('border-top-style') + '|' + ui.cs(ui.$('mesocyclePhaseTag')).getPropertyValue('background-color'), /^none\|/, 'the phase is text, not a pill');
  assert.strictEqual(ui.cs(line).color, 'var(--text-2)');
});

test('criterion 5: chips in the cover\'s grammar: done = --text fill with a check, ready = 2.5 px --text border, pending dashed; no plate green or blue; no "=" mark', (assert)=>{
  const { window } = runJsdom(`<div id="exerciseList">${LIST}</div>`, `var weightUnit = 'lb'; var distanceUnit = 'km'; ${STUBS}`, CHIP_FNS);
  window.document.querySelectorAll('.exercise-block').forEach(b => window.renderSetChips(b));
  const chips = [...window.document.querySelectorAll('.set-chip')];
  const done = chips.filter(c => c.classList.contains('is-done')), ready = chips.filter(c => c.classList.contains('is-ready'));
  assert.strictEqual(done.length, 2, 'anchor: two logged sets');
  assert.ok(ready.length >= 1, 'anchor: a ready chip');
  for(const c of done) assert.ok(c.querySelector('.set-chip-check svg'), 'a done chip carries the check');
  for(const c of ready) assert.ok(!c.querySelector('.set-chip-check'), 'only done chips carry it');
  // The builder writes no "=" text in any chip; a "same" trend's mark isn't displayed.
  for(const c of chips) assert.ok(!c.textContent.includes('='), 'no "=" text: ' + c.textContent);
  const ui = page('day-red has-cover');
  ui.doc.getElementById('exerciseList').innerHTML = window.document.getElementById('exerciseList').innerHTML;
  const sameMark = ui.doc.createElement('span'); sameMark.className = 'set-chip-trend is-same';
  ui.doc.querySelector('#exerciseList .set-chip.is-ready').appendChild(sameMark);
  assert.strictEqual(ui.cs(sameMark).display, 'none', 'the ready border carries "next": no "=" mark');
  const d = ui.cs(ui.doc.querySelector('#exerciseList .set-chip.is-done'));
  assert.strictEqual(d.getPropertyValue('background'), 'var(--text)', 'jsdom keeps the shorthand\'s var() on background');
  assert.strictEqual(d.color, 'var(--ground)');
  assert.strictEqual(ui.cs(ui.doc.querySelector('#exerciseList .set-chip.is-done .set-chip-check')).display, 'inline-flex');
  const readyEl = ui.doc.querySelector('#exerciseList .set-chip.is-ready'), pendEl = ui.doc.querySelector('#exerciseList .set-chip.is-pending'), doneEl = ui.doc.querySelector('#exerciseList .set-chip.is-done');
  const rb = cascade(readyEl, BORDER).value;
  const [w, style, color] = rb.split(/\s+/);
  assert.ok(parseFloat(w) >= 2.5, 'ready border ≥ 2.5px: ' + rb);
  assert.strictEqual(style, 'solid');
  assert.strictEqual(color, 'var(--text)');
  assert.strictEqual(cascade(pendEl, BORDER).value, '1.5px dashed var(--rule-strong)');
  const r = ui.cs(readyEl), p = ui.cs(pendEl);
  for(const [name, s, el] of [['done', d, doneEl], ['ready', r, readyEl], ['pending', p, pendEl]]){
    const all = ['background-color', 'background', 'color', 'box-shadow'].map(k => s.getPropertyValue(k)).join(';') + ';' + cascade(el, BORDER).value;
    assert.ok(!/plate-green|plate-blue|spot-blue|spot-green/.test(all), `${name}: no plate green or blue (${all})`);
  }
  const nextChip = ui.doc.querySelector('#exerciseList .set-chip.is-ready'); nextChip.classList.add('is-next');
  assert.ok(!/spot-blue|plate-blue/.test(ui.cs(nextChip).getPropertyValue('background') + cascade(nextChip, BORDER).value), 'the session\'s next chip too');
  // Gym mode keeps its chips (UX-17): no check, its own fills.
  const gym = page('day-red has-cover gym-mode');
  gym.doc.getElementById('exerciseList').innerHTML = window.document.getElementById('exerciseList').innerHTML;
  assert.strictEqual(gym.cs(gym.doc.querySelector('.set-chip.is-done .set-chip-check')).display, 'none', 'no check in gym mode');
  assert.notStrictEqual(gym.cs(gym.doc.querySelector('.set-chip.is-done')).getPropertyValue('background'), 'var(--text)', 'gym mode\'s done chip is its own');
});

test('criterion 4 (CSS part): Gym mode is a plain 44pt text button, no plate-blue border, named "Gym mode"; session length is text with a chevron', (assert)=>{
  const ui = page('day-red has-cover');
  const btn = ui.$('gymEnterBtn');
  const s = ui.cs(btn);
  assert.strictEqual(btn.textContent.trim(), 'Gym mode', 'its accessible name');
  assert.ok(parseFloat(s.minHeight) >= 44, 'min-height ≥ 44: ' + s.minHeight);
  assert.ok(/^none/.test(s.borderTopStyle) || s.borderStyle === 'none', 'no border');
  assert.ok(!/91,\s*124,\s*255|plate-blue/.test(s.borderTopColor + s.borderColor), 'no plate-blue border');
  assert.ok(!/glass/.test(s.backgroundColor + s.background), 'no pill fill');
  assert.strictEqual(ui.cs(btn.querySelector('.gym-enter-icon')).color, 'var(--text-2)');
  const sel = ui.cs(ui.$('sessionLengthSelector'));
  assert.ok(/^none/.test(sel.borderTopStyle) || sel.borderStyle === 'none');
  assert.ok(parseFloat(sel.minHeight) >= 44);
});

test('criterion 6: the cover\'s exercise row carries the "now" marker, set by the real renderUpNext; exactly one row; a superset marks its member', (assert)=>{
  const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
    'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips',
    'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep',
    'renderUpNext', 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'readSetLogger', 'firstSetHint'].map(n => extractFunction(src, n));
  FNS.push(extractConst(src, 'ICONS'), extractFunction(src, 'icon'));
  const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="dayHeroEyebrow">Day 1</div><div id="dayTitle">Upper · Strength</div>
      <div id="mesocyclePhaseTag"></div><div id="exerciseList">${LIST}</div>`, `
    var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true;
    function renderCoverBar(){} // the plate stack (test-plate-stack.js)
    function refreshGymLogBtn(){} ${STUBS}`, FNS);
  const doc = window.document;
  const now = () => [...doc.querySelectorAll('#exerciseList .is-now')];
  window.renderAllSetChips(); window.renderUpNext();
  assert.strictEqual(now().length, 1, 'exactly one row');
  assert.ok(now()[0].querySelector('.ex-name').textContent.startsWith('Bench Press'), 'the row the cover reads');
  assert.strictEqual(doc.getElementById('upNextLift').textContent, 'Bench Press', 'anchor: the cover is on Bench Press');
  // Log Bench's last two sets: the cover moves to the superset's first member.
  for(const r of doc.querySelectorAll('.set-row[data-ex-idx="0"]')){ r.querySelector('.ex-weight').value = '185'; r.querySelector('.ex-reps').value = '5'; }
  window.renderAllSetChips(); window.renderUpNext();
  assert.strictEqual(now().length, 1, 'still exactly one');
  assert.ok(now()[0].classList.contains('superset-member') && now()[0].dataset.exIdx === '1', 'the superset member the cover reads, not the whole pair');
  // Everything logged: no next set, no marker.
  for(const r of doc.querySelectorAll('.set-row')){ r.querySelector('.ex-weight').value = '20'; r.querySelector('.ex-reps').value = '10'; }
  window.renderAllSetChips(); window.renderUpNext();
  assert.strictEqual(now().length, 0, 'session complete: no row is "now"');
  // The rule: 4 px in the day's ink along the left edge, outside gym mode.
  const ui = page('day-red has-cover');
  const b = ui.doc.querySelector('#exerciseList .exercise-block'); b.classList.add('is-now');
  const sel = 'body:not(.gym-mode) #exerciseList .is-now';
  const a = pseudo(sel + '::after');
  assert.strictEqual(a.getPropertyValue('width'), '4px');
  assert.strictEqual(a.getPropertyValue('background'), 'var(--spot)');
  assert.ok(b.matches(sel), 'the marked row takes the rule');
  const gym = page('day-red has-cover gym-mode');
  const g = gym.doc.querySelector('#exerciseList .exercise-block'); g.classList.add('is-now');
  assert.ok(!g.matches(sel), 'not in gym mode');
  assert.strictEqual(ui.cs(b).position, 'relative');
});

run();
