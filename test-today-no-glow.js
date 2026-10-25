'use strict';
// v3.283 (tasteskill rollout, finishing Today before the owner's approval):
// no coloured glow anywhere on the Today screen, and nothing at rest casts a
// shadow. Removed: the blue/yellow blooms under the active nav pill, Today's
// Priorities rows, the voice tip, the day insight, the program picker, the
// "Before you start" box and both floating buttons; the resting shadows under
// the setup buttons, show-more, program panels, the custom-program box and the
// settings cog. The two floating buttons (coach, Today) keep a shadow because
// they really float — one shared neutral one, through the black token.
//
// Deliberately kept, and not matched below: the inset "well" on inputs (it says
// "type here"), the modelled plates (the day's identity), the sticky day header
// (floats), the search pill's masking shadow (a layout trick, not depth).
//
// Checked against the real stylesheet and the real Today markup (header, nav,
// #todayView, both FABs): every rule that matches one of those elements.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-today-no-glow.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const { document } = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window;

function allRules(){
  const out = [];
  const walk = list => { for(const r of list){ if(r.type === 1) out.push(r); else if(r.cssRules) walk(r.cssRules); } };
  for(const s of document.styleSheets) walk(s.cssRules);
  return out;
}
// The Today screen as a person sees it: header, nav rail, the tab, both FABs.
function todayElements(){
  const roots = [document.querySelector('header'), document.querySelector('.nav-pills'), document.getElementById('todayView'),
                 document.getElementById('coachFab'), document.getElementById('todayFab')];
  return roots.filter(Boolean).flatMap(r => [r, ...r.querySelectorAll('*')]);
}
const PLATE_GLOW = /rgba\(var\(--plate-[a-z]+-rgb\)/;

test('sabotage anchor: the real Today screen is assembled (header, nav, tab, both floating buttons)', (assert)=>{
  for(const sel of ['header', '.nav-pills', '#todayView', '#coachFab', '#todayFab', '#workoutCard']){
    assert.ok(document.querySelector(sel), sel);
  }
  assert.ok(todayElements().length > 300, `only ${todayElements().length} elements`);
});

test('GUARD: no rule that matches anything on the Today screen casts a plate-coloured glow (gym mode, its own surface, excepted)', (assert)=>{
  const els = todayElements();
  const offenders = [];
  for(const r of allRules()){
    const bs = r.style.getPropertyValue('box-shadow');
    if(!bs || !PLATE_GLOW.test(bs)) continue;
    for(const sel of r.selectorText.split(',').map(x => x.trim())){
      if(/gym-mode/.test(sel)) continue;
      let hit; try{ hit = els.find(e => e.matches(sel.replace(/::?(before|after)\b/g, ''))); }catch(e){ continue; }
      if(hit) offenders.push(`${sel} -> ${hit.id || hit.className}`);
    }
  }
  assert.deepStrictEqual(offenders, []);
});

test('REAL CSSOM: the resting elements that cast shadows before v3.283 cast none now', (assert)=>{
  const rule = sel => { const f = allRules().filter(r => r.selectorText === sel); if(f.length !== 1) throw new Error(`${sel}: ${f.length}`); return f[0].style; };
  // v3.300 (owner request): the plate calculator and voice set logging were removed with the set chips. The voice tip (.voice-hint-banner) went with it.
  for(const sel of ['.today-insight-row', '.day-insight', '.program-select', '.program-limits', '.switch-profile-btn', '.show-more-btn', '.program-panel', '.custom-program-box', '.settings-cog', '.nav-pill.active']){
    assert.strictEqual(rule(sel).getPropertyValue('box-shadow'), '', `${sel} still casts a shadow`);
  }
});

// v3.287 (Glass & glow): one deliberate glow returns — --cta-glow, "press me".
// The discipline this file guards: plate-colour light reaches the screen ONLY
// through that token, and only on the named interactive elements below.
const GLOW_ALLOWED = new Set(['.save-btn', '.coach-fab']);
test('GUARD: --cta-glow (the only glow) is used only by the primary button and the floating coach button', (assert)=>{
  const users = allRules().filter(r => /var\(--cta-glow\)/.test(r.style.getPropertyValue('box-shadow'))).map(r => r.selectorText);
  assert.ok(users.length >= 2, 'anchor: the token is in use');
  assert.deepStrictEqual(users.filter(sel => !GLOW_ALLOWED.has(sel)), []);
  for(const sel of ['.coach-fab::before', '.today-fab::before']) assert.strictEqual(allRules().find(r => r.selectorText === sel), undefined, `${sel} gloss must stay gone`);
});

run();
