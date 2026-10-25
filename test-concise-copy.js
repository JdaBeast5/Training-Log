'use strict';
// Concise copy (Impeccable `clarify`, owner request: "less writing … without
// losing meaning, across the whole app"). Each helper note says what it does
// once, in as few words as keep its meaning — and the facts that matter stay:
// safety (not a diagnosis, see your doctor), privacy (what leaves the device),
// limits (what a filter can't catch).
//
// Per note: the REAL element (found in the real markup by a stable anchor
// phrase) must be under its word budget AND still state each of its facts.
// Plus: every inline script still parses — a rewritten string with an
// apostrophe inside single quotes broke the build once during this pass
// (caught by the suite, fixed before commit).
//
// v3.294: Today + Settings/profile (32 strings, 37% fewer words overall).
// v3.295: Log — food search, water and sleep tips, condition cards, photos (27 strings, 41% fewer).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-concise-copy.js');
const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;
const words = t => t.split(/\s+/).filter(Boolean).length;
// The smallest element whose text contains the anchor.
function noteFor(anchor){
  const hits = [...document.querySelectorAll('div, p, span, small, label, li')].filter(e => e.textContent.includes(anchor));
  if(!hits.length) throw new Error(`no element contains "${anchor}"`);
  return hits.reduce((a, b) => (a.textContent.length <= b.textContent.length ? a : b)).textContent.replace(/\s+/g, ' ').trim();
}

// [anchor, max words, facts that must survive (regexes)]
const NOTES = [
  ['What needs attention today', 14, [/Insights &? ?Program Fit/, /Analysis/]],
  ['An empty program with as many days', 18, [/delete/]],
  ['Hot Yoga:', 24, [/doctor's clearance/, /heart|breathing|heat/]],
  ['surgical team', 34, [/doctor/, /never instead|not a replacement/, /medical history/]],
  ['Powers Cycle Tracking', 18, [/doesn't change your program or nutrition targets/]],
  ['For cardio distance and pace', 20, [/Separate from the weight unit/]],
  ['Adds the suggested ramp', 28, [/never count toward volume, estimated 1RM, PRs or progression/]],
  ['Keeps the screen awake', 26, [/switch apps/, /15 minutes/, /power button/]],
  ['Every 5th week is already a deload', 40, [/stays on until you turn it off/]],
  ['A purpose-built plan for 1-7 days', 40, [/Program default/, /medically-modified/, /care team/]],
  ['Rounds suggested weights', 24, [/plates you own/, /commercial gym/]],
  ['Optional, and stored only on this device', 30, [/only on this device/, /Not a diagnosis/, /care team/]],
  ['Halal and Kosher catch only', 34, [/pork/, /shellfish/, /alcohol/, /meat with dairy/, /not a certification/]],
  ['Foods never to suggest', 26, [/comma-separated/, /whole words/, /eggplant/, /nuts/]],
  ['Checks for the newest version', 18, [/offline/, /storage/]],
  ['Import steps, resting heart rate and HRV', 34, [/CSV/, /Apple Health/, /readiness/]],
  ['Your data lives only in this browser', 16, [/export/i]],
  ['Alternatives that hit the same muscles', 18, [/own weight, reps and RPE history/]],
  // v3.295: Log
  ['Shown while Hypertension is active', 26, [/trend/, /doctor's monitoring/, /prescribed medication/]],
  ['Shown while Diabetes is active', 26, [/fasting and after-meal/, /prescribed monitoring/, /care team/]],
  ['Shown during Bariatric Recovery', 42, [/surgical team decides/, /not a substitute/, /bloodwork/]],
  ['Stored only on this device, never uploaded', 36, [/Compare with AI/, /after you confirm/, /Delete All My Data/]],
  ['The only part of Progress Photos that leaves', 22, [/two photos you pick/, /after you confirm/]],
  ['A few takes on what you', 32, [/estimated macros/, /diet and avoid list/]],
  ['Track what you take each day', 14, [/evidence tier/]],
  ['Adults need 7-9 hours', 22, [/National Sleep Foundation/, /8-10/]],
];

test('REAL markup: each rewritten note is under its word budget and keeps its facts', (assert)=>{
  for(const [anchor, max, facts] of NOTES){
    const t = noteFor(anchor);
    assert.ok(words(t) <= max, `"${anchor}…" is ${words(t)} words (budget ${max}): ${t}`);
    for(const f of facts) assert.match(t, f, `"${anchor}…" lost a fact: ${f}`);
  }
});

test('REAL invocation: the warm-up nudges are short and still say what to do', (assert)=>{
  const { window } = runJsdom('', '', [extractFunction(src, 'buildWarmupNudgeHtml'), 'window.__n = buildWarmupNudgeHtml;']);
  const text = r => new JSDOM(window.__n(r)).window.document.body.textContent.replace(/\s+/g, ' ').trim();
  for(const [reason, fact] of [['no-history', /few easy sets/], ['light', /one easy set/], ['bodyweight', /easier reps/]]){
    const t = text(reason);
    assert.ok(words(t) <= 28, `${reason}: ${words(t)} words`);
    assert.match(t, fact, reason);
  }
});

test('GUARD: every inline script still parses (rewritten strings must not break their quotes)', (assert)=>{
  const clean = html.replace(/<!--[\s\S]*?-->/g, '');
  let n = 0;
  for(const m of clean.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)){
    if(/\bsrc=/.test(m[1] || '')) continue;
    n++;
    assert.doesNotThrow(() => new Function(m[2]), `inline script ${n}`);
  }
  assert.ok(n >= 1, 'anchor: the app script was found');
});

test('sabotage anchors: the long versions are gone (one per area)', (assert)=>{
  for(const old of ["What's worth acting on right now", 'Switches to a real, purpose-built plan', 'Halal and Kosher here only ever', 'clutter than help',
                   'Search already works with zero setup', 'Only shown while Hypertension', 'never uploaded anywhere on their own']){
    assert.ok(!src.includes(old), `still present: ${old}`);
  }
});

run();
