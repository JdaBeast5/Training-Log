'use strict';
// The 2.0 pass (owner: "consider the apple design with impeccable and the other
// skills we've been using across the whole app to make it a 2.0 version …
// while keeping the continuity of the app across every page, tab, and window").
// One building block per job, the same on every screen; each increment adds
// its test here.
//
// v3.305 — Large titles stand alone (Apple HIG): the profile line and the
// streak belong to Today; every other tab's header is just its title, search
// and settings. Before, both repeated under every tab.
// v3.306 — The More sheet is an inset grouped list (Apple HIG): each row a
// drawn icon, its name, one line on what is inside, and a chevron; 60px rows.
// Before: three bare words.
// v3.307 — Settings on a phone is a bottom sheet with a grabber and a "Done"
// button (Apple HIG sheets), and on/off settings are iOS switches announced as
// switches. Before: a card dropped from the cog, checkboxes, and a ✕.
// v3.308 — One notice style (neutral glass, hairline, drawn leading icon) for
// privacy notes and safety disclaimers, and one secondary button (glass pill,
// drawn icon) for the upload buttons. Before: green boxes with a green glow and
// a lock emoji, yellow-outlined cards, dashed blue boxes with emoji.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-app-2-0.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');

test('REAL invocation (v3.305): switchView makes the header compact everywhere but Today, and back again', (assert)=>{
  const keys = ['today','log','analysis','history','care','coach','learn'];
  const markup = '<header><h1 id="viewTitle">Today</h1><div class="sub" id="headerSub">x</div><div class="streak-badge" id="streakBadge">1 day</div></header><button id="navMore"></button><div id="stickyDayHeader"></div><div id="logDateBar"></div>'
    + keys.map(k => `<div id="${k}View"><div class="card"></div></div><button id="nav${k[0].toUpperCase()+k.slice(1)}"></button>`).join('');
  const { window } = runJsdom(markup, `
    window.storage = { set(){}, get: async ()=>{ throw new Error('nf'); } };
    window.matchMedia = ()=>({ matches:true }); window.scrollTo = ()=>{};
    var STAGGER_MAX_STEPS = 6, STAGGER_STEP_MS = 40;
    function closeNavMoreOverlay(){} function hideGymOffer(){} function renderLogDateBar(){}
    Element.prototype.scrollIntoView = function(){};`,
    [extractConst(src, 'MOVED_TO_MORE'), extractFunction(src, 'switchView'),
     'window.__c = [];' + keys.concat('today').map(k => `switchView('${k}'); window.__c.push(document.querySelector('header').classList.contains('header-compact'));`).join('\n')]);
  assert.deepStrictEqual(Array.from(window.__c), [false, true, true, true, true, true, true, false]);
  const { window: w } = new JSDOM(`<style>${CSS}</style><header class="header-compact"><div class="sub">x</div><div class="streak-badge" style="display:inline-flex">1</div></header>`);
  assert.strictEqual(w.getComputedStyle(w.document.querySelector('.sub')).display, 'none');
  assert.strictEqual(w.getComputedStyle(w.document.querySelector('.streak-badge')).display, 'none', 'beats the inline display renderStreak sets');
});

