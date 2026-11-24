'use strict';
// Dev tooling for planning/slogan.md (not loaded by the app). Renders the three slogan mock-ups (hero, Year in Lifting
// end card, social profile header) for each of the three shortlisted slogans, a contact sheet of all nine, and a
// fit table for every candidate: its width as tracked caps on the bib's event band (Geist 700, 31 px, .09em, the
// c-card band style) and its line count at the end card's 230 px Archivo condensed size.
// Run: node tools/design/slogan/render.js      (round 1: renders/*.png, fit.json, contact-sheet.png)
//      node tools/design/slogan/render.js 2    (round 2, the Plate + Step lines: renders/r2-*.png, r2-fit.json,
//                                               r2-contact-sheet.png)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const D = __dirname, R = path.join(D, 'renders');
const ROUND = process.argv[2] === '2' ? 2 : 1;
const PRE = ROUND === 2 ? 'r2-' : '';
const CANDIDATES_R2 = [
  'One step to the next plate.', 'The next plate is one step away.', 'Step up to the next plate.',
  'One step closer to the next plate.', 'Step up a plate.', 'One step. One plate.', 'Small steps. Heavy plates.',
  'Step by step. Plate by plate.', 'Every step adds a plate.', 'Every rep a step. Every step a plate.', 'Stack the steps.',
  'Your next step, already planned.', 'We’ll plan the steps. You lift the plates.',
  'Step by step to the next plate.', 'Next step: the next plate.', 'Plate by plate, step by step.',
  'Earn the next plate, step by step.',
];
const CANDIDATES_R1 = [
  'Know what to lift next.', 'Your next set, already planned.', 'The plan and the log, in one.', 'Every set has a target.',
  'A plan for every lifter.', 'Every lifter deserves a plan.', 'Lift with a plan.', 'Learn the lift. Log the work.',
  'Earn the next plate.', 'One plate at a time.', 'Every plate, earned.', 'Stronger, one plate at a time.',
  'Load the bar. Log the set.', 'Less guessing. More lifting.', 'Rack it. Log it.', 'Just lift. We’ll do the math.',
  'Plate by plate.', 'Next plate, please.', 'Lift. Tap. Next.', 'Show up. We’ll do the math.',
];
const CANDIDATES = ROUND === 2 ? CANDIDATES_R2 : CANDIDATES_R1;
const SHOTS = [
  ['hero.html', 'hero', { width: 1280, height: 800 }, 1],
  ['year-end.html', 'year-end', { width: 1080, height: 1920 }, 1],
  ['profile.html', 'profile', { width: 430, height: 760 }, 2],
];

(async () => {
  fs.mkdirSync(R, { recursive: true });
  const browser = await chromium.launch();
  for (const [file, out, viewport, dpr] of SHOTS) for (const s of [1, 2, 3]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(D, file) + '?r=' + ROUND + '&s=' + s);
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))].join(', '));
    await page.screenshot({ path: path.join(R, `${PRE}${out}-${s}.png`) });
    console.log(`renders/${PRE}${out}-${s}.png fonts: ${fonts || 'NONE'}`);
    await ctx.close();
  }

  // Fit table. Band text room: bib 900 px - 2 × 40 padding - 64 Sash tile - 22 gap = 734 px.
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(D, 'year-end.html'));
  await page.evaluate(() => document.fonts.ready);
  const fit = await page.evaluate((list) => list.map(t => {
    const band = document.createElement('span');
    band.style.cssText = "font:700 31px 'Geist'; letter-spacing:.09em; white-space:nowrap; position:absolute; visibility:hidden";
    band.textContent = t.toUpperCase();
    const end = document.createElement('p');
    end.className = 'disp';
    end.style.cssText = 'font-size:230px; width:900px; position:absolute; visibility:hidden';
    end.textContent = t;
    document.body.append(band, end);
    const r = { slogan: t, chars: t.length, charsNoStop: t.replace(/\.$/, '').length,
      bandPx: Math.round(band.getBoundingClientRect().width), endLines: Math.round(end.getBoundingClientRect().height / (230 * .92)) };
    band.remove(); end.remove();
    return r;
  }), CANDIDATES);
  fs.writeFileSync(path.join(R, PRE + 'fit.json'), JSON.stringify(fit, null, 2) + '\n');
  for (const f of fit) console.log(`${f.slogan.padEnd(44)} chars ${String(f.chars).padStart(2)}  band ${String(f.bandPx).padStart(4)}px ${f.bandPx <= 734 ? 'fits' : 'OVER'}  end-card lines ${f.endLines}`);
  await ctx.close();

  // Contact sheet: one column per slogan; hero on top, end card and profile below.
  const col = (s, name) => `<div class="c"><p>${s}. ${name}</p><img class="h" src="${PRE}hero-${s}.png">`
    + `<div class="r"><img class="y" src="${PRE}year-end-${s}.png"><img class="p" src="${PRE}profile-${s}.png"></div></div>`;
  const names = ROUND === 2
    ? ['Plate by plate, step by step.', 'Earn the next plate, step by step.', 'One step to the next plate.']
    : ['Earn the next plate.', 'A plan for every lifter.', 'Load the bar. Log the set.'];
  fs.writeFileSync(path.join(R, PRE + 'contact.html'), `<!doctype html><meta charset="utf-8"><style>
    body{margin:0; background:#2A2A2D; font:600 22px system-ui,sans-serif; color:#F2F2F0; display:flex; gap:28px; padding:28px; width:max-content;}
    .c p{margin:0 0 12px} .h{width:600px; display:block} .r{display:flex; gap:20px; margin-top:20px; justify-content:center}
    .y{height:470px} .p{height:470px}</style>${names.map((n, i) => col(i + 1, n)).join('')}`);
  const sheet = await browser.newContext({ viewport: { width: 1960, height: 900 } });
  const sp = await sheet.newPage();
  await sp.goto('file://' + path.join(R, PRE + 'contact.html'));
  await sp.waitForLoadState('load');
  await sp.screenshot({ path: path.join(R, PRE + 'contact-sheet.png'), fullPage: true });
  console.log(`renders/${PRE}contact-sheet.png`);
  await browser.close();
})();
