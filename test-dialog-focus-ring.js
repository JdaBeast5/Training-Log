'use strict';
// v3.507 — No focus ring round a whole dialog (owner: "fix that blue focus
// line"). openSetSheet() focuses the set editor itself (tabindex="-1"), and
// the focus trap does the same for a dialog with nothing focusable. The
// keyboard-focus rule's [tabindex]:focus-visible drew a 2px ring round the
// entire sheet whenever the last input was a key. A dialog container is not a
// control: it loses the ring; its buttons and fields keep theirs.
//
// The real stylesheet is loaded into jsdom and its cascade checked through the
// CSSOM (jsdom computes no :focus-visible). Real-browser result (Chromium,
// 402x874, Tab pressed first so focus is keyboard-visible): the open set sheet
// is :focus-visible with outline-style none; Tab moves to Cancel, which shows
// the 2px solid ring.
const { readIndexSource, runJsdom, makeRunner } = require('./testHelpers.js');
const { test, run } = makeRunner('test-dialog-focus-ring.js');
const src = readIndexSource();
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>'));
const body = src.slice(src.indexOf('<body>'));
const { window } = runJsdom(`<style>${css}</style>` + body.replace(/<script[\s\S]*?<\/script>/g, ''), '', []);
const doc = window.document;

// Top-level style rules in order (media blocks hold none of these).
const rules = [...doc.styleSheets[0].cssRules].filter(r => r.selectorText);
const idx = pred => rules.findIndex(pred);
const selectors = r => r.selectorText.split(',').map(s => s.trim());

test('REAL stylesheet: one rule drops the outline on a focused dialog, after the [tabindex] ring rule it overrides', (assert)=>{
  const ring = idx(r => selectors(r).includes('[tabindex]:focus-visible'));
  const off = rules.filter(r => selectors(r).includes('[role="dialog"]:focus-visible'));
  assert.ok(ring >= 0, 'anchor: the keyboard ring rule was found');
  assert.strictEqual(rules[ring].style.outlineStyle || rules[ring].style.outline.split(' ')[1], 'solid');
  assert.strictEqual(off.length, 1);
  assert.strictEqual(off[0].style.outline, 'none');
  assert.ok(rules.indexOf(off[0]) > ring, 'later in the sheet, at equal specificity (0,2,0), so it wins');
  assert.deepStrictEqual(selectors(off[0]), ['[role="dialog"]:focus-visible'], 'nothing else is caught by it');
});

test('REAL markup: the set editor is a role=dialog, so the rule reaches it; the controls inside are not dialogs', (assert)=>{
  const sheet = doc.getElementById('setSheet');
  assert.ok(sheet.matches('[role="dialog"][tabindex="-1"]'));
  const controls = [...sheet.querySelectorAll('button, input')];
  assert.ok(controls.length >= 5, 'anchor: its buttons and fields were found');
  for(const c of controls) assert.ok(!c.matches('[role="dialog"]'), `${c.id || c.className} keeps the ring`);
});

test('REAL markup: every dialog the focus trap may focus is a role=dialog container, never a control', (assert)=>{
  const dialogs = [...doc.querySelectorAll('[role="dialog"]')];
  assert.ok(dialogs.length >= 8, 'anchor: the overlays were found');
  for(const d of dialogs) assert.ok(!/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(d.tagName), `${d.id} is a container`);
});

run();