test('REAL markup + CSSOM (v3.306): More is a grouped list — icon, name, description, chevron per row; ids unchanged', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style>` + html.slice(html.indexOf('<div class="sub-modal-overlay" id="navMoreOverlay"'), html.indexOf('<div class="photo-lightbox"')));
  const rows = [...window.document.querySelectorAll('.nav-more-list > .nav-more-item')];
  assert.deepStrictEqual(rows.map(r => r.id), ['navCare', 'navCoach', 'navLearn'], 'navigation keeps its ids');
  for(const r of rows){
    assert.ok(r.querySelector('.nav-more-icon svg[aria-hidden="true"]'), `${r.id}: drawn icon`);
    assert.ok(r.querySelector('.nav-more-label').textContent && r.querySelector('.nav-more-desc').textContent.length > 10, `${r.id}: name and description`);
    assert.ok(r.querySelector('.nav-more-chev'), `${r.id}: chevron`);
    assert.strictEqual(window.getComputedStyle(r).minHeight, '60px');
  }
  assert.strictEqual(rows.map(r => r.querySelector('.nav-more-label').textContent).join(','), 'Care,Coach,Learn');
});

test('REAL CSSOM + markup (v3.307): Settings is a bottom sheet on a phone, with Done; on/off rows are 51x31 switches', (assert)=>{
  const done = html.match(/<button class="settings-panel-close" id="settingsClose">([^<]*)<\/button>/);
  assert.ok(done && done[1] === 'Done', 'a visible "Done", not an unlabelled ✕');
  const phone = CSS.match(/@media \(max-width: 600px\)\{[\s\S]*?\.settings-modal\{align-items:flex-end;[\s\S]*?\.settings-panel::before\{[^}]*\}\s*\}/);
  assert.ok(phone, 'the phone rule docks it to the bottom and draws a grabber');
  assert.match(phone[0], /border-radius:28px 28px 0 0/);
  const { window } = new JSDOM(`<style>${CSS}</style><div class="settings-panel-body"><label class="save-to-library-label"><input type="checkbox" id="a" checked><span>Keep the screen awake</span></label></div>`);
  const box = window.getComputedStyle(window.document.getElementById('a'));
  assert.strictEqual(box.width, '51px'); assert.strictEqual(box.height, '31px');
  assert.match(CSS, /\.settings-panel-body \.save-to-library-label input\[type=checkbox\]:checked::before\{transform:translateX\(20px\);\}/, 'the knob slides when on');
  assert.strictEqual(window.getComputedStyle(window.document.querySelector('.save-to-library-label')).flexDirection, 'row-reverse', 'label left, switch right');
});

test('REAL invocation (v3.307): wireSettings marks every settings on/off control as a switch', (assert)=>{
  const start = src.indexOf('(function wireSettings(){');
  const a = src.indexOf("  move('healthImportCard', 'settingsMaintenanceSlot');", start);
  const line = src.slice(a).split('\n').find(l => l.includes("setAttribute('role', 'switch')"));
  assert.ok(line, 'the role is set in wireSettings, after the moves');
  const { window } = runJsdom(`<div id="settingsOverlay"><div class="settings-panel-body"><label class="save-to-library-label"><input type="checkbox"></label><label class="save-to-library-label"><input type="checkbox"></label></div></div><input type="checkbox" id="outside">`,
    "var overlay = document.getElementById('settingsOverlay');", [line]);
  assert.deepStrictEqual([...window.document.querySelectorAll('.settings-panel-body input')].map(i => i.getAttribute('role')), ['switch', 'switch']);
  assert.strictEqual(window.document.getElementById('outside').getAttribute('role'), null, 'only inside Settings');
});

test('REAL CSSOM + markup (v3.308): notices share one neutral style with a drawn icon; upload buttons are glass pills with drawn icons, no emoji', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div class="privacy-note" id="p">x</div><div class="card care-disclaimer-card" id="c"><div class="care-disclaimer" id="d"><b>This isn't a diagnosis.</b> x</div></div><button class="photo-log-btn" id="b">x</button>`);
  const cs = (id, pseudo) => window.getComputedStyle(window.document.getElementById(id), pseudo);
  const noColour = /plate-(green|yellow)|cta-glow/;
  const rule = sel => CSS.replace(/\/\*[\s\S]*?\*\//g, '').match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{[^}]*\\}'))[0];
  assert.doesNotMatch(rule('.privacy-note, .care-disclaimer-card .care-disclaimer, .notice'), noColour, 'notices are neutral');
  assert.doesNotMatch(rule('.care-disclaimer-card'), /plate-yellow/, 'no yellow outline');
  assert.match(rule('.privacy-note::before'), /mask:url\("data:image\/svg\+xml/, 'drawn lock');
  assert.strictEqual(cs('d').paddingLeft, '40px', 'room for the leading icon');
  assert.match(rule('.care-disclaimer b'), /color:var\(--text\)/, 'the bold safety lead stays bold, in text colour');
  assert.match(rule('.photo-log-btn'), /border-radius:var\(--radius-pill\)/);
  assert.doesNotMatch(rule('.photo-log-btn'), /dashed/);
  // The three upload buttons and two privacy notes carry no emoji now.
  for(const id of ['scanLabelBtn', 'photoAddBtn', 'coachVideoBtn']){
    const m = html.match(new RegExp(`<button class="photo-log-btn" id="${id}"[^>]*>([\\s\\S]*?)</button>`));
    assert.ok(m && /<svg class="btn-icon" aria-hidden="true"/.test(m[1]) && !/\p{Extended_Pictographic}/u.test(m[1]), `${id}: drawn icon, no emoji`);
  }
  assert.ok(!/class="privacy-note">\p{Extended_Pictographic}/u.test(html), 'no lock emoji');
});

run();
