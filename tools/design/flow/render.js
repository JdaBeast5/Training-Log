'use strict';
// Dev tooling for planning/backlog.md UX-62 to UX-64, "the session flow" (not loaded by the app): where the
// warm-up ramp, supersets and drop sets live, on Today's cover or in the list and the set sheet.
//
// Renders from the REAL app at the shot commit: the harness's fixture (Jordan, Strength & Size, Day 1 "Upper ·
// Strength", Monday 2 November 2026, 18:10 New York), real boots and real taps (the cover's Log, the warm-up chips'
// own handlers, the rest timer's own close). Each option is a prototype applied in memory only: CSS and DOM added to
// the page by the PROTO functions below, built from the app's own data (the warm-up rows, findNextSetRow, the drop
// branch of computeSuggestedSet through suggestDropWeight, dropSetCue). Nothing here changes index.html.
//
// The day has all three: Bench Press (a barbell lift with a warm-up ramp, shown with Settings > "Build the ramp in
// as sets I can log" on, and today's Bench not started), DB Curl + Triceps Pushdown (a superset), and Lateral Raise
// (an isolation lift where a drop set fits).
//
// Run from the repo root: node tools/design/flow/render.js [warmup|superset|drop ...]
// Output: tools/design/flow/renders/flow-<topic>.png (committed) and renders/cells/*.png at DPR 2 (gitignored).
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const D = __dirname, ROOT = path.resolve(D, '..', '..', '..'), OUT = path.join(D, 'renders');
const FROZEN_NOW = Date.parse('2026-11-02T23:10:00Z');
const TODAY = '2026-11-02';
const NS = 'trainingLog_usr1:';
const PHONE = { width: 402, height: 874 };

// ---- Prototype styles: the cover's own grammar (its ink, --meta-on-spot, the display face) ------------------
const CSS = `
  .flow-line{display:flex; align-items:center; gap:4px; min-height:48px; margin-top:12px; padding-top:4px;
    border-top:1px solid color-mix(in srgb, currentColor 35%, transparent); font-size:var(--meta-on-spot); font-weight:600;}
  .flow-line .flow-what{flex:1 1 auto; min-width:0; font-variant-numeric:tabular-nums;}
  .flow-line .flow-what b{font-family:var(--font-display); font-stretch:68%; font-weight:800; font-size:24px; margin:0 2px;}
  .flow-line button{min-height:44px; min-width:44px; padding:0 8px; background:none; border:0; color:inherit; font:inherit;
    text-decoration:underline; text-underline-offset:4px; cursor:pointer;}
  .flow-line button.flow-go{text-decoration:none; border:1.5px solid currentColor; border-radius:var(--r-control); padding:0 14px;}
  .flow-then{font-size:var(--meta-on-spot); font-weight:500; margin-top:4px;}
  .flow-then b{font-weight:700;}
  .flow-pair{display:grid; gap:2px; margin-top:6px;}
  .flow-pair-row{display:grid; grid-template-columns:30px 1fr auto; align-items:baseline; gap:8px;}
  .flow-pair-row .k{font-weight:700; font-size:var(--meta-on-spot);}
  .flow-pair-row .n{font-size:var(--meta-on-spot); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
  .flow-pair-row .v{font-family:var(--font-display); font-stretch:68%; font-weight:800; font-size:64px; line-height:1; font-variant-numeric:tabular-nums;}
  .flow-pair-row .v small{font-size:28px; margin-left:4px;}
  .flow-pair-row.is-later{opacity:.55;}
  .flow-pair-row.is-later .v{font-size:40px;}
  .flow-tag{display:inline-block; font-size:var(--meta-on-spot); font-weight:700; letter-spacing:.02em;}
  /* UX-17b (being built) removes the "Switch to gym mode?" card; it would cover every frame after a first set. */
  #gymOffer{display:none !important;}
  /* The fixture's in-session weight bumps make each Lateral Raise set a "Heaviest weight yet"; its banner would cover the frames. */
  .celebrate-banner{display:none !important;}
  .flow-line button{white-space:nowrap;}
  .flow-line .flow-what small{display:block; font-weight:500; font-size:13px; opacity:.9;}
`;

