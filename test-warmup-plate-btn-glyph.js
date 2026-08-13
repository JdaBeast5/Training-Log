'use strict';
// Behavioral coverage for a real bug found through actual use: in Gym Mode,
// the warm-up ramp's plate-calculator button showed BOTH the app's own SVG
// barbell glyph (a ::after mask-image, drawn by the shared
// `body.gym-mode .plate-btn::after` rule) AND the raw 🏋️ emoji the button's
// real markup carries as its textContent — stacked on top of each other in
// the same small button.
//
// Root cause: `body.gym-mode .plate-btn{font-size:0}` is what collapses the
// emoji text everywhere else in Gym Mode (the glyph itself is drawn on
// ::after with an absolute px size, so it's unaffected by font-size). But
// `body.gym-mode .warmup-set-row .plate-btn{...font-size:18px...}` has
// higher CSS specificity (3 classes vs. 2) and was overriding font-size
// back to 18px for warm-up rows specifically — un-collapsing the emoji text
// right back on top of the still-present glyph. Fixed by dropping the
// font-size declaration from the warm-up-specific rule, letting the shared
// font-size:0 rule apply there too.
//
// This is fundamentally a CSS SPECIFICITY bug, not a missing-rule bug — the
// only way to prove it stays fixed is to let a real CSS cascade resolve
// computed style against real, competing rules, not to eyeball selector
// text. Isolated fixture: just the handful of rules that actually compete
// for this property, not the whole ~4000-line stylesheet — cascade
// resolution only needs the competing declarations present, and jsdom
// resolves it exactly as a real browser would.
const { readIndexSource, makeRunner } = require('./testHelpers.js');
const { JSDOM } = require('jsdom');

const src = readIndexSource();
const { test, run } = makeRunner('test-warmup-plate-btn-glyph.js');

function extractRuleBlock(source, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\{[^}]*\\}');
  const m = re.exec(source);
  if(!m) throw new Error(`extractRuleBlock: no rule found for ${selector}`);
  return m[0].replace(/\/\*[\s\S]*?\*\//g, '');
}

// The base (non-gym-mode) rule, the shared gym-mode font-size:0 rule (its
// selector list also covers .voice-log-btn/.set-note-btn — extracted as one
// block since that's the real rule, not split apart to cherry-pick), and
// the warm-up-specific override this fix touches.
const baseRuleSrc = extractRuleBlock(src, '.plate-btn');
const gymFontZeroSrc = (()=>{
  // `body.gym-mode .plate-btn,\n  body.gym-mode .voice-log-btn{font-size:0;}`
  // — matched by its real, distinguishing declaration rather than by a
  // selector list that also appears (without this declaration) elsewhere.
  const re = /body\.gym-mode \.plate-btn,\s*\n\s*body\.gym-mode \.voice-log-btn\{font-size:0;\}/;
  const m = re.exec(src);
  if(!m) throw new Error('shared gym-mode font-size:0 rule not found');
  return m[0];
})();
const warmupOverrideSrc = extractRuleBlock(src, 'body.gym-mode .warmup-set-row .plate-btn');

test('sabotage-relevant: the warm-up-row-specific rule no longer declares its own font-size — that is the exact declaration whose higher specificity was reviving the emoji', (assert)=>{
  assert.doesNotMatch(warmupOverrideSrc, /font-size:/, 'no font-size at all should remain on this selector — the shared font-size:0 rule is what must win, and any font-size here (even a "fixed" smaller one) would still be specificity-winning noise for a property this rule has no real reason to touch');
});

test('REAL invocation: a real CSS cascade resolves .plate-btn font-size to 0 inside a Gym Mode warm-up row — the emoji is genuinely collapsed, not just absent from one rule\'s text', (assert)=>{
  const css = [baseRuleSrc, gymFontZeroSrc, warmupOverrideSrc].join('\n');
  const dom = new JSDOM(`<!DOCTYPE html><style>${css}</style>
    <body class="gym-mode">
      <div class="warmup-set-row">
        <button class="plate-btn">🏋️</button>
      </div>
    </body>`);
  const btn = dom.window.document.querySelector('.plate-btn');
  const computed = dom.window.getComputedStyle(btn);
  assert.strictEqual(computed.fontSize, '0px', 'the real cascade, with the real competing rules present, must resolve font-size to 0 — proving the higher-specificity warm-up rule no longer wins this property');
});

test('regression guard: the warm-up-row plate-btn keeps its real sizing/layout declarations — this fix only removed font-size, nothing else', (assert)=>{
  assert.match(warmupOverrideSrc, /min-width:54px; min-height:56px/, 'the tap-target sizing must be untouched');
  assert.match(warmupOverrideSrc, /border-left:1px solid rgba\(255,122,51,0\.18\)/, 'the visual divider between fields must be untouched');
  assert.match(warmupOverrideSrc, /color:var\(--text-muted\)/, 'the glyph\'s color (driven via currentColor on ::after) must still be set here');
});

run();
