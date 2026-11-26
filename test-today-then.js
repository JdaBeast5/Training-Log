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
//
// v3.605 (UX-24) extends it: the open exercise's logger and actions, the
// extras under the list, the notes, Getting Started and the sticky header.
// Sabotage: restore the logger panel's gradient and UX-24 criterion 1 fails.
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
  'recommendNextSet', 'setSheetWeightStep', 'loadStepFor' /* v3.651 (BL-79) */].map(n => extractFunction(src, n));
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
  assert.match(cb.sel, /^:root body #workoutCard$/, 'from the flat card rule');
  assert.strictEqual(card.borderRadius, '0px');
  assert.strictEqual(card.boxShadow, 'none');
  assert.strictEqual(pseudo(':root body #workoutCard::before').getPropertyValue('display'), 'none');
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
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
});

test('criterion 2: while the cover shows, .workout-hero isn\'t displayed (the IDs stay in the DOM); with the cover hidden it is', (assert)=>{
  // Through the real syncTodayChrome: it sets has-cover from the cover's hidden.
  const { window } = runJsdom(BODY, `
    window.matchMedia = () => ({ matches: false });`, [extractConst(src, 'TODAY_CHROME_MOVES'), extractFunction(src, 'syncTodayChrome')]);
  const cover = window.document.getElementById('upNext');
  cover.hidden = false; window.syncTodayChrome();
  assert.ok(window.document.body.classList.contains('has-cover'), 'the cover shows: has-cover');
  cover.hidden = true; window.syncTodayChrome();
  assert.ok(!window.document.body.classList.contains('has-cover'), 'the cover hidden: no has-cover');

  const shown = page('day-red has-cover');
  assert.strictEqual(shown.cs(shown.doc.querySelector('#workoutCard .workout-hero')).display, 'none', 'the cover names the day');
  for(const id of ['dayPlateIcon', 'dayHeroEyebrow', 'dayTitle']) assert.ok(shown.$(id), id + ' stays in the DOM');
  assert.strictEqual(shown.cs(shown.doc.querySelector('.then-title')).display, 'block', '"Then" heads the list');
  assert.strictEqual(shown.doc.querySelector('.then-title').textContent, 'Then');
  const none = page('day-red');
  assert.strictEqual(none.cs(none.doc.querySelector('#workoutCard .workout-hero')).display, 'flex', 'no cover: the hero names the day, as before');
  assert.strictEqual(none.cs(none.doc.querySelector('.then-title')).display, 'none');
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
});

test('criterion 3: the head line holds the phase, the length and the calories as renderWorkout writes them, joined with " · " (no wording change)', (assert)=>{
  // 2026-11-23 (v3.643, UX-36): with the cover showing, the phase is hidden (the
  // cover's program line says it; test-then-now-row.js criterion 5), so the
  // full line is checked without the cover, where it is unchanged.
  const ui = page('day-red');
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
  const sepSel = ':root body #workoutCard .duration-row > :not(:empty) ~ :not(:empty)';
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
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
});

// 2026-11-24 (v3.653, UX-17b): the Gym mode half of this criterion retired with
// the button; the session length's half stays.
test('criterion 4 (CSS part): session length is text with a chevron, a 44pt target; there is no Gym mode button', (assert)=>{
  const ui = page('day-red has-cover');
  assert.strictEqual(ui.$('gymEnterBtn'), null, 'v3.653: no Gym mode button');
  const sel = ui.cs(ui.$('sessionLengthSelector'));
  assert.ok(/^none/.test(sel.borderTopStyle) || sel.borderStyle === 'none');
  assert.ok(parseFloat(sel.minHeight) >= 44);
});