// ---- In-page helpers (installed once per page) ----------------------------------------------------------------
function installHelpers(){
  const $ = id => document.getElementById(id);
  const card = () => $('upNext');
  const list = () => $('exerciseList');
  const blockOf = name => [...list().querySelectorAll(':scope > .exercise-block')].find(b => [...b.querySelectorAll('.set-row-owner')].some(o => o.textContent.trim() === name));
  const warmRows = b => [...b.querySelectorAll('.warmup-strip .warmup-set-row')];
  const val = (r, sel) => (r.querySelector(sel) || {}).value || '';
  window.__flow = {
    // Tick whole exercises done without their side effects (a render-only stand-in for having trained them).
    tickBefore(name){
      for(const b of list().querySelectorAll(':scope > .exercise-block')){
        if([...b.querySelectorAll('.set-row-owner')].some(o => o.textContent.trim() === name)) break;
        b.querySelectorAll('.exercise input[type=checkbox]').forEach(c => { c.checked = true; });
      }
      renderAllSetChips(); renderUpNext();
    },
    clearLine(){ document.querySelectorAll('.flow-line, .flow-then, .flow-pair').forEach(e => e.remove()); },
    // ---- Warm-up -------------------------------------------------------------------------------------------
    ramp(){
      const b = blockOf('Bench Press');
      const rows = warmRows(b).filter(r => !r.hidden && r.style.display !== 'none');
      const done = rows.filter(r => (r.querySelector('.warmup-done') || {}).checked);
      const next = rows.find(r => !(r.querySelector('.warmup-done') || {}).checked);
      return {b, rows, done: done.length, next, i: next ? rows.indexOf(next) + 1 : 0,
        w: next ? val(next, '.warmup-weight') : '', reps: next ? val(next, '.warmup-reps') : ''};
    },
    tapWarm(){ // the real chip handler marks the ready step done
      const b = blockOf('Bench Press');
      const chip = b.querySelector(':scope > .warmup-chips .set-chip.is-ready');
      if(!chip) throw new Error('no ready warm-up chip');
      chip.click();
    },
    warmLineC(){ // C: one slim line above Log; the numeral stays the working set
      __flow.clearLine();
      const r = __flow.ramp();
      if(!r.next) return;
      const line = document.createElement('div');
      line.className = 'flow-line';
      line.innerHTML = `<span class="flow-what">Warm-up ${r.i} of ${r.rows.length} · <b>${r.w}×${r.reps}</b></span><button type="button" class="flow-go">Done</button><button type="button">Skip</button>`;
      card().querySelector('.cover-log').before(line);
    },
    warmCoverA(){ // A: the ramp takes the cover's big number until it's done
      const r = __flow.ramp();
      if(!r.next) return;
      $('upNextLabel').textContent = `Warm-up ${r.i} of ${r.rows.length}`;
      $('upNextTarget').textContent = 'Not counted · no rest between steps';
      const [w, u, x] = $('upNextNumeral').children;
      w.textContent = r.w; u.textContent = weightUnit; x.textContent = '×' + r.reps;
      if(typeof renderCoverBar === 'function') renderCoverBar(card(), r.w);
      $('upNextLog').textContent = 'Log warm-up';
      $('upNextChips').style.display = 'none';
      $('upNextCheer').hidden = true;
      const line = document.createElement('div');
      line.className = 'flow-line';
      line.innerHTML = `<span class="flow-what">Then ${r.rows.length - r.i} more, then the working sets</span><button type="button">Skip warm-up</button>`;
      card().querySelector('.cover-log').after(line);
    },
    openBench(){ // Before / B: the ramp is chips in the open exercise in Then (UX-17a, v3.652)
      const b = blockOf('Bench Press');
      if(!b.classList.contains('open')) setExerciseBlockOpen(b, true);
      return b;
    },
    // ---- Superset -------------------------------------------------------------------------------------------
    partner(){ // the next station: the next unlogged row in the pair that belongs to the other lift
      const n = findNextSetRow(list());
      if(!n.row) return null;
      const pair = n.row.closest('.superset-pair');
      if(!pair) return null;
      const rows = [...pair.querySelectorAll('.set-row[data-set-idx]')].filter(r => (r.querySelector('.ex-reps') || {}).value === '');
      const me = n.row.dataset.exIdx;
      const other = rows.find(r => r.dataset.exIdx !== me);
      if(!other) return null;
      const name = (other.querySelector('.set-row-owner') || {}).textContent.trim();
      const w = (other.querySelector('.ex-weight') || {}).placeholder || '';
      const reps = (other.querySelector('.ex-reps') || {}).placeholder || '';
      return {name, w: /^\d/.test(w) ? w : '', reps: /^\d/.test(reps) ? reps : ''};
    },
    ssThenC(){
      __flow.clearLine();
      const p = __flow.partner();
      if(!p) return;
      const el = document.createElement('p');
      el.className = 'flow-then';
      el.innerHTML = `Then <b>${escapeHtml(p.name)}</b>${p.w ? ` · ${p.w}×${p.reps}` : ''} · no rest between`;
      $('upNextTarget').after(el);
    },
    ssPairA(){
      __flow.clearLine();
      const p = __flow.partner();
      const n = findNextSetRow(list());
      if(!p || !n.row) return;
      const [w, , x] = $('upNextNumeral').children;
      const pair = document.createElement('div');
      pair.className = 'flow-pair';
      pair.innerHTML = `<div class="flow-pair-row"><span class="k">A</span><span class="n">${escapeHtml(n.name.trim())}</span><span class="v">${w.textContent}<small>${x.textContent}</small></span></div>`
        + `<div class="flow-pair-row is-later"><span class="k">B</span><span class="n">${escapeHtml(p.name)}</span><span class="v">${p.w}<small>×${p.reps}</small></span></div>`;
      $('upNextNumeral').style.display = 'none';
      $('upNextNumeral').after(pair);
      $('upNextLift').textContent = 'Superset';
      $('upNextBar').hidden = true;
    },
    // ---- Drop set -------------------------------------------------------------------------------------------
    lastLogged(name){
      const b = blockOf(name);
      const rows = [...b.querySelectorAll('.set-row[data-set-idx]')].filter(r => r.querySelector('.set-row-owner') && r.querySelector('.set-row-owner').textContent.trim() === name);
      const last = rows[rows.length - 1];
      return {b, last, w: (last.querySelector('.ex-weight') || {}).value || ''};
    },
    holdRest(){ // the proposal: rest doesn't start until the drop is logged or dismissed
      window.__restTotal = restTimerTotal || 90;
      document.getElementById('restTimerClose').click();
    },
    dropC(name){
      __flow.clearLine();
      const {last, w} = __flow.lastLogged(name);
      const dw = suggestDropWeight(last, Number(w), 1);
      const line = document.createElement('div');
      line.className = 'flow-line';
      line.innerHTML = `<span class="flow-what">Drop set · <b>${dw}</b> ${weightUnit}<small>${escapeHtml(name)} · 25% lighter, no rest</small></span><button type="button" class="flow-go">Log</button><button type="button">Not now</button>`;
      card().querySelector('.cover-log').before(line);
    },
    dropA(name){
      __flow.clearLine();
      const {last, w} = __flow.lastLogged(name);
      const dw = suggestDropWeight(last, Number(w), 1);
      $('upNextLift').textContent = name;
      $('upNextLabel').textContent = 'Drop 1 of 2';
      $('upNextTarget').textContent = dropSetCue(name, 1);
      const [ww, u, x] = $('upNextNumeral').children;
      ww.textContent = dw; u.textContent = weightUnit; x.textContent = '';
      $('upNextLog').textContent = 'Log drop';
      $('upNextChips').style.display = 'none';
      $('upNextHint').style.display = 'none';
      $('upNextBar').hidden = true;
      const line = document.createElement('div');
      line.className = 'flow-line';
      line.innerHTML = `<span class="flow-what">Then rest, then ${escapeHtml(findNextSetRow(list()).name.trim())}</span><button type="button">Skip drop</button>`;
      card().querySelector('.cover-log').after(line);
    },
    restAgain(){ startRestTimer(window.__restTotal || 90); },
    openDropSheet(name){ // Before / B (BL-79, v3.651): the logged chip opens the set sheet; Drop set adds the line
      const {b} = __flow.lastLogged(name);
      if(!b.classList.contains('open')) setExerciseBlockOpen(b, true);
      const chips = [...b.querySelectorAll('.set-chips .set-chip')].filter(c => c.classList.contains('is-done'));
      const chip = chips[chips.length - 1];
      chip.click();
      const add = document.getElementById('setSheetDropBtn');
      if(add) add.click();
    },
  };
}

