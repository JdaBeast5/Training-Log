'use strict';
// v3.385 — Launch (owner: "design ... initial launching animation, to match
// the highly sophisticated and dynamic design of the app ... auto adjust to
// light mode dark mode, gray scale, etc."). Once per cold launch, then into the
// app. A tap skips it; a reload in the same session skips it; it never holds
// the app for more than 4s. (v3.387: transform and opacity only, composited, on
// one gentle ease-out. v3.516: the mark became the app icon, six SVG layers.)
//
// 2026-11-17 (v3.591, UX-18): the bar-to-Sash launch replaces v3.516's six
// layers (owner: "start off like one side of the weight plates on an Olympic
// weight bar floating into the frame, then turn to an angle and then have the
// lines extend ... before entering the app"; "make it smooth then have it open
// to the screen"). Ported from tools/design/launch/prototype.html with the
// lockjaw collar the owner approved. The tile/b25..b5 SVG layers, the single
// launchSettle keyframe, the 70ms stagger, the 1.35s hold, .is-out and the
// 600ms removal are all gone on purpose: criteria 1-5 and 8 below replace
// them; the tap, reload and cap tests (6-7) keep the harness, re-timed.
//
// Sabotage (each run and reverted): animate a band's height -> criterion 3
// fails; drop will-change from .band -> 3 fails; minMs 2500 -> 4 fails; drop
// animation:none from the Reduce Motion .band rule -> 5 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');
const { test, run } = makeRunner('test-launch.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const bodyStart = html.slice(html.indexOf('<body>'), html.indexOf('<body>') + 8000);
const script = bodyStart.match(/<script>\s*(\(function launch\(\)\{[\s\S]*?\}\)\(\);)\s*<\/script>/)[1];
const markup = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.getElementById('launch').outerHTML;
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const sheetDoc = new JSDOM(`<style>${CSS}</style>`).window.document;
const ALL = [];
(function walk(list, media){ for(const r of list){ if(r.type === 1) ALL.push({r, media}); else if(r.type === 7) ALL.push({r, media, kf: true}); else if(r.cssRules) walk(r.cssRules, r.media ? r.media.mediaText : media); } })(sheetDoc.styleSheets[0].cssRules, null);
const LAUNCH = ALL.filter(x => !x.kf && /^\.launch\b/.test(x.r.selectorText));
const rule = (sel, media = null) => { const f = LAUNCH.filter(x => x.r.selectorText === sel && x.media === media); if(f.length !== 1) throw new Error(`${sel} @${media}: ${f.length}`); return f[0].r.style; };
const KEYFRAMES = ALL.filter(x => x.kf && /^launch/.test(x.r.name));
const REDUCE = '(prefers-reduced-motion: reduce)';
const num = v => { const m = /calc\(var\(--u\) \* (-?[\d.]+)\)/.exec(v); if(!m) throw new Error('not a --u length: ' + v); return +m[1]; };
const secs = t => /ms$/.test(t) ? parseFloat(t) / 1000 : parseFloat(t);

function boot({ played = false, reduce = false } = {}){
  const dom = new JSDOM(`<!doctype html><body>${markup}</body>`, { runScripts: 'outside-only', url: 'https://example.test/' });
  const w = dom.window;
  if(played) w.sessionStorage.setItem('launch-played', '1');
  w.matchMedia = q => ({ matches: reduce && /reduce/.test(q) });
  w.eval(script);
  return w;
}
const wait = ms => new Promise(r => setTimeout(r, ms));

test('criterion 1: the launch is first in <body>, hidden from assistive tech, and is exactly the cam > float > rig tree with two doors, four steel (lockjaw last), two sides and five bands', (assert)=>{
  assert.match(bodyStart, /^<body>\s*<!--[\s\S]*?-->\s*<div class="launch" id="launch" aria-hidden="true">/);
  const d = new JSDOM(markup).window.document;
  const el = d.getElementById('launch');
  assert.strictEqual(el.querySelectorAll('.launch-cam').length, 1);
  const rig = el.querySelector('.launch-cam > .launch-float > .launch-rig');
  assert.ok(rig, 'cam > float > rig');
  const kids = [...rig.children].map(c => c.className);
  assert.deepStrictEqual(kids, ['door door-a', 'door door-b', 'steel steel-bar', 'steel steel-collar', 'steel steel-sleeve', 'side side-a', 'side side-b', 'steel steel-lockjaw']);
  assert.deepStrictEqual([...rig.querySelector('.steel-lockjaw').children].map(c => c.className), ['jaw-tab', 'jaw-body']);
  assert.deepStrictEqual([...rig.querySelectorAll('.side-a > .band')].map(b => b.classList[1]), ['b25', 'b20', 'b15']);
  assert.deepStrictEqual([...rig.querySelectorAll('.side-b > .band')].map(b => b.classList[1]), ['b10', 'b5']);
  assert.strictEqual(el.querySelectorAll('.band').length, 5, 'anchor: five bands');
  assert.strictEqual(el.querySelectorAll('svg').length, 0, 'plain divs with flat fills, no SVG');
});

test('criterion 2: geometry from option-a.svg: each band starts on its plate and ends at the icon\'s pitch; the turn lands at 60deg; the lockjaw sits between the 5 kg plate and the sleeve tip', (assert)=>{
  const svg = fs.readFileSync(path.join(__dirname, 'tools/design/icon/option-a.svg'), 'utf8');
  const plates = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" rx="\d+" fill="(#[0-9A-F]{6})"\/>/g)].map(m => ({x: +m[1], w: +m[3], h: +m[4]}));
  assert.strictEqual(plates.length, 5, 'anchor: five plates in option-a.svg');
  const extend = KEYFRAMES.find(k => k.r.name === 'launchExtend').r;
  assert.strictEqual(extend.cssRules[0].style.getPropertyValue('transform'), 'translateX(calc(var(--u) * var(--x1))) scale(1, 1)');
  ['25', '20', '15', '10', '5'].forEach((k, i) => {
    const st = rule('.launch .b' + k);
    const p = plates[i];
    assert.strictEqual(+st.getPropertyValue('--x0'), p.x + p.w / 2 - 512, `b${k} --x0`);
    assert.strictEqual(+st.getPropertyValue('--x1'), [-204, -102, 0, 102, 204][i], `b${k} --x1`);
    assert.ok(Math.abs(+st.getPropertyValue('--sx') - p.w / 84) < 1e-3, `b${k} --sx`);
    assert.ok(Math.abs(+st.getPropertyValue('--sy') - p.h / 4400) < 1e-4, `b${k} --sy`);
  });
  assert.strictEqual(KEYFRAMES.find(k => k.r.name === 'launchTurn').r.cssRules[0].style.getPropertyValue('transform'), 'rotate(60deg)');
  const body = rule('.launch .jaw-body'), tab = rule('.launch .jaw-tab');
  const [bl, bw, bt, bh] = ['left', 'width', 'top', 'height'].map(k => num(body.getPropertyValue(k)));
  const [tl, tw, tt, th] = ['left', 'width', 'top', 'height'].map(k => num(tab.getPropertyValue(k)));
  const fiveOuter = plates[4].x + plates[4].w - 512, sleeveTip = 270 + 590 - 512;
  assert.strictEqual(fiveOuter, 228); assert.strictEqual(sleeveTip, 348);
  assert.ok(bl > fiveOuter && bl + bw < sleeveTip, 'between the 5 kg plate and the sleeve tip');
  assert.ok(bh > 60 && bh < 220 && bw >= 40, 'a block: taller than the sleeve, shorter than the inner collar, at least 40u wide');
  assert.ok(tt + th >= bt && tt < bt && tl >= bl && tl + tw <= bl + bw, 'the tab touches the barrel\'s top edge');
  assert.ok(Math.min(bw, tw) >= 20, 'nothing thinner than 20u');
  assert.match(rule('.launch .steel').getPropertyValue('animation'), /launchSteelOut/);
  for(const sel of ['.launch .jaw-tab', '.launch .jaw-body', '.launch .steel-lockjaw > i']) assert.strictEqual(rule(sel).getPropertyValue('animation'), '', sel + ': static');
});

test('criterion 3: composited only: every launch keyframe sets only transform or opacity; no other property transitions; every animated element has will-change', (assert)=>{
  assert.ok(KEYFRAMES.length >= 8, 'anchor: keyframes ' + KEYFRAMES.length);
  for(const {r} of KEYFRAMES) for(const f of r.cssRules) for(let i = 0; i < f.style.length; i++) assert.ok(['transform', 'opacity'].includes(f.style[i]), `${r.name}: ${f.style[i]}`);
  for(const {r} of LAUNCH) assert.strictEqual(r.style.getPropertyValue('transition'), '', r.selectorText + ' transitions');
  assert.doesNotMatch(KEYFRAMES.map(k => k.r.cssText).join(' '), /stroke-dash|filter|clip-path|width|height/);
  // Every element a launch animation lands on (open state included) carries will-change.
  const d = new JSDOM(markup.replace('class="launch"', 'class="launch is-open"')).window.document;
  const animated = LAUNCH.filter(x => /launch\w+/.test(x.r.style.getPropertyValue('animation')));
  assert.ok(animated.length >= 8, 'anchor: animated rules');
  for(const {r} of animated){
    const els = [...d.querySelectorAll(r.selectorText.split(',').map(s => s.trim()).join(','))].concat(r.selectorText.split(',').some(s => d.getElementById('launch').matches(s.trim())) ? [d.getElementById('launch')] : []);
    assert.ok(els.length, r.selectorText + ': matches the real markup');
    for(const el of els) assert.ok(LAUNCH.some(x => x.r.style.getPropertyValue('will-change') && el.matches(x.r.selectorText)), `${r.selectorText}: ${el.className} has will-change`);
  }
});

test('criterion 4: timings: the Sash forms by 1.2s, the open ends by 0.75s, minMs 900, removal 750ms after is-open, one 4s cap, no overshoot', (assert)=>{
  const anims = LAUNCH.filter(x => x.media === null).map(x => ({sel: x.r.selectorText, a: x.r.style.getPropertyValue('animation')})).filter(x => /launch\w+/.test(x.a));
  for(const {sel, a} of anims){
    for(const part of a.split(/,(?![^(]*\))/)){
      const times = part.match(/-?[\d.]+m?s/g).map(secs);
      const end = times[0] + (times[1] || 0);
      if(/is-open/.test(sel)) assert.ok(end <= 0.75 + 1e-9, `${sel}: open ends at ${end}s`);
      else assert.ok(end <= 1.2 + 1e-9, `${sel}: pre-open ends at ${end}s`);
    }
  }
  const code = script.replace(/\/\/.*$/gm, '');
  assert.match(code, /var minMs = reduce \? 250 : 900;/);
  assert.match(code, /el\.classList\.add\('is-open'\);\s*setTimeout\(function\(\)\{ if\(el\.parentNode\) el\.parentNode\.removeChild\(el\); \}, reduce \? 220 : 750\);/);
  assert.strictEqual((code.match(/setTimeout\(open, 4000\)/g) || []).length, 1, 'one cap');
  for(const v of [rule('.launch').getPropertyValue('--launch-ease'), rule('.launch').getPropertyValue('--launch-ease-open')]){
    const pts = v.match(/-?[\d.]+/g).map(Number);
    assert.strictEqual(pts.length, 4, v);
    for(const n of pts) assert.ok(n >= 0 && n <= 1, `${v}: no control point past 1`);
  }
});

test('criterion 5: Reduce Motion shows the finished Sash still, draws no steel, and cross-fades in 200ms (real script: is-open by ~250ms, gone by ~500ms)', async (assert)=>{
  for(const [sel, t] of [['.launch .launch-float', 'none'], ['.launch .launch-rig', 'rotate(60deg)'], ['.launch .band', 'translateX(calc(var(--u) * var(--x1)))'], ['.launch .strap', 'none']]){
    const st = rule(sel, REDUCE);
    assert.strictEqual(st.getPropertyValue('animation'), 'none', sel);
    assert.strictEqual(st.getPropertyValue('transform'), t, sel);
  }
  assert.strictEqual(rule('.launch .steel', REDUCE).getPropertyValue('display'), 'none');
  assert.strictEqual(rule('.launch.is-open', REDUCE).getPropertyValue('animation'), 'launchOpenFade .2s linear forwards');
  assert.strictEqual(rule('.launch.is-open .launch-cam', REDUCE).getPropertyValue('animation'), 'none');
  assert.strictEqual(rule('.launch.is-open .door,.launch.is-open .side', REDUCE).getPropertyValue('animation'), 'none');
  const w = boot({ reduce: true });
  await wait(300);
  const el = w.document.getElementById('launch');
  assert.ok(el && el.classList.contains('is-open'), 'open by ~250ms');
  await wait(250);
  assert.strictEqual(w.document.getElementById('launch'), null, 'gone by ~500ms');
});

test('criterion 6: a tap opens at once, and the layer leaves the page 800ms later; without a tap it opens by itself after the Sash forms', async (assert)=>{
  const w = boot();
  const el = w.document.getElementById('launch');
  assert.ok(el && !el.classList.contains('is-open'), 'playing');
  el.dispatchEvent(new w.Event('pointerdown'));
  assert.ok(el.classList.contains('is-open'), 'a tap opens at once');
  await wait(800);
  assert.strictEqual(w.document.getElementById('launch'), null, 'and it leaves the page');
  const full = boot();
  await wait(300);
  assert.ok(!full.document.getElementById('launch').classList.contains('is-open'), 'still forming at 300ms');
  await wait(700);
  assert.ok(full.document.getElementById('launch').classList.contains('is-open'), 'open by ~900ms once loaded');
});

test('criterion 7: once per session: a reload skips it entirely; a cold launch remembers it', (assert)=>{
  assert.strictEqual(boot({ played: true }).document.getElementById('launch'), null);
  assert.strictEqual(boot().sessionStorage.getItem('launch-played'), '1');
});

test('criterion 8: the ink strap exists only in the light theme; the ground and the two Increase Contrast branches are unchanged', (assert)=>{
  assert.strictEqual(rule('.launch .strap').getPropertyValue('display'), 'none');
  assert.strictEqual(rule('.launch .strap', '(prefers-color-scheme: light)').getPropertyValue('display'), 'block');
  assert.ok(LAUNCH.filter(x => /strap/.test(x.r.selectorText) && x.r.style.getPropertyValue('display') === 'block').every(x => x.media === '(prefers-color-scheme: light)'));
  assert.match(CSS, /\.launch\{[^}]*background:var\(--ground\);/);
  assert.match(CSS, /@media \(prefers-contrast: more\)\{\s*\.launch\{background:var\(--bg\);\}\s*\}/);
  assert.match(CSS, /@media \(prefers-contrast: more\) and \(prefers-color-scheme: light\)\{ \.launch\{background:#FFFFFF;\} \}/);
  assert.match(CSS, /\.launch\{[^}]*z-index:2147483000/, 'above everything, including the profile picker');
  assert.strictEqual(rule('.launch.is-open').getPropertyValue('background'), 'transparent', 'the doors reveal the app');
});

run();
