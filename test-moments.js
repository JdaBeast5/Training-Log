'use strict';
// v3.611 (UX-30): milestones and records are moments in the day's ink, not a
// gold-edged modal with confetti. triggerCelebration keeps its signature and
// every caller; the banner sits above the tab bar, flat, and takes taps only
// on its own box, so the cover's Log button under it stays tappable. The
// confetti (spawnConfetti, CONFETTI_COLORS, .confetti-piece) is gone. A
// record's words come from one labeller (bestLabel) that the finish sheet
// uses too: "Heaviest weight yet", not "New PR!".
//
// Real invocation: the real #celebrateBanner markup, the real
// triggerCelebration, bestLabel and the PR branch's own call expression
// (taken verbatim from the source and evaluated), the real stylesheet's
// CSSOM (media blocks included).
//
// Sabotage: centre the moment again (top:50%) and criterion 3 fails; leave
// one spawnConfetti( call and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-moments.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
// The app's own script with comment lines dropped (a regex strip of /* … */
// across the whole file eats real code where a string or regex holds "/*").
const SCRIPT = src.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).map(l => l.replace(/\s\/\/ .*$/, '')).join('\n');

function mount(){
  const { window } = runJsdom(extractElementById(src, 'celebrateBanner'), `
    window.__shares = 0; window.__timers = [];
    function shareCelebrationCard(){ window.__shares++; } function preloadShareCardFont(){}
    window.setTimeout = (fn, ms) => { window.__timers.push(ms); return 1; }; window.clearTimeout = () => {};`,
    [extractConst(src, 'ICONS'), extractFunction(src, 'icon'), 'let celebrateTimeout = null;', extractFunction(src, 'bestLabel'), extractFunction(src, 'triggerCelebration')]);
  return { window, doc: window.document, $: id => window.document.getElementById(id) };
}

test('criterion 1: a big call with share data: the moment is active, Share is shown and wired once (two calls, one listener), and no .confetti-piece exists', (assert)=>{
  const ui = mount();
  const share = {icon: 'flame', headline: '8 WEEKS', kind: 'streak'};
  ui.window.triggerCelebration('flame', '8 weeks in a row', 'Rest days included.', true, share);
  ui.window.triggerCelebration('flame', '8 weeks in a row', 'Rest days included.', true, share);
  const banner = ui.$('celebrateBanner');
  assert.ok(banner.classList.contains('active') && banner.classList.contains('big'));
  assert.strictEqual(ui.$('celebrateText').textContent, '8 weeks in a row');
  assert.strictEqual(ui.$('celebrateSub').textContent, 'Rest days included.');
  const btn = ui.$('celebrateShareBtn');
  assert.strictEqual(btn.style.display, '', 'Share shown');
  btn.click();
  assert.strictEqual(ui.window.__shares, 1, 'one listener after two calls');
  assert.strictEqual(ui.doc.querySelectorAll('.confetti-piece').length, 0, 'no confetti');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__timers)), [5000, 5000], 'hold times unchanged: 5 s with Share');
  ui.window.__timers.length = 0;
  ui.window.triggerCelebration('check', 'Program created', 'Add exercises.', false);
  ui.window.triggerCelebration('trophy', 'Graduated', '', true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ui.window.__timers)), [2200, 2800], '2.2 s small, 2.8 s big');
  assert.strictEqual(ui.$('celebrateShareBtn').style.display, 'none', 'no share data: no Share');
});