// ---- Topics: rows are states, columns are options ----------------------------------------------------------------
// Each state is a list of steps run in order; a step is a string (an in-page __flow call) or a Node function.
const logCover = async page => { await page.click('#upNextLog'); await settle(page); };
const closeRest = async page => { await page.evaluate(() => { if(restTimerEndsAt) document.getElementById('restTimerClose').click(); }); await settle(page); };
const scrollTo = sel => async page => { await page.evaluate(s => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, sel); await settle(page); };

const TOPICS = {
  warmup: {
    title: 'The warm-up ramp: on the cover, or in the list',
    note: 'Bench Press, today not started, with Settings > "Build the ramp in as sets I can log" on (it is off by default; with it off the ramp stays the advice line in the open exercise in every option).',
    seed: s => { s[NS + 'warmup-sets-pref'] = '1'; const k = NS + 'ex:strength:d1:0'; const log = JSON.parse(s[k]); s[k] = JSON.stringify(log.filter(e => e.date !== TODAY)); },
    states: [
      { name: 'start: ramp ahead', steps: [] },
      { name: 'in progress: step 1 done', steps: [p => p.evaluate(() => __flow.tapWarm())] },
      { name: 'hand-off: ramp done, set 1', steps: [p => p.evaluate(() => { let r; while((r = __flow.ramp()).next) __flow.tapWarm(); })] },
    ],
    options: [
      { key: 'B', label: 'Before = B: chips in the open exercise (UX-17a, v3.652); the cover shows set 1', after: [p => p.evaluate(() => __flow.openBench()), scrollTo('#exerciseList .exercise-block.open .warmup-chips')] },
      { key: 'A', label: 'A: the ramp takes the cover\'s big number', after: [p => p.evaluate(() => __flow.warmCoverA())] },
      { key: 'C', label: 'C (recommended, with the exercise-auditor): one slim line above Log; the number stays the working set', after: [p => p.evaluate(() => __flow.warmLineC())] },
    ],
  },
  superset: {
    title: 'Supersets: one lift at a time, or the pair as one cover',
    note: 'DB Curl + Triceps Pushdown, the earlier lifts done. The cover already alternates A1 → B1 → A2 (findNextSetRow reads the interleaved rows), and no rest runs between A and B.',
    seed: () => {},
    states: [
      { name: 'in progress: A1 (DB Curl)', steps: [p => p.evaluate(() => __flow.tickBefore('DB Curl')), closeRest] },
      { name: 'hand-off: A1 logged → B1, no rest', steps: [p => p.evaluate(() => __flow.tickBefore('DB Curl')), closeRest, logCover] },
      { name: 'rest: after B1, rest for the pair', steps: [p => p.evaluate(() => __flow.tickBefore('DB Curl')), closeRest, logCover, logCover] },
    ],
    options: [
      { key: 'B', label: 'Before = B: the cover names one lift; the pair shows only in Then', after: [] },
      { key: 'A', label: 'A: the pair as one cover (A big, B smaller)', after: [p => p.evaluate(() => __flow.ssPairA())] },
      { key: 'C', label: 'C (recommended, with the exercise-auditor): alternate as now, plus "Then B · …" to set up the next station', after: [p => p.evaluate(() => __flow.ssThenC())] },
    ],
  },
  drop: {
    title: 'Drop sets: the set sheet only, or offered on the cover',
    note: 'Lateral Raise (isolation, drop-eligible), the earlier lifts done. BL-79 (v3.651) shipped the drop as lines in the set sheet: 25% lighter, then 20%, snapped by computeSuggestedSet.',
    seed: () => {},
    states: [
      { name: 'in progress: the last working set', steps: [p => p.evaluate(() => __flow.tickBefore('Lateral Raise')), closeRest, logCover, closeRest, logCover, closeRest, logCover, closeRest, logCover, closeRest] },
      { name: 'just logged the last set', steps: [p => p.evaluate(() => __flow.tickBefore('Lateral Raise')), closeRest, logCover, closeRest, logCover, closeRest, logCover, closeRest, logCover, closeRest, logCover] },
      { name: 'after the drop (or Not now): rest, then the next lift', steps: [p => p.evaluate(() => __flow.tickBefore('Lateral Raise')), closeRest, logCover, closeRest, logCover, closeRest, logCover, closeRest, logCover, closeRest, logCover] },
    ],
    options: [
      { key: 'B', label: 'Before = B: rest starts; a drop is the logged chip → set sheet → Drop set (BL-79)', after: [], afterBy: { 2: [p => p.evaluate(() => __flow.openDropSheet('Lateral Raise'))] } },
      { key: 'A', label: 'A: the drop takes the cover\'s big number', after: [], afterBy: { 1: [p => p.evaluate(() => { __flow.holdRest(); __flow.dropA('Lateral Raise'); })], 2: [p => p.evaluate(() => { __flow.holdRest(); __flow.restAgain(); })] } },
      { key: 'C', label: 'C (recommended, with the exercise-auditor): a quiet "Drop set · 15 lb" line after the last set; rest waits for it', after: [], afterBy: { 1: [p => p.evaluate(() => { __flow.holdRest(); })], 2: [p => p.evaluate(() => { __flow.holdRest(); __flow.restAgain(); })] }, afterLate: { 1: [p => p.evaluate(() => __flow.dropC('Lateral Raise'))] } },
    ],
  },
};

