'use strict';
// Behavioral coverage for a user-requested change: the voice-log button
// shipped as the raw \u{1F3A4} emoji everywhere OUTSIDE Gym Mode (full-colour,
// differently weighted per OS — the same "vendor artwork inside our own
// control" problem the plate button's barbell glyph already solved for
// \u{1F3CB}). Gym Mode already had a proper SVG mask glyph for the mic, but the
// normal (non-gym) view still showed the bare emoji. Fixed by moving the
// emoji-collapse (`font-size:0`) and the SVG mask glyph onto the BASE
// `.voice-log-btn`/`.voice-log-btn::after` rules, unconditionally — so the
// same vector glyph now renders in both modes, and Gym Mode's own copy of
// the mask-image declaration (previously duplicated) was deleted since the
// base rule now supplies it for both.
//
// This is fundamentally a CSS SPECIFICITY/cascade change (same class of bug
// as the warm-up-ramp plate-btn glyph fix), so real cascade resolution via
// jsdom is what proves it, not eyeballing selector text.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-voice-log-btn-glyph.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

// The base button rule (now font-size:0 unconditionally) and its own new
// ::after glyph rule (anchored to the un-prefixed, 2-space-indented
// selector so it can't accidentally match Gym Mode's `body.gym-mode
// .voice-log-btn::after` block, which contains the same trailing text).
const baseButtonSrc = extractRuleBlock(src, '.voice-log-btn');
const baseAfterSrc = extractRuleBlock(src, '\n  .voice-log-btn::after');

// The two Gym Mode rules this fix deliberately left alone: the general
// "buttons become last cells" sizing block (sets font-size:18px, among
// other things), and the explicit override that pulls plate/voice back to
// font-size:0 — matched by their real, distinguishing text, not selector
// alone, since both share selectors with other rules elsewhere.
const gymGeneralSizingSrc = (()=>{
  const re = /body\.gym-mode \.plate-btn,\s*\n\s*body\.gym-mode \.voice-log-btn,\s*\n\s*body\.gym-mode \.set-note-btn\{[^}]*\}/;
  const m = re.exec(src);
  if(!m) throw new Error('gym-mode general button-sizing block not found');
  return m[0];
})();
const gymVoiceFontZeroSrc = (()=>{
  const re = /body\.gym-mode \.plate-btn,\s*\n\s*body\.gym-mode \.voice-log-btn\{font-size:0;\}/;
  const m = re.exec(src);
  if(!m) throw new Error('gym-mode plate/voice font-size:0 override not found');
  return m[0];
})();
const gymAfterSharedSrc = (()=>{
  const re = /body\.gym-mode \.plate-btn::after,\s*\n\s*body\.gym-mode \.voice-log-btn::after\{[^}]*\}/;
  const m = re.exec(src);
  if(!m) throw new Error('gym-mode shared ::after resize block not found');
  return m[0];
})();

test('sabotage-relevant: the base .voice-log-btn rule now declares font-size:0, not the old raw-emoji font-size', (assert)=>{
  assert.match(baseButtonSrc, /font-size:0;/, 'the base (non-gym) button must collapse the emoji text itself, the same mechanism Gym Mode already used');
  assert.doesNotMatch(baseButtonSrc, /font-size:14px/, 'the old raw-emoji font-size must be gone, not just shadowed by a later rule');
});

test('REAL invocation: a real CSS cascade resolves .voice-log-btn font-size to 0 OUTSIDE Gym Mode, with only the base rule present', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${baseButtonSrc}</style>
    <body>
      <button class="voice-log-btn" aria-label="Log this set by voice">\u{1F3A4}</button>
    </body>`);
  const btn = dom.window.document.querySelector('.voice-log-btn');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'the emoji must be genuinely collapsed in the normal (non-gym) view now, not just in Gym Mode');
});

test('regression guard: a real CSS cascade still resolves .voice-log-btn font-size to 0 INSIDE Gym Mode, with the base rule plus both real competing gym-mode rules present', (assert)=>{
  const css = [baseButtonSrc, gymGeneralSizingSrc, gymVoiceFontZeroSrc].join('\n');
  const dom = new JSDOM(`<!DOCTYPE html><style>${css}</style>
    <body class="gym-mode">
      <button class="voice-log-btn" aria-label="Log this set by voice">\u{1F3A4}</button>
    </body>`);
  const btn = dom.window.document.querySelector('.voice-log-btn');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'Gym Mode\'s own general sizing block sets font-size:18px at higher specificity than the base rule, but its explicit plate/voice override must still win the cascade and keep the emoji collapsed there too');
});

test('sabotage-relevant: the new base ::after rule carries a real mic SVG mask-image, not an empty/placeholder one', (assert)=>{
  assert.match(baseAfterSrc, /mask-image:url\("data:image\/svg\+xml,/, 'a real inline SVG mask must be declared');
  assert.match(baseAfterSrc, /M4\.6%209\.6a5\.4%205\.4/, 'the mask must be the actual mic glyph path (the capsule + stand arc), not a different icon');
  assert.match(baseAfterSrc, /width:16px; height:16px/, 'the glyph must have a real, non-zero rendered size');
});

test('sabotage-relevant: Gym Mode no longer redeclares the mic mask-image (true de-duplication, not just a second copy that happens to agree)', (assert)=>{
  const micPathOccurrences = (src.match(/M4\.6%209\.6a5\.4%205\.4/g) || []).length;
  assert.strictEqual(micPathOccurrences, 2, 'the mic glyph\'s SVG path should now appear exactly twice in the whole file (the -webkit-mask-image and mask-image declarations of the single base rule) — a third or fourth occurrence would mean Gym Mode is still carrying its own duplicate copy');
  assert.doesNotMatch(gymAfterSharedSrc, /mask-image/, 'the gym-mode shared resize block must only touch sizing/background/mask-repeat/position/size, not redeclare the image itself');
});

test('regression guard: Gym Mode still resizes the voice glyph to its own 24px, alongside the plate glyph', (assert)=>{
  assert.match(gymAfterSharedSrc, /width:24px; height:24px/, 'gym mode\'s bigger button must still get a bigger glyph');
  assert.match(gymAfterSharedSrc, /body\.gym-mode \.voice-log-btn::after/, 'the voice button must still be part of this resize rule');
  assert.match(gymAfterSharedSrc, /body\.gym-mode \.plate-btn::after/, 'the plate button must still be part of the same shared resize rule');
  // A later change (test-plate-btn-glyph.js) moved the plate button's own
  // barbell mask-image out of this gym-mode-specific location and onto the
  // base .plate-btn::after rule too, mirroring this file's own voice-button
  // fix exactly — so this file no longer asserts WHERE that image lives,
  // only that gym mode still resizes the plate button alongside the voice
  // button, which is genuinely still this file's concern.
});

test('REAL invocation: the voice-hint tip banner text no longer references the removed mic emoji, but still describes how to use the button', (assert)=>{
  const bannerRe = /<span>\u{1F4A1} <b>Tip:<\/b>[^<]*<\/span>/u;
  const m = bannerRe.exec(src);
  if(!m) throw new Error('voice-hint tip banner markup not found');
  const bannerText = m[0];
  assert.doesNotMatch(bannerText, /\u{1F3A4}/u, 'the tip text must not reference an emoji that no longer visually appears on the button');
  assert.match(bannerText, /mic icon/, 'the tip should still tell the user what to look for, in words, now that the glyph is not an emoji character in the text itself');
});

run();
