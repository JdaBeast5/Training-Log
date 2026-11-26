'use strict';
// v3.662 (UX-41, owner 2026-11-23: "no link blue; links and affordances in
// ink"): chevrons, links and Done in the ink. Today already went ink (UX-23,
// UX-34); the same affordances were blue everywhere else.
//  - .ex-chevron is --text-3 by default, which retires the per-screen
//    overrides that already said so (Priorities, Settings, the open exercise);
//    .xlink-chev and the restaurant chevron too.
//  - .ex-video-link is --text at 14px everywhere (UX-34's #exerciseList
//    override goes).
//  - "In your program" (the current masterclass row's note) is a label:
//    --text-2 at 600.
//  - Links in running text (Research & Sources cites, the coach key link) are
//    --text, underlined.
//  - Done/Cancel (.sub-modal-close, .settings-panel-close) are --text, which
//    retires the finish and day sheets' overrides.
// The --plate-blue token itself is untouched (UX-05's rule).
//
// Real CSSOM: the whole stylesheet, with winning() running the cascade on
// real-shaped markup (jsdom can't resolve var(); see test-ruled-rows.js), per
// theme; tokens from the real :root rules, UX-01's luminance. Real builders:
// renderMasterclassIndex, buildExerciseSearchResultHtml, buildCareItemHtml and
// renderWatersportsTechniques, over the real exercise library.
//
// Sabotage: restore .ex-chevron{color:var(--plate-blue)} and criterion 1 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-ink-affordances.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const rules = [...new JSDOM(`<style>${CSS}</style>`).window.document.styleSheets[0].cssRules];

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function props(list){ const m = {}; for(const r of list) for(let i = 0; i < r.style.length; i++){ const p = r.style[i]; if(p.startsWith('--')) m[p] = r.style.getPropertyValue(p).trim(); } return m; }
const top = sel => rules.filter(r => r.selectorText === sel);
const lightBody = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)).flatMap(r => [...r.cssRules]).filter(r => r.selectorText === ':root body');
const THEMES = {dark: props([...top(':root'), ...top(':root body')]), light: props([...top(':root'), ...top(':root body'), ...lightBody])};
const resolve = (v, t) => { for(let i = 0; i < 10 && /var\(/.test(v); i++) v = v.replace(/var\((--[a-z0-9-]+)\)/g, (_, n) => THEMES[t][n] || ''); return v.trim(); };

// The cascade (as test-ruled-rows.js): rules matching the element, by specificity then order; light adds the light-scheme @media rules.
function styleRules(theme){ const out = []; for(const r of rules){ if(r.selectorText && r.style) out.push(r); else if(theme === 'light' && r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText)) for(const c of r.cssRules) if(c.selectorText && c.style) out.push(c); } return out; }
const STYLE = {dark: styleRules('dark'), light: styleRules('light')};
function specificity(sel){
  let s = sel.replace(/::[\w-]+/g, ' '); const notArgs = [];
  s = s.replace(/:not\(([^)]*)\)/g, (_, a) => { notArgs.push(a); return ' '; });
  const ids = (s.match(/#[\w-]+/g) || []).length, cls = (s.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g) || []).length;
  const types = (s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]|:[\w-]+/g, ' ').match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) || []).length;
  return notArgs.map(specificity).reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [ids, cls, types]);
}
const greater = (a, b) => { for(let i = 0; i < a.length; i++) if(a[i] !== b[i]) return a[i] > b[i]; return false; };
// color inherits: with no matching rule, the parent's.
function winning(el, prop, theme = 'dark'){
  let best = null;
  STYLE[theme].forEach((r, order) => {
    for(const sel of r.selectorText.split(/,(?![^(]*\))/).map(x => x.trim())){
      let hit = false; try { hit = el.matches(sel); } catch(e){}
      if(!hit) continue;
      const v = r.style.getPropertyValue(prop); if(!v) continue;
      const key = [...specificity(sel), order];
      if(!best || greater(key, best.key)) best = {key, v: v.trim()};
    }
  });
  if(best) return best.v;
  return prop === 'color' && el.parentElement ? winning(el.parentElement, prop, theme) : '';
}

