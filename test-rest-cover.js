'use strict';
// v3.597 (UX-08): rest takes over the Today cover. While the rest timer runs,
// the cover shows "Rest", the time left as the numeral, "of m:ss", +30 s and
// Skip (the timer's own controls), and the next set's steppers: weight by the
// set sheet's own step, reps by 1, and "Reps left" (3+, 2, 1, 0) written as
// RPE = 10 − RIR into the cover's fields, which Log reads. The cover follows
// the timer through a watcher on the timer's own text and class, so
// startRestTimer and every suite that extracts it are unchanged.
//
// Recorded deviation: the spec drains the whole field from the bright ink to
// the deep ink. With today's dark spot red (#FF453A) and green (#32D74B) no
// text colour holds 4.5:1 on both layers, so the text sits on the deep ink
// (white, 4.5:1 or more on every deep ink) and the bright ink is a band along
// the top that shrinks with the time left (scaleX, linear).
//
// Real invocation: the real cover and rest timer markup; the real
// startRestTimer, adjustRestTimer, restRemainingSeconds, formatTimer, the
// timer's Close handler, syncCoverRest, renderCoverSteppers, stepCoverField,
// setCoverRepsLeft, setSheetWeightStep, getEquipment, logUpNext and
// readSetLogger; the cover's real wiring and its watcher.
//
// Sabotage: make "Reps left" write the RIR itself as the RPE and criterion 3
// fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-rest-cover.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function block(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}
function iife(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n})();', i) + 6);
}
const COVER_FNS = ['syncCoverRest', 'renderCoverSteppers', 'stepCoverField', 'setCoverRepsLeft'];
const FNS = [...COVER_FNS, 'startRestTimer', 'adjustRestTimer', 'restRemainingSeconds', 'formatTimer', 'setSheetWeightStep', 'getEquipment',
  'isBarbellExercise', 'isDumbbellExercise', 'logUpNext', 'readSetLogger', 'findNextSetRow'].map(f => extractFunction(src, f));

function row(name, w){
  return `<div class="exercise-block"><div class="set-row" data-ex-idx="0" data-set-idx="1"><span class="set-row-owner">${name}</span>
    <input class="ex-input ex-weight" placeholder="lb" value=""><input class="ex-input ex-reps" placeholder="reps" value=""><input class="ex-input ex-rpe" placeholder="RPE" value=""></div></div>`;
}
function mount({name = 'Bench Press', weight = '160', reps = '5', reduce = false} = {}){
  const { window } = runJsdom(extractElementById(src, 'upNext').replace(' hidden>', '>') + extractElementById(src, 'restTimer') + `<div id="exerciseList">${row(name)}</div>`, `
    let restTimerSeconds = 90, restTimerTotal = 90, restTimerInterval = null, restTimerEndsAt = null;
    var weightUnit = 'lb', equipmentProfile = null, loadSuggestionMode = 'progression';
    var REST_TIER_TIPS = {};
    window.matchMedia = q => ({matches: ${reduce} && /reduce/.test(q)});
    function applyRestTimerCollapsedWidth(){} function applyRestTimerExpandHeight(){} function refreshRestNotifyControls(){}
    function updateRestTimerRing(){} function persistRestTimer(){} function scheduleRestNotification(){} function cancelRestNotification(){}
    function tickRestTimer(){}
    // The real startRestTimer arms a 1 s interval; nothing here waits on it, and a live one would keep the test process open.
    window.setInterval = () => 1; window.clearInterval = () => {};
    window.__commits = [];
    function commitSet(row, values){ window.__commits.push({row, values: {...values}}); }
    function renderUpNext(){}`,
    [extractConst(src, 'BARBELL_STANDARDS'), extractConst(src, 'DUMBBELL_DEFAULTS'), extractConst(src, 'BARBELL_EXERCISES'), ...FNS,
     block("document.getElementById('coverRest').addEventListener('click',"),
     iife('(function watchRestForCover(){'),
     block("document.getElementById('restTimerClose').addEventListener('click',"),
     `window.__state = () => ({restTimerEndsAt, restTimerTotal});`]);
  const doc = window.document;
  const $ = id => doc.getElementById(id);
  const card = $('upNext');
  card._row = doc.querySelector('.set-row');
  card._rirWords = 'Stop 2–3 reps short';
  $('upNextWeight').value = weight; $('upNextReps').value = reps; $('upNextRpe').value = '';
  const tick = () => new Promise(r => setTimeout(r, 0));
  return { window, doc, $, card, tick };
}

