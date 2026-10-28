'use strict';
// v3.278 (tasteskill rollout): the header every view shares.
//  - h1 at app-title size (24/700, was 32/800): an app screen is not a landing page.
//  - The eyebrow keeps its job (product scope: whose log, which goal) but is
//    sentence case as the person typed their name, text face, 12px, untracked
//    (was 10.5px tracked uppercase mono, with the name force-uppercased).
//  - The streak pill: flat pale tint (no gradient, no glow), a flame outline SVG
//    instead of 🔥, text face with tabular figures.
// Real CSSOM + real renderHeader / renderStreak invocations.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-header-refresh.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style>`).window;
function only(sel){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1 && r.selectorText === sel) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  if(out.length !== 1) throw new Error(`expected one "${sel}" rule, found ${out.length}`);
  return out[0].style;
}
const headerHtml = extractElementById(src, 'headerEyebrow'); // anchor: the real element exists
const EMOJI = /\p{Extended_Pictographic}/u;

// v3.289 (Glass & glow): the h1 became an iOS-style large title naming the
// current view (34/750); the eyebrow rules from v3.278 are unchanged.
test('REAL CSSOM: h1 is the large view title (34px, 750) and the eyebrow is sentence-case text face at 12px, untracked', (assert)=>{
  assert.ok(headerHtml.includes('headerEyebrow'));
  const h1 = only('h1');
  assert.strictEqual(h1.getPropertyValue('font-size'), '34px');
  assert.strictEqual(h1.getPropertyValue('font-weight'), '750');
  const eb = only('.eyebrow');
  assert.strictEqual(eb.getPropertyValue('text-transform'), '');
  assert.strictEqual(eb.getPropertyValue('letter-spacing'), '');
  assert.strictEqual(eb.getPropertyValue('font-family'), 'var(--font-sans)');
  assert.ok(parseFloat(eb.getPropertyValue('font-size')) >= 11);
});

test('REAL invocation: renderHeader shows the name as typed, not force-uppercased; falls back to the product name with no profile', (assert)=>{
  const { window } = runJsdom('<div id="headerEyebrow"></div><div id="headerSub"></div>',
    'var userProfile = {name:"Jordan", goal:"recomp", heightFt:5, heightIn:10, weight:180}; function fmtWeight(w){ return w + " lb"; }',
    [extractConst(src, 'GOAL_LABELS'), extractFunction(src, 'renderHeader'),
     'renderHeader(); window.__named = document.getElementById("headerEyebrow").textContent;',
     'userProfile = {}; renderHeader(); window.__empty = document.getElementById("headerEyebrow").textContent;']);
  assert.ok(window.__named.startsWith('Jordan · '), window.__named);
  assert.ok(/ program$/.test(window.__named), window.__named);
  assert.strictEqual(window.__empty, 'Training Log');
});

test('REAL invocation: renderStreak draws a flame outline (aria-hidden), no emoji, the count in its own span, then animates in place', async (assert)=>{
  const { window } = runJsdom('<div id="streakBadge" style="display:none"></div>',
    'var __n = 5; async function computeStreak(){ return __n; } window.__animated = []; function animateNumberTo(el, v){ window.__animated.push(v); el.textContent = String(v); } async function checkStreakMilestone(){}',
    [extractConst(src, 'STREAK_FLAME_SVG'), extractFunction(src, 'renderStreak'),
     'window.__first = renderStreak();']);
  await window.__first;
  const el = window.document.getElementById('streakBadge');
  assert.strictEqual(el.style.display, 'inline-flex');
  const svg = el.querySelector('svg.streak-flame');
  assert.ok(svg && svg.getAttribute('aria-hidden') === 'true');
  assert.ok(!EMOJI.test(el.textContent), el.textContent);
  assert.strictEqual(el.textContent.trim(), '5 days streak');
  window.__n = 6; await window.eval('renderStreak()');
  assert.deepStrictEqual(Array.from(window.__animated), [6], 'a second render animates the existing number instead of rebuilding');
  assert.strictEqual(el.querySelectorAll('svg.streak-flame').length, 1);
});

