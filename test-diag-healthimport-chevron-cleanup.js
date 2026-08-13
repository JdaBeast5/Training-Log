'use strict';
// Regression coverage for a dead-code removal: the diagHeader/healthImportHeader
// click handlers used to call
//   document.getElementById('diagChevron').classList.toggle('open', isOpen)
// (and the healthImportChevron equivalent) directly on the chevron <span>
// itself. No CSS rule anywhere in the file targets a bare `.ex-chevron.open`
// (or `#diagChevron.open`) — every chevron-rotation rule is ancestor-scoped
// (`.nutrition-header.open .ex-chevron`, `.exercise-block.open .ex-chevron`,
// `.masterclass-index-btn.opened .ex-chevron`), and the ancestor's `.open` is
// already toggled on the header element in the same handler. So those two
// direct toggle calls were confirmed no-ops (full-file grep, device-backlog
// audit, Training Log v3.169) and removed here. This test proves both halves
// of that reasoning with real code, not just the grep: the wiring no longer
// touches the chevron directly, AND the chevron still visibly rotates via
// the ancestor .open class alone.
const { readIndexSource, extractElementById, extractFunction, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-diag-healthimport-chevron-cleanup.js');

// Same technique as test-history-log-collapse.js/test-nav-more-panel.js: the
// header click handlers are top-level `addEventListener` statements, not
// named functions/consts, so extractFunction/extractConst can't reach them.
function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[\\s\\S]*?\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0];
}

const diagWiringSrc = extractStatement(src, "document.getElementById('diagHeader').addEventListener('click'");
const healthImportWiringSrc = extractStatement(src, "document.getElementById('healthImportHeader').addEventListener('click'");
const setCardOpenStateSrc = extractFunction(src, 'setCardOpenState');

const diagHeaderHtml = extractElementById(src, 'diagCard');
const healthImportHeaderHtml = extractElementById(src, 'healthImportCard');

const chevronBaseCss = extractRuleBlock(src, '.ex-chevron');
const nutritionHeaderOpenChevronCss = extractRuleBlock(src, '.nutrition-header.open .ex-chevron');

function storageGlobals(){
  return `window.storage = { set: async ()=>{} };`;
}

// --- Dead-code removal itself --------------------------------------------

test('sabotage-relevant: the diagHeader click handler no longer references diagChevron at all', (assert)=>{
  assert.ok(diagWiringSrc.includes("getElementById('diagHeader')"), 'still toggles the real header');
  assert.ok(diagWiringSrc.includes("getElementById('diagExpandWrap')"), 'still toggles the real expand-wrap');
  assert.ok(diagWiringSrc.includes("setCardOpenState('diag'"), 'still persists via the real setCardOpenState');
  assert.strictEqual(diagWiringSrc.includes('diagChevron'), false, 'the no-op direct chevron toggle must be gone');
});

test('sabotage-relevant: the healthImportHeader click handler no longer references healthImportChevron at all', (assert)=>{
  assert.ok(healthImportWiringSrc.includes("getElementById('healthImportHeader')"), 'still toggles the real header');
  assert.ok(healthImportWiringSrc.includes("getElementById('healthImportExpandWrap')"), 'still toggles the real expand-wrap');
  assert.ok(healthImportWiringSrc.includes("setCardOpenState('healthImport'"), 'still persists via the real setCardOpenState');
  assert.strictEqual(healthImportWiringSrc.includes('healthImportChevron'), false, 'the no-op direct chevron toggle must be gone');
});

// --- REAL invocation: chevron still rotates via the ancestor class alone --

test('REAL invocation: clicking the real diagHeader rotates the real #diagChevron purely through the ancestor .nutrition-header.open rule', (assert)=>{
  const dom = new JSDOM(
    `<!DOCTYPE html><style>${chevronBaseCss}\n${nutritionHeaderOpenChevronCss}</style><body>${diagHeaderHtml}</body>`,
    { runScripts: 'dangerously', pretendToBeVisual: true }
  );
  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = [storageGlobals(), setCardOpenStateSrc, diagWiringSrc].join('\n\n');
  dom.window.document.body.appendChild(scriptEl);

  const header = dom.window.document.getElementById('diagHeader');
  const chevron = dom.window.document.getElementById('diagChevron');
  assert.strictEqual(dom.window.getComputedStyle(chevron).transform, 'none', 'starts unrotated');
  assert.strictEqual(chevron.classList.contains('open'), false, 'the chevron itself must never gain .open — the ancestor carries the state');

  header.dispatchEvent(new dom.window.Event('click', {bubbles:true}));

  assert.strictEqual(header.classList.contains('open'), true);
  assert.strictEqual(chevron.classList.contains('open'), false, 'still no .open on the chevron after the click — rotation comes from the ancestor selector alone');
  assert.notStrictEqual(dom.window.getComputedStyle(chevron).transform, 'none', 'the chevron visibly rotates anyway, proven via getComputedStyle through the real ancestor-scoped rule');
});

test('REAL invocation: clicking the real healthImportHeader rotates the real #healthImportChevron purely through the ancestor .nutrition-header.open rule', (assert)=>{
  const dom = new JSDOM(
    `<!DOCTYPE html><style>${chevronBaseCss}\n${nutritionHeaderOpenChevronCss}</style><body>${healthImportHeaderHtml}</body>`,
    { runScripts: 'dangerously', pretendToBeVisual: true }
  );
  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = [storageGlobals(), setCardOpenStateSrc, healthImportWiringSrc].join('\n\n');
  dom.window.document.body.appendChild(scriptEl);

  const header = dom.window.document.getElementById('healthImportHeader');
  const chevron = dom.window.document.getElementById('healthImportChevron');
  assert.strictEqual(dom.window.getComputedStyle(chevron).transform, 'none', 'starts unrotated');

  header.dispatchEvent(new dom.window.Event('click', {bubbles:true}));

  assert.strictEqual(header.classList.contains('open'), true);
  assert.strictEqual(chevron.classList.contains('open'), false, 'still no .open on the chevron after the click — rotation comes from the ancestor selector alone');
  assert.notStrictEqual(dom.window.getComputedStyle(chevron).transform, 'none', 'the chevron visibly rotates anyway, proven via getComputedStyle through the real ancestor-scoped rule');
});

run();
