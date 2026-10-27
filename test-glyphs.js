'use strict';
// Glyphs (owner: "Also fix the glyphs according to our new skills"). The
// skills: no Unicode glyph or emoji standing in for an icon system; icons are
// drawn, one family, one stroke. One increment per version.
//
// v3.421 — The chevron. ‹ › ⌄ ▾ were text characters in ~50 places (rows,
// disclosure toggles, date and month arrows, the tab-rail hint, search hits,
// Settings rows), each a different shape at its own font size and weight. Now
// one drawn chevron (ICONS.chevron / chevronLeft) with a non-scaling 1.6px
// line; the two CSS ones are drawn with borders at the same line.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-glyphs.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// Comments may still name the old glyphs; nothing that renders may. Stripped
// line by line: a whole-file /\*...\*/ regex starts inside accept="image/*"
// and swallows most of the file (it did, until 2026-10-27).
function stripComments(text){
  const out = []; let inBlock = false, inHtml = false;
  for(let l of text.split('\n')){
    if(inBlock){ const e = l.indexOf('*/'); if(e === -1) continue; l = l.slice(e + 2); inBlock = false; }
    if(inHtml){ const e = l.indexOf('-->'); if(e === -1) continue; l = l.slice(e + 3); inHtml = false; }
    l = l.replace(/(^|\s)\/\*.*?\*\//g, '$1').replace(/<!--.*?-->/g, '');
    if(/^\s*\/\//.test(l)) continue;
    const b = l.search(/(^|\s)\/\*/); if(b !== -1){ inBlock = true; l = l.slice(0, b); }
    const h = l.indexOf('<!--'); if(h !== -1){ inHtml = true; l = l.slice(0, h); }
    out.push(l);
  }
  return out.join('\n');
}
const uncommented = stripComments(html);
const [ICONS, chevronOut, leftOut] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')],
  "__capture.push(ICONS, icon('chevron'), icon('chevronLeft'));");

test('REAL source (v3.421): no ‹ › ⌄ ▾ glyph is rendered anywhere — markup, CSS content, or JS strings', (assert)=>{
  const hits = uncommented.split('\n').filter(l => /[‹›⌄▾]|\\u203[9a]|&[lr]saquo;/.test(l));
  assert.deepStrictEqual(hits, []);
  assert.ok(/[‹›]/.test(html), 'anchor: the comments that explain the change are still there');
  // Sabotage anchors: the strip keeps real code from across the whole file.
  assert.ok(uncommented.length > html.length * 0.6, 'the strip keeps most of the file');
  for(const probe of ['id="logDatePrev"', 'function renderMasterclassIndex', 'function buildCareResultHtml', 'function wireSetRow', 'function formatReadiness'])
    assert.ok(uncommented.includes(probe), probe);
});

test('REAL ICONS (v3.421): one chevron, both directions, same line — round caps, a 1.6px stroke that does not scale with size', (assert)=>{
  for(const name of ['chevron', 'chevronLeft']){
    const doc = new JSDOM(ICONS[name]).window.document;
    const svg = doc.querySelector('svg');
    assert.strictEqual(svg.getAttribute('stroke-width'), '1.6', name);
    assert.strictEqual(svg.getAttribute('stroke-linecap'), 'round', name);
    assert.strictEqual(doc.querySelector('polyline').getAttribute('vector-effect'), 'non-scaling-stroke', name);
  }
  const pts = n => new JSDOM(ICONS[n]).window.document.querySelector('polyline').getAttribute('points').split(/\s+/).map(Number);
  const [r, l] = [pts('chevron'), pts('chevronLeft')];
  assert.deepStrictEqual(l.filter((_, i) => i % 2 === 0).map(x => 24 - x), r.filter((_, i) => i % 2 === 0), 'the left one is the right one mirrored');
});

test('REAL markup (v3.421): the static arrows embed exactly what icon() draws; buttons keep their names', (assert)=>{
  const doc = new JSDOM(html).window.document;
  const outer = s => new JSDOM(s).window.document.querySelector('svg').outerHTML;
  const right = outer(chevronOut), left = outer(leftOut);
  for(const id of ['logDateNext', 'calendarNextMonth', 'historyHeatmapNextMonth', 'navRailChevron', 'programChevron', 'mySupplementsChevron', 'historyLogChevron']){
    const el = doc.getElementById(id);
    assert.strictEqual(el.querySelector('svg').outerHTML, right, id);
    assert.strictEqual(el.textContent.trim(), '', id + ': no text glyph');
  }
  for(const id of ['logDatePrev', 'calendarPrevMonth', 'historyHeatmapPrevMonth']){
    assert.strictEqual(doc.getElementById(id).querySelector('svg').outerHTML, left, id);
    assert.match(doc.getElementById(id).getAttribute('aria-label'), /^Previous (day|month)$/, id);
  }
  const all = [...doc.querySelectorAll('.ex-chevron, .chev, .settings-jump span:last-child')];
  assert.ok(all.length >= 20, 'anchor: the real static chevrons');
  for(const el of all) assert.strictEqual(el.querySelector('svg') && el.querySelector('svg').outerHTML, right);
  for(const el of doc.querySelectorAll('.analysis-group-header-chevron')) assert.strictEqual(el.innerHTML, '', 'drawn by its own borders (v3.312), nothing left inside');
});

test('REAL invocation (v3.421): templates draw it too — a Learn source row toggle', (assert)=>{
  const [row] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), 'var sourcePanelSeq = 0;',
    extractFunction(src, 'buildSourceCitesHtml'), extractFunction(src, 'buildSourceRowHtml')],
    "__capture.push(buildSourceRowHtml('Strength', {school:'x', cites:[{text:'A · B, 2020'}]}, 'Approach', false));");
  const chev = new JSDOM(row).window.document.querySelector('.program-basis-toggle .chev');
  assert.strictEqual(chev.textContent, '');
  assert.strictEqual(chev.querySelector('polyline').getAttribute('points'), '9 5.5 15.5 12 9 18.5');
});

