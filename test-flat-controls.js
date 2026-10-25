'use strict';
// v3.280 (tasteskill rollout): filled controls are flat — no gradient, no white
// gloss layer, no coloured glow — and their text now passes WCAG AA, which the
// old fills did not (measured: white on the blue gradient 3.1-3.6:1, white on
// the green 1.7-2.0:1). The token names are kept so the 16 call sites didn't
// move: --cta-gradient-blue is a flat #3860FF (white text 4.9:1),
// --cta-gradient-green is flat --plate-green with dark ink (--bg) on it, and
// --shine-gloss is a no-op `none`.
//
// Contrast is computed here from the REAL :root values, so a later colour tweak
// that drops a fill below 4.5:1 fails this test rather than shipping.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-flat-controls.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style>`).window;

function allRules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
const rule = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length} rules`); return f[0].style; };
const root = () => rule(':root');
// Resolve a custom property through var() chains to a hex colour.
function resolveHex(name){
  let v = root().getPropertyValue(name).trim();
  for(let i = 0; i < 5 && /^var\(/.test(v); i++) v = root().getPropertyValue(v.match(/var\((--[\w-]+)\)/)[1]).trim();
  if(!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`${name} did not resolve to a hex colour: ${v}`);
  return v;
}
function lum(hex){
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const GREEN_FILLS = ['.day-done-badge', '.supplement-row.done .supplement-check', '.grocery-item.done .grocery-check', '.program-rec-btn', '.recipe-log-btn, .supplement-add-btn'];

test('REAL :root: the CTA fill tokens are flat colours and the gloss layer is a no-op', (assert)=>{
  for(const t of ['--cta-gradient-blue', '--cta-gradient-green', '--shine-gloss']){
    assert.doesNotMatch(root().getPropertyValue(t), /gradient/, `${t} must not be a gradient`);
  }
  assert.strictEqual(root().getPropertyValue('--shine-gloss').trim(), 'none');
});

test('REAL contrast from :root values: white on the blue fill and --bg ink on the green fill both pass 4.5:1', (assert)=>{
  const blue = resolveHex('--cta-gradient-blue');
  const green = resolveHex('--cta-gradient-green');
  const ink = resolveHex('--bg');
  const cb = contrast(blue, '#ffffff'), cg = contrast(green, ink);
  assert.ok(cb >= 4.5, `white on ${blue} is ${cb.toFixed(2)}:1`);
  assert.ok(cg >= 4.5, `${ink} on ${green} is ${cg.toFixed(2)}:1`);
  // Sabotage anchor: the old white-on-green pairing really did fail, so this
  // test is measuring something.
  assert.ok(contrast(green, '#ffffff') < 4.5);
});

test('REAL CSSOM: every green-filled control carries dark ink, not white, and no gloss or glow', (assert)=>{
  for(const sel of GREEN_FILLS){
    const st = rule(sel);
    assert.match(st.getPropertyValue('background'), /--cta-gradient-green/, `${sel} anchor: still a green fill`);
    assert.strictEqual(st.getPropertyValue('color'), 'var(--bg)', `${sel} must use dark ink`);
    assert.strictEqual(st.getPropertyValue('box-shadow'), '', `${sel} must not glow`);
  }
});

test('REAL CSSOM: the primary .save-btn is flat — one token fill, no shadow at rest or pressed, no sheen stripe', (assert)=>{
  const b = rule('.save-btn');
  assert.strictEqual(b.getPropertyValue('background'), 'var(--cta-gradient-blue)');
  assert.strictEqual(b.getPropertyValue('box-shadow'), '');
  assert.strictEqual(rule('.save-btn:active').getPropertyValue('box-shadow'), '');
  assert.strictEqual(allRules().filter(r => r.selectorText === '.save-btn::after').length, 0);
});

run();
