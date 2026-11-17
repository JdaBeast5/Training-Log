'use strict';
// v3.601 (UX-20): Today's chrome folds into the cover. On Today (with the
// cover showing, not in gym mode) the body carries today-cover: the header
// keeps only its title (visually hidden, still the page's h1), and the date
// controls, the three header buttons and the streak move into the cover's top
// rows. On every other tab they go back exactly where they were, with the
// same element identity, IDs and listeners. The program line leads the cover;
// the loaded bar is back above Log.
//
// Real invocation: the real page markup (scripts stripped) with the real
// switchView, syncTodayChrome, renderLogDateBar, updateTodayFab,
// formatLogDateLabel and renderStreak; the real stylesheet's CSSOM, resolved
// for specificity, for the CSS criteria.
//
// Sabotage: leave #headerSub displayed on Today and criterion 2 fails.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-chrome.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const BODY = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document.body.innerHTML;

function mount({date = '2026-11-02', streak = 8} = {}){
  const { window } = runJsdom(BODY, `
    window.storage = { set(){}, get: async ()=> null };
    window.__unfolded = false;
    window.matchMedia = (q)=>({ matches: /min-width/.test(q) ? window.__unfolded : true }); window.scrollTo = ()=>{};
    Element.prototype.scrollIntoView = function(){};
    var STAGGER_MAX_STEPS = 6, STAGGER_STEP_MS = 40;
    var selectedLogDate = '${date}';
    function getTodayKey(){ return '2026-11-02'; }
    function isBackdating(){ return selectedLogDate !== getTodayKey(); }
    function closeNavMoreOverlay(){} function hideGymOffer(){}
    async function computeWeekStreak(){ return ${streak}; }
    function animateNumberTo(el, n){ el.textContent = String(n); }
    function checkStreakMilestone(){}`,
    [extractConst(src, 'MOVED_TO_MORE'), extractConst(src, 'TODAY_CHROME_MOVES'), extractConst(src, 'OPEN_POSTURE_QUERY'), extractFunction(src, 'isOpenPosture'), extractConst(src, 'STREAK_FLAME_SVG'),
     ...['clearViewEnter', 'scrollAppToTop', 'switchView', 'syncTodayChrome', 'renderLogDateBar', 'updateTodayFab', 'formatLogDateLabel', 'dateKeyMinusDays', 'fmtDayLabel', 'renderStreak', 'parseDateKey', 'formatDate'].map(f => extractFunction(src, f)),
     "document.getElementById('upNext').hidden = false;"]);
  const $ = id => window.document.getElementById(id);
  return { window, doc: window.document, $ };
}

test('criterion 1: real switchView: Today carries today-cover and the date bar in the cover; Food gets the date bar back in its place, the same element', (assert)=>{
  const ui = mount();
  const bar = ui.$('logDateBar');
  const before = bar.previousElementSibling, after = bar.nextElementSibling;
  ui.window.switchView('today');
  assert.ok(ui.doc.body.classList.contains('today-cover'));
  assert.strictEqual(ui.$('logDateBar'), bar, 'the same element');
  assert.ok(bar.closest('#upNext'), 'in the cover on Today');
  for(const id of ['globalSearchBtn', 'coachFab', 'settingsCog']) assert.ok(ui.$(id).closest('#coverIconSlot'), id + ' on the cover');
  assert.ok(ui.$('streakBadge').closest('#coverStreakSlot'), 'the streak on the program line');
  ui.window.switchView('log');
  assert.ok(!ui.doc.body.classList.contains('today-cover'), 'not on Food');
  assert.strictEqual(ui.$('logDateBar'), bar);
  assert.strictEqual(bar.previousElementSibling, before, 'back in its Food position');
  assert.strictEqual(bar.nextElementSibling, after);
  assert.strictEqual(bar.style.display, 'flex', 'shown on Food');
  for(const id of ['globalSearchBtn', 'coachFab', 'settingsCog', 'streakBadge']) assert.ok(ui.$(id).parentElement.tagName === 'HEADER', id + ' back in the header');
  ui.window.switchView('today');
  assert.ok(bar.closest('#upNext'), 'and back again');
  ui.doc.body.classList.add('gym-mode'); ui.window.syncTodayChrome();
  assert.ok(!ui.doc.body.classList.contains('today-cover') && !bar.closest('#upNext'), 'gym mode keeps the old chrome');
  ui.doc.body.classList.remove('gym-mode'); ui.window.syncTodayChrome();
  assert.ok(ui.doc.body.classList.contains('today-cover'), 'anchor: back on');
  ui.window.__unfolded = true; ui.window.syncTodayChrome();
  assert.ok(!ui.doc.body.classList.contains('today-cover') && !bar.closest('#upNext'), 'unfolded (the cover is in the right pane until UX-21): the old chrome');
});

