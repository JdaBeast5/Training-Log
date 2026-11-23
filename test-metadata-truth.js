'use strict';
// v3.629 (BIZ-07): truthful page metadata, manifest description and README.
// A shared link previewed blank (no description, no Open Graph tags), and the
// manifest claimed "22 training programs … and AI coaching" while the app has
// more programs and AI needs the user's own key.
//
// Real files: the real index.html head parsed in jsdom, the real manifest.json,
// the real README.md, and the real `programs` object evaluated from the source
// for its key count. Sabotage: put "22 training programs" back in the manifest
// and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractConst } = require('./testHelpers.js');

const { test, run } = makeRunner('test-metadata-truth.js');
const src = readIndexSource();
const doc = new JSDOM(src.slice(0, src.indexOf('</head>') + 7) + '<body></body>').window.document;
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
const PROMISE = 'Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone.';
const meta = sel => { const m = doc.querySelectorAll(sel); return m.length === 1 ? m[0].getAttribute('content') : `(${m.length} matches)`; };

const programCount = (() => {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(extractConst(src, 'programs') + ';this.n = Object.keys(programs).length;', ctx);
  return ctx.n;
})();

test('criterion 1: the parsed head has a description and og:title, og:description, og:image, each once', (assert)=>{
  assert.strictEqual(meta('meta[name="description"]'), PROMISE);
  // Static tags can't read APP_NAME, so every copy of the name is tied to it here.
  const appName = vm.runInNewContext(extractConst(src, 'APP_NAME') + ';APP_NAME');
  assert.ok(appName && appName.length > 2, 'anchor: the real APP_NAME was read');
  for(const [what, v] of [['og:title', meta('meta[property="og:title"]')], ['<title>', doc.title],
    ['iOS title', meta('meta[name="apple-mobile-web-app-title"]')], ['manifest name', manifest.name], ['manifest short_name', manifest.short_name]]){
    assert.strictEqual(v, appName, `${what} is APP_NAME`);
  }
  assert.strictEqual(meta('meta[property="og:url"]'), 'https://jdabeast5.github.io/Training-Log/');
  assert.strictEqual(meta('meta[property="og:description"]'), PROMISE);
  assert.strictEqual(meta('meta[property="og:image"]'), 'https://jdabeast5.github.io/Training-Log/icon-512.png', 'absolute, as previewers need');
  assert.ok(fs.existsSync(path.join(__dirname, 'icon-512.png')), 'the image it names exists');
});

test('criterion 2: the manifest description names no program count, or the real one', (assert)=>{
  assert.ok(programCount >= 20, `anchor: the real programs object was counted (${programCount})`);
  const counts = [...manifest.description.matchAll(/(\d+)\s+(?:\w+\s+)?programs/gi)].map(m => Number(m[1]));
  for(const n of counts) assert.strictEqual(n, programCount, `"${n} … programs" must equal the real ${programCount}`);
  assert.strictEqual(manifest.description, PROMISE);
});

test('criterion 3: no metadata string mentions AI without "your own key"', (assert)=>{
  const strings = [manifest.description, manifest.name, manifest.short_name, doc.title,
    ...[...doc.querySelectorAll('meta[name], meta[property]')].map(m => m.getAttribute('content') || '')];
  assert.ok(strings.length >= 10, 'anchor: the head and manifest strings were read');
  // Any mention of AI at all, not only the old "AI coaching" phrase.
  for(const s of strings) if(/\bAI\b|artificial intelligence/i.test(s)) assert.match(s, /your own key/i, s.slice(0, 80));
  // The README does mention AI; it says the key is the user's own.
  assert.match(readme, /AI features are optional and use your own key/);
});

test('README: the promise, how to install, and the privacy facts, true to the code', (assert)=>{
  assert.ok(readme.includes(PROMISE), 'the promise');
  assert.match(readme, /Add to Home Screen/);
  assert.match(readme, /Your training log is stored on your phone/);
  assert.doesNotMatch(readme, /no data leaves|free forever|subscription/i, 'marketing.md and the BIZ-18 hold');
  // Android's installed app shares the browser's storage; only Safari's doesn't.
  assert.match(readme, /Safari tab on iPhone or iPad\? There the home-screen copy keeps its own storage/);

  for(const label of ['Export my data', 'Import backup', 'AI Features Setup']) assert.ok(src.includes(label) && readme.includes(label), `the README's "${label}" is a real label`);
});

// Every outside host in the app, by what the README calls it. A host the app
// only links to (opened when the user taps it) is listed apart, and checked to
// appear only in links. A new host in index.html fails here until the README
// (or the link list) says what it is.
const CONTACTED = {
  'api.nal.usda.gov': 'USDA FoodData Central',
  'world.openfoodfacts.org': 'Open Food Facts',
  'api.ods.od.nih.gov': 'NIH Dietary Supplement Label Database',
  'cdn.jsdelivr.net': 'jsDelivr',
  'unpkg.com': 'unpkg',
  'api.anthropic.com': 'Anthropic API key',
};
const LINK_ONLY = ['www.youtube.com', 'www.google.com', 'doi.org', 'jdabeast5.github.io'];
test('README: every outside host the app contacts is named; the rest are only links', (assert)=>{
  const hosts = new Set([...src.matchAll(/https:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)].map(m => m[1].toLowerCase()));
  assert.ok(hosts.has('api.nal.usda.gov'), 'anchor: the source\'s hosts were read');
  for(const h of hosts){
    if(LINK_ONLY.includes(h)){
      for(const line of src.split('\n').filter(l => l.includes('https://' + h))){
        assert.match(line, /href=|return `https:|<meta property="og:|^\s*\/\//, `${h} appears only as a link: ${line.trim().slice(0, 90)}`);
      }
      continue;
    }
    assert.ok(h in CONTACTED, `${h} is contacted but not in this test's list`);
    assert.ok(readme.includes(CONTACTED[h]), `the README names ${CONTACTED[h]} (${h})`);
  }
  assert.match(readme, /Links you tap/);
});

test('the manifest keeps its name and icons (test-icon-manifest-paths.js owns the icons)', (assert)=>{
  assert.strictEqual(manifest.name, 'Platestep');
  assert.strictEqual(manifest.icons.length, 4);
});

run();
