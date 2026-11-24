'use strict';
// Dev tooling for planning/slogan.md §10 and MKT-23 (not loaded by the app). Renders the "Step up a plate!" cheer
// concepts with the app's REAL drawing and progression code:
//   - the race bib (drawBibCard via buildShareCardBlob, fed by the real finishSheetModel), today's bib as "before",
//     and three placements A/B/C, in the default ink (Day 1 red) and the hardest ink (yellow), plus a photo bib and a
//     milestone day;
//   - Today at 402 px, dark and light: the cheer on the cover (T1) and on a list row (T2).
// The only change to the app is a prototype patch applied in memory to the served index.html (PATCHES below, each
// asserted to match exactly once). The cheer's condition is the real one MKT-23 specifies: the next-time suggestion
// from computeSuggestedSet (via nextTimeSuggestion) has reason 'increase', its weight is above the lift's weight
// today, and the lift has a logged session before today. Nothing here is written to the repo except renders/.
//
// Run from the repo root: node tools/design/cheer/render.js
// Output: tools/design/cheer/renders/*.png and contact-sheet.png (deviceScaleFactor 2).
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const D = __dirname, ROOT = path.resolve(D, '..', '..', '..'), OUT = path.join(D, 'renders');
const FROZEN_NOW = Date.parse('2026-11-02T23:10:00Z'); // the harness's Monday 2 November 2026, 18:10 New York
const TODAY = '2026-11-02';
const NS = 'trainingLog_usr1:';

// ---- The prototype patch (in memory only) -------------------------------------------------------------------
const PATCHES = [
  // 1. finishSheetModel: the bib's lead lift gets `cheer` only when the real suggestion went up.
  ['leadOut = {name: lead.name, reps: lead.reps, weightLabel: fmtWeight(lead.topLb), unit, note: nxt ? nxt.words : \'\',',
   'const __inp = ((listEl && listEl._finishInputs) || []).find(i => i.ex.name === lead.name);\n'
   + '      const __before = !!__inp && (__inp.log || []).some(e => e && e.date < dateKey && entryHasLoggedSet(e));\n'
   + '      const __up = !!nxt && nxt.reason === \'increase\' && __before && Number(nxt.weight) > toDisplayWeight(lead.topLb);\n'
   + '      leadOut = {cheer: __up ? {next: `${trimUnitNum(nxt.weight)} ${weightUnit}`, step: `+${trimUnitNum(Number(nxt.weight) - toDisplayWeight(lead.topLb))} ${weightUnit}`} : null,\n'
   + '        name: lead.name, reps: lead.reps, weightLabel: fmtWeight(lead.topLb), unit, note: nxt ? nxt.words : \'\','],
  // 2. drawBibCard: options A and C replace the note's two lines.
  ['if(b.lead.note){ ctx.fillStyle = mute;',
   'if(b.lead.note && !(b.lead.cheer && window.__cheerHideNote)){ ctx.fillStyle = mute;'],
  // 3. drawBibCard: the hook, inside the bib's tilt, before the milestone stamp.
  ['  // v3.619 (MKT-17): on the day a milestone is reached, a rubber stamp.\n  // It sits beside',
   '  if(b.lead && b.lead.cheer && typeof window.__drawCheer === \'function\') window.__drawCheer(ctx, {b, x0, y0, bw, bh, y, cx, ink, spot, on, paper, inkText, mute, display});\n'
   + '  // v3.619 (MKT-17): on the day a milestone is reached, a rubber stamp.\n  // It sits beside'],
];
function patched(src){
  for(const [from, to] of PATCHES){
    const n = src.split(from).length - 1;
    if(n !== 1) throw new Error(`patch anchor matched ${n} times (want 1): ${from.slice(0, 60)}`);
    src = src.replace(from, () => to);
  }
  return src;
}