// ---- Seeds, serving, booting (the visual harness's rules) ----------------------------------------------------------
const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/visual/fixture.json'), 'utf8'));
const appVersion = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/const APP_VERSION\s*=\s*'([^']+)'/)[1];
function seedOf(topic){
  const seed = {};
  for(const [k, v] of Object.entries(fixture)) seed[k] = v === '__APP_VERSION__' ? appVersion : v;
  seed[NS + 'active-view'] = 'today';
  seed[NS + 'weekly-recap-seen'] = TODAY;
  seed[NS + 'week-streak-last-celebrated'] = '8';
  topic.seed(seed);
  return seed;
}
function serve(){
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if(p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, path.normalize(p));
    if(!file.startsWith(ROOT + path.sep)){ res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, buf) => {
      if(err){ res.writeHead(404); return res.end(); }
      const t = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
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
  await page.evaluate(() => new Promise(res => { let tm; const done = () => { o.disconnect(); res(); }; const o = new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(done, 300); }); o.observe(document.documentElement, {subtree: true, childList: true, attributes: true, characterData: true}); tm = setTimeout(done, 300); setTimeout(done, 4000); }));
  await page.evaluate(() => { for(const a of document.getAnimations()){ try{ const t = a.effect.getComputedTiming(); if(t.endTime === Infinity){ a.pause(); a.currentTime = 0; } else a.finish(); }catch(e){} } });
}