// Real-shaped markup for each affordance, in the places it appears.
const doc = new JSDOM(`<div class="card">
  <div class="exercise"><span class="ex-chevron" id="chev"></span></div>
  <button class="priorities-summary"><span class="ex-chevron" id="prio"></span></button>
  <div class="settings-group"><div class="card"><span class="ex-chevron" id="sett"></span></div></div>
  <div id="exerciseList"><div class="exercise"><span class="ex-chevron" id="exl"></span></div><a class="ex-video-link" id="exlvid">Watch form video</a></div>
  <button class="restaurant-btn"><span class="ex-chevron" id="rest"></span></button>
  <button class="xlink">Bench<span class="xlink-chev" id="xl"></span></button>
  <a class="ex-video-link" id="vid">Watch form video</a>
  <button class="masterclass-index-btn current"><span>Strength</span><span class="mc-index-meta" id="meta">In your program</span></button>
  <div id="researchSourcesList"><p class="source-cites">See <a id="cite" href="#">Plews 2013</a></p></div>
  <button class="custom-toggle coach-key-link" id="key">Add your API key</button>
  <div class="settings-panel"><button class="settings-panel-close" id="spc">Done</button></div>
  <div class="finish-sheet"><button class="sub-modal-close" id="fin">Done</button></div>
  <div class="day-sheet"><button class="sub-modal-close" id="day">Done</button></div>
  <div class="sub-modal"><button class="sub-modal-close" id="sub">Cancel</button></div>
</div>`).window.document;
const $ = id => doc.getElementById(id);
const BLUE = /plate-blue|#7a93ff/i;

test('criterion 1: no listed affordance resolves color to --plate-blue or #7A93FF, in either theme', (assert)=>{
  const expect = {chev: 'var(--text-3)', prio: 'var(--text-3)', sett: 'var(--text-3)', exl: 'var(--text-3)', rest: 'var(--text-3)', xl: 'var(--text-3)',
    vid: 'var(--text)', exlvid: 'var(--text)', meta: 'var(--text-2)', cite: 'var(--text)', key: 'var(--text)', spc: 'var(--text)', fin: 'var(--text)', day: 'var(--text)', sub: 'var(--text)'};
  for(const t of ['dark', 'light']) for(const [id, want] of Object.entries(expect)){
    const c = winning($(id), 'color', t);
    assert.ok(!BLUE.test(c), `${id} ${t}: ${c}`);
    assert.strictEqual(c, want, `${id} ${t}`);
  }
  assert.ok(THEMES.dark['--plate-blue'], 'anchor: the --plate-blue token itself is untouched (UX-05)');
});

test('criterion 1: the overrides that already said so are gone (one rule each, counted in the CSSOM)', (assert)=>{
  const sels = [];
  (function walk(l){ for(const r of l){ if(r.selectorText) sels.push(...r.selectorText.split(/,(?![^(]*\))/).map(x => x.trim()).map(x => [x, r])); if(r.cssRules) walk(r.cssRules); } })(rules);
  const colorOn = sel => sels.filter(([x, r]) => x === sel && r.style.getPropertyValue('color')).length;
  assert.strictEqual(colorOn('.priorities-summary .ex-chevron'), 0);
  assert.strictEqual(colorOn('.settings-group .card .ex-chevron'), 0);
  assert.strictEqual(colorOn(':root body #exerciseList .ex-chevron'), 0);
  assert.strictEqual(colorOn(':root body #exerciseList .ex-video-link'), 0);
  assert.strictEqual(colorOn('.finish-sheet .sub-modal-close'), 0);
  assert.strictEqual(colorOn('.day-sheet .sub-modal-close'), 0);
  assert.strictEqual(colorOn('.ex-chevron'), 1, 'anchor: one default');
  assert.strictEqual(colorOn('.sub-modal-close'), 1);
});

test('links in running text keep an underline (colour alone isn\'t the affordance); the video link is 14px', (assert)=>{
  assert.strictEqual(winning($('cite'), 'text-decoration'), 'underline');
  assert.strictEqual(winning($('key'), 'text-decoration'), 'underline');
  assert.strictEqual(winning($('vid'), 'font-size'), '14px');
  assert.strictEqual(winning($('meta'), 'font-weight'), '600');
});

test('criterion 2: the real renderMasterclassIndex marks the current program "In your program", class current, its meta at least 4.5:1 on --surface-1 in both themes', (assert)=>{
  const { window } = runJsdom('<div id="masterclassIndex"></div>', `
    var activeProgram = 'strength';
    const MASTERCLASS_LIBRARY = {strengthMc: {label: 'Strength'}, yogaMc: {label: 'Yoga'}};
    const PROGRAM_MASTERCLASS = {strength: {cardId: 'strengthMc'}};
    function isMasterclassOpen(){ return false; } function toggleMasterclass(){} function icon(){ return '<svg></svg>'; }`,
    [extractFunction(src, 'escapeHtml'), extractFunction(src, 'renderMasterclassIndex'), 'renderMasterclassIndex();']);
  const cur = window.document.querySelector('.masterclass-index-btn.current');
  assert.ok(cur, 'one current row');
  assert.strictEqual(window.document.querySelectorAll('.masterclass-index-btn.current').length, 1);
  assert.strictEqual(cur.querySelector('.mc-index-meta').textContent.trim(), 'In your program');
  for(const t of ['dark', 'light']){
    const fg = resolve(winning($('meta'), 'color', t), t), bg = resolve('var(--surface-1)', t);
    assert.ok(contrast(fg, bg) >= 4.5, `${t}: ${fg} on ${bg} is ${contrast(fg, bg).toFixed(2)}:1`);
  }
});