// ---- The three bib placements (drawn in the page, inside the bib's own transform) --------------------------------
// Runs in the page. `opt` is 'A' | 'B' | 'C'.
function installCheer(opt){
  // WCAG relative luminance, for picking an ink that holds 3:1 on the bib's paper (large text).
  const lum = hex => { const c = hex.replace('#', '').match(/../g).map(h => parseInt(h, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const CHEER = 'Step up a plate!';
  window.__cheerHideNote = opt === 'A' || opt === 'C';
  window.__drawCheer = (ctx, k) => {
    const {b, x0, y0, bw, y, cx, ink, spot, on, paper, inkText, mute, display} = k;
    const c = b.lead.cheer;
    // The day's ink where it reads on paper (red, blue, green, off); the bib's black where it doesn't (yellow, white).
    const inkOnPaper = (ink !== 'white' && ratio(spot, paper) >= 3) ? spot : inkText;
    ctx.save();
    if(opt === 'A'){
      // A, "the next line": the note's place, in the display face, with the next weight after it.
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      display(64); ctx.fillStyle = inkOnPaper;
      ctx.fillText(CHEER, x0 + 60, y + 158);
      const w = ctx.measureText(CHEER).width;
      ctx.font = '600 32px Geist, sans-serif'; ctx.fillStyle = mute;
      ctx.fillText(`Next time ${c.next}`, x0 + 60 + w + 22, y + 162);
    } else if(opt === 'B'){
      // B, "the stamp": a second rubber stamp, beside the big number (the milestone's stamp stays by the lead lift).
      const sx = x0 + bw - 128, sy = y0 + 392, sw = 206, sh = 132;
      ctx.translate(sx, sy); ctx.rotate(-7 * Math.PI / 180);
      ctx.strokeStyle = inkOnPaper; ctx.fillStyle = inkOnPaper;
      ctx.lineWidth = 5; ctx.strokeRect(-sw/2, -sh/2, sw, sh);
      ctx.lineWidth = 2; ctx.strokeRect(-sw/2 + 8, -sh/2 + 8, sw - 16, sh - 16);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      display(44); ctx.fillText('STEP UP', 0, -32);
      display(44); ctx.fillText('A PLATE!', 0, 6);
      ctx.font = '700 16px Geist, sans-serif'; ctx.fillText(`NEXT · ${c.next.toUpperCase()}`, 0, 38);
    } else if(opt === 'C'){
      // C, "the second band": a band in the day's ink above the tear-off tabs, echoing the event band.
      const bandInk = ink === 'white' ? inkText : spot, bandOn = ink === 'white' ? '#FFFFFF' : on;
      const top = y + 124, h = 80;
      ctx.fillStyle = bandInk; ctx.fillRect(x0, top, bw, h);
      ctx.textBaseline = 'middle'; ctx.fillStyle = bandOn;
      ctx.textAlign = 'left'; display(60); ctx.fillText(CHEER.toUpperCase(), x0 + 60, top + h/2 + 2);
      ctx.textAlign = 'right'; ctx.font = '700 28px Geist, sans-serif';
      ctx.fillText(`NEXT · ${c.next.toUpperCase()}`, x0 + bw - 60, top + h/2 + 1);
    }
    ctx.restore();
  };
}

// ---- Today placements (DOM, CSS in the cover's own tokens) ------------------------------------------------------
// Runs in the page: the styles only. Which lifts get the cheer is read in the caller from the REAL suggestion classes
// renderWorkout wrote (ex-suggested-increase comes from computeSuggestedSet's reason); a first-ever lift
// (data-first-time) gets none.
function installTodayCheer(){
  const css = document.createElement('style');
  css.textContent = `
    .cover-cheer{margin-top:6px; font-family:var(--font-display); font-weight:800; font-stretch:68%; font-size:26px; line-height:1.05; letter-spacing:.005em;}
    .cover-cheer small{font-family:var(--font-sans); font-stretch:100%; font-weight:600; font-size:var(--meta-on-spot); margin-left:8px; letter-spacing:0;}
    .ex-cheer{font-family:var(--font-sans); font-size:13px; font-weight:700; line-height:1.3; color:var(--text); margin-top:3px; display:flex; align-items:center; gap:6px;}
    .ex-cheer::before{content:''; width:8px; height:8px; border-radius:50%; background:var(--spot, currentColor); flex:none;}
    .ex-cheer span{font-weight:500; color:var(--text-2);}`;
  document.head.appendChild(css);
}

// ---- Seeds ------------------------------------------------------------------------------------------------------
const readFixture = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/visual', f), 'utf8'));
function seedOf(fixture, appVersion, mutate){
  const seed = {};
  for(const [k, v] of Object.entries(fixture)) seed[k] = v === '__APP_VERSION__' ? appVersion : v;
  seed[NS + 'active-view'] = 'today';
  seed[NS + 'weekly-recap-seen'] = TODAY;
  seed[NS + 'week-streak-last-celebrated'] = '8';
  if(mutate) mutate(seed);
  return seed;
}
const editLog = (seed, key, fn) => { const log = JSON.parse(seed[NS + key]); seed[NS + key] = JSON.stringify(fn(log)); };
const BENCH = 'ex:strength:d1:0';
// Bib, cheer: today's Bench logged at the top of 4-6 on every set, so the real engine raises it for next time.
const bibUp = s => editLog(s, BENCH, log => log.map(e => e.date === TODAY
  ? {date: TODAY, sets: [1, 2, 3, 4].map(() => ({weight: 185, reps: 6, rpe: 8}))} : e));
// Today, cheer: Bench's last two sessions at the top of the range (the double-progression signal), today not
// started, so the cover opens on Bench set 1 with the raised target. The store seed also raises Overhead Press.
const atTop = (key, top) => s => editLog(s, key, log => log.filter(e => e.date !== TODAY).map(e =>
  (e.date === '2026-10-19' || e.date === '2026-10-26') ? {date: e.date, sets: e.sets.map(st => ({...st, reps: top}))} : e));
// Barbell Row (7×6-8) at the top of its range twice too, so a raised lift sits in the list below the cover.
const todayUp = s => { atTop(BENCH, 6)(s); atTop('ex:strength:d1:1', 8)(s); };

// ---- Serving and booting ----------------------------------------------------------------------------------------
function serve(src){
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if(p.endsWith('/')) p += 'index.html';
    if(p === '/index.html'){ res.writeHead(200, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}); return res.end(src); }
    const file = path.join(ROOT, path.normalize(p));
    if(!file.startsWith(ROOT + path.sep)){ res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, buf) => {
      if(err){ res.writeHead(404); return res.end(); }
      const t = {'.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {'content-type': t, 'cache-control': 'no-store'}); res.end(buf);
    });
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}
function initScript({seed}){
  try{
    if(!sessionStorage.getItem('__seeded')){ localStorage.clear(); for(const k of Object.keys(seed)) localStorage.setItem(k, seed[k]); sessionStorage.setItem('__seeded', '1'); }
    sessionStorage.setItem('launch-played', '1');
  }catch(e){}
  let t = 0x5eed;
  Math.random = function(){ t = (t + 0x6D2B79F5) | 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
async function settle(page){
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(res => { let tm; const done = () => { o.disconnect(); res(); }; const o = new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(done, 400); }); o.observe(document.documentElement, {subtree: true, childList: true, attributes: true, characterData: true}); tm = setTimeout(done, 400); setTimeout(done, 8000); }));
  await page.evaluate(() => { for(const a of document.getAnimations()){ try{ const t = a.effect.getComputedTiming(); if(t.endTime === Infinity){ a.pause(); a.currentTime = 0; } else a.finish(); }catch(e){} } });
}
async function boot(browser, origin, seed, {theme = 'dark', viewport = {width: 402, height: 874}} = {}){
  const ctx = await browser.newContext({viewport, deviceScaleFactor: 2, colorScheme: theme, timezoneId: 'America/New_York', locale: 'en-US', serviceWorkers: 'block', hasTouch: true});
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); return (u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') ? r.continue() : r.abort('blockedbyclient'); });
  await ctx.addInitScript(initScript, {seed});
  const page = await ctx.newPage();
  await page.clock.setFixedTime(FROZEN_NOW);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  await page.goto(origin + '/index.html', {waitUntil: 'load'});
  await page.waitForFunction(() => typeof BOOT_MARKS !== 'undefined' && BOOT_MARKS.initEnd, null, {timeout: 30000});
  await settle(page);
  return {ctx, page, errors};
}

// One bib, drawn by the real buildShareCardBlob from the real finishSheetModel. opts: {opt, dayId, photo, milestone}.
async function shootBib(page, file, opts){
  const r = await page.evaluate(async ({opt, dayId, photo, milestone, install}) => {
    (0, eval)('(' + install + ')')(opt || 'none');
    if(!opt){ window.__drawCheer = null; window.__cheerHideNote = false; }
    const model = await finishSheetModel(document.getElementById('exerciseList'), selectedLogDate, activeProgram);
    const card = Object.assign({}, model.share);
    card.bib = JSON.parse(JSON.stringify(card.bib));
    if(dayId) card.dayId = dayId;
    if(milestone) card.bib.milestone = milestone;
    if(photo){
      // A stand-in photo (no image asset ships): a dark gym-like gradient with a rack silhouette.
      const c = document.createElement('canvas'); c.width = 1200; c.height = 1800; const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 1800); gr.addColorStop(0, '#3b3f46'); gr.addColorStop(1, '#121315');
      g.fillStyle = gr; g.fillRect(0, 0, 1200, 1800);
      g.fillStyle = '#1b1c1f'; g.fillRect(150, 300, 40, 1500); g.fillRect(1010, 300, 40, 1500); g.fillRect(150, 300, 900, 36);
      g.fillStyle = '#8E8E93'; g.fillRect(60, 760, 1080, 18);
      g.fillStyle = '#2C5BD8'; g.fillRect(90, 650, 50, 240); g.fillRect(1060, 650, 50, 240);
      card.photo = c;
    }
    await waitForShareCardFont(3000);
    const blob = await buildShareCardBlob(card);
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for(let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return {png: btoa(s), cheer: card.bib.lead && card.bib.lead.cheer, note: card.bib.lead && card.bib.lead.note, number: card.bib.number, ink: dayInk(card.dayId ?? activeDay, activeProgram)};
  }, {...opts, install: installCheer.toString()});
  fs.writeFileSync(path.join(OUT, file), Buffer.from(r.png, 'base64'));
  console.log(`renders/${file}  ink ${r.ink}  No. ${r.number}  cheer ${JSON.stringify(r.cheer)}  note "${r.note}"`);
  return r;
}

(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const raw = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const appVersion = raw.match(/const APP_VERSION\s*=\s*'([^']+)'/)[1];
  const server = await serve(patched(raw));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars']});
  const allErrors = [];
  try{
    // ---- Bibs: before (the fixture as it is: Bench 185 × 5, 5, so next time holds and the cheer stays silent) ----
    let s = await boot(browser, origin, seedOf(readFixture('fixture.json'), appVersion));
    const before = await shootBib(s.page, 'bib-before-red.png', {});
    if(before.cheer) throw new Error('before: the cheer showed on a hold');
    const yellowDay = await s.page.evaluate(() => Object.keys(programs[activeProgram].days).find(k => dayInk(k, activeProgram) === 'yellow'));
    allErrors.push(...s.errors); await s.ctx.close();
    // ---- Bibs: the cheer (Bench 185 × 6 on every set today: the engine adds a step for next time) ----
    s = await boot(browser, origin, seedOf(readFixture('fixture.json'), appVersion, bibUp));
    const none = await shootBib(s.page, 'bib-up-nocheer-red.png', {});
    if(!none.cheer) throw new Error('the real engine did not raise Bench; the seed is wrong');
    for(const opt of ['A', 'B', 'C']){
      await shootBib(s.page, `bib-${opt}-red.png`, {opt});
      await shootBib(s.page, `bib-${opt}-yellow.png`, {opt, dayId: yellowDay});
    }
    await shootBib(s.page, 'bib-A-white.png', {opt: 'A', dayId: await s.page.evaluate(() => Object.keys(programs[activeProgram].days).find(k => dayInk(k, activeProgram) === 'white'))});
    await shootBib(s.page, 'bib-A-photo.png', {opt: 'A', photo: true});
    await shootBib(s.page, 'bib-A-milestone.png', {opt: 'A', milestone: 50});
    await shootBib(s.page, 'bib-B-milestone.png', {opt: 'B', milestone: 50});
    allErrors.push(...s.errors); await s.ctx.close();

    // ---- Today, dark and light: T1 on the cover, T2 on a list row ----
    for(const theme of ['dark', 'light']){
      s = await boot(browser, origin, seedOf(readFixture('fixture-store.json'), appVersion, todayUp), {theme});
      const raised = await s.page.evaluate(() => {
        const out = [];
        document.querySelectorAll('#exerciseList .exercise-block').forEach(block => {
          if(block.querySelector('[data-first-time="1"]')) return;
          const w = block.querySelector('.set-row .ex-weight.ex-suggested-increase');
          if(w) out.push({idx: w.closest('.set-row').dataset.exIdx, next: w.placeholder});
        });
        return out;
      });
      console.log(`today ${theme}: raised by the real engine`, JSON.stringify(raised));
      await s.page.evaluate(({raised, install}) => {
        (0, eval)('(' + install + ')')();
        // How much it went up, from the log itself: last session's top weight for that slot.
        const unit = weightUnit;
        const lift = document.getElementById('upNextLift').textContent.trim();
        for(const r of raised){
          const head = document.querySelector(`#exerciseList .exercise input[type=checkbox][data-idx="${r.idx}"]`).closest('.exercise');
          const nameEl = head.querySelector('.ex-name');
          const name = (nameEl.firstChild && nameEl.firstChild.textContent || '').trim();
          const block = head.closest('.exercise-block');
          // Last time's top weight for this slot, from the stored log (what the engine compared against).
          const log = JSON.parse(localStorage.getItem('trainingLog_usr1:ex:' + activeProgram + ':' + activeDay + ':' + r.idx) || '[]');
          const last = log.filter(e => e.date < selectedLogDate).pop();
          const lastTop = last ? Math.max(...last.sets.map(st => Number(st.weight))) : null;
          const step = lastTop != null ? trimUnitNum(Number(r.next) - toDisplayWeight(lastTop)) : '';
          if(name === lift){
            // T1: the cover's own line, under the lift name and its prescription.
            const p = document.createElement('p'); p.className = 'cover-cheer'; p.id = 'upNextCheer';
            p.innerHTML = `Step up a plate!<small>+${step} ${unit} on last time</small>`;
            document.getElementById('upNextTarget').after(p);
          }
          // T2: the list row, under the exercise name (where the +1 set note sits). Not on the row the cover shows.
          if(block.classList.contains('is-now')) continue;
          const n = document.createElement('div'); n.className = 'ex-cheer';
          n.innerHTML = `Step up a plate! <span>${r.next} ${unit}, +${step} on last time</span>`;
          nameEl.after(n);
        }
      }, {raised, install: installTodayCheer.toString()});
      await settle(s.page);
      await s.page.evaluate(() => window.scrollTo(0, 0));
      await s.page.screenshot({path: path.join(OUT, `today-T1-${theme}.png`), animations: 'disabled', caret: 'hide'});
      await s.page.evaluate(() => {
        const el = document.querySelectorAll('#exerciseList .ex-cheer');
        const t = el[el.length - 1] || el[0];
        const y = t.getBoundingClientRect().top + window.scrollY - 260;
        window.scrollTo(0, y);
      });
      await settle(s.page);
      await s.page.screenshot({path: path.join(OUT, `today-T2-${theme}.png`), animations: 'disabled', caret: 'hide'});
      console.log(`renders/today-T1-${theme}.png renders/today-T2-${theme}.png`);
      allErrors.push(...s.errors); await s.ctx.close();
    }
  } finally {
    await browser.close(); server.close();
  }
  if(allErrors.length) console.log('page errors:', allErrors);

  // ---- Contact sheet, DPR 2 ----
  const fig = (f, label, cls = 'b') => `<figure class="${cls}"><img src="${f}"><figcaption>${label}</figcaption></figure>`;
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0; padding:36px; background:#1E1E21; color:#F2F2F0; font:500 15px Geist, system-ui, sans-serif; width:1880px;}
    h1{font:800 34px system-ui; margin:0 0 4px; letter-spacing:-.01em} h2{font:700 20px system-ui; margin:34px 0 12px}
    p.lede{margin:0 0 8px; color:#B4B4B0; max-width:1500px; line-height:1.45}
    .row{display:flex; gap:22px; flex-wrap:wrap; align-items:flex-start}
    figure{margin:0} figcaption{margin-top:8px; line-height:1.35; color:#D8D8D4; max-width:270px}
    figcaption b{color:#fff; font-size:17px; display:block}
    .b img{width:270px; display:block; border-radius:6px} .t img{width:300px; display:block; border-radius:10px; border:1px solid #3A3A3E}
    .t figcaption{max-width:300px}</style>
    <h1>"Step up a plate!" on the bib and on Today</h1>
    <p class="lede">Drawn by the app's real drawBibCard / buildShareCardBlob, fed by the real finishSheetModel, with an in-memory prototype patch (tools/design/cheer/render.js). The cheer appears only when the real next-time suggestion (computeSuggestedSet, reason "increase") is heavier than today and the lift has a session before today. Seed: the harness fixture, Bench 185 lb.</p>
    <h2>The bib, Day 1 red</h2><div class="row">
    ${fig('bib-before-red.png', '<b>Before</b>Today\'s bib (v3.645). Bench 185 × 5, 5: next time holds, so no cheer.')}
    ${fig('bib-up-nocheer-red.png', '<b>Before, raised day</b>Bench 185 × 6 on every set: the note says "up a step", no cheer yet.')}
    ${fig('bib-A-red.png', '<b>A · the next line</b>The cheer takes the note\'s place in the display face, the next weight after it.')}
    ${fig('bib-B-red.png', '<b>B · the stamp</b>A rubber stamp beside the number, the note kept.')}
    ${fig('bib-C-red.png', '<b>C · the second band</b>A band in the day\'s ink above the tear-off tabs, echoing the event band.')}
    </div>
    <h2>Another ink: yellow (the hardest on paper), white, the photo bib, a milestone day</h2><div class="row">
    ${fig('bib-A-yellow.png', '<b>A · yellow</b>Yellow fails 3:1 on paper, so the line goes to the bib\'s black.')}
    ${fig('bib-B-yellow.png', '<b>B · yellow</b>The stamp in black for the same reason.')}
    ${fig('bib-C-yellow.png', '<b>C · yellow</b>The band in yellow with black type, as the event band.')}
    ${fig('bib-A-white.png', '<b>A · white</b>A rest-day ink, for range.')}
    ${fig('bib-A-photo.png', '<b>A · photo bib</b>MKT-18, on a stand-in photo (no asset ships).')}
    ${fig('bib-A-milestone.png', '<b>A · milestone day</b>The No. 50 stamp and the cheer together: no collision.')}
    ${fig('bib-B-milestone.png', '<b>B · milestone day</b>Two stamps on one bib: the weakness of B.')}
    </div>
    <h2>Today, 402 px: the cheer only on lifts the engine raised (store seed + Bench at the top of 4-6 twice)</h2><div class="row">
    ${fig('today-T1-dark.png', '<b>T1 · cover, dark</b>Under the lift name and prescription.', 't')}
    ${fig('today-T1-light.png', '<b>T1 · cover, light</b>The cover keeps the day\'s ink in both themes.', 't')}
    ${fig('today-T2-dark.png', '<b>T2 · list row, dark</b>Under the exercise name, where the +1 set note sits.', 't')}
    ${fig('today-T2-light.png', '<b>T2 · list row, light</b>', 't')}
    </div>`;
  fs.writeFileSync(path.join(OUT, 'contact.html'), html);
  const b2 = await chromium.launch();
  const ctx = await b2.newContext({viewport: {width: 1952, height: 1000}, deviceScaleFactor: 2});
  const pg = await ctx.newPage();
  await pg.goto('file://' + path.join(OUT, 'contact.html'));
  await pg.waitForLoadState('load');
  await pg.screenshot({path: path.join(OUT, 'contact-sheet.png'), fullPage: true});
  await b2.close();
  console.log('renders/contact-sheet.png');
})().catch(e => { console.error(e); process.exit(1); });
