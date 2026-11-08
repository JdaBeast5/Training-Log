'use strict';
// TOOL-01: the visual harness. Dev tooling only; it never changes the app.
//
//   node tools/visual/harness.js                 shoot the working tree
//   node tools/visual/harness.js --base <rev>    ...and diff every state against <rev>
//
// Options:
//   --rev <rev>     shoot a commit instead of the working tree (git archive, so
//                   the checkout is never touched)
//   --base <rev>    also shoot <rev> and report a per-state diff against it
//   --out <dir>     output root (default tools/visual/out)
//   --only <ids>    comma-separated state ids, for a quick look at a few
//   --store         store-screenshot mode: shoot the store-* frames at 440x956
//                   DPR 3 and compose the Apple (1320x2868) and Play (1080x1920)
//                   images (planning/store/screenshots.md). Output in <out>/store/
//
// Output (all under --out, which is gitignored):
//   <label>/<state>.png      one PNG per state (label = "worktree" or a short sha)
//   <label>/run.json         state list, request counts, timings
//   contact-sheet.png        every state on one sheet (changed states framed red
//                            when --base is given)
//   diff/<state>.png         base vs head diff image, changed states only
//   diff/report.json         per-state result: same | changed (pixels) | missing
//   store/...                --store only: capture/, apple/, play/, contact-sheet.png
//
// Determinism comes from: a committed fixture (fixture.json, Jordan on
// Strength & Size with Bench history), a frozen Date, the launch animation
// preset as already played, a seeded Math.random, a fixed timezone and locale,
// blocked service workers, document.fonts.ready awaited, a quiet-DOM settle, and
// every animation finished before the shot. Every request that is not to the
// harness's own localhost server is aborted and counted; a non-zero count fails
// the run.
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const HERE = __dirname;
const ROOT = path.resolve(HERE, '..', '..');

// Monday 2 November 2026, 18:10 in New York (EST, UTC-5). The fixture's
// "today" is this date; Day 1 is in progress.
const FROZEN_NOW = Date.parse('2026-11-02T23:10:00Z');
const TODAY_KEY = '2026-11-02';
const TIMEZONE = 'America/New_York';
const LOCALE = 'en-US';
const DPR = 2;

const SIZES = { 402: { width: 402, height: 874 }, 904: { width: 904, height: 678 } };
const VIEWS = [
  // [state name, VIEW_RENDERERS key]
  ['today', 'today'],
  ['food', 'log'],
  ['progress', 'analysis'],
  ['history', 'history'],
];

// ---- Store mode (--store) ------------------------------------------------------
// planning/store/screenshots.md. Shot at the 6.9" iPhone logical size, 440x956
// at DPR 3, which is exactly Apple's 1320x2868. Play's 1080x1920 is composed
// from the same capture (2868/1320 is over Play's 2:1 limit, so it can't be
// reused as-is).
const STORE = {
  viewport: { width: 440, height: 956 }, dpr: 3,
  apple: { width: 1320, height: 2868, band: 516, pad: 64, font: 92, radius: 60 },
  play: { width: 1080, height: 1920, band: 300, pad: 44, font: 60, radius: 36 },
  ground: '#0b0b0e', ink: '#f5f5f7', accent: '#ff453a', // near-black; Day 1's plate red as a hairline
};

// In-page steps for the store frames. Each runs after boot, before the settle,
// and only calls the app's own functions or the elements a user would tap.
// Scrolls put the target just under the sticky header.
const STORE_STEPS = {
  // The day's workout card leads, with the first exercise open.
  today: () => {
    const first = document.querySelector('#exerciseList > .exercise-block');
    if(first && !first.classList.contains('open')) setExerciseBlockOpen(first, true);
    return 'workoutCard';
  },
  // Overhead Press (slot 2) open, so its double-progression badge reads.
  progression: () => {
    const idx = document.querySelector('#exerciseList [data-ex-idx="2"]');
    const block = idx && idx.closest('.exercise-block');
    if(!block) throw new Error('store-progression: no exercise block for slot 2');
    if(!block.classList.contains('open')) setExerciseBlockOpen(block, true);
    return block;
  },
  // The Training Style card: overview (open by default), the program
  // description and "What this is based on" opened, as two taps would.
  program: () => {
    const head = document.getElementById('programHeader');
    const wrap = document.getElementById('programExpandWrap');
    if(wrap && !wrap.classList.contains('open')) head.click();
    const basis = document.querySelector('#programSourceNote .program-basis-toggle[aria-expanded="false"]');
    if(basis) basis.click();
    return head.closest('.card');
  },
  // Training Trends open (seeded), scrolled to Exercise Progress. (The PR
  // timeline the storyboard names lives on History, not Analysis.)
  progress: () => document.getElementById('exerciseProgress').closest('.card'),
  // Settings, at the backup and restore rows.
  backup: () => {
    document.getElementById('settingsCog').click();
    return document.querySelector('#settingsOverlay [data-jump-to="exportDataBtn"]').closest('.settings-section');
  },
};

