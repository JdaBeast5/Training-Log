'use strict';
// v3.517 — the name is Platestep (v3.515 shipped Liftnext, dropped after
// "NextLift" turned out to be two live 2026 fitness apps). The v3.515 version
// of this test only matched the mixed-case "Training Log", so the share card's
// upper-case 'TRAINING LOG' and the saved file names slipped through; the two
// tests at the end close that gap.
// v3.515 — Training Log is renamed (owner, 2026-11-07). Display name
// only: localStorage keys, the service-worker cache prefix and the backup
// format keep their training-log names, so nothing stored on a phone moves.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const src = readIndexSource();
const { test, run } = makeRunner('test-app-rename.js');

test('REAL head: the page title and the iOS home-screen title are Platestep', (assert)=>{
  const doc = new JSDOM(src).window.document;
  assert.strictEqual(doc.title, 'Platestep');
  assert.strictEqual(doc.querySelector('meta[name="apple-mobile-web-app-title"]').content, 'Platestep');
  assert.strictEqual(doc.getElementById('headerEyebrow').textContent, 'Platestep');
  assert.strictEqual(doc.querySelector('#userPickerOverlay .eyebrow').textContent, 'Platestep');
});

test('REAL manifest: name and short name are Platestep; icons are untouched', (assert)=>{
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  assert.strictEqual(m.name, 'Platestep');
  assert.strictEqual(m.short_name, 'Platestep');
  assert.strictEqual(m.icons.length, 4, 'anchor: the icon list is still there');
});

test('REAL invocation: verifyBackupFile names Platestep when the data section is missing', (assert)=>{
  const { window } = runJsdom('', '', [extractConst(src, 'APP_NAME'), extractFunction(src, 'verifyBackupFile'),
    'window.__r = verifyBackupFile(JSON.stringify({version:1}));']);
  assert.strictEqual(window.__r.ok, false, 'anchor: rejected');
  assert.match(window.__r.error, /not a Platestep backup/);
});

test('REAL source: no visible "Training Log" left outside What\'s New history and comments', (assert)=>{
  const wn = extractConst(src, 'WHATS_NEW');
  const rest = src.replace(wn, '').split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l));
  const left = rest.filter(l => l.includes('Training Log'));
  assert.deepStrictEqual(left, []);
  const ctx = {}; vm.createContext(ctx); vm.runInContext(wn.replace(/^\s*const /, 'var '), ctx);
  assert.match(ctx.WHATS_NEW['3.517'].headline, /Platestep/);
  assert.match(ctx.WHATS_NEW['3.517'].points[0], /export a backup/, 'never tells anyone to re-add the app without a backup');
  assert.match(ctx.WHATS_NEW['3.515'].points[0], /export a backup/, 'nor did the first rename');
});

test('REAL sw.js: the cache keeps its training-log prefix; the offline page says Platestep', (assert)=>{
  const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
  const v = /const VERSION = '([^']+)'/.exec(sw)[1];
  const ctx = { self: { addEventListener(){} }, caches: {}, URL, console };
  vm.createContext(ctx); vm.runInContext(sw, ctx);
  assert.strictEqual(vm.runInContext('CACHE', ctx), 'training-log-v' + v);
  assert.ok(sw.includes("'Platestep is offline"), 'offline message');
  assert.ok(!sw.split('\n').some(l => !/^\s*\/\//.test(l) && /['"`]Training Log/.test(l)), 'no old name in a string');
});

// A canvas stand-in that records every string drawn with fillText.
function shareCardText(){
  const drawn = [];
  const { window } = runJsdom('', `
    window.__drawn = [];
    var ICONS = {};
    window.Path2D = function(){};
    const fakeCtx = new Proxy({}, {
      get(t, k){
        if(k === 'fillText') return (txt) => window.__drawn.push(String(txt));
        if(k === 'measureText') return (txt) => ({ width: String(txt).length * 20 });
        if(k in t) return t[k];
        if(typeof k === 'string' && /^create/.test(k)) return () => ({ addColorStop(){} });
        return () => {};
      },
      set(t, k, v){ t[k] = v; return true; },
    });
    const realCreate = document.createElement.bind(document);
    document.createElement = (tag) => tag === 'canvas'
      ? { width: 0, height: 0, getContext: () => fakeCtx, toBlob: (cb) => cb(null) }
      : realCreate(tag);`,
    // v3.547 (MKT-03): the card is drawn in the day's ink (dayInk) with the
    // Sash mark beside the name, so its helpers come along.
    [extractConst(src, 'APP_NAME'), ...['programs', 'DAY_INKS', 'CUSTOM_PLATES', 'SHARE_CARD_INKS', 'SASH_ORDER'].map(c => extractConst(src, c)),
     "var activeProgram = 'strength', activeDay = 'd1';",
     ...['dayInk', 'shareCardFootRow', 'drawSashMark', 'drawShareCardFoot', 'drawStoryCard'].map(f => extractFunction(src, f)),
     extractFunction(src, 'wrapCanvasText'), extractFunction(src, 'celebrationIconPath'), extractFunction(src, 'buildShareCardBlob'),
     'buildShareCardBlob({headline:"New best", detail:"Bench 160 x 5", icon:"trophy"});']);
  return [...window.__drawn];
}