test('REAL CSSOM: the streak pill is a flat tint with a same-hue border, no gradient, no glow, tabular figures in the text face', (assert)=>{
  const b = only('.streak-badge');
  assert.ok(!/gradient/.test(b.getPropertyValue('background')), b.getPropertyValue('background'));
  assert.strictEqual(b.getPropertyValue('box-shadow'), '');
  assert.match(b.getPropertyValue('border'), /plate-yellow-rgb/);
  assert.strictEqual(b.getPropertyValue('font-family'), 'var(--font-sans)');
  assert.strictEqual(b.getPropertyValue('font-variant-numeric'), 'tabular-nums');
});

// v3.289: the large title follows the view. switchView is driven for real with
// a minimal document carrying every view and pill it touches.
test('REAL invocation: switchView sets the large title to the view you switched to, for every view', (assert)=>{
  const keys = ['today','log','analysis','history','care','coach','learn'];
  const markup = '<h1 id="viewTitle">Today</h1><button id="navMore"></button><div id="stickyDayHeader"></div><div id="logDateBar"></div>' + keys.map(k => `<div id="${k}View"><div class="card"></div></div><button id="nav${k[0].toUpperCase()+k.slice(1)}"></button>`).join('');
  const { window } = runJsdom(markup, `
    window.storage = { set(){}, get: async ()=>{ throw new Error('nf'); } };
    window.matchMedia = ()=>({ matches:true });
    window.scrollTo = ()=>{};
    var STAGGER_MAX_STEPS = 6, STAGGER_STEP_MS = 40;
    function closeNavMoreOverlay(){} function hideGymOffer(){} function renderLogDateBar(){}
    Element.prototype.scrollIntoView = function(){};`,
    [extractConst(src, 'MOVED_TO_MORE'), extractFunction(src, 'switchView'), 'window.__seen = [];' + keys.map(k => `try{ switchView('${k}'); }catch(e){ window.__err = e.message; } window.__seen.push(document.getElementById('viewTitle').textContent);`).join('\n')]);
  assert.ok(!window.__err, window.__err);
  assert.deepStrictEqual(Array.from(window.__seen), ['Today','Log','Analysis','History','Care','Coach','Learn']);
});

test('REAL source, comments stripped: renderWorkout publishes the day\'s plate colour as --day-hue on the workout card, and the hero title fades into it', (assert)=>{
  const fn = extractFunction(src, 'renderWorkout').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const lines = fn.split('\n').filter(l => /--day-hue/.test(l));
  assert.strictEqual(lines.length, 1, 'exactly one place sets --day-hue (anchor)');
  assert.match(lines[0], /getElementById\('workoutCard'\)\.style\.setProperty\('--day-hue', 'var\(--plate-' \+ getDayPlateClass\(activeDay\)\.slice\(2\) \+ '\)'\)/);
  assert.match(only('.workout-hero-title').getPropertyValue('background'), /var\(--day-hue/);
  // Every plate class the day can get has the matching colour token.
  const classes = new Function(`${extractConst(src, 'VIVID_PLATE_CLASSES')}; return VIVID_PLATE_CLASSES;`)().concat(['p-off']);
  for(const c of classes) assert.match(src, new RegExp(`--plate-${c.slice(2)}:#`), `--plate-${c.slice(2)} must exist`);
});

// v3.468 (owner: "Let's do them all", after a review): the line under the
// title said "7-day split · … · 45-60 min sessions" for every profile — fixed
// text, wrong on a 4-day upper/lower estimating ~74 min. It now says only
// what the profile holds.
test('REAL invocation (v3.468): the header line carries the profile, not a fixed split or session length', (assert)=>{
  const { window } = runJsdom('<div id="headerEyebrow"></div><div id="headerSub"></div>',
    'var userProfile = {name:"Jordan", goal:"recomp", heightFt:5, heightIn:11, weight:182}; function fmtWeight(w){ return w + " lb"; }',
    [extractConst(src, 'GOAL_LABELS'), extractFunction(src, 'renderHeader'), 'renderHeader();']);
  const sub = window.document.getElementById('headerSub').textContent;
  assert.match(sub, /^5'11" · 182 lb · /);
  assert.doesNotMatch(sub, /split|min sessions/);
});

run();
