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

// v3.405 — Formatting. The group header's `.posing-class summary` rule also
// matched every technique's nested <summary>, so each technique row showed
// two chevrons and a rule. Now: one drawn chevron per row; the group's own word
// dropped from the technique name ("Squat: Bracing & Setup" -> "Bracing &
// Setup" under "The Squat…", data-name keeps the full name for search); point
// labels in bold, capitalised, no bullets; glass icon tiles; the exercise
// list's ▸ glyph replaced by a drawn chevron; shorter card titles and hints.
const { runJsdom } = require('./testHelpers.js');
const MC_CHUNKS = ['MASTERCLASS_LIBRARY'].map(n => extractConst(src, n));
function renderCard(cardId){
  const consts = ['POSE_DETAILS','SWIM_STROKE_DETAILS','CLIMB_TECHNIQUE_DETAILS','WATERSPORTS_TECHNIQUE_DETAILS','COMBAT_TECHNIQUE_DETAILS','GRAPPLE_TECHNIQUE_DETAILS',
    'OLY_TECHNIQUE_DETAILS','STRENGTH_TECHNIQUE_DETAILS','RUNNING_TECHNIQUE_DETAILS','HYROX_TECHNIQUE_DETAILS','PILATES_TECHNIQUE_DETAILS','YOGA_TECHNIQUE_DETAILS',
    'CALISTHENICS_TECHNIQUE_DETAILS','CYCLING_TECHNIQUE_DETAILS','STRENGTH_TECHNIQUE_GROUPS','CATEGORY_ICONS'].map(n => extractConst(src, n));
  const { window } = runJsdom('<div id="strengthTechniquesList"></div><div id="watersportsTechniquesList"></div>', '', [...consts,
    extractConst(src, 'WATERSPORTS_TECHNIQUE_GROUPS'), extractConst(src, 'WATERSPORTS_ICONS'),
    ...MC_CHUNKS.map(c => c.replace(/render:\(\)=>render\w+\(\),?/g, '')), extractFunction(src, 'renderMasterclassTechniques'), extractFunction(src, 'renderWatersportsTechniques'),
    cardId === 'watersports' ? 'renderWatersportsTechniques();' : `renderMasterclassTechniques('${cardId}');`]);
  return window.document;
}

test('REAL invocation (v3.405): a technique row has ONE chevron (CSS) and drops the group word from its name, keeping the full name for search', (assert)=>{
  const doc = renderCard('strengthTechniquesCard');
  const rows = [...doc.querySelectorAll('#strengthTechniquesList .pose-row')];
  assert.strictEqual(rows.length, 16, 'anchor: the real 16 strength techniques');
  assert.strictEqual(doc.querySelectorAll('#strengthTechniquesList .pose-row .ex-chevron').length, 0, 'no text chevron');
  const first = rows[0].querySelector('.pose-name');
  assert.strictEqual(first.textContent, 'Bracing & Setup');
  assert.strictEqual(first.dataset.name, 'Squat: Bracing & Setup');
  const names = [...doc.querySelectorAll('#strengthTechniquesList .pose-name')];
  assert.ok(names.some(n => n.textContent.startsWith('Bench Press:')), 'a prefix the group title does not contain is kept');
});

test('REAL invocation (v3.405): points lead with a bold, capitalised label — in the shared AND the watersports renderer', (assert)=>{
  for(const card of ['strengthTechniquesCard', 'watersports']){
    const doc = renderCard(card);
    const li = doc.querySelector('.pose-detail li');
    assert.ok(['Setup'].includes(li.querySelector('strong').textContent), card);
    assert.match(li.textContent, /^Setup [A-Z]/, card + ': capitalised after the label');
    assert.strictEqual(doc.querySelectorAll('.pose-row .ex-chevron').length, 0, card);
    assert.ok(doc.querySelector('.pose-name').dataset.name, card + ': data-name');
  }
});

test('REAL source (v3.405): search lands on a technique by its FULL name, not the shortened label', (assert)=>{
  assert.match(extractFunction(src, 'openMasterclassTechnique'), /\(el\.dataset\.name \|\| el\.textContent \|\| ''\)\.trim\(\) === techniqueName/);
});

test('REAL CSSOM (v3.405): one chevron per row, group rule scoped to its own row, no bullets, glass tiles, no ▸ glyph', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><details class="posing-class" open><summary id="g">G</summary>
    <details class="pose-detail-wrap" open><summary class="pose-row" id="r"><div class="pose-icon" id="i"></div><div class="pose-name">N</div></summary>
    <div class="pose-detail"><ul id="u"><li>x</li></ul></div></details></details><details class="ex-details" open><summary id="e">Cues</summary></details>`);
  const cs = (id, pseudo) => window.getComputedStyle(window.document.getElementById(id), pseudo);
  assert.notStrictEqual(cs('r').minHeight, '44px', 'the technique row no longer takes the group row style');
  assert.strictEqual(cs('g').minHeight, '44px', 'the group row keeps it');
  // jsdom does not expand the list-style shorthand, so this one is read as declared.
  assert.match(CSS, /\.pose-detail ul\{[^}]*list-style:none/);
  assert.match(CSS, /\.pose-icon\{[^}]*background:var\(--glass-fill\)/);
  assert.match(CSS, /\.pose-row::after\{content:'';/);
  assert.doesNotMatch(CSS, /\.ex-details summary::before\{[^}]*content:'▸'/);
});

test('REAL markup (v3.405): shorter Learn card titles and hints', (assert)=>{
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /Recently Trained — Review Technique/);
  assert.doesNotMatch(html, /180 spm/);
  const doc = new JSDOM(html).window.document;
  const hints = [...doc.querySelectorAll('#learnView .history-hint')].map(h => h.textContent);
  assert.ok(hints.length >= 15, 'anchor: the real hints');
  const over = hints.filter(h => h.split(/\s+/).length > 17);
  assert.deepStrictEqual(over, []);
});

// v3.406-v3.419 rewrote every masterclass to three short points per technique
// (test-concise-learn.js). v3.420 — "Close this masterclass", at the foot of
// an opened masterclass card, was still opaque --surface2: glass now, like the
// other in-card buttons.
test('REAL CSSOM (v3.420): the masterclass close button is glass', (assert)=>{
  const raw = CSS;
  const rule = raw.match(/\.masterclass-close-btn\{[^}]*\}/)[0];
  assert.match(rule, /background:var\(--glass-fill\)/);
  assert.doesNotMatch(rule, /var\(--surface2\)/);
});

run();