async function shoot(browser, origin, topicKey, si, state, theme, opt){
  const topic = TOPICS[topicKey];
  const ctx = await browser.newContext({viewport: PHONE, deviceScaleFactor: 2, colorScheme: theme, timezoneId: 'America/New_York', locale: 'en-US', serviceWorkers: 'block', hasTouch: true});
  const blocked = [];
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if(u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return r.continue(); blocked.push(u.href); return r.abort('blockedbyclient'); });
  await ctx.addInitScript(initScript, {seed: seedOf(topic)});
  const page = await ctx.newPage();
  await page.clock.setFixedTime(FROZEN_NOW);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  await page.goto(origin + '/index.html', {waitUntil: 'load'});
  await page.waitForFunction(() => typeof BOOT_MARKS !== 'undefined' && BOOT_MARKS.initEnd, null, {timeout: 30000});
  await settle(page);
  await page.evaluate(installHelpers);
  await page.addStyleTag({content: CSS});
  // The before-steps of an option (rest held, for instance) run between the state's last tap and its shot.
  const by = (opt.afterBy || {})[si] || [];
  const steps = state.steps.slice();
  for(const s of steps) await s(page);
  await settle(page);
  for(const s of by) await s(page);
  await settle(page);
  for(const s of opt.after) await s(page);
  for(const s of (opt.afterLate || {})[si] || []) await s(page);
  await settle(page);
  // The cover's top is the subject: scroll to the top unless the option scrolled on purpose.
  if(!opt.after.some(f => String(f).includes('scrollTo'))) await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  const file = path.join(OUT, 'cells', `${topicKey}-${si}-${theme}-${opt.key}.png`);
  await page.screenshot({path: file, animations: 'disabled', caret: 'hide'});
  await ctx.close();
  if(blocked.length || errors.length) throw new Error(`${path.basename(file)}: blocked ${blocked.length}, page errors ${errors.join(' | ')}`);
  return file;
}

