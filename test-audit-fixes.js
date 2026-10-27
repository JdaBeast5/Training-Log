'use strict';
// Fixes from the post-2.0 audit (owner: "use the skills one more time to
// confirm and make sure the app looks correct and see if there's any
// functionality that needs to be fixed or updated"). Impeccable `audit`, run
// live in Chromium at 390x844 over every tab, sheet and gym mode, plus the
// Apple HIG 44pt target floor. One increment per finding.
//
// v3.350 — Food-row pencil (duplicate & edit): its ::after draws the pencil
// glyph and overrode the shared 44px hit-area ::after, so its real tap area
// was ~14x14 (button box 4x4 at font-size:0). Measured with elementFromPoint
// in Chromium: 13x15 before, 30x45 after (the star beside it is 31x45).
// v3.351 — The idle rest timer is opacity 0 / pointer-events:none but its
// nine buttons stayed in the accessibility tree (VoiceOver could reach
// invisible controls). It is now inert whenever it isn't .active, synced by a
// MutationObserver on its class so every show/hide path is covered.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, extractIIFE, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-audit-fixes.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
// Real parsed rules (CSSOM), last declaration wins, like the cascade for equal specificity.
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(',').map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL CSSOM (v3.350): the food-row pencil keeps its drawn glyph on ::after and gets its 44px hit area on ::before', (assert)=>{
  assert.strictEqual(declared('.fi-duplicate::after', 'width'), '14px', 'anchor: ::after is the 14px pencil glyph, so it cannot also be the hit area');
  assert.strictEqual(declared('.fi-duplicate::before', 'height'), '44px');
  assert.strictEqual(declared('.fi-duplicate::before', 'width'), 'calc(100% + 8px)', 'meets the star at the gap midpoint, no overlap');
  assert.strictEqual(declared('.fi-duplicate::before', 'position'), 'absolute');
  assert.strictEqual(declared('.fi-duplicate', 'min-width'), '22px');
  assert.strictEqual(declared('.fi-duplicate', 'min-height'), '22px');
});

test('REAL markup + invocation (v3.351): the idle rest timer is inert, and follows .active both ways', async (assert)=>{
  const { window } = runJsdom(extractElementById(src, 'restTimer'), '', [extractIIFE(src, 'syncRestTimerInert'), 'syncRestTimerInert();']);
  const el = window.document.getElementById('restTimer');
  assert.ok(el.querySelectorAll('button').length >= 4, 'anchor: the real timer with its buttons');
  assert.ok(el.hasAttribute('inert'), 'idle on load: out of the accessibility tree and tab order');
  el.classList.add('active');
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(el.hasAttribute('inert'), false, 'running: reachable');
  el.classList.remove('active');
  await new Promise(r => setTimeout(r, 0));
  assert.ok(el.hasAttribute('inert'), 'closed or completed: inert again');
});

test('REAL source (v3.352): empty states no longer send you below to controls that are above', (assert)=>{
  const lines = [...src.matchAll(/empty-note">([^<]*)</g)].map(m => m[1]);
  assert.ok(lines.length > 20, 'anchor: the real empty states');
  const wrong = lines.filter(l => /tap an item below|add items below|actually take below/.test(l));
  assert.deepStrictEqual(wrong, []);
  // 2026-10-27 (v3.434): the food log now sits ABOVE the food library (v3.428), so
  // "below" is right there; Grocery's note was reworded.
  for(const fixed of ['Tap + on a food below to add it', 'Add an item, or a recipe', 'add what you actually take.']) assert.ok(lines.some(l => l.includes(fixed)), fixed);
  assert.ok(lines.some(l => /log how you\\?.re feeling above/.test(l)), 'the correct "above" in Care stays');
});

test('REAL invocation (v3.353): PR timeline rows carry no emoji; the strength PR tag still marks the kind', async (assert)=>{
  const { window } = runJsdom('<div id="prTimeline"></div>', `
    const fmtWeight = lb => lb + ' lb';
    const reconstructAllPRs = async () => [
      {date:'2026-10-25', name:'Bench Press', type:'weight', dayLabel:'Day 1', weight:185, reps:5},
      {date:'2026-10-20', name:'Back Squat', type:'strength', dayLabel:'Day 2', weight:225, reps:3, e1rm:245}];
    const renderCollapsibleList = (el, items) => { el.innerHTML = items.join(''); };`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractFunction(src, 'renderPrTimeline'), 'window.__done = renderPrTimeline();']);
  await window.__done;
  const rows = [...window.document.querySelectorAll('#prTimeline .pr-row')];
  assert.strictEqual(rows.length, 2, 'anchor: the real rows rendered');
  assert.doesNotMatch(window.document.getElementById('prTimeline').textContent, /\p{Extended_Pictographic}/u);
  assert.strictEqual(rows[1].querySelector('.pr-type-tag').textContent, 'strength PR');
  assert.strictEqual(rows[0].querySelector('.prt-ex-name .xlink').textContent.replace('›', '').trim(), 'Bench Press');
});

test('REAL source (v3.354): Week Over Week has no unit on an empty protein value and a one-word change label', (assert)=>{
  const fn = extractFunction(src, 'renderAnalysis');
  const rowTpl = fn.slice(fn.indexOf('<div class="week-row">'), fn.indexOf('`;', fn.indexOf('<div class="week-row">')));
  assert.ok(rowTpl.length > 200, 'anchor: the real row template');
  assert.match(rowTpl, /\$\{r\.avgPro != null \? r\.avgPro \+ 'g' : '—'\}/);
  assert.doesNotMatch(rowTpl, /'—'\}g</, 'no unit glued to the dash');
  assert.match(rowTpl, /<div class="w-label">Change<\/div>/);
  assert.doesNotMatch(rowTpl, /vs Prior Wk/);
  // The real expression, evaluated both ways.
  const expr = (avgPro) => new Function('r', "return r.avgPro != null ? r.avgPro + 'g' : '—';")({avgPro});
  assert.strictEqual(expr(null), '—');
  assert.strictEqual(expr(142), '142g');
});

