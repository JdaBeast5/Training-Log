'use strict';
// v3.596 (UX-07): the plate stack. On a barbell lift the Today cover draws the
// loaded bar under the Log button: each side's plates, heaviest against the
// inner collar, coloured by the plate code, with a caption ("45 · 10 · 2.5
// each side") that is what VoiceOver reads (the drawing is aria-hidden).
//
// Real invocation: the real platesPerSide, plateCaption, barStackSvg,
// PLATE_INKS, renderCoverBar, getEquipment, BARBELL_STANDARDS,
// DUMBBELL_DEFAULTS, BARBELL_EXERCISES and isBarbellExercise; the SVG is the
// real builder's output parsed by jsdom; the CSS checks read the real
// stylesheet's CSSOM.
//
// Spec correction, recorded: criterion 1 says platesPerSide(142) leaves 1.5;
// the arithmetic is (142 − 45) / 2 = 48.5 per side, 45 + 2.5 = 47.5 loaded,
// 1 lb left per side. The test asserts 1.
//
// Sabotage: drop the bar subtraction and criterion 1 fails; load the plates
// lightest first and criterion 5 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-plate-stack.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const DEFS = [extractConst(src, 'BARBELL_STANDARDS'), extractConst(src, 'DUMBBELL_DEFAULTS'), extractConst(src, 'BARBELL_EXERCISES'), extractConst(src, 'PLATE_INKS'),
  ...['getEquipment', 'isBarbellExercise', 'platesPerSide', 'plateCaption', 'barStackSvg', 'renderCoverBar', 'escapeHtml'].map(f => extractFunction(src, f))];
function mount(unit = 'lb', profile = null){
  const { window } = runJsdom(extractElementById(src, 'upNextBar').replace(' hidden>', ' hidden>'), `
    var weightUnit = ${JSON.stringify(unit)}; var equipmentProfile = ${JSON.stringify(profile)};`,
    [...DEFS, 'window.__eq = () => getEquipment(); window.__pps = (w) => platesPerSide(w, getEquipment());']);
  const box = window.document.getElementById('upNextBar');
  const show = (exName, weight) => { window.renderCoverBar({_exName: exName}, String(weight)); return box; };
  return { window, box, show, pps: w => { const r = window.__pps(w); return {plates: [...r.plates], remainder: r.remainder}; } };
}

test('criterion 1: platesPerSide on the default lb plates: 160 → 45, 10, 2.5; 45 → none; 142 → 45, 2.5 with 1 left per side', (assert)=>{
  const ui = mount();
  assert.deepStrictEqual(ui.pps(160), {plates: [45, 10, 2.5], remainder: 0});
  assert.deepStrictEqual(ui.pps(45), {plates: [], remainder: 0});
  assert.deepStrictEqual(ui.pps(142), {plates: [45, 2.5], remainder: 1});
  assert.deepStrictEqual(ui.pps(405), {plates: [45, 45, 45, 45], remainder: 0}, 'a plate repeats when it fits again');
  assert.deepStrictEqual(ui.pps(255), {plates: [45, 45, 10, 5], remainder: 0});
});

test('criterion 2: a custom equipment profile without 2.5 lb plates: 160 → 45, 10 with 2.5 left per side; a custom bar is subtracted', (assert)=>{
  const ui = mount('lb', {lb: {bar: 45, plates: [45, 25, 10, 5]}});
  assert.deepStrictEqual(ui.pps(160), {plates: [45, 10], remainder: 2.5});
  const light = mount('lb', {lb: {bar: 35, plates: [45, 25, 10, 5, 2.5]}});
  assert.deepStrictEqual(light.pps(160), {plates: [45, 10, 5, 2.5], remainder: 0}, '(160 − 35) / 2 = 62.5 a side');
});

test('criterion 3: no plate stack for a dumbbell, cable or bodyweight lift; one for a barbell lift; none below the bar', (assert)=>{
  const ui = mount();
  for(const name of ['Lat Pulldown', 'DB Curl', 'Pull-up', 'Incline DB Press']){
    assert.strictEqual(ui.show(name, 60).hidden, true, name);
    assert.strictEqual(ui.box.innerHTML, '', name + ': nothing drawn');
  }
  assert.strictEqual(ui.show('Bench Press', 160).hidden, false, 'anchor: Bench Press draws it');
  assert.ok(ui.box.querySelector('svg .bar-plate'));
  assert.strictEqual(ui.show('Bench Press', 35).hidden, true, 'below the bar: not a barbell load');
  assert.strictEqual(ui.show('Bench Press', '').hidden, true, 'no weight yet');
});

test('criterion 4: the caption is the plates joined with " · " and " each side"; "About" when it can\'t be loaded exactly; the drawing is hidden from VoiceOver', (assert)=>{
  const ui = mount();
  const cap = () => ui.box.querySelector('.cover-bar-cap span').textContent;
  ui.show('Bench Press', 160);
  assert.strictEqual(cap(), '45 · 10 · 2.5 each side');
  assert.strictEqual(ui.box.querySelectorAll('.cover-bar-cap span')[1].textContent, '45 lb bar');
  assert.strictEqual(ui.box.querySelector('svg').getAttribute('aria-hidden'), 'true');
  ui.show('Bench Press', 142);
  assert.strictEqual(cap(), 'About 45 · 2.5 each side');
  ui.show('Bench Press', 45);
  assert.strictEqual(cap(), 'Just the bar');
});

