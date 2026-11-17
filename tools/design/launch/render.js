'use strict';
// Dev tooling for the UX-18 launch prototype (not loaded by the app). Renders a frame strip by pausing every
// animation in prototype.html and stepping its currentTime, as was done for v3.516. The open (.is-open) is
// added at OPEN_AT, as the prototype does on a cold launch whose page has already loaded.
// Run: node tools/design/launch/render.js
// Writes: frames.png (402×874, dark and light), frames-duo.png (904×678, dark and light),
//         frames-reduced.png (402×874, Reduce Motion, dark and light), frames-contrast.png (Increase Contrast).
const path = require('path');
const { chromium } = require('playwright');

const D = __dirname;
const OPEN_AT = 900;
const PHONE = { width: 402, height: 874 };
const DUO = { width: 904, height: 678 };
// About 8 frames for the build, and extra around the open so the push-through reads.
const TIMES = [0, 160, 320, 480, 640, 780, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
const DUO_TIMES = [0, 320, 640, 900, 1050, 1200, 1350, 1600];
const REDUCED_TIMES = [0, 250, 350, 450];

async function frames(browser, { viewport, scheme, times, reduced = false, contrast = false }){
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: scheme,
    reducedMotion: reduced ? 'reduce' : 'no-preference', forcedColors: 'none' });
  const page = await ctx.newPage();
  if(contrast) await page.emulateMedia({ contrast: 'more' }).catch(() => {});
  await page.goto('file://' + path.join(D, 'prototype.html') + '#hold');
  await page.evaluate(() => document.body.classList.add('framing'));
  await page.waitForLoadState('load');
  const shots = [];
  for(const t of times){
    await page.evaluate(({ t, OPEN_AT, reduced }) => {
      const el = document.getElementById('launch');
      const openAt = reduced ? 250 : OPEN_AT;
      if(t >= openAt && !el.classList.contains('is-open')) window.__launchOpen();
      for(const a of el.getAnimations({ subtree: true })){
        a.pause();
        const isOpen = /^launchOpen/.test(a.animationName || '');
        a.currentTime = isOpen ? Math.max(0, t - openAt) : t;
      }
    }, { t, OPEN_AT, reduced });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    shots.push({ t, png: (await page.screenshot()).toString('base64') });
  }
  await ctx.close();
  return shots;
}

async function strip(browser, rows, viewport, out, scale){
  const w = Math.round(viewport.width * scale), h = Math.round(viewport.height * scale);
  const html = `<!doctype html><body style="margin:0;background:#202022;font:600 13px -apple-system,system-ui,sans-serif;color:#cfcfcb">
    ${rows.map(r => `<div style="display:flex;gap:6px;padding:8px 8px 0;align-items:flex-start">
      <div style="width:56px;padding-top:4px">${r.label}</div>
      ${r.shots.map(s => `<figure style="margin:0"><img src="data:image/png;base64,${s.png}" style="display:block;width:${w}px;height:${h}px;border-radius:6px">
        <figcaption style="padding:4px 0 2px;text-align:center">${s.t} ms</figcaption></figure>`).join('')}
    </div>`).join('')}<div style="height:8px"></div></body>`;
  const cols = Math.max(...rows.map(r => r.shots.length));
  const ctx = await browser.newContext({ viewport: { width: 8 + 56 + 6 + cols * (w + 6) + 8, height: 200 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html);
  await page.screenshot({ path: path.join(D, out), fullPage: true });
  await ctx.close();
  console.log(out);
}

(async () => {
  const browser = await chromium.launch();
  const phone = [];
  for(const scheme of ['dark', 'light']) phone.push({ label: scheme, shots: await frames(browser, { viewport: PHONE, scheme, times: TIMES }) });
  await strip(browser, phone, PHONE, 'frames.png', 0.5);
  const duo = [];
  for(const scheme of ['dark', 'light']) duo.push({ label: scheme, shots: await frames(browser, { viewport: DUO, scheme, times: DUO_TIMES }) });
  await strip(browser, duo, DUO, 'frames-duo.png', 0.4);
  const red = [];
  for(const scheme of ['dark', 'light']) red.push({ label: scheme + ' RM', shots: await frames(browser, { viewport: PHONE, scheme, times: REDUCED_TIMES, reduced: true }) });
  await strip(browser, red, PHONE, 'frames-reduced.png', 0.5);
  const ic = [];
  for(const scheme of ['dark', 'light']) ic.push({ label: scheme + ' IC', shots: await frames(browser, { viewport: PHONE, scheme, times: [640, 900, 1150], contrast: true }) });
  await strip(browser, ic, PHONE, 'frames-contrast.png', 0.5);
  await browser.close();
})();
