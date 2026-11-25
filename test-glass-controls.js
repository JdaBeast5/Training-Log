'use strict';
// Controls under Glass & glow (v3.287, owner-chosen concept A). Supersedes the
// v3.280 flat-controls test (git mv keeps its history) — but keeps its core:
// every filled control's text passes WCAG AA. The old fills failed (white on the
// blue gradient 3.1-3.6:1, on green 1.7-2.0:1); the new blue->purple gradient is
// built so EVERY stop passes with white, and green fills carry dark ink.
//
//  - Primary (.save-btn): a pill in the --cta-gradient-blue gradient with the
//    --cta-glow ("press me"); no gloss layer, no sheen stripe.
//  - Secondary controls: frosted glass (--glass-fill + --glass-hair) pills.
//  - --shine-gloss stays a no-op `none`.
// Contrast is computed from the REAL :root values, every gradient stop.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-glass-controls.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const { document } = new JSDOM(`<!DOCTYPE html><style>${styleText}</style>`).window;

function allRules(){
  const out = [];
  // 2026-10-28 (v3.477): the light appearance's token block is skipped — this
  // suite checks the dark design of record (test-light-mode.js covers light).
  // 2026-11-03 (v3.490): likewise the open-posture block, which widens
  // --wrap-max on an unfolded foldable (test-duo-open-posture-layout.js).
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules && !(r.media && /prefers-color-scheme:\s*light|min-width:\s*760px|viewport-segments/.test(r.media.mediaText))) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
const rule = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length} rules`); return f[0].style; };
const root = () => rule(':root');
function resolve(name){
  let v = root().getPropertyValue(name).trim();
  for(let i = 0; i < 5 && /^var\(/.test(v); i++) v = root().getPropertyValue(v.match(/var\((--[\w-]+)\)/)[1]).trim();
  return v;
}
const hexes = v => v.match(/#[0-9a-f]{6}/gi) || [];
function lum(hex){
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const GREEN_FILLS = ['.day-done-badge', '.supplement-row.done .supplement-check', '.grocery-item.done .grocery-check', '.program-rec-btn', '.recipe-log-btn, .supplement-add-btn'];
// 2026-11-25 (v3.660, UX-39): .show-more-btn left this list: it is a ruled row now (test-show-more-row.js).
const GLASS_SECONDARY = ['.switch-profile-btn', '.custom-toggle', '.adapt-workout-toggle', '.reorder-btn', '.settings-cog'];

// 2026-11-16 (v3.580, UX-03, flat ground): the gradients are retired. The primary is ink (--text on --ground);
// green fills are --spot-green with --on-green; the primary no longer glows
// (--cta-glow is none on every screen but Gym mode).
test('REAL contrast (v3.580, UX-03): the ink primary reads in both themes (dark #F2F2F0 / #0C0C0D, light #111112 / #F3F3F1)', (assert)=>{
  assert.ok(contrast('#0c0c0d', '#f2f2f0') >= 4.5);
  assert.ok(contrast('#f3f3f1', '#111112') >= 4.5);
});

test('REAL CSSOM + contrast (v3.580, UX-03): every green fill is --spot-green with --on-green ink, which reads', (assert)=>{
  const green = resolve('--plate-green');
  assert.ok(contrast(green, '#0c0c0d') >= 4.5, `#0C0C0D on ${green}`);
  for(const sel of GREEN_FILLS){
    assert.strictEqual(rule(sel).getPropertyValue('background'), 'var(--spot-green)', sel);
    assert.strictEqual(rule(sel).getPropertyValue('color'), 'var(--on-green)', sel);
  }
});

test('REAL CSSOM (v3.580, UX-03): the primary .save-btn is a flat ink pill — no gradient, no glow, no gloss, no sheen stripe', (assert)=>{
  const b = rule('.save-btn');
  assert.strictEqual(b.getPropertyValue('background'), 'var(--text)');
  assert.strictEqual(b.getPropertyValue('color'), 'var(--ground)');
  assert.strictEqual(b.getPropertyValue('border-radius'), 'var(--radius-pill)');
  const flat = allRules().find(r => r.selectorText === ':root body' && !r.parentRule);
  assert.strictEqual(flat.style.getPropertyValue('--cta-glow').trim(), 'none', 'the glow is off outside Gym mode');
  assert.strictEqual(allRules().filter(r => r.selectorText === '.save-btn::after').length, 0);
  assert.strictEqual(root().getPropertyValue('--shine-gloss').trim(), 'none');
});

test('REAL CSSOM: secondary controls are frosted glass and do not glow', (assert)=>{
  for(const sel of GLASS_SECONDARY){
    const st = rule(sel);
    assert.match(st.getPropertyValue('background'), /var\(--glass-fill\)/, `${sel} is glass`);
    assert.match(st.getPropertyValue('border'), /var\(--glass-hair\)/, `${sel} has the glass hairline`);
    assert.doesNotMatch(st.getPropertyValue('box-shadow'), /cta-glow|plate-/, `${sel} must not glow`);
  }
});

run();