async function contact(browser, topicKey, cells){
  const topic = TOPICS[topicKey];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const w = 402;
  const rows = [];
  topic.states.forEach((st, si) => { for(const theme of ['dark', 'light']) rows.push({st, si, theme}); });
  const html = `<!doctype html><html><head><style>
    *{box-sizing:border-box;margin:0} body{background:#16161a;color:#e8e8ec;font:15px/1.35 "DejaVu Sans",sans-serif;padding:24px;width:${48 + topic.options.length * (w + 16)}px}
    h1{font-size:26px;font-weight:700;margin-bottom:4px} .meta{color:#a0a0aa;margin-bottom:6px;font-size:14px;max-width:1200px}
    .heads{display:flex;gap:16px;margin:14px 0 8px} .heads div{width:${w}px;font-size:15px;font-weight:700;color:#f0f0f4}
    .row{display:flex;gap:16px;margin-bottom:16px} figure{width:${w}px} figcaption{font-size:13px;color:#a0a0aa;margin-bottom:5px}
    img{display:block;width:${w}px;border:1px solid #33333a;border-radius:4px}
  </style></head><body><h1>${esc(topic.title)}</h1>
  <div class="meta">${esc(topic.note)}</div>
  <div class="meta">Rendered from the real app (v${appVersion}, fixture: Jordan, Mon 2 Nov 2026) with a prototype applied in memory · tools/design/flow/render.js · the "Switch to gym mode?" card is hidden in every frame (UX-17b removes it)</div>
  <div class="heads">${topic.options.map(o => `<div>${esc(o.label)}</div>`).join('')}</div>
  ${rows.map(r => `<div class="row">${topic.options.map(o => `<figure><figcaption>${esc(r.st.name)} · ${r.theme}</figcaption><img src="data:image/png;base64,${fs.readFileSync(cells[`${r.si}-${r.theme}-${o.key}`]).toString('base64')}"></figure>`).join('')}</div>`).join('')}
  </body></html>`;
  const ctx = await browser.newContext({viewport: {width: 1300, height: 900}, deviceScaleFactor: 1});
  await ctx.route('**/*', r => r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const pg = await ctx.newPage();
  await pg.setContent(html, {waitUntil: 'load'});
  await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
  const file = path.join(OUT, `flow-${topicKey}.png`);
  await pg.screenshot({path: file, fullPage: true});
  await ctx.close();
  return file;
}

async function main(){
  const only = process.argv.slice(2);
  fs.mkdirSync(path.join(OUT, 'cells'), {recursive: true});
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars', '--disable-lcd-text']});
  try{
    for(const key of Object.keys(TOPICS)){
      if(only.length && !only.includes(key)) continue;
      const cells = {};
      for(const [si, state] of TOPICS[key].states.entries()) for(const theme of ['dark', 'light']) for(const opt of TOPICS[key].options){
        cells[`${si}-${theme}-${opt.key}`] = await shoot(browser, origin, key, si, state, theme, opt);
      }
      console.log(path.relative(ROOT, await contact(browser, key, cells)));
    }
  }finally{ await browser.close(); server.close(); }
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
