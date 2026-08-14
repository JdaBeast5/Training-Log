'use strict';
// Behavioral coverage for the last item in this batch of the emoji-icon
// sweep: the Settings "Delete all my data" button. Unlike every other
// conversion in this codebase's history, this button's markup is STATIC
// HTML in index.html (not built from a JS template string), so it can't
// call icon('trash') at render time the way .ex-history-btn/.ex-edit-btn
// call icon('trend')/icon('edit') — this is the "third technique" flagged
// as needed in HANDOFF-v36 for the icon-only/icon+text mechanisms not to
// cover: the exact SVG markup icon('trash') would produce is embedded by
// hand, directly in the static button markup.
//
// ICONS.trash itself redraws the same trash artwork shared by
// .fi-delete::after / .ex-delete-custom-btn::after / .swipe-delete-bg::after
// at the ICONS object's own 24x24/stroke-2.2 convention — the same
// treatment 'edit' already got, so every "delete" affordance in the app
// (mask-image buttons and icon+text alike) reads as one glyph family.
const { readIndexSource, extractConst, extractFunction, extractElementById, runSandbox, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-delete-all-data-btn-glyph.js');

const iconsConstSrc = extractConst(src, 'ICONS');
const iconFnSrc = extractFunction(src, 'icon');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');

test('sabotage-relevant: ICONS carries a real, distinct trash SVG entry, not an empty/placeholder string', (assert)=>{
  assert.match(iconsConstSrc, /trash:\s*'<svg/, 'ICONS.trash must be a real inline SVG string');
  assert.match(iconsConstSrc, /M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2/, 'must be the actual trash-can lid path, not a placeholder');
});

test('REAL invocation: the real icon() function, run against the real ICONS table, returns actual working SVG markup for the new entry', (assert)=>{
  const captured = runSandbox([iconsConstSrc, escapeHtmlSrc, iconFnSrc], `
    __capture.push(icon('trash'));
  `);
  const trashHtml = captured[0];
  assert.match(trashHtml, /<svg width="1em" height="1em"/, 'icon(\'trash\') must inject the real default 1em sizing the helper always applies');
  assert.match(trashHtml, /aria-hidden="true"/, 'icon(\'trash\') must be aria-hidden, matching every other ICONS entry');
  assert.match(trashHtml, /M9 7V5a1 1 0 0 1 1-1h4/, 'icon(\'trash\') must actually contain the trash-can path');
});

test('REAL invocation: the real static deleteAllDataBtn markup embeds byte-identical output to icon(\'trash\'), and no longer shows the raw emoji', (assert)=>{
  const html = readIndexSource(); // extractElementById works on raw HTML text, not the concatenated-with-JS string, but the button lives in index.html itself so this is fine
  const btnHtml = extractElementById(html, 'deleteAllDataBtn');

  const captured = runSandbox([iconsConstSrc, escapeHtmlSrc, iconFnSrc], `
    __capture.push(icon('trash'));
  `);
  const expectedIconHtml = captured[0];

  assert.ok(btnHtml.includes(expectedIconHtml), 'the static button must embed exactly the markup icon(\'trash\') produces — a hand-copied SVG that drifts from the real ICONS.trash entry would fail this');
  assert.doesNotMatch(btnHtml, /\u{1F5D1}/u, 'the raw trash emoji character must be gone from the rendered button — this is the icon+text pattern, which fully replaces rather than collapses-and-keeps');
  assert.match(btnHtml, /Delete all my data \(this profile, permanently\)/, 'the visible text label must be unchanged');

  const dom = new JSDOM(`<!DOCTYPE html><body>${btnHtml}</body>`);
  const svg = dom.window.document.querySelector('#deleteAllDataBtn svg');
  assert.ok(svg, 'the button must contain a real <svg> icon element as a DOM node, not just as a text fragment');
});

run();