test('REAL CSSOM (v3.355): Log text fields and placeholders use the text face; typed numbers stay mono', (assert)=>{
  const raw = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const { window } = new JSDOM(`<style>${raw}</style><div class="weight-input-row">
    <input type="text" id="groceryAddInput"><input type="text" id="mySupplementAddInput"><input type="number" id="weightInput"></div>`);
  const ff = id => window.getComputedStyle(window.document.getElementById(id)).fontFamily;
  assert.strictEqual(ff('groceryAddInput'), 'var(--font-sans)');
  assert.strictEqual(ff('mySupplementAddInput'), 'var(--font-sans)');
  assert.strictEqual(ff('weightInput'), 'var(--font-mono)', 'a typed weight stays in the figure face');
  assert.strictEqual(declared('.weight-input-row input::placeholder', 'font-family'), 'var(--font-sans)');
  assert.ok(/id="groceryAddInput"[^>]*|type="text" id="groceryAddInput"/.test(src) && src.includes('class="weight-input-row"'), 'anchor: the real markup uses these classes');
});

test('REAL markup + CSSOM (v3.356): every sheet closes with a Done or Cancel text button, 44px tall', (assert)=>{
  const doc = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document;
  const closes = Object.fromEntries([...doc.querySelectorAll('.sub-modal-close')].map(b => [b.id, b.textContent.trim()]));
  assert.deepStrictEqual(closes, {subModalClose:'Cancel', exEditClose:'Cancel', globalSearchClose:'Cancel', exHistoryClose:'Done', whatsNewClose:'Done', navMoreClose:'Done'});
  assert.strictEqual(doc.getElementById('settingsClose').textContent.trim(), 'Done', 'anchor: matches Settings');
  assert.strictEqual(declared('.sub-modal-close', 'min-height'), '44px');
  assert.strictEqual(declared('.sub-modal-close', 'color'), 'var(--plate-blue)');
  assert.strictEqual(declared('.sub-modal-close', 'border-radius'), '', 'no circle');
});

test('REAL CSSOM (v3.357): unselected day dims its plate, not its label; chip tag is muted colour at full opacity', (assert)=>{
  const raw = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const { window } = new JSDOM(`<style>${raw}</style><div class="tabs">
    <button class="tab active" id="t1"><div class="plate" id="p1"></div><span class="plate-label" id="l1">Day 1</span></button>
    <button class="tab" id="t2"><div class="plate" id="p2"></div><span class="plate-label" id="l2">Day 2</span></button></div>
    <button class="set-chip"><span class="set-chip-tag" id="tag">DC</span></button>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('t2').opacity, '1', 'the tab itself is not dimmed');
  assert.strictEqual(cs('p2').opacity, '0.5', 'its plate is');
  assert.strictEqual(cs('p1').opacity, '1', 'the selected plate is not');
  assert.strictEqual(cs('l2').color, 'var(--text-muted)');
  assert.strictEqual(cs('tag').opacity, '1');
  assert.strictEqual(cs('tag').color, 'var(--text-muted)');
});

run();