test('criterion 6: the cover\'s exercise row carries the "now" marker, set by the real renderUpNext; exactly one row; a superset marks its member', (assert)=>{
  const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
    'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips',
    'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor' /* v3.651 (BL-79) */,
    'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip' /* v3.656 (UX-62) */, 'setCoverThen', 'supersetThenLine' /* v3.657 (UX-63) */, 'syncStickyDayTitle', /* 2026-11-17 (v3.605, UX-24): renderUpNext writes the sticky header's set line */ 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'firstSetHint'].map(n => extractFunction(src, n));
  FNS.push(extractConst(src, 'ICONS'), extractFunction(src, 'icon'));
  const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="dayHeroEyebrow">Day 1</div><div id="dayTitle">Upper · Strength</div>
      <div id="mesocyclePhaseTag"></div><div id="exerciseList">${LIST}</div>`, `
    var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true;
    function renderCoverBar(){} // the plate stack (test-plate-stack.js)
    /* 2026-11-22 (v3.622, UX-14): renderUpNext refreshes the open-screen pane's plate stack (test-open-screen-2-0.js) */ function renderExerciseDetailBar(){}
    ${STUBS}`, FNS);
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
  const sel = ':root body #exerciseList .is-now';
  const a = pseudo(sel + '::after');
  assert.strictEqual(a.getPropertyValue('width'), '4px');
  assert.strictEqual(a.getPropertyValue('background'), 'var(--spot)');
  assert.ok(b.matches(sel), 'the marked row takes the rule');
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
  assert.strictEqual(ui.cs(b).position, 'relative');
});

// ── v3.605 (UX-24): the open exercise and the session's extras ──────────────
// The open block, as renderWorkout builds it: the real exLoggerHtml, and the
// real History/Edit and Same as Last Time strings from renderWorkout (taken
// from its source and evaluated with one exercise), then "+ Add set".
const STATEMENT = start => { const i = src.indexOf(start); if(i === -1) throw new Error('not found: ' + start); return src.slice(i, src.indexOf(';\n', i) + 1); };
const OPEN_BLOCK = (()=>{
  const { window } = runJsdom('', `var i = 0, ex = {name: 'Bench Press'}, prior = true, priorIsCrossProgram = false, sameAsLastHtml = '';
    function programLabelFor(){ return ''; }`, [extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractFunction(src, 'exLoggerHtml'),
    STATEMENT('const historyBtnHtml ='), STATEMENT('sameAsLastHtml = (prior ?'), 'window.__html = [exLoggerHtml(), historyBtnHtml, sameAsLastHtml];']);
  const [logger, , actions] = window.__html;
  return `<div class="expand-wrap"><div>${logger.replace(' hidden>', '>')}<div class="sets-block"><div class="set-actions" data-ex-idx="0">${actions}</div>
    <button class="add-set-btn" type="button">+ Add set</button></div></div></div>`;
})();
function openPage(bodyClass){
  const ui = page(bodyClass);
  const block = ui.doc.querySelector('#exerciseList .exercise-block');
  block.querySelector('.expand-wrap').outerHTML = OPEN_BLOCK;
  block.classList.add('open');
  ui.$('dayInsight').textContent = 'Balance insight: more pulling than pushing this week.';
  ui.$('todayStandoutBanner').style.display = ''; ui.$('todayStandoutBanner').textContent = 'Best week yet on bench.';
  ui.$('onboardingCard').style.display = '';
  ui.$('onboardingRows').innerHTML = '<div class="onboarding-row done"><span class="onboarding-check"></span><span>Log a set</span></div><div class="onboarding-row"><span class="onboarding-check"></span><span>Set a goal</span></div>';
  ui.$('archiveWeekWrap').style.display = ''; ui.$('weekShareWrap').style.display = '';
  return ui;
}
const UX24_TARGETS = ui => ({
  block: ui.doc.querySelector('#exerciseList .exercise-block.open'),
  logger: ui.doc.querySelector('#exerciseList .ex-logger'), logBtn: ui.doc.querySelector('#exerciseList .ex-logger-go'),
  field: ui.doc.querySelector('#exerciseList .ex-logger .up-next-field'),
  same: ui.doc.querySelector('#exerciseList .same-as-last-btn'), history: ui.doc.querySelector('#exerciseList .ex-history-btn'), edit: ui.doc.querySelector('#exerciseList .ex-edit-btn'),
  addSet: ui.doc.querySelector('#exerciseList .add-set-btn'), addCustom: ui.$('addCustomExerciseBtn'), adapt: ui.$('adaptWorkoutBtn'),
  standout: ui.$('todayStandoutBanner'), insight: ui.$('dayInsight'), onboarding: ui.$('onboardingCard'), onboardingCheck: ui.doc.querySelector('#onboardingCard .onboarding-row:not(.done) .onboarding-check'),
  share: ui.$('weekShareBtn'),
});
const BIG_RADIUS = /var\(--(radius-pill|radius-card|radius-lg|r-sheet)\)|999px/;

test('UX-24 criterion 1: the open logger, its actions, the extras, the notes and Getting Started: no backdrop-filter, gradient, blurred shadow, plate blue or radius ≥ 20 px', (assert)=>{
  const ui = openPage('day-red has-cover today-cover');
  const bad = [];
  for(const [name, el] of Object.entries(UX24_TARGETS(ui))){
    assert.ok(el, 'anchor: ' + name + ' is in the real markup');
    const c = ui.cs(el);
    const bg = (cascade(el, ['background', 'background-color', 'background-image']) || {value: ''}).value;
    const sh = (cascade(el, ['box-shadow']) || {value: 'none'}).value;
    const br = (cascade(el, BORDER.concat(['border-left', 'border-left-color'])) || {value: ''}).value;
    const rad = (cascade(el, ['border-radius']) || {value: '0'}).value;
    if(c.getPropertyValue('backdrop-filter') && c.getPropertyValue('backdrop-filter') !== 'none') bad.push(name + ' backdrop-filter');
    if(/gradient\(|--glass-|--cta-gradient/.test(bg)) bad.push(name + ' background ' + bg);
    if(sh !== 'none' && /(\d+(\.\d+)?px\s+){2}[1-9]/.test(sh.replace(/var\([^)]*\)/g, ''))) bad.push(name + ' blurred shadow ' + sh);
    if(/var\(--(glass-shadow|cta-glow|rim)\)/.test(sh)) bad.push(name + ' token shadow ' + sh);
    if(/plate-blue|spot-blue/.test(bg + br + c.color + sh)) bad.push(name + ' plate blue');
    // A percentage is of the element's own box: the 20 px check circle's 50% is a 10 px radius.
    const radPx = /%$/.test(rad) ? parseFloat(rad) / 100 * parseFloat(c.width || '0') : parseFloat(rad);
    if(BIG_RADIUS.test(rad) || radPx >= 20) bad.push(name + ' radius ' + rad);
  }
  assert.deepStrictEqual(bad, []);
  // The specifics the spec names.
  const t = UX24_TARGETS(ui);
  assert.strictEqual(cascade(t.logger, ['background', 'background-color']).value, 'var(--surface-1)');
  assert.strictEqual(cascade(t.logger, BORDER).value, '1px solid var(--rule)');
  assert.strictEqual(cascade(t.logBtn, ['background', 'background-color']).value, 'var(--text)', 'Log is the cover\'s action: ink fill');
  assert.strictEqual(ui.cs(t.logBtn).color, 'var(--ground)');
  assert.strictEqual(ui.cs(t.same).color, 'var(--text)', 'Same as Last Time: a text button in ink');
  assert.strictEqual(cascade(t.addSet, BORDER).value, '1.5px dashed var(--rule-strong)');
  for(const n of ['addCustom', 'adapt']){
    assert.strictEqual(cascade(t[n], ['border-top', 'border-top-color']).value, '1px solid var(--rule)', n + ': a top rule');
    assert.ok(t[n].querySelector('svg.extra-icon'), n + ': a leading icon');
    assert.strictEqual(ui.cs(t[n].querySelector('svg.extra-icon')).display, 'block');
  }
  for(const n of ['standout', 'insight']){
    assert.strictEqual(cascade(t[n], ['border-left']).value, '2px solid var(--rule-strong)', n + ': a 2 px rule');
    assert.strictEqual(ui.cs(t[n]).color, 'var(--text)');
  }
  assert.ok(['transparent', 'rgba(0, 0, 0, 0)'].includes(ui.cs(t.onboarding).backgroundColor), 'Getting Started: no card');
  assert.strictEqual(cascade(t.onboardingCheck, ['border-color', 'border-top-color']).value, 'var(--rule-strong)', 'an open step: a circle in --rule-strong');
  assert.strictEqual(cascade(ui.doc.querySelector('#onboardingCard .onboarding-row.done .onboarding-check'), ['background', 'background-color']).value, 'var(--text)', 'a done step: ink, not plate green');
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
});

test('UX-24 criterion 2: every one of those controls is at least 44 px tall and has an accessible name (the real markup)', (assert)=>{
  const ui = openPage('day-red has-cover');
  const t = UX24_TARGETS(ui);
  const controls = {logBtn: t.logBtn, same: t.same, history: t.history, edit: t.edit, addSet: t.addSet, addCustom: t.addCustom, adapt: t.adapt,
    dismiss: ui.$('onboardingDismiss'), share: t.share};
  for(const [name, el] of Object.entries(controls)){
    const s = ui.cs(el);
    const h = Math.max(parseFloat(s.minHeight) || 0, parseFloat(s.height) || 0);
    assert.ok(h >= 44, `${name}: ${h}px tall`);
    const label = (el.getAttribute('aria-label') || el.textContent).trim();
    assert.ok(label.length > 2, `${name}: named "${label}"`);
  }
  assert.strictEqual(t.addCustom.textContent.trim(), 'Add custom exercise', 'the icon carries the plus');
  assert.strictEqual(t.adapt.textContent, 'Adapt for limited equipment or time');
  assert.match(t.history.getAttribute('aria-label'), /^See all history for Bench Press$/);
});

test('UX-24 criterion 3: the sticky header prints "Set 3 of 6 · Bench Press" from the cover (the real renderUpNext), the day name with no next set; a flat rule, no blur', (assert)=>{
  const FNS = ['escapeHtml', 'findNextSetRow', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel',
    'setChipOwnerTag', 'renderSetChips', 'renderAllSetChips', 'commitSet', 'renderExerciseLogger', 'renderWarmupChips',
    'trimUnitNum', 'parseTopRep', 'parseBottomRep', 'recommendNextSet', 'setSheetWeightStep', 'loadStepFor' /* v3.651 (BL-79) */, 'syncStickyDayTitle',
    'renderUpNext', 'renderCoverWarmup', 'pendingWarmupChip' /* v3.656 (UX-62) */, 'setCoverThen', 'supersetThenLine' /* v3.657 (UX-63) */, 'renderCoverNumeral', 'renderCoverChips', 'renderCoverCaution', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue', 'isBodyweightLoadable' /* v3.670 (UX-71) */, 'readSetLogger', 'firstSetHint'].map(n => extractFunction(src, n));
  FNS.push(extractConst(src, 'ICONS'), extractFunction(src, 'icon'));
  const six = [0, 1, 2, 3, 4, 5].map(k => k < 2 ? ROW(0, k, '185', '5') : ROW(0, k)).join('');
  const list = `<div class="exercise-block">${HEAD(0, 'Bench Press').replace('4×4-6', '6×4-6')}<div class="set-chips" role="group"></div><div class="expand-wrap"><div><div class="sets-block">${six}</div></div></div></div>`;
  const { window } = runJsdom(extractElementById(src, 'upNext') + extractElementById(src, 'stickyDayHeader') + `<div id="dayHeroEyebrow">Day 1</div><div id="dayTitle">Upper · Strength</div>
      <div id="mesocyclePhaseTag"></div><div id="exerciseList">${list}</div>`, `
    var distanceUnit = 'km', weightUnit = 'lb', activeProgram = 'strength', exerciseDetailPinned = true;
    function renderCoverBar(){} /* 2026-11-22 (v3.622, UX-14): renderUpNext refreshes the open-screen pane's plate stack (test-open-screen-2-0.js) */ function renderExerciseDetailBar(){} ${STUBS}`, FNS);
  const doc = window.document, title = doc.getElementById('stickyDayTitle');
  title.dataset.day = 'Day 1 — Upper · Strength'; // as renderWorkout writes it
  window.renderAllSetChips(); window.renderUpNext();
  assert.strictEqual(doc.getElementById('upNextLabel').textContent, 'Set 3 of 6', 'anchor: the cover');
  assert.strictEqual(title.textContent, 'Set 3 of 6 · Bench Press');
  for(const r of doc.querySelectorAll('.set-row')){ r.querySelector('.ex-weight').value = '185'; r.querySelector('.ex-reps').value = '5'; }
  window.renderAllSetChips(); window.renderUpNext();
  assert.strictEqual(title.textContent, 'Day 1 — Upper · Strength', 'no next set: the day name');
  // renderWorkout hands the day name over through the same function.
  const rw = extractFunction(src, 'renderWorkout');
  assert.match(rw, /getElementById\('stickyDayTitle'\)\.dataset\.day = `\$\{day\.label\} — \$\{day\.sub\}`;\s*syncStickyDayTitle\(\);/);
  const ui = page('day-red has-cover');
  const h = ui.$('stickyDayHeader');
  const sh = cascade(h, ['box-shadow']).value;
  assert.strictEqual(sh, 'none', 'no raised shadow');
  assert.strictEqual(cascade(h, ['background', 'background-color']).value, 'var(--ground)');
  assert.strictEqual(cascade(h, ['border-bottom']).value, '1px solid var(--rule)');
  const dot = ui.$('stickyDayPlateIcon'); dot.className = 'day-plate-inline plate-red';
  assert.strictEqual(ui.cs(dot).width, '10px');
  assert.strictEqual(ui.cs(dot).borderRadius, '0px', 'a square');
  assert.strictEqual(cascade(dot, ['background', 'background-color']).value, 'var(--spot)');
});

test('UX-24: the sticky header follows the cover while it shows (#dayTitle isn\'t displayed then), and #dayTitle otherwise (the real observer, IntersectionObserver stubbed)', (assert)=>{
  const { window } = runJsdom(`<div id="todayView"></div><section id="upNext"></section><div id="dayTitle"></div><div id="stickyDayHeader"></div>`, `
    var dayHeaderObserver = null;
    window.__io = null;
    window.IntersectionObserver = class { constructor(cb){ this.cb = cb; this.targets = []; window.__io = this; } observe(t){ this.targets.push(t); } disconnect(){} };`,
    [extractFunction(src, 'stickyDayAnchor'), extractFunction(src, 'setupStickyDayHeaderObserver'), 'setupStickyDayHeaderObserver();']);
  const doc = window.document, io = window.__io, sticky = doc.getElementById('stickyDayHeader');
  assert.strictEqual(JSON.stringify(io.targets.map(t => t.id)), '["upNext","dayTitle"]', 'both are watched');
  const fire = (id, isIntersecting, top) => io.cb([{target: doc.getElementById(id), isIntersecting, boundingClientRect: {top}}]);
  fire('dayTitle', false, 0); // display:none beside the cover: never "scrolled past"
  fire('upNext', false, -400);
  assert.ok(sticky.classList.contains('visible'), 'the cover scrolled past: shown');
  fire('upNext', true, 10);
  assert.ok(!sticky.classList.contains('visible'), 'the cover back in view: hidden');
  doc.getElementById('upNext').hidden = true;
  fire('dayTitle', false, -80);
  assert.ok(sticky.classList.contains('visible'), 'no cover: the day title decides, as before');
});

test('UX-34: "Technique & focus" outside gym mode: the summary, the form-video link in the ink; the chevron and pictogram in --text-2; no plate blue; a 44 pt row (the real builder\'s markup)', (assert)=>{
  const { window } = runJsdom('', `${STUBS}
    exerciseInfo = {'Bench Press': {category: 'chest', cues: ['Shoulder blades back.', 'Feet planted.']}};
    function getExerciseIcon(){ return '<svg viewBox="0 0 24 24"></svg>'; }`, [extractFunction(src, 'escapeHtml'),
    extractFunction(src, 'buildDetailsHtml'), "window.__d = buildDetailsHtml({name: 'Bench Press'});"]);
  const details = window.__d;
  assert.match(details, /<summary>Technique &(amp;)? focus<\/summary>/, 'anchor: the real builder\'s markup');
  const ui = page('day-red has-cover');
  const block = ui.doc.querySelector('#exerciseList .exercise-block');
  block.insertAdjacentHTML('beforeend', details);
  const sum = block.querySelector('.ex-details summary');
  assert.strictEqual(ui.cs(sum).color, 'var(--text)');
  assert.ok(parseFloat(ui.cs(sum).minHeight) >= 44, '44 pt');
  assert.strictEqual(pseudo(':root body #exerciseList .ex-details summary::before').getPropertyValue('border-color'), 'var(--text-2)', 'the chevron');
  const link = block.querySelector('.ex-video-link');
  if(link) assert.strictEqual(ui.cs(link).color, 'var(--text)', 'the form-video link');
  const ico = block.querySelector('.ex-icon');
  if(ico) assert.strictEqual(ui.cs(ico).color, 'var(--text-2)');
  for(const el of [sum, link, ico].filter(Boolean)) assert.ok(!/plate-blue|#7A93FF/i.test(ui.cs(el).color), 'no blue');
  // 2026-11-24 (v3.654, UX-17c): the gym-mode half retired with Gym mode's CSS.
});

run();
