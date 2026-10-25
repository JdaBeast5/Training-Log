'use strict';
// v3.273 (tasteskill Today pilot): the decorative emoji inside the workout
// card are gone — every day-insight prefix (21 entries + the fallback), the
// voice-logging tip, the adapt-session toggle, the session calorie line, both
// warm-up titles, the body-goal focus tag, the RPE target badge and the
// archive-week button — and Gym mode carries the app's own barbell outline
// (the Training Style header's .card-icon path) instead of a 🏋 emoji. The bold
// labels ("Balance insight:", "Tip:") already said what the emoji decorated.
//
// Found by scanning the REAL rendered #workoutCard in Chromium across all 25
// programs, every day, every exercise opened; after the change that scan finds
// only ⤵ (the drop-set button) and ▶ (form-video link), functional glyphs on
// controls, deliberately left. Also deliberately left: the ⬆/🔻 direction
// markers in progress badges, which come from progression-signal messages shown
// on other tabs too — flagged for a later increment, not folded in here.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-workout-emoji.js');
const src = readIndexSource();
const EMOJI = /\p{Extended_Pictographic}/u;

function emojiIn(text){ return [...text.matchAll(/\p{Extended_Pictographic}️?/gu)].map(m => m[0]); }

// A sub-label that reaches rule i in DAY_INSIGHT_RULES: one of its own
// alternatives that no EARLIER rule also matches (rules are first-match-wins).
function subReaching(rules, i){
  const words = rules[i].pattern.source.split('|').map(w => w.replace(/[^a-z ]/gi, '')).filter(Boolean);
  return words.find(w => rules[i].pattern.test(w) && !rules.slice(0, i).some(r => r.pattern.test(w)));
}

test('REAL invocation: renderDayInsight renders every rule, every program default and the fallback with no emoji, the bold label leading', (assert)=>{
  const { window } = runJsdom('<div id="dayInsight"></div>', 'var activeProgram = "none";', [
    extractConst(src, 'DAY_INSIGHT_RULES'),
    extractConst(src, 'DEFAULT_INSIGHTS_BY_PROGRAM'),
    extractFunction(src, 'renderDayInsight'),
    'window.__rules = DAY_INSIGHT_RULES; window.__defaults = DEFAULT_INSIGHTS_BY_PROGRAM;',
    'window.__render = (sub, prog)=>{ activeProgram = prog; renderDayInsight({sub, rest:false}); return document.getElementById("dayInsight"); };',
  ]);
  const rules = window.__rules, defaults = window.__defaults;
  const rendered = [];
  rules.forEach((r, i)=>{
    const sub = subReaching(rules, i);
    assert.ok(sub, `could not find a day label that reaches rule ${i} (${r.pattern})`);
    rendered.push(window.__render(sub, 'none').innerHTML);
  });
  for(const prog of Object.keys(defaults)) rendered.push(window.__render('zzz', prog).innerHTML);
  rendered.push(window.__render('zzz', 'no-such-program').innerHTML);
  // Sabotage anchor: every path rendered real, distinct content (a broken
  // renderer that wrote '' or the same string each time would fail here).
  assert.ok(rendered.every(h => h.length > 20), 'every insight path must render content');
  assert.strictEqual(new Set(rendered).size, rendered.length, 'each rule/program/fallback renders its own text');
  assert.ok(rules.length === 10 && Object.keys(defaults).length >= 11, `expected 10 rules and >=11 program defaults, got ${rules.length}/${Object.keys(defaults).length}`);
  for(const html of rendered){
    const el = window.document.createElement('div'); el.innerHTML = html;
    assert.deepStrictEqual(emojiIn(el.textContent), [], `insight still carries emoji: ${el.textContent.slice(0, 60)}`);
    assert.strictEqual(el.firstChild.nodeName, 'B', `the bold label must lead the insight now the emoji is gone: ${html.slice(0, 40)}`);
    assert.ok(/:$/.test(el.firstChild.textContent), 'the leading label ends with a colon');
  }
});

test('REAL invocation: renderVoiceHint shows the tip with no emoji, "Tip:" leading, and its dismiss control intact', async (assert)=>{
  const { window } = runJsdom('<div id="voiceHintBanner" style="display:none"></div>',
    'var SpeechRecognitionCtor = function(){}; window.storage = { get: async ()=>{ throw new Error("not found"); }, set: async ()=>{} };',
    [extractFunction(src, 'renderVoiceHint'), 'window.__p = renderVoiceHint();']);
  await window.__p;
  const banner = window.document.getElementById('voiceHintBanner');
  assert.strictEqual(banner.style.display, 'flex');
  const tip = banner.querySelector('span');
  assert.deepStrictEqual(emojiIn(tip.textContent), []);
  assert.strictEqual(tip.firstElementChild.textContent, 'Tip:');
  assert.ok(banner.querySelector('#voiceHintDismissBtn[aria-label]'), 'the dismiss button and its accessible name must survive');
});

