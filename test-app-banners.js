'use strict';
// v3.644 (UX-37, owner 2026-11-23: "make the update button match the app"):
// the app banner rail ("Update ready", "Updated to vX", the storage warning)
// is a flat block in the world's ink, not 2.0 glass. A --surface block with a
// 1 px --rule hairline, no tint, glow or blue; title 15/600 in --text, body
// 13 in --text-2; the main action is the app's solid ink button (as the quiet
// cover's Log set: --text on --ground), the other a quiet text button, every
// button at least 44 px; the urgent banner's one colour is a 4 px bar in the
// warning ink. The entrance stays opacity and transform only, instant under
// Reduce Motion. The update flow's logic is untouched (test-whats-new.js).
//
// Real invocation: the real showUpdateBanner, showWhatsNewConfirm and
// renderStorageBanner write the markup into the real rail, under the real
// stylesheet (jsdom's cascade); the CSSOM, media blocks included.
//
// Sabotage: restore the blue primary button and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, extractElementById, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-app-banners.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');

const RULES = (()=>{
  const { window } = new JSDOM(`<style>${CSS}</style>`);
  const out = [];
  const walk = (l, media) => { for(const r of l){ if(r.selectorText) out.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } };
  walk(window.document.styleSheets[0].cssRules, '');
  return out;
})();
const bannerRules = RULES.filter(({r}) => /\.app-banner/.test(r.selectorText));

// The rail as the page has it, the three real writers, the real stylesheet.
function mount(bodyClass = ''){
  const rail = extractElementById(src, 'appBannerRail');
  const { window } = new JSDOM(`<!doctype html><html><head><style>${CSS}</style></head><body class="${bodyClass}">${rail}</body></html>`, { pretendToBeVisual: true, runScripts: 'outside-only' });
  window.eval(`var APP_VERSION = '3.644';
    var storageHealth = {degraded: true, spilled: new Set(['a', 'b'])};
    window.storage = {set: async () => {}};
    function exportData(){} function showView(){} function openWhatsNew(){}
    ${['escapeHtml', 'renderStorageBanner', 'showWhatsNewConfirm'].map(f => extractFunction(src, f)).join('\n')}
    ${extractFunction(src, 'showUpdateBanner')}
    window.__show = { update: () => showUpdateBanner({postMessage(){}}), whatsNew: () => showWhatsNewConfirm([['3.644', {headline: 'x', points: ['y']}]]), storage: () => renderStorageBanner() };`);
  return { window, doc: window.document, cs: el => window.getComputedStyle(el) };
}

test('criterion 1: the real writers keep their markup: the same buttons and ids', (assert)=>{
  const ui = mount();
  ui.window.__show.update();
  assert.ok(ui.doc.getElementById('updateReloadBtn') && ui.doc.getElementById('updateLaterBtn'), 'Reload now and Later');
  assert.match(ui.doc.getElementById('updateReloadBtn').className, /app-banner-btn-primary/);
  const ui2 = mount(); ui2.window.__show.whatsNew();
  assert.ok(ui2.doc.getElementById('whatsNewMoreInfoBtn') && ui2.doc.getElementById('whatsNewConfirmDismissBtn'), 'More info and Dismiss');
  const ui3 = mount(); ui3.window.__show.storage();
  assert.ok(ui3.doc.getElementById('storageBannerExport') && ui3.doc.getElementById('storageBannerPhotos'), 'Export now and Manage photos');
  assert.ok(ui3.doc.querySelector('.app-banner-urgent[role="alert"]'), 'the storage banner is still urgent and an alert');
});

