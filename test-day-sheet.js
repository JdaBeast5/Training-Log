'use strict';
// v3.595 (UX-06b): the day picker moves into a sheet opened from the Today
// cover's day headline. The rail is the same one Today used to show: the real
// renderTabs renders into #tabs (now inside #daySheet), with its roving focus
// and reorder mode unchanged (test-a11y-keyboard-focus.js, which extracts
// renderTabs, runs unchanged). Choosing a day runs the tab's own handler
// (activeDay, renderTabs, renderWorkout, saveActiveDay) and closes the sheet;
// in reorder mode a tap does not. Escape (the app's one overlay registry), the
// backdrop and Done close it, and focus goes back to the headline.
//
// Real invocation: the real #daySheet and cover markup, the real renderTabs,
// openDaySheet, closeDaySheet, chooseDayFromSheet, moveDay, the real wiring
// statements and reorder toggle, and the real Escape path (SCROLL_LOCK_OVERLAYS,
// OVERLAY_CLOSERS, openOverlayEl, handleOverlayEscape).
//
// Sabotage: test the tab against '#tabs .tab' in chooseDayFromSheet (the
// tapped tab is already detached by the re-render) and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-day-sheet.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function line(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n', i));
}
function block(startText){
  const i = src.indexOf(startText);
  if(i === -1) throw new Error('not found: ' + startText);
  return src.slice(i, src.indexOf('\n});', i) + 4);
}
const WIRING = [
  line("document.getElementById('upNextDayBtn').addEventListener('click', openDaySheet);"),
  line("document.getElementById('daySheetClose').addEventListener('click', closeDaySheet);"),
  line("document.getElementById('daySheet').addEventListener('click',"),
  line("document.getElementById('tabs').addEventListener('click', chooseDayFromSheet);"),
  line("document.getElementById('tabs').addEventListener('keydown', chooseDayFromSheet);"),
  block("document.getElementById('reorderToggle').addEventListener('click',"),
];

function mount(){
  const { window } = runJsdom(extractElementById(src, 'upNextDayBtn') + extractElementById(src, 'daySheet') + '<div id="workoutCard"></div>', `
    var dayOrder = ['d1', 'd2', 'd3'], activeDay = 'd1', reorderMode = false, weekProgress = {};
    var dayDefs = {d1: {label: 'Day 1', sub: 'Upper'}, d2: {label: 'Day 2', sub: 'Lower'}, d3: {label: 'Day 3', sub: 'Rest', rest: true}};
    window.__workouts = 0; window.__saved = 0; window.__orderSaved = 0;
    function renderWorkout(){ window.__workouts++; }
    function saveActiveDay(){ window.__saved++; }
    function saveDayOrder(){ window.__orderSaved++; }
    function getDayPlateClass(){ return 'p-red'; }
    function dayGlyphSvg(){ return ''; }
    function icon(){ return ''; }
    function closeExerciseSubModal(){} function closeCalendarModal(){} function closeBarcodeScanner(){} function closeExerciseHistory(){}
    function closeExerciseEditor(){} function closeGlobalSearch(){} function closeWhatsNew(){} function closeNavMoreOverlay(){}`,
    [...['renderTabs', 'moveDay', 'openDaySheet', 'closeDaySheet', 'chooseDayFromSheet', 'openOverlayEl', 'handleOverlayEscape'].map(f => extractFunction(src, f)),
     extractConst(src, 'SCROLL_LOCK_OVERLAYS'), extractConst(src, 'OVERLAY_CLOSERS'), ...WIRING,
     "document.addEventListener('keydown', handleOverlayEscape);",
     'window.__state = () => ({activeDay, reorderMode});']);
  const doc = window.document;
  const $ = id => doc.getElementById(id);
  const tick = () => new Promise(r => setTimeout(r, 5));
  return { window, doc, $, tick, open: () => $('daySheet').classList.contains('active') };
}

test('criterion 1: one click on the cover headline opens the sheet, a labelled dialog holding the real renderTabs rail, focus on the day shown', async (assert)=>{
  const ui = mount();
  assert.ok(!ui.open(), 'closed at first');
  ui.$('upNextDayBtn').click();
  assert.ok(ui.open(), 'one click opens it');
  const sheet = ui.$('daySheet');
  assert.strictEqual(sheet.getAttribute('role'), 'dialog');
  assert.strictEqual(sheet.getAttribute('aria-modal'), 'true');
  assert.strictEqual(ui.$(sheet.getAttribute('aria-labelledby')).textContent, 'Training day');
  const tabs = [...sheet.querySelectorAll('#tabs .tab')];
  assert.deepStrictEqual(tabs.map(t => t.dataset.dayId), ['d1', 'd2', 'd3'], 'renderTabs output, in the saved order');
  assert.strictEqual(tabs[0].getAttribute('aria-selected'), 'true');
  assert.strictEqual(ui.$('upNextDayBtn').getAttribute('aria-controls'), 'daySheet');
  assert.strictEqual(ui.$('upNextDayBtn').getAttribute('aria-haspopup'), 'dialog');
  await ui.tick();
  assert.strictEqual(ui.doc.activeElement, sheet.querySelector('#tabs .tab.active'), 'focus on the selected day');
});