const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
test('REAL CSS (v3.421): Show more and the program picker draw their chevrons with a 1.6px border, not a character', (assert)=>{
  // jsdom has no pseudo-element computed style; read as declared.
  assert.match(CSS, /\.show-more-btn::after\{content:'';[^}]*border-right:1\.6px solid currentColor/);
  assert.match(CSS, /\.program-select-wrap::after\{[^}]*content:'';[^}]*border-right:1\.6px solid var\(--plate-blue\)/);
  // A row chevron's svg is its whole box, so the row's align-items:center centres the line (the masterclass index sat high).
  const { window } = new JSDOM(`<style>${CSS}</style><span class="ex-chevron"><svg id="a"></svg></span><span class="chev"><svg id="b"></svg></span>`);
  for(const id of ['a', 'b']) assert.strictEqual(window.getComputedStyle(window.document.getElementById(id)).display, 'block', id);
});

// v3.422 — Ticks and crosses. A status message already says Saved, Logged or
// Added; the ✓ after it was a glyph standing in for an icon. It is gone, and
// the word carries it. The one place the tick IS the message (a set row's
// "saved" flash, no word beside it) draws ICONS.check. The ✕ close buttons
// (rest timer, coach chat, Care's stop-resting) draw ICONS.close, the same
// 1.6px line as the chevron.
test('REAL source (v3.422): no ✓ or ✕ is rendered anywhere — status words carry it, marks are drawn', (assert)=>{
  const hits = uncommented.split('\n').filter(l => /[✓✕]/.test(l));
  assert.deepStrictEqual(hits, []);
  assert.ok(/✓/.test(html) && /✕/.test(html), 'anchor: comments naming the old glyphs survive the strip');
});

test('REAL ICONS (v3.422): the close mark is the chevron\'s line — 1.6px, round, non-scaling', (assert)=>{
  const doc = new JSDOM(ICONS.close).window.document;
  assert.strictEqual(doc.querySelector('svg').getAttribute('stroke-width'), '1.6');
  assert.strictEqual(doc.querySelector('svg').getAttribute('stroke-linecap'), 'round');
  assert.strictEqual(doc.querySelector('path').getAttribute('vector-effect'), 'non-scaling-stroke');
});

