'use strict';
// v3.571 (BIZ-18a): the free-list guard. BIZ-18's promise is that everything
// people use today stays free; this test runs on every build so a lock, an
// upgrade prompt or a "Pro" label can't slip into a free area unnoticed.
//
// The regex is /\b(pro|premium|upgrade|unlock|locked)\b/i plus the lock glyph,
// applied to each element's own text, aria-label, class and data-* values.
//   1. The whole static app: the real index.html, <script> and <style> removed,
//      every element under <body>.
//   2. The rendered views jsdom can drive, each with the real function and its
//      existing suite's fixture pattern: renderFoodLog (test-log-2-0.js),
//      renderHistory (test-history-date-range-filter.js), renderUpNext
//      (test-up-next.js), openSetSheet (test-set-sheet.js).
//   3. Today's exercise rows: renderWorkout can't be driven in jsdom (see
//      test-today-workout-emoji.js), so this is a SOURCE check, not a render:
//      the string literals and template text of the real renderWorkout,
//      comments stripped.
//   4. No element in 1-2 is disabled while its text or aria-label mentions
//      pay, price, subscribe or purchase.
//   5. The allowlist is exact: the class token usda-key-upgrade-toggle (a
//      USDA-key panel style reused on 5 buttons). Every match is printed.
//
// Sabotage: inject <span class="pro-badge">Pro</span> into the program
// picker and criterion 1 fails; empty the allowlist and criterion 1 fails on
// the 5 USDA-toggle buttons.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { test, run } = makeRunner('test-free-list-guard.js');

const WORDS = /\b(pro|premium|upgrade|unlock|locked)\b|🔒/i;
const ALLOWED_CLASSES = ['usda-key-upgrade-toggle'];
const PAYWALL = /\b(pay|price|subscribe|purchase)/i;

// Every match in a tree, as "where: what". Allowed class tokens are removed
// before testing, and reported separately so the scan is seen to reach them.
function scan(root, allowed = ALLOWED_CLASSES){
  const hits = [], allowedHits = [], disabledPaywall = [];
  let count = 0;
  for(const el of root.querySelectorAll('*')){
    if(el.closest('script, style')) continue; // a fixture's own setup script is not app markup
    count++;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
    const tokens = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    const cls = tokens.filter(t => !allowed.includes(t)).join(' ');
    if(tokens.some(t => allowed.includes(t) && WORDS.test(t))) allowedHits.push(el.id || el.tagName);
    const data = [...el.attributes].filter(a => a.name.startsWith('data-')).map(a => a.value).join(' ');
    const where = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;
    for(const [kind, val] of [['text', own], ['aria-label', el.getAttribute('aria-label') || ''], ['class', cls], ['data', data]]){
      const m = WORDS.exec(val);
      if(m) hits.push(`${where} ${kind}: "${m[0]}" in ${JSON.stringify(val.trim().slice(0, 80))}`);
    }
    if(el.hasAttribute('disabled') && PAYWALL.test(el.textContent + ' ' + (el.getAttribute('aria-label') || ''))) disabledPaywall.push(where);
  }
  return {count, hits, allowedHits, disabledPaywall};
}

function staticBody(markup){
  const doc = new JSDOM(markup).window.document;
  doc.querySelectorAll('script, style').forEach(n => n.remove());
  return doc.body;
}

test('criterion 1 and 5: no lock, upgrade or Pro label anywhere in the static app; the only allowed match is the usda-key-upgrade-toggle class, on its 5 buttons', (assert)=>{
  const r = scan(staticBody(html));
  assert.ok(r.count > 1500, 'anchor: elements scanned ' + r.count);
  console.log('    allowed matches (usda-key-upgrade-toggle): ' + r.allowedHits.join(', '));
  assert.deepStrictEqual(r.hits, []);
  assert.deepStrictEqual(r.allowedHits.sort(), ['careCancelEdit', 'coachChatClear', 'onboardingDismiss', 'sleepTipsToggle', 'waterTipsToggle']);
  assert.deepStrictEqual(r.disabledPaywall, [], 'criterion 4 (static)');
});

test('sabotage proof: a Pro badge in the program picker, or an empty allowlist, is caught', (assert)=>{
  const at = html.indexOf('id="programHeader"');
  assert.ok(at > 0, 'anchor: the program picker card header');
  const close = html.indexOf('>', at) + 1;
  const injected = scan(staticBody(html.slice(0, close) + '<span class="pro-badge">Pro</span>' + html.slice(close)));
  assert.ok(injected.hits.some(h => /pro-badge|"Pro"/.test(h)), injected.hits.join('\n'));
  const noAllow = scan(staticBody(html), []);
  assert.strictEqual(noAllow.hits.filter(h => /usda-key-upgrade-toggle/.test(h)).length, 5, noAllow.hits.join('\n'));
});