function buildStoreStates(){
  const base = { group: 'store', theme: 'dark', size: 'store', viewport: STORE.viewport, dpr: STORE.dpr, motion: 'no-preference', fixture: 'store' };
  return [
    { ...base, n: 1, id: 'store-today', caption: 'Tells you what to lift next', view: 'today', step: 'today' },
    { ...base, n: 2, id: 'store-gym', caption: 'One tap logs the set', view: 'today', gym: true },
    { ...base, n: 3, id: 'store-progression', caption: 'Adds weight when you earn it', view: 'today', step: 'progression' },
    { ...base, n: 4, id: 'store-program', caption: 'Programs that show their sources', view: 'today', step: 'program' },
    { ...base, n: 5, id: 'store-progress', caption: 'Every record, every week', view: 'analysis', step: 'progress',
      storage: { 'analysis-group-collapsed:insights': 'true', 'analysis-group-collapsed:body-health': 'true', 'analysis-group-collapsed:training': 'false' } },
    { ...base, n: 6, id: 'store-deload', caption: 'Deload weeks are planned in', view: 'today', step: 'today', fixture: 'store-deload' },
    { ...base, n: 7, id: 'store-backup', caption: 'Your log stays on your phone', view: 'today', step: 'backup' },
  ];
}

// ---- The state matrix ------------------------------------------------------
function buildStates(){
  const states = [];
  for(const w of [402, 904]){
    for(const theme of ['dark', 'light']){
      for(const [name, view] of VIEWS){
        states.push({ id: `${name}-${theme}-${w}`, group: `${w}`, view, theme, size: w, motion: 'no-preference' });
      }
    }
  }
  for(const theme of ['dark', 'light']){
    states.push({ id: `gym-${theme}-402`, group: 'extra', view: 'today', theme, size: 402, motion: 'no-preference', gym: true });
    states.push({ id: `rest-${theme}-402`, group: 'extra', view: 'today', theme, size: 402, motion: 'no-preference', rest: true });
    states.push({ id: `firstrun-${theme}-402`, group: 'extra', theme, size: 402, motion: 'no-preference', firstRun: true });
  }
  // The Reduce Motion pass: the states where motion matters most, with
  // prefers-reduced-motion: reduce emulated.
  states.push({ id: 'today-dark-402-rm', group: 'reduce', view: 'today', theme: 'dark', size: 402, motion: 'reduce' });
  states.push({ id: 'gym-dark-402-rm', group: 'reduce', view: 'today', theme: 'dark', size: 402, motion: 'reduce', gym: true });
  states.push({ id: 'rest-dark-402-rm', group: 'reduce', view: 'today', theme: 'dark', size: 402, motion: 'reduce', rest: true });
  states.push({ id: 'firstrun-dark-402-rm', group: 'reduce', theme: 'dark', size: 402, motion: 'reduce', firstRun: true });
  return states;
}

// ---- CLI -------------------------------------------------------------------
function parseArgs(argv){
  const a = { rev: null, base: null, out: path.join(HERE, 'out'), only: null, store: false };
  for(let i = 0; i < argv.length; i++){
    const k = argv[i];
    const v = () => { const x = argv[++i]; if(x === undefined) throw new Error(`${k} needs a value`); return x; };
    if(k === '--rev') a.rev = v();
    else if(k === '--base') a.base = v();
    else if(k === '--out') a.out = path.resolve(v());
    else if(k === '--only') a.only = v().split(',').map(s => s.trim()).filter(Boolean);
    else if(k === '--store') a.store = true;
    else if(k === '-h' || k === '--help'){ console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 25).join('\n')); process.exit(0); }
    else throw new Error(`unknown option ${k}`);
  }
  return a;
}

function git(args){ return execSync(`git ${args}`, { cwd: ROOT, encoding: 'utf8' }).trim(); }