test('criterion 2: no .app-banner* rule has a plate-ink shadow or an rgba(var(--plate-*-rgb)) fill; the banner is flat; the primary is the app\'s main-action ink; every banner button is >= 44 px', (assert)=>{
  assert.ok(bannerRules.length >= 8, 'anchor: the banner rules were read (' + bannerRules.length + ')');
  for(const {r} of bannerRules){
    const sh = r.style.getPropertyValue('box-shadow'), bg = r.style.getPropertyValue('background') + r.style.getPropertyValue('background-color');
    assert.ok(!/plate-|--rim/.test(sh), r.selectorText + ': shadow ' + sh);
    assert.ok(!/rgba\(var\(--plate-/.test(bg), r.selectorText + ': fill ' + bg);
    // The rail's own rules carry no blue (the shared button outside the rail keeps its look).
    if(/^\.app-banner(-rail|-urgent|-info|-title|-body)?\b|app-banner-rail /.test(r.selectorText) && !/^\.app-banner-btn/.test(r.selectorText)) assert.ok(!/--plate-blue/.test(r.style.cssText), r.selectorText + ': no blue');
  }
  const ui = mount();
  ui.window.__show.update();
  const banner = ui.doc.querySelector('.app-banner');
  assert.strictEqual(ui.cs(banner).getPropertyValue('background-color'), 'var(--surface)');
  assert.strictEqual(ui.cs(banner).boxShadow, 'none');
  const title = banner.querySelector('.app-banner-title'), body = banner.querySelector('.app-banner-body');
  assert.strictEqual(ui.cs(title).fontSize, '15px'); assert.strictEqual(ui.cs(title).fontWeight, '600'); assert.strictEqual(ui.cs(title).color, 'var(--text)');
  assert.strictEqual(ui.cs(body).fontSize, '13px'); assert.strictEqual(ui.cs(body).color, 'var(--text-2)');
  // The main action: the quiet cover's Log set ink (--cover-action: --text on --ground).
  const quiet = RULES.find(({r}) => r.selectorText === 'body.cover-quiet .cover').r.style;
  const primary = ui.cs(ui.doc.getElementById('updateReloadBtn'));
  assert.strictEqual(primary.getPropertyValue('background-color'), quiet.getPropertyValue('--cover-action').trim());
  assert.strictEqual(primary.color, quiet.getPropertyValue('--on-cover-action').trim());
  const later = ui.cs(ui.doc.getElementById('updateLaterBtn'));
  assert.ok(['transparent', 'rgba(0, 0, 0, 0)', ''].includes(later.backgroundColor), 'Later is a quiet text button: ' + later.backgroundColor);
  for(const show of ['update', 'whatsNew', 'storage']){
    const u = mount(); u.window.__show[show]();
    const btns = [...u.doc.querySelectorAll('.app-banner-btn')];
    assert.strictEqual(btns.length, 2, show + ': anchor');
    for(const b of btns) assert.ok(parseFloat(u.cs(b).minHeight) >= 44, show + ' ' + b.id + ': ' + u.cs(b).minHeight);
  }
});

test('criterion 3: the urgent banner keeps a 4 px warning bar, and its title in --text on --surface is >= 4.5:1 in both themes', (assert)=>{
  const ui = mount(); ui.window.__show.storage();
  const b = ui.doc.querySelector('.app-banner-urgent');
  // A straight bar down the left edge (a pseudo-element, clipped by the rounded block), not a bent thick border.
  const bar = RULES.find(({r}) => r.selectorText === '.app-banner-urgent::before').r.style;
  assert.strictEqual(bar.getPropertyValue('width'), '4px');
  assert.strictEqual(bar.getPropertyValue('background'), 'var(--plate-red)');
  assert.ok(bar.getPropertyValue('top') === '0px' && bar.getPropertyValue('bottom') === '0px' && bar.getPropertyValue('left') === '0px');
  assert.strictEqual(ui.cs(b).overflow, 'hidden');
  assert.strictEqual(ui.cs(b.querySelector('.app-banner-title')).color, 'var(--text)');
  const get = (sel, prop, light) => { let v = null; for(const {r, media} of RULES){ if(r.selectorText === sel && (!media || (light && /prefers-color-scheme:\s*light/.test(media) && !/contrast/.test(media)))){ const x = r.style.getPropertyValue(prop).trim(); if(x) v = x; } } return v; };
  const resolve = (v, light, d = 0) => v.replace(/var\((--[a-z0-9-]+)\)/g, (m, n) => { const x = (light && (get('body:not(.gym-mode)', n, true) || get(':root:not([data-theme="dark"])', n, true) || get(':root', n, true))) || get(':root', n, false); if(!x || d > 10) throw new Error('unresolved ' + n); return resolve(x, light, d + 1); });
  const lum = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for(const light of [false, true]){
    const t = resolve('var(--text)', light), s = resolve('var(--surface)', light);
    assert.ok(/^#[0-9a-f]{6}$/i.test(t) && /^#[0-9a-f]{6}$/i.test(s), `${t} / ${s}`);
    assert.ok(ratio(t, s) >= 4.5, `${light ? 'light' : 'dark'}: ${ratio(t, s).toFixed(2)}:1`);
  }
});

test('the entrance is opacity and transform only, and instant under Reduce Motion', (assert)=>{
  const base = RULES.find(({r, media}) => r.selectorText === '.app-banner' && !media).r.style;
  assert.match(base.getPropertyValue('animation'), /cardRise/);
  const kf = /@keyframes cardRise\{([^}]*\})\s*\}/.exec(CSS.replace(/\s+/g, ' ').replace(/@keyframes cardRise\s*\{/, '@keyframes cardRise{'));
  assert.ok(kf && !/(?:top|left|height|width|margin)\s*:/.test(kf[1]), 'cardRise moves opacity and transform only');
  const rm = RULES.find(({r, media}) => r.selectorText === '.app-banner' && /prefers-reduced-motion:\s*reduce/.test(media));
  assert.ok(rm, 'a Reduce Motion rule');
  assert.strictEqual(rm.r.style.getPropertyValue('animation'), 'none');
  assert.strictEqual(rm.r.style.getPropertyValue('opacity'), '1');
});

test('placement: the rail stays in the page flow (never over the cover\'s Log button) and is hidden in gym mode', (assert)=>{
  const rail = RULES.filter(({r}) => r.selectorText.split(',').map(x => x.trim()).includes('.app-banner-rail'));
  assert.ok(rail.length >= 1);
  for(const {r} of rail) assert.ok(!/fixed|absolute|sticky/.test(r.style.getPropertyValue('position')), 'not overlaid');
  assert.ok(RULES.some(({r}) => r.selectorText.split(',').map(x => x.trim()).includes('body.gym-mode .app-banner-rail') && /none/.test(r.style.getPropertyValue('display'))), 'hidden in gym mode');
  // The rail comes before Today's cover in the document.
  assert.ok(html.indexOf('id="appBannerRail"') < html.indexOf('id="upNext"'), 'above the cover');
});

test('the shared .app-banner-btn outside the rail keeps its look (exercise editor, diagnostics, AI-key prompt); a focus ring in the rail', (assert)=>{
  const { window } = new JSDOM(`<!doctype html><html><head><style>${CSS}</style></head><body><div class="sheet"><button class="app-banner-btn app-banner-btn-primary" id="p">Save</button><button class="app-banner-btn" id="s">Move earlier</button></div></body></html>`, { pretendToBeVisual: true });
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('p').fontSize, '12px', 'outside the rail: the old size');
  assert.notStrictEqual(cs('s').getPropertyValue('min-height'), '44px', 'no 44 px rail rule outside the rail');
  assert.strictEqual(cs('s').fontSize, '12px');
  assert.ok(RULES.some(({r}) => r.selectorText === '.app-banner-btn-primary' && /--plate-blue/.test(r.style.cssText)), 'the shared primary is unchanged');
  assert.ok(RULES.some(({r}) => r.selectorText === '.app-banner-rail .app-banner-btn:focus-visible' && /outline:\s*2px solid/.test(r.style.cssText)), 'focus ring in the rail');
});

run();
