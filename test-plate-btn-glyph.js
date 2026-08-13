'use strict';
// Behavioral coverage for a user-requested change: the plate-calculator
// button shipped as the raw \u{1F3CB} emoji everywhere OUTSIDE Gym Mode
// (full-colour, differently weighted per OS — the exact problem the
// voice-log button's mic glyph fix already solved for \u{1F3A4}). Gym Mode
// already had a proper SVG mask glyph for the barbell, matching the header
// brand mark; the normal (non-gym) view still showed the bare emoji. Fixed
// by moving the emoji-collapse (`font-size:0`) and the SVG mask glyph onto
// the BASE `.plate-btn`/`.plate-btn::after` rules, unconditionally — the
// same pattern already used for .voice-log-btn — so the same vector glyph
// now renders in both modes, and Gym Mode's own copy of the mask-image
// declaration (previously duplicated) was deleted since the base rule now
// supplies it.
//
// This is fundamentally a CSS SPECIFICITY/cascade change (same class of bug
// as the warm-up-ramp plate-btn glyph fix and the voice-log-btn glyph fix),
// so real cascade resolution via jsdom is what proves it, not eyeballing
// selector text.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-plate-btn-glyph.js');

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
// .plate-btn::after` block, which contains the same trailing text).
const baseButtonSrc = extractRuleBlock(src, '.plate-btn');
const baseAfterSrc = extractRuleBlock(src, '\n  .plate-btn::after');

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
const gymPlateVoiceFontZeroSrc = (()=>{
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

test('sabotage-relevant: the base .plate-btn rule now declares font-size:0, not the old raw-emoji font-size', (assert)=>{
  assert.match(baseButtonSrc, /font-size:0;/, 'the base (non-gym) button must collapse the emoji text itself, the same mechanism Gym Mode already used');
  assert.doesNotMatch(baseButtonSrc, /font-size:14px/, 'the old raw-emoji font-size must be gone, not just shadowed by a later rule');
});

test('REAL invocation: a real CSS cascade resolves .plate-btn font-size to 0 OUTSIDE Gym Mode, with only the base rule present', (assert)=>{
  const dom = new JSDOM(`<!DOCTYPE html><style>${baseButtonSrc}</style>
    <body>
      <button class="plate-btn" aria-label="Open plate calculator">\u{1F3CB}</button>
    </body>`);
  const btn = dom.window.document.querySelector('.plate-btn');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'the emoji must be genuinely collapsed in the normal (non-gym) view now, not just in Gym Mode');
});

test('regression guard: a real CSS cascade still resolves .plate-btn font-size to 0 INSIDE Gym Mode, with the base rule plus both real competing gym-mode rules present', (assert)=>{
  const css = [baseButtonSrc, gymGeneralSizingSrc, gymPlateVoiceFontZeroSrc].join('\n');
  const dom = new JSDOM(`<!DOCTYPE html><style>${css}</style>
    <body class="gym-mode">
      <button class="plate-btn" aria-label="Open plate calculator">\u{1F3CB}</button>
    </body>`);
  const btn = dom.window.document.querySelector('.plate-btn');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'Gym Mode\'s own general sizing block sets font-size:18px at higher specificity than the base rule, but its explicit plate/voice override must still win the cascade and keep the emoji collapsed there too');
});

test('sabotage-relevant: the new base ::after rule carries a real barbell SVG mask-image, not an empty/placeholder one', (assert)=>{
  assert.match(baseAfterSrc, /mask-image:url\("data:image\/svg\+xml,/, 'a real inline SVG mask must be declared');
  assert.match(baseAfterSrc, /y%3D%278%27%20width%3D%272\.4%27%20height%3D%274%27/, 'the mask must be the actual barbell glyph path (the header brand mark\'s own geometry), not a different icon');
  assert.match(baseAfterSrc, /width:16px; height:16px/, 'the glyph must have a real, non-zero rendered size');
});

test('sabotage-relevant: Gym Mode no longer redeclares the barbell mask-image (true de-duplication, not just a second copy that happens to agree)', (assert)=>{
  // This fragment (the SVG's opening tag through its first <rect>) appears
  // exactly once per FULL svg data-URI declaration — unlike the raw
  // coordinate pair used elsewhere in this file, which the barbell's own
  // two end-cap <rect> elements each repeat once per declaration, making it
  // unsuitable as a per-declaration counter on its own.
  const barbellSvgDeclarationOccurrences = (src.match(/stroke-linejoin%3D%27round%27%3E%3Crect%20x%3D%271\.2%27/g) || []).length;
  assert.strictEqual(barbellSvgDeclarationOccurrences, 2, 'the barbell SVG should now be declared exactly twice in the whole file (the -webkit-mask-image and mask-image declarations of the single base rule) — a third or fourth occurrence would mean Gym Mode is still carrying its own duplicate copy');
  assert.doesNotMatch(gymAfterSharedSrc, /mask-image/, 'the gym-mode shared resize block must only touch sizing/background/mask-repeat/position/size, not redeclare the image itself');
});

test('regression guard: Gym Mode still resizes the plate glyph to its own 24px, and the voice glyph is untouched by this change', (assert)=>{
  assert.match(gymAfterSharedSrc, /width:24px; height:24px/, 'gym mode\'s bigger button must still get a bigger glyph');
  assert.match(gymAfterSharedSrc, /body\.gym-mode \.plate-btn::after/, 'the plate button must still be part of this resize rule');
  const micPathOccurrences = (src.match(/M4\.6%209\.6a5\.4%205\.4/g) || []).length;
  assert.strictEqual(micPathOccurrences, 2, 'the voice button\'s own mic mask-image must be unaffected by this change — still exactly two occurrences (the single base .voice-log-btn::after rule)');
});

test('regression guard: the warm-up-ramp-specific plate-btn override (fixed in a prior version) still declares no font-size of its own', (assert)=>{
  const warmupOverrideSrc = extractRuleBlock(src, 'body.gym-mode .warmup-set-row .plate-btn');
  assert.doesNotMatch(warmupOverrideSrc, /font-size:/, 'this rule must still leave font-size alone entirely, letting the shared font-size:0 rule win — reintroducing a font-size here would revive the emoji-stacking bug this fix already covers');
});

test('REAL invocation: the voice-hint tip banner text no longer references the removed plate emoji, but still describes how to use the button', (assert)=>{
  const bannerRe = /<span>\u{1F4A1} <b>Tip:<\/b>[^<]*<\/span>/u;
  const m = bannerRe.exec(src);
  if(!m) throw new Error('voice-hint tip banner markup not found');
  const bannerText = m[0];
  assert.doesNotMatch(bannerText, /\u{1F3CB}/u, 'the tip text must not reference an emoji that no longer visually appears on the button');
  assert.match(bannerText, /plate-calculator icon/, 'the tip should still tell the user what to look for, in words, now that the glyph is not an emoji character in the text itself');
});

run();
