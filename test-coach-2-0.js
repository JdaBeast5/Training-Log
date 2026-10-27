'use strict';
// Coach tab 2.0 (owner: "Now the coach tab with our skills"). One increment
// per version. Card order is left as test-coach-tab-order.js pins it.
//
// v3.454 — Name the movement first. Choosing a clip starts the review at
// once, and the change handler reads the exercise and focus fields at that
// moment — but the fields sat below the upload button, so uploading first
// (the order on screen) sent "this movement" and no focus.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, runJsdom } = require('./testHelpers.js');

const { test, run } = makeRunner('test-coach-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const before = (a, b) => !!(a.compareDocumentPosition(b) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);

test('REAL markup + source (v3.454): the exercise and focus fields come before the upload button that starts the review', (assert)=>{
  const btn = doc.getElementById('coachVideoBtn');
  for(const id of ['coachExerciseInput', 'coachFocusInput']) assert.ok(before(doc.getElementById(id), btn), id + ' before the button');
  assert.ok(before(btn, doc.getElementById('coachResult')), 'the result follows the button');
  const start = src.indexOf("document.getElementById('coachVideoInput').addEventListener('change'");
  const handler = src.slice(start, start + 600);
  assert.match(handler, /getElementById\('coachExerciseInput'\)\.value/, 'anchor: the review reads the fields as soon as a clip is chosen');
  assert.match(handler, /getElementById\('coachFocusInput'\)\.value/);
});

// v3.455 — Ask Your Coach said one thing twice: a hint ("Ask about training,
// nutrition or recovery — the coach already knows your goal and program")
// over an empty conversation saying the same. The empty conversation (shared
// with the floating chat) keeps it. "Clear conversation" shows only when there
// is one.
function chat(history){
  const { window } = runJsdom('<div id="coachChatLog"></div><div id="floatingChatLog"></div><button id="coachChatClear">Clear conversation</button>',
    `var coachChatHistory = ${JSON.stringify(history)};`, [extractFunction(src, 'escapeHtml'), extractFunction(src, 'renderCoachChatLog'), 'renderCoachChatLog();']);
  return window.document;
}
test('REAL invocation (v3.455): Clear is hidden on an empty conversation and shown once there is one; both logs render', (assert)=>{
  const empty = chat([]);
  assert.strictEqual(empty.getElementById('coachChatClear').style.display, 'none');
  assert.match(empty.getElementById('coachChatLog').textContent, /Ask something about your training/);
  assert.match(empty.getElementById('floatingChatLog').textContent, /Ask something about your training/);
  const some = chat([{role:'user', content:'How much protein?'}, {role:'assistant', content:'About 1.6 g/kg.'}]);
  assert.strictEqual(some.getElementById('coachChatClear').style.display, '');
  assert.strictEqual(some.querySelectorAll('#coachChatLog .coach-chat-bubble').length, 2);
  assert.strictEqual(some.querySelectorAll('#floatingChatLog .coach-chat-bubble').length, 2);
});

test('REAL markup (v3.455): the chat card no longer repeats the empty conversation\'s line as a hint', (assert)=>{
  const card = doc.getElementById('coachChatLog').closest('.card');
  assert.strictEqual(card.querySelector('.history-hint'), null);
});

// v3.456 — Past Reviews appears once there is a review; empty, it was a whole
// card saying so, right under the form a review comes from. Its dates read in
// the text face (Care's check-ins did in v3.451; the two share the row class).
async function coach(log, key){
  const { window } = runJsdom('<button id="coachKeySetup" hidden></button><b id="coachPersonaLabel"></b><div class="card" id="c"><div id="coachHistoryList"></div></div>', `
    window.activeProgram = 'strength'; window.programs = {strength:{label:'Strength'}}; window.getApiKey = async ()=> window.__key || '';
    window.getCoachLog = async ()=> ${JSON.stringify(log)}; window.loadCoachChatHistory = async ()=>{}; window.renderCoachChatLog = ()=>{};
    window.buildSwipeItem = h => h; window.renderCollapsibleList = (el, items)=>{ el.innerHTML = items.join(''); };
    window.wireSwipeDeleteList = ()=>{}; window.fmtDayLabel = d => d;`,
    [extractFunction(src, 'escapeHtml'), `window.__key = ${JSON.stringify(key || '')};`, extractFunction(src, 'renderCoach'), 'window.__done = renderCoach();']);
  await window.__done;
  return window.document;
}
test('REAL invocation (v3.456): no reviews, no card; one review, the card shows it', async (assert)=>{
  assert.strictEqual((await coach([])).getElementById('c').style.display, 'none');
  const one = await coach([{date:'2026-10-24', program:'Strength', exercise:'Back Squat', feedback:'Depth is good.'}]);
  assert.strictEqual(one.getElementById('c').style.display, '');
  assert.match(one.getElementById('coachHistoryList').textContent, /Back Squat/);
});

test('REAL CSSOM (v3.456): a past review\'s date is in the text face', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div id="coachView"><div class="care-log-date" id="d">Sat, Oct 24</div></div>`);
  assert.strictEqual(window.getComputedStyle(window.document.getElementById('d')).fontFamily, 'var(--font-sans)');
});

// v3.457 — No key, a way to add one. With no API key saved, every AI action
// on the tab failed and only then offered "Take me there"; the top note just
// named the menu path. The note now carries "Add your API key" (the same
// data-jump-to="aiSettingsCard" route aiKeySetupPrompt uses) while no key is
// saved, and drops it once one is.
test('REAL invocation (v3.457): "Add your API key" shows with no key and hides with one', async (assert)=>{
  assert.strictEqual((await coach([])).getElementById('coachKeySetup').hidden, false);
  assert.strictEqual((await coach([], 'sk-ant-xxx')).getElementById('coachKeySetup').hidden, true);
});

test('REAL markup (v3.457): the link sits in the top note and routes to the AI key setting', (assert)=>{
  const link = doc.getElementById('coachKeySetup');
  assert.ok(link.closest('.care-disclaimer-card'));
  assert.strictEqual(link.getAttribute('data-jump-to'), 'aiSettingsCard');
  assert.ok(doc.getElementById('aiSettingsCard'), 'anchor: the target exists');
  assert.ok(link.hasAttribute('hidden'), 'hidden until renderCoach decides');
});

test('REAL CSSOM (v3.457): the key button is the secondary pill in the link colour, set apart from the note, and gone when hidden', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><button class="custom-toggle coach-key-link" id="k">Add your API key</button><button class="custom-toggle coach-key-link" id="h" hidden>x</button>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('k').color, 'var(--plate-blue)');
  assert.strictEqual(cs('k').marginTop, '8px');
  assert.strictEqual(cs('h').display, 'none');
});

run();
