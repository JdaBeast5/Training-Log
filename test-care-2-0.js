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

// v3.450 — A stretch is a row you open. Its name took .ex-details' link blue
// (meant for the exercise list's small "Cues" toggle), so a list of
// stretches read as a list of links.
test('REAL invocation + CSSOM (v3.450): a stretch row\'s name is in the text colour; the exercise list\'s Cues toggle keeps its blue', (assert)=>{
  const { window } = runJsdom('<div id="o"></div>', `window.exerciseInfo = {'Pendulum Swings': {cues:['Let the arm hang'], videoQuery:'pendulum'}};`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'CARE_TYPE_TAG'),
     extractFunction(src, 'buildCareItemHtml'), "document.getElementById('o').innerHTML = buildCareItemHtml('Pendulum Swings');"]);
  const row = window.document.querySelector('details.care-details > summary');
  assert.ok(row, 'anchor: the real stretch row');
  const { window: w } = new JSDOM(`<style>${CSS}</style>${window.document.getElementById('o').innerHTML}<details class="ex-details"><summary id="cues">Cues</summary></details>`);
  assert.strictEqual(w.getComputedStyle(w.document.querySelector('.care-details > summary')).color, 'var(--text)');
  assert.notStrictEqual(w.getComputedStyle(w.document.getElementById('cues')).color, 'var(--text)', 'the Cues toggle is unchanged');
});

// v3.451 — Check-in rows. Every check-in's pain was red, 2/10 included. It
// now takes the slider's scale: muted up to 3, yellow 4–6, red 7+. The date
// reads in the text face with the pain at the row's end, and Edit loses its
// underline (a quiet text action, as its own comment intends).
test('REAL source (v3.451): the check-in pain colour follows its severity', (assert)=>{
  const fn = extractFunction(src, 'renderCare');
  const m = fn.match(/<span class="care-log-pain \$\{(e\.pain >= 7 \? 'is-high' : e\.pain >= 4 \? 'is-mid' : 'is-low')\}">/);
  assert.ok(m, 'the real class expression');
  const cls = new Function('e', 'return ' + m[1] + ';');
  assert.deepStrictEqual([1, 3, 4, 6, 7, 10].map(pain => cls({pain})), ['is-low', 'is-low', 'is-mid', 'is-mid', 'is-high', 'is-high']);
});

test('REAL CSSOM (v3.451): severity colours; date row in the text face with pain at its end; Edit not underlined', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div id="careView"><div class="care-log-date" id="d">Mon, Oct 26 <span class="care-log-pain is-low" id="l">2/10</span></div>
    <span class="care-log-pain is-mid" id="m">5/10</span><span class="care-log-pain is-high" id="h">8/10</span><button class="care-log-edit" id="e">Edit</button></div>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('l').color, 'var(--text-muted)');
  assert.strictEqual(cs('m').color, 'var(--plate-yellow)');
  assert.strictEqual(cs('h').color, 'var(--plate-red)');
  assert.strictEqual(cs('d').fontFamily, 'var(--font-sans)');
  assert.strictEqual(cs('d').justifyContent, 'space-between');
  assert.strictEqual(cs('e').textDecoration, 'none');
});

// v3.452 — "Save a summary for an appointment" borrowed "Mark … as resting"'s
// flat blue button; it is an occasional action, so Log's secondary pill.
test('REAL markup (v3.452): the appointment summary is the secondary pill, still hidden until there are check-ins', (assert)=>{
  const btn = doc.getElementById('careExport');
  assert.ok(btn.classList.contains('custom-toggle'));
  assert.strictEqual(btn.classList.contains('care-rest-btn'), false);
  assert.strictEqual(btn.style.display, 'none');
  assert.strictEqual(btn.textContent, 'Save a summary for an appointment');
});

// v3.453 — Pain Trend appears once there are two days to draw, Check-In
// History once there is a check-in. Empty, each was a whole card saying so;
// Saved Weeks and Analysis hide their empty cards the same way.
async function care(log){
  const { window } = runJsdom(`<div class="card" id="painCard"><div id="painChart"></div></div><div id="restingRegions"></div>
    <div class="card" id="histCard"><div id="careLogList"></div><button id="careExport"></button><div id="careExportNote"></div></div><div id="carePatterns"></div>`, `
    window.getInjuryLog = async ()=> ${JSON.stringify(log)}; window.getRestingRegions = async ()=> [];
    window.renderCareLogDayNote = ()=>{}; window.renderPainTrend = ()=>{}; window.buildSwipeItem = h => h;
    window.renderCollapsibleList = (el, items)=>{ el.innerHTML = items.join(''); }; window.wireSwipeDeleteList = ()=>{};
    window.fmtDayLabel = d => d; window.summarisePainByExercise = ()=> []; window.renderTodayInsights = ()=>{};
    window.SENSATION_LABELS = {ache:'Ache'}; window.icon = ()=> '';`,
    [extractFunction(src, 'escapeHtml'), extractFunction(src, 'fetchPainDays'), extractFunction(src, 'renderCare'), 'window.__done = renderCare();']);
  await window.__done;
  return window.document;
}
const CHECK = (date, pain) => ({date, exercise:'Bench Press', sensation:'ache', region:'Shoulder', pain, note:''});
test('REAL invocation (v3.453): no check-ins, neither card; one check-in, the history only; two days, the trend too', async (assert)=>{
  const none = await care([]);
  assert.strictEqual(none.getElementById('painCard').style.display, 'none');
  assert.strictEqual(none.getElementById('histCard').style.display, 'none');
  const one = await care([CHECK('2026-10-20', 4)]);
  assert.strictEqual(one.getElementById('painCard').style.display, 'none', 'one day is not a trend');
  assert.strictEqual(one.getElementById('histCard').style.display, '');
  const two = await care([CHECK('2026-10-20', 4), CHECK('2026-10-22', 3)]);
  assert.strictEqual(two.getElementById('painCard').style.display, '');
  assert.strictEqual(two.getElementById('histCard').style.display, '');
});

run();
