'use strict';
// v3.539 (UX-01): design tokens v2, introduced as aliases (no visual change).
// The vocabulary every later UX item switches to (ground, surfaces, rules,
// text levels, spot inks and their on-colours, deep inks, type scale, radii,
// motion) is declared in BOTH the dark :root and the light body:not(.gym-mode)
// rule. Each points at today's value; a comment records its target.
//
// Real invocation: the real <style> is parsed by jsdom's CSSOM (as
// test-light-mode.js does); the targets are read from the real source
// comments; WCAG contrast is computed; the Sash mark's hexes come from the
// real markup parsed by jsdom.
//
// Sabotage: delete one token from the light rule and criterion 1 fails; set
// --spot-red's target to #E0352B (4.4:1 with white) and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-design-tokens-v2.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { window } = new JSDOM(`<style>${CSS}</style>`);
const rules = [...window.document.styleSheets[0].cssRules];
const darkRoot = rules.find(r => r.selectorText === ':root');
const lightRule = rules.filter(r => r.media && /prefers-color-scheme:\s*light/.test(r.media.mediaText))
  .flatMap(r => [...r.cssRules]).find(r => r.selectorText === 'body:not(.gym-mode)');

const INKS = ['red', 'blue', 'yellow', 'green', 'white', 'off'];
const TOKENS = ['--ground', '--surface-1', '--surface-2', '--rule', '--rule-strong', '--text-2', '--text-3',
  ...INKS.map(i => '--spot-' + i), ...INKS.map(i => '--on-' + i), ...['red', 'blue', 'yellow', 'green'].map(i => '--deep-' + i),
  '--fs-caption', '--fs-meta', '--fs-body', '--fs-lead', '--fs-title', '--fs-head', '--fs-figure-m', '--fs-figure-l', '--fs-figure-xl',
  '--r-control', '--r-sheet', '--dur-press', '--dur-ui', '--dur-sheet', '--dur-moment', '--ease-out', '--ease-in-out', '--ease-drawer'];