// A commit's files, extracted to a temp dir. The checkout is never touched.
function snapshot(rev){
  const sha = git(`rev-parse --verify ${JSON.stringify(rev + '^{commit}')}`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `visual-${sha.slice(0, 8)}-`));
  execSync(`git archive --format=tar ${sha} | tar -x -C ${JSON.stringify(dir)}`, { cwd: ROOT, shell: '/bin/bash' });
  return { dir, label: sha.slice(0, 8), sha, temp: true };
}

// ---- A tiny static server (localhost only) ----------------------------------
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};
function serve(dir){
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let p = decodeURIComponent(url.pathname);
    if(p.endsWith('/')) p += 'index.html';
    const file = path.join(dir, path.normalize(p));
    if(!file.startsWith(dir + path.sep)){ res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, buf) => {
      if(err){ res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(buf);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// ---- Seeding -----------------------------------------------------------------
function appVersionOf(dir){
  const m = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').match(/const APP_VERSION\s*=\s*'([^']+)'/);
  if(!m) throw new Error(`no APP_VERSION in ${dir}/index.html`);
  return m[1];
}

function seedFor(state, fixture, appVersion){
  if(state.firstRun) return {}; // an empty device: no profiles at all
  const seed = {};
  for(const [k, v] of Object.entries(fixture)) seed[k] = v === '__APP_VERSION__' ? appVersion : v;
  const ns = 'trainingLog_usr1:';
  seed[ns + 'active-view'] = state.view;
  if(state.gym){
    // In the gym for 23 minutes; restoreGymMode re-enters gym mode on boot.
    seed[ns + 'gym-session'] = JSON.stringify({ date: TODAY_KEY, accumMs: 0, startedAt: FROZEN_NOW - 23 * 60 * 1000 });
  }
  if(state.rest){
    // Resting after Bench set 2: 2:30 left of 4:00. restoreRestTimer resumes it.
    seed[ns + 'rest-timer-state'] = JSON.stringify({ endsAt: FROZEN_NOW + 150 * 1000, total: 240 });
  }
  // Store frames only: window.storage preferences (e.g. Analysis groups).
  if(state.storage) for(const [k, v] of Object.entries(state.storage)) seed[ns + k] = v;
  return seed;
}

// Runs in the page before any of its scripts, on every navigation.
function initScript({ seed }){
  try{
    if(!sessionStorage.getItem('__visual_seeded')){
      localStorage.clear();
      for(const k of Object.keys(seed)) localStorage.setItem(k, seed[k]);
      sessionStorage.setItem('__visual_seeded', '1');
    }
    // The launch preset: the cold-launch mark has already played this session.
    sessionStorage.setItem('launch-played', '1');
  }catch(e){}
  // A seeded Math.random (mulberry32), so any rotating copy picks the same line.
  let t = 0x5eed;
  Math.random = function(){
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Shooting ----------------------------------------------------------------
async function settle(page){
  await page.evaluate(() => document.fonts.ready);
  // Wait for the DOM to go quiet: 400 ms with no mutation, at most 8 s.
  await page.evaluate(() => new Promise(resolve => {
    let timer = null;
    const done = () => { obs.disconnect(); clearTimeout(cap); resolve(); };
    const obs = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(done, 400); });
    obs.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    timer = setTimeout(done, 400);
    const cap = setTimeout(done, 8000);
  }));
  await page.evaluate(() => document.fonts.ready);
  // Finish what can finish; park what loops at its start.
  await page.evaluate(() => {
    for(const a of document.getAnimations()){
      try{
        const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        if(t && t.endTime === Infinity){ a.pause(); a.currentTime = 0; }
        else a.finish();
      }catch(e){}
    }
    if(document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

// A store frame's step: let the boot render finish, run the step in the page,
// then bring what it returns (an element or an id) to the top of the screen,
// just under whatever sticky bars sit there.
async function runStoreStep(page, state){
  await settle(page);
  const fn = STORE_STEPS[state.step];
  if(!fn) throw new Error(`${state.id}: unknown store step ${state.step}`);
  await page.evaluate(`(() => {
    const t = (${fn})();
    const el = typeof t === 'string' ? document.getElementById(t) : t;
    if(!el) throw new Error(${JSON.stringify(state.id)} + ': store step found no target');
    window.__storeTarget = el;
  })()`);
  await settle(page);
  // Two passes: scrolling can reveal a sticky bar (Today's compact day title)
  // that wasn't there before, so the second pass measures again.
  for(let pass = 0; pass < 2; pass++){
    await page.evaluate(() => {
      const el = window.__storeTarget;
      // A target inside a scrolling panel (Settings) is centred in that panel.
      let box = el.parentElement;
      while(box && box !== document.body){
        const oy = getComputedStyle(box).overflowY;
        if((oy === 'auto' || oy === 'scroll') && box.scrollHeight > box.clientHeight) break;
        box = box.parentElement;
      }
      if(box && box !== document.body){
        const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
        box.scrollTop += (r.top - b.top) - (box.clientHeight - r.height) / 2;
        return;
      }
      // Otherwise the page scrolls, and the target sits below the lowest
      // sticky or fixed bar pinned to the top of the screen.
      let under = 0;
      for(const n of document.querySelectorAll('body *')){
        const cs = getComputedStyle(n);
        if(cs.position !== 'sticky' && cs.position !== 'fixed') continue;
        if(cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const r = n.getBoundingClientRect();
        if(r.height > 0 && r.height < 200 && r.top <= 1 && r.bottom > 0 && r.width > innerWidth / 2) under = Math.max(under, r.bottom);
      }
      const top = el.getBoundingClientRect().top + scrollY - under - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    });
    await settle(page);
  }
  await page.evaluate(() => { delete window.__storeTarget; });
}

async function shootAll({ dir, label }, states, outRoot, fixtures){
  const server = await serve(dir);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const appVersion = appVersionOf(dir);
  const outDir = path.join(outRoot, label);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars', '--disable-lcd-text'],
  });
  const run = { label, appVersion, origin, frozenNow: new Date(FROZEN_NOW).toISOString(), states: [], blocked: [], localRequests: 0, pageErrors: [] };
  try{
    for(const state of states){
      const t0 = Date.now();
      const context = await browser.newContext({
        viewport: state.viewport || SIZES[state.size], deviceScaleFactor: state.dpr || DPR, isMobile: false, hasTouch: true,
        colorScheme: state.theme, reducedMotion: state.motion, forcedColors: 'none',
        timezoneId: TIMEZONE, locale: LOCALE, serviceWorkers: 'block',
      });
      // Everything outside the harness's own server is aborted and counted.
      await context.route('**/*', route => {
        const u = new URL(route.request().url());
        if((u.hostname === '127.0.0.1' || u.hostname === 'localhost') && u.origin === origin){ run.localRequests++; return route.continue(); }
        if(u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
        run.blocked.push({ state: state.id, url: route.request().url() });
        return route.abort('blockedbyclient');
      });
      // WebSockets don't go through route(); none are expected, but count them too.
      context.on('page', p => p.on('websocket', ws => run.blocked.push({ state: state.id, url: ws.url() })));
      await context.addInitScript(initScript, { seed: seedFor(state, fixtures[state.fixture || 'default'], appVersion) });
      const page = await context.newPage();
      await page.clock.setFixedTime(FROZEN_NOW);
      page.on('pageerror', e => run.pageErrors.push({ state: state.id, message: String(e.message || e) }));

      await page.goto(origin + '/index.html', { waitUntil: 'load' });
      if(state.firstRun){
        await page.waitForSelector('#userPickerOverlay.active', { timeout: 15000 });
      }else{
        await page.waitForFunction(() => typeof BOOT_MARKS !== 'undefined' && BOOT_MARKS.initEnd, null, { timeout: 30000 });
        if(state.gym) await page.waitForSelector('body.gym-mode', { timeout: 10000 });
        if(state.rest) await page.waitForSelector('#restTimer.active', { timeout: 10000 });
      }
      if(state.step) await runStoreStep(page, state);
      await settle(page);
      const file = path.join(outDir, `${state.id}.png`);
      await page.screenshot({ path: file, animations: 'disabled', caret: 'hide', scale: 'device' });
      run.states.push({ id: state.id, ms: Date.now() - t0, bytes: fs.statSync(file).size });
      process.stdout.write(`  ${label} ${state.id.padEnd(22)} ${String(Date.now() - t0).padStart(5)} ms\n`);
      await context.close();
    }
  }finally{
    await browser.close();
    server.close();
  }
  fs.writeFileSync(path.join(outDir, 'run.json'), JSON.stringify(run, null, 1) + '\n');
  return { outDir, run };
}

// ---- Diff and contact sheet (both drawn by Chromium; no image deps) --------
async function withPage(fn){
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text'] });
  try{
    const context = await browser.newContext({ viewport: { width: SHEET_WIDTH, height: 900 }, deviceScaleFactor: 1 });
    await context.route('**/*', r => (r.request().url().startsWith('data:') ? r.continue() : r.abort()));
    return await fn(await context.newPage());
  }finally{ await browser.close(); }
}

const dataUrl = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

async function diffStates(states, headDir, baseDir, diffDir){
  fs.rmSync(diffDir, { recursive: true, force: true });
  fs.mkdirSync(diffDir, { recursive: true });
  const report = {};
  const pending = [];
  for(const s of states){
    const h = path.join(headDir, `${s.id}.png`), b = path.join(baseDir, `${s.id}.png`);
    if(!fs.existsSync(h) || !fs.existsSync(b)){ report[s.id] = { result: 'missing' }; continue; }
    if(fs.readFileSync(h).equals(fs.readFileSync(b))){ report[s.id] = { result: 'same', pixels: 0 }; continue; }
    pending.push(s.id);
  }
  if(pending.length){
    await withPage(async page => {
      await page.setContent('<canvas id="c"></canvas>');
      for(const id of pending){
        const r = await page.evaluate(async ([a, b]) => {
          const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
          const [A, B] = await Promise.all([load(a), load(b)]);
          const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
          const px = img => { const c = new OffscreenCanvas(w, h); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
          const pa = px(A), pb = px(B);
          const c = document.getElementById('c'); c.width = w; c.height = h;
          const ctx = c.getContext('2d');
          const out = ctx.createImageData(w, h);
          let n = 0;
          for(let i = 0; i < pa.length; i += 4){
            const same = pa[i] === pb[i] && pa[i + 1] === pb[i + 1] && pa[i + 2] === pb[i + 2] && pa[i + 3] === pb[i + 3];
            if(same){ const g = (pa[i] + pa[i + 1] + pa[i + 2]) / 3 * 0.3 + 160; out.data[i] = out.data[i + 1] = out.data[i + 2] = g; }
            else{ n++; out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 64; }
            out.data[i + 3] = 255;
          }
          ctx.putImageData(out, 0, 0);
          return { pixels: n, total: w * h, sizeChanged: A.width !== B.width || A.height !== B.height, png: c.toDataURL('image/png') };
        }, [dataUrl(path.join(headDir, `${id}.png`)), dataUrl(path.join(baseDir, `${id}.png`))]);
        fs.writeFileSync(path.join(diffDir, `${id}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
        report[id] = r.pixels === 0 && !r.sizeChanged
          ? { result: 'same', pixels: 0, note: 'bytes differ, pixels identical' }
          : { result: 'changed', pixels: r.pixels, share: +(r.pixels / r.total * 100).toFixed(3) };
      }
    });
  }
  fs.writeFileSync(path.join(diffDir, 'report.json'), JSON.stringify(report, null, 1) + '\n');
  return report;
}

const SHEET_WIDTH = 980;
const GROUP_TITLES = {
  402: 'iPhone 402×874: Today, Food, Progress, History (dark, then light)',
  904: 'Duo unfolded 904×678: Today, Food, Progress, History (dark, then light)',
  extra: 'Gym mode, rest timer, first-run sheet (402×874, dark and light)',
  reduce: 'Reduce Motion pass (402×874, dark)',
};

async function contactSheet(states, headDir, file, meta, report){
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fig = s => {
    const r = report && report[s.id];
    const changed = r && r.result === 'changed';
    return `<figure class="${s.size === 904 ? 'w' : 'p'}${changed ? ' changed' : ''}"><img src="${dataUrl(path.join(headDir, `${s.id}.png`))}"><figcaption>${esc(s.id)}${changed ? ` · ${r.pixels} px` : ''}</figcaption></figure>`;
  };
  const section = g => {
    const gs = states.filter(s => s.group === g);
    return gs.length ? `<section><h2>${esc(GROUP_TITLES[g])}</h2><div class="row g${g}">${gs.map(fig).join('')}</div></section>` : '';
  };
  const html = `<!doctype html><html><head><style>
    *{box-sizing:border-box;margin:0}
    body{background:#16161a;color:#e8e8ec;font:12px/1.3 "DejaVu Sans",sans-serif;padding:16px;width:${SHEET_WIDTH}px}
    h1{font-size:15px;font-weight:600;margin-bottom:2px} .meta{color:#9a9aa4;margin-bottom:6px}
    h2{font-size:12px;font-weight:600;color:#c4c4cc;margin:12px 0 6px}
    .row{display:flex;flex-wrap:wrap;gap:8px} .g904{max-width:760px}
    .pair{display:flex;gap:28px}
    figure{display:flex;flex-direction:column;gap:3px}
    img{display:block;border:1px solid #2c2c33;border-radius:3px}
    .p img{width:84px} .w img{width:178px}
    .p{width:84px} .w{width:178px}
    figcaption{color:#9a9aa4;font-size:9px;overflow-wrap:anywhere}
    .changed img{border:3px solid #ff2d55} .changed figcaption{color:#ff6b86}
  </style></head><body>
  <h1>Platestep visual harness: ${esc(meta.label)} (v${esc(meta.appVersion)})</h1>
  <div class="meta">${esc(meta.line)}</div>
  ${section('402')}${section('904')}
  <div class="pair">${section('extra')}${section('reduce')}</div>
  </body></html>`;
  await withPage(async page => {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
    await page.screenshot({ path: file, fullPage: true });
  });
  return fs.statSync(file).size;
}

// ---- Store frames: caption composite and contact sheet ------------------------
// Both stores' images are drawn by Chromium from the 1320x2868 capture: the
// caption in a band at the top on an opaque near-black ground, the capture
// scaled into the rest with rounded corners. No network, no image deps. The
// caption is set in Geist, the app's own font, read from the shot's fonts/.
function fontFace(dir){
  const f = path.join(dir, 'fonts', 'geist-latin-wght-normal.woff2');
  return fs.existsSync(f)
    ? `@font-face{font-family:"StoreCaption";src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format("woff2");font-weight:100 900}`
    : '';
}

function storeFrameHtml(spec, caption, capture, face){
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // The capture is fitted into the space under the band, keeping its ratio.
  const h = spec.height - spec.band - spec.pad;
  const w = Math.round(h * STORE.apple.width / STORE.apple.height);
  return `<!doctype html><html><head><style>${face}
    *{box-sizing:border-box;margin:0}
    html,body{width:${spec.width}px;height:${spec.height}px;background:${STORE.ground};overflow:hidden}
    body{font-family:"StoreCaption","DejaVu Sans",sans-serif;color:${STORE.ink}}
    .band{height:${spec.band}px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 ${spec.pad}px;gap:${Math.round(spec.font * 0.42)}px}
    .rule{width:${Math.round(spec.font * 0.9)}px;height:${Math.max(3, Math.round(spec.font / 18))}px;border-radius:2px;background:${STORE.accent}}
    h1{font-size:${spec.font}px;font-weight:700;line-height:1.06;letter-spacing:-0.025em;text-align:center;text-wrap:balance;max-width:${spec.width - spec.pad * 2}px}
    .shot{display:block;margin:0 auto;width:${w}px;height:${h}px;border-radius:${spec.radius}px;
      box-shadow:0 0 0 ${Math.max(2, Math.round(spec.radius / 20))}px rgba(255,255,255,0.14)}
  </style></head><body><div class="band"><div class="rule"></div><h1>${esc(caption)}</h1></div>
  <img class="shot" src="${capture}"></body></html>`;
}

async function composeStore(states, captureDir, outRoot, face){
  const made = { apple: [], play: [] };
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text'] });
  try{
    for(const store of ['apple', 'play']){
      const spec = STORE[store];
      const dir = path.join(outRoot, store);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const context = await browser.newContext({ viewport: { width: spec.width, height: spec.height }, deviceScaleFactor: 1 });
      await context.route('**/*', r => (r.request().url().startsWith('data:') ? r.continue() : r.abort()));
      const page = await context.newPage();
      for(const s of states){
        await page.setContent(storeFrameHtml(spec, s.caption, dataUrl(path.join(captureDir, `${s.id}.png`)), face), { waitUntil: 'load' });
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
        const file = path.join(dir, `${String(s.n).padStart(2, '0')}-${s.id}.png`);
        // An opaque page and omitBackground off: Chromium writes no alpha, which
        // Play requires. Checked below, not assumed.
        await page.screenshot({ path: file, omitBackground: false });
        const info = pngInfo(file);
        if(info.width !== spec.width || info.height !== spec.height) throw new Error(`${file}: ${info.width}x${info.height}, want ${spec.width}x${spec.height}`);
        if(info.alpha) throw new Error(`${file}: has an alpha channel (PNG colour type ${info.colorType})`);
        made[store].push({ id: s.id, file, ...info });
      }
      await context.close();
    }
  }finally{ await browser.close(); }
  return made;
}

// Width, height and colour type from a PNG's IHDR (types 4 and 6 carry alpha).
function pngInfo(file){
  const b = fs.readFileSync(file);
  if(b.readUInt32BE(12) !== 0x49484452) throw new Error(`${file}: not a PNG`);
  const colorType = b[25];
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType, alpha: colorType === 4 || colorType === 6, bytes: b.length };
}

async function storeContactSheet(states, made, file, meta){
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const row = (store, title, w) => `<section><h2>${esc(title)}</h2><div class="row">${made[store].map((m, i) =>
    `<figure style="width:${w}px"><img style="width:${w}px" src="${dataUrl(m.file)}"><figcaption>${i + 1}. ${esc(states[i].caption)}<br><span>${esc(m.id)}</span></figcaption></figure>`).join('')}</div></section>`;
  const html = `<!doctype html><html><head><style>
    *{box-sizing:border-box;margin:0}
    body{background:#16161a;color:#e8e8ec;font:12px/1.3 "DejaVu Sans",sans-serif;padding:16px;width:${SHEET_WIDTH + 260}px}
    h1{font-size:15px;font-weight:600;margin-bottom:2px} .meta{color:#9a9aa4;margin-bottom:6px}
    h2{font-size:12px;font-weight:600;color:#c4c4cc;margin:14px 0 6px}
    .row{display:flex;flex-wrap:wrap;gap:10px}
    figure{display:flex;flex-direction:column;gap:4px}
    img{display:block;border:1px solid #2c2c33;border-radius:3px}
    figcaption{color:#c4c4cc;font-size:10px} figcaption span{color:#8a8a94}
  </style></head><body>
  <h1>Platestep store frames: ${esc(meta.label)} (v${esc(meta.appVersion)})</h1>
  <div class="meta">${esc(meta.line)}</div>
  ${row('apple', 'App Store, iPhone 6.9": 1320×2868 PNG', 160)}
  ${row('play', 'Google Play, phone: 1080×1920 PNG, no alpha', 160)}
  </body></html>`;
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text'] });
  try{
    const context = await browser.newContext({ viewport: { width: SHEET_WIDTH + 260, height: 900 }, deviceScaleFactor: 1 });
    await context.route('**/*', r => (r.request().url().startsWith('data:') ? r.continue() : r.abort()));
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
    await page.screenshot({ path: file, fullPage: true });
  }finally{ await browser.close(); }
  return fs.statSync(file).size;
}

async function mainStore(args, fixtures){
  if(args.base) throw new Error('--store does not diff; shoot each side with --store [--rev <commit>] and compare the folders');
  let states = buildStoreStates();
  if(args.only){
    const unknown = args.only.filter(id => !states.some(s => s.id === id));
    if(unknown.length) throw new Error(`unknown store frame id(s): ${unknown.join(', ')}`);
    states = states.filter(s => args.only.includes(s.id));
  }
  const root = path.join(args.out, 'store');
  fs.mkdirSync(root, { recursive: true });
  const head = args.rev ? snapshot(args.rev) : { dir: ROOT, label: 'worktree', temp: false };
  try{
    console.log(`store mode: shooting ${head.label} (${states.length} frames, ${STORE.viewport.width}x${STORE.viewport.height} @${STORE.dpr})`);
    const H = await shootAll({ dir: head.dir, label: 'capture' }, states, root, fixtures);
    const blocked = H.run.blocked.length;
    const made = await composeStore(states, H.outDir, root, fontFace(head.dir));
    const line = `${states.length} frames · frozen ${H.run.frozenNow} (${TIMEZONE}) · Chromium · ${STORE.viewport.width}×${STORE.viewport.height} @${STORE.dpr}`
      + ` · ${head.label}${head.sha ? ' ' + head.sha.slice(0, 8) : ''} · outbound requests blocked: ${blocked}`;
    const sheet = path.join(root, 'contact-sheet.png');
    const bytes = await storeContactSheet(states, made, sheet, { label: head.label, appVersion: H.run.appVersion, line });
    fs.writeFileSync(path.join(root, 'store.json'), JSON.stringify({
      label: head.label, appVersion: H.run.appVersion,
      frames: states.map((s, i) => ({ n: s.n, id: s.id, caption: s.caption, apple: path.relative(root, made.apple[i].file), play: path.relative(root, made.play[i].file) })),
    }, null, 1) + '\n');

    console.log('');
    console.log(`captures:      ${states.length} -> ${path.relative(process.cwd(), H.outDir)}/ (1320x2868)`);
    console.log(`apple:         ${made.apple.length} -> ${path.relative(process.cwd(), path.join(root, 'apple'))}/ (1320x2868)`);
    console.log(`play:          ${made.play.length} -> ${path.relative(process.cwd(), path.join(root, 'play'))}/ (1080x1920, no alpha)`);
    console.log(`local requests: ${H.run.localRequests}`);
    console.log(`outbound requests blocked: ${blocked}`);
    for(const b of H.run.blocked) console.log(`  BLOCKED ${b.state}: ${b.url}`);
    if(H.run.pageErrors.length){ console.log(`page errors: ${H.run.pageErrors.length}`); for(const e of H.run.pageErrors) console.log(`  ${e.state}: ${e.message}`); }
    console.log(`contact sheet: ${path.relative(process.cwd(), sheet)} (${(bytes / 1e6).toFixed(2)} MB)`);
    if(blocked > 0) process.exitCode = 2;
  }finally{
    if(head.temp) fs.rmSync(head.dir, { recursive: true, force: true });
  }
}

// ---- Main ----------------------------------------------------------------------
async function main(){
  const args = parseArgs(process.argv.slice(2));
  const readFixture = name => JSON.parse(fs.readFileSync(path.join(HERE, name), 'utf8'));
  if(args.store){
    return mainStore(args, {
      default: readFixture('fixture.json'),
      store: readFixture('fixture-store.json'),
      'store-deload': readFixture('fixture-store-deload.json'),
    });
  }
  let states = buildStates();
  if(args.only){
    const unknown = args.only.filter(id => !states.some(s => s.id === id));
    if(unknown.length) throw new Error(`unknown state id(s): ${unknown.join(', ')}`);
    states = states.filter(s => args.only.includes(s.id));
  }
  const fixtures = { default: readFixture('fixture.json') };
  fs.mkdirSync(args.out, { recursive: true });

  const head = args.rev ? snapshot(args.rev) : { dir: ROOT, label: 'worktree', temp: false };
  const base = args.base ? snapshot(args.base) : null;
  // Its own folder even when --rev names the same commit.
  if(base) base.label = `base-${base.label}`;
  try{
    console.log(`shooting ${head.label} (${states.length} states)`);
    const H = await shootAll(head, states, args.out, fixtures);
    let B = null, report = null;
    if(base){
      console.log(`shooting base ${base.label}`);
      B = await shootAll(base, states, args.out, fixtures);
      report = await diffStates(states, H.outDir, B.outDir, path.join(args.out, 'diff'));
    }

    const blocked = H.run.blocked.length + (B ? B.run.blocked.length : 0);
    const errors = H.run.pageErrors.concat(B ? B.run.pageErrors : []);
    const line = `${states.length} states · frozen ${H.run.frozenNow} (${TIMEZONE}) · Chromium · DPR ${DPR}`
      + ` · outbound requests blocked: ${blocked}` + (base ? ` · diff vs ${base.label.replace(/^base-/, '')}` : '');
    const sheet = path.join(args.out, 'contact-sheet.png');
    const bytes = await contactSheet(states, H.outDir, sheet, { label: head.label, appVersion: H.run.appVersion, line }, report);

    console.log('');
    console.log(`states:        ${states.length} -> ${path.relative(process.cwd(), H.outDir)}/`);
    console.log(`local requests: ${H.run.localRequests}${B ? ` (base ${B.run.localRequests})` : ''}`);
    console.log(`outbound requests blocked: ${blocked}`);
    for(const b of H.run.blocked.concat(B ? B.run.blocked : [])) console.log(`  BLOCKED ${b.state}: ${b.url}`);
    if(errors.length){ console.log(`page errors: ${errors.length}`); for(const e of errors) console.log(`  ${e.state}: ${e.message}`); }
    console.log(`contact sheet: ${path.relative(process.cwd(), sheet)} (${(bytes / 1e6).toFixed(2)} MB)`);
    if(report){
      const changed = Object.entries(report).filter(([, r]) => r.result !== 'same');
      console.log(`diff vs ${base.label}: ${changed.length} of ${states.length} states differ`);
      for(const [id, r] of Object.entries(report)) console.log(`  ${r.result === 'same' ? 'same   ' : r.result.padEnd(7)} ${id}${r.pixels ? `  ${r.pixels} px (${r.share}%)` : ''}`);
    }
    if(blocked > 0) process.exitCode = 2;
  }finally{
    for(const s of [head, base]) if(s && s.temp) fs.rmSync(s.dir, { recursive: true, force: true });
  }
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