test('REAL invocation: the share card prints the app name in capitals, never the old name', (assert)=>{
  const drawn = shareCardText();
  assert.ok(drawn.includes('New best'), 'anchor: the card really drew its headline');
  assert.ok(drawn.includes('PLATESTEP'), 'the footer is the app name');
  assert.ok(!drawn.some(t => /training log|liftnext/i.test(t)), 'no old name anywhere on the card: ' + drawn.join(' | '));
});

test('REAL source: saved files carry the app name — the shared image and the backup', (assert)=>{
  const files = src.split('\n').filter(l => /new File\(\[blob\]|a\.download = /.test(l));
  assert.strictEqual(files.length, 3, 'anchor: the three places the app names a saved file (the third is the symptom summary, which never carried the app name)');
  // v3.547 (MKT-03): <slug>-<kind>-<date>.png (platestep-pr-2026-11-30.png).
  assert.ok(files.some(l => l.includes('new File([blob], `${appSlug()}-${cardData.kind || \'card\'}-${getTodayKey()}.png`')), 'the shared image is platestep-<kind>-<date>.png');
  // v3.572 (MKT-20): the backup takes the same appSlug() as the card.
  assert.ok(files.some(l => l.includes('a.download = `${appSlug()}-backup-')), 'the backup is platestep-backup-…');
  assert.ok(!files.some(l => /training-log/.test(l)), 'no old name in either');
  assert.ok(!src.includes("fillText('TRAINING LOG'"), 'the hard-coded card footer is gone');
});

// v3.572 (MKT-20): no string literal outside comments carries the old name,
// apart from an explicit allowlist measured at v3.528:
//   - the What's New history (past entries name what the app was called);
//   - the Diagnostics cache-name reads ('training-log-v…' is the cache prefix,
//     which keeps its name on purpose: renaming it strands installed copies);
//   - the AI cross-metric prompt's lower-case "training-log data", left as it
//     is (2026-11-16) because that prompt sits in the "fixed, unverified live"
//     AI internals (CLAUDE.md).
// Sabotage: restore the training-log-backup- literal and this fails.
test('MKT-20 criterion 4: no non-comment line names Training Log, TRAINING LOG or training-log, apart from the allowlist', (assert)=>{
  const lines = src.split('\n');
  // Lines inside /* ... */ blocks are comments.
  const inBlock = new Array(lines.length).fill(false);
  let open = false;
  lines.forEach((l, i) => { const starts = l.includes('/*'), ends = l.includes('*/'); if(open || starts) inBlock[i] = true; if(starts && !ends) open = true; if(ends) open = false; });
  const wnStart = lines.findIndex(l => /^const WHATS_NEW = \{/.test(l));
  const wnEnd = lines.findIndex((l, i) => i > wnStart && /^\};/.test(l));
  assert.ok(wnStart > 0 && wnEnd > wnStart, 'anchor: the What\'s New object');
  const hits = [];
  lines.forEach((l, i) => {
    if(!/Training Log|TRAINING LOG|training-log/.test(l)) return;
    if(inBlock[i] || /^\s*\/\//.test(l)) return;
    if(i > wnStart && i < wnEnd) return;                        // What's New history
    if(/training-log data across/.test(l)) return;              // the AI prompt (allowlisted, see above)
    if(/'training-log-v'|'training-log-'/.test(l)) return;      // Diagnostics cache-name reads
    hits.push(`${i + 1}: ${l.trim().slice(0, 120)}`);
  });
  assert.deepStrictEqual(hits, []);
});

run();