test('REAL markup + template (v3.422): the close buttons draw ICONS.close and keep their names', (assert)=>{
  const [closeOut] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')], "__capture.push(icon('close'));");
  const outer = s => new JSDOM(s).window.document.querySelector('svg').outerHTML;
  const doc = new JSDOM(html).window.document;
  for(const [id, name] of [['restTimerClose', 'Close rest timer'], ['coachFabClose', 'Close coach chat']]){
    const b = doc.getElementById(id);
    assert.strictEqual(b.getAttribute('aria-label'), name);
    assert.strictEqual(b.textContent.trim(), '', id + ': no glyph');
    assert.strictEqual(b.querySelector('svg').outerHTML, outer(closeOut), id);
  }
  // Care's chip: the real template line, evaluated.
  const line = src.split('\n').find(l => l.includes('class="resting-chip"'));
  const [chip] = runSandbox([extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')],
    "const r = 'Knee'; __capture.push(`" + line.trim() + "`);");
  const clear = new JSDOM(chip).window.document.querySelector('.clear-resting');
  assert.strictEqual(clear.getAttribute('aria-label'), 'Stop resting Knee');
  assert.strictEqual(clear.querySelector('svg').outerHTML, outer(closeOut));
});

test('REAL source (v3.422): a saved set flashes the drawn check, and clears it by state, not by comparing a glyph', (assert)=>{
  const fn = extractFunction(src, 'wireSetRow');
  assert.strictEqual((fn.match(/statusEl\.innerHTML = icon\('check'\);/g) || []).length, 1);
  assert.match(fn, /if\(statusEl\.classList\.contains\('set-status-saved'\)\) statusEl\.textContent='';/);
});

// v3.423 — Warnings. ⚠/⚠️ prefixed ~30 warnings. Where the warning is markup
// (Analysis verdicts, the avoid-list flag, Care's urgent banner, readiness)
// it draws ICONS.warning, the same way the "good" verdicts already draw
// ICONS.check. Where it is plain text (program descriptions, a banner title,
// textContent notices) the words carry it and the glyph is gone.
test('REAL source (v3.423): no ⚠ is rendered anywhere', (assert)=>{
  assert.deepStrictEqual(uncommented.split('\n').filter(l => /⚠/.test(l)), []);
});

const ICON_CHUNKS = [extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon')];
const isWarning = el => !!el && el.innerHTML === new JSDOM(ICONS.warning).window.document.querySelector('svg').innerHTML;
test('REAL invocation (v3.423): the overreaching verdict and a readiness warning lead with the drawn warning; a readiness note has no mark', (assert)=>{
  const [fit, warn, note] = runSandbox([...ICON_CHUNKS, extractConst(src, 'PROGRAM_FIT_MIN_SAMPLE'), extractFunction(src, 'buildProgramFitInsight'), extractFunction(src, 'formatReadiness')],
    `__capture.push(buildProgramFitInsight({increase:0, decrease:2, deload:1, hold:1, total:4}),
      formatReadiness({level:'caution', flags:[{text:'short sleep'}]}), formatReadiness({level:'note', flags:[{text:'short sleep'}]}));`);
  const fitDoc = new JSDOM(fit.text).window.document;
  assert.ok(isWarning(fitDoc.body.firstElementChild), 'the verdict opens with ICONS.warning');
  assert.ok(isWarning(new JSDOM(warn.icon).window.document.querySelector('svg')));
  assert.strictEqual(note.icon, '');
});

test('REAL invocation (v3.423): Care\'s urgent banner draws the warning inside its bold line', (assert)=>{
  const html = runSandbox([...ICON_CHUNKS, 'var exerciseInfo = {};', extractConst(src, 'SENSATION_LABELS'), extractConst(src, 'RED_FLAG_SENSATIONS'),
    extractConst(src, 'REGION_RELIEF'), extractFunction(src, 'buildReliefHtml'), extractFunction(src, 'buildCareResultHtml')],
    "__capture.push(buildCareResultHtml('numb', 'Knee', 8));")[0];
  const b = new JSDOM(html).window.document.querySelector('.care-banner-urgent b');
  assert.ok(isWarning(b.querySelector('svg')));
  assert.match(b.textContent.trim(), /^Please get this looked at/);
});

// v3.424 — Decorative emoji. Buttons, titles, notes and verdicts opened with
// an emoji (✨ AI insight, 🔁 Repeat yesterday, 🔍 Search USDA, 📦 Found it,
// 🙈, 🔗, 🍳, 🍽️, 🎯, 🤖, 💡, 🌱, 😌, ⚖️, 💬, the program picker's group
// labels, the supplement evidence labels). The words already said it.
// Left on purpose: emoji that are not painted (font-size:0 under a drawn
// mask, kept in markup by earlier decisions — test-swipe-delete-bg-glyph,
// test-fi-icon-glyphs, test-ex-delete-custom-btn-glyph; the voice button's
// is also its accessible name), and the food-category KEYS ('★ Favorites',
// '📁 My Foods'), which are stored state and never shown (the button label
// strips them).
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
const NOT_PAINTED = [/<div class="swipe-delete-bg">🗑️<\/div>/, /class="ex-delete-custom-btn"[^>]*>🗑️</, /class="fi-duplicate"[^>]*>✏️</, /class="fi-star fi-delete"[^>]*>🗑️</, /btn\.textContent = '🎤';/];
const CATEGORY_KEYS = /'★ Favorites'|'📁 My Foods'|\(★\|📁\)/;
const emojiLines = () => uncommented.split('\n').filter(l => EMOJI.test(l) && !NOT_PAINTED.some(r => r.test(l)) && !CATEGORY_KEYS.test(l)).map(l => l.trim());
test('REAL source (v3.424): no decorative emoji left; what is left is unpainted or a stored key', (assert)=>{
  // 2026-10-27 (v3.426): v3.425/v3.426 cleared the sites this test listed as pending.
  assert.deepStrictEqual(emojiLines(), []);
  assert.ok(uncommented.split('\n').some(l => NOT_PAINTED.some(r => r.test(l))), 'anchor: the unpainted sites are seen (the scan reaches them)');
});

test('REAL invocation (v3.424): the thriving verdict and the evidence labels are words', (assert)=>{
  const [fit, labels] = runSandbox([...ICON_CHUNKS, extractConst(src, 'PROGRAM_FIT_MIN_SAMPLE'), extractFunction(src, 'buildProgramFitInsight'), extractConst(src, 'SUPPLEMENT_EVIDENCE_LABELS')],
    '__capture.push(buildProgramFitInsight({increase:3, decrease:0, deload:0, hold:1, total:4}), SUPPLEMENT_EVIDENCE_LABELS);');
  assert.strictEqual(fit.status, 'thriving');
  assert.match(fit.text, /^3 of 4 tracked exercises/);
  assert.deepStrictEqual(Object.values(labels), ['Well-established', 'Promising', 'Mixed evidence', 'Limited evidence']);
});

// v3.425 — Celebrations and the rest. The celebration banner, the share card
// and a set's PR flash showed an emoji as the icon (🏆 🔥 🏁 🎓 💪 👶 ✏️ ✅).
// They draw ICONS.trophy / flame / flag / check now, in the banner's gold,
// and the share card strokes the same path on its canvas. The cycle phases'
// per-phase emoji (🩸 🌱 ☀️ 🌙 — a coloured icon per category) are gone; the
// phase name says it. The recovery recommendation draws check / warning like
// the other verdicts (v3.423), and Maintain has no mark.
const CELEBRATE = ['trophy', 'flame', 'flag'];
test('REAL ICONS (v3.425): trophy, flame and flag are one path each, on the card icons\' line', (assert)=>{
  for(const name of CELEBRATE){
    const doc = new JSDOM(ICONS[name]).window.document;
    assert.strictEqual(doc.querySelector('svg').getAttribute('stroke-width'), '1.8', name);
    assert.strictEqual(doc.querySelectorAll('path').length, 1, name);
    assert.strictEqual(doc.querySelectorAll('svg > :not(path)').length, 0, name);
  }
});

test('REAL invocation (v3.425): every celebration names a drawn icon; the banner draws it', (assert)=>{
  const names = [...src.matchAll(/triggerCelebration\('([^']+)'/g)].map(m => m[1]);
  assert.ok(names.length >= 10, 'anchor: the real call sites');
  const shared = [...src.matchAll(/\{icon:'([^']+)', headline:/g)].map(m => m[1]);
  assert.ok(shared.length >= 3, 'anchor: the share-card data');
  for(const n of [...names, ...shared]) assert.ok(ICONS[n], n + ' is an ICONS name');
  const { runJsdom } = require('./testHelpers.js');
  const { window } = runJsdom('<div id="celebrateBanner"><div id="celebrateIcon"></div><div id="celebrateText"></div><div id="celebrateSub"></div><button id="celebrateShareBtn"></button></div>',
    'window.spawnConfetti = ()=>{}; window.celebrateTimeout = null; window.shareCelebrationCard = ()=>{};',
    [...ICON_CHUNKS, 'var celebrateTimeout = null;', extractFunction(src, 'triggerCelebration'), "triggerCelebration('trophy', 'New PR!', 'Bench', true);"]);
  const svg = window.document.querySelector('#celebrateIcon svg');
  assert.ok(svg, 'a drawn icon');
  assert.strictEqual(window.document.getElementById('celebrateIcon').textContent, '');
  assert.strictEqual(svg.querySelector('path').getAttribute('d'), new JSDOM(ICONS.trophy).window.document.querySelector('path').getAttribute('d'));
});

test('REAL invocation (v3.425): the share card strokes the icon\'s own outline — paths as-is, a polyline as M/L', (assert)=>{
  const [trophy, check, none] = runSandbox([...ICON_CHUNKS, extractFunction(src, 'celebrationIconPath')],
    "__capture.push(celebrationIconPath('trophy'), celebrationIconPath('check'), celebrationIconPath('nope'));");
  assert.strictEqual(trophy, new JSDOM(ICONS.trophy).window.document.querySelector('path').getAttribute('d'));
  assert.strictEqual(check, 'M4 13 L9 18 L20 6');
  assert.strictEqual(none, '');
  const fn = extractFunction(src, 'buildShareCardBlob');
  assert.match(fn, /ctx\.stroke\(new Path2D\(iconPath\)\)/);
  assert.doesNotMatch(fn, /fillText\(cardData\.icon/);
});

test('REAL source (v3.425): no per-phase emoji; the recommendation draws its verdict mark', (assert)=>{
  const phases = extractConst(src, 'CYCLE_PHASES');
  assert.doesNotMatch(phases, /icon:/);
  assert.doesNotMatch(src, /phase\.icon/);
  assert.match(src, /\{cls:'goal-feedback-good', icon:icon\('check'\)/);
  assert.match(src, /\{cls:'goal-feedback-warn', icon:icon\('warning'\)/);
  assert.match(src, /\{cls:'goal-feedback-neutral', icon:'', label:/);
});

// v3.426 — Arrows and symbols. Controls and status marks that were text
// characters draw ICONS: the set chips' trend (↑ ↓ = → arrowUp / arrowDown /
// equals), Exercise Progress's "Ready to go up", the swap mark (⇄), the
// pull-to-refresh arrow and spinner (↓ ↻), the day-reorder buttons (◀ ▶ →
// the chevrons), the set row's Next key (→ chevron) and the rest-trend's
// short-rest flag (ℹ️ → info). Buttons and titles whose word already says it
// drop the character (Same as Last Time, Restore, Export now, Move
// earlier/later, Update ready, Swapped from, the progression and on-track
// messages' 🔻 ⬇ ⬆). Prose arrows that are notation stay ("Settings → AI
// Features Setup", "180 → 175 lb").
const MARKS = /[↑↓⬆⬇➡↻↺⇄◀▶🔻ℹ•]/u;
test('REAL source (v3.426): no arrow or symbol character stands in for an icon', (assert)=>{
  const hits = uncommented.split('\n').filter(l => MARKS.test(l));
  assert.deepStrictEqual(hits, []);
  assert.ok(uncommented.split('\n').some(l => / → /.test(l)), 'anchor: notation arrows in prose are kept and seen');
});

test('REAL ICONS (v3.426): the small marks share the chevron\'s line', (assert)=>{
  for(const name of ['arrowUp', 'arrowDown', 'equals', 'refresh', 'swap', 'info']){
    const doc = new JSDOM(ICONS[name]).window.document;
    assert.strictEqual(doc.querySelector('svg').getAttribute('stroke-width'), '1.6', name);
    assert.strictEqual(doc.querySelector('path').getAttribute('vector-effect'), 'non-scaling-stroke', name);
  }
});

test('REAL markup + source (v3.426): the pull arrow is drawn, the spinner swaps to the drawn refresh mark, reorder uses the chevrons', (assert)=>{
  const doc = new JSDOM(html).window.document;
  const sp = doc.getElementById('pullRefreshSpinner');
  assert.strictEqual(sp.textContent.trim(), '');
  assert.strictEqual(sp.querySelector('path').getAttribute('d'), new JSDOM(ICONS.arrowDown).window.document.querySelector('path').getAttribute('d'));
  assert.match(src, /spinner\.innerHTML = icon\('refresh'\);/);
  assert.match(src, /left\.innerHTML = icon\('chevronLeft'\);/);
  assert.match(src, /right\.innerHTML = icon\('chevron'\);/);
});

// v3.427 — Masterclass rows. Seven cards (strength, running, Hyrox, Pilates,
// yoga, calisthenics, cycling) put the same category icon on every row, in a
// boxed 36px tile; the rest boxed each technique's own pictogram, drawn at
// strokes from 1.8 to 2.4. Now the repeated icon is gone ({mode:'none'}), a
// technique's own pictogram stands unboxed at 24px, and every pictogram is
// held to one 1.5px line by CSS.
function renderTechniques(listId, call){
  const { runJsdom } = require('./testHelpers.js');
  const consts = ['POSE_DETAILS','SWIM_STROKE_DETAILS','CLIMB_TECHNIQUE_DETAILS','WATERSPORTS_TECHNIQUE_DETAILS','COMBAT_TECHNIQUE_DETAILS','GRAPPLE_TECHNIQUE_DETAILS',
    'OLY_TECHNIQUE_DETAILS','STRENGTH_TECHNIQUE_DETAILS','RUNNING_TECHNIQUE_DETAILS','HYROX_TECHNIQUE_DETAILS','PILATES_TECHNIQUE_DETAILS','YOGA_TECHNIQUE_DETAILS',
    'CALISTHENICS_TECHNIQUE_DETAILS','CYCLING_TECHNIQUE_DETAILS','STRENGTH_TECHNIQUE_GROUPS','CATEGORY_ICONS','SWIM_STROKES','SWIM_ICONS',
    'WATERSPORTS_TECHNIQUE_GROUPS','WATERSPORTS_ICONS'].map(n => extractConst(src, n));
  const lib = extractConst(src, 'MASTERCLASS_LIBRARY').replace(/render:\(\)=>render\w+\(\),?/g, '');
  const { window } = runJsdom(`<div id="${listId}"></div>`, '', [...consts, lib, extractFunction(src, 'renderMasterclassTechniques'), extractFunction(src, 'renderWatersportsTechniques'), call]);
  return window.document;
}

test('REAL source (v3.427): no masterclass repeats one icon down its rows', (assert)=>{
  const lib = extractConst(src, 'MASTERCLASS_LIBRARY');
  assert.doesNotMatch(lib, /mode:'fixed'/);
  assert.strictEqual((lib.match(/icon:\(\)=>\(\{mode:'none'\}\)/g) || []).length, 7, 'the seven cards that did');
});

test('REAL invocation (v3.427): strength rows have no icon; swim and watersports rows keep their own pictogram', (assert)=>{
  const strength = renderTechniques('strengthTechniquesList', "renderMasterclassTechniques('strengthTechniquesCard');");
  assert.ok(strength.querySelectorAll('.pose-row').length >= 10, 'anchor: the real rows');
  assert.strictEqual(strength.querySelectorAll('.pose-icon').length, 0);
  const swim = renderTechniques('swimStylesList', "renderMasterclassTechniques('swimStylesCard');");
  const rows = swim.querySelectorAll('.pose-row');
  assert.ok(rows.length >= 5);
  assert.strictEqual(swim.querySelectorAll('.pose-row > .pose-icon svg').length, rows.length, 'one pictogram per technique');
  const ws = renderTechniques('watersportsTechniquesList', 'renderWatersportsTechniques();');
  assert.ok(ws.querySelector('.pose-row > .pose-icon svg'), 'the watersports renderer too');
});

test('REAL CSS (v3.427): the pictogram is unboxed, 24px, one 1.5px non-scaling line; its points sit under the name', (assert)=>{
  const { window } = new JSDOM(`<style>${CSS}</style><details class="pose-detail-wrap" open><summary class="pose-row"><div class="pose-icon" id="i"><svg><path id="p" stroke-width="2.4"/></svg></div><div class="pose-name">N</div></summary><div class="pose-detail" id="d1"></div></details>
    <details class="pose-detail-wrap" open><summary class="pose-row"><div class="pose-name">N</div></summary><div class="pose-detail" id="d2"></div></details>`);
  const cs = id => window.getComputedStyle(window.document.getElementById(id));
  assert.strictEqual(cs('i').width, '24px');
  assert.match(CSS, /\.pose-icon\{flex:0 0 auto; width:24px; height:24px; color:var\(--text-muted\);\}/, 'no fill, border or padding');
  assert.strictEqual(cs('p').strokeWidth, '1.5px', 'the CSS line beats the drawing\'s own stroke-width');
  assert.match(CSS, /\.pose-icon svg \*\{stroke-width:1\.5px; vector-effect:non-scaling-stroke;\}/);
  // jsdom does not evaluate :has(); the rule is read as declared.
  assert.match(CSS, /\.pose-detail-wrap:has\(> \.pose-row > \.pose-icon\) > \.pose-detail\{padding-left:36px;\}/);
  assert.strictEqual(cs('d2').paddingLeft, '0px', 'no pictogram, no indent');
});

run();