test('REAL invocation: buildWarmupNudgeHtml titles every reason "Warm up first", with no emoji', (assert)=>{
  const { window } = runJsdom('<div id="out"></div>', '', [extractFunction(src, 'buildWarmupNudgeHtml'),
    'window.__html = ["bodyweight","light","no-history"].map(r=>buildWarmupNudgeHtml(r));']);
  assert.strictEqual(window.__html.length, 3);
  for(const html of window.__html){
    const out = window.document.getElementById('out'); out.innerHTML = html;
    assert.strictEqual(out.querySelector('.warmup-title').textContent, 'Warm up first');
    assert.deepStrictEqual(emojiIn(out.textContent), []);
  }
});

test('REAL invocation: updateSessionCalorieTotal writes the running total with no emoji, and the number keeps its own span', (assert)=>{
  const { window } = runJsdom('<div id="sessionCalTotal"></div>',
    'var userProfile = {weight: 180}; function estimateExerciseCalories(){ return 53; } function animateNumberTo(){}',
    [extractFunction(src, 'updateSessionCalorieTotal'), 'updateSessionCalorieTotal([{},{},{}], [true,false,true]);']);
  const el = window.document.getElementById('sessionCalTotal');
  assert.strictEqual(el.textContent, '~106 cal burned so far this session');
  assert.strictEqual(el.querySelector('#sessionCalNum').textContent, '106');
});

test('REAL invocation: buildProgressBadge\'s RPE target badge leads with the week, not an emoji', (assert)=>{
  const { window } = runJsdom('', `
    var RPE_BY_CYCLE_WEEK = {5: 6}; var DELOAD_CYCLE_WEEKS = 5; var loadSuggestionMode = 'rpe'; var weightUnit = 'lb';
    function targetRpeForWeek(){ return 8; } function loadForRpeTarget(){ return 200; } function parseBottomRep(){ return 5; }
    function rirFromRpe(){ return 2; } function snapToLoadable(x){ return x; } function toDisplayWeight(x){ return x; }
    function cycleWeekOf(){ return 2; } function trimUnitNum(x){ return String(x); }`,
    [extractFunction(src, 'buildProgressBadge'),
     'window.__b = buildProgressBadge({ex:{sets:"4x5", name:"Bench Press"}, signal:null, inDeloadWeek:false, priorTop:null, topRep:null, rpeCtx:{week:2, e1rm:230}, sourceNote:""});']);
  const el = window.document.createElement('div'); el.innerHTML = window.__b.html;
  assert.strictEqual(window.__b.direction, 'rpe');
  assert.ok(el.textContent.startsWith('Week 2 target: RPE 8'), el.textContent.slice(0, 40));
  assert.deepStrictEqual(emojiIn(el.textContent), []);
});

test('REAL markup: Gym mode carries the app\'s barbell outline (aria-hidden) and is named "Gym mode"; adapt and archive buttons are emoji-free', (assert)=>{
  const { window } = runJsdom(extractElementById(src, 'workoutCard'), '', []);
  const doc = window.document;
  const gym = doc.getElementById('gymEnterBtn');
  const svg = gym.querySelector('svg.gym-enter-icon');
  assert.ok(svg && svg.getAttribute('aria-hidden') === 'true', 'Gym mode icon must be an aria-hidden svg');
  // Same artwork as the Training Style card's header icon, not a new drawing.
  const styleIcon = extractElementById(src, 'programHeader').match(/<svg[\s\S]*?<\/svg>/)[0];
  assert.strictEqual(svg.innerHTML, (()=>{ const d = doc.createElement('div'); d.innerHTML = styleIcon; return d.querySelector('svg').innerHTML; })());
  assert.strictEqual(gym.textContent.trim(), 'Gym mode');
  for(const id of ['gymEnterBtn', 'adaptWorkoutBtn', 'archiveWeekBtn']){
    assert.deepStrictEqual(emojiIn(doc.getElementById(id).textContent), [], `#${id}`);
  }
});

test('REAL source sites inside renderWorkout: the warm-up ramp title and the body-goal focus tag are emoji-free (each site anchored to exactly one occurrence)', (assert)=>{
  // renderWorkout is too entangled to drive whole in jsdom; these two lines are
  // checked at their exact template sites instead, each pinned to count == 1 so
  // a renamed or duplicated site fails loudly rather than passing vacuously.
  const fn = extractFunction(src, 'renderWorkout').split('\n');
  for(const marker of ['const rampTitle = `', 'class="super-tag focus-tag">']){
    const lines = fn.filter(l => l.includes(marker));
    assert.strictEqual(lines.length, 1, `expected exactly one "${marker}" site in renderWorkout, found ${lines.length}`);
    assert.deepStrictEqual(emojiIn(lines[0]), [], lines[0].trim().slice(0, 80));
  }
});

run();