function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum([r, g, b]){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b){ const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

// The source text of each block's token section, for the recorded targets.
function blockSource(startMarker){
  const i = CSS.indexOf(startMarker);
  if(i === -1) throw new Error('block not found: ' + startMarker);
  const a = CSS.indexOf('[TOKENS v2, v3.539, UX-01]', i);
  if(a === -1) throw new Error('token section not found after ' + startMarker);
  return CSS.slice(a, CSS.indexOf('--ease-drawer', a));
}
const SRC = {dark: blockSource(':root{'), light: blockSource('body:not(.gym-mode){\n      color-scheme:light;')};
function targets(theme){
  const t = {};
  for(const m of SRC[theme].matchAll(/(--[a-z0-9-]+):[^;]*;\s*\/\*\s*target (#[0-9A-Fa-f]{6})\s*\*\//g)) t[m[1]] = m[2].toUpperCase();
  const text = SRC[theme].match(/--text keeps its own definition; its target is (#[0-9A-Fa-f]{6})/);
  if(text) t['--text'] = text[1].toUpperCase();
  return t;
}

test('criterion 1: every new token is defined in the dark :root and in the light body:not(.gym-mode) rule (real CSSOM)', (assert)=>{
  assert.ok(darkRoot && lightRule, 'both rules found');
  const missDark = TOKENS.filter(t => !darkRoot.style.getPropertyValue(t).trim());
  const missLight = TOKENS.filter(t => !lightRule.style.getPropertyValue(t).trim());
  assert.deepStrictEqual(missDark, [], 'dark');
  assert.deepStrictEqual(missLight, [], 'light');
});

// 2026-11-16 (v3.580, UX-03, flat ground): the colour aliases for ground, surfaces, rules and text now hold
// their literal targets (the values each block's comment records); the spot
// inks still point at today's plate colours (UX-05 re-points those).
test('UX-03: ground, surface, rule and text aliases hold their target values in both themes; spot inks still alias the plates', (assert)=>{
  for(const [theme, rule] of [['dark', darkRoot], ['light', lightRule]]){
    const t = targets(theme);
    for(const k of ['--ground', '--surface-1', '--surface-2', '--rule', '--rule-strong', '--text-2', '--text-3']){
      assert.strictEqual(rule.style.getPropertyValue(k).trim().toUpperCase(), t[k], `${theme} ${k}`);
    }
    // 2026-11-17 (v3.600, UX-19): the spot inks reached their targets; only the
    // light blue still aliases its plate (UX-19 criterion 1, below, checks the rest).
    for(const i of INKS){
      const v = rule.style.getPropertyValue('--spot-' + i).trim();
      if(theme === 'light' && i === 'blue') assert.strictEqual(v, 'var(--plate-blue)', 'light spot-blue');
      else assert.strictEqual(v.toUpperCase(), t['--spot-' + i], `${theme} spot-${i} holds its target`);
    }
  }
  assert.strictEqual(darkRoot.style.getPropertyValue('--r-sheet').trim(), 'var(--radius-card)');
});

test('criterion 2: target contrast ≥ 4.5:1 in both themes: on-ink on spot-ink, white on deep-ink, and text, text-2, text-3 on ground', (assert)=>{
  // Each block's own targets were read (not the other theme's by mistake).
  assert.strictEqual(targets('dark')['--ground'], '#0C0C0D');
  assert.strictEqual(targets('light')['--ground'], '#F3F3F1');
  for(const theme of ['dark', 'light']){
    const t = targets(theme);
    for(const i of INKS){
      assert.ok(t['--spot-' + i] && t['--on-' + i], `${theme} ${i}: targets recorded`);
      const c = contrast(t['--on-' + i], t['--spot-' + i]);
      assert.ok(c >= 4.5, `${theme} on-${i} on spot-${i}: ${c.toFixed(2)}:1`);
    }
    for(const i of ['red', 'blue', 'yellow', 'green']){
      const c = contrast('#FFFFFF', t['--deep-' + i]);
      assert.ok(c >= 4.5, `${theme} white on deep-${i}: ${c.toFixed(2)}:1`);
    }
    for(const k of ['--text', '--text-2', '--text-3']){
      assert.ok(t[k], `${theme} ${k}: target recorded`);
      const c = contrast(t[k], t['--ground']);
      assert.ok(c >= 4.5, `${theme} ${k} on ground: ${c.toFixed(2)}:1`);
    }
  }
});

test('criterion 4: the Sash mark\'s hexes (header mark, the five launch layers, option-b.svg) equal the five target spot inks', (assert)=>{
  const t = targets('dark');
  const want = ['red', 'blue', 'yellow', 'green', 'white'].map(i => t['--spot-' + i]).sort();
  const doc = new JSDOM(html).window.document;
  const fills = (els) => [...new Set(els.flatMap(el => [...el.querySelectorAll('[fill]')].map(n => n.getAttribute('fill').toUpperCase())).filter(f => /^#[0-9A-F]{6}$/.test(f) && f !== '#0C0C0D'))].sort();
  assert.deepStrictEqual(fills([doc.querySelector('#brandHome svg')]), want, 'header mark');
  // 2026-11-17 (v3.591, UX-18): the launch draws its five bands as divs with CSS fills
  // (.launch .b25 ... .b5 read --ink-25 ... --ink-5 from the .launch rule), not SVG layers.
  const launchRule = rules.find(r => r.selectorText === '.launch' && !r.parentRule);
  const bandFills = ['25', '20', '15', '10', '5'].map(k => {
    const band = rules.find(r => r.selectorText === '.launch .b' + k);
    assert.ok(band, '.launch .b' + k);
    const m = /^var\((--[\w-]+)\)$/.exec(band.style.getPropertyValue('background').trim());
    return launchRule.style.getPropertyValue(m[1]).trim().toUpperCase();
  });
  assert.strictEqual(doc.querySelectorAll('#launch .band').length, 5, 'five launch bands');
  assert.deepStrictEqual([...bandFills].sort(), want, 'launch bands');
  const icon = new JSDOM(fs.readFileSync(path.join(__dirname, 'tools/design/icon/option-b.svg'), 'utf8'), {contentType: 'image/svg+xml'}).window.document;
  assert.deepStrictEqual(fills([icon.documentElement]), want, 'option-b.svg');
  // 2026-11-17 (v3.600, UX-19 criterion 4): and the live tokens, not just the recorded targets.
  const live = ['red', 'blue', 'yellow', 'green', 'white'].map(i => darkRoot.style.getPropertyValue('--spot-' + i).trim().toUpperCase()).sort();
  assert.deepStrictEqual(live, want, 'the live dark --spot-* values');
});

// ---- v3.580 (UX-03): flat ground everywhere. Real CSSOM over the real
// <style>; Gym mode (out of scope until UX-17) is allowlisted by selector.
// Sabotage: restore a --cta-gradient button rule and criterion 1 fails;
// restore a halo and criterion 5 fails.
const GYM = (sel) => /gym-mode|gym-dock|gym-finishing/.test(sel || '');
function allStyleRules(list){ return [...list].flatMap(r => r.style && r.selectorText != null ? [r] : (r.cssRules ? allStyleRules(r.cssRules) : [])); } // a style rule carries an empty cssRules list in this jsdom, so check style first
const STYLE_RULES = allStyleRules(rules);

test('UX-03 criterion 1: no rule\'s background uses a --cta-gradient token, and none is declared', (assert)=>{
  const hits = STYLE_RULES.filter(r => /--cta-gradient/.test(r.style.getPropertyValue('background') + r.style.getPropertyValue('background-image'))).map(r => r.selectorText);
  assert.deepStrictEqual(hits, []);
  assert.strictEqual(STYLE_RULES.filter(r => r.style.getPropertyValue('--cta-gradient-blue') || r.style.getPropertyValue('--cta-gradient-green')).length, 0);
  assert.ok(STYLE_RULES.length > 1000, 'anchor: rules parsed ' + STYLE_RULES.length);
});

// 2026-11-16 (v3.585, UX-04): the tab bar went opaque, so outside Gym mode nothing blurs.
test('UX-03 criterion 2 (UX-04): no rule outside Gym mode\'s own (out of scope) uses backdrop-filter; the tab bar is opaque', (assert)=>{
  const blurred = STYLE_RULES.filter(r => r.style.getPropertyValue('backdrop-filter') || r.style.getPropertyValue('-webkit-backdrop-filter')).map(r => r.selectorText);
  assert.deepStrictEqual(blurred.filter(sel => !GYM(sel)), []);
  assert.ok(blurred.filter(GYM).length <= 2, 'gym mode: ' + blurred.filter(GYM).join(', '));
});

test('UX-03 criterion 5: no rule outside Gym mode paints a radial-gradient; --aura is none in both themes', (assert)=>{
  const radial = STYLE_RULES.filter(r => !GYM(r.selectorText) && /radial-gradient/.test(r.style.cssText)).map(r => r.selectorText);
  assert.deepStrictEqual(radial, []);
  assert.strictEqual(darkRoot.style.getPropertyValue('--aura').trim(), 'none');
  assert.strictEqual(lightRule.style.getPropertyValue('--aura').trim(), 'none');
});

test('UX-03 criterion 6: the launch paints var(--ground) in both themes; "Create my profile" (a .save-btn) is flat ink', (assert)=>{
  const launch = STYLE_RULES.filter(r => r.selectorText === '.launch').map(r => ({bg: r.style.getPropertyValue('background'), media: r.parentRule && r.parentRule.media ? r.parentRule.media.mediaText : ''})).filter(x => x.bg);
  assert.deepStrictEqual(launch.filter(x => !x.media).map(x => x.bg), ['var(--ground)'], 'the launch ground');
  assert.ok(!launch.some(x => /gradient/.test(x.bg)), 'no halo in any branch: ' + JSON.stringify(launch));
  assert.ok(launch.filter(x => x.media).every(x => /prefers-contrast/.test(x.media)), 'only the Increase Contrast branches override it');
  const doc = new JSDOM(html).window.document;
  assert.ok(doc.getElementById('newUserCreateBtn').classList.contains('save-btn'), 'anchor: the button is a .save-btn');
  const save = STYLE_RULES.find(r => r.selectorText === '.save-btn');
  assert.strictEqual(save.style.getPropertyValue('background'), 'var(--text)');
  assert.strictEqual(save.style.getPropertyValue('color'), 'var(--ground)');
  const darkGround = darkRoot.style.getPropertyValue('--ground').trim(), lightGround = lightRule.style.getPropertyValue('--ground').trim();
  assert.ok(contrast(darkGround, '#F2F2F0') >= 4.5 && contrast(lightGround, '#111112') >= 4.5, 'ink label on the ink button reads in both themes');
});

test('UX-03 criterion 7: manifest.json\'s colours and both theme-color metas equal the target ground of their theme', (assert)=>{
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  assert.deepStrictEqual([m.theme_color, m.background_color], ['#0C0C0D', '#0C0C0D']);
  const doc = new JSDOM(html).window.document;
  const metas = Object.fromEntries([...doc.querySelectorAll('meta[name="theme-color"]')].map(e => [e.getAttribute('media'), e.getAttribute('content')]));
  assert.deepStrictEqual(metas, {'(prefers-color-scheme: dark)': targets('dark')['--ground'], '(prefers-color-scheme: light)': targets('light')['--ground']});
});

test('UX-03: every screen but Gym mode reads the targets: body:not(.gym-mode) points today\'s names at the aliases; :root keeps Gym mode\'s values', (assert)=>{
  const flat = rules.find(r => r.selectorText === 'body:not(.gym-mode)' && !r.parentRule);
  assert.ok(flat, 'the dark flat-ground rule');
  const want = {'--bg': 'var(--ground)', '--surface': 'var(--surface-1)', '--surface2': 'var(--surface-2)', '--line': 'var(--rule)', '--line-bright': 'var(--rule-strong)', '--text-muted': 'var(--text-2)', '--glass-fill': 'var(--surface-1)', '--glass-hair': 'var(--rule)'};
  for(const [k, v] of Object.entries(want)) assert.strictEqual(flat.style.getPropertyValue(k).trim(), v, k);
  assert.strictEqual(darkRoot.style.getPropertyValue('--bg').trim(), '#050507', 'Gym mode keeps its ground');
});

// UX-03 criterion 4 (contrast pass, worktree vs Branch-1) found one new failure: the
// next-set chip, now flat spot blue, put white on the dark --plate-blue (#5B7CFF) at 3.6:1;
// Gym mode shows the same chip, so the fix lives in :root.
test('UX-03 criterion 4: the dark spot blue is its target (Gym mode included), so on-blue text on it clears 4.5:1', (assert)=>{
  const flat = rules.find(r => r.selectorText === 'body:not(.gym-mode)' && !r.parentRule);
  assert.strictEqual(flat.style.getPropertyValue('--spot-blue'), '', 'no override outside Gym mode: one value for every screen');
  const blue = darkRoot.style.getPropertyValue('--spot-blue').trim().toUpperCase();
  assert.strictEqual(blue, targets('dark')['--spot-blue']);
  const onBlue = darkRoot.style.getPropertyValue('--on-blue').trim();
  assert.ok(contrast(onBlue, blue) >= 4.5, `on-blue on spot-blue ${contrast(onBlue, blue).toFixed(2)}`);
});

// 2026-11-16 (v3.589, UX-12): text on History's filled day blocks is chosen per
// theme so every ink clears 4.5:1 (the spot inks stay as they are: they are
// also text, the day's hue).
test('UX-12: the day-block text tokens clear 4.5:1 on their fills in both themes', (assert)=>{
  const res = (st, v) => { v = v.trim(); const m = /^var\((--[\w-]+)\)$/.exec(v); return m ? res(st, st.getPropertyValue(m[1]) || darkRoot.style.getPropertyValue(m[1])) : v; };
  for(const ink of ['red', 'yellow', 'green']){
    for(const [theme, st] of [['dark', darkRoot.style], ['light', lightRule.style]]){
      const on = res(st, st.getPropertyValue('--block-on-' + ink));
      // 2026-11-17 (v3.600, UX-19): the blocks fill with the spot inks (History's .p-* rules), now at their targets.
      const fill = res(st, st.getPropertyValue('--spot-' + ink) || darkRoot.style.getPropertyValue('--spot-' + ink));
      assert.ok(contrast(on, fill) >= 4.5, `${theme} ${ink}: ${on} on ${fill} ${contrast(on, fill).toFixed(2)}`);
    }
  }
});

// ---- v3.600 (UX-19): the spot inks reach their targets ----------------------
// Sabotage: put --spot-red back to var(--plate-red) and criterion 1 fails (and
// test-today-cover.js's criterion 2: white on #FF453A is 3.41:1).
test('UX-19 criterion 1: in both themes the red, yellow, green, white and off spot inks are literal hexes equal to the target on their own line', (assert)=>{
  for(const [theme, marker] of [['dark', ':root{'], ['light', 'body:not(.gym-mode){\n      color-scheme:light;']]){
    const block = CSS.slice(CSS.indexOf(marker));
    for(const ink of ['red', 'yellow', 'green', 'white', 'off']){
      const m = new RegExp(`--spot-${ink}:([^;]+); \\/\\* target (#[0-9A-Fa-f]{6}) \\*\\/`).exec(block);
      assert.ok(m, `${theme} --spot-${ink} line found`);
      assert.match(m[1].trim(), /^#[0-9A-Fa-f]{6}$/, `${theme} --spot-${ink} is a literal, not an alias`);
      assert.strictEqual(m[1].trim().toUpperCase(), m[2].toUpperCase(), `${theme} --spot-${ink} equals its recorded target`);
    }
  }
  assert.strictEqual(darkRoot.style.getPropertyValue('--spot-red').trim(), '#D42F25', 'anchor: the CSSOM agrees');
});

// The accents don't move: every --plate-* keeps its v3.599 value (UX-05's rule).
const PLATES_V3599 = {
  dark: {'--plate-red': '#FF453A', '--plate-blue': '#5B7CFF', '--plate-yellow': '#F5C518', '--plate-green': '#32D74B', '--plate-purple': '#B26BFF', '--plate-orange': '#FF7A33', '--plate-teal': '#2FB8C4', '--plate-white': '#E4E7EB', '--plate-off': '#4A5057'},
  light: {'--plate-red': '#D70015', '--plate-orange': '#B04400', '--plate-yellow': '#8F6200', '--plate-green': '#187A33', '--plate-teal': '#0B7480', '--plate-purple': '#8436D6', '--plate-blue': '#3A57E0'},
};
test('UX-19 criterion 5: every --plate-* accent keeps its v3.599 value in both themes', (assert)=>{
  for(const [theme, rule] of [['dark', darkRoot], ['light', lightRule]]){
    const now = {};
    for(const p of rule.style) if(p.startsWith('--plate-') && !p.endsWith('-rgb')) now[p] = rule.style.getPropertyValue(p).trim();
    assert.deepStrictEqual(now, PLATES_V3599[theme], theme);
  }
});

run();