test('criterion 3: the real video-link builders each render one a.ex-video-link with the same href, named "Watch form video", at least 44px tall', (assert)=>{
  const { window } = runJsdom('<div id="s"></div><div id="c"></div><div id="watersportsTechniquesList"></div>', `function getExerciseIcon(){ return '<svg></svg>'; }`,
    [extractConst(src, 'exerciseInfo'), extractConst(src, 'CARE_TYPE_TAG'), extractConst(src, 'WATERSPORTS_TECHNIQUE_GROUPS'), extractConst(src, 'WATERSPORTS_TECHNIQUE_DETAILS'),
     extractConst(src, 'WATERSPORTS_ICONS'), extractFunction(src, 'escapeHtml'),
     ...['buildExerciseSearchResultHtml', 'buildCareItemHtml', 'renderWatersportsTechniques'].map(n => extractFunction(src, n)),
     `document.getElementById('s').innerHTML = buildExerciseSearchResultHtml('Bench Press');
      document.getElementById('c').innerHTML = buildCareItemHtml(Object.keys(CARE_TYPE_TAG)[0]);
      renderWatersportsTechniques();
      window.__q = n => encodeURIComponent(exerciseInfo[n].videoQuery || n + ' proper form');
      window.__care = Object.keys(CARE_TYPE_TAG)[0];`]);
  const one = id => { const l = window.document.querySelectorAll(`#${id} a.ex-video-link`); return l; };
  const s = one('s'), c = one('c'), w = one('watersportsTechniquesList');
  assert.strictEqual(s.length, 1); assert.strictEqual(c.length, 1); assert.ok(w.length >= 1, 'watersports rows');
  assert.strictEqual(s[0].getAttribute('href'), 'https://www.youtube.com/results?search_query=' + window.__q('Bench Press'));
  assert.strictEqual(c[0].getAttribute('href'), 'https://www.youtube.com/results?search_query=' + window.__q(window.__care));
  for(const a of [s[0], c[0], w[0]]){
    assert.strictEqual(a.textContent.trim(), 'Watch form video'); assert.ok(!a.hasAttribute('aria-label'), 'named by its text');
    assert.ok(parseFloat(winning(a, 'min-height')) >= 44, winning(a, 'min-height'));
  }
});

test('criterion 4: --text-3 chevrons on --surface-1 and on --ground are at least 3:1 (a non-text graphic) in both themes', (assert)=>{
  for(const t of ['dark', 'light']) for(const bg of ['--surface-1', '--ground']){
    const fg = resolve('var(--text-3)', t), b = resolve(`var(${bg})`, t);
    assert.ok(contrast(fg, b) >= 3, `${t}: ${fg} on ${b} is ${contrast(fg, b).toFixed(2)}:1`);
  }
});

// v3.680 (the controls UX-41 left blue; owner Go 2026-11-26, minor details first).
test('v3.680: the set sheet\'s Cancel, Back, the swap icon, the supplement links and the Settings notify row resolve to the ink, in both themes', (assert)=>{
  const d = new JSDOM(`<div class="card">
    <div class="set-sheet"><button class="set-sheet-cancel" id="cancel">Cancel</button></div>
    <button class="back-btn" id="back">‹ Back</button>
    <div class="exercise"><span class="ex-swap-icon" id="swap">⇄</span></div>
    <div class="supplement-name-wrap"><span class="supplement-frequency" id="freq">Daily</span></div>
    <button class="supplement-benefit-toggle" id="why">Why</button>
    <button class="supplement-ai-insight-btn" id="ai">Ask AI</button>
    <div class="settings-group"><button id="settingsNotifyBtn">Notifications</button></div></div>`).window.document;
  const want = {cancel: 'var(--text)', back: 'var(--text)', swap: 'var(--text-3)', freq: 'var(--text-2)', why: 'var(--text)', ai: 'var(--text)', settingsNotifyBtn: 'var(--text)'};
  for(const t of ['dark', 'light']) for(const [id, w] of Object.entries(want)){
    const c = winning(d.getElementById(id), 'color', t);
    assert.ok(!BLUE.test(c), `${id} ${t}: ${c}`);
    assert.strictEqual(c, w, `${id} ${t}`);
  }
});

run();
