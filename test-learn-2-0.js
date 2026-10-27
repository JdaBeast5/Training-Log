'use strict';
// Learn tab 2.0 (owner: "Let's do it" — the Learn pass, same skills as the
// other tabs). One increment per version. Card order is left as
// test-learn-tab-card-order.js pins it (your program's masterclass first, the
// All Masterclasses index last).
//
// v3.458 — Research & Sources closed by default. Open, its ~55 rows were most
// of the tab's 11,000px and sat between your masterclass and the index of
// all of them. It now uses the collapsible-card pattern every long card in
// the app uses (nutrition-header + expand-wrap, PERSISTENT_CARDS, default
// closed), keeping its one-line hint visible.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractConst, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-learn-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;

test('REAL markup (v3.458): a collapsible header and an expand-wrap holding the list; the hint stays outside it', (assert)=>{
  const header = doc.getElementById('researchSourcesHeader');
  const wrap = doc.getElementById('researchSourcesExpandWrap');
  assert.ok(header.classList.contains('nutrition-header'));
  assert.ok(wrap.classList.contains('expand-wrap'));
  assert.ok(wrap.contains(doc.getElementById('researchSourcesList')));
  assert.strictEqual(header.classList.contains('open') || wrap.classList.contains('open'), false, 'closed in the markup');
  const hint = doc.querySelector('#researchSourcesCard > .history-hint');
  assert.ok(hint && !wrap.contains(hint), 'the hint shows while closed');
  assert.ok(doc.getElementById('researchSourcesChevron'));
});

test('REAL invocation (v3.458): researchSources is a persistent card that defaults closed and restores an explicit open', async (assert)=>{
  const consts = extractConst(src, 'PERSISTENT_CARDS');
  assert.match(consts, /'researchSources'/);
  const mk = stored => runJsdom('<div id="researchSourcesHeader"></div><div id="researchSourcesExpandWrap"></div>', `
    window.storage = { get: async k => { const v = ${JSON.stringify(stored)}[k]; if(v === undefined) throw new Error('missing'); return {value:v}; } };`,
    [consts, extractFunction(src, 'getCardOpenState'), extractFunction(src, 'restoreCardOpenStates'), 'window.__done = restoreCardOpenStates();']);
  const closed = mk({}); await closed.window.__done;
  assert.strictEqual(closed.window.document.getElementById('researchSourcesExpandWrap').classList.contains('open'), false, 'default closed');
  const opened = mk({'card-open:researchSources':'true'}); await opened.window.__done;
  assert.ok(opened.window.document.getElementById('researchSourcesExpandWrap').classList.contains('open'), 'an explicit open is restored');
});

test('REAL source (v3.458): the header toggles both and stores the choice, like historyLog\'s', (assert)=>{
  const start = src.indexOf("document.getElementById('researchSourcesHeader').addEventListener('click'");
  assert.ok(start > 0);
  const h = src.slice(start, start + 400);
  assert.match(h, /researchSourcesHeader'\)\.classList\.toggle\('open'\)/);
  assert.match(h, /researchSourcesExpandWrap'\)\.classList\.toggle\('open'\)/);
  assert.match(h, /setCardOpenState\('researchSources', isOpen\)/);
});

run();
