'use strict';
// Dev tooling for the Plate & Press mock-ups (not loaded by the app). Re-renders every PNG in renders/ and
// directions/renders/ with Playwright Chromium: screens at 402×874, DPR 2, dark and light (prefers-color-scheme
// emulation); story cards at 1080×1920, DPR 1. Waits for both font files before each shot.
// Run: node tools/design/render.js            (everything)
//      node tools/design/render.js today pr   (only files whose name starts with one of the arguments)
const path = require('path');
const { chromium } = require('playwright');

const D = __dirname;
const SCREENS = [
  ['today.html', 'renders/today'], ['today-yellow.html', 'renders/today-yellow'], ['log-set.html', 'renders/log-set'],
  ['pr.html', 'renders/pr'], ['progress.html', 'renders/progress'], ['recap.html', 'renders/recap'],
  ['directions/a-today.html', 'directions/renders/a-today'], ['directions/b-today.html', 'directions/renders/b-today'],
  ['directions/c-today.html', 'directions/renders/c-today'],
];
const CARDS = [
  ['directions/a-card.html', 'directions/renders/a-card'], ['directions/b-card.html', 'directions/renders/b-card'],
  ['directions/c-card.html', 'directions/renders/c-card'],
];
const only = process.argv.slice(2);
const want = f => !only.length || only.some(o => path.basename(f).startsWith(o));

(async () => {
  const browser = await chromium.launch();
  const shoot = async (file, out, opts, scheme) => {
    const ctx = await browser.newContext({ ...opts, colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(D, file));
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
    const dest = path.join(D, out + '-' + scheme + '.png');
    await page.screenshot({ path: dest });
    console.log(dest.replace(D + '/', ''), 'fonts:', [...new Set(fonts)].join(', ') || 'NONE');
    await ctx.close();
  };
  for (const [f, o] of SCREENS) if (want(f)) for (const s of ['dark', 'light'])
    await shoot(f, o, { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 }, s);
  for (const [f, o] of CARDS) if (want(f)) {
    const c = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1, colorScheme: 'dark' });
    const page = await c.newPage();
    await page.goto('file://' + path.join(D, f));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(D, o + '.png') });
    console.log(o + '.png');
    await c.close();
  }
  await browser.close();
})();
