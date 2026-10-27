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
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

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

// v3.459 — The masterclass index as a list. Thirteen boxed, bordered tiles
// sat inside the card, under technique groups that are plain hairline rows.
// They are now rows too; yours is marked by a blue "In your program" note in
// the text face (it was mono, on a tinted, glowing tile).
test('REAL CSSOM (v3.459): an index row is a plain 44px row with a hairline, no box; the note is in the text face', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><button class="masterclass-index-btn current" id="b"><span>Strength</span><span class="mc-index-meta" id="m">In your program</span></button>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('b').backgroundImage, 'none', 'no tinted tile for yours');
  assert.strictEqual(cs('b').borderTopStyle, 'none');
  // jsdom drops a border shorthand holding var(); read it as declared.
  assert.match(CSS, /\.masterclass-index-btn\{[^}]*background:none; border:none; border-bottom:1px solid var\(--line-soft\);/);
  assert.strictEqual(cs('b').paddingLeft, '0px', 'aligned to the card, like the rows above');
  assert.strictEqual(cs('b').minHeight, '44px');
  assert.strictEqual(cs('b').boxShadow, '');
  assert.strictEqual(cs('m').fontFamily, 'var(--font-sans)');
  assert.match(CSS, /\.masterclass-index-btn\.current \.mc-index-meta\{ color:var\(--plate-blue\); \}/);
});

test('REAL invocation (v3.459): every masterclass gets a row; only yours carries the note', (assert)=>{
  const { window } = runJsdom('<div id="masterclassIndex"></div>', `
    window.MASTERCLASS_LIBRARY = {a:{label:'Posing Practice'}, b:{label:'Strength Training Fundamentals'}, c:{label:'Cycling'}};
    window.PROGRAM_MASTERCLASS = {s:{cardId:'b'}}; window.activeProgram = 's';
    window.isMasterclassOpen = id => id === 'c'; window.toggleMasterclass = ()=>{};`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractFunction(src, 'renderMasterclassIndex'), 'renderMasterclassIndex();']);
  const rows = [...window.document.querySelectorAll('#masterclassIndex .masterclass-index-btn')];
  assert.strictEqual(rows.length, 3);
  assert.deepStrictEqual(rows.map(r => r.querySelector('.mc-index-meta').textContent.trim()), ['', 'In your program', 'Open · tap to close']);
  assert.deepStrictEqual(rows.map(r => r.classList.contains('current')), [false, true, false]);
});

// v3.460 — No gap under a closed card. The hint's 14px margin sat under it
// with the list closed, leaving the card bottom-heavy (36px under the hint,
// 22px over the title). It goes while the list is closed.
test('REAL CSSOM (v3.460): the hint has no bottom margin while the list is closed, its usual margin while open', (assert)=>{
  const page = open => new JSDOM(`<style>${CSS}</style><div class="card" id="researchSourcesCard"><div class="history-hint" id="h">x</div><!-- note --><div class="expand-wrap${open ? ' open' : ''}"><div></div></div></div><div class="history-hint" id="other">y</div>`).window;
  const mb = (w, id) => w.getComputedStyle(w.document.getElementById(id)).marginBottom;
  assert.strictEqual(mb(page(false), 'h'), '0px');
  assert.strictEqual(mb(page(true), 'h'), '14px');
  assert.strictEqual(mb(page(false), 'other'), '14px', 'other hints keep theirs');
});

// v3.461 — Research & Sources as a list too. Opened, it was ~55 boxed tiles
// (a style's tiles boxed again inside its program's). They are now the same
// plain rows as the masterclass index; a style's rows stay indented.
test('REAL CSSOM (v3.461): a source row is a plain 44px row, no box; nested rows indent; closed panels add no gap', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div id="researchSourcesList"><div class="source-program-group">
    <div class="source-row"><button class="program-basis-toggle" id="p">Boxing</button><div class="smooth-toggle" id="t"><div></div></div></div>
    <div class="source-row source-row-nested" id="nr"><button class="program-basis-toggle" id="n">Muay Thai</button><div class="smooth-toggle open" id="o"><div></div></div></div>
  </div></div><button class="program-basis-toggle" id="elsewhere">Based on</button>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('p').paddingLeft, '0px');
  assert.strictEqual(cs('p').minHeight, '44px');
  assert.strictEqual(cs('p').marginBottom, '0px');
  assert.strictEqual(cs('p').fontSize, '15px');
  assert.strictEqual(cs('n').fontSize, '14px');
  assert.strictEqual(cs('nr').marginLeft, '14px', 'a style sits under its program');
  assert.strictEqual(cs('t').marginBottom, '0px', 'a closed panel leaves no gap between rows');
  assert.strictEqual(cs('o').marginBottom, '10px');
  assert.strictEqual(cs('elsewhere').paddingTop, '4px', 'the toggle elsewhere keeps its own look');
  assert.match(CSS, /#researchSourcesList \.program-basis-toggle\{[^}]*background:none; border:none; border-bottom:1px solid var\(--line-soft\);/);
  assert.doesNotMatch(CSS, /#researchSourcesList \.source-row-nested \.program-basis-toggle\{[^}]*background/);
});

run();
