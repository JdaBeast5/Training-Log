'use strict';
// v3.608 (UX-28): Training Style and Keep In Mind leave Today. The Training
// Style card (#programCard: #programHeader, #programSelector, its overview and
// "What this is based on") is reparented into Settings' new "Program" section
// by the real wireSettings, ids and handlers unchanged. Keep In Mind (#tipsCard)
// sits at the end of Progress's Insights group. Global search reads the DOM
// (collectSearchSections), so "Go to" follows both.
//
// Real invocation: the real page markup (scripts stripped), the real
// wireSettings IIFE, the real renderProgramSelector (its program-switch
// handler), the real collectSearchSections and SEARCH_TAB_LABELS, the real
// harness STORE_STEPS.program.
//
// Sabotage: skip the reparent (drop the move line) and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractIIFE, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-relocations.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const BODY = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;

// Everything renderProgramSelector calls besides the switch itself is a stub
// that only counts; the program data is two small programs.
const RPS_CALLS = ['computeTodaysFoodTotals', 'getCurrentTrendStatus', 'loadDayOrder', 'loadWeekProgress', 'renderCustomProgramList', 'renderDaysPerWeekWarning',
  'renderMedicalNutrientBars', 'renderProgramRec', 'renderProgramSource', 'renderTabs', 'renderTips', 'renderWorkout', 'saveActiveProgram', 'triggerCelebration',
  'updateMasterclassLinkBtn', 'toggleConditionTrackerCards'];
const TOGGLES = [...new Set((extractFunction(src, 'renderProgramSelector').match(/\btoggle[A-Za-z]+Card\b/g) || []))];
function mount({wire = true} = {}){
  const { window } = runJsdom(BODY, `
    window.__calls = {};
    ${[...RPS_CALLS, ...TOGGLES].filter((n, i, a) => a.indexOf(n) === i).map(n => `function ${n}(){ window.__calls.${n} = (window.__calls.${n} || 0) + 1; }`).join('\n')}
    async function scoreAllPrograms(){ return {strength: 90, ppl: 80}; }
    function isCustomProgramKey(){ return false; }
    var userProfile = {}, activeProgram = 'strength', activeMedicalStyle = '', activeDay = 'd1';
    var programs = { strength: {label: 'Strength & Size', short: 'Strength.', overview: 'Four days.', days: {d1: {label: 'Day 1'}}},
                     ppl: {label: 'Push Pull Legs', short: 'PPL.', overview: 'Six days.', days: {d1: {label: 'Day 1'}}} };
    var dayDefs = programs.strength.days;
    function restNotificationsSupported(){ return false; } function refreshHealthImportSummary(){} function renderTrainingSince(){} /* v3.633 (BIZ-19) */`,
    [extractFunction(src, 'renderProgramSelector'), wire ? extractIIFE(src, 'wireSettings') + '\nwireSettings();' : '',
     extractConst(src, 'SEARCH_TAB_LABELS'), extractFunction(src, 'collectSearchSections'),
     'window.__ready = renderProgramSelector();']);
  return window;
}

test('criterion 1: after the real wireSettings, #programSelector is inside #settingsOverlay (Program), once; changing it runs the real program switch once', async (assert)=>{
  const window = mount();
  await window.__ready;
  const doc = window.document;
  const sel = doc.getElementById('programSelector');
  assert.strictEqual(doc.querySelectorAll('#programSelector').length, 1, 'exactly once');
  assert.ok(sel.closest('#settingsOverlay'), 'inside Settings');
  assert.ok(sel.closest('#settingsProgramSlot'), 'in the Program section');
  assert.strictEqual(doc.getElementById('settingsProgramSlot').closest('.settings-section').querySelector('.care-label').textContent, 'Program');
  assert.ok(!doc.querySelector('#todayView #programHeader'), 'the card left Today');
  const sections = [...doc.querySelectorAll('.settings-panel-body > .settings-section > .care-label')].map(l => l.textContent);
  assert.strictEqual(sections.indexOf('Program'), sections.indexOf('You') + 1, 'right after You (the profile)');
  assert.ok([...sel.options].some(o => o.value === 'ppl'), 'anchor: the real renderProgramSelector filled it');
  sel.value = 'ppl';
  sel.dispatchEvent(new window.Event('change'));
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(window.__calls.saveActiveProgram, 1, 'the program switch ran once');
  assert.strictEqual(window.eval('activeProgram'), 'ppl');
  assert.strictEqual(doc.getElementById('programSelectDesc').textContent, 'PPL.', 'the description in the card updated in place');
});

test('criterion 2: #tipsAlways is inside #analysisView, once, at the end of the Insights group (just before Body & Health)', (assert)=>{
  const { document } = new JSDOM(`<body>${BODY}</body>`).window;
  assert.strictEqual(document.querySelectorAll('#tipsAlways').length, 1);
  const card = document.getElementById('tipsAlways').closest('.card');
  assert.ok(card.closest('#analysisView'), 'on Progress');
  assert.strictEqual(card.parentElement.id, 'analysisView', 'a direct child (the group collapse and search read those)');
  assert.ok(!document.querySelector('#todayView #tipsAlways'), 'not on Today');
  const next = card.nextElementSibling;
  assert.ok(next.matches('.analysis-group-header[data-group="body-health"]'), 'the last card of Insights');
  let prevHeader = card.previousElementSibling;
  while(prevHeader && !prevHeader.matches('.analysis-group-header')) prevHeader = prevHeader.previousElementSibling;
  assert.strictEqual(prevHeader.dataset.group, 'insights');
});