test('criteria 2 and 4: the rendered Food log, History, Up next and set sheet carry no lock, upgrade or Pro label', async (assert)=>{
  const out = {};
  // Food log, as test-log-2-0.js drives it.
  { const { window } = runJsdom('<div id="foodLogList"></div>', 'window.todaysFoodLog = []; window.computeTodaysFoodTotals = ()=>({}); window.updateBars = ()=>{}; window.renderMedicalNutrientBars = ()=>{}; window.renderTodayInsights = ()=>{}; window.updateRepeatYesterdayVisibility = ()=>{};', [extractFunction(src, 'renderFoodLog'), 'renderFoodLog();']);
    out.food = window.document.body; }
  // History, as test-history-date-range-filter.js drives it.
  { const today = new Date(); const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const chunks = ['getTodayKey', 'dateKeyMinusDays', 'escapeHtml', 'parseDateKey', 'formatDate', 'formatShortDate', 'fmtMonthLabel', 'showHistoryDayPane'].map(f => extractFunction(src, f));
    const { window } = runJsdom(extractElementById(src, 'historyView'), `window.buildDayLog = async ()=> (${JSON.stringify({[key]: {exercises: [{name: 'Squat'}]}})}); window.renderHistoryHeatmap = ()=>{}; var historyFilter = '';`,
      [...chunks, 'function isOpenPosture(){ return false; }', extractFunction(src, 'renderHistory')]);
    await window.renderHistory();
    assert.ok(window.document.querySelector('#historyList details.month-group summary'), 'anchor: History rendered its month group');
    out.history = window.document.body; }
  // Up next, as test-up-next.js drives it.
  { const row = (s, o, wv = '', rv = '') => `<div class="set-row swipe-item" data-set-idx="${s}" data-ex-idx="1"><div class="swipe-content set-row-content"><span class="set-num">${s + 1}</span><span class="set-row-owner">${o}</span><input class="ex-input ex-weight" placeholder="lb" value="${wv}"><input class="ex-input ex-reps" placeholder="reps" value="${rv}"><input class="ex-input ex-rpe" placeholder="RPE"></div></div>`;
    const list = `<div class="exercise-block"><input type="checkbox"><div class="ex-sets"><span>4×6-8</span></div>${row(0, 'Barbell Row', '135', '8')}${row(1, 'Barbell Row')}</div>`;
    const { window } = runJsdom(extractElementById(src, 'upNext') + `<div id="exerciseList">${list}</div>`, 'var weightUnit = "lb"; var exerciseDetailPinned = true;',
      [...['findNextSetRow', 'numericPlaceholder', 'renderUpNext', 'fillSetLogger', 'getSetFieldUnit', 'coverSetUnit', 'coverTimedValue' /* v3.670 (UX-71): fillSetLogger and renderUpNext read the set's unit */, 'readSetLogger', 'logUpNext', 'writeSetToRow'].map(f => extractFunction(src, f)), 'renderUpNext();']);
    assert.strictEqual(window.document.getElementById('upNext').hidden, false, 'anchor: Up next rendered');
    out.upNext = window.document.getElementById('upNext'); }
  // Set sheet, as test-set-sheet.js drives it.
  { const FNS = ['escapeHtml', 'trimUnitNum', 'numericPlaceholder', 'writeSetToRow', 'setChipValues', 'setChipLabel', 'commitSet', 'setSheetWeightStep', 'loadStepFor' /* v3.651 (BL-79) */, 'openSetSheet', 'closeSetSheet', 'saveSetSheet', 'stepSetSheet', 'setSheetAddDrop', 'refreshSetSheetDropBtn', 'writeDropsToRow'].map(f => extractFunction(src, f)); // v3.651 (BL-79): the sheet's drop lines
    const start = src.indexOf('(function wireSetSheet(){'); const WIRE = src.slice(start, src.indexOf('\n})();', start) + 6);
    const rowHtml = `<div class="exercise-block"><div class="exercise"><input type="checkbox" data-idx="1"><div class="ex-name">Barbell Row</div><div class="ex-sets"><span>4×6-8</span></div></div><div class="sets-block"><div class="set-row" data-set-idx="1" data-ex-idx="1"><span class="set-row-owner">Barbell Row</span><input class="ex-input ex-weight" placeholder="lb"><input class="ex-input ex-reps" placeholder="reps"><input class="ex-input ex-rpe" placeholder="RPE"><button class="set-drop-btn"></button><div class="set-note-wrap"><input class="set-note-input"></div></div></div></div>`;
    const { window } = runJsdom(`<div id="exerciseList">${rowHtml}</div>${extractElementById(src, 'setSheetScrim')}${extractElementById(src, 'setSheet')}`, `
      var weightUnit = 'lb', distanceUnit = 'km'; window.requestAnimationFrame = fn => fn();
      function getEquipment(){ return {bar:45, plates:[45, 25, 10, 5, 2.5], dbIncrement:5}; } function isBarbellExercise(n){ return n === 'Barbell Row'; } function isDumbbellExercise(){ return false; }
      function renderAllSetChips(){} function setExerciseBlockOpen(){} function showUndoToast(){}`,
      ['const setSheetState = {row:null, chip:null};', extractConst(src, 'DROP_SET_MAX') /* v3.651 (BL-79) */, ...FNS, WIRE, `openSetSheet(document.querySelector('.set-row'), {_values: {done:false, weight:'135', reps:'8'}, dataset: {exIdx:'1', setIdx:'1'}});`]);
    assert.strictEqual(window.document.getElementById('setSheet').hidden, false, 'anchor: the sheet opened');
    out.sheet = window.document.getElementById('setSheet'); }
  for(const [name, root] of Object.entries(out)){
    const r = scan(root);
    assert.deepStrictEqual(r.hits, [], name);
    assert.deepStrictEqual(r.disabledPaywall, [], name + ' (criterion 4)');
  }
});

test('criterion 3 (a source check, not a render): no string literal or template text in the real renderWorkout carries a lock, upgrade or Pro label', (assert)=>{
  const body = extractFunction(src, 'renderWorkout').split('\n').map(l => l.replace(/^\s*\/\/.*$/, '').replace(/\s\/\/ .*$/, '')).join('\n');
  const literals = [...body.matchAll(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g)].map(m => m[0].replace(/\$\{[^}]*\}/g, ' '));
  assert.ok(literals.length > 100, 'anchor: literals scanned ' + literals.length);
  const hits = literals.filter(l => WORDS.test(l.replace(/usda-key-upgrade-toggle/g, '')));
  assert.deepStrictEqual(hits, []);
});

run();