test('criterion 2: real source (comments stripped): no spawnConfetti, CONFETTI_COLORS or confetti class remain; triggerCelebration keeps its parameter list', (assert)=>{
  assert.ok(!/\bspawnConfetti\b/.test(SCRIPT), 'no spawnConfetti');
  assert.ok(!/\bCONFETTI_COLORS\b/.test(SCRIPT), 'no CONFETTI_COLORS');
  assert.ok(!/confetti-piece/.test(SCRIPT) && !/confetti-piece/.test(strip(CSS)), 'no confetti-piece class in script or styles');
  assert.ok(!/@keyframes\s+confetti/.test(CSS), 'no confetti keyframes');
  assert.match(extractFunction(src, 'triggerCelebration'), /^function triggerCelebration\(iconName, text, sub, big, shareData\)\{/);
  // Every caller still passes the same shapes (seven callers outside the PR branch, plus the PR branch).
  assert.ok((SCRIPT.match(/\btriggerCelebration\(/g) || []).length >= 9, 'the callers are all still there');
});

const RULES = (()=>{
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const out = [];
  const walk = (l, media) => { for(const r of l){ if(r.selectorText) out.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } };
  walk(window.document.styleSheets[0].cssRules, '');
  return out;
})();
const rule = (sel, media = '') => { const f = RULES.filter(x => x.r.selectorText === sel && x.media === media); if(f.length !== 1) throw new Error(`${sel} @${media}: ${f.length}`); return f[0].r.style; };

test('criterion 3: CSSOM: the moment sits above the tab bar (bottom from --above-bar, no top:50%), no gold edge or glow, taps only on its own box; the icon has no spin', (assert)=>{
  const b = rule('.celebrate-banner');
  assert.match(b.getPropertyValue('bottom'), /--above-bar/);
  assert.ok(!/50%/.test(b.getPropertyValue('top')), 'not centred');
  for(const {r} of RULES.filter(x => /\.celebrate-banner/.test(x.r.selectorText))){
    const sh = r.style.getPropertyValue('box-shadow'), bc = r.style.getPropertyValue('border-color') + r.style.getPropertyValue('border');
    assert.ok(!/plate-yellow/.test(sh + bc), r.selectorText + ': no gold');
    assert.ok(!/(\d+px\s+){2}[1-9]\d*px/.test(sh.replace(/var\([^)]*\)/g, '')), r.selectorText + ': no blurred shadow');
    const pe = r.style.getPropertyValue('pointer-events');
    if(pe === 'auto') assert.strictEqual(r.selectorText, '.celebrate-banner.active', 'pointer events on its own (active) box only');
  }
  assert.strictEqual(b.getPropertyValue('pointer-events'), 'none', 'inactive: not in the way');
  assert.strictEqual(b.getPropertyValue('border-radius'), '14px');
  assert.match(b.getPropertyValue('background'), /^var\(--spot\b/, 'the day\'s ink');
  for(const {r} of RULES.filter(x => x.r.selectorText.split(',').some(s => s.trim() === '.celebrate-icon'))){
    assert.ok(!/rotate|celebrate-icon-pop/.test(r.style.getPropertyValue('animation') + r.style.getPropertyValue('animation-name')), 'no icon spin');
  }
  assert.ok(!/@keyframes\s+celebrate-icon-pop/.test(CSS), 'the pop keyframes are gone');
  // The motion: 220 ms in, 160 ms out, opacity and transform only.
  assert.match(rule('.celebrate-banner.active').getPropertyValue('transition'), /opacity 220ms .*transform 220ms/);
  assert.match(b.getPropertyValue('transition'), /opacity 160ms/);
});

test('criterion 4: CSSOM under prefers-reduced-motion: reduce: the moment has transition:none', (assert)=>{
  const m = RULES.find(x => /prefers-reduced-motion:\s*reduce/.test(x.media) && x.r.selectorText.split(',').map(s => s.trim()).includes('.celebrate-banner'));
  assert.ok(m, 'a reduce-motion rule names .celebrate-banner');
  assert.strictEqual(m.r.style.getPropertyValue('transition'), 'none');
});

test('criterion 5: the PR moment says what the finish sheet says: "Heaviest weight yet" from the one labeller, called from both (the real PR call, evaluated)', (assert)=>{
  const call = (() => { const a = src.indexOf("triggerCelebration('trophy', bestLabel('weight')"); if(a < 0) throw new Error('PR call not found'); return src.slice(a, src.indexOf('});', a) + 3); })();
  const ui = mount();
  ui.window.eval(`(function(){ const ex = {name: 'Bench Press'}, weightValRaw = '185', activeDay = 'd1';
    function fmtWeight(lb){ return lb + ' lb'; } function toCanonicalLb(v){ return Number(v); }
    ${call} })();`);
  assert.strictEqual(ui.$('celebrateText').textContent, 'Heaviest weight yet');
  assert.strictEqual(ui.$('celebrateSub').textContent, 'Bench Press — 185 lb');
  ui.$('celebrateShareBtn').click();
  assert.strictEqual(ui.window.__shares, 1, 'the share card data is unchanged and wired');
  assert.ok(/headline:'NEW PR'/.test(call), 'the share card keeps its own headline (MKT cards own their copy)');
  assert.strictEqual(ui.window.bestLabel('weight'), 'Heaviest weight yet');
  assert.strictEqual(ui.window.bestLabel('e1rm'), 'Best estimated 1RM yet');
  const uses = (SCRIPT.match(/\bbestLabel\(/g) || []).length;
  assert.strictEqual(uses, 3, 'defined once and called from the PR branch and the finish sheet (' + uses + ')');
  assert.ok(/bestLabel\(b\.type\)/.test(strip(extractFunction(src, 'openFinishSheet'))), 'the finish sheet uses it');
  assert.ok(!/'Heaviest weight yet'/.test(strip(extractFunction(src, 'openFinishSheet'))), 'with no copy of its own');
});

run();