test('criterion 3: global search finds "Training Style" in Settings and "Keep In Mind" on Progress (the real collectSearchSections), each jumping to an id that exists', async (assert)=>{
  const window = mount();
  await window.__ready;
  const sections = window.collectSearchSections();
  const ts = sections.find(x => /Training Style/.test(x.title)), kim = sections.find(x => /Keep In Mind/.test(x.title));
  assert.ok(ts && kim, 'both are found');
  assert.strictEqual(ts.tab, 'settings', 'Training Style: Settings');
  assert.strictEqual(kim.tab, 'analysis', 'Keep In Mind: Progress');
  assert.ok(window.document.getElementById(ts.id).closest('#settingsOverlay'));
  assert.ok(window.document.getElementById(kim.id).closest('#analysisView'));
  assert.ok(!sections.some(x => x.tab === 'today' && /Training Style|Keep In Mind/.test(x.title)), 'neither is listed under Today any more');
});

test('criterion 4: changing program takes 2 taps (the Settings icon, then the select; the new ceiling, a relocation agreed in the vision)', async (assert)=>{
  const PARENT = 2; // 2026-11-22 (v3.608, UX-28): see test-tap-counts.js PARENT_TAPS.changeProgram
  const window = mount();
  await window.__ready;
  const doc = window.document;
  let taps = 0;
  doc.getElementById('settingsCog').click(); taps++;
  assert.ok(doc.getElementById('settingsOverlay').classList.contains('active'), 'Settings opened');
  const sel = doc.getElementById('programSelector');
  sel.value = 'ppl'; sel.dispatchEvent(new window.Event('change')); taps++;
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(window.__calls.saveActiveProgram, 1);
  assert.ok(taps <= PARENT, `${taps} > ${PARENT}`);
});

test('criterion 5: the store frame for the program (STORE_STEPS.program) opens Settings first and still finds #programHeader', (assert)=>{
  const harness = fs.readFileSync(path.join(__dirname, 'tools/visual/harness.js'), 'utf8');
  const start = harness.indexOf('  program: () => {');
  const body = harness.slice(start, harness.indexOf('\n  },', start) + 4);
  assert.ok(start > 0 && /settingsCog/.test(body), 'it opens Settings first');
  const window = mount();
  const step = window.eval('(' + body.replace(/^\s*program:\s*/, '').replace(/,\s*$/, '') + ')');
  const card = step();
  assert.ok(window.document.getElementById('settingsOverlay').classList.contains('active'), 'Settings is open for the shot');
  assert.ok(card && card.id === 'programCard' && card.contains(window.document.getElementById('programHeader')), 'it returns the Training Style card');
});

test('UX-32: in Settings the program picker shows one arrow (the Settings mark), full width, the name in the ink (the real wireSettings, the real stylesheet)', (assert)=>{
  const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const { window } = runJsdom(`<style>${CSS}</style>` + BODY, `function restNotificationsSupported(){ return false; } function refreshHealthImportSummary(){} function renderTrainingSince(){} /* v3.633 (BIZ-19) */`,
    [extractIIFE(src, 'wireSettings') + '\nwireSettings();']);
  const doc = window.document, sel = doc.getElementById('programSelector');
  assert.ok(sel.closest('#settingsProgramSlot'), 'anchor: the picker is in Settings');
  const cs = window.getComputedStyle(sel);
  const rules = []; const walk = l => { for(const r of l){ if(r.selectorText) rules.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const sh of doc.styleSheets) walk(sh.cssRules);
  // The Settings mark: jsdom's computed background-image is wiped by .program-select's lower-specificity
  // background:var() shorthand (a browser keeps it), so this reads the rule that wins on the image.
  const mark = rules.find(r => r.selectorText === '.settings-panel-body .settings-group select');
  assert.ok(sel.matches(mark.selectorText) && /data:image\/svg\+xml/.test(mark.style.getPropertyValue('background-image')), 'the Settings up/down mark applies');
  const matches = (el, selText) => selText.split(/,(?![^(]*\))/).some(t => { try{ return el.matches(t.trim()); }catch(e){ return false; } });
  assert.ok(!rules.some(r => r !== mark && matches(sel, r.selectorText) && /url\(/.test(r.style.getPropertyValue('background-image'))), 'and no second arrow image');
  // jsdom computes no pseudo-elements: the card's chevron is the wrap's ::after, hidden by the one rule for it here.
  const hide = rules.filter(r => r.selectorText === '#settingsProgramSlot .program-select-wrap::after');
  assert.strictEqual(hide.length, 1);
  assert.strictEqual(hide[0].style.getPropertyValue('display'), 'none', 'the card\'s own chevron is hidden');
  assert.ok(sel.parentElement.matches('#settingsProgramSlot .program-select-wrap'), 'and it is this picker\'s wrap');
  assert.strictEqual(cs.maxWidth, 'none', 'full width');
  assert.strictEqual(cs.textAlign, 'left');
  assert.strictEqual(cs.color, 'var(--text)', 'the name in the ink');
  // On Today (where the card no longer lives) the chevron rule is untouched.
  assert.ok(rules.some(r => r.selectorText === '.program-select-wrap::after' && /var\(--plate-blue\)/.test(r.style.cssText)), 'the base chevron rule still exists for other pickers');
});

run();
