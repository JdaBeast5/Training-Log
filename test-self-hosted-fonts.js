'use strict';
// v3.270: the app's two faces (Inter, IBM Plex Mono) moved from the Google
// Fonts CDN to ./fonts/, so they are same-origin and precached by sw.js. Before
// this, sw.js deliberately passed cross-origin requests (fonts included)
// straight through uncached, so any launch without a network fell back to the
// system face — at the gym, the place the app is most used.
//
// What "correct" means here, checked against the real files rather than by
// string-matching: index.html's parsed stylesheet carries real @font-face rules
// for both families whose src files exist on disk AND are genuine WOFF2 (magic
// bytes), the weights the old Google request loaded are still covered, no
// <link> to the CDN survives in the parsed document, and every font file is in
// sw.js's PRECACHE_OPTIONAL (optional, so a missing font can never block an
// update — see the essential/optional split documented in sw.js).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const ROOT = __dirname;
const { test, run } = makeRunner('test-self-hosted-fonts.js');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// Parse only the document head: it carries the <link>s and the one <style>
// block the @font-face rules live in, and skips 2MB of body markup.
const headOnly = html.slice(0, html.indexOf('</head>') + '</head>'.length) + '<body></body></html>';
const { document } = new JSDOM(headOnly).window;

// jsdom's CSSOM parses @font-face rules but silently drops descriptors it does
// not validate (src, a "100 900" weight range). So the parsed CSSOM is used to
// COUNT the real rules and their families, and the descriptors are read from
// those same rules' text inside the document's <style> elements — with a
// cross-check that both sources see the same faces, so the text reading can't
// drift from what the parser actually recognised (e.g. a face commented out).
function cssomFontFaceFamilies(){
  const out = [];
  for(const sheet of document.styleSheets){
    for(const rule of sheet.cssRules){
      if(rule.type === 5) out.push(rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim());
    }
  }
  return out;
}
function fontFaceRules(){
  const css = [...document.querySelectorAll('style')].map(s => s.textContent)
    .join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => {
    const desc = {};
    for(const decl of m[1].split(';')){
      const i = decl.indexOf(':');
      if(i > 0) desc[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
    }
    return desc;
  });
}
function family(rule){ return (rule['font-family'] || '').replace(/['"]/g, '').trim(); }
function srcUrl(rule){
  const m = /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(rule.src || '');
  return m ? m[1] : null;
}
function weightRange(rule){
  const parts = (rule['font-weight'] || '').split(/\s+/).map(Number);
  return { min: parts[0], max: parts[parts.length - 1] };
}

test('sabotage anchor: the parsed CSSOM and the descriptor reading see the same @font-face families, in the same order', (assert)=>{
  const fromCssom = cssomFontFaceFamilies();
  assert.ok(fromCssom.length >= 2, `the parser must see at least 2 @font-face rules, saw ${fromCssom.length}`);
  assert.deepStrictEqual(fontFaceRules().map(family), fromCssom);
});
function precacheOptional(){
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const m = /const PRECACHE_OPTIONAL = \[([\s\S]*?)\];/.exec(sw);
  if(!m) throw new Error('PRECACHE_OPTIONAL not found in sw.js');
  return m[1].match(/'([^']+)'/g).map(s => s.slice(1, -1));
}

test('REAL DOM: no <link> to the Google Fonts CDN survives in the parsed document', (assert)=>{
  const cdn = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
  assert.strictEqual(cdn.length, 0, 'index.html must not load fonts from Google any more — that is the offline gap this change closes');
});

// v3.276: the faces are Geist + Geist Mono (variable), replacing Inter + IBM
// Plex Mono. The weight bars below are the ones the app's CSS actually uses.
test('REAL CSSOM: exactly one @font-face for Geist, and it covers every text weight the app uses (400-800)', (assert)=>{
  const sans = fontFaceRules().filter(r => family(r) === 'Geist');
  assert.strictEqual(sans.length, 1, `expected one Geist @font-face (variable), found ${sans.length}`);
  const { min, max } = weightRange(sans[0]);
  assert.ok(min <= 400 && max >= 800, `Geist's face must span 400-800, got ${min}-${max}`);
});

test('REAL CSSOM: exactly one @font-face for Geist Mono, covering the 500 and 600 weights the mono figures use', (assert)=>{
  const mono = fontFaceRules().filter(r => family(r) === 'Geist Mono');
  assert.strictEqual(mono.length, 1);
  const { min, max } = weightRange(mono[0]);
  assert.ok(min <= 500 && max >= 600, `Geist Mono must span 500-600, got ${min}-${max}`);
});

test('REAL CSSOM: the :root tokens name the self-hosted families first, and no rule names a face that is no longer shipped', (assert)=>{
  const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /--font-sans:'Geist',/);
  assert.match(css, /--font-mono:'Geist Mono',/);
  assert.doesNotMatch(css, /font-family:\s*'(Inter|IBM Plex Mono)'/, 'a rule still asks for a face the app no longer ships');
});

test('REAL files: every @font-face src resolves to a file on disk that is genuine WOFF2 (wOF2 magic), not a 404 page or a stray file', (assert)=>{
  const rules = fontFaceRules();
  assert.ok(rules.length >= 2, `expected at least 2 @font-face rules, found ${rules.length}`);
  for(const rule of rules){
    const url = srcUrl(rule);
    assert.ok(url && url.startsWith('./fonts/'), `@font-face src must be same-origin under ./fonts/, got ${url}`);
    const file = path.join(ROOT, url.replace(/^\.\//, ''));
    assert.ok(fs.existsSync(file), `${url} does not exist on disk`);
    assert.strictEqual(fs.readFileSync(file).subarray(0, 4).toString('latin1'), 'wOF2', `${url} is not a WOFF2 file`);
  }
});

test('the preloaded font is one the stylesheet really uses, and is preloaded with crossorigin (a font preload without it is fetched twice)', (assert)=>{
  const preloads = [...document.querySelectorAll('link[rel="preload"][as="font"]')];
  assert.strictEqual(preloads.length, 1);
  const href = preloads[0].getAttribute('href');
  assert.ok(fontFaceRules().some(r => srcUrl(r) === href), `preload ${href} must match an @font-face src`);
  assert.ok(preloads[0].hasAttribute('crossorigin'), 'font preloads need crossorigin');
});

test('REAL sw.js: every @font-face file is in PRECACHE_OPTIONAL (offline from first install), and none is in the atomic essential list', (assert)=>{
  const optional = precacheOptional();
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const essential = /const PRECACHE_ESSENTIAL = \[([\s\S]*?)\];/.exec(sw)[1];
  for(const rule of fontFaceRules()){
    const url = srcUrl(rule);
    assert.ok(optional.includes(url), `sw.js PRECACHE_OPTIONAL must include ${url}`);
    assert.ok(!essential.includes(url), `${url} must not be essential — a missing font must not block an update`);
  }
});

test('the OFL licence ships beside the fonts (Geist and Geist Mono share one licence file, byte-identical upstream)', (assert)=>{
  for(const f of ['fonts/OFL-Geist.txt']){
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(/SIL Open Font License/.test(text), `${f} must carry the OFL text`);
  }
});

run();
