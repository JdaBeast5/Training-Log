'use strict';
// v3.586 (UX-16, owner yes 2026-11-07 D2; moved up 2026-11-16): the coach
// button moves into the header, beside Search and Settings. It floated over
// the content on every view (the owner's screenshots: over "Reorder days",
// "Log set" and the program overview), tucked away on scroll, and could be
// dragged to either edge with its position remembered. It keeps its ID
// (coachFab), its accessible name and its open handler.
//
// RETIRED: test-coach-fab-drag.js. Every case in it tested the drag-to-
// reposition behaviour (pointer capture past a threshold, the snap to an edge,
// the remembered side, the click swallowed after a drag), which this item
// removes on purpose, as test-plate-voice-removed.js did for its features.
// Criterion 4 below checks that code is really gone.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-coach-header-button.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document: cssDoc } = new JSDOM(`<style>${css}</style>`).window;
function styleRules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.style && r.selectorText) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  walk(cssDoc.styleSheets[0].cssRules);
  return out;
}
const stripComments = s => s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !/^\s*\/\//.test(l)).map(l => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');

// The real click handler, as one top-level statement.
const HANDLER = (() => {
  const start = src.indexOf("document.getElementById('coachFab').addEventListener('click',");
  const end = src.indexOf('\n});', start);
  if(start === -1 || end === -1) throw new Error('coachFab click handler not found');
  return src.slice(start, end + 4);
})();

test('the button lives in the header, beside Search and Settings, with its ID and accessible name', (assert)=>{
  const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  const btn = document.getElementById('coachFab');
  assert.ok(btn.closest('header'), 'inside the header');
  assert.strictEqual(document.querySelectorAll('#coachFab').length, 1);
  assert.strictEqual(btn.getAttribute('aria-label'), 'Ask your coach');
  assert.strictEqual(btn.getAttribute('type'), 'button');
  assert.deepStrictEqual([...btn.closest('header').querySelectorAll('button')].slice(-3).map(b => b.id), ['globalSearchBtn', 'coachFab', 'settingsCog']);
});

test('criterion 1: one click on the real handler opens the coach (#coachFabModal gains active, the empty state renders); a second closes it', async (assert)=>{
  const { window, document } = runJsdom(extractElementById(src, 'coachFab') + '<div id="coachFabModal"></div><input id="floatingChatInput">', `
    var coachChatHistory = []; window.__renders = 0;
    function renderCoachChatLog(){ window.__renders++; }
    async function getApiKey(){ return 'k'; }`, [HANDLER]);
  const modal = document.getElementById('coachFabModal');
  document.getElementById('coachFab').click();
  assert.ok(modal.classList.contains('active'), 'opened');
  assert.strictEqual(window.__renders, 1);
  document.getElementById('coachFab').click();
  assert.ok(!modal.classList.contains('active'), 'closed');
  assert.ok(!document.getElementById('coachFab').classList.contains('tucked'), 'the button never tucks away now');
});

// Fixed elements left, by kind. The spec names the tab bar, the toast, the rest
// timer and sheets; the rest are listed with what they are, so a new one fails.
const FIXED_ALLOWED = {
  'tab bar': ['.nav-pills', '.status-scrim'],
  'toasts and moments': ['.undo-toast', '.food-add-pop', '.celebrate-banner', '.confetti-piece', '.pull-refresh-indicator'],
  'rest timer': ['.rest-timer', '.gym-dock', '.gym-offer'],
  'sheets and overlays': ['.set-sheet-scrim', '.set-sheet', '.sub-modal-overlay', '.settings-modal', '.photo-lightbox', '.barcode-scanner-overlay', '.coach-fab-modal', '.calendar-modal-overlay', '.user-picker-overlay', '.launch'],
  'compact day header (only once scrolled past the title)': ['.sticky-day-header'],
  'backdating jump-back (only while backdating)': ['.today-fab'],
  'page-level, not a control': ['body.scroll-locked', 'body.gym-mode::after', 'body.gym-finishing::after'],
};
test('criterion 2: nothing is position:fixed over the content apart from the named kinds; the coach button is not among them', (assert)=>{
  const fixed = styleRules().filter(r => r.style.getPropertyValue('position') === 'fixed').map(r => r.selectorText);
  const allowed = new Set(Object.values(FIXED_ALLOWED).flat());
  assert.deepStrictEqual(fixed.filter(sel => !allowed.has(sel)), []);
  assert.ok(!fixed.some(sel => /coach-fab(?!-modal)/.test(sel)), 'the coach button does not float');
  assert.ok(fixed.includes('.nav-pills'), 'anchor: the sweep sees the tab bar');
});

test('criterion 3: the button is at least 44 x 44 in the CSSOM, and keeps its accessible name', (assert)=>{
  const r = styleRules().filter(r => r.selectorText === '.coach-fab');
  assert.strictEqual(r.length, 1);
  assert.ok(parseFloat(r[0].style.getPropertyValue('width')) >= 44 && parseFloat(r[0].style.getPropertyValue('height')) >= 44,
    r[0].style.getPropertyValue('width') + ' x ' + r[0].style.getPropertyValue('height'));
  assert.strictEqual(r[0].style.getPropertyValue('position'), 'absolute');
});

test('criterion 4: the drag, the tuck and the stored position are gone from the real source (comments stripped); the key name is left only in the one-time cleanup', (assert)=>{
  const code = stripComments(src);
  for(const name of ['wireCoachFabTuck', 'COACH_FAB_POSITION_KEY', 'clampCoachFabTop', 'applyCoachFabPosition', 'restoreCoachFabPosition', 'saveCoachFabPosition', 'wireCoachFabDrag', 'coachFabJustDragged']){
    assert.ok(!new RegExp('\\b' + name + '\\b').test(code), name + ' is still in the source');
  }
  assert.ok(!/\.coach-fab\.(tucked|dragging)/.test(code), 'their CSS states are gone');
  assert.strictEqual((code.match(/coach-fab-position/g) || []).length, 1, 'only the cleanup names the old key');
});

const CLEANUP = "try{ await window.storage.delete('coach-fab-position'); }catch(e){}";
test('criterion 5: an old stored position is removed once on load, and a storage error does not throw', async (assert)=>{
  assert.strictEqual(src.split(CLEANUP).length - 1, 1, 'one cleanup call');
  const s = (() => { const i = src.indexOf(CLEANUP); return src.slice(src.lastIndexOf('(async ()=>{', i), i); })();
  assert.ok(s.length > 0, 'the cleanup is inside the boot sequence');
  const store = {'coach-fab-position': JSON.stringify({side: 'left', topFraction: 0.4}), 'other': '1'};
  const storage = {delete: async k => { delete store[k]; }};
  await (new Function('window', `return (async ()=>{ ${CLEANUP} })();`))({storage});
  assert.deepStrictEqual(Object.keys(store), ['other']);
  const failing = {delete: async () => { throw new Error('quota'); }};
  await (new Function('window', `return (async ()=>{ ${CLEANUP} })();`))({storage: failing});
});

run();
