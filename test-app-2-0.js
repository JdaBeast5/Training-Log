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

run();