test('criterion 5: heaviest against the inner collar, lightest outward, on both sides (the real SVG, parsed)', (assert)=>{
  const ui = mount();
  ui.show('Squat', 160);
  const rects = [...ui.box.querySelectorAll('.bar-plate')].map(r => ({lb: Number(r.getAttribute('data-lb')), x: Number(r.getAttribute('x')), w: Number(r.getAttribute('width'))}));
  assert.strictEqual(rects.length, 6, 'three plates a side');
  const left = rects.filter(r => r.x < 181).sort((a, b) => b.x - a.x).map(r => r.lb);
  const right = rects.filter(r => r.x >= 181).sort((a, b) => a.x - b.x).map(r => r.lb);
  assert.deepStrictEqual(left, [45, 10, 2.5], 'left side, collar outward');
  assert.deepStrictEqual(right, [45, 10, 2.5], 'right side, collar outward');
  const l45 = rects.find(r => r.lb === 45 && r.x < 181), r45 = rects.find(r => r.lb === 45 && r.x >= 181);
  assert.strictEqual(l45.x + l45.w, 110, 'the left 45 sits against the left collar');
  assert.strictEqual(r45.x, 252, 'the right 45 against the right collar');
  ui.show('Squat', 765); // 8 × 45 a side: squeezed to fit the sleeve
  const outer = Math.min(...[...ui.box.querySelectorAll('.bar-plate')].map(r => Number(r.getAttribute('x'))));
  assert.ok(outer >= 5, `a heavy load stays on the sleeve (outermost x ${outer})`);
});

test('criterion 6: the bar is drawn full width of the cover\'s content box (CSSOM)', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const rules = [];
  const walk = l => { for(const r of l){ if(r.selectorText) rules.push(r); else if(r.cssRules) walk(r.cssRules); } };
  walk(window.document.styleSheets[0].cssRules);
  const svg = rules.filter(r => r.selectorText === '.cover-bar svg');
  assert.strictEqual(svg.length, 1);
  assert.strictEqual(svg[0].style.getPropertyValue('width'), '100%');
  assert.strictEqual(svg[0].style.getPropertyValue('height'), 'auto', 'the drawing keeps its proportions');
  const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  assert.strictEqual(document.getElementById('upNextBar').parentElement.id, 'upNext', 'a direct child of the cover: its content box');
  // Under the Log row, so Log stays above y = 480 (UX-06a criterion 5).
  const kids = [...document.getElementById('upNext').children];
  assert.ok(kids.indexOf(document.getElementById('upNextBar')) > kids.indexOf(document.querySelector('.cover-log')));
});

test('criterion 7: kg: 100 kg on the 20 kg bar is 25 + 15 a side, and the 25 is drawn in the red ink', (assert)=>{
  const ui = mount('kg');
  assert.strictEqual(ui.window.__eq().bar, 20, 'anchor: the kg standard');
  assert.deepStrictEqual(ui.pps(100), {plates: [25, 15], remainder: 0});
  ui.show('Deadlift', 100);
  const p25 = ui.box.querySelector('.bar-plate[data-lb="25"]');
  assert.ok(p25.classList.contains('ink-red'), 'kg 25 is red');
  assert.ok(ui.box.querySelector('.bar-plate[data-lb="15"]').classList.contains('ink-yellow'), 'kg 15 is yellow');
  assert.strictEqual(ui.box.querySelectorAll('.cover-bar-cap span')[1].textContent, '20 kg bar');
  const lb = mount();
  lb.show('Deadlift', 225);
  assert.ok(lb.box.querySelector('.bar-plate[data-lb="45"]').classList.contains('ink-blue'), 'lb 45 is blue');
  lb.show('Deadlift', 50);
  assert.ok(lb.box.querySelector('.bar-plate[data-lb="2.5"]').classList.contains('ink-steel'), 'change plates are steel');
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  assert.match(CSS, /\.cover-bar \.ink-red\{fill:var\(--spot-red\);\}/);
});

test('the bar follows the weight on the cover: renderCoverNumeral redraws it from the fields (real cover markup)', (assert)=>{
  const { window } = runJsdom(extractElementById(src, 'upNext'), `
    var weightUnit = 'lb', equipmentProfile = null;`,
    [...DEFS, ...['renderCoverNumeral', 'readSetLogger'].map(f => extractFunction(src, f))]);
  const card = window.document.getElementById('upNext');
  card._exName = 'Bench Press'; card._range = '4-6';
  window.document.getElementById('upNextWeight').value = '160';
  window.document.getElementById('upNextReps').value = '5';
  window.renderCoverNumeral(card);
  const cap = () => window.document.querySelector('#upNextBar .cover-bar-cap span').textContent;
  assert.strictEqual(cap(), '45 · 10 · 2.5 each side');
  window.document.getElementById('upNextWeight').value = '185';
  window.renderCoverNumeral(card);
  assert.strictEqual(cap(), '45 · 25 each side');
});

run();