test('criterion 1: the real startRestTimer, unchanged, puts the cover into rest with the same seconds; nothing in the cover starts a timer itself', async (assert)=>{
  const ui = mount();
  assert.ok(!ui.card.classList.contains('is-resting'), 'anchor: not resting before');
  ui.window.startRestTimer(150, 'Hypertrophy range');
  await ui.tick();
  assert.ok(ui.card.classList.contains('is-resting'), 'the cover follows the timer');
  assert.strictEqual(ui.$('coverRest').hidden, false);
  assert.strictEqual(ui.$('coverRestTime').textContent, '2:30');
  assert.strictEqual(ui.$('coverRestOf').textContent, 'of 2:30');
  assert.strictEqual(ui.$('restTimerTime').textContent, '2:30', 'the timer itself shows the same');
  const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  for(const f of [...COVER_FNS, 'renderUpNext', 'logUpNext', 'renderCoverNumeral']) assert.ok(!/\bstartRestTimer\(/.test(code(extractFunction(src, f))), f + ' never starts a timer');
  assert.ok(!/\bstartRestTimer\(/.test(code(block("document.getElementById('coverRest').addEventListener('click',"))), 'nor does the cover\'s wiring');
});

test('criterion 2: weight + on Bench at 160 adds the real setSheetWeightStep (165), and on DB Curl at 30 the dumbbell increment; reps step by 1, floor 0', async (assert)=>{
  const bench = mount();
  bench.window.startRestTimer(120); await bench.tick();
  const benchStep = bench.window.setSheetWeightStep(bench.card._row);
  bench.$('coverSteppers').querySelector('.cover-step[data-field="weight"] [data-step="1"]').click();
  assert.strictEqual(bench.$('upNextWeight').value, String(160 + benchStep));
  assert.strictEqual(bench.$('upNextWeight').value, '165', 'the default lb plates: twice the 2.5');
  assert.strictEqual(bench.$('coverStepWeight').textContent, '165 lb');
  const curl = mount({name: 'DB Curl', weight: '30'});
  curl.window.startRestTimer(90); await curl.tick();
  const curlStep = curl.window.setSheetWeightStep(curl.card._row);
  curl.$('coverSteppers').querySelector('.cover-step[data-field="weight"] [data-step="1"]').click();
  assert.strictEqual(curl.$('upNextWeight').value, String(30 + curlStep));
  const eq = curl.window.getEquipment();
  assert.strictEqual(curlStep, eq.dbIncrement, 'the dumbbell step is the dumbbell increment');
  assert.strictEqual(benchStep, 2 * eq.plates[eq.plates.length - 1], 'the barbell step is twice the smallest plate');
  const reps = bench.$('coverSteppers').querySelector('.cover-step[data-field="reps"]');
  reps.querySelector('[data-step="1"]').click();
  assert.strictEqual(bench.$('upNextReps').value, '6');
  for(let i = 0; i < 9; i++) reps.querySelector('[data-step="-1"]').click();
  assert.strictEqual(bench.$('upNextReps').value, '0', 'never below 0');
});

test('criterion 3: "Reps left: 2" logs RPE 8 (10 − RIR), shown with RPE mode off; 3+ is RPE 7, 0 is RPE 10', async (assert)=>{
  const ui = mount();
  ui.window.startRestTimer(120); await ui.tick();
  assert.strictEqual(ui.window.loadSuggestionMode, 'progression', 'anchor: RPE mode off');
  const rir = ui.$('coverSteppers').querySelector('.cover-rir');
  assert.ok(!rir.hidden && !ui.$('coverSteppers').hidden, 'the control is shown');
  rir.querySelector('[data-rir="2"]').click();
  assert.strictEqual(ui.$('upNextRpe').value, '8');
  assert.strictEqual(rir.querySelector('[data-rir="2"]').getAttribute('aria-checked'), 'true');
  assert.strictEqual(ui.$('coverRirWords').textContent, 'Target: Stop 2–3 reps short', 'captioned with BL-10\'s words');
  ui.window.logUpNext();
  assert.strictEqual(ui.window.__commits.length, 1);
  assert.strictEqual(ui.window.__commits[0].values.rpe, '8', 'Log writes RPE 8');
  assert.strictEqual(ui.window.__commits[0].values.weight, '160');
  rir.querySelector('[data-rir="3"]').click();
  assert.strictEqual(ui.$('upNextRpe').value, '7');
  rir.querySelector('[data-rir="0"]').click();
  assert.strictEqual(ui.$('upNextRpe').value, '10');
});

test('criterion 4: under Reduce Motion the drain has no transition or animation; otherwise it moves with transform only', async (assert)=>{
  const calm = mount({reduce: true});
  calm.window.startRestTimer(100); await calm.tick();
  const d = calm.$('coverDrain');
  assert.strictEqual(d.style.transition, 'none');
  const cs = calm.window.getComputedStyle(d);
  assert.ok(!cs.animationName || cs.animationName === 'none', 'no animation');
  assert.match(d.style.transform, /^scaleX\(/, 'the split still shows where rest is');
  const moving = mount();
  moving.window.startRestTimer(100); await moving.tick();
  assert.strictEqual(moving.$('coverDrain').style.transition, '', 'the stylesheet\'s transform transition applies');
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  assert.match(CSS, /\.cover-drain\{[^}]*transition:transform 1s linear;/, 'composite-only: transform');
  assert.match(CSS, /@media \(prefers-reduced-motion: reduce\)\{ \.cover-drain\{transition:none;\} \}/);
});

test('+30 s and Skip are the timer\'s own controls: +30 adds to the time and the total; Skip ends rest and the cover returns', async (assert)=>{
  const ui = mount();
  ui.window.startRestTimer(60); await ui.tick();
  ui.$('coverRestAdd').click(); await ui.tick();
  assert.strictEqual(ui.window.__state().restTimerTotal, 90);
  assert.strictEqual(ui.$('coverRestOf').textContent, 'of 1:30');
  assert.strictEqual(ui.$('coverRestTime').textContent, '1:30');
  ui.$('coverRestSkip').click(); await ui.tick();
  assert.strictEqual(ui.window.__state().restTimerEndsAt, null, 'the timer\'s Close ran');
  assert.ok(!ui.card.classList.contains('is-resting'));
  assert.strictEqual(ui.$('coverRest').hidden, true);
});

test('the drain: a full band at the start, about half way at half time', async (assert)=>{
  const ui = mount();
  ui.window.startRestTimer(120); await ui.tick();
  assert.strictEqual(ui.$('coverDrain').style.transform, 'scaleX(1.0000)');
  ui.window.eval('restTimerEndsAt = Date.now() + 60000;'); // half of the 120 s left
  ui.window.syncCoverRest();
  assert.match(ui.$('coverDrain').style.transform, /^scaleX\(0\.5/);
});

// ---- Contrast: the rest field and its Log button, every ink, both themes ----
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const rules = (() => { const out = []; const { window } = new JSDOM(`<style>${CSS}</style>`);
  const walk = (l, media) => { for(const r of l){ if(r.selectorText) out.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } };
  walk(window.document.styleSheets[0].cssRules, ''); return out; })();
// 2026-11-17 (v3.599, UX-09b): a selector may sit in a group (the --spot-ink rules now also serve .finish-flood).
const get = (sel, prop, light) => { let v = null; for(const {r, media} of rules){ if(r.selectorText.split(',').map(t => t.trim()).includes(sel) && (!media || (light && /prefers-color-scheme:\s*light/.test(media) && !/contrast/.test(media)))){ const x = r.style.getPropertyValue(prop).trim(); if(x) v = x; } } return v; };
const resolve = (v, light, d = 0) => v.replace(/var\((--[a-z0-9-]+)\)/g, (m, n) => { const x = (light && get('body:not(.gym-mode)', n, true)) || get(':root', n, false); if(!x || d > 10) throw new Error('unresolved ' + n); return resolve(x, light, d + 1); });
const lum = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('contrast: white on every deep ink ≥ 4.5:1, and the rest Log button (the spot, its contrast-checked ink) ≥ 4.5:1, both themes', (assert)=>{
  assert.match(get('.cover', '--on-rest', false), /^#FFFFFF$/i);
  assert.match(get('.cover', '--rest-field', false), /^var\(--spot-deep\b/);
  const INK = {red: get('body.day-red .cover', '--spot-ink', false), green: get('body.day-green .cover', '--spot-ink', false), yellow: get('body.day-yellow .cover', '--spot-ink', false)};
  assert.deepStrictEqual(INK, {red: 'var(--block-on-red)', green: 'var(--block-on-green)', yellow: 'var(--block-on-yellow)'});
  for(const light of [false, true]) for(const ink of ['red', 'blue', 'yellow', 'green']){
    const deep = resolve(get('.day-' + ink, '--spot-deep', false), light);
    assert.ok(ratio('#FFFFFF', deep) >= 4.5, `${light ? 'light' : 'dark'} ${ink}: white on ${deep} ${ratio('#FFFFFF', deep).toFixed(2)}:1`);
    const spot = resolve(get('.day-' + ink, '--spot', false), light);
    const on = resolve(INK[ink] || get('.cover', '--spot-ink', false).replace('--on-spot', '--on-' + ink), light);
    assert.ok(ratio(on, spot) >= 4.5, `${light ? 'light' : 'dark'} ${ink}: Log ${on} on ${spot} ${ratio(on, spot).toFixed(2)}:1`);
  }
});

test('a timer restored on reopening takes the cover over as soon as the cover shows, not a tick later', async (assert)=>{
  const ui = mount();
  ui.card.hidden = true; await ui.tick();
  ui.window.eval('restTimerEndsAt = Date.now() + 150000; restTimerTotal = 240;'); // restoreRestTimer, before Today renders
  ui.window.syncCoverRest(); // what the timer's own class change runs
  assert.ok(!ui.card.classList.contains('is-resting'), 'anchor: a hidden cover is not put into rest');
  ui.card.hidden = false; // renderUpNext shows the cover
  await ui.tick();
  assert.ok(ui.card.classList.contains('is-resting'), 'the cover takes over at once');
  assert.strictEqual(ui.$('coverRestTime').textContent, '2:30');
  assert.strictEqual(ui.$('coverRestOf').textContent, 'of 4:00');
});

run();