// ---- The stylesheet, resolved for one element (importance, specificity, order).
const { window: cssWin } = new JSDOM(`<!doctype html><html><head><style>${CSS}</style></head><body>${BODY}</body></html>`);
const RULES = [];
(function walk(list, media){ for(const r of list){ if(r.selectorText) RULES.push({r, media}); else if(r.cssRules) walk(r.cssRules, (r.media && r.media.mediaText) || media); } })(cssWin.document.styleSheets[0].cssRules, '');
function spec(sel){ const s = sel.replace(/:not\(([^)]*)\)/g, ' $1'); return [(s.match(/#/g) || []).length, (s.match(/\.|\[|:(?!:)/g) || []).length, (s.match(/(^|[\s>+~])[a-z]+/gi) || []).length]; }
function winning(el, prop){
  const hits = [];
  RULES.forEach(({r, media}, order) => {
    if(media) return;
    const v = r.style.getPropertyValue(prop);
    if(!v) return;
    const parts = r.selectorText.split(',').map(x => x.trim()).filter(x => { try{ return el.matches(x); }catch(e){ return false; } });
    if(!parts.length) return;
    const sp = parts.map(spec).sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2])).pop();
    hits.push({v: v.trim(), imp: r.style.getPropertyPriority(prop) ? 1 : 0, sp, order});
  });
  hits.sort((a, b) => (a.imp - b.imp) || (a.sp[0] - b.sp[0]) || (a.sp[1] - b.sp[1]) || (a.sp[2] - b.sp[2]) || (a.order - b.order));
  return hits.length ? hits[hits.length - 1].v : null;
}
function todayState(){
  const d = cssWin.document;
  d.body.className = 'day-red today-cover';
  d.querySelector('header').classList.remove('header-compact');
  const slot = id => d.getElementById(id);
  for(const [id, s] of [['logDateBar', 'coverDateSlot'], ['globalSearchBtn', 'coverIconSlot'], ['coachFab', 'coverIconSlot'], ['settingsCog', 'coverIconSlot'], ['streakBadge', 'coverStreakSlot']]) slot(s).appendChild(slot(id));
  return d;
}