test('criterion 2: choosing a day runs the existing day switch and closes the sheet (tap and keyboard), focus back on the headline', async (assert)=>{
  const ui = mount();
  ui.$('upNextDayBtn').click();
  ui.$('daySheet').querySelectorAll('#tabs .tab')[1].click();
  assert.strictEqual(ui.window.__state().activeDay, 'd2', 'the day changed');
  assert.strictEqual(ui.window.__workouts, 1, 'renderWorkout ran once');
  assert.strictEqual(ui.window.__saved, 1, 'and the choice was saved');
  assert.ok(!ui.open(), 'the sheet closed');
  assert.strictEqual(ui.doc.activeElement, ui.$('upNextDayBtn'));
  ui.$('upNextDayBtn').click();
  const tab = ui.$('daySheet').querySelectorAll('#tabs .tab')[2];
  tab.dispatchEvent(new ui.window.KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
  assert.strictEqual(ui.window.__state().activeDay, 'd3');
  assert.ok(!ui.open(), 'Enter chooses and closes too');
  ui.$('upNextDayBtn').click();
  ui.$('daySheet').querySelector('#tabs .tab.active').dispatchEvent(new ui.window.KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
  assert.ok(ui.open(), 'arrow keys move between days without closing');
});

test('reorder mode: tapping a day or its arrows keeps the sheet open; closing leaves reorder mode', (assert)=>{
  const ui = mount();
  ui.$('upNextDayBtn').click();
  ui.$('reorderToggle').click();
  assert.ok(ui.window.__state().reorderMode, 'anchor: reorder on');
  ui.$('daySheet').querySelectorAll('#tabs .tab')[1].click();
  assert.ok(ui.open(), 'a tap in reorder mode does not choose or close');
  assert.strictEqual(ui.window.__state().activeDay, 'd1');
  ui.$('daySheet').querySelectorAll('#tabs .tab')[0].querySelectorAll('.reorder-arrows button')[1].click();
  assert.ok(ui.open(), 'moving a day keeps it open');
  assert.strictEqual(ui.window.__orderSaved, 1, 'the move was saved');
  ui.$('daySheetClose').click();
  assert.ok(!ui.open());
  assert.strictEqual(ui.window.__state().reorderMode, false, 'reorder mode ends with the sheet');
  assert.strictEqual(ui.$('reorderToggle').textContent, 'Reorder days');
});

test('criterion 4: Escape, the backdrop and Done each close it, and focus returns to the headline', (assert)=>{
  const ui = mount();
  ui.$('upNextDayBtn').click();
  ui.doc.dispatchEvent(new ui.window.KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  assert.ok(!ui.open(), 'Escape (through the overlay registry)');
  assert.strictEqual(ui.doc.activeElement, ui.$('upNextDayBtn'));
  ui.$('upNextDayBtn').click();
  ui.$('daySheet').dispatchEvent(new ui.window.MouseEvent('click', {bubbles: true}));
  assert.ok(!ui.open(), 'the backdrop');
  ui.$('upNextDayBtn').click();
  ui.$('daySheet').querySelector('.sub-modal-title').click();
  assert.ok(ui.open(), 'a tap inside the sheet does not close it');
  ui.$('daySheetClose').click();
  assert.ok(!ui.open(), 'Done');
  assert.strictEqual(ui.doc.activeElement, ui.$('upNextDayBtn'));
});

test('placement: the rail lives only in the sheet, the headline is in the Today cover, and the sheet is in the overlay registry (scroll lock, focus trap, Escape)', (assert)=>{
  const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  assert.strictEqual(document.querySelectorAll('#tabs').length, 1);
  assert.ok(document.getElementById('tabs').closest('#daySheet'));
  assert.ok(document.getElementById('reorderToggle').closest('#daySheet'));
  assert.strictEqual(document.getElementById('todayView').querySelector('.tabs, .tabs-header'), null, 'nothing of the rail left on Today');
  assert.ok(document.getElementById('upNextDayBtn').closest('#upNext'));
  assert.ok(document.getElementById('daySheet').classList.contains('sub-modal-overlay'), 'the app\'s own sheet pattern');
  const list = new Function(extractConst(src, 'SCROLL_LOCK_OVERLAYS') + '; return SCROLL_LOCK_OVERLAYS;')();
  assert.ok(list.includes('daySheet'));
});

test('a rest day keeps the cover: its white or off field holds the headline at >= 4.5:1, in both themes', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const rules = [];
  const walk = (list, media) => { for(const r of list){ if(r.selectorText) rules.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } };
  walk(window.document.styleSheets[0].cssRules, '');
  const get = (sel, prop, light) => { let v = null; for(const {r, media} of rules){ if(r.selectorText === sel && (!media || (light && /prefers-color-scheme:\s*light/.test(media) && !/contrast/.test(media)))){ const x = r.style.getPropertyValue(prop).trim(); if(x) v = x; } } return v; };
  const resolve = (v, light, d = 0) => v.replace(/var\((--[a-z0-9-]+)\)/g, (m, n) => { const x = (light && get('body:not(.gym-mode)', n, true)) || get(':root', n, false); if(!x || d > 10) throw new Error('unresolved ' + n); return resolve(x, light, d + 1); });
  const lum = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for(const light of [false, true]) for(const ink of ['white', 'off']){
    const field = resolve(get('.day-' + ink, '--spot', false), light), text = resolve(get('.day-' + ink, '--on-spot', false), light);
    assert.ok(/^#[0-9A-F]{6}$/i.test(field) && /^#[0-9A-F]{6}$/i.test(text), `${ink}: ${field} / ${text}`);
    assert.ok(ratio(field, text) >= 4.5, `${light ? 'light' : 'dark'} ${ink}: ${ratio(field, text).toFixed(2)}:1`);
  }
  const hidden = rules.find(({r}) => r.selectorText.startsWith('.cover.is-rest .cover-numeral'));
  assert.ok(hidden && hidden.r.style.getPropertyValue('display') === 'none' && /\.cover-log/.test(hidden.r.selectorText), 'no numeral or Log on a rest day');
});

run();
