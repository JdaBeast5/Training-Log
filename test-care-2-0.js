'use strict';
// Care tab 2.0 (owner: "Care" — the Log/Analysis/History 2.0 passes, same
// skills). One increment per version. The disclaimer is left as it is: it
// was trimmed in an earlier pass, and test-concise-copy.js pins its safety
// phrases and length.
//
// v3.449 — The resting chip. "Shoulder ✕" was red underlined text and a red
// ✕ inside a yellow caution border. The border alone says "resting"; the
// region reads as a name, the ✕ as a quiet action.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractConst, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-care-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

test('REAL CSSOM (v3.449): the resting chip\'s name is text-coloured and not underlined; its clear mark is muted; the caution border stays', (assert)=>{
  const line = src.split('\n').find(l => l.includes('class="resting-chip"'));
  const [chip] = require('./testHelpers.js').runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')],
    "const r = 'Shoulder'; __capture.push(`" + line.trim() + "`);");
  const { window } = new JSDOM(`<style>${CSS}</style>${chip}`);
  const cs = sel => window.getComputedStyle(window.document.querySelector(sel));
  assert.strictEqual(cs('.resting-chip .link-btn').color, 'var(--text)');
  assert.strictEqual(cs('.resting-chip .link-btn').textDecoration, 'none');
  assert.strictEqual(cs('.resting-chip .clear-resting').color, 'var(--text-muted)');
  assert.match(CSS, /\.resting-chip\{[^}]*border:1px solid var\(--plate-yellow\)/, 'the caution border is kept');
});

run();