test('criterion 2: on Today the title is visually hidden but kept (sr-only); the profile line, eyebrow and brand mark are not displayed; other tabs keep their header', (assert)=>{
  const d = todayState();
  const t = d.getElementById('viewTitle');
  assert.strictEqual(t.tagName, 'H1');
  assert.match(winning(t, 'clip'), /^rect\(0/, 'clipped to nothing');
  assert.strictEqual(winning(t, 'width'), '1px');
  assert.strictEqual(winning(t, 'position'), 'absolute');
  for(const id of ['headerSub', 'headerEyebrow', 'brandHome']) assert.strictEqual(winning(d.getElementById(id), 'display'), 'none', id);
  d.body.classList.remove('today-cover');
  d.querySelector('header').classList.add('header-compact');
  assert.notStrictEqual(winning(d.getElementById('headerEyebrow'), 'display'), 'none', 'other tabs: the eyebrow shows');
  assert.notStrictEqual(winning(t, 'position'), 'absolute', 'other tabs: the large title shows');
  assert.strictEqual(winning(t, 'font-size'), '34px', 'unchanged from v3.599');
});

test('criterion 3: on Today the three icon buttons are flat (no fill, no border), 44 × 44, in the cover\'s ink, and keep their names', (assert)=>{
  const d = todayState();
  for(const id of ['globalSearchBtn', 'coachFab', 'settingsCog']){
    const b = d.getElementById(id);
    assert.strictEqual(winning(b, 'background'), 'none', id + ' no fill');
    assert.ok(/^(0|0px|none)$/.test(winning(b, 'border')), id + ' no border: ' + winning(b, 'border'));
    assert.strictEqual(winning(b, 'width'), '44px'); assert.strictEqual(winning(b, 'height'), '44px');
    assert.strictEqual(winning(b, 'color'), 'inherit', id + ' takes the cover\'s ink');
    assert.ok(b.getAttribute('aria-label'), id + ' keeps its name');
  }
  assert.match(winning(d.getElementById('upNext'), 'color'), /^var\(--on-cover\b/, 'which is --on-cover');
});

test('criterion 4: the cover\'s order (date row, program line, headline, lift, numeral, bar, Log, chips); the streak sits on the program line, named, hidden at 0', async (assert)=>{
  const ui = mount();
  ui.window.switchView('today');
  const cover = ui.$('upNext');
  const pos = el => [...cover.querySelectorAll('*')].indexOf(el);
  const order = [ui.$('logDateBar'), ui.$('upNextWhere'), ui.$('upNextDayBtn'), cover.querySelector('.cover-lift-row'), ui.$('upNextNumeral'), ui.$('upNextBar'), cover.querySelector('.cover-log'), ui.$('upNextChips')].map(pos);
  assert.ok(order.every(i => i >= 0), 'all in the cover: ' + order);
  assert.deepStrictEqual(order, [...order].sort((a, b) => a - b), 'in this order');
  await ui.window.renderStreak();
  const badge = ui.$('streakBadge');
  assert.strictEqual(badge.parentElement, ui.$('coverStreakSlot'));
  assert.strictEqual(badge.parentElement.parentElement, ui.$('upNextWhere').parentElement, 'on the program line');
  assert.strictEqual(badge.getAttribute('aria-label'), '8 training weeks in a row');
  assert.notStrictEqual(badge.style.display, 'none');
  const zero = mount({streak: 0});
  zero.window.switchView('today');
  await zero.window.renderStreak();
  assert.strictEqual(zero.$('streakBadge').style.display, 'none', 'hidden at 0');
});

test('criterion 6: backdating: the label reads the date, the row\'s Today button shows, and the yellow jump button is hidden on Today but not on Progress', (assert)=>{
  const ui = mount({date: '2026-10-30'});
  ui.window.switchView('today');
  assert.notStrictEqual(ui.$('logDateLabelText').textContent, 'Today', ui.$('logDateLabelText').textContent);
  assert.strictEqual(ui.$('logDateToday').style.display, '', 'the Today button shows');
  assert.strictEqual(ui.$('todayFab').style.display, 'flex', 'anchor: backdating sets the jump button');
  const d = todayState();
  const fab = d.getElementById('todayFab');
  fab.style.display = 'flex';
  assert.strictEqual(winning(fab, 'display'), 'none', 'hidden on Today (beats the inline style)');
  d.body.classList.remove('today-cover');
  assert.notStrictEqual(winning(fab, 'display'), 'none', 'shown on other tabs');
});

test('criterion 7: under today-cover no backdrop-filter, glow shadow or plate yellow on the date bar or its children, backdating included', (assert)=>{
  const d = todayState();
  const bar = d.getElementById('logDateBar');
  bar.classList.add('backdating');
  const bad = [];
  for(const el of [bar, ...bar.querySelectorAll('*')]){
    for(const prop of ['backdrop-filter', '-webkit-backdrop-filter', 'box-shadow', 'background', 'color', 'border-color']){
      const v = winning(el, prop);
      if(!v) continue;
      if(prop.includes('backdrop') && v !== 'none') bad.push(`${el.id || el.className} ${prop}: ${v}`);
      if(prop === 'box-shadow' && v !== 'none') bad.push(`${el.id || el.className} ${prop}: ${v}`);
      if(/plate-yellow/.test(v)) bad.push(`${el.id || el.className} ${prop}: ${v}`);
    }
  }
  assert.deepStrictEqual(bad, []);
});

test('the profile: a finished profile is Settings\' first section', (assert)=>{
  const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
  const first = document.querySelector('.settings-panel-body > .settings-section');
  assert.ok(first.querySelector('#settingsProfileSlot'), 'the "You" section leads');
  assert.match(first.querySelector('.care-label').textContent, /^You$/);
});

run();
