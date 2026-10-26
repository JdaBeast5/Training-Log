'use strict';
// v3.377 (owner: "fix the rest of the settings per the skills we talked
// about, they're oddly formatted"). Settings mixed four looks: bare switches
// with a second label above each, web-form dropdowns, one flat jump row, and
// three full cards (icon, big title, blue chevron) moved in from other tabs.
// It is now an iOS inset-grouped list (Apple HIG): per section a small
// header, ONE rounded group of rows with hairlines between them, then any
// footer note. Pickers are rows with the value on the right; the moved-in
// cards are disclosure rows whose summary hides while open (it repeated the
// detail below it — "Key saved — AI features ready" over "Connected").
//
// Confirmed in Chromium at 390px: every section renders as one group, rows
// start at one edge, "Load suggestions" no longer wraps or clips its value,
// and the empty "You" group (no profile yet) draws nothing. jsdom cannot
// match :has(), so those rules are checked as declared, not as computed.
//
// v3.378 — The AI row's wording was from when it did two things: "Powers Snap
// a Meal + Coaching video review", and a note promising a "free key". It now
// names what AI powers today, drops "free" (API use is billed), and closed
// with a key saved it reads "Connected" instead of repeating the row inside.
//
// v3.379 — Before the profile is set up it lives on Today, so "You" held only
// its footer. It now has a "Set up your profile" row (a data-jump-to row like
// Backup's) that hides once the finished profile moves into the slot.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractElementById, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-settings-grouped.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(extractElementById(src, 'settingsOverlay')).window.document;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window: cssWin } = new JSDOM(`<style>${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}</style>`);
function declared(selector, prop){
  let val = '';
  for(const sheet of cssWin.document.styleSheets) for(const rule of sheet.cssRules){
    if(rule.selectorText && rule.selectorText.split(/,(?![^(]*\))/).map(x => x.trim()).includes(selector)){
      const v = rule.style.getPropertyValue(prop); if(v) val = v;
    }
  }
  return val;
}

test('REAL markup: every section is header, one group, then (optionally) a footer note — no note above a group', (assert)=>{
  const sections = [...doc.querySelectorAll('.settings-panel-body > .settings-section')];
  assert.strictEqual(sections.length, 5, 'anchor: the five sections');
  for(const s of sections){
    const kids = [...s.children];
    const title = kids[0].textContent;
    assert.ok(kids[0].classList.contains('care-label'), `${title}: header first`);
    assert.strictEqual(s.querySelectorAll(':scope > .settings-group').length, 1, `${title}: one group`);
    assert.ok(kids[1].classList.contains('settings-group'), `${title}: the group straight after the header`);
    for(const k of kids.slice(2)) assert.ok(k.classList.contains('field-note'), `${title}: only footer notes after the group`);
  }
});

test('REAL markup: every startup slot, the rest-alert row and the backup row live inside a group', (assert)=>{
  for(const id of ['settingsWorkoutSlot', 'settingsUnitsSlot', 'settingsProfileSlot', 'settingsAiSlot', 'settingsMaintenanceSlot', 'settingsNotifyRow']){
    assert.ok(doc.getElementById(id).parentElement.classList.contains('settings-group'), id);
  }
  assert.ok(doc.querySelector('.settings-jump[data-jump-to="exportDataBtn"]').parentElement.classList.contains('settings-group'));
});

test('REAL CSSOM: groups are rounded and clip their rows; slots dissolve into them; rows share one padding and hairline', (assert)=>{
  assert.strictEqual(declared('.settings-group', 'border-radius'), '14px');
  assert.strictEqual(declared('.settings-group', 'overflow'), 'hidden');
  assert.strictEqual(declared('.settings-group > [id$="Slot"]', 'display'), 'contents');
  const row = '.settings-group > [id$="Slot"] > *';
  assert.strictEqual(declared(row, 'padding'), '10px 16px');
  assert.strictEqual(declared(row, 'border-top'), '1px solid var(--line)');
  assert.strictEqual(declared('.settings-group::before', 'height'), '1px', 'the first row\'s hairline is covered');
  assert.strictEqual(declared('.settings-section > .care-label:first-child', 'border-bottom'), '0px', 'headers lose the rule under them');
});

test('REAL CSSOM: switch rows drop their duplicate label; pickers are rows with the value on the right; cards are rows', (assert)=>{
  assert.strictEqual(declared('.settings-group > [id$="Slot"] > [id^="pref"]:has(> .save-to-library-label) > .care-label', 'display'), 'none');
  assert.strictEqual(declared('.settings-group > [id$="Slot"] > [id^="pref"]:has(> select)', 'display'), 'grid');
  assert.strictEqual(declared('.settings-panel-body .settings-group select', 'text-align'), 'right');
  assert.strictEqual(declared('.settings-panel-body .settings-group select', 'background-color'), 'transparent');
  assert.strictEqual(declared('.settings-panel-body .settings-group .card', 'box-shadow'), 'none');
  assert.strictEqual(declared('.settings-panel-body .settings-group .card', 'border-radius'), '0px');
  assert.strictEqual(declared('.settings-group .card .card-icon', 'display'), 'none', 'rows start at one edge');
  assert.strictEqual(declared('.settings-group .card:has(> .nutrition-header.open) > .nutrition-summary', 'display'), 'none');
  assert.strictEqual(declared('.settings-group:has(> [id$="Slot"]:only-child:empty)', 'display'), 'none');
});

test('REAL markup: the load-suggestion choices fit a picker row (no "(default)" suffix)', (assert)=>{
  const opts = [...new JSDOM(html).window.document.querySelectorAll('#loadModeSelect option')].map(o => o.textContent);
  assert.deepStrictEqual(opts, ['Double progression', 'RPE targets']);
});

test('REAL invocation (v3.378): the AI row\'s summary follows the key state, in current words', (assert)=>{
  const { window } = runJsdom(extractElementById(src, 'aiSettingsCard'), '', [extractFunction(src, 'showApiKeyConnected'), extractFunction(src, 'showApiKeySetup')]);
  const summary = window.document.getElementById('aiSettingsSummary');
  assert.strictEqual(summary.textContent, 'Coach chat, meal photos, form feedback and more', 'anchor: the shipped markup');
  window.showApiKeyConnected();
  assert.strictEqual(summary.textContent, 'Connected');
  assert.strictEqual(window.document.getElementById('aiKeyConnectedState').style.display, 'flex');
  window.showApiKeySetup();
  assert.strictEqual(summary.textContent, 'Coach chat, meal photos, form feedback and more');
  const note = window.document.querySelector('#aiSettingsCard .care-disclaimer').textContent;
  assert.doesNotMatch(note, /free key|routes through me/);
  assert.match(note, /console\.anthropic\.com/);
  assert.match(note, /stays on this device/, 'the storage promise is kept');
});

test('REAL markup + CSSOM (v3.379): "You" has a setup row that jumps to the real profile card, hidden once the profile is in the slot', (assert)=>{
  const row = doc.getElementById('settingsProfileSetup');
  assert.ok(row && row.parentElement.classList.contains('settings-group'));
  assert.strictEqual(row.dataset.jumpTo, 'profileCard');
  assert.ok(row.nextElementSibling && row.nextElementSibling.id === 'settingsProfileSlot', 'the slot follows it in the same group');
  assert.match(html, /<div class="card"[^>]*id="profileCard"|id="profileCard"/, 'the jump target exists');
  assert.strictEqual(declared('.settings-group:has(> #settingsProfileSlot > *) > #settingsProfileSetup', 'display'), 'none');
});

run();
