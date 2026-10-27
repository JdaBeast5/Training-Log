'use strict';
// Learn rework (owner: "fix the writing and formatting per our skills in the
// Learn tab ... shorten the citations, make the content more concise like the
// rest of the app"). One increment per version.
//
// v3.404 — Research & Sources. Each panel printed `primary` in full: 100-400
// words of findings, several citations, and editing notes ("NOW SOURCED PER
// STYLE…", "Updated on a currency check…"). Now every one of the 55 entries
// carries short citations (`cites`: "Author et al. · Journal, year", linked to
// doi.org when there is a DOI) or a one-line `citeNote` where it deliberately
// has no single source. `primary` stays the full audited record
// (test-citation-audit) and is no longer rendered. The approach line
// (`school`) was rewritten in plain words — four leaked internal names
// (COMBAT_STYLES, CYCLING_STYLES, MEDICAL_STYLES, WATERSPORTS_STYLES).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-learn-rework.js');
const src = readIndexSource();
const [SOURCES] = runSandbox([extractConst(src, 'PROGRAM_SOURCES'), extractConst(src, 'STYLE_SOURCES')],
  '__capture.push(JSON.parse(JSON.stringify(Object.assign({}, PROGRAM_SOURCES, STYLE_SOURCES))));');
const ENTRIES = Object.entries(SOURCES);
const norm = s => String(s).replace(/['’]/g, '');

test('REAL data (v3.404): all 55 entries have short citations or a one-line note — never neither', (assert)=>{
  assert.strictEqual(ENTRIES.length, 55, 'anchor: the real 55 programs and styles');
  for(const [k, v] of ENTRIES){
    assert.ok((v.cites && v.cites.length) || v.citeNote, k);
    if(v.cites) assert.ok(v.cites.length <= 3, k + ': at most three');
  }
});

test('REAL data (v3.404): every short citation is backed by the audited record — its DOI and its first author or body appear in `primary`', (assert)=>{
  let n = 0;
  for(const [k, v] of ENTRIES) for(const c of v.cites || []){
    n++;
    assert.match(c.text, /^.+ · .+, (19|20)\d\d$/, `${k}: "Author · Journal, year" — ${c.text}`);
    const who = c.text.split(' · ')[0].split(' et al.')[0].split(' & ')[0].split(' ')[0];
    assert.ok(norm(v.primary).includes(norm(who)), `${k}: ${who} is in primary`);
    if(c.doi) assert.ok(v.primary.includes(c.doi), `${k}: ${c.doi} is in primary`);
  }
  assert.ok(n >= 70, 'anchor: the real citations were read');
});

test('REAL data (v3.404): the approach lines are plain — short, no internal names or editing notes', (assert)=>{
  for(const [k, v] of ENTRIES){
    assert.ok(v.school.split(/\s+/).length <= 20, `${k}: ${v.school}`);
    assert.doesNotMatch(v.school, /_STYLES|NOW SOURCED|honest|currency check|S&C/, k);
  }
});

function render(key, isStyle){
  const [html] = runSandbox([extractFunction(src, 'escapeHtml'), 'var sourcePanelSeq = 0;', extractFunction(src, 'buildSourceCitesHtml'), extractFunction(src, 'buildSourceRowHtml')],
    `__capture.push(buildSourceRowHtml('X', ${JSON.stringify(SOURCES[key])}, 'Approach', ${isStyle}));`);
  return new JSDOM(html).window.document;
}

test('REAL invocation (v3.404): a panel shows the approach, then linked short citations — not the full record', (assert)=>{
  const doc = render('strength', false);
  const links = [...doc.querySelectorAll('.source-cites a')];
  assert.deepStrictEqual(links.map(a => a.textContent), ['ACSM Position Stand · Med Sci Sports Exerc, 2026']);
  assert.strictEqual(links[0].getAttribute('href'), 'https://doi.org/10.1249/MSS.0000000000003897');
  assert.strictEqual(links[0].getAttribute('rel'), 'noopener');
  assert.doesNotMatch(doc.body.textContent, /Currier BS|hypertrophy: >=10 sets/, 'primary is not rendered');
  assert.ok(doc.body.textContent.split(/\s+/).length < 45, 'the whole panel reads in a glance');
});

test('REAL invocation (v3.404): a citation without a DOI is plain text; a container shows its note', (assert)=>{
  const core = render('core', false);
  assert.strictEqual(core.querySelectorAll('.source-cites li').length, 2);
  assert.strictEqual(core.querySelectorAll('.source-cites a').length, 0);
  const combat = render('combat', false);
  assert.strictEqual(combat.querySelector('.source-cite-note').textContent, 'Each style below has its own source.');
  assert.strictEqual(combat.querySelector('.source-cites'), null);
});

const CSS = [...fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
test('REAL CSSOM (v3.404): the Sources label is set apart from the approach line', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><div id="researchSourcesList"><div class="program-panel-eyebrow source-cites-eyebrow">Sources</div></div>`);
  assert.strictEqual(window.getComputedStyle(window.document.querySelector('.source-cites-eyebrow')).marginTop, '12px');
});

run();
